/* CDA Digital 2.0 — Galeria com lightbox (S3.2.2)
   ------------------------------------------------------------------
   Monta a galeria completa dentro de um único elemento:

     <div data-galeria></div>

   O script cria (classes próprias em css/galeria.css, auto-contido):
     - barra de filtros por EVENTO  → .galeria-filtro/.galeria-filtro__btn
                                     (button + aria-pressed, contagem por evento)
     - contagem "X de M imagens"    → .galeria-filtro__status (role=status, aria-live)
     - mosaico lazy                 → .galeria-mosaico/.galeria-mosaico__item
                                     (loading="lazy" + IntersectionObserver data-src)
     - lightbox acessível           → .lightbox[role=dialog][aria-modal=true]
                                     (role=dialog, foco preso, Esc fecha, ←/→ navega,
                                      legendas, foco devolvido à origem)

   REGRA DE INVENTÁRIO (documentada):
     1. Atributo data-ficheiros no elemento raiz (JSON array ou CSV) — override explícito;
     2. senão, união de CDA.ACTIVIDADES[].capas (fonte única de dados, js/dados.js).
   Cada fotografia pertence a TODOS os eventos cuja lista de capas a referencie;
   fotografias sem evento → chip "Outras". O contador do chip é "fotos únicas".

   Dados: lê directo de `CDA.ACTIVIDADES` (js/dados.js). Sem módulos ES,
   sem dependências externas. NÃO toca em site/galeria.html (integração = M4). */
(function () {
  "use strict";

  var RAIZ_SEL = "[data-galeria]";
  var PASTA = "galeria/";
  var PASTA_HD = "galeria/hd/";
  var MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
               "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  var raiz = null;
  var ficheiros = [];       // inventário (nomes de ficheiro, ordem estável)
  var eventos = [];         // {titulo, data, dataTxt, categoria, capas[]}
  var porFicheiro = {};     // nome → [índice de eventos]
  var filtro = "todos";     // "todos" | "e<idx>" | "outras"
  var indice = 0;           // índice dentro da lista visível (lightbox)
  var observador = null;
  var origem = null;        // botão que abriu o lightbox (devolver foco)
  var dor = {};             // elementos

  /* ---------- helpers ---------- */
  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }

  // top-level `const CDA` de js/dados.js é lexical, não está em window:
  // acesso seguro via typeof (não lança ReferenceError).
  function lerActividades() {
    if (typeof CDA === "undefined" || !CDA || !Array.isArray(CDA.ACTIVIDADES)) return [];
    return CDA.ACTIVIDADES;
  }

  function dataTxt(d) {
    if (!d) return "";
    var p = String(d).split("-");
    if (p.length !== 3) return String(d);
    var mes = parseInt(p[1], 10);
    return parseInt(p[2], 10) + " " + (MESES[mes - 1] || p[1]) + " " + p[0];
  }

  function tituloEvento(ev) {
    return (ev && ev.titulo) ? ev.titulo : "Fotografia de arquivo";
  }

  /* ---------- inventário + eventos ---------- */
  // Override data-ficheiros (JSON array | CSV) ou união das capas.
  function inventariar() {
    var attr = raiz.getAttribute("data-ficheiros");
    var lista = [];
    if (attr && attr.trim()) {
      try { lista = JSON.parse(attr); } catch (e) { /* não é JSON */ }
      if (!Array.isArray(lista)) {
        lista = attr.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      }
    } else {
      lerActividades().forEach(function (a) {
        (a.capas || []).forEach(function (c) { if (lista.indexOf(c) === -1) lista.push(c); });
      });
    }
    return lista;
  }

  function prepararEventos() {
    var acts = lerActividades();
    var vistos = {}, out = [];
    acts.forEach(function (a) {
      var k = (a.titulo || "") + "|" + (a.data || "");
      if (vistos[k]) return;            // dedupe (ex.: act-4/act-5 com o MESMO título+data)
      vistos[k] = true;
      out.push({ titulo: a.titulo || "Sem título", data: a.data || null,
                 dataTxt: dataTxt(a.data), categoria: a.categoria || "",
                 capas: (a.capas || []).slice() });
    });
    // mais recente primeiro; sem data no fim
    out.sort(function (a, b) {
      if (!a.data && !b.data) return 0;
      if (!a.data) return 1;
      if (!b.data) return -1;
      return a.data < b.data ? 1 : -1;
    });
    return out;
  }

  function mapaFicheiroEvento() {
    var mapa = {};
    ficheiros.forEach(function (f) { mapa[f] = []; });
    eventos.forEach(function (ev, idx) {
      ev.capas.forEach(function (c) {
        if (Object.prototype.hasOwnProperty.call(mapa, c)) mapa[c].push(idx);
      });
    });
    return mapa;
  }

  function eventosDeFicheiro(f) { return porFicheiro[f] || []; }

  function nomeFiltro() {
    if (filtro === "outras") return "Outras";
    if (filtro !== "todos") {
      var e = eventos[parseInt(filtro.slice(1), 10)];
      if (e) return e.titulo;
    }
    return null;
  }

  function listaVisivel() {
    if (filtro === "todos") return ficheiros.slice();
    if (filtro === "outras") {
      return ficheiros.filter(function (f) { return !eventosDeFicheiro(f).length; });
    }
    var idx = parseInt(filtro.slice(1), 10);
    if (isNaN(idx) || !eventos[idx]) return [];
    return ficheiros.filter(function (f) { return eventosDeFicheiro(f).indexOf(idx) !== -1; });
  }

  /* ---------- lazy loading ---------- */
  function substituirFonte(img) {
    var f = img.getAttribute("data-src");
    if (!f) return;
    img.removeAttribute("data-src");
    img.setAttribute("src", f);
  }

  function observar() {
    if (observador && typeof observador.disconnect === "function") observador.disconnect();
    var imgs = dor.mosaico.querySelectorAll("img.galeria-mosaico__img[data-src]");
    if (!imgs.length) return;
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(imgs, substituirFonte);   // plano B: tudo já
      return;
    }
    observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (ent) {
        if (!ent.isIntersecting) return;
        substituirFonte(ent.target);
        observador.unobserve(ent.target);
      });
    }, { rootMargin: "250px 0px" });
    Array.prototype.forEach.call(imgs, function (img) { observador.observe(img); });
  }

  /* ---------- render do mosaico + chips ---------- */
  function renderChips() {
    dor.chips.textContent = "";
    var total = ficheiros.length;

    function btn(chave, rotulo, contagem) {
      var b = el("button", "galeria-filtro__btn", "");
      b.type = "button";
      b.setAttribute("data-filtro", chave);
      b.setAttribute("aria-pressed", filtro === chave ? "true" : "false");
      b.appendChild(document.createTextNode(rotulo));
      if (contagem != null) {
        var c = el("span", "galeria-filtro__contagem", String(contagem));
        c.setAttribute("aria-hidden", "true");
        b.appendChild(c);
      }
      return b;
    }

    dor.chips.appendChild(btn("todos", "Todas", total));
    eventos.forEach(function (ev, idx) {
      var n = listaContagemEvento(idx);
      if (n > 0) dor.chips.appendChild(btn("e" + idx, ev.titulo, n));
    });
    var outras = listaContagemOutras();
    if (outras > 0) dor.chips.appendChild(btn("outras", "Outras", outras));
  }

  function listaContagemEvento(idx) {
    return ficheiros.filter(function (f) { return eventosDeFicheiro(f).indexOf(idx) !== -1; }).length;
  }
  function listaContagemOutras() {
    return ficheiros.filter(function (f) { return !eventosDeFicheiro(f).length; }).length;
  }

  function renderMosaico() {
    var visiveis = listaVisivel();
    dor.mosaico.textContent = "";

    visiveis.forEach(function (fich, i) {
      var evs = eventosDeFicheiro(fich);
      var rotulo = evs.length === 1 ? tituloEvento(eventos[evs[0]]) : "Galeria da CDA";
      var alt = evs.length === 1 ? "Fotografia — " + tituloEvento(eventos[evs[0]]) : "Fotografia da galeria da CDA";

      var b = el("button", "galeria-mosaico__item");
      b.type = "button";
      b.setAttribute("aria-haspopup", "dialog");
      b.setAttribute("aria-label", "Ampliar fotografia " + (i + 1) + " de " + visiveis.length + " — " + rotulo);

      var img = el("img", "galeria-mosaico__img");
      img.setAttribute("data-src", PASTA + fich);
      img.alt = alt;
      img.loading = "lazy";
      img.decoding = "async";

      b.appendChild(img);
      dor.mosaico.appendChild(b);
    });

    var nome = nomeFiltro();
    dor.status.textContent = visiveis.length + " de " + ficheiros.length + " imagens" +
      (nome ? " · " + nome : "");
    dor.status.setAttribute("data-total", String(visiveis.length));

    observar();
  }

  /* ---------- lightbox ---------- */
  function hdSrc(fich) { return PASTA_HD + fich; }

  function construirLightbox() {
    dor.lightbox = el("div", "lightbox");
    dor.lightbox.setAttribute("role", "dialog");
    dor.lightbox.setAttribute("aria-modal", "true");
    dor.lightbox.setAttribute("aria-labelledby", "galeria-lightbox-legenda");
    dor.lightbox.hidden = true;

    var topo = el("div", "lightbox__topo");
    dor.contador = el("span", "lightbox__contador", "");
    dor.contador.id = "galeria-lightbox-contador";
    dor.contador.setAttribute("role", "status");
    dor.contador.setAttribute("aria-live", "polite");
    var fechar = el("button", "lightbox__btn lightbox__btn--fechar", "✕");
    fechar.type = "button";
    fechar.setAttribute("aria-label", "Fechar galeria");
    topo.appendChild(dor.contador);
    topo.appendChild(fechar);

    var ant = el("button", "lightbox__seta lightbox__seta--ant", "‹");
    ant.type = "button";
    ant.setAttribute("aria-label", "Fotografia anterior");
    var prox = el("button", "lightbox__seta lightbox__seta--prox", "›");
    prox.type = "button";
    prox.setAttribute("aria-label", "Fotografia seguinte");

    var figura = el("figure", "lightbox__figura");
    dor.imagem = el("img", "lightbox__imagem");
    dor.imagem.alt = "Fotografia ampliada da galeria da CDA";
    dor.legenda = el("figcaption", "lightbox__legenda", "");
    dor.legenda.id = "galeria-lightbox-legenda";
    figura.appendChild(dor.imagem);
    figura.appendChild(dor.legenda);

    dor.lightbox.appendChild(topo);
    dor.lightbox.appendChild(ant);
    dor.lightbox.appendChild(figura);
    dor.lightbox.appendChild(prox);
    document.body.appendChild(dor.lightbox);
  }

  function atualizarLightbox() {
    var visiveis = listaVisivel();
    if (!visiveis.length) return;
    var fich = visiveis[indice];
    var evs = eventosDeFicheiro(fich);

    var img = dor.imagem;
    img.removeAttribute("onerror");
    img.dataset.fich = fich;
    img.src = hdSrc(fich);
    img.onerror = function () {        // hd pode não existir (ex.: 11/12 são .png na pasta)
      this.onerror = null;
      if (this.getAttribute("src") !== PASTA + fich) this.src = PASTA + fich;
    };
    var rotulo = evs.length ? tituloEvento(eventos[evs[0]]) : "Fotografia de arquivo";
    var data = evs.length && eventos[evs[0]].dataTxt ? " · " + eventos[evs[0]].dataTxt : "";
    img.alt = "Fotografia — " + rotulo;
    dor.legenda.textContent = rotulo + data;
    dor.contador.textContent = (indice + 1) + " de " + visiveis.length;

    // pré-carrega vizinhas (falha silenciosa se hd não existir)
    [indice - 1, indice + 1].forEach(function (k) {
      if (k < 0 || k >= visiveis.length) return;
      var f = visiveis[k];
      var p = new Image();
      p.src = hdSrc(f);
      p.onerror = function () { var t = new Image(); t.src = PASTA + f; };
    });
  }

  function fechaveis() {
    return dor.lightbox.querySelectorAll("button").length
      ? Array.prototype.slice.call(dor.lightbox.querySelectorAll("button"))
      : [];
  }

  function ge (e) { return { k: e.key, alvo: e.target }; }

  function tecladoLightbox(e) {
    if (dor.lightbox.hidden) return;
    var k = e.key;
    if (k === "Escape") { e.preventDefault(); fechar(); return; }
    var visiveis = listaVisivel();
    if (!visiveis.length) return;
    if (k === "ArrowLeft") { e.preventDefault(); navegar(-1); return; }
    if (k === "ArrowRight") { e.preventDefault(); navegar(1); return; }
    if (k === "Tab") {
      var btns = fechaveis();
      if (!btns.length) return;
      var f = document.activeElement;
      var i = btns.indexOf(f);
      if (i === -1) { e.preventDefault(); btns[0].focus(); return; }
      if (e.shiftKey && i === 0) { e.preventDefault(); btns[btns.length - 1].focus(); return; }
      if (!e.shiftKey && i === btns.length - 1) { e.preventDefault(); btns[0].focus(); return; }
    }
  }

  function abrir(i) {
    var visiveis = listaVisivel();
    if (!visiveis.length) return;
    indice = Math.max(0, Math.min(i, visiveis.length - 1));
    origem = document.activeElement;
    atualizarLightbox();
    dor.lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    var fechar = dor.lightbox.querySelector(".lightbox__btn--fechar");
    if (fechar) fechar.focus();
  }

  function navegar(delta) {
    var visiveis = listaVisivel();
    if (!visiveis.length) return;
    indice = (indice + delta + visiveis.length) % visiveis.length;
    atualizarLightbox();
  }

  function fechar() {
    dor.lightbox.hidden = true;
    document.body.style.overflow = "";
    if (origem && typeof origem.focus === "function") origem.focus();
    origem = null;
  }

  /* ---------- eventos ---------- */
  function ligar() {
    dor.chips.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button[data-filtro]") : null;
      if (!b) return;
      if (b.getAttribute("aria-pressed") === "true") return;   // já activo
      filtro = b.getAttribute("data-filtro");
      indice = 0;
      renderChips();
      renderMosaico();
    });

    dor.mosaico.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button.galeria-mosaico__item") : null;
      if (!b) return;
      abrir(Array.prototype.indexOf.call(dor.mosaico.children, b));
    });

    dor.lightbox.addEventListener("click", function (e) {
      var alvo = e.target;
      if (alvo.closest(".lightbox__btn--fechar")) { fechar(); return; }
      if (alvo.closest(".lightbox__seta--ant")) { navegar(-1); return; }
      if (alvo.closest(".lightbox__seta--prox")) { navegar(1); return; }
    });

    document.addEventListener("keydown", tecladoLightbox);
  }

  /* ---------- arranque ---------- */
  function arrancar() {
    raiz = document.querySelector(RAIZ_SEL);
    if (!raiz) return;

    ficheiros = inventariar();
    eventos = prepararEventos();
    porFicheiro = mapaFicheiroEvento();

    dor.chips = el("div", "galeria-filtro");
    dor.chips.setAttribute("role", "group");
    dor.chips.setAttribute("aria-label", "Filtrar galeria por evento");
    raiz.appendChild(dor.chips);

    dor.status = el("p", "galeria-filtro__status", "");
    dor.status.id = "galeria-status";
    dor.status.setAttribute("role", "status");
    dor.status.setAttribute("aria-live", "polite");
    raiz.appendChild(dor.status);

    dor.mosaico = el("ul", "galeria-mosaico");
    dor.mosaico.id = "galeria-mosaico";
    raiz.appendChild(dor.mosaico);

    dor.vazio = el("div", "galeria-vazio");
    dor.vazio.hidden = true;
    dor.vazio.appendChild(el("h3", null, "Sem fotografias para mostrar"));
    dor.vazio.appendChild(el("p", null, "Não foi encontrada nenhuma fotografia na galeria."));
    raiz.appendChild(dor.vazio);

    construirLightbox();
    ligar();

    if (!ficheiros.length) {
      dor.chips.hidden = true;
      dor.status.hidden = true;
      dor.mosaico.hidden = true;
      dor.vazio.hidden = false;
      return;
    }

    renderChips();
    renderMosaico();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
/* CDA Digital 2.0 — UI: reveal no scroll, header "stuck", menu móvel,
   mega-menu (teclado) e busca global (dialog nativo).

   Contratos (ler ANTES de alterar):
     site/css/sistema.css (secção MOTION, ~L612-627):
       [data-reveal]             → opacity:0 / translateY(18px)
       [data-reveal].is-revealed → opacity:1 / transform:none
       [data-reveal-delay="1..4"] → 80/160/240/320ms (só CSS)
       @media (prefers-reduced-motion: reduce) → tudo visível
     site/css/layout.css:
       .header.is-stuck { box-shadow }                     (scroll)
       .nav.is-open                                  (drawer móvel ≤1080)
       .nav__item.is-open .nav__panel                (sub-menu móvel ≤1080)
       .search-dialog (nativo <dialog>)              (busca global)
     site/css/estilo.css (carregada DEPOIS de layout.css):
       .nav.aberto { display:block } ≤900 — legado; o app.js alterna essa
       classe em paralelo. Aqui gerimos APENAS .is-open + aria-expanded
       (o CSS escopeado ".header .nav.is-open" tem prioridade sobre
       .nav{display:none} do estilo.css).
     site/js/app.js: #menu-btn → .aberto + marcador .active por [data-pagina]
       (os links de topo mantêm data-pagina para esse marcador).

   Sem módulos ES (o site carrega <script src> sem type="module"),
   sem dependências externas, tudo numa IIFE. */
(function () {
  "use strict";

  /* ======================================================================
     0. Constantes
     ====================================================================== */

  var MQ_MOVEL = "(max-width: 1080px)";

  /* Páginas internas da busca global (só as que existem em site/).
     admin.html é deliberadamente omitido (painel interno, fora do portal). */
  var PAGINAS = [
    { titulo: "Início", desc: "Portal CDA Digital — actualidade, documentos e serviços", url: "index.html" },
    { titulo: "A Instituição", desc: "A CDA: história, missão, órgãos e delegações", url: "instituicao.html" },
    { titulo: "Notícias", desc: "Actualidade da CDA e do sector aduaneiro", url: "noticias.html" },
    { titulo: "Anúncios e Comunicados", desc: "Comunicados oficiais da CDA", url: "anuncios.html" },
    { titulo: "CDA em Actividade", desc: "Assembleias Gerais, agenda e cobertura de eventos", url: "actividades.html" },
    { titulo: "Serviços da CDA", desc: "Carteira, quotas, formação e apoio ao despachante", url: "servicos.html" },
    { titulo: "Despachantes Aduaneiros", desc: "Directório de membros e busca por nome ou empresa", url: "despachantes.html" },
    { titulo: "Centro Documental", desc: "Legislação, circulares, ordens de serviço e relatórios", url: "documentacao.html" },
    { titulo: "Galeria", desc: "Fotografias da vida associativa", url: "galeria.html" },
    { titulo: "Publicações", desc: "Estudos, artigos, pareceres e discursos", url: "publicacoes.html" },
    { titulo: "Revista O Despachante", desc: "Edição de Julho de 2026", url: "revista.html" },
    { titulo: "Parceiros e Links Relevantes", desc: "Instituições nacionais e internacionais", url: "parceiros.html" },
    { titulo: "Contacte-nos", desc: "Sede, telefones e formulário de contacto", url: "contactos.html" },
    { titulo: "Área do Membro", desc: "Portal reservado aos membros da CDA", url: "area-membro.html" }
  ];

  var LIMITE_DOCUMENTOS = 8;
  var LIMITE_PAGINAS = 6;

  /* ======================================================================
     1. Utilidades partilhadas
     ====================================================================== */

  // "Ação" → "acao" (sem acentos, minúsculas) — usado pela busca.
  function normalizar(s) {
    s = String(s == null ? "" : s);
    s = s.toLowerCase();
    if (typeof s.normalize === "function") s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return s;
  }

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto; // textoNUNCA via innerHTML
    return n;
  }

  function mq(query) {
    if (typeof window.matchMedia === "function") return window.matchMedia(query);
    return { matches: false, addEventListener: function () {}, addListener: function () {} };
  }

  /* ======================================================================
     2. Revela no scroll (S2.2.3 — contract sistema.css MOTION)
     ====================================================================== */

  function revelarTudo(nos) {
    for (var i = 0; i < nos.length; i++) nos[i].classList.add("is-revealed");
  }

  function initReveal() {
    var nos = document.querySelectorAll("[data-reveal]");
    if (!nos.length) return; // zero elementos → nada a fazer, sem erros

    // prefers-reduced-motion: reduce → tudo visível, SEM criar observer.
    var reduzido =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) {
      revelarTudo(nos);
      return;
    }

    // Browser sem IntersectionObserver → fallback: tudo visível.
    if (typeof IntersectionObserver === "undefined") {
      revelarTudo(nos);
      return;
    }

    var obs = new IntersectionObserver(
      function (entradas) {
        for (var i = 0; i < entradas.length; i++) {
          if (!entradas[i].isIntersecting) continue;
          entradas[i].target.classList.add("is-revealed");
          obs.unobserve(entradas[i].target); // sem trabalho permanente
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    for (var j = 0; j < nos.length; j++) obs.observe(nos[j]);
  }

  /* ======================================================================
     3. Header "stuck" (sombra ao rolar)
     ====================================================================== */

  function initHeader() {
    var header = document.querySelector(".header");
    if (!header) return;

    function actualizar() {
      if (window.scrollY > 8) header.classList.add("is-stuck");
      else header.classList.remove("is-stuck");
    }
    window.addEventListener("scroll", actualizar, { passive: true });
    actualizar(); // estado inicial
  }

  /* ======================================================================
     4. Menu móvel (#menu-btn → #nav.is-open)
        O app.js alterna também a classe legada "aberto" (estilo.css);
        aqui gerimos .is-open de forma ABSOLUTA, por isso o estado final
        fica correcto independentemente da ordem dos handlers.
     ====================================================================== */

  function initMenuMovel() {
    var btn = document.getElementById("menu-btn");
    var nav = document.getElementById("nav");
    if (!btn || !nav) return;

    function definir(abrir) {
      nav.classList.toggle("is-open", abrir);
      btn.setAttribute("aria-expanded", abrir ? "true" : "false");
      btn.setAttribute("aria-label", abrir ? "Fechar menu de navegação" : "Abrir menu de navegação");
    }

    btn.addEventListener("click", function () {
      definir(!nav.classList.contains("is-open"));
    });

    // Voltar a ecrã largo → fecha o drawer (evita estado preso).
    var mo = mq(MQ_MOVEL);
    var aoMudar = function () { if (!mo.matches) definir(false); };
    if (typeof mo.addEventListener === "function") mo.addEventListener("change", aoMudar);
    else if (typeof mo.addListener === "function") mo.addListener(aoMudar);

    // Escape fecha o drawer (o <dialog> trata o seu próprio Escape).
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" && e.key !== "Esc") return;
      var dlg = document.getElementById("search-dialog");
      if (dlg && dlg.open) return;
      if (nav.classList.contains("is-open")) {
        definir(false);
        if (btn.focus) btn.focus();
      }
    });
  }

  /* ======================================================================
     5. Mega-menu de 2.º nível: aria-expanded, Escape, setas, mobile
     ====================================================================== */

  function initMegaMenu() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var mo = mq(MQ_MOVEL);
    var itens = nav.querySelectorAll(".nav__item");

    function fecharTodos(excepto) {
      for (var i = 0; i < itens.length; i++) {
        if (itens[i] === excepto) continue;
        itens[i].classList.remove("is-open");
        var g = itens[i].querySelector(".nav__link");
        if (g) g.setAttribute("aria-expanded", "false");
      }
    }

    function ligar(item) {
      var painel = item.querySelector(".nav__panel");
      var gatilho = item.querySelector(".nav__link");
      if (!painel || !gatilho) return;

      gatilho.setAttribute("aria-expanded", "false");

      // foco dentro do item → painel aberto (reforça :focus-within do CSS)
      item.addEventListener("focusin", function () {
        gatilho.setAttribute("aria-expanded", "true");
      });
      item.addEventListener("focusout", function (e) {
        if (!item.contains(e.target)) gatilho.setAttribute("aria-expanded", "false");
      });

      // clique: em ecrã largo navega; em mobile abre/fecha o sub-menu
      gatilho.addEventListener("click", function (e) {
        if (!mo.matches) return; // desktop → navegação normal
        e.preventDefault();
        var abrir = !item.classList.contains("is-open");
        fecharTodos(item);
        item.classList.toggle("is-open", abrir);
        gatilho.setAttribute("aria-expanded", abrir ? "true" : "false");
      });

      function escapar() {
        item.classList.remove("is-open");
        gatilho.setAttribute("aria-expanded", "false");
        // sai de :focus-within para o painel CSS desaparecer de facto
        if (document.activeElement && item.contains(document.activeElement) && nav) {
          nav.focus();
        }
      }

      gatilho.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Esc") { escapar(); return; }
        if (e.key === "ArrowDown" && !mo.matches) {
          e.preventDefault();
          var primeiro = painel.querySelector("a");
          if (primeiro) primeiro.focus();
        }
      });

      painel.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Esc") {
          escapar();
        } else if (e.key === "ArrowUp" && e.target === painel.querySelector("a")) {
          e.preventDefault();
          gatilho.focus();
        }
      });
    }

    for (var i = 0; i < itens.length; i++) ligar(itens[i]);
  }

  /* ======================================================================
     6. Busca global — <dialog> com títulos de data/documentos.json (fetch)
        + páginas internas estáticas. Sem dependências externas.
     ====================================================================== */

  var docsPromessa = null; // cache da leitura (fetch UMA vez)

  function carregarDocs() {
    if (!docsPromessa) {
      docsPromessa = fetch("data/documentos.json")
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function (d) { return Array.isArray(d) ? d : []; })
        .catch(function () { return null; }); // null = indisponível
    }
    return docsPromessa;
  }

  function realcar(texto, termo) {
    // Devolve um fragmento com <mark> nas ocorrências; nunca injeta HTML.
    var frag = document.createDocumentFragment();
    if (!termo) { frag.appendChild(document.createTextNode(texto)); return frag; }
    var alvo = normalizar(texto);
    var pos = 0;
    var idx = alvo.indexOf(termo);
    var achou = 0;
    while (idx !== -1 && achou < 40) {
      if (idx > pos) frag.appendChild(document.createTextNode(texto.slice(pos, idx)));
      var m = document.createElement("mark");
      m.textContent = texto.slice(idx, idx + termo.length);
      frag.appendChild(m);
      pos = idx + termo.length;
      idx = alvo.indexOf(termo, pos);
      achou++;
    }
    if (pos < texto.length) frag.appendChild(document.createTextNode(texto.slice(pos)));
    return frag;
  }

  function resultadoNo(r, termo) {
    var a = document.createElement("a");
    a.className = "search-result";
    a.href = r.url;
    a.appendChild(el("span", "search-result__type", r.tipo));
    var titulo = el("span", "search-result__title");
    titulo.appendChild(realcar(r.titulo, termo));
    a.appendChild(titulo);
    if (r.desc) a.appendChild(el("span", "search-result__desc", r.desc));
    return a;
  }

  function initBusca() {
    var gatilho = document.getElementById("search-trigger");
    var dlg = document.getElementById("search-dialog");
    if (!gatilho || !dlg) return;

    var form = document.getElementById("search-form");
    var input = document.getElementById("search-q");
    var caixa = document.getElementById("search-results");
    if (!form || !input || !caixa) return;

    var sequencia = 0; // ignora respostas atrasadas de fetch

    function dicaInicial() {
      caixa.textContent = "";
      caixa.appendChild(
        el("p", "search-empty",
          "Comece a escrever para pesquisar nos 266 documentos do acervo e nas " +
          PAGINAS.length + " páginas do site.")
      );
    }

    function vazio(termo, semDocs) {
      caixa.textContent = "";
      var p = el("p", "search-empty");
      p.appendChild(document.createTextNode("Nenhum resultado para \u00AB" + termo + "\u00BB. Tente outro termo"));
      if (!semDocs) {
        p.appendChild(document.createTextNode(" ou consulte o "));
        var a = document.createElement("a");
        a.href = "documentacao.html?q=" + encodeURIComponent(termo);
        a.textContent = "Centro Documental";
        p.appendChild(a);
        p.appendChild(document.createTextNode("."));
      } else {
        p.appendChild(document.createTextNode(" (o índice de documentos está indisponível)."));
      }
      caixa.appendChild(p);
    }

    function notaDocsIndisponiveis() {
      var p = el("p", "search-empty");
      p.textContent = "Nota: o índice de documentos não está acessível — a pesquisar apenas as páginas do site.";
      caixa.appendChild(p);
    }

    function linkCompleto(termo) {
      var a = document.createElement("a");
      a.className = "search-result search-result--all";
      a.href = "documentacao.html?q=" + encodeURIComponent(termo);
      a.appendChild(el("span", "search-result__type", "Pesquisa completa"));
      a.appendChild(el("span", "search-result__title", "Ver tudo no Centro Documental \u2192"));
      return a;
    }

    function pesquisar(valor) {
      var termo = normalizar(valor).trim();
      if (!termo) { dicaInicial(); return; }
      var meu = ++sequencia;

      carregarDocs().then(function (docs) {
        if (meu !== sequencia) return; // outra tecla chegou primeiro
        var semDocs = docs === null;
        var lista = [];
        var i;

        for (i = 0; i < PAGINAS.length && lista.length < LIMITE_PAGINAS; i++) {
          var p = PAGINAS[i];
          if (normalizar(p.titulo + " " + p.desc).indexOf(termo) === -1) continue;
          lista.push({ tipo: "Página", titulo: p.titulo, desc: p.desc, url: p.url });
        }

        if (!semDocs) {
          var contados = 0;
          for (i = 0; i < docs.length && contados < LIMITE_DOCUMENTOS; i++) {
            var d = docs[i];
            if (!d || !d.titulo || !d.ficheiro) continue;
            if (normalizar(d.titulo + " " + d.ficheiro + " " + (d.tipo || "") + " " + (d.emissor || "")).indexOf(termo) === -1) continue;
            var tipo = "Documento";
            if (d.tipo) tipo += " \u00B7 " + d.tipo;
            if (d.ano) tipo += " \u00B7 " + d.ano;
            lista.push({ tipo: tipo, titulo: d.titulo, desc: "", url: "docs/" + d.ficheiro });
            contados++;
          }
        }

        caixa.textContent = "";
        if (!lista.length) { vazio(termo, semDocs); return; }

        for (i = 0; i < lista.length; i++) caixa.appendChild(resultadoNo(lista[i], termo));
        caixa.appendChild(linkCompleto(termo));
        if (semDocs) notaDocsIndisponiveis();
      });
    }

    function abrir() {
      if (typeof dlg.showModal === "function") {
        if (!dlg.open) dlg.showModal();
      } else {
        dlg.setAttribute("open", "");
      }
      pesquisar(input.value);
      input.focus();
      input.select();
    }

    function fechar() {
      if (typeof dlg.close === "function" && dlg.open) dlg.close();
      else dlg.removeAttribute("open");
    }

    gatilho.addEventListener("click", abrir);

    // Overlay/clique fora do conteúdo → fecha
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) fechar();
    });

    // Fallback para browsers sem <dialog>: Escape manual
    dlg.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.key === "Esc") && typeof dlg.showModal !== "function") {
        fechar();
      }
    });

    input.addEventListener("input", function () { pesquisar(input.value); });

    // Enter: 1 resultado → abre-o; caso contrário → Centro Documental com ?q=
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var termo = normalizar(input.value).trim();
      if (!termo) return;
      var primeiro = caixa.querySelector("a.search-result:not(.search-result--all)");
      var todos = caixa.querySelectorAll("a.search-result:not(.search-result--all)");
      if (todos.length === 1 && primeiro) {
        window.location.href = primeiro.getAttribute("href");
      } else {
        window.location.href = "documentacao.html?q=" + encodeURIComponent(input.value.trim());
      }
    });

    // Atalho "/" (fora de campos de texto) abre a busca
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      var alvo = e.target;
      var tag = alvo && alvo.tagName ? alvo.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select" || (alvo && alvo.isContentEditable)) return;
      if (dlg.open) return;
      e.preventDefault();
      abrir();
    });
  }

  /* ======================================================================
     7. Arranque (DOM pronto)
     ====================================================================== */

  function arrancar() {
    initReveal();
    initHeader();
    initMenuMovel();
    initMegaMenu();
    initBusca();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();

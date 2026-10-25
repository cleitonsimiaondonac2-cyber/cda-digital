/* CDA Digital — Centro Documental
   ---------------------------------------------------------------------------
   Fonte: data/documentos.json (266 registos).
   Modelo: quatro categorias — Legislação, Circulares, Regulamentos, Publicações.
   Os 58 registos curados de js/dados.js servem de override de título/ano/emissor
   (têm títulos corrigidos e acentos); o resto vem do JSON tal como está.
   URLs: docs/<ficheiro> — pasta publicada com os PDFs originais.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var listaEl = document.getElementById("doc-lista");
  if (!listaEl) return;

  var CATS = {
    todos: { rotulo: "Todos", tipos: null },
    legislacao: { rotulo: "Legislação", tipos: ["Lei", "Decreto", "Estatuto"] },
    circulares: { rotulo: "Circulares", tipos: ["Circular"] },
    regulamentos: { rotulo: "Regulamentos", tipos: ["Regulamento", "Ordem de Serviço"] },
    publicacoes: { rotulo: "Publicações", tipos: ["Boletim", "Convocatória", "Relatório", "Comunicado", "Outro"] }
  };
  var LIMITE = 40;

  var docs = [];
  var vistos = LIMITE;
  var cat = "todos";
  var tipo = "";
  var q = "";
  var ano = "Todos";
  var ent = "Todas";

  var qEl = document.getElementById("q");
  var tipoEl = document.getElementById("f-tipo");
  var anoEl = document.getElementById("f-ano");
  var entEl = document.getElementById("f-ent");
  var contEl = document.getElementById("doc-cont");
  var maisEl = document.getElementById("doc-mais");
  var ativosEl = document.getElementById("doc-ativos");
  var catsEl = document.getElementById("doc-cats");

  /* Títulos: limpeza tipográfica dos nomes de ficheiro (sem inventar conteúdo) */
  var ACENTOS = {
    sessao: "sessão", sessoes: "sessões", ordinaria: "ordinária", extraordinaria: "extraordinária",
    inscricao: "inscrição", inscricoes: "inscrições", certificacao: "certificação",
    execucao: "execução", orcamental: "orçamental", orcamentais: "orçamentais",
    orcamento: "orçamento", orcamentos: "orçamento", orcamentas: "orçamentais",
    exortacao: "exortação", ocasiao: "ocasião", inicio: "início", regularizacao: "regularização",
    situacao: "situação", transito: "trânsito", saida: "saída", especies: "espécies",
    inspeccao: "inspeção", veiculos: "veículos", atribuicao: "atribuição", matricula: "matrícula",
    saude: "saúde", reflexao: "reflexão", demonstracoes: "demonstrações", crachas: "crachás",
    emissao: "emissão", renovacao: "renovação", camara: "Câmara", beneficio: "benefício",
    transitarios: "transitários", ircular: "circular", amort: "Amortizações", bal: "Balanço",
    dez: "Dezembro", prorrogacao: "prorrogação", identificacao: "identificação",
    exportacao: "exportação", importacao: "importação", suspensao: "suspensão",
    interdicao: "interdição", actualizacao: "actualização", implementacao: "implementação",
    comissao: "comissão", relacao: "relação", mudanca: "mudança", endereco: "endereço",
    maquinas: "máquinas", feijao: "feijão", acucar: "açúcar", precos: "preços",
    referencia: "referência", substancias: "substâncias", servico: "serviço",
    economico: "económico", lancamento: "lançamento", especie: "espécie"
  };

  function humanizar(t) {
    t = String(t || "").replace(/^Outro\s*[—–-]\s*/i, "");
    t = t.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
    t = t.replace(/\b[\wÀ-ÿ]+\b/g, function (w) {
      var k = w.toLowerCase();
      return ACENTOS[k] || w;
    });
    t = t.replace(/\b(cda|dga|jue|inatter|mdr|iva)\b/gi, function (m) { return m.toUpperCase(); });
    t = t.replace(/\bc[aá]mara\b/gi, "Câmara");
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function normaliza(s) {
    return String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  var curados = {};
  if (typeof CDA !== "undefined" && Array.isArray(CDA.DOCUMENTOS)) {
    CDA.DOCUMENTOS.forEach(function (c) { if (c.ficheiro) curados[c.ficheiro] = c; });
  }

  function preparar(d) {
    var c = curados[d.ficheiro] || {};
    var titulo = c.titulo || d.titulo || d.tituloOriginal || d.ficheiro || "";
    if (!c.titulo) titulo = humanizar(titulo);
    return {
      titulo: titulo,
      tipo: d.tipo || "Documento",
      numero: d.numero || "",
      ano: d.ano || c.ano || null,
      emissor: d.emissor || c.entidade || null,
      ficheiro: d.ficheiro || "",
      url: d.url || ("docs/" + encodeURI(d.ficheiro || ""))
    };
  }

  function ordenar(a, b) {
    if (a.ano && b.ano) { if (b.ano !== a.ano) return b.ano - a.ano; }
    else if (a.ano) return -1;
    else if (b.ano) return 1;
    return a.titulo.localeCompare(b.titulo, "pt");
  }

  function iniciar(lista) {
    docs = lista.map(preparar).filter(function (d) { return d.titulo; }).sort(ordenar);

    // contagens por categoria
    Object.keys(CATS).forEach(function (k) {
      var n = k === "todos" ? docs.length : docs.filter(function (d) {
        return CATS[k].tipos.indexOf(d.tipo) !== -1;
      }).length;
      var alvo = document.querySelector('[data-conta="' + k + '"]');
      if (alvo) alvo.textContent = String(n);
    });

    construirAnos();
    construirEmissores();
    lerURL();
    sincronizarTipos();
    pintar(true);
  }

  function construirAnos() {
    if (!anoEl) return;
    var anos = [];
    docs.forEach(function (d) { if (d.ano && anos.indexOf(d.ano) === -1) anos.push(d.ano); });
    anos.sort(function (a, b) { return b - a; });
    anos.forEach(function (a) { anoEl.add(new Option(String(a), String(a))); });
    if (docs.some(function (d) { return !d.ano; })) anoEl.add(new Option("Sem ano", "Sem ano"));
  }

  function construirEmissores() {
    if (!entEl) return;
    var ents = [];
    docs.forEach(function (d) { if (d.emissor && ents.indexOf(d.emissor) === -1) ents.push(d.emissor); });
    ents.sort();
    ents.forEach(function (e) { entEl.add(new Option(e, e)); });
    if (docs.some(function (d) { return !d.emissor; })) entEl.add(new Option("Sem emissor", "Sem emissor"));
  }

  function tiposDaCategoria() {
    var permitidos = CATS[cat].tipos;
    var tipos = [];
    docs.forEach(function (d) {
      if (permitidos && permitidos.indexOf(d.tipo) === -1) return;
      if (tipos.indexOf(d.tipo) === -1) tipos.push(d.tipo);
    });
    tipos.sort();
    return tipos;
  }

  // Reconstrói o select de tipo conforme a categoria; mantém o tipo se ainda existir.
  function sincronizarTipos() {
    if (!tipoEl) return;
    tipoEl.textContent = "";
    tipoEl.add(new Option("Todos os tipos", ""));
    var tipos = tiposDaCategoria();
    tipos.forEach(function (t) { tipoEl.add(new Option(t, t)); });
    if (tipo && tipos.indexOf(tipo) === -1) tipo = "";
    tipoEl.value = tipo;
  }

  function corresponde(d) {
    var permitidos = CATS[cat].tipos;
    if (permitidos && permitidos.indexOf(d.tipo) === -1) return false;
    if (tipo && d.tipo !== tipo) return false;
    if (ano === "Sem ano") { if (d.ano) return false; }
    else if (ano !== "Todos" && String(d.ano) !== String(ano)) return false;
    if (ent === "Sem emissor") { if (d.emissor) return false; }
    else if (ent !== "Todas" && d.emissor !== ent) return false;
    if (q) {
      var alvo = normaliza([d.titulo, d.tipo, d.emissor, d.numero, d.ano].join(" "));
      var termos = normaliza(q).split(/\s+/);
      return termos.every(function (t) { return alvo.indexOf(t) !== -1; });
    }
    return true;
  }

  function rotuloAtivo() {
    var partes = [];
    if (cat !== "todos") partes.push(CATS[cat].rotulo);
    if (tipo) partes.push(tipo);
    return partes.join(" · ");
  }

  function atualizarChips() {
    if (!catsEl) return;
    Array.prototype.forEach.call(catsEl.querySelectorAll(".doc-cat"), function (a) {
      var ativo = a.dataset.cat === cat;
      a.classList.toggle("is-active", ativo);
      if (ativo) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  function atualizarAtivos() {
    if (!ativosEl) return;
    ativosEl.textContent = "";
    if (!tipo) return;
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "doc-ativo";
    chip.innerHTML = "Tipo: <b></b> <span aria-hidden='true'>✕</span>";
    chip.querySelector("b").textContent = tipo;
    chip.setAttribute("aria-label", "Remover filtro de tipo " + tipo);
    chip.addEventListener("click", function () {
      tipo = "";
      if (tipoEl) tipoEl.value = "";
      pintar(true);
      sincronizarURL();
    });
    ativosEl.appendChild(chip);
  }

  function pintar(resetar) {
    if (resetar) vistos = LIMITE;
    var res = docs.filter(corresponde);
    atualizarChips();
    atualizarAtivos();

    if (contEl) {
      var rotulo = rotuloAtivo();
      contEl.textContent = res.length + (res.length === 1 ? " documento" : " documentos") +
        (rotulo ? " em " + rotulo : "") +
        (res.length !== docs.length ? " (de " + docs.length + ")" : "");
    }

    listaEl.textContent = "";
    if (!res.length) {
      var vazio = document.createElement("div");
      vazio.className = "doc-vazio";
      vazio.textContent = "Nenhum documento corresponde aos filtros seleccionados.";
      listaEl.appendChild(vazio);
      if (maisEl) maisEl.hidden = true;
      return;
    }

    var frag = document.createDocumentFragment();
    res.slice(0, vistos).forEach(function (d) {
      var item = document.createElement("div");
      item.className = "doc-item";

      var meta = document.createElement("div");
      meta.className = "meta";

      var tag = document.createElement("span");
      tag.className = "tipo";
      tag.textContent = d.tipo;

      var titulo = document.createElement("span");
      titulo.className = "titulo";
      titulo.textContent = d.titulo;

      var detalhe = document.createElement("span");
      detalhe.className = "ano";
      var partes = [];
      if (d.emissor) partes.push(d.emissor);
      if (d.ano) partes.push(String(d.ano));
      if (d.numero) partes.push("N.º " + d.numero);
      detalhe.textContent = partes.length ? partes.join(" · ") : "Sem ano e sem emissor indicados";

      meta.appendChild(tag);
      meta.appendChild(titulo);
      meta.appendChild(detalhe);
      item.appendChild(meta);

      var abrir = document.createElement("a");
      abrir.className = "baixar";
      abrir.href = d.url;
      abrir.target = "_blank";
      abrir.rel = "noopener";
      abrir.textContent = "Abrir PDF";
      item.appendChild(abrir);

      frag.appendChild(item);
    });
    listaEl.appendChild(frag);

    if (maisEl) {
      var restantes = res.length - Math.min(vistos, res.length);
      maisEl.hidden = restantes <= 0;
      maisEl.textContent = "Carregar mais (" + restantes + " restantes)";
    }
  }

  function sincronizarURL() {
    var p = new URLSearchParams();
    if (cat !== "todos") p.set("cat", cat);
    if (tipo) p.set("tipo", tipo);
    if (q) p.set("q", q);
    var s = p.toString();
    history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
  }

  function lerURL() {
    var p;
    try { p = new URLSearchParams(location.search); } catch (e) { return; }

    var pedido = p.get("cat");
    if (pedido && CATS[pedido]) cat = pedido;

    var pedidoTipo = p.get("tipo");
    if (pedidoTipo) {
      var alvo = docs.filter(function (d) { return normaliza(d.tipo) === normaliza(pedidoTipo); })[0];
      if (alvo) {
        tipo = alvo.tipo;
        // ?tipo= sem categoria (ou tipo fora da categoria pedida) mostra a
        // categoria que contém esse tipo.
        if (cat === "todos" || (CATS[cat].tipos && CATS[cat].tipos.indexOf(tipo) === -1)) {
          Object.keys(CATS).forEach(function (k) {
            if (CATS[k].tipos && CATS[k].tipos.indexOf(tipo) !== -1) cat = k;
          });
        }
      }
    }

    var pedidoQ = p.get("q");
    if (pedidoQ && qEl) { q = pedidoQ.trim(); qEl.value = q; }
  }

  /* ---- Eventos ---- */
  if (catsEl) {
    catsEl.addEventListener("click", function (e) {
      var a = e.target.closest(".doc-cat");
      if (!a) return;
      e.preventDefault();
      cat = a.dataset.cat || "todos";
      tipo = "";
      sincronizarTipos();
      sincronizarURL();
      pintar(true);
    });
  }

  if (qEl) {
    qEl.addEventListener("input", function () {
      q = qEl.value.trim();
      sincronizarURL();
      pintar(true);
    });
  }

  if (tipoEl) {
    tipoEl.addEventListener("change", function () {
      tipo = tipoEl.value;
      sincronizarURL();
      pintar(true);
    });
  }

  if (anoEl) {
    anoEl.addEventListener("change", function () {
      ano = anoEl.value;
      pintar(true);
    });
  }

  if (entEl) {
    entEl.addEventListener("change", function () {
      ent = entEl.value;
      pintar(true);
    });
  }

  var limpar = document.getElementById("f-limpar");
  if (limpar) {
    limpar.addEventListener("click", function () {
      cat = "todos"; tipo = ""; q = ""; ano = "Todos"; ent = "Todas";
      if (qEl) qEl.value = "";
      if (anoEl) anoEl.value = "Todos";
      if (entEl) entEl.value = "Todas";
      sincronizarTipos();
      sincronizarURL();
      pintar(true);
      if (qEl) qEl.focus();
    });
  }

  if (maisEl) {
    maisEl.addEventListener("click", function () {
      vistos += LIMITE;
      pintar(false);
    });
  }

  /* ---- Carga ---- */
  function falhar() {
    if (contEl) contEl.textContent = "Não foi possível carregar o acervo. Tente recarregar a página.";
    listaEl.textContent = "";
    var aviso = document.createElement("div");
    aviso.className = "doc-vazio";
    aviso.textContent = "O ficheiro data/documentos.json não respondeu.";
    listaEl.appendChild(aviso);
  }

  if (window.fetch) {
    fetch("data/documentos.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (json) {
        if (!Array.isArray(json) || !json.length) throw new Error("acervo vazio");
        iniciar(json);
      })
      .catch(function () {
        // Fallback: os 58 registos curados continuam a funcionar offline.
        if (typeof CDA !== "undefined" && Array.isArray(CDA.DOCUMENTOS) && CDA.DOCUMENTOS.length) {
          iniciar(CDA.DOCUMENTOS);
        } else {
          falhar();
        }
      });
  } else {
    falhar();
  }
})();

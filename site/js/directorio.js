/* CDA Digital 2.0 — Directório de despachantes (S3.2.1)
   ------------------------------------------------------------------
   Monta o directório completo dentro de um único elemento:

     <div data-directorio></div>

   O script cria (com classes já existentes em css/sistema.css):
     - barra de filtros role="search" (busca, delegação, província,
       situação, ordem)                 → .field/.label/.input/.select/.grid
     - contagem "X de Y membros"        → .hint (role=status, aria-live)
     - tabela acessível                 → .table-wrap/.table + <caption>
                                           + <th scope="col">
     - estado vazio amigável            → .empty-state
     - paginação (25/pág)               → .pagination/.pagination__btn

   Estado partilhável na URL (history.replaceState, prefixo dir_):
     dir_q · dir_delegacao · dir_provincia · dir_situacao · dir_ordem ·
     dir_pagina    — só os valores diferentes dos padrões são escritos.

   Dados: contrato CDA_DATA_LEITOR (work-log) com fallback fetch
   'data/membros.json' (mesmo padrão de js/app.js). Sem módulos ES.

   PRIVACIDADE (D20): só mostra campos já públicos em membros.json
   (nome, nCarta, empresa, situacao, provincia, delegacao, activo).
   Nunca cédula/NUIT/email/morada/telefone — estes não existem na fonte. */
(function () {
  "use strict";

  /* ---------- constantes ---------- */
  var RAIZ_SEL = "[data-directorio]";
  var FONTE = "data/membros.json";
  var PAG_TAM = 25;
  var PREFIXO = "dir_";
  var SEM = "—";
  // Colunas visíveis = exactamente os campos públicos da fonte.
  var COLUNAS = [
    { campo: "nCarta", rotulo: "Carteira profissional" },
    { campo: "nome", rotulo: "Nome do despachante" },
    { campo: "empresa", rotulo: "Empresa" },
    { campo: "delegacao", rotulo: "Delegação" },
    { campo: "provincia", rotulo: "Província" },
    { campo: "situacao", rotulo: "Situação" }
  ];
  var ORDEM = [
    { valor: "", rotulo: "Nome (A→Z)" },
    { valor: "nome-desc", rotulo: "Nome (Z→A)" },
    { valor: "delegacao", rotulo: "Delegação" },
    { valor: "provincia", rotulo: "Província" },
    { valor: "situacao", rotulo: "Situação" },
    { valor: "carta", rotulo: "N.º de carteira" }
  ];
  // Campos pesquisáveis — só o que a fonte publica (nada de PII).
  var CAMPOS_BUSCA = ["nome", "empresa", "delegacao", "provincia", "situacao", "nCarta"];

  var collator = typeof Intl !== "undefined" && Intl.Collator
    ? new Intl.Collator("pt", { sensitivity: "base", numeric: true })
    : null;

  /* ---------- helpers ---------- */
  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function normaliza(s) {
    return String(s == null ? "" : s).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function comparar(a, b) {
    a = a == null ? "" : String(a);
    b = b == null ? "" : String(b);
    return collator ? collator.compare(a, b) : a.localeCompare(b);
  }

  // Mesma tolerância de resposta do js/app.js (evita "Unexpected token '<'").
  function lerJson(r) {
    var ct = (r.headers.get("Content-Type") || "").toLowerCase();
    if (!r.ok) throw new Error("resposta inesperada do servidor (" + r.status + ")");
    if (ct.indexOf("json") === -1 && ct.indexOf("text/plain") === -1) {
      throw new Error("resposta inesperada do servidor (" + r.status + ")");
    }
    return r.json().catch(function () { throw new Error("resposta inválida do servidor"); });
  }

  /* ---------- dados ---------- */
  // Fonte única primeiro (leitor), fetch só como plano B — ver work-log
  // secção "CONTRATO PARA OS OUTROS WORKERS".
  function carregar() {
    var leitor = window.CDA_DATA_LEITOR;
    var prontos = (leitor && typeof leitor.membros === "function" && leitor.membros()) || [];
    if (prontos.length) return Promise.resolve(prontos);
    var espera = (leitor && typeof leitor.ready === "function") ? leitor.ready() : Promise.resolve();
    return espera.then(function () {
      var deNovo = (leitor && typeof leitor.membros === "function" && leitor.membros()) || [];
      if (deNovo.length) return deNovo;
      if (typeof fetch !== "function") return [];
      return fetch(FONTE).then(lerJson).catch(function () { return []; });
    });
  }

  /* ---------- estado ---------- */
  var estado = { q: "", delegacao: "", provincia: "", situacao: "", ordem: "", pagina: 1 };
  var membros = [];
  var raiz = null;
  var controlos = {};   // id -> elemento
  var tabela = null, corpo = null, contagem = null, vazio = null, pagNav = null, pagInfo = null;

  /* ---------- URL (estado partilhável) ---------- */
  function lerUrl() {
    var p;
    try { p = new URLSearchParams(window.location.search); } catch (e) { return; }
    ["q", "delegacao", "provincia", "situacao", "ordem"].forEach(function (k) {
      var v = p.get(PREFIXO + k);
      if (v != null) estado[k] = v;
    });
    var pg = parseInt(p.get(PREFIXO + "pagina"), 10);
    if (!isNaN(pg) && pg > 0) estado.pagina = pg;
  }

  function escreverUrl() {
    try {
      var p = new URLSearchParams(window.location.search);
      var padrao = { q: "", delegacao: "", provincia: "", situacao: "", ordem: "", pagina: 1 };
      Object.keys(padrao).forEach(function (k) {
        var nome = PREFIXO + k;
        var val = String(estado[k]);
        if (val !== String(padrao[k]) && val !== "") p.set(nome, val);
        else p.delete(nome);
      });
      var qs = p.toString();
      var url = window.location.pathname + (qs ? "?" + qs : "") + window.location.hash;
      window.history.replaceState(null, "", url);
    } catch (e) {
      /* file:// pode recusar replaceState — o componente continua a funcionar */
    }
  }

  /* ---------- filtro + ordenação ---------- */
  function filtrar() {
    var q = normaliza(estado.q).split(/\s+/).filter(Boolean);
    return membros.filter(function (m) {
      if (estado.delegacao && m.delegacao !== estado.delegacao) return false;
      if (estado.provincia && m.provincia !== estado.provincia) return false;
      if (estado.situacao && m.situacao !== estado.situacao) return false;
      if (!q.length) return true;
      var alvo = normaliza(CAMPOS_BUSCA.map(function (c) { return m[c]; }).join(" "));
      return q.every(function (t) { return alvo.indexOf(t) !== -1; });
    });
  }

  function ordenar(lista) {
    var ord = estado.ordem;
    var copia = lista.slice();
    copia.sort(function (a, b) {
      if (ord === "nome-desc") return comparar(b.nome, a.nome);
      if (ord === "delegacao") return comparar(a.delegacao, b.delegacao) || comparar(a.nome, b.nome);
      if (ord === "provincia") return comparar(a.provincia, b.provincia) || comparar(a.nome, b.nome);
      if (ord === "situacao") return comparar(a.situacao, b.situacao) || comparar(a.nome, b.nome);
      if (ord === "carta") return comparar(a.nCarta, b.nCarta);
      return comparar(a.nome, b.nome);
    });
    return copia;
  }

  function distinto(campo) {
    var vistas = {};
    var out = [];
    membros.forEach(function (m) {
      var v = m[campo];
      if (v == null || v === "") return;
      if (!vistas[v]) { vistas[v] = true; out.push(v); }
    });
    out.sort(comparar);
    return out;
  }

  /* ---------- construção da UI ---------- */
  function campo(id, rotulo, tipo) {
    var wrap = el("div", "field");
    var lab = el("label", "label", rotulo);
    lab.htmlFor = id;
    var ctrl;
    if (tipo === "select") {
      ctrl = el("select", "select");
      // 1.ª opção = sem filtro; o texto definitivo é posto por preencherOpcoes()
      var padrao = el("option", null, "Todos");
      padrao.value = "";
      ctrl.appendChild(padrao);
    } else {
      ctrl = el("input", "input");
      ctrl.type = "search";
      ctrl.placeholder = "Nome, empresa, delegação…";
    }
    ctrl.id = id;
    wrap.appendChild(lab);
    wrap.appendChild(ctrl);
    controlos[id] = ctrl;
    return wrap;
  }

  function montarUI() {
    // 1. filtros
    var barra = el("div", "grid grid--4");
    barra.setAttribute("role", "search");
    barra.setAttribute("aria-label", "Filtros do directório");
    var fBusca = campo("dir-busca", "Pesquisar", "text");
    fBusca.style.gridColumn = "1 / -1";
    barra.appendChild(fBusca);
    barra.appendChild(campo("dir-delegacao", "Delegação", "select"));
    barra.appendChild(campo("dir-provincia", "Província", "select"));
    barra.appendChild(campo("dir-situacao", "Situação", "select"));
    barra.appendChild(campo("dir-ordem", "Ordenar por", "select"));
    raiz.appendChild(barra);

    // 2. contagem
    contagem = el("p", "hint");
    contagem.id = "dir-contagem";
    contagem.setAttribute("role", "status");
    contagem.setAttribute("aria-live", "polite");
    contagem.style.textAlign = "center";
    contagem.textContent = "A carregar…";
    raiz.appendChild(contagem);

    // 3. tabela acessível
    var wrap = el("div", "table-wrap");
    tabela = el("table", "table");
    tabela.id = "dir-tabela";
    var caption = el("caption", null, "Directório de membros da Câmara dos Despachantes Aduaneiros de Moçambique");
    caption.style.textAlign = "left";
    caption.style.padding = "var(--sp-4) var(--sp-4) 0";
    caption.style.fontFamily = "var(--font-display)";
    caption.style.fontWeight = "700";
    caption.style.fontSize = "var(--fs-sm)";
    caption.style.color = "var(--text-secondary)";
    tabela.appendChild(caption);
    var thead = document.createElement("thead");
    var trh = document.createElement("tr");
    COLUNAS.forEach(function (c) {
      var th = document.createElement("th");
      th.scope = "col";
      th.textContent = c.rotulo;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    tabela.appendChild(thead);
    corpo = document.createElement("tbody");
    tabela.appendChild(corpo);
    wrap.appendChild(tabela);
    raiz.appendChild(wrap);

    // 4. estado vazio (invisível enquanto houver resultados)
    vazio = el("div", "empty-state");
    vazio.hidden = true;
    vazio.appendChild(el("div", "empty-state__icon", "\uD83D\uDD0D"));
    vazio.appendChild(el("h3", null, "Nenhum despachante encontrado"));
    vazio.appendChild(el("p", null, "Nenhum registo corresponde aos filtros seleccionados. Experimente limpar a pesquisa ou escolher outra delegação."));
    raiz.appendChild(vazio);

    // 5. paginação
    pagNav = el("nav", "pagination");
    pagNav.id = "dir-paginacao";
    pagNav.setAttribute("aria-label", "Paginação do directório");
    raiz.appendChild(pagNav);
    pagInfo = el("p", "pagination__info");
    pagInfo.id = "dir-paginas";
    raiz.appendChild(pagInfo);
  }

  function preencherOpcoes() {
    [
      { id: "dir-delegacao", campo: "delegacao", todas: "Todas as delegações" },
      { id: "dir-provincia", campo: "provincia", todas: "Todas as províncias" },
      { id: "dir-situacao", campo: "situacao", todas: "Todas as situações" }
    ].forEach(function (f) {
      var sel = controlos[f.id];
      if (!sel) return;
      // mantém a 1.ª opção (placeholder) e repõe as restantes
      while (sel.options.length > 1) sel.remove(1);
      sel.options[0].textContent = f.todas;
      distinto(f.campo).forEach(function (v) {
        var o = el("option", null, v);
        o.value = v;
        sel.appendChild(o);
      });
    });
    var ord = controlos["dir-ordem"];
    if (ord) {
      while (ord.options.length > 1) ord.remove(1);
      ord.options[0].textContent = ORDEM[0].rotulo;
      ord.options[0].value = "";
      ORDEM.slice(1).forEach(function (o) {
        var op = el("option", null, o.rotulo);
        op.value = o.valor;
        ord.appendChild(op);
      });
    }
  }

  function sincronizarControlos() {
    if (controlos["dir-busca"]) controlos["dir-busca"].value = estado.q;
    if (controlos["dir-delegacao"]) controlos["dir-delegacao"].value = estado.delegacao;
    if (controlos["dir-provincia"]) controlos["dir-provincia"].value = estado.provincia;
    if (controlos["dir-situacao"]) controlos["dir-situacao"].value = estado.situacao;
    if (controlos["dir-ordem"]) controlos["dir-ordem"].value = estado.ordem;
  }

  /* ---------- paginação ---------- */
  // Janela: mostra 1 … actual-1 actual actual+1 … total quando > 9 páginas.
  function paginasVisiveis(total, actual) {
    if (total <= 9) {
      var todos = [];
      for (var i = 1; i <= total; i++) todos.push(i);
      return todos;
    }
    var saida = [1];
    var ini = Math.max(2, actual - 1);
    var fim = Math.min(total - 1, actual + 1);
    if (ini > 2) saida.push("…");
    for (var j = ini; j <= fim; j++) saida.push(j);
    if (fim < total - 1) saida.push("…");
    saida.push(total);
    return saida;
  }

  function botaoPagina(destino, rotulo, texto, actual, desactivado) {
    var b = el("button", "pagination__btn", texto);
    b.type = "button";
    b.setAttribute("data-pag", String(destino));
    b.setAttribute("aria-label", rotulo);
    if (desactivado) b.disabled = true;
    if (!desactivado && String(destino) === String(actual)) b.setAttribute("aria-current", "page");
    return b;
  }

  function renderPaginacao(totalPaginas) {
    var foco = document.activeElement;
    var focoPag = foco && foco.getAttribute ? foco.getAttribute("data-pag") : null;
    pagNav.textContent = "";
    if (totalPaginas <= 1) { pagNav.hidden = true; pagInfo.hidden = true; return; }
    pagNav.hidden = false;
    pagInfo.hidden = false;
    var p = estado.pagina;
    pagNav.appendChild(botaoPagina(p - 1, "Página anterior", "‹", p, p <= 1));
    paginasVisiveis(totalPaginas, p).forEach(function (n) {
      if (n === "…") {
        var span = el("span", "pagination__btn", "…");
        span.setAttribute("aria-hidden", "true");
        span.style.pointerEvents = "none";
        pagNav.appendChild(span);
      } else {
        pagNav.appendChild(botaoPagina(n, "Página " + n, String(n), p, false));
      }
    });
    pagNav.appendChild(botaoPagina(p + 1, "Página seguinte", "›", p, p >= totalPaginas));
    pagInfo.textContent = "Página " + p + " de " + totalPaginas;
    // devolve o foco ao botão equivalente após re-render (teclado)
    if (focoPag != null && document.activeElement === document.body) {
      var alvo = pagNav.querySelector('[data-pag="' + focoPag + '"]:not([disabled])');
      if (alvo) alvo.focus();
    }
  }

  /* ---------- render principal ---------- */
  function render() {
    var res = ordenar(filtrar());
    var total = membros.length;
    var totalPag = Math.max(1, Math.ceil(res.length / PAG_TAM));
    if (estado.pagina > totalPag) estado.pagina = totalPag;
    if (estado.pagina < 1) estado.pagina = 1;

    // contagem "X de Y"
    var txt = res.length + " de " + total + " membros";
    if (res.length !== total) txt += " · a filtrar";
    contagem.textContent = txt;

    // tabela
    corpo.textContent = "";
    var inicio = (estado.pagina - 1) * PAG_TAM;
    res.slice(inicio, inicio + PAG_TAM).forEach(function (m) {
      var tr = document.createElement("tr");
      COLUNAS.forEach(function (c) {
        var td = document.createElement("td");
        var v = m[c.campo];
        td.textContent = (v == null || v === "") ? SEM : String(v);
        tr.appendChild(td);
      });
      corpo.appendChild(tr);
    });

    var vazioActivo = res.length === 0;
    vazio.hidden = !vazioActivo;
    tabela.parentNode.hidden = vazioActivo;
    if (vazioActivo) contagem.textContent = "0 de " + total + " membros";

    renderPaginacao(totalPag);
  }

  function mudou() {
    estado.pagina = 1;
    escreverUrl();
    render();
  }

  /* ---------- eventos ---------- */
  function ligarEventos() {
    if (controlos["dir-busca"]) {
      controlos["dir-busca"].addEventListener("input", function () {
        estado.q = controlos["dir-busca"].value;
        mudou();
      });
    }
    [["dir-delegacao", "delegacao"], ["dir-provincia", "provincia"],
     ["dir-situacao", "situacao"], ["dir-ordem", "ordem"]].forEach(function (par) {
      var c = controlos[par[0]];
      if (c) c.addEventListener("change", function () {
        estado[par[1]] = c.value;
        mudou();
      });
    });

    pagNav.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button[data-pag]") : null;
      if (!b || b.disabled) return;
      var alvo = parseInt(b.getAttribute("data-pag"), 10);
      if (isNaN(alvo)) return;
      estado.pagina = alvo;
      escreverUrl();
      render();
    });
  }

  /* ---------- arranque ---------- */
  function arrancar() {
    raiz = document.querySelector(RAIZ_SEL);
    if (!raiz) return; // página sem o componente — nada a fazer, sem erros

    lerUrl();
    montarUI();
    ligarEventos();

    carregar().then(function (lista) {
      membros = Array.isArray(lista) ? lista : [];
      preencherOpcoes();
      sincronizarControlos();
      render();
    }).catch(function () {
      membros = [];
      contagem.textContent = "Não foi possível carregar o directório.";
      corpo.textContent = "";
      tabela.parentNode.hidden = true;
      vazio.hidden = false;
      pagNav.hidden = true;
      pagInfo.hidden = true;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();

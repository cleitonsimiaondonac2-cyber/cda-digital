/* CDA Digital 2.0 — interacções */
(function () {
  "use strict";

  // Parse JSON robusto: só faz .json() se o backend devolver JSON; senão lança
  // um erro claro (evita "Unexpected token '<'" quando recebe HTML/erro de proxy).
  function lerJson(r) {
    var ct = (r.headers.get("Content-Type") || "").toLowerCase();
    if (r.ok && ct.indexOf("application/json") === -1 && ct.indexOf("text/json") === -1) {
      return r.text().then(function (t) { throw new Error("resposta inesperada do servidor (" + r.status + ")"); });
    }
    return r.json().catch(function () {
      throw new Error("resposta inválida do servidor (" + r.status + ")");
    });
  }

  // ---- Menu móvel ----
  const menuBtn = document.getElementById("menu-btn");
  const nav = document.getElementById("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => nav.classList.toggle("aberto"));
  }

  // ---- Marcador de página activa ----
  const SUBPAGE = { galeria: "noticias", actividades: "noticias", parceiros: "noticias", membro: "despachantes" };
  document.querySelectorAll("#nav a").forEach((a) => {
    const page = document.body.dataset.page;
    if (page && (a.dataset.pagina === page || a.dataset.pagina === SUBPAGE[page])) {
      if (a.dataset.pagina) a.classList.add("active");
    }
  });

  // ---- Título + metas dinâmicos ----
  const metas = document.querySelector("meta[name='description']");
  document.querySelectorAll("[data-titulo]").forEach((el) => {
    document.title = el.dataset.titulo + " — Câmara dos Despachantes Aduaneiros de Moçambique";
  });

  // ---- Fonte única de membros -------------------------------------------------
  // Os membros vivem em `site/data/membros.json`, publicado em linha por
  // `js/data-gen.js` (window.CDA_DATA) e exposto por CDA_DATA_LEITOR.
  // O antigo `CDA.MEMBROS` foi esvaziado de propósito: era uma segunda fonte de
  // verdade que publicava dados pessoais, e já não volta a ser lido.
  //
  // A carga é memoizada e publicada em `window.CDA_MEMBROS` para que o home.js
  // (que é carregado a seguir) partilhe a mesma promessa em vez de repetir o
  // pedido do mesmo ficheiro.
  const LEITOR_MEMBROS = window.CDA_DATA_LEITOR;
  const FONTE_MEMBROS = "data/membros.json";
  let dadosMembros = [];
  let membrosCarregados = false;
  let promessaMembros = null;

  function carregarMembros() {
    // Só se memoiza uma carga bem-sucedida: uma promessa rejeitada ficaria
    // envenenada para sempre e nenhum consumidor voltaria a tentar.
    if (dadosMembros.length) return Promise.resolve(dadosMembros);
    if (!promessaMembros) {
      promessaMembros = Promise.resolve()
        .then(() => {
          if (LEITOR_MEMBROS && typeof LEITOR_MEMBROS.ready === "function") {
            return LEITOR_MEMBROS.ready();
          }
          return null;
        })
        .then(() => {
          // A fonte em linha (data-gen.js) manda; o fetch é o plano B para
          // quando a página ainda não a carregou. Sobre `file://` o fetch
          // falha por CORS — daí os dados serem gerados em linha.
          const prontos = (LEITOR_MEMBROS && typeof LEITOR_MEMBROS.membros === "function"
            && LEITOR_MEMBROS.membros()) || [];
          return prontos.length ? prontos : fetch(FONTE_MEMBROS).then(lerJson);
        })
        .then((carga) => {
          dadosMembros = Array.isArray(carga) ? carga : [];
          membrosCarregados = true;
          return dadosMembros;
        })
        .catch((err) => {
          promessaMembros = null;          // allows retry
          throw err;
        });
    }
    return promessaMembros;
  }

  // Contrato partilhado com o home.js: `carregar()` dá a lista, `dados()` dá
  // o que já foi carregado (array vazia enquanto não houver resposta).
  window.CDA_MEMBROS = {
    carregar: carregarMembros,
    dados: () => dadosMembros,
    fonte: FONTE_MEMBROS,
  };

  // ---- Lista de membros ----
  const bMembros = document.getElementById("busca-membros");
  const tMembros = document.getElementById("tabela-membros");
  const cMembros = document.getElementById("membros-cont");
  const corpoMembros = tMembros && tMembros.querySelector("tbody");
  if (bMembros && corpoMembros) {
    // Campos que membros.json publica. `carteira` passou a chamar-se `nCarta`
    // e `cedula` deixou de existir: era o bilhete de identidade, retirado
    // por ser PII. A pesquisa cobre o que a fonte permite — nada inventado.
    const CAMPOS_BUSCA = ["nome", "nCarta", "empresa", "situacao", "provincia", "delegacao"];
    // Cabeçalho em despachantes.html: "Carteira profissional" · "Nome do
    // despachante" · "Cédula". A fonte única não publica cédulas, por isso a
    // terceira coluna fica com um traço em vez de um campo inventado.
    const SEM_VALOR = "—";

    function celula(valor) {
      return esc(valor) || SEM_VALOR;
    }

    function textoPesquisavel(m) {
      return CAMPOS_BUSCA.map((c) => m[c])
        .filter((v) => v != null && v !== "")
        .join(" ");
    }

    function renderMembros() {
      if (!membrosCarregados) {
        if (cMembros) cMembros.textContent = "A carregar a lista de membros…";
        return;
      }
      const q = normaliza(bMembros.value || "");
      const res = dadosMembros.filter((m) => {
        if (!q) return true;
        return normaliza(textoPesquisavel(m)).includes(q);
      });
      if (cMembros) cMembros.textContent = res.length + " de " + dadosMembros.length + " membros";
      corpoMembros.textContent = "";
      res.forEach((m) => {
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.textContent = celula(m.nCarta);
        const td2 = document.createElement("td");
        td2.textContent = celula(m.nome);
        const td3 = document.createElement("td");
        td3.textContent = SEM_VALOR;
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        corpoMembros.appendChild(tr);
      });
    }

    bMembros.addEventListener("input", renderMembros);
    renderMembros();
    carregarMembros()
      .then(renderMembros)
      .catch(() => {
        if (cMembros) cMembros.textContent = "Não foi possível carregar a lista de membros.";
      });
  }

  // ---- Notícias: expandir ----
  document.querySelectorAll("[data-noticia]").forEach((el) => {
    el.addEventListener("click", () => {
      const alvo = document.getElementById("noticia-" + el.dataset.noticia);
      if (alvo) alvo.classList.toggle("aberta");
      el.textContent = el.textContent.trim() === "Ler mais" ? "Fechar" : "Ler mais";
    });
  });

  // ---- Galeria: lightbox ----
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  if (lb && lbImg) {
    document.querySelectorAll("[data-galeriasrc]").forEach((img) => {
      img.addEventListener("click", () => {
        lbImg.src = img.dataset.galeriasrc;
        lb.classList.add("aberta");
      });
    });
    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.id === "lb-fechar") lb.classList.remove("aberta");
    });
  }

  // ---- Assistente IA → widget flutuante (js/assistente.js) ----
  // O botão "Conversar com o Assistente" (index) abre o widget
  const abreAssist = document.getElementById("assist-abre");
  if (abreAssist) {
    abreAssist.addEventListener("click", () => {
      if (window.CDA_IA) window.CDA_IA.abrir(null);
    });
  }

  // ---- Formulário de contacto (real → /api/contacto) ----
  const fContato = document.getElementById("form-contacto");
  if (fContato) {
    fContato.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = fContato.querySelector("button[type=submit]");
      const aviso = fContato.querySelector(".aviso-ok");
      const avisoErro = fContato.querySelector(".aviso-erro");
      if (aviso) aviso.style.display = "none";
      if (avisoErro) avisoErro.style.display = "none";
      if (btn) btn.disabled = true;
      const base = (window.CDA_API_BASE || "");
      fetch(base + "/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: document.getElementById("c-nome").value,
          email: document.getElementById("c-email").value,
          assunto: document.getElementById("c-assunto")
            ? document.getElementById("c-assunto").value : "",
          mensagem: document.getElementById("c-msg").value,
        }),
      }).then(function (r) {
        return lerJson(r).then(function (d) {
          if (!r.ok) throw new Error(d.detail || "falha no envio");
          if (aviso) aviso.style.display = "block";
          fContato.reset();
        });
      }).catch((err) => {
        if (avisoErro) { avisoErro.textContent = "Erro ao enviar: " + err.message; avisoErro.style.display = "block"; }
        else alert("Erro ao enviar: " + err.message);
      }).finally(() => { if (btn) btn.disabled = false; });
    });
  }

  // ---- Login real (área do membro → /api/auth) ----
  const fLogin = document.getElementById("form-login");
  if (fLogin) {
    fLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const base = (window.CDA_API_BASE || "");
      const aviso = document.getElementById("login-aviso");
      if (aviso) aviso.textContent = "";
      fetch(base + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: document.getElementById("l-user").value.trim(),
          senha: document.getElementById("l-pass").value,
        }),
      }).then(function (r) {
        return lerJson(r).then(function (d) {
          if (!r.ok) throw new Error(d.detail || "credenciais inválidas");
          const loginView = document.getElementById("login-view");
          const dash = document.getElementById("dash-view");
          if (loginView) loginView.style.display = "none";
          if (dash) {
            const nome = document.getElementById("dash-nome");
            if (nome) nome.textContent = d.nome || "Painel do membro";
            dash.style.display = "block";
          }
        });
      }).catch((err) => {
        if (aviso) aviso.textContent = err.message;
        else alert(err.message);
      });
    });
  }

  // ---- Registo (área do membro → /api/auth/registar) ----
  const fRegisto = document.getElementById("form-registo");
  if (fRegisto) {
    fRegisto.addEventListener("submit", (e) => {
      e.preventDefault();
      const base = (window.CDA_API_BASE || "");
      const msg = document.getElementById("registo-msg");
      const btn = fRegisto.querySelector("button[type=submit]");
      if (btn) btn.disabled = true;
      if (msg) msg.textContent = "";
      fetch(base + "/api/auth/registar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: document.getElementById("r-nome").value,
          email: document.getElementById("r-email").value,
          entidade: document.getElementById("r-entidade")
            ? document.getElementById("r-entidade").value : "",
          telefone: document.getElementById("r-telefone")
            ? document.getElementById("r-telefone").value : "",
          senha: document.getElementById("r-senha").value,
        }),
      }).then(function (r) {
        return lerJson(r).then(function (d) {
          if (!r.ok) throw new Error(d.detail || "falha no registo");
          if (msg) { msg.textContent = d.mensagem || "Conta criada. Já pode iniciar sessão."; msg.style.color = "#626262"; }
          fRegisto.reset();
        });
      }).catch((err) => {
        if (msg) msg.textContent = err.message;
        else alert(err.message);
      }).finally(() => { if (btn) btn.disabled = false; });
    });
  }

  // ---- Terminar sessão ----
  const terminSessao = document.getElementById("terminar-sessao");
  if (terminSessao) {
    terminSessao.addEventListener("click", (e) => {
      e.preventDefault();
      const base = (window.CDA_API_BASE || "");
      fetch(base + "/api/auth/logout", { method: "POST" }).catch(function () {}).finally(function () {
        location.reload();
      });
    });
  }

  // ---- Deslocar até ao formulário de registo ----
  const abreRegisto = document.getElementById("abre-registo");
  if (abreRegisto) {
    abreRegisto.addEventListener("click", (e) => {
      const alvo = document.getElementById("registo-box");
      if (alvo && alvo.scrollIntoView) {
        alvo.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
})();

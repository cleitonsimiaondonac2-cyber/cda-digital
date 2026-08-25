/* CDA Digital 2.0 — interacções */
(function () {
  "use strict";

  // ---- Menu móvel ----
  const menuBtn = document.getElementById("menu-btn");
  const nav = document.getElementById("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => nav.classList.toggle("aberto"));
  }

  // ---- Marcador de página activa ----
  document.querySelectorAll("#nav a").forEach((a) => {
    const page = document.body.dataset.page;
    if (page && a.dataset.pagina === page) a.classList.add("active");
  });

  // ---- Título + metas dinâmicos ----
  const metas = document.querySelector("meta[name='description']");
  document.querySelectorAll("[data-titulo]").forEach((el) => {
    document.title = el.dataset.titulo + " — Câmara dos Despachantes Aduaneiros de Moçambique";
  });

  // ---- Centro Documental: filtros + pesquisa ----
  const qInput = document.getElementById("q");
  const fTipo = document.getElementById("f-tipo");
  const fAno = document.getElementById("f-ano");
  const fEnt = document.getElementById("f-ent");
  const lista = document.getElementById("doc-lista");
  const contador = document.getElementById("doc-cont");

  const TIPOS = ["Legislação", "Regulamentos", "Convocatórias", "Circulares", "Ordens de Serviço", "Exortações", "Relatórios", "Boletins", "Fichas de Inscrição", "Eventos"];
  const ORDENS = ["Ordens de Serviço"];

  function normaliza(s) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function filtraDocs() {
    const q = normaliza((qInput ? qInput.value : "") || "");
    const tipo = fTipo ? fTipo.value : "Todos";
    const ano = fAno ? fAno.value : "Todos";
    const ent = fEnt ? fEnt.value : "Todas";

    const res = CDA.DOCUMENTOS.filter((d) => {
      if (tipo !== "Todos" && d.tipo !== tipo) return false;
      if (ano !== "Todos" && String(d.ano) !== ano) return false;
      if (ent !== "Todas" && d.entidade !== ent) return false;
      if (q) {
        const alvo = normaliza(d.titulo + " " + d.entidade + " " + d.tipo);
        const termos = q.split(/\s+/);
        return termos.every((t) => alvo.includes(t));
      }
      return true;
    });
    renderDocs(res);
  }

  function renderDocs(list) {
    if (!lista) return;
    if (contador) contador.textContent = list.length + " documento(s) encontrado(s)";
    lista.innerHTML = "";
    if (!list.length) {
      lista.innerHTML = '<div class="doc-item"><span>Nenhum documento corresponde aos filtros seleccionados.</span></div>';
      return;
    }
    list.forEach((d) => {
      const el = document.createElement("div");
      el.className = "doc-item";
      el.innerHTML =
        '<div class="meta">' +
        '<span class="tipo">' + d.tipo + "</span>" +
        "<span>" + d.titulo + "</span>" +
        '<span class="ano">' + d.entidade + " · " + d.ano + "</span>" +
        "</div>" +
        '<a class="baixar" href="' + d.url + '" target="_blank" rel="noopener">Abrir PDF</a>' +
        '<button class="ia-doc" data-ficheiro="' + d.ficheiro + '" data-titulo="' + d.titulo + '">Perguntar à IA</button>';
      lista.appendChild(el);
    });
  }

  if (lista) {
    if (fTipo) {
      TIPOS.forEach((t) => fTipo.add(new Option(t, t)));
    }
    if (fAno) {
      const anos = [...new Set(CDA.DOCUMENTOS.map((d) => d.ano))].sort((a, b) => b - a);
      anos.forEach((a) => fAno.add(new Option(String(a), String(a))));
    }
    if (fEnt) {
      const ents = [...new Set(CDA.DOCUMENTOS.map((d) => d.entidade))].sort();
      ents.forEach((e) => fEnt.add(new Option(e, e)));
    }
    [qInput, fTipo, fAno, fEnt].forEach((el) => el && el.addEventListener("input", filtraDocs));
    filtraDocs();

    // parâmetro ?q= vindo da homepage
    const qs = new URLSearchParams(location.search).get("q");
    if (qs && qInput) { qInput.value = qs; filtraDocs(); }

    // "Perguntar à IA" por documento → abre o Assistente flutuante
    lista.addEventListener("click", (e) => {
      const b = e.target.closest(".ia-doc");
      if (!b) return;
      if (window.CDA_IA) {
        window.CDA_IA.abrir(b.dataset.ficheiro, b.dataset.titulo);
      } else {
        const iaInputDoc = document.getElementById("ia-input");
        if (iaInputDoc) {
          iaInputDoc.value = "Sobre o documento «" + (b.dataset.titulo || "") + "»: ";
          iaInputDoc.focus();
        }
      }
    });
  }

  // ---- Lista de membros ----
  const bMembros = document.getElementById("busca-membros");
  const tMembros = document.getElementById("tabela-membros");
  const cMembros = document.getElementById("membros-cont");
  if (bMembros && tMembros && CDA.MEMBROS) {
    const corpo = tMembros.querySelector("tbody");
    function renderMembros() {
      const q = normaliza(bMembros.value);
      const res = CDA.MEMBROS.filter((m) => {
        if (!q) return true;
        return normaliza(m.nome + " " + m.carteira + " " + m.cedula).includes(q);
      });
      if (cMembros) cMembros.textContent = res.length + " de " + CDA.MEMBROS.length + " membros";
      corpo.innerHTML = "";
      res.forEach((m) => {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td>" + m.carteira + "</td><td>" + m.nome + "</td><td>" + m.cedula + "</td>";
        corpo.appendChild(tr);
      });
    }
    bMembros.addEventListener("input", renderMembros);
    renderMembros();
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

  // ---- Formulário de contacto (demo: abre o mail) ----
  const fContato = document.getElementById("form-contacto");
  if (fContato) {
    fContato.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("c-nome").value;
      const email = document.getElementById("c-email").value;
      const msg = document.getElementById("c-msg").value;
      const link = "mailto:cda@cda-mz.org?subject=" + encodeURIComponent("Contacto via site — " + nome) + "&body=" + encodeURIComponent(msg + "\n\nDe: " + nome + " <" + email + ">");
      window.location.href = link;
      fContato.querySelector(".aviso-ok").style.display = "block";
    });
  }

  // ---- Login demo ----
  const fLogin = document.getElementById("form-login");
  if (fLogin) {
    fLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      document.getElementById("login-view").style.display = "none";
      const dash = document.getElementById("dash-view");
      if (dash) dash.style.display = "block";
    });
  }
})();

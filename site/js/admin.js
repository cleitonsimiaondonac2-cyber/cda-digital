/* Painel Admin CDA — gestão de conteúdo (docs, notícias, actividades, membros, mensagens).
   Consome a API do backend (CDA_API_BASE). Servido pelo próprio FastAPI ou com proxy. */
(function () {
  "use strict";

  var API = (typeof CDA_API_BASE !== "undefined" && CDA_API_BASE) || "";
  var seccoes = ["dashboard", "documentos", "noticias", "actividades", "mensagens", "membros"];
  var DOM = {};

  function el(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function api(path, opts) {
    opts = opts || {};
    opts.credentials = "include";
    opts.headers = Object.assign({ "Accept": "application/json" }, opts.headers || {});
    if (opts.body && typeof opts.body === "object") {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.body);
    }
    return fetch(API + path, opts).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.detail || ("erro HTTP " + r.status));
        return data;
      });
    });
  }

  // ---------------------------------------------------------------- navegação

  function ativa(sec) {
    seccoes.forEach(function (s) {
      var v = el("v-" + s);
      var b = el("nav-" + s);
      if (v) v.style.display = (s === sec ? "" : "none");
      if (b) b.classList.toggle("ativo", s === sec);
    });
  }

  // ---------------------------------------------------------------- sessão

  function mostraLogin() { el("view-login").style.display = ""; el("view-admin").style.display = "none"; }

  function mostraAdmin() { el("view-login").style.display = "none"; el("view-admin").style.display = ""; }

  function logout() {
    api("/api/auth/logout", { method: "POST" }).catch(function () {});
    try { sessionStorage.removeItem("cda_admin"); } catch (e) {}
    mostraLogin();
  }

  function login(ev) {
    ev.preventDefault();
    var d = { email: el("login-email").value.trim(), senha: el("login-senha").value };
    api("/api/auth/login", { method: "POST", body: d }).then(function (r) {
      if (!r.is_admin) { alert("Sem permissões de administrador."); return logout(); }
      sessionStorage.setItem("cda_admin", "1");
      entrar();
    }).catch(function (e) {
      el("login-msg").textContent = e.message;
    });
  }

  function entrar() {
    mostraAdmin();
    carregarDashboard();
    ativa("dashboard");
  }

  // ------------------------------------------------------------- dashboard

  function carregarDashboard() {
    var contas = Promise.all([
      api("/api/admin/documentos").then(function (d) { return d.documentos.length; }).catch(function () { return "-"; }),
      api("/api/admin/noticias").then(function (d) { return d.noticias.length; }).catch(function () { return "-"; }),
      api("/api/admin/actividades").then(function (d) { return d.actividades.length; }).catch(function () { return "-"; }),
      api("/api/admin/mensagens").then(function (d) { return d.mensagens.length; }).catch(function () { return "-"; }),
      api("/api/admin/membros").then(function (d) { return d.membros.length; }).catch(function () { return "-"; }),
      api("/api/status").catch(function () { return {}; })
    ]);
    contas.then(function (v) {
      el("stat-docs").textContent = v[0];
      el("stat-noticias").textContent = v[1];
      el("stat-actividades").textContent = v[2];
      el("stat-msg").textContent = v[3];
      el("stat-membros").textContent = v[4];
      el("stat-servico").textContent = (v[5] && v[5].servico) ? v[5].servico : "backend";
    });
  }

  function publicar() {
    if (!confirm("Publicar regenera js/dados.js e o índice de IA a partir da BD. Continuar?")) return;
    el("pub-msg").textContent = "A publicar…";
    api("/api/admin/publicar", { method: "POST" }).then(function (d) {
      el("pub-msg").textContent = "Publicado: " + d.documentos + " documentos · índice rc=" + d.indice_rc;
    }).catch(function (e) {
      el("pub-msg").textContent = "Erro: " + e.message;
    });
  }

  // ----------------------------------------------------------- documentos

  function carregarDocs() {
    api("/api/admin/documentos").then(function (d) {
      var h = "";
      d.documentos.forEach(function (x) {
        h += "<tr><td>" + esc(x.titulo) + "</td><td>" + esc(x.tipo) + "</td><td>" + esc(x.entidade) +
          "</td><td>" + esc(x.ano || "") + "</td><td><span class=\"estado estado-ok\">" + esc(x.status) + "</span></td>" +
          "<td><button class=\"btn-mini\" data-accao=\"editar-doc\" data-id=\"" + x.id + "\">Editar</button> " +
          "<button class=\"btn-mini perigo\" data-accao=\"apagar-doc\" data-id=\"" + x.id + "\">Apagar</button></td></tr>";
      });
      el("lista-docs").innerHTML = h || "<tr><td colspan=\"6\">Sem documentos.</td></tr>";
    }).catch(function (e) { el("lista-docs").innerHTML = "<tr><td colspan=\"6\">" + esc(e.message) + "</td></tr>"; });
  }

  function abrirDocForm(doc) {
    if (doc && doc.id && !doc.titulo) {
      api("/api/admin/documentos/" + doc.id).then(function (x) {
        abrirDocForm(x);
      }).catch(function (e) { alert(e.message); });
      return;
    }
    el("doc-titulo").value = doc ? doc.titulo : "";
    el("doc-ficheiro").value = doc ? doc.ficheiro : "";
    el("doc-tipo").value = doc ? (doc.tipo || "") : "";
    el("doc-entidade").value = doc ? (doc.entidade || "") : "";
    el("doc-ano").value = doc ? (doc.ano || "") : "";
    el("doc-categoria").value = doc ? (doc.categoria || "") : "";
    el("doc-status").value = doc ? (doc.status || "vigente") : "vigente";
    el("doc-id").value = doc ? doc.id : "";
    el("doc-upload").value = "";
    el("doc-form-title").textContent = doc ? "Editar documento" : "Novo documento (metadados)";
    el("doc-modal").style.display = "flex";
  }

  function fecharModais() {
    ["doc-modal", "not-modal", "act-modal", "membro-modal"].forEach(function (id) {
      var m = el(id); if (m) m.style.display = "none";
    });
    membroAberto = null;
  }

  function guardarDoc(ev) {
    ev.preventDefault();
    var id = el("doc-id").value;
    var f = el("doc-upload").files[0];
    var corpo = new FormData();
    var path, method;

    if (f && !id) {
      // Upload de PDF novo → pipeline OCR no backend (ficheiro = ficheiro), sem campo texto repetido
      path = "/api/admin/documentos/upload";
      method = "POST";
      corpo.append("ficheiro", f, f.name);
      corpo.append("titulo", el("doc-titulo").value.trim());
      corpo.append("tipo", el("doc-tipo").value.trim());
      corpo.append("entidade", el("doc-entidade").value.trim());
      corpo.append("ano", el("doc-ano").value.trim());
      corpo.append("categoria", el("doc-categoria").value.trim());
      corpo.append("status", el("doc-status").value);
    } else {
      // Metadados (criar sem PDF, ou editar)
      path = id ? ("/api/admin/documentos/" + id) : "/api/admin/documentos";
      method = id ? "PUT" : "POST";
      corpo.append("ficheiro", el("doc-ficheiro").value.trim());
      corpo.append("titulo", el("doc-titulo").value.trim());
      corpo.append("tipo", el("doc-tipo").value.trim());
      corpo.append("entidade", el("doc-entidade").value.trim());
      corpo.append("ano", el("doc-ano").value.trim());
      corpo.append("categoria", el("doc-categoria").value.trim());
      corpo.append("status", el("doc-status").value);
    }

    var url = API + path;
    fetch(url, { method: method, credentials: "include", body: corpo }).then(function (r) {
      return r.json().then(function (d) { if (!r.ok) throw new Error(d.detail || r.statusText); return d; });
    }).then(function () {
      fecharModais();
      carregarDocs();
      alert("Documento gravado. Lembre-se de 'Publicar'.");
    }).catch(function (e) { alert("Erro: " + e.message); });
  }

  function guardarDocMeta(ev) {
    ev.preventDefault();
    el("doc-submit").click();
  }

  // ----------------------------------------------------------- notícias

  function carregarNoticias() {
    api("/api/admin/noticias").then(function (d) {
      var h = "";
      d.noticias.forEach(function (x) {
        h += "<tr><td>" + esc(x.titulo) + "</td><td>" + esc(x.categoria) + "</td><td>" + esc(x.data) +
          "</td><td>" + (x.publicada ? "<span class=\"estado estado-ok\">publicada</span>" : "<span class=\"estado\">rascunho</span>") +
          "</td><td><button class=\"btn-mini\" data-accao=\"editar-not\" data-id=\"" + x.id + "\">Editar</button> " +
          "<button class=\"btn-mini perigo\" data-accao=\"apagar-not\" data-id=\"" + x.id + "\">Apagar</button></td></tr>";
      });
      el("lista-noticias").innerHTML = h || "<tr><td colspan=\"5\">Sem notícias.</td></tr>";
    }).catch(function (e) { el("lista-noticias").innerHTML = "<tr><td colspan=\"5\">" + esc(e.message) + "</td></tr>"; });
  }

  function abrirNotForm(n) {
    if (n) {
      api("/api/admin/noticias/" + n.id).then(function (x) {
        el("not-titulo").value = x.titulo;
        el("not-categoria").value = x.categoria;
        el("not-data").value = x.data;
        el("not-resumo").value = x.resumo;
        el("not-texto").value = x.texto;
        el("not-imagem").value = x.imagem;
        el("not-publicada").checked = x.publicada;
        el("not-id").value = x.id;
        el("not-modal").style.display = "flex";
      }).catch(function (e) { alert(e.message); });
    } else {
      el("not-titulo").value = ""; el("not-categoria").value = ""; el("not-data").value = "";
      el("not-resumo").value = ""; el("not-texto").value = ""; el("not-imagem").value = "";
      el("not-publicada").checked = true; el("not-id").value = "";
      el("not-modal").style.display = "flex";
    }
  }

  function guardarNot(ev) {
    ev.preventDefault();
    var id = el("not-id").value;
    var corpo = {
      titulo: el("not-titulo").value, categoria: el("not-categoria").value,
      data: el("not-data").value, resumo: el("not-resumo").value,
      texto: el("not-texto").value, imagem: el("not-imagem").value,
      publicada: el("not-publicada").checked
    };
    var path = id ? ("/api/admin/noticias/" + id) : "/api/admin/noticias";
    var method = id ? "PUT" : "POST";
    api(path, { method: method, body: corpo }).then(function () {
      fecharModais(); carregarNoticias();
      alert("Notícia gravada. Lembre-se de 'Publicar'.");
    }).catch(function (e) { alert("Erro: " + e.message); });
  }

  // -------------------------------------------------------- actividades

  function carregarActivs() {
    api("/api/admin/actividades").then(function (d) {
      var h = "";
      d.actividades.forEach(function (x) {
        h += "<tr><td>" + esc(x.titulo) + "</td><td>" + esc(x.categoria) + "</td><td>" + esc(x.data) +
          "</td><td>" + esc(x.local) + "</td><td>" + (x.destaque ? "★" : "") +
          "</td><td><button class=\"btn-mini\" data-accao=\"editar-act\" data-id=\"" + x.id + "\">Editar</button> " +
          "<button class=\"btn-mini perigo\" data-accao=\"apagar-act\" data-id=\"" + x.id + "\">Apagar</button></td></tr>";
      });
      el("lista-activs").innerHTML = h || "<tr><td colspan=\"6\">Sem actividades.</td></tr>";
    }).catch(function (e) { el("lista-activs").innerHTML = "<tr><td colspan=\"6\">" + esc(e.message) + "</td></tr>"; });
  }

  function abrirActForm(a) {
    if (!a) {
      el("act-titulo").value = ""; el("act-categoria").value = ""; el("act-data").value = "";
      el("act-local").value = ""; el("act-desc").value = ""; el("act-destaque").checked = false;
      el("act-capas").value = ""; el("act-docs").value = ""; el("act-id").value = "";
      el("act-modal").style.display = "flex";
    } else {
      api("/api/admin/actividades/" + a.id).then(function (x) {
        el("act-titulo").value = x.titulo; el("act-categoria").value = x.categoria;
        el("act-data").value = x.data; el("act-local").value = x.local;
        el("act-desc").value = x.descricao; el("act-destaque").checked = x.destaque;
        el("act-capas").value = x.capas.join(", "); el("act-docs").value = x.documentos.join(", ");
        el("act-id").value = x.id;
        el("act-modal").style.display = "flex";
      }).catch(function (e) { alert(e.message); });
    }
  }

  function guardarAct(ev) {
    ev.preventDefault();
    var id = el("act-id").value;
    var corpo = {
      titulo: el("act-titulo").value, categoria: el("act-categoria").value,
      data: el("act-data").value, local: el("act-local").value,
      descricao: el("act-desc").value, destaque: el("act-destaque").checked,
      capas: el("act-capas").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean),
      documentos: el("act-docs").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean)
    };
    var path = id ? ("/api/admin/actividades/" + id) : "/api/admin/actividades";
    var method = id ? "PUT" : "POST";
    api(path, { method: method, body: corpo }).then(function () {
      fecharModais(); carregarActivs();
      alert("Actividade gravada. Lembre-se de 'Publicar'.");
    }).catch(function (e) { alert("Erro: " + e.message); });
  }

  // ----------------------------------------------------------- mensagens

  function carregarMensagens() {
    api("/api/admin/mensagens").then(function (d) {
      var h = "";
      d.mensagens.forEach(function (x) {
        h += "<tr class=\"" + (x.lida ? "" : "nao-lida") + "\"><td>" + esc(x.nome) + "</td><td>" + esc(x.email) +
          "</td><td>" + esc(x.assunto) + "</td><td>" + esc(x.criado_em) + "</td>" +
          "<td><button class=\"btn-mini\" data-accao=\"ver-msg\" data-id=\"" + x.id + "\">Ver</button> " +
          "<button class=\"btn-mini perigo\" data-accao=\"apagar-msg\" data-id=\"" + x.id + "\">Apagar</button></td></tr>";
      });
      el("lista-mensagens").innerHTML = h || "<tr><td colspan=\"5\">Sem mensagens.</td></tr>";
    }).catch(function (e) { el("lista-mensagens").innerHTML = "<tr><td colspan=\"5\">" + esc(e.message) + "</td></tr>"; });
  }

  function verMsg(id, context) {
    var linhas = el("lista-mensagens").querySelectorAll("tr");
    var body = "";
    var nome = "", email = "", assunto = "";
    api("/api/admin/mensagens").then(function (d) {
      var m = d.mensagens.filter(function (x) { return x.id == id; })[0];
      if (m) {
        nome = m.nome; email = m.email; assunto = m.assunto; body = m.mensagem;
        api("/api/admin/mensagens/" + id + "/ler", { method: "POST" }).catch(function () {});
        alert("De: " + nome + " <" + email + ">\nAssunto: " + assunto + "\n\n" + body);
        carregarMensagens();
      }
    });
  }

  // ------------------------------------------------------------- membros

  var membroAberto = null;

  function carregarMembros() {
    api("/api/admin/membros").then(function (d) {
      var h = "";
      d.membros.forEach(function (x) {
        var acao = x.is_admin ? "" : (x.ativo
          ? "<button class=\"btn-mini perigo\" data-accao=\"rejeitar-membro\" data-id=\"" + x.id + "\">Desactivar</button>"
          : "<button class=\"btn-mini\" data-accao=\"aprovar-membro\" data-id=\"" + x.id + "\">Aprovar</button>");
        h += "<tr><td>" + esc(x.nome) + "</td><td>" + esc(x.carteira || "—") + "</td><td>" + esc(x.email) +
          "</td><td>" + esc(x.telefone || "—") + "</td><td>" + (x.is_admin ? "Admin" : "Membro") +
          "</td><td><span class=\"estado " + (x.ativo ? "estado-ok" : "") + "\">" + (x.ativo ? "activo" : "pendente") + "</span></td>" +
          "<td><button class=\"btn-mini\" data-accao=\"ver-membro\" data-id=\"" + x.id + "\">Ver</button> " + acao + "</td></tr>";
      });
      el("lista-membros").innerHTML = h || "<tr><td colspan=\"7\">Sem contas de membro.</td></tr>";
    }).catch(function (e) { el("lista-membros").innerHTML = "<tr><td colspan=\"7\">" + esc(e.message) + "</td></tr>"; });
  }

  function verMembro(id) {
    membroAberto = id;
    api("/api/admin/membros/" + id).then(function (d) {
      var m = d.membro || {};
      var p = d.registo_publico || {};
      var h = "<p><strong>" + esc(m.nome) + "</strong><br>" + esc(m.email) +
        "<br>Carteira: " + esc(m.carteira || "—") +
        "<br>Telefone: " + esc(m.telefone || "—") +
        "<br>Entidade: " + esc(m.entidade || "—") + "</p>";
      if (p.nome) {
        h += "<p style=\"font-size:.9rem\">Lista pública: " + esc(p.nome) +
          " · " + esc(p.situacao || "—") + " · " + esc(p.provincia || "—") +
          " · " + esc(p.delegacao || "—") + "</p>";
      }
      h += "<p>Estado: <span class=\"estado " + (m.ativo ? "estado-ok" : "") + "\">" +
        (m.ativo ? "activo" : "pendente") + "</span></p>";
      if (!m.ativo) {
        h += "<button class=\"btn-mini\" data-accao=\"aprovar-membro\" data-id=\"" + m.id + "\">Aprovar conta</button>";
      } else if (!m.is_admin) {
        h += "<button class=\"btn-mini perigo\" data-accao=\"rejeitar-membro\" data-id=\"" + m.id + "\">Desactivar conta</button>";
      }
      el("membro-detalhe").innerHTML = h;

      var q = "";
      (d.quotas || []).forEach(function (x) {
        q += "<p>Quota " + esc(x.ano) + " · " + esc(x.estado) + " · " +
          (x.valor ? esc(x.valor) + " MZN" : "valor a definir") +
          (x.data_pagamento ? " · paga em " + esc(x.data_pagamento) : "") + " ";
        if (x.estado !== "paga") {
          q += "<button class=\"btn-mini\" data-accao=\"pagar-quota\" data-id=\"" + x.id + "\">Marcar paga</button>";
        }
        q += "</p>";
      });
      el("membro-quotas").innerHTML = q || "<p>Sem quotas registadas.</p>";

      var r = "";
      (d.requerimentos || []).forEach(function (x) {
        r += "<p>" + esc(x.tipo) + " · " + esc(x.estado) + " · " + esc((x.criado_em || "").slice(0, 10)) + " ";
        if (x.estado === "em_analise") {
          r += "<button class=\"btn-mini\" data-accao=\"req-estado\" data-id=\"" + x.id + "\" data-estado=\"aprovado\">Aprovar</button> " +
            "<button class=\"btn-mini perigo\" data-accao=\"req-estado\" data-id=\"" + x.id + "\" data-estado=\"rejeitado\">Rejeitar</button>";
        }
        if (x.resposta) r += "<br><span style=\"color:var(--text-soft)\">" + esc(x.resposta) + "</span>";
        r += "</p>";
      });
      el("membro-reqs").innerHTML = r || "<p>Sem requerimentos.</p>";
      el("membro-modal").style.display = "flex";
    }).catch(function (e) { alert(e.message); });
  }

  // --------------------------------------------------- carregar galeria

  function carregarGaleria() {
    api("/api/admin/galeria").then(function (d) {
      var h = "";
      d.imagens.forEach(function (img) {
        h += "<img src=\"galeria/" + encodeURIComponent(img) + "\" title=\"" + esc(img) +
          "\" class=\"gal-mini\" onclick=\"CARREGAR_GALERIA_COPY('" + esc(img) + "')\">";
      });
      el("galeria-grelha").innerHTML = h || "<p>Sem imagens na galeria.</p>";
    }).catch(function (e) { el("galeria-grelha").textContent = "Erro: " + e.message; });
  }

  // --------------------------------------------------------- accões gerais

  function apagar(path, tipo) {
    if (!confirm("Apagar " + tipo + "?")) return;
    api(path, { method: "DELETE" }).then(function () {
      alert(tipo + " apagado.");
      carregarDocs(); carregarNoticias(); carregarActivs(); carregarMensagens();
    }).catch(function (e) { alert("Erro: " + e.message); });
  }

  document.addEventListener("click", function (e) {
    var alvo = e.target;
    if (alvo.tagName !== "BUTTON") return;
    var accao = alvo.getAttribute("data-accao");
    var id = alvo.getAttribute("data-id");

    if (alvo.getAttribute("data-seccao")) { ativa(alvo.getAttribute("data-seccao")); return; }

    if (!accao) return;
    if (accao === "novo-doc") { abrirDocForm(null); }
    else if (accao === "editar-doc") { abrirDocForm({ id: id }); }
    else if (accao === "apagar-doc") { apagar("/api/admin/documentos/" + id, "documento"); }
    else if (accao === "nova-not") { abrirNotForm(null); }
    else if (accao === "editar-not") { abrirNotForm({ id: id }); }
    else if (accao === "apagar-not") { apagar("/api/admin/noticias/" + id, "notícia"); }
    else if (accao === "nova-act") { abrirActForm(null); }
    else if (accao === "editar-act") { abrirActForm({ id: id }); }
    else if (accao === "apagar-act") { apagar("/api/admin/actividades/" + id, "actividade"); }
    else if (accao === "ver-msg") { verMsg(id); }
    else if (accao === "apagar-msg") { apagar("/api/admin/mensagens/" + id, "mensagem"); }
    else if (accao === "ver-membro") { verMembro(id); }
    else if (accao === "aprovar-membro") {
      api("/api/admin/membros/" + id + "/aprovar", { method: "POST" }).then(function () {
        alert("Conta aprovada."); carregarMembros(); carregarDashboard();
        if (String(membroAberto) === String(id)) verMembro(id);
      }).catch(function (e) { alert("Erro: " + e.message); });
    }
    else if (accao === "rejeitar-membro") {
      if (!confirm("Desactivar esta conta de membro?")) return;
      api("/api/admin/membros/" + id + "/rejeitar", { method: "POST" }).then(function () {
        alert("Conta desactivada."); carregarMembros(); carregarDashboard();
        if (String(membroAberto) === String(id)) verMembro(id);
      }).catch(function (e) { alert("Erro: " + e.message); });
    }
    else if (accao === "pagar-quota") {
      if (!confirm("Marcar esta quota como paga?")) return;
      api("/api/admin/quotas/" + id + "/pagar", { method: "POST" }).then(function () {
        alert("Quota marcada como paga.");
        if (membroAberto) verMembro(membroAberto);
      }).catch(function (e) { alert("Erro: " + e.message); });
    }
    else if (accao === "req-estado") {
      var estado = alvo.getAttribute("data-estado");
      var resposta = prompt("Resposta ao membro (opcional):", "");
      if (resposta === null) return;
      api("/api/admin/requerimentos/" + id + "/estado", {
        method: "POST", body: { estado: estado, resposta: resposta }
      }).then(function () {
        alert("Requerimento actualizado.");
        if (membroAberto) verMembro(membroAberto);
      }).catch(function (e) { alert("Erro: " + e.message); });
    }
    else if (accao === "publicar") { publicar(); }
    else if (accao === "logout") { logout(); }
    else if (accao === "fechar-modal") { fecharModais(); }
  });

  // --------------------------------------------------------- iniciação

  window.CARREGAR_GALERIA_COPY = function (img) {
    if (navigator.clipboard) navigator.clipboard.writeText(img).then(function () {
      alert("Nome copiado: " + img);
    });
  };

  window.addEventListener("DOMContentLoaded", function () {
    [["form-login", login], ["form-doc", guardarDoc], ["form-not", guardarNot], ["form-act", guardarAct]]
      .forEach(function (f) {
        var form = el(f[0]);
        if (form) form.addEventListener("submit", f[1]);
      });
    var m = el("login-msg"); if (m) m.textContent = "";

    if (sessionStorage.getItem("cda_admin") === "1") {
      // A marca em sessionStorage só evita o flash do login; a sessão real é
      // sempre confirmada no backend (o cookie pode ter expirado ou sido apagado).
      api("/api/auth/me").then(function (me) {
        if (me && me.is_admin) { entrar(); }
        else { sessionStorage.removeItem("cda_admin"); mostraLogin(); }
      }).catch(function () { sessionStorage.removeItem("cda_admin"); mostraLogin(); });
      return;
    }
    // tenta sessão existente
    api("/api/auth/me").then(function (me) {
      if (me.is_admin) { entrar(); } else { mostraLogin(); }
    }).catch(function () { mostraLogin(); });
  });

  // liga botoes de seccao
  window.addEventListener("DOMContentLoaded", function () {
    var botoes = document.querySelectorAll("[data-seccao]");
    botoes.forEach(function (b) {
      b.addEventListener("click", function () {
        if (["documentos", "noticias", "actividades", "mensagens", "membros"].indexOf(b.getAttribute("data-seccao")) >= 0) {
          if (b.getAttribute("data-seccao") === "documentos") carregarDocs();
          if (b.getAttribute("data-seccao") === "noticias") carregarNoticias();
          if (b.getAttribute("data-seccao") === "actividades") carregarActivs();
          if (b.getAttribute("data-seccao") === "mensagens") carregarMensagens();
          if (b.getAttribute("data-seccao") === "membros") carregarMembros();
        }
        ativa(b.getAttribute("data-seccao"));
      });
    });
    var gal = el("nav-galeria");
    if (gal) gal.addEventListener("click", function () { carregarGaleria(); });
  });
})();

/* Área do Membro CDA — sessão, registo validado por carteira, quotas e requerimentos.
   Consome a API FastAPI (CDA_API_BASE). Sem dependências externas. */
(function () {
  "use strict";

  var API = (typeof CDA_API_BASE !== "undefined" && CDA_API_BASE) || "";
  var ESTADOS = {
    paga: "Paga", em_atraso: "Em atraso", pendente: "Pendente", isenta: "Isenta",
    em_analise: "Em análise", aprovado: "Aprovado", rejeitado: "Rejeitado"
  };

  function el(id) { return document.getElementById(id); }

  function api(path, opts) {
    opts = opts || {};
    opts.credentials = "include";
    opts.headers = Object.assign({ "Accept": "application/json" }, opts.headers || {});
    if (opts.body && typeof opts.body === "object") {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.body);
    }
    return fetch(API + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) {
          var erro = new Error(d.detail || ("Erro HTTP " + r.status));
          erro.status = r.status;
          throw erro;
        }
        return d;
      });
    });
  }

  function limpar(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function dataCurta(valor) {
    if (!valor) return "";
    var s = String(valor).slice(0, 10).split("-");
    return s.length === 3 ? s[2] + "/" + s[1] + "/" + s[0] : String(valor);
  }

  function classeEstado(estado) {
    if (estado === "paga" || estado === "aprovado" || estado === "activa") return "estado estado-ok";
    if (estado === "em_atraso" || estado === "rejeitado") return "estado estado-atrasado";
    return "estado";
  }

  function mostrarMsg(tipo, texto) {
    var caixa = el("membro-msg");
    if (!caixa) return;
    caixa.hidden = false;
    caixa.className = "callout " + (tipo === "erro" ? "callout--danger" : "callout--ok");
    caixa.textContent = texto;
  }

  function esconderMsg() {
    var caixa = el("membro-msg");
    if (caixa) { caixa.hidden = true; caixa.textContent = ""; }
  }

  function avisoServico(mostrar) {
    var aviso = el("servico-aviso");
    if (aviso) aviso.hidden = !mostrar;
  }

  function mostrarLogin() {
    el("login-view").style.display = "";
    el("dash-view").style.display = "none";
  }

  function mostrarDash() {
    el("login-view").style.display = "none";
    el("dash-view").style.display = "";
  }

  function adicionarLinha(container, rotulo, valor) {
    if (!valor) return;
    var p = document.createElement("p");
    p.style.margin = "2px 0";
    var b = document.createElement("strong");
    b.textContent = rotulo + ": ";
    p.appendChild(b);
    p.appendChild(document.createTextNode(valor));
    container.appendChild(p);
  }

  function renderQuotas(quotas) {
    var caixa = el("dash-quotas");
    var badge = el("dash-quota-estado");
    limpar(caixa);
    if (!quotas || !quotas.length) {
      caixa.textContent = "Sem quotas registadas. A CDA indicará o valor em falta.";
      badge.textContent = "—";
      badge.className = "estado";
      return;
    }
    var atraso = 0;
    quotas.forEach(function (q) {
      if (q.estado === "em_atraso") atraso++;
      var p = document.createElement("p");
      p.style.margin = "4px 0";
      var valor = q.valor ? q.valor + " MZN" : "valor a definir";
      var estado = ESTADOS[q.estado] || q.estado;
      p.textContent = "Quota " + q.ano + ": " + estado + " · " + valor +
        (q.data_pagamento ? " · paga em " + dataCurta(q.data_pagamento) : "");
      caixa.appendChild(p);
    });
    badge.textContent = atraso ? atraso + " em atraso" : "Sem atrasos";
    badge.className = classeEstado(atraso ? "em_atraso" : "paga");
  }

  function renderRequerimentos(reqs) {
    var caixa = el("dash-reqs");
    var badge = el("dash-req-estado");
    limpar(caixa);
    if (!reqs || !reqs.length) {
      caixa.textContent = "Ainda não submeteu requerimentos.";
      badge.textContent = "—";
      badge.className = "estado";
      return;
    }
    var abertos = 0;
    reqs.forEach(function (r) {
      if (r.estado === "em_analise") abertos++;
      var p = document.createElement("p");
      p.style.margin = "6px 0";
      var estado = ESTADOS[r.estado] || r.estado;
      p.textContent = r.tipo + " · " + estado +
        (r.criado_em ? " · " + dataCurta(r.criado_em) : "");
      if (r.resposta) p.textContent += " — " + r.resposta;
      caixa.appendChild(p);
    });
    badge.textContent = abertos ? abertos + " em análise" : "Sem pendentes";
    badge.className = classeEstado(abertos ? "em_analise" : "aprovado");
  }

  function renderResumo(dados) {
    var m = dados.membro || {};
    var publico = dados.registo_publico || {};
    var primeiro = (m.nome || "membro").split(/\s+/)[0];
    el("dash-nome").textContent = "Olá, " + primeiro;
    el("dash-sub").textContent = m.email + (m.carteira ? " · Carteira " + m.carteira : "");

    var estado = el("dash-estado");
    var activo = publico.activo !== false;
    estado.textContent = activo ? "Activa" : "Inactiva";
    estado.className = classeEstado(activo ? "activa" : "em_atraso");

    var carteira = el("dash-carteira");
    if (m.carteira) {
      carteira.textContent = "N.º " + m.carteira + (publico.nCarta ? " · Cédula " + publico.nCarta : "");
    } else {
      carteira.textContent = "Conta sem carteira associada.";
    }

    var info = el("dash-publico");
    limpar(info);
    if (publico.nome) {
      adicionarLinha(info, "Titular", publico.nome);
      adicionarLinha(info, "Situação", publico.situacao);
      adicionarLinha(info, "Província", publico.provincia);
      adicionarLinha(info, "Delegação", publico.delegacao);
      adicionarLinha(info, "Empresa", publico.empresa);
    } else if (m.is_admin) {
      info.textContent = "Conta de administração. Use o painel admin para gerir o portal.";
    }

    renderQuotas(dados.quotas);
    renderRequerimentos(dados.requerimentos);
  }

  function carregarResumo() {
    return api("/api/membro/resumo").then(function (d) {
      avisoServico(false);
      mostrarDash();
      renderResumo(d);
    }).catch(function (e) {
      if (e.status === 401) {
        mostrarLogin();
      } else {
        avisoServico(true);
        mostrarMsg("erro", "Não foi possível carregar a área de membro: " + e.message);
      }
    });
  }

  function registar(ev) {
    ev.preventDefault();
    esconderMsg();
    var dados = {
      nome: el("r-nome").value.trim(),
      carteira: el("r-carteira").value.trim(),
      email: el("r-email").value.trim(),
      entidade: el("r-entidade").value.trim(),
      telefone: el("r-telefone").value.trim(),
      senha: el("r-senha").value
    };
    var msg = el("registo-msg");
    msg.textContent = "A validar a carteira…";
    api("/api/auth/registar", { method: "POST", body: dados }).then(function (d) {
      msg.textContent = d.mensagem || "Conta criada. Aguarda aprovação.";
      msg.style.color = "var(--green, #1d6b3a)";
      el("form-registo").reset();
    }).catch(function (e) {
      msg.textContent = e.message;
      msg.style.color = "var(--red)";
    });
  }

  function entrar(ev) {
    ev.preventDefault();
    esconderMsg();
    var aviso = el("login-aviso");
    aviso.textContent = "";
    var dados = { email: el("l-user").value.trim(), senha: el("l-pass").value };
    api("/api/auth/login", { method: "POST", body: dados }).then(function () {
      el("form-login").reset();
      return carregarResumo();
    }).catch(function (e) {
      aviso.textContent = e.message;
      if (e.status === 403) aviso.textContent = e.message;
    });
  }

  function terminarSessao() {
    api("/api/auth/logout", { method: "POST" }).catch(function () {}).then(function () {
      mostrarLogin();
      esconderMsg();
      el("dash-view").style.display = "none";
    });
  }

  function novoRequerimento(ev) {
    ev.preventDefault();
    esconderMsg();
    var tipo = el("req-tipo").value;
    var desc = el("req-desc").value.trim();
    if (!tipo) { mostrarMsg("erro", "Seleccione o tipo de requerimento."); return; }
    api("/api/membro/requerimentos", { method: "POST", body: { tipo: tipo, descricao: desc } })
      .then(function () {
        el("form-requerimento").reset();
        mostrarMsg("ok", "Requerimento submetido. A CDA irá analisá-lo.");
        return carregarResumo();
      })
      .catch(function (e) { mostrarMsg("erro", e.message); });
  }

  function iniciar() {
    var login = el("form-login");
    var registo = el("form-registo");
    var req = el("form-requerimento");
    var sair = el("btn-logout");
    var ajuda = el("btn-quota-ajuda");
    if (!login || !registo) return;

    login.addEventListener("submit", entrar);
    registo.addEventListener("submit", registar);
    if (req) req.addEventListener("submit", novoRequerimento);
    if (sair) sair.addEventListener("click", terminarSessao);
    if (ajuda) ajuda.addEventListener("click", function () {
      window.alert("O pagamento de quotas é tratado nos serviços da CDA (M-Pesa ou referência bancária). Contacte a sede ou a delegação para obter a referência actualizada.");
    });

    api("/api/status").then(function () {
      avisoServico(false);
      return api("/api/auth/me").then(function (me) {
        if (me && me.ativo) return carregarResumo();
        mostrarLogin();
      });
    }).catch(function (e) {
      if (e.status === 401) {
        avisoServico(false);
        mostrarLogin();
      } else {
        avisoServico(true);
        mostrarLogin();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();

/* CDA Digital 2.0 — Tabs acessíveis (padrão WAI-ARIA "Tabs")
   ------------------------------------------------------------------
   Contrato com site/css/sistema.css (secção TABS):
     .tabs > .tabs__list[role=tablist] > .tabs__btn[role=tab]
     .tabs__panel[role=tabpanel] (um por tab, ligado por aria-controls)
     [aria-selected="true"]  → sublinhado vermelho + font-weight 800 (só CSS)
     .tabs__panel[hidden]    → display:none (só CSS)

   Comportamento (APG Tabs — activação automática):
     - roving tabindex: só a tab activa tem tabindex="0", as restantes -1;
     - ← / → mudam de tab com WRAP-AROUND e activam-na (foco acompanha);
     - Home / End vão para a primeira / última tab;
     - click activa a tab;
     - aria-selected + [hidden] do painel são sempre actualizados em conjunto;
     - o estado inicial vem do HTML (aria-selected="true"); sem nenhum marcado,
       activa a primeira tab.

   Sem módulos ES (o site carrega <script src> sem type="module"), sem
   dependências externas, tudo numa IIFE. Inicia após DOMContentLoaded. */
(function () {
  "use strict";

  // Activa a tab `indice` dentro do grupo: aria-selected + tabindex (roving)
  // + visibilidade do painel correspondente (aria-controls).
  function activar(botoes, indice, moverFoco) {
    for (var i = 0; i < botoes.length; i++) {
      var activa = i === indice;
      botoes[i].setAttribute("aria-selected", activa ? "true" : "false");
      botoes[i].tabIndex = activa ? 0 : -1;

      var painelId = botoes[i].getAttribute("aria-controls");
      var painel = painelId ? document.getElementById(painelId) : null;
      if (painel) painel.hidden = !activa;
    }
    if (moverFoco && botoes[indice]) botoes[indice].focus();
  }

  // Prepara um único grupo .tabs (idempotente — data-tabs-init="1").
  function prepararGrupo(grupo) {
    if (grupo.getAttribute("data-tabs-init") === "1") return;

    var lista = grupo.querySelector('[role="tablist"]');
    var botoes = lista ? lista.querySelectorAll('[role="tab"]') : [];
    if (!botoes.length) return; // sem tabs → nada a fazer, sem erros
    botoes = Array.prototype.slice.call(botoes);

    // Estado inicial: o marcado no HTML; se nenhum, a primeira tab.
    var inicial = 0;
    for (var i = 0; i < botoes.length; i++) {
      if (botoes[i].getAttribute("aria-selected") === "true") { inicial = i; break; }
    }
    activar(botoes, inicial, false);

    for (var j = 0; j < botoes.length; j++) {
      (function (indice) {
        botoes[indice].addEventListener("click", function () {
          activar(botoes, indice, false);
        });
        botoes[indice].addEventListener("keydown", function (ev) {
          var alvo = -1;
          switch (ev.key) {
            case "ArrowRight": case "Right": alvo = (indice + 1) % botoes.length; break;
            case "ArrowLeft":  case "Left":  alvo = (indice - 1 + botoes.length) % botoes.length; break;
            case "Home": alvo = 0; break;
            case "End":  alvo = botoes.length - 1; break;
            default: return; // outra tecla → deixa o browser tratar
          }
          ev.preventDefault();
          activar(botoes, alvo, true); // activação automática: foco + painel
        });
      })(j);
    }

    grupo.setAttribute("data-tabs-init", "1");
  }

  function prepararTodos() {
    var grupos = document.querySelectorAll(".tabs");
    for (var i = 0; i < grupos.length; i++) prepararGrupo(grupos[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", prepararTodos);
  } else {
    prepararTodos();
  }
})();

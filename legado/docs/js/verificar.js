/* Verificação de membros — página verificar.html.
   Usa exclusivamente a lista pública data/membros.json. */
(function () {
  "use strict";

  var MAX_SUGESTOES = 8;
  var MAX_RESULTADOS = 12;
  var membros = [];
  var membrosCarregados = false;
  var cargaFalhou = false;
  var sugestoes = [];
  var indiceActivo = -1;
  var input, listaSugestoes, dica, resultado, formulario;

  var comparador = typeof Intl !== "undefined" && Intl.Collator
    ? new Intl.Collator("pt", { sensitivity: "base", numeric: true })
    : null;

  function el(id) { return document.getElementById(id); }

  function normaliza(valor) {
    return String(valor == null ? "" : valor).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function compararNomes(a, b) {
    if (comparador) return comparador.compare(a, b);
    return String(a).localeCompare(String(b));
  }

  function carregarMembros() {
    var fonte = window.CDA_MEMBROS;
    if (fonte && typeof fonte.carregar === "function") {
      return Promise.resolve().then(function () { return fonte.carregar(); });
    }
    return fetch("data/membros.json").then(function (resposta) {
      if (!resposta.ok) throw new Error("HTTP " + resposta.status);
      return resposta.json();
    });
  }

  function actualizarDica(texto) {
    if (dica) dica.textContent = texto;
  }

  function fecharSugestoes() {
    if (!listaSugestoes || !input) return;
    listaSugestoes.hidden = true;
    listaSugestoes.textContent = "";
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    sugestoes = [];
    indiceActivo = -1;
  }

  function definirActivo(indice) {
    var opcoes = listaSugestoes.querySelectorAll('[role="option"]');
    if (!opcoes.length) return;
    indiceActivo = (indice + opcoes.length) % opcoes.length;
    Array.prototype.forEach.call(opcoes, function (opcao, i) {
      opcao.setAttribute("aria-selected", i === indiceActivo ? "true" : "false");
    });
    input.setAttribute("aria-activedescendant", opcoes[indiceActivo].id);
    if (typeof opcoes[indiceActivo].scrollIntoView === "function") {
      opcoes[indiceActivo].scrollIntoView({ block: "nearest" });
    }
  }

  function seleccionarSugestao(indice) {
    var membro = sugestoes[indice];
    if (!membro) return;
    input.value = membro.nome;
    fecharSugestoes();
    actualizarDica("Nome seleccionado. Clique em «Verificar Membro» para consultar.");
    input.focus();
  }

  function criarOpcao(membro, indice) {
    var opcao = document.createElement("li");
    opcao.id = "member-option-" + indice;
    opcao.setAttribute("role", "option");
    opcao.setAttribute("aria-selected", "false");
    opcao.setAttribute("data-index", String(indice));

    var nome = document.createElement("span");
    nome.className = "member-suggestion__name";
    nome.textContent = membro.nome;
    opcao.appendChild(nome);

    if (membro.nCarta) {
      var carteira = document.createElement("small");
      carteira.className = "member-suggestion__card";
      carteira.textContent = membro.nCarta;
      opcao.appendChild(carteira);
    }
    return opcao;
  }

  function actualizarSugestoes() {
    if (!membrosCarregados || !input || !listaSugestoes) return;
    var termo = normaliza(input.value);
    fecharSugestoes();

    if (termo.length < 2) {
      actualizarDica("Escreva pelo menos 2 caracteres para ver sugestões.");
      return;
    }

    var encontradas = membros.filter(function (membro) {
      return normaliza(membro.nome).indexOf(termo) !== -1;
    });
    sugestoes = encontradas.slice(0, MAX_SUGESTOES);

    if (!sugestoes.length) {
      actualizarDica(/[0-9]/.test(termo)
        ? "Sem nomes correspondentes. Pode pesquisar pelo número da carteira profissional."
        : "Não foram encontrados nomes correspondentes.");
      return;
    }

    sugestoes.forEach(function (membro, indice) {
      listaSugestoes.appendChild(criarOpcao(membro, indice));
    });
    listaSugestoes.hidden = false;
    input.setAttribute("aria-expanded", "true");

    if (encontradas.length > MAX_SUGESTOES) {
      actualizarDica("A mostrar " + MAX_SUGESTOES + " de " + encontradas.length + " sugestões. Continue a escrever para refinar.");
    } else {
      actualizarDica(encontradas.length + (encontradas.length === 1 ? " sugestão de membro." : " sugestões de membros.") + " Use as setas para escolher.");
    }
  }

  function mostrarEstado(titulo, mensagem) {
    resultado.textContent = "";
    var estado = document.createElement("div");
    estado.className = "empty-state";

    var icone = document.createElement("div");
    icone.className = "empty-state__icon";
    icone.setAttribute("aria-hidden", "true");
    icone.textContent = "⌕";

    var cabecalho = document.createElement("h3");
    cabecalho.textContent = titulo;
    var paragrafo = document.createElement("p");
    paragrafo.textContent = mensagem;
    estado.appendChild(icone);
    estado.appendChild(cabecalho);
    estado.appendChild(paragrafo);
    resultado.appendChild(estado);
  }

  function adicionarDado(lista, rotulo, valor) {
    if (valor == null || String(valor).trim() === "") return;
    var item = document.createElement("div");
    var termo = document.createElement("dt");
    termo.textContent = rotulo;
    var definicao = document.createElement("dd");
    definicao.textContent = String(valor);
    item.appendChild(termo);
    item.appendChild(definicao);
    lista.appendChild(item);
  }

  function mostrarResultado(membro) {
    fecharSugestoes();
    input.value = membro.nome;
    resultado.textContent = "";

    var cartao = document.createElement("article");
    cartao.className = "card member-result";
    var corpo = document.createElement("div");
    corpo.className = "card__body";

    var selo = document.createElement("span");
    if (typeof membro.activo === "boolean") {
      selo.className = "badge " + (membro.activo ? "badge--green" : "badge--amber");
      selo.textContent = membro.activo ? "Membro activo" : "Membro inactivo";
    } else {
      selo.className = "badge badge--outline";
      selo.textContent = "Estado não indicado na lista";
    }
    corpo.appendChild(selo);

    var nome = document.createElement("h3");
    nome.textContent = membro.nome;
    corpo.appendChild(nome);

    var dados = document.createElement("dl");
    dados.className = "member-result__details";
    adicionarDado(dados, "N.º de carteira profissional", membro.nCarta);
    adicionarDado(dados, "Empresa", membro.empresa);
    adicionarDado(dados, "Situação", membro.situacao);
    adicionarDado(dados, "Província", membro.provincia);
    adicionarDado(dados, "Delegação", membro.delegacao);
    corpo.appendChild(dados);

    var nota = document.createElement("p");
    nota.className = "text-xs text-muted mt-4";
    nota.textContent = "Informação apresentada conforme a lista pública de membros da CDA.";
    corpo.appendChild(nota);

    cartao.appendChild(corpo);
    resultado.appendChild(cartao);
    actualizarDica("Consulta concluída. Pode pesquisar outro membro.");
  }

  function mostrarResultados(lista) {
    fecharSugestoes();
    resultado.textContent = "";

    var cabecalho = document.createElement("h3");
    cabecalho.textContent = "Foram encontrados " + lista.length + (lista.length === 1 ? " membro" : " membros") + ". Seleccione um nome para consultar.";
    resultado.appendChild(cabecalho);

    var opcoes = document.createElement("ul");
    opcoes.className = "member-result__choices";
    lista.slice(0, MAX_RESULTADOS).forEach(function (membro) {
      var item = document.createElement("li");
      var botao = document.createElement("button");
      botao.type = "button";
      botao.className = "member-result__choice";

      var nome = document.createElement("span");
      nome.className = "member-result__choice-name";
      nome.textContent = membro.nome;
      botao.appendChild(nome);
      if (membro.nCarta) {
        var carteira = document.createElement("small");
        carteira.className = "member-result__choice-card";
        carteira.textContent = "Carteira profissional: " + membro.nCarta;
        botao.appendChild(carteira);
      }

      botao.addEventListener("click", function () { mostrarResultado(membro); });
      item.appendChild(botao);
      opcoes.appendChild(item);
    });
    resultado.appendChild(opcoes);

    if (lista.length > MAX_RESULTADOS) {
      var nota = document.createElement("p");
      nota.className = "hint";
      nota.textContent = "A mostrar os primeiros " + MAX_RESULTADOS + " resultados. Continue a escrever para refinar a pesquisa.";
      resultado.appendChild(nota);
    }
    actualizarDica("Seleccione um dos resultados para ver os dados disponíveis.");
  }

  function pesquisar(termo) {
    var consulta = normaliza(termo);
    var exactos = membros.filter(function (membro) {
      return normaliza(membro.nome) === consulta || normaliza(membro.nCarta) === consulta;
    });
    if (exactos.length) return exactos;
    return membros.filter(function (membro) {
      return normaliza(membro.nome).indexOf(consulta) !== -1 ||
        normaliza(membro.nCarta).indexOf(consulta) !== -1;
    });
  }

  function submeter(evento) {
    evento.preventDefault();
    fecharSugestoes();
    var termo = input.value.trim();

    if (!termo) {
      mostrarEstado("Introduza um nome", "Escreva o nome ou o número da carteira profissional de um membro.");
      input.focus();
      return;
    }
    if (cargaFalhou) {
      mostrarEstado("Lista indisponível", "A lista pública de membros não pôde ser carregada. Tente novamente mais tarde.");
      return;
    }
    if (!membrosCarregados) {
      mostrarEstado("A carregar a lista", "Aguarde um momento e tente novamente.");
      return;
    }
    if (normaliza(termo).length < 2) {
      mostrarEstado("Pesquisa curta", "Escreva pelo menos dois caracteres do nome ou do número de carteira.");
      input.focus();
      return;
    }

    var encontrados = pesquisar(termo);
    if (!encontrados.length) {
      mostrarEstado("Nenhum membro encontrado", "Não foi encontrado um membro correspondente a «" + termo + "» na lista pública da CDA.");
    } else if (encontrados.length === 1) {
      mostrarResultado(encontrados[0]);
    } else {
      mostrarResultados(encontrados);
    }
  }

  function iniciar() {
    formulario = el("verify-form");
    if (!formulario) return;
    input = el("verify-code");
    listaSugestoes = el("member-suggestions");
    dica = el("verify-hint");
    resultado = el("verify-resultado");
    if (!input || !listaSugestoes || !resultado) return;

    formulario.addEventListener("submit", submeter);
    input.addEventListener("input", actualizarSugestoes);
    input.addEventListener("blur", function () {
      window.setTimeout(fecharSugestoes, 120);
    });
    input.addEventListener("keydown", function (evento) {
      if (evento.key === "ArrowDown") {
        if (listaSugestoes.hidden) actualizarSugestoes();
        if (sugestoes.length) {
          evento.preventDefault();
          definirActivo(indiceActivo + 1);
        }
      } else if (evento.key === "ArrowUp") {
        if (listaSugestoes.hidden) actualizarSugestoes();
        if (sugestoes.length) {
          evento.preventDefault();
          definirActivo(indiceActivo < 0 ? sugestoes.length - 1 : indiceActivo - 1);
        }
      } else if (evento.key === "Enter" && !listaSugestoes.hidden && indiceActivo >= 0) {
        evento.preventDefault();
        seleccionarSugestao(indiceActivo);
      } else if (evento.key === "Escape" && !listaSugestoes.hidden) {
        evento.preventDefault();
        fecharSugestoes();
      } else if (evento.key === "Tab") {
        fecharSugestoes();
      }
    });

    listaSugestoes.addEventListener("pointerdown", function (evento) {
      if (evento.target.closest('[role="option"]')) evento.preventDefault();
    });
    listaSugestoes.addEventListener("click", function (evento) {
      var opcao = evento.target.closest('[role="option"]');
      if (!opcao) return;
      seleccionarSugestao(parseInt(opcao.getAttribute("data-index"), 10));
    });
    listaSugestoes.addEventListener("pointerover", function (evento) {
      var opcao = evento.target.closest('[role="option"]');
      if (opcao) definirActivo(parseInt(opcao.getAttribute("data-index"), 10));
    });

    actualizarDica("A carregar a lista pública de membros…");
    carregarMembros().then(function (dados) {
      if (!Array.isArray(dados)) throw new Error("A resposta não contém uma lista de membros.");
      membros = dados.filter(function (membro) {
        return membro && typeof membro.nome === "string" && membro.nome.trim();
      }).slice().sort(function (a, b) { return compararNomes(a.nome, b.nome); });
      membrosCarregados = true;

      if (!membros.length) {
        actualizarDica("A lista pública de membros não contém registos disponíveis.");
        mostrarEstado("Sem dados disponíveis", "Não há registos de membros para consultar neste momento.");
        return;
      }
      actualizarDica("Escreva pelo menos 2 caracteres para ver sugestões.");
      if (input.value.trim()) actualizarSugestoes();
    }).catch(function () {
      cargaFalhou = true;
      actualizarDica("A lista pública de membros não está disponível neste momento.");
      mostrarEstado("Lista indisponível", "Não foi possível carregar a lista pública de membros. Tente novamente mais tarde.");
    });
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();

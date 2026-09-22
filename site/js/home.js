/* CDA Digital 2.0 — Hero fotográfico editorial (homepage)
   Fundo alimentado automaticamente por CDA.ACTIVIDADES: cada diagnóstico
   mostra a fotografia de capa de uma actividade real, com overlay azul,
   mini-caption "CDA em Actividade" e navegação manual. */
(function () {
  "use strict";

  var ACT = (typeof CDA !== "undefined" && CDA.ACTIVIDADES) || [];
  var slidesEl = document.getElementById("hero-slides");
  var dotsEl = document.getElementById("hero-dots");
  var capTit = document.getElementById("hero-foot-tit");
  var capMeta = document.getElementById("hero-foot-meta");
  var capLink = document.getElementById("hero-foot-link");
  var foot = document.getElementById("hero-foot-cap");
  var prevBtn = document.getElementById("hero-prev");
  var nextBtn = document.getElementById("hero-next");

  if (!slidesEl || ACT.length < 1) return;

  var ord = ACT.slice().sort(function (a, b) {
    return b.data.localeCompare(a.data);
  });
  var cur = 0;
  var timer = null;
  var DELAY = 6000;

  // Versão HD (1400px) em galeria/hd/ — evita upscale da thumb 400px no hero
  function imgSrc(nome) {
    var base = String(nome).replace(/\.[a-z0-9]+$/i, "");
    return "galeria/hd/" + base + ".jpg";
  }

  function metaTexto(a) {
    var out = [];
    if (a.categoria) out.push(a.categoria);
    if (a.local) out.push(a.local);
    return out.join(" · ");
  }

  // Constrói as camadas de fundo (uma por actividade)
  ord.forEach(function (a, i) {
    var capa = (a.capas && a.capas[0]) || "";
    if (!capa) return;
    var s = document.createElement("div");
    s.className = "hero-slide";
    s.style.backgroundImage = "url('" + imgSrc(capa) + "')";
    if (i === 0) s.classList.add("active");
    slidesEl.appendChild(s);

    var d = document.createElement("button");
    d.type = "button";
    d.className = "hero-dot" + (i === 0 ? " active" : "");
    d.setAttribute("role", "tab");
    d.setAttribute("aria-label", "Actividade " + (i + 1));
    d.addEventListener("click", function () { irPara(i); });
    dotsEl.appendChild(d);
  });

  var slides = slidesEl.children;
  var dots = dotsEl.children;

  function go() {
    for (var i = 0; i < slides.length; i++) {
      slides[i].classList.toggle("active", i === cur);
      slides[i].classList.toggle("zoom", i === cur);
      dots[i].classList.toggle("active", i === cur);
    }
    var a = ord[cur];
    if (capTit) capTit.textContent = a.titulo;
    if (capMeta) capMeta.textContent = metaTexto(a);
    if (capLink) capLink.href = "actividades.html";
  }

  function irPara(i) {
    cur = (i + ord.length) % ord.length;
    go();
    reiniciar();
  }

  function avancar() { irPara(cur + 1); }
  function recuar() { irPara(cur - 1); }

  function reiniciar() {
    if (timer) clearTimeout(timer);
    if (!foot || !foot.classList.contains("paused")) {
      timer = setTimeout(avancar, DELAY);
    }
  }

  if (prevBtn) prevBtn.addEventListener("click", recuar);
  if (nextBtn) nextBtn.addEventListener("click", avancar);

  if (foot) {
    foot.addEventListener("mouseenter", function () {
      foot.classList.add("paused");
      if (timer) clearTimeout(timer);
    });
    foot.addEventListener("mouseleave", function () {
      foot.classList.remove("paused");
      reiniciar();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { avancar(); }
    else if (e.key === "ArrowLeft") { recuar(); }
  });

  go();
  reiniciar();
})();

/* CDA Digital 2.0 — Portal institucional (inspiração cta.org.mz)
   Bloco 2: Flash de notícias (ticker), Actualidade dinâmica e contadores.
   Tudo alimentado por CDA.NOTICIAS / CDA.MEMBROS de js/dados.js. */
(function () {
  "use strict";

  if (typeof CDA === "undefined") return;

  // Ordena notícias por data (mais recente primeiro), excluindo conteúdo de teste
  function noticiasOrdenadas() {
    var lista = (CDA.NOTICIAS || []).filter(function (n) {
      return !/teste/i.test(n.titulo || "");
    });
    return lista.sort(function (a, b) {
      return String(b.data).localeCompare(String(a.data));
    });
  }

  // Formata "2026-01-28" -> "28-01-2026"
  function dataCurta(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return iso || "";
    return p[2] + "-" + p[1] + "-" + p[0];
  }

  // 1) FLASH CDA — barra de notícias contínua (marquee simples)
  var flashEl = document.getElementById("flash-cda");
  var track = document.getElementById("flash-track");
  if (flashEl && track) {
    var recentes = noticiasOrdenadas().slice(0, 6);
    if (recentes.length > 0) {
      // flex: 0 0 auto — impede o encolhimento flex dos itens (texto nunca comprimido,
      // garantindo que o conteúdo excede a largura e o marquee pode correr).
      recentes.forEach(function (n) {
        var a = document.createElement("a");
        a.href = "noticias.html";
        a.style.flex = "0 0 auto";
        a.textContent = n.titulo + "  ·  " + dataCurta(n.data);
        track.appendChild(a);
      });

      // Largura real de um conjunto (medida antes de duplicar, com itens não encolhidos)
      var largura = track.scrollWidth;

      // Só anima se o conteúdo exceder a largura visível da pista
      if (largura > track.clientWidth) {
        // Duplica o conteúdo para um loop contínuo sem quebra visível
        Array.prototype.slice.call(track.children).forEach(function (item) {
          track.appendChild(item.cloneNode(true));
        });

        var delta = 0;
        var ativo = true;
        flashEl.addEventListener("mouseenter", function () { ativo = false; });
        flashEl.addEventListener("mouseleave", function () { ativo = true; });
        (function passo() {
          if (ativo) {
            delta += 1;
            if (delta >= largura) delta = 0;
            track.scrollLeft = delta;
          }
          window.requestAnimationFrame(passo);
        })();
      }
    }
  }

  // 2) ACTUALIDADE — as 3 notícias mais recentes em #news-list
  var newsList = document.getElementById("news-list");
  if (newsList) {
    var top3 = noticiasOrdenadas().slice(0, 3);
    top3.forEach(function (n) {
      var artigo = document.createElement("article");
      artigo.className = "news-card";

      // Se a notícia tiver imagem, é colocada no topo/esquerda do card
      if (n.imagem) {
        var img = document.createElement("img");
        img.className = "news-card-img";
        img.src = n.imagem;
        img.alt = n.titulo || "";
        img.loading = "lazy";
        // "foco" (opcional, por notícia) ajusta object-position quando a
        // convenção global center 30% corta o assunto (ex.: retratos).
        if (n.foco) { img.style.objectPosition = n.foco; }
        artigo.appendChild(img);
      }

      var corpo = document.createElement("div");
      corpo.className = "corpo";

      var data = document.createElement("span");
      data.className = "data";
      data.textContent = n.data || "";

      var cat = document.createElement("span");
      cat.className = "cat";
      cat.textContent = n.categoria || "";

      var h3 = document.createElement("h3");
      h3.textContent = n.titulo || "";

      var p = document.createElement("p");
      var texto = n.texto || "";
      p.textContent = texto.length > 140 ? texto.slice(0, 137) + "…" : texto;

      var ler = document.createElement("a");
      ler.className = "ler";
      ler.href = "noticias.html";
      ler.textContent = "Ler mais";

      corpo.appendChild(data);
      corpo.appendChild(cat);
      corpo.appendChild(h3);
      corpo.appendChild(p);
      corpo.appendChild(ler);
      artigo.appendChild(corpo);
      newsList.appendChild(artigo);
    });
  }

  // 3) Contador de membros real
  var membrosCount = document.getElementById("membros-count");
  if (membrosCount && CDA.MEMBROS && CDA.MEMBROS.length) {
    membrosCount.textContent = String(CDA.MEMBROS.length);
  }

  // 4) NEWSLETTER — subscrição simples (feedback local, sem backend)
  var nlForm = document.getElementById("newsletter-form");
  var nlOk = document.getElementById("newsletter-ok");
  if (nlForm) {
    nlForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = document.getElementById("newsletter-email");
      var valor = (em && em.value || "").trim();
      if (valor && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valor)) {
        em.value = "";
        if (nlOk) nlOk.hidden = false;
        try { localStorage.setItem("cda-newsletter", valor); } catch (_) {}
      } else {
        em.focus();
        em.style.borderColor = "#ff6b6b";
      }
    });
  }

  // 5) PARCEIROS — carrossel contínuo de instituições parceiras
  var parceirosTrack = document.querySelector(".parceiros-track");
  if (parceirosTrack) {
    // Todos os itens mostram LOGO + NOME juntos (logo img com alt + span com o nome)
    var parceiros = [
      { tipo: "logo", src: "img/parceiros/at.png", nome: "Autoridade Tributária de Moçambique" },
      { tipo: "logo", src: "img/parceiros/alfandegas-fallback.svg", nome: "Alfândegas de Moçambique" },
      { tipo: "logo", src: "img/parceiros/mef.png", nome: "Ministério da Economia e Finanças" },
      { tipo: "logo", src: "img/parceiros/mic.png", nome: "Ministério da Indústria e Comércio" },
      { tipo: "logo", src: "img/parceiros/cta.png", nome: "Confederação das Associações Económicas (CTA)" },
      { tipo: "logo", src: "img/parceiros/ccm-fallback.svg", nome: "Câmara de Comércio de Moçambique" },
      { tipo: "logo", src: "img/parceiros/apiex.png", nome: "Agência para a Promoção de Investimentos e Exportações (APIEX)" },
      { tipo: "logo", src: "img/parceiros/igeze-fallback.svg", nome: "Instituto de Gestão de Zonas Económicas Especiais (IGEZE)" },
      { tipo: "logo", src: "img/parceiros/jue-fallback.svg", nome: "Janela Única Electrónica (JUE)" },
      { tipo: "logo", src: "img/parceiros/asapra-fallback.svg", nome: "ASAPRA" },
      { tipo: "logo", src: "img/parceiros/fiata.svg", nome: "FIATA" },
      { tipo: "logo", src: "img/parceiros/wco.png", nome: "Organização Mundial das Alfândegas (OMA/WCO)" },
      { tipo: "logo", src: "img/parceiros/bancomoc.png", nome: "Banco de Moçambique" }
    ];
    parceiros.forEach(function (p) {
      var item = document.createElement("span");
      item.className = "parceiros-item parceiros-item-logo";
      var img = document.createElement("img");
      img.className = "parceiros-item-img";
      img.src = p.src;
      img.alt = p.nome;
      img.loading = "lazy";
      var nome = document.createElement("span");
      nome.className = "parceiros-item-nome";
      nome.textContent = p.nome;
      item.appendChild(img);
      item.appendChild(nome);
      parceirosTrack.appendChild(item);
    });
    // Duplica para loop contínuo (animation translateX -50%)
    Array.prototype.slice.call(parceirosTrack.children).forEach(function (item) {
      parceirosTrack.appendChild(item.cloneNode(true));
    });
  }

  // 6) CONTADOR DE VISITAS — persistência local simples
  var visitEl = document.getElementById("visit-count");
  if (visitEl) {
    var n = 0;
    try { n = parseInt(localStorage.getItem("cda-visitas") || "0", 10) || 0; } catch (_) {}
    n += 1;
    try { localStorage.setItem("cda-visitas", String(n)); } catch (_) {}
    visitEl.textContent = String(n);
  }
})();

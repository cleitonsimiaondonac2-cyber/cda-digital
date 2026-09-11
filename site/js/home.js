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

  function imgSrc(nome) { return "galeria/" + nome; }

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
      recentes.forEach(function (n) {
        var a = document.createElement("a");
        a.href = "noticias.html";
        a.textContent = n.titulo + "  ·  " + dataCurta(n.data);
        track.appendChild(a);
      });

      // Se o conteúdo ultrapassar a largura, anima com scroll horizontal contínuo
      var largura = track.scrollWidth;
      var contentor = flashEl;
      if (largura > contentor.clientWidth) {
        var delta = 0;
        var ativo = true;
        contentor.addEventListener("mouseenter", function () { ativo = false; });
        contentor.addEventListener("mouseleave", function () { ativo = true; });
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
})();

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

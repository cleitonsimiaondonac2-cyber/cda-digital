/* CDA Digital — homepage institucional
   Carrossel editorial de notícias, grelha Flash de Notícias, acessos laterais,
   actividades e carrossel de parceiros. Conteúdo sempre proveniente de dados.js.
   --------------------------------------------------------------------------- */
(function () {
  "use strict";

  var ACT = (typeof CDA !== "undefined" && Array.isArray(CDA.ACTIVIDADES)) ? CDA.ACTIVIDADES : [];
  var ALL_NEWS = (typeof CDA !== "undefined" && Array.isArray(CDA.NOTICIAS)) ? CDA.NOTICIAS : [];
  var reduzido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function imgSrc(nome) {
    var s = String(nome || "");
    if (!s) return "";
    if (s.indexOf("/") !== -1) return s;
    return "galeria/hd/" + s.replace(/\.[a-z0-9]+$/i, "") + ".jpg";
  }

  function dataPT(iso) {
    var p = String(iso || "").split("-");
    return p.length === 3 ? p[2] + "-" + p[1] + "-" + p[0] : String(iso || "");
  }

  function noticiasOrdenadas() {
    return ALL_NEWS.filter(function (n) {
      return !/teste/i.test(n.titulo || "");
    }).slice().sort(function (a, b) {
      var ra = a.relevancia || 0, rb = b.relevancia || 0;
      if (ra !== rb) return rb - ra;
      return String(b.data).localeCompare(String(a.data));
    });
  }

  function noticiasHref(n) {
    var i = ALL_NEWS.indexOf(n);
    return i >= 0 ? "noticias.html#noticia-" + i : "noticias.html";
  }

  function actividadesOrdenadas() {
    return ACT.slice().sort(function (a, b) {
      var ra = a.relevancia || 0, rb = b.relevancia || 0;
      if (ra !== rb) return rb - ra;
      return String(b.data).localeCompare(String(a.data));
    });
  }

  var noticias = noticiasOrdenadas();

  /* ---- 1. Carrossel editorial de notícias ------------------------------ */
  var slidesEl = document.getElementById("hero-slides");
  var dotsEl = document.getElementById("hero-dots");
  var capTit = document.getElementById("hero-foot-tit");
  var capMeta = document.getElementById("hero-foot-meta");
  var capLink = document.getElementById("hero-foot-link");
  var imageLink = document.getElementById("hero-image-link");
  var capCategory = document.getElementById("hero-category");
  var prevBtn = document.getElementById("hero-prev");
  var nextBtn = document.getElementById("hero-next");
  var pauseBtn = document.getElementById("hero-pause");
  var heroSec = document.querySelector(".home-hero");

  var destaqueNews = noticias.filter(function (n) { return !!n.imagem; }).slice(0, 5);
  if (slidesEl && dotsEl && destaqueNews.length) {
    var cur = 0;
    var timer = null;
    var pausadoUtilizador = false;
    var pausadoHover = false;
    var DELAY = 6500;

    destaqueNews.forEach(function (n, i) {
      var img = document.createElement("img");
      img.src = n.imagem;
      img.alt = ""; // O título visível da notícia identifica o mesmo conteúdo.
      img.decoding = "async";
      img.loading = i === 0 ? "eager" : "lazy";
      img.id = "hero-slide-" + i;
      img.className = i === 0 ? "is-active" : "";
      img.setAttribute("aria-hidden", i === 0 ? "false" : "true");
      slidesEl.appendChild(img);

      var d = document.createElement("button");
      d.type = "button";
      d.className = "hero-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      d.setAttribute("aria-controls", img.id);
      d.setAttribute("aria-label", "Ver notícia: " + (n.titulo || "destaque"));
      d.addEventListener("click", function () { irPara(i); });
      dotsEl.appendChild(d);
    });

    var slides = slidesEl.children;
    var dots = dotsEl.children;

    function pintar() {
      for (var i = 0; i < slides.length; i++) {
        var ativo = i === cur;
        slides[i].classList.toggle("is-active", ativo);
        slides[i].setAttribute("aria-hidden", ativo ? "false" : "true");
        dots[i].classList.toggle("active", ativo);
        dots[i].setAttribute("aria-pressed", ativo ? "true" : "false");
      }
      var n = destaqueNews[cur];
      var href = noticiasHref(n);
      var titulo = n.titulo || "Notícia da CDA";
      if (capTit) capTit.textContent = titulo;
      if (capMeta) capMeta.textContent = dataPT(n.data);
      if (capCategory) capCategory.textContent = n.categoria || "Em destaque";
      if (capLink) capLink.href = href;
      if (imageLink) {
        imageLink.href = href;
        imageLink.setAttribute("aria-label", "Abrir notícia: " + titulo);
      }
    }

    function agendar() {
      if (timer) clearTimeout(timer);
      if (pausadoUtilizador || pausadoHover || reduzido || destaqueNews.length < 2) return;
      timer = setTimeout(function () { irPara(cur + 1); }, DELAY);
    }

    function irPara(i) {
      cur = (i + destaqueNews.length) % destaqueNews.length;
      pintar();
      agendar();
    }

    function atualizarPausa() {
      if (!pauseBtn) return;
      pauseBtn.setAttribute("aria-pressed", pausadoUtilizador ? "true" : "false");
      pauseBtn.setAttribute("aria-label", pausadoUtilizador ? "Retomar rotação" : "Pausar rotação");
      pauseBtn.textContent = pausadoUtilizador ? "▶" : "❙❙";
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { irPara(cur - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { irPara(cur + 1); });

    if (pauseBtn) {
      if (reduzido || destaqueNews.length < 2) {
        pauseBtn.hidden = true;
      } else {
        pauseBtn.addEventListener("click", function () {
          pausadoUtilizador = !pausadoUtilizador;
          atualizarPausa();
          agendar();
        });
      }
    }

    var media = document.querySelector(".home-hero__media");
    if (media) {
      media.addEventListener("mouseenter", function () { pausadoHover = true; agendar(); });
      media.addEventListener("mouseleave", function () { pausadoHover = false; agendar(); });
      media.addEventListener("focusin", function () { pausadoHover = true; agendar(); });
      media.addEventListener("focusout", function () { pausadoHover = false; agendar(); });
    }

    if (heroSec) {
      heroSec.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); irPara(cur + 1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); irPara(cur - 1); }
      });
    }

    dotsEl.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var passo = e.key === "ArrowRight" ? 1 : -1;
      var alvo = (cur + passo + destaqueNews.length) % destaqueNews.length;
      irPara(alvo);
      dots[alvo].focus();
    });

    pintar();
    agendar();
  }

  /* ---- 2. Flash de Notícias -------------------------------------------- */
  var newsList = document.getElementById("news-list");
  if (newsList) {
    noticias.slice(0, 6).forEach(function (n) {
      var href = noticiasHref(n);
      var artigo = document.createElement("article");
      artigo.className = "news-card";

      if (n.imagem) {
        var img = document.createElement("img");
        img.className = "news-card-img";
        img.src = n.imagem;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        if (n.foco) img.style.objectPosition = n.foco;
        artigo.appendChild(img);
      }

      var corpo = document.createElement("div");
      corpo.className = "corpo";

      var data = document.createElement("span");
      data.className = "data";
      data.textContent = dataPT(n.data);

      var cat = document.createElement("span");
      cat.className = "cat";
      cat.textContent = n.categoria || "";

      var h3 = document.createElement("h3");
      var titulo = document.createElement("a");
      titulo.href = href;
      titulo.textContent = n.titulo || "Notícia da CDA";
      h3.appendChild(titulo);

      var p = document.createElement("p");
      var texto = n.texto || "";
      if (texto.length > 150) {
        texto = texto.slice(0, 150).replace(/\s+\S*$/, "") + "…";
      }
      p.textContent = texto;

      var ler = document.createElement("a");
      ler.className = "ler";
      ler.href = href;
      ler.textContent = "Ler notícia →";

      corpo.appendChild(data);
      if (cat.textContent) corpo.appendChild(cat);
      corpo.appendChild(h3);
      if (texto) corpo.appendChild(p);
      corpo.appendChild(ler);
      artigo.appendChild(corpo);
      newsList.appendChild(artigo);
    });
  }

  /* ---- 3. CDA em Actividade (3 reais) ----------------------------------- */
  var actEl = document.getElementById("home-actividades");
  if (actEl) {
    actividadesOrdenadas().filter(function (a) {
      return a.capas && a.capas[0];
    }).slice(0, 3).forEach(function (a) {
      var card = document.createElement("a");
      card.className = "home-act";
      card.href = "actividades.html";

      var img = document.createElement("img");
      img.src = imgSrc(a.capas[0]);
      img.alt = a.titulo || "";
      img.loading = "lazy";
      img.decoding = "async";
      card.appendChild(img);

      var corpo = document.createElement("div");
      corpo.className = "home-act__body";

      var cat = document.createElement("span");
      cat.className = "home-act__cat";
      cat.textContent = a.categoria || "Actividade";

      var h3 = document.createElement("h3");
      h3.textContent = a.titulo || "";

      var meta = document.createElement("span");
      meta.className = "home-act__meta";
      meta.textContent = [dataPT(a.data), a.local].filter(Boolean).join(" · ");

      corpo.appendChild(cat);
      corpo.appendChild(h3);
      corpo.appendChild(meta);
      card.appendChild(corpo);
      actEl.appendChild(card);
    });
  }

  /* ---- 4. Centro Documental: contagens ---------------------------------- */
  // Um único mapa tipo→categoria. As quatro categorias somam o acervo inteiro.
  var CATEGORIAS = {
    legislacao: ["Lei", "Decreto", "Estatuto"],
    circulares: ["Circular"],
    regulamentos: ["Regulamento", "Ordem de Serviço"],
    publicacoes: ["Boletim", "Convocatória", "Relatório", "Comunicado", "Outro"]
  };

  function contarAcervo() {
    if (!window.fetch) return;
    fetch("data/documentos.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (docs) {
        if (!Array.isArray(docs) || !docs.length) return;
        var total = 0;
        Object.keys(CATEGORIAS).forEach(function (cat) {
          var n = docs.filter(function (d) {
            return CATEGORIAS[cat].indexOf(d.tipo) !== -1;
          }).length;
          var alvo = document.querySelector('[data-doc-cat="' + cat + '"]');
          if (alvo) alvo.textContent = String(n);
          total += n;
        });
        var totalEl = document.getElementById("doc-count");
        if (totalEl) totalEl.textContent = String(total);
      })
      .catch(function () { /* mantém os valores do HTML */ });
  }
  contarAcervo();

  /* ---- 5. Membros ------------------------------------------------------- */
  var membrosCount = document.getElementById("membros-count");
  if (membrosCount && window.CDA_MEMBROS) {
    window.CDA_MEMBROS.carregar().then(function (lista) {
      if (lista.length) membrosCount.textContent = String(lista.length);
    }).catch(function () { /* sem fonte: fica o placeholder */ });
  }

  /* ---- 6. Newsletter (feedback local) ----------------------------------- */
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
        em.style.borderColor = "var(--cda-primary)";
      }
    });
  }

  /* ---- 7. Parceiros (grelha estática: nenhum logo cortado) ------------- */
  var parceirosTrack = document.getElementById("parceiros-track");
  if (parceirosTrack) {
    var parceiros = [
      { src: "img/parceiros/at.png", nome: "Autoridade Tributária de Moçambique" },
      { src: "img/parceiros/alfandegas-fallback.svg", nome: "Alfândegas de Moçambique" },
      { src: "img/parceiros/mef.png", nome: "Ministério da Economia e Finanças" },
      { src: "img/parceiros/mic.png", nome: "Ministério da Indústria e Comércio" },
      { src: "img/parceiros/cta.png", nome: "Confederação das Associações Económicas (CTA)" },
      { src: "img/parceiros/ccm-fallback.svg", nome: "Câmara de Comércio de Moçambique" },
      { src: "img/parceiros/apiex.png", nome: "Agência para a Promoção de Investimentos e Exportações (APIEX)" },
      { src: "img/parceiros/igeze-fallback.svg", nome: "Instituto de Gestão de Zonas Económicas Especiais (IGEZE)" },
      { src: "img/parceiros/jue-fallback.svg", nome: "Janela Única Electrónica (JUE)" },
      { src: "img/parceiros/asapra-fallback.svg", nome: "ASAPRA" },
      { src: "img/parceiros/fiata.svg", nome: "FIATA" },
      { src: "img/parceiros/wco.png", nome: "Organização Mundial das Alfândegas (OMA/WCO)" },
      { src: "img/parceiros/bancomoc.png", nome: "Banco de Moçambique" }
    ];
    function criarParceiro(p) {
      var item = document.createElement("span");
      item.className = "parceiros-item parceiros-item-logo";
      var img = document.createElement("img");
      img.className = "parceiros-item-img";
      img.src = p.src;
      img.alt = p.nome;
      img.loading = "eager";
      img.decoding = "async";
      var nome = document.createElement("span");
      nome.className = "parceiros-item-nome";
      nome.textContent = p.nome;
      item.appendChild(img);
      item.appendChild(nome);
      return item;
    }
    // Lista duplicada para um ciclo contínuo e sem falhas.
    parceiros.forEach(function (p) { parceirosTrack.appendChild(criarParceiro(p)); });
    parceiros.forEach(function (p) { parceirosTrack.appendChild(criarParceiro(p)); });

    var pausa = document.getElementById("parceiros-pausa");
    if (pausa) {
      pausa.addEventListener("click", function () {
        var parado = parceirosTrack.classList.toggle("is-pausado");
        pausa.textContent = parado ? "Retomar animação" : "Pausar animação";
        pausa.setAttribute("aria-pressed", parado ? "true" : "false");
      });
    }
  }

  // ---------- Sidebar da homepage: publicações e eventos ----------
  (function () {
    var sidePubs = document.getElementById("side-pubs");
    var sideEvents = document.getElementById("side-events");

    if (sidePubs && typeof CDA !== "undefined" && Array.isArray(CDA.DOCUMENTOS)) {
      var recRecent = CDA.DOCUMENTOS.slice().sort(function (a, b) {
        var ay = parseInt(a.ano, 10) || 0;
        var by = parseInt(b.ano, 10) || 0;
        if (by !== ay) return by - ay;
        return String(a.titulo).localeCompare(String(b.titulo));
      }).slice(0, 8);
      recRecent.forEach(function (d) {
        var a = document.createElement("a");
        a.className = "side-pub";
        a.href = d.ficheiro ? ("docs/" + d.ficheiro) : "documentacao.html";
        if (d.ficheiro) { a.target = "_blank"; a.rel = "noopener"; }
        var bEl = document.createElement("b");
        bEl.textContent = d.titulo;
        var sp = document.createElement("span");
        sp.textContent = [d.tipo, d.ano, d.emissor].filter(Boolean).join(" · ") || "Documento institucional";
        a.appendChild(bEl);
        a.appendChild(sp);
        sidePubs.appendChild(a);
      });
      if (!sidePubs.children.length) {
        var v = document.createElement("p");
        v.style.cssText = "font-size:12px;color:var(--cda-ink-500);margin:0";
        v.textContent = "O acervo completo está no Centro Documental.";
        sidePubs.appendChild(v);
      }
    }

    if (sideEvents && typeof CDA !== "undefined" && Array.isArray(CDA.ACTIVIDADES)) {
      CDA.ACTIVIDADES.slice()
        .sort(function (a, b) { return String(b.data).localeCompare(String(a.data)); })
        .slice(0, 5)
        .forEach(function (a) {
          var item = document.createElement("div");
          item.className = "side-event";
          var parts = String(a.data).split("-");
          var itemLink = document.createElement("a");
          var flex = document.createElement("div");
          var data = document.createElement("div");
          data.className = "side-event__data";
          var dia = document.createElement("strong");
          dia.textContent = parts[2] || "—";
          data.appendChild(dia);
          data.appendChild(document.createTextNode(parts[1] || ""));
          flex.appendChild(data);
          var p = document.createElement("p");
          var title = document.createElement("b");
          title.style.display = "block";
          title.textContent = a.titulo;
          p.appendChild(title);
          p.appendChild(document.createTextNode(a.local ? " · " + a.local : ""));
          flex.appendChild(p);
          itemLink.href = "actividades.html";
          itemLink.appendChild(flex);
          item.appendChild(itemLink);
          sideEvents.appendChild(item);
        });
      if (!sideEvents.children.length) {
        var v2 = document.createElement("p");
        v2.style.cssText = "font-size:12px;color:var(--cda-ink-500);margin:0";
        v2.textContent = "Actividades em breve.";
        sideEvents.appendChild(v2);
      }
    }
  })();
})();


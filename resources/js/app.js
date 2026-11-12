// Autor: Leonardo (leonardoaderito-cmyk) - interaccoes da pagina inicial

// Carrossel de destaques com rotacao automatica
document.querySelectorAll('[data-carrossel]').forEach((el) => {
    const slides = el.querySelectorAll('[data-slide]');
    const pontos = el.querySelectorAll('[data-ponto]');
    if (slides.length < 2) return;
    let atual = 0;
    let temporizador;

    const mostrar = (i) => {
        atual = (i + slides.length) % slides.length;
        slides.forEach((s, n) => s.classList.toggle('slide-activo', n === atual));
        pontos.forEach((p, n) => p.classList.toggle('ponto-activo', n === atual));
    };
    const iniciar = () => { temporizador = setInterval(() => mostrar(atual + 1), 6000); };
    const parar = () => clearInterval(temporizador);

    pontos.forEach((p, n) => p.addEventListener('click', () => mostrar(n)));
    el.querySelector('[data-anterior]')?.addEventListener('click', () => mostrar(atual - 1));
    el.querySelector('[data-seguinte]')?.addEventListener('click', () => mostrar(atual + 1));
    el.addEventListener('mouseenter', parar);
    el.addEventListener('mouseleave', iniciar);
    mostrar(0);
    iniciar();
});

// Contadores animados quando entram no ecra
const contadores = document.querySelectorAll('[data-contador]');
if (contadores.length) {
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
            if (!e.isIntersecting) return;
            observador.unobserve(e.target);
            const alvo = parseInt(e.target.dataset.contador, 10) || 0;
            const inicio = performance.now();
            const passo = (agora) => {
                const t = Math.min((agora - inicio) / 1200, 1);
                e.target.textContent = Math.round(alvo * t);
                if (t < 1) requestAnimationFrame(passo);
            };
            requestAnimationFrame(passo);
        });
    });
    contadores.forEach((c) => observador.observe(c));
}

// Revelar blocos ao fazer scroll
const revelar = document.querySelectorAll('[data-revelar]');
if (revelar.length) {
    const obs = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add('revelado'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.1 });
    revelar.forEach((r) => obs.observe(r));
}

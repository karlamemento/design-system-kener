/* ════════════════════════════════════════════════════════════════════
   KENER — MOTOR DE MOVIMIENTO (kener-motion.js)
   Proyecto: Rediseño web Laboratorios Kener · Memento Studio
   ════════════════════════════════════════════════════════════════════
   Sin dependencias. Requiere el script inline del <head> que añade
   html.js-motion (y html.k-intro en la primera visita de la sesión).

   MÓDULOS
     1. Intro de marca        → telón con logotipo, solo 1 vez por sesión
     2. Smooth scroll         → inercia suave con rueda (solo escritorio)
     3. Split text            → titulares que suben palabra por palabra
     4. Revelados al scroll   → fade / rise / line / mask, con escalonado
     5. Secuencia del hero    → coreografía de entrada de la portada
     6. Loop de scroll        → header inteligente, progreso, parallax,
                                timeline
     7. Botones magnéticos y spotlight en tarjetas
     8. Hélice de ADN de fondo que gira con el scroll

   CÓMO EXTENDERLO
     - Cualquier elemento con  data-reveal="fade|rise|line|mask"  se anima
       al entrar en pantalla. data-delay="200" fija un retraso en ms.
     - Cualquier elemento con  data-parallax="0.08"  se desplaza con el
       scroll (valores negativos = dirección contraria).
     - Ajustes globales en CONFIG.
   ════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !root.classList.contains('js-motion')) return;

  window.KenerMotion = { version: '1.0.0' };

  const CONFIG = {
    smoothScroll: true,       // inercia de rueda en escritorio
    smoothEase: 0.11,         // 0.06 = muy fluido · 0.2 = casi nativo
    introMin: 650,            // ms mínimos de intro
    introMax: 1200,           // ms máximos: ya no espera a imágenes ni video
    staggerStep: 110,         // ms entre elementos que entran juntos
    magneticStrength: 0.22,
    headerHide: false,        // false = el header queda siempre visible (decisión 20/11/2026)
    headerHideAfter: 420      // px de scroll antes de ocultar el header (solo si headerHide: true)
  };

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const wait = ms => new Promise(r => setTimeout(r, ms));


  /* ── 3. SPLIT TEXT ───────────────────────────────────────────────── */
  function splitWords(el) {
    if (el.classList.contains('k-split')) return;
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          if (!parts.some(p => p.trim())) return;
          const frag = document.createDocumentFragment();
          parts.forEach(part => {
            if (!part) return;
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            const wi = document.createElement('span');
            w.className = 'k-w';
            wi.className = 'k-wi';
            wi.style.setProperty('--i', Math.min(i++, 22));
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && !/^(BR|IMG|SVG|I)$/i.test(child.tagName)) {
          walk(child);
        }
      });
    };
    walk(el);
    el.classList.add('k-split');
  }


  /* ── 4. REVELADOS ────────────────────────────────────────────────── */
  const pendingTransitions = [];
  const markReveal = (els, type = 'rise') => {
    els.forEach(el => {
      if (!el || el.dataset.reveal) return;
      el.dataset.reveal = type;
      el.style.transition = 'none';           // el estado oculto se aplica al instante (sin "fade-out")
      if (type !== 'mask') el.classList.add('reveal-on-scroll');
      pendingTransitions.push(el);
    });
  };

  // Mapa de qué se anima en la página. Selectores genéricos: funcionan
  // también en especialidades.html y páginas internas.
  function tagElements() {
    // Titulares
    $$('.hero h1, main section h2').forEach(splitWords);

    // Eyebrows
    markReveal($$('.eyebrow'), 'line');

    // Párrafos introductorios y botones de cierre de sección
    markReveal($$('.hero-video-content p'), 'blur');
    markReveal($$('.hero-video-content .d-flex.flex-wrap > .btn'), 'pop');
    markReveal($$('.hero .col-lg-6 > img, .hero .col-lg-6 > picture'), 'soft');
    markReveal($$('.hero p, .hero .d-flex.flex-wrap').filter(el => !el.closest('.hero-video-content')));
    markReveal($$('main section .container-xxl > p, main section .k-lead, .contact-info > p'));
    markReveal($$('main section .text-center.mt-5'));

    // Marcos fotográficos
    markReveal($$('.hero .frame, .team-photo, .photo-frame'), 'mask');

    // Chips flotantes del hero
    markReveal($$('.hero .glass-card, .hero-scroll-cue, .hero-video-toggle'), 'fade');

    // Bloques y tarjetas (se anima la columna, no la tarjeta, para no
    // interferir con el hover)
    markReveal($$('#sec-certificaciones .card-rounded-white'));
    markReveal($$('#sec-certificaciones .row-cols-md-4 > .col'), 'fade');
    markReveal($$('#sec-confianza .row > .col'));
    markReveal($$('#sec-video .row > [class*="col-"]'));
    markReveal($$('#sec-especialidades .row > [class*="col-"]'));
    markReveal($$('#logros .row > [class*="col-"], .logo-marquee-container'));
    markReveal($$('#quienes-somos .value'));
    markReveal($$('.cta-cat .row > *'));
    markReveal($$('#prensa .row > [class*="col-"], #eventos .row > [class*="col-"]'));
    markReveal($$('.contact-info .contact-item'));
    markReveal($$('#sitemap-footer .row > .col'));
    markReveal($$('.k-footer .row > *'), 'fade');

    // Cualquier otra tarjeta en páginas internas
    markReveal($$('main .k-card:not([data-reveal]), main .esp-row').filter(el => !el.closest('[data-reveal]')));

    // Parallax
    const setPx = (sel, v) => $$(sel).forEach(el => { if (!el.dataset.parallax) el.dataset.parallax = v; });
    setPx('.hero .col-6:first-child .frame', '0.05');
    setPx('.hero .col-6:last-child .frame', '-0.04');
    setPx('.hero .glass-card', '0.1');
    setPx('.hero-dna', '0.18');
    setPx('.hero-video-media', '0.16');       // el video se desplaza más lento que la página
    setPx('.hero-video-content', '0.07');
    $$('.team-photo > img').forEach(img => { if (!img.dataset.parallax) img.dataset.parallax = '0.07'; });

    // Micro-interacciones
    if (finePointer) {
      $$('.hero .btn, .cta-cat .btn, main .text-center.mt-5 .btn, .k-nav .btn-gradient, .k-form .btn-primary')
        .forEach(b => b.classList.add('k-magnetic'));
      $$('.k-card, .card-secondary, .stat, .finder').forEach(c => c.classList.add('k-spot'));
    }

    // Forzar el cálculo del estado oculto y devolver las transiciones
    void document.body.offsetHeight;
    pendingTransitions.forEach(el => el.style.removeProperty('transition'));
    root.classList.add('k-motion-ready');      // libera el pre-ocultado del hero (CSS)
  }

  // Al terminar un revelado genérico se retiran las clases para que los
  // hovers originales recuperen su transición sin retraso.
  function finishReveal(el) {
    if (el.dataset.reveal === 'mask' || el.classList.contains('k-split')) return;
    const delay = parseFloat(el.style.getPropertyValue('--reveal-delay')) || 0;
    setTimeout(() => {
      el.classList.remove('reveal-on-scroll', 'is-visible');
      el.style.removeProperty('--reveal-delay');
      el.dataset.revealed = 'true';
    }, delay + 1100);
  }

  function show(el, delay) {
    if (el.dataset.shown) return;            // cada elemento se revela una sola vez
    el.dataset.shown = '1';
    if (el.dataset.delay) delay = +el.dataset.delay;
    if (el.classList.contains('k-split')) el.style.setProperty('--split-delay', `${delay}ms`);
    else el.style.setProperty('--reveal-delay', `${delay}ms`);
    // doble rAF: garantiza que el estado inicial ya se pintó
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add('is-visible');
      finishReveal(el);
    }));
  }

  let observer;
  function observeReveals() {
    observer = new IntersectionObserver(entries => {
      // Lo que entra en el mismo cuadro se escalona por posición en pantalla
      const visibles = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) ||
                        (a.boundingClientRect.left - b.boundingClientRect.left));
      visibles.forEach((entry, idx) => {
        observer.unobserve(entry.target);
        show(entry.target, idx * CONFIG.staggerStep);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    $$('[data-reveal], .k-split').forEach(el => {
      if (!el.closest('.hero')) observer.observe(el);
    });
  }


  /* ── 5. SECUENCIA DEL HERO ───────────────────────────────────────── */
  function playHero() {
    const hero = $('.hero');
    if (!hero) return;
    hero.classList.add('is-entered');          // hero v2: el video se asienta (scale 1.1 → 1)
    const seq = [
      // Hero v2 (video)
      ['.hero-video-content .eyebrow', 0],
      ['.hero-video-content h1', 100],
      ['.hero-video-content p', 450],
      ['.hero-video-content .btn:first-child', 650],
      ['.hero-video-content .btn:last-child', 740],
      ['.hero-video-toggle', 950],
      ['.hero-scroll-cue', 1050],
      // Hero de páginas internas / Hero v1
      ['.eyebrow', 0],
      ['h1', 100],
      ['.col-lg-6 > img', 250],
      ['.col-6:first-child .frame', 150],
      ['.col-6:last-child .frame', 320],
      ['.col-lg-6 > p', 450],
      ['.d-flex.flex-wrap', 650],
      ['.glass-card.t-top', 900],
      ['.glass-card.t-bot', 1050]
    ];
    seq.forEach(([sel, d]) => $$(sel, hero).forEach(el => show(el, d)));
    // cualquier otro elemento marcado dentro del hero
    $$('[data-reveal]:not(.is-visible), .k-split:not(.is-visible)', hero).forEach(el => show(el, 600));
  }


  /* ── 1. INTRO ────────────────────────────────────────────────────── */
  async function runIntro() {
    if (!root.classList.contains('k-intro')) return;
    // Solo espera a las tipografías (evita el salto de fuente); imágenes y
    // video cargan detrás del telón sin retenerlo.
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const elapsed = performance.now();
    await Promise.race([
      Promise.all([fonts, wait(Math.max(0, CONFIG.introMin - elapsed))]),
      wait(Math.max(0, CONFIG.introMax - elapsed))
    ]);
    root.classList.add('k-intro-out');       // el logotipo se desvanece
    await wait(180);
    root.classList.remove('k-intro');        // el telón sube
    await wait(220);                         // el hero entra mientras sube
    setTimeout(() => root.classList.remove('k-intro-out'), 900);
  }


  /* ── 2. SMOOTH SCROLL ────────────────────────────────────────────── */
  const smooth = { active: false, target: 0, current: 0, last: 0 };

  function canScrollInside(node, dy) {
    while (node && node !== document.body && node !== root) {
      if (node.nodeType === 1) {
        const s = getComputedStyle(node);
        if (/(auto|scroll)/.test(s.overflowY) && node.scrollHeight > node.clientHeight) {
          if ((dy < 0 && node.scrollTop > 0) ||
              (dy > 0 && node.scrollTop + node.clientHeight < node.scrollHeight)) return true;
        }
      }
      node = node.parentNode;
    }
    return false;
  }

  function initSmoothScroll() {
    if (!CONFIG.smoothScroll || !finePointer) return;
    const maxScroll = () => root.scrollHeight - window.innerHeight;

    const step = now => {
      const dt = Math.min(64, now - (smooth.last || now)) || 16.67;
      smooth.last = now;
      const k = 1 - Math.pow(1 - CONFIG.smoothEase, dt / 16.67);
      smooth.current += (smooth.target - smooth.current) * k;
      if (Math.abs(smooth.target - smooth.current) < 0.5) {
        smooth.current = smooth.target;
        smooth.active = false;
      }
      window.scrollTo({ top: smooth.current, behavior: 'instant' });
      if (smooth.active) requestAnimationFrame(step);
    };

    window.addEventListener('wheel', e => {
      if (e.ctrlKey || e.defaultPrevented) return;                 // zoom
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;          // scroll horizontal
      if (root.classList.contains('k-intro') || document.body.classList.contains('modal-open')) return;
      if (canScrollInside(e.target, e.deltaY)) return;
      e.preventDefault();
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 40;
      else if (e.deltaMode === 2) d *= window.innerHeight;
      if (!smooth.active) {
        smooth.current = smooth.target = window.scrollY;
        smooth.last = 0;
      }
      smooth.target = clamp(smooth.target + d, 0, maxScroll());
      if (!smooth.active) { smooth.active = true; requestAnimationFrame(step); }
    }, { passive: false });

    // Teclado, anclas y barra de desplazamiento: se cede el control al navegador
    const release = () => { smooth.active = false; };
    window.addEventListener('keydown', release);
    window.addEventListener('pointerdown', release);
    document.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) release(); });
  }


  /* ── 6. LOOP DE SCROLL ───────────────────────────────────────────── */
  const header = $('header.sticky-top');
  let progressBar, parallaxEls = [], timelines = [];
  let lastY = window.scrollY, ticking = false;

  function setupScrollFx() {
    if (header && !$('.k-progress', header)) {
      progressBar = document.createElement('div');
      progressBar.className = 'k-progress';
      progressBar.setAttribute('aria-hidden', 'true');
      header.appendChild(progressBar);
    }
    parallaxEls = $$('[data-parallax]').map(el => ({ el, speed: parseFloat(el.dataset.parallax) || 0 }));
    timelines = $$('.timeline').map(el => ({ el, items: $$('li', el) }));
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = Math.max(1, root.scrollHeight - vh);

    // Header: sombra al despegar del borde superior (y, si headerHide está
    // activo, se oculta al bajar y vuelve al subir)
    if (header) {
      const menuOpen = !!$('.navbar-collapse.show, .navbar-collapse.collapsing', header);
      header.classList.toggle('k-header-scrolled', y > 8);
      if (CONFIG.headerHide) {
        if (!menuOpen && y > CONFIG.headerHideAfter && y > lastY + 2) header.classList.add('k-header-hidden');
        else if (y < lastY - 2 || y <= CONFIG.headerHideAfter || menuOpen) header.classList.remove('k-header-hidden');
      }
    }
    if (progressBar) progressBar.style.setProperty('--k-progress', (y / max).toFixed(4));

    // Parallax — primero lecturas, luego escrituras
    const reads = parallaxEls.map(({ el, speed }) => {
      const r = (el.parentElement || el).getBoundingClientRect();
      const inView = r.bottom > -200 && r.top < vh + 200;
      return { el, speed, inView, offset: (r.top + r.height / 2) - vh / 2 };
    });
    reads.forEach(({ el, speed, inView, offset }) => {
      if (inView) el.style.translate = `0 ${(offset * speed * -1).toFixed(1)}px`;
    });

    // Timeline: la línea se llena hasta el 65 % del viewport
    timelines.forEach(({ el, items }) => {
      const r = el.getBoundingClientRect();
      const p = clamp((vh * 0.65 - r.top) / r.height, 0, 1);
      el.style.setProperty('--tl', p.toFixed(4));
      items.forEach(li => li.classList.toggle('is-active', (li.offsetTop + 8) / r.height <= p));
    });

    lastY = y;
  }

  const requestUpdate = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };


  /* ── 7. MAGNÉTICOS + SPOTLIGHT ───────────────────────────────────── */
  function initPointerFx() {
    if (!finePointer) return;

    $$('.k-magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const mx = (e.clientX - (r.left + r.width / 2)) * CONFIG.magneticStrength;
        const my = (e.clientY - (r.top + r.height / 2)) * CONFIG.magneticStrength;
        btn.style.setProperty('--mx', `${clamp(mx, -8, 8).toFixed(1)}px`);
        btn.style.setProperty('--my', `${clamp(my, -6, 6).toFixed(1)}px`);
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });

    document.addEventListener('pointermove', e => {
      const card = e.target.closest && e.target.closest('.k-spot');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--sx', `${e.clientX - r.left}px`);
      card.style.setProperty('--sy', `${e.clientY - r.top}px`);
    }, { passive: true });
  }


  /* ── 8. HÉLICE DE ADN QUE GIRA CON EL SCROLL ───────────────────────
     Se reconstruye la ilustración original (viewBox 120×280: dos hebras
     de amplitud 40 alrededor de x=60, periodo 160 y un peldaño cada
     ~20 u) como una hélice real: la fase avanza con el scroll, así que
     las hebras se cruzan y los peldaños se acortan/alargan como si la
     molécula girara sobre su eje.
     Rendimiento: un único <svg> fijo, 2 paths + 1 path de peldaños +
     círculos; solo se redibuja cuando cambia la fase (rAF) y se pausa
     con la pestaña oculta. */
  const DNA = {
    color: '#5BD6FF',
    amp: 40,               // amplitud (igual que el vector: x 20 → 100)
    period: 300,           // unidades de viewBox por vuelta completa (antes 260)
    rungStep: 50,          // separación mínima entre peldaños (antes 32)
    maxRungs: 11,          // tope de peldaños visibles (pantallas altas / móvil)
    turnsPerScreen: 1.15,  // vueltas de la hélice por cada pantalla de scroll
    ease: 0.085            // inercia del giro (0.05 suave · 0.2 directo)
  };

  function initDna() {
    if (document.querySelector('.k-dna')) return;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'k-dna');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('preserveAspectRatio', 'xMidYMin slice');
    const mk = (tag, attrs) => {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    };
    const g = mk('g', { fill: 'none', stroke: DNA.color, 'stroke-linecap': 'round' });
    const rungs = mk('path', { 'stroke-width': '0.6', opacity: '0.35' });
    const back  = mk('path', { 'stroke-width': '0.9', opacity: '0.35' });  // tramo trasero de ambas hebras
    const front = mk('path', { 'stroke-width': '1.6', opacity: '0.8' });  // tramo delantero
    const dots  = mk('g', { fill: DNA.color, stroke: 'none' });
    g.append(rungs, back, front, dots);
    svg.appendChild(g);
    document.body.appendChild(svg);

    let H = 280, nodes = [];
    const hero = document.querySelector('.hero-video');

    const layout = () => {
      const r = svg.getBoundingClientRect();
      H = Math.max(280, Math.round(120 * (r.height || window.innerHeight) / Math.max(r.width, 1)));
      svg.setAttribute('viewBox', `0 0 120 ${H}`);
      dots.textContent = '';
      nodes = [];
      const step = Math.max(DNA.rungStep, H / DNA.maxRungs);
      for (let y = step * 0.4; y <= H; y += step) {
        const a = mk('circle', { r: '1' }), b = mk('circle', { r: '1' });
        dots.append(a, b);
        nodes.push({ y, a, b });
      }
    };

    // Construye las hebras por tramos: delante (cos>0) más gruesa, detrás más tenue
    const draw = phase => {
      const k = (2 * Math.PI) / DNA.period, cx = 60, A = DNA.amp;
      let dFront = '', dBack = '', dRungs = '';
      [0, Math.PI].forEach(offset => {
        let prevFront = null;
        for (let y = 0; y <= H + 4; y += 4) {
          const t = k * y + phase + offset;
          const x = (cx + A * Math.sin(t)).toFixed(2);
          const isFront = Math.cos(t) > 0;
          const seg = `${x} ${y}`;
          if (isFront !== prevFront) {
            // empieza un tramo nuevo en la capa que corresponde
            if (isFront) dFront += `M${seg}`; else dBack += `M${seg}`;
          } else if (isFront) dFront += `L${seg}`; else dBack += `L${seg}`;
          prevFront = isFront;
        }
      });
      nodes.forEach(({ y, a, b }) => {
        const t = k * y + phase;
        const s = Math.sin(t), c = Math.cos(t);
        const x1 = cx + A * s, x2 = cx - A * s;
        if (Math.abs(s) > 0.18) dRungs += `M${x1.toFixed(2)} ${y}L${x2.toFixed(2)} ${y}`;
        a.setAttribute('cx', x1.toFixed(2)); a.setAttribute('cy', y);
        b.setAttribute('cx', x2.toFixed(2)); b.setAttribute('cy', y);
        a.setAttribute('r', (1.1 + 0.7 * c).toFixed(2));   // la hebra frontal tiene nodos mayores
        b.setAttribute('r', (1.1 - 0.7 * c).toFixed(2));
        a.setAttribute('opacity', (0.55 + 0.4 * c).toFixed(2));
        b.setAttribute('opacity', (0.55 - 0.4 * c).toFixed(2));
      });
      front.setAttribute('d', dFront);
      back.setAttribute('d', dBack);
      rungs.setAttribute('d', dRungs);
    };

    // Visibilidad: aparece al dejar atrás el hero de video
    const visibility = () => {
      if (!hero) return 1;
      const h = hero.offsetHeight;
      return clamp((window.scrollY - h * 0.45) / (h * 0.4), 0, 1);
    };

    let target = 0, current = 0, running = false, lastOpacity = -1;
    const radPerPx = () => (DNA.turnsPerScreen * 2 * Math.PI) / window.innerHeight;
    const tick = () => {
      current += (target - current) * DNA.ease;
      if (Math.abs(target - current) < 0.0005) current = target;
      draw(current);
      const o = visibility();
      if (Math.abs(o - lastOpacity) > 0.004) { svg.style.setProperty('--dna-o', o.toFixed(3)); lastOpacity = o; }
      if (current !== target && !document.hidden) requestAnimationFrame(tick);
      else running = false;
    };
    const kick = () => {
      target = window.scrollY * radPerPx();
      if (!running) { running = true; requestAnimationFrame(tick); }
    };

    layout();
    current = target = window.scrollY * radPerPx();
    draw(current);
    svg.style.setProperty('--dna-o', visibility().toFixed(3));
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', () => { layout(); kick(); draw(current); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
    requestAnimationFrame(() => svg.classList.add('is-ready'));
  }


  /* ── ARRANQUE ────────────────────────────────────────────────────── */
  function init() {
    tagElements();
    setupScrollFx();
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    initSmoothScroll();
    initPointerFx();
    initDna();

    runIntro().then(() => {
      playHero();
      observeReveals();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

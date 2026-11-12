/*Animaciones sección: Logros y Resultados
  Contador con desaceleración (easeOutExpo) y separador de miles.
  Con "reducir movimiento" muestra la cifra final de inmediato. */
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".stat .n");
  const duration = 2200; // ms de la animación completa
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = n => "+" + Math.round(n).toLocaleString("es-MX");
  const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const animateCounter = (counter) => {
    const target = +counter.getAttribute("data-target");
    if (reduce) { counter.innerText = fmt(target); return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      counter.innerText = fmt(target * easeOutExpo(t));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Intersection Observer: inicia solo cuando la tarjeta es visible
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const counter = entry.target.querySelector(".n");
      if (counter && !counter.classList.contains("counted")) {
        counter.classList.add("counted");
        // pequeño retraso para que coincida con la entrada de la tarjeta
        setTimeout(() => animateCounter(counter), 250);
      }
      obs.unobserve(entry.target);
    });
  }, { root: null, threshold: 0.4 });

  document.querySelectorAll(".stat").forEach(stat => observer.observe(stat));
});

/*Animaciones sección: Quiénes somos*/
document.addEventListener("DOMContentLoaded", () => {
  const timelineItems = document.querySelectorAll(".timeline li");

  const observerOptions = {
    root: null,
    threshold: 0.2 // Se activa cuando al menos el 20% del elemento es visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        
        // Opcional: Si quieres que la animación ocurra una sola vez y no se repita al subir/bajar
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  timelineItems.forEach((item, index) => {
  // Añade un retraso progresivo basado en su posición (0.15s, 0.3s, 0.45s...)
  item.style.transitionDelay = `${index * 0.15}s`;
  observer.observe(item);
  });
});
/*Hero v2: video de fondo
  - Entra con fade solo cuando realmente empieza a reproducirse.
  - Si falla (Drive bloquea, red lenta, formato no soportado) se queda
    el póster: la portada nunca se ve vacía.
  - Botón de pausa accesible; se pausa solo al salir de pantalla.
  - Con "reducir movimiento" no descarga el video hasta que el usuario
    pulse reproducir. */
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector("[data-hero-video]");
  if (!hero) return;
  const video = hero.querySelector("video");
  const btn = hero.querySelector(".hero-video-toggle");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const src = video.getAttribute("src");
  const FALLBACK_AFTER = 9000; // ms sin reproducir → se queda el póster
  let userPaused = reduce;
  let fallbackTimer;

  const setButton = (paused) => {
    if (!btn) return;
    btn.setAttribute("aria-pressed", String(paused));
    btn.setAttribute("aria-label", paused ? "Reproducir video de fondo" : "Pausar video de fondo");
    btn.innerHTML = `<i class="bi ${paused ? "bi-play-fill" : "bi-pause-fill"}" aria-hidden="true"></i>`;
  };
  const fallback = () => { if (!hero.classList.contains("is-playing")) hero.classList.add("is-fallback"); };
  const tryPlay = () => {
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(fallback, FALLBACK_AFTER);
  };

  video.addEventListener("playing", () => {
    clearTimeout(fallbackTimer);
    hero.classList.remove("is-fallback");
    hero.classList.add("is-playing");
  });
  video.addEventListener("error", fallback);

  if (reduce) {
    video.removeAttribute("autoplay");
    video.removeAttribute("src");
    video.load();
    setButton(true);
  } else {
    tryPlay();
  }

  btn && btn.addEventListener("click", () => {
    userPaused = !userPaused;
    if (userPaused) { video.pause(); }
    else {
      if (!video.getAttribute("src")) { video.src = src; }
      hero.classList.remove("is-fallback");
      tryPlay();
    }
    setButton(userPaused);
  });

  // Ahorra batería/CPU: pausa cuando el hero sale de pantalla
  new IntersectionObserver(([entry]) => {
    if (userPaused || hero.classList.contains("is-fallback")) return;
    entry.isIntersecting ? video.play().catch(() => {}) : video.pause();
  }, { threshold: 0.05 }).observe(hero);
});

/*Animaciones sección: Logros y Resultados*/
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".stat .n");
  const speed = 200; // Cuanto menor sea el número, más rápido avanzará el contador

  const animateCounters = (counter) => {
    const target = +counter.getAttribute("data-target");
    let count = 0;
    
    // Calcula el incremento según la velocidad deseada
    const inc = target / speed;

    const updateCount = () => {
      count += inc;
      if (count < target) {
        // Muestra el número entero actual con el signo "+"
        counter.innerText = "+" + Math.ceil(count);
        setTimeout(updateCount, 15);
      } else {
        // Asegura de mostrar el número final exacto
        counter.innerText = "+" + target;
      }
    };

    updateCount();
  };

  // Usamos Intersection Observer para que la animación inicie solo cuando sean visibles en pantalla
  const observerOptions = {
    root: null,
    threshold: 0.3 // Se activa cuando el 30% de la sección es visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target.querySelector(".n");
        if (counter && !counter.classList.contains("counted")) {
          counter.classList.add("counted");
          animateCounters(counter);
        }
      }
    });
  }, observerOptions);

  // Observa cada tarjeta de estadísticas
  document.querySelectorAll(".stat").forEach(stat => {
    observer.observe(stat);
  });
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
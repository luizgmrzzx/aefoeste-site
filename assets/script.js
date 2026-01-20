// =========================================================
// Reveal seguro — SEM SCALE, SEM ZOOM
// =========================================================
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

// ⚠️ SÓ OBSERVAR ELEMENTOS DE CONTEÚDO
document.querySelectorAll(
  ".card, .mgmt, .b-card, .e-card, .section-title"
).forEach(el => observer.observe(el));

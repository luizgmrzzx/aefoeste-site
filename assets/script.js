// =========================================================
// Reveal on-scroll — seguro (SEM SCALE / SEM ZOOM)
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

// Apenas elementos de conteúdo
document.querySelectorAll(
  ".card, .mgmt, .b-card, .e-card, .section-title"
).forEach(el => observer.observe(el));


// =========================================================
// Menu Mobile — CONTROLE DEFINITIVO
// =========================================================
const burger = document.querySelector('[data-burger]');
const drawer = document.querySelector('[data-drawer]');
const drawerLinks = drawer ? drawer.querySelectorAll('a') : [];

function openMenu() {
  drawer.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden'; // trava scroll
}

function closeMenu() {
  drawer.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = ''; // libera scroll
}

if (burger && drawer) {

  // Clique no botão MENU
  burger.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Fecha ao clicar em qualquer link
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fecha com tecla ESC (acessibilidade)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
    }
  });
}

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

// Apenas elementos de conteúdo (nunca layout estrutural)
document.querySelectorAll(
  ".card, .mgmt, .b-card, .e-card, .section-title, .page-hero h1, .page-hero p"
).forEach(el => observer.observe(el));


// =========================================================
// Menu Mobile — CONTROLE DEFINITIVO (ROBUSTO)
// =========================================================
const burger = document.querySelector('[data-burger]');
const drawer = document.querySelector('[data-drawer]');
const drawerLinks = drawer ? drawer.querySelectorAll('a') : [];

function openMenu() {
  if (!drawer || !burger) return;

  drawer.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');

  document.body.classList.add('menu-open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!drawer || !burger) return;

  drawer.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');

  document.body.classList.remove('menu-open');
  document.body.style.overflow = '';
}

if (burger && drawer) {

  // Toggle do menu
  burger.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Fecha ao clicar em qualquer link
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fecha com ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
    }
  });

  // Fecha automaticamente ao voltar para desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && drawer.classList.contains('open')) {
      closeMenu();
    }
  });
}


// =========================================================
// Filtro de atividades (Toolbar)
// =========================================================
const chips = document.querySelectorAll('.chip[data-filter]');
const cards = document.querySelectorAll('.e-card');

if (chips.length && cards.length) {
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;

      // estado visual dos botões
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');

      // aplica filtro real
      cards.forEach(card => {
        if (filter === 'Todos' || card.dataset.tag === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}
// =========================================================
// Eventos — filtro por chip + busca (nome/tag/ano/etc)
// Funciona com: .e-card, data-tag, .e-title, .e-desc, .badge, .tag, .e-date
// =========================================================

(function () {
  const page = document.body;
  if (!page.classList.contains("page-eventos")) return;

  const cardsWrap = document.querySelector(".cards");
  const cards = Array.from(document.querySelectorAll(".e-card"));
  const chips = Array.from(document.querySelectorAll(".chip[data-filter]"));
  const input = document.getElementById("qevt");

  if (!cardsWrap || !cards.length) return;

  // Normaliza texto (lowercase + remove acentos + trim)
  const norm = (s) =>
    (s || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // Extrai ano do card (prioridade: datetime ISO, fallback: texto)
  function getYear(card) {
    const timeEl = card.querySelector(".e-date");
    const dt = timeEl?.getAttribute("datetime") || "";
    // pega YYYY se vier em ISO (2025-06-26)
    const m = dt.match(/^(\d{4})/);
    if (m) return m[1];

    // fallback: tenta achar 4 dígitos no texto visível (ex: 28–30/07/2025)
    const txt = timeEl?.textContent || "";
    const m2 = txt.match(/(\d{4})/);
    return m2 ? m2[1] : "";
  }

  // Extrai "tag principal" do card:
  // 1) data-tag
  // 2) primeira .tag dentro de .e-tags
  function getPrimaryTag(card) {
    const dt = card.dataset.tag || "";
    if (dt) return dt;

    const firstTag = card.querySelector(".e-tags .tag");
    return firstTag ? firstTag.textContent : "";
  }

  // Monta texto pesquisável do card (cache)
  const index = cards.map((card) => {
    const title = card.querySelector(".e-title")?.textContent || "";
    const desc = card.querySelector(".e-desc")?.textContent || "";
    const badges = Array.from(card.querySelectorAll(".badge"))
      .map((b) => b.textContent)
      .join(" ");
    const tags = Array.from(card.querySelectorAll(".e-tags .tag"))
      .map((t) => t.textContent)
      .join(" ");
    const dateText = card.querySelector(".e-date")?.textContent || "";
    const datetime = card.querySelector(".e-date")?.getAttribute("datetime") || "";
    const year = getYear(card);
    const primaryTag = getPrimaryTag(card);

    // “Texto total” pra busca livre
    const haystack = norm(
      [
        title,
        desc,
        badges,
        tags,
        dateText,
        datetime,
        year,
        primaryTag,
      ].join(" ")
    );

    return {
      el: card,
      haystack,
      year: norm(year),
      primaryTag: norm(primaryTag),
      tags: norm(tags),
      title: norm(title),
    };
  });

  let activeFilter = "todos"; // chip atual
  let query = "";            // texto atual

  // Parser simples para buscas tipo:
  // "ano:2025 tag:reuniao chapeco"
  function parseQuery(q) {
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    const filters = { ano: "", tag: "" };
    const free = [];

    for (const tok of tokens) {
      const m = tok.match(/^(ano|year|tag|tipo):(.+)$/);
      if (m) {
        const key = m[1];
        const val = m[2];
        if (key === "year") filters.ano = val;
        if (key === "tipo") filters.tag = val;
        if (key === "ano") filters.ano = val;
        if (key === "tag") filters.tag = val;
      } else {
        free.push(tok);
      }
    }

    return {
      free: free.join(" "),
      ano: filters.ano,
      tag: filters.tag,
    };
  }

  function setChipActive(btn) {
    chips.forEach((c) => c.classList.remove("is-active"));
    btn.classList.add("is-active");
  }

  function applyFilters() {
    const pq = parseQuery(query);

    // chip: "Todos" ou uma categoria (Curso/Reunião/Participação/Informativo)
    const chipFilter = norm(activeFilter);
    const wantAll = chipFilter === "todos";

    let visibleCount = 0;

    for (const item of index) {
      // 1) filtro por chip (bate com data-tag ou com tags)
      const matchChip =
        wantAll ||
        item.primaryTag.includes(chipFilter) ||
        item.tags.includes(chipFilter);

      // 2) filtro por query avançada (ano/tag)
      const matchAno = !pq.ano || item.year.includes(norm(pq.ano));
      const matchTag = !pq.tag || item.tags.includes(norm(pq.tag)) || item.primaryTag.includes(norm(pq.tag));

      // 3) busca livre (título/desc/badges/tags/data)
      const matchFree = !pq.free || item.haystack.includes(norm(pq.free));

      const ok = matchChip && matchAno && matchTag && matchFree;

      item.el.style.display = ok ? "" : "none";
      if (ok) visibleCount++;
    }

    // (opcional) você pode mostrar um “0 resultados” aqui se quiser
    // por enquanto, deixa só filtrar.
  }

  // Eventos de chip
  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter || "Todos";
      setChipActive(btn);
      applyFilters();
    });
  });

  // Busca com debounce leve
  let t = null;
  if (input) {
    input.addEventListener("input", () => {
      query = input.value || "";
      clearTimeout(t);
      t = setTimeout(applyFilters, 80);
    });
  }

  // Inicializa
  applyFilters();
})();

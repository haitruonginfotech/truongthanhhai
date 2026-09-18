export function setupHeader() {
  const root = document.documentElement;
  const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  const menu = document.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
  const key = 'tth-theme';

  function updateToggle() {
    const dark = root.dataset.theme !== 'light';
    toggle?.setAttribute('aria-checked', String(dark));
    toggle?.setAttribute('title', dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối');
    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute('content', dark ? '#0e1115' : '#ffffff');
  }
  updateToggle();
  toggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(key, root.dataset.theme); } catch { /* Theme still works when storage is unavailable. */ }
    updateToggle();
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      root.dataset.theme = event.newValue === 'light' ? 'light' : 'dark';
      updateToggle();
    }
  });
  setupScrollSpy();
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
  document.addEventListener('click', event => {
    if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
  });
  matchMedia('(min-width: 1280px)').addEventListener('change', event => {
    if (event.matches && menu) menu.open = false;
  });
}

/** Highlights the nav item of the section currently under the header (desktop + mobile menus). */
function setupScrollSpy() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
  const ids = [...new Set(links.map(link => new URL(link.href).hash.slice(1)).filter(Boolean))];
  const sections = ids.map(id => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
  if (!sections.length) return;
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  let current = '';

  const setActive = (id: string) => {
    if (id === current) return;
    current = id;
    for (const link of links) {
      const hash = new URL(link.href).hash.slice(1);
      const active = id ? hash === id : !hash;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  const update = () => {
    ticking = false;
    const line = (header?.offsetHeight ?? 0) + window.innerHeight * 0.3;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let id = '';
    for (const section of sections) if (section.getBoundingClientRect().top <= line) id = section.id;
    if (atBottom) id = sections[sections.length - 1].id;
    setActive(id);
  };
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

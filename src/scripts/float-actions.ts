export function setupFloatActions() {
  const slot = document.querySelector<HTMLElement>('[data-top-slot]');
  const button = document.querySelector<HTMLButtonElement>('[data-back-to-top]');
  if (!slot || !button) return;

  let ticking = false;
  const update = () => {
    slot.classList.toggle('is-open', window.scrollY > 480);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  button.addEventListener('click', () => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });
}

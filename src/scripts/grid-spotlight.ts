/**
 * Grid spotlight: sections with `data-grid-spotlight` show a faint line grid; around the pointer a brighter grid
 * and soft glow are revealed through a radial mask. JS only feeds the pointer position into `--mx/--my`.
 */
export function setupGridSpotlights() {
  if (!matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-grid-spotlight]').forEach(section => {
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      section.style.setProperty('--mx', `${x}px`);
      section.style.setProperty('--my', `${y}px`);
    };
    section.addEventListener('pointermove', event => {
      const rect = section.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      section.classList.add('is-cursor-active');
      if (!frame) frame = requestAnimationFrame(apply);
    }, { passive: true });
    section.addEventListener('pointerleave', () => section.classList.remove('is-cursor-active'));
  });
}

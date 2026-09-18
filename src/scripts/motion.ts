import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Page-wide motion. Content is visible by default; hidden states exist only under `html.motion`. */
export function setupMotion() {
  const root = document.documentElement;
  setupHeaderState();
  setupPointerGlow();
  if (reducedMotion() || !root.classList.contains('motion')) {
    root.classList.remove('motion');
    return;
  }
  root.dataset.motionReady = '1';
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.8 });

  heroIntro();
  scrollReveals();
  processLine();
  faqMotion();
  loadHeroScene();
}

function heroIntro() {
  const items = gsap.utils.toArray<HTMLElement>('[data-hero-item]');
  const tl = gsap.timeline({ delay: 0.1 });
  tl.fromTo(items, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, stagger: 0.09, duration: 0.9, clearProps: 'transform' })
    .from('[data-portrait]', { scale: 0.9, rotate: -6, duration: 1.2, ease: 'expo.out', clearProps: 'transform' }, 0.25)
    .from('[data-float]', { autoAlpha: 0, scale: 0.6, stagger: 0.12, duration: 0.6, ease: 'back.out(1.8)' }, 0.8);

  document.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    const counter = { value: 0 };
    tl.to(counter, { value: target, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = String(Math.round(counter.value)); } }, 0.5);
  });

  gsap.utils.toArray<HTMLElement>('[data-float]').forEach((chip, index) => {
    gsap.to(chip, { y: index % 2 ? 10 : -10, duration: 2.6 + index * 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.4 });
  });
  gsap.to('[data-portrait-ring]', { rotate: 360, duration: 60, repeat: -1, ease: 'none' });

  // Subtle parallax on the portrait follows the pointer (desktop only).
  const portrait = document.querySelector<HTMLElement>('[data-portrait]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (portrait && hero && matchMedia('(hover: hover) and (min-width: 1024px)').matches) {
    const rx = gsap.quickTo(portrait, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(portrait, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    gsap.set(portrait, { transformPerspective: 900 });
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      rx(((e.clientX - r.left) / r.width - 0.5) * 12);
      ry(-((e.clientY - r.top) / r.height - 0.5) * 10);
    });
    hero.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
}

function scrollReveals() {
  const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  gsap.set(targets, { autoAlpha: 0, y: 32 });
  ScrollTrigger.batch(targets, {
    start: 'top 88%',
    once: true,
    onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.75, overwrite: true, clearProps: 'transform' }),
  });
  // Anything already above the fold on load (e.g. deep links) should not wait for a scroll event.
  ScrollTrigger.refresh();
}

function processLine() {
  const line = document.querySelector('[data-process-line]');
  if (!line) return;
  gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: line, start: 'top 80%', end: 'top 45%', scrub: 0.6 } });
}

function faqMotion() {
  document.querySelectorAll<HTMLDetailsElement>('[data-faq]').forEach(item => {
    item.addEventListener('toggle', () => {
      const body = item.querySelector('[data-faq-body]');
      if (item.open && body) gsap.fromTo(body, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.4, clearProps: 'all' });
    });
  });
}

function setupHeaderState() {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  let ticking = false;
  const update = () => { header.classList.toggle('is-scrolled', window.scrollY > 12); ticking = false; };
  update();
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
}

/** Cursor-following highlight on cards; pure CSS variables, so it also works with reduced motion. */
function setupPointerGlow() {
  if (!matchMedia('(hover: hover)').matches) return;
  document.addEventListener('pointermove', e => {
    const card = (e.target as Element | null)?.closest?.<HTMLElement>('.glow-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

function loadHeroScene() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (!canvas || connection?.saveData) return;
  const start = () => import('./hero-scene').then(m => m.mountHeroScene(canvas)).catch(() => { /* Static glow remains as fallback. */ });
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 600);
}

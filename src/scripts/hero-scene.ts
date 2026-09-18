import {
  AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Fog, Group, LineBasicMaterial, LineSegments,
  NormalBlending, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer, CanvasTexture,
} from 'three';

/** Rotating “network globe” of points and links behind the hero. Pauses offscreen and on hidden tabs. */
export function mountHeroScene(canvas: HTMLCanvasElement) {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return;
  }
  const small = matchMedia('(max-width: 767px)').matches;
  // Render at 2x even on 1x screens: thin 1px links and tiny sprites alias (“shimmer”) while rotating at lower resolutions.
  renderer.setPixelRatio(small ? Math.min(window.devicePixelRatio, 2) : 2);

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const COUNT = small ? 260 : 620;
  const RADIUS = small ? 3.2 : 3.9;
  const positions = new Float32Array(COUNT * 3);
  // Fibonacci sphere gives an even distribution without clustering at the poles.
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = i * Math.PI * (3 - Math.sqrt(5));
    const jitter = RADIUS * (0.94 + Math.random() * 0.12);
    positions.set([Math.cos(theta) * r * jitter, y * jitter, Math.sin(theta) * r * jitter], i * 3);
  }

  const linePositions: number[] = [];
  const maxDist = small ? 0.95 : 0.78;
  for (let i = 0; i < COUNT; i++) {
    let links = 0;
    for (let j = i + 1; j < COUNT && links < 3; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < maxDist * maxDist) {
        linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2], positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
        links++;
      }
    }
  }

  const dot = document.createElement('canvas');
  dot.width = dot.height = 64;
  const ctx = dot.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);

  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  const pointMaterial = new PointsMaterial({ size: small ? 0.12 : 0.1, map: new CanvasTexture(dot), transparent: true, depthWrite: false });
  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute('position', new Float32BufferAttribute(linePositions, 3));
  const lineMaterial = new LineBasicMaterial({ transparent: true, depthWrite: false });

  // Separate tilt (pointer) and spin (constant) so the two rotations never fight each other in one Euler.
  const spin = new Group();
  spin.add(new Points(pointGeometry, pointMaterial), new LineSegments(lineGeometry, lineMaterial));
  const globe = new Group();
  globe.add(spin);
  globe.rotation.set(0.35, 0, 0.18);
  scene.add(globe);
  // Fade the far hemisphere so back links do not flicker through the front ones.
  scene.fog = new Fog(0x000000, 8.5, 15);

  const applyTheme = () => {
    const styles = getComputedStyle(document.documentElement);
    const dark = document.documentElement.dataset.theme !== 'light';
    const accent = new Color(styles.getPropertyValue('--accent-2').trim() || '#00f260');
    scene.fog!.color = new Color(styles.getPropertyValue('--page').trim() || (dark ? '#0e1115' : '#ffffff'));
    pointMaterial.color = accent;
    lineMaterial.color = accent;
    pointMaterial.blending = lineMaterial.blending = dark ? AdditiveBlending : NormalBlending;
    pointMaterial.opacity = (dark ? 0.95 : 0.6) * (small ? 0.6 : 1);
    lineMaterial.opacity = (dark ? 0.2 : 0.16) * (small ? 0.55 : 1);
    pointMaterial.needsUpdate = lineMaterial.needsUpdate = true;
  };
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Keep the globe on the right on wide screens, centred behind content on mobile.
    globe.position.set(w >= 1024 ? 4.3 : 0, w >= 1024 ? 0.3 : -2.6, w >= 1024 ? -1 : -3);
    const distance = camera.position.z - globe.position.z;
    const fog = scene.fog as Fog;
    fog.near = distance - RADIUS * 0.2;
    fog.far = distance + RADIUS * 3;
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  // Raw pointer is only a target; the rendered tilt eases towards it with frame-rate independent damping.
  const target = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  window.addEventListener('pointermove', e => {
    target.x = e.clientX / window.innerWidth - 0.5;
    target.y = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  let visible = true;
  let frame = 0;
  let last = performance.now();
  const tick = (now: number) => {
    frame = 0;
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const k = 1 - Math.exp(-dt * 1.8);
    eased.x += (target.x - eased.x) * k;
    eased.y += (target.y - eased.y) * k;
    spin.rotation.y = (spin.rotation.y + dt * 0.07) % (Math.PI * 2);
    globe.rotation.x = 0.35 + eased.y * 0.16;
    globe.rotation.z = 0.18 + eased.x * 0.1;
    renderer.render(scene, camera);
    schedule();
  };
  const schedule = () => { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(tick); };
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; last = performance.now(); schedule(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { last = performance.now(); schedule(); });

  renderer.render(scene, camera);
  canvas.classList.add('is-ready');
  schedule();
}

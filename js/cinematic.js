(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;

  // Kinetic / editorial reveal layer inspired by modern motion-first galleries.
  const revealItems = document.querySelectorAll('.section, .page-hero, .archive-card, .work-card, .gallery-card, .membership-card, .event-card, .press-panel, .newsletter-panel');
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach((item, index) => {
      item.style.setProperty('--motion-delay', Math.min(index * 45, 260) + 'ms');
      observer.observe(item);
    });
  }

  // Glass / refraction-style pointer glow for cards and navigation.
  if (!reduce && finePointer) {
    document.addEventListener('pointermove', (event) => {
      const x = event.clientX;
      const y = event.clientY;
      document.documentElement.style.setProperty('--pointer-x', x + 'px');
      document.documentElement.style.setProperty('--pointer-y', y + 'px');
    }, { passive: true });

    document.querySelectorAll('.archive-card, .work-card, .gallery-card, .membership-card, .event-card, .press-panel, .newsletter-panel').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const r = card.getBoundingClientRect();
        const px = (event.clientX - r.left) / r.width;
        const py = (event.clientY - r.top) / r.height;
        card.style.setProperty('--card-x', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--card-y', (py * 100).toFixed(1) + '%');
      }, { passive: true });
    });
  }

  // Lightweight shader-like canvas: animated film grain, aurora bands and light field.
  // It is intentionally independent of Three.js so low-end devices keep a graceful fallback.
  const scene = document.querySelector('.scene');
  if (!scene || reduce) return;

  const shaderCanvas = document.createElement('canvas');
  shaderCanvas.className = 'shader-field';
  shaderCanvas.setAttribute('aria-hidden', 'true');
  scene.insertBefore(shaderCanvas, scene.firstChild);

  const ctx = shaderCanvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let time = 0;

  const resize = () => {
    const rect = scene.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    shaderCanvas.width = Math.floor(width * dpr);
    shaderCanvas.height = Math.floor(height * dpr);
    shaderCanvas.style.width = width + 'px';
    shaderCanvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = () => {
    time += 0.006;
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(
      width * (0.45 + Math.sin(time * 0.7) * 0.05),
      height * (0.27 + Math.cos(time * 0.5) * 0.04),
      0,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.8
    );
    gradient.addColorStop(0, 'rgba(242,193,91,.16)');
    gradient.addColorStop(.34, 'rgba(31,78,140,.08)');
    gradient.addColorStop(.7, 'rgba(91,58,114,.12)');
    gradient.addColorStop(1, 'rgba(7,18,31,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 3; i++) {
      const y = height * (0.25 + i * 0.28) + Math.sin(time * (0.8 + i * .12) + i) * 40;
      const band = ctx.createLinearGradient(0, y - 110, width, y + 110);
      band.addColorStop(0, 'rgba(242,193,91,0)');
      band.addColorStop(.5, i === 1 ? 'rgba(91,58,114,.11)' : 'rgba(31,78,140,.08)');
      band.addColorStop(1, 'rgba(242,193,91,0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, y - 110, width, 220);
    }

    ctx.globalCompositeOperation = 'source-over';
    if (finePointer) {
      const px = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pointer-x')) || width * .5;
      const py = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pointer-y')) || height * .35;
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 280);
      glow.addColorStop(0, 'rgba(242,193,91,.10)');
      glow.addColorStop(1, 'rgba(242,193,91,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    raf = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  draw();

  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
})();

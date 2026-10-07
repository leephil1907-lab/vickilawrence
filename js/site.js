(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cover = document.querySelector('.transition-cover');

  document.querySelectorAll('a[data-route]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || reduce) return;
      event.preventDefault();
      cover?.classList.add('go');
      window.setTimeout(() => { window.location.href = href; }, 520);
    });
  });

  const menu = document.querySelector('.menu');
  const panel = document.querySelector('.menu-panel');
  if (menu && panel) {
    menu.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      panel.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const scene = document.querySelector('.scene');
  if (scene && !reduce && window.matchMedia('(pointer:fine)').matches) {
    let tx = 0, ty = 0, x = 0, y = 0;
    scene.addEventListener('pointermove', e => {
      const r = scene.getBoundingClientRect();
      tx = ((e.clientX-r.left)/r.width-.5)*12;
      ty = ((e.clientY-r.top)/r.height-.5)*8;
    });
    const tick = () => {
      x += (tx-x)*.06; y += (ty-y)*.06;
      scene.style.setProperty('--mx', x.toFixed(2)+'px');
      scene.style.setProperty('--my', y.toFixed(2)+'px');
      requestAnimationFrame(tick);
    };
    tick();
    const fallback = scene.querySelector('.scene-fallback');
    if (fallback) fallback.style.transform = 'translate3d(var(--mx,0),var(--my,0),0) scale(1.04)';
  }

  // Lightweight atmospheric particles; no dependency required.
  const particleLayer = document.querySelector('[data-particles]');
  if (particleLayer && !reduce) {
    const frag = document.createDocumentFragment();
    for (let i=0;i<26;i++) {
      const s=document.createElement('span');
      s.style.cssText=`position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;border-radius:50%;background:rgba(242,193,91,.55);animation:float ${5+Math.random()*8}s ease-in-out ${Math.random()*-8}s infinite;opacity:.35`;
      frag.appendChild(s);
    }
    particleLayer.appendChild(frag);
    const style=document.createElement('style');
    style.textContent='@keyframes float{0%,100%{transform:translateY(0);opacity:.15}50%{transform:translateY(-30px);opacity:.7}}';
    document.head.appendChild(style);
  }
})();
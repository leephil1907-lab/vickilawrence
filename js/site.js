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

  // Public announcements published from the private control center.
  async function loadAnnouncements() {
    const feed = document.getElementById('announcementFeed');
    const wrap = document.getElementById('liveAnnouncements');
    const cfg = window.VL_PUBLIC_CONFIG || {};
    if (!feed || !wrap || !cfg.supabaseUrl || !cfg.supabasePublishableKey || !window.supabase?.createClient) return;
    try {
      const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
      const q = await client.from('announcements').select('id,title,body,image_url,button_text,button_url').eq('status','published').or('placement.eq.homepage,placement.eq.both').order('created_at',{ascending:false}).limit(3);
      if (q.error || !q.data?.length) return;
      feed.innerHTML = q.data.map(a => '<article class="announcement-item"><div><span class="announcement-kicker">LATEST FROM THE ARCHIVE</span><h3>'+escapeHtml(a.title)+'</h3><p>'+escapeHtml(a.body)+'</p></div>' + (a.button_url ? '<a class="btn btn-gold" href="'+safeUrl(a.button_url)+'">'+escapeHtml(a.button_text||'Learn more')+'</a>' : '') + '</article>').join('');
      wrap.hidden = false;
    } catch (e) { console.info('Announcement feed unavailable.', e); }
  }
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function safeUrl(value){return /^(https?:|\/|#)/i.test(String(value||'')) ? String(value) : '#'}

  loadAnnouncements();

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();


  // Special-request submission: deliberately disabled until an authorized endpoint is configured.
  const shoutoutForm = document.getElementById('shoutoutForm');
  const shoutoutType = document.getElementById('shoutoutRequestType');
  const selectedRequest = document.getElementById('selectedRequest');
  const shoutoutStatus = document.getElementById('formStatus');
  const shoutoutSubmit = document.getElementById('shoutoutSubmit');

  if (shoutoutType && selectedRequest) {
    shoutoutType.addEventListener('change', () => {
      selectedRequest.textContent = shoutoutType.value || 'Select a request type';
    });
  }

  if (shoutoutForm) {
    shoutoutForm.addEventListener('submit', async event => {
      event.preventDefault();
      const endpoint = shoutoutForm.action;
      if (endpoint.includes('YOUR_FORM_ID')) {
        shoutoutStatus.className = 'form-status error';
        shoutoutStatus.textContent = 'Connect the authorized request endpoint before enabling live submissions.';
        return;
      }
      shoutoutStatus.className = 'form-status';
      shoutoutStatus.textContent = 'Submitting your request...';
      shoutoutSubmit.disabled = true;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(shoutoutForm),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Request submission failed');
        shoutoutStatus.className = 'form-status success';
        shoutoutStatus.textContent = 'Thank you. Your request has been submitted for review.';
        shoutoutForm.reset();
        if (selectedRequest) selectedRequest.textContent = 'Select a request type';
      } catch (error) {
        shoutoutStatus.className = 'form-status error';
        shoutoutStatus.textContent = 'Something went wrong. Please try again or contact support.';
      } finally {
        shoutoutSubmit.disabled = false;
      }
    });
  }


  // Hero image carousel — 6s autoplay with pause/focus/visibility/reduced-motion support.
  const carouselSlides = document.querySelectorAll('.carousel-slide');
  const carouselDots = document.getElementById('carouselDots');
  const heroCarousel = document.getElementById('heroCarousel');
  const carouselNext = document.getElementById('carouselNext');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselPauseButton = document.getElementById('carouselPause');
  if (carouselSlides.length && carouselDots && heroCarousel) {
    let currentSlide = 0;
    let carouselTimer = null;
    let isPaused = false;
    const AUTO_SLIDE_DELAY = 6000;

    carouselSlides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to slide ' + (index + 1));
      dot.addEventListener('click', () => { goToSlide(index); restartAutoSlide(); });
      carouselDots.appendChild(dot);
    });

    function goToSlide(index) {
      carouselSlides[currentSlide].classList.remove('active');
      carouselDots.children[currentSlide]?.classList.remove('active');
      currentSlide = (index + carouselSlides.length) % carouselSlides.length;
      carouselSlides[currentSlide].classList.add('active');
      carouselDots.children[currentSlide]?.classList.add('active');
    }
    function nextSlide(){ goToSlide(currentSlide + 1); }
    function previousSlide(){ goToSlide(currentSlide - 1); }
    function startAutoSlide(){
      if (reduce || isPaused || carouselSlides.length < 2 || document.hidden) return;
      stopAutoSlide();
      carouselTimer = window.setInterval(nextSlide, AUTO_SLIDE_DELAY);
    }
    function stopAutoSlide(){
      if (carouselTimer){ window.clearInterval(carouselTimer); carouselTimer = null; }
    }
    function restartAutoSlide(){ stopAutoSlide(); startAutoSlide(); }

    carouselNext?.addEventListener('click', () => { nextSlide(); restartAutoSlide(); });
    carouselPrev?.addEventListener('click', () => { previousSlide(); restartAutoSlide(); });

    heroCarousel.addEventListener('mouseenter', stopAutoSlide);
    heroCarousel.addEventListener('mouseleave', startAutoSlide);
    heroCarousel.addEventListener('focusin', stopAutoSlide);
    heroCarousel.addEventListener('focusout', event => {
      if (!heroCarousel.contains(event.relatedTarget)) startAutoSlide();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoSlide(); else startAutoSlide();
    });

    carouselPauseButton?.addEventListener('click', () => {
      isPaused = !isPaused;
      if (isPaused) {
        stopAutoSlide();
        carouselPauseButton.textContent = '▶';
        carouselPauseButton.setAttribute('aria-label', 'Play carousel');
      } else {
        carouselPauseButton.textContent = '⏸';
        carouselPauseButton.setAttribute('aria-label', 'Pause carousel');
        startAutoSlide();
      }
    });
    startAutoSlide();
  }

  // Fan experience UI is intentionally preview-only until official authorization and secure backend workflows exist.
  const cardForm = document.getElementById('cardForm');
  if (cardForm) {
    const memberName = document.getElementById('memberName');
    const memberPlan = document.getElementById('memberPlan');
    const cardName = document.getElementById('cardName');
    const cardTier = document.getElementById('cardTier');
    const cardId = document.getElementById('cardId');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardQr = document.getElementById('cardQr');
    cardForm.addEventListener('submit', event => {
      event.preventDefault();
      cardName.textContent = memberName.value.trim() || 'Fan Member';
      cardTier.textContent = memberPlan.value;
      cardId.textContent = 'VL-PREVIEW';
      cardExpiry.textContent = '—';
      cardQr.textContent = 'PREVIEW';
    });
  }

  const requestType = document.getElementById('requestType');
  document.querySelectorAll('.request-option').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.request-option').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      if (requestType) requestType.value = button.dataset.request || '';
    });
  });

  const requestForm = document.getElementById('requestForm');
  if (requestForm) requestForm.addEventListener('submit', event => {
    event.preventDefault();
    const button = requestForm.querySelector('button[type="submit"]');
    if (button) {
      const original = button.textContent;
      button.textContent = 'Request Prepared — Pending Review';
      button.disabled = true;
      window.setTimeout(() => { button.textContent = original; button.disabled = false; }, 2200);
    }
  });

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) newsletterForm.addEventListener('submit', event => {
    event.preventDefault();
    const button = newsletterForm.querySelector('button[type="submit"]');
    if (button) {
      const original = button.textContent;
      button.textContent = 'Subscription Prepared';
      button.disabled = true;
      window.setTimeout(() => { button.textContent = original; button.disabled = false; }, 2200);
    }
  });

  document.querySelectorAll('.join-btn').forEach(button => {
    button.addEventListener('click', () => {
      const plan = button.dataset.plan || 'Fan';
      const select = document.getElementById('memberPlan');
      if (select) select.value = plan;
      document.getElementById('membership-card')?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
    });
  });

  document.querySelectorAll('.paid-plan').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      const target = document.getElementById('membership-card');
      target?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
    });
  });

  const scene = document.querySelector('.scene');

  async function mountThreeScene() {
    if (!scene || reduce || !window.WebGLRenderingContext) return;
    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none';
      scene.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(scene.clientWidth, scene.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const camera = new THREE.PerspectiveCamera(38, scene.clientWidth / scene.clientHeight, .1, 100);
      camera.position.set(0, 1.4, 10);

      const world = new THREE.Scene();
      const ambient = new THREE.HemisphereLight(0xf7f3ea, 0x143a68, 1.6);
      world.add(ambient);
      const key = new THREE.PointLight(0xf2c15b, 65, 24);
      key.position.set(0, 5, 5);
      world.add(key);

      const floor = new THREE.Mesh(
        new THREE.CylinderGeometry(7, 8, .25, 64),
        new THREE.MeshStandardMaterial({color:0x0e2948,roughness:.78,metalness:.12})
      );
      floor.position.y = -3;
      floor.rotation.x = Math.PI / 2;
      world.add(floor);

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(7.1, 4.8, .35),
        new THREE.MeshStandardMaterial({color:0xf2c15b,roughness:.4,metalness:.45})
      );
      frame.position.set(0, 1.15, -1.2);
      world.add(frame);

      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(6.55, 4.25, .28),
        new THREE.MeshStandardMaterial({color:0x102d52,roughness:.32,metalness:.18,emissive:0x081a30,emissiveIntensity:.55})
      );
      screen.position.set(0, 1.15, -1.02);
      world.add(screen);

      const reelMat = new THREE.MeshStandardMaterial({color:0xd99a26,roughness:.45,metalness:.5});
      for (const x of [-4.3,4.3]) {
        const reel = new THREE.Mesh(new THREE.TorusGeometry(1.05,.08,12,48), reelMat);
        reel.position.set(x, 2.2, -2.2);
        reel.rotation.y = Math.PI / 2;
        world.add(reel);
      }

      const stars = new THREE.BufferGeometry();
      const positions = new Float32Array(180 * 3);
      for(let i=0;i<180;i++){
        positions[i*3]=(Math.random()-.5)*18;
        positions[i*3+1]=(Math.random()-.5)*11;
        positions[i*3+2]=(Math.random()-.5)*8-1;
      }
      stars.setAttribute('position',new THREE.BufferAttribute(positions,3));
      const starPoints = new THREE.Points(stars,new THREE.PointsMaterial({color:0xf2c15b,size:.025,transparent:true,opacity:.55}));
      world.add(starPoints);

      let mx=0,my=0,cx=0,cy=0;
      scene.addEventListener('pointermove',e=>{
        const r=scene.getBoundingClientRect();
        mx=((e.clientX-r.left)/r.width-.5);
        my=((e.clientY-r.top)/r.height-.5);
      });

      const resize=()=>{
        const w=scene.clientWidth,h=scene.clientHeight;
        camera.aspect=w/h;
        camera.updateProjectionMatrix();
        renderer.setSize(w,h,false);
      };
      window.addEventListener('resize',resize,{passive:true});

      const animate=()=>{
        cx+=(mx-cx)*.035;
        cy+=(my-cy)*.035;
        camera.position.x=cx*.7;
        camera.position.y=1.4-cy*.45;
        camera.lookAt(0,0,-1);
        frame.rotation.y=cx*.025;
        screen.rotation.y=cx*.025;
        starPoints.rotation.y+=.00018;
        renderer.render(world,camera);
        requestAnimationFrame(animate);
      };
      animate();
      resize();
    } catch (error) {
      console.info('3D enhancement unavailable; CSS scenery remains active.', error);
    }
  }

  mountThreeScene();

  const fallback = scene?.querySelector('.scene-fallback');
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
    if (fallback) fallback.style.transform = 'translate3d(var(--mx,0),var(--my,0),0) scale(1.04)';
  }

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
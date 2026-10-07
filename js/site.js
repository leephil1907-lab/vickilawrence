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


  // Shoutout form: live submissions stay disabled until an authorized Formspree endpoint is configured.
  const shoutoutForm = document.getElementById('shoutoutForm');
  const shoutoutType = document.getElementById('shoutoutRequestType');
  const selectedRequest = document.getElementById('selectedRequest');
  const shoutoutStatus = document.getElementById('formStatus');
  const shoutoutSubmit = document.getElementById('shoutoutSubmit');
  const paymentArea = document.getElementById('paymentArea');
  const paymentButton = document.getElementById('paymentButton');

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
        shoutoutStatus.textContent = 'Connect the authorized Formspree endpoint before enabling live submissions.';
        return;
      }
      shoutoutStatus.className = 'form-status';
      shoutoutStatus.textContent = 'Submitting your request...';
      shoutoutSubmit.disabled = true;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(shoutoutForm),
          headers: {Accept: 'application/json'}
        });
        if (!response.ok) throw new Error('Request submission failed');
        shoutoutStatus.className = 'form-status success';
        shoutoutStatus.textContent = 'Thank you. Your request has been submitted for review.';
        shoutoutForm.reset();
        if (selectedRequest) selectedRequest.textContent = 'Select a request type';
        // Payment is deliberately not activated until an authorized Stripe Payment Link is configured.
        if (paymentArea) paymentArea.hidden = true;
        if (paymentButton) paymentButton.hidden = true;
      } catch (error) {
        shoutoutStatus.className = 'form-status error';
        shoutoutStatus.textContent = 'Something went wrong. Please try again or contact support.';
      } finally {
        shoutoutSubmit.disabled = false;
      }
    });
  }


  const shoutoutForm = document.getElementById('shoutoutForm');
  if (shoutoutForm) {
    const requestTypeField = document.getElementById('requestType');
    const selectedRequest = document.getElementById('selectedRequest');
    const formStatus = document.getElementById('formStatus');
    const shoutoutSubmit = document.getElementById('shoutoutSubmit');
    const paymentLink = document.getElementById('paymentLink');
    const configuredPaymentLink = ''; // Add an authorized Stripe Payment Link here before launch.

    requestTypeField?.addEventListener('change', () => {
      if (selectedRequest) selectedRequest.textContent = requestTypeField.value || 'Select a request type';
    });

    shoutoutForm.addEventListener('submit', async event => {
      event.preventDefault();
      const endpoint = shoutoutForm.action;
      if (endpoint.includes('YOUR_FORM_ID')) {
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Connect the authorized Formspree endpoint before enabling live submissions.';
        return;
      }

      formStatus.className = 'form-status';
      formStatus.textContent = 'Submitting your request...';
      shoutoutSubmit.disabled = true;
      if (paymentLink) paymentLink.hidden = true;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(shoutoutForm),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Request submission failed');

        formStatus.className = 'form-status success';
        formStatus.textContent = 'Thank you. Your request has been submitted for review.';
        shoutoutForm.reset();
        if (selectedRequest) selectedRequest.textContent = 'Select a request type';

        if (configuredPaymentLink && paymentLink) {
          paymentLink.href = configuredPaymentLink;
          paymentLink.hidden = false;
        }
      } catch (error) {
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Something went wrong. Please try again or contact support.';
      } finally {
        shoutoutSubmit.disabled = false;
      }
    });
  }

  // Fan experience UI is intentionally preview-only until official authorization and secure backend workflows exist.
  const cardForm = document.getElementById('cardForm');
  if (cardForm) {
    const memberName = document.getElementById('memberName');
    const memberPlan = document.getElementById('memberPlan');
    const cardName = document.getElementById('cardName');
    const cardPlan = document.getElementById('cardPlan');
    const cardId = document.getElementById('cardId');
    cardForm.addEventListener('submit', event => {
      event.preventDefault();
      cardName.textContent = memberName.value.trim();
      cardPlan.textContent = memberPlan.value;
      cardId.textContent = 'VL-PREVIEW';
      document.getElementById('qrBox').textContent = 'PREVIEW';
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
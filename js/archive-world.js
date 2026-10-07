(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const page = document.querySelector('.route-page');
  if (!page || document.querySelector('.archive-world-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'archive-world-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  page.prepend(canvas);

  const glow = document.createElement('div');
  glow.className = 'archive-world-glow';
  glow.setAttribute('aria-hidden', 'true');
  page.appendChild(glow);

  const accentMap = {
    'about.html': 0x5b3a72,
    'works.html': 0x1f4e8c,
    'gallery.html': 0xd99a26,
    'news.html': 0x143a68,
    'events.html': 0xd99a26,
    'fan-club.html': 0x5b3a72,
    'contact.html': 0x1f4e8c,
    'register.html': 0x5b3a72,
    'signin.html': 0x1f4e8c,
    'account.html': 0xd99a26
  };
  const key = location.pathname.split('/').pop() || 'about.html';
  const accent = accentMap[key] || 0x1f4e8c;

  (async () => {
    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
      const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(page.clientWidth, page.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, page.clientWidth / page.clientHeight, .1, 100);
      camera.position.set(0, 0.2, 11);

      scene.add(new THREE.HemisphereLight(0xf7f3ea, 0x143a68, 1.5));
      const keyLight = new THREE.PointLight(accent, 45, 22);
      keyLight.position.set(4, 4, 5);
      scene.add(keyLight);

      const group = new THREE.Group();
      scene.add(group);

      const frameMaterial = new THREE.MeshStandardMaterial({
        color: accent, roughness:.35, metalness:.55, emissive:accent, emissiveIntensity:.08
      });
      const darkMaterial = new THREE.MeshStandardMaterial({
        color:0x143a68, roughness:.7, metalness:.12, transparent:true, opacity:.88
      });

      const ring = new THREE.Mesh(new THREE.TorusGeometry(3.7,.035,10,96), frameMaterial);
      ring.rotation.x = Math.PI * .5;
      ring.position.z = -1.5;
      group.add(ring);

      const inner = new THREE.Mesh(new THREE.TorusGeometry(2.8,.018,8,80), frameMaterial);
      inner.rotation.x = Math.PI * .5;
      inner.position.z = -1.7;
      group.add(inner);

      for (let i=0;i<7;i++) {
        const angle = (i/7)*Math.PI*2;
        const card = new THREE.Mesh(
          new THREE.BoxGeometry(1.65,2.2,.08),
          new THREE.MeshStandardMaterial({
            color:0xf7f3ea, roughness:.52, metalness:.04,
            emissive:accent, emissiveIntensity:.025
          })
        );
        card.position.set(Math.cos(angle)*3.9, Math.sin(angle)*2.05, -1.2 + Math.sin(angle)*.8);
        card.rotation.z = -angle*.28;
        card.rotation.y = (i%2 ? .18 : -.18);
        group.add(card);
      }

      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.45,.28,64), darkMaterial);
      pedestal.position.set(0,-2.2,-1);
      group.add(pedestal);

      const particles = new THREE.BufferGeometry();
      const count = 260;
      const positions = new Float32Array(count*3);
      for(let i=0;i<count;i++){
        positions[i*3]=(Math.random()-.5)*18;
        positions[i*3+1]=(Math.random()-.5)*11;
        positions[i*3+2]=(Math.random()-.5)*7-2;
      }
      particles.setAttribute('position',new THREE.BufferAttribute(positions,3));
      const points = new THREE.Points(particles,new THREE.PointsMaterial({color:accent,size:.022,transparent:true,opacity:.48}));
      scene.add(points);

      let tx=0,ty=0,x=0,y=0;
      const move=e=>{
        const r=page.getBoundingClientRect();
        tx=((e.clientX-r.left)/r.width-.5);
        ty=((e.clientY-r.top)/r.height-.5);
        glow.style.left=(e.clientX-r.left)+'px';
        glow.style.top=(e.clientY-r.top)+'px';
      };
      page.addEventListener('pointermove',move,{passive:true});

      const resize=()=>{
        const w=Math.max(1,page.clientWidth),h=Math.max(1,page.clientHeight);
        camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false);
      };
      window.addEventListener('resize',resize,{passive:true});
      resize();

      let raf=0;
      const animate=()=>{
        x+=(tx-x)*.025; y+=(ty-y)*.025;
        group.rotation.y=x*.22;
        group.rotation.x=-y*.12;
        group.position.x=x*.45;
        group.position.y=-y*.22;
        ring.rotation.z+=.0014;
        inner.rotation.z-=.001;
        points.rotation.y+=.00025;
        camera.position.x=x*.35;
        camera.position.y=.2-y*.22;
        camera.lookAt(0,0,-1);
        renderer.render(scene,camera);
        raf=requestAnimationFrame(animate);
      };
      animate();
      window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);renderer.dispose();});
    } catch (error) {
      canvas.remove();
      glow.remove();
      console.info('Archive world unavailable; editorial fallback remains active.', error);
    }
  })();
})();
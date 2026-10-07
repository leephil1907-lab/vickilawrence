(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page = document.querySelector('.route-page') || document.querySelector('.scene');
  if (!page || document.querySelector('.archive-world-canvas')) return;
  if (reduce) return;

  const route = location.pathname.split('/').pop() || 'index.html';
  const worlds = {
    'index.html': {name:'Theatre', accent:0xd99a26, title:'THE ARCHIVE THEATRE'},
    'about.html': {name:'Backstage', accent:0x5b3a72, title:'BACKSTAGE'},
    'works.html': {name:'Career Orbit', accent:0x1f4e8c, title:'CAREER ORBIT'},
    'gallery.html': {name:'Exhibition', accent:0xd99a26, title:'THE EXHIBITION'},
    'news.html': {name:'Press Room', accent:0x143a68, title:'PRESS ROOM'},
    'events.html': {name:'Marquee', accent:0xd99a26, title:'THE MARQUEE'},
    'fan-club.html': {name:'Lounge', accent:0x5b3a72, title:'ARCHIVE LOUNGE'},
    'contact.html': {name:'Correspondence', accent:0x1f4e8c, title:'CORRESPONDENCE DESK'},
    'register.html': {name:'Lounge', accent:0x5b3a72, title:'ARCHIVE LOUNGE'},
    'signup.html': {name:'Lounge', accent:0x5b3a72, title:'ARCHIVE LOUNGE'},
    'signin.html': {name:'Correspondence', accent:0x1f4e8c, title:'ARCHIVE ACCESS'},
    'account.html': {name:'Lounge', accent:0xd99a26, title:'MEMBER LOUNGE'}
  };
  const world = worlds[route] || worlds['index.html'];

  const canvas = document.createElement('canvas');
  canvas.className = 'archive-world-canvas';
  canvas.setAttribute('aria-hidden','true');
  page.prepend(canvas);

  const glow = document.createElement('div');
  glow.className = 'archive-world-glow';
  glow.setAttribute('aria-hidden','true');
  page.appendChild(glow);

  const label = document.createElement('div');
  label.className = 'archive-world-label';
  label.innerHTML = '<span>ARCHIVE WORLD</span><strong>' + world.title + '</strong>';
  page.appendChild(label);

  (async () => {
    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
      const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
      renderer.setSize(Math.max(1,page.clientWidth),Math.max(1,page.clientHeight),false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0b1c2d,.035);
      const camera = new THREE.PerspectiveCamera(35, page.clientWidth / page.clientHeight,.1,100);
      camera.position.set(0,.15,11);

      scene.add(new THREE.HemisphereLight(0xf7f3ea,0x143a68,1.35));
      const key = new THREE.PointLight(world.accent,38,24);
      key.position.set(4,4,6);
      scene.add(key);

      const root = new THREE.Group();
      scene.add(root);

      const accent = new THREE.MeshStandardMaterial({color:world.accent,roughness:.28,metalness:.62,emissive:world.accent,emissiveIntensity:.08});
      const cream = new THREE.MeshStandardMaterial({color:0xf7f3ea,roughness:.5,metalness:.03});
      const dark = new THREE.MeshStandardMaterial({color:0x102a45,roughness:.72,metalness:.16,transparent:true,opacity:.9});
      const gold = new THREE.MeshStandardMaterial({color:0xf2c15b,roughness:.25,metalness:.55,emissive:0xd99a26,emissiveIntensity:.06});

      const addBox=(w,h,d,x,y,z,mat=accent)=>{
        const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);root.add(m);return m;
      };
      const addRing=(r,t,z,rot='x',mat=accent)=>{
        const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,12,96),mat);
        if(rot==='x')m.rotation.x=Math.PI*.5;
        if(rot==='y')m.rotation.y=Math.PI*.5;
        m.position.z=z;root.add(m);return m;
      };

      // Shared stage / room architecture.
      addBox(15,.12,8,0,-3.25,-2,dark);
      addRing(4.1,.035,-2.2,'x',accent);
      addRing(3.1,.018,-2.4,'x',gold);

      const objects=[];
      const addObject=(mesh,name,target)=>{
        mesh.userData={name,target};
        objects.push(mesh);
        return mesh;
      };

      if(world.name==='Theatre'){
        const tv=addObject(addBox(4.7,3.1,.35,0,.25,-1.4,dark),'Television','works.html');
        addBox(4.25,2.55,.08,0,.25,-1.18,cream);
        for(let i=-4;i<=4;i++){addBox(.09,.35,.08,i*.55,2.2,-1.1,gold);}
        addRing(4.4,.025,-1.8,'x',accent);
      } else if(world.name==='Backstage'){
        for(let i=0;i<5;i++){
          const drawer=addObject(addBox(2.8,.48,.45,0,1.9-i*.78,-1.3, i===2?accent:dark),'Archive drawer '+(i+1),'about.html');
          drawer.userData.target='about.html';
        }
        addBox(3.2,.16,2.4,0,2.3,-1.5,cream);
        addRing(2.6,.025,-1.8,'y',accent);
      } else if(world.name==='Career Orbit'){
        for(let i=0;i<8;i++){
          const a=i/8*Math.PI*2;
          const card=addObject(addBox(1.35,1.8,.09,Math.cos(a)*4.0,Math.sin(a)*2.1,-1.1+Math.sin(a)*.8,i%2?cream:dark),'Career chapter '+(i+1),'works.html');
          card.rotation.z=-a*.3;card.rotation.y=i%2?.16:-.16;
        }
        addRing(4.3,.045,-1.7,'x',accent);
      } else if(world.name==='Exhibition'){
        for(let i=0;i<6;i++){
          const a=(i-2.5)*.42;
          const frame=addObject(addBox(1.7,2.3,.12,a*3.0,.25,-1.6+Math.abs(a)*.5,i%2?cream:dark),'Gallery frame '+(i+1),'gallery.html');
          frame.rotation.y=-a*.28;
        }
      } else if(world.name==='Press Room'){
        addBox(6.4,3.5,.18,0,.3,-1.8,cream);
        for(let i=0;i<5;i++) addObject(addBox(1.05,1.45,.16,-2.45+i*1.23,1.15,-1.55,i%2?dark:cream),'Press file '+(i+1),'news.html');
        addRing(3.2,.03,-2.1,'x',accent);
      } else if(world.name==='Marquee'){
        addBox(7.2,2.7,.2,0,.7,-1.7,dark);
        for(let i=-5;i<=5;i++) addObject(addBox(.28,.28,.25,i*.62,1.65,-1.5,gold),'Marquee light','events.html');
        addRing(3.4,.035,-2,'x',gold);
      } else if(world.name==='Lounge'){
        addBox(6.5,.28,3.4,0,-1.6,-1.8,dark);
        addBox(3.4,1.1,.7,0,-.55,-1.55,accent);
        for(let i=-2;i<=2;i++) addObject(addBox(.65,1.4,.12,i*1.15,1.1,-1.3,i%2?cream:gold),'Member archive','fan-club.html');
      } else {
        addBox(6.4,3.5,.2,0,.2,-1.8,dark);
        addObject(addBox(2.2,2.8,.18,0,.35,-1.55,cream),'Correspondence desk','contact.html');
        addRing(2.9,.035,-2,'x',accent);
      }

      const particles=new THREE.BufferGeometry();
      const count=320, positions=new Float32Array(count*3);
      for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*18;positions[i*3+1]=(Math.random()-.5)*11;positions[i*3+2]=(Math.random()-.5)*7-2;}
      particles.setAttribute('position',new THREE.BufferAttribute(positions,3));
      scene.add(new THREE.Points(particles,new THREE.PointsMaterial({color:world.accent,size:.022,transparent:true,opacity:.42})));

      let tx=0,ty=0,sx=0,sy=0,scrollTarget=0;
      const move=e=>{
        const r=page.getBoundingClientRect();
        tx=(e.clientX-r.left)/Math.max(1,r.width)-.5;
        ty=(e.clientY-r.top)/Math.max(1,r.height)-.5;
        glow.style.left=(e.clientX-r.left)+'px';glow.style.top=(e.clientY-r.top)+'px';
      };
      const scroll=()=>{scrollTarget=Math.min(1,Math.max(0,(window.scrollY)/(Math.max(1,document.documentElement.scrollHeight-innerHeight)));};
      page.addEventListener('pointermove',move,{passive:true});
      window.addEventListener('scroll',scroll,{passive:true});
      scroll();

      const activate=e=>{
        const hit=objects.find(o=>{
          const box=new THREE.Box3().setFromObject(o);
          return box.distanceToPoint(camera.position)<5;
        });
        if(hit?.userData?.target && e.detail===2) location.href=hit.userData.target;
      };
      page.addEventListener('dblclick',activate);

      const resize=()=>{
        const w=Math.max(1,page.clientWidth),h=Math.max(1,page.clientHeight);
        camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
      };
      window.addEventListener('resize',resize,{passive:true});resize();

      let raf=0;
      const clock=new THREE.Clock();
      const animate=()=>{
        const t=clock.getElapsedTime();
        sx+=(tx-sx)*.035;sy+=(ty-sy)*.035;
        root.rotation.y=sx*.20+t*.018;
        root.rotation.x=-sy*.10+scrollTarget*.05;
        root.position.x=sx*.35;
        root.position.y=-sy*.18-scrollTarget*.7;
        camera.position.x=sx*.3;
        camera.position.y=.15-sy*.18+scrollTarget*.25;
        camera.position.z=11-scrollTarget*1.4;
        camera.lookAt(0,.1,-1.4);
        key.position.x=4+sx*3;key.position.y=4-sy*2;
        renderer.render(scene,camera);
        raf=requestAnimationFrame(animate);
      };
      animate();

      window.addEventListener('pagehide',()=>{
        cancelAnimationFrame(raf);
        page.removeEventListener('pointermove',move);
        window.removeEventListener('scroll',scroll);
        window.removeEventListener('resize',resize);
        page.removeEventListener('dblclick',activate);
        renderer.dispose();
        particles.dispose();
      });
    } catch(error){
      canvas.remove();glow.remove();label.remove();
      console.info('Archive world unavailable; editorial fallback remains active.',error);
    }
  })();
})();
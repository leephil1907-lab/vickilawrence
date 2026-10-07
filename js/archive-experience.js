(() => {
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cfg=window.VL_PUBLIC_CONFIG||{};
  const sb=cfg.supabaseUrl&&cfg.supabasePublishableKey&&window.supabase?.createClient?window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey):null;
  const route=location.pathname.split('/').pop()||'index.html';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function panel(title,text,kicker='ARCHIVE CHAPTER'){
    document.querySelector('.cinematic-panel')?.remove();
    const e=document.createElement('aside');e.className='cinematic-panel';
    e.innerHTML='<button class="cinematic-close" type="button" aria-label="Close chapter">×</button><span>'+esc(kicker)+'</span><h2>'+esc(title)+'</h2><p>'+esc(text)+'</p>';
    e.querySelector('button').onclick=()=>e.remove();document.body.appendChild(e);requestAnimationFrame(()=>e.classList.add('open'));
  }
  function home(){
    const scene=document.querySelector('.scene');if(!scene)return;
    const chapters=[
      ['01 · THE HOUSE LIGHTS','The archive opens.','Enter a theatre-shaped archive where the work is revealed chapter by chapter.'],
      ['02 · TELEVISION','A defining television era.','The Carol Burnett Show and Mama’s Family form two essential rooms in the career archive.'],
      ['03 · MUSIC','A voice beyond the screen.','Explore the recording chapter surrounding The Night the Lights Went Out in Georgia.'],
      ['04 · LEGACY','The archive keeps moving.','Verified updates, approved photography and new archive chapters can appear from the private desk.']
    ];
    const rail=document.createElement('div');rail.className='chapter-rail';rail.innerHTML=chapters.map((c,i)=>'<button type="button" data-chapter="'+i+'"><i></i><span>'+c[0]+'</span></button>').join('');scene.appendChild(rail);
    const badge=document.createElement('div');badge.className='scene-chapter';scene.appendChild(badge);
    const update=()=>{const p=Math.min(1,Math.max(0,scrollY/Math.max(1,innerHeight*3)));let idx=0;chapters.forEach((c,i)=>{if(p>=i/(chapters.length))idx=i});const c=chapters[idx];badge.innerHTML='<span>'+c[0]+'</span><strong>'+c[1]+'</strong>';rail.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active',i===idx));scene.style.setProperty('--chapter-progress',p)};
    rail.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>scrollTo({top:(i/chapters.length)*innerHeight*3,behavior:reduce?'auto':'smooth'}));
    addEventListener('scroll',update,{passive:true});update();
    const actions=scene.querySelector('.hero-actions');if(actions){const b=document.createElement('button');b.className='btn btn-ghost archive-enter';b.type='button';b.textContent='Enter theatre';b.onclick=()=>panel('The Archive Theatre','A living interface for verified career history, published announcements, approved photography and future archive chapters.','ENTER THE EXPERIENCE');actions.appendChild(b)}
  }
  async function works(){
    const mount=document.querySelector('#liveWorks');if(!mount)return;
    const orbit=document.createElement('div');orbit.className='career-orbit-ui';orbit.innerHTML='<div class="orbit-center"><span>VL</span><small>CAREER<br>ORBIT</small></div><div class="orbit-stage"></div>';mount.parentNode.insertBefore(orbit,mount);
    let data=[];if(sb){const q=await sb.from('works').select('id,title,work_type,year,description,poster_url,trailer_url,featured,published').eq('published',true).order('featured',{ascending:false}).order('year',{ascending:true}).limit(24);data=q.data||[]}
    if(!data.length)data=[{id:'carol',title:'The Carol Burnett Show',work_type:'television',year:1967,description:'A defining chapter in variety television.'},{id:'lights',title:'The Night the Lights Went Out in Georgia',work_type:'music',year:1973,description:'A landmark recording chapter.'},{id:'emmy',title:'Primetime Emmy',work_type:'television',year:1976,description:'A major award milestone.'},{id:'mama',title:"Mama's Family",work_type:'television',year:1983,description:'Thelma Harper becomes the center of her own sitcom.'}];
    const stage=orbit.querySelector('.orbit-stage');
    stage.innerHTML=data.map((w,i)=>'<button class="orbit-work" type="button" data-index="'+i+'" style="--i:'+i+'"><span class="orbit-year">'+esc(w.year||'—')+'</span><strong>'+esc(w.title)+'</strong><small>'+esc(w.work_type||'archive')+'</small></button>').join('');
    const syncWorld=()=>{document.querySelectorAll('.orbit-work').forEach((el,i)=>{const w=data[i];el.style.setProperty('--orbit-depth',w?.featured?'1':'0');el.style.setProperty('--orbit-angle',((i/Math.max(1,data.length))*360)+'deg')})};
    syncWorld();
    const cards=[...stage.children];cards.forEach((c,i)=>c.onclick=()=>{const w=data[i];cards.forEach(x=>x.classList.remove('active'));c.classList.add('active');panel(w.title,(w.description||'Verified archive entry.')+(w.year?' Year: '+w.year+'.':''),'CAREER ORBIT · '+String(w.work_type||'ARCHIVE').toUpperCase())});cards[0]?.classList.add('active');
    document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{const wanted=b.dataset.filter;cards.forEach(c=>{const w=data[Number(c.dataset.index)];c.hidden=wanted!=='all'&&w.work_type!==wanted})}));
    orbit.addEventListener('pointermove',e=>{const r=orbit.getBoundingClientRect();orbit.style.setProperty('--ox',((e.clientX-r.left)/r.width-.5).toFixed(3));orbit.style.setProperty('--oy',((e.clientY-r.top)/r.height-.5).toFixed(3))});
    if(sb) sb.channel('works-world-live').on('postgres_changes',{event:'*',schema:'public',table:'works'},async()=>{const q=await sb.from('works').select('id,title,work_type,year,description,poster_url,trailer_url,featured,published').eq('published',true).order('featured',{ascending:false}).order('year',{ascending:true}).limit(24);data=q.data||[];stage.innerHTML=data.map((w,i)=>'<button class="orbit-work" type="button" data-index="'+i+'"><span class="orbit-year">'+esc(w.year||'—')+'</span><strong>'+esc(w.title)+'</strong><small>'+esc(w.work_type||'archive')+'</small></button>').join('');stage.querySelectorAll('.orbit-work').forEach((el,i)=>el.onclick=()=>{const w=data[i];panel(w.title,(w.description||'Verified archive entry.')+(w.year?' Year: '+w.year+'.':''),'CAREER ORBIT · '+String(w.work_type||'ARCHIVE').toUpperCase())});syncWorld()}).subscribe();
  }
  function gallery(){
    const mount=document.querySelector('[data-gallery-live]');if(!mount)return;
    const stage=document.createElement('div');stage.className='gallery-exhibition-stage';stage.innerHTML='<div class="gallery-wall"></div><div class="gallery-cursor">MOVE THROUGH THE EXHIBITION</div>';mount.parentNode.insertBefore(stage,mount);
    const render=()=>{const cards=[...mount.querySelectorAll('.dynamic-gallery-card')];if(!cards.length)return;const wall=stage.querySelector('.gallery-wall');wall.innerHTML=cards.map((c,i)=>{const img=c.querySelector('img'),title=c.querySelector('span')?.textContent||'Archive photograph';return '<button type="button" class="exhibit-frame" data-index="'+i+'"><img src="'+esc(img?.src||'')+'" alt="'+esc(img?.alt||title)+'"><span>'+esc(title)+'</span></button>'}).join('');wall.querySelectorAll('.exhibit-frame').forEach((b,i)=>b.onclick=()=>open(cards[i]))};
    const open=card=>{const img=card.querySelector('img'),title=card.querySelector('span')?.textContent||'Archive photograph';const m=document.createElement('div');m.className='gallery-exhibit-modal';m.innerHTML='<button type="button" aria-label="Close">×</button><figure><img src="'+esc(img.src)+'" alt="'+esc(img.alt||title)+'"><figcaption><span>ARCHIVE PHOTOGRAPH</span><strong>'+esc(title)+'</strong></figcaption></figure>';m.querySelector('button').onclick=()=>m.remove();m.onclick=e=>{if(e.target===m)m.remove()};document.body.appendChild(m);requestAnimationFrame(()=>m.classList.add('open'))};
    new MutationObserver(render).observe(mount,{childList:true});render();
    stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();stage.style.setProperty('--gx',((e.clientX-r.left)/r.width-.5).toFixed(3));stage.style.setProperty('--gy',((e.clientY-r.top)/r.height-.5).toFixed(3))});
  }
  if(route==='index.html')home();if(route==='works.html')works();if(route==='gallery.html')gallery();
})();
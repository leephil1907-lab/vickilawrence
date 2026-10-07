(() => {
  const cfg=window.VL_PUBLIC_CONFIG||{};
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url=v=>/^(https?:|\/|#)/i.test(String(v||''))?String(v):'#';
  const client=cfg.supabaseUrl&&cfg.supabasePublishableKey&&window.supabase?.createClient?window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey):null;

  function mountLiveRail(){
    if(document.querySelector('[data-live-archive]')) return;
    const nav=document.querySelector('.site-nav'); if(!nav) return;
    const rail=document.createElement('div'); rail.className='live-archive-rail'; rail.dataset.liveArchive='true';
    rail.innerHTML='<span class="live-dot"></span><span>ARCHIVE LIVE</span><span class="live-clock"></span>';
    document.body.appendChild(rail);
    const clock=rail.querySelector('.live-clock');
    const tick=()=>clock.textContent=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit'}).format(new Date());
    tick(); setInterval(tick,30000);
  }

  function mountDynamicDock(){
    if(document.querySelector('.dynamic-dock')) return;
    const dock=document.createElement('aside');dock.className='dynamic-dock';
    dock.setAttribute('aria-label','Live archive controls');
    dock.innerHTML='<button type="button" data-dock="news">News</button><button type="button" data-dock="events">Events</button><button type="button" data-dock="gallery">Gallery</button><button type="button" data-dock="account">Account</button>';
    document.body.appendChild(dock);
    dock.querySelector('[data-dock="news"]').onclick=()=>location.href='news.html';
    dock.querySelector('[data-dock="events"]').onclick=()=>location.href='events.html';
    dock.querySelector('[data-dock="gallery"]').onclick=()=>location.href='gallery.html';
    dock.querySelector('[data-dock="account"]').onclick=()=>location.href='account.html';
  }

  async function get(table,query=''){
    if(!client) return [];
    try{const q=await client.from(table).select('*').order("created_at",{ascending:false}).limit(12);return q.error?[]:(q.data||[])}catch{return []}
  }

  function injectRealtimeBanner(){
    if(document.querySelector('.realtime-banner'))return;
    const el=document.createElement('div');el.className='realtime-banner';el.innerHTML='<span>Live archive publishing</span><b>Updates from the private archive desk appear here automatically.</b>';document.body.appendChild(el);
  }

  async function dynamicHome(){
    const feed=document.querySelector('#announcementFeed'); if(!feed||!client)return;
    const {data}=await client.from('announcements').select('id,title,body,image_url,button_text,button_url').in('placement',['homepage','both']).eq('status','published').order('created_at',{ascending:false}).limit(6);
    if(data?.length){
      feed.innerHTML=data.map(a=>'<article class="announcement-item dynamic-item"><div><span class="announcement-kicker">LIVE ARCHIVE</span><h3>'+esc(a.title)+'</h3><p>'+esc(a.body)+'</p></div>'+(a.button_url?'<a class="btn btn-gold" href="'+url(a.button_url)+'">'+esc(a.button_text||'Open')+'</a>':'')+'</article>').join('');
      document.querySelector('#liveAnnouncements')?.removeAttribute('hidden');
    }
  }

  async function dynamicNews(){
    const mount=document.querySelector('[data-news-live]');if(!mount||!client)return;
    const {data}=await client.from('announcements').select('id,title,body,image_url,created_at,button_text,button_url').in('placement',['news','both']).eq('status','published').order('created_at',{ascending:false}).limit(12);
    if(!data?.length){mount.innerHTML='<div class="dynamic-empty">The press room is ready for verified announcements. Published updates will appear here automatically.</div>';return}
    mount.innerHTML=data.map(a=>'<article class="dynamic-event"><div class="dynamic-date">'+new Date(a.created_at).toLocaleDateString(undefined,{month:'short',day:'numeric'})+'</div><div><span class="announcement-kicker">VERIFIED ARCHIVE UPDATE</span><h3>'+esc(a.title)+'</h3><p>'+esc(a.body)+'</p>'+(a.button_url?'<a class="btn btn-outline" href="'+url(a.button_url)+'">'+esc(a.button_text||'Read more')+'</a>':'')+'</div></article>').join('');
  }

  async function dynamicEvents(){
    const mount=document.querySelector('[data-events-live]');if(!mount||!client)return;
    const {data}=await client.from('events').select('id,title,description,location,starts_at,image_url,rsvp_url').eq('status','published').gte('starts_at',new Date().toISOString()).order('starts_at',{ascending:true}).limit(12);
    if(!data?.length){mount.innerHTML='<div class="dynamic-empty">The events desk is quiet right now. New published dates will appear here automatically.</div>';return}
    mount.innerHTML=data.map(e=>{const d=e.starts_at?new Date(e.starts_at):null;return '<article class="dynamic-event"><div class="dynamic-date">'+(d?d.toLocaleDateString(undefined,{month:'short',day:'numeric'}):'TBA')+'</div><div><span class="announcement-kicker">'+esc(e.location||'EVENT')</span><h3>'+esc(e.title)+'</h3><p>'+esc(e.description||'Details will be published by the archive desk.')+'</p>'+(e.rsvp_url?'<a class="btn btn-outline" href="'+url(e.rsvp_url)+'" target="_blank" rel="noopener">Event details</a>':'')+'</div></article>'}).join('');
  }

  async function dynamicGallery(){
    const mount=document.querySelector('[data-gallery-live]');if(!mount||!client)return;
    const {data}=await client.from('gallery_items').select('id,title,image_url,alt_text,caption,category,featured').eq('published',true).order('featured',{ascending:false}).order('created_at',{ascending:false}).limit(24);
    if(!data?.length){mount.innerHTML='<div class="dynamic-empty">The exhibition room is ready for approved archive photography. Published media will appear here automatically.</div>';return}
    mount.innerHTML=data.map(g=>'<button class="dynamic-gallery-card" type="button" data-image="'+esc(g.image_url)+'" data-title="'+esc(g.title)+'"><img loading="lazy" src="'+url(g.image_url)+'" alt="'+esc(g.alt_text||g.title)+'"><span>'+esc(g.title)+'</span><small>'+esc(g.caption||g.category||'Archive collection')+'</small></button>').join('');
    mount.querySelectorAll('.dynamic-gallery-card').forEach(card=>card.addEventListener('click',()=>openLightbox(card.dataset.image,card.dataset.title)));
  }

  function openLightbox(src,title){
    const old=document.querySelector('.archive-lightbox');old?.remove();
    const box=document.createElement('div');box.className='archive-lightbox';box.innerHTML='<button type="button" aria-label="Close image">×</button><figure><img src="'+url(src)+'" alt="'+esc(title)+'"><figcaption>'+esc(title)+'</figcaption></figure>';
    box.querySelector('button').onclick=()=>box.remove();box.onclick=e=>{if(e.target===box)box.remove()};document.body.appendChild(box);
  }

  function realtime(){
    if(!client)return;
    client.channel('archive-live').on('postgres_changes',{event:'*',schema:'public',table:'announcements'},()=>{dynamicHome();dynamicNews()}).on('postgres_changes',{event:'*',schema:'public',table:'events'},()=>dynamicEvents()).on('postgres_changes',{event:'*',schema:'public',table:'gallery_items'},()=>dynamicGallery()).subscribe();
  }

  function mount3D(){
    if(reduce||document.querySelector('.archive-orbit'))return;
    const hero=document.querySelector('.scene');if(!hero)return;
    const orbit=document.createElement('div');orbit.className='archive-orbit';orbit.innerHTML='<i></i><i></i><i></i><span>VL</span>';hero.appendChild(orbit);
    let raf=0;const move=e=>{const x=(e.clientX/innerWidth-.5)*12,y=(e.clientY/innerHeight-.5)*8;orbit.style.transform='translate3d('+x+'px,'+y+'px,0) rotateX('+(-y*.35)+'deg) rotateY('+(x*.35)+'deg)'};window.addEventListener('pointermove',move,{passive:true});
  }

  function boot(){
    mountLiveRail();mountDynamicDock();injectRealtimeBanner();mount3D();dynamicHome();dynamicNews();dynamicEvents();dynamicGallery();realtime();
    import('./archive-world.js').catch(()=>{});
    document.body.classList.add('archive-runtime');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
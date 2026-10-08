(() => {
  const cfg=window.VL_PUBLIC_CONFIG||{};
  if(!cfg.supabaseUrl||!cfg.supabasePublishableKey||!window.supabase?.createClient) return;
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const signin=new URL('signin.html',location.href).href;
  const setText=(sel,v)=>{const el=document.querySelector(sel);if(el)el.textContent=v??'—'};
  const status=(msg,type='')=>{const el=document.getElementById('accountStatus');if(el){el.textContent=msg;el.className='auth-status '+type}};
  const profileStatus=(msg,type='')=>{const el=document.getElementById('profileStatus');if(el){el.textContent=msg;el.className='auth-status '+type}};
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  async function boot(){
    const {data:{session}}=await client.auth.getSession();
    if(!session){location.href=signin+'?next='+encodeURIComponent(location.href);return}
    const u=session.user;
    const profile=await client.from('member_profiles').select('*').eq('user_id',u.id).maybeSingle();
    const p=profile.data||{};
    const name=p.full_name||u.user_metadata?.display_name||u.user_metadata?.full_name||u.email?.split('@')[0]||'Fan';
    setText('[data-account-name]',name);setText('[data-account-email]',u.email);setText('[data-account-country]',p.country||'Not set');
    setText('[data-account-created]',u.created_at?new Date(u.created_at).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}):'—');
    setText('[data-account-status]',u.email_confirmed_at?'Verified account':'Email verification pending');
    const pill=document.querySelector('[data-account-status-pill]');if(pill)pill.textContent=u.email_confirmed_at?'Verified':'Verification pending';
    const form=document.getElementById('memberProfileForm');if(form){form.full_name.value=name;form.country.value=p.country||'';form.language.value=p.language||'en'}
    const membership=(await client.from('memberships').select('*').eq('user_id',u.id).eq('status','active').order('created_at',{ascending:false}).limit(1).maybeSingle()).data;
    const tier=membership?.tier||'archive';const labels={archive:'ARCHIVE MEMBER',bronze:'VIP BRONZE',silver:'VIP SILVER',gold:'VIP GOLD',diamond:'VIP DIAMOND',legendary:'VIP LEGENDARY'};const tierLabel=labels[tier]||'ARCHIVE MEMBER';
    setText('[data-card-tier]',tierLabel);setText('[data-card-name]',name);setText('[data-card-id]',membership?.member_number||'VL-VIP-000000');setText('[data-card-expiry]',membership?.ends_at?new Date(membership.ends_at).toLocaleDateString(undefined,{month:'short',year:'numeric'}):'—');
    setText('[data-card-note]',membership?'Active membership access':'Account access card'); const card=document.querySelector('[data-member-card]'); if(card){card.dataset.tier=tier; card.classList.remove('tier-bronze','tier-silver','tier-gold','tier-diamond','tier-legendary','tier-archive'); card.classList.add('tier-'+tier)}
    const panel=document.querySelector('[data-membership-panel>div:first-child]');if(panel&&membership){panel.innerHTML='<span class="status-pill">'+esc(tierLabel)+'</span><h3>Membership active</h3><p>Your personalized access card is linked to this account.</p>'}
    const formEl=document.getElementById('memberProfileForm');
    formEl?.addEventListener('submit',async e=>{e.preventDefault();profileStatus('Saving profile…');const vals={user_id:u.id,full_name:formEl.full_name.value.trim(),country:formEl.country.value.trim()||null,language:formEl.language.value};const {error}=await client.from('member_profiles').upsert(vals,{onConflict:'user_id'});profileStatus(error?error.message:'Profile saved. Your access card now uses these details.',error?'error':'success');if(!error){setText('[data-account-name]',vals.full_name||name);setText('[data-card-name]',vals.full_name||name)}});
  }
  boot().catch(e=>status(e.message,'error'));
})();
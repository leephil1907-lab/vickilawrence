(() => {
  const cfg=window.VL_PUBLIC_CONFIG||{};
  if(!cfg.supabaseUrl||!cfg.supabasePublishableKey||!window.supabase?.createClient){
    document.querySelectorAll('[data-auth-status]').forEach(el=>{el.textContent='Authentication is not configured yet.';el.classList.add('error')}); return;
  }
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const accountUrl=new URL('account.html',location.href).href;
  const signinUrl=new URL('signin.html',location.href).href;
  const status=msg=>document.querySelectorAll('[data-auth-status]').forEach(el=>{el.textContent=msg});
  document.getElementById('googleAuth')?.addEventListener('click',async()=>{
    status('Opening Google sign-in…');
    const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:accountUrl}});
    if(error) status(error.message);
  });
  document.getElementById('signupForm')?.addEventListener('submit',async e=>{
    e.preventDefault(); status('Sending your secure sign-in link…');
    const email=e.currentTarget.email.value.trim();
    const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:accountUrl,shouldCreateUser:true}});
    status(error?error.message:'Check your email for the secure link. You can use it to enter the archive.');
  });
  document.getElementById('signinForm')?.addEventListener('submit',async e=>{
    e.preventDefault(); status('Sending your secure sign-in link…');
    const email=e.currentTarget.email.value.trim();
    const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:accountUrl,shouldCreateUser:false}});
    status(error?error.message:'Check your email for the secure sign-in link.');
  });
  document.getElementById('signoutBtn')?.addEventListener('click',async()=>{await client.auth.signOut();location.href=signinUrl});
  if(location.pathname.endsWith('account.html')){
    client.auth.getSession().then(({data})=>{
      if(!data.session){location.href=signinUrl;return}
      const u=data.session.user, name=u.user_metadata?.display_name||u.user_metadata?.full_name||u.email?.split('@')[0]||'Fan';
      document.querySelector('[data-account-name]').textContent=name;
      document.querySelector('[data-account-email]').textContent=u.email||'';
      document.querySelector('[data-account-provider]').textContent=(u.app_metadata?.provider||'email').replace(/^./,c=>c.toUpperCase());
      document.querySelector('[data-account-status]').textContent=u.email_confirmed_at?'Verified account':'Email verification pending';
      document.querySelector('[data-account-created]').textContent=u.created_at?new Date(u.created_at).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}):'—';
      const pill=document.querySelector('[data-account-status-pill]'); if(pill)pill.textContent=u.email_confirmed_at?'Verified':'Verification pending';
    });
  }
})();
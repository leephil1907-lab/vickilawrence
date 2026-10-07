(() => {
  const cfg=window.VL_PUBLIC_CONFIG||{};
  if(!cfg.supabaseUrl||!cfg.supabasePublishableKey||!window.supabase?.createClient){
    document.querySelectorAll('[data-auth-status]').forEach(el=>{el.textContent='Authentication is not configured yet.';el.classList.add('error')});
    return;
  }
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const path=location.pathname.split('/').pop()||'index.html';
  const accountUrl=new URL('account.html',location.href).href;
  const signinUrl=new URL('signin.html',location.href).href;
  const signupUrl=new URL('signup.html',location.href).href;
  const resetUrl=new URL('reset.html',location.href).href;
  const statusEls=document.querySelectorAll('[data-auth-status]');
  const setStatus=(msg,type='')=>statusEls.forEach(el=>{el.textContent=msg;el.className='auth-status '+type});
  const redirect=(url)=>{location.href=url};

  async function getSession(){const {data}=await client.auth.getSession();return data.session}
  async function requireSession(){const session=await getSession();if(!session){redirect(signinUrl+'?next='+encodeURIComponent(location.href));return null}return session}

  document.getElementById('googleAuth')?.addEventListener('click',async()=>{
    setStatus('Opening Google sign-in…');
    const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:accountUrl}});
    if(error)setStatus(error.message,'error');
  });

  document.getElementById('signupForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget;const email=form.email.value.trim();const password=form.password.value;const name=form.name.value.trim();
    setStatus('Creating your archive account…');
    const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:name},emailRedirectTo:accountUrl}});
    if(error){setStatus(error.message,'error');return}
    if(data.session){setStatus('Account created. Opening your account…','success');redirect(accountUrl)}
    else setStatus('Account created. Check your email to verify your address before signing in.','success');
  });

  document.getElementById('signinForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget;
    setStatus('Signing you in…');
    const {data,error}=await client.auth.signInWithPassword({email:form.email.value.trim(),password:form.password.value});
    if(error){setStatus(error.message,'error');return}
    const next=new URLSearchParams(location.search).get('next');
    redirect(next&&next.startsWith(location.origin)?next:accountUrl);
  });

  document.getElementById('resetRequestForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget;setStatus('Sending reset instructions…');
    const {error}=await client.auth.resetPasswordForEmail(form.email.value.trim(),{redirectTo:resetUrl});
    if(error){setStatus(error.message,'error');return}
    setStatus('If that email belongs to an account, reset instructions have been sent.','success');
  });

  document.getElementById('passwordUpdateForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget;const password=form.password.value;
    if(password!==form.confirm.value){setStatus('Passwords do not match.','error');return}
    setStatus('Updating your password…');const {error}=await client.auth.updateUser({password});
    if(error){setStatus(error.message,'error');return}
    setStatus('Password updated. You can now sign in normally.','success');
    setTimeout(()=>redirect(signinUrl),900);
  });

  document.getElementById('signoutBtn')?.addEventListener('click',async()=>{
    await client.auth.signOut();redirect(signinUrl);
  });

  if(path==='account.html'){
    (async()=>{
      const session=await requireSession();if(!session)return;
      const user=session.user;const name=user.user_metadata?.display_name||user.user_metadata?.full_name||user.email?.split('@')[0]||'Fan';
      document.querySelector('[data-account-name]').textContent=name;
      document.querySelector('[data-account-email]').textContent=user.email||'';
      document.querySelector('[data-account-provider]').textContent=(user.app_metadata?.provider||'email').replace(/^./,c=>c.toUpperCase());
      document.querySelector('[data-account-status]').textContent=user.email_confirmed_at?'Verified account':'Email verification pending';
      document.querySelector('[data-account-created]').textContent=user.created_at?new Date(user.created_at).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}):'—';
      const status=document.querySelector('[data-account-status-pill]');if(status)status.textContent=user.email_confirmed_at?'Verified':'Verification pending';
    })();
  }

  client.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_OUT' && path==='account.html') redirect(signinUrl);
  });
})();
(() => {
  const CONFIG = {
    url: '',
    publishableKey: ''
  };
  const panel=document.getElementById('supportChatPanel');
  const toggle=document.getElementById('supportChatToggle');
  const close=document.getElementById('supportChatClose');
  const messagesEl=document.getElementById('supportChatMessages');
  const form=document.getElementById('supportChatForm');
  const input=document.getElementById('supportChatInput');
  const send=document.getElementById('supportChatSend');
  const badge=document.getElementById('supportChatBadge');
  const errorEl=document.getElementById('supportChatError');
  if(!panel||!toggle) return;

  let client=null, user=null, conversation=null, channel=null, ready=false;

  const addMessage=(body,type)=>{
    const el=document.createElement('div');
    el.className='support-message '+type;
    el.textContent=body;
    messagesEl.appendChild(el);
    messagesEl.scrollTop=messagesEl.scrollHeight;
  };

  const showError=(message)=>{
    errorEl.textContent=message;
    errorEl.hidden=false;
  };

  const loadSdk=()=>new Promise((resolve,reject)=>{
    if(window.supabase?.createClient){resolve();return;}
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload=resolve;
    script.onerror=()=>reject(new Error('Support service failed to load.'));
    document.head.appendChild(script);
  });

  const init=async()=>{
    if(ready) return;
    if(!CONFIG.url||!CONFIG.publishableKey){
      showError('Live support is ready in the interface, but the secure support backend still needs to be connected.');
      return;
    }
    try{
      await loadSdk();
      client=window.supabase.createClient(CONFIG.url,CONFIG.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
      let session=(await client.auth.getSession()).data.session;
      if(!session){
        const result=await client.auth.signInAnonymously();
        if(result.error) throw result.error;
        session=result.data.session;
      }
      user=session.user;
      const existing=localStorage.getItem('vl_support_conversation');
      if(existing){
        const q=await client.from('support_conversations').select('*').eq('id',existing).eq('user_id',user.id).maybeSingle();
        if(q.data) conversation=q.data;
      }
      if(!conversation){
        const q=await client.from('support_conversations').insert({user_id:user.id,status:'open'}).select().single();
        if(q.error) throw q.error;
        conversation=q.data;
        localStorage.setItem('vl_support_conversation',conversation.id);
      }
      const history=await client.from('support_messages').select('*').eq('conversation_id',conversation.id).order('created_at',{ascending:true});
      if(history.error) throw history.error;
      messagesEl.innerHTML='';
      if(!history.data.length) addMessage('Hi! Welcome to support. Send us your question and an authorized support team member can reply here.','system');
      history.data.forEach(m=>addMessage(m.body,m.sender_type==='admin'?'admin':'visitor'));
      channel=client.channel('support-chat-'+conversation.id)
        .on('postgres_changes',{event:'INSERT',schema:'public',table:'support_messages',filter:'conversation_id=eq.'+conversation.id},payload=>{
          const m=payload.new;
          if(m.sender_type==='admin'){
            addMessage(m.body,'admin');
            if(!panel.classList.contains('open')) badge.style.display='flex';
          }
        }).subscribe();
      ready=true;
    }catch(err){
      console.error(err);
      showError('Support could not connect right now. Please use the contact desk.');
    }
  };

  toggle.addEventListener('click',async()=>{
    const open=panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(open));
    if(open){badge.style.display='none';await init();input?.focus();}
  });
  close?.addEventListener('click',()=>panel.classList.remove('open'));
  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    const body=input.value.trim();
    if(!body||!conversation||!user||!client) return;
    send.disabled=true;
    const result=await client.from('support_messages').insert({conversation_id:conversation.id,sender_type:'visitor',sender_id:user.id,body});
    if(result.error) showError('Your message could not be sent. Please try again.');
    else { addMessage(body,'visitor'); input.value=''; }
    send.disabled=false;
  });
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form?.requestSubmit();}});
})();
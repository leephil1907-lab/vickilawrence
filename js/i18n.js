(() => {
  const dictionaries={
    en:{name:'English',nav:['About','Career','Gallery','Fan Club','Special Requests','Shoutouts','Events','Contact'],menu:'Open navigation',language:'Language',home:'Home',archive:'Archive',back:'Back to archive',returnHome:'Return home',account:'Account',connect:'Connect'},
    es:{name:'Español',nav:['Acerca de','Carrera','Galería','Club de fans','Solicitudes especiales','Saludos','Eventos','Contacto'],menu:'Abrir navegación',language:'Idioma',home:'Inicio',archive:'Archivo',back:'Volver al archivo',returnHome:'Volver al inicio',account:'Cuenta',connect:'Conectar'},
    fr:{name:'Français',nav:['À propos','Carrière','Galerie','Fan Club','Demandes spéciales','Messages','Événements','Contact'],menu:'Ouvrir la navigation',language:'Langue',home:'Accueil',archive:'Archives',back:'Retour aux archives',returnHome:'Retour à l’accueil',account:'Compte',connect:'Contact'},
    de:{name:'Deutsch',nav:['Über','Karriere','Galerie','Fanclub','Sonderanfragen','Grüße','Events','Kontakt'],menu:'Navigation öffnen',language:'Sprache',home:'Startseite',archive:'Archiv',back:'Zurück zum Archiv',returnHome:'Zur Startseite',account:'Konto',connect:'Kontakt'},
    pt:{name:'Português',nav:['Sobre','Carreira','Galeria','Fã-Clube','Pedidos especiais','Mensagens','Eventos','Contato'],menu:'Abrir navegação',language:'Idioma',home:'Início',archive:'Arquivo',back:'Voltar ao arquivo',returnHome:'Voltar ao início',account:'Conta',connect:'Contato'},
    it:{name:'Italiano',nav:['Informazioni','Carriera','Galleria','Fan Club','Richieste speciali','Messaggi','Eventi','Contatti'],menu:'Apri navigazione',language:'Lingua',home:'Home',archive:'Archivio',back:'Torna all’archivio',returnHome:'Torna alla home',account:'Account',connect:'Contatti'},
    ja:{name:'日本語',nav:['概要','キャリア','ギャラリー','ファンクラブ','特別リクエスト','メッセージ','イベント','お問い合わせ'],menu:'ナビゲーションを開く',language:'言語',home:'ホーム',archive:'アーカイブ',back:'アーカイブへ戻る',returnHome:'ホームへ戻る',account:'アカウント',connect:'つながる'},
    ko:{name:'한국어',nav:['소개','경력','갤러리','팬클럽','특별 요청','메시지','이벤트','연락처'],menu:'탐색 열기',language:'언어',home:'홈',archive:'아카이브',back:'아카이브로 돌아가기',returnHome:'홈으로 돌아가기',account:'계정',connect:'연결'},
    zh:{name:'中文',nav:['关于','事业','画廊','粉丝俱乐部','特别请求','留言','活动','联系'],menu:'打开导航',language:'语言',home:'首页',archive:'档案',back:'返回档案',returnHome:'返回首页',account:'账户',connect:'联系'},
    ar:{name:'العربية',nav:['نبذة','المسيرة','المعرض','نادي المعجبين','طلبات خاصة','رسائل','الفعاليات','اتصل بنا'],menu:'فتح التنقل',language:'اللغة',home:'الرئيسية',archive:'الأرشيف',back:'العودة إلى الأرشيف',returnHome:'العودة للرئيسية',account:'الحساب',connect:'تواصل'}
  };
  const supported=Object.keys(dictionaries);
  const saved=localStorage.getItem('vl-language');
  const browser=(navigator.language||'en').toLowerCase().split('-')[0];
  let lang=supported.includes(saved)?saved:(supported.includes(browser)?browser:'en');
  const t=()=>dictionaries[lang];
  const apply=()=>{
    const d=t(); document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.querySelectorAll('.nav-links a').forEach((a,i)=>{if(d.nav[i])a.textContent=d.nav[i]});
    document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(d[k])el.textContent=d[k]});
    const menu=document.querySelector('.menu');if(menu)menu.setAttribute('aria-label',d.menu);
    const account=document.querySelector('[data-account-link]');if(account)account.textContent=d.account;
    const connect=document.querySelector('.social-label');if(connect)connect.textContent=d.connect;
    const title=document.querySelector('.language-label');if(title)title.textContent=d.language;
    document.querySelectorAll('[data-lang-option]').forEach(o=>o.setAttribute('aria-current',o.dataset.langOption===lang?'true':'false'));
  };
  const mount=()=>{
    const nav=document.querySelector('.site-nav'); if(nav&&!nav.querySelector('.language-switcher')){
      const wrap=document.createElement('div');wrap.className='language-switcher';
      const select=document.createElement('select');select.setAttribute('aria-label',t().language);select.className='language-select';
      supported.forEach(code=>{const o=document.createElement('option');o.value=code;o.textContent=code.toUpperCase()+' · '+dictionaries[code].name;o.dataset.langOption=code;o.setAttribute('data-lang-option',code);select.appendChild(o)});
      select.value=lang;select.addEventListener('change',()=>{lang=select.value;localStorage.setItem('vl-language',lang);apply();});
      wrap.appendChild(select); nav.insertBefore(wrap,nav.querySelector('.menu'));
    }
    const head=document.querySelector('head');if(head&&!head.querySelector('link[data-vl-icon]')){const icon=document.createElement('link');icon.rel='icon';icon.href='assets/vl-mark.svg';icon.type='image/svg+xml';icon.dataset.vlIcon='true';head.appendChild(icon)}
    apply();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
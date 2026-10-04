(function(){
  const LOCALES={
    es_intl:'Español internacional',
    es_es:'España',
    es_mx:'México',
    es_co:'Colombia',
    es_ar:'Argentina',
    es_cl:'Chile',
    es_pa:'Panamá',
    es_cr:'Costa Rica'
  };
  let currentLocale='es_intl';
  const $=s=>document.querySelector(s);
  const profileKey=()=>`lh_v16_last_subject_${$('#profileSelect')?.value||'default'}`;

  function injectStyles(){
    if($('#v16Styles')) return;
    const style=document.createElement('style');
    style.id='v16Styles';
    style.textContent=`
      .main-content{padding-top:18px}
      .topbar{margin-bottom:12px;align-items:center;gap:14px}
      .topbar h2{font-size:1.52rem;margin-top:2px}
      .topbar-actions{gap:7px;max-width:72%;align-items:center}
      .topbar .session-chip,.topbar .streak-card,.topbar .mini-btn{padding:8px 10px;font-size:.77rem;box-shadow:none}
      #ageEyebrow{font-size:.62rem;letter-spacing:.11em}
      #home .hero{min-height:0;padding:22px 26px;background:linear-gradient(135deg,#fffdf8 0%,#f0f6ec 100%)}
      #home .hero:before{height:4px}
      #home .hero:after{display:none}
      #home .hero-copy{max-width:900px}
      #home .hero h3{font-size:1.82rem;line-height:1.12;margin:10px 0 7px;max-width:820px}
      #home .hero p{margin:0 0 14px;font-size:.93rem;max-width:760px}
      #home .hero .pill{padding:5px 8px;font-size:.6rem}
      #home .hero-visual{display:none!important}
      #home .dashboard-grid{margin-top:12px;gap:10px}
      #home .stat{padding:14px 16px;min-height:0}
      #home .stat>span{width:38px;height:38px;font-size:.68rem}
      #home .stat strong{font-size:1.45rem}
      #home .section-grid{margin-top:12px;gap:12px}
      #home .panel-card{padding:20px}
      #home .focus-card{background:linear-gradient(145deg,#1e5236,#173f2b)}
      .level-row{padding:9px 0}
      .level-track{height:8px}
      .v16-locale-panel{margin:-12px 0 14px;padding:12px 14px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.10);border-radius:8px}
      .v16-locale-panel label{display:block;color:#bdd3c4;font-size:.61rem;letter-spacing:.08em;font-weight:850;margin-bottom:6px}
      .v16-locale-panel select{width:100%;padding:9px 10px;border:0;border-radius:6px;background:#f5f1e6;color:#173326;font-weight:800;font-size:.8rem}
      .v16-locale-note{display:block;margin-top:7px;color:#a9c6b1;font-size:.61rem;line-height:1.35}
      .v16-toast{position:fixed;right:22px;bottom:22px;z-index:2000;background:#173c2a;color:#fff;padding:11px 14px;border-radius:8px;box-shadow:0 8px 22px rgba(0,0,0,.18);font-size:.8rem}
      @media(max-width:1050px){.topbar{align-items:flex-start}.topbar-actions{max-width:68%}}
      @media(max-width:950px){.topbar-actions{max-width:100%}#home .hero{padding:20px}}
    `;
    document.head.appendChild(style);
  }

  function toast(msg){
    const old=$('.v16-toast'); if(old) old.remove();
    const el=document.createElement('div'); el.className='v16-toast'; el.textContent=msg; document.body.appendChild(el);
    setTimeout(()=>el.remove(),2200);
  }

  function setText(el,text){ if(el && el.textContent!==text) el.textContent=text; }

  function compactHero(){
    const hero=$('#home .hero'); if(!hero) return;
    const visual=hero.querySelector('.hero-visual'); if(visual) visual.style.display='none';
    setText(hero.querySelector('.pill'),'ENTRENAMIENTO PERSONALIZADO');
    setText(hero.querySelector('h3'),'Continúa tu entrenamiento');
    setText($('#heroText'),'Retoma la última área trabajada o utiliza el refuerzo recomendado para orientar la sesión.');
    const btn=$('#heroStartBtn');
    if(btn && !btn.dataset.v16Bound){
      btn.dataset.v16Bound='1';
      btn.textContent='Continuar entrenamiento →';
      btn.onclick=()=>{
        const wanted=localStorage.getItem(profileKey());
        const target=wanted ? document.querySelector(`#navMenu .nav-item[data-subject="${CSS.escape(wanted)}"]`) : null;
        if(target) target.click();
        else $('#recommendedBtn')?.click();
      };
    }
  }

  function rememberNavigation(){
    const nav=$('#navMenu'); if(!nav||nav.dataset.v16Bound) return;
    nav.dataset.v16Bound='1';
    nav.addEventListener('click',e=>{
      const b=e.target.closest('.nav-item[data-subject]');
      if(b?.dataset.subject) localStorage.setItem(profileKey(),b.dataset.subject);
    },true);
  }

  function setEyebrow(){
    const e=$('#ageEyebrow'); if(!e) return;
    const age=$('#profileSelect')?.selectedOptions?.[0]?.textContent?.split('·').slice(1).join('·').trim()||'';
    const txt=`${age}${age?' · ':''}${LOCALES[currentLocale]||LOCALES.es_intl}`;
    if(e.textContent!==txt) e.textContent=txt;
  }

  async function loadLocale(){
    try{
      const api=window.LearningAPI;
      if(!api?.client||!api.user) return;
      const {data,error}=await api.client.from('accounts').select('content_locale').single();
      if(error) throw error;
      currentLocale=data?.content_locale||'es_intl';
      const sel=$('#v16ContentLocale'); if(sel && sel.value!==currentLocale) sel.value=currentLocale;
      setEyebrow();
    }catch(e){ console.warn('V16 locale load',e); }
  }

  async function saveLocale(locale){
    const sel=$('#v16ContentLocale');
    if(sel) sel.disabled=true;
    try{
      const api=window.LearningAPI;
      if(!api?.client||!api.user) throw new Error('Sesión no disponible');
      const {error}=await api.client.from('accounts').update({content_locale:locale}).eq('user_id',api.user.id);
      if(error) throw error;
      currentLocale=locale;
      setEyebrow();
      toast(`Contenido adaptado a: ${LOCALES[locale]}`);
    }catch(e){
      console.warn('V16 locale save',e);
      toast('No se pudo guardar la preferencia regional.');
      await loadLocale();
    }finally{
      if(sel) sel.disabled=false;
    }
  }

  function addLocaleControl(){
    const panel=$('.profile-panel'); if(!panel||$('#v16LocalePanel')) return;
    const wrap=document.createElement('div'); wrap.id='v16LocalePanel'; wrap.className='v16-locale-panel';
    wrap.innerHTML=`<label for="v16ContentLocale">VARIANTE DE ESPAÑOL</label><select id="v16ContentLocale">${Object.entries(LOCALES).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><span class="v16-locale-note">Se aplica a los ejemplos y al vocabulario de todos los perfiles de esta cuenta.</span>`;
    panel.insertAdjacentElement('afterend',wrap);
    $('#v16ContentLocale').addEventListener('change',e=>saveLocale(e.target.value));
    loadLocale();
  }

  function bindProfileChanges(){
    const sel=$('#profileSelect'); if(!sel||sel.dataset.v16ProfileBound) return;
    sel.dataset.v16ProfileBound='1';
    sel.addEventListener('change',()=>setTimeout(()=>{compactHero();rememberNavigation();setEyebrow();},80));
  }

  function enhance(){
    injectStyles(); compactHero(); rememberNavigation(); addLocaleControl(); bindProfileChanges(); setEyebrow();
  }

  window.addEventListener('load',()=>{
    let tries=0;
    const wait=setInterval(()=>{
      tries++;
      if(window.LearningAPI && $('#appShell')){
        clearInterval(wait);
        enhance();
        // Re-run a few times while the async workspace/profile UI settles; no MutationObserver.
        [250,700,1500,3000].forEach(ms=>setTimeout(enhance,ms));
      }
      if(tries>100) clearInterval(wait);
    },120);
  });
})();

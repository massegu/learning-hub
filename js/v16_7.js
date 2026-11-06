(function(){
  const AGE_ROUTES={
    early:{label:'6-7 años',dbAge:'primary',allowed:['language','division','reading','attention','executive','memory','speedReasoning','applied']},
    junior:{label:'8-10 años',dbAge:'primary',allowed:['language','division','reading','attention','executive','memory','speedReasoning','applied']},
    primary:{label:'10-12 años',dbAge:'primary'},
    middle:{label:'13-15 años',dbAge:'middle'},
    teen:{label:'16-18 años',dbAge:'teen'}
  };
  const routeMap=new Map();
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  let apiPatched=false;

  function routeOfProfileId(id){ return routeMap.get(String(id))||null; }
  function currentRoute(){ return routeOfProfileId($('#profileSelect')?.value); }

  function installAgeOptions(){
    const sel=$('#newProfileAge'); if(!sel) return;
    const current=sel.value;
    sel.innerHTML=[['early','6-7 años'],['junior','8-10 años'],['primary','10-12 años'],['middle','13-15 años'],['teen','16-18 años']]
      .map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
    sel.value=AGE_ROUTES[current]?current:'junior';
  }

  async function captureProfiles(){
    try{
      const rows=await window.LearningAPI.listProfiles();
      (rows||[]).forEach(p=>routeMap.set(String(p.id),p?.progress?.ageRoute||p.age_band));
      patchUI();
    }catch(e){console.warn('V16.7 age routes',e);}
  }

  function patchAPI(){
    if(apiPatched||!window.LearningAPI) return;
    const API=window.LearningAPI;
    const origList=API.listProfiles?.bind(API), origCreate=API.createProfile?.bind(API), origSave=API.saveProgress?.bind(API);
    if(!origList||!origCreate||!origSave) return;
    API.listProfiles=async(...args)=>{
      const rows=await origList(...args);
      (rows||[]).forEach(p=>routeMap.set(String(p.id),p?.progress?.ageRoute||p.age_band));
      return rows;
    };
    API.createProfile=async(name,age_band,initial_level=1,locale='es_intl')=>{
      const requested=AGE_ROUTES[age_band]?age_band:'junior';
      const dbAge=AGE_ROUTES[requested].dbAge||requested;
      const p=await origCreate(name,dbAge,initial_level,locale);
      routeMap.set(String(p.id),requested);
      if(requested==='early'||requested==='junior'){
        p.progress={...(p.progress||{}),ageRoute:requested};
        await origSave(p.id,p.progress);
      }
      setTimeout(patchUI,80); return p;
    };
    API.saveProgress=async(id,progress)=>{
      const route=routeOfProfileId(id),next={...(progress||{})};
      if(route==='early'||route==='junior') next.ageRoute=route;
      return origSave(id,next);
    };
    apiPatched=true; setTimeout(captureProfiles,50);
  }

  function renameProfileOptions(){
    const sel=$('#profileSelect'); if(!sel) return;
    [...sel.options].forEach(o=>{
      const route=routeOfProfileId(o.value); if(!route) return;
      const name=o.textContent.split('·')[0].trim();
      const desired=`${name} · ${AGE_ROUTES[route].label}`;
      if(o.textContent!==desired) o.textContent=desired;
    });
  }

  function patchAgeEyebrow(route){
    const el=$('#ageEyebrow'); if(!el||!route) return;
    const txt=el.textContent||'';
    const suffix=txt.includes('·')?txt.slice(txt.indexOf('·')):'· ESPAÑOL INTERNACIONAL';
    const desired=`${AGE_ROUTES[route].label.toUpperCase()} ${suffix}`;
    if(el.textContent!==desired) el.textContent=desired;
  }

  function patchNavigation(route){
    if(!['early','junior'].includes(route)) return;
    const allowed=new Set(window.ContentPolicy?.early?.subjects||AGE_ROUTES[route].allowed);
    $$('#navMenu .nav-item[data-subject]').forEach(b=>{
      const s=b.dataset.subject, hide=!allowed.has(s); b.hidden=hide; if(hide) return;
      const labelMap={language:`Lenguaje ${AGE_ROUTES[route].label.replace(' años','')}`,division:`Matemáticas ${AGE_ROUTES[route].label.replace(' años','')}`,reading:`Lectura + Escritura ${AGE_ROUTES[route].label.replace(' años','')}`};
      if(labelMap[s]){
        const caption=b.querySelector('.nav-area-label');
        if(caption){if(caption.textContent!==labelMap[s])caption.textContent=labelMap[s];return;}
        const icon=(b.textContent||'').trim().split(/\s+/)[0],desired=`${icon} ${labelMap[s]}`;
        if(b.textContent.trim()!==desired) b.textContent=desired;
      }
    });
    $$('#homeworkOptions .homework-option').forEach(label=>{
      const input=label.querySelector('input'); if(!input) return;
      const hide=!allowed.has(input.value); label.hidden=hide; if(hide) input.checked=false;
    });
  }

  function patchExerciseHeading(route){
    if(!['early','junior'].includes(route)) return;
    const s=$('#navMenu .nav-item.active[data-subject]')?.dataset.subject;
    const short=AGE_ROUTES[route].label.replace(' años','');
    const label={language:`Lenguaje ${short}`,division:`Matemáticas ${short}`,reading:`Lectura + Escritura ${short}`}[s];
    if(label){ if($('#exerciseHeading')) $('#exerciseHeading').textContent=label; if($('#exercisePill')) $('#exercisePill').textContent=label.toUpperCase(); }
  }

  function patchUI(){ installAgeOptions(); renameProfileOptions(); const route=currentRoute(); if(route){patchAgeEyebrow(route);patchNavigation(route);patchExerciseHeading(route);} }

  function start(){
    installAgeOptions();
    patchAPI();
    patchUI();
    document.addEventListener('change',e=>{if(e.target?.id==='profileSelect'||e.target?.id==='newProfileAge')setTimeout(patchUI,30);},true);
    document.addEventListener('click',e=>{if(e.target?.closest?.('.nav-item,#newProfileBtn,#createProfileBtn'))setTimeout(patchUI,80);},true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();

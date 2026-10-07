(function(){
  const AGE_ROUTES={
    early:{label:'6-7 años',dbAge:'primary',allowed:['language','division','reading','attention','executive','memory','speedReasoning','applied']},
    junior:{label:'8-10 años',dbAge:'primary',allowed:['language','division','reading','attention','executive','memory','speedReasoning','applied']},
    primary:{label:'10-12 años',dbAge:'primary'},
    middle:{label:'12-13 años',dbAge:'middle'},
    teen:{label:'14-17 años',dbAge:'teen'}
  };
  const routeMap=new Map();
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  let apiPatched=false, worksheetPatched=false, observer=null;

  function routeOfProfileId(id){ return routeMap.get(String(id))||null; }
  function currentRoute(){
    const id=$('#profileSelect')?.value;
    return routeOfProfileId(id);
  }
  function ageLabel(route, fallback){ return AGE_ROUTES[route]?.label||fallback||''; }
  function stamp(){
    const d=new Date(), pad=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  }
  function ageSlug(profile){
    const route=routeOfProfileId(profile?.id)||profile?.progress?.ageRoute||profile?.age_band;
    const label=AGE_ROUTES[route]?.label||AGE_ROUTES[profile?.age_band]?.label||'perfil';
    return label.replace(/\s*años/i,'').trim().replace(/\s+/g,'-');
  }

  function installAgeOptions(){
    const sel=$('#newProfileAge');
    if(!sel||sel.dataset.v167==='1') return;
    const current=sel.value;
    sel.innerHTML=[
      ['early','6-7 años'],['junior','8-10 años'],['primary','10-12 años'],['middle','12-13 años'],['teen','14-17 años']
    ].map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
    sel.value=AGE_ROUTES[current]?current:'junior';
    sel.dataset.v167='1';
  }

  async function captureProfiles(){
    try{
      const rows=await window.LearningAPI.listProfiles();
      (rows||[]).forEach(p=>routeMap.set(String(p.id),p?.progress?.ageRoute||p.age_band));
      patchUI();
    }catch(e){ console.warn('V16.7 age routes',e); }
  }

  function patchAPI(){
    if(apiPatched||!window.LearningAPI) return;
    const API=window.LearningAPI;
    const origList=API.listProfiles?.bind(API);
    const origCreate=API.createProfile?.bind(API);
    const origSave=API.saveProgress?.bind(API);
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
      if(requested==='early'||requested==='junior'){
        p.progress={...(p.progress||{}),ageRoute:requested};
        routeMap.set(String(p.id),requested);
        await origSave(p.id,p.progress);
      }else routeMap.set(String(p.id),requested);
      setTimeout(patchUI,80);
      return p;
    };

    API.saveProgress=async(id,progress)=>{
      const route=routeOfProfileId(id);
      const next={...(progress||{})};
      if(route==='early'||route==='junior') next.ageRoute=route;
      return origSave(id,next);
    };
    apiPatched=true;
    setTimeout(captureProfiles,50);
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
    const allowed=new Set(AGE_ROUTES[route].allowed);
    $$('#navMenu .nav-item[data-subject]').forEach(b=>{
      const s=b.dataset.subject;
      const hide=!allowed.has(s);
      if(b.hidden!==hide) b.hidden=hide;
      if(hide) return;
      const labelMap={
        language:`Lenguaje ${AGE_ROUTES[route].label.replace(' años','')}`,
        division:`Matemáticas ${AGE_ROUTES[route].label.replace(' años','')}`,
        reading:`Lectura ${AGE_ROUTES[route].label.replace(' años','')}`
      };
      if(labelMap[s]){
        const icon=(b.textContent||'').trim().split(/\s+/)[0];
        const desired=`${icon} ${labelMap[s]}`;
        if(b.textContent.trim()!==desired) b.textContent=desired;
      }
    });

    $$('#homeworkOptions .homework-option').forEach(label=>{
      const input=label.querySelector('input'); if(!input) return;
      const hide=!allowed.has(input.value);
      label.hidden=hide;
      if(hide) input.checked=false;
    });
  }

  function patchExerciseHeading(route){
    if(!['early','junior'].includes(route)) return;
    const active=$('#navMenu .nav-item.active[data-subject]');
    const s=active?.dataset.subject;
    const short=AGE_ROUTES[route].label.replace(' años','');
    const label={language:`Lenguaje ${short}`,division:`Matemáticas ${short}`,reading:`Lectura ${short}`}[s];
    if(label){
      if($('#exerciseHeading')?.textContent!==label) $('#exerciseHeading').textContent=label;
      if($('#exercisePill')?.textContent!==label.toUpperCase()) $('#exercisePill').textContent=label.toUpperCase();
    }
  }

  function patchUI(){
    installAgeOptions();
    renameProfileOptions();
    const route=currentRoute();
    if(route){ patchAgeEyebrow(route); patchNavigation(route); patchExerciseHeading(route); }
  }

  function patchWorksheetNames(){
    if(worksheetPatched||!window.WorksheetGenerator?.generate||!window.JSZip) return;
    const orig=window.WorksheetGenerator.generate.bind(window.WorksheetGenerator);
    window.WorksheetGenerator.generate=async(itemsByVersion,profile)=>{
      const prefix=`LearningLab_${ageSlug(profile)}_${stamp()}`;
      const oldClick=HTMLAnchorElement.prototype.click;
      const oldFile=window.JSZip.prototype.file;
      HTMLAnchorElement.prototype.click=function(){
        const d=String(this.download||'');
        if(/_fichas\.zip$/i.test(d)) this.download=`${prefix}_fichas.zip`;
        else if(/\.docx$/i.test(d)) this.download=`${prefix}_ficha_01.docx`;
        return oldClick.call(this);
      };
      window.JSZip.prototype.file=function(name,...rest){
        let next=name;
        const m=String(name).match(/^LearningLab_ficha_version_(\d+)\.docx$/i);
        if(m) next=`${prefix}_ficha_${String(m[1]).padStart(2,'0')}.docx`;
        return oldFile.call(this,next,...rest);
      };
      try{return await orig(itemsByVersion,profile);}
      finally{
        HTMLAnchorElement.prototype.click=oldClick;
        window.JSZip.prototype.file=oldFile;
      }
    };
    worksheetPatched=true;
  }

  function start(){
    installAgeOptions();
    let ticks=0;
    const timer=setInterval(()=>{
      ticks++;
      patchAPI(); patchWorksheetNames(); patchUI();
      if(ticks>160) clearInterval(timer);
    },100);
    if(!observer && document.body){
      observer=new MutationObserver(()=>patchUI());
      observer.observe(document.body,{childList:true,subtree:true});
    }
    document.addEventListener('change',e=>{
      if(e.target?.id==='profileSelect'||e.target?.id==='newProfileAge') setTimeout(patchUI,30);
    },true);
    document.addEventListener('click',e=>{
      if(e.target?.closest?.('.nav-item,#newProfileBtn,#createProfileBtn')) setTimeout(patchUI,80);
    },true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

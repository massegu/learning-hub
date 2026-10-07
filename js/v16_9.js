
(function(){
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const repl=[
    [/14-17\s*años/gi,'16-18 años'],
    [/14-17/gi,'16-18'],
    [/12-13\s*años/gi,'13-15 años'],
    [/12-13/gi,'13-15']
  ];

  function fixText(el){
    if(!el || !el.textContent) return;
    let t=el.textContent;
    let n=t;
    for(const [rx,to] of repl) n=n.replace(rx,to);
    if(n!==t) el.textContent=n;
  }
  function fixAllLabels(){
    [
      '#ageEyebrow','#sectionTitle','#exerciseHeading','#exercisePill',
      '#profileSelect','#homeLevels','#navMenu','#progressProfileTitle'
    ].forEach(sel=>{
      const el=$(sel);
      if(!el) return;
      if(el.tagName==='SELECT'){
        [...el.options].forEach(fixText);
      }else{
        fixText(el);
        el.querySelectorAll?.('*').forEach(fixText);
      }
    });
    const ageSel=$('#newProfileAge');
    if(ageSel){
      [...ageSel.options].forEach(o=>{
        if(o.value==='middle') o.textContent='13-15 años';
        if(o.value==='teen') o.textContent='16-18 años';
      });
    }
  }

  function pad(n){return String(n).padStart(2,'0')}
  function ageSlug(){
    const txt=$('#profileSelect')?.selectedOptions?.[0]?.textContent || $('#ageEyebrow')?.textContent || '';
    if(/6-7/.test(txt)) return '6-7';
    if(/8-10/.test(txt)) return '8-10';
    if(/10-12/.test(txt)) return '10-12';
    if(/12-13|13-15/.test(txt)) return '13-15';
    if(/14-17|16-18/.test(txt)) return '16-18';
    return 'perfil';
  }
  function stamp(){
    const d=new Date();
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  }
  function prefix(){return `LearningLab_${ageSlug()}_${stamp()}`}

  function installDownloadNaming(){
    if(window.__LH_V169_DOWNLOADS__) return;
    window.__LH_V169_DOWNLOADS__=true;

    const originalClick=HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click=function(){
      const d=String(this.download||'');
      if(/^LearningLab_\d+_fichas\.zip$/i.test(d) || /^LearningLab_.*_fichas\.zip$/i.test(d)){
        this.download=`${prefix()}_fichas.zip`;
      }else if(/^LearningLab_ficha.*\.docx$/i.test(d) || /^LearningLab_.*_ficha.*\.docx$/i.test(d)){
        const m=d.match(/(?:version_|_)(\d+)\.docx$/i);
        const num=m?String(Number(m[1])).padStart(2,'0'):'01';
        this.download=`${prefix()}_ficha_${num}.docx`;
      }
      return originalClick.call(this);
    };

    const patchZip=()=>{
      if(!window.JSZip || window.JSZip.prototype.__v169patched) return;
      const orig=window.JSZip.prototype.file;
      window.JSZip.prototype.file=function(name,...rest){
        let next=String(name);
        const m=next.match(/^LearningLab_ficha_version_(\d+)\.docx$/i);
        if(m) next=`${prefix()}_ficha_${String(Number(m[1])).padStart(2,'0')}.docx`;
        return orig.call(this,next,...rest);
      };
      window.JSZip.prototype.__v169patched=true;
    };
    patchZip();
    let tries=0;
    const t=setInterval(()=>{patchZip(); if(++tries>100) clearInterval(t)},100);
  }

  function start(){
    installDownloadNaming();
    fixAllLabels();
    const obs=new MutationObserver(()=>fixAllLabels());
    obs.observe(document.body,{childList:true,subtree:true,characterData:true});
    document.addEventListener('change',e=>{
      if(['profileSelect','newProfileAge'].includes(e.target?.id)) setTimeout(fixAllLabels,20);
    },true);
    document.addEventListener('click',()=>setTimeout(fixAllLabels,30),true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

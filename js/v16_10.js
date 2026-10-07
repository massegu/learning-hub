
(function(){
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];

  function replaceAgeText(text){
    return String(text||"")
      .replace(/12-13\s*años/gi,"13-15 años")
      .replace(/12-13/gi,"13-15")
      .replace(/14-17\s*años/gi,"16-18 años")
      .replace(/14-17/gi,"16-18");
  }

  function patchAgeSelector(){
    const sel=$("#newProfileAge");
    if(!sel) return;
    [...sel.options].forEach(o=>{
      if(o.value==="middle") o.textContent="13-15 años";
      if(o.value==="teen") o.textContent="16-18 años";
    });
  }

  function patchProfileSelect(){
    const sel=$("#profileSelect");
    if(!sel) return;
    [...sel.options].forEach(o=>{
      const next=replaceAgeText(o.textContent);
      if(next!==o.textContent) o.textContent=next;
    });
  }

  function patchSimpleNode(sel){
    const el=$(sel);
    if(!el) return;
    const next=replaceAgeText(el.textContent);
    if(next!==el.textContent) el.textContent=next;
  }

  function patchNavigation(){
    $$("#navMenu .nav-item").forEach(btn=>{
      const next=replaceAgeText(btn.textContent);
      if(next!==btn.textContent) btn.textContent=next;
    });
  }

  function patchHomeLevels(){
    $$("#homeLevels .level-row strong").forEach(el=>{
      const next=replaceAgeText(el.textContent);
      if(next!==el.textContent) el.textContent=next;
    });
  }

  function patchAll(){
    patchAgeSelector();
    patchProfileSelect();
    patchSimpleNode("#ageEyebrow");
    patchSimpleNode("#sectionTitle");
    patchSimpleNode("#exerciseHeading");
    patchSimpleNode("#exercisePill");
    patchSimpleNode("#progressProfileTitle");
    patchNavigation();
    patchHomeLevels();
  }

  function start(){
    patchAll();

    let n=0;
    const timer=setInterval(()=>{
      patchAll();
      if(++n>=50) clearInterval(timer);
    },200);

    document.addEventListener("change",e=>{
      if(["profileSelect","newProfileAge"].includes(e.target?.id)){
        setTimeout(patchAll,50);
      }
    },true);

    document.addEventListener("click",e=>{
      if(e.target?.closest?.(".nav-item,#newProfileBtn,#createProfileBtn,#heroStartBtn")){
        setTimeout(patchAll,80);
      }
    },true);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }
})();

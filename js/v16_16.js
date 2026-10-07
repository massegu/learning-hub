
(function(){
  const $=s=>document.querySelector(s);

  function selectedAgeLabel(){
    const txt=String($("#profileSelect")?.selectedOptions?.[0]?.textContent||"");
    if(/6-7/.test(txt)) return "6-7 años";
    if(/8-10/.test(txt)) return "8-10 años";
    if(/10-12/.test(txt)) return "10-12 años";
    if(/13-15|12-13/.test(txt)) return "13-15 años";
    if(/16-18|14-17/.test(txt)) return "16-18 años";
    return "";
  }

  function fixAgeEyebrow(){
    const label=selectedAgeLabel();
    const el=$("#ageEyebrow");
    if(!label||!el) return;
    const txt=String(el.textContent||"");
    const suffix=txt.includes("·")?txt.slice(txt.indexOf("·")):"· ESPAÑOL INTERNACIONAL";
    const wanted=label.toUpperCase()+" "+suffix;
    if(el.textContent!==wanted) el.textContent=wanted;
  }

  function fixKnownLegacyText(){
    const roots=[
      $("#sectionTitle"),
      $("#exerciseHeading"),
      $("#exercisePill"),
      $("#ageEyebrow")
    ].filter(Boolean);
    roots.forEach(el=>{
      const next=String(el.textContent||"")
        .replace(/12-13\s*años/gi,"13-15 años")
        .replace(/12-13/gi,"13-15")
        .replace(/14-17\s*años/gi,"16-18 años")
        .replace(/14-17/gi,"16-18")
        .replace(/Autobúscar/g,"Buscar")
        .replace(/autobúscar/g,"buscar");
      if(next!==el.textContent) el.textContent=next;
    });
  }

  function patch(){
    fixAgeEyebrow();
    fixKnownLegacyText();
  }

  function start(){
    patch();

    const eyebrow=$("#ageEyebrow");
    if(eyebrow){
      const obs=new MutationObserver(()=>patch());
      obs.observe(eyebrow,{childList:true,characterData:true,subtree:true});
    }

    document.addEventListener("change",e=>{
      if(e.target?.id==="profileSelect") setTimeout(patch,30);
    },true);

    document.addEventListener("click",e=>{
      if(e.target?.closest?.(".nav-item,#recommendedBtn,#heroStartBtn,#exerciseNext")){
        setTimeout(patch,40);
      }
    },true);

    // Short fallback during initial hydration only.
    let n=0;
    const t=setInterval(()=>{
      patch();
      if(++n>=40) clearInterval(t);
    },250);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }
})();

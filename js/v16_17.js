
(function(){
  const ICONS={
    book:"📘",pencil:"✏️",backpack:"🎒",bottle:"🧴",notebook:"📓",folder:"📁",
    pencilCase:"🖊️",apple:"🍎",banana:"🍌",bread:"🥖",headphones:"🎧",camera:"📷",
    ticket:"🎟️",suitcase:"🧳",map:"🗺️",train:"🚆",plane:"✈️",keys:"🔑",phone:"📱",
    milk:"🥛",pasta:"🍝",eggs:"🥚",juice:"🧃",keycard:"💳"
  };
  let goodGenerator=null, loading=false;

  function cloneItem(it){
    const x=(typeof structuredClone==="function")?structuredClone(it):JSON.parse(JSON.stringify(it));
    if(Array.isArray(x.memoryContent)){
      x.memoryContent=x.memoryContent.map(row=>{
        const r={...row};
        if(r.icon && ICONS[r.icon] && r.detail && !String(r.detail).startsWith(ICONS[r.icon])){
          r.detail=ICONS[r.icon]+" "+r.detail;
        }
        return r;
      });
    }
    return x;
  }

  function wrapGenerator(){
    if(!window.WorksheetGenerator?.generate) return;
    if(window.WorksheetGenerator.__lh1617) {
      goodGenerator=window.WorksheetGenerator;
      return;
    }
    const base=window.WorksheetGenerator.generate.bind(window.WorksheetGenerator);
    const enhanced={
      generate:async(itemsByVersion,profile)=>{
        const enriched=(itemsByVersion||[]).map(items=>(items||[]).map(cloneItem));
        return base(enriched,profile);
      },
      __lh1617:true
    };
    window.WorksheetGenerator=enhanced;
    goodGenerator=enhanced;
  }

  function restoreDocxGenerator(){
    if(loading) return;
    loading=true;
    const s=document.createElement("script");
    s.src="js/docx.js?v=16.17.0";
    s.onload=()=>{
      loading=false;
      wrapGenerator();
    };
    s.onerror=()=>{loading=false;};
    document.head.appendChild(s);
  }

  function start(){
    // v16_4 used to overwrite the better worksheet renderer. Reload the existing
    // docx generator after all V16 patches, then only enrich memory stimuli.
    restoreDocxGenerator();

    [1000,3000,5000].forEach(ms=>setTimeout(()=>{
      if(goodGenerator) window.WorksheetGenerator=goodGenerator;
      else restoreDocxGenerator();
    },ms));

    document.addEventListener("click",e=>{
      if(e.target?.closest?.("#generateWorksheetsBtn") && goodGenerator){
        // Keep the already-working ZIP/DOCX naming untouched.
        window.WorksheetGenerator=goodGenerator;
      }
    },true);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }
})();

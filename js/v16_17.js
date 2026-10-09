
(function(){
  const ICONS={
    cuaderno:"notebook", botella:"bottle", mochila:"backpack", llaves:"keys",
    auriculares:"headphones", libro:"book", cargador:"keycard", entrada:"ticket",
    carpeta:"folder", estuche:"pencilCase", mapa:"map", manzana:"apple",
    pan:"bread", leche:"milk", pasta:"pasta", huevos:"eggs", jugo:"juice",
    telefono:"phone", teléfono:"phone"
  };

  function repairMemoryItem(item){
    if(!item || !String(item.type||"").startsWith("memory")) return item;
    const q=String(item.memoryQuestion||item.q||"").toLowerCase();
    const recognition=
      q.includes("sí estaba") ||
      q.includes("estaba en la lista") ||
      q.includes("qué elemento estaba") ||
      q.includes("qué objeto estaba");
    if(!recognition || item.a===undefined) return item;

    const out={...item};
    out.memoryContent=Array.isArray(item.memoryContent)
      ? item.memoryContent.map(x=>typeof x==="object"&&x!==null?{...x}:x)
      : [];

    const answer=String(item.a);
    const found=out.memoryContent.some(x=>{
      const txt=typeof x==="string"
        ? x
        : [x?.person,x?.detail,x?.label,x?.value].filter(Boolean).join(" ");
      return String(txt).toLowerCase().includes(answer.toLowerCase());
    });

    if(!found){
      out.memoryContent.unshift({
        icon: ICONS[answer.toLowerCase()] || "book",
        detail: answer
      });
    }
    return out;
  }

  function repairBatch(itemsByVersion){
    return (itemsByVersion||[]).map(items=>(items||[]).map(repairMemoryItem));
  }

  function install(){
    if(window.__LH_V1617_WORKSHEET_GUARD__) return true;
    if(!window.WorksheetGenerator?.generate) return false;

    const original=window.WorksheetGenerator.generate.bind(window.WorksheetGenerator);
    window.WorksheetGenerator.generate=async(itemsByVersion,profile)=>{
      return original(repairBatch(itemsByVersion),profile);
    };
    window.__LH_V1617_WORKSHEET_GUARD__=true;
    return true;
  }

  function start(){
    if(install()) return;
    let n=0;
    const t=setInterval(()=>{
      if(install() || ++n>80) clearInterval(t);
    },100);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }
})();

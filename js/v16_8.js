(function(){
  const AGE_LABELS={
    early:"6-7 años",
    junior:"8-10 años",
    primary:"10-12 años",
    middle:"13-15 años",
    teen:"16-18 años"
  };
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];

  function currentRoute(){
    const sel=$("#profileSelect");
    const opt=sel?.selectedOptions?.[0];
    const txt=(opt?.textContent||"");
    if(txt.includes("6-7")) return "early";
    if(txt.includes("8-10")) return "junior";
    const eyebrow=($("#ageEyebrow")?.textContent||"").toLowerCase();
    if(eyebrow.includes("13-15")) return "middle";
    if(eyebrow.includes("16-18")) return "teen";
    if(eyebrow.includes("10-12")) return "primary";
    return null;
  }

  function patchAgeSelector(){
    const sel=$("#newProfileAge");
    if(!sel) return;
    const labels={early:"6-7 años",junior:"8-10 años",primary:"10-12 años",middle:"13-15 años",teen:"16-18 años"};
    [...sel.options].forEach(o=>{ if(labels[o.value]) o.textContent=labels[o.value]; });
  }

  function patchAgeLabels(){
    const route=currentRoute();
    if(!route) return;
    const label=AGE_LABELS[route];
    const eyebrow=$("#ageEyebrow");
    if(eyebrow){
      const suffix=(eyebrow.textContent||"").includes("·")
        ? eyebrow.textContent.slice(eyebrow.textContent.indexOf("·"))
        : "· ESPAÑOL INTERNACIONAL";
      eyebrow.textContent=`${label.toUpperCase()} ${suffix}`;
    }

    const map={
      middleLanguage:"Lenguaje 13-15",
      middleMath:"Matemáticas 13-15",
      middleReading:"Lectura 13-15",
      teenLanguage:"Lenguaje 16-18",
      teenMath:"Matemáticas 16-18",
      language:`Lenguaje ${label.replace(" años","")}`,
      division:`Matemáticas ${label.replace(" años","")}`,
      reading:`Lectura ${label.replace(" años","")}`
    };
    $$("#navMenu .nav-item[data-subject]").forEach(b=>{
      const s=b.dataset.subject;
      if(!map[s]) return;
      const icon=(b.textContent||"").trim().split(/\s+/)[0];
      b.textContent=`${icon} ${map[s]}`;
    });

    const active=$("#navMenu .nav-item.active[data-subject]");
    const s=active?.dataset.subject;
    if(s && map[s]){
      if($("#sectionTitle")) $("#sectionTitle").textContent=map[s];
      if($("#exerciseHeading")) $("#exerciseHeading").textContent=map[s];
      if($("#exercisePill")) $("#exercisePill").textContent=map[s].toUpperCase();
    }
  }

  function patchDescriptions(){
    const route=currentRoute();
    if(route==="early" || route==="junior"){
      const active=$("#navMenu .nav-item.active[data-subject]")?.dataset.subject;
      const desc=$("#exerciseDescription");
      if(!desc) return;
      const d={
        division:"Cálculo, problemas cotidianos, series, tiempo y dinero ajustados a la edad.",
        language:"Comprensión, vocabulario, inferencias y uso funcional del lenguaje.",
        reading:"Comprensión literal e inferencial con textos breves adecuados a la edad.",
        attention:"Búsqueda, comparación, consignas y selección de información relevante.",
        executive:"Secuenciación, planificación, control de impulsos y organización.",
        memory:"Memoria visual y funcional con dificultad progresiva.",
        speedReasoning:"Comparación rápida, patrones, cálculo y razonamiento.",
        applied:"Situaciones cotidianas que integran varias habilidades cognitivas."
      };
      if(d[active]) desc.textContent=d[active];
    }
  }

  function patchUI(){
    patchAgeSelector();
    patchAgeLabels();
    patchDescriptions();
  }

  function start(){
    let n=0;
    const timer=setInterval(()=>{patchUI(); if(++n>180) clearInterval(timer);},120);
    document.addEventListener("change",e=>{
      if(["profileSelect","newProfileAge"].includes(e.target?.id)) setTimeout(patchUI,40);
    },true);
    document.addEventListener("click",e=>{
      if(e.target?.closest?.(".nav-item,#newProfileBtn,#createProfileBtn")) setTimeout(patchUI,80);
    },true);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
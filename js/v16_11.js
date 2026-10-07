
(function(){
  const $=s=>document.querySelector(s);

  function normalizeAgeText(text){
    return String(text||"")
      .replace(/12-13\s*años/gi,"13-15 años")
      .replace(/12-13/gi,"13-15")
      .replace(/14-17\s*años/gi,"16-18 años")
      .replace(/14-17/gi,"16-18");
  }

  function patchProfileLabels(){
    const profileSelect=$("#profileSelect");
    if(profileSelect){
      [...profileSelect.options].forEach(o=>{
        const next=normalizeAgeText(o.textContent);
        if(next!==o.textContent) o.textContent=next;
      });
    }
    const ageSel=$("#newProfileAge");
    if(ageSel){
      [...ageSel.options].forEach(o=>{
        if(o.value==="middle") o.textContent="13-15 años";
        if(o.value==="teen") o.textContent="16-18 años";
      });
    }
    ["#ageEyebrow","#sectionTitle","#exerciseHeading","#exercisePill"].forEach(sel=>{
      const el=$(sel);
      if(!el) return;
      const next=normalizeAgeText(el.textContent);
      if(next!==el.textContent) el.textContent=next;
    });
  }

  function pad(n){return String(n).padStart(2,"0")}
  function stamp(){
    const d=new Date();
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  }
  function currentAge(){
    const txt=normalizeAgeText(
      $("#profileSelect")?.selectedOptions?.[0]?.textContent ||
      $("#ageEyebrow")?.textContent || ""
    );
    if(/6-7/.test(txt)) return "6-7";
    if(/8-10/.test(txt)) return "8-10";
    if(/10-12/.test(txt)) return "10-12";
    if(/13-15/.test(txt)) return "13-15";
    if(/16-18/.test(txt)) return "16-18";
    return "perfil";
  }
  function prefix(){return `LearningLab_${currentAge()}_${stamp()}`}

  function installDownloadPatch(){
    if(window.__LH_V1611_DOWNLOAD_PATCH__) return;
    window.__LH_V1611_DOWNLOAD_PATCH__=true;

    const originalClick=HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click=function(){
      const d=String(this.download||"");
      if(/^LearningLab_\d+_fichas(?: \(\d+\))?\.zip$/i.test(d) || /^LearningLab_.*_fichas(?: \(\d+\))?\.zip$/i.test(d)){
        this.download=`${prefix()}_fichas.zip`;
      } else if(/^LearningLab_.*\.docx$/i.test(d)){
        let num="01";
        const m=d.match(/(?:version_|ficha_?)(\d+)/i);
        if(m) num=pad(Number(m[1]));
        this.download=`${prefix()}_ficha_${num}.docx`;
      }
      return originalClick.call(this);
    };

    function patchJSZip(){
      if(!window.JSZip || window.JSZip.prototype.__lh1611) return;
      const orig=window.JSZip.prototype.file;
      window.JSZip.prototype.file=function(name,...rest){
        let next=String(name);
        const m=next.match(/^LearningLab_ficha_(?:version_)?(\d+)\.docx$/i);
        if(m){
          next=`${prefix()}_ficha_${pad(Number(m[1]))}.docx`;
        }
        return orig.call(this,next,...rest);
      };
      window.JSZip.prototype.__lh1611=true;
    }
    patchJSZip();
    setTimeout(patchJSZip,500);
    setTimeout(patchJSZip,1500);
    setTimeout(patchJSZip,3000);
  }

  function start(){
    installDownloadPatch();
    patchProfileLabels();

    // Keep this finite and event-based: no MutationObserver, so login remains stable.
    let ticks=0;
    const timer=setInterval(()=>{
      patchProfileLabels();
      if(++ticks>=120) clearInterval(timer);
    },250);

    document.addEventListener("change",e=>{
      if(["profileSelect","newProfileAge"].includes(e.target?.id)){
        setTimeout(patchProfileLabels,30);
      }
    },true);
    document.addEventListener("click",e=>{
      if(e.target?.closest?.("#generateWorksheetsBtn,#newProfileBtn,#createProfileBtn,.nav-item")){
        installDownloadPatch();
        setTimeout(patchProfileLabels,30);
      }
    },true);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start,{once:true});
  }else{
    start();
  }
})();

(function(){
  const $=s=>document.querySelector(s);
  const pad=n=>String(n).padStart(2,'0');
  function stamp(){
    const d=new Date();
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  }
  function currentAge(){
    const txt=String($('#profileSelect')?.selectedOptions?.[0]?.textContent || $('#ageEyebrow')?.textContent || '');
    if(/6-7/.test(txt)) return '6-7';
    if(/8-10/.test(txt)) return '8-10';
    if(/10-12/.test(txt)) return '10-12';
    if(/13-15|12-13/.test(txt)) return '13-15';
    if(/16-18|14-17/.test(txt)) return '16-18';
    return 'perfil';
  }
  function prefix(){ return `LearningLab_${currentAge()}_${stamp()}`; }

  function installDownloadRename(){
    if(window.__LH_V1615_DOWNLOAD_RENAME__) return;
    window.__LH_V1615_DOWNLOAD_RENAME__=true;

    const originalClick=HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click=function(){
      const d=String(this.download||'');
      if(/^LearningLab_.*_fichas(?: \(\d+\))?\.zip$/i.test(d) || /^LearningLab_\d+_fichas(?: \(\d+\))?\.zip$/i.test(d)){
        this.download=`${prefix()}_fichas.zip`;
      }else if(/^LearningLab_.*\.docx$/i.test(d)){
        const m=d.match(/(?:version_|ficha_?|_)(\d+)(?=\.docx$)/i);
        const n=m?pad(Number(m[1])):'01';
        this.download=`${prefix()}_ficha_${n}.docx`;
      }
      return originalClick.call(this);
    };

    const patchZip=()=>{
      if(!window.JSZip || window.JSZip.prototype.__lh1615) return;
      const originalFile=window.JSZip.prototype.file;
      window.JSZip.prototype.file=function(name,...rest){
        let next=String(name);
        const m=next.match(/^LearningLab_ficha_(?:version_)?(\d+)\.docx$/i);
        if(m) next=`${prefix()}_ficha_${pad(Number(m[1]))}.docx`;
        return originalFile.call(this,next,...rest);
      };
      window.JSZip.prototype.__lh1615=true;
    };
    patchZip();
    [250,750,1500,3000,5000].forEach(ms=>setTimeout(patchZip,ms));
  }

  function start(){
    installDownloadRename();
    document.addEventListener('click',e=>{
      if(e.target?.closest?.('#generateWorksheetsBtn')) installDownloadRename();
    },true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

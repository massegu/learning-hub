(function(){
  const $=s=>document.querySelector(s);
  const PALETTE={
    navy:'#183153',navy2:'#10253F',turq:'#2EC4B6',turqDark:'#159B90',coral:'#FF6B6B',
    yellow:'#FFD166',cream:'#FFFDF7',sky:'#EAF9F7',ink:'#183153',muted:'#6B7A90',line:'#DDE8E6',white:'#FFFFFF'
  };

  function addStyles(){
    if($('#v164Styles')) return;
    const s=document.createElement('style');
    s.id='v164Styles';
    s.textContent=`
      :root{--bg:#F5FAF9;--card:${PALETTE.cream};--ink:${PALETTE.ink};--muted:${PALETTE.muted};--line:${PALETTE.line};--nav:${PALETTE.navy};--nav2:${PALETTE.navy2};--accent:${PALETTE.turq};--accent-dark:${PALETTE.turqDark};--accent-soft:#DDF7F3;--grass:${PALETTE.turq};--grass2:#8FE1D8;--dirt:${PALETTE.coral};--stone:#8FA1B5;--sand:${PALETTE.yellow};--danger:#D94F5C;}
      body{background:linear-gradient(180deg,#FBFEFD 0%,#F1F8F7 100%);color:${PALETTE.ink}}
      .sidebar{background:linear-gradient(180deg,${PALETTE.navy} 0%,${PALETTE.navy2} 100%)!important;border-right-color:#0B1A2C!important}
      .brand-badge{background:${PALETTE.turq}!important;box-shadow:inset 0 -8px 0 ${PALETTE.coral},4px 4px 0 rgba(0,0,0,.14)!important}
      .brand h1,.brand p{color:#fff!important}.profile-panel{border-color:rgba(255,255,255,.18)!important;background:rgba(255,255,255,.06)!important}
      .nav-item{color:#EAF6F5!important}.nav-item:hover,.nav-item.active{background:rgba(46,196,182,.20)!important;box-shadow:inset 4px 0 0 ${PALETTE.yellow}!important;color:#fff!important}
      .score-chip{background:rgba(46,196,182,.16)!important;border-color:rgba(46,196,182,.38)!important}
      .v16-locale-panel{background:rgba(255,255,255,.07)!important;border-color:rgba(255,255,255,.16)!important}.v16-locale-panel label{color:#D8F7F3!important}.v16-locale-note{color:#BFD8D6!important}
      .v16-locale-panel select{background:#FFF9E8!important;color:${PALETTE.navy}!important}
      #home .hero{background:linear-gradient(135deg,#FFFDF7 0%,#E9FAF7 68%,#FFF1E8 100%)!important;border-color:#D8ECE8!important}
      #home .hero:before{background:linear-gradient(90deg,${PALETTE.turq},${PALETTE.yellow},${PALETTE.coral})!important}
      #home .focus-card{background:linear-gradient(145deg,${PALETTE.navy},#224B69)!important;border-color:#294E6E!important}
      #home .focus-card .eyebrow{color:${PALETTE.yellow}!important}
      .level-track span,.bar span{background:linear-gradient(90deg,${PALETTE.turq},#75D8CE)!important}
      .primary-btn,.billing-btn{background:${PALETTE.turq}!important;border-color:${PALETTE.turq}!important;color:${PALETTE.navy}!important;box-shadow:0 3px 0 ${PALETTE.turqDark}!important}
      .primary-btn:hover,.billing-btn:hover{background:#57D2C7!important;border-color:#57D2C7!important}
      .secondary-btn{background:#FFF5D8!important;border-color:#F2D88A!important;color:${PALETTE.navy}!important}
      .pill,.language-topic{background:#DFF8F4!important;color:${PALETTE.navy}!important;border-color:#B9ECE5!important}
      .eyebrow{color:${PALETTE.turqDark}!important}.v16-toast{background:${PALETTE.navy}!important;border-left:5px solid ${PALETTE.yellow}}
      .card{border-color:#DDE8E6!important}.session-chip,.streak-card{background:#FFFDF7!important}.topbar .mini-btn{color:${PALETTE.navy}!important;background:#F0FBF9!important;border-color:#BFE9E3!important}
      .topbar .billing-btn{background:${PALETTE.turq}!important;color:${PALETTE.navy}!important}.scenario-card{background:#F5FBFA!important;border-left-color:${PALETTE.turq}!important}
      .option-btn:hover{border-color:${PALETTE.turq}!important;background:#F0FBF9!important}.option-btn.correct,.multi-option.correct{border-color:${PALETTE.turq}!important;background:#E3F8F5!important;color:${PALETTE.navy}!important}
      .option-btn.wrong,.multi-option.wrong{border-color:#F39A9A!important;background:#FFF0F0!important}.multi-option.selected:not(.correct):not(.wrong){outline-color:${PALETTE.turq}!important;background:#ECFAF8!important}
      .exercise-card .prompt{color:${PALETTE.navy}!important}

      /* V16.4 functional documents: compact and readable */
      .shape-visual .lh-doc{font-size:1rem!important;text-align:left!important;max-width:660px!important;margin:12px auto 18px!important;padding:18px!important}
      .shape-visual .lh-doc .doc-route{font-size:1.05rem!important}.shape-visual .lh-doc .doc-grid b{font-size:1rem!important}.shape-visual .lh-doc .doc-grid span{font-size:.74rem!important}
      .shape-visual .lh-doc .trip-row,.shape-visual .lh-doc .doc-lines{font-size:.88rem!important}.shape-visual .lh-doc .poster-icon{font-size:2.6rem!important}
      .shape-visual .lh-doc h3{font-size:1.15rem!important}.shape-visual .lh-doc p{font-size:.88rem!important}

      /* Search boards */
      .shape-visual .search-board{font-size:1rem!important;text-align:left!important}.search-board{gap:9px!important;max-width:900px!important}.search-cell{background:#FFFDF7!important;border-color:#CFE5E1!important;min-height:76px!important}.search-cell small{color:#78909D!important}.search-cell span{font-size:1.72rem!important}

      /* Original comic/cartoon inspired scenes */
      .shape-visual .comic-scene{font-size:1rem!important;text-align:left!important}
      .comic-scene{max-width:930px;margin:14px auto 20px;padding:18px;border:2px solid ${PALETTE.navy};border-radius:18px;background:linear-gradient(135deg,var(--comic1),var(--comic2));box-shadow:7px 7px 0 ${PALETTE.yellow};position:relative;overflow:hidden}
      .comic-scene:before{content:'';position:absolute;right:-30px;top:-35px;width:130px;height:130px;border-radius:50%;background:${PALETTE.coral};opacity:.16}
      .comic-title{display:inline-block;margin-bottom:12px;padding:6px 10px;background:${PALETTE.navy};color:#fff;border-radius:999px;font-weight:900;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase}
      .comic-grid{display:grid;gap:10px}.comic-grid.cols-4{grid-template-columns:repeat(4,1fr)}.comic-grid.cols-5{grid-template-columns:repeat(5,1fr)}.comic-grid.cols-6{grid-template-columns:repeat(6,1fr)}
      .comic-panel{position:relative;min-height:96px;border:2px solid ${PALETTE.navy};border-radius:12px;background:#FFFDF7;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:3px 3px 0 rgba(24,49,83,.15)}
      .comic-panel:nth-child(3n+1){background:#FFF2EC}.comic-panel:nth-child(3n+2){background:#EAF9F7}.comic-panel:nth-child(3n){background:#FFF8D9}
      .comic-panel small{position:absolute;left:8px;top:6px;font-size:.62rem;font-weight:900;color:${PALETTE.navy};z-index:2}.comic-panel span{font-size:1.9rem;letter-spacing:.12rem;z-index:2}
      .comic-panel i{position:absolute;right:-18px;bottom:-22px;width:58px;height:58px;border-radius:50%;background:${PALETTE.turq};opacity:.18}
      .v13-visual-items{max-width:880px}.v13-visual-items span{background:#FFFDF7!important;border-color:#CFE5E1!important;min-height:80px!important;font-size:2.15rem!important}

      @media(max-width:900px){.comic-grid.cols-6,.comic-grid.cols-5{grid-template-columns:repeat(3,1fr)}.shape-visual .lh-doc{max-width:100%!important}}
    `;
    document.head.appendChild(s);
    const meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.setAttribute('content',PALETTE.navy);
  }

  function loadScript(src,test){return new Promise((resolve,reject)=>{if(test())return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}
  function clean(v){return String(v??'').replace(/\s+/g,' ').trim();}

  function worksheetVisual(it,docx){
    const {Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle}=docx;
    const noBorders={top:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},bottom:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},left:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},right:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},insideHorizontal:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},insideVertical:{style:BorderStyle.NONE,size:0,color:'FFFFFF'}};
    const out=[];
    if(Array.isArray(it.visualItems)&&it.visualItems.length){
      out.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorders,rows:[new TableRow({children:it.visualItems.map(x=>new TableCell({shading:{fill:'EAF9F7'},margins:{top:150,bottom:150,left:90,right:90},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:clean(x),size:30,font:'Aptos'})]})]}))})]}));
      return out;
    }
    if(it.visual&&typeof it.visual==='string'){
      const holder=document.createElement('div');holder.innerHTML=it.visual;
      const cells=[...holder.querySelectorAll('.search-cell,.comic-panel')];
      if(cells.length){
        const cols=Math.max(2,Math.min(6,Number((holder.querySelector('[class*="cols-"]')?.className.match(/cols-(\d+)/)||[])[1]||4)));
        for(let i=0;i<cells.length;i+=cols){
          const rowCells=cells.slice(i,i+cols).map(c=>new TableCell({width:{size:100/cols,type:WidthType.PERCENTAGE},shading:{fill:i/cols%2===0?'FFFDF7':'F5FBFA'},margins:{top:90,bottom:90,left:70,right:70},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:clean((c.querySelector('small')?.textContent||'')+' '+(c.querySelector('span')?.textContent||'')),size:20,color:'183153',font:'Aptos'})]})]}));
          while(rowCells.length<cols) rowCells.push(new TableCell({children:[new Paragraph('')]}));
          out.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:{top:{style:BorderStyle.SINGLE,size:3,color:'CFE5E1'},bottom:{style:BorderStyle.SINGLE,size:3,color:'CFE5E1'},left:{style:BorderStyle.SINGLE,size:3,color:'CFE5E1'},right:{style:BorderStyle.SINGLE,size:3,color:'CFE5E1'},insideHorizontal:{style:BorderStyle.SINGLE,size:2,color:'DDE8E6'},insideVertical:{style:BorderStyle.SINGLE,size:2,color:'DDE8E6'}},rows:[new TableRow({children:rowCells})]}));
        }
        return out;
      }
      const doc=holder.querySelector('.lh-doc');
      if(doc){
        const lines=[];
        doc.querySelectorAll('.doc-kicker,.doc-route,.doc-grid span,.doc-lines span,.doc-total,.doc-due,.trip-row,.doc-note,.poster h3,.poster p').forEach(el=>{const t=clean(el.textContent);if(t&&!lines.includes(t))lines.push(t);});
        if(lines.length){
          out.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorders,rows:[new TableRow({children:[new TableCell({shading:{fill:'F1FBF9'},margins:{top:170,bottom:170,left:200,right:200},children:[new Paragraph({children:[new TextRun({text:'DOCUMENTO',bold:true,size:14,color:'159B90',font:'Aptos'})]}),...lines.map(t=>new Paragraph({spacing:{before:55},children:[new TextRun({text:t,size:19,color:'183153',font:'Aptos'})]}))]})]})]}));
          return out;
        }
      }
    }
    return out;
  }

  function installWorksheetGenerator(){
    if(!window.docx||!window.JSZip) return;
    async function makeDoc(items,version,profile){
      const D=window.docx;
      const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,Footer}=D;
      const none={top:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},bottom:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},left:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},right:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},insideHorizontal:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},insideVertical:{style:BorderStyle.NONE,size:0,color:'FFFFFF'}};
      const children=[];
      children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:none,rows:[new TableRow({children:[new TableCell({width:{size:73,type:WidthType.PERCENTAGE},shading:{fill:'EAF9F7'},margins:{top:180,bottom:180,left:220,right:160},children:[new Paragraph({children:[new TextRun({text:'FICHA DE ENTRENAMIENTO',bold:true,size:34,color:'183153',font:'Aptos Display'})]}),new Paragraph({children:[new TextRun({text:`Versión ${version} · ${profile.name}`,size:20,color:'6B7A90',font:'Aptos'})]})]}),new TableCell({width:{size:27,type:WidthType.PERCENTAGE},shading:{fill:'183153'},margins:{top:170,bottom:170,left:100,right:100},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEVEL UP',bold:true,size:25,color:'FFFFFF',font:'Aptos'})]}),new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEARNING LAB',bold:true,size:13,color:'FFD166',font:'Aptos'})]})]})]})]}));
      children.push(new Paragraph({text:' '}));
      children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:none,rows:[new TableRow({children:[new TableCell({shading:{fill:'FFF7E0'},margins:{top:130,bottom:130,left:180,right:180},children:[new Paragraph({children:[new TextRun({text:'Fecha: ________________________________',size:20,color:'183153',font:'Aptos'})]})]})]})]}));

      const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      items.forEach((it,i)=>{
        children.push(new Paragraph({spacing:{before:260,after:70},children:[new TextRun({text:`ACTIVIDAD ${i+1}`,bold:true,size:16,color:'159B90',font:'Aptos'})]}));
        const prompt=it.dividend?`${it.dividend} ÷ ${it.divisor}`:(it.memoryQuestion||it.q||it.prompt||'Actividad');
        children.push(new Paragraph({spacing:{after:100,line:300},children:[new TextRun({text:clean(prompt),bold:true,size:22,color:'183153',font:'Aptos'})]}));
        worksheetVisual(it,D).forEach(x=>children.push(x));
        if(it.scenario){children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:none,rows:[new TableRow({children:[new TableCell({shading:{fill:'F5FBFA'},margins:{top:145,bottom:145,left:190,right:190},children:[new Paragraph({children:[new TextRun({text:'INFORMACIÓN',bold:true,size:14,color:'159B90',font:'Aptos'})]}),new Paragraph({spacing:{before:60},children:[new TextRun({text:clean(it.scenario),size:19,color:'183153',font:'Aptos'})]})]})]})]}));}
        if(it.type==='order'&&Array.isArray(it.tokens)){
          children.push(new Paragraph({spacing:{before:70,after:40},children:[new TextRun({text:'Elementos disponibles:',bold:true,size:18,color:'6B7A90',font:'Aptos'})]}));
          it.tokens.forEach((x,j)=>children.push(new Paragraph({spacing:{after:40},children:[new TextRun({text:`${j+1}. ${clean(x)}`,size:19,color:'183153',font:'Aptos'})]})));
        }
        if(Array.isArray(it.opts)&&it.opts.length){
          children.push(new Paragraph({spacing:{before:75,after:35},children:[new TextRun({text:'Opciones:',bold:true,size:18,color:'6B7A90',font:'Aptos'})]}));
          it.opts.forEach((x,j)=>children.push(new Paragraph({spacing:{after:45},indent:{left:180},children:[new TextRun({text:`${letters[j]}. ${clean(x)}`,size:19,color:'183153',font:'Aptos'})]})));
        }
        children.push(new Paragraph({spacing:{before:90,after:20},children:[new TextRun({text:'Respuesta:',bold:true,size:18,color:'6B7A90',font:'Aptos'})]}));
        children.push(new Paragraph({spacing:{after:35},children:[new TextRun({text:'________________________________________________________________________',size:17,color:'B8C7C8'})]}));
        children.push(new Paragraph({children:[new TextRun({text:'________________________________________________________________________',size:17,color:'B8C7C8'})]}));
      });
      const footer=new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEVEL UP · Learning Lab',size:15,color:'6B7A90',font:'Aptos'})]})]});
      return Packer.toBlob(new Document({sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:620,right:720,bottom:650,left:720}}},footers:{default:footer},children}]}));
    }
    window.WorksheetGenerator={generate:async(itemsByVersion,profile)=>{if(itemsByVersion.length===1){downloadBlob(await makeDoc(itemsByVersion[0],1,profile),'LearningLab_ficha_v1.docx');return;}const zip=new JSZip();for(let i=0;i<itemsByVersion.length;i++)zip.file(`LearningLab_ficha_version_${i+1}.docx`,await makeDoc(itemsByVersion[i],i+1,profile));downloadBlob(await zip.generateAsync({type:'blob'}),`LearningLab_${itemsByVersion.length}_fichas.zip`);}};
  }

  function upgrade(){addStyles();installWorksheetGenerator();}
  window.addEventListener('load',()=>{let n=0;const t=setInterval(()=>{n++;if(window.LearningAPI&&$('#appShell')){upgrade();[500,1200,2500].forEach(ms=>setTimeout(upgrade,ms));clearInterval(t);}if(n>120)clearInterval(t);},100);});
})();

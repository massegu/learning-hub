(function(){
  function clean(v){return String(v??'').replace(/\s+/g,' ').trim()}
  function pad(n){return String(n).padStart(2,'0')}
  function stamp(){
    const d=new Date();
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  }
  function ageLabel(profile){
    const route=profile?.progress?.ageRoute||profile?.age_band||'perfil';
    return ({early:'6-7',junior:'8-10',primary:'10-12',middle:'13-15',teen:'16-18'})[route]||route;
  }
  function prefix(profile){return `LearningLab_${ageLabel(profile)}_${stamp()}`}
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
  function hashSeed(text){
    let h=2166136261;
    for(const ch of String(text||'')){
      h^=ch.charCodeAt(0);
      h=Math.imul(h,16777619);
    }
    return h>>>0;
  }
  function seededShuffle(arr,seed){
    const out=[...arr];
    let x=seed||1;
    const rnd=()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return ((x>>>0)%1000000)/1000000; };
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(rnd()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    return out;
  }
  function balancedOptions(it,itemIndex,version){
    if(!Array.isArray(it.opts)||!it.opts.length) return [];
    const opts=[...new Set(it.opts.map(x=>String(x)))];
    const answer=it.a===undefined?null:String(it.a);
    const seed=hashSeed(`${it.contentKey||it.id||it.q||''}|${itemIndex}|${version}`);
    if(!answer||!opts.includes(answer)) return seededShuffle(opts,seed);
    const wrong=seededShuffle(opts.filter(x=>x!==answer),seed);
    const positions=opts.length===4?[0,2,1,3]:Array.from({length:opts.length},(_,i)=>i);
    const target=positions[(itemIndex+version-1)%positions.length]%opts.length;
    const out=[...wrong];
    out.splice(target,0,answer);
    return out;
  }
  function optionParagraphs(it, TextRun, Paragraph, itemIndex, version, size=18){
    const opts=balancedOptions(it,itemIndex,version);
    if(!opts.length) return [];
    return opts.map((x,i)=>new Paragraph({
      spacing:{after:55,line:270},
      children:[new TextRun({text:`${String.fromCharCode(65+i)}. ${clean(x)}`,size,color:'173326',font:'Aptos'})]
    }));
  }
  async function makeDoc(items,version,profile,models){
    const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,Footer,PageBreak}=window.docx;
    const green='1F633B',green2='2F7D4A',light='EDF5E9',sand='F6F1E5',ink='173326',muted='607064',white='FFFFFF',line='D6DED6';
    const noBorders={top:{style:BorderStyle.NONE,size:0,color:white},bottom:{style:BorderStyle.NONE,size:0,color:white},left:{style:BorderStyle.NONE,size:0,color:white},right:{style:BorderStyle.NONE,size:0,color:white},insideHorizontal:{style:BorderStyle.NONE,size:0,color:white},insideVertical:{style:BorderStyle.NONE,size:0,color:white}};
    const softBorders={top:{style:BorderStyle.SINGLE,size:6,color:line},bottom:{style:BorderStyle.SINGLE,size:6,color:line},left:{style:BorderStyle.SINGLE,size:6,color:line},right:{style:BorderStyle.SINGLE,size:6,color:line},insideHorizontal:{style:BorderStyle.NONE,size:0,color:white},insideVertical:{style:BorderStyle.NONE,size:0,color:white}};
    const early=Boolean(window.ContentPolicy.forProfile(profile));
    const textSize=early?28:19;
    const paragraph=value=>new Paragraph({spacing:{line:early?360:285,after:70},children:[new TextRun({text:value,size:textSize,color:ink,font:'Aptos'})]});
    function renderMaterial(material){
      if(material.type==='text') return [paragraph(material.text)];
      if(material.type==='list') return material.items.map((value,i)=>paragraph(`${i+1}. ${value}`));
      return [new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:material.rows.map(row=>new TableRow({children:row.map(value=>new TableCell({margins:{top:100,bottom:100,left:120,right:120},children:[paragraph(value)]}))}))})];
    }
    const header=new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorders,rows:[new TableRow({children:[
      new TableCell({width:{size:70,type:WidthType.PERCENTAGE},shading:{fill:light},margins:{top:170,bottom:170,left:220,right:160},children:[
        new Paragraph({children:[new TextRun({text:'FICHA DE ENTRENAMIENTO',bold:true,size:34,color:green,font:'Aptos Display'})]}),
        new Paragraph({spacing:{before:40},children:[new TextRun({text:`Versión ${version} · ${profile.name} · ${ageLabel(profile)} años`,size:20,color:ink,font:'Aptos'})]})]}),
      new TableCell({width:{size:30,type:WidthType.PERCENTAGE},shading:{fill:green},margins:{top:145,bottom:145,left:100,right:100},children:[
        new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEVEL UP',bold:true,size:25,color:white,font:'Aptos'})]}),
        new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEARNING LAB',bold:true,size:12,color:'D9EAD3',font:'Aptos'})]})]})
    ]})]});
    const identity=new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorders,rows:[new TableRow({children:[
      new TableCell({width:{size:55,type:WidthType.PERCENTAGE},shading:{fill:sand},margins:{top:125,bottom:125,left:170,right:130},children:[new Paragraph({children:[new TextRun({text:'Nombre / alias: __________________________',size:19,color:ink,font:'Aptos'})]})]}),
      new TableCell({width:{size:45,type:WidthType.PERCENTAGE},shading:{fill:sand},margins:{top:125,bottom:125,left:130,right:170},children:[new Paragraph({children:[new TextRun({text:'Fecha: __________________',size:19,color:ink,font:'Aptos'})]})]})
    ]})]});
    const children=[header,new Paragraph({spacing:{after:80},children:[]}),identity,new Paragraph({spacing:{after:120},children:[]})];

    items.forEach((it,i)=>{
      if(i>0 && i%(early?3:5)===0) children.push(new Paragraph({children:[new PageBreak()]}));
      const model=models[i];
      const prompt=model.question;
      const block=[new Paragraph({spacing:{after:90},children:[new TextRun({text:`ACTIVIDAD ${i+1}`,bold:true,size:15,color:green2,font:'Aptos'})]})];
      if(model.stimulus.length){
        block.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:[new TableRow({children:[new TableCell({shading:{fill:light},margins:{top:140,bottom:140,left:170,right:170},children:[
          new Paragraph({spacing:{after:55},children:[new TextRun({text:early?'MIRA':'INFORMACIÓN',bold:true,size:early?20:13,color:green,font:'Aptos'})]}),
          ...model.stimulus.flatMap(renderMaterial)
        ]})]})]}));
        block.push(new Paragraph({spacing:{after:75},children:[]}));
      }
      if(early&&it.type==='memoryReveal') block.push(paragraph('Mira bien. Tapa las cosas y responde.'));
      block.push(new Paragraph({spacing:{after:90,line:early?360:300},children:[new TextRun({text:prompt,bold:true,size:early?28:21,color:ink,font:'Aptos'})]}));
      if(model.tokens.length){
        block.push(paragraph('Palabras o pasos disponibles:'));
        model.tokens.forEach((token,j)=>block.push(paragraph(`${j+1}. ${token}`)));
      }
      const op=optionParagraphs(it,TextRun,Paragraph,i,version,early?28:18);
      if(op.length){
        block.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:[new TableRow({children:[new TableCell({margins:{top:130,bottom:130,left:160,right:160},children:op})]})]}));
        block.push(new Paragraph({spacing:{after:70},children:[]}));
      }
      const openAnswer=!op.length || it.type==='self' || it.sample || it.type==='order';
      if(openAnswer){
        block.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:[new TableRow({children:[new TableCell({shading:{fill:'FBFCF8'},margins:{top:120,bottom:120,left:160,right:160},children:[
          new Paragraph({children:[new TextRun({text:early?'TU RESPUESTA':'RESPUESTA / ORGANIZACIÓN',bold:true,size:early?20:13,color:muted,font:'Aptos'})]}),
          new Paragraph({spacing:{before:90},children:[new TextRun({text:' ',size:18})]}),
          new Paragraph({children:[new TextRun({text:' ',size:18})]})
        ]})]})]}));
      }else{
        block.push(new Paragraph({spacing:{before:35,after:65},children:[new TextRun({text:'Respuesta: ________________________________________________',size:18,color:muted,font:'Aptos'})]}));
      }
      children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:[new TableRow({children:[new TableCell({margins:{top:150,bottom:150,left:180,right:180},children:block})]})]}));
      children.push(new Paragraph({spacing:{after:130},children:[]}));
    });

    const footer=new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEVEL UP · Learning Lab',size:14,color:muted,font:'Aptos'})]})]});
    const doc=new Document({sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:580,right:690,bottom:620,left:690}}},footers:{default:footer},children}]});
    return Packer.toBlob(doc);
  }
  async function generate(itemsByVersion,profile){
    if(!window.LocaleContent)throw new Error('No se ha cargado el adaptador regional.');
    const locale=window.LocaleContent.effective(profile,profile?.contentLocale ?? window.LearningAPI?.contentLocale);
    itemsByVersion=itemsByVersion.map(items=>items.map(item=>window.LocaleContent.localizeItem(item,locale)));
    // Validate every version before creating any file: no partial download and
    // no guessing a missing stimulus from the supplied correct answer.
    let models=window.ActivityModel.validateBatch(itemsByVersion,profile);
    models=models.map((version,v)=>version.map((model,i)=>window.LocaleContent.localizeModel(model,locale,itemsByVersion[v][i].localization?.domain || itemsByVersion[v][i].domain,itemsByVersion[v][i])));
    if(!window.docx) throw new Error('No se ha cargado el generador DOCX. Comprueba la conexión.');
    if(itemsByVersion.length>1&&!window.JSZip) throw new Error('No se ha cargado el generador ZIP. Comprueba la conexión.');
    const p=prefix(profile);
    if(itemsByVersion.length===1){
      downloadBlob(await makeDoc(itemsByVersion[0],1,profile,models[0]),`${p}_ficha_01.docx`);
      return;
    }
    const zip=new window.JSZip();
    for(let i=0;i<itemsByVersion.length;i++){
      zip.file(`${p}_ficha_${pad(i+1)}.docx`,await makeDoc(itemsByVersion[i],i+1,profile,models[i]));
    }
    downloadBlob(await zip.generateAsync({type:'blob'}),`${p}_fichas.zip`);
  }
  window.WorksheetGenerator={generate,integrityVersion:1};
})();

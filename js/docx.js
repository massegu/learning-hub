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
    const {Document,Packer,Paragraph,TextRun,ImageRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,Footer}=window.docx;
    const documentImages=new Map();
    const ids=[...new Set(models.flatMap(m=>m.stimulus.filter(b=>b.type==='document').map(b=>b.documentId)))];
    for(const id of ids){
      const source=window.DocumentLibrary?.get(id);
      if(!source)throw new Error('Documento visual desconocido.');
      const response=await fetch(source.path);
      if(!response.ok)throw new Error('No se pudo cargar el documento visual para la ficha.');
      const bytes=new Uint8Array(await response.arrayBuffer());
      if(bytes.length<24||[137,80,78,71,13,10,26,10].some((b,i)=>bytes[i]!==b))throw new Error('El documento visual no es una imagen PNG válida.');
      documentImages.set(id,bytes);
    }
    const green='1F633B' ,green2='2F7D4A',light='EDF5E9',sand='F6F1E5',ink='173326',muted='607064',white='FFFFFF',line='D6DED6';
    const noBorders={top:{style:BorderStyle.NONE,size:0,color:white},bottom:{style:BorderStyle.NONE,size:0,color:white},left:{style:BorderStyle.NONE,size:0,color:white},right:{style:BorderStyle.NONE,size:0,color:white},insideHorizontal:{style:BorderStyle.NONE,size:0,color:white},insideVertical:{style:BorderStyle.NONE,size:0,color:white}};
    const softBorders={top:{style:BorderStyle.SINGLE,size:6,color:line},bottom:{style:BorderStyle.SINGLE,size:6,color:line},left:{style:BorderStyle.SINGLE,size:6,color:line},right:{style:BorderStyle.SINGLE,size:6,color:line},insideHorizontal:{style:BorderStyle.NONE,size:0,color:white},insideVertical:{style:BorderStyle.NONE,size:0,color:white}};
    const early=Boolean(window.ContentPolicy.forProfile(profile));
    const textSize=early?28:19;
    const paragraph=value=>new Paragraph({spacing:{line:early?360:285,after:70},children:[new TextRun({text:value,size:textSize,color:ink,font:'Aptos'})]});
    function pictureParagraph(value,item,material,position){
      const illustrated=early||item.type==='memoryReveal'||item.speedTask;
      if(!illustrated)return paragraph(value);
      const key=illustrated?window.StimulusArt?.forLabel(value,{...item.lexicalSenses,subject:material.label}):null;
      // Glyphs are the units themselves: never add a second pictogram/dot.
      const prefix=position===undefined?[]:[new TextRun({text:`${position}. `,size:textSize})];
      const picture=key&&!/^[●○□△☆]$/.test(value)?[new ImageRun({data:window.StimulusArt.png(key),transformation:{width:32,height:32},altText:{name:'Objeto: '+value,title:value,description:value}}),new TextRun({text:' '})]:[];
      return new Paragraph({spacing:{line:360,after:90},children:[...prefix,...picture,new TextRun({text:value,size:textSize,color:ink,font:'Aptos'})]});
    }
    function renderMaterial(material,item){
      const heading=material.label?[paragraph(material.label)]:[];
      if(material.type==='document'){
        const source=window.DocumentLibrary.get(material.documentId);
        const description=source.transcript.map(b=>b.type==='text'?b.text:b.rows.map(r=>r.join(' · ')).join('; ')).join(' ');
        return [new Paragraph({alignment:AlignmentType.CENTER,children:[new ImageRun({data:documentImages.get(material.documentId),transformation:{width:Math.round(source.width*Math.min(340/source.width,510/source.height)),height:Math.round(source.height*Math.min(340/source.width,510/source.height))},altText:{name:source.title,title:source.title,description}})]}),paragraph('Contenido del documento visual:'),...source.transcript.flatMap(block=>renderMaterial(block,item))];
      }
      if(material.type==='text') return [...heading,paragraph(material.text)];
      if(early && material.presentation==='count' && material.items.every(x=>x==='●'))return [...heading,new Paragraph({spacing:{after:130},children:material.items.flatMap(value=>[new TextRun({text:value,size:40,color:ink}),new TextRun({text:'    '})])})];
      if(material.type==='list')return [...heading,...material.items.map((value,i)=>(early||item.type==='memoryReveal') && ['count','cards','sequence'].includes(material.presentation)?pictureParagraph(value,item,material,material.presentation==='sequence'?i+1:undefined):paragraph(`${i+1}. ${value}`))];
      return [...heading,new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:material.rows.map(row=>new TableRow({children:row.map(value=>new TableCell({margins:{top:100,bottom:100,left:120,right:120},children:[pictureParagraph(value,item,material)]}))}))})];
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
      const model=models[i];
      const prompt=model.question;
      const block=[new Paragraph({keepNext:true,spacing:{before:i?160:0,after:90},children:[new TextRun({text:`ACTIVIDAD ${i+1}`,bold:true,size:15,color:green2,font:'Aptos'})]})];
      if(model.stimulus.length){
        block.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:[new TableRow({children:[new TableCell({shading:{fill:light},margins:{top:140,bottom:140,left:170,right:170},children:[
          new Paragraph({spacing:{after:55},children:[new TextRun({text:early?'MIRA':'INFORMACIÓN',bold:true,size:early?20:13,color:green,font:'Aptos'})]}),
          ...model.stimulus.flatMap(material=>renderMaterial(material,it))
        ]})]})]}));
        block.push(new Paragraph({spacing:{after:75},children:[]}));
      }
      if(it.type==='memoryReveal') block.push(paragraph(it.recallSequence?'Una persona muestra las figuras una a una, en el orden impreso. Después tapa la secuencia y pide reproducirla.':'Mira el material. Después tápalo antes de responder.'));
      if(it.speedTask) block.push(paragraph('Práctica visual en papel: esta ficha no mide el tiempo de respuesta.'));
      block.push(new Paragraph({keepNext:true,spacing:{after:90,line:early?360:300},children:[new TextRun({text:prompt,bold:true,size:early?28:21,color:ink,font:'Aptos'})]}));
      if(model.tokens.length){
        block.push(paragraph('Palabras o pasos disponibles:'));
        model.tokens.forEach((token,j)=>block.push(paragraph(`${j+1}. ${token}`)));
      }
      const op=optionParagraphs(it,TextRun,Paragraph,i,version,early?28:18);
      if(op.length){
        block.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:[new TableRow({children:[new TableCell({margins:{top:130,bottom:130,left:160,right:160},children:op})]})]}));
        block.push(new Paragraph({spacing:{after:70},children:[]}));
      }
      if(it.writingRubric?.length){block.push(paragraph('Comprueba tu texto:'));it.writingRubric.forEach(line=>block.push(paragraph('• '+line)));}
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
      // Let Word paginate the activity's paragraphs and source tables normally.
      // A whole activity inside one outer table makes natural breaks brittle.
      children.push(...block);
      children.push(new Paragraph({spacing:{after:130},children:[]}));
    });

    const footer=new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEVEL UP · Learning Lab',size:14,color:muted,font:'Aptos'})]})]});
    const doc=new Document({sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:580,right:690,bottom:620,left:690}}},footers:{default:footer},children}]});
    // docx 8.5 creates a new counter for every drawing, yielding repeated
    // wp:docPr ids. Normalize the packaged XML without touching its content.
    const archive=await window.JSZip.loadAsync(await (await Packer.toBlob(doc)).arrayBuffer());
    let drawingId=0;
    for(const name of Object.keys(archive.files).filter(name=>/^word\/.*\.xml$/.test(name)).sort()){
      const entry=archive.file(name);
      if(!entry)continue;
      const xml=await entry.async('string');
      const normalized=xml.replace(/<wp:docPr\b[^>]*>/g,tag=>{
        if(!/\bname="[^"]*"/.test(tag)||!/\bid="\d+"/.test(tag))throw new Error('La imagen de la ficha tiene propiedades incompletas.');
        return tag.replace(/\bid="\d+"/,`id="${++drawingId}"`);
      });
      if(normalized!==xml)archive.file(name,normalized);
    }
    return archive.generateAsync({type:'uint8array',compression:'DEFLATE'});
  }
  async function generate(itemsByVersion,profile,replacement){
    if(!Array.isArray(itemsByVersion)||!itemsByVersion.length||itemsByVersion.some(items=>!Array.isArray(items)||!items.length))throw new Error('Actividad no imprimible: el lote está vacío.');
    if(!window.LocaleContent)throw new Error('No se ha cargado el adaptador regional.');
    const locale=window.LocaleContent.effective(profile,profile?.contentLocale ?? window.LearningAPI?.contentLocale);
    if(replacement){
      if(!window.WorksheetSelection)throw new Error('No se ha cargado el selector de fichas.');
      const selected=[];
      for(let version=0;version<itemsByVersion.length;version++){
        const valid=await window.WorksheetSelection.collect({initial:{items:itemsByVersion[version]},profile,country:locale,
          domains:replacement.domains,count:itemsByVersion[version].length,
          fetchMore:replacement.fetchMore?extra=>replacement.fetchMore({...extra,version}):undefined});
        selected.push(valid.items);
      }
      itemsByVersion=selected;
    }
    // Fail closed for direct callers without a replacement source. Normal UI
    // calls can recover before any file is made, including late-invalid items.
    const prepared=itemsByVersion.map(items=>items.map(item=>window.ActivityModel.preparePrintable(item,profile,locale,item?.localization?.domain||item?.domain||item?.sourceDomain)));
    itemsByVersion=prepared.map(items=>items.map(x=>x.item));
    const models=prepared.map(items=>items.map(x=>x.projection));
    if(window.ContentPolicy.forProfile(profile)&&!window.StimulusArt)throw new Error('No se ha cargado el adaptador de ilustraciones.');
    if(!window.docx) throw new Error('No se ha cargado el generador DOCX. Comprueba la conexión.');
    if(!window.JSZip) throw new Error('No se ha cargado el generador ZIP. Comprueba la conexión.');
    const p=prefix(profile);
    if(itemsByVersion.length===1){
      downloadBlob(new Blob([await makeDoc(itemsByVersion[0],1,profile,models[0])],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),`${p}_ficha_01.docx`);
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

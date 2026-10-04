(function(){
  function clean(v){return String(v??'').replace(/\s+/g,' ').trim()}
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
  function materialText(it){
    if(Array.isArray(it.memoryContent)) return it.memoryContent.map(x=>x.person?`${x.person}: ${x.detail}`:x.detail).join(' · ');
    if(it.scenario) return it.scenario;
    if(it.title&&it.text) return `${it.title}: ${it.text}`;
    if(it.model) return `Modelo: ${it.model}`;
    if(Array.isArray(it.modelSequence)) return `Modelo: ${it.modelSequence.join('  ')}`;
    if(Array.isArray(it.rows)) return it.rows.map((r,i)=>`Fila ${i+1}: ${r.join(' ')}`).join('   |   ');
    if(Array.isArray(it.visualItems)) return it.visualItems.join('   ');
    if(it.type==='cancel'&&Array.isArray(it.stimuli)) return it.stimuli.join('   ');
    return '';
  }
  function promptText(it){
    if(it.dividend) return `${it.dividend} ÷ ${it.divisor}`;
    if(it.type==='executive'&&it.prompt) return it.prompt;
    if(it.type==='order'&&Array.isArray(it.tokens)) return `${it.q||'Ordena la secuencia.'}\nElementos disponibles: ${it.tokens.join(' · ')}`;
    if(it.memoryQuestion) return it.memoryQuestion;
    return it.q||it.prompt||'Actividad';
  }
  function optionsText(it){return Array.isArray(it.opts)&&it.opts.length?it.opts.map((x,i)=>`${String.fromCharCode(65+i)}. ${x}`).join('     '):''}
  async function makeDoc(items,version,profile){
    const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,Footer,PageBreak}=window.docx;
    const green='1F633B',green2='2F7D4A',light='EDF5E9',sand='F6F1E5',ink='173326',muted='607064',white='FFFFFF',line='D6DED6';
    const noBorders={top:{style:BorderStyle.NONE,size:0,color:white},bottom:{style:BorderStyle.NONE,size:0,color:white},left:{style:BorderStyle.NONE,size:0,color:white},right:{style:BorderStyle.NONE,size:0,color:white},insideHorizontal:{style:BorderStyle.NONE,size:0,color:white},insideVertical:{style:BorderStyle.NONE,size:0,color:white}};
    const softBorders={top:{style:BorderStyle.SINGLE,size:6,color:line},bottom:{style:BorderStyle.SINGLE,size:6,color:line},left:{style:BorderStyle.SINGLE,size:6,color:line},right:{style:BorderStyle.SINGLE,size:6,color:line},insideHorizontal:{style:BorderStyle.NONE,size:0,color:white},insideVertical:{style:BorderStyle.NONE,size:0,color:white}};
    const header=new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorders,rows:[new TableRow({children:[
      new TableCell({width:{size:70,type:WidthType.PERCENTAGE},shading:{fill:light},margins:{top:170,bottom:170,left:220,right:160},children:[
        new Paragraph({children:[new TextRun({text:'FICHA DE ENTRENAMIENTO',bold:true,size:34,color:green,font:'Aptos Display'})]}),
        new Paragraph({spacing:{before:40},children:[new TextRun({text:`Versión ${version} · ${profile.name}`,size:20,color:ink,font:'Aptos'})]})]}),
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
      if(i>0 && i%5===0) children.push(new Paragraph({children:[new PageBreak()]}));
      const material=clean(materialText(it)),prompt=clean(promptText(it)),opts=clean(optionsText(it));
      const block=[];
      block.push(new Paragraph({spacing:{after:90},children:[new TextRun({text:`ACTIVIDAD ${i+1}`,bold:true,size:15,color:green2,font:'Aptos'})]}));
      if(material){
        block.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:[new TableRow({children:[new TableCell({shading:{fill:light},margins:{top:140,bottom:140,left:170,right:170},children:[
          new Paragraph({spacing:{after:55},children:[new TextRun({text:'INFORMACIÓN',bold:true,size:13,color:green,font:'Aptos'})]}),
          new Paragraph({spacing:{line:285},children:[new TextRun({text:material,size:19,color:ink,font:'Aptos'})]})
        ]})]})]}));
        block.push(new Paragraph({spacing:{after:75},children:[]}));
      }
      block.push(new Paragraph({spacing:{after:90,line:300},children:[new TextRun({text:prompt,bold:true,size:21,color:ink,font:'Aptos'})]}));
      if(opts){
        block.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:[new TableRow({children:[new TableCell({margins:{top:130,bottom:130,left:160,right:160},children:[new Paragraph({spacing:{line:285},children:[new TextRun({text:opts,size:18,color:ink,font:'Aptos'})]})]})]})]}));
        block.push(new Paragraph({spacing:{after:70},children:[]}));
      }
      const openAnswer=!opts || it.type==='self' || it.sample || it.type==='order';
      if(openAnswer){
        block.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:[new TableRow({children:[new TableCell({shading:{fill:'FBFCF8'},margins:{top:120,bottom:120,left:160,right:160},children:[
          new Paragraph({children:[new TextRun({text:'RESPUESTA / ORGANIZACIÓN',bold:true,size:13,color:muted,font:'Aptos'})]}),
          new Paragraph({spacing:{before:90},children:[new TextRun({text:' ',size:18})]}),
          new Paragraph({children:[new TextRun({text:' ',size:18})]})
        ]})]})]}));
      }else{
        block.push(new Paragraph({spacing:{before:35,after:65},children:[new TextRun({text:'Respuesta: ________________________________________________',size:18,color:muted,font:'Aptos'})]}));
      }
      const cell=new TableCell({margins:{top:150,bottom:150,left:180,right:180},children:block});
      children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:softBorders,rows:[new TableRow({children:[cell]})]}));
      children.push(new Paragraph({spacing:{after:130},children:[]}));
    });

    const footer=new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEVEL UP · Learning Lab',size:14,color:muted,font:'Aptos'})]})]});
    const doc=new Document({sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:580,right:690,bottom:620,left:690}}},footers:{default:footer},children}]});
    return Packer.toBlob(doc);
  }
  async function generate(itemsByVersion,profile){
    if(itemsByVersion.length===1){downloadBlob(await makeDoc(itemsByVersion[0],1,profile),'LearningLab_ficha_v1.docx');return;}
    const zip=new JSZip();for(let i=0;i<itemsByVersion.length;i++)zip.file(`LearningLab_ficha_version_${i+1}.docx`,await makeDoc(itemsByVersion[i],i+1,profile));
    downloadBlob(await zip.generateAsync({type:'blob'}),`LearningLab_${itemsByVersion.length}_fichas.zip`);
  }
  window.WorksheetGenerator={generate};
})();

(function(){
  function clean(v){return String(v??'').replace(/\s+/g,' ').trim()}
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
  function itemText(it){
    if(it.type==='cancel'&&Array.isArray(it.stimuli)) return `${it.prompt}\n\n${it.stimuli.join('   ')}`;
    if(it.type==='executive') return `${it.prompt} Situación: ${it.situation||''}`;
    if(it.dividend) return `${it.dividend} ÷ ${it.divisor} = ______    resto ______`;
    if(it.title&&it.text) return `${it.title}: ${it.text}\n${it.q||''}`;
    if(it.q) return it.q;
    return it.prompt||'Actividad';
  }
  async function makeDoc(items,version,profile){
    const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,Footer}=window.docx;
    const green='1F633B',light='EDF5E9',sand='F6F1E5',ink='173326',muted='607064',white='FFFFFF';
    const noBorders={top:{style:BorderStyle.NONE,size:0,color:white},bottom:{style:BorderStyle.NONE,size:0,color:white},left:{style:BorderStyle.NONE,size:0,color:white},right:{style:BorderStyle.NONE,size:0,color:white},insideHorizontal:{style:BorderStyle.NONE,size:0,color:white},insideVertical:{style:BorderStyle.NONE,size:0,color:white}};
    const header=new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorders,rows:[new TableRow({children:[new TableCell({width:{size:72,type:WidthType.PERCENTAGE},shading:{fill:light},margins:{top:180,bottom:180,left:220,right:160},children:[new Paragraph({children:[new TextRun({text:'FICHA DE ENTRENAMIENTO',bold:true,size:38,color:green,font:'Aptos Display'})]}),new Paragraph({children:[new TextRun({text:`Versión ${version} · ${profile.name}`,size:21,color:ink,font:'Aptos'})]})]}),new TableCell({width:{size:28,type:WidthType.PERCENTAGE},shading:{fill:green},margins:{top:150,bottom:150,left:100,right:100},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEVEL UP',bold:true,size:27,color:white,font:'Aptos'})]}),new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEARNING LAB',bold:true,size:13,color:'D9EAD3',font:'Aptos'})]})]})]})]});
    const name=new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorders,rows:[new TableRow({children:[new TableCell({shading:{fill:sand},margins:{top:130,bottom:130,left:180,right:180},children:[new Paragraph({children:[new TextRun({text:'Fecha: ________________________________',size:21,color:ink,font:'Aptos'})]})]})]})]});
    const children=[header,new Paragraph({text:' '}),name];
    items.forEach((it,i)=>{children.push(new Paragraph({spacing:{before:180,after:90,line:310},children:[new TextRun({text:`${i+1}. `,bold:true,size:23,color:green,font:'Aptos'}),new TextRun({text:clean(itemText(it)),size:23,color:ink,font:'Aptos'})]}));children.push(new Paragraph({spacing:{after:120},children:[new TextRun({text:'____________________________________________________________________________',size:17,color:'B3BDB3'})]}));});
    const footer=new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEVEL UP · Learning Lab',size:16,color:muted,font:'Aptos'})]})]});
    const doc=new Document({sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:620,right:700,bottom:650,left:700}}},footers:{default:footer},children}]});
    return Packer.toBlob(doc);
  }
  async function generate(itemsByVersion,profile){
    if(itemsByVersion.length===1){downloadBlob(await makeDoc(itemsByVersion[0],1,profile),'LearningLab_ficha_v1.docx');return;}
    const zip=new JSZip();for(let i=0;i<itemsByVersion.length;i++)zip.file(`LearningLab_ficha_version_${i+1}.docx`,await makeDoc(itemsByVersion[i],i+1,profile));
    downloadBlob(await zip.generateAsync({type:'blob'}),`LearningLab_${itemsByVersion.length}_fichas.zip`);
  }
  window.WorksheetGenerator={generate};
})();

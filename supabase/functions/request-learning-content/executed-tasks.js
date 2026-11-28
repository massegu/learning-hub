(function(root){
'use strict';
const ages=['early','junior','primary','middle','teen'],cache=new Map();
const comparisonFormats=['icons','words','mixed'];
const classicPictures=['libro','pelota','lápiz','manzana','botella','regalo'];
const adolescentSets=[['cámara','auriculares','brújula','calculadora','llaves','guitarra'],['regalo','linterna','tijeras','carpeta','mapa','sobre'],['martillo','llave inglesa','pala','regla','paraguas','guitarra']];
const definitions={
 'attention.cancel':['visualSearch','minimal','medium','selection','Localizar objetivos ignorando distractores'],
 'attention.compare':['visualComparison','minimal','medium','selection','Comparar posiciones y localizar diferencias'],
 'attention.follow':['visualInstructionFollowing','low','medium','sequence','Seguir una secuencia visual'],
 'memory.serial':['shortTermMemory','minimal','medium','sequence','Reconstruir una secuencia observada'],
 'memory.spatial':['spatialMemory','minimal','medium','selection','Recordar posiciones ocupadas'],
 'memory.update':['workingMemory','low','medium','sequence','Actualizar un elemento del recuerdo'],
 'executive.switch':['cognitiveFlexibility','low','medium','selection','Cambiar la respuesta al cambiar la regla'],
 'executive.inhibit':['responseInhibition','minimal','medium','selection','Esperar o responder según una señal'],
 'executive.plan':['planning','low','low','sequence','Ejecutar pasos respetando sus dependencias']
};
const quality=root.ContentQuality||(typeof require==='function'&&require('./content-quality'));
for(const [family,def] of Object.entries(definitions))quality.register(family,def[4],family.startsWith('memory')?'memoryLoad':'rules');
function spatialLayouts(size,cols,count,seed){
 const layouts=[],seen=new Set();
 let includedChevron=false;
 for(let attempt=0;attempt<512&&layouts.length<8;attempt++){
  const cells=Array.from({length:size},(_,i)=>i);
  for(let i=cells.length-1;i>0;i--){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;
   const j=Math.floor(seed/4294967296*(i+1));
   [cells[i],cells[j]]=[cells[j],cells[i]];
  }
  const positions=cells.slice(0,count).sort((a,b)=>a-b),key=positions.join(',');
  const rows=new Set(positions.map(i=>Math.floor(i/cols))),columns=new Set(positions.map(i=>i%cols));
  if(rows.size<2||columns.size<2||seen.has(key))continue;
  const leftToRight=[...positions].sort((a,b)=>a%cols-b%cols);
  const chevron=count===3&&columns.size===3&&Math.floor(leftToRight[0]/cols)===Math.floor(leftToRight[2]/cols);
  if(chevron&&includedChevron)continue;
  includedChevron||=chevron;
  seen.add(key);layouts.push(positions);
 }
 return layouts;
}
function pool(age,domain,level=1,revision=4){
 if(!ages.includes(age)||!['attention','memory','executive'].includes(domain)||![1,2,3].includes(level))return [];
 const key=[age,domain,level,revision].join(':');if(cache.has(key))return structuredClone(cache.get(key));
 const early=age==='early',size=early?(level===1?4:6):level===1?9:12,count=early?Math.min(3,level+1):Math.min(5,level+2),out=[];
 for(const home of [false,true])for(const family of Object.keys(definitions).filter(x=>x.startsWith(domain+'.'))){
 for(const format of revision>=5&&family==='attention.compare'?comparisonFormats:[null])
 for(const layout of revision>=6&&family==='memory.spatial'?[0,1,2,3]:[null]){
  const pictures=!format&&['middle','teen'].includes(age)?adolescentSets[(level-1+(home?1:0))%adolescentSets.length]:classicPictures;
  const kind=family.split('.')[1],offset=format?(comparisonFormats.indexOf(format)+(home?1:0))%3:home?1:0,cols=early?(level===1?2:3):level===1?3:4;
  const cells=Array.from({length:size},(_,i)=>pictures[(i*3+Math.floor(i/3)+offset)%pictures.length]);
  const target=pictures[offset],sequence=pictures.slice(offset,offset+count),positions=Array.from({length:Math.min(level,early?3:4)},(_,i)=>(i*2+offset)%size);
  let execution={kind,cols,cells,target,targets:level===3?[target,pictures[(offset+1)%pictures.length]]:[target]},answer,q,paperQuestion,stimulus,feedback;
  const setting=home?'Preparas el material de casa.':'Preparas el material del taller.';
  if(family==='attention.cancel'){
   q=level===3?'Marca los objetos iguales a cualquiera de los dos modelos.':'Marca todos los objetos iguales al modelo.';answer=cells.flatMap((x,i)=>execution.targets.includes(x)?[String(i)]:[]);paperQuestion=q+' Modelos: '+execution.targets.join(', ')+'.';
   stimulus=[{type:'text',text:setting+' Modelos: '+execution.targets.join(', ')+'.'},{type:'table',rows:Array.from({length:size/cols},(_,r)=>cells.slice(r*cols,(r+1)*cols))}];feedback='Comparar cada objeto con el modelo ayuda a no marcar los distractores.';
  }else if(family==='attention.compare'){
   const changed=[...cells];for(const i of positions)changed[i]=pictures[(pictures.indexOf(cells[i])+1)%pictures.length];execution.after=changed;if(format)execution.format=format;answer=positions.map(String).sort((a,b)=>Number(a)-Number(b));q='Compara las dos cuadrículas. Marca en B las casillas que cambiaron.';paperQuestion=q;
   stimulus=[{type:'text',text:setting+' Cuadrícula A, después cuadrícula B.'},{type:'table',rows:Array.from({length:size/cols},(_,r)=>cells.slice(r*cols,(r+1)*cols))},{type:'table',rows:Array.from({length:size/cols},(_,r)=>changed.slice(r*cols,(r+1)*cols))}];feedback='Revisar la misma posición en A y B ayuda a localizar los cambios.';
  }else if(family==='attention.follow'||family==='memory.serial'||family==='memory.update'){
   execution.sequence=sequence;execution.choices=[...pictures];q=family==='attention.follow'?'Pulsa los objetos en el orden del modelo.':'Observa los objetos. Después reconstruye su orden.';
   answer=[...sequence];if(kind==='update'){execution.replaceIndex=level===1?0:count-1;execution.replacement=pictures[5];answer[execution.replaceIndex]=pictures[5];q=early?'Mira los dibujos. Cuando cambie uno, ponlos en el orden nuevo.':'Recuerda el orden y aplica el cambio que aparecerá.';}
   execution.reverse=level===3;if(execution.reverse){answer.reverse();q+=early?' Empieza por el último.':' Reconstruye en orden inverso.';}
   paperQuestion=kind==='update'?(early?'Mira los dibujos. Cambiará uno. Escribe el orden nuevo'+(execution.reverse?' empezando por el último.':'.'):'Recuerda el orden y sustituye el objeto de la posición '+(execution.replaceIndex+1)+' por '+execution.replacement+'. Escribe el orden actualizado'+(execution.reverse?' en orden inverso.':'.')):q;
   stimulus=[{type:'text',text:setting},{type:'list',items:sequence}];feedback=kind==='update'?'Sustituye solo el objeto indicado y conserva el resto del orden.':'Recorrer los objetos en orden ayuda a reconstruir la secuencia.';
  }else if(family==='memory.spatial'){
   const spatialSize=early&&(level===1||layout!==null&&level===3)?(level===1?6:9):size,spatialCols=early&&level===1?3:cols,spatialCount=Math.min(spatialSize-1,3+level-1),occupied=layout!==null?spatialLayouts(spatialSize,spatialCols,spatialCount,(ages.indexOf(age)+1)*173+level*19)[layout+(home?4:0)]:[...Array.from({length:spatialSize},(_,i)=>i).filter(i=>i%2===0),...Array.from({length:spatialSize},(_,i)=>i).filter(i=>i%2===1)].map(i=>(i+offset)%spatialSize).slice(0,spatialCount),distractors=pictures.filter(x=>x!==target);execution.cols=spatialCols;execution.occupied=occupied;answer=occupied.map(String);q='Recuerda dónde está el objeto modelo. Después marca solo sus casillas; ignora los otros objetos.';paperQuestion=q+' Modelo: '+target+'.';
   execution.cells=Array.from({length:spatialSize},(_,i)=>occupied.includes(i)?target:distractors[(i+offset)%distractors.length]);stimulus=[{type:'text',text:setting},{type:'table',rows:Array.from({length:spatialSize/spatialCols},(_,r)=>execution.cells.slice(r*spatialCols,(r+1)*spatialCols).map(x=>x||'Vacío'))}];feedback='Usar las filas y columnas como referencia ayuda a recordar las posiciones.';
  }else if(family==='executive.plan'){
   if(revision>=5&&level>=2){
    const older=['middle','teen'].includes(age);
    const steps=older?(home?['Seleccionar los archivos solicitados','Comprimir los archivos','Comprobar el contenido del ZIP','Adjuntar el ZIP','Enviar al equipo']:['Reunir los datos','Comprobar los datos','Preparar un borrador','Revisar el borrador','Entregar el informe']):
      home?['Abrir la caja','Guardar el material','Comprobar el contenido','Cerrar la caja','Llevar la caja']:['Abrir la mochila','Guardar el cuaderno','Comprobar el material','Cerrar la mochila','Llevar la mochila'];
    const distractors=older?(home?['Cambiar el fondo de pantalla','Añadir fotos al azar']:['Cambiar el tamaño de la papelera','Enviar un archivo vacío']):home?['Sacar todos los juguetes','Dibujar en el suelo']:['Cambiar de silla','Sacar todos los libros'];
    execution.steps=steps.slice(0,level===2?(early?3:4):(early?4:5));
    execution.dependencies=execution.steps.slice(1).map((_,i)=>[i,i+1]);
    execution.choices=[...execution.steps.slice(1).reverse(),distractors[0],execution.steps[0],...distractors.slice(1,level-1)];
    answer=execution.steps;
    q='Elige los pasos necesarios, ordénalos y deja fuera los que sobran.';
    paperQuestion=q+' Escribe la secuencia.';
    const context=older?(home?'Necesitas preparar un único archivo comprimido para compartir los documentos solicitados. Comprueba que contiene lo necesario y envíalo al equipo.':'Debes preparar un informe fiable y entregarlo al terminar.'):(home?'Quieres dejar el material dentro de la caja y llevarla cerrada, sin olvidar comprobar el contenido.':'Quieres preparar la mochila para salir y comprobar que lleva todo lo necesario.');
    stimulus=[{type:'text',text:context},{type:'list',label:'Tarjetas disponibles',items:execution.choices}];
    feedback='Comprueba los pasos necesarios y respeta qué debe ocurrir antes de cada acción.';
   }else{
   const steps=home?['Abrir la caja','Guardar el material','Cerrar la caja','Pegar la etiqueta','Llevar la caja']:['Abrir la mochila','Guardar el cuaderno','Cerrar la mochila','Colgar la mochila','Preparar la salida'];
   execution.steps=steps.slice(0,count);if(early&&level===3)execution.steps=['Guardar el material','Comprobar el contenido','Cerrar la caja'];execution.dependencies=execution.steps.slice(1).map((_,i)=>[i,i+1]);answer=execution.steps;q='Haz el encargo: pulsa los pasos en el orden necesario.';paperQuestion='Ordena los pasos respetando las dependencias.';
   stimulus=[{type:'text',text:home?'Quieres preparar una caja y llevarla lista, con el material guardado.':'Quieres dejar la mochila preparada para salir.'},{type:'list',label:'Acciones disponibles',items:[...execution.steps].reverse()}];feedback='Completar primero cada requisito permite ejecutar el plan sin saltarse pasos.';
   }
  }else{
   execution.trials=Array.from({length:early?2+level*2:4+level*2},(_,i)=>({symbol:(i+offset)%3===0?'pelota':'libro',reversed:kind==='switch'&&i>=Math.floor((early?2+level*2:4+level*2)/2)}));
   answer=execution.trials.map(t=>kind==='inhibit'?(t.symbol==='libro'?'act':'wait'):(t.symbol==='libro')!==t.reversed?'A':'B');
   q=kind==='inhibit'?'Pulsa solo cuando aparezca el libro. Con la pelota, espera.':'Sigue la regla de cada bloque. La regla cambiará a mitad.';paperQuestion=q+' Indica la respuesta de cada tarjeta sin medir el tiempo.';
   stimulus=[{type:'text',text:setting},{type:'table',rows:execution.trials.map((t,i)=>[String(i+1),t.symbol,kind==='inhibit'?'Libro: pulsa. Pelota: espera.':t.reversed?'Libro: B. Pelota: A.':'Libro: A. Pelota: B.'])}];feedback=kind==='inhibit'?'Comprobar la señal antes de responder ayuda a respetar las pausas.':'Volver a mirar la regla cuando cambia ayuda a ajustar la respuesta.';
  }
  const def=definitions[family],id=[layout!==null?'executed-v6':format||revision>=5&&kind==='plan'&&level>=2?'executed-v5':'executed-v4',age,domain,level,family,home?'home':'school',...(format?[format]:[]),...(layout!==null?[String(layout)]:[])].join(':');
  out.push({id,contentKey:id,domain,level,type:'executed',responseType:'executed',requiresStimulus:true,q,paperQuestion,stimulus,sample:answer.map(x=>['cancel','compare','spatial'].includes(kind)?'Fila '+(Math.floor(Number(x)/(execution.cols||cols))+1)+', columna '+(Number(x)%(execution.cols||cols)+1):x==='act'?'Responder':x==='wait'?'Esperar':x).join(' → '),execution:{...execution,answer,ordered:!['cancel','compare','spatial'].includes(kind),exposureMs:early?10000:Math.max(5000,10000-level*1000),trialMs:early?3000:2500},topic:({attention:'Atención',memory:'Memoria',executive:'Funciones ejecutivas'})[domain]+' · retos interactivos',mechanic:'executed_'+family.replaceAll('.','_'),qualityDescriptor:{semanticFamily:family,scenarioFamily:format?'comparison.'+format+'.'+(home?'home':'school'):home?'home.materials':'school.workshop'},primaryConstruct:domain==='memory'&&(kind==='update'||execution.reverse)?'workingMemory':def[0],...(domain==='memory'?{memorySystem:kind==='update'||execution.reverse?'workingMemory':'shortTermMemory'}:{}),secondaryLoads:domain==='memory'?['visualRecognition']:['visualRecognition','motorSelection'],readingDemand:def[1],visualDemand:def[2],motorDemand:def[3],why:feedback});
 }
 }
 cache.set(key,out);return structuredClone(out);
}
function validate(item,age){
 if(item?.type!=='executed'||!item.contentKey)throw Error('Falta el contrato de actividad interactiva.');
 const canonical=pool(age||item.contentKey.split(':')[1],item.domain,item.level,item.contentKey.startsWith('executed-v6:')?6:item.contentKey.startsWith('executed-v5:')?5:4).find(x=>x.contentKey===item.contentKey);if(!canonical)throw Error('Actividad interactiva no registrada para esta edad.');
 const locale=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
 const expected=item.localization?locale.localizeItem(canonical,item.localization.locale,item.domain):canonical;
 for(const field of ['type','q','paperQuestion','stimulus','sample','execution','primaryConstruct','memorySystem','secondaryLoads','readingDemand','visualDemand','motorDemand','mechanic','qualityDescriptor'])if(JSON.stringify(item[field])!==JSON.stringify(expected[field]))throw Error('La fuente o respuesta interactiva ha cambiado: '+field);
 return true;
}
function grade(item,response){validate(item);if(!Array.isArray(response))return false;const actual=response.map(String),expected=item.execution.answer.map(String);return JSON.stringify(item.execution.ordered?actual:[...new Set(actual)].sort())===JSON.stringify(item.execution.ordered?expected:[...expected].sort());}
const api={pool,validate,grade,definitions,comparisonFormats};root.ExecutedTasks=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

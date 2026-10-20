(function(root){
'use strict';
const library=root.ReadingLibrary||(typeof require==='function'&&require('./reading-library'));
const docs=root.DocumentLibrary||(typeof require==='function'&&require('./document-library'));
const ages=['early','junior','primary','middle','teen'];
const T=text=>({type:'text',text}), L=items=>({type:'list',items,presentation:'sequence'}), R=rows=>({type:'table',rows});
function rotate(a,n){return a.slice(n%a.length).concat(a.slice(0,n%a.length));}
function shuffled(a,seed){const b=[...a];for(let i=b.length-1;i>0;i--){seed=(Math.imul(seed+1,1664525)+1013904223)>>>0;const j=seed%(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;}
function choice(q,stimulus,a,wrong,extra={}){return {type:'standard',responseType:'choice',requiresStimulus:true,q,stimulus,a,opts:[a,...wrong.filter(x=>x!==a)],...extra};}
function materialKey(value){
 const text=JSON.stringify(value);let a=2166136261,b=2246822519;
 for(const ch of text){a=Math.imul(a^ch.charCodeAt(0),16777619);b=Math.imul(b^ch.charCodeAt(0),3266489917);}
 return (a>>>0).toString(16)+(b>>>0).toString(16);
}
function finish(item,age,domain,level,key,mechanic){
 const id=`curriculum-v2-${age}-${domain}-${level}-${key}`;
 const memoryMaterialKey=domain==='memory'?materialKey([item.recallSequence?'sequence':item.recallEvidence?.kind||'associations',item.stimulus]):null;
 const earlyMechanic=domain==='language'?'vocabulary':domain==='reading'?(item.responseType==='order'?'sequencing':'literal'):domain==='speedReasoning'?'speedCompare':domain==='memory'?(item.memoryResponse==='spatial'?'rememberPlace':'rememberOrder'):'planning';
 return {...item,...(domain==='memory'?{lexicalSenses:{...item.lexicalSenses,banana:true}}:{}),...(item.speedTask?{speedRevision:3}:{}),id,contentKey:id,semanticKey:item.passageKey||memoryMaterialKey||id,...(memoryMaterialKey?{memoryMaterialKey}:{}),domain,level,mechanic,
  ...(age==='early'?{ageProfile:{id:'early',revision:1,context:'school',mechanic:earlyMechanic,family:`${domain}-${mechanic}`}}:{}),
  ...(age==='junior'?{juniorProfile:{route:age,level}}:{}),...(['primary','middle'].includes(age)?{schoolProfile:{route:age,level}}:{})};
}
function reading(age,domain,level){
 const bank=library[age].flatMap((entry,i)=>{
  const [title,text,q,a,b,iq,ia,ib]=entry,source=[T(text)],passageKey=`reading-v2-${age}-${i}`;
  const base={topic:title,passageKey,why:age==='early'?'Busca la pista en la historia.':ia+'. La explicación debe apoyarse en lo que cuenta el texto.'};
  const tasks=[choice(q,source,a,[b],{...base,why:`La respuesta se encuentra en el texto: ${a}.`})];
  if(age!=='early')tasks.push(choice(iq,source,ia,[ib],base));
  if((domain==='literacy'&&age!=='teen')||age==='junior')tasks.push({type:'self',requiresStimulus:true,responseType:'written',q:`${iq} Escribe ${age==='primary'?'dos o tres frases':'un párrafo breve'}: responde y explica qué dato del texto apoya tu respuesta.`,stimulus:source,...base,sample:ia+'. Una pista del texto es: «'+(text.split(/(?<=[.!?])\s+/)[({primary:[1,5,5,0,3,4,2,5,5,4],middle:[3,3,2,3,3,4,4,3,4,3],teen:[4,4,6,4,5,3,4,5,4,5]})[age]?.[i]||0]||text.split(/(?<=[.!?])\s+/).at(-1))+'».',writingRubric:['Respondo a la pregunta con claridad.','Uso un dato concreto del texto para justificar mi respuesta.','Reviso que las frases se entiendan y tengan puntuación.']});
  return tasks.map((it,m)=>finish(it,age,domain,level,`${i}-${m}`,'reading_'+(['literal','inference','writing'][m])));
 });
 if(age==='early'){for(const [i,parts] of [['Ana','salta','en el patio'],['Leo','lee','un cuento'],['Mar','riega','la planta'],['Pau','guarda','el libro'],['Nora','dibuja','una casa'],['Dani','come','una manzana']].entries()){const answer=parts.slice(0,level===1?2:3);bank.push(finish({type:'order',responseType:'order',requiresStimulus:true,q:'Forma la frase. Primero va el nombre.',stimulus:[T(answer.join(' '))],tokens:[...answer].reverse(),answer,languageFocus:'writing',passageKey:'writing-early-'+i},age,domain,level,'compose-'+i,'reading_writing'));}}
 if(age!=='early')bank.push(...documentWriting(age,domain,level));
 if(age==='teen'){
  const cases=[
   ['Cambio de reunión','El equipo ha reservado la biblioteca el miércoles a las 16:00 para revisar una presentación. Sara termina una evaluación a las 16:30 y tarda quince minutos en llegar. La biblioteca está disponible hasta las 18:00. Todavía no se ha acordado cambiar la hora.','Escribe un mensaje de 3–4 frases al equipo. Propón una hora que permita participar a Sara, justifícala con los datos y pide confirmar el cambio.','Propongo reunirnos a las 16:45: Sara termina a las 16:30 y necesita quince minutos para llegar. Así podremos revisar la presentación antes del cierre de las 18:00. ¿Confirmamos el cambio?','propuesta','El equipo'],
   ['Instrucción incompleta','El grupo recibe este mensaje: «Enviad el trabajo pronto por el canal habitual». El mensaje no indica una fecha límite ni identifica el canal. El grupo ha usado tanto correo como una carpeta compartida en proyectos anteriores.','Escribe un correo breve a quien envió el mensaje. Pregunta por los dos datos que faltan y explica por qué los necesitas. No inventes una fecha ni un canal.','Hola: ¿cuál es la fecha límite y por qué canal debemos entregar el trabajo? En otros proyectos usamos correo y carpeta compartida. Necesitamos confirmar ambos datos para hacer la entrega correctamente.','consulta','La persona que dio la instrucción'],
   ['Dos valoraciones del encuentro','Al terminar un encuentro, seis asistentes respondieron una encuesta y los seis dijeron que el sonido era bueno. En el registro técnico consta que el micrófono dejó de funcionar durante diez minutos. No se sabe en qué parte de la sala estaban quienes respondieron.','Escribe 3–4 frases para el informe del encuentro. Relaciona las dos fuentes, explica qué se sabe y señala una cuestión pendiente.','Las seis respuestas valoran bien el sonido, pero el registro técnico recoge diez minutos sin micrófono. No sabemos dónde estaban quienes respondieron. Conviene comprobar si su experiencia representa a las demás personas asistentes.','síntesis de fuentes','El equipo organizador'],
   ['Propuesta de préstamo','La sala de estudio dispone de dos calculadoras para prestar durante una hora. Algunas personas piden ampliar el préstamo a tres horas. El registro solo cuenta préstamos realizados; no anota cuántas personas encontraron las calculadoras ocupadas.','Escribe una recomendación de 3–4 frases para la responsable de la sala. Propón una comprobación antes de cambiar el plazo y explica qué información falta.','Antes de ampliar el plazo, propongo registrar las solicitudes que no pueden atenderse por falta de calculadoras. El registro actual solo muestra los préstamos realizados. Ese dato ayudaría a valorar si un plazo mayor dificultaría el acceso de otras personas.','recomendación','La responsable de la sala']
  ];
  for(const [i,[title,source,q,sample,purpose,audience]] of cases.entries())bank.push(finish({type:'self',responseType:'written',assessment:'self',requiresStimulus:true,stimulus:[T(source)],q: q+(level===3?' Revisa que tu conclusión no vaya más allá de los datos.':''),sample,topic:title,writingPurpose:purpose,writingAudience:audience,writingRubric:['Cumplo el propósito y me dirijo a la persona indicada.','Uso datos del texto y distingo lo que falta por confirmar.','Reviso claridad, puntuación y extensión.'],passageKey:'writing-teen-text-'+i},age,domain,level,'write-text-'+i,'writing_text_'+purpose));
 }

 return bank;
}
function documentWriting(age,domain,level){
 return Object.entries(docs.documents).filter(([,doc])=>doc.brief&&ages.indexOf(age)>=ages.indexOf(doc.minAge)).map(([id,doc],i)=>finish({type:'self',responseType:'written',requiresStimulus:true,assessment:'self',q:(age==='junior'?`Escribe dos o tres frases para una persona de tu clase: cuenta lo más importante de «${doc.title}» y usa un dato de la fuente.`:doc.brief)+(level===3?' Comprueba también que no atribuyes al documento algo que no dice.':''),stimulus:[T(`Fuente: ${doc.kind} de ${doc.country}.`),{type:'document',documentId:id}],sample:age==='junior'?doc.transcript.slice(0,3).map(b=>b.text).join(' '):doc.sample,writingPurpose:doc.kind,writingAudience:'La persona o el grupo indicado en la consigna',writingRubric:id==='post-pa'?['Identifico por separado un hecho, una inferencia y una opinión.','Compruebo la fecha del intercambio sin confundirla con la publicación.','Uso datos del documento y reviso mi redacción.']:['Cumplo el propósito y el formato pedidos.','Uso datos exactos de la fuente sin inventar otros.','Adapto el mensaje a su destinatario y reviso claridad y signos.'],topic:'Lectura + Escritura · '+doc.title,currencyContext:'foreign',passageKey:'document:'+id},age,domain,level,'write-document-'+id,age==='junior'?'writing_summary':'writing_'+({'poster-mx':'invitation','ticket-es':'inquiry_email','menu-ar':'correct_claim','notice-cl':'public_notice','transport-co':'practical_message','infographic-cr':'caption_evidence','post-pa':'fact_inference_opinion','label-mx':'clear_instructions','form-es':'request_email','map-cl':'directions','schedule-ar':'recommendation','advert-co':'rewrite_advert','instructions-cr':'rewrite_instructions','news-pa':'compare_sources'}[id])));
}
// Authored lexical work belongs to Language, separate from composing a text.
const lexicalCases={
 early:[['Ana está feliz porque juega con Leo.','feliz','contenta','triste'],['La caja es enorme. No cabe bajo la mesa.','enorme','muy grande','pequeña'],['El gato está oculto bajo la cama.','oculto','escondido','visible'],['El camino está seco. No tiene agua.','seco','sin agua','mojado'],['La puerta está abierta. Podemos pasar.','abierta','sin cerrar','cerrada'],['La sopa está caliente. Esperamos para comer.','caliente','con mucho calor','fría']],
 junior:[['La pista era breve: tenía solo dos líneas.','breve','corta','extensa'],['El paso es opcional: puedes hacerlo o saltarlo.','opcional','voluntario','obligatorio'],['Hay que conservar el dibujo; no lo tires.','conservar','guardar','desechar'],['El papel es frágil y se rompe con facilidad.','frágil','delicado','resistente'],['El grupo acordó iniciar el juego después del recreo.','iniciar','empezar','terminar'],['La respuesta fue precisa: indicó el lugar exacto.','precisa','exacta','imprecisa']],
 primary:[['La hipótesis es provisional: cambiará si aparecen otras pruebas.','provisional','temporal','definitiva'],['La explicación es coherente: sus partes no se contradicen.','coherente','consistente','contradictoria'],['Decidieron ampliar la búsqueda a otras dos fuentes.','ampliar','extender','reducir'],['El acceso es restringido: solo entran las personas autorizadas.','restringido','limitado','libre'],['El dato era relevante porque respondía a la pregunta.','relevante','pertinente','irrelevante'],['Se detectó una diferencia y hubo que verificar la copia.','verificar','comprobar','ignorar']],
 middle:[['El mensaje es ambiguo: permite dos interpretaciones distintas.','ambiguo','poco claro','inequívoco'],['La participación fue voluntaria; nadie estaba obligado.','voluntaria','opcional','obligatoria'],['Se omitió la fecha, por lo que no se sabe cuándo ocurrió.','omitió','dejó fuera','incluyó'],['El proyecto es viable: dispone de tiempo y recursos suficientes.','viable','realizable','inviable'],['La evidencia es insuficiente: aún no permite decidir.','insuficiente','escasa','suficiente'],['La portavoz matizó su frase para limitarla a los casos estudiados.','matizó','precisó','generalizó']],
 teen:[['Bajaron el volumen para mitigar las molestias, aunque no desaparecieron.','mitigar','reducir','agravar'],['La nueva grabación corrobora la hora indicada en el registro.','corrobora','confirma','refuta'],['La fuente ofrece una estimación, no una cifra medida con exactitud.','estimación','aproximación','medición exacta'],['La autorización es revocable: se puede retirar más adelante.','revocable','anulable','irrevocable'],['El acuerdo es vinculante: las partes deben cumplirlo.','vinculante','obligatorio','opcional'],['La propuesta es inviable porque requiere recursos que no existen.','inviable','irrealizable','viable']]
};
function vocabulary(age,domain,level){
 const tasks=[];
 lexicalCases[age].forEach(([source,word,meaning,opposite],i)=>{
  tasks.push(finish(choice(level===3?`Alguien interpreta «${word}» como «${opposite}». ¿Qué significado corrige esa interpretación?`:`¿Qué significa «${word}» aquí?`,[T(source)],meaning,[opposite,...(age==='early'?[]:['No se puede saber'])],{languageFocus:'vocabulary',...(age==='teen'?{teenReview:{version:2,context:'lexical'}}:{}),topic:'Lenguaje · significado en contexto',why:'El significado debe encajar en la situación.'}),age,domain,level,'lexical-context-'+i,'vocabulary_context'));
  tasks.push(finish(choice(`¿Qué palabra o expresión indica lo contrario de «${word}»?`,[T(source)],opposite,[meaning,...(age==='early'?[]:['Tiene el mismo significado'])],{languageFocus:'vocabulary',...(age==='teen'?{teenReview:{version:2,context:'lexical'}}:{}),topic:'Lenguaje · contraste de significado',why:'Busca el significado contrario, sin cambiar el contexto de la palabra.'}),age,domain,level,'lexical-contrast-'+i,'vocabulary_contrast'));
 });
 return tasks;
}
const objects=['el libro','la pelota','el lápiz','la manzana','la botella','la gorra','el cuaderno','el regalo','la galleta','el oso de peluche','la muñeca','el coche de juguete'];
const schoolObjects=[...objects,'la regla','las tijeras','el pegamento','la carpeta','la cartuchera','el mapa','el sobre','la linterna'];
const functionalObjects=['la agenda','la tarjeta de transporte','el cargador','la carpeta','el recibo','el mapa','la calculadora','la botella','las llaves','el lápiz','el cuaderno','la regla','los auriculares','la cámara','el reloj','la memoria USB','el adaptador','el paraguas','el sobre','el libro','el estuche','el teléfono móvil','el cable','la tarjeta de acceso'];
const memoryCategories=[
 {name:'Animales',items:['el gato','el perro','el conejo','el pájaro']},
 {name:'Alimentos',items:['la manzana','el plátano','el pan','la zanahoria']},
 {name:'Transportes',items:['el autobús','el tren','el barco','la bicicleta']},
 {name:'Herramientas',items:['el martillo','la llave inglesa','la sierra','la pala']},
 {name:'Ciudades',items:['la plaza','el puente','los edificios','la calle']},
 {name:'Naturaleza',items:['el árbol','la montaña','el río','la nube']},
 {name:'Viaje',items:['la maleta','el pasaporte','la tienda de campaña','la brújula']},
 {name:'Muebles',items:['la silla','la mesa','el sofá','la cama']},
 {name:'Flores',items:['la rosa','el tulipán','el girasol','la margarita']}
];
const selectiveVocabulary=new Map();
function validateSelectiveRecall(item){
 const block=item.stimulus?.[0],e=item.selectiveRecall;
 if(item.type!=='memoryReveal'||item.memoryResponse!=='multiple'||item.responseType!=='multiple'||block?.type!=='list'||!e||!['Animales','Alimentos'].includes(e.category))throw new Error('Recuerdo selectivo incompatible.');
 const labels=memoryCategories.find(x=>x.name===e.category).items;
 const local=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
 let allowed=selectiveVocabulary.get(e.category);
 if(!allowed){allowed=new Set(labels.flatMap(label=>[label,...Object.keys(local.labels).map(country=>local.text(label,country,{banana:true}))]));selectiveVocabulary.set(e.category,allowed);}
 const indices=block.items.flatMap((value,i)=>allowed.has(value)?[i]:[]);
 if(JSON.stringify(indices)!==JSON.stringify(e.indices))throw new Error('Las imágenes seleccionadas no pertenecen a la categoría pedida.');
 // Locale adaptation may rename a material; the declared indices bind recall to
 // the actual displayed entries, and duplicates/extra targets cannot pass.
 if(!Array.isArray(e.indices)||e.indices.length<1||new Set(e.indices).size!==e.indices.length||e.indices.some(i=>!Number.isInteger(i)||i<0||i>=block.items.length))throw new Error('Categoría de recuerdo incompleta.');
 const expected=e.indices.map(i=>block.items[i]);
 if(!Array.isArray(item.answers)||new Set(item.answers).size!==expected.length||item.answers.length!==expected.length||!expected.every(x=>item.answers.includes(x))||!item.opts?.every(x=>typeof x==='string')||!item.answers.every(x=>item.opts.includes(x)))throw new Error('La respuesta no corresponde a las imágenes recordadas.');
 return expected;
}
function spatialPositions(size){return Array.from({length:size*size},(_,i)=>`Fila ${Math.floor(i/size)+1}, columna ${i%size+1}`);}
function memory(age,level){
 const rank=ages.indexOf(age),count=Math.min(8,rank+level+1),items=[];
 for(let v=0;v<72;v++){
  const materials=[...new Set([...memoryCategories[v%9].items,...memoryCategories[(v+3)%9].items,...(rank===0?objects:rank===1?schoolObjects:functionalObjects).slice(v%6,v%6+4)])];
  const featured=memoryCategories[v%9].items[Math.floor(v/9)%4];
  const values=shuffled([featured,...shuffled(materials.filter(x=>x!==featured),57+v).slice(0,count-1)],v+17),reverse=level===3&&rank>=2,expected=reverse?[...values].reverse():values;
  items.push(finish({type:'memoryReveal',responseType:'order',memoryResponse:'order',requiresStimulus:true,
   q:reverse?'Mira la secuencia. Después la repetirás desde el final.':'Mira la secuencia. Después repetirás el orden.',
   memoryQuestion:reverse?'Reproduce la secuencia en orden inverso.':'Reproduce la secuencia en el mismo orden.',
   stimulus:[L([...values])],memoryContent:values.map(detail=>({detail})),tokens:shuffled(values,19+v),answer:[...expected],
   revealMs:Math.max(6000,count*1400),sequenceStepMs:1400,recallSequence:[...values],
   recallEvidence:{kind:'sequence',block:0,reverse},topic:'Memoria · secuencias',
   why:rank===0?'Recuerda los elementos en el mismo orden.':expected.join(' → ')},age,'memory',level,`sequence-${v}`,'memory_sequence'));
  const size=rank<2?2:level===1?2:3,capacity=size*size,load=Math.min(capacity,level+(rank>=2?2:1));
  const places=shuffled(Array.from({length:capacity},(_,i)=>i),v+41),marked=values.slice(0,load),grid=Array.from({length:size},()=>Array(size).fill('—'));
  marked.forEach((x,i)=>{grid[Math.floor(places[i]/size)][places[i]%size]=x;});
  // Level 3 asks for two positions for older groups; ordered binding prevents a swapped answer.
  const dual=rank>=2&&level===3,target=marked[0],target2=marked[1];
  const pos=n=>`Fila ${Math.floor(n/size)+1}, columna ${n%size+1}`;
  const a=dual?pos(places[0])+' → '+pos(places[1]):pos(places[0]);
  const opts=dual?[a,pos(places[1])+' → '+pos(places[0]),pos(places[0])+' → '+pos(places[2]),pos(places[2])+' → '+pos(places[1])]:spatialPositions(size);
  items.push(finish({type:'memoryReveal',responseType:'choice',memoryResponse:dual?'spatialPair':'spatial',requiresStimulus:true,
   q:'Mira dónde está cada imagen. Después taparemos el cuadro.',memoryQuestion:dual?`¿Dónde estaban ${target} y ${target2}, en ese orden?`:`¿Dónde ${/^(los|las) /.test(target)?'estaban':'estaba'} ${target}?`,
   stimulus:[{...R(grid),presentation:'spatial',label:'Filas de arriba abajo; columnas de izquierda a derecha.'}],memoryContent:marked.map(detail=>({detail})),
   a,opts,gridSize:size,revealMs:Math.max(6000,load*1800),recallEvidence:{kind:'spatial',block:0,targets:dual?[target,target2]:[target]},topic:'Memoria · posiciones',why:a},age,'memory',level,`spatial-${v}`,'memory_spatial'));
  const unseen=materials.find(x=>!values.includes(x));
  items.push(finish({type:'memoryReveal',responseType:'choice',requiresStimulus:true,q:'Mira estas imágenes. Después las taparemos.',memoryQuestion:'¿Qué imagen estaba en el grupo?',stimulus:[{type:'list',items:[...values],presentation:'cards'}],memoryContent:values.map(detail=>({detail})),a:values[v%values.length],opts:[values[v%values.length],unseen],revealMs:Math.max(6000,count*1300),answerEvidence:{type:'listItem',block:0,index:v%values.length},topic:'Memoria · reconocimiento'},age,'memory',level,`recognition-${v}`,'memory_recognition'));
  if(rank>0){
   const takeLast=Math.min(values.length-1,level+1),answer=values.slice(-takeLast);
   items.push(finish({type:'memoryReveal',responseType:'order',memoryResponse:'order',requiresStimulus:true,q:`Mira toda la secuencia. Después recordarás solo las últimas ${takeLast} imágenes.`,memoryQuestion:`Reproduce solo las últimas ${takeLast} imágenes en el mismo orden.`,stimulus:[L([...values])],memoryContent:values.map(detail=>({detail})),recallSequence:[...values],tokens:shuffled(answer,91+v),answer,revealMs:Math.max(6000,count*1400),sequenceStepMs:1400,recallEvidence:{kind:'sequence',block:0,takeLast,reverse:false},topic:'Memoria · actualizar lo reciente'},age,'memory',level,`recent-${v}`,'memory_recent'));
  }
  if(rank>0){
   const category=memoryCategories[v%2],other=memoryCategories[1-v%2],n=level;
   const targets=rotate(category.items,Math.floor(v/2)).slice(0,n),missing=category.items.find(x=>!targets.includes(x));
   const shown=shuffled([...targets,...rotate(other.items,v).slice(0,rank===1?2:level+1)],v+41);
   const answers=shown.filter(x=>targets.includes(x));
   items.push(finish({type:'memoryReveal',responseType:'multiple',memoryResponse:'multiple',requiresStimulus:true,
    q:'Mira todas las imágenes. Después recordarás solo una categoría.',memoryQuestion:`Categoría: ${category.name}. Selecciona todas las imágenes de esa categoría que estaban en el grupo.`,
    stimulus:[{type:'list',presentation:'cards',items:shown}],memoryContent:shown.map(detail=>({detail})),answers,
    opts:shuffled([...targets,missing,...other.items.slice(0,2)],v+17),selectiveRecall:{category:category.name,indices:shown.flatMap((x,i)=>targets.includes(x)?[i]:[])},
    revealMs:Math.max(6000,shown.length*1500),topic:'Memoria · recuerdo por categoría',why:'De la categoría '+category.name+' aparecieron: '+answers.join(', ')+'. No basta con pertenecer a la categoría: la imagen también tenía que estar en el grupo.'},age,'memory',level,`category-${v}`,'memory_category'));
  }
  // Associations keep memory broader than the two new recall modes.
  const people=['Ana','Leo','Sol','Dani','Mar','Hugo','Lola','Nora'].slice(0,count),pairs=people.map((n,i)=>[n,values[i]]),ask=v%count;
  items.push(finish({type:'memoryReveal',responseType:'choice',requiresStimulus:true,q:'Mira la imagen que acompaña a cada persona. Después la taparemos.',memoryQuestion:`¿Qué imagen acompañaba a ${people[ask]}?`,stimulus:[{...R(pairs),presentation:'associations'}],memoryContent:pairs.map(([person,detail])=>({person,detail})),a:values[ask],opts:rotate(values,ask).slice(0,rank===0?Math.min(3,count):4),revealMs:Math.max(6000,count*1700),answerEvidence:{type:'tableCell',block:0,row:ask,column:1,subjectColumn:0},topic:'Memoria · personas y objetos'},age,'memory',level,`association-${v}`,'memory_association'));
 }
 return items;
}
function speed(age,level){
 const rank=ages.indexOf(age),pool=[];
 const vocabularies=[['figures',['○','□','△','☆']],['objects',['libro','pelota','manzana','botella']],['arrows',['↑','→','↓','←']],['orientation',['↗','↘','↙','↖']],['pictograms',['gorra','regalo','lápiz','tijeras']],...(rank>0?[['characters',['A','7','B','3']],['mixed',['A','↑','7','☆']]]:[])];
 for(let v=0;v<96;v++){
  const [visualFamily,glyphs]=vocabularies[Math.floor(v/2)%vocabularies.length];
  const n=rank===0?level:rank===1?level+1:rank+level;
  const first=Array.from({length:n},(_,j)=>glyphs[(Math.floor(Math.floor(v/2)/Math.pow(4,j)))%4]);
  const second=[...first],same=v%2===0;
  if(!same){const index=(v+level)%n;second[index]=glyphs[(glyphs.indexOf(second[index])+1)%4];}
  pool.push(finish(choice('¿Son iguales?',[{...R([[first.join(' · '),second.join(' · ')]]),presentation:'speedComparison'}],same?'Sí':'No',[same?'No':'Sí'],{topic:'Velocidad · comparar figuras',speedTask:true,speedFamily:visualFamily,speedEvidence:{kind:'equal',block:0},why:same?'Las dos series son iguales.':'Hay una figura diferente.'}),age,'speedReasoning',level,`compare-${v}`,'speed_compare_'+visualFamily));
  if(v<48){
   const animals=['gato','perro','conejo','pájaro'],tools=['lápiz','regla','tijeras','pegamento'],sameCategory=v%2===0;
   const left=animals[Math.floor(v/2)%4],right=sameCategory?animals[(Math.floor(v/2)+1)%4]:tools[Math.floor(v/2)%4];
   pool.push(finish(choice('¿Los dos son animales?',[{...R([[left,right]]),presentation:'speedComparison'}],sameCategory?'Sí':'No',[sameCategory?'No':'Sí'],{speedTask:true,speedFamily:'category',speedEvidence:{kind:'category',block:0,category:'animals'},topic:'Velocidad · reconocer una categoría',why:sameCategory?'Los dos son animales.':'Uno de los dos es un objeto.'}),age,'speedReasoning',level,`category-${v}`,'speed_category'));
  }
  if(rank>0){
   const codes=['K','M','R','T','V','Z','P','L'].slice(0,Math.min(8,rank+level+1)),key=rotate(codes,v%codes.length),target=key[(v+level)%key.length],a=String(key.indexOf(target)+1);
   pool.push(finish(choice(`¿Qué número corresponde a ${target}?`,[{type:'table',header:true,rows:[['Código','Número'],...key.map((c,i)=>[c,String(i+1)])]}],a,key.map((_,i)=>String(i+1)).filter(x=>x!==a).slice(0,3),{speedTask:true,speedFamily:'key',topic:'Velocidad · clave de códigos',speedEvidence:{kind:'key',target,block:0},why:`${target} corresponde a ${a}.`}),age,'speedReasoning',level,`key-${v}`,'speed_key'));
   const model=shuffled(['KR','KT','MR','MT','RK','RM','TK','TM'],v+level).slice(0,Math.min(4,level+(rank>=3?1:0))).join(''),wrong=model.slice(0,-1)+(model.endsWith('K')?'M':'K');
   pool.push(finish(choice('¿Qué opción es idéntica al modelo?',[T('Modelo: '+model)],model,[wrong],{speedTask:true,speedFamily:'match',topic:'Velocidad · coincidencia exacta',speedEvidence:{kind:'model',block:0},why:'Compara todos los caracteres, también el último.'}),age,'speedReasoning',level,`match-${v}`,'speed_match'));
  }
 }
 return pool;
}
// Situations ask for an actual decision and correction, with plausible near misses.
const contexts={
 early:[
 ['Hay agua en la mesa. Ana quiere poner allí su dibujo. El papel se moja con el agua.','¿Qué debe hacer antes de poner el dibujo?','Secar la mesa',['Poner el dibujo sobre el agua','Dejar la mesa mojada']],
 ['Leo quiere pintar. El lápiz está dentro de una caja cerrada. Leo intenta sacar el lápiz sin abrir la caja.','¿Qué paso falta?','Abrir la caja',['Cerrar otra vez la caja','Guardar el dibujo']],
 ['Para salir al patio hay que guardar las piezas. Mar guarda los libros y deja las piezas fuera.','¿Qué falta para poder salir?','Guardar las piezas',['Sacar los libros','Volver a abrir la puerta']],
 ['Pau lleva una planta a la ventana. La maceta tiene tierra suelta. Quiere llevarla boca abajo.','¿Cómo debe llevar la maceta?','Con la tierra hacia arriba',['Con la tierra hacia abajo','Sujetando solo una hoja']],
 ['Lola necesita papel y un lápiz para dibujar. Ya tiene papel. Busca una pelota y dice que ya está lista.','¿Qué le falta?','Un lápiz',['Más papel','Una pelota']],
 ['Sol pone primero los zapatos y luego quiere ponerse los calcetines. Los calcetines van debajo.','¿Qué paso debe cambiar?','Ponerse los calcetines antes de los zapatos',['Ponerse otro zapato encima','Guardar los calcetines']]
 ],
 junior:[
 ['El grupo prepara un mural. Debe pegar los dibujos solo cuando la pintura esté seca. Ana ha terminado de pintar y propone pegarlos ya, aunque la superficie todavía está húmeda. Hay que tenerlos listos para mañana, así que no necesitan terminar este mismo minuto.','¿Qué cambio evita estropear el trabajo?','Esperar a que se seque y después pegar los dibujos',['Pegar ahora y secar por encima','Pegar solo la mitad mientras está húmeda']],
 ['Leo debe entregar una ficha el viernes. Ha escrito todas las respuestas, pero la ficha pide también su nombre. El jueves, antes de guardarla, ve que ese espacio sigue vacío. Un compañero le propone repetir toda la ficha para estar seguro.','¿Qué corrección resuelve lo que falta?','Escribir su nombre y comprobar la ficha',['Repetir las respuestas sin añadir el nombre','Guardar la ficha porque las respuestas están hechas']],
 ['Para un juego hacen falta cuatro tarjetas por equipo. Hay tres equipos y una caja con diez tarjetas. El plan dice repartir cuatro a cada equipo sin preparar ninguna más. Todas las personas deben jugar con las mismas reglas.','¿Qué debe corregir el grupo?','Preparar dos tarjetas más antes de repartir',['Dar cuatro a dos equipos y dos al tercero','Repartir tres a cada equipo y guardar una']],
 ['La biblioteca presta libros después de registrar el nombre de quien los recoge. Sara ha elegido un libro y lo ha guardado, pero aún no ha pasado por el mostrador. Dice que ya puede salir porque el libro está en su mochila.','¿Qué paso sigue pendiente?','Registrar el préstamo antes de salir',['Leer el primer capítulo antes de salir','Dejar el libro guardado y registrarlo otro día']],
 ['Un grupo va a grabar una historia. Primero debe comprobar que se oye la voz. El plan propone grabar todo, borrar la prueba de sonido sin escucharla y entregar el audio. Aún queda tiempo para hacer una prueba corta.','¿Qué paso conviene añadir?','Escuchar la prueba y corregir el sonido antes de grabar todo',['Borrar también el audio final','Entregar la prueba sin escucharla']],
 ['Para un recorrido, el grupo debe pasar por el árbol y terminar en el banco. El plan termina en el árbol y después vuelve a la puerta. Ya han marcado ambos lugares en un dibujo del patio.','¿Qué condición no cumple el plan?','Terminar en el banco',['Pasar por el árbol','Marcar los lugares antes de salir']]
 ],
 primary:[
 ['La feria abre a las cinco. El grupo necesita diez minutos para colocar el tablero y otros cinco para comprobar las tarjetas. El material ya está preparado, pero el plan dice llegar a las cinco y comprobarlo después de empezar a jugar. Las dos comprobaciones deben hacerse antes de abrir.','¿Qué cambio cumple el horario?','Llegar quince minutos antes y montar y comprobar antes de abrir',['Llegar cinco minutos antes y montar mientras juegan','Llegar a las cinco y comprobar solo al terminar']],
 ['En el huerto quieren comparar dos cantidades de agua. Usarán semillas iguales y observarán el crecimiento durante una semana. El plan propone poner un grupo al sol y el otro en sombra, además de darles distinta agua. Quieren que el resultado permita estudiar el agua.','¿Qué cambio hace que la prueba responda a la pregunta?','Dejar ambos grupos con la misma luz y mantener distintas cantidades de agua',['Dar la misma agua y dejar distinta luz','Cambiar también las semillas para ver más diferencias']],
 ['La biblioteca permite recoger un libro con una autorización que incluya el nombre de quien lo recoge. Iris ha firmado una nota, pero ha dejado ese nombre en blanco. Su hermano ya tiene el aviso de reserva y piensa ir directamente al mostrador.','¿Qué dato debe completar antes de que vaya?','El nombre de su hermano en la autorización',['El título de otro libro en el aviso','La fecha de la próxima reserva']],
 ['El equipo revisó las reglas del juego antes de añadir una regla de desempate. Ahora quiere imprimir la versión nueva usando como comprobación la revisión anterior. La feria es mañana y aún puede probar un ejemplo de empate con las reglas finales.','¿Qué falta para revisar la versión que se va a usar?','Probar el empate con la nueva regla antes de imprimir',['Imprimir primero la versión antigua','Volver a comprobar solo cómo se suman los puntos']],
 ['Cada caja admite seis libros. Tienen dieciocho libros y dos cajas, además de bolsas que no se pueden usar para este traslado. El plan dice llenar las dos cajas y dejar el resto en una bolsa. La entrega debe incluir todos los libros en cajas.','¿Qué corrección cumple las condiciones?','Preparar una tercera caja para los seis libros restantes',['Poner nueve libros en cada caja','Conservar dos cajas y usar la bolsa para el resto']],
 ['Para publicar una entrevista deben comprobar que las respuestas conservan su sentido. El resumen elimina la pregunta donde se decía que hablaban solo de los exámenes. La respuesta restante parece referirse a todo el curso. El audio completo sigue disponible.','¿Qué cambio evita una conclusión distinta de la original?','Recuperar la condición sobre los exámenes al presentar la respuesta',['Mantener solo la respuesta porque es más corta','Cambiar el nombre de la persona entrevistada']]
 ],
 middle:[
 ['El equipo entrega un informe antes de las seis. El archivo debe ser PDF, incluir los gráficos y ocupar como máximo cinco megabytes. A las cinco se revisó una versión sin el último gráfico. Después se añadió y el archivo pasó a seis megabytes. El plan es enviar este archivo usando la revisión de las cinco. Quedan veinte minutos para ajustar el formato sin quitar datos.','¿Qué corrección cumple todos los requisitos?','Reducir el tamaño conservando el gráfico y revisar el PDF final',['Enviar la versión revisada sin el último gráfico','Revisar la versión de seis megabytes y enviarla así']],
 ['Una encuesta pretende recoger los usos del patio. La invitación llegó primero al grupo deportivo. El plan propone cerrar la encuesta porque ya hay muchas respuestas, aunque todavía no se ha invitado a los demás grupos. Se quiere proponer una distribución para todo el centro y no solo describir las preferencias de quienes ya participaron.','¿Qué cambio mejora el alcance de la propuesta?','Invitar a los otros grupos y explicar cómo se recogieron las respuestas',['Pedir más respuestas solo al grupo deportivo','Cambiar el título para decir que ya participó todo el centro']],
 ['La inscripción exige enviar el formulario y guardar un comprobante. El sistema permite guardar borradores, pero eso no los entrega. El plan de una participante termina al pulsar guardar y considera el aviso de cambios conservados como prueba de entrega. El plazo sigue abierto y el formulario está completo.','¿Qué paso debe corregir?','Enviar la solicitud y descargar el comprobante de entrega',['Volver a guardar el mismo borrador','Cerrar el portal porque todos los campos están completos']],
 ['Para probar un robot quieren cambiar solo la distancia del sensor. El plan cambia también la velocidad y la luz de la sala. Si el recorrido mejora, quieren atribuirlo al sensor. Tienen guardada la configuración anterior y tiempo para repetir varias pruebas.','¿Qué modificación permite valorar el sensor?','Restaurar velocidad y luz y variar solo la distancia del sensor',['Mantener todos los cambios y repetir una sola vez','Cambiar también el recorrido para ampliar la prueba']],
 ['La organización puede publicar un vídeo si todas las personas que aparecen han autorizado su difusión pública. Los permisos actuales solo permiten mostrarlo dentro del centro. El plan considera suficiente ese permiso y propone publicarlo en una cuenta abierta. No hay una fecha de publicación obligatoria.','¿Qué corrección respeta el alcance de los permisos?','Comprobar la autorización pública y excluir las imágenes no autorizadas',['Publicar con el nombre de la cuenta oculto','Acortar el vídeo sin revisar quién aparece']],
 ['El taller empieza a las cinco. La recepción exige estar diez minutos antes y el trayecto dura veinte minutos. El plan propone salir a las cuatro y cuarenta y llegar justo a las cinco. El material ya está listo y no hace falta pasar por otro lugar.','¿Cuál es la salida más tardía que cumple el registro?','Las cuatro y treinta',['Las cuatro y cuarenta','Las cuatro y cincuenta']]
 ],
 teen:[
 ['Tienes una cita a las cinco. El registro cierra diez minutos antes y el trayecto dura veinte minutos. Antes de salir debes descargar un comprobante, disponible cinco minutos después de enviar el formulario. El plan es enviarlo a las cuatro y veinte, descargarlo a las cuatro y veinticinco y salir a las cuatro y treinta y cinco. El aviso de envío no sustituye al comprobante.','¿Qué corrección permite cumplir todas las condiciones?','Mantener el envío y la descarga y salir a las cuatro y treinta como máximo',['Salir a las cuatro y treinta y cinco porque la cita es a las cinco','Salir al enviar el formulario usando el aviso como comprobante']],
 ['Un informe debe incluir todos los gráficos, estar en PDF y ocupar como máximo cinco megabytes. La versión revisada ocupaba cuatro, pero no incluía el último gráfico. Al añadirlo y volver a exportar, el archivo pasó a seis. El plan autoriza el envío porque la revisión anterior no encontró errores. Hay margen de tiempo para ajustar el archivo.','¿Qué debe exigir la supervisión?','Reducir el tamaño sin perder gráficos y revisar el PDF que se enviará',['Enviar el PDF anterior porque ya está revisado','Revisar el archivo nuevo y enviarlo aunque exceda el tamaño']],
 ['El proyecto tiene un presupuesto que cubre material, transporte y una reserva para imprevistos. Aparece un gasto de montaje obligatorio que no estaba incluido. El plan propone usar toda la reserva y ampliar además la decoración. No se permite superar el total disponible. El montaje tiene prioridad sobre la decoración, que puede reducirse.','¿Qué revisión permite mantener el objetivo y el margen?','Reducir la decoración para cubrir el montaje y conservar la reserva',['Aumentar la decoración y usar después la reserva para lo que falte','Omitir el montaje para conservar la decoración']],
 ['Una oferta permite utilizar una herramienta durante un mes y después renueva automáticamente. El proyecto durará seis semanas. El plan compara solo el precio inicial con una licencia que cubre todo el proyecto y recomienda la oferta. Las dos herramientas tienen las funciones necesarias y se conocen sus condiciones de renovación.','¿Qué dato debe incorporar antes de recomendar?','El coste de cubrir las seis semanas y el momento de cancelación',['Solo el tamaño del descuento inicial','El precio de un mes aunque no cubra el proyecto']],
 ['El equipo publica una comparación de consumo entre dos equipos. Uno consume menos por unidad, pero requiere dos unidades para cubrir el mismo espacio. El plan recomienda ese equipo sin sumar el consumo de ambas unidades. Los dos deben ofrecer la misma prestación y funcionar durante el mismo tiempo.','¿Qué corrección hace válida la comparación?','Comparar el consumo total necesario para la misma prestación y tiempo',['Comparar solo una unidad de cada modelo','Acortar el tiempo del equipo recomendado']],
 ['Un servicio cambia la hora de una cita colectiva y avisa a una sola persona. Esa persona actualiza el calendario, pero no comprueba si las demás tienen acceso ni si han visto el cambio. El plan da por terminado el aviso. Hay participantes que organizan transporte compartido y necesitan conocer la hora antes de salir.','¿Qué debe comprobar antes de cerrar la tarea?','Que todas las personas afectadas recibieron y confirmaron el nuevo horario',['Que el calendario conserve también la hora antigua sin explicarla','Que quien editó el calendario recuerde la hora de memoria']]
 ]};
const reviewCases={
 junior:[
  ["Preparar la mesa de pintura","El grupo va a pintar. Antes de empezar revisa si el material preparado coincide con lo que pidió la profesora.",[
   ["Papel", "Una hoja por persona", "Una hoja para todo el grupo"],
   ["Agua", "Un vaso para lavar pinceles", "Ningún vaso"],
   ["Protección", "Mesa cubierta", "Mesa sin cubrir"],
   ["Pinceles", "Uno por persona", "Uno para todo el grupo"],
   ["Limpieza", "Lavar los pinceles al terminar", "Guardar los pinceles con pintura"],
  ]],
  ["La bolsa de la excursión","La clase prepara una bolsa para salir al parque. Hay que comparar la lista acordada con el plan antes de cerrar la bolsa.",[
   ["Bebida", "Una botella de agua", "Una botella vacía"],
   ["Comida", "Una pieza de fruta", "Solo una servilleta"],
   ["Gorra", "Una gorra", "Ninguna gorra"],
   ["Abrigo", "Una chaqueta", "Solo la bolsa"],
   ["Identificación", "Escribir el nombre en la bolsa", "No escribir el nombre"],
  ]],
  ["Cuidar las plantas","A una pareja le toca cuidar las plantas del aula. El cartel indica qué necesita cada una antes de irse a casa.",[
   ["Planta pequeña", "Un vaso de agua", "Tres vasos de agua"],
   ["Maceta grande", "Dos vasos de agua", "Ningún vaso de agua"],
   ["Ubicación", "Junto a la ventana", "Dentro del armario"],
   ["Bandeja", "Debajo de la maceta", "Encima de las hojas"],
   ["Hojas", "Dejar libres las hojas", "Cubrir las hojas con una bolsa"],
  ]],
  ["Devolver los juegos","Tras jugar, la clase debe guardar cada material en su lugar. Revisa el plan para poder encontrarlo mañana.",[
   ["Cartas", "En la caja roja", "En la caja azul"],
   ["Dados", "En la bolsa verde", "Sobre la mesa"],
   ["Tablero", "En la estantería", "En el suelo"],
   ["Fichas", "Dentro de la caja del juego", "En una caja de lápices"],
   ["Caja", "Cerrar al terminar", "Dejar abierta la caja"],
  ]],
  ["Enviar una invitación","La clase quiere invitar a otra clase a ver su mural. Han preparado un mensaje y van a revisarlo antes de enviarlo.",[
   ["Destinatario", "La clase de al lado", "El grupo de deportes"],
   ["Día", "El jueves", "El martes"],
   ["Lugar", "El aula de arte", "El patio"],
   ["Actividad", "Ver el mural", "Jugar con una pelota"],
   ["Hora", "Después del recreo", "Antes del recreo"],
  ]],
  ["Preparar un préstamo","Una compañera prestará un cuento hasta el lunes. Revisa que el plan respete lo que ha acordado con su amigo.",[
   ["Libro", "El cuento de animales", "El libro de canciones"],
   ["Entrega", "Hoy en clase", "Mañana en casa"],
   ["Devolución", "El lunes", "El viernes"],
   ["Cuidado", "Guardar en una carpeta", "Dejar en el patio"],
   ["Aviso", "Avisar si el libro se estropea", "No avisar si se estropea"],
  ]],
 ],
 primary:[
  ["El ensayo del grupo","El grupo ha acordado las condiciones del ensayo. Una persona propone este plan. Comprueba todas las condiciones antes de darlo por válido.",[
   ["Inicio", "A las 16:00", "A las 16:30"],
   ["Duración", "Treinta minutos", "Una hora"],
   ["Lugar", "El aula de música", "La biblioteca"],
   ["Material", "Traer la letra impresa", "Traer solo una foto"],
   ["Cierre", "Guardar los instrumentos", "Dejarlos sobre las sillas"],
  ]],
  ["Un mural para la biblioteca","La biblioteca ha pedido un mural. El equipo debe respetar estas condiciones para poder colocarlo el día acordado.",[
   ["Tema", "Animales del entorno", "Personajes de una película"],
   ["Tamaño", "Una cartulina", "Tres cartulinas unidas"],
   ["Entrega", "El miércoles", "El viernes"],
   ["Firma", "Nombres del equipo", "Sin nombres"],
   ["Fijación", "Cinta que se pueda retirar", "Pegamento permanente"],
  ]],
  ["Revisar la salida al museo","El grupo prepara una salida. Ya están confirmados los requisitos; ahora hay que comprobar el plan escrito.",[
   ["Llegada", "A las 09:30", "A las 10:00"],
   ["Grupo", "Diez personas", "Doce personas"],
   ["Documento", "Llevar la confirmación", "Llevar solo el anuncio"],
   ["Comida", "Comer fuera de las salas", "Comer dentro de una sala"],
   ["Regreso", "A las 13:00", "A las 14:00"],
  ]],
  ["Reunir material para ciencias","El equipo prepara una observación. Cada condición de la tabla es necesaria para hacer la actividad tal como se ha acordado.",[
   ["Muestras", "Tres hojas distintas", "Tres hojas iguales"],
   ["Registro", "Anotar la fecha", "Omitir la fecha"],
   ["Lupa", "Una por pareja", "Ninguna lupa"],
   ["Cuidado", "No arrancar plantas", "Arrancar una planta"],
   ["Limpieza", "Recoger al terminar", "Dejar las muestras en el suelo"],
  ]],
  ["Una entrevista para la clase","El grupo quiere entrevistar a una vecina. Antes de la visita revisa el plan con los acuerdos que ella ha aceptado.",[
   ["Visita", "El martes", "El miércoles"],
   ["Grabación", "Pedir permiso antes", "Grabar sin preguntar"],
   ["Preguntas", "Enviar tres preguntas antes", "Improvisar todas las preguntas"],
   ["Duración", "Quince minutos", "Cuarenta minutos"],
   ["Copia", "Ofrecer una copia del audio", "No guardar ninguna copia"],
  ]],
  ["Organizar un intercambio","La clase intercambiará libros durante el recreo. Revisa qué partes del plan no respetan las condiciones anunciadas.",[
   ["Cantidad", "Hasta dos libros por persona", "Cinco libros por persona"],
   ["Estado", "Libros con todas sus páginas", "Libros con páginas arrancadas"],
   ["Lugar", "La mesa del patio", "La puerta de la calle"],
   ["Horario", "Durante el recreo", "Durante la clase de matemáticas"],
   ["Cierre", "Devolver lo que no se intercambie", "Dejarlo en la mesa"],
  ]],
 ],
 middle:[
  ["Publicar el boletín","El equipo prepara el boletín del centro. Ha recibido requisitos concretos y dispone de un borrador de publicación; revisa las diferencias antes de autorizarlo.",[
   ["Fecha", "Publicar el viernes", "Publicar el miércoles"],
   ["Autoría", "Incluir el nombre de cada autor", "Eliminar la autoría"],
   ["Imágenes", "Usar imágenes con permiso", "Usar imágenes sin permiso"],
   ["Fuente", "Enlazar el informe citado", "Citar solo un comentario"],
   ["Revisión", "Revisar antes de publicar", "Revisar después de publicar"],
   ["Acceso", "Permitir lectura sin registro", "Exigir una cuenta privada"],
  ]],
  ["La entrega del proyecto","La profesora ha concretado la entrega del proyecto. El equipo ha redactado un plan y quiere asegurarse de que cumple cada requisito.",[
   ["Formato", "Un archivo PDF", "Una presentación editable"],
   ["Extensión", "Hasta cinco páginas", "Ocho páginas"],
   ["Identificación", "Incluir los nombres", "No incluir nombres"],
   ["Destino", "La carpeta de la clase", "Una carpeta personal privada"],
   ["Plazo", "Antes del jueves", "El viernes"],
   ["Confirmación", "Comprobar que se abre", "Suponer que se abre"],
  ]],
  ["Reservar un espacio","El centro ha ofrecido un espacio para una reunión. Solo estará disponible si se respetan las condiciones comunicadas.",[
   ["Horario", "De 17:00 a 18:00", "De 18:00 a 19:00"],
   ["Asistencia", "Hasta doce personas", "Dieciséis personas"],
   ["Acceso", "Entrada por recepción", "Entrada por una puerta cerrada"],
   ["Mobiliario", "Dejar las mesas como estaban", "Cambiar las mesas de sala"],
   ["Sonido", "Sin altavoces", "Usar altavoces"],
   ["Responsable", "Nombrar una persona de contacto", "No indicar contacto"],
  ]],
  ["Compartir una encuesta","El grupo quiere compartir los resultados de una encuesta. La tutoría ha fijado estas condiciones para proteger la información y explicar bien los datos.",[
   ["Identidad", "Publicar resultados sin nombres", "Publicar los nombres"],
   ["Personas participantes", "Indicar quiénes respondieron", "Afirmar que respondió todo el centro"],
   ["Resultado", "Separar datos y opiniones", "Presentar opiniones como datos"],
   ["Permiso", "Revisar antes de difundir", "Difundir sin revisión"],
   ["Archivo", "Compartir solo el resumen", "Compartir respuestas personales"],
   ["Fecha", "Indicar cuándo se recogió", "Omitir la fecha"],
  ]],
  ["Preparar una demostración","El equipo organiza una demostración de ciencias para otro curso. Las condiciones se han confirmado con la persona responsable del aula.",[
   ["Material", "Usar agua a temperatura ambiente", "Usar agua hirviendo"],
   ["Prueba", "Ensayar antes de la visita", "Probar por primera vez con público"],
   ["Participación", "Una persona por turno", "Todo el grupo a la vez"],
   ["Registro", "Anotar cada resultado", "Anotar solo el último"],
   ["Espacio", "Mantener el paso libre", "Dejar cajas en el paso"],
   ["Cierre", "Recoger y secar la mesa", "Dejar el agua en la mesa"],
  ]],
  ["Una publicación del club","El club prepara una publicación para anunciar un encuentro. Revisa si el plan respeta todos los acuerdos antes de que el equipo lo programe.",[
   ["Día", "El sábado 24", "El domingo 25"],
   ["Horario", "De 10:00 a 12:00", "De 12:00 a 14:00"],
   ["Lugar", "Patio cubierto", "Patio sin cubierta"],
   ["Inscripción", "Por el formulario del club", "Por una cuenta personal"],
   ["Contacto", "Correo del club", "Teléfono de una compañera"],
   ["Imagen", "Cartel aprobado por el equipo", "Foto sin permiso"],
  ]],
 ],
 teen:[
  ["Autorizar una publicación","Un equipo ha preparado una publicación con datos de una consulta. Antes de autorizarla, contrasta el plan con los acuerdos de difusión. Todos los requisitos de la tabla son obligatorios.",[
   ["Alcance", "Describir solo a quienes respondieron", "Generalizar a toda la población"],
   ["Identidad", "Eliminar los nombres personales", "Publicar nombres y respuestas"],
   ["Fuente", "Enlazar el informe completo", "Omitir el informe"],
   ["Gráfico", "Mantener la escala original", "Recortar la escala sin indicarlo"],
   ["Revisión", "Aprobar el borrador antes", "Publicar antes de la aprobación"],
   ["Fecha", "Indicar el periodo de consulta", "Omitir el periodo"],
  ]],
  ["Entregar una propuesta","El grupo ha recibido las condiciones de una convocatoria. La propuesta está preparada, pero aún hay que comprobar el plan de entrega antes de enviarla.",[
   ["Plazo", "Enviar antes del lunes", "Enviar el martes"],
   ["Formato", "Un PDF de hasta seis páginas", "Un archivo editable de diez páginas"],
   ["Anexos", "Adjuntar la autorización", "Enviar sin autorización"],
   ["Destino", "Usar el portal de la convocatoria", "Mandar a una cuenta personal"],
   ["Registro", "Guardar el comprobante", "Cerrar sin guardar comprobante"],
   ["Versión", "Enviar la versión aprobada", "Enviar un borrador anterior"],
  ]],
  ["Organizar una sesión de prueba","El equipo va a probar un recurso con personas voluntarias. La coordinación ha fijado estas condiciones para que la prueba pueda realizarse.",[
   ["Participación", "Confirmar que es voluntaria", "Presentarla como obligatoria"],
   ["Datos", "Usar alias en el registro", "Usar nombres completos"],
   ["Instrucciones", "Dar la misma consigna", "Cambiar la consigna entre participantes"],
   ["Incidencias", "Anotar las interrupciones", "Ignorar las interrupciones"],
   ["Duración", "Respetar veinte minutos", "Continuar sin límite"],
   ["Cierre", "Explicar cómo retirar los datos", "No ofrecer información de cierre"],
  ]],
  ["Publicar una entrevista","La persona entrevistada ha autorizado una versión concreta. El equipo revisa el plan para asegurarse de respetar los acuerdos antes de publicar el audio.",[
   ["Versión", "Publicar la versión autorizada", "Publicar el audio sin revisar"],
   ["Nombre", "Usar el alias acordado", "Publicar el nombre completo"],
   ["Cortes", "Mantener el sentido de las frases", "Unir frases que cambian el sentido"],
   ["Canal", "Publicar en el canal del centro", "Publicar en una cuenta personal"],
   ["Acceso", "Compartir el enlace aprobado", "Compartir archivos privados"],
   ["Revisión", "Escuchar el archivo final", "Revisar solo el nombre del archivo"],
  ]],
  ["Preparar una solicitud de material","La organización ofrece material para un proyecto si se cumplen las condiciones de préstamo. Antes de aprobar el plan, comprueba cada compromiso de la tabla.",[
   ["Recogida", "El jueves por la mañana", "El viernes por la tarde"],
   ["Devolución", "El lunes siguiente", "Dos semanas después"],
   ["Uso", "Solo en el proyecto autorizado", "Prestarlo a otro equipo"],
   ["Responsable", "Identificar a quien lo recoge", "Recoger sin identificar responsable"],
   ["Estado", "Comprobar el inventario al recoger", "Comprobarlo solo al devolver"],
   ["Incidencias", "Avisar al detectar un daño", "Esperar al final para avisar"],
  ]],
  ["Compartir un informe de resultados","El equipo debe entregar un informe breve para decidir si continúa una actividad. La coordinación quiere que se distingan claramente las observaciones de las conclusiones.",[
   ["Personas participantes", "Indicar cuántas personas participaron", "Omitir el número de participantes"],
   ["Resultado", "Incluir resultados favorables y desfavorables", "Mostrar solo resultados favorables"],
   ["Qué falta por comprobar", "Explicar lo que aún no se sabe", "Presentar todo como demostrado"],
   ["Fuentes", "Separar encuesta y registro", "Mezclar las dos fuentes sin indicar cuál"],
   ["Propuesta", "Proponer una comprobación posterior", "Dar por cerrada la evaluación"],
   ["Versión", "Enviar el informe revisado", "Enviar notas sin revisar"],
  ]],
 ],
};
function validateReview(item){
 if(item.type!=='multiSelect'||item.responseType!=='multiple'||item.domain!=='executive')throw new Error('Revisión incompatible.');
 const block=item.stimulus?.[item.reviewEvidence?.block];
 if(block?.type!=='table'||block.header!==true||block.rows.length<4||block.rows.some(row=>row.length!==3||row.some(x=>typeof x!=='string'||!x.trim())))throw new Error('Faltan los datos de revisión.');
 const rows=block.rows.slice(1),labels=rows.map(row=>row[0]),expected=rows.filter(row=>row[1]!==row[2]).map(row=>row[0]);
 if(new Set(labels).size!==labels.length||!expected.length||expected.length===rows.length||!Array.isArray(item.opts)||item.opts.length!==labels.length||!labels.every(x=>item.opts.includes(x))||!Array.isArray(item.answers)||new Set(item.answers).size!==item.answers.length||item.answers.length!==expected.length||!expected.every(x=>item.answers.includes(x)))throw new Error('La respuesta no coincide con el plan y sus condiciones.');
 return expected;
}
function review(age,level){
 return (reviewCases[age]||[]).map(([title,source,checks],i)=>{
  const load=level===1?3:level===2?4:checks.length;
  const count=level===1?1:level===2?2:age==='junior'?2:3;
  const rows=checks.slice(0,load).map(([label,expected,alternative],j)=>[label,expected,(j-i%load+load)%load<count?alternative:expected]);
  const item=finish({type:'multiSelect',responseType:'multiple',requiresStimulus:true,q:'Compara lo pedido con el plan. Marca todas las filas donde el plan hace algo distinto de lo que se exige.',
   stimulus:[{...T(source),label:title},{type:'table',header:true,presentation:'reviewPlan',label:'Revisa cada fila antes de marcar',rows:[['Apartado','Condición obligatoria','Plan propuesto'],...rows]}],
   opts:rows.map(row=>row[0]),answers:rows.filter(row=>row[1]!==row[2]).map(row=>row[0]),reviewEvidence:{block:1},
   topic:'Funciones ejecutivas · revisar un plan',passageKey:'review-plan-'+age+'-'+i,
   why:rows.filter(row=>row[1]!==row[2]).map(row=>row[0]+': se pide «'+row[1]+'» y el plan propone «'+row[2]+'».').join(' ')},age,'executive',level,'review-plan-'+i,'executive_review_all');
  validateReview(item);return item;
 });
}
function executive(age,level){
 const rank=ages.indexOf(age),tasks=[];
 contexts[age].forEach(([source,q,a,wrong],i)=>{
  let text=source;
  // Higher levels include an explicit competing proposal plus an irrelevant detail.
  if(rank>0&&level>=2)text+=' Otra persona propone mantener el plan inicial porque ya estaba preparado.';
  if(rank>0&&level===3)text+=' El grupo tiene una carpeta azul para guardar el material. Ese color no cambia las condiciones de la tarea.';
  tasks.push(finish(choice(q,[T(text)],a,wrong,{topic:'Funciones ejecutivas · supervisión',why:a+'. Comprueba la condición que el plan inicial no cumplía.'}),age,'executive',level,`review-${i}`,'executive_supervision'));
 });
 // Apply a rule to concrete records, rather than repeat the instruction.
 for(let v=0;v<12;v++){
  if(rank===0){
   const steps=level===1?['Abrir la caja','Sacar el lápiz']:level===2?['Abrir la caja','Sacar el lápiz','Dibujar']:['Coger el papel','Sacar el lápiz','Dibujar'];
   tasks.push(finish({type:'order',responseType:'order',requiresStimulus:true,q:'Ordena los pasos para dibujar.',stimulus:[T(level===3?'El lápiz está bajo el papel. Para coger el lápiz, saca primero el papel. Quieres dibujar.':'El lápiz está en una caja cerrada. Quieres dibujar.')],tokens:shuffled(steps,v),answer:steps},age,'executive',level,`plan-${v}`,'executive_planning'));
   const step=level===3?2:1,first=1+v%(level===3?5:7),answer=String(first+step);
   tasks.push(finish(choice('¿Qué número falta?',[L([String(first),'?',String(first+step*2)])],answer,[String(first+step+1),String(first)],{topic:'Funciones ejecutivas · descubrir el orden',quantityEvidence:{op:'between',block:0,step},why:'Los números avanzan de '+step+' en '+step+'.'}),age,'executive',level,`reason-${v}`,'executive_reasoning'));

  }else{
   const max=level===1?8:level===2?6:4,records=rotate([['A','Listo','Sí',String(max),'Confirmado'],['B','Listo','No','2','Confirmado'],['C','Pendiente','Sí','2','Confirmado'],['D','Listo','Sí',String(max+1),'Pendiente']].map(r=>level===1&&r[0]==='D'?[r[0],r[1],'No',r[3],r[4]]:r),v%4).map(row=>[rotate(['A','B','C','D'],Math.floor(v/4))[['A','B','C','D'].indexOf(row[0])],...row.slice(1)]),correct=records.find(row=>row[1]==='Listo'&&row[2]==='Sí'&&(level===1||Number(row[3])<=max)&&(level!==3||row[4]==='Confirmado'))[0];
   tasks.push(finish(choice('¿Qué paquete se puede enviar?',[
    T(`El grupo prepara material para otra clase. Solo se puede enviar un paquete que esté listo y tenga permiso. ${level>=2?`El transporte admite hasta ${max} piezas por paquete.`:''} ${level===3?'Además, el destino debe estar confirmado; un destino pendiente no permite el envío.':''} Comprueba el estado de cada paquete antes de elegir. Un paquete pequeño sin permiso tampoco se puede enviar.`),
    {type:'table',header:true,rows:[['Paquete','Estado','Permiso',...(level>=2?['Piezas']:[]),...(level===3?['Destino']:[])],...records.map(r=>[...r.slice(0,3),...(level>=2?[r[3]]:[]),...(level===3?[r[4]]:[])])]}],correct,['B','C','D'],{topic:'Funciones ejecutivas · aplicar condiciones',why:`${correct} está listo y tiene permiso.${level>=2?` No supera ${max} piezas.`:''}${level===3?' El destino está confirmado.':''}`}),age,'executive',level,`criteria-${v}`,'executive_criteria'));
   const selected=records[Math.floor(v/4)%records.length],violations=[];
   if(selected[1]!=='Listo')violations.push('no está listo');
   if(selected[2]!=='Sí')violations.push('no tiene permiso');
   if(level>=2&&Number(selected[3])>max)violations.push('supera el límite de piezas');
   if(level===3&&selected[4]!=='Confirmado')violations.push('el destino no está confirmado');
   const verdict=violations.length?'No: '+violations.join(' y ')+'.':'Sí: cumple todas las condiciones.';
   const decision=tasks[tasks.length-1];
   tasks.push(finish(choice(`El grupo eligió el paquete ${selected[0]}. ¿Es correcta la decisión?`,decision.stimulus,verdict,
    ['Sí: cumple todas las condiciones.','No: no tiene permiso.','No: no está listo.','No: supera el límite de piezas.'].filter(x=>x!==verdict).slice(0,3),
    {topic:'Funciones ejecutivas · comprobar una decisión',why:verdict}),age,'executive',level,`verify-${v}`,'executive_verification'));
   const total=(v+3)*6,used=level===1?total/2:level===2?total*2/3:total*5/6,left=total-used;
   tasks.push(finish(choice('¿Qué conclusión está justificada?',[
    T(`Para un proyecto se prepararon ${total} tarjetas. Se utilizaron ${used}. El grupo quiere saber si las restantes alcanzan para otro equipo que necesita ${left+2}. No se pueden reutilizar las tarjetas ya usadas.`)],`Faltan 2 tarjetas para el nuevo equipo`,[`Sobran 2 tarjetas después de preparar el nuevo equipo`,`Alcanzan exactamente las tarjetas restantes`],{topic:'Funciones ejecutivas · razonamiento',why:`Quedan ${left} tarjetas y hacen falta ${left+2}. La diferencia es 2.`}),age,'executive',level,`reason-${v}`,'executive_reasoning'));
   const allSteps=['Confirmar los requisitos','Preparar el material','Crear la versión final','Revisar la versión final','Entregar el proyecto','Guardar el comprobante'],count=Math.min(6,rank+level+(rank===1?0:1)),steps=allSteps.slice(0,count);
   tasks.push(finish({type:'order',responseType:'order',requiresStimulus:true,q:'Ordena las acciones respetando qué necesita cada una.',stimulus:[T('El grupo organiza un proyecto y quiere evitar tener que repetir el trabajo. '+(count>=6?'El comprobante solo existe después de entregar el proyecto. ':'')+(count>=4?'No se revisa una versión final que todavía no se ha creado. ':'')+(count>=3?'Para crear la versión final hace falta tener preparado el material. ':'')+(count>=5?'La entrega requiere haber revisado la versión final. ':'')+'Antes de preparar el material hay que confirmar los requisitos. Solo debes ordenar las acciones disponibles.')],tokens:shuffled(steps,v),answer:steps,topic:'Funciones ejecutivas · planificación'},age,'executive',level,`plan-${v}`,'executive_planning'));
  }
 }
 return tasks.concat(review(age,level));
}
const cache=new Map(),generationGroups=new Map();let reasoningProvider=null,writingProvider=null;
function registerReasoning(provider){reasoningProvider=provider;generationGroups.clear();for(const key of cache.keys())if(key.includes(':executive:'))cache.delete(key);}

function registerWriting(provider){writingProvider=provider;cache.clear();generationGroups.clear();}
function supports(age,domain){return ages.includes(age)&&(['executive','applied','memory','speedReasoning'].includes(domain)||(['early','junior'].includes(age)?domain==='reading':['primary','middle','teen'].includes(age)&&['literacy','reading','middleReading'].includes(domain)));}
function pool(age,domain,level=1){
 if(!supports(age,domain))return [];
 const actual=domain==='applied'?'executive':domain,readingDomain=['reading','middleReading','literacy'].includes(actual),key=[age,actual,level].join(':');
 if(!cache.has(key)){
  const bank=readingDomain?reading(age,actual,level):actual==='memory'?memory(age,level):actual==='speedReasoning'?speed(age,level):executive(age,level);
  if(readingDomain&&writingProvider&&['junior','primary','middle'].includes(age))bank.push(...writingProvider(age,level).map(it=>({...it,domain:actual,originalDomain:it.domain,passageKey:'writing-legacy:'+age+':'+(it.juniorProfile?.context||it.schoolProfile?.context)})));
  if(actual==='executive'&&reasoningProvider&&age!=='early')bank.push(...reasoningProvider(age,level).map(it=>({...it,domain:'executive',topic:'Funciones ejecutivas · razonamiento',mechanic:'executive_reasoning_'+it.mechanic,contentKey:'merged-'+it.contentKey})));
  cache.set(key,bank);
 }
 return structuredClone(cache.get(key)).map(it=>domain==='applied'?{...it,domain,...(age==='early'?{ageProfile:{...it.ageProfile,mechanic:'chooseObject'}}:{})}:it);
}
function generate(age,domain,level=1,focus=null){
 const actual=domain==='applied'?'executive':domain,key=[age,actual,level].join(':');
 if(!cache.has(key))pool(age,actual,level);
 const groupKey=key+':'+(focus||'all');
 if(!generationGroups.has(groupKey)){
  const grouped=new Map();
  for(const item of cache.get(key)||[]){
   const written=item.type==='self'||item.responseType==='written'||item.type==='order';
   if(focus&&(focus==='writing'?!written:written))continue;
   if(!grouped.has(item.mechanic))grouped.set(item.mechanic,[]);
   grouped.get(item.mechanic).push(item);
  }
  generationGroups.set(groupKey,[...grouped.values()]);
 }
 const groups=generationGroups.get(groupKey),bank=groups[Math.floor(Math.random()*groups.length)]||[];
 const it=bank[Math.floor(Math.random()*bank.length)];
 return it?{...structuredClone(it),domain,...(age==='early'&&domain==='applied'?{ageProfile:{...it.ageProfile,mechanic:'chooseObject'}}:{})}:null;
}
function visible(domains,age){return domains.filter(d=>d!=='applied'&&!(age==='primary'&&d==='reading')&&!(age==='middle'&&d==='middleReading'));}
function migrate(progress={},age){
 if(progress._curriculumRevision===2)return progress;
 const legacy=structuredClone({scores:progress.scores||{},levels:progress.levels||{},history:progress.history||[]});
 const history=(progress.history||[]).map(row=>['applied','speedReasoning',...(age==='primary'?['reading']:age==='middle'?['middleReading']:[])].includes(row.subject)?{...row,originalSubject:row.originalSubject||row.subject,subject:['reading','middleReading'].includes(row.subject)?'literacy':'executive'}:row);
 return {...progress,_curriculumRevision:2,_curriculumLegacy:legacy,history,
  scores:{...progress.scores,executive:(progress.scores?.executive||0)+(progress.scores?.applied||0)+(progress.scores?.speedReasoning||0),applied:0,speedReasoning:0,...(['primary','middle'].includes(age)?{literacy:(progress.scores?.literacy||0)+(progress.scores?.[age==='primary'?'reading':'middleReading']||0)}:{})},
  levels:{...progress.levels,executive:1,speedReasoning:1},_levelCheckpoints:{...progress._levelCheckpoints,executive:{attempt:progress.totalAttempts||0},speedReasoning:{attempt:progress.totalAttempts||0}}};
}
function speedSummary(history=[]){const rows=history.filter(x=>x.subject==='speedReasoning'&&x.timingValid&&Number.isFinite(x.responseMs));const correct=rows.filter(x=>x.correct).map(x=>x.responseMs).sort((a,b)=>a-b);return {attempts:rows.length,accuracy:rows.length?Math.round(rows.filter(x=>x.correct).length*100/rows.length):null,medianMs:correct.length?correct.length%2?correct[(correct.length-1)/2]:(correct[correct.length/2-1]+correct[correct.length/2])/2:null};}
const api={memoryCategories,validateSelectiveRecall,validateReview,vocabulary,pool,generate,supports,visible,migrate,speedSummary,registerReasoning,registerWriting,spatialPositions};root.Curriculum=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

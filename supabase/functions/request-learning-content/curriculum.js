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
 const earlyMechanic=domain==='language'?'vocabulary':domain==='social'?'inference':domain==='reading'?(item.responseType==='order'?'sequencing':'literal'):domain==='speedReasoning'?'speedCompare':domain==='memory'?(item.memoryResponse==='spatial'?'rememberPlace':'rememberOrder'):'planning';
 return {...item,...(domain==='memory'?{lexicalSenses:{...item.lexicalSenses,banana:true}}:{}),...(item.speedTask?{speedRevision:4}:{}),id,contentKey:id,semanticKey:item.passageKey||memoryMaterialKey||id,...(memoryMaterialKey?{memoryMaterialKey}:{}),domain,level,mechanic,
  ...(age==='early'?{ageProfile:{id:'early',revision:1,context:'school',mechanic:earlyMechanic,family:`${domain}-${mechanic}`}}:{}),
  ...(age==='teen'?{teenReview:{version:3,context:mechanic}}:{}),
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
const schoolLexicalLevels={
 junior:[
  [['Vamos a comenzar el juego cuando llegue Ana.','comenzar','empezar','terminar'],['El cajón está lleno; no cabe otro juguete.','lleno','repleto','vacío'],['Este puzle es sencillo: lo he resuelto sin ayuda.','sencillo','fácil','difícil'],['Leo corre rápido y llega antes que yo.','rápido','deprisa','despacio'],['La toalla está seca porque ya no tiene agua.','seca','sin humedad','mojada'],['El patio está limpio: hemos recogido todos los papeles.','limpio','sin suciedad','sucio']],
  [['El cuento es breve: solo ocupa una página.','breve','corto','largo'],['Quiero conservar este dibujo y guardarlo en mi carpeta.','conservar','guardar','tirar'],['La figura de cristal es frágil; puede romperse si cae.','frágil','delicada','resistente'],['En este juego es obligatorio esperar el turno.','obligatorio','necesario','opcional'],['La señal es visible desde la puerta: se ve muy bien.','visible','fácil de ver','oculta'],['La clase está ordenada: cada cosa está en su sitio.','ordenada','organizada','desordenada']]
 ],
 primary:[
  [['La mochila es ligera; pesa poco.','ligera','de poco peso','pesada'],['Hay que repartir las cartas entre todos los jugadores.','repartir','distribuir','reunir'],['Para que quepamos todos, vamos a ampliar el círculo.','ampliar','agrandar','reducir'],['Podemos unir estas dos piezas para formar una más larga.','unir','juntar','separar'],['El sendero es estrecho: solo podemos pasar de uno en uno.','estrecho','poco ancho','ancho'],['El agua del vaso es transparente y deja ver el fondo.','transparente','clara','opaca']],
  [['El testigo dio un dato preciso: recordó la hora exacta.','preciso','exacto','impreciso'],['La biblioteca es un espacio común: podemos usarla todos.','común','compartido','privado'],['Esta fuente es fiable: sus datos se han comprobado.','fiable','de confianza','poco fiable'],['Decidieron aplazar la excursión hasta el viernes.','aplazar','dejar para después','adelantar'],['Se puede reutilizar el tarro para guardar los lápices.','reutilizar','volver a usar','desechar'],['El cambio es temporal: durará solo esta semana.','temporal','provisional','permanente']]
 ]
};
function vocabulary(age,domain,level){
 const tasks=[];
 const cases=schoolLexicalLevels[age]?.[level-1]||lexicalCases[age];
 cases.forEach(([source,word,meaning,opposite],i)=>{
  const other=cases[(i+1)%cases.length][2];
  tasks.push(finish(choice(level===3?`En esta frase, ¿qué significa «${word}»? Fíjate en la información que la acompaña.`:`¿Qué significa «${word}» en esta frase?`,[T(source)],meaning,[opposite,...(age==='early'?[]:[other])],{languageFocus:'vocabulary',...(age==='teen'?{teenReview:{version:2,context:'lexical'}}:{}),topic:'Lenguaje · significado de palabras',why:`Aquí, «${word}» significa «${meaning}».`}),age,domain,level,'lexical-context-'+i,'vocabulary_context'));
  tasks.push(finish(choice(`Elige la palabra o expresión contraria a «${word}».`,[T(source)],opposite,[meaning,...(age==='early'?[]:[other])],{languageFocus:'vocabulary',...(age==='teen'?{teenReview:{version:2,context:'lexical'}}:{}),topic:'Lenguaje · palabras contrarias',why:`En esta frase, lo contrario de «${word}» es «${opposite}».`}),age,domain,level,'lexical-contrast-'+i,'vocabulary_contrast'));
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
 {name:'Flores',items:['la rosa','el tulipán','el girasol','la margarita']},
 {name:'Música',items:['la guitarra','el tambor','la trompeta','el piano']},
 {name:'Deportes',items:['la raqueta','el patín','el silbato','el balón']},
 {name:'Océano',items:['el pulpo','la tortuga','el delfín','el pez']},
 {name:'Espacio',items:['el cohete','el planeta','el astronauta','el satélite']},
 {name:'Ropa',items:['la camiseta','el pantalón','la bufanda','el guante']},
 {name:'Tecnología',items:['la cámara','los auriculares','el teléfono móvil','la memoria USB']}
];
const selectiveVocabulary=new Map();
function validateSelectiveRecall(item){
 const block=item.stimulus?.[0],e=item.selectiveRecall;
 if(item.type!=='memoryReveal'||item.memoryResponse!=='multiple'||item.responseType!=='multiple'||block?.type!=='list'||!e||!memoryCategories.some(x=>x.name===e.category))throw new Error('Recuerdo selectivo incompatible.');
 const labels=memoryCategories.find(x=>x.name===e.category).items;
 const local=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
 let allowed=selectiveVocabulary.get(e.category);
 if(!allowed){allowed=new Set(labels.flatMap(label=>[label,...Object.keys(local.labels).map(country=>local.text(label,country,{banana:true,headphones:true}))]));selectiveVocabulary.set(e.category,allowed);}
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
 const rank=ages.indexOf(age),count=5+(level-1)*(rank<2?1:2),items=[];
 for(let v=0;v<120;v++){
  const materials=[...new Set([...memoryCategories[v%memoryCategories.length].items,...memoryCategories[(v+3)%memoryCategories.length].items,...(rank===0?objects:rank===1?schoolObjects:functionalObjects).slice(v%6,v%6+4)])];
  const featured=memoryCategories[v%memoryCategories.length].items[Math.floor(v/memoryCategories.length)%4];
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
  items.push(finish({type:'memoryReveal',responseType:'choice',memoryResponse:dual?'spatialPair':'spatial',spatialAnswer:!dual&&v%2===0?'grid':'coordinates',requiresStimulus:true,
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
   const category=memoryCategories[v%memoryCategories.length],other=memoryCategories[(v+1)%memoryCategories.length],n=level;
   const targets=rotate(category.items,Math.floor(v/2)).slice(0,n),missing=category.items.find(x=>!targets.includes(x));
   const shown=shuffled([...targets,...rotate(other.items,v).slice(0,rank===1?2:level+1)],v+41);
   const answers=shown.filter(x=>targets.includes(x));
   items.push(finish({type:'memoryReveal',responseType:'multiple',memoryResponse:'multiple',requiresStimulus:true,
    q:'Mira todas las imágenes. Después recordarás solo una categoría.',memoryQuestion:`Categoría: ${category.name}. Selecciona todas las imágenes de esa categoría que estaban en el grupo.`,
    stimulus:[{type:'list',presentation:'cards',items:shown}],memoryContent:shown.map(detail=>({detail})),answers,
    opts:shuffled([...targets,missing,...other.items.slice(0,2)],v+17),selectiveRecall:{category:category.name,indices:shown.flatMap((x,i)=>targets.includes(x)?[i]:[])},
    revealMs:Math.max(6000,shown.length*1500),topic:'Memoria · recuerdo por categoría',why:'De la categoría '+category.name+' aparecieron: '+answers.join(', ')+'. No basta con pertenecer a la categoría: la imagen también tenía que estar en el grupo.'},age,'memory',level,`category-${v}`,'memory_category'));
  }
  if(v<36){
   const spots=['la mesa','el estante','la alfombra','la ventana','el banco','la silla','el armario','la puerta','el rincón'],sceneValues=rotate(values,v%values.length),scene=spots.slice(0,count).map((place,i)=>[place,sceneValues[i]]),ask=v%scene.length;
   if(rank===0)items.push(finish({type:'memoryReveal',responseType:'choice',requiresStimulus:true,q:'Observa la escena. Después desaparecerá.',memoryQuestion:`¿Qué imagen estaba en ${scene[ask][0]}?`,stimulus:[{type:'table',rows:scene,presentation:'memoryScene'}],memoryContent:sceneValues.map(detail=>({detail})),a:scene[ask][1],opts:rotate(sceneValues,ask).slice(0,rank===0?3:4),revealMs:count*1800,answerEvidence:{type:'tableCell',block:0,row:ask,column:1,subjectColumn:0},topic:'Memoria · escena del estudio',why:scene[ask][0]+': '+scene[ask][1]+'.'},age,'memory',level,`scene-${v}`,'memory_scene'));
   // Navigating a map has a different load from recalling isolated icons.
   // Limit visits separately; the icon sequence progression stays unchanged.
   const routeCount=(rank>=3?[3,4,6]:[3,4,5])[level-1];
   const places=['Panadería','Mercado','Cafetería','Parque','Biblioteca','Estación','Museo','Escuela','Polideportivo'],route=shuffled(places,v+79).slice(0,routeCount);
   items.push(finish({type:'memoryReveal',responseType:'order',memoryResponse:'order',requiresStimulus:true,q:`Mira el mapa. Recuerda el orden de las ${routeCount} visitas.`,memoryQuestion:level===3&&rank>1?'Reconstruye las visitas desde la última hasta la primera.':'Reconstruye las visitas desde la primera hasta la última.',stimulus:[{type:'list',items:route,positions:route.map(place=>places.indexOf(place)),presentation:'routeMap'}],memoryContent:route.map(detail=>({detail})),tokens:shuffled(route,v+71),answer:level===3&&rank>1?[...route].reverse():[...route],revealMs:Math.max(8000,routeCount*2500),recallEvidence:{kind:'sequence',block:0,reverse:level===3&&rank>1},topic:'Memoria · recorrido por el barrio',why:rank===0?'Recuerda el orden de las visitas.':(level===3&&rank>1?[...route].reverse():route).join(' → ')},age,'memory',level,`route-${v}`,'memory_route'));
  }
  // Associations keep memory broader than the two new recall modes.
  const people=['Ana','Leo','Sol','Dani','Mar','Hugo','Lola','Nora','Eva'].slice(0,count),pairs=people.map((n,i)=>[n,values[i]]),ask=v%count;
  items.push(finish({type:'memoryReveal',responseType:'choice',requiresStimulus:true,q:'Mira la imagen que acompaña a cada persona. Después la taparemos.',memoryQuestion:`¿Qué imagen acompañaba a ${people[ask]}?`,stimulus:[{...R(pairs),presentation:'associations'}],memoryContent:pairs.map(([person,detail])=>({person,detail})),a:values[ask],opts:rotate(values,ask).slice(0,rank===0?Math.min(3,count):4),revealMs:Math.max(6000,count*1700),answerEvidence:{type:'tableCell',block:0,row:ask,column:1,subjectColumn:0},topic:'Memoria · personas y objetos'},age,'memory',level,`association-${v}`,'memory_association'));
 }
 const photos=root.PhotoLibrary || (typeof require==='function'&&require('./photo-library'));
 if(photos?.supports(age,'memory'))items.push(...photos.pool(age,'memory',level));
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
   const categoryItems=Array.from({length:rank===0?level*2:level*2+rank},(_,i)=>animals[(v+i)%animals.length]);if(!sameCategory)categoryItems[(v+level)%categoryItems.length]=tools[Math.floor(v/2)%4];
   pool.push(finish(choice('¿Son animales todas las imágenes?',[{type:'list',items:categoryItems,presentation:'speedSearch'}],sameCategory?'Sí':'No',[sameCategory?'No':'Sí'],{speedTask:true,speedFamily:'category',speedEvidence:{kind:'category',block:0,category:'animals'},topic:'Velocidad · reconocer una categoría',why:sameCategory?'Todas las imágenes son animales.':'Hay un objeto que no es un animal.'}),age,'speedReasoning',level,`category-${v}`,'speed_category'));
  }
  if(rank>0){
   const codes=['K','M','R','T','V','Z','P','L'].slice(0,Math.min(8,rank+level+1)),key=rotate(codes,v%codes.length),target=key[(v+level)%key.length],a=String(key.indexOf(target)+1);
   pool.push(finish(choice(`¿Qué número corresponde a ${target}?`,[{type:'table',header:true,rows:[['Código','Número'],...key.map((c,i)=>[c,String(i+1)])]}],a,key.map((_,i)=>String(i+1)).filter(x=>x!==a).slice(0,3),{speedTask:true,speedFamily:'key',topic:'Velocidad · clave de códigos',speedEvidence:{kind:'key',target,block:0},why:`${target} corresponde a ${a}.`}),age,'speedReasoning',level,`key-${v}`,'speed_key'));
   const model=shuffled(['KR','KT','MR','MT','RK','RM','TK','TM'],v+level).slice(0,Math.min(4,level+(rank>=3?1:0))).join(''),wrong=model.slice(0,-1)+(model.endsWith('K')?'M':'K');
   pool.push(finish(choice('¿Qué opción es idéntica al modelo?',[T('Modelo: '+model)],model,[wrong,(model[0]==='K'?'M':'K')+model.slice(1),(model[0]==='K'?'M':'K')+wrong.slice(1)],{speedTask:true,speedFamily:'match',topic:'Velocidad · coincidencia exacta',speedEvidence:{kind:'model',block:0},why:'Compara todos los caracteres, también el último.'}),age,'speedReasoning',level,`match-${v}`,'speed_match'));
  }
 }
 return pool.concat(speedExpansion(age,level));
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
    {type:'table',header:true,rows:[['Paquete','Estado','Permiso',...(level>=2?['Piezas']:[]),...(level===3?['Destino']:[])],...records.map(r=>[...r.slice(0,3),...(level>=2?[r[3]]:[]),...(level===3?[r[4]]:[])])]}],correct,records.map(r=>r[0]),{topic:'Funciones ejecutivas · aplicar condiciones',why:`${correct} está listo y tiene permiso.${level>=2?` No supera ${max} piezas.`:''}${level===3?' El destino está confirmado.':''}`}),age,'executive',level,`criteria-${v}`,'executive_criteria'));
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
 return tasks.concat(review(age,level),executiveExpansion(age,level));
}
// These tasks use the established choice/order contracts. Source data, not
// display-only SVG coordinates, determine every answer and printable worksheet.
function speedExpansion(age,level){
 const rank=ages.indexOf(age),items=[],glyphs=['○','□','△','☆'];
 for(let v=0;v<48;v++){
  const length=rank===0?Math.min(6,3+level):6+level*4+rank,target=glyphs[v%4],amount=1+v%Math.min(5,length-1);
  const shown=shuffled([...Array(amount).fill(target),...Array.from({length:length-amount},(_,i)=>glyphs[(v+1+i%3)%4])],v+level*71);
  items.push(finish(choice(`¿Cuántas veces aparece ${target}?`,[{type:'list',items:shown,presentation:'speedSearch'}],String(amount),[String(amount+1),String(amount-1)],{speedTask:true,speedFamily:'search',speedEvidence:{kind:'targetCount',block:0,target},topic:'Velocidad · búsqueda visual',why:`${target} aparece ${amount} veces.`}),age,'speedReasoning',level,'search-'+v,'speed_search'));
  const rows=rank===0?level+1:level*2+rank+1,n=rank===0?1+level:2+level*2,alphabet=rank===0?['○','□','△','☆']:['B','8','D','0','O','Q','6','9'];
  const pairs=Array.from({length:rows},(_,i)=>{
   const a=Array.from({length:n},(_,j)=>alphabet[(v+i*3+j*5)%alphabet.length]).join(''),same=(i+v)%3!==0;
   const at=(v+i)%n,b=same?a:a.slice(0,at)+alphabet[(alphabet.indexOf(a[at])+1)%alphabet.length]+a.slice(at+1);
   return [a,b];
  }),matches=pairs.filter(([a,b])=>a===b).length;
  items.push(finish(choice('¿Cuántas parejas son exactamente iguales?',[{type:'table',rows:pairs,presentation:'pairScan'}],String(matches),[String(matches+1),String(Math.max(0,matches-1))],{speedTask:true,speedFamily:'pairs',speedEvidence:{kind:'pairCount',block:0},topic:'Velocidad · revisar parejas',why:`Hay ${matches} parejas iguales. Compara todos sus símbolos.`}),age,'speedReasoning',level,'pairs-'+v,'speed_pairs'));
  const flankN=rank===0?(level===1?3:5):3+level*2,center=v%2?'←':'→',opposite=center==='←'?'→':'←',flankers=Array.from({length:flankN},(_,i)=>i===Math.floor(flankN/2)?center:level===1&&v%3===0?center:((v+1)>>(i%6))%2===0?center:opposite);
  items.push(finish(choice(level===3?'Elige la dirección contraria a la flecha central.':'¿Hacia dónde apunta solo la flecha central?',[{type:'list',items:flankers,presentation:'flanker'}],(level===3?opposite:center)==='←'?'Izquierda':'Derecha',[(level===3?opposite:center)==='←'?'Derecha':'Izquierda'],{speedTask:true,speedFamily:'flanker',speedEvidence:{kind:'central',block:0,reverse:level===3},topic:'Velocidad · ignorar distractores',why:'Cuenta desde ambos extremos para localizar la flecha central.'}),age,'speedReasoning',level,'flanker-'+v,'speed_flanker'));
  if(rank>0){
   const key=rotate(['K','M','R','T','V','Z'],v),numbers=key.map((_,i)=>String(1+(i+v)%9)),code=shuffled(key,v+level).slice(0,level+1),answer=code.map(x=>numbers[key.indexOf(x)]).join(' · '),wrong=[...code].reverse().map(x=>numbers[key.indexOf(x)]).join(' · ');
   items.push(finish(choice('Traduce todos los códigos en el orden mostrado.',[{type:'table',header:true,rows:[['Código','Número'],...key.map((x,i)=>[x,numbers[i]])]},T('Secuencia: '+code.join(' · '))],answer,[wrong,code.map((x,i)=>i===0?'0':numbers[key.indexOf(x)]).join(' · ')],{speedTask:true,speedFamily:'translation',speedEvidence:{kind:'translation',block:0,codeBlock:1,code},topic:'Velocidad · traducción de claves',why:'Busca cada código en la clave y conserva el orden.'}),age,'speedReasoning',level,'translate-'+v,'speed_translation'));
  }
 }
 return items;
}
function validateSpeed(item){
 const e=item.speedEvidence;if(!e)return;
 const b=item.stimulus?.[e.block];let answer;
 if(e.kind==='category'){if(b?.type!=='list')throw new Error('Falta el grupo de imágenes.');answer=b.items.every(x=>['gato','perro','conejo','pájaro'].includes(x))?'Sí':'No';}
 else if(e.kind==='targetCount')answer=String(b?.items?.filter(x=>x===e.target).length);
 else if(e.kind==='pairCount')answer=String(b?.rows?.filter(r=>r.length===2&&r[0]===r[1]).length);
 else if(e.kind==='central'){
  if(b?.type!=='list'||b.items.length<3||b.items.length%2!==1||!b.items.every(x=>x==='←'||x==='→'))throw new Error('Falta una flecha central única.');
  const left=b.items[Math.floor(b.items.length/2)]==='←';answer=(e.reverse?!left:left)?'Izquierda':'Derecha';
 }
 else if(e.kind==='translation'){
  if(item.stimulus?.[e.codeBlock]?.text!=='Secuencia: '+e.code.join(' · '))throw new Error('Falta la secuencia de códigos.');
  answer=e.code.map(x=>{const rows=b?.rows?.filter(r=>r[0]===x);if(rows?.length!==1)throw new Error('La clave no es única.');return rows[0][1];}).join(' · ');
 }else return;
 if(!b||answer!==item.a)throw new Error('La respuesta de velocidad no corresponde al estímulo.');
}
const projectThemes={
 early:[['Dibujo','Elegir el papel','Dibujar','Guardar el dibujo'],['Construcción','Preparar las piezas','Montar la torre','Guardar las piezas'],['Merienda','Lavar la fruta','Comer la fruta','Recoger la mesa'],['Jardín','Llenar la regadera','Regar la planta','Guardar la regadera']],
 junior:[['Un cómic de aventuras Pokémon','Elegir los personajes','Dibujar las viñetas','Añadir los diálogos','Revisar el cómic','Compartir el cómic'],['Un juego de pistas','Elegir el recorrido','Escribir las pistas','Probar el recorrido','Corregir las pistas','Preparar el juego'],['Una canción','Elegir la letra','Practicar por partes','Ensayar la canción','Revisar el sonido','Cantar ante el grupo'],['Un refugio para insectos','Elegir materiales seguros','Preparar las piezas','Montar el refugio','Comprobar el montaje','Colocarlo en el jardín']],
 primary:[['Un torneo de juegos de cartas','Acordar las reglas','Preparar las partidas','Probar el sistema de puntos','Corregir las reglas','Abrir el torneo'],['Un vídeo de ciencia','Elegir la pregunta','Preparar la prueba','Grabar la prueba','Revisar la explicación','Mostrar el vídeo'],['Un cómic colectivo','Acordar el argumento','Dibujar el boceto','Añadir los diálogos','Revisar la continuidad','Publicar el cómic'],['Un club de lectura','Elegir el libro','Preparar preguntas','Probar la actividad','Ajustar las preguntas','Abrir el encuentro']],
 middle:[['Una aventura cooperativa en Minecraft','Definir la misión','Diseñar el nivel','Programar las pruebas','Corregir los fallos','Compartir la versión'],['Un pódcast sobre K-pop','Elegir el tema','Preparar el guion','Grabar el episodio','Revisar sonido y permisos','Publicar el episodio'],['Una ruta en bicicleta','Elegir el destino','Consultar la ruta','Comprobar el equipo','Revisar el estado de la ruta','Iniciar la salida'],['Un proyecto de robótica','Definir la función','Diseñar el prototipo','Montar el circuito','Probar el prototipo','Presentar el robot']],
 teen:[['Un festival de cortos de anime','Acordar las bases','Seleccionar las obras','Revisar los permisos','Preparar la proyección','Abrir el festival'],['Una aplicación de estudio','Definir las funciones','Diseñar las pantallas','Programar el prototipo','Probar la accesibilidad','Publicar la prueba'],['Un encuentro deportivo','Acordar las normas','Preparar los equipos','Confirmar las instalaciones','Revisar el material','Iniciar el encuentro'],['Una exposición de fotografía','Elegir el tema','Seleccionar las imágenes','Revisar los permisos','Preparar el montaje','Abrir la exposición']]
};
function executiveExpansion(age,level){
 const rank=ages.indexOf(age),items=[];
 projectThemes[age].forEach(([title,...plan],i)=>{
  const count=rank===0?Math.min(3,level+1):Math.min(5,level+2),steps=plan.slice(0,count);
  const source=level===1?steps.map((step,j)=>`${j===0?'Primero':j===steps.length-1?'Por último':'Después'}, hay que ${step[0].toLowerCase()+step.slice(1)}.`).join(' '):shuffled(steps.slice(1).map((step,j)=>`Para ${step[0].toLowerCase()+step.slice(1)}, antes tenéis que ${steps[j][0].toLowerCase()+steps[j].slice(1)}.`),i+level).join(' ');
  items.push(finish({type:'order',responseType:'order',requiresStimulus:true,q:age==='early'?'Ordena los pasos para completar la actividad.':`Vais a preparar ${title[0].toLowerCase()+title.slice(1)}. Ordena los pasos para llevarlo a cabo.`,stimulus:[T(age==='early'?source:'Este es el plan que habéis acordado: '+source)],tokens:shuffled(steps,i+level),answer:[...steps],topic:'Funciones ejecutivas · '+title},age,'executive',level,'interest-order-'+i,'executive_dependencies'));
  if(rank===0)return;
  for(let v=0;v<16;v++){
   const start=15+v,budget=(level===1?12:level===2?18:24)+v*2,units=level+1+v%3;
   const a=2+v%4,b=3+v%3,correct=rotate(['A','B','C'],v)[level-1];
   const labels=rotate(['A','B','C'],v);
   const options=[[labels[0],String(budget),String(units),level===1?'Sí':'No'],[labels[1],String(budget-2),String(level===2?units:units-1),'Sí'],[labels[2],String(level===3?budget-1:budget+1),String(units+1),'Sí']];
   items.push(finish(choice('¿Qué opción cumple todas las condiciones?',[
    T(`El grupo prepara ${title[0].toLowerCase()+title.slice(1)} y necesita al menos ${units} ${({junior:['rotuladores','sobres','micrófonos','tablas de madera'],primary:['juegos de cartas','vasos de ensayo','cartulinas','libros'],middle:['mandos','micrófonos','cascos','sensores'],teen:['cables','tabletas','balones','marcos']})[age][i]}. Tiene ${budget} puntos de un programa de premios para canjearlos por ese material. Cada fila muestra un paquete: los puntos que cuesta en total y cuántas piezas incluye. Elige un paquete que alcance la cantidad necesaria sin gastar más puntos de los que tiene el grupo.${level>=2?' Además, debe estar disponible hoy.':''}`),{type:'table',header:true,rows:[['Paquete','Puntos que cuesta','Piezas incluidas',...(level>=2?['Disponible hoy']:[])],...options.map(row=>level===1?row.slice(0,3):row)]}],correct,['A','B','C'].filter(x=>x!==correct),{topic:'Funciones ejecutivas · elegir recursos',why:`La opción ${correct} alcanza la cantidad necesaria sin superar los puntos${level>=2?' y está disponible hoy':''}.`,planEvidence:{kind:'resources',block:1,budget,units,availability:level>=2}}),age,'executive',level,`resources-${i}-${v}`,'executive_resources'));
   const lengths=Array.from({length:level+1},(_,j)=>4+(v+j*3)%8),available=lengths.reduce((a,b)=>a+b,0)+(v%3-1)*3,total=lengths.reduce((a,b)=>a+b,0),missing=Math.max(0,total-available),answer=missing?`Faltan ${missing} minutos`:`Quedan ${available-total} minutos`;
   items.push(finish(choice('¿Cabe el plan completo en el tiempo disponible?',[
    T(`Vais a preparar ${title[0].toLowerCase()+title.slice(1)} y tenéis ${available} minutos para hacerlo. Completad las tareas de la tabla una después de otra, sin pausas.`),{type:'table',header:true,rows:[['Tarea','Minutos'],...lengths.map((n,j)=>[plan[j],String(n)])]}],answer,[missing?`Quedan ${missing} minutos`:`Faltan ${available-total+1} minutos`,`Faltan ${missing+7} minutos`],{topic:'Funciones ejecutivas · comprobar un plan',why:`El plan necesita ${total} minutos y hay ${available} minutos disponibles.`,planEvidence:{kind:'duration',block:1,available}}),age,'executive',level,`time-${i}-${v}`,'executive_time_budget'));
   const tasks=[['Preparar material','Necesaria','Antes del encuentro'],['Responder mensajes','Opcional','Sin plazo'],['Revisar instrucciones','Necesaria','Antes del encuentro']],newRule=level>=2;
   items.push(finish(choice(newRule?'El encuentro se ha aplazado. Ahora solo debes comunicar el cambio. ¿Qué haces primero?':'El encuentro empieza pronto. ¿Qué tarea puedes dejar para después?',[
    T(`Estáis preparando ${title[0].toLowerCase()+title.slice(1)}. ${newRule?'El nuevo objetivo es avisar a todas las personas del aplazamiento. Las tareas del encuentro quedan en espera.':'El objetivo es tener preparado el encuentro. Primero se completan las tareas necesarias.'}`),{type:'table',header:true,rows:[['Tarea','Necesidad','Plazo'],...tasks]}],newRule?'Avisar al grupo del nuevo horario':'Responder mensajes',newRule?['Preparar material sin avisar','Revisar las instrucciones antiguas']:['Preparar material','Revisar instrucciones'],{topic:'Funciones ejecutivas · cambiar prioridades',why:newRule?'El objetivo ha cambiado: antes de seguir preparando, el grupo necesita recibir el aviso.':'Los mensajes no son necesarios para empezar el encuentro.'}),age,'executive',level,`priority-${i}-${v}`,'executive_goal_change'));
  }
 });
 return items;
}
function validatePlan(item){
 const e=item.planEvidence;if(!e)return;const b=item.stimulus?.[e.block];if(b?.type!=='table')throw new Error('Falta el plan.');
 if(e.kind==='resources'){
  const matches=b.rows.slice(1).filter(r=>Number(r[1])<=e.budget&&Number(r[2])>=e.units&&(!e.availability||r[3]==='Sí'));
  if(matches.length!==1||matches[0][0]!==item.a)throw new Error('El plan no tiene una respuesta única.');
 }else if(e.kind==='duration'){
  const sum=b.rows.slice(1).reduce((n,r)=>n+Number(r[1]),0),a=sum>e.available?`Faltan ${sum-e.available} minutos`:`Quedan ${e.available-sum} minutos`;
  if(a!==item.a)throw new Error('La duración del plan no coincide.');
 }else throw new Error('Plan desconocido.');
}

const grammarSubjects=[
 ['La gata','Las gatas','duerme','duermen','tranquila','tranquilas','femenino'],
 ['El robot','Los robots','funciona','funcionan','nuevo','nuevos','masculino'],
 ['La jugadora','Las jugadoras','entrena','entrenan','rápida','rápidas','femenino'],
 ['El músico','Los músicos','practica','practican','preparado','preparados','masculino'],
 ['La exploradora','Las exploradoras','camina','caminan','atenta','atentas','femenino'],
 ['El equipo','Los equipos','participa','participan','completo','completos','masculino'],
 ['La artista','Las artistas','dibuja','dibujan','creativa','creativas','femenino'],
 ['El investigador','Los investigadores','observa','observan','curioso','curiosos','masculino'],
 ['La fotógrafa','Las fotógrafas','trabaja','trabajan','preparada','preparadas','femenino'],
 ['El grupo','Los grupos','ensaya','ensayan','listo','listos','masculino'],
 ['La alumna','Las alumnas','colabora','colaboran','organizada','organizadas','femenino'],
 ['El deportista','Los deportistas','descansa','descansan','cansado','cansados','masculino']
];
function advancedGrammar(age,domain,level){
 const rows={
  junior:[
   ['Mi hermana y yo ___ un cómic.','dibujamos','dibuja','dibujan'],
   ['Leo y yo ___ en el mismo equipo.','jugamos','juega','juego'],
   ['La mochila tiene una cremallera. ___ está rota.','La cremallera','La mochila y la cremallera','Leo'],
   ['Nos quedamos dentro ___ llovía.','porque','para','pero']
  ],
  primary:[
   ['Las piezas del robot ___ sobre la mesa.','están','está','estamos'],
   ['Primero comprobamos el circuito; ___ encendemos el robot.','después','antes','aunque'],
   ['Ayer Ana dibujó; mañana ___ el fondo.','pintará','pintó','había pintado'],
   ['El equipo tiene dos cámaras. Las presta a otra clase. ¿Qué presta?','Las dos cámaras','El equipo','Otra clase']
  ],
  middle:[
   ['El grupo de participantes ___ su prototipo.','presenta','presentan','presento'],
   ['Estas son las autoras ___ obras se exponen hoy.','cuyas','cuyo','que sus'],
   ['Buscamos una persona que ___ editar audio; todavía no hemos elegido a nadie.','sepa','sabe','sabía'],
   ['La aplicación permite grabar; ___, no guarda el audio si cierras sin confirmar.','sin embargo','por eso','es decir']
  ],
  teen:[
   ['En la prueba ___ varios fallos de conexión.','hubo','hubieron','habían'],
   ['El equipo entregará la versión cuando ___ la revisión pendiente.','termine','terminará','terminó'],
   ['Se revisaron los archivos ___ nombres aparecían duplicados.','cuyos','cuyas','que sus'],
   ['El aviso pide que todos ___ la nueva fecha antes del viernes.','confirmen','confirman','confirmarán']
  ]
 };
 const high=[
  ['Si hubiéramos guardado la copia, ___ el archivo.','habríamos recuperado','habremos recuperado','habíamos recuperado'],
  ['No está demostrado que el cambio ___ la mejora.','explique','explica','explicará'],
  ['Aunque el ensayo no fue perfecto, el equipo lo completó. ¿Qué relación expresa «aunque»?','Una dificultad que no impidió el resultado','La causa de que se completara','La finalidad del ensayo'],
  ['Solo una de las grabaciones ___ la autorización de todas las personas.','incluye','incluyen','incluyo'],
  ['El programa se cerró después de que el equipo ___ el resultado.','guardara','guardará','guardaría'],
  ['No publicaremos el vídeo a menos que todas las personas ___ permiso.','den','dan','darán']
 ];
 const cases=level===1?rows[age]:level===2?[...rows[age],...(['middle','teen'].includes(age)?high.slice(0,3):rows.primary)]:[...rows[age],...(['middle','teen'].includes(age)?high:rows.middle.slice(0,2))];
 return cases.map(([source,a,...wrong],i)=>({...finish(choice(source.includes('___')?(['junior','primary'].includes(age)?'Elige la palabra que falta. Lee después la frase completa.':'Completa la frase respetando su sentido y su estructura.'):['junior','primary'].includes(age)?'Lee la frase y elige la respuesta correcta.':'Elige la interpretación gramatical correcta.',[T(source)],a,wrong,{languageFocus:'grammar',topic:'Gramática · estructura y sentido',why:'Relee la frase completa con la opción elegida.'}),age,domain,level,'grammar-structure-'+i,'grammar_structure'),...(age==='teen'?{teenReview:{version:3,context:'grammar-structure'}}:{})}));
}

function grammarExpansion(age,domain,level){
 const rank=ages.indexOf(age);if(rank<1)return [];
 const tasks=[];
 grammarSubjects.forEach(([one,many,verb,verbs,adjective,adjectives,gender],i)=>{
  const subject=level===1?one:many,correct=level===1?verb:verbs,incorrect=level===1?verbs:verb;
  const intro=rank>=3?'Aunque el ensayo fue largo, ':'';
  const source=`${intro}${intro?subject[0].toLowerCase()+subject.slice(1):subject} ___ en el taller${level===3?' que prepararon ayer':''}.`;
  const add=(it,key,mechanic)=>tasks.push({...finish({...it,languageFocus:'grammar'},age,domain,level,`grammar-${key}-${i}`,mechanic),...(age==='teen'?{teenReview:{version:3,context:'grammar-'+i}}:{})});
  add(choice(rank<3?'Elige el verbo que completa la frase. Fíjate en cómo empieza.':'Completa con el verbo que concuerda con el sujeto.',[T(source)],correct,[incorrect,'trabajar'],{topic:rank<3?'Gramática · completar una frase':'Gramática · concordancia verbal',why:`Con «${subject}» usamos «${correct}».`}), 'agreement','grammar_agreement');
  const tokens=[subject,correct,...(level>=2?['con atención']:[]),...(level===3?['cada tarde']:[]),'en el taller'];
  add({type:'order',responseType:'order',requiresStimulus:true,q:'Ordena los fragmentos para formar una frase. Sigue el orden de las pistas.',stimulus:[T(`Comienzo: ${subject}. Acción: ${correct}. ${level>=2?'Cómo: con atención. ':''}${level===3?'Cuándo: cada tarde. ':''}Dónde: en el taller.`)],tokens:shuffled(tokens,i+37),answer:tokens,topic:'Gramática · construir una oración'},'order','grammar_order');
  const adj=level===1?adjective:adjectives,wrong=level===1?adjectives:adjective;
  const trait=[1,2,6,7,10].includes(i),copula=trait?(level===1?'es':'son'):(level===1?'está':'están');
  add(choice(rank<3?'Completa la frase. Fíjate en si habla de uno o de varios.':'Completa el adjetivo respetando el género y el número.',[T(`${subject} ${copula} ___.`)],adj,[wrong,gender==='femenino'?'cansados':'cansadas'],{topic:rank<3?'Gramática · completar una descripción':'Gramática · concordancia del adjetivo',why:`La frase completa es: «${subject} ${copula} ${adj}».`}), 'adjective','grammar_adjective');
  const tense=[['Ayer','terminamos','terminaremos','terminamos'],['Ahora','revisamos','revisaremos','revisamos'],['Mañana','prepararemos','preparamos','prepararemos']][i%3];
  add(choice(i%3===0?'Usa el verbo en pasado para «nosotros».':i%3===1?'Usa el verbo en presente para «nosotros».':'Usa el verbo en futuro simple para «nosotros».',[T(`${tense[0]} nosotros ___ ${['un cómic','una partida','un vídeo','una canción'][i%4]}.`)],tense[1],[tense[2],i%3===0?'terminan':i%3===1?'revisan':'prepararon'],{topic:'Gramática · tiempo y persona',why:`La frase habla de «nosotros» y empieza por «${tense[0]}».`}), 'tense','grammar_tense');
  const objects=[['el mapa','lo'],['la cámara','la'],['los dibujos','los'],['las tarjetas','las']][i%4];
  add(choice(`¿A qué se refiere «${objects[1]}» en la segunda oración?`,[T(`${one} guarda ${objects[0]}. Después ${objects[1]} lleva al taller.`)],objects[0],[one,'el taller'],{topic:'Gramática · referencias',why:`«${objects[1]}» se refiere a «${objects[0]}».`}), 'reference','grammar_reference');
  const repair=`${many} ${verbs} en el taller.`,bad=`${many} ${verb} en el taller.`;
  add(choice(rank<3?'Corrige el verbo para que encaje con el comienzo de la frase. No cambies el resto.':'Corrige solo la concordancia. Mantén el significado de la frase.',[T(bad)],repair,[`${one} no ${verb} en el taller.`,`${many} ${verb} en el parque.`],{topic:'Gramática · revisar una frase',why:`Hablamos de varios: «${many}». Por eso decimos «${verbs}».`}), 'repair','grammar_repair');
 });
 const links=[['El equipo practicó varias veces. ___, pudo completar la prueba.','Por eso','Sin embargo','Mientras'],['La ruta era corta. ___, tenía varias subidas difíciles.','Sin embargo','Por eso','Además de'],['Prepararon el material ___ empezara el taller.','antes de que','porque','aunque no'],['No salimos al patio ___ estaba lloviendo.','porque','aunque','para que'],['Revisa el audio ___ publicarlo.','antes de','a pesar de','en cambio'],['El equipo entrenó mucho ___ no ganó el torneo.','pero','por eso','porque']];
 links.forEach(([text,a,...wrong],i)=>tasks.push(finish(choice('Completa con el enlace que conserva la relación entre las ideas.',[T(text)],a,wrong,{languageFocus:'grammar',topic:'Gramática · enlazar ideas',why:'Lee las dos ideas y comprueba qué relación expresan juntas.'}),age,domain,level,'grammar-link-'+i,'grammar_connectors')));
 return tasks.concat(advancedGrammar(age,domain,level));
}
function mathExpansion(age,domain,level){
 const rank=ages.indexOf(age);if(rank<1)return [];
 const items=[],difficulty={age,level};
 for(let v=0;v<36;v++){
  const add=(family,source,q,a,wrong,evidence)=>items.push(finish(choice(q,source,String(a),[...new Set(wrong.map(String))].filter(x=>x!==String(a)).slice(0,3),{topic:'Matemáticas · '+family,mathEvidence:evidence,difficulty}),age,domain,level,'math-'+family+'-'+v,'math_'+family));
  if(rank<3){
   const scale=rank===1?[1,3,8][level-1]:[5,20,50][level-1],a=scale*(3+v%9),b=scale*(2+(v*7)%8),c=1+v%5;
   const total=a+b-(level===3?c:0);
   add('cálculo',[T(level===3?`Un equipo reúne ${a} piezas y otro ${b}. Después se descartan ${c} piezas rotas.`:`Un equipo reúne ${a} piezas y otro ${b}.`)],level===3?'¿Cuántas piezas útiles quedan?':'¿Cuántas piezas reúnen entre los dos?',total,[total+scale,total-scale,total+c+1],{op:level===3?'sumMinus':'sum',values:level===3?[a,b,c]:[a,b]});
   const each=rank===1?2+v%(2+level*2):4+v%(4+level*3),groups=2+(v*5)%(2+level*2),removed=level===3?1+v%each:0,product=each*groups-removed;
   add('grupos',[T(`Hay ${groups} cajas con ${each} tarjetas cada una.${removed?` Se pierden ${removed} tarjetas.`:''}`)],'¿Cuántas tarjetas quedan disponibles?',product,[product+groups,product+each,product-1],{op:'productMinus',values:[groups,each,removed]});
   const people=2+v%(level+2),share=rank===1?2+v%(level*3+1):5+v%(level*8+1),left=level===3?1:0;
   add('reparto',[T(`Repartes ${people*share+left} fichas entre ${people} personas. Cada una recibe la misma cantidad.${left?' Dejas aparte la ficha que sobra.':''}`)],'¿Cuántas fichas recibe cada persona?',share,[share+1,share-1,people*share+left],{op:'quotient',values:[people*share+left,people]});
   const first=3+v%7,step=level+1,series=[first,first+step,first+step*2],ans=first+step*3;
   add('series',[T(`La serie avanza de ${step} en ${step}: ${series.join(' · ')} · __`)],'¿Qué número continúa la misma regla?',ans,[ans+1,ans-1,ans+step],{op:'sum',values:[series[2],step]});
   const data=[a,b,a+c],maximum=Math.max(...data);
   add('datos',[{type:'table',header:true,rows:[['Equipo','Puntos'],['Azul',String(data[0])],['Verde',String(data[1])],['Naranja',String(data[2])]]}],level===1?'¿Cuál es la puntuación más alta?':level===2?'¿Cuántos puntos suman los tres equipos?':'¿Cuántos puntos separan la puntuación mayor de la menor?',level===1?maximum:level===2?data.reduce((a,b)=>a+b):maximum-Math.min(...data),[maximum+2,maximum+data.reduce((a,b)=>a+b),0,maximum+1],{op:level===1?'max':level===2?'sum':'range',values:data});
   const initial=a+b+c,spend=level===1?b:b+c,remaining=initial-spend;
   add('completar',[T(`___ + ${spend} = ${initial}`)],'¿Qué número hace verdadera la igualdad?',remaining,[remaining+1,remaining-1,initial+spend],{op:'difference',values:[initial,spend]});
  }else{
   const x=2+v%13,k=2+level+v%3,b=3+v%11,d=level===3?1+v%2:0,rhs=(k-d)*x+b;
   const equation=level===1?`${k}x + ${b} = ${rhs}`:level===2?`${k}(x + ${b}) = ${k*(x+b)}`:`${k}x + ${b} = ${d}x + ${rhs}`;
   add('ecuaciones',[T(equation)],'¿Qué valor de x hace verdadera la igualdad?',x,[x+1,x-1,b],{op:'equation',values:level===2?[k,k*b,k*(x+b),0]:[k,b,rhs,d]});
   const base=(8+v%20)*20,rate=(level===1?[10,20,50]:level===2?[15,25,30]:[12,18,35])[v%3],after=base*(100-rate)/100,fee=level===1?0:level===2?5:after*.1,answer=Number((after+fee).toFixed(2));
   add('porcentajes',[T(`Una entrada cuesta ${base} puntos y tiene un ${rate} % de descuento.${level===2?' Al precio rebajado se añaden 5 puntos de gestión.':level===3?' Después, el precio rebajado aumenta un 10 %.':''}`)],'¿Cuál es el coste final en puntos?',answer,[base-rate+fee,after+rate,answer+10,answer+1],{op:'discountFee',values:[base,rate,level]});
   const n=level+2,values=Array.from({length:n},(_,i)=>4+(v+i*3)%15),mean=Number((values.reduce((a,b)=>a+b)/n).toFixed(2));
   add('media',[{type:'table',header:true,rows:[['Partida','Puntos'],...values.map((x,i)=>[String(i+1),String(x)])]}],`¿Cuál es la media de puntos?${level>1?' Redondea a dos decimales si hace falta.':''}`,mean,[mean+1,Math.max(...values),values.reduce((a,b)=>a+b),mean+2],{op:'mean',values});
   const red=2+v%5,blue=3+v%4,all=red+blue,prob=level===1?`${red}/${all}`:level===2?`${red*(red-1)}/${all*(all-1)}`:`${red*blue}/${all*(all-1)}`;
   add('probabilidad',[T(`Una bolsa contiene ${red} fichas rojas y ${blue} azules. Todas tienen la misma probabilidad de salir.${level>1?' Sacas dos fichas sin devolver la primera a la bolsa.':''}`)],level===1?'¿Qué fracción expresa la probabilidad de sacar una ficha roja?':level===2?'¿Qué fracción expresa la probabilidad de sacar dos fichas rojas?':'¿Qué fracción expresa la probabilidad de sacar primero roja y después azul?',prob,[`${all}/${red}`,`1/${all+1}`,`0/${all}`],{op:'probability',values:[red,blue,level]});
   const distance=(3+v%9)*level,time=(2+v%7)*level,target=level===1?time*2:level===2?time*3/2:time*5/3,result=Number((distance/time*target).toFixed(2));
   add('proporción',[T(`Un robot recorre ${distance} metros en ${time} minutos a velocidad constante.`)],`¿Cuántos metros recorrerá en ${target} minutos?`,result,[result+2,result-1,result+3],{op:'ratio',values:[distance,time,target]});
   const sides=[3+v%10,4+(v*3)%9],area=sides[0]*sides[1],cut=2+v%3,adjust=level===1?0:level===2?-cut:cut+2;
   add('superficie',[T(`Un panel rectangular mide ${sides[0]} unidades de ancho y ${sides[1]} de alto.${level===2?` Se añade un rectángulo de 1 por ${cut} unidades.`:level===3?` Se recortan dos esquinas: una de 1 por ${cut} y otra de 1 por 2 unidades.`:''}`)],'¿Qué superficie útil queda, en unidades cuadradas?',area-adjust,[area+cut+1,2*(sides[0]+sides[1]),area+2,area+3],{op:'productMinus',values:[...sides,adjust]});
  }
 }
 return items;
}
function validateMath(item){
 const e=item.mathEvidence;if(!e)return;const v=e.values;let a;
 if(!Array.isArray(v)||!v.every(Number.isFinite))throw new Error('Datos matemáticos incompletos.');
 if(e.op==='ratio')a=Number((v[0]/v[1]*v[2]).toFixed(2));
 else if(e.op==='sum')a=v.reduce((a,b)=>a+b,0);
 else if(e.op==='sumMinus')a=v[0]+v[1]-v[2];
 else if(e.op==='difference')a=v[0]-v[1];
 else if(e.op==='productMinus')a=v[0]*v[1]-v[2];
 else if(e.op==='quotient')a=Math.floor(v[0]/v[1]);
 else if(e.op==='max')a=Math.max(...v);
 else if(e.op==='range')a=Math.max(...v)-Math.min(...v);
 else if(e.op==='mean')a=Number((v.reduce((a,b)=>a+b)/v.length).toFixed(2));
 else if(e.op==='equation')a=(v[2]-v[1])/(v[0]-v[3]);
 else if(e.op==='discountFee'){const base=v[0]*(100-v[1])/100;a=Number((base+(v[2]===1?0:v[2]===2?5:base*.1)).toFixed(2));}
 else if(e.op==='probability'){const [red,blue,l]=v,n=red+blue;a=l===1?`${red}/${n}`:l===2?`${red*(red-1)}/${n*(n-1)}`:`${red*blue}/${n*(n-1)}`;}
 else throw new Error('Operación desconocida.');
 if(String(a)!==item.a)throw new Error('La respuesta matemática no coincide con la operación.');
}
const academicCache=new Map(),academicGroups=new Map();
function academic(age,domain,level,focus){
 const math=['division','middleMath','teenMath'].includes(domain),grammar=['language','middleLanguage','teenLanguage'].includes(domain)&&focus==='grammar';
 if(age==='early'||!math&&!grammar)return [];
 const key=[age,domain,level,focus].join(':');if(!academicCache.has(key))academicCache.set(key,math?mathExpansion(age,domain,level):grammarExpansion(age,domain,level));
 return structuredClone(academicCache.get(key));
}
function generateAcademic(age,domain,level,focus){
 const key=[age,domain,level,focus].join(':');if(!academicCache.has(key))academic(age,domain,level,focus);
 const bank=academicCache.get(key);if(!bank?.length)return null;
 if(!academicGroups.has(key)){
  const groups=new Map();for(const item of bank){if(!groups.has(item.mechanic))groups.set(item.mechanic,[]);groups.get(item.mechanic).push(item);}
  academicGroups.set(key,[...groups.values()]);
 }
 const groups=academicGroups.get(key),family=groups[Math.floor(Math.random()*groups.length)];
 return structuredClone(family[Math.floor(Math.random()*family.length)]);
}

// Each row contains its own situation and three progressively harder questions.
// References are optional fictional contexts, never links or a requirement to own an account.
const socialStories={
 early:[
 ['Leo juega al balón. Ana espera a su lado.',['¿Qué puede hacer Leo?','Invitar a Ana a jugar','Esconder el balón','Marcharse sin hablar'],['Ana pide jugar. ¿Qué puede responder Leo?','Vamos a jugar juntos','No puedes hablar','El balón no existe'],['Los dos quieren empezar. ¿Qué pueden acordar?','Un turno para cada uno','Que nadie juegue','Quitar el balón al otro']],
 ['Mar dibuja un gato. Pau dice que parece un perro.',['¿Qué ha dibujado Mar?','Un gato','Un perro','Una casa'],['Mar se molesta. ¿Qué puede preguntar Pau?','¿Me cuentas cómo es tu gato?','¿Por qué dibujas tan mal?','¿Me das tu dibujo?'],['Pau no quería molestar. ¿Qué puede decir?','Lo siento. Quería entender tu dibujo','Tienes que reírte','Voy a romperlo']],
 ['Lola tiene cromos de Pokémon. Hugo quiere verlos.',['¿Qué quiere Hugo?','Ver los cromos','Romper los cromos','Tirar la carpeta'],['¿Qué puede preguntar Hugo?','¿Puedo ver tus cromos?','Me los llevo','Ya son míos'],['Lola dice que ahora no. ¿Qué puede hacer Hugo?','Esperar y preguntarle después','Quitárselos','Abrir su mochila']],
 ['Nora construye una torre. Dani tira una pieza sin querer.',['¿Qué ha pasado?','Se ha caído una pieza','Dani ha ganado','La torre ha hablado'],['¿Qué puede hacer Dani?','Ayudar a colocar la pieza','Esconderse con las piezas','Reírse de Nora'],['Nora está triste. ¿Qué puede decir Dani?','Ha sido sin querer. ¿La arreglamos?','Tienes que estar contenta','No puedes jugar más']],
 ['Ana quiere cantar. Leo quiere escuchar un cuento.',['¿Qué quiere escuchar Leo?','Un cuento','Un partido','Una alarma'],['¿Quieren hacer lo mismo?','No, quieren cosas distintas','Sí, los dos quieren cantar','No quieren hacer nada'],['¿Cómo pueden decidir sin discutir?','Elegir juntos qué hacer primero','Gritar más fuerte','Esconder el cuento']],
 ['Hugo se tapa los oídos durante una canción.',['¿Qué hace Hugo?','Se tapa los oídos','Da una palmada','Corre por el patio'],['¿Qué puedes preguntarle?','¿Te molesta el sonido?','¿Por qué no te ríes?','¿Me das tu silla?'],['Hugo dice que suena muy fuerte. ¿Qué ayuda?','Bajar el sonido','Cantar más fuerte','Obligarle a seguir']]
 ],
 junior:[
 ['En el recreo, Leo enseña su colección de Pokémon. Sara quiere mirar una carta, pero Leo no se la ha prestado.',['¿Qué puede hacer Sara antes de cogerla?','Pedir permiso','Cogerla sin avisar','Guardársela'],['Leo dice que es especial para él. ¿Qué respuesta respeta su decisión?','Podemos mirarla sin sacarla de la funda','Si no me la das, no jugamos','Todas las cartas valen lo mismo'],['Leo presta otras cartas, pero no esa. ¿Qué podemos concluir?','Puede compartir y cuidar una carta que valora','No quiere compartir nunca','Sara tiene derecho a llevársela']],
 ['El equipo está construyendo una casa de bloques. Ada quiere un jardín y Bruno prefiere una pista de fútbol.',['¿En qué no están de acuerdo?','En qué construir fuera de la casa','En el color del cielo','En quién tiene un balón'],['¿Qué propuesta tiene en cuenta a los dos?','Dividir el espacio entre jardín y pista','Borrar el jardín sin preguntar','Dejar fuera a Bruno'],['Hay poco espacio. ¿Qué pueden hacer antes de decidir?','Comparar dos bocetos y acordar cuál cabe','Construir cada uno encima del otro','Elegir siempre lo que diga Ada']],
 ['Nora dibuja un personaje de anime. Un compañero se ríe mientras mira hacia la mesa, pero Nora no sabe de qué se ríe.',['¿Qué sabe Nora con seguridad?','Que su compañero se ha reído','Que su dibujo no gusta a nadie','Que quiere romper el dibujo'],['¿Qué puede preguntar sin acusarle?','¿De qué te estabas riendo?','¿Por qué todos me odian?','¿Por qué has roto mi dibujo?'],['El compañero dice que recordaba un chiste. ¿Qué conviene hacer?','Escuchar su explicación sin dar por hecha una burla','Afirmar que siempre miente','Decidir que reír está prohibido']],
 ['En un partido del patio, Alba falla un pase y se queda callada. El equipo quiere seguir jugando.',['¿Qué puede decirle una compañera?','Seguimos juntas. ¿Quieres que te la pase otra vez?','Ya no puedes jugar','Todo ha sido culpa tuya'],['¿Por qué es útil preguntarle cómo está?','Porque no sabemos qué siente solo por verla callada','Porque callarse siempre significa enfadarse','Porque tiene que estar contenta'],['Alba pide descansar un minuto. ¿Qué acuerdo ayuda al equipo?','Respetar el descanso y acordar cuándo vuelve','Obligarla a seguir','No dejarla volver nunca']],
 ['Dani enseña un baile que ha visto con su familia. A Hugo le gusta la canción, pero no quiere bailar delante del grupo.',['¿Qué no quiere hacer Hugo?','Bailar delante del grupo','Escuchar la canción','Hablar con Dani'],['¿Cómo puede participar si le apetece?','Marcando el ritmo desde su sitio','Bailando aunque no quiera','Dejando de hablar con todos'],['Dani quiere grabarlo. ¿Qué debe hacer primero?','Preguntar a todos y respetar a quien no quiera salir','Grabarlo a escondidas','Prometer que lo borrará sin preguntar']],
 ['Mar dice «¡Menuda velocidad!» cuando su amigo llega el último a recoger. Lo dice sonriendo, pero a él le molesta.',['¿Qué sabemos de su amigo?','Que el comentario le ha molestado','Que no sabe sonreír','Que quiere llegar tarde siempre'],['¿Qué puede hacer Mar al enterarse?','Reconocerlo y cambiar el comentario','Decir que no puede molestarse','Repetirlo más alto'],['¿Qué explica esta situación?','Una broma puede molestar aunque no busque hacer daño','Toda sonrisa hace que una broma guste','Solo importa lo que quería decir Mar']]
 ],
 primary:[
 ['En una partida cooperativa de Minecraft, Vera usa los materiales comunes para decorar su casa sin avisar. El grupo los había reservado para un puente.',['¿Para qué se habían reservado los materiales?','Para construir el puente','Para decorar la casa de Vera','Para cambiarlos por música'],['¿Qué puede hacer Vera para reparar el problema?','Explicar lo ocurrido y acordar cómo reponerlos','Salir de la partida sin hablar','Decir que la decoración importa más'],['Vera no había leído el acuerdo. ¿Qué respuesta tiene en cuenta intención e impacto?','Quizá no lo sabía, pero el grupo necesita recuperar los materiales','No leer elimina cualquier consecuencia','El grupo debe excluirla para siempre']],
 ['Un grupo prepara un mural sobre anime y fútbol. Alex propone incluir ambos temas, pero dos compañeros solo quieren su favorito.',['¿Qué propone Alex?','Incluir los dos temas','Quitar todos los dibujos','Elegir sin hablar'],['¿Qué pregunta ayuda a avanzar?','¿Cómo repartimos el espacio para que participemos todos?','¿Quién tiene el gusto correcto?','¿Por qué nadie elige bien?'],['No caben dos murales completos. ¿Qué acuerdo respeta las dos ideas?','Una selección breve de cada tema con el mismo espacio','Elegir siempre al que más insiste','Decir que uno de los temas no vale']],
 ['Aina aprende una coreografía de K-pop. Cuando enseña el ensayo, Berta dice «Todavía falta practicar». Aina esperaba una felicitación.',['¿Qué esperaba Aina?','Una felicitación','Que cancelaran el ensayo','Una entrada para un partido'],['¿Qué podría preguntar Berta antes de opinar?','¿Quieres una idea para mejorar o prefieres que lo veamos juntos?','¿Por qué esperas que me guste?','¿Vas a ensayar para siempre?'],['¿Qué respuesta combina sinceridad y cuidado?','Se nota el trabajo; si quieres, practicamos juntas ese paso','Está perfecto aunque no lo piense','No debes enseñar nada hasta hacerlo perfecto']],
 ['Pau comparte en clase un vídeo de YouTube sobre un truco de fútbol. Leo dice que el truco no funciona, pero solo ha visto el título.',['¿Qué ha visto Leo?','Solo el título','El vídeo completo','Una prueba en el patio'],['¿Qué puede hacer antes de juzgarlo?','Ver la explicación y comprobar qué promete','Decir que Pau siempre se equivoca','Compartir su crítica sin mirar'],['El vídeo solo muestra un intento acertado. ¿Qué conclusión es prudente?','Un acierto no demuestra que salga siempre','Si sale una vez, nunca falla','Pau tiene que saber si está editado']],
 ['Iris escribe una broma sobre «67» en la hoja del equipo. A dos compañeros les hace gracia y otro no entiende la referencia.',['¿Quién no entiende la referencia?','Uno de los compañeros','Todo el equipo','Nadie'],['¿Qué puede hacer Iris para incluirle?','Explicar la broma sin reírse de él','Decirle que no puede estar en el equipo','Repetir el número más fuerte'],['¿Por qué pueden reaccionar de forma distinta?','No comparten la misma información ni los mismos gustos','Una persona del grupo debe estar fingiendo','Todos tienen que encontrar gracioso lo mismo']],
 ['El equipo gana un partido. Mario celebra y Julia se aparta porque le duele el pie. Mario cree que Julia está enfadada con él.',['¿Por qué se aparta Julia, según el texto?','Porque le duele el pie','Porque no quiere al equipo','Porque odia ganar'],['¿Qué podría preguntarle Mario sin suponer el motivo?','¿Estás bien? ¿Necesitas algo?','¿Por qué estás enfadada conmigo?','¿Por qué nos has dejado de querer?'],['Mario aún no sabe que le duele el pie. ¿Qué debe distinguir?','Lo que observa de la explicación que imagina','Lo que celebran de los goles que marcaron','Los mensajes del marcador del color de la camiseta']]
 ],
 middle:[
 ['En un grupo de amigos comparten un clip de Fortnite en el que Leo falla al final. Leo había aceptado grabar la partida, pero no publicar ese fragmento.',['¿A qué había dado permiso Leo?','A grabar la partida','A publicar cualquier fragmento','A usar su imagen en anuncios'],['¿Qué debería hacer quien lo ha publicado?','Preguntarle y retirar el clip si no quiere que esté publicado','Decir que fallar no importa','Mantenerlo porque ya tiene visitas'],['El clip gusta al grupo y molesta a Leo. ¿Qué pesa en la decisión?','Su permiso para publicar no se deduce del permiso para grabar','La mayoría decide sobre su imagen','Las visitas sustituyen al permiso']],
 ['Sara comenta una canción de K-pop en el chat. Su amiga no responde durante dos horas y luego contesta a un mensaje sobre fútbol.',['¿Qué sabemos con seguridad?','Que ha respondido al otro mensaje más tarde','Que rechaza a Sara','Que odia la canción'],['¿Qué explicación también encaja con los hechos?','Pudo ver los mensajes en momentos distintos','Tuvo que planear cómo ignorarla','No puede gustarle más de un tema'],['¿Qué mensaje permite aclararlo sin acusar?','Me quedé con la duda: ¿llegaste a escuchar la canción?','Ya sé que me ignoras a propósito','Si no contestas ahora, termina nuestra amistad']],
 ['Un creador de Twitch recomienda un accesorio y dice que lo usa a diario. En la descripción aparece que la marca patrocina el vídeo.',['¿Qué dato debe tenerse en cuenta?','Que hay un patrocinio','Que todos los comentarios son verdaderos','Que el accesorio es imprescindible'],['¿Qué conclusión evita ir más allá de los datos?','La recomendación tiene un interés comercial que conviene considerar','El patrocinio demuestra que el producto no funciona','El creador tiene que usarlo cada minuto'],['¿Qué comprobación ayuda a decidir con más autonomía?','Comparar necesidades, precio y reseñas que expliquen sus pruebas','Comprar para demostrar lealtad al creador','Fijarse solo en cuántas personas lo compran']],
 ['El grupo prepara un baile de TikTok para una fiesta. Noa quiere participar, pero pide no salir en la grabación.',['¿Qué ha pedido Noa?','Bailar sin salir en la grabación','Que no haya fiesta','Que nadie baile'],['¿Qué plan respeta su petición?','Hacer el baile sin grabar o acordar una toma en la que no aparezca','Grabar de lejos sin avisar','Decir que no puede participar'],['Otra persona dice que el vídeo será privado. ¿Qué cambia?','Sigue haciendo falta respetar la decisión de Noa','Ya no hace falta preguntarle','El permiso lo decide quien tiene el móvil']],
 ['En un club de anime, dos personas discuten sobre el final de una serie. Ambas citan escenas, pero interpretan de forma distinta la decisión del protagonista.',['¿En qué discrepan?','En la interpretación de la decisión','En si han visto una serie','En si existen las escenas'],['¿Qué pregunta favorece la conversación?','¿Qué escena te hace pensar eso?','¿Por qué no lo entiendes?','¿Quién tiene más seguidores?'],['¿Qué diferencia conviene mantener?','Una escena es un dato; su significado puede admitir interpretaciones','Todas las interpretaciones son hechos comprobados','Solo quien habla primero puede interpretar']],
 ['Un compañero repite «67» durante un trabajo. Algunos se ríen y otra persona pide parar porque no consigue concentrarse.',['¿Qué pide esa persona?','Que pare la interrupción','Que nadie vuelva a bromear nunca','Que se cancele el trabajo'],['¿Qué respuesta cuida la convivencia?','Parar ahora y dejar las bromas para la pausa','Seguir porque otros se ríen','Pedirle que se vaya'],['¿Qué explica que una broma deje de funcionar en ese momento?','El momento y el efecto en los demás también importan','El humor tiene siempre el mismo efecto','Pedir que pare significa rechazar a todo el grupo']]
 ],
 teen:[
 ['Un canal de YouTube publica un vídeo que critica una decisión del instituto. El título afirma que todo el alumnado está en contra, pero solo aparecen tres entrevistas.',['¿Qué evidencia presenta el vídeo?','Tres entrevistas','La opinión de todo el alumnado','Una votación con participación completa'],['¿Qué límite tiene la conclusión del título?','Tres testimonios no demuestran lo que piensa todo el alumnado','Ningún testimonio puede aportar información','Todo título crítico es falso'],['¿Qué información ayudaría a valorar la representatividad?','Cómo se eligió a las personas y si se recogieron opiniones distintas','Si las entrevistas tienen muchas visitas, aunque no se conozca la selección','Cuántos comentarios coinciden con el título, sin comprobar quién participó']],
 ['En un equipo de fútbol, la capitana reserva el campo y después propone repartir el coste. Parte del grupo no había confirmado que asistiría.',['¿Qué falta aclarar?','Quién había aceptado el plan y el gasto','El color del campo','Quién tiene más seguidores'],['¿Qué mensaje reconoce el problema sin atacar?','Reservé antes de confirmar el coste; revisemos qué habíamos acordado','Quien no pague no es amigo mío','Ya está pagado, así que no podéis opinar'],['¿Qué acuerdo reduce el riesgo de repetirlo?','Confirmar asistencia, coste y cancelación antes de reservar','Confirmar solo quién suele acudir y dar por aceptado el precio','Reservar primero y permitir que quien no vaya busque un sustituto']],
 ['Una amiga recomienda una tienda de ropa de K-pop. Después explica que recibe una comisión por cada compra con su código.',['¿Qué interés adicional existe?','Una comisión por las compras','La obligación de comprar entre amigos','Una prueba de que toda la ropa es mala'],['¿Qué puede decir quien recibe la recomendación?','Gracias; compararé el precio y decidiré si lo necesito','Si no compro, dejaré de ser tu amigo','Tu comisión demuestra que todo es una mentira'],['¿Qué conducta permite una recomendación más transparente?','Explicar la comisión antes de animar a comprar','Explicar la comisión únicamente si alguien pregunta por ella','Mencionar el descuento y dar por explicada la colaboración']],
 ['El grupo organiza un torneo de videojuegos. Quien modera cambia una norma después de que su propio equipo pierda una ronda. Dice que la norma era poco clara.',['¿Qué dos hechos conviene distinguir?','La posible ambigüedad y el interés de quien cambia la norma','El nombre del juego y su música','La edad de los jugadores y el color del mando'],['¿Qué procedimiento protege mejor al grupo?','Revisar la norma con representantes de ambos equipos antes de aplicarla','Aceptar el cambio por la autoridad de quien modera','Decidir según el equipo con más público'],['¿Qué solución equilibra claridad y trato justo?','Acordar cómo resolver la ronda y fijar una regla común para las siguientes','Repetir la ronda con la interpretación de quien organiza, sin consultar al rival','Aplicar la regla nueva a las rondas anteriores sin acordarlo con los equipos']],
 ['Una compañera comparte un vídeo de TikTok sobre ansiedad y se reconoce en varios ejemplos. Otro compañero afirma que eso confirma un diagnóstico.',['¿Qué permite decir el vídeo por sí solo?','Que algunos ejemplos le resultan familiares','Que confirma un diagnóstico','Que conoce toda su historia'],['¿Qué respuesta resulta más cuidadosa?','Si te preocupa, podemos buscar orientación profesional sin sacar conclusiones del vídeo','Ya sabemos exactamente lo que te pasa','Si sonríes, no puedes tener dificultades'],['¿Qué diferencia es fundamental?','Identificarse con un contenido no equivale a una valoración profesional','Ver más vídeos de la misma cuenta permite confirmar el diagnóstico','La coincidencia de varios amigos equivale a una valoración profesional']],
 ['Un grupo quiere publicar una foto tras un concierto. Una persona acepta salir en el álbum privado, pero no quiere que su imagen se use para promocionar el evento.',['¿Qué permiso ha dado?','Aparecer en el álbum privado','Promocionar cualquier evento','Ceder todas sus fotos futuras'],['¿Qué debe hacer el grupo antes de publicar un cartel?','Pedir permiso para ese uso concreto','Suponer que aceptar el álbum vale para todo','Publicarlo y preguntar después'],['¿Por qué no basta con el permiso anterior?','La finalidad y el público del nuevo uso son diferentes','El permiso se mantiene porque la foto no cambia, aunque se use en un cartel','Basta con avisar del nuevo uso después de preparar el cartel']]
 ]
};
socialStories.early.push(
 ['Ana pide una pieza. Leo la está usando.',['¿Quién usa la pieza?','Leo','Ana','Nora'],['¿Qué puede decir Leo?','Te la doy cuando termine','No puedes construir','La pieza es invisible'],['Ana necesita construir ahora. ¿Qué pueden buscar?','Otra pieza que le sirva','Algo para tirar la torre','Un escondite para todas las piezas']],
 ['Mar gana una carrera. Lola llega después y baja la cabeza.',['¿Quién gana la carrera?','Mar','Lola','Hugo'],['¿Qué puede preguntar Mar?','¿Quieres descansar conmigo?','¿Por qué eres tan lenta?','¿Por qué no has ganado tú?'],['Lola dice que está cansada. ¿Qué puede hacer Mar?','Respetar que descanse','Obligarla a correr otra vez','Decirle que no puede cansarse']],
 ['Pau dibuja en silencio. Hugo quiere contarle una historia.',['¿Qué hace Pau?','Dibuja','Corre','Baila'],['¿Cómo puede empezar Hugo?','¿Te puedo contar algo?','Quitándole el dibujo','Gritándole al oído'],['Pau pide terminar primero. ¿Qué puede hacer Hugo?','Esperar a que termine','Hablar cada vez más fuerte','Romper el papel']],
 ['Nora no encuentra su gorra. Dani la ve bajo una silla.',['¿Dónde está la gorra?','Bajo una silla','En una caja','Sobre la mesa'],['¿Qué puede hacer Dani?','Decirle dónde está','Esconder la gorra','Decir que no hay gorra'],['Nora sigue buscando en la mesa. ¿Qué le ayuda?','Mira debajo de esta silla','Está donde tú ya sabes','Busca más deprisa']],
 ['Leo ofrece una galleta. Ana dice que no tiene hambre.',['¿Qué ofrece Leo?','Una galleta','Un lápiz','Una pelota'],['¿Qué puede responder Leo?','Vale, la guardo para después','Tienes que comerla','No puedes jugar'],['Ana quiere jugar con Leo. ¿Qué sabemos?','Puede querer jugar sin querer comer','No quiere volver a verle','Tiene que aceptar la galleta']],
 ['Lola usa un lápiz rojo. Mar quiere cogerlo de su mano.',['¿De qué color es el lápiz?','Rojo','Azul','Verde'],['¿Qué puede hacer Mar?','Pedirlo y esperar','Tirar de su mano','Quitárselo sin hablar'],['Lola dice que lo presta al acabar. ¿Qué ayuda?','Usar otro color mientras espera','Esconder todos los lápices','Decir que Lola nunca comparte']],
 ['Hugo y Pau llevan una caja. La caja es grande.',['¿Qué llevan juntos?','Una caja','Una mesa','Un perro'],['¿Cómo pueden llevarla mejor?','Acordando cuándo levantarla','Tirando cada uno hacia un lado','Soltándola sin avisar'],['Hugo necesita parar. ¿Qué debe hacer?','Avisar antes de soltarla','Soltarla de golpe','Reírse sin decir nada']],
 ['Ana ve que Dani está llorando junto al columpio.',['¿Qué ha visto Ana?','A Dani llorando','A Dani cantando','A Dani durmiendo'],['¿Qué puede preguntarle?','¿Quieres que busquemos ayuda?','¿Por qué siempre lloras?','¿Me das tu gorra?'],['Dani pide estar un momento tranquilo. ¿Qué puede hacer Ana?','Respetarlo y ofrecer ayuda cercana','Abrazarlo aunque diga que no','Obligarlo a contar todo']],
 ['Mar quiere abrazar a Nora. Nora prefiere saludar con la mano.',['¿Cómo quiere saludar Nora?','Con la mano','Con un abrazo','Con una carrera'],['¿Qué puede hacer Mar?','Saludar con la mano','Abrazarla de todos modos','Decir que es mala amiga'],['¿Qué nos cuenta la historia?','Podemos saludarnos de distintas formas','Todos tienen que dar abrazos','No querer un abrazo es estar enfadado']],
 ['Pau y Leo quieren ser porteros en el mismo partido.',['¿Qué quieren ser los dos?','Porteros','Árbitros','Cantantes'],['¿Qué pueden proponer?','Cambiar de portero por turnos','Quitar la pelota al otro','No dejar jugar a nadie'],['El partido tiene dos partes. ¿Qué acuerdo encaja?','Una parte de portero para cada uno','Uno juega siempre y el otro mira','Los dos discuten todo el partido']],
 ['Lola dice que le gustan los gatos. Hugo prefiere los perros.',['¿Qué animales prefiere Hugo?','Los perros','Los gatos','Los peces'],['¿Pueden gustarles animales distintos?','Sí, pueden tener gustos diferentes','No, deben pensar lo mismo','Solo si no son amigos'],['¿Qué puede preguntarle Lola?','¿Qué te gusta de los perros?','¿Por qué eliges tan mal?','¿Por qué ya no eres mi amigo?']],
 ['Dani quiere entrar en una tienda de campaña hecha con mantas.',['¿Dónde quiere entrar Dani?','En la tienda de mantas','En un autobús','En una cocina'],['Dentro están jugando dos amigos. ¿Qué puede preguntar?','¿Puedo entrar a jugar?','¿Puedo quitar las mantas?','¿Me quedo con todas las mantas?'],['Le dicen que no cabe nadie más. ¿Qué puede proponer?','Ampliarla juntos o esperar un turno','Tirar de las mantas sin avisar','Empujar a uno para entrar']],
 ['Nora y Mar preparan un puzle. Faltan piezas en una esquina.',['¿Qué están preparando?','Un puzle','Una merienda','Una canción'],['¿Cómo pueden colaborar?','Buscar cada una en una zona','Esconder las piezas de la otra','Quitar lo que ya está hecho'],['Las dos encuentran la misma pieza. ¿Qué pueden hacer?','Acordar quién la coloca ahora','Tirar de la pieza','Enfadarse sin hablar']],
 ['Leo cree que Pau ha cogido su coche. Pau tiene otro parecido.',['¿Qué tiene Pau?','Otro coche parecido','El único coche de Leo','Un avión'],['¿Qué puede hacer Leo antes de acusar?','Mirar bien y preguntarle','Gritar que Pau roba','Quitárselo de la mano'],['Los coches se parecen. ¿Qué puede explicar la confusión?','Leo no había visto la diferencia','Pau tiene que estar mintiendo','No puede haber dos coches parecidos']],
 ['Hugo quiere jugar a perseguirse. Ana no quiere correr hoy.',['¿Quién no quiere correr?','Ana','Hugo','Pau'],['¿Qué puede proponer Hugo?','Un juego tranquilo que les guste','Que Ana corra aunque no quiera','Que Ana no juegue nunca'],['Ana propone dibujar y Hugo acepta. ¿Qué han hecho?','Han buscado un plan para los dos','Ana ha ganado una carrera','Hugo ha dejado de ser su amigo']],
 ['Lola y Dani recogen una caja de piezas del suelo.',['¿Qué están recogiendo?','Piezas','Platos','Libros'],['¿Qué reparto puede ayudarles?','Uno recoge y otro sostiene la caja','Los dos esconden las piezas','Uno tira lo que guarda el otro'],['La caja se cae. ¿Qué les ayuda a seguir?','Colocarla en el suelo y recoger juntos','Buscar a quién echar la culpa','Dejar las piezas para que alguien tropiece']],
 ['Pau oye a Nora decir «Estoy helada» junto a la ventana.',['¿Dónde está Nora?','Junto a la ventana','En el patio','Dentro de una caja'],['¿Qué quiere decir normalmente?','Que tiene mucho frío','Que es un cubito de hielo','Que quiere cantar'],['¿Qué puede preguntar Pau?','¿Quieres que cerremos la ventana?','¿Por qué eres de hielo?','¿Quieres más viento frío?']],
 ['Mar y Ana inventan una contraseña para su juego del patio.',['¿Para qué es la contraseña?','Para su juego','Para abrir una cuenta','Para comprar cosas'],['Hugo quiere aprender el juego. ¿Qué pueden hacer?','Explicarle cómo se juega','Reírse porque no lo conoce','Decirle una regla falsa'],['Hugo no entiende una regla. ¿Qué ayuda?','Mostrarle un ejemplo jugando juntos','Repetirla gritando','Decirle que no puede aprender']]
);

function social(age,level){return socialStories[age].map(([scenario,...questions],index)=>{
 const [q,a,...wrong]=questions[level-1];
 const item=finish(choice(q,[T(scenario)],a,wrong,{topic:'Social Lab · convivir y comprender',why:age==='early'?'La pista está en lo que ocurre en la historia.':'Esta respuesta se apoya en lo que sabemos de la situación y respeta las decisiones de las personas.',socialEvidence:{age,level,index}}),age,'social',level,'social-'+index,'social_perspective_'+level);
 if(age==='early')item.ageProfile={...item.ageProfile,mechanic:['cooperation','perspective','boundaries'][index%3],family:'social-'+index};
 return item;
});}
function validateSocial(item){
 const e=item.socialEvidence;if(!e||item.domain!=='social')throw new Error('Falta la situación social revisada.');
 const declared=item.ageProfile?.id||item.juniorProfile?.route||item.schoolProfile?.route||(item.teenReview?'teen':null);
 if(item.level!==e.level||declared!==e.age||item.type!=='standard'||item.responseType!=='choice')throw new Error('La situación social no corresponde a la edad, el nivel o el formato.');
 let expected=social(e.age,e.level)[e.index];if(!expected)throw new Error('Situación social desconocida.');
 if(item.localization)expected=(root.LocaleContent||(typeof require==='function'&&require('./locale-content'))).localizeItem(expected,item.localization.locale,'social');
 for(const key of ['q','a','stimulus','socialEvidence'])if(JSON.stringify(item[key])!==JSON.stringify(expected[key]))throw new Error('La pregunta no corresponde a la situación social.');
 if(JSON.stringify([...item.opts].sort())!==JSON.stringify([...expected.opts].sort()))throw new Error('Respuestas sociales alteradas.');
 return true;
}

const interactionCache=new Map();
function interactiveTemplates(age,domain,level=1){
 if(!['junior','primary','middle','teen'].includes(age)||!['attention','executive'].includes(domain)||![1,2,3].includes(level))return [];
 const key=[age,domain,level].join(':');if(interactionCache.has(key))return interactionCache.get(key);
 const out=[],count=[3,4,age==='junior'?5:6][level-1];
 for(let variant=0;variant<8;variant++){
  if(domain==='attention'){
   const clues=[
    ['un objeto redondo','un objeto rojo','un objeto de papel','un objeto suave','un objeto azul','un objeto alargado','un objeto que tenga letras','un objeto de madera'],
    ['un objeto rojo y pequeño','un objeto redondo y de plástico','un objeto de papel que tenga letras','un objeto alargado que sirva para escribir','un objeto azul y de tela','un objeto rectangular que se pueda abrir','un objeto transparente y de plástico','un objeto pequeño que tenga números'],
    ['un objeto que tenga letras, que puedas coger con una mano y que no sea un libro','un objeto redondo que no sea de papel y que esté sobre una mesa','un objeto que sirva para guardar cosas, que puedas mover y que no sea una mochila','un objeto con dos colores que no sea un libro ni una prenda de ropa','un objeto transparente que sirva para guardar algo y que no sea de cristal','un objeto que tenga números, que puedas mover y que no sea un teléfono','un objeto de tela que puedas doblar y que no sea una prenda de ropa','un objeto alargado que sirva para escribir y que no escriba con tinta']
   ][level-1];
   const clue=clues[variant],q=`Busca a tu alrededor ${clue}.`;
   out.push(finish({type:'self',responseType:'written',assessment:'observation',q,topic:'Atención · busca en la sala',
    stimulus:[T('Mira los objetos que tienes cerca. Puedes hacer la actividad desde tu sitio. No hace falta usar cámara ni micrófono.'),T(level===1?'Di qué objeto has encontrado y qué característica cumple.':level===2?'Describe el objeto y explica cómo cumple las dos condiciones.':'Describe el objeto y comprueba cada condición. Después explica por qué otro objeto parecido no serviría.'),T('Si no encuentras ninguno, puedes indicarlo. No se cuenta como un error.')],
    sample:'Respuesta abierta: comprobar las características indicadas con la persona que acompaña la actividad. Si no hay un objeto adecuado, registrar que no se ha encontrado.',
    interactionTask:{kind:'room',age,level,variant,clue,conditions:level},requiresStimulus:true},age,domain,level,'room-'+variant,'attention_room_search'));
   continue;
  }
  for(const kind of ['symbols','movement','auditory']){
   const symbols=['★','●','■','▲','◆','✚'].slice(0,count),names=['estrella','círculo','cuadrado','triángulo','rombo','cruz'].slice(0,count);
   const actions=kind==='symbols'?Array.from({length:count-1},(_,i)=>'Pulsa '+String.fromCharCode(65+i)):
    rotate(['Da una palmada suave','Tócate el pelo o la cabeza','Levanta una mano','Toca un lápiz que tengas a mano','Tócate el hombro','Toca la mesa con dos dedos','Levanta las dos manos desde tu sitio','Cruza los brazos'],variant).slice(0,count-1);
   const audioMode=variant%2?'tones':'words';
   const signals=[{label:'Un sonido grave',frequency:440,beeps:1},{label:'Un sonido agudo',frequency:880,beeps:1},{label:'Dos sonidos graves',frequency:440,beeps:2},{label:'Dos sonidos agudos',frequency:880,beeps:2},{label:'Tres sonidos graves',frequency:440,beeps:3},{label:'Tres sonidos agudos',frequency:880,beeps:3}].slice(0,count);
   const words=[...['SOL','LUNA','ESTRELLA','NUBE','ÁRBOL'].slice(0,count-1),'PAUSA'];
   const rules=symbols.map((symbol,i)=>({symbol,label:kind==='symbols'?names[i]:kind==='auditory'&&audioMode==='tones'?signals[i].label:words[i],target:i===count-1?-1:(i+variant)%(count-1)}));
   const secondRules=level===3&&kind==='symbols'?rules.map((rule,i)=>{const shifted=(i+1)%count;return {...rule,target:shifted===count-1?-1:(shifted+variant)%(count-1)};}):null;
   const indices=Array.from({length:count},(_,i)=>i),trials=[...shuffled(indices,variant+11),...shuffled(indices,variant+51)];
   const waitMs=kind==='movement'?5000:1500+(level-1)*250;
   const action=target=>target<0?'Espera sin hacer nada':actions[target];
   const ruleTable=rs=>({type:'table',header:true,rows:[['Tarjeta','Qué tienes que hacer'],...rs.map(r=>[kind==='symbols'?r.symbol+' · '+r.label:r.label,action(r.target)])]});
   const stimulus=[T(kind==='auditory'&&age==='junior'?'Escucha las señales de prueba y aprende sus gestos. Espera a oír cada señal completa antes de moverte. Cuando toque esperar, no hagas ningún gesto. Puedes jugar sentado y pedir ayuda.':kind==='auditory'?`Escucha las señales y sigue la tabla. Primero prueba el audio y aprende cada señal. Después de empezar, no hagas ningún gesto mientras esperas. Cuando oigas la señal completa, haz el gesto que le corresponde. Si la regla dice esperar, no te muevas. Puedes hacer todos los gestos desde tu sitio y omitir cualquiera que te resulte incómodo. La persona que te acompaña puede anotar lo que observa.`:kind==='symbols'?'Mira las reglas. Después verás una tarjeta cada vez. Pulsa el botón que le corresponde. Si la regla dice esperar, no pulses ningún botón hasta que termine la barra.':'Lee las reglas y elige una postura cómoda. En cada tarjeta, espera cinco segundos antes de hacer el gesto. Sigue la cuenta de la pantalla. En PAUSA, espera y no hagas ningún gesto. Puedes practicar con una persona que te acompañe.'),ruleTable(rules),
    ...(secondRules?[T('A mitad de la actividad cambiarán las reglas. Lee la nueva tabla antes de continuar.'),ruleTable(secondRules)]:[]),
    {type:'list',presentation:'sequence',items:trials.map(i=>kind==='symbols'?rules[i].symbol+' · '+rules[i].label:rules[i].label)}];
   const answers=trials.map((index,i)=>action((secondRules&&i>=count?secondRules:rules)[index].target));
   out.push(finish({type:'self',responseType:'written',assessment:kind==='symbols'?'performance':'observation',requiresStimulus:true,
    q:kind==='symbols'?'Mira la tarjeta y sigue su regla.':kind==='auditory'?'Escucha la señal completa y después actúa.':'Espera, piensa y haz el gesto.',topic:kind==='symbols'?'Funciones ejecutivas · tarjetas con reglas':kind==='auditory'?'Funciones ejecutivas · escucha y actúa':'Funciones ejecutivas · espera antes de actuar',stimulus,
    sample:kind==='symbols'?answers.map((a,i)=>`${i+1}. ${a}`).join(' · '):'Práctica de observación: anotar si se ha respetado la espera antes de cada gesto. La pantalla no puede comprobar el movimiento.',
    interactionTask:{kind,age,level,variant,rules,secondRules,actions,trials,waitMs,...(kind==='auditory'?{audioMode,signals,delays:trials.map((_,i)=>1500+((i*947+variant*631)%2500))}:{})}},age,domain,level,kind+'-'+variant,'executive_interactive_'+kind));
  }
 }
 interactionCache.set(key,out);return out;
}
function interactivePool(age,domain,level=1){return structuredClone(interactiveTemplates(age,domain,level));}
function generateInteractive(age,domain,level=1,kind=null){const bank=interactiveTemplates(age,domain,level).filter(it=>!kind||it.interactionTask.kind===kind);return bank.length?structuredClone(bank[Math.floor(Math.random()*bank.length)]):null;}
function validateInteraction(item){
 const t=item.interactionTask;
 if(!t||!Number.isInteger(t.variant)||t.variant<0||t.variant>7)throw new Error('La actividad interactiva no identifica sus reglas.');
 let expected=interactiveTemplates(t.age,item.domain,t.level).find(it=>it.interactionTask.kind===t.kind&&it.interactionTask.variant===t.variant);
 if(!expected||item.level!==t.level)throw new Error('La actividad interactiva no corresponde al área o nivel.');
 if(item.localization)expected=(root.LocaleContent||(typeof require==='function'&&require('./locale-content'))).localizeItem(expected,item.localization.locale,item.domain);
 for(const field of ['interactionTask','type','responseType','assessment','q','stimulus','sample'])if(JSON.stringify(item[field])!==JSON.stringify(expected[field]))throw new Error('Las reglas, tarjetas o instrucciones se han alterado.');
 return true;
}
const cache=new Map(),generationGroups=new Map();let reasoningProvider=null,writingProvider=null;
function registerReasoning(provider){reasoningProvider=provider;generationGroups.clear();for(const key of cache.keys())if(key.includes(':executive:'))cache.delete(key);}

function registerWriting(provider){writingProvider=provider;cache.clear();generationGroups.clear();}
function supports(age,domain){return ages.includes(age)&&(['social','executive','applied','memory','speedReasoning'].includes(domain)||(['early','junior'].includes(age)?domain==='reading':['primary','middle','teen'].includes(age)&&['literacy','reading','middleReading'].includes(domain)));}
function pool(age,domain,level=1){
 if(!supports(age,domain))return [];
 const actual=domain==='applied'?'executive':domain,readingDomain=['reading','middleReading','literacy'].includes(actual),key=[age,actual,level].join(':');
 if(!cache.has(key)){
  const bank=actual==='social'?social(age,level):readingDomain?reading(age,actual,level):actual==='memory'?memory(age,level):actual==='speedReasoning'?speed(age,level):executive(age,level);
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
const api={social,validateSocial,academic,generateAcademic,validateMath,validateSpeed,validatePlan,memoryCategories,validateSelectiveRecall,validateReview,vocabulary,interactivePool,generateInteractive,validateInteraction,pool,generate,supports,visible,migrate,speedSummary,registerReasoning,registerWriting,spatialPositions};root.Curriculum=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

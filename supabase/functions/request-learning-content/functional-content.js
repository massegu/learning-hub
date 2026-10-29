(function(root){
'use strict';
const quality=root.ContentQuality||(typeof require==='function'&&require('./content-quality'));
const ages=['early','junior','primary','middle','teen'],T=text=>({type:'text',text}),L=items=>({type:'list',presentation:'cards',items}),table=rows=>({type:'table',rows});
const extra=[['math.count','Relacionar una cantidad con su número','elements'],['math.compare','Comparar cantidades para decidir','quantities'],['math.money','Distinguir número de monedas y valor representado','denominations'],['math.measure','Interpretar una medida con su unidad','units'],['math.order','Ordenar cantidades en una recta numérica','elements'],['geometry.symmetry','Reconocer una reflexión conservando las distancias','spatialRelations'],['geometry.perimeter','Calcular el borde necesario para rodear un espacio','operations'],['geometry.properties','Clasificar figuras por sus propiedades','criteria'],['geometry.faces','Relacionar una figura plana con un cuerpo','spatialRelations'],['reading.chronology','Reconstruir el orden de hechos de un mensaje','steps'],['reading.follow_instruction','Aplicar una indicación escrita a una situación','conditions']];
for(const [id,purpose,dimension] of extra)quality.register(id,purpose,dimension);
const cache=new Map();
function pool(age,domain,level=1){
 const key=[age,domain,level].join(':');if(cache.has(key))return structuredClone(cache.get(key));if(!ages.includes(age)||![1,2,3].includes(level))return [];
 const rank=ages.indexOf(age),items=[];
 if(['division','middleMath','teenMath'].includes(domain)&&domain!==(rank===4?'teenMath':rank===3?'middleMath':'division'))return [];
 if(domain==='geometry'&&age!=='primary')return [];
 if(domain==='english'&&rank<2)return [];
 if(domain==='literacy'&&rank<2)return [];
 function add(family,scenario,q,stimulus,a,wrong,extra={},variant=0){
  const id=['functional-v1',age,domain,level,family,scenario,variant].join(':');
  const earlyMechanic=domain==='division'?'compare':domain==='reading'?'literal':domain==='memory'?'rememberOrder':domain==='executive'?'organisation':domain==='social'?'perspective':'speedCompare';
  const entry={id,contentKey:id,semanticKey:id,domain,level,type:'standard',responseType:'choice',requiresStimulus:true,q,stimulus,a,opts:[a,...wrong].slice(0,age==='early'?3:4),why:'Comprueba los datos del material y la condición de la pregunta.',mechanic:'functional_'+family.replaceAll('.','_'),
   ...(domain==='language'?{languageFocus:'grammar'}:{}),qualityDescriptor:{semanticFamily:family,scenarioFamily:scenario},qualityEvidence:{age,domain,level,id},
   ...(age==='early'?{ageProfile:{id:'early',revision:1,context:scenario.startsWith('home')?'family':'school',mechanic:earlyMechanic,family:'functional-'+family},selectionWeight:1}:age==='junior'?{juniorProfile:{route:age,level}}:age==='teen'?{teenReview:{version:3}}:{schoolProfile:{route:age,level}}),...extra};
  items.push(entry);
 }
 // Distinct numerical operations, not extra names for a shared addition template.
 if(['division','middleMath','teenMath'].includes(domain))for(let v=0;v<3;v++){
  const n=age==='early'?level+v+1:rank<3?4+level*2+v:10+level*5+v;
  const context=['school.materials','home.planning','community.workshop'][v];
  const denomination=age==='early'?(level===1?1:2):(level===1?5:level===2?10:20),coins=age==='early'?2:level+2,moneyUnit=age==='early'?'monedas':'billetes';
  add('math.money','shopping.spain',age==='early'?'¿Cuántos euros valen estas monedas?':'¿Qué valor representan los billetes, sin confundirlo con su cantidad?',[T(`En España hay ${coins} ${moneyUnit} de ${denomination} €.`)],String(coins*denomination)+' €',[String(coins)+' €',String(coins*denomination+denomination)+' €'],{currencyContext:'foreign',topic:'Matemáticas · valor del dinero',why:`${coins} ${moneyUnit} de ${denomination} € representan ${coins*denomination} €.`},v);
  if(age==='early'){
   const start=level===1?0:level;add('math.measure',context,'¿Cuánto mide el lápiz?',[T(`El lápiz empieza en ${start} cm y termina en ${n+start} cm.`)],`${n} cm`,[`${n+1} cm`,`${n-1} cm`],{topic:'Matemáticas · leer una medida',why:`Desde ${start} hasta ${n+start} hay ${n} centímetros.`},v);
   const values=[n,n+2,n+1];add('math.order','abstract_pattern','¿Qué número queda en medio al ordenarlos?',[L(values.map(String))],String(n+1),[String(n),String(n+2)],{topic:'Matemáticas · ordenar cantidades',why:`El orden es ${n}, ${n+1}, ${n+2}.`},v);
  }else{
   const start=rank<3?10:16,duration=level+v+1;
   add('math.time',context,'¿A qué hora termina la actividad?',[T(`La actividad empieza a las ${start}:00 y dura ${duration*10} minutos.`)],`${start+Math.floor(duration*10/60)}:${String(duration*10%60).padStart(2,'0')}`,[`${start}:00`,`${start+1}:00`].filter(x=>x!==`${start+Math.floor(duration*10/60)}:${String(duration*10%60).padStart(2,'0')}`),{topic:'Matemáticas · horario y duración',why:'Suma la duración a la hora de inicio; sesenta minutos forman una hora.'},v);
  }
 }
 if(domain==='geometry'&&age==='primary')for(let v=0;v<3;v++){
  const n=level+v+2;
  add('geometry.symmetry','school.design','Un punto está a '+n+' cuadros a la izquierda del espejo. ¿Dónde queda su reflejo?',[T('El espejo es una línea vertical. El reflejo conserva la altura y la distancia.')],`${n} cuadros a la derecha`,[`${n+1} cuadros a la derecha`,`${n} cuadros más arriba`],{topic:'Geometría · reflejos'},v);
  const side=level+v+3;add('geometry.perimeter','community.garden','¿Cuánta cuerda necesitas para rodear el cuadrado?',[T(`El huerto es cuadrado. Cada lado mide ${side} metros.`)],`${side*4} m`,[`${side*side} m`,`${side*2} m`].filter(x=>x!==`${side*4} m`),{topic:'Geometría · medir un contorno',why:`Cuatro lados de ${side} metros suman ${side*4} metros.`},v);
  add('geometry.properties','school.materials','¿Qué figura cumple las dos condiciones?',[T('Buscas una figura con cuatro lados iguales y cuatro ángulos rectos.')],'Un cuadrado',['Un rombo sin ángulos rectos','Un rectángulo con dos lados largos'],{topic:'Geometría · clasificar figuras'},v);
  add('geometry.faces','home.packaging','¿Qué pieza puede formar una cara de un cubo?',[T('Un cubo tiene seis caras iguales. Todas sus caras tienen cuatro lados iguales y ángulos rectos.')],'Un cuadrado',['Un triángulo','Un rectángulo con lados de distinta longitud'],{topic:'Geometría · caras de cuerpos'},v);
 }
 // Short functional reading: purpose, inference and actual use, not copied word order.
 if(['reading','literacy'].includes(domain)&&['early','junior'].includes(age)){
  const rows=[
   ['reading.document_purpose','school.garden','El cartel dice: «No pises las plantas».','¿Para qué sirve el cartel?','Para proteger las plantas',['Para contar las plantas','Para indicar la hora']],
   ['reading.document_purpose','home.routines','La nota dice: «Deja la luz apagada al salir».','¿Para qué sirve la nota?','Para recordar que apagues la luz',['Para describir una lámpara','Para decir quién ha llegado']],
   ['reading.inference','school.playground','El patio tiene charcos. Mar lleva botas.','¿Por qué le pueden servir las botas?','Para no mojarse los pies',['Para llevar más libros','Para llegar antes a clase']],
   ['reading.inference','home.routines','La taza quema. Leo espera antes de beber.','¿Por qué espera Leo?','Para que la bebida se enfríe',['Para cambiar de taza','Para que entre más bebida']],
   ['reading.compare_sources','school.schedule','Nota nueva: «El juego es dentro». Nota anterior: «El juego es fuera».','¿Qué ha cambiado?','El lugar del juego',['La persona que juega','El nombre del juego']],
   ['reading.compare_sources','home.planning','Lista nueva: «Pan y leche». Lista anterior: «Solo pan».','¿Qué se ha añadido?','La leche',['El pan','Una cesta']],
   ['reading.fact_opinion','school.library','Mar dice: «El cuento tiene diez páginas. Me gusta mucho».','¿Qué frase cuenta lo que prefiere Mar?','Me gusta mucho',['Tiene diez páginas','El cuento tiene páginas']],
   ['reading.fact_opinion','home.play','Pau dice: «La pelota es roja. Es mi juego favorito».','¿Qué frase cuenta lo que le gusta a Pau?','Es mi juego favorito',['La pelota es roja','Hay una pelota']],
   ['reading.follow_instruction','school.materials','La nota dice: «Guarda el lápiz dentro del estuche».','¿Dónde debes guardar el lápiz?','Dentro del estuche',['Al lado del estuche','Debajo del estuche']],
   ['reading.follow_instruction','home.routines','La nota dice: «Deja el vaso junto al plato».','¿Dónde debes dejar el vaso?','Junto al plato',['Dentro del plato','Debajo del plato']]
  ];
  for(const [family,scenario,source,q,a,wrong] of rows)add(family,scenario,q,[T(source)],a,wrong,{topic:'Lectura · mensajes que sirven para actuar'});
  for(const [v,events] of [['school.garden',['Plantar la semilla','Regar la tierra','Ver crecer la planta']],['home.snack',['Lavar la fruta','Cortar la fruta','Servir la fruta']]].entries()){
   const [scenario,steps]=events;const shown=steps.slice(0,age==='early'&&level===1?2:3);
   add('reading.chronology',scenario,'Ordena lo que ocurre. Empieza por el primer hecho.',[T('Primero: '+shown[0]+'. Después: '+shown[1]+'.'+(shown[2]?' Al final: '+shown[2]+'.':''))],undefined,[],{type:'order',responseType:'order',tokens:[...shown].reverse(),answer:shown,topic:'Lectura · ordenar hechos',ageProfile:age==='early'?{id:'early',revision:1,context:'school',mechanic:'sequencing',family:'functional-reading.chronology'}:undefined},v);
  }
 }
 if(domain==='executive'&&age==='early')for(let v=0;v<1;v++){
  const scenario='school.project';
  add('executive.conditions',scenario,'¿Qué caja puedes llevar?',[table([['Caja A','Lista y con permiso'],['Caja B','Lista, sin permiso']]),T('Necesitas una caja lista y con permiso.')],'La caja A',['La caja B'],{topic:'Organizar · comprobar dos condiciones'},v);
  add('executive.resources',scenario,'¿Qué bolsa tiene todo lo necesario?',[T('Necesitas papel y un lápiz.'),table([['Bolsa A','Papel y lápiz'],['Bolsa B','Solo papel']])],'La bolsa A',['La bolsa B'],{topic:'Organizar · preparar materiales'},v);
  add('executive.update',scenario,'¿Qué debes cambiar en el plan?',[T('Ibas a jugar fuera. Ahora llueve. El juego pasa dentro.')],'Preparar el juego dentro',['Preparar el juego fuera'],{topic:'Organizar · cambiar un plan'},v);
  add('executive.time',scenario,'¿Qué tarea cabe antes de salir?',[T('Faltan cinco minutos para salir.'),table([['Guardar el lápiz','Un minuto'],['Empezar el puzle','Diez minutos']])],'Guardar el lápiz',['Empezar el puzle'],{topic:'Organizar · elegir según el tiempo'},v);
 }
 if(domain==='memory'&&age==='early'&&level>=2)for(let v=0;v<3;v++){
  const shown=[['el libro','la pelota','el lápiz'],['la manzana','el cuaderno','la gorra'],['el regalo','la botella','la galleta']][v].slice(0,level===2?2:3);
  for(const reverse of level===3?[false,true]:[false]){
   const answer=reverse?[...shown].reverse():shown.slice(-1),family=reverse?'memory.reverse':'memory.recent';
   add(family,'abstract_pattern',reverse?'Recuerda las imágenes. Después irán al revés.':'Recuerda solo la última imagen.',[L(shown)],undefined,[],{type:'memoryReveal',responseType:'order',memoryResponse:'order',memoryContent:shown.map(detail=>({detail})),memoryQuestion:reverse?'Pon las imágenes en orden inverso.':'¿Qué imagen estaba al final?',tokens:[...answer].reverse(),answer,revealMs:10000,recallEvidence:{kind:'sequence',block:0,...(reverse?{reverse:true}:{takeLast:1})},topic:'Memoria · transformar lo que recuerdas'},v);
  }
 }
 if(domain==='speedReasoning'&&age==='early')for(let v=0;v<3;v++){
  const symbols=['○','□','△'],target=symbols[v];
  add('speed.key','abstract_pattern',`¿Qué número corresponde a ${target}?`,[table(symbols.slice(0,level===1?2:3).map((s,i)=>[s,String(i+1)]))],String(v%(level===1?2:3)+1),['1','2','3'].filter(x=>x!==String(v%(level===1?2:3)+1)),{speedTask:true,speedFamily:'key',speedRevision:4,topic:'Velocidad · consultar una clave'},v);
  // Ensure the target actually appears in the two-entry key at level one.
  items.at(-1).q=`¿Qué número corresponde a ${symbols[v%(level===1?2:3)]}?`;
  const model=v%2?'○ □':'□ ○';
  add('speed.match','abstract_pattern','¿Qué etiqueta es igual al modelo?',[T('Modelo: '+model)],model,[v%2?'□ ○':'○ □','△ ○'],{speedTask:true,speedFamily:'match',speedRevision:4,topic:'Velocidad · reconocer una etiqueta'},v);
  const mapping=[['○','A'],['□','B']],sequence=level===1?'○':level===2?'○ □':'□ ○';
  const correct=sequence.split(' ').map(s=>mapping.find(r=>r[0]===s)[1]).join(' ');
  add('speed.translation','abstract_pattern','Cambia cada figura por su letra. Mantén el orden.',[table(mapping),T(sequence)],correct,['A','B','A B','B A'].filter(x=>x!==correct).slice(0,2),{speedTask:true,speedFamily:'translation',speedRevision:4,topic:'Velocidad · usar una clave'},v);
 }
 if(domain==='english'&&rank>=2){
  const english=[
   ['english.vocabulary','community.library',[
    ['The notice says: Borrow up to two books.','What does borrow mean here?','Take temporarily and return',['Buy and keep','Throw away']],
    ['You may renew the loan online before it expires.','What does renew mean here?','Extend the borrowing period',['Change the owner','Cancel the library card']],
    ['The revised notice supersedes the earlier one.','What does supersedes mean here?','Replaces the earlier notice',['Confirms every earlier detail','Repeats it without changes']]
   ]],
   ['english.grammar','school.club',[
    ['Mia plays on Tuesdays. Today is Tuesday.','Complete: Mia ___ today.','plays',['play','playing']],
    ['Yesterday the club met outside.','Complete: Yesterday we ___ outside.','met',['meet','will meet']],
    ['The activity has not started. You are discussing a possible change.','Complete: If it rains tomorrow, we ___ indoors.','will meet',['met','have met']]
   ]],
   ['english.connector','home.planning',[
    ['It is cold. Take a coat.','Complete: It is cold, ___ take a coat.','so',['but','although']],
    ['The room is small. It has enough seats.','Which connector shows the contrast?','but',['because','so']],
    ['We can use the room only if someone confirms the booking.','Which phrase keeps the condition?','Provided that the booking is confirmed',['Even though no one books','Regardless of confirmation']]
   ]],
   ['english.sequence','home.cooking',[
    ['First wash the apple. Then cut it.','What should you do first?','Wash the apple',['Cut the apple','Serve the apple']],
    ['Wash the apple, cut it, then put the pieces in the bowl.','What comes immediately before using the bowl?','Cut the apple',['Wash the apple','Serve the bowl']],
    ['Cut the fruit after washing it. Chill the bowl before adding the fruit.','Which action must happen before cutting?','Wash the fruit',['Add fruit to the bowl','Serve the chilled bowl']]
   ]],
   ['english.time','school.club',[['The club starts at 4:00. You arrive at 3:50.','How many minutes early are you?','10 minutes',['5 minutes','20 minutes']],['The club starts at 4:15. You arrive at 3:55.','How many minutes early are you?','20 minutes',['15 minutes','25 minutes']],['The club starts at 4:15. Walking takes 20 minutes.','What is the latest time to leave and arrive at the start?','3:55',['4:00','4:15']]]],
   ['english.inference','home.weather',[['Sam takes an umbrella. It is raining.','Why does Sam need the umbrella?','To stay dry',['To carry books','To see the time']],['Sam checks the dark clouds and puts an umbrella in the bag.','What is Sam probably preparing for?','Rain',['An indoor meal','A video call']],['The sky is clear now, but the forecast says rain at five. Sam takes an umbrella.','Which information explains the decision?','The later weather forecast',['Only the clear sky now','The colour of the bag']]]],
   ['english.intent','school.project',[['Please bring your notebook tomorrow.','What is the message asking you to bring?','Your notebook',['Your lunch','Your phone']],['Please send the photo before Friday so we can finish the poster.','What does the group need?','The photo before Friday',['A new poster on Friday','A photo after the deadline']],['Could you confirm the new meeting point? The old message may be out of date.','What should your reply do?','Confirm which meeting point is current',['Repeat the old point without checking','Change the meeting time']]]],
   ['english.evidence','community.notice',[['The library opens at ten.','Which statement matches the notice?','It opens at 10:00',['It opens at 9:00','It closes at 10:00']],['The workshop is free, but booking is required.','Which statement matches both conditions?','You must book, but you do not pay',['No booking is needed','Booking always costs money']],['The bus normally takes 20 minutes. Roadworks may add 10 minutes today.','Which statement is supported?','Allow extra time today',['The bus always takes exactly 30 minutes','The service is cancelled']]]],
   ['english.location','school.materials',[['The scissors are under the blue box.','Where are the scissors?','Under the blue box',['Inside the blue box','Above the blue box']],['The camera is on the shelf beside the door, not on the desk.','Where should you look?','On the shelf beside the door',['On the desk','Behind the door']],['The notice says the room is upstairs. The update moves the meeting to the ground floor.','Which location should you use?','The ground floor',['The upstairs room','The roof']]]]
  ];
  for(const [family,scenario,versions] of english){const [source,q,a,wrong]=versions[level-1];add(family,scenario,q,[T(source)],a,wrong,{topic:'English Lab · messages for everyday plans'});}
 }
 if(domain==='social'){
  const social=[
   ['social.boundary',[['La libreta es de otra persona. Aún no te ha dado permiso.','¿Qué necesitas antes de cogerla?','Pedir permiso',['Elegir una página','Mirar la fecha']],['Te prestan una libreta, pero te piden no escribir en ella.','¿Qué opción respeta el acuerdo?','Leerla y devolverla sin escribir',['Escribir y borrar después','Dejar una nota en una página']],['Te permiten usar una foto en el trabajo de clase, pero no publicarla.','¿Qué uso respeta el permiso?','Incluirla solo en el trabajo de clase',['Publicarla porque ya la tienes','Mandarla a un grupo ajeno al trabajo']]]],
   ['social.help',[['No sabes dónde está el aula. Hay una persona que puede orientarte.','¿Qué pregunta explica lo que necesitas?','¿Dónde está esta aula?',['¿Te gusta esta aula?','¿Cuántas aulas hay?']],['No entiendes el segundo paso, pero sí el primero.','¿Qué petición ayuda a continuar?','¿Puedes explicar el segundo paso?',['¿Puedes repetirlo todo sin más?','¿Podemos cambiar de tarea?']],['Has probado dos soluciones y el archivo sigue sin abrirse.','¿Qué mensaje permite ayudar mejor?','Explicar el fallo y las dos pruebas realizadas',['Decir solo que no funciona','Pedir que lo arreglen sin indicar qué archivo es']]]],
   ['social.repair',[['Has pisado una hoja sin querer. La otra persona lo ha visto.','¿Qué puedes decir para empezar a repararlo?','Lo siento. ¿Te ayudo a recogerla?',['No me hables de la hoja','Recógela tú cuando termines']],['Una broma tuya ha molestado a otra persona. No era tu intención.','¿Qué respuesta reconoce lo ocurrido?','No quería molestarte. Entiendo que te haya sentado mal',['Era una broma, así que no importa','Si yo me reí, tú también debes hacerlo']],['Has enviado una información equivocada al grupo. Ya sabes cuál es la correcta.','¿Cómo puedes corregir el malentendido?','Avisar del error y enviar el dato corregido',['Borrar tu copia sin decir nada','Esperar a que el grupo lo descubra']]]],
   ['social.perspective',[['Mar no vio dónde guardaste la pelota. Tú sí lo sabes.','¿Qué información necesita Mar?','Dónde guardaste la pelota',['De qué color es su mochila','Quién llegó primero']],['Has cambiado la hora del ensayo. Una compañera solo ha leído el aviso antiguo.','¿Qué necesita para organizarse?','Un aviso con la nueva hora',['Que le repitan la hora antigua','Una lista de quienes ya lo saben']],['Dos grupos han recibido versiones distintas de un plan. Ambos creen tener la última.','¿Qué ayuda a decidir con la misma información?','Comparar la fecha y confirmar la versión vigente',['Elegir la versión del grupo más grande','Dar por hecho que el otro grupo se equivoca']]]],
   ['social.intent',[['Una persona señala una silla y dice: «Puedes sentarte aquí».','¿Qué está ofreciendo?','Un sitio para sentarte',['Que muevas todas las sillas','Que esperes fuera']],['Una persona pregunta si necesitas ayuda mientras recoges una caja pesada.','¿Qué intención está mejor apoyada?','Ofrecer ayuda con la caja',['Decidir que la caja es suya','Pedir que termines más deprisa']],['Un mensaje dice «Cuando puedas, revisamos esto». No indica una hora.','¿Qué interpretación evita inventar una exigencia?','Propone revisarlo, pero conviene acordar cuándo',['Exige una respuesta inmediata','Da por cancelada la revisión']]]],
   ['social.cooperation',[['Dos personas quieren usar el mismo juego. Pueden jugar por turnos.','¿Qué acuerdo permite participar a las dos?','Un turno para cada una',['Que una juegue todo el rato','Guardar el juego sin hablar']],['El grupo debe preparar un cartel. Una persona dibuja y otra escribe.','¿Qué conviene acordar antes?','Qué parte hará cada una y cómo unirlas',['Que cada una haga un cartel distinto','Que una rehaga todo al final']],['El plazo se ha acortado y una parte del trabajo está duplicada.','¿Qué ajuste ayuda a terminar juntos?','Repartir las tareas pendientes y evitar duplicar esa parte',['Seguir duplicando todo','Cambiar el objetivo sin avisar al grupo']]]],
   ['social.emotion',[['Pau dice: «Estoy triste porque se ha roto mi dibujo».','¿Qué pista te dice cómo se siente?','Ha dicho que está triste',['El tamaño de la mesa','El color del papel']],['Una persona se queda callada tras recibir una noticia. No ha dicho cómo se siente.','¿Qué respuesta evita darlo por seguro?','Preguntarle cómo se encuentra',['Afirmar que está enfadada','Afirmar que está contenta']],['Un compañero no participa hoy. Puede haber varias razones y no las conoces.','¿Qué interpretación es más prudente?','No asumir el motivo y ofrecer hablar si quiere',['Asegurar que no le interesa el grupo','Decidir que quiere dejar la actividad']]]],
   ['social.nonliteral',[['Ana dice «voy volando» y empieza a caminar deprisa hacia la puerta.','¿Qué quiere decir con esa expresión?','Que va muy deprisa',['Que va a esperar','Que no va a ir']],['Leo ha caminado mucho. Dice «No puedo dar un paso más». Pide descansar.','¿Qué está comunicando?','Que está muy cansado y quiere descansar',['Que quiere empezar otra ruta','Que acaba de llegar descansado']],['El mensaje «qué puntual» llega después de que hayas entrado tarde. No conoces el tono.','¿Qué conviene comprobar?','Si es una observación irónica antes de interpretarla',['Que siempre es un elogio literal','Que confirma que llegaste temprano']]]]
  ];
  for(const [family,versions] of social){
   // Young children use concrete cues. Older levels add uncertainty or competing conditions.
   const index=age==='early'?Math.min(level-1,1):level-1;const [source,q,a,wrong]=versions[index];
   add(family,'shared_activity',q,[T(source)],a,wrong,{topic:'Social Lab · comprender y convivir',why:quality.registry[family].functionalPurpose+'.'});
  }
 }

 if(domain==='attention'&&age==='early'){
  const rows=[
   ['attention.conditions','school.materials','Elige una caja lista y cerrada.',[['Caja A','Lista, abierta'],['Caja B','Lista, cerrada']],'La caja B',['La caja A']],
   ['attention.conditions','home.snack','Elige una botella llena y con tapa.',[['Botella A','Llena, sin tapa'],['Botella B','Llena, con tapa']],'La botella B',['La botella A']],
   ['attention.omission','school.materials','¿Qué falta en la lista 2?',[['Lista 1','Papel, lápiz, goma'],['Lista 2','Papel, goma']],'El lápiz',['El papel','La goma']],
   ['attention.omission','home.snack','¿Qué falta en la lista 2?',[['Lista 1','Pan, leche, fruta'],['Lista 2','Pan, fruta']],'La leche',['El pan','La fruta']],
   ['attention.instructions','school.materials','La nota pide la última caja. ¿Cuál eliges?',[['Primera','Caja A'],['Última','Caja B']],'La caja B',['La caja A']],
   ['attention.instructions','home.snack','La nota pide el primer plato. ¿Cuál eliges?',[['Primero','Plato A'],['Último','Plato B']],'El plato A',['El plato B']],
   ['attention.document_lookup','school.schedule','¿Qué día hay dibujo?',[['Dibujo','Lunes'],['Música','Martes']],'Lunes',['Martes']],
   ['attention.document_lookup','home.schedule','¿Qué día hay sopa?',[['Sopa','Lunes'],['Arroz','Martes']],'Lunes',['Martes']]
  ];
  for(const [f,sc,q,sourceRows,a,w] of rows)add(f,sc,q,[table(sourceRows)],a,w,{ageProfile:{id:'early',revision:1,context:'school',mechanic:'matching',family:'functional-'+f},topic:'Atención · comprobar información'});
 }
 if(domain==='language'&&age==='early'){
  for(const [sc,words] of [['home.routines',['El','gato','duerme']],['school.routines',['La','niña','dibuja']]])add('language.sentence_order',sc,'Ordena las palabras para formar una frase.',[L(words)],undefined,[],{type:'order',responseType:'order',tokens:[...words].reverse(),answer:words,ageProfile:{id:'early',revision:1,context:'school',mechanic:'sentence',family:'functional-language.sentence_order'},topic:'Lenguaje · construir frases'});
 }

 if(domain==='executive'&&age==='early'){
  const rows=[
   ['executive.conditions','¿Qué abrigo puedes usar?','Necesitas un abrigo seco y de tu talla.','A: seco, de tu talla. B: mojado, de tu talla.','El abrigo A',['El abrigo B']],
   ['executive.resources','¿Qué bandeja tiene todo para merendar?','Necesitas un vaso y un plato.','A: solo vaso. B: vaso y plato.','La bandeja B',['La bandeja A']],
   ['executive.update','¿Qué debes preparar ahora?','Ibas a hacer un dibujo. Se acaba el papel. Ahora jugarás con bloques.','El dibujo queda para después.','Los bloques',['El papel para dibujar']],
   ['executive.time','¿Qué puedes terminar antes de cenar?','Faltan dos minutos para cenar.','Guardar un juguete: un minuto. Montar la pista: diez minutos.','Guardar un juguete',['Montar la pista']]
  ];
  for(const [f,q,s,t,a,w] of rows)add(f,'home.routines',q,[T(s),T(t)],a,w,{topic:'Organizar · rutinas de casa'});
 }
 if(domain==='social'){
  const cases=[
   ['social.boundary','Tu hermano quiere estar solo un rato. Te pide que llames antes de entrar.','¿Qué respeta su petición?','Llamar y esperar respuesta',['Entrar sin esperar','Abrir para ver qué hace']],
   ['social.help','No llegas al estante donde está tu vaso. Hay una persona adulta cerca.','¿Qué petición explica lo que necesitas?','¿Me ayudas a coger mi vaso?',['¿Cuántos vasos hay?','¿Te gusta el estante?']],
   ['social.repair','Has derramado agua en la mesa compartida. La otra persona sigue dibujando.','¿Qué ayuda a reparar lo ocurrido?','Avisar y ayudar a secar la mesa',['Tapar el agua con su dibujo','Esperar sin avisar']],
   ['social.perspective','Han cambiado de sitio las llaves. Quien acaba de llegar no lo sabe.','¿Qué información necesita?','Dónde están ahora las llaves',['Cuántas puertas hay','Dónde estaban antes']],
   ['social.intent','Al poner la mesa te dicen: «¿Puedes acercarme ese plato?».','¿Qué te están pidiendo?','Que acerques el plato',['Que guardes todos los platos','Que empieces a comer']],
   ['social.cooperation','Vais a recoger juntos. Hay juguetes y libros fuera de su sitio.','¿Qué acuerdo permite colaborar?','Acordar quién guarda cada cosa',['Guardar solo lo que usa uno','Cambiar todo de sitio sin hablar']],
   ['social.emotion','Una persona dice: «Me preocupa perder el autobús».','¿Qué pista expresa cómo se siente?','Dice que le preocupa perderlo',['El color del autobús','El tamaño de la parada']],
   ['social.nonliteral','Al ver muchos platos sucios, alguien dice: «Tenemos una montaña de platos».','¿Qué quiere decir?','Que hay muchos platos',['Que los platos están en el monte','Que hay que salir de casa']]
  ];
  for(const [f,source,q,a,w] of cases)add(f,'home.shared_activity',q,[T(source)],a,w,{topic:'Social Lab · convivencia en casa',why:quality.registry[f].functionalPurpose+'.'});
 }
 // Remove duplicate numeric alternatives and regenerate only an unambiguous numeric foil.
 for(const it of items){
  if(it.type==='order'||it.memoryResponse==='order'){delete it.opts;delete it.a;}
  else if(it.opts){it.opts=[...new Set(it.opts.filter(x=>x!==undefined))];if(it.opts.length<2)throw Error('Missing distractor '+it.id);}
 }
 const unique=[],seen=new Set();
 for(const it of items){const source=JSON.stringify([it.q,it.stimulus,it.a,it.answer,it.memoryQuestion,it.memoryContent]);let h=2166136261;for(const ch of source)h=Math.imul(h^ch.charCodeAt(0),16777619);it.semanticKey='functional-source-'+(h>>>0).toString(16);if(['reading','literacy'].includes(domain)){let sh=2166136261;for(const ch of JSON.stringify(it.stimulus))sh=Math.imul(sh^ch.charCodeAt(0),16777619);it.passageKey='functional-reading:'+(sh>>>0).toString(16);}if(domain==='memory'){let a=2166136261,b=2246822519;for(const ch of JSON.stringify(['sequence',it.stimulus])){a=Math.imul(a^ch.charCodeAt(0),16777619);b=Math.imul(b^ch.charCodeAt(0),3266489917);}it.memoryMaterialKey=(a>>>0).toString(16)+(b>>>0).toString(16);}
 if(!seen.has(source)){seen.add(source);unique.push(it);}}
 cache.set(key,unique);return structuredClone(unique);
}
function validate(item){
 const e=item?.qualityEvidence;if(!e||!ages.includes(e.age)||item.domain!==e.domain||item.level!==e.level)throw Error('Falta el contrato funcional revisado.');
 const key=[e.age,e.domain,e.level].join(':');if(!cache.has(key))pool(e.age,e.domain,e.level);
 const canonical=cache.get(key)?.find(x=>x.contentKey===e.id);if(!canonical)throw Error('La familia funcional no está registrada.');
 const locale=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
 const expected=item.localization?locale.localizeItem(canonical,item.localization.locale,item.domain):canonical;
 for(const field of ['q','stimulus','a','answer','memoryQuestion','memoryContent','type','responseType','qualityDescriptor','recallEvidence','currencyContext','ageProfile','juniorProfile','schoolProfile','teenReview','speedTask','speedFamily','speedRevision'])if(JSON.stringify(item[field])!==JSON.stringify(expected[field]))throw Error('La respuesta no coincide con la fuente funcional: '+field);
 for(const field of ['opts','tokens'])if(JSON.stringify([...(item[field]||[])].sort())!==JSON.stringify([...(expected[field]||[])].sort()))throw Error('Opciones funcionales modificadas.');
 return true;
}
function generate(age,domain,level){const key=[age,domain,level].join(':');if(!cache.has(key))pool(age,domain,level);const bank=cache.get(key)||[];return bank.length?structuredClone(bank[Math.floor(Math.random()*bank.length)]):null;}
const api={pool,generate,validate};root.FunctionalContent=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

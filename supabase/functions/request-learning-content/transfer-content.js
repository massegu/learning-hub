(function(root){
'use strict';
// Reviewed backlog from the phase-one inventory. These records add contexts, not families.
const targets={"early/social":["social.literal"],"early/language":["language.context_meaning","language.opposites","language.spelling","language.phonology","language.agreement","language.structure"],"early/division":["math.count","math.add","math.subtract","math.compare","math.sequence"],"early/reading":["reading.compose"],"early/attention":["attention.exact_match","attention.count"],"early/executive":["executive.supervise","executive.reason"],"early/speedReasoning":["speed.compare","speed.category","speed.search","speed.pairs","speed.flanker"],"junior/language":["language.description","language.tense","language.reference"],"junior/division":["math.add","math.equal_groups","math.share","math.sequence","math.data","math.missing_value"],"junior/attention":["attention.position","attention.omission","attention.relevance","attention.count"],"junior/executive":["executive.conditions","executive.resources","executive.time","executive.update","executive.resume"],"junior/speedReasoning":["speed.pairs","speed.category","speed.agenda","speed.flanker","speed.compare","speed.translation","speed.crossed_keys","speed.match","speed.rule","speed.key","speed.search"],"primary/social":["social.literal"],"primary/language":["language.description","language.tense","language.reference","language.structure"],"primary/division":["math.add","math.equal_groups","math.share","math.sequence","math.data","math.missing_value"],"primary/literacy":["reading.request","reading.instructions","reading.summary","reading.evidence_caption","reading.directions","reading.fact_opinion","reading.correction","reading.recommendation","reading.invitation"],"primary/executive":["executive.update","executive.conditions"],"primary/speedReasoning":["speed.compare","speed.rule","speed.agenda","speed.flanker","speed.crossed_keys","speed.translation","speed.key","speed.category","speed.pairs","speed.search","speed.match"],"middle/middleLanguage":["language.description","language.tense","language.reference","language.structure","language.spelling","language.context_meaning","language.opposites"],"middle/middleMath":["math.equations","math.percent","math.average","math.probability","math.proportion","math.area"],"middle/literacy":["reading.request","reading.instructions","reading.directions","reading.correction","reading.evidence_caption","reading.compare_sources","reading.recommendation","reading.summary","reading.fact_opinion","reading.invitation","reading.advert"],"middle/attention":["attention.conditions","attention.position","attention.omission","attention.count","attention.relevance","attention.exact_match"],"middle/executive":["executive.reason","executive.time","executive.resume","executive.conditions","executive.resources","executive.update"],"middle/speedReasoning":["speed.search","speed.compare","speed.pairs","speed.flanker","speed.key","speed.category","speed.translation","speed.match","speed.rule","speed.agenda","speed.crossed_keys"],"teen/teenLanguage":["language.description","language.tense","language.reference","language.structure","language.spelling","language.opposites","language.context_meaning"],"teen/teenMath":["math.equations","math.percent","math.average","math.probability","math.proportion","math.area"],"teen/social":["social.impact"],"teen/literacy":["reading.request","reading.recommendation","reading.summary","reading.compare_sources","reading.correction","reading.fact_opinion","reading.evidence_caption","reading.advert","reading.instructions","reading.invitation","reading.directions"],"teen/attention":["attention.conditions","attention.position","attention.count","attention.exact_match","attention.instructions"],"teen/executive":["executive.reason","executive.resources","executive.update","executive.conditions","executive.time"],"teen/speedReasoning":["speed.compare","speed.flanker","speed.agenda","speed.key","speed.crossed_keys","speed.translation","speed.category","speed.match","speed.rule","speed.search","speed.pairs"]};
function extend({age,domain,level,add,T,L,table}){
 const wanted=new Set(targets[age+'/'+domain]||[]);if(!wanted.size)return;
 const early=age==='early',young=early||age==='junior',rank=['early','junior','primary','middle','teen'].indexOf(age);
 function emit(family,scenario,q,stimulus,a,wrong,extra={}){if(!wanted.has(family))return;const focus=family==='language.spelling'?'spelling':['language.context_meaning','language.opposites'].includes(family)?'vocabulary':'grammar';const mechanic=({language:'sentence',reading:extra.type==='order'?'sequencing':'literal',division:'compare',attention:'matching',executive:'organisation',speedReasoning:'speedCompare',social:'perspective'})[domain];add(family,scenario,q,stimulus,a,wrong,{topic:'Práctica funcional · '+({language:'comunicar con claridad',middleLanguage:'comunicar con claridad',teenLanguage:'comunicar con claridad',reading:'mensajes útiles',literacy:'mensajes útiles',division:'cantidades cotidianas',middleMath:'calcular para decidir',teenMath:'calcular para decidir',attention:'revisar información',executive:'organizarse',speedReasoning:'comprobar con agilidad',social:'comprender situaciones'})[domain],...(['language','middleLanguage','teenLanguage'].includes(domain)?{languageFocus:focus}:{}),...(early?{ageProfile:{id:'early',revision:1,context:scenario.startsWith('home')?'family':'school',mechanic,family:'functional-'+family}}:{}),...extra});}
 if(['division','middleMath','teenMath'].includes(domain))for(const home of [false,true]){
  const sc=home?'home.planning':'community.club',n=early?level+1:level+rank+2,m=level+1;
  const objects=home?'vasos para la merienda':'pinceles para el taller';
  emit('math.count',sc,'¿Cuántos '+(home?'vasos':'pinceles')+' debes preparar?',[T('Cada círculo representa uno de los '+objects+'.'),L(Array(n).fill('○'))],String(n),[String(n+1),String(n-1)],{difficultyParameters:{elements:n}});
  const extra=level===3?1:0,total=n+m+extra;
  emit('math.add',sc,'¿Cuántos hay ahora en total?',[T(`Preparas ${n} ${home?'vasos':'pinceles'}. Añades ${m} más.${extra?' Después añades uno más.':''}`)],String(total),[String(total-1),String(total+1)],{difficultyParameters:{addends:extra?3:2},why:`En total hay ${total}.`});
  const remove=level,again=level===3?1:0;
  emit('math.subtract',sc,'¿Cuántos quedan por guardar?',[T(`Hay ${n+2} ${home?'juguetes fuera de su caja':'libros sobre la mesa'}. Guardas ${remove}.${again?' Después guardas otro.':''}`)],String(n+2-remove-again),[String(n+2-remove),String(n+3-remove-again)].filter(x=>x!==String(n+2-remove-again)),{difficultyParameters:{subtractions:again?2:1}});
  emit('math.compare',sc,level===3?'¿Qué grupo tiene más después del cambio?':'¿Qué grupo tiene más?',[
   T(home?'Revisas las raciones de dos bandejas.':'Revisas las piezas de dos equipos.'),table([['A',String(n)],['B',String(n+1)]]),...(level===3?[T('Añades dos al grupo A. El grupo B no cambia.')]:[])
  ],level===3?'A':'B',[level===3?'B':'A','Son iguales'],{difficultyParameters:{updates:level===3?1:0}});
  const step=level===1?1:level===2?2:3,start=level+1,answer=start+3*step;
  emit('math.sequence',sc,'¿Qué número sigue para mantener el mismo ritmo?',[T(home?'Anotas cuántas piezas llevas guardadas tras cada turno.':'Anotas cuántas tarjetas lleva el equipo tras cada turno.'),L([start,start+step,start+2*step].map(String))],String(answer),[String(answer+1),String(answer-step)],{difficultyParameters:{step}});
  const groups=level+1,perGroup=n,product=groups*perGroup;
  emit('math.equal_groups',sc,'¿Cuántas piezas se necesitan en total?',[T(home?`Preparas ${groups} bolsas de regalo. Cada bolsa lleva ${perGroup} piezas.`:`Hay ${groups} equipos en el taller. Cada equipo necesita ${perGroup} piezas.`)],String(product),[String(groups+perGroup),String(product+perGroup)].filter(x=>x!==String(product)),{difficultyParameters:{groups,groupSize:perGroup}});
  const people=level+1,quotient=rank+3,remainder=level===3?1:0,stock=people*quotient+remainder;
  emit('math.share',sc,level===3?'¿Qué reparto igual deja el resto más pequeño?':'¿Cuántas piezas recibe cada persona si todas reciben lo mismo?',[T(home?`Repartes ${stock} galletas enteras entre ${people} personas.`:`Repartes ${stock} tarjetas enteras entre ${people} participantes.`)],`${quotient} para cada persona${remainder?' y sobra 1':''}`,[`${quotient+1} para cada persona`,`${quotient-1} para cada persona`],{difficultyParameters:{divisor:people,remainder}});
  const target=n*3,stored=n,second=level===3?2:0,missing=target-stored-second;
  emit('math.missing_value',sc,'¿Qué cantidad falta para completar el plan?',[T(home?`Necesitas ${target} piezas para terminar el montaje. Ya tienes ${stored}.`:`El club necesita ${target} fichas para la actividad. Ya tiene ${stored}.`),...(second?[T('Otra caja aporta dos piezas más.')]:[])],String(missing),[String(missing+1),String(missing-1)],{difficultyParameters:{knownContributions:second?2:1}});
  const data=[n,n+2,n+4],dataAnswer=level===1?data[1]:level===2?data[2]-data[0]:data[0]+data[2];
  emit('math.data',sc,level===1?'¿Qué cantidad figura en la segunda fila?':level===2?'¿Cuántas más hay en la tercera fila que en la primera?':'¿Cuántas suman la primera y la tercera fila?',[T(home?'Consultas lo que queda en tres cajas de material.':'Consultas las tarjetas de tres equipos del club.'),table(data.map((v,i)=>['Grupo '+(i+1),String(v)]))],String(dataAnswer),[String(dataAnswer+1),String(dataAnswer-1)],{difficultyParameters:{sourceCells:level===1?1:2,operation:['lookup','difference','sum'][level-1]}});
  const unknown=level+3,fixed=level===1?0:5,multiplier=level+1,discount=level===3?3:0,spent=unknown*multiplier+fixed-discount;
  emit('math.equations',sc,'¿Cuántos puntos cuesta cada kit?',[T(home?`En un juego canjeas ${multiplier} kits iguales y gastas ${spent} puntos.`:`El club canjea ${multiplier} kits iguales y gasta ${spent} puntos.`),...(fixed?[T(`Del total, ${fixed} puntos corresponden a ${level===3?'la entrega':'una bolsa aparte'}.`)]:[]),...(level===3?[T('El importe pagado ya incluye un bono de tres puntos descontados.')]:[])],String(unknown),[String(unknown+1),String(unknown-1)],{difficultyParameters:{operations:level,couponReversal:level===3}});
  const price=[100,80,75][level-1],percent=[10,25,20][level-1],shipping=level===3?3:0,paid=price*(1-percent/100)+shipping;
  emit('math.percent',sc,'¿Cuál es el importe final que se paga?',[T(`En España, ${home?'una compra para casa':'la entrada del taller'} cuesta ${price} €. Tiene un descuento del ${percent}%.`),...(shipping?[T(`Después se añaden ${shipping} € de gastos.`)]:[])],paid+' €',[(paid+1)+' €',price+' €'],{currencyContext:'foreign',difficultyParameters:{percent,operations:shipping?3:2}});
  const samples=level===1?[8,10]:level===2?[8,10,12]:[8,10,12,100],average=level===1?9:10;
  emit('math.average',sc,'¿Cuál es la media de los tiempos válidos?',[T(home?'Anotas los minutos que tardas en preparar una receta.':'Anotas los minutos de una prueba del taller.'),L(samples.map(v=>v+' min')),...(level===3?[T('El registro de 100 minutos es un error. Exclúyelo antes de calcular.')]:[])],String(average)+' min',[(average+1)+' min',(average-1)+' min'],{difficultyParameters:{dataPoints:samples.length,excludedValues:level===3?1:0}});
  const likely=home?'Avanzar':'Premio',other=home?'Esperar':'Sin premio';
  const probability=level===1?likely:level===2?'3 de 6':'2 de 5';
  emit('math.probability',sc,level===1?'¿Qué resultado es más probable?':level===2?'¿Qué probabilidad tiene el resultado señalado?':'¿Qué probabilidad tiene ahora el resultado señalado?',[T(home?'En un juego sacas una tarjeta al azar. Todas son iguales por detrás.':'En el club sacas un boleto al azar. Todos son iguales por detrás.'),table([[likely,'3'],[other,level===1?'1':'3']]),...(level>=2?[T('El resultado señalado es «'+likely+'».')]:[]),...(level===3?[T('Ya salió uno de ese resultado. No lo devuelves antes de sacar otro.')]:[])],probability,level===1?[other,'Son igual de probables']:level===2?['3 de 3','1 de 6']:['3 de 6','3 de 5'],{difficultyParameters:{conditional:level===3,sampleSpace:level===1?4:level===2?6:5}});
  const base=level===3?4:2,desired=level===1?4:6,amount=base*2,scaled=desired*2;
  emit('math.proportion',sc,'¿Cuántas unidades necesitas manteniendo la misma proporción?',[T(home?`Una receta para ${base} personas usa ${amount} medidas de harina. La preparas para ${desired} personas.`:`Para ${base} maquetas hacen falta ${amount} hojas. Preparas ${desired} maquetas iguales.`)],String(scaled),[String(scaled+2),String(amount)],{difficultyParameters:{scale:desired/base}});
  const area=level===1?12:level===2?20:16;
  emit('math.area',sc,'¿Qué superficie debes cubrir?',[
   T(home?'Renuevas una zona del suelo de casa.':'Preparas una zona para el taller del club.'),
   T(level===1?'Es un rectángulo de 3 por 4 metros.':level===2?'Son dos rectángulos sin solaparse: uno de 3 por 4 y otro de 2 por 4 metros.':'Es un rectángulo de 5 por 4 metros. Una zona de 2 por 2 queda sin cubrir.')
  ],area+' m²',[(area+4)+' m²',(area-2)+' m²'],{difficultyParameters:{operations:level,excludedArea:level===3?4:0}});
 }
 if(['language','middleLanguage','teenLanguage'].includes(domain))for(const home of [false,true]){
  const sc=home?'home.messages':'school.notices';
  const agreement=home?[
   ['Dejas una nota: «El vaso ___ limpio».','está',['están','estamos']],
   ['Dejas una nota: «Los vasos ___ limpios».','están',['está','estamos']],
   ['Dejas una nota: «La caja de vasos ___ en la mesa».','está',['están','estamos']]
  ]:[
   ['Escribes al club: «El equipo ___ mañana».','entrena',['entrenan','entrenamos']],
   ['Escribes al club: «Los equipos ___ mañana».','entrenan',['entrena','entrenamos']],
   ['Escribes al club: «El equipo de jugadoras ___ mañana».','entrena',['entrenan','entrenamos']]
  ];
  let [source,a,wrong]=agreement[level-1];emit('language.agreement',sc,'¿Qué palabra completa bien el mensaje?',[T(source)],a,wrong,{difficultyParameters:{plural:level===2,interveningNoun:level===3}});
  let description=home?[
   ['Necesitas el vaso pequeño. El grande ya está guardado.','El vaso pequeño',['El vaso grande','Cualquier vaso']],
   ['Necesitas las cajas pequeñas y vacías. Las grandes están llenas.','Las cajas pequeñas y vacías',['Las cajas pequeñas y llenas','Las cajas grandes y vacías']],
   ['Hay cajas pequeñas llenas y vacías. Necesitas solo las pequeñas que estén vacías.','Las cajas pequeñas y vacías',['Todas las cajas pequeñas','Todas las cajas vacías']]
  ]:[
   ['Pides el cuaderno de tapa dura. El de tapa blanda no sirve para la actividad.','El cuaderno de tapa dura',['El cuaderno de tapa blanda','Cualquier cuaderno']],
   ['Pides las carpetas nuevas y grandes. Las pequeñas son nuevas pero no sirven.','Las carpetas nuevas y grandes',['Las carpetas nuevas y pequeñas','Todas las carpetas nuevas']],
   ['Hay carpetas grandes usadas y nuevas. Necesitas las grandes que además sean nuevas.','Las carpetas grandes y nuevas',['Todas las carpetas grandes','Todas las carpetas nuevas']]
  ];
  if(rank>=3)description=home?[
   ['Necesitas el archivo vigente. La copia antigua ya no sirve.','El archivo vigente',['El archivo antiguo','Cualquier archivo']],
   ['Necesitas los archivos vigentes y editables. Los PDF vigentes no permiten los cambios.','Los archivos vigentes y editables',['Todos los archivos vigentes','Todos los archivos PDF']],
   ['Hay archivos editables antiguos y vigentes. Solo debes modificar la versión vigente y editable.','El archivo vigente y editable',['Cualquier archivo editable','Cualquier archivo vigente']]
  ]:[
   ['Pides la versión revisada del proyecto. El borrador aún tiene errores pendientes.','La versión revisada',['El borrador pendiente','Cualquier versión']],
   ['Pides las propuestas revisadas y viables. Algunas propuestas revisadas superan el presupuesto.','Las propuestas revisadas y viables',['Todas las propuestas revisadas','Todas las propuestas caras']],
   ['Hay propuestas viables sin revisar y propuestas revisadas inviables. Buscas una que reúna ambas condiciones.','Una propuesta revisada y viable',['Cualquier propuesta viable','Cualquier propuesta revisada']]
  ];
  [source,a,wrong]=description[level-1];emit('language.description',sc,'¿Qué descripción permite pedir exactamente lo necesario?',[T(source)],a,wrong,{difficultyParameters:{qualifiers:level===1?1:2,excludedGeneralization:level===3}});
  let tense=home?[
   ['La cena terminó ayer. Completa: «Ayer ___ juntos».','cenamos',['cenaremos','cenar']],
   ['La visita será mañana. Completa: «Mañana ___ a la abuela».','visitaremos',['visitamos ayer','visitábamos antes']],
   ['El ensayo de ayer terminó. El siguiente será mañana. Completa el aviso de mañana: «___ de nuevo».','Ensayaremos',['Ensayamos ayer','Ensayábamos antes']]
  ]:[
   ['La salida terminó ayer. Completa: «Ayer ___ al parque».','fuimos',['iremos','ir']],
   ['La salida será mañana. Completa: «Mañana ___ al museo».','iremos',['fuimos ayer','íbamos antes']],
   ['La reunión de ayer terminó. La siguiente será mañana. Completa el aviso nuevo: «Nos ___ mañana».','reuniremos',['reunimos ayer','reuníamos antes']]
  ];
  if(rank>=3)tense=home?[
   ['La solicitud se envió ayer. Completa: «Ayer ___ la solicitud».','enviamos',['enviaremos','enviar']],
   ['La cita está prevista para mañana. Completa: «Mañana ___ la hora por mensaje».','confirmaremos',['confirmamos ayer','confirmábamos antes']],
   ['La solicitud ya se envió. La respuesta llegará mañana. Completa la acción que falta: «Mañana ___ la respuesta».','recibiremos',['recibimos ayer','recibíamos antes']]
  ]:[
   ['El grupo presentó el trabajo ayer. Completa: «Ayer ___ el proyecto».','presentamos',['presentaremos','presentar']],
   ['La exposición se celebrará mañana. Completa: «Mañana ___ los resultados».','explicaremos',['explicamos ayer','explicábamos antes']],
   ['La primera revisión terminó ayer. La entrega será mañana. Completa la acción pendiente: «Mañana ___ la versión final».','entregaremos',['entregamos ayer','entregábamos antes']]
  ];
  [source,a,wrong]=tense[level-1];emit('language.tense',sc,'¿Qué expresión sitúa la acción en el momento indicado?',[T(source)],a,wrong,{difficultyParameters:{timeReferences:level===3?2:1}});
  let reference=home?[
   ['Ana dejó el vaso en la mesa. Después ella salió.','¿A quién se refiere «ella»?','Ana',['El vaso','La mesa']],
   ['Ana dio el vaso a Leo. Él lo dejó en la mesa.','¿A qué se refiere «lo»?','Al vaso',['A Ana','A Leo']],
   ['Ana habló con Lola. Después ella salió. El mensaje no dice nada más.','¿Se puede saber con seguridad quién salió?','No: puede referirse a Ana o a Lola',['Sí: solo puede ser Ana','Sí: solo puede ser Lola']]
  ]:[
   ['Leo trajo el cuaderno. Después él fue al patio.','¿A quién se refiere «él»?','Leo',['El cuaderno','El patio']],
   ['Leo dio el cuaderno a Ana. Ella lo guardó.','¿A qué se refiere «lo»?','Al cuaderno',['A Leo','A Ana']],
   ['Leo habló con Dani. Después él volvió al aula. El mensaje no aclara quién.','¿Se puede saber con seguridad quién volvió?','No: puede referirse a Leo o a Dani',['Sí: solo puede ser Leo','Sí: solo puede ser Dani']]
  ];
  if(rank>=3)reference=home?[
   ['Ana guardó el archivo después de revisarlo. Ella avisó al grupo.','¿A quién se refiere «ella»?','Ana',['El archivo','El grupo']],
   ['Ana envió el enlace a Leo. Él lo compartió con permiso.','¿A qué se refiere «lo»?','Al enlace',['A Ana','A Leo']],
   ['Ana comentó el cambio con Lola. Después ella confirmó la nueva hora. No se especifica quién.','¿Puede identificarse con seguridad quién confirmó la hora?','No: el mensaje admite las dos referencias',['Sí: necesariamente Ana','Sí: necesariamente Lola']]
  ]:[
   ['Leo revisó la propuesta y él presentó los cambios.','¿A quién se refiere «él»?','Leo',['La propuesta','Los cambios']],
   ['Leo envió el documento a Ana. Ella lo corrigió.','¿A qué se refiere «lo»?','Al documento',['A Leo','A Ana']],
   ['Leo comentó el resultado con Dani. Después él publicó la revisión. No se aclara quién.','¿Puede identificarse con seguridad quién la publicó?','No: el mensaje admite las dos referencias',['Sí: necesariamente Leo','Sí: necesariamente Dani']]
  ];
  const ref=reference[level-1];emit('language.reference',sc,ref[1],[T(ref[0])],ref[2],ref[3],{difficultyParameters:{referents:level===1?1:2,ambiguity:level===3}});
  let structure=home?[
   ['El vaso está encima de la mesa. Completa: «Está ___ la mesa».','sobre',['bajo','detrás de']],
   ['Llevas el vaso desde la cocina hasta el salón. Completa: «Lo llevo ___ la cocina».','desde',['hacia','hasta']],
   ['Ana entrega una caja a Leo. Completa sin cambiar quién la recibe: «Ana se la entrega ___».','a Leo',['a Ana','a nadie']]
  ]:[
   ['El cuaderno está debajo de la silla. Completa: «Está ___ la silla».','bajo',['sobre','delante de']],
   ['El grupo va desde el aula hasta el patio. Completa: «Vamos ___ el patio».','hacia',['desde','fuera de']],
   ['Leo entrega una carpeta a Ana. Completa sin cambiar quién la recibe: «Leo se la entrega ___».','a Ana',['a Leo','a nadie']]
  ];
  if(rank>=3)structure=home?[
   ['La confirmación llegó después de la solicitud. Completa: «La solicitud se envió ___ la confirmación».','antes de',['después de','al mismo tiempo que']],
   ['El mensaje parte de Ana y va dirigido a Leo. Completa: «Se ha enviado ___ Ana».','desde la cuenta de',['a la cuenta de','en respuesta a']],
   ['Ana entrega el permiso a Leo para que él recoja el pedido. Completa sin cambiar el destinatario: «Ana se lo da ___».','a Leo',['a Ana','al comercio']]
  ]:[
   ['La revisión precede a la entrega. Completa: «Se revisa ___ entregar».','antes de',['después de','en lugar de']],
   ['La propuesta parte del equipo A y se remite al equipo B. Completa: «Se envía ___ B».','al equipo',['desde el equipo','en nombre del equipo']],
   ['Leo envía la propuesta a Ana para que ella la revise. Completa sin cambiar la destinataria: «Leo se la envía ___».','a Ana',['a Leo','al remitente']]
  ];
  [source,a,wrong]=structure[level-1];emit('language.structure',sc,'¿Qué opción completa el mensaje manteniendo su significado?',[T(source)],a,wrong,{difficultyParameters:{relation:['position','direction','recipient'][level-1]}});
  let meanings=home?[
   ['El vaso es frágil. Se puede romper si cae.','¿Qué significa «frágil»?','Que se puede romper',['Que no puede romperse','Que está lleno']],
   ['Has bebido toda el agua. El vaso queda vacío.','¿Qué significa «vacío» aquí?','Que ya no tiene agua',['Que se ha roto','Que tiene más agua']],
   ['La jarra tiene agua hasta arriba. El vaso no tiene agua. La jarra está llena.','¿Qué significa «llena» para la jarra?','Que no cabe más agua',['Que no tiene agua','Que está rota']]
  ]:[
   ['La caja es frágil. Se rompe si la aplastas.','¿Qué significa «frágil»?','Que se puede romper',['Que no puede romperse','Que está llena']],
   ['Sacaste todos los lápices. El estuche queda vacío.','¿Qué significa «vacío» aquí?','Que ya no tiene lápices',['Que está roto','Que tiene más lápices']],
   ['La caja tiene piezas hasta arriba. La bolsa no tiene ninguna. La caja está llena.','¿Qué significa «llena» para la caja?','Que no caben más piezas',['Que no tiene piezas','Que está rota']]
  ];
  if(rank>=3)meanings=home?[
   ['El horario es provisional: puede cambiar cuando llegue la confirmación.','¿Qué significa «provisional» en este aviso?','Que aún puede cambiar',['Que ya es definitivo','Que no existe ningún horario']],
   ['Hay dos copias. Solo la fechada hoy está vigente; la anterior fue sustituida.','¿Qué significa «vigente» en este contexto?','Que es la copia que se aplica ahora',['Que es la copia más antigua','Que cualquier copia sigue siendo válida']],
   ['La aplicación admite este formato, pero requiere conexión. Se dice que el archivo es compatible.','¿Qué permite concluir «compatible» aquí?','Que admite el formato, respetando las demás condiciones',['Que funciona siempre sin conexión','Que todos los archivos sirven']]
  ]:[
   ['La fecha del ensayo es provisional: depende de que se confirme la sala.','¿Qué significa «provisional» en este aviso?','Que aún puede cambiar',['Que ya es definitiva','Que no hay ninguna fecha prevista']],
   ['El aviso nuevo sustituye al anterior. Solo el nuevo está vigente.','¿Qué significa «vigente» en este contexto?','Que es el aviso que se aplica ahora',['Que es el primer aviso publicado','Que ambos avisos se aplican a la vez']],
   ['La propuesta es viable con la sala y el material confirmados. Falta comprobar quién asistirá.','¿Qué significa «viable» dentro de lo que se ha comprobado?','Que puede realizarse con esos recursos',['Que ya se conoce toda la asistencia','Que tendrá éxito garantizado']]
  ];
  const meaning=meanings[level-1];emit('language.context_meaning',sc,meaning[1],[T(meaning[0])],meaning[2],meaning[3],{difficultyParameters:{contextClues:level}});
  let pairs=home?[['abrir','cerrar','lavar'],['vacío','lleno','limpio'],['permitido','prohibido','preparado']]:[['entrar','salir','caminar'],['lleno','vacío','nuevo'],['prohibido','permitido','guardado']];if(rank>=3)pairs=home?[['provisional','definitivo','revisado'],['opcional','obligatorio','disponible'],['parcial','completo','reciente']]:[['definitivo','provisional','conocido'],['obligatorio','opcional','pendiente'],['completo','parcial','actual']];const [word,opposite,foil]=pairs[level-1];
  emit('language.opposites',sc,'¿Qué palabra expresa lo contrario de «'+word+'»?',[T(home?'Revisas una nota para organizar las tareas de casa.':'Revisas un cartel para explicar las reglas del aula.')],opposite,[word,foil],{difficultyParameters:{contrast:['action','state','permission'][level-1]}});
  let spelling=home?[['casa','caza','cassa'],['vaso','baso','vasso'],['recoger','recojer','recoguer']]:[['gato','gatto','gatho'],['biblioteca','viblioteca','biblioteka'],['escoger','escojer','escoguer']];
  if(rank>=3)spelling=home?[['decisión','desición','decición'],['prevención','prebención','prevensión'],['excepción','escepción','exepción']]:[['revisión','rebisión','revisón'],['organización','organisación','horganización'],['conclusión','conclución','conclusón']];
  const [correct,...errors]=spelling[level-1];emit('language.spelling',sc,'Elige la palabra bien escrita para completar la nota.',[T(rank>=3?(home?['Debes comunicar tu ___ antes del viernes.','La nota recoge medidas de ___ para la salida.','Pide una ___ para el cambio de turno.'][level-1]:['Entrega la ___ del proyecto.','La ___ del evento corresponde al grupo.','Justifica la ___ con los datos recogidos.'][level-1]):home?['Vuelvo a ___.','Deja el ___ en la mesa.','Es hora de ___ los juguetes.'][level-1]:['El cuento trata de un ___.','Devuelve el libro a la ___.','Debes ___ un libro.'][level-1])],correct,errors,{languageFocus:'spelling',difficultyParameters:{rule:level}});
  const phonology=home?[
   ['Buscas una etiqueta que empiece como «pelota».','¿Qué palabra empieza con el mismo sonido?','pato',['gato','sapo']],
   ['Inventas una rima para una tarjeta de casa. La palabra es «pelota».','¿Qué palabra rima con «pelota»?','bota',['mesa','casa']],
   ['Quieres separar «mariposa» para leer la etiqueta.','¿Cómo se separa en sílabas?','ma-ri-po-sa',['mar-i-po-sa','ma-rip-o-sa']]
  ]:[
   ['Buscas una etiqueta que empiece como «goma».','¿Qué palabra empieza con el mismo sonido?','gato',['pato','sapo']],
   ['Inventas una rima para el mural. La palabra es «gato».','¿Qué palabra rima con «gato»?','pato',['mesa','goma']],
   ['Quieres separar «carpeta» para leer la etiqueta.','¿Cómo se separa en sílabas?','car-pe-ta',['carp-e-ta','ca-rpe-ta']]
  ];
  const ph=phonology[level-1];emit('language.phonology',sc,ph[1],[T(ph[0])],ph[2],ph[3],{optionContrast:level===3?'punctuation':undefined,difficultyParameters:{operation:['initialSound','rhyme','syllables'][level-1]}});
 }
 if(domain==='speedReasoning')for(const home of [false,true]){
  const sc=home?'home.organization':'community.library',speed={speedTask:true,speedRevision:4};
  const symbols=early?['○','□','△','☆']:['AB','BA','AC','CA'],load=level+1,model=symbols.slice(0,Math.min(level,3)).join(' ');
  for(const matches of [true,false]){const other=matches?model:model+' '+symbols.at(-1);
  emit('speed.compare',sc+(matches?'.matching':'.different'),'¿Coinciden exactamente las dos etiquetas?',[T(home?'Comprueba la etiqueta de la caja y la del armario antes de guardarla.':'Comprueba la etiqueta del libro y la del estante antes de devolverlo.'),table([[model,other]])],matches?'Sí':'No',[matches?'No':'Sí'],{...speed,speedFamily:'compare',difficultyParameters:{elements:level}});}
  const foods=home?['pan','leche','manzana','arroz']:['lápiz','papel','goma','pincel'],category=home?'alimentos':'materiales para dibujar',allMatch=(level+(home?1:0))%2===0;
  const members=foods.slice(0,level+1);if(!allMatch)members[members.length-1]=home?'cuaderno':'plátano';
  emit('speed.category',sc,'¿Todos son '+category+'?',[T(home?'Revisas los ingredientes antes de preparar la merienda.':'Revisas la bandeja de materiales antes de empezar el taller.'),L(members)],allMatch?'Sí':'No',[allMatch?'No':'Sí'],{...speed,speedFamily:'category',difficultyParameters:{elements:members.length}});
  const searchLength=early?Math.min(6,level+3):level*2+4,target=early?'○':home?'SAL':'LIB',foils=early?['□','△','●']:home?['SALSA','SOL','SALA']:['LBI','LIA','BIL'],found=level;
  const search=Array.from({length:searchLength},(_,i)=>i<found?target:foils[i%foils.length]);if(level>=2)search.reverse();
  emit('speed.search',sc,'¿Cuántas etiquetas son exactamente «'+target+'»?',[T(home?'Busca la etiqueta indicada entre las cajas de la despensa.':'Busca el código indicado entre los libros preparados para devolver.'),{...L(search),presentation:'speedSearch'}],String(found),[String(found+1),String(found-1)],{...speed,speedFamily:'search',difficultyParameters:{distractors:search.length-found,similarLabels:!early}});
  const pairs=Array.from({length:level+1},(_,i)=>{const x=symbols[i%symbols.length];return [x,i%2===(home?0:1)?x:symbols[(i+1)%symbols.length]];}),matches=pairs.filter(r=>r[0]===r[1]).length;
  emit('speed.pairs',sc,'¿Cuántas parejas de etiquetas coinciden?',[
   T(home?'Cada fila compara una caja con su lugar de almacenaje.':'Cada fila compara un libro con la etiqueta de su estante.'),table(pairs)
  ],String(matches),[String(matches+1),String(Math.max(0,matches-1))].filter(x=>x!==String(matches)),{...speed,speedFamily:'pairs',difficultyParameters:{pairs:pairs.length}});
  const right=(level+(home?1:0))%2===0,central=right?'→':'←',flanks=Array(level===1?3:5).fill(right?'←':'→');flanks[Math.floor(flanks.length/2)]=central;
  const direction=level===3?!right:right;
  emit('speed.flanker',sc,level===3?'Elige la dirección contraria a la flecha central.':'¿Hacia dónde apunta la flecha central?',[T(home?'La señal central indica por dónde llevar la caja. Ignora las flechas laterales.':'La señal central indica por dónde devolver el material. Ignora las flechas laterales.'),{...L(flanks),presentation:'flanker'}],direction?'Derecha':'Izquierda',[direction?'Izquierda':'Derecha'],{...speed,speedFamily:'flanker',difficultyParameters:{flankers:flanks.length-1,reverse:level===3}});
  const key=symbols.slice(0,load).map((x,i)=>[x,String(i+1)]),keyTarget=key.at(-1)[0];
  emit('speed.key',sc,'¿Qué número corresponde a «'+keyTarget+'»?',[T(home?'La clave relaciona etiquetas con los cajones de casa.':'La clave relaciona etiquetas con los estantes de la biblioteca.'),table(key)],key.at(-1)[1],key.slice(0,-1).map(r=>r[1]),{...speed,speedFamily:'key',difficultyParameters:{keyEntries:key.length}});
  const reversed=model.split(' ').reverse().join(' ');
  emit('speed.match',sc,'¿Qué etiqueta es exactamente igual al modelo?',[T('Modelo: '+model),T(home?'El modelo indica la caja que tienes que guardar.':'El modelo indica el libro que tienes que devolver.')],model,[reversed===model?model+' '+symbols[1]:reversed,model+' '+symbols.at(-1)],{...speed,speedFamily:'match',difficultyParameters:{elements:level}});
  const seq=key.slice(0,level).map(r=>r[0]).reverse(),translated=key.slice(0,level).map(r=>r[1]).reverse().join(' ');
  emit('speed.translation',sc,'Traduce la secuencia con la clave. Mantén el orden.',[T(home?'La secuencia indica los cajones que debes abrir.':'La secuencia indica los estantes que debes revisar.'),table(key),T('Secuencia: '+seq.join(' '))],translated,[translated+' 4',key[0][1],key.at(-1)[1]].filter(x=>x!==translated),{...speed,speedFamily:'translation',difficultyParameters:{lookups:seq.length}});
  if(!early){
   const letters=['A','B','C','D'].slice(0,level+1),destinations=letters.map((x,i)=>[x,String(i+1)]),second=letters.map((x,i)=>[String(i+1),['Sala','Patio','Taller','Biblioteca'][i]]),targetKey=letters.at(-1);
   emit('speed.crossed_keys',sc,'¿A qué lugar lleva el código «'+targetKey+'»?',[T(home?'La primera tabla traduce una etiqueta del envío. La segunda indica dónde recogerlo.':'La primera tabla traduce una etiqueta del material. La segunda indica dónde devolverlo.'),table(destinations),table(second)],second.at(-1)[1],second.slice(0,-1).map(r=>r[1]),{...speed,speedFamily:'crossed_keys',difficultyParameters:{keyEntries:letters.length,lookups:2}});
   const records=level===1?[['9:00','Ocupada'],['10:00','Libre']]:level===2?[['9:00','Libre, 10 minutos'],['10:00','Libre, 30 minutos'],['11:00','Ocupada, 30 minutos']]:[['9:00','Libre, 10 minutos'],['10:00','Libre, 30 minutos'],['11:00','Libre, 30 minutos']];
   emit('speed.agenda',sc,'¿Qué franja cumple las condiciones?',[
    T(home?'Buscas un rato para usar la mesa compartida de casa.':'Buscas un rato para usar la mesa de la biblioteca.'),T(level===1?'Debe estar libre.':level===2?'Debe estar libre y durar al menos veinte minutos.':'Debe estar libre, durar al menos veinte minutos y empezar antes de las once.'),table(records)
   ],'10:00',records.filter(r=>r[0]!=='10:00').map(r=>r[0]),{...speed,speedFamily:'agenda',difficultyParameters:{rules:level}});
   const values=[4,7,10,13],selected=level===1?4:level===2?10:13;
   emit('speed.rule',sc,'¿Qué número sigue la regla activa?',[
    T(home?'La regla indica qué caja debes revisar.':'La regla indica qué estante debes revisar.'),T(level===1?'Elige el número más pequeño.':level===2?'Entre los números pares, elige el mayor.':'La regla antigua era elegir el menor. Ahora elige el mayor de los impares.'),L(values.map(String))
   ],String(selected),values.filter(x=>x!==selected).map(String),{...speed,speedFamily:'rule',difficultyParameters:{rules:level===1?1:2,updatedRule:level===3}});
  }
 }
 if(domain==='attention')for(const home of [false,true]){
  const sc=home?'home.storage':'school.materials',shapes=early?['○ □','□ ○','○ △']:['AB12','BA12','AB21'],correct=(level+(home?1:0))%(early&&level===1?2:3),labels=['A','B','C'].slice(0,early&&level===1?2:3),model=shapes[level%shapes.length];
  const alternatives=[model,...shapes.filter(x=>x!==model)];
  emit('attention.exact_match',sc,'¿Qué etiqueta coincide exactamente con el modelo?',[T('Modelo: '+model),T(home?'Busca la etiqueta para guardar la caja en su armario.':'Busca la etiqueta para devolver el material a su estante.'),table(labels.map((label,i)=>[label,alternatives[(i-correct+labels.length)%labels.length]]))],labels[correct],labels.filter((_,i)=>i!==correct),{difficultyParameters:{alternatives:labels.length}});
  const target=early?'○':home?'SAL':'LIB',size=early?level+3:level*2+4,search=Array.from({length:size},(_,i)=>i<level?target:early?'□':i%2?target.split('').reverse().join(''):target+'A');
  emit('attention.count',sc,'¿Cuántas etiquetas son exactamente «'+target+'»?',[T(home?'Cuenta las etiquetas que necesitas localizar en la despensa.':'Cuenta las etiquetas que necesitas localizar en la biblioteca.'),L(level===3?search.reverse():search)],String(level),[String(level+1),String(level-1)],{difficultyParameters:{elements:size,exactMatching:true}});
  const places=(home?['En el cajón','Sobre la mesa','Junto a la puerta','Detrás de la puerta']:['En el estante','Sobre la mesa','Junto a la entrada','Bajo el mostrador']).slice(0,level+1),things=(home?['las llaves','el vaso','la bolsa','el abrigo']:['la carpeta','el libro','el cartel','la regla']).slice(0,level+1),index=things.length-1;
  emit('attention.position',sc,'¿Dónde debes buscar '+things[index]+'?',[T(home?'Esta lista indica dónde se guardó cada cosa de casa.':'Esta lista indica dónde se dejó cada material para el taller.'),table(things.map((name,i)=>[name,places[i]]))],places[index],places.filter((_,i)=>i!==index),{difficultyParameters:{sourceRows:things.length,targetRow:index}});
  const original=(home?['pan','leche','fruta','agua','arroz']:['papel','lápiz','goma','regla','pincel']).slice(0,Math.min(5,level+2)),missing=original[1],updated=original.filter(x=>x!==missing);if(level===3)updated.reverse();
  emit('attention.omission',sc,'¿Qué elemento de la primera lista falta en la segunda?',[T(home?'Compruebas la lista antes de preparar la merienda.':'Compruebas la lista antes de preparar el taller.'),table([['Primera lista',original.join(', ')],['Segunda lista',updated.join(', ')]])],missing,original.filter(x=>x!==missing).slice(0,3),{difficultyParameters:{elements:original.length,reordered:level===3}});
  const needed=home?['vaso','agua','plato']:['papel','lápiz','goma'],irrelevant=home?'El libro':'El vaso';
  emit('attention.relevance',sc,level===3?'¿Qué objeto no hace falta preparar de nuevo?':'¿Qué elemento no hace falta según esta lista?',[
   T(home?'Preparas una merienda siguiendo la lista de objetos necesarios.':'Preparas un dibujo siguiendo la lista de materiales necesarios.'),L(needed.slice(0,level+1)),...(level===3?[T('Ya tienes '+(home?'el vaso':'el papel')+'. Prepara solo lo que falta.')]:[])
  ],level===3?'El '+needed[0]:irrelevant,(level===3?needed.slice(1):needed.slice(0,level+1)).map(x=>'El '+x),{difficultyParameters:{relevantItems:Math.min(3,level+1),completedResource:level===3}});
  const attrs=['Libre','Veinte minutos','Silenciosa'].slice(0,level),valid=(level+(home?1:0))%3;
  const records=['A','B','C'].map((label,i)=>[label,i===valid?attrs.join(', '):[...attrs.slice(0,-1),['Ocupada','Diez minutos','Ruidosa'][level-1]].join(', ')]);
  emit('attention.conditions',sc,'¿Qué mesa cumple todas las condiciones?',[T(home?'Buscas una mesa compartida para estudiar en casa.':'Buscas una mesa para el trabajo del grupo.'),T('Necesitas: '+attrs.join(', ')+'.'),table(records)],['A','B','C'][valid],['A','B','C'].filter((_,i)=>i!==valid),{difficultyParameters:{rules:attrs.length}});
  const instructions=home?[
   ['La nota pide guardar primero los vasos. Después, los platos.','¿Qué debes guardar primero?','Los vasos',['Los platos','Las servilletas']],
   ['Si el vaso está limpio, guárdalo. Si está sucio, lávalo. Está sucio.','¿Qué pide hacer la nota ahora?','Lavar el vaso',['Guardar el vaso','Llenar el vaso']],
   ['La nota antigua pide guardar los vasos. La nueva dice esperar a que se sequen. Siguen mojados.','¿Qué instrucción debes seguir ahora?','Esperar a que se sequen',['Guardar los vasos ya','Volver a mojarlos']]
  ]:[
   ['La nota pide guardar primero los lápices. Después, las gomas.','¿Qué debes guardar primero?','Los lápices',['Las gomas','Los pinceles']],
   ['Si el dibujo está seco, guárdalo. Si está mojado, espera. Está mojado.','¿Qué pide hacer la nota ahora?','Esperar',['Guardar el dibujo','Volver a mojarlo']],
   ['La nota antigua pide pegar los dibujos. La nueva dice esperar a la revisión. Aún no se han revisado.','¿Qué instrucción debes seguir ahora?','Esperar a la revisión',['Pegarlos ya','Borrar los dibujos']]
  ];const [s,q,a,w]=instructions[level-1];emit('attention.instructions',sc,q,[T(s)],a,w,{difficultyParameters:{conditional:level>=2,updatedSource:level===3}});
 }
 if(domain==='executive')for(const home of [false,true]){
  const sc=home?'home.planning':'community.workshop',valid=(level+(home?1:0))%3,labels=['A','B','C'],n=level+2;
  const properties=['Disponible','Con permiso','Cabe en la mesa'].slice(0,level),negative=['Ocupado','Sin permiso','No cabe'];
  emit('executive.conditions',sc,'¿Qué opción cumple todas las condiciones?',[T(home?'Buscas un juego para la tarde en casa.':'Buscas material para el taller del grupo.'),T('Necesitas: '+properties.join(', ')+'.'),table(labels.map((label,i)=>[label,i===valid?properties.join(', '):[...properties.slice(0,-1),negative[level-1]].join(', ')]))],labels[valid],labels.filter((_,i)=>i!==valid),{difficultyParameters:{rules:level}});
  const budget=level===3?15:12,reserved=level===3?5:0,available=budget-reserved,packages=labels.map((label,i)=>[label,i===valid?`${n} piezas, ${available} puntos`:i===(valid+1)%3?`${n-1} piezas, ${available} puntos`:`${n} piezas, ${available+2} puntos`]);
  emit('executive.resources',sc,'¿Qué paquete permite completar la actividad sin superar el límite?',[T(home?`Preparas un montaje en casa y necesitas ${n} piezas.`:`Preparas un taller y necesitas ${n} piezas.`),T(`Tienes ${budget} puntos de un programa de premios.${reserved?` Hay ${reserved} puntos reservados que no puedes gastar.`:''}`),table(packages)],labels[valid],labels.filter((_,i)=>i!==valid),{difficultyParameters:{constraints:reserved?3:2,reserved}});
  const times=[5,10,15,5].slice(0,level+1),spent=times.reduce((a,b)=>a+b,0),timeLeft=40-spent;
  emit('executive.time',sc,'¿Cuántos minutos quedan después de completar estas tareas?',[T(home?'Tienes cuarenta minutos para preparar una actividad familiar.':'Tienes cuarenta minutos para preparar la actividad del club.'),table(times.map((value,i)=>['Tarea '+(i+1),value+' minutos']))],timeLeft+' minutos',[(timeLeft+5)+' minutos',(timeLeft-5)+' minutos'],{difficultyParameters:{steps:times.length}});
  const change=home?[
   ['Ibas a hacer un puzle. Faltan piezas. El juego de cartas está completo.','¿Qué puedes preparar sin buscar piezas?','El juego de cartas',['El puzle incompleto','Un puzle sin comprobar']],
   ['El puzle está incompleto. Puedes elegir cartas o bloques. Otra persona usa los bloques.','¿Qué puedes preparar sin interrumpirla?','Las cartas',['Los bloques que está usando','El puzle incompleto']],
   ['El puzle está incompleto y los bloques están ocupados. Las cartas duran veinte minutos. Solo tienes diez.','¿Qué debes comprobar antes de elegir las cartas?','Si hay una partida de diez minutos',['De qué color es la caja','Si el puzle sigue incompleto']]
  ]:[
   ['La sala del taller está cerrada. Hay otra sala libre y autorizada.','¿Qué cambio permite continuar?','Usar la sala autorizada',['Esperar dentro de la sala cerrada','Usar cualquier sala sin preguntar']],
   ['La sala cierra. El patio está libre, pero llueve. Hay otra sala autorizada y libre.','¿Dónde puedes continuar?','En la otra sala autorizada',['En el patio bajo la lluvia','En la sala que cierra']],
   ['La sala cierra y llueve en el patio. Hay otra sala libre, pero falta confirmar el permiso.','¿Qué debes resolver antes de trasladarte?','Confirmar el permiso de la otra sala',['Elegir el color de las mesas','Dar por hecho que hay permiso']]
  ];let [s,q,a,w]=change[level-1];emit('executive.update',sc,q,[T(s)],a,w,{difficultyParameters:{updatedConstraints:level}});
  const plan=home?['Elegir el juego','Preparar la mesa','Revisar las piezas','Preparar las sillas','Avisar a todos']:['Elegir la actividad','Preparar el espacio','Revisar el material','Preparar las fichas','Avisar al grupo'];
  const count=Math.min(5,level+2),pending=level===3?1:level;
  emit('executive.resume',sc,'¿Cuál es la primera tarea pendiente según el orden del plan?',[T('Retoma la preparación. Sigue este orden y no repitas las tareas hechas.'),table(plan.slice(0,count).map((name,i)=>[name,i===pending?'Pendiente':i<pending||level===3?'Hecha':'Pendiente']))],plan[pending],plan.slice(0,count).filter((_,i)=>i!==pending).slice(0,3),{difficultyParameters:{steps:count,completedLaterTask:level===3}});
  const possibilities=early?(level===1?['A','B']:['A','B','C']):['A','B','C','D'].slice(0,Math.min(4,level+2)),remaining=level===3?possibilities.at(-2):possibilities.at(-1),taken=possibilities.slice(0,-1);
  emit('executive.reason',sc,'¿Qué opción queda libre?',[T(home?'Cada persona recibe una caja distinta.':'Cada equipo recibe un lote distinto.'),L(possibilities),T('Ya se han usado: '+taken.join(', ')+'.'+(level===3?' '+remaining+' vuelve a estar libre. '+possibilities.at(-1)+' queda reservado.':''))],remaining,possibilities.filter(x=>x!==remaining),{difficultyParameters:{exclusions:taken.length}});
  const supervise=home?[
   ['El plan dice servir la fruta. La regla pide lavarla antes. Aún está sin lavar.','¿Qué debes corregir antes de servirla?','Lavar la fruta',['Cambiar el plato','Servirla sin lavar']],
   ['La regla pide fruta lavada y platos limpios. Los platos están limpios. La fruta no está lavada.','¿Qué falta corregir?','Lavar la fruta',['Lavar otra vez los platos','Cambiar la mesa']],
   ['La fruta aún no está lavada. Los platos están limpios. Otra persona pide que sirvas ya.','¿Qué cambio mantiene la regla del plan?','Lavar la fruta antes de servir',['Servir ya porque lo piden','Repetir solo la limpieza de platos']]
  ]:[
   ['El plan dice guardar el dibujo. La regla pide que esté seco. Sigue mojado.','¿Qué debes corregir?','Esperar a que se seque',['Guardarlo ya','Mojarlo otra vez']],
   ['El dibujo debe estar seco y revisado antes de guardarlo. Ya está revisado, pero sigue mojado.','¿Qué falta antes de guardarlo?','Que se seque',['Revisarlo otra vez','Guardarlo mojado']],
   ['El dibujo está revisado pero mojado. Piden guardarlo ya. La regla exige que esté seco.','¿Qué cambio mantiene la regla del plan?','Esperar a que se seque antes de guardar',['Guardarlo ya porque lo piden','Volver a revisarlo y guardarlo mojado']]
  ];[s,q,a,w]=supervise[level-1];emit('executive.supervise',sc,q,[T(s)],a,w,{difficultyParameters:{conditions:level===1?1:2,competingProposal:level===3}});
 }
 if(domain==='social')for(const home of [false,true]){
  const sc=home?'home.conversation':'school.group';
  const literals=home?[
   ['Ana deja el vaso sobre la mesa.','¿Qué ha dejado Ana?','El vaso',['El plato','La jarra']],
   ['Ana da el vaso a Leo. Leo lo deja junto a la jarra.','¿Quién deja el vaso junto a la jarra?','Leo',['Ana','No se dice']],
   ['Ana da el vaso a Leo. Leo lo deja en la mesa. Ana lleva la jarra al salón.','¿Qué objeto sigue en la mesa según el texto?','El vaso',['La jarra','Los dos']]
  ]:[
   ['Leo deja la carpeta sobre la mesa.','¿Qué ha dejado Leo?','La carpeta',['El libro','El estuche']],
   ['Leo da la carpeta a Ana. Ana la deja en el estante.','¿Quién deja la carpeta en el estante?','Ana',['Leo','No se dice']],
   ['Leo da la carpeta a Ana. Ana la deja en el estante. Leo lleva el libro al patio.','¿Qué objeto sigue en el estante según el texto?','La carpeta',['El libro','Los dos']]
  ];let [s,q,a,w]=literals[level-1];emit('social.literal',sc,q,[T(s)],a,w,{difficultyParameters:{events:level}});
  const impacts=home?[
   ['Envías una broma al grupo familiar. Una persona responde: «Me ha molestado».','¿Qué impacto puedes afirmar a partir de su respuesta?','Ha dicho que le ha molestado',['A todos les ha molestado','A nadie le ha molestado']],
   ['Querías animar a alguien con una broma. Esa persona dice que le ha molestado.','¿Qué recoge tanto tu intención como el efecto comunicado?','Querías animar, pero le ha molestado',['Si querías animar, no puede molestar','Si molestó, querías hacer daño']],
   ['Enviaste una broma para animar. Una persona dice que le molestó; otra se rio.','¿Qué conclusión está apoyada?','El efecto comunicado fue distinto para esas personas',['Todo el grupo se sintió igual','La risa demuestra que nadie se molestó']]
  ]:[
   ['Compartes un cambio de plan sin avisar a Ana. Ella dice que llegó al lugar antiguo.','¿Qué consecuencia expresa Ana?','No recibió el aviso del nuevo lugar',['Nadie recibió el aviso','Ana conocía el nuevo lugar']],
   ['Cambiaste el lugar para ayudar al grupo. Ana no recibió el aviso y fue al lugar antiguo.','¿Qué recoge la intención y el resultado?','Querías ayudar, pero Ana no tuvo la información',['Ayudar garantiza que todos se enteran','Ana se equivocó aunque recibió el aviso']],
   ['Cambiaste el lugar para facilitar la reunión. Ana no recibió el aviso. Leo sí lo leyó.','¿Qué debes considerar antes de afirmar que el cambio funcionó para todos?','Que no todos recibieron la misma información',['Que Leo lo leyó basta para todos','Que nadie pudo recibir el aviso']]
  ];[s,q,a,w]=impacts[level-1];emit('social.impact',sc,q,[T(s)],a,w,{difficultyParameters:{perspectives:level===3?2:1,intentionAndImpact:level>=2}});
 }
 if(['reading','literacy'].includes(domain))for(const home of [false,true]){
  const sc=home?'home.messages':'community.club';
  if(early){
   const chunks=home?[
    ['Por favor,','pásame','el vaso.'],['¿Puedes','decirme','cuándo merendamos?'],['Por favor,','avisa','antes de coger el juego.']
   ]:[
    ['¿Puedo','coger','el lápiz?'],['¿Puedes','decirme','cuándo empieza el taller?'],['Por favor,','avisa','antes de cambiar el cartel.']
   ];const answer=chunks[level-1];
   emit('reading.compose',sc,'Forma el mensaje. Empieza por «'+answer[0]+'».',[T(home?'Preparas un mensaje para alguien de casa.':'Preparas un mensaje para alguien del taller.'),L(answer)],undefined,[],{type:'order',responseType:'order',tokens:[...answer].reverse(),answer,languageFocus:'writing',difficultyParameters:{purpose:['requestObject','requestInformation','requestAdvanceNotice'][level-1]}});
  }else{
   const place=home?'casa':'la biblioteca',event=home?'la merienda':'el taller',time=level===3?'18:00':'17:00',location=level===3?(home?'el salón':'la sala grande'):place;
   const source=level===1?`El sábado se celebra ${event} a las 17:00 en ${place}. Termina a las 18:00.`:level===2?`${event} será el sábado a las 17:00 en ${place}. Confirma antes del viernes. Lleva ${home?'un vaso reutilizable':'un cuaderno'}. Hay ocho plazas.`:`Aviso anterior: sábado, 17:00, ${place}. Aviso nuevo: sábado, 18:00, ${location}. Se mantiene la confirmación antes del viernes y el máximo de ocho plazas.`;
   function write(family,q,blocks,sample,criteria){emit(family,sc,q,blocks,undefined,[],{type:'self',responseType:'written',assessment:'observation',languageFocus:'writing',writingPurpose:q,sample,writingRubric:criteria,difficultyParameters:{levelPlan:['explicitInformation','combineConditions','updateOrLimitEvidence'][level-1]}});}
   const details=`El sábado, ${event} empieza a las ${time} en ${location}.`;
   const condition=level>=2?' Confirma antes del viernes.':'',material=level===2?` Lleva ${home?'un vaso reutilizable':'un cuaderno'}.`:'';
   write('reading.request','Escribe una consulta breve al organizador. Menciona la actividad y pregunta por lo que falta saber.',[T(source),T(level===1?'El aviso no indica si hay acceso sin escaleras.':level===2?'Necesitas saber si hay acceso sin escaleras y si se puede acudir con acompañante. El aviso no lo aclara.':'La hora y el lugar se han actualizado. Necesitas confirmar si sigue habiendo acceso sin escaleras en el lugar nuevo.')],`Hola. Quería consultar sobre ${event} del sábado. ${level===3?'He leído el cambio de hora y lugar. ':''}¿Hay acceso sin escaleras${level===3?' en el lugar nuevo':''}?${level===2?' ¿Se puede acudir con acompañante?':''} Gracias.`,['Identifica la actividad de la consulta.','Pregunta por los datos que faltan sin inventar la respuesta.','Distingue los datos confirmados de los que necesita consultar.']);
   write('reading.summary','Resume el aviso para alguien que no lo ha leído. Incluye los datos necesarios y respeta los cambios.',[T(source)],details+condition+material,['Indica el día, la hora y el lugar vigentes.','Incluye las condiciones que aparecen en el aviso.','Evita añadir datos que el aviso no confirma.']);
   write('reading.invitation','Escribe una invitación breve a partir del aviso. Explica cuándo y dónde acudir y qué hay que hacer.',[T(source)],`Te invito ${home?'a la merienda':'al taller'}. `+details+condition+material,['Se entiende a qué actividad invitas.','Indica día, hora y lugar vigentes.','Explica las condiciones del aviso sin inventarlas.']);
   write('reading.correction','Corrige el mensaje equivocado usando el aviso. Explica qué dato hay que cambiar.',[T(source),T(level===3?'Mensaje recibido: «Seguimos a las 17:00 en el lugar anterior».':'Mensaje recibido: «Nos vemos el domingo a las 17:00».')],level===3?`El aviso nuevo cambia la hora a las 18:00 y el lugar a ${location}. La confirmación sigue siendo antes del viernes.`:`El día correcto es el sábado, no el domingo. `+details,['Identifica el dato equivocado del mensaje.','Lo sustituye por información de la fuente vigente.','No modifica los datos que siguen siendo válidos.']);
   write('reading.fact_opinion','Escribe un dato comprobable y una opinión, identificándolos. Explica qué no se puede asegurar.',[T(source),T('Una persona dice: «Será la actividad más divertida del año».')],`Dato: ${details} Opinión: alguien cree que será la más divertida. El aviso no demuestra que vaya a gustar a todo el mundo.`,['Separa un dato del aviso de una valoración.','No presenta una opinión como un hecho.','Explica un límite de lo que puede concluirse.']);
   const old=`Antes: sábado, 17:00, ${place}.`,newer=level===1?`Ahora: sábado, 18:00, ${place}.`:level===2?`Ahora: sábado, 18:00, ${home?'el salón':'la sala grande'}.`:`Ahora: sábado, 18:00, ${home?'el salón':'la sala grande'}. Solo cambia para quienes venían al turno de las 17:00. Los otros turnos siguen igual.`;
   write('reading.compare_sources','Compara los dos avisos. Explica qué cambia, qué se mantiene y a quién afecta.',[T(old),T(newer)],`Se mantiene el sábado. La hora pasa de las 17:00 a las 18:00.${level>=2?` El lugar cambia a ${home?'el salón':'la sala grande'}.`:''}${level===3?' El cambio solo afecta al turno de las 17:00.':''}`,['Señala los cambios apoyándose en ambos avisos.','Identifica al menos un dato que se mantiene.','Respeta a quién se aplica el cambio.']);
   write('reading.advert','Reescribe el anuncio para que sea atractivo y fiel a los datos. Elimina las afirmaciones que no se pueden justificar.',[T(source),T('Anuncio propuesto: «¡Plazas ilimitadas y diversión garantizada para todos!».')],`Ven ${home?'a la merienda':'al taller'}. `+details+(level>=2?' Hay ocho plazas. Confirma antes del viernes.':' Consulta las plazas disponibles.')+material+' Puedes probar la actividad, pero no se puede garantizar que guste a todo el mundo.',['Conserva los datos y límites de la fuente.','Elimina promesas que el aviso no justifica.','Redacta un mensaje claro para quien quiere participar.']);
   const rows=home?[['Libros',String(4+level)],['Juegos',String(2+level)]]:[['Préstamos del lunes',String(4+level)],['Préstamos del martes',String(2+level)]];
   if(level===3)rows.push(['Registro anulado','100']);
   write('reading.evidence_caption',level===1?'Escribe un pie de tabla indicando la cantidad de la primera fila. No inventes causas.':level===2?'Escribe un pie de tabla comparando las dos cantidades. No inventes causas.':'Resume el total válido de las dos primeras filas. Excluye el registro anulado y no inventes causas.',[T(home?'Anotas cuántos objetos quedaron guardados al terminar.':'La biblioteca registra los préstamos de dos días.'),table(rows)],level===1?`${rows[0][0]}: ${rows[0][1]}. Los datos no explican el motivo.`:level===2?`${rows[0][0]}: ${rows[0][1]}. ${rows[1][0]}: ${rows[1][1]}. La primera cantidad supera a la segunda en dos. Los datos no explican el motivo.`:`El total válido es ${Number(rows[0][1])+Number(rows[1][1])}. Excluyo el registro anulado. Los datos no explican el motivo.`,['Usa correctamente las cifras válidas.','Resuelve la comparación o el total solicitado.','Distingue el dato de una explicación no demostrada.']);
   const to=label=>label.startsWith('el ')?'al '+label.slice(3):'a '+label;
   const route=home?['la entrada','el pasillo','el salón']:['recepción','el pasillo','la biblioteca'],routeNew=home?'el patio':'la sala de lectura';
   write('reading.directions','Escribe un recorrido que otra persona pueda seguir. Usa los pasos y la actualización, si la hay.',[T(`Salida: ${route[0]}. Después: ${route[1]}. Destino: ${route[2]}.`),...(level>=2?[T(`Desde ${route[1]} también se puede ir ${to(routeNew)}, pero ese no es el destino.`)]:[]),...(level===3?[T(`Actualización: el paso directo ${to(route[2])} está cerrado. Pasa antes por ${routeNew}.`)]:[])],`Desde ${route[0]}, ve ${to(route[1])}. ${level===3?`Después pasa por ${routeNew}. `:''}Termina en ${route[2]}.`,['Indica el punto de salida y el destino.','Mantiene el orden de las indicaciones.','Aplica el cambio sin confundirlo con una ruta opcional.']);
   const planSteps=home?['Cerrar la caja','Pegar la etiqueta','Dejarla en la entrada']:['Cerrar el sobre','Escribir el nombre del grupo','Entregarlo en recepción'];
   write('reading.instructions','Redacta instrucciones claras para otra persona. Incluye el orden y la condición del encargo.',[T(`El orden acordado es: ${planSteps.join('; ')}.`),...(level>=2?[T('Comprueba que el contenido está completo antes de cerrar.')]:[]),...(level===3?[T('Si falta algo, deja el encargo abierto y avisa. No lo entregues incompleto.')]:[])],`${level>=2?'Comprueba el contenido antes de cerrar. ':''}${planSteps.join('. ')}.${level===3?' Si falta algo, no cierres ni entregues: avisa.':''}`,['Da pasos que se puedan seguir en el orden correcto.','Incluye las comprobaciones indicadas.','Explica qué hacer si no se cumple la condición.']);
   const goal=level===1?'Necesitas una actividad que termine antes de las 18:00.':level===2?'Necesitas terminar antes de las 18:00 y que no haga falta reservar.':'Necesitas terminar antes de las 18:00 sin reservar. La opción A se ha retrasado media hora.';
   write('reading.recommendation','Recomienda una opción y justifica la elección con los datos y las condiciones.',[T(home?'Organizas la tarde en casa y eliges entre actividades del barrio.':'Preparas una salida del club y eliges entre talleres del centro cultural.'),T(goal),table([['Opción A',home?'Juegos de mesa: 17:00–17:45, sin reserva':'Dibujo: 17:00–17:45, sin reserva'],['Opción B',home?'Paseo guiado: 16:00–17:00, sin reserva':'Teatro: 16:00–17:00, sin reserva'],['Opción C',home?'Cocina: 16:00–17:00, reserva obligatoria':'Música: 16:00–17:00, reserva obligatoria']])],level===1?'Recomiendo B: termina a las 17:00, antes de las 18:00. A también respeta ese límite.':level===2?'Recomiendo B: termina a las 17:00 y no requiere reserva. A también cumple ambas condiciones.':'Recomiendo B: termina antes de las 18:00 sin reserva. A, con el retraso, termina a las 18:15; C exige reservar.',['La opción recomendada cumple las condiciones.','La justificación cita datos relevantes de la tabla.','Acepta alternativas que también cumplen, sin afirmar que hay una única si no la hay.']);
  }
 }
}
const api={extend,targets};root.TransferContent=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

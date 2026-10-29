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
 // Money, measurement and geometry use two independently authored contexts.
 if(['division','middleMath','teenMath'].includes(domain)){
  const denominations=age==='early'?[[1,1],[2,1],[2,2,1]][level-1]:[[5,5],[10,5,5],[20,10,5]][level-1];
  const total=denominations.reduce((a,b)=>a+b,0),shown=denominations.map(n=>n+' €');
  add('math.money','home.savings','¿Cuánto dinero has guardado en total?',[T('En España guardas este dinero para comprar un libro.'),L(shown)],total+' €',[(total+1)+' €',(total-1)+' €'],{currencyContext:'foreign',topic:'Matemáticas · ahorrar para una compra',difficultyParameters:{denominations:new Set(denominations).size,elements:denominations.length},why:age==='early'?'Suma los valores, no el número de monedas.':'Suma el valor de cada pieza: '+shown.join(' + ')+' = '+total+' €.'});
  const fare=age==='early'?1:level+2,tickets=level===3?2:1,change=total-fare*tickets;
  add('math.money','transport.ticket','¿Cuánto dinero te queda después de pagar?',[T('En España preparas este dinero para el autobús.'),L(shown),T(`Compras ${tickets===1?'un billete':'dos billetes'}. Cada billete cuesta ${fare} €.`)],change+' €',[total+' €',(change+1)+' €'],{currencyContext:'foreign',topic:'Matemáticas · pagar un trayecto',difficultyParameters:{operations:level===3?3:2,elements:denominations.length},why:`Tienes ${total} €. Pagas ${fare*tickets} €. Quedan ${change} €.`});
  if(age==='early')for(const home of [false,true]){
   const start=level===1?0:level,n=level+2,object=home?'la cinta para envolver':'el lápiz';
   add('math.measure',home?'home.packaging':'school.materials','¿Cuánto mide '+object+'?',[T(`${home?'La cinta':'El lápiz'} empieza en ${start} cm y termina en ${start+n} cm.`)],n+' cm',[(n+1)+' cm',(level===1?n-1:start+n)+' cm'],{topic:'Matemáticas · leer una medida',difficultyParameters:{origin:start,operations:level===1?1:2},why:`Entre ${start} y ${start+n} hay ${n} centímetros.`});
   const values=level===1?[2,4,3]:level===2?[3,8,5]:[8,3,6],target=[...values].sort((a,b)=>a-b)[level===3?0:1];
   const labels=home?['Primera receta','Segunda receta','Tercera receta']:['Primer turno','Segundo turno','Tercer turno'];
   add('math.order',home?'home.cooking':'school.queue',level===3?'¿Qué número va primero de menor a mayor?':'¿Qué número queda en medio de menor a mayor?',[T(home?'Ordena las recetas por el número de pasos.':'Ordena los números para dar los turnos.'),table(values.map((n,i)=>[labels[i],String(n)]))],String(target),values.filter(n=>n!==target).map(String),{topic:'Matemáticas · organizar cantidades',difficultyParameters:{spacing:level===1?'consecutive':'irregular',direction:level===3?'minimum':'middle'},why:'De menor a mayor: '+[...values].sort((a,b)=>a-b).join(', ')+'.'});
  }
  else for(const home of [false,true]){
   const hour=home?17:10,minute=level===1?0:level===2?40:45,duration=level===1?20:level===2?35:50,pause=level===3?10:0,end=hour*60+minute+duration+pause,answer=Math.floor(end/60)+':'+String(end%60).padStart(2,'0');
   add('math.time',home?'home.cooking':'school.club','¿A qué hora termina la actividad?',[T(`${home?'La receta':'El ensayo'} empieza a las ${hour}:${String(minute).padStart(2,'0')} y dura ${duration} minutos.${pause?` Añade una pausa de ${pause} minutos.`:''}`)],answer,[hour+':00',(hour+2)+':00'],{topic:'Matemáticas · ajustar un plan al reloj',difficultyParameters:{hourBoundary:level>=2,operations:pause?2:1},why:'Suma la duración'+(pause?' y la pausa':'')+' a la hora de inicio.'});
  }
 }
 if(domain==='geometry'&&age==='primary')for(const home of [false,true]){
  const sc=home?'home.design':'school.robotics';
  const point=level===1?'El punto está dos cuadros a la izquierda.':level===2?'El punto está dos cuadros a la izquierda y uno arriba.':'El punto está dos cuadros a la izquierda. Refleja y después avanza un cuadro a la derecha.';
  const answer=level===1?'Dos cuadros a la derecha':level===2?'Dos a la derecha y uno arriba':'Tres cuadros a la derecha';
  add('geometry.symmetry',sc,'Refleja el punto. ¿Dónde queda después de seguir la instrucción?',[T(home?'Diseñas un mosaico para casa. El espejo es una línea vertical.':'Programas un dibujo para el club de robótica. El espejo es una línea vertical.'),T(point)],answer,['Dos cuadros a la izquierda',level===2?'Dos a la derecha y uno abajo':'Un cuadro a la derecha'],{topic:'Geometría · reflejar un diseño',difficultyParameters:{coordinates:level===2?2:1,operations:level===3?2:1}});
  const width=level===1?4:6,height=4,opening=level===3?2:0,total=2*(width+height)-opening;
  add('geometry.perimeter',home?'home.picture':'community.garden','¿Cuánta cinta necesitas para rodear el borde indicado?',[T(home?`Enmarcas un dibujo rectangular de ${width} por ${height} centímetros.`:`Señalas un huerto rectangular de ${width} por ${height} metros.`),T(opening?`Deja una abertura de ${opening} ${home?'centímetros':'metros'} sin cinta.`:'Rodea los cuatro lados completos.')],total+(home?' cm':' m'),[(total+2)+(home?' cm':' m'),(width*height)+(home?' cm':' m')],{topic:'Geometría · calcular un contorno',difficultyParameters:{distinctSides:level===1?1:2,excludedOpening:opening},why:'Suma los cuatro lados'+(opening?' y resta la abertura.':'.')});
  const property=[['Buscas cuatro lados iguales y cuatro ángulos rectos.','Un cuadrado',['Un rombo sin ángulos rectos','Un rectángulo con dos lados largos']],['Buscas cuatro lados. Solo dos lados son paralelos.','Un trapecio con una pareja de lados paralelos',['Un cuadrado','Un triángulo']],['Buscas cuatro lados iguales. Ningún ángulo es recto.','Un rombo sin ángulos rectos',['Un cuadrado','Un rectángulo con dos lados largos']]][level-1];
  add('geometry.properties',home?'home.tiling':'school.design','¿Qué figura cumple todas las condiciones?',[T(home?'Eliges una baldosa para un mosaico.':'Eliges una pieza para el diseño de clase.'),T(property[0])],property[1],property[2],{topic:'Geometría · elegir por propiedades',difficultyParameters:{rules:level===1?2:3,exclusion:level===3}});
  const faces=[['Necesitas cubrir una cara de un cubo.','¿Qué forma debe tener la pieza?','Un cuadrado',['Un triángulo','Un rectángulo con lados distintos']],['La caja es un prisma triangular. Tiene dos caras triangulares y tres rectangulares.','Ya cubriste una cara rectangular. ¿Cuántas rectangulares quedan?','Dos',['Tres','Una']],['Pegas dos cubos por una cara. Las dos caras pegadas quedan ocultas.','¿Cuántas caras cuadradas quedan por fuera?','Diez',['Doce','Once']]][level-1];
  add('geometry.faces',home?'home.packaging':'school.models',faces[1],[T(home?'Preparas una caja de regalo.':'Construyes una maqueta de cartón.'),T(faces[0])],faces[2],faces[3],{topic:'Geometría · construir y cubrir cuerpos',difficultyParameters:{operations:level,hiddenFaces:level===3?2:0}});
 }
 // Authored progressions change the operation demanded, not just the length.
 if(domain==='reading'&&['early','junior'].includes(age)){
  const cases=[
   ['reading.document_purpose','school.garden',[
    ['El cartel dice: «No pises las plantas».','¿Para qué sirve el cartel?','Para proteger las plantas',['Para contar las plantas','Para indicar la hora']],
    ['El cartel dice: «Pasa por el camino. Hoy hemos regado las plantas».','¿Para qué señala el camino?','Para pasar sin pisar las plantas',['Para regar otra vez','Para cambiar las plantas de sitio']],
    ['El cartel dice: «Puedes mirar las plantas. Para tocarlas, pregunta primero».','¿Qué permite sin preguntar el cartel?','Mirar las plantas',['Tocar las plantas','Arrancar una hoja']]
   ]],
   ['reading.document_purpose','home.routines',[
    ['La nota dice: «Apaga la luz al salir».','¿Para qué sirve la nota?','Para recordar que apagues la luz',['Para describir una lámpara','Para decir quién ha llegado']],
    ['La nota dice: «Si sales el último, apaga la luz».','¿A quién va dirigida esa tarea?','A quien sale el último',['A quien entra primero','A quien sigue dentro']],
    ['La nota dice: «No apagues la luz mientras alguien esté leyendo».','¿Qué debes comprobar antes de apagarla?','Si alguien sigue leyendo',['Si la lámpara es nueva','Si has terminado de merendar']]
   ]],
   ['reading.inference','school.playground',[
    ['El patio tiene charcos. Mar lleva botas.','¿Para qué le sirven las botas?','Para no mojarse los pies',['Para llevar más libros','Para llegar antes']],
    ['Mar lleva botas. El patio está seco, pero hay barro en el huerto.','¿Dónde le pueden servir más las botas?','En el huerto',['En el patio seco','En el aula']],
    ['El patio está seco. Mar se pondrá botas antes de entrar al huerto mojado.','¿Qué explica que se cambie de calzado?','El suelo del huerto',['El suelo del patio','La hora de clase']]
   ]],
   ['reading.inference','home.snack',[
    ['La taza quema. Leo espera antes de beber.','¿Por qué espera Leo?','Para que se enfríe la bebida',['Para cambiar de taza','Para que entre más bebida']],
    ['Leo tiene sed. La bebida está muy caliente. Deja la taza en la mesa.','¿Por qué no bebe todavía?','Puede quemarse',['Ya no tiene sed','No encuentra la taza']],
    ['La taza quema. La bebida fría está en una jarra. Leo quiere beber ahora.','¿Qué opción evita esperar a que se enfríe la taza?','Servirse de la jarra',['Beber de la taza ya','Calentar más la taza']]
   ]],
   ['reading.compare_sources','school.schedule',[
    ['Nota nueva: «El juego es dentro». Nota anterior: «El juego es fuera».','¿Qué ha cambiado?','El lugar',['La persona','El nombre del juego']],
    ['Antes: «Juego fuera el lunes». Ahora: «Juego dentro el martes».','¿Qué dos datos han cambiado?','El lugar y el día',['Solo el lugar','Solo el día']],
    ['Antes: «Juego fuera el lunes». Ahora: «Mismo día. Dentro si llueve». Hoy llueve.','¿Qué plan debes seguir?','Dentro el lunes',['Fuera el lunes','Dentro el martes']]
   ]],
   ['reading.compare_sources','home.shopping',[
    ['Lista nueva: «Pan y leche». Lista anterior: «Solo pan».','¿Qué se ha añadido?','La leche',['El pan','Una cesta']],
    ['Antes: «Pan y leche». Ahora: «Leche y fruta».','¿Qué cambio debes hacer?','Cambiar el pan por fruta',['Cambiar la leche por pan','Quitar la leche y la fruta']],
    ['Antes: «Pan y leche». Ahora: «Mantén la leche. Fruta en lugar de pan».','¿Qué lista sigue las dos indicaciones?','Leche y fruta',['Pan y fruta','Solo leche']]
   ]],
   ['reading.fact_opinion','school.library',[
    ['Mar dice: «El cuento tiene diez páginas. Me gusta mucho».','¿Qué frase expresa un gusto?','Me gusta mucho',['Tiene diez páginas','El cuento tiene páginas']],
    ['Mar dice: «Tiene diez páginas. Es precioso». Leo no comparte ese gusto.','¿Qué dato pueden comprobar los dos?','El número de páginas',['Que es precioso','Que a todos les gusta']],
    ['Mar dice: «Tiene diez páginas. Es el mejor cuento». Leo cuenta las páginas.','¿Qué afirmación puede comprobar contando?','Tiene diez páginas',['Es el mejor cuento','Es el favorito de Leo']]
   ]],
   ['reading.fact_opinion','home.play',[
    ['Pau dice: «La pelota es roja. Es mi juego favorito».','¿Qué frase expresa un gusto?','Es mi juego favorito',['La pelota es roja','Hay una pelota']],
    ['Pau dice: «Hay dos juegos. El de cartas es más divertido».','¿Qué dato puedes comprobar contando?','Hay dos juegos',['El de cartas es más divertido','Todos prefieren las cartas']],
    ['Pau dice: «Hay dos juegos. El de cartas es el mejor». Ana prefiere otro.','¿Qué pueden comprobar sin compartir el mismo gusto?','Cuántos juegos hay',['Cuál es el mejor','Cuál gustará mañana']]
   ]],
   ['reading.follow_instruction','school.materials',[
    ['La nota dice: «Guarda el lápiz dentro del estuche».','¿Dónde debes guardarlo?','Dentro del estuche',['Al lado del estuche','Debajo del estuche']],
    ['La nota dice: «Primero cierra el estuche. Después guarda el cuaderno».','¿Qué debes hacer antes de guardar el cuaderno?','Cerrar el estuche',['Abrir el cuaderno','Sacar el lápiz']],
    ['La nota dice: «Si el dibujo está seco, guárdalo. Si está mojado, espera». Está mojado.','¿Qué debes hacer ahora?','Esperar',['Guardar el dibujo','Mojarlo otra vez']]
   ]],
   ['reading.follow_instruction','home.snack',[
    ['La nota dice: «Deja el vaso junto al plato».','¿Dónde debes dejar el vaso?','Junto al plato',['Dentro del plato','Debajo del plato']],
    ['La nota dice: «Lava el vaso antes de poner la mesa».','¿Qué debes hacer primero?','Lavar el vaso',['Poner la mesa','Llenar el vaso']],
    ['La nota dice: «Usa el vaso limpio. Si está sucio, lávalo primero». Está sucio.','¿Qué debes hacer antes de usarlo?','Lavarlo',['Llenarlo ya','Dejarlo sucio']]
   ]]
  ];
  for(const [family,scenario,versions] of cases){const [source,q,a,wrong]=versions[level-1];add(family,scenario,q,[T(source)],a,wrong,{topic:'Lectura · mensajes para actuar',difficultyParameters:{relations:level,operation:['locate','relate','applyCondition'][level-1]}});}
  for(const [v,[scenario,steps]] of [['school.garden',['Plantar la semilla','Regar la tierra','Ver crecer la planta']],['home.snack',['Lavar la fruta','Cortar la fruta','Servir la fruta']]].entries()){
   const shown=steps.slice(0,age==='early'&&level===1?2:3);
   const source=level===1?'Primero: '+shown[0]+'. Después: '+shown[1]+'.'+(shown[2]?' Al final: '+shown[2]+'.':''):level===2?'Antes de «'+shown[1]+'», haz «'+shown[0]+'». Al final: «'+shown[2]+'».':'«'+shown[2]+'» va después de «'+shown[1]+'». «'+shown[0]+'» va antes de «'+shown[1]+'».';
   add('reading.chronology',scenario,'Ordena los hechos según el texto.',[T(source)],undefined,[],{type:'order',responseType:'order',tokens:[...shown].reverse(),answer:shown,topic:'Lectura · relacionar hechos',difficultyParameters:{steps:shown.length,relations:level},ageProfile:age==='early'?{id:'early',revision:1,context:'school',mechanic:'sequencing',family:'functional-reading.chronology'}:undefined},v);
  }
 }
 if(domain==='executive'&&age==='early'){
  for(const home of [false,true]){
   const scenario=home?'home.routines':'school.project',label=home?'abrigo':'caja';
   const conditions=home?['seco','de tu talla','con capucha']:['lista','con permiso','cerrada'];
   const records=[['A',conditions.slice(0,level).join(', ')],['B',[...conditions.slice(0,Math.max(0,level-1)),home?'mojado':'abierta'].join(', ')]];
   if(level===1)records[1][1]=home?'mojado':'sin preparar';
   add('executive.conditions',scenario,'¿Qué '+label+' cumple lo que necesitas?',[T('Necesitas: '+conditions.slice(0,level).join(' y ')+'.'),table(records)],'La opción A',['La opción B'],{topic:'Organizar · comprobar condiciones',difficultyParameters:{rules:level}});
   const required=home?['vaso','plato','servilleta']:['papel','lápiz','goma'],need=required.slice(0,level);
   add('executive.resources',scenario,'¿Qué opción tiene todo lo necesario?',[T('Necesitas: '+need.join(' y ')+'.'),table([['A',need.join(', ')],['B',level===1?'Solo una caja':need.slice(0,-1).join(', ')]])],'La opción A',['La opción B'],{topic:'Organizar · preparar materiales',difficultyParameters:{requiredResources:level}});
   const updates=home?[
    ['Ibas a dibujar. No queda papel. Ahora toca jugar con bloques.','¿Qué debes preparar ahora?','Los bloques',['El papel para dibujar']],
    ['Ibas a dibujar con lápices. No queda papel. Los bloques están guardados y disponibles.','¿Qué puedes usar sin buscar papel?','Los bloques',['Los lápices para dibujar']],
    ['No queda papel. Puedes usar bloques o puzles. Tu hermana usa los puzles.','¿Qué puedes preparar sin interrumpirla?','Los bloques',['Los puzles']]
   ]:[
    ['Ibas a jugar fuera. Ahora llueve. El juego pasa dentro.','¿Dónde debes preparar el juego?','Dentro',['Fuera']],
    ['Llueve. El juego pasa dentro. La sala grande está ocupada. La pequeña está libre.','¿Dónde puedes preparar el juego?','En la sala pequeña',['En la sala grande']],
    ['Llueve. El juego pasa dentro. La sala grande está ocupada. La pequeña cierra pronto.','¿Qué dato falta para elegir la sala pequeña?','Si da tiempo a terminar',['Si sigue lloviendo']]
   ];
   const [source,q,a,wrong]=updates[level-1];add('executive.update',scenario,q,[T(source)],a,wrong,{topic:'Organizar · revisar un plan',difficultyParameters:{updatedConstraints:level}});
   const names=home?['Guardar un juguete','Lavar el vaso','Montar la pista']:['Guardar el lápiz','Cerrar el estuche','Empezar el puzle'];
   const timing=level===1?[T('Faltan cinco minutos para salir.'),table([[names[0],'Un minuto'],[names[2],'Diez minutos']])]:level===2?[T('Tienes cinco minutos. La primera tarea tarda dos. La segunda tarda dos.'),table([['Hacer las dos','Cuatro minutos'],['Empezar el juego','Diez minutos']])]:[T('Tienes cinco minutos. Guardar tarda dos. Cerrar tarda uno. Falta recoger durante tres.'),table([['Hacer las tres','Seis minutos'],['Guardar y cerrar','Tres minutos']])];
   const answer=level===1?names[0]:level===2?'Hacer las dos':'Guardar y cerrar';
   add('executive.time',scenario,'¿Qué plan cabe en el tiempo disponible?',timing,answer,[level===1?names[2]:level===2?'Empezar el juego':'Hacer las tres'],{topic:'Organizar · comprobar el tiempo',difficultyParameters:{steps:level}});
  }
 }
 if(domain==='memory'&&age==='early'&&level>=2)for(let v=0;v<3;v++){
  const shown=[['el libro','la pelota','el lápiz'],['la manzana','el cuaderno','la gorra'],['el regalo','la botella','la galleta']][v].slice(0,level===2?2:3);
  for(const reverse of level===3?[false,true]:[false]){
   const answer=reverse?[...shown].reverse():shown.slice(-1),family=reverse?'memory.reverse':'memory.recent';
   add(family,['school.materials','home.errand','community.party'][v],reverse?'Recuerda las imágenes. Después irán al revés.':'Recuerda solo la última imagen.',[{...L(shown),label:['Prepara la mochila del colegio en este orden.','Prepara la bolsa de la salida en este orden.','Prepara el regalo de cumpleaños en este orden.'][v]}],undefined,[],{type:'memoryReveal',responseType:'order',memoryResponse:'order',memoryContent:shown.map(detail=>({detail})),memoryQuestion:reverse?'Pon las imágenes en orden inverso.':'¿Qué imagen estaba al final?',tokens:[...answer].reverse(),answer,revealMs:10000,recallEvidence:{kind:'sequence',block:0,...(reverse?{reverse:true}:{takeLast:1})},topic:'Memoria · transformar lo que recuerdas'},v);
  }
 }
 if(domain==='speedReasoning'&&age==='early')for(const home of [false,true]){
  const scenario=home?'home.storage':'school.materials',symbols=['○','□','△','☆'].slice(0,level+1),target=symbols.at(-1),key=symbols.map((x,i)=>[x,String(i+1)]);
  const context=home?'Usa la clave para buscar el cajón de casa.':'Usa la clave para buscar el armario de clase.';
  add('speed.key',scenario,'¿Qué número corresponde a '+target+'?',[table(key),T(context)],String(key.length),['1','2','3','4'].filter(x=>x!==String(key.length)),{speedTask:true,speedFamily:'key',speedRevision:4,topic:'Velocidad · localizar con una clave',difficultyParameters:{keyEntries:key.length}});
  const model=['○','□','△'].slice(0,level).join(' '),wrongModel=level===1?'□':model.split(' ').reverse().join(' ');
  add('speed.match',scenario,'¿Qué etiqueta coincide con el modelo?',[T('Modelo: '+model),T(home?'Busca la etiqueta para guardar las piezas en su caja.':'Busca la etiqueta para devolver las piezas al aula.')],model,[wrongModel,model+' ☆'],{speedTask:true,speedFamily:'match',speedRevision:4,topic:'Velocidad · revisar una etiqueta',difficultyParameters:{elements:level,distractorSimilarity:level}});
  const translation=key.slice(0,Math.min(level,3)),sequence=translation.map(x=>x[0]).reverse(),answer=translation.map(x=>x[1]).reverse().join(' ');
  add('speed.translation',scenario,'Cambia las figuras por números. Mantén el orden.',[table(translation),T('Secuencia: '+sequence.join(' ')),T(home?'La secuencia indica qué cajones abrir.':'La secuencia indica qué armarios abrir.')],answer,[translation.map(x=>x[1]).join(' '),answer+' 4',level===1?'2':'1'].filter(x=>x!==answer),{speedTask:true,speedFamily:'translation',speedRevision:4,topic:'Velocidad · seguir una clave',difficultyParameters:{lookups:translation.length,orderedSteps:sequence.length}});
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
  english.push(
   ['english.vocabulary','home.routines',[
    ['The note says: Keep the door shut.','What does shut mean here?','Closed',['Open','Broken']],
    ['Please store the board game on the upper shelf.','What does upper mean here?','Higher',['Lower','Nearest']],
    ['Keep the instructions handy while assembling the shelf.','What does handy mean here?','Easy to reach and use',['Written by hand only','Already thrown away']]
   ]],
   ['english.grammar','home.message',[
    ['We cook dinner on Fridays. Today is Friday.','Complete: We ___ dinner today.','cook',['cooks','cooking']],
    ['The shopping trip finished yesterday.','Complete: Yesterday we ___ to the shop.','went',['go','will go']],
    ['You do not have the ingredients now. You are imagining a different situation.','Complete: If we had flour, we ___ bread.','would make',['made yesterday','have made']]
   ]],
   ['english.connector','transport.plan',[
    ['The bus is late. We will walk instead.','Complete: The bus is late, ___ we will walk.','so',['but','although']],
    ['The train is crowded. There are two seats left.','Complete: It is crowded, ___ two seats are free.','but',['because','so']],
    ['The service runs unless the road is closed.','Which statement preserves the exception?','A road closure may stop the service',['It always runs on a closed road','It runs only when the road is closed']]
   ]],
   ['english.sequence','school.instructions',[
    ['First write your name. Then answer question one.','What should you do first?','Write your name',['Answer question one','Hand in the sheet']],
    ['Read the instructions, draw the shape, then colour it.','What comes immediately before colouring?','Draw the shape',['Read the instructions','Put the pencils away']],
    ['Check the drawing after colouring it. Read the key before choosing colours.','What must happen before choosing colours?','Read the key',['Check the finished drawing','Colour the drawing first']]
   ]],
   ['english.time','transport.bus',[
    ['The bus leaves at 10:00. You arrive at 9:50.','How many minutes are left before departure?','10 minutes',['5 minutes','20 minutes']],
    ['The bus leaves at 10:15. The walk takes 25 minutes.','What is the latest time to start walking?','9:50',['10:00','10:15']],
    ['The bus leaves at 10:15. Walking takes 20 minutes. Allow 10 minutes to buy a ticket.','What is the latest time to leave home?','9:45',['9:55','10:05']]
   ]],
   ['english.inference','school.project',[
    ['The group needs scissors to cut paper. Jo brings scissors.','Which task is Jo preparing for?','Cutting paper',['Painting a wall','Reading aloud']],
    ['The glue is still wet. Jo leaves the model flat rather than packing it.','Why is Jo probably waiting?','To let the glue dry',['To change the model into paper','To cancel the project']],
    ['The notice asks for a photo by Friday. Jo has taken one, but has not sent it.','What can the group conclude?','Taking the photo does not show it has been submitted',['The group definitely has the photo','The deadline has definitely changed']]
   ]],
   ['english.intent','home.message',[
    ['Please leave the key on the kitchen table.','Where should you leave the key?','On the kitchen table',['In your bag','Under the chair']],
    ['Please text me before leaving, not after you arrive.','When is the message asking for a text?','Before leaving',['After arriving','Only the next morning']],
    ['The new address may be missing from your copy. Could you check before setting off?','What response meets the request?','Confirm the current address before travelling',['Use the old address without checking','Confirm only that the trip is finished']]
   ]],
   ['english.evidence','home.notice',[
    ['The repair visit is on Friday.','Which statement matches the message?','The visit is on Friday',['The visit is on Monday','The visit is cancelled']],
    ['The visitor comes on Friday, but only after 4:00.','Which arrival fits both details?','Friday at 4:30',['Friday at 3:30','Thursday at 4:30']],
    ['The visit is planned for Friday. A delay is possible; confirmation will come Thursday.','What does the message support?','Friday is planned but not yet confirmed',['Friday is guaranteed','The visit is definitely cancelled']]
   ]],
   ['english.location','community.sports',[
    ['The balls are inside the red cupboard.','Where are the balls?','Inside the red cupboard',['On top of it','Behind the door']],
    ['The equipment room is between the entrance and the pool, opposite the office.','Which description identifies the equipment room?','Between the entrance and the pool',['Inside the office','Behind the pool']],
    ['The old sign points upstairs. The current notice says equipment has moved beside reception.','Where should you look now?','Beside reception',['At the old upstairs point','Inside the pool']]
   ]]
  );
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
   const youngThird={
    'social.boundary':['Puedes leer la libreta. No puedes escribir ni prestarla.','¿Qué acción respeta las dos condiciones?','Leerla y devolverla',['Escribir una nota','Prestarla sin escribir']],
    'social.help':['No entiendes el segundo paso. Ya has probado el primero.','¿Qué dato ayuda a pedir ayuda?','Decir qué paso no entiendes',['Decir solo «todo está mal»','Pedir otra tarea sin explicar']],
    'social.repair':['Dijiste que el juego era el lunes. Ahora sabes que es el martes.','¿Qué debes decir al grupo?','Que te equivocaste y es el martes',['Solo que cambió algo','Que siga usando el lunes']],
    'social.perspective':['Mar leyó la hora antigua. Leo sí recibió la hora nueva.','¿Quién necesita el aviso nuevo?','Mar',['Leo','Nadie']],
    'social.intent':['Te dicen «Luego lo miramos». No dicen a qué hora.','¿Qué puedes preguntar para saber cuándo?','¿A qué hora lo miramos?',['¿Qué color te gusta?','¿Ya lo hemos mirado?']],
    'social.cooperation':['Hay que dibujar y escribir. Ana quiere dibujar. Leo puede escribir.','¿Qué reparto permite hacer las dos partes?','Ana dibuja y Leo escribe',['Los dos dibujan y nadie escribe','Los dos esperan sin acordarlo']],
    'social.emotion':['Pau está callado. No ha dicho cómo se siente.','¿Qué puedes hacer sin adivinar su emoción?','Preguntarle cómo se encuentra',['Decir que está enfadado seguro','Decir que está contento seguro']],
    'social.nonliteral':['Leo dice «no puedo dar un paso más». Se sienta a descansar.','¿Qué explica su frase y lo que hace?','Está muy cansado',['Quiere empezar otra ruta','Acaba de levantarse descansado']]
   };
   const [source,q,a,wrong]=age==='early'&&level===3?youngThird[family]:versions[level-1];
   add(family,'school.shared_task',q,[T('Estás en clase. '+source)],a,wrong,{topic:'Social Lab · comprender y convivir',why:quality.registry[family].functionalPurpose+'.'});
  }
 }

 if(domain==='attention'&&age==='early')for(const home of [false,true]){
  const sc=home?'home.snack':'school.materials',names=home?['Botella A','Botella B']:['Caja A','Caja B'];
  const wanted=home?['llena','con tapa','limpia']:['lista','cerrada','pequeña'];
  add('attention.conditions',sc,'Elige la opción que tenga: '+wanted.slice(0,level).join(', ')+'.',[table([[names[0],wanted.slice(0,level).join(', ')],[names[1],level===1?'Vacía':wanted.slice(0,level-1).join(', ')]])],names[0],[names[1]],{ageProfile:{id:'early',revision:1,context:'school',mechanic:'matching',family:'functional-attention.conditions'},topic:'Atención · comprobar condiciones',difficultyParameters:{rules:level}});
  const values=(home?['Pan','Leche','Fruta','Agua']:['Papel','Lápiz','Goma','Regla']).slice(0,level+1),target=values[1],remaining=values.filter(x=>x!==target);
  add('attention.omission',sc,'¿Qué falta en la lista 2?',[table([['Lista 1',values.join(', ')],['Lista 2',(level===3?[...remaining].reverse():remaining).join(', ')]])],target,[values[0],...(values[2]?[values[2]]:[])],{ageProfile:{id:'early',revision:1,context:'school',mechanic:'matching',family:'functional-attention.omission'},topic:'Atención · comparar listas',difficultyParameters:{elements:values.length,reordered:level===3},why:target+' aparece en la lista 1. Falta en la lista 2.'});
  const optionNames=home?['Plato A','Plato B','Plato C']:['Caja A','Caja B','Caja C'];
  const instruction=level===1?'La nota pide la primera opción.':level===2?'La nota pide la opción entre la primera y la última.':'La nota pide la marcada. Si no hay marca, pide la última.';
  const rows=level===3?[[optionNames[0],'Sin marca'],[optionNames[1],'Con marca'],[optionNames[2],'Sin marca']]:optionNames.slice(0,level===1?2:3).map((name,i)=>[String(i+1),name]);
  add('attention.instructions',sc,instruction+' ¿Cuál eliges?',[table(rows)],optionNames[level===1?0:1],optionNames.filter((_,i)=>i!==(level===1?0:1)),{ageProfile:{id:'early',revision:1,context:'school',mechanic:'matching',family:'functional-attention.instructions'},topic:'Atención · seguir una nota',difficultyParameters:{conditions:level===3?2:1,relations:level}});
  const activity=home?'Sopa':'Dibujo',other=home?'Arroz':'Música';
  const records=level===1?[[activity,'Lunes'],[other,'Martes']]:level===2?[[other,'Lunes'],[activity,'Martes'],[home?'Fruta':'Lectura','Miércoles']]:[[activity+' antes','Lunes'],[activity+' ahora','Miércoles'],[other,'Martes']];
  add('attention.document_lookup',home?'home.menu':'school.schedule',level===3?'¿Qué día indica el aviso nuevo para '+activity.toLowerCase()+'?':'¿Qué día hay '+activity.toLowerCase()+'?',[...(level===3?[T('El aviso nuevo es la fila que dice «ahora».')]:[]),table(records)],level===1?'Lunes':level===2?'Martes':'Miércoles',['Lunes','Martes','Miércoles'].filter(x=>x!==(level===1?'Lunes':level===2?'Martes':'Miércoles')),{ageProfile:{id:'early',revision:1,context:'school',mechanic:'matching',family:'functional-attention.document_lookup'},topic:'Atención · consultar información',difficultyParameters:{rows:records.length,updatedSource:level===3}});
 }
 if(domain==='language'&&age==='early')for(const home of [false,true]){
  const subject=home?'El gato':'La niña',verb=home?'duerme':'dibuja',words=level===1?[home?'El':'La',home?'gato':'niña',verb]:level===2?[subject,verb,home?'en casa':'en clase']:[subject,'no '+verb,home?'antes de cenar':'antes de comer'];
  const q=level===1?'Forma la frase. Empieza por «'+words[0]+'».':level===2?'Ordena: quién, qué hace, dónde.':'Ordena: quién, qué no hace, cuándo.';
  add('language.sentence_order',home?'home.routines':'school.routines',q,[L(words)],undefined,[],{type:'order',responseType:'order',tokens:[...words].reverse(),answer:words,ageProfile:{id:'early',revision:1,context:'school',mechanic:'sentence',family:'functional-language.sentence_order'},topic:'Lenguaje · construir frases',difficultyParameters:{words:words.join(' ').split(' ').length,negation:level===3,temporalRelation:level===3}});
 }
 if(domain==='social'){
  const cases=[
   ['social.boundary',[
    ['Tu hermano pide que llames antes de entrar en su cuarto.','¿Qué respeta su petición?','Llamar y esperar respuesta',['Entrar sin esperar','Abrir para ver qué hace']],
    ['Tu hermano deja usar su cuarto para leer, pero no su ordenador.','¿Qué respeta el permiso?','Leer sin usar el ordenador',['Leer y abrir el ordenador','Prestar el ordenador a otra persona']],
    ['Puedes leer en el cuarto. Debes salir antes de cenar. No puedes usar el ordenador.','¿Qué plan respeta todo el acuerdo?','Leer y salir antes de cenar',['Leer allí durante la cena','Usar el ordenador antes de salir']]
   ]],
   ['social.help',[
    ['No llegas al estante donde está tu vaso. Hay una persona adulta cerca.','¿Qué petición explica lo que necesitas?','¿Me ayudas a coger mi vaso?',['¿Cuántos vasos hay?','¿Te gusta el estante?']],
    ['En el estante hay varios vasos. Necesitas el tuyo, junto a la jarra.','¿Qué petición ayuda a encontrarlo?','¿Me acercas el vaso junto a la jarra?',['Dame cualquier cosa del estante','¿Me acercas todos los vasos?']],
    ['No alcanzas tu vaso. Hay varios parecidos. El tuyo está junto a la jarra.','¿Qué debes explicar para recibir la ayuda que necesitas?','Que no lo alcanzas y dónde está',['Solo que hay vasos','Solo que te gusta la jarra']]
   ]],
   ['social.repair',[
    ['Has derramado agua en la mesa compartida. Otra persona está dibujando allí.','¿Qué ayuda a reparar lo ocurrido?','Avisar y ayudar a secar',['Tapar el agua con su dibujo','Esperar sin avisar']],
    ['El agua ha mojado un dibujo. Puedes ofrecer papel seco.','¿Qué reconoce el daño y ofrece ayuda?','Lo siento. ¿Te traigo papel seco?',['No importa que esté mojado','Era agua, así que no pasó nada']],
    ['El agua ha mojado dos dibujos. Ya avisaste a una persona. La otra no sabe.','¿Qué falta hacer para ayudar a las dos?','Avisar también a la otra persona',['Dar por hecho que ya lo sabe','Guardar su dibujo sin avisar']]
   ]],
   ['social.perspective',[
    ['Han cambiado de sitio las llaves. Quien acaba de llegar no lo sabe.','¿Qué información necesita?','Dónde están ahora las llaves',['Cuántas puertas hay','Dónde estaban antes']],
    ['Ana vio guardar las llaves en el cajón. Leo estaba fuera.','¿Quién necesita saber dónde están?','Leo',['Ana','Nadie']],
    ['Ana vio las llaves en el cajón. Después las moviste al estante. Ana no lo vio.','¿Qué necesita saber Ana para encontrarlas ahora?','Que ahora están en el estante',['Que antes estaban en el cajón','Que tú llegaste temprano']]
   ]],
   ['social.intent',[
    ['Al poner la mesa te dicen: «¿Puedes acercarme ese plato?».','¿Qué te están pidiendo?','Que acerques el plato',['Que guardes todos los platos','Que empieces a comer']],
    ['Alguien mira la ventana abierta y pregunta: «¿Podemos cerrarla?».','¿Qué propone hacer?','Cerrar la ventana',['Abrir otra ventana','Salir sin hablar']],
    ['Una persona dice que le falta un plato. No ha pedido ayuda todavía.','¿Qué pregunta aclara si necesita ayuda?','¿Quieres que te acerque uno?',['¿Por qué nunca pones la mesa?','¿Ya has terminado de comer?']]
   ]],
   ['social.cooperation',[
    ['Vais a recoger juntos. Hay juguetes y libros fuera de su sitio.','¿Qué acuerdo permite colaborar?','Acordar quién guarda cada cosa',['Cambiarlo todo sin hablar','Esperar a que lo haga otra persona']],
    ['Tú recoges los juguetes. Otra persona recoge los libros. Una caja bloquea el paso.','¿Qué ayuda a seguir con las dos tareas?','Acordar dónde mover la caja',['Añadir más cosas delante','Cambiar las tareas sin avisar']],
    ['Hay que guardar libros y juguetes. Ana ya guarda libros. Leo pregunta qué queda.','¿Qué reparto evita repetir una tarea y dejar otra sin hacer?','Que Leo guarde los juguetes',['Que Leo repita los libros','Que los dos dejen todo a medias']]
   ]],
   ['social.emotion',[
    ['Una persona dice: «Me preocupa perder el autobús».','¿Qué pista expresa cómo se siente?','Dice que le preocupa perderlo',['El color del autobús','El tamaño de la parada']],
    ['Una persona dice: «Tengo ganas de ir, pero me preocupa llegar tarde».','¿Qué recoge las dos cosas que ha dicho?','Tiene ganas y está preocupada',['Solo está enfadada','No quiere ir en absoluto']],
    ['Dice que está preocupada por llegar tarde. Después se queda callada.','¿Qué sabes sin adivinar por qué se calla?','Ha dicho que está preocupada',['Está enfadada contigo seguro','Ya no tiene ninguna preocupación']]
   ]],
   ['social.nonliteral',[
    ['Al ver muchos platos sucios, alguien dice: «Tenemos una montaña de platos».','¿Qué quiere decir?','Que hay muchos platos',['Que están en el monte','Que hay que salir de casa']],
    ['La ventana está abierta. Hace frío. Alguien dice: «Me estoy congelando».','¿Qué comunica en esa situación?','Que tiene mucho frío',['Que hay hielo dentro de su cuerpo','Que quiere abrir otra ventana']],
    ['La mesa está llena de platos. Alguien dice «qué despejada». No conoces el tono.','¿Qué conviene comprobar antes de interpretarlo?','Si lo dice con ironía',['Que la mesa está vacía seguro','Que no ha visto ningún plato']]
   ]]
  ];
  for(const [family,versions] of cases){const [source,q,a,wrong]=versions[level-1];add(family,'home.shared_activity',q,[T(source)],a,wrong,{topic:'Social Lab · convivencia en casa',why:quality.registry[family].functionalPurpose+'.',difficultyParameters:{operation:['explicitCue','combineCues','limitInference'][level-1]}});}
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
 for(const field of ['q','stimulus','a','answer','memoryQuestion','memoryContent','type','responseType','qualityDescriptor','recallEvidence','currencyContext','ageProfile','juniorProfile','schoolProfile','teenReview','speedTask','speedFamily','speedRevision','difficultyParameters','revealMs','mechanic'])if(JSON.stringify(item[field])!==JSON.stringify(expected[field]))throw Error('La respuesta no coincide con la fuente funcional: '+field);
 for(const field of ['opts','tokens'])if(JSON.stringify([...(item[field]||[])].sort())!==JSON.stringify([...(expected[field]||[])].sort()))throw Error('Opciones funcionales modificadas.');
 return true;
}
function generate(age,domain,level){const key=[age,domain,level].join(':');if(!cache.has(key))pool(age,domain,level);const bank=cache.get(key)||[];return bank.length?structuredClone(bank[Math.floor(Math.random()*bank.length)]):null;}
const api={pool,generate,validate};root.FunctionalContent=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

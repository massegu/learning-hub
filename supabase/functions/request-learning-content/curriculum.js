(function(root){
'use strict';
const library=root.ReadingLibrary||(typeof require==='function'&&require('./reading-library'));
const ages=['early','junior','primary','middle','teen'];
const T=text=>({type:'text',text}), L=items=>({type:'list',items,presentation:'sequence'}), R=rows=>({type:'table',rows});
function rotate(a,n){return a.slice(n%a.length).concat(a.slice(0,n%a.length));}
function shuffled(a,seed){const b=[...a];for(let i=b.length-1;i>0;i--){seed=(Math.imul(seed+1,1664525)+1013904223)>>>0;const j=seed%(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;}
function choice(q,stimulus,a,wrong,extra={}){return {type:'standard',responseType:'choice',requiresStimulus:true,q,stimulus,a,opts:[a,...wrong.filter(x=>x!==a)],...extra};}
function finish(item,age,domain,level,key,mechanic){
 const id=`curriculum-v2-${age}-${domain}-${level}-${key}`;
 const earlyMechanic=domain==='reading'?'literal':domain==='speedReasoning'?'speedCompare':domain==='memory'?(item.memoryResponse==='spatial'?'rememberPlace':'rememberOrder'):'planning';
 return {...item,id,contentKey:id,semanticKey:item.passageKey||id,domain,level,mechanic,
  ...(age==='early'?{ageProfile:{id:'early',revision:1,context:'school',mechanic:earlyMechanic,family:`${domain}-${mechanic}`}}:{}),
  ...(age==='junior'?{juniorProfile:{route:age,level}}:{}),...(['primary','middle'].includes(age)?{schoolProfile:{route:age,level}}:{})};
}
function reading(age,domain,level){
 return library[age].flatMap((entry,i)=>{
  const [title,text,q,a,b,iq,ia,ib]=entry,source=[T(text)],passageKey=`reading-v2-${age}-${i}`;
  const base={topic:title,passageKey,why:age==='early'?'Busca la pista en la historia.':ia+'. La explicación debe apoyarse en lo que cuenta el texto.'};
  const tasks=[choice(q,source,a,[b],{...base,why:`La respuesta se encuentra en el texto: ${a}.`})];
  if(age!=='early')tasks.push(choice(iq,source,ia,[ib],base));
  if(domain==='literacy')tasks.push({type:'self',requiresStimulus:true,responseType:'written',q:`${iq} Escribe ${age==='primary'?'dos o tres frases':'un párrafo breve'}: responde y explica qué dato del texto apoya tu respuesta.`,stimulus:source,...base,sample:ia+'. Una pista del texto es: «'+(text.split(/(?<=[.!?])\s+/)[({primary:[1,5,5,0,3,4,2,5,5,4],middle:[3,3,2,3,3,4,4,3,4,3],teen:[4,4,6,4,5,3,4,5,4,5]})[age]?.[i]||0]||text.split(/(?<=[.!?])\s+/).at(-1))+'».',writingRubric:['Respondo a la pregunta con claridad.','Uso un dato concreto del texto para justificar mi respuesta.','Reviso que las frases se entiendan y tengan puntuación.']});
  return tasks.map((it,m)=>finish(it,age,domain,level,`${i}-${m}`,'reading_'+(['literal','inference','writing'][m])));
 });
}
const objects=['el libro','la pelota','el lápiz','la manzana','la botella','la gorra','el cuaderno','el regalo','la galleta'];
function spatialPositions(size){return Array.from({length:size*size},(_,i)=>`Fila ${Math.floor(i/size)+1}, columna ${i%size+1}`);}
function memory(age,level){
 const rank=ages.indexOf(age),count=Math.min(8,rank+level+1),items=[];
 for(let v=0;v<18;v++){
  const values=shuffled(objects,57+v).slice(0,count),reverse=level===3&&rank>=2,expected=reverse?[...values].reverse():values;
  items.push(finish({type:'memoryReveal',responseType:'order',memoryResponse:'order',requiresStimulus:true,
   q:reverse?'Mira la secuencia. Después la repetirás desde el final.':'Mira la secuencia. Después repetirás el orden.',
   memoryQuestion:reverse?'Reproduce la secuencia en orden inverso.':'Reproduce la secuencia en el mismo orden.',
   stimulus:[L([...values])],memoryContent:values.map(detail=>({detail})),tokens:shuffled(values,19+v),answer:[...expected],
   revealMs:Math.max(6000,count*1400),sequenceStepMs:1400,recallSequence:[...values],
   recallEvidence:{kind:'sequence',block:0,reverse},topic:'Memoria · secuencias',
   why:expected.join(' → ')},age,'memory',level,`sequence-${v}`,'memory_sequence'));
  const size=rank<2?2:level===1?2:3,capacity=size*size,load=Math.min(capacity,level+(rank>=2?2:1));
  const places=shuffled(Array.from({length:capacity},(_,i)=>i),v+41),marked=values.slice(0,load),grid=Array.from({length:size},()=>Array(size).fill('—'));
  marked.forEach((x,i)=>{grid[Math.floor(places[i]/size)][places[i]%size]=x;});
  // Level 3 asks for two positions for older groups; ordered binding prevents a swapped answer.
  const dual=rank>=2&&level===3,target=marked[0],target2=marked[1];
  const pos=n=>`Fila ${Math.floor(n/size)+1}, columna ${n%size+1}`;
  const a=dual?pos(places[0])+' → '+pos(places[1]):pos(places[0]);
  const opts=dual?[a,pos(places[1])+' → '+pos(places[0]),pos(places[0])+' → '+pos(places[2]),pos(places[2])+' → '+pos(places[1])]:spatialPositions(size);
  items.push(finish({type:'memoryReveal',responseType:'choice',memoryResponse:dual?'spatialPair':'spatial',requiresStimulus:true,
   q:'Mira dónde está cada objeto. Después taparemos el cuadro.',memoryQuestion:dual?`¿Dónde estaban ${target} y ${target2}, en ese orden?`:`¿Dónde estaba ${target}?`,
   stimulus:[{...R(grid),presentation:'spatial',label:'Filas de arriba abajo; columnas de izquierda a derecha.'}],memoryContent:marked.map(detail=>({detail})),
   a,opts,gridSize:size,revealMs:Math.max(6000,load*1800),recallEvidence:{kind:'spatial',block:0,targets:dual?[target,target2]:[target]},topic:'Memoria · posiciones',why:a},age,'memory',level,`spatial-${v}`,'memory_spatial'));
  // Associations keep memory broader than the two new recall modes.
  const people=['Ana','Leo','Sol','Dani','Mar','Hugo','Lola','Nora'].slice(0,count),pairs=people.map((n,i)=>[n,values[i]]),ask=v%count;
  items.push(finish({type:'memoryReveal',responseType:'choice',requiresStimulus:true,q:'Mira quién tiene cada objeto. Después lo taparemos.',memoryQuestion:`¿Qué tenía ${people[ask]}?`,stimulus:[R(pairs)],memoryContent:pairs.map(([person,detail])=>({person,detail})),a:values[ask],opts:rotate(values,ask).slice(0,rank===0?Math.min(3,count):4),revealMs:Math.max(6000,count*1700),answerEvidence:{type:'tableCell',block:0,row:ask,column:1,subjectColumn:0},topic:'Memoria · personas y objetos'},age,'memory',level,`association-${v}`,'memory_association'));
 }
 return items;
}
function speed(age,level){
 const rank=ages.indexOf(age),glyphs=['○','□','△','☆'],pool=[];
 for(let v=0;v<96;v++){
  const n=rank===0?level:rank===1?level+1:rank+level;
  const first=Array.from({length:n},(_,j)=>glyphs[(Math.floor(Math.floor(v/2)/Math.pow(4,j)))%4]);
  const second=[...first],same=v%2===0;
  if(!same){const index=(v+level)%n;second[index]=glyphs[(glyphs.indexOf(second[index])+1)%4];}
  pool.push(finish(choice('¿Son iguales?',[R([[first.join(' '),second.join(' ')]])],same?'Sí':'No',[same?'No':'Sí'],{topic:'Velocidad · comparar figuras',speedTask:true,speedFamily:'figures',speedEvidence:{kind:'equal',block:0},why:same?'Las dos series son iguales.':'Hay una figura diferente.'}),age,'speedReasoning',level,`compare-${v}`,'speed_compare'));
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
 return tasks;
}
const cache=new Map();let reasoningProvider=null;
function registerReasoning(provider){reasoningProvider=provider;for(const key of cache.keys())if(key.includes(':executive:'))cache.delete(key);}

function supports(age,domain){return ages.includes(age)&&(['executive','applied','memory','speedReasoning'].includes(domain)||(['early','junior'].includes(age)?domain==='reading':['primary','middle','teen'].includes(age)&&['literacy','reading','middleReading'].includes(domain)));}
function pool(age,domain,level=1){
 if(!supports(age,domain))return [];
 const actual=domain==='applied'?'executive':domain,readingDomain=['reading','middleReading','literacy'].includes(actual),key=[age,actual,level].join(':');
 if(!cache.has(key)){
  const bank=readingDomain?reading(age,actual,level):actual==='memory'?memory(age,level):actual==='speedReasoning'?speed(age,level):executive(age,level);
  if(actual==='executive'&&reasoningProvider&&age!=='early')bank.push(...reasoningProvider(age,level).map(it=>({...it,domain:'executive',topic:'Funciones ejecutivas · razonamiento',mechanic:'executive_reasoning_'+it.mechanic,contentKey:'merged-'+it.contentKey})));
  cache.set(key,bank);
 }
 return structuredClone(cache.get(key)).map(it=>domain==='applied'?{...it,domain,...(age==='early'?{ageProfile:{...it.ageProfile,mechanic:'chooseObject'}}:{})}:it);
}
function generate(age,domain,level=1){const actual=domain==='applied'?'executive':domain,key=[age,actual,level].join(':');if(!cache.has(key))pool(age,actual,level);const bank=cache.get(key)||[];const it=bank[Math.floor(Math.random()*bank.length)];return it?{...structuredClone(it),domain,...(age==='early'&&domain==='applied'?{ageProfile:{...it.ageProfile,mechanic:'chooseObject'}}:{})}:null;}
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
const api={pool,generate,supports,visible,migrate,speedSummary,registerReasoning,spatialPositions};root.Curriculum=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

(function(root){
 'use strict';
 const ages=['early','junior','primary','middle','teen'];
 const ageYears={early:7,junior:8,primary:10,middle:13,teen:16};
 const cases={
  early:[
   ['Pedir ayuda','La caja de lápices no se abre.','¿Qué puedes decir?','¿Me ayudas a abrir la caja?',['Dame otra caja ahora.','No quiero hacer la actividad.']],
   ['Aclarar una indicación','La nota dice: «Haz la página». No dice qué página.','¿Qué puedes preguntar?','¿Qué página tengo que hacer?',['La página ya está hecha.','Voy a elegir una página cualquiera.']],
   ['Expresar una necesidad','Hay mucho ruido y no oyes el cuento.','¿Qué puedes pedir?','¿Podemos bajar un poco el volumen?',['Quiero que se acabe el cuento.','Voy a hablar más alto que todos.']]
  ],
  junior:[
   ['Pedir ayuda','En el juego, una pieza no encaja y ya has probado a girarla.','¿Cómo puedes pedir ayuda?','¿Me das una pista para colocar esta pieza?',['Ponla tú y seguimos.','Este juego está mal hecho.']],
   ['Aclarar una indicación','El grupo debe preparar una cartulina, pero no sabe qué tema elegir.','¿Qué pregunta ayuda a empezar?','¿Qué tema tenemos que poner en la cartulina?',['¿Quién termina primero?','¿Podemos guardar ya la cartulina?']],
   ['Expresar una necesidad','No has oído cuándo empieza el turno porque había ruido.','¿Qué puedes decir?','No oí cuándo empieza mi turno. ¿Me lo repites?',['Empiezo ahora sin preguntar.','Nadie ha explicado nada.']]
  ],
  primary:[
   ['Pedir ayuda','El equipo tiene que entregar un trabajo y no entiende el último paso.','¿Qué mensaje facilita que alguien pueda ayudarte?','No entendemos el último paso. ¿Puedes explicarlo con un ejemplo?',['El trabajo es imposible.','Haz tú todo el trabajo.']],
   ['Aclarar una indicación','El aviso dice que la actividad es el viernes, pero no indica la hora.','¿Qué conviene preguntar?','¿A qué hora empieza la actividad del viernes?',['¿Por qué es el viernes?','¿Quién ha escrito el aviso?']],
   ['Expresar una necesidad','En una actividad de grupo te cuesta seguir porque todos hablan a la vez.','¿Qué propuesta comunica el problema y una solución?','Me cuesta seguir cuando hablamos a la vez. ¿Podemos ir por turnos?',['No voy a participar.','El grupo siempre lo hace todo mal.']]
  ],
  middle:[
   ['Pedir ayuda','Un documento compartido no carga y el plazo de entrega es hoy.','¿Qué mensaje ayuda a resolverlo?','El documento no carga y la entrega es hoy. ¿Podéis compartir otra copia?',['No puedo trabajar.','Lo entregaré cuando pueda.']],
   ['Aclarar una indicación','Una invitación indica el lugar, pero no especifica si hay que llevar material.','¿Qué pregunta concreta falta?','¿Hay que llevar algún material?',['¿Quién organiza la invitación?','¿Cuánto durará exactamente?']],
   ['Expresar una necesidad','En una reunión rápida no has podido explicar una idea.','¿Qué petición es clara y respetuosa?','Quiero completar mi idea. ¿Podemos reservar un minuto al final?',['No hay ninguna propuesta que escuchar.','Mejor no digo nada.']]
  ],
  teen:[
   ['Pedir ayuda','Una consigna de un proyecto menciona un formato que no conoces.','¿Qué mensaje permite recibir ayuda útil?','No conozco el formato indicado. ¿Podrías mostrarme un ejemplo o recomendar una guía?',['No voy a hacer el proyecto.','El formato debería ser otro.']],
   ['Aclarar una indicación','Un mensaje de equipo propone reunirse «después de clase» sin indicar día.','¿Qué dato conviene confirmar?','¿Qué día nos reunimos después de clase?',['¿Quién escribió el mensaje?','¿Cuánto durará la reunión?']],
   ['Expresar una necesidad','En una conversación no estás de acuerdo con una propuesta y quieres explicar por qué.','¿Qué inicio permite expresar tu punto de vista?','Veo la propuesta de otra manera. ¿Puedo explicar mi motivo?',['La propuesta no tiene sentido.','No voy a hablar de esto.']]
  ]
 };
 const earlyVariants=[
  [
   ['Pedir ayuda','La caja de lápices no se abre.','¿Qué puedes decir?','¿Me ayudas con la caja, por favor?',['Hazlo tú todo.','No quiero seguir.']],
   ['Pedir ayuda','Una pieza no encaja en el puzle.','¿Qué puedes decir?','¿Me ayudas a colocar esta pieza?',['Hazlo tú todo.','No quiero seguir.']],
   ['Pedir ayuda','Se ha terminado el color que necesitas.','¿Qué puedes decir?','¿Me prestas otro color, por favor?',['Hazlo tú todo.','No quiero seguir.']],
   ['Pedir ayuda','La cremallera de tu mochila se ha atascado.','¿Qué puedes decir?','¿Me ayudas con la cremallera?',['Hazlo tú todo.','No quiero seguir.']],
   ['Pedir ayuda','Hay una palabra que no entiendes.','¿Qué puedes decir?','¿Me explicas esta palabra?',['Hazlo tú todo.','No quiero seguir.']],
   ['Pedir ayuda','No llegas a una caja que está arriba.','¿Qué puedes decir?','¿Me ayudas a bajar la caja?',['Hazlo tú todo.','No quiero seguir.']],
   ['Pedir ayuda','El pegamento se ha terminado.','¿Qué puedes decir?','¿Me prestas pegamento?',['Hazlo tú todo.','No quiero seguir.']],
   ['Pedir ayuda','No puedes abrir el bote de pintura.','¿Qué puedes decir?','¿Me ayudas a abrir el bote?',['Hazlo tú todo.','No quiero seguir.']]
  ],
  [
   ['Aclarar una indicación','La nota dice: «Haz la página». No dice cuál.','¿Qué puedes preguntar?','¿Qué página tengo que hacer?',['Ya lo he hecho.','Voy a elegir sin preguntar.']],
   ['Aclarar una indicación','La consigna dice: «Ponlo allí». No dice dónde.','¿Qué puedes preguntar?','¿Dónde tengo que ponerlo?',['Ya lo he hecho.','Voy a elegir sin preguntar.']],
   ['Aclarar una indicación','El juego dice: «Mueve dos». No dice qué mover.','¿Qué puedes preguntar?','¿Qué tengo que mover dos veces?',['Ya lo he hecho.','Voy a elegir sin preguntar.']],
   ['Aclarar una indicación','Te dicen: «Prepara el material». No sabes cuál.','¿Qué puedes preguntar?','¿Qué material necesito?',['Ya lo he hecho.','Voy a elegir sin preguntar.']],
   ['Aclarar una indicación','La ficha dice: «Completa el dibujo». No dice cómo.','¿Qué puedes preguntar?','¿Qué parte tengo que completar?',['Ya lo he hecho.','Voy a elegir sin preguntar.']],
   ['Aclarar una indicación','El mensaje dice: «Nos vemos luego». No dice cuándo.','¿Qué puedes preguntar?','¿A qué hora nos vemos?',['Ya lo he hecho.','Voy a elegir sin preguntar.']],
   ['Aclarar una indicación','La tarea dice: «Léelo». No sabes qué texto es.','¿Qué puedes preguntar?','¿Qué texto tengo que leer?',['Ya lo he hecho.','Voy a elegir sin preguntar.']],
   ['Aclarar una indicación','El dibujo tiene una flecha, pero no sabes qué hacer.','¿Qué puedes preguntar?','¿Qué tengo que hacer con la flecha?',['Ya lo he hecho.','Voy a elegir sin preguntar.']]
  ],
  [
   ['Expresar una necesidad','Hay mucho ruido y no oyes el cuento.','¿Qué puedes pedir?','¿Podemos bajar un poco el volumen?',['Voy a gritar más.','No voy a escuchar.']],
   ['Expresar una necesidad','La luz te molesta para leer.','¿Qué puedes pedir?','¿Puedo leer en un sitio con menos luz?',['Voy a gritar más.','No voy a leer.']],
   ['Expresar una necesidad','No ves bien la pizarra desde tu sitio.','¿Qué puedes pedir?','¿Puedo acercarme a la pizarra?',['Voy a gritar más.','No voy a mirar.']],
   ['Expresar una necesidad','Necesitas un poco más de tiempo para terminar.','¿Qué puedes pedir?','¿Me das un poco más de tiempo?',['Voy a gritar más.','No voy a terminar.']],
   ['Expresar una necesidad','Te cuesta seguir porque todos hablan a la vez.','¿Qué puedes pedir?','¿Podemos hablar por turnos?',['Voy a gritar más.','No voy a escuchar.']],
   ['Expresar una necesidad','Te molesta la silla y te cuesta estar sentado.','¿Qué puedes pedir?','¿Puedo cambiar de sitio?',['Voy a gritar más.','No voy a trabajar.']],
   ['Expresar una necesidad','No has oído cuándo empieza tu turno.','¿Qué puedes pedir?','¿Me repites cuándo empieza mi turno?',['Voy a gritar más.','Empiezo sin preguntar.']],
   ['Expresar una necesidad','El cuento va muy rápido y te pierdes.','¿Qué puedes pedir?','¿Puedes leer un poco más despacio?',['Voy a gritar más.','No voy a escuchar.']]
  ]
 ];
 function pool(age,level=1){
  const rank=ages.indexOf(age);if(rank<0||![1,2,3].includes(level))return [];
  const entries=age==='early'?earlyVariants.flat():cases[age];
  return entries.map(([family,source,q,a,opts],index)=>{
   const familyIndex=age==='early'?Math.floor(index/8):index,mechanics=['askForHelp','clarify','expressNeed'],semanticFamilies=['ask_help','clarify','express_need'],constructs=['communicative_repair','clarification','functional_expression'];
   const item={id:`communication-v1:${age}:${level}:${index}`,contentKey:`communication-v1:${age}:${level}:${index}`,semanticKey:`communication:${age}:${level}:${index}`,domain:'communication',level,type:'standard',responseType:'choice',requiresStimulus:true,q,stimulus:[{type:'text',text:source}],a,opts:[a,...opts],topic:'Comunicación funcional · '+family.toLocaleLowerCase('es'),mechanic:'communication_'+mechanics[familyIndex],qualityDescriptor:{semanticFamily:'communication.'+semanticFamilies[familyIndex],scenarioFamily:['school','group_activity','everyday_request'][familyIndex]},primaryConstruct:constructs[familyIndex],secondaryLoads:['languageComprehension'],difficultyProfile:{age,level,ageYears:ageYears[age]},
    ...(age==='early'?{ageProfile:{id:'early',revision:1,context:familyIndex===2?'family':'school',mechanic:'communication',family:`communication-${semanticFamilies[familyIndex]}-${Math.floor((index%8)/2)}`}}:age==='junior'?{juniorProfile:{route:age,level}}:age==='teen'?{teenReview:{version:3}}:{schoolProfile:{route:age,level}})};
   return item;
  });
 }
 function validate(item){
  const age=item?.ageProfile?.id||item?.juniorProfile?.route||item?.schoolProfile?.route||(item?.teenReview?'teen':null),source=ages.includes(age)?pool(age,item?.level).find(entry=>entry.id===item?.contentKey||entry.id===item?.id):null;
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const authored=source&&item.domain==='communication'&&item.mechanic===source.mechanic&&same(item.qualityDescriptor,source.qualityDescriptor)&&item.primaryConstruct===source.primaryConstruct&&item.responseType==='choice'&&item.type==='standard'&&Array.isArray(item.opts)&&item.opts.length===3&&new Set(item.opts).size===3&&item.opts.includes(item.a)&&typeof item.q==='string'&&item.q.trim()&&Array.isArray(item.stimulus)&&item.stimulus.length===1&&item.stimulus[0]?.type==='text'&&typeof item.stimulus[0].text==='string'&&item.stimulus[0].text.trim();
  const unchanged=!item.localization&&(item.q===source?.q&&item.a===source?.a&&same(item.opts,source?.opts)&&same(item.stimulus,source?.stimulus));
  if(!authored||(!unchanged&&(!item.localization||item.localization.domain!=='communication'||!item.localization.locale)))throw new Error('La actividad de comunicación no coincide con el banco revisado.');
  return true;
 }
 root.CommunicationContent={pool,validate};if(typeof module!=='undefined')module.exports=root.CommunicationContent;
})(typeof window==='undefined'?globalThis:window);

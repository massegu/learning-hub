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
 const scenarios=[
  ['confirmReceipt','confirm_receipt','Mensajería · Nube de aula','chat',[
   [[['Aula','Trae el cuaderno mañana. Confirma que lo has leído.'],['Tu bandeja','Aún no has respondido.']],'¿Qué escribirías para confirmar?','Leído. Mañana llevo el cuaderno.','¿Lo has leído tú?','Mañana decido qué llevar.'],
   [[['Aula','Lleva el cuaderno al taller. Hay que confirmar antes de salir.'],['Borrador','Leído. Llevaré el cuaderno al taller.']],'¿Qué falta para que el aula reciba la confirmación?','Enviar el borrador al aula.','Copiar el borrador en una nota.','Confirmar el lugar con otro grupo.'],
   [[['Mensaje anterior','Trae el cuaderno al patio.'],['Mensaje nuevo','Ahora en la sala 2. Trae el mismo cuaderno y confirma.'],['Borrador','Leído. Voy al patio con el cuaderno.']],'¿Qué respuesta confirma el aviso actualizado?','Leído. Llevaré el cuaderno a la sala 2.','Leído. Llevaré el cuaderno al patio.','Leído. Voy a la sala 2 sin cuaderno.']
  ]],
  ['privacyAudience','privacy_audience','Red de grupos · Muro Cercano','social',[
   [[['Publicar','Todo el centro puede verlo.'],['Mensaje privado','Solo lo ve la persona elegida.']],'¿Dónde preguntas a una sola persona si acepta salir en la foto?','En un mensaje privado.','En una publicación del centro.','En un comentario abierto.'],
   [[['Foto de grupo','Hay permiso para enseñarla al grupo.'],['Muro','Visible para todo el centro.'],['Chat privado','Solo integrantes del grupo.']],'¿Qué envío respeta el permiso?','Compartirla solo en el chat del grupo.','Compartirla en el muro sin nombres.','Enviarla a otro grupo que no aparece.'],
   [[['Borrador','Foto con tres caras. Dos personas han dado permiso.'],['Destino','Boletín público. Se exige permiso de cada persona visible.'],['Mensaje previsto','Publicaremos hoy.']],'¿Qué conviene comunicar antes de publicar?','Aplazamos el envío hasta recibir el permiso que falta.','Publicaremos hoy si quitamos los nombres.','Publicaremos hoy con acceso abierto y avisaremos después.']
  ]],
  ['feedback','actionable_feedback','Vídeos · Taller en pantalla','video',[
   [[['Imagen','El paso 2 aparece escrito.'],['Audio','No se oye la explicación del paso 3.']],'¿Qué comentario ayuda a mejorar el vídeo?','¿Puedes repetir la explicación del paso 3?','Cambia el color de la portada.','Quita el texto del paso 2.'],
   [[['0:35','Se indica que hay que pegar la pieza.'],['0:52','No se muestra dónde se pega.'],['Descripción','Hay lista de materiales.']],'¿Qué comentario indica el problema con precisión?','En 0:52 falta mostrar dónde se pega la pieza.','En 0:35 falta nombrar la pieza.','En la descripción falta toda la lista.'],
   [[['Audio','El orden de montaje se entiende.'],['Accesibilidad','La instrucción «gira la pieza» solo se oye.'],['Plazo','Se puede editar el subtítulo, pero no volver a grabar.']],'¿Qué devolución propone un cambio posible para entenderlo sin audio?','Añade «gira la pieza» al subtítulo cuando ocurre.','Vuelve a grabar la voz con más volumen.','Cambia solo el título y mantén la instrucción en audio.']
  ]],
  ['verifySource','verify_source','Buscador · Índice Abierto','search',[
   [[['Biblioteca','Página oficial. Abre el sábado.'],['Comentario','Creo que el sábado cierra.']],'¿Qué resultado sirve mejor para confirmar la apertura?','La página oficial de la biblioteca.','El comentario sin fecha.','Una imagen de la fachada.'],
   [[['Página oficial','Horario general: sábado abierto.'],['Aviso oficial','Este sábado: cierre por obras.'],['Foro','Normalmente abre los sábados.']],'¿Qué avisarías al grupo sobre este sábado?','Hay un cierre excepcional por obras.','Abre como todos los sábados.','Cierra todos los sábados desde ahora.'],
   [[['Resumen automático','La sala abre hasta las ocho.'],['Página de la sala','Aviso vigente: el acceso cierra a las siete.'],['Plano corregido','La última hora del plano es la del edificio, no la de la sala.']],'¿Qué respuesta cita el dato pertinente y explica la discrepancia?','El aviso de la sala indica las siete. Las ocho corresponden al edificio.','El resumen indica las ocho, así que también son las ocho para la sala.','La página y el plano coinciden en que la sala cierra a las ocho.']
  ]],
  ['coordinate','coordinate_handoff','Creación · Mesa de edición','editor',[
   [[['Archivo común','Cartel compartido con el grupo.'],['Tarea','Revisar el texto sin cambiar el diseño.']],'¿Qué puedes comunicar al equipo?','Reviso el texto y dejo el diseño como está.','Cambio el diseño sin revisar el texto.','Borro el cartel para crear otro.'],
   [[['Cartel v2','Borrador editable.'],['Cartel v3','Versión aprobada para entregar.'],['Equipo','Pide revisar un error en v3.']],'¿Qué mensaje evita editar la versión equivocada?','Encontré el error en v3. Revisemos esa versión antes de entregar.','Encontré el error en v2 y la enviaré ahora.','Corregí v2. Borremos v3.'],
   [[['Acceso al original','Solo lectura.'],['Entrega','PDF sin comentarios.'],['Tarea','Corregir un dato sin modificar el original.']],'¿Qué plan explicas al equipo?','Haré una copia, corregiré el dato y exportaré el PDF sin comentarios.','Habilitaré la edición del original y enviaré un enlace con comentarios.','Exportaré el original antes de corregir y adjuntaré los comentarios.']
  ]],
  ['report','report_incident','Partida cooperativa · Islas de Turno','game',[
   [[['Turnos','Solo se puede abrir una puerta por turno.'],['Estado','Es el turno de tu compañera.']],'¿Qué mensaje coordina la jugada?','Te toca abrir la puerta. Espero a mi turno.','Voy a abrir otra puerta ahora.','Saltamos los turnos sin avisar.'],
   [[['Partida 4','El puente desapareció al recoger una llave.'],['Ayuda','Indica partida y acción anterior al fallo.']],'¿Qué aviso permite comprobar el fallo?','En la partida 4, el puente desapareció al recoger una llave.','El juego nunca funciona.','En la partida 4 gané dos llaves.'],
   [[['Registro','El fallo se repite en partida 4 y 6 al recoger la llave.'],['Partida 5','La llave no se recogió y el puente siguió.'],['Ayuda','Pide pasos reproducibles y separa hechos de hipótesis.']],'¿Qué informe aporta evidencia sin asegurar una causa?','En 4 y 6 desapareció el puente tras recoger la llave. En 5 no recogimos la llave y siguió.','La llave causa siempre el fallo, incluso cuando no se recoge.','El puente está roto en todas las partidas, aunque no lo he comprobado.']
  ]],
  ['repairMismatch','repair_mismatch','Préstamo en la biblioteca','notice',[
   [[['Tu nota','El libro se devuelve el jueves.'],['Aviso de préstamo','Se devuelve el viernes.']],'¿Qué aclaración corrige el dato?','La tarjeta indica que se devuelve el viernes.','La tarjeta dice que se perdió el libro.','No hace falta comprobar el día.'],
   [[['Compañero','Mañana devolvemos los dos libros.'],['Tarjeta azul','Devolver mañana.'],['Tarjeta verde','Devolver el lunes.']],'¿Qué respuesta aclara cada plazo?','Mañana va el azul. El verde se devuelve el lunes.','Mañana van los dos libros.','El lunes van los dos libros.'],
   [[['Acuerdo','El primer tomo se queda en consulta.'],['Correo','Devuelve ambos tomos al mostrador.'],['Mostrador','Solo este equipo puede aclarar si cambió el acuerdo.']],'¿Qué pregunta evita dar por hecho un cambio?','¿Ha cambiado la norma del primer tomo? El acuerdo anterior decía que quedaba en consulta.','¿En qué estante estaba el segundo tomo?','¿Puedo llevarme los dos tomos a casa?']
  ]],
  ['negotiate','negotiate_turn','Turnos del taller','notice',[
   [[['Mesa','Queda una herramienta.'],['Equipo','Dos personas la necesitan.']],'¿Qué propuesta reparte el uso?','Usémosla por turnos.','Me quedo la herramienta hasta el final.','Dejemos la herramienta sin usar.'],
   [[['Equipo A','Necesita la herramienta ahora.'],['Equipo B','La necesita durante cinco minutos antes de guardar.']],'¿Qué propuesta atiende las dos necesidades?','Empieza A y deja cinco minutos para B antes de guardar.','Empieza A y guarda sin avisar.','Esperamos al final y usamos la herramienta a la vez.'],
   [[['Equipo A','Necesita diez minutos antes de la exposición.'],['Equipo B','Puede acabar después de exponer.'],['Puesto','Cierra quince minutos tras la exposición.']],'¿Qué reparto tiene en cuenta los dos plazos?','A usa diez minutos antes de exponer. B utiliza el puesto antes del cierre.','A y B esperan hasta que cierre el puesto.','B ocupa el puesto antes. A empieza tras exponer.']
  ]],
  ['summarize','summarize_action','Tablón de actividades','notice',[
   [[['Taller','Se cambia a la sala 3.'],['Material','Lleva papel.']],'¿Qué nota reúne los dos datos?','Sala 3. Lleva papel.','Sala 2. Lleva papel.','Sala 3. No hace falta papel.'],
   [[['Aviso de ayer','Taller en el patio.'],['Aviso de hoy','Sala 3 por lluvia. El material no cambia.'],['Lista','Papel y lápiz.']],'¿Qué recordatorio conserva los datos que siguen vigentes?','Sala 3 por lluvia. Lleva papel y lápiz.','En el patio. Lleva papel y lápiz.','Sala 3. El material ya no hace falta.'],
   [[['Organización','Inscripción individual hasta el jueves.'],['Nota del equipo','Enviar la lista del grupo el viernes.'],['Condición','La lista no sustituye a la inscripción.']],'¿Qué resumen evita que el grupo pierda su plaza?','Cada persona se inscribe hasta el jueves. El viernes enviamos la lista del grupo.','El viernes basta con enviar la lista.','Nos inscribimos todas las personas juntas el viernes.']
  ]]
 ];
 const operations={
  confirm_receipt:['Confirmar una recepción y comprobar el envío','updating'],
  privacy_audience:['Elegir un destino que respete el alcance de un permiso','constraints'],
  actionable_feedback:['Dar una indicación verificable y útil','inference'],
  verify_source:['Contrastar fuentes antes de transmitir un dato','inference'],
  coordinate_handoff:['Coordinar una entrega y sus permisos de edición','constraints'],
  report_incident:['Describir hechos observados para reproducir una incidencia','inference'],
  repair_mismatch:['Aclarar versiones contradictorias','updating'],
  negotiate_turn:['Proponer turnos teniendo en cuenta las necesidades','constraints'],
  summarize_action:['Resumir instrucciones para poder actuar','updating']
 };
 const quality=root.ContentQuality||(typeof require==='function'&&require('./content-quality'));
 for(const [key,[purpose,dimension]] of Object.entries(operations))quality.register('communication.'+key,purpose,dimension);
 const starterScenarios=[
  ['confirmReceipt','confirm_receipt','Nota para el aula',[
   ['La nota dice: «Trae papel». Pide que confirmes.','¿Qué respondes?','Leí la nota. Traigo papel.','No sé qué traer.','Manda la nota otra vez.'],
   ['La profesora pide el cuaderno. Tú has escrito un mensaje. Todavía no lo has enviado.','¿Qué falta hacer?','Enviar el mensaje.','Escribirlo en otro papel.','Borrar el mensaje.'],
   ['La nota de ayer pide papel. La de hoy pide cartón. Te preguntan qué traerás.','¿Cómo respondes a la última nota?','Traeré cartón.','Traeré papel.','No hay que traer nada.']]],
  ['report','report_incident','Material del taller',[
   ['La silla se mueve cuando te sientas.','¿Qué puedes contar?','La silla se mueve al sentarme.','Me gusta la silla.','La mesa se mueve.'],
   ['La caja cae al levantarla. Tiene el fondo abierto.','¿Qué aviso explica qué pasó?','La caja se abrió por abajo al levantarla.','La caja pesa poco.','La caja se cayó al mover la mesa.'],
   ['Al girar la llave, la puerta no abre. Tu amiga todavía no la ha probado.','¿Qué aviso cuenta solo lo que has visto?','Giré la llave y la puerta no abrió.','La puerta no abre nunca.','A mi amiga le pasó lo mismo.']]],
  ['privacyAudience','privacy_audience','Un dibujo para compartir',[
   ['Hiciste un dibujo con tu compañera. Quieres enseñarlo a otra clase.','¿Qué le preguntas antes?','¿Te parece bien que lo enseñe?','¿Quieres otro lápiz?','¿Te gustó la clase?'],
   ['Puedes mostrar el dibujo a tu grupo. Otra clase también quiere verlo.','¿Qué dices a la otra clase?','Voy a preguntar antes de enseñarlo.','Ya puedo enseñarlo a todo el colegio.','Lo enseño solo un momento sin preguntar.'],
   ['Tu amiga permite enseñar el dibujo en clase. Te piden una foto para el tablón.','¿Qué pregunta pide el permiso que falta?','¿Puedo poner una foto del dibujo en el tablón?','¿Puedo mirar el dibujo en clase?','¿Puedo dibujar otro en casa?']]],
  ['feedback','actionable_feedback','Explicar un dibujo',[
   ['No ves dónde empieza el camino del dibujo.','¿Qué pregunta ayuda a completarlo?','¿Puedes marcar dónde empieza el camino?','¿Puedes borrar el papel?','¿Puedes hacer una pelota?'],
   ['Hay dos flechas. La de arriba se entiende. La de abajo no señala nada.','¿Qué nota explica qué falta?','Falta que la flecha de abajo señale el camino.','Falta otra flecha arriba.','Hay que quitar las dos flechas.'],
   ['Primero hay que doblar el papel. El dibujo solo muestra dónde pegar.','¿Qué cambio explica el paso que falta?','Dibuja cómo doblar antes de pegar.','Dibuja cómo pegar antes de doblar.','Cambia el color del papel sin añadir pasos.']]],
  ['negotiate','negotiate_turn','Turnos de dibujo',[
   ['Queda un lápiz. Dos personas quieren dibujar.','¿Qué puedes proponer?','Usarlo por turnos.','Usarlo a la vez.','Guardar el lápiz.'],
   ['A ti te falta una raya. Tu compañero necesita el lápiz para todo su dibujo.','¿Qué propuesta deja tiempo para los dos?','Hago una raya y te paso el lápiz.','Me quedo el lápiz hasta acabar la clase.','Guardemos el lápiz ahora.'],
   ['Tú ya usaste el lápiz. Tu compañero debe escribir antes del recreo. Luego quieres dibujar.','¿Qué turno propones?','Escribe ahora. Yo lo uso luego.','Dibujo ahora y tú escribes en el recreo.','Usamos el lápiz los dos a la vez.']]]
 ];
 function scenarioPool(age,level){
  if(age==='early')return starterScenarios.map(([mechanic,operation,label,levels])=>{
   const [text,q,a,...wrong]=levels[level-1],id=`communication-v2:${age}:${level}:${mechanic}`;
   return {id,contentKey:id,semanticKey:id,domain:'communication',level,type:'standard',responseType:'choice',requiresStimulus:true,
    q,stimulus:[{type:'text',label,text}],a,opts:[a,...wrong],topic:'Comunicación funcional · '+label,mechanic:'communication_'+mechanic,
    qualityDescriptor:{semanticFamily:'communication.'+operation,scenarioFamily:'classroom.'+mechanic},primaryConstruct:operation,
    difficultyParameters:{conditions:level},ageProfile:{id:'early',revision:1,context:'school',mechanic:'communication',family:'communication-'+mechanic}};
  });
  return scenarios.map(([mechanic,operation,label,materialType,levels])=>{
   const [rows,q,a,...wrong]=levels[level-1];
   const id=`communication-v2:${age}:${level}:${mechanic}`;
   const stimulus={type:'table',label,rows:[['Fuente','Contenido'],...rows],
    ...(materialType==='notice'?{}:{presentation:'digitalInterface',materialType})};
   return {id,contentKey:id,semanticKey:id,domain:'communication',level,type:'standard',responseType:'choice',requiresStimulus:true,
    q,stimulus:[stimulus],a,opts:[a,...wrong],topic:'Comunicación funcional · '+label,
    mechanic:'communication_'+mechanic,qualityDescriptor:{semanticFamily:'communication.'+operation,scenarioFamily:materialType+'.'+mechanic},
    primaryConstruct:operation,difficultyParameters:{sources:rows.length,update:level===3},
    ...(age==='junior'?{juniorProfile:{route:age,level}}:age==='teen'?{teenReview:{version:3}}:{schoolProfile:{route:age,level}})};
  });
 }
 // Closed, fictional interfaces. The age context and number of sources change
 // independently from the reasoning operation required at each level.
 const digitalContexts={
  early:{project:'el dibujo de la clase',group:'Grupo de dibujos',object:'el plátano para la merienda',place:'la mesa azul',newPlace:'la mesa verde'},
  junior:{project:'el taller de carteles',group:'Taller de carteles',object:'un rotulador',place:'la biblioteca',newPlace:'el aula 2'},
  primary:{project:'la feria de ciencias',group:'Equipo de la feria',object:'el ordenador',place:'la sala de ciencias',newPlace:'el laboratorio'},
  middle:{project:'la muestra de fotografía',group:'Equipo de fotografía',object:'el teléfono móvil',place:'el estudio',newPlace:'la sala de edición'},
  teen:{project:'la jornada de voluntariado',group:'Equipo de voluntariado',object:'la chaqueta del equipo',place:'el punto de información',newPlace:'la entrada lateral'}
 };
 const digitalFamilies={message:'Conversaciones',post:'Publicaciones y comentarios',clip:'Vídeos cortos',story:'Historias y mensajes',search:'Búsquedas',notice:'Notificaciones y privacidad',app:'Agenda de equipo',mail:'Correo',files:'Archivos',form:'Formularios',booking:'Reservas'};
 function digitalPool(age,level=1,family=null){
  const c=digitalContexts[age];
  if(!c||![1,2,3].includes(level))return [];
  const {project,group,object,place,newPlace}=c;
  const towards=value=>value.startsWith('el ')?'al '+value.slice(3):'a '+value;
  const caseRows=[
   ['message','chat','Bandeja Brújula','confirm_receipt',[
    [[['Equipo','Para '+project+', trae '+object+'. Confirma que leíste el mensaje.']],'¿Qué respuesta confirma el encargo?', 'Leí el aviso. Llevaré '+object+'.','No sé quién lo envió.','Ya cambié el lugar.'],
    [[['Equipo','Trae '+object+' '+towards(place)+'.'],['Tu borrador','De acuerdo. Lo llevaré.'],['Estado','Borrador sin enviar']],'¿Qué falta para que el equipo reciba tu respuesta?','Enviar el borrador al equipo.','Abrir otra conversación.','Copiar el aviso a mis notas.'],
    [[['Equipo · aviso anterior','Nos vemos en '+place+'.'],['Equipo · aviso actualizado','Ahora nos vemos en '+newPlace+'. Necesitamos el mismo material.'],['Otro grupo','Nuestra reunión sigue en '+place+'.']],'¿Qué confirmación envías al equipo?','Llevaré '+object+' '+towards(newPlace)+'.','Llevaré '+object+' '+towards(place)+'.','Iré al nuevo lugar sin material.']]],
   ['post','social','Muro de grupos','privacy_audience',[
    [[['Publicación','Actividad: '+project+'.'],['Comentario · Equipo','Por favor, confirma en privado antes de publicar mi foto.']],'¿Dónde conviene responder?','En un mensaje privado a la persona.','En un comentario público.','En el perfil de otra persona.'],
    [[['Publicación en borrador','Incluye una imagen del equipo.'],['Comentario · Grupo','De acuerdo solo si la ve nuestro grupo.'],['Visibilidad','Ahora está marcada como pública.']],'¿Qué haces antes de publicar?','Selecciono acceso solo para el grupo.','Borro el nombre y dejo el acceso público.','Desactivo comentarios y publico.'],
    [[['Borrador','La imagen muestra a tres integrantes.'],['Comentario · Grupo','Dos aceptan para el grupo. Una persona todavía no confirmó.'],['Configuración','La visibilidad ya está limitada al grupo.']],'¿Qué aviso respeta todas las condiciones?','Esperamos el permiso que falta antes de compartir.','Ya podemos publicar porque el acceso es privado.','Publicamos y luego pedimos el permiso.']]],
   ['clip','video','Clips de taller','actionable_feedback',[
    [[['00:02 · Subtítulo','Primero prepara '+object+'.'],['00:06 · Subtítulo','Lleva el material '+towards(place)+'.']],'¿Qué paso va primero?','Preparar '+object+'.','Llevarlo sin prepararlo.','Cambiar el lugar.'],
    [[['00:02 · Subtítulo','Prepara '+object+'.'],['00:07 · Subtítulo','Guárdalo en esta caja.'],['Comentario','No se ve cuál es la caja.']],'¿Qué mejora responde al comentario?','Mostrar la caja junto a su etiqueta.','Cambiar el color del título.','Quitar el paso de la caja.'],
    [[['00:02 · Subtítulo','Lleva el material '+towards(place)+'.'],['00:10 · Voz','El material se queda en casa.'],['Comentario fijado · Equipo','Hay que llevarlo '+towards(place)+'.']],'¿Qué edición elimina la contradicción?','Cambiar la voz para que indique llevar el material.','Eliminar los subtítulos y dejar la voz.','Añadir otro destino sin corregir la voz.']]],
   ['story','story','Historias de grupo','summarize_action',[
    [[['Historia · '+group,'Hoy vamos '+towards(place)+'.'],['Respuesta','¿Me dices dónde es?']],'¿Qué respondes según la historia?', 'En '+place+'.','En '+newPlace+'.','No indica el lugar.'],
    [[['Historia anterior','Encuentro en '+place+'.'],['Historia nueva','Encuentro en '+newPlace+'.'],['Aviso','La historia anterior ya venció.']],'¿Qué información debes enviar ahora?','El encuentro es en '+newPlace+'.','El encuentro es en '+place+'.','Las dos ubicaciones son correctas.'],
    [[['Historia · '+group,'El encuentro pasa '+towards(newPlace)+'.'],['Mensaje directo · otro grupo','Nuestro encuentro sigue en '+place+'.'],['Borrador','Todos cambiamos de lugar.']],'¿Cómo corriges el borrador?','Solo nuestro grupo cambia '+towards(newPlace)+'.','Todos seguimos en '+place+'.','Todos cambiamos '+towards(newPlace)+'.']]],
   ['search','search','Búsqueda Lupa','verify_source',[
    [[['Ficha oficial · '+project,'Incluye el lugar: '+place+'.'],['Publicidad','Descubre otras actividades.']],'¿Qué resultado te dice dónde queda tu actividad?','La ficha oficial.','La publicidad.','Ninguno.'],
    [[['Agenda oficial · hoy','El encuentro es en '+newPlace+'.'],['Comentario · semana pasada','Creo que es en '+place+'.'],['Publicidad','Inscríbete a otra actividad.']],'¿Qué resultado usarías para informar del lugar?','La agenda oficial publicada hoy.','El comentario de la semana pasada.','La publicidad.'],
    [[['Agenda oficial · ayer','Actividad prevista en '+place+'.'],['Aviso oficial · hoy','Cambio de lugar '+towards(newPlace)+'.'],['Conversación · hoy','Alguien sugiere que se ha cancelado.']],'¿Qué afirmación puedes verificar?','El aviso oficial de hoy indica el cambio de lugar.','La conversación confirma la cancelación.','La agenda de ayer es la única fuente válida.']]],
   ['notice','settings','Centro de avisos','privacy_audience',[
    [[['Solicitud de contacto','Persona desconocida.'],['Ajuste recomendado','Aceptar solo contactos conocidos.']],'¿Qué opción respeta el ajuste?', 'Dejar la solicitud sin aceptar.','Aceptar todas las solicitudes.','Enviar mi información para preguntar.'],
    [[['Notificación','Un contacto pide compartir el álbum del grupo.'],['Privacidad del álbum','Solo integrantes.'],['Contacto','No pertenece al grupo.']],'¿Qué opción respeta la privacidad?','No comparto el álbum con ese contacto.','Abro el acceso a cualquiera con el enlace.','Le envío una captura del álbum.'],
    [[['Notificación','Otra clase solicita ver la carpeta.'],['Permiso del grupo','Pueden ver los avisos. Las fotos son privadas.'],['Configuración actual','La carpeta mezcla avisos y fotos.']],'¿Qué cambio permite dar solo el acceso acordado?','Compartir los avisos por separado y mantener privadas las fotos.','Compartir la carpeta completa en modo lectura.','Ocultar los nombres de los archivos y compartir todo.']]],
   ['app','editor','Agenda de equipo','confirm_receipt',[
    [[['Tarea','Llevar '+object+' para '+project+'.'],['Estado','Pendiente.']],'¿Qué tarea figura en la agenda?','Llevar '+object+'.','Cambiar el lugar.','Borrar la agenda.'],
    [[['Tarea','Dejar '+object+' en '+place+'.'],['Cambio · Equipo','El material debe quedar en '+newPlace+'.'],['Agenda','Cambio sin guardar.']],'¿Qué haces para que todos vean la ubicación actual?', 'Guardar el cambio '+towards(newPlace)+'.','Mantener el lugar anterior.','Guardar una copia que solo yo pueda ver.'],
    [[['Agenda','Recoger el material en '+place+' y llevarlo '+towards(newPlace)+'.'],['Aviso de acceso','El acceso '+towards(newPlace)+' abre después de la recogida.'],['Nota','La hora de recogida se mantiene.']],'¿Qué instrucción resume el plan sin alterar el orden?','Recoger el material y llevarlo al nuevo lugar cuando abra.','Esperar a la apertura para recoger el material.','Llevar el material al lugar de recogida y darlo por entregado.']]]
  ];
  return caseRows.filter(([variant])=>!family||family===variant).map(([variant,materialType,label,operation,levels])=>{
   const [sources,q,a,...wrong]=levels[level-1];
   const rows=age==='early'?sources.map(([name,value])=>[name.replace(/^00:(\d+) · /,(_,second)=>'Momento '+Number(second)+' · '),value]):sources;
   const id='communication-v3:'+age+':'+level+':'+variant;
   return {id,contentKey:id,semanticKey:id,domain:'communication',level,type:'standard',responseType:'choice',requiresStimulus:true,
    q,a,opts:[a,...wrong],stimulus:[{type:'table',label,rows:[['Fuente','Contenido'],...rows],presentation:'digitalInterface',materialType}],
    topic:'Comunicación funcional · '+label,mechanic:'communication_'+variant,primaryConstruct:operation,
    qualityDescriptor:{semanticFamily:'communication.'+operation,scenarioFamily:'digital.'+variant},
    difficultyParameters:{sources:rows.length,update:level===3},
    ...(age==='early'?{lexicalSenses:{banana:true}}:{}),
    ...(age==='early'?{ageProfile:{id:'early',revision:1,context:'school',mechanic:'communication',family:'communication-digital-'+variant}}:
    age==='junior'?{juniorProfile:{route:age,level}}:age==='teen'?{teenReview:{version:3}}:{schoolProfile:{route:age,level}})};
  });
 }
 const formatOperations={
  message:['communication','communication','communication'],
  post:['communication','executive','communication'],
  clip:['reading','communication','language'],
  story:['communication','reading','communication'],
  search:['attention','reading','reading'],
  notice:['executive','executive','executive'],
  app:['attention','executive','executive']
 };
 const languageDomain={early:'language',junior:'language',primary:'language',middle:'middleLanguage',teen:'teenLanguage'};
 const readingDomain={early:'reading',junior:'reading',primary:'reading',middle:'middleReading',teen:'literacy'};
 const resolveDomain=(area,age,revision)=>area==='reading'?(revision>=19&&['primary','middle','teen'].includes(age)?'literacy':readingDomain[age]):area==='language'?languageDomain[age]:area;
 const digitalDomainLabel={communication:'Comunicación funcional',attention:'Atención',executive:'Funciones ejecutivas',reading:'Lectura y escritura',language:'Lenguaje',memory:'Memoria'};
 const revisedOperations={
  communication:'choose_intervention',attention:'select_relevant_signal',executive:'apply_or_update_constraints',
  reading:'integrate_written_information',language:'revise_message_for_coherence',memory:'recall_after_occlusion'
 };
 for(const [area,operation] of Object.entries(revisedOperations))quality.register('digital.'+operation,digitalDomainLabel[area],area==='memory'?'memoryLoad':'constraints');

 function reviseDigital(item,type,area,age,level,context,variant){
  const key=item.contentKey.replace(/^digital-v1:/,'digital-v2:');
  const revised={...item,id:key,contentKey:key,semanticKey:key};
  const adapt=(changes,operation,correction)=>{
   const {a,opts,...rest}=revised;
   return {...rest,...changes,primaryConstruct:operation,
    qualityDescriptor:{...item.qualityDescriptor,semanticFamily:'digital.'+operation},
    simulation:{...item.simulation,operation,response:changes.responseType,correction}};
  };
  if(type==='app'&&area==='executive'&&age!=='early'&&level===3&&variant==='original'){
   const answer=['Recoger el material.','Esperar a que abra el nuevo lugar.','Llevar el material al nuevo lugar.'];
   return adapt({type:'order',responseType:'order',q:'Ordena los pasos respetando la hora de recogida y la apertura.',
    tokens:[answer[2],answer[0],answer[1]],answer,why:'La recogida va primero. La entrega se hace después de la apertura.'},'sequence_dependencies','ordered_exact');
  }
  if(type==='search'&&area==='reading'&&age!=='early'&&level===2&&variant==='original'){
   const answer=context.newPlace.replace(/^(?:el|la) /,'');
   return adapt({type:'digitalCompletion',responseType:'written',q:'Completa solo el nombre del lugar indicado en la agenda oficial de hoy.',
    a:answer,sample:answer,why:'El nombre coincide con la agenda oficial publicada hoy.'},'extract_current_detail','normalized_exact');
  }
  if(type==='clip'&&area==='reading'&&age!=='early'&&level===3&&variant==='original'){
   const rows=item.stimulus[0].rows.slice(1);
   const options=rows.map(([name])=>name);
   return adapt({type:'digitalContradiction',responseType:'multiple',q:'Marca las dos partes del vídeo que se contradicen.',
    opts:options,answers:options.slice(0,2),why:'El subtítulo dice que hay que llevar el material. La voz dice que se queda en casa.'},
    'compare_incompatible_sources','exact_set');
  }
  if(type==='message'&&area==='communication'&&age!=='early'&&level===3&&variant==='original'){
   const [,second]=item.stimulus[0].rows.slice(1);
   return adapt({type:'self',responseType:'written',discussionReview:true,q:'Escribe un mensaje al equipo. Confirma el encargo y menciona el lugar actualizado.',
    sample:item.a,writingRubric:['Indica cuál es el lugar actualizado.','Confirma que llevarás el material que pide el equipo.'],
    why:second[1]},'formulate_confirmation','professional_review');
  }
  return revised;
 }
 const r193Cases=[
  {key:'attachment-permission',format:'mail',age:'junior',level:2,title:'Correo de la clase',operation:'verify_attachment_permission',
   rows:[['Equipo · Plano del jardín','Para el grupo. Adjuntos: Plano.pdf. El plano se puede enviar al grupo.'],['Lucía · Lista de participantes','Para quien organiza. Adjuntos: Lista.ods. La lista se comparte solo con quien organiza.'],['Biblioteca · Horario','Para el grupo. Adjuntos: Horario.pdf. El horario es de otra actividad.']],
   attachments:{'Plano.pdf':'El jardín está junto a la puerta norte del patio. Sigue la senda al final del muro.','Lista.ods':'Hoja de participantes. Consulta reservada a la persona organizadora.','Horario.pdf':'Horas de apertura de la biblioteca para la actividad de lectura.'},
   q:'¿Qué adjunto puedes enviar al grupo para que encuentre el jardín?',a:'Plano.pdf',wrong:['Lista.ods','Horario.pdf'],why:'Plano.pdf indica cómo encontrar el jardín y su permiso incluye al grupo.'},
  {key:'changed-recipient',format:'mail',age:'teen',level:3,title:'Correo de proyectos',operation:'reconcile_receiver_update',
   rows:[['Coordinación · Entrega inicial','Para el equipo. El informe iba a entregarse al buzón de coordinación.'],['Coordinación · Cambio de destino','Para quienes entregan. El responsable es Archivo. Adjuntos: Formato.pdf. El plazo se mantiene el viernes.'],['Difusión · Copia pública','Para difusión. Solo se publica el resumen una vez aprobado.']],
   attachments:{'Formato.pdf':'Portada, resumen y anexo técnico. Usa este orden para la copia que recibe Archivo.'},
   q:'¿Qué envío cumple el aviso actualizado?',a:'El informe a Archivo el viernes.',wrong:['El informe al buzón de coordinación el viernes.','El informe a Difusión para publicarlo el viernes.'],why:'El segundo mensaje cambia el destinatario a Archivo y mantiene el plazo.'},
  {key:'latest-ready',format:'files',age:'primary',level:2,title:'Archivos del taller',operation:'select_latest_approved',
   rows:[['Entregas / Puente.pdf','PDF · 12 de mayo · Aprobado.'],['Borradores / Puente.pdf','PDF · 14 de mayo · Todavía en revisión.'],['Entregas / Plano.ods','ODS · 15 de mayo · Solo cálculos.']],
   q:'¿Qué archivo se puede entregar como informe del puente?',a:'Entregas / Puente.pdf',wrong:['Borradores / Puente.pdf','Entregas / Plano.ods'],why:'El PDF del 12 de mayo está aprobado. El PDF posterior sigue en revisión y la hoja de cálculo no es el informe.'},
  {key:'share-subset',format:'files',age:'middle',level:3,title:'Archivos de la exposición',operation:'separate_public_and_private',
   rows:[['Compartido / Cartel.pdf','PDF · 6 de junio · Público.'],['Proyecto / Programa.pdf','PDF · 8 de junio · Autorizado para compartir.'],['Proyecto / Contactos.ods','ODS · 9 de junio · Acceso solo del equipo.']],
   q:'¿Cómo compartes el programa sin dar acceso a los contactos?',a:'Compartir solo Programa.pdf.',wrong:['Compartir toda la carpeta Proyecto.','Compartir Contactos.ods y mover el cartel.'],why:'Compartir un solo documento mantiene privado el archivo de contactos.'},
  {key:'complete-required',format:'form',age:'early',level:2,title:'Inscripción al taller',operation:'distinguish_required_optional',
   rows:[['Nombre del equipo','Obligatorio · Equipo Azul'],['Día del taller','Obligatorio · Falta elegir el día'],['Dibujo del equipo','Opcional · Sin dibujo']],
   q:'¿Qué falta para poder enviar el formulario?',a:'Elegir el día.',wrong:['Hacer un dibujo.','Cambiar el nombre del equipo.'],why:'El día es obligatorio y está vacío. El dibujo es opcional.'},
  {key:'capacity-check',format:'form',age:'middle',level:2,title:'Solicitud de préstamo',operation:'validate_numeric_boundary',
   rows:[['Artículo','Obligatorio · Microscopio'],['Unidades','Obligatorio · Ahora indica 5. Se admiten de 1 a 3.'],['Recogida','Obligatorio · Martes']],
   q:'¿Qué corrección permite enviar esta solicitud sin cambiar el día?',a:'Indicar 3 unidades.',wrong:['Cambiar la recogida al miércoles.','Indicar 0 unidades.'],why:'3 está dentro del intervalo permitido. La recogida del martes ya es válida.'},
  {key:'accessible-slot',format:'booking',age:'primary',level:3,title:'Reserva de salas',operation:'combine_availability_and_access',
   rows:[['Lunes 16:00 · Sala Norte','Libre · Solo se accede por escaleras.'],['Lunes 17:00 · Sala Patio','Ocupada · Acceso sin escaleras.'],['Martes 16:00 · Sala Patio','Libre · Acceso sin escaleras.']],
   q:'El grupo necesita una sala libre a las 16:00 sin subir escaleras. ¿Cuál reserva?',a:'Martes 16:00 · Sala Patio',wrong:['Lunes 16:00 · Sala Norte','Lunes 17:00 · Sala Patio'],why:'La sala Patio del martes reúne las tres condiciones: disponibilidad, hora y acceso.'},
  {key:'cancel-only',format:'booking',age:'teen',level:2,title:'Reserva de equipos',operation:'retain_confirmed_linked_booking',
   rows:[['Jueves 15:00 · Proyector','Confirmado · Puedes cambiar la hora hasta el miércoles.'],['Jueves 16:00 · Micrófono','En espera · El equipo ya ha conseguido otro.'],['Jueves 17:00 · Sala','Confirmada · Se debe conservar.']],
   q:'¿Qué cambio elimina únicamente la reserva que ya no hace falta?',a:'Cancelar solo la espera del micrófono.',wrong:['Cancelar la sala confirmada.','Cancelar el proyector y el micrófono.'],why:'Solo ha dejado de hacer falta el micrófono. La sala y el proyector se mantienen.'}
 ];
 function r193Digital(age,level,domain,format){
  if(domain&&domain!=='communication')return [];
  return r193Cases.filter(c=>c.age===age&&c.level===level&&(!format||c.format===format)).map(c=>{
   const id=['digital-v3',age,level,'communication',c.format,c.key].join(':');
   return {id,contentKey:id,semanticKey:id,domain:'communication',level,type:'standard',responseType:'choice',requiresStimulus:true,
    q:c.q,a:c.a,opts:[c.a,...c.wrong],why:c.why,topic:c.title,mechanic:'digital_communication_'+c.format,primaryConstruct:c.operation,
    qualityDescriptor:{semanticFamily:'digital.'+c.operation,scenarioFamily:'digital.'+c.format},
    stimulus:[{type:'table',label:c.title,rows:[['Entrada','Detalle'],...c.rows],presentation:'digitalInterface',materialType:'editor',...(c.attachments?{attachments:c.attachments}:{})}],
    simulation:{format:c.format,operation:c.operation,response:'choice',correction:'exact_choice',age,level},
    ...(age==='early'?{ageProfile:{id:'early',revision:1,context:'school',mechanic:'communication',family:'communication-form'}}:
      age==='junior'?{juniorProfile:{route:age,level}}:age==='teen'?{teenReview:{version:3}}:{schoolProfile:{route:age,level}})};
  });
 }
 function transversalPool(age,level=1,domain=null,format=null,revision=18){
  if(!digitalContexts[age]||![1,2,3].includes(level))return [];
  const {project,place,newPlace,object}=digitalContexts[age];
  const base=digitalPool(age,level);
  const entries=base.map((item,index)=>{
   const type=Object.keys(digitalFamilies)[index];
   return [type,formatOperations[type][level-1],item];
  });
  const interventionFormats={
   post:['Pedir permiso en un mensaje privado','¿Qué mensaje enviarías antes de publicar la imagen?','¿Te parece bien que comparta la imagen con el grupo?','Subo tu imagen sin avisar.','¿A qué hora acaba el taller?'],
   clip:['Aclarar un paso que no se ve','¿Qué comentario ayuda a aclarar este paso?','¿Puedes mostrar dónde va la pieza?','El vídeo no me sirve para nada.','Cambia todo el vídeo.'],
   story:['Responder al mensaje de una persona','¿Qué mensaje enviarías a quien pidió el dato?','Te confirmo el lugar nuevo. ¿Quieres que te ayude a llegar?','Todos pueden buscarlo por su cuenta.','No voy a responder.'],
   search:['Pedir confirmación a la persona responsable','¿Qué pregunta enviarías a la persona responsable?','¿Puedes confirmar en qué lugar nos reunimos?','Te escribo para confirmar que ya lo sé todo.','¿Me puedes enviar un vídeo cualquiera?'],
   notice:['Explicar un límite de privacidad','¿Qué respuesta explica el límite a quien pidió las fotos?','Las fotos solo se comparten con el grupo. Puedo enviarte el aviso.','Te envío todas las fotos.','No me escribas nunca más.'],
   app:['Coordinar una entrega con un compañero','¿Qué le escribirías para acordar la entrega?','Puedo llevar el material al lugar nuevo. ¿Puedes confirmar que lo recibirás?','Guardaré una copia solo para mí.','Cambiaré la entrega sin avisar.']
  };
  for(const [type,intervention] of Object.entries(interventionFormats)){
   if(formatOperations[type][level-1]==='communication')continue;
   const reference=base[Object.keys(digitalFamilies).indexOf(type)];
   const [title,q,a,...wrong]=intervention;
   const rows=[['Fuente','Contenido'],...reference.stimulus[0].rows.slice(1,age==='early'?Math.min(3,level+1):level+2)];
   if(type==='app'&&age==='early'){
    rows.splice(1,rows.length-1,['Tarea','Lleva el material.'],['Lugar','Ahora va a la sala nueva.']);
   }
   const contextual={
    post:['Petición','La persona quiere decidir antes de que se comparta su imagen.'],
    clip:['Comentario','No se ve dónde va la pieza.'],
    story:['Mensaje privado','¿Me confirmas el lugar nuevo?'],
    search:['Nota de equipo','Aún falta confirmar el lugar con la persona responsable.'],
    notice:['Petición','¿Puedes mandarme las fotos? No soy del grupo.'],
    app:['Mensaje del equipo','Yo puedo recibirlo en el lugar nuevo si me confirmas.']
   };
   if(type==='notice'){
    rows.splice(1,rows.length-1,['Permiso','Las fotos solo las ve el grupo. El aviso se puede enviar.']);
    if(level>=2)rows.push(['Nota','El permiso no ha cambiado.']);
   }
   rows.push(contextual[type]);
   entries.push([type,'communication',{...reference,q,a,opts:[a,...wrong],primaryConstruct:'choose_intervention',
    stimulus:[{...reference.stimulus[0],rows}],why:title+'.'},'intervention']);
  }
  if(age!=='early'){
   const legacy=scenarioPool(age,level);
   entries.push(['search',level===1?'attention':'reading',legacy.find(item=>item.mechanic==='communication_verifySource'),'official']);
   const notice=legacy.find(item=>item.mechanic==='communication_summarize');
   entries.push(['notice','reading',{...notice,stimulus:[{...notice.stimulus[0],presentation:'digitalInterface',materialType:'settings'}]},'bulletin']);
  }
  const message=base[0].stimulus[0];
  const event=level===1?'el taller de hoy':project;
  const target=level===1?place:level===2?newPlace:object;
  const rows=[['Fuente','Contenido'],['Equipo',target],...(level>=2?[['Otro grupo',place]]:[]),...(level>=3?[['Material anterior',newPlace]]:[])];
  const comparison=level===3?[newPlace,place]:level===2?[place,object]:[newPlace,object];
  entries.push(['message','memory',{
   ...base[0],type:'memoryReveal',q:'Lee la conversación. Después se ocultará la pantalla.',
   memoryQuestion:'¿Qué indicaba el Equipo?',a:target,opts:[target,...comparison],
   stimulus:[{...message,rows}],memoryContent:rows.map(([speaker,detail])=>({person:speaker,detail})),
   answerEvidence:{type:'tableCell',block:0,row:1,column:1,subjectColumn:0},
   revealMs:9000,why:'Revisa la respuesta del Equipo.'
  },'recall']);
  entries.push(['message','attention',{
   ...base[0],q:'Localiza el mensaje marcado como «Hoy · Equipo». ¿Qué indica?',
   a:target,opts:[target,...comparison],stimulus:[{...message,rows:[['Fuente','Contenido'],['Ayer · Equipo',comparison[0]],['Hoy · Equipo',target],['Hoy · Otro grupo',comparison[1]]]}],
   why:'El aviso debe coincidir tanto en el día como en el grupo.'
  },'filter']);
  entries.push(['message','reading',{
   ...base[0],q:'¿Qué resumen mantiene los datos de los dos mensajes?',a:'Llevar '+object+' a la sala nueva.',
   opts:['Llevar '+object+' a la sala nueva.','Ir a la sala anterior.','Ir sin el material.'],
   stimulus:[{...message,rows:[['Fuente','Contenido'],['Primer mensaje','Para '+event+', trae '+object+'.'],['Segundo mensaje','Cambiamos de sala. El material sigue igual.']]}],
   why:'Solo cambia la sala. El segundo aviso conserva el encargo.'
  },'integrate']);
  entries.push(['message','language',{
   ...base[0],q:level===1?'¿Qué palabra completa la frase?':level===2?'¿Qué expresión conserva el sentido de «llevar otra vez»?':'¿Qué versión evita que «allí» se refiera a dos lugares?',
   a:level===1?'después':level===2?'volver a llevar':'Dejo el material en el aula 2.',
   opts:level===1?['después','debajo','dentro']:level===2?['volver a llevar','dejar de llevar','evitar llevar']:['Dejo el material en el aula 2.','Lo dejo allí.','Lo dejo ahí mismo.'],
   stimulus:[{...message,rows:[['Fuente','Contenido'],['Borrador',level===1?'Primero preparo el material. Lo llevo ___.':level===2?'Puedo llevar otra vez el material.':'Pasé por el aula 1 de camino al aula 2. Allí dejo el material.'],...(level===3?[['Nota','El material debe quedarse en el aula 2.']]:[])]}],
   why:level===1?'La frase indica orden temporal.':level===2?'«Volver a» indica que la acción se repite.':'Nombrar el aula elimina la ambigüedad.'
  },'language']);
  entries.push(['message','executive',{
   ...base[0],q:'¿Qué plan cumple el encargo y el aviso más reciente?',
   a:'Recoger '+object+' y dejarlo en el lugar nuevo.',opts:['Recoger '+object+' y dejarlo en el lugar nuevo.','Dejar el material en el lugar anterior.','Cambiar de lugar sin recoger el material.'],
   stimulus:[{...message,rows:[['Fuente','Contenido'],['Encargo','Recoge '+object+' y déjalo en el lugar acordado.'],['Aviso nuevo','Ha cambiado el lugar, pero el encargo se mantiene.']]}],
   why:'El cambio afecta al lugar de entrega. La recogida sigue siendo necesaria.'
  },'plan']);
  if(revision>=19){
   // A video contradiction belongs with the comprehension of its sources.
   for(const entry of entries)if(entry[0]==='clip'&&entry[1]==='language')entry[1]='reading';
  }
  const legacy = entries.filter(([type,area])=>(revision<19||area!=='language')&&(!domain||resolveDomain(area,age,revision)===domain)&&(!format||type===format)).map(([type,area,item,variant='original'])=>{
   const domain=resolveDomain(area,age,revision), id=['digital-v1',age,level,area,type,variant].join(':');
   const operation=['original','intervention'].includes(variant)&&area==='communication'?item.primaryConstruct:revisedOperations[area];
   const mechanic={attention:'search',memory:'rememberPair',executive:'planning',language:'vocabulary',reading:'literal',communication:'communication'}[area];
   const baseItem={...item,id,contentKey:id,semanticKey:id,domain,
    topic:digitalDomainLabel[area]+' · '+digitalFamilies[type],mechanic:'digital_'+area+'_'+type,
    primaryConstruct:operation,
    qualityDescriptor:{semanticFamily:area==='communication'?'communication.'+operation:'digital.'+operation,scenarioFamily:'digital.'+type},
    simulation:{format:type,operation,response:item.responseType,correction:'exact_choice',age,level},
    ...(age==='early'?{ageProfile:{...item.ageProfile,mechanic,family:'digital-'+area+'-'+type}}:{})
   };
   return revision>=19?reviseDigital(baseItem,type,area,age,level,digitalContexts[age],variant):baseItem;
  });
  return revision>=20?[...legacy,...r193Digital(age,level,domain,format)]:legacy;
 }
 const availableFormats=(age,level,domain,revision=18)=>Object.keys(digitalFamilies).filter(format=>transversalPool(age,level,domain,format,revision).length);
 function validateTransversal(item){
  const [prefix,age]=String(item.contentKey||'').split(':');
  const revision=prefix==='digital-v3'?20:prefix==='digital-v2'?19:prefix==='digital-v1'?18:0;
  const source=revision&&transversalPool(age,item.level,item.domain,null,revision).find(entry=>entry.contentKey===item.contentKey);
  if(!source)throw new Error('La simulación no pertenece al banco de esta área.');
  const regional=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
  const expected=item.localization?regional.localizeItem(source,item.localization.locale,item.domain):source;
  for(const field of ['domain','q','a','stimulus','type','responseType','mechanic','simulation','memoryContent','memoryQuestion','answerEvidence','qualityDescriptor','primaryConstruct','why','revealMs','answer','answers','tokens','sample','writingRubric','discussionReview']){
   if(JSON.stringify(item[field])!==JSON.stringify(expected[field]))throw new Error('La simulación no coincide con su fuente: '+field);
  }
  if(JSON.stringify([...(item.opts||[])].sort())!==JSON.stringify([...(expected.opts||[])].sort()))throw new Error('Las opciones no corresponden a la pantalla.');
  return true;
 }
 function pool(age,level=1){
  const rank=ages.indexOf(age);if(rank<0||![1,2,3].includes(level))return [];
  const entries=age==='early'?earlyVariants.flat():cases[age];
  const original=entries.map(([family,source,q,a,opts],index)=>{
   const familyIndex=age==='early'?Math.floor(index/8):index,mechanics=['askForHelp','clarify','expressNeed'],semanticFamilies=['ask_help','clarify','express_need'],constructs=['communicative_repair','clarification','functional_expression'];
   const item={id:`communication-v1:${age}:${level}:${index}`,contentKey:`communication-v1:${age}:${level}:${index}`,semanticKey:`communication:${age}:${level}:${index}`,domain:'communication',level,type:'standard',responseType:'choice',requiresStimulus:true,q,stimulus:[{type:'text',text:source}],a,opts:[a,...opts],topic:'Comunicación funcional · '+family.toLocaleLowerCase('es'),mechanic:'communication_'+mechanics[familyIndex],qualityDescriptor:{semanticFamily:'communication.'+semanticFamilies[familyIndex],scenarioFamily:['school','group_activity','everyday_request'][familyIndex]},primaryConstruct:constructs[familyIndex],secondaryLoads:['languageComprehension'],difficultyProfile:{age,level,ageYears:ageYears[age]},
    ...(age==='early'?{ageProfile:{id:'early',revision:1,context:familyIndex===2?'family':'school',mechanic:'communication',family:`communication-${semanticFamilies[familyIndex]}-${Math.floor((index%8)/2)}`}}:age==='junior'?{juniorProfile:{route:age,level}}:age==='teen'?{teenReview:{version:3}}:{schoolProfile:{route:age,level}})};
   return item;
  });
  return [...original,...scenarioPool(age,level)];
 }
 const conversationCases=[
  ['help','Pedir ayuda','Comercio','No encuentras el producto en el estante. Hay una persona del comercio cerca.','Pide ayuda e indica qué estás buscando.','¿Podrías ayudarme a encontrar el producto que busco?',['Nombra lo que necesitas encontrar','Dirige la petición a alguien que pueda ayudarte']],
  ['clarify','Pedir una aclaración','Transporte','Te dicen que el autobús sale desde otra parada, pero no indican dónde está.','Pregunta qué parada debes usar y cómo llegar a ella.','¿Cuál es la nueva parada y cómo se llega desde aquí?',['Pregunta por la nueva parada','Pide una indicación para llegar']],
  ['preferences','Expresar una preferencia','Restaurante','El grupo pide un plato para compartir. Prefieres que el acompañamiento vaya aparte.','Explica tu preferencia y pregunta si es posible.','Prefiero que el acompañamiento vaya aparte. ¿Se podría servir así?',['Expresa una preferencia concreta','Comprueba si el cambio es posible']],
  ['start','Iniciar una conversación','Actividad con amigos','Llegas a un taller. Una persona termina de preparar la mesa. Quieres participar.','Inicia una conversación y pregunta cómo incorporarte.','Hola, ¿puedo unirme al taller? ¿Dónde puedo empezar?',['Saluda o abre la conversación','Explica por qué te acercas']],
  ['turn','Responder a un turno','Conversación familiar','Una persona de tu familia propone dar un paseo. Te pregunta qué te parece.','Responde a su propuesta y añade una idea.','Me apetece. ¿Podemos pasar por el parque?',['Responde a lo que te han preguntado','Añade una propuesta que mantenga el tema']],
  ['question','Formular una pregunta','Centro educativo','Puedes participar en una actividad si entregas una autorización. Falta saber dónde se entrega.','Formula una pregunta que permita averiguarlo.','¿En qué lugar debo entregar la autorización?',['Pregunta por el dato que falta','Menciona la autorización']],
  ['service','Comunicarse en un servicio','Biblioteca','Quieres devolver un libro, pero el mostrador está cerrado. Hay una persona de recepción.','Pregunta cómo puedes devolver el libro hoy.','¿Hay un buzón o algún otro sitio donde pueda devolver este libro hoy?',['Explica qué necesitas hacer','Pregunta por una opción disponible hoy']],
  ['repair','Resolver un malentendido','Actividad de equipo','Alguien entendió que cancelabas el encuentro. Solo pediste retrasarlo.','Aclara el malentendido y propón confirmar la nueva hora.','El encuentro sigue en pie. Solo pedí retrasarlo. ¿Confirmamos a qué hora será?',['Aclara qué se mantiene','Pide acordar la nueva hora']],
  ['assert','Defender una petición','Reunión','Dos personas te han interrumpido mientras explicabas una propuesta. Quieres terminar en un minuto.','Pide terminar tu explicación antes de abrir otro turno.','Me falta un minuto para terminar. ¿Puedo cerrar mi propuesta y después escuchamos las demás?',['Pide un tiempo concreto','Respeta el turno posterior']],
  ['negotiate','Negociar un acuerdo','Actividad con amigos','Una persona solo puede reunirse antes de la merienda. Otra solo después. El grupo puede preparar dos tareas por separado.','Propón un acuerdo que tenga en cuenta las dos disponibilidades.','Quedamos por turnos. Una persona prepara la primera tarea antes de merendar y la otra revisa la segunda después.',['Da un lugar a las dos personas','Distingue las tareas y los dos momentos']],
  ['intention','Interpretar una intención y responder','Actividad de equipo','Una persona dice «Me gustaría intentarlo sola primero». Acepta ayuda si la pide.','Responde de una forma que respete lo que te ha pedido.','Vale, inténtalo. Estoy cerca si después quieres ayuda.',['Reconoce que quiere intentarlo por su cuenta','Ofrece apoyo sin imponerlo']],
  ['digital','Reformular un mensaje','Mensajería de equipo','Tu borrador dice «Esto está mal». Encontraste un nombre equivocado en la segunda línea del cartel.','Reformula el mensaje para que el equipo pueda corregir el dato.','En la segunda línea del cartel aparece un nombre equivocado. ¿Podemos revisarlo antes de enviarlo?',['Identifica dónde está el problema','Propón una revisión sin descalificar']]
 ];
 function supervisedPool(age,level=3){
  if(!['junior','primary','middle','teen'].includes(age)||level!==3)return [];
  return conversationCases.map(([key,skill,label,context,q,sample,writingRubric])=>{
   const id=`communication-v4:${age}:${level}:${key}`;
   // The same interpersonal goal can have several valid formulations.
   const topic='Comunicación funcional · '+skill;
   return {id,contentKey:id,semanticKey:id,domain:'communication',level,type:'self',responseType:'written',
    discussionReview:true,requiresStimulus:true,topic,q,sample,writingRubric,
    stimulus:[{type:'text',label,text:context}],
    mechanic:'communication_'+key,primaryConstruct:'communicative_production',
    qualityDescriptor:{semanticFamily:'communication.'+key,scenarioFamily:'interpersonal.'+key},
    ...(age==='junior'?{juniorProfile:{route:age,level}}:age==='teen'?{teenReview:{version:3}}:{schoolProfile:{route:age,level}})};
  });
 }
 function revisedPool(age,level){
  return [...pool(age,level).filter(item=>!['communication_verifySource','communication_summarize'].includes(item.mechanic)),...supervisedPool(age,level)];
 }
 function validate(item){
  const age=item?.ageProfile?.id||item?.juniorProfile?.route||item?.schoolProfile?.route||(item?.teenReview?'teen':null),source=ages.includes(age)?[...pool(age,item?.level),...digitalPool(age,item?.level),...supervisedPool(age,item?.level)].find(entry=>entry.id===item?.contentKey||entry.id===item?.id):null;
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  if(/^communication-v4:/.test(source?.contentKey||'')){
   const regional=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
   const expected=item.localization?regional.localizeItem(source,item.localization.locale,item.domain):source;
   for(const field of ['domain','type','responseType','q','sample','writingRubric','stimulus','discussionReview','qualityDescriptor'])
    if(!same(item[field],expected[field]))throw new Error('La intervención no coincide con su pauta de revisión.');
   return true;
  }
  if(/^communication-v[23]:/.test(source?.contentKey||'')){
   const regional=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
   const expected=item.localization?regional.localizeItem(source,item.localization.locale,item.domain):source;
   if(['domain','mechanic','primaryConstruct','type','responseType','q','a','stimulus','qualityDescriptor'].some(field=>!same(item[field],expected[field]))||
       !same([...(item.opts||[])].sort(),[...expected.opts].sort()))throw new Error('La respuesta no coincide con el documento de comunicación.');
   return true;
  }
  const authored=source&&item.domain==='communication'&&item.mechanic===source.mechanic&&same(item.qualityDescriptor,source.qualityDescriptor)&&item.primaryConstruct===source.primaryConstruct&&item.responseType==='choice'&&item.type==='standard'&&Array.isArray(item.opts)&&item.opts.length===3&&new Set(item.opts).size===3&&item.opts.includes(item.a)&&typeof item.q==='string'&&item.q.trim()&&Array.isArray(item.stimulus)&&item.stimulus.length===1&&item.stimulus[0]?.type==='text'&&typeof item.stimulus[0].text==='string'&&item.stimulus[0].text.trim();
  const unchanged=!item.localization&&(item.q===source?.q&&item.a===source?.a&&same([...(item.opts||[])].sort(),[...(source?.opts||[])].sort())&&same(item.stimulus,source?.stimulus));
  if(!authored||(!unchanged&&(!item.localization||item.localization.domain!=='communication'||!item.localization.locale)))throw new Error('La actividad de comunicación no coincide con el banco revisado.');
  return true;
 }
 root.CommunicationContent={pool,digitalPool,digitalFamilies,transversalPool,availableFormats,revisedPool,validate,validateTransversal};if(typeof module!=='undefined')module.exports=root.CommunicationContent;
})(typeof window==='undefined'?globalThis:window);

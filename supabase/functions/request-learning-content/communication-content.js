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
 function validate(item){
  const age=item?.ageProfile?.id||item?.juniorProfile?.route||item?.schoolProfile?.route||(item?.teenReview?'teen':null),source=ages.includes(age)?pool(age,item?.level).find(entry=>entry.id===item?.contentKey||entry.id===item?.id):null;
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  if(source?.contentKey.startsWith('communication-v2:')){
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
 root.CommunicationContent={pool,validate};if(typeof module!=='undefined')module.exports=root.CommunicationContent;
})(typeof window==='undefined'?globalThis:window);

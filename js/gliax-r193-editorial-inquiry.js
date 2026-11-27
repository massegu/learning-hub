(function(root){
  'use strict';
  const {fingerprint,outcome}=typeof module!=='undefined'?require('./gliax-r192'):root.GliaxR192;

  // Each line is an independently authored inference. A solution is a set
  // of concepts. Separate sets are alternative ways to obtain enough data.
  const rows=[
    ['early',1,'recipient-identity','repartir-un-aviso','Hay un aviso cerrado para alguien. Eva y Teo esperan un aviso. ¿Qué dato compruebas antes de entregarlo?',
      [['destinatario'],['para quién es'],['nombre del destinatario']], 'Comprueba a quién va dirigido el aviso.'],
    ['early',1,'availability-now','biblioteca','Quieres leer un cuento con dibujos. Ya elegiste el título. ¿Qué preguntas para saber si te lo pueden prestar hoy?',
      [['si está disponible'],['si está prestado'],['si está libre hoy']], 'El título ya se conoce. Falta saber si el cuento está disponible hoy.'],
    ['early',2,'matching-code','cajas-de-material','Dos cajas tienen dibujos distintos. Tu tarjeta tiene el dibujo de una caja, pero no puedes verla. ¿Qué le pides a quien la sostiene?',
      [['dibujo de la tarjeta'],['símbolo de la tarjeta'],['qué dibujo hay en mi tarjeta']], 'El dibujo de tu tarjeta permite relacionarla con una sola caja.'],
    ['early',2,'route-branch-destination','pasillos','Llegas a dos puertas. Una va al patio y otra al comedor, pero no hay carteles. Quieres ir al patio. ¿Qué necesitas saber?',
      [['qué puerta va al patio'],['cuál lleva al patio'],['dónde está la puerta del patio']], 'Saber qué puerta comunica con el patio basta para escoger.'],
    ['early',3,'deficit-from-inventory','pinturas','Hay cuatro personas y cada una necesita un pincel. Hay pinceles en una caja cerrada. ¿Qué dato falta para saber cuántos pinceles más necesitas?',
      [['cuántos pinceles hay'],['número de pinceles en la caja'],['cantidad de pinceles que hay']], 'La cantidad que ya está en la caja permite calcular cuántos faltan.'],
    ['junior',1,'permission-for-recipient','mural','El cartel está listo. Antes de mandarlo al grupo, debes saber si quien lo hizo acepta que ese grupo lo vea. ¿Qué dato pides?',
      [['si autoriza compartir'],['permiso para compartir'],['permiso del autor'],['si acepta que lo vea el grupo']], 'El permiso debe corresponder al grupo al que vas a enviarlo.'],
    ['junior',2,'current-vs-old-version','excursion','Una hoja dice que se sale del patio y otra que se sale de la puerta. Las dos son de la misma excursión. ¿Qué dato falta para elegir el lugar correcto?',
      [['cuál está vigente'],['cuál es el aviso vigente'],['aviso actualizado'],['confirmación del punto de salida']], 'Hace falta confirmar cuál es el aviso vigente o el punto de salida actual.'],
    ['junior',2,'compare-stock-and-demand','materiales','Hay doce hojas en la mesa. No sabes cuántas personas vienen ni cuántas hojas necesita cada una. ¿Qué datos averiguas para saber si alcanzan?',
      [['cuántas personas','hojas por persona'],['número de personas','hojas por persona'],['total de hojas necesarias']], 'El total necesario basta. También puedes obtenerlo con personas y hojas por persona.'],
    ['junior',3,'new-condition-eligibility','turnos','El juego acepta a quien ya apuntó su nombre o está en el equipo azul. Santi no apuntó su nombre. ¿Qué dato falta para saber si puede jugar?',
      [['si está en el equipo azul'],['si pertenece al equipo azul'],['si es del equipo azul']], 'Para Santi solo queda comprobar la condición del equipo azul.'],
    ['junior',3,'supply-expiration','reserva-de-cuentos','Un cuento está reservado hasta un día concreto. Hoy es martes. ¿Qué dato falta para saber si hoy puede prestarse a otra persona?',
      [['hasta qué día'],['fecha de fin de la reserva'],['cuándo acaba la reserva'],['vencimiento de la reserva']], 'El final de la reserva permite comprobar si todavía está retenido hoy.'],
    ['primary',1,'comparison-unit','medicion','Un cartel dice 8 y otro 100 para la longitud de dos cuerdas. Quieres compararlas. ¿Qué información falta junto a las cifras?',
      [['unidad de medida'],['unidades de medida'],['si son centímetros o metros'],['en qué unidad']], 'Antes de comparar cifras hay que expresarlas en la misma unidad de longitud.'],
    ['primary',2,'transfer-wait-dependency','viaje-local','El primer tramo termina a las 16:10. El segundo tramo empieza con una salida cuyo horario no tienes. ¿Qué dato buscas para saber si puedes enlazar ambos?',
      [['hora de salida del segundo'],['horario del segundo tramo'],['cuándo sale el segundo']], 'La hora del segundo tramo debe compararse con la llegada del primero.'],
    ['primary',2,'divisibility-missing-divisor','semillero','Hay 18 semillas. Quieres llenar todos los sobres con la misma cantidad y sin que sobre ninguna. ¿Qué dato falta para saber si se puede?',
      [['cuántos sobres hay'],['número de sobres'],['cantidad de sobres']], 'El número de sobres permite comprobar si se pueden dividir las 18 semillas exactamente.'],
    ['primary',3,'compare-after-shared-cost','compra-del-taller','Dos tiendas tienen el mismo precio para el material. Compras la misma cantidad en cualquiera. Una añade un gasto al final; no has visto ese gasto en ninguna. ¿Qué comparas para saber dónde cuesta menos?',
      [['coste final de ambas'],['precio total de ambas'],['gastos adicionales de ambas'],['gastos extra de cada tienda']], 'Como el precio del material coincide, los gastos adicionales o los totales finales deciden.'],
    ['primary',3,'quantity-after-removals','inscripciones','Había 20 apuntados. Llegaron dos altas y después hubo bajas sin contar. ¿Qué dato falta para saber cuántos siguen apuntados?',
      [['cuántas bajas'],['número de bajas'],['cuántos se dieron de baja']], 'Las altas ya se conocen. El número de bajas permite obtener el total actual.'],
    ['middle',1,'entity-match-identifier','partes-de-taller','Dos partes indican estados distintos de una máquina. Fueron escritos el mismo día, pero no se sabe si hablan de la misma máquina. ¿Qué dato buscas primero?',
      [['identificador de la máquina'],['número de serie de cada máquina'],['máquina a la que se refiere cada parte'],['si identifican la misma máquina']], 'Hay que vincular cada parte con su máquina antes de hablar de contradicción.'],
    ['middle',2,'divide-by-denominator','clubs','El club A registró 10 asistencias y el B registró 15. Quieres comparar la fracción de plazas ocupadas, no los recuentos. ¿Qué datos faltan?',
      [['capacidad de cada club'],['plazas disponibles de cada club'],['número total de plazas de ambos']], 'Cada recuento necesita su propio total de plazas para obtener una fracción comparable.'],
    ['middle',2,'parallel-ending-bound','trabajo-grupal','Dos tareas empiezan al mismo tiempo. Puedes entregar solo cuando terminan las dos. Sabes cuándo termina la primera. ¿Qué dato falta?',
      [['hora de fin de la segunda'],['cuándo acaba la segunda'],['cuándo termina la segunda tarea']], 'La entrega queda limitada por el final más tardío de las dos tareas.'],
    ['middle',3,'source-update-precedence','programacion','Un aviso del coordinador y un mensaje reenviado dan horarios distintos. Ambos aparecen como recibidos hoy. ¿Qué dato ayuda a decidir si uno reemplaza al otro?',
      [['si el aviso sustituye al anterior'],['qué mensaje está vigente'],['confirmación del coordinador'],['orden de emisión y quién lo publicó']], 'La recepción no acredita una actualización. Una confirmación de vigencia sí decide.'],
    ['middle',3,'interval-endpoint-inclusion','entrega-online','El acuerdo exige entregar hasta las 18:00 y el registro muestra exactamente las 18:00. El procedimiento no explica si el límite incluye esa hora. ¿Qué debes confirmar?',
      [['si las 18 están incluidas'],['si el límite es inclusivo'],['si se admite exactamente a las 18'],['si se acepta la hora exacta del límite']], 'La inclusión del instante límite decide si una entrega justo en ese momento cumple.'],
    ['teen',1,'availability-window-overlap','equipamiento','Necesitas una sala libre durante 45 minutos continuos para un ensayo. Sabes qué sala puedes usar pero no las horas que quedan libres. ¿Qué dato consultas?',
      [['franjas libres de la sala'],['horario disponible de la sala'],['intervalos libres'],['disponibilidad horaria']], 'La ventana libre permite verificar que hay 45 minutos seguidos de disponibilidad.'],
    ['teen',2,'net-budget-after-fixed-and-variable','transporte','La reserva ya cuesta 35 €. El tope total es de 60 €. El envío depende del recorrido y todavía no tienes su tarifa. ¿Qué dato necesitas para decidir si caben los dos gastos?',
      [['coste del envío'],['tarifa de envío'],['precio del transporte para ese recorrido'],['total con el envío']], 'El envío debe caber en los 25 € restantes o el total debe ser como máximo 60 €.'],
    ['teen',3,'rounding-resolution','registro-de-mediciones','Un informe registra 8,0 cm y otro 8,1 cm del mismo objeto. Los instrumentos podrían redondear de forma distinta. ¿Qué necesitas para saber si la diferencia es compatible con el redondeo?',
      [['precisión de ambos instrumentos'],['resolución de los dos instrumentos'],['regla de redondeo de cada medida'],['margen de redondeo de ambos']], 'Hacen falta la resolución o las reglas de redondeo para comparar los intervalos posibles de ambas lecturas.'],
    ['teen',3,'conditional-cancellation-cost','reserva-con-baja','Puedes cancelar sin coste si faltan más de 48 horas. Se ha confirmado que faltan menos de 48 horas. ¿Qué dato falta para decidir si cancelar es más barato que mantener la reserva?',
      [['penalización y coste de mantener'],['coste de cancelar','coste de mantener'],['diferencia de coste entre cancelar y mantener']], 'Al quedar fuera del plazo gratuito, compara la penalización con el coste de conservar la reserva.'],
  ];
  const closing=[
    ['early',1,'find-start-marker','pista-con-flechas','El juego dice que sigas las flechas desde el círculo. Ves las flechas, pero hay dos círculos. ¿Qué dato te hace falta para empezar?',
      [['cuál es el círculo de salida'],['dónde está la salida'],['desde qué círculo se empieza']], 'Primero identifica el círculo de salida. A partir de él puedes seguir las flechas.'],
    ['early',1,'identify-filled-bin','cajas-para-ordenar','Solo debes traer la caja que ya tiene piezas. Las dos cajas tienen tapa y no puedes abrirlas. ¿Qué preguntas?',
      [['qué caja tiene piezas'],['cuál tiene las piezas'],['en qué caja están las piezas']], 'El dato necesario es qué caja contiene las piezas, aunque ambas se vean iguales por fuera.'],
    ['early',2,'signal-already-fired','entrada-al-aula','La consigna dice que se entra al sonar la campana. Acabas de llegar y no oíste lo que pasó antes. ¿Qué compruebas?',
      [['si ya sonó la campana'],['si ya ha sonado la campana'],['si ya tocó la campana']], 'Si la campana ya sonó, se cumplió la señal de entrada.'],
    ['early',2,'direction-from-viewpoint','plano-del-aula','Una nota dice «a la derecha» para llegar al rincón de música. Dos personas miran en sentidos contrarios. ¿Qué dato necesitas para seguir la nota?',
      [['hacia dónde mira quien dio la indicación'],['desde qué lado se mira'],['a la derecha de quién']], 'La derecha depende de la posición y la dirección de la persona que dio la indicación.'],
    ['early',2,'missing-category-count','botones-de-colores','Para el juego hacen falta tres botones rojos. La caja tiene seis botones de varios colores. ¿Qué dato necesitas saber?',
      [['cuántos botones rojos hay'],['número de botones rojos'],['cuántos son rojos']], 'El total de botones no basta. Solo cuentan los botones rojos.'],
    ['early',3,'prior-position-reference','corro','En el corro va primero quien estaba después de Ada. Sabes quién está ahora junto a Ada, pero todos cambiaron de sitio. ¿Qué falta saber?',
      [['quién estaba después de ada'],['quién iba detrás de ada antes del cambio'],['quién seguía a ada antes']], 'La consigna se refiere al orden anterior al cambio, no al sitio actual.'],
    ['early',3,'leading-landmark-relation','bandejas','La nota dice que pongas tu bandeja junto a la de Teo. Hay tres bandejas iguales. ¿Qué necesitas saber para elegir el lugar?',
      [['cuál es la bandeja de teo'],['dónde está la bandeja de teo'],['cuál le pertenece a teo']], 'Necesitas reconocer la bandeja que sirve de referencia, aunque las tres tengan el mismo aspecto.'],
    ['junior',1,'source-attribution','tablón','Un aviso pide llevar cartulina, pero en el tablón se juntaron avisos de dos clases. ¿Qué dato compruebas antes de cambiar tu mochila?',
      [['de qué clase es el aviso'],['a qué clase va dirigido'],['qué clase lo recibió']], 'El aviso solo sirve para decidir tu mochila si corresponde a tu clase.'],
    ['junior',1,'shared-item-invariant','prestamo-de-material','La clase anterior guardó la lupa en una bandeja. Han cambiado de sitio todas las bandejas. ¿Qué dato te sirve para encontrar la lupa ahora?',
      [['dónde quedó la bandeja con la lupa'],['dónde está ahora la lupa'],['lugar actual de la lupa']], 'Hace falta la ubicación actual. La posición anterior de la bandeja no basta.'],
    ['junior',2,'alternating-pattern-phase','turno-de-mesa','En la mesa se alternan un turno de lectura y uno de dibujo. No has visto cuál acaba de terminar. ¿Qué necesitas preguntar para saber qué toca?',
      [['qué turno acaba de terminar'],['si el último fue lectura o dibujo'],['tipo del turno anterior']], 'Identificar el turno anterior permite elegir el siguiente en la alternancia.'],
    ['junior',2,'same-object-or-copy','tarjetas-iguales','Dos listas muestran el mismo dibujo de una tarjeta. Quieres saber si hay una tarjeta compartida o dos distintas. ¿Qué dato comparas?',
      [['código de cada tarjeta'],['si es la misma tarjeta física'],['identificador de las dos tarjetas']], 'El dibujo puede repetirse. Un código o la confirmación de que es el mismo objeto resuelve la duda.'],
    ['junior',2,'intervening-sequence-gap','fila-de-juego','Un cartel dice que pasas cuando terminen quienes están antes de ti. Conoces a la primera persona de la fila, pero no ves el resto. ¿Qué dato necesitas para saber cuántos turnos faltan?',
      [['cuántas personas hay delante'],['número de personas por delante'],['cuántos turnos hay antes del mío']], 'Contar a todas las personas anteriores da el número de turnos que te separan de tu turno.'],
    ['junior',3,'minimum-two-charge-cycles','baterias-del-taller','Usarás una sola batería para dos sesiones sin pausa de carga. Sabes cuánto dura la primera, pero no la segunda ni la batería. ¿Qué datos faltan para decidir?',
      [['duración de la segunda sesión','duración de la batería'],['cuánto dura la segunda','cuánto dura la batería'],['tiempo de uso total','autonomía de la batería']], 'Compara la duración conjunta con la autonomía, porque entre sesiones no se puede recargar.'],
    ['junior',3,'shared-interval-two-people','quedar-para-leer','Noa puede leer antes de clase. Leo puede leer después de comer. No sabes las horas exactas de esos dos ratos. ¿Qué datos comparas para saber si pueden coincidir?',
      [['horarios disponibles de los dos'],['franja de noa','franja de leo'],['horas libres de ambos'],['si coinciden sus horarios'],['si tienen un tramo en común']], 'Se necesitan las dos franjas, o una confirmación de que tienen algún tramo en común.'],
    ['primary',1,'contextual-permission-validity','carpeta-del-equipo','Un permiso deja abrir una carpeta durante el taller. Ahora estás preparando otro trabajo. ¿Qué información buscas para decidir si ese permiso sigue sirviendo?',
      [['si el permiso cubre el nuevo trabajo'],['para qué actividad vale el permiso'],['alcance del permiso']], 'El permiso puede limitarse a un propósito. Comprueba que incluye el nuevo trabajo.'],
    ['primary',1,'relevant-score-definition','juego-por-equipos','La tabla dice que un equipo tiene más números marcados que otro. Algunas marcas son ensayos y otras son puntos. ¿Qué debes saber antes de decidir quién va ganando?',
      [['qué marcas cuentan como puntos'],['cuáles son puntos y cuáles ensayos'],['qué marcas puntúan']], 'Solo las marcas que puntúan sirven para comparar la clasificación.'],
    ['primary',2,'unknown-baseline-delta','termometro-de-taller','La temperatura subió 4 grados. El aviso pide avisar si ahora supera los 24, pero no muestra la temperatura actual. ¿Qué dato permite decidir?',
      [['temperatura inicial'],['temperatura de antes'],['temperatura actual']], 'La temperatura actual basta. También se obtiene sumando cuatro a la inicial.'],
    ['primary',2,'multi-component-gateway','feria-escolar','Para abrir un puesto necesitan una persona responsable y un permiso. Ya confirmaste el permiso. La lista de responsables está sin cerrar. ¿Qué debes confirmar?',
      [['si hay una persona responsable'],['quién es responsable del puesto'],['si se asignó un responsable']], 'La condición que sigue sin acreditarse es que haya una persona responsable.'],
    ['primary',2,'count-set-overlap','participacion-escolar','Hay 10 alumnos en dibujo y 8 en lectura. Algunos están en ambos grupos. ¿Qué dato falta para saber cuántos alumnos distintos participan?',
      [['cuántos están en ambos grupos'],['cuántos están en los dos grupos'],['número de alumnos repetidos']], 'El solapamiento se cuenta una sola vez al calcular cuántas personas distintas hay.'],
    ['primary',3,'travel-deadline-with-slack','pasar-por-la-biblioteca','Debes llegar a las 17:00 y caminar lleva 20 minutos. Quieres hacer una parada antes de seguir. Conoces tu hora de salida. ¿Qué dato falta para saber si puedes parar?',
      [['duración de la parada'],['cuánto dura la parada'],['tiempo que necesitas para parar']], 'La parada consume parte del margen entre la llegada sin parar y la hora límite.'],
    ['primary',3,'infer-correct-branch-from-exception','mapa-de-lectura','En el plano, quien trae la caja grande debe usar la rampa. Si la rampa está cerrada, se usa la puerta lateral. No puedes ver la rampa desde donde estás. ¿Qué compruebas?',
      [['si la rampa está abierta'],['si la rampa está cerrada'],['estado de la rampa']], 'El acceso por la puerta lateral es una excepción que depende del estado de la rampa.'],
    ['middle',1,'which-measurement-label','historial-de-taller','Una hoja pone 9 y otra 12 como resultados. Una corresponde a tiempo y otra a cantidad, pero las etiquetas se borraron. ¿Qué dato hace falta para comparar los tiempos?',
      [['cuál de las cifras mide el tiempo'],['qué mide cada cifra'],['variable que corresponde a cada valor']], 'Antes de operar necesitas identificar cuál de los datos se refiere al tiempo.'],
    ['middle',1,'scope-of-rate-period','uso-de-una-sala','Se publican los usos de una sala como una tasa por semana. En otra tabla aparecen los usos por registro, pero se perdió el periodo. ¿Qué dato recuperas para comparar sus tasas?',
      [['periodo que cubre el segundo registro'],['duración del periodo del segundo registro'],['cuántas semanas abarca la segunda tabla']], 'La segunda serie necesita un periodo para expresarla en usos por semana.'],
    ['middle',2,'tie-break-rule','designacion-de-turnos','Dos equipos empatan en la puntuación que decide el primer turno. El acta tiene sus datos, pero no dice cómo se resuelven los empates. ¿Qué necesitas saber?',
      [['regla de desempate'],['criterio de desempate'],['cómo se resuelve el empate']], 'Sus datos solo se pueden interpretar para el turno si se conoce el criterio de desempate.'],
    ['middle',2,'remaining-bottleneck-in-series','cadena-de-tareas','Tres tareas deben realizarse una después de otra. La primera terminó a las 10:00 y dispones de la duración de la tercera. ¿Qué dato falta para estimar el final si empiezan en cuanto pueden?',
      [['duración de la segunda tarea'],['cuánto dura la segunda tarea'],['tiempo que tarda el paso intermedio']], 'En una cadena, la duración de la tarea intermedia desplaza el inicio de la última.'],
    ['middle',2,'prior-rule-vs-default-state','panel-de-practica','Un panel empieza en modo básico. Al pulsar un botón, alterna entre básico y avanzado. No puedes ver la pantalla y sí sabes que nadie lo reinició. ¿Qué dato permite inferir el modo actual?',
      [['si se ha pulsado un número par o impar de veces'],['paridad de las pulsaciones'],['cuántas veces se pulsó']], 'Cada pulsación invierte el modo. Solo importa si hubo un número par o impar de cambios.'],
    ['middle',3,'event-order-over-receipt','registro-de-incidencias','Un registro muestra «cerrado» y otro «abierto». Las dos entradas llegaron juntas al sistema después de una caída de red. ¿Qué dato permite reconstruir el último estado?',
      [['hora real de cada cambio'],['orden en que ocurrieron los cambios'],['momento en que ocurrió cada evento']], 'La hora de recepción no ordena eventos que se registraron tras un retraso. Hace falta el orden de ocurrencia.'],
    ['middle',3,'bundle-threshold-per-person','pase-de-museo','Pagarás un pase por persona salvo que al menos ocho entren en el mismo turno. Hay once interesados repartidos en turnos, pero solo conoces el total. ¿Qué dato permite aplicar el pase de grupo?',
      [['cuántas personas entran en el mismo turno'],['número de personas por turno'],['reparto de participantes por turno']], 'La condición se calcula por turno y el total no garantiza que haya ocho juntos.'],
    ['teen',1,'directionality-of-policy','uso-de-material','La norma garantiza que todo equipo acreditado puede reservar. La lista muestra que un equipo reservó, pero puede haber otros modos de reserva. ¿Qué dato te permite saber si ese equipo estaba acreditado?',
      [['si figura en la lista de acreditaciones'],['estado de acreditación del equipo'],['confirmación de que estaba acreditado']], 'El hecho de reservar no demuestra la acreditación si existen otras vías de acceso.'],
    ['teen',1,'availability-of-alternative-cost-class','pago-de-sala','El cargo puede ser completo o reducido si se reservó por el programa municipal. El recibo no identifica el programa. ¿Qué dato solicitas para saber qué precio corresponde?',
      [['programa por el que se hizo la reserva'],['si se reservó por el programa municipal'],['tipo de reserva registrado']], 'La modalidad registrada determina qué tarifa corresponde.'],
    ['teen',2,'shared-edge-failure','rutas-de-evacuacion','Hay dos rutas del aula al patio. El plano solo muestra cuánto mide cada una. Quieres saber si siempre queda una ruta cuando se cierra un solo pasillo. ¿Qué dato necesitas?',
      [['qué pasillos comparten'],['si comparten algún pasillo'],['qué pasillos recorre cada ruta']], 'Si las dos rutas pasan por el mismo pasillo, un solo cierre puede inutilizarlas. Si no comparten ninguno, un cierre deja libre al menos una ruta.'],
    ['teen',2,'missing-membership-for-conditional-vote','consulta-del-equipo','El voto de una persona cuenta solo si pertenecía al grupo cuando se abrió la consulta. Sabes que pertenece hoy. ¿Qué dato necesitas para verificar el voto?',
      [['si pertenecía al grupo al abrir la consulta'],['fecha de incorporación al grupo'],['lista del grupo al abrirse la consulta']], 'La pertenencia actual no demuestra que figurara en el grupo en el momento definido.'],
    ['teen',2,'independent-failure-mode-counting','inventario-de-fallos','Se registraron 5 avisos de batería y 7 de conexión. Una misma incidencia puede tener los dos avisos. ¿Qué dato permite contar incidencias que tuvieron solo un tipo?',
      [['cuántas incidencias tuvieron ambos avisos'],['solapamiento de ambos tipos'],['número de incidencias con los dos tipos']], 'Cada incidencia con ambos tipos aumenta los dos totales. Hay que descontar sus dos avisos al contar los casos de un solo tipo.'],
    ['teen',3,'weight-for-aggregate-rate','informe-de-asistencia','Dos sedes publican porcentajes de asistencia. Quieres una tasa conjunta. Ya conoces los porcentajes, pero una sede es mayor que la otra. ¿Qué datos necesitas para combinar las tasas?',
      [['tamaño de los dos grupos'],['número de plazas de cada sede'],['denominadores de ambos porcentajes'],['cantidad de personas de cada sede']], 'La tasa conjunta pondera cada porcentaje por el número de personas o plazas que representa.'],
    ['teen',3,'cross-check-dependency-distance','salas-de-montaje','El primer montaje ya tiene hora de fin y el segundo tiene hora de inicio. Quien monta debe llevar el material de una sala a otra entre ambos horarios. ¿Qué dato falta para saber si llega a tiempo?',
      [['duración del traslado'],['tiempo de traslado'],['cuánto se tarda entre las salas']], 'Compara el tiempo necesario para trasladar el material con el margen entre las tareas.']
  ];
  const indexed=(batch,records)=>records.map((row,index)=>['IN193-'+batch+'-'+String(index+1).padStart(2,'0'),row]);
  const records=new Map([...indexed('B3',rows),...indexed('B9',closing)]);
  const norm=text=>String(text??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  function get(id){
    const row=records.get(id);
    if(!row)return null;
    const [ageBand,level,mechanic,context,prompt,sets,feedback]=row;
    const presentation={prompt,feedback,hint:'Busca el dato que falta para decidir. Usa las condiciones que ya aparecen en el enunciado.'};
    return {id,ageBand,level,mechanic,construct:mechanic,family:'IN',mechanismContext:context,
      contentVersion:'r19.3-editorial-4',gradingVersion:'r19.3-editorial-4',editorial:true,inquiryEditorial:true,
      presentation,cognitiveFingerprint:fingerprint(['IN',mechanic,sets.map(set=>set.length).sort()]),
      surfaceFingerprint:fingerprint(presentation),answerModel:{mode:'open_concepts',sets}};
  }
  function grade(item,response){
    const value=norm(response);
    if(!value)return outcome('no_response');
    if(/\b(?:no necesito|no hace falta|no importa|no hay que saber)\b/.test(value))return outcome('uninterpretable');
    const contains=phrase=>(' '+value+' ').includes(' '+norm(phrase)+' ');
    const sets=item.answerModel.sets;
    if (sets.some(set=>set.every(contains)))return outcome('correct');
    if (sets.some(set=>set.some(contains)))return outcome('partial');
    return outcome('uninterpretable');
  }
  function pool({family,ageBand,level}){
    return family==='IN'?[...records].filter(([,row])=>row[0]===ageBand&&row[1]===level).map(([id])=>get(id)):[];
  }
  const api={ids:()=>[...records.keys()],get,pool,grade};
  root.GliaxR193EditorialInquiry=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);

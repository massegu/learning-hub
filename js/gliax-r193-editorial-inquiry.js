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
  const records=new Map(rows.map((row,index)=>['IN193-B3-'+String(index+1).padStart(2,'0'),row]));
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

(function(root){
'use strict';
const ages=['early','junior','primary','middle','teen'];
const definitions={
 rules:{title:'Actúa con reglas 2.0',primaryConstruct:'responseInhibition',secondaryLoads:['workingMemory','cognitiveFlexibility'],functionalPurpose:'Detener una respuesta automática y adaptarse cuando cambian las instrucciones',printable:'interactive-only'},
 words:{title:'La palabra que encaja',primaryConstruct:'lexicalSearch',secondaryLoads:['ruleMaintenance','inhibition'],functionalPurpose:'Buscar palabras precisas que cumplan las condiciones de un mensaje',printable:'fully-printable'},
 deduction:{title:'Descubre quién',primaryConstruct:'deductiveReasoning',secondaryLoads:['selectiveAttention','hypothesisUpdating'],functionalPurpose:'Descartar alternativas con pistas antes de tomar una decisión',printable:'fully-printable'},
 change:{title:'Cambio de plan',primaryConstruct:'planning',secondaryLoads:['updating','cognitiveFlexibility'],functionalPurpose:'Reorganizar acciones ante un imprevisto conservando el objetivo',printable:'fully-printable'},
 information:{title:'¿Qué necesitas saber?',primaryConstruct:'relevanceSelection',secondaryLoads:['decisionMaking','inhibition'],functionalPurpose:'Seleccionar los datos necesarios para resolver una decisión concreta',printable:'fully-printable'},
 contradiction:{title:'Encuentra la contradicción',primaryConstruct:'consistencyChecking',secondaryLoads:['readingComprehension','attention'],functionalPurpose:'Contrastar fuentes incompatibles antes de actuar',printable:'fully-printable'}
};
const quality=root.ContentQuality||(typeof require==='function'&&require('./content-quality'));
for(const [key,d] of Object.entries(definitions))quality.register('cognitive.'+key,d.functionalPurpose,'constraints');
const T=text=>({type:'text',text}),L=(label,items)=>({type:'list',label,items});
const norm=s=>String(s).trim().toLocaleLowerCase('es').normalize('NFC').replace(/[áéíóúü]/g,c=>({'á':'a','é':'e','í':'i','ó':'o','ú':'u','ü':'u'}[c])); // Preserve ñ: it is a different letter.
const lexicon={
 animales:['gato','pato','rana','ratón','toro','oso','lobo','mono','conejo','gorila','paloma','jirafa','ballena','tortuga','canario','caballo'],
 alimentos:['pan','arroz','sopa','pera','pasta','tomate','patata','zanahoria','naranja','manzana','yogur','queso','leche','cacao','cereza','lenteja'],
 herramientas:['pala','sierra','martillo','taladro','regla','alicate','lima','tijera','destornillador','rastrillo'],
 acciones:['cantar','bailar','cocinar','caminar','ordenar','reparar','pintar','observar','medir','leer','escribir','revisar','limpiar','mezclar','construir','compartir']
};
function wordFits(word,task){const w=norm(word),c=task.constraints;return (lexicon[c.category]||[]).some(x=>norm(x)===w)&&(!c.contains||w.includes(c.contains))&&(!c.excludes||!w.includes(c.excludes))&&(!c.suffix||w.endsWith(c.suffix))&&(!c.starts||w.startsWith(c.starts))&&(!c.minLength||w.length>=c.minLength);}
function words(age,level,index){
 const rank=ages.indexOf(age),category=Object.keys(lexicon)[index],catalog=lexicon[category];
 const constraints={category};if(rank>0||level>1)constraints.contains=['a','a','a','a'][index];
 if(level===3||rank>=2&&level>=2)constraints.excludes=['r','n','s','i'][index];
 if(rank===1&&level===2){delete constraints.contains;constraints.starts='p';}
 if(rank>=2&&level===3){delete constraints.excludes;if(category==='acciones')constraints.suffix='ar';else constraints.minLength=[6,7,8][index];}
 const task={kind:'words',constraints,productionAllowed:rank>0,answer:[]};
 const valid=catalog.filter(w=>wordFits(w,task));
 const outsiders=Object.values(lexicon).flat().filter(w=>!wordFits(w,task));
 task.options=[valid[index%valid.length],...outsiders.filter(w=>catalog.includes(w)).slice(0,2)];
 for(const w of outsiders)if(task.options.length<4&&!task.options.includes(w))task.options.push(w);
 task.answer=[task.options[0]];
 const labels=['Debe ser de la categoría: '+category];if(constraints.contains)labels.push('Debe contener '+constraints.contains.toUpperCase());if(constraints.excludes)labels.push('No puede contener '+constraints.excludes.toUpperCase());if(constraints.suffix)labels.push('Debe terminar en -'+constraints.suffix);if(constraints.starts)labels.push('Debe empezar por '+constraints.starts.toUpperCase());if(constraints.minLength)labels.push('Debe tener al menos '+constraints.minLength+' letras');
 return {task,scenario:'lexical.'+category,q:rank===0?'Elige la palabra que cumple la regla.':'Busca una palabra que cumpla todas las condiciones.',stimulus:[L('Condiciones',labels),L('Opciones',task.options)],sample:task.answer[0],why:'Comprueba cada condición: '+labels.join('; ')+'.',difficulty:{constraints:labels.length,productionAllowed:rank>0}};
}
const deductionSettings=[
 {id:'garden',goal:'Localiza a la persona que tiene tu turno en el taller del jardín.',attrs:[['gato','perro','conejo'],['camiseta','bufanda'],['jardín','taller']]},
 {id:'music',goal:'Descubre a quién debes entregar la entrada del ensayo.',attrs:[['guitarra','tambor','piano'],['ensayo','escenario'],['mañana','tarde']]},
 {id:'workshop',goal:'Busca el encargo que coincide con las pistas del taller.',attrs:[['cerámica','madera','costura'],['mesa norte','mesa sur'],['recoger','revisar']]},
 {id:'community',goal:'Identifica el turno de ayuda que te han asignado.',attrs:[['huerto','radio','teatro'],['lunes','martes'],['primera hora','última hora']]}
];
function deduction(age,level,index){
 const rank=ages.indexOf(age),s=deductionSettings[index],dimensions=rank===0?2:3;
 const all=s.attrs.slice(0,dimensions).reduce((rows,attr)=>rows.flatMap(row=>attr.map(v=>[...row,v])),[[]]);
 const count=rank===0?4:Math.min(all.length,[6,8,10,12][Math.min(3,rank-1)]+(level-1)*2),rows=all.slice(0,count);
 const targetIndex=(index+level*2)%rows.length,target=rows[targetIndex];
 // Build clues with real elimination. No clue is decorative; the conjunction has exactly one solution.
 let remaining=rows.map((_,i)=>i);const clues=[];
 const candidates=[];
 if(rank>=3&&level===3)candidates.push({op:'if',dimension:0,value:target[0],thenDimension:1,thenValue:target[1],text:'Si corresponde a «'+target[0]+'», también debe indicar «'+target[1]+'».'});
 for(let d=0;d<dimensions;d++){
  if(level>=2)for(const v of s.attrs[d])if(v!==target[d])candidates.push({dimension:d,op:'not',value:v,text:'No corresponde a «'+v+'».'});
  candidates.push({dimension:d,op:'is',value:target[d],text:'Tiene esta característica: '+target[d]+'.'});
 }
 for(const c of candidates){const next=remaining.filter(i=>c.op==='if'?rows[i][c.dimension]!==c.value||rows[i][c.thenDimension]===c.thenValue:c.op==='is'?rows[i][c.dimension]===c.value:rows[i][c.dimension]!==c.value);if(next.length<remaining.length&&next.length){clues.push(c);remaining=next;}if(remaining.length===1)break;}
 const task={kind:'deduction',candidates:rows.map((attrs,i)=>({id:'c'+i,attrs})),clues,answer:['c'+targetIndex]};
 return {task,scenario:'deduction.'+s.id,q:rank===0?'Lee las pistas y encuentra la tarjeta.':s.goal,stimulus:[...clues.map((c,i)=>T('Pista '+(i+1)+': '+c.text)),{type:'table',rows:[['Tarjeta',...Array.from({length:dimensions},(_,i)=>'Característica '+(i+1))],...rows.map((r,i)=>[String(i+1),...r])]}],sample:'Tarjeta '+(targetIndex+1)+': '+target.join(' · '),why:'Solo esta tarjeta cumple todas las pistas: '+target.join(' · ')+'.',difficulty:{candidates:count,attributes:dimensions,clues:clues.length,negativeClues:level>=2,conditionalClues:rank>=3&&level===3}};
}
const plans={
 young:[
 ['picnic','Preparar la merienda al aire libre','El patio está mojado. La sala cubierta está libre.',['Mirar el tiempo','Preparar la merienda','Comer en el patio','Recoger la mesa','Guardar el material'],'Comer en la sala cubierta',['Comer en el patio','Cancelar aunque la sala está libre'],'La sala cubierta permite merendar sin usar el patio mojado.'],
 ['craft','Terminar una figura para la clase','El pegamento se ha acabado. Hay cinta adhesiva para unir las piezas.',['Reunir las piezas','Comprobar la unión','Unir con pegamento','Revisar la figura','Guardar los sobrantes'],'Unir con cinta adhesiva',['Unir con pegamento','Pintar sin unir las piezas'],'La cinta permite unir las piezas sin el pegamento que falta.'],
 ['sport','Practicar pases con el grupo','La pista está ocupada. La zona señalada del gimnasio está libre para practicar.',['Reunir al grupo','Preparar los turnos','Practicar en la pista','Recoger el material','Cerrar la caja'],'Practicar en el gimnasio',['Practicar en la pista','Esperar sin comprobar otro lugar'],'El gimnasio libre mantiene la práctica y evita entrar en la pista ocupada.'],
 ['plant','Regar las plantas de clase','La regadera tiene una grieta. Hay una jarra pequeña que no pierde agua.',['Mirar la tierra','Preparar el agua','Regar con la regadera','Revisar la tierra','Secar la mesa'],'Regar con la jarra pequeña',['Regar con la regadera','Añadir agua a la mesa'],'La jarra permite regar sin perder el agua por la grieta.']
 ],
 older:[
 ['transport','Llegar al taller antes de las 17:00','El autobús habitual se cancela. El tren llega a las 16:40; la alternativa a pie llega a las 17:10.',['Confirmar el horario','Preparar la acreditación','Tomar el autobús','Llegar al taller','Registrar la entrada'],'Tomar el tren',['Ir a pie','Esperar el autobús cancelado'],'El tren llega antes del límite; a pie llegarías tarde.'],
 ['project','Entregar un trabajo en grupo','La sala de grabación cierra hoy. Se permite entregar audio grabado en casa; el envío vence a las 18:00.',['Revisar el guion','Asignar los turnos','Grabar en la sala','Comprobar el audio','Enviar antes de las 18:00'],'Grabar en casa',['Reservar la sala cerrada','Enviar el guion sin audio'],'Grabar en casa conserva el formato exigido y permite entregar hoy.'],
 ['appointment','Entregar una solicitud con firma','La impresora no funciona. Aceptan firma digital; el mostrador cierra antes de que abra la copistería.',['Revisar la solicitud','Comprobar los datos','Imprimir y firmar','Adjuntar la identificación','Enviar la solicitud'],'Firmar digitalmente',['Esperar a la copistería','Enviar sin firma'],'La firma digital cumple el requisito sin esperar a una tienda que abre tarde.'],
 ['event','Proyectar el vídeo de la muestra','No hay conexión. Se puede usar una copia local; el equipo no admite presentaciones sin vídeo.',['Comprobar el formato','Revisar el sonido','Reproducir desde internet','Presentar al público','Guardar el equipo'],'Reproducir la copia local',['Repetir la conexión sin copia','Cambiar por una presentación sin vídeo'],'La copia local mantiene el vídeo sin depender de la conexión.']
 ]
};
const earlyPlans=[
 ['picnic','Merendar sin mojarnos','El patio está mojado. La sala está libre.',['Preparar comida','Buscar un lugar','Comer en el patio','Recoger la mesa','Guardar la caja'],'Comer en la sala',['Comer en el patio','Ir al patio mojado'],'La sala permite merendar sin mojarnos.'],
 ['craft','Terminar una figura','No queda pegamento. Hay cinta para unir.',['Reunir las piezas','Preparar la mesa','Unir con pegamento','Revisar la figura','Guardar las piezas'],'Unir con cinta',['Unir con pegamento','Dejar las piezas sueltas'],'La cinta une las piezas.'],
 ['sport','Practicar pases','La pista está ocupada. El gimnasio está libre.',['Reunir al grupo','Acordar turnos','Usar la pista','Recoger el material','Guardar la caja'],'Usar el gimnasio',['Usar la pista','Entrar en la pista ocupada'],'El gimnasio está libre para practicar.'],
 ['plant','Regar la planta','La regadera pierde agua. La jarra no pierde.',['Mirar la tierra','Preparar agua','Usar la regadera','Revisar la tierra','Secar la mesa'],'Usar la jarra',['Usar la regadera','Mojar solo la mesa'],'La jarra permite regar sin perder agua.']
];
function change(age,level,index){
 const rank=ages.indexOf(age),s=rank===0?earlyPlans[index]:plans[rank>=3?'older':'young'][index],count=rank===0?level===1?2:3:level===1?3:level===2?4:5;
 // The affected action is always present, even in the short early-primary plan.
 const initial=count===2?[s[3][1],s[3][2]]:count===3?[s[3][0],s[3][2],s[3][4]]:count===4?[s[3][0],s[3][1],s[3][2],s[3][4]]:s[3].slice(0,count),position=initial.indexOf(s[3][2]),updated=initial.map(x=>x===s[3][2]?s[4]:x);
 const task={kind:'change',goal:s[1],initial,change:s[2],options:[s[4],...s[5]],replacement:s[4],replaceIndex:position,steps:updated,answer:updated,ordered:true,dependencies:updated.slice(1).map((_,i)=>[updated[i],updated[i+1]])};
 return {task,scenario:'plan.'+s[0],q:rank===0?'Cambia el paso que no puedes hacer.':'Adapta el plan sin perder el objetivo.',stimulus:rank===0?[L('Plan',initial),T(s[2]),L('Elige un cambio',task.options),T('Mantén el orden. Cambia el paso.')]:[L('Plan inicial',initial),T('Imprevisto: '+s[2]),L('Acciones posibles',task.options),T('Conserva el orden de los pasos que siguen siendo posibles. Sustituye solo la acción afectada por el imprevisto.')],sample:updated.join(' → '),why:s[6]+' Orden: '+updated.join(' → ')+'.',difficulty:{steps:count,changes:1,dependencies:level-1,competingAlternatives:rank>=3}};
}
const informationCases={
 young:[
 ['lesson','Saber si puedes ir al taller al salir de clase',['La clase termina a las 16:00','El taller empieza a las 16:30','El camino tarda 20 minutos'],['El taller dura 45 minutos','El taller abre los lunes','El taller tiene una mesa grande']],
 ['recipe','Saber si tienes ingredientes para preparar la receta',['La receta necesita dos tomates','Tienes un tomate'],['La receta tarda diez minutos','El tomate está en la cocina','La receta se sirve en un plato']],
 ['game','Saber si pueden jugar todas las personas con una ficha cada una',['Participan seis personas','Hay cinco fichas'],['Hay dos rondas','La partida dura quince minutos','Las fichas están en una caja']],
 ['visit','Saber si puedes entrar al taller sin una persona adulta',['La actividad permite entrar sin acompañante desde los diez años','Tienes nueve años'],['El taller dura una hora','La puerta abre por la mañana','La sala tiene ventanas']]
 ,['library','Saber si puedes devolver hoy un libro de la biblioteca',['La biblioteca cierra a las 18:00','Puedes llegar a las 17:40'],['El libro tiene dibujos','La biblioteca tiene varias mesas','El préstamo dura dos semanas']]
 ,['team','Saber si el equipo tiene suficientes petos para jugar',['Juegan ocho personas','Hay siete petos'],['El partido dura veinte minutos','El balón es azul','El campo tiene dos porterías']]
 ,['bus','Saber si puedes subir al autobús con tu tarjeta',['La tarjeta está cargada','El autobús acepta esa tarjeta'],['El autobús tiene treinta plazas','La parada está junto a un árbol','El viaje tiene tres paradas']]
 ,['class','Saber si puedes terminar el experimento antes de la salida',['La salida es a las 12:00','El experimento tarda veinte minutos','Ahora son las 11:30'],['El grupo tiene cuatro personas','La mesa está junto a la ventana','El informe tiene una portada']]
 ],
 older:[
 ['travel','Decidir si llegas al ensayo a las 18:00',['El ensayo empieza a las 18:00','El transporte sale a las 17:20','El trayecto dura 25 minutos'],['El ensayo acaba a las 19:00','Hay veinte plazas','El abono sirve hasta el viernes']],
 ['deadline','Decidir si la entrega estará dentro del plazo',['La entrega cierra el martes a las 18:00','Puedes empezar el martes a las 16:00','La preparación requiere tres horas'],['La revisión del profesor tarda dos días','El archivo ocupa tres páginas','El portal abrió el lunes']],
 ['access','Decidir si puedes asistir sin acompañante',['La actividad requiere tener al menos dieciséis años','Tienes quince años'],['La actividad dura noventa minutos','La inscripción se abre hoy','El edificio tiene tres plantas']],
 ['equipment','Decidir si podrás reproducir un vídeo sin conexión',['El archivo está guardado solo en la nube','La sala no tiene conexión'],['El vídeo dura seis minutos','La pantalla admite ese formato','La sala tiene treinta asientos']],
 ['venue','Comprobar si la sala asignada sirve para el taller',['El taller necesita una sala con proyector','La sala asignada no tiene proyector'],['El edificio tiene cuatro plantas','El taller dura una hora','Hay una cafetería cerca']],
 ['budget','Saber si el grupo puede adquirir todo el material',['El grupo dispone de 24 puntos','El material cuesta 27 puntos'],['La tienda abre a las diez','El material viene en una caja azul','La factura ocupa una página']],
 ['appointment','Decidir si puedes llegar a la cita antes de que cierre el registro',['El registro cierra a las 17:00','El trayecto dura 35 minutos','Puedes salir a las 16:20'],['La sala de espera tiene sillas','La cita es en la planta baja','El edificio se inauguró en mayo']],
 ['permissions','Saber si se puede publicar la fotografía del grupo',['La imagen muestra a varias personas','Aún no se ha confirmado su permiso para publicarla'],['La foto se tomó por la mañana','El archivo mide dos megabytes','La cámara estaba en modo automático']]
 ]
};
function information(age,level,index){const rank=ages.indexOf(age),s=informationCases[rank>=3?'older':'young'][index%informationCases[rank>=3?'older':'young'].length],needed=s[2],distractors=s[3].slice(0,Math.min(3,level+(rank>=2?1:0))),facts=[...needed,...distractors],answer=needed.map((_,i)=>'f'+i),source=rank>=3?(index%2===0?'Mensaje recibido':'Ficha de la actividad'):'Datos disponibles',sourceGroups=rank>=3?[{title:index%2===0?'Aviso del centro':'Mensaje recibido',facts:facts.map((text,i)=>({id:'f'+i,text})).filter((_,i)=>i%2===0)},{title:index%2===0?'Ficha de la actividad':'Información del taller',facts:facts.map((text,i)=>({id:'f'+i,text})).filter((_,i)=>i%2===1)}]:null;return {task:{kind:'information',facts,answer,ordered:false,...(sourceGroups?{sourceGroups}:{})},scenario:'information.'+s[0],q:`Situación: ${s[1][0].toLowerCase()+s[1].slice(1)}. Marca exactamente ${needed.length} datos que necesitas para decidir.`,stimulus:[T(s[1]),L(source,facts)],sample:needed.join('; '),why:'Para este objetivo hay que combinar: '+needed.join('; ')+'. Los demás datos no cambian esa decisión.',difficulty:{necessaryFacts:needed.length,distractors:distractors.length,sources:rank>=3?2:1,scenario:s[0]}};}
const contradictions={
 young:[
 ['notice','Preparar el material del taller','Nota de clase','Hay que llevar un delantal','Lista de entrada','No se necesita delantal','El taller es en la sala 2','La sala 2 está en la planta baja'],
 ['schedule','Llegar a la función a la hora correcta','Cartel','La función empieza a las 17:00','Horario del mismo día','La función empieza a las 17:30','La función es el sábado','Se abre la puerta quince minutos antes'],
 ['map','Encontrar la entrada del huerto','Mensaje','Entra por la puerta norte','Plano de hoy','La puerta norte está cerrada','Hay una fuente junto al huerto','El huerto abre a las nueve'],
 ['recipe','Seguir la receta acordada','Tarjeta de receta','Añade dos vasos de agua','Instrucciones de la misma receta','Añade un vaso de agua','Usa el mismo vaso para medir','Remueve al terminar']
 ],
 older:[
 ['booking','Comprobar el lugar de la cita','Confirmación de reserva','Tu cita es en la sede norte','Calendario de la misma reserva','Tu cita es en la sede sur','La reserva es para el martes','Se solicita llegar diez minutos antes'],
 ['deadline','Confirmar el plazo de entrega','Correo del proyecto','El plazo termina el jueves a las 18:00','Portal de la misma entrega','El plazo termina el viernes a las 18:00','El archivo debe ser PDF','Se permite un archivo por grupo'],
 ['transport','Elegir el andén de salida','Anuncio de la estación','El tren de las 16:20 sale del andén 3','Pantalla del mismo tren','El tren de las 16:20 sale del andén 5','El viaje dura treinta minutos','El destino es la estación central'],
 ['receipt','Comprobar lo que se ha cobrado','Pedido confirmado','Se encargaron tres entradas','Recibo del mismo pedido','Se cobraron cuatro entradas','Todas las entradas tienen el mismo precio','La función es el domingo']
 ]
};
function contradiction(age,level,index){
 const rank=ages.indexOf(age);
 if(rank===0){
  const cases=[['merienda','Preparar la merienda','manzana','zanahoria'],['music','Preparar el ensayo','guitarra','tambor'],['garden','Preparar la caja del jardín','pala','martillo'],['art','Reunir el material de dibujo','lápiz','tijeras']],c=cases[index];
  const facts=['Objeto pedido: '+c[2],'Lugar: mesa de clase','Objeto preparado: '+c[3],'Lugar: mesa de clase',...(level>=2?['Momento: antes de empezar','Momento: antes de empezar']:[]),...(level===3?['Estado: caja abierta','Estado: caja abierta']:[])];
  const extras=level>=2?[{field:'Momento',value:'antes de empezar'}]:[];if(level===3)extras.push({field:'Estado',value:'caja abierta'});
  const rowsA=[{id:'f0',field:'Objeto pedido',value:c[2]},{id:'f1',field:'Lugar',value:'mesa de clase'},...extras.map((x,i)=>({id:'f'+(4+i*2),field:x.field,value:x.value}))];
  const rowsB=[{id:'f2',field:'Objeto preparado',value:c[3]},{id:'f3',field:'Lugar',value:'mesa de clase'},...extras.map((x,i)=>({id:'f'+(5+i*2),field:x.field,value:x.value}))];
  return {task:{kind:'contradiction',facts,sourceDocs:[{title:'Nota del encargo',rows:rowsA},{title:'Material preparado',rows:rowsB}],factIcons:{f0:c[2],f2:c[3]},answer:['f0','f2'],ordered:false},scenario:'contradiction.visual.'+c[0],q:'Compara la nota con el material preparado. Marca el dato que no coincide en cada cuadro.',stimulus:[T('Objetivo: '+c[1]),L('Nota del encargo',[c[2]]),{type:'list',label:'Imagen entregada',presentation:'cards',items:[c[3]]},L('Datos',facts)],sample:facts[0]+' ↔ '+facts[2],why:'La nota pide '+c[2]+', pero se ha preparado '+c[3]+'. Compara el mismo dato en los dos cuadros.',difficulty:{facts:facts.length,sources:2,conflictingFacts:2,visualComparison:true}};
 }
 const s=contradictions[rank>=3?'older':'young'][index],extraLabels={notice:['Lugar','Sala'],schedule:['Día','Apertura'],map:['Referencia cercana','Horario'],recipe:['Medida','Paso final'],booking:['Día','Antelación'],deadline:['Formato','Archivos'],transport:['Duración','Destino'],receipt:['Precio','Fecha']},common=[s[6],...(level>=2?[s[7]]:[]),...(level===3?['Referencia del caso: confirmada; no constan cambios posteriores.','Acceso al edificio: puerta principal.']:[])],fields=extraLabels[s[0]]||['Información adicional','Condición'];
 const facts=[s[3],...common,s[5],...common],split=common.length+1,field={notice:'Material',schedule:'Hora',map:'Entrada',recipe:'Cantidad de agua',booking:'Sede',deadline:'Plazo',transport:'Andén',receipt:'Cantidad'}[s[0]]||'Dato principal';
 const rowsA=[{id:'f0',field,value:s[3]},...common.map((value,i)=>({id:'f'+(i+1),field:level===3&&i>=2?i===2?'Versión del aviso':'Acceso al edificio':fields[i],value}))];
 const rowsB=[{id:'f'+split,field,value:s[5]},...common.map((value,i)=>({id:'f'+(split+i+1),field:level===3&&i>=2?i===2?'Versión del aviso':'Acceso al edificio':fields[i],value}))];
 const titles=level===3?[s[2]+' · cartel de avisos',s[4]+' · folleto informativo']:[s[2],s[4]];
 return {task:{kind:'contradiction',facts,sourceDocs:[{title:titles[0],rows:rowsA},{title:titles[1],rows:rowsB}],answer:['f0','f'+split],ordered:false},scenario:'contradiction.'+s[0],q:level===3?'Revisa los dos materiales del mismo caso. Localiza el dato que aparece distinto y marca los dos valores.':'Compara los dos cuadros. Busca el mismo dato en ambas fuentes y marca los valores que no coinciden.',stimulus:[L('Fuentes del mismo caso',facts)],sample:s[3]+' ↔ '+s[5],why:'Las dos fuentes se refieren al mismo caso, pero indican '+s[3]+' y '+s[5]+'. Los demás datos coinciden; no sabemos cuál está actualizado y hay que confirmarlo.',difficulty:{facts:facts.length,sources:2,conflictingFacts:2,distributedAcrossDocuments:level===3}};
}
const ruleSets=[
 {id:'animals',yes:['gato','perro','conejo'],no:['linterna','tijeras','regalo'],rule:'Pulsa al ver un animal. Si es un objeto, no pulses.'},
 {id:'tools',yes:['martillo','pala','llave inglesa'],no:['guitarra','tambor','piano'],rule:'Pulsa al ver una herramienta de reparación o jardín. Si es un instrumento musical, no pulses.'},
 {id:'travel',yes:['brújula','mapa','maleta'],no:['zanahoria','manzana','pan'],rule:'Pulsa al ver un objeto para orientarte o viajar. Si es un alimento, no pulses.'},
 {id:'music',yes:['guitarra','tambor','piano'],no:['tijeras','pala','linterna'],rule:'Pulsa al ver un instrumento musical. Con los demás objetos, no pulses.'},
 {id:'technology',yes:['cámara','teléfono','auriculares'],no:['agenda','recibo','maleta'],rule:'Pulsa al ver un dispositivo electrónico. Con el papel o el equipaje, espera.'},
 {id:'measurement',yes:['calculadora','brújula','regla'],no:['guitarra','tijeras','regalo'],rule:'Pulsa al ver algo que sirve para medir o para orientarte. Con los otros objetos, espera.'}
];
function rules(age,level,index){const rank=ages.indexOf(age),s=ruleSets[index],length=rank===0?4+level*2:6+level*2,switches=level===1?[]:level===2?[Math.floor(length/2)]:[Math.floor(length/3),Math.floor(length*2/3)];let inverted=false,seed=(rank+1)*103+level*29+index*61;const order=Array.from({length},(_,i)=>i);for(let k=length-1;k>0;k--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(k+1);[order[k],order[j]]=[order[j],order[k]];}const trials=Array.from({length},(_,i)=>{if(switches.includes(i))inverted=!inverted;const target=order[i]%2===0,symbol=(target?s.yes:s.no)[Math.floor(order[i]/2)%3];return {symbol,target,inverted,switchBefore:switches.includes(i)};});const answer=trials.map(t=>t.target!==t.inverted?'act':'wait'),initialRule=rank===0&&index<4?['Pulsa con los animales. Con los objetos, espera.','Pulsa con martillo, pala o llave inglesa. Con los instrumentos musicales, espera.','Pulsa con brújula, mapa o maleta. Con los alimentos, espera.','Pulsa con guitarra, tambor o piano. Con los otros objetos, espera.'][index]:s.rule;return {task:{kind:'rules',initialRule,trials,answer,ordered:true,trialMs:rank===0?3600:2800,gapMs:650,switchMs:2100},scenario:'rules.'+s.id,q:level===1?(rank===0?'Mira los ejemplos y sigue la regla.':'Adivina la regla: decide qué estímulos van con cada respuesta.'):'Recuerda la regla. Cuando veas ↔, inviértela para las siguientes tarjetas.',stimulus:[T(rank===0&&index<4?['Pulsa con los animales. Con los objetos, espera.','Pulsa con martillo, pala o llave inglesa. Con los instrumentos musicales, espera.','Pulsa con brújula, mapa o maleta. Con los alimentos, espera.','Pulsa con guitarra, tambor o piano. Con los otros objetos, espera.'][index]:s.rule),...(level>1?[T('↔ significa: invierte la regla que recuerdas. No indica qué debes responder a la siguiente tarjeta.')]:[])],sample:'Actividad temporal: no se adapta a papel.',why:level===1?'Comprueba la categoría antes de responder.':'Tras cada ↔, la regla había cambiado: lo que antes pedía pulsar pedía esperar, y al revés.',difficulty:{trials:length,switches:switches.length,dimensions:1}};}
const builders={rules,words,deduction,change,information,contradiction},cache=new Map();
function pool(age,domain,level=1,family=null){
 if(!ages.includes(age)||![1,2,3].includes(level)||!['executive','language','middleLanguage','teenLanguage','attention','literacy','reading','middleReading'].includes(domain))return [];
 const allowed=domain==='executive'?Object.keys(definitions).filter(kind=>!['words','contradiction'].includes(kind)):domain.includes('Language')||domain==='language'?['words']:domain==='attention'?['contradiction']:['contradiction'];
 if(family&&!allowed.includes(family))return [];
 const key=[age,domain,level,family||'all'].join(':');if(cache.has(key))return structuredClone(cache.get(key));const out=[];
 for(const kind of family?[family]:allowed)for(let i=0;i<(kind==='rules'?6:kind==='information'?8:4);i++){
  const d=definitions[kind],b=builders[kind](age,level,i),id=['cognitive-v1',age,domain,level,kind,i].join(':');
  out.push({id,contentKey:id,type:'cognitiveTask',mechanic:'cognitive_'+kind,domain,level,q:b.q,topic:d.title,stimulus:b.stimulus,sample:b.sample,why:b.why,cognitiveTask:b.task,primaryConstruct:d.primaryConstruct,secondaryLoads:d.secondaryLoads,functionalPurpose:d.functionalPurpose,semanticFamily:'cognitive.'+kind,scenarioFamily:b.scenario,qualityDescriptor:{semanticFamily:'cognitive.'+kind,scenarioFamily:b.scenario},readingDemand:age==='early'?'low':kind==='rules'?'minimal':'medium',visualDemand:kind==='deduction'?'medium':'low',motorDemand:kind==='rules'?'timedSelection':'selection',printable:d.printable,ageRoute:age,difficultyProfile:{level,...b.difficulty},responseType:'cognitive'});
 }
 cache.set(key,out);return structuredClone(out);
}
function validate(item,age=item?.ageRoute){const parts=String(item?.contentKey||'').split(':'),canonical=pool(age,item?.domain,item?.level,parts[4]).find(x=>x.contentKey===item.contentKey);if(!canonical)throw Error('Familia o edad no registrada.');const locale=root.LocaleContent||(typeof require==='function'&&require('./locale-content')),expected=item.localization?locale.localizeItem(canonical,item.localization.locale,item.domain):canonical;for(const field of Object.keys(canonical))if(JSON.stringify(item[field])!==JSON.stringify(expected[field]))throw Error('La actividad o su respuesta han cambiado: '+field);return true;}
function grade(item,response){validate(item);const t=item.cognitiveTask;if(!Array.isArray(response)||response.some(x=>typeof x!=='string'))return false;if(t.kind==='words')return response.length===1&&wordFits(response[0],t);const answer=t.answer;if(new Set(response).size!==response.length&&!t.ordered)return false;return JSON.stringify(t.ordered?response:[...response].sort())===JSON.stringify(t.ordered?answer:[...answer].sort());}
function productionStatus(item,word){validate(item);const w=norm(word);return !Object.values(lexicon).flat().some(x=>norm(x)===w)?'unreviewed':wordFits(word,item.cognitiveTask)?'correct':'incorrect';}
function printable(item,age){validate(item,age);if(item.printable==='interactive-only')throw Error('Esta actividad requiere presentación temporal en pantalla.');return {question:item.q,stimulus:item.stimulus,options:[],tokens:[],writingRubric:[],responseType:'written'};}
const api={pool,validate,grade,printable,productionStatus,definitions,lexicon,wordFits};root.CognitiveFamilies=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

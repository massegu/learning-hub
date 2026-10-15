/* Authored 8–10 pool. Shared by the Edge interactive and worksheet factories.
 * No network, locale substitutions, random IDs or client fallback in this module.
 * Contexts and evidence are authored together; numbers are bounded variations.
 */
(function(root){
  'use strict';
  const contexts=[
    {id:'garden',title:'El jardín de la clase',things:['las semillas','la tierra','el agua','las macetas','las etiquetas','la pala'],plural:'semillas',noun:'semilla',place:'el jardín',verb:'plantar',plan:['Elegir las semillas','Llenar la maceta con tierra','Plantar las semillas','Regar la maceta'],pair:['semilla','planta'],extra:'Revisar la humedad de la tierra'},
    {id:'art',title:'El mural del grupo',things:['el papel','los colores','la regla','el pegamento','las tijeras','los pinceles'],plural:'dibujos',noun:'dibujo',place:'el aula de arte',verb:'dibujar',plan:['Elegir el tema','Hacer el boceto','Colorear el dibujo','Pegar el dibujo en el mural'],pair:['pincel','pintar'],extra:'Proteger la mesa con papel'},
    {id:'library',title:'La biblioteca de clase',things:['los libros','las etiquetas','el lápiz','el cuaderno','la caja','la lista'],plural:'libros',noun:'libro',place:'la biblioteca',verb:'leer',plan:['Elegir un libro','Leer la historia','Escribir el título','Devolver el libro al estante'],pair:['libro','leer'],extra:'Buscar el título en la lista'},
    {id:'sport',title:'El circuito del patio',things:['los conos','la pelota','la cuerda','el agua','la gorra','el silbato'],plural:'conos',noun:'cono',place:'el patio',verb:'jugar',plan:['Colocar los conos','Explicar el recorrido','Hacer el recorrido','Guardar los conos'],pair:['pelota','jugar'],extra:'Comprobar que el suelo está seco'},
    {id:'music',title:'La canción del grupo',things:['el tambor','las campanas','la letra','el lápiz','la carpeta','el triángulo'],plural:'campanas',noun:'campana',place:'el aula de música',verb:'cantar',plan:['Leer la letra','Practicar la canción','Cantar en grupo','Guardar los instrumentos'],pair:['tambor','tocar'],extra:'Escuchar el ritmo antes de empezar'},
    {id:'nature',title:'Las pistas del parque',things:['la lupa','el mapa','el cuaderno','el lápiz','el agua','la mochila'],plural:'hojas',noun:'hoja',place:'el parque',verb:'observar',plan:['Elegir un árbol','Observar sus hojas','Dibujar una hoja','Compartir el dibujo'],pair:['lupa','observar'],extra:'Comprobar la ruta en el mapa'},
  ];
  contexts.forEach((c,i)=>{c.singular=['la semilla','el dibujo','el libro','el cono','la campana','la hoja'][i];c.collective=['las semillas','los dibujos','los libros','los conos','las campanas','las hojas'][i];c.destination=['al jardín','al aula de arte','a la biblioteca','al patio','al aula de música','al parque'][i];});
  // Each story has its own event, evidence and bounded inference. Later levels
  // add relevant evidence/constraints, not just names or longer filler text.
  const stories=[
    {short:'Ana planta semillas en una maceta. Leo escribe las etiquetas.',more:'La maceta junto a la ventana recibe luz. La que está en el estante queda a la sombra.',end:'El grupo quiere comparar cómo crecen las plantas con la misma cantidad de agua. Solo cambiará la luz.',literal:['¿Quién escribe las etiquetas?','Leo','Ana','El grupo'],infer:['¿Qué maceta recibe más luz?','La de la ventana','La del estante','Las dos reciben la misma luz'],reason:['¿Qué deben mantener igual para comparar el efecto de la luz?','La cantidad de agua','La posición de las macetas','La cantidad de luz','Nada'],main:'Comparar el crecimiento de unas plantas',wrongMain:['Preparar una canción','Buscar un libro','Organizar un partido']},
    {short:'Mara dibuja un pez para el mural. Sol colorea el fondo azul.',more:'El pegamento está húmedo. El grupo deja el mural sobre la mesa para que se seque.',end:'La puerta es estrecha. Al secarse, llevarán el mural entre dos personas para que no se doble.',literal:['¿Qué dibuja Mara?','Un pez','Una flor','Un árbol'],infer:['¿Por qué esperan antes de mover el mural?','Para que se seque el pegamento','Para cambiar el fondo','Para buscar un pez'],reason:['¿Qué plan cuida el mural durante el traslado?','Esperar a que se seque y llevarlo entre dos','Llevarlo húmedo entre dos','Esperar y doblarlo por la mitad','Arrastrarlo por el suelo'],main:'Preparar y cuidar un mural',wrongMain:['Regar unas plantas','Ensayar una canción','Buscar una pelota']},
    {short:'Hugo toma un libro de animales. Nora anota el título en la lista.',more:'Al devolverlo, Hugo ve una etiqueta verde en el lomo. El estante de animales tiene la misma etiqueta.',end:'El estante de cuentos también tiene una etiqueta verde, pero lleva un dibujo de una torre. El de animales lleva una huella.',literal:['¿Qué toma Hugo?','Un libro de animales','Un libro de cuentos','Un mapa'],infer:['¿Qué pista ayuda a devolver el libro?','La etiqueta del lomo','El nombre de Hugo','La hora'],reason:['¿Qué dos pistas identifican el estante correcto?','El color verde y la huella','Solo el color verde','La torre y el color verde','El tamaño de Hugo'],main:'Devolver un libro a su lugar',wrongMain:['Pintar un mural','Preparar una carrera','Plantar un árbol']},
    {short:'Iris coloca conos en el patio. Dani lleva una pelota para el circuito.',more:'Llueve antes de empezar. El suelo del patio queda mojado y el grupo espera bajo techo.',end:'Hay una sala libre con suelo seco, pero es pequeña. Pueden hacer allí un recorrido corto y caminar en vez de correr.',literal:['¿Qué lleva Dani?','Una pelota','Una cuerda','Un libro'],infer:['¿Por qué esperan bajo techo?','Porque está lloviendo','Porque perdieron los conos','Porque no hay pelota'],reason:['¿Qué cambio permite practicar con seguridad?','Acortar el recorrido y caminar en la sala','Correr por el patio mojado','Usar toda la sala sin espacio libre','Salir sin mirar el suelo'],main:'Adaptar un circuito para hacerlo con seguridad',wrongMain:['Buscar un cuento','Preparar un mural','Cuidar una maceta']},
    {short:'Luna canta una canción. Teo marca el ritmo con el tambor.',more:'El tambor suena muy fuerte y el grupo no oye la letra. Teo prueba a tocar más suave.',end:'La canción empieza despacio y termina más rápido. El grupo decide practicar cada parte antes de unirlas.',literal:['¿Quién toca el tambor?','Teo','Luna','Todo el grupo'],infer:['¿Para qué toca Teo más suave?','Para que se oiga la letra','Para terminar antes','Para cambiar la canción'],reason:['¿Qué ensayo ayuda a seguir los dos ritmos?','Practicar cada parte y después unirlas','Cantar solo el final','Tocar siempre más fuerte','Cambiar todas las palabras'],main:'Ensayar una canción en grupo',wrongMain:['Hacer un circuito','Devolver un libro','Plantar semillas']},
    {short:'Eva observa una hoja con la lupa. Omar la dibuja en su cuaderno.',more:'Encuentran dos hojas del mismo árbol. Una está en el suelo y la otra sigue en una rama.',end:'Quieren comparar los bordes sin dañar el árbol. Pueden observar la hoja de la rama y dibujarla sin arrancarla.',literal:['¿Qué usa Eva para observar?','Una lupa','Una regla','Una pelota'],infer:['¿Dónde está una de las hojas?','En una rama','En una maceta','En una caja'],reason:['¿Cómo pueden comparar las hojas y cuidar el árbol?','Observar y dibujar sin arrancar la hoja','Arrancar todas las hojas','Comparar solo los cuadernos','Cambiar el árbol de lugar'],main:'Observar y comparar hojas sin dañar el árbol',wrongMain:['Cantar una canción','Ordenar una biblioteca','Construir un circuito']},
  ];
  const spelling=[
    [['semilla','se-mi-lla'],['tierra','tie-rra'],['riego','rie-go']],
    [['dibujo','di-bu-jo'],['pincel','pin-cel'],['pegamento','pe-ga-men-to']],
    [['libro','li-bro'],['cuento','cuen-to'],['biblioteca','bi-blio-te-ca']],
    [['pelota','pe-lo-ta'],['cuerda','cuer-da'],['recorrido','re-co-rri-do']],
    [['tambor','tam-bor'],['canción','can-ción'],['triángulo','trián-gu-lo']],
    [['hoja','ho-ja'],['árbol','ár-bol'],['observación','ob-ser-va-ción']],
  ];
  const days=['lunes','martes','miércoles','jueves','viernes','sábado'];
  const names=['Ana','Leo','Mara','Sol','Hugo'];
  const text=value=>({type:'text',text:value});
  const list=items=>({type:'list',items});
  const table=rows=>({type:'table',rows,header:true});
  function choice(q,a,wrong,stimulus,why,level){
    const opts=[String(a),...wrong.map(String)].slice(0,level===3?4:3);
    return {type:'standard',q,opts,a:String(a),stimulus,requiresStimulus:true,why};
  }
  const numbers=(q,value,stimulus,why,level)=>choice(q,value,[value+1,Math.max(0,value-1),value+2],stimulus,why,level);
  function finish(it,domain,level,c,family,variant=0,focus){
    return {...it,domain,level,languageFocus:focus,topic:c.title,
      contentKey:`junior-v1:${domain}:${level}:${c.id}:${family}:${variant}`,
      mechanic:family,juniorProfile:{version:1,route:'junior',context:c.id,family,level}};
  }
  function language(c,i,level,focus,m){
    const noun=c.noun,plural=c.plural,singular=c.singular,collective=c.collective,pronoun=collective.split(' ')[0];
    if(focus==='grammar'){
      if(m===0){
        const sentence=level===1?`${singular[0].toUpperCase()+singular.slice(1)} está en la caja.`:level===2?`${collective[0].toUpperCase()+collective.slice(1)} están en la caja.`:`Ayer guardamos ${collective}; hoy ${pronoun} buscamos.`;
        return choice(level===1?'¿Qué palabra indica que hay un solo objeto?':level===2?'¿Qué palabra indica que hay varias?':`¿A qué se refiere «${pronoun}» al final?`,level===3?`A ${collective}`:level===1?singular.split(' ')[0]:collective.split(' ')[0],level===3?['Ayer','Hoy','A la caja']:['En','Caja','Está'],[text(sentence)],'La respuesta se encuentra en la frase.',level);
      }
      if(m===1){
        const stem=level===1?`${singular[0].toUpperCase()+singular.slice(1)} ___ en la caja.`:level===2?`${collective[0].toUpperCase()+collective.slice(1)} ___ en la caja.`:`Ayer el grupo ___ ${collective} y hoy ${pronoun} usa.`;
        return choice('Elige la forma que completa la frase.',level===1?'está':level===2?'están':'guardó',level===1?['están','estamos','estar']:level===2?['está','estamos','estar']:['guardará','guardan','guardar'],[text(stem)],level===3?'«Ayer» indica una acción pasada.':'El verbo debe concordar con una o varias cosas.',level);
      }
      const connectors=level===1?['y','pero','porque']:level===2?['porque','pero','y']:['aunque','porque','y','cuando'];
      const sentence=level===1?`Usamos ${collective} ___ después ${pronoun} guardamos.`:level===2?`Guardamos ${collective} ___ terminó la actividad.`:`___ queda poco tiempo, guardamos ${collective} con cuidado.`;
      return choice(level===1?'Elige la palabra que añade otra acción.':level===2?'Elige la palabra que presenta la razón.':'Elige la palabra que indica que actuamos a pesar de la dificultad.',connectors[0],connectors.slice(1),[text(sentence)],level===1?'«Y» une las dos acciones.':level===2?'«Porque» presenta la razón.':'«Aunque» une la dificultad con la acción que se realiza.',level);
    }
    if(focus==='spelling'){
      const [word,syllables]=spelling[i][level-1];
      if(m===0){
        const index=level===1?0:level===2?Math.floor(word.length/2):word.length-1,letter=word[index];
        return choice('Mira la palabra modelo. ¿Qué letra falta en la copia?',letter,['a','e','r','s','o','b'].filter(x=>x!==letter),[text(`Modelo: ${word}`),text(`Copia: ${word.slice(0,index)}_${word.slice(index+1)}`)],`La letra «${letter}» reconstruye «${word}».`,level);
      }
      if(m===1){
        const correct=syllables,segments=syllables.split('-');
        return choice('Elige cómo se separa la palabra en sílabas.',correct,[segments.slice().reverse().join('-'),[word.slice(0,1),word.slice(1)].join('-'),word], [text(word)],`Las sílabas son: ${syllables}.`,level);
      }
      // Explicit model keeps copying evidence separate from distractor spelling.
      const sentence=level===1?`${singular[0].toUpperCase()+singular.slice(1)} está aquí.`:level===2?`Guardamos ${collective}.`:`¿Dónde están ${collective}?`;
      return choice('Elige la copia con las mismas mayúsculas y signos.',sentence,[sentence.toLowerCase(),sentence.replace(/[.¿?]/g,''),sentence.toUpperCase()],[text(`Modelo: ${sentence}`)],'La copia conserva las mayúsculas y los signos del modelo.',level);
    }
    const steps=c.plan.slice(0,level+1);
    if(m===0)return {type:'order',q:'Ordena las acciones como indica el plan.',tokens:steps.slice().reverse(),answer:steps,stimulus:[list(steps.map((s,j)=>`${j+1}. ${s}`))],requiresStimulus:true,why:'El orden sigue los pasos del plan.'};
    if(m===1){
      const sentence=level===1?`El grupo empieza a ${c.verb}.`:level===2?`El grupo empieza a ${c.verb} en ${c.place}.`:`Antes de ${c.verb}, el grupo prepara los materiales en ${c.place}.`;
      const parts=level===1?['El grupo',`empieza a ${c.verb}.`]:level===2?['El grupo',`empieza a ${c.verb}`,`en ${c.place}.`]:[`Antes de ${c.verb},`,'el grupo prepara','los materiales',`en ${c.place}.`];
      return {type:'order',q:'Ordena los fragmentos para copiar la frase.',tokens:parts.slice().reverse(),answer:parts,stimulus:[text(sentence)],requiresStimulus:true,why:'La frase mantiene el mismo sentido y los mismos signos que el modelo.'};
    }
    return choice(level===1?'¿Qué título corresponde al plan?':level===2?'¿Qué frase resume el plan?':'¿Qué detalle del plan permite saber qué va primero?',level===1?c.title:level===2?`Preparar, ${c.verb} y recoger`:'El orden de las acciones',level===1?contexts.filter(x=>x.id!==c.id).map(x=>x.title):level===2?['Empezar sin materiales','Recoger sin hacer la actividad','Cambiar de actividad']:['El color del título','El nombre de otra clase','Una frase sin relación'],[list(steps)],'El texto debe ayudar a comprender la actividad y su orden.',level);
  }
  const seconds=[['¿Qué hace Leo?','Escribe las etiquetas','Planta las semillas','Riega la maceta'],['¿Qué colorea Sol?','El fondo','El pez','Una flor'],['¿Quién anota el título?','Nora','Hugo','Leo'],['¿Quién coloca los conos?','Iris','Dani','Nora'],['¿Qué hace Luna?','Canta','Toca el tambor','Dibuja'],['¿Qué hace Omar?','Dibuja la hoja','Usa la lupa','Canta']];
  const firsts=[['¿Qué hace Ana?','Planta semillas','Escribe etiquetas','Guarda libros'],['¿Qué hace Mara?','Dibuja un pez','Colorea el fondo','Riega una planta'],['¿Qué tipo de libro toma Hugo?','De animales','De recetas','De plantas'],['¿Dónde coloca Iris los conos?','En el patio','En la biblioteca','En el aula'],['¿Qué instrumento usa Teo?','El tambor','La guitarra','La flauta'],['¿Qué observa Eva?','Una hoja','Una flor','Una piedra']];
  const details2=[['¿Qué maceta queda a la sombra?','La del estante','La de la ventana','Las dos'],['¿Dónde dejan el mural para que se seque?','Sobre la mesa','Junto al árbol','En el estante'],['¿De qué color es la etiqueta del libro?','Verde','Azul','Roja'],['¿Cómo queda el suelo del patio?','Mojado','Seco','Cubierto de hojas'],['¿Qué no oye el grupo?','La letra','El tambor','El silbato'],['¿De dónde son las dos hojas?','Del mismo árbol','De árboles distintos','De una maceta']];
  const details3=[['¿Qué condición cambiará el grupo?','La luz','La cantidad de agua','El árbol','El nombre de la planta'],['¿Cómo llevarán el mural cuando se seque?','Entre dos personas','Arrastrándolo','Doblado','Bajo la lluvia'],['¿Qué dibujo tiene el estante de cuentos?','Una torre','Una huella','Una hoja','Un cono'],['¿Qué lugar está libre y tiene suelo seco?','La sala','El patio','El jardín','El parque'],['¿Cómo empieza la canción?','Despacio','Más rápido','Sin letra','Sin tambor'],['¿Qué hoja pueden observar sin arrancarla?','La de la rama','La del cuaderno','Una hoja de papel','La de la caja']];
  const inferences3=[['Si crece más la planta de la ventana, ¿qué podría influir?','La diferencia de luz','El nombre de Leo','El color de las etiquetas','La hora de escribir'],['¿Qué riesgo evitan al llevar el mural entre dos?','Que se doble','Que llueva','Que cambie el color','Que se seque'],['¿Por qué no basta con mirar el color verde?','Porque dos estantes tienen ese color','Porque no hay etiquetas','Porque el libro no tiene título','Porque todos los libros son iguales'],['¿Por qué proponen caminar en la sala?','Porque hay menos espacio','Porque el suelo está mojado','Porque faltan conos','Porque no hay pelota'],['¿Por qué practican las partes por separado?','Porque tienen ritmos diferentes','Porque no hay letra','Porque falta el tambor','Porque no quieren cantar juntos'],['¿Para qué dibujan la hoja sin arrancarla?','Para compararla sin dañar el árbol','Para cambiar el árbol de lugar','Para evitar usar el cuaderno','Para borrar todas las hojas']];
  function reading(c,i,level,m){
    const openings=[
      'La clase prepara un pequeño jardín. Han reunido tierra, semillas y varias macetas sobre una mesa. Antes de empezar, reparten el trabajo para que cada persona pueda ayudar a preparar el jardín.',
      'La clase quiere decorar una pared con un mural del mar. Sobre la mesa hay papel grande, colores y pegamento. Cada persona elige una tarea y deja espacio para el trabajo de las demás.',
      'Hoy el grupo visita la biblioteca de clase. Los libros están ordenados por temas para encontrarlos con facilidad. Antes de llevarse uno, cada persona debe apuntarlo en una lista junto a la puerta.',
      'El grupo prepara un circuito para jugar en el patio. Quieren que todas las personas puedan participar sin empujarse. Antes de salir, reúnen los materiales y deciden quién llevará cada cosa.',
      'El grupo ensaya una canción para compartirla con otra clase. Han colocado las sillas en círculo y preparado los instrumentos. Primero escuchan la melodía y después prueban a cantar juntos.',
      'La clase sale al parque para conocer los árboles. El grupo lleva un cuaderno, lápices y una lupa. Se detienen junto a un árbol y miran con cuidado las formas de sus hojas.',
    ];
    const s=stories[i],simpleMain=['Plantar semillas y poner etiquetas','Dibujar y colorear un mural','Elegir y anotar un libro','Preparar un circuito','Cantar con un tambor','Observar y dibujar una hoja'][i],passage=openings[i]+'\n\n'+s.short+(level>=2?' '+s.more:'')+(level===3?' '+s.end:'');
    const data=m===0?(level===1?s.literal:level===2?details2[i]:details3[i]):m===1?(level===1?seconds[i]:level===2?s.infer:inferences3[i]):m===2?(level===3?s.reason:firsts[i]):[level===3?'¿Qué título recoge lo más importante?':'¿De qué trata la historia?',level===3?s.main:simpleMain,...s.wrongMain];
    return choice(data[0],data[1],data.slice(2),[text(passage)],level===3&&m===2?'La opción usa las condiciones que da la historia.':'La respuesta se apoya en lo que cuenta la historia.',level);
  }
  function maths(c,i,level,m){
    const a=level===1?12+i*2:level===2?38+i*3:106+i*7,b=level===1?3+i:level===2?17+i:29+i*2;
    if(m===0)return numbers(`¿${c.collective.startsWith('los ')?'Cuántos':'Cuántas'} ${c.plural} hay al final?`,level===3?a+b-12:a+b,[text(`Hay ${a} ${c.plural}. El grupo añade ${b} más.`+(level===3?' Después aparta 12 para otra clase.':''))],level===3?`${a} + ${b} − 12 = ${a+b-12}.`:`${a} + ${b} = ${a+b}.`,level);
    if(m===1)return numbers(`¿${c.collective.startsWith('los ')?'Cuántos':'Cuántas'} ${c.plural} quedan?`,level===3?a-b+15:a-b,[text(`Hay ${a} ${c.plural}. Se usan ${b}.`+(level===3?' Después llegan 15 más.':''))],level===3?`${a} − ${b} + 15 = ${a-b+15}.`:`${a} − ${b} = ${a-b}.`,level);
    const groups=level+2,each=level===1?2+i:level===2?4+i:7+i,total=groups*each;
    if(m===2)return numbers(`¿${c.collective.startsWith('los ')?'Cuántos':'Cuántas'} ${c.plural} hay en total?`,level===3?total+each:total,[text(`Hay ${groups} cajas con ${each} ${c.plural} en cada caja.`+(level===3?` Añaden otra caja con ${each} ${c.plural}.`:''))],level===3?`${groups+1} × ${each} = ${total+each}.`:`${groups} × ${each} = ${total}.`,level);
    return numbers('¿Cuántas unidades recibe cada equipo?',each,[text(`Se reparten ${total} ${c.plural} entre ${groups} equipos por igual.`)],`${total} ÷ ${groups} = ${each}.`,level);
  }
  function attention(c,i,level,m){
    if(m===0){
      const code=`${c.id.slice(0,2).toUpperCase()}-${14+i}${level===1?'':level===2?'-B':'-B2-C7'}`;
      return choice('¿Qué código coincide con el modelo?',code,[code.replace('-',''),code.replace('1','7'),code+'0'],[text(`Modelo de la caja: ${code}`)],'Compara todas las letras, cifras y separadores.',level);
    }
    if(m===1){
      const target=c.things[0],xs=Array.from({length:level*3+3},(_,j)=>j%2===0?target:c.things[1+j%3]),n=xs.filter(x=>x===target).length;
      return numbers(`¿Cuántas veces aparece «${target}»?`,n,[list(xs)],`Aparece ${n} veces.`,level);
    }
    if(m===2){
      const rows=[['Caja','Etiqueta','Estado','Cantidad'],['A','azul','lista',String(4+i)],['B','verde','lista',String(5+i)],['C','azul','pendiente',String(6+i)],['D','azul','lista',String(7+i)]];
      const q=level===1?'¿Qué caja tiene etiqueta verde?':level===2?'¿Qué caja azul está pendiente?':`¿Qué caja azul está lista y tiene ${7+i} cosas?`,a=level===1?'B':level===2?'C':'D';
      return choice(q,a,['A','B','C','D'].filter(x=>x!==a),[table(rows)],'La fila elegida cumple todas las pistas de la pregunta.',level);
    }
    const xs=c.things.slice(0,level+3),position=level===1?2:level===2?xs.length-2:xs.length-3;
    return choice(level===1?'¿Qué aparece en tercer lugar?':level===2?'¿Qué aparece justo antes del último?':'Desde el último, retrocede dos lugares. ¿Qué encuentras?',xs[position],xs.filter(x=>x!==xs[position]),[list(xs.map((x,j)=>`${j+1}. ${x}`))],'Sigue el orden de la lista.',level);
  }
  function memory(c,i,level,m){
    const xs=c.things.slice(0,level+2),content=m===2?xs.map((detail,j)=>({person:names[j],detail})):xs.map(detail=>({detail}));
    if(level===3){
      const positions=[[0,3],[1,4],[2,4],[1,3]][m],pair=positions.map(j=>xs[j]).join(' → ');
      const wrong=[[positions[1],positions[0]],[positions[0],(positions[1]+1)%xs.length],[(positions[0]+1)%xs.length,positions[1]]].map(indices=>indices.map(j=>xs[j]).join(' → '));
      return {type:'memoryReveal',q:m===2?'Recuerda qué tiene cada persona. Después se ocultarán las tarjetas.':'Recuerda los objetos y su orden. Después se ocultarán las tarjetas.',memoryContent:content,memoryQuestion:m===2?`¿Qué tenían ${names[positions[0]]} y ${names[positions[1]]}, en ese orden?`:`¿Qué objetos estaban en los lugares ${positions[0]+1} y ${positions[1]+1}, en ese orden?`,revealMs:10500,opts:[pair,...wrong],a:pair,requiresStimulus:true,why:'Recupera las dos relaciones y conserva el orden pedido.'};
    }
    const target=m===0?xs[level]:m===1?xs[1]:m===2?xs[level]:xs.at(-1);
    const question=m===0?'¿Qué objeto estaba en la lista?':m===1?'¿Qué aparecía en segundo lugar?':m===2?`¿Qué tenía ${names[level]}?`:'¿Qué aparecía al final?';
    const wrong=m===0?['el paraguas','el reloj','la bicicleta']:xs.filter(x=>x!==target);
    return {type:'memoryReveal',q:'Mira y recuerda. Después se ocultará la información.',memoryContent:content,memoryQuestion:question,revealMs:7500+(level-1)*1500,opts:[target,...wrong].slice(0,level===3?4:3),a:target,requiresStimulus:true,why:'La respuesta conserva el objeto y su posición o persona en la lista mostrada.'};
  }
  function executive(c,i,level,m){
    const steps=c.plan.slice(0,level+1);
    if(m===0)return {type:'order',q:'Ordena los pasos siguiendo el plan.',tokens:steps.slice().reverse(),answer:steps,stimulus:[list(steps.map((x,j)=>`${j+1}. ${x}`))],requiresStimulus:true,why:'Cada paso sigue al anterior en el plan.'};
    if(m===1){
      const preparations=[['Elegir las semillas','Preparar la tierra'],['Elegir el tema','Preparar los colores'],['Elegir el libro','Buscar un lugar para leer'],['Colocar los conos','Explicar el recorrido'],['Leer la letra','Elegir los instrumentos'],['Elegir el árbol','Preparar la lupa']][i];
      const required=level===1?preparations.slice(0,1):level===2?preparations:[...preparations,c.extra];
      return choice('¿Qué debes completar antes de empezar?',required.join(' y '),[steps.at(-1),'Cambiar el color del título','Guardar todo sin empezar'],[text(`Antes de ${c.verb}, el plan exige: ${required.join('; ')}.`)],'La opción reúne todos los requisitos del plan.',level);
    }
    if(m===2){
      const rule=level===1?'Guarda solo las tarjetas azules.':level===2?'Guarda solo las tarjetas azules que dicen «listo».':'La regla cambió: guarda solo las tarjetas verdes que dicen «listo» y tienen una estrella.';
      const labels=level===1?['azul','verde','rojo']:level===2?['azul, listo','azul, pendiente','verde, listo']:['verde, listo, estrella','azul, listo, estrella','verde, listo, círculo','verde, pendiente, estrella'];
      return choice('¿Qué tarjeta cumple la regla actual?',labels[0],labels.slice(1),[text(c.title),text(rule)],'Comprueba la regla actual y todas sus condiciones.',level);
    }
    return choice('¿Qué plan cumple el plazo?',level===1?'Hacer primero la tarea de hoy':level===2?'Hacer la tarea de hoy y después la de mañana':'Terminar hoy la tarea breve y preparar los materiales para mañana',level===1?['Hacer solo la tarea de mañana','No empezar ninguna']:level===2?['Hacer solo la tarea de mañana','Hacer primero una actividad sin fecha']:['Hacer solo la actividad sin fecha','Dejar ambas para mañana','Preparar materiales y olvidar la tarea de hoy'],[text(`${c.title}: hay una tarea para hoy y otra para mañana.`+(level===3?' La de hoy es breve; la de mañana necesita preparar materiales.':''))],'El plan atiende el plazo de hoy y, en los niveles posteriores, también prepara lo siguiente.',level);
  }
  function reasoning(c,i,level,m){
    if(m===0){const start=2+i,step=level===1?2:level===2?3+i:0,xs=level===3?[start,start*2,start*4,start*8]:[start,start+step,start+2*step,start+3*step],a=level===3?start*16:xs.at(-1)+step;return numbers('La misma regla se repite. ¿Qué número sigue?',a,[text(xs.join(' · ')+' · __')],level===3?'Cada número es el doble del anterior.':`Se suman ${step} cada vez.`,level);}
    if(m===1){
      const pairs=[['semilla','planta','huevo','pollito'],['pincel','pintar','lápiz','dibujar'],['libro','leer','canción','cantar'],['pelota','jugar','tambor','tocar'],['tambor','música','lápiz','dibujo'],['lupa','ampliar','linterna','iluminar']];
      const [a,b,x,y]=pairs[i];
      return choice('¿Qué palabra completa la relación?',y,level===1?['mesa','nube']:level===2?['descansar',b]:[b,'escuchar','guardar'].filter(z=>z!==y),[text(level===1?`${a} → ${b}; ${x} → __`:level===2?`${a} se relaciona con ${b}; ${x} se relaciona con __`:`${a} → ${b}; ${x} → __`)],'Las dos parejas mantienen la misma relación.',level);
    }
    if(m===2){
      const rows=[['Tarjeta','Forma','Color','Tamaño'],['A','círculo','azul','grande'],['B','cuadrado','azul','pequeño'],['C','círculo','verde','pequeño'],['D','círculo','azul','pequeño']];
      return choice(level===1?'¿Qué tarjeta tiene un cuadrado?':level===2?'¿Qué círculo es verde?':'¿Qué círculo azul es pequeño?',level===1?'B':level===2?'C':'D',['A','B','C','D'].filter(x=>x!==(level===1?'B':level===2?'C':'D')),[text(`Clasifica las tarjetas para ${c.title.toLowerCase()}.`),table(rows)],'Reúne las condiciones de forma, color y tamaño que pide la pregunta.',level);
    }
    const a=level===1?'En la caja':level===2?'En la mesa':'En el estante';
    return choice(`¿Dónde están ${c.collective}?`,a,['En la caja','En el estante','En la mesa','No se puede saber'].filter(x=>x!==a),[text(level===1?`${c.collective[0].toUpperCase()+c.collective.slice(1)} están en la caja.`:level===2?`${c.collective[0].toUpperCase()+c.collective.slice(1)} están en la caja o en la mesa. La caja está vacía.`:`${c.collective[0].toUpperCase()+c.collective.slice(1)} están en la caja, en el estante o en la mesa. La caja está vacía. En la mesa solo está el cuaderno.`)],'Descarta los lugares que contradicen las pistas.',level);
  }
  function applied(c,i,level,m){
    if(m===0){const minutes=level===1?10+i:level===2?20+i:25+i,end=minutes+(level===1?0:level===2?7:12);return numbers('¿Cuántos minutos necesitas en total?',end,[text(`La actividad en ${c.place} dura ${minutes} minutos.`+(level===2?' Preparar los materiales lleva 7 minutos.':level===3?' Preparar los materiales lleva 7 minutos y recogerlos lleva 5.':''))],level===3?`${minutes} + 7 + 5 = ${end}.`:level===2?`${minutes} + 7 = ${end}.`:'El texto da la duración de la actividad.',level);}
    if(m===1){const balance=level===1?12+i:level===2?25+i:40+i,price=4+i,extra=level===3?6:0;return numbers('¿Cuántos puntos te quedan?',balance-price-extra,[text(`En el juego «${c.title}» tienes ${balance} puntos. Una pista cuesta ${price} puntos.`+(level===3?' Usas además una ayuda de 6 puntos.':''))],`${balance} − ${price}${extra?' − 6':''} = ${balance-price-extra}. Son puntos del juego, no dinero.`,level);}
    if(m===2){const day=days[i],rows=[['Día','Lugar','Preparación'],[day,c.place,c.things[0]],[days[(i+1)%6],'el aula',c.things[1]],[days[(i+2)%6],'el patio',c.things[2]]];return choice(level===1?`¿Dónde es la actividad del ${day}?`:level===2?`¿Qué preparas para ir ${c.destination}?`:`Si el ${day} cambias de lugar, ¿qué dato de ese día debes actualizar?`,level===1?c.place:level===2?c.things[0]:'El lugar',level===1?['el aula','el patio'].filter(x=>x!==c.place).concat('la piscina'):level===2?c.things.slice(1):['El día siguiente','Toda la semana','El nombre del grupo'],[table(rows)],'Busca el día y conserva la relación entre actividad, lugar y preparación.',level);}
    const rule=level===1?'Cada persona usa el material y después lo devuelve.':level===2?'Solo hay un material. Cada persona lo usa durante un turno y lo pasa a la siguiente.':'Solo hay un material. Cada persona tiene un turno. Si alguien termina antes, lo pasa a la siguiente sin quitarle el turno a nadie.';
    return choice('¿Qué acción respeta el acuerdo del grupo?',level===1?'Usarlo y devolverlo':level===2?'Esperar mi turno y pasarlo después':'Pasarlo al terminar y respetar el orden',level===1?['Guardarlo solo para mí','Dejarlo en otro lugar']:level===2?['Usarlo durante todos los turnos','Quitarlo sin esperar']:['Quitárselo a otra persona','Cambiar el orden sin avisar','Guardarlo aunque terminé'],[text(c.title),text(rule)],'La acción respeta las condiciones del acuerdo.',level);
  }
  const counts={language:9,reading:4,division:4,attention:4,memory:4,executive:4,speedReasoning:4,applied:4};
  const mechanics={reading:['literal','evidence','constraints','main_idea'],division:['addition','subtraction','groups','sharing'],attention:['exact_match','target_count','table_rules','position'],memory:['recognition','position','association','last'],executive:['sequence','requirements','current_rule','deadline'],speedReasoning:['series','analogy','classification','deduction'],applied:['duration','game_budget','schedule','agreement']};
  function pool(domain,level,subdomain){
    if(!Object.hasOwn(counts,domain)||![1,2,3].includes(level))throw new Error('Área o nivel junior no válido.');
    if(domain==='language'&&subdomain&&!['grammar','spelling','writing'].includes(subdomain))throw new Error('Habilidad de Lenguaje no válida.');
    const out=[];
    contexts.forEach((c,i)=>{
      for(let m=0;m<counts[domain];m++){
        const focus=domain==='language'?['grammar','spelling','writing'][Math.floor(m/3)]:undefined;
        if(subdomain&&focus!==subdomain&&domain==='language')continue;
        const family=domain==='language'?`${focus}_${m%3}`:mechanics[domain][m];
        const fn={language,reading,division:maths,attention,memory,executive,speedReasoning:reasoning,applied}[domain];
        const item=domain==='language'?fn(c,i,level,focus,m%3):fn(c,i,level,m);
        out.push(finish(item,domain,level,c,family,0,focus));
      }
    });
    return out;
  }
  const cache=new Map();
  function generate(domain,level,subdomain,random=Math.random){
    const key=[domain,level,subdomain||''].join(':'),items=cache.get(key)||pool(domain,level,subdomain);
    cache.set(key,items);return structuredClone(items[Math.floor(random()*items.length)]);
  }
  const api={contexts,pool,generate};root.JuniorContent=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);

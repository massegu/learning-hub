(function(){
  const D=window.LEARNING_DATA=window.LEARNING_DATA||{};
  const opt=(id,level,q,opts,a,extra={})=>({id,level,q,opts,a,...extra});

  const middleLanguage=[];
  const grammar=[
    ['¿Qué palabra es un pronombre en «Ella llegó antes»?',['Ella','llegó','antes','ninguna'],'Ella','Pronombres'],
    ['¿Qué palabra es un adverbio en «Corrió bastante rápido»?',['Corrió','bastante','rápido','ninguna'],'bastante','Adverbios'],
    ['¿Cuál es el sujeto de «Mis primos prepararon la merienda»?',['Mis primos','prepararon','la merienda','merienda'],'Mis primos','Sujeto y predicado'],
    ['¿Cuál es el núcleo del predicado en «La clase terminó temprano»?',['clase','terminó','temprano','la'],'terminó','Sujeto y predicado'],
    ['¿Qué opción contiene una palabra compuesta?',['sacapuntas','cuaderno','mesa','árbol'],'sacapuntas','Formación de palabras'],
    ['¿Qué palabra es un determinante?',['aquella','corrió','felizmente','azul'],'aquella','Determinantes'],
    ['¿Qué palabra es una preposición?',['durante','ayer','rápido','aunque'],'durante','Preposiciones'],
    ['¿Qué palabra es una conjunción?',['aunque','mesa','fuerte','ayer'],'aunque','Conjunciones'],
    ['¿Qué oración está en pretérito perfecto compuesto?',['He terminado la tarea','Terminé la tarea','Terminaré la tarea','Terminaba la tarea'],'He terminado la tarea','Verbos'],
    ['¿Qué oración tiene concordancia correcta?',['Las alumnas estaban preparadas','Las alumnas estaba preparado','La alumnas estaban preparada','Las alumna estaban preparados'],'Las alumnas estaban preparadas','Concordancia']
  ];
  grammar.forEach((x,i)=>middleLanguage.push(opt(`m-lang-g-${i}`,1,x[0],x[1],x[2],{topic:x[3]})));
  const spelling=[
    ['Completa: o__servar',['b','v'],'b','B/V'],['Completa: ad__ertir',['b','v'],'v','B/V'],['Completa: en__iar',['m','n'],'n','M/N'],['Completa: co__prender',['m','n'],'m','M/N'],['Completa: __abía mucha gente.',['h','sin h'],'h','H'],['Completa: __echo los deberes.',['He','E'],'He','H'],['Completa: prote__er',['g','j'],'g','G/J'],['Completa: mensa__e',['g','j'],'j','G/J'],['Completa: desa__uno',['y','ll'],'y','Y/LL'],['Completa: arro__o de agua',['y','ll'],'y','Y/LL'],['¿Qué palabra lleva tilde?',['difícil','dificil','dificíl','ninguna'],'difícil','Tildes'],['¿Qué palabra está bien escrita?',['también','tambien','tambièn','tambiém'],'también','Tildes'],['¿Qué opción usa bien la mayúscula?',['El lunes viajamos a Toledo.','el lunes viajamos a Toledo.','El Lunes viajamos a toledo.','el Lunes viajamos a Toledo.'],'El lunes viajamos a Toledo.','Mayúsculas'],['¿Qué opción puntúa mejor una enumeración?',['Compré pan, fruta, leche y arroz.','Compré pan fruta leche y arroz.','Compré, pan fruta, leche y arroz.','Compré pan; fruta leche y arroz.'],'Compré pan, fruta, leche y arroz.','Puntuación'],['¿Qué palabra está bien escrita?',['alrededor','al rededor','halrededor','alrrededor'],'alrededor','Ortografía']
  ];
  spelling.forEach((x,i)=>middleLanguage.push(opt(`m-lang-o-${i}`,i<10?1:2,x[0],x[1],x[2],{topic:x[3]})));
  const vocab=[
    ['¿Qué significa «preciso» en «Necesito un dato preciso»?',['exacto','rápido','grande','bonito'],'exacto','Vocabulario'],
    ['¿Cuál es un sinónimo de «evitar»?',['impedir','buscar','repetir','aceptar'],'impedir','Vocabulario'],
    ['¿Cuál es un antónimo de «escaso»?',['abundante','pequeño','difícil','lejano'],'abundante','Vocabulario'],
    ['¿Qué conector expresa consecuencia?',['por tanto','aunque','mientras','sin embargo'],'por tanto','Conectores'],
    ['¿Qué conector expresa contraste?',['sin embargo','por eso','además','porque'],'sin embargo','Conectores'],
    ['¿Qué conector introduce un ejemplo?',['por ejemplo','por tanto','aunque','después'],'por ejemplo','Conectores'],
    ['¿Cuál es la idea más objetiva?',['La película dura 95 minutos.','La película es genial.','La película es aburrida.','La película es demasiado larga.'],'La película dura 95 minutos.','Hechos y opiniones'],
    ['¿Cuál es una opinión?',['La novela tiene 200 páginas.','La novela fue publicada en 2024.','La novela me parece emocionante.','La novela tiene diez capítulos.'],'La novela me parece emocionante.','Hechos y opiniones'],
    ['¿Qué frase es más precisa que «Todo salió fatal»?',['Hubo dos problemas concretos.','Todo fue un desastre absoluto.','Nada funciona nunca.','Fue lo peor posible.'],'Hubo dos problemas concretos.','Precisión'],
    ['¿Qué frase evita una generalización?',['Hoy me ha costado esta tarea.','Siempre se me da mal todo.','Nunca entiendo nada.','Todo me sale mal.'],'Hoy me ha costado esta tarea.','Precisión']
  ];
  vocab.forEach((x,i)=>middleLanguage.push(opt(`m-lang-v-${i}`,2,x[0],x[1],x[2],{topic:x[3]})));
  const writingPrompts=[
    ['Reescribe «Pásame eso ya» de forma educada.','¿Podrías pasármelo cuando puedas, por favor?'],
    ['Escribe una frase que incluya «sin embargo» correctamente.','Ejemplo: Quería salir; sin embargo, empezó a llover.'],
    ['Corrige y mejora: «ayer fuimos al cine estuvo bien».','Ayer fuimos al cine. Estuvo bien.'],
    ['Explica en dos frases una ventaja y una desventaja de usar el móvil para estudiar.','Incluye una ventaja concreta y una limitación concreta.'],
    ['Resume en una frase: «El equipo entrenó menos tiempo, pero organizó mejor las jugadas y ganó el partido».','Aunque entrenó menos tiempo, el equipo se organizó mejor y ganó.'],
    ['Escribe una petición clara para pedir más tiempo en una tarea.','Incluye qué necesitas y por qué.'],
    ['Convierte «Nunca me escuchas» en una frase más concreta.','Ejemplo: En esta conversación siento que no me estás escuchando.'],
    ['Escribe una respuesta respetuosa a alguien que opina distinto sobre un videojuego.','Reconoce su opinión y expresa la tuya sin atacar.'],
    ['Redacta tres instrucciones ordenadas para preparar una mochila.','Usa conectores de orden: primero, después, por último.'],
    ['Escribe una conclusión breve que incluya una duda o limitación.','Ejemplo: Parece una buena opción, aunque necesitaríamos más información.'],
    ['Transforma una acusación en una observación: «Siempre llegas tarde».','Ejemplo: Hoy has llegado 15 minutos tarde.'],
    ['Escribe un mensaje para cancelar un plan con educación.','Sé claro, breve y respetuoso.'],
    ['Describe un problema escolar sin culpar a ninguna persona.','Describe hechos observables y qué necesitas.'],
    ['Escribe una frase en estilo directo y conviértela a estilo indirecto.','Ejemplo: Ana dijo: «Voy mañana». / Ana dijo que iría al día siguiente.'],
    ['Resume una discusión distinguiendo hechos de interpretaciones.','Separa lo que ocurrió de lo que cada persona pensó que significaba.']
  ];
  writingPrompts.forEach((x,i)=>middleLanguage.push({id:`m-lang-w-${i}`,level:i<5?2:3,q:x[0],type:'self',sample:x[1],topic:'Escritura'}));
  while(middleLanguage.length<60){
    const i=middleLanguage.length;
    middleLanguage.push({id:`m-lang-extra-${i}`,level:3,q:`Escribe una frase clara y correcta que use un conector de contraste y una palabra con h. Variante ${i-44}.`,type:'self',sample:'Ejemplo: Había terminado; sin embargo, hoy he revisado el trabajo otra vez.',topic:'Escritura'});
  }

  const middleMath=[];
  for(let i=0;i<60;i++){
    const level=i<20?1:i<40?2:3;
    if(i%5===0){const a=120+(i*7),p=[10,15,20,25,30][i%5];middleMath.push(opt(`m-math-${i}`,level,`Calcula el ${p}% de ${a}.`,[String(a*p/100),String(a*p/100+5),String(a*p/100-5),String(a-p)],String(a*p/100),{topic:'Porcentajes'}));}
    else if(i%5===1){const x=3+(i%12),m=2+(i%5),b=4+(i%8);middleMath.push(opt(`m-math-${i}`,level,`Resuelve: ${m}x + ${b} = ${m*x+b}.`,[String(x),String(x+1),String(Math.max(0,x-1)),String(x+2)],String(x),{topic:'Ecuaciones'}));}
    else if(i%5===2){const n=6+(i%15),d=[2,3,4,5][i%4];const num=n*d;middleMath.push(opt(`m-math-${i}`,level,`Simplifica la fracción ${num}/${d}.`,[String(n),String(n+1),`${n}/${d}`,String(num-d)],String(n),{topic:'Fracciones'}));}
    else if(i%5===3){const u=3+(i%6),price=4+(i%8),total=u*price;middleMath.push(opt(`m-math-${i}`,level,`Si ${u} cuadernos cuestan ${total} €, ¿cuánto cuestan 5 cuadernos al mismo precio?`,[`${5*price} €`,`${total+5} €`,`${price} €`,`${u*5} €`],`${5*price} €`,{topic:'Proporcionalidad'}));}
    else {const base=8+(i%10),height=5+(i%7),area=base*height;middleMath.push(opt(`m-math-${i}`,level,`Un rectángulo mide ${base} cm por ${height} cm. ¿Cuál es su área?`,[`${area} cm²`,`${2*(base+height)} cm²`,`${area+base} cm²`,`${base+height} cm²`],`${area} cm²`,{topic:'Geometría'}));}
  }

  const passages=[
    ['El torneo online','Un grupo de amigos organizó un pequeño torneo online. Al principio discutían porque cada uno proponía reglas distintas. Decidieron escribir las normas antes de empezar y elegir a una persona que anotara los resultados. El torneo duró menos de lo esperado, pero hubo menos discusiones y todos supieron qué ocurría cuando había empate.'],
    ['El experimento del sueño','En clase analizaron cómo cambia la atención cuando se duerme poco. No hicieron un experimento privando a nadie de sueño; compararon diarios voluntarios de descanso con resultados de tareas breves de atención. La profesora insistió en que una relación entre dos datos no demuestra por sí sola que uno cause el otro.'],
    ['La ruta en bici','Nora quería ir al instituto en bicicleta. Probó dos rutas: una era más corta pero tenía cruces con mucho tráfico; la otra tardaba siete minutos más y recorría un carril bici casi todo el camino. Después de probar ambas con un adulto, eligió la segunda porque valoró más la seguridad que ahorrar unos minutos.'],
    ['El vídeo viral','Un vídeo de veinte segundos se hizo viral porque parecía mostrar a un profesor enfadado con un alumno. Más tarde se publicó la grabación completa y se vio que el fragmento empezaba después de varios minutos de interrupciones. El vídeo corto no era falso, pero omitía información relevante para interpretar la escena.'],
    ['La presentación','Leo preparó una presentación con muchas animaciones. Cuando ensayó, descubrió que tardaba más en cambiar efectos que en explicar las ideas. Eliminó casi todas las transiciones y dejó solo dos gráficos que ayudaban a entender los datos. Su exposición resultó más clara.'],
    ['La compra del móvil','Sara comparó dos móviles. Uno tenía una cámara algo mejor, pero costaba bastante más. El otro recibía actualizaciones durante más años y tenía una batería mayor. En vez de elegir por una sola característica, hizo una lista de qué funciones utilizaba realmente cada día.'],
    ['El entrenamiento','Un jugador practicaba lanzamientos durante mucho tiempo, pero casi siempre desde el mismo punto. Su entrenador le propuso sesiones más cortas con situaciones variadas. Al principio acertó menos, pero semanas después respondía mejor durante los partidos porque había practicado decisiones diferentes.'],
    ['La encuesta','Una clase preguntó a 25 alumnos cuál era su red social favorita y anunció que había descubierto “la red favorita de los adolescentes”. El profesor les pidió revisar esa conclusión: su muestra era pequeña y pertenecía a un único centro. Los datos eran reales, pero la generalización era demasiado amplia.'],
    ['El trabajo en grupo','Cuatro estudiantes repartieron un proyecto en partes iguales. Una parte resultó mucho más difícil y quien la tenía se retrasó. En la siguiente reunión redistribuyeron tareas según el tiempo disponible y las habilidades de cada persona. El reparto dejó de ser idéntico, pero el trabajo avanzó mejor.'],
    ['La contraseña','Mario usaba la misma contraseña en varias cuentas porque así era fácil recordarla. Después de recibir un aviso de acceso extraño, activó la verificación en dos pasos y empezó a usar contraseñas diferentes. Le llevó más tiempo organizarlas, pero redujo el riesgo de que un problema afectara a todas sus cuentas.']
  ];
  const qs=[
    ['¿Cuál es la idea principal del texto?','Idea principal'],['¿Qué decisión o cambio tomó el protagonista o grupo?','Información explícita'],['¿Qué problema intentaban resolver?','Causa y problema'],['¿Qué consecuencia tuvo la decisión?','Consecuencias'],['¿Qué conclusión prudente se puede extraer?','Inferencia'],['¿Qué dato del texto apoya mejor esa conclusión?','Evidencia']
  ];
  const middleReading=[];let rid=0;
  passages.forEach((p,pi)=>qs.forEach((q,qi)=>middleReading.push({id:`m-read-${rid++}`,level:qi<2?1:qi<4?2:3,title:p[0],text:p[1],q:q[0],type:'self',sample:`Responde usando información del texto. Foco: ${q[1]}.`,topic:q[1]})));
  middleReading.splice(60);

  D.middle={label:'12-13 años',subjects:['middleLanguage','middleMath','middleReading'],middleLanguage,middleMath,middleReading};
})();

(function(){
  const D = window.LEARNING_DATA = window.LEARNING_DATA || {};
  const opts = (id,level,q,choices,a,extra={}) => ({id,level,q,opts:choices,a,...extra});

  // GEOMETRIA: 60 ejercicios unicos
  const geometry=[];
  const shapes=[
    ['triangulo',3,3,'△'],['cuadrado',4,4,'□'],['rectangulo',4,4,'▭'],['pentagono',5,5,'⬠'],
    ['hexagono',6,6,'⬡'],['heptagono',7,7,'7 lados'],['octogono',8,8,'🛑'],['decagono',10,10,'10 lados']
  ];
  shapes.forEach((s,i)=>{
    geometry.push(opts(`g-sides-${i}`,1,`¿Cuantos lados tiene un ${s[0]}?`,[String(s[1]),String(s[1]+1),String(Math.max(3,s[1]-1)),String(s[1]+2)],String(s[1]),{visual:s[3]}));
    geometry.push(opts(`g-vertices-${i}`,1,`¿Cuantos vertices tiene un ${s[0]}?`,[String(s[2]),String(s[2]+1),String(Math.max(3,s[2]-1)),String(s[2]+2)],String(s[2]),{visual:s[3]}));
  });
  [25,35,45,55,65,75,85,90,95,105,120,135,150,165,180].forEach((deg,i)=>{
    const a=deg<90?'Agudo':deg===90?'Recto':deg<180?'Obtuso':'Llano';
    geometry.push(opts(`g-angle-${deg}`,i<8?1:2,`¿Como se clasifica un angulo de ${deg}°?`,['Agudo','Recto','Obtuso','Llano'],a,{angle:deg}));
  });
  const objects=[
    ['una moneda','Circulo','Círculo'],['una ventana rectangular','Rectangulo','Rectángulo'],['una señal de STOP','Octogono','Octógono'],
    ['una porcion clasica de pizza','Triangulo','Triángulo'],['un dado visto de frente','Cuadrado','Cuadrado'],['una pantalla de television','Rectangulo','Rectángulo'],
    ['un reloj de pared redondo','Circulo','Círculo'],['una baldosa cuadrada','Cuadrado','Cuadrado']
  ];
  objects.forEach((o,i)=>geometry.push(opts(`g-object-${i}`,1,`¿Que figura se parece mas a ${o[0]}?`,[o[2],'Triángulo','Rectángulo','Círculo'].filter((x,j,a)=>a.indexOf(x)===j).concat(['Pentágono']).slice(0,4),o[2])));
  [20,30,35,40,50,60,70,75,80,85].forEach((deg,i)=>geometry.push(opts(`g-comp-${deg}`,3,`Si un angulo mide ${deg}°, ¿cuanto mide su complementario?`,[`${90-deg}°`,`${180-deg}°`,`${deg}°`,`${100-deg}°`],`${90-deg}°`,{angle:deg})));
  [100,110,120,125,130,135,140,145,150,160,170].forEach((deg,i)=>geometry.push(opts(`g-supp-${deg}`,3,`Si un angulo mide ${deg}°, ¿cuanto falta para formar un angulo llano?`,[`${180-deg}°`,`${90-(deg%90)}°`,`${deg-90}°`,`${180-(deg-10)}°`],`${180-deg}°`,{angle:deg})));
  const properties=[
    ['¿Que figura tiene cuatro lados iguales y cuatro angulos rectos?',['Cuadrado','Rombo','Trapecio','Rectángulo'],'Cuadrado'],
    ['¿Que cuadrilatero tiene dos pares de lados paralelos y cuatro angulos rectos?',['Rectángulo','Trapecio','Triángulo','Pentágono'],'Rectángulo'],
    ['¿Que figura tiene cuatro lados iguales pero no necesita tener cuatro angulos rectos?',['Rombo','Rectángulo','Trapecio','Triángulo'],'Rombo'],
    ['¿Cuantos pares de lados paralelos tiene un rectangulo?',['2','1','3','0'],'2'],
    ['¿Cual de estas afirmaciones sobre un cuadrado es correcta?',['Tambien es un rectángulo','Nunca es un rectángulo','Solo tiene un eje de simetría','No tiene lados paralelos'],'Tambien es un rectángulo'],
    ['¿Cuantos grados suman los angulos interiores de un triangulo?',['180°','90°','270°','360°'],'180°']
  ];
  properties.forEach((p,i)=>geometry.push(opts(`g-prop-${i}`,i<3?2:3,p[0],p[1],p[2])));
  geometry.splice(60); // banco objetivo: 60

  // LENGUA: 60 por modo = 180
  const grammar=[];
  const words={
    Sustantivo:['mochila','amistad','Madrid','jugador','pantalla','equipo','biblioteca','tormenta'],
    Verbo:['corremos','saltaron','piensa','leeremos','escribio','juegan','aprende','viajaron'],
    Adjetivo:['rapido','azul','valiente','enorme','silencioso','amable','dificil','curioso'],
    Adverbio:['ayer','rapidamente','cerca','siempre','quizas','bien','despacio','mañana']
  };
  Object.entries(words).forEach(([cat,arr])=>arr.forEach((w,i)=>grammar.push(opts(`l-gr-cat-${cat}-${i}`,1,`¿Que categoria gramatical es «${w}»?`,['Sustantivo','Verbo','Adjetivo','Adverbio'],cat,{topic:'Categorías gramaticales'}))));
  const compounds=[['sacapuntas',true],['paraguas',true],['abrelatas',true],['lavavajillas',true],['baloncesto',true],['medianoche',true],['sol',false],['mesa',false],['camino',false],['libro',false]];
  compounds.forEach((x,i)=>grammar.push(opts(`l-gr-comp-${i}`,1,`«${x[0]}» es una palabra...`,['Simple','Compuesta'],x[1]?'Compuesta':'Simple',{topic:'Palabras simples y compuestas'})));
  const gender=[['las jugadoras','Femenino plural'],['el profesor','Masculino singular'],['los arboles','Masculino plural'],['una gata','Femenino singular'],['los amigos','Masculino plural'],['la cantante','Femenino singular'],['unas alumnas','Femenino plural'],['un vecino','Masculino singular']];
  gender.forEach((x,i)=>grammar.push(opts(`l-gr-gen-${i}`,1,`¿Cual es el genero y numero de «${x[0]}»?`,['Masculino singular','Masculino plural','Femenino singular','Femenino plural'],x[1],{topic:'Género y número'})));
  const advanced=[
    ['En «Mis amigos llegaron ayer», ¿que categoria es «ayer»?','Adverbio'],['En «La bicicleta roja es nueva», ¿que categoria es «roja»?','Adjetivo'],
    ['En «Nosotros iremos mañana», ¿que categoria es «nosotros»?','Pronombre'],['En «La mochila pesa», ¿que categoria es «la»?','Determinante'],
    ['En «Voy con Ana», ¿que categoria es «con»?','Preposición'],['En «Leo y escribo», ¿que categoria es «y»?','Conjunción'],
    ['¿Cual es el sujeto de «Los jugadores celebraron el gol»?','Los jugadores'],['¿Cual es el verbo de «Mi hermana prepara la merienda»?','prepara'],
    ['¿Cual es el nucleo del sujeto en «Las nuevas bicicletas llegaron»?','bicicletas'],['¿Cual es el predicado en «El perro duerme en su cama»?','duerme en su cama']
  ];
  advanced.forEach((x,i)=>grammar.push(opts(`l-gr-adv-${i}`,i<6?2:3,x[0], i<6?['Sustantivo','Verbo','Adjetivo','Adverbio','Pronombre','Determinante','Preposición','Conjunción'].filter(v=>[x[1],'Sustantivo','Verbo','Adjetivo'].includes(v)).slice(0,4):[x[1],'El perro','La cama','Ninguno'].filter((v,j,a)=>a.indexOf(v)===j),x[1],{topic:'Análisis de la oración'})));
  while(grammar.length<60){const i=grammar.length; const n=i%8; grammar.push(opts(`l-gr-extra-${i}`,3,`¿Cual es la opcion correctamente concordada?`,[`Esas casas altas`,`Esos casa alta`,`Esa casas altos`,`Esos casas alta`],'Esas casas altas',{topic:'Concordancia'}));}

  const spelling=[];
  const bv=[['__icicleta','b','v','bicicleta'],['__entana','v','b','ventana'],['__iblioteca','b','v','biblioteca'],['__iaje','v','b','viaje'],['__arco','b','v','barco'],['__ecino','v','b','vecino'],['__olcan','v','b','volcan'],['__ufanda','b','v','bufanda'],['__erano','v','b','verano'],['__uscar','b','v','buscar'],['__ebida','b','v','bebida'],['__ivir','v','b','vivir']];
  bv.forEach((x,i)=>spelling.push(opts(`l-sp-bv-${i}`,1,`Completa: ${x[0]}`, [x[1],x[2]],x[1],{topic:'B / V',why:`La palabra correcta es «${x[3]}».`})));
  const mn=[['ca__po','m','n','campo'],['tie__po','m','n','tiempo'],['ta__bien','m','n','tambien'],['e__pezar','m','n','empezar'],['i__posible','m','n','imposible'],['e__budo','m','n','embudo'],['co__prar','m','n','comprar'],['i__vento','n','m','invento'],['e__viar','n','m','enviar'],['co__vivir','n','m','convivir']];
  mn.forEach((x,i)=>spelling.push(opts(`l-sp-mn-${i}`,1,`¿M o N? Completa: ${x[0]}`,[x[1].toUpperCase(),x[2].toUpperCase()],x[1].toUpperCase(),{topic:'M / N',why:`Se escribe «${x[3]}». Antes de p y b suele escribirse m.`})));
  const hwords=[['__uevo','huevo','uevo'],['__ielo','hielo','ielo'],['__ora','hora','ora'],['__acer','hacer','acer'],['__ablar','hablar','ablar'],['__ospital','hospital','ospital'],['__umano','humano','umano'],['__ola','hola','ola'],['__echo','hecho','echo'],['__allar','hallar','allar'],['__asta','hasta','asta'],['__ermano','hermano','ermano']];
  hwords.forEach((x,i)=>spelling.push(opts(`l-sp-h-${i}`,1,`Elige la forma correcta para completar ${x[0]}:`,[x[1],x[2]],x[1],{topic:'H / sin H'})));
  const gj=[['via__e','j','g','viaje'],['prote__er','g','j','proteger'],['relo__','j','g','reloj'],['diri__ir','g','j','dirigir'],['mensa__e','j','g','mensaje'],['esco__er','g','j','escoger'],['te__ido','j','g','tejido'],['ur__ente','g','j','urgente']];
  gj.forEach((x,i)=>spelling.push(opts(`l-sp-gj-${i}`,2,`¿G o J? Completa: ${x[0]}`,[x[1].toUpperCase(),x[2].toUpperCase()],x[1].toUpperCase(),{topic:'G / J'})));
  const ly=[['__ave','ll','y','llave'],['__ema','y','ll','yema'],['caba__o','ll','y','caballo'],['pla__a','y','ll','playa'],['arro__o','y','ll','arroyo'],['brúju__a','l','ll','brújula']];
  ly.forEach((x,i)=>spelling.push(opts(`l-sp-ly-${i}`,2,`Completa correctamente: ${x[0]}`,[x[1],x[2]],x[1],{topic:'LL / Y'})));
  const accents=[['camion','camión'],['lapiz','lápiz'],['arbol','árbol'],['facil','fácil'],['cancion','canción'],['tambien','también'],['telefono','teléfono'],['matematicas','matemáticas']];
  accents.forEach((x,i)=>spelling.push(opts(`l-sp-accent-${i}`,2,`¿Cual esta escrita correctamente: «${x[0]}» o «${x[1]}»?`,[x[0],x[1]],x[1],{topic:'Tildes'})));
  const punct=[
    ['¿como te llamas?','¿Cómo te llamas?'],['mi amigo pedro vive en madrid','Mi amigo Pedro vive en Madrid.'],['que sorpresa','¡Qué sorpresa!'],['mañana iremos al cine','Mañana iremos al cine.']
  ];
  punct.forEach((x,i)=>spelling.push(opts(`l-sp-punct-${i}`,3,`Elige la version mejor escrita de: «${x[0]}»`,[x[0],x[1]],x[1],{topic:'Mayúsculas y puntuación'})));
  const extraSpell=[['alrededor','halrededor','al rededor','alrrededor'],['excepción','escepción','exepción','exceción'],['deshacer','desacer','des-hacer','dezacer'],['subrayar','subrallar','supray ar','subrallar']]; while(spelling.length<60){const i=spelling.length,x=extraSpell[(i-56)%extraSpell.length]; spelling.push(opts(`l-sp-extra-${i}`,3,`¿Que palabra esta escrita correctamente en este grupo ${i-55}?`,x,x[0],{topic:'Repaso ortográfico'}));}

  const writing=[];
  const corrections=[
    ['ayer fuimos al parque','Ayer fuimos al parque.'],['mi hermana y yo juega al tenis','Mi hermana y yo jugamos al tenis.'],['los perro corre rapido','Los perros corren rápido.'],
    ['mañana ire a madrid','Mañana iré a Madrid.'],['hola como estas','Hola, ¿cómo estás?'],['el equipo ganaron el partido','El equipo ganó el partido.'],
    ['las casa son grande','Las casas son grandes.'],['yo e hecho los deberes','Yo he hecho los deberes.'],['bamos a la biblioteca','Vamos a la biblioteca.'],
    ['mi amigo tubo una idea','Mi amigo tuvo una idea.'],['a ver si mañana vienes','A ver si mañana vienes.'],['haber si lo encuentro','A ver si lo encuentro.'],
    ['no se porque se fue','No sé por qué se fue.'],['tu tambien puedes venir','Tú también puedes venir.'],['que divertido fue','¡Qué divertido fue!']
  ];
  corrections.forEach((x,i)=>writing.push({id:`l-wr-corr-${i}`,level:i<7?1:i<12?2:3,topic:'Corrige la frase',q:`Reescribe correctamente: «${x[0]}»`,type:'self',sample:x[1]}));
  const connectors=['porque','aunque','después','sin embargo','además','por eso','mientras','finalmente','primero','entonces'];
  connectors.forEach((c,i)=>writing.push({id:`l-wr-conn-${i}`,level:i<4?1:i<7?2:3,topic:'Conectores',q:`Escribe una frase correcta que utilice el conector «${c}».`,type:'self',sample:`Ejemplo: ${c==='porque'?'Me llevé el paraguas porque estaba lloviendo.':`Escribe una oración clara con «${c}».`}`}));
  const prompts=[
    'Explica en dos frases por qué es importante revisar un texto antes de entregarlo.','Describe tu juego favorito sin decir su nombre para que otra persona lo adivine.',
    'Escribe dos instrucciones claras para enseñar a alguien a usar una aplicación.','Cuenta en tres frases algo que haya salido bien esta semana.',
    'Escribe una petición educada para pedir que te presten un objeto.','Explica una diferencia entre hablar con un amigo y escribir un mensaje formal.',
    'Escribe una frase con un sustantivo, un adjetivo y un verbo.','Escribe dos frases unidas por «pero».','Escribe dos frases unidas por «porque».',
    'Transforma una frase muy corta en otra mas precisa añadiendo detalles.','Escribe una pregunta con signos de interrogación y tilde donde corresponda.',
    'Escribe una exclamación correctamente puntuada.','Resume en una frase lo que hiciste ayer por la tarde.','Escribe una frase que contenga una palabra compuesta.',
    'Escribe una frase en plural y después transformala al singular.','Escribe una frase en femenino y después transformala al masculino.',
    'Escribe una oración en pasado y otra en futuro.','Escribe una frase con una enumeración de tres elementos.',
    'Redacta un mensaje breve para disculparte por llegar tarde.','Redacta un mensaje breve para dar las gracias por una ayuda.'
  ];
  prompts.forEach((q,i)=>writing.push({id:`l-wr-prompt-${i}`,level:i<7?1:i<14?2:3,topic:'Expresión escrita',q,type:'self',sample:'Comprueba que la respuesta sea clara, completa, esté bien puntuada y tenga sentido.'}));
  const extraWrite=['Reescribe con más precisión: «La cosa salió bien».','Reescribe evitando repetir «y»: «Llegué y comí y estudié y salí».','Convierte en una petición educada: «Dame tus apuntes».','Reescribe con mejor puntuación: «Cuando llegué nadie estaba allí así que esperé».','Explica la misma idea usando un conector de contraste.','Escribe una versión más formal de: «Oye, pásame eso».','Reescribe evitando una generalización: «Todo el mundo hace eso».','Convierte dos frases cortas en una sola usando «porque».','Escribe una conclusión de una frase para un texto sobre deporte.','Reescribe una frase ambigua para que tenga un significado claro.','Transforma «Eso estuvo guay» en una frase más precisa.','Escribe una versión respetuosa de «No tienes ni idea».','Reescribe «Fue fatal» indicando qué salió mal exactamente.','Convierte «Hazlo ya» en una instrucción clara y educada.','Escribe una alternativa a «Siempre haces lo mismo» que describa una situación concreta.']; while(writing.length<60){const i=writing.length;const q=extraWrite[i%extraWrite.length];writing.push({id:`l-wr-extra-${i}`,level:3,topic:'Mejora de estilo',q,type:'self',sample:'Comprueba que la versión sea más clara, precisa y esté bien puntuada.'});}

  // DIVISIONES: 60 unicas y graduadas
  const division=[];
  const makeDiv=(level,divisor,q,rem,id)=>{const dividend=divisor*q+rem; return {id:`div-${id}`,level,dividend,divisor,q,rem};};
  let did=0;
  [[6,42],[7,36],[8,31],[9,27],[5,64],[4,83],[3,96],[6,58],[7,49],[8,72],[9,54],[5,87],[4,76],[3,115],[6,93],[7,88],[8,67],[9,74],[5,126],[4,139]].forEach(([d,q],i)=>division.push(makeDiv(1,d,q,i%3,did++)));
  [[12,48],[14,36],[15,57],[16,43],[18,62],[21,39],[22,54],[24,47],[25,68],[27,51],[32,46],[35,44],[36,58],[42,39],[45,52],[48,37],[54,41],[63,34],[72,29],[84,31]].forEach(([d,q],i)=>division.push(makeDiv(2,d,q,i%5,did++)));
  [[37,73],[48,86],[56,79],[64,91],[72,83],[75,97],[84,88],[96,77],[58,104],[67,95],[73,108],[82,89],[91,76],[44,127],[52,118],[68,109],[77,93],[85,112],[93,87],[99,101]].forEach(([d,q],i)=>division.push(makeDiv(3,d,q,i%7,did++)));

  // LECTURA: 12 textos x 5 preguntas = 60 ejercicios
  const passages=[
    ['Una base junto al río','En una partida de Minecraft, Nora encontró una aldea al borde de un río. Antes de explorarla, dejó comida y herramientas en un cofre junto a su casa. Después cruzó el río, habló con varios aldeanos y descubrió una biblioteca. Allí encontró un libro con indicaciones sobre una mina abandonada. Nora decidió no entrar todavía porque estaba anocheciendo y no llevaba suficientes antorchas. Al volver, anotó el camino y preparó lo necesario para regresar al día siguiente.',
     [['¿Dónde estaba la aldea?','Al borde de un río'],['¿Qué encontró Nora en la biblioteca?','Un libro con indicaciones sobre una mina'],['¿Por qué no entró en la mina?','Porque anochecía y no llevaba suficientes antorchas'],['¿Qué hizo al regresar?','Anotó el camino y preparó lo necesario'],['¿Qué rasgo muestra Nora?','Prudencia']]],
    ['El partido que sirvió para aprender','El equipo de Pablo empezó la liga con dos derrotas. El entrenador revisó los partidos y detectó que perdían muchos balones al salir desde atrás. Durante una semana practicaron pases cortos, controles orientados y movimientos de apoyo. En el siguiente partido empataron a uno. No ganaron, pero cometieron menos errores y tuvieron más ocasiones. El entrenador les recordó que progresar no siempre significa ganar de inmediato.',
     [['¿Cómo empezó la liga el equipo?','Con dos derrotas'],['¿Qué problema detectó el entrenador?','Perdían muchos balones al salir desde atrás'],['¿Qué resultado tuvo el siguiente partido?','Empate a uno'],['¿Qué dato muestra una mejora?','Cometieron menos errores y tuvieron más ocasiones'],['¿Cuál es la idea principal?','Mejorar no siempre significa ganar de inmediato']]],
    ['El móvil perdido','Sara salió del entrenamiento y al llegar a casa no encontraba el móvil. Primero pensó que alguien se lo había cogido, pero antes de acusar a nadie repasó lo que había hecho. Recordó que lo había usado en el vestuario. Llamó al polideportivo y el conserje le dijo que habían encontrado uno junto a un banco. Sara comprobó la funda y la hora de la pantalla y vio que era el suyo.',
     [['¿Cuándo notó Sara que faltaba el móvil?','Al llegar a casa'],['¿Qué pensó primero?','Que alguien se lo había cogido'],['¿Qué hizo antes de acusar?','Repasó lo que había hecho'],['¿Dónde apareció el móvil?','Junto a un banco del vestuario/polideportivo'],['¿Qué enseñanza transmite?','Conviene comprobar los hechos antes de acusar']]],
    ['El torneo de construcción','Cuatro amigos organizaron un torneo de construcción. Cada uno tenía veinte minutos y el mismo número de bloques. Marta hizo una torre muy alta, Leo construyó un puente, Inés diseñó un jardín y Amir preparó una estación. Al terminar, decidieron que no habría un único ganador: votarían por originalidad, utilidad y acabado, de modo que cada construcción pudiera destacar en algo diferente.',
     [['¿Cuánto tiempo tenía cada participante?','Veinte minutos'],['¿Qué construyó Leo?','Un puente'],['¿Por qué no eligieron un único ganador?','Porque valorarían varios criterios'],['¿Qué criterios usaron?','Originalidad, utilidad y acabado'],['¿Qué idea transmite el texto?','Hay distintas formas de hacer bien una tarea']]],
    ['La camiseta equivocada','Antes de un partido, Dani guardó dos camisetas casi iguales en la mochila. Una era la del equipo y otra la de entrenamiento. Al llegar al campo se dio cuenta de que había cogido la equivocada. En vez de enfadarse, llamó a su padre, que todavía estaba cerca, y pidió ayuda. Mientras esperaba, avisó al entrenador para que supiera lo ocurrido.',
     [['¿Qué error cometió Dani?','Cogió la camiseta equivocada'],['¿Cómo reaccionó?','Buscó una solución sin enfadarse'],['¿A quién llamó?','A su padre'],['¿A quién avisó también?','Al entrenador'],['¿Qué habilidad muestra Dani?','Resolver un problema y comunicarlo']]],
    ['La receta que salió mejor','Claudia quiso preparar tortitas siguiendo una receta. La primera tanda quedó demasiado espesa porque añadió más harina de la indicada. En la segunda midió los ingredientes con cuidado y bajó un poco el fuego. Las tortitas salieron mejor. Claudia anotó los cambios para recordar qué había funcionado.',
     [['¿Qué falló en la primera tanda?','Añadió demasiada harina'],['¿Qué cambió en la segunda?','Midió mejor y bajó el fuego'],['¿Qué hizo al final?','Anotó los cambios'],['¿Por qué anotó los cambios?','Para recordar qué había funcionado'],['¿Qué estrategia usa Claudia?','Aprender del error y ajustar']]],
    ['El vídeo del experimento','Álex grabó un vídeo de un experimento para clase. Al verlo, notó que había partes en las que hablaba demasiado rápido. No volvió a grabarlo entero. Repitió solo esas partes, añadió un título y comprobó que se entendieran los pasos. Después enseñó el vídeo a su hermana para saber si había algo confuso.',
     [['¿Qué problema detectó Álex?','Hablaba demasiado rápido en algunas partes'],['¿Qué repitió?','Solo las partes necesarias'],['¿Qué añadió al vídeo?','Un título'],['¿Para qué se lo enseñó a su hermana?','Para detectar partes confusas'],['¿Qué proceso siguió?','Revisar, corregir y pedir feedback']]],
    ['La excursión y la lluvia','El grupo iba a hacer una excursión por la sierra. La previsión anunciaba lluvia por la tarde, así que cambiaron el horario y salieron antes. Llevaron chubasqueros, agua y un mapa. Cuando empezó a llover ya estaban cerca del autobús y pudieron terminar la actividad sin problemas.',
     [['¿Qué anunciaba la previsión?','Lluvia por la tarde'],['¿Qué cambio hicieron?','Salieron antes'],['¿Qué llevaron?','Chubasqueros, agua y un mapa'],['¿Dónde estaban cuando empezó a llover?','Cerca del autobús'],['¿Qué ayudó a que todo saliera bien?','Planificar según la previsión']]],
    ['La biblioteca del barrio','La biblioteca abrió un club de lectura para niños. Cada dos semanas elegían un libro corto y se reunían para comentarlo. No era obligatorio que a todos les gustara el libro: lo importante era explicar la opinión con ejemplos y escuchar a los demás. Con el tiempo, varios participantes empezaron a escoger libros que antes no habrían probado.',
     [['¿Cada cuánto se reunían?','Cada dos semanas'],['¿Tenían que opinar todos igual?','No'],['¿Qué era importante al opinar?','Dar ejemplos y escuchar'],['¿Qué cambió con el tiempo?','Probaron libros nuevos'],['¿Qué habilidad se practica?','Argumentar y escuchar opiniones distintas']]],
    ['Un gol inesperado','En el último minuto, el portero del equipo rival despejó mal el balón. Lucía podía chutar, pero vio a una compañera mejor colocada y le pasó la pelota. Su compañera marcó. Después del partido, el entrenador destacó la decisión de Lucía porque había pensado en la mejor opción para el equipo, no en quién aparecería como goleadora.',
     [['¿Qué ocurrió con el despeje?','Fue malo'],['¿Qué podía hacer Lucía?','Chutar'],['¿Qué decidió hacer?','Pasar a una compañera mejor colocada'],['¿Quién marcó?','Su compañera'],['¿Qué valoró el entrenador?','Que priorizara al equipo']]],
    ['El huerto de clase','La clase plantó tomates, lechugas y hierbas aromáticas. Dos semanas después, algunas plantas crecían mucho y otras apenas habían cambiado. En vez de pensar que las semillas eran malas, compararon cuánta luz recibía cada zona y cuánto agua habían usado. Descubrieron que una parte del huerto quedaba en sombra casi todo el día.',
     [['¿Qué plantaron?','Tomates, lechugas y hierbas aromáticas'],['¿Qué diferencia observaron?','Unas plantas crecían más que otras'],['¿Qué compararon?','Luz y agua'],['¿Qué descubrieron?','Que una zona tenía demasiada sombra'],['¿Qué forma de pensar usan?','Buscar datos antes de sacar conclusiones']]],
    ['La presentación en grupo','Para una presentación, cada miembro del grupo preparó una parte. El día anterior juntaron todo y vieron que repetían información y usaban estilos muy distintos. Decidieron ensayar juntos, eliminar repeticiones y usar los mismos títulos y tamaños de letra. La presentación final resultó más clara.',
     [['¿Qué problema encontraron?','Repeticiones y estilos distintos'],['¿Cuándo lo detectaron?','El día anterior'],['¿Qué hicieron?','Ensayar, eliminar repeticiones y unificar el formato'],['¿Cómo quedó la presentación?','Más clara'],['¿Qué demuestra el texto?','Revisar el trabajo conjunto mejora el resultado']]]
  ];
  const reading=[]; passages.forEach((p,pi)=>p[2].forEach((qa,qi)=>reading.push({id:`read-${pi}-${qi}`,level:pi<4?1:pi<8?2:3,title:p[0],text:p[1],q:qa[0],a:qa[1],type:'self'})));

  D.primary={label:'10-12 años',subjects:['geometry','language','division','reading'],geometry,language:{grammar,spelling,writing},division,reading};
})();

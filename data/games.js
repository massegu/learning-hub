(function(){
  const D=window.LEARNING_DATA=window.LEARNING_DATA||{};
  const quick=(id,level,q,opts,a,topic)=>({id,level,type:'quick',q,opts,a,topic});
  const order=(id,level,prompt,tokens,answer,topic)=>({id,level,type:'order',q:prompt,tokens,answer,topic});
  const match=(id,level,pairs,topic)=>({id,level,type:'match',q:'Empareja cada elemento con su pareja correcta.',pairs,topic});
  const rotate=(arr,n)=>arr.slice(n%arr.length).concat(arr.slice(0,n%arr.length));

  function primary(){
    const out=[];
    const quicks=[
      ['¿Qué número completa 7 × __ = 56?',['8','7','9','6'],'8','Cálculo'],['¿Qué palabra es un verbo?',['saltar','verde','mesa','ayer'],'saltar','Lengua'],['Choose the correct word: “I ___ football.”',['play','plays','playing now every day','am play'],'play','English'],['¿Qué ángulo es menor de 90°?',['Agudo','Recto','Obtuso','Llano'],'Agudo','Geometría'],['¿Cuál está bien escrita?',['habitación','abitación','hav itación','abitasión'],'habitación','Ortografía'],['¿Cuánto es 240 ÷ 6?',['40','36','42','46'],'40','Divisiones'],['Choose the plural of “mouse”.',['mice','mouses','mousees','mices'],'mice','English'],['¿Qué conector indica causa?',['porque','sin embargo','después','aunque'],'porque','Lengua'],['¿Cuánto es 25% de 80?',['20','15','25','30'],'20','Cálculo'],['¿Cuál es un polígono de 6 lados?',['Hexágono','Pentágono','Octógono','Triángulo'],'Hexágono','Geometría'],
      ['¿Qué frase es una opinión?',['Ese juego es divertidísimo.','El partido terminó 2-1.','La clase empieza a las 9.','El vídeo dura 4 minutos.'],'Ese juego es divertidísimo.','Lectura'],['Choose: “She ___ a bike.”',['has got','have got','is got','got has'],'has got','English'],['¿Qué resto deja 53 ÷ 5?',['3','2','4','1'],'3','Divisiones'],['¿Qué palabra es compuesta?',['sacapuntas','mesa','sol','casa'],'sacapuntas','Lengua'],['¿Qué unidad usarías para medir un ángulo?',['Grados','Litros','Kilogramos','Metros cuadrados'],'Grados','Geometría'],['Choose the opposite of “early”.',['late','fast','small','near'],'late','English'],['¿Qué número es equivalente a 1/2?',['0,5','0,2','1,5','2'],'0,5','Cálculo'],['¿Cuál es una preposición?',['con','rápido','cantar','ayer'],'con','Lengua'],['¿Qué acción ayuda a comprobar una noticia?',['Buscar la fuente original','Contar los likes','Mirar solo el titular','Reenviarla primero'],'Buscar la fuente original','Lectura'],['Choose: “We ___ studying now.”',['are','is','am','be'],'are','English']
    ];
    quicks.forEach((r,i)=>out.push(quick(`p-game-q-${i}`,i<7?1:i<14?2:3,r[0],r[1],r[2],r[3])));

    const orders=[
      [['I','play','basketball','after','school'],['I','play','basketball','after','school'],'Ordena la frase en inglés.','English'],
      [['Los','jugadores','entrenan','cada','martes'],['Los','jugadores','entrenan','cada','martes'],'Ordena la oración.','Lengua'],
      [['First','I','do','my','homework'],['First','I','do','my','homework'],'Ordena la frase.','English'],
      [['El','ángulo','recto','mide','90°'],['El','ángulo','recto','mide','90°'],'Ordena la definición.','Geometría'],
      [['Antes','de','compartir','compruebo','la','fuente'],['Antes','de','compartir','compruebo','la','fuente'],'Ordena el consejo.','Lectura'],
      [['She','is','reading','a','book'],['She','is','reading','a','book'],'Ordena la frase.','English'],
      [['El','sujeto','realiza','la','acción'],['El','sujeto','realiza','la','acción'],'Ordena la explicación.','Lengua'],
      [['Divide','multiplica','resta','y','baja'],['Divide','multiplica','resta','y','baja'],'Ordena los pasos.','Matemáticas'],
      [['We','went','to','the','cinema','yesterday'],['We','went','to','the','cinema','yesterday'],'Ordena la frase.','English'],
      [['Una','opinión','expresa','una','valoración'],['Una','opinión','expresa','una','valoración'],'Ordena la definición.','Lectura']
    ];
    for(let i=0;i<20;i++){const b=orders[i%orders.length];const ans=b[1].join(' ');out.push(order(`p-game-o-${i}`,i<7?1:i<14?2:3,`${b[2]} · Ronda ${i+1}`,rotate(b[0],(i%4)+1),ans,b[3]));}

    const pairSets=[
      [['triángulo','3 lados'],['cuadrado','4 lados iguales'],['pentágono','5 lados'],['octógono','8 lados']],
      [['rápido','adjetivo'],['ayer','adverbio'],['correr','verbo'],['amistad','sustantivo']],
      [['Monday','lunes'],['library','biblioteca'],['hungry','hambriento'],['between','entre']],
      [['1/2','0,5'],['1/4','0,25'],['3/4','0,75'],['1/10','0,1']],
      [['agudo','menos de 90°'],['recto','90°'],['obtuso','entre 90° y 180°'],['llano','180°']],
      [['play','played'],['go','went'],['see','saw'],['buy','bought']],
      [['b/v','biblioteca'],['m antes de p','campo'],['h','hielo'],['g/j','viaje']],
      [['hecho','comprobable'],['opinión','valoración'],['fuente','origen de información'],['contexto','información que rodea un mensaje']],
      [['8×7','56'],['9×6','54'],['12×4','48'],['15×3','45']],
      [['should','consejo'],['must','obligación'],['can','capacidad'],['might','posibilidad']]
    ];
    for(let i=0;i<20;i++){const topic=['Geometría','Lengua','English','Matemáticas','Geometría','English','Ortografía','Lectura','Cálculo','English'][i%10],item=match(`p-game-m-${i}`,i<7?1:i<14?2:3,pairSets[i%pairSets.length],topic);item.q=`Empareja cada elemento con su pareja correcta · ${topic} ${i+1}`;out.push(item);}
    return out;
  }

  function middle(){
    const out=[];
    const quicks=[
      ['¿Cuánto es el 15% de 200?',['30','25','35','20'],'30','Porcentajes'],['Choose: “I ___ this game since May.”',['have played','played yesterday','am play','have play'],'have played','English'],['¿Qué conector expresa contraste?',['sin embargo','por tanto','porque','además'],'sin embargo','Lengua'],['¿Cuál es equivalente a 3/4?',['0,75','0,34','1,25','0,3'],'0,75','Fracciones'],['¿Qué dato sería mejor evidencia de que un club creció?',['Pasó de 20 a 45 miembros','Su logo cambió','Un alumno dijo que le gusta','Tiene una foto nueva'],'Pasó de 20 a 45 miembros','Lectura'],['Choose the correct advice.',['You should rest.','You should to rest.','You should resting.','You are should rest.'],'You should rest.','English'],['Resuelve: 3x + 4 = 19',['5','4','6','7'],'5','Álgebra'],['¿Qué frase distingue mejor hecho de interpretación?',['“No respondió” es un hecho; “está enfadado” es una interpretación.','Ambas son hechos.','Ambas son opiniones.','No hay diferencia.'],'“No respondió” es un hecho; “está enfadado” es una interpretación.','Lectura'],['Choose the past of “teach”.',['taught','teached','tought','teach'],'taught','English'],['¿Qué medida reduce mejor distracciones al estudiar?',['Silenciar notificaciones durante un bloque','Responder cada aviso','Abrir varias apps','Mirar el móvil cada minuto'],'Silenciar notificaciones durante un bloque','Estrategias'],
      ['¿Qué es una proporción?',['Una igualdad entre dos razones','Una suma de enteros','Un ángulo','Una palabra compuesta'],'Una igualdad entre dos razones','Matemáticas'],['Choose: If it rains, we ___ home.',['will stay','would stayed','stayed tomorrow','will stayed'],'will stay','English'],['¿Cuál es una generalización excesiva?',['“Nunca me sale nada bien”','“Este ejercicio me salió mal”','“Hoy me costó concentrarme”','“Fallé dos preguntas”'],'“Nunca me sale nada bien”','Lengua'],['¿Qué porcentaje representa 18 de 60?',['30%','18%','42%','60%'],'30%','Porcentajes'],['Choose the most polite request.',['Could you explain that again, please?','Explain it now.','You explain.','Again!'],'Could you explain that again, please?','English'],['¿Qué conviene revisar al comparar dos fuentes?',['Fecha, autoría y evidencia','Solo el número de seguidores','El color de la web','La longitud del título'],'Fecha, autoría y evidencia','Lectura'],['¿Qué valor de x cumple 5x=45?',['9','8','10','5'],'9','Álgebra'],['Choose the connector for result.',['therefore','however','although','while'],'therefore','English'],['¿Qué frase contiene una subordinada causal?',['No fui porque estaba enfermo.','No fui ayer.','Fui al cine.','Quizá vaya mañana.'],'No fui porque estaba enfermo.','Lengua'],['¿Qué acción es más segura con un rumor?',['No afirmarlo como cierto hasta verificarlo','Reenviarlo para preguntar','Añadir “dicen que” y compartirlo','Dar por hecho que es verdad'],'No afirmarlo como cierto hasta verificarlo','Lectura']
    ];
    quicks.forEach((r,i)=>out.push(quick(`m-game-q-${i}`,i<7?1:i<14?2:3,r[0],r[1],r[2],r[3])));
    const baseOrders=[
      ['I have never tried that app before.','Ordena la frase en inglés.','English'],['Primero compruebo la fuente y después comparo la información.','Ordena la estrategia.','Lectura'],['Si el porcentaje aumenta, la cantidad final también cambia.','Ordena la frase matemática.','Matemáticas'],['Although it was late, we finished the project.','Ordena la frase.','English'],['Una conclusión prudente reconoce sus limitaciones.','Ordena la idea.','Lengua'],['We were studying when the lights went out.','Ordena la frase.','English'],['El contexto puede cambiar la interpretación de un mensaje.','Ordena la explicación.','Lectura'],['Para resolver una ecuación, mantenemos la igualdad en ambos lados.','Ordena la explicación.','Matemáticas'],['I see your point, but I disagree.','Ordena una forma educada de discrepar.','English'],['Un dato concreto es más preciso que una generalización.','Ordena la idea.','Lengua']
    ];
    for(let i=0;i<20;i++){const b=baseOrders[i%10],tok=b[0].split(' ');out.push(order(`m-game-o-${i}`,i<7?1:i<14?2:3,`${b[1]} · Ronda ${i+1}`,rotate(tok,(i%Math.max(1,tok.length-1))+1),b[0],b[2]));}
    const sets=[
      [['10% de 300','30'],['25% de 80','20'],['50% de 46','23'],['20% de 150','30']],
      [['since','punto inicial'],['for','duración'],['yet','todavía / en preguntas y negativas'],['already','ya']],
      [['hecho','se puede comprobar'],['opinión','valoración'],['inferencia','conclusión a partir de pistas'],['fuente','origen de información']],
      [['3/4','0,75'],['2/5','0,4'],['1/8','0,125'],['5/10','0,5']],
      [['however','contraste'],['therefore','resultado'],['because','causa'],['for example','ejemplo']],
      [['sujeto','quién realiza o protagoniza'],['predicado','lo que se dice del sujeto'],['verbo','núcleo del predicado'],['conector','relaciona ideas']],
      [['privacy','privacidad'],['deadline','fecha límite'],['reliable','fiable'],['evidence','evidencia']],
      [['2x+3=11','x=4'],['5x=35','x=7'],['3x-2=13','x=5'],['4x+1=21','x=5']],
      [['captura','puede perder contexto'],['titular','resume y atrae atención'],['método','explica cómo se obtuvieron datos'],['fecha','indica actualidad']],
      [['mustn’t','prohibición'],['don’t have to','no es necesario'],['should','consejo'],['might','posibilidad']]
    ];
    for(let i=0;i<20;i++){const topic=['Matemáticas','English','Lectura','Matemáticas','English','Lengua','English','Álgebra','Lectura','English'][i%10],item=match(`m-game-m-${i}`,i<7?1:i<14?2:3,sets[i%10],topic);item.q=`Empareja cada elemento con su pareja correcta · ${topic} ${i+1}`;out.push(item);}
    return out;
  }

  function teen(){
    const out=[];
    const qs=[
      ['Una cuenta tiene 2000 seguidores y crece un 15%. ¿Cuántos tendrá?',['2300','2150','2015','2500'],'2300','Matemáticas'],['Choose: “I’ve known him ___ 2023.”',['since','for','ago','during'],'since','English'],['¿Qué frase separa mejor hecho e interpretación?',['“Leyó el mensaje” es hecho; “me ignora” es interpretación.','Ambas son hechos.','Ambas son intenciones.','No hay diferencia.'],'“Leyó el mensaje” es hecho; “me ignora” es interpretación.','Social'],['¿Qué fortalece más una afirmación?',['Una fuente con método y datos transparentes','Muchos likes','Un titular rotundo','Que coincida con mi opinión'],'Una fuente con método y datos transparentes','Lectura'],['Choose a polite boundary.',['I’m not comfortable sharing my password.','Give me your password too.','Whatever, take it.','You’re crazy for asking.'],'I’m not comfortable sharing my password.','English'],['Si una nota pasa de 6 a 7,5, ¿qué aumento porcentual es?',['25%','15%','1,5%','75%'],'25%','Matemáticas'],['¿Qué respuesta valida una emoción sin aceptar una interpretación?',['Entiendo que te haya dolido; no sé aún qué intención hubo.','Si te dolió, seguro que lo hizo a propósito.','No deberías sentirte así.','Tienes razón en todo.'],'Entiendo que te haya dolido; no sé aún qué intención hubo.','Social'],['Choose the reported speech.',['She said that she was tired.','She said she is tired yesterday.','She said I tired.','She said that tired.'],'She said that she was tired.','English'],['¿Qué significa “muestra pequeña” en una encuesta?',['Que limita cuánto podemos generalizar','Que los datos son falsos','Que no hay participantes','Que la encuesta es anónima'],'Que limita cuánto podemos generalizar','Lectura'],['¿Qué conviene hacer antes de reenviar una captura polémica?',['Buscar contexto y origen','Asumir intención','Recortarla más','Añadir un comentario agresivo'],'Buscar contexto y origen','Social'],
      ['Choose the best hedge.',['The results suggest that...','This proves forever that...','Everyone knows...','There is no doubt ever.'],'The results suggest that...','English'],['¿Cuál es 18% de 450?',['81','72','90','68'],'81','Matemáticas'],['¿Qué límite digital es razonable?',['No compartir ubicación en tiempo real si no quieres','Compartir contraseñas por confianza','Responder siempre al instante','Permitir acceso al móvil para evitar celos'],'No compartir ubicación en tiempo real si no quieres','Social'],['¿Qué conflicto de interés puede existir en una reseña patrocinada?',['La marca paga al creador que recomienda el producto','El vídeo tiene subtítulos','El producto tiene garantía','El vídeo dura diez minutos'],'La marca paga al creador que recomienda el producto','Lectura'],['Choose: If I had more time, I ___ another language.',['would learn','will learned','learn yesterday','would learned'],'would learn','English'],['Resuelve: 4x + 8 = 40',['8','10','6','12'],'8','Álgebra'],['¿Qué es una respuesta asertiva?',['Clara, respetuosa y con límites','Agresiva para ganar','Pasiva para evitar todo','Ambigua para no decidir'],'Clara, respetuosa y con límites','Social'],['¿Qué distingue correlación de causalidad?',['Que dos cosas cambien juntas no prueba que una cause la otra','Son exactamente lo mismo','La causalidad nunca existe','La correlación siempre prueba causa'],'Que dos cosas cambien juntas no prueba que una cause la otra','Lectura'],['Choose the passive.',['The video was edited yesterday.','They edit the video yesterday.','The video edited itself.','The video was edit.'],'The video was edited yesterday.','English'],['¿Qué pregunta ayuda más en un conflicto?',['¿Qué resultado quiero conseguir con esta conversación?','¿Cómo demuestro que tengo razón?','¿Quién me dará apoyo público?','¿Qué puedo publicar?'],'¿Qué resultado quiero conseguir con esta conversación?','Social']
    ];
    qs.forEach((r,i)=>out.push(quick(`t-game-q-${i}`,i<7?1:i<14?2:3,r[0],r[1],r[2],r[3])));
    const orders=[
      ['Popularity does not prove that a claim is accurate.','Ordena la frase.','English'],['Reconocer una emoción no obliga a aceptar una interpretación.','Ordena la idea.','Social'],['Una conclusión sólida incluye también sus limitaciones.','Ordena la frase.','Lectura'],['If I were you, I would check the original source.','Ordena la frase.','English'],['Un límite claro puede ser respetuoso y firme al mismo tiempo.','Ordena la idea.','Social'],['Después de revisar la evidencia, cambié mi opinión inicial.','Ordena la frase.','Lectura'],['The post was shared before the source was checked.','Ordena la frase.','English'],['La intención y el impacto pueden ser diferentes.','Ordena la idea.','Social'],['Comparar fuentes ayuda a detectar diferencias de método y fecha.','Ordena la frase.','Lectura'],['I understand your point, but I reach a different conclusion.','Ordena la frase.','English']
    ];
    for(let i=0;i<20;i++){const b=orders[i%10],tok=b[0].split(' ');out.push(order(`t-game-o-${i}`,i<7?1:i<14?2:3,`${b[1]} · Ronda ${i+1}`,rotate(tok,(i%Math.max(1,tok.length-1))+1),b[0],b[2]));}
    const sets=[
      [['hecho','comprobable'],['opinión','valoración'],['interpretación','significado atribuido'],['intención','propósito de una persona']],
      [['since','desde un punto inicial'],['for','durante un periodo'],['might','posibilidad'],['would','condicional']],
      [['muestra','grupo analizado'],['método','cómo se obtienen los datos'],['fuente','origen'],['limitación','factor que reduce el alcance']],
      [['límite','lo que acepto o no'],['validación','reconocer una emoción'],['asertividad','claridad + respeto'],['perspectiva','punto de vista']],
      [['15% de 200','30'],['18% de 450','81'],['25% de 320','80'],['12% de 250','30']],
      [['however','contraste'],['therefore','resultado'],['whereas','comparación/contraste'],['although','concesión']],
      [['patrocinio','posible incentivo'],['algoritmo','personaliza contenido'],['captura','puede omitir contexto'],['viralidad','difusión rápida']],
      [['3x+6=21','x=5'],['5x-10=30','x=8'],['2x+14=28','x=7'],['6x=54','x=9']],
      [['privacy','privacidad'],['evidence','evidencia'],['bias','sesgo'],['reliable','fiable']],
      [['intención','qué quería hacer'],['impacto','efecto que produjo'],['consentimiento','permiso libre y específico'],['ambigüedad','más de una interpretación posible']]
    ];
    for(let i=0;i<20;i++){const topic=['Social','English','Lectura','Social','Matemáticas','English','Digital','Álgebra','English','Social'][i%10],item=match(`t-game-m-${i}`,i<7?1:i<14?2:3,sets[i%10],topic);item.q=`Empareja cada elemento con su pareja correcta · ${topic} ${i+1}`;out.push(item);}
    return out;
  }

  const banks={primary:primary(),middle:middle(),teen:teen()};
  Object.entries(banks).forEach(([band,bank])=>{if(D[band]){D[band].games=bank;if(!D[band].subjects.includes('games'))D[band].subjects.push('games');}});
})();

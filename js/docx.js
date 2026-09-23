(function(){
  const shuffle=a=>[...a].sort(()=>Math.random()-.5);
  const esc=s=>String(s);

  function geometryPool(){
    const out=[];let id=0;
    ['triángulo','cuadrado','rectángulo','pentágono','hexágono','heptágono','octógono','decágono'].forEach((s,i)=>{
      const n=[3,4,4,5,6,7,8,10][i];out.push({id:`wg${id++}`,text:`Dibuja un ${s} y señala sus ${n} vértices.`});
      out.push({id:`wg${id++}`,text:`Escribe cuántos lados tiene un ${s} y pon un ejemplo de un objeto que recuerde a esa forma.`});
    });
    [20,32,47,58,71,88,90,102,117,129,143,156,171,180].forEach(d=>out.push({id:`wg${id++}`,text:`Clasifica un ángulo de ${d}° como agudo, recto, obtuso o llano.`}));
    [18,27,33,41,52,64,73,79].forEach(d=>out.push({id:`wg${id++}`,text:`Calcula el ángulo complementario de ${d}°.`}));
    [101,113,124,136,148,159,167].forEach(d=>out.push({id:`wg${id++}`,text:`Calcula cuánto falta a ${d}° para formar un ángulo llano.`}));
    const p=['Explica una diferencia entre un cuadrado y un rectángulo.','Dibuja dos rectas paralelas y dos rectas perpendiculares.','Dibuja un rombo y marca un par de lados paralelos.','Escribe dos objetos cotidianos con forma circular.','Escribe dos objetos cotidianos con forma rectangular.','Dibuja una figura con exactamente cinco lados.','Dibuja un cuadrilátero que no sea un cuadrado.','Explica por qué todos los cuadrados son rectángulos, pero no todos los rectángulos son cuadrados.','Dibuja un ángulo agudo y otro obtuso sin usar transportador.','Construye una figura usando al menos un triángulo, un rectángulo y un círculo.','Indica cuántos grados suman los ángulos de un triángulo.','Dibuja un eje de simetría en una figura que lo tenga.','Pon un ejemplo de dos figuras con cuatro lados pero propiedades diferentes.','Explica con tus palabras qué es un vértice.','Explica con tus palabras qué significa que dos lados sean paralelos.'];
    p.forEach(x=>out.push({id:`wg${id++}`,text:x}));
    while(out.length<60)out.push({id:`wg${id++}`,text:`Reto geométrico ${id}: dibuja una figura de cuatro lados y describe dos de sus propiedades.`});
    return out.slice(0,60);
  }
  function languagePool(){
    const out=[];let id=0;
    const bv=['barco','ventana','biblioteca','viaje','volver','buscar','bebida','vecino','verano','bailar','viento','burbuja','valiente','bravo','votar','vivir','broma','vuelo','balón','verde'];
    bv.forEach(w=>out.push({id:`wl${id++}`,text:`Escribe una frase con la palabra «${w}» y subraya la letra b o v.`}));
    const mn=['campo','tiempo','también','empezar','imposible','embudo','comprar','enviar','invento','convivir','campana','trompeta','bombilla','invierno','compañero'];
    mn.forEach(w=>out.push({id:`wl${id++}`,text:`Completa la palabra y explica si lleva m o n: ${w.replace(/[mn]/, '__')}.` }));
    const h=['huevo','hielo','hora','hacer','hablar','hospital','humano','hola','hecho','hallar','hasta','hermano','historia','herramienta','hormiga'];
    h.forEach(w=>out.push({id:`wl${id++}`,text:`Escribe correctamente «${w.replace(/^h/,'_')}» y crea una oración con esa palabra.`}));
    const gr=['Escribe una oración que contenga un sustantivo, un verbo y un adjetivo.','Escribe una palabra simple y una compuesta.','Transforma “las jugadoras rápidas” a masculino singular.','Transforma “el alumno atento” a femenino plural.','Escribe una frase con un pronombre personal.','Escribe una frase con un determinante demostrativo.','Escribe una frase con un adverbio de tiempo.','Escribe una frase con una preposición.','Señala el sujeto y el predicado en: “Los vecinos prepararon una fiesta”.','Inventa una oración cuyo sujeto tenga dos palabras.','Escribe una oración en pasado y transfórmala al futuro.','Escribe una frase con una enumeración de tres elementos.','Corrige: “los perro corre rapido”.','Corrige: “yo e hecho los deberes”.','Corrige: “mañana ire a madrid”.','Corrige: “que sorpresa”.','Añade signos y tildes: “como te llamas”.','Reescribe de forma más clara: “Hice eso y luego eso y estuvo bien”.','Escribe dos frases unidas por “sin embargo”.','Escribe dos frases unidas por “porque”.','Redacta un mensaje educado para pedir un favor.','Redacta una disculpa breve por llegar tarde.','Resume en dos frases algo que hayas hecho hoy.','Describe un objeto sin decir su nombre para que alguien lo adivine.','Escribe una instrucción clara de tres pasos.'];
    gr.forEach(x=>out.push({id:`wl${id++}`,text:x}));
    while(out.length<100)out.push({id:`wl${id++}`,text:`Reto de lengua ${id}: escribe una frase correcta que incluya un verbo, un adjetivo y una palabra con h.`});
    return out;
  }
  function divisionPool(){const out=[];let id=0;for(let d of [4,5,6,7,8,9,12,14,15,16,18,21,24,25,27,32,36,42,48,54]){for(let k=0;k<3;k++){const q=24+((id*7)%91),r=(id*3)%Math.min(d,9),n=d*q+r;out.push({id:`wd${id++}`,text:`${n.toLocaleString('es-ES')} ÷ ${d} =`,sub:`Cociente: __________   Resto: __________   Comprobación: ____________________`});}}return out.slice(0,60)}
  const worksheetReadings=[
    ['El reto de edición','Mara y Joel tenían que entregar un vídeo de tres minutos. La primera versión duraba casi cinco. En vez de acelerar todas las imágenes, revisaron el guion, eliminaron repeticiones y dejaron solo los ejemplos que ayudaban a entender la idea. Después enseñaron el vídeo a dos compañeros y les preguntaron qué partes seguían siendo confusas. Con esas respuestas hicieron una última revisión.',['¿Cuál era el problema de la primera versión?','¿Qué hicieron antes de acelerar nada?','¿Para qué enseñaron el vídeo a dos compañeros?','¿Qué criterio usaron para decidir qué ejemplos conservar?','Resume la estrategia que siguieron.']],
    ['El entrenamiento invisible','El equipo de baloncesto dedicó una semana a practicar pases y colocación defensiva. A varios jugadores les pareció menos divertido que lanzar a canasta, pero en el siguiente partido perdieron menos balones y permitieron menos tiros fáciles. El entrenador explicó que algunas mejoras no llaman la atención durante el entrenamiento, aunque después cambien mucho el resultado.',['¿Qué practicó el equipo?','¿Por qué algunos jugadores estaban menos motivados?','¿Qué dos mejoras aparecieron en el partido?','¿Qué quiso decir el entrenador?','Pon un ejemplo de otra habilidad que mejore con práctica poco visible.']],
    ['Un mensaje fuera de contexto','En un grupo de clase apareció una captura de un mensaje de Leo que parecía bastante borde. Antes de reenviarla, Amina preguntó cuándo se había escrito. Descubrió que el mensaje era una respuesta a una broma anterior que no aparecía en la captura. La frase seguía pudiendo resultar brusca, pero el contexto cambiaba bastante su interpretación.',['¿Qué apareció en el grupo?','¿Qué preguntó Amina antes de reenviar?','¿Qué información faltaba?','¿El contexto hizo desaparecer cualquier problema?','¿Qué enseñanza sobre capturas de pantalla transmite el texto?']],
    ['La maqueta resistente','Para una maqueta, Bruno construyó un puente de cartón que se doblaba en el centro. Probó a añadir más cartón, pero solo consiguió hacerlo más pesado. Después observó puentes reales y vio que muchos usaban triángulos en su estructura. Añadió pequeñas piezas triangulares y la maqueta soportó mucho más peso sin aumentar demasiado su masa.',['¿Qué problema tenía el primer puente?','¿Qué solución no funcionó bien?','¿Qué observó Bruno en puentes reales?','¿Qué cambió en la maqueta?','¿Qué demuestra el proceso de Bruno?']],
    ['La cuenta nueva','Irene abrió una cuenta para compartir dibujos. Al principio miraba constantemente cuántos “me gusta” tenía cada publicación. Un día notó que estaba eligiendo qué dibujar solo por intentar conseguir más reacciones. Decidió publicar con menos frecuencia y volver a escoger temas que realmente le interesaban.',['¿Qué compartía Irene?','¿En qué se fijaba demasiado al principio?','¿Cómo empezó eso a influir en sus decisiones?','¿Qué cambio hizo?','¿Cuál podría ser la idea principal?']],
    ['La ruta alternativa','Una carretera estaba cortada y el autobús escolar tuvo que cambiar de ruta. El conductor avisó de que llegarían unos quince minutos tarde. Algunos alumnos se pusieron nerviosos por un examen, pero una profesora llamó al centro para avisar. Al saber que el retraso estaba comunicado, el grupo pudo esperar con más calma.',['¿Por qué cambió la ruta?','¿Cuánto retraso estimaron?','¿Qué preocupaba a algunos alumnos?','¿Qué hizo la profesora?','¿Por qué se tranquilizaron después?']],
    ['El experimento repetido','Nadia obtuvo un resultado sorprendente en un experimento de ciencias. En vez de darlo por correcto inmediatamente, repitió el procedimiento tres veces. Dos intentos dieron un resultado distinto al primero. Revisó sus notas y descubrió que la primera vez había medido mal una cantidad.',['¿Qué hizo Nadia al ver un resultado sorprendente?','¿Qué ocurrió al repetirlo?','¿Qué descubrió al revisar sus notas?','¿Por qué es importante repetir una medida?','¿Qué actitud científica muestra?']],
    ['La charla del vestuario','Después de perder, varios jugadores culpaban al árbitro. La capitana propuso revisar primero las jugadas que sí dependían del equipo: pases fallados, marcas perdidas y decisiones apresuradas. No dijo que el arbitraje hubiera sido perfecto, sino que quería centrarse en aquello que podían mejorar para el siguiente partido.',['¿A quién culpaban algunos jugadores?','¿Qué propuso la capitana?','¿Negó que el árbitro pudiera equivocarse?','¿En qué quería centrarse?','¿Qué ventaja tiene ese enfoque?']],
    ['El trabajo repartido','Cuatro alumnos preparaban una exposición. Al principio dividieron las diapositivas a partes iguales, pero una de las secciones necesitaba mucha más investigación. Decidieron cambiar el reparto: dos buscarían información, uno diseñaría las imágenes y otro revisaría la coherencia del conjunto.',['¿Cómo repartieron el trabajo al principio?','¿Qué problema encontraron?','¿Cómo cambiaron el reparto?','¿Fue el nuevo reparto exactamente igual para todos?','¿Qué diferencia hay entre repartir igual y repartir de forma útil?']],
    ['El comentario anónimo','Una web permitía comentar sin mostrar el nombre. Hugo notó que algunas personas escribían cosas que probablemente no dirían cara a cara. En clase debatieron si el anonimato podía proteger a alguien en ciertas situaciones y, al mismo tiempo, facilitar comportamientos irresponsables.',['¿Qué permitía la web?','¿Qué observó Hugo?','¿El texto presenta el anonimato como solo bueno o solo malo?','¿Qué dos efectos distintos se mencionan?','Escribe una conclusión equilibrada.']]
  ];
  function readingPool(){const out=[];worksheetReadings.forEach((r,ri)=>r[2].forEach((q,qi)=>out.push({id:`wr-${ri}-${qi}`,title:r[0],text:r[1],question:q,passage:ri})));return out;}
  function socialPool(data){return data.social.map((x,i)=>({id:`ws-${i}`,text:`Situación: ${x.q} Escribe qué harías o pensarías y explica qué información necesitarías antes de sacar conclusiones.`,sub:`Pista: trabaja ${x.cat.toLowerCase()}, perspectiva y una respuesta respetuosa.`}));}
  function teenLangPool(){const topics=['Redacta un mensaje formal para pedir una tutoría.','Convierte una opinión absoluta en una afirmación más precisa.','Escribe un argumento a favor y otro en contra de limitar el uso del móvil en clase.','Resume una noticia ficticia en dos frases separando hechos de opiniones.','Reescribe un mensaje impulsivo para que sea firme pero respetuoso.','Escribe una frase con “sin embargo” y otra con “por tanto”.','Explica la diferencia entre “hecho”, “opinión” e “interpretación”.','Corrige un texto breve con puntuación deficiente.','Redacta una respuesta educada a un desacuerdo.','Escribe una petición clara sin sonar exigente.'];const out=[];for(let i=0;i<60;i++)out.push({id:`wtl-${i}`,text:`${topics[i%topics.length]} ${i>=10?`Variante ${Math.floor(i/10)+1}: cambia el contexto a ${['clase','redes','familia','deporte','amistad','trabajo en grupo'][i%6]}.`:''}`});return out;}

  function middleLangPool(){
    const prompts=[
      'Analiza el sujeto y el predicado de: «Los estudiantes organizaron el proyecto con cuidado».',
      'Escribe una oración con un pronombre, un adverbio y una preposición.',
      'Reescribe una generalización como «Nunca me sale bien» de forma más precisa.',
      'Escribe una frase con «sin embargo» y otra con «por tanto».',
      'Corrige la puntuación: «Cuando llegamos nadie sabia que hacer».',
      'Escribe una petición educada para solicitar una aclaración al profesor.',
      'Distingue en dos frases un hecho y una opinión sobre una película.',
      'Escribe una palabra compuesta y explica de qué dos palabras procede.',
      'Corrige: «e ido a ver si ay alguien».',
      'Escribe una frase con una palabra con b, otra con v y otra con h.',
      'Transforma una acusación en una observación concreta.',
      'Resume en dos frases un problema y una posible solución.'
    ];
    const out=[];for(let i=0;i<60;i++)out.push({id:`wml-${i}`,text:`${prompts[i%prompts.length]}${i>=prompts.length?` Variante ${Math.floor(i/prompts.length)+1}.`:''}`});return out;
  }
  function middleMathPool(){
    const out=[];for(let i=0;i<60;i++){if(i%5===0){const base=140+i*3,p=[10,15,20,25,30][i%5];out.push({id:`wmm-${i}`,text:`Calcula el ${p}% de ${base} y escribe la operación.`});}else if(i%5===1){const x=3+i%10,m=2+i%4,b=5+i%7;out.push({id:`wmm-${i}`,text:`Resuelve y comprueba: ${m}x + ${b} = ${m*x+b}.`});}else if(i%5===2){const n=5+i%12,d=[2,3,4,5][i%4];out.push({id:`wmm-${i}`,text:`Simplifica la fracción ${n*d}/${d} y explica el procedimiento.`});}else if(i%5===3){const u=3+i%5,price=5+i%8;out.push({id:`wmm-${i}`,text:`Si ${u} unidades cuestan ${u*price} €, calcula cuánto costarán 7 unidades.`});}else{const a=8+i%9,b=5+i%7;out.push({id:`wmm-${i}`,text:`Calcula el área y el perímetro de un rectángulo de ${a} cm por ${b} cm.`});}}return out;
  }

  function teenMathPool(){const out=[];for(let i=0;i<60;i++){if(i%3===0){const p=[12,15,18,22,25,30][i%6],base=120+i*4;out.push({id:`wtm-${i}`,text:`Calcula el ${p}% de ${base} y explica el procedimiento.`});}else if(i%3===1){const x=4+i%12,m=2+i%5,b=3+i%9;out.push({id:`wtm-${i}`,text:`Resuelve y comprueba: ${m}x + ${b} = ${m*x+b}.`});}else{const units=3+i%6,total=(units*(8+i%9));out.push({id:`wtm-${i}`,text:`Si ${units} unidades cuestan ${total} €, calcula el precio unitario y el coste de 5 unidades.`});}}return out;}

  function getPool(type,ctx){
    if(type==='geometry')return geometryPool();if(type==='language')return languagePool();if(type==='division')return divisionPool();if(type==='reading')return readingPool();if(type==='social')return socialPool(ctx.data);if(type==='middleLanguage')return middleLangPool();if(type==='middleMath')return middleMathPool();if(type==='middleReading')return readingPool();if(type==='teenLanguage')return teenLangPool();if(type==='teenMath')return teenMathPool();return [];
  }
  function takeUnique(pool,count,used){const available=shuffle(pool.filter(x=>!used.has(x.id)));const take=available.slice(0,count);take.forEach(x=>used.add(x.id));return take;}

  async function makeDoc(type,version,ctx,used){
    const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,Footer,PageBreak}=window.docx;
    const green='1F633B',green2='78A95C',light='EDF5E9',sand='F6F1E5',ink='173326',muted='607064',white='FFFFFF';
    const noBorders={top:{style:BorderStyle.NONE,size:0,color:white},bottom:{style:BorderStyle.NONE,size:0,color:white},left:{style:BorderStyle.NONE,size:0,color:white},right:{style:BorderStyle.NONE,size:0,color:white},insideHorizontal:{style:BorderStyle.NONE,size:0,color:white},insideVertical:{style:BorderStyle.NONE,size:0,color:white}};
    const title= type==='mixed'?'Ficha mixta': (ctx.meta[type]?.name||'Ficha de repaso');
    const header=new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorders,rows:[new TableRow({children:[new TableCell({width:{size:72,type:WidthType.PERCENTAGE},shading:{fill:light},margins:{top:180,bottom:180,left:220,right:160},children:[new Paragraph({children:[new TextRun({text:title.toUpperCase(),bold:true,size:40,color:green,font:'Aptos Display'})]}),new Paragraph({children:[new TextRun({text:`Versión ${version} · ${ctx.profile.ageBand==='teen'?'14+ años':ctx.profile.ageBand==='middle'?'12-13 años':'10-12 años'} · practica y revisa`,size:21,color:ink,font:'Aptos'})]})]}),new TableCell({width:{size:28,type:WidthType.PERCENTAGE},shading:{fill:green},margins:{top:150,bottom:150,left:100,right:100},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEVEL UP',bold:true,size:27,color:white,font:'Aptos'})]}),new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEARNING LAB',bold:true,size:13,color:'D9EAD3',font:'Aptos'})]})]})]})]});
    const name=new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorders,rows:[new TableRow({children:[new TableCell({shading:{fill:sand},margins:{top:130,bottom:130,left:180,right:180},children:[new Paragraph({children:[new TextRun({text:`Nombre: ${ctx.profile.name} ____________________    Fecha: __________________`,size:21,color:ink,font:'Aptos'})]})]})]})]});
    const q=(n,text,sub)=>[new Paragraph({spacing:{before:90,after:90,line:310},children:[new TextRun({text:`${n}. `,bold:true,size:23,color:green,font:'Aptos'}),new TextRun({text,size:23,color:ink,font:'Aptos'})]}),...(sub?[new Paragraph({spacing:{after:100},children:[new TextRun({text:sub,size:18,color:muted,font:'Aptos'})]})]:[]),new Paragraph({spacing:{after:120},children:[new TextRun({text:'____________________________________________________________________________',size:17,color:'B3BDB3'})]})];
    const children=[header,new Paragraph({text:' ',spacing:{after:30}}),name,new Paragraph({spacing:{before:210,after:100},children:[new TextRun({text:'RETO DE REPASO',bold:true,size:23,color:green,font:'Aptos'})]})];
    if(type==='reading'||type==='middleReading'){
      const pool=readingPool(), available=pool.filter(x=>!used.has(x.id));const passageIds=[...new Set(shuffle(available).map(x=>x.passage))].slice(0,2);let n=1;
      passageIds.forEach((pid,idx)=>{const qs=pool.filter(x=>x.passage===pid);qs.forEach(x=>used.add(x.id));const r=worksheetReadings[pid];children.push(new Paragraph({spacing:{before:idx?240:80,after:80},children:[new TextRun({text:r[0],bold:true,size:27,color:green,font:'Aptos'})]}));children.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:noBorders,rows:[new TableRow({children:[new TableCell({shading:{fill:sand},margins:{top:170,bottom:170,left:190,right:190},children:[new Paragraph({children:[new TextRun({text:r[1],size:22,color:ink,font:'Aptos'})],spacing:{line:330}})]})]})]}));r[2].forEach(question=>children.push(...q(n++,question)))});
    } else if(type==='mixed'){
      const types=ctx.data.subjects;let n=1;types.forEach(t=>{const p=getPool(t,ctx);takeUnique(p,3,used).forEach(it=>children.push(...q(n++,it.text||it.q||it.question,it.sub)))});
    } else {
      const count=type==='division'?12:10;const items=takeUnique(getPool(type,ctx),count,used);items.forEach((it,i)=>children.push(...q(i+1,it.text||it.q||it.question,it.sub)));
    }
    const footer=new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'LEVEL UP · Learning Lab  |  Comprueba tus respuestas antes de terminar',size:16,color:muted,font:'Aptos'})]})]});
    const doc=new Document({styles:{default:{document:{run:{font:'Aptos',size:22,color:ink},paragraph:{spacing:{line:300}}}}},sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:620,right:700,bottom:650,left:700}}},footers:{default:footer},children}]});
    return Packer.toBlob(doc);
  }

  async function generate(type,count,ctx){
    const status=document.querySelector('#docxStatus');if(!window.docx){status.textContent='No se ha cargado el generador DOCX. Comprueba la conexión a internet.';return;}if(count>1&&!window.JSZip){status.textContent='No se ha cargado el generador ZIP. Comprueba la conexión a internet.';return;}
    status.textContent=`Preparando ${count} versión${count>1?'es':''}…`;const used=new Set();
    try{
      if(count===1){const blob=await makeDoc(type,1,ctx,used);downloadBlob(blob,`LearningLab_${type}_v1.docx`);status.textContent='Ficha creada. Los ejercicios de la ficha proceden de un banco específico para casa.';return;}
      const zip=new JSZip();for(let i=1;i<=count;i++){const blob=await makeDoc(type,i,ctx,used);zip.file(`LearningLab_${type}_version_${i}.docx`,blob);}const out=await zip.generateAsync({type:'blob'});downloadBlob(out,`LearningLab_${type}_${count}_versiones.zip`);status.textContent=`Lote creado: ${count} DOCX distintos dentro de un ZIP. Se han evitado repeticiones dentro del lote mientras había banco disponible.`;
    }catch(e){console.error(e);status.textContent='No se pudo generar la ficha. Vuelve a intentarlo con conexión a internet.';}
  }
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
  window.WorksheetGenerator={generate};
})();

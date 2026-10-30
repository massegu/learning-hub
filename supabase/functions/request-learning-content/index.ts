import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

(globalThis as any).window = globalThis as any;
await import("./locale-content.js");
await import("./junior.js");
await import("./primary-content.js");
await import("./middle-content.js");
await import("./teen-review.js");
await import("./document-library.js");
await import("./reading-library.js");
await import("./photo-library.js");
await import("./content-quality.js");
await import("./transfer-content.js");
await import("./functional-content.js");
await import("./executed-tasks.js");
await import("./curriculum.js");
await import("./data/primary.js");
await import("./data/middle.js");
await import("./data/teen.js");
await import("./data/english.js");
await import("./data/literacy.js");

const DATA:any = (globalThis as any).LEARNING_DATA;
(globalThis as any).Curriculum.registerReasoning((age:string,level:number)=>{
  const root:any=globalThis;
  const bank=({junior:root.JuniorContent,primary:root.PrimaryContent,middle:root.MiddleContent,teen:root.TeenReview} as any)[age];
  return bank?bank.pool("speedReasoning",level):[];
});

(globalThis as any).Curriculum.registerWriting((age:string,level:number)=>{
  const root:any=globalThis,bank=({junior:root.JuniorContent,primary:root.PrimaryContent,middle:root.MiddleContent} as any)[age];
  return bank?bank.pool(age==='middle'?'middleLanguage':'language',level,'writing'):[];
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const LIMITS:any = {
  trial:{exercise:30, worksheet:2, game:30},
  active:{exercise:500, worksheet:50, game:500},
  past_due:{exercise:10, worksheet:1, game:10},
  cancelled:{exercise:1, worksheet:1, game:1},
  complimentary:{exercise:500, worksheet:50, game:500}
};

const SUBJECTS:any = {
  early:["social","language","division","reading","attention","executive","memory","speedReasoning","applied"],
  junior:["social","language","division","reading","attention","executive","memory","speedReasoning","applied"],
  primary:["social","geometry","language","division","reading","english","literacy","attention","executive","memory","speedReasoning","applied"],
  middle:["social","middleLanguage","middleMath","middleReading","english","literacy","attention","executive","memory","speedReasoning","applied"],
  teen:["teenLanguage","teenMath","social","english","literacy","attention","executive","memory","speedReasoning","applied"]
};

const THEMES:any = {
  early:["Animales","Parque","Colegio","Espacio","Aventuras"],
  junior:["Aventuras","Deporte","Animales","Viajes","Misterio"],
  primary:["Exploración espacial","Videojuegos de construcción","Animales increíbles","Fútbol","Misterio"],
  middle:["Gaming","Deporte","Música","Redes y creadores","Misterio"],
  teen:["Música","Series y cine","Viajes","Redes y creadores","Vida real"]
};

function todayUTC(){ return new Date().toISOString().slice(0,10); }
function pick<T=any>(arr:T[]):T { return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle<T=any>(arr:T[]):T[]{ return [...arr].sort(()=>Math.random()-.5); }
function keyOf(domain:string, sub:string|null, item:any){ return [domain,sub||"",item.id||JSON.stringify(item)].join(":"); }


const AGE_ACADEMIC:any={
  early:{
    language:[
      {id:"e-lang-1a",level:1,q:"¿Qué palabra nombra un animal?",opts:["gato","mesa","azul","correr"],a:"gato"},
      {id:"e-lang-1b",level:1,q:"Completa la frase: «La niña ___ un libro».",opts:["lee","verde","mesa","rápido"],a:"lee"},
      {id:"e-lang-2a",level:2,q:"¿Qué palabra significa casi lo mismo que «feliz»?",opts:["contento","enfadado","pequeño","rápido"],a:"contento"},
      {id:"e-lang-2b",level:2,scenario:"«Leo guardó el paraguas porque dejó de llover».",q:"¿Por qué guardó Leo el paraguas?",opts:["Porque dejó de llover","Porque era de noche","Porque tenía hambre","Porque llegó tarde"],a:"Porque dejó de llover"},
      {id:"e-lang-3a",level:3,scenario:"«Marta dejó la botella en la mesa y salió al patio. Cuando volvió, la botella seguía allí».",q:"¿Dónde encontró Marta la botella?",opts:["En la mesa","En el patio","En una mochila","No se sabe"],a:"En la mesa"},
      {id:"e-lang-3b",level:3,q:"Orden lógico: «se pone los zapatos / sale de casa / se pone los calcetines». ¿Qué ocurre primero?",opts:["Se pone los calcetines","Sale de casa","Se pone los zapatos","Da igual"],a:"Se pone los calcetines"}
    ],
    division:[
      {id:"e-math-1a",level:1,q:"¿Cuánto es 4 + 3?",opts:["6","7","8","9"],a:"7"},
      {id:"e-math-1b",level:1,q:"Tienes 8 pegatinas y regalas 2. ¿Cuántas quedan?",opts:["5","6","7","10"],a:"6"},
      {id:"e-math-2a",level:2,q:"¿Qué número continúa? 2, 4, 6, __",opts:["7","8","9","10"],a:"8"},
      {id:"e-math-2b",level:2,q:"Hay 3 cajas con 2 lápices en cada una. ¿Cuántos lápices hay?",opts:["5","6","7","8"],a:"6"},
      {id:"e-math-3a",level:3,q:"Tienes 12 cromos y los repartes por igual entre 3 personas. ¿Cuántos recibe cada una?",opts:["3","4","5","6"],a:"4"},
      {id:"e-math-3b",level:3,q:"Una actividad empieza a las 17:00 y dura 30 minutos. ¿A qué hora termina?",opts:["17:15","17:30","17:45","18:00"],a:"17:30"}
    ],
    reading:[
      {id:"e-read-1a",level:1,title:"La merienda",text:"Nora come una manzana y bebe agua.",q:"¿Qué fruta come Nora?",opts:["Manzana","Pera","Plátano","Naranja"],a:"Manzana"},
      {id:"e-read-1b",level:1,title:"El parque",text:"Hugo juega con una pelota roja.",q:"¿De qué color es la pelota?",opts:["Roja","Azul","Verde","Amarilla"],a:"Roja"},
      {id:"e-read-2a",level:2,title:"Antes de salir",text:"Mia mira por la ventana. Está lloviendo, así que coge su paraguas.",q:"¿Por qué coge el paraguas?",opts:["Porque llueve","Porque hace calor","Porque va a dormir","Porque tiene hambre"],a:"Porque llueve"},
      {id:"e-read-2b",level:2,title:"La biblioteca",text:"Leo devuelve un libro y después elige otro de animales.",q:"¿Qué hace primero Leo?",opts:["Devuelve un libro","Elige otro libro","Lee en casa","Compra un libro"],a:"Devuelve un libro"},
      {id:"e-read-3a",level:3,title:"La excursión",text:"El grupo sale a las nueve. Antes, todos revisan que llevan agua y gorra.",q:"¿Qué hacen antes de salir?",opts:["Revisan agua y gorra","Comen","Vuelven a casa","Juegan"],a:"Revisan agua y gorra"},
      {id:"e-read-3b",level:3,title:"La nota",text:"«He dejado tu cuaderno azul encima de la mesa. El rojo está en la mochila».",q:"¿Dónde está el cuaderno azul?",opts:["Encima de la mesa","En la mochila","Debajo de la mesa","No aparece"],a:"Encima de la mesa"}
    ]
  },
  junior:{
    language:[
      {id:"j-lang-1a",level:1,scenario:"«Clara terminó los deberes. Después preparó la mochila».",q:"¿Qué hizo Clara después de los deberes?",opts:["Preparó la mochila","Fue a dormir","Comió","Salió al parque"],a:"Preparó la mochila"},
      {id:"j-lang-1b",level:1,q:"¿Qué palabra completa mejor? «El perro estaba cansado, ___ se tumbó».",opts:["por eso","aunque","mientras","pero"],a:"por eso"},
      {id:"j-lang-2a",level:2,scenario:"«La calle estaba mojada y varias personas llevaban paraguas cerrados».",q:"¿Qué es razonable inferir?",opts:["Había llovido hace poco","Estaba nevando","Era de noche","Todos iban al colegio"],a:"Había llovido hace poco"},
      {id:"j-lang-2b",level:2,q:"¿Cuál es el mejor resumen de «Ana quería llegar pronto, así que preparó todo la noche anterior»?",opts:["Ana se organizó para ahorrar tiempo","Ana perdió sus cosas","Ana cambió de planes","Ana no quería salir"],a:"Ana se organizó para ahorrar tiempo"},
      {id:"j-lang-3a",level:3,scenario:"«El cartel dice: entrada gratuita hasta las 18:00. Después cuesta 4 €». Son las 17:45.",q:"¿Qué puedes concluir?",opts:["Todavía puede entrar gratis","Debe pagar 4 €","El lugar está cerrado","No se sabe la hora"],a:"Todavía puede entrar gratis"},
      {id:"j-lang-3b",level:3,scenario:"«Lucas dijo que llevaría el material si terminaba a tiempo. Llegó sin material y explicó que la actividad anterior se alargó».",q:"¿Qué interpretación es más prudente?",opts:["Es posible que no terminara a tiempo","Seguro que olvidó el material","No quería colaborar","Mintió"],a:"Es posible que no terminara a tiempo"}
    ],
    division:[
      {id:"j-math-1a",level:1,q:"¿Cuánto es 36 + 27?",opts:["53","63","73","62"],a:"63"},
      {id:"j-math-1b",level:1,q:"Un paquete tiene 5 pegatinas. ¿Cuántas hay en 4 paquetes?",opts:["9","15","20","25"],a:"20"},
      {id:"j-math-2a",level:2,q:"Tienes 24 cartas y las repartes por igual entre 6 personas. ¿Cuántas recibe cada una?",opts:["3","4","5","6"],a:"4"},
      {id:"j-math-2b",level:2,q:"Una entrada cuesta 7 €. Compras 3. ¿Cuánto pagas?",opts:["14 €","18 €","21 €","24 €"],a:"21 €"},
      {id:"j-math-3a",level:3,q:"Una película empieza a las 17:35 y dura 1 h 20 min. ¿A qué hora termina?",opts:["18:45","18:55","19:05","19:15"],a:"18:55"},
      {id:"j-math-3b",level:3,q:"Una camiseta costaba 30 € y tiene 5 € de descuento. ¿Cuál es el precio final?",opts:["20 €","25 €","30 €","35 €"],a:"25 €"}
    ],
    reading:[
      {id:"j-read-1a",level:1,title:"El entrenamiento",text:"El entrenamiento empieza a las cinco. Marta llega diez minutos antes para cambiarse.",q:"¿A qué hora llega Marta?",opts:["16:40","16:50","17:00","17:10"],a:"16:50"},
      {id:"j-read-1b",level:1,title:"El encargo",text:"«Compra pan y leche. Si no queda leche, trae yogur».",q:"¿Qué debe comprar si no queda leche?",opts:["Pan y yogur","Solo pan","Leche y yogur","Nada"],a:"Pan y yogur"},
      {id:"j-read-2a",level:2,title:"El mensaje",text:"«Nos vemos junto a la entrada principal a las 18:15. Si llueve, espera dentro del vestíbulo».",q:"Si llueve, ¿dónde debe esperar?",opts:["Dentro del vestíbulo","Fuera de la entrada","En casa","En una cafetería"],a:"Dentro del vestíbulo"},
      {id:"j-read-2b",level:2,title:"La tarea",text:"Nora tiene que entregar un trabajo el viernes. El miércoles termina el contenido y el jueves lo revisa.",q:"¿Qué hace Nora el jueves?",opts:["Revisa el trabajo","Empieza el contenido","Lo entrega","No hace nada"],a:"Revisa el trabajo"},
      {id:"j-read-3a",level:3,title:"Horario",text:"El museo abre a las 10:00. La visita guiada empieza a las 10:30 y dura 45 minutos. El taller comienza a las 11:30.",q:"¿Cuánto tiempo queda entre el final de la visita y el taller?",opts:["10 min","15 min","20 min","30 min"],a:"15 min"},
      {id:"j-read-3b",level:3,title:"Norma",text:"Para participar debes llevar autorización firmada y llegar antes de las 9:15. Alex trae autorización, pero llega a las 9:20.",q:"¿Qué requisito no cumple Alex?",opts:["La hora de llegada","La autorización","Los dos","Ninguno"],a:"La hora de llegada"}
    ]
  }
};

const AGE_ATTENTION:any={
  early:{
    1:[
      {key:"ea1",topic:"Atención visual",q:"¿Cuál de estos elementos es un animal?",opts:["🐶","🚲","📘","🍎"],a:"🐶"},
      {key:"ea2",topic:"Atención selectiva",q:"Busca el símbolo diferente: ⭐ ⭐ ⭐ 🌙",opts:["⭐","🌙","Los dos","Ninguno"],a:"🌙"},
      {key:"ea3",topic:"Seguimiento de consigna",q:"Elige únicamente el medio de transporte.",opts:["🍎","🚲","📘","🎧"],a:"🚲"}
    ],
    2:[
      {key:"ea4",topic:"Atención · doble criterio",q:"Elige el círculo ROJO.",opts:["🔴","🔵","🟥","🟢"],a:"🔴"},
      {key:"ea5",topic:"Atención · posición",scenario:"Fila: 🍎  📘  🚲  ⭐",q:"¿Qué está inmediatamente después del libro?",opts:["🍎","🚲","⭐","Nada"],a:"🚲"},
      {key:"ea6",topic:"Atención · comparación",q:"¿Qué pareja es exactamente igual?",opts:["AB-12 / AB-12","AB-12 / A8-12","AB-12 / AB-21","AB-12 / BA-12"],a:"AB-12 / AB-12"}
    ],
    3:[
      {key:"ea7",topic:"Atención · dos condiciones",q:"Elige la opción que sea AZUL y tenga forma de círculo.",opts:["🔵","🟦","🔴","🟢"],a:"🔵"},
      {key:"ea8",topic:"Atención · regla",scenario:"Regla: elige números pares.",q:"¿Cuál debes seleccionar?",opts:["3","5","8","9"],a:"8"},
      {key:"ea9",topic:"Atención funcional",scenario:"Lista: pan, leche, manzanas. En la cesta hay pan, leche, manzanas y jabón.",q:"¿Qué elemento no estaba en la lista?",opts:["Pan","Leche","Manzanas","Jabón"],a:"Jabón"}
    ]
  },
  junior:{
    1:[
      {key:"ja1",topic:"Atención selectiva",scenario:"Fila: 🎒 📘 🎧 ✏️",q:"¿Qué objeto no pertenece al material escolar?",opts:["🎒","📘","🎧","✏️"],a:"🎧"},
      {key:"ja2",topic:"Atención funcional",scenario:"Agenda: 16:00 merienda · 16:30 tarea · 17:15 deporte",q:"¿Qué actividad está entre la merienda y el deporte?",opts:["Tarea","Deporte","Merienda","Ninguna"],a:"Tarea"},
      {key:"ja3",topic:"Atención visual",q:"¿Cuál coincide exactamente con K7-M2?",opts:["K7-M2","K7-N2","K2-M7","M7-K2"],a:"K7-M2"}
    ],
    2:[
      {key:"ja4",topic:"Atención · doble criterio",scenario:"A) azul-7 · B) rojo-8 · C) azul-8 · D) verde-8",q:"Elige la opción que sea azul y par.",opts:["A","B","C","D"],a:"C"},
      {key:"ja5",topic:"Atención temporal",scenario:"Bus A 16:20 · Bus B 16:35 · Bus A 16:50 · Bus C 17:05",q:"¿Cuál es la segunda salida del Bus A?",opts:["16:20","16:35","16:50","17:05"],a:"16:50"},
      {key:"ja6",topic:"Atención a instrucciones",scenario:"Necesitas cuaderno, botella y llaves. Ves cuaderno, auriculares, botella y llaves.",q:"¿Qué objeto puedes ignorar?",opts:["Cuaderno","Auriculares","Botella","Llaves"],a:"Auriculares"}
    ],
    3:[
      {key:"ja7",topic:"Atención · cambio de regla",scenario:"Primera regla: elige letras. NUEVA regla: elige números impares.",q:"¿Qué opción cumple la nueva regla?",opts:["B","8","5","D"],a:"5"},
      {key:"ja8",topic:"Atención con restricciones",scenario:"Selecciona un archivo solo si es PDF, fue modificado hoy y contiene «final». A) final.pdf hoy · B) final.docx hoy · C) informe.pdf hoy · D) final.pdf ayer",q:"¿Cuál cumple todo?",opts:["A","B","C","D"],a:"A"},
      {key:"ja9",topic:"Atención funcional",scenario:"Cartel: taller 17:30 · sala 3 · inscripción antes del viernes.",q:"¿Qué dato indica cuándo empieza?",opts:["17:30","Sala 3","Viernes","Taller"],a:"17:30"}
    ]
  }
};

const AGE_EXEC:any={
  early:{
    1:[{key:"ee1",type:"order",topic:"Secuenciación · lavarse las manos",q:"Ordena los pasos.",tokens:["Abrir el grifo","Mojar las manos","Usar jabón","Aclarar y secar"],answer:["Abrir el grifo","Mojar las manos","Usar jabón","Aclarar y secar"]}],
    2:[{key:"ee2",type:"executiveDecision",topic:"Organización",scenario:"Tienes que guardar los lápices y después coger la mochila para salir.",q:"¿Qué haces primero?",opts:["Guardar los lápices","Salir sin mochila","Coger la mochila y dejar todo","Da igual"],a:"Guardar los lápices"}],
    3:[{key:"ee3",type:"executiveDecision",topic:"Planificación sencilla",scenario:"Tienes 15 minutos. Vestirte tarda 8 y preparar la mochila 5.",q:"¿Puedes hacer las dos cosas a tiempo?",opts:["Sí, sobran 2 minutos","No","Sobran 5 minutos","Solo puedes vestirte"],a:"Sí, sobran 2 minutos"}]
  },
  junior:{
    1:[{key:"je1",type:"order",topic:"Secuenciación · preparar una salida",q:"Ordena los pasos.",tokens:["Mirar qué necesitas","Preparar los objetos","Guardar todo en la mochila","Comprobar que no falta nada"],answer:["Mirar qué necesitas","Preparar los objetos","Guardar todo en la mochila","Comprobar que no falta nada"]}],
    2:[{key:"je2",type:"executiveDecision",topic:"Priorización",scenario:"Tienes 30 minutos. Una tarea para mañana tarda 20 y ordenar tu colección tarda 25.",q:"¿Qué conviene hacer primero?",opts:["La tarea para mañana","Ordenar la colección","Alternar cada minuto","No empezar nada"],a:"La tarea para mañana"}],
    3:[{key:"je3",type:"executiveDecision",topic:"Planificación con tiempo",scenario:"Debes salir en 40 minutos. Terminar una tarea tarda 25 y preparar lo necesario 10.",q:"¿Qué plan deja margen?",opts:["Tarea y después preparar lo necesario","Preparar cosas 20 min y luego empezar la tarea","Esperar 10 min","Hacer solo una"],a:"Tarea y después preparar lo necesario"}]
  }
};

const AGE_SPEED:any={
  early:{
    1:[{key:"es1",q:"¿Qué número es mayor?",opts:["4","7","3","2"],a:"7",topic:"Comparación rápida"},{key:"es2",q:"¿Qué símbolo es diferente? ● ● ▲ ●",opts:["●","▲","Los dos","Ninguno"],a:"▲",topic:"Discriminación visual"}],
    2:[{key:"es3",q:"Continúa: 2, 4, 6, __",opts:["7","8","9","10"],a:"8",topic:"Serie sencilla"},{key:"es4",q:"Regla: par = A, impar = B. ¿Qué corresponde a 6?",opts:["A","B","A y B","Ninguna"],a:"A",topic:"Aplicación de regla"}],
    3:[{key:"es5",q:"Si empiezas en 3 y sumas 2 dos veces, ¿dónde llegas?",opts:["5","6","7","8"],a:"7",topic:"Cálculo mental"},{key:"es6",q:"¿Cuál sigue? 5, 10, 15, __",opts:["18","20","22","25"],a:"20",topic:"Serie"}]
  },
  junior:{
    1:[{key:"js1",q:"Encuentra el código exactamente igual: B4-K7",opts:["B4-K7","B4-K1","K4-B7","B7-K4"],a:"B4-K7",topic:"Comparación rápida"}],
    2:[{key:"js2",q:"Regla: suma 2. Empiezas en 5 y aplicas la regla tres veces. ¿Resultado?",opts:["9","10","11","12"],a:"11",topic:"Aplicación de regla"}],
    3:[{key:"js3",q:"Serie: 4, 8, 16, __",opts:["20","24","28","32"],a:"32",topic:"Razonamiento · series"},{key:"js4",scenario:"Una actividad empieza a las 16:20 y dura 35 minutos.",q:"¿A qué hora termina?",opts:["16:45","16:55","17:05","17:15"],a:"16:55",topic:"Razonamiento temporal"}]
  }
};

const AGE_APPLIED:any={
  early:{
    1:[{key:"eap1",topic:"Rutina",scenario:"Antes de salir debes ponerte los zapatos y coger la mochila.",q:"¿Qué dos cosas necesitas hacer?",opts:["Ponerte los zapatos y coger la mochila","Comer y dormir","Leer y dibujar","Nada"],a:"Ponerte los zapatos y coger la mochila"}],
    2:[{key:"eap2",topic:"Organización",scenario:"Mañana necesitas un cuaderno azul. Tienes uno azul y uno rojo.",q:"¿Cuál preparas?",opts:["El azul","El rojo","Los dos siempre","Ninguno"],a:"El azul"}],
    3:[{key:"eap3",topic:"Tiempo",scenario:"Son las 17:00. Tardas 10 minutos en recoger y debes salir a las 17:15.",q:"¿Puedes recoger antes de salir?",opts:["Sí, sobran 5 minutos","No","Sobran 15 minutos","No se sabe"],a:"Sí, sobran 5 minutos"}]
  },
  junior:{
    1:[{key:"jap1",topic:"Organización",scenario:"Mañana tienes deporte. Necesitas ropa deportiva y agua.",q:"¿Qué estrategia reduce más los olvidos?",opts:["Prepararlo hoy y revisar","Recordarlo al salir","Preparar solo el agua","No hacer nada"],a:"Prepararlo hoy y revisar"}],
    2:[{key:"jap2",topic:"Gestión de tiempo",scenario:"Tienes 45 minutos. Una tarea tarda 25 y preparar la mochila 10.",q:"¿Cuánto margen queda?",opts:["5 min","10 min","15 min","20 min"],a:"10 min"}],
    3:[{key:"jap3",topic:"Decisión",scenario:"Debes entregar algo a las 18:00. Son las 17:10 y necesitas 35 min para terminar y 10 para revisar.",q:"¿Qué plan es mejor?",opts:["Empezar ya y revisar al final","Esperar hasta las 17:30","Hacer otra cosa primero","Entregar mañana"],a:"Empezar ya y revisar al final"}]
  }
};

function ageAttentionExercise(age:string,level:number,uid:string){
  const x=structuredClone(pick(AGE_ATTENTION[age][level]||AGE_ATTENTION[age][1]));
  return {...x,id:"age-att-"+uid,level,type:"attentionChoice",contentKey:x.key,mechanic:"age_attention_"+x.key};
}
function ageExecutiveExercise(age:string,level:number,uid:string){
  const x=structuredClone(pick(AGE_EXEC[age][level]||AGE_EXEC[age][1]));
  return {...x,id:"age-exec-"+uid,level,contentKey:x.key,mechanic:x.type||"age_executive"};
}
function ageSpeedExercise(age:string,level:number){
  const x=structuredClone(pick(AGE_SPEED[age][level]||AGE_SPEED[age][1]));
  return {...x,id:"age-speed-"+crypto.randomUUID(),level,type:"reasoning",contentKey:x.key};
}
function ageAppliedExercise(age:string,level:number){
  const x=structuredClone(pick(AGE_APPLIED[age][level]||AGE_APPLIED[age][1]));
  return {...x,id:"age-applied-"+crypto.randomUUID(),level,type:"appliedDecision",topic:"Cognición aplicada · "+x.topic,contentKey:x.key};
}
function ageMemoryExercise(age:string,level:number,uid:string){
  const early=age==="early";
  const items=early
    ? [["book","libro"],["pencil","lápiz"],["apple","manzana"],["backpack","mochila"],["bottle","botella"],["banana","plátano"]]
    : [["book","libro"],["phone","teléfono"],["keys","llaves"],["notebook","cuaderno"],["bottle","botella"],["sandwich","sándwich"],["map","mapa"],["backpack","mochila"]];
  const n=early?(level===1?2:level===2?3:4):(level===1?3:level===2?4:5);
  const shown=shuffle(items).slice(0,n);
  if(level===3){
    const target=pick(shown);
    const wrong=shuffle(items.filter((x:any)=>!shown.some((s:any)=>s[1]===x[1]))).slice(0,3);
    return {id:"age-mem-"+uid,level,type:"memoryReveal",topic:"Memoria visual",q:"Memoriza los elementos. Después desaparecerán.",memoryContent:shown.map((x:any)=>({icon:x[0],detail:x[1]})),memoryQuestion:"¿Cuál de estos elementos estaba en la lista?",opts:shuffle([target[1],...wrong.map((x:any)=>x[1])]),a:target[1],revealMs:early?4500:5500};
  }
  const target=pick(shown);
  const wrong=shuffle(items.filter((x:any)=>!shown.some((s:any)=>s[1]===x[1]))).slice(0,3);
  return {id:"age-mem-"+uid,level,type:"memoryReveal",topic:"Memoria visual",q:"Memoriza "+n+" elementos. Después desaparecerán.",memoryContent:shown.map((x:any)=>({icon:x[0],detail:x[1]})),memoryQuestion:"¿Cuál de estos elementos SÍ estaba?",opts:shuffle([target[1],...wrong.map((x:any)=>x[1])]),a:target[1],revealMs:early?4000:5000};
}

function academicPool(age:string, domain:string, subdomain:string|null, level:number){
  if((age==="early"||age==="junior") && AGE_ACADEMIC[age]?.[domain]){
    const bank=AGE_ACADEMIC[age][domain];
    const exact=bank.filter((x:any)=>(x.level||1)===level);
    return exact.length ? exact : bank.filter((x:any)=>(x.level||1)<=level);
  }
  const d=DATA?.[age];
  if(!d) return [];
  let bank=d[domain];
  if(domain==="language" && bank && !Array.isArray(bank)) bank=bank[subdomain||"grammar"]||[];
  if(!Array.isArray(bank)) return [];
  const exact=bank.filter((x:any)=>(x.level||1)===level);
  return exact.length ? exact : bank.filter((x:any)=>(x.level||1)<=level);
}


const ATTENTION_SCENE_TASKS:any = {
  1:[
    {theme:"Estudio",image:"assets/images/attention/attention_desk_01.webp",q:"Observa la escena. ¿Dónde está la mochila?",opts:["En el suelo, delante de la silla","Encima de la cama","Sobre el escritorio","No aparece"],a:"En el suelo, delante de la silla"},
    {theme:"Estudio",image:"assets/images/attention/attention_desk_01.webp",q:"¿Qué objeto está a la derecha del estuche?",opts:["Una botella","Una lámpara","Una mochila","Un libro"],a:"Una botella"}
  ],
  2:[
    {theme:"Desayuno",image:"assets/images/attention/attention_kitchen_02.webp",q:"Localiza las llaves y el recipiente de comida. ¿En qué mitad de la mesa están ambos?",opts:["En la mitad derecha","En la mitad izquierda","Uno en cada mitad","No aparecen"],a:"En la mitad derecha"},
    {theme:"Desayuno",image:"assets/images/attention/attention_kitchen_02.webp",q:"¿Qué objeto está más cerca de las llaves?",opts:["El recipiente verde","La taza","El cereal","La mochila"],a:"El recipiente verde"}
  ],
  3:[
    {theme:"Compra",image:"assets/images/attention/attention_market_03.webp",q:"Explora la escena completa. ¿Qué relación espacial es correcta?",opts:["La cesta está delante y los productos envasados a la derecha","La cesta está al fondo y la fruta a la derecha","La fruta está a la derecha de los envasados","La cesta está sobre una estantería"],a:"La cesta está delante y los productos envasados a la derecha"},
    {theme:"Compra",image:"assets/images/attention/attention_market_03.webp",q:"Atiende a dos zonas simultáneamente. ¿Dónde se concentra la fruta fresca y dónde la mayoría de productos envasados?",opts:["Fruta a la izquierda y envasados a la derecha","Fruta a la derecha y envasados a la izquierda","Ambos al fondo","Ambos en primer plano"],a:"Fruta a la izquierda y envasados a la derecha"}
  ]
};

const ATTENTION_ICON_SETS:any = {
  primary:[
    {theme:"Colegio",target:"book",label:"libros",near:["notebook","folder","pencilCase"],far:["pencil","backpack","bottle"]},
    {theme:"Merienda",target:"apple",label:"manzanas",near:["orange","strawberry","banana"],far:["cup","bread","bottle"]}
  ],
  middle:[
    {theme:"Estudio",target:"headphones",label:"auriculares",near:["musicNote","speaker","microphone"],far:["book","pencil","bottle"]},
    {theme:"Cocina",target:"cup",label:"tazas",near:["mug","glass","bowl"],far:["plate","apple","bottle"]}
  ],
  teen:[
    {theme:"Música",target:"headphones",label:"auriculares",near:["musicNote","speaker","microphone"],far:["musicNote","phone","book"]},
    {theme:"Viajes",target:"suitcase",label:"maletas",near:["backpack","briefcase","map"],far:["train","plane","ticket"]},
    {theme:"Cine",target:"camera",label:"cámaras",near:["clapper","screen","ticket"],far:["popcorn","phone","book"]}
  ]
};

const EXEC_SCENARIOS:any = {
  primary:[
    {theme:"Preparar la mochila",steps:["Mirar qué asignaturas hay","Elegir libros y cuadernos","Guardar estuche y carpeta","Añadir agua y merienda","Comprobar que no falta nada"],distractor:"Elegir una película"},
    {theme:"Preparar una merienda",steps:["Preparar los ingredientes","Preparar el pan","Añadir el relleno","Servir la merienda","Recoger lo utilizado"],distractor:"Guardar los zapatos"}
  ],
  middle:[
    {theme:"Organizar una tarde de deberes",steps:["Anotar todo lo que hay que hacer","Ordenar las tareas por prioridad","Preparar el material","Empezar por la tarea prioritaria","Revisar lo terminado"],distractor:"Cambiar el fondo del teléfono móvil"},
    {theme:"Preparar la mochila",steps:["Revisar el horario","Elegir el material necesario","Guardar cuadernos y estuche","Añadir agua o merienda","Comprobar que no falta nada"],distractor:"Buscar una serie para ver"}
  ],
  teen:[
    {theme:"Salir de casa con varios compromisos",steps:["Revisar agenda y horarios","Priorizar lo que hay que preparar","Reunir lo necesario para cada actividad","Comprobar las llaves, el teléfono móvil y la cartera","Revisar la ruta y hora de salida","Hacer una comprobación final"],distractor:"Ordenar las fotos del teléfono móvil"},
    {theme:"Organizar una tarde de estudio",steps:["Anotar tareas y plazos","Estimar cuánto tiempo necesita cada tarea","Ordenar las tareas por prioridad","Preparar el material","Trabajar según el plan","Revisar lo terminado y reajustar"],distractor:"Cambiar la foto de perfil"}
  ]
};

const EXEC_CONSTRAINTS:any = {
  primary:[
    {theme:"Preparar la salida",q:"Tienes 20 minutos antes de salir. Debes guardar la mochila (5 min), ponerte los zapatos (3 min) y recoger el escritorio (15 min). ¿Qué plan garantiza que estés listo a tiempo?",opts:["Mochila + zapatos y dejar el escritorio para después","Recoger primero el escritorio y luego hacer todo lo demás","Empezar por ordenar el escritorio y parar a los 10 min","Hacer las tres tareas completas"],a:"Mochila + zapatos y dejar el escritorio para después"}
  ],
  middle:[
    {theme:"Planificar el estudio",q:"Tienes un examen mañana y otro dentro de una semana. Dispones de 45 minutos hoy. ¿Cuál es la estrategia más razonable?",opts:["Dedicar la mayor parte al examen de mañana y reservar unos minutos para organizar el siguiente","Estudiar solo el examen de la semana próxima","Repartir exactamente el mismo tiempo sin considerar fechas","No estudiar y organizar solo el material"],a:"Dedicar la mayor parte al examen de mañana y reservar unos minutos para organizar el siguiente"},
    {theme:"Gestionar un imprevisto",q:"Tu plan era estudiar 40 minutos y después salir. Te avisan de que debes salir 15 minutos antes. ¿Qué ajuste conserva mejor el objetivo principal?",opts:["Reducir una tarea secundaria y mantener el bloque de estudio prioritario","Cancelar todo el estudio","Mantener el plan y llegar tarde","Añadir más tareas antes de salir"],a:"Reducir una tarea secundaria y mantener el bloque de estudio prioritario"}
  ],
  teen:[
    {theme:"Planificación temporal",q:"Debes salir a las 18:00. Son las 17:05. Tienes una tarea de 25 min, ducharte 15 min, preparar una mochila 10 min y necesitas 5 min de margen. ¿Cuál de estos órdenes cabe exactamente en el tiempo disponible?",opts:["Tarea → ducha → mochila → margen","Mochila → tarea → ducha → margen","Ducha → mochila → tarea → margen","Los tres órdenes anteriores"],a:"Los tres órdenes anteriores"},
    {theme:"Prioridades",q:"Tienes una entrega importante mañana y otra menos importante dentro de cuatro días. Además llega un mensaje no urgente. ¿Qué decisión protege mejor tus objetivos?",opts:["Priorizar la entrega de mañana y posponer el mensaje","Responder primero al mensaje y dejar ambas entregas","Trabajar primero en la entrega de cuatro días","Alternar cada cinco minutos entre las tres tareas"],a:"Priorizar la entrega de mañana y posponer el mensaje"}
  ]
};

const MEMORY_BANKS:any = {
  primary:[
    {theme:"Merienda",items:[["apple","manzana"],["sandwich","sándwich"],["bottle","agua"],["yogurt","yogur"],["banana","plátano"],["cookie","galleta"],["book","libro"],["pencil","lápiz"]]},
    {theme:"Recados",items:[["bread","comprar pan"],["book","llevar un libro"],["phone","llamar a Ana"],["medicine","pasar por la farmacia"],["keys","coger las llaves"],["map","mirar la ruta"],["bottle","llevar agua"],["notebook","llevar el cuaderno"]]}
  ],
  middle:[
    {theme:"Lista de compra",items:[["bread","pan"],["milk","leche"],["banana","plátanos"],["apple","manzanas"],["pasta","pasta"],["yogurt","yogur"],["eggs","huevos"],["juice","zumo"]]},
    {theme:"Tareas de la tarde",items:[["book","devolver un libro"],["phone","llamar a Marta"],["medicine","farmacia"],["keys","recoger unas llaves"],["map","revisar la ruta"],["notebook","llevar apuntes"],["bottle","comprar agua"],["bread","comprar pan"]]}
  ],
  teen:[
    {theme:"Lista de compra",items:[["bread","pan"],["milk","leche"],["banana","plátanos"],["apple","manzanas"],["pasta","pasta"],["yogurt","yogur"],["eggs","huevos"],["juice","zumo"]]},
    {theme:"Tareas y recados",items:[["book","devolver un libro"],["phone","llamar a Lucía"],["medicine","pasar por la farmacia"],["keys","recoger unas llaves"],["map","revisar la ruta"],["notebook","llevar unos apuntes"],["bottle","comprar agua"],["bread","comprar pan"]]}
  ]
};

const MEMORY_CONVERSATIONS:any = {
  teen:[
    {theme:"Cafetería",pairs:[["Álex","café"],["Marta","té"],["Lucía","sándwich"],["Diego","zumo"]]},
    {theme:"Trabajo en grupo",pairs:[["Noa","busca las imágenes"],["Hugo","prepara la introducción"],["Sara","revisa las fuentes"],["Leo","hace las diapositivas"]]},
    {theme:"Plan para el sábado",pairs:[["Irene","lleva las entradas"],["Pablo","mira la ruta"],["Clara","reserva la mesa"],["Nico","avisa al grupo"]]}
  ],
  middle:[
    {theme:"Trabajo en grupo",pairs:[["Ana","lleva cartulina"],["Leo","busca imágenes"],["Marta","escribe los títulos"],["Hugo","trae rotuladores"]]},
    {theme:"Plan de tarde",pairs:[["Sara","va a la biblioteca"],["Dani","entrena a las seis"],["Lucía","compra pan"],["Álex","llama a su abuelo"]]}
  ],
  primary:[
    {theme:"Encargos",pairs:[["Ana","lleva el cuaderno"],["Leo","coge el agua"],["Marta","guarda el estuche"],["Hugo","lleva la pelota"]]}
  ]
};

const MEMORY_ROUTES:any = {
  primary:[["Casa","Parque","Biblioteca","Panadería","Casa"],["Colegio","Parque","Casa","Tienda","Casa"]],
  middle:[["Casa","Biblioteca","Papelería","Polideportivo","Casa"],["Colegio","Tienda","Biblioteca","Casa","Parque"]],
  teen:[["Casa","Metro","Biblioteca","Cafetería","Cine","Casa"],["Instituto","Biblioteca","Tienda","Gimnasio","Metro","Casa"]]
};

function iconSearchExercise(age:string,level:number,uid:string){
  const sc=pick(ATTENTION_ICON_SETS[age]||ATTENTION_ICON_SETS.primary);
  if(level===1){
    const targetCount=4, size=18;
    const icons=Array.from({length:size},(_,i)=>i<targetCount?sc.target:pick(sc.far));
    return {id:"att-"+uid,level,type:"iconSearch",topic:"Atención selectiva · "+sc.theme,theme:sc.theme,q:"Cuenta únicamente "+sc.label+". Los demás elementos pertenecen a categorías diferentes.",target:sc.target,icons:shuffle(icons),opts:["3","4","5","6"],a:"4"};
  }
  if(level===2){
    const targetCount=6, size=30;
    const other=sc.near.filter((x:string)=>x!==sc.target);
    const icons=Array.from({length:size},(_,i)=>i<targetCount?sc.target:pick(other));
    return {id:"att-"+uid,level,type:"iconSearch",topic:"Atención selectiva con interferencia · "+sc.theme,theme:sc.theme,q:"Cuenta solo "+sc.label+". Todos los distractores son visual o semánticamente parecidos.",target:sc.target,icons:shuffle(icons),opts:["5","6","7","8"],a:"6"};
  }
  const partner=pick(sc.near.filter((x:string)=>x!==sc.target));
  const pairs:any[]=[];
  for(let i=0;i<24;i++){
    if(i<5) pairs.push([sc.target,partner]);
    else {
      const p=pick([[sc.target,pick(sc.far)],[pick(sc.near),pick(sc.far)],[pick(sc.far),partner],[pick(sc.near),pick(sc.near)]]);
      if(p[0]===sc.target&&p[1]===partner) p[1]=pick(sc.far);
      pairs.push(p);
    }
  }
  return {id:"att-"+uid,level,type:"pairSearch",topic:"Atención dividida · "+sc.theme,theme:sc.theme,q:"Cada tarjeta contiene dos elementos. Cuenta solo las tarjetas que cumplen simultáneamente los DOS criterios objetivo.",targetPair:[sc.target,partner],pairs:shuffle(pairs),opts:["4","5","6","7"],a:"5"};
}

function executiveExercise(age:string,level:number,uid:string){
  if(level===3){
    const sc=pick(EXEC_CONSTRAINTS[age]||EXEC_CONSTRAINTS.primary);
    return {id:"exec-"+uid,level,type:"executiveDecision",topic:"Planificación y toma de decisiones · "+sc.theme,theme:sc.theme,q:sc.q,opts:sc.opts,a:sc.a};
  }
  const sc=pick(EXEC_SCENARIOS[age]||EXEC_SCENARIOS.primary);
  const n=level===1?4:Math.min(5,sc.steps.length);
  const answer=sc.steps.slice(0,n);
  const tokens=level===2?shuffle([...answer,sc.distractor]):shuffle(answer);
  return {id:"exec-"+uid,level,type:"order",topic:(level===1?"Secuenciación":"Secuenciación con distractor")+" · "+sc.theme,theme:sc.theme,q:level===1?"Ordena los pasos de «"+sc.theme+"».":"Ordena los pasos necesarios para «"+sc.theme+"». Hay una acción que NO forma parte del plan: déjala sin seleccionar.",tokens,answer,distractor:level===2?sc.distractor:null};
}

function memoryExercise(age:string,level:number,uid:string){
  if(level===3){
    if(Math.random()<0.55){
      const sc=pick(MEMORY_CONVERSATIONS[age]||MEMORY_CONVERSATIONS.primary);
      const target=pick(sc.pairs);
      const wrong=sc.pairs.filter((x:any)=>x[0]!==target[0]).map((x:any)=>x[1]);
      return {id:"mem-"+uid,level,type:"memoryReveal",topic:"Memoria episódica · "+sc.theme,theme:sc.theme,q:"Memoriza quién se encarga de cada cosa. Después desaparecerá la información.",memoryContent:sc.pairs.map((x:any)=>({person:x[0],detail:x[1]})),memoryQuestion:"¿Qué correspondía a "+target[0]+"?",opts:shuffle([target[1],...wrong]).slice(0,4),a:target[1],revealMs:6500};
    }
    const route=pick(MEMORY_ROUTES[age]||MEMORY_ROUTES.primary);
    const idxTarget=2+Math.floor(Math.random()*(route.length-2));
    const target=route[idxTarget];
    return {id:"mem-"+uid,level,type:"memoryReveal",topic:"Memoria de recorridos",theme:"Recorrido",q:"Memoriza el recorrido en el orden mostrado.",memoryContent:route.map((x:string,i:number)=>({person:String(i+1),detail:x})),memoryQuestion:"¿Qué lugar aparecía inmediatamente antes de «"+target+"»?",opts:shuffle([...new Set([route[idxTarget-1],...route.filter((x:string)=>x!==route[idxTarget-1])])]).slice(0,4),a:route[idxTarget-1],revealMs:5500};
  }
  const sc=pick(MEMORY_BANKS[age]||MEMORY_BANKS.primary);
  if(level===1){
    const shown=shuffle(sc.items).slice(0,4);
    const target=pick(shown);
    const notShown=shuffle(sc.items.filter((x:any)=>!shown.some((s:any)=>s[1]===x[1]))).slice(0,3);
    return {id:"mem-"+uid,level,type:"memoryReveal",topic:"Memoria funcional · "+sc.theme,theme:sc.theme,q:"Memoriza estos cuatro elementos. Después desaparecerán.",memoryContent:shown.map((x:any)=>({icon:x[0],detail:x[1]})),memoryQuestion:"¿Cuál de estos elementos SÍ estaba en la información?",opts:shuffle([target[1],...notShown.map((x:any)=>x[1])]),a:target[1],revealMs:6500};
  }
  const shown=shuffle(sc.items).slice(0,5);
  const correct=shuffle(shown).slice(0,3);
  const notShown=shuffle(sc.items.filter((x:any)=>!shown.some((s:any)=>s[1]===x[1]))).slice(0,3);
  return {id:"mem-"+uid,level,type:"memoryMulti",topic:"Memoria funcional · "+sc.theme,theme:sc.theme,q:"Memoriza cinco elementos. Después tendrás que reconocer varios de ellos.",memoryContent:shown.map((x:any)=>({icon:x[0],detail:x[1]})),memoryQuestion:"Selecciona los TRES elementos que estaban en la información.",opts:shuffle([...correct,...notShown]).map((x:any)=>x[1]),answers:correct.map((x:any)=>x[1]),revealMs:6000};
}


const ATTENTION_DOCUMENT_TASKS:any = {
  1:[
    {key:"doc_train_gate",topic:"Atención funcional · billete de tren",q:"¿Desde qué andén sale el tren?",a:"Andén 4",opts:["Andén 2","Andén 4","Andén 7","Andén 9"],
     visual:'<div class="lh-doc ticket"><div class="doc-kicker">BILLETE DE TREN</div><div class="doc-route"><b>Central</b><span>→</span><b>Río Norte</b></div><div class="doc-grid"><span>Salida<br><b>16:40</b></span><span>Andén<br><b>4</b></span><span>Coche<br><b>6</b></span><span>Asiento<br><b>18A</b></span></div></div>'},
    {key:"doc_boarding_gate",topic:"Atención funcional · tarjeta de embarque",q:"¿Cuál es la puerta de embarque?",a:"B12",opts:["A12","B12","B21","C12"],
     visual:'<div class="lh-doc boarding"><div class="doc-kicker">TARJETA DE EMBARQUE</div><div class="doc-route"><b>Ciudad Azul</b><span>✈</span><b>Puerto Sol</b></div><div class="doc-grid"><span>Embarque<br><b>18:10</b></span><span>Puerta<br><b>B12</b></span><span>Fila<br><b>22</b></span><span>Asiento<br><b>22C</b></span></div></div>'},
    {key:"doc_event_time",topic:"Atención funcional · anuncio",q:"¿A qué hora empieza la actividad?",a:"17:30",opts:["16:30","17:00","17:30","18:30"],
     visual:'<div class="lh-doc poster"><div class="poster-icon">🎨</div><div><div class="doc-kicker">TALLER CREATIVO</div><h3>Sábado 12</h3><p>Inicio <b>17:30</b> · Sala 3</p><p>Entrada gratuita hasta completar aforo</p></div></div>'}
  ],
  2:[
    {key:"doc_invoice_due",topic:"Atención funcional · factura",q:"¿Cuál es la fecha límite de pago?",a:"18/10",opts:["08/10","12/10","18/10","28/10"],
     visual:'<div class="lh-doc invoice"><div class="doc-head"><div><div class="doc-kicker">FACTURA</div><b>#LH-2048</b></div><div>Fecha: 08/10</div></div><div class="doc-lines"><span>Material didáctico <b>18,00</b></span><span>Envío <b>3,50</b></span><span>Impuestos <b>4,52</b></span></div><div class="doc-total"><span>TOTAL</span><b>26,02</b></div><div class="doc-due">Pagar antes del <b>18/10</b></div></div>'},
    {key:"doc_flight_boarding",topic:"Atención funcional · vuelo",q:"El vuelo sale a las 09:15. ¿A qué hora comienza el embarque?",a:"08:35",opts:["08:15","08:35","08:55","09:05"],
     visual:'<div class="lh-doc boarding"><div class="doc-kicker">VUELO ZR 418</div><div class="doc-route"><b>Monte Claro</b><span>✈</span><b>Bahía Sur</b></div><div class="doc-grid"><span>Salida<br><b>09:15</b></span><span>Embarque<br><b>08:35</b></span><span>Puerta<br><b>C7</b></span><span>Asiento<br><b>14F</b></span></div></div>'},
    {key:"doc_ad_condition",topic:"Atención funcional · anuncio",q:"¿Qué condición debes cumplir para obtener la entrada reducida?",a:"Entrar antes de las 18:00",opts:["Comprar dos entradas","Entrar antes de las 18:00","Ir en grupo de cuatro","Reservar por teléfono"],
     visual:'<div class="lh-doc poster"><div class="poster-icon">🎬</div><div><div class="doc-kicker">CINE DE TARDE</div><h3>Sesión especial</h3><p><b>Entrada reducida</b> para quienes entren antes de las <b>18:00</b>.</p><p>Sesiones: 17:20 · 19:15 · 21:10</p></div></div>'}
  ],
  3:[
    {key:"doc_invoice_cross",topic:"Atención funcional · factura",q:"Quieres comprobar que el total coincide con los conceptos. ¿Qué cantidad resulta de sumar subtotal e impuestos?",a:"72,60",opts:["60,00","66,00","72,60","78,60"],
     visual:'<div class="lh-doc invoice"><div class="doc-head"><div><div class="doc-kicker">FACTURA DE SERVICIOS</div><b>#A-731</b></div><div>Vence: 22/10</div></div><div class="doc-lines"><span>Subtotal <b>60,00</b></span><span>Impuestos <b>12,60</b></span><span>Descuento ya aplicado <b>0,00</b></span></div><div class="doc-total"><span>TOTAL</span><b>72,60</b></div><div class="doc-due">Referencia: 731-22</div></div>'},
    {key:"doc_train_connection",topic:"Atención funcional · itinerario",q:"Llegas a Estación Centro a las 17:05 y el siguiente tren sale a las 17:22. ¿Cuántos minutos tienes para el transbordo?",a:"17 minutos",opts:["12 minutos","15 minutos","17 minutos","22 minutos"],
     visual:'<div class="lh-doc itinerary"><div class="doc-kicker">ITINERARIO</div><div class="trip-row"><b>16:20</b><span>Villa Norte → Estación Centro</span><b>17:05</b></div><div class="trip-row"><b>17:22</b><span>Estación Centro → Costa Azul</span><b>18:10</b></div><div class="doc-note">Cambio de tren en Estación Centro</div></div>'},
    {key:"doc_compare_departures",topic:"Atención dividida · horarios",q:"Necesitas salir después de las 15:30 y llegar antes de las 17:00. ¿Qué opción cumple ambas condiciones?",a:"Opción B",opts:["Opción A","Opción B","Opción C","Ninguna"],
     visual:'<div class="lh-doc timetable"><div class="doc-kicker">HORARIOS</div><div class="trip-row"><b>A</b><span>15:10 → 16:20</span><em>Directo</em></div><div class="trip-row"><b>B</b><span>15:45 → 16:55</span><em>Directo</em></div><div class="trip-row"><b>C</b><span>16:05 → 17:15</span><em>Directo</em></div></div>'}
  ]
};


ATTENTION_DOCUMENT_TASKS[1].push(
  {key:"doc_receipt_total",topic:"Atención funcional · ticket de compra",q:"¿Cuál es el total pagado?",a:"8,24 €",opts:["7,24 €","8,24 €","8,74 €","9,24 €"],
   visual:'<div class="lh-doc receipt"><div class="doc-kicker">MERCADO CENTRAL · TICKET</div><div class="receipt-row"><span>Pan</span><b>1,45 €</b></div><div class="receipt-row"><span>Leche</span><b>1,39 €</b></div><div class="receipt-row"><span>Fruta</span><b>4,40 €</b></div><div class="receipt-row discount"><span>Descuento</span><b>-1,00 €</b></div><div class="doc-total"><span>TOTAL</span><b>8,24 €</b></div></div>'},
  {key:"doc_offer_two_for_one",topic:"Atención funcional · catálogo de ofertas",q:"¿Qué producto tiene promoción 2x1?",a:"Yogur",opts:["Pasta","Yogur","Cereales","Jugo"],
   visual:'<div class="lh-doc catalog"><div class="doc-kicker">OFERTAS DE LA SEMANA</div><div class="catalog-grid"><div><b>🍝 Pasta</b><span>1,29 €</span></div><div class="offer"><b>🥛 Yogur</b><span>2,40 € · 2x1</span></div><div><b>🥣 Cereales</b><span>3,15 €</span></div><div><b>🧃 Jugo</b><span>1,75 €</span></div></div></div>'}
);
ATTENTION_DOCUMENT_TASKS[2].push(
  {key:"doc_catalog_discount",topic:"Atención funcional · folleto de supermercado",q:"¿Qué producto tiene un descuento del 20 %?",a:"Cereales",opts:["Pasta","Yogur","Cereales","Jugo"],
   visual:'<div class="lh-doc catalog"><div class="doc-kicker">FOLLETO DE OFERTAS</div><div class="catalog-grid"><div><b>🍝 Pasta</b><span>1,29 €</span></div><div><b>🥛 Yogur</b><span>2x1</span></div><div class="offer"><b>🥣 Cereales</b><span>3,15 € · -20 %</span></div><div><b>🧃 Jugo</b><span>1,75 €</span></div></div></div>'},
  {key:"doc_clothes_size",topic:"Atención funcional · tienda online",q:"¿Qué prenda está disponible en talla M y cuesta menos de 25 €?",a:"Camiseta City",opts:["Sudadera Urban","Camiseta City","Chaqueta Wave","Pantalón Loop"],
   visual:'<div class="lh-doc ecommerce"><div class="doc-kicker">NOVA · TIENDA ONLINE</div><div class="product-grid"><div><b>Sudadera Urban</b><span>29,99 €</span><small>S · L · M agotada</small></div><div class="offer"><b>Camiseta City</b><span>19,99 €</span><small>S · M · L</small></div><div><b>Chaqueta Wave</b><span>44,90 €</span><small>M · L</small></div><div><b>Pantalón Loop</b><span>27,50 €</span><small>S · M</small></div></div></div>'},
  {key:"doc_invoice_discount",topic:"Atención funcional · factura",q:"¿Qué concepto tiene aplicado el descuento?",a:"Material creativo",opts:["Material creativo","Envío","Impuestos","Ninguno"],
   visual:'<div class="lh-doc invoice"><div class="doc-head"><div><div class="doc-kicker">FACTURA #C-204</div><b>12/10</b></div><div>Cliente 184</div></div><div class="doc-lines"><span>Material creativo <b>24,00 € → 19,20 €</b></span><span>Envío <b>3,50 €</b></span><span>Impuestos <b>4,77 €</b></span></div><div class="doc-total"><span>TOTAL</span><b>27,47 €</b></div></div>'}
);
ATTENTION_DOCUMENT_TASKS[3].push(
  {key:"doc_catalog_budget",topic:"Atención aplicada · catálogo y presupuesto",q:"Tienes 5 €. ¿Qué pareja puedes comprar sin superar el presupuesto?",a:"Pasta + jugo",opts:["Pasta + jugo","Yogur + cereales","Cereales + jugo","Yogur + jugo"],
   visual:'<div class="lh-doc catalog"><div class="doc-kicker">COMPRA INTELIGENTE</div><div class="catalog-grid"><div><b>🍝 Pasta</b><span>1,80 €</span></div><div><b>🥛 Yogur</b><span>3,60 €</span></div><div><b>🥣 Cereales</b><span>4,25 €</span></div><div><b>🧃 Jugo</b><span>2,10 €</span></div></div><div class="doc-note">Presupuesto: 5,00 €</div></div>'},
  {key:"doc_clothes_filters",topic:"Atención aplicada · compra online",q:"Buscas una prenda azul, disponible en talla M y con precio inferior a 30 €. ¿Cuál cumple los tres criterios?",a:"Sudadera Metro",opts:["Sudadera Metro","Chaqueta Pixel","Camiseta Norte","Pantalón Base"],
   visual:'<div class="lh-doc ecommerce"><div class="doc-kicker">STUDIO 17 · CATÁLOGO</div><div class="product-grid"><div class="offer"><b>Sudadera Metro</b><span>Azul · 27,99 €</span><small>Tallas S · M · L</small></div><div><b>Chaqueta Pixel</b><span>Azul · 39,99 €</span><small>M · L</small></div><div><b>Camiseta Norte</b><span>Azul · 18,50 €</span><small>M agotada</small></div><div><b>Pantalón Base</b><span>Negro · 25,90 €</span><small>S · M · L</small></div></div></div>'},
  {key:"doc_receipt_compare",topic:"Atención aplicada · ticket y comparación",q:"¿Qué producto fue el más caro antes de aplicar el descuento?",a:"Detergente",opts:["Pan","Fruta","Detergente","Jugo"],
   visual:'<div class="lh-doc receipt"><div class="doc-kicker">SUPERMERCADO · TICKET</div><div class="receipt-row"><span>Pan</span><b>1,60 €</b></div><div class="receipt-row"><span>Fruta</span><b>3,25 €</b></div><div class="receipt-row"><span>Detergente</span><b>6,80 €</b></div><div class="receipt-row"><span>Jugo</span><b>2,40 €</b></div><div class="receipt-row discount"><span>Descuento detergente</span><b>-1,50 €</b></div><div class="doc-total"><span>TOTAL</span><b>12,55 €</b></div></div>'}
);

const ATTENTION_ILLUSTRATED_SCENES:any={
  1:[
    {key:"festival_camera",image:"assets/v16_6/festival_scene.svg",topic:"Búsqueda visual · festival ilustrado",q:"Localiza la cámara roja que aparece junto al puesto de bebidas. ¿En qué zona está?",opts:["A2","B3","C1","C4"],a:"B3"},
    {key:"room_headphones",image:"assets/v16_6/creative_room.svg",topic:"Búsqueda visual · habitación creativa",q:"Encuentra los auriculares que están junto a la mochila amarilla. ¿En qué zona están?",opts:["A1","A4","B2","C3"],a:"A4"}
  ],
  2:[
    {key:"festival_cap_board",image:"assets/v16_6/festival_scene.svg",topic:"Atención visual · festival ilustrado",q:"Busca a la persona con gorra amarilla que lleva un monopatín. ¿En qué zona está?",opts:["A1","B1","B4","C2"],a:"B4"},
    {key:"room_book_lamp",image:"assets/v16_6/creative_room.svg",topic:"Atención visual · habitación creativa",q:"¿En qué zona está el libro abierto situado debajo de una lámpara?",opts:["A2","B1","B4","C4"],a:"B1"}
  ],
  3:[
    {key:"festival_three_rules",image:"assets/v16_6/festival_scene.svg",topic:"Atención selectiva · escena compleja",q:"Localiza a la persona que lleva gafas, sostiene un teléfono y está a la izquierda de una mochila verde. ¿En qué zona está?",opts:["A3","B2","C2","C4"],a:"C2"},
    {key:"room_three_rules",image:"assets/v16_6/creative_room.svg",topic:"Atención selectiva · escena compleja",q:"Encuentra el objeto que está sobre una mesa, junto a un cuaderno y debajo de un póster. ¿En qué zona está?",opts:["A2","B2","B4","C3"],a:"B2"}
  ]
};
function attentionIllustratedExercise(level:number,uid:string){
  const x=structuredClone(pick(ATTENTION_ILLUSTRATED_SCENES[level]||ATTENTION_ILLUSTRATED_SCENES[1]));
  return {...x,id:"att-illustrated-"+uid,level,type:"sceneAttention",mechanic:"illustrated_"+x.key,contentKey:"illustrated:"+x.key,why:"La respuesta se obtiene explorando la escena y combinando únicamente los rasgos indicados."};
}

function attentionDocumentExercise(level:number,uid:string){
  const x=structuredClone(pick(ATTENTION_DOCUMENT_TASKS[level]||ATTENTION_DOCUMENT_TASKS[1]));
  return {...x,id:"att-doc-"+uid,level,type:"attentionDocument",mechanic:"document_"+x.key,contentKey:x.key,why:x.why||"La respuesta exige localizar y usar la información relevante del documento."};
}

function attentionSearchBoard(age:string,level:number,uid:string){
  const child=["early","junior","primary"].includes(age);
  const sets=child
    ? [["🚀","🪐","⭐","👾","🌙","🛸","☄️","🤖"],["🐼","🦊","🐸","🦁","🐯","🐨","🦄","🐙"]]
    : [["🎧","🎬","📷","🎟️","🎤","🎸","📱","💿"],["🧳","🗺️","🚆","✈️","🎒","📷","🎫","🧭"]];
  const icons=pick(sets);
  const cols=level===1?4:level===2?5:6, rows=4, total=cols*rows;
  const targetIcon=pick(icons), partner=pick(icons.filter((x:string)=>x!==targetIcon));
  const targetIndex=Math.floor(Math.random()*total);
  const cells:any[]=[];
  for(let i=0;i<total;i++){
    if(i===targetIndex){
      cells.push(level===1?[targetIcon]:[targetIcon,partner]);
    }else if(level===1){
      cells.push([pick(icons.filter((z:string)=>z!==targetIcon))]);
    }else{
      let a=pick(icons),b=pick(icons);
      if(a===targetIcon&&b===partner) b=pick(icons.filter((z:string)=>z!==partner));
      cells.push([a,b]);
    }
  }
  const row=Math.floor(targetIndex/cols), col=targetIndex%cols;
  const cell=String.fromCharCode(65+row)+String(col+1);
  const options=shuffle([cell,
    String.fromCharCode(65+((row+1)%rows))+String(col+1),
    String.fromCharCode(65+row)+String(((col+1)%cols)+1),
    String.fromCharCode(65+((row+2)%rows))+String(((col+2)%cols)+1)
  ]);
  const board=cells.map((pair:any[],i:number)=>{
    const r=Math.floor(i/cols),cc=i%cols;
    return '<div class="search-cell"><small>'+String.fromCharCode(65+r)+String(cc+1)+'</small><span>'+pair.join(" ")+'</span></div>';
  }).join("");
  const question=level===1
    ? "Busca visualmente "+targetIcon+". ¿En qué casilla está?"
    : "Busca la única casilla donde "+targetIcon+" aparece junto a "+partner+". ¿Cuál es?";
  return {id:"att-board-"+uid,level,type:"attentionSearchBoard",mechanic:"search_and_find_"+(child?"youth":"teen"),contentKey:"board:"+level+":"+targetIcon+":"+partner+":"+cell,topic:child?"Búsqueda visual · reto ilustrado":"Búsqueda visual · exploración",q:question,visual:'<div class="search-board cols-'+cols+'">'+board+'</div>',opts:options,a:cell,why:"El objetivo aparece únicamente en la casilla "+cell+"."};
}


function attentionComicScene(age:string,level:number,uid:string){
  const child=age==="primary";
  const scenes=child?[
    {name:"Misión espacial",bg1:"#DFF7FF",bg2:"#FFF0D8",things:["🚀","🤖","🪐","⭐","👾","🌙","🛸","☄️"]},
    {name:"Ciudad de aventuras",bg1:"#FFF1F4",bg2:"#E7F7F2",things:["🛹","🎒","🐱","🍦","🚲","🎈","📚","🎧"]},
    {name:"Bosque fantástico",bg1:"#F3E8FF",bg2:"#E9F8DF",things:["🦊","🦉","🍄","🌲","🦋","🪵","🌙","✨"]}
  ]:[
    {name:"Festival urbano",bg1:"#E6F8F4",bg2:"#FFF0EA",things:["🎧","🎤","🎸","📷","🎟️","🛹","🧢","📱"]},
    {name:"Viaje ilustrado",bg1:"#E8F4FF",bg2:"#FFF3D9",things:["🧳","🗺️","🚆","✈️","🎒","📷","🎫","🧭"]},
    {name:"Estudio creativo",bg1:"#F3ECFF",bg2:"#EAF7FF",things:["🖊️","🎨","📓","💻","🎧","📷","☕","🪴"]}
  ];
  const sc=structuredClone(pick(scenes));
  const cols=level===1?4:level===2?5:6, rows=3, total=cols*rows;
  const target=pick(sc.things), companion=pick(sc.things.filter((x:string)=>x!==target));
  const targetIndex=Math.floor(Math.random()*total);
  const cards:any[]=[];
  for(let i=0;i<total;i++){
    let a=pick(sc.things),b=pick(sc.things);
    if(i===targetIndex){a=target;b=level===1?pick(sc.things.filter((x:string)=>x!==target)):companion;}
    else if(level===1 && (a===target||b===target)){a=pick(sc.things.filter((x:string)=>x!==target));b=pick(sc.things.filter((x:string)=>x!==target));}
    else if(level>1 && a===target&&b===companion){b=pick(sc.things.filter((x:string)=>x!==companion));}
    cards.push([a,b]);
  }
  const row=Math.floor(targetIndex/cols), col=targetIndex%cols, cell=String.fromCharCode(65+row)+String(col+1);
  const distractors=[
    String.fromCharCode(65+((row+1)%rows))+String(col+1),
    String.fromCharCode(65+row)+String(((col+1)%cols)+1),
    String.fromCharCode(65+((row+2)%rows))+String(((col+2)%cols)+1)
  ].filter((x:string,i:number,a:string[])=>x!==cell&&a.indexOf(x)===i);
  while(distractors.length<3){const rr=Math.floor(Math.random()*rows),cc=Math.floor(Math.random()*cols),v=String.fromCharCode(65+rr)+String(cc+1);if(v!==cell&&!distractors.includes(v))distractors.push(v);}
  const visual='<div class="comic-scene" style="--comic1:'+sc.bg1+';--comic2:'+sc.bg2+'"><div class="comic-title">'+sc.name+'</div><div class="comic-grid cols-'+cols+'">'+cards.map((pair:any[],i:number)=>{const r=Math.floor(i/cols),cc=i%cols;return '<div class="comic-panel"><small>'+String.fromCharCode(65+r)+String(cc+1)+'</small><span>'+pair.join(" ")+'</span><i></i></div>';}).join("")+'</div></div>';
  const q=level===1
    ? "Encuentra la única viñeta donde aparece "+target+". ¿Cuál es?"
    : "Encuentra la única viñeta donde "+target+" aparece junto a "+companion+". ¿Cuál es?";
  return {id:"att-comic-"+uid,level,type:"attentionComicScene",mechanic:"comic_scene_"+sc.name.replace(/\s+/g,"_"),contentKey:"comic:"+sc.name+":"+level+":"+target+":"+companion+":"+cell,topic:"Búsqueda visual · escena ilustrada",q,visual,opts:shuffle([cell,...distractors]),a:cell,why:"El objetivo aparece únicamente en la viñeta "+cell+"."};
}


function attentionDoodleScene(age:string,level:number,uid:string){
  const cols=6, rows=level===1?3:4, W=900, H=rows*118+68;
  const themes=[
    {name:"Festival creativo",sky:"#E8F8F6",ground:"#FFF3DE",accent:"#FF6B6B"},
    {name:"Plaza de aventuras",sky:"#EEF7FF",ground:"#FFF7E8",accent:"#2EC4B6"},
    {name:"Campamento fantástico",sky:"#F4EEFF",ground:"#F2F8E9",accent:"#FFD166"}
  ];
  const th=structuredClone(pick(themes));
  const shirts=["#2EC4B6","#FF6B6B","#FFD166","#59B8FF","#9B7EDE","#FF9F66"];
  const bags=["#E45757","#2F7D8C","#7A5CC8","#F0B43C"];
  const hats=["#FFD166","#FF6B6B","#2EC4B6","#59B8FF"];
  const targetIndex=Math.floor(Math.random()*(cols*rows));
  const target={shirt:pick(shirts),bag:pick(bags),hat:pick(hats),glasses:true};
  const people:any[]=[];
  for(let i=0;i<cols*rows;i++){
    if(i===targetIndex){people.push({...target});continue;}
    let p:any={shirt:pick(shirts),bag:pick(bags),hat:Math.random()<.55?pick(hats):null,glasses:Math.random()<.42};
    // Permit shared features, but never the full target combination.
    if(p.shirt===target.shirt&&p.bag===target.bag&&p.hat===target.hat&&p.glasses===target.glasses){
      p.bag=pick(bags.filter((x:string)=>x!==target.bag));
    }
    people.push(p);
  }
  const zone=(idx:number)=>String.fromCharCode(65+Math.floor(idx/cols))+String(idx%cols+1);
  const answer=zone(targetIndex);
  const featureText=level===1
    ? "gorra "+target.hat+" y camiseta "+target.shirt
    : level===2
      ? "gorra "+target.hat+", gafas y mochila "+target.bag
      : "camiseta "+target.shirt+", gorra "+target.hat+", gafas y mochila "+target.bag;
  const readable=(hex:string)=>{
    const map:any={"#FFD166":"amarilla","#FF6B6B":"coral","#2EC4B6":"turquesa","#59B8FF":"azul","#9B7EDE":"violeta","#FF9F66":"naranja","#E45757":"roja","#2F7D8C":"azul petróleo","#7A5CC8":"morada","#F0B43C":"mostaza"};
    return map[hex]||hex;
  };
  const q=level===1
    ? "Busca en la escena a la persona con gorra "+readable(target.hat)+" y camiseta "+readable(target.shirt)+". ¿En qué zona está?"
    : level===2
      ? "Encuentra a la persona que lleva gorra "+readable(target.hat)+", gafas y mochila "+readable(target.bag)+". ¿En qué zona está?"
      : "Localiza a la única persona con camiseta "+readable(target.shirt)+", gorra "+readable(target.hat)+", gafas y mochila "+readable(target.bag)+". ¿En qué zona está?";
  const personSvg=(p:any,x:number,y:number,i:number)=>{
    const hat=p.hat?'<path d="M '+(x+35)+' '+(y+26)+' q 15 -18 30 0 l 8 3 h -46 z" fill="'+p.hat+'" stroke="#183153" stroke-width="2"/>':'';
    const glasses=p.glasses?'<g stroke="#183153" stroke-width="2" fill="none"><circle cx="'+(x+48)+'" cy="'+(y+42)+'" r="6"/><circle cx="'+(x+64)+'" cy="'+(y+42)+'" r="6"/><path d="M'+(x+54)+' '+(y+42)+'h4"/></g>':'';
    return '<g>'+
      '<text x="'+(x+7)+'" y="'+(y+14)+'" font-size="11" font-weight="800" fill="#6B7A90">'+zone(i)+'</text>'+
      '<ellipse cx="'+(x+56)+'" cy="'+(y+91)+'" rx="28" ry="5" fill="#183153" opacity=".08"/>'+
      '<circle cx="'+(x+56)+'" cy="'+(y+42)+'" r="19" fill="#F2C7A5" stroke="#183153" stroke-width="2"/>'+hat+glasses+
      '<path d="M '+(x+41)+' '+(y+59)+' q 15 -8 30 0 v 31 h -30 z" fill="'+p.shirt+'" stroke="#183153" stroke-width="2"/>'+
      '<rect x="'+(x+68)+'" y="'+(y+64)+'" width="14" height="24" rx="5" fill="'+p.bag+'" stroke="#183153" stroke-width="2"/>'+
      '<path d="M'+(x+47)+' '+(y+90)+'v13M'+(x+65)+' '+(y+90)+'v13" stroke="#183153" stroke-width="4" stroke-linecap="round"/>'+
      '</g>';
  };
  const deco='<g opacity=".9"><circle cx="82" cy="45" r="23" fill="#FFF"/><circle cx="105" cy="45" r="17" fill="#FFF"/><path d="M760 48 q 28 -34 55 0 q 25 -20 44 5" fill="none" stroke="#FFF" stroke-width="16" stroke-linecap="round"/><path d="M40 '+(H-20)+' q70 -50 140 0M690 '+(H-18)+' q65 -55 145 0" fill="none" stroke="'+th.accent+'" stroke-width="12" opacity=".22"/></g>';
  const peopleMarkup=people.map((p:any,i:number)=>{
    const r=Math.floor(i/cols),cc=i%cols;
    const x=cc*145+20+(r%2?10:0), y=r*112+72;
    return personSvg(p,x,y,i);
  }).join("");
  const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+th.name+'"><rect width="'+W+'" height="'+H+'" rx="28" fill="'+th.sky+'"/><path d="M0 '+(H*.72)+' Q200 '+(H*.62)+' 430 '+(H*.73)+' T900 '+(H*.68)+' V'+H+' H0Z" fill="'+th.ground+'"/>'+deco+'<rect x="22" y="18" rx="16" width="210" height="36" fill="#183153"/><text x="40" y="42" fill="#fff" font-size="16" font-weight="900">'+th.name.toUpperCase()+'</text>'+peopleMarkup+'</svg>';
  const opts=shuffle([answer,zone((targetIndex+5)%(cols*rows)),zone((targetIndex+7)%(cols*rows)),zone((targetIndex+11)%(cols*rows))].filter((x:string,i:number,a:string[])=>a.indexOf(x)===i));
  while(opts.length<4){const z=zone(Math.floor(Math.random()*(cols*rows)));if(!opts.includes(z))opts.push(z);}
  return {id:"att-doodle-"+uid,level,type:"attentionDoodleScene",mechanic:"doodle_scene_"+th.name.replace(/\s+/g,"_"),contentKey:"doodle:"+level+":"+th.name+":"+answer+":"+target.shirt+":"+target.bag+":"+target.hat,topic:"Búsqueda visual · escena ilustrada",q,visual:'<div class="doodle-scene">'+svg+'</div>',opts,a:answer,why:"La combinación completa de rasgos aparece únicamente en la zona "+answer+"."};
}

function cognitionExercise(age:string,domain:string,level:number){
  const uid=crypto.randomUUID();
  if(age==="early"||age==="junior"){
    if(domain==="attention") return ageAttentionExercise(age,level,uid);
    if(domain==="memory") return ageMemoryExercise(age,level,uid);
    return ageExecutiveExercise(age,level,uid);
  }
  if(domain==="attention"){
    const roll=Math.random();
    if(roll<0.34) return attentionDocumentExercise(level,uid);
    if(roll<0.56) return attentionSearchBoard(age,level,uid);
    if(roll<0.70) return attentionComicScene(age,level,uid);
    if(roll<0.80){
      const sc=pick(ATTENTION_SCENE_TASKS[level]||ATTENTION_SCENE_TASKS[1]);
      return {id:"att-scene-"+uid,level,type:"sceneAttention",mechanic:"scene_search_"+sc.theme,contentKey:"scene:"+level+":"+sc.q,topic:"Atención en contexto · "+sc.theme,theme:sc.theme,image:sc.image,q:sc.q,opts:sc.opts,a:sc.a};
    }
    const x=structuredClone(pick(V13_ATTENTION_BANK[level]||V13_ATTENTION_BANK[1]));
    return {...x,id:"att-v167-"+uid,level,contentKey:x.key,mechanic:(x.mechanic||"choice")+"_"+x.key};
  }
  if(domain==="memory") return memoryExercise(age,level,uid);
  return executiveExerciseV14(age,level,uid);
}



const SPEED_REASONING_BANK:any = {
  1:[
    {key:"code_exact_1",type:"codeMatch",topic:"Velocidad de procesamiento · comparación",model:"A7K2",q:"Encuentra el código exactamente igual al modelo.",opts:["A7K2","A7KZ","A2K7","A7R2","K7A2","A7K3"],a:"A7K2",why:"Hay que comparar los cuatro caracteres y su posición."},
    {key:"code_exact_2",type:"codeMatch",topic:"Velocidad de procesamiento · comparación",model:"M4R8",q:"Encuentra el código exactamente igual al modelo.",opts:["M4R8","M4B8","M8R4","N4R8","M4R3","R4M8"],a:"M4R8",why:"La coincidencia debe ser exacta, no solo parecida."},
    {key:"odd_pair_1",type:"reasoning",topic:"Discriminación visual",q:"¿Qué pareja NO sigue la misma regla que las demás?",opts:["AA-11","BB-22","CC-33","DD-34"],a:"DD-34",why:"En las tres primeras parejas las dos letras y los dos números se repiten."},
    {key:"symbol_count_1",type:"reasoning",topic:"Velocidad y selección",q:"En la secuencia ★ ○ ★ △ ★ ○ △ ★, ¿cuántas estrellas hay?",opts:["3","4","5","6"],a:"4",why:"Hay cuatro apariciones del símbolo ★."},
    {key:"quick_rule_1",type:"reasoning",topic:"Aplicación de regla",q:"Regla: si el número es par, elige A; si es impar, elige B. ¿Qué corresponde al 17?",opts:["A","B","A y B","No puede saberse"],a:"B",why:"17 es impar."}
  ],
  2:[
    {key:"pattern_unique_1",type:"patternCompare",topic:"Velocidad y discriminación visual",modelSequence:["▲","●","■","▲","●"],q:"Observa el modelo. ¿Qué fila es exactamente igual?",rows:[["▲","●","■","▲","◆"],["▲","●","■","●","▲"],["●","▲","■","▲","●"],["▲","●","■","▲","●"]],opts:["Fila 1","Fila 2","Fila 3","Fila 4"],a:"Fila 4",why:"Solo la fila 4 conserva los cinco símbolos en el mismo orden."},
    {key:"pattern_unique_2",type:"patternCompare",topic:"Velocidad y discriminación visual",modelSequence:["◆","○","◆","△","■"],q:"Observa el modelo. ¿Qué fila es exactamente igual?",rows:[["◆","○","◆","△","□"],["◆","○","△","◆","■"],["◆","○","◆","△","■"],["○","◆","◆","△","■"]],opts:["Fila 1","Fila 2","Fila 3","Fila 4"],a:"Fila 3",why:"Solo la fila 3 coincide símbolo por símbolo."},
    {key:"table_lookup_1",type:"reasoning",topic:"Búsqueda rápida en tabla",scenario:"Código de taquillas: A1=12 · A2=18 · B1=25 · B2=31 · C1=44 · C2=52",q:"¿Qué número corresponde a B2?",opts:["25","31","44","52"],a:"31",why:"En la tabla, B2 está asociado a 31."},
    {key:"double_rule_1",type:"reasoning",topic:"Clasificación por dos criterios",q:"Regla: elige X si el número es PAR y mayor que 10. ¿Cuál cumple la regla?",opts:["8","11","14","9"],a:"14",why:"14 es par y además es mayor que 10."},
    {key:"sequence_scan_1",type:"reasoning",topic:"Comparación de secuencias",q:"¿Cuál de estas secuencias difiere del modelo 4-7-2-9-5 en una sola posición?",opts:["4-7-2-9-5","4-7-2-6-5","4-2-7-9-5","4-7-9-2-5"],a:"4-7-2-6-5",why:"Solo cambia el cuarto elemento."},
    {key:"filter_rule_1",type:"reasoning",topic:"Selección con interferencia",q:"Selecciona el único elemento que cumple: letra M y número impar.",opts:["M4","N3","M7","R9"],a:"M7",why:"M7 cumple simultáneamente ambos criterios."}
  ],
  3:[
    {key:"series_1",type:"reasoning",topic:"Razonamiento · series",q:"Serie: 3, 6, 12, 24, __",opts:["30","36","42","48"],a:"48",why:"Cada término se multiplica por 2."},
    {key:"series_2",type:"reasoning",topic:"Razonamiento · series",q:"Serie: 2, 5, 11, 23, __",opts:["35","46","47","48"],a:"47",why:"Cada término es el anterior ×2 +1."},
    {key:"logic_1",type:"reasoning",topic:"Razonamiento lógico",q:"Todos los participantes del taller tienen acreditación. Elena participa en el taller. ¿Qué podemos concluir?",opts:["Elena tiene acreditación","Elena organiza el taller","Elena llegó temprano","No puede concluirse nada"],a:"Elena tiene acreditación",why:"La conclusión se deriva directamente de las dos premisas."},
    {key:"logic_2",type:"reasoning",topic:"Razonamiento lógico",q:"Ningún archivo privado puede compartirse públicamente. Este archivo es privado. ¿Qué se deduce?",opts:["Puede compartirse si es urgente","No debe compartirse públicamente","Debe borrarse","Puede compartirse con cualquiera"],a:"No debe compartirse públicamente",why:"La segunda premisa sitúa el archivo dentro de la regla general."},
    {key:"working_rule_1",type:"reasoning",topic:"Integración de reglas",scenario:"Regla 1: los círculos suman 2. Regla 2: los triángulos suman 3. Regla 3: si aparecen juntos, suma sus valores.",q:"¿Cuánto vale ○ + △ + ○?",opts:["5","6","7","8"],a:"7",why:"2 + 3 + 2 = 7."},
    {key:"schedule_1",type:"reasoning",topic:"Razonamiento temporal",q:"Una actividad empieza a las 16:40 y dura 35 minutos. Después necesitas 10 minutos para desplazarte. ¿A qué hora puedes llegar al siguiente lugar?",opts:["17:15","17:20","17:25","17:35"],a:"17:25",why:"16:40 + 35 min = 17:15; más 10 min = 17:25."}
  ]
};

const APPLIED_BANK:any = {
  primary:{
    1:[
      {key:"p1_bag",topic:"Organización cotidiana",scenario:"Mañana tienes Educación Física. Debes llevar ropa deportiva, una botella de agua y una autorización firmada. Ya es de noche.",q:"¿Qué estrategia reduce más el riesgo de olvidar algo?",opts:["Prepararlo todo junto ahora y revisar la lista","Intentar recordarlo al salir","Guardar solo la ropa","Esperar a que alguien te lo recuerde"],a:"Prepararlo todo junto ahora y revisar la lista",why:"Agrupar y comprobar los elementos descarga la memoria y reduce olvidos."},
      {key:"p1_time",topic:"Gestión de tiempo",scenario:"Son las 17:00. Tienes una tarea de 20 minutos y preparar la mochila te lleva 10. Debes salir a las 17:40.",q:"¿Qué afirmación es correcta?",opts:["Puedes hacer ambas tareas y aún quedan 10 minutos","No puedes hacer ambas tareas","Solo puedes preparar la mochila","Tienes exactamente 20 minutos libres"],a:"Puedes hacer ambas tareas y aún quedan 10 minutos",why:"20 + 10 = 30 minutos; de 17:00 a 17:40 hay 40."},
      {key:"p1_instruction",topic:"Seguimiento de instrucciones",scenario:"Te dicen: primero guarda los libros, después ponte el abrigo y, al final, coge las llaves.",q:"¿Qué acción debe ir en segundo lugar?",opts:["Guardar los libros","Ponerte el abrigo","Coger las llaves","Salir de casa"],a:"Ponerte el abrigo",why:"La consigna establece explícitamente el orden."},
      {key:"p1_priority",topic:"Priorización",scenario:"Mañana tienes que entregar una ficha. También quieres ordenar tus cromos, pero eso puede hacerse cualquier día.",q:"Si solo dispones de 20 minutos, ¿qué conviene priorizar?",opts:["La ficha que vence mañana","Ordenar los cromos","Hacer cinco minutos de cada cosa sin terminar ninguna","Esperar hasta mañana"],a:"La ficha que vence mañana",why:"Tiene una fecha límite inmediata."},
      {key:"p1_change",topic:"Flexibilidad",scenario:"Ibas a ir al parque, pero empieza a llover y el plan ya no es posible.",q:"¿Qué opción muestra más flexibilidad?",opts:["Elegir otra actividad que pueda hacerse bajo techo","Quedarte esperando sin decidir nada","Insistir en ir aunque haya tormenta","Cancelar todos los planes de la semana"],a:"Elegir otra actividad que pueda hacerse bajo techo",why:"La flexibilidad consiste en ajustar el plan cuando cambian las condiciones."}
    ],
    2:[
      {key:"p2_route",topic:"Planificación",scenario:"Tienes que devolver un libro, comprar pan y llegar a entrenamiento a las 18:00. La biblioteca cierra a las 17:30.",q:"¿Qué restricción deberías considerar primero al ordenar los recados?",opts:["La hora de cierre de la biblioteca","El color de la bolsa","Qué recado parece más divertido","El orden alfabético"],a:"La hora de cierre de la biblioteca",why:"Una restricción temporal puede hacer imposible completar una tarea si se deja para el final."},
      {key:"p2_multi",topic:"Memoria prospectiva",scenario:"Al salir de clase tienes que entregar una autorización en secretaría y después recordar comprar cartulina.",q:"¿Qué estrategia ayuda mejor a cumplir las dos acciones?",opts:["Usar dos recordatorios ligados a cada momento","Intentar no pensar en ello para no distraerte","Hacer solo la segunda tarea","Esperar a que otra persona lo recuerde"],a:"Usar dos recordatorios ligados a cada momento",why:"Los recordatorios asociados a momentos concretos apoyan la memoria prospectiva."},
      {key:"p2_irrelevant",topic:"Selección de información",scenario:"Para llegar a una cita a las 18:00 sabes que tardas 20 minutos andando, está lloviendo y tu camiseta favorita es azul.",q:"¿Qué dato es irrelevante para decidir a qué hora salir?",opts:["El color de tu camiseta","La hora de la cita","El tiempo de desplazamiento","Que está lloviendo"],a:"El color de tu camiseta",why:"No afecta a la hora de salida."},
      {key:"p2_plan",topic:"Planificación temporal",scenario:"Dispones de 45 minutos. Leer un tema requiere 25, preparar la mochila 8 y ducharte 10.",q:"¿Cuánto tiempo quedará si haces las tres tareas?",opts:["2 minutos","5 minutos","8 minutos","12 minutos"],a:"2 minutos",why:"25 + 8 + 10 = 43; quedan 2 minutos."},
      {key:"p2_error",topic:"Supervisión",scenario:"Has preparado la mochila siguiendo una lista, pero al revisar ves que has guardado dos cuadernos y falta el estuche.",q:"¿Qué es lo más útil antes de salir?",opts:["Corregir la mochila comparándola de nuevo con la lista","Salir igualmente","Vaciar toda la mochila y no volver a revisarla","Ignorar la lista"],a:"Corregir la mochila comparándola de nuevo con la lista",why:"La supervisión implica detectar y corregir errores antes de ejecutar el plan."}
    ],
    3:[
      {key:"p3_constraints",topic:"Planificación con restricciones",scenario:"Son las 16:45. Debes acabar una tarea de 25 min, preparar una mochila de 10 min y salir a las 17:30. Además quieres merendar durante 10 min.",q:"¿Qué plan permite cumplir lo obligatorio y merendar sin llegar tarde?",opts:["Tarea → mochila → merienda","Merienda → tarea → mochila","Mochila → merienda → tarea","Ninguno: las cuatro acciones requieren 45 minutos y dispones de 45"],a:"Tarea → mochila → merienda",why:"Los tres órdenes ocupan 45 min, pero empezar por lo obligatorio protege mejor las tareas críticas si surge un imprevisto."},
      {key:"p3_missing",topic:"Resolución de problemas",scenario:"Quieres ir en transporte público a una actividad. Sabes la hora de inicio y el tiempo aproximado del trayecto, pero no sabes la frecuencia del transporte.",q:"¿Qué información necesitas antes de decidir la hora exacta de salida?",opts:["La frecuencia o los horarios de paso","El color del vehículo","La edad del conductor","La música que escucharás"],a:"La frecuencia o los horarios de paso",why:"Sin ese dato no puedes estimar el tiempo de espera."},
      {key:"p3_replan",topic:"Flexibilidad",scenario:"Habías reservado 30 minutos para una tarea. A mitad de trabajo descubres que necesitas otros 20 y después tienes una cita fija.",q:"¿Qué acción refleja mejor una buena supervisión del plan?",opts:["Recalcular el tiempo y decidir qué parte puede aplazarse","Ignorar la nueva información","Cancelar automáticamente la cita","Seguir igual aunque ya no encajen los tiempos"],a:"Recalcular el tiempo y decidir qué parte puede aplazarse",why:"Un plan eficaz se revisa cuando cambian sus requisitos."},
      {key:"p3_two_goals",topic:"Toma de decisiones",scenario:"Tienes que terminar una tarea hoy y también quieres practicar 40 minutos una actividad que no tiene fecha límite. Quedan 50 minutos libres.",q:"¿Qué decisión protege mejor ambos objetivos?",opts:["Terminar primero la tarea y usar el tiempo restante para practicar","Practicar 40 minutos y dejar la tarea sin terminar","Alternar cada dos minutos entre ambas","No hacer ninguna"],a:"Terminar primero la tarea y usar el tiempo restante para practicar",why:"Prioriza el objetivo con límite temporal sin abandonar el segundo."},
      {key:"p3_monitor",topic:"Control del plan",scenario:"Sigues una receta y, tras dos pasos, el resultado no se parece a lo esperado.",q:"¿Qué estrategia ejecutiva es más adecuada?",opts:["Detenerse, revisar los pasos y corregir antes de continuar","Continuar sin comprobar nada","Empezar otra receta a la vez","Añadir ingredientes al azar"],a:"Detenerse, revisar los pasos y corregir antes de continuar",why:"La monitorización permite detectar desviaciones y ajustar la conducta."}
    ]
  },
  middle:{
    1:[
      {key:"m1_time",topic:"Planificación temporal",scenario:"Tienes 50 minutos antes de salir. Estudiar requiere 30, ducharte 10 y preparar la mochila 8.",q:"¿Puedes completar las tres tareas?",opts:["Sí, sobran 2 minutos","No, faltan 2 minutos","Sí, sobran 8 minutos","No puede saberse"],a:"Sí, sobran 2 minutos",why:"30 + 10 + 8 = 48 minutos."},
      {key:"m1_priority",topic:"Priorización",scenario:"Un trabajo vence mañana y otro la próxima semana. Además tienes una actividad opcional sin fecha.",q:"¿Qué criterio conviene usar primero?",opts:["Urgencia y relevancia","La tarea más entretenida","El orden alfabético","La más corta siempre"],a:"Urgencia y relevancia",why:"La proximidad de la fecha límite y la importancia orientan la prioridad."},
      {key:"m1_check",topic:"Supervisión",scenario:"Antes de enviar un trabajo ves que falta una de las preguntas obligatorias.",q:"¿Qué deberías hacer?",opts:["Completarla antes de enviar","Enviar y esperar que no se note","Borrar otra respuesta","Cambiar el título"],a:"Completarla antes de enviar",why:"La revisión final permite detectar requisitos incumplidos."},
      {key:"m1_memory",topic:"Memoria prospectiva",scenario:"Mañana, al llegar a clase, debes entregar un documento antes de sentarte.",q:"¿Qué estrategia es más útil?",opts:["Colocar el documento junto a algo que necesariamente usarás al entrar","Pensar en él una sola vez esta noche","Guardarlo en un lugar distinto cada día","No preparar ninguna señal"],a:"Colocar el documento junto a algo que necesariamente usarás al entrar",why:"Una señal contextual facilita recordar una intención futura."},
      {key:"m1_change",topic:"Flexibilidad",scenario:"Una actividad prevista para las 18:00 se cancela y ahora tienes una hora libre.",q:"¿Qué opción refleja mejor flexibilidad?",opts:["Revisar prioridades y reasignar ese tiempo","Mantener una hora vacía porque el plan original cambió","Cancelar el resto del día","Añadir tareas sin comprobar cuánto duran"],a:"Revisar prioridades y reasignar ese tiempo",why:"La flexibilidad ajusta el plan a la nueva situación."}
    ],
    2:[
      {key:"m2_exam",topic:"Gestión de estudio",scenario:"Mañana tienes un examen importante y dentro de una semana otro. Dispones de 45 minutos hoy.",q:"¿Cuál es la estrategia más razonable?",opts:["Dedicar la mayor parte al examen de mañana y reservar unos minutos para organizar el siguiente","Estudiar solo el examen de la semana próxima","Repartir exactamente el mismo tiempo sin considerar fechas","No estudiar y ordenar únicamente el escritorio"],a:"Dedicar la mayor parte al examen de mañana y reservar unos minutos para organizar el siguiente",why:"Combina prioridad inmediata y planificación futura."},
      {key:"m2_trip",topic:"Planificación de recorridos",scenario:"Debes ir a biblioteca, farmacia y supermercado. La farmacia cierra primero y el supermercado está junto a casa.",q:"¿Qué principio debería dominar el orden del recorrido?",opts:["Atender primero la restricción de cierre","Empezar siempre por lo más cercano","Elegir el lugar más entretenido","Ir en orden alfabético"],a:"Atender primero la restricción de cierre",why:"Las restricciones temporales son prioritarias porque pueden hacer imposible completar el recado."},
      {key:"m2_noise",topic:"Control de distractores",scenario:"Estudias un texto difícil. Llegan mensajes al teléfono cada pocos minutos y no son urgentes.",q:"¿Qué ajuste protege mejor la tarea?",opts:["Silenciar notificaciones durante un bloque de estudio","Responder cada mensaje en cuanto llegue","Cambiar de tarea con cada aviso","Dejar varias aplicaciones abiertas"],a:"Silenciar notificaciones durante un bloque de estudio",why:"Reduce interrupciones y cambios atencionales innecesarios."},
      {key:"m2_estimate",topic:"Estimación temporal",scenario:"Has calculado 20 minutos para una tarea, pero después de 10 minutos solo has completado una cuarta parte.",q:"¿Qué inferencia es más razonable?",opts:["Probablemente necesitas revisar tu estimación y el plan","Seguro que terminarás en otros 10 minutos","Debes abandonar la tarea","El tiempo empleado no aporta información"],a:"Probablemente necesitas revisar tu estimación y el plan",why:"El progreso observado indica que la estimación inicial puede ser demasiado optimista."},
      {key:"m2_missing",topic:"Información necesaria",scenario:"Quieres saber si puedes pasar por una tienda antes de una cita. Sabes dónde está la tienda, pero no cuánto tardas desde allí hasta la cita.",q:"¿Qué dato falta para decidir bien?",opts:["Tiempo de desplazamiento de la tienda a la cita","Nombre de la tienda","Color del edificio","Qué comprarás después"],a:"Tiempo de desplazamiento de la tienda a la cita",why:"Ese dato determina si el plan cabe en el tiempo disponible."}
    ],
    3:[
      {key:"m3_replan",topic:"Replanificación",scenario:"Tu plan era estudiar 40 minutos y después salir. Te avisan de que debes salir 15 minutos antes.",q:"¿Qué ajuste conserva mejor el objetivo principal?",opts:["Reducir una tarea secundaria y mantener el bloque de estudio prioritario","Cancelar todo el estudio","Mantener el plan y llegar tarde","Añadir más tareas antes de salir"],a:"Reducir una tarea secundaria y mantener el bloque de estudio prioritario",why:"Hay que proteger el objetivo prioritario y adaptar lo secundario."},
      {key:"m3_dependencies",topic:"Dependencias",scenario:"Para terminar un proyecto necesitas primero recibir un archivo de otra persona. Mientras esperas, tienes una tarea independiente que también vence hoy.",q:"¿Qué plan aprovecha mejor el tiempo?",opts:["Avanzar la tarea independiente mientras esperas el archivo","Esperar sin hacer nada","Empezar una tarea nueva sin fecha","Repetir trabajo ya terminado"],a:"Avanzar la tarea independiente mientras esperas el archivo",why:"Distinguir dependencias permite aprovechar los periodos de espera."},
      {key:"m3_tradeoff",topic:"Toma de decisiones",scenario:"Tienes 60 minutos. Una tarea importante necesita 45. Otra menos importante necesita 25. No caben completas las dos.",q:"¿Qué estrategia es más defendible?",opts:["Completar la importante y usar el tiempo restante para adelantar la otra","Hacer solo la menos importante porque es más corta","Alternar sin terminar ninguna","Elegir al azar"],a:"Completar la importante y usar el tiempo restante para adelantar la otra",why:"Protege el objetivo prioritario y aprovecha el tiempo residual."},
      {key:"m3_uncertainty",topic:"Decisión bajo incertidumbre",scenario:"Debes elegir entre dos rutas. Una tarda normalmente 20 minutos pero hoy hay obras; la otra tarda 27 minutos de forma estable.",q:"Si llegar a tiempo es crítico, ¿qué criterio adicional es más útil?",opts:["La probabilidad de retraso en la primera ruta","El paisaje de cada ruta","Cuál usaste ayer","El nombre de las calles"],a:"La probabilidad de retraso en la primera ruta",why:"La variabilidad importa cuando el coste de llegar tarde es alto."},
      {key:"m3_monitor",topic:"Monitorización",scenario:"Has dividido un trabajo en cuatro partes iguales. Después de la mitad del tiempo previsto solo has terminado una parte.",q:"¿Qué deberías hacer primero?",opts:["Revisar ritmo, dificultad y prioridades antes de seguir","Suponer que el plan sigue siendo perfecto","Añadir más tareas","Dejar de mirar el tiempo"],a:"Revisar ritmo, dificultad y prioridades antes de seguir",why:"La monitorización usa el progreso real para ajustar el plan."}
    ]
  },
  teen:{
    1:[
      {key:"t1_deadline",topic:"Gestión de tiempo",scenario:"Son las 16:30. Debes enviar una tarea antes de las 18:00. Necesitas 35 min para terminarla y 10 min para revisarla. A las 17:30 tienes que salir.",q:"¿Qué decisión protege mejor el objetivo principal?",opts:["Empezar ya y reservar 10 minutos para revisar","Esperar hasta las 17:00","Salir primero y terminar después de las 18:00","Dedicar el tiempo a otra tarea menos urgente"],a:"Empezar ya y reservar 10 minutos para revisar",why:"Hay tiempo suficiente ahora y la entrega tiene una fecha límite anterior a otras tareas."},
      {key:"t1_route",topic:"Planificación de recorridos",scenario:"Tienes que ir a biblioteca, farmacia y supermercado. La farmacia cierra primero.",q:"¿Qué principio de planificación es más útil?",opts:["Ordenar por restricciones y horarios","Ir siempre al lugar más cercano","Dejar lo urgente para el final","Elegir al azar"],a:"Ordenar por restricciones y horarios",why:"Una hora de cierre puede convertir una tarea en imposible."},
      {key:"t1_change",topic:"Flexibilidad",scenario:"Tu plan cambia porque se cancela una actividad de la tarde.",q:"¿Qué respuesta muestra mejor flexibilidad cognitiva?",opts:["Reorganizar el tiempo según las nuevas prioridades","Mantener el plan aunque ya no tenga sentido","No hacer nada el resto del día","Añadir tareas sin revisar el tiempo"],a:"Reorganizar el tiempo según las nuevas prioridades",why:"La flexibilidad adapta la conducta a la nueva información."},
      {key:"t1_remember",topic:"Memoria prospectiva",scenario:"Mañana debes entregar un documento justo al llegar a clase, antes de empezar otras tareas.",q:"¿Qué estrategia aumenta más la probabilidad de recordarlo?",opts:["Crear una señal visible vinculada a la salida o llegada","Confiar solo en recordarlo espontáneamente","Guardar el documento en un lugar poco visible","Pensar en ello muchas veces sin preparar ninguna señal"],a:"Crear una señal visible vinculada a la salida o llegada",why:"Las claves contextuales facilitan ejecutar una intención en el momento adecuado."},
      {key:"t1_filter",topic:"Selección de información",scenario:"Para decidir si llegas a tiempo sabes: cita a las 18:00, trayecto 25 min, posible lluvia, batería del teléfono 80 %, camiseta negra.",q:"¿Qué dato es claramente irrelevante para calcular la hora mínima de salida?",opts:["El color de la camiseta","La duración del trayecto","La hora de la cita","La posible lluvia"],a:"El color de la camiseta",why:"No modifica el cálculo temporal ni las condiciones del desplazamiento."},
      {key:"t1_check",topic:"Supervisión",scenario:"Antes de entregar un formulario ves que un campo obligatorio está vacío.",q:"¿Qué acción refleja mejor control ejecutivo?",opts:["Completar el campo antes de enviar","Enviar y corregir solo si alguien se queja","Borrar otro campo","Cambiar el formato del documento"],a:"Completar el campo antes de enviar",why:"La revisión final debe detectar y corregir errores relevantes."}
    ],
    2:[
      {key:"t2_complex_schedule",topic:"Planificación temporal",scenario:"Son las 16:20. A las 18:15 has quedado y tardas 20 min en llegar. Un trabajo necesita 35 min y debes comprar una cartulina; la tienda cierra a las 18:00 y está a 8 min de casa.",q:"¿Qué restricción condiciona más el orden del plan?",opts:["La hora de cierre de la tienda","El color de la cartulina","La hora a la que empezaste el día","El nombre de la persona con la que has quedado"],a:"La hora de cierre de la tienda",why:"Es una restricción externa que puede hacer imposible completar una tarea."},
      {key:"t2_plan_compare",topic:"Comparación de planes",scenario:"Debes terminar una tarea de 30 min, ducharte 15 min y salir dentro de 55 min. Quieres reservar 5 min de margen.",q:"¿Qué plan cabe exactamente?",opts:["Tarea → ducha → margen","Ducha → tarea → margen","Margen → tarea → ducha","Los tres tienen la misma duración y caben"],a:"Los tres tienen la misma duración y caben",why:"30 + 15 + 5 = 50; todos los órdenes duran lo mismo y hay 55 minutos."},
      {key:"t2_dependency",topic:"Dependencias",scenario:"Para enviar un proyecto necesitas incorporar una imagen que te mandará un compañero. Mientras llega, aún puedes revisar el texto y las referencias.",q:"¿Qué estrategia usa mejor el tiempo?",opts:["Revisar texto y referencias mientras esperas","Esperar sin hacer nada","Enviar el proyecto incompleto","Empezar otro proyecto sin fecha"],a:"Revisar texto y referencias mientras esperas",why:"Permite avanzar tareas independientes mientras una dependencia está bloqueada."},
      {key:"t2_overload",topic:"Gestión de carga",scenario:"Esta tarde tienes cinco tareas, pero estimas que juntas requieren tres horas y solo dispones de dos.",q:"¿Cuál debería ser el primer paso?",opts:["Priorizar por fecha, importancia y dependencias","Empezar por la más divertida","Intentar hacerlas todas a la vez","Ignorar las estimaciones"],a:"Priorizar por fecha, importancia y dependencias",why:"Antes de ejecutar un plan imposible hay que decidir qué es crítico."},
      {key:"t2_interruption",topic:"Control de interrupciones",scenario:"Estás resolviendo un problema complejo y recibes mensajes no urgentes cada pocos minutos.",q:"¿Qué ajuste protege mejor el rendimiento sin perder información importante?",opts:["Silenciar avisos durante un bloque y revisarlos al terminar","Responder inmediatamente a todos","Cambiar de tarea con cada mensaje","Cerrar el trabajo hasta que dejen de escribir"],a:"Silenciar avisos durante un bloque y revisarlos al terminar",why:"Reduce el coste de cambiar continuamente de tarea."},
      {key:"t2_missing_info",topic:"Información necesaria",scenario:"Quieres elegir entre dos rutas para llegar a una entrevista. Sabes la duración media de ambas, pero una depende de un transbordo cuyo intervalo desconoces.",q:"¿Qué dato adicional tiene más valor para decidir?",opts:["La frecuencia del transbordo","El color de los vehículos","La música que escucharás","Cuál ruta es más conocida"],a:"La frecuencia del transbordo",why:"Puede cambiar de forma importante el tiempo real del trayecto."}
    ],
    3:[
      {key:"t3_multi_constraints",topic:"Planificación con múltiples restricciones",scenario:"Son las 16:10. Tienes una entrega a las 18:00 que requiere 45 min, debes salir a las 17:25 para una cita, y necesitas 10 min para preparar lo que llevarás. Además, el archivo de la entrega tarda 5 min en subir.",q:"¿Cuál es el último momento razonable para empezar la tarea si quieres terminar, revisar lo necesario para salir y dejar iniciada la subida antes de marcharte?",opts:["16:20","16:25","16:30","16:40"],a:"16:25",why:"45 min de trabajo llevan hasta 17:10; quedan 10 min de preparación y 5 min para iniciar la subida antes de 17:25."},
      {key:"t3_replan_event",topic:"Replanificación",scenario:"Tu plan era estudiar 50 min y salir a las 18:00. A las 17:00 te avisan de que debes salir a las 17:35. Ya has estudiado 20 min y necesitas 10 min para prepararte.",q:"¿Qué plan conserva mejor el objetivo de estudio sin comprometer la salida?",opts:["Estudiar 5 minutos más, prepararte y reservar margen","Seguir 30 minutos y salir tarde","Dejar de estudiar de inmediato aunque sobran 25 minutos","Añadir otra tarea antes de salir"],a:"Estudiar 5 minutos más, prepararte y reservar margen",why:"Quedan 35 min; 5 de estudio + 10 de preparación dejan 20 de margen."},
      {key:"t3_risk",topic:"Decisión bajo riesgo",scenario:"Ruta A tarda 20 min normalmente, pero hoy tiene una probabilidad alta de retraso. Ruta B tarda 28 min de forma estable. Debes llegar a una entrevista y solo tienes 35 min.",q:"¿Qué aspecto pesa más en la decisión?",opts:["La fiabilidad del tiempo de llegada","Que la ruta A sea más corta en promedio","El paisaje","La ruta usada la semana pasada"],a:"La fiabilidad del tiempo de llegada",why:"Cuando el coste del retraso es alto, la variabilidad puede importar más que el promedio."},
      {key:"t3_conflict_goals",topic:"Conflicto entre objetivos",scenario:"Te quedan 70 min. Debes entregar hoy una tarea de 50 min. También prometiste llamar a una persona y la llamada puede durar 25 min, pero no tiene hora fija.",q:"¿Qué plan es más robusto?",opts:["Completar primero la tarea y llamar después si queda tiempo o acordar otro momento","Llamar primero y arriesgar la entrega","Hacer ambas simultáneamente","Posponer la tarea sin avisar"],a:"Completar primero la tarea y llamar después si queda tiempo o acordar otro momento",why:"Protege el objetivo con límite rígido y gestiona de forma explícita el segundo compromiso."},
      {key:"t3_incomplete",topic:"Detección de información insuficiente",scenario:"Te ofrecen dos planes de viaje. Uno cuesta menos y el otro tarda menos. No sabes cuánto valoras ahorrar frente a llegar antes.",q:"¿Cuál es la conclusión más correcta?",opts:["Falta conocer la prioridad entre coste y tiempo","El más barato siempre es mejor","El más rápido siempre es mejor","Ambos son equivalentes"],a:"Falta conocer la prioridad entre coste y tiempo",why:"Sin una preferencia o criterio de decisión no existe una opción universalmente superior."},
      {key:"t3_monitoring",topic:"Monitorización y ajuste",scenario:"Estimaste 90 min para estudiar tres temas. Tras 45 min solo has completado medio tema y los tres tienen la misma dificultad.",q:"¿Qué inferencia debería activar una revisión del plan?",opts:["El ritmo real es mucho más lento que el estimado","Todavía vas exactamente según el plan","No hay información suficiente para ajustar nada","Lo mejor es añadir un cuarto tema"],a:"El ritmo real es mucho más lento que el estimado",why:"El progreso observado es incompatible con completar los tres temas en el tiempo previsto."},
      {key:"t3_parallel",topic:"Planificación de dependencias",scenario:"Debes imprimir un documento, preparar una mochila y esperar a que termine una descarga de 15 min. Imprimir tarda 5 min y la mochila 8.",q:"¿Qué estrategia reduce más el tiempo total?",opts:["Iniciar la descarga y hacer las otras tareas mientras termina","Esperar la descarga antes de hacer nada","Preparar todo y empezar la descarga al final","Repetir la impresión dos veces"],a:"Iniciar la descarga y hacer las otras tareas mientras termina",why:"Aprovecha el tiempo de espera para completar tareas independientes."}
    ]
  }
};

const SOCIAL_BANK:any = {
  1:[
    {key:"s1_fact_inference",topic:"Hechos e interpretaciones",scenario:"Envías un mensaje a una amiga y tarda dos horas en responder. No tienes más información.",q:"¿Qué afirmación distingue mejor un hecho de una interpretación?",opts:["El hecho es que tardó dos horas; el motivo aún no se sabe","El hecho es que está enfadada","El hecho es que ya no quiere hablar contigo","El hecho es que lo hizo a propósito"],a:"El hecho es que tardó dos horas; el motivo aún no se sabe",why:"El tiempo de respuesta es observable; la intención requiere más información."},
    {key:"s1_belief",topic:"Perspectiva",scenario:"Leo deja su botella en la mesa y sale. Mientras no está, Marta la guarda en una mochila. Leo no lo ha visto.",q:"¿Dónde buscará Leo primero?",opts:["En la mesa","En la mochila","En cualquier lugar al azar","Sabe automáticamente dónde está"],a:"En la mesa",why:"Leo actúa según su propia información, no según la información del observador."},
    {key:"s1_boundary",topic:"Límites",scenario:"Un compañero te pide tu contraseña diciendo que, si sois amigos, deberías confiar en él.",q:"¿Qué respuesta mantiene un límite claro sin atacar?",opts:["Prefiero no compartir contraseñas con nadie","Toma, pero no se la digas a nadie","Si insistes, dejaré de hablarte para siempre","Publicaré que me la has pedido"],a:"Prefiero no compartir contraseñas con nadie",why:"Expresa el límite de forma directa sin convertirlo en una amenaza."},
    {key:"s1_ambiguity",topic:"Ambigüedad social",scenario:"En un chat escribes una broma y nadie responde durante varios minutos.",q:"¿Qué sabes con seguridad?",opts:["Que no han respondido todavía","Que la broma les ha ofendido","Que están hablando de ti","Que ya no quieren incluirte"],a:"Que no han respondido todavía",why:"Las otras opciones añaden interpretaciones no demostradas."},
    {key:"s1_repair",topic:"Reparación básica",scenario:"Interrumpes varias veces a una persona y te dice: «Déjame terminar, por favor».",q:"¿Qué respuesta facilita mejor continuar la conversación?",opts:["Perdón, termina; te escucho","No es para tanto","Pues ya no digo nada nunca","Seguir hablando para explicar por qué interrumpiste"],a:"Perdón, termina; te escucho",why:"Reconoce la señal y modifica la conducta."},
    {key:"s1_privacy",topic:"Privacidad",scenario:"Recibes una captura de una conversación privada de otra persona.",q:"¿Qué es más responsable antes de reenviarla?",opts:["Preguntarte si tienes permiso y si compartirla es necesario","Reenviarla rápido antes de que la borren","Añadir un comentario gracioso","Mandarla a un grupo grande"],a:"Preguntarte si tienes permiso y si compartirla es necesario",why:"La privacidad y el contexto importan antes de difundir información."}
  ],
  2:[
    {key:"s2_irony",topic:"Pragmática",scenario:"El grupo cambia por tercera vez una hora que Marta había pedido mantener. Marta responde: «Sí, claro, genial» y deja de escribir.",q:"¿Cuál es la interpretación más prudente?",opts:["Puede estar molesta, pero necesitamos más contexto para saberlo","Está encantada con el cambio","Seguro que quiere abandonar el grupo","No existe ninguna posibilidad de ironía"],a:"Puede estar molesta, pero necesitamos más contexto para saberlo",why:"El contexto hace plausible una lectura irónica, pero no permite certeza absoluta."},
    {key:"s2_intent_impact",topic:"Intención e impacto",scenario:"Leo cuenta a Sara algo privado de Ana porque cree que Sara puede ayudar. Ana se enfada al enterarse.",q:"¿Qué afirmación integra mejor intención e impacto?",opts:["Leo pudo querer ayudar y aun así vulnerar la confianza de Ana","Si quería ayudar, Ana no puede sentirse mal","Como Ana se enfadó, Leo necesariamente quería dañarla","La intención hace irrelevante el resultado"],a:"Leo pudo querer ayudar y aun así vulnerar la confianza de Ana",why:"La intención y el impacto son dimensiones distintas."},
    {key:"s2_missing_info",topic:"Información insuficiente",scenario:"Una amiga cancela dos planes seguidos diciendo que está cansada.",q:"¿Qué dato sería más útil antes de concluir que evita verte?",opts:["Si también ha cancelado otras actividades y cómo se encuentra","Qué música escucha","Qué ropa llevaba ayer","Cuántos seguidores tiene"],a:"Si también ha cancelado otras actividades y cómo se encuentra",why:"Ese dato ayuda a distinguir una explicación general de una específicamente relacional."},
    {key:"s2_perspectives",topic:"Perspectivas múltiples",scenario:"En un trabajo en grupo, Ana cree que Leo no colabora porque habla poco. Leo piensa que colabora porque ha hecho casi toda la búsqueda en casa.",q:"¿Qué explica mejor el desacuerdo?",opts:["Están usando señales distintas para valorar la colaboración","Uno de los dos tiene que estar mintiendo","Hablar poco siempre significa trabajar poco","Trabajar en casa nunca cuenta"],a:"Están usando señales distintas para valorar la colaboración",why:"Cada persona está atendiendo a una fuente diferente de evidencia."},
    {key:"s2_indirect",topic:"Lenguaje indirecto",scenario:"En una habitación hace frío y alguien dice mirando la ventana abierta: «Aquí corre bastante aire».",q:"Además de describir la situación, ¿qué intención podría tener?",opts:["Sugerir que alguien cierre la ventana","Pedir que enciendan música","Decir que quiere salir","Informar de que la ventana está rota"],a:"Sugerir que alguien cierre la ventana",why:"El contexto permite una petición indirecta plausible."},
    {key:"s2_conflict",topic:"Conflicto social",scenario:"Dos personas recuerdan de forma distinta quién propuso cambiar un plan y ambas parecen sinceras.",q:"¿Cuál es una posibilidad razonable?",opts:["Pueden recordar el episodio de forma diferente sin que ninguna mienta","Una de ellas tiene que estar manipulando","Los recuerdos importantes siempre son exactos","La única solución es elegir a quién creer"],a:"Pueden recordar el episodio de forma diferente sin que ninguna mienta",why:"La memoria y la interpretación pueden divergir."}
  ],
  3:[
    {key:"s3_group_chat",topic:"Inferencia social compleja",scenario:"En un chat de grupo, Irene propone una hora. Nadie responde. Dos horas después Pablo propone la misma hora y varias personas contestan de inmediato. Irene interpreta que el grupo la ignora.",q:"¿Cuál es el mejor análisis inicial?",opts:["El patrón puede resultar molesto, pero aún faltan datos sobre quién vio cada mensaje y cuándo","Demuestra que todo el grupo rechaza a Irene","No hay ninguna razón para que Irene se sienta molesta","Pablo copió necesariamente la propuesta para perjudicarla"],a:"El patrón puede resultar molesto, pero aún faltan datos sobre quién vio cada mensaje y cuándo",why:"Reconoce el impacto sin convertir una explicación posible en un hecho."},
    {key:"s3_repair",topic:"Reparación de confianza",scenario:"Un amigo comparte algo que le contaste en privado. Dice que pensó que no era importante y que no quiso hacerte daño.",q:"¿Qué respuesta suya ayudaría más a reparar la situación?",opts:["Reconocer el impacto, disculparse y acordar cómo manejar información privada en el futuro","Insistir en que no hizo nada malo porque no tuvo mala intención","Decirte que estás exagerando","Pedirte que olvides el tema sin hablarlo"],a:"Reconocer el impacto, disculparse y acordar cómo manejar información privada en el futuro",why:"Una reparación eficaz integra responsabilidad, impacto y un cambio concreto."},
    {key:"s3_competing_goals",topic:"Negociación",scenario:"Dos compañeros quieren usar el mismo tiempo libre: uno necesita ensayar una presentación que es mañana y el otro quiere grabar un vídeo personal que puede hacerse cualquier día.",q:"¿Qué criterio favorece una solución negociada?",opts:["Considerar urgencia y buscar después otro momento para el objetivo flexible","Decidir por quién habla más fuerte","Repartir el tiempo exactamente aunque el ensayo quede incompleto","Cancelar ambos planes"],a:"Considerar urgencia y buscar después otro momento para el objetivo flexible",why:"Integra necesidades distintas en lugar de tratarlas como equivalentes."},
    {key:"s3_reputation",topic:"Contexto y reputación",scenario:"Te dicen que una persona «siempre deja tirado al grupo». La única evidencia que recibes es que faltó a una reunión la semana pasada.",q:"¿Qué problema tiene esa conclusión?",opts:["Generaliza una característica estable a partir de evidencia insuficiente","Es correcta porque cualquier ausencia demuestra irresponsabilidad","Solo falla si la persona pidió disculpas","No hay ningún problema lógico"],a:"Generaliza una característica estable a partir de evidencia insuficiente",why:"Una conducta aislada no justifica por sí sola una descripción global."},
    {key:"s3_knowledge_states",topic:"Estados de conocimiento",scenario:"Nora sabe que la reunión cambió de aula. Alex no estaba cuando se anunció el cambio y nadie le ha escrito. Nora ve a Alex caminar hacia el aula antigua.",q:"¿Qué explicación es más consistente con la información disponible?",opts:["Alex probablemente actúa con la información anterior","Alex sabe el cambio pero quiere llegar tarde","Alex está intentando engañar a Nora","No puede tener ninguna expectativa sobre el aula"],a:"Alex probablemente actúa con la información anterior",why:"No hay evidencia de que haya recibido la actualización."},
    {key:"s3_ambiguous_message",topic:"Pragmática y contexto",scenario:"Después de una discusión, alguien responde «Perfecto, haz lo que quieras». El texto puede ser literal o expresar enfado.",q:"¿Cuál sería la mejor forma de reducir la ambigüedad antes de reaccionar?",opts:["Preguntar cómo lo está diciendo o qué necesita ahora","Asumir automáticamente que es una amenaza","Responder con otra frase ambigua","Compartir la conversación con otras personas"],a:"Preguntar cómo lo está diciendo o qué necesita ahora",why:"Cuando el canal escrito deja dudas sobre el tono, pedir aclaración reduce inferencias erróneas."},
    {key:"s3_observer",topic:"Perspectiva e información",scenario:"Ves a Clara salir de una conversación seria sonriendo. Sabes que suele sonreír cuando está nerviosa, pero otra persona del grupo no lo sabe.",q:"¿Por qué podrían interpretar la misma sonrisa de manera distinta?",opts:["Porque disponen de información contextual diferente sobre Clara","Porque una de las dos personas necesariamente miente","Porque las expresiones siempre tienen un único significado","Porque el contexto nunca cambia la interpretación"],a:"Porque disponen de información contextual diferente sobre Clara",why:"Las inferencias sociales dependen del contexto y del conocimiento previo."}
  ]
};


const V13_ATTENTION_BANK:any = {
  1:[
    {key:"a1_intruder",mechanic:"intruder",type:"attentionChoice",topic:"Atención selectiva · intruso",q:"¿Qué elemento NO pertenece al mismo grupo?",visualItems:["🍎","🍌","🍓","📘"],opts:["🍎","🍌","🍓","📘"],a:"📘",why:"Tres elementos son frutas y uno no."},
    {key:"a1_instruction",mechanic:"instruction",type:"attentionChoice",topic:"Atención · seguimiento de consigna",scenario:"Consigna: elige únicamente el elemento que sea un medio de transporte.",q:"¿Cuál debes seleccionar?",visualItems:["🎧","🚲","📘","🍎"],opts:["🎧","🚲","📘","🍎"],a:"🚲",why:"La bicicleta es el único medio de transporte."},
    {key:"a1_position",mechanic:"position",type:"attentionChoice",topic:"Atención espacial",scenario:"Fila: ★  ○  ▲  ■  ◆",q:"¿Qué símbolo está inmediatamente a la derecha del triángulo?",opts:["○","■","◆","★"],a:"■",why:"El cuadrado aparece justo después del triángulo."}
  ],
  2:[
    {key:"a2_double",mechanic:"double_criterion",type:"attentionChoice",topic:"Atención selectiva · doble criterio",scenario:"Elementos: 🔵3 · 🔴4 · 🔵6 · 🟢8 · 🔵9",q:"Elige el único elemento que cumple DOS condiciones: es azul y tiene un número par.",opts:["🔵3","🔴4","🔵6","🔵9"],a:"🔵6",why:"Es el único azul con número par."},
    {key:"a2_table",mechanic:"table_search",type:"attentionChoice",topic:"Atención funcional · búsqueda en tabla",scenario:"Horario: Matemáticas 09:00 · Lengua 10:00 · Inglés 11:30 · Ciencias 12:15",q:"¿Qué asignatura empieza a las 11:30?",opts:["Matemáticas","Lengua","Inglés","Ciencias"],a:"Inglés",why:"La tabla asocia Inglés con las 11:30."},
    {key:"a2_filter",mechanic:"filtering",type:"attentionChoice",topic:"Atención · selección relevante",scenario:"Necesitas encontrar un tren que salga DESPUÉS de las 17:00 y ANTES de las 18:00. Opciones: 16:55 · 17:10 · 18:00 · 18:20",q:"¿Qué salida cumple exactamente la consigna?",opts:["16:55","17:10","18:00","18:20"],a:"17:10",why:"Es la única hora estrictamente posterior a las 17:00 y anterior a las 18:00."}
  ],
  3:[
    {key:"a3_rule_change",mechanic:"rule_switch",type:"attentionChoice",topic:"Atención y cambio de regla",scenario:"Primera regla: elige números pares. Nueva regla: elige números mayores que 6.",q:"Con la NUEVA regla, ¿qué opción debes seleccionar?",opts:["4","6","7","2"],a:"7",why:"Tras el cambio ya no importa que sea par; debe ser mayor que 6."},
    {key:"a3_multi_filter",mechanic:"multi_filter",type:"attentionChoice",topic:"Atención dividida",scenario:"Mensajes: A) urgente, 2 min · B) no urgente, 1 min · C) urgente, 8 min · D) urgente, 3 min",q:"Si solo debes atender mensajes URGENTES que puedas resolver en 5 minutos o menos, ¿cuáles cumplen?",opts:["A y D","A y C","B y D","C y D"],a:"A y D",why:"Ambos son urgentes y requieren 5 minutos o menos."},
    {key:"a3_compare",mechanic:"comparison",type:"attentionChoice",topic:"Atención · comparación compleja",scenario:"Modelo: K7-M2-R9. Opciones: A) K7-M2-R9 · B) K7-N2-R9 · C) K7-M2-P9 · D) K2-M7-R9",q:"¿Qué opción coincide exactamente con el modelo?",opts:["A","B","C","D"],a:"A",why:"Solo A mantiene todos los caracteres y posiciones."}
  ]
};

const V13_LANGUAGE_BANK:any = {
  primary:{
    1:[
      {key:"lp1_main",mechanic:"main_idea",topic:"Lenguaje · idea principal",scenario:"Alicia dejó preparada su mochila por la noche porque al día siguiente tenía que salir muy temprano.",q:"¿Cuál es la idea principal?",opts:["Alicia quería dormir más","Alicia preparó la mochila con antelación porque salía temprano","La mochila era nueva","Alicia perdió la mochila"],a:"Alicia preparó la mochila con antelación porque salía temprano",why:"Resume la relación entre la acción y su motivo."},
      {key:"lp1_connect",mechanic:"cohesion",topic:"Lenguaje · cohesión",q:"Completa: «Llovía mucho; _____, decidieron quedarse en casa».",opts:["por eso","aunque","sin embargo","mientras"],a:"por eso",why:"La segunda parte es consecuencia de la primera."}
    ],
    2:[
      {key:"lp2_infer",mechanic:"inference",topic:"Lenguaje · inferencia",scenario:"Cuando llegó Marta, el suelo de la entrada estaba mojado y había varios paraguas abiertos junto a la puerta.",q:"¿Qué inferencia es más razonable?",opts:["Probablemente estaba lloviendo","Alguien pintó la entrada","Hacía mucho calor","Los paraguas eran nuevos"],a:"Probablemente estaba lloviendo",why:"Los indicios apoyan esa explicación."},
      {key:"lp2_ambiguity",mechanic:"ambiguity",topic:"Lenguaje · ambigüedad",q:"En «Vi a Ana con los prismáticos», ¿qué hace ambigua la frase?",opts:["No sabemos quién usa los prismáticos","No sabemos quién es Ana","No sabemos qué significa ver","No hay ambigüedad"],a:"No sabemos quién usa los prismáticos",why:"Puede interpretarse que el hablante usa prismáticos o que Ana los lleva."}
    ],
    3:[
      {key:"lp3_argument",mechanic:"argumentation",topic:"Lenguaje · argumentación",scenario:"Una propuesta afirma: «Deberíamos empezar las clases una hora más tarde porque así todos aprenderían mejor».",q:"¿Qué información faltaría para valorar mejor el argumento?",opts:["Datos sobre sueño, atención y rendimiento con horarios distintos","El color de las aulas","El nombre de los profesores","La marca de los relojes"],a:"Datos sobre sueño, atención y rendimiento con horarios distintos",why:"Es evidencia directamente relacionada con la conclusión."},
      {key:"lp3_contradiction",mechanic:"contradiction",topic:"Lenguaje · coherencia",scenario:"Texto: «El museo cierra todos los lunes. Hoy es lunes y Ana dice que visitará el museo esta tarde sin que haya apertura especial».",q:"¿Qué problema presenta el texto?",opts:["Hay una contradicción entre el horario y el plan de Ana","No se menciona la ciudad","Falta describir el museo","No hay ningún problema"],a:"Hay una contradicción entre el horario y el plan de Ana",why:"Las dos afirmaciones no pueden mantenerse juntas salvo que exista una excepción."}
    ]
  },
  middle:{
    1:[
      {key:"lm1_summary",mechanic:"summary",topic:"Lenguaje · resumen",scenario:"Un grupo tenía que entregar un proyecto el viernes. El miércoles descubrieron un error en los datos, corrigieron el análisis y finalmente entregaron a tiempo.",q:"¿Cuál es el mejor resumen?",opts:["El grupo detectó y corrigió un error antes de entregar a tiempo","El proyecto trataba de datos","El miércoles fue un día difícil","El viernes terminó la semana"],a:"El grupo detectó y corrigió un error antes de entregar a tiempo",why:"Incluye el problema, la acción principal y el resultado."},
      {key:"lm1_register",mechanic:"register",topic:"Lenguaje · registro",q:"¿Qué mensaje es más adecuado para pedir a un profesor una aclaración?",opts:["Hola, ¿podría aclararme qué parte hay que entregar mañana? Gracias.","Eh, no entiendo nada.","Dime ya qué hay que hacer.","???"],a:"Hola, ¿podría aclararme qué parte hay que entregar mañana? Gracias.",why:"Es claro, respetuoso y específico."}
    ],
    2:[
      {key:"lm2_implicit",mechanic:"implicit_meaning",topic:"Lenguaje · significado implícito",scenario:"Luis mira una mesa llena de platos y dice: «Parece que aquí ha comido poca gente».",q:"¿Qué interpretación es más probable?",opts:["Está siendo irónico y sugiere que ha comido mucha gente","Cree literalmente que nadie ha comido","No entiende qué son los platos","Está hablando de otra mesa"],a:"Está siendo irónico y sugiere que ha comido mucha gente",why:"El contraste entre la evidencia y la frase activa una lectura irónica."},
      {key:"lm2_evidence",mechanic:"evidence",topic:"Lenguaje · evidencia",scenario:"Un texto afirma que usar bicicleta para trayectos cortos puede reducir tráfico y ruido.",q:"¿Qué dato apoyaría mejor esa afirmación?",opts:["Una comparación del tráfico antes y después de aumentar los desplazamientos en bicicleta","El color de las bicicletas","La edad de los ciclistas","La marca más vendida"],a:"Una comparación del tráfico antes y después de aumentar los desplazamientos en bicicleta",why:"Mide directamente la relación planteada."}
    ],
    3:[
      {key:"lm3_bias",mechanic:"source_evaluation",topic:"Lenguaje · evaluación de fuentes",scenario:"Un anuncio de una bebida afirma que «mejora la concentración un 80 %», pero no indica estudio, muestra ni comparación.",q:"¿Qué crítica es más sólida?",opts:["La afirmación carece de información suficiente para valorar la evidencia","El anuncio usa un porcentaje demasiado alto","La bebida seguramente no funciona","Todo anuncio es falso"],a:"La afirmación carece de información suficiente para valorar la evidencia",why:"Se cuestiona la calidad de la evidencia sin asumir más de lo que sabemos."},
      {key:"lm3_structure",mechanic:"text_structure",topic:"Lenguaje · estructura argumentativa",scenario:"Texto: «Las notificaciones interrumpen el estudio. Cada interrupción obliga a recuperar el hilo. Por ello, silenciarlas durante bloques de trabajo puede ayudar».",q:"¿Qué función cumple la segunda frase?",opts:["Explica el mecanismo que conecta problema y conclusión","Introduce un tema distinto","Niega la primera frase","Es un ejemplo sin relación"],a:"Explica el mecanismo que conecta problema y conclusión",why:"Aclara por qué las interrupciones afectan al estudio."}
    ]
  },
  teen:{
    1:[
      {key:"lt1_precise",mechanic:"precision",topic:"Lenguaje · precisión",q:"¿Cuál es la formulación más precisa?",opts:["La reunión empieza a las 17:30 y dura aproximadamente 45 minutos","La reunión es luego","La reunión será bastante tarde","La reunión dura un rato"],a:"La reunión empieza a las 17:30 y dura aproximadamente 45 minutos",why:"Incluye información concreta y útil."},
      {key:"lt1_summary",mechanic:"summary",topic:"Lenguaje · síntesis",scenario:"Un artículo explica que dormir poco afecta a la atención, la memoria y el estado de ánimo, y recomienda mantener horarios regulares.",q:"¿Cuál es el mejor resumen?",opts:["Dormir poco afecta a varias funciones y la regularidad del sueño puede ayudar","El artículo habla de horarios","La memoria depende solo del sueño","Dormir siempre soluciona cualquier problema"],a:"Dormir poco afecta a varias funciones y la regularidad del sueño puede ayudar",why:"Recoge las dos ideas centrales sin exagerarlas."}
    ],
    2:[
      {key:"lt2_ambiguity",mechanic:"ambiguity",topic:"Lenguaje · ambigüedad",scenario:"Mensaje: «Luego hablamos».",q:"¿Qué dato reduciría más la ambigüedad del mensaje?",opts:["Una hora aproximada o momento concreto","El color del chat","La batería del teléfono","El tamaño de la letra"],a:"Una hora aproximada o momento concreto",why:"Aclara cuándo ocurrirá la conversación."},
      {key:"lt2_inference",mechanic:"inference",topic:"Lenguaje · inferencia",scenario:"Una reseña dice: «La película empieza con fuerza, pero a mitad de camino repite ideas y pierde ritmo».",q:"¿Qué valoración global se puede inferir?",opts:["La experiencia fue mixta: buen inicio y desarrollo más débil","La película fue perfecta","La película no tenía argumento","La persona no vio el final"],a:"La experiencia fue mixta: buen inicio y desarrollo más débil",why:"Integra los dos juicios presentes."}
    ],
    3:[
      {key:"lt3_claim",mechanic:"claim_evidence",topic:"Lenguaje · pensamiento crítico",scenario:"Una publicación afirma: «Este método funciona para todo el mundo porque a mí me funcionó».",q:"¿Cuál es el principal problema de razonamiento?",opts:["Generaliza desde una experiencia individual","Usa una frase demasiado corta","No explica quién escribió la publicación","No menciona el precio"],a:"Generaliza desde una experiencia individual",why:"Una experiencia personal no basta para establecer un efecto universal."},
      {key:"lt3_counter",mechanic:"counterargument",topic:"Lenguaje · argumentación",scenario:"Propuesta: «Hay que prohibir totalmente los teléfonos en centros educativos porque siempre distraen».",q:"¿Qué contraargumento está mejor construido?",opts:["Puede haber usos educativos o de accesibilidad; conviene distinguir contextos y normas de uso","A mí me gustan los teléfonos","Las prohibiciones son malas","Todo el mundo usa teléfono"],a:"Puede haber usos educativos o de accesibilidad; conviene distinguir contextos y normas de uso",why:"Cuestiona el absoluto aportando una excepción relevante y un criterio alternativo."}
    ]
  }
};

APPLIED_BANK.teen[2].push(
  {key:"t2_sequence_constraints",topic:"Planificación con restricciones",scenario:"A las 19:00 tienes una videollamada. Antes debes cenar (25 min), terminar una lectura (20 min) y cargar el portátil al menos 30 min. Son las 18:05 y puedes cargar mientras haces otra cosa.",q:"¿Qué estrategia aprovecha mejor el tiempo?",opts:["Poner a cargar el portátil de inmediato y hacer lectura y cena mientras carga","Esperar a terminar todo para cargar","Cargar solo después de la videollamada","Empezar por una tarea sin considerar la batería"],a:"Poner a cargar el portátil de inmediato y hacer lectura y cena mientras carga",why:"La carga puede ejecutarse en paralelo con otras tareas."},
  {key:"t2_priority_change",topic:"Repriorización",scenario:"Tienes dos tareas previstas. Una vence mañana y otra la semana próxima. De pronto te avisan de que la segunda también vence mañana.",q:"¿Qué debe cambiar primero en tu plan?",opts:["Recalcular prioridades y tiempo disponible para ambas","Mantener exactamente el plan anterior","Eliminar automáticamente la primera","Ignorar el nuevo plazo"],a:"Recalcular prioridades y tiempo disponible para ambas",why:"La nueva fecha modifica las restricciones del plan."}
);
APPLIED_BANK.teen[3].push(
  {key:"t3_information_value",topic:"Valor de la información",scenario:"Debes escoger entre dos cursos. Uno exige mucho tiempo pero ofrece prácticas; del otro solo sabes que es más barato.",q:"¿Qué información adicional tendría más valor antes de decidir?",opts:["Carga semanal, contenidos y oportunidades del segundo curso","El color de su web","El tamaño del aula","La tipografía del folleto"],a:"Carga semanal, contenidos y oportunidades del segundo curso",why:"Permite comparar dimensiones relevantes entre opciones."},
  {key:"t3_plan_failure",topic:"Análisis de errores",scenario:"Un plan de estudio falla tres días seguidos porque siempre subestimas cuánto tardas en cada tarea.",q:"¿Qué cambio aborda mejor la causa del problema?",opts:["Registrar tiempos reales y ajustar futuras estimaciones","Añadir más tareas cada día","Ignorar la duración y confiar en terminar","Cambiar de cuaderno"],a:"Registrar tiempos reales y ajustar futuras estimaciones",why:"Corrige la fuente sistemática del error."}
);
SOCIAL_BANK[2].push(
  {key:"s2_context_shift",topic:"Contexto",scenario:"Un compañero suele bromear mucho. Durante una exposición formal hace un comentario que normalmente sería gracioso, pero otra persona se molesta.",q:"¿Qué ayuda a entender la reacción?",opts:["El mismo comentario puede interpretarse distinto según el contexto","Si era una broma nadie puede molestarse","El contexto nunca importa","Las bromas siempre tienen un significado único"],a:"El mismo comentario puede interpretarse distinto según el contexto",why:"Las normas y expectativas cambian entre situaciones."},
  {key:"s2_clarify",topic:"Clarificación",scenario:"Alguien responde «como quieras» a una propuesta. No sabes si muestra acuerdo real, indiferencia o molestia.",q:"¿Qué respuesta reduce mejor la incertidumbre?",opts:["Preguntar si realmente le parece bien o prefiere otra opción","Asumir que está molesto","Dar por hecho que acepta con entusiasmo","No volver a hablar del tema"],a:"Preguntar si realmente le parece bien o prefiere otra opción",why:"Pedir aclaración evita decidir sobre una inferencia incierta."}
);
SOCIAL_BANK[3].push(
  {key:"s3_partial_info",topic:"Inferencias con información parcial",scenario:"Ves a dos personas salir juntas de una reunión y una parece seria. Más tarde alguien afirma que discutieron.",q:"¿Qué evaluación es más rigurosa?",opts:["La seriedad es compatible con una discusión, pero no la demuestra","Es seguro que discutieron","Es seguro que no discutieron","La expresión facial revela exactamente lo ocurrido"],a:"La seriedad es compatible con una discusión, pero no la demuestra",why:"Una señal aislada admite múltiples causas."},
  {key:"s3_norms",topic:"Normas sociales",scenario:"En un grupo de amigos es habitual llegar diez minutos tarde; en una entrevista laboral, la misma conducta genera una impresión distinta.",q:"¿Qué concepto explica mejor la diferencia?",opts:["Las expectativas dependen del contexto y del rol","La puntualidad no importa nunca","Los amigos interpretan peor la conducta","Una misma conducta siempre significa lo mismo"],a:"Las expectativas dependen del contexto y del rol",why:"Las normas sociales varían con el contexto."}
);


const V14_EXEC_BANK:any = {
  primary:{
    1:[
      {key:"ep1_mochila",mechanic:"sequence",type:"order",topic:"Secuenciación · preparar la mochila",q:"Ordena los cuatro pasos necesarios.",tokens:["Mirar el horario","Elegir los materiales","Guardar los materiales","Comprobar la mochila"],answer:["Mirar el horario","Elegir los materiales","Guardar los materiales","Comprobar la mochila"]},
      {key:"ep1_merienda",mechanic:"sequence",type:"order",topic:"Secuenciación · preparar una merienda",q:"Ordena los pasos.",tokens:["Preparar los ingredientes","Montar la merienda","Servirla","Recoger"],answer:["Preparar los ingredientes","Montar la merienda","Servirla","Recoger"]},
      {key:"ep1_salida",mechanic:"sequence",type:"order",topic:"Secuenciación · salir de casa",q:"Ordena los pasos.",tokens:["Comprobar qué necesitas","Prepararlo","Ponerte abrigo o calzado","Coger llaves y salir"],answer:["Comprobar qué necesitas","Prepararlo","Ponerte abrigo o calzado","Coger llaves y salir"]},
      {key:"ep1_deberes",mechanic:"sequence",type:"order",topic:"Secuenciación · empezar los deberes",q:"Ordena los pasos.",tokens:["Revisar qué tareas hay","Preparar el material","Empezar la primera tarea","Revisar lo terminado"],answer:["Revisar qué tareas hay","Preparar el material","Empezar la primera tarea","Revisar lo terminado"]}
    ],
    2:[
      {key:"ep2_distractor",mechanic:"sequence_distractor",type:"order",topic:"Planificación · mochila con distractor",q:"Ordena solo los pasos necesarios y deja fuera la acción irrelevante.",tokens:["Revisar el horario","Elegir el material","Guardar el material","Comprobar la mochila","Buscar una película"],answer:["Revisar el horario","Elegir el material","Guardar el material","Comprobar la mochila"],distractor:"Buscar una película"},
      {key:"ep2_priority",mechanic:"priority",type:"executiveDecision",topic:"Priorización",scenario:"Tienes una tarea para mañana y otra para dentro de una semana. Solo dispones de 25 minutos.",q:"¿Qué criterio debe guiar tu primera decisión?",opts:["Priorizar la tarea de mañana","Elegir la más entretenida","Empezar por la que tenga el título más corto","No hacer ninguna"],a:"Priorizar la tarea de mañana",why:"La fecha límite inmediata aumenta su prioridad."},
      {key:"ep2_missing",mechanic:"missing_step",type:"executiveDecision",topic:"Supervisión",scenario:"Plan: 1) preparar materiales, 2) hacer la tarea, 3) guardar todo. Falta un paso importante si quieres detectar errores.",q:"¿Qué paso conviene añadir?",opts:["Revisar el resultado antes de guardar","Cambiar de habitación","Mirar el teléfono","Empezar otra tarea"],a:"Revisar el resultado antes de guardar",why:"La revisión permite detectar y corregir errores."},
      {key:"ep2_time",mechanic:"time_estimation",type:"executiveDecision",topic:"Estimación temporal",scenario:"Tienes 35 minutos. Una tarea tarda 20 y preparar la mochila 10.",q:"¿Qué conclusión es correcta?",opts:["Puedes hacer ambas y sobran 5 minutos","No puedes hacer ambas","Sobran 15 minutos","Faltan 5 minutos"],a:"Puedes hacer ambas y sobran 5 minutos",why:"20 + 10 = 30; quedan 5 minutos."}
    ],
    3:[
      {key:"ep3_replan",mechanic:"replanning",type:"executiveDecision",topic:"Replanificación",scenario:"Tu plan era estudiar 30 minutos y luego salir. Te avisan de que debes salir 15 minutos antes y necesitas 10 minutos para prepararte.",q:"¿Qué estrategia protege mejor el objetivo principal?",opts:["Reducir una tarea secundaria y conservar el bloque prioritario","Mantener todo y salir tarde","Cancelar todo","Añadir otra tarea"],a:"Reducir una tarea secundaria y conservar el bloque prioritario",why:"Hay que adaptar lo secundario para mantener el objetivo principal y la restricción de salida."},
      {key:"ep3_dependency",mechanic:"dependencies",type:"executiveDecision",topic:"Dependencias",scenario:"Para terminar un trabajo necesitas un archivo que aún no te han enviado. Mientras tanto puedes revisar las referencias, que no dependen de ese archivo.",q:"¿Qué plan usa mejor el tiempo?",opts:["Revisar las referencias mientras esperas","Esperar sin hacer nada","Volver a hacer una parte ya terminada","Empezar una tarea sin fecha"],a:"Revisar las referencias mientras esperas",why:"Permite avanzar una parte independiente mientras la dependencia está bloqueada."},
      {key:"ep3_constraints",mechanic:"constraints",type:"executiveDecision",topic:"Planificación con restricciones",scenario:"Son las 17:00. Debes salir a las 17:50. Una tarea requiere 25 min, una ducha 15 min y preparar una mochila 8 min.",q:"¿Qué afirmación es correcta?",opts:["Puedes completar las tres y sobran 2 minutos","Faltan 2 minutos","Sobran 10 minutos","Solo puedes hacer dos"],a:"Puedes completar las tres y sobran 2 minutos",why:"25 + 15 + 8 = 48 minutos; dispones de 50."},
      {key:"ep3_monitor",mechanic:"monitoring",type:"executiveDecision",topic:"Monitorización",scenario:"Estimaste 20 minutos para una actividad. Tras 10 minutos solo has completado una cuarta parte.",q:"¿Qué deberías hacer primero?",opts:["Revisar la estimación y ajustar el plan","Suponer que terminarás en otros 10 minutos","Ignorar el progreso","Añadir otra tarea"],a:"Revisar la estimación y ajustar el plan",why:"El ritmo real indica que la estimación inicial probablemente era demasiado optimista."}
    ]
  },
  middle:{
    1:[
      {key:"em1_study",mechanic:"sequence",type:"order",topic:"Secuenciación · empezar a estudiar",q:"Ordena los pasos.",tokens:["Revisar tareas y fechas","Elegir una prioridad","Preparar material","Empezar y revisar al final"],answer:["Revisar tareas y fechas","Elegir una prioridad","Preparar material","Empezar y revisar al final"]},
      {key:"em1_project",mechanic:"sequence",type:"order",topic:"Secuenciación · trabajo escolar",q:"Ordena los pasos.",tokens:["Leer la consigna","Planificar","Realizar el trabajo","Revisar antes de entregar"],answer:["Leer la consigna","Planificar","Realizar el trabajo","Revisar antes de entregar"]},
      {key:"em1_trip",mechanic:"sequence",type:"order",topic:"Secuenciación · preparar una salida",q:"Ordena los pasos.",tokens:["Comprobar hora y lugar","Preparar lo necesario","Revisar la ruta","Salir con margen"],answer:["Comprobar hora y lugar","Preparar lo necesario","Revisar la ruta","Salir con margen"]}
    ],
    2:[
      {key:"em2_distractor",mechanic:"sequence_distractor",type:"order",topic:"Planificación con distractor",q:"Ordena los pasos útiles y deja fuera el distractor.",tokens:["Anotar tareas","Ordenarlas por prioridad","Preparar materiales","Empezar la primera","Cambiar el fondo del teléfono"],answer:["Anotar tareas","Ordenarlas por prioridad","Preparar materiales","Empezar la primera"],distractor:"Cambiar el fondo del teléfono"},
      {key:"em2_priority",mechanic:"priority",type:"executiveDecision",topic:"Priorización",scenario:"Tienes un examen mañana y otro dentro de seis días. Hoy dispones de 40 minutos.",q:"¿Qué estrategia es más razonable?",opts:["Dar más tiempo al examen de mañana y dejar planificado el siguiente","Repartir exactamente 20 y 20","Estudiar solo el de seis días","No estudiar ninguno"],a:"Dar más tiempo al examen de mañana y dejar planificado el siguiente",why:"Combina urgencia con planificación futura."},
      {key:"em2_irrelevant",mechanic:"filtering",type:"executiveDecision",topic:"Selección de información",scenario:"Para decidir si llegas a tiempo sabes: cita a las 18:00, trayecto 20 min, lluvia posible y camiseta azul.",q:"¿Qué dato no afecta a la planificación temporal?",opts:["El color de la camiseta","La hora de la cita","El trayecto","La lluvia posible"],a:"El color de la camiseta",why:"No cambia el tiempo ni las condiciones del desplazamiento."},
      {key:"em2_check",mechanic:"monitoring",type:"executiveDecision",topic:"Supervisión",scenario:"Antes de entregar un trabajo ves que falta un apartado obligatorio.",q:"¿Qué acción es más adecuada?",opts:["Completarlo antes de enviar","Enviar igualmente","Borrar otro apartado","Cambiar el título"],a:"Completarlo antes de enviar",why:"La revisión debe detectar y corregir requisitos incumplidos."}
    ],
    3:[
      {key:"em3_imprevisto",mechanic:"replanning",type:"executiveDecision",topic:"Replanificación",scenario:"Habías reservado 45 minutos para estudiar. Una cita se adelanta 20 minutos y necesitas 10 minutos para prepararte.",q:"¿Qué haces primero?",opts:["Recalcular cuánto tiempo real queda y ajustar prioridades","Mantener el plan anterior","Cancelar automáticamente el estudio","Añadir una tarea nueva"],a:"Recalcular cuánto tiempo real queda y ajustar prioridades",why:"La nueva restricción obliga a revisar el plan."},
      {key:"em3_parallel",mechanic:"parallel_tasks",type:"executiveDecision",topic:"Planificación en paralelo",scenario:"Una descarga tarda 15 min. Imprimir tarda 5 y preparar una mochila 8.",q:"¿Qué estrategia reduce más el tiempo total?",opts:["Iniciar la descarga y hacer las otras tareas mientras termina","Esperar la descarga sin hacer nada","Imprimir dos veces","Empezar la descarga al final"],a:"Iniciar la descarga y hacer las otras tareas mientras termina",why:"Aprovecha un periodo de espera con tareas independientes."},
      {key:"em3_uncertainty",mechanic:"uncertainty",type:"executiveDecision",topic:"Decisión bajo incertidumbre",scenario:"Ruta A suele tardar 20 min pero hoy hay obras. Ruta B tarda 28 min de forma estable. Llegar tarde tendría consecuencias.",q:"¿Qué información es más útil para decidir?",opts:["La probabilidad de retraso en A","El paisaje","Cuál usaste ayer","El nombre de las calles"],a:"La probabilidad de retraso en A",why:"Permite valorar el riesgo, no solo el tiempo medio."},
      {key:"em3_tradeoff",mechanic:"tradeoff",type:"executiveDecision",topic:"Conflicto entre objetivos",scenario:"Tienes 60 minutos. Una tarea importante necesita 45 y otra menos importante 25.",q:"¿Qué estrategia protege mejor los objetivos?",opts:["Completar la importante y adelantar la otra con el tiempo restante","Hacer solo la corta","Alternar sin terminar ninguna","Elegir al azar"],a:"Completar la importante y adelantar la otra con el tiempo restante",why:"Prioriza el objetivo crítico y aprovecha el tiempo residual."}
    ]
  },
  teen:{
    1:[
      {key:"et1_study",mechanic:"sequence",type:"order",topic:"Secuenciación · estudio",q:"Ordena los pasos.",tokens:["Revisar tareas y plazos","Elegir prioridad","Preparar material","Trabajar y revisar"],answer:["Revisar tareas y plazos","Elegir prioridad","Preparar material","Trabajar y revisar"]},
      {key:"et1_out",mechanic:"sequence",type:"order",topic:"Secuenciación · salir con varios compromisos",q:"Ordena los pasos.",tokens:["Revisar agenda","Preparar lo necesario","Comprobar llaves y teléfono","Revisar ruta y salir"],answer:["Revisar agenda","Preparar lo necesario","Comprobar llaves y teléfono","Revisar ruta y salir"]},
      {key:"et1_project",mechanic:"sequence",type:"order",topic:"Secuenciación · entregar un proyecto",q:"Ordena los pasos.",tokens:["Comprobar requisitos","Completar contenido","Revisar errores","Enviar"],answer:["Comprobar requisitos","Completar contenido","Revisar errores","Enviar"]}
    ],
    2:[
      {key:"et2_distractor",mechanic:"sequence_distractor",type:"order",topic:"Planificación con distractor",q:"Ordena las acciones útiles y deja fuera la irrelevante.",tokens:["Anotar tareas y plazos","Estimar tiempos","Ordenar prioridades","Preparar materiales","Cambiar la foto de perfil"],answer:["Anotar tareas y plazos","Estimar tiempos","Ordenar prioridades","Preparar materiales"],distractor:"Cambiar la foto de perfil"},
      {key:"et2_priority",mechanic:"priority",type:"executiveDecision",topic:"Priorización",scenario:"Tienes una entrega mañana, otra en cuatro días y varios mensajes no urgentes.",q:"¿Qué deberías proteger primero?",opts:["La entrega de mañana","Los mensajes","La entrega de cuatro días","Lo que resulte más entretenido"],a:"La entrega de mañana",why:"Tiene la restricción temporal más inmediata."},
      {key:"et2_missing",mechanic:"missing_information",type:"executiveDecision",topic:"Información necesaria",scenario:"Quieres saber si puedes pasar por una tienda antes de una cita. Sabes dónde está la tienda, pero no cuánto tardas desde allí hasta la cita.",q:"¿Qué dato falta?",opts:["Tiempo de desplazamiento de la tienda a la cita","Nombre de la tienda","Color del edificio","Qué comprarás"],a:"Tiempo de desplazamiento de la tienda a la cita",why:"Ese dato determina si el plan cabe."},
      {key:"et2_estimate",mechanic:"estimation",type:"executiveDecision",topic:"Estimación",scenario:"Una tarea estimada en 20 min lleva 10 min y solo has completado una cuarta parte.",q:"¿Qué inferencia es más razonable?",opts:["La estimación inicial probablemente es demasiado optimista","Terminarás seguro en otros 10 min","Debes abandonar","El progreso no aporta información"],a:"La estimación inicial probablemente es demasiado optimista",why:"El ritmo observado no encaja con la previsión inicial."}
    ],
    3:[
      {key:"et3_constraints",mechanic:"constraints",type:"executiveDecision",topic:"Múltiples restricciones",scenario:"Son las 16:10. Debes terminar una entrega de 45 min, salir a las 17:25 y necesitas 10 min para prepararte. La subida del archivo tarda 5 min.",q:"¿Cuál es el último momento razonable para empezar la tarea si quieres dejar iniciada la subida antes de salir?",opts:["16:20","16:25","16:30","16:40"],a:"16:25",why:"45 min de trabajo llevan hasta 17:10; 10 min de preparación y 5 min de subida completan hasta 17:25."},
      {key:"et3_replan",mechanic:"replanning",type:"executiveDecision",topic:"Replanificación",scenario:"Tu plan era estudiar 50 min y salir a las 18:00. A las 17:00 te avisan de que debes salir a las 17:35. Ya has estudiado 20 min y necesitas 10 min para prepararte.",q:"¿Qué plan conserva mejor el estudio sin comprometer la salida?",opts:["Estudiar 5 min más, prepararte y mantener margen","Estudiar 30 min más y salir tarde","Dejar de estudiar de inmediato aunque sobre tiempo","Añadir otra tarea"],a:"Estudiar 5 min más, prepararte y mantener margen",why:"Quedan 35 min y la opción mantiene estudio, preparación y margen."},
      {key:"et3_dependencies",mechanic:"dependencies",type:"executiveDecision",topic:"Dependencias",scenario:"Para cerrar un proyecto necesitas un archivo externo. Mientras llega puedes revisar texto y referencias.",q:"¿Qué estrategia es más eficiente?",opts:["Avanzar texto y referencias mientras esperas","Esperar sin hacer nada","Repetir una parte terminada","Enviar incompleto"],a:"Avanzar texto y referencias mientras esperas",why:"Aprovecha tareas independientes mientras una dependencia está bloqueada."},
      {key:"et3_risk",mechanic:"risk",type:"executiveDecision",topic:"Decisión bajo riesgo",scenario:"Una ruta tarda 20 min de media pero hoy es muy variable; otra tarda 28 de forma estable. Tienes 35 min y llegar tarde es crítico.",q:"¿Qué criterio pesa más?",opts:["La fiabilidad del tiempo de llegada","La distancia media","El paisaje","La costumbre"],a:"La fiabilidad del tiempo de llegada",why:"Cuando el coste del retraso es alto, la variabilidad importa mucho."},
      {key:"et3_monitor",mechanic:"monitoring",type:"executiveDecision",topic:"Monitorización",scenario:"Planificaste 90 min para tres temas. Tras 45 min solo has completado medio tema.",q:"¿Qué debe activar una revisión del plan?",opts:["El ritmo real es mucho más lento de lo previsto","Vas exactamente según el plan","No hay información útil","Conviene añadir un cuarto tema"],a:"El ritmo real es mucho más lento de lo previsto",why:"El progreso observado contradice la estimación inicial."}
    ]
  }
};

function executiveExerciseV14(age:string,level:number,uid:string){
  const group=V14_EXEC_BANK[age]||V14_EXEC_BANK.primary;
  const x=structuredClone(pick(group[level]||group[1]));
  return {...x,id:"exec-"+uid,level,contentKey:x.key};
}

// Extend attention with more non-counting mechanics.
V13_ATTENTION_BANK[1].push(
  {key:"a1_category",mechanic:"category",type:"attentionChoice",topic:"Atención selectiva · categoría",scenario:"Objetos: 📘  ✏️  🎒  🍎",q:"Selecciona el único elemento que no pertenece al contexto escolar.",opts:["📘","✏️","🎒","🍎"],a:"🍎",why:"Los otros tres son materiales escolares."},
  {key:"a1_order",mechanic:"position",type:"attentionChoice",topic:"Atención espacial",scenario:"Secuencia: ○  ▲  ■  ★  ◆",q:"¿Qué símbolo está entre el triángulo y la estrella?",opts:["○","■","◆","▲"],a:"■",why:"El cuadrado ocupa la posición intermedia."}
);
V13_ATTENTION_BANK[2].push(
  {key:"a2_schedule",mechanic:"table_search",type:"attentionChoice",topic:"Atención funcional",scenario:"Agenda: 15:30 biblioteca · 16:15 compra · 17:00 entrenamiento · 18:30 llamada",q:"¿Qué actividad ocurre inmediatamente antes del entrenamiento?",opts:["Biblioteca","Compra","Llamada","Ninguna"],a:"Compra",why:"La compra está programada a las 16:15, justo antes de las 17:00."},
  {key:"a2_double2",mechanic:"double_criterion",type:"attentionChoice",topic:"Atención · doble criterio",scenario:"Opciones: A) azul-8 · B) rojo-8 · C) azul-5 · D) verde-10",q:"Elige la opción que sea azul y par.",opts:["A","B","C","D"],a:"A",why:"Solo A cumple ambos criterios."}
);
V13_ATTENTION_BANK[3].push(
  {key:"a3_rule_memory",mechanic:"rule_switch",type:"attentionChoice",topic:"Atención · cambio de regla",scenario:"Regla inicial: elige letras. Cambio: ahora elige únicamente números impares.",q:"Con la nueva regla, ¿qué opción corresponde?",opts:["B","8","5","D"],a:"5",why:"Tras el cambio solo importa que sea un número impar."},
  {key:"a3_relevance",mechanic:"filtering",type:"attentionChoice",topic:"Atención · información relevante",scenario:"Para decidir si llegas a una cita: hora 18:00, trayecto 25 min, lluvia posible, batería 90 %, camiseta negra.",q:"¿Qué dato puedes ignorar para calcular la hora de salida?",opts:["Camiseta negra","Hora 18:00","Trayecto 25 min","Lluvia posible"],a:"Camiseta negra",why:"No afecta al tiempo de salida."}
);

// Extend language with more functional/inferential items.
V13_LANGUAGE_BANK.teen[2].push(
  {key:"lt2_cohesion2",mechanic:"cohesion",topic:"Lenguaje · cohesión",scenario:"«No tenía todos los datos. ______ decidió esperar antes de sacar conclusiones».",q:"¿Qué conector encaja mejor?",opts:["Por eso","Aunque","Sin embargo","Mientras"],a:"Por eso",why:"La segunda acción es consecuencia de la falta de datos."},
  {key:"lt2_tone",mechanic:"pragmatics",topic:"Lenguaje · tono",scenario:"Mensaje: «Vale, haz lo que quieras».",q:"¿Qué afirmación es más rigurosa?",opts:["El tono puede ser ambiguo y conviene usar el contexto o pedir aclaración","Siempre significa enfado","Siempre significa acuerdo","No puede tener ningún significado implícito"],a:"El tono puede ser ambiguo y conviene usar el contexto o pedir aclaración",why:"El texto aislado no fija una única intención."}
);
V13_LANGUAGE_BANK.teen[3].push(
  {key:"lt3_evidence2",mechanic:"evidence",topic:"Lenguaje · calidad de evidencia",scenario:"Una publicación dice: «Este método mejora las notas porque tres personas de mi clase lo probaron y les fue bien».",q:"¿Qué limita más la fuerza de la conclusión?",opts:["La muestra es muy pequeña y no hay comparación adecuada","La frase es demasiado larga","No se menciona la asignatura favorita","Las tres personas son estudiantes"],a:"La muestra es muy pequeña y no hay comparación adecuada",why:"La evidencia no permite generalizar con seguridad."},
  {key:"lt3_inference2",mechanic:"inference",topic:"Lenguaje · inferencia compleja",scenario:"Un informe señala que el rendimiento mejoró tras introducir una medida, pero al mismo tiempo cambió el profesorado y se redujo el tamaño de los grupos.",q:"¿Qué conclusión es más prudente?",opts:["No podemos atribuir la mejora solo a la medida sin controlar los otros cambios","La medida causó necesariamente toda la mejora","El profesorado no puede influir","El tamaño del grupo es irrelevante"],a:"No podemos atribuir la mejora solo a la medida sin controlar los otros cambios",why:"Hay variables alternativas que podrían explicar parte del cambio."}
);
V13_LANGUAGE_BANK.middle[2].push(
  {key:"lm2_cause",mechanic:"causal_reasoning",topic:"Lenguaje · causalidad",scenario:"Después de cambiar el horario, las notas mejoraron. También se redujo el número de alumnos por grupo.",q:"¿Qué afirmación es más correcta?",opts:["No sabemos qué cambio explica la mejora sin más evidencia","El horario explica necesariamente todo","El tamaño del grupo no puede influir","Las notas mejoraron por azar con seguridad"],a:"No sabemos qué cambio explica la mejora sin más evidencia",why:"Hay al menos dos cambios simultáneos."}
);

function speedReasoningExercise(age:string,level:number){
  if(age==="early"||age==="junior") return ageSpeedExercise(age,level);
  const x=pick(SPEED_REASONING_BANK[level]||SPEED_REASONING_BANK[1]);
  return {...structuredClone(x),id:"speed-"+crypto.randomUUID(),level,contentKey:x.key};
}

function appliedExercise(age:string,level:number){
  if(age==="early"||age==="junior") return ageAppliedExercise(age,level);
  const group=APPLIED_BANK[age]||APPLIED_BANK.primary;
  const x=pick(group[level]||group[1]);
  return {...structuredClone(x),id:"applied-"+crypto.randomUUID(),level,type:"appliedDecision",topic:"Cognición aplicada · "+x.topic,contentKey:x.key};
}

function socialExercise(level:number){
  const x=pick(SOCIAL_BANK[level]||SOCIAL_BANK[1]);
  return {...structuredClone(x),id:"social-"+crypto.randomUUID(),level,type:"socialScenario",topic:"Social Lab · "+x.topic,contentKey:x.key};
}

function validateItem(item:any):boolean{
  if(item?.type==="executed"||String(item?.contentKey||"").startsWith("executed-v")){try{(globalThis as any).ExecutedTasks.validate(item);return true;}catch(_){return false;}}
  if(item?.qualityEvidence||/^functional_/.test(item?.mechanic||'')||String(item?.contentKey||'').startsWith('functional-v1:')){try{(globalThis as any).FunctionalContent.validate(item);}catch(_){return false;}}
  if(item?.roomSpeedTask){try{(globalThis as any).Curriculum.validateRoomSpeed(item);}catch(_){return false;}}
  if(item?.socialEvidence||/^social_perspective_/.test(item?.mechanic||'')){try{(globalThis as any).Curriculum.validateSocial(item);}catch(_){return false;}}
  if(item?.interactionTask||/^executive_interactive_|^attention_room_search$/.test(item?.mechanic||'')){try{(globalThis as any).Curriculum.validateInteraction(item);}catch(_){return false;}}
  try{
    if(item?.photoTask||item?.stimulus?.some((b:any)=>['photo','photoPair'].includes(b?.type)))(globalThis as any).PhotoLibrary.validate(item);
    if(item?.speedEvidence)(globalThis as any).Curriculum.validateSpeed(item);
    if(item?.planEvidence)(globalThis as any).Curriculum.validatePlan(item);
    if(item?.mathEvidence)(globalThis as any).Curriculum.validateMath(item);
  }catch(_){return false;}
  if(!item||typeof item!=="object") return false;
  if(item.memoryResponse==="multiple"||item.selectiveRecall){try{(globalThis as any).Curriculum.validateSelectiveRecall(item);}catch(_){return false;}}
  if(item.type==="documentReview"||item.documentPlan){try{(globalThis as any).DocumentLibrary.validateExecutiveTask(item);}catch(_){return false;}}
  if(item.type==="multiSelect"){try{(globalThis as any).Curriculum.validateReview(item);}catch(_){return false;}}
  try{(globalThis as any).LocaleContent.validateOptions(item);}catch(_){return false;}
  if(String(item.type||"").startsWith("memory") && (!Array.isArray(item.memoryContent)||!item.memoryContent.length)) return false;
  if(Array.isArray(item.opts)){
    const opts=item.opts.map((x:any)=>String(x));
    if(opts.length<2 || new Set(opts).size!==opts.length) return false;
    if(item.a!==undefined && opts.filter((x:string)=>x===String(item.a)).length!==1) return false;
  }
  if(Array.isArray(item.answers)){
    const answers=item.answers.map((x:any)=>String(x));
    const opts=(item.opts||[]).map((x:any)=>String(x));
    if(!answers.length || new Set(answers).size!==answers.length) return false;
    if(!answers.every((a:string)=>opts.includes(a))) return false;
  }
  if(item.type==="patternCompare"){
    const model=(item.modelSequence||[]).join("|");
    const matches=(item.rows||[]).filter((r:any[])=>r.join("|")===model).length;
    if(matches!==1) return false;
    const idx=(item.rows||[]).findIndex((r:any[])=>r.join("|")===model);
    if(String(item.a)!=="Fila "+(idx+1)) return false;
  }
  return true;
}

function normalizeItem(item:any){
  if(!item || typeof item!=="object") return item;
  if(Array.isArray(item.opts)){
    const unique=[...new Set(item.opts.map((x:any)=>String(x)))];
    item.opts=shuffle(unique);
  }
  if(Array.isArray(item.answers)) item.answers=[...new Set(item.answers.map((x:any)=>String(x)))];
  return item;
}


// ---------- V16 CONTENT EXPANSION ----------

// Attention: fewer counting-only tasks, more realistic selective attention and rule use.
V13_ATTENTION_BANK[1].push(
  {key:"a1_receipt",mechanic:"relevance",type:"attentionChoice",topic:"Atención funcional · compra",scenario:"Lista: leche, pan, arroz. En el ticket aparecen pan, jabón, leche, arroz y pilas.",q:"¿Qué producto del ticket NO pertenece a la lista y aparece entre dos productos que sí estaban?",opts:["Jabón","Leche","Arroz","Pan"],a:"Jabón",why:"Jabón está entre pan y leche y no forma parte de la lista."},
  {key:"a1_message",mechanic:"target_detail",type:"attentionChoice",topic:"Atención a detalles · mensaje",scenario:"Mensaje: «Nos vemos a las 17:40 frente a la biblioteca. Lleva el cuaderno azul; el rojo se queda en casa».",q:"¿Qué cuaderno debes llevar?",opts:["El azul","El rojo","Los dos","Ninguno"],a:"El azul",why:"La consigna distingue explícitamente cuál llevar."},
  {key:"a1_calendar",mechanic:"position",type:"attentionChoice",topic:"Atención temporal",scenario:"Agenda: 16:00 merienda · 16:30 deberes · 17:15 entrenamiento · 18:30 ducha.",q:"¿Qué actividad está entre la merienda y el entrenamiento?",opts:["Deberes","Ducha","Entrenamiento","Ninguna"],a:"Deberes",why:"Los deberes aparecen en la posición intermedia."}
);
V13_ATTENTION_BANK[2].push(
  {key:"a2_email",mechanic:"double_criterion",type:"attentionChoice",topic:"Atención selectiva · correo",scenario:"Correos: A) Ana · urgente · hoy; B) Leo · no urgente · mañana; C) Sara · urgente · mañana; D) Hugo · no urgente · hoy.",q:"Debes localizar el correo que sea URGENTE y se refiera a HOY. ¿Cuál es?",opts:["A","B","C","D"],a:"A",why:"Solo A cumple simultáneamente ambos criterios."},
  {key:"a2_transport",mechanic:"table_search",type:"attentionChoice",topic:"Atención funcional · transporte",scenario:"Salidas: 16:20 línea 2 · 16:35 línea 5 · 16:50 línea 2 · 17:05 línea 7.",q:"¿Cuál es la segunda salida de la línea 2?",opts:["16:20","16:35","16:50","17:05"],a:"16:50",why:"La línea 2 aparece a las 16:20 y después a las 16:50."},
  {key:"a2_filter",mechanic:"filtering",type:"attentionChoice",topic:"Atención con distractores",scenario:"Necesitas: cargador, cuaderno y llaves. Sobre la mesa hay cuaderno, auriculares, llaves, botella, cargador y cartera.",q:"¿Qué elemento de la mesa es irrelevante para la tarea y está justo entre las llaves y el cargador en la lista presentada?",opts:["Botella","Cuaderno","Cargador","Llaves"],a:"Botella",why:"Botella no está en la lista objetivo."}
);
V13_ATTENTION_BANK[3].push(
  {key:"a3_rule_change",mechanic:"rule_change",type:"attentionChoice",topic:"Atención y cambio de regla",scenario:"BLOQUE A — usa la regla «elige el número PAR»: Fila 1 = 3, 4 · Fila 2 = 7, 9. BLOQUE B — cambia de regla y elige «número MAYOR QUE 5»: Fila 3 = 4, 6 · Fila 4 = 2, 3.",q:"¿Qué filas tienen un objetivo válido en la SEGUNDA posición según la regla de su bloque?",opts:["Fila 1 y Fila 3","Solo Fila 1","Solo Fila 3","Fila 2 y Fila 4"],a:"Fila 1 y Fila 3",why:"En el bloque A, el 4 de la fila 1 es par. En el bloque B, el 6 de la fila 3 es mayor que 5. Ambos están en segunda posición."},
  {key:"a3_schedule_conflict",mechanic:"cross_reference",type:"attentionChoice",topic:"Atención dividida · agenda",scenario:"Agenda personal: clase 16:00–16:45, compra 17:00–17:20, cita 17:30. Mensaje: «La tienda cierra hoy a las 17:10».",q:"¿Qué dato obliga a revisar el plan?",opts:["La hora de cierre de la tienda","La duración de la clase","La existencia de la cita","Ninguno"],a:"La hora de cierre de la tienda",why:"La compra estaba prevista hasta las 17:20, pero la tienda cierra antes."},
  {key:"a3_instruction",mechanic:"multi_constraint",type:"attentionChoice",topic:"Atención a instrucciones complejas",scenario:"Selecciona un archivo SOLO si: 1) es PDF, 2) fue modificado hoy y 3) su nombre contiene «final». A) final.pdf · hoy; B) final.docx · hoy; C) informe.pdf · hoy; D) final.pdf · ayer.",q:"¿Cuál cumple las tres condiciones?",opts:["A","B","C","D"],a:"A",why:"Solo A es PDF, fue modificado hoy y contiene «final»."}
);

// Speed and reasoning: more meaningful, multi-step items.
SPEED_REASONING_BANK[1].push(
  {key:"sr1_clock",type:"reasoning",topic:"Velocidad · cálculo cotidiano",q:"Son las 16:25. Faltan 35 minutos para una cita. ¿A qué hora es?",opts:["16:50","17:00","17:10","17:20"],a:"17:00",why:"16:25 + 35 minutos = 17:00."},
  {key:"sr1_compare",type:"reasoning",topic:"Discriminación rápida",q:"Modelo: B8-D3. ¿Cuál coincide exactamente?",opts:["B8-D3","B8-03","D8-B3","B3-D8"],a:"B8-D3",why:"Hay que conservar letras, números y posiciones."}
);
SPEED_REASONING_BANK[2].push(
  {key:"sr2_rule_chain",type:"reasoning",topic:"Aplicación de reglas",scenario:"Regla: suma 2 si aparece ▲ y resta 1 si aparece ●. Empiezas en 5.",q:"Secuencia: ▲, ●, ▲. ¿Resultado final?",opts:["6","7","8","9"],a:"8",why:"5 +2 -1 +2 = 8."},
  {key:"sr2_compare_times",type:"reasoning",topic:"Comparación temporal",q:"¿Cuál de estas duraciones es mayor?",opts:["1 h 20 min","75 min","1 h 10 min","68 min"],a:"1 h 20 min",why:"1 h 20 min son 80 minutos."},
  {key:"sr2_sort",type:"reasoning",topic:"Ordenación rápida",q:"Ordena mentalmente de menor a mayor: 0,7 · 0,07 · 0,77 · 0,17. ¿Cuál queda en segundo lugar?",opts:["0,07","0,17","0,7","0,77"],a:"0,17",why:"0,07 < 0,17 < 0,70 < 0,77."}
);
SPEED_REASONING_BANK[3].push(
  {key:"sr3_conditional",type:"reasoning",topic:"Razonamiento condicional",scenario:"Si llueve, el entrenamiento pasa al pabellón. Si además hay una competición, se retrasa 30 minutos. Hoy llueve y hay competición.",q:"¿Qué dos cambios se aplican?",opts:["Cambia de lugar y se retrasa","Solo cambia de lugar","Solo se retrasa","Se cancela"],a:"Cambia de lugar y se retrasa",why:"Se cumplen ambas condiciones."},
  {key:"sr3_ratio",type:"reasoning",topic:"Razonamiento proporcional",q:"Un trayecto de 12 km tarda 18 min en condiciones similares. A la misma velocidad, ¿cuánto tardarían 20 km?",opts:["24 min","30 min","36 min","40 min"],a:"30 min",why:"18/12 = 1,5 min por km; 20 × 1,5 = 30."},
  {key:"sr3_eliminate",type:"reasoning",topic:"Deducción",scenario:"Tres personas —Ana, Luis y Mara— tienen turnos distintos: mañana, tarde y noche. Ana no tiene mañana. Luis no tiene noche. Mara tiene tarde.",q:"¿Qué turno tiene Ana?",opts:["Mañana","Tarde","Noche","No puede saberse"],a:"Noche",why:"Mara ocupa tarde; Luis no puede noche, así que Luis es mañana y Ana noche."}
);

// Applied cognition: more authentic scenarios and deeper decisions.
for (const group of ["primary","middle","teen"]) {
  APPLIED_BANK[group][1].push(
    {key:"v16_l1_message_"+group,topic:"Comprensión funcional",scenario:"Recibes este mensaje: «Trae el documento mañana. Si no puedes imprimirlo, envíamelo antes de las 20:00». Son las 18:30 y no tienes impresora.",q:"¿Qué acción cumple mejor la instrucción?",opts:["Enviarlo antes de las 20:00","Esperar a mañana sin hacer nada","Imprimirlo la semana próxima","Responder sin adjuntar nada"],a:"Enviarlo antes de las 20:00",why:"La instrucción ofrece una alternativa explícita cuando no se puede imprimir."}
  );
  APPLIED_BANK[group][2].push(
    {key:"v16_l2_plan_"+group,topic:"Planificación funcional",scenario:"Tienes 50 minutos. Una tarea importante tarda 30, preparar lo necesario para mañana 10 y responder un mensaje no urgente 8.",q:"¿Qué orden protege mejor lo importante y deja margen?",opts:["Tarea → preparar mañana → mensaje si queda tiempo","Mensaje → tarea → preparar mañana","Preparar mañana → mensaje → tarea","Alternar las tres cada cinco minutos"],a:"Tarea → preparar mañana → mensaje si queda tiempo",why:"Prioriza la tarea crítica y mantiene una actividad necesaria antes de lo opcional."}
  );
  APPLIED_BANK[group][3].push(
    {key:"v16_l3_conflict_"+group,topic:"Decisión con restricciones",scenario:"Debes enviar un trabajo antes de las 18:00. Son las 17:05. Necesitas 35 min para terminarlo y 10 para revisarlo. A las 17:45 debes salir; el trayecto hasta la puerta tarda 5 min.",q:"¿Qué decisión maximiza la probabilidad de entregar bien y salir a tiempo?",opts:["Empezar ya, terminar a las 17:40 y hacer una revisión focalizada de 5 min","Esperar hasta las 17:20 para empezar","Revisar primero 10 min un trabajo aún incompleto","Salir antes y terminar después de las 18:00"],a:"Empezar ya, terminar a las 17:40 y hacer una revisión focalizada de 5 min",why:"Permite completar el contenido y hacer una revisión breve antes de la salida."}
  );
}

// Social Lab: ambiguity, perspective, intention and impact with less obvious answers.
SOCIAL_BANK[1].push(
  {key:"s1_indirect",topic:"Pragmática",scenario:"Una persona mira la ventana abierta, se frota los brazos y dice: «Qué frío hace aquí».",q:"¿Qué puede estar intentando comunicar además de describir la temperatura?",opts:["Que alguien cierre la ventana","Que quiere salir a correr","Que ha perdido algo","Que no entiende la conversación"],a:"Que alguien cierre la ventana",why:"El comentario puede funcionar como petición indirecta en ese contexto."},
  {key:"s1_perspective2",topic:"Perspectiva",scenario:"Nora guarda un libro en el cajón y sale. Mientras está fuera, Iván lo mueve a una estantería. Nora no lo ve.",q:"¿Dónde buscará Nora primero?",opts:["En el cajón","En la estantería","En cualquier sitio","Sabrá automáticamente dónde está"],a:"En el cajón",why:"Nora actuará según la información que tenía antes de salir."}
);
SOCIAL_BANK[2].push(
  {key:"s2_tone",topic:"Intención y tono",scenario:"Después de esperar veinte minutos, alguien dice sonriendo pero con tono tenso: «Genial, justo a tiempo».",q:"¿Qué interpretación es más probable?",opts:["Puede ser irónico y expresar molestia","Es necesariamente un elogio literal","No transmite ninguna actitud","Significa que la persona llegó antes"],a:"Puede ser irónico y expresar molestia",why:"El contexto y el tono pueden invertir el significado literal."},
  {key:"s2_repair",topic:"Reparación comunicativa",scenario:"Dices algo y notas que la otra persona frunce el ceño y deja de participar.",q:"¿Qué respuesta suele ser más útil?",opts:["Comprobar cómo se entendió y aclarar la intención","Repetir exactamente lo mismo más fuerte","Asumir que no pasa nada","Cambiar de tema sin más"],a:"Comprobar cómo se entendió y aclarar la intención",why:"Permite detectar un posible malentendido y repararlo."}
);
SOCIAL_BANK[3].push(
  {key:"s3_competing",topic:"Inferencia social compleja",scenario:"Una amiga cancela un plan diciendo que está cansada. Más tarde publica una foto cenando con su familia.",q:"¿Qué conclusión es más rigurosa?",opts:["La foto no demuestra que mintiera; una cena familiar puede ser compatible con estar cansada","Mintió con seguridad","No estaba cansada en absoluto","La publicación demuestra que no quería verte"],a:"La foto no demuestra que mintiera; una cena familiar puede ser compatible con estar cansada",why:"La evidencia admite explicaciones alternativas y no permite una conclusión única."},
  {key:"s3_impact",topic:"Intención e impacto",scenario:"Alguien hace una broma sin intención de ofender, pero otra persona se siente ridiculizada.",q:"¿Qué afirmación integra mejor ambas perspectivas?",opts:["La intención puede no haber sido ofensiva y aun así el impacto haber sido negativo","Si no hubo mala intención no puede haber daño","El impacto siempre revela la intención","Solo importa quién habló"],a:"La intención puede no haber sido ofensiva y aun así el impacto haber sido negativo",why:"Intención e impacto son dimensiones relacionadas pero distintas."}
);

// Executive functions: enrich each age/level with additional mechanics.
V14_EXEC_BANK.primary[1].push(
  {key:"ep1_room",mechanic:"sequence",type:"order",topic:"Secuenciación · preparar un espacio de estudio",q:"Ordena los pasos.",tokens:["Retirar lo que no necesitas","Preparar material","Colocar agua si hace falta","Empezar la tarea"],answer:["Retirar lo que no necesitas","Preparar material","Colocar agua si hace falta","Empezar la tarea"]}
);
V14_EXEC_BANK.primary[2].push(
  {key:"ep2_switch",mechanic:"priority",type:"executiveDecision",topic:"Priorización",scenario:"Tienes 25 minutos. Debes terminar una actividad para mañana (15 min) y quieres ordenar una colección (20 min).",q:"¿Qué plan es más adecuado?",opts:["Terminar la actividad y usar lo que sobre para empezar a ordenar","Ordenar primero porque lleva más tiempo","Hacer cinco minutos de cada una alternando","No empezar ninguna"],a:"Terminar la actividad y usar lo que sobre para empezar a ordenar",why:"La tarea con fecha inmediata debe protegerse primero."}
);
V14_EXEC_BANK.primary[3].push(
  {key:"ep3_plan_b",mechanic:"constraints",type:"executiveDecision",topic:"Planificación con restricciones",scenario:"Tienes 35 minutos antes de salir. Necesitas 20 para una tarea, 8 para preparar la mochila y 5 para ponerte el abrigo y los zapatos.",q:"¿Cuánto margen queda?",opts:["2 minutos","5 minutos","7 minutos","No cabe"],a:"2 minutos",why:"20 + 8 + 5 = 33; quedan 2 minutos."}
);
V14_EXEC_BANK.middle[1].push(
  {key:"em1_email",mechanic:"sequence",type:"order",topic:"Secuenciación · enviar un trabajo",q:"Ordena los pasos.",tokens:["Comprobar requisitos","Adjuntar el archivo correcto","Revisar destinatario y asunto","Enviar"],answer:["Comprobar requisitos","Adjuntar el archivo correcto","Revisar destinatario y asunto","Enviar"]}
);
V14_EXEC_BANK.middle[2].push(
  {key:"em2_monitor2",mechanic:"monitoring",type:"executiveDecision",topic:"Supervisión",scenario:"Planeaste leer 12 páginas en 30 minutos. Tras 15 minutos has leído 3.",q:"¿Qué conclusión es más útil?",opts:["Debes revisar la estimación y ajustar el objetivo","Vas exactamente al ritmo previsto","Seguro que leerás 9 páginas en los próximos 15 minutos","Conviene ignorar el tiempo"],a:"Debes revisar la estimación y ajustar el objetivo",why:"El rendimiento observado es la mitad del esperado."}
);
V14_EXEC_BANK.middle[3].push(
  {key:"em3_buffer",mechanic:"risk",type:"executiveDecision",topic:"Planificación con margen",scenario:"Un trayecto suele durar 25 minutos, pero a veces se retrasa 10. Tienes una cita importante a las 18:00.",q:"¿Cuál es una salida prudente?",opts:["Salir con al menos 35 minutos de margen","Salir a las 17:40","Salir a las 17:45","Esperar a saber si habrá retraso"],a:"Salir con al menos 35 minutos de margen",why:"Integra la duración habitual y la variabilidad conocida."}
);
V14_EXEC_BANK.teen[1].push(
  {key:"et1_upload",mechanic:"sequence",type:"order",topic:"Secuenciación · entregar un archivo",q:"Ordena los pasos.",tokens:["Comprobar versión final","Renombrar claramente","Subir el archivo","Verificar que la entrega aparece registrada"],answer:["Comprobar versión final","Renombrar claramente","Subir el archivo","Verificar que la entrega aparece registrada"]}
);
V14_EXEC_BANK.teen[2].push(
  {key:"et2_interruption",mechanic:"filtering",type:"executiveDecision",topic:"Control de interrupciones",scenario:"Estás terminando una tarea compleja y llegan mensajes no urgentes cada pocos minutos.",q:"¿Qué estrategia reduce mejor el coste de cambio de tarea?",opts:["Silenciar avisos hasta terminar un bloque definido","Responder cada mensaje al instante","Cambiar de tarea cada vez que llegue un aviso","Dejar todas las conversaciones abiertas"],a:"Silenciar avisos hasta terminar un bloque definido",why:"Reduce interrupciones y protege el mantenimiento del objetivo."}
);
V14_EXEC_BANK.teen[3].push(
  {key:"et3_deadline",mechanic:"tradeoff",type:"executiveDecision",topic:"Decisión con plazo",scenario:"Son las 16:30. Una entrega vence a las 18:00 y requiere 60 min. También tienes una llamada opcional a las 17:15 que duraría 20 min.",q:"¿Qué decisión protege mejor el plazo?",opts:["Posponer la llamada y completar la entrega con margen de revisión","Hacer la llamada y empezar después","Alternar entre llamada y trabajo","Esperar hasta las 17:00"],a:"Posponer la llamada y completar la entrega con margen de revisión",why:"La entrega tiene una restricción temporal crítica y la llamada es opcional."}
);

// Memory: more lists, conversations and routes to reduce repetition.
MEMORY_CONVERSATIONS.primary.push(
  {theme:"Preparativos",pairs:[["Inés","lleva las entradas"],["Mario","coge el agua"],["Eva","trae una pelota"],["Joel","lleva la merienda"]]}
);
MEMORY_CONVERSATIONS.middle.push(
  {theme:"Proyecto",pairs:[["Irene","redacta la conclusión"],["Pablo","busca datos"],["Clara","elige imágenes"],["Nico","revisa la ortografía"]]},
  {theme:"Pedidos",pairs:[["Luna","limonada"],["Óscar","tostada"],["Vera","batido"],["Teo","sándwich"]]}
);
MEMORY_CONVERSATIONS.teen.push(
  {theme:"Organización de evento",pairs:[["Mara","confirma la reserva"],["Leo","envía la ubicación"],["Nora","lleva el material"],["Iván","avisa de la hora"]]},
  {theme:"Pedidos",pairs:[["Paula","café con leche"],["Bruno","té"],["Aina","agua"],["Samuel","sándwich"]]}
);
MEMORY_ROUTES.primary.push(["Casa","Tienda","Parque","Biblioteca","Casa"]);
MEMORY_ROUTES.middle.push(["Casa","Bus","Centro deportivo","Papelería","Biblioteca","Casa"]);
MEMORY_ROUTES.teen.push(["Casa","Bus","Centro","Biblioteca","Supermercado","Casa"],["Escuela secundaria","Cafetería","Biblioteca","Gimnasio","Casa"]);

// Language reasoning: append neutral, inferential items across age groups.
for(const ageKey of ["primary","middle","teen"]){
  V13_LANGUAGE_BANK[ageKey][2].push(
    {key:"v16_lang_infer_"+ageKey,mechanic:"inference",topic:"Inferencia",scenario:"Al salir de casa, Leo vuelve a entrar, coge un paraguas y guarda el teléfono en el bolsillo interior de la chaqueta.",q:"¿Qué inferencia está mejor apoyada?",opts:["Es posible que espere lluvia","Va a nadar","Ha perdido el teléfono","No piensa salir"],a:"Es posible que espere lluvia",why:"Coger un paraguas antes de salir es una pista compatible con lluvia, sin afirmar más de lo que sabemos."}
  );
  V13_LANGUAGE_BANK[ageKey][3].push(
    {key:"v16_lang_argument_"+ageKey,mechanic:"argument",topic:"Pensamiento crítico",scenario:"«La biblioteca debería cerrar más tarde porque ayer había mucha gente a las 19:00».",q:"¿Qué información fortalecería más el argumento?",opts:["Datos de varios meses que muestren demanda habitual después de las 19:00","Que a una persona le guste estudiar de noche","El color de la biblioteca","Que ayer hiciera buen tiempo"],a:"Datos de varios meses que muestren demanda habitual después de las 19:00",why:"Una tendencia sostenida aporta evidencia más sólida que una observación aislada."}
  );
}
// ---------- END V16 CONTENT EXPANSION ----------

function contentSignature(domain:string,item:any){
  // Text identity survives a changed question or level. Ten sources rotate before reuse.
  if(item.passageKey)return domain+":item:passage:"+item.passageKey;
  if(item.memoryMaterialKey)return domain+":item:memory:"+item.memoryMaterialKey;
  if(item.photoTask?.kind==='differences')return domain+":item:photo-pair:"+item.photoTask.pairId;
  const norm=(v:any):any=>{
    if(Array.isArray(v)) return v.map(norm);
    if(v&&typeof v==="object"){
      const out:any={};
      for(const k of Object.keys(v).sort()) out[k]=norm(v[k]);
      return out;
    }
    return v;
  };
  const visible={
    type:item.type||"",
    stimulus:item.stimulus||[],
    topic:item.topic||"",
    q:item.q||item.prompt||"",
    scenario:item.scenario||"",
    title:item.title||"",
    text:item.text||"",
    memoryQuestion:item.memoryQuestion||"",
    memoryContent:item.memoryContent||[],
    model:item.model||"",
    modelSequence:item.modelSequence||[],
    rows:item.rows||[],
    visualItems:item.visualItems||[],
    opts:Array.isArray(item.opts)?[...item.opts].map(String).sort():[]
  };
  return domain+":item:"+JSON.stringify(norm(visible))+":"+String(item.level||1);
}
function mechanicSignature(domain:string,item:any){
  return domain+":mechanic:"+(item.mechanic||item.type||"generic");
}


function familyOf(item:any,domain:string){return (globalThis as any).ContentQuality.family(item,domain);}
function storedMechanicSignature(domain:string,item:any){return mechanicSignature(domain,item)+'|family:'+familyOf(item,domain);}
function photoQuestionSignature(domain:string,item:any){
  const t=item.photoTask;return t?domain+':question:'+t.kind+':'+(t.sceneId||t.pairId)+':'+item.level+':'+(t.index??t.variant??0):null;
}
function generatedItems(domain:string,n:number,recentEntries:string[],factory:()=>any,candidates:any[]|null=null){
  // Candidates are immutable within a selection. Reuse their evidence-based
  // signatures instead of serializing the same stimuli in every scoring pass.
  const signatures=new WeakMap<object,string>();
  const signature=(item:any)=>{if(!signatures.has(item))signatures.set(item,contentSignature(domain,item));return signatures.get(item)!;};
  const recentItems=new Set(recentEntries.filter((x:string)=>x.includes(":item:")).slice(-360));
  const mechanicHistory=recentEntries.filter((x:string)=>x.includes(":mechanic:")).slice(-360).map((x:string)=>x.split('|family:')[0]);
  const familyHistory=recentEntries.flatMap((x:string)=>x.includes('|family:')?[x.split('|family:')[1]]:x.includes(':semantic:')?[x.split(':semantic:')[1]]:[]).slice(-24);
  const localFamilies:string[]=[];
  const mechanicCounts=new Map<string,number>();
  for(const m of mechanicHistory) mechanicCounts.set(m,(mechanicCounts.get(m)||0)+1);
  const veryRecent=new Set(mechanicHistory.slice(-12));

  const pool:any[]=[];
  const seenPool=new Set<string>();
  for(let tries=0;tries<(candidates?candidates.length:900);tries++){
    const cand=normalizeItem(candidates?candidates[tries]:factory());
    if(!cand)continue;
    const sig=signature(cand);
    const poolKey=photoQuestionSignature(domain,cand)||sig;
    if(seenPool.has(poolKey)) continue;
    if(!validateItem(cand)) continue;
    seenPool.add(poolKey);
    pool.push(cand);
  }

  const out:any[]=[];
  const localItems=new Set<string>();
  const localMechanics=new Set<string>();

  for(let i=0;i<n;i++){
    // A recent-window rotation is only a fallback after the available pool has
    // no unseen source left. More documents must not cause earlier repeats.
    const freshAvailable=pool.some(cand=>{const sig=signature(cand);return !localItems.has(sig)&&!recentItems.has(sig);});
    let best:any=null, bestScore=Infinity;
    // History changes only after choosing an item, not for every candidate.
    const passageHistory=[...recentEntries,...out.map((it:any)=>signature(it))].filter((x:string)=>x.includes(':item:passage:'));
    const previousPassages=passageHistory.slice(-9),previousPassage=passageHistory.at(-1);
    const readingDomain=['reading','middleReading','literacy'].includes(domain);
    for(const cand of pool){
      const sig=signature(cand);
      if(localItems.has(sig)) continue;
      const msig=mechanicSignature(domain,cand);
      const repeated=recentItems.has(sig)&&(!cand.passageKey||freshAvailable)||cand.passageKey&&previousPassages.includes(sig);
      const itemPenalty=repeated?100000+recentEntries.lastIndexOf(sig)*100:0;
      const recentPenalty=veryRecent.has(msig)?10000:0;
      const localPenalty=localMechanics.has(msig)?5000:0;
      const countPenalty=(mechanicCounts.get(msig)||0)*100;
      // Alternate text and visual sources where both are available. Fresh
      // sources and the nine-source recent window retain higher priority.
      const sameFormat=previousPassage&&previousPassage.includes(':passage:document:')===Boolean(cand.passageKey?.startsWith('document:'));
      const formatPenalty=readingDomain&&sameFormat?20000:0;
      const question=photoQuestionSignature(domain,cand),questionPenalty=question&&recentEntries.includes(question)?10:0;
      const family=familyOf(cand,domain),familyWindow=[...familyHistory,...localFamilies].slice(-24);
      const familyCount=familyWindow.filter((x:string)=>x===family).length;
      const semanticPenalty=family==='unclassified'?0:(family===familyWindow.at(-1)?60000:0)+Math.min(30000,familyCount*5000);
      const score=itemPenalty+formatPenalty+semanticPenalty+recentPenalty+localPenalty+countPenalty+questionPenalty+Math.random();
      if(score<bestScore){best=cand;bestScore=score;}
    }
    if(!best) break;
    const sig=signature(best), msig=mechanicSignature(domain,best);
    localItems.add(sig); localMechanics.add(msig);
    mechanicCounts.set(msig,(mechanicCounts.get(msig)||0)+1);
    localFamilies.push(familyOf(best,domain));
    out.push(best);
  }
  return out;
}


function languageExercise(age:string,level:number){
  if((age==="early"||age==="junior") && AGE_ACADEMIC[age]?.language){
    const bank=AGE_ACADEMIC[age].language;
    const pool=bank.filter((x:any)=>(x.level||1)===level);
    const x=structuredClone(pick(pool.length?pool:bank));
    return {...x,id:"lang-"+crypto.randomUUID(),level,type:"languageReasoning",contentKey:x.id,mechanic:"age_language"};
  }
  const group=V13_LANGUAGE_BANK[age]||V13_LANGUAGE_BANK.primary;
  const x=structuredClone(pick(group[level]||group[1]));
  return {...x,id:"lang-"+crypto.randomUUID(),level,type:"languageReasoning",contentKey:x.key,mechanic:x.mechanic||"language"};
}

// Canonical rules are mirrored from js/locale-content.js for the deployable package.
// A regression check requires byte-for-byte parity. Do not recursively replace IDs,
// metadata, English specimens or word-form evidence with ad-hoc string maps.
function localizeValue(value:any,locale:string):any{
  const rules=(globalThis as any).LocaleContent;
  if(Array.isArray(value))return value.map(item=>localizeValue(item,locale));
  if(value&&typeof value==="object")return rules.localizeItem(value,locale);
  return rules.text(value,locale);
}
const regionalCache=new Map<string,any>();
function regionalCandidate(item:any,locale:string,domain:string,age:string){
  if(!item||age==="early")return item;
  const rules=(globalThis as any).LocaleContent,key=rules.normalize(locale);
  const {id,...source}=item,signature=key+":"+domain+":"+JSON.stringify(source);
  if(regionalCache.has(signature)){
    const stored=regionalCache.get(signature);
    return stored?{...structuredClone(stored),id}:null;
  }
  try{
    const localized=rules.localizeItem(item,key,domain);
    if(regionalCache.size>=5000)regionalCache.clear();
    regionalCache.set(signature,localized);
    return localized;
  }catch(error){
    if((error as any)?.name!=="LocaleAdaptationError")throw error;
    if(regionalCache.size>=5000)regionalCache.clear();
    regionalCache.set(signature,null);
    return null;
  }
}
function sanitizeGeneratedLanguage(value:any):any{
  if(typeof value==="string"){
    return value
      .replace(/autob[uú]s(?=c)/giu,"bus")
      .replace(/autob[uú]scar(?:á|a|ía|ia|é|e|án|an)?/giu,"buscar")
      .replace(/autob[uú]s(?:car|c)/giu,"busc");
  }
  if(Array.isArray(value)) return value.map(sanitizeGeneratedLanguage);
  if(value&&typeof value==="object"){
    const out:any={}; for(const [k,v] of Object.entries(value)) out[k]=sanitizeGeneratedLanguage(v); return out;
  }
  return value;
}

function cognitiveGame(age:string,level:number,excludeTypes:string[]=[]){
  const allTypes=["inhibition","spatialSequence","nback","ruleShift","stroop"];
  const available=allTypes.filter(t=>!excludeTypes.includes(t));
  const type=pick(available.length?available:allTypes);
  const id="game-"+crypto.randomUUID();
  if(type==="inhibition"){
    const n=level===1?10:level===2?14:18;
    const duration=level===1?1100:level===2?850:680;
    const rounds=Array.from({length:n},()=>{
      const shouldRespond=Math.random()<(level===1?.7:.65);
      const cue=shouldRespond?pick(["🟢","⭐","🎯"]):pick(["🔴","✋","⛔"]);
      return {cue,shouldRespond,duration};
    });
    return {id,level,type,topic:"Inhibición y velocidad de respuesta",q:"Pulsa solo ante los estímulos objetivo. No pulses ante los estímulos de parada.",rounds,targetLegend:"🟢 ⭐ 🎯 = PULSA · 🔴 ✋ ⛔ = NO PULSES"};
  }
  if(type==="spatialSequence"){
    const len=level===1?4:level===2?6:8;
    const sequence=Array.from({length:len},()=>Math.floor(Math.random()*9));
    return {id,level,type,topic:"Memoria visuoespacial",q:"Observa el recorrido de luces y repítelo en el mismo orden.",sequence,flashMs:level===1?520:level===2?420:340};
  }
  if(type==="nback"){
    const n=level===1?1:2;
    const pool=["🎧","📘","🍎","🚲","🎬","⚽"];
    const length=level===1?10:level===2?12:14;
    const sequence=Array.from({length},()=>pick(pool));
    for(let i=n;i<sequence.length;i++) if(Math.random()<(domain==='executive'?.25:.35)) sequence[i]=sequence[i-n];
    return {id,level,type,topic:"Memoria de trabajo · "+n+"-back",q:"Indica si el símbolo actual es igual al de "+(n===1?"un paso":"dos pasos")+" atrás.",n,sequence};
  }
  if(type==="ruleShift"){
    const rounds:any[]=[];
    const colors=["verde","azul"], shapes=["círculo","triángulo"];
    const total=level===1?8:level===2?10:12;
    for(let i=0;i<total;i++){
      const rule=level===1?"color":(level===2?(i<5?"color":"forma"):(i%3===0?"forma":"color"));
      const color=pick(colors),shape=pick(shapes);
      rounds.push({rule,color,shape,answer:rule==="color"?color:shape});
    }
    return {id,level,type,topic:"Flexibilidad cognitiva",q:"Responde según la regla que aparece en cada ronda. La regla puede cambiar.",rounds};
  }
  const words=["ROJO","AZUL","VERDE"],inks=["red","blue","green"];
  const rounds=Array.from({length:level===1?6:level===2?9:12},()=>{const word=pick(words),ink=pick(inks);return {word,ink,answer:ink};});
  return {id,level,type:"stroop",topic:"Interferencia",q:"Responde al COLOR de la tinta, no a la palabra escrita.",rounds};
}


const VARIANT_NAMES=["Alex","Noa","Leo","Mara","Dani","Vega"];
const VARIANT_OBJECTS=["cuaderno","botella","mochila","llaves","auriculares","libro","cargador","entrada","carpeta","estuche"];
const VARIANT_PLACES=["biblioteca","polideportivo","estación","tienda","parque","aula","centro cultural","cafetería","museo","casa"];

function routeBand(age:string){
  if(age==="early") return "6-7";
  if(age==="junior") return "8-10";
  if(age==="primary") return "10-12";
  if(age==="middle") return "13-15";
  return "16-18";
}
function variantIndex(){ return Math.floor(Math.random()*360); }
function pickBy<T>(arr:T[],i:number,offset=0){ return arr[(i+offset)%arr.length]; }
function answerItem(base:any,age:string,domain:string,level:number,v:number){
  const numericQuestion=["division","middleMath","teenMath"].includes(domain)&&!base.scenario&&!base.text&&!base.stimulus;
  return {...base,...(numericQuestion?{requiresStimulus:false}:{}),id:"v240-"+domain+"-"+age+"-"+level+"-"+v+"-"+crypto.randomUUID(),level,contentKey:"v240:"+age+":"+domain+":"+level+":"+v,mechanic:base.mechanic||("variant_"+domain+"_"+(v%6))};
}

function variantGeometry(level:number,v:number){
  const base=3+v%18,height=2+Math.floor(v/18)%12;
  const triangle=level===3,width=triangle?base*2:base;
  const result=level===1?2*(width+height):triangle?width*height/2:width*height;
  const unit=level===1?"cm":"cm²",answer=String(result)+" "+unit;
  return answerItem({type:"standard",mechanic:level===1?"geometry_perimeter":level===2?"geometry_rectangle_area":"geometry_triangle_area",
    q:level===1?"¿Cuál es el perímetro del rectángulo?":triangle?"¿Cuál es el área del triángulo?":"¿Cuál es el área del rectángulo?",
    stimulus:[{type:"text",text:triangle?"Triángulo: la altura es perpendicular a la base.":"Rectángulo: los lados opuestos tienen la misma longitud."},{type:"table",rows:[["Base",String(width)+" cm"],["Altura",String(height)+" cm"]]}],
    requiresStimulus:true,opts:[answer,String(result+1)+" "+unit,String(result+2)+" "+unit,String(Math.max(0,result-1))+" "+unit],a:answer},"primary","geometry",level,v);
}

function variantMath(age:string,domain:string,level:number,v:number){
  const band=routeBand(age), mode=v%6, n=3+(v%8), m=2+((v*3)%7);
  if(band==="6-7"){
    if(mode===0) return answerItem({topic:"Matemáticas · cálculo",q:"¿Cuánto es "+n+" + "+m+"?",opts:shuffle([String(n+m),String(n+m+1),String(Math.max(0,n+m-1)),String(n+m+2)]),a:String(n+m)},age,domain,level,v);
    if(mode===1){const a=n+5,b=Math.min(a-1,m);return answerItem({topic:"Matemáticas · resta",q:"Tienes "+a+" pegatinas y regalas "+b+". ¿Cuántas quedan?",opts:shuffle([String(a-b),String(a-b+1),String(a-b+2),String(Math.max(0,a-b-1))]),a:String(a-b)},age,domain,level,v);}
    if(mode===2){const boxes=2+(v%4),each=2+(v%3),ans=boxes*each;return answerItem({topic:"Matemáticas · grupos",q:"Hay "+boxes+" cajas con "+each+" lápices en cada una. ¿Cuántos lápices hay?",opts:shuffle([String(ans),String(ans+2),String(ans-1),String(ans+1)]),a:String(ans)},age,domain,level,v);}
    if(mode===3){const start=2+(v%5),step=2;const ans=start+step*3;return answerItem({topic:"Matemáticas · series",q:"Continúa: "+start+", "+(start+step)+", "+(start+2*step)+", __",opts:shuffle([String(ans),String(ans+1),String(ans-1),String(ans+2)]),a:String(ans)},age,domain,level,v);}
    if(mode===4){const hour=16+(v%2),mins=(v%2)*15,dur=15+15*(v%3);let total=hour*60+mins+dur;const h=Math.floor(total/60),mm=String(total%60).padStart(2,"0"),ans=h+":"+mm;return answerItem({topic:"Matemáticas · tiempo",q:"Una actividad empieza a las "+hour+":"+String(mins).padStart(2,"0")+" y dura "+dur+" minutos. ¿A qué hora termina?",opts:shuffle([ans,h+":"+String((total%60+15)%60).padStart(2,"0"),hour+":45",(h+1)+":00"]),a:ans},age,domain,level,v);}
    const total=6+2*(v%5),people=2,ans=total/people;return answerItem({topic:"Matemáticas · reparto",q:"Repartes "+total+" cromos por igual entre 2 personas. ¿Cuántos recibe cada una?",opts:shuffle([String(ans),String(ans+1),String(ans-1),String(ans+2)]),a:String(ans)},age,domain,level,v);
  }
  if(band==="8-10"||band==="10-12"){
    if(mode===0){const a=20+(v*7)%60,b=10+(v*5)%40,ans=a+b;return answerItem({topic:"Matemáticas · cálculo",q:"¿Cuánto es "+a+" + "+b+"?",opts:shuffle([String(ans),String(ans+10),String(ans-10),String(ans+1)]),a:String(ans)},age,domain,level,v);}
    if(mode===1){const packs=3+(v%6),each=4+(v%5),ans=packs*each;return answerItem({topic:"Matemáticas · multiplicación",q:"Hay "+packs+" paquetes con "+each+" unidades cada uno. ¿Cuántas unidades hay?",opts:shuffle([String(ans),String(ans+packs),String(ans-each),String(ans+each)]),a:String(ans)},age,domain,level,v);}
    if(mode===2){const people=3+(v%4),each=4+(v%6),total=people*each;return answerItem({topic:"Matemáticas · división",q:"Repartes "+total+" cartas por igual entre "+people+" personas. ¿Cuántas recibe cada una?",opts:shuffle([String(each),String(each+1),String(each-1),String(people)]),a:String(each)},age,domain,level,v);}
    if(mode===3){const price=5+(v%9),qty=2+(v%4),ans=price*qty;return answerItem({topic:"Matemáticas · dinero",q:"Cada entrada cuesta "+price+" €. Compras "+qty+". ¿Cuánto pagas?",opts:shuffle([ans+" €",(ans+price)+" €",(ans-2)+" €",(price+qty)+" €"]),a:ans+" €"},age,domain,level,v);}
    if(mode===4){const h=16+(v%3),min=[5,20,35,45][v%4],dur=[25,35,45,55][v%4],t=h*60+min+dur,ans=Math.floor(t/60)+":"+String(t%60).padStart(2,"0");return answerItem({topic:"Matemáticas · tiempo",q:"Empiezas a las "+h+":"+String(min).padStart(2,"0")+" y tardas "+dur+" minutos. ¿Cuándo terminas?",opts:shuffle([ans,h+":50",(h+1)+":00",(h+1)+":15"]),a:ans},age,domain,level,v);}
    const old=20+5*(v%5),disc=5+5*(v%3),ans=old-disc;return answerItem({topic:"Matemáticas · compra",q:"Un artículo costaba "+old+" € y tiene "+disc+" € de descuento. ¿Precio final?",opts:shuffle([ans+" €",old+" €",(ans+5)+" €",(ans-5)+" €"]),a:ans+" €"},age,domain,level,v);
  }
  if(band==="13-15"){
    if(mode===0){const base=40+10*(v%6),pct=[10,20,25][v%3],ans=base*pct/100;return answerItem({topic:"Matemáticas · porcentajes",q:"¿Cuánto es el "+pct+" % de "+base+"?",opts:shuffle([ans+"",String(ans+5),String(ans-5),String(base-pct)]),a:String(ans)},age,domain,level,v);}
    if(mode===1){const x=3+(v%8),b=4+(v%6),rhs=2*x+b;return answerItem({topic:"Matemáticas · ecuaciones",q:"Resuelve: 2x + "+b+" = "+rhs,opts:shuffle([String(x),String(x+1),String(x-1),String(b)]),a:String(x)},age,domain,level,v);}
    if(mode===2){const a=2+(v%5),b=3+(v%4),k=2+(v%4);return answerItem({topic:"Matemáticas · proporcionalidad",q:"Si "+a+" cuadernos cuestan "+(a*k)+" €, ¿cuánto cuestan "+b+" cuadernos al mismo precio?",opts:shuffle([b*k+" €",(b*k+2)+" €",(a*k)+" €",(a+b)+" €"]),a:b*k+" €"},age,domain,level,v);}
    if(mode===3){const nums=[4+v%5,7+v%4,9+v%6,12+v%7];const ans=nums.reduce((a,b)=>a+b,0)/4;return answerItem({topic:"Matemáticas · media",q:"Calcula la media de "+nums.join(", ")+".",opts:shuffle([String(ans),String(ans+1),String(ans-1),String(nums[0])]),a:String(ans)},age,domain,level,v);}
    if(mode===4){const p=20+5*(v%8),disc=[10,15,20][v%3],ans=(p*(100-disc)/100).toFixed(2).replace(".",",");return answerItem({topic:"Matemáticas · descuentos",q:"Una prenda cuesta "+p+" € y tiene un "+disc+" % de descuento. ¿Precio aproximado final?",opts:shuffle([ans+" €",p+" €",(p-disc)+" €",(p+disc)+" €"]),a:ans+" €"},age,domain,level,v);}
    const speed=60+10*(v%4),mins=30+15*(v%3),ans=speed*(mins/60);return answerItem({topic:"Matemáticas · razón",q:"A "+speed+" km/h, ¿qué distancia recorres en "+mins+" minutos?",opts:shuffle([ans+" km",(ans+10)+" km",(ans-10)+" km",speed+" km"]),a:ans+" km"},age,domain,level,v);
  }
  if(mode===0){const x=2+(v%9),b=5+(v%7),rhs=3*x+b;return answerItem({topic:"Matemáticas · álgebra",q:"Resuelve: 3x + "+b+" = "+rhs,opts:shuffle([String(x),String(x+2),String(x-1),String(b)]),a:String(x)},age,domain,level,v);}
  if(mode===1){const base=80+20*(v%6),pct=[12,15,18,20][v%4],ans=base*pct/100;return answerItem({topic:"Matemáticas · porcentajes",q:"Calcula el "+pct+" % de "+base+".",opts:shuffle([String(ans),String(ans+4),String(ans-4),String(base-pct)]),a:String(ans)},age,domain,level,v);}
  if(mode===2){const a=2+(v%4),b=5+(v%5),c=3+(v%6),ans=a*b+c;return answerItem({topic:"Matemáticas · expresión",q:"Calcula "+a+" × "+b+" + "+c+".",opts:shuffle([String(ans),String((a*(b+c))),String(ans-3),String(ans+3)]),a:String(ans)},age,domain,level,v);}
  if(mode===3){const vals=[10+v%6,12+v%5,15+v%4,18+v%7,20+v%8];const sorted=[...vals].sort((a,b)=>a-b),ans=sorted[2];return answerItem({topic:"Matemáticas · datos",q:"¿Cuál es la mediana de "+vals.join(", ")+"?",opts:shuffle([String(ans),String(sorted[0]),String(sorted[4]),String(Math.round(vals.reduce((a,b)=>a+b,0)/5))]),a:String(ans)},age,domain,level,v);}
  if(mode===4){const init=100+20*(v%5),rate=[5,10,15][v%3],ans=(init*(1+rate/100)).toFixed(0);return answerItem({topic:"Matemáticas · variación porcentual",q:"Una cantidad de "+init+" aumenta un "+rate+" %. ¿Cuál es el nuevo valor?",opts:shuffle([ans,String(init+rate),String(init-rate),String(init)]),a:ans},age,domain,level,v);}
  const km=12+2*(v%8),mins=18+3*(v%6),rate=mins/km,target=20,ans=Math.round(rate*target);return answerItem({topic:"Matemáticas · proporcionalidad",q:"Si "+km+" km requieren "+mins+" min a ritmo constante, ¿cuánto tardarías aproximadamente en 20 km?",opts:shuffle([ans+" min",(ans+5)+" min",(ans-5)+" min",mins+" min"]),a:ans+" min"},age,domain,level,v);
}

function variantLanguage(age:string,domain:string,level:number,v:number){
  const band=routeBand(age), name=pickBy(VARIANT_NAMES,v), place=pickBy(VARIANT_PLACES,v,2), obj=pickBy(VARIANT_OBJECTS,v,3), mode=v%6;
  if(band==="6-7"){
    const items=[
      {q:"¿Qué palabra nombra un animal?",opts:["gato","mesa","azul","saltar"],a:"gato"},
      {q:"Completa: «"+name+" ___ un libro».",opts:["lee","verde","mesa","rápido"],a:"lee"},
      {q:"¿Qué palabra significa casi lo mismo que «feliz»?",opts:["contento","cansado","alto","lejos"],a:"contento"},
      {scenario:name+" dejó "+obj+" en la mesa y salió.",q:"¿Dónde dejó "+name+" "+obj+"?",opts:["En la mesa","En "+place,"En una mochila","No se sabe"],a:"En la mesa"},
      {q:"¿Cuál está bien ordenada?",opts:["La niña corre.","Niña la corre.","Corre la niña el.","La corre niña."],a:"La niña corre."},
      {scenario:"«Lleva "+obj+" azul; el rojo se queda en casa».",q:"¿Qué debes llevar?",opts:[obj+" azul",obj+" rojo","Los dos","Ninguno"],a:obj+" azul"}
    ];
    return answerItem({topic:"Lenguaje "+band,...items[mode]},age,domain,level,v);
  }
  if(band==="8-10"||band==="10-12"){
    const items=[
      {scenario:name+" terminó su tarea y después preparó "+obj+".",q:"¿Qué hizo después?",opts:["Preparó "+obj,"Empezó la tarea","Salió antes","No se sabe"],a:"Preparó "+obj},
      {q:"Completa mejor: «No llevaba paraguas; ___ se mojó».",opts:["por eso","aunque","mientras","sin embargo"],a:"por eso"},
      {scenario:"La calle estaba mojada y varias personas cerraban sus paraguas.",q:"¿Qué inferencia está mejor apoyada?",opts:["Había llovido hace poco","Era de noche","Todos iban a "+place,"Hacía mucho calor"],a:"Había llovido hace poco"},
      {scenario:"«Si no queda leche, compra yogur». No queda leche.",q:"¿Qué corresponde hacer?",opts:["Comprar yogur","No comprar nada","Comprar dos leches","Esperar"],a:"Comprar yogur"},
      {q:"¿Qué oración resume mejor «"+name+" preparó todo la noche anterior para no perder tiempo por la mañana»?",opts:[name+" se organizó con antelación",name+" olvidó sus cosas",name+" cambió de plan",name+" llegó tarde"],a:name+" se organizó con antelación"},
      {scenario:"Cartel: «Entrada gratis hasta las 18:00». Son las 17:45.",q:"¿Qué puedes concluir?",opts:["Todavía puede entrar gratis","Debe pagar","Está cerrado","No se sabe"],a:"Todavía puede entrar gratis"}
    ];
    return answerItem({topic:"Lenguaje "+band,...items[mode]},age,domain,level,v);
  }
  if(band==="13-15"){
    const items=[
      {scenario:"«No tenía todos los datos. ___ decidió esperar antes de sacar conclusiones».",q:"¿Qué conector encaja mejor?",opts:["Por eso","Aunque","Mientras","Sin embargo"],a:"Por eso"},
      {scenario:"Una publicación afirma que un método funciona porque tres compañeros mejoraron.",q:"¿Qué limita más esa conclusión?",opts:["La muestra es muy pequeña","La frase es corta","No aparece el lugar","Los compañeros son estudiantes"],a:"La muestra es muy pequeña"},
      {scenario:name+" escribe: «Vale, haz lo que quieras».",q:"¿Qué interpretación es más rigurosa?",opts:["El tono puede ser ambiguo y necesita contexto","Siempre expresa enfado","Siempre expresa acuerdo","No puede tener intención implícita"],a:"El tono puede ser ambiguo y necesita contexto"},
      {scenario:"Un informe muestra mejora tras una medida, pero también cambió el profesor.",q:"¿Qué conclusión es más prudente?",opts:["No puede atribuirse todo a una sola causa","La medida fue la única causa","El profesor no influye","No hubo mejora"],a:"No puede atribuirse todo a una sola causa"},
      {q:"¿Cuál es el argumento más sólido?",opts:["El que aporta datos comparables y una fuente","El que usa palabras más largas","El que repite más veces la conclusión","El que tiene más adjetivos"],a:"El que aporta datos comparables y una fuente"},
      {scenario:"Dos fuentes dan cifras distintas sobre el mismo tema.",q:"¿Qué conviene hacer primero?",opts:["Revisar fecha, método y fuente de ambas","Elegir la cifra mayor","Promediarlas sin más","Descartar las dos"],a:"Revisar fecha, método y fuente de ambas"}
    ];
    return answerItem({topic:"Lenguaje "+band,...items[mode]},age,domain,level,v);
  }
  const items=[
    {scenario:"Un artículo presenta correlación entre dos variables y concluye causalidad.",q:"¿Cuál es el principal problema?",opts:["La correlación por sí sola no demuestra causalidad","Falta una cita textual","La muestra debe ser siempre enorme","Nunca puede estudiarse causalidad"],a:"La correlación por sí sola no demuestra causalidad"},
    {scenario:"Dos estudios llegan a conclusiones distintas y usan muestras diferentes.",q:"¿Qué paso es más riguroso?",opts:["Comparar diseño, muestra y medidas antes de decidir","Elegir el más reciente automáticamente","Elegir el que coincide contigo","Sumar sus porcentajes"],a:"Comparar diseño, muestra y medidas antes de decidir"},
    {q:"¿Qué formulación distingue mejor hecho de interpretación?",opts:["Los datos muestran X; una posible explicación es Y","X demuestra definitivamente Y","Y es obvio","Todo el mundo sabe Y"],a:"Los datos muestran X; una posible explicación es Y"},
    {scenario:"Un mensaje breve parece brusco, pero no conoces el contexto.",q:"¿Qué interpretación es más prudente?",opts:["Puede tener varias lecturas; conviene comprobar el contexto","Es una agresión segura","Es una broma segura","No tiene ningún significado"],a:"Puede tener varias lecturas; conviene comprobar el contexto"},
    {scenario:"Una noticia cita una cifra sin enlazar la fuente original.",q:"¿Qué harías para verificarla?",opts:["Buscar la fuente primaria y su metodología","Compartirla si parece plausible","Mirar solo los comentarios","Aceptar la cifra si es precisa"],a:"Buscar la fuente primaria y su metodología"},
    {q:"¿Qué mejora más la claridad de un argumento?",opts:["Explicitar premisas, evidencia y conclusión","Añadir tecnicismos innecesarios","Usar frases más largas","Eliminar los contraargumentos"],a:"Explicitar premisas, evidencia y conclusión"}
  ];
  return answerItem({topic:"Lenguaje "+band,...items[mode]},age,domain,level,v);
}

function variantReading(age:string,domain:string,level:number,v:number){
  const name=pickBy(VARIANT_NAMES,v), obj=pickBy(VARIANT_OBJECTS,v,4), place=pickBy(VARIANT_PLACES,v,1), mode=v%6;
  const band=routeBand(age);
  const common=[
    {title:"El mensaje",text:name+" debe llevar "+obj+" a "+place+" antes de las 17:30.",q:"¿Qué debe llevar "+name+"?",opts:[obj,"Una bebida","Un abrigo","No se indica"],a:obj},
    {title:"El horario",text:"La actividad empieza a las 16:30 y termina a las 17:15. Después hay un descanso.",q:"¿Cuánto dura la actividad?",opts:["30 min","45 min","60 min","75 min"],a:"45 min"},
    {title:"La condición",text:"Para participar hay que inscribirse antes del viernes y llevar autorización.",q:"¿Qué se necesita además de inscribirse?",opts:["Autorización","Dinero","Uniforme","Teléfono"],a:"Autorización"},
    {title:"Cambio de plan",text:"La visita era al parque, pero empezó a llover y se trasladó al museo.",q:"¿Por qué cambió el lugar?",opts:["Porque empezó a llover","Porque cerró el museo","Porque era tarde","No se explica"],a:"Porque empezó a llover"},
    {title:"Preparación",text:name+" terminó el contenido el miércoles y el jueves lo revisó antes de entregarlo.",q:"¿Qué hizo el jueves?",opts:["Lo revisó","Lo empezó","Lo entregó sin revisar","Lo perdió"],a:"Lo revisó"},
    {title:"Comparación",text:"La ruta A tarda 25 minutos casi siempre. La B tarda entre 20 y 40.",q:"¿Cuál tiene tiempo más predecible?",opts:["La ruta A","La ruta B","Las dos igual","No se puede comparar"],a:"La ruta A"}
  ];
  const x=common[mode];
  if(band==="6-7"&&mode>2) return answerItem({topic:"Lectura "+band,title:"Nota breve",text:name+" dejó "+obj+" encima de la mesa.",q:"¿Dónde está "+obj+"?",opts:["Encima de la mesa","En "+place,"En una mochila","No aparece"],a:"Encima de la mesa"},age,domain,level,v);
  return answerItem({topic:"Lectura "+band,...x},age,domain,level,v);
}

function variantAttention(age:string,domain:string,level:number,v:number){
  const mode=v%6,name=pickBy(VARIANT_NAMES,v),obj=pickBy(VARIANT_OBJECTS,v,2);
  const code=String.fromCharCode(65+(v%20))+String(2+(v%8))+"-"+String.fromCharCode(75+(v%10))+String(1+(v%7));
  const items=[
    {topic:"Atención · comparación",q:"¿Cuál coincide exactamente con "+code+"?",opts:[code,code.replace("-",""),code.split("").reverse().join(""),code.slice(0,-1)+String((v%7)+2)],a:code},
    {topic:"Atención · doble criterio",scenario:"A) azul-7 · B) rojo-8 · C) azul-8 · D) verde-8",q:"Elige la opción azul y par.",opts:["A","B","C","D"],a:"C"},
    {topic:"Atención · información relevante",scenario:"Necesitas "+obj+", llaves y botella. Ves "+obj+", auriculares, llaves y botella.",q:"¿Qué objeto puedes ignorar?",opts:[obj,"Auriculares","Llaves","Botella"],a:"Auriculares"},
    {topic:"Atención · horario",scenario:"16:20 línea A · 16:35 línea B · 16:50 línea A · 17:05 línea C",q:"¿Cuál es la segunda salida de la línea A?",opts:["16:20","16:35","16:50","17:05"],a:"16:50"},
    {topic:"Atención · seguimiento de regla",scenario:"Regla actual: elige números impares.",q:"¿Qué opción cumple la regla?",opts:["4","8","7","2"],a:"7"},
    {topic:"Atención · consigna múltiple",scenario:"Selecciona un archivo solo si es PDF, fue modificado hoy y contiene «final». A) final.pdf hoy · B) final.docx hoy · C) informe.pdf hoy · D) final.pdf ayer",q:"¿Cuál cumple las tres condiciones?",opts:["A","B","C","D"],a:"A"}
  ];
  const x=items[mode];
  if(routeBand(age)==="6-7"){
    const simple=[
      {topic:"Atención visual",q:"¿Cuál es diferente? ⭐ ⭐ 🌙 ⭐",opts:["⭐","🌙","Los dos","Ninguno"],a:"🌙"},
      {topic:"Atención selectiva",q:"Elige solo el animal.",opts:["🐶","🚲","📘","🍎"],a:"🐶"},
      {topic:"Atención · posición",scenario:"🍎  📘  🚲  ⭐",q:"¿Qué está después del libro?",opts:["🍎","🚲","⭐","Nada"],a:"🚲"},
      {topic:"Atención · color y forma",q:"Elige el círculo azul.",opts:["🔵","🟦","🔴","🟢"],a:"🔵"},
      {topic:"Atención · número",q:"Elige el número par.",opts:["3","5","8","9"],a:"8"},
      {topic:"Atención · lista",scenario:"Lista: pan, leche, manzana. También aparece jabón.",q:"¿Qué no estaba en la lista?",opts:["Pan","Leche","Manzana","Jabón"],a:"Jabón"}
    ]; return answerItem(simple[mode],age,domain,level,v);
  }
  return answerItem(x,age,domain,level,v);
}

function variantExecutive(age:string,domain:string,level:number,v:number){
  const name=pickBy(VARIANT_NAMES,v),obj=pickBy(VARIANT_OBJECTS,v),mode=v%6;
  const band=routeBand(age);
  const mins=20+5*(v%5),prep=5+5*(v%3),available=mins+prep+5;
  const items=[
    {type:"executiveDecision",topic:"Funciones ejecutivas · priorización",scenario:"Tienes una tarea importante de "+mins+" minutos y ordenar material puede esperar.",q:"¿Qué conviene hacer primero?",opts:["La tarea importante","Ordenar material","Alternar cada minuto","No empezar"],a:"La tarea importante"},
    {type:"executiveDecision",topic:"Funciones ejecutivas · tiempo",scenario:"Dispones de "+available+" minutos. La tarea tarda "+mins+" y preparar "+obj+" tarda "+prep+".",q:"¿Cabe todo en el tiempo disponible?",opts:["Sí, con 5 minutos de margen","No","Sobran 20 minutos","Solo cabe una cosa"],a:"Sí, con 5 minutos de margen"},
    {type:"executiveDecision",topic:"Funciones ejecutivas · revisión",scenario:name+" termina una tarea con 10 minutos de margen antes de entregarla.",q:"¿Qué uso es más estratégico de ese tiempo?",opts:["Revisar los puntos importantes","Empezar otra tarea larga","Ignorar el margen","Cambiar todo desde cero"],a:"Revisar los puntos importantes"},
    {type:"executiveDecision",topic:"Funciones ejecutivas · interrupciones",scenario:"Llegan mensajes no urgentes mientras "+name+" trabaja en algo complejo.",q:"¿Qué estrategia protege mejor la tarea?",opts:["Silenciar avisos durante un bloque","Responder cada mensaje","Cambiar de tarea siempre","Dejar todas las ventanas abiertas"],a:"Silenciar avisos durante un bloque"},
    {type:"executiveDecision",topic:"Funciones ejecutivas · imprevistos",scenario:"El plan era salir a las 17:00, pero el trayecto se retrasa 15 minutos.",q:"¿Qué conviene hacer?",opts:["Actualizar el plan con el nuevo tiempo","Ignorar el retraso","Mantener todos los horarios como si nada","Cancelar todo"],a:"Actualizar el plan con el nuevo tiempo"},
    {type:"executiveDecision",topic:"Funciones ejecutivas · secuencia",scenario:"Antes de enviar un trabajo hay que comprobar versión, destinatario y archivo adjunto.",q:"¿Qué acción debe ocurrir justo antes de enviar?",opts:["Verificar destinatario y adjunto","Cerrar el ordenador","Empezar otro trabajo","Borrar el archivo"],a:"Verificar destinatario y adjunto"}
  ];
  if(band==="6-7"){
    const simple=[
      {type:"executiveDecision",topic:"Organización",scenario:"Debes guardar los lápices y luego coger la mochila.",q:"¿Qué haces primero?",opts:["Guardar los lápices","Salir","Coger otra cosa","Da igual"],a:"Guardar los lápices"},
      {type:"executiveDecision",topic:"Rutina",scenario:"Antes de salir necesitas zapatos y mochila.",q:"¿Qué debes comprobar?",opts:["Que llevas zapatos y mochila","Que la tele está encendida","Que hay dibujos","Nada"],a:"Que llevas zapatos y mochila"},
      {type:"executiveDecision",topic:"Tiempo",scenario:"Tienes 15 minutos. Vestirte tarda 8 y preparar la mochila 5.",q:"¿Puedes hacer las dos cosas?",opts:["Sí, sobran 2 minutos","No","Sobran 10","No se sabe"],a:"Sí, sobran 2 minutos"},
      {type:"executiveDecision",topic:"Control",scenario:"Estás haciendo una tarea y suena una notificación que puede esperar.",q:"¿Qué ayuda a terminar?",opts:["Seguir con la tarea","Mirar todas las notificaciones","Cambiar de actividad","Abandonar"],a:"Seguir con la tarea"},
      {type:"executiveDecision",topic:"Cambio de plan",scenario:"Ibas al parque, pero empieza a llover.",q:"¿Qué haces?",opts:["Buscar un plan de interior","Ignorar la lluvia","Salir sin más","No decidir nada"],a:"Buscar un plan de interior"},
      {type:"executiveDecision",topic:"Revisión",scenario:"Has terminado y aún tienes tiempo.",q:"¿Qué puedes hacer?",opts:["Revisar","Borrar todo","Empezar de nuevo sin mirar","Irte sin comprobar"],a:"Revisar"}
    ]; return answerItem(simple[mode],age,domain,level,v);
  }
  return answerItem(items[mode],age,domain,level,v);
}


function variantMemory(age:string,domain:string,level:number,v:number){
  const band=routeBand(age), mode=v%8;
  const names=["Alex","Noa","Leo","Mara","Dani","Vega","Luna","Hugo"];
  const objects=["cuaderno","botella","mochila","llaves","auriculares","libro","cargador","entrada","carpeta","estuche","mapa","gorra"];
  const cities=["Madrid","Valencia","Sevilla","Zaragoza","Bilbao","Málaga","Valladolid","Alicante"];
  const stores=["Mercado Central","Super Ahorro","La Plaza","Mercado Norte"];
  const days=["lunes","martes","miércoles","jueves","viernes"];
  const name=names[v%names.length], other=names[(v+3)%names.length];
  const obj=objects[v%objects.length], obj2=objects[(v+4)%objects.length];
  const revealMs=band==="6-7"?4500:band==="8-10"?5200:band==="10-12"?6000:6500;
  const mk=(base:any,mechanic:string)=>answerItem({
    type:"memoryReveal",
    revealMs,
    topic:"Memoria · "+base.topic,
    q:base.q||"Memoriza la información. Después desaparecerá.",
    memoryContent:base.memoryContent,
    memoryQuestion:base.memoryQuestion,
    opts:base.opts,
    a:base.a,
    why:base.why||"La respuesta estaba presente en la información mostrada.",
    memoryMechanic:mechanic
  },age,domain,level,v);

  if(band==="6-7"){
    if(mode===0){
      const shown=[objects[v%8],objects[(v+2)%8],objects[(v+5)%8]];
      const target=shown[1], wrong=objects.filter(x=>!shown.includes(x)).slice(0,3);
      return mk({topic:"reconocimiento de objetos",memoryContent:shown.map(x=>({detail:x})),memoryQuestion:"¿Cuál de estos elementos SÍ estaba?",opts:[target,...wrong],a:target},"objects");
    }
    if(mode===1){
      const seq=["sol","casa","árbol","pelota"].slice(0,level+2);
      return mk({topic:"orden",memoryContent:seq.map((x,i)=>({person:String(i+1),detail:x})),memoryQuestion:"¿Qué elemento aparecía en segundo lugar?",opts:[seq[1],seq[0],seq[2]||"nube","estrella"],a:seq[1]},"sequence");
    }
    if(mode===2){
      return mk({topic:"persona y objeto",memoryContent:[{person:name,detail:"lleva "+obj},{person:other,detail:"lleva "+obj2}],memoryQuestion:"¿Qué llevaba "+name+"?",opts:[obj,obj2,"pelota","vaso"],a:obj},"association");
    }
    if(mode===3){
      const places=["mesa","mochila","estante","caja"], place=places[v%places.length];
      return mk({topic:"localización",memoryContent:[{person:obj,detail:"está en "+place},{person:obj2,detail:"está en "+places[(v+1)%places.length]}],memoryQuestion:"¿Dónde estaba "+obj+"?",opts:[place,...places.filter(x=>x!==place)],a:place},"location");
    }
    if(mode===4){
      return mk({topic:"consigna",memoryContent:[{detail:"Primero guarda "+obj},{detail:"Después coge "+obj2}],memoryQuestion:"¿Qué debías hacer primero?",opts:["Guardar "+obj,"Coger "+obj2,"Salir","Esperar"],a:"Guardar "+obj},"instruction");
    }
    if(mode===5){
      const nums=[2+(v%4),5+(v%3),8+(v%2)];
      return mk({topic:"serie breve",memoryContent:nums.map((x,i)=>({person:"Número "+(i+1),detail:String(x)})),memoryQuestion:"¿Cuál era el último número?",opts:[String(nums[2]),String(nums[1]),String(nums[0]),String(nums[2]+1)],a:String(nums[2])},"numbers");
    }
    if(mode===6){
      return mk({topic:"lista funcional",memoryContent:["pan","leche","manzana"].map(x=>({detail:x})),memoryQuestion:"¿Qué alimento estaba en la lista?",opts:["leche","jabón","pilas","champú"],a:"leche"},"list");
    }
    return mk({topic:"día y actividad",memoryContent:[{person:"martes",detail:"natación"},{person:"jueves",detail:"biblioteca"}],memoryQuestion:"¿Qué actividad era el jueves?",opts:["biblioteca","natación","fútbol","música"],a:"biblioteca"},"calendar");
  }

  if(mode===0){
    const count=band==="8-10"?4:band==="10-12"?5:6;
    const shown=Array.from({length:count},(_,i)=>objects[(v+i*2)%objects.length]);
    const target=shown[(v+1)%shown.length],wrong=objects.filter(x=>!shown.includes(x)).slice(0,3);
    return mk({topic:"reconocimiento de lista",memoryContent:shown.map(x=>({detail:x})),memoryQuestion:"¿Cuál de estos elementos SÍ estaba?",opts:[target,...wrong],a:target},"list_recognition");
  }
  if(mode===1){
    const h1=16+(v%2),m1=[5,20,35][v%3],h2=h1+1,m2=[10,25,40][(v+1)%3],destination=cities[v%cities.length];
    const dep=String(h1)+":"+String(m1).padStart(2,"0"), arr=String(h2)+":"+String(m2).padStart(2,"0");
    return mk({topic:"billete de tren",memoryContent:[
      {person:"TREN",detail:cities[(v+2)%cities.length]+" → "+destination},
      {person:"Salida",detail:dep},{person:"Llegada",detail:arr},
      {person:"Coche / asiento",detail:String(2+v%6)+" / "+String(8+v%20)+["A","B","C"][v%3]}
    ],memoryQuestion:v%2===0?"¿A qué hora salía el tren?":"¿Cuál era el destino?",
    opts:v%2===0?[dep,String(h1)+":"+String((m1+10)%60).padStart(2,"0"),arr,"17:00"]:[destination,cities[(v+1)%cities.length],cities[(v+3)%cities.length],cities[(v+5)%cities.length]],
    a:v%2===0?dep:destination},"ticket_train");
  }
  if(mode===2){
    const dest=cities[(v+1)%cities.length],gate=String.fromCharCode(66+(v%5))+String(10+v%20),seat=String(12+v%18)+["A","B","C","D"][v%4];
    return mk({topic:"tarjeta de embarque",memoryContent:[
      {person:"VUELO",detail:"LH"+String(120+v)},{person:"Destino",detail:dest},{person:"Puerta",detail:gate},{person:"Asiento",detail:seat},{person:"Embarque",detail:String(10+v%8)+":"+["05","20","35","50"][v%4]}
    ],memoryQuestion:["¿Cuál era la puerta de embarque?","¿Cuál era el asiento?","¿Cuál era el destino?"][v%3],
    opts:v%3===0?[gate,"A12","C04","D21"]:v%3===1?[seat,"14A","22C","9B"]:[dest,cities[(v+2)%cities.length],cities[(v+4)%cities.length],cities[(v+6)%cities.length]],
    a:v%3===0?gate:v%3===1?seat:dest},"boarding_pass");
  }
  if(mode===3){
    const p1=(1.2+(v%5)*0.35).toFixed(2).replace(".",",")+" €",p2=(2.1+(v%4)*0.45).toFixed(2).replace(".",",")+" €",offer=v%2===0?"2x1":"-25 %";
    return mk({topic:"oferta comercial",memoryContent:[
      {person:stores[v%stores.length],detail:"OFERTAS DE LA SEMANA"},{person:"Pasta",detail:p1},{person:"Yogur",detail:p2+" · "+offer},{person:"Cereales",detail:"3,45 €"},{person:"Jugo",detail:"1,80 €"}
    ],memoryQuestion:v%2===0?"¿Qué producto tenía promoción 2x1?":"¿Qué producto tenía descuento del 25 %?",opts:["Yogur","Pasta","Cereales","Jugo"],a:"Yogur"},"commercial_offer");
  }
  if(mode===4){
    const total=(18.5+(v%6)*3.25).toFixed(2).replace(".",",")+" €",discount=(2+(v%4)).toFixed(2).replace(".",",")+" €";
    return mk({topic:"ticket de compra",memoryContent:[
      {person:"TICKET",detail:stores[(v+1)%stores.length]},{person:"Pan",detail:"1,45 €"},{person:"Fruta",detail:"4,20 €"},{person:"Descuento",detail:"-"+discount},{person:"TOTAL",detail:total}
    ],memoryQuestion:v%2===0?"¿Cuál era el total del ticket?":"¿Qué concepto tenía descuento?",
    opts:v%2===0?[total,"21,50 €","17,90 €","24,00 €"]:["Descuento","Pan","Fruta","TOTAL"],a:v%2===0?total:"Descuento"},"receipt");
  }
  if(mode===5){
    const price=String(19+(v%5)*5)+",99 €",size=["S","M","L"][v%3],color=["azul","verde","negro","coral"][v%4];
    return mk({topic:"tienda online",memoryContent:[
      {person:"Camiseta City",detail:price+" · "+color+" · tallas S/M/L"},{person:"Sudadera Metro",detail:"34,99 € · azul · tallas M/L"},{person:"Pantalón Loop",detail:"29,50 € · negro · tallas S/M"},{person:"Chaqueta Wave",detail:"49,90 € · verde · tallas M/L"}
    ],memoryQuestion:["¿De qué color era la Camiseta City?","¿Qué prenda costaba 34,99 €?","¿Qué tallas tenía el Pantalón Loop?"][v%3],
    opts:v%3===0?[color,"rojo","blanco","morado"]:v%3===1?["Sudadera Metro","Camiseta City","Pantalón Loop","Chaqueta Wave"]:["S/M","M/L","S/L","Solo M"],
    a:v%3===0?color:v%3===1?"Sudadera Metro":"S/M"},"ecommerce");
  }
  if(mode===6){
    const day=days[v%days.length],time=["16:30","17:15","18:00","18:45"][v%4];
    return mk({topic:"agenda y memoria prospectiva",memoryContent:[
      {person:"AGENDA",detail:day+" · "+time},{person:"Actividad",detail:"Entregar "+obj},{person:"Después",detail:"Ir a "+["biblioteca","entrenamiento","tienda","casa"][v%4]}
    ],memoryQuestion:v%2===0?"¿A qué hora era la entrega?":"¿Qué había que entregar?",
    opts:v%2===0?[time,"16:00","17:30","19:00"]:[obj,obj2,"una entrada","un libro"],a:v%2===0?time:obj},"prospective");
  }
  const pairs=[
    {person:name,detail:obj+" · "+cities[v%cities.length]},
    {person:other,detail:obj2+" · "+cities[(v+3)%cities.length]},
    {person:names[(v+5)%names.length],detail:objects[(v+7)%objects.length]+" · "+cities[(v+5)%cities.length]}
  ];
  const target=pairs[v%pairs.length];
  return mk({topic:"asociación persona-contexto",memoryContent:pairs,memoryQuestion:"¿Qué combinación correspondía a "+target.person+"?",
  opts:[target.detail,pairs[(v+1)%pairs.length].detail,pairs[(v+2)%pairs.length].detail,obj2+" · "+cities[(v+6)%cities.length]],a:target.detail},"context_association");
}


function variantSpeed(age:string,domain:string,level:number,v:number){
  const band=routeBand(age),mode=v%12,a=2+(v%7),b=3+((v*2)%8);
  const code=String.fromCharCode(65+v%20)+String(a)+"-"+String.fromCharCode(75+v%10)+String(b);

  if(band==="6-7"){
    const items=[
      {topic:"Razonamiento · series sencillas",q:"¿Qué número sigue?",scenario:"2 · 4 · 6 · __",opts:["7","8","9","10"],a:"8",mechanic:"early_series_2"},
      {topic:"Razonamiento · comparación",q:"¿Qué número es mayor?",scenario:"4\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A07",opts:["4","7","Son iguales","No se sabe"],a:"7",mechanic:"early_compare_number"},
      {topic:"Razonamiento · cálculo",q:"¿Cuánto es 3 + 2?",opts:["4","5","6","7"],a:"5",mechanic:"early_add"},
      {topic:"Razonamiento · clasificación",q:"¿Cuál NO pertenece al grupo?",scenario:"🍎  🍐  🍌  🚲",opts:["🍎","🍐","🍌","🚲"],a:"🚲",mechanic:"early_category"},
      {topic:"Razonamiento · patrón",q:"¿Qué dibujo sigue?",scenario:"🔴 🔵 🔴 🔵 __",opts:["🔴","🔵","🟢","⭐"],a:"🔴",mechanic:"early_pattern"},
      {topic:"Razonamiento · orden",q:"¿Qué número va en medio?",scenario:"3 · __ · 5",opts:["2","4","6","7"],a:"4",mechanic:"early_number_order"},
      {topic:"Razonamiento · cantidad",q:"¿Dónde hay MÁS estrellas?",scenario:"A: ⭐⭐    B: ⭐⭐⭐⭐",opts:["A","B","Hay las mismas","Ninguna"],a:"B",mechanic:"early_quantity"},
      {topic:"Razonamiento · relación",q:"Pájaro es a volar como pez es a…",opts:["nadar","correr","leer","saltar"],a:"nadar",mechanic:"early_analogy"},
      {topic:"Razonamiento · tiempo",q:"Si ahora son las 5 y pasa una hora, ¿qué hora será?",opts:["4","5","6","7"],a:"6",mechanic:"early_clock"},
      {topic:"Razonamiento · reparto",q:"Hay 6 pegatinas para 2 niños. Si reciben lo mismo, ¿cuántas tiene cada uno?",opts:["2","3","4","6"],a:"3",mechanic:"early_share"},
      {topic:"Razonamiento · secuencia",q:"¿Qué va primero?",scenario:"ponerse los zapatos → salir de casa",opts:["Ponerse los zapatos","Salir de casa","Las dos a la vez","No se sabe"],a:"Ponerse los zapatos",mechanic:"early_sequence"},
      {topic:"Razonamiento · forma",q:"¿Cuál tiene 3 lados?",opts:["Triángulo","Cuadrado","Círculo","Rectángulo"],a:"Triángulo",mechanic:"early_shape"}
    ];
    return answerItem(items[mode],age,domain,level,v);
  }

  if(band==="8-10"){
    const items=[
      {topic:"Razonamiento · serie",q:"¿Qué número sigue?",scenario:(2+a)+" · "+(4+a)+" · "+(6+a)+" · __",opts:[String(8+a),String(7+a),String(9+a),String(10+a)],a:String(8+a),mechanic:"junior_series"},
      {topic:"Razonamiento · cálculo mental",q:"¿Cuánto es "+a+" + "+b+"?",opts:[String(a+b),String(a+b+1),String(a+b-1),String(a+b+2)],a:String(a+b),mechanic:"junior_add"},
      {topic:"Razonamiento · comparación",q:"¿Cuál coincide exactamente con "+code+"?",opts:[code,code.replace("-",""),code.slice(0,-1)+String(b+1),String.fromCharCode(66+v%20)+String(a)+"-"+String.fromCharCode(75+v%10)+String(b)],a:code,mechanic:"junior_code"},
      {topic:"Razonamiento · patrón",q:"¿Qué símbolo sigue?",scenario:"▲ ● ▲ ● ▲ __",opts:["●","▲","■","◆"],a:"●",mechanic:"junior_pattern"},
      {topic:"Razonamiento · tiempo",q:"Una actividad empieza a las 17:00 y dura 30 minutos. ¿Cuándo termina?",opts:["17:15","17:30","17:45","18:00"],a:"17:30",mechanic:"junior_time"},
      {topic:"Razonamiento · lógica",q:"Todos los perros son animales. Toby es un perro. ¿Qué sabemos?",opts:["Toby es un animal","Toby es un gato","Toby vuela","No sabemos nada"],a:"Toby es un animal",mechanic:"junior_logic"},
      {topic:"Razonamiento · reparto",q:"Repartes 12 cartas entre 3 personas por igual. ¿Cuántas recibe cada una?",opts:["3","4","5","6"],a:"4",mechanic:"junior_share"},
      {topic:"Razonamiento · dinero",q:"Tienes 10 € y compras algo de 6 €. ¿Cuánto te queda?",opts:["2 €","3 €","4 €","5 €"],a:"4 €",mechanic:"junior_money"},
      {topic:"Razonamiento · comparación",q:"¿Qué duración es mayor?",opts:["50 minutos","1 hora","45 minutos","30 minutos"],a:"1 hora",mechanic:"junior_duration"},
      {topic:"Razonamiento · orden",q:"¿Cuál es el orden de menor a mayor?",opts:["3, 5, 8","8, 5, 3","5, 3, 8","3, 8, 5"],a:"3, 5, 8",mechanic:"junior_sort"},
      {topic:"Razonamiento · analogía",q:"Libro es a leer como música es a…",opts:["escuchar","dibujar","correr","cocinar"],a:"escuchar",mechanic:"junior_analogy"},
      {topic:"Razonamiento · problema breve",q:"Ana tiene 4 cromos y consigue 3 más. ¿Cuántos tiene ahora?",opts:["6","7","8","9"],a:"7",mechanic:"junior_word_problem"}
    ];
    return answerItem(items[mode],age,domain,level,v);
  }

  const items=[
    {topic:"Velocidad · comparación",q:"Encuentra el código idéntico a "+code+".",opts:[code,code.replace("-",""),String.fromCharCode(65+(v+1)%20)+String(a)+"-"+String.fromCharCode(75+v%10)+String(b),code.slice(0,-1)+String(b+1)],a:code},
    {topic:"Velocidad · cálculo",q:"¿Cuánto es "+a+" + "+b+"?",opts:[String(a+b),String(a+b+1),String(a+b-1),String(a+b+2)],a:String(a+b)},
    {topic:"Velocidad · regla",q:"Regla: par = A, impar = B. ¿Qué corresponde a "+(a+b)+"?",opts:["A","B","A y B","Ninguna"],a:(a+b)%2===0?"A":"B"},
    {topic:"Razonamiento · serie",q:"Continúa: "+a+", "+(a+3)+", "+(a+6)+", __",opts:[String(a+9),String(a+8),String(a+10),String(a+6)],a:String(a+9)},
    {topic:"Discriminación",q:"¿Qué pareja es diferente?",opts:["AA-11","BB-22","CC-33","DD-34"],a:"DD-34"},
    {topic:"Razonamiento temporal",q:"Una actividad dura "+(20+5*(v%5))+" minutos y empieza a las 17:00. ¿A qué hora termina?",opts:["17:"+String(20+5*(v%5)).padStart(2,"0"),"17:15","17:45","18:00"],a:"17:"+String(20+5*(v%5)).padStart(2,"0")}
  ];
  return answerItem(items[v%items.length],age,domain,level,v);
}


function variantApplied(age:string,domain:string,level:number,v:number){
  const band=routeBand(age),name=pickBy(VARIANT_NAMES,v),obj=pickBy(VARIANT_OBJECTS,v,5),place=pickBy(VARIANT_PLACES,v,3);

  if(band==="6-7"){
    const items=[
      {topic:"Organización",scenario:"Mañana necesitas el cuaderno azul.",q:"¿Qué puedes hacer hoy para no olvidarlo?",opts:["Meterlo en la mochila","Esconderlo","Dejarlo en otra habitación","No hacer nada"],a:"Meterlo en la mochila",mechanic:"early_applied_prepare"},
      {topic:"Orden de acciones",scenario:"Primero te pones los zapatos. Después sales de casa.",q:"¿Qué haces primero?",opts:["Ponerte los zapatos","Salir de casa","Las dos a la vez","No se sabe"],a:"Ponerte los zapatos",mechanic:"early_applied_order"},
      {topic:"Tiempo",scenario:"Son las 5. Tardas 10 minutos en recoger y sales a las 5:15.",q:"¿Te da tiempo a recoger?",opts:["Sí","No","Solo 5 minutos","No se sabe"],a:"Sí",mechanic:"early_applied_time"},
      {topic:"Lista",scenario:"Necesitas lápiz, cuaderno y botella. Ya tienes lápiz y cuaderno.",q:"¿Qué falta?",opts:["Botella","Lápiz","Cuaderno","Nada"],a:"Botella",mechanic:"early_applied_missing"},
      {topic:"Cambio de plan",scenario:"Querías jugar en el parque, pero empieza a llover mucho.",q:"¿Qué opción tiene más sentido?",opts:["Buscar un juego para dentro","Quedarte bajo la lluvia","Perder tus cosas","No decidir nada"],a:"Buscar un juego para dentro",mechanic:"early_applied_change"},
      {topic:"Comprobación",scenario:"Has terminado la mochila.",q:"¿Qué puedes hacer antes de salir?",opts:["Mirar si llevas todo","Vaciarla","Cambiarlo todo","Dejarla en casa"],a:"Mirar si llevas todo",mechanic:"early_applied_check"},
      {topic:"Prioridad",scenario:"Mañana tienes que llevar una ficha al cole y también quieres ordenar tus juguetes.",q:"¿Qué conviene hacer primero?",opts:["Preparar la ficha","Ordenar los juguetes","Jugar","No hacer nada"],a:"Preparar la ficha",mechanic:"early_applied_priority"},
      {topic:"Elección",scenario:"Hace frío y vas a salir.",q:"¿Qué objeto te puede ayudar?",opts:["Abrigo","Bañador","Almohada","Cepillo de dientes"],a:"Abrigo",mechanic:"early_applied_choice"},
      {topic:"Recado",scenario:"Te piden llevar un libro a la biblioteca.",q:"¿Qué debes coger antes de salir?",opts:["El libro","Una pelota","Un plato","Un mando"],a:"El libro",mechanic:"early_applied_errand"},
      {topic:"Seguridad cotidiana",scenario:"Vas a cruzar una calle.",q:"¿Qué debes hacer antes?",opts:["Mirar a ambos lados","Correr sin mirar","Cerrar los ojos","Dar la espalda"],a:"Mirar a ambos lados",mechanic:"early_applied_safety"},
      {topic:"Rutina",scenario:"Después de lavarte las manos, las tienes mojadas.",q:"¿Qué haces después?",opts:["Secarlas","Ponerte los zapatos","Comer","Salir"],a:"Secarlas",mechanic:"early_applied_routine"},
      {topic:"Solución sencilla",scenario:"No encuentras tu lápiz y tienes que escribir.",q:"¿Qué puedes hacer?",opts:["Pedir otro lápiz","Romper el cuaderno","Irte","No escribir nunca"],a:"Pedir otro lápiz",mechanic:"early_applied_problem"}
    ];
    return answerItem({type:"appliedDecision",...items[v%items.length]},age,domain,level,v);
  }

  if(band==="8-10"){
    const items=[
      {topic:"Organización cotidiana",scenario:"Mañana "+name+" necesita "+obj+".",q:"¿Qué ayuda más a no olvidarlo?",opts:["Prepararlo hoy y revisarlo","Pensarlo al salir","Esperar a que alguien lo recuerde","No hacer nada"],a:"Prepararlo hoy y revisarlo"},
      {topic:"Gestión del tiempo",scenario:"Tienes 30 minutos. Una tarea tarda 20 y preparar la mochila 5.",q:"¿Cabe todo?",opts:["Sí, sobran 5 minutos","No","Sobran 20 minutos","Solo cabe una tarea"],a:"Sí, sobran 5 minutos"},
      {topic:"Seguimiento de instrucciones",scenario:"Primero guarda "+obj+" y después coge las llaves.",q:"¿Qué va primero?",opts:["Guardar "+obj,"Coger las llaves","Salir","Da igual"],a:"Guardar "+obj},
      {topic:"Cambio de plan",scenario:"Ibas a "+place+", pero está cerrado.",q:"¿Qué opción es mejor?",opts:["Buscar una alternativa","Esperar sin comprobar","Ignorar el cierre","Abandonar todos los planes"],a:"Buscar una alternativa"},
      {topic:"Comprobación",scenario:name+" ha preparado la mochila para mañana.",q:"¿Qué ayuda más antes de terminar?",opts:["Revisar una lista","Vaciarla","Cambiar todo","No mirar"],a:"Revisar una lista"},
      {topic:"Prioridad",scenario:"Hay una tarea para mañana y otra opcional sin fecha.",q:"¿Cuál conviene hacer primero?",opts:["La de mañana","La opcional","Las dos a la vez","Ninguna"],a:"La de mañana"}
    ];
    return answerItem({type:"appliedDecision",...items[v%items.length]},age,domain,level,v);
  }

  if(band==="10-12"){
    const items=[
      {topic:"Planificación",scenario:"Son las 17:00. Tienes una tarea de 25 min, preparar "+obj+" 10 min y debes salir a las 17:45.",q:"¿Qué plan deja más margen?",opts:["Tarea y después preparar "+obj,"Esperar 15 min","Preparar solo "+obj,"Alternar cada 2 min"],a:"Tarea y después preparar "+obj},
      {topic:"Información relevante",scenario:"Para llegar a "+place+" importan la hora, el trayecto y un posible retraso. También sabes el color de tu camiseta.",q:"¿Qué dato es irrelevante?",opts:["El color de la camiseta","La hora","El trayecto","El posible retraso"],a:"El color de la camiseta"},
      {topic:"Decisión",scenario:name+" tiene 40 minutos y dos tareas: una urgente de 25 y otra opcional de 30.",q:"¿Qué conviene priorizar?",opts:["La urgente","La opcional","Las dos a la vez","Ninguna"],a:"La urgente"},
      {topic:"Control",scenario:"Mientras haces una tarea llegan mensajes no urgentes.",q:"¿Qué ayuda más?",opts:["Silenciar avisos un rato","Responder todos","Cambiar de tarea","Cerrar el trabajo"],a:"Silenciar avisos un rato"},
      {topic:"Comprobación",scenario:"Has terminado un trabajo con 8 minutos de margen.",q:"¿Qué uso del tiempo es más útil?",opts:["Revisar puntos clave","Empezar otro largo","No hacer nada","Borrar y repetir"],a:"Revisar puntos clave"},
      {topic:"Flexibilidad",scenario:"El plan A ya no es posible.",q:"¿Qué habilidad conviene usar?",opts:["Buscar un plan alternativo","Mantener A aunque no funcione","Esperar sin decidir","Cancelar siempre"],a:"Buscar un plan alternativo"}
    ];
    return answerItem({type:"appliedDecision",...items[v%items.length]},age,domain,level,v);
  }

  const older=band==="13-15"?[
    {topic:"Gestión de tiempo",scenario:"Son las 16:30. Debes entregar una tarea antes de las 18:00; tardas 45 min y a las 17:35 debes salir.",q:"¿Qué plan protege mejor ambas obligaciones?",opts:["Empezar ya y reservar los últimos minutos para revisar","Esperar hasta las 17:00","Hacer otra tarea primero","Entregar después de las 18:00"],a:"Empezar ya y reservar los últimos minutos para revisar"},
    {topic:"Fiabilidad",scenario:"Ruta A tarda 30 min casi siempre. Ruta B tarda entre 20 y 45.",q:"Si llegar puntual es crítico, ¿qué dato importa más?",opts:["La variabilidad del tiempo","Que B a veces sea más rápida","El paisaje","La ruta usada ayer"],a:"La variabilidad del tiempo"},
    {topic:"Prioridades",scenario:"Tienes una prueba mañana y un mensaje no urgente pendiente.",q:"¿Qué estrategia es más razonable?",opts:["Bloque de estudio y responder después","Responder continuamente","Ignorar la prueba","Hacer ambas a la vez"],a:"Bloque de estudio y responder después"},
    {topic:"Verificación",scenario:"Dos webs dan horarios distintos para el mismo evento.",q:"¿Qué haces?",opts:["Comprobar la fuente oficial y la fecha de actualización","Elegir la primera","Promediar las horas","Ignorar ambas"],a:"Comprobar la fuente oficial y la fecha de actualización"},
    {topic:"Presupuesto",scenario:"Tienes 30 €. Necesitas material de 18 € y quieres algo opcional de 15 €.",q:"¿Qué decisión respeta el presupuesto?",opts:["Comprar el material y posponer lo opcional","Comprar ambas cosas","Comprar solo lo opcional","Gastar más y decidir luego"],a:"Comprar el material y posponer lo opcional"},
    {topic:"Imprevisto",scenario:"Un compañero no puede hacer su parte de un trabajo común a última hora.",q:"¿Qué respuesta ejecutiva es mejor?",opts:["Redistribuir tareas y revisar el plazo","Ignorar el problema","Hacer todo sin plan","Cancelar automáticamente"],a:"Redistribuir tareas y revisar el plazo"}
  ]:[
    {topic:"Planificación compleja",scenario:"Tienes dos entregas, una cita y un desplazamiento con margen variable.",q:"¿Qué estrategia reduce más el riesgo de incumplir?",opts:["Ordenar por plazos, estimar tiempos y añadir margen","Empezar por lo más fácil siempre","Trabajar sin estimaciones","Dejar lo importante para el final"],a:"Ordenar por plazos, estimar tiempos y añadir margen"},
    {topic:"Decisión bajo incertidumbre",scenario:"Dos opciones tienen el mismo coste medio, pero una presenta mucha más variabilidad.",q:"Si necesitas previsibilidad, ¿qué criterio debe pesar más?",opts:["La variabilidad y el riesgo","Solo la media","La opción más reciente","La que usaste antes"],a:"La variabilidad y el riesgo"},
    {topic:"Información crítica",scenario:"Una oferta parece muy barata, pero no muestra gastos de envío ni condiciones de devolución.",q:"¿Qué conviene hacer antes de decidir?",opts:["Comprobar coste total y condiciones","Comprar antes de que cambie","Mirar solo la foto","Comparar solo el precio base"],a:"Comprobar coste total y condiciones"},
    {topic:"Carga de trabajo",scenario:"Tienes 90 minutos y tres tareas de 50, 25 y 20 minutos.",q:"¿Qué primera conclusión es correcta?",opts:["No caben las tres sin ajustar el plan","Caben exactamente","Sobran 20 minutos","La duración no importa"],a:"No caben las tres sin ajustar el plan"},
    {topic:"Control de errores",scenario:"Un documento importante está listo, pero contiene datos copiados de varias fuentes.",q:"¿Qué revisión aporta más valor?",opts:["Verificar cifras y fuentes críticas","Cambiar el tipo de letra","Añadir más texto","Reordenar colores"],a:"Verificar cifras y fuentes críticas"},
    {topic:"Flexibilidad estratégica",scenario:"Tu plan depende de una respuesta externa que se retrasa.",q:"¿Qué opción mantiene mejor el progreso?",opts:["Avanzar tareas independientes y fijar un punto de revisión","Esperar sin hacer nada","Abandonar el proyecto","Repetir lo ya hecho"],a:"Avanzar tareas independientes y fijar un punto de revisión"}
  ];
  return answerItem({type:"appliedDecision",...older[v%older.length]},age,domain,level,v);
}

function variantSocial(age:string,domain:string,level:number,v:number){
  const name=pickBy(VARIANT_NAMES,v),mode=v%6;
  const items=[
    {topic:"Perspectiva",scenario:name+" deja un objeto en la mesa y sale. Otra persona lo mueve sin que "+name+" lo vea.",q:"¿Dónde lo buscará "+name+" primero?",opts:["En la mesa","En el lugar nuevo","En cualquier sitio","Sabrá dónde está"],a:"En la mesa"},
    {topic:"Pragmática",scenario:"Alguien mira una ventana abierta y dice «Qué frío hace aquí».",q:"¿Qué puede estar intentando comunicar?",opts:["Que alguien cierre la ventana","Que quiere irse","Que perdió algo","Nada"],a:"Que alguien cierre la ventana"},
    {topic:"Ambigüedad",scenario:"Mensaje: «Vale, perfecto». No conoces el tono ni el contexto.",q:"¿Qué es más riguroso?",opts:["Puede tener varias interpretaciones","Siempre es aprobación","Siempre es ironía","No significa nada"],a:"Puede tener varias interpretaciones"},
    {topic:"Intención e impacto",scenario:"Una broma no pretendía ofender, pero alguien se sintió ridiculizado.",q:"¿Qué afirmación integra mejor ambas perspectivas?",opts:["La intención puede ser neutra y el impacto negativo","Sin mala intención no hay impacto","El impacto demuestra la intención","Solo importa quien habla"],a:"La intención puede ser neutra y el impacto negativo"},
    {topic:"Reparación",scenario:"Notas que la otra persona ha entendido mal lo que dijiste.",q:"¿Qué respuesta suele ayudar más?",opts:["Aclarar la intención y comprobar comprensión","Repetir más fuerte","Ignorarlo","Cambiar de tema"],a:"Aclarar la intención y comprobar comprensión"},
    {topic:"Inferencia social",scenario:"Una persona cancela un plan por cansancio y después aparece en una foto familiar.",q:"¿Qué conclusión es más prudente?",opts:["La foto no demuestra por sí sola que mintiera","Mintió seguro","No estaba cansada","No quería verte"],a:"La foto no demuestra por sí sola que mintiera"}
  ];
  return answerItem({type:"socialScenario",...items[mode]},age,domain,level,v);
}

function variantEnglish(age:string,domain:string,level:number,v:number){
  const name=pickBy(VARIANT_NAMES,v),mode=v%6;
  const items=[
    {topic:"English · vocabulary",q:"Choose the correct word: «I carry my books in my ___».",opts:["backpack","window","river","plate"],a:"backpack"},
    {topic:"English · grammar",q:"Choose the correct sentence.",opts:[name+" goes to school every day.",name+" go to school every day.",name+" going school every day.",name+" gone to school every day."],a:name+" goes to school every day."},
    {topic:"English · reading",scenario:name+" has a train at 17:20 and arrives at the station at 17:05.",q:"How many minutes early is "+name+"?",opts:["10","15","20","25"],a:"15"},
    {topic:"English · inference",scenario:"The street is wet and people are closing their umbrellas.",q:"What is the best inference?",opts:["It has probably rained","It is snowing","It is midnight","The shops are closed"],a:"It has probably rained"},
    {topic:"English · pragmatics",scenario:"A friend writes: «Could you send me the notes when you have a moment?»",q:"What are they asking for?",opts:["The notes","A phone call","A meeting","Money"],a:"The notes"},
    {topic:"English · cohesion",q:"Choose the best connector: «I was tired, ___ I finished the task».",opts:["but","because","before","unless"],a:"but"}
  ];
  return answerItem(items[mode],age,domain,level,v);
}

function variantLiteracy(age:string,domain:string,level:number,v:number){
  const name=pickBy(VARIANT_NAMES,v),mode=v%6;
  const items=[
    {topic:"Lectura + Escritura · idea principal",scenario:name+" explica tres razones para usar transporte público: coste, tráfico y emisiones.",q:"¿Cuál es la idea principal?",opts:["Ventajas del transporte público","Cómo comprar un billete","Tipos de coches","Horarios escolares"],a:"Ventajas del transporte público"},
    {topic:"Lectura + Escritura · evidencia",scenario:"Texto: «La actividad gustó mucho». Datos: participaron 12 personas; 10 la valoraron con 4 o 5 sobre 5.",q:"¿Qué dato apoya mejor la afirmación?",opts:["10 de 12 dieron 4 o 5","La actividad fue un martes","Había 12 sillas","El título era corto"],a:"10 de 12 dieron 4 o 5"},
    {topic:"Lectura + Escritura · resumen",scenario:"Un texto describe cómo preparar materiales, revisar instrucciones y comprobar el trabajo antes de entregarlo.",q:"¿Cuál es el mejor resumen?",opts:["Pasos para organizar una entrega","Historia de una excursión","Lista de compras","Descripción de un lugar"],a:"Pasos para organizar una entrega"},
    {topic:"Lectura + Escritura · precisión",q:"¿Qué frase es más precisa?",opts:["La reunión empieza a las 17:30 en la sala 2.","La reunión es luego.","Hay una reunión por ahí.","La reunión será pronto quizá."],a:"La reunión empieza a las 17:30 en la sala 2."},
    {topic:"Lectura + Escritura · argumento",q:"¿Qué aporta más fuerza a una opinión?",opts:["Una razón apoyada por evidencia","Repetirla muchas veces","Escribirla en mayúsculas","Usar más adjetivos"],a:"Una razón apoyada por evidencia"},
    {topic:"Lectura + Escritura · revisión",q:"Antes de entregar un texto, ¿qué revisión suele ser más útil?",opts:["Comprobar claridad, estructura y errores","Cambiar todas las palabras","Añadir longitud sin motivo","Eliminar los ejemplos"],a:"Comprobar claridad, estructura y errores"}
  ];
  return answerItem(items[mode],age,domain,level,v);
}


function matrixSeed(v:number){ return {m:v%12,k:Math.floor(v/12)%20}; }
function opt4(correct:string,a:string,b:string,c:string){ return [correct,a,b,c]; }
function ageRank(age:string){ return ({early:0,junior:1,primary:2,middle:3,teen:4} as any)[age]??2; }
const MATRIX_OBJ_ICONS:any={cuaderno:"notebook",botella:"bottle",mochila:"backpack",llaves:"keys",auriculares:"headphones",libro:"book",cargador:"keycard",entrada:"ticket",carpeta:"folder",estuche:"pencilCase",mapa:"map",manzana:"apple",platano:"banana",pan:"bread",leche:"milk",pasta:"pasta",huevos:"eggs",jugo:"juice",telefono:"phone"};

function matrixAttention(age:string,level:number,v:number){
  const s=matrixSeed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank<=1;
  const n=2+(k%8), letter=String.fromCharCode(65+(k%20)), code=letter+String(10+k)+"-"+String.fromCharCode(75+(k%10))+String(2+(k%7));
  const times=["16:10","16:25","16:40","16:55","17:10","17:25"];
  const price=(1.25+(k%9)*0.35).toFixed(2).replace(".",",")+" €";
  const items:any[]=[
    {mechanic:"att_exact_code",topic:"Atención · comparación",q:"¿Cuál coincide exactamente con "+code+"?",opts:opt4(code,code.replace("-",""),code.slice(0,-1)+String(3+(k%6)),String.fromCharCode(66+(k%20))+code.slice(1)),a:code},
    {mechanic:"att_odd_one",topic:"Atención · elemento diferente",q:"¿Cuál es diferente?",scenario:easy?"A: ⭐    B: ⭐    C: 🌙    D: ⭐":"A: "+code+"    B: "+code+"    C: "+code.slice(0,-1)+String((3+k%7)%10)+"    D: "+code,opts:["A","B","C","D"],a:"C"},
    {mechanic:"att_target_count",topic:"Atención · conteo",q:"¿Cuántas veces aparece "+(easy?"🍎":"A")+"?",scenario:easy?"🍎 🍐 🍎 🍌 🍎 🍐":"A B A C A D "+(k%2?"A":"B")+" C",opts:easy?["2","3","4","5"]:[String(3+(k%2)),String(2+(k%2)),String(4+(k%2)),String(5+(k%2))],a:easy?"3":String(3+(k%2))},
    {mechanic:"att_double_rule",topic:"Atención · doble criterio",q:easy?"Elige el círculo azul.":"Elige la opción que es azul y tiene número par.",scenario:easy?"🔵  🟦  🔴  🟢":"A) azul-"+String(3+n)+" · B) rojo-"+String(4+n)+" · C) azul-"+String(4+n)+" · D) verde-"+String(5+n),opts:easy?["🔵","🟦","🔴","🟢"]:["A","B","C","D"],a:easy?"🔵":((3+n)%2===0?"A":"C")},
    {mechanic:"att_schedule",topic:"Atención · horario",q:easy?"¿Qué actividad es a las 17:00?":"¿Qué actividad empieza a las "+times[2]+"?",scenario:easy?"16:30 merienda\n17:00 lectura\n17:30 juego":times[0]+"  Estudio\n"+times[1]+"  Descanso\n"+times[2]+"  Deporte\n"+times[3]+"  Lectura",opts:easy?["Lectura","Merienda","Juego","Deporte"]:["Estudio","Descanso","Deporte","Lectura"],a:easy?"Lectura":"Deporte"},
    {mechanic:"att_ticket_lookup",topic:"Atención funcional · billete",q:easy?"¿A qué hora sale el tren?":"¿Cuál es el asiento indicado?",scenario:easy?"TREN\nSalida: 16:20\nLlegada: 17:05":"BILLETE\nMadrid → Valencia\nSalida: "+times[k%times.length]+"\nAsiento: "+String(10+k)+"B\nCoche: "+String(2+k%5),opts:easy?["16:20","17:05","16:40","17:20"]:[String(10+k)+"B",String(11+k)+"A",String(8+k)+"C",String(10+k)+"D"],a:easy?"16:20":String(10+k)+"B"},
    {mechanic:"att_offer_lookup",topic:"Atención funcional · oferta",q:easy?"¿Qué producto cuesta "+price+"?":"¿Qué producto tiene un descuento del 20 %?",scenario:easy?"Pan: "+price+"\nLeche: 2,10 €\nFruta: 3,20 €":"OFERTAS\nPan: 1,40 €\nYogur: -20 %\nPasta: 2x1\nFruta: 3,20 €",opts:easy?["Pan","Leche","Fruta","Yogur"]:["Yogur","Pan","Pasta","Fruta"],a:easy?"Pan":"Yogur"},
    {mechanic:"att_line_departure",topic:"Atención · tabla de salidas",q:"¿Cuál es la segunda salida de la línea A?",scenario:"LÍNEA   HORA\nA       16:20\nB       16:35\nA       16:50\nC       17:05",opts:["16:50","16:20","16:35","17:05"],a:"16:50"},
    {mechanic:"att_position",topic:"Atención · posición",q:easy?"¿Qué está justo después del libro?":"¿Qué elemento ocupa la cuarta posición?",scenario:easy?"🍎     📘     🚲     ⭐":"mapa     botella     llaves     cuaderno     auriculares",opts:easy?["🚲","🍎","⭐","📘"]:["cuaderno","mapa","llaves","auriculares"],a:easy?"🚲":"cuaderno"},
    {mechanic:"att_compare_rows",topic:"Atención · comparación",q:"¿Qué fila es exactamente igual al modelo?",scenario:"MODELO: "+code+"\nA: "+code+"\nB: "+code.replace("-","")+"\nC: "+code.slice(0,-1)+String((3+k%7)%10)+"\nD: "+String.fromCharCode(66+k%20)+code.slice(1),opts:["A","B","C","D"],a:"A"},
    {mechanic:"att_instruction",topic:"Atención · seguimiento de consigna",q:easy?"Elige solo el medio de transporte.":"Sigue la regla actual: selecciona un número impar.",scenario:easy?"📘     🚲     🍎     🎧":"4       8       7       2",opts:easy?["📘","🚲","🍎","🎧"]:["4","8","7","2"],a:easy?"🚲":"7"},
    {mechanic:"att_relevant_info",topic:"Atención · información relevante",q:easy?"Necesitas lápiz y cuaderno. ¿Qué puedes dejar?":"¿Qué dato NO necesitas para llegar puntual?",scenario:easy?"lápiz · cuaderno · pelota":"Hora de salida · duración del trayecto · posibles retrasos · color de la camiseta",opts:easy?["Pelota","Lápiz","Cuaderno","Nada"]:["Color de la camiseta","Hora de salida","Duración","Retrasos"],a:easy?"Pelota":"Color de la camiseta"}
  ];
  return answerItem({...items[m],type:"attentionChoice"},age,"attention",level,v);
}

function matrixMemory(age:string,level:number,v:number){
  const s=matrixSeed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank<=1;
  const objects=["cuaderno","botella","mochila","llaves","auriculares","libro","cargador","entrada","carpeta","estuche","mapa","manzana"];
  const o=(i:number)=>objects[(k+i)%objects.length], icon=(x:string)=>MATRIX_OBJ_ICONS[x]||"book";
  const reveal=rank===0?4500:rank===1?5200:rank===2?6000:6500;
  const city=["Madrid","Valencia","Sevilla","Bilbao","Málaga"][k%5], time=["16:20","16:35","16:50","17:05","17:20"][k%5];
  const mk=(x:any)=>answerItem({...x,type:"memoryReveal",revealMs:reveal,q:x.q||"Memoriza la información. Después desaparecerá."},age,"memory",level,v);
  const items:any[]=[
    {mechanic:"mem_objects",topic:"Memoria · objetos",memoryContent:[o(0),o(2),o(4),o(6)].slice(0,easy?3:4).map((x:string)=>({icon:icon(x),detail:x})),memoryQuestion:"¿Cuál de estos elementos SÍ estaba?",opts:opt4(o(2),o(1),o(3),o(5)),a:o(2)},
    {mechanic:"mem_sequence",topic:"Memoria · secuencia",memoryContent:[{person:"1",detail:o(0)},{person:"2",detail:o(1)},{person:"3",detail:o(2)},{person:"4",detail:o(3)}].slice(0,easy?3:4),memoryQuestion:"¿Qué aparecía en segundo lugar?",opts:opt4(o(1),o(0),o(2),o(4)),a:o(1)},
    {mechanic:"mem_association",topic:"Memoria · asociaciones",memoryContent:[{person:"Alex",detail:o(0)},{person:"Noa",detail:o(3)},{person:"Leo",detail:o(5)}],memoryQuestion:"¿Qué objeto correspondía a Noa?",opts:opt4(o(3),o(0),o(5),o(7)),a:o(3)},
    {mechanic:"mem_location",topic:"Memoria · localización",memoryContent:[{person:o(0),detail:"mesa"},{person:o(2),detail:"mochila"},{person:o(4),detail:"estante"}],memoryQuestion:"¿Dónde estaba "+o(2)+"?",opts:opt4("mochila","mesa","estante","caja"),a:"mochila"},
    {mechanic:"mem_instruction",topic:"Memoria · instrucciones",memoryContent:[{person:"Primero",detail:"guarda "+o(0)},{person:"Después",detail:"coge "+o(1)},{person:"Al final",detail:"revisa "+o(2)}],memoryQuestion:"¿Qué debías hacer primero?",opts:opt4("Guardar "+o(0),"Coger "+o(1),"Revisar "+o(2),"Salir"),a:"Guardar "+o(0)},
    {mechanic:"mem_numbers",topic:"Memoria · números",memoryContent:[{person:"Código",detail:String(20+k)+" - "+String(7+k%8)+" - "+String(3+k%5)}],memoryQuestion:"¿Cuál era el primer número?",opts:opt4(String(20+k),String(21+k),String(7+k%8),String(3+k%5)),a:String(20+k)},
    {mechanic:"mem_shopping",topic:"Memoria · lista de compra",memoryContent:[o(0),o(1),o(2),o(3)].map((x:string)=>({icon:icon(x),detail:x})),memoryQuestion:"¿Qué elemento estaba en la lista?",opts:opt4(o(1),o(5),o(6),o(7)),a:o(1)},
    {mechanic:"mem_calendar",topic:"Memoria · agenda",memoryContent:[{person:"Martes",detail:"biblioteca"},{person:"Jueves",detail:"deporte"},{person:"Viernes",detail:"música"}],memoryQuestion:"¿Qué actividad era el jueves?",opts:opt4("deporte","biblioteca","música","cine"),a:"deporte"},
    {mechanic:"mem_train",topic:"Memoria · billete de tren",memoryContent:[{person:"Destino",detail:city},{person:"Salida",detail:time},{person:"Asiento",detail:String(12+k)+"B"},{person:"Coche",detail:String(2+k%5)}],memoryQuestion:easy?"¿A qué hora salía el tren?":"¿Cuál era el asiento?",opts:easy?opt4(time,"16:00","17:00","17:30"):opt4(String(12+k)+"B",String(11+k)+"A",String(14+k)+"C",String(9+k)+"D"),a:easy?time:String(12+k)+"B"},
    {mechanic:"mem_boarding",topic:"Memoria · tarjeta de embarque",memoryContent:[{person:"Vuelo",detail:"LH"+String(220+k)},{person:"Destino",detail:city},{person:"Puerta",detail:"B"+String(10+k%12)},{person:"Embarque",detail:time}],memoryQuestion:"¿Cuál era el destino?",opts:opt4(city,"Madrid","Barcelona","Lisboa"),a:city},
    {mechanic:"mem_offer",topic:"Memoria · oferta comercial",memoryContent:[{person:"Pasta",detail:"2,40 €"},{person:"Yogur",detail:"-20 %"},{person:"Pan",detail:"1,35 €"},{person:"Fruta",detail:"3,10 €"}],memoryQuestion:"¿Qué producto tenía descuento?",opts:opt4("Yogur","Pasta","Pan","Fruta"),a:"Yogur"},
    {mechanic:"mem_receipt",topic:"Memoria · ticket de compra",memoryContent:[{person:"Pan",detail:"1,35 €"},{person:"Leche",detail:"1,80 €"},{person:"Fruta",detail:"3,20 €"},{person:"TOTAL",detail:String(8+k%5)+",35 €"}],memoryQuestion:"¿Cuál era el total?",opts:opt4(String(8+k%5)+",35 €","7,20 €","9,50 €","10,00 €"),a:String(8+k%5)+",35 €"}
  ];
  return mk(items[m]);
}

function matrixExecutive(age:string,level:number,v:number){
  const s=matrixSeed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank===0;
  if(age==="teen"&&m===4){
    const first=[['PDF','Sí','No','4','Normal'],['PDF','No','Sí','2','Normal'],['TXT','No','Sí','2','Normal'],['TXT','Sí','No','4','Normal']];
    if(level>=2)first.push(['TXT','Sí','Sí','8','Normal'],['PDF','Sí','Sí','8','Normal']);
    const second=first.map(row=>row.slice());
    if(level===3)second[4]=['PDF','No','Sí','2','Urgente'];
    const labels=(block:number)=>first.map((_,j)=>String.fromCharCode(65+(j+k)%first.length)+block);
    const ids1=labels(1),ids2=labels(2),chosen=level===3?4:2;
    const pair=(a:string,b:string)=>a+" → "+b;
    const rule1="Bloque 1: elige un archivo PDF revisado."+(level>=2?" Además, debe ocupar como máximo 5 MB.":"");
    const rule2=level===3?"Bloque 2: cambia el criterio. Elige un archivo urgente, con permiso y de como máximo 3 MB. Ahora no importan el formato ni la revisión.":"Bloque 2: cambia el criterio. Elige un archivo TXT con permiso. Ahora no importa la revisión."+(level===2?" Debe ocupar como máximo 3 MB.":"");
    const rows=(xs:string[][],ids:string[])=>[['Archivo','Formato','Revisado','Permiso',...(level>=2?['Tamaño (MB)']:[]),...(level===3?['Prioridad']:[])],...xs.map((row,j)=>[ids[j],...row.slice(0,3),...(level>=2?[row[3]]:[]),...(level===3?[row[4]]:[])])];
    const answer=pair(ids1[0],ids2[chosen]);
    return answerItem({type:"executiveDecision",mechanic:"exec_rule_switch",topic:"Funciones ejecutivas · aplicar dos criterios",q:"¿Qué archivo eliges en el bloque 1 y en el bloque 2, en ese orden?",stimulus:[{type:'text',text:rule1},{type:'table',header:true,rows:rows(first,ids1)},{type:'text',text:rule2},{type:'table',header:true,rows:rows(second,ids2)}],requiresStimulus:true,opts:opt4(answer,pair(ids1[0],ids2[0]),pair(ids1[2],ids2[chosen]),pair(ids1[1],ids2[1])),a:answer,why:"Aplica las condiciones de cada bloque a sus archivos. En el segundo bloque no conserves los criterios que dejaron de exigirse."},age,"executive",level,v);
  }
  const obj=["cuaderno","mochila","llaves","botella","carpeta"][k%5];
  const simple=(topic:string,scenario:string,q:string,a:string,b:string,c:string,d:string,mech:string)=>answerItem({type:"executiveDecision",topic:"Funciones ejecutivas · "+topic,scenario,q,opts:opt4(a,b,c,d),a,mechanic:mech},age,"executive",level,v);
  const items=[
    ()=>simple("secuencia",easy?"Primero guardas los lápices. Después coges la mochila.":"Antes de enviar una tarea: revisar, adjuntar y enviar.","¿Qué va primero?",easy?"Guardar los lápices":"Revisar","Enviar","Adjuntar","Esperar","exec_sequence"),
    ()=>simple("priorización",easy?"Mañana tienes que llevar una ficha al cole y también quieres ordenar juguetes.":"Tienes una tarea para mañana y otra opcional sin fecha.","¿Qué conviene hacer primero?",easy?"Preparar la ficha":"La tarea de mañana",easy?"Ordenar juguetes":"La opcional","Hacer ambas a la vez","No hacer nada","exec_priority"),
    ()=>simple("planificación temporal",easy?"Tienes 15 minutos. Vestirte tarda 8 y preparar la mochila 5.":"Tienes 40 minutos. Una tarea tarda 25 y preparar "+obj+" tarda 10.","¿Te da tiempo?",easy?"Sí, sobran 2 minutos":"Sí, sobran 5 minutos","No","Sobran 20 minutos","No se sabe","exec_time"),
    ()=>simple("control de distractores",easy?"Estás terminando un dibujo y suena una notificación que puede esperar.":"Trabajas en una tarea compleja y llegan mensajes no urgentes.","¿Qué ayuda más a terminar?",easy?"Seguir con el dibujo":"Silenciar avisos durante un rato","Mirar todos los mensajes","Cambiar de tarea","Dejarlo","exec_inhibition"),
    ()=>simple("cambio de regla",easy?"Primero buscas círculos. Ahora la regla cambia: busca cuadrados.":"Antes seleccionabas pares. La nueva regla es seleccionar impares.","¿Qué debes seguir ahora?",easy?"Buscar cuadrados":"Seleccionar impares",easy?"Buscar círculos":"Seleccionar pares","Las dos reglas","Ninguna","exec_rule_switch"),
    ()=>simple("flexibilidad",easy?"Ibas al parque, pero llueve mucho.":"Tu plan depende de una sala que está cerrada.","¿Qué haces?",easy?"Buscar un juego para dentro":"Buscar una alternativa","Ignorar el problema","Mantener el mismo plan","No decidir","exec_flexibility"),
    ()=>simple("restricciones",easy?"Necesitas lápiz y cuaderno. Solo puedes llevar dos cosas.":"Debes salir en 30 min; tarea 15 min, mochila 8 min y descanso 15 min.","¿Qué plan cumple lo necesario?",easy?"Lápiz y cuaderno":"Tarea y mochila",easy?"Pelota y lápiz":"Descanso y mochila","Todo","Nada","exec_constraints"),
    ()=>simple("revisión",easy?"Has terminado la mochila.":"Has terminado un trabajo con 10 minutos de margen.","¿Qué conviene hacer?",easy?"Revisar si llevas todo":"Revisar puntos importantes","Vaciar todo","Empezar de cero","No mirar","exec_check"),
    ()=>simple("clasificación",easy?"Guarda juntos los objetos de dibujo.":"Organiza archivos por tipo antes de buscarlos.","¿Qué criterio ayuda más?",easy?"Poner lápices y pinturas juntos":"Agrupar por tipo","Mezclar todo","Ordenar al azar","No usar categorías","exec_classify"),
    ()=>simple("meta y pasos",easy?"Quieres preparar la mochila para mañana.":"Quieres entregar un proyecto a tiempo.","¿Qué primer paso ayuda?",easy?"Mirar qué necesitas":"Dividirlo en tareas y plazos","Empezar por cualquier cosa","Esperar al final","No hacer plan","exec_goal"),
    ()=>simple("presupuesto",easy?"Tienes 5 € y un cuento cuesta 4 €.":"Tienes 30 €; algo necesario cuesta 18 € y algo opcional 15 €.","¿Qué opción respeta el dinero?",easy?"Comprar el cuento":"Comprar lo necesario y posponer lo opcional","Comprar todo","Gastar más","No mirar el precio","exec_budget"),
    ()=>simple("memoria de trabajo",easy?"Te dicen: coge el libro y después la botella.":"Debes recordar tres pasos: guardar, comprobar y enviar.","¿Qué debes mantener en mente?",easy?"Libro y después botella":"Los tres pasos en orden","Solo el último","Cualquier paso","Nada","exec_working_memory")
  ];
  return items[m]();
}

function teenPlanReview(level:number,v:number){
  const cases=[
    {
      text:"Participas en un taller de grabación. Para entrar necesitas una identificación y una autorización firmada. Se acepta la autorización en papel o una foto legible. La foto debe estar guardada antes de llegar, porque allí no hay conexión. La organización proporciona los equipos; no tienes que llevar uno propio. Revisa lo que ha preparado una participante.",
      rows:[["Identificación","Guardada en la mochila"],["Autorización","Foto legible del formulario, sin firma"],["Equipo de grabación","Lo proporciona el taller"]],
      q:"¿Qué debe corregir para cumplir los requisitos de entrada?",
      opts:["Conseguir la firma y guardar una foto legible de la autorización firmada","Imprimir la autorización sin firmarla","Llevar un equipo propio y conservar la foto sin firma","Volver a fotografiar la identificación y conservar la autorización sin firma"],
      why:"La identificación está preparada y el taller aporta el equipo. La foto se acepta, pero el formulario debe estar firmado. Imprimirlo sin firma no resuelve el requisito."
    },
    {
      text:"Tu equipo entrega un informe mediante una plataforma. Debe enviarse en PDF, con todos los gráficos y un tamaño máximo de 5 MB. Una persona revisó la versión de las 16:00. Después se añadieron dos gráficos. La entrega aún no se ha enviado y quedan veinte minutos de plazo. Supervisa el plan antes de autorizar el envío.",
      rows:[["16:00","Revisar el PDF de 4 MB, sin los dos gráficos nuevos"],["16:05","Añadir los dos gráficos y exportar un nuevo PDF de 6 MB"],["16:10 · paso propuesto","Enviar el nuevo PDF utilizando la revisión de las 16:00"]],
      q:"¿Qué cambio permite entregar una versión que cumpla todas las condiciones?",
      opts:["Reducir el tamaño conservando los gráficos y revisar el PDF final antes de enviarlo","Enviar el PDF de 4 MB que ya estaba revisado","Revisar el PDF de 6 MB y enviarlo con ese tamaño","Reducir el nuevo PDF a 5 MB y enviarlo usando solo la revisión de las 16:00"],
      why:"La versión revisada no incluye los gráficos nuevos. La versión completa supera el límite y todavía no está revisada. Hay que conservar el contenido, ajustar el tamaño y comprobar el archivo que realmente se enviará."
    },
    {
      text:"Tienes una cita a las 17:00 y debes llegar diez minutos antes para registrarte. El trayecto dura veinte minutos. Antes de salir necesitas descargar un comprobante; el envío del formulario no sirve como comprobante. El sistema tarda cinco minutos en generarlo tras el envío. El formulario ya está revisado. Comprueba este plan sin eliminar ningún requisito.",
      rows:[["16:20","Enviar el formulario"],["16:25","Descargar y comprobar el comprobante"],["16:35 · salida propuesta","Salir hacia la cita"],["16:55 · llegada prevista","Registrarse para la cita de las 17:00"]],
      q:"¿Qué corrección permite llegar dentro del horario de registro con el comprobante?",
      opts:["Mantener el envío y la descarga; salir a las 16:30 como máximo","Mantener la salida a las 16:35 porque la cita empieza a las 17:00","Salir a las 16:20 con el aviso de envío en lugar del comprobante","Enviar a las 16:30 y salir inmediatamente sin descargar el comprobante"],
      why:"El registro exige llegar a las 16:50 como máximo. Con veinte minutos de trayecto, hay que salir a las 16:30 o antes. El comprobante ya estará disponible a las 16:25; el aviso de envío no lo sustituye."
    }
  ];
  const c=cases[Math.max(0,Math.min(2,level-1))];
  return answerItem({type:"appliedDecision",topic:"Cognición aplicada · supervisar un plan",mechanic:"app_plan_review",requiresStimulus:true,
    stimulus:[{type:"text",text:c.text},{type:"table",header:true,rows:[["Elemento o momento","Estado o acción prevista"],...c.rows]}],
    q:c.q,opts:opt4(c.opts[0],c.opts[1],c.opts[2],c.opts[3]),a:c.opts[0],why:c.why},"teen","applied",level,v);
}

function matrixApplied(age:string,level:number,v:number){
  const s=matrixSeed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank===0;
  const obj=["cuaderno","botella","llaves","mochila","entrada"][k%5], place=["biblioteca","colegio","entrenamiento","tienda","estación"][k%5];
  const mk=(topic:string,scenario:string,q:string,a:string,b:string,c:string,d:string,mech:string)=>answerItem({type:"appliedDecision",topic:"Cognición aplicada · "+topic,scenario,q,opts:opt4(a,b,c,d),a,mechanic:mech},age,"applied",level,v);
  const items=[
    ()=>mk("preparación",easy?"Mañana necesitas el cuaderno azul.":"Mañana necesitas "+obj+" para "+place+".","¿Qué ayuda a no olvidarlo?",easy?"Meterlo hoy en la mochila":"Prepararlo hoy y revisarlo","Pensarlo al salir","Esperar a que alguien lo recuerde","No hacer nada","app_prepare"),
    ()=>mk("tiempo",easy?"Son las 5. Tardas 10 minutos en recoger y sales a las 5:15.":"Tienes 35 minutos. Una tarea tarda 20 y preparar la mochila 10.","¿Te da tiempo?",easy?"Sí":"Sí, sobran 5 minutos","No","Sobran 20 minutos","No se sabe","app_time"),
    ()=>age==="teen"?teenPlanReview(level,v):mk("lista",easy?"Necesitas lápiz, cuaderno y botella. Ya tienes lápiz y cuaderno.":"Necesitas cuaderno, llaves y botella. Ya tienes llaves y botella.","¿Qué falta?",easy?"Botella":"Cuaderno",easy?"Lápiz":"Llaves",easy?"Cuaderno":"Botella","Nada","app_missing"),
    ()=>mk("cambio de plan",easy?"Ibas al parque, pero empieza a llover mucho.":"Ibas a "+place+", pero está cerrado.","¿Qué opción tiene más sentido?",easy?"Buscar un juego para dentro":"Buscar una alternativa","Ignorarlo","Seguir igual","No decidir","app_change"),
    ()=>mk("comprobación",easy?"Has preparado la mochila.":"Has terminado una tarea importante.","¿Qué haces antes de terminar?",easy?"Mirar si llevas todo":"Revisar los puntos clave","Vaciar todo","Cambiar todo","No mirar","app_check"),
    ()=>mk("prioridad",easy?"Mañana debes llevar una ficha y también quieres ordenar juguetes.":"Tienes una tarea para mañana y otra opcional.","¿Qué conviene hacer primero?",easy?"Preparar la ficha":"La tarea de mañana","La otra","Las dos a la vez","Ninguna","app_priority"),
    ()=>mk("elección útil",easy?"Hace frío y vas a salir.":"Vas a pasar varias horas fuera y puede llover.","¿Qué es más útil llevar?",easy?"Abrigo":"Paraguas","Bañador","Almohada","Mando","app_choice"),
    ()=>mk("recado",easy?"Te piden llevar un libro a la biblioteca.":"Debes entregar "+obj+" en "+place+".","¿Qué debes coger antes de salir?",easy?"El libro":obj,"Una pelota","Un plato","Nada","app_errand"),
    ()=>mk("seguridad cotidiana",easy?"Vas a cruzar una calle.":"Vas a cruzar una calle con tráfico.","¿Qué haces antes?",easy?"Mirar a ambos lados":"Comprobar antes de cruzar","Correr sin mirar","Usar el teléfono móvil","Dar la espalda","app_safety"),
    ()=>mk("rutina",easy?"Después de lavarte las manos están mojadas.":"Después de terminar una actividad debes dejar el espacio preparado.","¿Qué haces?",easy?"Secarlas":"Recoger lo utilizado","Irte sin mirar","Dejar todo","Empezar otra cosa","app_routine"),
    ()=>mk("problema cotidiano",easy?"No encuentras tu lápiz y tienes que escribir.":"No tienes el material que necesitas y la tarea empieza ya.","¿Qué solución es razonable?",easy?"Pedir otro lápiz":"Pedir o buscar una alternativa","Abandonar","Romper la tarea","Esperar sin decir nada","app_problem"),
    ()=>mk("información relevante",easy?"Para saber si puedes salir necesitas saber si llueve.":"Para llegar puntual importan hora, trayecto y retrasos.","¿Qué dato es menos importante?",easy?"El color de tu camiseta":"El color de tu camiseta","La hora","El trayecto","Los retrasos","app_relevance")
  ];
  return items[m]();
}

function matrixLiteracy(age:string,level:number,v:number){
  const s=matrixSeed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank===0,junior=rank===1;
  const names=["Alex","Noa","Leo","Mara","Dani"], name=names[k%5];
  const short=easy
    ? name+" fue al parque con su pelota roja. Después empezó a llover y volvió a casa."
    : junior
      ? name+" tenía que entregar un trabajo el viernes. El miércoles terminó el contenido y el jueves lo revisó. El viernes lo entregó a primera hora."
      : name+" comparó dos rutas para llegar a clase. La ruta A era más rápida de media, pero variaba mucho. La ruta B tardaba cinco minutos más, aunque casi siempre mantenía el mismo tiempo.";
  const mc=(topic:string,q:string,a:string,b:string,c:string,d:string,mech:string)=>answerItem({topic:"Lectura + Escritura · "+topic,scenario:short,q,opts:opt4(a,b,c,d),a,mechanic:mech},age,"literacy",level,v);
  const self=(topic:string,q:string,sample:string,mech:string)=>answerItem({type:"self",topic:"Lectura + Escritura · "+topic,scenario:short,q,sample,mechanic:mech},age,"literacy",level,v);
  const items=[
    ()=>mc("comprensión literal",easy?"¿De qué color era la pelota?":junior?"¿Qué día revisó el trabajo?":"¿Qué ruta era más estable?",easy?"Roja":junior?"Jueves":"La ruta B",easy?"Azul":junior?"Miércoles":"La ruta A","Verde","No se sabe","lit_literal"),
    ()=>mc("inferencia",easy?"¿Por qué volvió a casa?":junior?"¿Por qué pudo entregarlo a tiempo?":"Si es muy importante llegar puntual, ¿qué ruta puede ser más segura?",easy?"Porque empezó a llover":junior?"Porque lo terminó y revisó antes":"La ruta B","Porque perdió la pelota","Porque era de noche","No se puede saber","lit_inference"),
    ()=>mc("idea principal","¿Cuál es la idea principal?",easy?"Una salida al parque que termina por la lluvia":junior?"Cómo organizó un trabajo":"Comparar rapidez y estabilidad de dos rutas","Una receta","Una compra","Una película","lit_main_idea"),
    ()=>mc("secuencia",easy?"¿Qué ocurrió primero?":junior?"¿Qué hizo antes de revisar?":"¿Qué información se compara?",easy?"Fue al parque":junior?"Terminó el contenido":"Tiempo medio y variabilidad","Volvió a casa","Lo entregó","El color de los vehículos","lit_sequence"),
    ()=>mc("causa y consecuencia",easy?"¿Qué pasó porque llovió?":junior?"¿Qué permitió la revisión del jueves?":"¿Qué consecuencia tiene la mayor variabilidad de A?",easy?"Volvió a casa":junior?"Llegar con el trabajo revisado":"Su tiempo es menos predecible","La pelota cambió de color","No hizo el trabajo","Siempre llega antes","lit_cause"),
    ()=>mc("vocabulario en contexto",easy?"En el texto, «volvió» significa…":junior?"En el texto, «revisó» significa…":"En el texto, «variaba» significa…",easy?"Regresó":junior?"Comprobó":"Cambiaba","Saltó","Escondió","Paraba","lit_vocab"),
    ()=>mc("verdadero/falso","¿Qué afirmación es correcta?",easy?"Empezó a llover":junior?"El jueves revisó el trabajo":"La ruta B es algo más lenta pero estable","No fue al parque","Lo entregó el miércoles","La ruta A siempre tarda lo mismo","lit_true_false"),
    ()=>mc("mejor resumen","¿Cuál es el mejor resumen?",easy?"Fue al parque y volvió por la lluvia":junior?"Preparó el trabajo durante varios días":"Dos rutas tienen ventajas diferentes","Jugó todo el día","Olvidó el trabajo","Las dos rutas son iguales","lit_summary"),
    ()=>mc("información irrelevante","¿Qué dato sería menos importante para resumir el texto?",easy?"El color exacto de los zapatos de "+name:junior?"El color de la carpeta":"El color del autobús","La lluvia","La fecha de entrega","La estabilidad del tiempo","lit_irrelevant"),
    ()=>self("título","Escribe un título breve para el texto.",easy?"Un día de lluvia":junior?"Organizar un trabajo":"Elegir una ruta fiable","lit_title"),
    ()=>self("respuesta escrita",easy?"Explica en una frase por qué "+name+" volvió a casa.":junior?"Explica en una o dos frases qué hizo "+name+" para organizarse.":"Explica qué ventaja tiene cada ruta.",easy?"Volvió porque empezó a llover.":junior?"Terminó el contenido, lo revisó y después lo entregó.":"A es más rápida de media; B es más predecible.","lit_written"),
    ()=>self("opinión razonada",easy?"¿Qué habrías hecho tú cuando empezó a llover? Escribe una frase.":junior?"¿Crees que revisar el trabajo antes de entregarlo es útil? Explica por qué.":"Si tuvieras un examen importante, ¿qué ruta elegirías y por qué?",easy?"Buscaría un lugar cubierto o volvería a casa.":junior?"Sí, porque permite detectar errores.":"Elegiría la ruta más fiable si llegar puntual fuera prioritario.","lit_opinion")
  ];
  return items[m]();
}

function matrixReasoning(age:string,level:number,v:number){
  const s=matrixSeed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank===0,junior=rank===1;
  const a=2+(k%7), b=3+((k*2)%8);
  const mc=(topic:string,q:string,a1:string,b1:string,c1:string,d1:string,mech:string,scenario="")=>answerItem({topic:"Razonamiento · "+topic,q,scenario,opts:opt4(a1,b1,c1,d1),a:a1,mechanic:mech},age,"speedReasoning",level,v);
  const items=[
    ()=>mc("serie","¿Qué número sigue?",easy?"8":junior?String(a+8):String(a+12),easy?"7":String(a+9),easy?"9":String(a+11),easy?"10":String(a+13),"rea_series",easy?"2 · 4 · 6 · __":junior?String(a)+" · "+String(a+2)+" · "+String(a+4)+" · "+String(a+6)+" · __":String(a)+" · "+String(a+3)+" · "+String(a+6)+" · "+String(a+9)+" · __"),
    ()=>mc("comparación","¿Qué número es mayor?",easy?"7":(a===b?"Son iguales":String(Math.max(a,b))),easy?"4":String(Math.min(a,b)),a===b?String(a+1):"Son iguales","No se sabe","rea_compare",easy?"4       7":String(a)+"       "+String(b)),
    ()=>mc("cálculo","¿Cuál es el resultado?",String(a+b),String(a+b+1),String(a+b-1),String(a+b+2),"rea_calc",String(a)+" + "+String(b)),
    ()=>mc("clasificación",easy?"¿Cuál no es una fruta?":"¿Cuál tiene tres lados?",easy?"🚲":"triángulo",easy?"🍎":"cuadrado",easy?"🍐":"círculo",easy?"🍌":"rectángulo","rea_classify"),
    ()=>mc("patrón","¿Qué elemento sigue?",easy?"🔴":junior?"●":"B",easy?"🔵":junior?"▲":"A",easy?"🟢":junior?"■":"C",easy?"⭐":junior?"◆":"D","rea_pattern",easy?"🔴 🔵 🔴 🔵 __":junior?"▲ ● ▲ ● ▲ __":"A B A B A __"),
    ()=>mc("orden","¿Qué opción completa correctamente?",easy?"4":String(a+1),easy?"2":String(a),easy?"6":String(a+2),easy?"7":String(a+3),"rea_order",easy?"3 · __ · 5":String(a)+" · __ · "+String(a+2)),
    ()=>mc("cantidad","¿Dónde hay más?",easy?"B":(a===b?"Hay lo mismo":String(Math.max(a,b))),easy?"A":String(Math.min(a,b)),a===b?String(a+1):"Hay lo mismo","No se sabe","rea_quantity",easy?"A: ⭐⭐    B: ⭐⭐⭐⭐":String(a)+" frente a "+String(b)),
    ()=>mc("analogía",easy?"Pájaro es a volar como pez es a…":"Libro es a leer como música es a…",easy?"nadar":"escuchar",easy?"correr":"dibujar",easy?"leer":"correr",easy?"saltar":"cocinar","rea_analogy"),
    ()=>mc("tiempo",easy?"Si son las 5 y pasa una hora, ¿qué hora será?":"Empiezas a las 17:00 y pasan 35 minutos. ¿Qué hora es?",easy?"6":"17:35",easy?"5":"17:25",easy?"7":"17:45",easy?"4":"18:00","rea_time"),
    ()=>mc("reparto",easy?"Hay 6 pegatinas para 2 niños. ¿Cuántas recibe cada uno?":"Repartes 24 cartas entre 6 personas. ¿Cuántas recibe cada una?",easy?"3":"4",easy?"2":"3",easy?"4":"5",easy?"6":"6","rea_share"),
    ()=>mc("lógica",easy?"Todos los gatos son animales. Misu es un gato. ¿Qué sabemos?":"Todos los cuadrados tienen 4 lados. Esta figura es un cuadrado. ¿Qué sabemos?",easy?"Misu es un animal":"Tiene 4 lados",easy?"Misu vuela":"Tiene 3 lados",easy?"Misu es un perro":"Es un círculo","No se sabe","rea_logic"),
    ()=>mc("problema",easy?"Ana tiene 4 cromos y consigue 3 más. ¿Cuántos tiene?":"Una entrada cuesta 7 € y compras 3. ¿Cuánto pagas?",easy?"7":"21 €",easy?"6":"14 €",easy?"8":"24 €",easy?"9":"10 €","rea_problem")
  ];
  return items[m]();
}

function matrix15Seed(v:number){ return {m:v%15,k:Math.floor(v/15)%20}; }

function matrixAttention15(age:string,level:number,v:number){
  const s=matrix15Seed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank<=1;
  if(m<12) return matrixAttention(age,level,k*12+m);
  if(m===12){
    const target=easy?"🔺":"TR";
    const scenario=easy?"🔵  🔺  🟢  🟦  🔺  🟡":"TR  TA  RT  TR  TT  AR  TR";
    const a=easy?"2":"3";
    return answerItem({type:"attentionChoice",mechanic:"att_symbol_frequency",topic:"Atención · frecuencia",q:"¿Cuántas veces aparece "+target+"?",scenario,opts:opt4(a,easy?"1":"2",easy?"3":"4",easy?"4":"5"),a},age,"attention",level,v);
  }
  if(m===13){
    const scenario=easy
      ?"FILA 1: 🍎 🍐 🍌\nFILA 2: 🍌 🍎 🍐\nFILA 3: 🍐 🍌 🍎"
      :"RUTA | PARADA | HORA\nA | Centro | 16:20\nB | Norte | 16:35\nA | Parque | 16:50\nC | Centro | 17:05";
    return answerItem({type:"attentionChoice",mechanic:"att_table_cross",topic:"Atención · cruce de información",
      q:easy?"¿En qué fila está la manzana en el centro?":"¿A qué hora pasa la línea A por Parque?",
      ...(easy?{scenario}:{stimulus:[{type:'table',header:true,rows:[['Línea','Parada','Hora'],['A','Centro','16:20'],['B','Norte','16:35'],['A','Parque','16:50'],['C','Centro','17:05']]}],requiresStimulus:true}),opts:easy?opt4("Fila 2","Fila 1","Fila 3","Ninguna"):opt4("16:50","16:20","16:35","17:05"),a:easy?"Fila 2":"16:50"},age,"attention",level,v);
  }
  const word=["casa","mesa","luna","pato","nube"][k%5], target=easy?"a":"e";
  const text=easy?word+" "+word+" "+word:"Este pequeño anuncio ofrece entrega gratuita este viernes.";
  const count=(text.toLowerCase().match(new RegExp(target,"g"))||[]).length;
  return answerItem({type:"attentionChoice",mechanic:"att_letter_scan",topic:"Atención · búsqueda en texto",q:"¿Cuántas veces aparece la letra «"+target+"»?",scenario:text,opts:opt4(String(count),String(Math.max(0,count-1)),String(count+1),String(count+2)),a:String(count)},age,"attention",level,v);
}

function matrixMemory15(age:string,level:number,v:number){
  const s=matrix15Seed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank<=1;
  if(m<12) return matrixMemory(age,level,k*12+m);
  const reveal=rank===0?4500:rank===1?5200:rank===2?6000:6500;
  if(m===12){
    const steps=easy?["puerta","mesa","estante"]:["recepción","ascensor","planta 2","sala B"];
    return answerItem({type:"memoryReveal",revealMs:reveal,mechanic:"mem_route",topic:"Memoria · recorrido",q:"Memoriza el recorrido. Después desaparecerá.",
      memoryContent:steps.map((x:string,i:number)=>({person:String(i+1),detail:x})),
      memoryQuestion:"¿Qué lugar aparecía justo después de "+steps[0]+"?",opts:opt4(steps[1],steps[0],steps[2],steps[steps.length-1]),a:steps[1]},age,"memory",level,v);
  }
  if(m===13){
    const ad=easy
      ?[{person:"Helado",detail:"2 €"},{person:"Jugo",detail:"1 €"},{person:"Oferta",detail:"2 helados por 3 €"}]
      :[{person:"Sudadera",detail:"34,99 €"},{person:"Camiseta",detail:"19,99 €"},{person:"Envío",detail:"Gratis desde 50 €"},{person:"Devolución",detail:"30 días"}];
    return answerItem({type:"memoryReveal",revealMs:reveal,mechanic:"mem_advert",topic:"Memoria · anuncio",q:"Memoriza el anuncio. Después desaparecerá.",
      memoryContent:ad,memoryQuestion:easy?"¿Cuánto costaba el jugo?":"¿Cuántos días había para devolver?",
      opts:easy?opt4("1 €","2 €","3 €","4 €"):opt4("30 días","15 días","20 días","45 días"),a:easy?"1 €":"30 días"},age,"memory",level,v);
  }
  const pairs=easy
    ?[{person:"Sol",detail:"amarillo"},{person:"Mar",detail:"azul"},{person:"Hoja",detail:"verde"}]
    :[{person:"Código A",detail:"PX-"+String(20+k)},{person:"Código B",detail:"LM-"+String(40+k)},{person:"Código C",detail:"TR-"+String(60+k)}];
  return answerItem({type:"memoryReveal",revealMs:reveal,mechanic:"mem_pair_binding",topic:"Memoria · parejas",q:"Memoriza las parejas. Después desaparecerán.",
    memoryContent:pairs,memoryQuestion:"¿Qué correspondía a "+pairs[1].person+"?",opts:opt4(pairs[1].detail,pairs[0].detail,pairs[2].detail,easy?"rojo":"ZX-"+String(80+k)),a:pairs[1].detail},age,"memory",level,v);
}

function matrixExecutive15(age:string,level:number,v:number){
  const s=matrix15Seed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank===0;
  if(m<12) return matrixExecutive(age,level,k*12+m);
  if(m===12){
    return answerItem({type:"executiveDecision",mechanic:"exec_sort_tasks",topic:"Funciones ejecutivas · ordenar tareas",
      scenario:easy?"Tienes que guardar un cuento, lavarte las manos y sentarte a merendar.":"Tienes tres tareas: una vence hoy, otra mañana y otra no tiene fecha.",
      q:"¿Qué criterio ayuda más a decidir el orden?",opts:easy?opt4("Hacer primero lo necesario antes de merendar","Empezar al azar","Hacerlo todo a la vez","No elegir"):opt4("Priorizar por plazo e importancia","Elegir la más corta siempre","Empezar por la última recibida","Hacerlas a la vez"),a:easy?"Hacer primero lo necesario antes de merendar":"Priorizar por plazo e importancia"},age,"executive",level,v);
  }
  if(m===13){
    return answerItem({type:"executiveDecision",mechanic:"exec_stop_check_go",topic:"Funciones ejecutivas · parar y comprobar",
      scenario:easy?"Vas a enviar un dibujo y ves que falta tu nombre.":"Vas a enviar un archivo y dudas si es la versión final.",
      q:"¿Qué haces antes de continuar?",opts:easy?opt4("Parar y poner el nombre","Enviar igual","Borrar el dibujo","Cerrar todo"):opt4("Parar, comprobar la versión y luego enviar","Enviar sin comprobar","Crear otro archivo desde cero","Ignorar la duda"),a:easy?"Parar y poner el nombre":"Parar, comprobar la versión y luego enviar"},age,"executive",level,v);
  }
  return answerItem({type:"executiveDecision",mechanic:"exec_multi_constraint",topic:"Funciones ejecutivas · varias condiciones",
    scenario:easy?"Tienes 20 minutos. Recoger tarda 8 y vestirte 7.":"Tienes 50 minutos. Tarea A tarda 25, tarea B 20 y necesitas 10 minutos de margen antes de salir.",
    q:"¿Qué conclusión es correcta?",opts:easy?opt4("Puedes hacer las dos y te sobran 5 minutos","No puedes hacer ninguna","Solo puedes recoger","Te sobran 10 minutos"):opt4("No caben A y B manteniendo 10 minutos de margen","Caben y sobran 10 minutos","Solo B no cabe","El margen no importa"),a:easy?"Puedes hacer las dos y te sobran 5 minutos":"No caben A y B manteniendo 10 minutos de margen"},age,"executive",level,v);
}

function matrixApplied15(age:string,level:number,v:number){
  const s=matrix15Seed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank===0;
  if(m<12) return matrixApplied(age,level,k*12+m);
  if(m===12){
    return answerItem({type:"appliedDecision",mechanic:"app_compare_offer",topic:"Cognición aplicada · comparar opciones",
      scenario:easy?"Tienda A: cuento 6 €. Tienda B: cuento 8 €.":"Tienda A: 24 € + 4 € de envío. Tienda B: 27 € con envío incluido.",
      q:"¿Qué opción cuesta menos en total?",opts:easy?opt4("Tienda A","Tienda B","Cuestan igual","No se sabe"):opt4("Tienda B","Tienda A","Cuestan igual","No se puede calcular"),a:easy?"Tienda A":"Tienda B"},age,"applied",level,v);
  }
  if(m===13){
    return answerItem({type:"appliedDecision",mechanic:"app_transport_choice",topic:"Cognición aplicada · transporte",
      scenario:easy?"El bus llega a las 17:00 y caminar tarda 35 minutos. Debes estar allí a las 17:10.":"Ruta A tarda 25 min pero puede retrasarse 20. Ruta B tarda 35 min y casi nunca se retrasa. Necesitas llegar puntual.",
      q:"¿Qué opción es más segura?",opts:easy?opt4("El bus","Caminar","Da igual","Ninguna"):opt4("Ruta B","Ruta A","Da igual","La más barata sin mirar tiempos"),a:easy?"El bus":"Ruta B"},age,"applied",level,v);
  }
  return answerItem({type:"appliedDecision",mechanic:"app_digital_judgement",topic:"Cognición aplicada · decisión digital",
    scenario:easy?"Un mensaje te pide tu contraseña para darte un premio.":"Recibes un enlace inesperado que pide iniciar sesión con tu contraseña.",
    q:"¿Qué conviene hacer?",opts:easy?opt4("No dar la contraseña y pedir ayuda","Enviar la contraseña","Compartirlo con amigos","Pulsar rápido"):opt4("No introducir datos y verificar el remitente","Introducir la contraseña","Reenviarlo","Aceptar sin revisar"),a:easy?"No dar la contraseña y pedir ayuda":"No introducir datos y verificar el remitente"},age,"applied",level,v);
}

function matrixLiteracy15(age:string,level:number,v:number){
  const s=matrix15Seed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank===0,junior=rank===1;
  if(m<12) return matrixLiteracy(age,level,k*12+m);
  const t1=easy?"Luna fue al huerto y regó las plantas.":"El centro abrirá la biblioteca hasta las 19:00 durante los exámenes.";
  const t2=easy?"Leo fue al parque y jugó con una pelota.":"El polideportivo ampliará una hora su horario los viernes.";
  if(m===12){
    return answerItem({mechanic:"lit_compare_texts",topic:"Lectura + Escritura · comparar textos",scenario:"TEXTO 1: "+t1+"\nTEXTO 2: "+t2,q:"¿Qué tienen en común los dos textos?",
      opts:easy?opt4("Cuentan una actividad","Hablan del mismo lugar","Tienen la misma persona","Suceden de noche"):opt4("Informan de una ampliación de horario","Hablan de una biblioteca","Se refieren al mismo día","Anuncian un cierre"),a:easy?"Cuentan una actividad":"Informan de una ampliación de horario"},age,"literacy",level,v);
  }
  if(m===13){
    const scenario=easy?"Mara encontró una caja. La abrió y dentro había una carta.":"Noa dejó el portátil en la mesa porque necesitaba cargarlo. Después lo guardó en su mochila.";
    return answerItem({mechanic:"lit_reference",topic:"Lectura + Escritura · referencias",scenario,q:easy?"¿Qué había dentro de la caja?":"En «lo guardó», ¿a qué se refiere «lo»?",
      opts:easy?opt4("Una carta","Un libro","Una llave","Nada"):opt4("Al portátil","A la mesa","Al cargador","A la mochila"),a:easy?"Una carta":"Al portátil"},age,"literacy",level,v);
  }
  return answerItem({type:"self",mechanic:"lit_rewrite",topic:"Lectura + Escritura · reescritura",scenario:easy?"El perro corrió. El perro saltó.":"La reunión fue bien. Hubo varias ideas. Algunas ideas se repetirán.",
    q:easy?"Une las dos frases en una sola frase clara.":"Reescribe el texto para que sea más claro y menos repetitivo.",
    sample:easy?"El perro corrió y saltó.":"La reunión fue positiva y algunas de las ideas propuestas se retomarán."},age,"literacy",level,v);
}

function matrixReasoning15(age:string,level:number,v:number){
  const s=matrix15Seed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank===0;
  if(m<12) return matrixReasoning(age,level,k*12+m);
  if(m===12){
    return answerItem({mechanic:"rea_matrix",topic:"Razonamiento · matriz",q:"¿Qué falta?",scenario:easy?"🔴 🔵\n🔵 __":"A B C\nB C A\nC A __",
      opts:easy?opt4("🔴","🔵","🟢","⭐"):opt4("B","A","C","D"),a:easy?"🔴":"B"},age,"speedReasoning",level,v);
  }
  if(m===13){
    return answerItem({mechanic:"rea_conditional",topic:"Razonamiento · condición",scenario:easy?"Si llueve, usamos paraguas. Está lloviendo.":"Si una reserva está confirmada, aparece un código. La reserva está confirmada.",
      q:"¿Qué podemos concluir?",opts:easy?opt4("Usamos paraguas","No llueve","Hace sol","No se sabe"):opt4("Debe aparecer un código","No hay reserva","El código es opcional","No se puede concluir nada"),a:easy?"Usamos paraguas":"Debe aparecer un código"},age,"speedReasoning",level,v);
  }
  return answerItem({mechanic:"rea_estimation",topic:"Razonamiento · estimación",q:easy?"¿Qué resultado está más cerca de 10?":"Sin calcular exactamente, ¿qué resultado está más cerca de 100?",
    scenario:easy?"6 + 5":"49 + 52",opts:easy?opt4("11","6","15","20"):opt4("101","80","120","150"),a:easy?"11":"101"},age,"speedReasoning",level,v);
}

function matrix18Seed(v:number){ return {m:v%18,k:Math.floor(v/18)%20}; }

function matrixLanguage18(age:string,domain:string,level:number,v:number){
  const s=matrix18Seed(v),m=s.m,k=s.k,band=routeBand(age),name=["Ana","Leo","Mara","Noa","Alex"][k%5];
  if(band!=="6-7"){
    if(m<6) return variantLanguage(age,domain,level,k*6+m);
    const older:any[]=[
      {mechanic:"lang_cohesion",q:"¿Qué conector encaja mejor?",scenario:"No llevaba paraguas; ___ se mojó.",opts:opt4("por eso","aunque","mientras","sin embargo"),a:"por eso"},
      {mechanic:"lang_precision",q:"¿Qué frase es más precisa?",opts:opt4("La actividad empieza a las 17:30 en el aula 2.","La actividad es luego.","Hay algo por la tarde.","Será pronto."),a:"La actividad empieza a las 17:30 en el aula 2."},
      {mechanic:"lang_register",q:"¿Qué opción es más adecuada para pedir ayuda con respeto?",opts:opt4("¿Podrías ayudarme, por favor?","Hazlo tú.","Dámelo.","No sé."),a:"¿Podrías ayudarme, por favor?"},
      {mechanic:"lang_reference",q:"En «Mara cogió el libro y lo guardó», ¿a qué se refiere «lo»?",opts:opt4("Al libro","A Mara","A guardó","A nada"),a:"Al libro"},
      {mechanic:"lang_order_text",q:"¿Qué orden forma un mensaje claro?",opts:opt4("saludo → petición → despedida","petición → saludo → despedida","despedida → saludo → petición","cualquier orden"),a:"saludo → petición → despedida"},
      {mechanic:"lang_fact_opinion",q:"¿Cuál es una opinión?",opts:opt4("La película me pareció divertida.","La película dura 90 minutos.","Empieza a las 18:00.","Tiene cuatro personajes."),a:"La película me pareció divertida."},
      {mechanic:"lang_summary",q:"¿Qué frase resume mejor?",scenario:"El centro cerró temprano por una avería y reabrirá mañana.",opts:opt4("El centro cerró temporalmente por una avería.","El centro no abrirá nunca.","No hubo avería.","Mañana cerrará antes."),a:"El centro cerró temporalmente por una avería."},
      {mechanic:"lang_source",q:"Dos fuentes dan datos distintos. ¿Qué conviene revisar?",opts:opt4("Fecha y procedencia","El color de la web","El tamaño de letra","La primera frase"),a:"Fecha y procedencia"},
      {mechanic:"lang_argument",q:"¿Qué fortalece más una idea?",opts:opt4("Una razón apoyada por datos","Repetirla","Usar mayúsculas","Añadir adjetivos"),a:"Una razón apoyada por datos"},
      {mechanic:"lang_rewrite",q:"¿Qué versión es más clara?",opts:opt4("Llegaré a las 17:00 porque el tren sale a las 16:20.","Llegaré porque sí.","Luego voy.","Será después."),a:"Llegaré a las 17:00 porque el tren sale a las 16:20."},
      {mechanic:"lang_ambiguity",q:"¿Qué frase puede ser ambigua sin contexto?",opts:opt4("Lo dejó allí.","El tren sale a las 17:20.","La puerta es la B4.","Cuesta 12 €."),a:"Lo dejó allí."},
      {mechanic:"lang_inference",q:"La calle está mojada y varias personas cierran paraguas. ¿Qué inferencia es razonable?",opts:opt4("Ha llovido hace poco","Es medianoche","Hace mucho calor","No hay tiendas"),a:"Ha llovido hace poco"}
    ];
    return answerItem({topic:"Lenguaje "+band,...older[(m-6)%older.length]},age,domain,level,v);
  }
  const early:any[]=[
    {mechanic:"lang_initial_sound",topic:"Lengua 6-7 · sonidos y letras",q:"¿Qué palabra empieza por M?",opts:opt4("mesa","sapo","luna","pato"),a:"mesa"},
    {mechanic:"lang_rhyme",topic:"Lengua 6-7 · sonidos",q:"¿Qué palabra rima con «gato»?",opts:opt4("pato","mesa","sol","tren"),a:"pato"},
    {mechanic:"lang_syllable_count",topic:"Lengua 6-7 · sílabas",q:"¿Cuántas sílabas tiene «pelota»?",opts:opt4("3","2","4","1"),a:"3"},
    {mechanic:"lang_build_word",topic:"Lengua 6-7 · formar palabras",q:"Ordena las sílabas para formar una palabra: TA · PE · LO",opts:opt4("PE-LO-TA","TA-LO-PE","LO-TA-PE","PE-TA-LO"),a:"PE-LO-TA"},
    {mechanic:"lang_vocabulary_category",topic:"Lengua 6-7 · vocabulario",q:"¿Qué palabra nombra un animal?",opts:opt4("gato","mesa","azul","saltar"),a:"gato"},
    {mechanic:"lang_synonym",topic:"Lengua 6-7 · vocabulario",q:"¿Qué palabra significa casi lo mismo que «feliz»?",opts:opt4("contento","triste","lejos","alto"),a:"contento"},
    {mechanic:"lang_antonym",topic:"Lengua 6-7 · vocabulario",q:"¿Cuál es lo contrario de «grande»?",opts:opt4("pequeño","alto","largo","rápido"),a:"pequeño"},
    {mechanic:"lang_sentence_order",topic:"Lengua 6-7 · oración",q:"¿Cuál está bien ordenada?",opts:opt4("La niña corre.","Niña la corre.","Corre la niña el.","La corre niña."),a:"La niña corre."},
    {mechanic:"lang_capital_period",topic:"Lengua 6-7 · escritura",q:"¿Cuál está mejor escrita?",opts:opt4("Mara juega en casa.","mara juega en casa","Mara juega en casa","mara juega en casa."),a:"Mara juega en casa."},
    {mechanic:"lang_question_mark",topic:"Lengua 6-7 · signos",q:"¿Cuál es una pregunta bien escrita?",opts:opt4("¿Dónde está el libro?","Dónde está el libro.","¡Dónde está el libro!","Dónde está el libro"),a:"¿Dónde está el libro?"},
    {mechanic:"lang_sentence_type",topic:"Lengua 6-7 · intención",q:"¿Cuál sirve para preguntar?",opts:opt4("¿Vienes al parque?","Ven al parque.","¡Qué bonito!","Voy al parque."),a:"¿Vienes al parque?"},
    {mechanic:"lang_singular_plural",topic:"Lengua 6-7 · palabras",q:"¿Cuál es el plural de «casa»?",opts:opt4("casas","casa","caso","casona"),a:"casas"},
    {mechanic:"lang_note_read",topic:"Lengua 6-7 · nota",scenario:"NOTA: Lleva mañana el cuaderno azul.",q:"¿Qué hay que llevar?",opts:opt4("El cuaderno azul","El cuaderno rojo","Una pelota","Nada"),a:"El cuaderno azul"},
    {mechanic:"lang_list_read",topic:"Lengua 6-7 · lista",scenario:"LISTA: pan · leche · manzana",q:"¿Qué aparece en la lista?",opts:opt4("Leche","Jabón","Lápiz","Gorra"),a:"Leche"},
    {mechanic:"lang_story_sequence",topic:"Lengua 6-7 · narración",scenario:"Primero "+name+" se puso los zapatos. Después salió de casa.",q:"¿Qué hizo primero?",opts:opt4("Se puso los zapatos","Salió de casa","Comió","Durmió"),a:"Se puso los zapatos"},
    {mechanic:"lang_description",topic:"Lengua 6-7 · descripción",scenario:"La pelota es roja y pequeña.",q:"¿Cómo es la pelota?",opts:opt4("Roja y pequeña","Azul y grande","Verde","No se sabe"),a:"Roja y pequeña"},
    {mechanic:"lang_dialogue",topic:"Lengua 6-7 · diálogo",scenario:"—Hola, ¿puedo jugar? —Sí, claro.",q:"¿Qué ocurre en el diálogo?",opts:opt4("Alguien pide jugar","Alguien compra pan","Alguien se va a dormir","Nadie habla"),a:"Alguien pide jugar"},
    {mechanic:"lang_revision",topic:"Lengua 6-7 · revisión",q:"Antes de entregar una frase, ¿qué puedes comprobar?",opts:opt4("Que empieza con mayúscula y termina con punto","Que tenga muchas palabras","Que esté toda en mayúsculas","Que no tenga espacios"),a:"Que empieza con mayúscula y termina con punto"}
  ];
  return answerItem(early[m],age,domain,level,v);
}

function matrixSocial18(age:string,domain:string,level:number,v:number){
  const s=matrix18Seed(v),m=s.m,k=s.k,rank=ageRank(age),easy=rank<=1,name=["Alex","Noa","Mara","Leo"][k%4];
  const items:any[]=[
    {mechanic:"soc_perspective",topic:"Perspectiva",scenario:name+" deja una pelota en una caja y sale. Otra persona la cambia de caja sin que "+name+" lo vea.",q:"¿Dónde la buscará primero "+name+"?",opts:opt4("En la primera caja","En la nueva caja","En cualquier sitio","Sabrá que la movieron"),a:"En la primera caja"},
    {mechanic:"soc_emotion",topic:"Emociones",scenario:"A "+name+" se le cae su helado justo después de comprarlo.",q:"¿Cómo podría sentirse?",opts:opt4("Triste o frustrado","Siempre contento","Sin ninguna emoción","Orgulloso"),a:"Triste o frustrado"},
    {mechanic:"soc_intention",topic:"Intención",scenario:"Una persona señala una silla y dice «Puedes sentarte aquí».",q:"¿Qué intenta hacer?",opts:opt4("Ofrecer un sitio","Pedir que te vayas","Ocultar la silla","Cambiar de tema"),a:"Ofrecer un sitio"},
    {mechanic:"soc_pragmatics",topic:"Pragmática",scenario:"Alguien mira una ventana abierta y dice «Qué frío hace aquí».",q:"¿Qué puede estar queriendo decir?",opts:opt4("Que estaría bien cerrar la ventana","Que quiere abrir otra ventana","Que ha perdido algo","Nada"),a:"Que estaría bien cerrar la ventana"},
    {mechanic:"soc_turn_taking",topic:"Conversación",scenario:"Tu compañero está contando algo y todavía no ha terminado.",q:"¿Qué ayuda a conversar?",opts:opt4("Esperar tu turno y escuchar","Interrumpir siempre","Irte sin decir nada","Hablar más fuerte"),a:"Esperar tu turno y escuchar"},
    {mechanic:"soc_repair",topic:"Reparación",scenario:"La otra persona ha entendido mal lo que dijiste.",q:"¿Qué puede ayudar?",opts:opt4("Explicarlo de otra manera","Repetir igual más fuerte","Ignorarlo","Enfadarte"),a:"Explicarlo de otra manera"},
    {mechanic:"soc_literal_nonliteral",topic:"Lenguaje social",scenario:"Un amigo dice «Me muero de hambre» antes de merendar.",q:"¿Qué significa normalmente?",opts:opt4("Que tiene mucha hambre","Que está enfermo","Que quiere dormir","Que se va"),a:"Que tiene mucha hambre"},
    {mechanic:"soc_context",topic:"Contexto",scenario:"Mensaje: «Vale, perfecto». No sabes el tono ni qué ocurrió antes.",q:"¿Qué es más prudente?",opts:opt4("Puede tener más de una interpretación","Siempre es enfado","Siempre es alegría","No significa nada"),a:"Puede tener más de una interpretación"},
    {mechanic:"soc_impact",topic:"Intención e impacto",scenario:"Una broma no pretendía molestar, pero otra persona se sintió mal.",q:"¿Qué puede ser verdad?",opts:opt4("La intención y el efecto pueden ser distintos","Si no quería molestar, nadie puede sentirse mal","El efecto demuestra la intención","Solo importa quien habla"),a:"La intención y el efecto pueden ser distintos"},
    {mechanic:"soc_help_request",topic:"Pedir ayuda",scenario:"No entiendes una instrucción.",q:"¿Qué opción ayuda más?",opts:opt4("Pedir que te la expliquen de otra manera","Fingir que la entiendes","Irte","Copiar sin mirar"),a:"Pedir que te la expliquen de otra manera"},
    {mechanic:"soc_shared_attention",topic:"Atención compartida",scenario:"Mara señala un perro que cruza el parque.",q:"¿Qué intenta conseguir?",opts:opt4("Que mires al perro","Que mires al suelo","Que cierres los ojos","Que te vayas"),a:"Que mires al perro"},
    {mechanic:"soc_social_rule",topic:"Normas sociales",scenario:"Llegas a una fila donde ya hay personas esperando.",q:"¿Qué suele corresponder hacer?",opts:opt4("Ponerte al final de la fila","Colarte delante","Irte","Gritar"),a:"Ponerte al final de la fila"},
    {mechanic:"soc_conflict",topic:"Resolver un desacuerdo",scenario:"Dos personas quieren usar el mismo material al mismo tiempo.",q:"¿Qué opción ayuda más?",opts:opt4("Buscar turnos o un acuerdo","Quitárselo","Romperlo","No hablar"),a:"Buscar turnos o un acuerdo"},
    {mechanic:"soc_inference",topic:"Inferencia social",scenario:"Una persona cancela un plan porque está cansada y después aparece en una foto familiar.",q:"¿Qué conclusión es más prudente?",opts:opt4("La foto por sí sola no demuestra que mintiera","Mintió seguro","No estaba cansada","No quería verte"),a:"La foto por sí sola no demuestra que mintiera"},
    {mechanic:"soc_empathy",topic:"Empatía",scenario:"Un compañero se equivoca delante del grupo y parece avergonzado.",q:"¿Qué respuesta puede ayudar?",opts:opt4("Tratarlo con respeto y no ridiculizarlo","Reírse","Contarlo a todos","Imitarlo"),a:"Tratarlo con respeto y no ridiculizarlo"},
    {mechanic:"soc_boundary",topic:"Límites",scenario:"No quieres prestar un objeto personal.",q:"¿Cómo puedes decirlo con respeto?",opts:opt4("Prefiero no prestarlo, gracias por preguntar.","¡Ni hablar!","No me hables.","Lo rompo antes."),a:"Prefiero no prestarlo, gracias por preguntar."},
    {mechanic:"soc_group_choice",topic:"Decisión en grupo",scenario:"El grupo tiene dos ideas diferentes para una actividad.",q:"¿Qué ayuda a decidir?",opts:opt4("Escuchar las opciones y acordar un criterio","Imponer una idea","No dejar hablar","Elegir al azar sin escuchar"),a:"Escuchar las opciones y acordar un criterio"},
    {mechanic:"soc_apology",topic:"Reparar una situación",scenario:"Has pisado sin querer el trabajo de otra persona.",q:"¿Qué respuesta es adecuada?",opts:opt4("Pedir disculpas y ofrecer ayuda","Irte sin decir nada","Culpar a otra persona","Reírte"),a:"Pedir disculpas y ofrecer ayuda"}
  ];
  let x=structuredClone(items[m]);
  if(easy&&m===13) x={mechanic:"soc_inference",topic:"Comprender situaciones",scenario:"Noa dice que está cansada y se va pronto a casa.",q:"¿Qué sabemos seguro?",opts:opt4("Que dice que está cansada","Que está enfadada","Que no quiere jugar nunca","Que miente"),a:"Que dice que está cansada"};
  return answerItem({type:"socialScenario",...x},age,domain,level,v);
}

function matrixLanguage20Early(age:string,domain:string,level:number,v:number){
  const m=v%20,k=Math.floor(v/20)%20;
  if(m<18) return matrixLanguage18(age,domain,level,k*18+m);
  if(m===18){
    const words=["mi gato duerme","la luna brilla","ana lee cuentos","leo come pan"];
    const base=words[k%words.length];
    return answerItem({mechanic:"lang_word_spacing",topic:"Lengua 6-7 · separación de palabras",q:"¿Cuál está escrita con las palabras bien separadas?",
      opts:opt4(base,base.replace(/ /g,""),base.replace(" ","  ").replace(" ",""),base.toUpperCase()),a:base},age,domain,level,v);
  }
  const first=["Primero","Después","Al final"][k%3];
  return answerItem({mechanic:"lang_temporal_connector",topic:"Lengua 6-7 · ordenar un texto",
    scenario:"___ me pongo los zapatos. Después salgo de casa.",
    q:"¿Qué palabra encaja mejor al principio?",opts:opt4("Primero","Porque","Aunque","Nunca"),a:"Primero"},age,domain,level,v);
}

function matrixAttention18(age:string,level:number,v:number){
  const m=v%18,k=Math.floor(v/18)%20,rank=ageRank(age),easy=rank<=1;
  if(m<15) return matrixAttention15(age,level,k*15+m);
  if(m===15){
    const scenario=easy?"A1 ⭐  A2 🌙  A3 ⭐\nB1 🌙  B2 ⭐  B3 🌙":"A1 PX-21  A2 PX-12  A3 PX-21\nB1 PX-21  B2 PX-22  B3 PX-21";
    return answerItem({type:"attentionChoice",mechanic:"att_grid_location",topic:"Atención · localización",
      q:easy?"¿En qué casilla está la única estrella de la fila B?":"¿En qué casilla aparece PX-22?",
      scenario,opts:easy?opt4("B2","B1","B3","A2"):opt4("B2","A2","B1","A3"),a:"B2"},age,"attention",level,v);
  }
  if(m===16){
    const a=easy?"sol · mesa · luna · pato":"A7 · B4 · C9 · D2";
    const b=easy?"sol · mesa · nube · pato":"A7 · B4 · C8 · D2";
    return answerItem({type:"attentionChoice",mechanic:"att_compare_lists",topic:"Atención · comparar listas",
      q:"¿Qué elemento cambia entre la lista 1 y la lista 2?",scenario:"LISTA 1: "+a+"\nLISTA 2: "+b,
      opts:easy?opt4("luna/nube","sol","mesa","pato"):opt4("C9/C8","A7","B4","D2"),a:easy?"luna/nube":"C9/C8"},age,"attention",level,v);
  }
  return answerItem({type:"attentionChoice",mechanic:"att_filter_rule",topic:"Atención · filtrar por regla",
    q:easy?"Elige solo el animal.":"Elige el código que empieza por B y termina en número par.",
    scenario:easy?"📘   🐶   🚲   🍎":"A7   B3   B8   C6",
    opts:easy?opt4("🐶","📘","🚲","🍎"):opt4("B8","B3","A7","C6"),a:easy?"🐶":"B8"},age,"attention",level,v);
}

function matrixMemory18(age:string,level:number,v:number){
  const m=v%18,k=Math.floor(v/18)%20,rank=ageRank(age),easy=rank<=1,reveal=rank===0?4500:rank===1?5200:rank===2?6000:6500;
  if(m<15) return matrixMemory15(age,level,k*15+m);
  if(m===15){
    return answerItem({type:"memoryReveal",revealMs:reveal,mechanic:"mem_story_detail",topic:"Memoria · historia breve",
      q:"Lee y memoriza. Después desaparecerá.",
      memoryContent:[{detail:easy?"Mara fue al parque con una pelota roja y volvió antes de merendar.":"Mara llegó a la estación a las 16:40, compró agua y tomó el tren de las 16:55 en el andén 3."}],
      memoryQuestion:easy?"¿De qué color era la pelota?":"¿Desde qué andén salía el tren?",
      opts:easy?opt4("Roja","Azul","Verde","Amarilla"):opt4("Andén 3","Andén 2","Andén 4","Andén 5"),a:easy?"Roja":"Andén 3"},age,"memory",level,v);
  }
  if(m===16){
    return answerItem({type:"memoryReveal",revealMs:reveal,mechanic:"mem_menu",topic:"Memoria · menú",
      q:"Memoriza la información. Después desaparecerá.",
      memoryContent:easy?[{person:"Bocadillo",detail:"3 €"},{person:"Jugo",detail:"1 €"},{person:"Fruta",detail:"2 €"}]:
        [{person:"Menú A",detail:"8,50 €"},{person:"Menú B",detail:"10,00 €"},{person:"Postre",detail:"2,50 €"},{person:"Agua",detail:"1,20 €"}],
      memoryQuestion:easy?"¿Cuánto costaba la fruta?":"¿Cuánto costaba el Menú B?",
      opts:easy?opt4("2 €","1 €","3 €","4 €"):opt4("10,00 €","8,50 €","9,00 €","12,00 €"),a:easy?"2 €":"10,00 €"},age,"memory",level,v);
  }
  return answerItem({type:"memoryReveal",revealMs:reveal,mechanic:"mem_message",topic:"Memoria · mensaje",
    q:"Memoriza el mensaje. Después desaparecerá.",
    memoryContent:[{detail:easy?"Mañana lleva la carpeta verde y el libro de lectura.":"Reunión el jueves a las 17:30 en la sala 4. Lleva el informe y una copia del horario."}],
    memoryQuestion:easy?"¿De qué color era la carpeta?":"¿A qué hora era la reunión?",
    opts:easy?opt4("Verde","Azul","Roja","Amarilla"):opt4("17:30","17:00","18:00","16:30"),a:easy?"Verde":"17:30"},age,"memory",level,v);
}

function matrixLiteracy18(age:string,level:number,v:number){
  const m=v%18,k=Math.floor(v/18)%20,rank=ageRank(age),easy=rank===0,junior=rank===1;
  if(m<15) return matrixLiteracy15(age,level,k*15+m);
  if(m===15){
    const sc=easy?"Luna fue al patio. Allí encontró una pluma azul. La guardó en su caja.":"El centro cerrará el viernes a las 18:00 por mantenimiento y abrirá el sábado a las 10:00.";
    return answerItem({mechanic:"lit_detail_lookup",topic:"Lectura + Escritura · localizar información",scenario:sc,
      q:easy?"¿De qué color era la pluma?":"¿A qué hora abrirá el sábado?",
      opts:easy?opt4("Azul","Roja","Verde","Amarilla"):opt4("10:00","9:00","18:00","12:00"),a:easy?"Azul":"10:00"},age,"literacy",level,v);
  }
  if(m===16){
    return answerItem({type:"self",mechanic:"lit_continue_text",topic:"Lectura + Escritura · continuar un texto",
      scenario:easy?"Leo abrió la puerta y vio una caja pequeña.":"Mara recibió un mensaje inesperado justo antes de salir.",
      q:"Escribe una frase que continúe la historia de forma coherente.",
      sample:easy?"Dentro de la caja había una nota.":"Antes de salir, leyó el mensaje para saber si debía cambiar sus planes."},age,"literacy",level,v);
  }
  return answerItem({mechanic:"lit_punctuation",topic:"Lectura + Escritura · puntuación",
    q:easy?"¿Qué frase está mejor escrita?":"¿Qué opción puntúa mejor la frase?",
    opts:easy?opt4("Hola, Mara.","Hola Mara","hola, mara.","Hola mara"):opt4("Mara llegó, dejó la mochila y se sentó.","Mara llegó dejó la mochila y se sentó","Mara, llegó dejó, la mochila y se sentó.","Mara llegó dejó la mochila, y se sentó."),a:easy?"Hola, Mara.":"Mara llegó, dejó la mochila y se sentó."},age,"literacy",level,v);
}

function matrixReasoning18(age:string,level:number,v:number){
  const m=v%18,k=Math.floor(v/18)%20,rank=ageRank(age),easy=rank===0;
  if(m<15) return matrixReasoning15(age,level,k*15+m);
  if(m===15){
    return answerItem({mechanic:"rea_route",topic:"Razonamiento · recorrido",scenario:easy?"Casa → parque → biblioteca":"A → C → D → F",
      q:"¿Qué lugar viene justo después de "+(easy?"parque":"C")+"?",
      opts:easy?opt4("biblioteca","casa","parque","escuela"):opt4("D","A","C","F"),a:easy?"biblioteca":"D"},age,"speedReasoning",level,v);
  }
  if(m===16){
    return answerItem({mechanic:"rea_balance",topic:"Razonamiento · equivalencias",
      scenario:easy?"2 manzanas cuestan lo mismo que 4 monedas.":"3 entradas cuestan 24 €.",
      q:easy?"¿Cuántas monedas valen 1 manzana?":"¿Cuánto cuesta 1 entrada?",
      opts:easy?opt4("2","1","3","4"):opt4("8 €","6 €","10 €","12 €"),a:easy?"2":"8 €"},age,"speedReasoning",level,v);
  }
  return answerItem({mechanic:"rea_exclusion",topic:"Razonamiento · descarte",
    scenario:easy?"La caja no es roja ni azul. Puede ser verde o amarilla. Sabemos que no es amarilla.":"La reunión no es lunes ni martes. Puede ser miércoles o jueves. Sabemos que el jueves no hay sala.",
    q:"¿Cuál es la opción correcta?",opts:easy?opt4("Verde","Amarilla","Roja","Azul"):opt4("Miércoles","Jueves","Lunes","Martes"),a:easy?"Verde":"Miércoles"},age,"speedReasoning",level,v);
}

function matrixExecutive20(age:string,level:number,v:number){
  const m=v%20,k=Math.floor(v/20)%20,rank=ageRank(age),easy=rank===0;
  if(age==="teen"&&m===18)return matrixExecutive(age,level,k*12+4);
  if(m<15) return matrixExecutive15(age,level,k*15+m);
  if(m===15) return answerItem({type:"executiveDecision",mechanic:"exec_pack",topic:"Funciones ejecutivas · preparar materiales",
    scenario:easy?"Vas a natación. Necesitas bañador, toalla y chanclas.":"Vas a una actividad fuera. Necesitas identificación, agua y material de trabajo.",
    q:"¿Qué estrategia ayuda más?",opts:easy?opt4("Usar una lista y marcar lo preparado","Guardar cosas al azar","Confiar solo en recordarlo","Prepararlo al salir"):opt4("Usar una lista de comprobación","Preparar sin revisar","Llevar de todo sin criterio","Esperar al último minuto"),a:easy?"Usar una lista y marcar lo preparado":"Usar una lista de comprobación"},age,"executive",level,v);
  if(m===16) return answerItem({type:"executiveDecision",mechanic:"exec_route_plan",topic:"Funciones ejecutivas · planificar un recorrido",
    scenario:easy?"Tienes que ir de casa a la biblioteca y después al parque.":"Debes pasar por tres lugares antes de una cita.",
    q:"¿Qué ayuda más?",opts:easy?opt4("Pensar el orden antes de salir","Ir primero a cualquier sitio","Dar vueltas hasta encontrarlos","No mirar el camino"):opt4("Ordenar las paradas y estimar tiempos","Improvisar todo","Elegir siempre la ruta más larga","No dejar margen"),a:easy?"Pensar el orden antes de salir":"Ordenar las paradas y estimar tiempos"},age,"executive",level,v);
  if(m===17) return answerItem({type:"executiveDecision",mechanic:"exec_error_monitor",topic:"Funciones ejecutivas · detectar errores",
    scenario:easy?"Copiaste una palabra y ves que falta una letra.":"Una tabla tiene un total que no coincide con sus filas.",
    q:"¿Qué haces?",opts:easy?opt4("Parar y corregir la palabra","Seguir sin mirar","Borrar todo","Cambiar de actividad"):opt4("Revisar los datos y recalcular","Ignorar la diferencia","Cambiar el título","Copiar el total otra vez"),a:easy?"Parar y corregir la palabra":"Revisar los datos y recalcular"},age,"executive",level,v);
  if(m===18) return answerItem({type:"executiveDecision",mechanic:"exec_switch_task",topic:"Funciones ejecutivas · cambiar de tarea",
    scenario:easy?"Terminas un puzle y ahora toca recoger.":"Acabas una fase de trabajo y debes pasar a otra con reglas diferentes.",
    q:"¿Qué ayuda a cambiar bien?",opts:easy?opt4("Parar, mirar la nueva consigna y empezar","Seguir con el puzle","Hacer las dos cosas a la vez","No escuchar"):opt4("Cerrar la tarea anterior y revisar la nueva regla","Mantener la regla anterior","Mezclar ambos pasos","Empezar sin leer"),a:easy?"Parar, mirar la nueva consigna y empezar":"Cerrar la tarea anterior y revisar la nueva regla"},age,"executive",level,v);
  return answerItem({type:"executiveDecision",mechanic:"exec_prospective",topic:"Funciones ejecutivas · recordar hacer algo después",
    scenario:easy?"Cuando termine el recreo debes entregar una nota.":"Al llegar a casa debes enviar un archivo antes de empezar otra actividad.",
    q:"¿Qué estrategia puede ayudarte?",opts:easy?opt4("Dejar la nota en un lugar visible","Esconder la nota","No pensar en ello","Cambiar de mochila"):opt4("Crear un recordatorio o señal visible","Confiar solo en acordarte","Empezar otra cosa sin revisar","Ocultar el archivo"),a:easy?"Dejar la nota en un lugar visible":"Crear un recordatorio o señal visible"},age,"executive",level,v);
}

function matrixApplied20(age:string,level:number,v:number){
  const m=v%20,k=Math.floor(v/20)%20,rank=ageRank(age),easy=rank===0;
  if(m<15) return matrixApplied15(age,level,k*15+m);
  if(m===15) return answerItem({type:"appliedDecision",mechanic:"app_recipe",topic:"Cognición aplicada · receta",
    scenario:easy?"La receta dice: primero mezclar, después hornear.":"La receta necesita 2 huevos y tienes 1.",
    q:easy?"¿Qué haces antes de hornear?":"¿Qué dato necesitas resolver antes de empezar?",
    opts:easy?opt4("Mezclar","Hornear","Servir","Guardar"):opt4("Conseguir otro huevo o ajustar la receta","Cambiar el plato","Ignorar la cantidad","Empezar sin revisar"),a:easy?"Mezclar":"Conseguir otro huevo o ajustar la receta"},age,"applied",level,v);
  if(m===16) return answerItem({type:"appliedDecision",mechanic:"app_battery",topic:"Cognición aplicada · batería y uso",
    scenario:easy?"La tableta tiene poca batería y la necesitas para una actividad.":"Tu portátil tiene 15 % de batería y tendrás una videollamada de una hora.",
    q:"¿Qué conviene hacer?",opts:easy?opt4("Cargarla antes","Usarla hasta que se apague","Subir el brillo","No hacer nada"):opt4("Conectarlo a corriente o cargarlo antes","Aumentar el brillo","Abrir más aplicaciones","Ignorar la batería"),a:easy?"Cargarla antes":"Conectarlo a corriente o cargarlo antes"},age,"applied",level,v);
  if(m===17) return answerItem({type:"appliedDecision",mechanic:"app_queue",topic:"Cognición aplicada · turno",
    scenario:easy?"Hay tres personas esperando para comprar una entrada.":"Llegas a un punto de atención con una fila y tienes prisa.",
    q:"¿Qué opción es adecuada?",opts:easy?opt4("Ponerte al final de la fila","Colarte delante","Gritar","Irte sin decidir"):opt4("Respetar la fila y valorar otra opción si no llegas a tiempo","Colarte","Discutir","Ignorar las normas"),a:easy?"Ponerte al final de la fila":"Respetar la fila y valorar otra opción si no llegas a tiempo"},age,"applied",level,v);
  if(m===18) return answerItem({type:"appliedDecision",mechanic:"app_lost_item",topic:"Cognición aplicada · objeto perdido",
    scenario:easy?"No encuentras tu estuche en clase.":"Has perdido las llaves y recuerdas tres lugares donde estuviste.",
    q:"¿Qué estrategia ayuda más?",opts:easy?opt4("Mirar primero en los lugares donde lo usaste","Buscar al azar","Irte sin mirar","Comprar otro enseguida"):opt4("Reconstruir el recorrido y revisar por orden","Buscar sin plan","Volver solo al último lugar","Esperar sin hacer nada"),a:easy?"Mirar primero en los lugares donde lo usaste":"Reconstruir el recorrido y revisar por orden"},age,"applied",level,v);
  return answerItem({type:"appliedDecision",mechanic:"app_map",topic:"Cognición aplicada · mapa",
    scenario:easy?"En el plano, el parque está junto a la biblioteca.":"El mapa muestra dos rutas: una corta con escaleras y otra algo más larga sin escaleras.",
    q:easy?"Si estás en la biblioteca, ¿qué lugar está al lado?":"Si llevas una maleta pesada, ¿qué información conviene valorar?",
    opts:easy?opt4("El parque","La estación","La tienda","No se sabe"):opt4("La presencia de escaleras además de la distancia","Solo el color del mapa","Solo el nombre de la calle","Nada"),a:easy?"El parque":"La presencia de escaleras además de la distancia"},age,"applied",level,v);
}

function variantExercise(age:string,domain:string,level:number,subdomain:string|null=null,documentsOnly:boolean|null=null,photosOnly:boolean=false,interactionOnly:boolean=false,interactionKind:string|null=null){
  if(!interactionOnly&&!photosOnly&&documentsOnly!==true&&Math.random()<.3){const functional=(globalThis as any).FunctionalContent.generate(age,domain,level,subdomain);if(functional)return {...functional,id:age+'-functional-'+crypto.randomUUID()};}
  if(interactionOnly){const item=(globalThis as any).Curriculum.generateInteractive(age,domain,level,interactionKind);return item?{...item,id:age+'-interactive-'+crypto.randomUUID()}:null;}
  const photos=(globalThis as any).PhotoLibrary;
  const photo=()=>{const item=photos.generate(age,domain,level);return item?{...item,id:age+'-photo-'+crypto.randomUUID()}:null;};
  if(photosOnly)return photo();
  if(domain==='social'&&age==='teen'&&Math.random()<.5)return {...matrixSocial18(age,domain,level,Math.floor(Math.random()*360)),domain};
  if(domain==="attention"&&documentsOnly!==true&&photos.supports(age,domain)&&Math.random()<.3)return photo();
  if(domain==='attention'&&documentsOnly!==true&&Math.random()<.3){const bank=(globalThis as any).Curriculum.practice(age,domain,level);if(bank.length)return {...pick(bank),id:age+'-practice-'+crypto.randomUUID()};}
  const academic=(globalThis as any).Curriculum.generateAcademic(age,domain,level,subdomain||'grammar');
  if(academic)return {...academic,id:age+'-academic-'+crypto.randomUUID()};
  if(documentsOnly&&subdomain==='writing'&&(globalThis as any).DocumentLibrary.supports(age,domain)){const bank=(globalThis as any).Curriculum.pool(age,domain,level).filter((it:any)=>it.stimulus?.some((b:any)=>b.type==='document'));return {...pick(bank),id:age+'-document-writing-'+crypto.randomUUID()};}
  if(['language','middleLanguage','teenLanguage'].includes(domain)&&(subdomain==='vocabulary'||!subdomain&&Math.random()<.25)){const bank=(globalThis as any).Curriculum.vocabulary(age,domain,level);return {...pick(bank),id:age+'-vocabulary-'+crypto.randomUUID()};}
  if((globalThis as any).DocumentLibrary.supports(age,domain)&&subdomain!=='writing'&&(documentsOnly===true||documentsOnly===null&&((['attention','executive'].includes(domain)||['reading','literacy','middleReading'].includes(domain)&&subdomain!=='writing')&&Math.random()<(domain==='executive'?.25:.35))))return {...(globalThis as any).DocumentLibrary.generate(age,domain,level),id:age+"-document-"+crypto.randomUUID()};
  if((globalThis as any).Curriculum.supports(age,domain))return {...(globalThis as any).Curriculum.generate(age,domain,level,subdomain),id:age+"-curriculum-"+crypto.randomUUID()};
  if(age==="teen"&&["teenLanguage","speedReasoning","literacy"].includes(domain))return {...(globalThis as any).TeenReview.generate(domain,level,subdomain),id:"teen-review-"+crypto.randomUUID()};
  if(age==="junior")return {...(globalThis as any).JuniorContent.generate(domain,level,subdomain),id:"junior-"+crypto.randomUUID()};
  if(age==="primary")return {...(globalThis as any).PrimaryContent.generate(domain,level,subdomain),id:"primary-"+crypto.randomUUID()};
  if(age==="middle")return {...(globalThis as any).MiddleContent.generate(domain,level,subdomain),id:"middle-"+crypto.randomUUID()};
  let max=300;
  if(domain==="social") max=360;
  else if(["language","middleLanguage","teenLanguage"].includes(domain)) max=age==="early"?400:360;
  else if(["executive","applied"].includes(domain)) max=400;
  else if(["attention","memory","speedReasoning","literacy"].includes(domain)) max=360;
  const v=Math.floor(Math.random()*max);

  if(domain==="geometry"&&age==="primary")return variantGeometry(level,v);

  if(["division","geometry","middleMath","teenMath"].includes(domain)) return variantMath(age,domain,level,v);
  if(["language","middleLanguage","teenLanguage"].includes(domain)) return age==="early"?matrixLanguage20Early(age,domain,level,v):matrixLanguage18(age,domain,level,v);
  if(["reading","middleReading"].includes(domain)) return variantReading(age,domain,level,v);
  if(domain==="attention") return matrixAttention18(age,level,v);
  if(domain==="executive") return matrixExecutive20(age,level,v);
  if(domain==="memory") return matrixMemory18(age,level,v);
  if(domain==="speedReasoning") return matrixReasoning18(age,level,v);
  if(domain==="applied") return matrixApplied20(age,level,v);
  if(domain==="social") return matrixSocial18(age,domain,level,v);
  if(domain==="english") return variantEnglish(age,domain,level,v);
  if(domain==="literacy") return matrixLiteracy18(age,level,v);
  return null;
}


function ensureWorksheetMemoryCoherence(item:any){
  // Never manufacture a fact from the supplied answer. Invalid memory is
  // rejected by validateItem and the client printable gate.
  return item;
}

function worksheetTask(age:string, domain:string, level:number){
  const generated=variantExercise(age,domain,level);
  if(generated) return {...generated,sourceDomain:domain};
  const pool=academicPool(age,domain,null,level);
  if(!pool.length) return {...cognitionExercise(age,pick(["attention","executive","memory"]),level),sourceDomain:domain};
  return {...structuredClone(pick(pool)),sourceDomain:domain};
}

Deno.serve(async (req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST") return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{...corsHeaders,"Content-Type":"application/json"}});
  const authHeader=req.headers.get("Authorization");
  if(!authHeader?.startsWith("Bearer ")) return new Response(JSON.stringify({error:"Authentication required"}),{status:401,headers:{...corsHeaders,"Content-Type":"application/json"}});
  const token=authHeader.slice(7);
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await admin.auth.getUser(token);
  const user=userData?.user;
  if(userError||!user) return new Response(JSON.stringify({error:"Invalid session"}),{status:401,headers:{...corsHeaders,"Content-Type":"application/json"}});
  let body:any={}; try{ body=await req.json(); }catch{}
  const profileId=body.profile_id;
  const kind=body.kind;
  if(!profileId || !["exercise","worksheet","game"].includes(kind)) return new Response(JSON.stringify({error:"Invalid request"}),{status:400,headers:{...corsHeaders,"Content-Type":"application/json"}});
  const {data:profile,error:pe}=await admin.from("learner_profiles").select("id,account_id,age_band,locale,progress").eq("id",profileId).single();
  if(pe||!profile||profile.account_id!==user.id) return new Response(JSON.stringify({error:"Profile not found"}),{status:404,headers:{...corsHeaders,"Content-Type":"application/json"}});
  const {data:account,error:ae}=await admin.from("accounts").select("subscription_status,trial_ends_at,content_locale").eq("user_id",user.id).single();
  if(ae||!account) return new Response(JSON.stringify({error:"Account not found"}),{status:404,headers:{...corsHeaders,"Content-Type":"application/json"}});
  if(account.subscription_status==="trial" && new Date(account.trial_ends_at)<=new Date()) return new Response(JSON.stringify({error:"Trial expired"}),{status:403,headers:{...corsHeaders,"Content-Type":"application/json"}});
  const limit=(LIMITS[account.subscription_status]||LIMITS.trial)[kind];
  if(body.session_only!==undefined&&typeof body.session_only!=='boolean')return new Response(JSON.stringify({error:'Modalidad de sesión no válida.'}),{status:400,headers:{...corsHeaders,'Content-Type':'application/json'}});
  const sessionOnly=body.session_only===true;
  if(sessionOnly&&Number(body.client_revision||1)<6)return new Response(JSON.stringify({error:'Actualiza la página para abrir sesiones independientes.'}),{status:409,headers:{...corsHeaders,'Content-Type':'application/json'}});
  const progress=sessionOnly?{ageRoute:profile.progress?.ageRoute}:profile.progress||{};
  const date=todayUTC();
  const delivery=progress._delivery?.seen ? {...progress._delivery,date} : {date,seen:{}};
  const cost=kind==="worksheet"?1:Math.max(1,Math.min(Number(body.count||1),kind==="exercise"?10:1));
  const {data:usageRow}=await admin.from("content_usage").select("used").eq("user_id",user.id).eq("usage_date",date).eq("kind",kind).maybeSingle();
  const usedNow=Number(usageRow?.used||0);
  if(usedNow+cost>limit) return new Response(JSON.stringify({error:"Daily content limit reached"}),{status:403,headers:{...corsHeaders,"Content-Type":"application/json"}});
  const route=profile.progress?.ageRoute;
  const age=(route==="early"||route==="junior")?route:profile.age_band;
  const locale=(globalThis as any).LocaleContent.normalize(account.content_locale??profile.locale);
  const level=Math.max(1,Math.min(3,Number(body.level||1)));
  const requestedDomains=kind==="worksheet" ? (Array.isArray(body.domains)&&body.domains.length?body.domains:(globalThis as any).Curriculum.visible(SUBJECTS[age]||[],age)) : [body.domain];
  if(!SUBJECTS[age] || !Number.isInteger(level) || (kind!=="game" && (!Array.isArray(requestedDomains)||!requestedDomains.length||requestedDomains.some((d:any)=>!SUBJECTS[age].includes(d)))))
    return new Response(JSON.stringify({error:"Área o nivel no permitido para este perfil."}),{status:400,headers:{...corsHeaders,"Content-Type":"application/json"}});
  if(body.client_revision!==undefined&&![1,2,3,4,5,6,7,8,9,10].includes(body.client_revision))return new Response(JSON.stringify({error:'Versión de la aplicación no compatible. Actualiza la página.'}),{status:400,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(body.room_speed_only!==undefined&&(typeof body.room_speed_only!=='boolean'||body.room_speed_only&&(kind!=='exercise'||body.domain!=='speedReasoning'||!['junior','primary','middle','teen'].includes(age)||body.interaction_only||body.photos_only||body.documents_only)))return new Response(JSON.stringify({error:'Modalidad de velocidad no válida.'}),{status:400,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(body.room_speed_only&&Number(body.client_revision||1)<10)return new Response(JSON.stringify({error:'Actualiza la página para abrir los retos del entorno.'}),{status:409,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(body.interaction_only!==undefined&&(typeof body.interaction_only!=='boolean'||body.interaction_only&&(kind!=='exercise'||!['junior','primary','middle','teen'].includes(age)||!['attention','executive'].includes(body.domain)||body.documents_only||body.photos_only)))return new Response(JSON.stringify({error:'Modalidad interactiva no disponible para esta petición.'}),{status:400,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(body.interaction_only&&Number(body.client_revision||1)<4)return new Response(JSON.stringify({error:'Actualiza la página para abrir las actividades interactivas.'}),{status:409,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(body.interaction_kind==='auditory'&&Number(body.client_revision||1)<5)return new Response(JSON.stringify({error:'Actualiza la página para abrir las actividades con audio.'}),{status:409,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(body.interaction_kind!==undefined&&(!body.interaction_only||!(body.domain==='attention'?['room']:['symbols','movement','auditory']).includes(body.interaction_kind)))return new Response(JSON.stringify({error:'Tipo de actividad interactiva no válido.'}),{status:400,headers:{...corsHeaders,'Content-Type':'application/json'}});
  // Existing tabs must never receive an interaction they cannot score. Old
  // clients retain established tasks; the new document audit requests a refresh.
  if(body.photos_only&&Number(body.client_revision||1)<3)return new Response(JSON.stringify({error:'Actualiza la página para abrir las escenas cotidianas.'}),{status:409,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(kind==='exercise'&&Number(body.client_revision||1)<2&&body.domain==='executive'&&body.documents_only===true&&level>=2)return new Response(JSON.stringify({error:'Actualiza la página para abrir las nuevas actividades con documentos.'}),{status:409,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(body.documents_only!==undefined&&(typeof body.documents_only!=="boolean"||body.documents_only&&!((globalThis as any).DocumentLibrary.supports(age,body.domain))))return new Response(JSON.stringify({error:"Los documentos no están disponibles para esta área."}),{status:400,headers:{...corsHeaders,"Content-Type":"application/json"}});
  if(kind==='exercise'&&['reading','middleReading','literacy'].includes(body.domain)&&body.subdomain&&!['reading','writing'].includes(body.subdomain))return new Response(JSON.stringify({error:'Modalidad de Lectura + Escritura no válida.'}),{status:400,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(kind==='exercise'&&['language','middleLanguage','teenLanguage'].includes(body.domain)&&body.subdomain==='writing')return new Response(JSON.stringify({error:'Escritura está en Lectura + Escritura.'}),{status:400,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if((age==="junior"||age==="primary"||age==="middle"||age==="teen")&&kind==="exercise"&&["language","middleLanguage","teenLanguage"].includes(body.domain)&&body.subdomain&&!["grammar","spelling","vocabulary","writing"].includes(body.subdomain))
    return new Response(JSON.stringify({error:"Habilidad de Lenguaje no válida."}),{status:400,headers:{...corsHeaders,"Content-Type":"application/json"}});
  // Cached clients do not yet know these document IDs and photographic sources.
  const compatibleSource=(item:any)=>(Number(body.client_revision||1)>=10||!['ceramics2026','music2026','bicycle2026','greenhouse2026'].includes((item?.photoTask?.sceneId||item?.photoTask?.pairId))&&!(item?.stimulus||[]).some((b:any)=>['photo','photoPair'].includes(b.type)&&['ceramics2026','music2026','bicycle2026','greenhouse2026'].includes(b.photoId||b.pairId)))&&(Number(body.client_revision||1)>=8||!(item?.stimulus||[]).some((block:any)=>block.type==='document'&&String(block.documentId).startsWith('everyday-')||block.type==='photo'&&['library2026','autumnPark2026'].includes(block.photoId)));
  if(body.executed_only!==undefined&&(typeof body.executed_only!=='boolean'||body.executed_only&&(kind!=='exercise'||!['attention','memory','executive'].includes(body.domain)||body.interaction_only||body.photos_only||body.documents_only||body.room_speed_only)))return new Response(JSON.stringify({error:'Modalidad interactiva no válida.'}),{status:400,headers:{...corsHeaders,'Content-Type':'application/json'}});
  if(body.executed_only&&Number(body.client_revision||1)<10)return new Response(JSON.stringify({error:'Actualiza la página para abrir los retos interactivos.'}),{status:409,headers:{...corsHeaders,'Content-Type':'application/json'}});
  let items:any[]=[];
  if(kind==="game"){
    const excludeTypes=Array.isArray(body.exclude_types)?body.exclude_types.slice(-2):[];
    items=[cognitiveGame(age,level,excludeTypes)];
  } else if(kind==="worksheet"){
    const qn=Math.max(6,Math.min(account.subscription_status==="trial"?15:20,Number(body.questions||12)));
    const domains=(Array.isArray(body.domains)&&body.domains.length?body.domains:(globalThis as any).Curriculum.visible(SUBJECTS[age]||[],age).filter((x:string)=>x!=="games")).filter((x:string)=>x!=="games");
    const {data:wsSeenRows}=sessionOnly?{data:[]}:await admin.from("content_seen")
      .select("domain,item_signature,mechanic_signature")
      .eq("user_id",user.id)
      .eq("profile_id",profileId)
      .like("domain","worksheet:%")
      .order("created_at",{ascending:false})
      .limit(500);
    const recentByDomain=new Map<string,Set<string>>();
    for(const row of (wsSeenRows||[])){
      const d=String(row.domain||"").replace(/^worksheet:/,"");
      if(!recentByDomain.has(d)) recentByDomain.set(d,new Set());
      if(row.item_signature) recentByDomain.get(d)!.add(String(row.item_signature));
    }
    const localSeen=new Set<string>();
    const domainOrder:string[]=[];
    while(domainOrder.length<qn){
      const cycle=shuffle(domains);
      for(const d of cycle){ if(domainOrder.length<qn) domainOrder.push(d); }
    }
    const wsRows:any[]=[];
    for(const domain of domainOrder){
      let chosen:any=null, fallback:any=null;
      const recent=recentByDomain.get(domain)||new Set<string>();
      for(let tries=0;tries<220;tries++){
        const cand=regionalCandidate(normalizeItem(ensureWorksheetMemoryCoherence(worksheetTask(age,domain,level))),locale,domain,age);
        if(!compatibleSource(cand))continue;
        if(cand?.photoTask&&Number(body.client_revision||1)<3)continue;
        if(!validateItem(cand)) continue;
        const sig=contentSignature(domain,cand);
        if(!fallback&&!localSeen.has(sig)) fallback=cand;
        if(!recent.has(sig)&&!localSeen.has(sig)){ chosen=cand; break; }
      }
      const item=chosen || (fallback&&!localSeen.has(contentSignature(domain,fallback))?fallback:null);
      if(!item) return new Response(JSON.stringify({error:"No hay suficientes actividades distintas para esta ficha. Reduce el número de ejercicios o añade otra área."}),{status:422,headers:{...corsHeaders,"Content-Type":"application/json"}});
      const sig=contentSignature(domain,item);
      localSeen.add(sig);
      items.push(item);
      wsRows.push({
        user_id:user.id,
        profile_id:profileId,
        domain:"worksheet:"+domain,
        item_signature:sig,
        mechanic_signature:mechanicSignature(domain,item)
      });
    }
    if(!sessionOnly&&wsRows.length) await admin.from("content_seen").insert(wsRows);
  } else {
    const domain=body.domain;
    const subdomain=body.subdomain||null;
    const n=Math.max(1,Math.min(10,Number(body.count||1)));
    const {data:seenRows,error:seenError}=sessionOnly?{data:[],error:null}:await admin.from("content_seen")
      .select("item_signature,mechanic_signature")
      .eq("user_id",user.id)
      .eq("profile_id",profileId)
      .eq("domain",domain)
      .order("created_at",{ascending:false})
      .limit(450);
    const recentEntries:string[]=[...(delivery.seen?.[domain]||[])];
    if(seenError)console.warn('Content history unavailable; using profile delivery history.');
    for(const row of (seenRows||[]).reverse()){
      if(row.item_signature) recentEntries.push(row.item_signature);
      if(row.mechanic_signature) recentEntries.push(row.mechanic_signature);
    }
    const compatibleExercise=()=>{
      const item=body.room_speed_only?pick((globalThis as any).Curriculum.roomSpeedPool(age,level)):variantExercise(age,domain,level,subdomain,typeof body.documents_only==='boolean'?body.documents_only:null,body.photos_only===true,body.interaction_only===true,body.interaction_kind||null);
      if(!item||!compatibleSource(item)||Number(body.client_revision||1)<2&&(item.type==='documentReview'||item.selectiveRecall)||Number(body.client_revision||1)<3&&item.photoTask)return null;
      return regionalCandidate(item,locale,domain,age);
    };
    if(body.executed_only===true){
      const bank=(globalThis as any).ExecutedTasks.pool(age,domain,level).map((it:any)=>regionalCandidate(it,locale,domain,age)).filter(Boolean);
      items=generatedItems(domain,n,recentEntries,()=>null,bank);
    }else if(body.photos_only===true){
      const bank=(globalThis as any).PhotoLibrary.pool(age,domain,level).filter(compatibleSource).map((it:any)=>regionalCandidate(it,locale,domain,age)).filter(Boolean);
      items=generatedItems(domain,n,recentEntries,compatibleExercise,bank);
    }else if(domain==="attention"){
      items=generatedItems(domain,n,recentEntries,compatibleExercise);
    } else if(["executive","memory","speedReasoning","applied","social","language","middleLanguage","teenLanguage","division","geometry","middleMath","teenMath","reading","middleReading","english","literacy"].includes(domain)){
      items=generatedItems(domain,n,recentEntries,compatibleExercise);
    } else {
      const seen=new Set(recentEntries);
      const pool=academicPool(age,domain,subdomain,level);
      let available=pool.filter((x:any)=>!seen.has(keyOf(domain,subdomain,x)));
      if(!available.length) available=pool;
      items=shuffle(available).slice(0,n);
    }
    if(items.length!==n)return new Response(JSON.stringify({error:"No hay actividades disponibles para esta área y variante de español. Prueba otra área."}),{status:422,headers:{...corsHeaders,"Content-Type":"application/json"}});
    delivery.seen ||= {};
    delivery.seen[domain] ||= [];
    for(const it of items){
      const generated=["attention","executive","memory","speedReasoning","applied","social","language","middleLanguage","teenLanguage","division","geometry","middleMath","teenMath","reading","middleReading","english","literacy"].includes(domain);
      const sig=generated?contentSignature(domain,it):keyOf(domain,subdomain,it);
      delivery.seen[domain].push(sig);
      if(generated){delivery.seen[domain].push(mechanicSignature(domain,it));delivery.seen[domain].push(domain+':semantic:'+familyOf(it,domain));}
      const question=photoQuestionSignature(domain,it);if(question)delivery.seen[domain].push(question);
    }
    delivery.seen[domain]=delivery.seen[domain].slice(-450);
    const seenInsert=items.map((it:any)=>{
      const generated=["attention","executive","memory","speedReasoning","applied","social","language","middleLanguage","teenLanguage","division","geometry","middleMath","teenMath","reading","middleReading","english","literacy"].includes(domain);
      const itemSig=generated?contentSignature(domain,it):keyOf(domain,subdomain,it);
      return {
        user_id:user.id,
        profile_id:profileId,
        domain,
        item_signature:itemSig,
        mechanic_signature:generated?storedMechanicSignature(domain,it):null
      };
    });
    if(!sessionOnly&&seenInsert.length) await admin.from("content_seen").insert(seenInsert);
  }
  items=items.map(normalizeItem).filter(validateItem);
  if(age!=="early")items=localizeValue(items,locale);
  items=sanitizeGeneratedLanguage(items);
  items=items.map((it:any)=>(globalThis as any).ContentQuality.annotate(it,age,it.domain||body.domain));
  const nextUsed=usedNow+cost;
  await admin.from("content_usage").upsert({user_id:user.id,usage_date:date,kind,used:nextUsed,updated_at:new Date().toISOString()},{onConflict:"user_id,usage_date,kind"});
  const nextProgress={...progress,_delivery:delivery};
  if(!sessionOnly)await admin.from("learner_profiles").update({progress:nextProgress}).eq("id",profileId);
  return new Response(JSON.stringify({items,usage:{kind,used:nextUsed,limit},subjects:(globalThis as any).Curriculum.visible(SUBJECTS[age]||[],age)}),{headers:{...corsHeaders,"Content-Type":"application/json"}});
});

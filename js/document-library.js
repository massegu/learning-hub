(function(root){
'use strict';
const text=value=>({type:'text',text:value}),table=rows=>({type:'table',header:true,rows});
const documents={
 'invoice-co-v1':{title:'Factura de Papelería Norte',kind:'Factura',country:'Colombia',width:1024,height:1536,path:'assets/documents/invoice-co-v1.png',
  transcript:[text('FACTURA · Papelería Norte · F-1048. Fecha: 14/10/2026. Moneda: pesos colombianos (COP).'),table([['Producto','Cantidad','Precio unitario','Importe'],['Cuadernos','2','6.000','12.000'],['Carpetas','3','2.000','6.000'],['Lápices','4','1.000','4.000']]),text('Subtotal: 22.000. Entrega: 3.000. TOTAL: 25.000. Pagar antes del 20/10/2026. Documento ficticio para practicar.')],
  facts:{subtotal:22000,delivery:3000,total:25000,issued:'14/10/2026',due:'20/10/2026'},
  questions:[['¿Cuál es el total que debe pagarse?','25.000 COP',['22.000 COP','3.000 COP','12.000 COP']],['¿Cuánto cuestan los dos cuadernos juntos?','12.000 COP',['6.000 COP','22.000 COP','25.000 COP']],['¿Qué dato falta en un plan que solo reserva 22.000 COP para pagar toda la factura?','Los 3.000 COP de entrega',['Los 12.000 COP de cuadernos','Los 6.000 COP de carpetas','Los 4.000 COP de lápices']]]},
 'receipt-co-v1':{title:'Recibo de Tienda Barrio Verde',kind:'Recibo de compra',country:'Colombia',width:1024,height:1536,path:'assets/documents/receipt-co-v1.png',
  transcript:[text('Tienda Barrio Verde · RECIBO DE COMPRA · R-0312 · 15/10/2026 · 10:35. Moneda: pesos colombianos (COP).'),table([['Producto','Cantidad','Importe'],['Pan','1','5.000'],['Leche','2','8.000'],['Manzanas','1','6.000']]),text('TOTAL: 19.000. Pagado: 20.000. Cambio: 1.000. Gracias por tu visita. Documento ficticio para practicar.')],
  facts:{total:19000,paid:20000,change:1000,milkCount:2,milkAmount:8000},
  questions:[['¿Cuánto dinero se entregó para pagar?','20.000 COP',['19.000 COP','1.000 COP','8.000 COP']],['¿Qué cantidad corresponde al importe de las dos unidades de leche?','8.000 COP',['4.000 COP','19.000 COP','2.000 COP']],['Al revisar el pago, alguien dice que deben devolver 2.000 COP. ¿Qué corrección corresponde?','El cambio es 1.000 COP: se pagaron 20.000 y el total es 19.000',['El cambio es 2.000 COP porque se compraron dos unidades de leche','No hay cambio porque el total es 20.000 COP','El cambio es 8.000 COP, igual al importe de la leche']]]},
 'catalogue-co-v1':{title:'Catálogo escolar de Papelería Norte',kind:'Catálogo',country:'Colombia',width:1024,height:1536,path:'assets/documents/catalogue-co-v1.png',
  transcript:[text('CATÁLOGO ESCOLAR · Papelería Norte. Moneda: pesos colombianos (COP). Válido hasta el 31/10/2026.'),table([['Producto','Precio'],['Cuaderno azul','6.000'],['Carpeta verde','2.000'],['Lápiz','1.000'],['Cartuchera','8.000']]),text('Paquete A: cuaderno + carpeta · 7.000. Paquete B: cartuchera + lápiz · 8.500. Recogida en tienda: sin cargo. Documento ficticio para practicar.')],
  facts:{notebook:6000,folder:2000,pencil:1000,pencilCase:8000,packageA:7000,packageB:8500,validUntil:'31/10/2026'},
  questions:[['¿Qué producto tiene un precio de 8.000 COP?','La cartuchera',['El cuaderno azul','La carpeta verde','El lápiz']],['Necesitas un cuaderno y una carpeta. ¿Qué opción tiene menor precio?','El paquete A por 7.000 COP',['Los dos productos por separado por 8.000 COP','El paquete B por 8.500 COP','La cartuchera por 8.000 COP']],['El plan propone comprar el paquete B para conseguir un cuaderno y una carpeta. ¿Qué debe corregirse?','Elegir el paquete A, que incluye los dos productos necesarios',['Añadir otro lápiz al paquete B','Comprar solo la cartuchera','Cambiar el paquete B por un lápiz suelto']]]},
 'brochure-co-v1':{title:'Folleto del taller de dibujo',kind:'Folleto',country:'Colombia',width:1024,height:1536,path:'assets/documents/brochure-co-v1.png',
  transcript:[text('TALLER DE DIBUJO · Centro Cultural La Plaza. Sábado 24/10/2026. De 10:00 a 12:00.'),table([['Dato','Condición'],['Edad','De 12 a 18 años'],['Inscripción','Hasta el 22/10/2026'],['Materiales','Incluidos'],['Precio','Actividad gratuita'],['Llegada','15 minutos antes'],['Para entrar','Trae tu confirmación de inscripción']]),text('Documento ficticio para practicar.')],
  facts:{date:'24/10/2026',registration:'22/10/2026',start:'10:00',finish:'12:00',earlyMinutes:15,minAge:12,maxAge:18},
  questions:[['¿Hasta qué fecha se puede hacer la inscripción?','22/10/2026',['24/10/2026','31/10/2026','20/10/2026']],['Si el taller empieza a las 10:00 y pide llegar quince minutos antes, ¿a qué hora debes estar allí?','09:45',['10:00','10:15','09:15']],['El plan propone inscribirse el 23/10 y llegar a las 10:00 del día del taller. ¿Qué dos cambios hacen falta?','Inscribirse como máximo el 22/10 y llegar a las 09:45',['Inscribirse el 24/10 y llegar a las 09:45','Inscribirse el 22/10 y llegar a las 10:00','Inscribirse el 23/10 y llegar a las 09:45']]]}
};
// Executive tasks ask the learner to apply conditions and review a proposed plan.
// Attention and literacy retain locating and interpreting source information.
const executiveQuestions={
 'invoice-co-v1':[
 ['Debes pagar toda la factura. El plan reserva solo el subtotal y olvida la entrega. ¿Qué cantidad debes reservar?', '25.000 COP', ['22.000 COP','3.000 COP','12.000 COP']],
 ['Una persona reserva 25.000 COP, pero cree que los cuadernos cuestan 6.000 COP en total. ¿Qué dato debe corregir antes de registrar el gasto?', 'Los dos cuadernos cuestan 12.000 COP en total', ['El total de la factura debe cambiarse a 22.000 COP','La entrega no tiene ningún cargo','Las carpetas cuestan 2.000 COP en total']],
 documents['invoice-co-v1'].questions[2]],
 'receipt-co-v1':[
 ['Pagaste con 20.000 COP. Antes de guardar el recibo debes comprobar el cambio. ¿Qué cantidad debe coincidir?', '1.000 COP', ['2.000 COP','8.000 COP','19.000 COP']],
 ['En tu registro anotaste 20.000 COP como gasto final de esta compra. Al revisar el recibo ves que hubo cambio. ¿Cómo corriges el registro?', 'Registrar 19.000 COP de gasto y 1.000 COP de cambio', ['Registrar 20.000 COP de gasto y ningún cambio','Registrar 18.000 COP de gasto y 2.000 COP de cambio','Registrar 8.000 COP de gasto y 12.000 COP de cambio']],
 documents['receipt-co-v1'].questions[2]],
 'catalogue-co-v1':[
 ['Necesitas un cuaderno y una carpeta. El presupuesto es de 7.000 COP. ¿Qué compra cumple las dos condiciones?', 'El paquete A', ['El paquete B','Solo el cuaderno azul','Los dos productos por separado']],
 ['El plan compra un cuaderno y una carpeta por separado por 8.000 COP. Debes conseguir ambos por el menor precio. ¿Qué cambio haces?', 'Comprar el paquete A por 7.000 COP', ['Comprar el paquete B por 8.500 COP','Comprar solo la carpeta por 2.000 COP','Comprar una cartuchera por 8.000 COP']],
 documents['catalogue-co-v1'].questions[2]],
 'brochure-co-v1':[
 ['Tienes 16 años y quieres asistir al taller. Antes de la fecha límite debes hacer un trámite. ¿Qué paso incluyes primero?', 'Hacer la inscripción como máximo el 22/10/2026', ['Presentarte sin inscripción el 24/10/2026','Pagar materiales que el taller ya incluye','Esperar al 31/10/2026 para inscribirte']],
 ['Ya estás inscrito. El plan es llegar al taller a las 10:00 sin llevar nada. ¿Qué dos detalles debes revisar?', 'Llegar a las 09:45 y llevar la confirmación', ['Llegar a las 10:15 y pagar materiales','Llegar a las 12:00 y llevar la confirmación','Llegar a las 10:00 y volver a inscribirte']],
 documents['brochure-co-v1'].questions[2]]
};
const attentionAdvanced={
 'invoice-co-v1':['¿Qué combinación coincide con el subtotal y la entrega, en ese orden?','22.000 COP y 3.000 COP',['25.000 COP y 3.000 COP','22.000 COP y 6.000 COP','12.000 COP y 4.000 COP']],
 'receipt-co-v1':['¿Qué combinación coincide con el total y el cambio, en ese orden?','19.000 COP y 1.000 COP',['20.000 COP y 1.000 COP','19.000 COP y 2.000 COP','8.000 COP y 6.000 COP']],
 'catalogue-co-v1':['¿Qué combinación coincide con el precio del paquete B y su contenido?','8.500 COP: cartuchera y lápiz',['7.000 COP: cartuchera y lápiz','8.500 COP: cuaderno y carpeta','8.000 COP: cuaderno y lápiz']],
 'brochure-co-v1':['¿Qué combinación coincide con la fecha límite de inscripción y el horario del taller?','22/10/2026 y de 10:00 a 12:00',['24/10/2026 y de 10:00 a 12:00','22/10/2026 y de 09:45 a 12:00','31/10/2026 y de 10:00 a 12:00']]
};
function get(id){return documents[id]||null;}
function supports(age,domain){return ['junior','primary','middle','teen'].includes(age)&&['attention','executive','literacy'].includes(domain)&&!(age==='junior'&&domain==='literacy');}
function pool(age,domain,level=1){
 if(!supports(age,domain))return [];
 const source=age==='junior'?['catalogue-co-v1']:Object.keys(documents);
 return source.map(id=>{
  const doc=get(id),tuple=domain==='executive'?executiveQuestions[id][level-1]:domain==='attention'&&level===3?attentionAdvanced[id]:doc.questions[level-1],q=tuple[0],a=tuple[1],opts=[a,...tuple[2]];
  return {id:`document-${age}-${domain}-${level}-${id}`,contentKey:`document-v1:${age}:${domain}:${level}:${id}`,passageKey:`document:${id}`,domain,level,
   type:'standard',responseType:'choice',requiresStimulus:true,currencyContext:'foreign',topic:doc.kind+' · interpretar un documento',
   stimulus:[text(id==='brochure-co-v1'?'Documento de un centro cultural ficticio de Colombia.':'Documento de un comercio ficticio de Colombia. Los importes se expresan en pesos colombianos (COP).'),{type:'document',documentId:id}],q,a,opts,
   why:a+'. Comprueba los datos directamente en el documento.',mechanic:`document_${domain}_${doc.kind.replace(/\s/g,'_')}_${level}`,
   ...(age==='junior'?{juniorProfile:{route:age,level}}:{}),...(['primary','middle'].includes(age)?{schoolProfile:{route:age,level}}:{})};
 });
}
function generate(age,domain,level){const bank=pool(age,domain,level);return bank[Math.floor(Math.random()*bank.length)]||null;}
const api={documents,get,supports,pool,generate};root.DocumentLibrary=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

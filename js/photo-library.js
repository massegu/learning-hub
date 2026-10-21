(function(root){
'use strict';
// AI-generated photographs, individually inspected against these factual keys.
// Alternative text is deliberately neutral during recall; facts are not shown.
const fact=(q,a,wrong,detail)=>({q,a,opts:[a,...wrong],detail});
const scenes={
 kitchen:{title:'Escena cotidiana en una cocina',width:1448,height:1086,path:'assets/photos/kitchen-a.png',
  facts:[
   fact('¿De qué color era la taza?','Roja',['Verde','Azul','Amarilla'],'La taza era roja.'),
   fact('¿De qué color era el cuaderno?','Azul',['Rojo','Verde','Naranja'],'El cuaderno era azul.'),
   fact('¿De qué color era la mochila?','Amarilla',['Morada','Roja','Azul'],'La mochila era amarilla.'),
   fact('¿Cuántas manzanas había en el plato?','Tres',['Dos','Cuatro','Una'],'Había tres manzanas en el plato.'),
   fact('¿De qué color eran las manzanas?','Verdes',['Rojas','Amarillas','Moradas'],'Las manzanas eran verdes.'),
   fact('¿Dónde estaba la mochila?','En el respaldo de la silla',['Debajo de la mesa','Sobre el plato','En la ventana'],'La mochila estaba en el respaldo de la silla.'),
   fact('¿Qué había delante de la taza?','Una cuchara',['Un tenedor','Una llave','Un lápiz'],'Había una cuchara delante de la taza.'),
   fact('¿Dónde estaba la planta?','En la ventana',['En el suelo','Sobre el cuaderno','Debajo de la silla'],'La planta estaba en la ventana.'),
   fact('¿Qué había en el centro de la mesa?','Un cuaderno',['Una mochila','Una planta','Un reloj'],'El cuaderno estaba en el centro de la mesa.'),
   fact('¿Qué había a la derecha del cuaderno?','Un plato con manzanas',['Una taza','Una lámpara','Una mochila'],'El plato con manzanas estaba a la derecha del cuaderno.'),
   fact('¿Estaba abierto o cerrado el cuaderno?','Cerrado',['Abierto por la mitad','Abierto por la primera página','No había cuaderno'],'El cuaderno estaba cerrado.'),
   fact('¿Qué objeto estaba a la izquierda del cuaderno?','La taza',['El plato','La planta','La mochila'],'La taza estaba a la izquierda del cuaderno.')
  ]},
 living:{title:'Escena cotidiana en un salón',width:1448,height:1086,path:'assets/photos/living-a.png',
  facts:[
   fact('¿Cuántos cojines había en el sofá?','Dos',['Tres','Uno','Cuatro'],'Había dos cojines en el sofá.'),
   fact('¿De qué color era el cojín de la izquierda?','Amarillo',['Morado','Rojo','Verde'],'El cojín de la izquierda era amarillo.'),
   fact('¿De qué color era el cojín de la derecha?','Rojo',['Azul','Amarillo','Morado'],'El cojín de la derecha era rojo.'),
   fact('¿De qué color era el sofá?','Azul',['Verde','Rojo','Gris'],'El sofá era azul.'),
   fact('¿De qué color era el libro?','Verde',['Rojo','Amarillo','Azul'],'El libro era verde.'),
   fact('¿Qué había a la derecha del libro?','Un vaso de agua',['Una taza','Un plato','Una mochila'],'Había un vaso de agua a la derecha del libro.'),
   fact('¿Dónde estaba la lámpara de pie?','A la izquierda del sofá',['Detrás del cuadro','Sobre la mesa','A la derecha del sofá'],'La lámpara de pie estaba a la izquierda del sofá.'),
   fact('¿Dónde estaba el balón?','En el suelo, a la derecha del sofá',['Sobre el sofá','Debajo del libro','En la mesa'],'El balón estaba en el suelo, a la derecha del sofá.'),
   fact('¿Qué paisaje mostraba el cuadro?','Montañas',['Una ciudad','Una playa','Un desierto'],'El cuadro mostraba montañas.'),
   fact('¿De qué color era el balón?','Naranja',['Azul','Verde','Morado'],'El balón era naranja, con partes oscuras.'),
   fact('¿Qué había sobre la mesa?','Un libro y un vaso',['Dos libros','Una taza y un plato','Un balón y un vaso'],'Sobre la mesa había un libro y un vaso.'),
   fact('¿Estaba abierto o cerrado el libro?','Cerrado',['Abierto por la mitad','Abierto por la primera página','No había libro'],'El libro estaba cerrado.')
  ]}
};
const pairs={
 kitchen:{sceneId:'kitchen',path:'assets/photos/kitchen-b.png',regions:{'La taza':[7,46,18,23],'El cuaderno':[31,54,28,20],'La mochila':[35,20,22,32],'Las manzanas':[66,53,28,25],'La cuchara':[9,69,23,15],'La planta':[70,5,17,24]},changes:[['La taza','De roja a verde'],['El cuaderno','De azul a naranja'],['La mochila','De amarilla a morada']],unchanged:['Las manzanas','La cuchara','La planta']},
 living:{sceneId:'living',path:'assets/photos/living-b.png',regions:{'El cojín de la izquierda':[20,35,19,21],'El libro':[27,65,18,12],'El balón':[90,61,10,16],'El cojín de la derecha':[62,35,21,21],'El vaso':[63,59,7,12],'La lámpara':[4,6,18,17]},changes:[['El cojín de la izquierda','De amarillo a morado'],['El libro','De verde a rojo'],['El balón','De naranja a azul']],unchanged:['El cojín de la derecha','El vaso','La lámpara']}
};
// Object counts and spatial relations checked against each complete source image.
Object.assign(scenes,{
 desk:{title:'Un escritorio de estudio',width:1448,height:1086,path:'assets/photos/desk-a.png',facts:[
  fact('¿De qué color era el cuaderno?','Verde',['Azul','Naranja','Rojo'],'El cuaderno era verde.'),
  fact('¿De qué color era el estuche?','Rojo',['Morado','Amarillo','Azul'],'El estuche era rojo.'),
  fact('¿Cuántos lápices había en el vaso?','Tres',['Dos','Cuatro','Cinco'],'Había tres lápices amarillos en el vaso blanco.'),
  fact('¿Dónde estaba el estuche respecto al cuaderno?','A su izquierda',['A su derecha','Encima','Debajo'],'El estuche estaba a la izquierda del cuaderno.'),
  fact('¿Qué había delante del cuaderno?','Un llavero con dos llaves',['Un teléfono','Unas gafas','Una regla'],'Delante del cuaderno había un llavero con dos llaves.'),
  fact('¿De qué color era la mochila de la silla?','Azul',['Roja','Amarilla','Verde'],'La mochila de la silla era azul.'),
  fact('¿Dónde estaba el vaso con lápices respecto al cuaderno?','A su derecha',['A su izquierda','Debajo','Encima'],'El vaso con lápices estaba a la derecha del cuaderno.'),
  fact('¿Cuántas llaves había en el llavero?','Dos',['Tres','Una','Cuatro'],'Había dos llaves metálicas en el llavero.')
 ]},
 picnic:{title:'Un pícnic junto al lago',width:1448,height:1086,path:'assets/photos/picnic-a.png',facts:[
  fact('¿De qué color era la botella?','Azul',['Verde','Roja','Amarilla'],'La botella era azul.'),
  fact('¿De qué color era la manta?','Roja',['Azul','Verde','Morada'],'La manta era roja.'),
  fact('¿Cuántas naranjas había en el plato?','Tres',['Dos','Cuatro','Cinco'],'Había tres naranjas en un plato blanco.'),
  fact('¿Dónde estaba el plato respecto a la cesta?','A su derecha',['A su izquierda','Dentro','Debajo'],'El plato estaba a la derecha de la cesta.'),
  fact('¿Qué había delante de la cesta?','Unas gafas negras',['Un llavero','Un cuaderno','Una gorra'],'Había unas gafas negras delante de la cesta.'),
  fact('¿De qué color era la fiambrera?','Amarilla',['Morada','Roja','Azul'],'La fiambrera era amarilla.'),
  fact('¿Dónde estaba la botella respecto a la cesta?','A su izquierda',['A su derecha','Dentro','Detrás'],'La botella estaba a la izquierda de la cesta.'),
  fact('¿De qué color era la tela de la cesta?','Blanca',['Azul','Roja','Verde'],'La tela que colgaba del borde de la cesta era blanca.')
 ]},
 market:{title:'Un puesto de mercado',width:1448,height:1086,path:'assets/photos/market-a.png',facts:[
  fact('¿De qué color era la bolsa?','Amarilla',['Morada','Azul','Verde'],'La bolsa del centro era amarilla.'),
  fact('¿Cuántos pimientos había?','Dos',['Tres','Cuatro','Uno'],'Había dos pimientos rojos en la cesta izquierda.'),
  fact('¿Cuántas manzanas había?','Tres',['Dos','Cuatro','Cinco'],'Había tres manzanas verdes en la cesta derecha.'),
  fact('¿De qué color era el monedero?','Azul',['Rojo','Verde','Amarillo'],'El monedero era azul.'),
  fact('¿Dónde estaba el monedero respecto a la bolsa?','Delante',['Detrás','Dentro','Encima'],'El monedero estaba delante de la bolsa.'),
  fact('¿De qué color eran los pimientos?','Rojos',['Amarillos','Verdes','Naranjas'],'Los dos pimientos eran rojos.'),
  fact('¿Dónde estaban las manzanas respecto a la bolsa?','A su derecha',['A su izquierda','Dentro','Delante'],'Las manzanas estaban a la derecha de la bolsa.'),
  fact('¿De qué colores eran las rayas del toldo?','Verde y blanco',['Rojo y blanco','Azul y amarillo','Verde y rojo'],'El toldo tenía rayas verdes y blancas.')
 ]},
 entry:{title:'La entrada de una casa',width:1448,height:1086,path:'assets/photos/entry-a.png',facts:[
  fact('¿De qué color era la mochila?','Azul',['Roja','Verde','Amarilla'],'La mochila era azul.'),
  fact('¿Cuántas zapatillas había en el suelo?','Dos',['Una','Tres','Cuatro'],'Había dos zapatillas rojas en el suelo.'),
  fact('¿De qué color era el paraguas?','Amarillo',['Morado','Verde','Azul'],'El paraguas era amarillo.'),
  fact('¿Dónde estaba la mochila?','Sobre el banco, a la izquierda',['Debajo del banco','Sobre el espejo','Junto al paraguas'],'La mochila estaba sobre la parte izquierda del banco.'),
  fact('¿Dónde estaban las llaves?','En un cuenco verde',['En la mochila','Sobre las zapatillas','En el paragüero'],'Las llaves estaban en un cuenco verde sobre la repisa.'),
  fact('¿Qué había encima del banco en la pared?','Un espejo rectangular',['Un cuadro redondo','Un reloj','Un mapa'],'Había un espejo rectangular encima del banco.'),
  fact('¿Dónde estaban las zapatillas respecto al banco?','En el suelo, a su derecha',['Encima, a su izquierda','Debajo del centro','En el suelo, a su izquierda'],'Las zapatillas estaban en el suelo, a la derecha del banco.'),
  fact('¿De qué color era el cuenco de las llaves?','Verde',['Naranja','Rojo','Azul'],'El cuenco de las llaves era verde.')
 ]}
});
const newPairs={
 desk:{regions:{'El estuche':[7,59,27,23],'El cuaderno':[37,65,27,17],'La mochila':[35,35,26,29],'Los lápices':[70,48,13,28],'Las llaves':[44,83,18,12],'El reloj':[51,1,18,21]},changes:[['El estuche','De rojo a morado'],['El cuaderno','De verde a naranja'],['La mochila','De azul a rojo']],unchanged:['Los lápices','Las llaves','El reloj']},
 picnic:{regions:{'La botella':[14,35,16,33],'La manta':[4,83,18,15],'La fiambrera':[69,34,20,20],'Las naranjas':[70,59,23,21],'La cesta':[34,30,32,42],'Las gafas':[39,75,23,13]},changes:[['La botella','De azul a verde'],['La manta','De roja a azul'],['La fiambrera','De amarilla a morada']],unchanged:['Las naranjas','La cesta','Las gafas']},
 market:{regions:{'La bolsa':[39,25,25,39],'El monedero':[40,66,20,12],'Los pimientos':[7,46,25,25],'Las manzanas':[71,46,25,25],'El toldo':[2,0,96,18]},changes:[['La bolsa','De amarilla a morada'],['El monedero','De azul a rojo'],['Los pimientos','De rojos a amarillos']],unchanged:['Las manzanas','El toldo']},
 entry:{regions:{'La mochila':[26,26,19,28],'El paraguas':[86,24,9,25],'El cuenco':[13,20,10,6],'Las zapatillas':[75,65,13,12],'El espejo':[32,0,37,21],'El banco':[24,53,49,9]},changes:[['La mochila','De azul a roja'],['El paraguas','De amarillo a morado'],['El cuenco','De verde a naranja']],unchanged:['Las zapatillas','El espejo','El banco']}
};
for(const [id,pair] of Object.entries(newPairs))pairs[id]={...pair,sceneId:id,path:`assets/photos/${id}-b.png`};
// Each harder question reconstructs two or three independent facts from the SAME image.
// Distractors differ in exactly one component; colour alone cannot solve the task.
const challenges={
 kitchen:[[1,3,5],[11,9,10],[2,6,7],[4,8,5]],
 living:[[1,2,4],[0,7,8],[3,5,11],[6,9,10]],
 desk:[[0,2,4],[1,5,6],[3,7,5],[6,4,1]],
 picnic:[[0,2,3],[1,4,5],[6,7,2],[5,3,4]],
 market:[[0,1,2],[3,4,6],[5,2,7],[1,6,3]],
 entry:[[0,1,2],[3,4,5],[6,7,2],[1,5,3]]
};
function questions(sceneId,level){
 const scene=scenes[sceneId];
 if(level===1)return scene.facts;
 return challenges[sceneId].map((indices,index)=>{
  const evidence=indices.slice(0,level===2?2:3),facts=evidence.map(i=>scene.facts[i]);
  const answer=facts.map(f=>f.a).join(' → ');
  const wrong=facts.map((_,i)=>facts.map((f,j)=>i===j?f.opts[1+(index%3)]:f.a).join(' → '));
  return {q:'Recuerda estos datos en el orden indicado: '+facts.map((f,i)=>`${i+1}) ${f.q}`).join(' '),a:answer,opts:[answer,...wrong],detail:facts.map(f=>f.detail).join(' '),evidence};
 });
}
const supports=(age,domain)=>['junior','primary','middle','teen'].includes(age)&&['memory','attention'].includes(domain);
function pool(age,domain,level=1){
 if(!supports(age,domain))return [];
 const meta={domain,level,requiresStimulus:true,...(age==='teen'?{teenReview:{version:3}}:age==='junior'?{juniorProfile:{route:age,level}}:{schoolProfile:{route:age,level}})};
 const out=[];
 if(domain==='memory')for(const [sceneId,scene] of Object.entries(scenes))questions(sceneId,level).forEach((f,index)=>{
  const id=`photo-v1:${age}:${domain}:${level}:${sceneId}:${index}`;
  out.push({...meta,id,contentKey:id,mechanic:'memory_photo',memoryMaterialKey:'photo:'+sceneId,type:'memoryReveal',responseType:'choice',topic:'Memoria · escena cotidiana',q:'Observa la imagen. Después desaparecerá y responderás una pregunta.',memoryQuestion:f.q,stimulus:[{type:'photo',photoId:sceneId}],memoryContent:[{detail:scene.title}],a:f.a,opts:f.opts.slice(0,level===1?3:4),why:f.detail,revealMs:[16000,12000,9000][level-1],photoTask:{kind:'recall',sceneId,index,...(f.evidence?{evidence:f.evidence}:{})}});
 });
 else for(const [pairId,pair] of Object.entries(pairs)){
  const id=`photo-v1:${age}:${domain}:${level}:${pairId}`,exact=level===3;
  const answers=level===1?[pair.changes[0][0]]:pair.changes.map(([object,change])=>exact?object+': '+change:object);
  const opts=level===1?[answers[0],...pair.unchanged.slice(0,2)]:[...answers,...(exact?pair.changes.map(([object,change])=>object+': '+change.replace(/^De (.+) a (.+)$/, 'De $2 a $1')):pair.unchanged)];
  out.push({...meta,id,contentKey:id,mechanic:'attention_photo_differences',type:'photoDifference',responseType:'multiple',topic:'Atención · encuentra las diferencias',q:level===1?`Marca el objeto que cambia ${pair.changes[0][1].toLowerCase()}.`:exact?'Compara A con B. Marca solo las descripciones que indican correctamente el color inicial y el final. Las descripciones con el orden invertido no son válidas.':'Marca todos los objetos que cambian de color entre A y B.',stimulus:[{type:'photoPair',pairId}],answers,opts,why:pair.changes.map(([object,change])=>object+': '+change.toLowerCase()+'.').join(' '),photoTask:{kind:'differences',pairId}});
 }
 return structuredClone(out);
}
function validate(item){
 const task=item.photoTask,age=item.teenReview?'teen':item.juniorProfile?.route||item.schoolProfile?.route;
 if(!task||!supports(age,item.domain)||![1,2,3].includes(item.level))throw new Error('Escena o nivel no válido.');
 const expected=pool(age,item.domain,item.level).find(x=>task.kind==='recall'?x.photoTask.sceneId===task.sceneId&&x.photoTask.index===task.index:x.photoTask.pairId===task.pairId);
 if(!expected)throw new Error('La pregunta no pertenece a la escena revisada.');
 const locale=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
 const adapted=locale.localizeItem(expected,item.localization?.locale||'es_intl',item.domain);
 for(const field of ['type','responseType','q','memoryQuestion','a','photoTask','stimulus','memoryContent','why'])if(JSON.stringify(item[field])!==JSON.stringify(adapted[field]))throw new Error('La actividad no coincide con la fotografía y la pregunta revisadas: '+field);
 for(const field of ['opts','answers'])if(JSON.stringify([...(item[field]||[])].sort())!==JSON.stringify([...(adapted[field]||[])].sort()))throw new Error('Las respuestas no corresponden a los datos visibles.');
 return true;
}
function generate(age,domain,level){const bank=pool(age,domain,level);return bank[Math.floor(Math.random()*bank.length)]||null;}
const api={scenes,pairs,supports,pool,validate,generate};root.PhotoLibrary=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

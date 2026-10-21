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
const supports=(age,domain)=>['junior','primary','middle','teen'].includes(age)&&['memory','attention'].includes(domain);
function pool(age,domain,level=1){
 if(!supports(age,domain))return [];
 const meta={domain,level,requiresStimulus:true,...(age==='teen'?{teenReview:{version:3}}:age==='junior'?{juniorProfile:{route:age,level}}:{schoolProfile:{route:age,level}})};
 const out=[];
 if(domain==='memory')for(const [sceneId,scene] of Object.entries(scenes))scene.facts.forEach((f,index)=>{
  const id=`photo-v1:${age}:${domain}:${level}:${sceneId}:${index}`;
  out.push({...meta,id,contentKey:id,mechanic:'memory_photo',memoryMaterialKey:'photo:'+sceneId,type:'memoryReveal',responseType:'choice',topic:'Memoria · escena cotidiana',q:'Observa la imagen. Después desaparecerá y responderás una pregunta.',memoryQuestion:f.q,stimulus:[{type:'photo',photoId:sceneId}],memoryContent:[{detail:scene.title}],a:f.a,opts:f.opts.slice(0,level===1?3:4),why:f.detail,revealMs:[16000,12000,9000][level-1],photoTask:{kind:'recall',sceneId,index}});
 });
 else for(const [pairId,pair] of Object.entries(pairs)){
  const id=`photo-v1:${age}:${domain}:${level}:${pairId}`,exact=level===3;
  const answers=level===1?[pair.changes[0][0]]:pair.changes.map(([object,change])=>exact?object+': '+change:object);
  const opts=level===1?[answers[0],...pair.unchanged.slice(0,2)]:[...answers,...(exact?pair.changes.map(([object])=>object+': no cambió de color'):pair.unchanged)];
  out.push({...meta,id,contentKey:id,mechanic:'attention_photo_differences',type:'photoDifference',responseType:'multiple',topic:'Atención · encuentra las diferencias',q:level===1?`Marca el objeto cuyo color cambia ${pairId==='kitchen'?'de rojo a verde':'de amarillo a morado'}.`:exact?'Marca todos los cambios de color descritos correctamente.':'Marca todos los objetos que cambian de color entre A y B.',stimulus:[{type:'photoPair',pairId}],answers,opts,why:pair.changes.map(([object,change])=>object+': '+change.toLowerCase()+'.').join(' '),photoTask:{kind:'differences',pairId}});
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
 for(const field of ['type','responseType','q','memoryQuestion','a','photoTask','stimulus','memoryContent'])if(JSON.stringify(item[field])!==JSON.stringify(adapted[field]))throw new Error('La actividad no coincide con la fotografía y la pregunta revisadas: '+field);
 for(const field of ['opts','answers'])if(JSON.stringify([...(item[field]||[])].sort())!==JSON.stringify([...(adapted[field]||[])].sort()))throw new Error('Las respuestas no corresponden a los datos visibles.');
 return true;
}
function generate(age,domain,level){const bank=pool(age,domain,level);return bank[Math.floor(Math.random()*bank.length)]||null;}
const api={scenes,pairs,supports,pool,validate,generate};root.PhotoLibrary=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

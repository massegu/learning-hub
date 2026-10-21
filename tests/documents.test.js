const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const docs=require('../js/document-library'),model=require('../js/activity-model'),locale=require('../js/locale-content'),curriculum=require('../js/curriculum'),load=require('./edge-harness');
test('eighteen original document assets have matching PNG dimensions, consistent arithmetic, and known accessible source contracts',()=>{
 assert.equal(fs.readFileSync('js/document-library.js','utf8'),fs.readFileSync('supabase/functions/request-learning-content/document-library.js','utf8'));
 assert.equal(Object.keys(docs.documents).length,18);
 for(const doc of Object.values(docs.documents)){
  const bytes=fs.readFileSync(doc.path);assert.equal(bytes.readUInt32BE(16),doc.width);assert.equal(bytes.readUInt32BE(20),doc.height);
  assert.ok(doc.country);assert.ok(doc.transcript.length);assert.doesNotMatch(JSON.stringify(doc.transcript),/Documento ficticio para practicar/);
 }
 const f=docs.get('invoice-co-v1').facts,r=docs.get('receipt-co-v1').facts;
 assert.equal(f.total,f.subtotal+f.delivery);assert.equal(r.change,r.paid-r.total);
 for(const age of ['junior','primary','middle','teen'])for(const domain of ['attention','executive','literacy'])for(const level of [1,2,3])for(const it of docs.pool(age,domain,level))for(const country of Object.keys(locale.labels)){
  const local=locale.localizeItem(it,country,domain),printed=model.printable(local,{age_band:age==='junior'?'primary':age,progress:{ageRoute:age}});
  assert.equal(printed.stimulus[1].documentId,it.stimulus[1].documentId);if(local.opts)assert.ok((local.answers||[local.a]).every(a=>local.opts.includes(a)));else assert.deepEqual([...local.tokens].sort(),[...local.answer].sort());
  const markup=model.interactiveStimulus(local.stimulus,{structured:true});assert.match(markup,/<img /);assert.match(markup,/Ver versión en texto/);
 }
 assert.throws(()=>model.printable({requiresStimulus:true,q:'¿Qué aparece?',stimulus:[{type:'document',documentId:'unknown'}],opts:['A','B'],a:'A'},{age_band:'teen'}),/desconocido/);
 assert.equal(docs.supports('early','attention'),false);
});
test('Colombian nouns adapt costs and workshop seats while preserving place names and Spanish usage',()=>{
 assert.equal(locale.text('El coste y los costes.','es_co'),'El costo y los costos.');
 assert.equal(locale.text('El taller ofrece más plazas.','es_co'),'El taller ofrece más cupos.');
 assert.equal(locale.text('Centro Cultural La Plaza','es_co'),'Centro Cultural La Plaza');
 assert.equal(locale.text('El coste y las plazas disponibles.','es_es'),'El coste y las plazas disponibles.');
});
test('memory material identities suppress repeats beyond a renamed question and offer expanded age-appropriate materials',()=>{
 const {api}=load();
 for(const age of ['early','junior','primary','middle','teen']){
  const pool=curriculum.pool(age,'memory',3);
  assert.equal(pool.length,age==='early'?552:780);
  for(const family of ['memory_sequence','memory_spatial','memory_association'])assert.ok(new Set(pool.filter(it=>it.mechanic===family).map(it=>it.memoryMaterialKey)).size>=60);
  const history=[],keys=[];
  for(let n=0;n<24;n++){
   const it=api.generatedItems('memory',1,history,()=>api.variantExercise(age,'memory',3))[0];assert.ok(it);
   keys.push(it.memoryMaterialKey);history.push(api.contentSignature('memory',it));
   assert.equal(api.contentSignature('memory',{...it,id:'new-id',q:'Otra pregunta'}),api.contentSignature('memory',it));
  }
  assert.equal(new Set(keys).size,keys.length);
  if(age==='teen')assert.ok(pool.some(it=>JSON.stringify(it.stimulus).includes('tarjeta de transporte')));
 }
});

test('expanded document sources are not recycled at ten when unused sources still exist',()=>{
 const {api,context}=load(),history=[],seen=[];
 for(let session=0;session<3;session++)for(const it of api.generatedItems('literacy',7,history,()=>context.DocumentLibrary.generate('teen','literacy',2))){seen.push(it.passageKey);history.push(api.contentSignature('literacy',it),'literacy:mechanic:'+it.mechanic);}
 assert.equal(new Set(seen.slice(0,18)).size,18);
 for(let i=0;i<=seen.length-10;i++)assert.equal(new Set(seen.slice(i,i+10)).size,10);
});

test('Reading interprets documents while Attention searches data; reading sources alternate before repeats',()=>{
 const {api}=load();
 for(const level of [1,2,3]){
  const reading=docs.pool('teen','literacy',level),attention=docs.pool('teen','attention',level);
  for(const it of reading){const other=attention.find(x=>x.passageKey===it.passageKey);assert.notEqual(it.q,other.q);assert.notEqual(it.taskFocus,other.taskFocus);}
 }
 for(const focus of ['grammar','writing']){
  const history=[],seen=[],formats=[];
  for(let n=0;n<8;n++){
   const it=api.generatedItems('literacy',1,history,()=>api.variantExercise('teen','literacy',2,focus))[0];
   seen.push(it.passageKey);formats.push(it.stimulus.some(b=>b.type==='document'));
   history.push(api.contentSignature('literacy',it));
  }
  assert.equal(new Set(seen).size,8);
  for(let n=1;n<formats.length;n++)assert.notEqual(formats[n],formats[n-1],focus+': '+formats);
 }
});

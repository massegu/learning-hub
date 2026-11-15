const test=require('node:test'),assert=require('node:assert/strict');
const curriculum=require('../js/curriculum'),docs=require('../js/document-library'),model=require('../js/activity-model');

test('package answers cover every displayed letter after every label rotation and level change',()=>{
 for(const age of ['junior','primary','middle','teen'])for(const level of [1,2,3]){
  const tasks=curriculum.pool(age,'executive',level).filter(it=>it.mechanic==='executive_criteria');
  assert.equal(tasks.length,12);
  for(const it of tasks){
   const rows=it.stimulus.find(b=>b.type==='table').rows.slice(1);
   assert.deepEqual([...it.opts].sort(),rows.map(r=>r[0]).sort());assert.equal(new Set(it.opts).size,4);
   const valid=rows.filter(r=>r[1]==='Listo'&&r[2]==='Sí'&&(level===1||Number(r[3])<=(level===2?6:4))&&(level!==3||r[4]==='Confirmado'));
   assert.equal(valid.length,1);assert.equal(it.a,valid[0][0]);
  }
 }
});
test('younger grammar instructions explain the action and resource instructions specify actual materials',()=>{
 for(const age of ['junior','primary'])for(const level of [1,2,3]){
  for(const it of curriculum.pool(age,'language',level).filter(it=>['grammar_agreement','grammar_adjective','grammar_repair'].includes(it.mechanic)))assert.doesNotMatch(it.q,/concordancia|género y el número|concuerda con el sujeto/);
  const tasks=curriculum.pool(age,'executive',level).filter(it=>it.mechanic==='executive_resources');assert.ok(tasks.length);
  for(const it of tasks){assert.match(it.stimulus[0].text,/programa de premios/);assert.doesNotMatch(it.stimulus[0].text,/unidades de material/);assert.doesNotThrow(()=>model.forDelivery(it,{age_band:age==='junior'?'primary':age,progress:{ageRoute:age}},'executive'));}
 }
});
test('screen and boarding sources offer graded attention, reading and evidence-based planning',()=>{
 for(const id of ['boarding-es-v2','email-es-v2','booking-es-v2','orders-es-v2']){
  const doc=docs.get(id);assert.ok(doc.layout);assert.ok(doc.width>doc.height);
  for(const domain of ['attention','executive','literacy'])for(const level of [1,2,3]){
   const it=docs.pool('teen',domain,level).find(it=>it.stimulus.some(b=>b.documentId===id));assert.ok(it);
   assert.doesNotThrow(()=>model.forDelivery(it,{age_band:'teen'},domain));
   if(domain==='executive')assert.equal(docs.validateExecutiveTask(it),true);
  }
 }
});

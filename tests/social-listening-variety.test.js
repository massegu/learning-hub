const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const c=require('../js/curriculum'),m=require('../js/activity-model'),locale=require('../js/locale-content'),photos=require('../js/photo-library');
test('Social Lab is authored for all five ages and three levels with bound factual answers',()=>{
 const all=new Set();
 for(const age of ['early','junior','primary','middle','teen'])for(const level of [1,2,3]){
  const bank=c.pool(age,'social',level);assert.equal(bank.length,age==='early'?24:6);
  for(const it of bank){
   const key=JSON.stringify([it.stimulus,it.q,it.a]);assert.ok(!all.has(key));all.add(key);
   const profile={age_band:['early','junior'].includes(age)?'primary':age,progress:{ageRoute:age}};
   for(const country of Object.keys(locale.labels))assert.doesNotThrow(()=>m.forDelivery(locale.localizeItem(it,country,'social'),profile,'social'));
   for(const mutate of [x=>x.a=x.opts[1],x=>x.level=4,x=>delete x.socialEvidence,x=>x.socialEvidence.age='unknown',x=>x.stimulus[0].text='Otra historia.']){
    const bad=structuredClone(it);mutate(bad);assert.throws(()=>m.forDelivery(bad,profile,'social'));
   }
  }
 }
 assert.equal(all.size,144);
});
test('real endpoint delivers age-specific social tasks and gates listening on a compatible client',()=>{
 for(const age of ['early','junior','primary','middle','teen']){
  const request={kind:'exercise',profile_id:age,domain:'social',level:3,count:1,locale:'es_es',client_revision:5};
  const rows=execFileSync(process.execPath,['tests/edge-worker.js',age],{input:JSON.stringify(request)+'\n',encoding:'utf8',timeout:60000}).trim().split('\n').map(JSON.parse);
  assert.equal(rows[0].status,200,JSON.stringify(rows));assert.equal(rows[0].data.items[0].domain,'social');assert.ok(rows[0].data.subjects.includes('social'));
 }
 const base={kind:'exercise',profile_id:'teen',domain:'executive',level:3,count:1,locale:'es_es',interaction_only:true,interaction_kind:'auditory'};
 const rows=execFileSync(process.execPath,['tests/edge-worker.js','teen'],{input:[{...base,client_revision:4},{...base,client_revision:5}].map(JSON.stringify).join('\n')+'\n',encoding:'utf8',timeout:60000}).trim().split('\n').map(JSON.parse);
 assert.deepEqual(rows.map(x=>x.status),[409,200]);assert.equal(rows[1].data.items[0].interactionTask.kind,'auditory');
});
test('new photographic differences test quantity, absence, orientation, identity and state',()=>{
 for(const level of [1,2,3]){
  const bank=photos.pool('primary','attention',level).filter(it=>['cafe','sports'].includes(it.photoTask.pairId));assert.equal(bank.length,level===1?6:2);
  for(const it of bank){assert.equal(new Set(it.opts).size,it.opts.length);assert.ok(it.answers.every(x=>it.opts.includes(x)));assert.doesNotThrow(()=>photos.validate(it));}
 }
 const text=JSON.stringify(['cafe','sports'].map(id=>photos.pairs[id].changes));
 for(const concept of ['tres galletas','posición diagonal','estar sobre','baloncesto','estar abierta'])assert.ok(text.includes(concept));
 for(const file of ['curriculum.js','photo-library.js'])assert.equal(fs.readFileSync('js/'+file,'utf8'),fs.readFileSync('supabase/functions/request-learning-content/'+file,'utf8'));
});

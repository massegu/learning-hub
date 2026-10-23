const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const photo=require('../js/photo-library'),model=require('../js/activity-model'),locale=require('../js/locale-content'),curriculum=require('../js/curriculum');
test('photo questions and difference answers are bound to reviewed scene facts in all locales',()=>{
 for(const age of ['junior','primary','middle','teen'])for(const level of [1,2,3])for(const domain of ['memory','attention'])for(const it of photo.pool(age,domain,level)){
  for(const country of Object.keys(locale.labels))assert.doesNotThrow(()=>model.forDelivery(locale.localizeItem(it,country,domain),{age_band:age,progress:{ageRoute:age}},domain));
  const bad=structuredClone(it);if(bad.a)bad.a=bad.opts.find(x=>x!==bad.a);else bad.answers=[bad.opts.find(x=>!bad.answers.includes(x))];assert.throws(()=>model.forDelivery(bad,{age_band:age},domain));
  const noEvidence=structuredClone(it);delete noEvidence.photoTask;assert.throws(()=>model.forDelivery(noEvidence,{age_band:age},domain));
  const broken=structuredClone(it);broken.stimulus=[];assert.throws(()=>model.printable(broken,{age_band:age}));
  const markup=model.interactiveStimulus(it.stimulus);assert.match(markup,/<img /);assert.doesNotMatch(markup,/data:|javascript:|http:/);
 }
 assert.equal(photo.pool('early','memory',1).length,0);
 assert.ok(!curriculum.pool('teen','memory',1).some(x=>x.mechanic==='memory_scene'));
 assert.ok(curriculum.pool('teen','memory',1).some(x=>x.mechanic==='memory_photo'));
});
test('source images are local PNGs with reviewed dimensions and captions reveal no memory answer',()=>{
 for(const scene of Object.values(photo.scenes)){
  const bytes=fs.readFileSync(scene.path);assert.equal(bytes.readUInt32BE(16),scene.width);assert.equal(bytes.readUInt32BE(20),scene.height);
 }
 for(const pair of Object.values(photo.pairs)){const bytes=fs.readFileSync(pair.path);assert.equal(bytes.readUInt32BE(16),1448);assert.equal(bytes.readUInt32BE(20),1086);assert.equal(pair.changes.length,3);}
 const it=photo.pool('teen','memory',1)[0],markup=model.interactiveStimulus(it.stimulus);assert.ok(!markup.includes(it.a));assert.ok(!markup.includes(it.why));
 assert.equal(fs.readFileSync('js/photo-library.js','utf8'),fs.readFileSync('supabase/functions/request-learning-content/photo-library.js','utf8'));
});
test('real handler supports photo-only delivery and rejects old clients without leaking unsupported photos',()=>{
 const requests=[
  {kind:'exercise',profile_id:'teen',domain:'memory',level:1,count:1,locale:'es_es',client_revision:3,photos_only:true},
  {kind:'exercise',profile_id:'teen',domain:'attention',level:3,count:1,locale:'es_es',client_revision:3,photos_only:true},
  {kind:'exercise',profile_id:'teen',domain:'memory',level:1,count:1,locale:'es_es',client_revision:2,photos_only:true},
  {kind:'exercise',profile_id:'teen',domain:'memory',level:1,count:1,locale:'es_es',client_revision:2}
 ];
 const rows=execFileSync(process.execPath,['tests/edge-worker.js','teen'],{input:requests.map(x=>JSON.stringify(x)).join('\n')+'\n',encoding:'utf8'}).trim().split('\n').map(JSON.parse);
 assert.equal(rows[0].status,200);assert.equal(rows[0].data.items[0].photoTask.kind,'recall');assert.equal(rows[1].status,200);assert.equal(rows[1].data.items[0].type,'photoDifference');assert.equal(rows[2].status,409);assert.equal(rows[3].status,200);assert.ok(!rows[3].data.items[0].photoTask);
});
test('legacy code filtering material becomes separate cards without altering the codes',()=>{
 const blocks=model.comparisonStimulus('A7   B3   B8   C6');assert.deepEqual(blocks,[{type:'list',items:['A7','B3','B8','C6'],presentation:'cards'}]);
 const html=model.interactiveStimulus(blocks,{structured:true});for(const code of ['A7','B3','B8','C6'])assert.ok(html.includes(code));assert.equal(model.comparisonStimulus('A7 B3 B8'),null);
});

test('fourteen everyday settings have genuinely graded recall: one, two and three independent observations',()=>{
 assert.equal(Object.keys(photo.scenes).length,14);assert.equal(Object.keys(photo.pairs).length,14);
 for(const age of ['junior','primary','middle','teen'])for(const level of [1,2,3]){
  const bank=photo.pool(age,'memory',level);
  for(const id of Object.keys(photo.scenes)){
   const tasks=bank.filter(it=>it.photoTask.sceneId===id);assert.ok(tasks.length>=4);
   for(const it of tasks){
    if(level===1){assert.equal(it.photoTask.evidence,undefined);continue;}
    const evidence=it.photoTask.evidence;assert.equal(evidence.length,level);assert.equal(new Set(evidence).size,level);
    const source=evidence.map(index=>photo.scenes[id].facts[index]);
    assert.equal(it.a,source.map(f=>f.a).join(' → '));assert.equal(new Set(it.opts).size,it.opts.length);
    assert.equal(it.opts.length,level+1);
    for(const alternative of it.opts.filter(x=>x!==it.a))assert.equal(alternative.split(' → ').filter((v,i)=>v!==source[i].a).length,1);
    const altered=structuredClone(it);altered.photoTask.evidence.reverse();assert.throws(()=>photo.validate(altered));
   }
  }
  const differences=photo.pool(age,'attention',level);assert.equal(differences.length,level===1?18:14);
  for(const it of differences){assert.equal(it.answers.length,level===1?1:3);assert.equal(new Set(it.opts).size,it.opts.length);}
 }
});

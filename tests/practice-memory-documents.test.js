const test=require('node:test'),assert=require('node:assert/strict'),c=require('../js/curriculum'),d=require('../js/document-library'),m=require('../js/activity-model'),l=require('../js/locale-content'),art=require('../js/stimulus-art'),load=require('./edge-harness');
const profile=age=>({age_band:['early','junior'].includes(age)?'primary':age,progress:{ageRoute:age}});
test('visual-document modes have distinct materials and executive interactions in the real selector',()=>{
 const {api}=load();
 for(const age of ['junior','primary','middle','teen'])for(const domain of ['attention','executive'])for(const level of [1,2,3]){
  for(let n=0;n<5;n++){
   const varied=api.variantExercise(age,domain,level,null,false);assert.ok(!(varied.stimulus||[]).some(b=>b.type==='document'));
   const visual=api.variantExercise(age,domain,level,null,true);assert.ok(visual.stimulus.some(b=>b.type==='document'));assert.ok(api.validateItem(visual));
   if(domain==='executive'){assert.equal(visual.type,level===1?'order':'documentReview');assert.equal(visual.responseType,level===1?'order':'multiple');}
  }
 }
});
test('executive document plans require their actual source and exact plan, at every locale and level',()=>{
 const {api}=load();
 for(const age of ['junior','primary','middle','teen'])for(const level of [1,2,3])for(const item of d.pool(age,'executive',level)){
  for(const country of Object.keys(l.labels)){const it=l.localizeItem(item,country,'executive');assert.doesNotThrow(()=>m.forDelivery(it,profile(age),'executive'));assert.ok(m.printable(it,profile(age)).stimulus.some(b=>b.type==='document'));}
  const broken=structuredClone(item);broken.stimulus=broken.stimulus.filter(b=>b.type!=='document');assert.equal(api.validateItem(broken),false);assert.throws(()=>m.printable(broken,profile(age)));
  if(item.type==='documentReview'){const bad=structuredClone(item);bad.answers=[];assert.equal(api.validateItem(bad),false);const missing=structuredClone(item);delete missing.documentPlan;assert.equal(api.validateItem(missing),false);}
 }
});
test('fifteen memory categories have real SVG/PNG and appear in the youngest as well as oldest groups',()=>{
 assert.equal(c.memoryCategories.length,15);assert.equal(new Set(c.memoryCategories.flatMap(x=>x.items)).size,60);
 for(const age of ['early','junior','primary','middle','teen']){
  const bank=c.pool(age,'memory',1),shown=new Set(bank.flatMap(it=>it.memoryContent.map(x=>x.detail)));
  for(const group of c.memoryCategories)for(const label of group.items){assert.ok(shown.has(label),age+'/'+label);const key=art.forLabel(label,{banana:true});assert.ok(key,label);assert.match(art.svg(key),/<svg/);assert.deepEqual([...art.png(key).slice(0,8)],[137,80,78,71,13,10,26,10]);}
 }
});
test('selective recall requires both category membership and actual prior exposure; corrupted targets fail closed',()=>{
 const {api}=load();
 for(const age of ['junior','primary','middle','teen'])for(const level of [1,2,3]){
  const bank=c.pool(age,'memory',level).filter(it=>it.selectiveRecall);assert.equal(bank.length,120);
  for(const it of bank){assert.equal(it.answers.length,level);assert.ok(it.opts.some(x=>!it.stimulus[0].items.includes(x)));assert.ok(api.validateItem(it));
   for(const country of Object.keys(l.labels))m.printable(l.localizeItem(it,country,'memory'),profile(age));
  }
  const bad=structuredClone(bank[0]);bad.selectiveRecall.indices=[bad.stimulus[0].items.findIndex(x=>!bad.answers.includes(x))];bad.answers=bad.selectiveRecall.indices.map(i=>bad.stimulus[0].items[i]);assert.equal(api.validateItem(bad),false);assert.throws(()=>m.forDelivery(bad,profile(age),'memory'));
 }
 assert.ok(c.pool('early','memory',3).every(it=>!it.selectiveRecall));
});

test('cached clients receive established interactions or a refresh request, never an unsupported scoring task',()=>{
 const {execFileSync}=require('node:child_process');
 const base={kind:'exercise',profile_id:'teen',domain:'memory',count:6,level:3,locale:'es_intl'};
 const requests=[base,{...base,client_revision:2},{...base,domain:'executive',count:1,documents_only:true},{...base,domain:'executive',count:1,documents_only:true,client_revision:2}];
 const result=execFileSync(process.execPath,['tests/edge-worker.js','teen'],{input:requests.map(x=>JSON.stringify(x)).join('\n')+'\n',encoding:'utf8',timeout:60000,stdio:['pipe','pipe','pipe']}).trim().split('\n').map(JSON.parse);
 assert.equal(result[0].status,200);assert.ok(result[0].data.items.every(it=>!it.selectiveRecall&&it.type!=='documentReview'));
 assert.equal(result[1].status,200);assert.ok(result[1].data.items.some(it=>it.selectiveRecall));
 assert.equal(result[2].status,409);assert.match(result[2].data.error,/Actualiza la página/);
 assert.equal(result[3].status,200);assert.equal(result[3].data.items[0].type,'documentReview');
});

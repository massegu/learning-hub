const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const families=require('../js/cognitive-families'),locale=require('../js/locale-content'),model=require('../js/activity-model'),quality=require('../js/content-quality');
const ages=['early','junior','primary','middle','teen'];
const profile=age=>({age_band:['early','junior'].includes(age)?'primary':age,progress:{ageRoute:age}});
const languageDomain=age=>age==='middle'?'middleLanguage':age==='teen'?'teenLanguage':'language';
test('six cognitive families keep canonical age/level metadata and localized delivery/print integrity',()=>{
 assert.equal(fs.readFileSync('js/cognitive-families.js','utf8'),fs.readFileSync('supabase/functions/request-learning-content/cognitive-families.js','utf8'));
 let variants=0;const scenarios=new Map();
 for(const age of ages)for(const level of [1,2,3])for(const it of families.pool(age,'executive',level)){
  variants++;for(const field of ['primaryConstruct','secondaryLoads','functionalPurpose','semanticFamily','scenarioFamily','readingDemand','visualDemand','motorDemand','printable','ageRoute','difficultyProfile'])assert.ok(it[field],field);
  if(!scenarios.has(it.cognitiveTask.kind))scenarios.set(it.cognitiveTask.kind,new Set());scenarios.get(it.cognitiveTask.kind).add(it.scenarioFamily);
  for(const country of Object.keys(locale.labels)){
   const local=quality.annotate(locale.localizeItem(it,country,'executive'),age,'executive');families.validate(local,age);model.forDelivery(local,profile(age),'executive');
   if(it.printable==='interactive-only')assert.throws(()=>model.printable(local,profile(age)),/temporal/);else assert.ok(model.preparePrintable(local,profile(age),country,'executive').projection.stimulus.length);
  }
  for(const field of ['q','sample','cognitiveTask','ageRoute'])assert.throws(()=>families.validate({...it,[field]:'tampered'},age));
  assert.throws(()=>families.validate(it,age==='teen'?'early':'teen'));
 }
 assert.equal(variants,330);assert.equal(scenarios.size,5);assert.ok([...scenarios.values()].every(s=>s.size>=4));
 const teenRules=families.pool('teen','executive',1,'rules').map(it=>JSON.stringify(it.cognitiveTask));for(const label of ['cámara','teléfono','auriculares','calculadora','brújula','regla'])assert.ok(teenRules.some(task=>task.includes(label)),label);
 for(const label of ['Cámara','Teléfono','Auriculares','Calculadora','Brújula','Regla'])assert.match(model.visualLabel(label,{iconProfile:profile('teen')}),/class="picture-icon"/);
 for(const age of ages)for(const level of [1,2,3])assert.equal(families.pool(age,'executive',level).some(it=>it.cognitiveTask.kind==='words'),false);
 for(const age of ages)for(const level of [1,2,3])assert.ok(families.pool(age,'language',level,'words').length>0);
});
test('solutions derive independently from clues, facts, constraints, dependencies and rule history',()=>{
 for(const age of ages)for(const level of [1,2,3])for(const it of [...families.pool(age,'executive',level),...families.pool(age,'language',level,'words')]){
  const t=it.cognitiveTask;let answer;
  if(t.kind==='information')assert.match(it.q,new RegExp(`Situación: .+marca exactamente ${t.answer.length} datos necesarios`,'i'));
  if(t.kind==='rules'){let inverted=false;answer=t.trials.map(trial=>{if(trial.switchBefore)inverted=!inverted;assert.equal(trial.inverted,inverted);return trial.target!==inverted?'act':'wait';});assert.equal(t.trials.filter(x=>x.switchBefore).length,level-1);}
  if(t.kind==='words'){
   const valid=t.options.filter(word=>families.wordFits(word,t));assert.equal(valid.length,1);answer=[valid[0]];
   assert.equal(families.productionStatus(it,'palabra inventada xyz'),'unreviewed');assert.equal(families.productionStatus(it,valid[0].toUpperCase()),'correct');
   assert.ok(Object.values(families.lexicon).flat().some(w=>families.productionStatus(it,w)==='incorrect'));
  }
  if(t.kind==='deduction'){
   let remaining=t.candidates;for(const clue of t.clues){const next=remaining.filter(c=>clue.op==='if'?c.attrs[clue.dimension]!==clue.value||c.attrs[clue.thenDimension]===clue.thenValue:clue.op==='is'?c.attrs[clue.dimension]===clue.value:c.attrs[clue.dimension]!==clue.value);assert.ok(next.length<remaining.length);remaining=next;}
   assert.equal(remaining.length,1);answer=[remaining[0].id];
   if(age==='early')assert.equal(t.candidates.length,4);
  }
  if(t.kind==='change'){
   const updated=t.initial.map((x,i)=>i===t.replaceIndex?t.replacement:x);answer=updated;assert.equal(t.options.filter(x=>x===t.replacement).length,1);
   assert.ok(t.dependencies.every(([a,b])=>updated.indexOf(a)<updated.indexOf(b)));assert.equal(new Set(updated).size,updated.length);
   assert.ok(!updated.includes(t.initial[t.replaceIndex]));
  }
  if(t.kind==='information'){answer=it.sample.split('; ').map(x=>'f'+t.facts.indexOf(x));assert.ok(answer.length>=2);assert.ok(t.facts.length>answer.length);}
  if(t.kind==='contradiction'){answer=it.sample.split(' ↔ ').map(x=>'f'+t.facts.indexOf(x));assert.equal(new Set(answer).size,2);}
  assert.ok(families.grade(it,answer),it.id);assert.equal(families.grade(it,['incorrect']),false);assert.equal(families.grade(it,[]),false);
 }
});
test('difficulty changes actual loads while elementary recognition, distinct pictures and language stay accessible',()=>{
 for(const age of ages)for(const family of Object.keys(families.definitions)){
  const domain=family==='words'?languageDomain(age):'executive';const rows=[1,2,3].map(l=>families.pool(age,domain,l,family)[0]);
  assert.notDeepEqual(rows[0].difficultyProfile,rows[1].difficultyProfile);assert.notDeepEqual(rows[1].difficultyProfile,rows[2].difficultyProfile);
  if(family==='change')assert.ok(rows[2].cognitiveTask.steps.length>rows[0].cognitiveTask.steps.length);
  if(family==='contradiction'||family==='information')assert.ok(rows[2].cognitiveTask.facts.length>rows[0].cognitiveTask.facts.length);
 }
 const executed=require('../js/executed-tasks'),c=require('../js/curriculum');
 for(const age of ages){const it=executed.pool(age,'memory',1).find(x=>x.execution.kind==='spatial');assert.ok(it.execution.occupied.length>=2);assert.ok(it.execution.cells.some(x=>x!==it.execution.target));assert.ok(it.execution.cells.filter(x=>x===it.execution.target).length===it.execution.answer.length);}
 for(const age of ['junior','primary','middle','teen']){const it=c.pool(age,'memory',1).find(x=>x.recallEvidence?.kind==='spatial');assert.equal(it.gridSize,3);assert.ok(it.memoryContent.length>=3);}
 const complementary=require('../js/complementary-art');for(const key of complementary.keys){assert.match(complementary.svg(key),/data-icon-library="(?:lucide|iconoir|tabler)"/);assert.deepEqual([...complementary.png(key).slice(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(model.artFor(key,profile('teen')),complementary);assert.notEqual(model.artFor(key,profile('junior')),complementary);}
});
function requests(age,rows){return execFileSync(process.execPath,['tests/edge-worker.js',age],{input:rows.map(JSON.stringify).join('\n')+'\n',encoding:'utf8',timeout:60000}).trim().split('\n').map(JSON.parse);}
test('authenticated delivery persists usage/history, gates cached clients and rotates semantic/scenario families',()=>{
 const base={kind:'exercise',profile_id:'teen',domain:'executive',count:1,level:2,client_revision:11,cognitive_only:true};
 const denied=[{client_revision:10},{cognitive_family:'words'},{cognitive_only:'true'},{executed_only:true},{photos_only:true},{documents_only:true},{interaction_only:true},{kind:'worksheet'},{cognitive_family:'invented'},{cognitive_family:{bad:true}}];
 for(const row of requests('teen',denied.map(x=>({...base,...x}))))assert.ok([400,409].includes(row.status));
 const rows=requests('teen',Array.from({length:18},()=>base));const items=rows.map(r=>{assert.equal(r.status,200);return r.data.items[0];});
 assert.equal(new Set(items.map(x=>x.id)).size,18);for(let i=1;i<items.length;i++){assert.notEqual(items[i].semanticFamily,items[i-1].semanticFamily);assert.notEqual(items[i].scenarioFamily,items[i-1].scenarioFamily);assert.equal(rows[i].data.usage.used,rows[i-1].data.usage.used+1);}
 for(const age of ages)for(const family of Object.keys(families.definitions)){
  const domain=family==='words'?languageDomain(age):'executive';const [row]=requests(age,[{...base,domain,profile_id:age,cognitive_family:family,locale:'es_ar'}]);assert.equal(row.status,200);assert.equal(row.data.items[0].ageRoute,age);families.validate(row.data.items[0]);
 }
});
test('individual paper export honors canonical age, same-source integrity and the existing worksheet quota',()=>{
 const it=families.pool('teen',languageDomain('teen'),2,'words')[0];
 const base={kind:'worksheet',profile_id:'teen',domain:languageDomain('teen'),domains:[languageDomain('teen')],questions:1,level:2,client_revision:11,cognitive_only:true,cognitive_family:'words',cognitive_content_key:it.contentKey};
 const bad=[{cognitive_content_key:'invented'},{cognitive_content_key:it.contentKey.replace(':teen:',':early:')},{domains:['attention']},{cognitive_family:'rules',cognitive_content_key:families.pool('teen','executive',2,'rules')[0].contentKey},{kind:'exercise'}];
 const rows=requests('teen',[...bad.map(x=>({...base,...x})),...Array.from({length:51},()=>base),{kind:'exercise',profile_id:'teen',domain:languageDomain('teen'),level:2,count:1,client_revision:11,cognitive_only:true}]);
 for(const r of rows.slice(0,bad.length))assert.equal(r.status,400);
 const prints=rows.slice(bad.length,-1);for(let i=0;i<50;i++){assert.equal(prints[i].status,200);assert.equal(prints[i].data.items.length,1);assert.equal(prints[i].data.items[0].contentKey,it.contentKey);assert.equal(prints[i].data.usage.kind,'worksheet');assert.equal(prints[i].data.usage.used,i+1);}
 assert.equal(prints[50].status,403);assert.equal(rows.at(-1).status,200);assert.equal(rows.at(-1).data.usage.used,1);
});

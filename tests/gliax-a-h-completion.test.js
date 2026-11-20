const test=require('node:test'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const tasks=require('../js/executed-tasks'),photos=require('../js/photo-library'),art=require('../js/stimulus-art');
const families=require('../js/cognitive-families');
const ages=['early','junior','primary','middle','teen'],levels=[1,2,3];
function deliver(age,bodies){
 const input=bodies.map(body=>JSON.stringify({profile_id:age,kind:'exercise',client_revision:17,locale:'es_intl',...body})).join('\n')+'\n';
 return execFileSync(process.execPath,['tests/edge-worker.js',age],{input,encoding:'utf8',timeout:30000,maxBuffer:5e6}).trim().split('\n').map(JSON.parse);
}

test('the real handler produces three different comparison formats at every age and level',()=>{
 for(const age of ages){
  const requests=levels.flatMap(level=>tasks.comparisonFormats.map(comparison_format=>({
   domain:'attention',level,executed_only:true,executed_family:'compare',comparison_format})));
  const responses=deliver(age,requests);
  assert.equal(responses.length,9);
  responses.forEach(({status,data},i)=>{
   assert.equal(status,200,JSON.stringify(data));const item=data.items[0],ex=item.execution;
   assert.equal(ex.format,requests[i].comparison_format);
   assert.equal(item.level,requests[i].level);
   assert.match(item.contentKey,/^executed-v5:/);
   assert.ok([...ex.cells,...ex.after].every(label=>art.forLabel(label)));
   assert.deepEqual(ex.answer,ex.cells.flatMap((cell,index)=>cell!==ex.after[index]?[String(index)]:[]));
   assert.equal(tasks.grade(item,ex.answer),true);
   assert.equal(tasks.grade(item,['99']),false);
  });
  const invalid=deliver(age,[{domain:'attention',level:1,executed_only:true,executed_family:'compare',comparison_format:'unknown'}]);
  assert.equal(invalid[0].status,400);
 }
});

test('active planning in the real handler increases both valid steps and distractors and checks their order',()=>{
 for(const age of ages){
  const rows=deliver(age,levels.map(level=>({domain:'executive',level,executed_only:true,executed_family:'plan'})));
  const [l1,l2,l3]=rows.map(({status,data})=>{assert.equal(status,200,JSON.stringify(data));return data.items[0];});
  assert.equal(l1.execution.choices,undefined);
  assert.ok(l3.execution.steps.length>l2.execution.steps.length);
  for(const item of [l2,l3]){
   const {execution:e}=item,distractors=e.choices.filter(x=>!e.answer.includes(x));
   assert.equal(distractors.length,item.level-1);
   assert.notDeepEqual(e.choices.filter(x=>e.answer.includes(x)),e.answer);
   assert.equal(new Set(e.choices).size,e.choices.length);
   assert.ok(tasks.grade(item,e.answer));
   assert.equal(tasks.grade(item,e.answer.slice().reverse()),false);
   assert.equal(tasks.grade(item,[distractors[0],...e.answer.slice(1)]),false);
  }
 }
});

test('photo prompts expose only the requested count and all visible level-one changes are accepted candidates',()=>{
 for(const age of ages.slice(1))for(const level of levels)for(const item of photos.pool(age,'attention',level)){
  assert.equal(item.q,photos.differencePrompt(item.differenceCount));
  assert.deepEqual(item.answers,photos.pairs[item.photoTask.pairId].changes.map(([name])=>name));
  assert.ok(item.answers.every(answer=>item.opts.includes(answer)));
  assert.equal(item.differenceCount,item.answers.length);
  assert.ok(photos.validate(item));
 }
});

test('the original falling-word activity is delivered in processing speed with progressive transcription parameters',()=>{
 for(const age of ages){
  const items=deliver(age,levels.map(level=>({domain:'speedReasoning',level,cognitive_only:true,cognitive_family:'falling'})))
   .map(({status,data})=>{assert.equal(status,200,JSON.stringify(data));return data.items[0];});
  items.forEach((item,index)=>{
   assert.equal(item.primaryConstruct,'writtenTranscription');
   assert.equal(item.topic,'Palabras en caída');
   assert.equal(item.cognitiveTask.prompts.length,[4,6,8][index]);
   assert.equal(item.cognitiveTask.windowMs,[10500,9000,7800][index]);
   assert.equal(families.paperEligible(item),false);
  });
 }
});

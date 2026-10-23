const test=require('node:test'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const curriculum=require('../js/curriculum'),model=require('../js/activity-model'),locale=require('../js/locale-content');
test('interactive cards have graded, printable rules and explicit observation contracts in all locales',()=>{
 for(const age of ['junior','primary','middle','teen'])for(const level of [1,2,3])for(const domain of ['attention','executive']){
  const bank=curriculum.interactivePool(age,domain,level);assert.equal(bank.length,domain==='attention'?8:16);
  for(const it of bank){
   const t=it.interactionTask;assert.equal(t.level,level);assert.equal(t.age,age);
   if(domain==='attention'){assert.equal(t.kind,'room');assert.equal(t.conditions,level);assert.equal(it.assessment,'observation');}
   else{
    assert.equal(t.rules.length,[3,4,age==='junior'?5:6][level-1]);assert.equal(t.trials.length,2*t.rules.length);
    assert.equal(new Set(t.rules.map(r=>r.symbol)).size,t.rules.length);
    for(const rules of [t.rules,...(t.secondRules?[t.secondRules]:[])]){
     assert.equal(rules.filter(r=>r.target===-1).length,1);
     assert.equal(new Set(rules.map(r=>r.target)).size,rules.length);
     assert.ok(rules.every(r=>r.target===-1||t.actions[r.target]));
    }
    assert.ok(t.trials.every(n=>Number.isInteger(n)&&n>=0&&n<t.rules.length));
    if(t.kind==='movement'){assert.equal(t.waitMs,5000);assert.equal(it.assessment,'observation');}
    else{assert.equal(Boolean(t.secondRules),level===3);assert.equal(it.assessment,'performance');}
   }
   for(const country of Object.keys(locale.labels))assert.doesNotThrow(()=>model.forDelivery(locale.localizeItem(it,country,domain),{age_band:age==='junior'?'primary':age,progress:{ageRoute:age}},domain));
   for(const mutate of [x=>delete x.interactionTask,x=>x.interactionTask.variant=99,x=>x.stimulus.pop(),x=>x.level=4]){const bad=structuredClone(it);mutate(bad);assert.throws(()=>model.printable(bad,{age_band:age==='junior'?'primary':age,progress:{ageRoute:age}}));}
  }
 }
 assert.deepEqual(curriculum.interactivePool('early','executive',1),[]);
});
test('natural copulas, nonhuman subjects and elementary vocabulary are distinct by level',()=>{
 for(const age of ['junior','primary','middle','teen'])for(const level of [1,2,3]){
  const domain={middle:'middleLanguage',teen:'teenLanguage'}[age]||'language',bank=curriculum.academic(age,domain,level,'grammar');
  const adjectives=bank.filter(x=>x.mechanic==='grammar_adjective');assert.ok(adjectives.some(x=>x.stimulus[0].text===`El investigador es ___.`||x.stimulus[0].text==='Los investigadores son ___.'));
  assert.ok(adjectives.every(x=>!x.stimulus[0].text.includes('está curioso')));
  const repair=bank.find(x=>x.mechanic==='grammar_repair'&&x.stimulus[0].text.startsWith('Los robots'));
  assert.doesNotMatch(repair.q+' '+repair.why,/personas/);
 }
 for(const age of ['junior','primary']){
  const wordsets=[1,2,3].map(level=>new Set(curriculum.vocabulary(age,'language',level).map(x=>x.stimulus[0].text)));
  assert.ok([...wordsets[0]].every(x=>!wordsets[1].has(x)&&!wordsets[2].has(x)));
  for(const level of [1,2,3])for(const it of curriculum.vocabulary(age,'language',level))assert.ok(!it.opts.some(x=>['Tiene el mismo significado','No se puede saber'].includes(x)));
 }
});
test('real endpoint gates interactive mode by client, domain, age and incompatible modes',()=>{
 const base={kind:'exercise',profile_id:'teen',domain:'executive',level:3,count:1,locale:'es_es',client_revision:4,interaction_only:true};
 const reqs=[{...base,interaction_kind:'symbols'},{...base,interaction_kind:'movement'},{...base,domain:'attention',interaction_kind:'room'},{...base,client_revision:3},{...base,photos_only:true},{...base,documents_only:true},{...base,domain:'memory'},{...base,interaction_kind:'room'}];
 const rows=execFileSync(process.execPath,['tests/edge-worker.js','teen'],{input:reqs.map(x=>JSON.stringify(x)).join('\n')+'\n',encoding:'utf8',timeout:60000}).trim().split('\n').map(JSON.parse);
 assert.deepEqual(rows.map(x=>x.status),[200,200,200,409,400,400,400,400]);
 assert.deepEqual(rows.slice(0,3).map(x=>x.data.items[0].interactionTask.kind),['symbols','movement','room']);
});

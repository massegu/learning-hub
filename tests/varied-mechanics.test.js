const test=require('node:test'),assert=require('node:assert/strict');
const curriculum=require('../js/curriculum'),model=require('../js/activity-model'),locale=require('../js/locale-content'),art=require('../js/stimulus-art'),load=require('./edge-harness');
const ages=['early','junior','primary','middle','teen'],profile=age=>({age_band:age==='early'?'primary':age,progress:{ageRoute:age}});
test('memory starts with five stimuli, adds source-bound scenes/routes and both positional answers across ages',()=>{
 for(const age of ages)for(const level of [1,2,3]){
  const bank=curriculum.pool(age,'memory',level),sequence=bank.find(x=>x.mechanic==='memory_sequence');
  assert.equal(sequence.recallSequence.length,5+(level-1)*(['early','junior'].includes(age)?1:2));
  for(const family of ['memory_scene','memory_route'])for(const it of bank.filter(x=>x.mechanic===family)){
   for(const country of Object.keys(locale.labels))assert.doesNotThrow(()=>model.printable(locale.localizeItem(it,country,'memory'),profile(age)));
   if(family==='memory_route'){const broken=structuredClone(it);broken.stimulus[0].positions[0]=99;assert.throws(()=>model.printable(broken,profile(age)));assert.equal(it.stimulus[0].positions.length,it.answer.length);assert.equal(new Set(it.stimulus[0].positions).size,it.answer.length);const corrupt=structuredClone(it);corrupt.answer.reverse();assert.throws(()=>model.printable(corrupt,profile(age)));}
   else {const broken={...it,a:it.opts.find(x=>x!==it.a)};assert.throws(()=>model.forDelivery(broken,profile(age),'memory'));const row=it.stimulus[0].rows[it.answerEvidence.row];assert.ok(it.memoryQuestion.includes(row[0]));assert.equal(it.a,row[1]);}
  }
  if(level<3)for(const mode of ['grid','coordinates'])assert.ok(bank.some(x=>x.memoryResponse==='spatial'&&x.spatialAnswer===mode));
 }
});
test('four speed mechanics derive answers from their visible material and increase workload with level',()=>{
 for(const age of ages){
  const low=curriculum.pool(age,'speedReasoning',1),high=curriculum.pool(age,'speedReasoning',3);
  for(const family of ['speed_search','speed_pairs','speed_flanker',...(age==='early'?[]:['speed_translation'])]){
   const one=low.find(x=>x.mechanic===family),three=high.find(x=>x.mechanic===family);assert.ok(one&&three);
   if(family==='speed_search')assert.ok(three.stimulus[0].items.length>one.stimulus[0].items.length);
   if(family==='speed_pairs')assert.ok(three.stimulus[0].rows.length>one.stimulus[0].rows.length);
   if(family==='speed_translation')assert.ok(three.speedEvidence.code.length>one.speedEvidence.code.length);
   for(const it of [one,three]){assert.doesNotThrow(()=>curriculum.validateSpeed(it));const bad={...it,a:it.opts.find(x=>x!==it.a)};assert.throws(()=>model.forDelivery(bad,profile(age),'speedReasoning'));}
  }
 }
});
test('real selector delivers expanded academic banks and grammar order is not misclassified as writing',()=>{
 const {api}=load();
 for(const age of ages.filter(x=>x!=='early')){
  const language=age==='middle'?'middleLanguage':age==='teen'?'teenLanguage':'language',math=age==='middle'?'middleMath':age==='teen'?'teenMath':'division';
  for(const level of [1,2,3]){
   const grammar=curriculum.academic(age,language,level,'grammar');assert.ok(grammar.length>=80);assert.ok(grammar.some(x=>x.type==='order'));assert.ok(new Set(grammar.map(x=>x.mechanic)).size>=8);
   const number=curriculum.academic(age,math,level,null);assert.equal(new Set(number.map(x=>x.mechanic)).size,6);
   for(const domain of [language,math]){
    const delivered=api.generatedItems(domain,6,[],()=>api.variantExercise(age,domain,level,'grammar'));assert.equal(delivered.length,6);assert.equal(new Set(delivered.map(x=>x.mechanic)).size,6);
    for(const item of delivered)for(const country of Object.keys(locale.labels))model.printable(locale.localizeItem(item,country,domain),profile(age));
   }
   for(const it of number){assert.doesNotThrow(()=>curriculum.validateMath(it));const bad={...it,a:it.opts.find(x=>x!==it.a)};assert.equal(api.validateItem(bad),false);}
  }
 }
});
test('math levels change numeric ranges and actual operations, and every generated equation balances',()=>{
 for(const age of ['junior','primary']){
  const low=curriculum.academic(age,'division',1),high=curriculum.academic(age,'division',3);
  assert.ok(Math.max(...high.filter(x=>x.mechanic==='math_cálculo').flatMap(x=>x.mathEvidence.values))>Math.max(...low.filter(x=>x.mechanic==='math_cálculo').flatMap(x=>x.mathEvidence.values)));
  assert.ok(high.filter(x=>x.mechanic==='math_reparto').every(x=>/sobra/.test(x.stimulus[0].text)));
 }
 for(const age of ['middle','teen'])for(const level of [1,2,3]){
  for(const item of curriculum.academic(age,age==='middle'?'middleMath':'teenMath',level)){
   if(item.mechanic==='math_ecuaciones'){
    const text=item.stimulus[0].text,x=Number(item.a);let match;
    if((match=text.match(/^(\d+)x \+ (\d+) = (\d+)$/)))assert.equal(Number(match[1])*x+Number(match[2]),Number(match[3]));
    else if((match=text.match(/^(\d+)\(x \+ (\d+)\) = (\d+)$/)))assert.equal(Number(match[1])*(x+Number(match[2])),Number(match[3]));
    else {match=text.match(/^(\d+)x \+ (\d+) = (\d+)x \+ (\d+)$/);assert.ok(match);assert.equal(Number(match[1])*x+Number(match[2]),Number(match[3])*x+Number(match[4]));}
   }
   if(item.mechanic==='math_porcentajes')assert.equal(/gestión|aumenta/.test(item.stimulus[0].text),level>1);
   if(item.mechanic==='math_superficie')assert.equal(/añade|recortan/.test(item.stimulus[0].text),level>1);
  }
 }
});
test('executive resources have exactly one feasible plan, and new art PNG cache cannot be mutated by an export',()=>{
 for(const age of ages.filter(x=>x!=='early'))for(const level of [1,2,3]){
  const bank=curriculum.pool(age,'executive',level);
  for(const it of bank.filter(x=>x.planEvidence)){assert.doesNotThrow(()=>curriculum.validatePlan(it));const bad={...it,a:it.opts.find(x=>x!==it.a)};assert.throws(()=>model.printable(bad,profile(age)));}
 }
 const bytes=art.png('guitar');bytes.fill(0);assert.deepEqual([...art.png('guitar').slice(0,8)],[137,80,78,71,13,10,26,10]);
});

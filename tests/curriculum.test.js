const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const curriculum=require('../js/curriculum'),library=require('../js/reading-library'),model=require('../js/activity-model'),locale=require('../js/locale-content'),load=require('./edge-harness');
const ages=['early','junior','primary','middle','teen'];
const profile=age=>({age_band:age==='early'||age==='junior'?'primary':age,progress:{ageRoute:age}});
test('shared curriculum has fifty distinct sources and complete localized delivery/printable contracts',()=>{
 for(const file of ['curriculum.js','reading-library.js'])assert.equal(fs.readFileSync('js/'+file,'utf8'),fs.readFileSync('supabase/functions/request-learning-content/'+file,'utf8'));
 const all=[];
 for(const age of ages){assert.equal(library[age].length,10);for(const row of library[age]){assert.equal(row.length,8);assert.ok(row.every(x=>typeof x==='string'&&x.trim()));all.push(row[1]);}
  const domain=['early','junior'].includes(age)?'reading':'literacy';
  for(const level of [1,2,3])for(const d of [domain,'memory','speedReasoning','executive']){
   const bank=curriculum.pool(age,d,level);assert.ok(bank.length);
   for(const it of bank)for(const country of Object.keys(locale.labels)){
    const local=locale.localizeItem(it,country,d),printed=model.printable(local,profile(age));
    assert.ok(printed.stimulus.length);assert.equal(local.level,level);assert.equal(local.domain,d);if(it.type==='self'&&!it.writingPurpose){const quote=it.sample.match(/«(.+)»/)[1];assert.ok(it.stimulus[0].text.includes(quote));assert.equal(it.writingRubric.length,3);}
    assert.equal(new Set(printed.options.map(x=>x.toLocaleLowerCase('es'))).size,printed.options.length);
   }
  }
 }
 assert.equal(new Set(all).size,50);
});
test('reading source identities rotate for ten deliveries despite changed question, level, or restored early session',()=>{
 const {api}=load();
 for(const age of ages){
  const d=['early','junior'].includes(age)?'reading':'literacy',history=[],seen=[];
  for(let n=0;n<25;n++){
   const it=api.generatedItems(d,1,history,()=>api.variantExercise(age,d,n%3+1,'reading'))[0];
   assert.ok(it);seen.push(it.passageKey);history.push(api.contentSignature(d,it),`${d}:mechanic:${it.mechanic}`);
   if(n>=9)assert.equal(new Set(seen.slice(-10)).size,10,age);
  }
 }
 global.Curriculum=curriculum;
 const early=require('../js/early-content');let p=profile('early'),seen=[];
 for(let n=0;n<25;n++){
  const it=early.select(p,['reading'],1,n%3+1,Math.random,null,'reading')[0];seen.push(it.passageKey);p=JSON.parse(JSON.stringify(p));
  if(n>=9)assert.equal(new Set(seen.slice(-10)).size,10);
 }
 delete global.Curriculum;
});
test('memory requires reconstructing sequences and positions, and corrupt answers fail closed',()=>{
 for(const age of ages){
  const low=curriculum.pool(age,'memory',1),high=curriculum.pool(age,'memory',3);
  for(const family of ['memory_sequence','memory_spatial','memory_association']){
   const one=low.find(x=>x.mechanic===family),three=high.find(x=>x.mechanic===family);
   assert.ok(three.memoryContent.length>one.memoryContent.length,age+'/'+family);
  }
  for(const level of [1,2,3])for(const it of curriculum.pool(age,'memory',level)){
   if(it.recallEvidence?.kind==='sequence'){
    const expected=it.recallEvidence.takeLast?it.stimulus[0].items.slice(-it.recallEvidence.takeLast):it.recallEvidence.reverse?[...it.stimulus[0].items].reverse():it.stimulus[0].items;
    assert.deepEqual(it.answer,expected);assert.ok(it.tokens.every(t=>expected.includes(t)));
    assert.equal(it.recallEvidence.reverse,!it.recallEvidence.takeLast&&level===3&&['primary','middle','teen'].includes(age));
    const corrupt=structuredClone(it);[corrupt.answer[0],corrupt.answer[1]]=[corrupt.answer[1],corrupt.answer[0]];
    assert.throws(()=>model.printable(corrupt,profile(age)),/orden/);
   }
   if(it.recallEvidence?.kind==='spatial'){
    const printed=model.printable(it,profile(age));assert.equal(printed.stimulus[0].rows.length,it.gridSize);
    const corrupt=structuredClone(it);corrupt.a=it.opts.find(x=>x!==it.a);assert.throws(()=>model.printable(corrupt,profile(age)),/espacial/);
    if(level===3&&['primary','middle','teen'].includes(age))assert.equal(it.recallEvidence.targets.length,2);
   }
  }
 }
});
test('processing speed answers derive from comparisons or keys, and timing summaries exclude unmeasured/invalid trials',()=>{
 for(const age of ages)for(const level of [1,2,3])for(const it of curriculum.pool(age,'speedReasoning',level)){
  assert.equal(it.speedTask,true);assert.ok(it.mechanic.startsWith('speed_compare_')||['speed_key','speed_match','speed_category','speed_search','speed_pairs','speed_flanker','speed_translation','speed_crossed_keys','speed_rapid_agenda','speed_rule_choice'].includes(it.mechanic));
  const b=it.stimulus[0];
  if(it.speedEvidence.kind==='equal')assert.equal(it.a,b.rows[0][0]===b.rows[0][1]?'Sí':'No');
  if(it.speedEvidence.kind==='key')assert.equal(it.a,b.rows.find(row=>row[0]===it.speedEvidence.target)[1]);
  if(it.speedEvidence.kind==='model')assert.equal('Modelo: '+it.a,b.text);
 }
 const rows=[{subject:'executive',timingValid:true,responseMs:1,correct:true},{subject:'speedReasoning',timingValid:false,responseMs:1,correct:true},{subject:'speedReasoning',timingValid:true,responseMs:800,correct:true},{subject:'speedReasoning',timingValid:true,responseMs:1200,correct:true},{subject:'speedReasoning',timingValid:true,responseMs:100,correct:false}];
 assert.deepEqual(curriculum.speedSummary(rows),{attempts:3,accuracy:67,medianMs:1000});
});
test('fused executive criteria, supervision and planning use the stated constraints; both valid and invalid decisions occur',()=>{
 for(const age of ages)for(const level of [1,2,3]){
  const bank=curriculum.pool(age,'executive',level);assert.ok(bank.some(x=>x.mechanic==='executive_supervision'));
  for(const it of bank.filter(x=>x.mechanic==='executive_criteria'||x.mechanic==='executive_verification')){
   const table=it.stimulus[1].rows.slice(1),valid=table.filter(r=>r[1]==='Listo'&&r[2]==='Sí'&&(level===1||Number(r[3])<=(level===2?6:4))&&(level!==3||r[4]==='Confirmado'));
   assert.equal(valid.length,1);
   if(it.mechanic==='executive_criteria')assert.equal(it.a,valid[0][0]);
   else {const selected=it.q.match(/paquete (\w)/)[1];assert.equal(it.a.startsWith('Sí'),selected===valid[0][0]);}
  }
  if(age!=='early'){
   const checks=bank.filter(x=>x.mechanic==='executive_verification');assert.ok(checks.some(x=>x.a.startsWith('Sí')));assert.ok(checks.some(x=>x.a.startsWith('No')));
   assert.ok(bank.find(x=>x.mechanic==='executive_supervision').stimulus[0].text.split(/\s+/).length>=35);
  }
 }
});
test('area fusion migrates once, preserves totals and original records, and starts speed with fresh evidence',()=>{
 const progress={totalAttempts:3,totalCorrect:2,scores:{executive:10,applied:5,speedReasoning:7,middleReading:9,literacy:2},levels:{executive:3,speedReasoning:3},history:[{subject:'applied',points:5},{subject:'speedReasoning',points:7},{subject:'middleReading',points:9}],_earlyJourney:{completed:[{id:'words'}]}};
 const original=structuredClone(progress),next=curriculum.migrate(progress,'middle');
 assert.deepEqual(progress,original);assert.equal(next.totalAttempts,3);assert.equal(next.totalCorrect,2);assert.equal(next.scores.executive,22);assert.equal(next.scores.literacy,11);assert.equal(next.levels.speedReasoning,1);
 assert.deepEqual(next.history.map(x=>x.subject),['executive','executive','literacy']);assert.deepEqual(next._curriculumLegacy.history,progress.history);assert.deepEqual(next._earlyJourney,progress._earlyJourney);assert.strictEqual(curriculum.migrate(next,'middle'),next);
 assert.equal(curriculum.speedSummary(next.history).attempts,0);
 assert.deepEqual(curriculum.visible(['executive','applied','speedReasoning','middleReading','literacy'],'middle'),['executive','speedReasoning','literacy']);
});

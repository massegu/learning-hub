const assert=require('node:assert/strict');
const test=require('node:test');
const families=require('../js/cognitive-families');
const catalogue=require('../js/communication-content');
const curriculum=require('../js/curriculum');
const model=require('../js/activity-model');
const reader=require('../js/reader-assist');
const locale=require('../js/locale-content');
const report=require('../js/progress-report');
const dashboard=require('../js/progress-dashboard');

test('known alternatives and counterexamples have evidence; unknowns are neutral',()=>{
 const birds=families.pool('primary','language',1,'words',2).find(item=>item.cognitiveTask.cue?.includes('anidar'));
 for(const word of ['gorrión','Gorrión','GORRIO\u0301N','mirlo','paloma']){
  assert.deepEqual(families.productionVerdict(birds,word),{
   status:'correct',feedback:'Es un ave que vuela y puede anidar en árboles.'
  });
 }
 assert.deepEqual(families.productionVerdict(birds,'pingüino'),{status:'incorrect',feedback:'Es un ave que no puede volar.'});
 assert.equal(families.productionStatus(birds,'lechuza'), 'unverifiable');
 assert.equal(families.productionStatus(birds,'xyz'), 'unverifiable');
 const literal=families.pool('early','language',1,'words')[0];
 assert.equal(families.productionVerdict(literal,'pan').feedback,'La consigna pide un animal.');
 assert.match(families.printable(birds).solution,/paloma/);
});

test('R19 drops Language delivery while preserving R18 and exercises all six digital response contracts',()=>{
 const layouts=new Set(),responses=new Set();
 for(const age of ['early','junior','primary','middle','teen']){
  const profile={age_band:age};
  for(const level of [1,2,3]){
   const old=catalogue.transversalPool(age,level,null,null,18);
   assert.ok(old.some(it=>it.contentKey.includes(':language:')));
   const items=catalogue.transversalPool(age,level,null,null,19);
   assert.ok(items.every(it=>!it.contentKey.includes(':language:')));
   assert.equal(catalogue.availableFormats(age,level,'communication',19).length,7);
   for(const item of items){
    layouts.add(item.stimulus[0].materialType);responses.add(item.responseType+'|'+item.simulation.correction);
    for(const dialect of Object.keys(locale.labels)){
     const adapted=locale.localizeItem(item,dialect,item.domain);
     model.forDelivery(adapted,profile,item.domain);
     const html=model.interactiveStimulus(adapted.stimulus);
     assert.match(html,/digital-stimulus/);
     assert.doesNotMatch(html,/· simulación|pantalla simulada/i);
    }
   }
  }
 }
 assert.equal(layouts.size,7);
 assert.ok(catalogue.availableFormats('primary',3,'literacy',19).includes('clip'));
 assert.ok(catalogue.availableFormats('middle',3,'literacy',19).includes('clip'));
 for(const key of ['choice|exact_choice','order|ordered_exact','written|normalized_exact','multiple|exact_set','written|professional_review'])
  assert.ok(responses.has(key),key);
});

test('syllabic defaults avoid ambiguous clusters while preserving plain text and documents',()=>{
 for(const [word,expected] of [['casa',['ca','sa']],['gorrión',['go','rrión']],['río',['rí','o']],['pingüino',['pin','güi','no']],['buey',null],['ADN',null],['Wifi',null]]){
  assert.deepEqual(reader.syllables(word),expected,word);
 }
 assert.match(model.interactiveStimulus([{type:'text',text:'El río.'}],{readerText:true}),/data-reader-text/);
 assert.doesNotMatch(model.interactiveStimulus([{type:'text',text:'El tren sale a las ocho.',presentation:'poster'}],{readerText:true}),/data-reader-text/);
});

test('math problems are deterministic, solvable and age-scoped, with separately recorded steps',()=>{
 const operations={add:(a,b)=>a+b,subtract:(a,b)=>a-b,multiply:(a,b)=>a*b,divide:(a,b)=>a/b,multiply_add:(a,b,c)=>a*b+c};
 for(const [age,domain] of Object.entries(curriculum.mathProblemDomains))for(const level of [1,2,3]){
  const pool=curriculum.mathProblemPool(age,domain,level);
  assert.equal(pool.length,12);
  assert.deepEqual(pool,curriculum.mathProblemPool(age,domain,level));
  assert.equal(new Set(pool.map(item=>item.stimulus[0].text)).size,12);
  for(const item of pool){
   const p=item.problem;
   const [a,b,c]=item.stimulus[0].text.match(/\d+/g).map(Number);
   assert.ok(p.alternatives.every(x=>x!==p.datum));
   const args=age==='junior'&&p.index%2===1?[a,b]:age==='middle'&&p.index%2===0?[a,b/100]:age==='teen'&&p.index%2===0?[b,c,Number(item.stimulus[0].text.match(/\d+/g)[3])]:[a,b];
   const stage=p.first==='divide'&&age==='middle'?operations.divide(b,a):operations[p.first](...args);
   assert.equal(p.intermediate,Math.round(stage),item.contentKey);
   const isAlt=p.index%2===1;
   const second=age==='junior'?(isAlt?a:c):age==='primary'?c:age==='middle'?(isAlt?c:a):isAlt?c:a;
   const final=age==='middle'&&!isAlt||age==='teen'&&!isAlt?operations[p.last](second,p.intermediate):operations[p.last](p.intermediate,second);
   assert.equal(p.answer,final,item.contentKey);
   for(const dialect of Object.keys(locale.labels))model.forDelivery(locale.localizeItem(item,dialect,item.domain),{age_band:age},domain);
   const modified={...item,problem:{...p,answer:p.answer+1}};
   assert.throws(()=>curriculum.validateMathProblem(modified));
  }
 }
 assert.deepEqual(curriculum.mathProblemPool('early','division',1),[]);
 const cols=report.tables(report.build([{subject:'division',level:1,detail:JSON.stringify({
  schema:'gliax.exercise-metrics.v1',modality:'math_problem_steps',definition_version:1,steps:{final_answer:true},hint_used:false
 }),correct:null}]),'P-QA','8–10 años');
 assert.match(cols.Detalle.at(-1).join(' '),/Respuesta final correcto/);
});

test('period comparisons separate versions, scoring rules and response modes',()=>{
 const metric=(version,response,scoring)=>JSON.stringify({schema:'gliax.exercise-metrics.v1',modality:'word_fit',definition_version:version,response_mode:response,scoring});
 const row=(day,detail)=>({subject:'language',level:2,detail,correct:true,ts:`2026-11-${day}T10:00:00Z`});
 const history=[row('19',metric(4,'written','exact')),row('01',metric(3,'written','exact')),row('01',metric(4,'selection','exact')),
  row('01',metric(4,'written','partial')),row('01',metric(4,'written','exact'))];
 const view=dashboard.snapshot(report.build(history),{now:'2026-11-22',days:14});
 assert.equal(view.families[0].previousCount,1);
});

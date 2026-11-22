const test=require('node:test');
const assert=require('node:assert/strict');
const model=require('../js/activity-model');
const locale=require('../js/locale-content');
const communication=require('../js/communication-content');
const executed=require('../js/executed-tasks');
const curriculum=require('../js/curriculum');
const report=require('../js/progress-report');
const dashboard=require('../js/progress-dashboard');

const ages=['early','junior','primary','middle','teen'];

test('digital catalogues expose all seven functional contexts and preserve the canonical screen and answers in all locales',()=>{
 for(const age of ages)for(const level of [1,2,3]){
  assert.equal(communication.availableFormats(age,level,'communication').length,7);
  const selected=communication.transversalPool(age,level);
  const centre=selected.filter(item=>item.simulation.format==='message');
  assert.equal(new Set(centre.map(item=>item.domain)).size,6);
  assert.equal(new Set(centre.map(item=>item.q)).size,6);
  for(const item of [...selected,...communication.revisedPool(age,level).filter(x=>x.discussionReview)]){
   for(const variant of Object.keys(locale.labels)){
    const adapted=locale.localizeItem(item,variant,item.domain);
    const profile={age_band:age,progress:{ageRoute:age}};
    model.forDelivery(adapted,profile,item.domain);
    if(item.simulation){
     assert.match(model.interactiveStimulus(adapted.stimulus),/digital-stimulus/);
     const broken=structuredClone(adapted);
     broken.stimulus[0].rows.pop();
     assert.throws(()=>model.forDelivery(broken,profile,item.domain));
    }else{
     assert.ok(item.writingRubric.length>=2);
     assert.equal(item.responseType,'written');
    }
   }
  }
 }
});

test('spatial recall has eight distinct and versioned layouts for all valid ages and levels',()=>{
 for(const age of ages)for(const level of [1,2,3]){
  const pool=executed.pool(age,'memory',level,6).filter(item=>item.execution.kind==='spatial');
  assert.equal(pool.length,8);
  assert.equal(new Set(pool.map(item=>item.execution.occupied.join(','))).size,8);
  const chevrons=pool.filter(({execution:{occupied,cols}})=>{
   const ordered=[...occupied].sort((a,b)=>a%cols-b%cols);
   return occupied.length===3&&new Set(occupied.map(i=>i%cols)).size===3&&
    Math.floor(ordered[0]/cols)===Math.floor(ordered[2]/cols)&&Math.floor(ordered[0]/cols)!==Math.floor(ordered[1]/cols);
  });
  assert.ok(chevrons.length<=1);
  const old=executed.pool(age,'memory',level,4).filter(item=>item.execution.kind==='spatial');
  old.forEach(item=>executed.validate(item,age));
  for(const item of pool){
   const {occupied,cols,cells,target}=item.execution;
   assert.ok(occupied.every(i=>cells[i]===target));
   assert.ok(new Set(occupied.map(i=>i%cols)).size>=2);
   assert.ok(new Set(occupied.map(i=>Math.floor(i/cols))).size>=2);
   assert.ok(executed.grade(item,occupied));
  }
 }
});

test('the 6–7 advanced visual grid preserves empty positions and varies its arrangement',()=>{
 const spatial=curriculum.pool('early','memory',3).filter(x=>x.mechanic==='memory_spatial');
 assert.ok(spatial.length>20);
 const masks=spatial.map(item=>item.stimulus[0].rows.flat().map(cell=>cell==='—'?0:1).join(''));
 assert.ok(masks.every(mask=>mask.length===6&&mask.split('0').length===3));
 assert.ok(new Set(masks).size>=12);
});

test('dashboard keeps comparable groups and retains both Math identifiers',()=>{
 const row=(subject,day,detail,correct,level=2)=>({subject,detail,correct,level,ts:'2026-11-'+day+'T23:59:00Z'});
 const metric=modality=>JSON.stringify({schema:'gliax.exercise-metrics.v1',modality,definition_version:2});
 const history=[
  row('division','18','calculation',true),
  row('geometry','19','geometry',false),
  row('memory','19',metric('executed_memory_spatial'),true),
  row('memory','06',metric('executed_memory_spatial'),false),
  row('memory','04','executed_memory_spatial',false,1),
  row('speedReasoning','18',metric('falling_words'),null),
  row('executive','18',metric('guided_wait'),null),
  row('communication','18',metric('communication_supervised'),null),
  row('executive','18',metric('rule_application'),true),
 ];
 const full=report.build(history);
 assert.equal(full.areas.get('Matemáticas').count,2);
 assert.deepEqual(full.rows.map(x=>x.row.subject),history.map(x=>x.subject));
 const view=dashboard.snapshot(full,{days:14,now:'2026-11-20'});
 assert.equal(view.total,7);
 assert.equal(view.correct,2);
 assert.equal(view.previous,2);
 assert.deepEqual(view.groups,{scored:3,rules:1,wait:1,typing:1,supervised:1,practice:0});
 assert.equal(view.families.find(x=>x.name==='Memoria espacial').previousCount,1);
 const maths=dashboard.snapshot(full,{days:14,area:'Matemáticas',now:'2026-11-20'});
 assert.equal(maths.total,2);
 assert.equal(maths.correct,1);
});

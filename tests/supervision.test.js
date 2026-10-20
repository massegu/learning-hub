const test=require('node:test'),assert=require('node:assert/strict'),curriculum=require('../js/curriculum'),model=require('../js/activity-model'),locale=require('../js/locale-content'),load=require('./edge-harness');
const ages=['junior','primary','middle','teen'];
const profile=age=>({age_band:age==='junior'?'primary':age,progress:{ageRoute:age}});
test('plan supervision has distinct authored sources by age, bounded difficulty and evidence-bound multiple answers in all locales',()=>{
 const sources=[];const {api}=load();
 for(const age of ages)for(const level of [1,2,3]){
  const tasks=curriculum.pool(age,'executive',level).filter(it=>it.type==='multiSelect');assert.equal(tasks.length,6);
  for(const it of tasks){
   const rows=it.stimulus[1].rows.slice(1);assert.equal(rows.length,level===1?3:level===2?4:['junior','primary'].includes(age)?5:6);
   assert.equal(it.answers.length,level===1?1:level===2?2:age==='junior'?2:3);
   assert.ok(it.answers.length<it.opts.length);assert.ok(api.validateItem(it));
   const expected=rows.filter(r=>r[1]!==r[2]).map(r=>r[0]);assert.deepEqual(it.answers,expected);
   if(level===3)sources.push(it.stimulus[0].text);
   for(const country of Object.keys(locale.labels)){
    const localized=locale.localizeItem(it,country,'executive');assert.doesNotThrow(()=>model.forDelivery(localized,profile(age),'executive'));
    const print=model.printable(localized,profile(age));assert.equal(print.stimulus[1].rows.length,rows.length+1);assert.equal(print.options.length,rows.length);
   }
  }
 }
 assert.equal(new Set(sources).size,24);
 assert.ok(curriculum.pool('early','executive',3).every(it=>it.type!=='multiSelect'));
});
test('a damaged plan, inconsistent answer or missing evidence is rejected on server, screen and print',()=>{
 const {api}=load();const base=curriculum.pool('teen','executive',3).find(it=>it.type==='multiSelect');
 const corrupt=[it=>it.answers.pop(),it=>it.answers.push(it.answers[0]),it=>it.stimulus[1].rows[1][2]=it.stimulus[1].rows[1][1],it=>it.reviewEvidence.block=0,it=>it.stimulus=[],it=>it.responseType='choice'];
 for(const mutate of corrupt){const it=structuredClone(base);mutate(it);assert.equal(api.validateItem(it),false);assert.throws(()=>model.forDelivery(it,profile('teen'),'executive'));assert.throws(()=>model.printable(it,profile('teen')));}
});
test('supervision rotates cases by source across level changes and is deliverable by the real selector',()=>{
 const {api,context}=load(),history=[],seen=[];
 for(let n=0;n<6;n++){
  const bank=context.Curriculum.pool('teen','executive',n%3+1).filter(it=>it.type==='multiSelect');let i=0;
  const it=api.generatedItems('executive',1,history,()=>bank[i++%bank.length])[0];assert.ok(it);seen.push(it.passageKey);history.push(api.contentSignature('executive',it));
 }
 assert.equal(new Set(seen).size,6);
});

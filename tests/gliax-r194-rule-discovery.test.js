'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const rule=require('../js/gliax-r194-rule-discovery.js');

const ages=['early','junior','primary','middle','teen'];
for(const age of ages){
 for(const level of [1,2,3]){
  for(let index=0;index<6;index++){
   test('induction '+age+' level '+level+' variant '+index,()=>{
    const task=rule.build(age,level,index);
    assert.equal(rule.validate(task),true);
    assert.equal(task.kind,'ruleDiscovery');
    assert.equal(rule.remaining(task,2).length>=2,true,'Initial evidence must not expose the rule');
    assert.deepEqual(rule.remaining(task,task.examples.length).map(x=>x.id),[task.correctId]);
    assert.equal(task.examples.length>=task.minimumExamples,true);
    assert.equal(task.transfer.stimulus.id!==task.examples.at(-1).stimulus.id,true);
    assert.equal(task.hypotheses.some(h=>/Pulsa|espera|invierte/i.test(h.label)),false);
    assert.equal(task.examples.some(e=>/Pulsa|espera|invierte/i.test(e.stimulus.label)),false);
    assert.equal(task.correctId,level===1?'shape':level===2?'both':'either');
   });
  }
 }
}
test('invalid inputs rejected',()=>{
 assert.throws(()=>rule.build('bogus',1,0));
 assert.throws(()=>rule.build('early',4,0));
 assert.throws(()=>rule.build('early',1,99));
});
test('tampered discovery rejected',()=>{
 const task=rule.build('early',1,0);
 task.examples[2].belongs=false;
 assert.throws(()=>rule.validate(task));
});

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const tasks=require('../js/executed-tasks');
const ages=['early','junior','primary','middle','teen'];
test('interactive sequence instructions do not narrate the solved order',()=>{
 for(const age of ages)for(const level of [1,2,3])for(const version of [4,5]){
  const plans=tasks.pool(age,'executive',level,version).filter(item=>item.execution.kind==='plan');
  assert.equal(plans.length,2);
  for(const item of plans){
   assert.equal(tasks.validate(item),true);
   assert.ok(item.stimulus.every(block=>!(block.items||[]).some(x=>/^Antes de |requiere haber hecho/i.test(x))),item.id);
   assert.equal(tasks.grade(item,item.execution.answer),true);
  }
 }
});
test('partial dependencies accept more than one legitimate order',()=>{
 const steps=['A','B','C','D'],dependencies=[[0,2],[1,2],[2,3]];
 assert.equal(tasks.validPlanOrder(steps,dependencies,['A','B','C','D']),true);
 assert.equal(tasks.validPlanOrder(steps,dependencies,['B','A','C','D']),true);
 assert.equal(tasks.validPlanOrder(steps,dependencies,['A','C','B','D']),false);
 assert.equal(tasks.validPlanOrder(steps,dependencies,['A','B','C','C']),false);
});

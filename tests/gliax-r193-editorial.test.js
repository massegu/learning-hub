'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const bank=require('../js/gliax-r193-editorial');
const {candidates}=require('../js/gliax-r192-diversity');
const {createSelector}=require('../js/gliax-r192-selector');

test('five authored EC cases use distinct mechanisms and require the right evidence',()=>{
  const expected=['compatible','conflicting','compatible','conflicting','conflicting'];
  const cases=bank.ids().filter(id=>/^EC193-0[1-5]$/.test(id)).map(id=>bank.get(id,1));
  assert.deepEqual(cases.map(item=>item.ageBand),['early','junior','primary','middle','teen']);
  assert.equal(new Set(cases.map(item=>item.cognitiveFingerprint)).size,5);
  for (const [index,item] of cases.entries()) {
    assert.equal(new Set(item.presentation.options.map(option=>option.label)).size,3);
    assert.equal(bank.grade(item,{choice:expected[index],evidence:item.answerModel.evidenceIds}).status,'correct');
    assert.equal(bank.grade(item,{choice:'unknown',evidence:item.answerModel.evidenceIds}).status,'incorrect');
    if (item.level>1) {
      assert.equal(bank.grade(item,{choice:expected[index],evidence:item.answerModel.evidenceIds.slice(1)}).status,'partial');
    }
    assert.ok(item.presentation.feedback);
  }
});

test('the extended bank adds exact slot coverage without changing the R19.2 references',()=>{
  for (const id of bank.ids().filter(id=>/^EC193-0[1-5]$/.test(id))) {
    const item=bank.get(id,1);
    const query={family:item.family,ageBand:item.ageBand,level:item.level,seed:1};
    const existing=candidates(query);
    const expanded=candidates({...query,includeEditorial:true});
    assert.equal(existing.length,1);
    assert.ok(expanded.length>=2);
    assert.notEqual(expanded[0].structure,expanded[1].structure);
    assert.notEqual(expanded[0].mechanism,expanded[1].mechanism);
    const selector=createSelector(12,{prioritizeStructuralDiversity:true});
    const ids=Array.from({length:12},()=>selector.next(query,expanded).id);
    assert.ok(new Set(ids).size>=2);
    assert.ok(ids.slice(1).every((id,index)=>id!==ids[index]));
  }
});


test('the balanced pilot covers eight families with alternative plans and rule signals',()=>{
 const newCases=bank.ids().map(id=>bank.get(id,5)).filter(item=>!item.id.includes('-B'));
 assert.equal(newCases.length,12);
 assert.equal(new Set(newCases.map(item=>item.family)).size,8);
 assert.equal(new Set(newCases.map(item=>item.cognitiveFingerprint)).size,12);
 for(const item of newCases) {
  assert.ok(candidates({...item,seed:1,includeEditorial:true}).some(candidate=>candidate.id===item.id));
  if(!['AR','IN','EC'].includes(item.family)) {
    assert.equal(bank.grade(item,{choice:'0'}).status,'correct');
    assert.equal(bank.grade(item,{choice:'2'}).status,'incorrect');
    assert.equal(bank.grade(item,{choice:'1'}).status,item.family==='planning'?'correct':'incorrect');
  }
 }
 const info=bank.get('IN193-01',1);
 assert.equal(bank.grade(info,'Ancho del hueco').status,'correct');
 assert.equal(bank.grade(info,'medida de la abertura').status,'partial');
 assert.equal(bank.grade(info,'Tengo que saber cuánto mide de lado a lado').status,'uninterpretable');
 const rules=bank.get('AR193-01',1);
 const {evaluateRuleTrials}=require('../js/gliax-r192-ar');
 const events=evaluateRuleTrials(rules);
 assert.deepEqual(events.filter(e=>e.changeEvent).map(e=>e.activeRule),['color','form']);
 const answers=Object.fromEntries(events.filter(e=>!e.changeEvent).map(e=>[e.id,e.expectedAction]));
 const result=bank.grade(rules,answers);
 assert.equal(result.status,'correct');
 assert.equal(result.metrics.scored,6);
 assert.equal(result.metrics.commissions,undefined);
});

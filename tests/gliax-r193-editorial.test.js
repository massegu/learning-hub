'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const bank=require('../js/gliax-r193-editorial');
const {candidates}=require('../js/gliax-r192-diversity');
const {createSelector}=require('../js/gliax-r192-selector');

test('five authored EC cases use distinct mechanisms and require the right evidence',()=>{
  const expected=['compatible','conflicting','compatible','conflicting','conflicting'];
  const cases=bank.ids().map(id=>bank.get(id,1));
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
  for (const id of bank.ids()) {
    const item=bank.get(id,1);
    const query={family:item.family,ageBand:item.ageBand,level:item.level,seed:1};
    const existing=candidates(query);
    const expanded=candidates({...query,includeEditorial:true});
    assert.equal(existing.length,1);
    assert.equal(expanded.length,2);
    assert.notEqual(expanded[0].structure,expanded[1].structure);
    assert.notEqual(expanded[0].mechanism,expanded[1].mechanism);
    const selector=createSelector(12,{prioritizeStructuralDiversity:true});
    const ids=Array.from({length:12},()=>selector.next(query,expanded).id);
    assert.equal(new Set(ids).size,2);
    assert.ok(ids.slice(1).every((id,index)=>id!==ids[index]));
  }
});

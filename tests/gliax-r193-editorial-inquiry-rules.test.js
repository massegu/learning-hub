'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const bank=require('../js/gliax-r193-editorial');
const inquiry=require('../js/gliax-r193-editorial-inquiry');
const ar=require('../js/gliax-r193-editorial-rule-batch');
const {candidates}=require('../js/gliax-r192-diversity');

test('inquiry covers twenty-four unique information requirements with conservative grading',()=>{
  const ids=inquiry.ids();
  assert.equal(ids.length,24);
  const entries=ids.map(id=>bank.get(id,1));
  assert.equal(new Set(entries.map(e=>e.mechanic)).size,24);
  assert.equal(new Set(entries.map(e=>e.ageBand+':'+e.level)).size,15);
  for(const item of entries){
    for(const set of item.answerModel.sets){
      const text=set.join(' y ');
      assert.equal(bank.grade(item,text.normalize('NFD').toUpperCase()).status,'correct',item.id);
      assert.equal(bank.grade(item,'no necesito '+text).status,'uninterpretable',item.id);
    }
    assert.equal(bank.grade(item,'').status,'no_response');
    assert.equal(bank.grade(item,'un pájaro gris').status,'uninterpretable');
    assert.ok(candidates({...item,seed:1,includeEditorial:true}).some(entry=>entry.id===item.id));
  }
});

test('rule variants preserve exact expected traces, temporary state and non-scored signals',()=>{
  const expected=['ABABAB','ABAAABB','ABBABAB','A-BAB','BABABAB','ABAAAB',
    'AAABB','BBAABB','ABABBAB','A--ABA','BABAB','A-A-BB'];
  assert.equal(ar.ids().length,12);
  for(const [index,id] of ar.ids().entries()){
    const item=bank.get(id,1);
    const trials=ar.evaluate(item);
    const trace=trials.map(trial=>trial.expected==='wait'?'-':trial.expected).join('');
    assert.equal(trace,expected[index],id);
    const responses=Object.fromEntries(trials.map(trial=>[trial.id,trial.expected==='wait'?null:trial.expected]));
    assert.equal(bank.grade(item,responses).status,'correct',id);
    const first=trials[0].id;
    assert.equal(bank.grade(item,{...responses,[first]:'invalid'}).status,'incorrect',id);
    assert.equal(bank.grade(item,{}).status,'pending_review');
    assert.equal(bank.grade(item,responses).metrics.scored,item.presentation.events.filter(e=>e.type==='trial').length);
    assert.notEqual(item.ageBand,'early');
    assert.ok(candidates({...item,seed:1,includeEditorial:true}).some(entry=>entry.id===id));
  }
  assert.equal(new Set(ar.ids().map(id=>bank.get(id,1).mechanic)).size,12);

});

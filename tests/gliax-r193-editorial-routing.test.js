'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const bank=require('../js/gliax-r193-editorial');
const routing=require('../js/gliax-r193-editorial-routing');
const raw=require('../js/gliax-r193-editorial-routing-data');
const diversity=require('../js/gliax-r192-diversity');

function evaluate(expression,bits){
  if(typeof expression==='string')return expression;
  const [feature,match,miss]=expression;
  return evaluate(bits[feature]?match:miss,bits);
}

test('action-routing cases cover twelve age-level cells with 47 invariant signatures',()=>{
  assert.equal(raw.length,47);
  assert.equal(new Set(raw.map(record=>record.signature)).size,47);
  assert.equal(new Set(raw.map(record=>record.ageBand+':'+record.level)).size,12);
  for(const record of raw){
    const item=bank.get(record.id,1);
    const expected={};
    for(const event of item.presentation.events){
      if(event.type==='signal')continue;
      const bits=[event.stimulus.form==='círculo',event.stimulus.color==='rojo',event.stimulus.border];
      const result=evaluate(event.mode==='initial'?record.direct:record.revised,bits);
      expected[event.id]=result==='W'?null:result;
    }
    assert.equal(bank.grade(item,expected).status,'correct');
    assert.equal(bank.grade(item,expected).metrics.scored,Object.keys(expected).length);
    assert.equal(bank.grade(item,{}).status,'pending_review');
    assert.equal(item.answerModel.measuresWithholding,Object.values(expected).includes(null));
    const first=routing.trials(item)[0].id;
    assert.equal(bank.grade(item,{...expected,[first]:expected[first]==='A'?'B':'A'}).status,'incorrect');
    assert.ok(diversity.candidates({...record,family:'AR',seed:1,includeEditorial:true}).some(c=>c.id===record.id));
  }
});

'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const records=require('../js/gliax-r193-editorial-plan-data');
const editorial=require('../js/gliax-r193-editorial');
const {candidates}=require('../js/gliax-r192-diversity');
const {createSelector}=require('../js/gliax-r192-selector');

function permutations(size){
  const visit=(built,rest)=>rest.length
    ? rest.flatMap(value=>visit([...built,value],rest.filter(x=>x!==value))) : [built];
  return visit([],Array.from({length:size},(_,i)=>i));
}

function violations(plan,rules){
  const position=new Map(plan.map((value,index)=>[value,index]));
  return rules.flatMap(([kind,a,b],index)=>{
    const x=position.get(a),y=position.get(b);
    const valid={starts:x<b,ends:x>=plan.length-b,before:x<y,
      next:y===x+1,apart:Math.abs(y-x)>1,together:Math.abs(y-x)===1}[kind];
    return valid?[]:['r'+index];
  });
}

test('the first lot covers 54 distinct, non-redundant plan structures',()=>{
  assert.equal(records.length,54);
  assert.equal(new Set(records.map(record=>record.id)).size,54);
  assert.equal(new Set(records.map(record=>record.family+':'+record.structure)).size,54);
  for(const record of records){
    const item=editorial.get(record.id,2026);
    const space=permutations(record.steps.length);
    const accepted=space.filter(order=>!violations(order,record.rules).length);
    assert.ok(accepted.length>=2&&accepted.length*2<=space.length,record.id);
    assert.ok(record.rules.every((_,index)=>space.some(order=>{
      const faults=violations(order,record.rules);
      return faults.length===1&&faults[0]==='r'+index;
    })),record.id);
    const pool=candidates({...record,seed:2,includeEditorial:true});
    assert.ok(pool.some(candidate=>candidate.id===record.id));
    if(record.observed){
      const exact=violations(record.observed,record.rules);
      assert.ok(exact.length>0);
      assert.equal(editorial.grade(item,exact).status,'correct');
      assert.equal(editorial.grade(item,exact.slice(1)).status,'incorrect');
    }else{
      for(const order of space){
        const result=editorial.grade(item,order.map(String));
        assert.equal(result.status,violations(order,record.rules).length?'incorrect':'correct');
        assert.ok(result.feedback);
      }
    }
    if(record.previous){
      assert.deepEqual(violations(record.previous,record.rules),['r'+(record.rules.length-1)]);
    }
  }
});

test('the selector reaches every family in the lot and keeps its age and level',()=>{
  const slots=new Set(records.map(record=>[record.family,record.ageBand,record.level].join(':')));
  for(const slot of slots){
    const [family,ageBand,n]=slot.split(':');
    const query={family,ageBand,level:Number(n),seed:2,includeEditorial:true};
    const pool=candidates(query);
    const selector=createSelector('lot-1',{prioritizeStructuralDiversity:true});
    const ids=Array.from({length:64},()=>selector.next(query,pool).id);
    assert.ok(ids.some(id=>id.includes('-B1-')),slot);
    assert.ok(ids.slice(1).every((id,index)=>id!==ids[index]),slot);
  }
});

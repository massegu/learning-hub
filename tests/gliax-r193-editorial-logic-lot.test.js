'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../js/gliax-r193-editorial-logic-data');
const editorial=require('../js/gliax-r193-editorial');
const {candidates}=require('../js/gliax-r192-diversity');

function fits(selected,[kind,a,b]){
  const first=selected.includes(a),second=selected.includes(b);
  return {keep:first,drop:!first,if:!first||second,exclude:!(first&&second),
    either:first||second,exactly:Number(first)+Number(second)===1, link:first===second}[kind];
}
const picked=(value,items)=>items.map((_,i)=>i).filter(i=>(value>>i)%2);
test('logic lots have distinct rule systems, viable distractors and traceable conflicts',()=>{
  assert.equal(data.filter(row=>row.id.includes('-B2-')).length,60);
  assert.equal(data.filter(row=>row.id.includes('-B5-')).length,60);
  assert.equal(new Set(data.map(row=>row.family+':'+row.items.length+':'+row.structure)).size,data.length);
  let impossible=0,alternative=0;
  for (const row of data){
    const item=editorial.get(row.id,'test');
    const values=Array.from({length:2**row.items.length-1},(_,i)=>i+1);
    const checks=value=>row.rules.flatMap((rule,index)=>fits(picked(value,row.items),rule)?[]:[index]);
    for (const [index] of row.rules.entries()){
      assert.ok(values.some(value=>String(checks(value))===String([index])),row.id);
    }
    if (row.family==='EC'){
      const exists=values.some(value=>!checks(value).length);
      if (!exists) impossible++;
      const evidence=item.presentation.rows.map(source=>source.id);
      assert.equal(editorial.grade(item,{choice:exists?'possible':'impossible',evidence}).status,'correct');
      assert.equal(editorial.grade(item,{choice:exists?'impossible':'possible',evidence}).status,'incorrect');
      if(row.level>1)assert.equal(editorial.grade(item,{choice:exists?'possible':'impossible',evidence:[]}).status,'partial');
    }else{
      assert.equal(row.options.length,3);
      assert.equal(new Set(row.options).size,3);
      const valid=row.options.filter(v=>!checks(v).length);
      assert.ok(valid.length>=1&&valid.length<=2);
      if(valid.length===2)alternative++;
      for(const value of row.options){
        const result=editorial.grade(item,{choice:String(value)});
        assert.equal(result.status,valid.includes(value)?'correct':'incorrect');
        assert.ok(result.feedback);
      }
      if(row.previous!==null)assert.deepEqual(checks(row.previous),[row.rules.length-1]);
    }
    assert.ok(candidates({...row,seed:'test',includeEditorial:true}).some(candidate=>candidate.id===row.id));
  }
  assert.ok(impossible>0&&impossible<data.filter(row=>row.family==='EC').length);
  assert.ok(alternative>0);
});

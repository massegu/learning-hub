'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../js/gliax-r193-longitudinal');
const {createSelector} = require('../js/gliax-r192-selector');

const now = Date.parse('2026-11-27');
const query = {family:'constraints',ageBand:'middle',level:2,contentVersion:'r19.2-r2'};
const version = 'r19.2-r2.1';
const rows = status => Array.from({length:12},(_,index)=>({
  clientAttemptId:'attempt-'+index, sessionId:'visit-'+index%3, level:2, ts:new Date(now-3600000*(index+1)).toISOString(),
  detail:{schema:api.schema,...query,gradingVersion:version,mechanism:'resource',
    structure:String(index%3).padStart(16,'0'), first:status,final:'correct',attempts:1,aids:[],responseMs:4000}
}));

test('comparable histories yield different recommendations and exercise distributions', () => {
  const good=api.analyze(rows('correct'),query,version,now);
  const struggle=api.analyze(rows('incorrect'),query,version,now);
  assert.equal(api.recommend(good.family,2).level,3);
  assert.equal(api.recommend(struggle.family,2).reason,'reinforce');
  assert.equal(api.recommend(struggle.family,2).level,2);
  assert.equal(good.family.medianResponseMs,4000);
  const pool=['resources','duration','review','recovery'].flatMap((kind,index)=>
    [0,1].map(version=>({...query,id:index+'-'+version,context:index+'-'+version,
      mechanism:index===0?'resource':kind,structure:index+'-'+version,surface:index+'-'+version,restrictions:kind})));
  function howMuch(data) {
    const selector=createSelector(2026,{prioritizeStructuralDiversity:true});
    let count=0,previous;
    for(let n=0;n<1000;n++){
      const item=selector.next(query,pool,entry=>api.weight(data.mechanisms.get(entry.mechanism)));
      assert.notEqual(item.structure,previous?.structure);
      assert.notEqual(item.mechanism,previous?.mechanism);
      if(item.mechanism==='resource') count++;
      previous=item;
    }
    return count;
  }
  const results={prácticaDominada:howMuch(good),prácticaConRefuerzo:howMuch(struggle)};
  console.log(JSON.stringify(results));
  assert.ok(results.prácticaConRefuerzo>results.prácticaDominada+10,JSON.stringify(results));
});

test('the event omits free text and exposes assisted and initial correctness separately',()=>{
  const draft=api.createDraft({...query,gradingVersion:version}, {mechanism:'resource',structure:'1234567890123456'});
  draft.observe('incorrect',undefined,620,'incorrect');
  draft.assist('hint');
  draft.observe('correct','hint',1000,'incorrect');
  assert.deepEqual(draft.summary(),{schema:api.schema,...query,gradingVersion:version,mechanism:'resource',
    structure:'1234567890123456',first:'incorrect',final:'correct',attempts:2,aids:['hint'],responseMs:null});
  assert.equal(api.analyze(rows('uninterpretable'),query,version,now).family.observations,0);
  assert.equal(api.analyze(rows('correct').map(row=>({...row,ts:'2020-02-01'})),query,version,now).family.observations,0);
  assert.equal(api.analyze(rows('correct'),{...query,contentVersion:'different'},version,now).family.observations,0);
  assert.equal(api.enabled({r193Longitudinal:true,supabaseUrl:'https://example.com'},{hostname:'localhost'}),false);
  assert.equal(api.enabled({r193Longitudinal:true,supabaseUrl:'http://127.0.0.1:54321'},{hostname:'localhost'}),true);
});

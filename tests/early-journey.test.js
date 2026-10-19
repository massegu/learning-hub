const test=require('node:test'),assert=require('node:assert/strict'),journey=require('../js/early-journey'),policy=require('../js/content-policy');
test('short missions use only available early domains and preserve normal domain identities',()=>{
  assert.deepEqual(new Set(Object.keys(journey.areas)),new Set(policy.early.subjects));
  for(const mission of journey.missions){assert.ok(mission.plan.length>=2 && mission.plan.length<=5);assert.ok(mission.plan.every(d=>policy.early.subjects.includes(d)));}
});
test('mission progress survives serialization, resumes and ignores duplicate/wrong-domain answers',()=>{
  let state=journey.start({},'stories');
  assert.deepEqual(journey.record(state,'attention','a'),state);
  state=journey.record(state,'reading','a');assert.equal(state.active.index,1);
  assert.deepEqual(journey.record(state,'reading','a'),state);
  state=journey.start(JSON.parse(JSON.stringify(state)),'words');assert.equal(state.active.id,'stories');
  state=journey.record(state,'reading','b');assert.equal(state.active,null);assert.equal(state.completed.length,1);
  assert.equal(state.completed[0].activities,2);
});
test('untrusted persisted mission plans cannot introduce domains or invalid positions',()=>{
  assert.deepEqual(journey.normalize({completed:[null,{id:'unknown'}]}).completed,[]);
  for(const active of [{id:'unknown',index:0},{id:'words',index:20},{id:'words',index:-1},{id:'words',index:'1'}])assert.equal(journey.normalize({active}).active,null);
  const state=journey.normalize({active:{id:'words',index:1,plan:['teenMath']}});
  assert.equal(journey.definition(state.active.id).plan[1],'language');
});
test('area discovery measures actual participation rather than selected level or correctness',()=>{
  const stats=journey.stats([{subject:'attention',correct:false},{subject:'attention',correct:true},{subject:'attention',correct:false},{subject:'teenMath',correct:true}]);
  assert.deepEqual(stats.attention,{attempts:3,correct:1,firstExploration:3});
  assert.equal(stats.memory.attempts,0);
});
test('discovery milestones are participation-based, bounded and ignore hidden or unknown domains',()=>{
 const domains=['language','reading','memory'];const history=Array.from({length:6},()=>({subject:'language',correct:false}));
 const summary=journey.overview(history,domains,[]);
 assert.equal(summary.discoveries,3);assert.equal(summary.goal,9);assert.equal(summary.explored,1);
 assert.deepEqual(summary.milestones.map(x=>x.done),[true,true,false]);
 assert.equal(journey.suggest(history,domains,'language'),'reading');
 assert.equal(journey.suggest(history,domains,'memory'),'memory');
 assert.equal(journey.overview([],domains,[{id:'unknown'}]).milestones[2].done,false);
 assert.equal(journey.overview([],domains,[{id:'stories'}]).milestones[2].done,true);
});

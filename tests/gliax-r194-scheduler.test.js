'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const scheduler=require('../js/gliax-r194-scheduler');
const cases=Array.from({length:12},(_,i)=>({
 id:'ec-'+i,semanticClusterId:'context-'+Math.floor(i/2),
 mechanismId:'mechanism-'+i%4,structureId:'structure-'+i%3
}));
test('one exposure per new case across simulated sessions',()=>{
 let events=[],chosen=[];
 for(let i=0;i<12;i++){
   const result=scheduler.choose({candidates:cases,exposures:events,seed:'same-profile'});
   assert.ok(result.item);
   chosen.push(result.item.id);
   events.unshift(scheduler.record(result.item,{at:'2026-11-28T10:00:00Z'}));
 }
 assert.equal(new Set(chosen).size,12);
 assert.equal(scheduler.choose({candidates:cases,exposures:events}).reason,'coverage_exhausted');
});
test('a different semantic group is prioritized before near duplicates',()=>{
 const first=scheduler.choose({candidates:cases,exposures:[],seed:'x'}).item;
 const result=scheduler.choose({candidates:cases,exposures:[scheduler.record(first)],seed:'x'});
 assert.notEqual(result.item.semanticClusterId,first.semanticClusterId);
});
test('planned reviews require a declared reason and existing exposure',()=>{
 const seen=[scheduler.record(cases[0])];
 assert.equal(scheduler.choose({candidates:cases,exposures:seen,plannedReview:{caseId:cases[0].id,reason:'reinforcement'}}).item.id,cases[0].id);
 assert.equal(scheduler.choose({candidates:cases,exposures:seen,plannedReview:{caseId:cases[1].id,reason:'reinforcement'}}).reason,'invalid_review');
 assert.throws(()=>scheduler.choose({candidates:cases,exposures:seen,plannedReview:{caseId:cases[0].id,reason:'random'}}));
});
test('selection independent of candidate ordering',()=>{
 const x=scheduler.choose({candidates:cases,seed:'repro'}).item.id;
 const y=scheduler.choose({candidates:[...cases].reverse(),seed:'repro'}).item.id;
 assert.equal(x,y);
});
test('missing semantic metadata is reported, not silently certified',()=>{
 const x=scheduler.choose({candidates:[{id:'one'},{id:'two'}]});
 assert.equal(x.unclassifiedClusters,2);
});

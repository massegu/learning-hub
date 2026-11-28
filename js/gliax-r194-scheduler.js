(function(root){
'use strict';
// Pure planner. Persistence, profile isolation, and access control belong to an explicit adapter.
// It NEVER writes profile data, alters difficulty, or silently repeats completed cases.
function hash(value){let h=2166136261;for(const char of String(value)){h=Math.imul(h^char.charCodeAt(0),16777619)>>>0;}return h;}
const identity=x=>String(x.caseId??x.id??'');
const cluster=x=>String(x.semanticClusterId||'unclassified:'+identity(x));
const mechanism=x=>String(x.mechanismId||x.mechanism||'unclassified');
const structure=x=>String(x.structureId||x.structure||'unclassified');
function choose({candidates,exposures=[],seed='gliax',plannedReview=null}){
 if(!Array.isArray(candidates)||!Array.isArray(exposures))throw new TypeError('Expected candidate and exposure arrays');
 const unique=new Map();
 for(const x of candidates){const id=identity(x);if(!id)throw new TypeError('Candidate missing id');if(!unique.has(id))unique.set(id,x);}
 const all=[...unique.values()];
 if(!all.length)return {item:null,reason:'no_eligible_cases',eligible:0,unseen:0,unclassifiedClusters:0};
 const known=exposures.filter(e=>e&&typeof e.caseId==='string');
 const seen=new Set(known.map(e=>e.caseId));
 const unseen=all.filter(x=>!seen.has(identity(x)));
 const unclassifiedClusters=all.filter(x=>!x.semanticClusterId).length;
 if(plannedReview!==null){
   if(!['reinforcement','spaced_review','transfer'].includes(plannedReview?.reason))throw new TypeError('Invalid review purpose');
   const item=all.find(x=>identity(x)===plannedReview.caseId);
   if(!item||!seen.has(identity(item)))return {item:null,reason:'invalid_review',eligible:all.length,unseen:unseen.length,unclassifiedClusters};
   return {item,reason:'planned_'+plannedReview.reason,eligible:all.length,unseen:unseen.length,unclassifiedClusters};
 }
 if(!unseen.length)return {item:null,reason:'coverage_exhausted',eligible:all.length,unseen:0,unclassifiedClusters};
 const seenClusters=new Set(known.map(x=>x.semanticClusterId).filter(Boolean));
 const newCluster=unseen.filter(x=>!seenClusters.has(cluster(x)));
 const pool=newCluster.length?newCluster:unseen;
 const stats=(key,value)=>known.filter(x=>x[key]===value).length;
 const last=(key,value)=>known.findIndex(x=>x[key]===value);
 const ordered=[...pool].sort((a,b)=>{
   const score=x=>{
      const c=cluster(x),m=mechanism(x),s=structure(x);
      return stats('semanticClusterId',c)*8+stats('mechanismId',m)*3+stats('structureId',s);
   };
   const aa=score(a),bb=score(b);
   if(aa!==bb)return aa-bb;
   // History is supplied newest-first; prefer candidates whose mechanism was used least recently.
   const ra=last('mechanismId',mechanism(a)),rb=last('mechanismId',mechanism(b));
   if(ra!==rb)return (ra<0?-100000:ra)>(rb<0?-100000:rb)?-1:1;
   return hash(seed+':'+identity(a))-hash(seed+':'+identity(b));
 });
 return {item:ordered[0],reason:newCluster.length?'new_semantic_cluster':'new_case',eligible:all.length,unseen:unseen.length,unclassifiedClusters};
}
function record(item,{at=new Date().toISOString(),reason='new_case'}={}){
 if(!item||!identity(item))throw new TypeError('Missing exercise');
 return {caseId:identity(item),semanticClusterId:cluster(item),mechanismId:mechanism(item),structureId:structure(item),presentedAt:at,reason};
}
const api={choose,record};
root.GliaxR194Scheduler=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

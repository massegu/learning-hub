const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const privacy=require('../js/privacy-controls');
test('independent profile starts fresh and does not mutate the tracked learner',()=>{
 const p={id:'learner',name:'P-024',age_band:'primary',progress:{ageRoute:'junior',initialLevel:2,history:[{correct:true}],interactiveObservations:[{description:'private text',report:'described'}]}};
 const s=privacy.independent(p);assert.equal(s.name,'Sesión independiente');assert.equal(s.progress.ageRoute,'junior');assert.equal(s.progress.initialLevel,2);assert.equal(s.progress.history,undefined);assert.equal(s._sessionOnly,true);
 s.progress.history=[{correct:false}];assert.equal(p.progress.history[0].correct,true);
 const minimized=privacy.minimize(p.progress);assert.equal(minimized.interactiveObservations[0].description,undefined);assert.equal(p.progress.interactiveObservations[0].description,'private text');
});
test('API suppresses independent writes and retains ambiguous result attempts for safe retries',async()=>{
 const writes=[],values=new Map(),localStorage={get length(){return values.size},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)},client={auth:{},from(table){const q={select(){return q},eq(){return q},single(){return Promise.resolve({data:{progress:{}}})},update(value){writes.push({table,value});return q},upsert(value){writes.push({table,value});return q},then(resolve){return Promise.resolve({data:null}).then(resolve)}};return q;}};
 const ctx={structuredClone,PrivacyControls:privacy,LH_CONFIG:{},localStorage,crypto:{randomUUID:()=> 'aaaaaaaa-1111-4111-8111-111111111111'},supabase:{createClient:()=>client}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync('js/api.js','utf8'),ctx);const api=ctx.LearningAPI;api.user={id:'owner'};
 api.setIndependent('learner');await api.saveProgress('learner',{history:[]});await api.saveResult('learner',{correct:true});assert.equal(writes.length,0);
 api.setIndependent(null);await api.saveProgress('learner',{_sessionOnly:true,history:[]});await api.saveResult('learner',{sessionOnly:true,correct:true});assert.equal(writes.length,0);
 await api.saveProgress('learner',{interactiveObservations:[{description:'private text',report:'described'}]});assert.equal(writes.length,1);assert.equal(writes[0].value.progress.interactiveObservations[0].description,undefined);
 let attempts=0;client.from=table=>{const q={upsert(){return q},then(resolve){attempts++;return Promise.resolve(attempts===1?{error:new Error('ambiguous network response')}:{data:null,error:null}).then(resolve)}};return q;};
 await assert.rejects(api.saveResult('learner',{correct:true,ts:'2026-11-06T00:00:00Z'}),/ambiguous network response/);assert.equal(attempts,1,'the client performs one initial attempt and keeps its ID for a safe retry');
 assert.equal(api.pendingResults('learner').length,1);assert.equal((await api.retryPendingResults('learner')).confirmed,1);assert.equal(attempts,2);
});
test('progress snapshots are serialized per profile and preserve the fourth attempt as final state',async()=>{
 const profiles={learner:{id:'learner',progress:{}},other:{id:'other',progress:{}}},started=[],completed=[];
 const client={auth:{},from(table){let id,patch;const q={select(){return q},eq(k,v){if(k==='id')id=v;return q},single(){return Promise.resolve({data:profiles[id]})},update(v){patch=v;return q},then(resolve){const count=patch.progress.totalAttempts;started.push([id,count]);const delay=count===3?35:count===4?5:0;return new Promise(done=>setTimeout(()=>{profiles[id].progress=patch.progress;completed.push([id,count]);done({error:null});},delay)).then(resolve)}};return q;}};
 const ctx={structuredClone,PrivacyControls:privacy,LH_CONFIG:{},supabase:{createClient:()=>client}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync('js/api.js','utf8'),ctx);const api=ctx.LearningAPI;
 const writes=[];
 for(let attempt=1;attempt<=4;attempt++)writes.push(api.saveProgress('learner',{totalAttempts:attempt,history:Array.from({length:attempt},(_,i)=>({attemptNumber:i+1}))}));
 await Promise.all(writes);
 assert.deepEqual(completed.map(x=>x[1]),[1,2,3,4]);assert.equal(profiles.learner.progress.totalAttempts,4);assert.equal(profiles.learner.progress.history.length,4);
 const first=api.saveProgress('learner',{totalAttempts:5,history:[]}),second=api.saveProgress('other',{totalAttempts:1,history:[]});
 await Promise.all([first,second]);assert.ok(started.some(([id])=>id==='other'));assert.equal(profiles.learner.progress.totalAttempts,5);
});
test('content service keeps only account usage for an independent session',async()=>{
 const {context}=require('./edge-harness')(),writes=[];
 context.Deno.env.get=()=> 'offline';context.createClient=()=>({auth:{getUser:async()=>({data:{user:{id:'owner'}}})},from(table){let value,mutate=false;const q={select(){return q},eq(){return q},like(){return q},limit(){return q},order(){return q},update(v){mutate=true;value=v;return q},insert(v){mutate=true;value=v;return q},upsert(v){mutate=true;value=v;return q},single(){return Promise.resolve(result())},maybeSingle(){return Promise.resolve(result())},then(a,b){return Promise.resolve(result()).then(a,b)}};function result(){if(mutate){writes.push({table,value});return {data:null};}return {data:table==='learner_profiles'?{id:'learner',account_id:'owner',age_band:'primary',progress:{ageRoute:'junior'}}:table==='accounts'?{subscription_status:'active',content_locale:'es_es'}:table==='content_usage'?{used:0}:[]};}return q;}});
 const request=async(extra)=>{writes.length=0;const r=await context.handler(new Request('https://offline.invalid',{method:'POST',headers:{Authorization:'Bearer offline','Content-Type':'application/json'},body:JSON.stringify({kind:'exercise',profile_id:'learner',domain:'social',level:1,count:1,client_revision:6,...extra})}));return {status:r.status,data:await r.json()};};
 assert.equal((await request({session_only:'true'})).status,400);assert.equal(writes.length,0);
 assert.equal((await request({session_only:true,client_revision:5})).status,409);assert.equal(writes.length,0);
 const ephemeral=await request({session_only:true});assert.equal(ephemeral.status,200,JSON.stringify(ephemeral));assert.deepEqual(writes.map(x=>x.table),['content_usage']);assert.equal(writes[0].value.profile_id,undefined);
 const tracked=await request({});assert.equal(tracked.status,200);assert.ok(writes.some(x=>x.table==='learner_profiles'));assert.ok(writes.some(x=>x.table==='content_seen'));
});

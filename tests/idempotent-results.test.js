const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const privacy=require('../js/privacy-controls');
const CLIENT_ID='aaaaaaaa-1111-4111-8111-111111111111';

function makeStorage(){
 const values=new Map();
 return {get length(){return values.size},key:index=>[...values.keys()][index]??null,getItem:key=>values.get(String(key))??null,setItem:(key,value)=>values.set(String(key),String(value)),removeItem:key=>values.delete(String(key)),clear:()=>values.clear(),values};
}
function makeClient(shared={rows:new Map(),calls:[],nextError:null}){
 const client={auth:{},shared,from(table){
  if(table!=='exercise_results')throw new Error(`Unexpected table ${table}`);
  let payload,options;
  const query={upsert(value,opts){payload=value;options=opts;return query},then(resolve,reject){
   const run=async()=>{
    shared.calls.push({payload:{...payload},options:{...options}});
    const failure=shared.nextError;shared.nextError=null;
    if(failure==='after-insert'){
     const key=`${payload.profile_id}:${payload.client_attempt_id}`;if(!shared.rows.has(key))shared.rows.set(key,{...payload});
     throw new Error('socket closed after server commit');
    }
    if(failure){const error=failure instanceof Error?failure:{message:'insert rejected',...failure};return {error};}
    const key=`${payload.profile_id}:${payload.client_attempt_id}`;
    if(!shared.rows.has(key))shared.rows.set(key,{...payload});
    return {data:null,error:null};
   };
   return Promise.resolve().then(run).then(resolve,reject);
  }};
  return query;
 }};
 return client;
}
function loadApi({storage=makeStorage(),shared,userId='account-a',ids=[CLIENT_ID]}={}){
 const client=makeClient(shared||{rows:new Map(),calls:[],nextError:null});let next=0;
 const context={structuredClone,PrivacyControls:privacy,LH_CONFIG:{},localStorage:storage,crypto:{randomUUID:()=>ids[next++]||'bbbbbbbb-2222-4222-8222-222222222222'},supabase:{createClient:()=>client}};
 context.window=context;context.CustomEvent=class{};vm.createContext(context);vm.runInContext(fs.readFileSync('js/api.js','utf8'),context);
 const api=context.LearningAPI;api.user={id:userId};
 return {api,context,client,storage,shared:client.shared};
}
const result=(overrides={})=>({clientAttemptId:CLIENT_ID,ts:'2026-11-09T10:00:00.000Z',sessionId:'session-1',sessionStartedAt:'2026-11-09T09:00:00.000Z',subject:'attention',level:2,correct:true,points:10,itemId:'item-1',detail:'choice',...overrides});

test('normal result save uses a stable UUID, stores only the minimum retry payload, and clears confirmed outbox data',async()=>{
 const env=loadApi();
 const saved=await env.api.saveResult('profile-1',result({answerText:'free text must not be stored',name:'child name'}));
 assert.equal(saved.state,'confirmed');assert.equal(saved.clientAttemptId,CLIENT_ID);
 assert.equal(env.shared.rows.size,1);assert.equal(env.shared.calls[0].payload.client_attempt_id,CLIENT_ID);
 assert.deepEqual(env.shared.calls[0].options,{onConflict:'profile_id,client_attempt_id',ignoreDuplicates:true});
 assert.deepEqual(JSON.parse(JSON.stringify(env.api.pendingResults('profile-1'))),[]);assert.equal(env.storage.length,0);
 assert.ok(!JSON.stringify([...env.storage.values.values()]).includes('child name'));
 assert.ok(!JSON.stringify([...env.storage.values.values()]).includes('free text'));
});

test('lost response after commit is recovered after reload with the same ID and never overwrites the first answer',async()=>{
 const storage=makeStorage(),shared={rows:new Map(),calls:[],nextError:'after-insert'};
 const first=loadApi({storage,shared});
 await assert.rejects(first.api.saveResult('profile-1',result()),error=>error.state==='uncertain'&&error.clientAttemptId===CLIENT_ID);
 const pending=first.api.pendingResults('profile-1');assert.equal(pending.length,1);assert.equal(pending[0].client_attempt_id,CLIENT_ID);assert.equal(pending[0].state,'uncertain');
 assert.ok(!JSON.stringify(pending[0]).includes('answerText'));
 assert.ok(!JSON.stringify(pending[0]).includes('child name'));
 const reloaded=loadApi({storage,shared,ids:['cccccccc-3333-4333-8333-333333333333']});
 assert.equal(reloaded.api.pendingResults('profile-1').length,1,'the outbox survives a page reload for the same account');
 const recovered=await reloaded.api.retryPendingResults('profile-1');
 assert.deepEqual(JSON.parse(JSON.stringify(recovered)),{attempted:1,confirmed:1,failed:0,uncertain:0,remaining:0});assert.equal(shared.rows.size,1);
 await reloaded.api.saveResult('profile-1',result({correct:false,points:0}));
 const row=[...shared.rows.values()][0];assert.equal(row.correct,true);assert.equal(row.points,10,'a duplicate ID cannot overwrite a confirmed answer');assert.equal(shared.rows.size,1);
});

test('concurrent duplicate submissions create one row while separate attempts for a profile keep both answers',async()=>{
 const storage=makeStorage(),shared={rows:new Map(),calls:[],nextError:null};
 const first=loadApi({storage,shared,ids:[CLIENT_ID,'bbbbbbbb-2222-4222-8222-222222222222']}),second=loadApi({storage,shared,ids:[CLIENT_ID]});
 await Promise.all([first.api.saveResult('profile-1',result()),second.api.saveResult('profile-1',result())]);
 assert.equal(shared.rows.size,1);assert.equal(shared.calls.length,2,'separate client queues may concurrently submit the same attempt');
 await first.api.saveResult('profile-1',result({clientAttemptId:'bbbbbbbb-2222-4222-8222-222222222222',correct:false,points:0,itemId:'item-2'}));
 assert.equal(shared.rows.size,2);assert.deepEqual([...shared.rows.values()].map(row=>row.correct).sort(),[false,true]);
});

test('recovery isolates accounts and profiles and independent sessions never enter the outbox',async()=>{
 const storage=makeStorage(),shared={rows:new Map(),calls:[],nextError:new Error('network unavailable')};
 const owner=loadApi({storage,shared});
 await assert.rejects(owner.api.saveResult('profile-1',result()));
 assert.equal(owner.api.pendingResults('profile-1').length,1);
 assert.equal((await owner.api.retryPendingResults('profile-2')).attempted,0);
 const otherAccount=loadApi({storage,shared,userId:'account-b'});
 assert.deepEqual(JSON.parse(JSON.stringify(otherAccount.api.pendingResults('profile-1'))),[]);
 owner.api.setIndependent('profile-1');
 assert.equal(await owner.api.saveResult('profile-1',result({clientAttemptId:'bbbbbbbb-2222-4222-8222-222222222222',sessionOnly:true})),false);
 assert.equal(owner.storage.length,1,'independent work does not add records to the tracked outbox');assert.equal(shared.rows.size,0);
 owner.api.setIndependent(null);assert.equal(owner.api.pendingResults('profile-1').length,1);
});

test('definitive database errors remain failed for manual retry; network errors are uncertain',async()=>{
 const env=loadApi({shared:{rows:new Map(),calls:[],nextError:{status:403,code:'42501',message:'row policy denied'}}});
 await assert.rejects(env.api.saveResult('profile-1',result()),error=>error.state==='failed');
 assert.equal(env.api.pendingResults('profile-1')[0].state,'failed');
 assert.equal((await env.api.retryPendingResults('profile-1')).attempted,0,'definitive failures are not retried automatically');
 env.shared.nextError=null;
 assert.deepEqual(JSON.parse(JSON.stringify(await env.api.retryPendingResults('profile-1',{includeFailed:true}))),{attempted:1,confirmed:1,failed:0,uncertain:0,remaining:0});
});

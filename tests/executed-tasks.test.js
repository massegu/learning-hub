const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const tasks=require('../js/executed-tasks'),model=require('../js/activity-model'),locale=require('../js/locale-content'),load=require('./edge-harness');
const ages=['early','junior','primary','middle','teen'];
test('all nine executed mechanics have bounded age/level loads, two contexts and valid printable sources',()=>{
 assert.equal(fs.readFileSync(require.resolve('../js/executed-tasks'),'utf8'),fs.readFileSync(require.resolve('../supabase/functions/request-learning-content/executed-tasks'),'utf8'));
 let count=0;for(const age of ages)for(const domain of ['attention','memory','executive'])for(const level of [1,2,3]){
  const bank=tasks.pool(age,domain,level);assert.equal(bank.length,6);
  for(const item of bank){assert.ok(item.primaryConstruct);assert.ok(item.secondaryLoads.length);assert.ok(item.readingDemand);assert.ok(item.visualDemand);assert.ok(item.motorDemand);
   const p={age_band:age==='early'?'primary':age,progress:{ageRoute:age}};
   for(const country of Object.keys(locale.labels)){const it=locale.localizeItem(item,country,domain);assert.ok(tasks.validate(it,age));assert.equal(model.printable(it,p).responseType,'written');model.forDelivery(it,p,domain);}
   assert.throws(()=>tasks.validate({...item,execution:{...item.execution,answer:['changed']}}));assert.throws(()=>tasks.validate({...item,stimulus:[]}));assert.throws(()=>tasks.validate({...item,type:'standard'}));
   assert.throws(()=>model.forDelivery(item,{age_band:age==='teen'?'middle':'teen'},domain));
   if(age==='early'){assert.ok(item.execution.cells.length<=6);assert.ok(!item.execution.sequence||item.execution.sequence.length<=3);assert.ok(!item.execution.steps||item.execution.steps.length<=3);}
   count++;
  }
 }
 assert.equal(count,270);
});
test('answers follow the displayed grids, memory updates, rules and plan dependencies',()=>{
 for(const age of ages)for(const domain of ['attention','memory','executive'])for(const level of [1,2,3])for(const item of tasks.pool(age,domain,level)){
  const t=item.execution;let expected;
  if(t.kind==='cancel')expected=t.cells.flatMap((x,i)=>t.targets.includes(x)?[String(i)]:[]);
  if(t.kind==='compare')expected=t.cells.flatMap((x,i)=>x!==t.after[i]?[String(i)]:[]);
  if(t.kind==='follow'||t.kind==='serial')expected=t.reverse?[...t.sequence].reverse():t.sequence;
  if(t.kind==='update'){expected=[...t.sequence];expected[t.replaceIndex]=t.replacement;if(t.reverse)expected.reverse();assert.equal(item.primaryConstruct,'workingMemory');}
  if(t.kind==='spatial')expected=t.cells.flatMap((x,i)=>x?[String(i)]:[]);
  if(t.kind==='plan'){expected=t.steps;for(const [a,b] of t.dependencies)assert.ok(a<b);}
  if(t.kind==='inhibit')expected=t.trials.map(x=>x.symbol==='libro'?'act':'wait');
  if(t.kind==='switch')expected=t.trials.map(x=>x.reversed?(x.symbol==='libro'?'B':'A'):(x.symbol==='libro'?'A':'B'));
  assert.ok(tasks.grade(item,expected),item.contentKey);assert.equal(tasks.grade(item,['incorrect']),false);assert.equal(tasks.grade(item,[]),false);
 }
});
function handler(){const {context}=load();let writes=0;const p={id:'p',account_id:'u',age_band:'primary',progress:{ageRoute:'early'}};context.Deno.env.get=()=> 'offline';context.createClient=()=>({auth:{getUser:async()=>({data:{user:{id:'u'}}})},from(table){let mutation=false;const q={select(){return q},eq(){return q},like(){return q},order(){return q},limit(){return q},insert(){mutation=true;return q},update(){mutation=true;return q},upsert(){mutation=true;return q},single(){return Promise.resolve(result())},maybeSingle(){return Promise.resolve(result())},then(a,b){return Promise.resolve(result()).then(a,b)}};function result(){if(mutation){writes++;return {data:null,error:null};}return {data:table==='learner_profiles'?p:table==='accounts'?{subscription_status:'active',content_locale:'es_es'}:table==='content_usage'?{used:0}:[],error:null};}return q;}});return {context,p,writes:()=>writes,request:body=>context.handler(new Request('https://offline.invalid',{method:'POST',headers:{Authorization:'Bearer offline','Content-Type':'application/json'},body:JSON.stringify({profile_id:'p',kind:'exercise',domain:'memory',level:1,client_revision:9,executed_only:true,...body})}))};}
test('real authenticated handler gates new mode by client revision, domain and incompatible flags',async()=>{
 const h=handler();for(const extra of [{client_revision:8},{domain:'language'},{kind:'worksheet'},{executed_only:'true'},{photos_only:true},{interaction_only:true}]){const r=await h.request(extra);assert.ok([400,409].includes(r.status));assert.equal(h.writes(),0);}
 for(const age of ages)for(const domain of ['attention','memory','executive']){h.p.age_band=['early','junior'].includes(age)?'primary':age;h.p.progress={ageRoute:age};const r=await h.request({domain});assert.equal(r.status,200);const data=await r.json();assert.equal(data.items.length,1);assert.equal(data.items[0].type,'executed');assert.ok(tasks.validate(data.items[0],age));}
});

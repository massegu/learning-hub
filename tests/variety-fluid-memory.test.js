const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const load=require('./edge-harness'),c=require('../js/curriculum'),early=require('../js/early-content'),photo=require('../js/photo-library'),model=require('../js/activity-model'),locale=require('../js/locale-content');
test('youngest memory association/sequence loads grow from two to four and photos start at ten seconds',()=>{
 for(const level of [1,2,3]){
  const bank=c.pool('early','memory',level).filter(x=>['memory_association','memory_sequence'].includes(x.mechanic));assert.ok(bank.length);
  for(const it of bank)assert.equal(it.memoryContent.length,level+1);
 }
 for(const age of ['junior','primary','middle','teen'])for(const it of photo.pool(age,'memory',1))assert.equal(it.revealMs,10000);
 const it=photo.generate('middle','memory',1);it.q='changed';assert.ok(photo.pool('middle','memory',1).every(x=>x.q!=='changed'));
});
test('finite scene selection rotates every scene before reuse, then uses the least recently seen material',()=>{
 const {api}=load(),bank=photo.pool('middle','memory',1),history=[];
 const take=()=>{const it=api.generatedItems('memory',1,history,()=>{throw Error('No random resampling needed')},structuredClone(bank))[0];history.push(api.contentSignature('memory',it),'memory:mechanic:memory_photo');return it.photoTask.sceneId;};
 const first=Array.from({length:14},take);assert.equal(new Set(first).size,14);
 const second=Array.from({length:14},take);assert.deepEqual(second,first);
});
test('authored plans and omissions are valid age-specific activities with source-bound answers',()=>{
 const {api}=load(),distinct=new Set();
 for(const age of ['early','junior','primary','middle','teen'])for(const level of [1,2,3])for(const domain of ['memory','attention','executive']){
  const items=c.practice(age,domain,level);assert.ok(items.length>=8);
  for(const it of items){
   assert.equal(api.validateItem(it),true,JSON.stringify(it));
   for(const country of ['es_intl','es_es'])assert.doesNotThrow(()=>model.forDelivery(locale.localizeItem(it,country,domain),{age_band:age,progress:{ageRoute:age}},domain));
   distinct.add(JSON.stringify([domain,it.q,it.stimulus,it.a,it.answer]));
  }
 }
 assert.ok(distinct.size>=200,distinct.size);
 for(const level of [1,2,3])assert.equal(early.pool('attention',level).filter(it=>it.contentKey?.includes('practice-')).length,c.practice('early','attention',level).length);
 for(const name of ['photo-library.js','curriculum.js'])assert.equal(fs.readFileSync('js/'+name,'utf8'),fs.readFileSync('supabase/functions/request-learning-content/'+name,'utf8'));
});
test('a failed seen-history query uses persisted profile rotation across dates rather than silently repeating scenes',async()=>{
 const {context}=load(),profile={id:'learner',account_id:'owner',age_band:'middle',progress:{_delivery:{date:'2026-01-01',seen:{memory:[]}}}},writes=[];
 context.Deno.env.get=()=> 'offline';context.console={...console,warn(){}};
 context.createClient=()=>({auth:{getUser:async()=>({data:{user:{id:'owner'}}})},from(table){let op,value;const q={select(){return q},eq(){return q},order(){return q},limit(){return q},update(v){op='update';value=v;return q},insert(v){op='insert';value=v;return q},upsert(v){op='upsert';value=v;return q},single(){return Promise.resolve(result())},maybeSingle(){return Promise.resolve(result())},then(a,b){return Promise.resolve(result()).then(a,b)}};
  function result(){if(op){writes.push(table);if(table==='learner_profiles')Object.assign(profile,value);return {data:null};}if(table==='content_seen')return {data:null,error:{message:'permission denied'}};return {data:table==='learner_profiles'?profile:table==='accounts'?{subscription_status:'active',content_locale:'es_intl'}:table==='content_usage'?{used:0}:[]};}return q;}});
 const shown=[],questions=[];
 for(let i=0;i<16;i++){
  const r=await context.handler(new Request('https://offline.invalid',{method:'POST',headers:{Authorization:'Bearer offline','Content-Type':'application/json'},body:JSON.stringify({kind:'exercise',profile_id:'learner',domain:'memory',level:1,count:1,client_revision:5,photos_only:true})}));
  const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));shown.push(data.items[0].photoTask.sceneId);questions.push(data.items[0].memoryQuestion);
 }
 assert.equal(new Set(shown.slice(0,14)).size,14);assert.deepEqual(shown.slice(14),shown.slice(0,2));assert.ok(writes.includes('learner_profiles'));assert.notEqual(profile.progress._delivery.date,'2026-01-01');assert.notEqual(questions[14],questions[0]);assert.notEqual(questions[15],questions[1]);
});

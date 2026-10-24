const test=require('node:test'),assert=require('node:assert/strict');
const c=require('../js/curriculum'),model=require('../js/activity-model'),locale=require('../js/locale-content'),load=require('./edge-harness');
test('new processing families have one factually correct answer at each age/level and every locale',()=>{
 for(const age of ['junior','primary','middle','teen'])for(const level of [1,2,3]){
  const bank=c.processingChallenges(age,level);assert.equal(new Set(bank.map(x=>x.speedFamily)).size,3);
  for(const it of bank){assert.doesNotThrow(()=>c.validateSpeed(it));for(const country of Object.keys(locale.labels))assert.doesNotThrow(()=>model.forDelivery(locale.localizeItem(it,country,'speedReasoning'),{age_band:age,progress:{ageRoute:age}},'speedReasoning'));
   const bad=structuredClone(it);bad.a=bad.opts.find(x=>x!==bad.a);assert.throws(()=>c.validateSpeed(bad));
  }
 }
 const agenda=c.processingChallenges('teen',3).find(x=>x.speedFamily==='rapidAgenda'),bad=structuredClone(agenda);bad.stimulus[1].rows.push([...bad.stimulus[1].rows.find(r=>r[0]===bad.a)]);assert.throws(()=>c.validateSpeed(bad));
 const rule=c.processingChallenges('primary',3).find(x=>x.speedFamily==='ruleChoice');rule.stimulus[0].rows[1][1]='Consonante';assert.throws(()=>c.validateSpeed(rule));
});
test('environment search is explicitly observed and cannot enter scored speed pools or invent a different clue',()=>{
 for(const age of ['junior','primary','middle','teen'])for(const level of [1,2,3]){
  assert.ok(!c.pool(age,'speedReasoning',level).some(x=>x.roomSpeedTask));
  for(const it of c.roomSpeedPool(age,level)){assert.equal(it.speedTask,undefined);assert.equal(it.assessment,'observation');for(const country of Object.keys(locale.labels))assert.doesNotThrow(()=>model.forDelivery(locale.localizeItem(it,country,'speedReasoning'),{age_band:age,progress:{ageRoute:age}},'speedReasoning'));const bad=structuredClone(it);bad.roomSpeedTask.clue='otro objeto';assert.throws(()=>c.validateRoomSpeed(bad));}
 }
 assert.equal(c.roomSpeedPool('early',1).length,0);
});
test('plans are distinct source blocks and paper category prompts refer to elements rather than absent images',()=>{
 const task=c.practice('middle','attention',2).find(x=>x.mechanic==='attention_plan_intruder');assert.ok(!task.stimulus[0].text.includes('prepara para preparar'));assert.equal(task.stimulus[1].label,'Plan acordado');assert.equal(task.stimulus[2].label,'Lista que debes revisar');assert.equal(task.stimulus[1].items.length,3);
 const altered=c.pool('middle','speedReasoning',1).find(x=>x.speedFamily==='category');altered.paperQuestion='¿Son frutas todos los elementos?';assert.throws(()=>c.validateSpeed(altered));
 for(const age of ['early','junior','primary','middle','teen'])for(const it of c.pool(age,'speedReasoning',1).filter(x=>x.speedFamily==='category'))assert.match(it.paperQuestion,/elementos de la lista/);
});
test('real handler gates observed environment requests by revision, route and domain',async()=>{
 const {context}=load();context.Deno.env.get=()=> 'offline';context.createClient=()=>({auth:{getUser:async()=>({data:{user:{id:'owner'}}})},from(table){const q={select(){return q},eq(){return q},limit(){return q},order(){return q},insert(){return q},update(){return q},upsert(){return q},single(){return Promise.resolve(data())},maybeSingle(){return Promise.resolve(data())},then(a,b){return Promise.resolve(data()).then(a,b)}};function data(){return {data:table==='learner_profiles'?{id:'learner',account_id:'owner',age_band:'middle',progress:{}}:table==='accounts'?{subscription_status:'active',content_locale:'es_es'}:table==='content_usage'?{used:0}:[]}}return q;}});
 const request=async(extra)=>{const r=await context.handler(new Request('https://offline.invalid',{method:'POST',headers:{Authorization:'Bearer offline','Content-Type':'application/json'},body:JSON.stringify({profile_id:'learner',kind:'exercise',domain:'speedReasoning',level:2,count:1,client_revision:7,room_speed_only:true,...extra})}));return {status:r.status,data:await r.json()};};
 let r=await request({});assert.equal(r.status,200,JSON.stringify(r));assert.ok(r.data.items[0].roomSpeedTask);assert.equal((await request({client_revision:5})).status,409);assert.equal((await request({domain:'attention'})).status,400);assert.equal((await request({room_speed_only:'true'})).status,400);r=await request({room_speed_only:false});assert.equal(r.status,200);assert.ok(!r.data.items[0].roomSpeedTask);
});

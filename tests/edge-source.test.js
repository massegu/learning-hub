const test=require('node:test'),assert=require('node:assert/strict');
const load=require('./edge-harness');
test('real generator series, alternating patterns, equal quantities and rule targets derive from their stimuli',()=>{
  const {api}=load();
  for(const age of ['junior','primary','middle'])for(const level of [1,2,3])for(let k=0;k<20;k++){
    const series=api.matrixReasoning18(age,level,k*18);
    const numbers=series.scenario.split(' · ').slice(0,-1).map(Number);
    assert.equal(Number(series.a),numbers.at(-1)+(numbers[1]-numbers[0]));
    const pattern=api.matrixReasoning18(age,level,k*18+4);
    const units=pattern.scenario.split(' ').filter(x=>x!=='__');
    assert.equal(pattern.a,units[(units.length)%2]);
    const comparison=api.matrixReasoning18(age,level,k*18+1),[a,b]=comparison.scenario.trim().split(/\s+/).map(Number);
    assert.equal(comparison.a,a===b?'Son iguales':String(Math.max(a,b)));
    if(age!=='junior'){
      const rule=api.matrixAttention18(age,level,k*18+3);
      const rows=[...rule.scenario.matchAll(/([A-D])\) (azul|rojo|verde)-(\d+)/g)];
      const valid=rows.filter(row=>row[2]==='azul'&&Number(row[3])%2===0);
      assert.equal(valid.length,1);assert.equal(rule.a,valid[0][1]);
      const compare=api.matrixAttention18(age,level,k*18+9),lines=compare.scenario.split('\n');
      const model=lines[0].slice(8),matching=lines.slice(1).filter(line=>line.slice(3)===model);
      assert.equal(matching.length,1);assert.ok(matching[0].startsWith(compare.a+':'));
    }
  }
});
test('server no longer invents printable recall material from an answer',()=>{
  const {api}=load(),it={type:'memoryReveal',memoryContent:[],memoryQuestion:'¿Qué objeto estaba en la lista?',opts:['libro','pelota'],a:'libro'};
  api.ensureWorksheetMemoryCoherence(it);assert.equal(it.memoryContent.length,0);assert.equal(api.validateItem(it),false);
});
test('geometry is geometry with real level-dependent calculations, and standalone numeric prompts print explicitly',()=>{
  const {api}=load(),model=require('../js/activity-model');
  for(const level of [1,2,3])for(let v=0;v<300;v++){
    const it=api.geometry(level,v),base=Number(it.stimulus[1].rows[0][1].split(' ')[0]),height=Number(it.stimulus[1].rows[1][1].split(' ')[0]);
    const answer=level===1?2*(base+height):level===2?base*height:base*height/2;
    assert.equal(Number(it.a.split(' ')[0]),answer);
    assert.doesNotThrow(()=>model.printable(it,{age_band:'primary'}));
  }
  assert.doesNotThrow(()=>model.printable(api.variantMath('junior','division',1,0),{age_band:'primary',progress:{ageRoute:'junior'}}));
});
function authorized(){
  const {context}=load(),writes=[];
  const profile={id:'p',account_id:'u',age_band:'primary',progress:{ageRoute:'junior'}};
  const account={subscription_status:'active',content_locale:'es_es'},usage={used:0};
  const admin={auth:{getUser:async()=>({data:{user:{id:'u'}}})},from(table){
    let operation,values;
    const q={select(){return q},eq(){return q},like(){return q},order(){return q},limit(){return q},
      insert(v){operation='insert';values=v;return q},update(v){operation='update';values=v;return q},upsert(v){operation='upsert';values=v;return q},
      single(){return Promise.resolve(result())},maybeSingle(){return Promise.resolve(result())},then(a,b){return Promise.resolve(result()).then(a,b)}};
    function result(){if(operation){writes.push({table,operation,values});return {data:null,error:null};}
      return {data:table==='learner_profiles'?profile:table==='accounts'?account:table==='content_usage'?usage:[],error:null};}
    return q;
  }};
  context.createClient=()=>admin;context.Deno.env.get=()=> 'offline-test-placeholder';
  const request=body=>context.handler(new Request('https://offline.invalid/function',{method:'POST',headers:{Authorization:'Bearer mock','Content-Type':'application/json'},body:JSON.stringify({profile_id:'p',kind:'exercise',level:1,...body})}));
  return {context,profile,account,usage,writes,request};
}
test('real handler enforces saved age-route domains, ownership and quota without any production calls',async()=>{
  const h=authorized();
  let response=await h.request({domain:'social'});assert.equal(response.status,400);assert.equal(h.writes.length,0);
  h.profile.account_id='other';response=await h.request({domain:'attention'});assert.equal(response.status,404);assert.equal(h.writes.length,0);
  h.profile.account_id='u';h.usage.used=500;response=await h.request({domain:'attention'});assert.equal(response.status,403);assert.equal(h.writes.length,0);
  h.usage.used=0;response=await h.request({domain:'attention'});assert.equal(response.status,200);
  const result=await response.json();assert.equal(result.items.length,1);assert.ok(!result.subjects.includes('geometry'));
  assert.equal(h.writes.find(w=>w.table==='content_usage').values.used,1);
});
test('real worksheet handler reports exhaustion instead of committing a within-sheet duplicate',async()=>{
  const h=authorized();
  const response=await h.request({kind:'worksheet',domains:['reading'],questions:20});
  assert.equal(response.status,422);assert.match((await response.json()).error,/suficientes actividades distintas/);
  assert.equal(h.writes.length,0);
});

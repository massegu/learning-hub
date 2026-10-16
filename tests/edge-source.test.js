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
  const {context}=load(),writes=[],seenRows=[];
  const profile={id:'p',account_id:'u',age_band:'primary',progress:{ageRoute:'junior'}};
  const account={subscription_status:'active',content_locale:'es_es'},usage={used:0};
  const admin={auth:{getUser:async()=>({data:{user:{id:'u'}}})},from(table){
    let operation,values;
    const q={select(){return q},eq(){return q},like(){return q},order(){return q},limit(){return q},
      insert(v){operation='insert';values=v;return q},update(v){operation='update';values=v;return q},upsert(v){operation='upsert';values=v;return q},
      single(){return Promise.resolve(result())},maybeSingle(){return Promise.resolve(result())},then(a,b){return Promise.resolve(result()).then(a,b)}};
    function result(){if(operation){writes.push({table,operation,values});return {data:null,error:null};}
      return {data:table==='learner_profiles'?profile:table==='accounts'?account:table==='content_usage'?usage:table==='content_seen'?seenRows:[],error:null};}
    return q;
  }};
  context.createClient=()=>admin;context.Deno.env.get=()=> 'offline-test-placeholder';
  const request=body=>context.handler(new Request('https://offline.invalid/function',{method:'POST',headers:{Authorization:'Bearer mock','Content-Type':'application/json'},body:JSON.stringify({profile_id:'p',kind:'exercise',level:1,...body})}));
  return {context,profile,account,usage,writes,seenRows,request};
}
test('saved account country controls selection before history or usage writes, including all-rejected pools',async()=>{
  const h=authorized();h.profile.age_band='teen';h.profile.progress={};h.account.content_locale='es_co';
  let response=await h.request({domain:'executive',count:10,locale:'es_es'});
  assert.equal(response.status,200);const result=await response.json();
  assert.equal(result.items.length,10);
  const locale=require('../js/locale-content');
  for(const it of result.items){assert.equal(it.localization.locale,'es_co');assert.doesNotThrow(()=>locale.localizeItem(it,'es_co','executive'));assert.doesNotMatch(JSON.stringify(it),/€|\beuros?\b/u);}
  const phone=require('../supabase/functions/request-learning-content/teen-review').pool('literacy',1).find(it=>it.teenReview.context==='interview');
  const original=h.context.Curriculum.generate;h.context.Curriculum.generate=(age,domain,level)=>domain==='literacy'?structuredClone(phone):original(age,domain,level);
  response=await h.request({domain:'literacy',locale:'es_es'});assert.equal(response.status,200);
  const phoneResult=(await response.json()).items[0];assert.match(JSON.stringify(phoneResult.stimulus),/teléfonos celulares/);assert.doesNotMatch(JSON.stringify(phoneResult.stimulus),/teléfonos móviles/);
  const blocked=authorized();blocked.account.content_locale='es_co';
  blocked.context.Curriculum.generate=()=>({id:'bad',q:'¿Cuánto queda?',scenario:'Tienes 20 euros y gastas 5.',opts:['15 euros','20 euros'],a:'15 euros'});
  blocked.context.DocumentLibrary.generate=blocked.context.Curriculum.generate;
  response=await blocked.request({domain:'executive'});assert.equal(response.status,422);assert.equal(blocked.writes.length,0);
  response=await blocked.request({kind:'worksheet',domains:['executive'],questions:6});assert.equal(response.status,422);assert.equal(blocked.writes.length,0);
});
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
  h.profile.progress.ageRoute='primary';
  const pool=require('../supabase/functions/request-learning-content/primary-content').pool('reading',1).slice(0,2);let index=0;
  h.context.PrimaryContent.generate=()=>structuredClone(pool[(index++)%pool.length]);
  const response=await h.request({kind:'worksheet',domains:['reading'],questions:20});
  assert.equal(response.status,422);assert.match((await response.json()).error,/suficientes actividades distintas/);
  assert.equal(h.writes.length,0);
});
test('actual authenticated junior handler routes skills and produces complete mixed worksheets',async()=>{
  const h=authorized(),model=require('../js/activity-model');
  for(const level of [1,2,3])for(const subdomain of ['grammar','spelling','writing']){
    const response=await h.request({domain:'language',subdomain,level,count:5});assert.equal(response.status,200);
    const data=await response.json();assert.equal(data.items.length,5);
    assert.ok(data.items.every(it=>it.languageFocus===subdomain&&it.juniorProfile.level===level));
    for(const it of data.items)assert.doesNotThrow(()=>model.printable(it,h.profile));
  }
  let response=await h.request({domain:'language',subdomain:'unknown'});assert.equal(response.status,400);
  response=await h.request({domain:'language',level:1.5});assert.equal(response.status,400);
  for(const level of [1,2,3]){
    response=await h.request({kind:'worksheet',domains:['language','reading','division','attention','memory','executive','speedReasoning','applied'],level,questions:20});
    assert.equal(response.status,200);const data=await response.json();assert.equal(data.items.length,20);
    for(const it of data.items){assert.equal(it.sourceDomain,it.domain);assert.doesNotThrow(()=>model.printable(it,h.profile));}
  }
});
test('worksheet exhaustion of recent history still uses distinct valid candidates within a sheet',async()=>{
  const h=authorized(),bank=require('../supabase/functions/request-learning-content/junior'),{api}=load();
  const pool=bank.pool('reading',1).slice(0,6);let i=0;
  h.context.JuniorContent.generate=()=>structuredClone(pool[(i++)%pool.length]);
  h.seenRows.push(...pool.map(it=>({domain:'worksheet:reading',item_signature:api.contentSignature('reading',it)})));
  const response=await h.request({kind:'worksheet',domains:['reading'],questions:6});
  assert.equal(response.status,200);const data=await response.json();
  assert.equal(new Set(data.items.map(it=>api.contentSignature('reading',it))).size,6);
});
test('authenticated primary requests route all Language skills and all eleven worksheet domains',async()=>{
  const h=authorized(),model=require('../js/activity-model');h.profile.progress.ageRoute='primary';
  for(const level of [1,2,3])for(const subdomain of ['grammar','spelling','writing']){
    const response=await h.request({domain:'language',subdomain,level,count:5});assert.equal(response.status,200);
    const data=await response.json();assert.equal(data.items.length,5);
    for(const it of data.items){assert.equal(it.languageFocus,subdomain);assert.equal(it.schoolProfile.level,level);assert.doesNotThrow(()=>model.printable(it,h.profile));}
  }
  const before=h.writes.length;let response=await h.request({domain:'language',subdomain:'unknown'});assert.equal(response.status,400);assert.equal(h.writes.length,before);
  for(const level of [1,2,3]){
    response=await h.request({kind:'worksheet',domains:['geometry','language','division','reading','english','literacy','attention','executive','memory','speedReasoning','applied'],level,questions:20});
    assert.equal(response.status,200);const data=await response.json();assert.equal(data.items.length,20);
    assert.equal(new Set(data.items.map(it=>it.sourceDomain)).size,11);
    for(const it of data.items){assert.equal(it.sourceDomain,it.domain);assert.equal(it.schoolProfile.route,'primary');assert.doesNotThrow(()=>model.printable(it,h.profile));}
  }
});
test('authenticated middle route honors Language skills and produces complete ten-domain worksheets',async()=>{
  const h=authorized(),model=require('../js/activity-model');h.profile.age_band='middle';h.profile.progress.ageRoute='middle';
  for(const level of [1,2,3])for(const subdomain of ['grammar','spelling','writing']){
    const response=await h.request({domain:'middleLanguage',subdomain,level,count:5});assert.equal(response.status,200);
    const data=await response.json();assert.equal(data.items.length,5);
    for(const it of data.items){assert.equal(it.schoolProfile.route,'middle');assert.equal(it.languageFocus,subdomain);assert.equal(it.schoolProfile.level,level);assert.doesNotThrow(()=>model.printable(it,h.profile));}
  }
  const before=h.writes.length;let response=await h.request({domain:'middleLanguage',subdomain:'unknown'});assert.equal(response.status,400);assert.equal(h.writes.length,before);
  response=await h.request({domain:'language'});assert.equal(response.status,400);assert.equal(h.writes.length,before);
  for(const level of [1,2,3]){
    response=await h.request({kind:'worksheet',domains:['middleLanguage','middleMath','middleReading','english','literacy','attention','memory','executive','speedReasoning','applied'],level,questions:20});assert.equal(response.status,200);
    const data=await response.json();assert.equal(data.items.length,20);assert.equal(new Set(data.items.map(it=>it.sourceDomain)).size,10);
    for(const it of data.items){assert.equal(it.sourceDomain,it.domain);assert.equal(it.schoolProfile.route,'middle');assert.doesNotThrow(()=>model.printable(it,h.profile));}
  }
});
test('public catalog and default worksheets use fused areas while explicit historical domains remain compatible',async()=>{
 for(const age of ['early','junior','primary','middle','teen']){
  const h=authorized();h.profile.age_band=['early','junior'].includes(age)?'primary':age;h.profile.progress={ageRoute:age};
  const response=await h.request({domain:'executive',count:5});assert.equal(response.status,200);const data=await response.json();
  assert.equal(data.subjects.includes('applied'),false);assert.equal(data.subjects.includes('speedReasoning'),true);
  if(age==='primary')assert.equal(data.subjects.includes('reading'),false);
  if(age==='middle')assert.equal(data.subjects.includes('middleReading'),false);
  const sheet=await h.request({kind:'worksheet',questions:12});assert.equal(sheet.status,200);const tasks=(await sheet.json()).items;
  assert.equal(tasks.length,12);assert.ok(tasks.every(it=>data.subjects.includes(it.sourceDomain)));
  const legacy=await h.request({domain:'applied'});assert.equal(legacy.status,200);const oldItem=(await legacy.json()).items[0];assert.equal(oldItem.domain,'applied');assert.doesNotThrow(()=>require('../js/activity-model').printable(oldItem,h.profile));
 }
});

test('document mode retains ownership/quota checks, rejects unsupported requests without writes and rotates its sources',async()=>{
 const h=authorized();
 for(const body of [{domain:'memory',documents_only:true},{domain:'attention',documents_only:'yes'}]){
  const r=await h.request(body);assert.equal(r.status,400);assert.equal(h.writes.length,0);
 }
 h.profile.age_band='teen';h.profile.progress={};h.account.content_locale='es_co';
 h.profile.account_id='other';assert.equal((await h.request({domain:'attention',documents_only:true})).status,404);
 h.profile.account_id='u';h.usage.used=500;assert.equal((await h.request({domain:'attention',documents_only:true})).status,403);
 h.usage.used=0;
 for(const domain of ['attention','executive','literacy']){
  const r=await h.request({domain,documents_only:true,count:4});assert.equal(r.status,200);
  const data=await r.json();assert.equal(data.items.length,4);assert.equal(new Set(data.items.map(it=>it.passageKey)).size,4);
  assert.ok(data.items.every(it=>it.stimulus.some(b=>b.type==='document')&&it.localization.locale==='es_co'));
 }
 assert.ok(h.writes.some(w=>w.table==='content_usage'));
});

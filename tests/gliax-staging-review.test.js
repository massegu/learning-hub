const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs');
const load=require('./edge-harness');
const locales=require('../js/locale-content');
const communication=require('../js/communication-content');
const model=require('../js/activity-model');
const qaId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherId='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const staging='https://wejcfaralctolzxjbcil.supabase.co';

function service({url='https://other.invalid',qa='',id=qaId,status='trial',age='junior',locale='es_mx',used=0}={}){
  const {context}=load();
  const account={subscription_status:status,trial_ends_at:'2099-01-01',content_locale:locale};
  const records=new Map(used?[['exercise',used]]:[]);
  const writes=[];
  context.Deno.env.get=key=>({SUPABASE_URL:url,GLIAX_STAGING_QA_USER_IDS:qa}[key]);
  context.createClient=()=>({auth:{
    getUser:async token=>token==='fixture'?{data:{user:{id}}}:{data:{user:null},error:{message:'Invalid test session'}}
  },from(table){
    const filters={};
    let change,values;
    const result=()=>{
      const kind=values?.kind||filters.kind;
      if(table==='content_usage'){
        if(!change)return {data:records.has(kind)?{used:records.get(kind)}:null,error:null};
        const current=records.get(kind);
        if(change==='insert'&&current!==undefined)return {data:null,error:{code:'23505'}};
        if(change==='update'&&current!==filters.used)return {data:null,error:null};
        records.set(kind,values.used);
        writes.push(table);
        return {data:{used:values.used},error:null};
      }
      if(change){writes.push(table);return {data:null,error:null};}
      if(table==='learner_profiles')return {data:{id:filters.id,account_id:id,age_band:age,progress:{ageRoute:age}}};
      if(table==='accounts')return {data:account};
      return {data:[]};
    };
    const builder={select(){return builder;},eq(k,v){filters[k]=v;return builder;},
      like(){return builder;},order(){return builder;},limit(){return builder;},
      insert(v){change='insert';values=v;return builder;},update(v){change='update';values=v;return builder;},
      single:async()=>result(),maybeSingle:async()=>result(),then(resolve,reject){return Promise.resolve(result()).then(resolve,reject);}};
    return builder;
  }});
  async function request(payload,token='fixture'){
    const response=await context.handler(new Request('https://offline.invalid',{method:'POST',
      headers:{...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json'},
      body:JSON.stringify({profile_id:'fixture',level:2,client_revision:17,kind:'exercise',...payload})}));
    return {status:response.status,data:await response.json()};
  }
  return {request,records,writes,account,context};
}

test('N-back runs through the handler at all levels and preserves the historical forced match rate',async()=>{
  const h=service({age:'teen'});
  const symbols=['🎧','📘','🍎','🚲','🎬','⚽'];
  for(const [level,n,length] of [[1,1,10],[2,2,12],[3,2,14]]){
    const draws=[0]; // Select N-back from the list after excluding the first two games.
    const expected=Array.from({length},(_,i)=>{
      const slot=i%symbols.length;
      draws.push((slot+.5)/symbols.length);
      return symbols[slot];
    });
    for(let i=n;i<length;i++){
      const force=(i-n)%2===0;
      draws.push(force?.34:.35);
      if(force)expected[i]=expected[i-n];
    }
    h.context.Math.random=()=>{
      assert.ok(draws.length,'Unexpected random draw');
      return draws.shift();
    };
    const reply=await h.request({kind:'game',domain:'executive',level,exclude_types:['inhibition','spatialSequence']});
    assert.equal(reply.status,200);
    const [item]=reply.data.items;
    assert.equal(item.type,'nback');
    assert.equal(item.n,n);
    assert.equal(item.level,level);
    assert.equal(item.sequence.length,length);
    assert.deepEqual(item.sequence,expected);
    assert.equal(draws.length,0);
    assert.equal(reply.data.usage.used,level);
  }
  assert.equal(h.records.get('game'),3);
  assert.equal(h.records.has('exercise'),false);
});

test('other games retain their round counts and game requests require authentication',async()=>{
  const h=service({age:'teen'});
  for(const token of [null,'invalid']){
    const r=await h.request({kind:'game'},token);
    assert.equal(r.status,401);
    assert.equal(h.writes.length,0);
  }
  for(const [slot,type,field,count] of [
    [0,'inhibition','rounds',14],[1,'spatialSequence','sequence',6],[3,'ruleShift','rounds',10],[4,'stroop','rounds',9]
  ]){
    const remainder=h.context.Math.random;
    h.context.Math.random=()=>{
      h.context.Math.random=remainder;
      return (slot+.25)/5;
    };
    const r=await h.request({kind:'game',level:2});
    assert.equal(r.status,200);
    assert.equal(r.data.items[0].type,type);
    assert.equal(r.data.items[0][field].length,count);
  }
  assert.equal(h.records.get('game'),4);
});

test('a trial account can hit the shared exercise quota across areas, without blocking a worksheet catalogue',async()=>{
  const h=service({used:29});
  assert.equal((await h.request({domain:'attention'})).status,200);
  const r=await h.request({domain:'communication'});
  assert.equal(r.status,403);
  assert.equal(r.data.code,'CONTENT_DELIVERY_LIMIT');
  assert.deepEqual({...r.data.usage,reset_at:'utc'},{kind:'exercise',used:30,limit:30,scope:'account',reset_at:'utc'});
  assert.match(r.data.usage.reset_at,/T00:00:00\.000Z$/);
  const latest=h.writes.length;
  assert.equal((await h.request({domain:'invalid'})).status,400);
  assert.equal((await h.request({kind:'worksheet_catalog',client_revision:16,catalogue:{age:'junior',level:2,locale:'es_mx'}})).status,200);
  assert.equal(h.writes.length,latest);
});

test('only allowlisted QA users in the exact Staging project benefit from bounded quotas',async()=>{
  for(const setup of [{url:staging,id:otherId},{url:'https://wrong.supabase.co'},{url:staging,status:'cancelled'}]){
    const r=await service({qa:qaId,used:30,...setup}).request({domain:'communication'});
    assert.equal(r.status,403);
  }
  const forged=await service({url:staging,used:30}).request({
    domain:'communication',qa:true,qa_user_id:qaId,limit:1200,subscription_status:'complimentary'
  });
  assert.equal(forged.status,403);
  assert.equal(forged.data.usage.limit,30);
  const h=service({url:staging,qa:qaId,used:30});
  for(const locale of Object.keys(locales.labels)){
    h.account.content_locale=locale;
    const r=await h.request({domain:'communication',digital_only:true,locale});
    assert.equal(r.status,200,JSON.stringify(r));
    assert.equal(r.data.items[0].localization.locale,locale);
    assert.ok(communication.validate(r.data.items[0]));
  }
  assert.equal(h.records.get('exercise'),38);
  h.records.set('exercise',1199);
  assert.equal((await h.request({domain:'attention'})).status,200);
  assert.equal((await h.request({domain:'attention'})).status,403);
});

test('stale locale and unavailable requests do not spend usage; parallel writes cannot overspend',async()=>{
  const h=service({used:29});
  const stale=await h.request({domain:'communication',locale:'es_es'});
  assert.equal(stale.status,409);
  assert.equal(stale.data.code,'CONTENT_LOCALE_CHANGED');
  const unavailable=service();
  assert.equal((await unavailable.request({domain:'communication',digital_only:true,count:10})).status,422);
  assert.equal(unavailable.writes.length,0);
  assert.equal(h.writes.length,0);
  const responses=await Promise.all([h.request({domain:'attention'}),h.request({domain:'communication'})]);
  assert.equal(responses.filter(r=>r.status===200).length,1);
  assert.ok(responses.some(r=>r.status===409||r.status===403));
  assert.equal(h.records.get('exercise'),30);
  assert.equal(h.writes.filter(w=>w==='content_usage').length,1);
});

test('105 fictional activities have valid visual, answer and printable projections in all eight locales',()=>{
  const ages=['early','junior','primary','middle','teen'];
  const matrix=['variante,edad,nivel,familia,pantalla,adaptación_léxica,solución_verificada'];
  let count=0;
  for(const locale of Object.keys(locales.labels))for(const age of ages)for(const level of [1,2,3]){
    const profile={age_band:age,progress:{ageRoute:age},contentLocale:locale};
    const bank=communication.digitalPool(age,level);
    assert.equal(bank.length,7);
    for(const item of bank){
      const localized=locales.localizeItem(item,locale,'communication');
      assert.equal(localized.localization.locale,locale);
      assert.ok(communication.validate(localized));
      assert.ok(localized.opts.includes(localized.a) && new Set(localized.opts).size===3);
      assert.ok(model.forDelivery(localized,profile,'communication'));
      const checked=model.preparePrintable(localized,profile,locale,'communication');
      const {projection}=checked;
      assert.equal(checked.item.a,localized.a);
      assert.ok(projection.options.includes(localized.a));
      const material=localized.stimulus[0].materialType;
      assert.equal(projection.stimulus[0].rows[1][1],localized.stimulus[0].rows[1][1]);
      const adapted=JSON.stringify(item.stimulus)!==JSON.stringify(localized.stimulus);
      matrix.push([locale,age,level,item.mechanic,material,adapted?'sí':'español común',true].join(','));
      count++;
    }
  }
  assert.equal(count,840);
  if(process.env.GLIAX_REVIEW_MATRIX)fs.writeFileSync(process.env.GLIAX_REVIEW_MATRIX,matrix.join('\n')+'\n');
});

test('concurrent identical browser loads share one request; later deliveries and changed locales do not',async()=>{
 const vm=require('node:vm');
 let calls=0,resolve;
 const client={functions:{invoke(){calls++;return new Promise(done=>{resolve=done;});}}};
 const context={structuredClone,LH_CONFIG:{},supabase:{createClient:()=>client}};
 context.window=context;
 vm.createContext(context);
 vm.runInContext(fs.readFileSync('js/api.js','utf8'),context);
 const api=context.LearningAPI;
 api.user={id:'ficticio'};
 const payload={kind:'exercise',domain:'attention',locale:'es_mx'};
 const first=api.requestContent(payload),second=api.requestContent({...payload});
 assert.equal(calls,1);
 resolve({data:{items:[{q:'Primera entrega'}]}});
 const [a,b]=await Promise.all([first,second]);
 assert.notEqual(a.items,b.items);
 const next=api.requestContent({...payload,locale:'es_pa'});
 assert.equal(calls,2);
 resolve({data:{items:[{q:'Nueva entrega'}]}});
 assert.equal((await next).items[0].q,'Nueva entrega');
});

test('revision 18 delivers a mixed session after an incompatible request without charging the rejected attempt',async()=>{
 const h=service({age:'primary'});
 const invalid=await h.request({client_revision:18,domain:'executive',cognitive_only:true,cognitive_family:'deduction',documents_only:true});
 assert.equal(invalid.status,400);
 assert.equal(h.records.get('exercise'),undefined);
 assert.deepEqual(h.writes,[]);
 const options=[
  ['executive',{cognitive_only:true,cognitive_family:'change'},'change'],
  ['attention',{cognitive_only:true,cognitive_family:'contradiction'},'contradiction'],
  ['executive',{executed_only:true,executed_family:'plan'},'plan'],
  ['language',{cognitive_only:true,cognitive_family:'words'},'words'],
  ['memory',{executed_only:true,executed_family:'spatial'},'spatial'],
 ];
 for(const [i,[domain,selection,kind]] of options.entries()){
  const reply=await h.request({client_revision:18,domain,...selection});
  assert.equal(reply.status,200,JSON.stringify(reply.data));
  assert.equal(reply.data.usage.used,i+1);
  const item=reply.data.items[0];
  assert.equal(item.domain,domain);
  assert.equal((item.execution||item.cognitiveTask).kind,kind);
 }
 const unauthenticated=await h.request({client_revision:18,domain:'attention'},null);
 assert.equal(unauthenticated.status,401);
 assert.equal(h.records.get('exercise'),options.length);
});

test('revision 18 separates visual recall, photographic scenes and the three interactive memory families',async()=>{
 const h=service({age:'primary'});
 const direct=await h.request({client_revision:18,domain:'memory',memory_visual_only:true,count:6});
 assert.equal(direct.status,200,JSON.stringify(direct.data));
 assert.equal(direct.data.items.length,6);
 assert.ok(direct.data.items.every(it=>it.type==='memoryReveal'&&!it.photoTask&&!it.audioMemory));
 const scenes=await h.request({client_revision:18,domain:'memory',photos_only:true,count:3});
 assert.equal(scenes.status,200,JSON.stringify(scenes.data));
 assert.ok(scenes.data.items.every(it=>it.photoTask?.kind==='recall'));
 for(const family of ['serial','spatial','update']){
  const actual=await h.request({client_revision:18,domain:'memory',executed_only:true,executed_family:family});
  assert.equal(actual.status,200,JSON.stringify(actual.data));
  assert.equal(actual.data.items[0].execution.kind,family);
 }
 const bad=await h.request({client_revision:18,domain:'language',cognitive_only:true,cognitive_family:'falling'});
 assert.equal(bad.status,400);
 assert.equal(h.records.get('exercise'),12);
});

test('transversal selector runs the real handler with separate formats and operations, in the eight variants',async()=>{
 for(const tag of Object.keys(locales.labels)){
  const h=service({age:'middle',locale:tag,url:staging,qa:qaId});
  for(const [domain,format] of [['attention','message'],['communication','notice'],['memory','message'],['executive','app'],['middleLanguage','message'],['middleReading','message']]){
   const reply=await h.request({client_revision:18,locale:tag,domain,digital_only:true,digital_family:format});
   assert.equal(reply.status,200,JSON.stringify(reply.data));
   assert.equal(reply.data.usage.limit,1200);
   const item=reply.data.items[0];
   assert.equal(item.simulation.format,format);
   assert.equal(item.localization.locale,tag);
   model.forDelivery(item,{age_band:'middle'},domain);
  }
  const invalid=await h.request({client_revision:18,locale:tag,domain:'memory',digital_only:true,digital_family:'notice'});
  assert.equal(invalid.status,400);
  assert.equal(h.records.get('exercise'),6);
 }
});

test('R19 authenticated problems use standard quota, preserve R18 geometry and reject stale R19 selectors before charging',async()=>{
 const h=service({age:'primary',locale:'es_es'});
 const bad=await h.request({client_revision:19,domain:'language',digital_only:true,digital_family:'message'});
 assert.equal(bad.status,400);
 const badGeometry=await h.request({client_revision:19,domain:'geometry'});
 assert.equal(badGeometry.status,400);
 assert.equal(h.records.get('exercise'),undefined);
 const rejected=await h.request({client_revision:19,domain:'division',math_problem:true},null);
 assert.equal(rejected.status,401);
 assert.equal(h.records.get('exercise'),undefined);
 const problem=await h.request({client_revision:19,domain:'division',math_problem:true,level:2});
 assert.equal(problem.status,200,JSON.stringify(problem.data));
 assert.equal(problem.data.items[0].type,'mathProblem');
 assert.equal(problem.data.usage.limit,30);
 assert.equal(problem.data.usage.used,1);
 model.forDelivery(problem.data.items[0],{age_band:'primary'},'division');
 const geo=await h.request({client_revision:18,domain:'geometry'});
 assert.equal(geo.status,200,JSON.stringify(geo.data));
 const original=await h.request({client_revision:18,domain:'language',digital_only:true,digital_family:'message'});
 assert.equal(original.status,200,JSON.stringify(original.data));
 assert.match(original.data.items[0].contentKey,/^digital-v1:/);
 const early=service({age:'early'});
 assert.equal((await early.request({client_revision:19,domain:'division',math_problem:true})).status,400);
 assert.deepEqual(early.writes,[]);
});

test('R19 real Edge interleaves geometric content in Mathematics and routes map tasks to Executive',async()=>{
 const math=service({age:'primary',locale:'es_es'});
 const mixed=await math.request({client_revision:19,domain:'division',level:2,count:10});
 assert.equal(mixed.status,200,JSON.stringify(mixed.data));
 const moved=mixed.data.items.filter(it=>it.originalDomain==='geometry');
 assert.ok(moved.length>0);
 assert.ok(moved.every(it=>it.id&&it.domain==='division'&&it.mechanic!=='map_position'));
 moved.forEach(item=>model.forDelivery(item,{age_band:'primary'},'division'));
 const legacy=service({age:'primary',locale:'es_es'});
 const executive=await legacy.request({client_revision:19,domain:'executive',level:2,count:10});
 assert.equal(executive.status,200,JSON.stringify(executive.data));
 const orientation=executive.data.items.find(it=>it.originalDomain==='geometry');
 assert.ok(orientation);
 assert.equal(orientation.mechanic,'map_position');
 assert.match(orientation.contentKey,/^primary-v1:geometry:/);
});

test('R19 Edge delivers new response contracts and keeps other authenticated selectors available',async()=>{
 const h=service({age:'teen',locale:'es_mx',url:staging,qa:qaId});
 const selections=[['literacy','clip',3,'digitalContradiction'],['literacy','search',2,'digitalCompletion'],
  ['executive','app',3,'order'],['communication','message',3,'self']];
 for(const [domain,format,level,type] of selections){
  const response=await h.request({client_revision:19,domain,digital_only:true,digital_family:format,level,count:format==='search'?2:1});
  assert.equal(response.status,200,format+' '+JSON.stringify(response.data));
  const item=response.data.items.find(item=>item.type===type);
  assert.ok(item,response.data.items.map(item=>item.type));
  model.forDelivery(item,{age_band:'teen'},domain);
  assert.equal(response.data.usage.limit,1200);
 }
 const memory=await h.request({client_revision:19,domain:'memory',executed_only:true,executed_family:'spatial'});
 assert.equal(memory.status,200,JSON.stringify(memory.data));
 assert.equal(memory.data.items[0].execution.kind,'spatial');
});

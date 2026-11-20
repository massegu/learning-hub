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
  context.createClient=()=>({auth:{getUser:async()=>({data:{user:{id}}})},from(table){
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
  async function request(payload){
    const response=await context.handler(new Request('https://offline.invalid',{method:'POST',
      headers:{Authorization:'Bearer fixture','Content-Type':'application/json'},
      body:JSON.stringify({profile_id:'fixture',level:2,client_revision:17,kind:'exercise',...payload})}));
    return {status:response.status,data:await response.json()};
  }
  return {request,records,writes,account};
}

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

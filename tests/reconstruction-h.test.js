const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const load=require('./edge-harness'),{PGlite}=require('@electric-sql/pglite');
const lexical=require('../js/cognitive-families'),catalog=require('../js/worksheet-catalog');
const locale=require('../js/locale-content'),model=require('../js/activity-model');
const query=(rows,profile='teen')=>execFileSync(process.execPath,['tests/edge-worker.js',profile],{
  input:rows.map(JSON.stringify).join('\n')+'\n',encoding:'utf8',timeout:90000,maxBuffer:24e6
}).trim().split('\n').map(JSON.parse);
const language=age=>({middle:'middleLanguage',teen:'teenLanguage'})[age]||'language';
const base={profile_id:'teen',client_revision:16};
const plan=(age='teen',level=2,variant='es_intl')=>({age,level,locale:variant,versions:1,solutions:true,families:[
  {id:'communication:help',count:1},{id:'executive:deduction',count:2},{id:language(age)+':words',count:2}
]});
const request=config=>({...base,kind:'worksheet',worksheet_plan:config});
const inventory=(config)=>({...base,kind:'worksheet_catalog',catalogue:{age:config.age,level:config.level,locale:config.locale}});

test('shared catalogue and its projection dependencies match the Edge package',()=>{
  for(const name of ['worksheet-catalog','activity-model','content-policy','early-refinements','early-language','early-content','cognitive-families'])
    assert.ok(fs.readFileSync('js/'+name+'.js').equals(fs.readFileSync('supabase/functions/request-learning-content/'+name+'.js')),name);
});

test('configuration produces independent, ordered counts in the 15 age/level cells',()=>{
  const profiles=Object.keys(catalog.ages),requests=profiles.flatMap(age=>[1,2,3].map(level=>plan(age,level)));
  const responses=query(requests.map(request));
  for(const [index,response] of responses.entries()){
    const config=requests[index];
    assert.equal(response.status,200,JSON.stringify(response.data));
    const profile={age_band:config.age,progress:{ageRoute:config.age}};
    const [items]=catalog.verify(response.data.versions,config,(item,domain)=>model.preparePrintable(item,profile,config.locale,domain).item);
    assert.deepEqual(items.map(item=>catalog.classify(item).id),config.families.flatMap(({id,count})=>Array(count).fill(id)));
    assert.ok(items.every(item=>item.localization.locale===config.locale));
    assert.equal(response.data.usage.used,index+1);
  }
});

test('availability, exclusions, quotas and previous worksheet requests remain distinct',()=>{
  const config=plan(),limited={...config,families:[{id:'executive:wait',count:1}]};
  const response=query([inventory(config),request(limited),request({...config,families:[{id:'communication:help',count:2}]}),
    request({...config,families:[{id:'executive:deduction',count:1},{id:'executive:updatePlan',count:1}],versions:2}),
    {...base,kind:'worksheet',client_revision:13,level:2,domains:['executive'],questions:6}]);
  assert.equal(response[0].status,200);
  const byId=new Map(response[0].data.families.map(family=>[family.id,family]));
  assert.equal(byId.get('executive:wait').available,0);
  assert.equal(byId.get('executive:wait').status,'interactive');
  assert.equal(byId.get('memory:recall').available,0);
  assert.equal(byId.get('executive:deduction').status,'adapted');
  assert.equal(byId.get('teenLanguage:words').orientation.primary,'curricular');
  assert.equal(byId.get('communication:help').orientation.primary,'cognitive');
  assert.equal(response[1].status,422);
  assert.equal(response[2].status,422);
  assert.equal(response[2].data.shortages[0].available,1);
  assert.equal(response[3].status,200);
  assert.equal(response[3].data.usage.used,2);
  assert.equal(new Set(response[3].data.versions.flat().map(catalog.semanticSource)).size,4);
  assert.equal(response[4].data.items.length,6);
});

test('validation rejects detached profiles, hidden variants, invalid or duplicate requests and mismatched batches',async()=>{
  const config=plan();
  const bad=[{...config,locale:'es_invalid'},{...config,level:4},{...config,families:[config.families[0],config.families[0]]},{...config,notes:'unexpected'}];
  for(const row of query(bad.map(request)))assert.equal(row.status,400);
  assert.equal(query([{...request(config),profile_id:'intruso'}])[0].status,404);
  assert.equal(query([{...request(config),client_revision:15}])[0].status,409);
  const {context}=load();
  const anonymous=await context.handler(new Request('https://offline.invalid/',{method:'POST',body:JSON.stringify(request(config))}));
  assert.equal(anonymous.status,401);
  context.Deno.env.get=()=> 'synthetic-test';
  context.createClient=()=>({auth:{getUser:async()=>({data:{user:{id:'account-other'}}})},
    from:table=>{assert.equal(table,'learner_profiles');
     const q={select:()=>q,eq:()=>q,single:async()=>({data:{account_id:'account-owner'},error:null})};return q;}});
  const denied=await context.handler(new Request('https://offline.invalid/',{method:'POST',headers:{Authorization:'Bearer synthetic-test'},body:JSON.stringify(request(config))}));
  assert.equal(denied.status,404);
  const [result]=query([request(config)]);
  assert.throws(()=>catalog.verify([result.data.versions[0].slice(1)],config,it=>it),/todas las actividades/);
  assert.throws(()=>catalog.verify([[...result.data.versions[0]].reverse()],config,it=>it),/se pidió/);
  const same={q:'Leo tiene 3 hojas',stimulus:[{type:'text',text:'Ana tiene 2'}],a:'5',opts:['5','4']};
  assert.equal(catalog.semanticSource(same),catalog.semanticSource({...same,q:'Hugo tiene 7 hojas',stimulus:[{type:'text',text:'Pau tiene 3'}],a:'10',opts:['9','10']}));
  const shared={identity:'shared'},other={identity:'different'};
  const allocation=catalog.allocate([{id:'a',count:1},{id:'b',count:1}],1,new Map([['a',[shared,other]],['b',[shared]]]));
  assert.equal(allocation.get('a')[0],other);
  assert.equal(allocation.get('b')[0],shared);
});

test('reuse prefers unseen sources and all eight explicit variants preserve canonical answers',()=>{
  const repeat={...plan(),families:[{id:'teenLanguage:words',count:2}]};
  const requests=[request(repeat),request(repeat),...Object.keys(locale.labels).map(variant=>request(plan('teen',2,variant)))];
  const [first,second,...responses]=query(requests);
  assert.equal(first.status,200);assert.equal(second.status,200);
  assert.equal(new Set([...first.data.versions[0],...second.data.versions[0]].map(catalog.semanticSource)).size,4);
  for(const [i,response] of responses.entries()){
    const variant=Object.keys(locale.labels)[i];
    assert.equal(response.status,200,JSON.stringify(response.data));
    for(const item of response.data.versions[0]){
      assert.equal(item.localization.locale,variant);
      if(item.cognitiveTask?.kind==='words')assert.ok(item.cognitiveTask.accepted.every(answer=>lexical.grade(item,[answer])));
    }
  }
  for(const age of ['primary','middle','teen']){
    const banks=[1,2,3].map(level=>lexical.pool(age,language(age),level,'words',3));
    assert.ok(banks.flat().every(item=>lexical.validate(item)));
    assert.equal(new Set(banks.flat().map(it=>it.cognitiveTask.cue)).size,18);
    assert.equal(banks[0].filter(it=>it.contentKey.startsWith('cognitive-v3')).length,2);
  }
});

test('favorites storage enforces account ownership and limits configuration data through RLS',async()=>{
  const db=new PGlite();
  await db.exec(`create role anon; create role authenticated;
    create schema auth; grant usage on schema auth to authenticated,anon;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    insert into auth.users values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');`);
  const sql=fs.readFileSync('supabase/migrations/20261119163000_worksheet_favorites.sql','utf8');
  await db.exec(sql);
  const first='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',second='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const login=canonical=>db.exec(`reset role; set request.jwt.claim.sub = '${canonical}'; set role authenticated;`);
  const config=plan();
  await login(first);
  const saved=(await db.query('insert into public.worksheet_favorites(name,configuration) values ($1,$2) returning *',['Práctica de aula',JSON.stringify(config)])).rows[0];
  assert.equal(saved.account_id,first);
  assert.deepEqual(saved.configuration,config);
  await assert.rejects(db.query('update public.worksheet_favorites set account_id = $1',[second]),/permission denied/);
  await assert.rejects(db.query('insert into public.worksheet_favorites(name,configuration) values ($1,$2)',['No apto',JSON.stringify({...config,profile_id:'example'})]),/check constraint/);
  const badShape={...config,families:[{id:'executive:deduction',count:1.5}]};
  await assert.rejects(db.query('insert into public.worksheet_favorites(name,configuration) values ($1,$2)',['No apto',JSON.stringify(badShape)]),/check constraint/);
  await login(second);
  assert.equal((await db.query('select * from public.worksheet_favorites')).rows.length,0);
  assert.equal((await db.query("update public.worksheet_favorites set name='Ajeno' where id=$1 returning id",[saved.id])).rows.length,0);
  assert.equal((await db.query('delete from public.worksheet_favorites where id=$1 returning id',[saved.id])).rows.length,0);
  await login(first);
  const edited=(await db.query("update public.worksheet_favorites set name='Revisión' where id=$1 returning name",[saved.id])).rows[0];
  assert.equal(edited.name,'Revisión');
  await db.query("insert into public.worksheet_favorites(name,configuration) values ('Copia',$1)",[JSON.stringify(config)]);
  await db.query('delete from public.worksheet_favorites where id=$1',[saved.id]);
  assert.deepEqual((await db.query('select name from public.worksheet_favorites')).rows,[{name:'Copia'}]);
  await db.exec('reset role; set role anon;');
  await assert.rejects(db.query('select * from public.worksheet_favorites'),/permission denied/);
  await db.close();
});

const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{PGlite}=require('@electric-sql/pglite');
const resultMigration=fs.readdirSync('supabase/migrations').find(name=>/^\d{14}_idempotent_exercise_results\.sql$/.test(name));assert.ok(resultMigration,'idempotency migration uses its registered 14-digit version');
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',P='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',Q='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';let db;
before(async()=>{db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth to anon,authenticated,service_role;
 create schema private;
 create table accounts(user_id uuid primary key);insert into accounts values('${A}'),('${B}');
 create table learner_profiles(id uuid primary key,account_id uuid references accounts(user_id),name text,age_band text,locale text,progress jsonb default '{}');
 create table exercise_results(id uuid primary key default gen_random_uuid(),profile_id uuid references learner_profiles(id),correct bool);
 create table private.content_delivery_log(id bigint generated always as identity primary key,user_id uuid,profile_id uuid references learner_profiles(id) on delete cascade,content_id uuid,kind text,delivered_at timestamptz default now());
 create table content_seen(id uuid primary key default gen_random_uuid(),profile_id uuid,user_id uuid,item_signature text);
 insert into learner_profiles values('${P}','${A}','P-1','primary','es_es','{"interactiveObservations":[{"kind":"room","description":"private free text","report":"described"}]}'),('${Q}','${B}','P-2','teen','es_es','{}');
 grant all on private.content_delivery_log to anon,authenticated;grant select(kind) on private.content_delivery_log to anon;insert into exercise_results(profile_id,correct) values('${P}',true),('${Q}',false);insert into private.content_delivery_log(user_id,profile_id,content_id,kind) values('${A}','${P}','${P}','exercise'),('${B}','${Q}','${Q}','worksheet');
 insert into content_seen(profile_id,user_id,item_signature) values('${P}','${A}','source-a'),('${Q}','${B}','source-b');grant truncate,trigger,references on learner_profiles,exercise_results to anon,authenticated;grant update(correct) on exercise_results to authenticated;`);await db.exec(fs.readFileSync('supabase/migrations/202610230001_learner_privacy.sql','utf8'));const idempotencyMigration=fs.readFileSync('supabase/migrations/'+resultMigration,'utf8');await db.exec(idempotencyMigration);await db.exec(idempotencyMigration);await db.exec(fs.readFileSync('supabase/migrations/20261116170000_validate_new_profile_codes.sql','utf8'));await db.exec(fs.readFileSync('supabase/migrations/20261116171000_allow_unscored_exercise_results.sql','utf8'));await db.exec(fs.readFileSync('supabase/migrations/20261117100000_unique_learner_profile_codes.sql','utf8'));});
 after(async()=>db.close());
const as=async(id)=>db.exec(`reset role;select set_config('request.jwt.claim.sub','${id}',false);set role authenticated;`);
test('migration strips legacy notes and cannot store temporary session progress',async()=>{
 await as(A);let rows=(await db.query('select * from learner_profiles')).rows;assert.equal(rows.length,1);assert.equal(rows[0].progress.interactiveObservations[0].description,undefined);
 await db.query(`update learner_profiles set progress='{"interactiveObservations":[{"description":"must disappear","report":"described"}]}' where id=$1`,[P]);rows=(await db.query('select progress from learner_profiles')).rows;assert.equal(rows[0].progress.interactiveObservations[0].description,undefined);
 assert.equal((await db.query("select is_nullable from information_schema.columns where table_name='exercise_results' and column_name='correct'")).rows[0].is_nullable,'YES','unscored modality records require a neutral nullable score');
 await assert.rejects(db.query(`update learner_profiles set progress='{"_sessionOnly":true}' where id=$1`,[P]));
 assert.deepEqual((await db.query('select name from learner_profiles where id=$1',[P])).rows,[{name:'P-1'}],'legacy aliases remain unchanged');
 await assert.rejects(db.query("insert into learner_profiles(id,account_id,name,age_band) values(gen_random_uuid(),$1,'María','primary')",[A]),/Profile code/);
 await db.query("insert into learner_profiles(id,account_id,name,age_band) values(gen_random_uuid(),$1,'P-ABCDEF01','primary')",[A]);
 await assert.rejects(db.query("update learner_profiles set name='María' where id=$1",[P]),/Profile code/);
});
test('profile codes are unique per account across creation, edits and simultaneous inserts without changing historical aliases',async()=>{
 const ids=['d1111111-1111-4111-8111-111111111111','d2222222-2222-4222-8222-222222222222','d3333333-3333-4333-8333-333333333333','d4444444-4444-4444-8444-444444444444'];
 const codes=['P-F00DBAAD','P-F00DBABE','P-1234ABCD'];
 try{
  await as(A);
  await db.query('insert into learner_profiles(id,account_id,name,age_band) values($1,$2,$3,$4)',[ids[0],A,codes[0],'primary']);
  await assert.rejects(db.query('insert into learner_profiles(id,account_id,name,age_band) values($1,$2,$3,$4)',[ids[1],A,'p-f00dbaad','primary']),e=>e.code==='23505'&&String(e.message).includes('learner_profiles_account_code_normalized_key'));
  await db.query('insert into learner_profiles(id,account_id,name,age_band) values($1,$2,$3,$4)',[ids[2],A,codes[1],'primary']);
  await assert.rejects(db.query('update learner_profiles set name=$1 where id=$2',[codes[0],ids[2]]),e=>e.code==='23505'&&String(e.message).includes('learner_profiles_account_code_normalized_key'));
  await db.query('update learner_profiles set name=$1 where id=$2',['p-f00dbaac',ids[2]]);
  assert.equal((await db.query('select name from learner_profiles where id=$1',[ids[2]])).rows[0].name,'P-F00DBAAC','edited codes are stored normalized in uppercase');
  await db.exec('reset role');await as(B);
  await db.query('insert into learner_profiles(id,account_id,name,age_band) values($1,$2,$3,$4)',[ids[1],B,codes[0],'primary']);
  await db.exec('reset role');await as(A);
  const concurrent=await Promise.allSettled(ids.slice(2,4).map(id=>db.query('insert into learner_profiles(id,account_id,name,age_band) values($1,$2,$3,$4)',[id,A,codes[2],'primary'])));
  assert.equal(concurrent.filter(x=>x.status==='fulfilled').length,1,'one concurrent insert wins');
  assert.equal(concurrent.filter(x=>x.status==='rejected').length,1,'the unique index rejects the competing concurrent insert');
  assert.ok(concurrent.find(x=>x.status==='rejected').reason.code==='23505');
  assert.equal((await db.query('select count(*)::int as n from learner_profiles where account_id=$1 and upper(btrim(name))=$2',[A,codes[2]])).rows[0].n,1);
  await db.exec('reset role');
  assert.deepEqual((await db.query('select id,name from learner_profiles where id in ($1,$2) order by id',[P,Q])).rows,[{id:P,name:'P-1'},{id:Q,name:'P-2'}],'historical aliases remain byte-for-byte unchanged');
 }finally{await db.exec('reset role');await db.query('delete from learner_profiles where id=any($1::uuid[])',[ids]);}
});
test('duplicate normalized historical codes abort the migration without changing rows',async()=>{
 const preflight=new PGlite();
 try{
  await preflight.exec("create table learner_profiles(account_id uuid,name text);insert into learner_profiles values('11111111-1111-4111-8111-111111111111','P-Legacy-A'),('11111111-1111-4111-8111-111111111111','  p-lEGACY-a  '),('22222222-2222-4222-8222-222222222222','P-Legacy-A')");
  await assert.rejects(preflight.exec(fs.readFileSync('supabase/migrations/20261117100000_unique_learner_profile_codes.sql','utf8')),/Duplicate normalized profile names or codes/);
  await preflight.exec('rollback');
  assert.equal((await preflight.query('select count(*)::int as n from learner_profiles')).rows[0].n,3,'the failed preflight preserves every historical row');
  assert.equal((await preflight.query("select to_regclass('public.learner_profiles_account_code_normalized_key') as index_name")).rows[0].index_name,null,'the failed migration creates no partial index');
 }finally{await preflight.close();}
});
test('the index covers historical aliases after case/space normalization but remains account-scoped',async()=>{
 const historical=new PGlite();
 try{
  await historical.exec(`create table learner_profiles(id uuid primary key,account_id uuid not null,name text not null);
   insert into learner_profiles values
   ('aaaaaaaa-1111-4111-8111-111111111111','${A}','  P-Old-Alias  '),
   ('bbbbbbbb-2222-4222-8222-222222222222','${B}','P-Old-Alias');`);
  await historical.exec(fs.readFileSync('supabase/migrations/20261117100000_unique_learner_profile_codes.sql','utf8'));
  await assert.rejects(historical.exec(`insert into learner_profiles values('cccccccc-3333-4333-8333-333333333333','${A}','p-old-alias')`),e=>e.code==='23505'&&String(e.message).includes('learner_profiles_account_code_normalized_key'),'legacy aliases differing by case and surrounding spaces collide within an account');
  await assert.rejects(historical.exec(`insert into learner_profiles values('dddddddd-4444-4444-8444-444444444444','${A}','  P-Old-Alias')`),e=>e.code==='23505','legacy aliases differing only by surrounding spaces collide within an account');
  await historical.exec(`insert into learner_profiles values('eeeeeeee-5555-4555-8555-555555555555','33333333-3333-4333-8333-333333333333','p-old-alias')`);
  assert.deepEqual((await historical.query('select account_id,name from learner_profiles order by account_id')).rows,[{account_id:A,name:'  P-Old-Alias  '},{account_id:B,name:'P-Old-Alias'},{account_id:'33333333-3333-4333-8333-333333333333',name:'p-old-alias'}],'existing aliases are not rewritten and a separate account may use the same normalized value');
 }finally{await historical.close();}
});
test('real RLS blocks other accounts and RPCs reject forged profile IDs',async()=>{
 await as(A);assert.equal((await db.query('select * from exercise_results')).rows.length,1);assert.equal((await db.query('select * from content_seen')).rows.length,1);
 for(const action of ['open','export','delete','settings'])await assert.rejects(db.query('select manage_learner_privacy($1,$2,$3,null)',[action,Q,'P-new']));
 await assert.rejects(db.query('update learner_profiles set account_id=$1 where id=$2',[B,P]));
 await assert.rejects(db.query('insert into exercise_results(profile_id,correct) values($1,true)',[Q]));
 await assert.rejects(db.query('update exercise_results set correct=true where profile_id=$1',[Q]));
 await assert.rejects(db.query('delete from exercise_results where profile_id=$1',[Q]));
 await assert.rejects(db.query('insert into content_seen(profile_id,user_id,item_signature) values($1,$2,$3)',[Q,A,'forged']));
 await assert.rejects(db.query('update content_seen set item_signature=$1 where profile_id=$2',['forged',Q]));
 await assert.rejects(db.query('delete from content_seen where profile_id=$1',[Q]));
 await assert.rejects(db.query('insert into learner_privacy_audit(account_id,action) values($1,$2)',[A,'open']));
 await db.exec('reset role');await as(B);assert.equal((await db.query('select * from learner_profiles')).rows.length,1);assert.equal((await db.query('select * from exercise_results')).rows.length,1);assert.equal((await db.query('select * from content_seen')).rows.length,1);assert.ok(!JSON.stringify((await db.query('select * from learner_profiles')).rows).includes(P));
 await db.exec('reset role;set role anon');await assert.rejects(db.query('select * from learner_profiles'));await assert.rejects(db.query('select manage_learner_privacy($1,$2)', ['export',P]));
});
test('export is complete for the owned learner, settings are audited, deletion covers both stores',async()=>{
 await as(A);const data=(await db.query("select manage_learner_privacy('export',$1) as data",[P])).rows[0].data;
 assert.equal(data.profile.id,P);assert.equal(data.results.length,1);assert.equal(data.content_history.length,1);assert.equal(data.delivery_log.length,1);assert.equal(data.delivery_log[0].user_id,A);assert.ok(!JSON.stringify(data).includes(Q));
 await assert.rejects(db.query("select manage_learner_privacy('settings',$1,'P-024','2027-01-01')",[P]),/Profile code/);
 await db.query("select manage_learner_privacy('settings',$1,'P-ABCDEF02','2027-01-01')",[P]);assert.equal((await db.query('select privacy_review_at::text from learner_profiles where id=$1',[P])).rows[0].privacy_review_at,'2027-01-01');
 const audit=(await db.query('select action from learner_privacy_audit where profile_id=$1',[P])).rows;assert.deepEqual(audit.map(x=>x.action),['export','settings']);assert.ok(!JSON.stringify(audit).includes('P-ABCDEF02'));
 await db.query("select manage_learner_privacy('delete',$1)",[P]);assert.equal((await db.query('select * from learner_profiles where id=$1',[P])).rows.length,0);
 await db.exec('reset role');assert.equal((await db.query('select * from exercise_results where profile_id=$1',[P])).rows.length,0);assert.equal((await db.query('select * from content_seen where profile_id=$1',[P])).rows.length,0);assert.equal((await db.query('select * from private.content_delivery_log where profile_id=$1',[P])).rows.length,0);
 assert.equal((await db.query('select * from learner_profiles where id=$1',[Q])).rows.length,1);
});

test('unknown child constraints roll deletion back; direct owned deletion also clears all known stores',async()=>{
 const C='cccccccc-cccc-4ccc-8ccc-cccccccccccc';await db.exec('reset role');
 await db.exec(`create table additional_child(profile_id uuid references learner_profiles(id));insert into learner_profiles(id,account_id,name,age_band) values('${C}','${A}','P-ABCDEF03','primary');insert into exercise_results(profile_id,correct) values('${C}',true);insert into content_seen(profile_id,user_id) values('${C}','${A}');insert into additional_child values('${C}');`);
 await as(A);await assert.rejects(db.query("select manage_learner_privacy('export',$1)",[C]),/Unreviewed learner storage/);await assert.rejects(db.query("select manage_learner_privacy('delete',$1)",[C]));assert.equal((await db.query('select * from learner_profiles where id=$1',[C])).rows.length,1);assert.equal((await db.query('select * from exercise_results where profile_id=$1',[C])).rows.length,1);assert.equal((await db.query('select * from content_seen where profile_id=$1',[C])).rows.length,1);
 await db.exec('reset role;delete from additional_child');await as(A);await db.query('delete from learner_profiles where id=$1',[C]);await db.exec('reset role');assert.equal((await db.query('select * from exercise_results where profile_id=$1',[C])).rows.length,0);assert.equal((await db.query('select * from content_seen where profile_id=$1',[C])).rows.length,0);await assert.rejects(db.query('insert into content_seen(profile_id,user_id) values($1,$2)',[C,A]));await db.exec('drop table additional_child');
});

test('legacy truncate/trigger and explicit result-column write grants are removed',async()=>{
 await as(A);for(const role of ['anon','authenticated'])for(const table of ['learner_profiles','exercise_results'])for(const permission of ['TRUNCATE','TRIGGER','REFERENCES'])assert.equal((await db.query('select has_table_privilege($1,$2,$3) as allowed',[role,table,permission])).rows[0].allowed,false);
 await assert.rejects(db.query('update exercise_results set correct=true'));
 await db.exec('reset role');for(const role of ['anon','authenticated'])assert.equal((await db.query("select has_table_privilege($1,'private.content_delivery_log','SELECT') as allowed",[role])).rows[0].allowed,false);await db.query('insert into private.content_delivery_log(user_id,profile_id,content_id,kind) values($1,$2,$2,$3)',[A,Q,'exercise']);
 await as(B);await assert.rejects(db.query("select manage_learner_privacy('export',$1)",[Q]),/Inconsistent delivery ownership/);await db.exec('reset role');await db.query('delete from private.content_delivery_log where profile_id=$1 and user_id=$2',[Q,A]);await db.exec('alter table private.content_delivery_log add column notes text');await as(B);await assert.rejects(db.query("select manage_learner_privacy('export',$1)",[Q]),/Unreviewed private delivery columns/);await db.exec('reset role;alter table private.content_delivery_log drop column notes');
});

test('result attempt keys are nullable for history, unique per profile, non-overwriting and protected by existing RLS',async()=>{
 const ATTEMPT='aaaaaaaa-1111-4111-8111-111111111111',NEW_PROFILE='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 await as(B);
 assert.equal((await db.query('select count(*)::int as n from exercise_results where profile_id=$1 and client_attempt_id is null',[Q])).rows[0].n,1,'historical result remains unchanged and nullable');
 assert.deepEqual((await db.query('select correct from exercise_results where profile_id=$1 and client_attempt_id is null',[Q])).rows,[{correct:false}],'migration preserves the existing result values');
 await db.query('insert into exercise_results(profile_id,correct) values($1,true)',[Q]);
 assert.equal((await db.query('select count(*)::int as n from exercise_results where profile_id=$1 and client_attempt_id is null',[Q])).rows[0].n,2,'older clients may continue inserting without an attempt UUID');
 await db.query('insert into exercise_results(profile_id,correct,client_attempt_id) values($1,true,$2) on conflict(profile_id,client_attempt_id) do nothing',[Q,ATTEMPT]);
 await db.query('insert into exercise_results(profile_id,correct,client_attempt_id) values($1,false,$2) on conflict(profile_id,client_attempt_id) do nothing',[Q,ATTEMPT]);
 let rows=(await db.query('select correct from exercise_results where profile_id=$1 and client_attempt_id=$2',[Q,ATTEMPT])).rows;
 assert.deepEqual(rows,[{correct:true}],'duplicate/retry must not replace the first confirmed answer');
 const CONCURRENT='bbbbbbbb-2222-4222-8222-222222222222';
 await Promise.all([
  db.query('insert into exercise_results(profile_id,correct,client_attempt_id) values($1,true,$2) on conflict(profile_id,client_attempt_id) do nothing',[Q,CONCURRENT]),
  db.query('insert into exercise_results(profile_id,correct,client_attempt_id) values($1,false,$2) on conflict(profile_id,client_attempt_id) do nothing',[Q,CONCURRENT]),
 ]);
 assert.equal((await db.query('select count(*)::int as n from exercise_results where profile_id=$1 and client_attempt_id=$2',[Q,CONCURRENT])).rows[0].n,1,'concurrent identical submissions create one row');
 await as(A);await assert.rejects(db.query('insert into exercise_results(profile_id,correct,client_attempt_id) values($1,true,$2) on conflict(profile_id,client_attempt_id) do nothing',[Q,ATTEMPT]),'RLS must block another account even when conflict handling is enabled');
 await db.exec('reset role');await db.exec(`insert into learner_profiles(id,account_id,name,age_band) values('${NEW_PROFILE}','${A}','P-ABCDEF04','primary')`);await as(A);
 await db.query('insert into exercise_results(profile_id,correct,client_attempt_id) values($1,false,$2) on conflict(profile_id,client_attempt_id) do nothing',[NEW_PROFILE,ATTEMPT]);
 await db.exec('reset role');
 rows=(await db.query('select profile_id,correct from exercise_results where client_attempt_id=$1 order by profile_id',[ATTEMPT])).rows;
 assert.deepEqual(rows,[{profile_id:Q,correct:true},{profile_id:NEW_PROFILE,correct:false}],'the same UUID may be used independently across different profiles');
});

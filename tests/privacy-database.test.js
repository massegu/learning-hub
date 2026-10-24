const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{PGlite}=require('@electric-sql/pglite');
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
 insert into exercise_results(profile_id,correct) values('${P}',true),('${Q}',false);insert into private.content_delivery_log(user_id,profile_id,content_id,kind) values('${A}','${P}','${P}','exercise'),('${B}','${Q}','${Q}','worksheet');
 insert into content_seen(profile_id,user_id,item_signature) values('${P}','${A}','source-a'),('${Q}','${B}','source-b');grant truncate,trigger,references on learner_profiles,exercise_results to anon,authenticated;grant update(correct) on exercise_results to authenticated;`);await db.exec(fs.readFileSync('supabase/migrations/202610230001_learner_privacy.sql','utf8'));});
after(async()=>db.close());
const as=async(id)=>db.exec(`reset role;select set_config('request.jwt.claim.sub','${id}',false);set role authenticated;`);
test('migration strips legacy notes and cannot store temporary session progress',async()=>{
 await as(A);let rows=(await db.query('select * from learner_profiles')).rows;assert.equal(rows.length,1);assert.equal(rows[0].progress.interactiveObservations[0].description,undefined);
 await db.query(`update learner_profiles set progress='{"interactiveObservations":[{"description":"must disappear","report":"described"}]}' where id=$1`,[P]);rows=(await db.query('select progress from learner_profiles')).rows;assert.equal(rows[0].progress.interactiveObservations[0].description,undefined);
 await assert.rejects(db.query(`update learner_profiles set progress='{"_sessionOnly":true}' where id=$1`,[P]));
});
test('real RLS blocks other accounts and RPCs reject forged profile IDs',async()=>{
 await as(A);assert.equal((await db.query('select * from exercise_results')).rows.length,1);assert.equal((await db.query('select * from content_seen')).rows.length,1);
 for(const action of ['open','export','delete','settings'])await assert.rejects(db.query('select manage_learner_privacy($1,$2,$3,null)',[action,Q,'P-new']));
 await assert.rejects(db.query('update learner_profiles set account_id=$1 where id=$2',[B,P]));
 await assert.rejects(db.query('insert into exercise_results(profile_id,correct) values($1,true)',[Q]));
 await assert.rejects(db.query('insert into learner_privacy_audit(account_id,action) values($1,$2)',[A,'open']));
 await db.exec('reset role;set role anon');await assert.rejects(db.query('select * from learner_profiles'));await assert.rejects(db.query('select manage_learner_privacy($1,$2)', ['export',P]));
});
test('export is complete for the owned learner, settings are audited, deletion covers both stores',async()=>{
 await as(A);const data=(await db.query("select manage_learner_privacy('export',$1) as data",[P])).rows[0].data;
 assert.equal(data.profile.id,P);assert.equal(data.results.length,1);assert.equal(data.content_history.length,1);assert.equal(data.delivery_log.length,1);assert.equal(data.delivery_log[0].user_id,A);assert.ok(!JSON.stringify(data).includes(Q));
 await db.query("select manage_learner_privacy('settings',$1,'P-024','2027-01-01')",[P]);assert.equal((await db.query('select privacy_review_at::text from learner_profiles')).rows[0].privacy_review_at,'2027-01-01');
 const audit=(await db.query('select * from learner_privacy_audit')).rows;assert.deepEqual(audit.map(x=>x.action),['export','settings']);assert.ok(!JSON.stringify(audit).includes('P-024'));
 await db.query("select manage_learner_privacy('delete',$1)",[P]);assert.equal((await db.query('select * from learner_profiles')).rows.length,0);
 await db.exec('reset role');assert.equal((await db.query('select * from exercise_results where profile_id=$1',[P])).rows.length,0);assert.equal((await db.query('select * from content_seen where profile_id=$1',[P])).rows.length,0);assert.equal((await db.query('select * from private.content_delivery_log where profile_id=$1',[P])).rows.length,0);
 assert.equal((await db.query('select * from learner_profiles where id=$1',[Q])).rows.length,1);
});

test('unknown child constraints roll deletion back; direct owned deletion also clears all known stores',async()=>{
 const C='cccccccc-cccc-4ccc-8ccc-cccccccccccc';await db.exec('reset role');
 await db.exec(`create table additional_child(profile_id uuid references learner_profiles(id));insert into learner_profiles(id,account_id,name,age_band) values('${C}','${A}','P-3','primary');insert into exercise_results(profile_id,correct) values('${C}',true);insert into content_seen(profile_id,user_id) values('${C}','${A}');insert into additional_child values('${C}');`);
 await as(A);await assert.rejects(db.query("select manage_learner_privacy('export',$1)",[C]),/Unreviewed learner storage/);await assert.rejects(db.query("select manage_learner_privacy('delete',$1)",[C]));assert.equal((await db.query('select * from learner_profiles where id=$1',[C])).rows.length,1);assert.equal((await db.query('select * from exercise_results where profile_id=$1',[C])).rows.length,1);assert.equal((await db.query('select * from content_seen where profile_id=$1',[C])).rows.length,1);
 await db.exec('reset role;delete from additional_child');await as(A);await db.query('delete from learner_profiles where id=$1',[C]);await db.exec('reset role');assert.equal((await db.query('select * from exercise_results where profile_id=$1',[C])).rows.length,0);assert.equal((await db.query('select * from content_seen where profile_id=$1',[C])).rows.length,0);await assert.rejects(db.query('insert into content_seen(profile_id,user_id) values($1,$2)',[C,A]));await db.exec('drop table additional_child');
});

test('legacy truncate/trigger and explicit result-column write grants are removed',async()=>{
 await as(A);for(const role of ['anon','authenticated'])for(const table of ['learner_profiles','exercise_results'])for(const permission of ['TRUNCATE','TRIGGER','REFERENCES'])assert.equal((await db.query('select has_table_privilege($1,$2,$3) as allowed',[role,table,permission])).rows[0].allowed,false);
 await assert.rejects(db.query('update exercise_results set correct=true'));
 await db.exec('reset role');await db.query('insert into private.content_delivery_log(user_id,profile_id,content_id,kind) values($1,$2,$2,$3)',[A,Q,'exercise']);
 await as(B);await assert.rejects(db.query("select manage_learner_privacy('export',$1)",[Q]),/Inconsistent delivery ownership/);await db.exec('reset role');await db.query('delete from private.content_delivery_log where profile_id=$1 and user_id=$2',[Q,A]);await db.exec('alter table private.content_delivery_log add column notes text');await as(B);await assert.rejects(db.query("select manage_learner_privacy('export',$1)",[Q]),/Unreviewed private delivery columns/);await db.exec('reset role;alter table private.content_delivery_log drop column notes');
});

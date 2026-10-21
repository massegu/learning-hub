const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{stripTypeScriptTypes}=require('node:module'),{PGlite}=require('@electric-sql/pglite');
const USER='11111111-1111-4111-8111-111111111111',OTHER='22222222-2222-4222-8222-222222222222';
const price='price_approved',secret='whsec_offline_fixture',app='https://learning.invalid/';
let db;
before(async()=>{
 db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
 create function auth.role() returns text language sql as $$select current_setting('request.jwt.claim.role',true)$$;
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table auth.users(id uuid primary key);
 create type public.subscription_status as enum('trial','active','past_due','cancelled','complimentary');
 create table public.accounts(user_id uuid primary key references auth.users(id),subscription_status public.subscription_status not null default 'trial',trial_started_at timestamptz not null default now(),trial_ends_at timestamptz not null default now()+interval '7 days',stripe_customer_id text unique,stripe_subscription_id text unique,current_period_end timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),content_locale text not null default 'es_intl');
 alter table public.accounts enable row level security;
 create policy accounts_select_own on public.accounts for select to authenticated using(user_id=auth.uid());
 create policy accounts_update_own_locale on public.accounts for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
 grant usage on schema public,auth to authenticated,anon,service_role;
 grant select on public.accounts to authenticated;
 grant update(content_locale) on public.accounts to authenticated;
 select set_config('request.jwt.claim.role','service_role',false);`);
 await db.exec(fs.readFileSync('supabase/migrations/202610210001_billing_integrity.sql','utf8'));
});
after(async()=>{await db.close()});
const future=()=>Math.floor(Date.now()/1000)+86400;
function sub(id='sub_A',extra={}){return {id,object:'subscription',customer:'cus_A',livemode:false,created:100,status:'active',metadata:{},items:{has_more:false,data:[{price:{id:price},quantity:1,current_period_end:future()}]},latest_invoice:{id:'in_A',livemode:false,customer:'cus_A',status:'paid',parent:{type:'subscription_details',subscription_details:{subscription:id}}},...extra}}
async function fixture({bound=true,status='active',customer='cus_A',env={}}={}){
 await db.exec('truncate auth.users cascade');
 await db.query('insert into auth.users(id) values($1),($2)',[USER,OTHER]);
 await db.query('insert into accounts(user_id,subscription_status,stripe_customer_id,stripe_subscription_id) values($1,$2,$3,$4),($5,\'trial\',\'cus_B\',null)',[USER,status,customer,bound?'sub_A':null,OTHER]);
 const cfg={SUPABASE_URL:'https://db.invalid',SUPABASE_SERVICE_ROLE_KEY:'server-only-fixture',STRIPE_MODE:'test',STRIPE_SECRET_KEY:'sk_test_offline',STRIPE_PRICE_ID:price,BILLING_APP_URL:app,STRIPE_WEBHOOK_SECRET:secret,...env};
 const objects=new Map([['prices/'+price,{id:price,livemode:false,active:true,type:'recurring',currency:'eur',unit_amount:1999,recurring:{interval:'month',interval_count:1}}],['subscriptions/sub_A',sub()],['customers/cus_A',{id:'cus_A',livemode:false}],['customers/cus_B',{id:'cus_B',livemode:false}]]),requests=[],idem=new Map();let failRPC=null,failFetch=null,gate=null;
 objects.set('subscriptions',{has_more:false,data:bound?[objects.get('subscriptions/sub_A')]:[]});
 async function callRPC(name,args){const keys=Object.keys(args),sql=`select public.${name}(${keys.map((k,i)=>k+'=> $'+(i+1)).join(',')}) as value`;return (await db.query(sql,Object.values(args))).rows[0].value;}
 const admin={auth:{getUser:async token=>token==='userA'?{data:{user:{id:USER,email:'a@example.invalid'}}}:token==='userB'?{data:{user:{id:OTHER,email:'b@example.invalid'}}}:{error:{message:'invalid'}}},
  rpc:async(name,args)=>{try{if(failRPC===name)throw Error('private SQL failure');return {data:await callRPC(name,args),error:null}}catch(e){return {error:{message:e.message}}}},
  from(table){let col,val;return {select(){return this},eq(k,v){col=k;val=v;return this},async maybeSingle(){try{return {data:(await db.query(`select * from public.${table} where ${col}=$1`,[val])).rows[0]||null,error:null}}catch(e){return {error:{message:e.message}}}}}}
 };
 const fetcher=async(url,options)=>{
  const path=new URL(url).pathname.replace('/v1/',''),body=options.body?Object.fromEntries(options.body):null;
  requests.push({path,body,headers:options.headers});if(failFetch)throw Error('private Stripe failure');
  if(gate&&path.startsWith('subscriptions/'))await gate;
  const key=options.headers['Idempotency-Key'];if(key&&idem.has(key))return Response.json(idem.get(key));
  let value;
  if(options.method==='POST'&&path==='customers'){value={id:'cus_new',livemode:false};objects.set('customers/cus_new',value);}
  else if(options.method==='POST'&&path==='checkout/sessions'){
   value={id:'cs_new',livemode:false,mode:body.mode,status:'open',client_reference_id:body.client_reference_id,customer:body.customer,url:'https://checkout.stripe.com/c/pay/offline',metadata:{learning_hub_attempt:body['metadata[learning_hub_attempt]']}};
   objects.set('checkout/sessions/cs_new',value);
  }else if(options.method==='POST'&&path==='billing_portal/sessions')value={url:'https://billing.stripe.com/p/session/offline'};
  else value=objects.get(path);
  if(!value)return Response.json({error:{message:'not found'}},{status:404});
  if(key)idem.set(key,value);return Response.json(structuredClone(value));
 };
 const context={console:{error(){}},URL,URLSearchParams,Request,Response,TextEncoder,Uint8Array,Date,Set,RegExp,Number,AbortSignal,crypto:globalThis.crypto,fetch:fetcher,createClient:()=>admin,Deno:{env:{get:k=>cfg[k]},serve:handler=>context.handler=handler}};
 vm.createContext(context);vm.runInContext(stripTypeScriptTypes(fs.readFileSync('supabase/functions/stripe-webhook/index.ts','utf8').replace(/^import .*;\n/gm,'')),context);
 async function action(action,token='userA',extra={},origin=app.slice(0,-1)){
  const headers={'Content-Type':'application/json',Origin:origin};if(token)headers.Authorization='Bearer '+token;
  const response=await context.handler(new Request('https://db.invalid/functions/v1/stripe-webhook',{method:'POST',headers,body:JSON.stringify({action,mode:'test',...extra})}));return {status:response.status,data:await response.json()};
 }
 async function event(type='invoice.payment_succeeded',object={customer:'cus_A',parent:{subscription_details:{subscription:'sub_A'}}},options={}){
  const raw=JSON.stringify({id:options.id||'evt_test',created:Math.floor(Date.now()/1000),livemode:false,type,data:{object},...options.event});
  const t=String(Math.floor(Date.now()/1000)+(options.age||0)),key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signature=Buffer.from(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(t+'.'+raw))).toString('hex');
  const response=await context.handler(new Request('https://db.invalid/functions/v1/stripe-webhook?token=unused',{method:'POST',headers:{'stripe-signature':options.signature||`t=${t},v1=${signature}`},body:options.tamper?raw+' ':raw}));return {status:response.status,data:await response.json()};
 }
 async function account(){return (await db.query('select * from accounts where user_id=$1',[USER])).rows[0]}
 return {action,event,objects,requests,callRPC,account,context,set failRPC(v){failRPC=v},set failFetch(v){failFetch=v},set gate(v){gate=v}};
}
test('real PostgreSQL migration preserves locale-only writes and protects billing tables/RPCs',async()=>{
 await fixture();
 assert.equal((await db.query("select has_column_privilege('authenticated','public.accounts','subscription_status','UPDATE') as value")).rows[0].value,false);
 assert.equal((await db.query("select has_column_privilege('authenticated','public.accounts','content_locale','UPDATE') as value")).rows[0].value,true);
 for(const role of ['authenticated','anon']){
  assert.equal((await db.query(`select has_table_privilege('${role}','public.billing_checkout_attempts','SELECT') as value`)).rows[0].value,false);
  assert.equal((await db.query(`select has_function_privilege('${role}','public.billing_prepare_checkout(uuid,boolean,text)','EXECUTE') as value`)).rows[0].value,false);
 }
 await db.exec("select set_config('request.jwt.claim.role','authenticated',false)");
 await assert.rejects(db.query('select billing_prepare_checkout($1,false,$2)',[USER,price]),/Server only/);
 await db.exec("select set_config('request.jwt.claim.role','service_role',false)");
});
test('authenticated checkout fixes identity, price, quantity and return URL on the server; retries reuse one session',async()=>{
 const f=await fixture({bound:false,status:'trial',customer:null});
 assert.equal((await f.action('checkout',null)).status,401);
 assert.equal((await f.action('checkout','userA',{},'https://evil.invalid')).status,403);
 assert.equal((await f.action('checkout','userA',{mode:'live'})).status,409);assert.equal(f.requests.length,0);
 const first=await f.action('checkout','userA',{user_id:OTHER,price:'price_attacker',return_url:'https://evil.invalid'});assert.equal(first.status,200);assert.equal(first.data.livemode,false);
 const call=f.requests.find(r=>r.path==='checkout/sessions'&&r.body);assert.equal(call.body['line_items[0][price]'],price);assert.equal(call.body['line_items[0][quantity]'],'1');assert.equal(call.body.success_url,app+'?pago=pendiente');assert.equal(call.body.customer,'cus_new');
 const attempts=(await db.query('select * from billing_checkout_attempts')).rows;assert.equal(attempts.length,1);assert.equal(attempts[0].user_id,USER);assert.equal(attempts[0].checkout_session_id,'cs_new');assert.equal((await f.account()).subscription_status,'trial');
 assert.deepEqual(await f.action('checkout'),first);assert.equal(f.requests.filter(r=>r.path==='checkout/sessions'&&r.body).length,1);
});
test('existing subscriptions use the customer-bound portal, never an email or browser-supplied customer',async()=>{
 const f=await fixture();assert.equal((await f.action('checkout')).status,409);
 assert.equal((await f.action('portal','userB',{customer:'cus_A'})).status,200);
 const call=f.requests.find(r=>r.path==='billing_portal/sessions');assert.equal(call.body.customer,'cus_B');assert.equal(call.body.return_url,app);
});
test('bad, expired or altered signatures and wrong environments never change an account',async()=>{
 const f=await fixture();
 for(const options of [{signature:'t=1,v1=bad'},{age:-301},{tamper:true},{event:{livemode:true}}])assert.equal((await f.event(undefined,undefined,options)).status,400);
 assert.equal(f.requests.length,0);
 assert.equal((await f.account()).subscription_status,'active');
});
test('new modern-API invoice can arrive before checkout.completed and binds only the server-created session',async()=>{
 const f=await fixture({bound:false,status:'trial'});assert.equal((await f.action('checkout')).status,200);
 const session=f.objects.get('checkout/sessions/cs_new');session.status='complete';session.subscription='sub_A';
 f.objects.get('subscriptions/sub_A').metadata.learning_hub_attempt=session.client_reference_id;
 assert.equal((await f.event()).status,200);const a=await f.account();assert.equal(a.subscription_status,'active');assert.equal(a.stripe_subscription_id,'sub_A');assert.ok(a.current_period_end);
 const calls=f.requests.length;assert.equal((await f.event()).data.duplicate,true);assert.equal(f.requests.length,calls);
});
test('untrusted browser reference cannot activate a new subscription, and unpaid Checkout never grants full access',async()=>{
 const f=await fixture({bound:false,status:'trial'});
 assert.equal((await f.event('checkout.session.completed',{id:'cs_forged',customer:'cus_A',subscription:'sub_A',client_reference_id:USER})).data.ignored,true);
 assert.equal((await f.account()).subscription_status,'trial');
 await f.action('checkout');const session=f.objects.get('checkout/sessions/cs_new');session.status='complete';session.subscription='sub_A';
 const subscription=f.objects.get('subscriptions/sub_A');subscription.metadata.learning_hub_attempt=session.client_reference_id;subscription.latest_invoice.status='open';
 assert.equal((await f.event('checkout.session.completed',{...session,payment_status:'unpaid'},{id:'evt_unpaid'})).status,200);
 assert.equal((await f.account()).subscription_status,'past_due');
});
test('delayed failed/paid/deleted events reconcile CURRENT Stripe status rather than replaying stale transitions',async()=>{
 const f=await fixture();
 assert.equal((await f.event('invoice.payment_failed')).status,200);assert.equal((await f.account()).subscription_status,'active');
 const current=f.objects.get('subscriptions/sub_A');current.status='past_due';current.latest_invoice.status='open';
 assert.equal((await f.event('invoice.payment_succeeded',undefined,{id:'evt_late_paid'})).status,200);assert.equal((await f.account()).subscription_status,'past_due');
 current.status='active';current.latest_invoice.status='paid';current.cancel_at_period_end=true;
 assert.equal((await f.event('customer.subscription.updated',current,{id:'evt_cancel_at_end'})).status,200);assert.equal((await f.account()).subscription_status,'active');
 current.status='canceled';
 assert.equal((await f.event('customer.subscription.deleted',current,{id:'evt_deleted'})).status,200);assert.equal((await f.account()).subscription_status,'cancelled');
 assert.equal((await f.event('invoice.payment_succeeded',undefined,{id:'evt_after_deleted'})).status,200);assert.equal((await f.account()).subscription_status,'cancelled');
 current.status='incomplete_expired';assert.equal((await f.event('customer.subscription.updated',current,{id:'evt_incomplete_expired'})).status,200);assert.equal((await f.account()).subscription_status,'cancelled');
});
test('unsupported prices, trials, wrong quantity, unpaid invoices and missing valid periods cannot grant full access',async()=>{
 for(const mutate of [s=>s.items.data[0].price.id='price_other',s=>s.status='trialing',s=>s.items.data[0].quantity=2,s=>s.items.has_more=true,s=>s.latest_invoice.status='open',s=>s.latest_invoice.customer='cus_B',s=>s.items.data[0].current_period_end=1]){
  const f=await fixture();mutate(f.objects.get('subscriptions/sub_A'));assert.equal((await f.event()).status,200);assert.equal((await f.account()).subscription_status,'past_due');
 }
});
test('database failure returns retryable status; account update and event receipt roll back together',async()=>{
 const f=await fixture({status:'past_due'});
 await db.exec("create function billing_test_fail() returns trigger language plpgsql as $$begin raise exception 'test receipt failure';end$$;create trigger billing_test_fail before update on billing_webhook_events for each row execute function billing_test_fail();");
 try{
  assert.equal((await f.event()).status,503);assert.equal((await f.account()).subscription_status,'past_due');
  assert.equal((await db.query('select processed_at from billing_webhook_events')).rows[0].processed_at,null);
  assert.equal((await db.query('select * from billing_account_locks')).rows.length,0);
 }finally{await db.exec('drop trigger billing_test_fail on billing_webhook_events;drop function billing_test_fail()');}
 assert.equal((await f.event()).status,200);assert.equal((await f.account()).subscription_status,'active');
});
test('overlapping deliveries are serialized; expired lease owners cannot commit',async()=>{
 const f=await fixture();const owner=crypto.randomUUID();
 assert.equal(await f.callRPC('billing_claim_event',{p_event_id:'evt_hold',p_user_id:USER,p_livemode:false,p_owner:owner}),'claimed');
 assert.equal((await f.event()).status,503);assert.equal(f.requests.length,0);
 await db.query("update billing_account_locks set expires_at=now()-interval '1 second' where user_id=$1",[USER]);
 assert.equal((await f.event()).status,200);
 await assert.rejects(f.callRPC('billing_finish_event',{p_event_id:'evt_hold',p_user_id:USER,p_owner:owner,p_subscription_id:'sub_A',p_status:'cancelled',p_period_end:null}));
 assert.equal((await f.account()).subscription_status,'active');
});
test('Stripe outages and checkout binding failures expose no checkout URL or private errors',async()=>{
 const f=await fixture({bound:false,status:'trial'});f.failFetch=true;
 const failed=await f.action('checkout');assert.equal(failed.status,503);assert.ok(!failed.data.url);assert.ok(!JSON.stringify(failed).includes('private'));
 f.failFetch=false;f.failRPC='billing_bind_checkout';assert.equal((await f.action('checkout')).status,503);
 assert.equal((await db.query('select checkout_session_id from billing_checkout_attempts')).rows[0].checkout_session_id,null);
 f.failRPC=null;assert.equal((await f.action('checkout')).status,200);
});
test('legacy invoice/subscription period fields remain readable; cross-customer events never overwrite another account',async()=>{
 const f=await fixture();const current=f.objects.get('subscriptions/sub_A');current.current_period_end=future();delete current.items.data[0].current_period_end;
 current.latest_invoice.subscription='sub_A';delete current.latest_invoice.parent;
 assert.equal((await f.event('invoice.payment_succeeded',{customer:'cus_A',subscription:'sub_A'})).status,200);
 const response=await f.event('invoice.payment_succeeded',{customer:'cus_B',parent:{subscription_details:{subscription:'sub_A'}}},{id:'evt_cross'});assert.equal(response.status,409);
 assert.equal((await db.query('select subscription_status from accounts where user_id=$1',[OTHER])).rows[0].subscription_status,'trial');
});

test('a wrong amount or interval is rejected before a Checkout session is created',async()=>{
 const f=await fixture({bound:false,status:'trial'});f.objects.get('prices/'+price).unit_amount=999;
 assert.equal((await f.action('checkout')).status,409);
 assert.equal(f.requests.some(r=>r.path==='checkout/sessions'),false);
});
test('a newly paid subscription can replace a canceled one, while old deletion events cannot restore the previous binding',async()=>{
 for(const terminal of ['canceled','incomplete_expired']){
 const f=await fixture({status:'cancelled'});f.objects.get('subscriptions/sub_A').status=terminal;
 assert.equal((await f.action('checkout')).status,200);
 const session=f.objects.get('checkout/sessions/cs_new');session.status='complete';session.subscription='sub_new';
 const newer=sub('sub_new',{created:200,metadata:{learning_hub_attempt:session.client_reference_id}});f.objects.set('subscriptions/sub_new',newer);
 assert.equal((await f.event('invoice.payment_succeeded',{customer:'cus_A',parent:{subscription_details:{subscription:'sub_new'}}})).status,200);
 assert.equal((await f.account()).stripe_subscription_id,'sub_new');
 assert.equal((await f.event('customer.subscription.deleted',f.objects.get('subscriptions/sub_A'),{id:'evt_old_cancel'})).data.ignored,true);
 assert.equal((await f.account()).stripe_subscription_id,'sub_new');assert.equal((await f.account()).subscription_status,'active');
 }
});

test('a paid Stripe subscription blocks a second Checkout even if the database has not received its webhook',async()=>{
 const f=await fixture({bound:false,status:'trial'});
 f.objects.get('subscriptions').data.push(f.objects.get('subscriptions/sub_A'));
 assert.equal((await f.action('checkout')).status,409);
 assert.equal(f.requests.some(r=>r.path==='checkout/sessions'&&r.body),false);
 assert.equal((await f.account()).subscription_status,'trial');
});

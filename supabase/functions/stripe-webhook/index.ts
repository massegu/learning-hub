import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// One deployable file: signed Stripe events and authenticated checkout/portal actions.
// Never deploy this function with gateway JWT verification enabled: Stripe has no user JWT.
// Checkout/portal ALWAYS verify the user token explicitly below.
const API_VERSION = '2026-08-26.dahlia';
const EVENTS = new Set(['checkout.session.completed','customer.subscription.updated','customer.subscription.deleted','invoice.payment_failed','invoice.payment_succeeded']);
class BillingError extends Error { status: number; constructor(status: number, message: string) { super(message); this.status=status; } }
const fail = (status: number, message: string): never => { throw new BillingError(status,message); };
const ref = (value: any): string | null => typeof value==='string'?value:(value?.id||null);
const invoiceSubscription = (invoice: any): string | null => ref(invoice?.parent?.subscription_details?.subscription)||ref(invoice?.subscription);
function config() {
  const env=(key: string)=>Deno.env.get(key)||'';
  const mode=env('STRIPE_MODE'), secret=env('STRIPE_SECRET_KEY'),price=env('STRIPE_PRICE_ID');
  if(!env('STRIPE_WEBHOOK_SECRET').startsWith('whsec_'))fail(503,'Falta la configuración de firma.');
  if(!['test','live'].includes(mode)||!new RegExp(`^(sk|rk)_${mode}_`).test(secret)||!/^price_[A-Za-z0-9]+$/.test(price))fail(503,'Configuración de pagos incompleta.');
  let app: URL;try{app=new URL(env('BILLING_APP_URL'));}catch{fail(503,'Falta la dirección de Learning Hub.');}
  if(app!.protocol!=='https:'||app!.username||app!.password||app!.search||app!.hash)fail(503,'Dirección de Learning Hub no válida.');
  return {live:mode==='live',secret,price,app:app!.href,origin:app!.origin,webhook:env('STRIPE_WEBHOOK_SECRET')};
}
async function signature(payload: string, header: string | null, secret: string) {
  if(!header||!secret)return false;
  const fields=header.split(',').map(x=>x.trim()),t=fields.find(x=>x.startsWith('t='))?.slice(2);
  if(!t||!/^\d+$/.test(t)||Math.abs(Date.now()/1000-Number(t))>300)return false;
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const bytes=new TextEncoder().encode(t+'.'+payload);
  for(const entry of fields.filter(x=>/^v1=[0-9a-f]{64}$/i.test(x))){
    const digest=Uint8Array.from(entry.slice(3).match(/../g)!,x=>parseInt(x,16));
    if(await crypto.subtle.verify('HMAC',key,digest,bytes))return true;
  }
  return false;
}
async function stripe(cfg: ReturnType<typeof config>,path: string,params?: Record<string,string>,idempotency?: string) {
  const headers: Record<string,string>={Authorization:'Bearer '+cfg.secret,'Stripe-Version':API_VERSION};
  if(params)headers['Content-Type']='application/x-www-form-urlencoded';
  if(idempotency)headers['Idempotency-Key']=idempotency;
  let response: Response;
  try{response=await fetch('https://api.stripe.com/v1/'+path,{method:params?'POST':'GET',headers,body:params?new URLSearchParams(params):undefined,signal:AbortSignal.timeout(12000)});}catch{fail(503,'Stripe no responde. Inténtalo de nuevo.');}
  let body: any;try{body=await response!.json();}catch{fail(503,'Respuesta de Stripe no válida.');}
  if(!response!.ok)fail(503,'No se ha podido confirmar el estado en Stripe.');
  return body;
}
async function rpc(admin: any,name: string,params: Record<string,unknown>) {
  const {data,error}=await admin.rpc(name,params);
  if(error)fail(503,'No se ha podido guardar el estado del pago.');
  return data;
}
async function accountBy(admin: any,column: string,value: string) {
  const {data,error}=await admin.from('accounts').select('user_id,subscription_status,stripe_customer_id,stripe_subscription_id').eq(column,value).maybeSingle();
  if(error)fail(503,'No se ha podido consultar la cuenta.');
  return data;
}
function sameMode(object: any,cfg: ReturnType<typeof config>) {
  if(object?.livemode!==cfg.live)fail(400,'El objeto de Stripe pertenece a otro entorno.');
}
function priceAllowed(sub: any,price: string) {
  return sub.items?.has_more===false&&sub.items?.data?.length===1&&ref(sub.items.data[0].price)===price&&sub.items.data[0].quantity===1;
}
function periodEnd(sub: any,price: string) {
  const seconds=sub.items?.data?.find((it: any)=>ref(it.price)===price)?.current_period_end??sub.current_period_end;
  if(!Number.isFinite(seconds)||seconds<=0||seconds>8640000000000)return null;
  return new Date(seconds*1000).toISOString();
}
async function checkout(admin: any,cfg: ReturnType<typeof config>,user: any) {
  const account=await accountBy(admin,'user_id',user.id);
  if(!account)fail(404,'Cuenta no encontrada.');
  if(['active','past_due'].includes(account.subscription_status))fail(409,'Ya tienes una suscripción. Utiliza Gestionar suscripción.');
  const plan=await stripe(cfg,'prices/'+encodeURIComponent(cfg.price));sameMode(plan,cfg);
  if(plan.id!==cfg.price||!plan.active||plan.type!=='recurring'||plan.currency!=='eur'||plan.unit_amount!==1999||plan.recurring?.interval!=='month'||plan.recurring?.interval_count!==1)fail(409,'El precio no coincide con el plan de 19,99 EUR al mes de Learning Hub.');
  const attempt=await rpc(admin,'billing_prepare_checkout',{p_user_id:user.id,p_livemode:cfg.live,p_price_id:cfg.price});
  let customer=attempt.account_customer_id;
  if(customer){const record=await stripe(cfg,'customers/'+encodeURIComponent(customer));sameMode(record,cfg);if(record.deleted)fail(409,'El cliente de Stripe necesita revisión.');}
  else{const record=await stripe(cfg,'customers',{'metadata[learning_hub_user_id]':user.id},`lh:customer:${cfg.live}:${user.id}`);sameMode(record,cfg);customer=record.id;}
  // The DB may lag a successful payment. Check Stripe before offering another charge.
  const existing=await stripe(cfg,'subscriptions?customer='+encodeURIComponent(customer)+'&status=all&limit=100');
  if(existing.has_more||!Array.isArray(existing.data))fail(503,'No se ha podido verificar si ya existe una suscripción.');
  if(existing.data.some((sub: any)=>!['canceled','incomplete_expired'].includes(sub.status)))fail(409,'Stripe ya tiene una suscripción para esta cuenta. No repitas el pago; comprueba su estado en Gestionar suscripción.');
  let session;
  if(attempt.checkout_session_id)session=await stripe(cfg,'checkout/sessions/'+encodeURIComponent(attempt.checkout_session_id));
  else session=await stripe(cfg,'checkout/sessions',{
    mode:'subscription',customer,'line_items[0][price]':cfg.price,'line_items[0][quantity]':'1',
    client_reference_id:attempt.id,'metadata[learning_hub_attempt]':attempt.id,
    'subscription_data[metadata][learning_hub_attempt]':attempt.id,
    'payment_method_types[0]':'card',success_url:cfg.app+'?pago=pendiente',cancel_url:cfg.app+'?pago=cancelado',
    expires_at:String(Math.floor(new Date(attempt.expires_at).getTime()/1000))
  },'lh:checkout:'+attempt.id);
  sameMode(session,cfg);
  if(ref(session.customer)!==customer||session.mode!=='subscription'||session.client_reference_id!==attempt.id)fail(409,'La sesión de pago no corresponde a esta cuenta.');
  if(session.status!=='open'||!session.url)fail(409,'Este pago ya finalizó o caducó. Actualiza Learning Hub para comprobar tu suscripción.');
  await rpc(admin,'billing_bind_checkout',{p_attempt_id:attempt.id,p_customer_id:customer,p_session_id:session.id});
  return {url:session.url,livemode:cfg.live};
}
async function portal(admin: any,cfg: ReturnType<typeof config>,user: any) {
  const account=await accountBy(admin,'user_id',user.id);
  if(!account?.stripe_customer_id)fail(409,'Esta cuenta todavía no tiene un cliente de Stripe.');
  const customer=await stripe(cfg,'customers/'+encodeURIComponent(account.stripe_customer_id));sameMode(customer,cfg);
  if(customer.deleted)fail(409,'El cliente de Stripe necesita revisión.');
  const session=await stripe(cfg,'billing_portal/sessions',{customer:account.stripe_customer_id,return_url:cfg.app});
  return {url:session.url,livemode:cfg.live};
}
async function trustedAttempt(admin: any,cfg: ReturnType<typeof config>,account: any,sub: any) {
  const id=sub.metadata?.learning_hub_attempt;
  if(!id||!/^[0-9a-f-]{36}$/i.test(id))return false;
  const {data:attempt,error}=await admin.from('billing_checkout_attempts').select('*').eq('id',id).maybeSingle();
  if(error)fail(503,'No se ha podido verificar el origen del pago.');
  if(!attempt||attempt.user_id!==account.user_id||attempt.livemode!==cfg.live||attempt.price_id!==cfg.price||attempt.customer_id!==account.stripe_customer_id||!attempt.checkout_session_id)return false;
  const session=await stripe(cfg,'checkout/sessions/'+encodeURIComponent(attempt.checkout_session_id));sameMode(session,cfg);
  return session.mode==='subscription'&&session.status==='complete'&&session.client_reference_id===id&&ref(session.customer)===account.stripe_customer_id&&ref(session.subscription)===sub.id;
}
async function webhook(admin: any,cfg: ReturnType<typeof config>,event: any) {
  if(!event||typeof event.id!=='string'||!event.id.startsWith('evt_')||!Number.isFinite(event.created)||event.account)fail(400,'Evento de Stripe no válido.');
  sameMode(event,cfg);
  if(!EVENTS.has(event.type))return {received:true,ignored:true};
  const obj=event.data?.object;
  if(!obj)fail(400,'Falta el objeto del evento.');
  const customer=ref(obj.customer);
  const subscription=event.type.startsWith('customer.subscription.')?obj.id:event.type==='checkout.session.completed'?ref(obj.subscription):invoiceSubscription(obj);
  if(!customer||!subscription)return {received:true,ignored:true};
  // Identity comes ONLY from server-bound Stripe customer IDs, never client_reference_id from a browser.
  const initial=await accountBy(admin,'stripe_customer_id',customer);
  if(!initial)return {received:true,ignored:true};
  const owner=crypto.randomUUID();
  const claim=await rpc(admin,'billing_claim_event',{p_event_id:event.id,p_user_id:initial.user_id,p_livemode:cfg.live,p_owner:owner});
  if(claim==='duplicate')return {received:true,duplicate:true};
  if(claim!=='claimed')fail(503,'Hay otra actualización de esta cuenta en curso. Reintentar.');
  try{
    // Re-read only AFTER the cross-request lease. A delayed event fetches CURRENT Stripe state.
    const account=await accountBy(admin,'user_id',initial.user_id);
    if(!account||account.stripe_customer_id!==customer)fail(409,'La cuenta del pago ha cambiado.');
    const sub=await stripe(cfg,'subscriptions/'+encodeURIComponent(subscription)+'?expand[]=latest_invoice');sameMode(sub,cfg);
    if(sub.id!==subscription||ref(sub.customer)!==customer)fail(409,'Suscripción y cliente no coinciden.');
    const known=account.stripe_subscription_id===sub.id;
    let trusted=known||await trustedAttempt(admin,cfg,account,sub);
    if(trusted&&!known&&account.stripe_subscription_id){
      const previous=await stripe(cfg,'subscriptions/'+encodeURIComponent(account.stripe_subscription_id));sameMode(previous,cfg);
      // Canceled Stripe subscriptions are terminal. An older subscription can never replace a newer one.
      trusted=['canceled','incomplete_expired'].includes(previous.status)&&sub.created>previous.created;
    }
    const allowed=priceAllowed(sub,cfg.price);
    let status: string | null=null,end: string | null=null;
    if(trusted){
      end=periodEnd(sub,cfg.price);
      let invoice=sub.latest_invoice;
      if(allowed&&sub.status==='active'&&typeof invoice==='string')invoice=await stripe(cfg,'invoices/'+encodeURIComponent(invoice));
      if(invoice&&typeof invoice==='object')sameMode(invoice,cfg);
      const paid=invoice?.status==='paid'&&ref(invoice.customer)===customer&&invoiceSubscription(invoice)===sub.id;
      status=['canceled','incomplete_expired'].includes(sub.status)?'cancelled':allowed&&sub.status==='active'&&paid&&end&&new Date(end).getTime()>Date.now()?'active':'past_due';
    }
    await rpc(admin,'billing_finish_event',{p_event_id:event.id,p_user_id:account.user_id,p_owner:owner,p_subscription_id:trusted?sub.id:null,p_status:status,p_period_end:end});
    return {received:true,...(!trusted?{ignored:true}:{})};
  }catch(error){
    try{await rpc(admin,'billing_release_event',{p_user_id:initial.user_id,p_owner:owner});}catch{/* Lease expires automatically; never acknowledge a failed update. */}
    throw error;
  }
}
Deno.serve(async(req: Request)=>{
  const headers: Record<string,string>={'Content-Type':'application/json','Cache-Control':'no-store'};
  const reply=(body: unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
  try{
    const cfg=config(),origin=req.headers.get('Origin');
    if(origin===cfg.origin){headers['Access-Control-Allow-Origin']=origin;headers.Vary='Origin';headers['Access-Control-Allow-Headers']='authorization, x-client-info, apikey, content-type';headers['Access-Control-Allow-Methods']='POST, OPTIONS';}
    if(req.method==='OPTIONS')return origin===cfg.origin?new Response(null,{status:204,headers}):reply({error:'Origen no permitido.'},403);
    if(req.method!=='POST')return reply({error:'Método no permitido.'},405);
    const payload=await req.text();if(new TextEncoder().encode(payload).length>262144)fail(413,'Petición demasiado grande.');
    const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
    if(req.headers.has('stripe-signature')){
      if(!cfg.webhook)fail(503,'Falta la configuración de firma.');
      if(!await signature(payload,req.headers.get('stripe-signature'),cfg.webhook))fail(400,'Firma de Stripe no válida.');
      let event;try{event=JSON.parse(payload);}catch{fail(400,'JSON no válido.');}
      return reply(await webhook(admin,cfg,event));
    }
    if(origin&&origin!==cfg.origin)fail(403,'Origen no permitido.');
    const token=req.headers.get('Authorization');if(!token?.startsWith('Bearer '))fail(401,'Inicia sesión en Learning Hub.');
    const {data,error}=await admin.auth.getUser(token.slice(7));if(error||!data?.user)fail(401,'Tu sesión ha caducado. Vuelve a entrar.');
    let body;try{body=JSON.parse(payload);}catch{fail(400,'JSON no válido.');}
    if(body.mode!==(cfg.live?'live':'test'))fail(409,'La web y Stripe están configurados en entornos diferentes.');
    if(body.action==='checkout')return reply(await checkout(admin,cfg,data.user));
    if(body.action==='portal')return reply(await portal(admin,cfg,data.user));
    return reply({error:'Acción no válida.'},400);
  }catch(error){
    // Never log raw events, bearer tokens, Stripe responses or secrets.
    const known=error instanceof BillingError;
    console.error('billing_request_failed',known?error.status:500);
    return reply({error:known?error.message:'No se ha podido procesar el pago. Inténtalo de nuevo.'},known?error.status:500);
  }
});

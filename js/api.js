(function(){
  const cfg=window.LH_CONFIG;
  if(!window.supabase||!cfg) throw new Error('Supabase config missing');
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey);
  const API={client,session:null,user:null,contentLocale:null,localeRevision:0};
  API.effectiveLocale=profile=>window.LocaleContent.effective(profile || {locale:API.profileLocale},API.contentLocale);
  API.setContentLocale=value=>{
    const next=value==null?null:window.LocaleContent.normalize(value);
    if(next===API.contentLocale)return;
    API.contentLocale=next;API.localeRevision++;
    window.dispatchEvent(new CustomEvent('lh:locale-change'));
  };
  API.loadContentLocale=async()=>{const revision=API.localeRevision;const {data,error}=await client.from('accounts').select('content_locale').single();if(error)throw error;if(revision===API.localeRevision)API.setContentLocale(data?.content_locale);return API.contentLocale;};
  API.saveContentLocale=async locale=>{const normalized=window.LocaleContent.normalize(locale);const {error}=await client.from('accounts').update({content_locale:normalized}).eq('user_id',API.user.id);if(error)throw error;API.setContentLocale(normalized);return normalized;};
  API.getSession=async()=>{const {data}=await client.auth.getSession();API.session=data.session||null;API.user=API.session?.user||null;return API.session};
  API.signIn=async(email,password)=>{const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;API.session=data.session;API.user=data.user;return data};
  API.signUp=async(email,password)=>{
    email=typeof email==='string'?email.trim():'';
    if(!email)throw new Error('Escribe tu email para crear una cuenta.');
    if(typeof password!=='string'||!password)throw new Error('Escribe una contraseña para crear una cuenta.');
    const {data,error}=await client.auth.signUp({email,password});if(error)throw error;
    API.session=data.session||null;API.user=API.session?.user||null;return data;
  };
  API.resetPassword=async(email)=>{
    const redirect=new URL(window.location.pathname,window.location.origin);
    redirect.searchParams.set('recuperar','1');
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:redirect.href});
    if(error)throw error;
  };
  API.changePassword=async(password)=>{const {error}=await client.auth.updateUser({password});if(error)throw error;};
  API.signOut=async()=>{await client.auth.signOut();API.session=null;API.user=null;API.profileLocale=null;API.setContentLocale(null)};
  API.listProfiles=async()=>{const {data,error}=await client.from('learner_profiles').select('id,name,age_band,locale,progress,created_at').order('created_at');if(error)throw error;return data||[]};
  API.createProfile=async(name,age_band,initial_level=1,locale='es_intl')=>{const {data,error}=await client.from('learner_profiles').insert({account_id:API.user.id,name,age_band,locale,progress:{initialLevel:Number(initial_level)||1}}).select('id,name,age_band,locale,progress,created_at').single();if(error)throw error;return data};
  API.updateProfileLocale=async(id,locale)=>{const {data,error}=await client.from('learner_profiles').update({locale}).eq('id',id).select('id,name,age_band,locale,progress,created_at').single();if(error)throw error;return data};
  API.deleteProfile=async(id)=>{const {error}=await client.from('learner_profiles').delete().eq('id',id);if(error)throw error};
  API.saveProgress=async(id,progress)=>{const {data:row}=await client.from('learner_profiles').select('progress').eq('id',id).single();const merged={...progress};if(row?.progress?._delivery)merged._delivery=row.progress._delivery;const {error}=await client.from('learner_profiles').update({progress:merged}).eq('id',id);if(error)throw error};
  API.saveResult=async(profile_id,row)=>{const {error}=await client.from('exercise_results').insert({profile_id,occurred_at:row.ts,session_id:row.sessionId,session_started_at:row.sessionStartedAt,subject:row.subject,level:row.level,correct:row.correct,points:row.points,item_id:row.itemId,detail:row.detail});if(error)console.warn('Result insert failed',error)};
  API.getAccount=async()=>{const {data,error}=await client.from('accounts').select('subscription_status,trial_started_at,trial_ends_at,current_period_end,content_locale').single();if(error)throw error;API.setContentLocale(data?.content_locale);return data};
  async function openBilling(action){
    if(!API.user)throw new Error('Inicia sesión para gestionar tu suscripción.');
    const {data,error}=await client.functions.invoke('stripe-webhook',{body:{action,mode:cfg.stripeMode}});
    if(error){
      let message='No se ha podido abrir Stripe. Inténtalo de nuevo.';
      try{const body=await error.context.clone().json();if(body?.error)message=body.error;}catch{}
      throw new Error(message);
    }
    const expected=action==='checkout'?'checkout.stripe.com':'billing.stripe.com';
    let url;try{url=new URL(data?.url);}catch{throw new Error('Stripe no ha devuelto una dirección válida.');}
    if(url.protocol!=='https:'||url.hostname!==expected||url.username||url.password||data?.livemode!==(cfg.stripeMode==='live'))throw new Error('No se ha podido verificar el destino de pago.');
    window.location.assign(url.href);
  }
  API.openStripeCheckout=()=>openBilling('checkout');
  API.openBillingPortal=()=>openBilling('portal');
  API.requestContent=async(payload)=>{const {data,error}=await client.functions.invoke('request-learning-content',{body:payload});if(error){let msg=error.message||'No se pudo cargar el contenido.';try{const ctx=error.context;if(ctx&&typeof ctx.clone==='function'){const body=await ctx.clone().json();if(body?.error)msg=body.error;}else if(ctx?.body?.error)msg=ctx.body.error;}catch(_){}const e=new Error(msg);e.original=error;throw e;}return data};
  window.LearningAPI=API;
})();

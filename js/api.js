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
  API.signUp=async(email,password)=>{const {data,error}=await client.auth.signUp({email,password});if(error)throw error;API.session=data.session;API.user=data.user;return data};
  API.resetPassword=async(email)=>{
    const redirect=new URL(window.location.pathname,window.location.origin);
    redirect.searchParams.set('recuperar','1');
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:redirect.href});
    if(error)throw error;
  };
  API.changePassword=async(password)=>{const {error}=await client.auth.updateUser({password});if(error)throw error;};
  API.independentProfile=null;
  API.setIndependent=id=>{API.independentProfile=id||null;};
  API.isIndependent=id=>API.independentProfile===id;
  API.signOut=async()=>{API.setIndependent(null);await client.auth.signOut();API.session=null;API.user=null;API.profileLocale=null;API.setContentLocale(null)};
  API.listProfiles=async()=>{const {data,error}=await client.from('learner_profiles').select('id,name,age_band,locale,progress,created_at').order('created_at');if(error)throw error;return (data||[]).map(p=>{p.progress=window.PrivacyControls.minimize(p.progress);return p;})};
  API.createProfile=async(name,age_band,initial_level=1,locale='es_intl')=>{const {data,error}=await client.from('learner_profiles').insert({account_id:API.user.id,name,age_band,locale,progress:{initialLevel:Number(initial_level)||1}}).select('id,name,age_band,locale,progress,created_at').single();if(error)throw error;return data};
  API.updateProfileLocale=async(id,locale)=>{const {data,error}=await client.from('learner_profiles').update({locale}).eq('id',id).select('id,name,age_band,locale,progress,created_at').single();if(error)throw error;return data};
  API.deleteProfile=async(id)=>API.privacy('delete',id);
  API.saveProgress=async(id,progress)=>{if(API.isIndependent(id)||progress?._sessionOnly)return;const {data:row}=await client.from('learner_profiles').select('progress').eq('id',id).single();const merged=window.PrivacyControls.minimize(progress);if(row?.progress?._delivery)merged._delivery=row.progress._delivery;const {error}=await client.from('learner_profiles').update({progress:merged}).eq('id',id);if(error)throw error};
  API.saveResult=async(profile_id,row)=>{if(API.isIndependent(profile_id)||row?.sessionOnly)return;const {error}=await client.from('exercise_results').insert({profile_id,occurred_at:row.ts,session_id:row.sessionId,session_started_at:row.sessionStartedAt,subject:row.subject,level:row.level,correct:row.correct,points:row.points,item_id:row.itemId,detail:row.detail});if(error)console.warn('Result insert failed',error)};
  API.privacy=async(action,id,settings={})=>{if(API.isIndependent(id))throw new Error('Termina la sesión independiente para gestionar el perfil.');const {data,error}=await client.rpc('manage_learner_privacy',{p_action:action,p_profile:id,p_alias:settings.alias??null,p_review_at:settings.reviewAt??null});if(error)throw new Error('No se ha podido completar la gestión de privacidad. Inténtalo de nuevo o contacta con soporte.');return data;};
  API.recordAccess=id=>typeof client.rpc==='function'?API.privacy('open',id).catch(()=>null):Promise.resolve(null);
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

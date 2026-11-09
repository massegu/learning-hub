(function(){
  const cfg=window.LH_CONFIG;
  if(!window.supabase||!cfg) throw new Error('Supabase config missing');
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey);
  const API={client,session:null,user:null,contentLocale:null,localeRevision:0};
  const progressWriteQueues=new Map();
  const resultWriteQueues=new Map();
  const resultOutboxPrefix='lh:result-outbox:v1:';
  function newAttemptId(){
    if(window.crypto?.randomUUID)return window.crypto.randomUUID();
    if(!window.crypto?.getRandomValues)throw new Error('Este navegador no permite generar un identificador seguro para el intento.');
    const bytes=window.crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&0x0f)|0x40;bytes[8]=(bytes[8]&0x3f)|0x80;
    const hex=[...bytes].map(value=>value.toString(16).padStart(2,'0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }
  function resultOutboxKey(profileId,attemptId){
    if(!API.user?.id)throw new Error('La sesión no está disponible para proteger el intento pendiente.');
    return `${resultOutboxPrefix}${encodeURIComponent(API.user.id)}:${encodeURIComponent(profileId)}:${attemptId}`;
  }
  function readOutboxRecord(key){
    const raw=window.localStorage.getItem(key);return raw?JSON.parse(raw):null;
  }
  function writeOutboxRecord(key,record){window.localStorage.setItem(key,JSON.stringify(record));}
  function classifyResultError(error){
    const status=Number(error?.status||error?.context?.status||0),code=String(error?.code||'');
    return status>=500||!status&&!/^(?:22|23|28|42|PGRST)/.test(code)?'uncertain':'failed';
  }
  function resultPayload(record){
    return {
      profile_id:record.profile_id,
      client_attempt_id:record.client_attempt_id,
      occurred_at:record.occurred_at,
      session_id:record.session_id,
      session_started_at:record.session_started_at,
      subject:record.subject,
      level:record.level,
      correct:record.correct,
      points:record.points,
      item_id:record.item_id,
      detail:record.detail,
    };
  }
  function queueRecord(record){
    const key=resultOutboxKey(record.profile_id,record.client_attempt_id);
    const previous=resultWriteQueues.get(key)||Promise.resolve();
    const operation=previous.catch(()=>{}).then(async()=>{
      const persisted=readOutboxRecord(key)||record;
      try{
        persisted.state='pending';persisted.updated_at=new Date().toISOString();writeOutboxRecord(key,persisted);
        const {error}=await client.from('exercise_results').upsert(resultPayload(persisted),{onConflict:'profile_id,client_attempt_id',ignoreDuplicates:true});
        if(error)throw error;
        window.localStorage.removeItem(key);
        return {state:'confirmed',clientAttemptId:persisted.client_attempt_id};
      }catch(error){
        persisted.state=classifyResultError(error);persisted.updated_at=new Date().toISOString();
        try{writeOutboxRecord(key,persisted);}catch(storageError){error.storageError=storageError;}
        const wrapped=new Error(error?.message||'No se pudo confirmar el guardado del resultado.');
        wrapped.name='ResultSaveError';wrapped.state=persisted.state;wrapped.clientAttemptId=persisted.client_attempt_id;wrapped.cause=error;
        throw wrapped;
      }
    });
    const tail=operation.then(()=>undefined,()=>undefined);resultWriteQueues.set(key,tail);
    tail.then(()=>{if(resultWriteQueues.get(key)===tail)resultWriteQueues.delete(key);});
    return operation;
  }
  API.createAttemptId=newAttemptId;
  API.pendingResults=profileId=>{
    if(!API.user?.id||API.isIndependent(profileId))return [];
    const prefix=`${resultOutboxPrefix}${encodeURIComponent(API.user.id)}:${encodeURIComponent(profileId)}:`;
    const pending=[];
    for(let index=0;index<window.localStorage.length;index++){
      const key=window.localStorage.key(index);if(!key?.startsWith(prefix))continue;
      try{const record=readOutboxRecord(key);if(record?.profile_id===profileId&&record.client_attempt_id)pending.push(record);}catch{}
    }
    return pending.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));
  };
  API.retryPendingResults=async(profileId,{includeFailed=false}={})=>{
    if(API.isIndependent(profileId))return {attempted:0,confirmed:0,failed:0,uncertain:0,remaining:0};
    const pending=API.pendingResults(profileId).filter(record=>includeFailed||record.state!=='failed');
    let confirmed=0,failed=0,uncertain=0;
    for(const record of pending){
      try{await queueRecord(record);confirmed++;}
      catch(error){if(error.state==='uncertain')uncertain++;else failed++;}
    }
    return {attempted:pending.length,confirmed,failed,uncertain,remaining:API.pendingResults(profileId).length};
  };
  API.clearPendingResults=profileId=>{
    if(!API.user?.id)return;
    const prefix=`${resultOutboxPrefix}${encodeURIComponent(API.user.id)}:${encodeURIComponent(profileId)}:`;
    for(let index=window.localStorage.length-1;index>=0;index--){const key=window.localStorage.key(index);if(key?.startsWith(prefix))window.localStorage.removeItem(key);}
  };
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
  API.signUp=async(email,password)=>{const redirectTo=new URL(window.location.pathname,window.location.origin).href;const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}});if(error)throw error;API.session=data.session;API.user=data.user;return data};
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
  API.deleteProfile=async(id)=>{const result=await API.privacy('delete',id);API.clearPendingResults(id);return result;};
  API.saveProgress=(id,progress)=>{
    if(API.isIndependent(id)||progress?._sessionOnly)return Promise.resolve(false);
    // Capture the exact state at invocation time; the caller may mutate it while queued.
    const snapshot=typeof structuredClone==='function'?structuredClone(progress):JSON.parse(JSON.stringify(progress));
    const previous=progressWriteQueues.get(id)||Promise.resolve();
    const operation=previous.catch(()=>{}).then(async()=>{
      const {data:row,error:readError}=await client.from('learner_profiles').select('progress').eq('id',id).single();
      if(readError)throw readError;
      const merged=window.PrivacyControls.minimize(snapshot);
      if(row?.progress?._delivery)merged._delivery=row.progress._delivery;
      const {error}=await client.from('learner_profiles').update({progress:merged}).eq('id',id);
      if(error)throw error;
      return true;
    });
    // Keep the queue moving after a failed write, while returning that failure to its caller.
    const tail=operation.then(()=>undefined,()=>undefined);
    progressWriteQueues.set(id,tail);
    tail.then(()=>{if(progressWriteQueues.get(id)===tail)progressWriteQueues.delete(id);});
    return operation;
  };
  API.saveResult=async(profile_id,row)=>{
    if(API.isIndependent(profile_id)||row?.sessionOnly)return false;
    const clientAttemptId=row?.clientAttemptId||row?.client_attempt_id||newAttemptId();
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientAttemptId))throw new Error('El identificador del intento no es válido.');
    const record={profile_id,client_attempt_id:clientAttemptId,occurred_at:row.ts,session_id:row.sessionId||null,session_started_at:row.sessionStartedAt||null,subject:row.subject,level:row.level,correct:Boolean(row.correct),points:Number(row.points)||0,item_id:row.itemId||null,detail:row.detail||null,state:'pending',created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
    try{
      const key=resultOutboxKey(profile_id,clientAttemptId);
      const existing=readOutboxRecord(key);
      if(existing)return await queueRecord(existing);
      writeOutboxRecord(key,record);
    }catch(error){
      const wrapped=new Error('No se pudo preparar el guardado recuperable de este resultado. El envío no se ha realizado; vuelve a intentarlo mientras sigues en este perfil.');
      wrapped.name='ResultSaveError';wrapped.state='failed';wrapped.clientAttemptId=clientAttemptId;wrapped.cause=error;throw wrapped;
    }
    return queueRecord(record);
  };
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

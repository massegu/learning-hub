(function(){
  const cfg=window.LH_CONFIG;
  if(!window.supabase||!cfg) throw new Error('Supabase config missing');
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey);
  const API={client,session:null,user:null};
  API.getSession=async()=>{const {data}=await client.auth.getSession();API.session=data.session||null;API.user=API.session?.user||null;return API.session};
  API.signIn=async(email,password)=>{const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;API.session=data.session;API.user=data.user;return data};
  API.signUp=async(email,password)=>{const {data,error}=await client.auth.signUp({email,password});if(error)throw error;API.session=data.session;API.user=data.user;return data};
  API.signOut=async()=>{await client.auth.signOut();API.session=null;API.user=null};
  API.listProfiles=async()=>{const {data,error}=await client.from('learner_profiles').select('id,name,age_band,progress,created_at').order('created_at');if(error)throw error;return data||[]};
  API.createProfile=async(name,age_band)=>{const {data,error}=await client.from('learner_profiles').insert({account_id:API.user.id,name,age_band,progress:{}}).select('id,name,age_band,progress,created_at').single();if(error)throw error;return data};
  API.deleteProfile=async(id)=>{const {error}=await client.from('learner_profiles').delete().eq('id',id);if(error)throw error};
  API.saveProgress=async(id,progress)=>{const {data:row}=await client.from('learner_profiles').select('progress').eq('id',id).single();const merged={...progress};if(row?.progress?._delivery)merged._delivery=row.progress._delivery;const {error}=await client.from('learner_profiles').update({progress:merged}).eq('id',id);if(error)throw error};
  API.saveResult=async(profile_id,row)=>{const {error}=await client.from('exercise_results').insert({profile_id,occurred_at:row.ts,session_id:row.sessionId,session_started_at:row.sessionStartedAt,subject:row.subject,level:row.level,correct:row.correct,points:row.points,item_id:row.itemId,detail:row.detail});if(error)console.warn('Result insert failed',error)};
  API.getAccount=async()=>{const {data,error}=await client.from('accounts').select('subscription_status,trial_started_at,trial_ends_at,current_period_end').single();if(error)throw error;return data};
  API.requestContent=async(payload)=>{const {data,error}=await client.functions.invoke('request-learning-content',{body:payload});if(error)throw error;return data};
  window.LearningAPI=API;
})();

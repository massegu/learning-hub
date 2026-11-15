// Enumerates current authored pools and every bounded historical teen variant.
// Uses the real Edge modules offline. No production service/database access.
const fs=require('node:fs'),load=require('./edge-harness'),locale=require('../js/locale-content');
const early=require('../js/early-content'),teen=require('../supabase/functions/request-learning-content/teen-review');
const {api}=load(),countries=Object.keys(locale.labels),report={};
const visible=it=>JSON.stringify([it.q,it.stimulus,it.scenario,it.text,it.opts,it.a,it.answer,it.memoryContent,it.memoryQuestion,it.why,it.writingRubric]);
function pool(age,domain,level){
  if(age==='early')return early.pool(domain,level);
  if(['junior','primary','middle'].includes(age))return api[age].pool(domain,level);
  if(['teenLanguage','literacy','speedReasoning'].includes(domain))return teen.pool(domain,level);
  const n=['executive','applied'].includes(domain)?400:['teenMath','english'].includes(domain)?300:360;
  return Array.from({length:n},(_,v)=>domain==='teenMath'?api.variantMath(age,domain,level,v):domain==='english'?api.variantEnglish(age,domain,level,v):domain==='social'?api.matrixSocial18(age,domain,level,v):({attention:api.matrixAttention18,memory:api.matrixMemory18,executive:api.matrixExecutive20,applied:api.matrixApplied20}[domain])(age,level,v));
}
for(const age of ['early','junior','primary','middle','teen']){
  report[age]={};
  for(const domain of api.SUBJECTS[age]){
    report[age][domain]={};
    for(const level of [1,2,3]){
      const items=pool(age,domain,level).map(it=>api.normalizeItem(it)),results={};
      for(const country of countries){
        const failures={},samples=[];let accepted=0,changed=0;
        for(const raw of items){
          try{
            const localized=locale.localizeItem(raw,country,domain);
            if(!api.validateItem(localized))throw new Error('Invalid response structure');
            accepted++;if(visible(localized)!==visible(raw)){changed++;if(samples.length<3)samples.push({q:localized.q,stimulus:localized.stimulus,scenario:localized.scenario});}
          }catch(error){failures[error.message]=(failures[error.message]||0)+1;}
        }
        results[country]={candidates:items.length,accepted,changed,rejected:items.length-accepted,failures,samples};
        if(!accepted)throw new Error(`No compatible pool: ${age}/${domain}/${level}/${country}`);
      }
      report[age][domain][level]=results;
    }
  }
}
const destination=process.argv[2]||'/tmp/locale-production-audit.json';fs.writeFileSync(destination,JSON.stringify(report,null,2)+'\n');
for(const country of countries){
  let candidates=0,accepted=0,changed=0;const failures={};
  for(const domains of Object.values(report))for(const levels of Object.values(domains))for(const entry of Object.values(levels)){
    const r=entry[country];candidates+=r.candidates;accepted+=r.accepted;changed+=r.changed;
    for(const [message,n] of Object.entries(r.failures))failures[message]=(failures[message]||0)+n;
  }
  console.log(JSON.stringify({country,candidates,accepted,changed,rejected:candidates-accepted,failures}));
}
console.log('Report:',destination);

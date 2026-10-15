// Local browser test server bridge: real handler, fake owned account/DB, no SDK/network.
const readline=require('node:readline'),{context}=require('./edge-harness')();
const route=process.argv[2]||'junior';if(!['early','junior','primary','middle','teen'].includes(route))throw new Error('Unknown offline test route');
const profile={id:route,account_id:'account',age_band:['middle','teen'].includes(route)?route:'primary',progress:{ageRoute:route}};
const account={subscription_status:'active',content_locale:'es_es'},seen=[],usage={};
context.Deno.env.get=()=> 'offline-test-placeholder';
context.createClient=()=>({auth:{getUser:async()=>({data:{user:{id:'account'}}})},from(table){
  const filters=[];let op,values,maximum=500;
  const q={select(){return q},eq(k,v){filters.push([k,v]);return q},like(k,v){filters.push([k,v,true]);return q},order(){return q},limit(n){maximum=n;return q},
    insert(v){op='insert';values=v;return q},update(v){op='update';values=v;return q},upsert(v){op='upsert';values=v;return q},
    single(){return Promise.resolve(result())},maybeSingle(){return Promise.resolve(result())},then(a,b){return Promise.resolve(result()).then(a,b)}};
  function result(){
    if(op){if(table==='content_seen')seen.push(...values);if(table==='content_usage')usage[values.kind]={used:values.used};if(table==='learner_profiles')Object.assign(profile,values);return {data:null,error:null};}
    const kind=filters.find(x=>x[0]==='kind')?.[1];
    const data=table==='learner_profiles'?profile:table==='accounts'?account:table==='content_usage'?usage[kind]||{used:0}:table==='content_seen'?seen.filter(row=>filters.every(([k,v,like])=>like?String(row[k]).startsWith(v.replace('%','')):row[k]===v)).slice(-maximum).reverse():[];
    return {data,error:null};
  }return q;
}});
let chain=Promise.resolve();
readline.createInterface({input:process.stdin}).on('line',line=>{
  chain=chain.then(async()=>{
    try{const body=JSON.parse(line);account.content_locale=body.locale||'es_es';
      const response=await context.handler(new Request('https://offline.invalid/function',{method:'POST',headers:{Authorization:'Bearer offline-test','Content-Type':'application/json'},body:JSON.stringify(body)}));
      process.stdout.write(JSON.stringify({status:response.status,data:await response.json()})+'\n');
    }catch(error){process.stdout.write(JSON.stringify({status:500,data:{error:error.message}})+'\n');}
  });
});

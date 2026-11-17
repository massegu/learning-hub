// Opt-in local integration adapter: real handler + SDK/Auth/PostgREST/database.
// Node supplies the Deno serve/env boundary; this is not a deployed Edge runtime.
// Private local keys/tokens arrive via stdin only, never files or command arguments.
const fs=require('node:fs'),assert=require('node:assert/strict');
async function main(){
 const input=JSON.parse(fs.readFileSync(0,'utf8'));
 assert.equal(input.url,'http://127.0.0.1:55431');
 const {createClient}=require(process.argv[2]);
 const {context}=require('./edge-harness')();
 context.console={log(){},warn(){},error(){}};
 context.Deno.env.get=name=>{
  if(name==='SUPABASE_URL')return input.url;
  if(name==='SUPABASE_SERVICE_ROLE_KEY')return input.serviceKey;
  throw new Error('Unexpected environment access');
 };
 context.createClient=(url,key,options)=>{
  assert.equal(url,input.url);
  return createClient(url,key,{...options,global:{fetch:(url,options)=>{
   assert.equal(new URL(url).origin,input.url);
   return fetch(url,{...options,redirect:'error'});
  }}});
 };
 const response=await context.handler(new Request(input.url+'/functions/v1/request-learning-content',{
  method:'POST',headers:{Authorization:'Bearer '+input.token,'Content-Type':'application/json'},
  body:JSON.stringify(input.body),
 }));
 process.stdout.write(JSON.stringify({status:response.status,body:await response.json()}));
}
main().catch(()=>{process.stderr.write('Local content handler integration failed\n');process.exitCode=1;});

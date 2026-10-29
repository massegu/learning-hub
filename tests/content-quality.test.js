const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const quality=require('../js/content-quality'),functional=require('../js/functional-content'),curriculum=require('../js/curriculum'),early=require('../js/early-content'),model=require('../js/activity-model'),locale=require('../js/locale-content');
const profile=age=>({age_band:age==='early'?'primary':age,progress:{ageRoute:age}});
test('semantic taxonomy does not multiply by document format, colour, names or answer order',()=>{
 for(const mechanic of ['speed_compare_shapes','speed_compare_colors','speed_compare_objects'])assert.equal(quality.family({mechanic},'speedReasoning'),'speed.compare');
 for(const mechanic of ['document_attention_ticket','document_attention_menu'])assert.equal(quality.family({mechanic},'attention'),'attention.document_lookup');
 assert.equal(quality.nearDuplicateKey({q:'Ana tiene 3 cajas rojas.'}),quality.nearDuplicateKey({q:'Leo tiene 5 cajas rojas.'}));
});
test('authored functional tasks have purpose, unique sources and canonical answer evidence across ages and locales',()=>{
 let count=0;
 for(const age of ['early','junior','primary','middle','teen'])for(const domain of ['language','division','middleMath','teenMath','geometry','reading','literacy','attention','executive','memory','speedReasoning','social','english'])for(const level of [1,2,3]){
  const items=functional.pool(age,domain,level);assert.equal(new Set(items.map(x=>x.semanticKey)).size,items.length);
  for(const item of items){assert.ok(quality.describe(item,age,domain).functionalPurpose);assert.deepEqual(quality.issues(item,age,domain),[]);model.printable(item,profile(age));
   for(const country of Object.keys(locale.labels)){const translated=locale.localizeItem(item,country,domain);functional.validate(translated);model.printable(translated,profile(age));}
   const broken=structuredClone(item);broken.stimulus=[{type:'text',text:'Fuente cambiada'}];assert.throws(()=>functional.validate(broken));
   const answer=structuredClone(item);if(answer.a!==undefined)answer.a='Respuesta cambiada';else answer.answer=['Respuesta cambiada'];assert.throws(()=>functional.validate(answer));count++;
  }
 }
 assert.ok(count>350);
});
test('actual early selector balances operations across sessions without corrupting renderer metadata',()=>{
 for(const domain of ['language','division','reading','attention','executive','memory','speedReasoning','social']){
  const p=profile('early');let previous=null;for(const level of [1,2,3])for(const item of early.select(p,[domain],12,level,()=>.37)){
   const family=quality.family(item,domain);assert.notEqual(family,'unclassified',domain);assert.notEqual(family,previous,domain);previous=family;model.forDelivery(item,p,domain);assert.equal(item.semanticFamily,family);assert.equal(item.difficultyProfile.age,'early');
  }
 }
});
test('client and Edge quality sources are byte identical',()=>{for(const name of ['content-quality','functional-content'])assert.equal(fs.readFileSync(require.resolve('../js/'+name+'.js'),'utf8'),fs.readFileSync(require.resolve('../supabase/functions/request-learning-content/'+name+'.js'),'utf8'));});
test('reproducible inventory covers all visible age/domain cells and detects concentration',()=>{
 const before=require('../docs/audits/content-quality-before.json'),after=require('../docs/audits/content-quality-after.json');
 assert.equal(after.rows.length,44);assert.equal(after.taxonomyDigest,before.taxonomyDigest);assert.notEqual(after.sourceDigest,before.sourceDigest);assert.ok(after.rows.every(r=>r.exactVisibleActivities<=r.activities));assert.deepEqual(after.summary.belowMinimum,[]);assert.equal(after.summary.unclassified,0);
 for(const row of after.rows){assert.ok(row.semanticFamilies>=8,row.age+'/'+row.domain);assert.ok(row.contextCoverageReview);for(const session of row.sessions)assert.ok(session.dominantShare<=.5,row.age+'/'+row.domain);}
 const repeats=data=>data.rows.reduce((n,r)=>n+r.consecutiveSameFamily,0);assert.ok(repeats(after)<repeats(before)/2);
});

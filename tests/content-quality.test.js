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
 for(const age of ['early','junior','primary','middle','teen'])for(const domain of ['language','middleLanguage','teenLanguage','division','middleMath','teenMath','geometry','reading','literacy','attention','executive','memory','speedReasoning','social','english'])for(const level of [1,2,3]){
  const items=functional.pool(age,domain,level);assert.equal(new Set(items.map(x=>x.semanticKey)).size,items.length);
  for(const item of items){assert.ok(quality.describe(item,age,domain).functionalPurpose);assert.deepEqual(quality.issues(item,age,domain),[]);model.printable(item,profile(age));
   for(const country of Object.keys(locale.labels)){const translated=locale.localizeItem(item,country,domain);functional.validate(translated);model.printable(translated,profile(age));}
   const broken=structuredClone(item);broken.stimulus=[{type:'text',text:'Fuente cambiada'}];assert.throws(()=>functional.validate(broken));
   const answer=structuredClone(item);if(answer.a!==undefined)answer.a='Respuesta cambiada';else if(answer.type==='self')answer.sample='Respuesta cambiada';else answer.answer=['Respuesta cambiada'];assert.throws(()=>functional.validate(answer));count++;
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
test('client and Edge quality sources are byte identical',()=>{for(const name of ['content-quality','transfer-content','functional-content'])assert.equal(fs.readFileSync(require.resolve('../js/'+name+'.js'),'utf8'),fs.readFileSync(require.resolve('../supabase/functions/request-learning-content/'+name+'.js'),'utf8'));});
test('reproducible inventory covers all visible age/domain cells and detects concentration',()=>{
 const before=require('../docs/audits/content-quality-before.json'),after=require('../docs/audits/content-quality-after.json');
 assert.equal(after.rows.length,44);assert.equal(after.taxonomyDigest,before.taxonomyDigest);assert.notEqual(after.sourceDigest,before.sourceDigest);assert.ok(after.rows.every(r=>r.exactVisibleActivities<=r.activities));assert.deepEqual(after.summary.belowMinimum,[]);assert.equal(after.summary.unclassified,0);
 for(const row of after.rows){assert.ok(row.semanticFamilies>=8,row.age+'/'+row.domain);assert.ok(row.contextCoverageReview);for(const session of row.sessions)assert.ok(session.dominantShare<=.5,row.age+'/'+row.domain);}
 const repeats=data=>data.rows.reduce((n,r)=>n+r.consecutiveSameFamily,0);assert.ok(repeats(after)<repeats(before)/2);
});
test('each functional family has two authored settings and no unchanged source between available levels',()=>{
 for(const age of ['early','junior','primary','middle','teen'])for(const domain of ['language','middleLanguage','teenLanguage','division','middleMath','teenMath','geometry','reading','literacy','attention','executive','memory','speedReasoning','social','english']){
  const families=new Map(),sources=new Map();
  for(const level of [1,2,3])for(const item of functional.pool(age,domain,level)){
   const family=item.qualityDescriptor.semanticFamily,setting=item.qualityDescriptor.scenarioFamily.split('.')[0];
   if(!families.has(family))families.set(family,new Set());families.get(family).add(setting);
   const source=JSON.stringify([family,item.q,item.stimulus,item.a,item.answer]);
   assert.ok(!sources.has(source)||sources.get(source)===level,age+'/'+domain+'/'+family+' repeats across levels');sources.set(source,level);
  }
  for(const [family,settings] of families)assert.ok(settings.size>=2,age+'/'+domain+'/'+family+' lacks independent contexts');
 }
});
test('difficulty increases the actual task demand and keeps junior executive reading bounded',()=>{
 const get=(domain,level,family)=>functional.pool('early',domain,level).find(x=>x.qualityDescriptor.semanticFamily===family);
 assert.deepEqual([1,2,3].map(l=>get('executive',l,'executive.conditions').difficultyParameters.rules),[1,2,3]);
 assert.deepEqual([1,2,3].map(l=>get('attention',l,'attention.omission').difficultyParameters.elements),[2,3,4]);
 assert.deepEqual([1,2,3].map(l=>get('speedReasoning',l,'speed.translation').difficultyParameters.lookups),[1,2,3]);
 assert.ok(get('division',2,'math.measure').difficultyParameters.origin>0);
 for(const level of [1,2,3])for(const item of curriculum.pool('junior','executive',level))assert.ok(!quality.issues(item,'junior','executive').includes('secondary-reading-load-review'),item.q);
 const item=get('executive',3,'executive.conditions');item.difficultyParameters.rules=1;assert.throws(()=>functional.validate(item));
});
test('money answers derive independently from visible denominations and fares',()=>{
 for(const age of ['early','junior','primary','middle','teen'])for(const level of [1,2,3]){
  const domain=age==='teen'?'teenMath':age==='middle'?'middleMath':'division';
  for(const item of functional.pool(age,domain,level).filter(x=>x.qualityDescriptor.semanticFamily==='math.money')){
   const values=item.stimulus.find(x=>x.type==='list').items.map(x=>Number(x.replace(' €',''))),total=values.reduce((a,b)=>a+b,0);
   if(item.qualityDescriptor.scenarioFamily==='home.savings')assert.equal(item.a,total+' €');
   else{const fareText=item.stimulus.at(-1).text,fare=Number(fareText.match(/cuesta (\d+) €/)[1]),tickets=fareText.includes('dos billetes')?2:1;assert.equal(item.a,(total-fare*tickets)+' €');}
  }
 }
});
test('document and photo contexts follow the actual source instead of incidental objects',()=>{
 const photos=require('../js/photo-library'),docs=require('../js/document-library');
 const kitchen=photos.pool('teen','memory',1).find(x=>x.photoTask.sceneId==='kitchen');assert.equal(quality.scenario({...kitchen,q:'¿Dónde estaba el cuaderno de clase?'}),'home_routines');
 const boarding=docs.pool('teen','attention',1).find(x=>x.stimulus.some(b=>b.documentId==='boarding-es-v2'));assert.equal(quality.scenario(boarding),'transport');
});
test('condition and resource decisions have one factual answer and do not always favour A or the first row',()=>{
 for(const [domain,families] of [['executive',['executive.conditions','executive.resources']],['attention',['attention.conditions']]])for(const level of [1,2,3])for(const family of families){
  const items=functional.pool('early',domain,level).filter(x=>x.qualityDescriptor.semanticFamily===family),positions=new Set();
  for(const item of items){
   const table=item.stimulus.find(x=>x.type==='table'),requirements=(domain==='attention'?item.q:item.stimulus[0].text).split(': ')[1].replace(/\.$/,'').split(domain==='attention'?', ':' y ');
   const matches=table.rows.filter(row=>requirements.every(value=>row[1].split(', ').includes(value)));
   assert.equal(matches.length,1);assert.ok(item.a.endsWith(matches[0][0]));positions.add(table.rows.indexOf(matches[0]));
  }
  assert.equal(positions.size,2,family+' always favours one table row');
 }
});

test('the historical context gaps receive authored tasks in two settings at each level',()=>{
 const transfer=require('../js/transfer-content');let combinations=0;
 for(const [cell,families] of Object.entries(transfer.targets)){
  const [age,domain]=cell.split('/');combinations+=families.length;
  for(const level of [1,2,3]){
   const added=[];transfer.extend({age,domain,level,T:text=>({type:'text',text}),L:items=>({type:'list',items}),table:rows=>({type:'table',rows}),add:(family,scenario,...args)=>added.push({family,scenario,args})});
   for(const family of families)assert.ok(new Set(added.filter(x=>x.family===family).map(x=>x.scenario.split('.')[0])).size>=2,cell+'/'+family+'/'+level);
  }
 }
 assert.equal(combinations,177);
 const after=require('../docs/audits/content-quality-after.json');assert.equal(after.summary.contextFamiliesNeedingReview,0);assert.equal(after.summary.functionalContextGaps,0);
});
test('label comparison answers follow the actual labels in both settings and all levels',()=>{
 for(const age of ['early','junior','primary','middle','teen'])for(const level of [1,2,3]){
  const rows=functional.pool(age,'speedReasoning',level).filter(x=>x.qualityDescriptor.semanticFamily==='speed.compare'&&/organization|library/.test(x.qualityDescriptor.scenarioFamily));
  for(const root of ['home','community']){
   const items=rows.filter(x=>x.qualityDescriptor.scenarioFamily.startsWith(root+'.'));assert.equal(items.length,2);
   for(const item of items){const [a,b]=item.stimulus.find(b=>b.type==='table').rows[0];assert.equal(item.a,a===b?'Sí':'No');}
   assert.deepEqual(new Set(items.map(x=>x.a)),new Set(['Sí','No']));
  }
 }
});
test('writing alternatives stay observable rather than receiving automatic factual grades',()=>{
 for(const age of ['primary','middle','teen'])for(const level of [1,2,3])for(const item of functional.pool(age,'literacy',level).filter(x=>x.type==='self')){
  assert.equal(item.assessment,'observation');assert.equal(item.responseType,'written');assert.ok(item.writingRubric.length>=3);assert.ok(item.sample);assert.equal(item.a,undefined);
  const broken=structuredClone(item);broken.writingRubric=['Acepta todo'];assert.throws(()=>functional.validate(broken));
 }
});

test('all authored tasks survive the real Edge normalizer and delivery validator',()=>{
 const {api,context}=require('./edge-harness')();let checked=0;
 for(const [cell] of Object.entries(require('../js/transfer-content').targets)){
  const [age,domain]=cell.split('/');for(const level of [1,2,3])for(const item of context.FunctionalContent.pool(age,domain,level)){
   assert.equal(api.validateItem(api.normalizeItem(item)),true,item.contentKey);const stripped={...item,qualityEvidence:undefined};assert.equal(api.validateItem(stripped),false);assert.throws(()=>model.printable(stripped,profile(age)));checked++;
  }
 }
 assert.ok(checked>1000);
});
test('language and writing focus routes preserve the selected purpose',()=>{
 for(const age of ['early','junior','primary','middle','teen']){
  const domain=age==='middle'?'middleLanguage':age==='teen'?'teenLanguage':'language';
  for(const level of [1,2,3])for(const focus of ['grammar','spelling','vocabulary'])for(let k=0;k<6;k++){
   const item=functional.generate(age,domain,level,focus);if(item)assert.equal(item.languageFocus,focus);
  }
  if(['primary','middle','teen'].includes(age))for(const level of [1,2,3])for(let k=0;k<6;k++)assert.equal(functional.generate(age,'literacy',level,'writing').languageFocus,'writing');
 }
});
test('every added older math calculation derives from its displayed source',()=>{
 for(const age of ['middle','teen'])for(const level of [1,2,3])for(const item of functional.pool(age,age==='middle'?'middleMath':'teenMath',level).filter(x=>['home.planning','community.club'].includes(x.qualityDescriptor.scenarioFamily))){
  const blocks=item.stimulus,text=blocks.filter(b=>b.text).map(b=>b.text),numbers=s=>(s.match(/\d+/g)||[]).map(Number);let answer;
  switch(item.qualityDescriptor.semanticFamily){
   case 'math.equations':{const [kits,paid]=numbers(text[0]),fee=text[1]?numbers(text[1])[0]:0,coupon=text.some(t=>t.includes('bono'))?3:0;answer=(paid+coupon-fee)/kits;break;}
   case 'math.percent':{const [price,discount]=numbers(text[0]),fee=text[1]?numbers(text[1])[0]:0;answer=price-price*discount/100+fee;break;}
   case 'math.average':{const values=blocks.find(b=>b.type==='list').items.map(x=>numbers(x)[0]),excluded=text[1]?numbers(text[1])[0]:null,valid=values.filter(n=>n!==excluded);answer=valid.reduce((a,b)=>a+b,0)/valid.length;break;}
   case 'math.proportion':{const [base,units,wanted]=numbers(text[0]);answer=units*wanted/base;break;}
   case 'math.area':{const [w,h,x,y]=numbers(text[1]);answer=w*h+(x===undefined?0:(text[1].includes('sin cubrir')?-1:1)*x*y);break;}
   case 'math.probability':{const rows=blocks.find(b=>b.type==='table').rows,n=Number(rows[0][1]),other=Number(rows[1][1]),removed=text.some(t=>t.includes('No lo devuelves'))?1:0;assert.equal(item.a,level===1?rows[0][0]:(n-removed)+' de '+(n+other-removed));continue;}
   default:continue;
  }
  assert.equal(parseFloat(item.a),answer,item.contentKey);
 }
});

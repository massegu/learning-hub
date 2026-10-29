// Reproducible, synthetic content audit. No credentials, user records or remote calls.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),quality=require('../js/content-quality');
const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const ref=option('--ref',null),out=option('--output','docs/audits/content-quality-after.json');let source=root,temp=null;
if(ref){if(!/^[a-zA-Z0-9_./-]+$/.test(ref))throw Error('Invalid baseline ref');temp=fs.mkdtempSync(path.join(os.tmpdir(),'learning-hub-content-audit-'));execFileSync('tar',['-x','-C',temp],{input:execFileSync('git',['archive',ref,'js','supabase/functions/request-learning-content','tests/edge-harness.js'],{cwd:root,maxBuffer:30e6})});source=temp;}
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,20);
try{
 const {api,context}=require(path.join(source,'tests/edge-harness'))(),c=require(path.join(source,'js/curriculum')),d=require(path.join(source,'js/document-library'));
 const inputs=[...['js/early-content.js','js/early-refinements.js','js/early-language.js','js/curriculum.js','supabase/functions/request-learning-content/index.ts'],...require(path.join(source,'tests/edge-harness'))().loadedImports.map(x=>'supabase/functions/request-learning-content/'+x.slice(2))].sort();
 const sourceDigest=hash(inputs.map(file=>[file,fs.readFileSync(path.join(source,file),'utf8')]));
 const inventory={schemaVersion:1,sourceDigest,taxonomyDigest:hash(fs.readFileSync(path.join(root,'js/content-quality.js'),'utf8')),revision:ref||execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),mode:ref?'baseline':'working-tree',seed:73,method:'Finite public banks plus 80 seeded legacy samples per level and focus. Exact duplicates exclude IDs and distractors within each level; exactVisibleActivities also deduplicates across levels and unchangedAcrossLevels flags sources repeated at different levels. Near-duplicates are review groups, not automatic deletions. Selection exposure is a controlled simulation of 12 deliveries at each of L1/L2/L3, preserving history. Ages 6–7 use the actual local selector; other ages use the backend selector over the known bank; it is not real-user telemetry or an estimate of all production traffic.',rows:[],examples:[]};
 for(const age of ['early','junior','primary','middle','teen'])for(const domain of c.visible(api.SUBJECTS[age],age).filter(x=>x!=='games')){
  const bank=[],seen=new Set(),near=new Map(),issues={};
  for(const level of [1,2,3]){
   const rows=[];
   for(const focus of (['language','middleLanguage','teenLanguage'].includes(domain)?['grammar','spelling','vocabulary']:['reading','literacy','middleReading'].includes(domain)?['grammar','writing']:['grammar'])){
    rows.push(...c.academic(age,domain,level,focus));
    if(age!=='early')for(let n=0;n<80;n++)rows.push(api.variantExercise(age,domain,level,focus));
   }
   if(age==='early'){require(path.join(source,'js/early-refinements'));require(path.join(source,'js/early-language'));rows.push(...require(path.join(source,'js/early-content')).pool(domain,level));}else rows.push(...c.pool(age,domain,level));if(domain==='attention')rows.push(...c.practice(age,domain,level));if(d.supports(age,domain))rows.push(...d.pool(age,domain,level));
   if(['language','middleLanguage','teenLanguage'].includes(domain))rows.push(...c.vocabulary(age,domain,level));
   if(!ref&&context.FunctionalContent)rows.push(...context.FunctionalContent.pool(age,domain,level));
   for(const raw of rows.filter(x=>x&&typeof x.q==='string'&&x.type)){
    const it={...raw,domain,level:raw.level||level},key=hash([it.domain,it.level,it.type,it.q,it.memoryQuestion,it.stimulus,it.scenario,it.memoryContent,it.a,it.answer,it.answers]);if(seen.has(key))continue;seen.add(key);bank.push(it);
    const nearKey=quality.nearDuplicateKey(it);near.set(nearKey,(near.get(nearKey)||0)+1);
    for(const issue of quality.issues(it,age,domain))issues[issue]=(issues[issue]||0)+1;
   }
  }
  const families={},templates=new Set();
  for(const it of bank){const meta=quality.describe(it,age,domain);templates.add(quality.templateKey(it,age,domain));const f=families[meta.semanticFamily]||={items:0,scenarios:new Set(),levels:new Set(),mechanics:new Set(),functionalPurpose:meta.functionalPurpose};f.items++;f.scenarios.add(meta.scenarioFamily);f.levels.add(it.level);f.mechanics.add(it.mechanic||it.type);}
  // Use exact same public selector API and candidate boundary for before/after.
  const histories=[],exposure={},sessions=[],exampleByFamily=new Set(),earlyProfile={progress:{}};let previous=null,consecutive=0;
  for(let session=0;session<3;session++){
   const level=session+1;
   const selected=age==='early'?require(path.join(source,'js/early-content')).select(earlyProfile,[domain],12,level,context.Math.random):api.generatedItems(domain,12,histories,()=>null,structuredClone(bank.filter(it=>it.level===level)));const counts={};
   for(const it of selected){const meta=quality.describe(it,age,domain),f=meta.semanticFamily;exposure[f]=(exposure[f]||0)+1;counts[f]=(counts[f]||0)+1;if(f===previous)consecutive++;previous=f;
    histories.push(api.contentSignature(domain,it),domain+':mechanic:'+(it.mechanic||it.type||'generic'));
    if(!ref&&context.ContentQuality)histories.push(domain+':semantic:'+f);
    if(!exampleByFamily.has(f)){exampleByFamily.add(f);inventory.examples.push({age,domain,level:it.level,q:it.q||it.memoryQuestion,answer:it.a||it.answer||it.answers,source:it.stimulus||it.scenario,...meta});}
   }sessions.push({level,availableFamilies:new Set(bank.filter(it=>it.level===level).map(it=>quality.family(it,domain))).size,activities:selected.length,dominantShare:selected.length?Math.max(...Object.values(counts))/selected.length:0});
  }
  const delivered=Object.values(exposure).reduce((a,b)=>a+b,0);
  const visibleKey=it=>hash([it.domain,it.type,it.q,it.memoryQuestion,it.stimulus,it.scenario,it.memoryContent,it.a,it.answer,it.answers]);
  const visibleLevels=new Map();for(const it of bank){const key=visibleKey(it),levels=visibleLevels.get(key)||new Set();levels.add(it.level);visibleLevels.set(key,levels);}
  const functional=bank.filter(it=>it.qualityEvidence),functionalSettings=new Map(),functionalVisible=new Map();
  for(const it of functional){const family=quality.family(it,domain);if(!functionalSettings.has(family))functionalSettings.set(family,new Set());functionalSettings.get(family).add(quality.scenario(it).split('.')[0]);const key=visibleKey(it),levels=functionalVisible.get(key)||new Set();levels.add(it.level);functionalVisible.set(key,levels);}
  const row={age,domain,functionalContextCoverageReview:[...functionalSettings].filter(([id,settings])=>settings.size<2).map(([id])=>id),functionalUnchangedAcrossLevels:[...functionalVisible.values()].filter(levels=>levels.size>1).length,activities:bank.length,exactVisibleActivities:visibleLevels.size,unchangedAcrossLevels:[...visibleLevels.values()].filter(levels=>levels.size>1).length,rawMechanics:new Set(bank.map(x=>x.mechanic||x.type)).size,semanticFamilies:Object.keys(families).filter(f=>f!=='unclassified').length,targetMinimum:8,targetMet:Object.keys(families).filter(f=>f!=='unclassified').length>=8,templateGroups:templates.size,nearDuplicateGroups:[...near.values()].filter(n=>n>1).length,contextCoverageReview:Object.entries(families).filter(([id,f])=>new Set([...f.scenarios].filter(s=>s!=='abstract_pattern').map(s=>s.split('.')[0])).size<2).map(([id])=>id),issues,consecutiveSameFamily:consecutive,sessions,families:Object.fromEntries(Object.entries(families).map(([id,f])=>[id,{...f,scenarios:[...f.scenarios].sort(),levels:[...f.levels].sort(),mechanics:[...f.mechanics].sort(),bankWeightPercent:Math.round(10000*f.items/bank.length)/100,exposurePercent:Math.round(10000*(exposure[id]||0)/(delivered||1))/100}]))};inventory.rows.push(row);console.log(age+'/'+domain+': '+row.semanticFamilies+' families, '+row.rawMechanics+' raw mechanics, '+consecutive+' consecutive repeats');
 }
 inventory.summary={functionalContextGaps:inventory.rows.reduce((n,r)=>n+r.functionalContextCoverageReview.length,0),functionalUnchangedAcrossLevels:inventory.rows.reduce((n,r)=>n+r.functionalUnchangedAcrossLevels,0),contextFamiliesNeedingReview:inventory.rows.reduce((n,r)=>n+r.contextCoverageReview.length,0),rows:inventory.rows.length,belowMinimum:inventory.rows.filter(x=>!x.targetMet).map(x=>x.age+'/'+x.domain),unclassified:inventory.rows.reduce((n,r)=>n+(r.families.unclassified?.items||0),0)};
 fs.mkdirSync(path.dirname(path.resolve(root,out)),{recursive:true});fs.writeFileSync(path.resolve(root,out),JSON.stringify(inventory,null,2)+'\n');
}finally{if(temp)fs.rmSync(temp,{recursive:true,force:true});}

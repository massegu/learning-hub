// A review inventory, not a claim that permutations are independent activities.
const fs=require('node:fs'),path=require('node:path');
const bank=require('../js/cognitive-families'),art=require('../js/stimulus-art');
const ages=['early','junior','primary','middle','teen'],samples=[],families=new Map(),scenarioSet=new Set();let variants=0;
for(const age of ages)for(const level of [1,2,3])for(const kind of Object.keys(bank.definitions)){
 const items=bank.pool(age,'executive',level,kind);let representative;
 for(const item of items){
  variants++;bank.validate(item);if(!bank.grade(item,item.cognitiveTask.answer))throw Error('Invalid answer '+item.id);
  if(!families.has(kind))families.set(kind,new Set());families.get(kind).add(item.scenarioFamily);scenarioSet.add(item.scenarioFamily);
  if(item.cognitiveTask.kind==='rules')for(const trial of item.cognitiveTask.trials)if(!art.forLabel(trial.symbol))throw Error('Missing factual pictogram: '+trial.symbol);
  representative||=item;
 }
 const t=representative.cognitiveTask;
 const sourceWords=representative.stimulus.map(b=>b.text||b.items?.join(' ')||b.rows?.flat().join(' ')||'').join(' ').split(/\s+/).filter(Boolean).length;
 samples.push({age,level,family:kind,q:representative.q,stimulus:representative.stimulus,answer:representative.sample,construct:representative.primaryConstruct,functionalPurpose:representative.functionalPurpose,difficulty:representative.difficultyProfile,printable:representative.printable,sourceWords,editorialNotes:kind==='words'?['Production uses a reviewed finite vocabulary. Unknown words are ungraded.']:age==='early'&&sourceWords>35?['Read the short instruction with an accompanying adult; cards/steps are visual or shown in a fixed order.']:[]});
}
const out={broadFamilies:families.size,semanticFamilies:families.size,scenarioFamilies:scenarioSet.size,renderedVariants:variants,variantsAreNotIndependentActivities:true,scenariosByFamily:Object.fromEntries([...families].map(([kind,set])=>[kind,[...set]])),representativeExamples:samples};
const dir=path.join(__dirname,'../docs/audits');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'cognitive-families-20261104.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({broadFamilies:out.broadFamilies,semanticFamilies:out.semanticFamilies,scenarioFamilies:out.scenarioFamilies,renderedVariants:variants,representativeExamples:samples.length},null,2));

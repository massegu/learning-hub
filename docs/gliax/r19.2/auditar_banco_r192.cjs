#!/usr/bin/env node
'use strict';
// GLIAX R19.2: auditoria reproducible, no invasiva. Uso:
// node auditar_banco_r192.cjs /ruta/al/repo /ruta/de/salida.json
const fs = require('node:fs');
const path = require('node:path');
const repo = path.resolve(process.argv[2] || process.cwd());
const output = path.resolve(process.argv[3] || 'gliax-r192-audit.json');
const ages = ['early','junior','primary','middle','teen'];
const levels = [1,2,3];
function load(p){ return require(path.join(repo,'js',p)); }
load('content-quality.js');
load('transfer-content.js');
const functional = load('functional-content.js');
const cognitive = load('cognitive-families.js');
const curriculum = load('curriculum.js');
const executed = load('executed-tasks.js');
const result = {
  base: 'Runtime inventory generated from checked-out source; inspect Git SHA separately',
  generatedAt: new Date().toISOString(),
  counts: {}, families: {}, issues: [], inventory: [],
  caveats: [
    'The canonical-answer check proves internal consistency, not uniqueness or semantic validity.',
    'Visible-content fingerprints detect exact duplicates, not semantically equivalent paraphrases.',
    'Browser UI, accessibility, localization, Edge delivery and human age-appropriateness require additional verification.'
  ]
};
const by = new Map();
function issue(code, item, detail){ result.issues.push({code,id:item?.contentKey||item?.id,detail:String(detail)}); }
function collect(source,age,level,domain,items){
  const key = `${source}:${domain}`;
  const group = by.get(key) || {count:0,ids:new Set(),visible:new Set(),scenario:new Set(),mechanics:{}, exactDuplicates:0};
  by.set(key,group);
  for(const item of items){
    group.count++;
    const id = item.contentKey || item.id;
    if(group.ids.has(id)) issue('duplicate_id',item,'Duplicate contentKey within source and domain');
    group.ids.add(id);
    const mech = item.cognitiveTask?.kind || item.interactionTask?.kind || item.mechanic || item.qualityDescriptor?.semanticFamily || 'unspecified';
    group.mechanics[mech] = (group.mechanics[mech] || 0) + 1;
    const fingerprint = JSON.stringify([item.q,item.stimulus,item.opts,item.a,item.tokens,item.answer,item.answers,item.cognitiveTask,item.execution,item.interactionTask]);
    if(group.visible.has(fingerprint)) group.exactDuplicates++;
    group.visible.add(fingerprint);
    group.scenario.add(item.scenarioFamily || item.qualityDescriptor?.scenarioFamily || 'unspecified');
    result.inventory.push({source,age,level,domain,id,mechanic:mech,scenario:item.scenarioFamily||item.qualityDescriptor?.scenarioFamily||null,visibleFingerprint:require('node:crypto').createHash('sha256').update(fingerprint).digest('hex').slice(0,16)});
  }
}
for(const age of ages)for(const level of levels){
  for(const domain of ['executive','attention']){
    const cognitiveBank = cognitive.pool(age,domain,level);
    collect('cognitive-families',age,level,domain,cognitiveBank);
    for(const item of cognitiveBank){
      const task = item.cognitiveTask;
      try {
        cognitive.validate(item);
        if(!['guidedWait','falling','words'].includes(task.kind) && !cognitive.grade(item,task.answer)) issue('canonical_rejected',item,task.kind);
        if(task.kind==='information' && task.answer.every((v,i)=>v===`f${i}`)) issue('position_leak_information',item,'All relevant facts precede distractors');
        if(task.kind==='contradiction' && task.sourceDocs?.every(doc=>doc.rows.length) && task.answer[0]===task.sourceDocs[0].rows[0].id) issue('position_leak_contradiction',item,'Discrepant fact first in the first source');
        if(task.kind==='change' && task.options.length===3 && task.options[0]===task.replacement) issue('fixed_correct_option_in_generator',item,'Correct replacement always first in source data; check UI sorting separately');
      } catch(e){ issue('cognitive_validation',item,e.message); }
    }
    const functionalBank = functional.pool(age,domain,level);
    collect('functional-content',age,level,domain,functionalBank);
    for(const item of functionalBank){
      try{ functional.validate(item); if(item.a!==undefined&&(!item.opts?.includes(item.a)||new Set(item.opts).size!==item.opts.length)) issue('functional_choice',item,'Correct answer missing or duplicate options'); }
      catch(e){issue('functional_validation',item,e.message);}
    }
    const executedBank=executed.pool(age,domain,level);
    collect('executed-tasks',age,level,domain,executedBank);
    for(const item of executedBank){
      try{executed.validate(item);if(!executed.grade(item,item.execution.answer))issue('executed_canonical',item,'Canonical answer rejected');}
      catch(e){issue('executed_validation',item,e.message);}
    }
  }
  const curriculumBank=curriculum.pool(age,'executive',level);
  collect('curriculum',age,level,'executive',curriculumBank);
  for(const item of curriculumBank){
    try{
      if(item.planEvidence)curriculum.validatePlan(item);
      if(item.reviewEvidence)curriculum.validateReview(item);
      if(item.responseType==='choice' && (!item.opts?.includes(item.a)||new Set(item.opts).size!==item.opts.length)) issue('curriculum_choice',item,'Invalid answer or repeated option');
      if(item.responseType==='order' && (item.tokens.length!==item.answer.length||item.tokens.some(x=>!item.answer.includes(x)))) issue('curriculum_order',item,'Invalid ordering permutation');
    }catch(e){issue('curriculum_validation',item,e.message);}
  }
  if(age!=='early'){
    const interactiveBank=curriculum.interactivePool(age,'executive',level);
    collect('interactive',age,level,'executive',interactiveBank);
    for(const item of interactiveBank){try{curriculum.validateInteraction(item);}catch(e){issue('interactive_validation',item,e.message);}}
    const room=curriculum.interactivePool(age,'attention',level);
    collect('interactive',age,level,'attention',room);
    for(const item of room){try{curriculum.validateInteraction(item);}catch(e){issue('interactive_validation',item,e.message);}}
  }
}
for(const [key,g] of by){
  result.families[key]={instances:g.count,uniqueVisibleContent:g.visible.size,exactDuplicateInstances:g.exactDuplicates,distinctScenarioKeys:g.scenario.size,mechanics:g.mechanics};
  result.counts[key]=g.count;
}
result.totalInstances=result.inventory.length;
result.issueCounts=result.issues.reduce((m,x)=>(m[x.code]=(m[x.code]||0)+1,m),{});
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({totalInstances:result.totalInstances,counts:result.counts,issueCounts:result.issueCounts,report:output},null,2));
// Structural pedagogical alerts are deliberately nonfatal; validation errors are fatal.
const fatal=new Set(['duplicate_id','canonical_rejected','cognitive_validation','functional_choice','functional_validation','executed_canonical','executed_validation','curriculum_choice','curriculum_order','curriculum_validation','interactive_validation']);
if(result.issues.some(x=>fatal.has(x.code)))process.exitCode=1;
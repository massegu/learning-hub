// Count reviewed exercises by factual stimulus, question and response, never IDs.
const fs=require('node:fs'),{api}=require('../tests/edge-harness')(),curriculum=require('../js/curriculum'),docs=require('../js/document-library'),model=require('../js/activity-model');
const ages=['early','junior','primary','middle','teen'],result={method:'Distinct stimulus + question + correct response in visible known banks; IDs, distractors, topics and explanations excluded. Same activity across levels is counted once per age. Legacy random attention excluded, so this is a lower bound.',ages:[]};
for(const age of ages){
 const known=new Set(),byDomain={};
 for(const level of [1,2,3]){
  const language=age==='teen'?'teenLanguage':age==='middle'?'middleLanguage':'language',math=age==='teen'?'teenMath':age==='middle'?'middleMath':'division';
  for(const domain of ['memory','executive','speedReasoning','reading','literacy','attention',language,math].filter(d=>curriculum.visible(api.SUBJECTS[age],age).includes(d))){
   const bank=[...curriculum.pool(age,domain,level),...(domain==='attention'?curriculum.practice(age,domain,level):[]),...curriculum.academic(age,domain,level,'grammar'),...(docs.supports(age,domain)?docs.pool(age,domain,level):[])];
   for(const it of bank){
    const projection=model.printable(it,{age_band:age,progress:{ageRoute:age}});
    const signature=JSON.stringify({domain,stimulus:projection.stimulus,q:projection.question,a:it.a,answers:it.answers,answer:it.answer});
    if(known.has(signature))continue;known.add(signature);byDomain[domain]=(byDomain[domain]||0)+1;
   }
  }
 }
 const row={age,distinctActivities:known.size,byDomain};if(row.distinctActivities<800)throw new Error('The verified bank is below 800 for '+age);result.ages.push(row);
}
const path=process.argv[2]||'docs/audits/photo-content-inventory.json';fs.writeFileSync(path,JSON.stringify(result,null,2)+'\n');console.log(result.ages.map(r=>r.age+': '+r.distinctActivities).join('\n'));

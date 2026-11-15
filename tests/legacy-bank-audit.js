// Audit the actually supplied legacy banks; no SDK, live DB or deployment.
const fs=require('node:fs'),{context,api}=require('./edge-harness')();
const report={},samples=[];
const visible=it=>JSON.stringify([it.type,it.q,it.opts&&[...it.opts].sort(),it.a,it.title,it.text,it.scenario,it.sample,it.angle,it.visual,it.dividend,it.divisor,it.rem]);
for(const [age,data] of Object.entries(context.LEARNING_DATA)){
  report[age]={label:data.label,domains:{}};
  for(const domain of data.subjects){
    const rows=Array.isArray(data[domain])?[[null,data[domain]]]:Object.entries(data[domain]);
    for(const [skill,items] of rows){
      const key=skill?domain+'.'+skill:domain;
      report[age].domains[key]={count:items.length,levels:Object.fromEntries([1,2,3].map(l=>[l,items.filter(x=>x.level===l).length])),visibleVariants:new Set(items.map(visible)).size,types:[...new Set(items.map(x=>x.type||'standard'))],rawInvalid:items.filter(x=>!api.validateItem(x)).length,normalizedInvalid:items.filter(x=>!api.validateItem(api.normalizeItem(structuredClone(x)))).length};
      for(const item of items)samples.push({age,domain,skill,level:item.level,item:api.normalizeItem(structuredClone(item))});
    }
  }
}
process.stdout.write(JSON.stringify(report,null,2)+'\n');
if(process.env.EDGE_AUDIT_SAMPLES)fs.writeFileSync(process.env.EDGE_AUDIT_SAMPLES,JSON.stringify(samples));

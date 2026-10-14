const load=require('./edge-harness'),fs=require('node:fs');
const {api}=load(process.argv[2]||undefined);
const factories={language:api.matrixLanguage18,attention:api.matrixAttention18,memory:api.matrixMemory18,executive:api.matrixExecutive20,applied:api.matrixApplied20,speedReasoning:api.matrixReasoning18,literacy:api.matrixLiteracy18};
const visible=it=>JSON.stringify([it.type,it.stimulus,it.q,it.scenario,it.text,it.memoryQuestion,it.memoryContent,it.modelSequence,it.rows,it.tokens,it.answer,it.opts&&[...it.opts].sort(),it.a]);
const report={},samples=[];
for(const age of ['junior','primary','middle']){
  report[age]={};
  for(const domain of ['language','reading','division','geometry','attention','memory','executive','applied','speedReasoning','literacy','english']){
    if(!api.SUBJECTS[age].includes(domain)&& !(age==='middle'&&['language','reading','division'].includes(domain)))continue;
    const bank=age==='junior'?api.junior:age==='primary'?api.primary:null;
    const actual=age==='middle'?({language:'middleLanguage',reading:'middleReading',division:'middleMath'}[domain]||domain):domain;
    const levels=[1,2,3].map(level=>Array.from({length:bank?bank.pool(domain,level).length:['executive','applied'].includes(domain)?400:['reading','division','geometry','english'].includes(domain)?300:360},(_,v)=>{
      let it;
      if(bank)it=bank.pool(domain,level)[v];
      else if(factories[domain])it=domain==='language'?factories[domain](age,actual,level,v):factories[domain](age,level,v);
      else it=domain==='reading'?api.variantReading(age,actual,level,v):domain==='english'?api.variantEnglish(age,actual,level,v):domain==='geometry'&&api.geometry?api.geometry(level,v):api.variantMath(age,actual,level,v);
      return {it,signature:visible(it)};
    }));
    report[age][actual]={levels:levels.map(xs=>({generated:xs.length,visibleVariants:new Set(xs.map(x=>x.signature)).size,mechanics:[...new Set(xs.map(x=>x.it.mechanic))],rawInvalid:xs.filter(x=>!api.validateItem(x.it)).length,normalizedInvalid:xs.filter(x=>!api.validateItem(api.normalizeItem(structuredClone(x.it)))).length})),sameAcrossAllLevels:levels[0].filter((x,i)=>x.signature===levels[1][i].signature&&x.signature===levels[2][i].signature).length};
    for(let l=0;l<3;l++)for(const m of report[age][actual].levels[l].mechanics){const it=levels[l].find(x=>x.it.mechanic===m).it;samples.push({age,domain:actual,level:l+1,item:api.normalizeItem(structuredClone(it))});}
  }
}
process.stdout.write(JSON.stringify(report,null,2)+'\n');
if(process.env.EDGE_AUDIT_SAMPLES)fs.writeFileSync(process.env.EDGE_AUDIT_SAMPLES,JSON.stringify(samples));

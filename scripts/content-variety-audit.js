// Candidate-selection audit, not patient telemetry. Run from the repository root.
const fs=require('node:fs'),load=require('../tests/edge-harness'),{api}=load();
const result={method:'600 seeded candidate draws per age/domain at level 2; not delivered-user telemetry',samples:600,rows:[]};
for(const age of ['early','junior','primary','middle','teen'])for(const domain of ['language','reading','memory','speedReasoning','executive','attention']){
 const d=domain==='language'?({middle:'middleLanguage',teen:'teenLanguage'}[age]||domain):domain==='reading'&&['primary','middle','teen'].includes(age)?'literacy':domain,counts={};
 for(let i=0;i<600;i++){const it=api.variantExercise(age,d,2),family=it.mechanic||it.type||'standard';counts[family]=(counts[family]||0)+1;}
 result.rows.push({age,domain:d,families:counts});
}
fs.writeFileSync(process.argv[2]||'docs/audits/content-variety-after.json',JSON.stringify(result,null,2)+'\n');
console.log('Wrote seeded candidate family audit; group noun/colour permutations together when interpreting mechanics.');

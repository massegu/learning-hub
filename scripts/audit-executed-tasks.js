// Synthetic authoring/load inventory. Does not read accounts or learning records.
const fs=require('node:fs'),tasks=require('../js/executed-tasks');
const rows=[];for(const age of ['early','junior','primary','middle','teen'])for(const domain of ['attention','memory','executive'])for(const level of [1,2,3])for(const item of tasks.pool(age,domain,level)){
 tasks.validate(item,age);const x=item.execution;rows.push({age,domain,level,family:item.qualityDescriptor.semanticFamily,context:item.qualityDescriptor.scenarioFamily,primaryConstruct:item.primaryConstruct,memorySystem:item.memorySystem||null,secondaryLoads:item.secondaryLoads,readingDemand:item.readingDemand,visualDemand:item.visualDemand,motorDemand:item.motorDemand,elements:x.kind==='spatial'?x.occupied.length:x.sequence?.length||x.steps?.length||x.trials?.length||x.cells.length,reverse:x.reverse||false,targets:x.kind==='cancel'?x.targets.length:null,exposureMs:item.domain==='memory'?x.exposureMs:null});
}
fs.writeFileSync('docs/audits/phase2-executed-loads.json',JSON.stringify({schemaVersion:1,scope:'Phase 2, first interactive delivery',activities:rows.length,families:Object.keys(tasks.definitions).length,rows},null,2)+'\n');
console.log(rows.length+' activities, '+Object.keys(tasks.definitions).length+' executed families; canonical sources validated.');

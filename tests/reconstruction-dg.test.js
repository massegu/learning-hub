const test=require('node:test'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const Zip=require('jszip');
const reports=require('../js/progress-report'),words=require('../js/cognitive-families'),communication=require('../js/communication-content');
const ages=['early','junior','primary','middle','teen'];
const request=(age,rows)=>execFileSync(process.execPath,['tests/edge-worker.js',age],{input:rows.map(JSON.stringify).join('\n')+'\n',encoding:'utf8',timeout:60000}).trim().split('\n').map(JSON.parse);

test('contextual word fit uses versioned sources and graded semantic requirements across the upper ages',()=>{
 for(const age of ages)for(const level of [1,2,3]){
   const bank=words.pool(age,'language',level,'words',2);
   for(const item of bank){
     if(['early','junior'].includes(age)){
       assert.equal(item.contentKey.split(':')[0],'cognitive-v1');
       continue;
     }
     assert.match(item.id,/^cognitive-v2:/);
     assert.ok(item.cognitiveTask.cue);
     assert.ok(words.validate(item));
     assert.ok(item.cognitiveTask.accepted.every(word=>words.grade(item,[word.toLocaleUpperCase('es')])));
     assert.notEqual(words.productionStatus(item,'alimento que contiene A'),'correct');
     const projection=words.printable(item);
     assert.ok(projection.stimulus.some(block=>block.text===item.cognitiveTask.cue));
     assert.equal(projection.options.length,0);
   }
 }
 const base={kind:'exercise',domain:'teenLanguage',profile_id:'teen',level:2,count:1,cognitive_only:true,cognitive_family:'words'};
 const [legacy,advanced]=request('teen',[{...base,client_revision:13},{...base,client_revision:15}]);
 assert.equal(legacy.status,200);assert.equal(advanced.status,200);
 assert.match(legacy.data.items[0].contentKey,/^cognitive-v1:/);assert.match(advanced.data.items[0].contentKey,/^cognitive-v2:/);
 assert.doesNotThrow(()=>words.validate(advanced.data.items[0]));
});

test('digital and paper scenarios require different operations and reject changed evidence',()=>{
 for(const age of ages){
   const pools=[1,2,3].map(level=>communication.pool(age,level));
   const extra=pools[0].filter(item=>item.contentKey.startsWith('communication-v2'));
   assert.equal(new Set(extra.map(item=>item.primaryConstruct)).size,extra.length);
   for(const [level,items] of pools.entries())for(const item of items.filter(it=>it.contentKey.startsWith('communication-v2'))){
     assert.ok(communication.validate(item));
     assert.throws(()=>communication.validate({...item,a:item.opts[1]}),/documento/);
     if(level>0)assert.notEqual(item.q,extra.find(it=>it.mechanic===item.mechanic).q);
   }
   if(age!=='early')assert.equal(new Set(extra.map(it=>it.stimulus[0].materialType).filter(Boolean)).size,6);
 }
 const config={kind:'exercise',domain:'communication',profile_id:'teen',level:2,count:1};
 const rows=request('teen',[{...config,client_revision:13},...Array.from({length:7},()=>({...config,client_revision:15}))]);
 assert.ok(rows.every(row=>row.status===200));
 assert.match(rows[0].data.items[0].contentKey,/^communication-v1:/);
 assert.ok(rows.slice(1).some(row=>row.data.items[0].contentKey.startsWith('communication-v2')));
});

test('progress, CSV and Excel use the same snapshot without raw technical labels or formulas',async()=>{
 const schema='gliax.exercise-metrics.v1',sessionId='session-a';
 const rows=[
  {subject:'communication',correct:false,points:0,ts:'2026-10-01',sessionId},
  {subject:'speedReasoning',speedFamily:'unpaired',correct:true,points:10,ts:'2026-10-01',sessionId},
  {subject:'executive',correct:true,points:10,ts:'2026-10-02',detail:JSON.stringify({schema,modality:'rule_application',definition_version:2,trials:4,correct:3,response_times_ms:[512,630]})},
  {subject:'executive',correct:null,points:0,ts:'2026-10-02',detail:{schema,modality:'guided_wait',interval_ms:4000,duration_ms:4300}},
  {subject:'language',correct:null,points:0,ts:'2026-10-02',detail:{schema,modality:'falling_words',definition_version:1,correct:3}}
 ];
 const original=structuredClone(rows),report=reports.build(rows);
 assert.deepEqual(rows,original);
 assert.deepEqual(Object.values(report.groups).map(g=>[g.count,g.correct]),[[2,1],[1,1],[1,0],[1,0]]);
 assert.equal(report.sessions[0].precision,50);
 const tables=reports.tables(report,'=DEMO','10–12 años');
 assert.equal(tables.Sesiones[2][1],report.groups.scored.count);
 assert.equal(tables.Detalle.length-2,rows.length);
 const csv=reports.csv(tables.Detalle);
 assert.match(csv,/'=DEMO/);
 assert.match(csv,/Comunicación funcional.*Busca el símbolo sin pareja/s);
 assert.doesNotMatch(csv,/unpaired|guided_wait|response_times_ms|\{"schema"/);
 const zip=await Zip.loadAsync(await reports.excel(tables,Zip));
 const workbook=await zip.file('xl/workbook.xml').async('string');
 for(const name of ['Resumen','Sesiones','Detalle','Áreas'])assert.match(workbook,new RegExp(name));
 const detail=await zip.file('xl/worksheets/sheet3.xml').async('string');
 assert.match(detail,/<c r="A3" t="inlineStr" s="0"><is><t xml:space="preserve">=DEMO/);
 assert.match(detail,/Ensayos 4/);
 assert.doesNotMatch(detail,/<f>|response_times_ms|unpaired/);
});

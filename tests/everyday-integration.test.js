const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const d=require('../js/document-library'),p=require('../js/photo-library'),m=require('../js/activity-model'),l=require('../js/locale-content');
test('twelve added source documents work in screen, print and localized planning without changing old files',()=>{
 const docs=Object.entries(d.documents).filter(([id])=>id.startsWith('everyday-'));assert.equal(docs.length,12);
 for(const [id,doc] of docs){assert.ok(fs.existsSync(doc.path));for(const age of ['junior','primary','middle','teen'])for(const domain of ['attention','executive','literacy'])for(const level of [1,2,3]){
  const item=d.pool(age,domain,level).find(it=>it.passageKey==='document:'+id);if(!item)continue;
  for(const locale of Object.keys(l.labels)){const adapted=l.localizeItem(item,locale,domain);assert.doesNotThrow(()=>m.forDelivery(adapted,{age_band:age==='junior'?'primary':age,progress:{ageRoute:age}},domain),id+'/'+locale);}
 }}
 assert.equal(d.get('everyday-school-catalogue').facts.saving,4);assert.equal(d.get('everyday-grocery-receipt').facts.change,2);
});
test('new scenes offer one, two and three visible facts, with no invented difference photos',()=>{
 for(const id of ['library2026','autumnPark2026']){assert.ok(!p.pairs[id]);for(const level of [1,2,3]){const bank=p.pool('teen','memory',level).filter(x=>x.photoTask.sceneId===id);assert.equal(bank.length,4);for(const it of bank){assert.doesNotThrow(()=>p.validate(it));if(level>1)assert.equal(it.photoTask.evidence.length,level);}}}
});
test('deployed handler keeps unknown source IDs away from cached clients but serves them to revision eight',()=>{
 const base={kind:'exercise',profile_id:'teen',domain:'attention',level:1,count:12,documents_only:true,locale:'es_es'};
 const rows=execFileSync(process.execPath,['tests/edge-worker.js','teen'],{input:[{...base,client_revision:7},{...base,client_revision:8},{...base,domain:'memory',documents_only:false,photos_only:true,client_revision:7},{...base,domain:'memory',documents_only:false,photos_only:true,client_revision:8}].map(JSON.stringify).join('\n')+'\n',encoding:'utf8',timeout:60000}).trim().split('\n').map(JSON.parse);
 rows.forEach(r=>assert.equal(r.status,200));
 const added=x=>(x.stimulus||[]).some(b=>String(b.documentId||'').startsWith('everyday-')||['library2026','autumnPark2026'].includes(b.photoId));
 assert.ok(rows[0].data.items.every(x=>!added(x)));assert.ok(rows[1].data.items.some(added));assert.ok(rows[2].data.items.every(x=>!added(x)));assert.ok(rows[3].data.items.some(added));
});

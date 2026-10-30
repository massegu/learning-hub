const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const art=require('../js/phosphor-art'),model=require('../js/activity-model'),photos=require('../js/photo-library'),c=require('../js/curriculum');
test('approved Phosphor uses faithful licensed equivalents in adolescents and preserves younger/state-sensitive art',()=>{
 assert.equal(art.keys.length,74);assert.ok(fs.readFileSync('assets/icons/phosphor-2.1.1/LICENSE','utf8').includes('MIT'));
 for(const key of art.keys){assert.match(art.svg(key),/data-icon-library="phosphor"/);assert.deepEqual([...art.png(key).slice(0,8)],[137,80,78,71,13,10,26,10]);assert.ok(art.png(key).length>200);}
 for(const age of ['middle','teen'])assert.equal(model.artFor('book',{age_band:age}),art);
 for(const age of ['early','junior','primary'])assert.notEqual(model.artFor('book',{age_band:'primary',progress:{ageRoute:age}}),art);
 const source=[{type:'list',presentation:'cards',items:['libro']}];assert.match(model.interactiveStimulus(source,{illustrated:true,iconProfile:{age_band:'teen'}}),/data-icon-library="phosphor"/);assert.doesNotMatch(model.interactiveStimulus(source,{illustrated:true,iconProfile:{age_band:'primary'}}),/data-icon-library="phosphor"/);
 assert.notEqual(model.artFor('bottle-full-open',{age_band:'teen'}),art);assert.notEqual(model.artFor('balloon-red',{age_band:'teen'}),art);
});
test('four newly inspected scenes have real PNGs, six single observations and two/three-fact recall',()=>{
 for(const id of ['ceramics2026','music2026','bicycle2026','greenhouse2026']){
  const scene=photos.scenes[id],png=fs.readFileSync(scene.path);assert.equal(scene.facts.length,6);assert.equal(png.readUInt32BE(16),scene.width);assert.equal(png.readUInt32BE(20),scene.height);assert.equal(Boolean(photos.pairs[id]),['ceramics2026','music2026'].includes(id));
  for(const level of [1,2,3]){const bank=photos.pool('teen','memory',level).filter(x=>x.photoTask.sceneId===id);assert.equal(bank.length,level===1?6:4);for(const it of bank){photos.validate(it);assert.ok(it.opts.includes(it.a));if(level>1)assert.equal(it.photoTask.evidence.length,level);}}
 }
});
test('cached photo clients never receive new scene IDs and environment followups require the current revision',()=>{
 const base={kind:'exercise',profile_id:'teen',domain:'memory',level:1,count:10,photos_only:true,client_revision:9};
 const requests=[base,{...base,client_revision:10},{...base,domain:'speedReasoning',count:1,photos_only:false,room_speed_only:true},{...base,domain:'speedReasoning',count:1,photos_only:false,room_speed_only:true,client_revision:10}];
 const rows=execFileSync(process.execPath,['tests/edge-worker.js','teen'],{input:requests.map(JSON.stringify).join('\n')+'\n',encoding:'utf8',timeout:60000}).trim().split('\n').map(JSON.parse);
 assert.equal(rows[0].status,200);assert.ok(rows[0].data.items.every(x=>!['ceramics2026','music2026','bicycle2026','greenhouse2026'].includes(x.photoTask?.sceneId)));assert.equal(rows[1].status,200);assert.equal(rows[2].status,409);assert.equal(rows[3].status,200);assert.ok(rows[3].data.items[0].roomSpeedTask.followUp);
});
test('functional followups and active-rule instructions stay tied to the visible conditions',()=>{
 for(const age of ['junior','primary','middle','teen'])for(const level of [1,2,3]){
  for(const item of c.roomSpeedPool(age,level)){assert.equal(item.roomSpeedTask.followUpConstruct,'functionalLanguage');assert.ok(item.roomSpeedTask.followUp.length>20);assert.equal(item.speedTask,undefined);c.validateRoomSpeed(item);const bad=structuredClone(item);bad.roomSpeedTask.followUp='Otro encargo';assert.throws(()=>c.validateRoomSpeed(bad));}
  for(const item of c.processingChallenges(age,level).filter(x=>x.speedFamily==='ruleChoice')){const rule=item.speedEvidence.rule;assert.ok(item.q.includes(rule==='LETRA'?'solo la letra':'solo el número'));assert.ok(item.q.includes('ignora'));assert.ok(item.why.includes('La respuesta es '+item.a.toLowerCase()));c.validateSpeed(item);}
 }
});

test('new difference pairs use factual quantity/presence/location changes and unique reversed choices',()=>{
 for(const id of ['ceramics2026','music2026'])for(const level of [1,2,3]){
  const pair=photos.pairs[id];assert.equal(pair.textSelectionOnly,true);assert.ok(fs.existsSync(pair.path));const bank=photos.pool('teen','attention',level).filter(x=>x.photoTask.pairId===id);assert.equal(bank.length,level===1?3:1);
  for(const it of bank){photos.validate(it);assert.equal(new Set(it.opts).size,it.opts.length);assert.ok(it.answers.every(x=>it.opts.includes(x)));if(level===3)assert.equal(it.answers.length,3);}
 }
});

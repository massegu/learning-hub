const test=require('node:test'),assert=require('node:assert/strict'),load=require('./edge-harness');
test('complete Edge package executes all seven local imports and attaches both supplemental banks',()=>{
  const {context,loadedImports}=load();
  assert.deepEqual(loadedImports,['./junior.js','./primary-content.js','./data/primary.js','./data/middle.js','./data/teen.js','./data/english.js','./data/literacy.js']);
  let total=0;
  for(const band of ['primary','middle','teen']){
    const data=context.LEARNING_DATA[band];assert.ok(data);
    assert.equal(data.english.length,60);assert.equal(data.literacy.length,60);
    assert.equal(data.subjects.filter(x=>x==='english').length,1);assert.equal(data.subjects.filter(x=>x==='literacy').length,1);
    for(const subject of data.subjects){
      const group=data[subject];const banks=Array.isArray(group)?[group]:Object.values(group);
      for(const bank of banks){
        assert.equal(bank.length,60);assert.equal(new Set(bank.map(it=>it.id)).size,bank.length);
        for(const level of [1,2,3])assert.ok(bank.some(it=>it.level===level),`${band}/${subject}/${level}`);
        total+=bank.length;
      }
    }
  }
  assert.equal(total,1080);
});
test('legacy academic lookup uses the recovered bank and respects skill and level without mutating it',()=>{
  const {api,context}=load();const before=JSON.stringify(context.LEARNING_DATA);
  for(const band of ['primary','middle','teen'])for(const domain of context.LEARNING_DATA[band].subjects){
    for(const skill of domain==='language'?['grammar','spelling','writing']:[null])for(const level of [1,2,3]){
      const pool=api.academicPool(band,domain,skill,level);assert.ok(pool.length);
      assert.ok(pool.every(it=>it.level===level));
      const source=domain==='language'?context.LEARNING_DATA[band].language[skill]:context.LEARNING_DATA[band][domain];
      assert.ok(pool.every(it=>source.some(original=>original.id===it.id)));
    }
  }
  assert.equal(JSON.stringify(context.LEARNING_DATA),before);
});
test('all supported active exercise/worksheet routes retain their generators rather than silently switching to legacy data',()=>{
  const {api,context}=load();
  for(const band of ['primary','middle','teen'])Object.defineProperty(context.LEARNING_DATA,band,{get(){throw new Error('Unexpected legacy lookup');}});
  for(const [band,domains] of Object.entries(api.SUBJECTS))for(const domain of domains)for(const level of [1,2,3]){
    const it=api.variantExercise(band,domain,level);assert.ok(it,`${band}/${domain}`);
    const sheet=api.worksheetTask(band,domain,level);assert.equal(sheet.sourceDomain,domain);
    if(band==='primary')assert.equal(it.schoolProfile.route,'primary');
    if(band==='junior')assert.equal(it.juniorProfile.route,'junior');
  }
});

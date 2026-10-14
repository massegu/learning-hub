const test=require('node:test'),assert=require('node:assert/strict');
const bank=require('../supabase/functions/request-learning-content/junior'),model=require('../js/activity-model'),locale=require('../js/locale-content'),stages=require('../js/age-stages'),load=require('./edge-harness');
const domains=['language','reading','division','attention','memory','executive','speedReasoning','applied'];
const profile={age_band:'primary',progress:{ageRoute:'junior'}};
const visible=it=>JSON.stringify([it.q,it.stimulus,it.memoryContent,it.memoryQuestion,it.opts,it.a,it.answer]);
test('all authored junior domains/levels project in every locale and bind complete source material',()=>{
  const {api}=load();
  for(const domain of domains)for(const level of [1,2,3]){
    const items=bank.pool(domain,level);
    assert.ok(items.length>=24);
    assert.equal(new Set(items.map(it=>it.juniorProfile.context)).size,6);
    assert.ok(new Set(items.map(visible)).size>=20,`${domain} ${level}`);
    for(const it of items){
      assert.equal(api.validateItem(api.normalizeItem(structuredClone(it))),true);
      assert.deepEqual(stages.audit(it,profile,level).issues,[],it.contentKey);
      for(const country of Object.keys(locale.labels)){
        const localized=locale.localizeItem(it,country,domain),projection=model.printable(localized,profile);
        assert.ok(projection.stimulus.length);
        assert.equal(localized.a, it.a); // neutral word-form evidence is unchanged
        assert.throws(()=>model.printable({...localized,stimulus:[]},profile));
      }
      if(it.type==='order')assert.deepEqual([...it.tokens].sort(),[...it.answer].sort());
      if(it.memoryContent)assert.ok(it.memoryContent.some(x=>x.detail===it.a));
      assert.doesNotMatch(JSON.stringify(it),/\b(?:hipoteca|factura|administrativo|embarque|euros|vosotros)\b/iu);
      assert.doesNotMatch(JSON.stringify(it),/\b(?:de|a) el\b/u);
    }
  }
});
test('level changes alter actual task demands, including recall, steps, operations and spelling evidence',()=>{
  for(const domain of domains){
    const levels=[1,2,3].map(l=>bank.pool(domain,l));
    for(let i=0;i<levels[0].length;i++)assert.equal(new Set(levels.map(xs=>visible(xs[i]))).size,3,levels[0][i].contentKey);
  }
  for(const l of [1,2,3]){
    for(const it of bank.pool('memory',l))assert.equal(it.memoryContent.length,l+2);
    for(const it of bank.pool('executive',l).filter(it=>it.type==='order'))assert.equal(it.answer.length,l+1);
    for(const it of bank.pool('language',l,'spelling').filter(it=>it.mechanic==='spelling_0')){
      const original=it.stimulus[0].text.slice('Modelo: '.length),pattern=it.stimulus[1].text.slice('Copia: '.length);
      assert.equal(pattern.replace('_',it.a),original);
    }
    for(const it of bank.pool('language',l,'spelling').filter(it=>it.mechanic==='spelling_1'))assert.equal(it.a.replaceAll('-',''),it.stimulus[0].text);
    for(const it of bank.pool('division',l)){
      const nums=it.stimulus[0].text.match(/\d+/g).map(Number);
      const result=it.mechanic==='addition'?nums[0]+nums[1]-(nums[2]||0):it.mechanic==='subtraction'?nums[0]-nums[1]+(nums[2]||0):it.mechanic==='groups'?nums[0]*nums[1]+(nums[2]||0):nums[0]/nums[1];
      assert.equal(Number(it.a),result);
    }
  }
});
test('real Edge interactive factory honors junior route and each requested Language skill; worksheet shares the bank',()=>{
  const {api}=load();
  for(const domain of domains)for(const level of [1,2,3]){
    for(let n=0;n<15;n++){
      const it=api.variantExercise('junior',domain,level);assert.equal(it.juniorProfile.route,'junior');assert.equal(it.level,level);assert.match(it.id,/^junior-/);
      const sheet=api.worksheetTask('junior',domain,level);assert.equal(sheet.sourceDomain,domain);assert.equal(sheet.juniorProfile.route,'junior');
    }
  }
  for(const focus of ['grammar','spelling','writing'])for(let i=0;i<25;i++)assert.equal(api.variantExercise('junior','language',2,focus).languageFocus,focus);
  assert.throws(()=>bank.generate('language',1,'unknown'));
  for(const age of ['early','primary','middle','teen'])assert.equal(api.variantExercise(age,'attention',1).juniorProfile,undefined);
});
test('production recent-history selection avoids repeats until pool exhaustion and rotates mechanics',()=>{
  const {api}=load();
  for(const domain of domains)for(const level of [1,2,3]){
    const history=[],signatures=[];
    for(let session=0;session<3;session++){
      const items=api.generatedItems(domain,7,history,()=>api.variantExercise('junior',domain,level));
      assert.equal(items.length,7);
      for(const it of items){const sig=api.contentSignature(domain,it);signatures.push(sig);history.push(sig,`${domain}:mechanic:${it.mechanic}`);}
    }
    assert.equal(new Set(signatures).size,21,`${domain}/${level}`);
  }
});

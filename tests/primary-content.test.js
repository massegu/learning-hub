const test=require('node:test'),assert=require('node:assert/strict');
const bank=require('../supabase/functions/request-learning-content/primary-content'),model=require('../js/activity-model'),locale=require('../js/locale-content'),stages=require('../js/age-stages'),load=require('./edge-harness');
const profile={age_band:'primary',progress:{ageRoute:'primary'}};
const domains=['language','reading','division','geometry','english','literacy','attention','memory','executive','speedReasoning','applied'];
const visible=it=>JSON.stringify([it.q,it.stimulus,it.memoryContent,it.memoryQuestion,it.opts&&[...it.opts].sort(),it.a,it.answer]);
test('all primary domains/levels retain evidence, unique choices and locale parity',()=>{
  const {api}=load();
  for(const d of domains)for(const l of [1,2,3]){
    const items=bank.pool(d,l);assert.ok(items.length>=24);assert.equal(new Set(items.map(visible)).size,items.length);
    assert.equal(new Set(items.map(it=>it.schoolProfile.context)).size,6);
    for(const it of items){
      assert.equal(api.validateItem(api.normalizeItem(structuredClone(it))),true,it.contentKey);
      assert.deepEqual(stages.audit(it,profile,l).issues,[],it.contentKey);
      for(const c of Object.keys(locale.labels)){
        const local=locale.localizeItem(it,c,d),projection=model.printable(local,profile);
        assert.ok(projection.stimulus.length);assert.equal(local.a,it.a);
        assert.throws(()=>model.printable({...local,stimulus:[]},profile));
      }
      if(it.type==='order')assert.deepEqual([...it.tokens].sort(),[...it.answer].sort());
      if(it.memoryContent)assert.ok(it.memoryContent.some(x=>x.detail===it.a));
      assert.doesNotMatch(JSON.stringify(it),/\b(?:de|a) el\b/u);
      assert.doesNotMatch(JSON.stringify(it),/\b(?:hipoteca|factura|embarque|euros|vosotros)\b/iu);
    }
  }
});
test('primary levels change evidence and arithmetic/recall/planning demands, not just labels',()=>{
  for(const d of domains){const pools=[1,2,3].map(l=>bank.pool(d,l));for(let j=0;j<pools[0].length;j++)assert.equal(new Set(pools.map(xs=>visible(xs[j]))).size,3,pools[0][j].contentKey);}
  for(const l of [1,2,3]){
    for(const it of bank.pool('memory',l))assert.equal(it.memoryContent.length,l+3);
    for(const d of ['executive','literacy'])for(const it of bank.pool(d,l).filter(it=>it.type==='order'))assert.equal(it.answer.length,l+2);
    for(const it of bank.pool('division',l)){
      const nums=it.stimulus.flatMap(b=>b.type==='text'?[...b.text.matchAll(/\d+/g)].map(x=>Number(x[0])):b.items.map(x=>Number(x.replace(' m','').replace(',','.'))));
      if(it.mechanic==='operations'){let answer=nums[0]+nums[1];if(l>=2)answer*=2;if(l===3)answer-=24;assert.equal(Number(it.a),answer);}
      if(it.mechanic==='fractions')assert.equal(Number(it.a),nums[0]*([1/3,2/3,5/6][l-1]));
      if(it.mechanic==='decimals')assert.ok(Math.abs(Number(it.a.replace(' m','').replace(',','.'))-nums.reduce((a,b)=>a+b,0))<1e-9);
      if(it.mechanic==='proportions')assert.equal(Number(it.a),nums[0]*(nums[1]+(l>=2?2:0))+(l===3?3:0));
    }
    for(const it of bank.pool('applied',l).filter(x=>x.mechanic==='duration')){
      const total=it.stimulus[1].text.match(/\d+/g).map(Number).reduce((a,b)=>a+b,0),[hour,minute]=it.a.split(':').map(Number);
      assert.equal((hour-16)*60+minute,total);assert.ok(minute>=0&&minute<60);
    }
    for(const it of bank.pool('geometry',l)){
      if(it.mechanic==='rectangle_triangle'){const [a,b]=it.stimulus[2].rows.map(row=>parseFloat(row[1]));assert.equal(parseFloat(it.a),l===1?2*(a+b):l===2?a*b:a*b/2);}
      if(it.mechanic==='angles'){const ns=it.stimulus[1].text.match(/\d+/g).map(Number);assert.equal(parseFloat(it.a),ns[0]-ns.slice(1).reduce((a,b)=>a+b,0));}
      if(it.mechanic==='square_cube'){const n=Number(it.stimulus[1].text.match(/\d+/)[0]);assert.equal(parseFloat(it.a),l===1?n*4:l===2?n*n:n**3);}
      if(it.mechanic==='map_position'){const ns=it.stimulus.filter(x=>x.type==='text').map(x=>x.text).join(' ').match(/\d+/g).map(Number);assert.equal(Number(it.a),ns[0]+ns[1]-(ns[2]||0));}
    }
    for(const it of bank.pool('language',l,'spelling').filter(it=>it.mechanic==='spelling_0'))assert.equal(it.stimulus[1].text.slice('Copia: '.length).replace('_',it.a),it.stimulus[0].text.slice('Modelo: '.length));
    for(const it of bank.pool('language',l,'spelling').filter(it=>it.mechanic==='spelling_1'))assert.equal(it.a.replaceAll('-',''),it.stimulus[0].text);
  }
});
test('active primary Edge factory/worksheets use the reviewed bank and route Language skills',()=>{
  const {api}=load();
  for(const d of domains)for(const l of [1,2,3])for(let n=0;n<10;n++){
    const it=api.variantExercise('primary',d,l);assert.equal(it.schoolProfile.route,'primary');assert.match(it.id,/^primary-/);
    const sheet=api.worksheetTask('primary',d,l);assert.equal(sheet.sourceDomain,d);assert.equal(sheet.schoolProfile.level,l);
  }
  for(const skill of ['grammar','spelling','writing'])for(let n=0;n<20;n++)assert.equal(api.variantExercise('primary','language',2,skill).languageFocus,skill);
  assert.throws(()=>bank.generate('language',2,'unknown'));
  for(const age of ['early','junior','middle','teen'])assert.notEqual(api.variantExercise(age,'attention',1).schoolProfile?.route,'primary');
});
test('primary history excludes repeats through three consecutive seven-item sessions',()=>{
  const {api}=load();
  for(const d of domains)for(const l of [1,2,3]){const history=[],signatures=[];
    for(let session=0;session<3;session++){
      const items=api.generatedItems(d,7,history,()=>api.variantExercise('primary',d,l));assert.equal(items.length,7);
      for(const it of items){const sig=api.contentSignature(d,it);signatures.push(sig);history.push(sig,`${d}:mechanic:${it.mechanic}`);}
    }
    assert.equal(new Set(signatures).size,21,`${d}/${l}`);
  }
});
test('primary attention and reasoning responses derive from the visible rule and sequence',()=>{
  for(const l of [1,2,3]){
    for(const it of bank.pool('attention',l)){
      if(it.mechanic==='scan'){const target=it.q.match(/«(.+)»/)[1];assert.equal(Number(it.a),it.stimulus[0].items.filter(x=>x===target).length);}
      if(it.mechanic==='table_rules'){
        const rows=it.stimulus[1].rows.slice(1),matches=rows.filter(r=>l===1?r[1]==='martes':l===2?r[1]==='lunes'&&r[2]==='pendiente':r[1]==='lunes'&&r[2]==='listo'&&it.q.includes(r[3]));
        assert.equal(matches.length,1);assert.equal(it.a,matches[0][0]);
      }
      if(it.mechanic==='exact_match')assert.equal(it.opts.filter(x=>x===it.stimulus[1].text.slice('Modelo: '.length)).length,1);
    }
    for(const it of bank.pool('speedReasoning',l).filter(x=>x.mechanic==='series')){
      const ns=it.stimulus[1].text.split(' · ').slice(0,-1).map(Number),last=ns.at(-1);
      assert.equal(Number(it.a),l===1?last+ns[1]-ns[0]:l===2?last*2:last+(last-ns.at(-2))+1);
    }
  }
});
test('pronoun questions distinguish their antecedents by authored gender and number',()=>{
  for(const it of bank.pool('language',2,'grammar').filter(x=>x.mechanic==='grammar_1')){
    const first=it.a.split(' ')[0],text=it.stimulus[0].text,second=text.match(/ y (.+?)\. Después/)[1].split(' ')[0];
    assert.notEqual(first,second,it.contentKey);
    const pronoun=first==='el'?'lo':first==='la'?'la':first;
    assert.ok(text.endsWith(`Después ${pronoun} revisó.`));
  }
});

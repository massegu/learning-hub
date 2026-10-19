const test=require('node:test'),assert=require('node:assert/strict');
const bank=require('../supabase/functions/request-learning-content/middle-content'),model=require('../js/activity-model'),locale=require('../js/locale-content'),stages=require('../js/age-stages'),load=require('./edge-harness');
const profile={age_band:'middle',progress:{ageRoute:'middle'}};
const domains=['middleLanguage','middleMath','middleReading','english','literacy','attention','executive','memory','speedReasoning','applied'];
const visible=it=>JSON.stringify([it.q,it.stimulus,it.memoryContent,it.memoryQuestion,it.opts&&[...it.opts].sort(),it.a,it.answer,it.sample]);
test('all middle activities retain complete evidence and consistent seven-country/international projection',()=>{
  const {api}=load();
  for(const d of domains)for(const l of [1,2,3]){
    const xs=bank.pool(d,l);assert.ok(xs.length>=24);assert.equal(new Set(xs.map(visible)).size,xs.length);
    assert.equal(new Set(xs.map(it=>it.schoolProfile.context)).size,6);
    for(const it of xs){
      assert.equal(api.validateItem(api.normalizeItem(structuredClone(it))),true,it.contentKey);
      assert.deepEqual(stages.audit(it,profile,l).issues,[],it.contentKey);
      for(const c of Object.keys(locale.labels)){
        const local=locale.localizeItem(it,c,d),projection=model.printable(local,profile);assert.ok(projection.stimulus.length);assert.equal(local.a,locale.text(it.a,c,local.lexicalSenses));
        assert.throws(()=>model.printable({...local,stimulus:[]},profile));
      }
      if(it.type==='order')assert.deepEqual([...it.tokens].sort(),[...it.answer].sort());
      if(it.memoryContent)assert.ok(it.memoryContent.some(x=>x.detail===it.a));
      if(it.type==='self'){assert.equal(it.assessment,'self');assert.ok(it.writingRubric.length>=3);assert.ok(it.sample);assert.equal(it.a,undefined);const projection=model.printable(it,profile);assert.equal(projection.responseType,'written');assert.deepEqual(projection.writingRubric,it.writingRubric);assert.ok(projection.stimulus.every(b=>b.type!=='list'||JSON.stringify(b.items)!==JSON.stringify(it.writingRubric)));}
      assert.doesNotMatch(JSON.stringify(it),/\b(?:de|a) el\b/u);
      assert.doesNotMatch(JSON.stringify(it),/\b(?:hipoteca|factura|embarque|euros|vosotros)\b/iu);
    }
  }
});
test('middle stages alter stimuli and actual algebra/statistics/clock/recall demands',()=>{
  for(const d of domains){const pools=[1,2,3].map(l=>bank.pool(d,l));for(let j=0;j<pools[0].length;j++)assert.equal(new Set(pools.map(xs=>visible(xs[j]))).size,3,pools[0][j].contentKey);}
  for(const l of [1,2,3]){
    for(const it of bank.pool('memory',l))assert.equal(it.memoryContent.length,l+4);
    for(const d of ['executive','literacy'])for(const it of bank.pool(d,l).filter(x=>x.type==='order'))assert.equal(it.answer.length,l+3);
    for(const it of bank.pool('middleMath',l)){
      if(it.mechanic==='equation'){
        const statement=it.stimulus[1].text.split('. ')[0],x=Number(it.a);
        const expression=part=>Number(Function('x','return '+part.replace(/(\d)x/g,'$1*x').replace(/(\d)\(/g,'$1*('))(x));
        const [left,right]=statement.split(' = ');assert.equal(expression(left),expression(right));
      }
      if(it.mechanic==='percentage'){const total=Number(it.stimulus[0].text.match(/\d+/)[0]);assert.equal(Number(it.a),l===1?total*.1:l===2?total*.25:total*.8);}
      if(it.mechanic==='statistics'){const xs=it.stimulus[1].items.map(Number),mean=xs.reduce((a,b)=>a+b,0)/xs.length,median=xs.length%2?xs[Math.floor(xs.length/2)]:(xs[xs.length/2-1]+xs[xs.length/2])/2;assert.equal(Number(it.a),l===1?mean:l===2?median:mean-median);}
      if(it.mechanic==='rate'){const ns=it.stimulus[0].text.match(/\d+/g).map(Number);assert.equal(Number(it.a),ns[0]*(ns[1]-(ns[2]||0)));}
    }
    for(const it of bank.pool('applied',l).filter(x=>x.mechanic==='clock')){
      const source=it.stimulus[1].text,match=source.match(/(\d+):(\d+)/),durations=source.slice(match.index+match[0].length).match(/\d+/g).map(Number),[h,m]=it.a.split(':').map(Number);
      assert.equal(h*60+m,Number(match[1])*60+Number(match[2])+durations.reduce((a,b)=>a+b,0));assert.ok(m>=0&&m<60);
    }
    for(const it of bank.pool('middleLanguage',l,'spelling').filter(x=>x.mechanic==='spelling_1'))assert.equal(it.stimulus[1].text.slice('Copia: '.length).replace('_',it.a),it.stimulus[0].text.slice('Modelo: '.length));
  }
});
test('middle rule/count/pattern answers derive from all and only the displayed conditions',()=>{
  for(const l of [1,2,3]){
    for(const it of bank.pool('attention',l)){
      if(it.mechanic==='state_count')assert.equal(Number(it.a),it.stimulus[1].items.filter(x=>x==='dato confirmado').length);
      if(it.mechanic==='table_rules'){const matches=it.stimulus[1].rows.slice(1).filter(r=>l===1?r[1]==='ayer':l===2?r[1]==='hoy'&&r[2]==='pendiente':r[1]==='hoy'&&r[2]==='revisado'&&r[3]==='PDF');assert.equal(matches.length,1);assert.equal(it.a,matches[0][0]);}
      if(it.mechanic==='code')assert.equal(it.opts.filter(x=>x===it.stimulus[1].text.slice('Modelo: '.length)).length,1);
    }
    for(const it of bank.pool('speedReasoning',l).filter(x=>x.mechanic==='pattern')){const ns=it.stimulus[1].text.split(' · ').slice(0,-1).map(Number),last=ns.at(-1);assert.equal(Number(it.a),l===1?last+3:l===2?last+(last-ns.at(-2))+1:last*2+1);}
  }
});
test('active middle generator/worksheets honor domain, level and each Language skill without affecting other routes',()=>{
  const {api}=load();
  for(const d of domains)for(const l of [1,2,3])for(let i=0;i<8;i++){
    const it=api.variantExercise('middle',d,l);assert.equal(it.schoolProfile.route,'middle');assert.match(it.id,/^middle-/);
    const ws=api.worksheetTask('middle',d,l);assert.equal(ws.sourceDomain,d);assert.equal(ws.schoolProfile.level,l);
  }
  for(const skill of ['grammar','spelling','writing'])for(let i=0;i<20;i++)assert.equal(api.variantExercise('middle','middleLanguage',2,skill).languageFocus,skill);
  assert.throws(()=>bank.generate('middleLanguage',2,'unknown'));
  for(const age of ['early','junior','primary','teen'])assert.notEqual(api.variantExercise(age,'attention',1).schoolProfile?.route,'middle');
});
test('real middle history avoids repetition through three consecutive seven-item sessions',()=>{
  const {api}=load();
  for(const d of domains)for(const l of [1,2,3]){
    const history=[],seen=[];for(let session=0;session<3;session++){
      const items=api.generatedItems(d,7,history,()=>api.variantExercise('middle',d,l));assert.equal(items.length,7);
      for(const it of items){const sig=api.contentSignature(d,it);seen.push(sig);history.push(sig,`${d}:mechanic:${it.mechanic}`);}
    }assert.ok(['reading','literacy','middleReading'].includes(d)?new Set(seen).size>=10:new Set(seen).size===21,`${d}/${l}`); if(['reading','literacy','middleReading'].includes(d))for(let i=0;i<=seen.length-10;i++)assert.equal(new Set(seen.slice(i,i+10)).size,10);
  }
});

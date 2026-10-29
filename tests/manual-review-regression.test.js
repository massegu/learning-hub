const test=require('node:test'),assert=require('node:assert/strict');
const junior=require('../supabase/functions/request-learning-content/junior'),teen=require('../supabase/functions/request-learning-content/teen-review');
const load=require('./edge-harness'),model=require('../js/activity-model'),locale=require('../js/locale-content'),journey=require('../js/school-journey');
test('junior reading has real passages, and level-three memory retrieves two ordered relations',()=>{
  for(const level of [1,2,3])for(const it of junior.pool('reading',level)){
    const passage=it.stimulus[0].text;
    assert.ok(passage.split(/\s+/).length>=40);
    assert.ok(passage.split(/[.!?]/).filter(x=>x.trim()).length>=5);
  }
  for(const it of junior.pool('memory',3)){
    const parts=it.a.split(' → ');assert.equal(parts.length,2);assert.equal(new Set(parts).size,2);
    assert.equal(it.opts.length,4);assert.equal(new Set(it.opts).size,4);
    if(it.mechanic==='association'){
      const names=it.memoryQuestion.match(/tenían (.+) y (.+),/).slice(1);
      assert.deepEqual(names.map(name=>it.memoryContent.find(x=>x.person===name).detail),parts);
    }else{
      const positions=it.memoryQuestion.match(/lugares (\d+) y (\d+)/).slice(1).map(Number);
      assert.deepEqual(positions.map(n=>it.memoryContent[n-1].detail),parts);
    }
  }
});
test('primary reading is integrated in missions without changing junior or stored historical domains',()=>{
  const primary={age_band:'primary'},junior={age_band:'primary',progress:{ageRoute:'junior'}};
  assert.ok(journey.forMissions(primary).every(m=>!m.plan.includes('reading')));
  assert.ok(journey.definition('detective',primary).plan.includes('literacy'));
  assert.ok(journey.definition('detective',junior).plan.includes('reading'));
  let state=journey.start(null,'detective');state=journey.record(state,'attention','a',primary);state=journey.record(state,'literacy','b',primary);state=journey.record(state,'attention','c',primary);
  assert.equal(state.active,null);assert.equal(state.completed.length,1);
});
test('focused teen routes deliver real orthography, mature reasoning and evidence-bound reading in every locale',()=>{
  const {api}=load();
  for(const domain of ['teenLanguage','literacy','speedReasoning'])for(const level of [1,2,3]){
    for(const it of teen.pool(domain,level)){
      assert.equal(api.validateItem(api.normalizeItem(structuredClone(it))),true,it.contentKey);
      for(const country of Object.keys(locale.labels))model.printable(locale.localizeItem(it,country,domain),{age_band:'teen'});
      assert.doesNotMatch(it.q,/¿(?:Qué número es mayor|Dónde hay más|A qué se refiere «lo»)/);
      if(it.opts){assert.equal(new Set(it.opts).size,it.opts.length);assert.ok(it.opts.includes(it.a));}
      if(domain==='literacy')assert.ok(it.stimulus[0].text.split(/\s+/).length>=45);
    }
    const delivered=api.variantExercise('teen',domain,level);assert.ok(domain==='teenLanguage'?delivered.teenReview:delivered.contentKey.startsWith('curriculum-v2-teen-')||delivered.contentKey.startsWith('document-v1:teen:')||delivered.qualityEvidence?.age==='teen');
    const worksheet=api.worksheetTask('teen',domain,level);assert.ok(domain==='teenLanguage'?worksheet.teenReview:worksheet.contentKey.startsWith('curriculum-v2-teen-')||worksheet.contentKey.startsWith('document-v1:teen:')||worksheet.qualityEvidence?.age==='teen'); assert.equal(worksheet.sourceDomain,domain);
    for(const focus of ['grammar','spelling','writing'])assert.equal(api.variantExercise('teen','teenLanguage',level,focus).languageFocus,focus);
    for(const it of teen.pool('teenLanguage',level,'spelling'))assert.doesNotMatch(it.q,/inferencia|resumen|conclusión|refiere/u);
    const history=[],signatures=[];
    for(let session=0;session<3;session++){
      const items=api.generatedItems(domain,7,history,()=>api.variantExercise('teen',domain,level));
      assert.equal(items.length,7);
      for(const it of items){const signature=api.contentSignature(domain,it);history.push(signature,`${domain}:mechanic:${it.mechanic}`);signatures.push(signature);}
    }
    assert.ok(domain==='literacy'?new Set(signatures).size>=10:new Set(signatures).size===21);if(domain==='literacy')for(let i=0;i<=signatures.length-10;i++)assert.equal(new Set(signatures.slice(i,i+10)).size,10);
  }
});
test('teen quantitative reasoning answers follow the displayed percentages, ratios and sequences',()=>{
  for(const level of [1,2,3])for(const it of teen.pool('speedReasoning',level)){
    if(it.mechanic.endsWith('_0')){
      const [total,percent]=it.stimulus[1].text.match(/\d+/g).map(Number),reviewed=total*percent/100;
      assert.equal(Number(it.a),level===1?reviewed:level===2?total-reviewed:reviewed*3/4);
    }
    if(it.mechanic.endsWith('_1')){
      const [n1,p1,n2,p2]=it.stimulus[1].text.match(/\d+/g).map(Number),a=p1/n1,b=p2/n2;
      assert.equal(it.a,a===b?'Tienen el mismo coste por unidad.':a<b?'La oferta A.':'La oferta B.');
    }
    if(it.mechanic.endsWith('_3')){
      const xs=it.stimulus[1].text.match(/\d+/g).map(Number);
      assert.equal(Number(it.a),level===1?xs.at(-1)+6:level===2?xs.at(-1)*2+1:xs.at(-1)+16);
    }
  }
});
test('structured stimulus rendering preserves all values, escapes markup and exposes headers without relying on icons',()=>{
  const blocks=[{type:'list',items:['el lápiz','<script>']},{type:'table',header:true,rows:[['Equipo','Código'],['A','P14-C8']]}];
  const html=model.interactiveStimulus(blocks,{structured:true});
  assert.match(html,/structured-stimulus-list/);assert.match(html,/<th scope="col">Equipo<\/th>/);assert.match(html,/&lt;script&gt;/);
  for(const value of ['el lápiz','P14-C8'])assert.ok(html.includes(value));
});

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const load=require('./edge-harness'),locale=require('../js/locale-content'),model=require('../js/activity-model');
test('deployable server lexicon is identical to the client rules, including agreement and protected English',()=>{
  assert.equal(fs.readFileSync(require.resolve('../js/locale-content'),'utf8'),fs.readFileSync(require.resolve('../supabase/functions/request-learning-content/locale-content'),'utf8'));
  const {api}=load();
  const raw={id:'keep-id',contentKey:'keep-key',domain:'reading',q:'¿Dónde está el ordenador?',scenario:'El ordenador está junto al bolígrafo.',opts:['Junto al bolígrafo','En la piscina'],a:'Junto al bolígrafo',writingRubric:['Usa el ordenador.']};
  for(const key of Object.keys(locale.labels)){
    const expected=locale.localizeItem(raw,key,'reading'),actual=api.localizeValue(raw,key);
    assert.deepEqual(JSON.parse(JSON.stringify(actual)),expected);
    assert.equal(actual.id,raw.id);assert.equal(actual.contentKey,raw.contentKey);
    const english={...raw,domain:'english',scenario:'The computer is on the table.',opts:['computer','ordenador'],a:'computer'};
    const englishResult=api.localizeValue(english,key);assert.deepEqual(Array.from(englishResult.opts),english.opts);assert.equal(englishResult.scenario,english.scenario);
  }
  assert.equal(locale.text('El autobús llega a las 8:00.','es_mx'),'El autobús llega a las 8:00.');
  assert.equal(locale.text('El autobús llega a las 8:00.','es_ar'),'El colectivo llega a las 8:00.');
  assert.equal(locale.text('Un camión transporta cajas. El bus de datos funciona.','es_mx'),'Un camión transporta cajas. El bus de datos funciona.');
  assert.equal(api.localizeValue(raw,'unsupported').localization.locale,'es_intl');
  const phone=require('../supabase/functions/request-learning-content/teen-review').pool('literacy',1).find(it=>it.teenReview.context==='interview');
  for(const country of Object.keys(locale.labels)){
    const localized=locale.localizeItem(phone,country,'literacy'),output=JSON.stringify(localized.stimulus);
    assert.match(output,country==='es_es'?/teléfonos móviles/:/teléfonos celulares/);
  }
});
test('regional candidate selection excludes foreign-currency and ambiguous word-form items without changing amounts',()=>{
  const {api}=load(),foreign={id:'euro',domain:'executive',q:'¿Cuánto queda?',scenario:'Tienes 20 euros y gastas 5 euros.',opts:['15 euros','10 euros'],a:'15 euros'};
  assert.equal(api.regionalCandidate(foreign,'es_co','executive','teen'),null);
  assert.equal(api.regionalCandidate(foreign,'es_mx','executive','teen'),null);
  assert.equal(api.regionalCandidate(foreign,'es_es','executive','teen').a,'15 euros');
  assert.equal(foreign.a,'15 euros');
  const contextual={...foreign,currencyContext:'foreign',scenario:'En un viaje a España tienes 20 euros y gastas 5 euros.'};
  assert.equal(api.regionalCandidate(contextual,'es_co','executive','teen').a,'15 euros');
  const phonics={q:'¿Cuántas letras tiene bolígrafo?',opts:['9','5'],a:'9'};
  assert.equal(api.regionalCandidate(phonics,'es_mx','language','primary'),null);
  assert.throws(()=>api.regionalCandidate({memoryContent:[null]},'es_co','memory','primary'),/Cannot read/);
});
test('a topic appears once on screen while canonical worksheet evidence is retained',()=>{
  for(const name of ['primary-content','middle-content']){
    const bank=require('../supabase/functions/request-learning-content/'+name);
    for(const domain of name==='primary-content'?['language','geometry','speedReasoning']:['middleLanguage','middleMath','attention'])for(const level of [1,2,3])for(const it of bank.pool(domain,level)){
      const blocks=it.stimulus||[];
      if(blocks.length<2||!blocks.some(b=>b.text===it.topic))continue;
      const html=model.interactiveStimulus(blocks,{structured:true,heading:it.topic});
      assert.ok(!html.includes(`<p class="stimulus-paragraph">${it.topic}</p>`));
      const projection=model.printable(it,{age_band:name==='primary-content'?'primary':'middle'});
      assert.ok(projection.stimulus.some(b=>b.text===it.topic));
    }
  }
  const pool=require('../supabase/functions/request-learning-content/primary-content').pool('language',1,'grammar');
  assert.match(pool.find(it=>it.schoolProfile.context==='garden'&&it.mechanic==='grammar_2').stimulus.at(-1).text,/Regamos las plantas del huerto.*tierra estaba seca/);
  assert.match(pool.find(it=>it.schoolProfile.context==='stories'&&it.mechanic==='grammar_2').stimulus.at(-1).text,/final del cuento.*robot/);
});

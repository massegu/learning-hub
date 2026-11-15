const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const locale=require('../js/locale-content');
const early=require('../js/early-content');
const policy=require('../js/content-policy');
const model=require('../js/activity-model');
const fixtures=require('./locale-fixtures');
const locales=Object.keys(locale.labels);
const child={age_band:'primary',progress:{ageRoute:'early'}};

test('account locale precedence, explicit international, aliases and unknown values are deterministic',()=>{
  assert.equal(locale.effective({locale:'es_ar'},'es_mx'),'es_mx');
  assert.equal(locale.effective({locale:'es_ar'},'es_intl'),'es_intl');
  assert.equal(locale.effective({locale:'es_ar'},null),'es_ar');
  assert.equal(locale.normalize('ES-MX'),'es_mx');
  for(const unknown of ['es_PE','zz',{},'México'])assert.equal(locale.normalize(unknown),'es_intl');
});

test('controlled terminology resolves each country with article, adjective and contraction agreement',()=>{
  for(const key of locales)for(const rule of locale.rules){
    const preferred=rule.preferred[key]||rule.common;
    for(const source of rule.sources){
      const article=source.gender==='f'?'la':'el', adjective=source.gender==='f'?'nueva':'nuevo';
      const targetArticle=preferred.gender==='f'?'la':'el', targetAdjective=preferred.gender==='f'?'nueva':'nuevo';
      assert.equal(locale.text(`${article} ${source.word} ${adjective}`,key),`${targetArticle} ${preferred.word} ${targetAdjective}`,`${key} ${rule.id}`);
      assert.equal(locale.text(source.plural,key),preferred.plural,`${key} plural ${rule.id}`);
      assert.equal(locale.text(source.word.toUpperCase(),key),preferred.word.toUpperCase(),`${key} uppercase ${rule.id}`);
    }
  }
  assert.equal(locale.text('¿Cuántos bolígrafos hay?', 'es_mx'),'¿Cuántas plumas hay?');
  assert.equal(locale.text('El grifo ya está abierto.', 'es_ar'),'La canilla ya está abierta.');
  assert.equal(locale.text('La caja de la computadora.', 'es_es'),'La caja del ordenador.');
  assert.equal(locale.text('Enciende el ordenador.', 'es_mx'),'Enciende la computadora.');
  const banana=early.pool('speedReasoning').find(it=>it.lexicalSenses?.banana);
  for(const [key,term] of Object.entries({es_es:'plátano',es_mx:'plátano',es_co:'banano',es_ar:'banana',es_cl:'plátano',es_pa:'guineo',es_cr:'banano'}))assert.equal(locale.localizeItem(banana,key).a,term);
  assert.equal(locale.text('El plátano verde se cocina.','es_ar'),'El plátano verde se cocina.');
  assert.equal(locale.text('El plátano está nuevo.','es_ar',{banana:true}),'La banana está nueva.');
  const icons=locale.localizeItem({domain:'attention',type:'iconSearch',icons:['banana'],gridColumns:1,q:'¿Cuántos plátanos hay?',opts:['1','2'],a:'1'},'es_ar');
  const printed=locale.localizeModel(model.printable(icons,{age_band:'teen'}),'es_ar','attention',icons);
  assert.equal(printed.question,'¿Cuántas bananas hay?');assert.equal(printed.stimulus[0].rows[0][0],'banana');
});

test('neutral and ambiguous senses, numbers, money, names and protected English retain their meaning',()=>{
  const neutral='Ana lleva su mochila al colegio. El autobús cuesta 2 euros. Un camión lleva plátanos. La pluma del pájaro cae junto al coche de bebé. Un buzo nada. Cumpleaños: dieciséis y veintiséis.';
  for(const key of locales){const bus={es_co:'bus',es_ar:'colectivo',es_cl:'bus',es_pa:'bus',es_cr:'bus'}[key]||'autobús';assert.equal(locale.text(neutral,key),neutral.replace('autobús',bus));}
  const it={domain:'english',id:'en',q:'Mira el ordenador. Elige la palabra en inglés.',opts:['ordenador','computer'],a:'computer'};
  assert.deepEqual(locale.localizeItem(it,'es_mx').opts,it.opts);
  assert.equal(locale.localizeItem(it,'es_mx').q,'Mira la computadora. Elige la palabra en inglés.');
  const tagged=locale.localizeItem({...it,domain:'reading'},'es_mx','english');
  assert.deepEqual(locale.localizeItem(tagged,'es_mx').opts,it.opts);
  assert.throws(()=>locale.localizeItem(tagged,'es_mx','reading'),/área/);
  const price={scenario:'El pan cuesta 2 euros.',q:'¿Cuánto cuesta?',opts:['2 euros','3 euros'],a:'2 euros'};
  assert.throws(()=>locale.localizeItem(price,'es_mx'),/moneda/);
  assert.equal(locale.localizeItem({...price,currencyContext:'foreign'},'es_mx').a,'2 euros');
  assert.equal(locale.localizeItem({q:'¿Quién fue Cristóbal Colón?',opts:['Un navegante','Un pintor'],a:'Un navegante'},'es_es').a,'Un navegante');
  for(const [key,codes] of Object.entries(locale.currencies))for(const code of codes)assert.equal(locale.localizeItem({...price,scenario:`El pan cuesta 2 ${code}.`,opts:[`2 ${code}`,`3 ${code}`],a:`2 ${code}`},key).a,`2 ${code}`);
});

test('local and remote shapes share all visible/scored fields without altering source or evidence identities',()=>{
  for(const key of locales)for(const raw of fixtures()){
    const canonical={...raw,scenario:undefined,stimulus:[{type:'text',text:raw.scenario}]};
    const a=locale.localizeItem(raw,key),b=locale.localizeItem(canonical,key);
    assert.equal(a.scenario,b.stimulus[0].text);
    for(const field of ['q','a','why','topic'])assert.equal(a[field],b[field]);
    assert.deepEqual(a.opts,b.opts);assert.equal(a.id,raw.id);assert.equal(a.contentKey,raw.contentKey);
    assert.ok(a.opts.includes(a.a));
    assert.deepEqual(locale.localizeItem(a,key),a,'same-locale revalidation must be idempotent');
    model.printable(a,{age_band:'teen'});
  }
  const raw={domain:'memory',memoryContent:[{person:'Ana',detail:'el bolígrafo'}],memoryQuestion:'¿Qué tenía Ana?',q:'Mira el bolígrafo.',opts:['el bolígrafo','el cuaderno'],a:'el bolígrafo',stimulus:[{type:'table',rows:[['Ana','el bolígrafo']]}],answerEvidence:{type:'tableCell',block:0,row:0,column:1,subjectColumn:0},tokens:['Coge el bolígrafo','Guarda el bolígrafo'],answer:['Coge el bolígrafo','Guarda el bolígrafo']};
  const localized=locale.localizeItem(raw,'es_mx');
  assert.deepEqual(localized.answerEvidence,raw.answerEvidence);
  assert.equal(localized.memoryContent[0].person,'Ana');
  assert.equal(localized.a,localized.stimulus[0].rows[0][1]);
  assert.deepEqual(localized.answer,localized.tokens);
  const rounds=locale.localizeItem({rounds:[{rule:'Busca el bolígrafo.',n:'El bolígrafo',a:true},{rule:'Mira el modelo.',n:17,a:false}]},'es_mx','executive');
  assert.equal(rounds.rounds[0].n,'La pluma');assert.equal(rounds.rounds[0].rule,'Busca la pluma.');
  assert.equal(rounds.rounds[1].n,17);assert.equal(rounds.rounds[1].a,false);
});

test('every early activity at every level remains age-safe and answerable for every supported country',()=>{
  for(const key of locales)for(const level of [1,2,3])for(const domain of policy.early.subjects)for(const raw of early.pool(domain,level)){
    const item=locale.localizeItem(raw,key,domain);
    model.forDelivery(item,child,domain);
    assert.equal(item.id,raw.id);assert.equal(item.semanticKey,raw.semanticKey);
    assert.deepEqual(locale.localizeItem(item,key,domain),item);
    if(key!=='es_es')assert.ok(!/\b(?:coge|grifo|bañador|estáis)\b/i.test(JSON.stringify(item.stimulus)));
  }
});

test('unsafe locale rebasing, answer collisions and unhandled plural grammar fail before rendering',()=>{
  assert.throws(()=>locale.localizeItem({opts:['ordenador','computadora'],a:'ordenador'},'es_mx'),/indistinguibles/);
  assert.throws(()=>locale.localizeItem(locale.localizeItem(fixtures()[0],'es_mx'),'es_es'),/otra variante/);
  assert.throws(()=>locale.text('Vosotros os sentáis aquí.','es_mx'),/revisión/);
  assert.throws(()=>locale.localizeItem({scenario:'El ordenador está apagado.',q:'¿Quieres encenderlo?',opts:['Sí','No'],a:'Sí'},'es_mx'),/pronominal/);
  assert.throws(()=>locale.localizeItem({q:'¿Cuántas letras tiene la palabra bolígrafo?',opts:['9','5'],a:'9'},'es_mx'),/forma/);
  assert.throws(()=>locale.text('El computadora está aquí.','es_mx'),/concordancia/);
  assert.equal(locale.text('Estáis jugando. Coge la pelota.','es_ar'),'Están jugando. Toma la pelota.');
  assert.equal(locale.text('Os laváis las manos.','es_mx'),'Se lavan las manos.');
});

test('API account loading/saving uses one locale controller and resets between accounts',async()=>{
  const writes=[],events=[];
  let row={content_locale:'es_mx'};
  const client={auth:{signOut:async()=>{}},from(){let mutation;const q={select(){return q},update(v){mutation=v;writes.push(v);return q},eq(){return q},single:async()=>({data:row,error:null}),then(resolve){if(mutation)row={...row,...mutation};return Promise.resolve({data:row,error:null}).then(resolve)}};return q;}};
  const window={LocaleContent:locale,LH_CONFIG:{},supabase:{createClient:()=>client},dispatchEvent:e=>events.push(e.type)};
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/api.js'),'utf8'),{window,CustomEvent:class{constructor(type){this.type=type}}});
  const api=window.LearningAPI;api.user={id:'test'};
  await api.getAccount();assert.equal(api.effectiveLocale({locale:'es_ar'}),'es_mx');
  const rev=api.localeRevision;await api.loadContentLocale();assert.equal(api.localeRevision,rev);
  await api.saveContentLocale('es-CO');assert.equal(api.effectiveLocale(),'es_co');assert.equal(writes[0].content_locale,'es_co');
  await api.signOut();assert.equal(api.contentLocale,null);assert.equal(api.effectiveLocale(),'es_intl');
  assert.equal(events.length,3);
});

test('a late account locale read cannot undo a newer successful selection',async()=>{
  let release;
  const client={from(){const q={select(){return q},single:()=>new Promise(resolve=>release=resolve)};return q;}};
  const window={LocaleContent:locale,LH_CONFIG:{},supabase:{createClient:()=>client},dispatchEvent(){}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/api.js'),'utf8'),{window,CustomEvent:class{}});
  const api=window.LearningAPI;
  const loading=api.loadContentLocale();
  api.setContentLocale('es_mx');
  release({data:{content_locale:'es_es'},error:null});
  assert.equal(await loading,'es_mx');assert.equal(api.contentLocale,'es_mx');
});

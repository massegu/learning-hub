const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../js/content-policy');
const early = require('../js/early-content');
const model = require('../js/activity-model');
const profile = () => ({id:'child', age_band:'primary', progress:{ageRoute:'early'}});
const clone = value => JSON.parse(JSON.stringify(value));
const seed = () => { let n=42; return () => {n=(Math.imul(n,1664525)+1013904223)>>>0; return n/4294967296;}; };

test('age routing uses profile metadata, never the UI label or primary DB alias', () => {
  assert.equal(policy.forProfile(profile()), policy.early);
  for (const age_band of ['primary','middle','teen','junior']) assert.equal(policy.forProfile({age_band}), null);
  assert.equal(policy.forProfile({age_band:'primary',progress:{ageRoute:'junior'}}), null);
});

test('every 6-7 domain and level has distinct, printable activities across several constructs', () => {
  let count=0;
  for (const domain of policy.early.subjects) for (const level of [1,2,3]) {
    const items=early.pool(domain,level);
    assert.ok(items.length>=35, `${domain}: ${items.length}`);
    assert.ok(new Set(items.map(it=>it.ageProfile.mechanic)).size>=3, domain);
    const signatures=items.map(it=>JSON.stringify([it.q,it.stimulus,it.opts,it.tokens,it.memoryQuestion]));
    assert.equal(new Set(signatures).size,items.length);
    assert.equal(new Set(items.map(it=>it.id)).size,items.length);
    for (const it of items) {
      assert.equal(it.domain,domain); assert.equal(it.level,level);
      policy.validateEarly(it);
      const output=model.printable(it,profile());
      assert.ok(output.stimulus.length);
      assert.equal(output.question,it.memoryQuestion||it.q);
    }
    count+=items.length;
  }
  assert.ok(count>1000);
});

test('profile validation excludes adult families, abstract wording and unsupported mechanics', () => {
  const valid=early.pool('attention')[0];
  for (const context of ['airport','shoppingDiscount','administration','transportTimetable']) {
    const it=clone(valid);it.ageProfile.context=context;assert.throws(()=>policy.validateEarly(it));
  }
  for (const q of ['¿Qué criterio ayuda más?', '¿Qué estrategia usarías?', 'Mira el vuelo F15-P7.', 'La salida es a las 15:40.']) {
    assert.throws(()=>policy.validateEarly({...valid,q}));
  }
  for (const overrides of [{type:'ruleSwitch'}, {responseType:'dragComplex'}, {visual:'<svg></svg>'}, {ageProfile:{...valid.ageProfile,revision:0}}, {ageProfile:undefined}]) {
    assert.throws(()=>policy.validateEarly({...valid,...overrides}));
  }
});

test('reading and location questions preserve authored determiners for every noun', () => {
  for (const o of early.objects) {
    assert.match(o.name,/^(el|la) /); assert.match(o.some,/^(un|una) /); assert.match(o.place,/^(el|la) /);
    assert.equal(o.gender,o.name.startsWith('la ')?'f':'m');
  }
  for (const it of early.pool('division')) {
    if (it.q.startsWith('¿Cuánt')) {
      const o=early.objects.find(o=>it.q.includes(o.plural));
      assert.ok(o);
      assert.ok(it.q.startsWith(o.gender==='f'?'¿Cuántas ':'¿Cuántos '));
    }
    assert.ok(!it.stimulus.some(s=>s.text&&/Hay 1 \w+s\b/.test(s.text)));
  }
  for (const domain of ['reading','memory','applied']) {
    for (const it of early.pool(domain)) {
      const question=it.memoryQuestion||it.q;
      if (/¿Dónde (está|estaba)/.test(question)) assert.match(question,/¿Dónde (?:está|estaba) (?:el|la) /);
    }
  }
});

test('memory difficulty comes from bounded meaningful material, with no hidden adult context', () => {
  for (const level of [1,2,3]) {
    const objects=early.pool('memory',level).filter(it=>it.ageProfile.mechanic==='rememberObjects');
    for (const it of objects) {
      assert.equal(it.memoryContent.length,policy.early.memoryElements[level-1]);
      assert.deepEqual(it.stimulus[0].items,it.memoryContent.map(x=>x.detail));
      assert.ok(it.memoryContent.some(x=>x.detail===it.a));
      assert.ok(it.opts.filter(x=>x!==it.a).every(x=>!it.memoryContent.some(c=>c.detail===x)));
    }
  }
});

test('all authored text avoids uncontracted determiners and memory associations retain their answer evidence', () => {
  for (const domain of policy.early.subjects) for (const it of early.pool(domain)) {
    const printable=model.printable(it,profile());
    const text=JSON.stringify([printable.question,printable.stimulus,printable.tokens,printable.options]);
    assert.doesNotMatch(text,/\b(?:de|a) el\b/);
    if(it.ageProfile.mechanic==='rememberPair') {
      const name=it.memoryQuestion.match(/globo de (.+)\?/)[1];
      const row=printable.stimulus[0].rows.find(row=>row[0]===name);
      assert.equal(row[1],it.a);
      assert.ok(it.memoryContent.find(x=>x.person===name).detail.endsWith(it.a));
    }
  }
});

test('selection avoids visible repeats within a complete domain cycle and across level changes', () => {
  const p=profile(), random=seed();
  const selected=early.select(p,['attention'],40,1,random);
  const next=early.select(p,['attention'],10,2,random);
  assert.equal(new Set([...selected,...next].map(it=>it.id)).size,50);
  for(let i=2;i<selected.length;i++) assert.notEqual(selected[i].ageProfile.mechanic,selected[i-1].ageProfile.mechanic);
  const before=clone(p.progress._earlyDelivery);
  const restored=profile();restored.progress._earlyDelivery=before;
  assert.ok(!before.ids.includes(early.select(restored,['attention'],1,1,random)[0].id));
});

test('server envelopes and usage survive selection; incomplete responses never generate uncharged content', () => {
  const p=profile();
  const response={items:Array.from({length:20},(_,id)=>({id:`remote-${id}`,q:'adult'})),usage:{used:5,limit:10},other:'retained'};
  const result=early.adaptResponse(response,{kind:'worksheet',domains:['memory','reading'],questions:20,level:2},p);
  assert.equal(result.usage,response.usage);assert.equal(result.other,'retained');assert.equal(result.items.length,20);
  assert.equal(result.items[0].sourceItemId,'remote-0');
  assert.deepEqual([...new Set(result.items.map(it=>it.domain))],['memory','reading']);
  assert.throws(()=>early.adaptResponse({items:[]},{kind:'exercise',domain:'reading',count:1},p));
  assert.throws(()=>early.adaptResponse(response,{kind:'worksheet',domains:['english'],questions:20},p));
  assert.equal(early.adaptResponse(response,{}, {age_band:'teen'}), response);
});

test('all canonical activities fail closed when their required stimulus is removed', () => {
  for (const domain of policy.early.subjects) {
    for (const it of early.pool(domain)) {
      assert.throws(()=>model.printable({...it,stimulus:[]},profile()));
      assert.throws(()=>model.printable({...it,stimulus:[{type:'image',src:'missing.png'}]},profile()));
    }
  }
});

test('legacy memory, tables and reading stimuli survive normalization together', () => {
  const it={type:'memoryReveal',memoryContent:[{person:'Sol',detail:'amarillo'}],scenario:'Mira los colores.',model:'amarillo',rows:[['Sol','amarillo']],text:'Sol tiene el globo amarillo.',memoryQuestion:'¿Qué color tenía Sol?',opts:['amarillo','rojo'],a:'amarillo'};
  const out=model.printable(it,{age_band:'teen'});
  assert.equal(out.stimulus.length,5);
  assert.ok(JSON.stringify(out.stimulus).includes('Sol: amarillo'));
  assert.deepEqual(out.stimulus.find(x=>x.type==='table').rows,[['Fila 1','Sol','amarillo']]);
});

test('legacy questions cannot conceal missing or unrenderable dependencies', () => {
  const q={q:'¿Qué correspondía a Sol?',opts:['azul','verde'],a:'azul'};
  assert.throws(()=>model.printable(q));
  for(const it of [{...q,type:'memoryReveal',memoryContent:[]},{...q,type:'sceneAttention',image:'scene.png'}, {...q,visual:'<svg>...</svg>'}, {...q,stimulus:[{type:'table',rows:[['Sol'] , []]}]}, {...q,stimulus:[{type:'text',text:''}]}]) assert.throws(()=>model.printable(it));
  assert.throws(()=>model.printable({...q,type:'memoryReveal',requiresStimulus:false}));
  assert.doesNotThrow(()=>model.printable({q:'¿Cuántos lados tiene un triángulo?',opts:['3','4'],a:'3',requiresStimulus:false}));
});

test('spatial grid stimuli preserve their dimensions or are rejected', () => {
  const grid={type:'visualSearch',grid:['○','□','△','☆'],q:'¿Qué hay en la primera fila?',opts:['○ y □','△ y ☆'],a:'○ y □'};
  assert.throws(()=>model.printable(grid));
  assert.deepEqual(model.printable({...grid,gridColumns:2}).stimulus,[{type:'table',rows:[['○','□'],['△','☆']]}]);
  assert.throws(()=>model.printable({...grid,gridColumns:3}));
});

test('invalid responses and incomplete order tasks are rejected before export', () => {
  const it=early.pool('reading')[0];
  assert.throws(()=>model.printable({...it,a:'missing'},profile()));
  assert.throws(()=>model.printable({...it,opts:[it.a,it.a]},profile()));
  const ordered=early.pool('executive').find(it=>it.type==='order');
  assert.throws(()=>model.printable({...ordered,tokens:[]},profile()));
  assert.throws(()=>model.printable({...ordered,answer:['Invented step']},profile()));
  assert.throws(()=>model.validateBatch([[it],[{...it,stimulus:[]}]],profile()));
});

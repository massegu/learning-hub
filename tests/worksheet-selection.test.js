const test=require('node:test'),assert=require('node:assert/strict');
const selector=require('../js/worksheet-selection'),early=require('../js/early-content'),locale=require('../js/locale-content');
const child=()=>({age_band:'primary',progress:{ageRoute:'early'}});
const remote=n=>({id:'remote-'+n,domain:'attention',requiresStimulus:true,q:'Mira la tarjeta. ¿Qué número aparece?',stimulus:[{type:'text',text:String(n)}],opts:[String(n),String(n+1)],a:String(n)});
const invalid=()=>({...remote(91),stimulus:[]});

test('worksheet candidates are replaced before commitment and remote IDs do not defeat semantic uniqueness',async()=>{
  let calls=0;
  const result=await selector.collect({initial:{items:[invalid(),remote(1),{...remote(1),id:'changed-id'}]},profile:{age_band:'teen'},country:'es_mx',domains:['attention'],count:3,
    fetchMore:async()=>{calls++;return {items:[remote(1),remote(2),remote(3)]};}});
  assert.equal(calls,1);assert.equal(result.items.length,3);assert.equal(result.rejected,1);assert.equal(result.duplicates,2);
  assert.ok(result.items.every(it=>it.localization.locale==='es_mx'));
});
test('empty, cyclic and incompatible candidate pools stop clearly, with a finite request budget',async()=>{
  for(const items of [[],[invalid()],[remote(1),{...remote(1),id:'another'}]]){
    let calls=0;
    await assert.rejects(selector.collect({initial:{items},profile:{age_band:'teen'},country:'es_es',domains:['attention'],count:3,
      fetchMore:async()=>{calls++;return {items};}}),/suficientes actividades imprimibles distintas/);
    assert.equal(calls,3);
  }
  let calls=0;
  await assert.rejects(selector.collect({initial:{items:[],exhausted:true},profile:{age_band:'teen'},country:'es_es',domains:['attention'],count:2,fetchMore:async()=>{calls++;}}),/suficientes/);
  assert.equal(calls,0);
});
test('authorization, quota and transport failures are never swallowed by replacement',async()=>{
  for(const error of ['Daily content limit reached','Trial expired','Network unavailable']){
    let calls=0;
    await assert.rejects(selector.collect({initial:{items:[invalid()]},profile:{age_band:'teen'},country:'es_es',domains:['attention'],count:2,
      fetchMore:async()=>{calls++;throw new Error(error);}}),new RegExp(error));
    assert.equal(calls,1);
  }
});
test('replacement keeps going while genuinely new compatible activities are arriving',async()=>{
  let calls=0;
  const result=await selector.collect({initial:{items:[remote(1)]},profile:{age_band:'teen'},country:'es_es',domains:['attention'],count:7,
    fetchMore:async()=>{calls++;return {items:[invalid(),remote(calls+1)]};}});
  assert.equal(calls,6);assert.equal(result.items.length,7);assert.equal(result.replacementBatches,6);
});
test('shuffled real server worksheet domains retain their identity and English protection',async()=>{
  const english={id:'english',sourceDomain:'english',requiresStimulus:true,scenario:'The computer is on the table.',q:'Choose the correct word.',opts:['computer','pencil'],a:'computer'};
  const spanish={...remote(5),domain:undefined,sourceDomain:'attention'};
  const result=await selector.collect({initial:{items:[english,spanish]},profile:{age_band:'primary'},country:'es_mx',domains:['attention','english'],count:2});
  assert.equal(result.items[0].localization.domain,'english');
  assert.equal(result.items[0].scenario,english.scenario);
  assert.equal(result.items[1].localization.domain,'attention');
  assert.equal(selector.compatible({...english,domain:'attention'},{age_band:'primary'},'es_mx','attention'),false);
});
test('early printable filtering precedes history commitment, redistributes empty domains and handles cycle exhaustion',()=>{
  for(const country of Object.keys(locale.labels)){
    const profile=child(),accept=(it,domain)=>domain!=='memory' && selector.compatible(it,profile,country,domain);
    const first=early.select(profile,['memory','division'],20,1,()=>.2,accept);
    const second=early.select(profile,['memory','division'],20,1,()=>.2,accept);
    for(const items of [first,second]){
      assert.equal(new Set(items.map(it=>it.semanticKey)).size,20);
      assert.ok(items.every(it=>it.domain==='division' && selector.compatible(it,profile,country,it.domain)));
    }
    const previous=structuredClone(profile.progress);
    assert.throws(()=>early.select(profile,['division'],20,1,()=>.2,it=>it.ageProfile.family==='division-0'),/suficientes actividades imprimibles/);
    assert.deepEqual(profile.progress,previous);
  }
});
test('bad age, source-domain and regional currency candidates are rejected without relaxing gates',async()=>{
  const adult=remote(1),good=early.pool('attention')[0],other=early.pool('memory')[0];
  const result=await selector.collect({initial:{items:[adult,{...good,a:'incorrecta'},other,good]},profile:child(),country:'es_co',domains:['attention'],count:1});
  assert.equal(result.rejected,3);assert.equal(result.items[0].id,good.id);
  const euro={...remote(2),q:'Cuesta 2 euros. ¿Cuánto cuesta?',a:'2 euros',opts:['2 euros','3 euros']};
  assert.equal(selector.compatible(euro,{age_band:'teen'},'es_mx','attention'),false);
});
test('explicit age metadata cannot cross school routes during replacement',async()=>{
 const wrong={...remote(1),schoolProfile:{route:'teen',level:1}},good={...remote(2),schoolProfile:{route:'primary',level:1}};
 const result=await selector.collect({initial:{items:[wrong,good]},profile:{age_band:'primary'},country:'es_co',domains:['attention'],count:1});
 assert.equal(result.rejected,1);assert.equal(result.items[0].id,good.id);
});
test('strict model comparison preserves every source value and never guesses incomplete prose',()=>{
 const model=require('../js/activity-model');const source='MODELO: E14-O6  A: E14-O6  B: E14O6  C: E14-O8  D: F14-O6';
 const blocks=model.comparisonStimulus(source);assert.equal(blocks[0].text,'Modelo: E14-O6');assert.equal(blocks[1].rows.length,4);
 const html=model.interactiveStimulus(blocks,{structured:true});assert.match(html,/attention-model/);assert.match(html,/scope="row"/);
 assert.equal(model.comparisonStimulus('MODELO: E14-O6 A: E14-O6 B: E14O6'),null);
 assert.equal(model.comparisonStimulus(source+' Falta algo.'),null);
 const early=require('../js/early-content');for(const level of [1,2,3])for(const it of early.pool('attention',level))assert.doesNotMatch(JSON.stringify(it),/E14-O6/);
});
test('broken printable pictograms are rejected before commitment while glyph-only counting stays printable',()=>{
 const art=require('../js/stimulus-art'),bank=early.pool('division',1),profile=child();
 const pictured=bank.find(it=>it.stimulus.some(b=>(b.type==='list'?b.items:b.type==='table'?b.rows.flat():[]).some(v=>art.forLabel(v)&&!/^[●○□△☆]$/.test(v))));
 const counted=bank.find(it=>it.stimulus.some(b=>b.presentation==='count'&&b.items.every(v=>v==='●')));
 assert.ok(pictured);assert.ok(counted);const original=art.png;
 try{art.png=()=>new Uint8Array([1]);assert.equal(selector.compatible(pictured,profile,'es_es','division'),false);assert.equal(selector.compatible(counted,profile,'es_es','division'),true);}
 finally{art.png=original;}
 assert.equal(selector.compatible(pictured,profile,'es_es','division'),true);
});

test('four labelled attention codes render as structured data without changing the target or accepting partial prose',()=>{
 const model=require('../js/activity-model');
 for(const values of [['P25-P3','P25-P3','P25-P4','P25-P3'],['⭐','⭐','🌙','⭐']]){
  const source=values.map((v,i)=>`${'ABCD'[i]}: ${v}`).join(' '),blocks=model.comparisonStimulus(source);
  assert.deepEqual(blocks[0].rows,values.map((v,i)=>['ABCD'[i],v]));
  const it={type:'standard',requiresStimulus:true,scenario:source,q:'¿Cuál es diferente?',a:'C',opts:['A','B','C','D']};
  assert.deepEqual(model.printable(it,{age_band:'teen'}).stimulus,blocks);
  assert.match(model.interactiveStimulus(blocks,{structured:true}),/attention-comparison/);
 }
 for(const source of ['A: P1 B: P1 C: P2','A: P1 B: P1 C: P2 D: P1 después revisa','Hay A: P1 B: P1 C: P2 D: P1'])assert.equal(model.comparisonStimulus(source),null);
});

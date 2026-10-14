const test=require('node:test'),assert=require('node:assert/strict');
const early=require('../js/early-content'),model=require('../js/activity-model'),locale=require('../js/locale-content'),stages=require('../js/age-stages'),school=require('../js/school-journey'),art=require('../js/stimulus-art');
const profile=route=>({age_band:route==='middle'?'middle':'primary',progress:{ageRoute:route}});
test('early Language subdomains select real grammar, spelling and phrase tasks with shared printable integrity',()=>{
  for(const mode of ['grammar','spelling','writing'])for(const level of [1,2,3]){
    const p=profile('early');
    const result=early.adaptResponse({items:[{id:'authorized'}]},{kind:'exercise',domain:'language',subdomain:mode,count:1,level},p);
    assert.equal(result.items[0].languageFocus,mode);
    for(const it of early.pool('language',level,mode))for(const country of Object.keys(locale.labels)){
      const adapted=locale.localizeItem(it,country,'language');
      assert.doesNotThrow(()=>model.forDelivery(adapted,p,'language'));
    }
  }
  const p=profile('early'),items=early.select(p,['language'],20,2);
  assert.ok(items.some(it=>it.languageFocus==='spelling'));
  assert.equal(new Set(items.map(it=>it.semanticKey)).size,20);
});
test('spelling answers bind the displayed pattern or syllables and corrupt evidence fails closed',()=>{
  for(const it of early.pool('language',3,'spelling')){
    assert.throws(()=>model.forDelivery({...it,a:it.opts.find(x=>x!==it.a)},profile('early')));
    assert.throws(()=>model.forDelivery({...it,languageEvidence:undefined},profile('early')));
  }
  assert.ok(early.pool('language',1,'spelling').some(it=>it.languageEvidence.segments?.length===2));
  assert.ok(early.pool('language',3,'spelling').some(it=>it.languageEvidence.segments?.length===4));
});
test('missing noun icons from manual review have local printable equivalents and people require a factual caption',()=>{
  for(const label of ['la flor','el zapato','un dibujo','gato','perro','conejo','pájaro','pez']){
    const key=art.forLabel(label);assert.ok(key,label);assert.ok(art.svg(key).includes('viewBox'));assert.deepEqual([...art.png(key).slice(0,8)],[137,80,78,71,13,10,26,10]);
  }
  assert.equal(art.forLabel('Ana'),null);assert.equal(art.forLabel('Ana',{subject:'Personas'}),'person');
});
test('older calibration requires a full fresh evidence window and has distinct thresholds by age',()=>{
  for(const route of ['junior','primary','middle']){
    const p=profile(route),rule=stages.forProfile(p),good=Array(rule.minimumAttempts).fill({correct:true});
    assert.equal(stages.next(1,good.slice(1),p),1);
    assert.equal(stages.next(1,good,p),2);
    assert.equal(stages.next(2,good.slice(1),p),2);
    assert.equal(stages.next(2,good.map(()=>({correct:false})),p),1);
    assert.equal(stages.next(3,good,p),3);
    assert.equal(stages.next(1,good.map(()=>({correct:false})),p),1);
  }
  assert.equal(stages.forProfile(profile('early')),null);
  assert.equal(stages.forProfile(profile('junior')).minimumAttempts,8);
  assert.equal(stages.forProfile(profile('primary')).minimumAttempts,10);
  assert.equal(stages.forProfile(profile('middle')).minimumAttempts,12);
});
test('older content audit reports measured load and missing level evidence instead of claiming the remote bank is calibrated',()=>{
  const item={q:'Recuerda.',stimulus:[{type:'text',text:Array(110).fill('palabra').join(' ')}],memoryContent:Array(6).fill({detail:'dato'}),tokens:Array(5).fill('paso'),opts:['a','b','c','d']};
  const report=stages.audit(item,profile('junior'),1);
  for(const issue of ['reading-load','recall-load','step-load','option-load','unverified-content-level'])assert.ok(report.issues.includes(issue));
  assert.ok(!stages.audit({...item,level:3},profile('middle'),3).issues.includes('reading-load'));
  assert.ok(stages.audit({...item,level:2},profile('middle'),3).issues.includes('content-level-mismatch'));
});
test('school journeys are restricted to 8–12, have distinct themes and reviewed plans that cannot be injected through progress',()=>{
  assert.equal(school.forProfile(profile('junior')).theme,'workshop');
  assert.equal(school.forProfile(profile('primary')).theme,'base');
  for(const route of ['early','middle','teen'])assert.equal(school.forProfile(profile(route)),null);
  let saved=school.start({},'build');saved=school.record(saved,'division','1');
  assert.equal(school.normalize(JSON.parse(JSON.stringify(saved))).active.index,1);
  assert.deepEqual(school.record(saved,'division','1'),saved);
  saved=school.record(saved,'executive','2');saved=school.record(saved,'applied','3');assert.equal(saved.completed.length,1);
  assert.equal(school.normalize({active:{id:'unknown',index:1}}).active,null);
});

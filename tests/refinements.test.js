const test=require('node:test');
const assert=require('node:assert/strict');
const early=require('../js/early-content');
const policy=require('../js/content-policy');
const model=require('../js/activity-model');
const art=require('../js/stimulus-art');
const locale=require('../js/locale-content');
const child=()=>({age_band:'primary',progress:{ageRoute:'early'}});
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}

test('case, whitespace and determiner-only duplicate choices cannot reach a 6–7 screen or worksheet',()=>{
  const base=early.pool('applied')[0];
  for(const opts of [['botella','Botella'],['la botella','Botella'],['la botella',' La   botella. ']]) {
    assert.throws(()=>model.forDelivery({...base,opts,a:opts[0]},child()),/duplicadas/);
    assert.throws(()=>model.validateBatch([[{...base,opts,a:opts[0]}]],child()),/duplicadas/);
  }
  // Capitalization itself remains a legitimate older spelling exercise.
  assert.doesNotThrow(()=>model.printable({requiresStimulus:false,q:'Elige la mayúscula.',opts:['ana','Ana'],a:'Ana'},{age_band:'teen'}));
});

test('count answers are derived from the displayed units and every corruption is rejected',()=>{
  for(const domain of ['division','attention'])for(const level of [1,2,3])for(const it of early.pool(domain,level).filter(it=>it.quantityEvidence?.op==='count')){
    const block=it.stimulus[it.quantityEvidence.blocks[0]];
    const total=it.quantityEvidence.target?block.items.filter(x=>x===it.quantityEvidence.target).length:block.items.length;
    assert.equal(Number(it.a),total);
    assert.throws(()=>model.forDelivery({...it,a:String(total+1)},child()),/respuesta/);
    const broken=structuredClone(it);broken.stimulus[0].items.push(it.quantityEvidence.target||block.items[0]);
    assert.throws(()=>model.forDelivery(broken,child()));
    assert.throws(()=>model.forDelivery({...it,quantityEvidence:undefined},child()),/conteo/);
    const numbered=structuredClone(it);numbered.stimulus[0].presentation='sequence';
    assert.throws(()=>model.forDelivery(numbered,child()),/numeración/);
  }
});

test('arithmetic, model matching and two-condition choices reject wrong or ambiguous evidence',()=>{
  for(const domain of ['division','attention','applied'])for(const it of early.pool(domain,3).filter(it=>it.quantityEvidence||it.matchEvidence||it.tableRule)) {
    const wrong=it.opts.find(x=>x!==it.a);
    assert.throws(()=>model.forDelivery({...it,a:wrong},child()));
    if(it.quantityEvidence)assert.throws(()=>model.forDelivery({...it,quantityEvidence:undefined},child()),/conteo/);
    if(it.tableRule){
      const duplicate=structuredClone(it);const table=duplicate.stimulus[it.tableRule.block];
      table.rows[1]=[table.rows[1][0],table.rows[0][1]];
      if(table.rows[0][0]===it.a || table.rows[1][0]===it.a)assert.throws(()=>model.forDelivery(duplicate,child()));
    }
  }
  const reference=early.pool('attention',3).find(it=>it.lookupEvidence);
  const ambiguous=structuredClone(reference);ambiguous.stimulus[0].rows[1][0]=ambiguous.stimulus[0].rows[0][0];
  assert.throws(()=>model.forDelivery(ambiguous,child()),/única/);
});

test('levels increase counting, attention load, recall load and planning steps without exceeding the early contract',()=>{
  const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
  const dotLoads=[1,2,3].map(l=>mean(early.pool('division',l).filter(it=>it.ageProfile.family==='division-0').map(it=>it.stimulus[0].items.length)));
  assert.ok(dotLoads[0]<dotLoads[1]&&dotLoads[1]<dotLoads[2]);
  const attention=[1,2,3].map(l=>new Set(early.pool('attention',l).filter(it=>it.ageProfile.mechanic==='search').map(it=>it.stimulus[0].items.length)));
  assert.deepEqual(attention.map(x=>[...x]),[[3],[5],[6]]);
  for(const l of [1,2,3]){
    assert.ok(early.pool('executive',l).filter(it=>it.type==='order').every(it=>it.answer.length===(l===1?2:3)));
    assert.ok(early.pool('memory',l).filter(it=>['rememberPair','rememberOrder'].includes(it.ageProfile.mechanic)).every(it=>it.memoryContent.length===l+1));
    assert.ok(early.pool('memory',l).every(it=>it.revealMs>=6500 && it.memoryContent.length<=policy.early.memoryElements[l-1]));
  }
  assert.ok(early.pool('applied',1).every(it=>!it.tableRule));
  assert.ok(early.pool('applied',3).some(it=>it.tableRule?.criteria.length===2));
});

test('consecutive restored sessions rotate families and never count arithmetic noun swaps as new problems',()=>{
  for(const domain of policy.early.subjects){
    let profile=child();const rng=random(73),runs=[];
    for(let session=0;session<5;session++){
      const batch=early.select(profile,[domain],8,2,rng);
      assert.equal(new Set(batch.map(it=>it.semanticKey)).size,8);
      runs.push(...batch);profile=structuredClone(profile);
    }
    const first20=runs.slice(0,20);
    assert.equal(new Set(first20.map(it=>it.semanticKey)).size,20,domain);
    assert.ok(new Set(first20.map(it=>it.ageProfile.family)).size>=4,domain);
    assert.ok(first20.every((it,i)=>!i||it.ageProfile.family!==first20[i-1].ageProfile.family),domain);
  }
  const bank=early.pool('division',2).filter(it=>it.ageProfile.family==='division-1');
  const groups=new Map();for(const it of bank){const sig=JSON.stringify(it.quantityEvidence.blocks.map(i=>it.stimulus[i].items.length));if(!groups.has(sig))groups.set(sig,new Set());groups.get(sig).add(it.semanticKey);}
  assert.ok([...groups.values()].every(keys=>keys.size===1));
  assert.ok(early.pool('division',2).every(it=>!JSON.stringify(it.stimulus).includes('oso de peluche')));
});

test('illustrations preserve words and countable glyphs appear exactly once without list markers',()=>{
  const dots=early.pool('division')[0],html=model.interactiveStimulus(dots.stimulus,{illustrated:true});
  assert.equal((html.match(/<svg /g)||[]).length,Number(dots.a));
  assert.equal((html.match(/<circle /g)||[]).length,Number(dots.a));
  assert.ok(!html.includes('<ul>')&&!html.includes('<li>'));
  assert.ok(html.includes('stimulus-only-text'));
  for(const key of art.keys){assert.ok(art.svg(key).includes('viewBox="0 0 64 64"'));const png=art.png(key);assert.deepEqual([...png.slice(0,8)],[137,80,78,71,13,10,26,10]);}
  assert.equal(art.forLabel('el carro de juguete'),'car');
  assert.equal(art.forLabel('plátano'),null);
  assert.equal(art.forLabel('banano',{banana:true}),'banana');
  assert.equal(art.forLabel('llena · abierta',{subject:'Botellas'}),'bottle-full-open');
});

test('all new families retain stimulus, response and proof consistency in every country',()=>{
  for(const key of Object.keys(locale.labels))for(const d of ['division','attention','executive','memory','applied'])for(const l of [1,2,3])for(const it of early.pool(d,l)) {
    const adapted=locale.localizeItem(it,key,d);
    assert.doesNotThrow(()=>model.forDelivery(adapted,child(),d));
    assert.equal(new Set(adapted.opts?.map(model.choiceKey)||[]).size,adapted.opts?.length||0);
  }
});

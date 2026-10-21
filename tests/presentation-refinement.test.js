const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const curriculum=require('../js/curriculum'),model=require('../js/activity-model'),art=require('../js/stimulus-art'),docs=require('../js/document-library');
test('map recall has its own graduated visit load without reducing icon sequences or categories',()=>{
 const ages=['early','junior','primary','middle','teen'];assert.equal(curriculum.memoryCategories.length,15);
 for(const age of ages)for(const level of [1,2,3]){
  const bank=curriculum.pool(age,'memory',level),routes=bank.filter(x=>x.mechanic==='memory_route');assert.equal(routes.length,36);
  const visits=(['middle','teen'].includes(age)?[3,4,6]:[3,4,5])[level-1];
  for(const it of routes){
   assert.equal(it.stimulus[0].items.length,visits);assert.equal(it.tokens.length,visits);assert.equal(it.memoryContent.length,visits);
   assert.equal(it.stimulus[0].positions.length,visits);assert.equal(new Set(it.stimulus[0].positions).size,visits);
   assert.deepEqual(it.answer,it.recallEvidence.reverse?[...it.stimulus[0].items].reverse():it.stimulus[0].items);
   assert.ok(it.revealMs>=visits*2500);assert.doesNotThrow(()=>model.printable(it,{age_band:age,progress:{ageRoute:age}}));
  }
  if(level===1)assert.equal(bank.find(x=>x.mechanic==='memory_sequence').recallSequence.length,5);
 }
 assert.equal(fs.readFileSync('js/curriculum.js','utf8'),fs.readFileSync('supabase/functions/request-learning-content/curriculum.js','utf8'));
});
test('commercial document artwork keeps reference, dates, currency and amounts without a repeated issuer subtitle',()=>{
 for(const [id,fields] of Object.entries({'invoice-co-v1':['F-1048','14/10/2026','20/10/2026','25.000'],'receipt-co-v1':['R-0312','15/10/2026','10:35','19.000','20.000','1.000'],'catalogue-co-v1':['31/10/2026','7.000','8.500']})){
  const doc=docs.get(id),svg=fs.readFileSync(doc.path.replace('.png','.svg'),'utf8'),text=[...svg.matchAll(/<text\b[^>]*>(.*?)<\/text>/g)].map(x=>x[1]).join(' ');
  assert.equal(text.split(doc.kind.toUpperCase()).length-1,1);
  assert.ok(text.includes('pesos colombianos (COP)'));for(const value of fields)assert.ok(text.includes(value),id+': '+value);
  assert.ok(text.includes(doc.title));
  assert.ok(!text.includes('Tienda Barrio Verde · RECIBO DE COMPRA'));
 }
});
test('reviewed Fluent SVGs remain local, licensed, identifiable and printable',()=>{
 const source=JSON.parse(fs.readFileSync('assets/icons/fluent-emoji-flat.json','utf8'));assert.equal(source.license,'MIT');assert.equal(Object.keys(source.icons).length,41);
 for(const key of Object.keys(source.icons)){
  assert.ok(art.keys.includes(key));const svg=art.svg(key);assert.match(svg,/data-art-set="fluent-emoji-flat"/);
  assert.doesNotMatch(svg,/<script|<image|href=|onload=/i);assert.deepEqual([...art.png(key).slice(0,8)],[137,80,78,71,13,10,26,10]);
 }
 for(const [label,key] of [['gato','cat'],['zanahoria','carrot'],['tulipán','tulip'],['tortuga','turtle'],['pulpo','octopus']])assert.equal(art.forLabel(label),key);
 assert.doesNotMatch(art.svg('balloon-red'),/fluent-emoji-flat/);assert.doesNotMatch(art.svg('dot'),/fluent-emoji-flat/);
});

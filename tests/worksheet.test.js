const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const docx = require('docx');
const JSZip = require('jszip');
const policy = require('../js/content-policy');
const early = require('../js/early-content');
const model = require('../js/activity-model');
const locale = require('../js/locale-content');
const child = {id:'child',name:'Sol',age_band:'primary',progress:{ageRoute:'early'}};
function harness() {
  // JSZip uses FileReader for browser Blobs. Node has Blob but no FileReader;
  // normalize that boundary while retaining the real ZIP implementation.
  class NodeZip extends JSZip {
    file(name,data,...rest) {
      return super.file(name,data instanceof Blob ? data.arrayBuffer().then(b=>new Uint8Array(b)) : data,...rest);
    }
  }
  const blobs=new Map(), downloads=[];
  const document={body:{appendChild(){}},createElement:()=>({remove(){},click(){downloads.push({name:this.download,blob:blobs.get(this.href)});}})};
  const context={window:{docx,JSZip:NodeZip,ContentPolicy:policy,ActivityModel:model,LocaleContent:locale},document,URL:{createObjectURL:b=>{const id=String(blobs.size);blobs.set(id,b);return id;},revokeObjectURL(){}},setTimeout(){},Date,console};
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/docx.js'),'utf8'),context);
  return {generator:context.window.WorksheetGenerator,downloads,context};
}
async function xml(blob) {
  const zip=await JSZip.loadAsync(await blob.arrayBuffer());
  return zip.file('word/document.xml').async('string');
}
function textNodes(xml) {
  return [...xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m=>m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'"));
}
function assertAnswerable(nodes, items, profile) {
  for (let i=0;i<items.length;i++) {
    const begin=nodes.indexOf(`ACTIVIDAD ${i+1}`), end=i+1<items.length?nodes.indexOf(`ACTIVIDAD ${i+2}`):nodes.length;
    const block=nodes.slice(begin,end);
    const projection=model.printable(locale.localizeItem(items[i],locale.effective(profile)),profile);
    const q=block.indexOf(projection.question);
    assert.ok(q>0,'question must follow stimulus');
    for(const stimulus of projection.stimulus) {
      const values=stimulus.type==='text'?[stimulus.text]:stimulus.type==='list'?stimulus.items:stimulus.rows.flat();
      for(const value of values) assert.ok(block.slice(0,q).some(s=>s===value||/^\d+\. /.test(s)&&s.endsWith(value)),`missing stimulus: ${value}`);
    }
    for(const option of projection.options) assert.ok(block.some(s=>s.endsWith(`. ${option}`)),`missing option: ${option}`);
    for(const token of projection.tokens) assert.ok(block.some(s=>/^\d+\. /.test(s)&&s.endsWith(token)),`missing order token: ${token}`);
  }
}

test('real DOCX export includes every 6-7 stimulus before its question and all response choices', async () => {
  const {generator,downloads}=harness();
  const items=policy.early.subjects.flatMap(domain=>{
    const bank=early.pool(domain,2), mechanics=[...new Set(bank.map(it=>it.ageProfile.mechanic))];
    return mechanics.map(mechanic=>bank.find(it=>it.ageProfile.mechanic===mechanic));
  });
  await generator.generate([items],child);
  assert.equal(downloads.length,1);assert.match(downloads[0].name,/LearningLab_6-7_.*_ficha_01\.docx$/);
  const document=await xml(downloads[0].blob);
  assertAnswerable(textNodes(document),items,child);
  assert.ok(document.includes('<w:tbl>'), 'tables must remain tables');
  assert.ok(document.includes('w:val="28"'), '6-7 needs larger readable text');
});

test('legacy memory associations and reading passages remain answerable in real DOCX XML', async () => {
  const {generator,downloads}=harness();
  const items=[
    {type:'memoryReveal',memoryContent:[{person:'Mar',detail:'azul'},{person:'Sol',detail:'verde'}],memoryQuestion:'¿Qué color tenía Mar?',opts:['azul','verde'],a:'azul'},
    {type:'standard',title:'La cesta',text:'La cesta está en la cocina.',q:'¿Dónde está la cesta?',opts:['cocina','patio'],a:'cocina'},
    {type:'standard',model:'círculo · estrella',rows:[['círculo','estrella'],['estrella','círculo']],q:'¿Qué fila es igual?',opts:['1','2'],a:'1'},
  ];
  const profile={name:'Older',age_band:'teen'};
  await generator.generate([items],profile);
  assertAnswerable(textNodes(await xml(downloads[0].blob)),items,profile);
});

test('direct local and remote DOCX exports inherit all seven account locales despite a stale profile locale', async () => {
  for(const key of ['es_es','es_mx','es_co','es_ar','es_cl','es_pa','es_cr'])for(const band of ['early','teen']) {
    const {generator,downloads,context}=harness();
    context.window.LearningAPI={contentLocale:key};
    const profile={...child,locale:'es_es',...(band==='teen'?{age_band:'teen',progress:{}}:{})};
    const items=band==='early'?policy.early.subjects.flatMap(domain=>{
      const bank=early.pool(domain);
      return [...new Set(bank.map(it=>it.ageProfile.family))].map(f=>bank.find(it=>it.ageProfile.family===f));
    }):require('./locale-fixtures')();
    await generator.generate([items],profile);
    const nodes=textNodes(await xml(downloads[0].blob));
    assertAnswerable(nodes,items,{...profile,contentLocale:key});
    if(key!=='es_es')assert.ok(!/\b(?:coge|grifo|bañador|ordenador|zumo|estáis)\b/iu.test(nodes.join(' ')),key);
  }
});

test('exporter rejects a missing locale gate or a batch from a different country before downloading',async()=>{
  const {generator,downloads,context}=harness();
  const item=locale.localizeItem(early.pool('reading')[0],'es_mx');
  await assert.rejects(generator.generate([[item]],{...child,contentLocale:'es_ar'}),/otra variante/);
  delete context.window.LocaleContent;
  await assert.rejects(generator.generate([[early.pool('reading')[0]]],child),/adaptador regional/);
  assert.equal(downloads.length,0);
});

test('foreign-currency lessons preserve amounts and explicit context through real DOCX projection',async()=>{
  const {generator,downloads}=harness();
  const raw={domain:'applied',currencyContext:'foreign',scenario:'En un viaje a España, el pan cuesta 2 euros.',q:'¿Cuánto cuesta el pan?',opts:['2 euros','3 euros'],a:'2 euros'};
  const profile={name:'Viaje',age_band:'teen',locale:'es_mx'};
  await generator.generate([[raw]],profile);
  const nodes=textNodes(await xml(downloads[0].blob));
  assertAnswerable(nodes,[raw],profile);
  assert.ok(nodes.some(s=>s.includes('2 euros')));
});

test('ZIP versions contain complete documents with distinct names and complete stimuli', async () => {
  const {generator,downloads}=harness();
  const p=structuredClone(child);
  const versions=[early.select(p,['reading','memory','executive'],12,1),early.select(p,['attention','applied'],12,2)];
  await generator.generate(versions,p);
  assert.equal(downloads.length,1);assert.match(downloads[0].name,/_fichas.zip$/);
  const zip=await JSZip.loadAsync(await downloads[0].blob.arrayBuffer());
  const names=Object.keys(zip.files);assert.equal(names.length,2);
  assert.match(names[0],/_ficha_01.docx$/);assert.match(names[1],/_ficha_02.docx$/);
  for(let i=0;i<2;i++) {
    const nested=await JSZip.loadAsync(await zip.file(names[i]).async('uint8array'));
    assertAnswerable(textNodes(await nested.file('word/document.xml').async('string')),versions[i],p);
  }
});

test('an invalid later version prevents every download and never fabricates a memory stimulus', async () => {
  const {generator,downloads}=harness();
  const invalid={type:'memoryReveal',memoryContent:[],memoryQuestion:'¿Qué había en la mochila?',opts:['el libro','la pelota'],a:'el libro'};
  await assert.rejects(generator.generate([[early.pool('reading')[0]],[invalid]],child));
  assert.equal(downloads.length,0);assert.deepEqual(invalid.memoryContent,[]);
});

test('old renderer upgrades cannot replace the canonical integrity renderer', () => {
  const {generator,context}=harness();
  context.window.addEventListener=()=>{};
  for (const file of ['v16_3.js','v16_4.js']) {
    let source=fs.readFileSync(require.resolve(`../js/${file}`),'utf8');
    const functionName=file==='v16_3.js'?'worksheetGeneratorV163':'installWorksheetGenerator';
    source=source.replace(/\}\)\(\);\s*$/,`window.tryLegacy=${functionName};})();`);
    vm.runInNewContext(source,context);
    context.window.tryLegacy();
    assert.equal(context.window.WorksheetGenerator,generator);
  }
  assert.ok(!fs.readFileSync(require.resolve('../js/config.js'),'utf8').includes('v16_17.js'));
});

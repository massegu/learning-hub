const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const curriculum=require('../js/curriculum'),early=require('../js/early-content'),art=require('../js/stimulus-art'),model=require('../js/activity-model'),locale=require('../js/locale-content'),documents=require('../js/document-library'),load=require('./edge-harness');
const ages=['early','junior','primary','middle','teen'],profile=age=>({age_band:['early','junior'].includes(age)?'primary':age,progress:{ageRoute:age}});
test('object memory has complete SVG/PNG references in every country, explicit empty cells and no undefined visuals',()=>{
 for(const age of ages)for(const country of Object.keys(locale.labels))for(const family of ['memory_sequence','memory_spatial','memory_association','memory_recognition']){
  const tasks=curriculum.pool(age,'memory',3).filter(it=>it.mechanic===family);
  for(const it of tasks){const local=locale.localizeItem(it,country,'memory');
   for(const {detail} of local.memoryContent){const key=art.forLabel(detail,local.lexicalSenses);assert.ok(key,age+'/'+country+'/'+detail);assert.match(art.svg(key),/<svg/);assert.deepEqual([...art.png(key).slice(0,8)],[137,80,78,71,13,10,26,10]);}
   const markup=model.interactiveStimulus(local.stimulus,{structured:true});assert.doesNotMatch(markup,/undefined|null/);assert.match(markup,/<svg/);
   if(family==='memory_spatial'&&local.stimulus[0].rows.flat().includes('—'))assert.match(markup,/empty-memory-cell.*?Vacío/);
  }
 }
 assert.match(model.interactiveStimulus([{type:'list',presentation:'cards',label:'Objetos para recordar',items:['el libro']}],{structured:true}),/Objetos para recordar/);
 assert.throws(()=>model.visualLabel(undefined),/etiqueta/);assert.throws(()=>art.svg('missing'),/desconocida/);
 assert.match(model.visualLabel('objeto todavía sin pictograma'),/<span>objeto todavía sin pictograma<\/span>/);
});
test('Language has no default writing, Reading owns composition and legacy writing identities survive the move',()=>{
 const {context,api}=load();
 for(const age of ages){const language={middle:'middleLanguage',teen:'teenLanguage'}[age]||'language',reading=['early','junior'].includes(age)?'reading':'literacy';
  const bank=age==='early'?early.pool('language',2):({junior:context.JuniorContent,primary:context.PrimaryContent,middle:context.MiddleContent,teen:context.TeenReview}[age]).pool(language,2);
  assert.ok(bank.every(it=>it.languageFocus!=='writing'));
  const written=age==='early'?early.pool('reading',2,'writing'):[...context.Curriculum.pool(age,reading,2)].filter(x=>x.type==='self'||x.responseType==='written'||x.languageFocus==='writing');assert.ok(written.length>=6,age);
  for(const it of written){assert.equal(it.domain,reading);model.printable(locale.localizeItem(it,'es_co',reading),profile(age));}
  if(['junior','primary','middle'].includes(age))assert.ok(written.some(it=>it.originalDomain===language&&it.contentKey.startsWith(age+'-v1:')));
  for(let n=0;n<10;n++){const it=api.variantExercise(age,reading,2,'writing');assert.ok(it.type==='self'||it.responseType==='written'||it.languageFocus==='writing',age);}
 }
});
test('twenty-two authored document types retain exact transcripts, multiple purposes and explicit international country context',()=>{
 assert.equal(Object.keys(documents.documents).length,22);assert.equal(new Set(Object.values(documents.documents).map(x=>x.kind)).size,22);
 for(const [id,doc] of Object.entries(documents.documents)){
  assert.equal(new Set(doc.questions.map(q=>q[0])).size,3,id);assert.equal(new Set(doc.questions.map(q=>q[1])).size,3,id);
  const markup=model.interactiveStimulus([{type:'document',documentId:id}],{structured:true});assert.match(markup,/Ver versión en texto/);assert.ok(!/<details[^>]*\sopen/.test(markup));assert.match(markup,/<figcaption><a[^>]+>Ampliar documento<\/a><\/figcaption>/);
  for(const block of doc.transcript)if(block.type==='text')assert.ok(markup.includes(block.text.replaceAll('&','&amp;').replaceAll('>','&gt;').replaceAll('<','&lt;')));
  if(doc.brief){const svg=fs.readFileSync(doc.path.replace('.png','.svg'),'utf8');assert.doesNotMatch(svg,/Documento ficticio|Documento de práctica|Material original ficticio/);assert.ok(svg.includes(doc.country));assert.ok(doc.sample.length>30);}
 }
 const bank=curriculum.pool('teen','literacy',2).filter(it=>it.stimulus.some(b=>b.type==='document')&&it.writingPurpose);assert.equal(bank.length,14);assert.equal(new Set(bank.map(it=>it.mechanic)).size,14);
 for(const it of bank){assert.ok(it.writingAudience);assert.equal(it.writingRubric.length,3);assert.ok(it.sample);for(const country of Object.keys(locale.labels)){const local=locale.localizeItem(it,country,'literacy');model.printable(local,profile('teen'));assert.equal(local.stimulus[1].documentId,it.stimulus[1].documentId);}}
 const co=documents.pool('teen','literacy',2).find(x=>x.stimulus[1].documentId==='advert-co');const international=locale.localizeItem(co,'es_intl','literacy');assert.match(international.stimulus[0].text,/Colombia/);assert.match(documents.get('advert-co').transcript.map(x=>x.text).join(' '),/20.000 COP/);
});
test('spelling rejects duplicate meanings, case, spacing and unintentional punctuation before display and print',()=>{
 const base={domain:'teenLanguage',type:'standard',requiresStimulus:false,languageFocus:'spelling',q:'Elige la palabra correcta.',a:'árbol'};
 for(const opts of [['árbol','árbol'],['árbol','ÁRBOL'],['árbol',' árbol '],['árbol','¡árbol!']]){
  const it={...base,opts};assert.throws(()=>model.forDelivery(it,profile('teen'),'teenLanguage'),/duplicadas/);assert.throws(()=>model.printable(it,profile('teen')),/duplicadas/);
 }
 assert.throws(()=>model.printable({...base,opts:['árbol','arbol'],optionMeanings:['correcta','correcta']},profile('teen')),/semánticamente/);
 assert.doesNotThrow(()=>model.printable({...base,q:'Elige la puntuación correcta.',a:'Hola, Ana.',opts:['Hola, Ana.','Hola Ana.']},profile('teen')));
 const {context,api}=load();for(const age of ['junior','primary','middle','teen']){const lang={middle:'middleLanguage',teen:'teenLanguage'}[age]||'language',provider={junior:context.JuniorContent,primary:context.PrimaryContent,middle:context.MiddleContent,teen:context.TeenReview}[age];for(const level of [1,2,3])for(const it of provider.pool(lang,level,'spelling')){assert.ok(api.validateItem(it));for(const country of Object.keys(locale.labels))model.printable(locale.localizeItem(it,country,lang),profile(age));}}
});
test('speed includes geometric, object, directional and category tasks with balanced yes/no and factual answers',()=>{
 for(const age of ages)for(const level of [1,2,3]){
  const bank=curriculum.pool(age,'speedReasoning',level);assert.ok(bank.every(it=>it.speedRevision===4));const families=new Set(bank.map(x=>x.speedFamily));for(const f of ['figures','objects','arrows','orientation','pictograms','category'])assert.ok(families.has(f));
  if(age!=='early')for(const f of ['characters','mixed','key','match'])assert.ok(families.has(f));
  for(const f of families){const tasks=bank.filter(it=>it.speedFamily===f);if(!['key','match'].includes(f))assert.equal(tasks.filter(it=>it.a==='Sí').length,tasks.filter(it=>it.a==='No').length,f);}
  for(const it of bank){if(it.speedEvidence.kind==='category'){assert.equal(it.a,it.stimulus[0].items.every(value=>['gato','perro','conejo','pájaro'].includes(value))?'Sí':'No');}if(it.stimulus[0].presentation==='speedComparison'){const markup=model.interactiveStimulus(it.stimulus);assert.match(markup,/speed-series/);assert.equal((markup.match(/class="speed-series"/g)||[]).length,2);}}
 }
});

test('contextual vocabulary and meaning contrasts are age-authored, printable and available in Language',()=>{
 const {api}=load();for(const age of ages)for(const level of [1,2,3]){
  const domain={middle:'middleLanguage',teen:'teenLanguage'}[age]||'language',bank=curriculum.vocabulary(age,domain,level);assert.equal(bank.length,12);assert.equal(new Set(bank.map(it=>it.mechanic)).size,2);
  for(const it of bank)for(const country of Object.keys(locale.labels))model.printable(locale.localizeItem(it,country,domain),profile(age));
  assert.equal(api.variantExercise(age,domain,level,'vocabulary').languageFocus,'vocabulary');
 }
});

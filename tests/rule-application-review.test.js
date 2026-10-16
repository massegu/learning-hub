const test=require('node:test'),assert=require('node:assert/strict'),load=require('./edge-harness');
const locale=require('../js/locale-content'),model=require('../js/activity-model');
test('teen rule tasks require applying both criteria to actual records with one justified pair',()=>{
  const {api}=load();
  for(const level of [1,2,3])for(let k=0;k<20;k++){
    const it=api.matrixExecutive20('teen',level,k*20+4);
    assert.equal(api.matrixExecutive20('teen',level,k*20+18).mechanic,'exec_rule_switch');
    assert.equal(it.mechanic,'exec_rule_switch');assert.doesNotMatch(it.q,/Qué debes seguir/);
    const tables=it.stimulus.filter(b=>b.type==='table');assert.equal(tables.length,2);
    const first=tables[0].rows.slice(1).filter(r=>r[1]==='PDF'&&r[2]==='Sí'&&(level===1||Number(r[4])<=5));
    const second=tables[1].rows.slice(1).filter(r=>level===3?r[5]==='Urgente'&&r[3]==='Sí'&&Number(r[4])<=3:r[1]==='TXT'&&r[3]==='Sí'&&(level===1||Number(r[4])<=3));
    assert.equal(first.length,1);assert.equal(second.length,1);
    assert.equal(it.a,first[0][0]+' → '+second[0][0]);
    assert.equal(new Set(it.opts).size,4);assert.ok(it.opts.includes(first[0][0]+' → '+tables[1].rows[1][0]));
    for(const country of Object.keys(locale.labels))assert.doesNotThrow(()=>model.printable(locale.localizeItem(it,country,'executive'),{age_band:'teen'}));
  }
});
test('teen attention timetable has real printable rows and a single matching route/stop',()=>{
  const {api}=load();
  for(const level of [1,2,3]){
    const it=api.matrixAttention18('teen',level,13),block=it.stimulus[0];
    assert.equal(block.type,'table');assert.equal(block.header,true);assert.equal(it.scenario,undefined);
    const matches=block.rows.slice(1).filter(r=>r[0]==='A'&&r[1]==='Parque');assert.equal(matches.length,1);assert.equal(matches[0][2],it.a);
    assert.deepEqual(Array.from(model.printable(it,{age_band:'teen'}).stimulus[0].rows[0]),['Línea','Parada','Hora']);
  }
});
test('Mexico keeps mochila and adapts headphone object labels, with protected medical and word-form senses',()=>{
  const raw={domain:'memory',q:'¿Qué objeto tenía Noa?',memoryContent:[{person:'Noa',detail:'auriculares'},{person:'Sol',detail:'mochila'}],opts:['auriculares','mochila','cargador'],a:'auriculares'};
  const adapted=locale.localizeItem(raw,'es_mx','memory');
  assert.equal(adapted.a,'audífonos');assert.equal(adapted.memoryContent[0].detail,'audífonos');assert.ok(adapted.opts.includes(adapted.a));assert.ok(adapted.opts.includes('mochila'));
  assert.equal(locale.text('La mochila está en la mesa.','es_mx'),'La mochila está en la mesa.');
  assert.equal(locale.localizeItem({...raw,stimulus:[{type:'text',text:'Los auriculares están en la mochila.'}]},'es_mx','memory').stimulus[0].text,'Los audífonos están en la mochila.');
  assert.equal(locale.localizeItem({q:'Observa los pabellones auriculares.'},'es_mx','reading').q,'Observa los pabellones auriculares.');
  assert.equal(locale.localizeItem(raw,'es_es','memory').a,'auriculares');assert.equal(locale.localizeItem(raw,'es_ar','memory').a,'auriculares');
  assert.throws(()=>locale.localizeItem({...raw,q:'¿Cuántas letras tiene auriculares?'},'es_mx','language'),/forma/);
});

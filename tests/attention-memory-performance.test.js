const test=require('node:test'),assert=require('node:assert/strict'),m=require('../js/activity-model'),c=require('../js/curriculum'),art=require('../js/stimulus-art'),load=require('./edge-harness');
test('attention labelled facts retain A-D mapping in UI and printable material, including colour-number pairs',()=>{
 const scenario='A) azul-5 · B) rojo-6 · C) azul-6 · D) verde-7';
 const blocks=m.comparisonStimulus(scenario);
 assert.deepEqual(blocks[0].rows,[['A','azul-5'],['B','rojo-6'],['C','azul-6'],['D','verde-7']]);
 const it={domain:'attention',type:'standard',q:'Elige la opción que es azul y tiene número par.',scenario,a:'C',opts:['C','B','D','A']};
 assert.deepEqual(m.printable(it,{age_band:'teen'}).stimulus,blocks);
 const html=m.interactiveStimulus(blocks);assert.equal((html.match(/scope="row"/g)||[]).length,4);assert.match(html,/<th scope="row">C<\/th><td>azul-6<\/td>/);
 for(const bad of ['A) azul-5 · B) rojo-6 · C) azul-6','A) azul · B) rojo · B) verde · D) amarillo','A) · B) rojo · C) azul · D) verde'])assert.equal(m.comparisonStimulus(bad),null);
 assert.match(m.interactiveStimulus(m.comparisonStimulus('A) <azul> · B) rojo · C) azul · D) verde')),/&lt;azul&gt;/);
});
test('memory icon labels are concise while canonical evidence and other subject labels remain intact',()=>{
 for(const label of c.memoryCategories.flatMap(x=>x.items)){
  const senses={banana:true,memory:true};assert.ok(art.forLabel(label,senses));
  const shown=m.visualLabel(label,senses);assert.ok(shown.endsWith('<span>'+m.memoryLabel(label)+'</span>'));
  assert.ok(m.visualLabel(label,{banana:true}).endsWith('<span>'+label+'</span>'));
 }
 const it=c.pool('teen','memory',1)[0],before=structuredClone(it);
 const html=m.interactiveStimulus(it.stimulus,{memory:true,senses:it.lexicalSenses});assert.match(html,/<svg/);assert.deepEqual(it,before);
 assert.equal(m.memoryLabel('la llave inglesa'),'llave inglesa');assert.equal(m.memoryLabel('la tienda de campaña'),'tienda de campaña');
});
test('cached mechanic groups preserve the complete speed bank and return isolated candidates',()=>{
 const {context}=load(),bank=context.Curriculum.pool('teen','speedReasoning',3),keys=new Set(),families=new Set();
 for(let i=0;i<bank.length*80&&keys.size<bank.length;i++){
  const it=context.Curriculum.generate('teen','speedReasoning',3);keys.add(it.contentKey);families.add(it.mechanic);
  it.q='mutated';if(it.stimulus?.[0]?.rows)it.stimulus[0].rows[0][0]='mutated';
 }
 assert.equal(keys.size,new Set(bank.map(x=>x.contentKey)).size);assert.deepEqual([...families].sort(),[...new Set(bank.map(x=>x.mechanic))].sort());
 assert.ok(context.Curriculum.pool('teen','speedReasoning',3).every(x=>x.q!=='mutated'&&x.stimulus?.[0]?.rows?.[0]?.[0]!=='mutated'));
});

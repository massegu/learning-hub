const test=require('node:test'),assert=require('node:assert/strict');
const curriculum=require('../js/curriculum'),communication=require('../js/communication-content'),locale=require('../js/locale-content'),model=require('../js/activity-model');

test('word production follows the exact 6–8 versus 9+ age threshold',()=>{
 for(const [route,years] of [['early',[6,7]],['junior',[8,9,10]]])for(const ageYears of years){
  const bank=curriculum.pool(route,'speedReasoning',1,ageYears).filter(item=>item.speedFamily==='wordProduction');
  assert.equal(bank.length,12);
  for(const item of bank){
   assert.equal(item.speedEvidence.ageYears,ageYears);
   assert.equal(Boolean(item.speedEvidence.condition),ageYears>=9);
   if(ageYears<9){assert.match(item.q,/Escribe una palabra de/);assert.doesNotMatch(item.q,/que .* y /);}
   else assert.ok(item.q.includes(item.speedEvidence.condition));
   assert.doesNotThrow(()=>curriculum.validateSpeed(item));
  }
 }
});

test('graffiti-style comparisons are delivered only to 13+ and retain a readable two-word choice',()=>{
 for(const age of ['early','junior','primary'])assert.equal(curriculum.pool(age,'speedReasoning',1).filter(item=>item.speedFamily==='typographyCompare').length,0);
 for(const age of ['middle','teen'])for(const item of curriculum.pool(age,'speedReasoning',2).filter(item=>item.speedFamily==='typographyCompare')){
  assert.equal(item.stimulus[0].presentation,'typographyCompare');
  assert.deepEqual(item.stimulus[0].rows[0].length,2);
  assert.doesNotThrow(()=>curriculum.validateSpeed(item));
  for(const country of Object.keys(locale.labels))assert.doesNotThrow(()=>model.forDelivery(locale.localizeItem(item,country,'speedReasoning'),{age_band:age,progress:{ageRoute:age}},'speedReasoning'));
 }
});

test('functional communication families are available at all age routes and levels',()=>{
 for(const age of ['early','junior','primary','middle','teen'])for(const level of [1,2,3]){
  const bank=communication.pool(age,level);assert.equal(bank.length,age==='early'?24:3);
  assert.equal(new Set(bank.map(item=>item.qualityDescriptor.semanticFamily)).size,3);
  for(const item of bank){
   assert.doesNotThrow(()=>communication.validate(item));
   for(const country of Object.keys(locale.labels))assert.doesNotThrow(()=>model.forDelivery(locale.localizeItem(item,country,'communication'),{age_band:age,progress:{ageRoute:age}},'communication'));
  }
 }
});

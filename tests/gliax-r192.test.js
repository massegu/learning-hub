const test = require('node:test');
const assert = require('node:assert/strict');
const {createItem, gradeChoice, outcome, responseEvent, fingerprint} = require('../js/gliax-r192');

const template = {
  id: 'CP01',
  ageBand: 'early',
  level: 1,
  mechanic: 'substitution',
  construct: 'planUpdating',
  surface: {prompt: '¿Con qué puedes pintar?', options: [
    {id: 'first', label: 'Con la esponja'},
    {id: 'second', label: 'Con la brocha disponible'},
    {id: 'third', label: 'Con el pincel que falta'}
  ]},
  structure: {constraints: ['available-tool'], update: 'resource'},
  answerModel: {mode: 'multi_valid_choice', validIds: ['first', 'second']}
};

test('stable seeds, choice IDs and fingerprints index visible and cognitive content separately', () => {
  const first = createItem(template, 'synthetic:1');
  assert.deepEqual(createItem(template, 'synthetic:1'), first);
  const variants = Array.from({length: 16}, (_, index) => createItem(template, index));
  assert.ok(new Set(variants.map(item => item.surfaceFingerprint)).size > 1);
  assert.equal(new Set(variants.map(item => item.cognitiveFingerprint)).size, 1);
  for (const item of variants) {
    assert.equal(gradeChoice(item.answerModel, 'first').gradedCorrect, true);
    assert.equal(gradeChoice(item.answerModel, 'second').gradedCorrect, true);
    assert.equal(gradeChoice(item.answerModel, 'third').gradedCorrect, false);
  }

  const copy = structuredClone(template);
  copy.surface.prompt = 'Ahora pinta un círculo.';
  const changed = createItem(copy, 'synthetic:1');
  assert.notEqual(changed.surfaceFingerprint, first.surfaceFingerprint);
  assert.equal(changed.cognitiveFingerprint, first.cognitiveFingerprint);

  const withRows = {...template, surface: {rows: [{id: 'row-1', text: 'Mismo estímulo'}]}};
  const renamedRow = {...withRows, surface: {rows: [{id: 'row-a', text: 'Mismo estímulo'}]}};
  assert.equal(createItem(withRows, 1).surfaceFingerprint, createItem(renamedRow, 1).surfaceFingerprint);

  copy.structure.constraints.push('keep-original-goal');
  assert.notEqual(createItem(copy, 'synthetic:1').cognitiveFingerprint, first.cognitiveFingerprint);
  assert.equal(fingerprint({a: 'e\u0301', b: 1}), fingerprint({b: 1, a: 'é'}));
});

test('activity identity and age boundaries are validated', () => {
  assert.throws(() => createItem({...template, id: 'CP16'}, 1));
  assert.throws(() => createItem({...template, id: 'AR07'}, 1));
  assert.throws(() => createItem(template, {}));
  assert.equal(createItem({...template, id: 'IN-06 complete-data'}, 1).family, 'IN');
});

test('uninterpretable and pending answers have no grade and events omit free text and identifiers', () => {
  const item = createItem(template, 'seed-not-for-events');
  const result = {...outcome('uninterpretable'), rawText: 'texto ficticio', profileId: 'fixture', gradedCorrect: false};
  const event = responseEvent(item, result, 'hint');
  assert.deepEqual(event, {
    activityId: 'CP01', contentVersion: 'r19.2-r1', gradingVersion: 'r19.2-r1.1',
    status: 'uninterpretable', support: 'hint'
  });
  assert.deepEqual(outcome('pending_review'), {status: 'pending_review'});
  assert.deepEqual(outcome('partial'), {status: 'partial'});
  assert.throws(() => responseEvent(item, result, 'raw value'));
});

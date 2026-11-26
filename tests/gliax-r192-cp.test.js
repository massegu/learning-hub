const test = require('node:test');
const assert = require('node:assert/strict');
const {getChangePlan, gradeChangePlan} = require('../js/gliax-r192-cp');

test('15 CP cases keep their age, level, valid plans and stable shuffled choices', () => {
  const validChoices = [
    ['sponge'], ['empty'], ['both'], ['before'], ['cards'], ['title-first'], ['second'],
    ['ana', 'leo'], ['after'], ['confirm'], null, ['none'], ['signed'], null, null
  ];
  for (const [index, expected] of validChoices.entries()) {
    const id = 'CP' + String(index + 1).padStart(2, '0');
    const item = getChangePlan(id, 1);
    assert.equal(item.ageBand, ['early', 'junior', 'primary', 'middle', 'teen'][Math.floor(index / 3)]);
    assert.equal(item.level, index % 3 + 1);
    assert.deepEqual(item, getChangePlan(id, 1));
    if (!expected) continue;
    for (let seed = 0; seed < 8; seed++) {
      const variant = getChangePlan(id, seed);
      const options = variant.presentation.options;
      assert.equal(new Set(options.map(option => option.label)).size, options.length);
      const valid = options.filter(option => gradeChangePlan(variant, option.id).gradedCorrect).map(option => option.id);
      assert.deepEqual(valid.sort(), [...expected].sort(), id);
      if (variant.answerModel.violations) {
        for (const option of options.filter(option => !expected.includes(option.id))) {
          assert.ok(gradeChangePlan(variant, option.id).violated.length, id);
        }
      }
    }
    assert.ok(new Set(Array.from({length: 12}, (_, seed) => getChangePlan(id, seed).presentation.options[0].id)).size > 1, id);
  }
});

test('CP11 and CP14 accept alternative valid schedules and enforce their real dependencies', () => {
  const cp11 = getChangePlan('CP11', 1);
  for (const order of [
    ['topic2', 'questions', 'end-first', 'topic1', 'practice'],
    ['questions', 'topic1', 'end-first', 'topic2', 'practice']
  ]) assert.equal(gradeChangePlan(cp11, order).gradedCorrect, true);
  assert.equal(gradeChangePlan(cp11, ['questions', 'practice', 'end-first', 'topic2', 'topic1']).gradedCorrect, false);
  assert.equal(gradeChangePlan(cp11, ['topic2', 'end-first', 'questions', 'topic1', 'practice']).gradedCorrect, false);

  const cp14 = getChangePlan('CP14', 1);
  for (const order of [
    ['slides', 'start-tuesday', 'rehearse', 'end-tuesday', 'study', 'present', 'exam'],
    ['slides', 'start-tuesday', 'rehearse', 'end-tuesday', 'present', 'study', 'exam']
  ]) assert.equal(gradeChangePlan(cp14, order).gradedCorrect, true);
  assert.equal(gradeChangePlan(cp14, ['slides', 'start-tuesday', 'end-tuesday', 'rehearse', 'study', 'present', 'exam']).gradedCorrect, false);
});

test('CP12 recalculates infeasibility and CP15 gives both reasoned choices a path to correctness', () => {
  const cp12 = getChangePlan('CP12', 1);
  for (const route of ['bus', 'metro', 'walk']) assert.equal(gradeChangePlan(cp12, route).gradedCorrect, false);
  cp12.answerModel.budget = 300;
  assert.equal(gradeChangePlan(cp12, 'none').gradedCorrect, false);
  assert.equal(gradeChangePlan(cp12, 'metro').gradedCorrect, true);

  const cp15 = getChangePlan('CP15', 1);
  assert.equal(gradeChangePlan(cp15, {choice: 'flexible', components: ['attendance-unconfirmed', 'cancellation-worth-cost']}).gradedCorrect, true);
  assert.equal(gradeChangePlan(cp15, {choice: 'wait', components: ['attendance-unconfirmed', 'accept-availability-risk']}).gradedCorrect, true);
  assert.deepEqual(gradeChangePlan(cp15, 'Quiero esperar.'), {status: 'pending_review'});
  assert.deepEqual(gradeChangePlan(cp15, {choice: 'wait', components: ['attendance-unconfirmed']}), {status: 'pending_review'});
});

test('CP04 and CP14 expose the timing requirements used by the corrector', () => {
  const cp04 = getChangePlan('CP04', 0);
  assert.match(cp04.presentation.prompt, /después no habrá tiempo/);
  assert.equal(gradeChangePlan(cp04, 'after').gradedCorrect, false);
  const cp14 = getChangePlan('CP14', 19);
  assert.match(cp14.presentation.prompt, /diapositivas antes del martes/);
  assert.match(cp14.presentation.prompt, /estudia para el examen después del ensayo/);
  assert.equal(gradeChangePlan(cp14, ['study', 'slides', 'start-tuesday', 'rehearse', 'end-tuesday', 'present', 'exam']).gradedCorrect, false);
  assert.equal(gradeChangePlan(cp14, ['slides', 'start-tuesday', 'rehearse', 'end-tuesday', 'study', 'present', 'exam']).gradedCorrect, true);
});

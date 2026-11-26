const test = require('node:test');
const assert = require('node:assert/strict');
const {getContradiction, gradeContradiction} = require('../js/gliax-r192-ec');

test('15 EC cases classify the relation and grade evidence independently of positions', () => {
  const answers = [
    ['violated'], ['direct_conflict'], ['compatible'], ['direct_conflict'], ['met'],
    ['inferred_conflict'], ['violated'], ['update_over_time'], ['insufficient_evidence'],
    ['direct_conflict', 'violated'], ['update_over_time'], ['inferred_conflict'],
    ['direct_conflict'], ['compatible'], ['inferred_conflict']
  ];
  const evidence = ['source-a', 'source-b'];
  for (const [index, expected] of answers.entries()) {
    const id = 'EC' + String(index + 1).padStart(2, '0');
    const item = getContradiction(id, 1);
    assert.deepEqual(item, getContradiction(id, 1));
    assert.equal(item.level, index % 3 + 1);
    assert.equal(item.ageBand, ['early', 'junior', 'primary', 'middle', 'teen'][Math.floor(index / 3)]);
    if (item.level > 1) assert.equal(gradeContradiction(item, {choice: expected[0], evidence: ['source-a', 'context']}).status, 'partial');
    const variants = Array.from({length: 12}, (_, seed) => getContradiction(id, seed));
    assert.ok(new Set(variants.map(({presentation}) => presentation.options[0].id)).size > 1);
    assert.ok(new Set(variants.map(({presentation}) => presentation.rows[0].id)).size > 1);
    for (const variant of variants) {
      const accepted = variant.presentation.options.filter(({id}) => gradeContradiction(variant, {choice: id, evidence}).gradedCorrect);
      assert.deepEqual(accepted.map(option => option.id).sort(), [...expected].sort(), id);
      for (const row of variant.presentation.rows) assert.equal(Object.hasOwn(row, 'correct'), false);
    }
  }
});

test('EC keeps compliance, temporal updates, uncertainty and real disagreement distinct', () => {
  const grade = (id, choice) => gradeContradiction(getContradiction(id, 8), {choice, evidence: ['source-b', 'source-a']});
  assert.deepEqual(grade('EC05', 'met'), {status: 'correct', gradedCorrect: true, classification: 'constraint_mismatch', fulfilled: true, difference: -1});
  assert.equal(grade('EC08', 'update_over_time').subtype, 'update_over_time');
  assert.equal(grade('EC09', 'direct_conflict').status, 'incorrect');
  assert.equal(grade('EC14', 'compatible').classification, 'compatible');
  for (const [id, difference] of [['EC06', 4], ['EC12', 3], ['EC15', 25]]) {
    const item = getContradiction(id, 2);
    assert.equal(grade(id, 'inferred_conflict').difference, difference);
    assert.ok(item.presentation.options.every(({label}) => !label.includes(String(difference))), id);
    item.answerModel.facts.threshold += difference;
    assert.equal(gradeContradiction(item, {choice: 'inferred_conflict'}).status, 'incorrect');
  }
});

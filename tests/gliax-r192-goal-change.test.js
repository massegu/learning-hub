const test = require('node:test');
const assert = require('node:assert/strict');
const {goalChangePool, generateGoalChange, gradeGoalChange} = require('../js/gliax-r192-goal-change');

test('goal change respects bands and levels and collapses scenery variants for template selection', () => {
  for (const ageBand of ['early', 'junior', 'primary', 'middle', 'teen']) {
    const levels = [];
    for (const level of [1, 2, 3]) {
      const request = {ageBand, level, seed: 'fixture'};
      const pool = goalChangePool(request);
      const item = generateGoalChange(request);
      assert.deepEqual(item, generateGoalChange(request));
      assert.ok(pool.every(item => item.ageBand === ageBand && item.level === level));
      levels.push(pool.map(item => item.cognitiveFingerprint).sort().join());
      const historical = pool.filter(item => item.answerModel.kind === 'priority');
      if (historical.length) {
        assert.equal(new Set(historical.map(item => item.cognitiveFingerprint)).size, 1);
        assert.equal(new Set(historical.map(item => item.surfaceFingerprint)).size, 4);
        for (const item of historical) {
          assert.equal(item.opts.filter(option => gradeGoalChange(item, option).gradedCorrect).length, 1);
          assert.equal(gradeGoalChange(item, level === 2 ? 'notify' : 'inbox').gradedCorrect, true);
          const position = Array.from({length: 10}, (_, seed) =>
            goalChangePool({...request, seed}).find(other => other.id === item.id).opts.indexOf(item.a));
          assert.ok(new Set(position).size > 1);
        }
      }
    }
    assert.equal(new Set(levels).size, 3);
  }
});

test('documented alternate plans, infeasibility and justified decisions keep their distinct results', () => {
  const reference = (ageBand, level, id) => goalChangePool({ageBand, level, seed: 1}).find(item => item.sourceId === id);
  const cp08 = reference('primary', 2, 'CP08');
  assert.equal(gradeGoalChange(cp08, 'ana').gradedCorrect, true);
  assert.equal(gradeGoalChange(cp08, 'leo').gradedCorrect, true);
  assert.equal(gradeGoalChange(cp08, 'early-review').gradedCorrect, false);
  const cp12 = reference('middle', 3, 'CP12');
  assert.deepEqual(gradeGoalChange(cp12, 'none'), {status: 'correct', gradedCorrect: true, resolution: 'no_solution'});
  assert.deepEqual(gradeGoalChange(cp12, 'bus'), {status: 'incorrect', gradedCorrect: false, resolution: 'no_solution'});
  assert.deepEqual(gradeGoalChange(cp12, 'texto no estructurado'), {status: 'uninterpretable', resolution: 'no_solution'});
  const cp15 = reference('teen', 3, 'CP15');
  assert.equal(gradeGoalChange(cp15, {choice: 'wait', components: ['attendance-unconfirmed', 'accept-availability-risk']}).gradedCorrect, true);
  assert.deepEqual(gradeGoalChange(cp15, 'Quizá esperar.'), {status: 'pending_review'});
});

test('priority requires relating the message to the start rather than matching a stated wait instruction', () => {
  const item = goalChangePool({ageBand: 'junior', level: 1, seed: 5}).find(candidate => candidate.answerModel.kind === 'priority');
  assert.doesNotMatch(item.stimulus[1].text, /mensajes pueden esperar/i);
  assert.match(item.stimulus[1].text, /cuando acabe el encuentro/);
  assert.equal(gradeGoalChange(item, 'Contestar el mensaje sobre la recogida').gradedCorrect, true);
  assert.equal(gradeGoalChange(item, 'materials').gradedCorrect, false);
});

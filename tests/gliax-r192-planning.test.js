const test = require('node:test');
const assert = require('node:assert/strict');
const {planningPool, generatePlanning, gradePlanning, solveOrders} = require('../js/gliax-r192-planning');
const {responseEvent} = require('../js/gliax-r192-executive');

test('planning adapts the existing dependency contexts across bands and levels with seeded presentation', () => {
  for (const ageBand of ['early', 'junior', 'primary', 'middle', 'teen']) {
    const levels = [];
    for (const level of [1, 2, 3]) {
      const request = {ageBand, level, seed: 22};
      const pool = planningPool(request);
      const item = pool[0];
      assert.deepEqual(generatePlanning(request), generatePlanning(request));
      assert.equal(new Set(pool.map(x => x.id)).size, pool.length);
      assert.equal(new Set(pool.map(x => x.surfaceFingerprint)).size, pool.length);
      assert.equal(item.ageBand, ageBand);
      assert.equal(item.level, level);
      assert.equal(item.responseType, 'order');
      assert.equal(Object.hasOwn(item.presentation, 'answer'), false);
      assert.equal(gradePlanning(item, item.answer).gradedCorrect, true);
      assert.equal(gradePlanning(item, [...item.answer].reverse()).gradedCorrect, false);
      assert.equal(gradePlanning(item, 'texto abierto').status, 'uninterpretable');
      assert.ok(new Set(Array.from({length: 8}, (_, seed) => planningPool({...request, seed})[0].surfaceFingerprint)).size > 1);
      levels.push([item.answerModel.steps.length, item.answerModel.completed.length]);
    }
    assert.equal(new Set(levels.map(JSON.stringify)).size, 3, ageBand);
  }
});

test('CP11 and CP14 maintain independent steps, and inconsistent dependency graphs have no solution', () => {
  const cp11 = planningPool({ageBand: 'middle', level: 2, seed: 'a'}).find(item => item.sourceId === 'CP11');
  for (const ids of [
    ['topic2', 'questions', 'end-first', 'topic1', 'practice'],
    ['questions', 'topic1', 'end-first', 'topic2', 'practice']
  ]) assert.equal(gradePlanning(cp11, ids).gradedCorrect, true);
  const cp14 = planningPool({ageBand: 'teen', level: 2, seed: 'a'}).find(item => item.sourceId === 'CP14');
  assert.equal(gradePlanning(cp14, ['slides', 'start-tuesday', 'rehearse', 'end-tuesday', 'study', 'present', 'exam']).gradedCorrect, true);
  const cyclic = structuredClone(cp11);
  cyclic.answerModel.before.push(['practice', 'topic2']);
  assert.deepEqual(gradePlanning(cyclic, 'no-solution'), {status: 'correct', gradedCorrect: true, resolution: 'no_solution'});
  assert.deepEqual(solveOrders({steps: ['a', 'b'], before: [['a', 'b']], completed: ['b']}), []);
});

test('events retain only canonical identity, explicit support and categorical grade', () => {
  const item = generatePlanning({ageBand: 'early', level: 1, seed: 'private seed'});
  const result = {...gradePlanning(item, 'texto libre'), rawResponse: 'texto libre', profileId: 'synthetic'};
  assert.deepEqual(responseEvent(item, result), {
    activityId: item.id, contentVersion: 'r19.2-r2', gradingVersion: 'r19.2-r2.1',
    status: 'uninterpretable', support: 'spontaneous'
  });
  assert.throws(() => responseEvent({...item, id: 'r192-sensitive-string'}, result));
});

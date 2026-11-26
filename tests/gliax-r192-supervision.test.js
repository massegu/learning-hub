const test = require('node:test');
const assert = require('node:assert/strict');
const {supervisionPool, generateSupervision, gradeSupervision} = require('../js/gliax-r192-supervision');

test('supervision requires comparing equivalent facts, even when no correction is needed', () => {
  for (const ageBand of ['junior', 'primary', 'middle', 'teen']) {
    const loads = [];
    for (const level of [1, 2, 3]) {
      const request = {ageBand, level, seed: 1};
      const items = supervisionPool(request);
      assert.deepEqual(generateSupervision(request), generateSupervision(request));
      const allCorrect = items[0];
      const corrections = items[1];
      assert.deepEqual(gradeSupervision(allCorrect, []), {status: 'correct', gradedCorrect: true, review: 'compliant'});
      assert.deepEqual(gradeSupervision(allCorrect, 'texto abierto'), {status: 'uninterpretable', review: 'compliant'});
      assert.equal(gradeSupervision(corrections, []).gradedCorrect, false);
      assert.equal(gradeSupervision(corrections, [...corrections.answers].reverse()).gradedCorrect, true);
      assert.equal(gradeSupervision(corrections, [...corrections.answers, corrections.answers[0]]).gradedCorrect, false);
      assert.equal(gradeSupervision(corrections, [...corrections.answers, 'criterio inventado']).status, 'uninterpretable');
      for (const item of items) {
        assert.ok(item.stimulus[1].rows.slice(1).every(([, requirement, proposal]) => requirement !== proposal));
        assert.equal(Object.hasOwn(item.presentation, 'answers'), false);
      }
      loads.push([corrections.opts.length, corrections.answers.length]);
      const first = Array.from({length: 8}, (_, seed) => supervisionPool({...request, seed})[1].opts[0]);
      assert.ok(new Set(first).size > 1);
    }
    assert.equal(new Set(loads.map(JSON.stringify)).size, 3, ageBand);
  }
  const project = supervisionPool({ageBand: 'middle', level: 2, seed: 0})[2];
  assert.ok(project.stimulus[1].rows.some(row => row[2] === 'El documento ocupa cuatro páginas'));
  assert.equal(gradeSupervision(project, []).gradedCorrect, true);
});

test('early supervision moves from choosing one repair to checking several proposals', () => {
  const items = [1, 2, 3].map(level => supervisionPool({ageBand: 'early', level, seed: 1})[0]);
  assert.equal(gradeSupervision(items[0], 'Secar la mesa').gradedCorrect, true);
  for (const item of items.slice(1)) {
    assert.equal(gradeSupervision(item, item.answers).gradedCorrect, true);
    assert.equal(gradeSupervision(item, ['Secar la mesa']).gradedCorrect, false);
  }
  assert.equal(items[1].answers.length, 1);
  assert.equal(items[2].answers.length, 2);
});

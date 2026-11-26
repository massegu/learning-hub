const test = require('node:test');
const assert = require('node:assert/strict');
const {constraintsPool, generateConstraints, gradeConstraints} = require('../js/gliax-r192-constraints');

test('resource grading independently matches visible rows and supports one, several and no feasible options', () => {
  for (const ageBand of ['junior', 'primary', 'middle', 'teen']) {
    for (const level of [1, 2, 3]) {
      const request = {ageBand, level, seed: 5};
      const items = constraintsPool(request).filter(item => item.answerModel.kind === 'resources');
      const counts = new Set();
      const surfaces = new Set();
      for (const item of items) {
        const [context, requirements, table] = item.stimulus;
        assert.doesNotMatch(context.text, /al menos|puntos/);
        const [, quantity, budget] = requirements.text.match(/al menos (\d+).*hasta (\d+) puntos/);
        const viable = table.rows.slice(1).filter(([, cost, units, available]) =>
          Number(cost) <= Number(budget) && Number(units) >= Number(quantity) && (level === 1 || available === 'Sí')
        ).map(row => row[0]);
        counts.add(viable.length);
        assert.ok(!surfaces.has(item.surfaceFingerprint));
        surfaces.add(item.surfaceFingerprint);
        const accepted = item.opts.filter(option => gradeConstraints(item, option).gradedCorrect);
        assert.deepEqual(accepted.sort(), viable.length ? viable.sort() : ['Ningún paquete']);
        assert.equal(gradeConstraints(item, 'texto libre').status, 'uninterpretable');
        assert.equal(gradeConstraints(item, item.a).resolution, viable.length ? 'has_solution' : 'no_solution');
        assert.equal(Object.hasOwn(item.presentation, 'a'), false);
        if (viable.length === 0) {
          assert.ok(table.rows.slice(1).some(row => Number(row[1]) <= Number(budget)));
          assert.ok(table.rows.slice(1).some(row => Number(row[2]) >= Number(quantity)));
        }
        assert.equal(table.rows[0].length, level === 1 ? 3 : 4);
      }
      assert.deepEqual([...counts].sort(), [0, 1, 2]);
    }
  }
  assert.deepEqual(constraintsPool({ageBand: 'early', level: 3, seed: 1}), []);
});

test('seeded resources and time vary positions without changing solutions or structural diversity', () => {
  const request = {ageBand: 'primary', level: 3, seed: 12};
  assert.deepEqual(generateConstraints(request), generateConstraints(request));
  const pools = Array.from({length: 10}, (_, seed) => constraintsPool({...request, seed}));
  assert.ok(new Set(pools.map(pool => pool[0].opts.indexOf(pool[0].a))).size > 1);
  assert.ok(new Set(pools.map(pool => pool[0].stimulus[2].rows[1][0])).size > 1);
  assert.equal(new Set(pools.map(pool => pool[0].cognitiveFingerprint)).size, 1);
  const plans = pools[0].filter(item => item.answerModel.kind === 'duration');
  assert.deepEqual(new Set(plans.map(x => Math.sign(x.answerModel.available - x.answerModel.minutes.reduce((a, b) => a + b, 0)))), new Set([-1, 0, 1]));
  for (const item of plans) {
    const total = item.stimulus[1].rows.slice(1).reduce((sum, row) => sum + Number(row[1]), 0);
    const available = Number(item.stimulus[0].text.match(/(\d+) minutos/)[1]);
    assert.equal(item.stimulus[1].rows.length - 1, 4);
    assert.equal(gradeConstraints(item, item.a).resolution, total > available ? 'no_solution' : 'has_solution');
    assert.equal(item.opts.filter(option => gradeConstraints(item, option).gradedCorrect).length, 1);
  }
});

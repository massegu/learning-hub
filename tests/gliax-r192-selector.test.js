const test = require('node:test');
const assert = require('node:assert/strict');
const {createSelector, windowSize} = require('../js/gliax-r192-selector');
const {candidates} = require('../js/gliax-r192-diversity');

const query = {family: 'planning', ageBand: 'middle', level: 2};
const entry = (id, structure, extras = {}) => ({
  ...query, id, structure, mechanism: 'same-mechanism', restrictions: 'same-rule',
  context: 'same-context', surface: 'surface-' + id, ...extras
});

function draw(pool, seed, count) {
  const selector = createSelector(seed);
  return Array.from({length: count}, () => selector.next(query, pool)?.id);
}

test('weighted selection is reproducible across pool order and keeps a bounded, scoped record', () => {
  const pool = candidates({...query, seed: 'inventory'});
  assert.deepEqual(draw(pool, 'repeatable', 40), draw([...pool].reverse(), 'repeatable', 40));
  assert.notDeepEqual(draw(pool, 'repeatable', 40), draw(pool, 'another-seed', 40));
  const selector = createSelector(2);
  const wrong = {...query, ageBand: 'teen'};
  assert.equal(selector.next(wrong, pool), null);
  assert.equal(selector.next(query, []), null);
  const input = {freeText: 'synthetic reply', user: 'synthetic uid'};
  const variant = {...pool[0], ...input};
  for (let i = 0; i < 40; i++) selector.next(query, [variant, ...pool.slice(1)]);
  const recent = selector.recent(query);
  assert.equal(recent.length, windowSize);
  assert.deepEqual(Object.keys(recent[0]).sort(), ['context', 'id', 'mechanism', 'restrictions', 'structure', 'surface']);
  assert.equal(selector.recent(wrong).length, 0);
  assert.ok(!JSON.stringify(recent).includes('synthetic'));
  recent[0].id = 'modified';
  assert.notEqual(selector.recent(query)[0].id, 'modified');
});

test('singletons and exhausted pools fall back safely while larger pools avoid short exact cycles', () => {
  const a = entry('A', 'a');
  const b = entry('B', 'b');
  const c = entry('C', 'c');
  assert.deepEqual(draw([a, a], 0, 3), ['A', 'A', 'A']);
  assert.equal(new Set(draw([a, b], 0, 8)).size, 2);
  for (let seed = 0; seed < 24; seed++) {
    const choices = draw([a, b, c], seed, 72);
    for (let i = 1; i < choices.length; i++) {
      assert.notEqual(choices[i], choices[i - 1]);
      for (const size of [2, 3]) if (i + 1 >= 2 * size) {
        assert.notDeepEqual(choices.slice(i + 1 - 2 * size, i + 1 - size), choices.slice(i + 1 - size, i + 1));
      }
    }
  }
});

test('many surface clones cannot dominate the probability of a distinct structure', () => {
  const many = Array.from({length: 10}, (_, i) => entry('clone-' + i, 'common'));
  const distinct = entry('different', 'different');
  const pool = [...many, distinct];
  let first = 0;
  let structuralRepetitions = 0;
  for (let seed = 0; seed < 200; seed++) {
    const choices = draw(pool, seed, 24);
    if (choices[0] === distinct.id) first++;
    structuralRepetitions += choices.slice(1).filter((id, i) => id.startsWith('clone') && choices[i].startsWith('clone')).length;
  }
  assert.ok(first >= 72 && first <= 128, first);
  assert.ok(structuralRepetitions < 1400, structuralRepetitions);
});

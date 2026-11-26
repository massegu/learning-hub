'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {createSelector} = require('../js/gliax-r192-selector');

const query = {family: 'EC', ageBand: 'middle', level: 2};
const candidate = (id, structure, mechanism, context = id) =>
  ({...query, id, structure, mechanism, context, surface: 'surface:' + id, restrictions: structure});

test('the practice selector skips cosmetic variants when deeper novelty is available', () => {
  const pool = [
    candidate('case-a', 'source update', 'temporal reading'),
    candidate('case-b', 'source update', 'temporal reading'),
    candidate('case-c', 'incompatible claims', 'compare constraints'),
    candidate('case-d', 'incompatible claims', 'compare constraints')
  ];
  const selector = createSelector('same seed', {prioritizeStructuralDiversity: true});
  const other = createSelector('same seed', {prioritizeStructuralDiversity: true});
  let previous;
  for (let round = 0; round < 100; round++) {
    const current = selector.next(query, pool);
    assert.equal(current.id, other.next(query, [...pool].reverse()).id);
    if (previous) {
      assert.notEqual(current.structure, previous.structure);
      assert.notEqual(current.mechanism, previous.mechanism);
    }
    previous = current;
  }
});

test('small or single-mechanism banks do not silently change age, family or level', () => {
  const selector = createSelector(9, {prioritizeStructuralDiversity: true});
  const item = candidate('only', 'one', 'one');
  const pool = [item, {...candidate('other', 'two', 'two'), level: 3}];
  assert.equal(selector.next(query, pool), item);
  assert.equal(selector.next(query, pool), item);
  assert.equal(selector.next({...query, ageBand: 'early'}, pool), null);
});

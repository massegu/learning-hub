const test = require('node:test');
const assert = require('node:assert/strict');
const {ages, levels, families, candidates, summarize} = require('../js/gliax-r192-diversity');
const bank = require('../js/gliax-r192-bank');

const pool = (family, ageBand, level, seed = 0) => candidates({family, ageBand, level, seed});

test('inventory covers every supported exact cell and preserves all R1 reference IDs', () => {
  const references = new Set();
  for (const ageBand of ages) for (const level of levels) for (const family of families) {
    const entries = pool(family, ageBand, level);
    const disabled = ageBand === 'early' && ['AR', 'constraints'].includes(family);
    assert.equal(Boolean(entries.length), !disabled);
    assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
    for (const entry of entries) {
      assert.equal(entry.family, family);
      assert.equal(entry.ageBand, ageBand);
      assert.equal(entry.level, level);
      assert.equal(entry.structure, entry.item.cognitiveFingerprint);
      if (['CP', 'EC', 'IN', 'AR'].includes(family) && bank.getCaseIds().includes(entry.id)) references.add(entry.id);
    }
  }
  assert.deepEqual([...references].sort(), bank.getCaseIds().sort());
});

test('reseeded displays and project names do not inflate structures, mechanisms or distinct contexts', () => {
  const first = pool('constraints', 'primary', 2);
  const second = pool('constraints', 'primary', 2, 104);
  assert.deepEqual(first.map(entry => entry.id), second.map(entry => entry.id));
  assert.deepEqual(first.map(entry => entry.structure), second.map(entry => entry.structure));
  const counts = summarize(first);
  assert.ok(counts.candidates >= 36);
  assert.equal(counts.contexts, 4);
  assert.equal(counts.mechanisms, 2);
  assert.ok(counts.structures < counts.candidates);
  assert.deepEqual(summarize([...first, ...second]), {
    ...counts, surfaces: new Set([...first, ...second].map(entry => entry.surface)).size
  });

  const information = summarize(pool('IN', 'junior', 3));
  assert.deepEqual({contexts: information.contexts, mechanisms: information.mechanisms}, {contexts: 1, mechanisms: 2});
  assert.deepEqual(pool('CP', 'no-age', 1), []);
});

test('named context variants and source-relation subtypes do not inflate mechanism counts', () => {
  const toolReplacement = pool('CP', 'early', 1)[0];
  const delegation = pool('CP', 'primary', 2)[0];
  assert.equal(toolReplacement.mechanism, delegation.mechanism);
  assert.notEqual(toolReplacement.structure, delegation.structure);
  assert.equal(pool('EC', 'early', 1)[0].mechanism, pool('EC', 'primary', 1)[0].mechanism);
});

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const bank = require('../js/gliax-r193-editorial');
const {ages, levels, candidates} = require('../js/gliax-r192-diversity');
require('../js/gliax-r192-selector');
require('../js/gliax-r192-ar');
require('../js/gliax-r192-practice');

test('editorial cases are unique and routed through their production practice session', () => {
  const familyTargets = {CP:60, EC:80, IN:60, AR:60, planning:60, constraints:60, 'goal-change':60, supervision:60};
  const ids = bank.ids();
  assert.equal(ids.length, 500);
  assert.equal(new Set(ids).size, 500);
  const items = ids.map(id => bank.get(id, 2026));
  const seen = new Set();
  const previousConfig = globalThis.LH_CONFIG;
  globalThis.LH_CONFIG = {staging:true};
  try {
    for (const [family, target] of Object.entries(familyTargets)) {
      const authored = items.filter(item => item.family === family);
      assert.equal(authored.length, target);
      assert.equal(new Set(authored.map(item => item.cognitiveFingerprint)).size, target);
      const area = family === 'EC' ? 'attention' : 'executive';
      for (const ageBand of ages) for (const level of levels) {
        const label = [family, ageBand, level].join(':');
        const query = {family, ageBand, level, seed:2026};
        const expanded = candidates({...query, includeEditorial:true});
        const slotIds = new Set(expanded.map(candidate => candidate.id));
        const slotAuthored = expanded.filter(candidate => candidate.item.editorial);
        const session = GliaxR192Practice.createSession('editorial-integration');
        if (!GliaxR192Practice.available(area, ageBand, level).some(([key]) => key === family)) {
          assert.equal(expanded.length, 0, label);
          assert.equal(session.next(family, area, ageBand, level), null, label);
          continue;
        }
        assert.ok(slotAuthored.length > 0, label);
        slotAuthored.forEach(candidate => seen.add(candidate.id));
        let previous;
        for (let turn = 0; turn < 60; turn++) {
          const round = session.next(family, area, ageBand, level);
          assert.ok(slotIds.has(round.id), label);
          assert.equal(round.caseCount, expanded.length, label);
          if (expanded.length > 1) assert.notEqual(round.id, previous, label);
          previous = round.id;
        }
      }
    }
    assert.deepEqual(seen, new Set(ids));
  } finally {
    globalThis.LH_CONFIG = previousConfig;
  }
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const bank = require('../js/gliax-r192-bank');

test('the registry contains exactly 58 cases with coherent versions, distinct surfaces and age coverage', () => {
  const ids = bank.getCaseIds();
  assert.equal(ids.length, 58);
  assert.equal(new Set(ids).size, 58);
  assert.throws(() => bank.getCase('CP00', 0));

  const coverage = {};
  const surfaces = new Set();
  for (const id of ids) {
    const item = bank.getCase(id, 'reference');
    assert.equal(item.id, id);
    assert.deepEqual(item, bank.getCase(id, 'reference'));
    assert.equal(item.cognitiveFingerprint, bank.getCase(id, 'another-seed').cognitiveFingerprint);
    assert.equal(item.contentVersion, 'r19.2-r1');
    assert.equal(item.gradingVersion, 'r19.2-r1.1');
    assert.match(item.surfaceFingerprint, /^[a-f0-9]{16}$/);
    assert.match(item.cognitiveFingerprint, /^[a-f0-9]{16}$/);
    assert.equal(Object.hasOwn(item.presentation, 'answerModel'), false);
    assert.ok(!surfaces.has(item.surfaceFingerprint), id);
    surfaces.add(item.surfaceFingerprint);

    const cell = [item.family, item.ageBand, item.level].join(':');
    coverage[cell] = (coverage[cell] ?? 0) + 1;
  }

  const expected = {};
  for (const family of ['CP', 'EC', 'IN', 'AR']) {
    for (const ageBand of ['early', 'junior', 'primary', 'middle', 'teen']) {
      if (family === 'AR' && ageBand === 'early') continue;
      for (const level of [1, 2, 3]) {
        expected[[family, ageBand, level].join(':')] = family === 'IN' && ageBand === 'junior' && level === 3 ? 2 : 1;
      }
    }
  }
  assert.deepEqual(coverage, expected);
  assert.equal(bank.gradeCase(bank.getCase('CP08', 1), 'leo').gradedCorrect, true);
  assert.equal(bank.gradeCase(bank.getCase('EC05', 1), {choice: 'met', evidence: ['source-b', 'source-a']}).gradedCorrect, true);
  assert.equal(bank.gradeCase(bank.getCase('IN-06 complete-data', 1), 'Sí, llego a las 16:50').gradedCorrect, true);
  const ar = bank.getCase('AR08', 1);
  assert.equal(bank.gradeCase(ar, {'event-1': 'act', 'event-2': null, 'event-4': null, 'event-5': 'act'}).gradedCorrect, true);
});

test('classic scripts reproduce the Node bank and need no persistence or network to handle an open response', () => {
  const unavailable = () => { throw new Error('R1 attempted storage or network access'); };
  const context = vm.createContext({TextEncoder, structuredClone, fetch: unavailable});
  for (const api of ['localStorage', 'sessionStorage', 'indexedDB']) {
    Object.defineProperty(context, api, {get: unavailable});
  }
  for (const file of ['gliax-r192', 'gliax-r192-cp', 'gliax-r192-ec', 'gliax-r192-in', 'gliax-r192-ar', 'gliax-r192-bank']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file + '.js'), 'utf8'), context, {filename: file + '.js'});
  }
  for (const id of bank.getCaseIds()) {
    assert.equal(JSON.stringify(context.GliaxR192Bank.getCase(id, 27)), JSON.stringify(bank.getCase(id, 27)), id);
  }
  const item = context.GliaxR192Bank.getCase('IN04', 3);
  const round = context.GliaxR192IN.startInformation(item);
  const synthetic = 'Texto libre sintético retenido solo en esta ronda.';
  round.showHint(synthetic);
  round.submitOpen('Hora de llegada');
  assert.equal(round.initialResponse(), synthetic);
  const summary = JSON.stringify(round.summary());
  assert.ok(summary.includes('uninterpretable'));
  assert.ok(summary.includes('sufficient'));
  assert.ok(!summary.includes(synthetic));
  assert.ok(!summary.includes('Hora de llegada'));
});

const test = require('node:test');
const assert = require('node:assert/strict');
const {ages, levels, candidates, summarize} = require('../js/gliax-r192-diversity');
const {evaluateRuleTrials, gradeRuleAction} = require('../js/gliax-r192-ar');

const pool = (ageBand, level, seed = 'fixture') => candidates({family: 'AR', ageBand, level, seed});

test('24 authored schedules expand existing AR cases without inflating contexts, rules or mechanisms', () => {
  const newCases = new Set();
  const mechanisms = new Set();
  for (const age of ages) for (const level of levels) {
    const entries = pool(age, level);
    if (age === 'early') {
      assert.deepEqual(entries, []);
      continue;
    }
    assert.deepEqual(entries, pool(age, level));
    assert.equal(entries.length, 3);
    const [reference, ...variants] = entries;
    assert.equal(summarize(entries).contexts, 1);
    assert.equal(summarize(entries).restrictions, 1);
    assert.equal(summarize(entries).mechanisms, 1);
    assert.equal(summarize(entries).surfaces, 3);
    assert.ok(summarize(entries).structures >= 2);
    mechanisms.add(reference.mechanism);
    for (const {id, item} of variants) {
      newCases.add(id);
      assert.equal(item.sourceId, reference.id);
      assert.equal(item.gradingVersion, reference.item.gradingVersion);
      assert.equal(item.presentation.prompt, reference.item.presentation.prompt);
      assert.deepEqual(item.answerModel.rule, reference.item.answerModel.rule);
      const events = evaluateRuleTrials(item);
      assert.equal(events.at(-1).changeEvent, false);
      assert.ok(events.every((event, index) => !event.changeEvent || !events[index + 1].changeEvent));
      assert.equal(item.presentation.events.filter(event => event.type === 'signal').length, events.filter(event => event.changeEvent).length);
      const trials = events.filter(event => !event.changeEvent);
      assert.ok(trials.length >= 3 && trials.length <= 7);
      assert.equal(trials.some(event => event.isNoGo), item.answerModel.measuresWithholding);
      assert.ok(new Set(trials.map(event => event.expectedAction)).size > 1);
      const responses = Object.fromEntries(trials.map(event => [event.id, event.expectedAction]));
      assert.equal(gradeRuleAction(item, responses).gradedCorrect, true);
      const first = trials[0];
      responses[first.id] = first.isNoGo ? 'A' : 'wait';
      assert.equal(gradeRuleAction(item, responses).gradedCorrect, false);
    }
  }
  assert.equal(newCases.size, 24);
  assert.equal(mechanisms.size, 6);
});

test('the added schedules exercise inversion, veto and non-alternating response patterns', () => {
  const actions = item => evaluateRuleTrials(item).map(event => event.expectedAction ?? null);
  assert.deepEqual(actions(pool('junior', 1)[1].item), ['act', 'act', 'wait', 'wait', 'act']);
  assert.deepEqual(actions(pool('junior', 1)[2].item), ['wait', 'wait', 'act', 'act', 'act']);
  assert.deepEqual(actions(pool('junior', 2)[1].item), ['wait', 'act', 'act', null, 'wait', 'act']);
  assert.deepEqual(actions(pool('primary', 2)[1].item), ['wait', 'A', 'A', 'wait', 'wait']);
  assert.deepEqual(actions(pool('teen', 3)[1].item), [null, 'wait', 'B', null, 'B', 'wait', null, 'A']);
});

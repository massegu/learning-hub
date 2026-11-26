const test = require('node:test');
const assert = require('node:assert/strict');
const {getRuleAction, evaluateRuleTrials, gradeRuleAction} = require('../js/gliax-r192-ar');

test('12 AR cases preserve the six mechanics, documented actions and age/level coverage', () => {
  const expected = [
    ['act', 'wait', 'act', 'wait', 'act'],
    ['act', 'wait', null, 'wait', 'act'],
    [null, 'act', 'wait', null, 'act', 'wait', 'wait'],
    ['A', 'B', 'wait', 'A', 'B'],
    ['A', 'wait', 'wait', 'A', 'wait'],
    ['A', 'wait', 'B', 'wait', 'A'],
    ['A', 'B', 'A'],
    [null, 'A', 'B', null, 'B', 'A', null, 'A'],
    ['A', 'wait', 'B', 'wait'],
    [null, 'A', null, 'A', 'B'],
    ['A', 'B', null, 'B', 'A', null, 'A'],
    [null, 'B', null, 'wait', 'B', null, 'A', 'wait']
  ];
  const mechanics = new Set();
  for (const [index, actions] of expected.entries()) {
    const id = 'AR' + String(index + 7).padStart(2, '0');
    const item = getRuleAction(id, 'reference');
    assert.deepEqual(item, getRuleAction(id, 'reference'));
    assert.equal(item.ageBand, ['junior', 'primary', 'middle', 'teen'][Math.floor(index / 3)]);
    assert.equal(item.level, index % 3 + 1);
    mechanics.add(item.mechanic);
    const events = evaluateRuleTrials(item);
    assert.deepEqual(events.map(event => event.expectedAction ?? null), actions, id);
    assert.ok(item.presentation.events.every(event => event.label && !Object.hasOwn(event, 'expectedAction')));
    const submitted = Object.fromEntries(events.map(event => [event.id, event.changeEvent ? 'unused' : event.expectedAction]));
    const result = gradeRuleAction(item, submitted);
    assert.equal(result.gradedCorrect, true);
    assert.equal(result.metrics.scored, actions.filter(action => action !== null).length);
    for (const key of ['commissions', 'correctWaits']) assert.equal(Object.hasOwn(result.metrics, key), actions.includes('wait'));
  }
  assert.equal(mechanics.size, 6);
  assert.throws(() => getRuleAction('AR06', 'reference'));
});

test('AR tracks changes without grading signals and differentiates waits, omissions and affected trials', () => {
  const ar08 = getRuleAction('AR08', 0);
  const events = evaluateRuleTrials(ar08);
  assert.deepEqual(events.filter(event => event.afterChange).map(event => event.id), ['event-4']);
  const grade = gradeRuleAction(ar08, {'event-1': null, 'event-2': 'act', 'event-3': 'act', 'event-4': null, 'event-5': 'A'});
  assert.deepEqual(grade.metrics, {scored: 4, correct: 1, omissions: 1, wrongButton: 1, postChangeErrors: 0, commissions: 1, correctWaits: 1});
  assert.deepEqual(gradeRuleAction(ar08, {'event-1': 'act'}), {status: 'pending_review'});

  const ar18 = getRuleAction('AR18', 0);
  const vetoed = evaluateRuleTrials(ar18).filter(event => event.stimulus?.border);
  assert.ok(vetoed.every(event => event.isNoGo && event.interferenceType === 'veto'));
});

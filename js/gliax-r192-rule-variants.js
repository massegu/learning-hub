(function (root) {
  'use strict';

  const {fingerprint} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;
  const {evaluateRuleTrials} = typeof module !== 'undefined' ? require('./gliax-r192-ar') : root.GliaxR192AR;

  // Trial indices refer to the recovered R1 stimuli of the same age and level.
  // Keep authored schedules explicit so the cues and level load can be reviewed.
  const schedules = {
    AR07: [[0, 2, 1, 3, 4], [1, 3, 0, 4, 2]],
    AR08: [[1, 0, 0, 2, 3, 4], [0, 1, 2, 4, 3, 3]],
    AR09: [[0, 2, 1, 3, 5, 4, 6], [3, 4, 4, 6, 0, 2, 1]],
    AR10: [[2, 1, 0, 2, 4, 3], [0, 3, 2, 1, 4]],
    AR11: [[1, 0, 3, 2, 4], [2, 4, 1, 0, 3, 1]],
    AR12: [[3, 2, 0, 1, 4], [0, 4, 1, 3, 2]],
    AR13: [[1, 1, 2, 0], [2, 0, 1, 1, 2]],
    AR14: [[0, 2, 3, 5, 4, 1, 6, 7], [0, 1, 2, 3, 4, 6, 7, 5]],
    AR15: [[1, 0, 2, 3, 0], [3, 1, 2, 0]],
    AR16: [[0, 1, 3, 2, 4, 3], [2, 4, 3, 0, 3, 1]],
    AR17: [[0, 1, 2, 4, 5, 6, 1], [1, 3, 2, 4, 3, 1, 5, 6]],
    AR18: [[0, 7, 1, 2, 4, 3, 5, 6], [2, 3, 4, 0, 6, 7, 2, 4]]
  };

  function demandProfile(trials) {
    const blocks = [];
    let block;
    let previous;
    let run = 0;
    for (const trial of trials) {
      if (trial.changeEvent) {
        block = null;
        previous = undefined;
        run = 0;
        continue;
      }
      if (!block) {
        block = {rule: trial.activeRule, reverse: trial.reversed, trials: 0, waits: 0, vetoes: 0, conflicts: 0, run: 0};
        blocks.push(block);
      }
      block.trials++;
      if (trial.isNoGo) block.waits++;
      if (trial.interferenceType === 'veto') block.vetoes++;
      else if (trial.interferenceType) block.conflicts++;
      run = trial.expectedAction === previous ? run + 1 : 1;
      block.run = Math.max(run, block.run);
      previous = trial.expectedAction;
    }
    return blocks;
  }

  function expandRules(reference) {
    const schedule = Object.hasOwn(schedules, reference.id) ? schedules[reference.id] : [];
    if (!schedule.length) return [];
    const original = fingerprint(demandProfile(evaluateRuleTrials(reference)));
    return schedule.map((indices, variant) => {
      const item = structuredClone(reference);
      item.id = reference.id + '-r4-' + (variant + 1);
      item.sourceId = reference.id;
      item.contentVersion = 'r19.2-r4-ar';
      item.answerModel.stimuli = indices.map(index => structuredClone(reference.answerModel.stimuli[index]));
      item.presentation.events = indices.map((index, position) => ({
        ...structuredClone(reference.presentation.events[index]), id: 'event-' + (position + 1)
      }));
      const profile = fingerprint(demandProfile(evaluateRuleTrials(item)));
      if (profile !== original) item.cognitiveFingerprint = fingerprint([reference.cognitiveFingerprint, profile]);
      const visible = item.presentation.events.map(({type, label}) => [type, label]);
      item.surfaceFingerprint = fingerprint([item.presentation.prompt, visible]);
      return item;
    });
  }

  const api = {expandRules};
  root.GliaxR192RuleVariants = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

(function (root) {
  'use strict';

  const cp = typeof module !== 'undefined' ? require('./gliax-r192-cp') : root.GliaxR192CP;
  const ec = typeof module !== 'undefined' ? require('./gliax-r192-ec') : root.GliaxR192EC;
  const info = typeof module !== 'undefined' ? require('./gliax-r192-in') : root.GliaxR192IN;
  const ar = typeof module !== 'undefined' ? require('./gliax-r192-ar') : root.GliaxR192AR;

  const registry = new Map();
  function register(family, first, last, get, grade) {
    for (let number = first; number <= last; number++) {
      registry.set(family + String(number).padStart(2, '0'), {get, grade});
    }
  }
  register('CP', 1, 15, cp.getChangePlan, cp.gradeChangePlan);
  register('EC', 1, 15, ec.getContradiction, ec.gradeContradiction);
  register('IN', 1, 15, info.getInformation, info.gradeOpenInformation);
  registry.set('IN-06 complete-data', {get: info.getInformation, grade: info.gradeOpenInformation});
  register('AR', 7, 18, ar.getRuleAction, ar.gradeRuleAction);

  function getCaseIds() {
    return [...registry.keys()];
  }

  function getCase(id, seed) {
    const entry = registry.get(id);
    if (!entry) throw new RangeError('Unknown R19.2 reference case');
    return entry.get(id, seed);
  }

  function gradeCase(item, response) {
    const entry = registry.get(item.id);
    if (!entry) throw new RangeError('Unknown R19.2 reference case');
    return entry.grade(item, response);
  }

  const api = {getCaseIds, getCase, gradeCase};
  root.GliaxR192Bank = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

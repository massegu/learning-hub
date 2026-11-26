(function (root) {
  'use strict';
  const {fingerprint, outcome, shuffled} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;
  const curriculum = typeof module !== 'undefined' ? require('./curriculum') : root.Curriculum;

  const ageBands = ['early', 'junior', 'primary', 'middle', 'teen'];
  const families = ['planning', 'constraints', 'goal-change', 'supervision'];
  const contentVersion = 'r19.2-r2';
  const gradingVersion = 'r19.2-r2.1';
  const registered = new WeakMap();
  const sourcePools = new Map();
  const text = value => ({type: 'text', text: value});
  const table = (header, rows) => ({type: 'table', header: true, rows: [header, ...rows]});

  function validateRequest({ageBand, level, seed}) {
    if (!ageBands.includes(ageBand) || ![1, 2, 3].includes(level) ||
        (typeof seed !== 'string' && !Number.isSafeInteger(seed))) {
      throw new TypeError('A GLIAX age band, level 1–3 and deterministic seed are required');
    }
  }

  function sourceItems({ageBand, level}, mechanic) {
    const key = ageBand + ':' + level;
    if (!sourcePools.has(key)) sourcePools.set(key, curriculum.pool(ageBand, 'executive', level));
    return sourcePools.get(key).filter(item => item.mechanic === mechanic);
  }

  function createItem(request, family, key, structure, presentation, answerModel, legacy, sourceId) {
    const {ageBand, level, seed} = request;
    validateRequest(request);
    if (!families.includes(family) || !/^[a-z0-9-]{1,36}$/.test(key)) throw new TypeError('Invalid executive template');
    const id = ['r192', family, ageBand, level, key].join('-');
    const item = {
      id, contentKey: id, domain: 'executive', mechanic: 'executive_r192_' + family.replace('-', '_'),
      family, ageBand, level, contentVersion, gradingVersion, sourceId,
      presentation: structuredClone(presentation), answerModel: structuredClone(answerModel),
      cognitiveFingerprint: fingerprint([family, structure]),
      surfaceFingerprint: fingerprint(presentation), ...structuredClone(legacy)
    };
    registered.set(item, id);
    return item;
  }

  function chooseItem(items, request, family) {
    validateRequest(request);
    if (!items.length) return null;
    return shuffled(items, request.seed, 'r2:' + family + ':template')[0];
  }

  function responseEvent(item, result, support = 'spontaneous') {
    const activityId = registered.get(item);
    if (!activityId || activityId !== item.id || !['spontaneous', 'hint', 'options'].includes(support)) {
      throw new TypeError('Invalid executive response event');
    }
    return {activityId, contentVersion, gradingVersion, support, ...outcome(result.status)};
  }

  const api = {text, table, sourceItems, createItem, chooseItem, validateRequest, responseEvent};
  root.GliaxR192Executive = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

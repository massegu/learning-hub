(function (root) {
  'use strict';

  const contentVersion = 'r19.2-r1';
  const gradingVersion = 'r19.2-r1.1';
  const ageBands = ['early', 'junior', 'primary', 'middle', 'teen'];
  const statuses = ['correct', 'incorrect', 'partial', 'uninterpretable', 'pending_review'];
  const supportLevels = ['spontaneous', 'hint', 'options'];
  const modes = [
    'single_choice', 'multi_valid_choice', 'sequence_constraints', 'constraint_solver',
    'source_relation', 'open_concepts', 'trial_state_machine', 'reasoned_decision'
  ];

  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value !== null && typeof value === 'object') {
      return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
    }
    if (value === undefined || (typeof value === 'number' && !Number.isFinite(value))) {
      throw new TypeError('Expected JSON data for R19.2 fingerprint');
    }
    return JSON.stringify(typeof value === 'string' ? value.normalize('NFC') : value);
  }

  function fingerprint(value) {
    let hash = 0xcbf29ce484222325n;
    for (const byte of new TextEncoder().encode(canonical(value))) {
      hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 0x100000001b3n);
    }
    return hash.toString(16).padStart(16, '0');
  }

  function shuffled(values, seed, channel) {
    const result = [...values];
    let state = BigInt('0x' + fingerprint([seed, channel]));
    for (let i = result.length - 1; i > 0; i--) {
      state = BigInt.asUintN(64, state * 6364136223846793005n + 1442695040888963407n);
      const j = Number((state >> 32n) % BigInt(i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function validateId(id) {
    return typeof id === 'string' && /^(?:CP(?:0[1-9]|1[0-5])|EC(?:0[1-9]|1[0-5])|IN(?:0[1-9]|1[0-5])|IN-06 complete-data|AR(?:0[7-9]|1[0-8]))$/.test(id);
  }

  function createItem(template, seed) {
    const {id, ageBand, level, mechanic, construct, surface, structure, answerModel} = template;
    const family = id?.slice(0, 2);
    if (!validateId(id) || !ageBands.includes(ageBand) || ![1, 2, 3].includes(level) ||
        (family === 'AR' && ageBand === 'early') || !mechanic || !construct ||
        !surface || !structure || !modes.includes(answerModel?.mode)) {
      throw new TypeError('Invalid R19.2 activity template');
    }
    if (typeof seed !== 'string' && !Number.isSafeInteger(seed)) {
      throw new TypeError('Expected a string or integer seed');
    }

    const presentation = structuredClone(surface);
    if (presentation.options) presentation.options = shuffled(presentation.options, seed, id + ':options');
    const {options, ...visible} = presentation;
    if (options) visible.options = options.map(({label}) => label);
    return {
      id, family, ageBand, level, mechanic, construct, seed, contentVersion, gradingVersion,
      presentation, answerModel: structuredClone(answerModel),
      cognitiveFingerprint: fingerprint([family, mechanic, construct, structure]),
      surfaceFingerprint: fingerprint(visible)
    };
  }

  function gradeChoice(answerModel, optionId) {
    if (!['single_choice', 'multi_valid_choice'].includes(answerModel.mode)) {
      throw new TypeError('Expected a choice answer model');
    }
    return outcome(answerModel.validIds.includes(optionId) ? 'correct' : 'incorrect');
  }

  function outcome(status) {
    if (!statuses.includes(status)) throw new TypeError('Invalid R19.2 grading status');
    if (status === 'correct') return {status, gradedCorrect: true};
    if (status === 'incorrect') return {status, gradedCorrect: false};
    return {status};
  }

  function responseEvent(item, result, support) {
    if (!validateId(item.id) || item.contentVersion !== contentVersion ||
        item.gradingVersion !== gradingVersion || !supportLevels.includes(support)) {
      throw new TypeError('Invalid R19.2 response event');
    }
    return {
      activityId: item.id, contentVersion, gradingVersion, support, ...outcome(result.status)
    };
  }

  const api = {createItem, shuffled, fingerprint, gradeChoice, outcome, responseEvent};
  root.GliaxR192 = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

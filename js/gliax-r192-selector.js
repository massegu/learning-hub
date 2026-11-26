(function (root) {
  'use strict';

  const {fingerprint} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;
  const {families, ages, levels} = typeof module !== 'undefined' ? require('./gliax-r192-diversity') : root.GliaxR192Diversity;

  const windowSize = 12;
  const penalties = Object.freeze({id: 8, structure: 6, context: 3, mechanism: 2, restrictions: 1, surface: 2});
  const fields = Object.keys(penalties);
  const groupFields = ['structure', 'mechanism', 'restrictions', 'context'];
  const caseFields = ['id', 'surface', 'context'];

  function slotKey({family, ageBand, level}) {
    return families.includes(family) && ages.includes(ageBand) && levels.includes(level)
      ? [family, ageBand, level].join(':') : null;
  }

  function presentationSeed(seed, query, turn) {
    return fingerprint([seed, slotKey(query), 'presentation', turn]);
  }

  function repeatsCycle(entry, recent, length) {
    if (recent.length < 2 * length - 1 || entry.id !== recent[length - 1].id) return false;
    return recent.slice(0, length - 1).every((previous, index) => previous.id === recent[index + length].id);
  }

  function unit(seed, slot, turn) {
    return Number(BigInt('0x' + fingerprint([seed, slot, turn])) >> 11n) / 2 ** 53;
  }

  function weightFor(entry, recent, dimensions) {
    return dimensions.reduce((weight, field) => {
      const exposure = recent.reduce((sum, previous, index) =>
        previous[field] === entry[field] ? sum + 0.7 ** index : sum, 0);
      return weight / (1 + penalties[field] * exposure);
    }, 1);
  }

  function weighted(values, weightOf, roll) {
    const weights = values.map(weightOf);
    let threshold = roll * weights.reduce((sum, weight) => sum + weight, 0);
    for (const [index, value] of values.entries()) {
      threshold -= weights[index];
      if (threshold < 0) return value;
    }
    return values.at(-1);
  }

  function avoidImmediateStructure(entries, previous) {
    if (!previous) return entries;
    const differentStructure = entries.filter(entry => entry.structure !== previous.structure);
    const byStructure = differentStructure.length ? differentStructure : entries;
    const differentMechanism = byStructure.filter(entry => entry.mechanism !== previous.mechanism);
    const byMechanism = differentMechanism.length ? differentMechanism : byStructure;
    const differentContext = byMechanism.filter(entry => entry.context !== previous.context);
    return differentContext.length ? differentContext : byMechanism;
  }

  function createSelector(seed, {prioritizeStructuralDiversity = false} = {}) {
    if (typeof seed !== 'string' && !Number.isSafeInteger(seed)) throw new TypeError('Invalid selection seed');
    const sessions = new Map();

    function next(query, candidates) {
      const key = slotKey(query);
      if (!key) return null;
      const {family, ageBand, level} = query;
      const state = sessions.get(key) ?? {turn: 0, recent: []};
      const unique = new Map();
      for (const entry of candidates) {
        if (entry.family === family && entry.ageBand === ageBand && entry.level === level && !unique.has(entry.id)) {
          unique.set(entry.id, entry);
        }
      }
      const all = [...unique.values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
      if (!all.length) return null;

      const different = all.filter(entry => entry.id !== state.recent[0]?.id);
      const alternatives = different.length ? different : all;
      const noncyclic = all.length >= 3 ? alternatives.filter(entry =>
        !repeatsCycle(entry, state.recent, 2) && !repeatsCycle(entry, state.recent, 3)) : alternatives;
      const eligible = prioritizeStructuralDiversity
        ? avoidImmediateStructure(alternatives, state.recent[0])
        : alternatives;
      const noncyclicSet = new Set(noncyclic);
      const diverseNoncyclic = eligible.filter(entry => noncyclicSet.has(entry));
      const selectionPool = diverseNoncyclic.length ? diverseNoncyclic : eligible;

      const groups = new Map();
      for (const entry of selectionPool) {
        if (!groups.has(entry.structure)) groups.set(entry.structure, []);
        groups.get(entry.structure).push(entry);
      }
      const group = weighted([...groups.values()], entries =>
        entries.reduce((sum, entry) => sum + weightFor(entry, state.recent, groupFields), 0) / entries.length,
      unit(seed, key + ':structure', state.turn));
      const selected = weighted(group, entry => weightFor(entry, state.recent, caseFields),
        unit(seed, key + ':case', state.turn));
      const record = Object.fromEntries(fields.map(field => [field, selected[field]]));
      state.recent = [record, ...state.recent].slice(0, windowSize);
      state.turn++;
      sessions.set(key, state);
      return selected;
    }

    function recent(query) {
      return (sessions.get(slotKey(query))?.recent ?? []).map(entry => ({...entry}));
    }

    return {next, recent};
  }

  const api = {createSelector, presentationSeed, windowSize, penalties};
  root.GliaxR192Selector = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

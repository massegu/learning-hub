'use strict';

const {candidates} = require('../js/gliax-r192-diversity');
const {createSelector, presentationSeed} = require('../js/gliax-r192-selector');
const {gradeCase} = require('../js/gliax-r192-bank');
const {gradeConstraints} = require('../js/gliax-r192-constraints');

const queries = [
  {family: 'CP', ageBand: 'early', level: 1},
  {family: 'IN', ageBand: 'junior', level: 3},
  {family: 'AR', ageBand: 'junior', level: 1},
  {family: 'constraints', ageBand: 'primary', level: 2},
  {family: 'goal-change', ageBand: 'primary', level: 2},
  {family: 'supervision', ageBand: 'middle', level: 2}
];
const runs = 32;
const rounds = 48;
const reports = [];
for (const query of queries) {
  const pool = candidates({...query, seed: 'inventory'});
  const counts = new Map();
  const mechanisms = {};
  const structures = {};
  const distributionByPosition = {};
  let sameId = 0;
  let sameStructure = 0;
  let cycles2 = 0;
  let cycles3 = 0;
  for (let run = 0; run < runs; run++) {
    const seed = 'run:' + run;
    const selector = createSelector(seed);
    const history = [];
    for (let round = 0; round < rounds; round++) {
      const roundPool = candidates({...query, seed: presentationSeed(seed, query, round)});
      const entry = selector.next(query, roundPool);
      if (!entry) continue;
      const previous = history.at(-1);
      if (entry.id === previous?.id) sameId++;
      if (entry.structure === previous?.structure) sameStructure++;
      history.push(entry);
      for (const size of [2, 3]) {
        const window = history.slice(-2 * size);
        if (window.length === 2 * size && new Set(window.slice(0, size).map(candidate => candidate.id)).size === size &&
            window.slice(0, size).every((caseEntry, index) => caseEntry.id === window[index + size].id)) {
          if (size === 2) cycles2++;
          else cycles3++;
        }
      }
      counts.set(entry.id, (counts.get(entry.id) ?? 0) + 1);
      mechanisms[entry.mechanism] = (mechanisms[entry.mechanism] ?? 0) + 1;
      structures[entry.structure] = (structures[entry.structure] ?? 0) + 1;
      const {item} = entry;
      const options = query.family === 'CP' ? item.presentation.options?.map(option => option.id) : item.opts;
      const grade = query.family === 'CP' ? gradeCase : query.family === 'constraints' ? gradeConstraints : null;
      if (options && grade) {
        const valid = options.map((option, position) => grade(item, option).gradedCorrect ? position : -1).filter(position => position >= 0);
        if (valid.length === 1) {
          const positions = distributionByPosition[options.length] ??= {};
          positions[valid[0]] = (positions[valid[0]] ?? 0) + 1;
        }
      }
    }
  }
  reports.push({
    query, runs, rounds, selections: [...counts.values()].reduce((a, b) => a + b, 0),
    available: pool.length, reached: counts.size, frequency: [Math.min(...counts.values()), Math.max(...counts.values())],
    sameId, sameStructure, cycles2, cycles3, mechanisms, structures, distributionByPosition
  });
}
console.log(JSON.stringify(reports, null, 2));

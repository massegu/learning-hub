'use strict';

const {candidates} = require('../js/gliax-r192-diversity');
const {createSelector} = require('../js/gliax-r192-selector');
const {gradeCase} = require('../js/gliax-r192-bank');

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
    const selector = createSelector('run:' + run);
    const history = [];
    for (let round = 0; round < rounds; round++) {
      const entry = selector.next(query, pool);
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
      if (query.family === 'CP') {
        const item = candidates({...query, seed: 'run:' + run + ':turn:' + round}).find(candidate => candidate.id === entry.id).item;
        item.presentation.options.forEach((option, position) => {
          if (gradeCase(item, option.id).gradedCorrect) distributionByPosition[position] = (distributionByPosition[position] ?? 0) + 1;
        });
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

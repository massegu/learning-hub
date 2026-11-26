'use strict';

const {ages, levels, families, candidates, summarize} = require('../../js/gliax-r192-diversity');
const {createSelector} = require('../../js/gliax-r192-selector');

const dimensions = ['id', 'mechanism', 'structure', 'context', 'surface'];
const labels = ['R19.2', 'R19.3'];
const simulations = Object.fromEntries(labels.map(label => [label, {
  transitions: 0, avoidable: Object.fromEntries(dimensions.map(name => [name, 0])),
  repeats: Object.fromEntries(dimensions.map(name => [name, 0]))
}]));
const slots = [];
for (const family of families) {
  for (const ageBand of ages) {
    for (const level of levels) {
      const query = {family, ageBand, level};
      const pool = candidates({...query, seed: 'r193-inventory'});
      slots.push({...query, ...summarize(pool), approvedNewCases: 0});
      if (pool.length < 2) continue;
      for (const [index, label] of labels.entries()) {
        const selector = createSelector('r193-comparison', {prioritizeStructuralDiversity: index === 1});
        const summary = simulations[label];
        let previous = selector.next(query, pool);
        for (let i = 0; i < 120; i++) {
          const current = selector.next(query, pool);
          summary.transitions++;
          for (const field of dimensions) {
            if (previous[field] !== current[field]) continue;
            summary.repeats[field]++;
            if (pool.some(entry => entry[field] !== previous[field])) summary.avoidable[field]++;
          }
          previous = current;
        }
      }
    }
  }
}
console.log(JSON.stringify({slots, simulations, publicationNote:
  'Inventario técnico por celda. Las huellas y las variantes no constituyen aprobación editorial. El estímulo se mide a semilla de presentación fija.'
}, null, 2));

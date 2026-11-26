'use strict';

const {ages, levels, families, candidates, summarize} = require('../js/gliax-r192-diversity');
const inventorySeed = 'r4-inventory';
const includeVariants = !process.argv.includes('--reference-only');
const matrix = [];
const ageTotals = [];
for (const ageBand of ages) {
  const byFamily = Object.fromEntries(families.map(family => [family, []]));
  for (const level of levels) {
    const row = {ageBand, level};
    for (const family of families) {
      const entries = candidates({ageBand, level, family, seed: inventorySeed, includeVariants});
      byFamily[family].push(...entries);
      row[family] = summarize(entries);
    }
    matrix.push(row);
  }
  ageTotals.push({ageBand, ...Object.fromEntries(families.map(family => [family, summarize(byFamily[family])]))});
}

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify({inventorySeed, matrix, ageTotals}, null, 2) + '\n');
} else {
  const header = labels => '| ' + labels.join(' | ') + ' |';
  const cell = counts => ['candidates', 'surfaces', 'contexts', 'restrictions', 'structures', 'mechanisms']
    .map(key => counts[key]).join('/');
  const print = (rows, columns) => {
    console.log(header([...columns, ...families]));
    console.log(header([...columns, ...families].map(() => '---')));
    for (const row of rows) {
      console.log(header([...columns.map(key => row[key]), ...families.map(family => cell(row[family]))]));
    }
  };
  console.log('Cada celda indica candidatos / estímulos / contextos / perfiles de restricciones / estructuras / mecanismos.');
  console.log('Semilla del inventario: `' + inventorySeed + '`. Las filas sin oferta se muestran como cero.\n');
  print(matrix, ['ageBand', 'level']);
  console.log('\nTotal por edad, deduplicado entre los tres niveles.\n');
  print(ageTotals, ['ageBand']);
}

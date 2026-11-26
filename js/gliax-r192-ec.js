(function (root) {
  'use strict';
  const {createItem, outcome, shuffled} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;

  const ages = ['early', 'junior', 'primary', 'middle', 'teen'];
  const relation = (subject, window, values, extra = {}) => ({kind: 'claims', subject, window, values, ...extra});
  const limit = (operation, threshold, quantities, kind = 'requirement') => ({kind, operation, threshold, quantities});
  const options = (keys, labels) => keys.map((id, index) => ({id, label: labels[index]}));
  const cases = [
    ['¿Está todo preparado?', ['La lista pide tres lápices.', 'En la caja hay dos lápices.'], limit('minimum', 3, [2]),
      options(['violated', 'met', 'unknown'], ['Falta un lápiz', 'Están todos los lápices', 'No sabemos cuántos hay'])],
    ['¿Dicen lo mismo las dos notas del juego de hoy?', ['El juego empieza a las 11:00.', 'El juego empieza a las 12:00.'], relation('same', 'same', [660, 720]),
      options(['direct_conflict', 'compatible', 'update_over_time'], ['Dan dos horas distintas para el mismo juego', 'Dan la misma hora para el juego', 'Una nota cambia la hora anterior']),
      'Hoy valen las dos notas.'],
    ['¿Pueden ser verdad las dos notas?', ['La botella azul está llena.', 'La botella roja está vacía.'], relation('different', 'same', ['full', 'empty']),
      options(['compatible', 'direct_conflict', 'insufficient_evidence'], ['Sí, hablan de dos botellas', 'No, hablan de una sola botella', 'No sabemos de qué botella habla cada nota']),
      'Las botellas están en la misma mesa.'],
    ['¿Qué indican los dos avisos vigentes de esta misma salida?', ['La salida es a las 9:00.', 'La salida es a las 9:30.'], relation('same', 'same', [540, 570]),
      options(['direct_conflict', 'update_over_time', 'compatible'], ['Dan horas diferentes para la misma salida', 'El segundo aviso cambia la hora anterior', 'Hablan de salidas diferentes'])],
    ['¿El préstamo cumple la norma?', ['Se pueden llevar como máximo tres libros.', 'Vas a pedir prestados dos libros.'], limit('maximum', 3, [2]),
      options(['met', 'violated', 'unknown'], ['Sí, se permiten dos libros', 'No, deben ser exactamente tres', 'No, falta confirmar el límite']),
      'El carné está vigente.'],
    ['¿Pueden formarse los equipos tal como se anuncia, sin repetir a nadie?', ['Se han apuntado 12 participantes.', 'Se anuncian cuatro equipos de cuatro personas.'], limit('exact', 12, [4, 4, 4, 4], 'inference'),
      options(['inferred_conflict', 'compatible', 'insufficient_evidence'], ['No, con esas plazas no alcanzan los participantes', 'Sí, se pueden llenar todos los equipos', 'No se puede saber sin conocer los nombres']),
      'Los equipos jugarán en la misma pista.'],
    ['¿El plan de entrega respeta la instrucción?', ['Piden entregar únicamente un PDF.', 'El grupo enviará la presentación sin convertir.'], {kind: 'format', expected: 'PDF', actual: 'presentation'},
      options(['violated', 'met', 'unknown'], ['No respeta el formato de entrega', 'Sí, cualquier presentación sirve', 'Depende de quién envíe el fichero'])],
    ['¿Cómo se relacionan estas notas sobre el entrenamiento?', ['El día habitual es el miércoles.', 'Esta semana pasa al jueves.'], relation('same', 'different', ['wed', 'thu'], {updated: true}),
      options(['update_over_time', 'direct_conflict', 'insufficient_evidence'], ['La nota de esta semana cambia el día habitual', 'Las dos fijan días incompatibles para esta semana', 'Falta saber si hablan del mismo entrenamiento']),
      'El entrenamiento es del mismo grupo.'],
    ['¿Qué puedes concluir al comparar los informes?', ['Informe A: 100 ml.', 'Informe B: 150 ml.'], relation('unknown', 'same', [100, 150]),
      options(['insufficient_evidence', 'direct_conflict', 'update_over_time'], ['Falta saber si se refieren a la misma prueba', 'Los dos informes se contradicen', 'El segundo actualiza necesariamente al primero']),
      'Los dos informes usan mililitros.'],
    ['¿Qué relación hay entre la confirmación y el cobro para el mismo pedido y las mismas condiciones?', ['La confirmación dice «envío gratis».', 'El cobro incluye 4 € de envío.'], relation('same', 'same', [0, 4], {alsoCompliance: true}),
      options(['direct_conflict', 'violated', 'compatible'], ['La confirmación y el cargo no coinciden', 'El cobro incumple la condición de envío', 'El cargo es compatible con el envío gratuito'])],
    ['¿Qué significa el mensaje del miércoles sobre el encuentro?', ['Lunes: nos reunimos el sábado.', 'Miércoles: finalmente nos reunimos el domingo.'], relation('same', 'different', ['sat', 'sun'], {updated: true}),
      options(['update_over_time', 'direct_conflict', 'compatible'], ['Actualiza la fecha anterior', 'Deja dos fechas vigentes e incompatibles', 'Describe otro encuentro distinto']),
      'Ambos mensajes son del mismo grupo.'],
    ['¿Pueden entrar todos a la vez sin superar el aforo?', ['Aforo máximo: 20 personas, incluidos acompañantes.', 'Han confirmado 18 alumnos y 5 acompañantes.'], limit('maximum', 20, [18, 5], 'inference'),
      options(['inferred_conflict', 'compatible', 'insufficient_evidence'], ['El total supera el aforo', 'El total cabe en el aforo', 'Falta saber si se incluye a los acompañantes']),
      'La entrada simultánea está prevista para las 17:00.'],
    ['¿Qué puedes afirmar del plazo a partir de estas comunicaciones vigentes de la misma convocatoria?', ['Plazo: viernes a las 18:00.', 'Plazo: viernes a las 17:00.'], relation('same', 'same', [1080, 1020]),
      options(['direct_conflict', 'update_over_time', 'compatible'], ['Hay dos plazos incompatibles y hay que confirmarlo', 'Las 17:00 sustituyen automáticamente a las 18:00', 'Las dos horas son compatibles como plazo único'])],
    ['¿Pueden ser ciertas a la vez las dos condiciones de cancelación?', ['Tarifa A: se puede cancelar hasta 48 h antes.', 'Tarifa B: se puede cancelar hasta 24 h antes.'], relation('different', 'same', [48, 24]),
      options(['compatible', 'direct_conflict', 'insufficient_evidence'], ['Sí, corresponden a tarifas distintas', 'No, la cancelación debe tener el mismo plazo', 'Falta saber si las dos condiciones se aplican a la misma tarifa']),
      'Las dos tarifas son para el mismo alojamiento.'],
    ['¿Es coherente decir que se cubre todo sin financiación extra?', ['Presupuesto máximo: 350 €. Se afirma que cubre todos los gastos.', 'Gastos obligatorios: 120 €, 190 € y 65 €.'], limit('maximum', 350, [120, 190, 65], 'inference'),
      options(['inferred_conflict', 'compatible', 'insufficient_evidence'], ['Los gastos superan el presupuesto', 'Los gastos caben en el presupuesto', 'Falta saber qué gastos son obligatorios']),
      'El pago se hará en una sola transferencia.']
  ];

  function classify(facts) {
    if (facts.kind === 'claims') {
      if (facts.subject === 'unknown') return {classification: 'insufficient_evidence'};
      if (facts.updated) return {classification: 'compatible', subtype: 'update_over_time'};
      if (facts.subject === 'different' || facts.window === 'different' || facts.values[0] === facts.values[1]) {
        return {classification: 'compatible'};
      }
      return {classification: 'direct_conflict'};
    }
    if (facts.kind === 'format') return {classification: 'constraint_mismatch', fulfilled: facts.expected === facts.actual};
    const total = facts.quantities.reduce((sum, quantity) => sum + quantity, 0);
    const difference = total - facts.threshold;
    const fulfilled = facts.operation === 'minimum' ? difference >= 0 :
      facts.operation === 'maximum' ? difference <= 0 : difference === 0;
    if (facts.kind === 'inference') {
      return {classification: fulfilled ? 'compatible' : 'inferred_conflict', difference};
    }
    return {classification: 'constraint_mismatch', fulfilled, difference};
  }

  const casesWithSupportingContext = new Set(['EC02', 'EC08', 'EC11']);

  function getContradiction(id, seed) {
    if (typeof id !== 'string' || !/^EC(?:0[1-9]|1[0-5])$/.test(id)) throw new RangeError('Unknown EC case');
    const index = Number(id.slice(2)) - 1;
    const [prompt, statements, facts, choices, extra] = cases[index];
    const level = index % 3 + 1;
    const rows = statements.map((text, index) => ({id: index ? 'source-b' : 'source-a', text}));
    if (extra) rows.push({id: 'context', text: extra});
    const surface = {prompt, rows: shuffled(rows, seed, id + ':rows'), options: choices, evidenceRequired: level > 1};
    if (id === 'EC01') surface.visual = {label: 'Lista y caja de lápices', groups: [3, 2], unit: 'lápiz'};
    if (id === 'EC06') surface.visual = {label: 'Plazas por equipo', groups: [4, 4, 4, 4], unit: 'plaza'};
    return createItem({
      id, ageBand: ages[Math.floor(index / 3)], level, mechanic: facts.kind, construct: 'consistencyChecking',
      surface, structure: {kind: facts.kind, subject: facts.subject ?? null, window: facts.window ?? null, operation: facts.operation ?? null, updated: Boolean(facts.updated)},
      answerModel: {mode: 'source_relation', facts, evidenceIds: ['source-a', 'source-b'],
        optionalEvidenceIds: casesWithSupportingContext.has(id) ? ['context'] : []}
    }, seed);
  }

  function gradeContradiction(item, response) {
    const model = item.answerModel;
    const relation = classify(model.facts);
    const key = relation.subtype ?? (relation.classification === 'constraint_mismatch' ? (relation.fulfilled ? 'met' : 'violated') : relation.classification);
    const correct = response?.choice === key || (model.facts.alsoCompliance && response?.choice === 'violated');
    if (!correct) return {...outcome('incorrect'), ...relation};
    const evidence = response.evidence;
    const allowed = [...model.evidenceIds, ...(model.optionalEvidenceIds ?? [])];
    const sufficient = Array.isArray(evidence) && new Set(evidence).size === evidence.length &&
      model.evidenceIds.every(id => evidence.includes(id)) && evidence.every(id => allowed.includes(id));
    return {...outcome(item.presentation.evidenceRequired && !sufficient ? 'partial' : 'correct'), ...relation};
  }

  const api = {getContradiction, gradeContradiction};
  root.GliaxR192EC = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

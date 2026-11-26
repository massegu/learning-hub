const test = require('node:test');
const assert = require('node:assert/strict');
const {getInformation, gradeOpenInformation, startInformation} = require('../js/gliax-r192-in');

test('16 cases offer open prompts first and reorder optional clues without changing their meaning', () => {
  const answers = [
    'Cuántos niños hay', 'Niños y pinceles', 'Si está abierto ahora', 'A qué hora llego',
    'Falta una entrada', 'Depende del tiempo de viaje', 'El tiempo de viaje desde clase',
    'Qué tareas faltan y quién tiene tiempo para hacerlas', 'Si hay que inscribirse y si quedan plazas',
    'Si quedan plazas en esa sesión', 'Cuánto cuesta cada uno y a qué hora llega', 'Las fuentes y el PDF',
    'Disponibilidad en ambas noches', 'El coste del transporte y si cabe en el margen',
    'Si el horario me permite asistir', 'Sí, llego diez minutos antes'
  ];
  for (const [index, answer] of answers.entries()) {
    const id = index === 15 ? 'IN-06 complete-data' : 'IN' + String(index + 1).padStart(2, '0');
    const item = getInformation(id, 1);
    assert.deepEqual(item, getInformation(id, 1), id);
    assert.equal(item.ageBand, ['early', 'junior', 'primary', 'middle', 'teen'][Math.floor((index === 15 ? 5 : index) / 3)], id);
    assert.equal(item.level, index === 15 ? 3 : index % 3 + 1, id);
    assert.equal(gradeOpenInformation(item, answer).classification, 'sufficient', id);
    assert.equal(Object.hasOwn(item.presentation, 'options'), false, id);
    assert.equal(Object.hasOwn(item.presentation, 'hint'), false, id);
    const first = Array.from({length: 12}, (_, seed) => startInformation(getInformation(id, seed)).showOptions()[0].id);
    assert.ok(new Set(first).size > 1, id);
    for (const option of item.answerModel.options) {
      assert.equal(gradeOpenInformation(item, option.label).gradedCorrect === true, option.id === 'sufficient', id);
    }
  }
});

test('partial, interpretable errors, uncertain negation and empty responses stay distinct', () => {
  const in12 = getInformation('IN12', 1);
  assert.deepEqual(gradeOpenInformation(in12, 'Revisar las fuentes'), {classification: 'partial', status: 'partial'});
  assert.deepEqual(gradeOpenInformation(in12, 'Fuentes y diseño uniforme'), {classification: 'partial', status: 'partial'});
  assert.deepEqual(gradeOpenInformation(getInformation('IN08', 1), 'Quién trabajó antes'), {classification: 'insufficient', status: 'incorrect', gradedCorrect: false});
  assert.deepEqual(gradeOpenInformation(in12, 'No hace falta revisar las fuentes y el PDF'), {classification: 'uninterpretable', status: 'uninterpretable'});
  assert.deepEqual(gradeOpenInformation(in12, '   '), {classification: 'no_response', status: 'no_response'});
  assert.equal(gradeOpenInformation(getInformation('IN11', 1), 'Precio y HORA de llegada.').gradedCorrect, true);
});

test('help preserves the first answer in memory without sharing it in response events', () => {
  const session = startInformation(getInformation('IN02', 9));
  assert.throws(() => session.submitChoice('sufficient'));
  session.submitOpen('Niños');
  session.showHint();
  assert.equal(session.summary().event.support, 'spontaneous');
  session.submitOpen('Niños y pinceles');
  assert.equal(session.initialResponse(), 'Niños');
  assert.equal(session.summary().event.support, 'hint');
  session.showOptions();
  session.submitChoice('sufficient');
  assert.deepEqual(session.summary(), {
    initial: 'partial', final: 'sufficient', aidsSeen: ['hint', 'options'],
    event: {activityId: 'IN02', contentVersion: 'r19.2-r1', gradingVersion: 'r19.2-r1.1',
      support: 'options', status: 'correct', gradedCorrect: true}
  });
  assert.equal(JSON.stringify(session).includes('Niños'), false);
  const assisted = startInformation(getInformation('IN08', 9));
  assisted.showHint();
  assisted.submitOpen('Qué falta y quién puede asumirlo');
  assert.equal(assisted.summary().initial, 'no_response');
  assert.equal(assisted.initialResponse(), '');
  const withDraft = startInformation(getInformation('IN02', 9));
  withDraft.showOptions('Pinceles');
  assert.equal(withDraft.summary().initial, 'partial');
  assert.equal(withDraft.submitChoice('other-1').status, 'partial');
});

test('empty submission leaves the first real response available and reviewed equivalents stay spontaneous', () => {
  const session = startInformation(getInformation('IN03', 0));
  assert.equal(session.submitOpen('   ').status, 'no_response');
  assert.equal(session.initialResponse(), undefined);
  assert.equal(session.submitOpen('¿Está abierto?').status, 'correct');
  assert.equal(session.initialResponse(), '¿Está abierto?');
  session.showHint();
  assert.equal(session.summary().initial, 'sufficient');
  assert.equal(session.summary().event.support, 'spontaneous');
  assert.equal(session.summary().event.gradingVersion, 'r19.2-r1.2');
  assert.equal(gradeOpenInformation(getInformation('IN04', 0), 'A qué hora salgo y cuánto tardo en llegar').status, 'correct');
  assert.equal(gradeOpenInformation(getInformation('IN03', 0), 'No está abierto').status, 'uninterpretable');
});

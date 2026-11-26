(function (root) {
  'use strict';
  const {createItem, outcome, shuffled} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;

  const ages = ['early', 'junior', 'primary', 'middle', 'teen'];
  const cases = [
    ['substitution', 'Quieres pintar. No hay pincel, pero tienes una esponja. ¿Qué haces?',
      ['Pintar'], [['sponge', 'Pintar con la esponja', [true]], ['brush', 'Pintar con otro pincel', [false]], ['stop', 'Guardar todo sin pintar', [false]]], ['available-medium']],
    ['capacity', 'La caja de los coches está llena. Hay otra vacía. ¿Cómo guardas los coches?',
      ['Guardar los coches'], [['empty', 'Usar la caja vacía', [true]], ['full', 'Usar la caja llena', [false]], ['out', 'Dejar los coches fuera', [false]]], ['available-space']],
    ['retain-requirements', 'Lleva zapatillas y colores. La mochila está rota y hay una bolsa grande. ¿Qué haces?',
      ['Llevar zapatillas', 'Llevar colores'], [['both', 'Poner los dos en la bolsa', [true, true]], ['shoes', 'Poner solo las zapatillas en la bolsa', [true, false]], ['colors', 'Poner solo los colores en la bolsa', [false, true]]], ['retain-first', 'retain-second']],
    ['reschedule', 'Harías los deberes tras entrenar. Hoy acabarás tarde, pero tienes tiempo antes de salir. ¿Cuándo haces los deberes?',
      ['Hacer los deberes hoy', 'Mantener el entrenamiento'], [['before', 'Antes de ir a entrenar', [true, true]], ['after', 'Después, como estaba previsto', [false, true]], ['skip', 'Durante el entrenamiento, faltando a él', [true, false]]], ['available-time', 'retain-activity']],
    ['setting', 'Ibas a jugar con el grupo en el jardín, pero llueve. Dentro hay una mesa libre, cartas y lápices. ¿Qué juego eligen?',
      ['Jugar con el grupo', 'Jugar dentro'], [['cards', 'Una partida de cartas en la mesa', [true, true]], ['garden', 'El mismo juego en el jardín', [true, false]], ['drawing', 'Dibujar cada cual por su lado', [false, true]]], ['shared-activity', 'indoor']],
    ['reorder', 'El cartel necesita título y color. Tienes lápiz ahora y los colores llegarán después. Puedes cambiar el orden. ¿Qué haces?',
      ['Título', 'Color', 'Usar colores cuando lleguen'], [['title-first', 'Escribir el título y colorear cuando lleguen', [true, true, true]], ['colour-first', 'Empezar a colorear ahora y escribir después', [true, true, false]], ['title', 'Escribir el título y entregar sin colorear', [true, false, true]]], ['retain-title', 'retain-colour', 'resource-window']],
    ['availability', 'Hay dos partidas. Falta un jugador de la primera y ambos de la segunda ya están. ¿Con cuál empiezas?',
      ['Contar con los dos jugadores', 'Jugar ambas partidas'], [['second', 'Empezar por la segunda y guardar la primera para después', [true, true]], ['first', 'Empezar la primera con el jugador presente', [false, true]], ['cancel', 'Jugar la segunda y cancelar la primera', [true, false]]], ['participant-availability', 'retain-both']],
    ['delegation', 'Entregáis mañana. Las imágenes son obligatorias y su responsable falta. Ana y Leo tienen tiempo y saben prepararlas. Revisad tras acabar texto e imágenes. ¿Qué plan sirve?',
      ['Preparar imágenes', 'Reasignar a alguien disponible', 'Revisar al final'], [['ana', 'Ana prepara imágenes. Revisamos al terminar texto e imágenes', [true, true, true]], ['leo', 'Leo prepara imágenes. Revisamos al terminar texto e imágenes', [true, true, true]], ['absent', 'El responsable ausente mantiene las imágenes. Revisamos al final', [true, false, true]], ['early-review', 'Ana prepara imágenes. Revisamos antes de que estén listas', [true, true, false]]], ['mandatory-deliverable', 'available-delegate', 'review-after']],
    ['fixed-window', 'Tienes una actividad fija de 17:00 a 18:00. Tus amistades se reúnen de 17:30 a 19:00 y pueden empezar sin ti. ¿Cómo haces ambas cosas?',
      ['Asistir a la actividad fija', 'Participar en el encuentro'], [['after', 'Hacer la actividad fija y unirte después al encuentro', [true, true]], ['overlap', 'Salir de la actividad a las 17:30 para ir al encuentro', [false, true]], ['only', 'Hacer solo la actividad y no ir al encuentro', [true, false]]], ['fixed-window', 'join-later']],
    ['unknown-policy', 'El cine empieza a las 18:15. Una persona llega a las 18:20 y el grupo puede entrar a tiempo. ¿Cómo organizáis la entrada?',
      ['Entrar a tiempo', 'Confirmar la regla de acceso tardío'], [['confirm', 'Entrar a tiempo y consultar si puede incorporarse después', [true, true]], ['assume', 'Entrar a tiempo y dar por hecho que podrá pasar', [true, false]], ['wait', 'Esperar fuera hasta las 18:20 y preguntar entonces', [false, true]]], ['fixed-start', 'unknown-access']],
    ['dependencies', 'Estudia los temas 1 y 2 y haz el práctico. El práctico depende del tema 2. Las dudas solo pueden resolverse la primera tarde. Pon las acciones y el fin de esa tarde en orden.',
      {steps: [['topic1', 'Estudiar tema 1'], ['topic2', 'Estudiar tema 2'], ['practice', 'Hacer el práctico'], ['questions', 'Resolver dudas'], ['end-first', 'Fin de la primera tarde']], before: [['topic2', 'practice'], ['questions', 'end-first']]}],
    ['infeasibility', 'Debes llegar antes de las 18:00 y tienes 2,50 €. El bus tiene retraso. ¿Qué opción cumple las dos condiciones?',
      {deadline: 18 * 60, budget: 250, routes: [
        ['bus', 'Bus: 18:05, 2 €', 18 * 60 + 5, 200],
        ['metro', 'Metro: 17:45, 3 €', 17 * 60 + 45, 300],
        ['walk', 'A pie: 18:05, 0 €', 18 * 60 + 5, 0]]}],
    ['deadline', 'Presenta la solicitud antes de las 20:00. Falta una firma y la persona que firma se va a las 18:30. ¿Qué haces?',
      ['Conseguir la firma a tiempo', 'Enviar la solicitud firmada a tiempo'], [['signed', 'Conseguir la firma antes de las 18:30 y enviar antes de las 20:00', [true, true]], ['late', 'Ir a firmar a las 19:00 y luego enviar', [false, false]], ['unsigned', 'Enviar antes de las 20:00 sin la firma', [false, false]]], ['signer-window', 'signed-before-deadline']],
    ['dependencies-schedule', 'Presentas el jueves y el examen es el viernes. El ensayo con tu compañero solo puede ser el martes y requiere las diapositivas hechas. Ordena las acciones y sitúa el ensayo el martes.',
      {steps: [['slides', 'Preparar diapositivas'], ['start-tuesday', 'Empieza el martes'], ['rehearse', 'Ensayo con el compañero'], ['end-tuesday', 'Termina el martes'], ['present', 'Presentación del jueves'], ['study', 'Estudiar para el examen'], ['exam', 'Examen del viernes']], before: [['slides', 'start-tuesday'], ['start-tuesday', 'rehearse'], ['rehearse', 'end-tuesday'], ['end-tuesday', 'present'], ['present', 'exam'], ['rehearse', 'study'], ['study', 'exam']]}],
    ['reasoned-decision', 'La asistencia a la reserva grupal aún no se ha confirmado. La reserva normal no es reembolsable. La cancelable cuesta 20 € más y cabe en el presupuesto. ¿Qué harías y bajo qué condición?',
      {components: {flexible: ['attendance-unconfirmed', 'cancellation-worth-cost'], wait: ['attendance-unconfirmed', 'accept-availability-risk']}}]
  ];

  function getChangePlan(id, seed) {
    const index = typeof id === 'string' && /^CP(?:0[1-9]|1[0-5])$/.test(id) ? Number(id.slice(2)) - 1 : -1;
    if (index < 0) throw new RangeError('Unknown CP case');
    const [mechanic, prompt, conditions, candidates, constraints] = cases[index];
    const surface = {prompt};
    let answerModel;
    let structure;
    if (candidates) {
      surface.options = candidates.map(([id, label]) => ({id, label}));
      surface.goal = conditions;
      const violations = Object.fromEntries(candidates.map(([id, , met]) => [
        id, constraints.filter((_, position) => !met[position])
      ]));
      answerModel = {mode: 'constraint_solver', violations};
      structure = {constraints, candidateOutcomes: Object.values(violations).map(list => list.length).sort()};
    } else if (conditions.steps) {
      surface.steps = shuffled(conditions.steps, seed, id + ':steps').map(([id, label]) => ({id, label}));
      answerModel = {mode: 'sequence_constraints', steps: conditions.steps.map(([id]) => id), before: conditions.before};
      structure = {dependencies: conditions.before.map(pair => pair.map(step => answerModel.steps.indexOf(step)))};
    } else if (conditions.routes) {
      surface.options = [...conditions.routes.map(([id, label]) => ({id, label})), {id: 'none', label: 'Ninguna de estas opciones'}];
      answerModel = {mode: 'constraint_solver', ...conditions};
      structure = {constraints: ['arrival-before', 'budget-at-most'], infeasible: true};
    } else {
      surface.options = [
        {id: 'flexible', label: 'Hacer la reserva cancelable'},
        {id: 'wait', label: 'Esperar a confirmar la asistencia'}
      ];
      answerModel = {mode: 'reasoned_decision', ...conditions};
      structure = {constraints: ['budget', 'cost-of-cancellation', 'uncertain-attendance'], defensibleOptions: 2};
    }
    return createItem({
      id, ageBand: ages[Math.floor(index / 3)], level: index % 3 + 1,
      mechanic, construct: 'planUpdating', structure, surface, answerModel
    }, seed);
  }

  function gradeChangePlan(item, response) {
    const model = item.answerModel;
    if (model.mode === 'sequence_constraints') {
      const valid = Array.isArray(response) && response.length === model.steps.length &&
        new Set(response).size === response.length && response.every(step => model.steps.includes(step)) &&
        model.before.every(([a, b]) => response.indexOf(a) < response.indexOf(b));
      return outcome(valid ? 'correct' : 'incorrect');
    }
    if (model.mode === 'reasoned_decision') {
      const expected = Object.hasOwn(model.components, response?.choice) ? model.components[response.choice] : null;
      if (!expected || !Array.isArray(response.components)) return outcome('pending_review');
      return outcome(expected.every(component => response.components.includes(component)) ? 'correct' : 'pending_review');
    }
    if (model.routes) {
      const viable = model.routes.filter(([, , arrival, cost]) => arrival < model.deadline && cost <= model.budget);
      return outcome((response === 'none' ? viable.length === 0 : viable.some(([id]) => id === response)) ? 'correct' : 'incorrect');
    }
    if (!Object.hasOwn(model.violations, response)) return outcome('uninterpretable');
    const violated = model.violations[response];
    return {...outcome(violated.length ? 'incorrect' : 'correct'), violated};
  }

  const api = {getChangePlan, gradeChangePlan};
  root.GliaxR192CP = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

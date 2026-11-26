(function (root) {
  'use strict';
  const core = typeof module !== 'undefined' ? require('./gliax-r192-executive') : root.GliaxR192Executive;
  const {shuffled, outcome} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;
  const curriculum = typeof module !== 'undefined' ? require('./curriculum') : root.Curriculum;
  const family = 'supervision';

  const fact = (label, good, bad) => ({label, good, bad, operator: 'equals', target: true, values: [true, false]});
  const quantity = (label, good, bad, operator, target, valid, invalid) =>
    ({label, good, bad, operator, target, values: [valid, invalid]});

  // The left-hand conditions and situations come from the named R19.1 cases.
  // Each right-hand variant has been paired explicitly with its semantic value.
  const formulations = {
    junior: [
      [
        fact('Papel', 'Cada persona tiene su propia hoja', 'Hay una sola hoja para compartir'),
        fact('Agua', 'Hay un vaso para enjuagar los pinceles', 'No se ha preparado ningún vaso'),
        fact('Protección', 'Un mantel protege la mesa', 'La mesa queda al descubierto'),
        fact('Pinceles', 'Cada persona dispone de un pincel', 'Hay un pincel para todo el grupo'),
        fact('Limpieza', 'Al acabar se limpian los pinceles', 'Los pinceles se guardan sin lavar')
      ], [
        fact('Bebida', 'Llevamos agua en una botella', 'Llevamos un vaso vacío'),
        fact('Comida', 'Llevamos una manzana', 'Llevamos solo una servilleta'),
        fact('Gorra', 'Hay una gorra en la bolsa', 'La gorra se queda en clase'),
        fact('Abrigo', 'Guardamos la chaqueta en la bolsa', 'Dejamos la chaqueta en casa'),
        fact('Identificación', 'La bolsa lleva el nombre escrito', 'La bolsa no lleva ningún nombre')
      ]
    ],
    primary: [
      [
        quantity('Inicio', 'A las cuatro de la tarde', 'A las cuatro y media de la tarde', 'equals', 960, 960, 990),
        quantity('Duración', 'Media hora', 'Sesenta minutos', 'equals', 30, 30, 60),
        fact('Lugar', 'En la sala donde se da música', 'En la biblioteca'),
        fact('Material', 'Llevar una copia en papel de la letra', 'Llevar solo una copia en el móvil'),
        fact('Cierre', 'Devolver los instrumentos a su sitio', 'Dejar los instrumentos sobre la mesa')
      ], [
        fact('Tema', 'Fauna que vive en la zona', 'Animales que solo viven en otras regiones'),
        quantity('Tamaño', 'Una única cartulina', 'Tres cartulinas unidas', 'equals', 1, 1, 3),
        fact('Entrega', 'Entregar durante el miércoles', 'Entregar durante el viernes'),
        fact('Firma', 'Indicar quiénes forman el equipo', 'Entregar sin identificar al equipo'),
        fact('Fijación', 'Usar cinta que se despegue sin dejar marca', 'Fijar con pegamento permanente')
      ]
    ],
    middle: [
      [
        fact('Fecha', 'Programar la publicación para el viernes', 'Publicar el miércoles'),
        fact('Autoría', 'Acreditar a todas las personas autoras', 'Quitar la autoría del boletín'),
        fact('Imágenes', 'Seleccionar imágenes autorizadas', 'Añadir imágenes sin autorización'),
        fact('Fuente', 'Añadir un enlace al informe que se cita', 'Mencionar el informe sin enlazarlo'),
        fact('Revisión', 'Comprobar el boletín antes de difundirlo', 'Revisar después de difundirlo'),
        fact('Acceso', 'Se puede leer sin crear una cuenta', 'Solo se puede leer tras registrarse')
      ], [
        fact('Formato', 'Entregar un solo documento en PDF', 'Enviar un documento editable'),
        quantity('Extensión', 'El documento ocupa cuatro páginas', 'El documento ocupa ocho páginas', 'at-most', 5, 4, 8),
        fact('Identificación', 'Indicar en el archivo quiénes lo han hecho', 'Dejar el proyecto sin identificar'),
        fact('Destino', 'Subirlo al espacio de archivos de la clase', 'Moverlo a una carpeta personal privada'),
        fact('Plazo', 'Dejarlo entregado como tarde el miércoles', 'Entregarlo el viernes'),
        fact('Confirmación', 'Abrir el archivo subido para verificarlo', 'Comprobar solo que aparece el nombre del archivo')
      ]
    ],
    teen: [
      [
        fact('Alcance', 'Limitar las conclusiones al grupo participante', 'Extender la conclusión a toda la población'),
        fact('Identidad', 'Difundir una versión sin nombres', 'Mostrar los nombres junto a las respuestas'),
        fact('Fuente', 'Incluir un enlace al informe íntegro', 'Publicar sin dar acceso al informe'),
        fact('Gráfico', 'Conservar la escala del gráfico de partida', 'Cambiar la escala original'),
        fact('Revisión', 'Publicar tras recibir el visto bueno del borrador', 'Solicitar el visto bueno después de publicar'),
        fact('Fecha', 'Especificar cuándo se hizo la consulta', 'Omitir el periodo de recogida')
      ], [
        fact('Plazo', 'Presentar la propuesta como tarde el domingo', 'Presentarla el martes'),
        fact('Formato', 'Entregar un PDF de cinco páginas', 'Enviar un editable de diez páginas'),
        fact('Anexos', 'Incorporar el documento de autorización', 'Prescindir del documento de autorización'),
        fact('Destino', 'Entregar a través de la plataforma de la convocatoria', 'Enviar a una cuenta de correo particular'),
        fact('Registro', 'Conservar el justificante de entrega', 'Eliminar el justificante tras enviar'),
        fact('Versión', 'Entregar la versión que recibió el visto bueno', 'Enviar un borrador anterior a la aprobación')
      ]
    ]
  };

  function fails({operator, target, actual}) {
    return operator === 'at-most' ? actual > target : actual !== target;
  }

  function reviewItem(request, source, specs, index, faultCount) {
    curriculum.validateReview(source);
    const key = ['review', index, faultCount].join('-');
    const original = source.stimulus[1].rows.slice(1);
    const labels = original.map(row => row[0]);
    if (labels.some((label, i) => specs[i]?.label !== label)) throw new Error('The documented review rows have changed');
    const flagged = shuffled(labels, request.seed, key + ':violations').slice(0, faultCount);
    const reviewRows = original.map(([label, requirement], i) => {
      const {good, bad, operator, target, values} = specs[i];
      const fails = flagged.includes(label);
      return {label, requirement, proposal: fails ? bad : good, operator, target, actual: values[Number(fails)]};
    });
    const rows = shuffled(reviewRows, request.seed, key + ':rows');
    const q = 'Revisa el plan. Marca los apartados que incumplen una condición obligatoria. Si cumple todo, no marques ninguno.';
    const stimulus = [
      source.stimulus[0],
      core.table(['Apartado', 'Condición obligatoria', 'Plan propuesto'], rows.map(({label, requirement, proposal}) => [label, requirement, proposal]))
    ];
    const opts = rows.map(row => row.label);
    const answers = rows.filter(fails).map(row => row.label);
    const conditions = reviewRows.map(({label, operator, target, actual}) => ({label, operator, target, actual}));
    return core.createItem(request, family, key, {kind: 'review', faultCount, criteria: reviewRows.map(row => row.operator).sort()},
      {q, stimulus, opts}, {mode: 'constraint_solver', kind: 'review', conditions},
      {type: 'multiSelect', responseType: 'multiple', requiresStimulus: true, q, stimulus, opts, answers}, source.id);
  }

  function earlyItem(request, source, index) {
    const key = 'repair-' + index;
    const {seed, level} = request;
    const valid = source.a;
    const invalid = source.opts.filter(answer => answer !== valid);
    const opts = shuffled([valid, ...invalid.slice(0, level === 2 ? 1 : undefined)], seed, key + ':options');
    const direct = level === 1;
    const q = direct ? source.q : 'Marca las propuestas que no resuelven el problema.';
    const stimulus = source.stimulus;
    const legacy = direct
      ? {type: 'standard', responseType: 'choice', a: valid}
      : {type: 'multiSelect', responseType: 'multiple', answers: opts.filter(label => label !== valid)};
    const conditions = opts.map(label => ({label, operator: 'equals', target: true, actual: label === valid}));
    return core.createItem(request, family, key, {kind: 'early-repair', direct, choices: opts.length},
      {q, stimulus, opts}, {mode: direct ? 'single_choice' : 'constraint_solver', kind: direct ? 'repair' : 'review', conditions},
      {...legacy, requiresStimulus: true, q, stimulus, opts}, source.id);
  }

  function supervisionPool(request) {
    core.validateRequest(request);
    if (request.ageBand === 'early') {
      return core.sourceItems(request, 'executive_supervision').map((source, i) => earlyItem(request, source, i));
    }
    const specs = formulations[request.ageBand];
    return core.sourceItems(request, 'executive_review_all').slice(0, specs.length).flatMap((source, i) =>
      [0, source.answers.length].map(count => reviewItem(request, source, specs[i], i, count)));
  }

  function gradeSupervision(item, response) {
    const {kind, conditions} = item.answerModel;
    if (kind === 'repair') {
      const choice = conditions.find(condition => condition.label === response);
      return outcome(choice ? (fails(choice) ? 'incorrect' : 'correct') : 'uninterpretable');
    }
    const violated = conditions.filter(fails).map(row => row.label);
    const review = violated.length ? 'needs_correction' : 'compliant';
    const finish = status => ({...outcome(status), review});
    const labels = conditions.map(row => row.label);
    if (!Array.isArray(response) || response.some(label => !labels.includes(label))) return finish('uninterpretable');
    const selections = new Set(response);
    return finish(selections.size === response.length && selections.size === violated.length &&
      violated.every(label => selections.has(label)) ? 'correct' : 'incorrect');
  }

  const generateSupervision = request => core.chooseItem(supervisionPool(request), request, family);
  const api = {supervisionPool, generateSupervision, gradeSupervision};
  root.GliaxR192Supervision = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

(function (root) {
  'use strict';
  const {createItem, outcome, responseEvent, shuffled} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;

  const ages = ['early', 'junior', 'primary', 'middle', 'teen'];
  const cases = [
    ['Hay tres manzanas, una por niño. ¿Qué necesitas saber para ver si llegan para todos?',
      'Piensa en las personas que van a comer.',
      [['Número de niños', 'Cuántos niños hay', 'Cuántos niños recibirán manzana'], ['Número de platos'], ['Si están lavadas']]],
    ['Cada niño necesita un pincel. ¿Qué tienes que contar para ver si hay suficientes?',
      'Piensa en qué dos grupos puedes comparar.',
      [['Niños y pinceles', 'Cuántos niños y cuántos pinceles hay'], ['Niños y botes'], ['Pinceles y mesas']],
      ['Niños', 'Pinceles', 'Cuántos niños hay', 'Cuántos pinceles hay']],
    ['Pueden ir al patio si está abierto y no llueve. Hoy no llueve. ¿Qué falta comprobar?',
      'Ya sabes si se cumple una de las dos condiciones.',
      [['Si el patio está abierto ahora', 'Si está abierto ahora', 'Está abierto el patio'], ['Si abrirá mañana'], ['Si hay otros niños']]],
    ['La biblioteca cierra a las 18:00. ¿Qué falta saber para decidir si llegas antes de que cierre?',
      'Compara el cierre con el momento en que estarías allí.',
      [['La hora de llegada', 'Hora de llegada', 'A qué hora llego', 'Cuándo llegaría'], ['Hora de salida de casa'], ['Duración de la visita']]],
    ['Hay cinco amigos y cuatro entradas. ¿Qué debes comprobar para que todos puedan entrar?',
      'Piensa en lo que necesita cada persona.',
      [['Una entrada por amigo', 'Que cada persona tenga entrada', 'Falta una entrada'], ['Que haya cinco asientos libres'], ['Que puedan sentarse juntos']]],
    ['Sales a las 16:30 y el entrenamiento empieza a las 17:00. ¿Se sabe si vas a llegar a tiempo? Explica tu respuesta.',
      'Entre salir y llegar pasa tiempo.',
      [['No se sabe sin conocer la duración del trayecto', 'No, falta saber cuánto dura el trayecto', 'Depende del tiempo de viaje', 'Falta la duración del trayecto'], ['Sí, porque sales media hora antes'], ['Sí, si empieza puntual']],
      ['No se sabe', 'No']],
    ['La clase termina a las 15:00 y el torneo empieza a las 16:00. ¿Qué falta saber para decidir si llegas?',
      'Piensa en lo que sucede entre la clase y el torneo.',
      [['Cuánto se tarda en llegar desde clase', 'El tiempo de viaje desde clase', 'La duración del trayecto desde la clase'], ['Cuánto dura el torneo'], ['A qué hora sales de casa']]],
    ['Hay dos apartados pendientes de un trabajo grupal. ¿Qué necesitas saber para repartirlos?',
      '¿Qué haría posible un reparto realista?',
      [['Qué falta y quién puede asumirlo', 'Qué tareas faltan y quién tiene tiempo para hacerlas', 'Qué apartados faltan y quién sabe hacerlos'], ['Quién trabajó antes'], ['Qué apartado interesa más al grupo']],
      ['Qué falta', 'Quién tiene tiempo', 'Quién sabe hacerlo', 'Qué apartados faltan']],
    ['La actividad cuesta 8 € y tienes 10 €. Quizá haga falta inscribirse antes. ¿Puedes asegurar que asistirás?',
      'Poder pagar no garantiza participar.',
      [['No, hay que comprobar si hace falta inscribirse y si se puede', 'Comprobar la inscripción', 'Si hay que inscribirse y si quedan plazas'], ['Sí, porque tengo dinero suficiente'], ['No, porque no tengo dinero suficiente']],
      ['Si hay que inscribirse', 'Si quedan plazas', 'No se puede asegurar']],
    ['Ya conoces el horario y el precio de esa sesión de cine. ¿Qué falta comprobar para decidir si puedes ir?',
      'Saber el precio no garantiza que puedas entrar.',
      [['Si quedan entradas para esa sesión', 'Disponibilidad de entradas para esa sesión', 'Si quedan plazas en esa sesión'], ['Si hay descuentos en otros cines'], ['Qué otros horarios hay']]],
    ['Tienes que volver antes de las 21:00 y puedes gastar hasta 3 €. Puedes ir en bus o metro. ¿Qué datos necesitas para comparar?',
      'Hay dos límites que cumplir.',
      [['El coste y la hora de llegada de ambos', 'Precio y hora de llegada', 'Cuánto cuesta cada uno y a qué hora llega'], ['Horario y recorrido, sin el coste'], ['Precio y preferencia del grupo']],
      ['El precio', 'La hora de llegada', 'Cuánto cuesta cada uno', 'A qué hora llega cada uno']],
    ['Las diapositivas están listas. Piden citar las fuentes y entregar un PDF. ¿Qué compruebas antes de enviar?',
      'Terminar el trabajo no garantiza cumplir lo que piden.',
      [['Fuentes y formato PDF', 'Que estén citadas las fuentes y que sea un PDF', 'Las fuentes y el PDF'], ['Fuentes y diseño uniforme'], ['PDF e imágenes en todas las páginas']],
      ['Las fuentes', 'Revisar las fuentes', 'Que sea PDF', 'El formato PDF']],
    ['Conoces el precio y las fechas de una reserva de dos noches. ¿Qué falta saber antes de reservar?',
      'El precio no garantiza que se pueda hacer la reserva.',
      [['Si hay disponibilidad las dos noches', 'Disponibilidad en ambas noches', 'Si queda sitio las dos noches'], ['Si se puede entrar temprano'], ['Cuál es el precio de una tarifa alternativa']]],
    ['El presupuesto es limitado. Conoces cuánto cuestan el espacio y los materiales, pero no el transporte. ¿Puedes garantizar que alcanza? ¿Qué comprobarías?',
      'Revisa si están incluidos todos los gastos del total.',
      [['El coste del transporte y si cabe en el margen', 'Coste de transporte y suma total', 'El máximo del transporte y si cabe en lo que queda'], ['Solo el descuento de los materiales'], ['Si el espacio sigue disponible']],
      ['El coste del transporte', 'El precio del transporte', 'La suma total']],
    ['Dos cursos cuestan lo mismo. Uno incluye materiales y el otro tiene más horas. ¿Qué necesitarías saber para elegir de acuerdo con tu objetivo?',
      'Piensa en qué necesitas conseguir con el curso.',
      [['Si el contenido encaja con lo que quiero aprender', 'Comparar contenidos y horarios con mi objetivo', 'Si el horario me permite asistir', 'Si la modalidad encaja con lo que necesito'], ['El de más horas siempre es mejor'], ['El que incluye materiales siempre es mejor']],
      ['El contenido', 'El horario', 'La modalidad']]
  ];

  const completeData = [
    'Sales a las 16:30. El trayecto dura 20 minutos y el entrenamiento empieza a las 17:00. ¿Se sabe si vas a llegar a tiempo? Explica tu respuesta.',
    'Puedes comprobar qué ocurre entre la salida y el inicio con los datos que ya tienes.',
    [['Sí, llego a las 16:50', 'No falta información, llego a las 16:50', 'Sí, el trayecto dura menos de media hora', 'Sí, llego diez minutos antes'], ['No, falta la duración del trayecto'], ['No, llegaré después de las 17:00']],
    ['Sí', 'No falta información']
  ];

  const partialOptions = {IN02: [0, 1], IN11: [1], IN12: [0, 1]};

  const gradeStatus = {
    sufficient: 'correct', partial: 'partial', insufficient: 'incorrect',
    uninterpretable: 'uninterpretable', no_response: 'no_response'
  };

  function classify(classification) {
    return {classification, ...outcome(gradeStatus[classification])};
  }

  function normalize(text) {
    return text.normalize('NFD').replace(/\p{Mark}/gu, '').toLocaleLowerCase('es')
      .replace(/[¿?¡!.,;]+/g, ' ').trim().replace(/\s+/g, ' ');
  }

  function getInformation(id, seed) {
    const complete = id === 'IN-06 complete-data';
    if (!complete && (typeof id !== 'string' || !/^IN(?:0[1-9]|1[0-5])$/.test(id))) {
      throw new RangeError('Unknown IN case');
    }
    const index = complete ? 5 : Number(id.slice(2)) - 1;
    const [prompt, hint, [sufficient, ...distractors], partial = []] = complete ? completeData : cases[index];
    const ageBand = ages[Math.floor(index / 3)];
    const options = [
      {id: 'sufficient', label: sufficient[0]},
      ...distractors.map(([label], index) => ({id: 'other-' + (index + 1), label}))
    ];
    const partialIndices = partialOptions[id] ?? [];
    return createItem({
      id, ageBand, level: index % 3 + 1,
      mechanic: complete ? 'complete-data' : index === 14 ? 'reasoned-decision' : partial.length ? 'component-sufficiency' : 'missing-fact',
      construct: 'informationSufficiency',
      surface: {prompt, supervisedOralAvailable: ageBand === 'early'},
      structure: {completeData: complete, evaluatesComponents: partial.length > 0, openCriterion: index === 14},
      answerModel: {
        mode: index === 14 ? 'reasoned_decision' : 'open_concepts',
        equivalents: {
          sufficient: sufficient.map(normalize),
          partial: [...partial, ...distractors.filter((_, i) => partialIndices.includes(i)).flat()].map(normalize),
          insufficient: distractors.filter((_, i) => !partialIndices.includes(i)).flat().map(normalize)
        },
        hint, options: shuffled(options, seed, id + ':support')
      }
    }, seed);
  }

  function gradeOpenInformation(item, text) {
    if (typeof text !== 'string') return classify('uninterpretable');
    const response = normalize(text);
    if (!response) return classify('no_response');
    const equivalents = item.answerModel.equivalents;
    for (const verdict of ['sufficient', 'partial', 'insufficient']) {
      if (equivalents[verdict].includes(response)) return classify(verdict);
    }
    return classify('uninterpretable');
  }

  function startInformation(item) {
    let initial;
    let result;
    let support = 'spontaneous';
    let submittedSupport;
    const seen = new Set();

    function submitOpen(text) {
      if (initial === undefined && support === 'spontaneous') initial = typeof text === 'string' ? text : '';
      result = gradeOpenInformation(item, text);
      submittedSupport = support;
      return result;
    }

    function reveal(stage, draft) {
      if (initial === undefined) initial = typeof draft === 'string' ? draft : '';
      seen.add(stage);
      if (support !== 'options') support = stage;
    }

    return {
      submitOpen,
      showHint(draft) {
        reveal('hint', draft);
        return item.answerModel.hint;
      },
      showOptions(draft) {
        reveal('options', draft);
        return item.answerModel.options.map(({id, label}) => ({id, label}));
      },
      submitChoice(id) {
        if (!seen.has('options')) throw new Error('IN options must be shown before selecting');
        const option = item.answerModel.options.find(option => option.id === id);
        result = option ? gradeOpenInformation(item, option.label) : classify('uninterpretable');
        submittedSupport = 'options';
        return result;
      },
      initialResponse() { return initial; },
      summary() {
        return {
          initial: initial === undefined ? 'no_response' : gradeOpenInformation(item, initial).classification,
          final: result?.classification ?? 'no_response',
          aidsSeen: [...seen],
          event: result ? responseEvent(item, result, submittedSupport) : null
        };
      }
    };
  }

  const api = {getInformation, gradeOpenInformation, startInformation};
  root.GliaxR192IN = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

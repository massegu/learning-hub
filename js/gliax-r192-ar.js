(function (root) {
  'use strict';
  const {createItem, outcome} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;

  const ages = ['junior', 'primary', 'middle', 'teen'];
  const circle = 'círculo';
  const triangle = 'triángulo';
  const square = 'cuadrado';
  const red = 'rojo';
  const blue = 'azul';
  const animal = 'animal';
  const object = 'objeto';
  const wait = 'wait';

  const shape = (form, color, extra = {}) => ({form, ...(color ? {color} : {}), ...extra});
  const picture = (name, category) => ({name, category});
  const cue = mode => ({cue: mode});
  const invert = cue('invert');
  const colorMode = cue('color');
  const formMode = cue('form');
  const colorRule = {[red]: 'A', [blue]: 'B'};
  const formRule = {[circle]: 'A', [square]: 'B'};

  const cases = [
    ['go_no_go', 'Pulsa si ves un animal. Si ves un objeto, espera.',
      {initial: 'category', maps: {category: {[animal]: 'act'}}},
      [picture('perro', animal), picture('lápiz', object), picture('gato', animal), picture('libro', object), picture('conejo', animal)]],
    ['reversal', 'Pulsa con el círculo y espera con el triángulo. Cuando veas ↔, cambia la regla y sigue con la regla nueva.',
      {initial: 'form', maps: {form: {[circle]: 'act', [triangle]: wait}}, reverse: {act: wait, [wait]: 'act'}},
      [shape(circle), shape(triangle), invert, shape(circle), shape(triangle)]],
    ['criterion_switch', 'Si la señal dice Color, pulsa ante el rojo. Si dice Forma, pulsa ante el círculo. En los demás casos espera.',
      {initial: 'color', maps: {color: {[red]: 'act'}, form: {[circle]: 'act'}}},
      [colorMode, shape(square, red), shape(circle, blue), formMode, shape(circle, blue), shape(square, red), shape(triangle, blue)]],
    ['go_no_go', 'Círculo: A. Cuadrado: B. Triángulo: espera.',
      {initial: 'form', maps: {form: formRule}},
      [shape(circle), shape(square), shape(triangle), shape(circle), shape(square)]],
    ['exception', 'Pulsa A con un animal. Si tiene estrella o es un objeto, espera.',
      {initial: 'category', maps: {category: {[animal]: 'A'}}, veto: 'star'},
      [picture('gato', animal), {...picture('perro', animal), star: true}, picture('libro', object),
        picture('conejo', animal), {...picture('gato', animal), star: true}]],
    ['conjunction', 'Círculo rojo: A. Cuadrado azul: B. Con las demás combinaciones, espera.',
      {initial: 'combination', maps: {combination: {[circle + ' ' + red]: 'A', [square + ' ' + blue]: 'B'}}},
      [shape(circle, red), shape(circle, blue), shape(square, blue), shape(square, red), shape(circle, red)]],
    ['go_no_go', 'Responde al color de la figura: rojo es A y azul es B. Ignora la letra que lleva dentro.',
      {initial: 'color', maps: {color: colorRule}},
      [shape(circle, red, {letter: 'B'}), shape(square, blue, {letter: 'A'}), shape(square, red, {letter: 'A'})]],
    ['alternation', 'La señal indica qué mirar. Con Color: rojo A, azul B. Con Forma: círculo A, cuadrado B.',
      {initial: 'color', maps: {color: colorRule, form: formRule}},
      [colorMode, shape(square, red), shape(circle, blue), formMode, shape(square, red), shape(circle, blue),
        colorMode, shape(circle, red)]],
    ['exception', 'Rojo: A. Azul: B. Con borde negro grueso, espera siempre.',
      {initial: 'color', maps: {color: colorRule}, veto: 'border'},
      [shape(circle, red), shape(square, blue, {border: true}), shape(circle, blue), shape(square, red, {border: true})]],
    ['criterion_switch', 'Usa solo el criterio de la señal. Color: rojo A, azul B. Forma: círculo A, cuadrado B.',
      {initial: 'color', maps: {color: colorRule, form: formRule}},
      [colorMode, shape(square, red), formMode, shape(circle, blue), shape(square, red)]],
    ['reversal', 'Rojo: A. Azul: B. Cada ↔ intercambia A y B hasta la siguiente señal.',
      {initial: 'color', maps: {color: colorRule}, reverse: {A: 'B', B: 'A'}},
      [shape(circle, red), shape(circle, blue), invert, shape(circle, red), shape(circle, blue), invert, shape(circle, red)]],
    ['alternation', 'Sigue la señal. Color: rojo A, azul B. Forma: círculo A, cuadrado B. Con borde negro grueso, espera siempre.',
      {initial: 'color', maps: {color: colorRule, form: formRule}, veto: 'border'},
      [colorMode, shape(circle, blue), formMode, shape(circle, red, {border: true}), shape(square, red),
        colorMode, shape(square, red), shape(circle, blue, {border: true})]]
  ];

  function stimulusLabel(stimulus) {
    const {name, form, color, star, border, letter} = stimulus;
    return [name ?? form, color, star ? 'con estrella' : null, border ? 'con borde negro grueso' : null,
      letter ? 'con la letra ' + letter : null].filter(Boolean).join(' ');
  }

  function signalLabel(signal) {
    if (signal === 'invert') return '↔ Cambia la regla';
    return signal === 'color' ? 'Color' : 'Forma';
  }

  function evaluateRuleTrials(item) {
    const {rule, stimuli} = item.answerModel;
    let active = rule.initial;
    let reversed = false;
    let afterChange = false;
    return stimuli.map((stimulus, index) => {
      const id = 'event-' + (index + 1);
      if (stimulus.cue) {
        afterChange = stimulus.cue === 'invert' || active !== stimulus.cue;
        if (stimulus.cue === 'invert') reversed = !reversed;
        else active = stimulus.cue;
        return {id, changeEvent: true, activeRule: active, reversed};
      }
      const value = active === 'combination' ? stimulus.form + ' ' + stimulus.color : stimulus[active];
      const vetoed = Boolean(rule.veto && stimulus[rule.veto]);
      const ordinary = rule.maps[active][value] ?? wait;
      const expectedAction = vetoed ? wait : reversed ? rule.reverse[ordinary] : ordinary;
      let interferenceType = null;
      if (vetoed && ordinary !== wait) interferenceType = 'veto';
      else if (stimulus.letter && stimulus.letter !== expectedAction) interferenceType = 'incongruent-letter';
      else if (rule.maps.color && rule.maps.form && rule.maps.color[stimulus.color] !== rule.maps.form[stimulus.form]) {
        interferenceType = 'incongruent-criterion';
      }
      const trial = {
        id, stimulus: {...stimulus}, activeRule: active, reversed, expectedAction, afterChange,
        changeEvent: false, isNoGo: expectedAction === wait, interferenceType, visualSet: 'forms-and-pictures'
      };
      afterChange = false;
      return trial;
    });
  }

  function getRuleAction(id, seed) {
    if (typeof id !== 'string' || !/^AR(?:0[7-9]|1[0-8])$/.test(id)) throw new RangeError('Unknown AR case');
    const index = Number(id.slice(2)) - 7;
    const [mechanic, prompt, rule, stimuli] = cases[index];
    const structure = {
      criteria: Object.keys(rule.maps), mappings: Object.values(rule.maps).map(map => Object.values(map).sort()),
      canReverse: Boolean(rule.reverse), veto: rule.veto ?? null,
      eventPattern: stimuli.map(stimulus => stimulus.cue ?? 'trial')
    };
    const item = createItem({
      id, ageBand: ages[Math.floor(index / 3)], level: index % 3 + 1,
      mechanic, construct: 'ruleFollowing', structure,
      surface: {prompt, events: stimuli.map((stimulus, index) => {
        const id = 'event-' + (index + 1);
        if (stimulus.cue) return {id, type: 'signal', label: signalLabel(stimulus.cue)};
        return {id, type: 'trial', stimulus, label: stimulusLabel(stimulus)};
      })},
      answerModel: {mode: 'trial_state_machine', rule, stimuli}
    }, seed);
    const trials = evaluateRuleTrials(item).filter(event => !event.changeEvent);
    item.answerModel.measuresWithholding = trials.some(trial => trial.isNoGo) && trials.some(trial => !trial.isNoGo);
    return item;
  }

  function gradeRuleAction(item, responses) {
    const trials = evaluateRuleTrials(item).filter(event => !event.changeEvent);
    if (!responses || !trials.every(trial => Object.hasOwn(responses, trial.id))) return outcome('pending_review');
    const metrics = {scored: trials.length, correct: 0, omissions: 0, wrongButton: 0, postChangeErrors: 0};
    if (item.answerModel.measuresWithholding) Object.assign(metrics, {commissions: 0, correctWaits: 0});
    for (const trial of trials) {
      const action = responses[trial.id] ?? wait;
      if (action === trial.expectedAction) {
        metrics.correct++;
        if (trial.isNoGo && item.answerModel.measuresWithholding) metrics.correctWaits++;
      } else {
        if (trial.isNoGo && item.answerModel.measuresWithholding) metrics.commissions++;
        else if (action === wait) metrics.omissions++;
        else metrics.wrongButton++;
        if (trial.afterChange) metrics.postChangeErrors++;
      }
    }
    return {...outcome(metrics.correct === metrics.scored ? 'correct' : 'incorrect'), metrics};
  }

  const api = {getRuleAction, evaluateRuleTrials, gradeRuleAction};
  root.GliaxR192AR = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

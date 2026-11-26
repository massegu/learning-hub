(function (root) {
  'use strict';
  const core = typeof module !== 'undefined' ? require('./gliax-r192-executive') : root.GliaxR192Executive;
  const {shuffled, outcome} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;
  const curriculum = typeof module !== 'undefined' ? require('./curriculum') : root.Curriculum;
  const family = 'constraints';

  function violations(candidate, rules) {
    return [
      candidate.cost > rules.budget ? 'budget' : null,
      candidate.units < rules.units ? 'quantity' : null,
      rules.availableToday && !candidate.available ? 'availability' : null
    ].filter(Boolean);
  }

  function resourceSolution(candidates, rules) {
    return candidates.filter(candidate => !violations(candidate, rules).length).map(candidate => candidate.id);
  }

  function resourceItem(request, source, key, variation) {
    curriculum.validatePlan(source);
    const {block, budget, units, availability} = source.planEvidence;
    const [header, ...rows] = source.stimulus[block].rows;
    const candidates = rows.map(([id, cost, units, available]) => ({
      id, cost: Number(cost), units: Number(units), available: available === 'Sí'
    }));
    const rules = {budget, units, availableToday: availability};
    if (variation === 'several') {
      if (request.level === 2) rules.budget = Math.max(...candidates.map(x => x.cost));
      else rules.units = Math.min(...candidates.map(x => x.units));
    } else if (variation === 'incompatible') {
      rules.budget = Math.min(...candidates.map(x => x.cost));
      rules.units = Math.max(...candidates.map(x => x.units));
    }

    const {seed} = request;
    const material = source.stimulus[0].text.match(/al menos \d+ ([^.]+?)(?:\. Dispones|\. Tiene)/)?.[1];
    if (!material) throw new Error('Missing documented resource context');
    const task = source.stimulus[0].text.split('. ')[0];
    const context = task.split(/, necesitas| y necesita al menos/)[0] + '.';
    const q = '¿Qué paquete cumple todas las condiciones? Si sirve más de uno, puedes elegir cualquiera.';
    const stimulus = [
      core.text(context),
      core.text('Necesitas al menos ' + rules.units + ' ' + material + ' y puedes gastar hasta ' + rules.budget + ' puntos.' +
        (rules.availableToday ? ' El paquete debe estar disponible hoy.' : '')),
      core.table(header, shuffled(rows, seed, key + ':rows'))
    ];
    const ids = candidates.map(x => x.id);
    const none = 'Ningún paquete';
    const opts = shuffled([...ids, none], seed, key + ':options');
    const solutions = resourceSolution(candidates, rules);
    if (variation === 'baseline' && solutions.length !== 1 || variation === 'several' && solutions.length < 2 ||
        variation === 'incompatible' && solutions.length !== 0) throw new Error('Resource scenario has an unexpected solution count');
    return core.createItem(request, family, key,
      {mechanic: 'resources', rules: ['budget', 'quantity', ...(availability ? ['availability'] : [])],
        candidateViolations: candidates.map(candidate => violations(candidate, rules).join('+')).sort()},
      {q, stimulus, opts}, {mode: 'constraint_solver', kind: 'resources', candidates, rules, none},
      {type: 'standard', responseType: 'choice', requiresStimulus: true, q, stimulus, opts, a: solutions[0] ?? none}, source.id);
  }

  function durationLabel(balance) {
    if (balance === 0) return 'Alcanza justo el tiempo';
    const minutes = Math.abs(balance);
    return (balance > 0 ? 'Sobran ' : 'Faltan ') + minutes + (minutes === 1 ? ' minuto' : ' minutos');
  }

  function timeItem(request, source, key) {
    curriculum.validatePlan(source);
    const {available, block} = source.planEvidence;
    const rows = source.stimulus[block].rows.slice(1);
    const minutes = rows.map(row => Number(row[1]));
    const balance = available - minutes.reduce((sum, time) => sum + time, 0);
    const positions = [Math.abs(balance) || 3, 0, -(Math.abs(balance) || 3), balance + 1];
    const a = durationLabel(balance);
    const opts = shuffled([...new Set([balance, ...positions])].slice(0, 3).map(durationLabel), request.seed, key + ':options');
    const stimulus = [source.stimulus[0], core.table(['Tarea', 'Minutos'], shuffled(rows, request.seed, key + ':rows'))];
    const q = '¿Cómo queda el plan respecto al tiempo disponible?';
    return core.createItem(request, family, key, {mechanic: 'duration', tasks: minutes.length, sign: Math.sign(balance)},
      {q, stimulus, opts}, {mode: 'constraint_solver', kind: 'duration', minutes, available},
      {type: 'standard', responseType: 'choice', requiresStimulus: true, q, stimulus, opts, a}, source.id);
  }

  function constraintsPool(request) {
    core.validateRequest(request);
    const items = [];
    const groups = [
      ['executive_resources', 'resources', ['baseline', 'several', 'incompatible'], resourceItem],
      ['executive_time_budget', 'time', [''], timeItem]
    ];
    for (const [mechanic, name, variants, build] of groups) {
      for (const source of core.sourceItems(request, mechanic)) {
        const [, context, index] = source.id.match(/-(\d+)-(\d+)$/);
        if (Number(index) > 2) continue;
        for (const variant of variants) {
          items.push(build(request, source, [name, context, index, variant].filter(Boolean).join('-'), variant));
        }
      }
    }
    return items;
  }

  function gradeConstraints(item, response) {
    const model = item.answerModel;
    if (model.kind === 'duration') {
      const balance = model.available - model.minutes.reduce((sum, time) => sum + time, 0);
      const resolution = balance < 0 ? 'no_solution' : 'has_solution';
      const status = !item.opts.includes(response) ? 'uninterpretable' : response === durationLabel(balance) ? 'correct' : 'incorrect';
      return {...outcome(status), resolution};
    }
    const solutions = resourceSolution(model.candidates, model.rules);
    const resolution = solutions.length ? 'has_solution' : 'no_solution';
    if (response === model.none) return {...outcome(solutions.length ? 'incorrect' : 'correct'), resolution};
    const candidate = model.candidates.find(candidate => candidate.id === response);
    if (!candidate) return {...outcome('uninterpretable'), resolution};
    const violated = violations(candidate, model.rules);
    return {...outcome(violated.length ? 'incorrect' : 'correct'), resolution, violated};
  }

  const generateConstraints = request => core.chooseItem(constraintsPool(request), request, family);
  const api = {constraintsPool, generateConstraints, gradeConstraints};
  root.GliaxR192Constraints = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

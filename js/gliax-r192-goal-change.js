(function (root) {
  'use strict';
  const core = typeof module !== 'undefined' ? require('./gliax-r192-executive') : root.GliaxR192Executive;
  const {shuffled, outcome} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;
  const changePlan = typeof module !== 'undefined' ? require('./gliax-r192-cp') : root.GliaxR192CP;
  const family = 'goal-change';
  const ages = ['early', 'junior', 'primary', 'middle', 'teen'];

  function priorityCandidates(changed) {
    return [
      {id: 'materials', label: 'Preparar el material del encuentro', advances: ['start-on-time']},
      {id: 'review', label: 'Revisar las instrucciones del encuentro', advances: ['start-on-time']},
      changed
        ? {id: 'notify', label: 'Enviar el cambio de hora a quienes asisten', advances: ['update-attendees']}
        : {id: 'inbox', label: 'Contestar los mensajes sin plazo', advances: []}
    ];
  }

  function matchesPriority(candidate, model) {
    return candidate.advances.includes(model.goal) === model.seekProgress;
  }

  function fromLegacy(request, source, contextIndex) {
    const changed = request.level === 2;
    const context = source.stimulus[0].text.split('. ')[0] + '.';
    const options = priorityCandidates(changed);
    const key = 'priority-' + contextIndex;
    const model = {
      mode: 'constraint_solver', kind: 'priority', goal: changed ? 'update-attendees' : 'start-on-time',
      seekProgress: changed, candidates: options
    };
    const q = changed ? '¿Qué haces primero para atender al objetivo de ahora?' : '¿Qué puedes dejar para después del inicio?';
    const stimulus = [
      core.text(context),
      core.text(changed
        ? 'El encuentro se ha aplazado. Las personas convocadas todavía cuentan con la hora anterior. Puedes empezar una sola tarea ahora.'
        : 'El encuentro empieza pronto. Para empezar a tiempo hacen falta el material y las instrucciones revisadas. Los mensajes pueden esperar.')
    ];
    const opts = shuffled(options, request.seed, key + ':options').map(option => option.label);
    const solution = options.filter(option => matchesPriority(option, model));
    if (solution.length !== 1) throw new Error('The documented priority case needs one choice');
    return core.createItem(request, family, key,
      {kind: 'priority', goal: model.goal, seekProgress: model.seekProgress},
      {q, stimulus, opts}, model, {type: 'standard', responseType: 'choice', requiresStimulus: true,
        q, stimulus, opts, a: solution[0].label}, source.id);
  }

  function fromReference(request, id) {
    const source = changePlan.getChangePlan(id, request.seed);
    const {prompt, options} = source.presentation;
    const reasoned = source.answerModel.mode === 'reasoned_decision';
    const opts = options.map(option => option.label);
    const q = prompt;
    const stimulus = [core.text(prompt)];
    const model = {mode: source.answerModel.mode, kind: 'reference', referenceId: id, options};
    const legacy = reasoned
      ? {type: 'self', responseType: 'written', assessment: 'self', requiresStimulus: true, q, stimulus}
      : {type: 'standard', responseType: 'choice', requiresStimulus: true, q, stimulus, opts,
        a: options.find(option => changePlan.gradeChangePlan(source, option.id).gradedCorrect).label};
    return core.createItem(request, family, id.toLowerCase(), {reference: source.cognitiveFingerprint},
      {q, opts}, model, legacy, id);
  }

  function goalChangePool(request) {
    core.validateRequest(request);
    const {ageBand, level} = request;
    const id = 'CP' + String(ages.indexOf(ageBand) * 3 + level).padStart(2, '0');
    const items = [];
    if (!['CP11', 'CP14'].includes(id)) items.push(fromReference(request, id));
    if (level < 3) {
      for (const source of core.sourceItems(request, 'executive_goal_change')) {
        const match = source.id.match(/priority-(\d+)-0$/);
        if (match) items.push(fromLegacy(request, source, match[1]));
      }
    }
    return items;
  }

  function generateGoalChange(request) {
    const groups = new Map();
    for (const item of goalChangePool(request)) {
      const key = item.cognitiveFingerprint;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    const group = core.chooseItem([...groups.values()], request, family);
    return group ? core.chooseItem(group, request, family + ':context') : null;
  }

  function gradeGoalChange(item, response) {
    const model = item.answerModel;
    if (model.kind === 'priority') {
      const candidate = model.candidates.find(row => row.id === response || row.label === response);
      return outcome(candidate ? (matchesPriority(candidate, model) ? 'correct' : 'incorrect') : 'uninterpretable');
    }
    const source = changePlan.getChangePlan(model.referenceId, 0);
    if (model.mode === 'reasoned_decision') return changePlan.gradeChangePlan(source, response);
    const option = model.options.find(option => option.id === response || option.label === response);
    const result = option ? changePlan.gradeChangePlan(source, option.id) : outcome('uninterpretable');
    if (source.answerModel.routes) {
      const {routes, deadline, budget} = source.answerModel;
      return {...result, resolution: routes.some(([, , arrival, cost]) => arrival < deadline && cost <= budget) ? 'has_solution' : 'no_solution'};
    }
    return result;
  }

  const api = {goalChangePool, generateGoalChange, gradeGoalChange};
  root.GliaxR192GoalChange = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

(function (root) {
  'use strict';
  const core = typeof module !== 'undefined' ? require('./gliax-r192-executive') : root.GliaxR192Executive;
  const {shuffled, outcome} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;
  const {getChangePlan} = typeof module !== 'undefined' ? require('./gliax-r192-cp') : root.GliaxR192CP;
  const family = 'planning';

  function solveOrders({steps, before, completed = []}) {
    const orders = [];
    function visit(order) {
      if (order.length === steps.length) {
        orders.push(order.slice(completed.length));
        return;
      }
      for (const step of steps) {
        if (order.includes(step) || !before.every(([a, b]) => b !== step || order.includes(a))) continue;
        visit([...order, step]);
      }
    }
    if (!completed.every((step, i) => steps.includes(step) && completed.indexOf(step) === i &&
      before.every(([a, b]) => b !== step || completed.slice(0, i).includes(a)))) return orders;
    visit(completed);
    return orders;
  }

  function build(request, key, sourceId, prompt, steps, before, completed = [], sourceRules = false) {
    const model = {mode: 'sequence_constraints', steps, before, completed};
    const options = solveOrders({...model, steps: steps.map(step => step.id)});
    if (!options.length) throw new Error('Documented planning case has no solution');
    const showLabel = id => steps.find(step => step.id === id).label;
    const tokens = shuffled(steps.filter(step => !completed.includes(step.id)), request.seed, key + ':tokens').map(step => step.label);
    const stimulus = [core.text(prompt)];
    if (completed.length) stimulus.push(core.text('Ya está hecho: ' + completed.map(showLabel).join(', ') + '.'));
    // Ordinary procedural sequencing must not disclose each predecessor as a solved chain.
    // Constraint-based CP cases retain their contextual rules in the authored prompt.
    const q = completed.length ? 'Ordena lo que queda por hacer.' :
      sourceRules ? 'Ordena las acciones según las condiciones del encargo.' :
      'Ordena los pasos para alcanzar el objetivo.';
    const answer = options[0].map(showLabel);
    return core.createItem(request, family, key, {before, completed, steps: steps.length},
      {q, stimulus, tokens}, model,
      {type: 'order', responseType: 'order', requiresStimulus: true, q, stimulus, tokens, answer}, sourceId);
  }

  function planningPool(request) {
    core.validateRequest(request);
    const donors = core.sourceItems(request, 'executive_dependencies');
    const items = donors.map((source, index) => {
      const steps = source.answer.map((label, i) => ({id: 's' + i, label}));
      const before = steps.slice(1).map((step, i) => [steps[i].id, step.id]);
      const completed = request.ageBand === 'early' && request.level === 3 ? [steps[0].id] : [];
      const marker = source.q.indexOf(' Ordena');
      const prompt = marker > 0 ? source.q.slice(0, marker) : 'Prepara la actividad.';
      return build(request, 'dependency-' + index, source.id, prompt, steps, before, completed);
    });
    const reference = {'middle:2': 'CP11', 'teen:2': 'CP14'}[request.ageBand + ':' + request.level];
    if (reference) {
      const source = getChangePlan(reference, request.seed);
      items.push(build(request, reference.toLowerCase(), reference, source.presentation.prompt,
        source.answerModel.steps.map(id => source.presentation.steps.find(step => step.id === id)), source.answerModel.before, [], true));
    }
    return items;
  }

  function gradePlanning(item, response) {
    const model = item.answerModel;
    const solutions = solveOrders({...model, steps: model.steps.map(step => step.id)});
    const resolution = solutions.length ? 'has_solution' : 'no_solution';
    const finish = status => ({...outcome(status), resolution});
    if (response === 'no-solution') return finish(resolution === 'no_solution' ? 'correct' : 'incorrect');
    if (!Array.isArray(response)) return finish('uninterpretable');
    const ids = response.map(value => model.steps.find(step => step.id === value || step.label === value)?.id);
    if (ids.includes(undefined)) return finish('uninterpretable');
    const valid = solutions.some(solution => solution.length === ids.length && solution.every((id, i) => id === ids[i]));
    return finish(valid ? 'correct' : 'incorrect');
  }

  const generatePlanning = request => core.chooseItem(planningPool(request), request, family);
  const api = {planningPool, generatePlanning, gradePlanning, solveOrders};
  root.GliaxR192Planning = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

(function (root) {
  'use strict';

  const common = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;
  const editorial = typeof module !== 'undefined' ? require('./gliax-r193-editorial') : root.GliaxR193Editorial;
  const bank = typeof module !== 'undefined' ? require('./gliax-r192-bank') : root.GliaxR192Bank;
  const planning = typeof module !== 'undefined' ? require('./gliax-r192-planning') : root.GliaxR192Planning;
  const constraints = typeof module !== 'undefined' ? require('./gliax-r192-constraints') : root.GliaxR192Constraints;
  const goal = typeof module !== 'undefined' ? require('./gliax-r192-goal-change') : root.GliaxR192GoalChange;
  const supervision = typeof module !== 'undefined' ? require('./gliax-r192-supervision') : root.GliaxR192Supervision;

  const variants = typeof module !== 'undefined' ? require('./gliax-r192-rule-variants') : root.GliaxR192RuleVariants;

  const ages = Object.freeze(['early', 'junior', 'primary', 'middle', 'teen']);
  const levels = Object.freeze([1, 2, 3]);
  const families = Object.freeze(['CP', 'EC', 'IN', 'AR', 'planning', 'constraints', 'goal-change', 'supervision']);
  const pools = {
    planning: planning.planningPool, constraints: constraints.constraintsPool,
    'goal-change': goal.goalChangePool, supervision: supervision.supervisionPool
  };
  const referenceSlots = new Map();
  for (const id of bank.getCaseIds()) {
    const item = bank.getCase(id, 0);
    const key = [item.family, item.ageBand, item.level].join(':');
    if (!referenceSlots.has(key)) referenceSlots.set(key, []);
    referenceSlots.get(key).push(id);
  }

  function contextOf(item) {
    if (item.family === 'IN' && item.id === 'IN-06 complete-data') return 'IN06';
    if (item.family === 'AR') {
      const stimuli = item.answerModel.stimuli.filter(stimulus => !stimulus.cue);
      if (stimuli.some(stimulus => stimulus.category)) return 'animal-object';
      if (stimuli.some(stimulus => stimulus.letter)) return 'shapes-colors-letters';
      return stimuli.some(stimulus => stimulus.color) ? 'shapes-colors' : 'shapes';
    }
    const source = item.mechanismContext ?? item.sourceId ?? item.id;
    const project = source.match(/-(?:resources|time)-(\d+)-\d+$/);
    if (project) return 'project-' + project[1];
    return source.replace(/^curriculum-v2-[a-z]+-executive-\d-/, '').replace(/(priority-\d+)-\d+$/, '$1');
  }

  function ruleShape(model) {
    if (model.kind === 'resources') return ['budget', 'quantity', ...(model.rules.availableToday ? ['availability'] : [])];
    if (model.kind === 'duration') return ['duration', model.minutes.length];
    if (model.kind === 'review' || model.kind === 'repair') return model.conditions.map(rule => rule.operator).sort();
    if (model.kind === 'priority') return [model.goal, model.seekProgress];
    if (model.kind === 'reference') return ruleShape(bank.getCase(model.referenceId, 0).answerModel);
    if (model.before) return [model.before, model.completed ?? []];
    if (model.violations) return [...new Set(Object.values(model.violations).flat())].sort();
    if (model.routes) return ['arrival-before', 'budget-at-most'];
    if (model.facts) {
      const {kind, subject, window, updated, operation} = model.facts;
      return [kind, subject ?? null, window ?? null, Boolean(updated), operation ?? null];
    }
    if (model.rule) {
      const {initial, maps, reverse, veto} = model.rule;
      return [initial, maps, reverse ?? null, veto ?? null];
    }
    return [model.mode, Boolean(model.equivalents?.partial.length), Boolean(model.components)];
  }

  const planMechanisms = {
    substitution: 'reallocation', capacity: 'reallocation', setting: 'reallocation',
    availability: 'reallocation', delegation: 'reallocation',
    'retain-requirements': 'requirement-retention',
    reschedule: 'time-window', 'fixed-window': 'time-window', deadline: 'time-window',
    reorder: 'precedence', dependencies: 'precedence', 'dependencies-schedule': 'precedence',
    'unknown-policy': 'verify-unknown', infeasibility: 'joint-feasibility',
    'reasoned-decision': 'reasoned-decision'
  };

  function mechanismOf(item) {
    if (item.editorial) return item.mechanic;
    const model = item.answerModel;
    if (item.family === 'CP') return planMechanisms[item.mechanic] ?? item.mechanic;
    if (item.family === 'EC' && ['format', 'requirement'].includes(model.facts.kind)) return 'compliance';
    if (item.family === 'planning') return model.completed.length ? 'resume-precedence' : 'precedence';
    if (model.kind === 'reference') return mechanismOf(bank.getCase(model.referenceId, 0));
    if (model.kind && Object.hasOwn(pools, item.family)) return model.kind;
    return item.mechanic;
  }

  function describe(item) {
    return {
      id: item.id, family: item.family, ageBand: item.ageBand, level: item.level,
      context: contextOf(item), mechanism: mechanismOf(item),
      restrictions: common.fingerprint(ruleShape(item.answerModel)),
      structure: item.cognitiveFingerprint, surface: item.surfaceFingerprint
    };
  }

  function candidates({family, ageBand, level, seed, includeVariants = true, includeEditorial = false}) {
    if (!families.includes(family) || !ages.includes(ageBand) || !levels.includes(level)) return [];
    const create = Object.hasOwn(pools, family) ? pools[family] : null;
    const items = create
      ? create({ageBand, level, seed})
      : (referenceSlots.get([family, ageBand, level].join(':')) ?? []).map(id => bank.getCase(id, seed));
    if (family === 'AR' && includeVariants) items.push(...items.flatMap(variants.expandRules));
    if (includeEditorial) items.push(...editorial.pool({family,ageBand,level,seed}));
    return items.map(item => ({...describe(item), item}));
  }

  function summarize(entries) {
    const unique = key => new Set(entries.map(entry => entry[key])).size;
    return {
      candidates: unique('id'), surfaces: unique('surface'), contexts: unique('context'),
      restrictions: unique('restrictions'), structures: unique('structure'), mechanisms: unique('mechanism')
    };
  }

  const api = {ages, levels, families, candidates, describe, summarize};
  root.GliaxR192Diversity = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

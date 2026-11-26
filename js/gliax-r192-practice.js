(function (root) {
  'use strict';

  const modes = {
    CP: {label: 'Cambio de plan', area: 'executive'},
    EC: {label: 'Encuentra la contradicción', area: 'attention'},
    IN: {label: '¿Qué necesitas saber?', area: 'executive'},
    AR: {label: 'Actúa con reglas', area: 'executive', supports: age => age !== 'early',
      grade: root.GliaxR192AR.gradeRuleAction},
    planning: {label: 'Planificación', area: 'executive',
      grade: root.GliaxR192Planning.gradePlanning},
    constraints: {label: 'Recursos y tiempo', area: 'executive', supports: age => age !== 'early',
      grade: root.GliaxR192Constraints.gradeConstraints},
    'goal-change': {label: 'Cambio de objetivo', area: 'executive',
      grade: root.GliaxR192GoalChange.gradeGoalChange},
    supervision: {label: 'Supervisión', area: 'executive',
      grade: root.GliaxR192Supervision.gradeSupervision}
  };
  const {ages, levels, candidates} = root.GliaxR192Diversity;
  const enabled = () => root.LH_CONFIG?.staging === true ||
    (['localhost', '127.0.0.1', '[::1]'].includes(root.location?.hostname) && root.LH_CONFIG?.r192Practice === true);

  function available(area, age, level) {
    return enabled() && ages.includes(age) && levels.includes(level)
      ? Object.entries(modes).filter(([, mode]) => mode.area === area && (!mode.supports || mode.supports(age)))
      : [];
  }

  function createSession(seed) {
    const sessionSeed = seed ?? Array.from(root.crypto.getRandomValues(new Uint32Array(2))).join('-');
    const selector = root.GliaxR192Selector.createSelector(sessionSeed);
    const turns = new Map();

    function next(family, area, ageBand, level) {
      if (!available(area, ageBand, level).some(([key]) => key === family)) return null;
      const query = {family, ageBand, level};
      const slot = [family, ageBand, level].join(':');
      const turn = turns.get(slot) ?? 0;
      const seedForRound = root.GliaxR192Selector.presentationSeed(sessionSeed, query, turn);
      const pool = candidates({...query, seed: seedForRound});
      const selection = selector.next(query, pool);
      if (!selection) return null;
      turns.set(slot, turn + 1);
      selection.item.interactiveOnly = true;
      selection.item.singleCase = pool.length === 1;
      return selection.item;
    }

    return {next};
  }

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function button(label, action, className = 'secondary-btn') {
    const el = node('button', label, className);
    el.type = 'button';
    el.addEventListener('click', action);
    return el;
  }

  function choices(area, label, options, multiple = false) {
    const group = node('fieldset', '', 'r192-choices');
    group.append(node('legend', label));
    const fields = options.map(({id, label}) => {
      const line = node('label', '', 'r192-choice');
      const field = node('input');
      field.type = multiple ? 'checkbox' : 'radio';
      line.append(field, node('span', label));
      group.append(line);
      return {field, id};
    });
    if (!multiple) fields.forEach(({field}) => {field.name = 'r192-' + label;});
    area.append(group);
    return () => {
      const selected = fields.filter(({field}) => field.checked).map(({id}) => id);
      return multiple ? selected : selected[0];
    };
  }

  function order(area, steps) {
    const ordered = [...steps];
    const list = node('ol', '', 'r192-order');
    function render(focus) {
      list.replaceChildren(...ordered.map((step, index) => {
        const row = node('li');
        const up = button('Subir', () => move(index, -1));
        const down = button('Bajar', () => move(index, 1));
        for (const control of [up, down]) control.setAttribute('aria-label', control.textContent + ' ' + step.label);
        up.disabled = index === 0;
        down.disabled = index === ordered.length - 1;
        row.append(node('span', step.label), up, down);
        return row;
      }));
      if (focus !== undefined) list.children[focus].querySelector('button:not(:disabled)')?.focus();
    }
    function move(index, direction) {
      const target = index + direction;
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
      render(target);
    }
    render();
    area.append(node('p', 'Usa Subir y Bajar para ordenar los pasos.'), list);
    return () => ordered.map(step => step.id);
  }

  function validSubmit(area, getResponse, finish) {
    area.append(button('Comprobar', () => {
      const response = getResponse();
      if (response !== undefined) finish(response);
    }, 'primary-btn'));
  }

  function renderPlan(item, {visual, area}, finish) {
    const {goal, options, steps} = item.presentation;
    if (goal) {
      const list = node('ul');
      list.append(...goal.map(condition => node('li', condition)));
      visual.append(list);
    }
    if (steps) return validSubmit(area, order(area, steps), finish);
    if (item.answerModel.mode === 'reasoned_decision') return renderReasoned(area, options, finish);
    return validSubmit(area, choices(area, 'Tu respuesta', options), finish);
  }

  function renderReasoned(area, options, finish) {
    const selected = choices(area, 'Tu decisión', options);
    const reasons = choices(area, '¿Qué condiciones respaldan tu decisión?', [
      {id: 'attendance-unconfirmed', label: 'Aún no se sabe quién asistirá'},
      {id: 'accept-availability-risk', label: 'Aceptamos que quizá se agoten las plazas'},
      {id: 'cancellation-worth-cost', label: 'Pagar más compensa si necesitamos cancelar'}
    ], true);
    validSubmit(area, () => selected() ? {choice: selected(), components: reasons()} : undefined, finish);
  }

  function renderExecutive(item, {visual, area, profile}, finish) {
    if (item.presentation.stimulus) {
      const context = node('div', '', 'r192-context');
      context.innerHTML = root.ActivityModel.interactiveStimulus(item.presentation.stimulus, {iconProfile: profile});
      if (context.querySelector('table')) {
        context.tabIndex = 0;
        context.setAttribute('role', 'region');
        context.setAttribute('aria-label', 'Material para resolver el ejercicio');
      }
      visual.append(context);
    }
    if (item.responseType === 'order') {
      return validSubmit(area, order(area, item.tokens.map(label => ({id: label, label}))), finish);
    }
    if (item.answerModel.mode === 'reasoned_decision') {
      return renderReasoned(area, item.answerModel.options, finish);
    }
    const multiple = item.responseType === 'multiple';
    const options = item.opts.map(label => ({id: label, label}));
    validSubmit(area, choices(area, multiple ? 'Marca los apartados' : 'Tu respuesta', options, multiple), finish);
  }

  function renderSources(item, {visual, area}, finish) {
    const data = item.presentation;
    const {rows, options, evidenceRequired} = data;
    if (data.visual) {
      const figure = node('figure', '', 'r192-quantity');
      figure.append(node('figcaption', data.visual.label));
      data.visual.groups.forEach((size, index) => {
        const group = node('span', '● '.repeat(size).trim());
        group.setAttribute('role', 'img');
        group.setAttribute('aria-label', 'Grupo ' + (index + 1) + ', ' + size + ' ' + data.visual.unit);
        figure.append(group);
      });
      visual.append(figure);
    }
    if (!evidenceRequired) {
      const list = node('ul');
      list.append(...rows.map(({text}) => node('li', text)));
      visual.append(list);
    }
    const selected = choices(area, 'Tu respuesta', options);
    const evidence = evidenceRequired
      ? choices(visual, 'Marca los datos que apoyan tu respuesta', rows.map(({id, text}) => ({id, label: text})), true)
      : () => [];
    validSubmit(area, () => selected() ? {choice: selected(), evidence: evidence()} : undefined, finish);
  }

  function renderInformation(item, {area}, publish) {
    const round = root.GliaxR192IN.startInformation(item);
    const open = node('div', '', 'r192-open');
    const label = node('label', 'Escribe tu respuesta');
    const draft = node('textarea');
    draft.id = 'r192-open-answer';
    draft.rows = 3;
    draft.maxLength = 500;
    draft.autocomplete = 'off';
    draft.spellcheck = false;
    label.htmlFor = draft.id;
    open.append(label, draft);
    const hint = node('p');
    hint.setAttribute('role', 'status');
    hint.hidden = true;
    const options = node('div');
    const hints = button('Necesito una pista', () => {
      hint.textContent = round.showHint(draft.value);
      hint.hidden = false;
      hints.disabled = true;
    });
    const choicesButton = button('Ver alternativas', () => {
      const assisted = round.showOptions(draft.value);
      draft.value = '';
      open.hidden = true;
      choicesButton.disabled = true;
      validSubmit(options, choices(options, 'Elige una opción con ayuda', assisted),
        id => publish(round.submitChoice(id), round.summary().event.support));
      options.querySelector('input').focus();
    });
    const check = button('Comprobar', () => publish(round.submitOpen(draft.value), round.summary().event.support), 'primary-btn');
    open.append(check);
    if (item.presentation.supervisedOralAvailable) {
      area.append(node('p', 'También puedes responder en voz alta y pedir a la persona que te acompaña que escriba tu respuesta.'));
    }
    const help = node('div', '', 'r192-help');
    help.append(hints, choicesButton);
    area.append(open, help, hint, options);
  }

  const messages = {
    correct: 'Bien. Tu respuesta cumple las condiciones.',
    incorrect: 'Revisa la situación y las condiciones antes de volver a intentarlo.',
    partial: 'Has acertado en parte. Revisa qué datos apoyan tu respuesta.',
    uninterpretable: 'No hemos podido interpretar la respuesta. Puedes intentarlo de nuevo.',
    pending_review: 'Esta respuesta necesita revisión. Puedes completar o explicar mejor tu decisión.',
    no_response: 'Todavía falta tu respuesta.'
  };

  function renderRuleAction(item, {visual, area}, finish) {
    const {events} = item.presentation;
    const {rule, measuresWithholding} = item.answerModel;
    const actions = [...new Set(Object.values(rule.maps).flatMap(map => Object.values(map)))].filter(action => action !== 'wait');
    const responses = Object.create(null);
    const card = node('div', '', 'r192-rule-card');
    const controls = node('div', '', 'r192-rule-controls');
    visual.append(card);
    area.append(controls);
    if (measuresWithholding) {
      area.prepend(node('p', 'Cuando la regla pida esperar, continúa sin marcar una respuesta.'));
    }
    let index = 0;
    function advance() {
      index++;
      if (index === events.length) {
        controls.replaceChildren();
        finish(responses);
      } else render(true);
    }

    function render(focus) {
      const event = events[index];
      const signal = event.type === 'signal';
      card.dataset.event = signal ? 'signal' : 'trial';
      const label = node('p', event.label, 'r192-rule-label');
      label.tabIndex = -1;
      card.replaceChildren();
      controls.replaceChildren();
      if (signal) {
        card.append(node('strong', 'Señal de regla'), label);
        controls.append(button('Continuar', advance, 'primary-btn'));
      } else {
        const {form, color, name, border, star, letter} = event.stimulus;
        if (form) {
          const glyph = node('span', ({círculo: '●', cuadrado: '■', triángulo: '▲'})[form], 'r192-rule-glyph');
          glyph.setAttribute('aria-hidden', 'true');
          if (color) glyph.dataset.color = color;
          if (border) glyph.classList.add('r192-rule-border');
          if (letter) glyph.append(node('span', letter, 'r192-rule-letter'));
          card.append(glyph);
        } else if (name) {
          const picture = node('span', '', 'r192-rule-picture');
          picture.setAttribute('aria-hidden', 'true');
          picture.innerHTML = root.ActivityModel.visualLabel(name);
          if (star) picture.append(node('span', '★'));
          card.append(picture);
        }
        card.append(label);
        let selected = null;
        const choices = actions.map(action => {
          const control = button(action === 'act' ? 'Responder' : action, () => {
            selected = selected === action ? null : action;
            choices.forEach(({key, control}) => control.setAttribute('aria-pressed', String(key === selected)));
          });
          control.setAttribute('aria-pressed', 'false');
          return {key: action, control};
        });
        controls.append(...choices.map(({control}) => control), button('Siguiente estímulo', () => {
          responses[event.id] = selected;
          advance();
        }, 'primary-btn'));
      }
      if (focus) label.focus();
    }

    render(false);
  }

  function mount(item, ui) {
    const {area, visual, prompt, feedback, next, retry} = ui;
    const section = area.closest('#exercise');
    const title = item.presentation.prompt ?? item.presentation.q;
    prompt.textContent = title;
    area.classList.add('r192-response');
    section?.classList.add('r192-active');
    area.dataset.case = item.id;
    area.dataset.age = item.ageBand;
    area.dataset.level = String(item.level);
    feedback.setAttribute('role', 'status');
    feedback.className = 'feedback';
    const note = node('p', 'Práctica en memoria. El resultado no se guarda y la actividad solo está disponible en pantalla.', 'muted r192-note');
    visual.append(note);
    if (item.singleCase) visual.append(node('p', 'En este nivel hay un único caso de esta modalidad.', 'muted r192-note'));
    const repeat = button('Repetir', retry);
    repeat.hidden = true;
    function publish(result, support) {
      const help = {spontaneous: 'Respuesta espontánea.', hint: 'Respuesta con pista.', options: 'Respuesta con alternativas.'};
      const score = item.family === 'AR' && result.metrics
        ? result.metrics.correct + ' de ' + result.metrics.scored + ' estímulos correctos.'
        : '';
      feedback.textContent = [messages[result.status], help[support], score].filter(Boolean).join(' ');
      feedback.className = 'feedback ' + ({correct: 'ok', incorrect: 'bad'}[result.status] ?? 'practice');
      feedback.dataset.status = result.status;
      if (result.status === 'no_response') return;
      next.textContent = 'Siguiente →';
      next.classList.remove('hidden');
      repeat.hidden = false;
      if (item.family === 'IN' && result.status !== 'correct') return;
      [...area.querySelectorAll('button, input, textarea'), ...visual.querySelectorAll('input')].forEach(control => {control.disabled = true;});
      repeat.disabled = false;
      next.focus();
    }
    const grade = modes[item.family].grade ?? root.GliaxR192Bank.gradeCase;
    const finish = response => publish(grade(item, response));
    if (item.family === 'CP') renderPlan(item, ui, finish);
    else if (item.family === 'EC') renderSources(item, ui, finish);
    else if (item.family === 'IN') renderInformation(item, ui, publish);
    else if (item.family === 'AR') renderRuleAction(item, ui, finish);
    else renderExecutive(item, ui, finish);
    area.append(repeat);
    return () => {
      area.replaceChildren();
      visual.replaceChildren();
      feedback.textContent = '';
      feedback.removeAttribute('role');
      delete feedback.dataset.status;
      delete area.dataset.case;
      delete area.dataset.age;
      delete area.dataset.level;
      area.classList.remove('r192-response');
      section?.classList.remove('r192-active');
      next.classList.add('hidden');
    };
  }

  root.GliaxR192Practice = {available, createSession, mount};
})(globalThis);

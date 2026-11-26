(function (root) {
  'use strict';

  function createRotation() {
    const slots = new Map();
    let revision = 0;
    return {
      peek(slot, formats) {
        if (!formats.length) return null;
        const previous = slots.get(slot);
        const format = formats[(formats.indexOf(previous) + 1) % formats.length];
        return {slot, format, previous, revision};
      },
      confirm(choice) {
        if (choice.revision === revision && slots.get(choice.slot) === choice.previous) slots.set(choice.slot, choice.format);
      },
      clear() {
        slots.clear();
        revision++;
      }
    };
  }

  function el(tag, className = '', text = '') {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  }

  function button(label, className, action) {
    const node = el('button', className, label);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }

  const searchable = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es');
  const dateLabel = new Intl.DateTimeFormat('es-ES', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  const dayName = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const hours = ['09:00','10:00','11:00','12:00','13:00'];
  const eventHours = ['09:15','10:30','11:45','12:30','13:00'];
  const dayMs = 86400000;
  const referenceMonday = Date.UTC(2026,4,18);
  const scheduledDay = 2;

  function shell(kind, name, caption) {
    const panel = el('section', 'r193-app r193-' + kind);
    panel.setAttribute('aria-label',name);
    const toolbar = el('header','r193-app-bar');
    const mark = el('span','r193-app-mark',kind==='calendar'?'◫':'⌕');
    mark.setAttribute('aria-hidden','true');
    toolbar.append(mark,el('strong','',name),el('span','r193-app-caption',caption));
    panel.append(toolbar);
    return panel;
  }

  function calendar(rows) {
    const panel = shell('calendar', 'Agenda de equipo', 'Calendario');
    const navigation = el('div','r193-calendar-nav');
    const date = el('h3','','');
    date.setAttribute('aria-live','polite');
    let week = 0, day = scheduledDay;
    function move(amount) {
      week += amount;
      draw();
    }
    const before = button('‹','r193-icon-btn',() => move(-1));
    const after = button('›','r193-icon-btn',() => move(1));
    before.setAttribute('aria-label','Semana anterior');
    after.setAttribute('aria-label','Semana siguiente');
    const reset = button('Semana del ejercicio','r193-secondary',() => {
      week = 0;
      day = scheduledDay;
      draw();
    });
    navigation.append(date,before,after,reset);
    const days = el('div','r193-calendar-days');
    days.setAttribute('role','group');
    days.setAttribute('aria-label','Días de la semana');
    const grid = el('div','r193-calendar-grid');
    const inspector = el('div','r193-event-detail');
    inspector.setAttribute('role','region');
    inspector.setAttribute('aria-label','Detalle del evento');
    inspector.setAttribute('aria-live','polite');
    const sourceDay = dateLabel.format(referenceMonday+scheduledDay*dayMs);
    const eventLabels = rows.map(([title,body],i) => ({title,body,hour:eventHours[i] ?? eventHours.at(-1)}));
    function eventButton(entry) {
      return button(entry.title,'r193-event',(ev) => {
        grid.querySelectorAll('.r193-event').forEach(node=>node.setAttribute('aria-pressed',String(node===ev.currentTarget)));
        inspector.replaceChildren(
          el('p','r193-source-meta',sourceDay+' · '+entry.hour),
          el('h4','',entry.title),el('p','',entry.body)
        );
      });
    }
    function draw(focusDay) {
      const monday = referenceMonday + 7*week*dayMs;
      const firstDay = new Date(monday).getUTCDate();
      date.textContent = firstDay+' – '+dateLabel.format(monday+6*dayMs);
      days.replaceChildren();
      grid.replaceChildren();
      inspector.replaceChildren(el('p','r193-empty','Abre un evento para leer sus detalles.'));
      const times = el('div','r193-calendar-times');
      hours.forEach(hour=>times.append(el('span','',hour)));
      grid.append(times);
      for (let i=0;i<7;i++) {
        const timestamp = monday+i*dayMs;
        const pick = button('','r193-day',() => {day=i; draw(i);});
        pick.setAttribute('aria-label',dayName[i]+' '+dateLabel.format(timestamp));
        pick.setAttribute('aria-pressed',String(day===i));
        pick.append(el('span','',dayName[i]),el('strong','',String(new Date(timestamp).getUTCDate())));
        days.append(pick);
        const column = el('div','r193-calendar-column');
        column.dataset.selected = String(day===i);
        if (week===0 && i===scheduledDay) {
          for (const [index, entry] of eventLabels.entries()) {
            const node=eventButton(entry);
            node.setAttribute('aria-pressed','false');
            node.prepend(el('span','r193-event-time',entry.hour));
            const slot = el('div','r193-event-slot');
            slot.dataset.row = String(Math.min(index,4));
            slot.append(node);
            column.append(slot);
          }
        } else if (day===i) {
          column.append(el('p','r193-empty','Sin eventos'));
        }
        grid.append(column);
      }
      if (focusDay!==undefined) days.children[focusDay].focus();
    }
    const schedules = el('div','r193-calendar-body');
    schedules.append(days,grid,inspector);
    panel.append(navigation,schedules);
    draw();
    return panel;
  }

  const filters = [
    ['all','Todas las fuentes'],['official','Oficiales'],['other','Otras fuentes']
  ];

  function search(rows) {
    const panel = shell('search', 'Lupa', 'Buscador');
    const form = el('form','r193-query');
    form.setAttribute('role','search');
    const input = el('input','');
    input.type='search';
    input.setAttribute('aria-label','Buscar en estos resultados');
    input.placeholder='Buscar';
    input.autocomplete='off';
    const submit = el('button','r193-primary','Buscar');
    submit.type='submit';
    form.append(input,submit);
    const tabs = el('div','r193-filters');
    tabs.setAttribute('role','group');
    tabs.setAttribute('aria-label','Filtrar fuentes');
    const status = el('p','r193-source-meta');
    status.setAttribute('role','status');
    const hits = el('ol','r193-hits');
    const detail = el('aside','r193-source-detail');
    detail.setAttribute('aria-label','Vista de la fuente');
    const list = el('div','r193-hit-list');
    list.append(status,hits);
    const results=el('div','r193-search-body');
    results.append(list,detail);
    let filter = 'all', phrase = '';
    function draw() {
      const words = searchable(phrase.trim()).split(/\s+/).filter(Boolean);
      hits.replaceChildren();
      detail.replaceChildren(el('p','r193-empty','Abre un resultado para consultar la fuente.'));
      const visible = rows.filter(([title,full])=>{
        const category = /\boficial\b/u.test(searchable(title)) ? 'official' : 'other';
        return (filter==='all'||category===filter) && words.every(word=>searchable(title+' '+full).includes(word));
      });
      status.textContent = visible.length === 1 ? '1 resultado' : visible.length > 1 ? visible.length+' resultados' : 'Sin coincidencias';
      if (!visible.length) {
        list.querySelector('.r193-empty-query')?.remove();
        list.append(el('p','r193-empty-query','Prueba otra consulta o cambia el filtro.'));
      } else {
        list.querySelector('.r193-empty-query')?.remove();
      }
      for (const [title,full] of visible) {
        const hit = el('li','r193-hit');
        const open = button(title,'r193-result-link',()=>{
          hits.querySelectorAll('button').forEach(node=>node.setAttribute('aria-expanded',String(node===open)));
          detail.replaceChildren(el('p','r193-source-meta','Vista de la fuente'),el('h4','',title),el('p','',full));
          detail.tabIndex=-1;
          detail.focus();
        });
        open.setAttribute('aria-expanded','false');
        const heading = el('h4','');
        heading.append(open);
        const words = full.trim().split(/\s+/);
        const snippet = words.length <= 4 ? full : words.slice(0,4).join(' ')+'…';
        hit.append(heading,el('p','',snippet));
        hits.append(hit);
      }
    }
    for (const [key,label] of filters) {
      const tab=button(label,'r193-filter',()=>{
        filter=key;
        [...tabs.children].forEach(node=>node.setAttribute('aria-pressed',String(node===tab)));
        draw();
      });
      tab.setAttribute('aria-pressed',String(key===filter));
      tabs.append(tab);
    }
    form.addEventListener('submit',event=>{
      event.preventDefault();
      phrase=input.value;
      draw();
    });
    input.addEventListener('input',()=>{
      if (input.value==='') {phrase='';draw();}
    });
    panel.append(form,tabs,results);
    draw();
    return panel;
  }

  function mount(container, item) {
    const block = item.stimulus?.find(entry=>entry.presentation==='digitalInterface');
    if (!block || block.rows.length<2) return;
    const original = container.querySelector('.digital-stimulus');
    if (!original) return;
    const rows = block.rows.slice(1);
    if (block.materialType==='editor') original.replaceWith(calendar(rows));
    if (block.materialType==='search') original.replaceWith(search(rows));
  }

  const api = {createRotation, mount};
  root.GliaxR193Digital = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

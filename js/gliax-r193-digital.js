(function (root) {
  'use strict';

  function createRotation() {
    const slots = new Map();
    const presentations = new Map();
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
      present(slot, item) {
        const allowed = compatiblePresentations(item);
        const key = [slot, item.simulation.format, item.simulation.operation].join(':');
        const previous = presentations.get(key);
        const choice = allowed.find(mode => mode !== previous) ?? allowed[0];
        presentations.set(key, choice);
        return choice;
      },
      clear() {
        slots.clear();
        presentations.clear();
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
    const icons={calendar:'◫',search:'⌕',chat:'••',mail:'✉',files:'▱',form:'▤',booking:'◷'};
    const mark = el('span','r193-app-mark',icons[kind]);
    mark.setAttribute('aria-hidden','true');
    toolbar.append(mark,el('strong','',name),el('span','r193-app-caption',caption));
    panel.append(toolbar);
    return panel;
  }

  function calendar(rows, interactive = true) {
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
    navigation.append(date);
    if (interactive) navigation.append(before,after,reset);
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
      if (interactive) inspector.replaceChildren(el('p','r193-empty','Abre un evento para leer sus detalles.'));
      else inspector.replaceChildren(...eventLabels.map(entry=>{
        const row=el('p','');
        row.append(el('strong','',entry.hour+' · '+entry.title+' '), document.createTextNode(entry.body));
        return row;
      }));
      const times = el('div','r193-calendar-times');
      hours.forEach(hour=>times.append(el('span','',hour)));
      grid.append(times);
      for (let i=0;i<7;i++) {
        const timestamp = monday+i*dayMs;
        const pick = interactive ? button('','r193-day',() => {day=i; draw(i);}) : el('span','r193-day');
        pick.setAttribute('aria-label',dayName[i]+' '+dateLabel.format(timestamp));
        if (interactive) pick.setAttribute('aria-pressed',String(day===i));
        else if (day===i) pick.setAttribute('aria-current','date');
        pick.append(el('span','',dayName[i]),el('strong','',String(new Date(timestamp).getUTCDate())));
        days.append(pick);
        const column = el('div','r193-calendar-column');
        column.dataset.selected = String(day===i);
        if (week===0 && i===scheduledDay) {
          for (const [index, entry] of eventLabels.entries()) {
            const node=interactive?eventButton(entry):el('span','r193-event',entry.title);
            if (interactive) node.setAttribute('aria-pressed','false');
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

  function compatiblePresentations(item) {
    if (item.type === 'memoryReveal' || item.type === 'memoryMulti') return ['static'];
    if (item.simulation.requiresAction || item.simulation.operation === 'sequence_dependencies') return ['interactive'];
    if (['app','search','message','mail','files','form','booking'].includes(item.simulation.format)) {
      return ['interactive','static'];
    }
    return ['static'];
  }

  function staticSource(kind, name, caption, rows) {
    const panel = shell(kind, name, caption);
    const list = el('ol','r193-static-list');
    for (const [title, body] of rows) {
      const entry = el('li','');
      entry.append(el('strong','',title),el('p','',body));
      list.append(entry);
    }
    panel.append(list);
    return panel;
  }

  function staticSearch(rows) {
    const panel = staticSource('search','Lupa','Buscador',rows);
    const list = panel.querySelector('.r193-static-list');
    panel.querySelector('header').after(el('p','r193-static-query',rows.length+' resultados'));
    list.classList.add('r193-hits');
    return panel;
  }

  function openEntries(kind, name, caption, rows, attachments) {
    const panel = shell(kind,name,caption);
    const workspace = el('div','r193-app-workspace');
    const reading = el('article','r193-app-reading');
    reading.setAttribute('aria-live','polite');
    reading.append(el('p','r193-empty','Elige una entrada para leerla.'));
    const index = el('div','r193-app-index');
    const title = el('h4','',kind==='mail'?'Bandeja de entrada':kind==='files'?'Carpetas':'Disponibilidad');
    index.append(title);
    const entries = [];
    for (const [label,text] of rows) {
      const separator=kind==='mail'?' · ':' / ';
      const split=label.indexOf(separator);
      const group=split>0?label.slice(0,split):'';
      const subject=split>0?label.slice(split+separator.length):label;
      const parent=el('div','r193-index-entry');
      const open = button(subject,'r193-open-entry',() => {
        entries.forEach(entry=>entry.control.setAttribute('aria-pressed',String(entry.control===open)));
        reading.replaceChildren(el('p','r193-source-meta',group),el('h4','',subject),el('p','',text));
        const attachment=text.match(/Adjuntos: ([^ ]+\.(?:pdf|ods))\b/i);
        if (kind==='mail' && attachment && Object.hasOwn(attachments ?? {}, attachment[1])) {
          const name=attachment[1];
          const reveal=el('details','r193-attachment');
          reveal.append(el('summary','',name),el('p','',attachments[name]));
          reading.append(reveal);
        }
      });
      open.setAttribute('aria-pressed','false');
      parent.append(el('p','r193-source-meta',group),open);
      index.append(parent);
      entries.push({parent,control:open,group,text});
    }
    if (kind==='files' || kind==='booking') {
      const filters = el('div','r193-filters');
      const values=kind==='files'?[...new Set(entries.map(entry=>entry.group))]:['Libre','En espera','Confirmad'];
      function choice(value,label) {
        const option=button(label,'r193-filter',()=>{
          [...filters.children].forEach(control=>control.setAttribute('aria-pressed',String(control===option)));
          let available=0;
          for (const entry of entries) {
            entry.parent.hidden = value!=='' && !(kind==='files'?entry.group===value:entry.text.startsWith(value));
            entry.control.setAttribute('aria-pressed','false');
            if (!entry.parent.hidden) available++;
          }
          reading.replaceChildren(el('p','r193-empty',available?'Elige una entrada para leerla.':'Sin entradas para este filtro.'));
        });
        option.setAttribute('aria-pressed',String(value===''));
        return option;
      }
      filters.append(choice('','Todas'));
      values.filter(value=>kind==='files'||entries.some(entry=>entry.text.startsWith(value)))
        .forEach(value=>filters.append(choice(value,value==='Confirmad'?'Confirmadas':value)));
      index.insertBefore(filters,title.nextSibling);
    }
    workspace.append(index,reading);
    panel.append(workspace);
    return panel;
  }

  function formScreen(block, rows, operation, interactive) {
    if (!interactive) return staticSource('form',block.label,'Formulario',rows);
    const panel=shell('form',block.label,'Formulario');
    const form=el('form','r193-form-content');
    form.noValidate=true;
    const fields=el('div','r193-fields');
    const result=el('p','r193-form-status');
    result.setAttribute('role','status');
    const field=el('label','r193-form-field',rows[1][0]);
    const description=el('span','r193-source-meta',rows[1][1]);
    description.id='r193-field-description';
    const numeric=operation==='validate_numeric_boundary';
    const control=el(numeric?'input':'select');
    control.setAttribute('aria-describedby',description.id);
    control.required=true;
    if (numeric) {
      control.type='number';control.min='1';control.max='3';control.step='1';control.value='5';
    } else {
      for (const day of ['','Lunes','Martes']) {
        const opt=el('option','',day||'Elige un día');
        opt.value=day;
        control.append(opt);
      }
    }
    field.append(description,control);
    for (const [index,[label,value]] of rows.entries()) {
      if (index===1) fields.append(field);
      else {
        const row=el('div','r193-form-field');
        row.append(el('strong','',label),el('span','r193-source-meta',value));
        fields.append(row);
      }
    }
    const submit=el('button','r193-primary','Revisar formulario');
    submit.type='submit';
    form.addEventListener('submit', event=>{
      event.preventDefault();
      const ok=control.checkValidity();
      control.setAttribute('aria-invalid',String(!ok));
      result.textContent=ok?'Los campos obligatorios están listos.':
        numeric?'Indica entre 1 y 3 unidades.':'Elige el día del taller.';
      if (!ok) control.focus();
    });
    control.addEventListener('input',()=>{
      control.removeAttribute('aria-invalid');
      result.textContent='';
    });
    form.append(fields,submit,result);
    panel.append(form);
    return panel;
  }

  function thread(rows, interactive) {
    const panel=staticSource('chat','Conversación','Mensajes',rows);
    const list=panel.querySelector('ol');
    list.classList.add('r193-thread');
    [...list.children].forEach((message,index)=>message.append(el('time','r193-source-meta','09:'+String(10+index*5))));

    if (!interactive) return panel;
    const form=el('form','r193-query');
    form.setAttribute('role','search');
    const input=el('input');
    input.type='search';
    input.placeholder='Buscar mensajes';
    input.setAttribute('aria-label','Buscar mensajes');
    const submit=el('button','r193-primary','Buscar');
    submit.type='submit';
    const feedback=el('p','r193-search-count');
    feedback.setAttribute('role','status');
    function filter() {
      let count=0;
      for (const entry of list.children) {
        entry.hidden=!searchable(entry.textContent).includes(searchable(input.value.trim()));
        if (!entry.hidden) count++;
      }
      feedback.textContent=count?count+' mensajes':'Sin coincidencias';
    }
    form.addEventListener('submit',event=>{event.preventDefault();filter();});
    input.addEventListener('input',()=>{if (!input.value)filter();});
    form.append(input,submit);
    list.before(form,feedback);
    return panel;
  }

  function mount(container, item) {
    const block = item.stimulus?.find(entry=>entry.presentation==='digitalInterface');
    if (!block || block.rows.length<2) return;
    const original = container.querySelector('.digital-stimulus');
    if (!original) return;
    const rows = block.rows.slice(1);
    const interactive = item.screenPresentation !== 'static';
    const format = item.simulation.format;
    let next;
    if (format==='app') next=calendar(rows,interactive);
    if (format==='search') next=interactive?search(rows):staticSearch(rows);
    if (format==='message' && !['memoryReveal','memoryMulti'].includes(item.type)) next=thread(rows,interactive);
    if (['mail','files','booking'].includes(format)) {
      const caption={mail:'Correo',files:'Archivos',booking:'Reservas'}[format];
      next=interactive?openEntries(format,block.label,caption,rows,block.attachments):staticSource(format,block.label,caption,rows);
    }
    if (format==='form') next=formScreen(block,rows,item.simulation.operation,interactive);
    if (next) {
      next.dataset.presentation = interactive?'interactive':'static';
      original.replaceWith(next);
    }
  }

  const api = {createRotation, compatiblePresentations, mount};
  root.GliaxR193Digital = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

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

  function element(tag, text) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    return node;
  }

  const searchable = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es');

  function search(panel) {
    const items = [...panel.querySelectorAll('.search-results li')];
    const toolbar = panel.querySelector('.search-field');
    if (!toolbar || !items.length) return;
    const label = element('label', 'Buscar en estos resultados');
    const input = element('input');
    input.type = 'search';
    input.autocomplete = 'off';
    const count = element('p');
    count.className = 'r193-search-status';
    count.setAttribute('role', 'status');
    label.append(input);
    toolbar.replaceChildren(label);
    panel.querySelector('.search-results').before(count);
    function filter() {
      const words = searchable(input.value.trim()).split(/\s+/).filter(Boolean);
      let visible = 0;
      for (const entry of items) {
        const text = searchable(entry.textContent);
        entry.hidden = !words.every(word => text.includes(word));
        if (!entry.hidden) visible++;
      }
      count.textContent = visible === 1 ? '1 resultado' : visible > 0 ? visible + ' resultados' : 'Sin coincidencias. Prueba otra búsqueda.';
    }
    input.addEventListener('input', filter);
    filter();
  }

  function agenda(panel) {
    const table = panel.querySelector('.team-agenda');
    if (!table) return;
    const rows = [...table.querySelectorAll('tbody tr')];
    if (!rows.length) return;
    const detail = element('div');
    detail.className = 'r193-agenda-detail';
    detail.hidden = true;
    detail.setAttribute('role', 'status');
    table.after(detail);
    for (const row of rows) {
      const heading = row.querySelector('th');
      const title = heading.textContent;
      const entry = row.querySelector('td').textContent;
      const open = element('button', title);
      open.type = 'button';
      open.setAttribute('aria-expanded', 'false');
      open.addEventListener('click', () => {
        const alreadyOpen = open.getAttribute('aria-expanded') === 'true';
        for (const button of table.querySelectorAll('button')) button.setAttribute('aria-expanded', 'false');
        detail.hidden = alreadyOpen;
        if (alreadyOpen) {
          detail.replaceChildren();
        } else {
          open.setAttribute('aria-expanded', 'true');
          detail.replaceChildren(element('strong', title), element('p', entry));
        }
      });
      heading.replaceChildren(open);
    }
  }

  function mount(container) {
    container.querySelectorAll('.digital-search').forEach(search);
    container.querySelectorAll('.digital-editor').forEach(agenda);
  }

  const api = {createRotation, mount};
  root.GliaxR193Digital = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

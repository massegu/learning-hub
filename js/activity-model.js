(function (root) {
  'use strict';
  const policy = root.ContentPolicy || (typeof require === 'function' && require('./content-policy.js'));
  const icons = { book:'libro', pencil:'lápiz', backpack:'mochila', bottle:'botella', notebook:'cuaderno', apple:'manzana', banana:'plátano', bread:'pan', cookie:'galleta', ball:'pelota', doll:'muñeca', bear:'oso de peluche', car:'coche de juguete', cap:'gorra', gift:'regalo' };
  const hasText = value => typeof value === 'string' && value.trim().length > 0;
  const fail = message => { throw new Error(`Actividad no imprimible: ${message}`); };
  function blockValid(block) {
    if (!block || typeof block !== 'object') fail('falta el estímulo.');
    if (block.type === 'text') { if (!hasText(block.text)) fail('el texto está vacío.'); }
    else if (block.type === 'list') {
      if (!Array.isArray(block.items) || !block.items.length || !block.items.every(hasText)) fail('la lista está incompleta.');
    } else if (block.type === 'table') {
      if (!Array.isArray(block.rows) || !block.rows.length || !block.rows.every(r => Array.isArray(r) && r.length && r.every(hasText)) || !block.rows.every(r => r.length === block.rows[0].length)) fail('la tabla está incompleta.');
    } else fail('el tipo de estímulo no tiene un renderizador compatible.');
    return block;
  }
  function legacyStimulus(item) {
    const blocks = [];
    const text = value => { if (hasText(value)) blocks.push({type:'text', text:value}); };
    const list = items => blocks.push({type:'list', items:items.map(String)});
    if (item.image || item.type === 'sceneAttention' || item.rounds || item.type === 'ruleSwitch') fail('imagen o mecánica todavía no compatible.');
    if (item.memoryContent) {
      if (!Array.isArray(item.memoryContent)) fail('la memoria no contiene una lista.');
      list(item.memoryContent.map(x => typeof x === 'string' ? x : x?.person && hasText(x.detail) ? `${x.person}: ${x.detail}` : x?.detail || ''));
    }
    text(item.scenario);
    if (item.text) text(item.title ? `${item.title}: ${item.text}` : item.text);
    if (item.model) text(`Modelo: ${item.model}`);
    if (item.modelSequence) text(`Modelo: ${item.modelSequence.join(' · ')}`);
    if (item.rows) blocks.push({type:'table', rows:item.rows.map((r, i) => [`Fila ${i + 1}`, ...r.map(String)])});
    if (item.visualItems) list(item.visualItems);
    if (item.grid) {
      const columns = item.gridColumns;
      if (!Number.isInteger(columns) || columns < 1 || item.grid.length % columns)
        fail('la cuadrícula no declara sus columnas.');
      blocks.push({type:'table', rows:Array.from({length:item.grid.length/columns}, (_, i) => item.grid.slice(i*columns,(i+1)*columns).map(String))});
    }
    if (item.stimuli) list(item.stimuli);
    if (item.sequence) list(item.sequence);
    if (item.angle !== undefined) text(`Ángulo: ${item.angle}°`);
    if (item.icons) {
      if (item.type === 'iconSearch' && !item.gridColumns) fail('la cuadrícula de iconos no declara su disposición.');
      if (!item.icons.every(k => icons[k])) fail('icono sin representación imprimible.');
      if (item.gridColumns) {
        const columns = item.gridColumns;
        if (!Number.isInteger(columns) || columns < 1 || item.icons.length % columns) fail('la cuadrícula de iconos está incompleta.');
        blocks.push({type:'table', rows:Array.from({length:item.icons.length/columns}, (_, i) => item.icons.slice(i*columns,(i+1)*columns).map(k=>icons[k]))});
      } else list(item.icons.map(k => icons[k]));
    }
    if (item.pairs) {
      if (!item.pairs.flat().every(k => icons[k])) fail('pareja sin representación imprimible.');
      if (item.targetPair) text(`Busca: ${item.targetPair.map(k => icons[k]).join(' + ')}`);
      blocks.push({type:'table', rows:item.pairs.map((r, i) => [String(i + 1), ...r.map(k => icons[k])])});
    }
    if (item.visual) {
      if (!root.document) fail('el estímulo HTML necesita el adaptador del navegador.');
      const holder = root.document.createElement('div');
      holder.innerHTML = String(item.visual);
      // Known textual documents can be represented without losing their labels.
      // Arbitrary SVG, pictures, spatial tasks and unknown HTML are rejected.
      const doc = holder.querySelector('.lh-doc');
      if (!doc || holder.querySelector('img,svg,canvas,script,style,iframe,[style*="url("]') || doc.querySelector('.search-board,.comic-grid'))
        fail('el componente visual no tiene una representación imprimible.');
      const tables = [...doc.querySelectorAll('table')];
      if (tables.some(t => [...t.rows].some(r => [...r.cells].some(c => c.colSpan !== 1 || c.rowSpan !== 1))))
        fail('la tabla visual contiene celdas combinadas sin adaptador.');
      tables.forEach(t => blocks.push({type:'table', rows:[...t.rows].map(r => [...r.cells].map(c => c.textContent.trim()))}));
      const elements = [...doc.querySelectorAll('.doc-kicker,.doc-route,.doc-grid span,.doc-lines span,.doc-total,.doc-due,.trip-row,.doc-note,.poster h3,.poster p,.product-grid>div,.catalog-grid>div')]
        .filter(el => !el.closest('table'));
      function textNodes(element) {
        const walker = root.document.createTreeWalker(element, 4);
        const nodes = []; let node;
        while ((node = walker.nextNode())) if (node.textContent.trim()) nodes.push(node);
        return nodes;
      }
      // Do not accept a document merely because its heading was recognized.
      // Every source text node must be covered by a supported component.
      if (textNodes(doc).some(node => ![...tables, ...elements].some(el => el.contains(node))))
        fail('el documento contiene información que el adaptador no puede conservar.');
      const lines = elements.map(el => textNodes(el).map(n => n.textContent.trim()).join(' ')).filter(Boolean);
      if (!tables.length && !lines.length) fail('el documento visual está vacío.');
      if (lines.length) list(lines);
    }
    return blocks;
  }
  function printable(item, profile) {
    if (!item || typeof item !== 'object') fail('falta la actividad.');
    if (item.stimulus !== undefined && (item.image || item.visual || item.rounds))
      fail('el componente adicional no tiene una representación imprimible.');
    if (policy.forProfile(profile)) policy.validateEarly(item);
    const stimulus = item.stimulus === undefined ? legacyStimulus(item) : item.stimulus;
    if (!Array.isArray(stimulus)) fail('falta la lista de estímulos.');
    stimulus.forEach(blockValid);
    const question = item.memoryQuestion || item.q || item.prompt || (item.dividend !== undefined ? `${item.dividend} ÷ ${item.divisor}` : '');
    if (!hasText(question)) fail('falta la pregunta.');
    const dependent = /memory|search|attention|match|cancel|sequence|scene/i.test(item.type || '') || Boolean(item.memoryQuestion);
    // Legacy questions are considered dependent by default. A standalone
    // exercise must explicitly declare that contract, or be numeric division.
    if (!stimulus.length && (dependent || item.requiresStimulus !== false) && item.dividend === undefined)
      fail('la pregunta no tiene el estímulo del que depende.');
    if (dependent && !stimulus.length) fail('falta el estímulo requerido.');
    const options = item.opts || [];
    if (!Array.isArray(options) || !options.every(x => (typeof x === 'string' || typeof x === 'number' && Number.isFinite(x)) && hasText(String(x)))) fail('las opciones están incompletas.');
    if (new Set(options.map(String)).size !== options.length) fail('hay opciones duplicadas.');
    const tokens = item.tokens || [];
    if (item.type === 'order') {
      if (!tokens.length || !tokens.every(hasText) || !Array.isArray(item.answer) || item.answer.length !== tokens.length || new Set(tokens).size !== tokens.length || new Set(item.answer).size !== tokens.length || !item.answer.every(x => tokens.includes(x))) fail('la secuencia no puede resolverse.');
    } else if (options.length) {
      const answers = item.answers || [item.a];
      if (!answers.length || !answers.every(a => a !== undefined && options.map(String).includes(String(a)))) fail('la respuesta no está en las opciones.');
    } else if (!item.sample && item.dividend === undefined) fail('la mecánica no tiene una respuesta compatible.');
    if (/memory/i.test(item.type || '') && !item.memoryContent?.length) fail('falta el material de memoria.');
    if (policy.forProfile(profile) && item.type === 'memoryReveal') {
      const evidence = item.answerEvidence;
      const block = stimulus[evidence?.block];
      let value;
      if (evidence?.type === 'listItem' && block?.type === 'list' && Number.isInteger(evidence.index)) value = block.items[evidence.index];
      else if (evidence?.type === 'tableCell' && block?.type === 'table' && Number.isInteger(evidence.row) && Number.isInteger(evidence.column)) {
        const row = block.rows[evidence.row];
        value = row?.[evidence.column];
        const subject = row?.[evidence.subjectColumn];
        const escaped = subject?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!Number.isInteger(evidence.subjectColumn) || !subject || !new RegExp(`(^|\\P{L})${escaped}(?=\\P{L}|$)`, 'u').test(question)) fail('la pregunta de memoria no identifica su referencia.');
      }
      if (value === undefined || value !== item.a) fail('la respuesta de memoria no se deriva del estímulo.');
    }
    return { question, stimulus, options:options.map(String), tokens, responseType:item.type === 'order' ? 'order' : options.length ? 'choice' : 'written' };
  }
  function validateBatch(versions, profile) {
    if (!Array.isArray(versions) || !versions.length || versions.some(v => !Array.isArray(v) || !v.length)) fail('el lote está vacío.');
    return versions.map(items => items.map(item => printable(item, profile)));
  }
  function forDelivery(item, profile, domain) {
    if (!policy.forProfile(profile)) return item;
    if (domain && item?.domain !== domain) fail('el área recibida no coincide con la solicitada.');
    // Identical contract at the domain boundary, on screen and in the exporter.
    // This applies to local, remote and future cache sources alike.
    printable(item, profile);
    return item;
  }
  function escape(text) { return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function interactiveStimulus(blocks) {
    return blocks.map(block => {
      blockValid(block);
      if (block.type === 'text') return `<p>${escape(block.text)}</p>`;
      if (block.type === 'list') return `<ul>${block.items.map(x => `<li>${escape(x)}</li>`).join('')}</ul>`;
      return `<table>${block.rows.map(row => `<tr>${row.map(x => `<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</table>`;
    }).join('');
  }
  const api = { printable, validateBatch, forDelivery, interactiveStimulus };
  root.ActivityModel = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

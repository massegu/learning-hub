(function (root) {
  'use strict';
  const policy = root.ContentPolicy || (typeof require === 'function' && require('./content-policy.js'));
  const art=root.StimulusArt || (typeof require==='function'&&require('./stimulus-art.js'));
  const icons = { book:'libro', pencil:'lápiz', backpack:'mochila', bottle:'botella', notebook:'cuaderno', apple:'manzana', banana:'plátano', bread:'pan', cookie:'galleta', ball:'pelota', doll:'muñeca', bear:'oso de peluche', car:'coche de juguete', cap:'gorra', gift:'regalo' };
  const hasText = value => typeof value === 'string' && value.trim().length > 0;
  const choiceKey = value => String(value).normalize('NFKC').trim().toLocaleLowerCase('es').replace(/\s+/g,' ').replace(/[.!?]+$/,'').replace(/^(?:el|la|los|las|un|una|unos|unas)\s+/,'');
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
    const early=Boolean(policy.forProfile(profile));
    if (new Set(options.map(early?choiceKey:String)).size !== options.length) fail('hay opciones duplicadas o equivalentes.');
    if(early && item.responseType==='choice' && options.length<2)fail('falta una opción alternativa.');
    const tokens = item.tokens || [];
    if (item.type === 'order') {
      if (!tokens.length || !tokens.every(hasText) || !Array.isArray(item.answer) || item.answer.length !== tokens.length || new Set(tokens.map(early?choiceKey:String)).size !== tokens.length || new Set(item.answer).size !== tokens.length || !item.answer.every(x => tokens.includes(x))) fail('la secuencia no puede resolverse.');
    } else if (options.length) {
      const answers = item.answers || [item.a];
      if (!answers.length || !answers.every(a => a !== undefined && options.map(String).includes(String(a)))) fail('la respuesta no está en las opciones.');
    } else if (!item.sample && item.dividend === undefined) fail('la mecánica no tiene una respuesta compatible.');
    if (/memory/i.test(item.type || '') && !item.memoryContent?.length) fail('falta el material de memoria.');
    if(early)validateEvidence(item,stimulus);
    if (policy.forProfile(profile) && item.type === 'memoryReveal') {
      const evidence = item.answerEvidence;
      const block = stimulus[evidence?.block];
      let value;
      if (evidence?.type === 'listItem' && block?.type === 'list' && Number.isInteger(evidence.index)) value = block.items[evidence.index];
      else if (evidence?.type === 'tableCell' && block?.type === 'table' && Number.isInteger(evidence.row) && Number.isInteger(evidence.column)) {
        const row = block.rows[evidence.row];
        value = row?.[evidence.column];
        const subject = row?.[evidence.subjectColumn];
        if(subject && block.rows.filter(r=>choiceKey(r[evidence.subjectColumn])===choiceKey(subject)).length!==1)fail('la referencia de memoria aparece más de una vez.');
        const escaped = subject?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!Number.isInteger(evidence.subjectColumn) || !subject || !new RegExp(`(^|\\P{L})${escaped}(?=\\P{L}|$)`, 'u').test(question)) fail('la pregunta de memoria no identifica su referencia.');
      }
      if (value === undefined || value !== item.a) fail('la respuesta de memoria no se deriva del estímulo.');
    }
    return { question, stimulus, options:options.map(String), tokens, responseType:item.type === 'order' ? 'order' : options.length ? 'choice' : 'written' };
  }
  function validateEvidence(item,stimulus){
    if(item.languageFocus==='spelling'){
      const e=item.languageEvidence,block=stimulus[e?.block];
      if(block?.type!=='text'||typeof e.word!=='string')fail('la actividad de ortografía no declara su palabra.');
      if(e.op==='complete'){
        if(!/_+/.test(block.text)||block.text.replace(/_+/,item.a)!==e.word)fail('las letras no completan la palabra.');
      }else if(e.op==='syllables'){
        if(block.text!==e.word || !Array.isArray(e.segments)||e.segments.join('')!==e.word || e.segments.join('-')!==item.a)fail('las sílabas no corresponden a la palabra.');
      }else fail('la mecánica de ortografía no es compatible.');
    }
    const e=item.quantityEvidence;
    if(['count','search','addition','subtraction','compare'].includes(item.ageProfile.mechanic) && !e)fail('el conteo o cálculo no declara sus unidades.');
    const counts=block=>{
      if(block?.type!=='list')fail('el conteo no tiene una lista de unidades.');
      if(!['count','cards'].includes(block.presentation))fail('las unidades contables deben mostrarse sin numeración.');
      return e.target?block.items.filter(x=>x===e.target).length:block.items.length;
    };
    if(e){
      let result;
      if(['count','sum','subtract'].includes(e.op)){
        if(!Array.isArray(e.blocks)||!e.blocks.length||!e.blocks.every(Number.isInteger)||new Set(e.blocks).size!==e.blocks.length)fail('referencias de conteo incompletas.');
        const values=e.blocks.map(i=>counts(stimulus[i]));
        if(e.target && (!(item.q||'').includes(e.target)||!values.some(x=>x>0)))fail('la pregunta no identifica el objetivo del conteo.');
        if(e.op==='count' && values.length!==1 || ['sum','subtract'].includes(e.op)&&values.length!==2)fail('número de grupos incompatible con la operación.');
        result=e.op==='subtract'?values[0]-values[1]:values.reduce((a,b)=>a+b,0);
        if(result<0 || String(result)!==String(item.a))fail('la respuesta no coincide con las unidades del estímulo.');
      }else if(e.op==='between'){
        const block=stimulus[e.block];
        if(block?.type!=='list'||block.items.length!==3||block.items[1]!=='?'||!/^\d+$/.test(block.items[0])||!/^\d+$/.test(block.items[2])||![1,2].includes(e.step)||Number(block.items[2])-Number(block.items[0])!==2*e.step||String(Number(block.items[0])+e.step)!==item.a)fail('el número que falta no coincide con la serie.');
      }else if(['compare','equal','findCount'].includes(e.op)){
        const block=stimulus[e.block];
        if(block?.type!=='table'||block.rows.length!==2||block.rows.some(r=>r.length!==2)||new Set(block.rows.map(r=>choiceKey(r[0]))).size!==2)fail('la comparación necesita dos grupos distintos.');
        const values=block.rows.map(r=>/^\d+$/.test(r[1])?Number(r[1]):/^(?:●\s*)+$/.test(r[1])?r[1].replace(/\s/g,'').length:NaN);
        if(!values.every(x=>Number.isInteger(x)&&x>=0&&x<=10))fail('la comparación no declara cantidades adecuadas para 6–7.');
        if(e.op==='findCount'){
          const matches=values.map((v,i)=>v===e.target?i:-1).filter(i=>i>=0);
          if(!Number.isInteger(e.target)||!new RegExp(`(?<!\\d)${e.target}(?!\\d)`).test(item.q||'')||matches.length!==1)fail('la cantidad solicitada no identifica un único grupo.');
          result=block.rows[matches[0]][0];
        }else if(e.op==='equal')result=values[0]===values[1]?'Sí':'No';
        else {if(!['more','less'].includes(e.ask)||values[0]===values[1])fail('la comparación no tiene un objetivo único.');result=block.rows[(e.ask==='more'?values[0]>values[1]:values[0]<values[1])?0:1][0];}
        if(result!==item.a)fail('respuesta de comparación incorrecta.');
      }else fail('operación de cantidades no compatible.');
    }
    if(item.matchEvidence){
      const m=item.matchEvidence,block=stimulus[m.block];
      if(m.op==='mostFrequent'){
        if(block?.type!=='list')fail('falta la lista de figuras.');
        const counts=[...new Set(block.items)].map(value=>[value,block.items.filter(x=>x===value).length]);
        const maximum=Math.max(...counts.map(x=>x[1])),winners=counts.filter(x=>x[1]===maximum);
        if(winners.length!==1||winners[0][0]!==item.a)fail('la figura más frecuente no es única.');
      }else if(m.op==='odd'){
        if(block?.type!=='list')fail('falta la lista de figuras.');
        const unique=[...new Set(block.items)],odd=unique.filter(x=>block.items.filter(y=>y===x).length===1);
        if(unique.length!==2||odd.length!==1||odd[0]!==item.a)fail('la figura diferente no es única.');
      }else if(m.op==='modelRow'){
        const model=stimulus[m.modelBlock];
        if(model?.type!=='text'||!model.text.startsWith('Modelo: ')||block?.type!=='table'||new Set(block.rows.map(r=>choiceKey(r[0]))).size!==block.rows.length)fail('falta un modelo con filas distintas.');
        const match=block.rows.filter(r=>r[1]===model.text.slice(8));
        if(match.length!==1||match[0][0]!==item.a)fail('el modelo no tiene una única fila igual.');
      }else fail('comparación de figuras no compatible.');
    }
    if(item.tableRule){
      const r=item.tableRule,block=stimulus[r.block];
      if(block?.type!=='table'||!Array.isArray(r.criteria)||!r.criteria.length||!r.criteria.every(hasText)||new Set(r.criteria.map(choiceKey)).size!==r.criteria.length||new Set(block.rows.map(row=>choiceKey(row[0]))).size!==block.rows.length)fail('la regla necesita una tabla con opciones distintas.');
      const matches=block.rows.filter(row=>r.criteria.every(c=>row[1].split(' · ').map(choiceKey).includes(choiceKey(c))));
      if(matches.length!==1 || matches[0][0]!==item.a)fail('la regla no tiene una única respuesta.');
    }
    if(item.lookupEvidence){
      const e=item.lookupEvidence,block=stimulus[e.block],row=block?.rows?.[e.row];
      if(block?.type!=='table'||!row||!Number.isInteger(e.subjectColumn)||!Number.isInteger(e.valueColumn))fail('la búsqueda no declara su referencia.');
      const subject=row[e.subjectColumn];
      if(!subject || !(item.q||'').toLowerCase().includes(subject.toLowerCase()) || block.rows.filter(r=>choiceKey(r[e.subjectColumn])===choiceKey(subject)).length!==1 || row[e.valueColumn]!==item.a)fail('la búsqueda no tiene una referencia única.');
    }
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
  function visualLabel(value,senses={}){
    const raw=String(value),glyphs=/^[●○□△☆\s·]+$/.test(raw)?raw.match(/[●○□△☆]/g):null;
    if(glyphs)return `<span class="picture-glyphs" aria-hidden="true">${glyphs.map(x=>art.svg(art.forLabel(x))).join('')}</span><span class="stimulus-only-text">${escape(raw)}</span>`;
    const key=art?.forLabel(raw,senses);
    return `${key?`<span class="picture-icon" aria-hidden="true">${art.svg(key)}</span>`:''}<span>${escape(raw)}</span>`;
  }
  function interactiveStimulus(blocks,options={}) {
    return blocks.map(block => {
      blockValid(block);
      if(options.illustrated){
        const label=block.label?`<p class="stimulus-caption">${escape(block.label)}</p>`:'';
        if(block.type==='text')return block.presentation==='model'?`${label}<div class="early-model"><span class="stimulus-caption">Modelo</span><div>${visualLabel(block.text.slice(8),options.senses)}</div></div>`:`${label}<p>${escape(block.text)}</p>`;
        if(block.type==='list')return `${label}<div class="stimulus-cards ${block.presentation==='count'?'count-units':''} ${block.presentation==='sequence'?'ordered-cards':''}" role="list">${block.items.map((x,i)=>`<div class="stimulus-unit" role="listitem">${block.presentation==='sequence'?`<span class="unit-position" aria-hidden="true">${i+1}</span>`:''}${visualLabel(x,{...options.senses,subject:block.label})}</div>`).join('')}</div>`;
        return `${label}<table class="early-comparison">${block.rows.map(row=>`<tr>${row.map(x=>`<td>${visualLabel(x,{...options.senses,subject:block.label})}</td>`).join('')}</tr>`).join('')}</table>`;
      }
      if (block.type === 'text') return `<p>${escape(block.text)}</p>`;
      if (block.type === 'list') return `<ul>${block.items.map(x => `<li>${escape(x)}</li>`).join('')}</ul>`;
      return `<table>${block.rows.map(row => `<tr>${row.map(x => `<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</table>`;
    }).join('');
  }
  const api = { printable, validateBatch, forDelivery, interactiveStimulus, choiceKey, visualLabel };
  root.ActivityModel = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

(function (root) {
  'use strict';
  const documents=root.DocumentLibrary || (typeof require==='function'&&require('./document-library.js'));
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
    } else if(block.type==='document'){if(!documents?.get(block.documentId))fail('documento visual desconocido.');}
    else fail('el tipo de estímulo no tiene un renderizador compatible.');
    if(block.presentation==='memoryScene'&&(block.type!=='table'||block.rows.length>9||block.rows.some(row=>row.length!==2)||new Set(block.rows.map(row=>row[0])).size!==block.rows.length))fail('la escena no declara zonas únicas.');
    if(block.presentation==='routeMap'&&(block.type!=='list'||block.items.length>9||new Set(block.items).size!==block.items.length||block.positions!==undefined&&(!Array.isArray(block.positions)||block.positions.length!==block.items.length||new Set(block.positions).size!==block.positions.length||block.positions.some(n=>!Number.isInteger(n)||n<0||n>8))))fail('el mapa no declara posiciones distintas y válidas.');
    return block;
  }
  function comparisonStimulus(value){
    if(typeof value!=='string')return null;
    // Recognize a complete authored model + four labels, never infer missing
    // fields or the answer. Unknown prose stays untouched.
    const match=value.match(/^\s*MODELO:\s*(\S+)\s+A:\s*(\S+)\s+B:\s*(\S+)\s+C:\s*(\S+)\s+D:\s*(\S+)\s*$/iu);
    if(match)return [{type:'text',text:'Modelo: '+match[1],presentation:'model'},
      {type:'table',rows:match.slice(2).map((code,i)=>[String.fromCharCode(65+i),code]),presentation:'codeComparison'}];
    // A complete four-choice comparison is the same material without a model.
    // Keep labels and code characters intact; incomplete prose stays untouched.
    const choices=value.match(/^\s*A:\s*(\S+)\s+B:\s*(\S+)\s+C:\s*(\S+)\s+D:\s*(\S+)\s*$/iu);
    const labelled=value.match(/^\s*A\)\s*([^·]+?)\s*·\s*B\)\s*([^·]+?)\s*·\s*C\)\s*([^·]+?)\s*·\s*D\)\s*([^·]+?)\s*$/iu);
    if(labelled&&labelled.slice(1).every(data=>data.trim()))return [{type:'table',rows:labelled.slice(1).map((data,i)=>[String.fromCharCode(65+i),data.trim()]),presentation:'labelledComparison'}];
    return choices?[{type:'table',rows:choices.slice(1).map((code,i)=>[String.fromCharCode(65+i),code]),presentation:'codeComparison'}]:null;
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
    const comparison=comparisonStimulus(item.scenario);
    if(comparison)blocks.push(...comparison);else text(item.scenario);
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
    if(item.memoryResponse==='multiple'||item.selectiveRecall)(root.Curriculum||(typeof require==='function'&&require('./curriculum'))).validateSelectiveRecall(item);
    if(item.type==='documentReview'||item.documentPlan)documents.validateExecutiveTask(item);
    if(item.speedEvidence)(root.Curriculum||(typeof require==='function'&&require('./curriculum'))).validateSpeed(item);
    if(item.planEvidence)(root.Curriculum||(typeof require==='function'&&require('./curriculum'))).validatePlan(item);
    if(item.mathEvidence)(root.Curriculum||(typeof require==='function'&&require('./curriculum'))).validateMath(item);
    if(item.type==='multiSelect')(root.Curriculum||(typeof require==='function'&&require('./curriculum'))).validateReview(item);
    const rawStimulus = item.stimulus === undefined ? legacyStimulus(item) : item.stimulus;
    const stimulus=Array.isArray(rawStimulus)&&item.writingRubric?.length?rawStimulus.filter(b=>!(b.type==='text'&&b.text==='Criterios de revisión')&&!(b.type==='list'&&JSON.stringify(b.items)===JSON.stringify(item.writingRubric))):rawStimulus;
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
    (root.LocaleContent||(typeof require==='function'&&require('./locale-content'))).validateOptions(item);
    const early=Boolean(policy.forProfile(profile));
    if (new Set(options.map(early?choiceKey:String)).size !== options.length) fail('hay opciones duplicadas o equivalentes.');
    if(early && item.responseType==='choice' && options.length<2)fail('falta una opción alternativa.');
    const tokens = item.tokens || [];
    if (item.type === 'order' || item.memoryResponse === 'order') {
      if (!tokens.length || !tokens.every(hasText) || !Array.isArray(item.answer) || item.answer.length !== tokens.length || new Set(tokens.map(early?choiceKey:String)).size !== tokens.length || new Set(item.answer).size !== tokens.length || !item.answer.every(x => tokens.includes(x))) fail('la secuencia no puede resolverse.');
    } else if (options.length) {
      const answers = item.answers || [item.a];
      if (!answers.length || !answers.every(a => a !== undefined && options.map(String).includes(String(a)))) fail('la respuesta no está en las opciones.');
    } else if (!item.sample && item.dividend === undefined) fail('la mecánica no tiene una respuesta compatible.');
    if (/memory/i.test(item.type || '') && !item.memoryContent?.length) fail('falta el material de memoria.');
    if(early)validateEvidence(item,stimulus);
    if(item.recallEvidence){
      const e=item.recallEvidence,b=stimulus[e.block];
      if(e.kind==='sequence'){
        if(b?.type!=='list'||!Array.isArray(item.answer)||JSON.stringify(item.answer)!==JSON.stringify(e.takeLast?b.items.slice(-e.takeLast):e.reverse?[...b.items].reverse():b.items))fail('el orden de memoria no corresponde al estímulo.');
      }else if(e.kind==='spatial'){
        if(b?.type!=='table'||!e.targets?.length)fail('falta la cuadrícula de memoria.');
        const positions=e.targets.map(target=>{const cells=b.rows.flatMap((row,r)=>row.map((value,c)=>({value,r,c}))).filter(x=>x.value===target);if(cells.length!==1)fail('la posición de memoria no es única.');const x=cells[0];return `Fila ${x.r+1}, columna ${x.c+1}`;});
        if(item.a!==positions.join(' → '))fail('la respuesta espacial no coincide con la cuadrícula.');
      }else fail('evidencia de memoria no compatible.');
    }
    if ((policy.forProfile(profile)||item.answerEvidence) && item.type === 'memoryReveal' && !item.recallEvidence) {
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
    return { question, stimulus, options:options.map(String), tokens, writingRubric:item.writingRubric||[], responseType:item.type === 'order' || item.memoryResponse === 'order' ? 'order' : options.length ? 'choice' : 'written' };
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
  function preparePrintable(item,profile,country,domain){
    const regional=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
    if(!regional)fail('falta el adaptador regional.');
    if(item?.domain&&domain&&item.domain!==domain)fail('el área recibida no coincide con la solicitada.');
    if(item?.sourceDomain&&domain&&item.sourceDomain!==domain)fail('el área de origen no coincide con la solicitada.');
    const age=profile?.progress?.ageRoute||profile?.age_band;
    const declared=item?.ageProfile?.id||item?.juniorProfile?.route||item?.schoolProfile?.route||(item?.teenReview?'teen':null);
    if(declared&&declared!==age)fail('la actividad pertenece a otra franja de edad.');
    const localized=regional.localizeItem(item,country,domain);
    if(policy.forProfile(profile))forDelivery(localized,profile,domain);
    const projection=regional.localizeModel(printable(localized,profile),country,domain,localized);
    if(policy.forProfile(profile)||item?.type==='memoryReveal'||item?.speedTask){
      // Verify the same local pictures the Word renderer will embed before
      // selection commits the candidate. Text is always the factual source.
      for(const block of projection.stimulus){
        const values=block.type==='list'&&['count','cards','sequence'].includes(block.presentation)?block.items:block.type==='table'?block.rows.flat():[];
        for(const value of values){
          const key=art?.forLabel(value,{...localized.lexicalSenses,subject:block.label});
          if(key&&!/^[●○□△☆]$/.test(value)){
            const bytes=art.png(key);
            if(bytes.length<24||[137,80,78,71,13,10,26,10].some((b,i)=>bytes[i]!==b))fail('la ilustración no es un PNG imprimible válido.');
          }
        }
      }
    }
    return {item:localized,projection};
  }
  function validateBatch(versions, profile) {
    if (!Array.isArray(versions) || !versions.length || versions.some(v => !Array.isArray(v) || !v.length)) fail('el lote está vacío.');
    return versions.map(items => items.map(item => printable(item, profile)));
  }
  function forDelivery(item, profile, domain) {
    (root.LocaleContent||(typeof require==='function'&&require('./locale-content'))).validateOptions(item);
    if (!policy.forProfile(profile)){if(item.type==='multiSelect'||item.type==='documentReview'||item.documentPlan||item.memoryResponse==='multiple'||item.selectiveRecall||item.speedEvidence||item.planEvidence||item.mathEvidence||item.type==='memoryReveal'&&item.answerEvidence)printable(item,profile);return item;}
    if (domain && item?.domain !== domain) fail('el área recibida no coincide con la solicitada.');
    // Identical contract at the domain boundary, on screen and in the exporter.
    // This applies to local, remote and future cache sources alike.
    printable(item, profile);
    return item;
  }
  function escape(text) { return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function memoryLabel(value){return String(value).replace(/^(?:el|la|los|las|un|una|unos|unas)\s+/iu,'');}
  function visualLabel(value,senses={}){
    if(value===undefined||value===null||!String(value).trim())throw new Error('Falta la etiqueta visual.');
    if(value==='—')return '<span class="empty-memory-cell">Vacío</span>';
    const raw=String(value),glyphs=/^[●○□△☆\s·]+$/.test(raw)?raw.match(/[●○□△☆]/g):null;
    if(glyphs)return `<span class="picture-glyphs" aria-hidden="true">${glyphs.map(x=>art.svg(art.forLabel(x))).join('')}</span><span class="stimulus-only-text">${escape(raw)}</span>`;
    const key=art?.forLabel(raw,senses);
    return `${key?`<span class="picture-icon" aria-hidden="true">${art.svg(key)}</span>`:''}<span>${escape(key&&senses.memory?memoryLabel(raw):raw)}</span>`;
  }
  function sceneFurniture(place,x,y){
    const frame=`fill="#d3b597" stroke="#8d7761" stroke-width="3" stroke-linejoin="round"`;
    const name=memoryLabel(place);
    if(name==='mesa'||name==='banco')return `<path d="M${x-83} ${y+15}h166v15H${x-83}Zm14 15v43m138-43v43" ${frame}/>`;
    if(name==='alfombra')return `<ellipse cx="${x}" cy="${y+33}" rx="94" ry="28" fill="#c8d4be" stroke="#8fa489" stroke-width="3"/><ellipse cx="${x}" cy="${y+33}" rx="78" ry="17" fill="none" stroke="#e8e9d6" stroke-width="3"/>`;
    if(name==='ventana')return `<rect x="${x-78}" y="${y-108}" width="156" height="139" rx="5" fill="#d5e5e7" stroke="#a6927b" stroke-width="7"/><path d="M${x} ${y-108}v139m-78-70h156M${x-87} ${y+31}h174" stroke="#a6927b" stroke-width="7"/>`;
    if(name==='silla')return `<rect x="${x-58}" y="${y-99}" width="116" height="115" rx="14" ${frame}/><path d="M${x-68} ${y+17}h136v15H${x-68}Zm15 15v39m106-39v39" ${frame}/>`;
    if(name==='puerta')return `<rect x="${x-62}" y="${y-115}" width="124" height="176" rx="7" fill="#d8c8af" stroke="#a6927b" stroke-width="5"/><circle cx="${x+43}" cy="${y+5}" r="5" fill="#8d7761"/>`;
    return `<rect x="${x-83}" y="${y-110}" width="166" height="162" rx="9" fill="#e5dccb" stroke="#a6927b" stroke-width="4"/><path d="M${x-83} ${y+25}h166" stroke="#a6927b" stroke-width="7"/>`;
  }
  function interactiveStimulus(blocks,options={}) {
    // The topic is already visible above the question. Keep it in the canonical
    // stimulus for standalone worksheets, but do not print it twice on screen.
    const visibleBlocks=blocks.length>1&&options.heading?blocks.filter(b=>b.type!=='text'||b.text!==options.heading):blocks;
    const redundantSources=new Set(visibleBlocks.filter(b=>b.type==='document').map(b=>{const doc=documents.get(b.documentId);return `Fuente: ${doc.kind} de ${doc.country}.`;}));
    return visibleBlocks.filter(b=>!(b.type==='text'&&redundantSources.has(b.text))).filter(b=>!options.rubric?.length||(!(b.type==='text'&&b.text==='Criterios de revisión')&&!(b.type==='list'&&JSON.stringify(b.items)===JSON.stringify(options.rubric)))).map(block => {
      blockValid(block);
      if(block.type==='document'){
        const doc=documents.get(block.documentId);
        return `<figure class="practice-document"><img src="${escape(doc.path)}" width="${doc.width}" height="${doc.height}" alt="${escape(doc.title)}" loading="eager"><figcaption><a href="${escape(doc.path)}" target="_blank" rel="noopener">Ampliar documento</a></figcaption></figure><details class="document-transcript"><summary>Ver versión en texto</summary>${interactiveStimulus(doc.transcript,{structured:true})}</details>`;
      }
      if(block.presentation==='memoryScene'){
        const positions=[[130,140],[360,140],[590,140],[130,370],[360,370],[590,370],[130,600],[360,600],[590,600]],height=block.rows.length>6?720:490;
        return `<figure class="memory-scene"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 ${height}" font-family="Arial, sans-serif" role="img" aria-label="Escena para recordar"><rect x="4" y="4" width="712" height="${height-8}" rx="24" fill="#f1eee4"/><path d="M8 ${height-80}H712" stroke="#d8cfb8" stroke-width="3"/>${block.rows.map(([place,value],i)=>{const [x,y]=positions[i],key=art.forLabel(value,options.senses);return `<g>${sceneFurniture(place,x,y)}${key?`<svg x="${x-36}" y="${y-88}" width="72" height="72" viewBox="0 0 64 64">${art.svg(key).replace(/^<svg[^>]*>|<\/svg>$/g,'')}</svg>`:''}<text x="${x}" y="${y+13}" text-anchor="middle" font-size="18" fill="#264b43">${escape(memoryLabel(value))}</text><text x="${x}" y="${y+95}" text-anchor="middle" font-size="19" font-weight="600" fill="#264b43">${escape(memoryLabel(place))}</text></g>`;}).join('')}</svg><details><summary>Ver los elementos de la escena</summary>${interactiveStimulus([{type:'table',rows:block.rows}],{structured:true})}</details></figure>`;
      }
      if(block.presentation==='routeMap'){
        const coords=[[110,100],[350,100],[590,100],[590,260],[350,260],[110,260],[110,420],[350,420],[590,420]],locations=block.items.map((_,i)=>coords[block.positions?.[i]??i]),points=locations.map(x=>x.join(',')).join(' '),height=510;
        return `<figure class="memory-route"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 ${height}" font-family="Arial, sans-serif" role="img" aria-label="Mapa con el orden de las visitas"><rect width="700" height="${height}" rx="24" fill="#eef3e9"/><path d="M0 180H700M0 340H700M230 0V${height}M470 0V${height}" stroke="#d5dfd4" stroke-width="24"/><polyline points="${points}" fill="none" stroke="#668d89" stroke-width="7" stroke-dasharray="9 8" stroke-linecap="round"/>${block.items.map((place,i)=>{const [x,y]=locations[i];return `<g><rect x="${x-83}" y="${y-53}" width="166" height="96" rx="15" fill="#fffdf7" stroke="#b6cbbd" stroke-width="2"/><path d="M${x-36} ${y-17}v-17l36-17 36 17v17Z" fill="${['#bb9277','#92a9b8','#a9ad82'][i%3]}"/><circle cx="${x-72}" cy="${y-45}" r="16" fill="#28564b"/><text x="${x-72}" y="${y-39}" text-anchor="middle" fill="white" font-size="18">${i+1}</text><text x="${x}" y="${y+22}" text-anchor="middle" fill="#264b43" font-size="19">${escape(place)}</text></g>`;}).join('')}</svg><ol class="route-legend">${block.items.map(x=>`<li>${escape(x)}</li>`).join('')}</ol></figure>`;
      }
      if(block.presentation==='speedSearch'||block.presentation==='flanker')return `<div class="${block.presentation==='flanker'?'flanker-strip':'speed-search-grid'}" role="list">${block.items.map(x=>`<div role="listitem">${visualLabel(x,options.senses)}</div>`).join('')}</div>`;
      if(block.presentation==='pairScan')return `<table class="pair-scan"><tbody>${block.rows.map(row=>`<tr>${row.map(x=>`<td><code>${escape(x)}</code></td>`).join('')}</tr>`).join('')}</tbody></table>`;
      if(block.presentation==='associations'){
        return `<div class="association-frame"><table class="memory-associations"><thead><tr><th scope="col">Persona</th><th scope="col">Imagen</th></tr></thead><tbody>${block.rows.map(row=>`<tr><th scope="row"><span class="person-initial" aria-hidden="true">${escape(row[0].slice(0,1))}</span>${escape(row[0])}</th><td>${visualLabel(row[1],{...options.senses,memory:true})}</td></tr>`).join('')}</tbody></table></div>`;
      }
      if(block.type==='list'&&['sequence','cards'].includes(block.presentation))return `${block.label?`<p class="stimulus-caption">${escape(block.label)}</p>`:''}<div class="memory-object-sequence" role="list">${block.items.map((x,i)=>`<div class="stimulus-unit" role="listitem">${block.presentation==='sequence'?`<span class="unit-position">${i+1}</span>`:''}${visualLabel(x,{...options.senses,subject:block.label,memory:options.memory})}</div>`).join('')}</div>`;
      if(block.presentation==='spatial'){
        return `<div class="recall-grid" style="--grid-size:${block.rows[0].length}" role="table" aria-label="${escape(block.label||'Cuadrícula para recordar')}">${block.rows.map((row,r)=>`<div role="row">${row.map((x,c)=>`<div role="cell" aria-label="Fila ${r+1}, columna ${c+1}: ${escape(x)}">${visualLabel(x,{...options.senses,memory:true})}</div>`).join('')}</div>`).join('')}</div>`;
      }
      if(block.presentation==='speedComparison')return `<div class="speed-comparison" role="group" aria-label="Dos series para comparar">${block.rows[0].map((series,i)=>`<div class="speed-series" aria-label="Serie ${i+1}">${series.split(' · ').map(x=>`<span class="speed-symbol">${visualLabel(x,options.senses)}</span>`).join('')}</div>`).join('')}</div>`;
      if(block.presentation==='reviewPlan')return `${block.label?`<p class="stimulus-caption">${escape(block.label)}</p>`:''}<div class="stimulus-table-scroll" tabindex="0" role="region" aria-label="Compara las condiciones y el plan"><table class="structured-stimulus-table review-plan-table"><thead><tr>${block.rows[0].map(x=>`<th scope="col">${escape(x)}</th>`).join('')}</tr></thead><tbody>${block.rows.slice(1).map(row=>`<tr><th scope="row">${escape(row[0])}</th>${row.slice(1).map((value,i)=>`<td><span class="review-column-label" aria-hidden="true">${escape(block.rows[0][i+1])}</span>${escape(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      if(block.presentation==='labelledComparison')return `<table class="attention-comparison attention-data"><thead><tr><th scope="col">Opción</th><th scope="col">Datos</th></tr></thead><tbody>${block.rows.map(row=>`<tr><th scope="row">${escape(row[0])}</th><td>${escape(row[1])}</td></tr>`).join('')}</tbody></table>`;
      if(block.presentation==='codeComparison')return `<table class="attention-comparison"><tbody>${block.rows.map(row=>`<tr><th scope="row">${escape(row[0])}</th><td><code>${escape(row[1])}</code></td></tr>`).join('')}</tbody></table>`;
      if(block.type==='text'&&block.presentation==='model'&&!options.illustrated)return `<div class="attention-model"><span>MODELO</span><code>${escape(block.text.slice(8))}</code></div>`;
      if(options.illustrated){
        const label=block.label?`<p class="stimulus-caption">${escape(block.label)}</p>`:'';
        if(block.type==='text')return block.presentation==='model'?`${label}<div class="early-model"><span class="stimulus-caption">Modelo</span><div>${visualLabel(block.text.slice(8),options.senses)}</div></div>`:`${label}<p>${escape(block.text)}</p>`;
        if(block.type==='list')return `${label}<div class="stimulus-cards ${block.presentation==='count'?'count-units':''} ${block.presentation==='sequence'?'ordered-cards':''}" role="list">${block.items.map((x,i)=>`<div class="stimulus-unit" role="listitem">${block.presentation==='sequence'?`<span class="unit-position" aria-hidden="true">${i+1}</span>`:''}${visualLabel(x,{...options.senses,subject:block.label})}</div>`).join('')}</div>`;
        return `${label}<table class="early-comparison">${block.rows.map(row=>`<tr>${row.map(x=>`<td>${visualLabel(x,{...options.senses,subject:block.label})}</td>`).join('')}</tr>`).join('')}</table>`;
      }
      if(options.structured){
        const label=block.label?`<p class="stimulus-caption">${escape(block.label)}</p>`:'';
        if(block.type==='text')return `${label}<p class="stimulus-paragraph">${escape(block.text)}</p>`;
        if(block.type==='list')return `${label}<ul class="structured-stimulus-list">${block.items.map(x=>`<li>${escape(x)}</li>`).join('')}</ul>`;
        return `${label}${block.rows[0].length>3?'<p class="table-scroll-hint">Desliza la tabla para ver todas las columnas.</p>':''}<div class="stimulus-table-scroll" tabindex="0" role="region" aria-label="Tabla de datos"><table class="structured-stimulus-table">${block.rows.map((row,i)=>`<tr>${row.map(x=>i===0&&block.header===true?`<th scope="col">${escape(x)}</th>`:`<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</table></div>`;
      }
      if (block.type === 'text') return `<p>${escape(block.text)}</p>`;
      if (block.type === 'list') return `<ul>${block.items.map(x => `<li>${escape(x)}</li>`).join('')}</ul>`;
      return `<table>${block.rows.map(row => `<tr>${row.map(x => `<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</table>`;
    }).join('');
  }
  const api = { memoryLabel, comparisonStimulus, preparePrintable, printable, validateBatch, forDelivery, interactiveStimulus, choiceKey, visualLabel };
  root.ActivityModel = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

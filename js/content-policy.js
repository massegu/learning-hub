(function (root) {
  'use strict';
  const domains = ['language', 'division', 'reading', 'attention', 'executive', 'memory', 'speedReasoning', 'applied', 'social'];
  const domainMechanics = {
    social:['cooperation','perspective','boundaries'], language:['literal','vocabulary','sentence'], division:['count','addition','subtraction','compare'],
    reading:['literal','inference','sequencing'], attention:['matching','search','oddOne','findPlace'],
    memory:['rememberObjects','rememberPlace','rememberPair','rememberOrder'],
    executive:['planning','inhibition','sequencing','organisation'],
    speedReasoning:['analogy','pattern','classification','relationship','speedCompare'],
    applied:['chooseObject','solveProblem','followRule','findPlace'],
  };
  const early = Object.freeze({
    id: 'early', revision: 1, label: '6-7 años', subjects: Object.freeze(domains),
    contexts: Object.freeze(['school', 'playground', 'animals', 'toys', 'sports', 'snacks', 'birthday', 'family', 'bedroom', 'backpack', 'excursion']),
    mechanics: Object.freeze(['cooperation','perspective','boundaries','literal', 'inference', 'vocabulary', 'sentence', 'count', 'addition', 'subtraction', 'compare', 'matching', 'search', 'oddOne', 'rememberObjects', 'rememberPlace', 'rememberPair', 'rememberOrder', 'planning', 'inhibition', 'sequencing', 'organisation', 'analogy', 'pattern', 'classification', 'relationship', 'chooseObject', 'solveProblem', 'followRule', 'findPlace', 'speedCompare']),
    maxWords: 45, maxSentenceWords: 14, maxOptions: 3, maxElements: 6,
    memoryElements: Object.freeze([5, 6, 7]), maxSteps: 3,
    stimulusTypes: Object.freeze(['text', 'list', 'table']),
    responseTypes: Object.freeze(['choice', 'order']),
    // This is a safety net; approved vocabulary comes from the authored bank,
    // not from replacing individual words in adult activities.
    excludedLanguage: /\b(estrategia|criterio|información relevante|priorizar|alternativa|descuento|vuelo|embarque|reserva|factura|horario|administrativ[oa])\b|\b[A-Z]\d{2}-[A-Z]\d\b|\b\d{1,2}:\d{2}\b/i,
  });
  function route(profile) {
    return profile?.progress?.ageRoute || profile?.age_band;
  }
  function forProfile(profile) { return route(profile) === 'early' ? early : null; }
  function words(text) { return String(text).trim().split(/\s+/).filter(Boolean).length; }
  function levelIndex(item){return Math.max(0,Math.min(2,(Number(item.level)||1)-1));}
  function validateEarly(item) {
    const meta = item?.ageProfile;
    if (!meta || meta.id !== early.id || meta.revision !== early.revision)
      throw new Error('La actividad no declara el perfil 6-7 vigente.');
    if (!domains.includes(item.domain) || !early.contexts.includes(meta.context) || !early.mechanics.includes(meta.mechanic))
      throw new Error('El contexto o la mecánica no están aprobados para 6-7.');
    if (!domainMechanics[item.domain].includes(meta.mechanic)) throw new Error('La mecánica no pertenece al área solicitada.');
    if (!early.responseTypes.includes(item.responseType) || !Array.isArray(item.stimulus) || !item.stimulus.length)
      throw new Error('La actividad 6-7 necesita un estímulo y una respuesta compatibles.');
    const expectedType = meta.mechanic.startsWith('remember') ? 'memoryReveal' : item.responseType === 'order' ? 'order' : 'standard';
    if (item.type !== expectedType || item.image || item.visual || item.rounds)
      throw new Error('Mecánica o complejidad visual no compatible con 6-7.');
    // Canonical stimuli are the only factual presentation path for early items.
    // Otherwise a second, unchecked legacy field could appear on screen.
    for (const field of ['scenario', 'text', 'title', 'model', 'modelSequence', 'rows', 'visualItems', 'angle', 'sample']) {
      if (item[field] !== undefined) throw new Error('Presentación adicional no compatible con el perfil 6-7.');
    }
    const pieces = [item.q, item.memoryQuestion, item.why, item.topic, item.theme,
      ...(item.opts || []), ...(item.tokens || []), ...(item.answer || []),
      ...(item.memoryContent || []).flatMap(x => [x?.person, x?.detail])].filter(Boolean);
    let elements = 0;
    const stimulusText = [];
    for (const block of item.stimulus) {
      if (!block || !early.stimulusTypes.includes(block.type)) throw new Error('Estímulo no permitido para 6-7.');
      const presentations={text:['model'],list:['cards','count','sequence','routeMap','speedSearch','flanker'],table:['speedComparison','comparison','spatial','associations','memoryScene','pairScan']};
      if(block.presentation && !presentations[block.type].includes(block.presentation))throw new Error('Presentación no compatible con el estímulo.');
      if(block.presentation==='model' && !block.text?.startsWith('Modelo: '))throw new Error('El modelo no declara una referencia legible.');
      if(block.label!==undefined){if(typeof block.label!=='string'||!block.label.trim())throw new Error('Falta el título del estímulo.');pieces.push(block.label);stimulusText.push(block.label);}
      if (block.type === 'text') {
        if (typeof block.text !== 'string' || !block.text.trim()) throw new Error('El texto del estímulo está vacío.');
        stimulusText.push(block.text);
      }
      else if (block.type === 'list') {
        if (!Array.isArray(block.items) || !block.items.length || !block.items.every(x => typeof x === 'string' && x.trim())) throw new Error('La lista del estímulo está incompleta.');
        elements += block.items.length; stimulusText.push(...block.items);
      }
      else {
        if (!Array.isArray(block.rows) || !block.rows.length || !block.rows.every(row => Array.isArray(row) && row.length && row.every(x => typeof x === 'string' && x.trim()))) throw new Error('La tabla del estímulo está incompleta.');
        elements += block.rows.length; stimulusText.push(...block.rows.flat());
        if (block.rows.some(row => row.length > 2)) throw new Error('Tabla demasiado compleja para 6-7.');
      }
    }
    if (elements > (item.type==='memoryReveal'?early.memoryElements[levelIndex(item)]:early.maxElements) || (item.opts || []).length > (item.memoryResponse==='spatial'?4:early.maxOptions) || (item.tokens || []).length > (item.memoryResponse==='order'?early.memoryElements[levelIndex(item)]:early.maxSteps))
      throw new Error('Demasiados elementos para el perfil 6-7.');
    if (words(stimulusText.join(' ')) > early.maxWords) throw new Error('El estímulo contiene demasiada lectura.');
    for (const text of [...pieces, ...stimulusText]) {
      if (typeof text !== 'string' || early.excludedLanguage.test(text)) throw new Error('Lenguaje no compatible con 6-7.');
      if (words(text) > early.maxWords || text.split(/[.!?¿¡]+/).some(s => words(s) > early.maxSentenceWords))
        throw new Error('La lectura supera los límites del perfil 6-7.');
    }
    const level = Math.max(1, Math.min(3, Number(item.level) || 1));
    if (item.type === 'memoryReveal' && (!Array.isArray(item.memoryContent) || !item.memoryContent.length || !item.memoryContent.every(x => x && typeof x.detail === 'string' && x.detail.trim()) || item.memoryContent.length > early.memoryElements[level - 1] || (!item.recallEvidence && elements !== item.memoryContent.length) || item.stimulus.some(block => block.type === 'text') || !Number.isFinite(item.revealMs) || item.revealMs < 6000))
      throw new Error('Carga de memoria no compatible con 6-7.');
    return item;
  }
  const api = { early, route, forProfile, validateEarly };
  root.ContentPolicy = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

(function (root) {
  'use strict';
  const domains = ['language', 'division', 'reading', 'attention', 'executive', 'memory', 'speedReasoning', 'applied'];
  const early = Object.freeze({
    id: 'early', revision: 1, label: '6-7 años', subjects: Object.freeze(domains),
    contexts: Object.freeze(['school', 'playground', 'animals', 'toys', 'sports', 'snacks', 'birthday', 'family', 'bedroom', 'backpack', 'excursion']),
    mechanics: Object.freeze(['literal', 'inference', 'vocabulary', 'sentence', 'count', 'addition', 'subtraction', 'compare', 'matching', 'search', 'oddOne', 'rememberObjects', 'rememberPlace', 'rememberPair', 'rememberOrder', 'planning', 'inhibition', 'sequencing', 'organisation', 'analogy', 'pattern', 'classification', 'relationship', 'chooseObject', 'solveProblem', 'followRule', 'findPlace']),
    maxWords: 45, maxSentenceWords: 14, maxOptions: 3, maxElements: 6,
    memoryElements: Object.freeze([2, 3, 4]), maxSteps: 3,
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
  function validateEarly(item) {
    const meta = item?.ageProfile;
    if (!meta || meta.id !== early.id || meta.revision !== early.revision)
      throw new Error('La actividad no declara el perfil 6-7 vigente.');
    if (!domains.includes(item.domain) || !early.contexts.includes(meta.context) || !early.mechanics.includes(meta.mechanic))
      throw new Error('El contexto o la mecánica no están aprobados para 6-7.');
    if (!early.responseTypes.includes(item.responseType) || !Array.isArray(item.stimulus) || !item.stimulus.length)
      throw new Error('La actividad 6-7 necesita un estímulo y una respuesta compatibles.');
    const expectedType = item.responseType === 'order' ? 'order' : meta.mechanic.startsWith('remember') ? 'memoryReveal' : 'standard';
    if (item.type !== expectedType || item.image || item.visual || item.rounds)
      throw new Error('Mecánica o complejidad visual no compatible con 6-7.');
    const pieces = [item.q, item.memoryQuestion, item.why, ...(item.opts || []), ...(item.tokens || [])].filter(Boolean);
    let elements = 0;
    const stimulusText = [];
    for (const block of item.stimulus) {
      if (!block || !early.stimulusTypes.includes(block.type)) throw new Error('Estímulo no permitido para 6-7.');
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
    if (elements > early.maxElements || (item.opts || []).length > early.maxOptions || (item.tokens || []).length > early.maxSteps)
      throw new Error('Demasiados elementos para el perfil 6-7.');
    if (words(stimulusText.join(' ')) > early.maxWords) throw new Error('El estímulo contiene demasiada lectura.');
    for (const text of [...pieces, ...stimulusText]) {
      if (typeof text !== 'string' || early.excludedLanguage.test(text)) throw new Error('Lenguaje no compatible con 6-7.');
      if (words(text) > early.maxWords || text.split(/[.!?¿¡]+/).some(s => words(s) > early.maxSentenceWords))
        throw new Error('La lectura supera los límites del perfil 6-7.');
    }
    const level = Math.max(1, Math.min(3, Number(item.level) || 1));
    if (item.type === 'memoryReveal' && (!Array.isArray(item.memoryContent) || !item.memoryContent.length || !item.memoryContent.every(x => x && typeof x.detail === 'string' && x.detail.trim()) || item.memoryContent.length > early.memoryElements[level - 1] || item.revealMs < 6000))
      throw new Error('Carga de memoria no compatible con 6-7.');
    return item;
  }
  const api = { early, route, forProfile, validateEarly };
  root.ContentPolicy = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

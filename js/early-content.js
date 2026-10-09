(function (root) {
  'use strict';
  const policy = root.ContentPolicy || (typeof require === 'function' && require('./content-policy.js'));
  // Noun phrases are authored with their determiners. Generators never guess
  // gender or splice a bare noun into a Spanish sentence.
  const objects = [
    { gender: 'm', name: 'el libro', some: 'un libro', plural: 'libros', place: 'la mesa', icon: 'book' },
    { gender: 'f', name: 'la pelota', some: 'una pelota', plural: 'pelotas', place: 'el patio', icon: 'ball' },
    { gender: 'm', name: 'el lápiz', some: 'un lápiz', plural: 'lápices', place: 'el estuche', icon: 'pencil' },
    { gender: 'f', name: 'la muñeca', some: 'una muñeca', plural: 'muñecas', place: 'la cama', icon: 'doll' },
    { gender: 'f', name: 'la manzana', some: 'una manzana', plural: 'manzanas', place: 'la cesta', icon: 'apple' },
    { gender: 'm', name: 'el cuaderno', some: 'un cuaderno', plural: 'cuadernos', place: 'la mochila', icon: 'notebook' },
    { gender: 'f', name: 'la botella', some: 'una botella', plural: 'botellas', place: 'la cocina', icon: 'bottle' },
    { gender: 'm', name: 'el coche de juguete', some: 'un coche de juguete', plural: 'coches de juguete', place: 'la caja', icon: 'car' },
    { gender: 'm', name: 'el oso de peluche', some: 'un oso de peluche', plural: 'osos de peluche', place: 'la silla', icon: 'bear' },
    { gender: 'f', name: 'la galleta', some: 'una galleta', plural: 'galletas', place: 'el plato', icon: 'cookie' },
    { gender: 'f', name: 'la gorra', some: 'una gorra', plural: 'gorras', place: 'el armario', icon: 'cap' },
    { gender: 'm', name: 'el regalo', some: 'un regalo', plural: 'regalos', place: 'el salón', icon: 'gift' },
  ];
  const names = ['Ana', 'Leo', 'Mar', 'Pau', 'Lola', 'Hugo', 'Nora', 'Dani'];
  // Shapes use ordinary glyphs which survive DOCX text export (no emoji font dependency).
  const shapes = ['○', '□', '△', '☆'];
  const colors = ['rojo', 'azul', 'verde', 'amarillo'];
  const text = value => ({ type: 'text', text: value });
  const list = items => ({ type: 'list', items });
  const table = rows => ({ type: 'table', rows });
  const unique = xs => [...new Set(xs)];
  const amount = (count, object) => count === 1 ? object.some : `${count} ${object.plural}`;
  const of = noun => noun.startsWith('el ') ? `del ${noun.slice(3)}` : `de ${noun}`;
  function choice(q, stimulus, a, wrong, extra = {}) {
    return { type: 'standard', responseType: 'choice', requiresStimulus: true,
      q, stimulus, a: String(a), opts: unique([String(a), ...wrong.map(String)]).slice(0, 3), ...extra };
  }
  function order(q, tokens, scenario) {
    return { type: 'order', responseType: 'order', requiresStimulus: true,
      q, stimulus: [text(scenario)], tokens: [...tokens].reverse(), answer: tokens };
  }
  // A family chooses an appropriate construct and stimulus together. Both
  // delivery modes use this bank; no generic pool is relabelled as 6-7.
  const families = {
    reading: [
      ['literal', 'bedroom', (o, n) => choice(`¿Dónde está ${o.name}?`, [text(`${n} guarda ${o.name} en ${o.place}.`) ], o.place, ['el jardín', 'el baño'])],
      ['inference', 'playground', (o, n) => choice('¿Por qué se pone las botas?', [text(`${n} sale al patio. Hay charcos. Se pone las botas.`)], 'Para no mojarse los pies', ['Para dormir', 'Para leer'])],
      ['literal', 'animals', (o, n, v) => { const animal = ['gato', 'perro', 'conejo'][v % 3]; return choice('¿Qué animal tiene?', [text(`${n} tiene un ${animal}. Le da agua cada día.`)], animal, ['pájaro', 'pez']); }],
      ['inference', 'family', (o, n) => choice('¿Qué va a hacer ahora?', [text(`${n} tiene sueño. Se pone el pijama y se mete en la cama.`)], 'Dormir', ['Jugar al fútbol', 'Ir al colegio'])],
      ['literal', 'birthday', (o, n) => choice(`¿Qué recibe ${n}?`, [text(`Hoy es el cumpleaños de ${n}. Su abuela le regala ${o.some}.`)], o.name, ['un dibujo', 'una flor'])],
      ['sequencing', 'school', (o, n) => order('Lee la historia. Ordena lo que pasó.', ['Coge el libro', 'Lee el cuento', 'Guarda el libro'], `${n} coge el libro. Después lee un cuento. Al terminar, guarda el libro.`)],
    ],
    language: [
      ['vocabulary', 'school', (o, n) => choice('¿Qué usamos para dibujar?', [text(`${n} quiere dibujar una casa en el papel.`)], 'Un lápiz', ['Una cuchara', 'Una pelota'])],
      ['sentence', 'family', (o, n) => order('Ordena las palabras para formar la frase.', [n, 'guarda', o.name], `Mira a ${n}. Está guardando ${o.name}.`)],
      ['vocabulary', 'toys', (o, n, v) => choice('¿Qué palabra dice lo contrario?', [text(['grande', 'alto', 'limpio', 'lleno'][v % 4])], ['pequeño', 'bajo', 'sucio', 'vacío'][v % 4], ['bonito', 'nuevo'])],
      ['literal', 'backpack', (o, n) => choice(`¿Qué guarda ${n}?`, [text(`${n} mete ${o.name} en la mochila.`)], o.name, ['la flor', 'el zapato'])],
    ],
    division: [
      ['count', 'toys', (o, n, v) => { const k = 2 + v % 5; return choice('Cuenta los puntos. ¿Cuántos hay?', [list(Array(k).fill('●'))], k, [k - 1, k + 1]); }],
      ['addition', 'school', (o, n, v) => { const k = 1 + v % 4; return choice(`¿${o.gender === 'f' ? 'Cuántas' : 'Cuántos'} ${o.plural} hay ahora?`, [text(`Hay ${amount(k, o)}. ${n} trae ${o.some}.`)], k + 1, [k, k + 2]); }],
      ['subtraction', 'school', (o, n, v) => { const k = 2 + v % 4; return choice(`¿${o.gender === 'f' ? 'Cuántas' : 'Cuántos'} ${o.plural} quedan?`, [text(`Hay ${k} ${o.plural}. ${n} guarda ${o.some}.`)], k - 1, [k, k + 1]); }],
      ['compare', 'school', (o, n, v) => { const k = 1 + v % 4; return choice('¿Quién tiene más lápices?', [table([[n, String(k)], ['Sol', String(k + 1)]])], 'Sol', [n, 'Tienen los mismos']); }],
    ],
    attention: [
      ['matching', 'school', (o, n, v) => choice('Mira el modelo. ¿Cuál es igual?', [text(`Modelo: ${shapes[v % 4]}`)], shapes[v % 4], shapes.filter(x => x !== shapes[v % 4]))],
      ['search', 'playground', (o, n, v) => { const s = shapes[v % 4], k = 1 + Math.floor(v / 4) % 3; return choice(`Busca esta figura: ${s}. ¿Cuántas hay?`, [list([...Array(k).fill(s), shapes[(v + 1) % 4], shapes[(v + 2) % 4]])], k, [k + 1, k + 2]); }],
      ['oddOne', 'toys', (o, n, v) => choice('Mira las figuras. ¿Cuál es diferente?', [list([shapes[v % 4], shapes[v % 4], shapes[(v + 1) % 4]])], shapes[(v + 1) % 4], [shapes[v % 4], shapes[(v + 2) % 4]])],
      ['matching', 'backpack', (o, n, v) => { const row = [String(1 + v % 6), String(7 + Math.floor(v / 6))]; return choice('Mira el modelo. ¿Qué fila es igual?', [text(`Modelo: ${row.join(' · ')}`), table([['A', row.join(' · ')], ['B', [...row].reverse().join(' · ')], ['C', '1 · 1']])], 'A', ['B', 'C']); }],
      ['findPlace', 'school', (o, n) => choice(`Busca ${o.name}. ¿Dónde está?`, [table([[o.name, o.place], ['la flor', 'el jardín']])], o.place, ['el jardín', 'el baño'])],
    ],
    memory: [
      ['rememberObjects', 'backpack', (o, n, v, level) => {
        const items = Array.from({length: policy.early.memoryElements[level - 1]}, (_, i) => objects[(v + i) % objects.length]);
        return choice('Mira lo que hay en la mochila.', [list(items.map(x => x.name))], o.name, [objects[(v + 5) % objects.length].name, objects[(v + 6) % objects.length].name], {
          type: 'memoryReveal', memoryQuestion: '¿Qué había en la mochila?',
          memoryContent: items.map(x => ({icon: x.icon, detail: x.name})), revealMs: 7000,
        });
      }],
      ['rememberPlace', 'bedroom', (o, n) => choice(`Mira dónde está ${o.name}.`, [text(`${o.name[0].toUpperCase() + o.name.slice(1)} está en ${o.place}.`)], o.place, ['el jardín', 'el baño'], {
        type: 'memoryReveal', memoryQuestion: `¿Dónde estaba ${o.name}?`, memoryContent: [{icon: o.icon, detail: `${o.name}: ${o.place}`}], revealMs: 6500,
      })],
      ['rememberPair', 'birthday', (o, n, v) => { const c = colors[v % 4]; return choice('Mira los globos de cada persona.', [table([[n, c], ['Sol', colors[(v + 1) % 4]]])], c, colors.filter(x => x !== c), {
        type: 'memoryReveal', memoryQuestion: `¿De qué color era el globo de ${n}?`, memoryContent: [{person: n, detail: `Globo ${c}`}, {person: 'Sol', detail: `Globo ${colors[(v + 1) % 4]}`}], revealMs: 7000,
      }); }],
      ['rememberOrder', 'school', (o, n, v, level) => { const items = Array.from({length: Math.min(3, policy.early.memoryElements[level - 1])}, (_, i) => objects[(v + i) % objects.length]); return choice('Mira estas cosas en orden.', [list(items.map(x => x.name))], items[0].name, items.slice(1).map(x => x.name), {
        type: 'memoryReveal', memoryQuestion: '¿Qué cosa estaba primero?', memoryContent: items.map((x, i) => ({icon: x.icon, detail: `${i + 1}. ${x.name}`})), revealMs: 7500,
      }); }],
    ],
    executive: [
      ['planning', 'sports', (o, n, v) => { const plans = [
        ['Vas a nadar. Necesitas el bañador, la toalla y las chanclas.', 'Mirar las tres cosas antes de salir'],
        ['Vas al colegio. Necesitas el libro, el cuaderno y el estuche.', 'Mirar las tres cosas antes de salir'],
        ['Vas de excursión. Necesitas la gorra, el agua y la merienda.', 'Mirar las tres cosas antes de salir'],
      ]; const [s, a] = plans[v % 3]; return choice('¿Qué puedes hacer para no olvidar nada?', [text(s)], a, ['Salir sin mirar la mochila', 'Llevar solo un juguete']); }],
      ['inhibition', 'playground', (o, n) => choice('¿Qué puede hacer mientras espera?', [text(`${n} quiere subir al tobogán. Hay una niña delante.`)], 'Esperar su turno', ['Empujar a la niña', 'Colarse delante'])],
      ['sequencing', 'family', (o, n, v) => { const routines = [
        ['Quieres lavarte las manos.', ['Abre el grifo', 'Lávate con jabón', 'Sécate las manos']],
        ['Quieres sembrar una semilla.', ['Pon tierra en la maceta', 'Pon la semilla', 'Riega con agua']],
        ['Quieres hacer un dibujo.', ['Busca el papel', 'Dibuja con el lápiz', 'Guarda el dibujo']],
      ]; const [s, steps] = routines[v % 3]; return order('Ordena los pasos.', steps, s); }],
      ['organisation', 'bedroom', (o, n) => choice(`¿Dónde puede guardar ${o.name}?`, [text(`En la caja van los juguetes. En la cesta van las otras cosas. ${n} tiene ${o.some}.`)], /pelota|muñeca|juguete|peluche/.test(o.name) ? 'En la caja' : 'En la cesta', ['En el suelo', /pelota|muñeca|juguete|peluche/.test(o.name) ? 'En la cesta' : 'En la caja'])],
    ],
    speedReasoning: [
      ['analogy', 'animals', (o, n, v) => { const pairs = [
        ['El pájaro vuela. El pez...', 'nada', ['salta', 'lee']],
        ['El perro ladra. El gato...', 'maúlla', ['canta', 'habla']],
        ['Con los ojos vemos. Con los oídos...', 'oímos', ['corremos', 'comemos']],
        ['El pájaro vive en un nido. El conejo vive en...', 'una madriguera', ['una mochila', 'un plato']],
      ]; const [s, a, w] = pairs[v % 4]; return choice('¿Cómo termina la frase?', [text(s)], a, w); }],
      ['pattern', 'school', (o, n, v) => { const a = colors[v % 4], b = colors[(v + 1) % 4]; return choice('¿Qué color viene después?', [list([a, b, a, b])], a, [b, colors[(v + 2) % 4]]); }],
      ['classification', 'animals', (o, n, v) => { const groups = [['gato', 'perro', 'conejo', 'silla', 'mesa'], ['manzana', 'pera', 'plátano', 'zapato', 'gorra'], ['pelota', 'muñeca', 'peonza', 'pan', 'leche']]; const g = groups[v % 3]; return choice('¿Qué palabra va con estas dos?', [list(g.slice(0, 2))], g[2], g.slice(3)); }],
      ['relationship', 'family', (o, n, v) => { const pairs = [['Llueve.', 'Un paraguas', 'Un bañador'], ['Hace frío.', 'Un abrigo', 'Un abanico'], ['Tienes sed.', 'Un vaso de agua', 'Un lápiz']]; const [s, a, w] = pairs[v % 3]; return choice('¿Qué necesitas?', [text(s)], a, [w, 'Una pelota']); }],
      ['pattern', 'school', (o, n, v) => { const start = 1 + v % 5, step = 1 + Math.floor(v / 5) % 2; const answer = start + step * 3; return choice('Mira los números. ¿Cuál viene después?', [list([start, start + step, start + step * 2].map(String))], answer, [answer - 1, answer + 1]); }],
      ['relationship', 'toys', (o, n, v) => { const next = objects[(v + 1) % objects.length]; return choice(`¿Qué cosa está debajo ${of(o.name)}?`, [text(`${o.name[0].toUpperCase() + o.name.slice(1)} está encima ${of(next.name)}.`)], next.name, [objects[(v + 2) % objects.length].name, objects[(v + 3) % objects.length].name]); }],
      ['classification', 'school', (o, n, v) => { const a = shapes[v % 4], b = shapes[(v + 1) % 4], count = 2 + Math.floor(v / 4) % 3; return choice('¿Qué figura aparece más veces?', [list([...Array(count).fill(a), b])], a, [b, shapes[(v + 2) % 4]]); }],
    ],
    applied: [
      ['chooseObject', 'excursion', (o, n) => choice('¿Qué debe llevar para beber?', [text(`${n} va de excursión. En el camino tendrá sed.`)], 'Una botella de agua', ['Un libro', 'Una pelota'])],
      ['solveProblem', 'school', (o, n) => choice('¿Qué puede hacer?', [text(`${n} quiere dibujar. Su lápiz no tiene punta.`)], 'Sacar punta al lápiz', ['Guardar el papel', 'Cerrar la mochila'])],
      ['followRule', 'playground', (o, n, v) => choice('¿Qué pelota puedes usar?', [text(`En este juego usamos la pelota de color ${colors[v % 4]}.`)], `La de color ${colors[v % 4]}`, colors.filter(x => x !== colors[v % 4]).map(x => `La de color ${x}`))],
      ['findPlace', 'bedroom', (o, n) => choice(`¿Dónde debe buscar ${o.name}?`, [text(`${n} dejó ${o.name} en ${o.place}. Ahora quiere ${o.gender === 'f' ? 'usarla' : 'usarlo'}.`)], o.place, ['el jardín', 'el baño'])],
      ['solveProblem', 'snacks', (o, n) => choice('¿Qué puede hacer antes de comer?', [text(`${n} vuelve del patio. Tiene las manos sucias y quiere merendar.`)], 'Lavarse las manos', ['Ensuciar el plato', 'Guardar el jabón'])],
    ],
  };
  function pool(domain, level = 1) {
    const bandLevel = Math.max(1, Math.min(3, Number(level) || 1));
    if (!families[domain]) throw new Error('Área no permitida para 6-7.');
    const result = [];
    families[domain].forEach(([mechanic, context, build], family) => {
      for (let variant = 0; variant < 24; variant++) {
        const item = build(objects[variant % objects.length], names[variant % names.length], variant, bandLevel);
        // A visible activity keeps its identity across levels unless its
        // stimulus changes (e.g. the memory load). This avoids repeat-by-level.
        const signature = JSON.stringify([item.type, item.q, item.stimulus, item.opts, item.tokens, item.memoryQuestion]);
        let hash = 2166136261;
        for (const char of signature) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
        item.id = `early-v1-${domain}-${family}-${(hash >>> 0).toString(16)}`;
        item.contentKey = item.id;
        item.domain = domain;
        item.level = bandLevel;
        item.ageProfile = { id: 'early', revision: 1, context, mechanic };
        policy.validateEarly(item);
        result.push(item);
      }
    });
    const seen = new Set();
    return result.filter(item => {
      const signature = JSON.stringify([item.type, item.q, item.stimulus, item.opts, item.tokens, item.memoryQuestion]);
      if (seen.has(signature)) return false;
      seen.add(signature); return true;
    });
  }
  function select(profile, domains, count, level = 1, random = Math.random) {
    const history = profile.progress?._earlyDelivery || { ids: [], mechanics: [] };
    const used = new Set(history.ids);
    const recent = [...history.mechanics];
    const chosen = [];
    const pools = new Map(domains.map(d => [d, pool(d, level)]));
    for (let i = 0; i < count; i++) {
      const candidates = pools.get(domains[i % domains.length]);
      let available = candidates.filter(it => !used.has(it.id));
      if (!available.length) {
        candidates.forEach(it => used.delete(it.id));
        available = candidates.filter(it => !chosen.some(c => c.id === it.id));
      }
      const varied = available.filter(it => !recent.slice(-2).includes(it.ageProfile.mechanic));
      const options = varied.length ? varied : available;
      if (!options.length) throw new Error('No quedan actividades distintas para esta ficha.');
      const item = options[Math.floor(random() * options.length)];
      chosen.push(item); used.add(item.id); recent.push(item.ageProfile.mechanic);
    }
    profile.progress = { ...profile.progress, _earlyDelivery: { ids: [...used].slice(-600), mechanics: recent.slice(-8) } };
    return chosen;
  }
  // Call only after an authorized server response. Never retry a rejected request
  // locally or generate more activities than the server has delivered/charged.
  function adaptResponse(response, payload, profile) {
    if (!policy.forProfile(profile)) return response;
    const domains = payload.domains || [payload.domain];
    if (!domains.length || domains.some(d => !policy.early.subjects.includes(d))) throw new Error('Área no permitida para 6-7.');
    const count = payload.kind === 'worksheet' ? payload.questions : (payload.count || 1);
    if (!Array.isArray(response?.items) || response.items.length !== count)
      throw new Error('El servidor no ha entregado todas las actividades solicitadas.');
    const items = select(profile, domains, count, payload.level);
    return { ...response, items: items.map((it, i) => ({ ...it, sourceItemId: response.items[i].id })) };
  }
  const api = { objects, pool, select, adaptResponse };
  root.EarlyContent = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

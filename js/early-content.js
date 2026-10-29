(function (root) {
  'use strict';
  const policy = root.ContentPolicy || (typeof require === 'function' && require('./content-policy.js'));
  const curriculum = root.Curriculum;
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
      ['compare', 'school', (o, n, v) => { const k = 1 + v % 4, first = v % 2 === 1; return choice('¿Quién tiene más lápices?', [table([[n, String(first ? k + 1 : k)], ['Sol', String(first ? k : k + 1)]])], first ? n : 'Sol', [first ? 'Sol' : n, 'Tienen los mismos']); }],
    ],
    attention: [
      ['matching', 'school', (o, n, v) => choice('Mira el modelo. ¿Cuál es igual?', [text(`Modelo: ${shapes[v % 4]}`)], shapes[v % 4], shapes.filter(x => x !== shapes[v % 4]))],
      ['search', 'playground', (o, n, v) => { const s = shapes[v % 4], k = 1 + Math.floor(v / 4) % 3; return choice(`Busca esta figura: ${s}. ¿Cuántas hay?`, [list([...Array(k).fill(s), shapes[(v + 1) % 4], shapes[(v + 2) % 4]])], k, [k + 1, k + 2]); }],
      ['oddOne', 'toys', (o, n, v) => choice('Mira las figuras. ¿Cuál es diferente?', [list([shapes[v % 4], shapes[v % 4], shapes[(v + 1) % 4]])], shapes[(v + 1) % 4], [shapes[v % 4], shapes[(v + 2) % 4]])],
      ['matching', 'backpack', (o, n, v) => {
        const row = [String(1 + v % 6), String(7 + Math.floor(v / 6))];
        const labels = ['A','B','C'], position = Math.floor(v / 6) % 3;
        const wrong = [[...row].reverse().join(' · '), '1 · 1'];
        const rows = labels.map((label,i)=>[label,i===position ? row.join(' · ') : wrong.shift()]);
        return choice('Mira el modelo. ¿Qué fila es igual?', [text(`Modelo: ${row.join(' · ')}`), table(rows)], labels[position], labels.filter((_,i)=>i!==position));
      }],
      ['findPlace', 'school', (o, n) => choice(`Busca ${o.name}. ¿Dónde está?`, [table([[o.name, o.place], ['la flor', 'el jardín']])], o.place, ['el jardín', 'el baño'])],
    ],
    memory: [
      ['rememberObjects', 'backpack', (o, n, v, level) => {
        const sets = [
          ['la mochila del colegio', [objects[0], objects[2], objects[5], objects[6]]],
          ['la mochila de la excursión', [objects[10], objects[6], objects[4], objects[9]]],
          ['la bolsa de los juguetes', [objects[1], objects[3], objects[7], objects[8]]],
        ];
        const [place, candidates] = sets[v % sets.length];
        const items = Array.from({length: policy.early.memoryElements[level - 1]}, (_, i) => candidates[(Math.floor(v / 3) + i) % candidates.length]);
        const wrong = objects.filter(x => !items.some(it => it.name === x.name)).slice(0, 2);
        return choice(`Mira lo que hay en ${place}.`, [list(items.map(x => x.name))], items[0].name, wrong.map(x => x.name), {
          type: 'memoryReveal',
          memoryQuestion: `¿Qué había en ${place}?`,
          answerEvidence: {type:'listItem',block:0,index:0},
          memoryContent: items.map(x => ({icon: x.icon, detail: x.name})), revealMs: 7000,
        });
      }],
      ['rememberPlace', 'bedroom', (o, n) => choice(`Mira dónde está ${o.name}.`, [table([[o.name,o.place]])], o.place, ['el jardín', 'el baño'], {
        answerEvidence: {type:'tableCell',block:0,row:0,column:1,subjectColumn:0},
        type: 'memoryReveal', memoryQuestion: `¿Dónde estaba ${o.name}?`, memoryContent: [{icon: o.icon, detail: `${o.name}: ${o.place}`}], revealMs: 6500,
      })],
      ['rememberPair', 'birthday', (o, n, v) => { const c = colors[v % 4]; return choice('Mira los globos de cada persona.', [table([[n, c], ['Sol', colors[(v + 1) % 4]]])], c, colors.filter(x => x !== c), {
        type: 'memoryReveal', memoryQuestion: `¿De qué color era el globo de ${n}?`, memoryContent: [{person: n, detail: `Globo ${c}`}, {person: 'Sol', detail: `Globo ${colors[(v + 1) % 4]}`}], revealMs: 7000,
        answerEvidence: {type:'tableCell',block:0,row:0,column:1,subjectColumn:0},
      }); }],
      ['rememberOrder', 'school', (o, n, v, level) => { const items = Array.from({length: Math.min(3, policy.early.memoryElements[level - 1])}, (_, i) => objects[(v + i) % objects.length]); return choice('Mira estas cosas en orden.', [list(items.map(x => x.name))], items[0].name, items.slice(1).map(x => x.name), {
        type: 'memoryReveal', memoryQuestion: '¿Qué cosa estaba primero?', memoryContent: items.map((x, i) => ({icon: x.icon, detail: `${i + 1}. ${x.name}`})), revealMs: 7500,
        answerEvidence: {type:'listItem',block:0,index:0},
      }); }],
    ],
    executive: [
      ['planning', 'sports', (o, n, v) => { const plans = [
        ['Vas a nadar. Necesitas el bañador, la toalla y las chanclas.', 'Mirar las tres cosas antes de salir'],
        ['Vas al colegio. Necesitas el libro, el cuaderno y el estuche.', 'Mirar las tres cosas antes de salir'],
        ['Vas de excursión. Necesitas la gorra, el agua y la merienda.', 'Mirar las tres cosas antes de salir'],
        ['Quieres pintar. Necesitas el papel, la pintura y el pincel.', 'Preparar las cosas antes de pintar'],
        ['Quieres jugar al balón. Primero debes recoger los juguetes del suelo.', 'Recoger los juguetes antes de jugar'],
        ['Vas a poner la mesa. Necesitas un plato para cada persona.', 'Contar las personas y buscar los platos'],
      ]; const index = v % plans.length, [s, a] = plans[index];
        const wrong = [
          ['Revisar solo la toalla', 'Llevar solo las chanclas'],
          ['Revisar solo el libro', 'Guardar solo el estuche'],
          ['Llevar solo la gorra', 'Dejar el agua en casa'],
          ['Empezar sin el papel', 'Guardar el pincel'],
          ['Empezar sin recoger', 'Dejar los juguetes en el suelo'],
          ['Poner un solo plato', 'Guardar todos los platos'],
        ][index];
        return choice(index < 3 ? '¿Qué puedes hacer para no olvidar nada?' : '¿Qué debes hacer primero?', [text(s)], a, wrong);
      }],
      ['inhibition', 'playground', (o, n, v) => {
        const situations = [
          [`${n} quiere subir al tobogán. Hay una niña delante.`, 'Esperar su turno', ['Empujar a la niña', 'Colarse delante']],
          [`La maestra está hablando. ${n} quiere contar algo.`, 'Levantar la mano y esperar', ['Gritar por encima de la maestra', 'Salir corriendo']],
          [`Estáis jugando a las cartas. Ahora le toca a otra persona.`, 'Esperar a que termine su turno', ['Quitarle las cartas', 'Jugar antes de que termine']],
        ];
        const [scenario, answer, wrong] = situations[v % situations.length];
        return choice('¿Qué puede hacer ahora?', [text(scenario)], answer, wrong);
      }],
      ['sequencing', 'family', (o, n, v) => { const routines = [
        ['El grifo ya está abierto. Quieres lavarte las manos.', ['Lávate con jabón', 'Cierra el grifo', 'Sécate las manos']],
        ['Quieres sembrar una semilla.', ['Pon tierra en la maceta', 'Pon la semilla', 'Riega con agua']],
        ['Quieres hacer un dibujo.', ['Busca el papel', 'Dibuja con el lápiz', 'Guarda el dibujo']],
        ['Quieres hacer una figura de plastilina y guardarla.', ['Saca la plastilina', 'Haz una figura', 'Guarda la figura en la caja']],
        ['En este juego tiras el dado y avanzas tantas casillas como puntos.', ['Tira el dado', 'Cuenta los puntos', 'Mueve la ficha']],
        ['Quieres envolver un regalo dentro de una caja.', ['Pon el regalo en la caja', 'Cierra la caja', 'Pon el lazo']],
      ]; const [s, steps] = routines[v % routines.length]; return order('Ordena los pasos.', steps, s); }],
      ['organisation', 'bedroom', (o, n, v) => {
        const toys = [objects[1], objects[3], objects[7], objects[8]];
        const school = [objects[0], objects[2], objects[5]];
        const item = [...toys, ...school][v % 7];
        const isToy = toys.includes(item);
        return choice(`¿Dónde puede guardar ${item.name}?`, [text(`En la caja van los juguetes. En el estante van las cosas del colegio. ${n} tiene ${item.some}.`)], isToy ? 'En la caja' : 'En el estante', ['En el suelo', isToy ? 'En el estante' : 'En la caja']);
      }],
    ],
    speedReasoning: [
      ['analogy', 'animals', (o, n, v) => { const pairs = [
        ['El pájaro vuela. El pez...', 'nada', ['camina', 'lee']],
        ['El perro ladra. El gato...', 'maúlla', ['canta', 'habla']],
        ['Con los ojos vemos. Con los oídos...', 'oímos', ['corremos', 'comemos']],
        ['Con las piernas caminamos. Con las manos...', 'aplaudimos', ['oímos', 'miramos']],
      ]; const [s, a, w] = pairs[v % 4]; return choice('¿Cómo termina la frase?', [text(s)], a, w); }],
      ['pattern', 'school', (o, n, v) => { const a = colors[v % 4], b = colors[(v + 1) % 4]; return choice('¿Qué color viene después?', [list([a, b, a, b])], a, [b, colors[(v + 2) % 4]]); }],
      ['classification', 'animals', (o, n, v) => { const groups = [['gato', 'perro', 'conejo', 'silla', 'mesa'], ['manzana', 'pera', 'plátano', 'zapato', 'gorra'], ['pelota', 'muñeca', 'coche de juguete', 'pan', 'leche']]; const g = groups[v % 3]; return choice('¿Qué palabra va con estas dos?', [list(g.slice(0, 2))], g[2], g.slice(3),v % 3===1?{lexicalSenses:{banana:true}}:{}); }],
      ['relationship', 'family', (o, n, v) => { const pairs = [['Llueve.', 'Un paraguas', 'Un bañador'], ['Hace frío.', 'Un abrigo', 'Un abanico'], ['Tienes sed.', 'Un vaso de agua', 'Un lápiz']]; const [s, a, w] = pairs[v % 3]; return choice('¿Qué necesitas?', [text(s)], a, [w, 'Una pelota']); }],
      ['pattern', 'school', (o, n, v, level) => { const step = level === 1 ? 1 : 1 + Math.floor(v / 5) % 2; const start = 1 + v % (step === 1 ? 5 : 3); const answer = start + step * 3; return choice('Mira los números. ¿Cuál viene después?', [list([start, start + step, start + step * 2].map(String))], answer, [answer - 1, answer + 1]); }],
      ['relationship', 'bedroom', (o, n, v) => {
        const pairs = [['el libro','el cuaderno'],['el cuaderno','el libro'],['la caja','la mesa'],['el lápiz','el cuaderno'],['el coche de juguete','la caja'],['el regalo','la mesa']];
        const [top,bottom] = pairs[v % pairs.length];
        return choice(`¿Qué está debajo ${of(top)}?`, [table([['Arriba',top],['Abajo',bottom]])], bottom, ['la gorra','la muñeca']);
      }],
      ['classification', 'school', (o, n, v) => { const a = shapes[v % 4], b = shapes[(v + 1) % 4], count = 2 + Math.floor(v / 4) % 3; return choice('¿Qué figura aparece más veces?', [list([...Array(count).fill(a), b])], a, [b, shapes[(v + 2) % 4]]); }],
    ],
    applied: [
      ['chooseObject', 'excursion', (o, n) => choice('¿Qué debe llevar para beber?', [text(`${n} va de excursión. En el camino tendrá sed.`)], 'Una botella de agua', ['Un libro', 'Una pelota'])],
      ['solveProblem', 'school', (o, n, v) => {
        const problems = [
          [`${n} quiere dibujar. Su lápiz no tiene punta.`, 'Sacar punta al lápiz', ['Guardar el papel', 'Cerrar la mochila']],
          [`${n} no encuentra su cuaderno. Lo necesita para escribir.`, 'Buscar el cuaderno en la mochila', ['Escribir sobre la mesa', 'Tirar el lápiz']],
          [`${n} quiere pegar un dibujo. El bote de pegamento está vacío.`, 'Pedir otro bote de pegamento', ['Romper el dibujo', 'Guardar todos los dibujos']],
        ]; const [s,a,w] = problems[v % problems.length]; return choice('¿Qué puede hacer?', [text(s)], a, w);
      }],
      ['followRule', 'playground', (o, n, v) => choice('¿Qué pelota puedes usar?', [text(`En este juego usamos la pelota de color ${colors[v % 4]}.`)], `La de color ${colors[v % 4]}`, colors.filter(x => x !== colors[v % 4]).map(x => `La de color ${x}`))],
      ['findPlace', 'bedroom', (o, n) => choice(`¿Dónde debe buscar ${o.name}?`, [text(`${n} dejó ${o.name} en ${o.place}. Ahora quiere ${o.gender === 'f' ? 'usarla' : 'usarlo'}.`)], o.place, ['el jardín', 'el baño'])],
      ['solveProblem', 'snacks', (o, n) => choice('¿Qué puede hacer antes de comer?', [text(`${n} vuelve del patio. Tiene las manos sucias y quiere merendar.`)], 'Lavarse las manos', ['Ensuciar el plato', 'Guardar el jabón'])],
    ],
  };
  const refinements=root.EarlyRefinements || (typeof require==='function'&&require('./early-refinements.js'));
  refinements.apply(families,{choice,order,text,list,table,objects,shapes,colors});
  const language=root.EarlyLanguage || (typeof require==='function'&&require('./early-language.js'));
  language.apply(families,{choice,order,text});
  function pool(domain, level = 1, subdomain = null) {
    const bandLevel = Math.max(1, Math.min(3, Number(level) || 1));
    if(domain==='social')return (root.Curriculum||(typeof require==='function'&&require('./curriculum.js'))).pool('early','social',bandLevel);
    if(curriculum?.supports('early',domain)){
      let items=curriculum.pool('early',domain,bandLevel);
      if(domain==='reading'){
        const writing=pool('language',bandLevel,'writing').map(it=>({...it,domain:'reading',originalDomain:'language',passageKey:'writing-early:'+it.semanticKey,ageProfile:{...it.ageProfile,mechanic:'sequencing',family:'reading-writing'},mechanic:'reading_writing'}));
        items=items.filter(it=>it.languageFocus!=='writing');
        items=subdomain==='writing'?writing:subdomain==='reading'||subdomain==='grammar'?items:[...items,...writing];
      }
      return items;
    }
    if (!families[domain]) throw new Error('Área no permitida para 6-7.');
    const result = [];
    families[domain].forEach(([mechanic, context, build], family) => {
      for (let variant = 0; variant < 24; variant++) {
        const item = build(objects[variant % objects.length], names[variant % names.length], variant, bandLevel);
        for(const block of item.stimulus)if(block.type==='list'&&!block.presentation)block.presentation='cards';
        if(bandLevel===1 && item.opts)item.opts=item.opts.slice(0,2);
        // A visible activity keeps its identity across levels unless its
        // stimulus changes (e.g. the memory load). This avoids repeat-by-level.
        const signature = JSON.stringify([item.type, item.q, item.stimulus, item.opts, item.tokens, item.memoryQuestion]);
        let hash = 2166136261;
        for (const char of signature) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
        item.id = `early-v1-${domain}-${family}-${(hash >>> 0).toString(16)}`;
        item.contentKey = item.id;
        let semanticSignature = (domain==='division'?JSON.stringify([item.type,item.q,item.stimulus,item.quantityEvidence]):signature).replace(/\b(?:Ana|Leo|Mar|Pau|Lola|Hugo|Nora|Dani|Sol)\b/g, 'PERSONA');
        // Object swaps do not constitute new arithmetic problems.
        if(domain==='division' && ['addition','subtraction'].includes(mechanic)) {
          for(const noun of objects.flatMap(x=>[x.name,x.some,x.plural]).sort((a,b)=>b.length-a.length))semanticSignature=semanticSignature.split(noun).join('OBJETO');
          semanticSignature=semanticSignature.replace(/Cuánt[oa]s/g,'Cuántos');
        }
        let semanticHash = 2166136261;
        for (const char of semanticSignature) semanticHash = Math.imul(semanticHash ^ char.charCodeAt(0), 16777619);
        item.semanticKey = `early-sem-v1-${domain}-${family}-${(semanticHash >>> 0).toString(16)}`;
        item.domain = domain;
        item.level = bandLevel;
        if(domain==='language'&&!item.languageFocus)item.languageFocus=family===1?'writing':'grammar';
        item.ageProfile = { id: 'early', revision: 1, context, mechanic, family: `${domain}-${family}` };
        item.selectionWeight=({language:{1:.55,3:.55},reading:{0:.55,4:.55},division:{1:.65,2:.65}})[domain]?.[family] || 1;
        policy.validateEarly(item);
        result.push(item);
      }
    });
    if(domain==='attention'&&curriculum?.practice)result.push(...curriculum.practice('early','attention',bandLevel));
    if(domain==='language'&&curriculum?.vocabulary)result.push(...curriculum.vocabulary('early','language',bandLevel));
    const functional=root.FunctionalContent||(typeof require==='function'&&require('./functional-content'));
    if(functional)result.push(...functional.pool('early',domain,bandLevel));
    const seen = new Set();
    return result.filter(item => {
      if(domain==='language'&&(subdomain?item.languageFocus!==subdomain:item.languageFocus==='writing'))return false;
      const signature = JSON.stringify([item.type, item.q, item.stimulus, item.opts, item.tokens, item.memoryQuestion]);
      if (seen.has(signature)) return false;
      seen.add(signature); return true;
    });
  }
  function select(profile, domains, count, level = 1, random = Math.random, accept = null, subdomain = null) {
    const history = profile.progress?._earlyDelivery || { ids: [], mechanics: [] };
    const used = new Set(history.ids);
    const usedKeys = new Set(history.keys || []);
    const recent = [...history.mechanics];
    const recentFamilies = [...(history.families || [])];
    const quality=root.ContentQuality||(typeof require==='function'&&require('./content-quality'));
    const familyCache=new WeakMap();
    const familyOf=it=>{if(!familyCache.has(it)){const family=quality.family(it,it.domain);familyCache.set(it,family==='unclassified'?it.ageProfile.family:family);}return familyCache.get(it);};
    const recentPassages=[...(history.passages||[])];
    const chosen = [];
    const pools = new Map(domains.map(d => [d, pool(d, level,subdomain).filter(it=>!accept || accept(it,d))]));
    if(accept && new Set([...pools.values()].flat().map(it=>it.semanticKey)).size<count)
      throw new Error('No hay suficientes actividades imprimibles distintas para las áreas y el nivel seleccionados. Prueba con menos ejercicios o añade otra área.');
    // Upgrade existing delivery histories without treating name-only variants
    // as new activities after the gate is introduced.
    for (const items of pools.values()) for (const item of items) {
      if (used.has(item.id)) usedKeys.add(item.semanticKey);
    }
    for (let i = 0; i < count; i++) {
      let candidates = pools.get(domains[i % domains.length]);
      let available = candidates.filter(it => (it.passageKey?!recentPassages.slice(-9).includes(it.passageKey):!usedKeys.has(it.semanticKey)) && !chosen.some(c => c.semanticKey === it.semanticKey));
      if (!available.length) {
        candidates.forEach(it => { used.delete(it.id); usedKeys.delete(it.semanticKey); });
        available = candidates.filter(it => !chosen.some(c => c.semanticKey === it.semanticKey));
      }
      if(!available.length && accept){
        candidates=[...pools.values()].flat();
        available=candidates.filter(it=>!usedKeys.has(it.semanticKey)&&!chosen.some(c=>c.semanticKey===it.semanticKey));
        if(!available.length)available=candidates.filter(it=>!chosen.some(c=>c.semanticKey===it.semanticKey));
      }
      const freshTexts=available.filter(it=>!it.passageKey||!recentPassages.slice(-9).includes(it.passageKey));
      if(freshTexts.length)available=freshTexts;
      let freshFamilies = available.filter(it => !recentFamilies.slice(-2).includes(familyOf(it)));
      if(!freshFamilies.length)freshFamilies=available.filter(it=>familyOf(it)!==recentFamilies.at(-1));
      const varied = (freshFamilies.length ? freshFamilies : available).filter(it => !recent.slice(-2).includes(it.ageProfile.mechanic));
      const options = varied.length ? varied : freshFamilies.length ? freshFamilies : available;
      if (!options.length) throw new Error('No quedan actividades distintas para esta ficha.');
      // Balance task families instead of sampling from their unequal numbers of
      // name/object permutations. Delivery history survives reloads and sessions.
      const groups=[...new Set(options.map(it=>familyOf(it)))];
      const frequency=f=>recentFamilies.slice(-12).filter(x=>x===f).length/(options.find(it=>familyOf(it)===f).selectionWeight || 1);
      const minimum=Math.min(...groups.map(frequency));
      const balanced=groups.filter(f=>frequency(f)===minimum);
      const selectedFamily=balanced[Math.floor(random()*balanced.length)];
      const familyOptions=options.filter(it=>familyOf(it)===selectedFamily);
      const item = familyOptions[Math.floor(random() * familyOptions.length)];
      chosen.push(item);if(item.passageKey)recentPassages.push(item.passageKey); used.add(item.id); usedKeys.add(item.semanticKey); recent.push(item.ageProfile.mechanic); recentFamilies.push(familyOf(item));
    }
    profile.progress = { ...profile.progress, _earlyDelivery: { ids: [...used].slice(-600), keys: [...usedKeys].slice(-600), mechanics: recent.slice(-12), families: recentFamilies.slice(-12),passages:recentPassages.slice(-9) } };
    return chosen;
  }
  // Call only after an authorized server response. Never retry a rejected request
  // locally or generate more activities than the server has delivered/charged.
  function adaptResponse(response, payload, profile, options = {}) {
    if (!policy.forProfile(profile)) return response;
    const domains = payload.domains || [payload.domain];
    if (!domains.length || domains.some(d => !policy.early.subjects.includes(d))) throw new Error('Área no permitida para 6-7.');
    const count = payload.kind === 'worksheet' ? payload.questions : (payload.count || 1);
    if (!Array.isArray(response?.items) || response.items.length !== count)
      throw new Error('El servidor no ha entregado todas las actividades solicitadas.');
    const items = select(profile, domains, count, payload.level, Math.random, options.accept || null, payload.subdomain || null);
    return { ...response, items: items.map((it, i) => ({ ...it, sourceItemId: response.items[i].id })) };
  }
  const api = { objects, pool, select, adaptResponse };
  root.EarlyContent = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

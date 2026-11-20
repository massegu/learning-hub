(function(root){
  'use strict';

  const ages={early:'6–7 años',junior:'8–10 años',primary:'10–12 años',middle:'13–15 años',teen:'16–18 años'};
  const areas={attention:'Atención',executive:'Funciones ejecutivas',memory:'Memoria',speedReasoning:'Velocidad de procesamiento',social:'Perspectivas y convivencia',communication:'Comunicación funcional',language:'Lenguaje',middleLanguage:'Lenguaje',teenLanguage:'Lenguaje',reading:'Lectura y escritura',literacy:'Lectura y escritura',middleReading:'Lectura y escritura',division:'Matemáticas',middleMath:'Matemáticas',teenMath:'Matemáticas',geometry:'Matemáticas',english:'Inglés',applied:'Situaciones cotidianas'};
  const curricularAreas=new Set(['language','middleLanguage','teenLanguage','reading','middleReading','literacy','division','middleMath','teenMath','geometry','english']);
  const definitions={
    differences:['Encuentra las diferencias','Comparar escenas fijas y señalar cambios'],
    contradiction:['Encuentra la contradicción','Contrastar datos incompatibles'],
    documents:['Comprensión de documentos','Interpretar datos funcionales de una fuente'],
    documentPlan:['Revisar planes con documentos','Revisar el plan con los datos del documento'],
    visualSearch:['Buscar coincidencias en una cuadrícula','Seleccionar estímulos que coinciden con un modelo'],
    visualCompare:['Comparar cuadrículas','Marcar posiciones que cambian entre dos cuadrículas'],
    filter:['Datos pertinentes','Seleccionar la información necesaria'],
    omission:['Detectar omisiones','Detectar un elemento que falta al comparar listas'],
    intrusion:['Detectar elementos intrusos','Detectar elementos que incumplen una selección'],
    deduction:['Descubre quién','Descartar alternativas a partir de pistas'],
    updatePlan:['Cambio de plan','Actualizar un plan ante un imprevisto'],
    plan:['Organizar acciones','Ordenar pasos según sus dependencias'],
    resume:['Continuar un plan','Retomar un plan sin repetir pasos'],
    words:['La palabra que encaja','Buscar una palabra o expresión compatible con las condiciones'],
    literal:['Comprensión literal','Localizar información explícita'],
    inference:['Inferencias y evidencia','Relacionar pistas para sostener una conclusión'],
    mainIdea:['Idea principal y propósito','Identificar la idea o función principal de un texto'],
    chronology:['Secuencias escritas','Reconstruir el orden de hechos o instrucciones'],
    grammar:['Gramática y concordancia','Reconocer, revisar u ordenar estructuras del español'],
    spelling:['Ortografía','Distinguir opciones según la forma escrita'],
    vocabulary:['Vocabulario en contexto','Elegir significados y palabras según el contexto'],
    writing:['Producción escrita','Escribir o revisar un texto con criterios observables'],
    number:['Cantidades y cálculo','Relacionar cantidades y realizar cálculos escritos'],
    measures:['Medidas y tiempo','Interpretar magnitudes y unidades'],
    money:['Importes y presupuestos','Usar datos monetarios explícitos'],
    geometry:['Figuras y relaciones espaciales','Aplicar propiedades geométricas'],
    english:['Comprender textos e instrucciones en inglés','Usar las pistas de un texto o indicación en inglés'],
    perspective:['Puntos de vista e intenciones','Interpretar el punto de vista o la intención en una situación'],
    coexistence:['Acuerdos y convivencia','Elegir acciones que respeten turnos, necesidades o límites'],
    help:['Pedir ayuda','Describir el obstáculo y pedir ayuda útil'],
    clarify:['Aclarar indicaciones','Preguntar por el dato que falta'],
    needs:['Expresar necesidades','Comunicar una necesidad y una petición concreta'],
    confirm:['Confirmar una recepción','Confirmar que un aviso se entendió y se comunicó'],
    audience:['Elegir destinatarios','Distinguir los destinos de un mensaje y sus permisos'],
    feedback:['Dar indicaciones útiles','Elegir observaciones específicas y verificables'],
    evidence:['Contrastar fuentes','Identificar la fuente pertinente antes de transmitir un dato'],
    coordinate:['Coordinar una entrega','Explicar una acción compatible con permisos y versiones'],
    incident:['Informar de una incidencia','Distinguir hechos observados de suposiciones'],
    repair:['Aclarar un malentendido','Contrastar versiones antes de corregir un mensaje'],
    turns:['Negociar turnos','Proponer un acuerdo que respeta las condiciones'],
    summary:['Resumir indicaciones para actuar','Conservar la información que sigue vigente'],
    wait:['Espera guiada','Practicar una espera con apoyo temporal'],
    rules:['Actúa con reglas','Mantener, cambiar o inhibir respuestas en pantalla'],
    falling:['Palabras en caída','Transcribir palabras durante una presentación dinámica'],
    audio:['Memoria y señales auditivas','Responder a estímulos auditivos'],
    recall:['Recuerdo con ocultación','Recuperar información después de retirar el estímulo'],
    timing:['Retos con cronómetro','Realizar una tarea dentro de un diseño de medición temporal'],
    observation:['Práctica interactiva de observación','Registrar acciones u observaciones que dependen de la interacción'],
    pending:['Otras actividades pendientes de revisión','Revisar la relación entre el estímulo, la respuesta y el propósito']
  };
  const cognitive={deduction:'deduction',change:'updatePlan',information:'filter',contradiction:'contradiction',words:'words',guidedWait:'wait',rules:'rules',falling:'falling'};
  const communication={ask_help:'help',clarify:'clarify',express_need:'needs',confirm_receipt:'confirm',privacy_audience:'audience',actionable_feedback:'feedback',verify_source:'evidence',coordinate_handoff:'coordinate',report_incident:'incident',repair_mismatch:'repair',negotiate_turn:'turns',summarize_action:'summary'};
  const interactive=new Set(['recall','wait','rules','falling','audio','timing','observation']);
  const adaptation={
    differences:'Comparar las dos imágenes impresas juntas. Marcar o escribir las diferencias solicitadas.',
    contradiction:'Escribir el dato que no coincide y los valores de las dos fuentes.',
    filter:'Identificar por escrito los datos relevantes en el material visible.',
    deduction:'Leer todas las pistas impresas y anotar la tarjeta final.',
    updatePlan:'Escribir las acciones en el orden corregido.',
    visualSearch:'Marcar posiciones en una cuadrícula impresa. No tomar tiempos.',
    visualCompare:'Marcar o anotar coordenadas de cambios en la cuadrícula B. No tomar tiempos.',
    writing:'Revisar con los criterios impresos y considerar el solucionario como ejemplo.'
  };

  function orient(domain,item){
    const primary=curricularAreas.has(domain)?'curricular':'cognitive';
    const secondary=domain==='communication'?['comunicación funcional','comprensión de consignas']:
      primary==='curricular'?['atención','razonamiento']:
      item?.cognitiveTask?.kind==='words'?['vocabulario','precisión semántica']:
      ['lectura funcional'];
    return {primary,secondary};
  }

  function familyKind(item,domain){
    const semantic=String(item.qualityDescriptor?.semanticFamily||item.semanticFamily||root.ContentQuality?.family(item,domain)||'');
    const mechanic=String(item.mechanic||''),task=item.cognitiveTask?.kind,execution=item.execution?.kind;
    if(item.audioMemory||item.interactionTask?.kind==='auditory')return 'audio';
    if(item.recallSequence||item.memoryContent||item.memoryQuestion||item.selectiveRecall||item.recallEvidence||
      ['serial','spatial','update'].includes(execution)||/^memory/i.test(item.type||''))return 'recall';
    if(task)return cognitive[task]||'pending';
    if(['switch','inhibit'].includes(execution))return 'rules';
    if(item.roomSpeedTask||item.interactionTask)return 'observation';
    if(item.speedTask||item.trialMs||item.timingRequired||item.interactiveOnly||item.printable==='interactive-only')return 'timing';
    if(execution)return ({cancel:'visualSearch',compare:'visualCompare',plan:'plan',follow:'chronology'})[execution]||'pending';
    if(item.photoTask?.kind==='differences')return 'differences';
    if(domain==='memory')return 'pending';
    if(domain==='communication')return communication[semantic.split('.').at(-1)]||'pending';
    if(item.stimulus?.some(block=>block.type==='document'))return domain==='executive'?'documentPlan':'documents';
    if(domain==='attention'){
      if(/omission/.test(semantic+' '+mechanic))return 'omission';
      if(/intrus/.test(semantic+' '+mechanic))return 'intrusion';
      if(/relevance|selective|rules/.test(semantic))return 'filter';
    }
    if(domain==='executive'){
      if(/resume/.test(mechanic))return 'resume';
      if(/digital_workflow/.test(semantic)||item.type==='order'&&item.planEvidence)return 'plan';
      if(/executive\.(?:conditions|resources|review|update)/.test(semantic))return 'documentPlan';
    }
    if(domain==='social'){
      if(/perspective|intent|emotion/.test(semantic))return 'perspective';
      if(/help|repair|boundary|cooperation/.test(semantic))return 'coexistence';
      if(/social.literal/.test(semantic))return 'literal';
    }
    if(['reading','literacy','middleReading'].includes(domain)){
      if(item.type==='self'&&item.sample&&item.writingRubric?.length)return 'writing';
      if(/literal/.test(semantic+' '+mechanic))return 'literal';
      if(/inference|evidence|constraints/.test(semantic+' '+mechanic))return 'inference';
      if(/main_idea|purpose/.test(semantic+' '+mechanic))return 'mainIdea';
      if(/chronology|follow_instruction/.test(semantic+' '+mechanic))return 'chronology';
    }
    if(['language','middleLanguage','teenLanguage'].includes(domain)){
      if(item.languageFocus==='spelling'||/spelling|phonology/.test(semantic))return 'spelling';
      if(item.languageFocus==='vocabulary'||/meaning|opposites|vocabulary/.test(semantic))return 'vocabulary';
      if(item.languageFocus==='grammar'||/agreement|structure|sentence_order/.test(semantic))return 'grammar';
    }
    if(['division','middleMath','teenMath','geometry'].includes(domain)){
      if(/money|budget/.test(semantic))return 'money';
      if(/measure|time/.test(semantic))return 'measures';
      if(domain==='geometry'||semantic.startsWith('geometry.'))return 'geometry';
      if(/^math\./.test(semantic)||item.mathEvidence||item.dividend!==undefined)return 'number';
    }
    if(domain==='english'&&/^english\./.test(semantic))return 'english';
    return 'pending';
  }

  function classify(item,domain=item?.domain||item?.sourceDomain){
    const kind=familyKind(item,domain);
    const [label,purpose]=definitions[kind];
    const status=interactive.has(kind)?'interactive':kind==='pending'?'pending':adaptation[kind]?'adapted':'direct';
    return {id:domain+':'+kind,domain,kind,label,purpose,status,orientation:orient(domain,item),
      administration:adaptation[kind]||'',limitations:status==='adapted'?'La ficha no reproduce la modalidad de pantalla ni sus medidas.':'',
      solutions:kind==='writing'?'example':interactive.has(kind)||kind==='pending'?'none':'objective',
      validation:status==='pending'?'pendiente':status==='interactive'?'solo pantalla':'proyección técnica revisada'};
  }

  function staticPaper(item){
    if(!item||!root.CognitiveFamilies.paperEligible(item))return false;
    return !interactive.has(familyKind(item,item.domain||item.sourceDomain));
  }

  // Fingerprint visible instructions/source/solution. Ignore distractor order,
  // opaque source IDs, incidental names and changes to isolated numeric values.
  const names=/\b(?:ana|leo|mar|pau|lola|hugo|nora|dani|sol|sara|bruno|ada|lucia|mateo|clara|alex|lucas)\b/g;
  function semanticSource(item){
    const blocks=(item.stimulus||[]).map(b=>[b.type,b.documentId||b.photoId||b.pairId||b.text||b.items||b.rows]);
    const source=[item.q,item.scenario,item.text,blocks,item.a,item.answer,item.answers,item.sample,item.cognitiveTask?.cue,item.dividend,item.divisor];
    return JSON.stringify(source).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase()
      .replace(names,'persona').replace(/\b\d+(?:[.,]\d+)?\b/g,'#').replace(/\s+/g,' ');
  }

  function fingerprint(item){
    const source=semanticSource(item);
    let first=2166136261,second=2246822519;
    for(const char of source){
      const code=char.codePointAt(0);
      first=Math.imul(first^code,16777619);
      second=Math.imul(second^code,3266489917);
    }
    return 'paper-v1:'+(first>>>0).toString(16).padStart(8,'0')+(second>>>0).toString(16).padStart(8,'0');
  }

  function configuration(value,locales){
    const keys=['age','level','locale','versions','solutions','families'];
    if(!value||typeof value!=='object'||Object.keys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(value,key))||
      !Object.hasOwn(ages,value.age)||![1,2,3].includes(value.level)||!Object.hasOwn(locales,value.locale)||
      ![1,2,3,4,5].includes(value.versions)||typeof value.solutions!=='boolean'||
      !Array.isArray(value.families)||!value.families.length||value.families.length>20)
      throw new Error('Configura la edad, el nivel, la variante y al menos una tipología.');
    const seen=new Set();
    let total=0;
    for(const row of value.families){
      if(!row||typeof row!=='object'||Object.keys(row).length!==2||typeof row.id!=='string'||
        !/^[a-zA-Z]+:[a-zA-Z]+$/.test(row.id)||seen.has(row.id)||!Number.isInteger(row.count)||row.count<1||row.count>20)
        throw new Error('Las tipologías y sus cantidades deben ser distintas y válidas.');
      seen.add(row.id);total+=row.count;
    }
    if(total>20)throw new Error('Cada ficha admite hasta 20 actividades.');
    return total;
  }

  function allocate(families,versions,candidates){
    const slots=families.flatMap(({id,count})=>Array.from({length:count*versions},()=>({id})));
    const owners=new Map(),assignments=new Map();
    function place(slot,visited){
      for(const candidate of candidates.get(slot.id)||[]){
        if(visited.has(candidate.identity))continue;
        visited.add(candidate.identity);
        const previous=owners.get(candidate.identity);
        if(previous&&!place(previous,visited))continue;
        owners.set(candidate.identity,slot);
        assignments.set(slot,candidate);
        return true;
      }
      return false;
    }
    // Preserve preferred entries when possible and try scarce families first.
    const ordered=[...slots].sort((a,b)=>(candidates.get(a.id)?.length||0)-(candidates.get(b.id)?.length||0));
    for(const slot of ordered)place(slot,new Set());
    const result=new Map(families.map(({id})=>[id,[]]));
    for(const slot of slots)if(assignments.has(slot))result.get(slot.id).push(assignments.get(slot));
    return result;
  }

  function verify(versions,config,prepare){
    if(!Array.isArray(versions)||versions.length!==config.versions)throw new Error('El banco no entregó todas las versiones.');
    const expected=config.families.flatMap(({id,count})=>Array(count).fill(id));
    const previous=new Set();
    return versions.map(items=>{
      if(!Array.isArray(items)||items.length!==expected.length)throw new Error('La ficha no contiene todas las actividades solicitadas.');
      return items.map((item,index)=>{
        const meta=classify(item);
        if(meta.id!==expected[index]||!['direct','adapted'].includes(meta.status)||!staticPaper(item)||item.level!==config.level)
          throw new Error(`Actividad ${index+1}: se pidió ${familyLabel(expected[index])} de nivel ${config.level} y llegó ${meta.label} de nivel ${item.level}.`);
        const accepted=prepare(item,meta.domain);
        const identity=semanticSource(accepted);
        if(previous.has(identity))throw new Error('El banco entregó actividades equivalentes.');
        previous.add(identity);
        return accepted;
      });
    });
  }

  const familyLabel=id=>definitions[String(id).split(':')[1]]?.[0]||'Tipología no disponible';
  const api={ages,areas,familyLabel,classify,staticPaper,orient,configuration,allocate,verify,fingerprint,semanticSource};
  root.WorksheetCatalog=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

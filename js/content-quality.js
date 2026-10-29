(function(root){
'use strict';
// Reviewed pedagogical operations. Source format, colour and answer order never create a family.
const registry={};
function define(id,purpose,dimension,aliases=[]){registry[id]={id,functionalPurpose:purpose,difficultyDimension:dimension};for(const alias of aliases)aliasesMap[alias]=id;}
const aliasesMap={};
const definitions=[
 ['language.agreement','Revisar quién realiza una acción en un mensaje','grammaticalRelations',['grammar_agreement','grammar_repair','lang_singular_plural']],
 ['language.sentence_order','Construir una frase comprensible','steps',['grammar_order','lang_sentence_order']],
 ['language.description','Describir personas y objetos de forma precisa','grammaticalRelations',['grammar_adjective','lang_description']],
 ['language.tense','Situar acciones en el tiempo','temporalRelations',['grammar_tense']],
 ['language.reference','Comprender a quién se refiere un mensaje','referents',['grammar_reference']],
 ['language.connectors','Expresar relaciones entre ideas','logicalRelations',['grammar_connectors','lang_temporal_connector']],
 ['language.structure','Completar una frase respetando su sentido','grammaticalRelations',['grammar_structure']],
 ['language.context_meaning','Comprender una palabra usando su contexto','inference',['vocabulary_context','lang_synonym']],
 ['language.opposites','Distinguir significados opuestos','semanticContrast',['vocabulary_contrast','lang_antonym']],
 ['language.phonology','Relacionar sonidos y palabras al leer','soundUnits',['lang_initial_sound','lang_rhyme','lang_syllable_count']],
 ['language.spelling','Escribir palabras reconocibles','spellingRules',['lang_build_word','lang_word_spacing']],
 ['language.punctuation','Hacer comprensible un mensaje con signos','punctuationRules',['lang_capital_period','lang_question_mark','lang_sentence_type','lang_dialogue','lang_revision']],
 ['language.classification','Organizar palabras según su significado','criteria',['lang_vocabulary_category']],
 ['reading.literal','Localizar información que aparece en una fuente','sourceDetails',['reading_literal','lang_note_read','lang_list_read','lang_story_sequence']],
 ['reading.inference','Relacionar pistas sin inventar información','inference',['reading_inference']],
 ['reading.compose','Expresar una idea siguiendo una fuente','messageParts',['reading_writing']],
 ['reading.document_purpose','Identificar para qué sirve un documento','sourcePurposes',[]],
 ['reading.document_relations','Relacionar condiciones de una fuente','conditions',[]],
 ['reading.document_evidence','Distinguir conclusiones justificadas de suposiciones','inference',[]],
 ['reading.summary','Seleccionar lo importante para comunicarlo','sourceDetails',['writing_summary']],
 ['reading.invitation','Invitar indicando datos necesarios','messageParts',['writing_invitation']],
 ['reading.request','Solicitar información o permiso','messageParts',['writing_inquiry_email','writing_request_email']],
 ['reading.correction','Corregir una afirmación con datos de una fuente','evidence',['writing_correct_claim']],
 ['reading.instructions','Dar instrucciones que otra persona pueda seguir','steps',['writing_clear_instructions','writing_rewrite_instructions']],
 ['reading.directions','Explicar un recorrido','steps',['writing_directions']],
 ['reading.notice','Comunicar un cambio a quienes afecta','messageParts',['writing_public_notice','writing_practical_message']],
 ['reading.evidence_caption','Explicar un dato de un gráfico o tabla','evidence',['writing_caption_evidence']],
 ['reading.fact_opinion','Separar hechos, inferencias y opiniones','evidence',['writing_fact_inference_opinion']],
 ['reading.recommendation','Justificar una recomendación con datos','conditions',['writing_recommendation']],
 ['reading.compare_sources','Relacionar dos fuentes sin confundir sus alcances','sources',['writing_compare_sources','writing_text_síntesis de fuentes']],
 ['reading.advert','Reescribir un anuncio sin afirmaciones no justificadas','evidence',['writing_rewrite_advert']],
 ['math.add','Calcular cantidades que se juntan','operands',['math_cálculo','variant_division_0']],
 ['math.subtract','Calcular lo que queda o falta','operands',['variant_division_1']],
 ['math.equal_groups','Calcular grupos iguales','groupSize',['math_grupos','variant_division_2']],
 ['math.sequence','Reconocer una regularidad para continuarla','patternRules',['math_series','variant_division_3']],
 ['math.time','Organizar una actividad con horas y duración','temporalRelations',['variant_division_4']],
 ['math.share','Repartir cantidades por igual','groupSize',['math_reparto','variant_division_5']],
 ['math.missing_value','Encontrar un dato numérico que falta','operations',['math_completar']],
 ['math.data','Interpretar cantidades de una tabla','conditions',['math_datos']],
 ['math.equations','Encontrar una cantidad desconocida a partir de relaciones','operations',['math_ecuaciones']],
 ['math.percent','Interpretar descuentos y porcentajes','operations',['math_porcentajes']],
 ['math.average','Interpretar un valor medio en datos cotidianos','dataPoints',['math_media']],
 ['math.probability','Comparar posibilidades sin asegurar resultados','sampleSpace',['math_probabilidad']],
 ['math.proportion','Ajustar cantidades manteniendo una relación','operations',['math_proporción']],
 ['math.area','Calcular la superficie necesaria','operations',['math_superficie','rectangle_triangle']],
 ['geometry.angle','Interpretar giros y ángulos','spatialRelations',['angles']],
 ['geometry.position','Orientarse en un plano','spatialRelations',['map_position']],
 ['geometry.measure','Relacionar magnitudes geométricas','operations',['square_cube']],
 ['attention.exact_match','Comprobar que un dato coincide exactamente','distractorSimilarity',['exact_match','code','att_exact_code','att_compare_rows']],
 ['attention.position','Localizar información por su posición','positions',['position','att_position','att_grid_location']],
 ['attention.count','Contar solo los objetivos indicados','distractors',['target_count','state_count','scan','att_target_count','att_letter_scan','att_symbol_frequency']],
 ['attention.conditions','Seleccionar un dato que cumple condiciones','simultaneousRules',['table_rules','att_double_rule','att_filter_rule','att_table_cross']],
 ['attention.relevance','Descartar información que no ayuda al objetivo','distractors',['att_relevant_info','att_odd_one','attention_plan_intruder']],
 ['attention.omission','Detectar qué falta al comparar dos listas','elements',['attention_plan_omission','att_compare_lists']],
 ['attention.document_lookup','Buscar datos concretos en documentos','conditions',['att_schedule','att_offer_lookup','att_ticket_lookup','att_line_departure']],
 ['attention.visual_changes','Detectar cambios entre dos escenas','changes',['attention_photo_differences']],
 ['attention.instructions','Aplicar una instrucción al seleccionar información','simultaneousRules',['att_instruction']],
 ['executive.plan','Ordenar acciones que dependen unas de otras','dependencies',['executive_planning','executive_dependencies','executive_complete_plan','document_executive_plan']],
 ['executive.supervise','Detectar y corregir errores en un plan','conditions',['executive_supervision','executive_review_all','document_executive_audit']],
 ['executive.resume','Continuar una tarea desde el punto pendiente','completedSteps',['executive_resume_plan']],
 ['executive.conditions','Tomar una decisión que cumpla varias condiciones','simultaneousRules',['executive_criteria','executive_verification']],
 ['executive.resources','Elegir recursos suficientes dentro de un límite','conditions',['executive_resources']],
 ['executive.time','Planificar sin superar el tiempo disponible','conditions',['executive_time_budget']],
 ['executive.update','Revisar una decisión cuando cambia una condición','updatedRules',['executive_goal_change']],
 ['executive.reason','Deducir una relación a partir de información disponible','inference',['executive_reasoning']],
 ['memory.serial','Recordar el orden de una secuencia','elements',['memory_sequence','memory_plan_recall']],
 ['memory.spatial','Recordar dónde estaba un elemento','positions',['memory_spatial']],
 ['memory.recognition','Reconocer elementos que se han mostrado','elements',['memory_recognition']],
 ['memory.route','Recordar un recorrido por sus paradas','steps',['memory_route']],
 ['memory.association','Recordar qué elemento iba con cada persona o lugar','pairs',['memory_association']],
 ['memory.scene','Recordar detalles de una escena','independentDetails',['memory_scene','memory_photo']],
 ['memory.reverse','Recordar una secuencia y reconstruirla al revés','elements',[]],
 ['memory.recent','Conservar solo la parte reciente de una secuencia','elements',['memory_recent']],
 ['memory.selective','Recordar solo los elementos de la categoría pedida','distractors',['memory_category']],
 ['speed.compare','Comprobar con agilidad si dos estímulos coinciden','distractorSimilarity',[]],
 ['speed.category','Decidir si varios estímulos pertenecen a una categoría','elements',['speed_category']],
 ['speed.key','Aplicar una clave visible para responder','keyEntries',['speed_key']],
 ['speed.match','Reconocer un modelo entre alternativas','distractorSimilarity',['speed_match']],
 ['speed.search','Localizar un objetivo entre distractores','distractors',['speed_search']],
 ['speed.pairs','Comparar varias parejas y localizar una discrepancia','pairs',['speed_pairs']],
 ['speed.flanker','Responder al objetivo central ignorando distractores','distractors',['speed_flanker']],
 ['speed.translation','Transformar una secuencia usando una clave','steps',['speed_translation']],
 ['speed.crossed_keys','Encadenar dos consultas de claves','steps',['speed_crossed_keys']],
 ['speed.agenda','Cruzar condiciones de una agenda','simultaneousRules',['speed_rapid_agenda']],
 ['speed.rule','Aplicar el criterio activo sin confundirlo con otro','simultaneousRules',['speed_rule_choice']],
 ['english.sequence','Seguir pasos de una instrucción en inglés','steps',[]],
 ['english.vocabulary','Comprender vocabulario en un mensaje en inglés','sourceDetails',['vocabulary','variant_english_0']],
 ['english.grammar','Elegir una forma verbal coherente con la situación','grammaticalRelations',['verb_time','variant_english_1']],
 ['english.time','Interpretar horas y duración en un mensaje en inglés','temporalRelations',['variant_english_2']],
 ['english.inference','Relacionar pistas de un mensaje en inglés','inference',['variant_english_3']],
 ['english.intent','Comprender qué pide una persona en inglés','messageParts',['variant_english_4']],
 ['english.connector','Relacionar ideas con conectores en inglés','logicalRelations',['connector','variant_english_5']],
 ['english.location','Localizar un dato espacial en un mensaje en inglés','positions',['location']],
 ['english.evidence','Comprobar una afirmación frente a un texto en inglés','evidence',['sample_claim']],
 ['social.literal','Identificar qué ocurre antes de interpretar una situación','sourceDetails',[]],
 ['social.intent','Interpretar una intención a partir de pistas','inference',['soc_intention','soc_inference','soc_pragmatics']],
 ['social.perspective','Distinguir lo que sabe cada persona','perspectives',['soc_perspective']],
 ['social.emotion','Reconocer pistas sobre una emoción sin diagnosticar','inference',['soc_emotion','soc_empathy']],
 ['social.boundary','Respetar decisiones y límites de otras personas','conditions',['soc_boundary']],
 ['social.repair','Reparar un malentendido con un mensaje concreto','messageParts',['soc_apology','soc_repair']],
 ['social.cooperation','Coordinar acciones o turnos con otras personas','perspectives',['soc_group_choice','soc_shared_attention','soc_turn_taking']],
 ['social.help','Pedir ayuda indicando qué se necesita','messageParts',['soc_help_request']],
 ['social.context','Ajustar un mensaje a su contexto y destinatario','perspectives',['soc_context','soc_social_rule']],
 ['social.impact','Considerar las consecuencias de una acción para otra persona','perspectives',['soc_impact','soc_conflict']],
 ['social.nonliteral','Interpretar una expresión no literal usando el contexto','inference',['soc_literal_nonliteral']]
];
for(const args of definitions)define(...args);
for(const args of [['math.count','Relacionar una cantidad con su número','elements'],['math.compare','Comparar cantidades para decidir','quantities'],['math.money','Distinguir número de monedas y valor representado','denominations'],['math.measure','Interpretar una medida con su unidad','units'],['math.order','Ordenar cantidades en una recta numérica','elements'],['geometry.symmetry','Reconocer una reflexión conservando las distancias','spatialRelations'],['geometry.perimeter','Calcular el borde necesario para rodear un espacio','operations'],['geometry.properties','Clasificar figuras por sus propiedades','criteria'],['geometry.faces','Relacionar una figura plana con un cuerpo','spatialRelations'],['reading.chronology','Reconstruir el orden de hechos de un mensaje','steps'],['reading.follow_instruction','Aplicar una indicación escrita a una situación','conditions']])define(...args);
const norm=s=>String(s||'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
function family(it,domain){
 if(it.qualityDescriptor?.semanticFamily&&registry[it.qualityDescriptor.semanticFamily])return it.qualityDescriptor.semanticFamily;
 const m=it.mechanic||'',q=norm(it.memoryQuestion||it.q||'');
 if(/(?:^|_)spelling_[012]$/.test(m))return 'language.spelling';
 if(!m&&it.ageProfile){const x=it.ageProfile.mechanic;
  if(domain==='division'&&it.quantityEvidence?.op==='between')return 'math.sequence';
  if(domain==='attention')return ({matching:'attention.exact_match',search:'attention.count',oddOne:'attention.relevance',findPlace:'attention.position'})[x]||'unclassified';
  if(domain==='language'){const n=Number((it.ageProfile.family||'').split('-').at(-1));return ({0:'language.context_meaning',1:'language.classification',2:'language.opposites',3:'reading.literal',4:'language.context_meaning',5:'language.spelling',6:'language.spelling',7:'language.phonology',8:'language.agreement',9:'language.structure'})[n]||'unclassified';}
  if(domain==='division')return ({count:'math.count',addition:'math.add',subtraction:'math.subtract',compare:'math.compare'})[x]||'unclassified';}
 if(m.startsWith('speed_compare_'))return 'speed.compare';
 if(m==='memory_sequence'&&it.recallEvidence?.reverse)return 'memory.reverse';
 if(m==='memory_sequence'&&it.recallEvidence?.takeLast)return 'memory.recent';
 if(m.startsWith('document_attention_'))return 'attention.document_lookup';
 if(/^document_(reading|literacy|middleReading)_/.test(m))return ['reading.document_purpose','reading.document_relations','reading.document_evidence'][Math.max(0,Math.min(2,(it.level||1)-1))];
 if(m.startsWith('executive_reasoning_'))return 'executive.reason';
 if(m.startsWith('writing_text_'))return m.includes('síntesis')?'reading.compare_sources':m.includes('consulta')?'reading.request':'reading.recommendation';
 if(/^writing_[012]$/.test(m))return ['reading.summary','reading.request','reading.instructions'][Number(m.at(-1))];
 if(m.startsWith('social_perspective_')){
  const source=norm(JSON.stringify(it.stimulus||[]));
  if(/^(?:quien|donde|que ha dibujado|que estan recogiendo|que objeto|que lleva|que esta haciendo)/.test(q))return 'social.literal';
  if(/quiere decir|que intenta|intencion|que puede significar/.test(q))return 'social.intent';
  if(/sabe|punto de vista|perspectiva|cree/.test(q))return 'social.perspective';
  if(/siente|sentir|emocion/.test(q))return 'social.emotion';
  if(/ahora no|permiso|decide|no quiere|privad|sin preguntar/.test(source))return 'social.boundary';
  if(/siento|perdon|molest|malentendido/.test(source+' '+q))return 'social.repair';
  if(/ayuda|pedir|preguntar/.test(q))return 'social.help';
  if(/turno|acordar|reparto|juntos|coordinar/.test(q))return 'social.cooperation';
  return 'social.context';
 }
 return aliasesMap[m]||'unclassified';
}
function scenario(it){
 if(it.qualityDescriptor?.scenarioFamily)return it.qualityDescriptor.scenarioFamily;
 const text=norm([it.topic,it.q,it.scenario,it.text,JSON.stringify(it.stimulus||[])].join(' '));
 for(const [id,re] of [['transport',/vuelo|embarque|aeropuerto|autobus|tren|trayecto/],['shopping',/compra|precio|ticket|factura|tienda|catalogo|pedido/],['school',/clase|aula|colegio|recreo|cuaderno|estuche|escolar/],['digital_communication',/mensaje|correo|video|pantalla|chat|publicacion/],['sports_leisure',/partido|balon|deporte|cine|taller|juego|museo/],['home_routines',/casa|cocina|merienda|mochila|habitacion/],['community',/biblioteca|parque|plaza|oficina/],['nature',/arbol|planta|animal|bosque|lago/]])if(re.test(text))return id;
 return 'abstract_pattern';
}
function describe(it,age,domain=it.domain){
 const semanticFamily=family(it,domain),entry=registry[semanticFamily],blocks=it.stimulus||[];
 const stimulusType=[...new Set(blocks.map(b=>b.type))].sort().join('+')||it.type||'legacy';
 const text=blocks.filter(b=>b.type==='text').map(b=>b.text).join(' ');
 return {mechanic:it.mechanic||it.ageProfile?.mechanic||it.type||'unknown',semanticFamily,scenarioFamily:scenario(it),stimulusType,
  functionalPurpose:entry?.functionalPurpose||null,
  difficultyProfile:{level:Number(it.level)||1,age,primaryDimension:entry?.difficultyDimension||'unreviewed',elements:it.memoryContent?.length||blocks.reduce((n,b)=>n+(b.items?.length||b.rows?.length||0),0),steps:it.answer?.length||0,sourceWords:norm(text).split(' ').filter(Boolean).length,requiresInference:entry?.difficultyDimension==='inference',timed:it.speedTask===true,exposureMs:it.revealMs||null,distractors:Math.max(0,(it.opts?.length||1)-1),transformation:it.recallEvidence?.reverse?'reverse':it.recallEvidence?.takeLast?'recent':it.selectiveRecall?'selective':null},
  taxonomyVersion:1};
}
function annotate(it,age,domain){return it?{...it,...describe(it,age,domain)}:it;}
function templateKey(it,age,domain){const d=describe(it,age,domain);return [domain,d.semanticFamily,it.type,it.responseType||'',d.stimulusType].join('|');}
function nearDuplicateKey(it){return norm([it.q,it.memoryQuestion,it.scenario,JSON.stringify(it.stimulus||[])].join(' ')).replace(/\b(?:ana|leo|mar|nora|pau|dani|lola|hugo|roja|rojo|azul|verde|amarilla|amarillo|morada|morado)\b/g,'elemento').replace(/\b\d+\b/g,'#');}
function issues(it,age,domain){
 const d=describe(it,age,domain),out=[];if(!d.functionalPurpose)out.push('unclassified-purpose');
 const opts=(it.opts||[]).map(x=>String(x).normalize('NFKC').trim().replace(/\s+/g,' ')).map(x=>it.optionContrast==='case'||/mayúscula/iu.test(it.q||'')?x:x.toLocaleLowerCase('es'));if(opts.length!==new Set(opts).size)out.push('duplicate-options');
 if(it.a!==undefined&&it.opts&&!it.opts.includes(it.a))out.push('answer-not-in-options');
 if(![1,2,3].includes(it.level))out.push('invalid-level');
 if(age==='early'&&/hipoteca|factura|embarque|presupuesto anual/i.test(JSON.stringify(it.stimulus||[])))out.push('adult-context-review');
 if(!['language','reading','literacy','middleReading','middleLanguage','teenLanguage','english'].includes(domain)&&d.difficultyProfile.sourceWords>({early:35,junior:65,primary:100,middle:150,teen:180}[age]||100))out.push('secondary-reading-load-review');
 return out;
}
const api={register:define,registry,describe,annotate,family,scenario,templateKey,nearDuplicateKey,issues};root.ContentQuality=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

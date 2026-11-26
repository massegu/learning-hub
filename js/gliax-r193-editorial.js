(function (root) {
  'use strict';
  const {fingerprint,shuffled,outcome} = typeof module !== 'undefined' ? require('./gliax-r192') : root.GliaxR192;
  const extended=typeof module!=='undefined'?require('./gliax-r193-editorial-executive'):root.GliaxR193EditorialExecutive;
  const plans=typeof module!=='undefined'?require('./gliax-r193-editorial-plans'):root.GliaxR193EditorialPlans;
  const cases = [
    {
      id:'EC193-01', ageBand:'early', level:1, mechanism:'one-way-rule', context:'library-door',
      prompt:'La puerta está abierta. ¿Puede estar el cartel azul?',
      rows:['Si cierran la puerta, ponen el cartel azul.','Hoy la puerta está abierta y el cartel es azul.'],
      facts:{kind:'conditional',conditionHolds:false,requiredColor:'blue',observedColor:'blue'},
      compatible:'Sí. La regla dice qué hacer al cerrar.', conflicting:'No. El azul es solo para cuando se cierra.', unknown:'No se sabe de qué color es el cartel.',
      feedback:'La regla pide azul al cerrar. Deja sin decidir el color cuando la puerta está abierta.'
    },
    {
      id:'EC193-02', ageBand:'junior', level:2, mechanism:'joint-availability', context:'reading-group',
      prompt:'Los tres deben reunirse el mismo día. ¿Hay uno que sirva a todos?',
      rows:['Noa puede el lunes o el martes.','Leo puede el martes o el jueves.','Inés puede el lunes o el jueves.'],
      facts:{kind:'sets',available:[['lun','mar'],['mar','jue'],['lun','jue']]},
      compatible:'Sí, uno de los días sirve a los tres.', conflicting:'No, ninguno de los días sirve a los tres.', unknown:'Hace falta saber si los tres van al mismo grupo.',
      feedback:'Cada día le sirve a dos personas. El requisito pide un día común a las tres.'
    },
    {
      id:'EC193-03', ageBand:'primary', level:2, mechanism:'shared-boundary', context:'workshop-temperature',
      prompt:'La sala debe cumplir ambos márgenes a la vez. ¿Pueden cumplirse?',
      rows:['Para secar el trabajo, la sala debe estar entre 18 y 20 grados, incluidos ambos límites.','Para conservar el papel, la sala debe estar entre 20 y 22 grados, incluidos ambos límites.'],
      facts:{kind:'interval',ranges:[[18,20],[20,22]]},
      compatible:'Sí, hay una temperatura válida para ambos.', conflicting:'No, los márgenes no comparten valores.', unknown:'Falta saber si los límites se incluyen.',
      feedback:'El límite de 20 grados pertenece a ambos márgenes. Ninguna otra temperatura los reúne.'
    },
    {
      id:'EC193-04', ageBand:'middle', level:2, mechanism:'cycle-in-dependencies', context:'publish-magazine',
      prompt:'¿Existe un orden que cumpla las tres instrucciones de publicación?',
      rows:['Revisar el texto antes de maquetar.','Maquetar antes de publicar.','Publicar antes de revisar el texto.'],
      facts:{kind:'precedence',edges:[['review','layout'],['layout','publish'],['publish','review']]},
      compatible:'Sí, basta con empezar por la revisión.', conflicting:'No, cada paso depende indirectamente de sí mismo.', unknown:'Sin conocer la duración, no se puede decidir.',
      feedback:'La revisión debe preceder a la publicación. La última instrucción exige el orden contrario.'
    },
    {
      id:'EC193-05', ageBand:'teen', level:3, mechanism:'invariant-parity', context:'tournament-registration',
      prompt:'¿Es compatible la afirmación final con los tres cambios registrados?',
      rows:['El número de inscritos antes de los cambios era impar.','Se añadieron dos inscripciones, se retiraron tres y se añadieron otras cuatro.','El informe final afirma que el número de inscritos sigue siendo impar.'],
      facts:{kind:'parity',initial:1,changes:[2,-3,4],claimed:1},
      compatible:'Sí, el número conserva la paridad inicial.', conflicting:'No, la paridad final debe ser par.', unknown:'Sin el número inicial exacto no se puede decidir.',
      feedback:'Añadir dos o cuatro mantiene la paridad. Quitar tres la cambia. El resultado es par.'
    }
  ];
  const byId = new Map(cases.map(entry=>[entry.id,entry]));

  function agrees(facts) {
    if (facts.kind==='conditional') return !facts.conditionHolds || facts.requiredColor===facts.observedColor;
    if (facts.kind==='sets') return facts.available[0].some(value=>facts.available.every(set=>set.includes(value)));
    if (facts.kind==='interval') return Math.max(...facts.ranges.map(([lower])=>lower))<=Math.min(...facts.ranges.map(([,upper])=>upper));
    if (facts.kind==='parity') return Math.abs(facts.initial+facts.changes.reduce((sum,value)=>sum+value,0))%2===facts.claimed;
    const remaining = new Set(facts.edges.flat());
    while (remaining.size) {
      const first = [...remaining].find(step=>!facts.edges.some(([before,after])=>remaining.has(before)&&after===step));
      if (!first) return false;
      remaining.delete(first);
    }
    return true;
  }

  function get(id, seed) {
    const entry=byId.get(id);
    if (!entry) return plans.get(id,seed) ?? extended.get(id,seed);
    const {ageBand,level,mechanism,context,prompt,rows,facts,feedback} = entry;
    const sources=rows.map((text,index)=>({id:'source-'+(index+1),text}));
    const options=[
      {id:'compatible',label:entry.compatible},{id:'conflicting',label:entry.conflicting},{id:'unknown',label:entry.unknown}
    ];
    const presentation={prompt,rows:shuffled(sources,seed,id+'-sources'),
      options:shuffled(options,seed,id+'-options'),evidenceRequired:level>1,feedback};
    return {id,ageBand,level,mechanic:mechanism,mechanismContext:context,construct:'consistencyChecking',
      family:'EC',contentVersion:'r19.3-editorial-1',gradingVersion:'r19.3-editorial-1',editorial:true,presentation,
      cognitiveFingerprint:fingerprint(['EC',mechanism,facts.kind,facts.kind==='sets'?facts.available.length:sources.length]),
      surfaceFingerprint:fingerprint(presentation),
      answerModel:{mode:'source_relation',facts:structuredClone(facts),evidenceIds:sources.map(row=>row.id)}};
  }

  function grade(item,response) {
    if (item.planEditorial) return plans.grade(item,response);
    if (item.family!=='EC') return extended.grade(item,response);
    const {facts,evidenceIds}=item.answerModel;
    if (response?.choice!==(agrees(facts)?'compatible':'conflicting')) return outcome('incorrect');
    const evidence = response.evidence;
    const exact = Array.isArray(evidence) && evidence.length===evidenceIds.length &&
      evidenceIds.every(id=>evidence.includes(id));
    return outcome(item.presentation.evidenceRequired&&!exact?'partial':'correct');
  }
  const ids=()=>[...byId.keys(),...extended.ids(),...plans.ids()];
  const pool=({family,ageBand,level,seed})=>family==='EC'
    ? cases.filter(entry=>entry.ageBand===ageBand&&entry.level===level).map(entry=>get(entry.id,seed)) : [...extended.pool({family,ageBand,level,seed}),...plans.pool({family,ageBand,level,seed})];
  const api={ids,pool,get,grade};
  root.GliaxR193Editorial=api;
  if (typeof module!=='undefined') module.exports=api;
})(globalThis);

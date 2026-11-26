(function (root) {
  'use strict';
  const core=typeof module!=='undefined'?require('./gliax-r192'):root.GliaxR192;
  const ar=typeof module!=='undefined'?require('./gliax-r192-ar'):root.GliaxR192AR;
  const {fingerprint,shuffled,outcome}=core;
  const scenarios=[
    {id:'CP193-01',family:'CP',ageBand:'junior',level:2,mechanic:'retain-unaffected-assignment',
     context:'school-radio',prompt:'La editora de sonido falta. ¿Qué plan conserva todas las tareas necesarias?',
     sources:['La entrevista la hace Ada.','Ivo la presenta y no puede editar mientras presenta.','Sol puede editar en el turno libre.'],
     alternatives:[
       ['Ada entrevista, Ivo presenta y Sol edita.',{interview:'Ada',presenter:'Ivo',editor:'Sol'}],
       ['Ada entrevista, Ivo presenta e Ivo edita.',{interview:'Ada',presenter:'Ivo',editor:'Ivo'}],
       ['Sol entrevista, Ivo presenta y Ada edita.',{interview:'Sol',presenter:'Ivo',editor:'Ada'}]
     ],valid:plan=>plan.interview==='Ada'&&plan.presenter==='Ivo'&&plan.editor==='Sol',
     feedback:'La sustitución cubre la edición sin ocupar a Ivo ni cambiar quién hace la entrevista.'},
    {id:'PL193-01',family:'planning',ageBand:'early',level:2,mechanic:'parallel-steps-before-join',
     context:'table-for-painting',prompt:'¿Qué orden prepara la mesa para pintar?',
     sources:['Pon el papel y busca un vaso.','Echa el agua solo cuando haya papel y vaso.'],
     alternatives:[
       ['Papel, vaso, agua.', ['paper','cup','water']],
       ['Vaso, papel, agua.', ['cup','paper','water']],
       ['Papel, agua, vaso.', ['paper','water','cup']]
     ],valid:steps=>steps.indexOf('water')>steps.indexOf('paper')&&steps.indexOf('water')>steps.indexOf('cup'),
     feedback:'Papel y vaso se pueden preparar en cualquier orden. El agua va después de los dos.'},
    {id:'RT193-01',family:'constraints',ageBand:'teen',level:3,mechanic:'joint-load-and-cost',
     context:'equipment-transport',prompt:'¿Qué combinación puede llevar las dos piezas en un viaje?',
     sources:['Tienes 48 € y puedes transportar hasta 8 kg.','La base pesa 3 kg y cuesta 18 €. Elige una batería.','Batería A: 4 kg y 30 €. B: 6 kg y 20 €. C: 3 kg y 32 €.'],
     alternatives:[
       ['Base y batería A.', [4,30]],['Base y batería B.',[6,20]],['Base y batería C.',[3,32]]
     ],valid:([kg,cost])=>kg+3<=8&&cost+18<=48,
     feedback:'La base con A pesa 7 kg y cuesta 48 €. B supera la carga y C supera el precio.'},
    {id:'CO193-01',family:'goal-change',ageBand:'junior',level:2,mechanic:'replace-goal-retain-fixed-slot',
     context:'poster-audio',prompt:'¿Qué haces ahora que cambió el encargo?',
     sources:['Quedan dos turnos. El último es para entregar.','Ibas a colorear el cartel, pero ahora piden un audio.','El micrófono solo está libre en el primer turno.'],
     alternatives:[
       ['Grabar el audio y luego entregarlo.', ['record','submit']],
       ['Colorear el cartel y luego entregarlo.', ['color','submit']],
       ['Entregar el cartel y después grabar el audio.', ['submit','record']]
     ],valid:steps=>steps[0]==='record'&&steps[1]==='submit',
     feedback:'El objetivo es entregar el audio. Se graba cuando está libre el micrófono y se conserva el turno de entrega.'},
    {id:'SU193-01',family:'supervision',ageBand:'primary',level:3,mechanic:'audit-dependent-approval',
     context:'newsletter-proof',prompt:'¿Qué debes corregir para que el plan pueda aprobarse?',
     sources:['Primero revisa el texto. La firma va antes de enviar.','La propuesta dice: revisar, enviar y firmar.','El archivo ya tiene el formato pedido.'],
     alternatives:[
       ['Firmar después de revisar y antes de enviar.', ['review','sign','send']],
       ['Firmar después de enviar y quitar la revisión.', ['send','sign']],
       ['Revisar dos veces y enviar sin firmar.', ['review','review','send']]
     ],valid:steps=>steps.includes('sign')&&steps.indexOf('review')===0&&steps.indexOf('sign')<steps.indexOf('send'),
     feedback:'Faltaba obtener la firma antes del envío. La revisión y el formato se mantienen.'}
  ];
  const info={
    id:'IN193-01',family:'IN',ageBand:'primary',level:2,mechanic:'match-package-to-available-opening',
    context:'delivery-slot',prompt:'El bulto mide 40 cm de ancho. El mostrador está libre y te dejan una bandeja. ¿Qué dato necesitas para saber si cabe por la abertura?',
    hint:'Distingue el ancho del bulto de la medida que falta para compararlo.',
    feedback:'Hay que conocer el ancho de la abertura. La disponibilidad del mostrador no indica esa medida.'
  };
  const rules={
    id:'AR193-01',family:'AR',ageBand:'middle',level:1,mechanic:'two-switches-restore-active-rule',
    context:'shape-and-color',prompt:'Empieza por la forma: círculo A, cuadrado B. Con la señal Color, usa rojo A y azul B. Con la señal Forma, vuelve a la primera regla.',
    feedback:'La última señal recupera la regla inicial. Las señales indican el cambio y no se puntúan.'
  };
  const rowsById=new Map([...scenarios,info,rules].map(entry=>[entry.id,entry]));
  function common(entry,presentation,answerModel){
    return {id:entry.id,family:entry.family,ageBand:entry.ageBand,level:entry.level,mechanic:entry.mechanic,
      construct:entry.mechanic,mechanismContext:entry.context,editorial:true,
      contentVersion:'r19.3-editorial-1',gradingVersion:'r19.3-editorial-1',
      cognitiveFingerprint:fingerprint([entry.family,entry.mechanic,answerModel.mode]),
      surfaceFingerprint:fingerprint(presentation),presentation,answerModel};
  }
  function get(id,seed){
    const entry=rowsById.get(id);
    if(!entry)throw new RangeError('Unknown executive editorial case');
    const {prompt,feedback}=entry;
    if(entry===info)return common(entry,{prompt,feedback,hint:info.hint},{mode:'open_concepts'});
    if(entry===rules){
      const stimuli=[{form:'círculo',color:'azul'},{form:'cuadrado',color:'rojo'},{cue:'color'},
        {form:'círculo',color:'azul'},{form:'cuadrado',color:'rojo'},{cue:'form'},
        {form:'círculo',color:'azul'},{form:'cuadrado',color:'rojo'}];
      const events=stimuli.map((stimulus,index)=>stimulus.cue?
        {id:'event-'+(index+1),type:'signal',label:stimulus.cue==='color'?'Color':'Forma'}:
        {id:'event-'+(index+1),type:'trial',stimulus,label:stimulus.form+' '+stimulus.color});
      const rule={initial:'form',maps:{form:{círculo:'A',cuadrado:'B'},color:{rojo:'A',azul:'B'}}};
      return common(entry,{prompt,feedback,events},{mode:'trial_state_machine',rule,stimuli,measuresWithholding:false});
    }
    const rows=entry.sources.map((text,index)=>({id:'source-'+index,text}));
    const options=entry.alternatives.map(([label],index)=>({id:String(index),label}));
    return common(entry,{prompt,feedback,rows,options:shuffled(options,seed,id+'-options'),evidenceRequired:false},
      {mode:'constraint_solver'});
  }
  function grade(item,response){
    const entry=rowsById.get(item.id);
    if(entry===rules)return ar.gradeRuleAction(item,response);
    if(entry===info){
      const clean=String(response??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();
      if(!clean)return outcome('no_response');
      if(/^(?:el )?(?:ancho|anchura) (?:de (?:la )?|del )(?:abertura|hueco|paso)(?: por donde pasa)?$/.test(clean))return outcome('correct');
      if(/^(?:el )?(?:tamano|medida|medidas) (?:de (?:la )?|del )(?:abertura|hueco|paso)$/.test(clean))return outcome('partial');
      if(/^(?:el )?(?:peso del bulto|precio|horario del mostrador)$/.test(clean))return outcome('incorrect');
      return outcome('uninterpretable');
    }
    const selected=/^[0-2]$/.test(response?.choice)?entry.alternatives[Number(response.choice)]?.[1]:null;
    return outcome(selected&&entry.valid(selected)?'correct':'incorrect');
  }
  const ids=()=>[...rowsById.keys()];
  const pool=({family,ageBand,level,seed})=>[...rowsById.values()].filter(x=>x.family===family&&x.ageBand===ageBand&&x.level===level).map(x=>get(x.id,seed));
  const api={get,grade,ids,pool};
  root.GliaxR193EditorialExecutive=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);

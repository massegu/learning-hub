(function(root){
  'use strict';
  const {fingerprint,outcome}=typeof module!=='undefined'?require('./gliax-r192'):root.GliaxR192;
  const forms={circle:'círculo',square:'cuadrado'};
  const colors={red:'rojo',blue:'azul'};
  const cueText={
    color:'Color: cambia a la regla de color', form:'Forma: vuelve a la regla de forma',
    colorOnce:'Color solo en la próxima figura', colorTwice:'Color en las dos próximas figuras',
    formOnce:'Forma solo en la próxima figura', invert:'Intercambia A y B hasta otro cambio',
    invertOnce:'Intercambia A y B solo en la próxima figura',
    invertColor:'Intercambia A y B para la regla de color',
    vetoOn:'Si hay borde, espera', vetoOff:'El borde deja de pedir espera',
    gate:'Si la última figura fue un círculo, cambia a color',
    returnOnce:'Usa una vez la regla que tenías antes del último cambio',
    clearInvert:'Vuelve a A y B sin intercambiarlas'
  };
  const tags=[
    ['junior',1,'immediate-return','forma-temporal', 'Empieza por Forma. La señal Color solo vale para la próxima figura. Después vuelve a Forma.',
      ['cb','colorOnce','cb','cb','sr','colorOnce','sr','sr']],
    ['junior',2,'bounded-count','color-dos-figuras','Empieza por Forma. La señal Color vale durante dos figuras. Después vuelve a Forma.',
      ['cb','colorTwice','cb','sr','cb','colorTwice','sr','cb','sr']],
    ['junior',3,'exception-one-trial','respuesta-opuesta-una-vez','Usa Forma. Cuando aparezca la señal de intercambio, cambia A por B y B por A durante una sola figura.',
      ['cr','sb','invertOnce','cr','cr','sb','invertOnce','sb','sb']],
    ['primary',1,'removable-veto','borde-aparece','Usa Forma. Cuando la señal diga que el borde pide espera, continúa sin marcar las figuras con borde. Otra señal quitará esa excepción.',
      ['crb','vetoOn','crb','sb','vetoOff','crb','sb']],
    ['primary',2,'temporary-in-persistent','retorno-a-color','Empieza por Forma. La señal Color cambia la regla. Si aparece Forma solo una vez, usa Forma en la próxima figura y vuelve a Color.',
      ['sr','color','sr','formOnce','sr','sr','cb','formOnce','cb','cb']],
    ['primary',3,'persistent-reset','recuperar-respuesta','Empieza por Forma. El intercambio cambia A y B para las figuras siguientes. La señal de volver a A y B elimina el intercambio.',
      ['cr','invert','cr','sb','invertOnce','cr','clearInvert','cr','sb']],
    ['middle',1,'criterion-local-inversion','respuestas-de-color','Empieza por Forma. La señal de intercambio de color cambia solo las respuestas de Color. Forma sigue igual.',
      ['cb','invertColor','cb','color','cb','sr','form','sr']],
    ['middle',2,'signal-conditional-on-stimulus','recordar-figura-anterior','Empieza por Forma. La señal condicional cambia a Color solo si la figura anterior fue un círculo.',
      ['sr','gate','sr','cb','gate','sr','cb','form','sr']],
    ['middle',3,'last-rule-history','recuperar-criterio-previo','Empieza por Forma. Las señales de Forma y Color fijan la regla. La señal de recuperar usa la regla anterior una sola vez.',
      ['cb','color','cb','returnOnce','cb','cb','form','sr','returnOnce','sr','sr']],
    ['teen',1,'veto-with-mode-switch','borde-y-forma','Empieza por Forma. Cuando el borde pida espera, continúa sin marcar figuras con borde aunque cambie la regla. La señal de quitar la excepción vuelve a permitir responder.',
      ['cb','vetoOn','cbb','color','cbb','cr','vetoOff','cbb','form','cbb']],
    ['teen',2,'temporary-effect-on-stimulus-count','cuenta-figuras-no-senales','Empieza por Forma. Color para dos figuras cuenta solo las figuras. Si entre ellas aparece una señal de intercambio, cambia A y B sin gastar una figura de Color.',
      ['sr','colorTwice','sr','invert','sr','sr','clearInvert','sr']],
    ['teen',3,'competing-exceptions-priority','excepcion-y-respuesta','Empieza por Forma. Si el borde pide espera, esa instrucción prevalece sobre el intercambio. Un intercambio para una figura se gasta aunque esa figura pida esperar.',
      ['cb','vetoOn','invertOnce','cbb','cb','invertOnce','srb','vetoOff','sr','sr']]
  ];
  const entries=new Map(tags.map((tag,index)=>['AR193-B3-'+String(index+1).padStart(2,'0'),tag]));
  function get(id){
    const record=entries.get(id);
    if(!record)return null;
    const [ageBand,level,mechanic,context,instruction,script]=record;
    const events=script.map((value,index)=>{
      const id='event-'+(index+1);
      if(Object.hasOwn(cueText,value))return {id,type:'signal',cue:value,label:cueText[value]};
      const form=value[0]==='c'?forms.circle:forms.square;
      const color=value[1]==='r'?colors.red:colors.blue;
      const border=value.length===3;
      return {id,type:'trial',stimulus:{form,color,border},label:form+' '+color+(border?' con borde':'')};
    });
    const explanation='Forma: círculo A, cuadrado B. Color: rojo A, azul B. '+instruction;
    const presentation={prompt:explanation,events};
    const answerModel={mode:'trial_state_machine',stimuli:events.filter(e=>e.type==='trial').map(e=>e.stimulus),
      rule:{initial:'form',maps:{form:{círculo:'A',cuadrado:'B'},color:{rojo:'A',azul:'B'}}},
      measuresWithholding:script.includes('vetoOn')};
    return {id,ageBand,level,family:'AR',mechanic,mechanismContext:context,construct:'ruleUpdating',
      editorial:true,rulesEditorial:true,presentation,answerModel,contentVersion:'r19.3-editorial-4',
      gradingVersion:'r19.3-editorial-4',cognitiveFingerprint:fingerprint(['AR',mechanic,events.map(e=>e.cue??e.type)]),
      surfaceFingerprint:fingerprint(presentation)};
  }

  function evaluate(item){
    let mode='form',previous='form',last='',remaining=0,temporary='form';
    let invert=false,invertOnce=false,invertColor=false,veto=false;
    const output=[];
    const choose=next=>{if(mode!==next){previous=mode;mode=next;}};
    for(const e of item.presentation.events){
      if(e.type==='signal'){
        switch(e.cue){
          case 'color':case 'form':choose(e.cue);break;
          case 'colorOnce':case 'colorTwice':temporary='color';remaining=e.cue==='colorOnce'?1:2;break;
          case 'formOnce':temporary='form';remaining=1;break;
          case 'returnOnce':temporary=previous;remaining=1;break;
          case 'invert':invert=!invert;break;
          case 'invertOnce':invertOnce=true;break;
          case 'invertColor':invertColor=!invertColor;break;
          case 'clearInvert':invert=false;break;
          case 'vetoOn':veto=true;break;
          case 'vetoOff':veto=false;break;
          case 'gate':if(last===forms.circle)choose('color');break;
        }
        continue;
      }
      const active=remaining?temporary:mode;
      const flipped=Number(invert)+Number(invertOnce)+Number(active==='color'&&invertColor);
      const base=item.answerModel.rule.maps[active][e.stimulus[active]];
      const expected=veto&&e.stimulus.border?'wait':flipped%2?(base==='A'?'B':'A'):base;
      output.push({id:e.id,expected,label:e.label});
      last=e.stimulus.form;
      if(remaining)remaining--;
      invertOnce=false;
    }
    return output;
  }

  function grade(item,response){
    const trials=evaluate(item);
    if(!response||!trials.every(e=>Object.hasOwn(response,e.id)))return outcome('pending_review');
    const missed=trials.filter(e=>(response[e.id]??'wait')!==e.expected);
    const feedback=missed.length?'En '+missed[0].label+' correspondía '+(missed[0].expected==='wait'?'esperar':missed[0].expected)+'.':
      'Aplicaste la regla vigente. Las señales cambiaron la instrucción y quedaron fuera del recuento.';
    return {...outcome(missed.length?'incorrect':'correct'),feedback,metrics:{scored:trials.length,correct:trials.length-missed.length}};
  }

  function pool({family,ageBand,level}){
    return family==='AR'?[...entries].filter(([,entry])=>entry[0]===ageBand&&entry[1]===level).map(([id])=>get(id)):[];
  }
  const api={ids:()=>[...entries.keys()],get,pool,grade,evaluate};
  root.GliaxR193EditorialRules=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);

(function (root) {
  'use strict';
  // R19.4: inductive rule discovery. Never expose the rule during exploration.
  const shapes = [
    ['círculo','cuadrado','●','■'], ['triángulo','círculo','▲','●'],
    ['estrella','cuadrado','★','■'], ['rombo','triángulo','◆','▲'],
    ['corazón','círculo','♥','●'], ['cuadrado','estrella','■','★']
  ];
  const palettes = [
    ['rojo','azul','#e83d65','#3977e8'], ['azul','amarillo','#3977e8','#e5ad12'],
    ['violeta','coral','#8654d9','#f06a50'], ['naranja','azul','#ed8534','#3977e8'],
    ['rosa','violeta','#df4c9f','#8654d9'], ['amarillo','rojo','#e5ad12','#e83d65']
  ];
  const ages = ['early','junior','primary','middle','teen'];
  const neutral = {name:'gris',hex:'#797e91'};
  const glyphs={'círculo':'●','cuadrado':'■','triángulo':'▲','estrella':'★','rombo':'◆','corazón':'♥'};
  function build(age,level,index) {
    if (!ages.includes(age) || ![1,2,3].includes(level) || !Number.isInteger(index) || index<0 || index>5) throw Error('R19.4: parámetros de regla incorrectos');
    const [shapeA,shapeB,iconA,iconB] = shapes[index];
    const [colorA,colorB,hexA,hexB] = palettes[index];
    const stimulus=(shape,color)=>({
      id:shape+'-'+color, shape,color,
      glyph:glyphs[shape],
      hex:color===colorA?hexA:color===colorB?hexB:neutral.hex,
      label:shape+' '+color
    });
    const plus=stimulus(shapeA,colorA), neither=stimulus(shapeB,colorB);
    const shapeOnly=stimulus(shapeA,colorB), colorOnly=stimulus(shapeB,colorA);
    const transfer=level===3
      ? stimulus(Object.keys(glyphs).find(shape=>shape!==shapeA&&shape!==shapeB),colorA)
      : stimulus(shapeA,neutral.name);
    const hypotheses=[
      {id:'shape',label:'Tienen forma de '+shapeA},
      {id:'color',label:'Son de color '+colorA},
      {id:'both',label:'Tienen forma de '+shapeA+' y son de color '+colorA},
      {id:'either',label:'Tienen forma de '+shapeA+' o son de color '+colorA}
    ];
    const correctId=level===1?'shape':level===2?'both':'either';
    const allowed=level===1?['shape','color','both']:level===2?['shape','color','both']:['shape','color','either'];
    const classify=(id,s)=>id==='shape'?s.shape===shapeA:
      id==='color'?s.color===colorA:id==='both'?(s.shape===shapeA&&s.color===colorA):
      (s.shape===shapeA||s.color===colorA);
    const examples=[plus,neither,...(level===1?[shapeOnly,colorOnly]:level===2?[colorOnly,shapeOnly]:[colorOnly,shapeOnly])]
      .map((stimulus,i)=>({id:'example-'+i,stimulus,belongs:classify(correctId,stimulus)}));
    return {
      kind:'ruleDiscovery',correctId,
      hypotheses:hypotheses.filter(h=>allowed.includes(h.id)),
      examples,transfer:{stimulus:transfer,belongs:classify(correctId,transfer)},
      shapeA,colorA,level,ageBand:age,
      answer:[correctId],ordered:true,
      minimumExamples:level===1?3:4,
      version:'r19.4-rule-discovery-1',
      // Cognitive mechanism is intentionally separate from timed rule application.
      cognitiveContract:'inductive_hypothesis_testing'
    };
  }
  function remaining(task,visibleCount) {
    const visible=task.examples.slice(0,visibleCount);
    return task.hypotheses.filter(h=>visible.every(e=>{
      const s=e.stimulus;
      const predicts=h.id==='shape'?s.shape===task.shapeA:
        h.id==='color'?s.color===task.colorA:
        h.id==='both'?s.shape===task.shapeA&&s.color===task.colorA:
        s.shape===task.shapeA||s.color===task.colorA;
      return predicts===e.belongs;
    }));
  }
  function validate(task) {
    if (!task || task.kind!=='ruleDiscovery' || task.hypotheses.length<2 ||
        task.examples.length<3 || task.examples[0].belongs!==true ||
        task.examples[1].belongs!==false || remaining(task,2).length<2 ||
        remaining(task,task.examples.length).length!==1 ||
        remaining(task,task.examples.length)[0].id!==task.correctId ||
        task.examples.some(e=>e.stimulus.label.includes('undefined')) ||
        task.examples.some(e=>e.stimulus.id===task.transfer.stimulus.id)) {
      throw Error('R19.4: la regla no es inferible o se revela antes de tiempo');
    }
    return true;
  }
  function mount(item,{visual,area,onFinish}) {
    const task=item.cognitiveTask;validate(task);
    let stopped=false,finished=false,shown=2,hypothesis=null,firstHypothesis=null,revisions=0,
      transferChoice=null,atTransfer=false,examplesRequested=0;
    const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
    const button=(label,action)=>{const el=node('button',label,'secondary-btn');el.type='button';el.onclick=action;return el;};
    const title=node('p',task.ageBand==='early'?'Mira los dibujos. Piensa por qué algunos van juntos.':'Mira los ejemplos y descubre qué tienen en común.','cognitive-status');
    title.setAttribute('role','status');
    function sample(sample) {
      const row=node('div',undefined,'r194-rule-sample'),glyph=node('span',sample.stimulus.glyph,'r194-rule-glyph');
      glyph.style.color=sample.stimulus.hex;glyph.setAttribute('aria-hidden','true');
      row.append(glyph,node('span',sample.stimulus.label));
      return row;
    }
    function render() {
      if(stopped||finished)return;
      const evidence=node('div',undefined,'r194-rule-evidence');
      const yes=node('section',undefined,'r194-rule-group');
      const no=node('section',undefined,'r194-rule-group');
      yes.append(node('h4','Van en esta caja'));no.append(node('h4','No van en esta caja'));
      task.examples.slice(0,shown).forEach(e=>(e.belongs?yes:no).append(sample(e)));
      evidence.append(yes,no);visual.replaceChildren(title,evidence);
      area.replaceChildren();
      if(task.ageBand==='early'&&root.speechSynthesis&&root.SpeechSynthesisUtterance){
        const speak=button('Escuchar la consigna',()=>{
          root.speechSynthesis.cancel();
          const spoken=!atTransfer
            ? 'Mira los dibujos. Los de una caja van juntos. ¿Qué crees que tienen en común? '+
              task.hypotheses.map(h=>h.label).join('. ')
            : 'Ahora mira el dibujo nuevo. ¿Cumple la regla? Elige sí o no.';
          const utterance=new root.SpeechSynthesisUtterance(spoken);
          utterance.lang='es-ES';utterance.rate=.9;
          root.speechSynthesis.speak(utterance);
        });
        speak.setAttribute('aria-label','Escuchar las instrucciones de este ejercicio');
        area.append(speak);
      }
      if(!atTransfer) {
        area.append(node('p','¿Cuál crees que es la regla?','gliax-instruction'));
        const options=node('div',undefined,'r194-rule-options');
        task.hypotheses.forEach(h=>{
          const choice=button(h.label,()=>{
            if(firstHypothesis===null)firstHypothesis=h.id;
            else if(hypothesis!==h.id)revisions++;
            hypothesis=h.id;render();
          });
          choice.setAttribute('aria-pressed',String(hypothesis===h.id));
          options.append(choice);
        });
        area.append(options);
        const possible=remaining(task,shown);
        if(shown<task.examples.length){
          area.append(button('Ver otro ejemplo',()=>{shown++;examplesRequested++;render();}));
        }
        const check=button('Comprobar mi idea',()=>{
          if(possible.length!==1 || shown<task.minimumExamples){
            title.textContent='Todavía hay varias reglas posibles. Mira otro ejemplo para descubrir cuál encaja.';
            return;
          }
          atTransfer=true;title.textContent='Ahora prueba tu idea con un dibujo nuevo.';render();
        });
        check.disabled=!hypothesis || (possible.length!==1 || shown<task.minimumExamples);
        area.append(check);
      } else {
        const heading=node('p','¿Este dibujo cumple la regla?','gliax-instruction');
        const stimulus=sample({stimulus:task.transfer.stimulus});
        area.append(heading,stimulus);
        const yes=button('Sí',()=>{transferChoice=true;finish();});
        const no=button('No',()=>{transferChoice=false;finish();});
        area.append(yes,no);
      }
    }
    function finish() {
      if(stopped||finished)return;finished=true;
      const ruleCorrect=hypothesis===task.correctId;
      const transferCorrect=transferChoice===task.transfer.belongs;
      const metrics={
        schema:'gliax.exercise-metrics.v1',modality:'rule_discovery',definition_version:1,
        examples_shown:shown,additional_examples:examplesRequested,
        first_hypothesis:firstHypothesis,final_hypothesis:hypothesis,
        hypothesis_revisions:revisions,rule_correct:ruleCorrect,
        transfer_correct:transferCorrect,assistance:'requested_examples'
      };
      visual.append(node('p','Regla: '+task.hypotheses.find(h=>h.id===task.correctId).label+'.','cognitive-status'));
      area.querySelectorAll('button').forEach(el=>el.disabled=true);
      const explanation=ruleCorrect&&transferCorrect
        ?'Has descubierto la regla y la has aplicado a un dibujo nuevo.'
        :'La regla correcta es «'+task.hypotheses.find(h=>h.id===task.correctId).label+'». Revisa los ejemplos para comprobar por qué.';
      onFinish(ruleCorrect&&transferCorrect,explanation,metrics);
    }
    render();
    return ()=>{stopped=true;if(task.ageBand==='early')root.speechSynthesis?.cancel();};
  }
  const api={build,remaining,validate,mount};
  root.GliaxR194RuleDiscovery=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

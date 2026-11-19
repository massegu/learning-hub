(function(root){
'use strict';
function mount(item,{visual,area,onFinish}){
 root.CognitiveFamilies.validate(item);const t=item.cognitiveTask;
 if(t.kind==='falling')return root.FallingWords.mount(item,{visual,area,onFinish});
 const wordMetrics=mode=>({schema:'gliax.exercise-metrics.v1',modality:'word_fit',definition_version:t.accepted?3:2,response_mode:mode,purpose:item.domain==='speedReasoning'?'lexical_selection':'lexical_search'});let stopped=false,finished=false,timer=null,round=0,trialOpen=false,response=[],trialStartedAt=0,ruleStats=[];
 const n=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 const b=(label,fn)=>{const el=n('button',label,'secondary-btn');el.type='button';el.onclick=fn;return el;};
 const status=n('p','','cognitive-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 visual.replaceChildren(status);area.classList.add('cognitive-area');
 const picture=label=>{const el=n('div',undefined,'cognitive-picture');el.innerHTML=root.ActivityModel.visualLabel(label);return el;};
 const later=(fn,ms)=>{clearTimeout(timer);timer=setTimeout(()=>{if(!stopped&&!finished)fn();},ms);};
 function finish(value,metrics=null){if(stopped||finished)return;finished=true;trialOpen=false;clearTimeout(timer);area.querySelectorAll('button,input').forEach(el=>el.disabled=true);const ok=t.kind==='words'&&metrics?.response_mode==='selection'?root.CognitiveFamilies.gradeWordSelection(item,value):root.CognitiveFamilies.grade(item,value);paintAnswers(value);onFinish(ok,ok?(t.kind==='guidedWait'?'Intervalo finalizado.': 'Actividad completada correctamente.'):'Revisa las respuestas correctas, marcadas en verde.',metrics);}
 function paintAnswers(value){
  if(t.kind==='information'||t.kind==='contradiction'){
   const chosen=new Set(value),correct=new Set(t.answer);
   area.querySelectorAll('.cognitive-fact').forEach(label=>{const input=label.querySelector('input');if(!input)return;label.classList.toggle('cognitive-answer-correct',correct.has(input.value));label.classList.toggle('cognitive-answer-incorrect',chosen.has(input.value)&&!correct.has(input.value));});
  }else if(t.kind==='deduction'){
   const target=t.candidates.findIndex(card=>t.answer.includes(card.id)),chosenIndex=t.candidates.findIndex(card=>card.id===value[0]);area.querySelectorAll('.cognitive-candidate').forEach((card,i)=>{card.classList.toggle('cognitive-answer-correct',i===target);card.classList.toggle('cognitive-answer-incorrect',i===chosenIndex&&i!==target);});
  }else if(t.kind==='change'){
   const right=value[0]?.startsWith('replacement:')?t.replacement:t.answer;
   area.querySelectorAll('.cognitive-choices button').forEach(button=>{const correct=Array.isArray(right)?right.includes(button.textContent):button.textContent===right;button.classList.toggle('cognitive-answer-correct',correct);});
  }else if(t.kind==='words'){
   const fields=[...area.querySelectorAll('.cognitive-word-choice')];
   fields.forEach(field=>{const input=field.querySelector('input');const correct=root.CognitiveFamilies.wordFits(input.value,t);field.classList.toggle('cognitive-answer-correct',correct);field.classList.toggle('cognitive-answer-incorrect',input.checked&&!correct);});
   if(!fields.length){const example=n('p','Ejemplo válido: '+t.answer[0]+'.','cognitive-answer-correct');area.append(example);}
  }
 }
 function choices(values,answer){const box=n('div',undefined,'cognitive-choices');values.forEach((label,i)=>{const button=b(label,()=>answer(label,i));button.dataset.answer=label;box.append(button);});area.replaceChildren(box);}
 function selectFacts(){const selected=new Set(),contradiction=t.kind==='contradiction';status.textContent=contradiction?'Compara los dos cuadros. Busca el mismo dato en ambas fuentes y marca los valores que no coinciden.':'Marca solo los datos que necesitas para el objetivo.';const sourceGroups=contradiction?t.sourceDocs?.map(source=>({title:source.title,facts:source.rows.map(row=>({id:row.id,text:row.field+': '+row.value}))})):t.sourceGroups;if(Array.isArray(sourceGroups)){const box=n('div',undefined,'cognitive-source-grid');sourceGroups.forEach(source=>{const card=n('section',undefined,'cognitive-source-card');card.setAttribute('aria-label',source.title);card.append(n('h4',source.title));source.facts.forEach(fact=>{const label=n('label',undefined,'cognitive-fact cognitive-source-fact'),input=n('input'),copy=n('span',undefined,'cognitive-source-copy');input.type='checkbox';input.value=fact.id;input.onchange=()=>input.checked?selected.add(input.value):selected.delete(input.value);copy.append(n('span',fact.text));label.append(input,copy);if(t.factIcons?.[fact.id])label.append(picture(t.factIcons[fact.id]));card.append(label);});box.append(card);});area.replaceChildren(box,b('Comprobar',()=>finish([...selected])));return;}const box=n('div',undefined,'cognitive-facts');t.facts.forEach((fact,i)=>{const label=n('label',undefined,'cognitive-fact'),input=n('input');input.type='checkbox';input.value='f'+i;input.onchange=()=>input.checked?selected.add(input.value):selected.delete(input.value);label.append(input,n('span',fact));if(t.factIcons?.['f'+i])label.append(picture(t.factIcons['f'+i]));box.append(label);});area.replaceChildren(box,b('Comprobar',()=>finish([...selected])));}
 function words(){const constraints=t.constraints,category={acciones:'una acción',animales:'un animal',alimentos:'un alimento',herramientas:'una herramienta'}[constraints.category];
  const clauses=category?['Ser '+category]:[];
  if(constraints.starts)clauses.push('Empezar por la letra '+constraints.starts.toUpperCase());
  if(constraints.contains)clauses.push('Contener la letra '+constraints.contains.toUpperCase());
  if(constraints.excludes)clauses.push('No contener la letra '+constraints.excludes.toUpperCase());
  if(constraints.suffix)clauses.push('Terminar en «'+constraints.suffix+'»');
  if(constraints.minLength)clauses.push('Tener al menos '+constraints.minLength+' letras');
  const list=n('ul',undefined,'cognitive-conditions');
  list.append(...clauses.map(clause=>n('li',clause)));
  if(t.cue)visual.append(n('h4',t.context),n('p',t.cue,'cognitive-conditions'));
  else visual.append(list);
  if(item.domain==='speedReasoning')visual.append(n('p',t.cue?'Identifica lo que se pide y descarta palabras que no cumplan todas las condiciones. La respuesta no se cronometra.':'Comprueba la categoría primero y después las condiciones de las letras. La respuesta no se cronometra.'));
  const selection=root.CognitiveFamilies.wordResponseMode(item)==='selection';
  const form=n('form',undefined,'word-fit-answer'),submit=b(selection?'Comprobar selección':'Comprobar palabra');
  submit.type='submit';
  if(selection){
   status.textContent='Marca todas las palabras que cumplan todas las condiciones.';
   const group=n('fieldset'),legend=n('legend','Palabras disponibles');group.append(legend);
   for(const word of root.CognitiveFamilies.wordChoices(item)){
    const label=n('label',undefined,'cognitive-word-choice'),input=n('input');
    input.type='checkbox';input.value=word;label.append(input,n('span',word));group.append(label);
   }
   form.append(group,submit);
   form.onsubmit=event=>{
    event.preventDefault();
    const selected=[...group.querySelectorAll('input:checked')].map(input=>input.value);
    if(!selected.length){status.textContent='Marca al menos una palabra para comprobar.';return;}
    finish(selected,wordMetrics('selection'));
   };
  }else{
   status.textContent='Escribe una palabra que cumpla todas las condiciones.';
   const label=n('label','Tu palabra'),input=n('input');
   input.type='text';input.autocomplete='off';input.spellcheck=false;input.maxLength=45;input.required=true;input.id='cognitiveWord';label.htmlFor=input.id;
   form.append(label,input,submit);
   form.onsubmit=event=>{
    event.preventDefault();
    const result=root.CognitiveFamilies.productionStatus(item,input.value);
    if(result==='unreviewed'){
     status.textContent='La palabra no está en el vocabulario revisado. Prueba otra. Este intento no se registra.';
     return;
    }
    finish([input.value],wordMetrics('written'));
    input.value='';
   };
  }
  area.replaceChildren(form);
 }
  function deduction(){let clue=0;const notes=n('section',undefined,'cognitive-clues'),list=n('ol'),grid=n('div',undefined,'cognitive-candidates');notes.append(n('h4','Pistas'),list);visual.append(notes);const resolveLast=()=>{if(clue<t.clues.length)return;const available=[...grid.querySelectorAll('.cognitive-candidate:not(.excluded)')];if(available.length===1){const id=available[0].dataset.candidateId;status.textContent='Has llegado a la tarjeta final. Comprobando…';finish([id]);}},next=b('Ver siguiente pista',()=>{if(clue>=t.clues.length)return;list.append(n('li',t.clues[clue++].text));next.disabled=clue===t.clues.length;status.textContent=clue===t.clues.length?'Ya tienes todas las pistas. Tacha las tarjetas que no cumplen.':'Al descartar las tarjetas de esta pista aparecerá la siguiente.';resolveLast();});
  const advanceOnDiscard=()=>{
   const shown=t.clues.slice(0,clue);
   const follows=(card,hint)=>{
    const matches=card.attrs[hint.dimension]===hint.value;
    if(hint.op==='if')return !matches||card.attrs[hint.thenDimension]===hint.thenValue;
    return hint.op==='is'?matches:!matches;
   };
   if(clue<t.clues.length&&t.candidates.every((card,index)=>grid.children[index].classList.contains('excluded')===!shown.every(hint=>follows(card,hint))))next.click();
   else resolveLast();
  };
  t.candidates.forEach((card,i)=>{const cell=n('div',undefined,'cognitive-candidate');cell.dataset.candidateId=card.id;const attrs=n('ul',undefined,'cognitive-attributes'),actions=n('div',undefined,'cognitive-candidate-actions');cell.append(n('h4','Tarjeta '+(i+1)));card.attrs.forEach(a=>attrs.append(n('li',a)));cell.append(attrs);const exclude=b('Descartar',()=>{const excluded=exclude.getAttribute('aria-pressed')!=='true';exclude.setAttribute('aria-pressed',String(excluded));cell.classList.toggle('excluded',excluded);advanceOnDiscard();});exclude.setAttribute('aria-pressed','false');exclude.setAttribute('aria-label','Tachar tarjeta '+(i+1));const choose=b('Elegir',()=>{if(clue<t.clues.length){status.textContent='Lee todas las pistas antes de elegir. Aún puedes revisar qué tarjetas has descartado.';return;}finish([card.id]);});choose.setAttribute('aria-label','Elegir tarjeta '+(i+1));actions.append(exclude,choose);cell.append(actions);grid.append(cell);});area.replaceChildren(next,grid);next.click();
 }
 function plan(){const context=n('section',undefined,'cognitive-plan-context'),goal=n('p',undefined,'cognitive-plan-goal'),initial=n('p',undefined,'cognitive-plan-initial'),unexpected=n('p',undefined,'cognitive-plan-unexpected');goal.append(n('strong','Objetivo: '),document.createTextNode(t.goal));initial.append(n('strong','Plan inicial: '),document.createTextNode(t.initial.join(' → ')));unexpected.append(n('strong','Imprevisto: '),document.createTextNode(t.change));context.append(goal,initial,unexpected);visual.append(context);status.textContent='Primero, elige cómo sustituir la acción que ya no se puede hacer.';choices([...t.options].sort((a,b)=>a.localeCompare(b,'es')),label=>{
   if(label!==t.replacement){finish(['replacement:'+label]);return;}
   const picked=[],slots=n('ol',undefined,'cognitive-plan-slots'),tray=n('div',undefined,'cognitive-choices'),updated=n('section',undefined,'cognitive-plan-updated'),updatedSteps=t.initial.map((step,index)=>n('span',index===t.replaceIndex?t.replacement:step,index===t.replaceIndex?'cognitive-plan-step cognitive-plan-step-changed':'cognitive-plan-step'));
   updated.append(n('strong','Plan actualizado'),n('p','El cambio importante está resaltado; conserva el orden de los demás pasos.'),n('div',undefined,'cognitive-plan-updated-steps'));updated.lastChild.append(...updatedSteps);
   const draw=()=>{slots.replaceChildren(...picked.map(x=>n('li',x)));tray.querySelectorAll('button').forEach(el=>el.disabled=picked.includes(el.textContent));};
   t.steps.slice().reverse().forEach(step=>tray.append(b(step,()=>{picked.push(step);draw();})));status.textContent='Ahora reorganiza el plan actualizado. Pulsa cada paso en orden.';
   area.replaceChildren(slots,tray,b('Deshacer',()=>{picked.pop();draw();}),b('Comprobar plan',()=>{if(picked.length!==t.steps.length){status.textContent='Coloca todos los pasos antes de comprobar.';return;}area.append(updated);finish(picked,{schema:'gliax.exercise-metrics.v1',modality:'plan_update',definition_version:2});}));
  });
 }
 function guidedWait(){
  let activeElapsedMs=0,intervalElapsedMs=0,restarts=0,interruptions=0,runStartedAt=0,running=false;
  const panel=n('section',undefined,'guided-wait-panel'),timerLabel=n('p','La barra muestra cuánto falta.','guided-wait-clock'),progress=n('progress',undefined,'guided-wait-progress');
  panel.setAttribute('aria-label','Práctica de espera guiada');timerLabel.setAttribute('role','timer');timerLabel.setAttribute('aria-live','off');progress.max=t.intervalMs;progress.value=0;progress.setAttribute('aria-label','Tiempo de espera restante');
  const begin=(restart=false)=>{clearTimeout(timer);if(running){const elapsed=Math.max(0,Math.round(performance.now()-runStartedAt));activeElapsedMs+=elapsed;intervalElapsedMs+=elapsed;}if(restart){restarts++;intervalElapsedMs=0;}running=true;runStartedAt=performance.now();
   const tick=()=>{if(!running||stopped||finished)return;const elapsed=performance.now()-runStartedAt,remaining=t.intervalMs-intervalElapsedMs;if(elapsed>=remaining){activeElapsedMs+=Math.round(elapsed);intervalElapsedMs+=Math.round(elapsed);running=false;progress.value=t.intervalMs;timerLabel.textContent='Intervalo finalizado.';const metrics={schema:'gliax.exercise-metrics.v1',modality:'guided_wait',interval_completed:true,level:item.level,interval_ms:t.intervalMs,duration_ms:activeElapsedMs,restarts,interruptions};finish(['complete'],metrics);return;}progress.value=Math.min(t.intervalMs,intervalElapsedMs+elapsed);timerLabel.textContent=`Espera ${Math.ceil((remaining-elapsed)/1000)} segundos.`;timer=setTimeout(tick,100);};tick();
  };
  panel.append(timerLabel,progress);visual.replaceChildren(status,panel);area.replaceChildren(b('Reiniciar espera',()=>begin(true)));begin(false);
  return {pause(){if(!running)return;const elapsed=Math.max(0,Math.round(performance.now()-runStartedAt));activeElapsedMs+=elapsed;intervalElapsedMs+=elapsed;running=false;clearTimeout(timer);interruptions++;progress.value=Math.min(t.intervalMs,intervalElapsedMs);timerLabel.textContent='Intervalo en pausa.';status.textContent='La práctica se pausó. Puedes reanudar o empezar de nuevo cuando quieras.';visual.replaceChildren(status,panel);area.replaceChildren(b('Reanudar espera',()=>begin(false)),b('Reiniciar espera',()=>begin(true)));},resume(){begin(false);},isRunning:()=>running,hasStarted:()=>activeElapsedMs>0||running||interruptions>0};
 }
 let waitController=null,ruleResponse=null;
 const stage=n('div',undefined,'rule-stimulus-stage');
 const showRuleStage=(...children)=>{stage.replaceChildren(...children);visual.replaceChildren(stage,status);};
 const onResponseKey=event=>{
  if(!trialOpen||event.code!=='Space'||event.repeat||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey||event.isComposing)return;
  if(event.target.closest?.('button,input,select,textarea,a,[contenteditable],[role="button"]'))return;
  event.preventDefault();ruleResponse?.();
 };
 function ruleTrial(){if(round===t.trials.length){const measured=ruleStats.filter(x=>x.response_ms!==null).map(x=>x.response_ms);finish(response,{schema:'gliax.exercise-metrics.v1',modality:'rule_application',definition_version:2,level:item.level,trials:ruleStats.length,correct:ruleStats.filter(x=>x.correct).length,errors:ruleStats.filter(x=>!x.correct&&!x.omission).length,omissions:ruleStats.filter(x=>x.omission).length,switches:t.trials.filter(x=>x.switchBefore).length,response_times_ms:measured});return;}const trial=t.trials[round];
  const show=()=>{trialOpen=true;trialStartedAt=performance.now();status.textContent='';ruleResponse=()=>end('act',true);showRuleStage(picture(trial.symbol));stage.onclick=ruleResponse;stage.classList.add('is-response-surface');later(()=>end('wait',false),t.trialMs);area.replaceChildren(b('Responder',ruleResponse),b('Reiniciar sin registrar',ready));};
  const end=(value,observed)=>{if(!trialOpen||stopped||finished)return;trialOpen=false;clearTimeout(timer);const correct=value===t.answer[round],omission=!observed&&t.answer[round]==='act';ruleStats.push({correct,omission,response_ms:observed?Math.max(0,Math.round(performance.now()-trialStartedAt)):null});response.push(value);round++;stage.onclick=null;stage.classList.remove('is-response-surface');showRuleStage();status.textContent=item.level===1?(correct?'¡Bien! Has seguido la regla.':'Revisa la regla: en esta tarjeta había que '+(t.answer[round-1]==='act'?'responder.':'esperar.')):'Siguiente tarjeta';area.querySelectorAll('button').forEach(x=>x.disabled=true);later(ruleTrial,t.gapMs);};
  if(trial.switchBefore){const panel=n('div',undefined,'cognitive-rule-change');panel.append(n('div','↔','cognitive-switch'),n('p','La regla ha cambiado. Invierte la regla que recuerdas.'));showRuleStage(panel);status.textContent='Cambio de regla.';area.replaceChildren(b('Reiniciar sin registrar',ready));later(show,t.switchMs);}else show();
 }
 function start(){response=[];round=0;ruleStats=[];visual.replaceChildren(status);area.replaceChildren();if(t.kind==='rules')ruleTrial();else if(t.kind==='guidedWait'){if(waitController?.hasStarted())waitController.resume();else waitController=guidedWait();}else if(t.kind==='words')words();else if(t.kind==='deduction')deduction();else if(t.kind==='change')plan();else selectFacts();}
 function ready(){clearTimeout(timer);trialOpen=false;response=[];round=0;visual.replaceChildren(status);const guessing=t.kind==='rules'&&item.level===1&&item.ageRoute!=='early';status.textContent=t.kind==='rules'?(guessing?'Adivina la regla observando qué estímulos van con cada respuesta. Al terminar verás si la has identificado.':t.initialRule+(t.trials.some(x=>x.switchBefore)?' Cuando veas ↔, invierte esta regla.':'')):t.kind==='guidedWait'?'Práctica guiada: mira la barra y espera hasta que llegue al final.':'Lee la consigna y empieza cuando estés preparado.';area.replaceChildren(b(t.kind==='guidedWait'?'Empezar espera':'Empezar',start));if(t.kind==='rules')visual.append(n('p','Cuando toque responder, usa la barra espaciadora, toca el estímulo o pulsa Responder.'));if(t.kind==='rules'&&item.ageRoute==='early'){const examples=n('div',undefined,'cognitive-choices');const types=new Set();for(const trial of t.trials){if(types.has(trial.target))continue;types.add(trial.target);const example=n('div');example.append(picture(trial.symbol),n('p',trial.target?'Con este grupo: pulsa':'Con este grupo: espera'));examples.append(example);}visual.append(examples);}}
 const interrupt=()=>{if(document.hidden&&!finished&&!stopped){if(t.kind==='guidedWait'){if(waitController?.isRunning())waitController.pause();return;}ready();status.textContent='Actividad interrumpida. Este intento no se registra. Vuelve a empezar cuando estés preparado.';}};
 document.addEventListener('keydown',onResponseKey);document.addEventListener('visibilitychange',interrupt);ready();return()=>{stopped=true;trialOpen=false;clearTimeout(timer);document.removeEventListener('keydown',onResponseKey);document.removeEventListener('visibilitychange',interrupt);area.classList.remove('cognitive-area');};
}
root.CognitiveRenderer={mount};
})(window);

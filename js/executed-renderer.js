(function(root){
'use strict';
function mount(item,{visual,area,onFinish,iconProfile}){
 const task=item.execution;let stopped=false,finished=false,timer=null,response=[],round=0,trialOpen=false,trialStartedAt=0,observations=[],respond=null;
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const picture=label=>{const n=node('span',undefined,'executed-picture');n.innerHTML=root.ActivityModel.visualLabel(label,{iconProfile});return n;};
 const later=(fn,ms)=>{clearTimeout(timer);timer=setTimeout(()=>{if(!stopped&&!finished)fn();},ms);};
 const button=(label,fn)=>{const b=node('button',label,'secondary-btn');b.type='button';b.onclick=fn;return b;};
 const message=node('p','Cuando estés preparado, empieza.','executed-status');message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 const stage=node('div',undefined,'executed-rule-stimulus rule-stimulus-stage');
 const showStage=(...children)=>{stage.replaceChildren(...children);visual.replaceChildren(stage,message);};
 const keyResponse=event=>{
  if(!trialOpen||event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||event.isComposing||event.target.closest?.('button,input,select,textarea,a,[contenteditable],[role="button"]'))return;
  const value=task.kind==='inhibit'&&event.code==='Space'?'act':task.kind==='switch'&&['KeyA','KeyB'].includes(event.code)?event.code.at(-1):null;
  if(value){event.preventDefault();respond?.(value,true);}
 };
 visual.replaceChildren(message);area.classList.add('executed-area');
 function complete(value=response){if(stopped||finished)return;finished=true;clearTimeout(timer);area.querySelectorAll('button').forEach(b=>b.disabled=true);const ruleTask=['switch','inhibit'].includes(task.kind);
  const metrics=ruleTask?{schema:'gliax.exercise-metrics.v1',modality:'rule_application',definition_version:2,variant:task.kind,level:item.level,trials:observations.length,correct:observations.filter(x=>x.correct).length,errors:observations.filter(x=>!x.correct&&!x.omission).length,omissions:observations.filter(x=>x.omission).length,response_times_ms:observations.flatMap(x=>x.ms===null?[]:[x.ms])}:task.kind==='spatial'?{schema:'gliax.exercise-metrics.v1',modality:'executed_memory_spatial',definition_version:item.contentKey?.startsWith('executed-v6:')?2:1}:null;
  onFinish(root.ExecutedTasks.grade(item,value),item.why,metrics);
  if(['serial','update','spatial'].includes(task.kind)){
   const solution=node('div',undefined,'memory-solution');solution.append(node('h4',task.kind==='spatial'?'Posiciones correctas':'Secuencia correcta'));
   if(task.kind==='spatial')solution.append(grid(task.cells.map((label,i)=>task.occupied.includes(i)?label:null),false));else{const row=node('ol',undefined,'executed-model');task.answer.forEach(label=>{const li=node('li');li.append(picture(label));row.append(li);});solution.append(row);}
   area.replaceChildren();visual.replaceChildren(solution);
  }}
 function grid(values,clickable=true,onClick,presentation){const g=node('div',undefined,'executed-grid');g.style.setProperty('--executed-cols',task.cols);values.forEach((value,i)=>{
  const cell=clickable?button('',()=>onClick(cell,i)):node('div',undefined,'executed-cell');cell.classList.add('executed-cell');cell.setAttribute('aria-label',`Fila ${Math.floor(i/task.cols)+1}, columna ${i%task.cols+1}${value?', '+value:''}`);
  if(clickable)cell.setAttribute('aria-pressed','false');if(value&&presentation==='words')cell.append(node('span',value));
  else if(value&&presentation==='icons'){
   const art=root.StimulusArt,glyph=art.forLabel(value);
   const icon=node('span',undefined,'executed-picture');icon.setAttribute('aria-hidden','true');icon.innerHTML=art.svg(glyph);cell.append(icon);
  }else if(value)cell.append(picture(value));
  else cell.append(node('span','·'));
  g.append(cell);
 });return g;}
 function selection(values,presentation){response=[];const g=grid(values,true,(cell,i)=>{const key=String(i),pos=response.indexOf(key);if(pos<0)response.push(key);else response.splice(pos,1);cell.setAttribute('aria-pressed',String(pos<0));message.textContent=response.length+' casillas marcadas.';},presentation);area.replaceChildren(g,button('Comprobar',()=>complete()));}
 function sequence(choices){response=[];const picked=node('div',undefined,'executed-picked');picked.setAttribute('aria-label','Tu secuencia');const bank=node('div',undefined,'executed-choices');
  const draw=()=>{picked.replaceChildren(...response.map((x,i)=>{const n=node('span',undefined,'executed-token');n.append(node('small',String(i+1)),picture(x));return n;}));message.textContent=`Tu secuencia: ${response.length} de ${task.answer.length}.`;};
  choices.forEach(value=>{const b=button('',()=>{if(response.length>=task.answer.length)return;response.push(value);draw();});b.setAttribute('aria-label',value);b.append(picture(value));bank.append(b);});
  area.replaceChildren(picked,bank,button('Deshacer',()=>{response.pop();draw();}),button('Comprobar',()=>{if(response.length!==task.answer.length){message.textContent='Completa los '+task.answer.length+' pasos antes de comprobar.';return;}complete();}));draw();
 }
 function arrangePlan(){
  const available=node('div',undefined,'plan-available'),picked=node('ol',undefined,'plan-selected');
  available.setAttribute('aria-label','Pasos disponibles');picked.setAttribute('aria-label','Tu plan');
  const check=button('Comprobar plan',()=>{
   const expected=task.answer;
   const correctSelection=response.length===expected.length&&response.every(value=>expected.includes(value));
   const correctOrder=correctSelection&&response.every((value,index)=>expected[index]===value);
   message.textContent=correctOrder?'Pasos y orden correctos.':correctSelection?'Elegiste los pasos correctos. Revisa su orden.':'Revisa qué pasos hacen falta y cuáles debes dejar fuera.';
   if(!correctOrder){const solution=node('ol',undefined,'plan-solution');task.answer.forEach(value=>solution.append(node('li',value)));visual.append(node('h4','Una secuencia correcta'),solution);}
   complete();
  });
  const cards=new Map(task.choices.map(value=>[value,button(value,()=>{
   if(!response.includes(value)&&response.length<task.answer.length){response.push(value);draw(response.length-1);}
  })]));
  available.append(...cards.values());
  function draw(focus=-1,action=0){
   picked.replaceChildren(...response.map((value,index)=>{
    const row=node('li');row.append(node('span',value));
    const actions=node('div',undefined,'plan-order-controls');
    for(const [step,label] of [[-1,'Subir'],[1,'Bajar'],[0,'Quitar']]){
     const control=button(label,()=>{
      if(!step){response.splice(index,1);draw();cards.get(value).focus();return;}
      [response[index],response[index+step]]=[response[index+step],response[index]];
      draw(index+step,step<0?0:1);
     });
     control.setAttribute('aria-label',label+' '+value);
     control.disabled=step!==0&&(index+step<0||index+step>=response.length);
     actions.append(control);
    }
    row.append(actions);return row;
   }));
   cards.forEach((control,value)=>{control.disabled=response.includes(value)||response.length>=task.answer.length;});
   check.disabled=response.length!==task.answer.length;
   message.textContent=`${response.length} de ${task.answer.length} pasos elegidos.`;
   const active=picked.children[focus]?.querySelectorAll('button');
   (active?.[action].disabled?active?.[2]:active?.[action])?.focus();
  }
  area.replaceChildren(node('h4','Pasos disponibles'),available,node('h4','Tu plan'),picked,check);draw();
 }
 function trials(skipSwitch=false){area.replaceChildren();message.classList.remove('executed-next-cue');
  if(!skipSwitch&&task.kind==='switch'&&round>0&&round<task.trials.length&&task.trials[round].reversed!==task.trials[round-1].reversed){
   const change=node('section',undefined,'executed-rule-change');change.append(node('div','↔','cognitive-switch'),node('h2','CAMBIO DE REGLA'),node('p','Intercambia A y B. La señal no indica qué botón pulsar.'));message.textContent='Cambio de regla.';showStage(change);later(()=>trials(true),2100);return;
  }if(round===task.trials.length){complete();return;}
  const trial=task.trials[round];trialOpen=true;trialStartedAt=performance.now();message.textContent='';
  showStage(picture(trial.symbol));
  respond=(value,observed)=>{if(!trialOpen||stopped||finished)return;trialOpen=false;clearTimeout(timer);observations.push({correct:value===task.answer[round],omission:!observed&&task.answer[round]!=='wait',ms:observed?Math.round(performance.now()-trialStartedAt):null});response.push(value);round++;stage.onclick=null;stage.classList.remove('is-response-surface');showStage();message.textContent='Siguiente estímulo';message.classList.add('executed-next-cue');area.querySelectorAll('button').forEach(b=>b.disabled=true);later(trials,650);};
  if(task.kind==='inhibit'){
   const act=()=>respond('act',true);
   area.append(button('Responder',act));stage.onclick=act;stage.classList.add('is-response-surface');
   later(()=>respond('wait',false),task.trialMs);
  }
  else{area.append(button('A',()=>respond('A',true)),button('B',()=>respond('B',true)));}
  area.append(button('Reiniciar sin registrar',()=>ready('Intento detenido. Puedes volver a empezar.')));
 }
 function start(){clearTimeout(timer);response=[];observations=[];round=0;area.replaceChildren();visual.replaceChildren(message);message.textContent=({serial:'Observa la secuencia. Después se ocultará.',update:'Memoriza la secuencia. Después aparecerá un cambio.',spatial:'Observa dónde está el modelo; ignora los otros objetos.',follow:'Sigue el modelo visible y pulsa los objetos en ese orden.',cancel:'Compara cada objeto con los modelos.',compare:'0 casillas marcadas.',plan:'Completa los requisitos antes de pasar al siguiente paso.'})[task.kind]||(task.kind==='switch'?'Aplica la regla inicial.':'Sigue la regla de la tarjeta.');
  if(['switch','inhibit'].includes(task.kind)){trials();return;}
  if(task.kind==='plan'){
   if(task.choices){
    visual.append(node('p',item.stimulus[0].text));
    if(item.stimulus[1]?.label!=='Tarjetas disponibles'){const rules=node('ul',undefined,'plan-constraints');item.stimulus[1].items.forEach(text=>rules.append(node('li',text)));visual.append(rules);}
    arrangePlan();
   }else{visual.append(node('p',item.stimulus[0].text));sequence([...task.steps].reverse());}
   return;
  }
  if(task.kind==='cancel'){visual.append(node('p','Modelos'));task.targets.forEach(x=>visual.append(picture(x)));selection(task.cells);return;}
  if(task.kind==='compare'){
   const first=task.format==='mixed'?'icons':task.format,second=task.format==='mixed'?'words':task.format;
   visual.append(node('h4','Cuadrícula A'),grid(task.cells,false,null,first),node('h4','Cuadrícula B'));
   selection(task.after,second);return;
  }
  if(task.kind==='follow'){const model=node('div',undefined,'executed-model');task.sequence.forEach(x=>model.append(picture(x)));visual.append(model);sequence([...task.choices].reverse());return;}
  if(task.kind==='spatial'){visual.append(node('p','Modelo que debes recordar'),picture(task.target));}
  const source=task.kind==='spatial'?grid(task.cells,false):node('div',undefined,'executed-model');if(task.kind!=='spatial')task.sequence.forEach(x=>source.append(picture(x)));visual.append(source);area.append(button('Reiniciar sin registrar',()=>ready('Intento detenido. Puedes volver a empezar.')));
  const hide=()=>{visual.replaceChildren(message);message.textContent=task.kind==='spatial'?'Marca solo las casillas donde estaba el modelo.':task.reverse?'Reconstruye el orden inverso.':'Reconstruye el orden que recuerdas.';if(task.kind==='spatial')selection(task.cells.map(()=>''));else sequence([...task.choices].reverse());};
  if(task.kind==='update')later(()=>{visual.replaceChildren(message);message.textContent='Cambio: en la posición '+(task.replaceIndex+1)+' coloca este objeto.';visual.append(picture(task.replacement));later(hide,3500);},task.exposureMs);
  else later(hide,task.exposureMs);
 }
 function ready(text){clearTimeout(timer);trialOpen=false;message.textContent=text;message.classList.remove('executed-next-cue');visual.replaceChildren(message);if(task.kind==='switch'){const intro=node('section',undefined,'executed-rule-intro'),rows=node('div',undefined,'executed-rule-rows');intro.append(node('h2','Regla inicial'));rows.append(node('p','LIBRO → A'),node('p','PELOTA → B'));intro.append(rows,node('p','Si aparece ↔, intercambia las respuestas.'));visual.append(intro);}area.replaceChildren(button('Empezar',start));}
 const interrupt=()=>{if(document.hidden&&!finished&&!stopped)ready('La actividad se ha interrumpido. Vuelve a empezar cuando estés preparado; este intento no se registra.');};
 document.addEventListener('keydown',keyResponse);document.addEventListener('visibilitychange',interrupt);ready('Pulsa Empezar para comenzar.');
 return ()=>{stopped=true;clearTimeout(timer);document.removeEventListener('keydown',keyResponse);document.removeEventListener('visibilitychange',interrupt);area.classList.remove('executed-area');};
}
root.ExecutedRenderer={mount};
})(window);

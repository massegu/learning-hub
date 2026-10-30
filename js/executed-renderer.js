(function(root){
'use strict';
function mount(item,{visual,area,onFinish}){
 const task=item.execution;let stopped=false,finished=false,timer=null,response=[],round=0,trialOpen=false;
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const picture=label=>{const n=node('span',undefined,'executed-picture');n.innerHTML=root.ActivityModel.visualLabel(label);return n;};
 const later=(fn,ms)=>{clearTimeout(timer);timer=setTimeout(()=>{if(!stopped&&!finished)fn();},ms);};
 const button=(label,fn)=>{const b=node('button',label,'secondary-btn');b.type='button';b.onclick=fn;return b;};
 const message=node('p','Cuando estés preparado, empieza.','executed-status');message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 visual.replaceChildren(message);area.classList.add('executed-area');
 function complete(value=response){if(stopped||finished)return;finished=true;clearTimeout(timer);area.querySelectorAll('button').forEach(b=>b.disabled=true);onFinish(root.ExecutedTasks.grade(item,value),item.why);}
 function grid(values,clickable=true,onClick){const g=node('div',undefined,'executed-grid');g.style.setProperty('--executed-cols',task.cols);values.forEach((value,i)=>{
  const cell=clickable?button('',()=>onClick(cell,i)):node('div',undefined,'executed-cell');cell.classList.add('executed-cell');cell.setAttribute('aria-label',`Fila ${Math.floor(i/task.cols)+1}, columna ${i%task.cols+1}${value?', '+value:''}`);
  if(clickable)cell.setAttribute('aria-pressed','false');if(value)cell.append(picture(value));else cell.append(node('span','·'));g.append(cell);
 });return g;}
 function selection(values){response=[];const g=grid(values,true,(cell,i)=>{const key=String(i),pos=response.indexOf(key);if(pos<0)response.push(key);else response.splice(pos,1);cell.setAttribute('aria-pressed',String(pos<0));message.textContent=response.length+' casillas marcadas.';});area.replaceChildren(g,button('Comprobar',()=>complete()));}
 function sequence(choices){response=[];const picked=node('div',undefined,'executed-picked');picked.setAttribute('aria-label','Tu secuencia');const bank=node('div',undefined,'executed-choices');
  const draw=()=>{picked.replaceChildren(...response.map((x,i)=>{const n=node('span',undefined,'executed-token');n.append(node('small',String(i+1)),picture(x));return n;}));message.textContent=`Tu secuencia: ${response.length} de ${task.answer.length}.`;};
  choices.forEach(value=>{const b=button('',()=>{if(response.length>=task.answer.length)return;response.push(value);draw();});b.setAttribute('aria-label',value);b.append(picture(value));bank.append(b);});
  area.replaceChildren(picked,bank,button('Deshacer',()=>{response.pop();draw();}),button('Comprobar',()=>{if(response.length!==task.answer.length){message.textContent='Completa los '+task.answer.length+' pasos antes de comprobar.';return;}complete();}));draw();
 }
 function trials(){area.replaceChildren();if(round===task.trials.length){complete();return;}
  const trial=task.trials[round];trialOpen=true;message.textContent=`Tarjeta ${round+1} de ${task.trials.length}. `+(task.kind==='inhibit'?'Libro: pulsa. Pelota: espera.':trial.reversed?'Regla nueva: libro → B; pelota → A.':'Regla: libro → A; pelota → B.');
  visual.replaceChildren(message,picture(trial.symbol));
  const next=value=>{if(!trialOpen||stopped||finished)return;trialOpen=false;clearTimeout(timer);response.push(value);round++;trials();};
  if(task.kind==='inhibit'){area.append(button('Responder',()=>next('act')));later(()=>next('wait'),task.trialMs);}
  else{area.append(button('A',()=>next('A')),button('B',()=>next('B')));}
  area.append(button('Reiniciar sin registrar',()=>ready('Intento detenido. Puedes volver a empezar.')));
 }
 function start(){clearTimeout(timer);response=[];round=0;area.replaceChildren();visual.replaceChildren(message);message.textContent=({serial:'Observa la secuencia. Después se ocultará.',update:'Memoriza la secuencia. Después aparecerá un cambio.',spatial:'Observa las casillas ocupadas. Después se vaciarán.',follow:'Sigue el modelo visible y pulsa los objetos en ese orden.',cancel:'Compara cada objeto con los modelos.',compare:'Revisa la misma posición en A y en B.',plan:'Completa los requisitos antes de pasar al siguiente paso.'})[task.kind]||'Sigue la regla de la tarjeta.';
  if(['switch','inhibit'].includes(task.kind)){trials();return;}
  if(task.kind==='plan'){
   visual.append(node('p',item.stimulus[1].items.join(' ')));sequence([...task.steps].reverse());return;
  }
  if(task.kind==='cancel'){visual.append(node('p','Modelos'));task.targets.forEach(x=>visual.append(picture(x)));selection(task.cells);return;}
  if(task.kind==='compare'){visual.append(node('h4','Cuadrícula A'),grid(task.cells,false),node('h4','Marca los cambios en B'));selection(task.after);return;}
  if(task.kind==='follow'){const model=node('div',undefined,'executed-model');task.sequence.forEach(x=>model.append(picture(x)));visual.append(model);sequence([...task.choices].reverse());return;}
  const source=task.kind==='spatial'?grid(task.cells,false):node('div',undefined,'executed-model');if(task.kind!=='spatial')task.sequence.forEach(x=>source.append(picture(x)));visual.append(source);area.append(button('Reiniciar sin registrar',()=>ready('Intento detenido. Puedes volver a empezar.')));
  const hide=()=>{visual.replaceChildren(message);message.textContent=task.kind==='spatial'?'Marca las casillas que estaban ocupadas.':task.reverse?'Reconstruye el orden inverso.':'Reconstruye el orden que recuerdas.';if(task.kind==='spatial')selection(task.cells.map(()=>''));else sequence([...task.choices].reverse());};
  if(task.kind==='update')later(()=>{visual.replaceChildren(message);message.textContent='Cambio: en la posición '+(task.replaceIndex+1)+' coloca este objeto.';visual.append(picture(task.replacement));later(hide,3500);},task.exposureMs);
  else later(hide,task.exposureMs);
 }
 function ready(text){clearTimeout(timer);trialOpen=false;message.textContent=text;visual.replaceChildren(message);area.replaceChildren(button('Empezar',start));}
 const interrupt=()=>{if(document.hidden&&!finished&&!stopped)ready('La actividad se ha interrumpido. Vuelve a empezar cuando estés preparado; este intento no se registra.');};
 document.addEventListener('visibilitychange',interrupt);ready('Observa la consigna. Pulsa Empezar cuando estés preparado.');
 return ()=>{stopped=true;clearTimeout(timer);document.removeEventListener('visibilitychange',interrupt);area.classList.remove('executed-area');};
}
root.ExecutedRenderer={mount};
})(window);

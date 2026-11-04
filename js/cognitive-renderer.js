(function(root){
'use strict';
function mount(item,{visual,area,onFinish}){
 root.CognitiveFamilies.validate(item);const t=item.cognitiveTask;let stopped=false,finished=false,timer=null,round=0,trialOpen=false,response=[];
 const n=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 const b=(label,fn)=>{const el=n('button',label,'secondary-btn');el.type='button';el.onclick=fn;return el;};
 const status=n('p','','cognitive-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 visual.replaceChildren(status);area.classList.add('cognitive-area');
 const picture=label=>{const el=n('div',undefined,'cognitive-picture');el.innerHTML=root.ActivityModel.visualLabel(label);return el;};
 const later=(fn,ms)=>{clearTimeout(timer);timer=setTimeout(()=>{if(!stopped&&!finished)fn();},ms);};
 function finish(value){if(stopped||finished)return;finished=true;trialOpen=false;clearTimeout(timer);area.querySelectorAll('button,input').forEach(el=>el.disabled=true);const ok=root.CognitiveFamilies.grade(item,value);onFinish(ok,(ok?'Actividad completada correctamente. ':'Revisa el resultado. ')+(ok&&t.kind==='rules'&&t.trials.some(x=>x.switchBefore)?'Has aplicado la nueva regla correctamente. ':'' )+item.why);const expected=n('div',undefined,'cognitive-solution');
  if(t.kind==='rules'){
   expected.append(n('h4','Reglas aplicadas'));const details=n('details'),summary=n('summary','Revisar las tarjetas y tus respuestas'),list=n('ol');
   t.trials.forEach((trial,i)=>list.append(n('li',(trial.switchBefore?'↔ Cambio. ':'')+'Tarjeta '+(i+1)+': '+trial.symbol+'. Respuesta esperada: '+(t.answer[i]==='act'?'responder':'esperar')+'. Tu respuesta: '+(value[i]==='act'?'responder':'esperar')+'.')));
   details.append(summary,list);expected.append(details);
  }else expected.append(n('h4','Solución y motivo'),n('p',item.sample));visual.append(expected);}
 function choices(values,answer){const box=n('div',undefined,'cognitive-choices');values.forEach((label,i)=>{box.append(b(label,()=>answer(label,i)));});area.replaceChildren(box);}
 function selectFacts(){const selected=new Set();status.textContent=t.kind==='contradiction'?'Compara las fuentes. Marca las dos frases que se contradicen.':'Marca solo los datos que necesitas para el objetivo.';const box=n('div',undefined,'cognitive-facts');t.facts.forEach((fact,i)=>{const label=n('label',undefined,'cognitive-fact'),input=n('input');input.type='checkbox';input.value='f'+i;input.onchange=()=>input.checked?selected.add(input.value):selected.delete(input.value);label.append(input,n('span',fact));if(t.factIcons?.['f'+i])label.append(picture(t.factIcons['f'+i]));box.append(label);});area.replaceChildren(box,b('Comprobar',()=>finish([...selected])));}
 function words(){visual.append(n('div',undefined,'cognitive-conditions'));const conditions=visual.lastChild;item.stimulus[0].items.forEach(text=>conditions.append(n('p',text)));status.textContent='Comprueba todas las condiciones antes de responder.';choices([...t.options].sort((a,b)=>a.localeCompare(b,'es')),label=>finish([label]));if(item.ageRoute==='early')area.querySelectorAll('.cognitive-choices button').forEach(el=>{const label=el.textContent;el.setAttribute('aria-label',label);el.replaceChildren(picture(label));});
  if(t.productionAllowed){const form=n('form'),label=n('label','O escribe otra palabra: '),input=n('input');input.type='text';input.autocomplete='off';input.maxLength=45;input.id='cognitiveWord';label.htmlFor=input.id;label.append(input);const submit=b('Comprobar palabra',()=>{});submit.type='submit';form.append(label,submit);form.onsubmit=e=>{e.preventDefault();const state=root.CognitiveFamilies.productionStatus(item,input.value);if(state==='unreviewed'){status.textContent='Esta palabra no está en el vocabulario revisado. No la marcamos como incorrecta ni registramos un resultado. Puedes elegir una opción o probar otra palabra.';return;}finish([input.value]);};area.append(form);}
 }
 function deduction(){let clue=0;const notes=n('div',undefined,'cognitive-clues'),grid=n('div',undefined,'cognitive-candidates');visual.append(notes);const next=b('Ver siguiente pista',()=>{if(clue>=t.clues.length)return;notes.append(n('p','Pista '+(clue+1)+': '+t.clues[clue++].text));next.disabled=clue===t.clues.length;status.textContent=clue===t.clues.length?'Ya tienes todas las pistas. Elige la tarjeta que cumple todas.':'Puedes tachar tarjetas y pedir otra pista.';});
  t.candidates.forEach((card,i)=>{const cell=n('div',undefined,'cognitive-candidate');cell.append(n('h4','Tarjeta '+(i+1)));card.attrs.forEach(a=>cell.append(picture(a)));const exclude=b('Tachar tarjeta '+(i+1),()=>{const excluded=exclude.getAttribute('aria-pressed')!=='true';exclude.setAttribute('aria-pressed',String(excluded));cell.classList.toggle('excluded',excluded);});exclude.setAttribute('aria-pressed','false');cell.append(exclude,b('Elegir tarjeta '+(i+1),()=>{if(clue<t.clues.length){status.textContent='Lee todas las pistas antes de elegir. Aún puedes revisar qué tarjetas has tachado.';return;}finish([card.id]);}));grid.append(cell);});area.replaceChildren(next,grid);next.click();
 }
 function plan(){visual.append(n('h4','Plan inicial'),n('p',t.initial.join(' → ')),n('p','Imprevisto: '+t.change));status.textContent='Primero, elige cómo sustituir la acción que ya no se puede hacer.';choices([...t.options].sort((a,b)=>a.localeCompare(b,'es')),label=>{
   if(label!==t.replacement){finish(['replacement:'+label]);return;}
   const picked=[],slots=n('ol',undefined,'cognitive-plan-slots'),tray=n('div',undefined,'cognitive-choices');
   const draw=()=>{slots.replaceChildren(...picked.map(x=>n('li',x)));tray.querySelectorAll('button').forEach(el=>el.disabled=picked.includes(el.textContent));};
   t.steps.slice().reverse().forEach(step=>tray.append(b(step,()=>{picked.push(step);draw();})));status.textContent='Ahora reorganiza el plan actualizado. Pulsa cada paso en orden.';
   area.replaceChildren(slots,tray,b('Deshacer',()=>{picked.pop();draw();}),b('Comprobar plan',()=>{if(picked.length!==t.steps.length){status.textContent='Coloca todos los pasos antes de comprobar.';return;}finish(picked);}));
  });
 }
 function ruleTrial(){if(round===t.trials.length){finish(response);return;}const trial=t.trials[round];
  const show=()=>{trialOpen=true;status.textContent='Tarjeta '+(round+1)+' de '+t.trials.length;visual.replaceChildren(status,picture(trial.symbol));const press=b('Responder',()=>end('act'));area.replaceChildren(press,b('Reiniciar sin registrar',ready));later(()=>end('wait'),t.trialMs);};
  const end=value=>{if(!trialOpen||stopped||finished)return;trialOpen=false;clearTimeout(timer);response.push(value);round++;visual.replaceChildren(status);status.textContent='Siguiente tarjeta';area.querySelectorAll('button').forEach(x=>x.disabled=true);later(ruleTrial,t.gapMs);};
  if(trial.switchBefore){visual.replaceChildren(status,n('div','↔','cognitive-switch'));status.textContent='Cambio de regla. Invierte la regla que recuerdas.';area.replaceChildren(b('Reiniciar sin registrar',ready));later(show,t.switchMs);}else show();
 }
 function start(){response=[];round=0;visual.replaceChildren(status);area.replaceChildren();if(t.kind==='rules')ruleTrial();else if(t.kind==='words')words();else if(t.kind==='deduction')deduction();else if(t.kind==='change')plan();else selectFacts();}
 function ready(){clearTimeout(timer);trialOpen=false;response=[];round=0;visual.replaceChildren(status);status.textContent=t.kind==='rules'?t.initialRule+(t.trials.some(x=>x.switchBefore)?' Cuando veas ↔, invierte esta regla.':''):'Lee la consigna y empieza cuando estés preparado.';area.replaceChildren(b('Empezar',start));if(t.kind==='rules'&&item.ageRoute==='early'){const examples=n('div',undefined,'cognitive-choices');const types=new Set();for(const trial of t.trials){if(types.has(trial.target))continue;types.add(trial.target);const example=n('div');example.append(picture(trial.symbol),n('p',trial.target?'Con este grupo: pulsa':'Con este grupo: espera'));examples.append(example);}visual.append(examples);}}
 const interrupt=()=>{if(document.hidden&&!finished&&!stopped){ready();status.textContent='Actividad interrumpida. Este intento no se registra. Vuelve a empezar cuando estés preparado.';}};
 document.addEventListener('visibilitychange',interrupt);ready();return()=>{stopped=true;trialOpen=false;clearTimeout(timer);document.removeEventListener('visibilitychange',interrupt);area.classList.remove('cognitive-area');};
}
root.CognitiveRenderer={mount};
})(window);

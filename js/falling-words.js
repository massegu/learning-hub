(function(root){
  'use strict';

  function mount(item,{visual,area,onFinish}){
    const task=item.cognitiveTask;
    visual.innerHTML=`
      <p class="falling-instructions">Escribe la palabra completa para pasar a la siguiente. Puedes ajustar la velocidad o dejarla quieta.</p>
      <div class="falling-lane" hidden><p class="falling-target"></p></div>
      <progress class="falling-time" aria-label="Avance del turno" hidden></progress>
      <p class="falling-status" role="status">Pulsa Empezar cuando estés preparado.</p>`;
    area.innerHTML=`
      <div class="falling-settings">
        <label for="fallingSpeed">Velocidad</label>
        <select id="fallingSpeed" class="falling-speed"><option value="slow">Tranquila</option><option value="standard" selected>Normal</option><option value="fast">Rápida</option></select>
        <label><input type="checkbox" class="falling-still"> Palabras quietas</label>
        <button type="button" class="secondary-btn falling-toggle">Empezar</button>
      </div>
      <form class="falling-form" hidden>
        <label for="fallingInput">Escribe la palabra</label>
        <input id="fallingInput" type="text" maxlength="40" autocomplete="off" spellcheck="false" autocapitalize="off" aria-describedby="fallingNote" required>
        <button class="primary-btn" type="submit">Confirmar</button>
        <p id="fallingNote">Los tiempos describen esta práctica de lectura y mecanografía en el dispositivo.</p>
      </form>`;
    const lane=visual.querySelector('.falling-lane'),target=visual.querySelector('.falling-target');
    const progress=visual.querySelector('progress'),status=visual.querySelector('[role="status"]');
    const speed=area.querySelector('.falling-speed'),still=area.querySelector('.falling-still');
    const toggle=area.querySelector('.falling-toggle'),form=area.querySelector('form');
    const field=form.querySelector('input'),confirm=form.querySelector('button');
    const reducedMotion=root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    still.checked=reducedMotion;
    still.disabled=reducedMotion;
    const durationFactors={slow:1.4,standard:1,fast:.8};
    const results=[];
    let phase='idle',position=0,frame=0,baseTime=0,elapsed=0,firstInput=null,composing=false;

    const duration=()=>Math.round(task.windowMs*durationFactors[speed.value]);
    const activeTime=()=>elapsed+(phase==='playing'?performance.now()-baseTime:0);
    const describe=(prefix='')=>{status.textContent=prefix+'Palabra '+(position+1)+' de '+task.prompts.length+'.';};

    function draw(){
      if(phase!=='playing')return;
      const time=activeTime();
      const fraction=Math.max(0,Math.min(1,time/duration()));
      progress.value=fraction;
      const distance=Math.max(0,lane.clientHeight-target.offsetHeight-16);
      target.style.transform=still.checked?'none':`translateY(${fraction*distance}px)`;
      if(fraction===1){finishRound('omitted',time);return;}
      frame=root.requestAnimationFrame(draw);
    }

    function startRound(previous){
      firstInput=null;
      elapsed=0;
      baseTime=performance.now();
      field.value='';
      target.textContent=task.prompts[position];
      target.style.transform='none';
      describe(previous);
      draw();
    }

    function finishRound(outcome,time){
      root.cancelAnimationFrame(frame);
      results.push({
        outcome,
        first_input_ms:firstInput===null?null:Math.round(firstInput),
        input_to_submit_ms:outcome==='omitted'||firstInput===null?null:Math.round(Math.max(0,time-firstInput))
      });
      position++;
      if(position<task.prompts.length){
        startRound(outcome==='correct'?'Correcta. ':outcome==='omitted'?'Sin respuesta. ':'No coincide. ');
        field.focus();
        return;
      }
      phase='finished';
      target.textContent='';
      field.value='';
      form.hidden=true;
      lane.hidden=true;
      progress.hidden=true;
      const correct=results.filter(round=>round.outcome==='correct').length;
      const errors=results.filter(round=>round.outcome==='error').length;
      const omissions=results.length-correct-errors;
      status.textContent='Ronda terminada.';
      onFinish(correct===results.length,`${correct} correctas · ${errors} con errores · ${omissions} sin respuesta.`,{
        schema:'gliax.exercise-metrics.v1',modality:'falling_words',definition_version:Math.max(2,task.measurementVersion),
        input:'text_entry',pace:speed.value,presentation:still.checked?'static':'falling',
        window_ms:duration(),correct,errors,omissions,rounds:results
      });
    }

    function pause(){
      if(phase!=='playing')return;
      elapsed=activeTime();
      phase='paused';
      root.cancelAnimationFrame(frame);
      lane.classList.add('falling-paused');
      progress.hidden=true;
      field.disabled=confirm.disabled=true;
      toggle.textContent='Reanudar';
      status.textContent='Ronda en pausa.';
    }

    toggle.onclick=()=>{
      if(phase==='playing'){pause();return;}
      const starting=phase==='idle';
      phase='playing';
      toggle.textContent='Pausar';
      speed.disabled=still.disabled=true;
      form.hidden=lane.hidden=progress.hidden=false;
      progress.max=1;
      lane.classList.remove('falling-paused');
      field.disabled=confirm.disabled=false;
      if(starting)startRound('');
      else{
        baseTime=performance.now();
        describe();
        draw();
      }
      field.focus();
    };
    function submit(explicit){
      if(phase!=='playing'||composing||!field.value.trim())return;
      const time=activeTime();
      if(firstInput===null)firstInput=time;
      const correct=root.CognitiveFamilies.matchesTranscription(task.prompts[position],field.value);
      if(time>=duration())finishRound('omitted',time);
      else if(correct||explicit)finishRound(correct?'correct':'error',time);
    }
    field.addEventListener('compositionstart',()=>{composing=true;});
    field.addEventListener('compositionend',()=>{composing=false;submit(false);});
    field.oninput=event=>{
      if(phase==='playing'&&field.value.trim()&&firstInput===null)firstInput=activeTime();
      if(!event.isComposing)submit(false);
    };
    form.onsubmit=event=>{event.preventDefault();submit(true);};
    const interrupt=()=>{if(document.hidden)pause();};
    document.addEventListener('visibilitychange',interrupt);
    return ()=>{
      phase='finished';
      root.cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange',interrupt);
    };
  }

  root.FallingWords={mount};
})(window);

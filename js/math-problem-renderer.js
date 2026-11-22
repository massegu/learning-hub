(function(root){
  'use strict';
  const operationLabels={...root.Curriculum.problemOperations,multiply_add:'Multiplicar y sumar el envío'};
  const measurement='gliax.exercise-metrics.v1';

  function mount(item,{visual,area,onFinish}){
    root.Curriculum.validateMathProblem(item);
    const problem=item.problem;
    const node=(tag,value)=>{
      const el=document.createElement(tag);
      if(value!==undefined)el.textContent=value;
      return el;
    };
    const controls=node('section');
    controls.className='math-problem-steps';
    const steps=[
      ['intermediate_datum','¿Qué dato necesitas encontrar primero?',problem.datum,[...problem.alternatives,problem.datum]],
      ['first_operation','¿Qué operación permite encontrar ese dato?',problem.first,Object.keys(operationLabels)],
      ['intermediate_calculation','Calcula ese dato.',problem.intermediate],
      ['final_operation','¿Qué operación resuelve la pregunta final?',problem.last,Object.keys(root.Curriculum.problemOperations)],
      ['final_answer','Calcula la respuesta final.',problem.answer]
    ];
    const results={};
    let index=0,checked=false,hintUsed=false,stopped=false;
    const numberFormat=new Intl.NumberFormat('es');
    const text=value=>typeof value==='number'?numberFormat.format(value):operationLabels[value]||value;

    const model=node('div');
    model.className='math-bar-model';
    model.setAttribute('aria-label','Modelo de barras de los datos del enunciado');
    const diagram=node('div');
    diagram.className='math-bars';
    const largest=Math.max(1,...problem.parts.map(([,value])=>value||1));
    problem.parts.forEach(([label,value])=>{
      const part=node('div',label+(value!==null&&problem.support==='full'?' · '+numberFormat.format(value):''));
      part.className=value===null?'math-bar unknown':'math-bar';
      part.style.flexGrow=String(value===null?largest/2:value);
      diagram.append(part);
    });
    const support=node('details');
    support.className='math-problem-support';
    support.append(node('summary','Ver el modelo de barras'),diagram);
    if(item.ageRoute==='junior'&&problem.support==='full'){
      const counters=node('details');
      counters.className='math-counters';
      counters.append(node('summary','Representar con fichas'));
      for(const [label,value] of problem.parts){
        const group=node('div'),marks=node('span');
        group.append(node('strong',label+' · '+numberFormat.format(value)));
        marks.setAttribute('aria-hidden','true');
        for(let i=0;i<value;i++)marks.append(node('i'));
        group.append(marks);counters.append(group);
      }
      model.append(counters);
    }
    support.open=problem.support==='full';
    support.ontoggle=()=>{if(support.open&&problem.support!=='full')hintUsed=true;};
    if(problem.support!=='independent')model.append(support);
    visual.append(model);
    area.replaceChildren(controls);
    function render(){
      const [key,label,expected,choices]=steps[index];
      checked=false;
      const position=node('p',`Paso ${index+1} de ${steps.length}`);
      position.className='math-step-position';
      const form=node('form'), fieldset=node('fieldset'), legend=node('legend',label);
      fieldset.append(legend);
      let input;
      if(choices){
        const balanced=key==='first_operation'&&expected!=='multiply_add'?choices.filter(op=>op!=='multiply_add'):choices;
        const rotation=(problem.index+index)%balanced.length;
        const arranged=balanced.slice(rotation).concat(balanced.slice(0,rotation));
        arranged.forEach(value=>{
          const option=node('label'), radio=node('input');
          radio.type='radio';radio.name='solution';radio.value=value;radio.required=true;
          option.append(radio,document.createTextNode(text(value)));
          fieldset.append(option);
        });
      }else{
        input=node('input');input.type='text';input.required=true;input.inputMode='numeric';input.maxLength=8;
        input.setAttribute('aria-label',label+' '+problem.unit);fieldset.append(input,node('span',' '+problem.unit));
      }
      const validate=node('button','Comprobar paso');
      validate.type='submit';validate.className='primary-btn';
      const feedback=node('p');
      feedback.setAttribute('role','status');
      form.append(fieldset,validate,feedback);
      controls.replaceChildren(position,form);
      form.onsubmit=event=>{
        event.preventDefault();
        if(checked||stopped)return;
        const raw=input?input.value.trim():form.querySelector('input:checked')?.value;
        if(input&&!/^\d{1,8}$/.test(raw)){feedback.textContent='Escribe un número entero.';return;}
        if(!raw)return;
        checked=true;
        const ok=(input?Number(raw):raw)===expected;
        results[key]=ok;
        feedback.textContent=ok?'Correcto. '+text(expected)+'.':'Para este paso, la respuesta es '+text(expected)+'.';
        fieldset.disabled=true;validate.disabled=true;
        const next=node('button',index===steps.length-1?'Ver resultado':'Continuar');
        next.type='button';next.className='secondary-btn math-step-next';
        next.onclick=()=>{
          if(stopped)return;
          if(index<steps.length-1){
            index++;render();controls.querySelector('input')?.focus();return;
          }
          stopped=true;next.disabled=true;
          const correct=Object.values(results).filter(Boolean).length;
          onFinish(correct===steps.length,`${correct} de ${steps.length} pasos correctos. Resultado final: ${text(problem.answer)} ${problem.unit}.`,{
            schema:measurement,modality:'math_problem_steps',definition_version:1,
            scoring:'first_response_each_step',variant:item.qualityDescriptor.scenarioFamily,support:problem.support,
            hint_used:hintUsed,steps:results
          });
        };
        form.append(next);next.focus();
      };
    }
    const known=node('p','Lee el enunciado. Identifica las cantidades que ya conoces y empieza por el dato que falta.');
    known.className='math-known';visual.prepend(known);
    render();
    return ()=>{stopped=true;};
  }
  root.MathProblemRenderer={mount};
})(window);

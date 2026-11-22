(function(root){
  'use strict';
  const operationLabels={...root.Curriculum.problemOperations,multiply_add:'Multiplicar y sumar el envío'};
  const measurement='gliax.exercise-metrics.v1';

  function mountLegacy(item,{visual,area,onFinish}){
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
  const operationReasons={
    add:'Reunir cantidades expresadas en la misma unidad',
    subtract:'Encontrar lo que queda o la diferencia en el orden indicado',
    multiply:'Combinar grupos iguales o aplicar un factor a una cantidad',
    divide:'Repartir un total u obtener una cantidad por unidad'
  };
  const operationHints={
    add:'Busca si las dos cantidades forman juntas un total.',
    subtract:'Distingue el punto de partida de la cantidad que se quita o se compara.',
    multiply:'Una cantidad indica cuántas veces se aplica la otra o qué parte de ella se toma.',
    divide:'Identifica el total y la cantidad que indica los grupos, su tamaño o la unidad de referencia.'
  };
  const unknownStrategy='No puedo verificar automáticamente esta estrategia. Puedes revisarla con tu profesional o usar los pasos guiados.';
  const modelTitles={
    part:'Parte y todo',difference:'Comparación de cantidades',flow:'Dependencias entre cantidades',
    groups:'Grupos del mismo tamaño',share:'Reparto y capacidad',fraction:'Fracción de una cantidad',
    rate:'Relación proporcional',table:'Tabla de datos',graph:'Evolución de los datos',equation:'Relación algebraica'
  };
  const modelDescriptions={
    part:'El total se divide en las dos partes de abajo.',difference:'Compara las cantidades y la diferencia indicada.',
    flow:'Cada dato obtenido permite relacionar el anterior con el siguiente.',groups:'Cada grupo aporta la misma cantidad.',
    share:'Relaciona la cantidad disponible, el tamaño o número de grupos y el resultado del reparto.',
    fraction:'La fracción indica qué parte del total se utiliza.',rate:'Compara las cantidades con sus unidades para establecer la relación.',
    table:'Cada fila indica la medida y su unidad.',graph:'Las barras usan la misma escala y empiezan en cero.',
    equation:'Relaciona las cantidades de cada expresión antes de sustituir valores.'
  };
  const el=(tag,value,attrs={})=>{
    const node=document.createElement(tag);
    if(value!==undefined)node.textContent=value;
    for(const [key,v] of Object.entries(attrs))node.setAttribute(key,v);
    return node;
  };

  function mountSequence(item,{visual,area,onFinish}){
    root.Curriculum.validateMathProblem(item);
    const math=root.MathSequencing, p=item.problem, state=math.start(p);
    const controls=el('section',undefined,{class:'math-problem-steps math-sequence'});
    const notes=el('section',undefined,{class:'math-notes','aria-label':'Datos del problema'});
    const diagram=el('section',undefined,{class:'math-model','aria-label':'Representación matemática'});
    const resultRows=[];
    let phase='reading',plan=null,selection=null,standaloneHints=[],standaloneAttempts=0,phaseHints=0,active=false,stopped=false;
    let readingRecord,interpretationRecord;
    const factText=f=>math.format(f.value)+' '+f.unit;
    const lookup=id=>state.available[id]||state.paths.flatMap(route=>route.steps).find(n=>n.id===id);
    const statementNeedsTable=['graph','table'].includes(p.model.type)&&/^La tabla/.test(item.stimulus[0].text);
    const button=(label,action,primary=false)=>{
      const b=el('button',label,{type:'button',class:primary?'primary-btn':'secondary-btn'});
      b.onclick=()=>{if(!stopped&&active)action();};
      return b;
    };
    const showFormula=(n,includeAnswer=false)=>{
      const value=math.calculate(n.op,state.available[n.left].value,state.available[n.right].value);
      return math.format(state.available[n.left].value)+' '+math.operators[n.op]+' '+math.format(state.available[n.right].value)+
        (includeAnswer?' = '+math.format(value)+' '+n.unit:'');
    };

    function renderDiagram(){
      const model=p.model, {type,refs}=model;
      diagram.replaceChildren(el('h4',modelTitles[type]),el('p',modelDescriptions[type]));
      if(model.relation)diagram.append(el('p',model.relation,{class:'math-relation'}));
      const rows=refs.map(lookup).filter(Boolean);
      if(type==='part'||type==='difference'){
        const bar=el('div',undefined,{class:'math-diagram-bar'});
        const slot=(value,reference)=>{
          const f=el('span',reference.label+' · '+(reference.value?factText(reference):'?'),{class:reference.value?'math-bar':'math-bar unknown'});
          if(value>0)f.style.flexGrow=String(value);
          return f;
        };
        if(rows.length===3){
          const [first,second,third]=rows;
          const total=type==='part'?first:third;
          const segments=type==='part'?[second,third]:[first,second];
          const scaled=segments.every(f=>f.value&&f.unit===total.unit&&f.value[0]>0);
          const top=slot(0,total);top.classList.add('math-whole');
          bar.append(top);
          for(const f of segments)bar.append(slot(scaled?f.value[0]/f.value[1]:0,f));
          diagram.append(bar);
          if(!scaled)diagram.append(el('small','Esquema sin escala. El signo ? indica una cantidad pendiente.'));
          return;
        }
      }
      if(type==='groups'&&rows.length===3&&rows[0].value){
        const [count,each,total]=rows, n=count.value[0]/count.value[1];
        if(Number.isInteger(n)&&n>0&&n<=14){
          const bar=el('div',undefined,{class:'math-equal-groups','aria-hidden':'true'});
          for(let i=0;i<n;i++)bar.append(el('span',each.value?math.format(each.value):'?'));
          diagram.append(bar,el('p',`${factText(count)} · ${each.label}: ${each.value?factText(each):'?'} · ${total.label}: ${total.value?factText(total):'?'}`));
          return;
        }
      }
      if(type==='fraction'&&rows[1]?.value){
        const fraction=rows[1].value, bar=el('div',undefined,{class:'math-fraction-bar','aria-hidden':'true'});
        const width=100*fraction[0]/fraction[1];
        const part=el('span');
        part.style.inlineSize=width+'%';
        bar.append(part);diagram.append(bar);
      }
      if(type==='graph'&&rows.every(f=>f.value&&f.value[0]>=0&&f.unit===rows[0].unit)){
        const max=Math.max(...rows.map(f=>f.value[0]/f.value[1]));
        const graph=el('div',undefined,{class:'math-data-graph','aria-hidden':'true'});
        for(const f of rows){
          const row=el('div',undefined,{class:'math-graph-row'});
          const track=el('div',undefined,{class:'math-graph-track'});
          const bar=el('span');
          bar.style.inlineSize=(100*(f.value[0]/f.value[1])/max)+'%';
          track.append(bar);
          row.append(el('strong',f.label),track,el('small',factText(f)));
          graph.append(row);
        }
        diagram.append(graph);
      }
      const table=el('table'),caption=el('caption','Cantidades del modelo'),body=el('tbody');
      table.append(caption,body);
      for(const f of rows){
        const tr=el('tr');tr.append(el('th',f.label,{scope:'row'}),el('td',f.value?factText(f):'Pendiente'));
        body.append(tr);
      }
      diagram.append(table);
    }
    function renderNotes(){
      if(phase==='reading')return;
      const list=el('dl');
      for(const f of Object.values(state.available))list.append(el('dt',f.label),el('dd',factText(f)));
      const details=el('details');
      if(item.level===1&&phase!=='calculation')details.open=true;
      details.append(el('summary','Datos disponibles · '+Object.keys(state.available).length),list);
      notes.replaceChildren(details);
    }

    function newRow(){
      return {position:resultRows.length+1,operation:null,selection_first_correct:false,selection_attempts:0,order_errors:0,
        planning_attempts:0,planning_first_correct:false,selection_correct:false,justification_attempts:0,
        justification_first_correct:false,justification_correct:false,calculation_first_correct:false,
        calculation_attempts:0,calculation_correct:false,hints:[],guided:false};
    }
    let row=newRow();
    function phaseInfo(){
      const label={reading:'Comprensión',plan:'Planificación',operation:'Elección de operación',justify:'Justificación',calculation:'Cálculo',answer:'Interpretación'};
      return phase==='reading'||phase==='answer'?label[phase]:`Operación ${row.position} · ${label[phase]}`;
    }
    function phaseRecord(){
      return ['reading','answer'].includes(phase)?standaloneHints:row.hints;
    }
    function transition(next){
      phase=next;phaseHints=0;
      if(next==='answer'){standaloneHints=[];standaloneAttempts=0;}
      render(true);
    }
    function applyOperation(){
      math.advance(state,selection.node,selection.expected);
      resultRows.push({...row,operation:selection.node.op,objective:selection.node.label});
      plan=null;selection=null;row=newRow();
      transition(p.goals.every(id=>state.available[id])?'answer':'plan');
    }
    function choose(n){
      plan=n.id;
      transition('operation');
    }
    function selectOperation(result){
      row.selection_correct=!row.hints.some(h=>h.phase==='operation'&&h.level===4);
      selection=result;
      transition(item.level===3?'justify':'calculation');
    }
    function explain(stage){
      const n=math.ready(state).find(op=>op.id===plan)||math.ready(state)[0];
      if(stage==='reading')return 'Datos necesarios: '+Object.entries(p.data).filter(([id])=>id!=='distractor'&&!p.optional.includes(id)).map(([,f])=>f.label).join(', ')+'.';
      if(stage==='plan')return 'Un objetivo posible ahora es «'+n.label+'». Sus cantidades ya están disponibles.';
      if(stage==='operation')return n.label+': '+showFormula(n)+'. '+operationReasons[n.op]+'.';
      if(stage==='justify')return operationReasons[selection.node.op]+'.';
      if(stage==='calculation')return selection.node.label+': '+showFormula(selection.node,true)+'.';
      return math.solution(p,state.available).map(f=>f.label+': '+factText(f)+'.').join(' ')+
        (p.interpretation?' '+p.interpretation.choices[0]+'.':'');
    }
    function guidedAdvance(){
      if(phase==='reading'){readingRecord={attempts:standaloneAttempts,first_correct:false,hints:standaloneHints,guided:true};transition('plan');return;}
      if(phase==='answer'){finish(false,true);return;}
      row.guided=true;
      if(phase==='plan'){choose(math.ready(state)[0]);return;}
      if(phase==='operation'){
        const n=math.ready(state).find(op=>op.id===plan);
        selectOperation(math.check(state,plan,n.op,n.left,n.right));return;
      }
      if(phase==='justify'){transition('calculation');return;}
      applyOperation();
    }
    function addScaffold(form,feedback,field,verify){
      const tools=el('div',undefined,{class:'math-actions'});
      const help=button('Pedir ayuda',()=>{
        phaseHints++;
        phaseRecord().push({phase,level:phaseHints});
        const conceptual={
          reading:'Distingue las cantidades que afectan la pregunta de los detalles de contexto.',
          plan:'Busca un dato necesario que puedas obtener con lo que ya sabes.',
          operation:'Piensa qué relación permite pasar de los datos conocidos al objetivo de este paso.',
          justify:'Explica qué relación representa la operación para el objetivo que elegiste.',
          calculation:'Revisa el orden de los operandos y la unidad esperada.',
          answer:'Vuelve a leer qué pide la pregunta y en qué unidad se expresa.'
        };
        const n=math.ready(state).find(op=>op.id===plan)||math.ready(state)[0];
        const relations={
          reading:'Revisa las unidades y decide cuáles intervienen en las relaciones del enunciado.',
          plan:'Los datos de este objetivo deben estar en «Datos disponibles».',
          operation:n?operationHints[n.op]+' Revisa «'+lookup(n.left).label+'» y «'+lookup(n.right).label+'».':'Revisa el significado de las cantidades.',
          justify:selection?operationHints[selection.node.op]:'Relaciona los operandos con el objetivo elegido.',
          calculation:'Conserva el valor exacto. Puedes escribir una fracción si el decimal no termina.',
          answer:p.interpretation?'El cociente del cálculo y la cantidad permitida por el contexto pueden ser distintos.':'Usa el dato o los datos obtenidos que responden a la pregunta final.'
        };
        if(phaseHints<3){feedback.textContent=(phaseHints===1?conceptual:relations)[phase];return;}
        if(phaseHints===3){diagram.hidden=false;feedback.textContent='Modelo disponible en el enunciado. Revisa las relaciones representadas.';help.textContent='Ver explicación guiada';return;}
        feedback.textContent=explain(phase);help.disabled=true;field.disabled=true;verify.disabled=true;
        const next=button('Continuar con esta explicación',guidedAdvance,true);
        tools.append(next);next.focus();
      });
      tools.append(verify,help);
      form.append(tools,feedback);
    }

    function options(field,label,variants,initial=''){
      const select=el('select',undefined,{'aria-label':label,required:''});
      select.append(el('option',label,{value:'',disabled:''}));
      for(const [value,label] of variants)select.append(el('option',label,{value}));
      select.value=initial;
      field.append(select);
      return select;
    }
    function radios(field,choices,name){
      const sorted=choices.slice();
      const offset=(item.level+Number(item.contentKey.at(-1))+row.position)%sorted.length;
      sorted.push(...sorted.splice(0,offset));
      for(const [value,label] of sorted){
        const radio=el('input',undefined,{type:'radio',name,value,required:''});
        const option=el('label');option.append(radio,document.createTextNode(label));field.append(option);
      }
      return ()=>field.querySelector('input:checked')?.value;
    }
    function composeForm(field,feedback){
      if(phase==='reading'){
        field.append(el('legend','¿Qué datos necesitas para resolver el problema?'));
        for(const [id,f] of Object.entries(p.data)){
          const label=el('label');
          label.append(el('input',undefined,{type:'checkbox',value:id}),document.createTextNode(f.label+' · '+factText(f)));
          field.append(label);
        }
        return ()=>{
          const included=new Set([...field.querySelectorAll('input:checked')].map(input=>input.value));
          standaloneAttempts++;
          if(included.has('distractor')||Object.keys(p.data).some(id=>id!=='distractor'&&!p.optional.includes(id)&&!included.has(id))){
            feedback.textContent='Revisa qué datos intervienen en lo que se pregunta. Puedes ajustar tu selección.';return;
          }
          readingRecord={attempts:standaloneAttempts,first_correct:standaloneAttempts===1,hints:standaloneHints,guided:false};
          transition('plan');
        };
      }
      if(phase==='plan'){
        field.append(el('legend','¿Qué dato quieres obtener ahora?'));
        const targets=math.goals(state).map(n=>[n.id,n.label]);
        if(targets.length===1)targets.push(['repeat','Volver a usar un dato que ya conocemos como respuesta']);
        const value=radios(field,targets,'goal');
        return ()=>{
          row.planning_attempts++;
          const n=math.ready(state).find(op=>op.id===value());
          if(!n){row.order_errors++;feedback.textContent='Ese objetivo todavía necesita otro dato o ya está disponible.';return;}
          row.planning_first_correct=row.planning_attempts===1;
          choose(n);
        };
      }
      if(phase==='operation'){
        field.append(el('legend','Elige la operación para «'+lookup(plan).label+'»'));
        const n=math.ready(state).find(op=>op.id===plan);
        let selected;
        if(item.level===1){
          const candidates=Object.keys(math.operators)
            .filter(op=>op!=='divide'||state.available[n.right].value[0]!==0)
            .map(op=>[op,`${math.format(state.available[n.left].value)} ${math.operators[op]} ${math.format(state.available[n.right].value)}`]);
          const value=radios(field,candidates,'operation');
          selected=()=>math.check(state,plan,value(),n.left,n.right);
        }else{
          const builder=el('div',undefined,{class:'math-operation-builder'});
          field.append(builder);
          const facts=Object.entries(state.available).map(([id,f])=>[id,f.label+' · '+factText(f)]);
          const a=options(builder,'Primera cantidad',facts),op=options(builder,'Operación',Object.entries(math.names)),b=options(builder,'Segunda cantidad',facts);
          selected=()=>math.check(state,plan,op.value,a.value,b.value);
        }
        return ()=>{
          const verdict=selected();
          if(verdict.kind==='unverifiable'){feedback.textContent=unknownStrategy;return;}
          row.selection_attempts++;
          if(verdict.kind!=='valid'){
            if(verdict.kind==='order')row.order_errors++;
            feedback.textContent=verdict.kind==='order'?'Todavía falta obtener una de esas cantidades.':'Esa operación no obtiene el dato que has elegido. Revisa la relación y el orden.';
            return;
          }
          row.selection_first_correct=row.selection_attempts===1;
          selectOperation(verdict);
        };
      }
      if(phase==='justify'){
        field.append(el('legend','¿Por qué sirve esta operación para el objetivo elegido?'),el('p',showFormula(selection.node),{class:'math-expression'}));
        const value=radios(field,Object.entries(operationReasons),'justification');
        return ()=>{
          row.justification_attempts++;
          if(value()!==selection.node.op){
            feedback.textContent='Revisa qué relación hay entre esas cantidades y el dato que buscas.';return;
          }
          row.justification_correct=true;
          row.justification_first_correct=row.justification_attempts===1;
          transition('calculation');
        };
      }
      if(phase==='calculation'){
        field.append(el('legend','Calcula '+selection.node.label.toLowerCase()),el('p',showFormula(selection.node),{class:'math-expression'}));
        const input=el('input',undefined,{type:'text','aria-label':'Resultado de la operación',maxlength:'24',required:''});
        field.append(input,el('span',selection.node.unit,{class:'math-input-unit'}));
        return ()=>{
          const value=math.parse(input.value);
          if(!value){feedback.textContent='Escribe un entero, un decimal con coma o una fracción como 7/3.';return;}
          row.calculation_attempts++;
          if(!math.eq(value,selection.expected)){feedback.textContent='El cálculo todavía no coincide. Revisa las cantidades y vuelve a intentarlo.';return;}
          row.calculation_correct=true;row.calculation_first_correct=row.calculation_attempts===1;
          applyOperation();
        };
      }
      field.append(el('legend','Responde a la pregunta original'));
      const expected=math.solution(p,state.available);
      const answers=expected.map(f=>{
        const label=el('label',f.label+' ('+f.unit+')');
        const input=el('input',undefined,{type:'text',required:'',maxlength:'24','aria-label':f.label+' ('+f.unit+')'});
        label.append(input);field.append(label);
        return input;
      });
      let justify;
      if(p.interpretation||item.level===3){
        const solved=expected.map(f=>f.label).join(' y ');
        const intermediate=state.used.find(n=>!p.goals.includes(n.id));
        const alternatives=p.interpretation?.choices||[solved,intermediate?.label||'El número de pasos',
          Object.values(p.data)[0].label];
        const tagged=alternatives.map((label,i)=>[String(i),label]);
        const shift=(Number(item.contentKey.at(-1))+item.level+1)%tagged.length;
        justify=options(field,'¿Qué representa el resultado?',tagged.slice(shift).concat(tagged.slice(0,shift)));
      }
      return ()=>{
        const values=answers.map(input=>math.parse(input.value));
        if(values.some(v=>!v)){feedback.textContent='Completa los resultados con un entero, un decimal o una fracción.';return;}
        standaloneAttempts++;
        if(expected.some((f,i)=>!math.eq(f.value,values[i]))||justify&&justify.value!=='0'){
          feedback.textContent='Vuelve a comprobar qué cantidad se pide y cómo se interpreta en esta situación.';return;
        }
        finish(true,false);
      };
    }

    function render(focus=false){
      renderNotes();
      renderDiagram();
      diagram.hidden=!statementNeedsTable&&!row.hints.some(h=>h.level>=3)&&!standaloneHints.some(h=>h.level>=3);
      const title=el('h3',phaseInfo(),{class:'math-step-position',tabindex:'-1'});
      const form=el('form'),field=el('fieldset');
      const feedback=el('p',undefined,{role:'status',class:'math-step-feedback'});
      const verify=el('button','Comprobar paso',{type:'submit',class:'primary-btn'});
      const check=composeForm(field,feedback);
      form.onsubmit=event=>{event.preventDefault();if(active&&!stopped)check();};
      form.append(field);
      addScaffold(form,feedback,field,verify);
      controls.replaceChildren(title,form);
      if(phase==='operation'){
        const free=el('details',undefined,{class:'math-free'});
        const input=el('input',undefined,{type:'text',maxlength:'40','aria-label':'Operación alternativa'});
        free.append(el('summary','Proponer otra operación'),el('p','Escribe una operación usando cantidades de este problema, por ejemplo con × o ÷.'),input,
          button('Revisar propuesta',()=>{
            const result=math.checkExpression(state,plan,input.value);
            if(result.kind==='unverifiable'){
              feedback.textContent=unknownStrategy;
              return;
            }
            row.selection_attempts++;row.selection_first_correct=row.selection_attempts===1;
            selectOperation(result);
          }));
        controls.append(free,button('Cambiar objetivo',()=>transition('plan')));
      }
      if(!statementNeedsTable){
        controls.append(button(diagram.hidden?'Mostrar representación':'Ocultar representación',()=>{
          diagram.hidden=!diagram.hidden;
          if(!diagram.hidden){
            const record=phaseRecord();
            if(!record.some(h=>h.phase===phase&&h.level===3))record.push({phase,level:3});
          }
          controls.lastElementChild.textContent=diagram.hidden?'Mostrar representación':'Ocultar representación';
        }));
      }
      if(focus)title.focus();
    }
    function finish(correct,guided){
      interpretationRecord={correct,first_correct:correct&&standaloneAttempts===1,attempts:standaloneAttempts,hints:standaloneHints,guided};
      stopped=true;
      const route=state.paths[0].id;
      const operations=resultRows.map(record=>({...record,strategy:route,
        autonomous:!record.guided&&!record.hints.length}));
      const independentlySelected=operations.filter(r=>r.selection_correct&&!r.hints.some(h=>['plan','operation'].includes(h.phase)));
      const independentlyCalculated=operations.filter(r=>r.calculation_correct&&!r.hints.some(h=>h.phase==='calculation'));
      const autonomousSelection=independentlySelected.length,autonomousCalculation=independentlyCalculated.length;
      const supported=operations.some(r=>!r.autonomous)||readingRecord.hints.length>0||interpretationRecord.hints.length>0;
      const metrics={schema:measurement,modality:'math_problem_steps',definition_version:2,scoring:'independent_operation_reasoning',
        level:item.level,complexity:p.complexity,family:p.family,strategy:route,operation_count:operations.length,completed:true,
        operations,comprehension:readingRecord,interpretation:interpretationRecord,
        interpretation_correct:correct,unassisted_selections:autonomousSelection,unassisted_calculations:autonomousCalculation,
        first_try_unassisted_selections:independentlySelected.filter(r=>r.selection_first_correct).length,
        first_try_unassisted_calculations:independentlyCalculated.filter(r=>r.calculation_first_correct).length,support_used:supported};
      const solutions=math.solution(p,state.available).map(f=>f.label+': '+factText(f)).join(' · ');
      controls.replaceChildren(el('h3','Resolución completada'),el('p',solutions),
        el('p',`${autonomousSelection} de ${operations.length} operaciones elegidas sin ayudas · ${autonomousCalculation} cálculos correctos sin ayudas.`));
      onFinish(correct,correct?'Interpretación correcta.':'Interpretación revisada con ayuda.',metrics);
    }

    visual.append(notes,diagram);
    area.replaceChildren(controls);
    active=true;render();
    return ()=>{active=false;stopped=true;};
  }
  root.MathProblemRenderer={mount:(item,options)=>item.mathVersion===2?mountSequence(item,options):mountLegacy(item,options)};
})(window);

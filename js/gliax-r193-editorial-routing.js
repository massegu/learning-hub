(function(root){
  'use strict';
  const {fingerprint,shuffled,outcome}=typeof module!=='undefined'?require('./gliax-r192'):root.GliaxR192;
  const records=typeof module!=='undefined'?require('./gliax-r193-editorial-routing-data'):root.GliaxR193EditorialRoutingData;
  const byId=new Map(records.map(record=>[record.id,record]));
  const predicates=['es un círculo','es roja','tiene borde'];
  const action=value=>value==='W'?'espera sin pulsar A ni B':'pulsa '+value;

  function clauses(expression,conditions=[]){
    if(!Array.isArray(expression))return [conditions.length?'Si '+conditions.join(' y ')+', '+action(expression)+'.':action(expression)+'.'];
    const [axis,yes,no]=expression;
    return [...clauses(yes,[...conditions,predicates[axis]]), ...clauses(no,[...conditions,'no '+predicates[axis]])];
  }

  function resolve(expression,mask){
    let next=expression;
    while(Array.isArray(next))next=next[(mask&(1<<next[0]))?1:2];
    return next;
  }

  function masks(expression){
    const set=new Set();
    function inspect(expr){
      if(Array.isArray(expr)){set.add(expr[0]);inspect(expr[1]);inspect(expr[2]);}
    }
    inspect(expression);
    const columns=[...set].reduce((mask,axis)=>mask|(1<<axis),0);
    return Array.from({length:8},(_,i)=>i).filter(i=>(i&columns)===i);
  }
  function build(record,seed){
    const {id,ageBand,level,direct,revised,signature}=record;
    const first=clauses(direct).join(' ');
    const after=clauses(revised).join(' ');
    const prompt='Regla inicial. '+first+' Cuando veas «Nueva regla», aplica esta regla: '+after;
    const events=[];
    function block(expression,mode){
      for(const mask of shuffled(masks(expression),seed,id+':'+mode)){
        const stimulus={form:mask&1?'círculo':'cuadrado',color:mask&2?'rojo':'azul',border:Boolean(mask&4)};
        const label=stimulus.form+' '+stimulus.color+(stimulus.border?' con borde':'');
        events.push({id:'event-'+(events.length+1),type:'trial',mask,mode,stimulus,label});
      }
    }
    block(direct,'initial');
    events.push({id:'event-'+(events.length+1),type:'signal',label:'Nueva regla'});
    block(revised,'revised');
    const presentation={prompt,events};
    const answerModel={mode:'trial_state_machine',stimuli:events.filter(e=>e.type==='trial').map(e=>e.stimulus),
      rule:{initial:'form',maps:{form:{círculo:'A',cuadrado:'B'}}},
      expressions:{initial:direct,revised},
      measuresWithholding:events.some(e=>e.type==='trial'&&resolve(e.mode==='initial'?direct:revised,e.mask)==='W')};
    const mechanism='cambio-de-regla-compuesta-'+String(clauses(direct).length)+'-'+String(clauses(revised).length)+
      (answerModel.measuresWithholding?'-con-excepcion':'');
    return {id,family:'AR',ageBand,level,mechanic:mechanism,construct:'ruleRouting',mechanismContext:'formas-colores-bordes',
      editorial:true,routingEditorial:true,presentation,answerModel,contentVersion:'r19.3-editorial-5',
      gradingVersion:'r19.3-editorial-5',cognitiveFingerprint:fingerprint(['AR',signature]),
      surfaceFingerprint:fingerprint(presentation)};
  }
  function trials(item){
    const {expressions}=item.answerModel;
    return item.presentation.events.filter(event=>event.type==='trial').map(event=>({
      id:event.id,label:event.label,expected:resolve(expressions[event.mode],event.mask)
    }));
  }
  function grade(item,response){
    const observed=trials(item);
    if(!response||!observed.every(event=>Object.hasOwn(response,event.id)))return outcome('pending_review');
    const missed=observed.filter(event=>(response[event.id]??'W')!==event.expected);
    const first=missed[0];
    const feedback=first?'Para '+first.label+', con la regla vigente correspondía '+action(first.expected)+'.':
      'Aplicaste las dos reglas. La señal de cambio quedó fuera del recuento.';
    return {...outcome(missed.length?'incorrect':'correct'),feedback,
      metrics:{scored:observed.length,correct:observed.length-missed.length}};
  }

  const api={ids:()=>[...byId.keys()],get:(id,seed)=>byId.has(id)?build(byId.get(id),seed):null,
    pool:({family,ageBand,level,seed})=>family==='AR'?records.filter(r=>r.ageBand===ageBand&&r.level===level).map(r=>build(r,seed)):[],
    grade,trials};
  root.GliaxR193EditorialRouting=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);

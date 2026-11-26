(function (root) {
  'use strict';
  const core=typeof module!=='undefined'?require('./gliax-r192'):root.GliaxR192;
  const data=typeof module!=='undefined'?require('./gliax-r193-editorial-plan-data'):root.GliaxR193EditorialPlanData;
  const {fingerprint,shuffled,outcome}=core;
  const records=new Map(data.map(record=>[record.id,record]));

  function meets(order,[kind,a,b]){
    const first=order.indexOf(a);
    if(kind==='starts')return first<b;
    if(kind==='ends')return first>=order.length-b;
    const second=order.indexOf(b);
    if(kind==='before')return first<second;
    if(kind==='next')return second-first===1;
    if(kind==='apart')return Math.abs(first-second)>1;
    if(kind==='together')return Math.abs(first-second)===1;
    return false;
  }

  function validOrder(order,size){
    return Array.isArray(order)&&order.length===size&&new Set(order).size===size&&
      order.every(value=>Number.isInteger(value)&&value>=0&&value<size);
  }

  function ruleLabel([kind,a,b],steps){
    if(kind==='starts')return steps[a]+(b===1?' va en primer lugar.':' va entre los primeros '+b+' pasos.');
    if(kind==='ends')return steps[a]+(b===1?' va en último lugar.':' va entre los últimos '+b+' pasos.');
    if(kind==='before')return steps[a]+' va antes de '+steps[b].toLocaleLowerCase('es')+'.';
    if(kind==='next')return steps[b]+' va justo después de '+steps[a].toLocaleLowerCase('es')+'.';
    if(kind==='apart')return steps[a]+' y '+steps[b].toLocaleLowerCase('es')+' no van seguidos.';
    return steps[a]+' y '+steps[b].toLocaleLowerCase('es')+' van seguidos, en cualquier orden.';
  }

  function build(record,seed){
    const {id,family,ageBand,level,context,mechanic,steps,rules,structure,observed,previous}=record;
    const isReview=family==='supervision';
    const controls=rules.map((rule,index)=>({id:'r'+index,label:ruleLabel(rule,steps)}));
    const proposed=observed?.map(i=>steps[i]).join(' → ');
    const oldPlan=previous?.map(i=>steps[i]).join(' → ');
    const prompt=family==='CP'?'Actualiza el plan con la condición nueva.':
      isReview?'Marca todas las condiciones que incumple el plan.':'Ordena los pasos para cumplir todas las condiciones.';
    const presentation={prompt,context,previous:oldPlan??null,observed:proposed??null,
      rules:controls,steps:shuffled(steps.map((label,index)=>({id:String(index),label})),seed,id+':steps')};
    return {id,family,ageBand,level,mechanic,mechanismContext:context,construct:mechanic,editorial:true,planEditorial:true,
      contentVersion:'r19.3-editorial-2',gradingVersion:'r19.3-editorial-2',
      cognitiveFingerprint:fingerprint([family,structure]),surfaceFingerprint:fingerprint(presentation),presentation,
      answerModel:{mode:isReview?'constraint_audit':'sequence_constraints',rules,observed:observed??null,stepCount:steps.length}};
  }

  function grade(item,response){
    const {mode,rules,observed,stepCount}=item.answerModel;
    if(mode==='constraint_audit'){
      const violations=rules.map((rule,index)=>meets(observed,rule)?null:'r'+index).filter(Boolean);
      const exact=Array.isArray(response)&&response.length===violations.length&&violations.every(id=>response.includes(id));
      const labels=item.presentation.rules.filter(rule=>violations.includes(rule.id)).map(rule=>rule.label);
      return {...outcome(exact?'correct':'incorrect'),
        feedback:labels.length?'Las condiciones incumplidas son: '+labels.join(' '):'El plan cumple todas las condiciones.'};
    }
    if(!Array.isArray(response)||!response.every(step=>/^[0-5]$/.test(step)))return outcome('incorrect');
    const order=response.map(Number);
    if(!validOrder(order,stepCount))return outcome('incorrect');
    const violations=rules.map((rule,index)=>meets(order,rule)?null:item.presentation.rules[index].label).filter(Boolean);
    return {...outcome(violations.length?'incorrect':'correct'),
      feedback:violations.length?'Comprueba esta condición: '+violations[0]:
        'El orden cumple todas las condiciones, incluida: '+item.presentation.rules.at(-1).label};
  }
  const ids=()=>[...records.keys()];
  const get=(id,seed)=>records.has(id)?build(records.get(id),seed):null;
  const pool=({family,ageBand,level,seed})=>data.filter(record=>record.family===family&&record.ageBand===ageBand&&record.level===level)
    .map(record=>build(record,seed));
  const api={ids,get,pool,grade,meets};
  root.GliaxR193EditorialPlans=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);

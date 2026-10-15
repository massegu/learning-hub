(function(root){
  'use strict';
  const stages=root.AgeStages || (typeof require==='function'&&require('./age-stages'));
  const all={language:{title:'Lenguaje',icon:'pencil'},division:{title:'Matemáticas',icon:'apple'},reading:{title:'Lectura',icon:'book'},attention:{title:'Atención',icon:'star'},memory:{title:'Memoria',icon:'gift'},executive:{title:'Funciones ejecutivas',icon:'backpack'},speedReasoning:{title:'Velocidad y razonamiento',icon:'triangle'},applied:{title:'Cognición aplicada',icon:'bottle'},geometry:{title:'Geometría',icon:'square'},english:{title:'English Lab',icon:'book'},literacy:{title:'Lectura y escritura',icon:'notebook'}};
  const missions=[{id:'words',title:'Palabras en acción',plan:['language','language','language']},{id:'detective',title:'Encuentra las pistas',plan:['attention','reading','attention']},{id:'build',title:'Prepara y resuelve',plan:['division','executive','applied']},{id:'mixed',title:'Combina tus habilidades',plan:['language','memory','division','attention','applied']}];
  const forMissions=profile=>missions.map(m=>({...m,plan:m.plan.map(d=>stages.route(profile)==='primary'&&d==='reading'?'literacy':d)}));
  const definition=(id,profile)=>forMissions(profile).find(m=>m.id===id);
  const forProfile=p=>['junior','primary'].includes(stages.route(p))?stages.forProfile(p):null;
  function normalize(value){
    const active=value?.active,mission=definition(active?.id);
    return {active:mission&&Number.isInteger(active.index)&&active.index>=0&&active.index<mission.plan.length?{...active,answeredIds:Array.isArray(active.answeredIds)?active.answeredIds.slice(0,5):[]}:null,completed:Array.isArray(value?.completed)?value.completed.filter(x=>x&&definition(x.id)).slice(-30):[]};
  }
  function start(value,id){const state=normalize(value);if(state.active)return state;if(!definition(id))throw new Error('Misión desconocida.');return {...state,active:{id,index:0,answeredIds:[]}};}
  function record(value,domain,itemId,profile){
    const state=normalize(value),a=state.active,m=definition(a?.id,profile);
    if(!a||m.plan[a.index]!==domain||a.answeredIds.includes(itemId))return state;
    const next={...a,index:a.index+1,answeredIds:[...a.answeredIds,itemId]};
    return next.index<m.plan.length?{...state,active:next}:{active:null,completed:[...state.completed,{id:m.id,activities:m.plan.length,at:new Date().toISOString()}].slice(-30)};
  }
  const api={all,missions,forMissions,definition,forProfile,normalize,start,record};root.SchoolJourney=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

(function(root){
  'use strict';
  const areas={
    language:{title:'Lenguaje',theme:'Palabras',icon:'pencil',description:'Juega con las palabras.'},
    reading:{title:'Lectura',theme:'Historias',icon:'book',description:'Descubre historias cortas.'},
    division:{title:'Matemáticas',theme:'Cantidades',icon:'apple',description:'Cuenta, junta y compara.'},
    attention:{title:'Atención',theme:'Detalles',icon:'star',description:'Mira y encuentra diferencias.'},
    memory:{title:'Memoria',theme:'Recuerdos',icon:'gift',description:'Mira, tapa y recuerda.'},
    executive:{title:'Funciones ejecutivas',theme:'Pasos y planes',icon:'backpack',description:'Piensa y ordena los pasos.'},
    speedReasoning:{title:'Velocidad y razonamiento',theme:'Pistas',icon:'triangle',description:'Busca parejas y sigue patrones.'},
    applied:{title:'Cognición aplicada',theme:'Cada día',icon:'bottle',description:'Resuelve pequeñas situaciones.'},
  };
  const missions=[
    {id:'words',title:'Explora las palabras',description:'Tres actividades de Lenguaje.',plan:['language','language','language'],icon:'pencil'},
    {id:'stories',title:'Descubre dos historias',description:'Lee y responde dos veces.',plan:['reading','reading'],icon:'book'},
    {id:'details',title:'Busca los detalles',description:'Tres retos de Atención.',plan:['attention','attention','attention'],icon:'star'},
    {id:'explore',title:'Una vuelta por el Lab',description:'Cinco actividades en cinco áreas.',plan:['language','division','attention','executive','applied'],icon:'backpack'},
  ];
  const definition=id=>missions.find(m=>m.id===id);
  function normalize(value){
    const active=value?.active,mission=definition(active?.id);
    return {active:mission && Number.isInteger(active.index) && active.index>=0 && active.index<mission.plan.length
      ? {...active,answeredIds:Array.isArray(active.answeredIds)?active.answeredIds.slice(0,mission.plan.length):[]}:null,
      completed:Array.isArray(value?.completed)?value.completed.filter(x=>x&&definition(x.id)).slice(-30):[]};
  }
  function start(value,id){
    const state=normalize(value),mission=definition(id);
    if(!mission)throw new Error('Misión desconocida.');
    if(state.active)return state; // Resume rather than discard unfinished work.
    return {...state,active:{id,index:0,answeredIds:[],startedAt:new Date().toISOString()}};
  }
  function record(value,subject,itemId){
    const state=normalize(value),active=state.active,mission=definition(active?.id);
    if(!active || mission.plan[active.index]!==subject || active.answeredIds.includes(itemId))return state;
    const next={...active,index:active.index+1,answeredIds:[...active.answeredIds,itemId]};
    if(next.index<mission.plan.length)return {...state,active:next};
    return {active:null,completed:[...state.completed,{id:active.id,at:new Date().toISOString(),activities:mission.plan.length}].slice(-30)};
  }
  function stats(history=[]){
    return Object.fromEntries(Object.keys(areas).map(domain=>{
      const results=history.filter(x=>x.subject===domain);
      return [domain,{attempts:results.length,correct:results.filter(x=>x.correct).length,firstExploration:Math.min(3,results.length)}];
    }));
  }
  const api={areas,missions,definition,normalize,start,record,stats};
  root.EarlyJourney=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

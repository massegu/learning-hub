(function(root){
  'use strict';
  const model=root.ActivityModel || (typeof require==='function'&&require('./activity-model'));
  const definitions={
    junior:{label:'8–10 años',minimumAttempts:8,promote:7/8,demote:3/8,words:[65,95,125],memory:[3,4,5],steps:[2,3,4],options:[3,3,4],theme:'workshop',title:'Tu taller de expediciones',description:'Construye habilidades, descubre pistas y completa misiones.'},
    primary:{label:'10–12 años',minimumAttempts:10,promote:9/10,demote:4/10,words:[65,100,140],memory:[4,5,6],steps:[3,4,5],options:[3,4,4],theme:'base',title:'Tu base de retos',description:'Elige tu siguiente objetivo y combina habilidades en una misión.'},
    middle:{label:'13–15 años',minimumAttempts:12,promote:10/12,demote:5/12,words:[100,180,260],memory:[5,6,7],steps:[4,5,6],options:[4,4,4],theme:'studio'},
  };
  const route=profile=>profile?.progress?.ageRoute || profile?.age_band;
  const forProfile=profile=>definitions[route(profile)]||null;
  function next(level,results,profile){
    const stage=forProfile(profile);if(!stage||results.length<stage.minimumAttempts)return level;
    const window=results.slice(-stage.minimumAttempts),correct=window.filter(x=>x.correct).length;
    if(correct/window.length>=stage.promote)return Math.min(3,level+1);
    if(correct/window.length<=stage.demote)return Math.max(1,level-1);
    return level;
  }
  function audit(item,profile,requestedLevel=1){
    const stage=forProfile(profile);if(!stage)return null;
    const level=Math.max(1,Math.min(3,Number(requestedLevel)||1)),index=level-1;
    const issues=[];
    let stimulus=item.stimulus || [item.scenario,item.text].filter(Boolean).map(text=>({type:'text',text}));
    if(item.stimulus===undefined){
      try{stimulus=model.printable(item,profile).stimulus;}catch(_){issues.push('unsupported-stimulus-projection');}
    }
    const strings=stimulus.flatMap(b=>b.type==='text'?[b.text]:b.type==='list'?b.items||[]:(b.rows||[]).flat());
    const wordCount=strings.join(' ').trim().split(/\s+/).filter(Boolean).length;
    const recall=(item.memoryContent||[]).length,steps=(item.answer&&Array.isArray(item.answer)?item.answer:item.tokens||[]).length;
    if(wordCount>stage.words[index])issues.push('reading-load');
    if(recall>stage.memory[index])issues.push('recall-load');
    if(steps>stage.steps[index])issues.push('step-load');
    if((item.opts||[]).length>stage.options[index])issues.push('option-load');
    if(item.level===undefined)issues.push('unverified-content-level');
    else if(Number(item.level)!==level)issues.push('content-level-mismatch');
    if(route(profile)==='junior' && /\b(?:hipoteca|factura|embarque|administrativ[oa])\b/iu.test(strings.join(' ')))issues.push('context-review');
    return {route:route(profile),requestedLevel:level,wordCount,recall,steps,issues};
  }
  const api={definitions,route,forProfile,next,audit};root.AgeStages=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

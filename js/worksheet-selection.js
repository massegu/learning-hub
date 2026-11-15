(function(root){
  'use strict';
  const model=root.ActivityModel || (typeof require==='function'&&require('./activity-model'));
  const message='No hay suficientes actividades imprimibles distintas para las áreas y el nivel seleccionados. Prueba con menos ejercicios o añade otra área.';
  function checked(item,profile,country,domain){
    return model.preparePrintable(item,profile,country,domain);
  }
  function compatible(item,profile,country,domain){
    try{checked(item,profile,country,domain);return true;}catch(_){return false;}
  }
  function key(item,projection){
    if(item.semanticKey)return item.semanticKey;
    // Remote IDs can change for the same problem. Distractor permutations and
    // known protagonist-name swaps are not additional printable problems.
    return JSON.stringify([projection.question,projection.stimulus,projection.tokens,item.a,item.answer,item.sample])
      .replace(/\b(?:Ana|Leo|Mar|Pau|Lola|Hugo|Nora|Dani|Sol)\b/g,'PERSONA');
  }
  async function collect({initial,profile,country,domains,count,fetchMore,maxStalledBatches=3}){
    if(!Array.isArray(domains)||!domains.length||!Number.isInteger(count)||count<1)throw new Error(message);
    const items=[],seen=new Set();let rejected=0,duplicates=0,batch=initial,round=0,stalled=0;
    while(true){
      const previousCount=items.length;
      if(!Array.isArray(batch?.items))throw new Error('El banco no ha entregado una lista de actividades.');
      for(let i=0;i<batch.items.length && items.length<count;i++){
        const candidate=batch.items[i],domain=candidate?.domain || candidate?.sourceDomain || candidate?.localization?.domain || domains[i%domains.length];
        let accepted;
        try{
          if(!domains.includes(domain))throw new Error('Área no seleccionada.');
          accepted=checked(candidate,profile,country,domain);
        }catch(_){rejected++;continue;}
        const identity=key(accepted.item,accepted.projection);
        if(seen.has(identity)){duplicates++;continue;}
        // Only a fully localized, age-safe, printable candidate is committed.
        seen.add(identity);items.push(accepted.item);
      }
      if(items.length===count)return {items,rejected,duplicates,replacementBatches:round};
      if(round>0)stalled=items.length===previousCount?stalled+1:0;
      if(batch.exhausted || !fetchMore || stalled>=maxStalledBatches)throw new Error(message);
      // Service errors (auth, subscription, quota, transport) propagate. Never
      // turn a denied request into a local replacement or an unbounded retry.
      batch=await fetchMore({missing:count-items.length,round:round+1});
      round++;
    }
  }
  const api={checked,compatible,key,collect,exhaustedMessage:message};
  root.WorksheetSelection=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

(function(root){
  'use strict';
  const interactionAges=new Set(['junior','primary','middle','teen']);
  const kinds={attention:['movement','auditory'],executive:['symbols','movement','auditory']};
  function forArea(profile,domain,level=1){
    const age=root.AgeStages.route(profile),eligible=interactionAges.has(age);
    const cognitive= root.CognitiveFamilies?.pool(age,domain,level)||[];
    const cognitiveItems=domain==='attention'?cognitive.filter(item=>item.cognitiveTask.kind==='contradiction'):
      domain==='executive'?cognitive.filter(item=>item.cognitiveTask.kind!=='contradiction'):cognitive;
    const cognitiveKinds=[...new Set(cognitiveItems.map(item=>item.cognitiveTask.kind))];
    const memory=domain==='memory'?(root.Curriculum?.pool(age,'memory',level)||[]):[];
    const speed=domain==='speedReasoning'?(root.Curriculum?.pool(age,'speedReasoning',level)||[]):[];
    return {
      age,domain,
      interactionKinds:eligible?(kinds[domain]||[]):[],
      roomSearch:eligible&&domain==='attention',
      documents:Boolean(root.DocumentLibrary?.supports(age,domain)),
      photos:Boolean(root.PhotoLibrary?.supports(age,domain)),
      memoryAudio:domain==='memory'&&memory.some(item=>item.audioMemory===true),
      executed:['attention','memory','executive'].includes(domain)&&(root.ExecutedTasks?.pool(age,domain,level)||[]).length>0,
      cognitiveKinds,
      wordFit:['language','middleLanguage','teenLanguage'].includes(domain)&&cognitiveKinds.includes('words'),
      speed:{
        screen:domain==='speedReasoning'&&speed.length>0,
        room:domain==='speedReasoning'&&interactionAges.has(age)&&(root.Curriculum?.roomSpeedPool(age,level)||[]).length>0,
        unpaired:domain==='speedReasoning'&&speed.some(item=>item.mechanic==='speed_unpaired'),
      },
      languageModes:['language','middleLanguage','teenLanguage'].includes(domain)?['grammar','spelling','vocabulary']:
        ['reading','middleReading','literacy'].includes(domain)?['grammar','writing']:[],
    };
  }
  const api={interactionAges:[...interactionAges],interactionKinds:kinds,forArea};
  root.ModalityCatalog=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

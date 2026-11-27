'use strict';
const {families, ages, levels, candidates, summarize} = require('../../js/gliax-r192-diversity');
const {createSelector, presentationSeed} = require('../../js/gliax-r192-selector');
const slots=[];
for (const family of families) for (const ageBand of ages) for (const level of levels) {
  const query={family,ageBand,level,seed:2026};
  const existing=candidates(query);
  const expanded=candidates({...query,includeEditorial:true});
  const added=expanded.filter(entry=>entry.item.editorial);
  slots.push({family,ageBand,level,existing:existing.length,newCases:added.length,...summarize(expanded),
    technicalApproval:added.length?100:null});
}
const supported=slots.filter(slot=>slot.existing && slot.candidates);
const measured=[];
for (const slot of supported) {
  const sessionSeed='editorial-comparison';
  for (const [mode,includeEditorial] of [['before',false],['after',true]]) {
    const selector=createSelector(sessionSeed,{prioritizeStructuralDiversity:true});
    const sequence=Array.from({length:120},(_,turn)=>{
      const seed=presentationSeed(sessionSeed,slot,turn);
      return selector.next(slot,candidates({...slot,seed,includeEditorial}));
    });
    const repeated=key=>sequence.slice(1).filter((entry,index)=>entry[key]===sequence[index][key]).length;
    measured.push({family:slot.family,ageBand:slot.ageBand,level:slot.level,mode,
      transitions:119,selectedCases:new Set(sequence.map(entry=>entry.id)).size,caseRepeats:repeated('id'),mechanismRepeats:repeated('mechanism'),
      structuralRepeats:repeated('structure'),contextRepeats:repeated('context'),surfaceRepeats:repeated('surface')});
  }
}
console.log(JSON.stringify({target:500,
  editorialReview:'Technical approval only. Editorial review with users and professionals is pending.',
  oneCandidateBefore:slots.filter(s=>s.existing===1).length,oneCandidateAfter:slots.filter(s=>s.candidates===1).length,
  slots, measured},null,2));

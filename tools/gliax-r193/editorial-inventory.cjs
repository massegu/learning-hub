'use strict';
const {families, ages, levels, candidates, summarize} = require('../../js/gliax-r192-diversity');
const {createSelector} = require('../../js/gliax-r192-selector');
const slots=[];
for (const family of families) for (const ageBand of ages) for (const level of levels) {
  const query={family,ageBand,level,seed:2026};
  const existing=candidates(query);
  const expanded=candidates({...query,includeEditorial:true});
  const added=expanded.filter(entry=>entry.item.editorial);
  slots.push({family,ageBand,level,existing:existing.length,newCases:added.length,...summarize(expanded),
    technicalApproval:added.length?100:null});
}
const touched=slots.filter(slot=>slot.newCases);
const measured=[];
for (const slot of touched) {
  const baseline=candidates({...slot,seed:2026});
  const current=candidates({...slot,seed:2026,includeEditorial:true});
  for (const [mode,pool] of [['before',baseline],['after',current]]) {
    const selector=createSelector('editorial-comparison',{prioritizeStructuralDiversity:true});
    const sequence=Array.from({length:120},()=>selector.next(slot,pool));
    const repeated=key=>sequence.slice(1).filter((entry,index)=>entry[key]===sequence[index][key]).length;
    measured.push({family:slot.family,ageBand:slot.ageBand,level:slot.level,mode,
      transitions:119,caseRepeats:repeated('id'),mechanismRepeats:repeated('mechanism'),
      structuralRepeats:repeated('structure'),contextRepeats:repeated('context'),surfaceRepeats:repeated('surface')});
  }
}
console.log(JSON.stringify({target:500,
  editorialReview:'Technical approval only. Human editorial review and the remaining families are pending.',
  oneCandidateBefore:slots.filter(s=>s.existing===1).length,oneCandidateAfter:slots.filter(s=>s.candidates===1).length,
  slots, measured},null,2));

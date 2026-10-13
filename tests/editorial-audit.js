// Enumerate the generated pool, not just the templates. No network or DB access.
const policy = require('../js/content-policy');
const early = require('../js/early-content');
const model = require('../js/activity-model');
const child = {age_band:'primary',progress:{ageRoute:'early'}};
function audit() {
  const levels = {};
  for (const level of [1,2,3]) {
    levels[level] = {};
    for (const domain of policy.early.subjects) {
      const items = early.pool(domain,level);
      items.forEach(item=>model.forDelivery(item,child,domain));
      const families = [...new Set(items.map(item=>item.ageProfile.family))];
      levels[level][domain] = {
        renderedVariants:items.length,
        nameIndependentVariants:new Set(items.map(item=>item.semanticKey)).size,
        mechanics:[...new Set(items.map(item=>item.ageProfile.mechanic))],
        familyCount:families.length,
        families:families.map(family=>{
          const instances=items.filter(item=>item.ageProfile.family===family);
          const samples=[...new Map(instances.map(it=>[it.semanticKey,it])).values()];
          return {family, mechanic:instances[0].ageProfile.mechanic,
            semanticVariants:samples.length,
            samples:samples.map(it=>({id:it.id,question:it.memoryQuestion||it.q,stimulus:it.stimulus,options:it.opts||it.tokens,answer:it.a||it.answer}))};
        }),
      };
    }
  }
  return {criteria:'Family = an authored task/stimulus scaffold; nameIndependentVariants remove person-name changes, and arithmetic also removes noun-only and distractor-only variation. Neither count claims independent pedagogical scenarios.',levels};
}
if(require.main===module) process.stdout.write(JSON.stringify(audit(),null,2)+'\n');
module.exports=audit;

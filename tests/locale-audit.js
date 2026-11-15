// Exhaustive generated local matrix plus explicit simulated remote specimens.
// It does not claim access to the live Supabase bank.
const locale=require('../js/locale-content');
const early=require('../js/early-content');
const policy=require('../js/content-policy');
const model=require('../js/activity-model');
const fixtures=require('./locale-fixtures');
const child={age_band:'primary',progress:{ageRoute:'early'}};
const banks=Object.fromEntries([1,2,3].map(level=>[level,Object.fromEntries(policy.early.subjects.map(domain=>[domain,early.pool(domain,level)]))]));
const countries={};
for(const key of Object.keys(locale.labels)) {
  const levels={};
  for(const level of [1,2,3]) {
    levels[level]={};
    for(const domain of policy.early.subjects) {
      const items=banks[level][domain],adapted=items.map(it=>locale.localizeItem(it,key,domain));
      adapted.forEach(it=>model.forDelivery(it,child,domain));
      const changed=adapted.filter((it,i)=>JSON.stringify([it.q,it.stimulus,it.opts,it.tokens,it.memoryQuestion])!==JSON.stringify([items[i].q,items[i].stimulus,items[i].opts,items[i].tokens,items[i].memoryQuestion]));
      const samples=[...new Set(items.map(it=>it.ageProfile.family))].map(f=>adapted.find(it=>it.ageProfile.family===f));
      levels[level][domain]={activities:items.length,changed:changed.length,samples:samples.map(it=>({family:it.ageProfile.family,q:it.memoryQuestion||it.q,stimulus:it.stimulus,options:it.opts||it.tokens,answer:it.a||it.answer}))};
    }
  }
  countries[key]={label:locale.labels[key],levels,remoteFixtures:fixtures().map(it=>locale.localizeItem(it,key))};
}
process.stdout.write(JSON.stringify({scope:'All local generated entries, all levels, seven countries plus international. Remote specimens are fixtures, not observed production content.',terminology:[...locale.rules,...locale.senseRules],countries},null,2)+'\n');

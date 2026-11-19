// Inspect every explicit locale through the authenticated local content handler.
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const locales=require('../js/locale-content').labels;
const ages=['early','junior','primary','middle','teen'];
const output=process.argv[2];
if(!output)throw new Error('Indica la ruta de salida del inventario JSON.');
const rows=[];
for(const age of ages){
  const coordinates=[1,2,3].flatMap(level=>Object.keys(locales).map(locale=>({age,level,locale})));
  const requests=coordinates.map(catalogue=>({kind:'worksheet_catalog',client_revision:16,profile_id:age,catalogue}));
  const raw=execFileSync(process.execPath,['tests/edge-worker.js',age],{
    input:requests.map(JSON.stringify).join('\n')+'\n',encoding:'utf8',timeout:120000,maxBuffer:48e6
  }).trim().split('\n').map(JSON.parse);
  for(const [index,response] of raw.entries()){
    if(response.status!==200||!response.data.families.length)throw new Error(JSON.stringify({coordinates:coordinates[index],response}));
    rows.push({...coordinates[index],...response.data});
  }
}
const inventory={schema:1,method:'Auditoría automática de los bancos finitos, filtros y proyección Word en la Edge Function local. El conteo no certifica naturalidad lingüística ni alineación curricular.',rows};
fs.writeFileSync(output,JSON.stringify(inventory,null,2)+'\n');
const csv=process.argv[3];
if(csv){
  const records=[['franja','nivel','area','tipologia','orientacion','etiquetas_secundarias','finalidad','estado','disponibles','inspeccionadas','rechazadas','administracion','limites','solucionario','validacion','mecanicas']];
  for(const {age,level,families} of rows.filter(row=>row.locale==='es_intl'))for(const f of families)records.push([
    age,level,f.domain,f.label,f.orientation.primary,f.orientation.secondary.join(' · '),f.purpose,f.status,f.available,f.inspected,f.excluded,
    f.administration,f.limitations,f.solutions,f.validation,f.mechanics.join(' · ')
  ]);
  fs.writeFileSync(csv,records.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(';')).join('\n')+'\n');
}
for(const locale of Object.keys(locales)){
  const selected=rows.filter(row=>row.locale===locale);
  const all=selected.flatMap(row=>row.families);
  console.log(locale,selected.length,'celdas',all.reduce((sum,entry)=>sum+entry.available,0),'candidatos',all.reduce((sum,entry)=>sum+entry.excluded,0),'rechazos de adaptación o proyección');
}

(function(root){
 'use strict';
 function minimize(progress={}){
  const copy=structuredClone(progress||{});
  if(Array.isArray(copy.interactiveObservations))copy.interactiveObservations=copy.interactiveObservations.map(entry=>{
   const {description,notes,freeText,responseText,...metrics}=entry;return metrics;
  });
  return copy;
 }
 function independent(profile){
  return {...structuredClone(profile),name:'Sesión independiente',_sessionOnly:true,progress:{ageRoute:profile.progress?.ageRoute,initialLevel:profile.progress?.initialLevel||1,_sessionOnly:true}};
 }
 const api={minimize,independent,isCode:value=>/^[A-Z0-9][A-Z0-9_-]{1,23}$/i.test(String(value||'').trim()),newCode:()=> 'P-'+crypto.randomUUID().slice(0,8).toUpperCase()};
 root.PrivacyControls=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

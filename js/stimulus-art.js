(function(root){
  'use strict';
  // Small authored vectors. Canonical words remain visible and authoritative.
  // These pictures decorate known labels; they never invent an exercise fact.
  const drawings={
    dot:'<circle cx="32" cy="32" r="14" fill="#173326"/>',
    circle:'<circle cx="32" cy="32" r="21" fill="white" stroke="#173326" stroke-width="4"/>',
    square:'<rect x="11" y="11" width="42" height="42" rx="2" fill="white" stroke="#173326" stroke-width="4"/>',
    triangle:'<path d="M32 9 56 53H8Z" fill="white" stroke="#173326" stroke-width="4" stroke-linejoin="round"/>',
    star:'<path d="m32 7 7 17 18 2-14 12 4 19-15-10-15 10 4-19L7 26l18-2Z" fill="#ffe38a" stroke="#173326" stroke-width="3" stroke-linejoin="round"/>',
    book:'<path d="M8 14q12-7 24 0 12-7 24 0v39q-12-7-24 0-12-7-24 0Z" fill="#8bc9ec" stroke="#173326" stroke-width="3"/><path d="M32 15v37M14 23l11-1m-11 9 11-1m14-7 11 1m-11 7 11 1" fill="none" stroke="#173326" stroke-width="2"/>',
    notebook:'<rect x="14" y="7" width="39" height="50" rx="4" fill="#9edba9" stroke="#173326" stroke-width="3"/><path d="M20 7v50M26 20h20m-20 9h20m-20 9h14M10 17h8m-8 11h8m-8 11h8m-8 11h8" fill="none" stroke="#173326" stroke-width="2"/>',
    pencil:'<path d="m12 48 31-35 10 9-31 35-13 4Z" fill="#ffda75" stroke="#173326" stroke-width="3" stroke-linejoin="round"/><path d="m43 13 4-4q4-4 8 0l2 2q4 4 0 8l-4 3Z" fill="#f4a9b4" stroke="#173326" stroke-width="3"/><path d="m12 48 10 9-13 4Z" fill="#ead2ad"/><path d="m13 53-4 8 8-3" fill="#173326"/>',
    ball:'<circle cx="32" cy="32" r="24" fill="#ffb294" stroke="#173326" stroke-width="3"/><path d="M8 32h48M32 8q-21 24 0 48M32 8q21 24 0 48" fill="none" stroke="#173326" stroke-width="3"/>',
    apple:'<path d="M32 19C7 8 4 39 17 53q8 7 15 1 8 6 16-1c13-14 10-45-16-34Z" fill="#f37d71" stroke="#173326" stroke-width="3"/><path d="M32 20V9m0 5q12-13 19-5-5 12-19 5" fill="#8bcf8c" stroke="#173326" stroke-width="3"/><path d="M16 27q-5 8-1 16" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>',
    cookie:'<circle cx="32" cy="32" r="24" fill="#e9bf86" stroke="#173326" stroke-width="3"/><g fill="#694328"><circle cx="22" cy="20" r="3"/><circle cx="40" cy="24" r="3"/><circle cx="29" cy="39" r="3"/><circle cx="18" cy="40" r="3"/><circle cx="44" cy="42" r="3"/></g>',
    bottle:'<path d="M24 13h16v11q10 6 10 14v17H14V38q0-8 10-14Z" fill="#9ad6ed" stroke="#173326" stroke-width="3"/><rect x="22" y="6" width="20" height="9" rx="2" fill="#568ecb" stroke="#173326" stroke-width="3"/><path d="M16 38h32v10H16Z" fill="white"/><path d="M22 24v8" stroke="white" stroke-width="4" stroke-linecap="round"/>',
    car:'<path d="m9 34 8-16h27l10 16v17H9Z" fill="#92c8ec" stroke="#173326" stroke-width="3"/><path d="M23 21h17l6 13H17Z" fill="white" stroke="#173326" stroke-width="2"/><circle cx="20" cy="51" r="7" fill="#173326"/><circle cx="46" cy="51" r="7" fill="#173326"/>',
    bear:'<circle cx="15" cy="14" r="8" fill="#c79468" stroke="#173326" stroke-width="2"/><circle cx="49" cy="14" r="8" fill="#c79468" stroke="#173326" stroke-width="2"/><ellipse cx="32" cy="43" rx="18" ry="17" fill="#c79468" stroke="#173326" stroke-width="3"/><ellipse cx="32" cy="24" rx="22" ry="19" fill="#c79468" stroke="#173326" stroke-width="3"/><ellipse cx="32" cy="31" rx="11" ry="8" fill="#ffe2b8"/><circle cx="23" cy="23" r="2.5"/><circle cx="41" cy="23" r="2.5"/><path d="m28 28 4 4 4-4" fill="#173326"/>',
    doll:'<circle cx="32" cy="19" r="13" fill="#ffe0bd" stroke="#173326" stroke-width="3"/><path d="m24 32-13 21h42L40 32Z" fill="#d1b1eb" stroke="#173326" stroke-width="3"/><path d="M21 53v7m22-7v7M19 17q0-16 14-13 14 0 14 16" fill="none" stroke="#825738" stroke-width="6"/><circle cx="27" cy="18" r="2"/><circle cx="37" cy="18" r="2"/><path d="M28 24q4 4 8 0" fill="none" stroke="#173326" stroke-width="2"/>',
    cap:'<path d="M12 39V29a20 20 0 0 1 40 0v10Z" fill="#ffd27f" stroke="#173326" stroke-width="3"/><path d="M12 39h40l9 9H24Z" fill="#edac62" stroke="#173326" stroke-width="3"/><path d="M32 10v28" stroke="#173326" stroke-width="2"/>',
    gift:'<path d="M11 25h42v31H11Z" fill="#ffbfac" stroke="#173326" stroke-width="3"/><path d="M8 18h48v12H8Z" fill="#ffe48b" stroke="#173326" stroke-width="3"/><path d="M29 18h6v38h-6Z" fill="#76bfa4"/><path d="M32 18C9 20 14-3 32 18c18-21 23 2 0 0Z" fill="#76bfa4" stroke="#173326" stroke-width="2"/>',
    backpack:'<rect x="13" y="15" width="38" height="44" rx="10" fill="#edb6d3" stroke="#173326" stroke-width="3"/><path d="M23 15V9h18v6" fill="none" stroke="#173326" stroke-width="3"/><rect x="20" y="35" width="24" height="17" rx="3" fill="#fff0be" stroke="#173326" stroke-width="2"/>',
    paper:'<path d="M15 6h27l9 10v42H15Z" fill="white" stroke="#173326" stroke-width="3"/><path d="M42 6v11h9M23 28h20m-20 9h20m-20 9h14" fill="none" stroke="#568ecb" stroke-width="3"/>',
    spoon:'<ellipse cx="32" cy="18" rx="11" ry="15" fill="#c6dce5" stroke="#173326" stroke-width="3"/><path d="M29 32h6v26h-6Z" fill="#c6dce5" stroke="#173326" stroke-width="3"/>',
    banana:'<path d="M9 17q2 27 38 31l10-10Q24 45 17 12Z" fill="#ffe07b" stroke="#173326" stroke-width="3"/><path d="M17 24q9 20 31 19" fill="none" stroke="#c79a24" stroke-width="2"/>',
  };
  drawings.tree='<path d="M28 37h8v24h-8Z" fill="#b48b61" stroke="#173326" stroke-width="2"/><path d="M12 39Q2 27 15 19Q13 3 30 6Q43 1 48 16Q63 21 54 36Q38 49 12 39Z" fill="#94c881" stroke="#173326" stroke-width="3"/>';
  drawings.umbrella='<path d="M5 30a27 27 0 0 1 54 0Q50 23 41 30Q32 23 23 30Q14 23 5 30Z" fill="#f1ba76" stroke="#173326" stroke-width="3"/><path d="M32 4v48q0 10-9 7" fill="none" stroke="#173326" stroke-width="3" stroke-linecap="round"/>';
  drawings.pot='<path d="m14 37 5 22h26l5-22Z" fill="#dda17c" stroke="#173326" stroke-width="3"/><path d="M11 32h42v7H11Z" fill="#ebbb97" stroke="#173326" stroke-width="3"/><path d="M32 32V12q-18-16-18 2 2 14 18 10Q45 2 51 12q3 16-19 17" fill="#9dd18e" stroke="#173326" stroke-width="3"/>';
  drawings.glass='<path d="m14 7 5 50h26l5-50Z" fill="white" stroke="#173326" stroke-width="3"/><path d="m18 29 3 25h22l3-25Z" fill="#a1d9ec"/>';
  drawings.flower='<path d="M32 30v31m0-14q-19-16-18-2 5 11 18 7m0-5q19-16 18-2-5 11-18 7" fill="#91c680" stroke="#173326" stroke-width="3"/><g fill="#efb2ce" stroke="#173326" stroke-width="2"><ellipse cx="32" cy="12" rx="8" ry="10"/><ellipse cx="18" cy="23" rx="10" ry="8"/><ellipse cx="46" cy="23" rx="10" ry="8"/><ellipse cx="24" cy="34" rx="8" ry="10"/><ellipse cx="40" cy="34" rx="8" ry="10"/></g><circle cx="32" cy="24" r="9" fill="#f4d36c" stroke="#173326" stroke-width="2"/>';
  drawings.shoe='<path d="M8 20h16q3 16 25 15l8 10v9H7V31Z" fill="#e9b47e" stroke="#173326" stroke-width="3"/><path d="M8 46h47m-27-16 8-6m0 12 8-6" fill="none" stroke="#173326" stroke-width="3"/>';
  drawings.cat='<path d="m12 23 1-18 16 11h7L51 5l1 18q11 27-20 33Q2 49 12 23Z" fill="#eab889" stroke="#173326" stroke-width="3"/><path d="m27 37 5 5 5-5M18 37 4 33m14 11L4 46m42-9 14-4m-14 11 14 2" fill="none" stroke="#173326" stroke-width="2"/><circle cx="23" cy="28" r="3"/><circle cx="42" cy="28" r="3"/>';
  drawings.dog='<ellipse cx="32" cy="32" rx="21" ry="24" fill="#deb185" stroke="#173326" stroke-width="3"/><path d="M15 10Q0 10 7 39l11-10m29-19q15 0 10 29l-11-10" fill="#a37651" stroke="#173326" stroke-width="3"/><circle cx="23" cy="29" r="3"/><circle cx="41" cy="29" r="3"/><path d="m26 40 6 6 6-6M32 46v5" fill="#173326" stroke="#173326" stroke-width="2"/>';
  drawings.rabbit='<ellipse cx="22" cy="17" rx="6" ry="15" fill="#dfd3cf" stroke="#173326" stroke-width="2"/><ellipse cx="42" cy="17" rx="6" ry="15" fill="#dfd3cf" stroke="#173326" stroke-width="2"/><ellipse cx="32" cy="42" rx="22" ry="19" fill="#dfd3cf" stroke="#173326" stroke-width="3"/><circle cx="22" cy="39" r="3"/><circle cx="42" cy="39" r="3"/><path d="m28 48 4 4 4-4" fill="#e7a5b9" stroke="#173326" stroke-width="2"/>';
  drawings.bird='<path d="M12 34q-1-22 21-24 23 2 16 28-4 21-23 14L8 59l6-15Z" fill="#96c9e1" stroke="#173326" stroke-width="3"/><path d="m48 20 13 8-13 4M22 25q22-5 15 18-18 4-15-18Z" fill="#f4d36c" stroke="#173326" stroke-width="2"/><circle cx="40" cy="19" r="3"/>';
  drawings.fish='<path d="M14 32 3 19v26l11-13q20-32 44 0-24 32-44 0Z" fill="#edbd7f" stroke="#173326" stroke-width="3"/><circle cx="46" cy="29" r="3"/><path d="M37 21q-7 11 0 23m-12-12 8-6v12Z" fill="#e89a73" stroke="#173326" stroke-width="2"/>';
  drawings.drawing=drawings.paper+'<path d="m23 33 9-8 9 8v12H23Zm9-8v20" fill="#f0c883" stroke="#173326" stroke-width="2"/>';
  drawings.person='<circle cx="32" cy="19" r="12" fill="#f4d6ae" stroke="#173326" stroke-width="3"/><path d="M14 57V43q0-14 18-14t18 14v14Z" fill="#a6cbb6" stroke="#173326" stroke-width="3"/>';
  drawings['bottle-full-closed']=drawings.bottle;
  drawings['bottle-empty-closed']=drawings.bottle.replace('fill="#9ad6ed"','fill="white"');
  drawings['bottle-full-open']=drawings.bottle.replace('<rect x="22" y="6" width="20" height="9" rx="2" fill="#568ecb" stroke="#173326" stroke-width="3"/>','<rect x="48" y="49" width="12" height="8" rx="2" fill="#568ecb" stroke="#173326" stroke-width="2"/>');
  for(const [key,color] of Object.entries({red:'#e06459',blue:'#5798d5',green:'#67ae7c',yellow:'#edc65b'}))drawings['balloon-'+key]=`<ellipse cx="32" cy="25" rx="19" ry="22" fill="${color}" stroke="#173326" stroke-width="3"/><path d="m32 46-4 5h8Zm0 5q-7 7 0 12M23 13q-6 4-6 13" fill="none" stroke="#173326" stroke-width="2"/>`;
  const aliases={book:['libro'],notebook:['cuaderno'],pencil:['lápiz'],ball:['pelota','balón'],apple:['manzana'],cookie:['galleta'],bottle:['botella','botella de agua'],car:['coche de juguete','carro de juguete','auto de juguete'],bear:['oso de peluche'],doll:['muñeca'],cap:['gorra'],gift:['regalo'],backpack:['mochila'],paper:['papel'],spoon:['cuchara']};
  const glyphs={'●':'dot','○':'circle','□':'square','△':'triangle','☆':'star'};
  function forLabel(value,senses={}) {
    const label=String(value).normalize('NFC').trim().toLocaleLowerCase('es').replace(/^(?:el|la|un|una)\s+/,'');
    if(glyphs[label])return glyphs[label];
    if(senses.subject==='Personas'&&['ana','leo','mar','sol'].includes(label))return 'person';
    if(senses.subject==='Botellas')return {'llena · cerrada':'bottle-full-closed','vacía · cerrada':'bottle-empty-closed','llena · abierta':'bottle-full-open'}[label] || null;
    if(senses.subject==='Globos')return {rojo:'balloon-red',azul:'balloon-blue',verde:'balloon-green',amarillo:'balloon-yellow'}[label]||null;
    if(senses.banana && ['banana','plátano','banano','guineo'].includes(label))return 'banana';
    const contextObjects={árbol:'tree',paraguas:'umbrella',maceta:'pot',vaso:'glass',flor:'flower',zapato:'shoe',gato:'cat',perro:'dog',conejo:'rabbit',pájaro:'bird',pez:'fish',dibujo:'drawing'};
    return contextObjects[label] || Object.keys(aliases).find(key=>aliases[key].includes(label)) || null;
  }
  function svg(key){if(!drawings[key])throw new Error('Ilustración desconocida.');return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" focusable="false">${drawings[key]}</svg>`;}
  function png(key){const images=root.StimulusArtPNG || (typeof require==='function'&&require('./stimulus-art-png.js'));if(!images?.[key])throw new Error('Falta la ilustración imprimible.');return Uint8Array.from(atob(images[key]),c=>c.charCodeAt(0));}
  const api={keys:Object.keys(drawings),forLabel,svg,png};
  root.StimulusArt=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

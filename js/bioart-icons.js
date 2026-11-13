// Original, local illustrations with a soft scientific/natural-history feel.
// They are decorative web visuals; the adjacent text remains authoritative.
(function(root){'use strict';
 const art={
  reading:'<path d="M8 15q13-8 24 1 11-9 24-1v36q-13-7-24 1-11-8-24-1Z" fill="#f8f4e9" stroke="#36565a" stroke-width="3"/><path d="M32 16v36M14 23q8-3 14 1m-14 7q8-3 14 1m8-8q7-4 14-1m-14 9q7-4 14-1" fill="none" stroke="#8fae9c" stroke-width="2.5" stroke-linecap="round"/>',
  numbers:'<path d="M9 17h46v33H9Z" fill="#fbf2d9" stroke="#36565a" stroke-width="3"/><path d="M18 18v32m10-32v32m10-32v32m10-32v32" stroke="#8fae9c" stroke-width="2"/><circle cx="18" cy="27" r="4" fill="#e68b7e"/><circle cx="38" cy="38" r="4" fill="#7da9a4"/><circle cx="48" cy="27" r="4" fill="#d4b66d"/><circle cx="28" cy="38" r="4" fill="#b29bc7"/>',
  science:'<path d="M31 12c-3 8-11 9-16 15-9 11-1 25 12 25 12 0 24-7 24-19 0-10-8-15-20-21Z" fill="#dcebd8" stroke="#496d62" stroke-width="2.8"/><circle cx="30" cy="34" r="8" fill="#e8b6a7" stroke="#496d62" stroke-width="2.3"/><circle cx="17" cy="32" r="3" fill="#8ab5b0"/><circle cx="42" cy="25" r="3.5" fill="#d6bd70"/><circle cx="42" cy="43" r="4" fill="#9c91bd"/><path d="M12 48q8 7 17 4m8-37q8 4 12 11" fill="none" stroke="#87a88b" stroke-width="2.4" stroke-linecap="round"/>',
  art:'<path d="M32 7C17 7 6 18 6 32c0 13 9 23 21 23h5c4 0 6-4 4-7-2-3 0-6 4-6h5c8 0 13-5 13-13C58 17 47 7 32 7Z" fill="#f5eadb" stroke="#496d62" stroke-width="3"/><circle cx="20" cy="25" r="4" fill="#e28d80"/><circle cx="31" cy="17" r="4" fill="#d7bb71"/><circle cx="43" cy="24" r="4" fill="#83aaa4"/><circle cx="22" cy="38" r="4" fill="#a392bb"/>'
 };
 const areas={lectura:'reading','lectura + escritura':'reading','lectura + escritura 13-15':'reading',lengua:'reading',lenguaje:'reading','lenguaje 13-15':'reading','lenguaje 16-18':'reading','english lab':'reading',números:'numbers',numeros:'numbers',matemáticas:'numbers','matemáticas 13-15':'numbers','matemáticas 16-18':'numbers',matematica:'numbers',divisiones:'numbers',geometría:'numbers',ciencias:'science',arte:'art',atención:'science',memoria:'science','funciones ejecutivas':'art','velocidad de procesamiento':'art','cognición aplicada':'science','social lab':'art'};
 function forArea(value){const key=String(value||'').trim().toLocaleLowerCase('es');return areas[key]||null;}
 function svgForArea(value){const key=forArea(value);return key?`<svg class="bioart-area-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g stroke-linecap="round" stroke-linejoin="round">${art[key]}</g></svg>`:'';}
 const api={forArea,svgForArea,keys:Object.keys(art)};root.BioArtIcons=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

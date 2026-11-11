'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('js/app.js','utf8');
const api=fs.readFileSync('js/api.js','utf8');
const css=fs.readFileSync('css/redesign-2026.css','utf8');
test('five age choices are presented in the correct order',()=>{
 const control=html.match(/<select id="newProfileAge">([\s\S]*?)<\/select>/);
 assert.ok(control,'Age selector exists');
 const options=[...control[1].matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)];
 assert.deepEqual(options.map(o=>o[1]),['early','junior','primary','middle','teen']);
 assert.deepEqual(options.map(o=>o[2]),['6–7 años','8–10 años','10–12 años','13–15 años','16–18 años']);
});
test('younger age bands use their original curricular route',()=>{
 assert.match(api,/const younger=\['early','junior'\]\.includes\(age_band\)/);
 assert.match(api,/storedBand=younger\?'primary':age_band/);
 assert.match(api,/ageRoute:age_band/);
 assert.match(app,/function ageLabel\(p\)/);
 assert.match(app,/\$\{ageLabel\(p\)\}/);
 assert.match(app,/\$\{ageLabel\(profile\)\}/);
});
test('redesign is present without replacing critical account UI',()=>{
 for(const id of ['authGate','profileGate','subscribeBtn','billingPortalBtn','homeAreaLanding','recommendedBtn','homeProgressNeverExists']) {
  if(id==='homeProgressNeverExists')continue;
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/css\/redesign-2026\.css/);
 assert.match(html,/<details class="home-progress">/);
 assert.match(app,/function renderHomeAreaLanding\(/);
 assert.match(app,/const hasDedicatedJourney=\['early','junior','primary'\]/);
 assert.match(css,/redesign-area-grid/);
});

test('refined sidebar keeps profile selector and account actions accessible',()=>{
 assert.match(html,/class="profile-panel sidebar-profile"/);
 assert.match(html,/id="profileSelect"/);
 assert.ok(html.indexOf('id="profileSelect"')<html.indexOf('id="navMenu"'));
 for(const id of ['newProfileBtn','deleteProfileBtn','independentSessionBtn','profilePrivacyBtn','resetProgressBtn']) assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/<summary>Cuenta y ajustes<\/summary>/);
});
test('functional communication preview is appropriately scoped',()=>{
 assert.match(html,/id="everydayLanguagePreview"/);
 assert.match(html,/En preparación/);
 assert.match(app,/everydayPreview\.classList\.toggle/);
 assert.match(app,/Comunicación cotidiana · próximamente/);
});
test('age-aware symbols use coherent icons without shipping a new library',()=>{
 assert.match(app,/function areaIcon\(domain,route\)/);
 assert.match(app,/function navSymbol\(id\)/);
 assert.match(app,/window\.AgeStages\.route\(profile\)==="junior"\?window\.StimulusArt\.svg/);
 assert.match(css,/redesign-line-icon/);
});

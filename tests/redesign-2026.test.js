'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('js/app.js','utf8');
const v16=fs.readFileSync('js/v16.js','utf8');
const api=fs.readFileSync('js/api.js','utf8');
const css=fs.readFileSync('css/redesign-2026.css','utf8');

test('five age choices remain available in the intended order',()=>{
 const control=html.match(/<select id="newProfileAge">([\s\S]*?)<\/select>/);
 assert.ok(control,'Age selector exists');
 const options=[...control[1].matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)];
 assert.deepEqual(options.map(o=>o[1]),['early','junior','primary','middle','teen']);
 assert.deepEqual(options.map(o=>o[2]),['6–7 años','8–10 años','10–12 años','13–15 años','16–18 años']);
});

test('younger routes still persist and restore their original curricular age route',()=>{
 assert.ok(api.includes("const younger=['early','junior'].includes(age_band)"));
 assert.ok(api.includes("storedBand=younger?'primary':age_band"));
 assert.ok(api.includes('ageRoute:age_band'));
 assert.ok(app.includes('function ageLabel(p)'));
});

test('all profiles use the unified professional dashboard and available area groups',()=>{
 assert.ok(app.includes("landing.classList.remove('hidden')"));
 assert.ok(app.includes('function areaGroupFor(domain)'));
 assert.ok(app.includes("['geometry','division','middleMath','teenMath'].includes(domain)?'math'"));
 assert.ok(app.includes('renderOptionalMissions(route)'));
 assert.ok(app.includes("hub.classList.add('hidden');hub.replaceChildren()"));
 assert.ok(html.includes('id="homeAreaLanding"'));
 assert.ok(html.includes('id="prepareSessionHomeBtn"'));
 assert.ok(html.includes('id="homeProgressSummary"'));
});

test('continue action remembers a validated last area separately for each profile',()=>{
 assert.ok(app.includes('localStorage.getItem(`lh_v16_last_subject_${profile.id}`)'));
 assert.ok(app.includes('if(subjects.includes(saved))remembered=saved'));
 assert.ok(app.includes('Abre el área de nuevo; el ejercicio comienza desde el inicio.'));
 assert.ok(app.includes('localStorage.setItem(`lh_v16_last_subject_${profile.id}`,subject)'));
 assert.ok(v16.includes('[data-redesign-area]'));
 assert.ok(v16.includes('button.dataset.redesignArea'));
});

test('home summary is compact, has no duplicate progress route, and recommendation stays separate',()=>{
 assert.ok(html.includes('<details class="home-progress">'));
 assert.ok(html.includes('<summary>Entrenamiento recomendado</summary>'));
 assert.ok(!html.includes('id="homePoints"'));
 assert.ok(!html.includes('id="homeCorrect"'));
 assert.ok(!html.includes('id="homeAccuracy"'));
 assert.ok(!html.includes('id="homeAttempts"'));
 assert.ok(app.includes('homeProgressSummary'));
 assert.ok(app.includes('lastOpened||lastAnswered'));
 assert.ok(app.includes('Última área respondida'));
 assert.ok(!app.includes('data-progress-link'));
 assert.ok(!app.includes('viewDetailedProgress'));
});

test('account preferences are grouped and destructive actions remain distinct',()=>{
 assert.ok(html.includes('id="profileSelect"'));
 assert.ok(html.includes('id="sidebarLocalePlaceholder"'));
 assert.ok(v16.includes("const panel=$('#sidebarLocalePlaceholder')"));
 assert.ok(html.includes('<details class="destructive-account-tools">'));
 assert.ok(html.includes('<summary>Eliminar perfil o reiniciar progreso</summary>'));
 assert.ok(html.includes('afectan al perfil activo y pueden borrar sus datos guardados'));
 for(const id of ['newProfileBtn','deleteProfileBtn','independentSessionBtn','profilePrivacyBtn','resetProgressBtn','changePasswordBtn','signOutBtn'])assert.ok(html.includes(`id="${id}"`),`${id} remains available`);
});

test('exercise has one focused presentation with in-flow return and expandable professional options',()=>{
 assert.ok(html.includes('id="exerciseReturnHome"'));
 assert.ok(!html.includes('id="sharedActivityToggle"'));
 assert.ok(!html.includes('id="sharedActivityExit"'));
 assert.ok(!html.includes('id="sharedActivityBar"'));
 assert.ok(app.includes("classList.toggle('exercise-focus',id==='exercise')"));
 assert.ok(app.includes("if(id==='exercise'){window.scrollTo(0,0);$('#exerciseHeading').focus({preventScroll:true});}"));
 assert.ok(app.includes("$('#exerciseReturnHome').addEventListener('click',()=>switchSection('home'))"));
 assert.ok(html.includes('<details id="activityOptions" class="activity-settings"'));
 assert.ok(html.includes('<summary id="activityOptionsSummary">Opciones del profesional</summary>'));
 assert.ok(css.includes('#appShell[data-design].exercise-focus .sidebar'));
 assert.ok(css.includes('#appShell[data-design].exercise-focus{grid-template-columns:minmax(0,1fr)'));
 assert.ok(css.includes('.exercise-navigation'));
 assert.ok(css.includes('#activityOptions .level-control::before{content:none'));
 assert.ok(css.includes('#appShell[data-design].exercise-focus #exercise{width:100%;max-width:1680px'));
 assert.ok(!css.includes('.shared-activity-bar'));
});

test('memory plan recall keeps its identifying context after hiding the plan steps',()=>{
 assert.ok(app.includes("if(it.mechanic!=='memory_plan_recall')return ''"));
 assert.ok(app.includes("it.stimulus?.find(block=>block.type==='text'&&block.text)?.text"));
 assert.ok(app.includes('visual.innerHTML = memoryRecallContext(it)'));
 assert.ok(css.includes('.memory-recall-context'));
 assert.ok(css.includes('#exerciseVisual .reading-passage:not(:has(.practice-document)){background:#FBF9F7!important'));
});

test('communication preview appears only in language and is clearly marked as preparation',()=>{
 assert.ok(html.includes('id="everydayLanguagePreview"'));
 assert.ok(html.includes('En preparación'));
 assert.ok(app.includes('!(["language","middleLanguage","teenLanguage"].includes(subject))')===false);
 assert.ok(app.includes('!["language","middleLanguage","teenLanguage"].includes(subject)'));
 assert.ok(app.includes('Comunicación y vida cotidiana · en preparación'));
});

test('professional palette is consistent across age themes and uses coherent line icons',()=>{
 for(const token of ['#254556','#4C5BDD','#10BFAE','#FF7468','#F8E8EC','#EEE9FA','#FBF9F7','#FFFFFF'])assert.ok(css.includes(token),`palette includes ${token}`);
 for(const old of ['#A25447','#753C33','#F3C5A0','#D98573'])assert.ok(!css.includes(old),`legacy dominant token ${old} is removed`);
 assert.ok(app.includes("$('#appShell').dataset.design='calma'"));
 assert.ok(app.includes('areaIcon(domain,\'professional\')'));
 assert.ok(app.includes('areaIcon(s,\'professional\')'));
 assert.ok(css.includes('#homeLevels [data-area] .area-illustration svg{display:block!important;visibility:visible!important'));
 assert.ok(css.includes('.training-group-grid .level-track span.is-active{background:#4C5BDD}'));
 assert.ok(css.includes('.evolution-chart .chart-point-core{fill:#FF7468}'));
 assert.ok(css.includes('#progressCards .accuracy-ring span{font-size:.68rem'));
 assert.ok(app.includes("r.length?'aciertos':'sin práctica'"));
});

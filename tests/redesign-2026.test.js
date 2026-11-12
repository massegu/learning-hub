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

test('progress summary is compact while detailed metrics remain available',()=>{
 assert.ok(html.includes('<details class="home-progress">'));
 assert.ok(html.includes('id="homePoints"'));
 assert.ok(html.includes('id="homeCorrect"'));
 assert.ok(html.includes('id="homeAccuracy"'));
 assert.ok(html.includes('id="homeAttempts"'));
 assert.ok(app.includes('homeProgressSummary'));
 assert.ok(app.includes('data-progress-link'));
});

test('account preferences are grouped and destructive actions remain distinct',()=>{
 assert.ok(html.includes('id="profileSelect"'));
 assert.ok(html.includes('id="sidebarLocalePlaceholder"'));
 assert.ok(v16.includes("const panel=$('#sidebarLocalePlaceholder')"));
 assert.ok(html.includes('<details class="destructive-account-tools">'));
 for(const id of ['newProfileBtn','deleteProfileBtn','independentSessionBtn','profilePrivacyBtn','resetProgressBtn','changePasswordBtn','signOutBtn'])assert.ok(html.includes(`id="${id}"`),`${id} remains available`);
});

test('shared activity mode is presentation-only, keyboard escapable, and leaves save code untouched',()=>{
 assert.ok(html.includes('id="sharedActivityToggle"'));
 assert.ok(html.includes('id="sharedActivityExit"'));
 assert.ok(app.includes("classList.toggle('shared-activity',on)"));
 assert.ok(app.includes("event.key==='Escape'"));
 assert.ok(app.includes("const wasShared=id!=='exercise'&&$('#appShell').classList.contains('shared-activity')"));
 assert.ok(css.includes('#appShell.shared-activity .sidebar'));
 assert.ok(css.includes('#appShell.shared-activity #activityOptions'));
 assert.ok(css.includes('#appShell.shared-activity #exerciseNext'));
 const presentation=app.match(/function setSharedActivityView\(enabled,restoreFocus=true\)\{([\s\S]*?)\n  \}/)?.[1]||'';
 assert.ok(presentation,'Presentation toggle has a focused implementation');
 assert.ok(!/setIndependent|saveResult|persist\(/.test(presentation),'Presentation toggle does not alter tracking or persistence');
});

test('communication preview appears only in language and is clearly marked as preparation',()=>{
 assert.ok(html.includes('id="everydayLanguagePreview"'));
 assert.ok(html.includes('En preparación'));
 assert.ok(app.includes('!(["language","middleLanguage","teenLanguage"].includes(subject))')===false);
 assert.ok(app.includes('!["language","middleLanguage","teenLanguage"].includes(subject)'));
 assert.ok(app.includes('Comunicación y vida cotidiana · en preparación'));
});

test('professional palette is consistent across age themes and uses coherent line icons',()=>{
 for(const token of ['#254556','#F8E8EC','#F3C5A0','#7EA99B','#D98573','#FAF7F2','#756BA7'])assert.ok(css.includes(token),`palette includes ${token}`);
 assert.ok(app.includes("$('#appShell').dataset.design='calma'"));
 assert.ok(app.includes('areaIcon(domain,\'professional\')'));
 assert.ok(app.includes('areaIcon(s,\'professional\')'));
});

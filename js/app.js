(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const shuffle=a=>[...a].sort(()=>Math.random()-.5), clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const SUBJECT_META={
    geometry:{name:'Geometría',icon:'△',desc:'Formas, propiedades y ángulos.'},
    language:{name:'Lengua',icon:'Aa',desc:'Gramática, ortografía y escritura.'},
    division:{name:'Divisiones',icon:'÷',desc:'Divisiones por una y dos cifras.'},
    reading:{name:'Lectura',icon:'▤',desc:'Comprensión literal e inferencial.'},
    middleLanguage:{name:'Lengua 12-13',icon:'Aa',desc:'Gramática, ortografía, escritura y precisión lingüística.'},
    middleMath:{name:'Matemáticas 12-13',icon:'∑',desc:'Porcentajes, fracciones, ecuaciones, proporcionalidad y geometría.'},
    middleReading:{name:'Lectura 12-13',icon:'▤',desc:'Comprensión literal, inferencias y uso de evidencias.'},
    teenLanguage:{name:'Lengua 14+',icon:'Aa',desc:'Registro, argumentación y precisión lingüística.'},
    teenMath:{name:'Matemáticas 14+',icon:'∑',desc:'Porcentajes, ecuaciones y proporcionalidad.'},
    social:{name:'Social Lab',icon:'◎',desc:'Habilidades sociales y teoría de la mente.'}
  };
  let profile=null, data=null, subject=null, mode='grammar', currentItem=null, counter=0, answered=false, guided=null;
  let state=null;

  function blankState(){
    const subjects=(data&&data.subjects)||[]; const scores={},levels={},bySubject={};
    subjects.forEach(s=>{scores[s]=0;levels[s]=1;bySubject[s]={a:0,c:0}});
    return {scores,levels,totalCorrect:0,totalAttempts:0,history:[],seen:{},sessions:[],streak:0,session:{id:`s_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,startedAt:new Date().toISOString(),attempts:0,correct:0,bySubject}};
  }
  function normalizeState(saved){
    const b=blankState(); if(!saved)return b;
    b.scores={...b.scores,...(saved.scores||{})};b.levels={...b.levels,...(saved.levels||{})};
    b.totalCorrect=saved.totalCorrect||0;b.totalAttempts=saved.totalAttempts||0;b.history=saved.history||[];b.seen=saved.seen||{};b.sessions=saved.sessions||[];b.streak=0;
    return b;
  }
  function save(){if(profile&&state)ProfileStore.saveProgress(profile.id,{scores:state.scores,levels:state.levels,totalCorrect:state.totalCorrect,totalAttempts:state.totalAttempts,history:state.history.slice(-5000),seen:state.seen,sessions:state.sessions.slice(-30)});}
  function recent(subjectKey,n=10){return state.history.filter(x=>x.subject===subjectKey).slice(-n)}
  function recalcLevel(subjectKey){const r=recent(subjectKey,10);if(r.length<6)return;const acc=r.filter(x=>x.correct).length/r.length;let l=state.levels[subjectKey]||1;if(acc>=.82&&l<3)l++;else if(acc<=.42&&l>1)l--;state.levels[subjectKey]=l;}
  function saveResult(subjectKey,correct,itemId,detail='standard'){
    state.totalAttempts++;state.session.attempts++;state.session.bySubject[subjectKey] ||= {a:0,c:0};state.session.bySubject[subjectKey].a++;
    if(correct){state.totalCorrect++;state.session.correct++;state.session.bySubject[subjectKey].c++;state.streak++;}else state.streak=0;
    const points=correct?(10+(state.streak>0&&state.streak%3===0?5:0)):0;state.scores[subjectKey]=(state.scores[subjectKey]||0)+points;
    state.history.push({ts:new Date().toISOString(),sessionId:state.session.id,sessionStartedAt:state.session.startedAt,subject:subjectKey,correct,points,level:state.levels[subjectKey]||1,itemId,detail});state.history=state.history.slice(-5000);recalcLevel(subjectKey);save();updateGlobalUI();return points;
  }
  function pickUnseen(key,items){
    if(!items.length)return null;const seen=state.seen[key]||[];let remaining=items.filter(x=>!seen.includes(x.id));
    if(!remaining.length){state.seen[key]=[];remaining=[...items];}
    const item=remaining[Math.floor(Math.random()*remaining.length)];state.seen[key]=[...(state.seen[key]||[]),item.id];save();return item;
  }
  function bankKey(sub,submode,level){return [sub,submode||'main'].join(':')}
  function itemsFor(sub,submode){
    let bank=data[sub]; if(sub==='language')bank=data.language[submode||mode];
    const level=state.levels[sub]||1; return (bank||[]).filter(x=>x.level<=level);
  }
  function nextItem(sub,submode){const level=state.levels[sub]||1;const items=itemsFor(sub,submode);return pickUnseen(bankKey(sub,submode,level),items)}

  function buildProfiles(){
    const list=ProfileStore.list(),sel=$('#profileSelect');const ageLabel=a=>a==='teen'?'14+':a==='middle'?'12-13':'10-12';sel.innerHTML=list.map(p=>`<option value="${p.id}">${escapeHtml(p.name)} · ${ageLabel(p.ageBand)}</option>`).join('');if(profile)sel.value=profile.id;
  }
  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function openProfileGate(){ $('#profileGate').classList.remove('hidden');$('#newProfileName').focus(); }
  function closeProfileGate(){ $('#profileGate').classList.add('hidden'); }
  function createProfile(){const name=$('#newProfileName').value.trim();if(!name){$('#newProfileName').focus();return;}const p=ProfileStore.create(name,$('#newProfileAge').value);$('#newProfileName').value='';closeProfileGate();activateProfile(p.id);}
  function activateProfile(id,options={}){
    if(!options.skipSave)save();const p=ProfileStore.list().find(x=>x.id===id);if(!p){profile=null;openProfileGate();return;}ProfileStore.setCurrent(id);profile=p;data=window.LEARNING_DATA[p.ageBand];state=normalizeState(ProfileStore.loadProgress(id));subject=data.subjects[0];mode='grammar';currentItem=null;counter=0;buildProfiles();buildNavigation();buildHomework();switchSection('home');updateGlobalUI();
  }

  function buildNavigation(){
    const nav=$('#navMenu');const items=[['home','⌂','Inicio']];data.subjects.forEach(s=>items.push([s==='division'?'division':'exercise',SUBJECT_META[s].icon,SUBJECT_META[s].name,s]));items.push(['progress','↗','Progreso'],['homework','⇩','Fichas']);
    nav.innerHTML=items.map((x,i)=>`<button class="nav-item ${i===0?'active':''}" data-section="${x[0]}" ${x[3]?`data-subject="${x[3]}"`:''}>${x[1]} ${x[2]}</button>`).join('');
    $$('.nav-item').forEach(b=>b.onclick=()=>{if(b.dataset.subject){subject=b.dataset.subject;if(subject==='division')switchSection('division');else{switchSection('exercise');setupExerciseSubject();}}else switchSection(b.dataset.section)});
  }
  const titles={home:'Panel',exercise:'Entrenamiento',division:'Divisiones',progress:'Progreso',homework:'Fichas para casa'};
  function switchSection(id){$$('.section').forEach(s=>s.classList.remove('active-section'));$('#'+id).classList.add('active-section');$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.section===id&&(!b.dataset.subject||b.dataset.subject===subject)));$('#sectionTitle').textContent=id==='exercise'?SUBJECT_META[subject].name:titles[id];if(id==='progress')renderProgress();}

  function setupExerciseSubject(){
    const m=SUBJECT_META[subject];$('#exercisePill').textContent=m.name.toUpperCase();$('#exerciseHeading').textContent=m.name;$('#exerciseDescription').textContent=m.desc;$('#exerciseLevel').textContent=state.levels[subject]||1;$('#subjectScore').textContent=state.scores[subject]||0;
    const isLang=subject==='language';$('#languageModeSwitch').classList.toggle('hidden',!isLang); if(isLang){$$('.language-mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));}
    counter=0;showNewExercise();
  }
  function renderAngle(deg){return `<div class="angle-box"><div><div class="angle-lines" style="--angle:${deg}deg"></div><div class="angle-label">${deg}°</div></div></div>`}
  function showNewExercise(){
    answered=false;currentItem=nextItem(subject,subject==='language'?mode:null);if(!currentItem){$('#exercisePrompt').textContent='No hay ejercicios disponibles en este nivel.';return;}counter++;$('#exerciseCounter').textContent=`Ejercicio ${counter}`;$('#exerciseFeedback').textContent='';$('#exerciseFeedback').className='feedback';$('#exerciseExplanation').classList.add('hidden');$('#exerciseNext').classList.add('hidden');$('#selfAssessment').classList.add('hidden');$('#textAnswerArea').classList.add('hidden');$('#exerciseOptions').innerHTML='';$('#exerciseVisual').innerHTML='';
    const topic=currentItem.topic||currentItem.cat||'';$('#exerciseTopic').textContent=topic;$('#exerciseTopic').classList.toggle('hidden',!topic);
    if(currentItem.visual)$('#exerciseVisual').innerHTML=`<div class="shape-visual">${currentItem.visual}</div>`;if(currentItem.angle!==undefined)$('#exerciseVisual').innerHTML=renderAngle(currentItem.angle);
    if(subject==='reading'||subject==='middleReading')$('#exerciseVisual').innerHTML=`<div class="reading-passage"><h4>${escapeHtml(currentItem.title)}</h4><p>${escapeHtml(currentItem.text)}</p></div>`;
    $('#exercisePrompt').textContent=currentItem.q;$('#exerciseLevel').textContent=state.levels[subject]||1;$('#subjectScore').textContent=state.scores[subject]||0;
    if(currentItem.type==='self'){ $('#textAnswerArea').classList.remove('hidden');$('#textAnswerInput').value='';$('#textAnswerCheck').disabled=false;$('#textAnswerCheck').textContent='Ver una respuesta modelo'; }
    else renderOptions(currentItem);
    updatePoolStatus();
  }
  function renderOptions(item){const choices=shuffle(item.opts||[]);$('#exerciseOptions').innerHTML=choices.map(o=>`<button class="option-btn">${escapeHtml(o)}</button>`).join('');$$('#exerciseOptions .option-btn').forEach(b=>b.onclick=()=>checkOption(b,b.textContent));}
  function checkOption(btn,value){if(answered)return;answered=true;const correct=value===currentItem.a;$$('#exerciseOptions .option-btn').forEach(b=>{b.disabled=true;if(b.textContent===currentItem.a)b.classList.add('correct')});if(!correct)btn.classList.add('wrong');const pts=saveResult(subject,correct,currentItem.id,subject==='language'?mode:'standard');showFeedback(correct,pts,currentItem.why);}
  function showFeedback(correct,pts,why){const f=$('#exerciseFeedback');f.textContent=correct?`Correcto · +${pts} puntos`:`No esta vez. Respuesta: ${currentItem.a||'revisa el modelo'}`;f.className='feedback '+(correct?'ok':'bad');if(why){$('#exerciseExplanation').textContent=why;$('#exerciseExplanation').classList.remove('hidden');}$('#exerciseNext').classList.remove('hidden');}
  $('#exerciseNext').onclick=showNewExercise;
  $$('.language-mode-btn').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;$$('.language-mode-btn').forEach(x=>x.classList.toggle('active',x===b));counter=0;showNewExercise();});
  $('#textAnswerCheck').onclick=()=>{const own=$('#textAnswerInput').value.trim();$('#modelAnswer').textContent=currentItem.sample||currentItem.a||'Revisa si tu respuesta responde a la pregunta con claridad.';$('#selfAssessment').classList.remove('hidden');const intro=$('#selfAssessment p');if(intro)intro.textContent=own?'Compara tu respuesta con el modelo:':'Aquí tienes una posible respuesta. Después indica si sabías resolverlo o necesitas practicar:';$('#textAnswerCheck').disabled=true;$('#textAnswerCheck').textContent='Modelo mostrado';};
  $$('.self-buttons button').forEach(b=>b.onclick=()=>{if(answered)return;answered=true;const correct=b.dataset.self==='true';const pts=saveResult(subject,correct,currentItem.id,subject==='language'?mode:'self');$('#textAnswerCheck').disabled=false;showFeedback(correct,pts,currentItem.why);});
  function updatePoolStatus(){const level=state.levels[subject]||1,key=bankKey(subject,subject==='language'?mode:null,level),items=itemsFor(subject,subject==='language'?mode:null),seen=(state.seen[key]||[]).length;$('#poolStatus').textContent=`Banco nivel ${level}: ${Math.min(seen,items.length)} de ${items.length} vistos en este ciclo.`;}

  // DIVISIONES
  let divItem=null, divCount=0;
  function newDivision(){const level=state.levels.division||1;divItem=pickUnseen(bankKey('division','quick',level),data.division.filter(x=>x.level<=level));divCount++;$('#divisionCounter').textContent=`Ejercicio ${divCount}`;$('#divisionPrompt').textContent=`${divItem.dividend.toLocaleString('es-ES')} ÷ ${divItem.divisor}`;$('#divisionQuotient').value='';$('#divisionRemainder').value='';$('#divisionFeedback').textContent='';$('#divisionNext').classList.add('hidden');$('#divisionCheck').disabled=false;$('#divisionLevel').textContent=level;$('#divisionScore').textContent=state.scores.division||0;}
  $('#divisionCheck').onclick=()=>{if(!divItem)return;const q=Number($('#divisionQuotient').value),r=Number($('#divisionRemainder').value);if(!Number.isFinite(q)||!Number.isFinite(r))return;const ok=q===divItem.q&&r===divItem.rem;const pts=saveResult('division',ok,divItem.id,'quick');$('#divisionFeedback').textContent=ok?`Correcto · +${pts} puntos`:`Resultado: cociente ${divItem.q}, resto ${divItem.rem}`;$('#divisionFeedback').className='feedback '+(ok?'ok':'bad');$('#divisionCheck').disabled=true;$('#divisionNext').classList.remove('hidden');};
  $('#divisionNext').onclick=newDivision;
  $$('.division-mode-btn').forEach(b=>b.onclick=()=>{const guidedMode=b.dataset.divMode==='guided';$$('.division-mode-btn').forEach(x=>x.classList.toggle('active',x===b));$('#divisionQuick').classList.toggle('hidden',guidedMode);$('#divisionGuided').classList.toggle('hidden',!guidedMode);if(guidedMode)newGuided();});
  function newGuided(){const level=state.levels.division||1;const item=pickUnseen(bankKey('division','guided',level),data.division.filter(x=>x.level<=level));guided={item,step:0,steps:[{label:`¿Cuantas veces cabe ${item.divisor} en ${item.dividend}?`,ans:item.q},{label:`Multiplica ${item.divisor} × ${item.q}. ¿Cuanto da?`,ans:item.divisor*item.q},{label:`Resta ${item.dividend} − ${item.divisor*item.q}. ¿Cual es el resto?`,ans:item.rem}]};$('#guidedOperation').textContent=`${item.dividend.toLocaleString('es-ES')} ÷ ${item.divisor}`;renderGuided();}
  function renderGuided(){const s=guided.steps[guided.step];$('#guidedStepNumber').textContent=guided.step+1;$('#guidedInstruction').textContent=s.label;$('#guidedAnswer').value='';$('#guidedFeedback').textContent='';$('#guidedNext').classList.add('hidden');$('#guidedCheck').disabled=false;}
  $('#guidedCheck').onclick=()=>{const v=Number($('#guidedAnswer').value),s=guided.steps[guided.step];if(v!==s.ans){$('#guidedFeedback').textContent='Revisa este paso e inténtalo otra vez.';$('#guidedFeedback').className='feedback bad';return;}$('#guidedFeedback').textContent='Paso correcto.';$('#guidedFeedback').className='feedback ok';if(guided.step<guided.steps.length-1){guided.step++;setTimeout(renderGuided,350)}else{saveResult('division',true,guided.item.id,'guided');$('#guidedCheck').disabled=true;$('#guidedNext').classList.remove('hidden');}};
  $('#guidedNext').onclick=newGuided;

  function updateGlobalUI(){if(!profile||!state)return;const total=Object.values(state.scores).reduce((a,b)=>a+b,0);$('#globalScore').textContent=total;$('#homePoints').textContent=total;$('#homeCorrect').textContent=state.totalCorrect;$('#homeAttempts').textContent=state.totalAttempts;$('#homeAccuracy').textContent=(state.totalAttempts?Math.round(state.totalCorrect/state.totalAttempts*100):0)+'%';$('#streakCount').textContent=state.streak;$('#sessionAttempts').textContent=state.session.attempts;$('#activeProfileLabel').textContent=profile.name;$('#ageEyebrow').textContent=`${data.label} · entrenamiento personalizado`;$('#heroText').textContent=profile.ageBand==='teen'?'Lengua, matemáticas y situaciones sociales actuales con dificultad gradual.':profile.ageBand==='middle'?'Lengua, matemáticas y lectura adaptadas al paso a Secundaria.':'Geometría, lengua, divisiones y lectura con dificultad adaptativa.';renderHomeLevels();}
  function renderHomeLevels(){const el=$('#homeLevels');el.innerHTML=data.subjects.map(s=>`<div class="level-row"><strong>${SUBJECT_META[s].name}</strong><div class="level-track"><span style="width:${(state.levels[s]||1)/3*100}%"></span></div><span class="level-tag">NIVEL ${state.levels[s]||1}</span></div>`).join('');const stats=data.subjects.map(s=>{const r=recent(s,10);return{s,n:r.length,acc:r.length?r.filter(x=>x.correct).length/r.length:1}}).sort((a,b)=>a.acc-b.acc||b.n-a.n);const rec=stats[0];$('#recommendedTitle').textContent=rec.n?`Refuerzo: ${SUBJECT_META[rec.s].name}`:`Empieza por ${SUBJECT_META[data.subjects[0]].name}`;$('#recommendedText').textContent=rec.n?`En los últimos ejercicios tu precisión en esta área es del ${Math.round(rec.acc*100)}%.`:'Todavía no hay resultados suficientes para recomendar un área.';$('#recommendedBtn').dataset.subject=rec.n?rec.s:data.subjects[0];}
  $('#recommendedBtn').onclick=()=>{subject=$('#recommendedBtn').dataset.subject;if(subject==='division'){switchSection('division');newDivision()}else{switchSection('exercise');setupExerciseSubject();}};
  $('#heroStartBtn').onclick=()=>{subject=data.subjects[0];if(subject==='division'){switchSection('division');newDivision()}else{switchSection('exercise');setupExerciseSubject();}};

  function sessionGroups(){
    const groups=new Map();
    state.history.forEach((x,idx)=>{
      const fallback=`legacy_${(x.ts||'').slice(0,10) || 'historico'}`;
      const id=x.sessionId||fallback;
      if(!groups.has(id))groups.set(id,{id,start:x.sessionStartedAt||x.ts||'',end:x.ts||'',attempts:0,correct:0,points:0,bySubject:{}});
      const g=groups.get(id);g.end=x.ts||g.end;g.attempts++;if(x.correct)g.correct++;g.points+=x.points||0;g.bySubject[x.subject] ||= {a:0,c:0};g.bySubject[x.subject].a++;if(x.correct)g.bySubject[x.subject].c++;
    });
    return [...groups.values()].sort((a,b)=>String(a.start).localeCompare(String(b.start)));
  }
  function renderProgress(){
    $('#progressProfileTitle').textContent=`Evolución de ${profile.name}`;$('#progressCards').innerHTML=data.subjects.map(s=>{const r=state.history.filter(x=>x.subject===s),c=r.filter(x=>x.correct).length,acc=r.length?Math.round(c/r.length*100):0;return `<div class="progress-subject card"><small>${SUBJECT_META[s].name}</small><strong>${acc}%</strong><div class="bar"><span style="width:${acc}%"></span></div><small>${r.length} ejercicios · nivel ${state.levels[s]||1}</small></div>`}).join('');
    $('#recentResults').innerHTML=state.history.slice(-12).reverse().map(x=>`<div class="recent-row"><span>${SUBJECT_META[x.subject]?.name||x.subject}</span><span>${x.correct?'✓ Correcto':'× A revisar'}</span><strong>${x.points||0}</strong></div>`).join('')||'<p class="muted">Aún no hay resultados.</p>';
    const cov=[];Object.entries(state.seen).forEach(([k,v])=>cov.push(`<div class="coverage-row"><span>${k.replaceAll(':',' · ')}</span><strong>${v.length}</strong></div>`));$('#bankCoverage').innerHTML=cov.slice(-12).join('')||'<p class="muted">Los bancos se irán registrando al practicar.</p>';
    const sessions=sessionGroups();let previous=null;
    $('#sessionEvolution').innerHTML=sessions.length?`<table class="session-table"><thead><tr><th>Fecha</th><th>Ejercicios</th><th>Aciertos</th><th>Precisión</th><th>Puntos</th><th>Evolución</th></tr></thead><tbody>${sessions.slice(-15).map(g=>{const acc=g.attempts?Math.round(g.correct/g.attempts*100):0;let trend='—',cls='trend-flat';if(previous!==null){const d=acc-previous;if(d>=5){trend=`+${d} pp`;cls='trend-up'}else if(d<=-5){trend=`${d} pp`;cls='trend-down'}else trend=`${d>0?'+':''}${d} pp`;}previous=acc;return `<tr><td>${formatDate(g.start)}</td><td>${g.attempts}</td><td>${g.correct}</td><td><strong>${acc}%</strong></td><td>${g.points}</td><td class="${cls}">${trend}</td></tr>`}).join('')}</tbody></table>`:'<p class="muted">Cuando complete ejercicios en varias sesiones, aquí aparecerá la evolución.</p>';
  }
  function formatDate(iso){if(!iso)return 'Histórico';const d=new Date(iso);return Number.isNaN(d.getTime())?'Histórico':d.toLocaleString('es-ES',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});}
  function csvEscape(v){const s=String(v??'');return /[;"\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
  function downloadText(text,name){const blob=new Blob(['\uFEFF'+text],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}
  function exportDetailCsv(){
    const rows=[['usuario','grupo_edad','fecha_hora','sesion','area','nivel','resultado','puntos','ejercicio_id','tipo']];
    state.history.forEach(x=>rows.push([profile.name,data.label,x.ts,x.sessionId||'historico',SUBJECT_META[x.subject]?.name||x.subject,x.level,x.correct?'correcto':'revisar',x.points||0,x.itemId||'',x.detail||'']));
    downloadText(rows.map(r=>r.map(csvEscape).join(';')).join('\n'),`LearningLab_${profile.name.replace(/[^a-z0-9_-]+/gi,'_')}_detalle.csv`);
  }
  function exportSessionCsv(){
    const rows=[['usuario','grupo_edad','inicio_sesion','fin_sesion','ejercicios','aciertos','precision_pct','puntos',...data.subjects.flatMap(s=>[`${SUBJECT_META[s].name}_ejercicios`,`${SUBJECT_META[s].name}_precision_pct`])]];
    sessionGroups().forEach(g=>{const base=[profile.name,data.label,g.start,g.end,g.attempts,g.correct,g.attempts?Math.round(g.correct/g.attempts*100):0,g.points];data.subjects.forEach(s=>{const z=g.bySubject[s]||{a:0,c:0};base.push(z.a,z.a?Math.round(z.c/z.a*100):'');});rows.push(base)});
    downloadText(rows.map(r=>r.map(csvEscape).join(';')).join('\n'),`LearningLab_${profile.name.replace(/[^a-z0-9_-]+/gi,'_')}_sesiones.csv`);
  }

  function buildHomework(){
    const grid=$('#homeworkGrid');const cards=data.subjects.map(s=>({s,title:SUBJECT_META[s].name,desc:s==='reading'?'Textos nuevos + preguntas':s==='social'?'Situaciones abiertas para razonar':'10-12 ejercicios diferentes por versión'}));cards.push({s:'mixed',title:'Ficha mixta',desc:'Combina varias áreas del perfil'});grid.innerHTML=cards.map(c=>`<button class="download-card card" data-doc="${c.s}"><span>⇩</span><strong>${c.title}</strong><small>${c.desc}</small></button>`).join('');$$('.download-card').forEach(b=>b.onclick=()=>window.WorksheetGenerator.generate(b.dataset.doc,Number($('#worksheetCount').value),{profile,data,state,meta:SUBJECT_META}));
  }

  $('#exportDetailCsv').onclick=exportDetailCsv;$('#exportSessionCsv').onclick=exportSessionCsv;

  $('#createProfileBtn').onclick=createProfile;$('#newProfileName').addEventListener('keydown',e=>{if(e.key==='Enter')createProfile()});$('#newProfileBtn').onclick=openProfileGate;$('#profileSelect').onchange=e=>activateProfile(e.target.value);
  $('#deleteProfileBtn').onclick=()=>{if(!profile)return;if(confirm(`¿Eliminar el perfil de ${profile.name} y todo su progreso?`)){ProfileStore.remove(profile.id);const list=ProfileStore.list();if(list.length)activateProfile(list[0].id);else{profile=null;buildProfiles();openProfileGate();}}};
  $('#resetProgressBtn').onclick=()=>{if(!profile)return;if(confirm(`¿Reiniciar todo el progreso de ${profile.name}? Se borrarán puntos, niveles, historial y ejercicios vistos de este perfil.`)){const id=profile.id;ProfileStore.resetProgress(id);state=blankState();currentItem=null;counter=0;divItem=null;divCount=0;guided=null;save();buildNavigation();buildHomework();switchSection('home');updateGlobalUI();alert(`El progreso de ${profile.name} se ha reiniciado correctamente.`);}};

  window.addEventListener('beforeunload',save);
  const list=ProfileStore.list();const id=ProfileStore.currentId();if(list.length)activateProfile(list.some(p=>p.id===id)?id:list[0].id);else{buildProfiles();openProfileGate();}
})();

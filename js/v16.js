(function(){
  const LOCALES={
    es_intl:'Español internacional',es_es:'España',es_mx:'México',es_co:'Colombia',
    es_ar:'Argentina',es_cl:'Chile',es_pa:'Panamá',es_cr:'Costa Rica'
  };
  const SUBJECT_LABELS={
    geometry:'Geometría',language:'Lenguaje',division:'Divisiones',reading:'Lectura',
    middleLanguage:'Lenguaje 12-13',middleMath:'Matemáticas 12-13',middleReading:'Lectura 12-13',
    teenLanguage:'Lenguaje 14-17',teenMath:'Matemáticas 14-17',social:'Social Lab',english:'English Lab',
    literacy:'Lectura + Escritura',attention:'Atención',executive:'Funciones ejecutivas',memory:'Memoria',
    speedReasoning:'Velocidad y razonamiento',applied:'Cognición aplicada'
  };
  let currentLocale='es_intl';
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const profileKey=()=>`lh_v16_last_subject_${$('#profileSelect')?.value||'default'}`;

  function injectStyles(){
    if($('#v16Styles')) return;
    const style=document.createElement('style');
    style.id='v16Styles';
    style.textContent=`
      .main-content{padding-top:18px}
      .topbar{margin-bottom:12px;align-items:center;gap:14px}
      .topbar h2{font-size:1.52rem;margin-top:2px}
      .topbar-actions{gap:7px;max-width:72%;align-items:center}
      .topbar .session-chip,.topbar .streak-card,.topbar .mini-btn{padding:8px 10px;font-size:.77rem;box-shadow:none}
      #ageEyebrow{font-size:.62rem;letter-spacing:.11em}
      #home .hero{min-height:0;padding:22px 26px;background:linear-gradient(135deg,#fffdf8 0%,#f0f6ec 100%)}
      #home .hero:before{height:4px} #home .hero:after{display:none}
      #home .hero-copy{max-width:900px}
      #home .hero h3{font-size:1.82rem;line-height:1.12;margin:10px 0 7px;max-width:820px}
      #home .hero p{margin:0 0 14px;font-size:.93rem;max-width:760px}
      #home .hero .pill{padding:5px 8px;font-size:.6rem}
      #home .hero-visual{display:none!important}
      #home .dashboard-grid{margin-top:12px;gap:10px}
      #home .stat{padding:14px 16px;min-height:0} #home .stat>span{width:38px;height:38px;font-size:.68rem}
      #home .stat strong{font-size:1.45rem} #home .section-grid{margin-top:12px;gap:12px}
      #home .panel-card{padding:20px} #home .focus-card{background:linear-gradient(145deg,#1e5236,#173f2b)}
      .level-row{padding:9px 0}.level-track{height:8px}
      .v16-locale-panel{margin:-12px 0 14px;padding:12px 14px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.10);border-radius:8px}
      .v16-locale-panel label{display:block;color:#bdd3c4;font-size:.61rem;letter-spacing:.08em;font-weight:850;margin-bottom:6px}
      .v16-locale-panel select{width:100%;padding:9px 10px;border:0;border-radius:6px;background:#f5f1e6;color:#173326;font-weight:800;font-size:.8rem}
      .v16-locale-note{display:block;margin-top:7px;color:#a9c6b1;font-size:.61rem;line-height:1.35}
      .v16-toast{position:fixed;right:22px;bottom:22px;z-index:2000;background:#173c2a;color:#fff;padding:11px 14px;border-radius:8px;box-shadow:0 8px 22px rgba(0,0,0,.18);font-size:.8rem}
      .multi-option.selected:not(.correct):not(.wrong){outline:3px solid #7fae70;outline-offset:-3px;background:#eef6ea}
      .multi-option.correct{outline:none!important}
      .multi-limit-note{margin:.55rem 0 0;color:#7a5634;font-size:.78rem;font-weight:700}
      @media(max-width:1050px){.topbar{align-items:flex-start}.topbar-actions{max-width:68%}}
      @media(max-width:950px){.topbar-actions{max-width:100%}#home .hero{padding:20px}}
    `;
    document.head.appendChild(style);
  }

  function toast(msg){
    const old=$('.v16-toast'); if(old) old.remove();
    const el=document.createElement('div'); el.className='v16-toast'; el.textContent=msg; document.body.appendChild(el);
    setTimeout(()=>el.remove(),2400);
  }
  function setText(el,text){ if(el && el.textContent!==text) el.textContent=text; }

  function compactHero(){
    const hero=$('#home .hero'); if(!hero) return;
    const visual=hero.querySelector('.hero-visual'); if(visual) visual.style.display='none';
    setText(hero.querySelector('.pill'),'ENTRENAMIENTO PERSONALIZADO');
    setText(hero.querySelector('h3'),'Continúa tu entrenamiento');
    setText($('#heroText'),'Retoma la última área trabajada o utiliza el refuerzo recomendado para orientar la sesión.');
    const btn=$('#heroStartBtn');
    if(btn && !btn.dataset.v16Bound){
      btn.dataset.v16Bound='1'; btn.textContent='Continuar entrenamiento →';
      btn.onclick=()=>{
        const wanted=localStorage.getItem(profileKey());
        const target=wanted ? document.querySelector(`#navMenu .nav-item[data-subject="${CSS.escape(wanted)}"]`) : null;
        if(target) target.click(); else $('#recommendedBtn')?.click();
      };
    }
  }

  function rememberNavigation(){
    const nav=$('#navMenu'); if(!nav||nav.dataset.v16Bound) return;
    nav.dataset.v16Bound='1';
    nav.addEventListener('click',e=>{
      const b=e.target.closest('.nav-item[data-subject]');
      if(b?.dataset.subject) localStorage.setItem(profileKey(),b.dataset.subject);
    },true);
  }

  function setEyebrow(){
    const e=$('#ageEyebrow'); if(!e) return;
    const age=$('#profileSelect')?.selectedOptions?.[0]?.textContent?.split('·').slice(1).join('·').trim()||'';
    setText(e,`${age}${age?' · ':''}${LOCALES[currentLocale]||LOCALES.es_intl}`);
  }

  async function loadLocale(){
    try{
      const api=window.LearningAPI; if(!api?.client||!api.user) return;
      const {data,error}=await api.client.from('accounts').select('content_locale').single(); if(error) throw error;
      currentLocale=data?.content_locale||'es_intl';
      const sel=$('#v16ContentLocale'); if(sel && sel.value!==currentLocale) sel.value=currentLocale;
      setEyebrow();
    }catch(e){console.warn('V16 locale load',e);}
  }

  async function saveLocale(locale){
    const sel=$('#v16ContentLocale'); if(sel) sel.disabled=true;
    try{
      const api=window.LearningAPI; if(!api?.client||!api.user) throw new Error('Sesión no disponible');
      const {error}=await api.client.from('accounts').update({content_locale:locale}).eq('user_id',api.user.id); if(error) throw error;
      currentLocale=locale; setEyebrow(); toast(`Contenido adaptado a: ${LOCALES[locale]}`);
    }catch(e){console.warn('V16 locale save',e);toast('No se pudo guardar la preferencia regional.');await loadLocale();}
    finally{if(sel) sel.disabled=false;}
  }

  function addLocaleControl(){
    const panel=$('.profile-panel'); if(!panel||$('#v16LocalePanel')) return;
    const wrap=document.createElement('div'); wrap.id='v16LocalePanel'; wrap.className='v16-locale-panel';
    wrap.innerHTML=`<label for="v16ContentLocale">VARIANTE DE ESPAÑOL</label><select id="v16ContentLocale">${Object.entries(LOCALES).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><span class="v16-locale-note">Se aplica a los ejemplos y al vocabulario de todos los perfiles de esta cuenta.</span>`;
    panel.insertAdjacentElement('afterend',wrap);
    $('#v16ContentLocale').addEventListener('change',e=>saveLocale(e.target.value)); loadLocale();
  }

  function bindProfileChanges(){
    const sel=$('#profileSelect'); if(!sel||sel.dataset.v16ProfileBound) return;
    sel.dataset.v16ProfileBound='1';
    sel.addEventListener('change',()=>setTimeout(()=>{compactHero();rememberNavigation();setEyebrow();},80));
  }

  // V16.2 memory multi-select: never allow more answers than requested and clear the
  // temporary green selection styling when the exercise is checked.
  function fixMemoryMultiSelect(){
    const area=$('#exerciseOptions'); if(!area||area.dataset.v162MultiBound) return;
    area.dataset.v162MultiBound='1';
    area.addEventListener('click',e=>{
      const option=e.target.closest('.multi-option');
      if(option && !option.disabled){
        const count=$('#multiCount');
        const max=Number((count?.textContent||'').split('/')[1]?.split(' ')[0]||0);
        const selected=$$('#exerciseOptions .multi-option.selected');
        if(max && !option.classList.contains('selected') && selected.length>=max){
          e.preventDefault(); e.stopImmediatePropagation();
          let note=$('#multiLimitNote');
          if(!note){note=document.createElement('p');note.id='multiLimitNote';note.className='multi-limit-note';area.appendChild(note);}
          note.textContent=`Selecciona exactamente ${max} opciones. Para cambiar una, desmarca primero otra.`;
          return false;
        }
      }
      if(e.target.closest('#multiCheck')){
        setTimeout(()=>{
          $$('#exerciseOptions .multi-option').forEach(b=>b.classList.remove('selected'));
          $('#multiLimitNote')?.remove();
        },0);
      }
    },true);
  }

  function loadScript(src,test){
    return new Promise((resolve,reject)=>{
      if(test()) return resolve();
      const s=document.createElement('script'); s.src=src; s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
    });
  }
  function downloadBlob(blob,name){
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1800);
  }
  function dateText(v){
    const d=new Date(v); if(Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }
  function chartDataUrl(labels,values){
    const canvas=document.createElement('canvas'); canvas.width=1100; canvas.height=390;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fffdf8'; ctx.fillRect(0,0,canvas.width,canvas.height);
    const L=78,R=35,T=50,B=65,W=canvas.width-L-R,H=canvas.height-T-B;
    ctx.font='24px Arial';ctx.fillStyle='#173024';ctx.fillText('Evolución de la precisión por sesión',L,30);
    ctx.font='16px Arial';ctx.strokeStyle='#d9e1d9';ctx.fillStyle='#65766d';ctx.lineWidth=1;
    for(let y=0;y<=100;y+=25){const py=T+H-(y/100)*H;ctx.beginPath();ctx.moveTo(L,py);ctx.lineTo(L+W,py);ctx.stroke();ctx.fillText(`${y}%`,18,py+5);}
    if(values.length){
      ctx.strokeStyle='#2f7d4a';ctx.lineWidth=5;ctx.beginPath();
      values.forEach((v,i)=>{const x=L+(values.length===1?W/2:(i/(values.length-1))*W),y=T+H-(v/100)*H;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
      values.forEach((v,i)=>{const x=L+(values.length===1?W/2:(i/(values.length-1))*W),y=T+H-(v/100)*H;ctx.fillStyle='#2f7d4a';ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();});
      const step=Math.max(1,Math.ceil(labels.length/7));ctx.font='14px Arial';ctx.fillStyle='#65766d';ctx.textAlign='center';
      labels.forEach((lab,i)=>{if(i%step===0||i===labels.length-1){const x=L+(labels.length===1?W/2:(i/(labels.length-1))*W);ctx.fillText(lab,x,T+H+32);}});
    }else{ctx.fillStyle='#65766d';ctx.font='18px Arial';ctx.fillText('Aún no hay suficientes sesiones para mostrar una evolución.',L,T+H/2);}
    return canvas.toDataURL('image/png');
  }

  async function exportEvolutionExcel(){
    const btn=$('#exportSessionCsv'); if(btn) btn.disabled=true;
    try{
      await loadScript('https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',()=>Boolean(window.ExcelJS));
      const api=window.LearningAPI, profileId=$('#profileSelect')?.value;
      if(!api?.client||!profileId) throw new Error('No hay un perfil activo.');
      const [{data:prof,error:pe},{data:rows,error:re}]=await Promise.all([
        api.client.from('learner_profiles').select('name,age_band,progress').eq('id',profileId).single(),
        api.client.from('exercise_results').select('occurred_at,session_id,session_started_at,subject,level,correct,points,item_id,detail').eq('profile_id',profileId).order('occurred_at',{ascending:true})
      ]);
      if(pe) throw pe; if(re) throw re;
      const data=rows||[], sessions=new Map();
      data.forEach((r,i)=>{
        const sid=r.session_id||`sin_sesion_${i}`;
        if(!sessions.has(sid)) sessions.set(sid,{id:sid,start:r.session_started_at||r.occurred_at,rows:[]});
        sessions.get(sid).rows.push(r);
      });
      const sess=[...sessions.values()].map((s,i)=>{
        const n=s.rows.length,c=s.rows.filter(r=>r.correct).length,p=s.rows.reduce((a,r)=>a+Number(r.points||0),0);
        return {num:i+1,id:s.id,start:s.start,n,c,e:n-c,acc:n?Math.round(c/n*100):0,p,areas:[...new Set(s.rows.map(r=>SUBJECT_LABELS[r.subject]||r.subject))].join(', '),avg:s.rows.length?s.rows.reduce((a,r)=>a+Number(r.level||1),0)/s.rows.length:1};
      });
      const wb=new ExcelJS.Workbook(); wb.creator='Learning Hub'; wb.created=new Date();
      const dark='173C2A',green='2F7D4A',light='E5F1E8',cream='FFFDF8',muted='65766D',white='FFFFFF',red='FCE8E8';
      const headerStyle=row=>{row.font={bold:true,color:{argb:white}};row.fill={type:'pattern',pattern:'solid',fgColor:{argb:dark}};row.alignment={vertical:'middle'};row.height=24;};
      const title=(ws,text,range)=>{ws.mergeCells(range);const c=ws.getCell(range.split(':')[0]);c.value=text;c.font={bold:true,size:20,color:{argb:dark}};c.alignment={vertical:'middle'};ws.getRow(c.row).height=32;};

      const detail=wb.addWorksheet('Detalle',{views:[{state:'frozen',ySplit:1}]});
      detail.columns=[{header:'Fecha y hora',key:'date',width:22},{header:'Sesión ID',key:'sid',width:22},{header:'Área',key:'subject',width:27},{header:'Nivel',key:'level',width:10},{header:'Ejercicio ID',key:'item',width:30},{header:'Resultado',key:'result',width:14},{header:'Puntos',key:'points',width:11},{header:'Mecánica',key:'detail',width:22}];
      headerStyle(detail.getRow(1)); detail.autoFilter='A1:H1';
      data.forEach(r=>{const row=detail.addRow({date:dateText(r.occurred_at),sid:r.session_id||'',subject:SUBJECT_LABELS[r.subject]||r.subject,level:r.level,item:r.item_id,result:r.correct?'Correcto':'A revisar',points:r.points||0,detail:r.detail||''});row.alignment={vertical:'top',wrapText:true};row.font={color:{argb:'173024'}};row.getCell(6).fill={type:'pattern',pattern:'solid',fgColor:{argb:r.correct?light:red}};});

      const evo=wb.addWorksheet('Evolución por sesiones',{views:[{state:'frozen',ySplit:3}]});
      title(evo,`Evolución por sesiones · ${prof.name}`,'A1:I1');
      evo.getCell('A2').value='Una fila por sesión de uso. La precisión permite seguir la evolución sin perder el volumen de práctica.';evo.mergeCells('A2:I2');evo.getCell('A2').font={italic:true,color:{argb:muted}};
      evo.addRow(['Sesión','Fecha de inicio','Ejercicios','Aciertos','Errores','Precisión','Puntos','Áreas trabajadas','Nivel medio']); headerStyle(evo.getRow(3));
      evo.columns=[{width:10},{width:22},{width:13},{width:11},{width:11},{width:13},{width:11},{width:42},{width:13}];
      sess.forEach(s=>{const r=evo.addRow([s.num,dateText(s.start),s.n,s.c,s.e,s.acc/100,s.p,s.areas,s.avg]);r.getCell(6).numFmt='0%';r.getCell(9).numFmt='0.0';r.alignment={vertical:'top',wrapText:true};});
      evo.autoFilter={from:'A3',to:'I3'};

      const sum=wb.addWorksheet('Resumen',{views:[{showGridLines:false}]});
      title(sum,'Learning Hub · Informe de evolución','A1:H2');
      sum.mergeCells('A3:H3');sum.getCell('A3').value=`Perfil: ${prof.name} · Grupo: ${prof.age_band||''} · Exportado: ${new Date().toLocaleDateString('es-ES')}`;sum.getCell('A3').font={color:{argb:muted},italic:true};
      sum.getCell('A5').value='INDICADOR';sum.getCell('B5').value='VALOR';headerStyle(sum.getRow(5));
      const end=Math.max(2,data.length+1);
      const metrics=[
        ['Ejercicios realizados',{formula:`COUNTA(Detalle!A2:A${end})`,result:data.length}],
        ['Aciertos',{formula:`COUNTIF(Detalle!F2:F${end},"Correcto")`,result:data.filter(r=>r.correct).length}],
        ['Precisión global',{formula:'IF(B6=0,0,B7/B6)',result:data.length?data.filter(r=>r.correct).length/data.length:0}],
        ['Puntos acumulados',{formula:`SUM(Detalle!G2:G${end})`,result:data.reduce((a,r)=>a+Number(r.points||0),0)}],
        ['Sesiones registradas',sess.length]
      ];
      metrics.forEach((m,i)=>{const row=6+i;sum.getCell(`A${row}`).value=m[0];sum.getCell(`B${row}`).value=m[1];sum.getCell(`A${row}`).font={bold:true,color:{argb:dark}};sum.getCell(`B${row}`).font={bold:true,size:14,color:{argb:green}};});
      sum.getCell('B8').numFmt='0%';sum.getColumn('A').width=27;sum.getColumn('B').width=18;for(let i=3;i<=8;i++)sum.getColumn(i).width=15;
      sum.getCell('D5').value='NIVELES ACTUALES';sum.mergeCells('D5:F5');sum.getCell('D5').font={bold:true,color:{argb:white}};sum.getCell('D5').fill={type:'pattern',pattern:'solid',fgColor:{argb:dark}};
      const levels=prof.progress?.levels||{};let rr=6;Object.entries(levels).forEach(([k,v])=>{sum.getCell(`D${rr}`).value=SUBJECT_LABELS[k]||k;sum.getCell(`E${rr}`).value=`Nivel ${v}`;rr++;});
      const chart=chartDataUrl(sess.map(s=>`S${s.num}`),sess.map(s=>s.acc));const img=wb.addImage({base64:chart,extension:'png'});sum.addImage(img,{tl:{col:0,row:12},ext:{width:780,height:278}});
      sum.getRow(12).height=20;
      [sum,evo,detail].forEach(ws=>{ws.properties.defaultRowHeight=20;ws.eachRow(row=>row.eachCell(cell=>{cell.border={bottom:{style:'hair',color:{argb:'D9E1D9'}}};}));});
      const buffer=await wb.xlsx.writeBuffer();downloadBlob(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`LearningLab_${String(prof.name||'perfil').replace(/[^a-z0-9_-]+/gi,'_')}_evolucion.xlsx`);
      toast('Informe Excel generado.');
    }catch(e){console.error('V16.2 export',e);toast(e?.message||'No se pudo generar el informe Excel.');}
    finally{if(btn) btn.disabled=false;}
  }

  function upgradeExports(){
    const btn=$('#exportSessionCsv'); if(!btn||btn.dataset.v162Bound) return;
    btn.dataset.v162Bound='1';btn.textContent='Descargar informe Excel';btn.title='Resumen visual, evolución por sesiones, detalle y gráfica';btn.onclick=exportEvolutionExcel;
    const detail=$('#exportDetailCsv'); if(detail) detail.textContent='Descargar CSV de datos';
  }

  function enhance(){
    injectStyles();compactHero();rememberNavigation();addLocaleControl();bindProfileChanges();setEyebrow();fixMemoryMultiSelect();upgradeExports();
  }

  window.addEventListener('load',()=>{
    let tries=0;const wait=setInterval(()=>{tries++;if(window.LearningAPI&&$('#appShell')){clearInterval(wait);enhance();[250,700,1500,3000].forEach(ms=>setTimeout(enhance,ms));}if(tries>100)clearInterval(wait);},120);
  });
})();

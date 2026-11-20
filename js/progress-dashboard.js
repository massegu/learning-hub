(function(root){
  'use strict';

  const dayMs=86400000;
  const shortDate=new Intl.DateTimeFormat('es',{day:'numeric',month:'short',timeZone:'UTC'});
  const fullDate=new Intl.DateTimeFormat('es',{dateStyle:'long',timeZone:'UTC'});
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dayOf=date=>Math.floor(new Date(date).valueOf()/dayMs);
  const at=day=>new Date(day*dayMs);
  const signed=n=>n>0?'+'+n:String(n);

  function snapshot(report,{days=28,area='',now=Date.now()}={}){
    const end=dayOf(now), start=end-days+1;
    const dates=Array.from({length:days},(_,i)=>({day:start+i,count:0}));
    let previous=0;
    const entries=report.rows.filter(entry=>{
      if(area&&area!==entry.area)return false;
      const day=entry.row.ts?dayOf(entry.row.ts):NaN;
      if(!Number.isFinite(day)||day>end||day<start-days)return false;
      if(day<start){previous++;return false;}
      dates[day-start].count++;
      return true;
    });
    const areas=new Set(),families=new Map(), groups={scored:0,rules:0,wait:0,typing:0,supervised:0,practice:0};
    let correct=0;
    for(const entry of entries){
      areas.add(entry.area);
      const modality=entry.measure?.modality;
      const group=modality==='falling_words'?'typing':modality==='communication_supervised'?'supervised':entry.category;
      groups[group]++;
      if(group!=='scored')continue;
      if(entry.row.correct===true)correct++;
      const familyCode=entry.measure?.modality||entry.row.speedFamily||entry.row.detail;
      if(!Object.hasOwn(root.ProgressReport.activities,familyCode))continue;
      const key=entry.area+'|'+familyCode+'|'+(entry.row.level||'')+'|'+(entry.measure?.definition_version??entry.row.speedRevision??'');
      if(!families.has(key))families.set(key,{area:entry.area,name:entry.activity,level:entry.row.level,count:0,correct:0,previousCount:0,previousCorrect:0});
      const family=families.get(key);
      family.count++;
      if(entry.row.correct===true)family.correct++;
    }
    for(const entry of report.rows){
      if(entry.category!=='scored'||!entry.row.ts)continue;
      const day=dayOf(entry.row.ts);
      if(day<start-days||day>=start||!Number.isFinite(day))continue;
      const familyCode=entry.measure?.modality||entry.row.speedFamily||entry.row.detail;
      const family=families.get(entry.area+'|'+familyCode+'|'+(entry.row.level||'')+'|'+(entry.measure?.definition_version??entry.row.speedRevision??''));
      if(!family)continue;
      family.previousCount++;
      if(entry.row.correct===true)family.previousCorrect++;
    }
    return {dates,previous,changes:entries.length-previous,total:entries.length,areas:areas.size,groups,correct,
      families:[...families.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'es')),
      areaNames:[...new Set(report.rows.map(entry=>entry.area))].sort((a,b)=>a.localeCompare(b,'es')),
      withoutDate:report.rows.filter(entry=>(!area||area===entry.area)&&(!entry.row.ts||!Number.isFinite(dayOf(entry.row.ts)))).length};
  }

  function volumeChart(dates){
    const ceiling=Math.max(1,...dates.map(d=>d.count)),step=600/(dates.length-1);
    const dots=dates.map((d,i)=>({x:44+i*step,y:161-126*d.count/ceiling,...d}));
    const path=dots.reduce((p,d,i)=>{
      if(!i)return 'M'+d.x+' '+d.y;
      const before=dots[i-1],middle=(before.x+d.x)/2;
      return p+' C'+middle+' '+before.y+' '+middle+' '+d.y+' '+d.x+' '+d.y;
    },'');
    return `<svg class="progress-volume-chart" viewBox="0 0 670 190" aria-hidden="true">
     <defs><linearGradient id="gliaxVolumeFill" x2="0" y2="1"><stop stop-color="#6dc4b1" stop-opacity=".55"/><stop offset="1" stop-color="#6dc4b1" stop-opacity="0"/></linearGradient></defs>
     <path class="progress-volume-grid" d="M44 35h600M44 98h600M44 161h600"/>
     <text x="3" y="40">${ceiling}</text><text x="3" y="166">0</text>
     <path d="${path}V161H44Z" fill="url(#gliaxVolumeFill)"/><path d="${path}" class="progress-volume-line"/>
     <text x="44" y="183">${shortDate.format(at(dates[0].day))}</text><text x="644" y="183" text-anchor="end">${shortDate.format(at(dates.at(-1).day))}</text>
    </svg>`;
  }

  function render(holder,report,{days=28,area='',pending=null,now=Date.now(),onChange}={}){
    const model=snapshot(report,{days,area,now});
    const {dates,groups}=model;
    const completed=model.total, nonScored=groups.wait+groups.typing+groups.supervised+groups.practice;
    const rate=groups.scored?Math.round(100*model.correct/groups.scored)+'%':'—';
    const kpi=(label,value,caption)=>`<article class="card progress-kpi"><span>${label}</span><strong>${value}</strong><small>${caption}</small></article>`;
    const heading=(title,subtitle)=>`<h3>${title}</h3><p class="progress-panel-subtitle">${subtitle}</p>`;
    const series=[['scored','Ejercicios puntuables'],['rules','Aplicación de reglas'],['wait','Espera guiada'],['typing','Mecanografía'],['supervised','Revisión supervisada'],['practice','Otras prácticas']];
    const distribution=series.map(([key,label])=>`<li data-category="${key}" data-count="${groups[key]}"><span>${label}</span><strong>${groups[key]}</strong><meter min="0" max="${Math.max(1,completed)}" value="${groups[key]}" aria-label="${label}"></meter></li>`).join('');
    const counts=countsTable(dates);
    const max=Math.max(1,...dates.map(d=>d.count));
    const offset=(at(dates[0].day).getUTCDay()+6)%7;
    const weekCount=Math.ceil((dates.length+offset)/7);
    const blank='<span class="progress-calendar-blank"></span>';
    const intensity=blank.repeat(offset)+dates.map(({day,count})=>`<span data-intensity="${count?Math.ceil(count*4/max):0}" title="${fullDate.format(at(day))} · ${count}"></span>`).join('')+blank.repeat(weekCount*7-dates.length-offset);
    const familyRows=model.families.map(f=>`<tr><th scope="row">${escape(f.name)}<small>${escape(f.area)}${f.level?` · nivel ${Number(f.level)}`:""}</small></th><td>${f.correct}/${f.count}</td><td>${f.previousCount?f.previousCorrect+'/'+f.previousCount:'—'}</td></tr>`).join('');
    holder.innerHTML=`
      <div class="progress-filters"><label>Periodo <select id="progressPeriod">${[14,28,84].map(n=>`<option value="${n}"${days===n?' selected':''}>Últimos ${n} días</option>`).join('')}</select></label>
      <label>Área <select id="progressArea"><option value="">Todas las áreas</option>${model.areaNames.map(name=>`<option${area===name?' selected':''}>${escape(name)}</option>`).join('')}</select></label></div>
      <div class="progress-kpis">
       ${kpi('Actividades registradas',completed,`${signed(model.changes)} frente a los ${days} días anteriores`)}
       ${kpi('Precisión en ejercicios puntuables',rate,groups.scored?`${model.correct} aciertos de ${groups.scored}`:'Sin ejercicios puntuables en el periodo')}
       ${kpi('Áreas trabajadas',model.areas,`${nonScored} prácticas sin puntuación`)}
      </div>
      <div class="progress-layout">
       <article class="card progress-panel progress-volume">${heading('Actividad en el tiempo','Registros diarios · fechas en UTC')}
        ${completed?volumeChart(dates):'<p class="progress-empty">Todavía no hay actividad registrada en este periodo.</p>'}
        ${completed?counts:''}
        ${model.withoutDate?`<p class="progress-panel-subtitle">${model.withoutDate} registros sin fecha válida quedan disponibles en el informe histórico.</p>`:''}
       </article>
       <article class="card progress-panel progress-distribution">${heading('Distribución de actividades','Modalidades registradas por separado')}
        <ul class="progress-distribution-list">${distribution}</ul>
        ${pending?`<p class="progress-pending">${pending} pendientes en la sesión abierta.</p>`:'<p class="progress-pending">Sin sesión en curso.</p>'}
       </article>
       <article class="card progress-panel progress-calendar">${heading('Calendario de práctica','Intensidad según el número de actividades del periodo')}
        <div class="progress-calendar-grid" aria-hidden="true"><div class="progress-weekdays"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div class="progress-intensity" style="--weeks:${weekCount}">${intensity}</div></div>
        <p class="progress-calendar-key">Menos actividad <i></i><i></i><i></i><i></i> Más actividad</p>
        ${counts}
       </article>
       <article class="card progress-panel progress-families">${heading('Evolución por familia','Aciertos e intentos de la misma familia en cada periodo')}
        ${familyRows?`<div class="progress-data-table"><table><thead><tr><th scope="col">Familia y área</th><th scope="col">Periodo actual</th><th scope="col">Anterior</th></tr></thead><tbody>${familyRows}</tbody></table></div>`:'<p class="progress-empty">Las familias puntuables aparecerán tras registrar respuestas.</p>'}
       </article>
      </div>`;
    const periodControl=holder.querySelector('#progressPeriod'),areaControl=holder.querySelector('#progressArea');
    const update=event=>onChange({days:Number(periodControl.value),area:areaControl.value},event.target.id);
    periodControl.onchange=areaControl.onchange=update;
  }

  function countsTable(dates){
    return `<details class="progress-chart-data"><summary>Ver registros por fecha</summary><div class="progress-data-table"><table><thead><tr><th scope="col">Fecha</th><th scope="col">Actividades</th></tr></thead><tbody>${dates.map(({day,count})=>`<tr><th scope="row">${fullDate.format(at(day))}</th><td>${count}</td></tr>`).join('')}</tbody></table></div></details>`;
  }
  const api={snapshot,render};
  root.ProgressDashboard=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

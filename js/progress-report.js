(function(root){
  'use strict';

  const areas={language:'Lenguaje',middleLanguage:'Lenguaje',teenLanguage:'Lenguaje',literacy:'Lectura y escritura',reading:'Lectura y escritura',middleReading:'Lectura y escritura',executive:'Funciones ejecutivas',memory:'Memoria',attention:'Atención',speedReasoning:'Velocidad de procesamiento',communication:'Comunicación funcional',applied:'Situaciones cotidianas',social:'Perspectivas y convivencia',division:'Matemáticas',middleMath:'Matemáticas',teenMath:'Matemáticas',geometry:'Matemáticas',english:'Inglés'};
  const activities={unpaired:'Busca el símbolo sin pareja',figures:'Figuras',objects:'Objetos',arrows:'Flechas',orientation:'Orientación',pictograms:'Pictogramas',characters:'Letras y números',mixed:'Series mixtas',category:'Categorías',key:'Clave de códigos',match:'Coincidencias',search:'Búsqueda visual',pairs:'Revisar parejas',flanker:'Ignorar distractores',translation:'Traducción de claves',crossedKeys:'Cruzar dos claves',rapidAgenda:'Agenda rápida',ruleChoice:'Cambiar de criterio',guided_wait:'Espera guiada',rule_application:'Actúa con reglas',symbol_rules:'Actúa con reglas',executed_executive_switch:'Adivina la regla',interaction_movement:'Movimiento y pausa',executed_memory_spatial:'Memoria espacial',executed_memory_serial:'Recuerdo en orden',executed_memory_update:'Actualizar el recuerdo',memory_sequence:'Recuerda secuencias',memory_spatial:'Recuerda posiciones',memory_photo:'Escenas cotidianas',memory_association:'Asociar nombre y objeto',plan_update:'Cambio de plan',planning_constraints:'Organizar con condiciones',word_fit:'La palabra que encaja',falling_words:'Palabras en caída',cognitive_deduction:'Descubre quién',cognitive_change:'Cambio de plan',cognitive_words:'La palabra que encaja',cognitive_information:'¿Qué necesitas saber?',cognitive_contradiction:'Encuentra la contradicción',attention_photo_differences:'Encuentra las diferencias',communication:'Comunicación funcional',communication_confirmReceipt:'Confirmar una recepción',communication_privacyAudience:'Elegir el destinatario',communication_repairMismatch:'Corregir un malentendido',communication_feedback:'Dar una indicación útil',communication_report:'Informar de una incidencia'};
  activities.math_problem_steps='Resolución de problemas';
  const digitalFormats={message:'Conversaciones',post:'Publicaciones y comentarios',clip:'Vídeos cortos',story:'Historias y mensajes',search:'Búsquedas',notice:'Notificaciones y privacidad',app:'Agenda de equipo'};
  for(const area of ['attention','communication','executive','language','memory','reading']){
    for(const [format,name] of Object.entries(digitalFormats))activities['digital_'+area+'_'+format]=name;
  }
  const label={scored:'Ejercicios puntuables',rules:'Aplicación de reglas',wait:'Espera guiada',practice:'Otras prácticas'};
  function metrics(row){
    try{const value=typeof row.detail==='string'?JSON.parse(row.detail):row.detail;return value?.schema==='gliax.exercise-metrics.v1'?value:null;}
    catch{return null;}
  }
  function summarize(rows){
    const correct=rows.filter(row=>row.correct===true).length;
    const scored=rows.filter(row=>typeof row.correct==='boolean').length;
    return {count:rows.length,scored,correct,precision:scored?Math.round(correct*100/scored):null,points:rows.reduce((sum,row)=>sum+(Number(row.points)||0),0)};
  }
  function build(history){
    const rows=history.map(row=>{
      const measure=metrics(row);
      const modality=measure?.modality;
      const category=modality==='math_problem_steps'&&measure.definition_version===2?'practice':modality==='guided_wait'?'wait':modality==='rule_application'||row.detail==='symbol_rules'?'rules':typeof row.correct==='boolean'?'scored':'practice';
      const ruleFamily=modality==='rule_application'&&(measure.variant==='infer_rule'||/^cognitive-v\d[^:]*:[^:]+:executive:\d+:rules:/.test(row.itemId||''));
      return {row,measure,category,area:areas[row.speedFamily?'speedReasoning':row.subject]||'Otra área',activity:(ruleFamily?'Adivina la regla':activities[modality||row.speedFamily||row.detail])||areas[row.subject]||'Actividad histórica'};
    });
    const groups=Object.fromEntries(Object.keys(label).map(category=>[category,summarize(rows.filter(entry=>entry.category===category).map(entry=>entry.row))]));
    const domains=new Map(),dates=new Map();
    for(const entry of rows.filter(entry=>entry.category==='scored')){
      const row=entry.row,key=row.sessionId||row.ts?.slice(0,10)||'anterior';
      if(!domains.has(entry.area))domains.set(entry.area,[]);
      domains.get(entry.area).push(row);
      if(!dates.has(key))dates.set(key,{date:row.sessionStartedAt||row.ts,rows:[]});
      dates.get(key).rows.push(row);
    }
    return {rows,groups,areas:new Map([...domains].map(([k,values])=>[k,summarize(values)])),
      sessions:[...dates.values()].map(({date,rows})=>({date,...summarize(rows)}))};
  }
  const metricLabels={trials:'Ensayos',correct:'Aciertos',errors:'Errores',omissions:'Omisiones',switches:'Cambios de regla',interval_ms:'Intervalo previsto (ms)',duration_ms:'Duración activa (ms)',restarts:'Reinicios',interruptions:'Interrupciones',associations:'Pares',exposure_ms:'Exposición (ms)',window_ms:'Límite por palabra (ms)'};
  function observations(m){
    if(!m)return '';
    const parts=Object.entries(metricLabels).filter(([key])=>Number.isFinite(m[key])).map(([key,title])=>title+' '+m[key]);
    if(Array.isArray(m.response_times_ms)&&m.response_times_ms.length)parts.push('Tiempos observados (ms) '+m.response_times_ms.filter(Number.isFinite).join(', '));
    if(Array.isArray(m.rounds))parts.push(...m.rounds.map((round,i)=>{
      const first=Number.isFinite(round.first_input_ms)?round.first_input_ms+' ms':'—';
      const submit=Number.isFinite(round.input_to_submit_ms)?round.input_to_submit_ms+' ms':'—';
      const result={correct:'acierto',error:'error',omitted:'sin respuesta'}[round.outcome]||'sin dato';
      return `Palabra ${i+1} (${result}), primera entrada ${first}, de entrada a confirmación ${submit}`;
    }));
    if(m.modality==='math_problem_steps'&&m.definition_version===2&&Array.isArray(m.operations)){
      const labels={add:'suma',subtract:'resta',multiply:'multiplicación',divide:'división'};
      parts.push(m.family,'Estrategia '+String(m.strategy||'').replaceAll('_',' '),
        'Operaciones elegidas sin apoyo '+m.unassisted_selections+'/'+m.operations.length,
        'Cálculos correctos sin apoyo '+m.unassisted_calculations+'/'+m.operations.length,
        'Interpretación '+(m.interpretation_correct?'correcta':m.interpretation?.guided?'guiada':'por revisar'),
        m.support_used?'Con apoyo consultado':'Sin apoyo consultado');
      for(const op of m.operations)parts.push('Paso '+op.position+' ('+(labels[op.operation]||'operación')+')'+
        ' · '+op.selection_attempts+' intentos de elección · '+op.calculation_attempts+' intentos de cálculo'+
        (op.guided?' · guiado':''));
    }
    if(m.modality==='math_problem_steps'&&m.steps){
      const stages={intermediate_datum:'Dato intermedio',first_operation:'Primera operación',intermediate_calculation:'Cálculo intermedio',final_operation:'Operación final',final_answer:'Respuesta final'};
      for(const [key,label] of Object.entries(stages)){
        if(typeof m.steps[key]==='boolean')parts.push(label+' '+(m.steps[key]?'correcto':'por revisar'));
      }
      parts.push('Ayuda '+(m.hint_used?'consultada':'sin consulta adicional'));
    }
    if(m.response_mode)parts.push(m.response_mode==='written'?'Respuesta escrita':'Selección de opciones');
    if(m.purpose==='lexical_selection')parts.push('Selección léxica sin cronómetro');
    if(m.pace)parts.push('Ritmo '+({slow:'tranquilo',standard:'normal',fast:'rápido'}[m.pace]||'sin dato'));
    if(m.presentation)parts.push(m.presentation==='static'?'Palabras quietas':'Palabras en movimiento');
    return parts.join(' · ');
  }
  function tables(report,code,age){
    const format=precision=>precision===null?'':precision;
    return {
      'Resumen':[['GLIAX · Resumen de práctica'],['Código de perfil',code],['Franja de edad',age],['Modalidad','Registros','Con puntuación','Aciertos','Precisión (%)','Puntos'],
        ...Object.entries(report.groups).map(([key,g])=>[label[key],g.count,g.scored,g.correct,format(g.precision),g.points])],
      'Sesiones':[['GLIAX · Ejercicios puntuables por sesión'],['Fecha','Ejercicios','Aciertos','Precisión (%)','Puntos'],
        ...report.sessions.map(g=>[g.date,g.count,g.correct,format(g.precision),g.points])],
      'Detalle':[['GLIAX · Registro de actividades'],['Código','Fecha','Área','Actividad','Modalidad','Nivel','Resultado','Puntos','Tiempo (ms)','Validez del tiempo','Versión de la actividad','Esquema de métricas','Observaciones','Referencia del intento'],
        ...report.rows.map(({row,measure,category,area,activity})=>[code,row.ts,area,activity,label[category],row.level,
          category==='wait'?'Intervalo finalizado':row.correct===true?'Correcto':row.correct===false?'Por revisar':'Práctica registrada',
          row.points,Number.isFinite(row.responseMs)?row.responseMs:'',typeof row.timingValid==='boolean'?(row.timingValid?'Válido':'Excluido'):'',
          measure?.definition_version??(row.speedFamily?(row.speedRevision||2):''),measure?'1':'',observations(measure),row.clientAttemptId||row.client_attempt_id||''])],
      'Áreas':[['GLIAX · Ejercicios puntuables por área'],['Área','Ejercicios','Aciertos','Precisión (%)','Puntos'],
        ...[...report.areas].map(([area,g])=>[area,g.count,g.correct,format(g.precision),g.points])]
    };
  }
  function csv(rows){
    return rows.map(row=>row.map(value=>{
      let text=String(value??'');
      if(typeof value==='string'&&/^\s*[=+@-]|^[\t\r\n]/.test(text))text="'"+text;
      return /[;"\r\n]/.test(text)?'"'+text.replaceAll('"','""')+'"':text;
    }).join(';')).join('\r\n');
  }
  const xml=value=>String(value??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
  async function excel(tables,Zip){
    const zip=new Zip(),names=Object.keys(tables);
    const schema='http://schemas.openxmlformats.org';
    const main=schema+'/spreadsheetml/2006/main';
    const office=schema+'/officeDocument/2006/relationships';
    const pkg=schema+'/package/2006/relationships';
    const sheetId=i=>'rId'+(i+1);
    const widths={'Resumen':[29,17,18,14,15,14],'Sesiones':[28,15,14,16,14],
      'Detalle':[19,27,24,31,24,10,23,11,14,21,19,18,58,41],'Áreas':[33,16,15,16,14]};
    zip.file('[Content_Types].xml',`<Types xmlns="${schema}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>${names.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`);
    zip.file('_rels/.rels',`<Relationships xmlns="${pkg}"><Relationship Id="rId1" Type="${office}/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="${pkg}/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`);
    zip.file('docProps/core.xml','<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>GLIAX · Informe de práctica</dc:title><dc:creator>GLIAX</dc:creator></cp:coreProperties>');
    zip.file('xl/workbook.xml',`<workbook xmlns="${main}" xmlns:r="${office}"><sheets>${names.map((name,i)=>`<sheet name="${xml(name)}" sheetId="${i+1}" r:id="${sheetId(i)}"/>`).join('')}</sheets></workbook>`);
    zip.file('xl/_rels/workbook.xml.rels',`<Relationships xmlns="${pkg}">${names.map((_,i)=>`<Relationship Id="${sheetId(i)}" Type="${office}/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rIdStyles" Type="${office}/styles" Target="styles.xml"/></Relationships>`);
    zip.file('xl/styles.xml',`<styleSheet xmlns="${main}">
      <fonts count="3"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="15"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font></fonts>
      <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF293B60"/><bgColor indexed="64"/></patternFill></fill></fills>
      <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
      <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
      <cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
        <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
        <xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
        <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>
      </cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`);
    names.forEach((name,i)=>{
      const header=name==='Resumen'?3:1;
      const styleFor=(row,value)=>row===0?1:row===header?2:String(value??'').length>30?3:0;
      const rows=tables[name].map((row,j)=>`<row r="${j+1}">${row.map((value,k)=>{
        const ref=String.fromCharCode(65+k)+(j+1);
        const style=styleFor(j,value);
        return typeof value==='number'&&Number.isFinite(value)?`<c r="${ref}" s="${style}"><v>${value}</v></c>`:`<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
      }).join('')}</row>`).join('');
      zip.file(`xl/worksheets/sheet${i+1}.xml`,`<worksheet xmlns="${main}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="${header+1}" topLeftCell="A${header+2}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths[name].map((width,index)=>`<col min="${index+1}" max="${index+1}" width="${width}" customWidth="1"/>`).join('')}</cols><sheetData>${rows}</sheetData><mergeCells count="1"><mergeCell ref="A1:${String.fromCharCode(64+widths[name].length)}1"/></mergeCells></worksheet>`);
    });
    return zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
  }
  const api={build,tables,csv,excel,activities,labels:label,areas};
  root.ProgressReport=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

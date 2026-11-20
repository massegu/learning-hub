"""Real authenticated delivery/UI for six original cognitive families, persistence and print."""
import importlib.util,threading,os,tempfile,zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace,ROOT, area, training_areas, wait_for_area
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
proof=Path(os.environ['GLIAX_AC_CAPTURAS']) if os.environ.get('GLIAX_AC_CAPTURAS') else None
try:
 with sync_playwright() as p,tempfile.TemporaryDirectory() as tmp:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path),args=['--no-sandbox']);page=browser.new_page(viewport={'width':1440,'height':1050});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect',state='attached');page.clock.install()
  page.evaluate('''()=>{window.__saves=0;window.__savedResults=[];window.__current=null;const save=LearningAPI.saveResult;LearningAPI.saveResult=(id,row)=>{if(row.itemId?.startsWith('cognitive-v')){window.__saves++;window.__savedResults.push(structuredClone(row));}return save(id,row);};const request=LearningAPI.requestContent;LearningAPI.requestContent=async body=>{const response=await request(body);window.__current=response.items?.[0];window.__lastPayload=body;return response;};}''')
  def open_level_options():
   options=page.locator('#activityOptions')
   if not options.evaluate('(element)=>element.open'):options.locator('summary').click()
  for age in ['early','junior','primary','middle','teen']:
   workspace(page).locator('#profileSelect').select_option(age);reading_domain={'middle':'literacy','primary':'literacy','teen':'literacy'}.get(age,'reading');wait_for_area(page, reading_domain);area(page, reading_domain).click();assert not page.locator('#cognitiveMode').is_visible();area(page, 'executive').click()
   page.locator('#cognitiveFamilyModes [data-cognitive-family]').first.click();page.wait_for_function('()=>window.__current?.type==="cognitiveTask"&&document.querySelector(".cognitive-area")')
   for level in [1,2,3]:
    for kind in ['rules','wait','words','deduction','change','information','contradiction']:
     family_domain=({'middle':'middleLanguage','teen':'teenLanguage'}.get(age,'language') if kind=='words' else 'attention' if kind=='contradiction' else 'executive')
     area(page, family_domain).click()
     open_level_options();page.locator('#exerciseLevelSelect').select_option(str(level))
     if kind=='words':page.locator('#wordFitMode').click()
     elif kind=='wait':
      page.locator('#miraModeButton').click()
     else:page.locator(f'#cognitiveFamilyModes [data-cognitive-family="{kind}"]').click()
     page.wait_for_function('({kind,level})=>window.__current?.type==="cognitiveTask"&&__current.level===level&&(kind==="wait"?__current.cognitiveTask.kind==="guidedWait":__current.cognitiveTask.kind===kind)&&document.querySelector(".cognitive-area")',arg={'kind':kind,'level':level})
     item=page.evaluate('__current');task=item['cognitiveTask'];before=page.evaluate('__saves')
     if kind=='rules' and level==1 and age!='early':assert 'Adivina la regla' in page.locator('#exercisePrompt').inner_text()
     assert page.evaluate('__lastPayload.client_revision')==18
     assert page.locator('#printCognitive').count()==(0 if kind in ['rules','wait'] else 1)
     page.locator('.cognitive-area').get_by_role('button',name='Empezar espera' if kind=='wait' else 'Empezar',exact=True).press('Enter')
     if kind=='wait':
      assert page.locator('.guided-wait-panel [role=timer]').is_visible();assert page.locator('.guided-wait-progress').is_visible()
      if age=='early' and level==1:
       page.locator('.cognitive-area').get_by_role('button',name='Reiniciar espera',exact=True).click()
       if proof:page.locator('#exercise').screenshot(path=str(proof/'guided-wait-desktop.png'))
      if age=='early' and level==2:
       page.clock.fast_forward(500);page.evaluate("()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));}")
       assert 'pausó' in page.locator('.cognitive-status').inner_text();page.evaluate('()=>{delete document.hidden;}');page.locator('.cognitive-area').get_by_role('button',name='Reanudar espera',exact=True).click()
      before=page.evaluate('__saves');page.clock.fast_forward(task['intervalMs']+150);page.wait_for_function('(count)=>window.__saves===count+1',arg=before)
      saved=page.evaluate('__savedResults.at(-1)');metrics=__import__('json').loads(saved['detail']);assert metrics['modality']=='guided_wait' and metrics['interval_completed'] is True and 'completed' not in metrics and metrics['level']==level and saved['correct'] is None
      assert 'Intervalo finalizado' in page.locator('#exerciseFeedback').inner_text()
      assert metrics['restarts']==(1 if age=='early' and level==1 else 0);assert metrics['interruptions']==(1 if age=='early' and level==2 else 0)
      assert saved['subject']=='executive' and saved['level']==level and saved['points']==0
      assert 'practice' in page.locator('#exerciseFeedback').get_attribute('class')
      assert page.locator('#printCognitive').count()==0
      continue
     if kind=='rules':
      omission_case=age=='early' and level==1;omission_recorded=False
      for trial in task['trials']:
       if trial['switchBefore']:
        assert 'Cambio de regla' in page.locator('.cognitive-status').inner_text()
        assert page.locator('#exerciseVisual .cognitive-picture').count()==0
        assert page.locator('#exerciseVisual progress').count()==0
        cue=page.locator('.cognitive-status').inner_text();assert 'animal' not in cue and 'pulsar' not in cue and 'herramienta' not in cue
        page.clock.fast_forward(task['switchMs']+10)
       if trial['target']!=trial['inverted']:
        assert page.locator('#exerciseVisual [role=timer]').count()==0
        if omission_case and not omission_recorded:
         page.clock.fast_forward(task['trialMs']+10);omission_recorded=True
        else:page.locator('.cognitive-area').get_by_role('button',name='Responder',exact=True).press('Enter')
       else:
        assert page.locator('#exerciseVisual [role=timer]').count()==0
        page.clock.fast_forward(task['trialMs']+10)
       assert page.locator('#exerciseVisual .cognitive-picture').count()==0
       page.clock.fast_forward(task['gapMs']+10)
      if omission_case:
       saved=page.evaluate('__savedResults.at(-1)');metrics=__import__('json').loads(saved['detail']);assert metrics['modality']=='rule_application';assert metrics['omissions']==1 and metrics['errors']==0 and metrics['correct']==metrics['trials']-1;assert len(metrics['response_times_ms'])==sum(trial['target']!=trial['inverted'] for trial in task['trials'])-1;assert all(isinstance(ms,(int,float)) and ms>=0 for ms in metrics['response_times_ms'])
     elif kind=='words':
      if age in ['early','junior'] and level<=2:
       valid=page.evaluate('(item)=>CognitiveFamilies.wordChoices(item).filter(word=>CognitiveFamilies.wordFits(word,item.cognitiveTask))',item)
       for word in valid:page.locator('.cognitive-word-choice input').filter(visible=True).evaluate_all('(fields,word)=>fields.find(field=>field.value===word).click()',word)
       page.get_by_role('button',name='Comprobar selección').click()
      else:
       page.locator('#cognitiveWord').fill('inexistente xyz');page.get_by_role('button',name='Comprobar palabra',exact=True).click();assert 'no se registra' in page.locator('.cognitive-status').inner_text();assert page.evaluate('__saves')==before
       page.locator('#cognitiveWord').fill(task['answer'][0].upper());page.get_by_role('button',name='Comprobar palabra',exact=True).click()
     elif kind=='deduction':
      for _ in range(len(task['clues'])-1):page.locator('.cognitive-area').get_by_role('button',name='Ver siguiente pista',exact=True).click()
      target=int(task['answer'][0][1:])
      for index in range(len(task['candidates'])):
       if index!=target:page.locator('.cognitive-area').get_by_role('button',name=f'Tachar tarjeta {index+1}',exact=True).click()
      assert page.locator('.cognitive-candidate.cognitive-answer-correct').count()==1
     elif kind=='change':
      page.locator('.cognitive-area').get_by_role('button',name=task['replacement'],exact=True).click()
      for step in task['answer']:page.locator('.cognitive-choices').get_by_role('button',name=step,exact=True).click()
      page.locator('.cognitive-area').get_by_role('button',name='Comprobar plan',exact=True).click()
     else:
      for answer in task['answer']:page.locator(f'.cognitive-fact input[value={answer}]').check()
      page.locator('.cognitive-area').get_by_role('button',name='Comprobar',exact=True).click()
     if kind=='rules' and age=='early' and level==1:assert 'bad' in page.locator('#exerciseFeedback').get_attribute('class')
     else:assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class'),(age,kind,level,page.locator('#exerciseFeedback').inner_text())
     assert page.locator('.cognitive-solution').count()==0
     if kind!='rules':assert page.locator('.cognitive-answer-correct').count()>0
     if kind=='change':assert page.locator('.cognitive-plan-step-changed').count()>0
     assert page.evaluate('__saves')==before+1
     assert page.locator('#exerciseNext').is_visible()
     page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(age,kind,level)
     page.set_viewport_size({'width':1440,'height':1050})
     if proof and age=='teen' and level==2:page.locator('#exercise').screenshot(path=str(proof/(kind+'.png')))
     if age=='teen' and level==2 and kind!='rules':
      with page.expect_download() as dl:page.locator('#printCognitive').click()
      file=Path(tmp)/(kind+'.docx');dl.value.save_as(file)
      expected_q=page.evaluate('(item)=>CognitiveFamilies.printable(item).question',item)
      with zipfile.ZipFile(file) as z:assert expected_q[:25] in z.read('word/document.xml').decode()
  # A hidden document interrupts rules, records nothing and has no pending late score.
  area(page, 'executive').click();page.locator('#cognitiveFamilyModes [data-cognitive-family="rules"]').click();page.wait_for_function('()=>window.__current?.cognitiveTask?.kind==="rules"');page.locator('.cognitive-area').get_by_role('button',name='Empezar',exact=True).click();before=page.evaluate('__saves')
  page.evaluate("()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));}")
  page.clock.fast_forward(60000);assert page.evaluate('__saves')==before;assert 'interrumpida' in page.locator('.cognitive-status').inner_text()
  page.evaluate('()=>{delete document.hidden;}');page.locator('.cognitive-area').get_by_role('button',name='Empezar',exact=True).click();page.locator('.cognitive-area').get_by_role('button',name='Reiniciar sin registrar',exact=True).click();assert page.evaluate('__saves')==before
  assert not errors,errors
  # Saved summaries retain activity mechanics, no typed lexical text.
  rows=page.evaluate('__profiles.find(p=>p.id==="teen").progress.history.filter(x=>x.itemId?.startsWith("cognitive-v"))');assert len(rows)==21
  assert all(not any(key in row for key in ['typedWord','word','response']) for row in rows)
  workspace(page).locator('#navMenu [data-section="progress"]').click();assert 'Espera guiada · 3 intervalos finalizados' in page.locator('#guidedWaitProgress summary').inner_text();assert 'No indica si la persona esperó' in page.locator('#guidedWaitProgress').text_content();assert 'Actúa con reglas · 3 actividades' in page.locator('#ruleApplicationProgress summary').inner_text();assert 'se registran por separado' in page.locator('#ruleApplicationProgress').text_content()
  browser.close();print('PASS: 105 authenticated completed tasks (seven families × five ages × three levels), separate guided-wait history, neutral switch/no-go cues, keyboard, 390px, persistence, unreviewed-word handling, five Word files and interruption')
finally:server.shutdown();server.server_close()

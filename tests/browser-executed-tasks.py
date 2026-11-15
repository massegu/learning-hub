"""Executed tasks: real UI, hidden-memory phases, one completion, keyboard and mobile."""
import importlib.util,threading,os,tempfile,zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace,ROOT, area, training_areas, wait_for_area
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p,tempfile.TemporaryDirectory() as tmp:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or '/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect',state='attached');page.clock.install()
  page.evaluate('''()=>{window.__completedCalls=0;const save=LearningAPI.saveResult;LearningAPI.saveResult=(id,row)=>{if(row.itemId?.startsWith('executed-v'))window.__completedCalls++;return save(id,row);};const original=LearningAPI.requestContent;LearningAPI.requestContent=async payload=>{if(payload.executed_only){window.__executionRequest=payload;return {items:[structuredClone(window.__task)],usage:{used:1,limit:500}};}return original(payload);}}''')
  def open_level_options():
   options=page.locator('#activityOptions')
   if not options.evaluate('(element)=>element.open'):options.locator('summary').click()
  for age in ['early','teen']:
   workspace(page).locator('#profileSelect').select_option(age)
   for domain,kinds in [('attention',['cancel','compare','follow']),('memory',['serial','spatial','update']),('executive',['plan','switch','inhibit'])]:
    area(page, domain).click();open_level_options();page.locator('#exerciseLevelSelect').select_option('2')
    for kind in kinds:
     page.evaluate('''({age,domain,kind})=>{window.__task=ExecutedTasks.pool(age,domain,2).find(x=>x.execution.kind===kind);window.__executionRequest=null;}''',{'age':age,'domain':domain,'kind':kind})
     page.locator('#executedMode').click();page.wait_for_function('()=>window.__executionRequest?.executed_only&&document.querySelector(".executed-area")');assert page.evaluate('__executionRequest.client_revision')==13
     completed_before=page.evaluate('__completedCalls');
     if kind=='switch':assert page.locator('.executed-rule-intro').is_visible() and 'LIBRO → A' in page.locator('.executed-rule-intro').inner_text()
     page.locator('.executed-area').get_by_role('button',name='Empezar',exact=True).press('Enter')
     task=page.evaluate('__task.execution')
     if kind in ['serial','spatial','update']:
      assert page.locator('#exerciseVisual .executed-picture').count()>0
      if kind=='serial':
       assert page.locator('#exerciseVisual [data-icon-library=phosphor]').count()>0 if age=='teen' else page.locator('#exerciseVisual [data-icon-library=phosphor]').count()==0
       if age=='teen':page.locator('#exercise').screenshot(path='/tmp/phosphor-memory-desktop.png')
      page.clock.fast_forward(task['exposureMs']+20)
      if kind=='update':
       assert 'Cambio' in page.locator('.executed-status').inner_text();page.clock.fast_forward(3600)
      assert page.locator('#exerciseVisual .executed-picture').count()==0
     if kind in ['cancel','compare','spatial']:
      if kind=='cancel':indices=[i for i,x in enumerate(task['cells']) if x in task['targets']]
      elif kind=='compare':indices=[i for i,x in enumerate(task['cells']) if x!=task['after'][i]]
      else:indices=[i for i,x in enumerate(task['cells']) if x==task['target']]
      cells=page.locator('.executed-area .executed-cell')
      for i in indices:cells.nth(i).click()
      page.locator('.executed-area').get_by_role('button',name='Comprobar',exact=True).click()
     elif kind in ['switch','inhibit']:
      for trial_index,trial in enumerate(task['trials']):
       if kind=='switch' and trial_index>0 and trial['reversed']!=task['trials'][trial_index-1]['reversed']:
        assert 'CAMBIO DE REGLA' in page.locator('#exerciseVisual').inner_text();assert 'Tarjeta' not in page.locator('#exerciseVisual').inner_text();assert 'LIBRO →' not in page.locator('#exerciseVisual').inner_text()
        page.clock.fast_forward(2200)
       if kind=='switch':assert 'Tarjeta' not in page.locator('#exerciseVisual').inner_text()
       if kind=='inhibit':
        assert 'Libro: pulsa' not in page.locator('#exerciseVisual').inner_text()
        if trial['symbol']=='libro':page.locator('.executed-area').get_by_role('button',name='Responder',exact=True).click()
        else:
         assert page.locator('.executed-wait-countdown').inner_text().startswith('Espera ')
         page.clock.fast_forward(task['trialMs']+10)
       else:
        answer=('B' if trial['symbol']=='libro' else 'A') if trial['reversed'] else ('A' if trial['symbol']=='libro' else 'B')
        page.locator('.executed-area').get_by_role('button',name=answer,exact=True).click()
       if kind=='switch':assert page.locator('#exerciseVisual .executed-next-cue').inner_text()=='Siguiente estímulo'
       page.clock.fast_forward(700)
     else:
      answer=list(task['steps'] if kind=='plan' else task['sequence'])
      if kind=='update':answer[task['replaceIndex']]=task['replacement']
      for label in answer:page.locator('.executed-choices').get_by_role('button',name=label,exact=True).click()
      page.locator('.executed-area').get_by_role('button',name='Comprobar',exact=True).click()
     assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class'),(age,domain,kind,page.locator('#exerciseFeedback').inner_text())
     assert 'correctamente' in page.locator('#exerciseFeedback').inner_text();
     if kind in ['serial','spatial','update']:
      assert page.locator('.memory-solution').is_visible()
      if age=='teen' and kind=='update':page.locator('#exercise').screenshot(path=str(ROOT/'docs/review-assets/cognitive-families-20261104/memory-correct-sequence.png'))
     assert page.evaluate('__completedCalls')==completed_before+1
     if kind not in ['switch','inhibit']:
      page.locator('.executed-area').get_by_role('button',name='Comprobar',exact=True).evaluate('(b)=>b.onclick()');assert page.evaluate('__completedCalls')==completed_before+1
     page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(age,kind)
     if age=='teen' and kind=='compare':page.locator('#exercise').screenshot(path='/tmp/phase2-compare-mobile.png')
     page.set_viewport_size({'width':1440,'height':1000})
  # Interrupt an unfinished timed block; no delayed response may grade the next view.
  page.evaluate("()=>window.__task=ExecutedTasks.pool('teen','memory',1).find(x=>x.execution.kind==='serial')")
  area(page, 'memory').click();page.locator('#executedMode').click();page.locator('.executed-area').get_by_role('button',name='Empezar',exact=True).click()
  completed_before=page.evaluate('__completedCalls')
  page.evaluate("()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));}")
  assert 'interrumpido' in page.locator('.executed-status').inner_text();page.clock.fast_forward(20000);assert page.locator('#exerciseFeedback').inner_text()=='';assert page.evaluate('__completedCalls')==completed_before
  page.evaluate("()=>{delete document.hidden;}")
  # Printable projection uses coordinates/instructions and the same source, without claiming timing.
  with page.expect_download() as dl:page.evaluate('()=>WorksheetGenerator.generate([[__task]],__profiles.find(p=>p.id==="teen"))')
  file=Path(tmp)/'executed.docx';dl.value.save_as(file)
  with zipfile.ZipFile(file) as z:
   assert 'Reconstruye' in z.read('word/document.xml').decode() or 'reconstruye' in z.read('word/document.xml').decode()
   expected=bytes(page.evaluate("Array.from(PhosphorArt.png(StimulusArt.forLabel(__task.execution.sequence[0])))"));assert any(z.read(name)==expected for name in z.namelist() if name.startswith('word/media/'))
  # Every activity tab shares a minimum target height; older submodes join the toolbar.
  area(page, 'attention').click();open_level_options();page.locator('#interactionModeBtn').click()
  boxes=page.locator('.activity-toolbar button:visible').evaluate_all('(els)=>els.map(e=>({h:e.getBoundingClientRect().height,y:e.getBoundingClientRect().y}))');assert all(b['h']>=44 for b in boxes);assert page.locator('.activity-toolbar').evaluate('(e)=>e.scrollWidth<=e.clientWidth+1');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  page.wait_for_selector('#roomDescription');page.locator('#exercise').screenshot(path='/tmp/phase2-toolbar-desktop.png')
  # Existing pictograms stay legible at mobile widths in the timed speed renderer.
  page.evaluate("()=>{const previous=LearningAPI.requestContent;LearningAPI.requestContent=async payload=>payload.domain==='speedReasoning'?{items:[Curriculum.pool('teen','speedReasoning',1).find(x=>x.speedFamily==='category'&&!x.qualityEvidence)],usage:{used:1,limit:500}}:previous(payload);}")
  area(page, 'speedReasoning').click();page.locator('#practiceSpeedTrial').click();page.set_viewport_size({'width':390,'height':844})
  icons=page.locator('.speed-search-grid .picture-icon svg').evaluate_all('(els)=>els.map(e=>e.getBoundingClientRect().width)');assert icons and min(icons)>=55,icons
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.locator('#exercise').screenshot(path='/tmp/phase2-speed-mobile.png')
  assert not errors,errors;browser.close();print('PASS: 18 completed executed tasks, hidden memory and update, factual grid actions, changing rules, inhibition, keyboard, 390px, interruption, aligned toolbar and Word source')
finally:server.shutdown();server.server_close()

"""Executed tasks: real UI, hidden-memory phases, one completion, keyboard and mobile."""
import importlib.util,threading,os,tempfile,zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace,ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p,tempfile.TemporaryDirectory() as tmp:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or '/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect');page.clock.install()
  page.evaluate('''()=>{window.__completedCalls=0;const save=LearningAPI.saveResult;LearningAPI.saveResult=(id,row)=>{if(row.itemId?.startsWith('executed-v'))window.__completedCalls++;return save(id,row);};const original=LearningAPI.requestContent;LearningAPI.requestContent=async payload=>{if(payload.executed_only){window.__executionRequest=payload;return {items:[structuredClone(window.__task)],usage:{used:1,limit:500}};}return original(payload);}}''')
  for age in ['early','teen']:
   workspace(page).locator('#profileSelect').select_option(age)
   for domain,kinds in [('attention',['cancel','compare','follow']),('memory',['serial','spatial','update']),('executive',['plan','switch','inhibit'])]:
    workspace(page).locator(f'#navMenu [data-subject={domain}]').click();page.locator('#exerciseLevelSelect').select_option('2')
    for kind in kinds:
     page.evaluate('''({age,domain,kind})=>{window.__task=ExecutedTasks.pool(age,domain,2).find(x=>x.execution.kind===kind);window.__executionRequest=null;}''',{'age':age,'domain':domain,'kind':kind})
     page.locator('#executedMode').click();page.wait_for_function('()=>window.__executionRequest?.executed_only&&document.querySelector(".executed-area")');assert page.evaluate('__executionRequest.client_revision')==10
     completed_before=page.evaluate('__completedCalls');page.locator('.executed-area').get_by_role('button',name='Empezar',exact=True).press('Enter')
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
      else:indices=[i for i,x in enumerate(task['cells']) if x]
      cells=page.locator('.executed-area .executed-cell')
      for i in indices:cells.nth(i).click()
      page.locator('.executed-area').get_by_role('button',name='Comprobar',exact=True).click()
     elif kind in ['switch','inhibit']:
      for trial in task['trials']:
       if kind=='inhibit':
        if trial['symbol']=='libro':page.locator('.executed-area').get_by_role('button',name='Responder',exact=True).click()
        else:page.clock.fast_forward(task['trialMs']+10)
       else:
        answer=('B' if trial['symbol']=='libro' else 'A') if trial['reversed'] else ('A' if trial['symbol']=='libro' else 'B')
        page.locator('.executed-area').get_by_role('button',name=answer,exact=True).click()
     else:
      answer=list(task['steps'] if kind=='plan' else task['sequence'])
      if kind=='update':answer[task['replaceIndex']]=task['replacement']
      for label in answer:page.locator('.executed-choices').get_by_role('button',name=label,exact=True).click()
      page.locator('.executed-area').get_by_role('button',name='Comprobar',exact=True).click()
     assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class'),(age,domain,kind,page.locator('#exerciseFeedback').inner_text())
     assert 'correctamente' in page.locator('#exerciseFeedback').inner_text();assert page.evaluate('__completedCalls')==completed_before+1
     if kind not in ['switch','inhibit']:
      page.locator('.executed-area').get_by_role('button',name='Comprobar',exact=True).evaluate('(b)=>b.onclick()');assert page.evaluate('__completedCalls')==completed_before+1
     page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(age,kind)
     if age=='teen' and kind=='compare':page.locator('#exercise').screenshot(path='/tmp/phase2-compare-mobile.png')
     page.set_viewport_size({'width':1440,'height':1000})
  # Interrupt an unfinished timed block; no delayed response may grade the next view.
  page.evaluate("()=>window.__task=ExecutedTasks.pool('teen','memory',1).find(x=>x.execution.kind==='serial')")
  workspace(page).locator('#navMenu [data-subject=memory]').click();page.locator('#executedMode').click();page.locator('.executed-area').get_by_role('button',name='Empezar',exact=True).click()
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
  workspace(page).locator('#navMenu [data-subject=executive]').click();page.locator('#interactionModeBtn').click()
  boxes=page.locator('.activity-toolbar button:visible').evaluate_all('(els)=>els.map(e=>({h:e.getBoundingClientRect().height,y:e.getBoundingClientRect().y}))');assert all(b['h']==50 for b in boxes);assert max(b['y'] for b in boxes)-min(b['y'] for b in boxes)<2
  page.wait_for_selector('#exerciseVisual table');page.locator('#exercise').screenshot(path='/tmp/phase2-toolbar-desktop.png')
  # Existing pictograms stay legible at mobile widths in the timed speed renderer.
  page.evaluate("()=>{const previous=LearningAPI.requestContent;LearningAPI.requestContent=async payload=>payload.domain==='speedReasoning'?{items:[Curriculum.pool('teen','speedReasoning',1).find(x=>x.speedFamily==='category'&&!x.qualityEvidence)],usage:{used:1,limit:500}}:previous(payload);}")
  workspace(page).locator('#navMenu [data-subject=speedReasoning]').click();page.locator('#practiceSpeedTrial').click();page.set_viewport_size({'width':390,'height':844})
  icons=page.locator('.speed-search-grid .picture-icon svg').evaluate_all('(els)=>els.map(e=>e.getBoundingClientRect().width)');assert icons and min(icons)>=55,icons
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.locator('#exercise').screenshot(path='/tmp/phase2-speed-mobile.png')
  assert not errors,errors;browser.close();print('PASS: 18 completed executed tasks, hidden memory and update, factual grid actions, changing rules, inhibition, keyboard, 390px, interruption, aligned toolbar and Word source')
finally:server.shutdown();server.server_close()

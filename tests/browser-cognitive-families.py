"""Real authenticated delivery/UI for six original cognitive families, persistence and print."""
import importlib.util,threading,os,tempfile,zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace,ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
proof=ROOT/'docs/review-assets/cognitive-families-20261104';proof.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as p,tempfile.TemporaryDirectory() as tmp:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path),args=['--no-sandbox']);page=browser.new_page(viewport={'width':1440,'height':1050});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect');page.clock.install()
  page.evaluate('''()=>{window.__saves=0;window.__current=null;const save=LearningAPI.saveResult;LearningAPI.saveResult=(id,row)=>{if(row.itemId?.startsWith('cognitive-v'))window.__saves++;return save(id,row);};const request=LearningAPI.requestContent;LearningAPI.requestContent=async body=>{const response=await request(body);window.__current=response.items?.[0];window.__lastPayload=body;return response;};}''')
  for age in ['early','junior','primary','middle','teen']:
   workspace(page).locator('#profileSelect').select_option(age);workspace(page).locator('#navMenu [data-subject=executive]').click()
   page.locator('#cognitiveMode').click();page.wait_for_function('()=>window.__current?.type==="cognitiveTask"&&document.querySelector(".cognitive-area")')
   for level in [1,2,3]:
    page.locator('#exerciseLevelSelect').select_option(str(level))
    for kind in ['rules','words','deduction','change','information','contradiction']:
     family_domain=({'middle':'middleLanguage','teen':'teenLanguage'}.get(age,'language') if kind=='words' else 'executive')
     workspace(page).locator('#navMenu [data-subject='+family_domain+']').click()
     if kind=='words':page.locator('#wordFitMode').click()
     else:page.locator('#cognitiveMode').click();page.locator('#cognitiveFamilySelect').select_option(kind)
     page.wait_for_function('({kind,level})=>window.__current?.type==="cognitiveTask"&&__current.cognitiveTask.kind===kind&&__current.level===level&&document.querySelector(".cognitive-area")',arg={'kind':kind,'level':level})
     item=page.evaluate('__current');task=item['cognitiveTask'];before=page.evaluate('__saves')
     assert page.evaluate('__lastPayload.client_revision')==11
     assert page.locator('#printCognitive').count()==(0 if kind=='rules' else 1)
     page.locator('.cognitive-area').get_by_role('button',name='Empezar',exact=True).press('Enter')
     if kind=='rules':
      for trial in task['trials']:
       if trial['switchBefore']:
        assert 'Cambio de regla' in page.locator('.cognitive-status').inner_text()
        assert page.locator('#exerciseVisual .cognitive-picture').count()==0
        assert page.locator('#exerciseVisual progress').count()==0
        cue=page.locator('.cognitive-status').inner_text();assert 'animal' not in cue and 'pulsar' not in cue and 'herramienta' not in cue
        page.clock.fast_forward(task['switchMs']+10)
       assert page.locator('#exerciseVisual [role=timer]').count()==0
       if trial['target']!=trial['inverted']:page.locator('.cognitive-area').get_by_role('button',name='Responder',exact=True).press('Enter')
       else:page.clock.fast_forward(task['trialMs']+10)
       assert page.locator('#exerciseVisual .cognitive-picture').count()==0
       page.clock.fast_forward(task['gapMs']+10)
     elif kind=='words':
      if task['productionAllowed']:
       page.locator('#cognitiveWord').fill('inexistente xyz');page.locator('.cognitive-area').get_by_role('button',name='Comprobar palabra',exact=True).click();assert 'registramos un resultado' in page.locator('.cognitive-status').inner_text();assert page.evaluate('__saves')==before
       page.locator('#cognitiveWord').fill(task['answer'][0].upper());page.locator('.cognitive-area').get_by_role('button',name='Comprobar palabra',exact=True).click()
      else:page.locator('.cognitive-area').get_by_role('button',name=task['answer'][0],exact=True).click()
     elif kind=='deduction':
      for _ in range(len(task['clues'])-1):page.locator('.cognitive-area').get_by_role('button',name='Ver siguiente pista',exact=True).click()
      target=int(task['answer'][0][1:]);page.locator('.cognitive-area').get_by_role('button',name=f'Tachar tarjeta {(target+1)%len(task["candidates"])+1}',exact=True).click()
      page.locator('.cognitive-area').get_by_role('button',name=f'Elegir tarjeta {target+1}',exact=True).press('Enter')
     elif kind=='change':
      page.locator('.cognitive-area').get_by_role('button',name=task['replacement'],exact=True).click()
      for step in task['answer']:page.locator('.cognitive-choices').get_by_role('button',name=step,exact=True).click()
      page.locator('.cognitive-area').get_by_role('button',name='Comprobar plan',exact=True).click()
     else:
      for answer in task['answer']:page.locator(f'.cognitive-fact input[value={answer}]').check()
      page.locator('.cognitive-area').get_by_role('button',name='Comprobar',exact=True).click()
     assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class'),(age,kind,level,page.locator('#exerciseFeedback').inner_text())
     assert page.evaluate('__saves')==before+1
     assert page.locator('#exerciseNext').is_visible()
     page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(age,kind,level)
     page.set_viewport_size({'width':1440,'height':1050})
     if age=='teen' and level==2:page.locator('#exercise').screenshot(path=str(proof/(kind+'.png')))
     if age=='teen' and level==2 and kind!='rules':
      with page.expect_download() as dl:page.locator('#printCognitive').click()
      file=Path(tmp)/(kind+'.docx');dl.value.save_as(file)
      with zipfile.ZipFile(file) as z:assert item['q'][:25] in z.read('word/document.xml').decode()
  # A hidden document interrupts rules, records nothing and has no pending late score.
  workspace(page).locator('#navMenu [data-subject=executive]').click();page.locator('#cognitiveMode').click();page.locator('#cognitiveFamilySelect').select_option('rules');page.wait_for_function('()=>window.__current?.cognitiveTask?.kind==="rules"');page.locator('.cognitive-area').get_by_role('button',name='Empezar',exact=True).click();before=page.evaluate('__saves')
  page.evaluate("()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));}")
  page.clock.fast_forward(60000);assert page.evaluate('__saves')==before;assert 'interrumpida' in page.locator('.cognitive-status').inner_text()
  page.evaluate('()=>{delete document.hidden;}');page.locator('.cognitive-area').get_by_role('button',name='Empezar',exact=True).click();page.locator('.cognitive-area').get_by_role('button',name='Reiniciar sin registrar',exact=True).click();assert page.evaluate('__saves')==before
  assert not errors,errors
  # Saved summaries retain activity mechanics, no typed lexical text.
  rows=page.evaluate('__profiles.find(p=>p.id==="teen").progress.history.filter(x=>x.itemId?.startsWith("cognitive-v"))');assert len(rows)==18
  assert all(not any(key in row for key in ['typedWord','word','response']) for row in rows)
  browser.close();print('PASS: 90 authenticated completed tasks (six families × five ages × three levels), neutral switch/no-go cues, keyboard, 390px, persistence, unreviewed-word handling, five Word files and interruption')
finally:server.shutdown();server.server_close()

"""Actual content handler plus real timing, observations and exported Word XML."""
import importlib.util,threading,os,tempfile,zipfile,io
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1360,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.locator('#profileSelect').select_option('middle')
  page.evaluate('()=>{window.__current=null;const old=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return old(it,...args)}}')
  page.locator('#navMenu [data-subject=speedReasoning]').click();page.wait_for_selector('#startSpeedTrial');page.locator('[data-speed-mode=room]').click();page.wait_for_selector('#startRoomSpeed');assert page.evaluate('__requests.at(-1).room_speed_only') is True
  task=page.evaluate('__current');assert task['roomSpeedTask'];assert task['roomSpeedTask']['clue'] not in page.locator('#exercise').inner_text()
  baseline=page.evaluate('(__profiles.find(p=>p.id==="middle").progress.history||[]).length');page.clock.install();page.clock.pause_at(page.evaluate('Date.now()+1000'))
  page.clock.run_for(3000);assert page.locator('#roomSpeedClock').count()==0
  page.locator('#startRoomSpeed').click();assert task['roomSpeedTask']['clue'] in page.locator('#exercisePrompt').inner_text();page.clock.run_for(2400);assert page.locator('#roomSpeedClock').inner_text()=='2,4 s';page.locator('#exercise').screenshot(path='/tmp/speed-room-observed.png')
  page.locator('#foundRoomSpeed').click();assert page.locator('#confirmRoomSpeed').is_visible();assert not page.evaluate('__profiles.find(p=>p.id==="middle").progress.environmentSpeedObservations?.length')
  page.locator('#confirmRoomSpeed').click();entry=page.evaluate('__profiles.find(p=>p.id==="middle").progress.environmentSpeedObservations[0]');assert entry['report']=='found' and entry['timingValid'];assert 2390<=entry['elapsedMs']<=2410
  assert page.evaluate('(__profiles.find(p=>p.id==="middle").progress.history||[]).length')==baseline
  page.locator('#exerciseNext').click();page.wait_for_selector('#startRoomSpeed');page.locator('#startRoomSpeed').click();page.evaluate("()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});}")
  page.clock.run_for(10000);assert page.locator('#restartInteraction').is_visible();assert page.evaluate('__profiles.find(p=>p.id==="middle").progress.environmentSpeedObservations.length')==1
  page.locator('#navMenu [data-section=progress]').click();page.locator('#environmentSpeedProgress summary').click();assert 'separadas' in page.locator('#environmentSpeedProgress').inner_text()
  page.locator('#navMenu [data-subject=speedReasoning]').click();page.locator('[data-speed-mode=screen]').click();page.wait_for_selector('#startSpeedTrial')
  # Select fixed, canonical screen tasks at the service boundary to verify all three layouts.
  page.evaluate('()=>{window.__realRequestContent=LearningAPI.requestContent;LearningAPI.requestContent=async()=>({items:[structuredClone(window.__fixture)],usage:{used:5,limit:500}})}')
  for family in ['crossedKeys','rapidAgenda','ruleChoice']:
   page.evaluate('(family)=>{window.__fixture=Curriculum.processingChallenges("middle",3).find(it=>it.speedFamily===family);window.__current=null}',family)
   page.locator('#navMenu [data-subject=speedReasoning]').click();page.wait_for_function('()=>__current?.speedFamily==="'+family+'"');page.wait_for_selector('#startSpeedTrial');page.locator('#startSpeedTrial').click()
   assert page.locator('#exerciseVisual .processing-sources').is_visible()
   for width in [1360,390]:
    page.set_viewport_size({'width':width,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');assert page.locator('.processing-sources .stimulus-table-scroll').evaluate_all('(els)=>els.every(e=>e.scrollWidth<=e.clientWidth+1)');page.locator('#exercise').screenshot(path=f'/tmp/speed-{family}-{width}.png')
   answer=page.evaluate('__current.a');page.clock.run_for(600);page.locator('#exerciseOptions .speed-choice').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',answer);assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  assert '500' not in page.locator('#usageHint').inner_text();assert '800' in page.locator('.bank-size-hint').inner_text()
  with page.expect_download() as download:
   page.evaluate('()=>{const category=Curriculum.pool("middle","speedReasoning",1).find(it=>it.speedFamily==="category"),keys=Curriculum.processingChallenges("middle",3).find(it=>it.speedFamily==="crossedKeys"),room=Curriculum.roomSpeedPool("middle",1)[0];delete category.paperQuestion;WorksheetGenerator.generate([[category],[category,keys,room]],__profiles.find(p=>p.id==="middle"))}')
  output=Path(tmp)/'speed.zip';download.value.save_as(output)
  with zipfile.ZipFile(output) as outer:
   assert len(outer.namelist())==2
   for name in outer.namelist():
    with zipfile.ZipFile(io.BytesIO(outer.read(name))) as doc:
     xml=doc.read('word/document.xml').decode();assert '¿Son animales todos los elementos de la lista?' in xml;assert '¿Son animales todas las imágenes?' not in xml;assert 'Primero pulsa Empezar' not in xml
     if '_01.' in name:assert not any(n.startswith('word/media/') for n in doc.namelist())
     else:assert 'Segunda clave' in xml
  page.evaluate('window.__fixture=Curriculum.practice("middle","attention",2).find(x=>x.mechanic==="attention_plan_intruder")');page.locator('#navMenu [data-subject=attention]').click();page.wait_for_selector('#exerciseVisual .stimulus-caption');assert page.locator('#exerciseVisual .stimulus-caption').all_text_contents()==['Plan acordado','Lista que debes revisar'];page.locator('#exercise').screenshot(path='/tmp/attention-plan-separated.png')
  # The privacy mode also suppresses the new structured observation, not just scored exercises.
  page.set_viewport_size({'width':1360,'height':1000});page.evaluate('()=>{LearningAPI.requestContent=window.__realRequestContent;}')
  snapshot=page.evaluate('JSON.stringify(__profiles.find(p=>p.id==="middle").progress)');saved=page.evaluate('__saved.length')
  page.locator('#independentSessionBtn').click();page.locator('#navMenu [data-subject=speedReasoning]').click();page.wait_for_selector('#startSpeedTrial');page.locator('[data-speed-mode=room]').click();page.wait_for_selector('#startRoomSpeed')
  assert page.evaluate('__requests.at(-1).session_only') is True
  page.locator('#startRoomSpeed').click();page.clock.run_for(1000);page.locator('#foundRoomSpeed').click();page.locator('#confirmRoomSpeed').click();assert page.evaluate('__saved.length')==saved;assert page.evaluate('JSON.stringify(__profiles.find(p=>p.id=="middle").progress)')==snapshot
  page.locator('#independentSessionBtn').click();assert page.evaluate('JSON.stringify(__profiles.find(p=>p.id=="middle").progress)')==snapshot
  assert not errors,errors;browser.close();print('PASS: actual room delivery, hidden criterion before start, self-reported timing without scoring, interruption, separate observations, three new screen families, mobile and two Word files with matching text-only instructions')
finally:server.shutdown();server.server_close()

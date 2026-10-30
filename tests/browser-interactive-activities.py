"""Real local handler, graded cards, five-second pauses and unscored room observations."""
import importlib.util, threading, tempfile, zipfile, io
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');workspace(page).locator('#profileSelect').select_option('primary')
  page.evaluate('''()=>{const original=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return original(it,...args)}}''')
  workspace(page).locator('#navMenu [data-subject=executive]').click();page.locator('#interactionModeBtn').click();page.wait_for_selector('#startInteractive')
  assert page.evaluate('__requests.at(-1).interaction_only') is True
  assert page.evaluate('__requests.at(-1).interaction_kind')=='symbols'
  assert page.locator('[data-support-link]:visible').inner_text().endswith('learninghub2026@proton.me')
  assert page.locator('[data-support-link]:visible').get_attribute('href')=='mailto:learninghub2026%40proton.me'
  page.clock.install();page.clock.pause_at(page.evaluate('Date.now()+1000'));page.add_style_tag(content='*,*::before,*::after{transition:none!important;scroll-behavior:auto!important}')
  def history():return page.evaluate('__profiles.find(p=>p.id==="primary").progress.history||[]')
  def play_symbols(fail_wait=False):
   item=page.evaluate('__current');t=item['interactionTask'];page.locator('#startInteractive').click();missed=False
   for n,index in enumerate(t['trials']):
    if n==len(t['rules']) and t.get('secondRules'):page.locator('#confirmRuleChange').click()
    rules=t['secondRules'] if t.get('secondRules') and n>=len(t['rules']) else t['rules'];target=rules[index]['target']
    if n==0:page.locator('#exercise').screenshot(path='/tmp/interactive-symbol-card.png')
    if target<0:
     if fail_wait and not missed:page.keyboard.press('a');missed=True
     else:page.clock.run_for(t['waitMs']+100)
    else:page.keyboard.press(chr(97+target))
    page.clock.run_for(650)
   return item
  symbol=play_symbols();assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class');assert history()[-1]['interactionSummary']['correctTrials']==len(symbol['interactionTask']['trials'])
  page.locator('#exerciseLevelSelect').select_option('3');page.wait_for_function('()=>__current?.interactionTask?.level===3');advanced=play_symbols(True)
  assert history()[-1]['correct'] is False;assert history()[-1]['interactionSummary']['noGoErrors']==1
  old_attempts=len(history());page.locator('[data-interaction-kind=signals]').click();page.wait_for_selector('#startInteractive');movement=page.evaluate('__current');assert movement['interactionTask']['kind']=='movement'
  page.locator('#startInteractive').click()
  for n in range(len(movement['interactionTask']['trials'])):
   assert 'Espera:' in page.locator('#interactiveSeconds').inner_text();page.clock.run_for(4900);assert 'Espera:' in page.locator('#interactiveSeconds').inner_text()
   if n==0:page.locator('#exercise').screenshot(path='/tmp/interactive-movement-wait.png');page.locator('#movementEarly').click()
   page.clock.run_for(4100)
  assert page.locator('#practiceCompleted').is_visible();assert page.evaluate('__profiles.find(p=>p.id==="primary").progress.interactiveObservations?.length||0')==0
  page.locator('#practiceCompleted').click()
  assert len(history())==old_attempts
  page.wait_for_function('()=>__profiles.find(p=>p.id==="primary").progress.interactiveObservations?.length===1')
  reports=page.evaluate('__profiles.find(p=>p.id==="primary").progress.interactiveObservations[0].report.trials')
  assert len(reports)==len(movement['interactionTask']['trials']);assert sum(r['report']=='early' for r in reports)==1;assert sum(r['report']=='unverified' for r in reports)==len(reports)-1
  workspace(page).locator('#navMenu [data-subject=attention]').click();page.wait_for_selector('#roomDescription');room=page.evaluate('__current');assert room['interactionTask']['kind']=='room'
  page.locator('#saveRoomObservation').click();assert 'Escribe' in page.locator('#roomResponseMessage').inner_text()
  page.locator('#roomDescription').fill('He encontrado una caja pequeña. Voy a comprobar las características con mi acompañante.');page.mouse.move(1,1);page.clock.run_for(200);page.locator('#saveRoomObservation').click()
  assert len(history())==old_attempts;workspace(page).locator('#navMenu [data-section=progress]').click();assert page.locator('#interactiveObservations').is_visible();assert '2 registros' in page.locator('#interactiveObservations summary').inner_text()
  page.locator('#interactiveObservations summary').click();assert 'caja pequeña' not in page.locator('#interactiveObservations').inner_text()
  observations=page.evaluate('__profiles.find(p=>p.id==="primary").progress.interactiveObservations');assert all('description' not in entry for entry in observations);assert observations[-1]['report']=='described'
  # Level 1: choosing the single valid difference scores once and reveals Next.
  workspace(page).locator('#navMenu [data-subject=attention]').click();page.locator('#attentionPhotos').click();page.locator('#exerciseLevelSelect').select_option('1')
  page.wait_for_function('()=>__current?.photoTask?.kind==="differences"&&__current?.level===1');photo=page.evaluate('__current');assert page.locator('#multiCheck').is_hidden()
  # Exercise both supported selection modes deterministically. Presence/movement
  # scenes use text choices: an absent object cannot have a hitbox in image B.
  page.evaluate("""()=>{const original=LearningAPI.requestContent;window.__restorePhotoRequest=()=>{LearningAPI.requestContent=original;};LearningAPI.requestContent=async payload=>{const response=await original(payload);return payload.photos_only&&window.__photoFixture?{...response,items:[structuredClone(window.__photoFixture)]}:response;};}""")
  for index,pair_id in enumerate(['kitchen','music2026']):
   fixture_id=page.evaluate("""pairId=>{window.__photoFixture=PhotoLibrary.pool('primary','attention',1).find(it=>it.photoTask.pairId===pairId);window.__current=null;return __photoFixture.id;}""",pair_id)
   page.locator('#attentionPhotos').click()
   page.wait_for_function('(id)=>__current?.id===id&&document.querySelector("#multiCheck")?.classList.contains("hidden")',arg=fixture_id)
   photo=page.evaluate('__current');text_only=page.evaluate('PhotoLibrary.pairs[__current.photoTask.pairId].textSelectionOnly===true')
   if text_only:
    assert page.locator('.photo-hit').count()==0
    page.locator('#exerciseOptions').get_by_role('button',name=photo['answers'][0],exact=True).click()
   else:
    assert page.locator('.photo-hit').count()>0
    page.get_by_role('button',name='Señalar: '+photo['answers'][0],exact=True).click()
   assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class');assert page.locator('#exerciseNext').is_visible();assert len(history())==old_attempts+index+1
  page.evaluate('__restorePhotoRequest()');photo_attempts=len(history())
  # A restarted/inactive activity must never produce an automatic success.
  workspace(page).locator('#navMenu [data-subject=executive]').click();page.locator('#interactionModeBtn').click();page.locator('[data-interaction-kind=symbols]').click();page.wait_for_selector('#startInteractive');page.locator('#startInteractive').click()
  page.evaluate('''()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});}''')
  page.clock.run_for(10000);assert page.locator('#restartInteraction').is_visible();assert len(history())==photo_attempts
  page.locator('#restartInteraction').click();assert page.locator('#startInteractive').is_visible()
  for width in [1440,390]:
   page.set_viewport_size({'width':width,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.locator('#exercise').screenshot(path=f'/tmp/interactive-rules-{width}.png')
  with page.expect_download() as download:
   page.evaluate('({symbol,movement,room})=>WorksheetGenerator.generate([[symbol,movement,room],[symbol,movement,room]],__profiles.find(p=>p.id==="primary"))',{'symbol':symbol,'movement':movement,'room':room})
  target=Path(tmp)/'interactive.zip';download.value.save_as(target)
  with zipfile.ZipFile(target) as outer:
   assert len(outer.namelist())==2
   for name in outer.namelist():
    with zipfile.ZipFile(io.BytesIO(outer.read(name))) as doc:
     xml=doc.read('word/document.xml').decode();assert 'PAUSA' in xml and 'Pulsa' in xml and 'No se cuenta como un error' in xml
  assert not errors,errors
  print('PASS: real interactive delivery, graded symbol rules/change, keyboard, go/no-go scoring, 5-second gate, unscored movement/room observations and persistence, support email, deterministic hitbox/text level-1 differences with one result each, interruption/restart, mobile and 2 Word documents')
  browser.close()
finally:server.shutdown();server.server_close()

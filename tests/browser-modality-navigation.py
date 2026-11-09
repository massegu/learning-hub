"""Real app/local Edge handler: flat modality inventory, compatible requests and safe content retry."""
import importlib.util,threading
from playwright.sync_api import sync_playwright
from browser_support import workspace,ROOT,area

spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');workspace(page).locator('#profileSelect').select_option('early')
  page.evaluate('''()=>{window.__current=null;const deliver=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return deliver(it,...args)}}''')
  assert page.locator('.home-progress').get_attribute('open') is not None
  assert page.locator('.home-progress .dashboard-grid').is_visible()
  # Check the true per-age capability inventory against what the frontend offers.
  for age in ['early','junior','primary','middle','teen']:
   workspace(page).locator('#profileSelect').select_option(age)
   for domain in ['attention','memory','executive','speedReasoning']:
    area(page,domain).click();page.wait_for_function('()=>window.ModalityCatalog&&document.querySelector("#activityOptions")')
    capability=page.evaluate('(domain)=>ModalityCatalog.forArea(__profiles.find(p=>p.id===document.querySelector("#profileSelect").value),domain,Number(document.querySelector("#exerciseLevelSelect").value))',domain)
    assert page.locator('#activityOptions').is_visible(),(age,domain)
    assert page.locator('#activityOptions details').count()==0
    assert page.locator('#activityOptions .activity-toolbar button:visible').count()>0,(age,domain)
    assert page.locator('#activityOptions .activity-toolbar>.mode-switch:not(.hidden)').evaluate_all('(els)=>els.every(e=>getComputedStyle(e).display==="contents")'),(age,domain,'nested visual groups')
    for kind in ['symbols','movement','auditory']:
     button=page.locator(f'[data-interaction-kind="{kind}"]')
     assert button.is_visible()==(kind in capability['interactionKinds']),(age,domain,kind,capability)
    assert page.locator('#interactionModeBtn').is_visible()==capability['roomSearch'],(age,domain)
    assert page.locator('#documentModeSwitch [data-documents="true"]').is_visible()==(domain in ['attention','executive'] and capability['documents']),(age,domain)
    if domain=='attention':
     assert page.locator('[data-interaction-kind=symbols]').is_hidden(),(age,'symbols must remain exclusive to executive')
     for kind in ['movement','auditory']:
      assert page.locator(f'[data-interaction-kind={kind}]').is_hidden(),(age,f'{kind} belongs only to executive')
     assert page.locator('#attentionPhotos').is_visible()==capability['photos'],(age,domain,'photos')
    if domain=='memory':
     assert page.locator('#memoryAudioModeButton').is_visible()==capability['memoryAudio'],(age,domain,'audio')
     assert page.locator('#photoModeSwitch [data-photos=true]').is_visible()==capability['photos'],(age,domain,'photos')
    if domain=='executive':
     assert page.locator('#executedMode').is_visible()==capability['executed'],(age,domain,'executed')
     expected_families=set(capability['cognitiveKinds'])|{''}
     assert {x.get_attribute('data-cognitive-family') for x in page.locator('#cognitiveFamilyModes button:visible').all()}==expected_families, (age,domain,capability)
    if domain=='speedReasoning':
     assert page.locator('[data-speed-mode=screen]').is_visible()==capability['speed']['screen']
     assert page.locator('[data-speed-mode=room]').is_visible()==capability['speed']['room']
     assert page.locator('#speedUnpairedMode').is_visible()==capability['speed']['unpaired']
    buttons=page.locator('#activityOptions .activity-toolbar button:visible').all()
    assert all(button.get_attribute('aria-pressed') in ['true','false'] for button in buttons),(age,domain)
    assert all(button.evaluate('(e)=>e.getBoundingClientRect().height>=44') for button in buttons),(age,domain,'touch target')
    if age=='primary' and domain=='attention':
     for width,name in [(1440,'desktop'),(768,None),(390,'mobile')]:
      page.set_viewport_size({'width':width,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,domain)
      if name:page.locator('#activityOptions').screenshot(path=f'/tmp/learning-hub-modalities-{name}.png')
     focus_target=page.locator('#documentModeSwitch [data-documents=false]')
     focus_target.evaluate('(e)=>e.focus({focusVisible:true})')
     assert float(focus_target.evaluate('(e)=>parseFloat(getComputedStyle(e).outlineWidth)'))>=3,'keyboard focus must be clearly visible'
     page.set_viewport_size({'width':1440,'height':1000})
   language_domain={'middle':'middleLanguage','teen':'teenLanguage'}.get(age,'language')
   reading_domain='reading' if age in ['early','junior'] else 'literacy'
   for language_area in [language_domain,reading_domain]:
    area(page,language_area).click()
    capability=page.evaluate('(domain)=>ModalityCatalog.forArea(__profiles.find(p=>p.id===document.querySelector("#profileSelect").value),domain,1)',language_area)
    assert page.locator('#languageModeSwitch').is_visible(),(age,language_area)
    visible_modes=page.locator('#languageModeSwitch .language-mode-btn[data-mode]:visible').evaluate_all('(els)=>els.map(e=>e.dataset.mode)')
    assert visible_modes==capability['languageModes'],(age,language_area,visible_modes,capability)
    assert page.locator('#wordFitMode').is_visible()==capability['wordFit'],(age,language_area,'word-fit')
    for mode in visible_modes:
     page.evaluate('window.__current=null');before=page.evaluate('__requests.length');page.locator(f'#languageModeSwitch [data-mode="{mode}"]').click()
     page.wait_for_function('(n)=>__requests.length>n&&__current',arg=before);request=page.evaluate('__requests.at(-1)')
     expected_subdomain=mode if language_area==language_domain else ('writing' if mode=='writing' else 'reading')
     assert request['domain']==language_area and request.get('subdomain')==expected_subdomain,(age,language_area,mode,request)
    if capability['wordFit']:
     page.evaluate('window.__current=null');before=page.evaluate('__requests.length');page.locator('#wordFitMode').click()
     page.wait_for_function('(n)=>__requests.length>n&&__current',arg=before);request=page.evaluate('__requests.at(-1)')
     assert request['domain']==language_area and request['cognitive_only'] is True and request['cognitive_family']=='words',(age,language_area,request)
  # Execute every direct API modality at least once through the rendered app.
  checks=[]
  def add(age,domain,selector,expected):checks.append((age,domain,selector,expected))
  for age in ['early','junior','primary','middle','teen']:
   route=age
   # Plain activities and every separate family are selectable in all five routes.
   add(age,'attention','#documentModeSwitch [data-documents=false]',{'documents_only':False} if route!='early' else {})
   add(age,'attention','[data-cognitive-family=contradiction]',{'cognitive_only':True,'cognitive_family':'contradiction'})
   add(age,'attention','#executedMode',{'executed_only':True})
   add(age,'memory','#photoModeSwitch [data-photos=false]',{'photos_only':False} if route!='early' else {})
   add(age,'memory','#memoryAudioModeButton',{'memory_audio_only':True})
   add(age,'memory','#executedMode',{'executed_only':True})
   add(age,'executive','#documentModeSwitch [data-documents=false]',{'documents_only':False} if route!='early' else {})
   add(age,'executive','[data-cognitive-family=""]',{'cognitive_only':True,'cognitive_family':None})
   for family in ['rules','deduction','change','information']:
    add(age,'executive',f'[data-cognitive-family={family}]',{'cognitive_only':True,'cognitive_family':family})
   add(age,'executive','#executedMode',{'executed_only':True})
   add(age,'speedReasoning','[data-speed-mode=screen]',{'room_speed_only':False})
   add(age,'speedReasoning','#speedUnpairedMode',{'speed_mechanic':'unpaired'})
   if age!='early':
    add(age,'attention','#interactionModeBtn',{'interaction_only':True,'interaction_kind':'room'})
    for kind in ['symbols','movement','auditory']:add(age,'executive',f'[data-interaction-kind={kind}]',{'interaction_only':True,'interaction_kind':kind})
    add(age,'speedReasoning','[data-speed-mode=room]',{'room_speed_only':True})
    add(age,'attention','#documentModeSwitch [data-documents=true]',{'documents_only':True})
    add(age,'attention','#attentionPhotos',{'photos_only':True})
    add(age,'memory','#photoModeSwitch [data-photos=true]',{'photos_only':True})
    add(age,'executive','#documentModeSwitch [data-documents=true]',{'documents_only':True})
  for age,domain,selector,expected in checks:
   workspace(page).locator('#profileSelect').select_option(age);area(page,domain).click();button=page.locator(selector);assert button.is_visible(),(age,domain,selector)
   page.evaluate('window.__current=null');before=page.evaluate('__requests.length');button.click()
   page.wait_for_function('(n)=>__requests.length>n&&(__current||!document.querySelector("#retryContentLoad").classList.contains("hidden"))',arg=before)
   item=page.evaluate('__current');assert item,(age,domain,selector,page.locator('#exercisePrompt').inner_text())
   request=page.evaluate('__requests.at(-1)');assert request['domain']==domain and request['profile_id']==age,(request,age,domain)
   for key,value in expected.items():assert request.get(key)==value,(age,domain,selector,key,value,request)
   if domain=='attention':assert request.get('interaction_kind')!='symbols',request
   assert button.get_attribute('aria-pressed')=='true',(age,domain,selector)
  # Even a stale/programmatic activation of a hidden attention control cannot
  # issue a movement, auditory, or symbols request.
  for age in ['early','junior','primary','middle','teen']:
   workspace(page).locator('#profileSelect').select_option(age);area(page,'executive').click()
   for kind in ['movement','auditory']:
    button=page.locator(f'[data-interaction-kind={kind}]');available=age!='early'
    assert button.is_visible()==available,(age,'executive interaction availability',kind)
    if available:
     page.evaluate('window.__current=null');button.click();page.wait_for_function('(kind)=>__current?.interactionTask?.kind===kind',arg=kind)
     assert page.evaluate('__requests.at(-1).domain')=='executive',(age,kind,'must remain in executive')
   area(page,'attention').click();page.wait_for_function('()=>window.__current?.domain==="attention"')
   before=page.evaluate('__requests.length')
   for kind in ['symbols','movement','auditory']:
    button=page.locator(f'[data-interaction-kind={kind}]');assert button.is_hidden(),(age,'attention',kind)
    button.evaluate('(e)=>e.click()')
   assert page.evaluate('__requests.length')==before,(age,'hidden attention controls issued a request',page.evaluate('__requests.slice(-3)'))
   room=page.locator('#interactionModeBtn')
   room_available=page.evaluate('(age)=>ModalityCatalog.forArea(__profiles.find(p=>p.id===age),"attention",1).roomSearch',age)
   assert room.is_visible()==room_available,(age,'room search availability must follow the age catalog')
   if room_available:
    page.evaluate('window.__current=null');room.click();page.wait_for_function('()=>__requests.at(-1)?.interaction_kind==="room"')
    assert page.evaluate('__requests.at(-1).domain')=='attention',(age,'room search must remain in attention')
  # A previous success must disappear during a failed content request; retry only reloads content.
  page.clock.install();workspace(page).locator('#profileSelect').select_option('primary');page.evaluate('window.__current=null');area(page,'attention').click()
  page.wait_for_function('()=>window.__current?.domain==="attention"')
  item=page.evaluate('__current')
  if item.get('type')=='memoryReveal':
   page.clock.fast_forward(item['revealMs']+20);page.locator('#exerciseOptions [data-answer]').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',item['a'])
  elif item.get('type')=='multiSelect':
   for answer in item['answers']:page.locator('#exerciseOptions .multi-option').get_by_text(answer,exact=True).click()
   page.locator('#multiCheck').click()
  elif item.get('type')=='order':
   for answer in item['answer']:page.locator('#exerciseOptions .word-token').get_by_text(answer,exact=True).click()
   page.locator('#orderCheck').click()
  else:
   options=page.locator('#exerciseOptions [data-answer]');assert options.evaluate_all('(els,a)=>els.some(e=>e.dataset.answer===a)',item.get('a')),(item,page.locator('#exerciseOptions').inner_html())
   options.evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',item['a'])
  page.wait_for_function('document.querySelector("#progressSaveStatus").textContent.includes("guardados")')
  page.evaluate('''()=>{window.__restoreContent=LearningAPI.requestContent;LearningAPI.requestContent=async()=>{throw new Error('Edge Function returned a non-2xx status code')}}''')
  page.locator('#documentModeSwitch [data-documents=false]').click();page.wait_for_selector('#retryContentLoad:not(.hidden)')
  assert 'No se pudo cargar' in page.locator('#exercisePrompt').inner_text()
  assert page.locator('#progressSaveStatus').inner_text()==''
  assert page.locator('#retryProgressSave').is_hidden()
  page.evaluate('()=>{LearningAPI.requestContent=window.__restoreContent}')
  page.locator('#retryContentLoad').click();page.wait_for_function('()=>window.__current&&document.querySelector("#retryContentLoad").classList.contains("hidden")')
  assert 'guardados' not in page.locator('#progressSaveStatus').inner_text()
  assert not errors,errors
  browser.close();print('PASS: five-age modality inventory, all direct contract kinds, no symbols in attention, supported documents/photos/audio/speed, home progress expanded, retry clears stale save success, desktop and mobile screenshots')
finally:server.shutdown();server.server_close()

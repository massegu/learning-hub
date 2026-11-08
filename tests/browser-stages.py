"""Real Language modes, school themes, missions and fresh adaptive windows.
Only the SDK boundary is simulated; no production Supabase access.
"""
from pathlib import Path
import functools,http.server,json,re,tempfile,threading
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT,SDK,QuietHandler,doc_text, area, training_areas, wait_for_area, submit_declared_answer, wait_for_activity_response
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory(prefix='lh-stages-') as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':900},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def external(route):
   url=route.request.url
   if 'supabase-js' in url:route.fulfill(body=SDK,content_type='application/javascript')
   elif '/docx@8.5.0/' in url:route.fulfill(body=(ROOT/'node_modules/docx/build/index.umd.js').read_bytes(),content_type='application/javascript')
   elif '/jszip@3.10.1/' in url:route.fulfill(body=(ROOT/'node_modules/jszip/dist/jszip.min.js').read_bytes(),content_type='application/javascript')
   else:route.abort()
  page.route(re.compile(r'^https://'),external)
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#earlyContinue')
  def observe():
   page.evaluate("""()=>{const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=JSON.parse(JSON.stringify(it));return gate(it,...args)};}""")
  observe()
  def answer():
   it=page.evaluate('__current')
   wait_for_activity_response(page,it,advance_clock=True)
   submit_declared_answer(page,it,advance_clock=True)
   page.wait_for_function('document.querySelector("#exerciseFeedback").textContent.length>0')
   return it
  area(page, 'language').click()
  for width in [1280,768,390]:
   page.set_viewport_size({'width':width,'height':900})
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert page.locator('#languageModeSwitch button').evaluate_all('(els)=>els.filter(e=>e.offsetParent!==null).every(e=>e.getBoundingClientRect().height>=44) && els.some(e=>e.offsetParent!==null)')
  page.set_viewport_size({'width':1280,'height':900})
  for mode in ['grammar','spelling']:
   page.locator(f'.language-mode-btn[data-mode="{mode}"]').click()
   keys=[]
   for i in range(10):
    page.wait_for_function('(mode)=>__current?.languageFocus===mode&&document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0',arg=mode)
    if mode=='spelling' and i==0:page.locator('#exercise').screenshot(path='/tmp/early-spelling.png')
    it=answer();keys.append(it['semanticKey'])
    assert page.evaluate('__requests.at(-1).subdomain')==mode
    if i<9:page.locator('#exerciseNext').click()
   assert all(a!=b for a,b in zip(keys,keys[1:])),mode
  area(page, 'reading').click()
  page.locator('.language-mode-btn[data-mode="writing"]').click()
  keys=[]
  for i in range(10):
   page.wait_for_function('(mode)=>__current?.languageFocus===mode&&document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0',arg='writing')
   it=answer();keys.append(it['semanticKey'])
   assert page.evaluate('__requests.at(-1).subdomain')=='writing'
   if i<9:page.locator('#exerciseNext').click()
  assert all(a!=b for a,b in zip(keys,keys[1:])),'writing'
  print('PASS: 30 actual early Language/Reading requests, correct subdomain, supported writing mode and canonical scoring',flush=True)
  # Captured manual missing icons: complete noun option sets, not one image cue.
  page.evaluate("""()=>{const adapt=EarlyContent.adaptResponse;EarlyContent.adaptResponse=(response,payload,profile,...args)=>{
    if(window.__iconFixture&&[...(payload.domains||[payload.domain]||[])].some(domain=>['reading','language'].includes(domain))){const mixed=window.__iconFixture==='mixed';window.__iconFixture=false;
     const pool=EarlyContent.pool('reading',3);const base=pool.find(it=>it.ageProfile.family===(mixed?'reading-4':'reading-2'))||pool[0];
     const opts=mixed?['Opción alfa','Opción beta','Opción gamma']:['la gorra','el zapato','la guitarra'];
     const item={...base,type:'standard',responseType:'choice',q:'¿Qué opción corresponde?',a:opts[0],opts,sourceItemId:response.items?.[0]?.id};
     return {...response,items:[item]};
    }return adapt(response,payload,profile,...args);
   };window.__iconFixture=true;}""")
  page.locator('#exerciseNext').click()
  try:page.wait_for_function('document.querySelectorAll("#exerciseOptions .option-btn svg").length===3')
  except Exception as error:
   state=page.evaluate('''()=>({profile:document.querySelector('#profileSelect')?.value,section:[...document.querySelectorAll('.section.active-section')].map(x=>x.id),item:window.__current,options:document.querySelector('#exerciseOptions')?.innerHTML,buttons:[...document.querySelectorAll('#exerciseOptions .option-btn')].map(b=>({label:b.getAttribute('aria-label'),answer:b.dataset.answer,svg:b.querySelectorAll('svg').length})),labels:window.__current?.opts?.map(x=>({x,key:StimulusArt.forLabel(x,window.__current.lexicalSenses)}))})''')
   raise AssertionError(f'Icon fixture did not render its declared option pictograms: {state}') from error
  assert page.locator('#exerciseOptions .option-btn').count()==3
  page.locator('#exercise').screenshot(path='/tmp/early-complete-icons.png')
  submit_declared_answer(page,page.evaluate('__current'))
  page.wait_for_selector('#exerciseNext:not(.hidden)')
  page.evaluate('window.__iconFixture="mixed";window.__current=null')
  page.locator('#exerciseNext').click()
  try:page.wait_for_function('__current?.opts?.join("|")==="Opción alfa|Opción beta|Opción gamma"&&document.querySelectorAll("#exerciseOptions .option-btn").length===3')
  except Exception as error:
   state=page.evaluate('''()=>({item:window.__current,options:document.querySelector('#exerciseOptions')?.innerHTML,fixture:window.__iconFixture})''')
   raise AssertionError(f'Mixed pictogram fallback fixture was not delivered: {state}') from error
  assert page.locator('#exerciseOptions .option-btn svg').count()==0
  page.evaluate('window.__iconFixture=false')
  for band,theme,n,domains in [('junior','workshop',8,8),('primary','base',10,10),('middle',None,12,10)]:
   workspace(page).locator('#profileSelect').select_option(band)
   if theme:
    assert page.locator('#schoolHub').is_visible()
    assert page.locator('[data-school-area]').count()==domains
    assert page.locator('#appShell').get_attribute('data-age-theme')==theme
    if theme=='base':
     # The darkest foreground used by legacy !important patches must not win
     # against the new dark hero. Check actual computed contrast at its light end.
     rgb=page.locator('.school-hero .eyebrow').evaluate('(e)=>getComputedStyle(e).color').strip('rgba()').split(',')[:3]
     def luminance(channels):
      values=[float(x)/255 for x in channels];values=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in values]
      return sum(x*y for x,y in zip(values,[.2126,.7152,.0722]))
     assert (luminance(rgb)+.05)/(luminance([65,68,119])+.05)>=4.5
    for width in [1920,1440,1280,1024,768,390]:
     page.set_viewport_size({'width':width,'height':900})
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     assert page.locator('#schoolHub button').evaluate_all('(els)=>els.filter(e=>e.offsetParent!==null).every(e=>e.getBoundingClientRect().height>=44) && els.some(e=>e.offsetParent!==null)')
     if width in [1280,390]:page.locator('#schoolHub').screenshot(path=f'/tmp/{theme}-hub-{width}.png')
   else:
    assert page.locator('#schoolHub').is_hidden()
    assert page.locator('#home > .hero').is_visible()
   page.set_viewport_size({'width':1280,'height':900})
   area(page, 'attention').click()
   page.wait_for_function('document.querySelector("#exercisePrompt").textContent==="¿Qué criterio ayuda más?"')
   page.locator('#exerciseLevelSelect').select_option('1')
   for i in range(2*n):
    page.wait_for_function('document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0')
    assert page.evaluate('__requests.at(-1).level')==(1 if i<n else 2),(band,i)
    page.locator('#exerciseOptions').get_by_role('button',name='Azul',exact=True).click()
    page.wait_for_function('document.querySelector("#exerciseFeedback").textContent.length>0')
    actual=page.evaluate('(band)=>__profiles.find(p=>p.id===band).progress.levels.attention',band)
    expected=1 if i<n-1 else 2 if i<2*n-1 else 3
    assert actual==expected,(band,i,actual,expected)
    if i<2*n-1:page.locator('#exerciseNext').click()
   assert 'unverified-content-level' in page.evaluate('lastDifficultyAudit.issues')
   # Reload restores the checkpoint, not just the visible age label.
   page.reload(wait_until='networkidle');page.wait_for_selector('#profileSelect',state='attached');observe()
   workspace(page).locator('#profileSelect').select_option(band)
   area(page, 'attention').click()
   page.wait_for_function('document.querySelector("#exercisePrompt").textContent==="¿Qué criterio ayuda más?"')
   assert page.locator('#exerciseLevelSelect').input_value()=='3'
   print(f'PASS: {band} fresh {n}-answer windows, no adjacent promotions, requested/visible levels agree, progress restores',flush=True)
  # School mission uses ordinary remote requests and survives reload.
  workspace(page).locator('#profileSelect').select_option('junior');page.locator('[data-school-mission="build"]').click()
  page.wait_for_function('document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0')
  page.locator('#exerciseOptions').get_by_role('button',name='Azul',exact=True).click()
  page.locator('#cancelGuidedSession').click();page.reload(wait_until='networkidle');page.wait_for_selector('#schoolContinue');observe()
  page.locator('#schoolContinue').click()
  assert 'Actividad 2 de 3' in page.locator('#guidedSessionProgress').inner_text()
  # Existing worksheet generator stays intact and exports orthography stimuli.
  workspace(page).locator('#profileSelect').select_option('early')
  page.locator('#navMenu [data-section="homework"]').click();page.locator('#worksheetNone').click();page.locator('#homeworkOptions input[value="language"]').check()
  page.locator('#worksheetCount').select_option('1');page.locator('#worksheetQuestions').select_option('20')
  with page.expect_download(timeout=30000) as download:page.locator('#generateWorksheetsBtn').click()
  path=Path(tmp)/'language.docx';download.value.save_as(path);nodes=doc_text(path.read_bytes())
  assert any('letra' in text or 'sílabas' in text for text in nodes)
  assert not errors,errors
  print('PASS: complete noun icons, distinct responsive school themes, mature middle route, school mission resume and Language DOCX',flush=True)
  browser.close()
finally:server.shutdown()

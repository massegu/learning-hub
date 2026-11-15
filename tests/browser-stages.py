"""Real Language modes, school themes, missions and fresh adaptive windows.
Only the SDK boundary is simulated; no production Supabase access.
"""
from pathlib import Path
import functools,http.server,json,re,tempfile,threading
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT,SDK,QuietHandler,doc_text, area, training_areas, wait_for_area
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
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#homeAreaLanding:not(.hidden)')
  def observe():
   page.evaluate("""()=>{const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=JSON.parse(JSON.stringify(it));return gate(it,...args)};}""")
  observe()
  def answer():
   page.wait_for_function('document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0',timeout=15000)
   it=page.evaluate('__current')
   if it['type']=='order':
    for token in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
    page.locator('#orderCheck').click()
   else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   page.wait_for_function('document.querySelector("#exerciseFeedback").textContent.length>0')
   return it
  area(page, 'language').click()
  for width in [1280,768,390]:
   page.set_viewport_size({'width':width,'height':900})
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert page.locator('#languageModeSwitch button').evaluate_all('(els)=>els.filter(e=>e.getClientRects().length).every(e=>e.getBoundingClientRect().height>=44)')
  page.set_viewport_size({'width':1280,'height':900})
  # Grammar and orthography belong to Language; sentence writing is delivered
  # through the Reading area, where the product intentionally exposes it.
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
  assert all(a!=b for a,b in zip(keys,keys[1:])), 'writing'
  print('PASS: 30 actual early Language requests, correct subdomain, spelling/grammar/phrase content and canonical scoring',flush=True)
  # Use two valid authored items: one whose choices all have pictograms and a
  # mixed set that must remain entirely textual. Keep source and answers intact.
  page.evaluate("""()=>{const adapt=EarlyContent.adaptResponse;EarlyContent.adaptResponse=(...args)=>{const res=adapt(...args),payload=args[1];
    if(payload.kind==='exercise'&&payload.domain==='reading'&&payload.subdomain==='reading'&&window.__iconFixture){
     const id=window.__iconFixture==='mixed'
      ?'functional-v1:early:reading:1:reading.compare_sources:school.schedule:0'
      :'curriculum-v2-early-reading-2-2-0';
     const item=EarlyContent.pool('reading',payload.level).find(x=>x.id===id);
     if(!item)throw new Error('Falta el ejercicio de pictogramas validado: '+id);
     res.items=[{...item,sourceItemId:res.items[0].sourceItemId}];
    }return res;};window.__iconFixture=true;}""")
  area(page, 'reading').click()
  page.locator('#exerciseLevelSelect').select_option('2')
  page.locator('.language-mode-btn[data-mode="grammar"]').click()
  page.wait_for_function('window.__current?.id==="curriculum-v2-early-reading-2-2-0"&&document.querySelectorAll("#exerciseOptions .option-btn svg").length===2')
  assert page.locator('#exerciseOptions .option-btn').count()==2
  page.locator('#exercise').screenshot(path='/tmp/early-complete-icons.png')
  page.evaluate('window.__iconFixture="mixed"')
  page.locator('#exerciseLevelSelect').select_option('1')
  page.wait_for_function('window.__current?.id==="functional-v1:early:reading:1:reading.compare_sources:school.schedule:0"&&document.querySelectorAll("#exerciseOptions .option-btn").length===3')
  assert page.locator('#exerciseOptions .option-btn svg').count()==0
  page.evaluate('window.__iconFixture=false')
  for band,theme,n,domains in [('junior','workshop',8,8),('primary','base',10,10),('middle',None,12,10)]:
   workspace(page).locator('#profileSelect').select_option(band)
   if theme:
    assert page.locator('#homeAreaLanding').is_visible()
    assert page.locator('#homeAreaLanding [data-school-area]').count()==domains
    assert page.locator('#appShell').get_attribute('data-age-theme')==theme
    if theme=='base':
     # The professional shell keeps the same foreground/background regardless of selected age.
     rgb=page.locator('#homeAreaLanding .professional-area-group h3').first.evaluate('(e)=>getComputedStyle(e).color').strip('rgba()').split(',')[:3]
     def luminance(channels):
      values=[float(x)/255 for x in channels];values=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in values]
      return sum(x*y for x,y in zip(values,[.2126,.7152,.0722]))
     bg=page.locator('#appShell').evaluate('(e)=>getComputedStyle(e).backgroundColor').strip('rgba()').split(',')[:3]
     contrast=sorted((luminance(rgb),luminance(bg)),reverse=True)
     assert (contrast[0]+.05)/(contrast[1]+.05)>=4.5
    for width in [1920,1440,1280,1024,768,390]:
     page.set_viewport_size({'width':width,'height':900})
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     assert page.locator('#homeAreaLanding button').evaluate_all('(els)=>els.filter(e=>e.getClientRects().length).every(e=>e.getBoundingClientRect().height>=44)')
     if width in [1280,390]:page.locator('#homeAreaLanding').screenshot(path=f'/tmp/{theme}-hub-{width}.png')
   else:
    assert page.locator('#schoolHub').is_hidden()
    assert page.locator('#homeAreaLanding').is_visible()
    assert page.locator('#home > .hero').is_hidden()
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
  workspace(page).locator('#profileSelect').select_option('junior');page.locator('.professional-missions > summary').click();page.locator('[data-unified-mission="school"][data-mission-id="build"]').click()
  page.wait_for_function('document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0')
  page.locator('#exerciseOptions').get_by_role('button',name='Azul',exact=True).click()
  page.locator('#cancelGuidedSession').click();page.reload(wait_until='networkidle');page.wait_for_selector('#homeAreaLanding:not(.hidden)');observe()
  page.locator('.professional-missions > summary').click();page.locator('[data-unified-mission="school"][data-mission-id="build"]').click()
  assert 'Actividad 2 de 3' in page.locator('#guidedSessionProgress').inner_text()
  # Existing worksheet generator stays intact and exports orthography stimuli.
  workspace(page).locator('#profileSelect').select_option('early')
  page.locator('#navMenu [data-section="homework"]').click();page.locator('#worksheetNone').click();page.locator('#homeworkOptions input[value="language"]').check()
  page.locator('#worksheetCount').select_option('1');page.locator('#worksheetQuestions').select_option('20')
  with page.expect_download(timeout=30000) as download:page.locator('#generateWorksheetsBtn').click()
  path=Path(tmp)/'language.docx';download.value.save_as(path);nodes=doc_text(path.read_bytes())
  assert any('letra' in text or 'sílabas' in text for text in nodes)
  assert not errors,errors
  print('PASS: pictogram renderer, distinct responsive school themes, mature middle route, school mission resume and Language DOCX',flush=True)
  browser.close()
finally:server.shutdown()

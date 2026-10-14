"""Early hub/missions and worksheet replacement through the real app.
Only SDK service responses are simulated. No live Supabase calls or assets.
"""
from pathlib import Path
import functools,http.server,json,re,tempfile,threading,zipfile
from playwright.sync_api import sync_playwright
from browser_support import ROOT,SDK,QuietHandler,doc_text

server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory(prefix='lh-journey-') as tmp,sync_playwright() as p:
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
  def observe():
   page.evaluate("""()=>{
    const gate=ActivityModel.forDelivery;
    ActivityModel.forDelivery=(it,...args)=>{const out=gate(it,...args);window.__current=JSON.parse(JSON.stringify(it));return out;};
    const generate=WorksheetGenerator.generate;
    WorksheetGenerator.generate=async(items,profile)=>{window.__export={items,profile};return generate(items,profile);};
   }""")
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#earlyContinue');observe()
  for width in [1920,1440,1280,1024,768,390]:
   page.set_viewport_size({'width':width,'height':900})
   assert page.locator('[data-early-area]').count()==8
   assert page.locator('[data-early-mission]').count()==4
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert page.locator('#earlyHub button').evaluate_all('(els)=>els.every(e=>e.getBoundingClientRect().height>=44)')
   assert page.locator('#earlyHub svg').evaluate_all('(els)=>els.filter(e=>e.getBoundingClientRect().width).every(e=>{let r=e.getBoundingClientRect();return Math.abs(r.width-r.height)<1&&r.width>=40})')
   if width in [1280,390]:page.locator('#earlyHub').screenshot(path=f'/tmp/early-hub-{width}.png')
  print('PASS: eight-area hub and four short missions at six desktop/mobile widths, normal zoom',flush=True)
  page.set_viewport_size({'width':1280,'height':900})
  def answer():
   page.wait_for_function('document.querySelectorAll("#exerciseOptions button").length>0',timeout=15000)
   it=page.evaluate('__current')
   if it['type']=='order':
    for token in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
    page.locator('#orderCheck').click()
   else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   page.wait_for_function('document.querySelector("#exerciseFeedback").textContent.length>0')
  # Direct access remains available; representative screen from every domain.
  for domain in ['language','reading','division','attention','executive','memory','speedReasoning','applied']:
   page.locator('#navMenu [data-section="home"]').click()
   page.evaluate('window.__current=null')
   page.locator(f'[data-early-area="{domain}"]').click()
   page.wait_for_function('(domain)=>__current?.domain===domain&&document.querySelector("#exercisePrompt").textContent===__current.q',arg=domain)
   assert page.locator('#earlyTaskGuide').is_visible()
   page.locator('#exercise').screenshot(path=f'/tmp/early-journey-{domain}.png')
   answer()
  page.locator('#earlyHomeBtn').click()
  page.locator('[data-early-mission="stories"]').click();answer()
  page.locator('#exercise').screenshot(path='/tmp/early-journey-mission.png')
  assert page.evaluate('__profiles[0].progress._earlyJourney.active.index')==1
  page.locator('#cancelGuidedSession').click()
  assert '1 de 2' in page.locator('.mission-resume').inner_text()
  page.reload(wait_until='networkidle');page.wait_for_selector('#earlyContinue');observe()
  page.locator('#earlyContinue').click()
  assert 'Actividad 2 de 2' in page.locator('#guidedSessionProgress').inner_text()
  answer();page.locator('#exerciseNext').click()
  assert page.locator('#earlyHub').is_visible()
  assert page.evaluate('__profiles[0].progress._earlyJourney.completed.length')==1
  assert page.evaluate('__profiles[0].progress._earlyJourney.active===null')
  page.locator('[data-early-mission="explore"]').click();answer();page.locator('#exerciseNext').click()
  page.wait_for_function('__current?.domain==="division"')
  assert 'Actividad 2 de 5' in page.locator('#guidedSessionProgress').inner_text()
  page.locator('#cancelGuidedSession').click()
  print('PASS: direct access in all eight domains; missions pause/reload/resume, persist completion and advance across areas',flush=True)
  # Older profiles keep their ordinary dashboard and no playful exercise layer.
  page.locator('#profileSelect').select_option('junior')
  assert page.locator('#earlyHub').is_hidden()
  assert page.locator('#home > .hero').is_visible()
  assert not page.locator('#appShell').evaluate('(e)=>e.classList.contains("early-experience")')
  page.locator('#navMenu [data-section="homework"]').click()
  page.locator('#worksheetNone').click()
  for domain in ['attention','memory']:page.locator(f'#homeworkOptions input[value="{domain}"]').check()
  page.locator('#worksheetQuestions').select_option('10')
  page.evaluate("""()=>{
   const request=LearningAPI.requestContent;
   LearningAPI.requestContent=async(payload)=>{
    const res=await request(payload);
    if(payload.kind==='worksheet' && window.__candidateMode){
     window.__candidateBatches=(window.__candidateBatches||0)+1;
     if(window.__candidateMode==='cyclic')res.items=res.items.map(it=>({...it,scenario:'Una tarjeta muestra el número 1.',a:'1',opts:['1','2']}));
     else if(window.__candidateMode==='bad-each')res.items[0]={...res.items[0],stimulus:[],scenario:undefined};
    }
    return res;
   };
  }""")
  for versions in [1,2]:
   page.locator('#worksheetCount').select_option(str(versions))
   page.evaluate('window.__candidateMode="bad-each";window.__candidateBatches=0')
   with page.expect_download(timeout=30000) as download:page.locator('#generateWorksheetsBtn').click()
   path=Path(tmp)/('single.docx' if versions==1 else 'worksheets.zip');download.value.save_as(path)
   assert page.evaluate('__candidateBatches')==versions*2
   exported=page.evaluate('__export.items')
   documents=[path.read_bytes()] if versions==1 else [zipfile.ZipFile(path).read(n) for n in zipfile.ZipFile(path).namelist()]
   for document,items in zip(documents,exported):
    nodes=doc_text(document);assert len(items)==10
    assert len({json.dumps([it.get('scenario'),it['a']]) for it in items})==10
    for i,it in enumerate(items):
     start=nodes.index(f'ACTIVIDAD {i+1}');stop=nodes.index(f'ACTIVIDAD {i+2}') if i<9 else len(nodes)
     block=nodes[start:stop];assert it['scenario'] in block[:block.index(it['q'])]
   assert not page.locator('#generateWorksheetsBtn').is_disabled()
  # Repeated candidates cannot be laundered through changing remote IDs.
  page.evaluate('window.__candidateMode="cyclic";window.__candidateBatches=0')
  page.locator('#generateWorksheetsBtn').click()
  page.wait_for_function('document.querySelector("#docxStatus").textContent.includes("suficientes actividades imprimibles")')
  assert page.evaluate('__candidateBatches')==4
  assert not page.locator('#generateWorksheetsBtn').is_disabled()
  # Replacement errors preserve server quota enforcement.
  page.evaluate('window.__candidateMode="bad-each";window.__candidateBatches=0;window.__deny=true')
  before=page.evaluate('__requests.length');page.locator('#generateWorksheetsBtn').click()
  page.wait_for_function('!document.querySelector("#generateWorksheetsBtn").disabled')
  assert page.evaluate('__requests.length')==before+1
  page.evaluate('window.__deny=false;window.__candidateMode=null')
  # A defective early candidate after source selection is replaced too.
  page.locator('#profileSelect').select_option('early')
  page.evaluate("""()=>{
   const adapt=EarlyContent.adaptResponse;window.__corruptEarly=true;
   EarlyContent.adaptResponse=(...args)=>{const res=adapt(...args);if(args[1].kind==='worksheet'&&window.__corruptEarly){window.__corruptEarly=false;res.items[0]={...res.items[0],stimulus:[]};}return res;};
  }""")
  page.locator('#navMenu [data-section="homework"]').click();page.locator('#worksheetAll').click();page.locator('#worksheetCount').select_option('1')
  with page.expect_download(timeout=30000) as download:page.locator('#generateWorksheetsBtn').click()
  download.value.save_as(Path(tmp)/'early.docx')
  assert len(page.evaluate('__export.items[0]'))==10
  assert page.evaluate('__export.items[0].every(it=>WorksheetSelection.compatible(it,__profiles[0],it.localization.locale,it.domain))')
  assert not errors,errors
  print('PASS: incompatible local/remote replacement, mixed single/ZIP, semantic exhaustion, quota denial and older dashboard',flush=True)
  browser.close()
finally:server.shutdown()

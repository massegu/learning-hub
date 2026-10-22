"""Real local app/handler checks for Colombian documents and revised memory layouts."""
import importlib.util,threading,tempfile,zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');preview=importlib.util.module_from_spec(spec);spec.loader.exec_module(preview)
server=preview.ReviewServer(('127.0.0.1',0),preview.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':900});errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#v16ContentLocale');page.wait_for_timeout(1000)
  page.evaluate('''()=>{const original=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return original(it,...args)}}''')
  def current():
   page.wait_for_function('()=>window.__current&&[__current.q,__current.memoryQuestion].includes(document.querySelector("#exercisePrompt").textContent)');return page.evaluate('__current')
  def open_area(domain):
   page.evaluate('window.__current=null');page.locator(f'#navMenu [data-subject="{domain}"]').click();return current()
  def next_item():
   page.evaluate('window.__current=null');page.locator('#exerciseNext').click();return current()
  def screenshot(name):
   for width in [1280,390]:
    page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),name
    page.locator('#exercise').screenshot(path=f'/tmp/review-{name}-{width}.png')
   page.set_viewport_size({'width':1280,'height':900})
  count=0
  for age in ['junior','primary','middle','teen']:
   page.locator('#profileSelect').select_option(age);page.locator('#v16ContentLocale').select_option('es_co');page.wait_for_function('()=>LearningAPI.contentLocale==="es_co"')
   for domain in (['attention','executive'] if age=='junior' else ['attention','executive']):
    it=open_area(domain)
    page.evaluate('window.__current=null');page.locator('#documentModeSwitch [data-documents=true]').click();it=current();seen=[]
    for n in range(1 if age=='junior' else 4):
     doc=next(b['documentId'] for b in it['stimulus'] if b['type']=='document');seen.append(doc)
     assert page.evaluate('__requests.at(-1).documents_only') is True
     expected_width=page.evaluate('(id)=>DocumentLibrary.get(id).width',doc)
     page.wait_for_function('(width)=>document.querySelector(".practice-document img")?.naturalWidth===width',arg=expected_width)
     if domain=='attention' and age=='teen':
      screenshot(doc);page.locator('.document-transcript summary').click();assert page.locator('.document-transcript').get_attribute('open') is not None
      assert 'Documento ficticio' not in page.locator('.document-transcript').inner_text();assert len(page.locator('.document-transcript').inner_text())>50
     if it['type']=='order':
      for token in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
      page.locator('#orderCheck').click()
     else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
     count+=1
     if n<(0 if age=='junior' else 3):it=next_item()
    assert len(set(seen))==len(seen),(age,domain,seen)
    page.evaluate('window.__current=null');page.locator('#documentModeSwitch [data-documents=false]').click();current()
  # Export all four original images through the actual browser DOCX generator.
  with page.expect_download() as dl:
   page.evaluate('()=>WorksheetGenerator.generate([DocumentLibrary.pool("teen","attention",1)],__profiles.find(p=>p.id==="teen"))')
  path=Path(tmp)/'documents.docx';dl.value.save_as(path)
  with zipfile.ZipFile(path) as archive:
   media=[archive.read(n) for n in archive.namelist() if n.startswith('word/media/') and n.endswith('.png')]
   for source in (ROOT/'assets/documents').glob('*.png'):assert source.read_bytes() in media,source
  # A real eight-row association table and inverse sequence fit on phone/desktop.
  page.clock.install();it=open_area('memory')
  page.evaluate('window.__current=null');page.locator('#exerciseLevelSelect').select_option('3');it=current()
  for n in range(12):
   if it['mechanic']=='memory_association':break
   if it.get('photoTask',{}).get('kind')=='recall':
    page.locator('#showMemoryPhoto').click();page.wait_for_selector('.everyday-photo img');page.clock.run_for(it['revealMs']+50)
    page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   elif it.get('recallSequence'):
    page.locator('#startMemorySequence').click();page.clock.run_for(len(it['recallSequence'])*(it['sequenceStepMs']+250)+50)
    for token in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
    page.locator('#orderCheck').click()
   else:
    page.clock.fast_forward(it['revealMs']+50)
    if it.get('answer') and it.get('memoryResponse')=='order':
     for token in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
     page.locator('#orderCheck').click()
    elif it.get('answers'):
     for label in it['answers']:page.locator('#exerciseOptions').get_by_role('button',name=label,exact=True).click()
     page.locator('#multiCheck').click()
    else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   it=next_item()
  assert it['mechanic']=='memory_association';assert page.locator('.memory-associations th[scope=col]').evaluate_all('(els)=>els.map(e=>e.textContent)')==['Persona','Imagen'],(it,page.locator('#exerciseVisual').inner_html());screenshot('memory-associations')
  page.clock.fast_forward(it['revealMs']+50);page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
  it=open_area('teenLanguage')
  page.evaluate('window.__current=null');page.locator('#languageModeSwitch [data-mode=spelling]').click();it=current()
  assert all(b.get('text')!=it['topic'] for b in it.get('stimulus',[]));assert page.locator('#exerciseVisual').inner_text().strip()!='Dos rutas y un horario'
  page.evaluate('window.__current=null');page.locator('#navMenu [data-subject=literacy]').click();current();page.evaluate('window.__current=null');page.locator('#languageModeSwitch [data-mode=writing]').click();it=current()
  assert page.locator('#writingCriteria li').count()==len(it['writingRubric'])
  assert 'Criterios de revisión' not in page.locator('#exerciseVisual').inner_text();screenshot('writing-criteria-once')
  assert not errors,errors
  print(f'PASS: {count} answered document activities across four ages, source rotation, Colombian mode, desktop/mobile, real DOCX with all 22 exact original PNGs, association table; no page errors',flush=True)
  browser.close()
finally:server.shutdown();server.server_close()

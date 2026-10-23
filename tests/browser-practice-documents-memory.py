"""Actionable self-review, separated modes, document planning/audit and delayed category recall."""
import importlib.util,threading,tempfile,zipfile,xml.etree.ElementTree as ET,os,io
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect');page.wait_for_timeout(1000)
  page.evaluate('''()=>{const old=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return old(it,...args)}}''')
  page.locator('#profileSelect').select_option('teen')
  def current():
   page.wait_for_function('()=>__current&&document.querySelector("#exercisePrompt").textContent===__current.q');return page.evaluate('__current')
  def open_area(domain):
   page.evaluate('window.__current=null');page.locator(f'#navMenu [data-subject={domain}]').click();return current()
  it=open_area('literacy');page.locator('#languageModeSwitch [data-mode=writing]').click();page.locator('#textAnswerInput').wait_for(state='visible')
  draft='Esta es mi respuesta inicial.';page.locator('#textAnswerInput').fill(draft);page.locator('#textAnswerCheck').click();page.locator('[data-self=false]').click()
  assert 'practice' in page.locator('#exerciseFeedback').get_attribute('class');assert 'No esta vez' not in page.locator('#exerciseFeedback').inner_text()
  count=page.evaluate('__profiles.find(x=>x.id==="teen").progress.history.length')
  page.locator('#reviseWritingAnswer').click();assert page.locator('#textAnswerInput').input_value()==draft;assert page.locator('#textAnswerInput').evaluate('(e)=>e===document.activeElement')
  page.locator('#textAnswerInput').fill('Esta es mi respuesta revisada.');page.locator('#textAnswerCheck').click()
  assert page.evaluate('__profiles.find(x=>x.id==="teen").progress.history.length')==count;assert page.locator('[data-self=true]').is_disabled();assert 'versión revisada' in page.locator('#exerciseFeedback').inner_text()
  page.evaluate('window.__current=null');page.locator('#exerciseNext').click();current();assert page.locator('#reviseWritingAnswer').is_hidden();assert page.locator('[data-self=false]').is_enabled()
  for domain in ['attention','executive']:
   it=open_area(domain);assert page.evaluate('__requests.at(-1).documents_only') is False;assert not any(b['type']=='document' for b in it.get('stimulus',[]))
   page.evaluate('window.__current=null');page.locator('#documentModeSwitch [data-documents=true]').click();it=current()
   assert any(b['type']=='document' for b in it['stimulus']);page.wait_for_function('()=>{const img=document.querySelector(".practice-document img");return img?.naturalWidth>0&&img.naturalWidth===Number(img.getAttribute("width"))}')
   if domain=='attention':assert it['type']=='standard'
   else:
    assert it['type']=='order'
    for token in it['answer']:page.get_by_role('button',name=token,exact=True).click()
    page.locator('#orderCheck').click();assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
    page.evaluate('window.__current=null');page.locator('#exerciseLevelSelect').select_option('3');it=current();assert it['type']=='documentReview';assert page.locator('#multiCheck').is_disabled()
    for label in it['answers']:page.get_by_role('button',name=label,exact=True).click()
    page.locator('#multiCheck').click();assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
   page.evaluate('window.__current=null');page.locator('#documentModeSwitch [data-documents=false]').click();it=current();assert not any(b['type']=='document' for b in it.get('stimulus',[]))
  # The reported attention source must remain four labelled facts after the
  # answer buttons shuffle. Verify both grading and narrow-screen layout.
  attention={'domain':'attention','id':'layout-regression','type':'standard','scenario':'A) azul-5 · B) rojo-6 · C) azul-6 · D) verde-7','q':'Elige la opción que es azul y tiene número par.','a':'C','opts':['A','B','C','D']}
  def attention_override(route):route.fulfill(json={'status':200,'data':{'items':[attention],'usage':{'used':29,'limit':500}}})
  page.route('**/__review/content',attention_override);open_area('attention')
  for width in [1280,390]:
   page.set_viewport_size({'width':width,'height':900})
   assert page.locator('.attention-data tbody tr').all_text_contents()==['Aazul-5','Brojo-6','Cazul-6','Dverde-7']
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   page.locator('#exercise').screenshot(path=f'/tmp/attention-data-{width}.png')
  page.locator('[data-answer=C]').click();assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  page.unroute('**/__review/content',attention_override);page.set_viewport_size({'width':1280,'height':900})
  # Deliver a canonical selective-recall item through the actual API boundary.
  selected=page.evaluate('Curriculum.pool("teen","memory",3).find(x=>x.selectiveRecall)')
  def memory_override(route):route.fulfill(json={'status':200,'data':{'items':[selected],'usage':{'used':30,'limit':500}}})
  page.route('**/__review/content',memory_override);page.clock.install();it=open_area('memory')
  assert page.locator('#exerciseVisual svg').count()==len(it['memoryContent']);assert not any(label.startswith(('el ','la ','los ','las ')) for label in page.locator('.stimulus-unit > span:last-child').all_text_contents());assert page.locator('#multiCheck').count()==0
  page.clock.fast_forward(it['revealMs']+50);assert page.locator('#exerciseVisual').inner_text()=='';assert page.locator('.multi-option svg').count()==len(it['opts'])
  for label in it['answers']:page.get_by_role('button',name=label,exact=True).click()
  assert '/' not in page.locator('#multiCount').inner_text();page.locator('#multiCheck').click();assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  for width in [1280,390]:
   page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.locator('#exercise').screenshot(path=f'/tmp/category-recall-{width}.png')
  page.unroute('**/__review/content',memory_override)
  # Two real Word versions retain both the visual evidence and the novel memory material.
  with page.expect_download() as download:
   page.evaluate('''()=>WorksheetGenerator.generate([[DocumentLibrary.pool('teen','executive',1)[0],DocumentLibrary.pool('teen','executive',3)[0],Curriculum.pool('teen','memory',3).find(x=>x.selectiveRecall)],Curriculum.pool('teen','memory',3).filter(x=>x.mechanic==='memory_association').slice(0,9)],__profiles.find(x=>x.id==='teen'))''')
  path=Path(tmp)/'new-mechanics.zip';download.value.save_as(path)
  with zipfile.ZipFile(path) as outer:
   assert len(outer.namelist())==2
   for name in outer.namelist():
    with zipfile.ZipFile(io.BytesIO(outer.read(name))) as doc:
     root=ET.fromstring(doc.read('word/document.xml'));assert len(root)>0;assert any(n.startswith('word/media/') and n.endswith('.png') for n in doc.namelist())
  assert not errors,errors;print('PASS: actionable self-review without duplicate scoring; distinct modes; ordered documentary plan and multi-error audit; timed category recall with visible response icons; mobile; two DOCX in a ZIP')
  browser.close()
finally:server.shutdown();server.server_close()

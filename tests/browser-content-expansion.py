"""Real app/Edge, fake auth/db: writing move, object recall, visual documents and timed comparisons."""
import importlib.util,threading,tempfile,zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900},device_scale_factor=1,accept_downloads=True);errors=[];external=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if r.url.startswith('https://') else None)
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#v16ContentLocale');page.wait_for_timeout(1000)
  page.evaluate('''()=>{const old=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return old(it,...args)}}''');page.clock.install();answered=0;exports=0
  def current():
   page.wait_for_function('()=>window.__current&&[__current.q,__current.memoryQuestion].includes(document.querySelector("#exercisePrompt").textContent)');return page.evaluate('__current')
  def open_area(domain):
   page.evaluate('window.__current=null');page.locator(f'#navMenu [data-subject="{domain}"]').click();return current()
  def switch_mode(mode):
   page.evaluate('window.__current=null');page.locator(f'#languageModeSwitch [data-mode={mode}]').click();return current()
  def next_item():
   page.evaluate('window.__current=null');page.locator('#exerciseNext').click();return current()
  def answer(it):
   global answered
   if it.get('recallSequence'):
    page.locator('#startMemorySequence').click();assert page.locator('.sequence-flash svg').count()==1;page.clock.run_for(len(it['recallSequence'])*(it['sequenceStepMs']+250)+50)
   elif it['type'].startswith('memory'):page.clock.run_for(it['revealMs']+50)
   if it.get('answer'):
    for token in it['answer']:page.locator('#exerciseOptions .word-token').get_by_text(token,exact=True).click()
    page.locator('#orderCheck').click()
   elif it.get('answers'):
    for label in it['answers']:page.locator('#exerciseOptions').get_by_role('button',name=label,exact=True).click()
    page.locator('#multiCheck').click()
   elif it['type']=='self':
    page.locator('#textAnswerInput').fill(it['sample']);page.locator('#textAnswerCheck').click();page.locator('[data-self="true"]').click()
   elif it.get('memoryResponse')=='spatial':
    page.get_by_role('button',name=it['a'],exact=True).click()
   else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   page.wait_for_selector('#exerciseNext:not(.hidden)');answered+=1
  def shot(name):
   for width in [1280,390]:
    page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),name
    page.locator('#exercise').screenshot(path=f'/tmp/expansion-{name}-{width}.png')
   page.set_viewport_size({'width':1280,'height':900})
  for age in ['early','junior','middle','teen']:
   page.locator('#profileSelect').select_option(age);page.wait_for_timeout(150)
   lang={'middle':'middleLanguage','teen':'teenLanguage'}.get(age,'language');read='reading' if age in ['early','junior'] else 'literacy'
   it=open_area(lang);assert not page.locator('#languageModeSwitch [data-mode=writing]').is_visible();assert it.get('languageFocus')!='writing'
   it=switch_mode('spelling');answer(it)
   it=switch_mode('vocabulary');assert it['languageFocus']=='vocabulary';shot(age+'-vocabulary');answer(it)
   it=open_area(read);assert 'Escritura' in page.locator(f'#navMenu [data-subject={read}]').inner_text()
   it=switch_mode('writing');assert page.evaluate('__requests.at(-1).subdomain')=='writing';assert it.get('type') in ['self','order'] or it.get('languageFocus')=='writing';shot(age+'-writing');answer(it)
   if age=='teen':
    assert it.get('writingPurpose')
    if any(b['type']=='document' for b in it['stimulus']):assert page.locator('.document-transcript').get_attribute('open') is None
   it=open_area('memory');seen=set()
   for n in range(15):
    family=it['mechanic'];seen.add(family)
    if not it.get('recallSequence'):
     assert page.locator('#exerciseVisual svg').count()>0,(age,family,page.locator('#exerciseVisual').inner_html());shot(age+'-'+family)
    answer(it)
    if {'memory_sequence','memory_spatial','memory_association','memory_recognition'}.issubset(seen):break
    it=next_item()
   assert {'memory_sequence','memory_spatial','memory_association','memory_recognition'}.issubset(seen),(age,seen)
   it=open_area('speedReasoning');families=set()
   for n in range(18):
    families.add(it['speedFamily']);page.locator('#startSpeedTrial').click();page.clock.run_for(750)
    if it['speedEvidence']['kind'] in ['equal','category']:
     assert page.locator('.speed-series').count()==2;assert page.locator('.speed-symbol').first.evaluate('(e)=>parseFloat(getComputedStyle(e).fontSize)')>=30;shot(age+'-speed-'+it['speedFamily'])
    page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click();answered+=1;assert page.locator('.speed-result').count()==1
    if {'objects','arrows','category'}.issubset(families):break
    it=next_item()
   assert {'objects','arrows','category'}.issubset(families),(age,families)
  # Every supported country plus International Spanish: source remains authored, not relocalized.
  for country in ['es_es','es_mx','es_co','es_ar','es_cl','es_pa','es_cr','es_intl']:
   page.locator('#v16ContentLocale').select_option(country);page.wait_for_function('(x)=>LearningAPI.contentLocale===x',arg=country)
   it=open_area('literacy');it=switch_mode('grammar')
   assert not page.locator('#documentModeSwitch').is_visible()
   assert not page.evaluate('__requests.at(-1).documents_only===true')
   for _ in range(4):
    if any(b['type']=='document' for b in it['stimulus']):break
    answer(it);it=next_item()
   doc=next(b['documentId'] for b in it['stimulus'] if b['type']=='document');source=page.evaluate('(id)=>DocumentLibrary.get(id)',doc)
   page.wait_for_function('()=>document.querySelector(".practice-document img")?.naturalWidth===1024')
   assert source['country'] in page.locator('figcaption').inner_text();assert page.locator('.document-transcript').get_attribute('open') is None
   page.locator('.document-transcript summary').click();assert page.locator('.document-transcript summary').inner_text()=='Ver versión en texto';assert 'Documento ficticio' not in page.locator('.document-transcript').inner_text();assert len(page.locator('.document-transcript').inner_text())>50;answer(it)
   # Real DOCX + ZIP with two versions, retaining images and written questions.
   with page.expect_download() as dl:
    page.evaluate('''()=>{const p=__profiles.find(x=>x.id==='teen');const all=DocumentLibrary.pool('teen','literacy',2);const written=Curriculum.pool('teen','literacy',2).filter(x=>x.writingPurpose).slice(0,2);return WorksheetGenerator.generate([[...all.slice(0,2),...written],all.slice(2,6)],p)}''')
   target=Path(tmp)/(country+'.zip');dl.value.save_as(target)
   with zipfile.ZipFile(target) as z:
    assert len(z.namelist())==2
    import io
    for name in z.namelist():
     with zipfile.ZipFile(io.BytesIO(z.read(name))) as docx:
      assert any(n.startswith('word/media/') for n in docx.namelist());assert b'<w:drawing>' in docx.read('word/document.xml');exports+=1
   assert not page.locator('#documentModeSwitch').is_visible()
  # All 18 document sources embedded in one real DOCX, including alt text.
  with page.expect_download() as dl:page.evaluate('()=>WorksheetGenerator.generate([DocumentLibrary.pool("teen","literacy",1)],__profiles.find(x=>x.id==="teen"))')
  target=Path(tmp)/'all-documents.docx';dl.value.save_as(target)
  with zipfile.ZipFile(target) as z:
   media=[z.read(n) for n in z.namelist() if n.startswith('word/media/')]
   for source in (ROOT/'assets/documents').glob('*.png'):assert source.read_bytes() in media,source
  exports+=1
  assert not errors,errors;assert not external,external
  print(f'PASS: 4 ages, writing navigation, all object recall families, varied readable timed stimuli desktop/mobile at 100%, 8 locales including international country context, {answered} answers, {exports} DOCX in 8 ZIP + standalone, all 18 image sources, no external calls or page errors')
  browser.close()
finally:
 server.shutdown();server.server_close()

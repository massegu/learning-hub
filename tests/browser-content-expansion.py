"""Real app/Edge, fake auth/db: writing move, object recall, visual documents and timed comparisons."""
import importlib.util,threading,tempfile,zipfile,io,xml.etree.ElementTree as ET
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT, area, training_areas, wait_for_area, submit_declared_answer, doc_accessible_text, printable_stimulus_values

def docx_visible_text(data):
 """Read printable Word text only; image descriptions are checked separately."""
 with zipfile.ZipFile(io.BytesIO(data)) as archive:
  root=ET.fromstring(archive.read('word/document.xml'))
 return [node.text or '' for node in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')]

def docx_image_descriptions(data):
 with zipfile.ZipFile(io.BytesIO(data)) as archive:
  root=ET.fromstring(archive.read('word/document.xml'))
 return [node.attrib for node in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}docPr')]

spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900},device_scale_factor=1,accept_downloads=True);errors=[];external=[]
  network_errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if r.url.startswith('https://') else None)
  page.on('requestfailed',lambda r:network_errors.append({'url':r.url,'failure':r.failure}))
  page.on('response',lambda r:network_errors.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#v16ContentLocale',state='attached');page.wait_for_timeout(1000)
  page.evaluate('''()=>{const old=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return old(it,...args)}}''');page.clock.install();answered=0;exports=0
  def current():
   page.wait_for_function('()=>window.__current&&[__current.q,__current.memoryQuestion].includes(document.querySelector("#exercisePrompt").textContent)');return page.evaluate('__current')
  def open_area(domain):
   page.evaluate('window.__current=null');area(page, domain).click();return current()
  def switch_mode(mode):
   page.locator('#languageModeSwitch').wait_for(state='visible')
   page.locator(f'#languageModeSwitch [data-mode={mode}]').wait_for(state='visible')
   page.evaluate('window.__current=null');page.locator(f'#languageModeSwitch [data-mode={mode}]').click();return current()
  def next_item():
   page.evaluate('window.__current=null');page.locator('#exerciseNext').click();return current()
  def answer(it):
   global answered
   if it.get('recallSequence'):
    page.locator('#startMemorySequence').click();assert page.locator('.sequence-flash svg').count()==1;page.clock.run_for(len(it['recallSequence'])*(it['sequenceStepMs']+250)+50)
   elif it['type'].startswith('memory'):page.clock.run_for(it['revealMs']+50)
   submit_declared_answer(page,it)
   page.wait_for_selector('#exerciseNext:not(.hidden)');answered+=1
  def shot(name):
   for width in [1280,390]:
    page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),name
    page.locator('#exercise').screenshot(path=f'/tmp/expansion-{name}-{width}.png')
   page.set_viewport_size({'width':1280,'height':900})
  for age in ['early','junior','middle','teen']:
   workspace(page).locator('#profileSelect').select_option(age);page.wait_for_timeout(150)
   lang={'middle':'middleLanguage','teen':'teenLanguage'}.get(age,'language');read='reading' if age in ['early','junior'] else 'literacy'
   it=open_area(lang);assert not page.locator('#languageModeSwitch [data-mode=writing]').is_visible();assert it.get('languageFocus')!='writing'
   it=open_area(lang);it=switch_mode('spelling');answer(it)
   it=open_area(lang);it=switch_mode('vocabulary');assert it['languageFocus']=='vocabulary';shot(age+'-vocabulary');answer(it)
   it=open_area(read);assert 'Escritura' in area(page, read).inner_text()
   it=open_area(read);it=switch_mode('writing');assert page.evaluate('__requests.at(-1).subdomain')=='writing';assert it.get('type') in ['self','order'] or it.get('languageFocus')=='writing';shot(age+'-writing');answer(it)
   if age=='teen':
    assert it.get('writingPurpose')
    if any(b['type']=='document' for b in it['stimulus']):assert page.locator('.document-transcript').get_attribute('open') is None
   it=open_area('memory');seen=set()
   for n in range(15):
    family=it['mechanic'];seen.add(family)
    if not it.get('recallSequence') and it.get('memoryResponse')!='audio' and not it.get('photoTask'):
     assert page.locator('#exerciseVisual svg').count()>0,(age,family,page.locator('#exerciseVisual').inner_html());shot(age+'-'+family)
    answer(it)
    if {'memory_sequence','memory_spatial','memory_association','memory_recognition'}.issubset(seen):break
    it=next_item()
   assert {'memory_sequence','memory_spatial','memory_association','memory_recognition'}.issubset(seen),(age,seen)
   it=open_area('speedReasoning');families=set()
   for n in range(18):
    families.add(it['speedFamily']);page.locator('#startSpeedTrial').click();page.clock.run_for(750)
    if it.get('speedEvidence',{}).get('kind')=='equal':
     count=page.locator('.speed-series').count()
     if count!=2:
      state=page.evaluate('()=>({item:window.__current,visual:document.querySelector("#exerciseVisual")?.innerHTML,options:document.querySelector("#exerciseOptions")?.innerHTML})')
      raise AssertionError(f"Speed family {it.get('speedFamily')} declares an equal-series comparison but rendered {count} series: {state}")
     assert page.locator('.speed-symbol').first.evaluate('(e)=>parseFloat(getComputedStyle(e).fontSize)')>=30;shot(age+'-speed-'+it['speedFamily'])
    elif it.get('speedEvidence',{}).get('kind')=='category':
     assert page.locator('#exerciseVisual .picture-icon').count()==len(it['stimulus'][it['speedEvidence']['block']]['items']),(it,page.locator('#exerciseVisual').inner_html())
    page.locator('#exerciseOptions [data-answer]').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',it['a']);answered+=1;assert page.locator('.speed-result').count()==1
    if {'objects','arrows','category'}.issubset(families):break
    it=next_item()
   visual_families={'objects','arrows','orientation','figures','pictograms','characters','mixed'}
   assert 'category' in families and families.intersection(visual_families),(age,families)
  # Every supported country plus International Spanish: source remains authored, not relocalized.
  for country in ['es_es','es_mx','es_co','es_ar','es_cl','es_pa','es_cr','es_intl']:
   workspace(page).locator('#v16ContentLocale').select_option(country);page.wait_for_function('(x)=>LearningAPI.contentLocale===x',arg=country)
   it=open_area('literacy');it=switch_mode('grammar')
   assert not page.locator('#documentModeSwitch').is_visible()
   assert not page.evaluate('__requests.at(-1).documents_only===true')
   for _ in range(4):
    if any(b['type']=='document' for b in it['stimulus']):break
    answer(it);it=next_item()
   doc=next(b['documentId'] for b in it['stimulus'] if b['type']=='document');source=page.evaluate('(id)=>DocumentLibrary.get(id)',doc)
   assert isinstance(source['country'],str) and source['country'],(doc,source)
   if doc=='everyday-boarding-pass':assert source['country']=='España' and (source['width'],source['height'])==(1500,850),(doc,source)
   image=Path(ROOT/source['path'])
   from PIL import Image
   with Image.open(image) as source_image: file_dimensions=source_image.size
   image_state=page.locator('.practice-document img').evaluate('(img)=>({src:img.getAttribute("src"),currentSrc:img.currentSrc,complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight})')
   try:
    page.wait_for_function('(dims)=>{const img=document.querySelector(".practice-document img");return img?.complete&&img.naturalWidth===dims[0]&&img.naturalHeight===dims[1]}',arg=[source['width'],source['height']])
   except Exception as error:
    image_state=page.locator('.practice-document img').evaluate('(img)=>({src:img.getAttribute("src"),currentSrc:img.currentSrc,complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight})')
    raise AssertionError(f'Document image failed to load: documentId={doc}, declared={source["width"]}x{source["height"]}, file={image}, fileDimensions={file_dimensions}, image={image_state}, networkErrors={network_errors}') from error
   assert image_state['src']==source['path'] and image_state['currentSrc'].endswith(source['path']),(doc,source['path'],image_state,network_errors)
   assert file_dimensions==(source['width'],source['height']) and (image_state['naturalWidth'],image_state['naturalHeight'])==file_dimensions,(doc,file_dimensions,image_state,source['width'],source['height'])
   print(f'DOCUMENT IMAGE: documentId={doc}, src={image_state["src"]}, currentSrc={image_state["currentSrc"]}, complete={image_state["complete"]}, natural={image_state["naturalWidth"]}x{image_state["naturalHeight"]}, file={image}, fileDimensions={file_dimensions}, networkErrors={network_errors}',flush=True)
   assert page.locator('.practice-document img').get_attribute('alt')==source['title']
   # Country remains metadata; the web figure displays the image and its action only.
   figure_text=page.locator('.practice-document').inner_text()
   assert source['country'] not in figure_text,(doc,source['country'],figure_text)
   link=page.locator('.practice-document figcaption a');assert link.inner_text()=='Ampliar documento' and link.get_attribute('href').endswith(source['path'])
   assert page.locator('.document-transcript').get_attribute('open') is None
   page.locator('.document-transcript summary').click();transcript=page.locator('.document-transcript').inner_text()
   assert page.locator('.document-transcript summary').inner_text()=='Ver versión en texto';assert 'Documento ficticio' not in transcript;assert len(transcript)>50
   assert all(value in transcript for value in printable_stimulus_values(page,{'type':'document','documentId':doc})),(doc,transcript,source['transcript'])
   answer(it)
   # Real DOCX + ZIP with two versions, retaining images and written questions.
   with page.expect_download() as dl:
    page.evaluate('''({selected,doc})=>{const p=__profiles.find(x=>x.id==='teen');const all=DocumentLibrary.pool('teen','literacy',2);const written=Curriculum.pool('teen','literacy',2).filter(x=>x.writingPurpose).slice(0,2);if(!selected.stimulus.some(b=>b.type==='document'&&b.documentId===doc))throw Error('La actividad seleccionada perdió su documento.');return WorksheetGenerator.generate([[selected,...all.slice(0,2),...written],all.slice(2,6)],p)}''',{'selected':it,'doc':doc})
   target=Path(tmp)/(country+'.zip');dl.value.save_as(target)
   with zipfile.ZipFile(target) as z:
    assert len(z.namelist())==2
    import io
    for index,name in enumerate(z.namelist()):
     with zipfile.ZipFile(io.BytesIO(z.read(name))) as docx:
      assert any(n.startswith('word/media/') for n in docx.namelist());assert b'<w:drawing>' in docx.read('word/document.xml');exports+=1
     if index==0:
      docx_bytes=z.read(name)
      visible=docx_visible_text(docx_bytes)
      descriptions=docx_image_descriptions(docx_bytes)
      # The selected activity is first. Keep image alt text separate from visible Word text.
      activity_start=visible.index('ACTIVIDAD 1')
      activity_end=visible.index('ACTIVIDAD 2',activity_start+1)
      visible_activity=' '.join(visible[activity_start:activity_end])
      transcript_values=printable_stimulus_values(page,{'type':'document','documentId':doc})
      selected_image=next((description for description in descriptions if source['title'] in description.get('name','') or source['title'] in description.get('title','')),None)
      assert selected_image,(doc,source['title'],descriptions)
      assert all(value in selected_image.get('descr','') for value in transcript_values),(doc,transcript_values,selected_image)
      assert all(value not in visible_activity for value in transcript_values),(doc,'document transcript duplicated as visible Word text',visible_activity,transcript_values)
      assert 'Ampliar documento' not in visible,(doc,'web-only control leaked into DOCX',visible)
      with zipfile.ZipFile(io.BytesIO(docx_bytes)) as exported_docx:
       xml=ET.fromstring(exported_docx.read('word/document.xml'))
       assert any(node.tag.endswith('}drawing') for node in xml.iter()),(doc,'document image missing from Word')
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

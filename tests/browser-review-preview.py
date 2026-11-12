"""Exercise the actual user-facing isolated launcher, including its CSP and DOCX."""
import importlib.util
import json
import re
from pathlib import Path
import tempfile
import threading
import zipfile
import io
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT, doc_text, area, training_areas, wait_for_area

spec=importlib.util.spec_from_file_location('review_preview',ROOT/'tools/review-preview.py')
preview=importlib.util.module_from_spec(spec);spec.loader.exec_module(preview)
server=preview.ReviewServer(('127.0.0.1',0),preview.prepare())
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory(prefix='review-docx-') as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':900});errors=[];external=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda req:external.append(req.url) if req.url.startswith('https://') else None)
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
  page.wait_for_selector('#homeAreaLanding:not(.hidden)');page.wait_for_timeout(1000)
  page.evaluate('''()=>{window.__delivered=[];const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;__delivered.push(it);return gate(it,...args)};window.__exports=[];const generate=WorksheetGenerator.generate;WorksheetGenerator.generate=async(items,profile)=>{__exports.push({items,profile});return generate(items,profile)}}''')
  page.clock.install()
  def wait_item():
   page.wait_for_function('()=>__current&&[__current.q,__current.memoryQuestion].includes(document.querySelector("#exercisePrompt").textContent)')
   it=page.evaluate('__current')
   if it['type']=='memoryReveal':page.clock.fast_forward(it['revealMs']+50)
   page.wait_for_function('()=>(document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0)||(__current?.type==="self"&&!document.querySelector("#textAnswerArea").classList.contains("hidden"))')
   return it
  def open_domain(domain,level):
   page.evaluate('window.__current=null');area(page, domain).click();it=wait_item()
   if it['level']!=level:
    page.evaluate('window.__current=null');page.locator('#exerciseLevelSelect').select_option(str(level));it=wait_item()
   return it
  def answer(it):
   if it.get('recallSequence'):
    page.locator('#startMemorySequence').click()
    page.clock.run_for(len(it['recallSequence'])*(it['sequenceStepMs']+250)+50)
    page.wait_for_selector('#exerciseOptions .sequence-workspace')
   elif it.get('photoTask',{}).get('kind')=='recall':
    page.locator('#showMemoryPhoto').click()
    page.wait_for_function('()=>document.querySelector("#exerciseVisual img")?.complete&&document.querySelector("#exerciseVisual img").naturalWidth>0')
    page.clock.fast_forward(it['revealMs']+50)
    page.wait_for_function('document.querySelectorAll("#exerciseOptions .option-btn").length>0')
   elif it.get('audioMemory'):
    page.evaluate('''()=>{window.SpeechSynthesisUtterance=function(text){this.text=text};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},getVoices(){return []},speak(voice){queueMicrotask(()=>voice.onend?.())}}})}''')
    page.locator('#playMemoryAudio').click();page.wait_for_function('()=>document.querySelector("#answerMemoryAudio")?.disabled===false');page.locator('#answerMemoryAudio').click()
    page.wait_for_selector('#exerciseOptions .option-btn')
   if it['type']=='order' or it.get('memoryResponse')=='order':
    for token in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
    page.locator('#orderCheck').click()
   elif it['type']=='photoDifference' and it['level']>=3:
    page.evaluate('''answers=>{for(const value of answers){const option=[...document.querySelectorAll('#exerciseOptions .multi-option')].find(button=>button.dataset.value===value);if(!option)throw Error('Opción fotográfica no encontrada: '+value);const mark=[...document.querySelectorAll('.photo-hit')].find(button=>button.dataset.value===option.dataset.value);if(!mark)throw Error('Marca visual no encontrada: '+value);mark.click()}}''',it['answers'])
    page.locator('#multiCheck').click()
   elif it['type'] in ['memoryMulti','multiSelect','documentReview','photoDifference'] or it.get('memoryResponse')=='multiple' or it.get('responseType')=='multiple':
    for value in it.get('answers',[]):page.locator('#exerciseOptions').get_by_role('button',name=value,exact=True).click()
    page.locator('#multiCheck').click()
   elif it.get('memoryResponse')=='spatial':
    value=it.get('a') or it.get('answer');value=value[0] if isinstance(value,list) else value
    page.locator('#exerciseOptions').get_by_role('button',name=str(value),exact=True).click()
   elif it.get('speedTask'):
    page.locator('#practiceSpeedTrial').click();page.wait_for_selector('#exerciseOptions .speed-choice')
    page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   elif it['type']=='self':
    page.locator('#textAnswerInput').fill(it['sample']);page.locator('#textAnswerCheck').click();page.locator('[data-self="true"]').click()
   else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   page.wait_for_function('()=>document.querySelector("#exerciseFeedback").classList.contains("ok")')
  count=0
  cases={'early':['language'],'junior':['reading','memory','attention','speedReasoning'],'primary':['geometry','language','literacy','attention'],'middle':['middleLanguage','attention'],'teen':['teenLanguage','speedReasoning','literacy']}
  for band,domains in cases.items():
   workspace(page).locator('#profileSelect').select_option(band)
   if band=='primary':
    assert area(page, 'reading').count()==0
    assert page.locator('[data-school-area="reading"]').count()==0
    assert page.locator('#homeworkOptions [value="reading"]').count()==0
   if band=='middle':assert page.locator('#appShell').get_attribute('data-age-theme')=='studio'
   for domain in domains:
    open_domain(domain,3)
    if domain in ['language','teenLanguage'] and band!='early':
     page.evaluate('window.__current=null');page.locator('[data-mode="spelling"]').click();wait_item()
    keys=[]
    for n in range(10):
     it=wait_item();assert it.get('level')==page.evaluate('__requests.at(-1).level')
     if band in ['junior','primary','middle']:assert it.get('juniorProfile') or it.get('schoolProfile')
     if band=='teen':
      teen_route='teen' if it.get('teenReview') or it.get('id','').startswith('teen-') or ':teen:' in it.get('contentKey','') else it.get('qualityEvidence',{}).get('age') or it.get('schoolProfile',{}).get('route')
      assert teen_route=='teen',(it.get('id'),it.get('teenReview'),it.get('qualityEvidence'),it.get('schoolProfile'))
     if band=='primary' and domain=='geometry':assert it['domain']=='geometry';assert ' + ' not in it['q']
     if band=='junior' and domain=='reading':
      source=it['stimulus'][0]
      if source['type']=='text':assert source['text'].strip(),(it['id'],source)
      elif source['type']=='document':assert page.evaluate('(id)=>Boolean(DocumentLibrary.get(id)?.transcript?.length)',source['documentId'])
      elif source['type']=='table':assert source.get('rows') and all(row for row in source['rows'])
      elif source['type']=='list':assert source.get('items')
      else:raise AssertionError(('Unsupported junior reading material',it['id'],source))
     if domain in ['language','teenLanguage'] and band!='early':assert it['languageFocus']=='spelling';assert 'inferencia' not in it['q'].lower()
     keys.append(it.get('contentKey') or it.get('semanticKey'));answer(it);count+=1
     if n<9:page.evaluate('window.__current=null');page.locator('#exerciseNext').click()
    assert all(a!=b for a,b in zip(keys,keys[1:])),(band,domain)
    for width in [1280,390]:
     page.set_viewport_size({'width':width,'height':900})
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(band,domain,width)
     page.locator('#exercise').screenshot(path=f'/tmp/review-{band}-{domain}-{width}.png')
    page.set_viewport_size({'width':1280,'height':900})
   page.locator('#navMenu [data-section="homework"]').click()
   assert page.locator('#homework').is_visible(), (band,errors,page.locator('.active-section').evaluate_all('(els)=>els.map(e=>e.id)'))
   page.locator('#worksheetAll').click()
   page.locator('#worksheetQuestions').select_option('20');page.locator('#worksheetCount').select_option('1')
   with page.expect_download(timeout=30000) as download:page.locator('#generateWorksheetsBtn').click()
   path=Path(tmp)/f'{band}.docx';download.value.save_as(path);docx_bytes=path.read_bytes();nodes=doc_text(docx_bytes)
   items=page.evaluate('__exports.at(-1).items[0]');assert len(items)==20
   models=page.evaluate('items=>items.map(it=>ActivityModel.printable(it,__profiles.find(p=>p.id===it.profile_id)||__profiles.find(p=>p.id===document.querySelector("#profileSelect").value)))',items)
   with zipfile.ZipFile(io.BytesIO(docx_bytes)) as archive:media_count=sum(name.startswith('word/media/') for name in archive.namelist())
   visual_count=sum(stimulus['type'] in ['photo','photoPair','document'] for model in models for stimulus in model['stimulus'])
   if visual_count:assert media_count>=visual_count,(band,visual_count,media_count)
   for i,model in enumerate(models):
    start=nodes.index(f'ACTIVIDAD {i+1}');stop=nodes.index(f'ACTIVIDAD {i+2}') if i+1<len(items) else len(nodes)
    block=nodes[start:stop]
    paper_item=items[i]
    paper_question=paper_item['paperQuestion'] if paper_item.get('speedEvidence',{}).get('kind')=='category' and paper_item.get('speedEvidence',{}).get('category')=='animals' else model['question']
    question=block.index(paper_question)
    for stimulus in model['stimulus']:
     if stimulus['type']=='text':values=[stimulus['text']]
     elif stimulus['type']=='list':values=stimulus['items']
     elif stimulus['type']=='table':values=[v for row in stimulus['rows'] for v in row]
     else:
      assert stimulus['type'] in ['photo','photoPair','document'],(band,i,stimulus)
      values=[]
     for value in values:
      labels=[value]
      if items[i].get('type') in ['memoryReveal','executed'] and stimulus.get('presentation') in ['count','cards','sequence']:
       labels.append(page.evaluate('(value)=>ActivityModel.memoryLabel(value)',value))
      normalize=lambda text:re.sub(r'^(?:el|la|los|las|un|una|unos|unas)\s+','',text.strip(),flags=re.I).casefold()
      assert any(any(normalize(label) in normalize(node) for label in labels) for node in block[:question]),(band,i,value)
   print(f'PASS: {band}, ten consecutive activities per selected domain, responsive screenshots, complete 20-question DOCX',flush=True)
  assert not errors,errors;assert not external,external
  print(f'PASS: isolated user launcher, {count} answers, five worksheets, no external HTTP requests or page errors',flush=True)
  browser.close()
finally:
 server.shutdown();server.server_close()

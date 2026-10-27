"""Exercise the actual user-facing isolated launcher, including its CSP and DOCX."""
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT, doc_text

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
  page.wait_for_selector('#earlyContinue');page.wait_for_timeout(1000)
  page.evaluate('''()=>{window.__delivered=[];const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;__delivered.push(it);return gate(it,...args)};window.__exports=[];const generate=WorksheetGenerator.generate;WorksheetGenerator.generate=async(items,profile)=>{__exports.push({items,profile});return generate(items,profile)}}''')
  page.clock.install()
  def wait_item():
   page.wait_for_function('()=>__current&&[__current.q,__current.memoryQuestion].includes(document.querySelector("#exercisePrompt").textContent)')
   it=page.evaluate('__current')
   if it['type']=='memoryReveal':page.clock.fast_forward(it['revealMs']+50)
   page.wait_for_function('()=>(document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0)||(__current?.type==="self"&&!document.querySelector("#textAnswerArea").classList.contains("hidden"))')
   return it
  def open_domain(domain,level):
   page.evaluate('window.__current=null');page.locator(f'#navMenu [data-subject="{domain}"]').click();it=wait_item()
   if it['level']!=level:
    page.evaluate('window.__current=null');page.locator('#exerciseLevelSelect').select_option(str(level));it=wait_item()
   return it
  def answer(it):
   if it['type']=='order':
    for token in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
    page.locator('#orderCheck').click()
   elif it['type']=='self':
    page.locator('#textAnswerInput').fill(it['sample']);page.locator('#textAnswerCheck').click();page.locator('[data-self="true"]').click()
   else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   page.wait_for_function('()=>document.querySelector("#exerciseFeedback").classList.contains("ok")')
  count=0
  cases={'early':['language'],'junior':['reading','memory','attention','speedReasoning'],'primary':['geometry','language','literacy','attention'],'middle':['middleLanguage','attention'],'teen':['teenLanguage','speedReasoning','literacy']}
  for band,domains in cases.items():
   workspace(page).locator('#profileSelect').select_option(band)
   if band=='primary':
    assert page.locator('#navMenu [data-subject="reading"]').count()==0
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
     if band=='teen':assert it.get('teenReview')
     if band=='primary' and domain=='geometry':assert it['domain']=='geometry';assert ' + ' not in it['q']
     if band=='junior' and domain=='reading':assert len(it['stimulus'][0]['text'].split())>=40
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
   path=Path(tmp)/f'{band}.docx';download.value.save_as(path);nodes=doc_text(path.read_bytes())
   items=page.evaluate('__exports.at(-1).items[0]');assert len(items)==20
   models=page.evaluate('items=>items.map(it=>ActivityModel.printable(it,__profiles.find(p=>p.id===it.profile_id)||__profiles.find(p=>p.id===document.querySelector("#profileSelect").value)))',items)
   for i,model in enumerate(models):
    start=nodes.index(f'ACTIVIDAD {i+1}');stop=nodes.index(f'ACTIVIDAD {i+2}') if i+1<len(items) else len(nodes)
    block=nodes[start:stop];question=block.index(model['question'])
    for stimulus in model['stimulus']:
     values=[stimulus['text']] if stimulus['type']=='text' else stimulus['items'] if stimulus['type']=='list' else [v for row in stimulus['rows'] for v in row]
     for value in values:assert any(value in node for node in block[:question]),(band,i,value)
   print(f'PASS: {band}, ten consecutive activities per selected domain, responsive screenshots, complete 20-question DOCX',flush=True)
  assert not errors,errors;assert not external,external
  print(f'PASS: isolated user launcher, {count} answers, five worksheets, no external HTTP requests or page errors',flush=True)
  browser.close()
finally:
 server.shutdown();server.server_close()

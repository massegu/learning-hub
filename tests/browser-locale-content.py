"""Seven countries × five ages, real local app/handler, no service substitutions."""
import importlib.util
from pathlib import Path
import tempfile
import threading
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT,doc_text

spec=importlib.util.spec_from_file_location('review_preview',ROOT/'tools/review-preview.py')
preview=importlib.util.module_from_spec(spec);spec.loader.exec_module(preview)
server=preview.ReviewServer(('127.0.0.1',0),preview.prepare())
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory(prefix='regional-docx-') as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':900});errors=[];external=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:external.append(r.url) if r.url.startswith('https://') else None)
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
  page.wait_for_selector('#v16ContentLocale');page.wait_for_timeout(3000)
  page.evaluate('''()=>{window.__current=null;window.__exports=[];const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return gate(it,...args)};const generate=WorksheetGenerator.generate;WorksheetGenerator.generate=async(items,profile)=>{__exports.push({items,profile});return generate(items,profile)}}''')
  page.clock.install()
  def wait_item():
   page.wait_for_function('()=>__current&&[__current.q,__current.memoryQuestion].includes(document.querySelector("#exercisePrompt").textContent)')
   it=page.evaluate('__current')
   if it.get('type')=='memoryReveal':page.clock.fast_forward(it['revealMs']+50)
   page.wait_for_function('()=>(document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0)||(__current?.type==="self"&&!document.querySelector("#textAnswerArea").classList.contains("hidden"))')
   return it
  count=0;worksheets=0
  for index,key in enumerate(['es_es','es_mx','es_co','es_ar','es_cl','es_pa','es_cr']):
   workspace(page).locator('#v16ContentLocale').select_option(key)
   page.wait_for_function('(key)=>LearningAPI.contentLocale===key&&!document.querySelector("#v16ContentLocale").disabled',arg=key)
   for band in ['early','junior','primary','middle','teen']:
    workspace(page).locator('#profileSelect').select_option(band)
    domains=page.locator('#navMenu [data-subject]:visible').evaluate_all('(els)=>els.map(e=>e.dataset.subject)')
    plan=(domains*2)[:10]
    for domain in plan:
     page.evaluate('window.__current=null');page.locator(f'#navMenu [data-subject="{domain}"]').click();it=wait_item()
     level=1 if index%2==0 else 3
     if it['level']!=level:
      page.evaluate('window.__current=null');page.locator('#exerciseLevelSelect').select_option(str(level));it=wait_item()
     assert it['localization']['locale']==key,(band,domain,key)
     assert page.evaluate('LearningAPI.effectiveLocale()')==key
     if band!='early':assert page.evaluate('__requests.at(-1).locale')==key
     if it.get('topic') and it.get('stimulus') and len(it['stimulus'])>1 and any(b.get('text')==it.get('topic') for b in it['stimulus']):
      assert not page.locator('#exerciseVisual').get_by_text(it['topic'],exact=True).count(),(band,domain,it['topic'])
     if it.get('type')=='order':
      for token in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
      page.locator('#orderCheck').click()
     elif it.get('type')=='self':
      page.locator('#textAnswerInput').fill(it['sample']);page.locator('#textAnswerCheck').click();page.locator('[data-self="true"]').click()
     else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
     page.wait_for_function('()=>document.querySelector("#exerciseFeedback").classList.contains("ok")');count+=1
    page.locator('#navMenu [data-section="homework"]').click();page.locator('#worksheetAll').click()
    page.locator('#worksheetQuestions').select_option('20');page.locator('#worksheetCount').select_option('1')
    with page.expect_download(timeout=45000) as download:page.locator('#generateWorksheetsBtn').click()
    path=Path(tmp)/f'{key}-{band}.docx';download.value.save_as(path);nodes=doc_text(path.read_bytes());exported=page.evaluate('__exports.at(-1)');items=exported['items'][0]
    assert len(items)==20;assert all(it['localization']['locale']==key for it in items)
    models=page.evaluate('({items,profile})=>items.map(it=>ActivityModel.printable(it,profile))',dict(items=items,profile=exported['profile']))
    for i,model in enumerate(models):
     start=nodes.index(f'ACTIVIDAD {i+1}');stop=nodes.index(f'ACTIVIDAD {i+2}') if i+1<len(items) else len(nodes);block=nodes[start:stop];q=block.index(model['question'])
     for stimulus in model['stimulus']:
      values=[stimulus['text']] if stimulus['type']=='text' else stimulus['items'] if stimulus['type']=='list' else [v for row in stimulus['rows'] for v in row]
      for value in values:assert any(value in node for node in block[:q]),(key,band,i,value)
     for option in model['options']+model['tokens']:assert any(node.endswith('. '+option) for node in block),(key,band,i,option)
    worksheets+=1
    print(f'PASS: {key}/{band}: 10 answers across {len(set(plan))} domains, complete 20-question DOCX',flush=True)
   page.locator('#navMenu [data-section="home"]').click()
   assert page.locator('#v16ContentLocale').input_value()==key
  assert not errors,errors;assert not external,external
  print(f'PASS: {count} answers, {worksheets} DOCX, seven countries, five ages, no page errors or external HTTPS requests',flush=True)
  browser.close()
finally:
 server.shutdown();server.server_close()

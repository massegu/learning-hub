"""Phase-one sources use the existing screen, grader and Word renderer."""
import importlib.util,threading,tempfile,zipfile,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace,ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or '/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect')
  page.evaluate('''()=>{const old=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return old(it,...args)}}''')
  # Force one reviewed source through the actual younger local adapter.
  workspace(page).locator('#profileSelect').select_option('early')
  page.evaluate('''()=>{const original=EarlyContent.adaptResponse;window.__restoreSelect=()=>EarlyContent.adaptResponse=original;EarlyContent.adaptResponse=(response,payload,profile,options)=>original(response,payload,profile,payload.domain==='attention'?{accept:it=>it.qualityDescriptor?.semanticFamily==='attention.omission'}:payload.domain==='language'?{accept:it=>it.qualityDescriptor?.semanticFamily==='language.sentence_order'}:options)}''')
  workspace(page).locator('#navMenu [data-subject=attention]').click();page.wait_for_function('()=>window.__current?.qualityEvidence?.age==="early"&&document.querySelector("#exercisePrompt").textContent===__current.q')
  assert 'lista 2' in page.locator('#exercisePrompt').inner_text()
  page.locator('[data-answer]').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',page.evaluate('__current.a'))
  assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  page.locator('#exercise').screenshot(path='/tmp/content-quality-early.png')
  page.set_viewport_size({'width':1280,'height':1000});workspace(page).locator('#navMenu [data-subject=language]').click();page.wait_for_selector('#orderCheck')
  for token in page.evaluate('__current.answer'):page.get_by_role('button',name=token,exact=True).click()
  page.locator('#orderCheck').click();assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class');page.evaluate('__restoreSelect()')
  page.set_viewport_size({'width':1280,'height':1000});workspace(page).locator('#profileSelect').select_option('teen')
  page.evaluate('''()=>{window.__fixture=FunctionalContent.pool('teen','english',3).find(it=>it.qualityDescriptor.semanticFamily==='english.sequence');LearningAPI.requestContent=async()=>({items:[structuredClone(__fixture)],usage:{used:2,limit:500}})}''')
  workspace(page).locator('#navMenu [data-subject=english]').click();page.wait_for_function('()=>window.__current?.qualityEvidence?.age==="teen"&&document.querySelector("#exercisePrompt").textContent===__current.q')
  page.evaluate('window.__current=null');page.locator('#exerciseLevelSelect').select_option('3');page.wait_for_function('()=>window.__current?.level===3&&document.querySelector("#exercisePrompt").textContent===__current.q')
  assert page.locator('#exerciseLevelSelect').input_value()=='3'
  assert 'before cutting' in page.locator('#exercisePrompt').inner_text()
  page.locator('[data-answer]').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',page.evaluate('__fixture.a'))
  assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class');page.locator('#exercise').screenshot(path='/tmp/content-quality-teen.png')
  with page.expect_download() as dl:page.evaluate('()=>WorksheetGenerator.generate([[__fixture]],__profiles.find(p=>p.id==="teen"))')
  file=Path(tmp)/'functional.docx';dl.value.save_as(file)
  with zipfile.ZipFile(file) as z:
   xml=z.read('word/document.xml').decode();assert 'before cutting' in xml;assert 'Wash the fruit' in xml
  assert not errors,errors;browser.close();print('PASS: reviewed early choice and word order through local adapter, teen English through API, correct grading, 390px and matching DOCX source')
finally:server.shutdown();server.server_close()

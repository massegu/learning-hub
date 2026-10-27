"""Age design switches, dated progress and actual new sources in the running app."""
import importlib.util,threading,os,json,tempfile,zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
shots=ROOT/'docs/review-assets/calma-impulso';shots.mkdir(parents=True,exist_ok=True)
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),args=['--no-sandbox']);page=browser.new_page(viewport={'width':1440,'height':1050});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
  def menu():
   if page.locator('#workspaceMenu').is_visible() and page.locator('#workspaceMenu').get_attribute('aria-expanded')!='true':page.locator('#workspaceMenu').click()
  for age in ['early','junior','primary','middle','teen']:
   page.set_viewport_size({'width':1440,'height':1050});page.locator('#profileSelect').select_option(age)
   expected='impulso' if age in ['middle','teen'] else 'calma';assert page.locator('#appShell').get_attribute('data-design')==expected
   boxes=page.evaluate('()=>({main:document.querySelector(".main-content").getBoundingClientRect().left,side:document.querySelector(".sidebar").getBoundingClientRect().right})');assert boxes['main']>=boxes['side']-1,boxes
   page.screenshot(path=str(shots/f'{age}-desktop.png'))
   page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),age
   assert page.locator('#workspaceMenu').is_visible();menu();assert page.locator('#profileSelect').is_visible();page.locator('#workspaceMenu').click();assert not page.locator('#navMenu').is_visible()
   page.screenshot(path=str(shots/f'{age}-mobile.png'),full_page=True)
  page.set_viewport_size({'width':1440,'height':1050});page.locator('#profileSelect').select_option('primary')
  page.evaluate('''()=>{window.__fixture=DocumentLibrary.pool('primary','attention',1).find(it=>it.stimulus.some(b=>b.documentId==='everyday-museum-brochure'));LearningAPI.requestContent=async()=>({items:[structuredClone(__fixture)],usage:{used:1,limit:500}})}''')
  page.locator('#navMenu [data-subject=attention]').click();page.wait_for_selector('.practice-document img');page.wait_for_function('()=>document.querySelector(".practice-document img").naturalWidth===1600');assert 'museo' in page.locator('#exercisePrompt').inner_text()
  page.locator('#exercise').screenshot(path=str(shots/'calma-document-desktop.png'))
  page.locator('#exerciseOptions [data-answer]').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',page.evaluate('__fixture.a'))
  assert page.locator('.option-btn.correct').evaluate('e=>getComputedStyle(e).borderTopWidth')=='2px'
  page.locator('#navMenu [data-section=progress]').click();page.locator('.progress-chart-data summary').click();assert 'Fecha y hora' in page.locator('.progress-chart-data').inner_text();assert '2026' in page.locator('.progress-chart-data tbody').inner_text();page.locator('#sessionEvolution').screenshot(path=str(shots/'dated-sessions.png'))
  page.locator('#profileSelect').select_option('teen')
  page.evaluate('''()=>{window.__fixture=PhotoLibrary.pool('teen','memory',1).find(it=>it.photoTask.sceneId==='library2026');LearningAPI.requestContent=async()=>({items:[structuredClone(__fixture)],usage:{used:2,limit:500}})}''')
  page.locator('#navMenu [data-subject=memory]').click();page.wait_for_selector('#showMemoryPhoto');page.locator('#showMemoryPhoto').click();page.wait_for_selector('#exerciseVisual img');assert page.locator('#exerciseVisual img').evaluate('e=>e.naturalWidth')==1536
  page.locator('#exercise').screenshot(path=str(shots/'impulso-scene-desktop.png'))
  # Real DOCX export embeds exactly the new original document PNG.
  with page.expect_download() as dl:
   page.evaluate('()=>WorksheetGenerator.generate([DocumentLibrary.pool("primary","attention",1).filter(it=>it.stimulus.some(b=>b.documentId==="everyday-museum-brochure"))],__profiles.find(p=>p.id==="primary"))')
  file=Path(tmp)/'new-document.docx';dl.value.save_as(file)
  with zipfile.ZipFile(file) as z:
   media=[z.read(n) for n in z.namelist() if n.startswith('word/media/')];assert (ROOT/'assets/documents/everyday-es-2026/museum-brochure.png').read_bytes() in media
  assert not errors,errors;browser.close();print('PASS: five age routes, 390px menu, current document image and grading, dated sessions, new scene and DOCX source; no page errors')
finally:server.shutdown();server.server_close()

"""Render canonical age-appropriate recall and verify compact visible location targets."""
import importlib.util,threading,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1360,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.clock.install();page.clock.pause_at(page.evaluate('Date.now()+1000'))
  page.evaluate('()=>{LearningAPI.requestContent=async()=>({items:[structuredClone(window.__memoryFixture)],usage:{used:1,limit:500}})}')
  page.evaluate('()=>{window.__current=null;const previous=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return previous(it,...args)}}')
  chosen=page.evaluate('window.__memoryFixture=Curriculum.pool("early","memory",1).find(it=>it.mechanic==="memory_association")');page.locator('#profileSelect').select_option('early')
  # The 6–7 adapter deliberately selects locally after authorization. Exercise
  # its real rotation until associations appear instead of bypassing that gate.
  for _ in range(12):
   page.evaluate('window.__current=null');page.locator('#navMenu [data-subject=memory]').click()
   page.wait_for_function('()=>__current&&document.querySelector("#exercisePrompt").textContent===__current.q')
   if page.locator('.memory-associations').count():break
  assert page.locator('.memory-associations tbody tr').count()==2
  page.locator('#exercise').screenshot(path='/tmp/memory-youngest-two-pairs.png')
  chosen=page.evaluate('window.__memoryFixture=Curriculum.pool("primary","memory",1).find(it=>it.memoryResponse==="spatial"&&it.spatialAnswer==="grid")')
  page.locator('#profileSelect').select_option('primary');page.locator('#navMenu [data-subject=memory]').click();page.wait_for_selector('.recall-grid');page.clock.run_for(chosen['revealMs']+100);page.wait_for_selector('.spatial-answer-grid')
  for width in [1360,390]:
   page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   grid=page.locator('.spatial-answer-grid');box=grid.bounding_box();assert box['width']<=385 and box['height']<=330,box
   target=grid.locator('button').first;style=target.evaluate('e=>({border:getComputedStyle(e).borderTopWidth,background:getComputedStyle(e).backgroundColor,body:getComputedStyle(document.body).backgroundColor})');assert style['border']=='2px';assert style['background']!=style['body']
   grid.screenshot(path=f'/tmp/memory-locations-{width}.png')
  page.locator('.spatial-answer-grid button').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',chosen['a']);assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  assert not errors,errors;browser.close();print('PASS: two youngest associations, compact high-contrast spatial targets at desktop/mobile sizes and correct spatial grading')
finally:server.shutdown();server.server_close()

"""Presentation regression: real browser, local content, synthetic progress only."""
import importlib.util,threading,os
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or '/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.locator('#profileSelect').select_option('teen')
  page.evaluate('''()=>{const old=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return old(it,...args)}}''')
  fixture={}
  def override(route):route.fulfill(json={'status':200,'data':{'items':[fixture],'usage':{'used':1,'limit':500}}})
  page.route('**/__review/content',override)
  def show(item,domain):
   fixture.clear();fixture.update(item);page.evaluate('window.__current=null');page.locator(f'#navMenu [data-subject={domain}]').click()
   page.wait_for_function('()=>__current&&document.querySelector("#exercisePrompt").textContent===__current.q')
  passage=page.evaluate('Curriculum.pool("teen","literacy",1).find(x=>x.stimulus?.some(b=>b.type==="text"&&b.text.length>350))')
  for width in [1440,390]:
   page.set_viewport_size({'width':width,'height':1000});show(passage,'literacy')
   size=page.locator('.stimulus-paragraph').first.evaluate('(e)=>({text:e.getBoundingClientRect().width,box:e.parentElement.clientWidth-parseFloat(getComputedStyle(e.parentElement).paddingLeft)-parseFloat(getComputedStyle(e.parentElement).paddingRight)})')
   assert abs(size['text']-size['box'])<2,size
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   page.locator('#exercise').screenshot(path=f'/tmp/presentation-reading-{width}.png')
  page.set_viewport_size({'width':1440,'height':1000});page.clock.install()
  route=page.evaluate('Curriculum.pool("teen","memory",1).find(x=>x.mechanic==="memory_route")');assert len(route['answer'])==3
  show(route,'memory');assert page.locator('.memory-route svg svg').count()==3;page.locator('#exercise').screenshot(path='/tmp/presentation-route.png')
  page.clock.run_for(route['revealMs']+50);assert page.locator('.memory-route').count()==0
  for value in route['answer']:page.get_by_role('button',name=value,exact=True).click()
  page.locator('#orderCheck').click();assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  page.evaluate('''()=>{const p=__profiles.find(x=>x.id==='teen');p.progress._curriculumRevision=2;
   const row=(family,level,revision,correct,responseMs,timingValid=true)=>({subject:'speedReasoning',speedFamily:family,level,speedRevision:revision,correct,responseMs,timingValid,ts:'2026-10-20T12:00:00Z',points:correct?10:0});
   p.progress.history=[row('pairs',1,4,true,1000),row('pairs',1,4,true,3000),row('pairs',1,4,false,9000),row('pairs',1,4,true,70000,false),row('pairs',1,4,true,null),row('pairs',2,4,true,5000),row('pairs',1,2,true,6000),row('search',1,4,false,4000),...Array.from({length:25},(_,i)=>row('characters',1,4,true,(i+1)*1000))];}''')
  page.locator('#profileSelect').select_option('junior');page.locator('#profileSelect').select_option('teen');page.locator('#navMenu [data-section=progress]').click()
  chart=page.locator('#speedProgressChart');assert chart.is_visible();assert chart.locator('.speed-timing-row').count()==5
  pairs=chart.locator('[data-family=pairs][data-level="1"][data-revision="4"]');assert pairs.get_attribute('data-median-ms')=='2000'
  assert pairs.locator('p').inner_text()=='67% de aciertos\n3 respuestas medidas'
  assert chart.locator('[data-family=pairs][data-level="2"]').get_attribute('data-median-ms')=='5000'
  assert chart.locator('[data-family=pairs][data-revision="2"]').get_attribute('data-median-ms')=='6000'
  assert 'formato anterior' in chart.locator('[data-revision="2"]').inner_text()
  failed=chart.locator('[data-family=search]');assert failed.get_attribute('data-median-ms')=='';assert failed.locator('svg rect').count()==1;assert '0% de aciertos' in failed.inner_text()
  recent=chart.locator('[data-family=characters]');assert recent.get_attribute('data-median-ms')=='15500';assert '20 respuestas medidas' in recent.inner_text()
  assert page.locator('.accuracy-ring').count()>0;assert page.locator('#sessionEvolution .evolution-chart').count()==1
  for width in [1440,390]:
   page.set_viewport_size({'width':width,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   chart.screenshot(path=f'/tmp/presentation-speed-chart-{width}.png')
  chart.locator('summary').click();assert chart.locator('tbody tr').count()==5
  page.evaluate("__profiles.find(x=>x.id==='teen').progress.history=[]")
  page.locator('#profileSelect').select_option('junior');page.locator('#profileSelect').select_option('teen');page.locator('#navMenu [data-section=progress]').click();assert chart.is_hidden()
  page.evaluate("__profiles.find(x=>x.id==='teen').progress.history=[{subject:'speedReasoning',speedFamily:'pairs',level:1,speedRevision:4,correct:true,responseMs:1000,timingValid:false}]")
  page.locator('#profileSelect').select_option('junior');page.locator('#profileSelect').select_option('teen');page.locator('#navMenu [data-section=progress]').click();assert 'Todavía no hay respuestas con tiempos válidos' in chart.inner_text();assert chart.locator('.speed-timing-row').count()==0
  assert not errors,errors
  print('PASS: full-width reading on desktop/mobile, 3-stop map recall and scoring, exact medians/counts, level/format isolation, interrupted/practice exclusion, last-20 window, no false zero bar, empty states, preserved progress charts and mobile layout')
  browser.close()
finally:server.shutdown();server.server_close()

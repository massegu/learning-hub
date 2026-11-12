"""Unified dashboard, visible training icons, clean exercise flow, and progress."""
import importlib.util,threading,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT,area,workspace

spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
shots=Path('/tmp/lh-pr45-implementation');shots.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
  try:page.wait_for_selector('#homeAreaLanding:not(.hidden)')
  except Exception:
   print({'errors':errors,'auth':page.locator('#authGate').get_attribute('class'),'profile':page.locator('#profileGate').get_attribute('class'),'home':page.locator('#homeAreaLanding').get_attribute('class'),'body':page.locator('body').inner_text()[:1200]},flush=True);raise
  page.evaluate('''()=>{window.__current=null;const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return gate(it,...args)}}''')
  page.evaluate('''()=>{const p=__profiles.find(x=>x.id==='early');p.progress={...p.progress,totalAttempts:1,totalCorrect:1,history:[{subject:'memory',correct:true,ts:new Date().toISOString(),sessionId:'seeded-history'}]}}''')
  workspace(page).locator('#profileSelect').select_option('junior');workspace(page).locator('#profileSelect').select_option('early')
  assert 'Memoria' in page.locator('#homeProgressSummary').inner_text()
  assert 'Sin actividad reciente' not in page.locator('#homeProgressSummary').inner_text()
  for age in ['early','junior','primary','middle','teen']:
   workspace(page).locator('#profileSelect').select_option(age)
   assert page.locator('#homeAreaLanding').is_visible(),age
   assert page.locator('#homeProgressSummary').is_visible(),age
   assert not page.locator('#home .home-progress').evaluate('(e)=>e.open'),age
   assert page.locator('#homeProgressSummary>div').count()==3,age
   assert page.locator('#homeProgressSummary [data-progress-link]').count()==0,age
   summary_text=page.locator('#homeProgressSummary').inner_text()
   if age=='early':
    assert 'Memoria' in summary_text and 'respondida' in summary_text,age
   assert page.locator('#prepareSessionHomeBtn').is_visible(),age
   assert page.locator('#appShell').get_attribute('data-design')=='calma',age
   assert page.locator('#homeAreaLanding [data-redesign-area]').count()>0,age
   for width in [1280,768,390]:
    page.set_viewport_size({'width':width,'height':900})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(age,width)
    if width==390:page.screenshot(path=str(shots/f'dashboard-{age}-mobile.png'),full_page=True)
   page.set_viewport_size({'width':1440,'height':1000});page.screenshot(path=str(shots/f'dashboard-{age}.png'),full_page=True)
   workspace(page).locator('#navMenu [data-section="training"]').click()
   icons=page.locator('#homeLevels .level-row .area-illustration svg')
   assert icons.count()>0,age
   assert icons.evaluate_all('(els)=>els.every(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>=20&&r.height>=20&&s.visibility==="visible"&&s.display!=="none"})'),age
   for width,name in [(1440,'desktop'),(768,'tablet'),(390,'mobile')]:
    page.set_viewport_size({'width':width,'height':900})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(age,width,'training')
    if name in ['desktop','mobile']:page.screenshot(path=str(shots/f'training-{age}-{name}.png'),full_page=True)
   page.set_viewport_size({'width':1440,'height':1000});workspace(page).locator('#navMenu [data-section="home"]').click()
   page.locator('#homeAreaLanding [data-redesign-area="attention"]').click()
   page.wait_for_function('()=>document.querySelector("#exercise").classList.contains("active-section")&&document.querySelector("#exercise").dataset.subject==="attention"&&document.querySelector("#exercisePrompt").textContent.trim()!==""&&document.querySelector("#exercisePrompt").textContent!=="Cargando reto…"')
   assert page.evaluate('window.__current!==null'),page.locator('#exercisePrompt').inner_text()
   assert page.locator('#appShell').evaluate('(e)=>e.classList.contains("exercise-focus")'),age
   assert page.evaluate('scrollY<=1'),age
   assert page.locator('.sidebar').is_hidden() and page.locator('.topbar').is_hidden(),age
   assert page.locator('#exerciseReturnHome').is_visible(),age
   assert page.locator('#exerciseReturnHome').evaluate('(e)=>getComputedStyle(e).position==="static"'),age
   assert page.locator('#sharedActivityToggle,#sharedActivityBar,#sharedActivityExit').count()==0,age
   assert not page.locator('#activityOptions').evaluate('(e)=>e.open'),age
   assert page.locator('#exerciseHeading').evaluate('(e)=>document.activeElement===e'),age
   if age in ['early','primary','teen']:
    page.screenshot(path=str(shots/f'exercise-{age}.png'),full_page=True)
    page.set_viewport_size({'width':768,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),age
    page.screenshot(path=str(shots/f'exercise-{age}-tablet.png'),full_page=True)
    page.set_viewport_size({'width':1440,'height':1000})
   key=f'lh_v16_last_subject_{age}'
   assert page.evaluate('(key)=>localStorage.getItem(key)',key)=='attention',age
   if age=='teen':
    page.locator('#activityOptions > summary').click()
    assert page.locator('#activityOptions .activity-toolbar button:visible').count()>0
    assert page.locator('#exerciseLevelSelect').is_visible()
    page.locator('#activityOptions').evaluate('(e)=>e.open=false')
    page.locator('#exerciseOptions [data-answer]').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',page.evaluate('__current.a'))
    page.wait_for_function('()=>document.querySelector("#progressSaveStatus").textContent.includes("guardados")')
    page.locator('#exerciseReturnHome').click()
    workspace(page).locator('#navMenu [data-section="progress"]').click()
    page.wait_for_function('()=>document.querySelector("#sessionEvolution").querySelector("svg.evolution-chart")')
    assert page.locator('#sessionEvolution .progress-chart-data table tbody tr').count()>0
    page.locator('#sessionEvolution .progress-chart-data > summary').click()
    row=page.locator('#sessionEvolution .progress-chart-data table tbody tr').first.inner_text()
    assert '1' in row and '100%' in row,row
    page.screenshot(path=str(shots/'progress-evolution-teen.png'),full_page=True)
    page.locator('#navMenu [data-section="home"]').click()
   if page.locator('#exerciseReturnHome').is_visible():page.locator('#exerciseReturnHome').click()
   assert page.locator('#homeAreaLanding .redesign-continue button').inner_text().startswith('Volver a Atención'),age
  # Confirm profile-local last-area choice is not inherited from a different age profile.
  page.evaluate("localStorage.setItem('lh_v16_last_subject_primary','geometry')")
  workspace(page).locator('#profileSelect').select_option('primary')
  assert page.locator('#homeAreaLanding .redesign-continue button').inner_text().startswith('Volver a Geometría')
  assert page.locator('.mathematics-area-group [data-redesign-area="geometry"]').count()==1
  assert page.locator('.mathematics-area-group [data-redesign-area="division"]').count()==1
  workspace(page).locator('#profileSelect').select_option('early')
  area(page,'reading').click()
  phrase_mode=page.locator('#languageModeSwitch [data-mode="writing"]')
  assert phrase_mode.is_visible(),'6–7 años conserva Formar frases'
  page.evaluate('window.__current=null');request_count=page.evaluate('__requests.length')
  phrase_mode.click();page.wait_for_function('(count)=>__requests.length>count&&window.__current',arg=request_count)
  assert phrase_mode.get_attribute('aria-pressed')=='true'
  page.wait_for_function('()=>getComputedStyle(document.querySelector("#languageModeSwitch [data-mode=writing]")).backgroundColor==="rgb(76, 91, 221)"')
  phrase_style=phrase_mode.evaluate('''e=>{const matched=[];for(const sheet of document.styleSheets){try{for(const rule of sheet.cssRules){if(rule.selectorText){try{if(e.matches(rule.selectorText)&&(/background/.test(rule.style.cssText)))matched.push([rule.selectorText,rule.style.background,rule.style.getPropertyPriority('background')])}catch{}}}}catch{}}return {background:getComputedStyle(e).backgroundColor,accent:getComputedStyle(document.querySelector('#appShell')).getPropertyValue('--accent'),active:e.classList.contains('active'),pressed:e.getAttribute('aria-pressed'),matched}}''')
  assert phrase_style['background']=='rgb(76, 91, 221)',phrase_style
  page.screenshot(path=str(shots/'exercise-formar-frases-early.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  page.screenshot(path=str(shots/'exercise-formar-frases-early-mobile.png'),full_page=True)
  page.locator('#exerciseReturnHome').click();page.set_viewport_size({'width':1440,'height':1000})
  workspace(page).locator('#profileSelect').select_option('teen')
  area(page,'teenLanguage').click()
  selected=page.locator('#languageModeSwitch [data-mode="grammar"]')
  assert selected.get_attribute('aria-pressed')=='true'
  page.wait_for_function('()=>getComputedStyle(document.querySelector("#languageModeSwitch [data-mode=grammar]")).backgroundColor==="rgb(76, 91, 221)"')
  assert selected.evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(76, 91, 221)'
  page.screenshot(path=str(shots/'language-teen.png'),full_page=True)
  assert not errors,errors
  browser.close();print('PASS: five-age dashboard and training icons, compact non-duplicated summary, focused exercise flow with in-flow return and professional options, progress chart, profile-isolated continuation, and responsive widths')
finally:
 server.shutdown();server.server_close()

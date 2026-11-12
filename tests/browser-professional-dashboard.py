"""Unified professional dashboard, per-profile continuation, and presentation mode."""
import importlib.util,threading,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT,workspace

spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
shots=Path('/tmp/lh-pr45-implementation');shots.mkdir(parents=True,exist_ok=True)
try:
 with sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#homeAreaLanding:not(.hidden)')
  page.evaluate('''()=>{window.__current=null;const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return gate(it,...args)}}''')
  for age in ['early','junior','primary','middle','teen']:
   workspace(page).locator('#profileSelect').select_option(age)
   assert page.locator('#homeAreaLanding').is_visible(),age
   assert page.locator('#homeProgressSummary').is_visible(),age
   assert not page.locator('#home .home-progress').evaluate('(e)=>e.open'),age
   assert page.locator('#prepareSessionHomeBtn').is_visible(),age
   assert page.locator('#appShell').get_attribute('data-design')=='calma',age
   assert page.locator('#homeAreaLanding [data-redesign-area]').count()>0,age
   for width in [1280,768,390]:
    page.set_viewport_size({'width':width,'height':900})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(age,width)
    if width==390:page.screenshot(path=str(shots/f'dashboard-{age}-mobile.png'),full_page=True)
   page.set_viewport_size({'width':1440,'height':1000});page.screenshot(path=str(shots/f'dashboard-{age}.png'),full_page=True)
   page.locator('#homeAreaLanding [data-redesign-area="attention"]').click()
   page.wait_for_function('()=>document.querySelector("#exercise").classList.contains("active-section")&&document.querySelector("#exercise").dataset.subject==="attention"&&document.querySelector("#exercisePrompt").textContent.trim()!==""&&document.querySelector("#exercisePrompt").textContent!=="Cargando reto…"')
   assert page.evaluate('window.__current!==null'),page.locator('#exercisePrompt').inner_text()
   if age in ['early','primary','teen']:
    page.screenshot(path=str(shots/f'exercise-{age}.png'),full_page=True)
    page.set_viewport_size({'width':768,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),age
    page.screenshot(path=str(shots/f'exercise-{age}-tablet.png'),full_page=True)
    page.set_viewport_size({'width':1440,'height':1000})
   key=f'lh_v16_last_subject_{age}'
   assert page.evaluate('(key)=>localStorage.getItem(key)',key)=='attention',age
   if age=='teen':
    assert page.locator('#exerciseOptions button:visible').count()>0
    current=page.evaluate('__current.id');history=page.evaluate('(__profiles.find(p=>p.id==="teen").progress.history||[]).length')
    page.locator('#sharedActivityToggle').click()
    assert page.locator('#appShell').evaluate('(e)=>e.classList.contains("shared-activity")')
    assert page.locator('.sidebar').is_hidden() and page.locator('.topbar').is_hidden()
    assert page.locator('#sharedActivityExit').evaluate('(e)=>document.activeElement===e')
    page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    page.screenshot(path=str(shots/'shared-activity-teen-mobile.png'),full_page=True)
    page.keyboard.press('Escape')
    assert not page.locator('#appShell').evaluate('(e)=>e.classList.contains("shared-activity")')
    assert page.evaluate('__current.id')==current
    assert page.evaluate('(__profiles.find(p=>p.id==="teen").progress.history||[]).length')==history
    page.locator('#sharedActivityToggle').click();page.screenshot(path=str(shots/'shared-activity-teen.png'),full_page=True);page.locator('#sharedActivityExit').click()
    page.set_viewport_size({'width':1440,'height':1000})
   page.locator('#navMenu [data-section="home"]').click()
   assert page.locator('#homeAreaLanding .redesign-continue button').inner_text().startswith('Volver a Atención'),age
  # Confirm profile-local last-area choice is not inherited from a different age profile.
  page.evaluate("localStorage.setItem('lh_v16_last_subject_primary','geometry')")
  workspace(page).locator('#profileSelect').select_option('primary')
  assert page.locator('#homeAreaLanding .redesign-continue button').inner_text().startswith('Volver a Geometría')
  assert page.locator('.mathematics-area-group [data-redesign-area="geometry"]').count()==1
  assert page.locator('.mathematics-area-group [data-redesign-area="division"]').count()==1
  assert not errors,errors
  browser.close();print('PASS: unified dashboard across five ages, visible summary, profile-isolated last area, Geometry under Mathematics, responsive widths, and presentation mode preserves exercise/result state')
finally:
 server.shutdown();server.server_close()

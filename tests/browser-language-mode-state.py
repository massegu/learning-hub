"""Language mode selection and recovery notice remain correct across sessions."""
import importlib.util,os,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT,area,workspace

spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
  workspace(page).locator('#profileSelect').select_option('primary')
  recovered_id='00000000-0000-4000-8000-000000000001'
  page.evaluate('''id=>{
    const key='lh:result-outbox:v1:account:primary:'+id;
    localStorage.setItem(key,JSON.stringify({profile_id:'primary',client_attempt_id:id,occurred_at:'2026-11-10T00:00:00.000Z',session_id:'test-session',session_started_at:'2026-11-10T00:00:00.000Z',subject:'attention',level:1,correct:true,points:10,item_id:'test-item',detail:'choice',state:'uncertain',created_at:'2026-11-10T00:00:00.000Z',updated_at:'2026-11-10T00:00:00.000Z'}));
  }''',recovered_id)
  page.reload(wait_until='networkidle')
  page.wait_for_function("()=>document.querySelector('#pendingResultStatus').textContent.includes('Se recuperaron 1 resultado')")
  page.evaluate('''()=>{window.__current=null;const deliver=ActivityModel.forDelivery;ActivityModel.forDelivery=(item,...args)=>{window.__current=item;return deliver(item,...args)}}''')
  assert page.locator('#pendingResultStatus').is_visible()
  assert len(page.evaluate("Object.keys(JSON.parse(localStorage.getItem('__mock_exercise_results')||'{}'))"))==1
  assert len(page.evaluate("Object.keys(localStorage).filter(key=>key.startsWith('lh:result-outbox:v1:'))"))==0

  def check_modes():
   area(page,'language').click()
   buttons=page.locator('#languageModeSwitch .language-mode-btn[data-mode]')
   for mode in ['grammar','spelling','vocabulary']:
    page.evaluate('window.__current=null');before=page.evaluate('__requests.length')
    page.locator(f'#languageModeSwitch .language-mode-btn[data-mode="{mode}"]').click()
    page.wait_for_function('(count)=>__requests.length>count&&window.__current',arg=before)
    selected=buttons.evaluate_all('(buttons)=>buttons.filter(button=>button.getAttribute("aria-pressed")==="true").map(button=>button.dataset.mode)')
    active=buttons.evaluate_all('(buttons)=>buttons.filter(button=>button.classList.contains("active")).map(button=>button.dataset.mode)')
    assert selected==[mode],(mode,'aria-pressed',selected)
    assert active==[mode],(mode,'active',active)
    assert buttons.evaluate_all('(buttons)=>buttons.every(button=>(button.getAttribute("aria-pressed")==="true")==button.classList.contains("active"))'),mode

  check_modes()
  pending_id='00000000-0000-4000-8000-000000000002'
  pending_key='lh:result-outbox:v1:account:primary:'+pending_id
  page.evaluate('''id=>{
    localStorage.setItem('lh:result-outbox:v1:account:primary:'+id,JSON.stringify({profile_id:'primary',client_attempt_id:id,occurred_at:'2026-11-10T00:00:00.000Z',session_id:'test-session-2',session_started_at:'2026-11-10T00:00:00.000Z',subject:'language',level:1,correct:false,points:0,item_id:'pending-item',detail:'choice',state:'uncertain',created_at:'2026-11-10T00:01:00.000Z',updated_at:'2026-11-10T00:01:00.000Z'}));
  }''',pending_id)
  assert page.locator('#pendingResultStatus').inner_text().startswith('Se recuperaron')
  workspace(page).locator('#independentSessionBtn').click()
  assert page.locator('#independentSessionStatus').inner_text().startswith('Los resultados de esta sesión no se guardan')
  assert page.locator('#pendingResultStatus').is_hidden()
  assert page.locator('#pendingResultStatus').inner_text()==''
  assert page.evaluate('(key)=>localStorage.getItem(key)!==null',pending_key),'switching to independent mode must not delete a real pending outbox record'
  check_modes()
  page.once('dialog',lambda dialog:dialog.accept())
  workspace(page).locator('#independentSessionBtn').click()
  page.wait_for_function("()=>document.querySelector('#pendingResultStatus').textContent.includes('Se recuperaron 1 resultado')")
  assert page.evaluate('(key)=>localStorage.getItem(key)===null',pending_key),'the tracked profile must still recover its pending result after independent mode ends'
  assert len(page.evaluate("Object.keys(JSON.parse(localStorage.getItem('__mock_exercise_results')||'{}'))"))==2
  assert not errors,errors
  browser.close()
  print('PASS: grammar/spelling/vocabulary selection syncs active and aria-pressed in tracked and independent sessions; stale recovery notice clears without deleting pending results')
finally:
 server.shutdown();server.server_close()

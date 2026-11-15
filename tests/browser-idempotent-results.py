"""Real app with a local result-table mock: lost response and reload recovery."""
import importlib.util,threading,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT,area,workspace

spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect',state='attached');workspace(page).locator('#profileSelect').select_option('primary')
  page.evaluate('''()=>{const original=ActivityModel.forDelivery;ActivityModel.forDelivery=(item,...args)=>{window.__current=item;return original(item,...args)}}''')
  area(page,'attention').click();page.wait_for_function('()=>window.__current&&document.querySelectorAll("#exerciseOptions .option-btn").length')
  page.evaluate('window.__dropNextResultResponse=true')
  page.locator('#exerciseOptions .option-btn').first.click()
  page.wait_for_function('()=>document.querySelector("#progressSaveStatus").textContent.includes("confirmación se interrumpió")')
  attempt_id=page.evaluate('window.__current&&__profiles.find(p=>p.id==="primary").progress.history.at(-1).clientAttemptId')
  assert attempt_id and len(attempt_id)==36
  assert page.locator('#retryResultSave').is_visible()
  rows=page.evaluate("JSON.parse(localStorage.getItem('__mock_exercise_results')||'{}')")
  assert len(rows)==1 and next(iter(rows.values()))['client_attempt_id']==attempt_id, {'rows':rows,'attempt':attempt_id,'status':page.locator('#progressSaveStatus').inner_text(),'errors':errors}
  assert len(page.evaluate('Object.keys(localStorage).filter(k=>k.startsWith("lh:result-outbox:v1:"))'))==1
  page.reload(wait_until='networkidle');page.wait_for_function('()=>document.querySelector("#pendingResultStatus").textContent.includes("Se recuperaron 1 resultado")')
  rows=page.evaluate("JSON.parse(localStorage.getItem('__mock_exercise_results')||'{}')")
  assert len(rows)==1 and next(iter(rows.values()))['client_attempt_id']==attempt_id
  assert page.evaluate("Number(localStorage.getItem('__mock_exercise_result_calls'))")==2
  assert len(page.evaluate('Object.keys(localStorage).filter(k=>k.startsWith("lh:result-outbox:v1:"))'))==0
  assert not errors,errors;browser.close();print('PASS: browser saves a result, recovers a lost post-commit response after reload with the same attempt UUID, and leaves one row in the mock table')
finally:server.shutdown();server.server_close()

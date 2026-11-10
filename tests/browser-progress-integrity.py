"""Progress and idempotent result retries preserve the same client attempt."""
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
  page.evaluate('''()=>{window.__current=null;const original=ActivityModel.forDelivery;ActivityModel.forDelivery=(item,...args)=>{window.__current=item;return original(item,...args)}}''')
  area(page,'attention').click();page.wait_for_function('()=>window.__current&&document.querySelectorAll("#exerciseOptions .option-btn").length')
  page.evaluate('''()=>{window.__resultWrites=0;window.__attemptIds=[];LearningAPI.saveResult=async(_profile,row)=>{window.__resultWrites++;window.__attemptIds.push(row.clientAttemptId);if(window.__resultWrites===1){const error=new Error('ambiguous insert failure');error.state='uncertain';throw error;}return {state:'confirmed',clientAttemptId:row.clientAttemptId};};window.__saveProgress=LearningAPI.saveProgress;LearningAPI.saveProgress=async(...args)=>window.__saveProgress(...args)}''')
  page.locator('#exerciseOptions .option-btn').first.click();page.wait_for_function('()=>document.querySelector("#progressSaveStatus").textContent.includes("confirmación se interrumpió")')
  assert page.locator('#retryProgressSave').is_hidden();assert page.locator('#retryResultSave').is_visible();assert page.evaluate('__resultWrites')==1
  page.locator('#retryResultSave').click();page.wait_for_function('()=>window.__resultWrites===2');assert 'recuperaron 1 resultado' in page.locator('#progressSaveStatus').inner_text().lower(),page.locator('#progressSaveStatus').inner_text()
  assert page.evaluate('__resultWrites')==2;assert page.evaluate('__attemptIds[0]===__attemptIds[1]');assert page.locator('#retryResultSave').is_hidden()
  page.locator('#exerciseNext').click();page.wait_for_function('()=>window.__current&&document.querySelectorAll("#exerciseOptions .option-btn").length')
  page.evaluate('''()=>{window.__resultWrites=0;window.__progressWrites=0;LearningAPI.saveResult=async(_profile,row)=>{window.__resultWrites++;window.__lastAttemptId=row.clientAttemptId;return {state:'confirmed',clientAttemptId:row.clientAttemptId}};LearningAPI.saveProgress=async(...args)=>{window.__progressWrites++;if(window.__progressWrites===1)throw new Error('temporary progress failure');return window.__saveProgress(...args)}}''')
  page.locator('#exerciseOptions .option-btn').first.click();page.wait_for_function('()=>document.querySelector("#progressSaveStatus").textContent.includes("El resultado se guardó")')
  assert page.locator('#retryProgressSave').is_visible();assert page.evaluate('__resultWrites')==1
  page.locator('#retryProgressSave').click();page.wait_for_function('()=>document.querySelector("#progressSaveStatus").textContent.includes("Progreso guardado")')
  assert page.evaluate('__resultWrites')==1;assert page.evaluate('__progressWrites')==2;assert page.locator('#retryProgressSave').is_hidden()
  assert page.evaluate('(()=>{const p=__profiles.find(x=>x.id==="primary").progress;return p.totalAttempts===2&&p.history.length===2})()')
  assert not errors,errors;browser.close();print('PASS: uncertain result retries with same client attempt ID; partial progress failure exposes progress-only recovery; completed result is not duplicated')
finally:server.shutdown();server.server_close()

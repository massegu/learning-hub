"""Partial save failures are communicated accurately and only progress is retried."""
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
  page.evaluate('''()=>{window.__resultWrites=0;const save=LearningAPI.saveResult;LearningAPI.saveResult=async(...args)=>{window.__resultWrites++;throw new Error('ambiguous insert failure')};window.__saveProgress=LearningAPI.saveProgress;LearningAPI.saveProgress=async(...args)=>window.__saveProgress(...args)}''')
  page.locator('#exerciseOptions .option-btn').first.click();page.wait_for_function('()=>document.querySelector("#progressSaveStatus").textContent.includes("no se pudo confirmar el resultado")')
  assert page.locator('#retryProgressSave').is_hidden();assert page.evaluate('__resultWrites')==1
  page.locator('#exerciseNext').click();page.wait_for_function('()=>window.__current&&document.querySelectorAll("#exerciseOptions .option-btn").length')
  page.evaluate('''()=>{window.__resultWrites=0;window.__progressWrites=0;LearningAPI.saveResult=async()=>{window.__resultWrites++;return true};LearningAPI.saveProgress=async(...args)=>{window.__progressWrites++;if(window.__progressWrites===1)throw new Error('temporary progress failure');return window.__saveProgress(...args)}}''')
  page.locator('#exerciseOptions .option-btn').first.click();page.wait_for_function('()=>document.querySelector("#progressSaveStatus").textContent.includes("El resultado se guardó")')
  assert page.locator('#retryProgressSave').is_visible();assert page.evaluate('__resultWrites')==1
  page.locator('#retryProgressSave').click();page.wait_for_function('()=>document.querySelector("#progressSaveStatus").textContent.includes("Progreso guardado")')
  assert page.evaluate('__resultWrites')==1;assert page.evaluate('__progressWrites')==2;assert page.locator('#retryProgressSave').is_hidden()
  assert page.evaluate('(()=>{const p=__profiles.find(x=>x.id==="primary").progress;return p.totalAttempts===2&&p.history.length===2})()')
  assert not errors,errors;browser.close();print('PASS: ambiguous result errors are not retried; partial progress failure exposes progress-only recovery; completed result is not duplicated')
finally:server.shutdown();server.server_close()

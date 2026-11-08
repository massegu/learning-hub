"""The Continue training action resumes the last area for the selected profile."""
import importlib.util,threading,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT,area,workspace

spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900});page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect',state='attached')
  workspace(page).locator('#profileSelect').select_option('teen');page.evaluate('''()=>{window.__attentionLoads=0;const original=LearningAPI.requestContent;LearningAPI.requestContent=async payload=>{const result=await original(payload);if(payload.domain==='attention')window.__attentionLoads++;return result}}''');area(page,'attention').click();page.wait_for_function("()=>window.__attentionLoads===1&&document.querySelector('#exercise').classList.contains('active-section')")
  page.locator('#navMenu [data-section="home"]').click();page.wait_for_function("()=>document.querySelector('#heroStartBtn').textContent.includes('Continuar')");page.locator('#heroStartBtn').click();page.wait_for_function("()=>window.__attentionLoads===2&&document.querySelector('#exercise').classList.contains('active-section')&&document.querySelector('#exercise').dataset.subject==='attention'")
  state=page.evaluate("()=>({subject:document.querySelector('#exercise').dataset.subject,active:document.querySelector('#exercise').classList.contains('active-section'),saved:localStorage.getItem('lh_v16_last_subject_teen'),target:[...document.querySelectorAll('[data-home-area],[data-school-area],[data-early-area]')].filter(e=>e.dataset.homeArea==='attention'||e.dataset.schoolArea==='attention'||e.dataset.earlyArea==='attention').length})")
  assert state['active'] and state['subject']=='attention',state
  browser.close();print('PASS: teen profile returns to Atención via Inicio → Continuar entrenamiento')
finally:server.shutdown();server.server_close()

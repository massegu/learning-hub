"""Browser integration for functional communication and optional reading aids."""
import importlib.util,os,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT,area,workspace
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1360,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');workspace(page).locator('#profileSelect').select_option('middle')
  page.evaluate('''()=>{window.__current=null;const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(item,...args)=>{const result=gate(item,...args);window.__current=item;return result}}''')
  area(page,'communication').click();page.wait_for_function('()=>__current?.domain==="communication"&&document.querySelector("#exercisePrompt").textContent===__current.q')
  item=page.evaluate('__current');assert item['mechanic'].startswith('communication_');assert page.locator('#exerciseVisual').inner_text().strip();assert page.locator('#exerciseOptions .option-btn').count()==3
  page.locator('#exerciseOptions .option-btn').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',item['a']);assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  page.evaluate('''()=>{const fixture=FunctionalContent.pool('middle','literacy',1).find(it=>it.stimulus?.some(block=>block.type==='text'));window.__fixture=structuredClone(fixture);LearningAPI.requestContent=async()=>({items:[structuredClone(__fixture)],usage:{used:3,limit:500}});window.__current=null}''')
  area(page,'literacy').click();page.wait_for_selector('.reader-assist');assert page.locator('.reading-passage').count()==1
  passage=page.locator('.reading-passage');assert passage.evaluate('(e)=>getComputedStyle(e).getPropertyValue("--reader-scale").trim()')=='1'
  page.locator('.reader-assist [data-action=larger]').click();assert passage.evaluate('(e)=>getComputedStyle(e).getPropertyValue("--reader-scale").trim()')=='1.1'
  for action in ['spacing','warm','font']:page.locator(f'.reader-assist [data-action={action}]').click()
  assert page.locator('.reading-passage').evaluate('(e)=>e.classList.contains("reader-wide-spacing")&&e.classList.contains("reader-warm")&&e.classList.contains("reader-clear-font")')
  state=page.evaluate('JSON.parse(localStorage.getItem("lh_reader_assist_v1"))');assert state=={'scale':1.1,'spacing':True,'warm':True,'font':True}
  page.evaluate('''()=>{window.SpeechSynthesisUtterance=function(text){this.text=text};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},speak(x){window.__spoken=x.text}}})}''')
  page.locator('.reader-assist [data-action=speak]').click();assert page.evaluate('__spoken.length>0')
  area(page,'communication').click();page.wait_for_function('()=>document.querySelectorAll(".reader-assist").length===0')
  assert not errors,errors;browser.close();print('PASS: comunicación funcional entrega opciones y respuesta correctas; las ayudas de lectura modifican el texto, guardan preferencias localmente y leen solo al activarlas')
finally:server.shutdown();server.server_close()

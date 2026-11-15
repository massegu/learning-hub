"""Browser regressions for exact-age word prompts and teen typography comparisons."""
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
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');workspace(page).locator('#profileSelect').select_option('junior')
  page.wait_for_function('()=>[...document.querySelector("#newProfileAge").options].length===5')
  page.evaluate("()=>{const select=document.querySelector('#newProfileAge');select.value='junior';select.dispatchEvent(new Event('change',{bubbles:true}))}");assert page.locator('#newProfileExactAge').locator('option').all_text_contents()==['Selecciona la edad','8 años','9 años','10 años']
  saved=page.evaluate('''async()=>{const profile=await LearningAPI.createProfile('P-AGE','junior',1,'es_intl',9);return {age:profile.progress.ageYears,route:profile.progress.ageRoute,stored:__profiles.find(p=>p.id===profile.id).progress.ageYears}}''');assert saved=={'age':9,'route':'junior','stored':9}
  page.evaluate('''()=>{window.__current=null;const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(item,...args)=>{const result=gate(item,...args);window.__current=item;return result};window.__fixture=Curriculum.pool('junior','speedReasoning',1,9).find(item=>item.speedFamily==='wordProduction');LearningAPI.requestContent=async()=>({items:[structuredClone(__fixture)],usage:{used:3,limit:500}})}''')
  area(page,'speedReasoning').click();page.wait_for_function('()=>__current?.speedFamily==="wordProduction"');assert page.locator('#textAnswerArea').is_visible();assert 'dos pistas' in page.locator('#exerciseVisual').inner_text();condition=page.evaluate('__current.speedEvidence.condition');assert condition in page.locator('#exercisePrompt').inner_text()
  page.locator('#textAnswerInput').fill('gato');page.locator('#textAnswerCheck').click();assert page.locator('#modelAnswer').inner_text()==page.evaluate('__current.sample')
  assert page.evaluate('''()=>{try{ActivityModel.printable(__current,{age_band:'primary',progress:{ageRoute:'junior',ageYears:9}});return false}catch(e){return /solo en pantalla/.test(e.message)}}''')
  page.evaluate('''()=>{window.__fixture=Curriculum.pool('middle','speedReasoning',1).find(item=>item.speedFamily==='typographyCompare');window.__current=null;LearningAPI.requestContent=async()=>({items:[structuredClone(__fixture)],usage:{used:4,limit:500}})}''')
  area(page,'speedReasoning').click();page.wait_for_function('()=>__current?.speedFamily==="typographyCompare"');page.locator('#startSpeedTrial').click();assert page.locator('.typography-compare .graffiti-word').is_visible();assert page.locator('.typography-compare .print-word').is_visible();assert page.locator('.speed-choice').count()==2
  answer=page.evaluate('__current.a');page.locator('.speed-choice').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',answer);assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  assert page.evaluate('''()=>{try{ActivityModel.printable(__current,{age_band:'middle',progress:{ageRoute:'middle'}});return false}catch(e){return /solo en pantalla/.test(e.message)}}''')
  assert not errors,errors;browser.close();print('PASS: edad exacta se guarda en el perfil; a los 9 años aparece la palabra con dos pistas; la comparación tipográfica solo en pantalla funciona para 13+ y queda fuera de fichas')
finally:server.shutdown();server.server_close()

"""Real content handler; audio-device boundary mocked to test timing and lifecycle."""
import importlib.util,threading,json,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
fixtures=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./js/curriculum').interactivePool('primary','executive',3).filter(x=>x.interactionTask.kind==='auditory').slice(0,2)))"],cwd=ROOT,text=True));chosen={}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.add_init_script('''window.__spoken=[];window.__tones=[];window.__audioClosed=0;
   window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'es-ES'}],speak:u=>{window.__spoken.push(u.text);window.__voice=u;setTimeout(()=>u.onend?.(),200)},cancel:()=>{if(window.__voice)window.__voice.onend=null}}});
   window.AudioContext=class{state='running';currentTime=0;destination={};resume(){return Promise.resolve()}close(){window.__audioClosed++;this.state='closed';return Promise.resolve()}createOscillator(){return {frequency:{set value(v){window.__tones.push(v)}},connect(){},start(){},stop(){}}}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){}}}};''')
  def override(route):
   response=route.fetch();body=route.request.post_data_json
   if chosen and body.get('interaction_kind')=='auditory':
    data=response.json();data['data']['items']=[chosen.copy()];route.fulfill(response=response,json=data)
   else:route.fulfill(response=response)
  page.route('**/__review/content',override)
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
  page.evaluate('''()=>{const fn=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return fn(it,...args)}}''')
  for age in ['early','junior','primary','middle','teen']:
   page.locator('#profileSelect').select_option(age);assert page.locator('#navMenu [data-subject=social]').is_visible();page.locator('#navMenu [data-subject=social]').click();page.wait_for_selector('#exerciseOptions .option-btn');assert page.locator('#exercisePrompt').inner_text()
   assert not page.locator('#navMenu [data-subject=social]').evaluate('e=>e.hidden')
   page.locator('#exerciseOptions [data-answer]').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',page.evaluate('__current.a'));assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  page.locator('#profileSelect').select_option('primary');page.locator('#navMenu [data-section=home]').click();assert 'learning-areas-3d.png' in page.locator('[data-school-area=social] .area-illustration').evaluate('e=>getComputedStyle(e).backgroundImage');page.locator('#schoolHub').screenshot(path='/tmp/new-area-icons.png')
  page.clock.install();page.clock.pause_at(page.evaluate('Date.now()+1000'));page.add_style_tag(content='*,*::before,*::after{transition:none!important;scroll-behavior:auto!important}')
  page.locator('#navMenu [data-subject=executive]').click();page.locator('#interactionModeBtn').click();page.wait_for_selector('#startInteractive');page.locator('#exerciseLevelSelect').select_option('3');page.wait_for_function('()=>__current?.interactionTask?.level===3')
  baseline=page.evaluate('(__profiles.find(p=>p.id==="primary").progress.history||[]).length')
  for fixture in fixtures:
   chosen.clear();chosen.update(fixture)
   if page.locator('[data-interaction-kind=auditory][aria-pressed=true]').count():page.locator('[data-interaction-kind=movement]').click();page.wait_for_selector('#startInteractive')
   page.locator('[data-interaction-kind=auditory]').click();page.wait_for_selector('#startListening');assert page.locator('#startListening').is_disabled()
   t=fixture['interactionTask'];mode=t['audioMode'];before=page.evaluate('__spoken.length+__tones.length');page.clock.run_for(5000);assert page.evaluate('__spoken.length+__tones.length')==before
   page.locator('.sample-cue').first.click();page.clock.run_for(2000);assert not page.locator('#startListening').is_disabled()
   assert page.locator('#listeningStatus').inner_text().startswith('Señal reproducida')
   for width in [1440,390]:
    page.set_viewport_size({'width':width,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.locator('#exercise').screenshot(path=f'/tmp/listening-{mode}-{width}.png')
   page.locator('#startListening').click()
   for n,index in enumerate(t['trials']):
    assert page.locator('#listeningActed').is_disabled();visible=page.locator('#exerciseVisual').inner_text();assert t['rules'][index]['label'] not in visible
    count_before=page.evaluate('__spoken.length+__tones.length');page.clock.run_for(t['delays'][n]-1);assert page.evaluate('__spoken.length+__tones.length')==count_before
    page.clock.run_for(2500);assert not page.locator('#listeningActed').is_disabled()
    if mode=='words':assert page.evaluate('__spoken.at(-1)')==t['rules'][index]['label'],(n,index,t['rules'][index],page.evaluate('({spoken:__spoken,current:__current?.interactionTask})'))
    else:assert page.evaluate('__tones.at(-1)')==t['signals'][index]['frequency']
    page.locator('#listeningActed').click();page.locator('#nextListening').click()
   assert 'no modifica' in page.locator('#exerciseFeedback').inner_text()
  assert page.evaluate('(__profiles.find(p=>p.id==="primary").progress.history||[]).length')==baseline
  records=page.evaluate('__profiles.find(p=>p.id==="primary").progress.interactiveObservations');assert len([r for r in records if r['kind']=='auditory'])==2
  page.locator('[data-interaction-kind=movement]').click();page.wait_for_selector('#startInteractive');page.locator('[data-interaction-kind=auditory]').click();page.wait_for_selector('#startListening')
  page.locator('.sample-cue').first.click();page.clock.run_for(2000);page.locator('#startListening').click();before=page.evaluate('__spoken.length+__tones.length')
  page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false})")
  page.clock.run_for(5000);assert page.locator('#restartInteraction').is_visible();assert page.evaluate('__spoken.length+__tones.length')==before
  page.locator('#restartInteraction').click();assert page.locator('#startListening').is_disabled()
  # Device failure remains retryable and unscored, including a rejected resume promise.
  page.evaluate('()=>{AudioContext.prototype.resume=function(){return Promise.reject(new Error("audio unavailable"))}}')
  page.locator('.sample-cue').first.click();page.wait_for_function('()=>document.querySelector("#listeningStatus").textContent.includes("No se ha podido")');assert page.locator('#startListening').is_disabled()
  page.evaluate('()=>{AudioContext.prototype.resume=function(){return Promise.resolve()}}');page.locator('.sample-cue').first.click();page.clock.run_for(2000);page.locator('#startListening').click()
  page.evaluate('()=>{AudioContext.prototype.resume=function(){return Promise.reject(new Error("audio unavailable"))}}');page.clock.run_for(5000);page.wait_for_selector('#retryListening:not(.hidden)');assert page.locator('#listeningActed').is_disabled()
  for _ in chosen['interactionTask']['trials']:
   page.locator('#skipListeningAudio').click();page.locator('#nextListening').click()
  latest=page.evaluate('__profiles.find(p=>p.id==="primary").progress.interactiveObservations.at(-1)');assert all(r['report']=='audio_unavailable' for r in latest['report']['trials'])
  assert page.evaluate('(__profiles.find(p=>p.id==="primary").progress.history||[]).length')==baseline
  assert not errors,errors;browser.close();print('PASS: Social Lab delivery and scoring in 5 ages; explicit audio start, spoken/tonal cue timing, no visual answer cue, unscored observation, interruption cleanup, audio-error recovery/omission and mobile layout')
finally:server.shutdown();server.server_close()

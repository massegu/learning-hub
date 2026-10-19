"""Focused follow-up: real app/handler, fake accounts, no production service calls."""
import importlib.util,threading,tempfile,zipfile,re
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT,doc_text
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900},device_scale_factor=1);errors=[];external=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if r.url.startswith('https://') else None)
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#earlyContinue');page.wait_for_timeout(1500)
  page.evaluate('''()=>{const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{const result=gate(it,...args);window.__current=it;return result;};
    const adapt=EarlyContent.adaptResponse;EarlyContent.adaptResponse=(...args)=>{const r=adapt(...args);if(window.__forceAttention&&args[1].domain==='attention'){r.items[0]=EarlyContent.pool('attention',1).find(x=>x.stimulus.some(b=>b.presentation==='model')&&x.stimulus.some(b=>b.type==='table'));window.__forceAttention=false;}return r;};
  }''');page.clock.install()
  def current():
   page.wait_for_function('()=>window.__current&&[__current.q,__current.memoryQuestion].includes(document.querySelector("#exercisePrompt").textContent)');return page.evaluate('__current')
  def open_area(domain):
   page.evaluate('window.__current=null');page.locator(f'#navMenu [data-subject="{domain}"]').click();return current()
  def shot(name):
   for width in [1280,390]:
    page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),name
    page.locator('#exercise').screenshot(path=f'/tmp/followup-{name}-{width}.png')
   page.set_viewport_size({'width':1280,'height':900})
  def answer(it):
   if it.get('speedTask'):
    page.locator('#startSpeedTrial').click();page.clock.fast_forward(800)
    page.locator('#exerciseOptions [data-answer]').filter(has_text=it['a']).first.click()
   elif it.get('recallSequence'):
    page.locator('#startMemorySequence').click();page.clock.run_for(len(it['recallSequence'])*(it['sequenceStepMs']+250)+50)
    for tok in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=tok,exact=True).click()
    page.locator('#orderCheck').click()
   elif it['type']=='memoryReveal':
    page.clock.fast_forward(it['revealMs']+50);page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   elif it['type']=='order':
    for tok in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=tok,exact=True).click()
    page.locator('#orderCheck').click()
   else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   page.wait_for_selector('#exerciseNext:not(.hidden)')
  for width in [1920,1440,1280,1024,768,390]:
   page.set_viewport_size({'width':width,'height':900});assert page.locator('[data-early-area]').count()==7
   assert page.locator('[data-early-mission]').count()==4;assert page.locator('.discovery-trail li').count()==3
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert page.locator('[data-early-area]').evaluate_all('(els)=>els.every(e=>e.getBoundingClientRect().height>=44)')
   if width in [1280,390]:page.locator('#earlyHub').screenshot(path=f'/tmp/followup-hub-{width}.png')
  page.set_viewport_size({'width':1280,'height':900})
  for domain in ['language','reading','division','attention','executive','memory','speedReasoning']:
   it=open_area(domain);shot(domain);answer(it)
  page.locator('#earlyHomeBtn').click();assert page.locator('.discovery-trail li.discovered').count()>=1
  page.locator('[data-early-mission=stories]').click();it=current();answer(it)
  page.locator('#cancelGuidedSession').click();assert '1 de 2' in page.locator('.mission-resume').inner_text()
  page.reload(wait_until='networkidle');page.wait_for_selector('#earlyContinue');page.clock.resume();page.wait_for_timeout(500)
  page.evaluate('''()=>{const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return gate(it,...args)}}''')
  page.locator('#earlyContinue').click();it=current();assert 'Actividad 2 de 2' in page.locator('#guidedSessionProgress').inner_text();answer(it);page.locator('#exerciseNext').click()
  assert page.locator('.discovery-trail li.discovered').count()>=2
  # Force a native simple perceptual comparison only after a real authorized reply.
  page.evaluate('''()=>{const adapt=EarlyContent.adaptResponse;EarlyContent.adaptResponse=(...args)=>{const r=adapt(...args);if(args[1].domain==='attention'&&ContentPolicy.forProfile(args[2]))r.items[0]=EarlyContent.pool('attention',1).find(x=>x.stimulus.some(b=>b.presentation==='model')&&x.stimulus.some(b=>b.type==='table'));return r;}}''')
  it=open_area('attention');assert page.locator('.early-model').count()==1;assert page.locator('.early-comparison tr').count()>=2;shot('attention-model')
  # The exporter boundary receives a late-corrupted candidate after selection.
  page.evaluate('''()=>{const generate=WorksheetGenerator.generate;window.__lateReplacement=0;WorksheetGenerator.generate=async(versions,p,context)=>{
    const copy=structuredClone(versions);copy.forEach(v=>v[0]={...v[0],stimulus:[]});
    const fetch=context.fetchMore;context={...context,fetchMore:async(...a)=>{__lateReplacement++;return fetch(...a);}};
    return generate(copy,p,context);
  };}''')
  page.locator('#navMenu [data-section=homework]').click();page.locator('#worksheetNone').click()
  for domain in ['language','division','attention','memory']:page.locator(f'#homeworkOptions input[value="{domain}"]').check()
  page.locator('#worksheetQuestions').select_option('10');exports=0
  for country in ['es_es','es_mx','es_co','es_ar','es_cl','es_pa','es_cr']:
   page.locator('#v16ContentLocale').select_option(country);page.wait_for_function('(c)=>LearningAPI.contentLocale===c',arg=country)
   versions=1 if country=='es_es' else 2;page.locator('#worksheetCount').select_option(str(versions))
   with page.expect_download(timeout=60000) as dl:page.locator('#generateWorksheetsBtn').click()
   path=Path(tmp)/(country+('.docx' if versions==1 else '.zip'));dl.value.save_as(path)
   docs=[path.read_bytes()] if versions==1 else [zipfile.ZipFile(path).read(n) for n in zipfile.ZipFile(path).namelist()]
   assert len(docs)==versions
   for data in docs:
    nodes=doc_text(data);assert len([x for x in nodes if re.fullmatch('ACTIVIDAD [0-9]+',x)])==10
    assert not any('undefined' in x for x in nodes)
   exports+=len(docs)
  assert page.evaluate('__lateReplacement')==exports
  # Older routes stay mature, and legacy comparisons preserve complete source data.
  page.locator('#profileSelect').select_option('middle');assert page.locator('#earlyHub').is_hidden();assert page.locator('.discovery-trail').count()==0 or page.locator('.discovery-trail').is_hidden()
  page.evaluate('''()=>{const old=LearningAPI.requestContent;LearningAPI.requestContent=async p=>{const r=await old(p);if(p.domain==='attention')r.items=[{type:'standard',requiresStimulus:true,q:'¿Qué opción coincide con el modelo?',scenario:'MODELO: E14-O6 A: E14-O6 B: E14O6 C: E14-O8 D: F14-O6',opts:['A','B','C','D'],a:'A'}];return r;}}''')
  it=open_area('attention');shot('older-attention');assert page.locator('.attention-model').count()==1;assert page.locator('.attention-comparison tr').count()==4,page.locator('#exerciseVisual').inner_html()
  assert not errors,errors;assert not external,external
  print(f'PASS: seven visible early areas, four missions, real completion/resume, six widths at 100% zoom, pictograms/model layout, {exports} real DOCX in seven countries with late-invalid replacement, older dashboard/comparison, no external requests/errors')
  browser.close()
finally:server.shutdown();server.server_close()

"""Real app and Edge handler: fusion, new sources, recall, timing and DOCX; fake account only."""
import importlib.util,threading,tempfile,zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT,doc_text
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');preview=importlib.util.module_from_spec(spec);spec.loader.exec_module(preview)
server=preview.ReviewServer(('127.0.0.1',0),preview.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':900});errors=[];external=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if r.url.startswith('https://') else None)
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#v16ContentLocale');page.wait_for_timeout(1500)
  page.evaluate('''()=>{const original=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return original(it,...args)}}''');page.clock.install();answered=0;exports=0
  def current():
   page.wait_for_function('()=>window.__current&&[__current.q,__current.memoryQuestion].includes(document.querySelector("#exercisePrompt").textContent)')
   return page.evaluate('__current')
  def next_item():
   page.evaluate('window.__current=null');page.locator('#exerciseNext').click();return current()
  def open_area(domain,level=None):
   page.evaluate('window.__current=null');page.locator(f'#navMenu [data-subject="{domain}"]').click();it=current()
   if level is not None and it['level']!=level:
    page.evaluate('window.__current=null');page.locator('#exerciseLevelSelect').select_option(str(level));it=current()
   return it
  def answer(it,invalid_time=False,practice=False,wrong=False):
   global answered
   if it['type']=='multiSelect':
    selected=it['answers'][:-1] if wrong else it['answers']
    for label in selected:page.locator('#exerciseOptions .multi-option').get_by_text(label,exact=True).click()
    if not selected:page.locator('#exerciseOptions .multi-option').first.click()
    page.locator('#multiCheck').click()
   elif it.get('speedTask'):
    assert page.locator('#exerciseOptions .speed-choice').count()==0
    assert page.locator('#exerciseVisual table').count()==0
    if not invalid_time and not practice and not wrong:page.set_viewport_size({'width':390,'height':900})
    page.locator('#practiceSpeedTrial' if practice else '#startSpeedTrial').click();page.clock.fast_forward(850)
    if not invalid_time and not practice and not wrong:
     # A trial actually started on a phone must show source and response together.
     assert page.locator('#exerciseOptions').evaluate('(el)=>el.getBoundingClientRect().bottom<=innerHeight'),age
     assert page.locator('#exercisePrompt').evaluate('(el)=>el.getBoundingClientRect().top>=0'),age
     screenshot(f'{age}-speed-active-L{it["level"]}')
    if invalid_time:page.evaluate('window.dispatchEvent(new Event("blur"))')
    target=next(o for o in it['opts'] if o!=it['a']) if wrong else it['a']
    buttons=page.locator('#exerciseOptions .speed-choice');labels=buttons.evaluate_all('(els)=>els.map(e=>e.dataset.answer)')
    page.keyboard.press(str(labels.index(target)+1))
   elif it.get('recallSequence'):
    assert page.locator('#startMemorySequence').is_visible();page.locator('#startMemorySequence').click()
    assert page.locator('#exerciseOptions .word-token').count()==0
    page.clock.run_for(len(it['recallSequence'])*(it['sequenceStepMs']+250)+50)
    assert page.locator('#exerciseVisual').inner_text()==''
    for tok in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=tok,exact=True).click()
    page.locator('#orderCheck').click()
   elif it.get('type')=='memoryReveal':
    if it.get('memoryResponse') in ['spatial','spatialPair']:
     assert page.locator('#exerciseVisual .recall-grid [role=cell]').count()==it['gridSize']**2
    page.clock.fast_forward(it['revealMs']+50);assert page.locator('#exerciseVisual').inner_text()==''
    if it.get('memoryResponse')=='spatial':
     positions=page.locator('#exerciseOptions .spatial-answer-grid button').evaluate_all('(els)=>els.map(e=>e.dataset.answer)')
     expected=[f'Fila {r+1}, columna {c+1}' for r in range(it['gridSize']) for c in range(it['gridSize'])]
     assert positions==expected,(positions,expected)
     screenshot(f'{age}-spatial-response-L{it["level"]}')
    if it.get('memoryResponse')=='order':
     for tok in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=tok,exact=True).click()
     page.locator('#orderCheck').click()
    elif it.get('memoryResponse')=='multiple':
     for label in it['answers']:page.locator('#exerciseOptions').get_by_role('button',name=label,exact=True).click()
     page.locator('#multiCheck').click()
    else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   elif it.get('type')=='order':
    for tok in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=tok,exact=True).click()
    page.locator('#orderCheck').click()
   elif it.get('type')=='self':
    assert page.locator('#writingCriteria li').count()==len(it['writingRubric']);assert it.get('writingPurpose') or '«' in it['sample'];
    page.locator('#textAnswerInput').fill(it['sample']);page.locator('#textAnswerCheck').click();page.locator('[data-self="true"]').click()
   else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
   page.wait_for_function('()=>!document.querySelector("#exerciseNext").classList.contains("hidden")');answered+=1
   if not wrong:assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class'),it
   if it.get('speedTask'):
    saved=page.evaluate('()=>__profiles.find(p=>p.id===document.querySelector("#profileSelect").value).progress.history.at(-1)')
    assert saved['timingValid']==(not invalid_time and not practice),saved
    if practice:assert saved['responseMs'] is None
    else:assert saved['responseMs']>=850
    if invalid_time:assert 'excluido' in page.locator('#exerciseFeedback').inner_text()
  def screenshot(name):
   for width in [1280,390]:
    page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),name
    page.locator('#exercise').screenshot(path=f'/tmp/curriculum-{name}-{width}.png')
   page.set_viewport_size({'width':1280,'height':900})
  for age in ['early','junior','primary','middle','teen']:
   workspace(page).locator('#profileSelect').select_option(age);workspace(page).locator('#v16ContentLocale').select_option('es_mx');page.wait_for_function('()=>LearningAPI.contentLocale==="es_mx"')
   assert page.locator('#navMenu [data-subject="applied"]').count()==0
   assert page.locator('#homeworkOptions input[value="applied"]').count()==0
   assert page.locator('#navMenu [data-subject="speedReasoning"]').inner_text().find('Velocidad de procesamiento')>=0
   if age in ['primary','middle']:assert page.locator('#navMenu [data-subject="reading"],#navMenu [data-subject="middleReading"]').count()==0
   domain='reading' if age in ['early','junior'] else 'literacy';it=open_area(domain);passages=[]
   for n in range(10):
    passages.append(it['passageKey']);answer(it)
    if n<9:it=next_item()
   assert len(set(passages))>=10,(age,passages)
   captured=[]
   for level in [1,3]:
    it=open_area('memory',level);families=set()
    for attempt in range(15):
     if it['mechanic'] not in families:
      if it['level']!=level:
       page.evaluate('window.__current=null');page.locator('#exerciseLevelSelect').select_option(str(level));it=current()
      families.add(it['mechanic']);captured.append(it)
      if it.get('memoryResponse') in ['spatial','spatialPair']:screenshot(f'{age}-spatial-L{level}')
     answer(it)
     if len(families)==3:break
     it=next_item()
    assert len(families)==3,(age,level,families)
   for level in [1,3]:
    it=open_area('speedReasoning',level);screenshot(f'{age}-speed-L{level}');captured.append(it);answer(it)
    it=next_item();answer(it,invalid_time=True)
    it=next_item();answer(it,practice=True)
    it=next_item();answer(it,wrong=True)
   it=open_area('executive',3);seen=set()
   for n in range(12):
    seen.add(it['mechanic']);captured.append(it);answer(it)
    if len(seen)>= (2 if age=='early' else 4):break
    it=next_item()
   assert len(seen)>1
   # Exercise the actual worksheet button with only visible areas.
   page.locator('#navMenu [data-section="homework"]').click();page.locator('#worksheetNone').click()
   for d in [domain,'executive','memory','speedReasoning']:page.locator(f'#homeworkOptions input[value="{d}"]').check()
   page.locator('#worksheetCount').select_option('1');page.locator('#worksheetQuestions').select_option('12')
   with page.expect_download(timeout=45000) as dl:page.locator('#generateWorksheetsBtn').click()
   path=Path(tmp)/f'{age}-mixed.docx';dl.value.save_as(path);assert len(doc_text(path.read_bytes()))>50;exports+=1
   # A second targeted DOCX proves the new recall and speed instructions and every coordinate survive.
   page.evaluate('(items)=>window.__exportItems=items',captured)
   with page.expect_download() as dl:page.evaluate('(age)=>WorksheetGenerator.generate([__exportItems],__profiles.find(p=>p.id===age))',age)
   path=Path(tmp)/f'{age}-new.docx';dl.value.save_as(path);nodes=doc_text(path.read_bytes());exports+=1
   assert any('no mide el tiempo' in x for x in nodes)
   if any(it.get('recallSequence') for it in captured):assert any('una a una' in x for x in nodes)
   if any(it.get('type')=='memoryReveal' and not it.get('recallSequence') for it in captured):assert any('Mira el material' in x for x in nodes)
   for item in captured:
    for block in item['stimulus']:
     if block['type']=='document':
      with zipfile.ZipFile(path) as archive:assert any(n.startswith('word/media/') and n.endswith('.png') for n in archive.namelist())
      continue
     for value in ([block['text']] if block['type']=='text' else block['items'] if block['type']=='list' else [v for row in block['rows'] for v in row]):
      if not any(value in node for node in nodes):
       visible=page.evaluate("({value,item})=>item.type==='memoryReveal'&&StimulusArt.forLabel(value,item.lexicalSenses)?ActivityModel.memoryLabel(value):value",{'value':value,'item':item})
       assert visible!=value and any(visible in node for node in nodes),value
   page.locator('#navMenu [data-section="progress"]').click()
   assert 'Mediana al acertar' in page.locator('#progressCards').inner_text()
   with page.expect_download() as dl:page.locator('#exportDetailCsv').click()
   csv_path=Path(tmp)/f'{age}.csv';dl.value.save_as(csv_path)
   csv_data=csv_path.read_text(encoding='utf-8-sig');assert 'tiempo_ms;tiempo_valido;tarea_velocidad' in csv_data;assert 'speedReasoning' in csv_data
   print(f'PASS: {age}: ten sources, L1/L3 sequential/spatial/association recall, timed/invalid/untimed/wrong trials, fused executive tasks and two DOCX',flush=True)
  # Timing survives reload in progress; the old domain is never restored as a menu area.
  before=page.evaluate('()=>__profiles.find(p=>p.id==="teen").progress.history.filter(x=>x.subject==="speedReasoning").length')
  page.reload(wait_until='networkidle');page.wait_for_selector('#profileSelect');workspace(page).locator('#profileSelect').select_option('teen')
  page.wait_for_timeout(300)
  after=page.evaluate('()=>__profiles.find(p=>p.id==="teen").progress.history.filter(x=>x.subject==="speedReasoning").length');assert before==after
  assert not errors,errors;assert not external,external
  print(f'PASS: {answered} answered activities, {exports} real DOCX, persistence, desktop/mobile, no external requests or page errors',flush=True)
  browser.close()
finally:server.shutdown();server.server_close()

"""Supervision: real app/API adapter, authored tasks, exact-set grading and Word sources."""
import importlib.util,threading,tempfile,zipfile,xml.etree.ElementTree as ET,json,subprocess,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
tasks=json.loads(subprocess.check_output(['node','-e',"const c=require('./js/curriculum');console.log(JSON.stringify(Object.fromEntries(['junior','primary','middle','teen'].map(age=>[age,Object.fromEntries([1,2,3].map(level=>[level,c.pool(age,'executive',level).filter(x=>x.type==='multiSelect')]))]))))"],cwd=ROOT))
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  counter=0
  def override(route):
   global counter
   body=route.request.post_data_json
   if body.get('domain')!='executive':return route.continue_()
   task=tasks[body['profile_id']][str(body['level'])][counter%6];counter+=1
   route.fulfill(json={'status':200,'data':{'items':[task],'usage':{'used':counter,'limit':500}}})
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect');page.wait_for_timeout(1000)
  page.route('**/__review/content',override)
  page.evaluate('''()=>{const old=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return old(it,...args)}}''')
  checks=0
  for age in ['junior','primary','middle','teen']:
   page.locator('#profileSelect').select_option(age);page.locator('#navMenu [data-subject=executive]').click()
   for level in [1,3]:
    page.locator('#exerciseLevelSelect').select_option(str(level));page.wait_for_selector('#multiCheck');page.wait_for_function('(level)=>__current?.level===level',arg=level)
    for correct in [False,True]:
     item=page.evaluate('__current');assert item['type']=='multiSelect';assert page.locator('#multiCheck').is_disabled();assert page.locator('#multiCount').inner_text()=='0 seleccionadas'
     labels=item['answers'] if correct else [x for x in item['opts'] if x not in item['answers']][:1]
     for label in labels:
      option=page.get_by_role('button',name=label,exact=True);option.focus();page.keyboard.press('Space');assert option.get_attribute('aria-pressed')=='true'
     assert '/' not in page.locator('#multiCount').inner_text()
     page.locator('#multiCheck').click();page.wait_for_selector('#exerciseNext:not(.hidden)')
     assert ('ok' if correct else 'bad') in page.locator('#exerciseFeedback').get_attribute('class')
     history=page.evaluate('(age)=>__profiles.find(p=>p.id===age).progress.history',age);assert history[-1]['correct'] is correct;assert history[-1]['subject']=='executive'
     for width in [1280,390]:
      page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
      if age=='teen' and level==3 and correct:page.locator('#exercise').screenshot(path=f'/tmp/enriched-supervision-{width}.png')
     page.set_viewport_size({'width':1280,'height':900});checks+=1
     page.evaluate('window.__current=null');page.locator('#exerciseNext').click();page.wait_for_function('()=>__current?.type==="multiSelect"&&document.querySelector("#multiCheck")?.disabled===true')
  # Real ZIP with representative cases from every older age; both versions keep data and options.
  for age in ['junior','primary','middle','teen']:
   page.locator('#profileSelect').select_option(age)
   with page.expect_download() as download:page.evaluate('({age,items})=>WorksheetGenerator.generate([items.slice(0,2),items.slice(2,4)],__profiles.find(p=>p.id===age))',{'age':age,'items':tasks[age]['3']})
   path=Path(tmp)/(age+'.zip');download.value.save_as(path)
   import io
   with zipfile.ZipFile(path) as outer:
    assert len(outer.namelist())==2
    for i,name in enumerate(outer.namelist()):
     with zipfile.ZipFile(io.BytesIO(outer.read(name))) as doc:
      root=ET.fromstring(doc.read('word/document.xml'));ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
      words=[e.text or '' for e in root.findall('.//w:t',ns)]
      for item in tasks[age]['3'][i*2:i*2+2]:
       assert item['q'] in words
       for row in item['stimulus'][1]['rows']:
        for value in row:assert value in words,value
       for option in item['opts']:assert any(x.endswith('. '+option) for x in words)
  assert not errors,errors;print(f'PASS: {checks} correct/incorrect submissions across four ages and two levels; keyboard, selection count, stored scoring, 2 widths and 8 DOCX in 4 ZIP with complete conditions and plans')
  browser.close()
finally:server.shutdown();server.server_close()

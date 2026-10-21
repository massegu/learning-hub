"""Real rendering, scoring and Word evidence for the expanded mechanics."""
import importlib.util,threading,tempfile,zipfile,io,os,struct
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or '/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect');page.wait_for_timeout(500)
  page.locator('#profileSelect').select_option('teen')
  page.evaluate('''()=>{const old=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return old(it,...args)}}''')
  fixture={}
  def override(route):route.fulfill(json={'status':200,'data':{'items':[fixture],'usage':{'used':50,'limit':500}}})
  page.route('**/__review/content',override);page.clock.install()
  def show(item,domain):
   fixture.clear();fixture.update(item);page.evaluate('window.__current=null');page.locator(f'#navMenu [data-subject={domain}]').click()
   page.wait_for_function('()=>__current&&document.querySelector("#exercisePrompt").textContent===__current.q')
  def good():assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  scene=page.evaluate('(()=>{const it=Curriculum.pool("early","memory",1).find(x=>x.mechanic==="memory_scene");delete it.ageProfile;it.teenReview={version:3};return it})()');assert len(scene['memoryContent'])==5
  route=page.evaluate('Curriculum.pool("teen","memory",1).find(x=>x.mechanic==="memory_route")')
  for item,selector,name in [(scene,'.memory-scene','scene'),(route,'.memory-route','route')]:
   show(item,'memory');assert page.locator(selector+' > svg').count()==1
   for width in [1280,390]:
    page.set_viewport_size({'width':width,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    page.locator('#exercise').screenshot(path=f'/tmp/varied-{name}-{width}.png')
   page.clock.run_for(item['revealMs']+50);assert page.locator(selector).count()==0
   if item.get('answer'):
    for value in item['answer']:page.get_by_role('button',name=value,exact=True).click()
    page.locator('#orderCheck').click()
   else:page.locator('#exerciseOptions [data-answer]').filter(has_text=item['a'].removeprefix('el ').removeprefix('la ')).first.click()
   good()
  for mode in ['grid','coordinates']:
   item=page.evaluate('(mode)=>Curriculum.pool("teen","memory",2).find(x=>x.memoryResponse==="spatial"&&x.spatialAnswer===mode)',mode)
   show(item,'memory');page.clock.run_for(item['revealMs']+50)
   assert page.locator('.spatial-answer-grid small').count()==(0 if mode=='grid' else len(item['opts']))
   page.locator('.spatial-answer-grid button').evaluate_all('(els,a)=>els.find(el=>el.dataset.answer===a).click()',item['a']);good()
  sequence=page.evaluate('Curriculum.pool("teen","memory",1).find(x=>x.mechanic==="memory_sequence")');show(sequence,'memory');page.locator('#startMemorySequence').click()
  page.clock.run_for(len(sequence['recallSequence'])*(sequence['sequenceStepMs']+250)+50)
  for value in sequence['answer']:page.locator('.word-token').evaluate_all('(els,t)=>els.find(e=>e.textContent.trim()===ActivityModel.memoryLabel(t)).click()',value)
  page.locator('#orderCheck').click();good()
  for family in ['speed_search','speed_pairs','speed_flanker','speed_translation']:
   item=page.evaluate('(family)=>Curriculum.pool("teen","speedReasoning",3).find(x=>x.mechanic===family)',family);show(item,'speedReasoning');page.locator('#practiceSpeedTrial').click()
   assert page.locator('.speed-choice').count()>=2
   page.locator('.speed-choice').evaluate_all('(els,a)=>els.find(el=>el.dataset.answer===a).click()',item['a']);good()
  grammar=page.evaluate('Curriculum.academic("teen","teenLanguage",3,"grammar").find(x=>x.type==="order")');show(grammar,'teenLanguage')
  for token in grammar['answer']:page.get_by_role('button',name=token,exact=True).click()
  page.locator('#orderCheck').click();good()
  math=page.evaluate('Curriculum.academic("teen","teenMath",3,"grammar").find(x=>x.mechanic==="math_ecuaciones")');show(math,'teenMath')
  page.locator('[data-answer]').evaluate_all('(els,a)=>els.find(el=>el.dataset.answer===a).click()',math['a']);good()
  page.locator('#profileSelect').select_option('junior')
  page.evaluate("""()=>{const teen=__profiles.find(x=>x.id==='teen');teen.progress.history=[['a',true],['a',false],['b',true],['b',true],['c',false],['c',false]].map(([sessionId,correct],i)=>({sessionId,correct,subject:'memory',points:correct?10:0,level:1,ts:'2026-10-20T12:00:00Z',itemId:'chart-'+i}));}""")
  page.locator('#profileSelect').select_option('teen')
  page.locator('#navMenu [data-section=progress]').click();assert page.locator('#bankCoverage').count()==0
  assert page.locator('.accuracy-ring svg').count()>0;assert page.locator('#sessionEvolution svg circle').count()==3;assert page.locator('.progress-chart-data tbody tr').all_text_contents()==['1250%','22100%','320%']
  page.set_viewport_size({'width':1280,'height':1000});page.locator('#progress').screenshot(path='/tmp/varied-progress-1280.png')
  page.set_viewport_size({'width':390,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.locator('#progress').screenshot(path='/tmp/varied-progress-390.png')
  for source,name in [(scene,'scene'),(route,'route')]:
   svg=page.evaluate('''block=>{const holder=document.createElement('div');holder.innerHTML=ActivityModel.interactiveStimulus([block],{memory:true,senses:{banana:true}});return holder.querySelector('svg').outerHTML}''',source['stimulus'][0])
   (Path('/tmp')/('varied-source-'+name+'.svg')).write_text(svg)
  with page.expect_download() as download:
   page.evaluate('''({scene,route,grammar,math})=>WorksheetGenerator.generate([[scene,route,grammar,math],[scene,route]],__profiles.find(x=>x.id==='teen'))''',{'scene':scene,'route':route,'grammar':grammar,'math':math})
  path=Path(tmp)/'varied.zip';download.value.save_as(path)
  with zipfile.ZipFile(path) as outer:
   assert len(outer.namelist())==2
   for filename in outer.namelist():
    with zipfile.ZipFile(io.BytesIO(outer.read(filename))) as doc:
     xml=doc.read('word/document.xml').decode();assert 'Panadería' in xml;assert scene['memoryQuestion'] in xml
     dimensions=[struct.unpack('>II',doc.read(name)[16:24]) for name in doc.namelist() if name.startswith('word/media/') and name.endswith('.png')]
     assert any(width==720 for width,height in dimensions),dimensions
     assert any(width==700 for width,height in dimensions),dimensions
  assert not errors,errors
  print('PASS: disappearing scene and map, 5-step sequence, both position responses, 4 new speed tasks, grammar order, level-3 math, progress rings/chart, mobile, two Word files retaining the exact scene/map PNGs and source facts')
  browser.close()
finally:server.shutdown();server.server_close()

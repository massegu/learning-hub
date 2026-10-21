"""Real scene-only requests, image reveal/hide, differences and Word exports."""
import importlib.util,threading,os,tempfile,zipfile,io
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or '/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(viewport={'width':1360,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.locator('#profileSelect').select_option('teen')
  page.evaluate('''()=>{const old=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return old(it,...args)}}''')
  page.locator('#navMenu [data-subject=memory]').click();page.locator('#photoModeSwitch [data-photos=true]').click();page.wait_for_selector('#showMemoryPhoto')
  assert page.evaluate('__requests.at(-1).photos_only') is True
  assert page.evaluate('__requests.at(-1).client_revision')==3
  assert 'Límite diario:' in page.locator('#usageHint').inner_text()
  assert page.locator('.everyday-photo img').count()==0
  memory=page.evaluate('__current');assert memory['photoTask']['kind']=='recall'
  page.clock.install();page.locator('#showMemoryPhoto').click();page.wait_for_selector('.everyday-photo img')
  assert page.locator('.everyday-photo img').evaluate('(e)=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight+1}')
  assert page.locator('#exerciseOptions [data-answer]').count()==0
  assert page.locator('#exerciseVisual').inner_text().find(memory['why'])==-1
  page.locator('#exercise').screenshot(path='/tmp/photo-memory-desktop.png')
  page.clock.run_for(memory['revealMs']+100)
  assert page.locator('#exerciseVisual img').count()==0;assert page.locator('#exercisePrompt').inner_text()==memory['memoryQuestion']
  page.locator('#exerciseOptions [data-answer]').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',memory['a'])
  assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  page.locator('#navMenu [data-subject=attention]').click();page.locator('#attentionPhotos').click();page.wait_for_selector('.photo-comparison img')
  page.locator('#exerciseLevelSelect').select_option('2');page.wait_for_function('()=>__current?.level===2&&__current?.photoTask?.kind==="differences"');
  difference=page.evaluate('__current');assert difference['photoTask']['kind']=='differences'
  assert page.locator('.photo-comparison img').count()==2
  for width in [1360,390]:
   page.set_viewport_size({'width':width,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   page.locator('#exercise').screenshot(path=f'/tmp/photo-differences-{width}.png')
  assert page.locator('#multiCheck').is_disabled()
  first=difference['answers'][0];mark=page.get_by_role('button',name='Señalar: '+first,exact=True);mark.click();assert page.get_by_role('button',name=first,exact=True).get_attribute('aria-pressed')=='true'
  page.get_by_role('button',name=first,exact=True).click();assert mark.get_attribute('aria-pressed')=='false'
  mark.click()
  for value in difference['answers'][1:]:page.get_by_role('button',name=value,exact=True).click()
  page.locator('#multiCheck').click();assert mark.is_disabled();assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  page.locator('#exerciseNext').click();page.wait_for_selector('.photo-comparison img')
  difference2=page.evaluate('__current');wrong=next(x for x in difference2['opts'] if x not in difference2['answers']);page.get_by_role('button',name=wrong,exact=True).click();page.locator('#multiCheck').click();assert 'bad' in page.locator('#exerciseFeedback').get_attribute('class')
  with page.expect_download() as download:
   page.evaluate('''({memory,difference})=>WorksheetGenerator.generate([[memory,difference],[memory,difference]],__profiles.find(x=>x.id==='teen'))''',{'memory':memory,'difference':difference})
  target=Path(tmp)/'photos.zip';download.value.save_as(target)
  with zipfile.ZipFile(target) as outer:
   assert len(outer.namelist())==2
   for name in outer.namelist():
    with zipfile.ZipFile(io.BytesIO(outer.read(name))) as doc:
     xml=doc.read('word/document.xml').decode();assert memory['memoryQuestion'] in xml;assert 'Imagen A' in xml and 'Imagen B' in xml
     images=[doc.read(n) for n in doc.namelist() if n.startswith('word/media/') and n.endswith('.png')]
     assert len(images)>=2
     source=ROOT/page.evaluate('(id)=>PhotoLibrary.scenes[id].path',memory['photoTask']['sceneId']);assert source.read_bytes() in images
     pair=page.evaluate('(id)=>PhotoLibrary.pairs[id]',difference['photoTask']['pairId']);base=page.evaluate('(id)=>PhotoLibrary.scenes[id].path',pair['sceneId']);assert (ROOT/base).read_bytes() in images;assert (ROOT/pair['path']).read_bytes() in images
  assert not errors,errors
  print('PASS: real photo-only delivery, explicit start, full viewing period, photograph and answers never coexist, recall scoring, A/B comparison, wrong/correct selections, mobile and 2 DOCX embedding source photographs; direct image marking and accessible button selection stay synchronized')
  browser.close()
finally:server.shutdown();server.server_close()

"""Match session areas to navigation and verify compact sources and growing answers."""
import importlib.util,threading,tempfile,zipfile,xml.etree.ElementTree as ET,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect');page.wait_for_timeout(1000)
  page.evaluate('''()=>{const old=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return old(it,...args)}}''')
  for age in ['early','junior','primary','middle','teen']:
   page.locator('#profileSelect').select_option(age)
   page.locator('#navMenu [data-section=sessionBuilder]').click()
   nav=page.locator('#navMenu [data-subject]').evaluate_all('(els)=>els.map(e=>({domain:e.dataset.subject,label:e.textContent.trim()}))')
   options=page.locator('#sessionDomainOptions label').evaluate_all('(els)=>els.map(e=>({domain:e.querySelector("input").value,label:e.querySelector("strong").textContent}))')
   assert [x['domain'] for x in nav]==[x['domain'] for x in options],(age,nav,options)
   assert all(x['label'].endswith(y['label']) for x,y in zip(nav,options)),(age,nav,options)
   for width in [390,1280]:
    page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   # A newly exposed area can actually start, not just appear as a checkbox.
   target='literacy' if age in ['primary','middle','teen'] else 'reading'
   page.locator('#sessionDomainOptions input').evaluate_all('(els)=>els.forEach(e=>{e.checked=e.value==="'+target+'";e.dispatchEvent(new Event("change"))})')
   assert page.locator('#sessionPlanPreview .session-plan-chips span').count()==8
   page.evaluate('window.__current=null');page.locator('#startGuidedSession').click()
   page.wait_for_function('(domain)=>__current?.domain===domain&&document.querySelector("#exercisePrompt").textContent===__current.q',arg=target)
   assert page.locator('#guidedSessionBar').is_visible()
   page.locator('#cancelGuidedSession').click()
  page.locator('#navMenu [data-subject=literacy]').click();page.locator('#languageModeSwitch [data-mode=writing]').click();page.locator('#textAnswerInput').wait_for(state='visible')
  for width in [1280,390]:
   page.set_viewport_size({'width':width,'height':900});field=page.locator('#textAnswerInput');field.fill('Una frase.');small=field.evaluate('(e)=>e.getBoundingClientRect().height')
   field.fill('Esta respuesta explica los datos que aparecen en el texto y propone una comprobación. '*5);large=field.evaluate('(e)=>e.getBoundingClientRect().height')
   assert large>small,(width,small,large);assert field.evaluate('(e)=>e.scrollHeight<=e.clientHeight+2')
   field.fill('Una frase.');assert field.evaluate('(e)=>e.getBoundingClientRect().height')<large
  # Compact images keep their real aspect ratio in the Word package too.
  source=page.evaluate('DocumentLibrary.get("ticket-es")');assert source['height']<1100
  with page.expect_download() as download:
   page.evaluate('()=>WorksheetGenerator.generate([[DocumentLibrary.pool("teen","literacy",1).find(it=>it.passageKey==="document:ticket-es")]],__profiles.find(p=>p.id==="teen"))')
  path=Path(tmp)/'compact.docx';download.value.save_as(path)
  with zipfile.ZipFile(path) as doc:
   root=ET.fromstring(doc.read('word/document.xml'));ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','wp':'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'}
   extent=root.find('.//wp:extent',ns);assert abs(int(extent.get('cx'))/int(extent.get('cy'))-source['width']/source['height'])<.01
   text=' '.join(e.text or '' for e in root.findall('.//w:t',ns));assert 'Documento ficticio' not in text;assert 'MUSEO ABIERTO' in text
  assert not errors,errors
  print('PASS: session areas and labels match navigation across five ages; Reading sessions start; mobile layout; answers grow and shrink; compact source exports at its true aspect ratio without the disclaimer')
  browser.close()
finally:server.shutdown();server.server_close()

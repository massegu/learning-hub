"""Mexico feedback: real handler → UI → focused DOCX; no production traffic."""
import importlib.util
from pathlib import Path
import tempfile
import threading
from playwright.sync_api import sync_playwright
from browser_support import ROOT,doc_text
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py')
preview=importlib.util.module_from_spec(spec);spec.loader.exec_module(preview)
server=preview.ReviewServer(('127.0.0.1',0),preview.prepare())
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':900});errors=[];external=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:external.append(r.url) if r.url.startswith('https://') else None)
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#v16ContentLocale');page.wait_for_timeout(3000)
  page.evaluate('''()=>{const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return gate(it,...args)}}''');page.clock.install()
  page.locator('#v16ContentLocale').select_option('es_mx');page.wait_for_function('()=>LearningAPI.contentLocale==="es_mx"')
  page.locator('#profileSelect').select_option('teen')
  def wait_item():
   page.wait_for_function('()=>__current&&[__current.q,__current.memoryQuestion].includes(document.querySelector("#exercisePrompt").textContent)')
   it=page.evaluate('__current')
   if it.get('type')=='memoryReveal':page.clock.fast_forward(it['revealMs']+20)
   page.wait_for_function('()=>document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0')
   return it
  def capture(name):
   for width in [1280,390]:
    page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    page.locator('#exercise').screenshot(path=f'/tmp/mexico-{name}-{width}.png')
   page.set_viewport_size({'width':1280,'height':900})
  answered=0
  for domain in ['executive','attention','memory']:
   for level in ([1,2,3] if domain=='executive' else [1]):
    page.evaluate('window.__current=null');page.locator(f'#navMenu [data-subject="{domain}"]').click();it=wait_item()
    if it['level']!=level:
     page.evaluate('window.__current=null');page.locator('#exerciseLevelSelect').select_option(str(level));it=wait_item()
    found=False
    for n in range(45):
     it=wait_item()
     target=(domain=='executive' and it['mechanic']=='exec_rule_switch') or (domain=='attention' and it['mechanic']=='att_table_cross') or (domain=='memory' and 'audífonos' in it.get('opts',[]))
     if target:
      found=True
      if domain=='executive':
       assert page.locator('#exerciseVisual .structured-stimulus-table').count()==2
       assert 'Seleccionar impares' not in page.locator('#exerciseOptions').inner_text()
       page.evaluate('window.__reviewExport=__current')
      if domain=='attention':assert page.locator('#exerciseVisual th').all_text_contents()==['Línea','Parada','Hora']
      if domain=='memory':assert 'auriculares' not in page.locator('#exerciseOptions').inner_text()
      capture(f'{domain}-L{level}')
     if it.get('type')=='order':
      for token in it['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
      page.locator('#orderCheck').click()
     else:page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
     page.wait_for_function('()=>document.querySelector("#exerciseFeedback").classList.contains("ok")');answered+=1
     if found:break
     page.evaluate('window.__current=null');page.locator('#exerciseNext').click()
    assert found,(domain,level)
    print(f'PASS: Mexico/{domain}/L{level}, target appears in real session, scored and responsive',flush=True)
  with page.expect_download() as download:page.evaluate('()=>WorksheetGenerator.generate([[__reviewExport]],__profiles.find(p=>p.id==="teen"))')
  path=Path(tmp)/'rules.docx';download.value.save_as(path);nodes=doc_text(path.read_bytes())
  model=page.evaluate('()=>ActivityModel.printable(__reviewExport,__profiles.find(p=>p.id==="teen"))');q=nodes.index(model['question'])
  for block in model['stimulus']:
   values=[block['text']] if block['type']=='text' else [x for row in block['rows'] for x in row]
   for value in values:assert any(value in node for node in nodes[:q]),value
  assert not errors,errors;assert not external,external
  print(f'PASS: {answered} real answers, two-block criteria and all table data retained before the DOCX question; no external requests/page errors',flush=True)
  browser.close()
finally:
 server.shutdown();server.server_close()

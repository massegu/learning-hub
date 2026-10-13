"""Actual app requests and DOCX downloads across seven countries/five age routes.
Only the Supabase service boundary is simulated. No production data is touched.
"""
from pathlib import Path
import functools
import http.server
import json
import re
import tempfile
import threading
from playwright.sync_api import sync_playwright
from browser_support import ROOT, SDK, QuietHandler, doc_text

COUNTRIES=['es_es','es_mx','es_co','es_ar','es_cl','es_pa','es_cr']
BANDS=['early','junior','primary','middle','teen']

def journal(page):
    page.evaluate("""() => {
      window.__observed=[]; window.__exports=[];
      const adapt=LocaleContent.localizeItem;
      LocaleContent.localizeItem=(...args)=>{
        const item=adapt(...args);
        window.__observed.push(JSON.parse(JSON.stringify(item)));
        return item;
      };
      const generate=WorksheetGenerator.generate;
      WorksheetGenerator.generate=async(items,profile)=>{
        window.__exports.push(JSON.parse(JSON.stringify({items,profile})));
        return generate(items,profile);
      };
    }""")

def consistent(page,item,key,early=False):
    assert item['localization']['locale']==key,item
    assert page.evaluate('(it)=>JSON.stringify(LocaleContent.localizeItem(it,it.localization.locale))===JSON.stringify(it)',item)
    if item.get('domain')!='english' and item['localization'].get('domain')!='english':
        text=json.dumps({f:item.get(f) for f in ['q','why','scenario','opts','a','stimulus','tokens','answer','memoryContent']},ensure_ascii=False)
        if key!='es_es':
            assert not re.search(r'\b(?:grifo|bañador|ordenador|zumo|coge|estáis|vosotros)\b',text,re.I),text
        assert not re.search(r'\b(?:de|a) el\b',text),text
    if early:
        assert page.evaluate('(it)=>{ActivityModel.forDelivery(it,__profiles[0],it.domain);return true}',item)

def document_integrity(page,nodes,items,profile,key):
    projections=page.evaluate("""({items,profile,key})=>items.map(it=>{
      const local=LocaleContent.localizeItem(it,key);
      return LocaleContent.localizeModel(ActivityModel.printable(local,profile),key,local.localization.domain||local.domain,local);
    })""",dict(items=items,profile=profile,key=key))
    for i,model in enumerate(projections):
        start=nodes.index(f'ACTIVIDAD {i+1}')
        stop=nodes.index(f'ACTIVIDAD {i+2}') if i+1<len(items) else len(nodes)
        block=nodes[start:stop]; q=block.index(model['question'])
        for stimulus in model['stimulus']:
            values=[stimulus['text']] if stimulus['type']=='text' else stimulus['items'] if stimulus['type']=='list' else [v for row in stimulus['rows'] for v in row]
            for value in values:assert any(s==value or re.match(r'^\d+\. ',s) and s.endswith(value) for s in block[:q]),(key,i,value)
        for value in model['options']+model['tokens']:assert any(s.endswith('. '+value) for s in block),(key,i,value)

server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
captures={}
try:
    with tempfile.TemporaryDirectory(prefix='lh-locales-') as tmp, sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        page=browser.new_page(); errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        def external(route):
            url=route.request.url
            if 'supabase-js' in url:route.fulfill(body=SDK,content_type='application/javascript')
            elif '/docx@8.5.0/' in url:route.fulfill(body=(ROOT/'node_modules/docx/build/index.umd.js').read_bytes(),content_type='application/javascript')
            elif '/jszip@3.10.1/' in url:route.fulfill(body=(ROOT/'node_modules/jszip/dist/jszip.min.js').read_bytes(),content_type='application/javascript')
            else:route.abort()
        page.route(re.compile(r'^https://'),external)
        page.add_init_script((ROOT/'tests/locale-fixtures.js').read_text())
        page.add_init_script("window.__localeMode=true;")
        page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
        page.wait_for_selector('#v16ContentLocale');page.wait_for_timeout(3500)
        journal(page)
        for key in COUNTRIES:
            page.locator('#v16ContentLocale').select_option(key)
            page.wait_for_function('(key)=>LearningAPI.contentLocale===key&&!document.querySelector("#v16ContentLocale").disabled',arg=key)
            captures[key]={}
            for band in BANDS:
                page.locator('#profileSelect').select_option(band)
                page.wait_for_timeout(300)  # Existing age-route UI patches settle.
                domains=page.locator('#navMenu [data-subject]:visible').evaluate_all('(els)=>els.map(e=>e.dataset.subject)')
                schedule=(domains+domains)[:max(10,len(domains))]
                activities=[]
                for domain in schedule:
                    before=page.evaluate('__requests.length')
                    page.locator(f'#navMenu [data-subject="{domain}"]').click()
                    page.wait_for_function('(n)=>__requests.length>n && document.querySelectorAll("#exerciseOptions button").length>0',arg=before,timeout=20000)
                    item=page.evaluate('__observed[__observed.length-1]')
                    consistent(page,item,key,band=='early')
                    assert page.evaluate('__requests[__requests.length-1].locale')==key
                    assert page.locator('#exercisePrompt').inner_text()==(item.get('memoryQuestion') if item['type']=='memoryReveal' else item['q'])
                    if item['type']=='order':
                        for token in item['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
                        page.locator('#orderCheck').click()
                    else:page.locator('#exerciseOptions').get_by_role('button',name=item['a'],exact=True).click()
                    page.wait_for_function('document.querySelector("#exerciseFeedback").textContent.length>0')
                    explanation=page.locator('#exerciseFeedback').inner_text()+' '+page.locator('#exerciseExplanation').inner_text()
                    if item.get('why'):assert item['why'] in explanation,(key,domain,explanation)
                    activities.append(item)
                page.locator('#navMenu [data-section="homework"]').click()
                page.locator('#worksheetNone').click()
                for domain in domains:page.locator(f'#homeworkOptions input[value="{domain}"]').check()
                page.locator('#worksheetCount').select_option('1')
                page.locator('#worksheetQuestions').select_option('20')
                with page.expect_download(timeout=30000) as download:page.locator('#generateWorksheetsBtn').click()
                path=Path(tmp)/f'{key}-{band}.docx';download.value.save_as(path)
                exported=page.evaluate('__exports[__exports.length-1]')
                assert exported['profile']['contentLocale']==key
                assert page.evaluate('__requests[__requests.length-1].locale')==key
                nodes=doc_text(path.read_bytes())
                document_integrity(page,nodes,exported['items'][0],exported['profile'],key)
                for item in exported['items'][0]:consistent(page,item,key,band=='early')
                captures[key][band]={'domains':domains,'activities':activities,'worksheet':exported['items'][0],'wordText':nodes}
                print(f'PASS: {key} / {band}: {len(activities)} interactive, all {len(domains)} domains, 20-question DOCX',flush=True)
            # Reload verifies persisted account setting, not just a selector label.
            page.reload(wait_until='networkidle')
            page.wait_for_function('(key)=>LearningAPI.contentLocale===key && document.querySelector("#v16ContentLocale")?.value===key',arg=key)
            journal(page)
        # HTML display/export parity without modifying class names, identifiers or URLs.
        assert page.evaluate("""() => {
          const raw={q:'¿Dónde está el ordenador?',opts:['En la mesa','En la piscina'],a:'En la mesa',visual:'<div class="lh-doc"><div class="product-grid"><div data-code="ordenador"><b>El ordenador</b><span>En la mesa</span></div></div></div>'};
          const item=LocaleContent.localizeItem(raw,'es_mx');
          const model=ActivityModel.printable(item,{age_band:'teen'});
          return item.visual.includes('data-code="ordenador"') && model.stimulus[0].items.some(s=>s.includes('La computadora En la mesa'));
        }""")
        assert page.evaluate("""() => {
          try{LocaleContent.localizeItem({visual:'<b>El</b> <span>ordenador</span>'},'es_mx');return false;}
          catch(e){return e.message.includes('concordancia');}
        }""")
        assert page.evaluate("""() => {
          const localized=LocaleContent.localizeItem({visual:'<div data-code="ordenador"><input type="text" placeholder="El ordenador" value="El bolígrafo"><img src="ordenador.png" alt="El ordenador"></div>'},'es_mx');
          const doc=new DOMParser().parseFromString(localized.visual,'text/html');
          return doc.querySelector('input').getAttribute('placeholder')==='La computadora' && doc.querySelector('input').value==='La pluma' && doc.querySelector('img').alt==='La computadora' && doc.querySelector('img').getAttribute('src')==='ordenador.png' && doc.querySelector('div').dataset.code==='ordenador';
        }""")
        assert page.evaluate("""() => {
          const raw={scenario:'El pan cuesta 2 euros.',q:'¿Cuánto cuesta?',opts:['2 euros','3 euros'],a:'2 euros'};
          try{LocaleContent.localizeItem(raw,'es_mx');return false;}catch(e){if(!e.message.includes('moneda'))return false;}
          return LocaleContent.localizeItem({...raw,currencyContext:'foreign'},'es_mx').a==='2 euros';
        }""")
        # Changing locale invalidates old content and a pending server response;
        # it never triggers an extra quota-consuming request automatically.
        page.locator('#profileSelect').select_option('primary')
        page.evaluate('window.__delayNext=true')
        page.locator('#navMenu [data-subject="reading"]').click()
        page.wait_for_function('__pending')
        n=page.evaluate('__requests.length')
        page.locator('#v16ContentLocale').select_option('es_mx')
        page.wait_for_function('LearningAPI.contentLocale==="es_mx"')
        page.evaluate('__release()');page.wait_for_timeout(300)
        assert page.evaluate('__requests.length')==n
        assert page.locator('#exerciseOptions').inner_text()==''
        assert page.locator('#exerciseVisual').inner_text()==''
        assert 'variante' in page.locator('#exercisePrompt').inner_text()
        page.locator('#navMenu [data-section="homework"]').click()
        exported=page.evaluate('__exports.length')
        page.evaluate('window.__delayNext=true')
        page.locator('#generateWorksheetsBtn').click()
        page.wait_for_function('__pending')
        page.locator('#v16ContentLocale').select_option('es_co')
        page.wait_for_function('LearningAPI.contentLocale==="es_co"')
        page.evaluate('__release()')
        page.wait_for_function('document.querySelector("#docxStatus").textContent.includes("variante")')
        assert page.evaluate('__exports.length')==exported
        # Failed saves preserve the previous locale/controller.
        page.evaluate('window.__saveLocaleFail=true')
        page.locator('#v16ContentLocale').select_option('es_ar')
        page.wait_for_function('!document.querySelector("#v16ContentLocale").disabled')
        assert page.evaluate('LearningAPI.contentLocale')=='es_co'
        assert page.locator('#v16ContentLocale').input_value()=='es_co'
        assert not errors,errors
        print('PASS: locale reload, HTML parity, pending-response rejection and failed-save consistency',flush=True)
        Path('/tmp/spanish-locale-browser-audit.json').write_text(json.dumps(captures,ensure_ascii=False,indent=2))
        browser.close()
finally:
    server.shutdown()

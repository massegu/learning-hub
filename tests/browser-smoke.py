"""Browser integration with a mocked Supabase boundary; no real account writes.
Run after npm ci: python3 tests/browser-smoke.py (requires Playwright + Chromium).
"""
from pathlib import Path
import functools
import http.server
import tempfile
import threading
import zipfile
import io
import json
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SDK = r"""
window.__requests=[]; window.__deny=false; window.__bodyError=false; window.__saved=[];
window.__profiles=JSON.parse(localStorage.getItem('__mock_profiles')||'null')||[
 {id:'early',name:'Sol',age_band:'primary',progress:{ageRoute:'early',initialLevel:1,_delivery:{keep:true}}},
 {id:'junior',name:'Alex',age_band:'primary',progress:{ageRoute:'junior',initialLevel:1}},
 {id:'primary',name:'Luis',age_band:'primary',progress:{initialLevel:1}},
 {id:'middle',name:'Clara',age_band:'middle',progress:{initialLevel:1}},
 {id:'teen',name:'Nora',age_band:'teen',progress:{initialLevel:1}}
];
window.supabase={createClient(){
 const client={auth:{getSession:async()=>({data:{session:{user:{id:'account',email:'test@example.invalid'}}}}),
 signOut:async()=>{},onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},
 functions:{invoke:async(name,{body})=>{
   __requests.push(body);
   if(__deny)return {error:{message:'Daily content limit reached'}};
   const count=body.questions||body.count||1;
   const items=Array.from({length:count},(_,i)=>({id:'remote-'+__requests.length+'-'+i,type:'standard',theme:'Horarios de vuelos',why:'El vuelo sale a las 15:40.',scenario:'El vuelo F15-P7 sale a las 15:40.',q:'¿Qué criterio ayuda más?',opts:['Azul','Verde'],a:'Azul'}));
   if(__bodyError)return {data:{items,error:'Trial expired'},error:null};
   return {data:{items,usage:{used:__requests.length,limit:50}},error:null};
 }},from(table){
   let filter,operation,values;
   const q={select(){return q},order(){return q},eq(k,v){filter=v;return q},insert(v){operation='insert';values=v;return q},update(v){operation='update';values=v;return q},delete(){return q},single(){return Promise.resolve(result(true))},then(a,b){return Promise.resolve(result(false)).then(a,b)}};
   function result(single){
     if(table==='accounts')return {data:{subscription_status:'active'},error:null};
     if(table==='learner_profiles'){
       if(operation==='insert'){
         const p={...values,id:'created'};__profiles.push(p);operation=null;return {data:p,error:null};
       }
       const p=__profiles.find(p=>p.id===filter);
       if(operation==='update'&&p){Object.assign(p,values);__saved.push(JSON.parse(JSON.stringify(p)));localStorage.setItem('__mock_profiles',JSON.stringify(__profiles));operation=null;}
       return {data:single?p:__profiles,error:null};
     }
     return {data:[],error:null};
   }
   return q;
 }};
 return client;
}};
"""

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

def doc_text(data):
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        root = ET.fromstring(z.read('word/document.xml'))
    return [n.text or '' for n in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')]

def install_journal(page):
    page.evaluate("""() => {
      window.__lastEarly=null;
      const original=ActivityModel.forDelivery;
      ActivityModel.forDelivery=(item,profile,domain)=>{
        const checked=original(item,profile,domain);
        if(ContentPolicy.forProfile(profile))window.__lastEarly=JSON.parse(JSON.stringify(checked));
        return checked;
      };
      const generate=WorksheetGenerator.generate;
      WorksheetGenerator.generate=async(items,profile)=>{
        window.__lastWorksheets=JSON.parse(JSON.stringify(items));
        return generate(items,profile);
      };
    }""")

def check_text(text):
    lowered=text.lower()
    for word in ['estrategia','criterio','priorizar','alternativa','vuelo','descuento','f15-p7','15:40','información relevante']:
        assert word not in lowered, text
    assert not re.search(r'\b(?:de|a) el\b',text),text
    for match in re.finditer(r'¿Dónde (?:está|estaba|debe buscar) ([^?]+)\?',text):
        assert match[1].startswith(('el ','la ')),text

def assert_doc_integrity(nodes,items):
    for i,item in enumerate(items):
        start=nodes.index(f'ACTIVIDAD {i+1}')
        stop=nodes.index(f'ACTIVIDAD {i+2}') if i+1<len(items) else len(nodes)
        block=nodes[start:stop]
        question=item.get('memoryQuestion') or item['q']
        q=block.index(question)
        for stimulus in item['stimulus']:
            values=[stimulus['text']] if stimulus['type']=='text' else stimulus['items'] if stimulus['type']=='list' else [v for row in stimulus['rows'] for v in row]
            for value in values:
                assert any(s==value or re.match(r'^\d+\. ',s) and s.endswith(value) for s in block[:q]),(question,value)
        for value in item.get('opts',[]) + item.get('tokens',[]):
            assert any(s.endswith('. '+value) for s in block),(question,value)
        check_text(' '.join(block))

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with tempfile.TemporaryDirectory(prefix='lh-smoke-') as tmp, sync_playwright() as p:
        browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        page = browser.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        def external(route):
            url = route.request.url
            if 'supabase-js' in url:
                route.fulfill(body=SDK, content_type='application/javascript')
            elif '/docx@8.5.0/' in url:
                route.fulfill(body=(ROOT/'node_modules/docx/build/index.umd.js').read_bytes(), content_type='application/javascript')
            elif '/jszip@3.10.1/' in url:
                route.fulfill(body=(ROOT/'node_modules/jszip/dist/jszip.min.js').read_bytes(), content_type='application/javascript')
            else:
                route.abort()
        import re
        page.route(re.compile(r'^https://'), external)
        page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
        page.wait_for_function("document.querySelector('#profileSelect').selectedOptions[0]?.textContent.includes('6-7')")
        page.wait_for_timeout(3500)  # Allow every historical renderer upgrade to run.
        assert page.evaluate('WorksheetGenerator.integrityVersion') == 1
        assert page.evaluate(r"""() => {
          const base={q:'¿Cuánto cuesta el pan?',opts:['2 euros','3 euros'],a:'2 euros'};
          const visual='<div class="lh-doc"><div class="doc-kicker">TIENDA</div><div class="product-grid"><div><b>Pan</b><span>2 euros</span></div></div></div>';
          const good=ActivityModel.printable({...base,visual});
          if(!JSON.stringify(good.stimulus).includes('Pan 2 euros'))return false;
          for(const bad of [
            '<div class="lh-doc"><div class="doc-kicker">TIENDA</div><p>Pan cuesta 2 euros.</p></div>',
            '<div class="lh-doc"><div class="doc-kicker">TIENDA</div><table><tr><td colspan="2">Pan cuesta 2 euros.</td></tr></table></div>',
            '<div class="lh-doc"><img src="missing.png"></div>'
          ]) {
            try{ActivityModel.printable({...base,visual:bad});return false;}catch(e){}
          }
          return true;
        }""")
        print('PASS: HTML stimulus adapters preserve all content or reject the activity')
        nav = page.locator('#navMenu .nav-item[data-subject]')
        assert nav.count() == 8
        install_journal(page)
        observed={}
        for domain in ['reading', 'attention', 'executive', 'memory', 'speedReasoning', 'applied', 'language', 'division']:
            samples=[]
            for index in range(10):
                if index==5:
                    page.reload(wait_until='networkidle')
                    page.wait_for_function("document.querySelector('#profileSelect').selectedOptions[0]?.textContent.includes('6-7')")
                    install_journal(page)
                if index in [0,5]:
                    page.locator(f'#navMenu [data-subject="{domain}"]').click()
                else:
                    page.locator('#exerciseNext').click()
                page.wait_for_function("window.__lastEarly && document.querySelector('#exercisePrompt').textContent!=='Cargando reto…' && document.querySelector('#exerciseVisual').textContent.trim().length>0")
                item=page.evaluate('__lastEarly')
                assert item['domain']==domain
                visual=page.locator('#exerciseVisual').inner_text()
                check_text(visual+' '+page.locator('#exercisePrompt').inner_text())
                if domain=='memory':
                    assert page.evaluate("JSON.stringify(__lastEarly.stimulus)===JSON.stringify(ActivityModel.printable(__lastEarly,__profiles[0]).stimulus)")
                    page.wait_for_function("document.querySelectorAll('#exerciseOptions .option-btn').length>0",timeout=12000)
                    assert page.locator('#exerciseVisual').inner_text()==''
                if domain=='language': assert not page.locator('#languageModeSwitch').is_visible()
                if item['type']=='order':
                    for token in item['answer']:
                        page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
                    page.locator('#orderCheck').click()
                else:
                    page.locator('#exerciseOptions').get_by_role('button',name=item['a'],exact=True).click()
                page.wait_for_function("document.querySelector('#exerciseFeedback').textContent.length>0")
                samples.append(item)
            assert len({it['semanticKey'] for it in samples})==10,domain
            assert all(a['ageProfile']['family']!=b['ageProfile']['family'] for a,b in zip(samples,samples[1:])),domain
            observed[domain]=samples
            print(f'PASS: {domain}: 10 consecutive activities, reload after 5, no semantic repeat',flush=True)
        Path('/tmp/early-primary-browser-audit.json').write_text(json.dumps(observed,ensure_ascii=False,indent=2))
        assert page.evaluate("__saved.some(p=>p.progress.ageRoute==='early'&&p.progress.totalAttempts>0&&p.progress._delivery.keep)")
        page.evaluate('window.__deny=true')
        before = page.evaluate('__requests.length')
        page.locator('#navMenu [data-subject="reading"]').click()
        page.wait_for_function("document.querySelector('#exercisePrompt').textContent.includes('límite')")
        assert page.evaluate('__requests.length') == before + 1
        assert page.locator('#exerciseOptions').inner_text() == ''
        assert page.locator('#exerciseVisual').inner_text() == ''
        print('PASS: quota errors do not generate local content or retry the server')
        page.evaluate('window.__deny=false')
        page.evaluate('window.__bodyError=true')
        page.locator('#navMenu [data-subject="reading"]').click()
        page.wait_for_function("document.querySelector('#exercisePrompt').textContent.includes('prueba ha finalizado')")
        assert page.locator('#exerciseVisual').inner_text()==''
        page.evaluate('window.__bodyError=false')
        # Inject an alternate source after normal Supabase selection to exercise
        # the actual screen/domain boundary, not only the local bank validator.
        page.evaluate("""() => {
          const adapt=EarlyContent.adaptResponse;
          window.__restoreAdapt=adapt;
          EarlyContent.adaptResponse=(res,payload,profile)=>{
            const it=EarlyContent.pool(payload.domain)[0];
            return {...res,items:[{...it,stimulus:[]}]};
          };
        }""")
        page.locator('#navMenu [data-subject="reading"]').click()
        page.wait_for_function("document.querySelector('#exercisePrompt').textContent.includes('estímulo')")
        assert page.locator('#exerciseVisual').inner_text()==''
        assert page.locator('#exerciseOptions').inner_text()==''
        page.evaluate('EarlyContent.adaptResponse=window.__restoreAdapt')
        # Prove the last rendering boundary still rejects an invalid source
        # even if a future delivery path accidentally skips its first gate.
        page.evaluate("""() => {
          const gate=ActivityModel.forDelivery;
          window.__restoreGate=gate;
          let calls=0;
          ActivityModel.forDelivery=(...args)=>++calls===1?args[0]:gate(...args);
          EarlyContent.adaptResponse=(res,payload)=>({...res,items:[{...EarlyContent.pool(payload.domain)[0],a:'missing answer'}]});
        }""")
        page.locator('#navMenu [data-subject="reading"]').click()
        page.wait_for_function("document.querySelector('#exercisePrompt').textContent.includes('respuesta no está')")
        assert page.locator('#exerciseVisual').inner_text()==''
        page.evaluate('EarlyContent.adaptResponse=window.__restoreAdapt;ActivityModel.forDelivery=window.__restoreGate')
        assert page.evaluate("""async () => {
          const invalid=EarlyContent.pool('memory')[0];
          invalid.answerEvidence={type:'listItem',block:0,index:99};
          try{await WorksheetGenerator.generate([[invalid]],__profiles[0]);return false;}
          catch(e){return e.message.includes('no se deriva');}
        }""")
        print('PASS: application-level failures and invalid alternate sources fail closed')
        page.locator('#navMenu [data-section="homework"]').click()
        page.locator('#worksheetCount').select_option('2')
        page.locator('#worksheetQuestions').select_option('20')
        with page.expect_download(timeout=30000) as download:
            page.locator('#generateWorksheetsBtn').click()
        archive = Path(tmp)/'worksheets.zip'
        download.value.save_as(archive)
        assert '6-7' in download.value.suggested_filename
        with zipfile.ZipFile(archive) as z:
            assert len(z.namelist()) == 2
            for name in z.namelist():
                nodes = doc_text(z.read(name))
                assert sum(s.startswith('ACTIVIDAD ') for s in nodes) == 20
                assert nodes.count('MIRA') == 20
                assert not any('F15-P7' in s or '15:40' in s for s in nodes)
        assert page.evaluate("__requests.filter(r=>r.kind==='worksheet').every(r=>r.profile_id==='early'&&r.questions===20)")
        items=page.evaluate('__lastWorksheets')
        with zipfile.ZipFile(archive) as z:
            for name,version in zip(z.namelist(),items): assert_doc_integrity(doc_text(z.read(name)),version)
        print('PASS: real ZIP download with two complete 20-activity DOCX worksheets')
        page.locator('#worksheetCount').select_option('1')
        with page.expect_download(timeout=30000) as download:
            page.locator('#generateWorksheetsBtn').click()
        single=Path(tmp)/'single.docx';download.value.save_as(single)
        assert_doc_integrity(doc_text(single.read_bytes()),page.evaluate('__lastWorksheets[0]'))
        print('PASS: third complete 20-activity DOCX with every stimulus before its question')
        for band in ['junior','primary','middle','teen']:
            page.locator('#profileSelect').select_option(band)
            page.locator('#navMenu [data-subject="attention"]').click()
            page.wait_for_function("document.querySelector('#exercisePrompt').textContent==='¿Qué criterio ayuda más?'")
            assert 'F15-P7' in page.locator('#exerciseVisual').inner_text()
            page.locator('#navMenu [data-section="homework"]').click()
            page.locator('#worksheetCount').select_option('1')
            page.locator('#worksheetQuestions').select_option('10')
            with page.expect_download(timeout=30000) as download:
                page.locator('#generateWorksheetsBtn').click()
            older=Path(tmp)/f'{band}.docx';download.value.save_as(older)
            assert doc_text(older.read_bytes()).count('¿Qué criterio ayuda más?')==10
            print(f'PASS: {band}: remote interactive content and 10-question remote DOCX unchanged')
        page.locator('#newProfileBtn').click()
        page.locator('#newProfileName').fill('Test child')
        page.locator('#newProfileAge').select_option('early')
        page.locator('#createProfileBtn').click()
        page.wait_for_function("document.querySelector('#activeProfileLabel').textContent==='Test child'")
        assert page.evaluate("__profiles.find(p=>p.id==='created').age_band") == 'primary'
        assert page.evaluate("__profiles.find(p=>p.id==='created').progress.ageRoute") == 'early'
        print('PASS: new 6-7 profiles retain the compatible DB age and explicit route')
        page.evaluate('window.__deny=true')
        page.locator('#navMenu [data-subject="reading"]').click()
        page.wait_for_function("document.querySelector('#exercisePrompt').textContent.includes('límite')")
        for selector in ['#exerciseTopic','#exerciseExplanation','#exerciseFeedback','#modelAnswer']:
            assert page.locator(selector).inner_text()==''
        assert not page.locator('#selfAssessment').is_visible()
        print('PASS: switching from older content to a denied early request leaves no stale adult material')
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()

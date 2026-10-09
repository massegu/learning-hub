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
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SDK = r"""
window.__requests=[]; window.__deny=false; window.__saved=[];
window.__profiles=[
 {id:'early',name:'Sol',age_band:'primary',progress:{ageRoute:'early',initialLevel:1,_delivery:{keep:true}}},
 {id:'teen',name:'Nora',age_band:'teen',progress:{initialLevel:1}}
];
window.supabase={createClient(){
 const client={auth:{getSession:async()=>({data:{session:{user:{id:'account',email:'test@example.invalid'}}}}),
 signOut:async()=>{},onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},
 functions:{invoke:async(name,{body})=>{
   __requests.push(body);
   if(__deny)return {error:{message:'Daily content limit reached'}};
   const count=body.questions||body.count||1;
   const items=Array.from({length:count},(_,i)=>({id:'remote-'+__requests.length+'-'+i,type:'standard',scenario:'El vuelo F15-P7 sale a las 15:40.',q:'¿Qué criterio ayuda más?',opts:['Azul','Verde'],a:'Azul'}));
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
       if(operation==='update'&&p){Object.assign(p,values);__saved.push(JSON.parse(JSON.stringify(p)));operation=null;}
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
        for domain in ['reading', 'attention', 'executive', 'memory', 'speedReasoning', 'applied', 'language', 'division']:
            page.locator(f'#navMenu [data-subject="{domain}"]').click()
            page.wait_for_function("document.querySelector('#exercisePrompt').textContent!=='Cargando reto…'")
            question = page.locator('#exercisePrompt').inner_text()
            assert question and not any(x in question.lower() for x in ['criterio', 'estrategia', 'vuelo'])
            assert page.locator('#exerciseVisual').inner_text().strip()
            assert not any(x in page.locator('#exerciseVisual').inner_text() for x in ['F15-P7', '15:40'])
            if domain == 'memory':
                page.wait_for_function("document.querySelectorAll('#exerciseOptions .option-btn').length>0", timeout=12000)
            if domain == 'language':
                assert not page.locator('#languageModeSwitch').is_visible()
            if page.locator('#exerciseOptions .option-btn').count():
                page.locator('#exerciseOptions .option-btn').first.click()
                page.wait_for_function("document.querySelector('#exerciseFeedback').textContent.length>0")
        print('PASS: eight domains, bounded child stimuli, memory reveal and exercise feedback')
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
        print('PASS: real ZIP download with two complete 20-activity DOCX worksheets')
        page.locator('#profileSelect').select_option('teen')
        page.locator('#navMenu [data-subject="teenLanguage"]').click()
        page.wait_for_function("document.querySelector('#exercisePrompt').textContent==='¿Qué criterio ayuda más?'")
        assert 'F15-P7' in page.locator('#exerciseVisual').inner_text()
        print('PASS: older age-band interactive content is unchanged')
        page.locator('#newProfileBtn').click()
        page.locator('#newProfileName').fill('Test child')
        page.locator('#newProfileAge').select_option('early')
        page.locator('#createProfileBtn').click()
        page.wait_for_function("document.querySelector('#activeProfileLabel').textContent==='Test child'")
        assert page.evaluate("__profiles.find(p=>p.id==='created').age_band") == 'primary'
        assert page.evaluate("__profiles.find(p=>p.id==='created').progress.ageRoute") == 'early'
        print('PASS: new 6-7 profiles retain the compatible DB age and explicit route')
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()

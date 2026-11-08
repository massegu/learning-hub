"""Real school-age Edge handler → client → DOCX. Default junior; pass primary for 10–12 or middle for 13–15.
Only a local fake SDK/account/database is used; external services are blocked.
"""
import functools,http.server,json,re,subprocess,tempfile,threading,sys,zipfile,io,xml.etree.ElementTree as ET
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT,SDK,QuietHandler,doc_text,doc_accessible_text,printable_stimulus_values, area, training_areas, wait_for_area, submit_declared_answer, trace_virtual_timers

ROUTE=sys.argv[1] if len(sys.argv)>1 else 'junior'
assert ROUTE in ['junior','primary','middle']
PROFILE_KEY='juniorProfile' if ROUTE=='junior' else 'schoolProfile'
worker=subprocess.Popen(['node','tests/edge-worker.js',ROUTE],cwd=ROOT,stdin=subprocess.PIPE,stdout=subprocess.PIPE,text=True)
lock=threading.Lock()
class Handler(QuietHandler):
    def do_POST(self):
        assert self.path=='/__offline_edge'
        body=self.rfile.read(int(self.headers['Content-Length'])).decode()
        with lock:
            worker.stdin.write(body+'\n');worker.stdin.flush();output=worker.stdout.readline().encode()
        self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(output)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
bridge=SDK.replace('const count=body.questions||body.count||1;', '''const reply=await (await fetch('/__offline_edge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})).json();
   if(reply.status!==200)return {error:{message:reply.data.error}};
   return {data:reply.data,error:null};
   const count=body.questions||body.count||1;''')
def doc_image_alternatives(data):
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        root=ET.fromstring(archive.read('word/document.xml'))
    tag='{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}docPr'
    return [(node.attrib.get('name',''),node.attrib.get('title',''),node.attrib.get('descr','')) for node in root.iter(tag)]

def document_integrity(page,nodes,items,profile,key,data):
    models=page.evaluate('''({items,profile,key})=>items.map(it=>{
      const localized=LocaleContent.localizeItem(it,key);
      return {raw:localized,projection:LocaleContent.localizeModel(ActivityModel.printable(localized,profile),key,localized.localization?.domain||localized.domain,localized)};
    })''',dict(items=items,profile=profile,key=key))
    alternatives=doc_image_alternatives(data)
    for i,model in enumerate(models):
        start=nodes.index(f'ACTIVIDAD {i+1}');stop=nodes.index(f'ACTIVIDAD {i+2}') if i+1<len(items) else len(nodes)
        block=nodes[start:stop];q=block.index(model['projection']['question']);raw=model['raw'];projection=model['projection']
        for stimulus in projection['stimulus']:
            values=printable_stimulus_values(page,stimulus)
            for value in values:
                assert any(value in s or re.match(r'^\d+\. ',s) and s.endswith(value) for s in block[:q]),(key,i,stimulus,value)
            if stimulus['type'] in ('photo','photoPair'):
                assert any('Escena cotidiana para observar.' in alt[2] for alt in alternatives),(key,i,'photo alt text missing',alternatives)
            elif stimulus['type']=='document':
                source=page.evaluate('(id)=>DocumentLibrary.get(id)',stimulus['documentId'])
                assert any(alt[0]==source['title'] and alt[1]==source['title'] for alt in alternatives),(key,i,stimulus['documentId'],source['title'],alternatives)
                assert any(all(value in alt[2] for value in values) for alt in alternatives),(key,i,stimulus['documentId'],values,alternatives)
            elif stimulus['type'] in ('list','table'):
                pictograms=page.evaluate('''({item,profile,stimulus})=>{
                  const illustrated=ContentPolicy.forProfile(profile)||item.type==='memoryReveal'||item.type==='executed'||Boolean(item.speedTask);
                  if(!illustrated)return [];
                  const values=stimulus.type==='list'?stimulus.items:stimulus.rows.flat();
                  return values.filter(value=>StimulusArt.forLabel(value,{...item.lexicalSenses,subject:stimulus.label})&&!/^[●○□△☆]$/.test(value));
                }''',dict(item=raw,profile=profile,stimulus=stimulus))
                for value in pictograms:
                    if stimulus.get('presentation') in ('memoryScene','routeMap'):
                        assert any(value in alt[2] for alt in alternatives),(key,i,'scene/map pictogram missing from grouped alt text',value,alternatives)
                    else:
                        assert any(alt[2]==value for alt in alternatives),(key,i,'pictogram alt missing',value,alternatives)
        answers=raw.get('answers') or ([raw['a']] if raw.get('a') is not None else [])
        if answers:assert all(str(value) in projection['options'] for value in answers),(key,i,'declared answers absent from printable options',answers,projection['options'])
        if raw.get('answer') is not None:assert all(str(value) in projection['tokens'] for value in raw['answer']),(key,i,'ordered answer absent from printable tokens',raw['answer'],projection['tokens'])
        for value in projection['options']+projection['tokens']:
            assert any(s.endswith('. '+value) for s in block),(key,i,value)
try:
    with tempfile.TemporaryDirectory(prefix='junior-docx-') as tmp,sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        def external(route):
            url=route.request.url
            if 'supabase-js' in url:route.fulfill(body=bridge,content_type='application/javascript')
            elif '/docx@8.5.0/' in url:route.fulfill(body=(ROOT/'node_modules/docx/build/index.umd.js').read_bytes(),content_type='application/javascript')
            elif '/jszip@3.10.1/' in url:route.fulfill(body=(ROOT/'node_modules/jszip/dist/jszip.min.js').read_bytes(),content_type='application/javascript')
            else:route.abort()
        page.route(re.compile('^https://'),external)
        page.add_init_script("localStorage.setItem('__mock_profiles',"+json.dumps(json.dumps([dict(id=ROUTE,name='Alex',age_band='middle' if ROUTE=='middle' else 'primary',progress=dict(ageRoute=ROUTE,initialLevel=1))]))+");")
        page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
        page.wait_for_selector('#home' if ROUTE=='middle' else '#schoolHub');page.wait_for_timeout(1500);page.clock.install();trace_virtual_timers(page)
        page.evaluate('''()=>{window.__delivered=[];window.__exports=[];const gate=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=JSON.parse(JSON.stringify(it));window.__delivered.push(__current);return gate(it,...args)};
          const generate=WorksheetGenerator.generate;WorksheetGenerator.generate=async(items,profile)=>{__exports.push({items,profile});return generate(items,profile);};}''')
        def wait_item():
            page.wait_for_function('__current&&[__current.q,__current.memoryQuestion].includes(document.querySelector("#exercisePrompt").textContent)')
            item=page.evaluate('__current')
            assert item[PROFILE_KEY]['route']==ROUTE
            if item['type']=='memoryReveal' and page.locator('.memory-card').count():
                assert page.locator('.memory-card').count()==len(item['memoryContent'])
                page.clock.fast_forward(item['revealMs']+10)
            if item['type']=='self':
                visual=page.locator('#exerciseVisual').inner_text()
                criteria=page.locator('#writingCriteria').inner_text()
                assert all(criterion in criteria for criterion in item['writingRubric']),(item['id'],item['writingRubric'],criteria)
                assert visual.strip(),(item['id'],'Writing stimulus is missing.')
            page.wait_for_function('(document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0)||(__current?.type==="self"&&!document.querySelector("#textAnswerArea").classList.contains("hidden"))')
            return item
        writing_capture=[]
        assessment_counts={'automatic':0,'self':0}
        def answer(item):
            assessment_counts['self' if item['type']=='self' else 'automatic']+=1
            if item['type']=='self':
                if ROUTE=='middle' and not writing_capture:
                    for width in [1280,390]:
                        page.set_viewport_size({'width':width,'height':900})
                        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                        page.locator('#exercise').screenshot(path=f'/tmp/middle-writing-{width}.png')
                    page.set_viewport_size({'width':1280,'height':900})
                    writing_capture.append(True)
                page.locator('#textAnswerInput').fill(item['sample'])
                page.locator('#textAnswerCheck').click()
                page.locator('.self-buttons [data-self="true"]').click()
            else:submit_declared_answer(page,item,advance_clock=True)
            page.wait_for_function('document.querySelector("#exerciseFeedback").classList.contains("ok")')
        domains=['language','reading','division','attention','memory','executive','speedReasoning']
        assert area(page, 'applied').count()==0, 'Applied is excluded by the visible-area policy for this route.'
        if ROUTE=='primary':domains=[d for d in domains if d!='reading']+['geometry','english','literacy']
        if ROUTE=='middle':domains=['middleLanguage','middleReading','middleMath','attention','memory','executive','speedReasoning','applied','english','literacy']
        language_domain='middleLanguage' if ROUTE=='middle' else 'language'
        reading_domain='middleReading' if ROUTE=='middle' else 'literacy' if ROUTE=='primary' else 'reading'
        if ROUTE=='middle':assert page.locator('#schoolHub').count()==0 or not page.locator('#schoolHub').is_visible()
        for level in [1,2,3]:
            for domain in domains:
                page.evaluate('window.__current=null')
                area(page, domain).click();loaded=wait_item()
                if loaded['level']!=level:
                    page.evaluate('window.__current=null')
                    page.locator('#exerciseLevelSelect').select_option(str(level));wait_item()
                keys=[]
                for n in range(10):
                    item=wait_item();answer(item);keys.append(item['contentKey'])
                    assert page.evaluate('__requests.at(-1).level')==item['level']
                    if n<9:
                        page.evaluate('window.__current=null');page.locator('#exerciseNext').click()
                assert all(a!=b for a,b in zip(keys,keys[1:])),(domain,level)
                print(f'PASS: {domain}, start L{level}: ten consecutive real-handler activities',flush=True)
        for focus in ['grammar','spelling','writing']:
            focus_domain=reading_domain if focus=='writing' else language_domain
            area(page, focus_domain).click();wait_item()
            page.evaluate('window.__current=null');page.locator(f'[data-mode="{focus}"]').click()
            for n in range(10):
                item=wait_item()
                if focus=='writing':
                    assert item.get('languageFocus')=='writing' or (item.get('type')=='self' and item.get('responseType')=='written'),item
                else:
                    assert item.get('languageFocus')==focus,item
                answer(item)
                if n<9:
                    page.evaluate('window.__current=null');page.locator('#exerciseNext').click()
        for key in ['es_es','es_mx','es_co','es_ar','es_cl','es_pa','es_cr']:
            workspace(page).locator('#v16ContentLocale').select_option(key)
            page.wait_for_function('(key)=>LearningAPI.contentLocale===key',arg=key)
            for domain in domains:
                page.evaluate('window.__current=null');area(page, domain).click()
                item=wait_item();assert item['localization']['locale']==key;answer(item)
            page.locator('#navMenu [data-section="homework"]').click()
            page.locator('#worksheetAll').click();page.locator('#worksheetQuestions').select_option('20');page.locator('#worksheetCount').select_option('1')
            with page.expect_download(timeout=30000) as download:page.locator('#generateWorksheetsBtn').click()
            path=Path(tmp)/f'{key}.docx';download.value.save_as(path)
            exported=page.evaluate('__exports.at(-1)');items=exported['items'][0]
            assert len(items)==20;assert all(it['localization']['locale']==key for it in items)
            document_integrity(page,doc_accessible_text(path.read_bytes()),items,exported['profile'],key,path.read_bytes())
            print(f'PASS: {key}, {len(domains)} domains and real 20-question DOCX',flush=True)
        area(page, reading_domain).click();wait_item()
        for width in [1280,390]:
            page.set_viewport_size({'width':width,'height':900});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            page.locator('#exercise').screenshot(path=f'/tmp/{ROUTE}-reading-{width}.png')
        assert not errors,errors
        assert sum(assessment_counts.values())==len(domains)*37+30
        if ROUTE=='middle':assert assessment_counts['self']>0
        print('ASSESSMENT:',assessment_counts,flush=True)
        print(f'PASS: {len(domains)*37+30} answered/self-assessed interactive activities, seven complete DOCX files; no page errors',flush=True)
        browser.close()
finally:
    server.shutdown();worker.terminate();worker.wait(timeout=10)

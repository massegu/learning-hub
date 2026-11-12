"""Real school-age Edge handler → client → DOCX. Default junior; pass primary for 10–12 or middle for 13–15.
Only a local fake SDK/account/database is used; external services are blocked.
"""
import functools,http.server,json,re,subprocess,tempfile,threading,sys,zipfile,io
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT,SDK,QuietHandler,doc_text, area, training_areas, wait_for_area

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
def document_integrity(page,nodes,items,key,docx_bytes):
    models=page.evaluate('''({items,key})=>items.map(it=>LocaleContent.localizeModel(ActivityModel.printable(it,__profiles[0]),key,it.domain,it))''',dict(items=items,key=key))
    with zipfile.ZipFile(io.BytesIO(docx_bytes)) as archive:
        media_count=sum(name.startswith('word/media/') for name in archive.namelist())
    visual_count=sum(stimulus['type'] in ['photo','photoPair','document'] for model in models for stimulus in model['stimulus'])
    if visual_count:assert media_count>=visual_count,(key,visual_count,media_count)
    for i,model in enumerate(models):
        start=nodes.index(f'ACTIVIDAD {i+1}');stop=nodes.index(f'ACTIVIDAD {i+2}') if i+1<len(items) else len(nodes)
        block=nodes[start:stop];q=block.index(model['question'])
        for stimulus in model['stimulus']:
            if stimulus['type']=='text':values=[stimulus['text']]
            elif stimulus['type']=='list':values=stimulus['items']
            elif stimulus['type']=='table':values=[v for row in stimulus['rows'] for v in row]
            else:
                assert stimulus['type'] in ['photo','photoPair','document'],(key,i,stimulus)
                values=[]
            for value in values:
                labels=[value]
                if items[i]['type'] in ['memoryReveal','executed'] and stimulus.get('presentation') in ['count','cards','sequence']:
                    labels.append(page.evaluate('(value)=>ActivityModel.memoryLabel(value)',value))
                def same_visible_label(candidate,label):
                    candidate=re.sub(r'^\d+\.\s*','',candidate).strip()
                    normalize=lambda text:re.sub(r'^(?:el|la|los|las|un|una|unos|unas)\s+','',text.strip(),flags=re.I).casefold()
                    return candidate==label or normalize(candidate)==normalize(label)
                assert any(same_visible_label(s,label) for s in block[:q] for label in labels),(key,i,value)
        for value in model['options']+model['tokens']:assert any(s.endswith('. '+value) for s in block),(key,i,value)
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
        page.wait_for_selector('#homeAreaLanding:not(.hidden)');page.wait_for_timeout(1500);page.clock.install()
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
                assessment=page.locator('#textAnswerArea').inner_text()
                assert all(criterion in visual+assessment for criterion in item['writingRubric'])
            page.wait_for_function('(document.querySelectorAll("#exerciseOptions button:not(:disabled)").length>0)||(__current?.type==="self"&&!document.querySelector("#textAnswerArea").classList.contains("hidden"))')
            return item
        writing_capture=[]
        assessment_counts={'automatic':0,'self':0}
        def answer(item):
            assessment_counts['self' if item['type']=='self' else 'automatic']+=1
            if item.get('recallSequence'):
                page.locator('#startMemorySequence').click()
                page.clock.run_for(len(item['recallSequence'])*(item['sequenceStepMs']+250)+50)
                page.wait_for_selector('#exerciseOptions .sequence-workspace')
            elif item.get('photoTask',{}).get('kind')=='recall':
                page.locator('#showMemoryPhoto').click()
                page.wait_for_function('document.querySelector("#exerciseVisual img")?.complete&&document.querySelector("#exerciseVisual img").naturalWidth>0')
                page.clock.fast_forward(item['revealMs']+50)
                page.wait_for_function('document.querySelectorAll("#exerciseOptions .option-btn").length>0')
            elif item.get('audioMemory'):
                page.evaluate('''()=>{window.SpeechSynthesisUtterance=function(text){this.text=text};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},getVoices(){return []},speak(voice){queueMicrotask(()=>voice.onend?.())}}})}''')
                page.locator('#playMemoryAudio').click()
                page.wait_for_function('document.querySelector("#answerMemoryAudio")?.disabled===false')
                page.locator('#answerMemoryAudio').click()
                page.wait_for_selector('#exerciseOptions .option-btn')
            if item['type']=='order' or item.get('memoryResponse')=='order':
                page.wait_for_selector('#exerciseOptions .sequence-workspace')
                for token in item['answer']:page.locator('#exerciseOptions').get_by_role('button',name=token,exact=True).click()
                page.locator('#orderCheck').click()
            elif item['type']=='photoDifference' and item['level']>=3:
                page.evaluate('''answers=>{for(const value of answers){const option=[...document.querySelectorAll('#exerciseOptions .multi-option')].find(button=>button.dataset.value===value);if(!option)throw Error('Opción fotográfica no encontrada: '+value);const mark=[...document.querySelectorAll('.photo-hit')].find(button=>button.dataset.value===option.dataset.value);if(!mark)throw Error('Marca visual no encontrada: '+value);mark.click()}}''',item['answers'])
                page.locator('#multiCheck').click()
            elif item['type'] in ['memoryMulti','multiSelect','documentReview','photoDifference'] or item.get('memoryResponse')=='multiple' or item.get('responseType')=='multiple':
                page.wait_for_selector('#exerciseOptions .multi-option')
                for value in item.get('answers',[]):page.locator('#exerciseOptions').get_by_role('button',name=value,exact=True).click()
                if page.locator('#multiCheck').is_visible():page.locator('#multiCheck').click()
            elif item.get('memoryResponse')=='spatial':
                value=item.get('a') or item.get('answer')
                if isinstance(value,list):value=value[0]
                page.locator('#exerciseOptions').get_by_role('button',name=str(value),exact=True).click()
            elif item.get('speedTask'):
                page.locator('#practiceSpeedTrial').click()
                page.wait_for_selector('#exerciseOptions .speed-choice')
                page.locator('#exerciseOptions').get_by_role('button',name=item['a'],exact=True).click()
            elif item['type']=='self':
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
            else:
                page.locator('#exerciseOptions').get_by_role('button',name=item['a'],exact=True).click()
            page.wait_for_function('document.querySelector("#exerciseFeedback").classList.contains("ok")')
        assert page.locator('#homeAreaLanding').is_visible()
        domains=['language','reading','division','attention','memory','executive','speedReasoning','applied','social']
        if ROUTE=='primary':domains=[d for d in domains if d!='reading']+['geometry','english','literacy']
        if ROUTE=='middle':domains=['middleLanguage','middleReading','middleMath','attention','memory','executive','speedReasoning','applied','english','literacy','social']
        visible_domains={entry['domain'] for entry in training_areas(page)}
        assert visible_domains<=set(domains), (ROUTE,visible_domains-set(domains))
        domains=[domain for domain in domains if domain in visible_domains]
        language_domain='middleLanguage' if ROUTE=='middle' else 'language'
        reading_domain='middleReading' if ROUTE=='middle' else 'literacy' if ROUTE=='primary' else 'reading'
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
            area(page, reading_domain if focus=='writing' else language_domain).click();wait_item()
            page.evaluate('window.__current=null');page.locator(f'[data-mode="{focus}"]').click()
            for n in range(10):
                item=wait_item()
                if focus=='writing':
                    assert item.get('languageFocus')=='writing' or item['type']=='self' or item.get('responseType')=='written' or item['type']=='order',item
                else:assert item['languageFocus']==focus
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
            docx_bytes=path.read_bytes()
            document_integrity(page,doc_text(docx_bytes),items,key,docx_bytes)
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

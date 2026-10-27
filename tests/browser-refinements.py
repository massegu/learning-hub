"""Layout/correctness coverage through the real app, with a simulated SDK.
Deterministic family selection is used only to cover every affected layout.
Ordinary consecutive selection is covered by browser-smoke.py and Node tests.
"""
from pathlib import Path
import functools,http.server,json,re,tempfile,threading
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT,SDK,QuietHandler,doc_text

server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
WIDTHS=[1920,1440,1280,1024,768,390]
TARGETS={'division':range(10),'attention':range(7),'executive':range(7),'memory':range(4),'applied':range(8)}
metrics=[]
try:
    with tempfile.TemporaryDirectory(prefix='lh-refinement-') as tmp,sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':1280,'height':900},device_scale_factor=1)
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        def external(route):
            url=route.request.url
            if 'supabase-js' in url:route.fulfill(body=SDK,content_type='application/javascript')
            elif '/docx@8.5.0/' in url:route.fulfill(body=(ROOT/'node_modules/docx/build/index.umd.js').read_bytes(),content_type='application/javascript')
            elif '/jszip@3.10.1/' in url:route.fulfill(body=(ROOT/'node_modules/jszip/dist/jszip.min.js').read_bytes(),content_type='application/javascript')
            else:route.abort()
        page.route(re.compile(r'^https://'),external)
        page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#v16ContentLocale');page.wait_for_timeout(3500)
        page.evaluate("""()=>{
          const adapt=EarlyContent.adaptResponse,gate=ActivityModel.forDelivery;
          EarlyContent.adaptResponse=(res,payload,profile)=>{
            const result=adapt(res,payload,profile);
            if(payload.kind==='exercise'&&ContentPolicy.forProfile(profile)&&window.__family?.startsWith(payload.domain+'-')){
              result.items=[EarlyContent.pool(payload.domain,window.__fixedLevel).find(it=>it.ageProfile.family===window.__family)];
            }
            return result;
          };
          ActivityModel.forDelivery=(it,...args)=>{const result=gate(it,...args);window.__current=JSON.parse(JSON.stringify(it));return result;};
          const generate=WorksheetGenerator.generate;
          WorksheetGenerator.generate=async(items,profile)=>{window.__export=JSON.parse(JSON.stringify({items,profile}));return generate(items,profile);};
        }""")
        def render(domain,family,level):
            page.evaluate('({family,level})=>{window.__family=family;window.__fixedLevel=level;}',dict(family=f'{domain}-{family}',level=level))
            before=page.evaluate('__requests.length')
            page.locator(f'#navMenu [data-subject="{domain}"]').click()
            page.wait_for_function('(before)=>__requests.length>before && __current?.ageProfile.family===__family && __current?.level===__fixedLevel && document.querySelector("#exercisePrompt").textContent===__current.q && document.querySelector("#exerciseVisual").children.length>0',arg=before)
            # Exercise the actual level control too: the deterministic fixture
            # must agree with the outgoing request and the visible level label.
            if page.locator('#exerciseLevelSelect').input_value()!=str(level):
                page.evaluate('window.__current=null')
                page.locator('#exerciseLevelSelect').select_option(str(level))
                page.wait_for_function('__current?.ageProfile.family===__family && __current?.level===__fixedLevel && document.querySelector("#exercisePrompt").textContent===__current.q && document.querySelector("#exerciseVisual").children.length>0')
            assert page.locator('#exerciseLevelSelect').input_value()==str(level)
            assert page.evaluate('__requests.at(-1).level')==level
            return page.evaluate('__current')
        def layout():
            result=page.evaluate("""()=>{
              const card=document.querySelector('.exercise-card'),root=document.querySelector('#exerciseOptions'),r=card.getBoundingClientRect();
              const targets=[document.querySelector('#exercisePrompt'),document.querySelector('#exerciseVisual'),root,...root.querySelectorAll('button'),...document.querySelectorAll('#exerciseVisual td,.stimulus-unit')].filter(e=>e.getBoundingClientRect().width);
              return {pageOverflow:document.documentElement.scrollWidth-innerWidth,cardOverflow:card.scrollWidth-card.clientWidth,
                escaped:targets.filter(e=>{const b=e.getBoundingClientRect();return b.left<r.left-1||b.right>r.right+1}).map(e=>e.className),
                tiny:targets.filter(e=>e.tagName==='BUTTON'&&e.getBoundingClientRect().height<44).length,
                badSvg:[...document.querySelectorAll('#exerciseVisual svg,#exerciseOptions svg')].filter(e=>{const b=e.getBoundingClientRect();return Math.abs(b.width-b.height)>1||b.width<28}).length,
                optionsWidth:root.getBoundingClientRect().width,
                workspaceWidth:root.querySelector('.sequence-workspace')?.getBoundingClientRect().width};
            }""")
            assert result['pageOverflow']<=1,result
            assert result['cardOverflow']<=1,result
            assert not result['escaped'],result
            assert not result['tiny'] and not result['badSvg'],result
            if result['workspaceWidth'] is not None:assert abs(result['workspaceWidth']-result['optionsWidth'])<2,result
            return result
        for width in WIDTHS:
            page.set_viewport_size({'width':width,'height':900})
            for level in [1,2,3]:
                for domain,families in TARGETS.items():
                    for family in families:
                        it=render(domain,family,level);result=layout()
                        metrics.append(dict(width=width,level=level,domain=domain,family=family,**result))
                        if domain=='division' and family==0:
                            assert page.locator('#exerciseVisual .count-units .stimulus-unit').count()==int(it['a'])
                            assert page.locator('#exerciseVisual .count-units svg circle').count()==int(it['a'])
                            assert page.locator('#exerciseVisual ul,#exerciseVisual li').count()==0
                        if domain=='attention' and family==3:
                            assert page.locator('.early-model').count()==1
                            assert page.locator('.early-comparison tr').count()==(2 if level==1 else 3)
                            assert 'E14-O6' not in page.locator('#exerciseVisual').inner_text()
                        if width==1280 and level==3 and (domain,family) in [('attention',3),('executive',2),('applied',0),('memory',0)]:page.locator('#exercise').screenshot(path=f'/tmp/early-refinement-{domain}.png')
            print(f'PASS: {width}px / 100% zoom: all 36 affected families at all three levels, no overflow/squashed controls',flush=True)
        # Real timer and scoring with 4 canonical objects at level 3.
        page.set_viewport_size({'width':1280,'height':900});it=render('memory',0,3)
        assert page.locator('#exerciseVisual .stimulus-unit').count()==4
        page.wait_for_function('document.querySelectorAll("#exerciseOptions .option-btn").length>0',timeout=13000)
        assert page.locator('#exerciseVisual').inner_text()==''
        page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
        assert page.locator('#exerciseFeedback').inner_text()
        # Counting buttons score the canonical value, independently of SVG text.
        it=render('division',0,3);page.locator('#exerciseOptions').get_by_role('button',name=it['a'],exact=True).click()
        assert page.locator('#exerciseOptions .correct').count()==1
        # Other ages retain ordinary remote content and broad desktop/mobile layout.
        for band in ['junior','primary','middle','teen']:
            workspace(page).locator('#profileSelect').select_option(band)
            for width in [1440,1024,390]:
                page.set_viewport_size({'width':width,'height':900});page.locator('#navMenu [data-subject="attention"]').click()
                page.wait_for_function('document.querySelector("#exercisePrompt").textContent==="¿Qué criterio ayuda más?"')
                assert not page.locator('#exercise').evaluate('(e)=>e.classList.contains("early-primary")')
                assert 'F15-P7' in page.locator('#exerciseVisual').inner_text();layout()
        print('PASS: timed 4-object recall, numeric answer scoring and all four older routes',flush=True)
        # Actual 20-question DOCX retains all canonical facts and response material.
        page.set_viewport_size({'width':1280,'height':900});workspace(page).locator('#profileSelect').select_option('early')
        page.locator('#navMenu [data-section="homework"]').click()
        page.locator('#worksheetAll').click();page.locator('#worksheetCount').select_option('1');page.locator('#worksheetQuestions').select_option('20')
        with page.expect_download(timeout=30000) as download:page.locator('#generateWorksheetsBtn').click()
        file=Path(tmp)/'refined.docx';download.value.save_as(file);nodes=doc_text(file.read_bytes())
        exported=page.evaluate('__export.items[0]')
        for i,it in enumerate(exported):
            start=nodes.index(f'ACTIVIDAD {i+1}');stop=nodes.index(f'ACTIVIDAD {i+2}') if i+1<len(exported) else len(nodes)
            block=nodes[start:stop];q=block.index(it.get('memoryQuestion') or it['q'])
            for s in it['stimulus']:
                if s.get('label'):assert s['label'] in block[:q]
                values=[s['text']] if s['type']=='text' else s['items'] if s['type']=='list' else [v for row in s['rows'] for v in row]
                for value in values:assert any(x==value or re.match(r'^\d+\. ',x) and x.endswith(value) for x in block[:q]),(i,value)
            for value in it.get('opts',[])+it.get('tokens',[]):assert any(x.endswith('. '+value) for x in block)
        assert not errors,errors
        print('PASS: real illustrated 20-question DOCX, every stimulus/label/option before its question or response area',flush=True)
        Path('/tmp/early-refinement-browser-audit.json').write_text(json.dumps(metrics,indent=2))
        browser.close()
finally:server.shutdown()

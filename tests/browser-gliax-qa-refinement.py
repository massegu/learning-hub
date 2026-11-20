"""Exercise the actual local Edge handler and capture both dashboard versions."""
import importlib.util
import os
from pathlib import Path
import threading

from playwright.sync_api import expect, sync_playwright
from browser_support import ROOT, area, workspace

EVIDENCE = Path(os.getenv('GLIAX_REFINEMENT_EVIDENCE', ROOT / '.test-evidence'))
BASE = os.getenv('GLIAX_REFINEMENT_BASE')
EVIDENCE.mkdir(exist_ok=True, parents=True)


def preview(root):
    spec = importlib.util.spec_from_file_location('preview', root / 'tools/review-preview.py')
    review = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(review)
    return review.ReviewServer(('127.0.0.1', 0), review.prepare())


def new_page(browser, server):
    page = browser.new_page(viewport={'width': 1440, 'height': 1040})
    page.add_init_script('''(() => {
      const rows=[];
      const subjects=['attention','memory','executive','division','geometry','communication','speedReasoning'];
      for(let day=0;day<36;day++)for(let i=0;i<((day*11+7)%9);i++){
        const index=(day+i)%7, ts=new Date(Date.now()-day*86400000).toISOString();
        const metric=(modality)=>JSON.stringify({schema:'gliax.exercise-metrics.v1',modality,definition_version:2,duration_ms:3200});
        const details=['attention_photo_differences','executed_memory_spatial','cognitive_change','calculation','geometry',i%3? 'communication_feedback':metric('communication_supervised'),metric('falling_words')];
        rows.push({subject:subjects[index],ts,detail:details[index],level:i%2+1,points:i%4?3:0,correct:index===6||(index===5&&i%3===0)?null:Boolean(i%4),sessionId:'fictional-'+day});
      }
      localStorage.setItem('__mock_profiles', JSON.stringify([{id:'primary',name:'Perfil de prueba',age_band:'primary',progress:{initialLevel:1,history:rows.reverse()}}]));
    })()''')
    page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
    workspace(page).locator('#profileSelect').select_option('primary')
    return page


def capture_progress(page, tag):
    workspace(page).locator('#navMenu [data-section="progress"]').click()
    expect(page.locator('#progress')).to_be_visible()
    page.locator('#progress').screenshot(path=EVIDENCE / f'progreso-{tag}-escritorio.png')
    page.set_viewport_size({'width': 390, 'height': 844})
    expect(page.locator('#progress')).to_be_visible()
    page.locator('#progress').screenshot(path=EVIDENCE / f'progreso-{tag}-movil.png')
    page.set_viewport_size({'width': 1440, 'height': 1040})


def check_latest(page, **expected):
    page.wait_for_function('keys=>{const last=window.loadedItems.at(-1);return last && Object.entries(keys).every(([k,v])=>last.request[k]===v)}', arg=expected)
    return page.evaluate('loadedItems.at(-1).item')


def solve_cognitive(page,item):
    response=page.locator('#exerciseOptions')
    response.get_by_role('button',name='Empezar',exact=True).click()
    if item.get('execution'):
        task=item['execution']
        tray=response.locator('.plan-available' if task.get('choices') else '.executed-choices')
        for step in task['answer']:
            tray.get_by_role('button',name=step,exact=True).click()
        response.get_by_role('button',name='Comprobar plan' if task.get('choices') else 'Comprobar',exact=True).click()
        return
    task=item['cognitiveTask']
    kind=task['kind']
    if kind=='words':
        response.locator('#cognitiveWord').fill(task['answer'][0])
        response.get_by_role('button',name='Comprobar palabra').click()
    elif kind in ['information','contradiction']:
        for key in task['answer']:
            response.locator(f'input[value="{key}"]').check()
        response.get_by_role('button',name='Comprobar',exact=True).click()
    elif kind=='deduction':
        while response.get_by_role('button',name='Ver siguiente pista').is_enabled():
            response.get_by_role('button',name='Ver siguiente pista').click()
        target=next(i for i,card in enumerate(task['candidates'],1) if card['id']==task['answer'][0])
        response.get_by_role('button',name=f'Elegir tarjeta {target}',exact=True).click()
    elif kind=='change':
        response.get_by_role('button',name=task['replacement'],exact=True).click()
        expect(response.locator('.gliax-instruction + .cognitive-choices')).to_be_visible()
        for step in task['answer']:
            response.get_by_role('button',name=step,exact=True).click()
        response.get_by_role('button',name='Comprobar plan',exact=True).click()
    else:
        raise AssertionError(f'Sin recorrido de prueba para {kind}')


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.getenv('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),args=['--no-sandbox'])
    if BASE:
        with preview(Path(BASE)) as base:
            threading.Thread(target=base.serve_forever, daemon=True).start()
            before = new_page(browser, base)
            capture_progress(before, 'antes')
            before.close()
            base.shutdown()
    with preview(ROOT) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            page = new_page(browser,server)
            errors=[]
            page.on('pageerror',lambda error: errors.append(str(error)))
            capture_progress(page,'despues')
            expect(page.locator('.progress-kpi')).to_have_count(3)
            page.locator('#progressArea').select_option('Matemáticas')
            page.locator('#progressPeriod').select_option('14')
            expect(page.locator('#progressArea')).to_have_value('Matemáticas')
            expect(page.locator('#progressPeriod')).to_have_value('14')
            assert int(page.locator('.progress-kpi').first.locator('strong').inner_text())>0
            page.evaluate('''()=>{
              window.loadedItems=[];
              const real=LearningAPI.requestContent;
              LearningAPI.requestContent=async request=>{
                const response=await real(request);
                if(response.items?.length)loadedItems.push({request,item:response.items[0]});
                return response;
              };
            }''')
            area(page,'communication').click()
            page.locator('#digitalModeButton').click()
            for fmt in ['message','post','clip','story','search','notice','app']:
                page.locator('#digitalFamilySelect').select_option(fmt)
                item=check_latest(page,domain='communication',digital_family=fmt)
                assert item['simulation']['format']==fmt and item['domain']=='communication'
                expect(page.locator('.digital-stimulus')).to_be_visible()
            page.set_viewport_size({'width':390,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
            page.locator('#digitalFamilySelect').select_option('message')
            check_latest(page,domain='communication',digital_family='message')
            page.locator('.digital-stimulus').screenshot(path=EVIDENCE/'mensajeria-movil.png')
            page.set_viewport_size({'width':1440,'height':1040})
            area(page,'attention').click()
            for width in [1440, 834, 390]:
                page.set_viewport_size({'width':width,'height':900})
                page.locator('#exerciseModalities').screenshot(path=EVIDENCE/f'selector-{width}.png')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
                assert page.locator('#exerciseModalities button:visible').evaluate_all('els=>els.every(el=>el.offsetHeight>=44 && el.offsetHeight<=66)')
            page.set_viewport_size({'width':1440,'height':1040})
            area(page,'memory').click()
            visual=check_latest(page,domain='memory',memory_visual_only=True)
            assert not visual.get('photoTask')
            page.get_by_role('button',name='Escenas cotidianas').click()
            photo=check_latest(page,domain='memory',photos_only=True)
            assert photo['photoTask']['kind']=='recall'
            first_delivery=page.evaluate('loadedItems.length')
            page.locator('#executedMode').click()
            seen=set()
            for i in range(3):
                page.wait_for_function('n=>loadedItems.length>=n && loadedItems.at(-1)?.request.executed_family',arg=first_delivery+i+1)
                item=page.evaluate('loadedItems.at(-1).item')
                kind=item['execution']['kind']
                assert kind not in seen,seen
                seen.add(kind)
                page.locator('#exerciseOptions').get_by_role('button',name='Empezar',exact=True).click()
                for answer in item['execution']['answer']:
                    if kind=='spatial':
                        page.locator('#exerciseOptions .executed-cell').nth(int(answer)).click(timeout=15000)
                    else:
                        page.locator('#exerciseOptions').get_by_role('button',name=answer,exact=True).click(timeout=15000)
                page.locator('#exerciseOptions').get_by_role('button',name='Comprobar',exact=True).click()
                expect(page.locator('#exerciseOptions button')).to_have_count(0)
                expect(page.locator('.memory-solution')).to_be_visible()
                expect(page.locator('#exerciseFeedback')).to_have_class('feedback ok')
                page.locator('#exerciseNext').click()
            assert seen=={'serial','spatial','update'}
            expect(page.locator('#home')).to_be_visible()
            area(page,'executive').click()
            page.locator('#activityOptions summary').click()
            page.locator('#exerciseLevelSelect').select_option('2')
            page.get_by_role('button',name='Resuelve con documentos',exact=True).click()
            check_latest(page,domain='executive',documents_only=True)
            started=page.evaluate('loadedItems.length')
            page.get_by_role('button',name='Sesión aleatoria',exact=True).click()
            expect(page.locator('#guidedSessionProgress')).to_contain_text('Actividad 1 de')
            count=int(page.locator('#guidedSessionProgress').inner_text().split(' de ')[1].split(' ·')[0])
            families,domains=set(),set()
            for i in range(count):
                page.wait_for_function('n=>loadedItems.length>=n',arg=started+i+1)
                delivered=page.evaluate('loadedItems.at(-1)')
                req,item=delivered['request'],delivered['item']
                assert req.get('cognitive_family') or req.get('executed_family')
                assert not (req.get('documents_only') or req.get('interaction_only') or req.get('photos_only'))
                families.add(req.get('cognitive_family') or req.get('executed_family'))
                domains.add(req['domain'])
                solve_cognitive(page,item)
                expect(page.locator('#exerciseFeedback')).to_have_class('feedback ok')
                page.locator('#exerciseNext').click()
            expect(page.locator('#home')).to_be_visible()
            assert len(families)==count and len(domains)>=2
            expect(page.locator('.redesign-area-card[data-area="geometry"]')).to_have_count(0)
            area(page,'division').click()
            expect(page.locator('#exerciseHeading')).to_have_text('Matemáticas')
            page.locator('#mathDomainSwitch [data-math-domain="geometry"]').click()
            geometry=check_latest(page,domain='geometry')
            assert geometry['domain']=='geometry'
            expect(page.locator('#exerciseHeading')).to_have_text('Matemáticas')
            assert not errors, errors
        finally:
            server.shutdown()
    browser.close()
print('PASS: Progreso responsive y filtros, siete pantallas reales, botones en tres anchos y sesiones completas de memoria y varias áreas mediante el handler Edge local.')

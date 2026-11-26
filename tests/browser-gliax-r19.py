"""R19 through the app and local Edge, with synthetic Auth and storage."""
import importlib.util
import json
import os
from pathlib import Path
import threading

from playwright.sync_api import expect, sync_playwright
from browser_support import ROOT, area, workspace
from browser_math_helpers import solve_math

spec = importlib.util.spec_from_file_location('preview', ROOT / 'tools/review-preview.py')
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)
evidence = Path(os.environ.get('GLIAX_R19_EVIDENCE', ROOT / '.test-evidence'))
evidence.mkdir(parents=True, exist_ok=True)


def track(page):
    page.evaluate('''() => {
      window.r19 = [];
      const real = LearningAPI.requestContent;
      LearningAPI.requestContent = async request => {
        const response = await real(request);
        if (request.kind === 'exercise' && response.items?.length) r19.push({request,item:response.items[0]});
        return response;
      };
    }''')


def latest(page, domain, **fields):
    page.wait_for_function('''([domain,fields])=>window.r19.at(-1)?.request.domain===domain &&
      Object.entries(fields).every(([key,value])=>window.r19.at(-1)?.request[key]===value)''',
      arg=[domain, fields])
    return page.evaluate('r19.at(-1).item')


def check_reading_aids(page):
    test = page.evaluate('''()=>{
      const block=document.createElement('div');
      block.innerHTML=ActivityModel.interactiveStimulus([
        {type:'text',text:'El gorrión vuela sobre el río. Visitamos la biblioteca.'},
        {type:'text',presentation:'poster',text:'La biblioteca cierra a las ocho.'}
      ],{structured:true,readerText:true});
      document.querySelector('#exerciseVisual').append(block);
      block.id='readerR19Fixture';
      const poster=block.querySelector('.reading-poster');
      const passage=block.querySelector('[data-reader-text]');
      const before=poster.outerHTML;
      const cleanup=ReaderAssist.mount(block);
      block.querySelector('[data-action=syllables]').click();
      block.querySelector('[data-action=guide]').click();
      const result={
        aids:CSS.highlights.get('gliax-syllable-a')?.size>0&&CSS.highlights.get('gliax-reading-line')?.size>0,
        plain:passage.textContent==='El gorrión vuela sobre el río. Visitamos la biblioteca.',
        poster:before===poster.outerHTML&&!poster.querySelector('[data-reader-text]'),
        positions:!block.querySelector('.reader-guide-nav').hidden
      };
      block.querySelector('[data-action=syllables]').click();
      result.independent=!CSS.highlights.has('gliax-syllable-a')&&CSS.highlights.has('gliax-reading-line');
      cleanup();
      result.cleaned=!CSS.highlights.has('gliax-reading-line');
      block.remove();
      return result;
    }''')
    assert all(test.values()), test


def check_math(page, item):
    route=solve_math(page,item)
    expect(page.locator('#exerciseNext')).to_be_visible()
    page.wait_for_function('''()=>__profiles.find(p=>p.id==='primary').progress.history?.some(r=>
      typeof r.detail==='string'&&r.detail.includes('math_problem_steps'))''')
    record=page.evaluate('''()=>__profiles.find(p=>p.id==='primary').progress.history.find(r=>r.detail.includes('math_problem_steps'))''')
    metric=json.loads(record['detail'])
    assert record['correct'] is None and metric['definition_version']==2
    assert metric['strategy']==route and metric['interpretation_correct'] is True


def level(page, n):
    options=page.locator('#activityOptions')
    if not options.evaluate('e=>e.open'):
        options.locator('summary').click()
    page.locator('#exerciseLevelSelect').select_option(str(n))


def digital_format(page, domain, fmt, expected_type):
    mode=page.locator('#digitalModeButton')
    if mode.get_attribute('aria-pressed')!='true':
        mode.press('Enter')
        latest(page,domain,digital_only=True)
    for _ in range(22):
        request=page.evaluate('r19.at(-1)')
        item=request['item']
        if request['request'].get('digital_family')==fmt and item['type']==expected_type:
            return item
        n=page.evaluate('r19.length')
        mode.press('Enter')
        page.wait_for_function('n=>r19.length>n && !r19.at(-1).request.digital_only',arg=n)
        mode.press('Enter')
        page.wait_for_function('n=>r19.length>n+1 && r19.at(-1).request.digital_only',arg=n)
    raise AssertionError(f'{fmt} no entregó {expected_type}')


with review.ReviewServer(('127.0.0.1',0),review.prepare()) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1440,'height':1050},reduced_motion='reduce')
            errors=[]
            page.on('pageerror',lambda error: errors.append(str(error)))
            page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
            workspace(page).locator('#profileSelect').select_option('primary')
            track(page)
            area(page,'language').click()
            expect(page.locator('#digitalModeButton')).to_be_hidden()
            for name in ['Gramática','Ortografía','Vocabulario','La palabra que encaja']:
                expect(page.get_by_role('button',name=name,exact=True)).to_be_visible()
            for _ in range(9):
                n=page.evaluate('r19.length')
                page.locator('#wordFitMode').click()
                page.wait_for_function('n=>r19.length>n',arg=n)
                item=latest(page,'language',cognitive_family='words')
                if 'anidar' in item['cognitiveTask'].get('cue',''):break
            else:
                raise AssertionError('La rotación no entregó la actividad de aves.')
            page.locator('#exerciseOptions').get_by_role('button',name='Empezar',exact=True).press('Enter')
            before=page.evaluate("__profiles.find(p=>p.id==='primary').progress.history?.length||0")
            page.locator('#cognitiveWord').fill('especiex')
            page.locator('#exerciseOptions').get_by_role('button',name='Comprobar palabra').press('Enter')
            expect(page.locator('.cognitive-status')).to_contain_text('No puedo comprobar esta palabra automáticamente')
            expect(page.get_by_role('button',name='Continuar sin puntuar')).to_be_visible()
            assert page.evaluate("(__profiles.find(p=>p.id==='primary').progress.history?.length||0)")==before
            page.locator('#cognitiveWord').fill('Gorrión')
            page.locator('#exerciseOptions').get_by_role('button',name='Comprobar palabra').press('Enter')
            expect(page.locator('#exerciseFeedback')).to_contain_text('anidar en árboles')
            page.wait_for_function("before=>(__profiles.find(p=>p.id==='primary').progress.history?.length||0)===before+1",arg=before)
            page.locator('#exerciseNext').press('Enter')
            page.locator('#exerciseOptions').get_by_role('button',name='Empezar',exact=True).press('Enter')
            page.locator('#cognitiveWord').fill('especiex')
            page.locator('#exerciseOptions').get_by_role('button',name='Comprobar palabra').press('Enter')
            page.get_by_role('button',name='Continuar sin puntuar').press('Enter')
            expect(page.locator('#exerciseNext')).to_be_visible()
            assert page.evaluate("(__profiles.find(p=>p.id==='primary').progress.history?.length||0)")==before+1
            check_reading_aids(page)

            area(page,'communication').click()
            digital_button=page.locator('#digitalModeButton')
            def contrast():
                return digital_button.evaluate(r'''button=>{
                  const style=getComputedStyle(button);
                  const luminance=color=>color.match(/\d+/g).slice(0,3)
                    .map(value=>Number(value)/255)
                    .map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4)
                    .reduce((total,value,index)=>total+value*[.2126,.7152,.0722][index],0);
                  const values=[luminance(style.color),luminance(style.backgroundColor)];
                  return (Math.max(...values)+.05)/(Math.min(...values)+.05);
                }''')
            assert contrast()>=4.5
            digital_button.press('Enter')
            expect(digital_button).to_have_attribute('aria-pressed','true')
            assert contrast()>=4.5
            assert not page.locator('#digitalFamilySelect').count()
            for index,(fmt,layout) in enumerate([('message','.r193-thread'),('post','.social-feed'),('clip','.digital-clip-frame'),
                               ('story','.story-timeline'),('search','.r193-hits'),('notice','.settings-log'),('app','.r193-calendar-grid')]):
                if index:
                    page.locator('#exerciseOptions .option-btn').first.click()
                    page.locator('#exerciseNext').press('Enter')
                item=latest(page,'communication',digital_family=fmt)
                assert item['contentKey'].startswith('digital-v2:')
                screen=page.locator('#exerciseVisual .digital-stimulus, #exerciseVisual .r193-app')
                expect(screen.locator(layout)).to_be_visible()
                assert 'simulación' not in screen.inner_text().lower()
                if fmt=='search':
                    field=screen.get_by_role('searchbox',name='Buscar en estos resultados')
                    initial=screen.locator('.r193-hit').count()
                    field.fill('no-contiene-este-texto')
                    field.press('Enter')
                    expect(screen.get_by_role('status')).to_have_text('Sin coincidencias')
                    assert screen.locator('.r193-hit').count()==0
                    field.fill('')
                    assert screen.locator('.r193-hit').count()==initial
                    screen.get_by_role('button',name='Oficiales',exact=True).click()
                    assert screen.locator('.r193-hit').count()<initial
                    screen.get_by_role('button',name='Todas las fuentes',exact=True).click()
                    first_result=screen.locator('.r193-result-link').first
                    first_result.press('Enter')
                    expect(first_result).to_have_attribute('aria-expanded','true')
                    expect(screen.get_by_role('complementary',name='Vista de la fuente')).to_be_focused()
                if fmt=='app':
                    expect(screen.get_by_role('button',name='Mié 20 de mayo de 2026')).to_have_attribute('aria-pressed','true')
                    screen.get_by_role('button',name='Semana siguiente').press('Enter')
                    expect(screen.locator('.r193-event')).to_have_count(0)
                    screen.get_by_role('button',name='Semana anterior').press('Enter')
                    entry=screen.locator('.r193-event').first
                    entry.press('Enter')
                    expect(entry).to_have_attribute('aria-pressed','true')
                    expect(screen.get_by_role('region',name='Detalle del evento')).to_contain_text('09:15')
                if fmt=='clip':
                    summary=screen.get_by_text('Subtítulos y comentarios',exact=True)
                    summary.press('Enter');expect(screen.locator('details')).not_to_have_attribute('open','')
                    summary.press('Enter')
                for width in (1440,834,390):
                    page.set_viewport_size({'width':width,'height':900})
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                    screen.screenshot(path=evidence/f'{fmt}-{width}.png')
                page.set_viewport_size({'width':1440,'height':1050})

            area(page,'executive').click()
            level(page,3)
            order=digital_format(page,'executive','app','order')
            agenda=page.get_by_role('region',name='Agenda de equipo')
            for i, (title, detail) in enumerate(order['stimulus'][0]['rows'][1:]):
                agenda.locator('.r193-event').nth(i).press('Enter')
                expect(agenda.get_by_role('region',name='Detalle del evento')).to_contain_text(detail)
            for value in order['answer']:
                page.locator('.word-token').filter(has_text=value).click()
            page.locator('#orderCheck').press('Enter')
            expect(page.locator('#exerciseFeedback')).to_contain_text('Secuencia correcta')

            area(page,'literacy').click()
            level(page,3)
            contradiction=digital_format(page,'literacy','clip','digitalContradiction')
            for value in contradiction['answers']:
                page.get_by_role('button',name=value,exact=True).press('Enter')
            page.locator('#multiCheck').press('Enter')
            expect(page.locator('#exerciseFeedback')).to_contain_text('se queda en casa')

            area(page,'literacy').click()
            level(page,2)
            completion=digital_format(page,'literacy','search','digitalCompletion')
            search=page.get_by_role('region',name='Lupa')
            search.get_by_role('button',name='Oficiales',exact=True).press('Enter')
            search.locator('.r193-result-link').first.press('Enter')
            expect(search.get_by_role('complementary',name='Vista de la fuente')).to_contain_text(completion['a'])
            page.locator('#digitalCompletion').fill(completion['a'].upper())
            page.get_by_role('button',name='Comprobar',exact=True).press('Enter')
            expect(page.locator('#exerciseFeedback')).to_contain_text('agenda oficial')

            area(page,'communication').click()
            level(page,3)
            digital_format(page,'communication','message','self')
            page.locator('#textAnswerInput').fill('Respuesta ficticia para revisión.')
            page.locator('#textAnswerCheck').press('Enter')
            expect(page.locator('#selfAssessment')).to_be_visible()
            page.get_by_role('button',name='Revisar con apoyo').press('Enter')

            area(page,'division').click()
            expect(page.locator('#exerciseHeading')).to_have_text('Matemáticas')
            assert not page.locator('[data-math-domain="geometry"]').count()
            page.locator('#mathProblemMode').press('Enter')
            item=latest(page,'division',math_problem=True,math_problem_version=2)
            expect(page.locator('.math-sequence')).to_be_visible()
            page.locator('#exercise').screenshot(path=evidence/'problemas-escritorio.png')
            page.set_viewport_size({'width':390,'height':844})
            page.locator('#exercise').screenshot(path=evidence/'problemas-movil.png')
            check_math(page,item)
            page.set_viewport_size({'width':1440,'height':1050})
            area(page,'speedReasoning').click()
            page.get_by_role('button',name='Palabras en caída').press('Enter')
            game=latest(page,'speedReasoning',cognitive_family='falling')
            expect(page.locator('#exercisePrompt')).to_have_text('Escribe cada palabra tal como aparece')
            page.locator('.falling-toggle').press('Enter')
            for word in game['cognitiveTask']['prompts']:
                page.locator('#fallingInput').fill(word)
            expect(page.locator('.falling-settings')).to_be_hidden()
            expect(page.locator('.falling-form')).to_be_hidden()
            expect(page.locator('#exerciseFeedback')).to_contain_text('correctas')
            expect(page.locator('#exerciseNext')).to_be_visible()
            workspace(page).locator('#navMenu [data-section="progress"]').click()
            expect(page.get_by_role('heading',name='Actividad en el tiempo')).to_be_visible()
            expect(page.locator('#sessionEvolution table')).to_be_visible()
            expect(page.locator('#sessionEvolution svg')).to_have_count(0)
            page.locator('#progress').screenshot(path=evidence/'progreso-escritorio.png')
            assert not errors,errors
            browser.close()
        print('PASS: palabra, casos neutros, lector selectivo, siete pantallas en tres anchuras, problemas, cierre de mecanografía y Progreso.')
    finally:
        server.shutdown()

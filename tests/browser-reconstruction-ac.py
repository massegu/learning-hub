"""GLIAX A–C through Chromium and the local Edge handler with fictitious profiles."""
import importlib.util
import json
import os
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright
from browser_support import ROOT, area, workspace

spec = importlib.util.spec_from_file_location('review', ROOT / 'tools/review-preview.py')
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)
server = review.ReviewServer(('127.0.0.1', 0), review.prepare())
threading.Thread(target=server.serve_forever, daemon=True).start()

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=os.environ.get('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'),
            args=['--no-sandbox']
        )
        context = browser.new_context(viewport={'width': 1360, 'height': 960}, has_touch=True)
        context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(
            f'http://127.0.0.1:{server.server_port}/'
        ) else route.abort())
        context.add_init_script("""(() => {
          window.__voices = [];
          Object.defineProperty(speechSynthesis, 'speak', {value(voice) {
            __voices.push({volume: voice.volume, rate: voice.rate});
            setTimeout(()=>voice.onend?.(), 20);
          }});
        })();""")
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
        workspace(page).locator('#profileSelect').select_option('primary')
        page.evaluate("""() => {
          window.__acResults=[];
          const save=LearningAPI.saveResult;
          LearningAPI.saveResult=(profile,row)=>{__acResults.push(structuredClone(row));return save(profile,row)};
          const deliver=ActivityModel.forDelivery;
          ActivityModel.forDelivery=(item,...args)=>{window.__ac=item;return deliver(item,...args)};
        }""")

        def current(kind):
            page.wait_for_function('(kind)=>__ac?.cognitiveTask?.kind===kind && document.querySelector(".cognitive-area, .falling-settings")', arg=kind)
            return page.evaluate('__ac')

        def mode(name):
            if name == 'wait':
                page.locator('#miraModeButton').click()
            else:
                page.locator(f'#cognitiveFamilyModes [data-cognitive-family="{name}"]').click()

        def start():
            page.locator('#exerciseOptions').get_by_role('button', name='Empezar', exact=True).click()

        def set_level(level):
            options = page.locator('#activityOptions')
            if not options.evaluate('element=>element.open'):
                options.locator('summary').click()
            options.locator('#exerciseLevelSelect').select_option(str(level))

        area(page, 'literacy').click()
        reading_aids = page.get_by_text('Ayudas para leer', exact=True)
        for _ in range(12):
            page.wait_for_function('()=>window.__ac && document.querySelector("#exerciseVisual .reading-passage")')
            if reading_aids.is_visible():
                break
            page.evaluate('window.__ac=null')
            page.locator('#languageModeSwitch [data-mode="grammar"]').click()
        reading_aids.wait_for()
        assert 'Verdana' in page.locator('#exerciseVisual').evaluate('(element)=>getComputedStyle(element).fontFamily')
        page.locator('.reader-assist').get_by_role('button', name='Más espacio').click()
        assert page.locator('.reader-assist').get_by_role('button', name='Más espacio').get_attribute('aria-pressed') == 'true'
        area(page, 'executive').click()
        assert not page.locator('.reader-assist').count()
        assert page.locator('#correctSound').is_enabled()
        assert not page.locator('#correctSound').is_checked()
        print('Reader scope and optional sound preference', flush=True)

        mode('')
        assert page.locator('#guidedSessionTitle').inner_text() == 'Sesión aleatoria'
        page.wait_for_function('()=>__ac?.type==="cognitiveTask" && document.querySelector(".cognitive-area")')
        session_item = page.evaluate('__ac')
        start()
        task = session_item['cognitiveTask']
        if task['kind'] == 'deduction':
            next_hint = page.get_by_role('button', name='Ver siguiente pista')
            while next_hint.is_enabled():
                next_hint.click()
            page.locator(f'[data-candidate-id="{task["answer"][0]}"] .cognitive-candidate-actions button').last.click()
        elif task['kind'] == 'change':
            page.locator('.cognitive-choices').get_by_role('button', name=task['replacement'], exact=True).click()
            assert not page.locator('.cognitive-plan-updated').count()
            for step in task['answer']:
                page.locator('.cognitive-choices').get_by_role('button', name=step, exact=True).click()
            page.get_by_role('button', name='Comprobar plan').click()
        elif task['kind'] == 'words':
            page.locator('#cognitiveWord').fill(task['answer'][0])
            page.locator('#cognitiveWord').press('Enter')
        else:
            for answer in task['answer']:
                page.locator(f'.cognitive-fact input[value="{answer}"]').check()
            page.get_by_role('button', name='Comprobar', exact=True).click()
        page.locator('#exerciseNext').click()
        page.wait_for_function('(id)=>__ac?.type==="cognitiveTask" && __ac.id!==id', arg=session_item['id'])
        assert page.evaluate('__ac.cognitiveTask.kind') != task['kind']

        area(page, 'executive').click()
        set_level(2)
        mode('deduction')
        deduction = current('deduction')['cognitiveTask']
        start()
        for hint_index, hint in enumerate(deduction['clues']):
            assert page.locator('.cognitive-clues li').count() == hint_index + 1
            for card in deduction['candidates']:
                matches = card['attrs'][hint['dimension']] == hint['value']
                if hint['op'] == 'if':
                    matches = not matches or card['attrs'][hint['thenDimension']] == hint['thenValue']
                elif hint['op'] == 'not':
                    matches = not matches
                if not matches:
                    button = page.locator(f'[data-candidate-id="{card["id"]}"] button[aria-pressed]')
                    if button.get_attribute('aria-pressed') == 'false':
                        button.click()
        assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
        print('Random session advances across families and deduces by cumulative discard', flush=True)

        mode('rules')
        rule = current('rules')['cognitiveTask']
        page.clock.install()
        page.clock.pause_at(page.evaluate('Date.now()+100'))
        start()
        stage = page.locator('.rule-stimulus-stage')
        if os.environ.get('GLIAX_AC_CAPTURAS'):
            page.locator('#exercise').screenshot(path=str(Path(os.environ['GLIAX_AC_CAPTURAS']) / 'reglas-escritorio.png'))
        def geometry():
            return stage.evaluate('element=>{const r=element.getBoundingClientRect();return [r.x+scrollX,r.y+scrollY,r.width,r.height]}')
        dimensions = geometry()
        paths = iter(['keyboard', 'touch', 'button'])
        for trial, answer in zip(rule['trials'], rule['answer']):
            if trial['switchBefore']:
                assert page.locator('.cognitive-rule-change').is_visible()
                assert geometry() == dimensions
                page.clock.run_for(rule['switchMs']+4)
            assert not page.locator('#exerciseVisual progress, #exerciseVisual [role="timer"]').count()
            assert geometry() == dimensions
            if answer == 'act':
                method = next(paths, 'keyboard')
                if method == 'touch':
                    stage.tap()
                elif method == 'button':
                    page.get_by_role('button', name='Responder').click()
                else:
                    page.evaluate('document.activeElement.blur()')
                    page.keyboard.down('Space')
                    page.keyboard.down('Space')
                    page.keyboard.up('Space')
            else:
                page.clock.run_for(rule['trialMs']+4)
            if page.locator('.rule-stimulus-stage').count():
                assert geometry() == dimensions
            page.clock.run_for(rule['gapMs']+4)
        metrics = json.loads(page.evaluate('__acResults.at(-1).detail'))
        assert metrics['definition_version'] == 2 and metrics['correct'] == len(rule['trials'])
        assert len(metrics['response_times_ms']) == rule['answer'].count('act')
        assert metrics['errors'] == 0

        mode('wait')
        wait = current('guidedWait')['cognitiveTask']
        page.get_by_role('button', name='Empezar espera').click()
        page.locator('.guided-wait-progress').wait_for()
        page.clock.run_for(wait['intervalMs']+120)
        result = page.evaluate('__acResults.at(-1)')
        assert result['correct'] is None and json.loads(result['detail'])['modality'] == 'guided_wait'
        print('Space, touch, button, stable geometry, and separate waiting results', flush=True)

        page.locator('[data-interaction-kind=movement]').click()
        page.wait_for_selector('#startInteractive')
        movement = page.evaluate('__ac.interactionTask')
        page.locator('#startInteractive').click()
        for index in movement['trials']:
            if movement['rules'][index]['target'] < 0:
                page.locator('#movementWait').wait_for()
                break
            page.clock.run_for(5040)

        page.evaluate('''() => {
          const original=LearningAPI.requestContent;
          LearningAPI.requestContent=async payload=>{
            const response=await original(payload);
            if(payload.interaction_kind!=='auditory')return response;
            const item=Curriculum.interactivePool('primary','executive',payload.level)
              .find(item=>item.interactionTask.audioMode==='words');
            return {...response,items:[item]};
          };
        }''')
        page.locator('[data-interaction-kind=auditory]').click()
        sample = page.locator('.sample-cue').first
        sample.wait_for()
        volume = page.get_by_role('slider', name='Volumen de las señales')
        volume.fill('0.63')
        sample.click()
        page.clock.run_for(150)
        page.wait_for_function('()=>__voices.at(-1)?.volume>0.62 && __voices.at(-1)?.volume<0.64')
        assert page.locator('#startListening').is_enabled()

        area(page, 'attention').click()
        set_level(2)
        page.locator('#attentionPhotos').click()
        page.wait_for_selector('.photo-comparison')
        count = page.evaluate('__ac.answers.length')
        assert f'{count} diferencias' in page.locator('#exercisePrompt').inner_text()
        print('Movement wait, spoken volume control, and exact difference count', flush=True)

        area(page, 'language').click()
        page.locator('#wordFitMode').click()
        term = current('words')['cognitiveTask']['answer'][0]
        start()
        assert not page.locator('.cognitive-word-choice').count()
        page.locator('#cognitiveWord').fill('ejemplo sin revisar')
        before = page.evaluate('__acResults.length')
        page.locator('#cognitiveWord').press('Enter')
        assert 'No puedo comprobar esta palabra automáticamente' in page.locator('.cognitive-status').inner_text()
        assert page.evaluate('__acResults.length') == before
        page.locator('#cognitiveWord').fill(term.upper())
        page.locator('#cognitiveWord').press('Enter')
        assert json.loads(page.evaluate('__acResults.at(-1).detail'))['response_mode'] == 'written'

        area(page, 'speedReasoning').click()
        page.locator('#speedWordFit').click()
        assert current('words')['domain'] == 'speedReasoning'
        start()
        assert 'no se cronometra' in page.locator('#exerciseVisual').inner_text()
        area(page, 'language').click()
        assert page.locator('#fallingWordsMode').is_hidden()
        area(page, 'speedReasoning').click()
        page.locator('#fallingWordsMode').click()
        page.wait_for_selector('.falling-settings')
        assert page.evaluate('__requests.at(-1).client_revision') == 19
        page.get_by_label('Velocidad', exact=True).select_option('slow')
        page.get_by_label('Palabras quietas').check()
        start()
        field = page.locator('#fallingInput')
        target = page.locator('.falling-target')
        page.clock.run_for(600)
        first = target.inner_text()
        page.get_by_role('button', name='Pausar', exact=True).click()
        page.clock.run_for(16000)
        assert field.is_disabled() and not target.is_visible()
        page.get_by_role('button', name='Reanudar', exact=True).click()
        assert target.inner_text() == first
        page.clock.run_for(250)
        field.fill(first[:-1])
        page.clock.run_for(270)
        field.fill(first)
        field.fill('texto de prueba no persistido')
        field.press('Enter')
        page.clock.run_for(15000)
        page.set_viewport_size({'width': 390, 'height': 844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        if os.environ.get('GLIAX_AC_CAPTURAS'):
            page.locator('#exercise').screenshot(path=str(Path(os.environ['GLIAX_AC_CAPTURAS']) / 'palabras-movil.png'))
        for _ in range(len(page.evaluate('__ac.cognitiveTask.prompts')) - 3):
            field.fill(target.inner_text())
        result = page.evaluate('__acResults.at(-1)')
        data = json.loads(result['detail'])
        assert result['correct'] is None and data['modality'] == 'falling_words'
        assert data['correct'] >= 2 and data['errors'] == data['omissions'] == 1
        assert data['rounds'][0]['input_to_submit_ms'] >= 270
        assert 'texto de prueba' not in json.dumps(result)
        print('Written vocabulary and pause, typing, omissions, privacy and mobile layout of falling words', flush=True)

        workspace(page).locator('#profileSelect').select_option('early')
        area(page, 'language').click()
        page.locator('#wordFitMode').click()
        item = current('words')
        start()
        choices = page.locator('.cognitive-word-choice input')
        assert choices.count() >= 4 and not page.locator('#cognitiveWord').count()
        values = page.evaluate('CognitiveFamilies.wordChoices(__ac).filter(word=>CognitiveFamilies.wordFits(word,__ac.cognitiveTask))')
        for value in values:
            page.locator(f'.cognitive-word-choice input[value="{value}"]').check()
        page.get_by_role('button', name='Comprobar selección').click()
        assert json.loads(page.evaluate('__acResults.at(-1).detail'))['response_mode'] == 'selection'
        assert not errors, errors
        browser.close()
        print('PASS: GLIAX A–C Chromium, local Edge and fictitious profiles', flush=True)
finally:
    server.shutdown()
    server.server_close()

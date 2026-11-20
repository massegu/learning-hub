"""Exercise the revised navigation, active responses and mobile worksheet layout."""
import importlib.util
import os
from pathlib import Path
import threading

from playwright.sync_api import expect, sync_playwright
from browser_support import ROOT, area, workspace

spec = importlib.util.spec_from_file_location('review', ROOT / 'tools/review-preview.py')
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)
evidence = os.getenv('GLIAX_COMPLETION_EVIDENCE')
if evidence:
    evidence = Path(evidence)
    evidence.mkdir(parents=True, exist_ok=True)

with review.ReviewServer(('127.0.0.1', 0), review.prepare()) as server:
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=os.getenv('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'),
                                                 args=['--no-sandbox'])
            page = browser.new_page(viewport={'width': 1360, 'height': 950})
            page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
            page.evaluate('''() => {
              window.checkedItem=null;
              const real=LearningAPI.requestContent;
              LearningAPI.requestContent=async payload=>{
                const response=await real(payload);
                if(payload.kind==='exercise'){window.checkedRequest=payload;window.checkedItem=response.items[0];}
                return response;
              };
            }''')

            def save(name, locator):
                if evidence:
                    page.locator(locator).screenshot(path=evidence / (name + '.png'))

            def level(n):
                options = page.locator('#activityOptions')
                if not options.evaluate('(e)=>e.open'):
                    options.locator('summary').click()
                page.locator('#exerciseLevelSelect').select_option(str(n))

            def start():
                page.locator('#exerciseOptions').get_by_role('button', name='Empezar', exact=True).click()

            workspace(page).locator('#profileSelect').select_option('primary')
            area(page, 'attention').click()
            page.get_by_role('button', name='Busca y compara', exact=True).click()
            for format, icons in [('icons', (True,True)), ('words',(False,False)), ('mixed',(True,False))]:
                page.wait_for_function('(format)=>checkedItem?.execution?.format===format', arg=format)
                start()
                for region, present in zip(('#exerciseVisual', '#exerciseOptions'), icons):
                    assert bool(page.locator(region+' .executed-grid svg').count()) == present
                save('comparar-'+format, '#exercise')
                answer = page.evaluate('checkedItem.execution.answer')
                for i in answer:
                    page.locator('#exerciseOptions .executed-cell').nth(int(i)).click()
                page.get_by_role('button', name='Comprobar', exact=True).click()
                expect(page.locator('#exerciseFeedback')).to_have_class('feedback ok')
                if format != 'mixed':
                    page.locator('#exerciseNext').click()

            page.locator('#attentionPhotos').click()
            expect(page.locator('#exercisePrompt')).to_have_text('Marca 3 diferencias.')
            assert not page.locator('.photo-mark-help').count()
            marks=page.evaluate('checkedItem.answers')
            for i, mark in enumerate(marks):
                spot=page.get_by_role('button', name='Señalar: '+mark, exact=True)
                spot.press('Enter')
                if i == 0:
                    spot.press('Enter')
                    expect(page.locator('.photo-hit.selected')).to_have_count(1)
                    expect(page.locator('.photo-hit.correct, .photo-hit.missing')).to_have_count(0)
                    save('diferencias-en-curso','#exercise')
            expect(page.locator('#exerciseFeedback')).to_have_class('feedback ok')
            save('diferencias-final','#exercise')

            area(page, 'executive').click()
            assert not page.get_by_role('button', name='Retos con tarjetas', exact=True).count()
            assert not page.get_by_role('button', name='Espera guiada', exact=True).count()
            expect(page.get_by_role('button', name='Sesión aleatoria', exact=True)).to_have_count(1)
            page.get_by_role('button', name='Mira y actúa', exact=True).click()
            expect(page.get_by_role('button', name='Actúa con reglas', exact=True)).to_be_visible()
            expect(page.get_by_role('button', name='Espera con señal', exact=True)).to_have_count(0)
            page.get_by_role('button', name='Actúa con reglas', exact=True).click()
            page.wait_for_function('()=>checkedItem?.interactionTask?.kind==="symbols"')
            page.get_by_role('button', name='Mira y actúa', exact=True).click()
            page.get_by_role('button', name='Empezar espera', exact=True).click()
            expect(page.locator('.guided-wait-progress')).to_be_visible()
            page.get_by_role('button', name='Planificación', exact=True).click()
            level(2)
            page.wait_for_function('()=>checkedItem?.execution?.kind==="plan"&&checkedItem?.level===2')
            start()
            expected = page.evaluate('checkedItem.execution.answer')
            extras = page.evaluate('checkedItem.execution.choices.filter(x=>!checkedItem.execution.answer.includes(x))')
            available = page.locator('.plan-available')
            for step in [extras[0], *expected[::-1][:-1]]:
                available.get_by_role('button', name=step, exact=True).click()
            page.get_by_role('button', name='Quitar '+extras[0], exact=True).press('Enter')
            available.get_by_role('button', name=expected[0], exact=True).press('Enter')
            for step in expected[:-1]:
                while page.locator('.plan-selected li > span').all_text_contents().index(step) > expected.index(step):
                    page.get_by_role('button', name='Subir '+step, exact=True).press('Enter')
            save('planificacion', '#exerciseOptions')
            page.get_by_role('button', name='Comprobar plan', exact=True).click()
            expect(page.locator('.executed-status')).to_have_text('Pasos y orden correctos.')

            page.evaluate('window.checkedItem=null')
            page.get_by_role('button', name='Sesión aleatoria', exact=True).click()
            page.wait_for_function('()=>checkedItem && (checkedRequest.executed_family || checkedRequest.cognitive_family)')
            first_family = page.evaluate('checkedRequest.executed_family || checkedRequest.cognitive_family')
            page.locator('#exerciseNext').evaluate('(e)=>e.click()')
            page.wait_for_function('first=>checkedItem && (checkedRequest.executed_family || checkedRequest.cognitive_family)!==first', arg=first_family)
            page.locator('#cancelGuidedSession').click()

            area(page, 'speedReasoning').click()
            page.get_by_role('button', name='Palabras en caída', exact=True).click()
            expect(page.locator('.falling-settings')).to_be_visible()
            page.get_by_label('Velocidad', exact=True).select_option('slow')
            page.get_by_label('Palabras quietas').check()
            start()
            word = page.locator('.falling-target').inner_text()
            page.get_by_role('button', name='Pausar', exact=True).click()
            expect(page.locator('#fallingInput')).to_be_disabled()
            page.get_by_role('button', name='Reanudar', exact=True).click()
            entry=page.locator('#fallingInput')
            entry.fill(word[:-1])
            expect(page.locator('.falling-status')).to_contain_text('Palabra 1 de')
            entry.evaluate('e=>e.dispatchEvent(new CompositionEvent("compositionstart"))')
            entry.fill(word.upper())
            expect(page.locator('.falling-status')).to_contain_text('Palabra 1 de')
            entry.evaluate('e=>e.dispatchEvent(new CompositionEvent("compositionend"))')
            expect(page.locator('.falling-status')).to_contain_text('Correcta. Palabra 2 de')

            workspace(page).locator('#profileSelect').select_option('early')
            area(page, 'language').click()
            page.locator('#wordFitMode').click()
            start()
            page.set_viewport_size({'width':390,'height':844})
            choice = page.locator('.cognitive-word-choice').first
            choice.locator('input').press('Space')
            assert choice.evaluate("e=>getComputedStyle(e).outlineWidth") == '2px'
            save('palabra-encaja-movil', '.word-choice-panel')

            workspace(page).locator('#navMenu [data-section="homework"]').click()
            page.get_by_role('button', name='Ficha a la carta', exact=True).click()
            expect(page.locator('#hStatus')).to_contain_text('Elige un área', timeout=30000)
            first = page.locator('#hFamilies .worksheet-family-group').first
            first.locator('summary').click()
            row = first.locator('.worksheet-family-row').first
            field = row.locator('input')
            row.get_by_role('button', name='Añadir una actividad', exact=False).click()
            expect(field).to_have_value('1')
            expect(page.locator('#hOrder li')).to_have_count(1)
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            save('fichas-movil', '#paperConfigurator')
            page.set_viewport_size({'width':1360,'height':950})
            save('fichas-escritorio', '#paperConfigurator')
            browser.close()
        print('PASS: comparaciones generadas, fotos sin pistas, Mira y actúa, plan activo, transcripción, selección y fichas responsive')
    finally:
        server.shutdown()

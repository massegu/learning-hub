"""Exercise GLIAX navigation with a loopback server and synthetic accounts."""
import functools
import http.server
import os
import threading
import zipfile

from playwright.sync_api import expect, sync_playwright
from browser_support import ROOT, SDK, QuietHandler, area, workspace


def set_level(page, value):
    settings = page.locator('#activityOptions')
    if not settings.evaluate('e => e.open'):
        settings.locator('summary').click()
    settings.locator('select').select_option(str(value))


def choose_profile(page, age):
    workspace(page).locator('#profileSelect').select_option(age)


def open_mode(page, family, item_id):
    page.locator(f'[data-r192-family="{family}"]').press('Enter')
    expect(page.locator('#exerciseOptions')).to_have_attribute('data-case', item_id)


def assert_width(page):
    width, elements = page.evaluate('''() => [
      document.documentElement.scrollWidth - innerWidth,
      Array.from(document.querySelectorAll('#exercise *')).filter(node => node.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 12).map(node => node.tagName + '.' + node.className)
    ]''')
    assert width <= 1, (width, elements)


def cp_ec(page):
    choose_profile(page, 'primary')
    area(page, 'executive').click()
    set_level(page, 2)
    open_mode(page, 'CP', 'CP08')
    expect(page.locator('#exerciseOptions')).to_have_attribute('data-age', 'primary')
    expect(page.locator('#exerciseOptions')).to_have_attribute('data-level', '2')
    initial_requests = page.evaluate('__requests.length')
    initial_saves = page.evaluate('__saved.length')
    for name in ['Ana prepara imágenes. Revisamos al terminar texto e imágenes', 'Leo prepara imágenes. Revisamos al terminar texto e imágenes']:
        page.get_by_role('radio', name=name).press('Space')
        page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
        expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
        page.get_by_role('button', name='Repetir', exact=True).press('Enter')
        expect(page.locator('#exerciseOptions')).to_have_attribute('data-case', 'CP08')
    assert page.evaluate('__requests.length') == initial_requests
    assert page.evaluate('__saved.length') == initial_saves

    choose_profile(page, 'middle')
    area(page, 'executive').click()
    set_level(page, 2)
    open_mode(page, 'CP', 'CP11')
    target = ['Resolver dudas', 'Estudiar tema 1', 'Fin de la primera tarde', 'Estudiar tema 2', 'Hacer el práctico']
    for index, step in enumerate(target):
        current = page.locator('.r192-order li span').all_text_contents().index(step)
        for _ in range(current - index):
            page.get_by_role('button', name='Subir ' + step, exact=True).press('Enter')
    assert page.locator('.r192-order li span').all_text_contents() == target
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    set_level(page, 3)
    expect(page.locator('#exerciseOptions')).to_have_attribute('data-case', 'CP12')
    page.get_by_role('radio', name='Ninguna de estas opciones').check()
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')

    page.set_viewport_size({'width': 390, 'height': 844})
    choose_profile(page, 'primary')
    area(page, 'attention').click()
    set_level(page, 3)
    open_mode(page, 'EC', 'EC09')
    assert_width(page)
    page.get_by_role('radio', name='Falta saber si se refieren a la misma prueba').check()
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'partial')
    page.get_by_role('button', name='Repetir', exact=True).click()
    for label in ['Informe A: 100 ml.', 'Informe B: 150 ml.']:
        page.get_by_role('checkbox', name=label, exact=True).check()
    page.get_by_role('radio', name='Falta saber si se refieren a la misma prueba').check()
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    assert_width(page)


def information(page):
    choose_profile(page, 'early')
    area(page, 'executive').click()
    set_level(page, 2)
    open_mode(page, 'IN', 'IN02')
    draft = page.get_by_role('textbox', name='Escribe tu respuesta')
    expect(page.locator('#exerciseOptions')).to_contain_text('responder en voz alta')
    expect(page.get_by_role('radio')).to_have_count(0)
    initial = page.evaluate('({requests:__requests.length,saves:__saved.length,results:localStorage.getItem("__mock_exercise_results")})')
    draft.fill('Niños')
    page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'partial')
    expect(page.locator('#exerciseFeedback')).to_contain_text('espontánea')
    page.get_by_role('button', name='Necesito una pista').press('Enter')
    expect(page.locator('#exerciseOptions')).to_contain_text('qué dos grupos puedes comparar')
    draft.fill('texto sintético sin interpretación')
    page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'uninterpretable')
    expect(page.locator('#exerciseFeedback')).to_contain_text('con pista')
    page.get_by_role('button', name='Ver alternativas').press('Enter')
    expect(draft).not_to_be_visible()
    page.get_by_role('radio', name='Niños y pinceles', exact=True).check()
    page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    expect(page.locator('#exerciseFeedback')).to_contain_text('con alternativas')
    assert page.evaluate('({requests:__requests.length,saves:__saved.length,results:localStorage.getItem("__mock_exercise_results")})') == initial
    area(page, 'attention').click()
    expect(page.locator('#r192-open-answer')).to_have_count(0)
    assert page.evaluate('!JSON.stringify(localStorage).includes("texto sintético")')

    choose_profile(page, 'junior')
    area(page, 'executive').click()
    set_level(page, 3)
    open_mode(page, 'IN', 'IN06')
    page.get_by_role('textbox', name='Escribe tu respuesta').fill('Depende del tiempo de viaje')
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    page.locator('#exerciseNext').press('Enter')
    expect(page.locator('#exerciseOptions')).to_have_attribute('data-case', 'IN-06 complete-data')
    page.get_by_role('textbox', name='Escribe tu respuesta').fill('Sí, llego a las 16:50')
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    assert_width(page)


def rules(page):
    choose_profile(page, 'early')
    area(page, 'executive').click()
    expect(page.locator('[data-r192-family="AR"]')).to_have_count(0)
    choose_profile(page, 'junior')
    area(page, 'executive').click()
    set_level(page, 2)
    open_mode(page, 'AR', 'AR08')
    label = page.locator('.r192-rule-label')
    expect(label).to_have_text('círculo')
    page.get_by_role('button', name='Responder', exact=True).press('Enter')
    expect(page.get_by_role('button', name='Responder', exact=True)).to_have_attribute('aria-pressed', 'true')
    page.get_by_role('button', name='Siguiente estímulo').press('Enter')
    expect(label).to_have_text('triángulo')
    page.get_by_role('button', name='Siguiente estímulo').press('Enter')
    expect(page.locator('.r192-rule-card')).to_have_attribute('data-event', 'signal')
    expect(page.get_by_role('button', name='Responder', exact=True)).to_have_count(0)
    expect(page.locator('#exerciseFeedback')).to_be_empty()
    page.get_by_role('button', name='Continuar', exact=True).press('Enter')
    expect(label).to_have_text('círculo')
    page.get_by_role('button', name='Siguiente estímulo').press('Enter')
    expect(label).to_have_text('triángulo')
    page.get_by_role('button', name='Responder', exact=True).press('Enter')
    page.get_by_role('button', name='Siguiente estímulo').press('Enter')
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    expect(page.locator('#exerciseFeedback')).to_contain_text('4 de 4 estímulos')
    assert_width(page)


def executive(page):
    choose_profile(page, 'primary')
    area(page, 'executive').click()
    set_level(page, 2)
    open_mode(page, 'planning', 'r192-planning-primary-2-dependency-1')
    boundary = page.evaluate('({requests:__requests.length,saves:__saved.length,results:localStorage.getItem("__mock_exercise_results")})')
    item = page.evaluate("GliaxR192Practice.getItem('planning', 'primary', 2, 0)")
    assert item['interactiveOnly']
    assert page.evaluate("""item => {
        if (WorksheetCatalog.staticPaper(item)) return false;
        try { ActivityModel.printable(item); return false; }
        catch (error) { return error.message.includes('solo en pantalla'); }
    }""", item)
    for index, step in enumerate(item['answer']):
        current = page.locator('.r192-order li span').all_text_contents().index(step)
        for _ in range(current - index):
            page.get_by_role('button', name='Subir ' + step, exact=True).press('Enter')
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    expect(page.locator('#printCognitive')).to_have_count(0)

    open_mode(page, 'constraints', 'r192-constraints-primary-2-resources-1-2-several')
    expect(page.locator('#exerciseVisual table')).to_contain_text('Piezas incluidas')
    assert page.evaluate("GliaxR192Practice.getItem('constraints','primary',2,0).a") == 'A'
    page.get_by_role('radio', name='B', exact=True).check()
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')

    open_mode(page, 'supervision', 'r192-supervision-primary-2-review-1-0')
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    page.locator('#exerciseNext').click()
    expect(page.locator('#exerciseOptions')).to_have_attribute('data-case', 'r192-supervision-primary-2-review-0-2')
    rows = page.evaluate("GliaxR192Practice.getItem('supervision','primary',2,1).answers")
    for row in rows:
        page.get_by_role('checkbox', name=row, exact=True).check()
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    assert_width(page)

    open_mode(page, 'goal-change', 'r192-goal-change-primary-2-cp08')
    page.get_by_role('radio', name='Leo prepara imágenes. Revisamos al terminar texto e imágenes').check()
    page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    page.locator('#exerciseNext').press('Enter')
    expect(page.locator('#exerciseOptions')).to_have_attribute('data-case', 'r192-goal-change-primary-2-priority-1')
    page.get_by_role('radio', name='Enviar el cambio de hora a quienes asisten').check()
    page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    assert_width(page)
    assert page.evaluate('({requests:__requests.length,saves:__saved.length,results:localStorage.getItem("__mock_exercise_results")})') == boundary


def inventory(page):
    assert page.evaluate('''() => {
      const ids = new Set();
      for (const age of ['early','junior','primary','middle','teen']) {
        for (const level of [1,2,3]) {
          for (const family of ['CP','EC','IN','AR']) {
            const item = GliaxR192Practice.getItem(family, age, level, 0);
            if (family === 'AR' && age === 'early') {
              if (item) return false;
            } else {
              if (item.ageBand !== age || item.level !== level || !item.interactiveOnly) return false;
              ids.add(item.id);
            }
          }
        }
      }
      ids.add(GliaxR192Practice.getItem('IN','junior',3,1).id);
      return ids.size === 58 && GliaxR192Bank.getCaseIds().every(id => ids.has(id));
    }''')


def legacy_reports(page):
    choose_profile(page, 'teen')
    page.evaluate("""() => {
      const row = {
        profile_id: 'teen', client_attempt_id: 'synthetic-legacy', subject: 'communication',
        level: 2, occurred_at: new Date().toISOString(), session_id: 'previous-session',
        correct: true, points: 10, detail: 'standard'
      };
      localStorage.setItem('__mock_exercise_results', JSON.stringify({old: row}));
    }""")
    workspace(page).locator('#navMenu [data-section="progress"]').click()
    expect(page.locator('#progressSummary')).to_contain_text('100% de precisión')
    for control, extension in [('#exportDetailCsv', '.csv'), ('#exportExcel', '.xlsx')]:
        with page.expect_download() as pending:
            page.locator(control).click()
        export = pending.value
        assert export.suggested_filename.endswith(extension)
        if extension == '.csv':
            data = export.path().read_text(encoding='utf-8-sig')
        else:
            with zipfile.ZipFile(export.path()) as book:
                assert book.testzip() is None
                data = book.read('xl/worksheets/sheet3.xml').decode()
        assert 'Comunicación funcional' in data
        assert 'r192' not in data


def main():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'), args=['--no-sandbox'])
            page = browser.new_page(viewport={'width': 1440, 'height': 1000})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))

            def intercept(route):
                address = route.request.url
                if address == url + 'js/config.js':
                    route.fulfill(content_type='application/javascript', body=(ROOT / 'js/config.js').read_text() + '\nwindow.LH_CONFIG.r192Practice = true;')
                elif 'cdn.jsdelivr.net/npm/@supabase/supabase-js' in address:
                    route.fulfill(content_type='application/javascript', body=SDK)
                elif 'jszip@3.10.1/dist/jszip.min.js' in address:
                    route.fulfill(content_type='application/javascript', body=(ROOT / 'node_modules/jszip/dist/jszip.min.js').read_bytes())
                elif address.startswith(url):
                    route.continue_()
                else:
                    route.abort()

            page.route('**/*', intercept)
            page.goto(url, wait_until='networkidle')
            inventory(page)
            cp_ec(page)
            information(page)
            rules(page)
            page.set_viewport_size({"width": 1440, "height": 1000})
            executive(page)
            page.set_viewport_size({"width": 390, "height": 844})
            executive(page)
            legacy_reports(page)
            page.evaluate('window.LH_CONFIG.r192Practice = false')
            area(page, 'executive').click()
            expect(page.locator('#r192Modalities')).not_to_be_visible()
            expect(page.locator('#documentModeSwitch [data-documents=false]')).to_be_visible()
            assert not errors, errors
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print('PASS: cuatro familias R1 y cuatro generadores R2, teclado, privacidad, escritorio/móvil y CSV/XLSX históricos')


if __name__ == '__main__':
    main()

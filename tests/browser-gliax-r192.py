"""Exercise GLIAX navigation with a loopback server and synthetic accounts."""
import functools
import http.server
import os
import threading

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
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')


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
                elif address.startswith(url):
                    route.continue_()
                else:
                    route.abort()

            page.route('**/*', intercept)
            page.goto(url, wait_until='networkidle')
            cp_ec(page)
            information(page)
            rules(page)
            assert not errors, errors
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print('PASS: CP/EC/IN/AR, teclado, ayudas, señales, privacidad y pantalla móvil')


if __name__ == '__main__':
    main()

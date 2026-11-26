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
            assert not errors, errors
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print('PASS: CP/EC, teclado, alternativas, secuencias, inviabilidad, evidencia y pantalla móvil')


if __name__ == '__main__':
    main()

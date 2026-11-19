"""Exercise a built Pages artifact with its HTTP headers and real browser libraries.

Arguments are the built dist-gliax-staging, a directory containing copies of the
three CDN distributions, and an empty evidence directory. The browser makes no
external connections. Auth and PostgREST responses are synthetic. Content comes
from the repository's local Edge worker.
"""
import argparse
import base64
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
import io
import json
import os
from pathlib import Path
import threading
import time
from urllib.parse import urlsplit
import zipfile

from playwright.sync_api import expect, sync_playwright
from browser_support import ROOT, workspace

ORIGIN = 'https://gliax-staging.pages.dev'
API = 'https://wejcfaralctolzxjbcil.supabase.co'
CDN = 'https://cdn.jsdelivr.net'
DOCX = '/js/vendor/docx-8.5.0/index.umd.js'
EXCELJS = CDN + '/npm/exceljs@4.4.0/dist/exceljs.min.js'
LIBRARIES = {
    CDN + '/npm/@supabase/supabase-js@2': 'supabase.js',
    CDN + '/npm/jszip@3.10.1/dist/jszip.min.js': 'jszip.min.js',
    EXCELJS: 'exceljs.min.js',
}
ACCOUNT = {'id': 'account', 'email': 'qa-staging@example.invalid', 'aud': 'authenticated',
           'role': 'authenticated', 'app_metadata': {}, 'user_metadata': {}}
PROFILE = {'id': 'teen', 'name': 'QA-CSP', 'age_band': 'teen', 'locale': 'es_intl',
           'progress': {'initialLevel': 2}}
HISTORY = [{'profile_id': 'teen', 'subject': 'communication', 'level': 2,
            'occurred_at': '2026-11-19T10:01:00Z', 'session_id': 'simulada',
            'correct': True, 'points': 10, 'detail': 'standard'}]


class PagesHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory, pages_headers, **kwargs):
        self.pages_headers = pages_headers
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self):
        for key, value in self.pages_headers.items():
            self.send_header(key, value)
        super().end_headers()

    def log_message(self, *_):
        pass


def start(server):
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


def pages_headers(dist):
    pattern, *headers = (dist / '_headers').read_text().splitlines()
    assert pattern == '/*'
    return dict(line.strip().split(': ', 1) for line in headers)


def fake_token(expires):
    payload = base64.urlsafe_b64encode(json.dumps({'exp': expires, 'sub': ACCOUNT['id']}).encode()).decode().rstrip('=')
    return f'eyJhbGciOiJIUzI1NiJ9.{payload}.fixture'


def site_test(page, dist, vendors, evidence, local, edge, headers):
    errors, unexpected, seen_libraries, content_calls, policies = [], [], set(), [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda msg: policies.append(msg.text) if 'Content Security Policy' in msg.text else None)
    page.add_init_script("""window.__cspEvents = [];
      addEventListener('securitypolicyviolation', event =>
        __cspEvents.push([event.effectiveDirective, event.blockedURI]));""")

    def route_request(route):
        request = route.request
        url = urlsplit(request.url)
        path = url.path
        origin = f'{url.scheme}://{url.netloc}'
        if origin == ORIGIN:
            response = route.fetch(url=local + path, max_redirects=0)
            if path == DOCX and response.ok:
                assert response.body() == (dist / DOCX.lstrip('/')).read_bytes()
                seen_libraries.add(DOCX)
            return route.fulfill(response=response)
        if request.url in LIBRARIES:
            seen_libraries.add(request.url)
            return route.fulfill(body=(vendors / LIBRARIES[request.url]).read_bytes(),
                                 content_type='application/javascript')
        if origin == API:
            cors = {'Access-Control-Allow-Origin': ORIGIN,
                    'Access-Control-Allow-Headers': request.headers.get('access-control-request-headers', '*'),
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'}
            if request.method == 'OPTIONS':
                return route.fulfill(status=204, headers=cors)
            data, status = None, 200
            if path == '/auth/v1/token':
                expires = int(time.time()) + 3600
                data = {'access_token': fake_token(expires), 'token_type': 'bearer', 'expires_in': 3600,
                        'refresh_token': 'offline-fixture', 'user': ACCOUNT}
            elif path == '/rest/v1/accounts':
                data = {'subscription_status': 'complimentary', 'content_locale': 'es_intl'}
            elif path == '/rest/v1/learner_profiles':
                data = [PROFILE]
            elif path == '/rest/v1/exercise_results':
                data = HISTORY
            elif path == '/rest/v1/worksheet_favorites':
                data = []
            elif path == '/rest/v1/rpc/manage_learner_privacy':
                data = {'review_at': None}
            elif path == '/functions/v1/request-learning-content':
                body = request.post_data_json
                content_calls.append(body)
                result = edge.content(body)
                data, status = result['data'], result['status']
            if data is not None:
                return route.fulfill(status=status, headers=cors, json=data)
        unexpected.append((request.method, request.url))
        route.abort()

    page.route('**/*', route_request)
    response = page.goto(ORIGIN, wait_until='networkidle')
    for name, value in headers.items():
        assert response.header_value(name) == value, (name, response.headers)
    assert page.evaluate("typeof supabase.createClient === 'function' && !!window.LearningAPI")
    page.fill('#authEmail', ACCOUNT['email'])
    page.fill('#authPassword', 'Only-OffLine-Fixture')
    page.click('#authSignIn')
    expect(page.locator('#profileSelect option[value="teen"]')).to_have_count(1)
    workspace(page).locator('#profileSelect').select_option('teen')

    def download(selector, destination, suffix):
        with page.expect_download(timeout=60000) as pending:
            page.locator(selector).click()
        export = pending.value
        assert export.suggested_filename.startswith('GLIAX_') and export.suggested_filename.endswith(suffix)
        output = evidence / destination
        export.save_as(output)
        return output

    workspace(page).locator('#navMenu [data-section="progress"]').click()
    expect(page.locator('#progressSummary')).to_contain_text('100% de precisión')
    csv = download('#exportDetailCsv', 'informe.csv', '.csv')
    assert 'Comunicación funcional' in csv.read_text(encoding='utf-8-sig')
    xlsx = download('#exportExcel', 'informe.xlsx', '.xlsx')
    with zipfile.ZipFile(xlsx) as book:
        assert book.testzip() is None
        assert 'Comunicación funcional' in book.read('xl/worksheets/sheet3.xml').decode()
    # The current exporter writes XLSX with JSZip. Also verify the legacy ExcelJS
    # CDN URL against this policy and use its reader to open the exported book.
    assert EXCELJS not in seen_libraries
    page.add_script_tag(url=EXCELJS)
    book_data = base64.b64encode(xlsx.read_bytes()).decode()
    assert page.evaluate("""async data => {
        const book = new ExcelJS.Workbook();
        await book.xlsx.load(Uint8Array.from(atob(data), c => c.charCodeAt(0)));
        return book.worksheets.length === 4;
    }""", book_data)

    workspace(page).locator('#navMenu [data-section="homework"]').click()
    page.locator('#worksheetNone').click()
    for domain in ('communication', 'teenLanguage', 'executive', 'attention'):
        page.locator(f'#homeworkOptions input[value="{domain}"]').check()
    page.locator('#worksheetCount').select_option('1')
    page.locator('#worksheetQuestions').select_option('12')
    page.locator('#worksheetSolutions').uncheck()
    quick = download('#generateWorksheetsBtn', 'rapida-ficha.docx', '.docx')
    assert 'GLIAX' in inspect_docx(quick.read_bytes())

    page.get_by_role('button', name='Ficha a la carta', exact=True).click()
    page.locator('#hAge').select_option('primary')
    page.locator('#hLevel').select_option('2')
    page.locator('#hLocale').select_option('es_mx')
    expect(page.locator('#hStatus')).to_contain_text('Elige un área', timeout=30000)
    for family, quantity in [('language:words', '2'), ('executive:deduction', '1')]:
        count = page.locator(f'#hFamilies input[data-family="{family}"]')
        group = count.locator('xpath=ancestor::details')
        if not group.evaluate('e=>e.open'):
            group.locator('summary').click()
        count.fill(quantity)
    expect(page.locator('#hTotal')).to_contain_text('3 actividades por ficha')
    page.locator('#hSolutions').check()
    bundle = download('#hGenerate', 'a-la-carta.zip', '.zip')
    with zipfile.ZipFile(bundle) as outer:
        assert outer.testzip() is None and len(outer.namelist()) == 2
        for entry in outer.namelist():
            data = outer.read(entry)
            text = inspect_docx(data)
            assert 'México' in text
            if '_ficha_' in entry:
                assert text.count('Tipología · La palabra que encaja') == 2
                assert text.count('Tipología · Descubre quién') == 1
                (evidence / 'a-la-carta-ficha.docx').write_bytes(data)
            else:
                assert 'Solucionario profesional' in text and 'Actividad 3' in text
                (evidence / 'a-la-carta-solucionario.docx').write_bytes(data)

    assert any(call.get('worksheet_plan') for call in content_calls)
    assert any(call['kind'] == 'worksheet' and not call.get('worksheet_plan') for call in content_calls)
    assert seen_libraries == {*LIBRARIES, DOCX}, seen_libraries
    assert not errors and not unexpected and not policies, (errors, unexpected, policies)
    assert page.evaluate('window.__cspEvents') == []
    print('PASS: served HTTP headers, actual Supabase JS/DOCX/JSZip/ExcelJS, no CSP violations or foreign requests')
    print('PASS: quick DOCX, exact worksheet and separate answers in ZIP, CSV and XLSX')


def inspect_docx(data):
    with zipfile.ZipFile(io.BytesIO(data)) as doc:
        assert doc.testzip() is None
        assert 'GLIAX' in doc.read('docProps/core.xml').decode()
        text = doc.read('word/document.xml').decode()
        assert 'w:w="11906"' in text and 'w:h="16838"' in text
        assert 'Level Up' not in text
        return text


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for arg in ('dist', 'vendors', 'evidence'):
        parser.add_argument(arg, type=Path)
    args = parser.parse_args()
    args.evidence.mkdir(parents=True, exist_ok=True)
    headers = pages_headers(args.dist)
    spec = importlib.util.spec_from_file_location('review', ROOT / 'tools/review-preview.py')
    review = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(review)
    with ThreadingHTTPServer(('127.0.0.1', 0), partial(PagesHandler, directory=args.dist, pages_headers=headers)) as web:
        with review.ReviewServer(('127.0.0.1', 0), review.prepare()) as edge:
            start(web)
            try:
                with sync_playwright() as playwright:
                    browser = playwright.chromium.launch(
                        executable_path=os.getenv('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'), args=['--no-sandbox'])
                    context = browser.new_context(viewport={'width': 1360, 'height': 960}, service_workers='block')
                    site_test(context.new_page(), args.dist, args.vendors, args.evidence,
                              f'http://127.0.0.1:{web.server_port}', edge, headers)
                    browser.close()
            finally:
                web.shutdown()


if __name__ == '__main__':
    main()

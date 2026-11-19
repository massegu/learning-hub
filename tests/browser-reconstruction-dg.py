"""Review the professional reports and worksheet controls using the local Edge handler."""
import csv
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import threading
import xml.etree.ElementTree as ET
import zipfile

from playwright.sync_api import sync_playwright
from browser_support import ROOT, area, workspace

spec = importlib.util.spec_from_file_location('review', ROOT / 'tools/review-preview.py')
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)
server = review.ReviewServer(('127.0.0.1', 0), review.prepare())
threading.Thread(target=server.serve_forever, daemon=True).start()
evidence = Path(os.environ['GLIAX_DG_EVIDENCE']) if os.environ.get('GLIAX_DG_EVIDENCE') else None

try:
    with sync_playwright() as playwright, tempfile.TemporaryDirectory() as tmp:
        browser = playwright.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'), args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1360, 'height': 960})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        schema = 'gliax.exercise-metrics.v1'
        fixtures = [
            ('communication', False, 0, None, {}),
            ('speedReasoning', True, 10, None, {'speedFamily': 'unpaired', 'speedRevision': 4, 'responseMs': 1340, 'timingValid': True}),
            ('executive', True, 10, {'schema': schema, 'modality': 'rule_application', 'trials': 4, 'correct': 3, 'omissions': 1, 'definition_version': 2}, {}),
            ('executive', None, 0, {'schema': schema, 'modality': 'guided_wait', 'interval_ms': 4000, 'duration_ms': 4200}, {}),
            ('language', None, 0, {'schema': schema, 'modality': 'falling_words', 'correct': 4}, {}),
        ]
        history = [{'subject': subject, 'correct': result, 'points': points, 'sessionId': 'simulada-1',
                    'ts': f'2026-11-19T10:01:0{i}Z', 'level': 2,
                    'detail': json.dumps(detail) if detail else 'standard', **extra}
                   for i, (subject, result, points, detail, extra) in enumerate(fixtures)]
        profile = {'id': 'teen', 'name': 'DEMO-DG', 'age_band': 'teen',
                   'progress': {'levels': {'executive': 2}, 'history': history, 'totalAttempts': 83, 'totalCorrect': 54}}
        early = {'id': 'early', 'name': 'DEMO-67', 'age_band': 'primary', 'progress': {'ageRoute': 'early'}}
        page.add_init_script(f"""if (!localStorage.getItem('__mock_profiles'))
          localStorage.setItem('__mock_profiles', JSON.stringify({json.dumps([profile, early])}));""")
        page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
        workspace(page).locator('#profileSelect').select_option('teen')
        workspace(page).locator('#navMenu [data-section="progress"]').click()
        assert [int(value) for value in page.locator('#progressSummary [data-count]').evaluate_all('els=>els.map(e=>e.dataset.count)')] == [2, 1, 1, 1]
        assert '50% de precisión' in page.locator('#progressSummary').inner_text()

        def download(selector, name):
            with page.expect_download(timeout=60000) as result:
                page.locator(selector).click()
            assert result.value.suggested_filename.startswith('GLIAX_')
            path = (evidence or Path(tmp)) / name
            result.value.save_as(path)
            return path

        detailed = download('#exportDetailCsv', 'GLIAX_detalle_ficticio.csv')
        values = list(csv.reader(io.StringIO(detailed.read_text(encoding='utf-8-sig')), delimiter=';'))
        assert len(values) == 7 and values[1][4] == 'Modalidad'
        assert [row[4] for row in values[2:]] == ['Ejercicios puntuables', 'Ejercicios puntuables', 'Aplicación de reglas', 'Espera guiada', 'Otras prácticas']
        assert values[3][2:4] == ['Velocidad de procesamiento','Busca el símbolo sin pareja']
        assert 'unpaired' not in detailed.read_text() and '{"schema"' not in detailed.read_text()
        sessions = download('#exportSessionCsv', 'GLIAX_sesiones_ficticias.csv')
        assert ';2;1;50;10' in sessions.read_text()
        workbook = download('#exportExcel', 'GLIAX_informe_ficticio.xlsx')
        with zipfile.ZipFile(workbook) as sheet:
            ns = {'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            root = ET.fromstring(sheet.read('xl/worksheets/sheet1.xml'))
            def cell(ref):
                return root.find(f'.//m:c[@r="{ref}"]/m:v', ns).text
            assert [int(cell(ref)) for ref in ['B5','B6','B7','B8']] == [2,1,1,1]
        if evidence:
            page.locator('#progress').screenshot(path=str(evidence / 'progreso-escritorio.png'))
        page.set_viewport_size({'width': 390, 'height': 844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        assert page.locator('#progress .accuracy-ring > div').evaluate_all('''elements=>elements.every(el=>{
          const bounds=el.getBoundingClientRect(),outer=el.parentNode.getBoundingClientRect();
          return bounds.left>=outer.left && bounds.right<=outer.right && bounds.top>=outer.top && bounds.bottom<=outer.bottom;
        })''')
        if evidence:
            page.locator('#progress').screenshot(path=str(evidence / 'progreso-movil.png'))

        page.set_viewport_size({'width': 1360, 'height': 960})
        area(page, 'communication').click()
        for _ in range(7):
            page.wait_for_function('()=>document.querySelector("#exerciseOptions .option-btn")')
            if page.locator('.digital-stimulus').count():
                break
            page.locator('#exerciseOptions .option-btn').first.click()
            page.locator('#exerciseNext').click()
        assert page.locator('.digital-stimulus').is_visible()
        if evidence:
            page.locator('#exercise').screenshot(path=str(evidence / 'comunicacion-digital.png'))
        workspace(page).locator('#navMenu [data-section="homework"]').click()
        page.locator('#worksheetNone').click()
        for domain in ('communication','teenLanguage','executive','attention'):
            page.locator(f'#homeworkOptions input[value="{domain}"]').check()
        page.locator('#worksheetCount').select_option('1')
        page.locator('#worksheetQuestions').select_option('12')
        page.locator('#worksheetSolutions').check()
        bundle = download('#generateWorksheetsBtn', 'GLIAX_16-18_muestra.zip')
        with zipfile.ZipFile(bundle) as outer:
            assert len(outer.namelist()) == 2
            for name in outer.namelist():
                with zipfile.ZipFile(io.BytesIO(outer.read(name))) as doc:
                    text = doc.read('word/document.xml').decode()
                    assert 'GLIAX' in doc.read('docProps/core.xml').decode()
                    assert 'w:w="11906"' in text and 'w:h="16838"' in text
                    assert 'Level Up' not in text and 'Learning Lab' not in text
                    if 'solucionario' in name:
                        assert 'Solucionario profesional' in text
                    else:
                        assert text.count('<w:pageBreakBefore/>') == 11
        workspace(page).locator('#profileSelect').select_option('early')
        workspace(page).locator('#navMenu [data-section="homework"]').click()
        page.locator('#worksheetNone').click()
        page.locator('#homeworkOptions input[value="division"]').check()
        page.locator('#worksheetCount').select_option('1')
        page.locator('#worksheetLevel').select_option('2')
        page.locator('#worksheetQuestions').select_option('6')
        page.locator('#worksheetSolutions').uncheck()
        primary = download('#generateWorksheetsBtn', 'GLIAX_6-7_matematicas.docx')
        with zipfile.ZipFile(primary) as doc:
            text = doc.read('word/document.xml').decode()
            assert text.count('<w:pageBreakBefore/>') == 5
            assert '6-7 años' in text
        assert not errors,errors
        browser.close()
    print('PASS: panel responsive, report totals and labels, actual CSV/XLSX, digital communication and separate GLIAX A4 DOCX files')
finally:
    server.shutdown()
    server.server_close()

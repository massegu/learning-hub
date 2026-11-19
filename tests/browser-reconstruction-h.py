"""Exercise the real catalogue/Word flow, with an offline favorites SDK double."""
import importlib.util
import io
import os
from pathlib import Path
import tempfile
import threading
import zipfile

from playwright.sync_api import expect, sync_playwright
from browser_support import ROOT, workspace

spec = importlib.util.spec_from_file_location('review', ROOT / 'tools/review-preview.py')
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)
server = review.ReviewServer(('127.0.0.1', 0), review.prepare())
threading.Thread(target=server.serve_forever, daemon=True).start()
evidence = Path(os.environ['GLIAX_H_EVIDENCE']) if os.environ.get('GLIAX_H_EVIDENCE') else None

try:
    with sync_playwright() as playwright, tempfile.TemporaryDirectory() as temp:
        browser = playwright.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'), args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1280, 'height': 960})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
        workspace(page).locator('#profileSelect').select_option('teen')
        page.evaluate("""()=>{
          const client=LearningAPI.client,from=client.from.bind(client);
          const rows=window.__hFavorites=[];
          client.from=table=>{
            if(table!=='worksheet_favorites')return from(table);
            const filters=[];
            let mode='read',values;
            const execute=()=>{
              const own=rows.filter(row=>row.account_id===LearningAPI.user.id&&filters.every(([key,value])=>row[key]===value));
              if(mode==='insert'){
                const row={...structuredClone(values),id:crypto.randomUUID(),account_id:LearningAPI.user.id};
                rows.push(row);return {data:row};
              }
              if(mode==='update'){Object.assign(own[0],structuredClone(values));return {data:own[0]};}
              if(mode==='delete'){rows.splice(rows.indexOf(own[0]),1);return {data:own[0]};}
              return {data:own};
            };
            const q={select:()=>q,order:()=>q,eq:(key,value)=>{filters.push([key,value]);return q;},
             insert:row=>{mode='insert';values=row;return q;},
             update:row=>{mode='update';values=row;return q;},
             delete:()=>{mode='delete';return q;},
             single:()=>Promise.resolve(execute()),then:(resolve,reject)=>Promise.resolve(execute()).then(resolve,reject)};
            return q;
          };
        }""")
        workspace(page).locator('#navMenu [data-section="homework"]').click()
        expect(page.locator('#quickWorksheet')).to_be_visible()
        expect(page.locator('#homeworkOptions input[value="memory"]')).to_be_disabled()
        page.get_by_role('button', name='Ficha a la carta', exact=True).click()
        expect(page.locator('#hStatus')).to_contain_text('Elige un área', timeout=30000)
        page.locator('#hAge').select_option('primary')
        page.locator('#hLevel').select_option('2')
        page.locator('#hLocale').select_option('es_mx')
        expect(page.locator('#hStatus')).to_contain_text('Elige un área', timeout=30000)

        def set_count(family, count):
            field = page.locator(f'#hFamilies input[data-family="{family}"]')
            expect(field).to_have_count(1)
            group = field.locator('xpath=ancestor::details')
            if not group.evaluate('e=>e.open'):
                group.locator('summary').click()
            field.fill(str(count))

        set_count('language:words', 2)
        set_count('executive:deduction', 2)
        set_count('communication:help', 1)
        expect(page.locator('#hTotal')).to_contain_text('5 actividades por ficha')
        page.get_by_role('button', name='Subir Descubre quién').click()
        expect(page.locator('#hOrder li').first).to_contain_text('Descubre quién')
        page.locator('#hOrientation').select_option('curricular')
        expect(page.locator('#hFamilies input[data-family="communication:help"]')).to_have_count(0)
        expect(page.locator('#hTotal')).to_contain_text('5 actividades por ficha')
        page.locator('#hOrientation').select_option('')
        page.locator('#hVersions').select_option('2')
        expect(page.locator('#hShortages')).to_contain_text('disponibles 1 de 2')
        expect(page.locator('#hGenerate')).to_be_disabled()
        page.locator('#hVersions').select_option('1')

        page.locator('#hFavoriteName').fill('Taller de lectura')
        page.locator('#hSave').click()
        expect(page.locator('#hFavorite option')).to_have_count(2)
        original = page.locator('#hFavorite').input_value()
        page.locator('#hClear').click()
        expect(page.locator('#hTotal')).to_contain_text('0 actividades')
        page.locator('#hLoad').click()
        expect(page.locator('#hStatus')).to_contain_text('Elige un área', timeout=30000)
        expect(page.locator('#hTotal')).to_contain_text('5 actividades')
        page.locator('#hFavoriteName').fill('Taller de lectura revisado')
        set_count('language:words', 3)
        page.locator('#hUpdate').click()
        expect(page.locator(f'#hFavorite option[value="{original}"]')).to_have_text('Taller de lectura revisado')
        page.locator('#hDuplicate').click()
        expect(page.locator('#hFavorite option')).to_have_count(3)
        expect(page.locator('#hTotal')).to_contain_text('6 actividades')
        assert page.evaluate('__hFavorites.every(row=>!JSON.stringify(row.configuration).includes("profile_id"))')
        page.once('dialog', lambda dialog: dialog.accept())
        page.locator('#hDelete').click()
        expect(page.locator('#hFavorite option')).to_have_count(2)
        page.locator('#hFavorite').select_option(original)
        page.locator('#hLoad').click()
        expect(page.locator('#hStatus')).to_contain_text('Elige un área', timeout=30000)
        if evidence:
            page.locator('#paperConfigurator').screenshot(path=str(evidence/'configurador-escritorio.png'))
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        if evidence:
            page.locator('#paperConfigurator').screenshot(path=str(evidence/'configurador-movil.png'))
        with page.expect_download(timeout=60000) as pending:
            page.locator('#hGenerate').click()
        download = pending.value
        assert download.suggested_filename.startswith('GLIAX_10-12_')
        path = (evidence or Path(temp)) / 'GLIAX_ficha-a-la-carta.zip'
        download.save_as(path)
        with zipfile.ZipFile(path) as bundle:
            assert len(bundle.namelist()) == 2
            for entry in bundle.namelist():
                with zipfile.ZipFile(io.BytesIO(bundle.read(entry))) as doc:
                    xml = doc.read('word/document.xml').decode()
                    assert 'México' in xml
                    assert 'w:w="11906"' in xml and 'w:h="16838"' in xml
                    if '_ficha_' in entry:
                        assert xml.count('Tipología · Descubre quién') == 2
                        assert xml.count('Tipología · La palabra que encaja') == 3
                        assert xml.count('Tipología · Pedir ayuda') == 1
                        assert xml.count('Tipología · ') == 6
        page.get_by_role('button', name='Selección rápida por áreas').click()
        expect(page.locator('#quickWorksheet')).to_be_visible()
        expect(page.locator('#paperConfigurator')).to_be_hidden()
        assert not errors, errors
        browser.close()
    print('PASS: local Edge, exact ordered DOCX, favorites CRUD, unavailable counts, mobile and quick mode')
finally:
    server.shutdown()
    server.server_close()

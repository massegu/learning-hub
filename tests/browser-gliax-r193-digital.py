"""Static and interactive screens in the real GLIAX shell with synthetic data."""
import importlib.util
import os
from pathlib import Path
import threading

from playwright.sync_api import expect, sync_playwright
from browser_support import ROOT, workspace, area

spec=importlib.util.spec_from_file_location('review', ROOT/'tools/review-preview.py')
review=importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)

cases={
    'calendar': ('primary',1,'app'),
    'search': ('primary',1,'search'),
    'chat': ('junior',2,'message'),
    'mail': ('junior',2,'mail'),
    'files': ('primary',2,'files'),
    'form': ('early',2,'form'),
    'booking': ('primary',3,'booking'),
}

def inspect(screen, kind):
    if kind=='calendar':
        screen.get_by_role('button',name='Semana siguiente').press('Enter')
        expect(screen.locator('.r193-event')).to_have_count(0)
        screen.get_by_role('button',name='Semana del ejercicio').press('Enter')
        screen.locator('.r193-event').first.press('Enter')
        expect(screen.get_by_role('region',name='Detalle del evento')).to_contain_text('09:15')
    elif kind in ('search','chat'):
        box=screen.get_by_role('searchbox')
        box.fill('no-existe-en-este-ejercicio')
        box.press('Enter')
        expect(screen.get_by_role('status')).to_contain_text('Sin coincidencias')
        box.fill('')
        if kind=='search':
            screen.get_by_role('button',name='Oficiales',exact=True).press('Enter')
            screen.locator('.r193-result-link').first.press('Enter')
            expect(screen.get_by_role('complementary')).to_be_focused()
    elif kind=='form':
        screen.get_by_role('button',name='Revisar formulario').press('Enter')
        expect(screen.get_by_role('status')).to_contain_text('Elige el día')
        screen.get_by_role('combobox').select_option('Lunes')
        screen.get_by_role('button',name='Revisar formulario').press('Enter')
        expect(screen.get_by_role('status')).to_contain_text('obligatorios están listos')
    else:
        if kind=='files':
            screen.get_by_role('button',name='Entregas',exact=True).press('Enter')
        if kind=='booking':
            screen.get_by_role('button',name='Libre',exact=True).press('Enter')
        screen.locator('.r193-open-entry:visible').first.press('Enter')
        expect(screen.locator('.r193-app-reading h4')).to_be_visible()
        if kind=='mail':
            screen.locator('.r193-attachment summary').press('Enter')
            expect(screen.locator('.r193-attachment')).to_have_attribute('open','')

with review.ReviewServer(('127.0.0.1',0),review.prepare()) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=os.getenv('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1440,'height':1000})
            local=f'http://127.0.0.1:{server.server_port}'
            denied=[]
            page.set_default_timeout(6000)
            def only_local(route):
                if route.request.url.startswith(local+'/'):
                    route.continue_()
                else:
                    denied.append(route.request.url)
                    route.abort()
            page.route('**/*',only_local)
            page.goto(local,wait_until='networkidle')
            workspace(page)
            workspace(page).locator('#profileSelect').select_option('junior')
            area(page,'communication').click()
            settings=page.locator('#activityOptions')
            if not settings.evaluate('el=>el.open'):
                settings.locator('summary').click()
            page.locator('#exerciseLevelSelect').select_option('2')
            page.locator('#digitalModeButton').click()
            # Real navigation must reach a revision-20 case with authenticated
            # delivery through the local Edge runtime.
            for _ in range(9):
                try:
                    page.wait_for_function("()=>document.querySelector('#exerciseVisual [data-presentation],#exerciseVisual .digital-stimulus')")
                except Exception as error:
                    raise AssertionError(page.locator('#exercisePrompt').text_content()) from error
                if page.locator('#exerciseVisual .r193-mail').count():
                    break
                page.locator('#exerciseOptions .option-btn').first.click()
                page.locator('#exerciseNext').click()
            else:
                raise AssertionError('The revision-20 mail case was not delivered by the interface')
            page.locator('#exerciseVisual .r193-mail .r193-open-entry').first.click()
            expect(page.locator('#exerciseVisual .r193-mail .r193-attachment')).to_contain_text('Plano.pdf')

            evidence=Path(os.environ.get('GLIAX_R193_CAPTURE_DIR','/tmp/gliax-r193-digital-evidence'))
            evidence.mkdir(parents=True,exist_ok=True)
            for kind, (age,level,fmt) in cases.items():
                for presentation in ('static','interactive'):
                    for width in (1440,390):
                        page.set_viewport_size({'width':width,'height':1000})
                        page.evaluate('''args=>{
                          const [age,level,format,presentation]=args;
                          const item=CommunicationContent.transversalPool(age,level,'communication',format,20)[0];
                          item.screenPresentation=presentation;
                          const visual=document.querySelector('#exerciseVisual');
                          visual.innerHTML=ActivityModel.interactiveStimulus(item.stimulus);
                          GliaxR193Digital.mount(visual,item);
                        }''',[age,level,fmt,presentation])
                        screen=page.locator(f'#exerciseVisual .r193-app.r193-{kind}')
                        expect(screen).to_have_attribute('data-presentation',presentation)
                        if presentation=='interactive':
                            inspect(screen,kind)
                        else:
                            assert screen.locator('input,button,select,summary').count()==0
                        assert screen.evaluate('el=>el.scrollWidth<=el.clientWidth+1')
                        screen.screenshot(path=evidence/f'{kind}-{presentation}-{width}.png')
            assert not denied, denied
            browser.close()
        print('PASS: real automatic mail delivery, 7 families, 2 presentations, desktop and mobile, 28 captures.')
    finally:
        server.shutdown()

"""Chromium checks for fictional digital screens and content errors on loopback."""
import importlib.util
import os
from pathlib import Path
import threading

from playwright.sync_api import expect, sync_playwright
from browser_support import ROOT, area, workspace

spec = importlib.util.spec_from_file_location('review', ROOT / 'tools/review-preview.py')
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)

evidence = os.getenv('GLIAX_REVIEW_BROWSER_EVIDENCE')
if evidence:
    evidence = Path(evidence)
    evidence.mkdir(parents=True, exist_ok=True)

with review.ReviewServer(('127.0.0.1', 0), review.prepare()) as server:
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                executable_path=os.getenv('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'), args=['--no-sandbox'])
            page = browser.new_page(viewport={'width': 1360, 'height': 950})
            denied = []
            local = f'http://127.0.0.1:{server.server_port}'

            def keep_local(route):
                if route.request.url.startswith(local + '/'):
                    route.continue_()
                else:
                    denied.append(route.request.url)
                    route.abort()

            page.route('**/*', keep_local)
            page.goto(local, wait_until='networkidle')
            page.evaluate('''() => {
              const original=LearningAPI.requestContent;
              LearningAPI.requestContent=async request=>{
                const response=await original(request);
                if(request.digital_only)window.__stagingSimulation=response.items?.[0];
                return response;
              };
            }''')
            for profile, viewport in [('teen', {'width': 1360, 'height': 950}),
                                      ('early', {'width': 390, 'height': 844})]:
                page.set_viewport_size(viewport)
                workspace(page).locator('#profileSelect').select_option(profile)
                area(page, 'communication').click()
                page.locator('#digitalModeButton').click()
                assert not page.locator('#digitalFamilySelect').count()
                views = ['chat','social','video','story','search','settings','editor']
                for index, view in enumerate(views):
                    if index:
                        page.locator('#exerciseOptions .option-btn').first.click()
                        page.locator('#exerciseNext').click()
                    selector = {'search':'.r193-search', 'editor':'.r193-calendar', 'chat':'.r193-chat'}.get(view, f'.digital-{view}')
                    screen = page.locator(f'#exerciseVisual {selector}')
                    expect(screen).to_be_visible()
                    expect(screen.locator('dt, .r193-hit h4, .r193-calendar-days button, .r193-thread strong').first).to_be_visible()
                    expect(page.locator('#exerciseOptions button')).to_have_count(3)
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                    if view == 'video':
                        summary = screen.locator('summary')
                        summary.focus()
                        summary.press('Enter')
                        expect(screen.locator('dl')).to_be_hidden()
                        summary.press('Enter')
                        expect(screen.locator('dl')).to_be_visible()
                    if evidence and view in ('chat','video','search'):
                        screen.screenshot(path=evidence / f'{profile}-{view}.png')
                answer = page.evaluate("""() => {
                    const item=window.__stagingSimulation;
                    const locale=LearningAPI.effectiveLocale();
                    return LocaleContent.localizeItem(item,locale,'communication').a;
                }""")
                page.get_by_role('button', name=answer, exact=True).click()
                expect(page.locator('#exerciseFeedback')).to_have_class('feedback ok')

            page.evaluate("""() => {
              const client=LearningAPI.client;
              client.functions.invoke=async()=>({data:null,error:{
                context:new Response(JSON.stringify({
                  error:'Daily content limit reached',code:'CONTENT_DELIVERY_LIMIT',
                  usage:{kind:'exercise',scope:'account',used:30,limit:30,reset_at:'2099-01-01T00:00:00.000Z'}
                }))
              }});
            }""")
            for domain in ['attention','communication']:
                area(page,domain).click()
                expect(page.locator('#exercisePrompt')).to_contain_text('entregas de ejercicios de la cuenta (30 de 30)')
                expect(page.locator('#retryContentLoad')).to_be_hidden()
            page.evaluate("""() => {
              LearningAPI.client.functions.invoke=async()=>({data:null,error:{message:'Failed to send request to Edge Function'}});
            }""")
            area(page,'attention').click()
            expect(page.locator('#exercisePrompt')).to_contain_text('No se pudo cargar el contenido.')
            expect(page.locator('#retryContentLoad')).to_be_visible()
            assert not denied, denied
            browser.close()
        print('PASS: 7 tipos de pantalla, escritorio y móvil, teclado, respuesta, aviso de cuota y error recuperable')
    finally:
        server.shutdown()

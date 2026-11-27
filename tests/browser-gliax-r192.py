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


def open_mode(page, family, item_id=None):
    page.locator(f'[data-r192-family="{family}"]').press('Enter')
    if item_id and current_case(page) != item_id:
        new_round_until(page, '__r4Round.id === ' + repr(item_id))
    item_id = item_id or page.evaluate('__r4Round.id')
    expect(page.locator('#exerciseOptions')).to_have_attribute('data-case', item_id)


def current_case(page):
    return page.locator('#exerciseOptions').get_attribute('data-case')


def new_round_until(page, expression, limit=50):
    for _ in range(limit):
        if page.evaluate(expression):
            return
        before = current_case(page)
        page.locator('#r192NewRound').press('Enter')
        assert current_case(page) != before
    raise AssertionError('The expected case was never selected: ' + expression)


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
    expect(page.locator('#exercisePrompt')).to_be_focused()
    page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
    expect(page.locator('.r192-validation')).to_have_text('Elige una opción antes de comprobar.')
    expect(page.locator('.r192-validation')).to_have_attribute('role', 'status')
    expect(page.get_by_role('radio').first).to_be_focused()
    visual = page.locator('.r192-choice').first.evaluate(r'''label => {
      const rgb = color => color.match(/[\d.]+/g).map(Number);
      function background(element) {
        const layers = [];
        for (let node = element; node; node = node.parentElement) {
          layers.unshift(rgb(getComputedStyle(node).backgroundColor));
        }
        return layers.reduce((below, layer) =>
          below.map((value, channel) => layer[channel] * (layer[3] ?? 1) + value * (1-(layer[3] ?? 1))), [255,255,255]);
      }
      const luminance = channels => channels.slice(0,3)
        .map(n => n/255).map(c => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4)
        .reduce((sum,c,i) => sum + c*[.2126,.7152,.0722][i],0);
      const contrast = (a,b) => (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      const color = luminance(rgb(getComputedStyle(label).color));
      const backdrop = luminance(background(label));
      const style = getComputedStyle(label);
      return [contrast(color,backdrop), contrast(luminance(rgb(style.outlineColor)),backdrop),
        parseFloat(style.outlineWidth), style.outlineStyle];
    }''')
    assert visual[0] >= 4.5 and visual[1] >= 3 and visual[2] >= 2 and visual[3] == 'solid', visual
    for name in ['Ana prepara imágenes. Revisamos al terminar texto e imágenes', 'Leo prepara imágenes. Revisamos al terminar texto e imágenes']:
        page.get_by_role('radio', name=name).press('Space')
        page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
        expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
        expect(page.locator('#exerciseNext')).to_have_attribute('aria-describedby', 'exerciseFeedback')
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
    if current_case(page) != 'CP12':
        new_round_until(page, "__r4Round.id === 'CP12'")
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


    choose_profile(page, 'early')
    area(page, 'attention').click()
    set_level(page, 1)
    open_mode(page, 'EC')
    if current_case(page)!='EC193-01':
        new_round_until(page, "__r4Round.id === 'EC193-01'")
    expect(page.locator('#exerciseOptions')).to_have_attribute('data-case','EC193-01')
    page.get_by_role('radio',name='Sí. La regla dice qué hacer al cerrar.').check()
    page.get_by_role('button',name='Comprobar',exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_contain_text('Deja sin decidir el color')
    page.locator('#exerciseNext').click()
    assert current_case(page) != 'EC193-01'
    if not page.evaluate('!!__r4Round.logicEditorial'):
        new_round_until(page, '__r4Round.logicEditorial')
    option=page.evaluate('''()=>{
      const item=__r4Round;
      return item.presentation.options.find(o=>GliaxR193Editorial.grade(item,{choice:o.id}).status==='correct').label;
    }''')
    page.get_by_role('radio',name=option,exact=True).check()
    page.get_by_role('button',name='Comprobar',exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status','correct')
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
    expect(draft).to_be_focused()
    expect(draft).to_have_attribute('aria-describedby', 'r192-open-hint')
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
    open_mode(page, 'IN')
    answers = {'IN06': 'Depende del tiempo de viaje', 'IN-06 complete-data': 'Sí, llego a las 16:50'}
    if current_case(page) not in answers:
        new_round_until(page, "['IN06','IN-06 complete-data'].includes(__r4Round.id)")
    first = current_case(page)
    for index in range(2):
        if index and current_case(page) not in answers:
            new_round_until(page, "['IN06','IN-06 complete-data'].includes(__r4Round.id)")
        item = current_case(page)
        if index:
            assert item != first
        page.get_by_role('textbox', name='Escribe tu respuesta').fill(answers[item])
        page.get_by_role('button', name='Comprobar', exact=True).click()
        expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
        if not index:
            page.locator('#exerciseNext').press('Enter')
    assert_width(page)


def rules(page):
    choose_profile(page, 'early')
    area(page, 'executive').click()
    expect(page.locator('[data-r192-family="AR"]')).to_have_count(0)
    choose_profile(page, 'junior')
    area(page, 'executive').click()
    set_level(page, 2)
    open_mode(page, 'AR')
    schedules = {
        'AR08': [('círculo', True), ('triángulo', False), None, ('círculo', False), ('triángulo', True)],
        'AR08-r4-1': [('triángulo', False), ('círculo', True), ('círculo', True), None, ('círculo', False), ('triángulo', True)],
        'AR08-r4-2': [('círculo', True), ('triángulo', False), None, ('triángulo', True), ('círculo', False), ('círculo', False)],
    }

    def solve():
        if current_case(page).startswith(('AR193-B3-','AR193-B8-')):
            events=page.evaluate("()=>{const item=__r4Round;const grade=item.routingEditorial?GliaxR193EditorialRouting.trials(item):GliaxR193EditorialRules.evaluate(item);const byId=new Map(grade.map(e=>[e.id,e]));return item.presentation.events.map(e=>[e.type,e.label,byId.get(e.id)?.expected]);}")
            for kind,label,answer in events:
                expect(page.locator('.r192-rule-label')).to_have_text(label)
                if kind=='signal':
                    page.get_by_role('button',name='Continuar',exact=True).press('Enter')
                else:
                    if answer not in ('wait','W'):
                        page.get_by_role('button',name=answer,exact=True).press('Enter')
                    page.get_by_role('button',name='Siguiente estímulo').press('Enter')
            expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status','correct')
            return
        sequence = schedules[current_case(page)]
        for event in sequence:
            if event is None:
                expect(page.locator('.r192-rule-card')).to_have_attribute('data-event', 'signal')
                expect(page.get_by_role('button', name='Responder', exact=True)).to_have_count(0)
                expect(page.locator('#exerciseFeedback')).to_be_empty()
                page.get_by_role('button', name='Continuar', exact=True).press('Enter')
            else:
                label, act = event
                expect(page.locator('.r192-rule-label')).to_have_text(label)
                if act:
                    respond = page.get_by_role('button', name='Responder', exact=True)
                    respond.press('Enter')
                    expect(respond).to_have_attribute('aria-pressed', 'true')
                page.get_by_role('button', name='Siguiente estímulo').press('Enter')
        expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
        scored = len(sequence) - 1
        expect(page.locator('#exerciseFeedback')).to_contain_text(f'{scored} de {scored} estímulos')

    first = current_case(page)
    before = page.evaluate('({n:__r4Selections, surface:__r4Round.surfaceFingerprint})')
    solve()
    page.get_by_role('button', name='Repetir', exact=True).press('Enter')
    assert current_case(page) == first
    assert page.evaluate('({n:__r4Selections, surface:__r4Round.surfaceFingerprint})') == before
    page.locator('#r192NewRound').press('Enter')
    second = current_case(page)
    assert second != first
    assert page.evaluate('__r4Selections') == before['n'] + 1
    solve()
    page.locator('#exerciseNext').press('Enter')
    assert current_case(page) != second
    assert page.evaluate('__r4Selections') == before['n'] + 2
    assert_width(page)


def executive(page):
    choose_profile(page, 'primary')
    area(page, 'executive').click()
    set_level(page, 2)
    open_mode(page, 'planning')
    if page.evaluate('!!__r4Round.planEditorial'):
        new_round_until(page, '!__r4Round.editorial')
    boundary = page.evaluate('({requests:__requests.length,saves:__saved.length,results:localStorage.getItem("__mock_exercise_results")})')
    item = page.evaluate("__r4Round")
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

    open_mode(page, 'constraints')
    new_round_until(page, "__r4Round.id.endsWith('-several')")
    expect(page.locator('#exerciseVisual table')).to_contain_text('Piezas incluidas')
    table_context = page.get_by_role('region', name='Material para resolver el ejercicio')
    expect(table_context).to_have_attribute('tabindex', '0')
    assert table_context.evaluate("(element) => ['auto', 'scroll'].includes(getComputedStyle(element).overflowX)")
    saved_viewport = page.viewport_size
    page.set_viewport_size({'width': 320, 'height': 780})
    assert_width(page)
    page.set_viewport_size(saved_viewport)
    alternate = page.evaluate('''() => __r4Round.opts.find(option => option !== __r4Round.a &&
      GliaxR192Constraints.gradeConstraints(__r4Round, option).gradedCorrect)''')
    page.get_by_role('radio', name=alternate, exact=True).check()
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')

    open_mode(page, 'supervision')
    new_round_until(page, '__r4Round.answers?.length === 0')
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    page.locator('#exerciseNext').click()
    new_round_until(page, '__r4Round.answers?.length > 0')
    rows = page.evaluate('__r4Round.answers')
    for row in rows:
        page.get_by_role('checkbox', name=row, exact=True).check()
    page.get_by_role('button', name='Comprobar', exact=True).click()
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    assert_width(page)

    open_mode(page, 'goal-change')
    new_round_until(page, '__r4Round.sourceId === "CP08"')
    page.get_by_role('radio', name='Leo prepara imágenes. Revisamos al terminar texto e imágenes').check()
    page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    page.locator('#exerciseNext').press('Enter')
    if page.evaluate('__r4Round.answerModel.kind') != 'priority':
        new_round_until(page, "__r4Round.answerModel.kind === 'priority' && __r4Round.opts.includes('Enviar el cambio de hora a quienes asisten')")
    assert page.evaluate('__r4Round.answerModel.kind') == 'priority'
    page.get_by_role('radio', name='Enviar el cambio de hora a quienes asisten').check()
    page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status', 'correct')
    assert_width(page)
    assert page.evaluate('({requests:__requests.length,saves:__saved.length,results:localStorage.getItem("__mock_exercise_results")})') == boundary


def editorial_planning(page):
    choose_profile(page, 'early')
    area(page, 'executive').click()
    set_level(page, 2)
    open_mode(page, 'planning')
    if current_case(page) != 'PL193-01':
        new_round_until(page, "__r4Round.id === 'PL193-01'")
    for label in ('Papel, vaso, agua.', 'Vaso, papel, agua.'):
        page.get_by_role('radio', name=label, exact=True).check()
        page.get_by_role('button', name='Comprobar', exact=True).press('Enter')
        expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status','correct')
        expect(page.locator('#exerciseFeedback')).to_contain_text('en cualquier orden')
        page.get_by_role('button', name='Repetir', exact=True).press('Enter')


def editorial_order_lot(page):
    choose_profile(page, 'early')
    area(page, 'executive').click()
    set_level(page, 1)
    open_mode(page, 'planning')
    if '-B1-' not in current_case(page):
        new_round_until(page, '__r4Round.planEditorial')
    expected=page.evaluate('''()=>{
      const item=__r4Round;
      const {steps}=item.presentation;
      function orders(first,rest){
        if(!rest.length)return [first];
        return rest.flatMap(x=>orders([...first,x],rest.filter(y=>y!==x)));
      }
      const accepted=orders([],steps.map(info=>info.id)).find(ids=>GliaxR193Editorial.grade(item,ids).gradedCorrect);
      return accepted.map(id=>steps.find(info=>info.id===id).label);
    }''')
    for index, label in enumerate(expected):
        current=page.locator('.r192-order li span').all_text_contents().index(label)
        for _ in range(current-index):
            page.get_by_role('button',name='Subir '+label,exact=True).press('Enter')
    page.get_by_role('button',name='Comprobar',exact=True).press('Enter')
    expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status','correct')
    expect(page.locator('#exerciseFeedback')).to_contain_text('El orden cumple')
    assert_width(page)


def inventory(page):
    assert page.evaluate('''() => {
      const ids = new Set();
      for (const ageBand of ['early','junior','primary','middle','teen']) {
        for (const level of [1,2,3]) {
          for (const family of ['CP','EC','IN','AR']) {
            const entries = GliaxR192Diversity.candidates({family,ageBand,level,seed:0});
            if (family === 'AR' && ageBand === 'early' && entries.length) return false;
            for (const {item} of entries) {
              if (item.ageBand !== ageBand || item.level !== level) return false;
              ids.add(item.id);
            }
          }
        }
      }
      return ids.size === 82 && GliaxR192Bank.getCaseIds().every(id => ids.has(id));
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
            unexpected_service_requests = []
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
                    if route.request.resource_type in ('fetch', 'xhr', 'websocket'):
                        unexpected_service_requests.append(address)
                    route.abort()

            page.route('**/*', intercept)
            page.goto(url, wait_until='networkidle')
            page.evaluate('''() => {
              const createSession = GliaxR192Practice.createSession;
              window.__r4Selections = 0;
              GliaxR192Practice.createSession = () => {
                const session = createSession('browser-r4');
                return {next(...args) {
                  window.__r4Selections++;
                  return window.__r4Round = session.next(...args);
                }};
              };
            }''')
            inventory(page)
            cp_ec(page)
            information(page)
            rules(page)
            page.set_viewport_size({"width": 1440, "height": 1000})
            executive(page)
            page.set_viewport_size({"width": 390, "height": 844})
            executive(page)
            editorial_planning(page)
            editorial_order_lot(page)
            legacy_reports(page)
            page.evaluate('window.LH_CONFIG.r192Practice = false')
            area(page, 'executive').click()
            expect(page.locator('#r192Modalities')).not_to_be_visible()
            expect(page.locator('#documentModeSwitch [data-documents=false]')).to_be_visible()
            assert not errors, errors
            assert not unexpected_service_requests, unexpected_service_requests
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print('PASS: R1/R2 por edad y nivel, Repetir/Siguiente/Nueva ronda, teclado, privacidad, móvil y CSV/XLSX históricos')


if __name__ == '__main__':
    main()

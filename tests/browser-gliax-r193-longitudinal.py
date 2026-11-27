"""Browser integration on loopback using a synthetic Auth and results adapter."""
import functools
import http.server
import os
import threading

from playwright.sync_api import expect, sync_playwright
from browser_support import ROOT, SDK, QuietHandler, area, workspace

handler=functools.partial(QuietHandler,directory=str(ROOT))
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as playwright:
        browser=playwright.chromium.launch(executable_path=os.getenv('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':1440,'height':1000})
        denied=[]
        def intercept(route):
            address=route.request.url
            if address==url+'js/config.js':
                config=f"\nObject.assign(LH_CONFIG,{{supabaseUrl:{url!r},r192Practice:true,r193Longitudinal:true}});"
                route.fulfill(content_type='application/javascript',body=(ROOT/'js/config.js').read_text()+config)
            elif 'cdn.jsdelivr.net/npm/@supabase/supabase-js' in address:
                route.fulfill(content_type='application/javascript',body=SDK)
            elif address.startswith(url):
                route.continue_()
            else:
                if route.request.resource_type in ('fetch','xhr','websocket'):
                    denied.append(address)
                route.abort()
        page.route('**/*',intercept)
        page.goto(url,wait_until='networkidle')
        datasets=page.evaluate('''()=>{
          const profiles=['A','B'].map(id=>({id,name:'Perfil-'+id,age_band:'primary',progress:{initialLevel:2}}));
          const pool=GliaxR192Diversity.candidates({family:'constraints',ageBand:'primary',level:2,seed:1});
          const variants=[...new Map(pool.map(item=>[item.structure,item])).values()].slice(0,3);
          const rows={};
          for (const id of ['A','B']) for(let i=0;i<12;i++) {
            const item=variants[i%3];
            const draft=GliaxR193Longitudinal.createDraft(item.item,item);
            draft.observe(id==='A'?'correct':'incorrect',undefined,4500);
            const client_attempt_id=crypto.randomUUID();
            const ts=new Date(Date.now()-3600000*(i+1)).toISOString();
            rows[client_attempt_id]={client_attempt_id,profile_id:id,level:2,subject:'executive',occurred_at:ts,
              session_id:'visita-'+Math.floor(i/4),correct:null,points:0,item_id:item.id,
              detail:JSON.stringify(draft.summary())};
          }
          return {profiles,rows};
        }''')
        import json
        page.add_init_script('''(() => {
          if (sessionStorage.getItem('r193-seeded')) return;
          sessionStorage.setItem('r193-seeded','yes');
          const fixtures = ''' + json.dumps(datasets) + ''';
          localStorage.setItem('__mock_profiles',JSON.stringify(fixtures.profiles));
          localStorage.setItem('__mock_exercise_results',JSON.stringify(fixtures.rows));
          localStorage.setItem('lh_current_profile','A');
        })();''')
        page.set_default_timeout(7000)
        page.reload(wait_until='networkidle')

        def exercise(profile,family):
            workspace(page).locator('#profileSelect').select_option(profile)
            area(page,'executive').click()
            details=page.locator('#activityOptions')
            if not details.evaluate('node=>node.open'):
                details.locator('summary').click()
            page.locator('#exerciseLevelSelect').select_option('2')
            page.locator(f'[data-r192-family="{family}"]').click()
            expect(page.locator('#exerciseOptions')).to_have_attribute('data-level','2')
            expect(page.locator('#r193Adaptive')).to_be_visible()

        def seek(predicate):
            for _ in range(50):
                if page.evaluate(predicate):
                    return
                page.locator('#r192NewRound').click()
            raise AssertionError(f'Activity state did not appear: {predicate}')

        def recommendation(text):
            placeholder = page.locator('#r193Recommendation')
            expect(placeholder).not_to_be_empty()
            seek(f"()=>document.querySelector('#r193Recommendation').textContent.includes({json.dumps(text)})")
            expect(placeholder).to_contain_text(text)

        exercise('A','constraints')
        recommendation('nivel 3')
        exercise('B','constraints')
        recommendation('reforzar')
        page.locator('#r193Adaptive').uncheck()
        expect(page.locator('#r193Recommendation')).to_be_empty()
        page.wait_for_function("()=>__profiles.find(p=>p.id==='B').progress.r193Adaptive===false")
        exercise('A','CP')
        seek("()=>document.querySelector('#exerciseOptions').dataset.case==='CP08'")
        expect(page.locator('#exerciseVisual')).to_contain_text('Práctica registrada al continuar')
        page.get_by_role('radio',name='Ana prepara imágenes. Revisamos al terminar texto e imágenes').check()
        page.get_by_role('button',name='Comprobar',exact=True).click()
        expect(page.locator('#exerciseFeedback')).to_have_attribute('data-status','correct')
        page.locator('#exerciseNext').click()
        page.wait_for_function("()=>Object.values(JSON.parse(localStorage.getItem('__mock_exercise_results'))).length===25")
        result=page.evaluate("""()=>Object.values(JSON.parse(localStorage.getItem('__mock_exercise_results')))
          .find(row=>row.item_id==='CP08')""")
        assert result['profile_id']=='A' and result['correct'] is None
        assert 'Revisamos' not in result['detail']
        page.reload(wait_until='networkidle')
        exercise('A','constraints')
        recommendation('nivel 3')
        exercise('B','constraints')
        expect(page.locator('#r193Adaptive')).not_to_be_checked()
        page.locator('#r193Adaptive').check()
        recommendation('reforzar')
        assert not denied, denied
        browser.close()
    print('PASS: observed save, recovery after reload, profile-specific recommendations, professional override and synthetic Auth.')
finally:
    server.shutdown()

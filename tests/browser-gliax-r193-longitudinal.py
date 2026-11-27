"""Browser integration on loopback using a synthetic Auth and results adapter."""
import functools
import http.server
import json
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
        rows, attempts = {}, []
        dropped = [False]
        result_sdk = SDK + r"""
const createSyntheticClient = supabase.createClient;
supabase.createClient = () => {
  const client = createSyntheticClient();
  const account = {id:'account',email:'test@example.invalid'};
  client.auth.getSession = async()=>({data:{session:sessionStorage.getItem('signed-out')?null:{user:account}}});
  client.auth.signOut = async()=>{sessionStorage.setItem('signed-out','yes')};
  client.auth.signInWithPassword = async()=>{
    sessionStorage.removeItem('signed-out');
    return {data:{session:{user:account},user:account}};
  };
  const from = client.from.bind(client);
  client.from = table => {
    if (table !== 'exercise_results') return from(table);
    let profile, data;
    const query = {
      select:()=>query, order:()=>query, range:()=>query,
      eq:(_, value)=>{profile=value;return query;},
      upsert:value=>{data=value;return query;},
      then: (resolve,reject)=>fetch('/synthetic-results'+(data?'':'?profile='+encodeURIComponent(profile)),
        data?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:undefined)
        .then(async response=>response.json()).then(resolve,reject)
    };
    return query;
  };
  return client;
};
"""
        def intercept(route):
            address=route.request.url
            if address==url+'js/config.js':
                config=f"\nObject.assign(LH_CONFIG,{{supabaseUrl:{url!r},r192Practice:true,r193Longitudinal:true}});"
                route.fulfill(content_type='application/javascript',body=(ROOT/'js/config.js').read_text()+config)
            elif 'cdn.jsdelivr.net/npm/@supabase/supabase-js' in address:
                route.fulfill(content_type='application/javascript',body=result_sdk)
            elif address.startswith(url+'synthetic-results'):
                if route.request.method == 'POST':
                    result = route.request.post_data_json
                    key = (result['profile_id'],result['client_attempt_id'])
                    rows.setdefault(key,result)
                    attempts.append(key)
                    if dropped and not dropped[0]:
                        dropped[0] = True
                        route.fulfill(status=503,json={'error':{'status':503,'message':'response lost after commit'}})
                    else:
                        route.fulfill(json={'data':None,'error':None})
                else:
                    profile = address.split('profile=')[-1]
                    route.fulfill(json={'data':[row for (owner,_),row in rows.items() if owner==profile],'error':None})
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
        for fixture in datasets.pop('rows').values():
            rows[(fixture['profile_id'],fixture['client_attempt_id'])] = fixture
        bootstrap = '''(() => {
          if (sessionStorage.getItem('r193-seeded')) return;
          sessionStorage.setItem('r193-seeded','yes');
          const fixtures = ''' + json.dumps(datasets) + ''';
          localStorage.setItem('__mock_profiles',JSON.stringify(fixtures.profiles));
          localStorage.setItem('lh_current_profile','A');
        })();'''
        page.add_init_script(bootstrap)
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
        with page.expect_response(lambda response: response.status == 503 and 'synthetic-results' in response.url):
            page.locator('#exerciseNext').click()
        page.wait_for_function("()=>LearningAPI.pendingResults('A').some(row=>row.state==='uncertain')")
        recovery=page.evaluate("()=>LearningAPI.retryPendingResults('A')")
        assert recovery['confirmed']==1 and recovery['remaining']==0
        assert len(rows)==25 and len(attempts)==2 and attempts[0]==attempts[1]
        result=rows[attempts[0]]
        assert result['profile_id']=='A' and result['correct'] is None
        assert 'Revisamos' not in result['detail']
        page.evaluate("()=>LearningAPI.signOut()")
        page.reload(wait_until='networkidle')
        assert page.evaluate("()=>LearningAPI.user===null")
        page.evaluate("()=>LearningAPI.signIn('test@example.invalid','fixture-only')")
        page.reload(wait_until='networkidle')
        exercise('A','constraints')
        recommendation('nivel 3')
        exercise('B','constraints')
        expect(page.locator('#r193Adaptive')).not_to_be_checked()
        page.locator('#r193Adaptive').check()
        recommendation('reforzar')
        second = browser.new_context(viewport={'width':1440,'height':1000})
        client = second.new_page()
        client.route('**/*',intercept)
        client.add_init_script(bootstrap)
        client.goto(url,wait_until='networkidle')
        assert client.evaluate("()=>LearningAPI.pendingResults('A').length") == 0
        assert rows[attempts[0]]['client_attempt_id'] in client.evaluate(
            "async()=> (await LearningAPI.listResults('A')).map(row=>row.clientAttemptId)")
        page = client
        exercise('A','constraints')
        recommendation('nivel 3')
        exercise('B','constraints')
        recommendation('reforzar')
        exercise('B','CP')
        expect(page.locator('#r193Recommendation')).to_contain_text('Aún faltan')
        assert not denied, denied
        browser.close()
    print('PASS: persisted once after an interrupted response, sign-out/sign-in, second context recovery, profile-specific recommendations, abstention and professional override with synthetic Auth.')
finally:
    server.shutdown()

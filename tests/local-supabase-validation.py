"""Opt-in integration check against a disposable LOCAL Supabase stack, never npm test.

Usage: python3 tests/local-supabase-validation.py --status-json /path/status.json
       --sdk /path/@supabase/supabase-js/dist/umd/supabase.js

Requires a freshly started gliax-local-20261117 stack, Docker, Chromium and
Playwright. status.json is `supabase status -o json` for that local stack.
Creates synthetic users and a REPRESENTATIVE schema fixture, then applies the
repository migrations unchanged. Not a verified production schema baseline.
Stop the dedicated stack with --no-backup afterwards. Never pass remote keys.
"""
import argparse
import concurrent.futures
import functools
import http.server
import json
from pathlib import Path
import secrets
import subprocess
import threading
import urllib.error
import urllib.parse
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[1]
CONTAINER = 'supabase_db_gliax-local-20261117'
PROFILE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
LEGACY = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
checks = []


def check(name, condition):
    assert condition, name
    checks.append(name)
    print('PASS:', name, flush=True)


def sql(statement, fail=False):
    result = subprocess.run(
        ['docker', 'exec', '-i', CONTAINER, 'psql', '-X', '-U', 'postgres',
         '-d', 'postgres', '-Atq', '-v', 'ON_ERROR_STOP=1'],
        input=statement, text=True, capture_output=True, check=False)
    if fail:
        return result
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--status-json', type=Path, required=True)
    parser.add_argument('--sdk', type=Path, required=True)
    args = parser.parse_args()
    status = json.loads(args.status_json.read_text())
    base = status['API_URL'].rstrip('/')
    # Fail closed: fixed loopback endpoint, dedicated container and internal network.
    assert base == 'http://127.0.0.1:55431', 'Only the dedicated loopback stack is allowed'
    key = status['ANON_KEY']
    details = json.loads(subprocess.check_output(['docker', 'inspect', CONTAINER]))[0]
    assert details['Config']['Labels']['com.supabase.cli.project'] == 'gliax-local-20261117'
    assert list(details['NetworkSettings']['Networks']) == ['gliax-local-20261117']
    network = json.loads(subprocess.check_output(['docker', 'network', 'inspect', 'gliax-local-20261117']))[0]
    assert network['Internal'] is True
    assert sql("select count(*) from pg_tables where schemaname='public'") == '0', 'Requires a clean public schema'

    def request(method, path, token=None, data=None, expected=(200, 201, 204)):
        assert path.startswith(('/auth/v1/', '/rest/v1/'))
        headers = {'apikey': key, 'Authorization': 'Bearer '+(token or key),
                   'Content-Type': 'application/json', 'Prefer': 'return=representation'}
        req = urllib.request.Request(base+path, data=None if data is None else json.dumps(data).encode(),
                                     headers=headers, method=method)
        # Do not inherit proxies, follow redirects or contact non-loopback hosts.
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *unused):
                return None
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
        try:
            with opener.open(req, timeout=20) as response:
                code, body = response.status, response.read()
        except urllib.error.HTTPError as error:
            code, body = error.code, error.read()
        assert code in expected, f'{method} {path.split("?")[0]}: unexpected HTTP {code}'
        return json.loads(body) if body else None

    migrations = sorted((ROOT/'supabase/migrations').glob('*.sql'))
    clean = sql(migrations[0].read_text(), fail=True)
    check('clean replay limitation reproduced: missing public.accounts (42P01)',
          clean.returncode != 0 and 'relation "public.accounts" does not exist' in clean.stderr)
    sql((ROOT/'tests/fixtures/supabase-local-baseline.sql').read_text())
    print('FIXTURE: representative baseline installed; not a production schema snapshot', flush=True)
    accounts = []
    password = secrets.token_urlsafe(24)+'aA1!'
    for name in ('a', 'b'):
        email = f'gliax-local-{name}@example.invalid'
        signed = request('POST', '/auth/v1/signup', data={'email': email, 'password': password})
        user_id = str(uuid.UUID(signed['user']['id']))
        sql(f"insert into public.accounts(user_id,subscription_status) values('{user_id}','complimentary')")
        login = request('POST', '/auth/v1/token?grant_type=password', data={'email': email, 'password': password})
        refreshed = request('POST', '/auth/v1/token?grant_type=refresh_token', data={'refresh_token': login['refresh_token']})
        accounts.append({'id': user_id, 'email': email, 'token': refreshed['access_token']})
    a, b = accounts
    check('real local Auth: two synthetic signups, password logins and token refreshes', a['id'] != b['id'])
    sql(f"""insert into learner_profiles(id,account_id,name,age_band,progress)
      values('{LEGACY}','{a['id']}','  Alias ficticio antiguo  ','primary',
      '{{"interactiveObservations":[{{"description":"texto ficticio","report":"described"}}]}}');""")
    for migration in migrations:
        sql(migration.read_text())
        print('APPLIED:', migration.name, flush=True)
    check('six migrations applied in order on representative baseline', len(migrations) == 6)
    check('valid unique account/code index', sql("select indisunique and indisvalid from pg_index where indexrelid='learner_profiles_account_code_normalized_key'::regclass") == 't')
    check('correct is nullable', sql("select is_nullable from information_schema.columns where table_schema='public' and table_name='exercise_results' and column_name='correct'") == 'YES')
    check('historical alias preserved byte-for-byte', sql(f"select name='  Alias ficticio antiguo  ' from learner_profiles where id='{LEGACY}'") == 't')
    check('legacy free text minimized', sql(f"select not (progress->'interactiveObservations'->0 ? 'description') from learner_profiles where id='{LEGACY}'") == 't')

    def profile(account, identifier, code='P-ABCDEF01'):
        return request('POST', '/rest/v1/learner_profiles', account['token'],
                       {'id': identifier, 'account_id': account['id'], 'name': code, 'age_band': 'primary'})

    profile(a, PROFILE)
    other = str(uuid.uuid4())
    profile(b, other)
    check('different accounts can use identical profile codes', True)
    duplicate = request('POST', '/rest/v1/learner_profiles', a['token'],
                        {'account_id': a['id'], 'name': ' p-abcdef01 ', 'age_band': 'primary'}, expected=(409,))
    check('same account normalized duplicate rejected', duplicate['code'] == '23505')
    def race(_):
        return request('POST', '/rest/v1/learner_profiles', a['token'],
                       {'account_id': a['id'], 'name': 'P-CAFE0001', 'age_band': 'primary'}, expected=(201, 409))
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        raced = list(pool.map(race, range(2)))
    check('two real concurrent connections produce one unique code',
          sum(isinstance(result, list) for result in raced) == 1
          and sum(isinstance(result, dict) and result.get('code') == '23505' for result in raced) == 1)
    raced_profile = next(result[0]['id'] for result in raced if isinstance(result, list))
    duplicate = request('POST', '/rest/v1/rpc/manage_learner_privacy', a['token'],
                        {'p_action': 'settings', 'p_profile': raced_profile, 'p_alias': 'P-ABCDEF01'}, expected=(409,))
    check('code collision also rejected by settings RPC', duplicate['code'] == '23505')
    request('DELETE', f'/rest/v1/learner_profiles?id=eq.{raced_profile}', a['token'])
    rows = request('PATCH', f'/rest/v1/learner_profiles?id=eq.{PROFILE}', a['token'], {'locale': 'es_es'})
    check('A can read and update own profile', rows[0]['locale'] == 'es_es')
    check('B cannot read A profile', request('GET', f'/rest/v1/learner_profiles?id=eq.{PROFILE}', b['token']) == [])
    check('B cannot update A profile', request('PATCH', f'/rest/v1/learner_profiles?id=eq.{PROFILE}', b['token'], {'locale': 'en'}) == [])
    check('B cannot directly delete A profile', request('DELETE', f'/rest/v1/learner_profiles?id=eq.{PROFILE}', b['token']) == [])
    denied = request('PATCH', f'/rest/v1/learner_profiles?id=eq.{PROFILE}', a['token'], {'account_id': b['id']}, expected=(403,))
    check('A cannot transfer profile ownership', denied['code'] == '42501')
    denied = request('PATCH', f'/rest/v1/learner_profiles?id=eq.{PROFILE}', a['token'],
                     {'progress': {'_sessionOnly': True}}, expected=(400,))
    check('database rejects temporary session state', denied['code'] == 'P0001')
    request('PATCH', f'/rest/v1/learner_profiles?id=eq.{LEGACY}', a['token'], {'locale': 'es_es'})
    check('ordinary edits preserve historical alias', sql(f"select name='  Alias ficticio antiguo  ' from learner_profiles where id='{LEGACY}'") == 't')
    for action in ('export', 'delete', 'settings', 'open'):
        denied = request('POST', '/rest/v1/rpc/manage_learner_privacy', b['token'],
                         {'p_action': action, 'p_profile': PROFILE, 'p_alias': 'P-ABCDEF02'}, expected=(403,))
        check('B rejected by privacy RPC: '+action, denied['code'] == '42501')
    for table in ('learner_profiles', 'exercise_results', 'content_seen', 'learner_privacy_audit'):
        denied = request('GET', '/rest/v1/'+table, expected=(401, 403))
        check('anon denied protected table: '+table, denied['code'] == '42501')
    for action in ('export', 'delete'):
        denied = request('POST', '/rest/v1/rpc/manage_learner_privacy', data={'p_action': action, 'p_profile': PROFILE}, expected=(401, 403))
        check('anon denied RPC: '+action, denied['code'] == '42501')

    browser_checks(base, key, args.sdk, a, password, request)
    check('B cannot read A results', request('GET', f'/rest/v1/exercise_results?profile_id=eq.{PROFILE}', b['token']) == [])
    denied = request('POST', '/rest/v1/exercise_results', b['token'],
                     {'profile_id': PROFILE, 'occurred_at': '2026-11-17T10:00:00Z', 'subject': 'executive', 'level': 1, 'correct': True}, expected=(403,))
    check('B cannot insert A results', denied['code'] == '42501')
    denied = request('PATCH', f'/rest/v1/exercise_results?profile_id=eq.{PROFILE}', b['token'], {'correct': True}, expected=(403,))
    check('B cannot modify A results', denied['code'] == '42501')
    denied = request('DELETE', f'/rest/v1/exercise_results?profile_id=eq.{PROFILE}', b['token'], expected=(403,))
    check('B cannot delete A results', denied['code'] == '42501')
    sql(f"""insert into content_seen(profile_id,user_id,item_signature) values('{PROFILE}','{a['id']}','synthetic');
     insert into private.content_delivery_log(user_id,profile_id,content_id,kind) values('{a['id']}','{PROFILE}',gen_random_uuid(),'exercise');""")
    exported = request('POST', '/rest/v1/rpc/manage_learner_privacy', a['token'], {'p_action': 'export', 'p_profile': PROFILE})
    check('owned JSON export includes profile/history, results, seen and private deliveries',
          exported['profile']['id'] == PROFILE and len(exported['results']) == 2
          and len(exported['profile']['progress']['history']) == 2
          and len(exported['content_history']) == len(exported['delivery_log']) == 1
          and other not in json.dumps(exported))
    request('POST', '/rest/v1/rpc/manage_learner_privacy', a['token'], {'p_action': 'settings', 'p_profile': PROFILE, 'p_alias': 'P-ABCDEF02'})
    check('owned privacy settings and audit', sql(f"select count(*) from learner_privacy_audit where profile_id='{PROFILE}' and action='settings'") == '1')
    deleted = request('POST', '/rest/v1/rpc/manage_learner_privacy', a['token'], {'p_action': 'delete', 'p_profile': PROFILE})
    check('owned delete succeeds', deleted == {'deleted': True})
    for table in ('learner_profiles', 'exercise_results', 'content_seen', 'private.content_delivery_log'):
        column = 'id' if table == 'learner_profiles' else 'profile_id'
        check('delete clears '+table, sql(f"select count(*) from {table} where {column}='{PROFILE}'") == '0')
    check('deletion audited and B preserved', sql(f"select count(*) from learner_privacy_audit where profile_id='{PROFILE}' and action='delete'") == '1'
          and len(request('GET', f'/rest/v1/learner_profiles?id=eq.{other}', b['token'])) == 1)
    print(json.dumps({'passed': len(checks), 'failed': 0, 'migrations': [p.name for p in migrations]}, indent=2))


def browser_checks(base, key, sdk, account, password, request):
    from playwright.sync_api import sync_playwright

    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    wait_id, rule_id = str(uuid.uuid4()), str(uuid.uuid4())
    wait = {'schema': 'gliax.exercise-metrics.v1', 'modality': 'guided_wait', 'interval_completed': True,
            'level': 1, 'interval_ms': 3000, 'duration_ms': 3120, 'restarts': 1, 'interruptions': 1}
    rule = {'schema': 'gliax.exercise-metrics.v1', 'modality': 'rule_application', 'level': 2,
            'trials': 4, 'correct': 3, 'errors': 0, 'omissions': 1, 'switches': 1, 'response_times_ms': [510, 620, 580]}
    rows = []
    for attempt, metrics, correct, ts in [(wait_id, wait, None, '2026-11-17T10:00:30.000Z'), (rule_id, rule, True, '2026-11-17T10:01:00.000Z')]:
        rows.append({'clientAttemptId': attempt, 'ts': ts, 'sessionId': 'synthetic-session',
                     'sessionStartedAt': '2026-11-17T10:00:00.000Z', 'subject': 'executive',
                     'level': metrics['level'], 'correct': correct, 'points': 0,
                     'itemId': metrics['modality']+'-synthetic', 'detail': json.dumps(metrics)})
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
            context = browser.new_context(accept_downloads=True)
            errors = []

            def route_request(route):
                url = route.request.url
                if url.startswith('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'):
                    route.fulfill(path=str(sdk), content_type='application/javascript')
                elif url.endswith('/js/config.js'):
                    route.fulfill(body='window.LH_CONFIG='+json.dumps({'supabaseUrl': base, 'supabaseKey': key})+';', content_type='application/javascript')
                elif urllib.parse.urlparse(url).hostname in ('127.0.0.1', 'localhost'):
                    route.continue_()
                else:
                    route.abort()  # No remote project, fonts, telemetry or CDN traffic.
            context.route('**/*', route_request)
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
            page.evaluate('async x=>LearningAPI.signIn(x.email,x.password)', {'email': account['email'], 'password': password})
            page.reload(wait_until='networkidle')
            page.wait_for_selector('#profileSelect', state='attached')
            page.locator('#profileSelect').select_option(PROFILE)
            page.evaluate('async x=>LearningAPI.saveResult(x.profile,x.row)', {'profile': PROFILE, 'row': rows[0]})
            check('browser API persists guided_wait correct:null via real PostgREST',
                  sql(f"select correct is null from exercise_results where client_attempt_id='{wait_id}'") == 't')

            # Real backend commits; deliberately lose only its HTTP response.
            def lose_response(route):
                response = route.fetch()
                assert response.ok
                route.abort('connectionreset')
            pattern = '**/rest/v1/exercise_results?*'
            page.route(pattern, lose_response, times=1)
            outcome = page.evaluate('''async x=>{try{await LearningAPI.saveResult(x.profile,x.row);return 'unexpected'}catch(e){return e.state}}''', {'profile': PROFILE, 'row': rows[1]})
            check('lost response after real commit leaves durable uncertain outbox', outcome == 'uncertain'
                  and sql(f"select count(*) from exercise_results where client_attempt_id='{rule_id}'") == '1')
            page.reload(wait_until='networkidle')
            page.wait_for_function('(id)=>LearningAPI.pendingResults(id).length===0', arg=PROFILE)
            page.wait_for_function('''async id=>{const {data}=await LearningAPI.client.from('learner_profiles').select('progress').eq('id',id).single();return data?.progress?.history?.length===2}''', arg=PROFILE)
            check('reload retries without duplicate rows', sql(f"select count(*) from exercise_results where profile_id='{PROFILE}'") == '2')
            persisted = request('GET', f'/rest/v1/learner_profiles?id=eq.{PROFILE}', account['token'])[0]['progress']['history']
            canonical = page.evaluate('id=>LearningAPI.listResults(id)', PROFILE)
            by_id = lambda values: {value['clientAttemptId']: value for value in values}
            canonical, history = by_id(canonical), by_id(persisted)
            check('automatic app recovery reconciles exercise_results and progress.history',
                  set(history) == set(canonical) == {wait_id, rule_id}
                  and all(history[i]['correct'] == canonical[i]['correct'] and history[i]['detail'] == canonical[i]['detail'] for i in canonical))
            check('versioned metrics round-trip without changes', json.loads(canonical[wait_id]['detail']) == wait
                  and json.loads(canonical[rule_id]['detail']) == rule and canonical[wait_id]['correct'] is None)
            page.evaluate('async()=>LearningAPI.signOut()')
            page.reload(wait_until='networkidle')
            check('real signout clears session', page.evaluate('async()=>!(await LearningAPI.getSession())'))
            page.evaluate('async x=>LearningAPI.signIn(x.email,x.password)', {'email': account['email'], 'password': password})
            page.reload(wait_until='networkidle')
            page.wait_for_selector('#profileSelect', state='attached')
            page.wait_for_function('(id)=>document.querySelector("#profileSelect").value===id', arg=PROFILE)
            reopened = page.evaluate('id=>LearningAPI.listResults(id)', PROFILE)
            check('results recover after actual signout/signin and reload', len(reopened) == 2)
            page.locator('#navMenu [data-section="progress"]').click()
            page.locator('#guidedWaitProgress').evaluate('(el)=>el.open=true')
            page.locator('#ruleApplicationProgress').evaluate('(el)=>el.open=true')
            page.wait_for_function('()=>document.querySelector("#guidedWaitProgress").textContent.includes("1 intervalos")')
            check('real persisted metrics render in Progress', '3/4 aciertos' in page.locator('#ruleApplicationProgress').inner_text())
            with page.expect_download() as download:
                page.locator('#exportDetailCsv').click()
            csv = Path(download.value.path()).read_text(encoding='utf-8-sig')
            check('CSV export includes both real persisted modalities and versioned metrics',
                  all(value in csv for value in (wait_id, rule_id, 'guided_wait', 'rule_application', 'gliax.exercise-metrics.v1', 'response_times_ms')))
            before = sql(f"select jsonb_build_object('profile',to_jsonb(p),'results',(select jsonb_agg(to_jsonb(r)) from exercise_results r where profile_id=p.id)) from learner_profiles p where id='{PROFILE}'")
            page.locator('.sidebar .account-tools').evaluate('(el)=>el.open=true')
            page.locator('#independentSessionBtn').click()
            blocked = page.evaluate('''async x=>({independent:LearningAPI.isIndependent(x.profile),result:await LearningAPI.saveResult(x.profile,x.row),progress:await LearningAPI.saveProgress(x.profile,{history:[]}),read:await LearningAPI.listResults(x.profile)})''', {'profile': PROFILE, 'row': {**rows[0], 'clientAttemptId': str(uuid.uuid4())}})
            after = sql(f"select jsonb_build_object('profile',to_jsonb(p),'results',(select jsonb_agg(to_jsonb(r)) from exercise_results r where profile_id=p.id)) from learner_profiles p where id='{PROFILE}'")
            check('independent session does not persist results/progress in PostgreSQL', blocked == {'independent': True, 'result': False, 'progress': False, 'read': []} and before == after)
            check('browser has no JavaScript exceptions', not errors)
            browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()

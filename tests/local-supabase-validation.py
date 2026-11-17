"""Opt-in integration check against a disposable LOCAL Supabase stack, never npm test.

Usage: python3 tests/local-supabase-validation.py --status-json /path/status.json
       --sdk /path/@supabase/supabase-js/dist/umd/supabase.js

Requires a freshly started gliax-local-20261117 stack, Docker, Chromium and
Playwright. status.json is `supabase status -o json` for that local stack.
Default: installs the consolidated functional baseline and explicit local ACL.
--legacy-fixture retains the original representative-fixture regression mode.
Neither mode claims an exact clone of managed-platform metadata.
Stop the dedicated stack with --no-backup afterwards. Never pass remote keys.
"""
import argparse
import concurrent.futures
import functools
import http.server
import json
import re
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


def observed_documents():
    docs = ROOT/'docs/implementation'
    def read(name):
        return [json.loads(block) for block in re.findall(r'```json\n(.*?)\n```', (docs/name).read_text(), re.S)]
    return (read('gliax-observed-schema-metadata-20261117.md')[0],
            read('gliax-observed-base-functions-20261117.md'),
            read('gliax-observed-permissions-20261117.md')[0])


def normalize_definition(value):
    # Ignore formatting/schema visibility, but preserve quoted SQL literals/identifiers.
    tokens = re.split(r"('(?:''|[^'])*'|\"(?:\"\"|[^\"])*\")", value or '')
    return ''.join(token if index % 2 else re.sub(r'\s+', '', token).replace('public.', '').lower()
                   for index, token in enumerate(tokens))


def verify_structure():
    observed, functions, permissions = observed_documents()
    actual = json.loads(sql("""select jsonb_build_object(
      'tables',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',c.relname,'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity))
        from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') and c.relkind='r'),
      'columns',(select jsonb_agg(jsonb_build_object('table',n.nspname||'.'||c.relname,'name',a.attname,
        'type',t.typname,'nullable',not a.attnotnull,'identity',case a.attidentity when 'a' then 'ALWAYS' when 'd' then 'BY DEFAULT' end,
        'default',pg_get_expr(d.adbin,d.adrelid))) from pg_attribute a join pg_class c on c.oid=a.attrelid
        join pg_namespace n on n.oid=c.relnamespace join pg_type t on t.oid=a.atttypid
        left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
        where n.nspname in ('public','private') and c.relkind='r' and a.attnum>0 and not a.attisdropped),
      'constraints',(select jsonb_agg(jsonb_build_object('table',n.nspname||'.'||c.relname,'name',co.conname,'ddl',pg_get_constraintdef(co.oid,true),'valid',co.convalidated))
        from pg_constraint co join pg_class c on c.oid=co.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private')),
      'indexes',(select jsonb_agg(jsonb_build_object('table',n.nspname||'.'||c.relname,'name',ic.relname,'ddl',pg_get_indexdef(i.indexrelid),'valid',i.indisvalid and i.indisready))
        from pg_index i join pg_class c on c.oid=i.indrelid join pg_class ic on ic.oid=i.indexrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private')),
      'triggers',(select jsonb_agg(jsonb_build_object('table',n.nspname||'.'||c.relname,'ddl',pg_get_triggerdef(t.oid,true),'enabled',t.tgenabled='O'))
        from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where not t.tgisinternal and n.nspname in ('public','private','auth')),
      'policies',(select jsonb_agg(jsonb_build_object('table',schemaname||'.'||tablename,'name',policyname,'roles',roles,'operation',cmd,'using',qual,'check',with_check)) from pg_policies where schemaname in ('public','private')),
      'sequences',(select jsonb_agg(jsonb_build_object('name',c.relname,'type',s.seqtypid::regtype::text,'start',s.seqstart,'increment',s.seqincrement,'cache',s.seqcache,'cycle',s.seqcycle))
        from pg_sequence s join pg_class c on c.oid=s.seqrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private'))
    );"""))
    keyed = lambda values, key: {key(value): value for value in values}
    check('12 observed tables and RLS/FORCE RLS flags match',
          keyed(actual['tables'], lambda x:(x['schema'],x['name'])) == keyed(observed['tables'], lambda x:(x['schema'],x['name'])))
    expected = keyed(observed['columns'], lambda x:(x['table'],x['name']))
    found = keyed(actual['columns'], lambda x:(x['table'],x['name']))
    expected[('public.exercise_results','correct')] = {**expected[('public.exercise_results','correct')], 'nullable': True}
    for rows in (expected,found):
        for row in rows.values():
            row['default'] = normalize_definition(row['default'])
    check('86 column definitions match observed schema plus nullable-correct delta', expected == found)
    for group, label in [('constraints','43 validated constraints'),('indexes','28 observed indexes plus unique-code delta')]:
        expected = keyed(observed[group], lambda x:(x['table'],x['name']))
        found = keyed(actual[group], lambda x:(x['table'],x['name']))
        extras = set(found)-set(expected)
        assert extras == ({('public.learner_profiles','learner_profiles_account_code_normalized_key')} if group=='indexes' else set()), extras
        changed = [key for key in expected if key not in found or normalize_definition(expected[key]['ddl'])!=normalize_definition(found[key]['ddl'])]
        assert not changed, (group,changed)
        check(label+' match independent observed definitions', all(row['valid'] for row in found.values()))
    expected_triggers = {normalize_definition(x['ddl']) for x in observed['triggers']}
    actual_triggers = {normalize_definition(x['ddl']) for x in actual['triggers']}
    check('six enabled observed triggers plus code-format trigger, including real Auth trigger',
          expected_triggers <= actual_triggers and len(actual_triggers)==7 and all(x['enabled'] for x in actual['triggers']))
    expected = keyed(observed['policies'], lambda x:(x['table'],x['name']))
    found = keyed(actual['policies'], lambda x:(x['table'],x['name']))
    for rows in (expected,found):
        for row in rows.values():
            for k in ['using','check']:row[k]=normalize_definition(row[k])
    check('ten RLS policies match observed definitions', expected==found)
    check('four bigint identity sequences have start/increment/cache 1 and no cycle', len(actual['sequences'])==4
          and all(x['type']=='bigint' and x['start']==x['increment']==x['cache']==1 and not x['cycle'] for x in actual['sequences']))
    check('subscription enum labels and order match', json.loads(sql("select jsonb_agg(enumlabel order by enumsortorder) from pg_enum where enumtypid='public.subscription_status'::regtype"))==observed['enums'][0]['labels'])
    pairs = ','.join("('%s','%s')" % (p['table'],p['role']) for p in permissions['table_privileges'])
    granted = json.loads(sql("select jsonb_object_agg(t||'|'||r||'|'||v,has_table_privilege(r,t,v)) from (values "+pairs+") g(t,r) cross join (values ('select'),('insert'),('update'),('delete'),('truncate'),('trigger')) p(v)"))
    for p in permissions['table_privileges']:
        for privilege in ['select','insert','update','delete','truncate','trigger']:
            safe = False if p['table']=='public.accounts' and p['role'] in ['anon','authenticated'] and privilege in ['truncate','trigger'] else p[privilege]
            assert granted[p['table']+'|'+p['role']+'|'+privilege]==safe, (p['table'],p['role'],privilege)
    check('216 effective table permissions match explicit safe local profile', True)
    schema_access = json.loads(sql("select jsonb_object_agg(s||'|'||r,has_schema_privilege(r,s,'USAGE')) from (values ('public'),('private')) n(s) cross join (values ('anon'),('authenticated'),('service_role')) roles(r)"))
    check('six schema USAGE permissions match observed boundary', all(schema_access[p['schema']+'|'+p['role']]==p['usage'] for p in permissions['schema_privileges']))
    execute = json.loads(sql("select jsonb_object_agg(proname||'|'||r,has_function_privilege(r,p.oid,'EXECUTE')) from pg_proc p cross join (values ('anon'),('authenticated'),('service_role')) roles(r) where pronamespace='public'::regnamespace"))
    for f in functions[0]+functions[1]:
        for role, field in [('anon','exec_anon'),('authenticated','exec_auth'),('service_role','exec_service')]:
            assert execute[f['function']+'|'+role]==f[field], (f['function'],role)
    check('36 effective function EXECUTE permissions match observed boundary', True)
    for role in ('anon','authenticated'):
        truncate = sql(f"begin; set local role {role}; truncate table public.accounts cascade; rollback;", fail=True)
        check('safe profile denies account TRUNCATE for '+role,
              truncate.returncode != 0 and 'permission denied' in truncate.stderr)
        trigger = sql(f"begin; set local role {role}; create trigger gliax_denied before update on public.accounts for each row execute function public.set_updated_at(); rollback;", fail=True)
        check('safe profile denies account TRIGGER for '+role,
              trigger.returncode != 0 and 'permission denied' in trigger.stderr)
    check('13 application routines installed once', sql("select count(*) from pg_proc where pronamespace='public'::regnamespace")=='13')
    for f in functions[0]:
        definition = sql(f"select pg_get_functiondef(oid) from pg_proc where pronamespace='public'::regnamespace and proname='{f['function']}'")
        check('verified original body retained: '+f['function'], normalize_definition(definition)==normalize_definition(f['ddl']))


def functional_checks(a, b, request, status, sdk):
    check('account locale can be updated under column grant/RLS',
          request('PATCH', f"/rest/v1/accounts?user_id=eq.{a['id']}", a['token'], {'content_locale':'es_es'})[0]['content_locale']=='es_es')
    check('B cannot read A account', request('GET', f"/rest/v1/accounts?user_id=eq.{a['id']}", b['token'])==[])
    denied = request('PATCH', f"/rest/v1/accounts?user_id=eq.{a['id']}", a['token'], {'subscription_status':'active'}, expected=(403,))
    check('client cannot mutate subscription state', denied['code']=='42501')
    edge_profile = str(uuid.uuid4())
    request('POST','/rest/v1/learner_profiles',a['token'],{'id':edge_profile,'account_id':a['id'],'name':'P-ED6E0001','age_band':'primary'})
    def invoke_edge(body, token):
        result = subprocess.run(['node',str(ROOT/'tests/local-edge-content.cjs'),str(sdk.parent.parent/'index.cjs')],
          input=json.dumps({'url':status['API_URL'],'serviceKey':status['SERVICE_ROLE_KEY'],'token':token,'body':body}),text=True,capture_output=True)
        assert result.returncode==0, 'Local real content-handler adapter failed'
        return json.loads(result.stdout)
    body = {'profile_id':edge_profile,'kind':'exercise','domain':'attention','level':1,'count':1,'client_revision':13}
    tracked = invoke_edge(body,a['token'])
    assert tracked['status']==200, ('tracked content',tracked['status'])
    check('real content handler generates content with Auth and persists seen/usage',
          len(tracked['body']['items'])==1 and sql(f"select count(*) from content_seen where profile_id='{edge_profile}'")=='1'
          and sql(f"select used from content_usage where user_id='{a['id']}' and usage_date=current_date and kind='exercise'")=='1')
    before = sql(f"select progress from learner_profiles where id='{edge_profile}'")
    independent = invoke_edge({**body,'session_only':True},a['token'])
    check('real independent content request changes only aggregate account usage', independent['status']==200
          and sql(f"select progress from learner_profiles where id='{edge_profile}'")==before
          and sql(f"select count(*) from content_seen where profile_id='{edge_profile}'")=='1'
          and sql(f"select used from content_usage where user_id='{a['id']}' and usage_date=current_date and kind='exercise'")=='2'
          and sql(f"select count(*) from exercise_results where profile_id='{edge_profile}'")=='0')
    check('real content handler denies B access to A profile', invoke_edge(body,b['token'])['status']==404)
    sql(f"update content_usage set used=500 where user_id='{a['id']}' and usage_date=current_date and kind='exercise'")
    check('real content handler enforces synthetic aggregate quota', invoke_edge(body,a['token'])['status']==403
          and sql(f"select count(*) from content_seen where profile_id='{edge_profile}'")=='1')
    sql(f"delete from content_usage where user_id='{a['id']}'")
    request('DELETE',f'/rest/v1/learner_profiles?id=eq.{edge_profile}',a['token'])
    check('deleting content-test profile clears its seen rows', sql(f"select count(*) from content_seen where profile_id='{edge_profile}'")=='0')
    # Private original RPC: all rows below are synthetic and never copied from the origin.
    rpc = '/rest/v1/rpc/request_learning_content_internal'
    rpc_body = {'p_user_id':a['id'],'p_profile_id':PROFILE,'p_kind':'exercise','p_domain':'executive','p_level':1,'p_count':1}
    for role, token in [('anon',None),('authenticated',a['token'])]:
        denied=request('POST',rpc,token,rpc_body,expected=(401,403))
        check('private content RPC rejects '+role,denied['code']=='42501')
    sql("insert into private.plan_limits values('complimentary',1,1,1)")
    sql("insert into private.content_items(kind,age_band,domain,payload) values('exercise','primary','executive','{\"synthetic\":true}')")
    mismatch = request('POST',rpc,status['SERVICE_ROLE_KEY'],{**rpc_body,'p_user_id':b['id']},expected=(400,))
    check('private content RPC rejects mismatched synthetic account/profile', mismatch['code']=='P0001')
    invalid = request('POST',rpc,status['SERVICE_ROLE_KEY'],{**rpc_body,'p_count':11},expected=(400,))
    check('private content RPC rejects invalid request size', invalid['code']=='P0001')
    sql(f"update accounts set subscription_status='trial',trial_ends_at=now()-interval '1 hour' where user_id='{a['id']}'")
    expired = request('POST',rpc,status['SERVICE_ROLE_KEY'],rpc_body,expected=(400,))
    check('private content RPC rejects expired synthetic trial', expired['code']=='P0001')
    sql(f"update accounts set subscription_status='complimentary',trial_ends_at=now()+interval '7 days' where user_id='{a['id']}'")
    content=request('POST',rpc,status['SERVICE_ROLE_KEY'],rpc_body)
    check('private content RPC with compatibility overlay returns and logs one synthetic item', len(content)==1
          and sql(f"select count(*) from private.content_delivery_log where profile_id='{PROFILE}'")=='1')
    denied=request('POST',rpc,status['SERVICE_ROLE_KEY'],rpc_body,expected=(400,))
    check('private content RPC with compatibility overlay enforces synthetic plan quota',denied['code']=='P0001')
    # Leave the main profile clean for the original export/baseline checks below.
    sql(f"delete from private.content_delivery_log where profile_id='{PROFILE}'")
    sql('delete from private.content_items; delete from private.plan_limits;')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--status-json', type=Path, required=True)
    parser.add_argument('--sdk', type=Path, required=True)
    parser.add_argument('--legacy-fixture', action='store_true', help='Run the historical 51-check fixture suite instead of the functional baseline')
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
    if args.legacy_fixture:
        clean = sql(migrations[0].read_text(), fail=True)
        check('clean replay limitation reproduced: missing public.accounts (42P01)',
              clean.returncode != 0 and 'relation "public.accounts" does not exist' in clean.stderr)
        sql((ROOT/'tests/fixtures/supabase-local-baseline.sql').read_text())
        print('MODE: legacy representative fixture', flush=True)
    else:
        baseline = (ROOT/'supabase/baselines/gliax-local-functional.sql').read_text()
        denied = sql(baseline, fail=True)
        check('baseline refuses an unguarded connection', denied.returncode != 0 and 'dedicated local baseline runner' in denied.stderr)
        sql("set gliax.local_baseline='on';\n"+baseline)
        sql("set gliax.local_baseline='on';\n"+(ROOT/'supabase/baselines/local-privileges.sql').read_text())
        print('MODE: consolidated functional baseline; historical migrations NOT replayed; no schema fixture', flush=True)
        verify_structure()
        sql("set gliax.local_baseline='on';\n"+(ROOT/'supabase/baselines/local-content-compatibility.sql').read_text())
        check('local content compatibility overlay installed without changing EXECUTE boundary',
              sql("select not has_function_privilege('authenticated','public.request_learning_content_internal(uuid,uuid,text,text,smallint,integer)','EXECUTE')")=='t')
    accounts = []
    password = secrets.token_urlsafe(24)+'aA1!'
    for name in ('a', 'b'):
        email = f'gliax-local-{name}@example.invalid'
        signed = request('POST', '/auth/v1/signup', data={'email': email, 'password': password})
        user_id = str(uuid.UUID(signed['user']['id']))
        if args.legacy_fixture:
            sql(f"insert into public.accounts(user_id,subscription_status) values('{user_id}','complimentary')")
        else:
            check('Auth signup provisions exactly one trial account '+name,
                  sql(f"select count(*)=1 and bool_and(subscription_status='trial' and trial_ends_at>trial_started_at) from accounts where user_id='{user_id}'") == 't')
            sql(f"update public.accounts set subscription_status='complimentary' where user_id='{user_id}'")
        login = request('POST', '/auth/v1/token?grant_type=password', data={'email': email, 'password': password})
        refreshed = request('POST', '/auth/v1/token?grant_type=refresh_token', data={'refresh_token': login['refresh_token']})
        accounts.append({'id': user_id, 'email': email, 'token': refreshed['access_token']})
    a, b = accounts
    check('real local Auth: two synthetic signups, password logins and token refreshes', a['id'] != b['id'])
    alias = '  Alias ficticio antiguo  ' if args.legacy_fixture else 'P-0A11A500'
    sql(f"""insert into learner_profiles(id,account_id,name,age_band,progress)
      values('{LEGACY}','{a['id']}','{alias}','primary',
      '{{"interactiveObservations":[{{"description":"texto ficticio","report":"described"}}]}}');""")
    if args.legacy_fixture:
        for migration in migrations:
            sql(migration.read_text())
            print('APPLIED:', migration.name, flush=True)
        check('six migrations applied in order on representative baseline', len(migrations) == 6)
    else:
        repeated = sql("set gliax.local_baseline='on';\n"+baseline, fail=True)
        check('consolidated baseline refuses a second application', repeated.returncode != 0 and 'must be empty' in repeated.stderr)
    check('valid unique account/code index', sql("select indisunique and indisvalid from pg_index where indexrelid='learner_profiles_account_code_normalized_key'::regclass") == 't')
    check('correct is nullable', sql("select is_nullable from information_schema.columns where table_schema='public' and table_name='exercise_results' and column_name='correct'") == 'YES')
    check('historical alias preserved byte-for-byte' if args.legacy_fixture else 'existing profile code preserved byte-for-byte', sql(f"select name='{alias}' from learner_profiles where id='{LEGACY}'") == 't')
    check('legacy free text minimized' if args.legacy_fixture else 'progress free text minimized', sql(f"select not (progress->'interactiveObservations'->0 ? 'description') from learner_profiles where id='{LEGACY}'") == 't')

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
    check('ordinary edits preserve historical alias' if args.legacy_fixture else 'ordinary edits preserve existing code', sql(f"select name='{alias}' from learner_profiles where id='{LEGACY}'") == 't')
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

    if not args.legacy_fixture:
        functional_checks(a, b, request, status, args.sdk)
    browser_checks(base, key, args.sdk, a, password, request)
    check('B cannot read A results', request('GET', f'/rest/v1/exercise_results?profile_id=eq.{PROFILE}', b['token']) == [])
    denied = request('POST', '/rest/v1/exercise_results', b['token'],
                     {'profile_id': PROFILE, 'occurred_at': '2026-11-17T10:00:00Z', 'subject': 'executive', 'level': 1, 'correct': True}, expected=(403,))
    check('B cannot insert A results', denied['code'] == '42501')
    denied = request('PATCH', f'/rest/v1/exercise_results?profile_id=eq.{PROFILE}', b['token'], {'correct': True}, expected=(403,))
    check('B cannot modify A results', denied['code'] == '42501')
    denied = request('DELETE', f'/rest/v1/exercise_results?profile_id=eq.{PROFILE}', b['token'], expected=(403,))
    check('B cannot delete A results', denied['code'] == '42501')
    if args.legacy_fixture:
        sql(f"""insert into content_seen(profile_id,user_id,item_signature) values('{PROFILE}','{a['id']}','synthetic');
         insert into private.content_delivery_log(user_id,profile_id,content_id,kind) values('{a['id']}','{PROFILE}',gen_random_uuid(),'exercise');""")
    else:
        sql(f"""insert into content_seen(profile_id,user_id,domain,item_signature) values('{PROFILE}','{a['id']}','executive','synthetic');
         with item as (insert into private.content_items(kind,age_band,domain,payload)
          values('exercise','primary','executive','{{"synthetic":true}}') returning id)
         insert into private.content_delivery_log(user_id,profile_id,content_id,kind)
          select '{a['id']}','{PROFILE}',id,'exercise' from item;""")
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
    print(json.dumps({'mode': 'legacy-fixture' if args.legacy_fixture else 'functional-baseline', 'passed': len(checks), 'failed': 0, 'historical_migrations_executed': [p.name for p in migrations] if args.legacy_fixture else []}, indent=2))


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

"""Opt-in PostgreSQL SQL-package smoke test, network=none, no image pulls.

The small auth namespace below is a synthetic SQL dependency harness, not Auth.
It does not certify real Supabase Auth, SMTP, Deno or remote staging.
"""
import json
from pathlib import Path
import sys
import tempfile
import time

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
sys.path.insert(0,str(ROOT/'tests'))
from tools.staging import common, installer
from test_staging_tools import manifest

NAME='gliax-staging-sandbox-sql-20261118'
IMAGE='postgres:17-alpine'


def sql(value):
    result=installer.docker(['exec','-i',NAME,'psql','-X','-U','postgres','-d','postgres','-Atq','-v','ON_ERROR_STOP=1'],text=True,input=value)
    common.require(result.returncode==0,'Local SQL smoke assertion failed')
    return result.stdout.strip()


def main():
    image=installer.docker(['image','inspect',IMAGE])
    if image.returncode:
        print(json.dumps({'status':'NOT RUN','basis':'LOCAL_SQL_SANDBOX','reason':'CACHED_IMAGE_UNAVAILABLE'}));return
    value=manifest()
    labels={'gliax.staging.scope':'local-test','gliax.staging.project_ref':value['project_ref'],
            'gliax.staging.api_host':value['api_url'].removeprefix('https://'),'gliax.staging.db_host':value['database']['host']}
    args=['run','--rm','--detach','--name',NAME,'--network','none','--tmpfs','/var/lib/postgresql/data',
          '-e','POSTGRES_HOST_AUTH_METHOD=trust']
    for key,setting in labels.items():args+=['--label',key+'='+setting]
    created=installer.docker([*args,IMAGE])
    common.require(created.returncode==0,'Cannot create isolated SQL sandbox')
    try:
        for _ in range(100):
            # The entrypoint's temporary initialization server only listens on
            # its Unix socket. Wait for the final server's internal loopback TCP
            # listener; this publishes no port and leaves network=none intact.
            ready=installer.docker(['exec',NAME,'pg_isready','-h','127.0.0.1','-U','postgres'])
            if ready.returncode==0:break
            time.sleep(0.1)
        else:raise common.GuardError('SQL sandbox startup timed out')
        sql("""create role anon; create role authenticated; create role service_role bypassrls;
          create schema auth; create table auth.users(id uuid primary key);
          create function auth.uid() returns uuid language sql as $$select null::uuid$$;
          create function auth.role() returns text language sql as $$select current_setting('request.jwt.claim.role',true)$$;""")
        with tempfile.TemporaryDirectory(prefix='staging-sql-smoke-',dir=ROOT.parent/'work') as temp:
            bundle=Path(temp)/'bundle';installer.prepare(value,bundle)
            bad=dict(value);bad['web_origin']='https://other.example.invalid'
            try:installer.apply_local(bad,bundle,NAME)
            except common.GuardError:pass
            else:raise AssertionError('Changed connection accepted')
            assert sql("select count(*) from pg_tables where schemaname in ('public','private')")=='0'
            result=installer.apply_local(value,bundle,NAME)
            expected={
                'tables':("select count(*) from pg_tables where schemaname in ('public','private')",'12'),
                'indexes':("select count(*) from pg_indexes where schemaname in ('public','private')",'29'),
                'constraints':("select count(*) from pg_constraint where connamespace in ('public'::regnamespace,'private'::regnamespace)",'43'),
                'functions':("select count(*) from pg_proc where pronamespace='public'::regnamespace",'13'),
                'policies':("select count(*) from pg_policies where schemaname in ('public','private')",'10'),
                'sequences':("select count(*) from pg_sequence s join pg_class c on c.oid=s.seqrelid where c.relnamespace in ('public'::regnamespace,'private'::regnamespace)",'4'),
                'safe_permissions':("select not has_table_privilege('anon','accounts','TRUNCATE') and not has_table_privilege('authenticated','accounts','TRIGGER')",'t'),
                'nullable_correct':("select is_nullable from information_schema.columns where table_schema='public' and table_name='exercise_results' and column_name='correct'",'YES'),
            }
            for query,wanted in expected.values():assert sql(query)==wanted
            sql("insert into auth.users values('11111111-1111-4111-8111-111111111111')")
            assert sql('select count(*) from public.accounts')=='1'
            try:installer.apply_local(value,bundle,NAME)
            except common.GuardError:pass
            else:raise AssertionError('Second baseline application accepted')
            result.update({'checks':12,'sql_objects_match':True,'remote_auth':'NOT RUN','smtp':'NOT RUN','deno':'NOT RUN'})
            print(json.dumps(result))
    finally:
        installer.docker(['rm','-f',NAME])


if __name__=='__main__':
    main()

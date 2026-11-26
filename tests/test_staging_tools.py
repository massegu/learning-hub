"""Offline staging contracts. No production or remote staging transport is enabled."""
import copy
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from tools.staging import common, frontend, installer, runner, scenarios

ROOT=Path(__file__).resolve().parents[1]
SDK=ROOT.parent/'work/local-client/node_modules/@supabase/supabase-js/dist/umd/supabase.js'


def manifest():
    return {'schema_version':1,'environment':'staging','project_ref':'abcdefghijklmnopqrst',
            'api_url':'https://abcdefghijklmnopqrst.supabase.co',
            'database':{'host':'db.abcdefghijklmnopqrst.supabase.co','port':5432,'name':'postgres','user':'postgres','sslmode':'verify-full'},
            'web_origin':'https://qa.example.invalid','web_path':'/',
            'publishable_key':'sb_publishable_synthetic_local_test_only', 'billing_enabled':False,
            'qa_emails':['qa-a@example.invalid','qa-b@example.invalid'],
            'production_web_origins':['https://operational.example.invalid'],
            'source_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
            'sql_sha256':{name:common.digest((ROOT/'supabase/baselines'/name).read_bytes()) for name in common.SQL_FILES},
            'sdk_sha256':common.digest(SDK.read_bytes()) if SDK.exists() else '0'*64}


class StagingTools(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='staging-tools-tests-',dir=ROOT.parent/'work')
        self.work=Path(self.temp.name)
        self.value=manifest()
        self.path=self.work/'private.json'
        common.write_private(self.path,self.value)

    def tearDown(self):
        self.temp.cleanup()

    def test_private_manifest_valid(self):
        self.assertEqual(common.load_manifest(self.path),self.value)

    def test_missing_fields_no_implicit_target(self):
        for key in self.value:
            with self.subTest(key=key):
                value=copy.deepcopy(self.value);del value[key]
                with self.assertRaises(common.GuardError):common.validate_manifest(value)

    def test_inconsistent_and_operational_targets_refused(self):
        operational, ref=common.production_markers()
        mutations=[('project_ref',''),('project_ref',ref),('api_url',operational['supabaseUrl']),
                   ('api_url','https://different.example.invalid'),('publishable_key',operational['supabaseKey']),
                   ('web_origin','https://operational.example.invalid'),('web_origin','http://qa.example.invalid'),
                   ('web_path','/beta'),('billing_enabled',True),('sdk_sha256',''),('environment','beta')]
        for key,value in mutations:
            with self.subTest(key=key):
                data=copy.deepcopy(self.value);data[key]=value
                with self.assertRaises(common.GuardError):common.validate_manifest(data)
        for field,value in [('host','db.other.supabase.co'),('port',6543),('sslmode','disable'),('user','unexpected')]:
            data=copy.deepcopy(self.value);data['database'][field]=value
            with self.assertRaises(common.GuardError):common.validate_manifest(data)

    def test_manifest_permissions_symlinks_and_secret_fields_refused(self):
        self.path.chmod(0o644)
        with self.assertRaises(common.GuardError):common.load_manifest(self.path)
        self.path.chmod(0o600)
        link=self.work/'link.json';link.symlink_to(self.path)
        with self.assertRaises(common.GuardError):common.load_manifest(link)
        data=copy.deepcopy(self.value);data['service_role_key']='not-a-real-key'
        with self.assertRaises(common.GuardError):common.validate_manifest(data)

    def test_invalid_manifest_rejected_before_output_or_execution(self):
        data=copy.deepcopy(self.value);data['project_ref']=''
        with patch.object(installer,'docker',side_effect=AssertionError('must not connect')):
            with self.assertRaises(common.GuardError):installer.prepare(data,self.work/'bundle')
        self.assertFalse((self.work/'bundle').exists())

    def test_install_package_preserves_sql_except_reviewed_guards(self):
        target=self.work/'bundle';plan=installer.prepare(self.value,target)
        files=installer.verify_package(self.value,target)
        self.assertEqual(plan['historical_migrations'],[])
        self.assertEqual(len(files),3)
        for name,data in zip(common.SQL_FILES,files):
            self.assertIn("current_setting('gliax.staging_project_ref'",data)
            original=(ROOT/'supabase/baselines'/name).read_text()
            # Function/DDL bodies stay byte-identical after removing the guard adaptation.
            replacement=("current_setting('gliax.staging_baseline',true) is distinct from 'on'\n"
                         " or current_setting('gliax.staging_project_ref',true) is distinct from '"+self.value['project_ref']+"'")
            self.assertEqual(data.replace(replacement,"current_setting('gliax.local_baseline',true) is distinct from 'on'"),original)

    def test_tampered_package_and_changed_manifest_refused(self):
        target=self.work/'bundle';installer.prepare(self.value,target)
        path=target/common.SQL_FILES[0];path.write_text(path.read_text()+'\nselect 1;')
        with self.assertRaises(common.GuardError):installer.verify_package(self.value,target)
        other=copy.deepcopy(self.value);other['web_origin']='https://other.example.invalid'
        with self.assertRaises(common.GuardError):installer.verify_package(other,target)

    def test_symlink_sql_and_overwrite_refused(self):
        target=self.work/'bundle';installer.prepare(self.value,target)
        with self.assertRaises(common.GuardError):installer.prepare(self.value,target)
        path=target/common.SQL_FILES[0];data=path.read_bytes();path.unlink()
        outside=self.work/'outside.sql';outside.write_bytes(data);path.symlink_to(outside)
        with self.assertRaises(common.GuardError):installer.verify_package(self.value,target)

    def test_docker_inherited_remote_context_refused(self):
        with patch.dict(os.environ,{'DOCKER_HOST':'tcp://remote.invalid:2375'}):
            with patch.object(subprocess,'run',side_effect=AssertionError('no process allowed')):
                with self.assertRaises(common.GuardError):installer.docker(['inspect','anything'])

    def test_wrong_sandbox_labels_and_network_refused_before_sql(self):
        target=self.work/'bundle';installer.prepare(self.value,target)
        wrong={'State':{'Running':True},'Config':{'Labels':{}},
               'HostConfig':{'NetworkMode':'none','PortBindings':{}},'NetworkSettings':{'Networks':{'none':{}}}}
        with patch.object(installer,'docker',return_value=subprocess.CompletedProcess([],0,json.dumps([wrong]).encode(),b'')) as calls:
            with self.assertRaises(common.GuardError):installer.apply_local(self.value,target,'gliax-staging-sandbox-test')
            self.assertEqual(calls.call_count,1)
            self.assertEqual(calls.call_args.args[0][0],'inspect')

    def test_wrong_database_connection_identity_refused_before_mutation(self):
        target=self.work/'bundle';installer.prepare(self.value,target)
        with patch.object(installer,'attest_sandbox'):
            with patch.object(installer,'docker',return_value=subprocess.CompletedProcess([],0,'other|postgres|true\n','')) as calls:
                with self.assertRaises(common.GuardError):installer.apply_local(self.value,target,'gliax-staging-sandbox-test')
                self.assertEqual(calls.call_count,1)

    def test_network_and_published_ports_refused_even_with_matching_labels(self):
        labels={'gliax.staging.scope':'local-test','gliax.staging.project_ref':self.value['project_ref'],
                'gliax.staging.api_host':self.value['api_url'].removeprefix('https://'),
                'gliax.staging.db_host':self.value['database']['host']}
        base={'Id':'a'*64,'State':{'Running':True},'Config':{'Labels':labels},
              'HostConfig':{'NetworkMode':'none','PortBindings':{}},'NetworkSettings':{'Networks':{'none':{}}}}
        variants=[]
        for key,value in [('NetworkMode','bridge'),('PortBindings',{'5432/tcp':[{'HostPort':'5432'}]})]:
            wrong=copy.deepcopy(base);wrong['HostConfig'][key]=value;variants.append(wrong)
        wrong=copy.deepcopy(base);wrong['NetworkSettings']['Networks']['bridge']={};variants.append(wrong)
        for wrong in variants:
            with patch.object(installer,'docker',return_value=subprocess.CompletedProcess([],0,json.dumps([wrong]).encode(),b'')) as calls:
                with self.assertRaises(common.GuardError):installer.attest_sandbox(self.value,'gliax-staging-sandbox-test')
                self.assertEqual(calls.call_count,1)

    def test_replaced_container_identity_refused_before_first_sql_file(self):
        target=self.work/'bundle';installer.prepare(self.value,target)
        with patch.object(installer,'attest_sandbox',side_effect=['a'*64,'b'*64]):
            with patch.object(installer,'docker',return_value=subprocess.CompletedProcess([],0,'postgres|postgres|true\n','')) as calls:
                with self.assertRaises(common.GuardError):installer.apply_local(self.value,target,'gliax-staging-sandbox-test')
                self.assertEqual(calls.call_count,1)
                self.assertEqual(calls.call_args.args[0][1],'a'*64)

    def test_output_symlink_parent_and_wrong_location_refused(self):
        link=self.work/'alias';link.symlink_to(self.work,target_is_directory=True)
        with self.assertRaises(common.GuardError):common.output_directory(link/'new')
        with self.assertRaises(common.GuardError):common.output_directory(ROOT/'must-not-create')

    def test_manifest_unexpected_email_types_refused(self):
        for emails in ([[],[]],['qa@example.invalid','qa@example.invalid'],['',None]):
            value=copy.deepcopy(self.value);value['qa_emails']=emails
            with self.assertRaises(common.GuardError):common.validate_manifest(value)

    def test_runner_phase_order_and_honest_not_run_report(self):
        directory=self.work/'run'
        runner.prepare(self.value,directory)
        with self.assertRaises(FileNotFoundError):runner.validate(self.value,directory)
        result=runner.execute(self.value,directory)
        self.assertTrue(all(x['status']=='NOT RUN' for x in result['cases']))
        self.assertEqual(runner.validate(self.value,directory)['totals']['NOT RUN'],10)
        runner.cleanup(self.value,directory)
        self.assertFalse((directory/'transient.json').exists())
        self.assertTrue((directory/'results.json').exists())

    def test_forged_pass_and_cleanup_ledger_refused(self):
        directory=self.work/'run';runner.prepare(self.value,directory);runner.execute(self.value,directory)
        path=directory/'results.json';value=json.loads(path.read_text());value['cases'][0]['status']='PASSED';path.write_text(json.dumps(value))
        with self.assertRaises(common.GuardError):runner.validate(self.value,directory)
        path=directory/'transient.json';value=json.loads(path.read_text());value['created_remote_ids']=['unknown'];path.write_text(json.dumps(value))
        with self.assertRaises(common.GuardError):runner.cleanup(self.value,directory)
        self.assertTrue(path.exists())

    def test_result_states_do_not_certify_a_simulation_as_remote(self):
        self.assertEqual(scenarios.evaluate('sample',lambda:None,'LOCAL_CONTRACT')['status'],'PASSED')
        def failed():raise AssertionError('private token must not be printed')
        result=scenarios.evaluate('sample',failed,'LOCAL_CONTRACT')
        self.assertEqual(result['status'],'FAILED');self.assertNotIn('token',json.dumps(result))
        self.assertEqual(scenarios.evaluate('sample',lambda:None,'REAL_STAGING')['status'],'NOT RUN')

    def test_request_budget_and_remote_transport_gate(self):
        budget=scenarios.Budget(2);budget.consume();budget.consume()
        with self.assertRaises(common.GuardError):budget.consume()
        context=scenarios.Context(self.value,capabilities=['auth','data_api'])
        with self.assertRaises(common.RemoteDisabled):context.request('GET','/auth/v1/user','A')
        with self.assertRaises(common.GuardError):context.request('GET','https://elsewhere.invalid','A')

    def test_concurrent_quota_detects_overspend_lost_updates_and_partial_effects(self):
        responses=scenarios.concurrent_quota(lambda i:200 if i<2 else 403)
        scenarios.validate_quota(responses,2,8,10,2,0)
        for responses,after,effects,rejected in [([200]*5,13,5,0),([200,200,403],9,2,0),([200,200,403],10,2,1)]:
            with self.assertRaises(AssertionError):scenarios.validate_quota(responses,2,8,after,effects,rejected)
        with self.assertRaises(common.GuardError):scenarios.concurrent_quota(lambda i:200,requests=6)

    @unittest.skipUnless(SDK.is_file(),'Pinned local SDK unavailable; frontend contract NOT RUN')
    def test_frontend_integrity_and_operational_value_scan(self):
        target=self.work/'web';frontend.build(self.value,SDK,target)
        text=(target/'js/config.js').read_text()
        self.assertIn('Object.freeze',text);self.assertIn('function loadV16',text)
        self.assertIn('staging-guard.js',(target/'index.html').read_text())
        self.assertNotIn('async function openBilling',(target/'js/api.js').read_text())
        self.assertTrue((target/'js/v16_16.js').exists())
        _,ref=common.production_markers();(target/'injected.txt').write_text(ref)
        with self.assertRaises(common.GuardError):frontend.scan_artifact(target,self.value)

    @unittest.skipUnless(SDK.is_file(),'Pinned local SDK unavailable; frontend contract NOT RUN')
    def test_sdk_hash_mismatch_refused_before_build(self):
        value=copy.deepcopy(self.value);value['sdk_sha256']='0'*64
        with self.assertRaises(common.GuardError):frontend.build(value,SDK,self.work/'web')
        self.assertFalse((self.work/'web').exists())


@unittest.skipUnless(SDK.is_file() and shutil.which('chromium'),'Local browser/SDK prerequisites unavailable; browser NOT RUN')
class StagingBrowser(unittest.TestCase):
    def test_real_modules_banner_and_billing_network_guards(self):
        from playwright.sync_api import sync_playwright
        with tempfile.TemporaryDirectory(prefix='staging-browser-',dir=ROOT.parent/'work') as temp:
            target=Path(temp)/'web';value=manifest();frontend.build(value,SDK,target)
            with sync_playwright() as p:
                browser=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox'])
                context=browser.new_context(service_workers='block')
                outgoing=[];errors=[];simulated_api=[]
                def route_request(route):
                    from urllib.parse import urlsplit,unquote
                    url=urlsplit(route.request.url)
                    where=url.scheme+'://'+url.netloc
                    if where==value['api_url'] and url.path.startswith('/rest/v1/'):
                        # Explicit local browser contract response, not remote Auth/RLS evidence.
                        simulated_api.append(url.path)
                        route.fulfill(status=200,content_type='application/json',body='[]');return
                    if where!=value['web_origin']:
                        outgoing.append(route.request.url);route.abort();return
                    path=(target/unquote(url.path).lstrip('/')).resolve()
                    if path==target.resolve():path=target/'index.html'
                    if not path.is_relative_to(target.resolve()) or not path.is_file():route.abort();return
                    route.fulfill(path=str(path))
                context.route('**/*',route_request)
                page=context.new_page()
                page.on('pageerror',lambda error:errors.append(str(error)))
                page.goto(value['web_origin']+'/',wait_until='networkidle')
                page.wait_for_function('()=>window.LearningAPI && window.V16_16 || document.querySelector("script[src*=v16_16]")')
                self.assertIn('GLIAX STAGING / TEST',page.title())
                self.assertTrue(page.locator('#gliaxStagingBanner').is_visible())
                denied=page.evaluate('''async()=>{
                  const capture=async fn=>{try{await fn();return false}catch{return true}};
                  return {checkout:await capture(()=>LearningAPI.openStripeCheckout()),portal:await capture(()=>LearningAPI.openBillingPortal()),
                    wrong:await capture(()=>fetch('https://blocked.example.invalid/auth/v1/user')),
                    payments:await capture(()=>fetch(LH_CONFIG.supabaseUrl+'/functions/v1/stripe-webhook')),
                    directInvoke:Boolean((await LearningAPI.client.functions.invoke('stripe-webhook',{body:{action:'checkout'}})).error),
                    beacon:navigator.sendBeacon('https://blocked.example.invalid/collect','synthetic')};
                }''')
                self.assertEqual(denied,{'checkout':True,'portal':True,'wrong':True,'payments':True,'directInvoke':True,'beacon':False})
                self.assertEqual(outgoing,[])
                self.assertEqual(errors,[])
                browser.close()


if __name__=='__main__':
    unittest.main()

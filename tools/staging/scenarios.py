"""Bounded E2E scenarios. Drivers require real staging capabilities to certify them.

No HTTP, mailbox, browser or admin remote driver is enabled by this release.
Tests may supply explicit LOCAL_CONTRACT drivers; those are not staging evidence.
"""
from concurrent.futures import ThreadPoolExecutor
import secrets
import json
import threading
import uuid
from urllib.parse import quote

from .common import GuardError, RemoteDisabled, require, remote_operation


class Budget:
    def __init__(self, maximum=60):
        require(type(maximum) is int and 1 <= maximum <= 60, 'Invalid request budget')
        self.maximum, self.used, self.lock = maximum, 0, threading.Lock()

    def consume(self):
        with self.lock:
            require(self.used < self.maximum, 'Request budget exhausted')
            self.used += 1


def concurrent_quota(operation, remaining=2, requests=5):
    require(type(requests) is int and 1 <= requests <= 5
            and type(remaining) is int and 0 <= remaining <= requests, 'Concurrent case bounds refused')
    barrier = threading.Barrier(requests)
    def invoke(index):
        barrier.wait(timeout=10)
        return operation(index)
    with ThreadPoolExecutor(max_workers=requests) as pool:
        responses = list(pool.map(invoke, range(requests)))
    return responses


def validate_quota(responses, remaining, before, after, accepted_effects, rejected_effects):
    successes = sum(status == 200 for status in responses)
    assert all(status in (200,403) for status in responses), 'Unexpected quota response'
    assert successes == min(len(responses),remaining), 'Incorrect number of accepted requests'
    assert after == before + successes, 'Quota counter lost or exceeded accepted consumption'
    assert accepted_effects == successes and rejected_effects == 0, 'Inconsistent quota effects'


class Context:
    """In-memory credentials only. Never serialized by the report writer."""
    def __init__(self, manifest, transport=None, capabilities=(), basis='REAL_STAGING'):
        self.manifest, self.transport = manifest, transport
        self.capabilities, self.basis = set(capabilities), basis
        self.state, self.created_ids, self.budget = {}, [], Budget()
        self.mailbox = self.browser = self.admin = None

    def request(self, method, path, actor=None, body=None):
        require(path.startswith(('/auth/v1/','/rest/v1/','/functions/v1/'))
                and '://' not in path and not path.startswith('//'), 'Relative API path required')
        self.budget.consume()
        if self.basis != 'LOCAL_CONTRACT' or self.transport is None:
            remote_operation()
        return self.transport(method,path,actor,body)


def auth_confirmation(ctx):
    for index, actor in enumerate(('A','B')):
        credentials={'email':ctx.manifest['qa_emails'][index],'password':secrets.token_urlsafe(24)+'aA1!'}
        ctx.state['credentials_'+actor]=credentials
        signed = ctx.request('POST','/auth/v1/signup?redirect_to='+quote(ctx.manifest['web_origin']+'/',safe=''),actor,credentials)
        assert signed['status'] == 200 and not signed['body'].get('access_token')
        ctx.mailbox.confirm(actor, ctx.manifest['web_origin'])
        ctx.state[actor] = ctx.request('POST','/auth/v1/token?grant_type=password',actor,credentials)['body']
        ctx.admin.assert_single_provisioned_account(actor)


def recovery(ctx):
    ctx.request('POST','/auth/v1/recover?redirect_to='+quote(ctx.manifest['web_origin']+'/?recuperar=1',safe=''),
                'A',{'email':ctx.manifest['qa_emails'][0]})
    ctx.mailbox.recover('A',ctx.manifest['web_origin'])
    ctx.browser.assert_password_change_and_expired_link('A')


def sessions(ctx):
    ctx.browser.assert_login_refresh_logout_reopen('A')


def profiles_rls(ctx):
    for actor, code in [('A','P-AA000001'),('B','P-AA000001')]:
        identifier = str(uuid.uuid4())
        owner = ctx.state[actor]['user']['id']
        row = {'id':identifier,'account_id':owner,'name':code,'age_band':'primary'}
        assert ctx.request('POST','/rest/v1/learner_profiles',actor,row)['status'] == 201
        ctx.state['profile_'+actor] = identifier
        ctx.created_ids.append({'kind':'profile','actor':actor,'id':identifier})
    path = '/rest/v1/learner_profiles?id=eq.'+ctx.state['profile_A']
    assert ctx.request('GET',path,'A')['body']
    assert ctx.request('PATCH',path,'A',{'locale':'es_es'})['body'][0]['locale']=='es_es'
    assert ctx.request('POST','/rest/v1/learner_profiles','A',{
        'id':str(uuid.uuid4()),'account_id':ctx.state['A']['user']['id'],
        'name':'P-AA000001','age_band':'primary'})['status']==409
    assert ctx.request('GET',path,'B')['body'] == []
    assert ctx.request('PATCH',path,'B',{'locale':'es_es'})['body'] == []
    assert ctx.request('DELETE',path,'B')['body']==[]
    assert ctx.request('PATCH',path,'A',{'account_id':ctx.state['B']['user']['id']})['status']==403
    assert ctx.request('GET',path,None)['status'] in (401,403)
    for actor in ('B',None):
        for action in ('export','delete'):
            assert ctx.request('POST','/rest/v1/rpc/manage_learner_privacy',actor,{
                'p_action':action,'p_profile':ctx.state['profile_A']})['status'] in (401,403)


def results(ctx):
    for modality, correct in [('guided_wait',None),('rule_application',True)]:
        attempt = str(uuid.uuid4())
        metrics={'schema':'gliax.exercise-metrics.v1','modality':modality,'level':1}
        if modality=='guided_wait':
            metrics.update(interval_completed=True,interval_ms=3000,duration_ms=3120,restarts=1,interruptions=1)
        else:
            metrics.update(trials=4,correct=3,errors=0,omissions=1,switches=1,response_times_ms=[510,620,580])
        row = {'profile_id':ctx.state['profile_A'],'client_attempt_id':attempt,
               'subject':'executive','level':1,'correct':correct,'points':0,
               'detail':json.dumps(metrics)}
        path='/rest/v1/exercise_results?on_conflict=profile_id,client_attempt_id'
        # The authorized driver must set Prefer: resolution=ignore-duplicates.
        for _ in range(2):
            assert ctx.request('POST',path,'A',row)['status'] in (200,201,204)
        recovered=ctx.request('GET','/rest/v1/exercise_results?client_attempt_id=eq.'+attempt,'A')['body']
        assert len(recovered)==1 and recovered[0]['correct'] is correct
        assert json.loads(recovered[0]['detail'])==metrics
        assert ctx.request('GET','/rest/v1/exercise_results?client_attempt_id=eq.'+attempt,'B')['body']==[]
        assert ctx.request('POST',path,'B',row)['status']==403
    assert ctx.request('GET','/rest/v1/exercise_results',None)['status'] in (401,403)
    ctx.browser.assert_outbox_recovery_and_history('A')


def content(ctx):
    body={'profile_id':ctx.state['profile_A'],'kind':'exercise','domain':'attention',
          'level':1,'count':1,'client_revision':13}
    response=ctx.request('POST','/functions/v1/request-learning-content','A',body)
    assert response['status']==200 and response['body']['items']
    assert ctx.request('POST','/functions/v1/request-learning-content','B',body)['status']==404
    ctx.admin.assert_only_aggregate_change_for_independent(lambda:ctx.request(
        'POST','/functions/v1/request-learning-content','A',{**body,'session_only':True}))


def quotas(ctx):
    for route in ('edge','private_rpc'):
        snapshot=ctx.admin.prepare_synthetic_quota(route,remaining=2)
        replies=concurrent_quota(lambda index:ctx.admin.quota_request(ctx,route,index))
        after=ctx.admin.quota_snapshot(route)
        validate_quota(replies,2,snapshot['used'],after['used'],after['accepted_effects'],after['rejected_effects'])
        ctx.admin.assert_other_professional_unchanged('B')


def compatibility(ctx):
    ctx.admin.assert_sql_compatibility_and_private_function_acl()


def permissions(ctx):
    ctx.admin.assert_safe_permissions_and_sequences()


def export_delete(ctx):
    profile=ctx.state['profile_A']
    exported=ctx.request('POST','/rest/v1/rpc/manage_learner_privacy','A',{'p_action':'export','p_profile':profile})
    assert exported['status']==200 and exported['body']['profile']['id']==profile
    ctx.browser.assert_csv_export('A')
    deleted=ctx.request('POST','/rest/v1/rpc/manage_learner_privacy','A',{'p_action':'delete','p_profile':profile})
    assert deleted['status']==200 and deleted['body']['deleted'] is True
    ctx.admin.assert_cascades_and_other_professional_preserved(profile)


CASES = (
    ('auth_confirmation', ('auth','mailbox','admin'), auth_confirmation),
    ('password_recovery', ('auth','mailbox','browser'), recovery),
    ('session_lifecycle', ('auth','browser'), sessions),
    ('profiles_rls', ('auth','data_api'), profiles_rls),
    ('results_recovery', ('auth','data_api','browser'), results),
    ('deno_content', ('auth','deno_edge','admin'), content),
    ('concurrent_quotas', ('auth','deno_edge','admin'), quotas),
    ('sql_compatibility', ('admin',), compatibility),
    ('effective_permissions', ('admin',), permissions),
    ('export_delete', ('auth','data_api','browser','admin'), export_delete),
)


def evaluate(case_id, operation, basis):
    require(basis in ('REAL_STAGING','LOCAL_CONTRACT'), 'Unknown evidence basis')
    try:
        if basis=='REAL_STAGING':
            remote_operation()
        operation()
        return {'id':case_id,'status':'PASSED','basis':basis,'reason':'ASSERTIONS_SATISFIED'}
    except RemoteDisabled:
        return {'id':case_id,'status':'NOT RUN','basis':basis,'reason':'REMOTE_EXECUTION_DISABLED'}
    except Exception:
        # No exception text, URLs, bodies, tokens or credentials in public reports.
        return {'id':case_id,'status':'FAILED','basis':basis,'reason':'ASSERTION_OR_DRIVER_FAILURE'}


def run_suite(ctx):
    results=[]
    for name, prerequisites, operation in CASES:
        if not set(prerequisites) <= ctx.capabilities:
            results.append({'id':name,'status':'NOT RUN','basis':ctx.basis,'reason':'CAPABILITY_UNAVAILABLE'})
        elif ctx.basis=='REAL_STAGING':
            results.append(evaluate(name,remote_operation,ctx.basis))
        else:
            results.append(evaluate(name,lambda:operation(ctx),ctx.basis))
    return results

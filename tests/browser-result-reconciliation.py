"""Recover individual confirmed results and reconcile the cached profile history."""
import importlib.util, json, os, tempfile, threading
from pathlib import Path
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright
from browser_support import ROOT, workspace

spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
wait_id='aaaaaaaa-1111-4111-8111-111111111111';rule_id='bbbbbbbb-2222-4222-8222-222222222222';race_id='cccccccc-3333-4333-8333-333333333333';other_id='dddddddd-4444-4444-8444-444444444444'
wait_detail={'schema':'gliax.exercise-metrics.v1','modality':'guided_wait','interval_completed':True,'level':1,'interval_ms':3000,'duration_ms':3000,'restarts':0,'interruptions':0}
rule_detail={'schema':'gliax.exercise-metrics.v1','modality':'rule_application','level':2,'trials':4,'correct':3,'errors':0,'omissions':1,'switches':1,'response_times_ms':[510,620,580]}
session='session-recovery'
def dbrow(attempt,detail,subject,correct,occurred):
 return {'profile_id':'primary','client_attempt_id':attempt,'occurred_at':occurred,'session_id':session,'session_started_at':'2026-11-17T10:00:00.000Z','subject':subject,'level':detail['level'],'correct':correct,'points':0,'item_id':f'{detail["modality"]}-item','detail':json.dumps(detail,separators=(',',':'))}
legacy={'ts':'2026-11-17T09:59:00.000Z','sessionId':'session-old','sessionStartedAt':'2026-11-17T09:58:00.000Z','subject':'executive','level':1,'correct':True,'points':5,'itemId':'legacy-repeated-item','detail':'standard'}
def legacy_dbrow(key):
 return {'profile_id':'primary','occurred_at':legacy['ts'],'session_id':legacy['sessionId'],'session_started_at':legacy['sessionStartedAt'],'subject':legacy['subject'],'level':legacy['level'],'correct':legacy['correct'],'points':legacy['points'],'item_id':legacy['itemId'],'detail':legacy['detail']}

try:
 with sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  rule_history={'clientAttemptId':rule_id,'ts':'2026-11-17T10:01:00.000Z','sessionId':session,'sessionStartedAt':'2026-11-17T10:00:00.000Z','subject':'executive','level':2,'correct':True,'points':0,'itemId':'rule_application-item','detail':json.dumps(rule_detail,separators=(',',':'))}
  fillers=[{'ts':f'2026-01-01T00:00:{index//1000:02d}.{index%1000:03d}Z','sessionId':'old-session','subject':'memory','level':1,'correct':False,'points':0,'itemId':f'old-{index}','detail':'standard'} for index in range(4998)]
  profile={'id':'primary','name':'P-00000001','age_band':'primary','progress':{'initialLevel':1,'scores':{'executive':40},'levels':{'executive':1},'totalAttempts':5000,'totalCorrect':2500,'history':[rule_history,legacy,*fillers]}}
  other_profile={'id':'secondary','name':'P-00000002','age_band':'primary','progress':{'initialLevel':1,'history':[]}}
  other_result={'profile_id':'secondary','client_attempt_id':other_id,'occurred_at':'2026-11-17T10:00:45.000Z','session_id':'other-session','session_started_at':'2026-11-17T10:00:00.000Z','subject':'memory','level':1,'correct':True,'points':10,'item_id':'other-profile-item','detail':'standard'}
  race_row={'profile_id':'primary','client_attempt_id':race_id,'occurred_at':'2026-11-17T10:01:30.000Z','session_id':session,'session_started_at':'2026-11-17T10:00:00.000Z','subject':'executive','level':1,'correct':True,'points':10,'item_id':'pending-before-read','detail':'standard'}
  seed={'profile':profile,'other_profile':other_profile,'rows':{'primary:'+wait_id:dbrow(wait_id,wait_detail,'executive',None,'2026-11-17T10:00:30.000Z'),'primary:legacy-a':legacy_dbrow('legacy-a'),'primary:legacy-b':legacy_dbrow('legacy-b'),'secondary:'+other_id:other_result},'attempt':rule_id,'detail':rule_detail,'race_attempt':race_id,'race_row':race_row}
  page.add_init_script(f'''const seed={json.dumps(seed)};if(!localStorage.getItem('__reconciliationSeeded')){{localStorage.setItem('__mock_profiles',JSON.stringify([seed.profile,seed.other_profile]));localStorage.setItem('__mock_exercise_results',JSON.stringify(seed.rows));localStorage.setItem('lh:result-outbox:v1:account:primary:'+seed.attempt,JSON.stringify({{profile_id:'primary',client_attempt_id:seed.attempt,occurred_at:'2026-11-17T10:01:00.000Z',session_id:'session-recovery',session_started_at:'2026-11-17T10:00:00.000Z',subject:'executive',level:2,correct:true,points:0,item_id:'rule_application-item',detail:JSON.stringify(seed.detail),state:'uncertain',created_at:'2026-11-17T10:01:00.000Z'}}));localStorage.setItem('lh:result-outbox:v1:account:primary:'+seed.race_attempt,JSON.stringify(seed.race_row));localStorage.setItem('__reconciliationSeeded','1')}}''')
  page.clock.set_fixed_time(datetime(2026,11,20,12,tzinfo=timezone.utc))
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect',state='attached');workspace(page).locator('#profileSelect').select_option('primary')
  page.wait_for_function('()=>__profiles.find(p=>p.id==="primary").progress.history?.some(x=>x.clientAttemptId==="'+wait_id+'")')
  page.wait_for_function('()=>Object.keys(JSON.parse(localStorage.getItem("__mock_exercise_results")||"{}")).length===6')
  page.wait_for_function('()=>!localStorage.getItem("lh:result-outbox:v1:account:primary:'+rule_id+'")')
  page.wait_for_function('()=>!localStorage.getItem("lh:result-outbox:v1:account:primary:'+race_id+'")')
  rows=page.evaluate('()=>__profiles.find(p=>p.id==="primary").progress.history');assert len(rows)==5000,'reconstruction retains the existing 5,000-row history cap';assert len([x for x in rows if x.get('clientAttemptId')==wait_id])==1;assert len([x for x in rows if x.get('clientAttemptId')==rule_id])==1;assert len([x for x in rows if x.get('clientAttemptId')==race_id])==1,'an outbox result confirmed during recovery is included in the same open';assert len([x for x in rows if x.get('itemId')=='legacy-repeated-item'])==2,'one persisted historical overlap is deduplicated while a second identical legacy attempt remains distinct';assert all(x.get('clientAttemptId')!=other_id for x in rows),'results from a different profile must not enter this history'
  recovered_wait=next(x for x in rows if x.get('clientAttemptId')==wait_id);assert recovered_wait.get('correct') is None and recovered_wait.get('points')==0,'guided_wait stays neutral and unscored'
  operations=page.evaluate('()=>JSON.parse(localStorage.getItem("__mock_result_operations")||"[]")');first_select=next(i for i,x in enumerate(operations) if x['type']=='select' and x['profile_id']=='primary');upsert_indices={x['client_attempt_id']:i for i,x in enumerate(operations) if x['type']=='upsert' and x['profile_id']=='primary'};assert all(upsert_indices.get(attempt,-1)<first_select for attempt in (rule_id,race_id)),'outbox confirmations must finish before the canonical-results read'
  totals=page.evaluate('()=>{const p=__profiles.find(p=>p.id==="primary").progress;return {attempts:p.totalAttempts,correct:p.totalCorrect,scores:p.scores.executive,levels:p.levels.executive}}');assert totals=={'attempts':5000,'correct':2500,'scores':40,'levels':1},totals
  page.reload(wait_until='networkidle');page.wait_for_selector('#profileSelect',state='attached');page.wait_for_function('()=>__profiles.find(p=>p.id==="primary").progress.history?.length===5000')
  rows=page.evaluate('()=>__profiles.find(p=>p.id==="primary").progress.history');assert len([x for x in rows if x.get('clientAttemptId')==wait_id])==1;assert len([x for x in rows if x.get('clientAttemptId')==rule_id])==1;assert len([x for x in rows if x.get('itemId')=='legacy-repeated-item'])==2
  totals=page.evaluate('()=>{const p=__profiles.find(p=>p.id==="primary").progress;return {attempts:p.totalAttempts,correct:p.totalCorrect,scores:p.scores.executive,levels:p.levels.executive}}');assert totals=={'attempts':5000,'correct':2500,'scores':40,'levels':1},totals
  workspace(page).locator('#navMenu [data-section="progress"]').click()
  page.locator('#guidedWaitProgress').evaluate('(el)=>el.open=true');page.locator('#ruleApplicationProgress').evaluate('(el)=>el.open=true')
  assert 'Espera guiada · 1 intervalos finalizados' in page.locator('#guidedWaitProgress').inner_text()
  assert 'Actúa con reglas · 1 actividades' in page.locator('#ruleApplicationProgress').inner_text()
  wait_text=page.locator('#guidedWaitProgress').inner_text();rule_text=page.locator('#ruleApplicationProgress').inner_text();assert 'intervalo 3 s' in wait_text,wait_text;assert '3/4 aciertos por ensayo' in rule_text,rule_text
  page.locator('#progressArea').select_option('Funciones ejecutivas')
  assert page.locator('.progress-kpi').nth(1).locator('strong').inner_text()=='100%', 'guided_wait null scores must not lower executive accuracy'
  with tempfile.TemporaryDirectory() as tmp:
   with page.expect_download() as download:page.locator('#exportDetailCsv').click()
   path=Path(tmp)/'results.csv';download.value.save_as(path);csv=path.read_text(encoding='utf-8-sig')
   for value in (wait_id,rule_id,race_id,'Espera guiada','Aplicación de reglas','Intervalo finalizado','Tiempos observados (ms)'):assert value in csv,value
   assert csv.count('2026-11-17T09:59:00.000Z')==2,'CSV retains the two distinct historical attempts'
  before=page.evaluate('()=>({profiles:localStorage.getItem("__mock_profiles"),rows:localStorage.getItem("__mock_exercise_results"),operations:localStorage.getItem("__mock_result_operations")})')
  page.evaluate('''async()=>{LearningAPI.setIndependent('primary');await LearningAPI.saveProgress('primary',{history:[]});await LearningAPI.saveResult('primary',{clientAttemptId:'cccccccc-3333-4333-8333-333333333333',sessionOnly:true,correct:true});await LearningAPI.listResults('primary');LearningAPI.setIndependent(null)}''')
  after=page.evaluate('()=>({profiles:localStorage.getItem("__mock_profiles"),rows:localStorage.getItem("__mock_exercise_results"),operations:localStorage.getItem("__mock_result_operations")})');assert after==before,'independent sessions must neither query nor persist individual result records'
  assert not errors,errors;browser.close();print('PASS: result/progress partial writes reconcile after reload; pending writes precede canonical read; legacy overlap deduplicates by multiplicity without collapsing identical attempts; 5,000-history cap; guided_wait stays null/unscored and does not lower accuracy; rule_application and both modalities appear in Progress/CSV; totals unchanged; profile isolation; independent session does not persist/query')
finally:server.shutdown();server.server_close()

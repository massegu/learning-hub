"""Recover individual confirmed results and reconcile the cached profile history."""
import importlib.util, json, os, tempfile, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT, workspace

spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());threading.Thread(target=server.serve_forever,daemon=True).start()
wait_id='aaaaaaaa-1111-4111-8111-111111111111';rule_id='bbbbbbbb-2222-4222-8222-222222222222';other_id='dddddddd-4444-4444-8444-444444444444'
wait_detail={'schema':'gliax.exercise-metrics.v1','modality':'guided_wait','interval_completed':True,'level':1,'interval_ms':3000,'duration_ms':3000,'restarts':0,'interruptions':0}
rule_detail={'schema':'gliax.exercise-metrics.v1','modality':'rule_application','level':2,'trials':4,'correct':3,'errors':0,'omissions':1,'switches':1,'response_times_ms':[510,620,580]}
session='session-recovery'
def dbrow(attempt,detail,subject,correct,occurred):
 return {'profile_id':'primary','client_attempt_id':attempt,'occurred_at':occurred,'session_id':session,'session_started_at':'2026-11-17T10:00:00.000Z','subject':subject,'level':detail['level'],'correct':correct,'points':0,'item_id':f'{detail["modality"]}-item','detail':json.dumps(detail,separators=(',',':'))}

try:
 with sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  profile={'id':'primary','name':'P-00000001','age_band':'primary','progress':{'initialLevel':1,'scores':{'executive':40},'levels':{'executive':1},'totalAttempts':7,'totalCorrect':4,'history':[{'clientAttemptId':rule_id,'ts':'2026-11-17T10:01:00.000Z','sessionId':session,'sessionStartedAt':'2026-11-17T10:00:00.000Z','subject':'executive','level':2,'correct':True,'points':0,'itemId':'rule_application-item','detail':json.dumps(rule_detail,separators=(',',':'))}]}}
  other_profile={'id':'secondary','name':'P-00000002','age_band':'primary','progress':{'initialLevel':1,'history':[]}}
  other_result={'profile_id':'secondary','client_attempt_id':other_id,'occurred_at':'2026-11-17T10:00:45.000Z','session_id':'other-session','session_started_at':'2026-11-17T10:00:00.000Z','subject':'memory','level':1,'correct':True,'points':10,'item_id':'other-profile-item','detail':'standard'}
  seed={'profile':profile,'other_profile':other_profile,'rows':{'primary:'+wait_id:dbrow(wait_id,wait_detail,'executive',None,'2026-11-17T10:00:30.000Z'),'secondary:'+other_id:other_result},'attempt':rule_id,'detail':rule_detail}
  page.add_init_script(f'''const seed={json.dumps(seed)};localStorage.setItem('__mock_profiles',JSON.stringify([seed.profile,seed.other_profile]));localStorage.setItem('__mock_exercise_results',JSON.stringify(seed.rows));localStorage.setItem('lh:result-outbox:v1:account:primary:'+seed.attempt,JSON.stringify({{profile_id:'primary',client_attempt_id:seed.attempt,occurred_at:'2026-11-17T10:01:00.000Z',session_id:'session-recovery',session_started_at:'2026-11-17T10:00:00.000Z',subject:'executive',level:2,correct:true,points:0,item_id:'rule_application-item',detail:JSON.stringify(seed.detail),state:'uncertain',created_at:'2026-11-17T10:01:00.000Z'}}));''')
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');page.wait_for_selector('#profileSelect',state='attached');workspace(page).locator('#profileSelect').select_option('primary')
  page.wait_for_function('()=>__profiles.find(p=>p.id==="primary").progress.history?.some(x=>x.clientAttemptId==="'+wait_id+'")')
  page.wait_for_function('()=>Object.keys(JSON.parse(localStorage.getItem("__mock_exercise_results")||"{}")).length===3')
  page.wait_for_function('()=>!localStorage.getItem("lh:result-outbox:v1:account:primary:'+rule_id+'")')
  rows=page.evaluate('()=>__profiles.find(p=>p.id==="primary").progress.history');assert len([x for x in rows if x.get('clientAttemptId')==wait_id])==1;assert len([x for x in rows if x.get('clientAttemptId')==rule_id])==1;assert all(x.get('clientAttemptId')!=other_id for x in rows),'results from a different profile must not enter this history'
  totals=page.evaluate('()=>{const p=__profiles.find(p=>p.id==="primary").progress;return {attempts:p.totalAttempts,correct:p.totalCorrect,scores:p.scores.executive,levels:p.levels.executive}}');assert totals=={'attempts':7,'correct':4,'scores':40,'levels':1},totals
  workspace(page).locator('#navMenu [data-section="progress"]').click()
  page.locator('#guidedWaitProgress').evaluate('(el)=>el.open=true');page.locator('#ruleApplicationProgress').evaluate('(el)=>el.open=true')
  assert 'Espera guiada · 1 intervalos finalizados' in page.locator('#guidedWaitProgress').inner_text()
  assert 'Actúa con reglas · 1 actividades' in page.locator('#ruleApplicationProgress').inner_text()
  wait_text=page.locator('#guidedWaitProgress').inner_text();rule_text=page.locator('#ruleApplicationProgress').inner_text();assert 'intervalo 3 s' in wait_text,wait_text;assert '3/4 aciertos por ensayo' in rule_text,rule_text
  with tempfile.TemporaryDirectory() as tmp:
   with page.expect_download() as download:page.locator('#exportDetailCsv').click()
   path=Path(tmp)/'results.csv';download.value.save_as(path);csv=path.read_text(encoding='utf-8-sig')
   for value in (wait_id,rule_id,'guided_wait','rule_application','gliax.exercise-metrics.v1','interval_completed','response_times_ms'):assert value in csv,value
  before=page.evaluate('()=>({profiles:localStorage.getItem("__mock_profiles"),rows:localStorage.getItem("__mock_exercise_results")})')
  page.evaluate('''async()=>{LearningAPI.setIndependent('primary');await LearningAPI.saveProgress('primary',{history:[]});await LearningAPI.saveResult('primary',{clientAttemptId:'cccccccc-3333-4333-8333-333333333333',sessionOnly:true,correct:true});await LearningAPI.listResults('primary');LearningAPI.setIndependent(null)}''')
  after=page.evaluate('()=>({profiles:localStorage.getItem("__mock_profiles"),rows:localStorage.getItem("__mock_exercise_results")})');assert after==before,'independent sessions must neither recover nor persist individual result records'
  assert not errors,errors;browser.close();print('PASS: confirmed result recovers after progress failure; pending result remains singular after progress success; guided_wait and rule_application appear in Progress/CSV; counters unchanged; independent session does not persist')
finally:server.shutdown();server.server_close()

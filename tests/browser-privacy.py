"""Real app/content handler; fake Auth/database boundary. SQL ownership is tested with PostgreSQL separately."""
import importlib.util,threading,tempfile,json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
class Handler(review.Handler):
 def send(self,data,kind='text/html; charset=utf-8',status=200):
  if isinstance(data,str) and kind.startswith('text/html'):data=data.replace(',.profile-actions','')
  return super().send(data,kind,status)
server=review.ReviewServer(('127.0.0.1',0),review.prepare());server.RequestHandlerClass=Handler;threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with tempfile.TemporaryDirectory() as tmp,sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle');workspace(page).locator('#profileSelect').select_option('primary')
  page.evaluate('''()=>{window.__current=null;const original=ActivityModel.forDelivery;ActivityModel.forDelivery=(it,...args)=>{window.__current=it;return original(it,...args)}}''')
  def answer_social():
   workspace(page).locator('#navMenu [data-subject=social]').click();page.wait_for_function('()=>__current?.domain==="social"&&document.querySelectorAll("#exerciseOptions [data-answer]").length>0')
   page.locator('#exerciseOptions [data-answer]').evaluate_all('(els,a)=>els.find(e=>e.dataset.answer===a).click()',page.evaluate('__current.a'));assert 'ok' in page.locator('#exerciseFeedback').get_attribute('class')
  answer_social();page.wait_for_function('()=>__profiles.find(p=>p.id==="primary").progress.history?.length===1')
  original=page.evaluate('JSON.stringify(__profiles.find(p=>p.id==="primary").progress)');saved=page.evaluate('__saved.length')
  workspace(page).locator('#independentSessionBtn').click();assert 'no se guardan' in page.locator('#independentSessionStatus').inner_text();assert page.locator('#profilePrivacyBtn').is_disabled()
  answer_social();assert page.evaluate('__requests.at(-1).session_only') is True;assert page.evaluate('__requests.at(-1).client_revision')==8
  assert page.evaluate('__saved.length')==saved;assert page.evaluate('JSON.stringify(__profiles.find(p=>p.id==="primary").progress)')==original
  workspace(page).locator('#independentSessionBtn').click();assert 'Seguimiento individual' in page.locator('#independentSessionStatus').inner_text();assert page.evaluate('JSON.stringify(__profiles.find(p=>p.id==="primary").progress)')==original
  workspace(page).locator('#independentSessionBtn').click();answer_social();page.reload(wait_until='networkidle');assert 'Seguimiento individual' in page.locator('#independentSessionStatus').inner_text();assert page.evaluate('JSON.stringify(__profiles.find(p=>p.id==="primary").progress)')==original
  workspace(page).locator('#profilePrivacyBtn').click();page.wait_for_function('()=>document.querySelector("#privacyStatus").textContent.includes("exportación")')
  page.locator('#privacyAlias').fill('P-024');page.locator('#privacyReviewDate').fill('2027-01-01');page.locator('#saveProfilePrivacy').click();page.wait_for_function('()=>document.querySelector("#privacyStatus").textContent.includes("guardados")')
  assert page.evaluate('__profiles.find(p=>p.id==="primary").name')=='P-024'
  page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.locator('#privacyDialog').screenshot(path='/tmp/privacy-dialog-mobile.png')
  with page.expect_download() as download:page.locator('#exportProfilePrivacy').click()
  path=Path(tmp)/'profile.json';download.value.save_as(path);data=json.loads(path.read_text());assert data['profile']['id']=='primary';assert len(data['results'])==1
  page.evaluate('window.__privacyFail=true');page.locator('#exportProfilePrivacy').click();page.wait_for_function('()=>document.querySelector("#privacyStatus").textContent.includes("No se ha podido")');assert page.locator('#exportProfilePrivacy').is_enabled();page.evaluate('window.__privacyFail=false')
  page.locator('#eraseProfilePrivacy').click();page.wait_for_selector('#privacyDialog',state='hidden');assert not page.evaluate('__profiles.some(p=>p.id==="primary")')
  assert page.locator('#profileSelect option[value=primary]').count()==0
  # A slow deletion must not remove the profile selected while it is pending.
  workspace(page).locator('#profileSelect').select_option('junior');page.evaluate('''()=>{const remove=LearningAPI.deleteProfile;LearningAPI.deleteProfile=id=>new Promise(resolve=>window.__releaseDelete=()=>resolve(remove(id)))}''')
  workspace(page).locator('#deleteProfileBtn').click();workspace(page).locator('#profileSelect').select_option('teen');page.evaluate('()=>__releaseDelete()');page.wait_for_function('()=>!__profiles.some(p=>p.id==="junior")')
  assert page.locator('#profileSelect').input_value()=='teen';assert page.locator('#profileSelect option[value=teen]').count()==1
  assert not errors,errors;browser.close();print('PASS: tracked/independent separation, no independent client writes, fresh adaptation, JSON export, profile review/rename/deletion, recoverable RPC failure and mobile dialog')
finally:server.shutdown();server.server_close()

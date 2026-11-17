"""Password/account UI against real frontend code; Auth calls are mocked, no emails sent."""
import importlib.util,http.server,threading,tempfile,os,re
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import workspace, ROOT,SDK, area, training_areas, wait_for_area
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');preview=importlib.util.module_from_spec(spec);spec.loader.exec_module(preview)
AUTH=r'''
window.__authEvents=[];window.__changes=[];window.__resets=[];window.__signUps=[];
client.auth.getSession=async()=>({data:{session:window.__signedIn===false?null:{user:{id:'account',email:'review@example.invalid'}}}});
client.auth.onAuthStateChange=callback=>{__authEvents.push(callback);return {data:{subscription:{unsubscribe(){}}}}};
client.auth.signOut=async()=>{window.__signedIn=false};
client.auth.signInWithPassword=async()=>{window.__signedIn=true;return {data:{session:{user:{id:'account'}},user:{id:'account'}}}};
client.auth.signUp=async({email,password,options})=>{__signUps.push({email,password,options});return {data:{user:{id:'new-account'},session:null},error:null}};
client.auth.updateUser=async({password})=>{if(window.__updateFail)return {error:{message:'Error de prueba recuperable'}};__changes.push(password);return {data:{user:{id:'account'}}}};
client.auth.resetPasswordForEmail=async(email,options)=>{__resets.push({email,...options});return {data:{}}};
return client;
'''
class Handler(preview.Handler):
 def send(self,data,kind='text/html; charset=utf-8',status=200):
  if isinstance(data,str) and kind.startswith('text/html'):data=data.replace('#signOutBtn,','')
  return super().send(data,kind,status)
 def do_GET(self):
  if self.path.split('?')[0]=='/__review/sdk.js':return self.send(SDK.replace('return client;',AUTH),'application/javascript')
  return super().do_GET()
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),lambda *a,**kw:Handler(*a,directory=str(ROOT),**kw));threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path)
  browser=p.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900});errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  origin=f'http://127.0.0.1:{server.server_port}'
  # A remembered profile can be deleted, or belong to a previous account.
  page.add_init_script("localStorage.setItem('lh_current_profile','unavailable-profile')")
  page.goto(origin,wait_until='networkidle');page.wait_for_selector('#changePasswordBtn',state='attached')
  assert page.locator('#profileSelect').input_value()=='early'
  assert page.evaluate("localStorage.getItem('lh_current_profile')")=='early'
  area(page, 'language').click()
  page.wait_for_selector('#exerciseOptions .option-btn, #orderCheck')
  workspace(page).locator('#changePasswordBtn').click();assert page.locator('#passwordDialog').is_visible()
  page.locator('#newPassword').fill('ClaveNueva123!');page.locator('#repeatPassword').fill('Distinta123!');page.locator('#savePassword').click()
  assert 'no coinciden' in page.locator('#passwordMessage').inner_text();assert page.evaluate('__changes.length')==0
  page.locator('#repeatPassword').fill('ClaveNueva123!');page.evaluate('window.__updateFail=true');page.locator('#savePassword').click()
  page.wait_for_function('document.querySelector("#passwordMessage").textContent.includes("recuperable")');assert page.locator('#savePassword').is_enabled()
  page.evaluate('window.__updateFail=false');page.locator('#savePassword').click();page.wait_for_function('__changes.length===1')
  assert 'actualizada' in page.locator('#passwordMessage').inner_text();assert page.locator('#newPassword').input_value()==''
  page.locator('#closePassword').click();page.locator('#signOutBtn').click();page.wait_for_selector('#authForgotPassword')
  page.locator('#authSignUp').click();assert 'correo electrónico' in page.locator('#authMessage').inner_text();assert page.evaluate('__signUps.length')==0
  page.locator('#authEmail').fill('new@example.invalid');page.locator('#authPassword').fill('short');page.locator('#authSignUp').click();assert '8 caracteres' in page.locator('#authMessage').inner_text();assert page.evaluate('__signUps.length')==0
  page.locator('#authPassword').fill('LocalTest123!');page.locator('#authSignUp').click();page.wait_for_function('__signUps.length===1');assert 'new@example.invalid' in page.locator('#authMessage').inner_text();assert page.locator('#authSignUp').is_enabled()
  assert page.evaluate('__signUps[0].options.emailRedirectTo')==origin+'/'
  signup_help=page.locator('#authGate').inner_text().lower()
  assert 'escribe tu email' in signup_help and 'pulsa crear cuenta' in signup_help and 'confirma el enlace' in signup_help
  # Sign in with a different owned profile list in the same tab. Previously
  # the old navigation stayed visible with profile=null and every area failed.
  page.evaluate("__profiles=__profiles.map(p=>({...p,id:'another-'+p.id}))")
  page.locator('#authEmail').fill('review@example.invalid');page.locator('#authPassword').fill('LocalTest123!');page.locator('#authSignIn').click()
  page.wait_for_function("()=>document.querySelector('#profileSelect').value==='another-early'")
  assert page.evaluate("localStorage.getItem('lh_current_profile')")=='another-early'
  workspace(page).locator('#profileSelect').select_option('another-teen')
  for domain in ['teenLanguage','teenMath','executive','memory']:
   area(page, domain).click();page.wait_for_selector('#exerciseOptions .option-btn')
   assert 'Cannot read' not in page.locator('#exercisePrompt').inner_text()
   assert page.evaluate('__requests.at(-1).profile_id')=='another-teen'
  workspace(page).locator('#signOutBtn').click();page.wait_for_selector('#authGate:not(.hidden)')
  assert page.locator('#landingTitle').inner_text() and page.locator('#authSignIn').is_visible()
  for width,height in [(1440,1000),(1024,900),(768,900),(390,844),(320,720)]:
   page.set_viewport_size({'width':width,'height':height})
   page.evaluate('window.scrollTo(0,0)')
   layout=page.evaluate("""()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,
    bounds:[...document.querySelectorAll('#authGate .landing-wrap,#authGate .landing-story,#authGate .landing-signin,#authGate .auth-card,#authGate input,#authGate .auth-actions button')]
     .filter(e=>getComputedStyle(e).display!=='none').map(e=>{const r=e.getBoundingClientRect();return [r.left,r.right]})})""")
   assert layout['scroll']<=layout['viewport']+1,(width,layout)
   assert all(left>=-1 and right<=width+1 for left,right in layout['bounds']),(width,layout)
   wrap=page.locator('.landing-wrap').bounding_box()
   assert wrap and wrap['y']>=-1,(width,wrap)
   story=page.locator('.landing-story').bounding_box();main=page.locator('.landing-story-main').bounding_box();title=page.locator('#landingTitle').bounding_box()
   assert story and main and title and story['y']<=main['y']<main['y']+main['height']<=story['y']+story['height']+1,(width,story,main,title)
   if width in (1440,390):page.screenshot(path=f'/tmp/gliax-landing-{width}.png',full_page=True)
  page.set_viewport_size({'width':1280,'height':900})
  page.locator('#authEmail').fill('')
  page.locator('#authForgotPassword').click();assert page.evaluate('__resets.length')==0
  page.locator('#authEmail').fill('review@example.invalid');page.locator('#authForgotPassword').click();page.wait_for_function('__resets.length===1')
  assert page.evaluate('__resets[0].redirectTo')==origin+'/?recuperar=1'
  assert 'Si existe una cuenta' in page.locator('#authMessage').inner_text()
  # A valid recovery session opens the modal before loading the workspace.
  page.goto(origin+'/?recuperar=1&next=https://evil.invalid',wait_until='networkidle');page.wait_for_selector('#passwordDialog[open]')
  assert page.locator('#appShell').is_hidden()
  page.locator('#newPassword').fill('Recuperada123!');page.locator('#repeatPassword').fill('Recuperada123!');page.locator('#savePassword').click();page.wait_for_function('__changes.length===1')
  page.locator('#closePassword').click();page.wait_for_selector('#appShell:not(.hidden)');assert 'recuperar=' not in page.url
  # SDK recovery events are handled without awaiting Auth inside its callback.
  page.evaluate('__authEvents.forEach(callback=>callback("PASSWORD_RECOVERY"))');page.wait_for_selector('#passwordDialog[open]')
  areas=page.locator('#homeLevels [data-home-area]').count()
  assert page.locator('#homeLevels [data-home-area] > strong').count()==areas
  assert page.locator('#homeLevels [data-home-area] .area-illustration').count()==areas
  # Recovery can open over the workspace. Its inactive navigation must fit
  # too: icon + an anonymous flex text item used to widen both mobile columns.
  for font,family in [('', ''), ('20px', ''), ('', 'monospace')]:
   page.evaluate('(font)=>document.documentElement.style.fontSize=font',font)
   page.evaluate('(family)=>document.querySelector("#navMenu").style.fontFamily=family',family)
   for width in [320,360,390,412]:
    page.set_viewport_size({'width':width,'height':844})
    layout=page.evaluate("""()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,
     overflow:[...document.querySelectorAll('#navMenu button,#passwordDialog,#passwordDialog input')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)})
      .map(e=>({id:e.id,text:e.textContent.trim(),right:e.getBoundingClientRect().right}))})""")
    assert layout['width']<=layout['viewport']+1,(font,width,layout)
    assert not layout['overflow'],(font,width,layout)
  page.evaluate("document.documentElement.style.fontSize='';document.querySelector('#navMenu').style.fontFamily=''")
  page.set_viewport_size({'width':390,'height':844})
  page.screenshot(path='/tmp/password-dialog-mobile.png');page.locator('#closePassword').click();page.wait_for_selector('#authGate:not(.hidden)')
  page.add_init_script('window.__signedIn=false');page.goto(origin+'/?recuperar=1',wait_until='networkidle');page.wait_for_selector('#authGate:not(.hidden)')
  assert 'caducado' in page.locator('#authMessage').inner_text();assert page.locator('#passwordDialog').is_hidden()
  # An account without learners must offer creation, not retain the last
  # account's navigation or remembered selection.
  page.evaluate("__profiles=[];localStorage.setItem('lh_current_profile','another-teen')")
  page.locator('#authEmail').fill('review@example.invalid');page.locator('#authPassword').fill('LocalTest123!');page.locator('#authSignIn').click()
  page.wait_for_selector('#profileGate:not(.hidden)')
  assert page.locator('#profileSelect option').count()==0
  assert page.evaluate("localStorage.getItem('lh_current_profile')") is None
  generated_code=page.locator('#newProfileName').input_value();assert re.fullmatch(r'P-[0-9A-F]{8}',generated_code),generated_code
  page.locator('#newProfileAge').select_option('teen');page.locator('#createProfileBtn').click()
  page.wait_for_selector('#profileGate.hidden',state='hidden')
  area(page, 'teenLanguage').click();page.wait_for_selector('#exerciseOptions .option-btn')
  assert page.evaluate('__requests.at(-1).profile_id')=='created'
  first_visit=browser.new_page(viewport={'width':1440,'height':1000});first_visit.add_init_script('window.__signedIn=false');first_visit.on('pageerror',lambda e:errors.append(str(e)))
  first_visit.goto(origin,wait_until='networkidle');first_visit.wait_for_selector('#authGate:not(.hidden)')
  for width,height in [(1440,1000),(390,844)]:
   first_visit.set_viewport_size({'width':width,'height':height});first_visit.evaluate('window.scrollTo(0,0)')
   wrap=first_visit.locator('.landing-wrap').bounding_box();story=first_visit.locator('.landing-story').bounding_box();main=first_visit.locator('.landing-story-main').bounding_box()
   assert wrap and wrap['y']>=-1 and story and main and main['y']>=story['y'] and main['y']+main['height']<=story['y']+story['height']+1,(width,wrap,story,main)
   assert first_visit.locator('#landingTitle').is_visible() and first_visit.locator('#authSignIn').is_visible()
   if width==390:first_visit.locator('#authSignIn').scroll_into_view_if_needed();assert first_visit.locator('#authSignIn').is_visible()
  assert not errors,errors
  print('PASS: unavailable remembered profile, account switch with four working areas, owned request IDs, password mismatch, error/retry, update, recovery and mobile; no real emails sent')
  browser.close()
finally:server.shutdown();server.server_close()

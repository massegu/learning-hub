"""Real frontend billing flow, mocked auth/Stripe/DB; never sends a payment."""
import importlib.util,http.server,threading,os
from playwright.sync_api import sync_playwright
from browser_support import ROOT,SDK
spec=importlib.util.spec_from_file_location('review',ROOT/'tools/review-preview.py');preview=importlib.util.module_from_spec(spec);spec.loader.exec_module(preview)
BILLING=r'''
 window.__billing=[];window.__billingFail=false;window.__billingURL=null;window.__accountReads=0;
 const invoke=client.functions.invoke;
 client.functions.invoke=async(name,options)=>{
  if(name!=='stripe-webhook')return invoke(name,options);
  __billing.push(options.body);
  if(__billingFail)return {error:{context:Response.json({error:'Error de pago recuperable'})}};
  return {data:{url:__billingURL||(options.body.action==='checkout'?'https://checkout.stripe.com/c/pay/local':'https://billing.stripe.com/p/session/local'),livemode:false},error:null};
 };
 const from=client.from;
 client.from=table=>{
  const q=from(table);
  if(table==='accounts'){
   const single=q.single;
   q.single=async()=>{__accountReads++;const result=await single();result.data.subscription_status=localStorage.getItem('__accountState')||'trial';return result};
  }
  return q;
 };
 return client;
'''
class Handler(preview.Handler):
 def send(self,data,kind='text/html; charset=utf-8',status=200):
  if isinstance(data,str) and kind.startswith('text/html'):data=data.replace('#subscribeBtn,#billingPortalBtn,','')
  return super().send(data,kind,status)
 def do_GET(self):
  if self.path.split('?')[0]=='/__review/sdk.js':return self.send(SDK.replace('return client;',BILLING),'application/javascript')
  return super().do_GET()
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),lambda *a,**kw:Handler(*a,directory=str(ROOT),**kw));threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE') or '/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1360,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('https://checkout.stripe.com/**',lambda route:route.fulfill(body='<p>Checkout simulado</p>',content_type='text/html'))
  page.route('https://billing.stripe.com/**',lambda route:route.fulfill(body='<p>Portal simulado</p>',content_type='text/html'))
  origin=f'http://127.0.0.1:{server.server_port}'
  page.goto(origin,wait_until='networkidle');page.locator('#subscribeBtn').wait_for(state='visible');assert page.locator('#subscribeBtn').inner_text()=='Probar pago · 25 €/mes'
  page.evaluate('__billingFail=true');page.locator('#subscribeBtn').click()
  page.wait_for_function('()=>document.querySelector("#billingMessage").textContent.includes("recuperable")')
  assert page.locator('#subscribeBtn').is_enabled();assert page.evaluate('__billing[0]')=={'action':'checkout','mode':'test'}
  assert page.locator('.main-content #billingMessage').count()==1
  page.evaluate('__billingFail=false;__billingURL="https://evil.invalid/pay"');page.locator('#subscribeBtn').click()
  page.wait_for_function('()=>document.querySelector("#billingMessage").textContent.includes("verificar")');assert page.url.startswith(origin)
  page.evaluate('__billingURL=null');page.locator('#subscribeBtn').click();page.wait_for_url('https://checkout.stripe.com/**')
  page.clock.install();page.goto(origin+'/?pago=pendiente',wait_until='networkidle')
  page.wait_for_selector('#billingMessage');assert 'comprobando' in page.locator('#billingMessage').inner_text()
  assert 'activa' not in page.locator('#accountStatus').inner_text().lower()
  page.evaluate("localStorage.setItem('__accountState','active')");page.clock.run_for(5100)
  page.wait_for_function('()=>document.querySelector("#accountStatus").textContent==="Suscripción activa"')
  assert 'Suscripción activa' in page.locator('#billingMessage').inner_text();assert 'pago=' not in page.url
  page.locator('#billingPortalBtn').click();page.wait_for_url('https://billing.stripe.com/**')
  page.goto(origin+'/?pago=cancelado',wait_until='networkidle');assert 'sin completar' in page.locator('#billingMessage').inner_text()
  page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  page.locator('.main-content').screenshot(path='/tmp/billing-return-mobile.png')
  assert not errors,errors
  print('PASS: server checkout/portal, correct mode and no client identities/prices, recoverable errors, hostile redirect blocked, return does not grant access, server confirmation refresh, cancellation and mobile; no real payment')
  browser.close()
finally:server.shutdown();server.server_close()

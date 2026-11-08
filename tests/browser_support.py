"""Shared local browser service boundary. Never contacts production Supabase."""
from pathlib import Path
import http.server
import io
import json
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SDK = r"""
window.__requests=[]; window.__deny=false; window.__bodyError=false; window.__saved=[]; window.__pending=false;
window.__profiles=JSON.parse(localStorage.getItem('__mock_profiles')||'null')||[
 {id:'early',name:'Sol',age_band:'primary',progress:{ageRoute:'early',initialLevel:1,_delivery:{keep:true}}},
 {id:'junior',name:'Alex',age_band:'primary',progress:{ageRoute:'junior',initialLevel:1}},
 {id:'primary',name:'Luis',age_band:'primary',progress:{initialLevel:1}},
 {id:'middle',name:'Clara',age_band:'middle',progress:{initialLevel:1}},
 {id:'teen',name:'Nora',age_band:'teen',progress:{initialLevel:1}}
];
window.supabase={createClient(){
 const client={auth:{getSession:async()=>({data:{session:{user:{id:'account',email:'test@example.invalid'}}}}),
 signOut:async()=>{},onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},
 functions:{invoke:async(name,{body})=>{
   __requests.push(body);
   if(__deny)return {error:{message:'Daily content limit reached'}};
   if(window.__delayNext){window.__delayNext=false;window.__pending=true;await new Promise(resolve=>window.__release=resolve);window.__pending=false;}
   const count=body.questions||body.count||1;
   const items=Array.from({length:count},(_,i)=>({id:'remote-'+__requests.length+'-'+i,type:'standard',theme:'Horarios de vuelos',why:'El vuelo sale a las 15:40.',scenario:'El vuelo F15-P7 sale a las 15:40.',q:'¿Qué criterio ayuda más?',opts:['Azul','Verde'],a:'Azul'}));
   if(window.__localeMode){const local=window.localeFixtures(Array.from({length:count},(_,i)=>body.domains?body.domains[i%body.domains.length]:body.domain));items.splice(0,items.length,...local.map((it,i)=>({...it,id:'remote-'+__requests.length+'-'+i})));}
   if(body.kind==='worksheet')items.forEach((it,i)=>{
     // Real variation for the semantic uniqueness gate: each question depends
     // on a different displayed card number, rather than a changed remote ID.
     const n=__requests.length*count+i+1;
     it.scenario+=' Tarjeta número '+n+'.';it.q='¿Qué número tiene la tarjeta?';
     it.opts=[String(n),String(n+1),String(n+2)];it.a=String(n);it.requiresStimulus=true;
   });
   if(__bodyError)return {data:{items,error:'Trial expired'},error:null};
   return {data:{items,usage:{used:__requests.length,limit:50}},error:null};
 }},rpc:async(name,args)=>{
   if(window.__privacyFail)return {error:{message:'offline privacy failure'}};
   const profile=__profiles.find(p=>p.id===args.p_profile);
   if(!profile)return {error:{message:'Profile not found'}};
   window.__privacyEvents=window.__privacyEvents||[];__privacyEvents.push({action:args.p_action,id:profile.id});
   if(args.p_action==='open')return {data:{review_at:profile.privacy_review_at||null}};
   if(args.p_action==='settings'){profile.name=args.p_alias;profile.privacy_review_at=args.p_review_at;return {data:structuredClone(profile)}};
   if(args.p_action==='export')return {data:{version:1,profile:structuredClone(profile),results:profile.progress.history||[],content_history:[],privacy_events:__privacyEvents.filter(x=>x.id===profile.id)}};
   if(args.p_action==='delete'){__profiles=__profiles.filter(p=>p.id!==profile.id);localStorage.setItem('__mock_profiles',JSON.stringify(__profiles));return {data:{deleted:true}}};
   return {error:{message:'Unknown privacy action'}};
 },from(table){
   let filter,operation,values;
   const q={select(){return q},order(){return q},eq(k,v){filter=v;return q},insert(v){operation='insert';values=v;return q},update(v){operation='update';values=v;return q},delete(){return q},single(){return Promise.resolve(result(true))},then(a,b){return Promise.resolve(result(false)).then(a,b)}};
   function result(single){
     if(table==='accounts'){
       if(operation==='update'){if(window.__saveLocaleFail)return {error:{message:'Mock save rejected'}};localStorage.setItem('__mock_account_locale',values.content_locale);operation=null;}
       return {data:{subscription_status:'active',content_locale:localStorage.getItem('__mock_account_locale')},error:null};
     }
     if(table==='learner_profiles'){
       if(operation==='insert'){
         const p={...values,id:'created'};__profiles.push(p);operation=null;return {data:p,error:null};
       }
       const p=__profiles.find(p=>p.id===filter);
       if(operation==='update'&&p){Object.assign(p,values);__saved.push(JSON.parse(JSON.stringify(p)));localStorage.setItem('__mock_profiles',JSON.stringify(__profiles));operation=null;}
       return {data:single?p:__profiles,error:null};
     }
     return {data:[],error:null};
   }
   return q;
 }};
 return client;
}};
"""

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

def doc_text(data):
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        root = ET.fromstring(z.read('word/document.xml'))
    return [n.text or '' for n in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')]


def doc_accessible_text(data):
    """Return Word text plus descriptive alternative text attached to drawings."""
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        root = ET.fromstring(z.read('word/document.xml'))
    text = []
    for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        for node in paragraph.iter():
            if node.tag == '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t':
                text.append(node.text or '')
            elif node.tag == '{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}docPr' and node.attrib.get('descr'):
                text.append(node.attrib['descr'])
    return text


def printable_stimulus_values(page, stimulus):
    """Extract the facts expected in a printable stimulus, including image transcripts."""
    kind = stimulus.get('type')
    if kind == 'text':
        return [stimulus['text']]
    if kind == 'list':
        return stimulus['items']
    if kind == 'table':
        return [value for row in stimulus['rows'] for value in row]
    if kind == 'document':
        source = page.evaluate('(id)=>DocumentLibrary.get(id)', stimulus['documentId'])
        return [block['text'] if block['type'] == 'text' else ' · '.join(value for row in block['rows'] for value in row) for block in source['transcript']]
    if kind in ('photo', 'photoPair'):
        return ['Escena cotidiana para observar.']
    raise AssertionError(f"Estímulo imprimible no contemplado: {stimulus}")


def workspace(page):
    """Open the responsive workspace and account/profile controls when needed."""
    toggle = page.locator('#workspaceMenu')
    if toggle.count() and toggle.is_visible() and toggle.get_attribute('aria-expanded') != 'true':
        toggle.click()
    account = page.locator('.account-tools > summary')
    if account.count() and account.is_visible() and account.evaluate('(e)=>!e.parentElement.open'):
        account.click()
    return page


class TrainingArea:
    """Compatibility-free handle for an area card in the current training view."""
    def __init__(self, page, domain):
        self.page = page
        self.domain = domain
        self.locator = page.locator(f'#homeLevels [data-home-area="{domain}"]')

    def count(self):
        return self.locator.count()

    def is_visible(self):
        # The old sidebar showed every available area regardless of the active section.
        return self.count() > 0

    def click(self, **kwargs):
        opened_early = False
        if self.page.locator('#profileSelect').count() and self.page.locator('#profileSelect').input_value() == 'early':
            early_area = self.page.locator(f'#earlyHub:not(.hidden) [data-early-area="{self.domain}"]')
            if not early_area.count() or not early_area.is_visible():
                self.page.locator('#navMenu [data-section="home"]').click()
                early_area = self.page.locator(f'#earlyHub:not(.hidden) [data-early-area="{self.domain}"]')
            if early_area.count() and early_area.is_visible():
                early_area.click(**kwargs)
                opened_early = True
        if not opened_early:
            workspace(self.page).locator('#navMenu [data-section="training"]').click()
            self.locator.click(**kwargs)
        options = self.page.locator('#activityOptions')
        if options.count() and options.is_visible() and not options.evaluate('(e)=>e.open'):
            options.locator('summary').click()

    def __getattr__(self, name):
        return getattr(self.locator, name)


def area(page, domain):
    """Select an area through the current Entrenar navigation and its area card."""
    return TrainingArea(page, domain)


def wait_for_area(page, domain):
    page.wait_for_function('(domain)=>Boolean(document.querySelector(`#homeLevels [data-home-area="${domain}"]`))', arg=domain)


def trace_virtual_timers(page):
    """Record scheduled and fired timers after Playwright's virtual clock is installed."""
    page.evaluate('''()=>{
      window.__qaTimerLog=[];const original=window.setTimeout;
      window.setTimeout=(callback,delay,...args)=>{
        const entry={scheduledAt:performance.now(),delay:Number(delay)||0,firedAt:null};
        window.__qaTimerLog.push(entry);if(window.__qaTimerLog.length>100)window.__qaTimerLog.shift();
        return original(()=>{entry.firedAt=performance.now();callback(...args);},delay);
      };
    }''')


def _click_exact_response(page, selector, attribute, value, item):
    value = str(value)
    try:
        page.wait_for_function(
            '({selector,attribute,value})=>Array.from(document.querySelectorAll(selector)).some(el=>el.getAttribute(attribute)===value)',
            arg={'selector': selector, 'attribute': attribute, 'value': value},
        )
    except Exception as error:
        rendered = page.locator('#exerciseOptions').evaluate(
            '(root)=>Array.from(root.querySelectorAll("button")).map(el=>({text:el.innerText,aria:el.getAttribute("aria-label"),answer:el.dataset.answer,value:el.dataset.value}))'
        )
        raise AssertionError(
            f"La respuesta declarada {value!r} no está en los controles visibles para "
            f"{item.get('contentKey') or item.get('id') or item.get('type')}; "
            f"controles renderizados: {rendered}"
        ) from error
    buttons = page.locator(selector)
    index = buttons.evaluate_all(
        '(els,args)=>els.findIndex(el=>el.getAttribute(args.attribute)===args.value)',
        {'attribute': attribute, 'value': value},
    )
    buttons.nth(index).click()


def click_order_response(page, item):
    """Select the declared order through each token's accessible name, not its illustration text."""
    for token in item['answer']:
        _click_exact_response(page, '#exerciseOptions .word-token', 'aria-label', token, item)
    page.locator('#orderCheck').click()


def _response_selector(item):
    kind = item.get('type')
    if kind == 'photoDifference':
        return '#exerciseVisual .photo-hit'
    if kind == 'order' or item.get('memoryResponse') == 'order':
        return '#exerciseOptions .word-token'
    if kind in ('multiSelect', 'documentReview', 'photoDifference', 'memoryMulti') or item.get('memoryResponse') == 'multiple':
        return '#exerciseOptions .multi-option'
    if kind == 'self' or item.get('responseType') == 'written':
        return '#textAnswerArea:not(.hidden)'
    if item.get('speedTask'):
        return '#startSpeedTrial'
    return '#exerciseOptions [data-answer]'


def wait_for_activity_response(page, item, *, advance_clock=False):
    """Wait for this item's actual response phase, including reveal-based memory tasks."""
    selector = _response_selector(item)
    if item.get('memoryResponse') == 'audio' and page.locator('#playMemoryAudio').is_visible():
        page.evaluate('''()=>{
          if(window.__qaSpeechStub)return;
          window.__qaSpeechLog=[];
          window.speechSynthesis.speak=utterance=>{
            window.__qaSpeechLog.push({text:utterance.text,lang:utterance.lang});
            setTimeout(()=>utterance.onend?.(),0);
          };
          window.__qaSpeechStub=true;
        }''')
        page.locator('#playMemoryAudio').click()
        page.wait_for_function('()=>window.__qaSpeechLog?.length>0&&document.querySelector("#answerMemoryAudio")&&!document.querySelector("#answerMemoryAudio").disabled')
        speech = page.evaluate('window.__qaSpeechLog.at(-1)')
        if speech['text'] != item.get('audioScript'):
            raise AssertionError(f"El audio reproducido no corresponde al guion declarado para {item.get('id')}: {speech}")
        page.locator('#answerMemoryAudio').click()
    elif item.get('photoTask', {}).get('kind') == 'recall' and page.locator('#showMemoryPhoto').is_visible():
        page.locator('#showMemoryPhoto').click()
        if advance_clock:
            page.locator('#exerciseVisual img').wait_for(state='visible')
            page.clock.run_for(item.get('revealMs', 6000) + 50)
    elif item.get('recallSequence') and page.locator('#startMemorySequence').is_visible():
        page.locator('#startMemorySequence').click()
        if advance_clock:
            duration = len(item['recallSequence']) * (item.get('sequenceStepMs', 1000) + 250) + 50
            page.clock.run_for(duration)
    elif item.get('type') == 'memoryReveal' and not page.locator(selector).first.is_visible():
        if advance_clock:
            page.clock.run_for(item.get('revealMs', 6000) + 500)
    try:
        page.locator(selector).first.wait_for(state='visible')
    except Exception as error:
        state = page.evaluate('''({selector})=>({item:window.__current,phase:{prompt:document.querySelector('#exercisePrompt')?.textContent,
          visual:document.querySelector('#exerciseVisual')?.innerHTML,options:document.querySelector('#exerciseOptions')?.innerHTML,
          activityOptions:document.querySelector('#activityOptions')?.outerHTML},
          controls:[...document.querySelectorAll('#exerciseOptions button')].map(b=>({id:b.id,class:b.className,text:b.innerText,answer:b.dataset.answer,value:b.dataset.value,hidden:b.hidden,disabled:b.disabled})),
          timers:window.__qaTimerLog||[],now:performance.now(),selector})''', {'selector': selector})
        Path('/tmp/browser-activity-response-debug.json').write_text(json.dumps(state,ensure_ascii=False,indent=2))
        raise AssertionError(f"La actividad {item.get('id')} ({item.get('type')}, {item.get('mechanic')}, {item.get('memoryResponse')}, {item.get('responseType')}) no alcanzó su fase de respuesta: {state}") from error
    if selector.endswith('[data-answer]') and item.get('a') is not None and not item.get('speedTask'):
        page.wait_for_function(
            '(answer)=>Array.from(document.querySelectorAll("#exerciseOptions [data-answer]")).some(el=>el.dataset.answer===answer)',
            arg=str(item['a']),
        )


def submit_declared_answer(page, item, *, advance_clock=False):
    """Answer the rendered interaction according to the item's response contract.

    The caller advances any timed exposure and waits for the response phase. A
    missing declared answer is reported with the actual controls; the helper
    never chooses a substitute.
    """
    kind = item.get('type')
    wait_for_activity_response(page, item, advance_clock=advance_clock)
    if kind == 'order' or item.get('memoryResponse') == 'order':
        click_order_response(page, item)
    elif kind == 'photoDifference':
        for answer in item['answers']:
            _click_exact_response(page, '#exerciseVisual .photo-hit', 'data-value', answer, item)
        check = page.locator('#multiCheck')
        if check.is_visible():
            check.click()
    elif kind in ('multiSelect', 'documentReview', 'memoryMulti') or item.get('memoryResponse') == 'multiple':
        for answer in item['answers']:
            _click_exact_response(page, '#exerciseOptions .multi-option', 'data-value', answer, item)
        check = page.locator('#multiCheck')
        if check.is_visible():
            check.click()
    elif kind == 'self' or item.get('responseType') == 'written':
        page.locator('#textAnswerInput').fill(item['sample'])
        page.locator('#textAnswerCheck').click()
        page.locator('[data-self="true"]').click()
    else:
        if 'a' not in item:
            raise AssertionError(f"La actividad no declara una respuesta compatible: {item}")
        if item.get('speedTask') and page.locator('#startSpeedTrial').is_visible():
            page.locator('#startSpeedTrial').click()
        _click_exact_response(page, '#exerciseOptions [data-answer]', 'data-answer', item['a'], item)
    page.wait_for_function('()=>document.querySelector("#exerciseFeedback").textContent.length>0')


def training_areas(page):
    """Return the available area identifiers and labels from the Entrenar screen."""
    workspace(page).locator('#navMenu [data-section="training"]').click()
    return page.locator('#homeLevels [data-home-area]').evaluate_all(
        '(els)=>els.map(e=>({domain:e.dataset.homeArea,label:e.querySelector("strong")?.textContent.trim()||e.textContent.trim()}))'
    )

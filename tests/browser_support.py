"""Shared local browser service boundary. Never contacts production Supabase."""
from pathlib import Path
import http.server
import io
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
   if(__bodyError)return {data:{items,error:'Trial expired'},error:null};
   return {data:{items,usage:{used:__requests.length,limit:50}},error:null};
 }},from(table){
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


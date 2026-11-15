(function(root){
 'use strict';
 const defaults={scale:1,spacing:false,warm:false,font:false};
 const key='lh_reader_assist_v1';let activeSpeech=null;
 function read(){try{return {...defaults,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{return {...defaults}}}
 function save(state){try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
 function stop(){if(root.speechSynthesis){root.speechSynthesis.cancel();activeSpeech=null;}}
 function mount(container){
  const passage=container?.querySelector('.reading-passage');if(!passage)return ()=>{};
  container.querySelector('.reader-assist')?.remove();
  const state=read(),toolbar=document.createElement('section');toolbar.className='reader-assist';toolbar.setAttribute('aria-label','Ayudas opcionales para leer');
  toolbar.innerHTML='<strong>Ayudas para leer</strong><button type="button" data-action="smaller" aria-label="Reducir tamaño del texto">A−</button><button type="button" data-action="larger" aria-label="Aumentar tamaño del texto">A+</button><button type="button" data-action="spacing" aria-pressed="false">Más espacio</button><button type="button" data-action="warm" aria-pressed="false">Fondo cálido</button><button type="button" data-action="font" aria-pressed="false">Letra clara</button><button type="button" data-action="speak">Leer en voz alta</button>';
  container.prepend(toolbar);
  const apply=()=>{passage.style.setProperty('--reader-scale',String(state.scale));passage.classList.toggle('reader-wide-spacing',state.spacing);passage.classList.toggle('reader-warm',state.warm);passage.classList.toggle('reader-clear-font',state.font);toolbar.querySelector('[data-action=spacing]').setAttribute('aria-pressed',String(state.spacing));toolbar.querySelector('[data-action=warm]').setAttribute('aria-pressed',String(state.warm));toolbar.querySelector('[data-action=font]').setAttribute('aria-pressed',String(state.font));};
  apply();
  toolbar.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;const action=button.dataset.action;
   if(action==='smaller')state.scale=Math.max(.85,Math.round((state.scale-.1)*100)/100);
   else if(action==='larger')state.scale=Math.min(1.6,Math.round((state.scale+.1)*100)/100);
   else if(action==='spacing')state.spacing=!state.spacing;
   else if(action==='warm')state.warm=!state.warm;
   else if(action==='font')state.font=!state.font;
   else if(action==='speak'){
    if(!root.speechSynthesis||!root.SpeechSynthesisUtterance){button.disabled=true;button.textContent='Lectura en voz no disponible';return;}
    stop();const utterance=new root.SpeechSynthesisUtterance(passage.innerText);utterance.lang='es-ES';utterance.rate=1;activeSpeech=utterance;button.textContent='Detener lectura';utterance.onend=()=>{activeSpeech=null;button.textContent='Leer en voz alta'};utterance.onerror=()=>{activeSpeech=null;button.textContent='Volver a intentar'};root.speechSynthesis.speak(utterance);return;
   }
   save(state);apply();
  });
  return ()=>{stop();toolbar.remove();passage?.style.removeProperty('--reader-scale');passage?.classList.remove('reader-wide-spacing','reader-warm','reader-clear-font')};
 }
 root.ReaderAssist={mount,stop,read};if(typeof module!=='undefined')module.exports=root.ReaderAssist;
})(typeof window==='undefined'?globalThis:window);

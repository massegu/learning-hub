(function(root){
 'use strict';
 const defaults={scale:1,spacing:false,warm:false,font:false,wordColors:false};
 const key='lh_reader_assist_v1';
 const reviewed=new Map([
  ['acción',['ac','ción']],['árbol',['ár','bol']],['biblioteca',['bi','blio','te','ca']],
  ['camino',['ca','mi','no']],['campo',['cam','po']],['cuento',['cuen','to']],
  ['dibujo',['di','bu','jo']],['escuela',['es','cue','la']],['gorrión',['go','rrión']],
  ['historia',['his','to','ria']],['juguete',['ju','gue','te']],['lectura',['lec','tu','ra']],
  ['parque',['par','que']],['pingüino',['pin','güi','no']],['pueblo',['pue','blo']],
  ['quiosco',['quios','co']],['rápido',['rá','pi','do']],['río',['rí','o']],
  ['subrayar',['sub','ra','yar']],['tarjeta',['tar','je','ta']],['texto',['tex','to']]
 ]);
 function syllables(token){
  const word=token.toLocaleLowerCase('es');
  // Whitelist difficult spellings, then apply only the unambiguous V-C-V
  // case. Terms with clusters, prefixes or adjacent vowels remain uncolored.
  if(reviewed.has(word))return [...reviewed.get(word)];
  if(!/^[a-záéíóúñ]+$/u.test(word)||/^(?:des|in|sub|trans|re|pos)|[qg]u|[wxyh]/.test(word))return null;
  const vowels=[...word.matchAll(/[aeiouáéíóú]/gu)].map(match=>match.index);
  if(vowels.length<2)return null;
  const boundaries=vowels.slice(1).map((position,i)=>{
   const bridge=word.slice(vowels[i]+1,position);
   return /^[bcdfgjklmnñprstvwz]$|^(?:ch|ll|rr)$/.test(bridge)?vowels[i]+1:null;
  });
  if(boundaries.includes(null))return null;
  const indexes=[0,...boundaries,word.length];
  return indexes.slice(1).map((end,i)=>word.slice(indexes[i],end));
 }
 function read(){try{return {...defaults,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{return {...defaults}}}
 function save(state){try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
 function stop(){root.speechSynthesis?.cancel();}
 function mount(container){
  const paragraphs=[...container.querySelectorAll('[data-reader-text]')];
  if(!paragraphs.length)return ()=>{};
  const state=read(),toolbar=document.createElement('section');
  const registry=root.CSS?.highlights;
  const highlightSupported=Boolean(registry&&root.Highlight);
  let color=Boolean(state.wordColors),guide=false,line=0,lines=[];
  toolbar.className='reader-assist';toolbar.setAttribute('aria-label','Ayudas opcionales para leer');
  toolbar.innerHTML='<strong>Ayudas para leer</strong><button type="button" data-action="smaller" aria-label="Reducir tamaño del texto">A−</button><button type="button" data-action="larger" aria-label="Aumentar tamaño del texto">A+</button><button type="button" data-action="spacing" aria-pressed="false">Más espacio</button><button type="button" data-action="warm" aria-pressed="false">Fondo cálido</button><button type="button" data-action="font" aria-pressed="false">Letra clara</button><button type="button" data-action="speak">Leer en voz alta</button>';
  if(highlightSupported)toolbar.insertAdjacentHTML('beforeend','<button type="button" data-action="words" aria-pressed="false">Colorear palabras</button><button type="button" data-action="guide" aria-pressed="false">Guía de lectura</button><div class="reader-guide-nav" hidden><button type="button" data-action="prior">Línea anterior</button><button type="button" data-action="next">Línea siguiente</button><span role="status"></span></div>');
  container.prepend(toolbar);
  const button=action=>toolbar.querySelector(`[data-action="${action}"]`);
  const range=(node,start,end)=>{
   const result=document.createRange();result.setStart(node,start);result.setEnd(node,end);return result;
  };
  function tokens(){
   return paragraphs.flatMap(p=>{
    const nodes=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);
    const parts=[];
    while(nodes.nextNode()){
     const text=nodes.currentNode;
     for(const word of text.data.matchAll(/[\p{L}\p{M}]+/gu))parts.push({text,start:word.index,value:word[0]});
    }
    return parts;
   });
  }
  function paintColors(){
   if(!highlightSupported)return;
   for(const name of ['gliax-syllable-a','gliax-syllable-b','gliax-word-a','gliax-word-b','gliax-word-c','gliax-word-d'])registry.delete(name);
   if(!color)return;
   const marks=[[],[],[],[]];
   tokens().forEach(({text,start,value},index)=>{
    marks[index%4].push(range(text,start,start+value.length));
   });
   for(let i=0;i<marks.length;i++){
    registry.set(['gliax-word-a','gliax-word-b','gliax-word-c','gliax-word-d'][i],new root.Highlight(...marks[i]));
   }
  }
  function paintGuide(rebuild=false){
   if(!highlightSupported)return;
   registry.delete('gliax-reading-line');
   const nav=toolbar.querySelector('.reader-guide-nav');
   nav.hidden=!guide;
   if(!guide)return;
   if(rebuild){
    lines=[];let previousTop=null;
    for(const {text,start,value} of tokens()){
     const mark=range(text,start,start+value.length),rect=mark.getBoundingClientRect();
     if(!rect.height)continue;
     if(previousTop===null||Math.abs(previousTop-rect.top)>2){lines.push([]);previousTop=rect.top;}
     lines.at(-1).push(mark);
    }
   }
   line=Math.min(Math.max(0,line),Math.max(0,lines.length-1));
   const marks=lines[line]||[];
   registry.set('gliax-reading-line',new root.Highlight(...marks));
   button('prior').disabled=line===0;
   button('next').disabled=line>=lines.length-1;
   nav.querySelector('[role=status]').textContent=lines.length?`Línea ${line+1} de ${lines.length}`:'';
  }
  const resize=()=>{if(guide)paintGuide(true);};
  const apply=()=>{
   for(const p of paragraphs){
    p.style.setProperty('--reader-scale',String(state.scale));
    for(const [name,on] of [['wide-spacing',state.spacing],['warm',state.warm],['clear-font',state.font]])p.classList.toggle('reader-'+name,on);
   }
   for(const name of ['spacing','warm','font'])button(name).setAttribute('aria-pressed',String(state[name]));
   button('words')?.setAttribute('aria-pressed',String(color));
   button('guide')?.setAttribute('aria-pressed',String(guide));
   paintColors();paintGuide(true);
  };
  apply();
  root.addEventListener('resize',resize);
  toolbar.addEventListener('click',event=>{
   const control=event.target.closest('button');if(!control)return;
   const action=control.dataset.action;
   if(action==='smaller')state.scale=Math.max(.85,Math.round((state.scale-.1)*100)/100);
   else if(action==='larger')state.scale=Math.min(1.6,Math.round((state.scale+.1)*100)/100);
   else if(action==='spacing'||action==='warm'||action==='font')state[action]=!state[action];
   else if(action==='words'){color=!color;state.wordColors=color;}
   else if(action==='guide'){guide=!guide;line=0;}
   else if(action==='prior'||action==='next'){
    line+=action==='prior'?-1:1;paintGuide();return;
   }else if(action==='speak'){
    if(!root.speechSynthesis||!root.SpeechSynthesisUtterance){control.disabled=true;control.textContent='Lectura en voz no disponible';return;}
    if(root.speechSynthesis.speaking){stop();control.textContent='Leer en voz alta';return;}
    const utterance=new root.SpeechSynthesisUtterance(paragraphs.map(p=>p.innerText).join('\n'));
    utterance.lang='es';utterance.rate=1;control.textContent='Detener lectura';
    utterance.onend=()=>{control.textContent='Leer en voz alta';};
    utterance.onerror=()=>{control.textContent='Volver a intentar';};
    root.speechSynthesis.speak(utterance);return;
   }
   save(state);apply();
  });
  return ()=>{
   stop();toolbar.remove();root.removeEventListener('resize',resize);
   for(const name of ['gliax-syllable-a','gliax-syllable-b','gliax-word-a','gliax-word-b','gliax-word-c','gliax-word-d','gliax-reading-line'])registry?.delete(name);
   for(const p of paragraphs){
    p.style.removeProperty('--reader-scale');p.classList.remove('reader-wide-spacing','reader-warm','reader-clear-font');
   }
  };
 }
 root.ReaderAssist={mount,stop,read,syllables};if(typeof module!=='undefined')module.exports=root.ReaderAssist;
})(typeof window==='undefined'?globalThis:window);

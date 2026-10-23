(function (root) {
  'use strict';
  const labels = Object.freeze({es_intl:'Español internacional',es_es:'España',es_mx:'México',es_co:'Colombia',es_ar:'Argentina',es_cl:'Chile',es_pa:'Panamá',es_cr:'Costa Rica'});
  const countries = Object.keys(labels);
  const currencies=Object.freeze({es_es:['EUR'],es_mx:['MXN'],es_co:['COP'],es_ar:['ARS'],es_cl:['CLP'],es_pa:['USD','PAB'],es_cr:['CRC']});
  const currencyPatterns={EUR:/€|(?<!\p{L})(?:euros?|EUR)(?!\p{L})/iu,USD:/(?<!\p{L})(?:dólares?|USD)(?!\p{L})/iu,MXN:/(?<!\p{L})(?:MXN|pesos? mexicanos?)(?!\p{L})/iu,COP:/(?<!\p{L})(?:COP|pesos? colombianos?)(?!\p{L})/iu,ARS:/(?<!\p{L})(?:ARS|pesos? argentinos?)(?!\p{L})/iu,CLP:/(?<!\p{L})(?:CLP|pesos? chilenos?)(?!\p{L})/iu,PAB:/(?<!\p{L})(?:PAB|balboas?)(?!\p{L})/iu,CRC:/(?<!\p{L})(?:CRC|colones|colón)(?!\p{L})/iu};
  const aliases = Object.fromEntries(countries.map(k=>[k.replace('_','-').toLowerCase(),k]));
  class LocaleAdaptationError extends Error {
    constructor(message){super(message);this.name='LocaleAdaptationError';}
  }
  function normalize(value) {
    const key=String(value || 'es_intl').trim().toLowerCase();
    return Object.hasOwn(labels,key) ? key : aliases[key] || 'es_intl';
  }
  function effective(profile, accountLocale) {
    // A saved account preference, including explicit international, wins.
    return normalize(accountLocale ?? profile?.contentLocale ?? profile?.locale);
  }
  const term=(word,gender='m',plural)=>({word,gender,plural:plural || word+'s'});
  // Only unambiguous source senses are aliases. Pluma (feather), buzo (diver),
  // guineo/plátano (different fruits), coche de bebé, and currencies are not
  // blindly reversed into another country's preferred word.
  const rules = [
    {id:'cost',category:'shopping',sources:[term('coste','m','costes'),term('costo','m','costos')],common:term('costo','m','costos'),preferred:{es_es:term('coste','m','costes')}},
    {id:'workshop-seats',category:'education',sources:[term('plazas disponibles','f','plazas disponibles')],common:term('cupos disponibles','m','cupos disponibles'),preferred:{es_es:term('plazas disponibles','f','plazas disponibles')}},
    {id:'pen',category:'school',sources:[term('bolígrafo'),term('esfero'),term('lapicera','f'),term('lápiz pasta','m','lápices pasta')],common:term('bolígrafo'),preferred:{es_mx:term('pluma','f'),es_co:term('esfero'),es_ar:term('lapicera','f'),es_cl:term('lápiz pasta','m','lápices pasta'),es_cr:term('lapicero')}},
    {id:'marker',category:'school',sources:[term('rotulador','m','rotuladores'),term('marcador','m','marcadores')],common:term('marcador','m','marcadores'),preferred:{es_es:term('rotulador','m','rotuladores')}},
    {id:'jacket',category:'clothing',sources:[term('chaqueta','f'),term('chamarra','f'),term('campera','f')],common:term('chaqueta','f'),preferred:{es_mx:term('chamarra','f'),es_ar:term('campera','f')}},
    {id:'sweatshirt',category:'clothing',sources:[term('sudadera','f'),term('polerón','m','polerones')],common:term('sudadera','f'),preferred:{es_co:term('buzo'),es_ar:term('buzo'),es_cl:term('polerón','m','polerones')}},
    {id:'swimwear',category:'clothing',sources:[term('bañador'),term('traje de baño','m','trajes de baño')],common:term('traje de baño','m','trajes de baño'),preferred:{es_es:term('bañador')}},
    {id:'flipflops',category:'clothing',sources:[term('chancla','f'),term('chancleta','f'),term('ojota','f'),term('chala','f')],common:term('sandalia','f'),preferred:{es_es:term('chancla','f'),es_mx:term('chancla','f'),es_ar:term('ojota','f'),es_cl:term('chala','f'),es_pa:term('chancleta','f'),es_cr:term('chancleta','f')}},
    {id:'toycar',category:'transport',sources:[term('coche de juguete','m','coches de juguete'),term('carro de juguete','m','carros de juguete'),term('auto de juguete','m','autos de juguete')],common:term('auto de juguete','m','autos de juguete'),preferred:{es_es:term('coche de juguete','m','coches de juguete'),es_mx:term('carro de juguete','m','carros de juguete'),es_co:term('carro de juguete','m','carros de juguete'),es_pa:term('carro de juguete','m','carros de juguete'),es_cr:term('carro de juguete','m','carros de juguete')}},
    {id:'publicbus',category:'transport',sources:[term('autobús','m','autobuses')],common:term('autobús','m','autobuses'),preferred:{es_co:term('bus','m','buses'),es_ar:term('colectivo'),es_cl:term('bus','m','buses'),es_pa:term('bus','m','buses'),es_cr:term('bus','m','buses')}},
    {id:'car',category:'transport',sources:[term('automóvil','m','automóviles')],common:term('automóvil','m','automóviles'),preferred:{es_es:term('coche'),es_mx:term('auto'),es_co:term('carro'),es_ar:term('auto'),es_cl:term('auto'),es_pa:term('carro'),es_cr:term('carro')}},
    {id:'potato',category:'food',sources:[term('patata','f'),term('papa','f')],common:term('papa','f'),preferred:{es_es:term('patata','f')}},
    {id:'juice',category:'food',sources:[term('zumo'),term('jugo')],common:term('jugo'),preferred:{es_es:term('zumo')}},
    {id:'peach',category:'food',sources:[term('melocotón','m','melocotones'),term('durazno')],common:term('durazno'),preferred:{es_es:term('melocotón','m','melocotones')}},
    {id:'tap',category:'household',sources:[term('grifo'),term('canilla','f'),term('llave del agua','f','llaves del agua')],common:term('llave del agua','f','llaves del agua'),preferred:{es_es:term('grifo'),es_ar:term('canilla','f')}},
    {id:'fridge',category:'household',sources:[term('frigorífico'),term('refrigerador','m','refrigeradores'),term('nevera','f'),term('heladera','f')],common:term('refrigerador','m','refrigeradores'),preferred:{es_es:term('frigorífico'),es_co:term('nevera','f'),es_ar:term('heladera','f')}},
    {id:'computer',category:'technology',sources:[term('ordenador','m','ordenadores'),term('computador','m','computadores'),term('computadora','f')],common:term('computadora','f'),preferred:{es_es:term('ordenador','m','ordenadores'),es_co:term('computador','m','computadores'),es_cl:term('computador','m','computadores')}},
    {id:'mobilephone',category:'technology',sources:[term('teléfono móvil','m','teléfonos móviles'),term('teléfono celular','m','teléfonos celulares')],common:term('teléfono celular','m','teléfonos celulares'),preferred:{es_es:term('teléfono móvil','m','teléfonos móviles')}},
    {id:'receipt',category:'shopping',sources:[term('ticket de compra','m','tickets de compra')],common:term('recibo de compra','m','recibos de compra'),preferred:{}},
    {id:'basketball',category:'sports',sources:[term('baloncesto','m','baloncesto'),term('básquetbol','m','básquetbol'),term('básquet','m','básquet')],common:term('baloncesto','m','baloncesto'),preferred:{es_mx:term('básquetbol','m','básquetbol'),es_ar:term('básquet','m','básquet'),es_cl:term('básquetbol','m','básquetbol')}},
    {id:'pool',category:'recreation',sources:[term('piscina','f'),term('alberca','f')],common:term('piscina','f'),preferred:{es_mx:term('alberca','f')}},
  ];
  const bananaRule={id:'banana',category:'food',requiresSense:'banana',sources:[term('plátano'),term('banana','f'),term('banano'),term('guineo')],common:term('banana','f'),preferred:{es_es:term('plátano'),es_mx:term('plátano'),es_co:term('banano'),es_cl:term('plátano'),es_pa:term('guineo'),es_cr:term('banano')}};
  const headphonesRule={id:'headphones',category:'technology',requiresSense:'headphones',sources:[term('auricular','m','auriculares')],common:term('auricular','m','auriculares'),preferred:{es_mx:term('audífono'),es_co:term('audífono'),es_cl:term('audífono'),es_pa:term('audífono'),es_cr:term('audífono')}};
  const escape = x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  function casing(value,source) {
    if(source===source.toUpperCase()) return value.toUpperCase();
    return /^\p{Lu}/u.test(source) ? value[0].toUpperCase()+value.slice(1) : value;
  }
  const determinerPairs=[['el','la'],['los','las'],['un','una'],['unos','unas'],['este','esta'],['estos','estas'],['ese','esa'],['esos','esas'],['nuestro','nuestra'],['nuestros','nuestras'],['vuestro','vuestra'],['vuestros','vuestras'],['cuánto','cuánta'],['cuántos','cuántas'],['todo','toda'],['todos','todas']];
  const adjectives='nuevo|nueva|nuevos|nuevas|viejo|vieja|viejos|viejas|pequeño|pequeña|pequeños|pequeñas|abierto|abierta|abiertos|abiertas|cerrado|cerrada|cerrados|cerradas|roto|rota|rotos|rotas|apagado|apagada|apagados|apagadas|encendido|encendida|encendidos|encendidas|caro|cara|caros|caras|barato|barata|baratos|baratas|bonito|bonita|bonitos|bonitas|limpio|limpia|limpios|limpias|sucio|sucia|sucios|sucias|antiguo|antigua|antiguos|antiguas';
  const nounPatterns=new Map();
  function agreement(value,gender) {return value.replace(new RegExp(`\\b(${adjectives})\\b`,'giu'),a=>casing(a.toLowerCase().replace(/[oa](s?)$/,gender==='f'?'a$1':'o$1'),a));}
  function nounRule(text,source,target,plural) {
    const from=plural?source.plural:source.word, to=plural?target.plural:target.word;
    const prefix='(?:de la|a la|el|la|los|las|un|una|unos|unas|este|esta|estos|estas|ese|esa|esos|esas|nuestro|nuestra|nuestros|nuestras|vuestro|vuestra|vuestros|vuestras|cuánto|cuánta|cuántos|cuántas|todo|toda|todos|todas|del|al)';
    if(!nounPatterns.has(from))nounPatterns.set(from,new RegExp(`(^|[^\\p{L}])(?:(${prefix})(\\s+)(?:(${adjectives})(\\s+))?)?(${escape(from)})(?!\\p{L})(?:((?:\\s+(?:ya\\s+)?(?:está|están|estaba|estaban|es|son|era|eran)\\s+|\\s+))(${adjectives})(?!\\p{L}))?`,'giu'));
    const re=nounPatterns.get(from);
    return text.replace(re,(match,boundary,det,space,before,beforeSpace,noun,link,after)=>{
      let article=det || '';
      if(source.gender!==target.gender && article) {
        const lower=article.toLowerCase();
        if(lower==='del')article='de la';
        else if(lower==='al')article='a la';
        else if(lower==='de la')article='del';
        else if(lower==='a la')article='al';
        else {const pair=determinerPairs.find(p=>p.includes(lower));if(pair)article=pair[target.gender==='f'?1:0];}
        article=casing(article,det);
      }
      return boundary+article+(space||'')+(before?agreement(before,target.gender)+(beforeSpace||''):'')+casing(to,noun)+(after?(link||' ')+agreement(after,target.gender):'');
    });
  }
  const verbs={coger:'tomar',coge:'toma',cogen:'toman',coges:'tomas',cogemos:'tomamos',cogió:'tomó',cogieron:'tomaron',cogía:'tomaba',cogido:'tomado',cogiendo:'tomando',cogéis:'toman',coged:'tomen'};
  const plurals={vosotros:'ustedes',vosotras:'ustedes',estáis:'están',tenéis:'tienen',podéis:'pueden',queréis:'quieren',habéis:'han',vais:'van',hacéis:'hacen',sois:'son',vuestro:'su',vuestra:'su',vuestros:'sus',vuestras:'sus'};
  const agreementPatterns=new Map();
  function checkAgreement(value,locale) {
    const key=normalize(locale);
    if(!agreementPatterns.has(key)) {
      const patterns=[...rules,bananaRule].flatMap(rule=>{
        const target=rule.preferred[key]||rule.common;
        const wrong=target.gender==='f' ? ['el|un|este|ese|nuestro|vuestro|cuánto|todo','los|unos|estos|esos|nuestros|vuestros|cuántos|todos'] : ['la|una|esta|esa|nuestra|vuestra|cuánta|toda','las|unas|estas|esas|nuestras|vuestras|cuántas|todas'];
        return [target.word,target.plural].map((word,i)=>({word,pattern:new RegExp(`(?<!\\p{L})(?:${wrong[i]})\\s+(?:(?:${adjectives})\\s+)?${escape(word)}(?!\\p{L})`,'iu')}));
      });
      agreementPatterns.set(key,patterns);
    }
    const lower=value.toLowerCase();
    if(agreementPatterns.get(key).some(({word,pattern})=>lower.includes(word)&&pattern.test(value)))throw new LocaleAdaptationError('La concordancia regional necesita revisión.');
    return value;
  }
  function text(value,locale,senses={}) {
    if(typeof value!=='string') return value;
    const key=normalize(locale);
    let result=value;
    const lower=value.toLowerCase();
    for(const rule of [...rules,...(senses.banana===true?[bananaRule]:[]),...(senses.headphones===true?[headphonesRule]:[])]) {
      const target=rule.preferred[key] || rule.common;
      for(const source of rule.sources) {
        if(source.gender===target.gender && source.word===target.word && source.plural===target.plural)continue;
        if(lower.includes(source.plural))result=nounRule(result,source,target,true);
        if(lower.includes(source.word))result=nounRule(result,source,target,false);
      }
    }
    if(key!=='es_es') {
      for(const [from,to] of Object.entries({...verbs,...plurals})) result=result.replace(new RegExp(`(?<!\\p{L})${escape(from)}(?!\\p{L})`,'giu'),s=>casing(to,s));
      result=result.replace(/(?<!\p{L})os laváis(?!\p{L})/giu,s=>casing('se lavan',s));
      // Do not silently emit an unhandled Spain-only plural/reflexive form.
      if(/(?<!\p{L})(?:os|cogéis|coged)(?!\p{L})|(?<!\p{L})(?!(?:dieciséis|veintiséis)(?!\p{L}))\p{L}+(?:áis|éis)(?!\p{L})/iu.test(result)) throw new LocaleAdaptationError('La frase necesita revisión regional de pronombres y verbos.');
    }
    if(key!=='es_es'&&/taller|inscripci[oó]n|participa|curso|actividad|centro estudia/iu.test(result))result=result.replace(/(?<!\p{L})m[aá]s plazas(?!\p{L})/giu,x=>casing('más cupos',x)).replace(/(?<!\p{L})ampliar plazas(?!\p{L})/giu,x=>casing('ampliar cupos',x));
    return checkAgreement(result,key);
  }
  const scalarFields=['q','prompt','memoryQuestion','why','topic','theme','text','title','scenario','sample','model','a','detail','label','instruction','question','rule','n'];
  const arrayFields=['opts','answers','tokens','answer','modelSequence','rows','visualItems','grid','stimuli','sequence','recallSequence','writingRubric'];
  function html(value,locale,senses) {
    if(!value || !/[<>]/.test(value))return text(value,locale,senses);
    const Parser=root.DOMParser;
    if(!Parser)throw new LocaleAdaptationError('El contenido HTML necesita el adaptador regional del navegador.');
    const doc=new Parser().parseFromString(value,'text/html');
    function visit(node) {
      if(node.nodeType===3)node.textContent=text(node.textContent,locale,senses);
      else if(node.nodeType===1 && !['SCRIPT','STYLE'].includes(node.tagName)) {
        for(const attr of ['alt','title','aria-label','placeholder','label'])if(node.hasAttribute(attr))node.setAttribute(attr,text(node.getAttribute(attr),locale,senses));
        if(node.tagName==='INPUT' && ['text','button','submit','reset'].includes(node.getAttribute('type')||'text') && node.hasAttribute('value'))node.setAttribute('value',text(node.getAttribute('value'),locale,senses));
        [...node.childNodes].forEach(visit);
      }
    }
    [...doc.body.childNodes].forEach(visit);
    const rendered=[];
    function collect(node){if(node.nodeType===3)rendered.push(node.textContent);else if(node.nodeType===1 && !['SCRIPT','STYLE'].includes(node.tagName.toUpperCase()))[...node.childNodes].forEach(collect);}
    [...doc.body.childNodes].forEach(collect);
    checkAgreement(rendered.join(' '),locale);
    return doc.body.innerHTML;
  }
  function localizeItem(item,locale,domain=item?.localization?.domain || item?.domain) {
    if(!item || typeof item!=='object')throw new LocaleAdaptationError('Falta la actividad que se debe adaptar.');
    const key=normalize(locale);
    if(item.localization && item.localization.locale!==key)throw new LocaleAdaptationError('La actividad pertenece a otra variante de español. Solicita una nueva.');
    if(item.localization?.domain && domain && item.localization.domain!==domain)throw new LocaleAdaptationError('El contexto regional del área ha cambiado. Solicita contenido nuevo.');
    // Localize Spanish instructions/explanations in English Lab, while retaining
    // the English specimen, options and scoring keys verbatim.
    const english=domain==='english';
    const spanishWrappers=['q','prompt','why','topic','theme','instruction'];
    const senses={...(item.lexicalSenses || {})};
    if(item.icons?.includes('banana') || item.memoryContent?.some(x=>x?.icon==='banana'))senses.banana=true;
    // A standalone object label or a determiner identifies the device sense.
    // Do not reinterpret anatomical phrases such as «pabellones auriculares».
    const specimens=[...scalarFields.map(f=>item[f]),...arrayFields.map(f=>item[f]),...(item.memoryContent||[]).map(x=>typeof x==='string'?x:x?.detail),...(item.stimulus||[]).map(b=>b.text||b.items||b.rows)].flat(Infinity);
    if(item.icons?.includes('headphones')||specimens.some(v=>typeof v==='string'&&(/^(?:auricular|auriculares)$/iu.test(v.trim())||/(?<!\p{L})(?:(?:los|unos|mis|tus|sus)\s+auriculares|(?:el|un|mi|tu|su)\s+auricular)(?!\p{L})/iu.test(v))))senses.headphones=true;
    const adapt=v=>text(v,key,senses);
    const map=v=>Array.isArray(v)?v.map(map):adapt(v);
    const result={...item};
    if(senses.banana===true||senses.headphones===true)result.lexicalSenses=senses;
    for(const field of scalarFields)if(item[field]!==undefined && (!english||spanishWrappers.includes(field)))result[field]=adapt(item[field]);
    for(const field of arrayFields)if(item[field]!==undefined && !english)result[field]=map(item[field]);
    if(Array.isArray(item.memoryContent) && !english)result.memoryContent=item.memoryContent.map(x=>typeof x==='string'?adapt(x):{...x,detail:adapt(x.detail)});
    if(Array.isArray(item.stimulus) && !english)result.stimulus=item.stimulus.map(b=>({...b,...(b.label!==undefined?{label:adapt(b.label)}:{}),...(b.type==='text'?{text:adapt(b.text)}:b.type==='list'?{items:map(b.items)}:b.type==='table'?{rows:map(b.rows)}:{})}));
    if(item.recallEvidence?.targets&&!english)result.recallEvidence={...item.recallEvidence,targets:map(item.recallEvidence.targets)};
    if(item.visual!==undefined && !english)result.visual=html(item.visual,key,senses);
    if(Array.isArray(item.rounds) && !english)result.rounds=item.rounds.map(x=>localizeItem(x,key,domain));
    const visible=x=>JSON.stringify(Object.fromEntries([...scalarFields,...arrayFields,'stimulus','memoryContent','visual'].filter(f=>x[f]!==undefined).map(f=>[f,x[f]])));
    const originalText=visible(item), adaptedText=visible(result);
    const moneyContext=/(?:cuesta|precio|paga|compra|moneda|ahorra|cambio|presupuesto|\d+\s*(?:€|euros?|dólares?|balboas?|colones|colón|EUR|USD|MXN|COP|ARS|CLP|PAB|CRC))/iu.test(originalText);
    if(key!=='es_intl' && moneyContext && item.currencyContext!=='foreign' && Object.entries(currencyPatterns).some(([code,pattern])=>!currencies[key].includes(code)&&pattern.test(originalText)))throw new LocaleAdaptationError('La moneda necesita una actividad regional revisada o un contexto extranjero explícito.');
    if(item.interactionTask?.kind!=='room'&&originalText!==adaptedText && /letras|sílabas|rima|conjug|sinónimo|antónimo|tradu(?:ce|cir|cción)|palabra[^?]*(?:empieza|termina)/iu.test(item.q || item.prompt || ''))throw new LocaleAdaptationError('La actividad sobre la forma de las palabras necesita una versión regional revisada.');
    const genderChange=(senses.banana===true?[...rules,bananaRule]:rules).some(rule=>{
      const target=rule.preferred[key]||rule.common;
      return rule.sources.some(source=>source.gender!==target.gender && new RegExp(`(?<!\\p{L})(?:${escape(source.word)}|${escape(source.plural)})(?!\\p{L})`,'iu').test(originalText));
    });
    if(genderChange && /(?:usar|guardar|encender|apagar|comprar|buscar|cerrar|abrir)(?:lo|la|los|las)\b/iu.test(originalText))throw new LocaleAdaptationError('La referencia pronominal necesita una versión regional revisada.');
    for(const field of ['opts','tokens','answers','answer']) {
      if(Array.isArray(item[field]) && Array.isArray(result[field]) && new Set(item[field]).size!==new Set(result[field]).size)throw new LocaleAdaptationError('La adaptación regional hace indistinguibles dos respuestas.');
    }
    result.localization={locale:key,revision:1,domain};
    return result;
  }
  function validateOptions(item){
    if(!Array.isArray(item?.opts))return;
    const spelling=item.languageFocus==='spelling'||/ortograf|tildes|puntuación/iu.test([item.topic,item.q].join(' '));
    const punctuationIntent=item.optionContrast==='punctuation'||/puntuación|signos|sílabas/iu.test(item.q||'')||item.languageEvidence?.op==='syllables';
    const key=value=>{
      let word=String(value).normalize('NFKC').trim().replace(/\s+/g,' ');
      if(item.optionContrast!=='case'&&!/mayúscula/iu.test(item.q||''))word=word.toLocaleLowerCase('es');
      if(spelling&&!punctuationIntent)word=word.replace(/[\p{P}\p{S}]/gu,'').replace(/\s+/g,' ').trim();
      return word;
    };
    if(new Set(item.opts.map(key)).size!==item.opts.length)throw new LocaleAdaptationError('La actividad contiene opciones duplicadas o equivalentes.');
    if(item.optionMeanings){
      if(!Array.isArray(item.optionMeanings)||item.optionMeanings.length!==item.opts.length||new Set(item.optionMeanings.map(key)).size!==item.opts.length)throw new LocaleAdaptationError('La actividad tiene respuestas semánticamente equivalentes.');
    }
    if(item.answers&&item.answers.length>1&&item.responseType!=='multiple')throw new LocaleAdaptationError('La actividad declara más de una respuesta válida.');
  }
  function localizeModel(model,locale,domain,context={}) {
    if(domain==='english')return {...model,question:text(model.question,locale)};
    const item=localizeItem({q:model.question,stimulus:model.stimulus,opts:model.options,tokens:model.tokens,currencyContext:context.currencyContext,lexicalSenses:context.lexicalSenses},locale,domain);
    return {...model,question:item.q,stimulus:item.stimulus,options:item.opts,tokens:item.tokens};
  }
  const api={validateOptions,labels,currencies,normalize,effective,rules,senseRules:[bananaRule,headphonesRule],text,localizeItem,localizeModel};
  root.LocaleContent=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

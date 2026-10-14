(function(root){
  'use strict';
  function apply(families,{choice,order,text}){
    const focus=(item,languageFocus)=>({...item,languageFocus});
    const easy=[['sol','Brilla en el cielo durante el día.'],['luna','La vemos en el cielo por la noche.'],['mesa','Tiene patas. Ponemos el libro encima.'],['sopa','La comemos con una cuchara.'],['pato','Es un ave que nada.'],['gato','Es un animal que maúlla.'],['mano','Tiene cinco dedos.'],['casa','Es un lugar donde vivimos.'],['nube','Está en el cielo y puede traer lluvia.'],['lupa','Sirve para ver las cosas más grandes.'],['mapa','Nos muestra dónde están los lugares.'],['pelo','Crece en nuestra cabeza.']];
    const pairs=[['queso','Lo comemos. Se hace con leche.','qu'],['perro','Es un animal que ladra.','rr'],['llave','Sirve para abrir una puerta.','ll'],['torre','Es una construcción muy alta.','rr'],['leche','La vaca nos da esta bebida.','ch'],['noche','Es cuando vemos las estrellas.','ch']];
    const syllables=[
      [['mano','ma-no'],['casa','ca-sa'],['mesa','me-sa'],['luna','lu-na'],['pato','pa-to'],['sopa','so-pa']],
      [['pelota','pe-lo-ta'],['tomate','to-ma-te'],['paloma','pa-lo-ma'],['camisa','ca-mi-sa'],['maleta','ma-le-ta'],['cometa','co-me-ta']],
      [['mariposa','ma-ri-po-sa'],['caramelo','ca-ra-me-lo'],['papelera','pa-pe-le-ra'],['limonada','li-mo-na-da'],['elefante','e-le-fan-te'],['tortuga','tor-tu-ga']],
    ];
    families.language.push(
      ['vocabulary','school',(o,n,v,l)=>{
        const [word,cue]=easy[v%easy.length],index=l===1?0:l===2?1:word.length-1,letter=word[index],pattern=word.slice(0,index)+'_'+word.slice(index+1);
        return focus(choice('¿Qué letra falta?',[text(cue),text(pattern)],letter,['a','e','i','o','u','m','s','p'].filter(x=>x!==letter),{languageEvidence:{op:'complete',block:1,word}}),'spelling');
      }],
      ['vocabulary','animals',(o,n,v,l)=>{
        const [word,cue,pair]=pairs[v%pairs.length],pattern=word.replace(pair,'__');
        return focus(choice('Completa la palabra. ¿Qué letras faltan?',[text(cue),text(pattern)],pair,['qu','rr','ll','ch'].filter(x=>x!==pair),{languageEvidence:{op:'complete',block:1,word}}),'spelling');
      }],
      ['vocabulary','school',(o,n,v,l)=>{
        const [word,answer]=syllables[l-1][v%6],wrong=[word.split('').join('-'),word[0]+'-'+word.slice(1)];
        return focus(choice('Elige cómo se separa la palabra en sílabas.',[text(word)],answer,wrong,{languageEvidence:{op:'syllables',block:0,word,segments:answer.split('-')}}),'spelling');
      }],
      ['sentence','family',(o,n,v,l)=>{
        const nouns=[['libro','El'],['pelota','La'],['gato','El'],['mesa','La'],['pato','El'],['casa','La'],['lápiz','El'],['luna','La']];
        const [noun,answer]=nouns[v%nouns.length];
        return focus(choice('Completa con El o La.',[text(`___ ${noun}`)],answer,[answer==='El'?'La':'El']),'grammar');
      }],
      ['sentence','school',(o,n,v,l)=>{
        const cases=l===1?[['La pelota es ___ .','redonda',['redondo']],['El libro está ___ .','abierto',['abierta']],['La mesa está ___ .','limpia',['limpio']],['El vaso está ___ .','vacío',['vacía']]]:
          l===2?[['Las pelotas son ___ .','redondas',['redonda','redondos']],['Los libros están ___ .','abiertos',['abierto','abiertas']],['Las mesas están ___ .','limpias',['limpia','limpios']],['Los vasos están ___ .','vacíos',['vacío','vacías']]]:
          [['Las dos pelotas están ___ .','guardadas',['guardada','guardados']],['Los tres libros están ___ .','cerrados',['cerrado','cerradas']],['Las dos manos están ___ .','limpias',['limpia','limpios']],['Los dos gatos están ___ .','dormidos',['dormido','dormidas']]];
        const [sentence,answer,wrong]=cases[v%cases.length];return focus(choice('Elige la palabra que completa la frase.',[text(sentence.replace('___ .','___.'))],answer,wrong),'grammar');
      }],
      ['sentence','family',(o,n,v,l)=>{
        const sets=[['Ana','salta','en el patio'],['Leo','lee','un cuento'],['Mar','riega','la planta'],['Pau','guarda','el libro'],['Nora','dibuja','una casa'],['Dani','come','una manzana']];
        const tokens=sets[v%sets.length].slice(0,l===1?2:3);
        return focus(order('Forma la frase. Primero va el nombre.',tokens,'Usa todas las palabras una vez.'),'writing');
      }],
    );
  }
  const api={apply};root.EarlyLanguage=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

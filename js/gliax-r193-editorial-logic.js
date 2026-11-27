(function (root) {
  'use strict';
  const {fingerprint,shuffled,outcome}=typeof module!=='undefined'?require('./gliax-r192'):root.GliaxR192;
  const records=typeof module!=='undefined'?require('./gliax-r193-editorial-logic-data'):root.GliaxR193EditorialLogicData;
  const byId=new Map(records.map(record=>[record.id,record]));
  const itemList=(items,mask)=>items.filter((_,i)=>mask&(1<<i)).join(' + ');

  function allows([kind,indexA,indexB],mask){
    const a=(mask&(1<<indexA))!==0,b=(mask&(1<<indexB))!==0;
    switch(kind){
      case 'keep': return a;
      case 'drop': return !a;
      case 'if': return !a||b;
      case 'exclude': return !(a&&b);
      case 'either': return a||b;
      case 'exactly': return a!==b;
      case 'link': return a===b;
      default: return false;
    }
  }

  function explain([kind,a,b],items){
    const one=items[a],two=items[b];
    switch(kind){
      case 'keep':return 'Incluye '+one+'.';
      case 'drop':return 'Deja fuera '+one+'.';
      case 'if':return 'Si eliges '+one+', elige también '+two+'.';
      case 'exclude':return one+' y '+two+' no pueden ir juntos.';
      case 'either':return 'Incluye al menos uno: '+one+' o '+two+'.';
      case 'exactly':return 'Incluye solo uno: '+one+' o '+two+'.';
      case 'link':return one+' y '+two+' se eligen juntos o se dejan fuera los dos.';
      default:throw new RangeError('Unknown editorial rule');
    }
  }

  function build(record,seed){
    const {id,family,ageBand,level,context,items,rules,structure,options,previous}=record;
    const contradiction=family==='EC';
    const change=family==='goal-change';
    const kindNames=[...new Set(rules.map(([kind])=>kind))].sort();
    const mechanism=(contradiction?'compaginar-reglas':change?'reemplazar-un-requisito':'satisfacer-limites')+'-'+kindNames.join('-');
    const prompt=contradiction?'¿Hay alguna selección que cumpla todas las condiciones a la vez?':
      change?'¿Qué selección cumple el encargo nuevo?':'¿Qué selección cumple todas las condiciones?';
    const rows=rules.map((rule,i)=>({id:'rule-'+i,text:(change&&i===rules.length-1?'Condición nueva. ':'')+explain(rule,items)}));
    const choices=contradiction?[
      {id:'possible',label:'Sí, hay una selección que cumple todo.'},
      {id:'impossible',label:'No, las condiciones no pueden cumplirse a la vez.'},
      {id:'unknown',label:'No se puede decidir con estas condiciones.'}
    ]:options.map(mask=>({id:String(mask),label:itemList(items,mask)}));
    const presentation={context,prompt,items,rows,options:shuffled(choices,seed,id+':choices'),
      previous:previous===null?null:itemList(items,previous),
      evidenceRequired:contradiction&&level>1};
    return {id,family,ageBand,level,mechanic:mechanism,construct:mechanism,mechanismContext:context,
      editorial:true,logicEditorial:true,presentation,contentVersion:'r19.3-editorial-3',gradingVersion:'r19.3-editorial-3',
      cognitiveFingerprint:fingerprint([family,items.length,structure]),surfaceFingerprint:fingerprint(presentation),
      answerModel:{mode:contradiction?'source_relation':'constraint_solver',rules,options}};
  }

  function grade(item,response){
    const {items,rows,evidenceRequired}=item.presentation;
    const {rules,options}=item.answerModel;
    if(item.family==='EC'){
      const selections=Array.from({length:(1<<items.length)-1},(_,i)=>i+1);
      const allowed=selections.find(mask=>rules.every(rule=>allows(rule,mask)));
      const expected=allowed?'possible':'impossible';
      const evidence=response?.evidence;
      const complete=Array.isArray(evidence)&&evidence.length===rows.length&&rows.every(row=>evidence.includes(row.id));
      const same=response?.choice===expected;
      const result=outcome(same?(evidenceRequired&&!complete?'partial':'correct'):'incorrect');
      const example=selections.find(mask=>!allows(rules[0],mask)&&rules.slice(1).every(rule=>allows(rule,mask)));
      const detail=allowed?'Una selección válida es '+itemList(items,allowed)+'.':
        'No hay una selección válida. Por ejemplo, '+itemList(items,example)+' incumple esta condición: '+explain(rules[0],items);
      return {...result,feedback:result.status==='partial'?'La conclusión es correcta. Marca las condiciones que has comparado.':detail};
    }
    const value=Number(response?.choice);
    if(!options.includes(value))return outcome('incorrect');
    const failed=rules.find(rule=>!allows(rule,value));
    const result=outcome(failed?'incorrect':'correct');
    return {...result,feedback:failed?'La selección incumple esta condición: '+explain(failed,items):
      'Tu selección cumple todas las condiciones, incluida la última: '+explain(rules.at(-1),items)};
  }

  const api={ids:()=>[...byId.keys()],get:(id,seed)=>byId.has(id)?build(byId.get(id),seed):null,grade,
    pool:({family,ageBand,level,seed})=>records.filter(record=>record.family===family&&record.ageBand===ageBand&&record.level===level)
      .map(record=>build(record,seed))};
  root.GliaxR193EditorialLogic=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const math=require('../js/math-sequencing');
const curriculum=require('../js/curriculum');
const activity=require('../js/activity-model');
const locales=require('../js/locale-content');
const report=require('../js/progress-report');
const profileDomains=curriculum.mathProblemDomains;

function solve(item,strategy){
  const p=item.problem,state=math.start(p);
  const route=p.paths.find(x=>x.id===strategy)||p.paths[0];
  for(const op of route.steps){
    const {value:left}=state.available[op.left],{value:right}=state.available[op.right];
    const verdict=math.check(state,op.id,op.op,op.left,op.right);
    assert.equal(verdict.kind,'valid',op.label);
    const [a,b]=left,[c,d]=right;
    const numeric={add:()=>a/b+c/d,subtract:()=>a/b-c/d,multiply:()=>a/b*c/d,divide:()=>a/b/(c/d)};
    assert.ok(Math.abs(verdict.expected[0]/verdict.expected[1]-numeric[op.op]())<1e-8,op.label);
    math.advance(state,verdict.node,verdict.expected);
  }
  assert.ok(p.goals.every(id=>id in state.available));
  assert.equal(state.paths[0].id,route.id);
  return math.solution(p,state.available);
}
const example=(age,family,level=2,variant=0)=>math.pool(age,profileDomains[age],level).find(
  item=>item.problem.family===family&&item.contentKey.endsWith(':'+variant));

test('306 deterministically generated problems, 34 distinct authored structures and three levels at every age',()=>{
  let total=0;
  for(const [age,domain] of Object.entries(profileDomains)){
    const levels=[];
    for(const level of [1,2,3]){
      const bank=curriculum.mathProblemPool(age,domain,level,2);
      assert.deepEqual(bank,math.pool(age,domain,level));
      assert.equal(new Set(bank.map(i=>i.contentKey)).size,bank.length);
      assert.equal(new Set(bank.map(i=>JSON.stringify([i.stimulus,i.problem.data]))).size,bank.length);
      const familySet=new Set(bank.map(i=>i.problem.family));
      assert.equal(familySet.size,{junior:6,primary:8,middle:10,teen:10}[age]);
      for(const family of familySet){
        const variants=bank.filter(i=>i.problem.family===family);
        assert.equal(variants.length,3);
        assert.ok(variants.every(i=>i.problem.paths.every(p=>p.steps.length>=2)));
      }
      // The progression changes decisions and support in addition to the data values.
      assert.ok(bank.every(i=>i.problem.complexity.guidance===['visible','optional','autonomous'][level-1]));
      assert.ok(bank.every(i=>Object.hasOwn(i.problem.data,'distractor')===(level===3)));
      const fingerprint=({problem:p})=>{
        const facts=Object.keys(p.data);
        return JSON.stringify([p.model.type,p.interpretation?.type,p.paths.map(route=>{
          const outputs=route.steps.map(op=>op.id);
          const source=id=>facts.includes(id)?['given',facts.indexOf(id)]:['derived',outputs.indexOf(id)];
          return route.steps.map(op=>[op.op,source(op.left),source(op.right),op.unit]);
        })]);
      };
      for(const family of familySet)assert.equal(new Set(bank.filter(i=>i.problem.family===family).map(fingerprint)).size,1);
      assert.equal(new Set(bank.map(fingerprint)).size,familySet.size);
      for(const item of bank){
        const answers=item.problem.paths.map(path=>solve(item,path.id));
        for(const alternate of answers)assert.deepEqual(alternate,answers[0],item.contentKey);
        for(const locale of Object.keys(locales.labels)){
          const adapted=locales.localizeItem(item,locale,domain);
          assert.equal(activity.forDelivery(adapted,{age_band:age},domain),adapted);
        }
        assert.throws(()=>curriculum.validateMathProblem({...item,stimulus:[{type:'text',text:'Enunciado alterado'}]}),/Contrato/);
      }
      total+=bank.length;levels.push(familySet);
    }
    assert.deepEqual(levels[1],levels[0]);assert.deepEqual(levels[2],levels[0]);
  }
  assert.equal(total,306);
  assert.deepEqual(math.pool('early','division',1),[]);
  assert.equal(curriculum.mathProblemPool('primary','division',2).length,12);
  assert.equal(fs.readFileSync(require.resolve('../js/math-sequencing'),'utf8'),
    fs.readFileSync(require.resolve('../supabase/functions/request-learning-content/math-sequencing'),'utf8'));
});

test('alternative routes, commutativity, independent step order, exact fractions and contextual endpoints',()=>{
  const fares=example('teen','Cruce de tarifas lineales');
  for(const route of fares.problem.paths)assert.deepEqual(solve(fares,route.id).map(f=>f.value),[[6,1],[5,1]]);
  const spend=example('middle','Presupuesto con partidas',1);
  assert.deepEqual(solve(spend).map(f=>f.value),[[98,1]]);
  const bicycle=example('middle','Descuento e impuesto sucesivos');
  for(const route of bicycle.problem.paths)assert.deepEqual(solve(bicycle,route.id).map(f=>f.value),[[6171,25]]);
  const travel=example('teen','Viaje con reserva obligatoria',1);
  assert.deepEqual(solve(travel).map(f=>f.value),[[6,1]]);
  assert.equal(math.format(math.parse('6,15')),'6,15');
  assert.deepEqual(math.parse('−18/12'),[-3,2]);
  assert.equal(math.parse('1/0'),null);
  const item=example('primary','Dos subtotales independientes',3),state=math.start(item.problem);
  assert.equal(math.check(state,'goal','add','red','newBlue').kind,'order');
  assert.equal(math.check(state,'red','add','boxes','each').kind,'operation');
  assert.equal(math.check(state,'newBlue','multiply','boxes','each').kind,'unverifiable');
  assert.equal(math.checkExpression(state,'red','(4 × 3 + 9) - 9').kind,'unverifiable');
  assert.equal(math.checkExpression(state,'red','4+3').kind,'unverifiable');
  const blue=math.check(state,'newBlue','add','add','blue');
  assert.equal(blue.kind,'valid');
  math.advance(state,blue.node,blue.expected);
  const red=math.checkExpression(state,'red','3 × 4');
  assert.equal(red.kind,'valid');
  math.advance(state,red.node,red.expected);
  assert.equal(math.check(state,'goal','add','newBlue','red').kind,'valid');
});

test('the validator rejects broken dependencies, invalid dimensions, irrelevant steps, wrong diagrams and invalid alternatives',()=>{
  const sample=example('junior','Parte y todo');
  for(const [change,label] of [
    [p=>p.paths[0].steps[0].left='not_available',/Dependencia/],
    [p=>p.paths[0].steps[0].unit='horas',/Unidades/],
    [p=>p.paths[0].steps.unshift({id:'unused',left:'a',right:'b',op:'add',unit:'libros',label:'Irrelevante'}),/irrelevantes/],
    [p=>p.model.refs=['a','b','total'],/todo/],
    [p=>p.paths[1].steps[0].op='add',/no convergen/],
  ]){
    const broken=structuredClone(sample.problem);
    change(broken);
    assert.throws(()=>math.validateGraph(broken),label);
  }
});

test('old and new versions remain readable with separate practices and conventional accuracy unchanged',()=>{
  const metric={schema:'gliax.exercise-metrics.v1',modality:'math_problem_steps'};
  const history=[
    {subject:'division',correct:true,level:2},
    {subject:'division',correct:null,level:2,detail:JSON.stringify({...metric,definition_version:1,steps:{final_answer:true}})},
    {subject:'teenMath',correct:null,level:3,detail:JSON.stringify({...metric,definition_version:2,
      operations:[{position:1,operation:'divide',selection_attempts:2,calculation_attempts:1,guided:true}],
      family:'Viaje con reserva obligatoria',strategy:'primero_reservar',unassisted_selections:0,unassisted_calculations:1,
      interpretation_correct:true,support_used:true})},
  ];
  const original=structuredClone(history), view=report.build(history);
  const [legacy,updated]=report.tables(view,'P-PRUEBA','13–18').Detalle.slice(-2);
  assert.match(legacy[12],/Respuesta final correcto/);
  assert.match(updated[12],/división.*2 intentos de elección.*guiado/);
  assert.equal(legacy[10],1);assert.equal(updated[10],2);
  assert.equal(view.groups.scored.precision,100);assert.equal(view.groups.practice.count,2);
  assert.deepEqual(history,original);
});

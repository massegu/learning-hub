"""R19.1 via the browser and local Edge, with synthetic profiles only."""

import importlib.util
import json
import os
from pathlib import Path
import threading
from playwright.sync_api import expect, sync_playwright

from browser_support import ROOT, area, workspace
from browser_math_helpers import check, enter_operation, interpret, justify_operation, math_solution, select_data, select_goal, solve_math

spec = importlib.util.spec_from_file_location('preview', ROOT / 'tools/review-preview.py')
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)
evidence = Path(os.environ.get('GLIAX_R19_1_EVIDENCE', '/tmp/gliax-r19-1-math'))
evidence.mkdir(parents=True, exist_ok=True)


def save_capture(page, name):
    page.locator('#r191Fixture').screenshot(path=evidence / (name+'.png'))
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')


def set_level(page, value):
    options = page.locator('#activityOptions')
    if not options.evaluate('e=>e.open'):
        options.locator('summary').click()
    page.locator('#exerciseLevelSelect').select_option(str(value))


def fixture(page, age, level, family, variant=0):
    """Use authored example with the same browser renderer to probe specific steps."""
    return page.evaluate('''([age,level,family,variant])=>{
      const old=document.querySelector('#r191Fixture');
      old?.remove();
      const card=document.createElement('div');
      card.className='exercise-card fixture-math';
      card.id='r191Fixture';
      const visual=document.createElement('div'), area=document.createElement('div');
      const item=MathSequencing.generate(age,level,family,variant);
      visual.append(Object.assign(document.createElement('p'),{textContent:item.stimulus[0].text}));
      card.append(visual,area);
      document.querySelector('#exercise .exercise-card').before(card);
      document.querySelector('#exercise .exercise-card:not(.fixture-math)').hidden=true;
      window.r191Finish=null;
      window.r191Stop=MathProblemRenderer.mount(item,{visual,area,onFinish:(ok,why,metrics)=>r191Finish={ok,why,metrics}});
      return item;
    }''', [age, level, family, variant])


def open_math(page, age, domain, level):
    workspace(page).locator('#profileSelect').select_option(age)
    area(page,domain).click()
    set_level(page,level)
    page.locator('#mathProblemMode').press('Enter')
    page.wait_for_function('''([age,level])=>window.lastProblem?.ageRoute===age&&lastProblem.level===level&&
      document.querySelector('.math-sequence')?.innerText.includes('Comprensión')''', arg=[age,level])
    return page.evaluate('lastProblem')


def track_delivery(page):
    page.evaluate('''()=>{
      const delivered=ActivityModel.forDelivery;
      ActivityModel.forDelivery=(item,...args)=>{
        const result=delivered(item,...args);
        if(result.mathVersion===2)window.lastProblem=result;
        return result;
      };
    }''')


def main():
    server=review.ReviewServer(('127.0.0.1',0),review.prepare())
    url=f'http://127.0.0.1:{server.server_port}'
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1440,'height':1000})
            page.route('**/*',lambda route:route.continue_() if route.request.url.startswith(url+'/') else route.abort())
            page.goto(url,wait_until='networkidle')
            errors=[]
            page.on('pageerror',lambda err:errors.append(str(err)))
            track_delivery(page)
            for age,domain,level in [('junior','division',1),('primary','division',2),('middle','middleMath',3),('teen','teenMath',2)]:
                item=open_math(page,age,domain,level)
                assert item['mathVersion']==2
                route=solve_math(page,item)
                page.wait_for_function('''([age,id])=>__profiles.find(p=>p.id===age).progress.history?.some(r=>r.itemId===id)''',
                  arg=[age,item['id']])
                measure=page.evaluate('''([age,id])=>{const r=__profiles.find(p=>p.id===age).progress.history.find(x=>x.itemId===id);
                  return {correct:r.correct,metrics:JSON.parse(r.detail)};}''', [age,item['id']])
                m=measure['metrics']
                assert measure['correct'] is None and m['definition_version']==2 and m['strategy']==route
                assert m['unassisted_calculations']==m['operation_count'] and not m['support_used']
                assert m['interpretation_correct']
            item=open_math(page,'teen','teenMath',3)
            before=page.evaluate("__profiles.find(p=>p.id==='teen').progress.history.length")
            shell=page.locator('.math-sequence')
            select_data(shell,item['problem'])
            area(page,'executive').click()
            assert page.evaluate("__profiles.find(p=>p.id==='teen').progress.history.length")==before
            page.reload(wait_until='networkidle')
            track_delivery(page)
            workspace(page).locator('#profileSelect').select_option('teen')
            assert page.evaluate("""()=>__profiles.find(p=>p.id==='teen').progress.history
              .some(r=>JSON.parse(r.detail).definition_version===2)""")
            open_math(page,'teen','teenMath',3)

            # A wrong choice and a wrong calculation have distinct feedback and remain retryable.
            budget=fixture(page,'middle',1,7)
            shell=page.locator('#r191Fixture .math-sequence')
            page.set_viewport_size({'width':1440,'height':1000})
            shell.get_by_role('button',name='Mostrar representación').press('Enter')
            save_capture(page,'presupuesto-modelo-escritorio')
            path=budget['problem']['paths'][0]
            answers=math_solution(page,budget,path)
            select_data(shell,budget['problem'])
            select_goal(shell,'cost')
            expect(shell.get_by_role('status')).to_contain_text('todavía necesita')
            select_goal(shell,'tickets')
            enter_operation(shell,1,path['steps'][0],'add')
            expect(shell.get_by_role('status')).to_contain_text('no obtiene')
            assert '=' not in shell.get_by_role('status').inner_text()
            enter_operation(shell,1,path['steps'][0])
            shell.get_by_label('Resultado de la operación').fill('999')
            check(shell)
            expect(shell.get_by_role('status')).to_contain_text('todavía no coincide')
            for name in ['Pedir ayuda','Pedir ayuda','Pedir ayuda']:
                shell.get_by_role('button',name=name,exact=True).press('Enter')
                assert '= 140' not in shell.get_by_role('status').inner_text()
            expect(page.locator('#r191Fixture .math-model')).to_be_visible()
            page.set_viewport_size({'width':390,'height':900})
            save_capture(page,'calculo-feedback-movil')
            shell.get_by_role('button',name='Ver explicación guiada').press('Enter')
            expect(shell.get_by_role('status')).to_contain_text('4 × 35 = 140')
            shell.get_by_role('button',name='Continuar con esta explicación').press('Enter')
            for step,answer in zip(path['steps'][1:],answers['expected'][1:],strict=True):
                select_goal(shell,step['id'])
                enter_operation(shell,1,step)
                shell.get_by_label('Resultado de la operación').fill(answer)
                check(shell)
            interpret(shell,answers['final'])
            metrics=page.evaluate('r191Finish.metrics')
            first=metrics['operations'][0]
            assert first['selection_attempts']==2 and first['calculation_attempts']==1 and first['order_errors']==1
            assert first['guided'] and not first['calculation_correct']
            assert [h['level'] for h in first['hints'] if h['phase']=='calculation']==[1,2,3,4]
            assert metrics['unassisted_calculations']==2 and metrics['support_used']

            # An unverified free expression does not add attempts. The same round accepts another authored route.
            travel=fixture(page,'teen',3,7)
            shell=page.locator('#r191Fixture .math-sequence')
            route=travel['problem']['paths'][1]
            answers=math_solution(page,travel,route)
            select_data(shell,travel['problem'])
            select_goal(shell,'afterTravel')
            shell.get_by_text('Proponer otra operación',exact=True).press('Enter')
            shell.get_by_label('Operación alternativa').fill('(600 - 110) - 130')
            shell.get_by_role('button',name='Revisar propuesta').press('Enter')
            expect(shell.get_by_role('status')).to_contain_text('No puedo verificar automáticamente')
            shell.get_by_label('Operación alternativa').fill('600 - 110')
            shell.get_by_role('button',name='Revisar propuesta').press('Enter')
            shell.locator('input[name="justification"][value="add"]').check()
            check(shell)
            expect(shell.get_by_role('status')).to_contain_text('qué relación')
            justify_operation(shell,route['steps'][0]['op'])
            shell.get_by_label('Resultado de la operación').fill(answers['expected'][0])
            check(shell)
            for step,answer in zip(route['steps'][1:],answers['expected'][1:],strict=True):
                select_goal(shell,step['id']);enter_operation(shell,3,step)
                shell.get_by_label('Resultado de la operación').fill(answer);check(shell)
            page.set_viewport_size({'width':834,'height':950})
            save_capture(page,'interpretacion-tableta')
            shell.locator('fieldset input[type=text]').fill('6')
            shell.get_by_label('¿Qué representa el resultado?').select_option('1')
            check(shell)
            expect(shell.get_by_role('status')).to_contain_text('cómo se interpreta')
            interpret(shell,answers['final'])
            m=page.evaluate('r191Finish.metrics')
            assert m['strategy']=='restas_sucesivas' and m['operations'][0]['selection_attempts']==1
            assert m['operations'][0]['justification_attempts']==2 and m['operations'][0]['justification_correct']
            assert m['interpretation']['attempts']==2 and m['interpretation_correct']
            assert not errors, errors
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print('PASS: four ages, three levels, local Edge, history and interruption, alternative strategy, unknown expression, guided mistakes and rounded interpretation; keyboard and three widths.')


if __name__=='__main__':
    main()

"""Playwright helpers for the sequenced mathematics activity."""

from playwright.sync_api import expect


def check(shell):
    shell.get_by_role('button', name='Comprobar paso', exact=True).press('Enter')


def select_data(shell, problem):
    for key in problem['data']:
        if key != 'distractor' and key not in problem['optional']:
            shell.locator(f'input[type="checkbox"][value="{key}"]').check()
    check(shell)


def select_goal(shell, code):
    shell.locator(f'input[name="goal"][value="{code}"]').check()
    check(shell)


def enter_operation(shell, level, step, operation=None):
    operation = operation or step['op']
    if level == 1:
        shell.locator(f'input[name="operation"][value="{operation}"]').check()
    else:
        shell.get_by_label('Primera cantidad', exact=True).select_option(step['left'])
        shell.get_by_label('Operación', exact=True).select_option(operation)
        shell.get_by_label('Segunda cantidad', exact=True).select_option(step['right'])
    check(shell)
    if operation == step['op'] and level == 3:
        justify_operation(shell, operation)


def justify_operation(shell, operation):
    shell.locator(f'input[name="justification"][value="{operation}"]').check()
    check(shell)


def math_solution(page, item, route):
    return page.evaluate('''([item,route])=>{
      const m=MathSequencing,p=item.problem,s=m.start(p);
      const expected=[];
      for(const n of p.paths.find(r=>r.id===route).steps){
        const answer=m.check(s,n.id,n.op,n.left,n.right);
        expected.push(m.format(answer.expected));
        m.advance(s,answer.node,answer.expected);
      }
      return {expected, final:m.solution(p,s.available).map(f=>m.format(f.value))};
    }''', [item, route['id']])


def interpret(shell, answers):
    for field, value in zip(shell.locator('fieldset input[type=text]').all(), answers, strict=True):
        field.fill(value)
    why = shell.get_by_label('¿Qué representa el resultado?', exact=True)
    if why.count():
        why.select_option('0')
    check(shell)
    expect(shell.get_by_role('heading', name='Resolución completada')).to_be_visible()


def solve_math(page, item, strategy=None):
    shell = page.locator('.math-sequence')
    expect(shell).to_be_visible()
    problem = item['problem']
    route = next((route for route in problem['paths'] if route['id'] == strategy), problem['paths'][0])
    answers = math_solution(page, item, route)
    select_data(shell, problem)
    for step, answer in zip(route['steps'], answers['expected'], strict=True):
        select_goal(shell, step['id'])
        enter_operation(shell, item['level'], step)
        shell.get_by_label('Resultado de la operación').fill(answer)
        check(shell)
    interpret(shell, answers['final'])
    return route['id']

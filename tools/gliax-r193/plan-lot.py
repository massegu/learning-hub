"""Reproduce the structured plan lots. Keep only distinct solution spaces."""
from itertools import combinations, permutations, product
from pathlib import Path
import json

contexts = {
    'early': [
        ('Preparar el rincón de dibujo', ['Poner el papel','Traer los lápices','Traer un borrador','Poner el cartel']),
        ('Montar el juego de mesa', ['Poner el tablero','Traer las fichas','Poner un cartel','Traer el reloj']),
        ('Dejar lista la merienda', ['Poner el plato','Traer la servilleta','Traer el vaso','Traer la jarra']),
    ],
    'junior': [
        ('Preparar la mesa del taller', ['Colocar la lona','Preparar las tijeras','Poner las cajas','Traer las etiquetas','Preparar el cartel']),
        ('Organizar la caja de juegos', ['Traer piezas','Extender los tableros','Preparar las cajas','Marcar los turnos','Poner el cartel']),
        ('Preparar el mural del aula', ['Preparar el cartel','Elegir las láminas','Traer la cinta','Reservar el pasillo','Traer las herramientas']),
    ],
    'primary': [
        ('Preparar una exposición de ciencias', ['Marcar el recorrido','Colocar la mesa','Traer la lámpara','Repartir los carteles','Comprobar la entrada']),
        ('Coordinar la emisión de la radio escolar', ['Elegir el orden','Traer el micrófono','Traer los auriculares','Repartir el guion','Reservar la sala']),
        ('Organizar un intercambio de libros', ['Preparar las mesas','Contar los libros','Traer los rótulos','Reunir a las parejas','Preparar las hojas']),
    ],
    'middle': [
        ('Preparar una sesión del periódico escolar', ['Recoger propuestas nuevas','Preparar las imágenes','Revisar los textos recibidos','Preparar la plantilla','Comprobar los permisos de uso']),
        ('Organizar una demostración de robótica', ['Revisar las conexiones','Marcar el recorrido','Encargar las baterías','Preparar la mesa de control','Comprobar las salidas']),
        ('Coordinar el ensayo de una obra de teatro', ['Reunir el reparto','Revisar la iluminación','Marcar las entradas','Preparar los accesorios','Comprobar el guion']),
    ],
    'teen': [
        ('Coordinar la muestra de proyectos', ['Acordar los turnos','Verificar los materiales','Preparar la sala','Asignar los puestos','Revisar el acceso']),
        ('Preparar una consulta del consejo escolar', ['Reunir las propuestas','Revisar las condiciones','Preparar el formulario','Reservar la sala','Confirmar el equipo']),
        ('Coordinar la salida de un equipo técnico', ['Consultar el inventario','Traer las cajas','Preparar el recorrido','Confirmar los turnos','Verificar el transporte disponible']),
    ],
}

families = {'planning':('PL',38),'supervision':('SU',38),'CP':('CP',38)}
extra_contexts={
    'early': [
        ('Preparar el banco de semillas',['Traer sobres','Poner la caja','Traer las semillas','Poner el aviso']),
        ('Preparar el espacio de lectura',['Poner un cojín','Traer un cuento','Abrir la cortina','Poner un cartel'])
    ],
    'junior': [
        ('Preparar una mesa de intercambio',['Traer los libros','Escribir el aviso','Preparar los marcadores','Buscar sillas','Reservar una mesa']),
        ('Organizar una zona de juegos',['Buscar un reloj','Poner los conos','Colgar el aviso','Traer pelotas','Marcar el paso'])
    ],
    'primary': [
        ('Preparar un encuentro en el planetario',['Confirmar las visitas','Traer los planos','Organizar las fichas','Repartir las linternas','Reservar el pasillo']),
        ('Montar una mesa para una muestra de mapas',['Traer las escalas','Preparar la cartelera','Poner sillas','Acordar los turnos','Reservar el espacio'])
    ],
    'middle': [
        ('Organizar un punto de préstamo',['Preparar los carritos','Traer la lista de contacto','Comprobar las luces','Marcar las colas','Reservar el almacén']),
        ('Preparar un concurso de sonido',['Reservar la sala','Traer auriculares','Publicar los turnos','Preparar las tarjetas','Marcar las posiciones'])
    ],
    'teen': [
        ('Preparar la recepción de un encuentro',['Acordar los avisos','Preparar las acreditaciones','Revisar la sala','Marcar las salidas','Confirmar al equipo']),
        ('Coordinar la recogida de materiales',['Confirmar el transporte','Reservar el almacén','Traer cajas','Acordar la señalización','Preparar el equipo'])
    ]
}


def passes(order, rule):
    kind, a, b = rule
    first = order.index(a)
    if kind == 'starts':
        return first < b
    if kind == 'ends':
        return first >= len(order) - b
    second = order.index(b)
    return {
        'before': first < second,
        'next': second - first == 1,
        'apart': abs(first-second) > 1,
        'together': abs(first-second) == 1,
    }[kind]


def canonical(solutions, relabelings):
    return min(tuple(sorted(tuple(labels[i] for i in order) for order in solutions)) for labels in relabelings)


def shapes(n, level):
    orders = list(permutations(range(n)))
    directions=list(permutations(range(n),2))
    pairs=list(combinations(range(n),2))
    rules=(
        [('before',*pair) for pair in directions]
        + [('next',*pair) for pair in directions]
        + [('apart',*pair) for pair in pairs]
        + [('together',*pair) for pair in pairs]
        + [(kind,i,2 if n>3 else 1) for kind,i in product(['starts','ends'],range(n))]
    )
    needed = level + 1 if n>=4 else min(2,level+1)
    for limits in combinations(rules,needed):
        if len({kind for kind,_,_ in limits})<2:
            continue
        # A case must require a relation other than ordinary precedence.
        if not any(kind in ('next','apart','together') for kind,_,_ in limits):
            continue
        involved={v for kind,a,b in limits for v in ((a,) if kind in ('starts','ends') else (a,b))}
        if len(involved)!=n:
            continue
        eligible=[order for order in orders if all(passes(order,rule) for rule in limits)]
        if len(eligible)<2 or len(eligible)*2>len(orders):
            continue
        if not all(any(not passes(order,rule) and all(passes(order,other) for other in limits if other!=rule)
                       for order in orders) for rule in limits):
            continue
        # If the solution space is itself just a precedence graph, the case
        # belongs to the earlier bank even when its wording appears new.
        precedence=[('before',a,b) for a,b in directions if all(order.index(a)<order.index(b) for order in eligible)]
        if sum(all(passes(order,rule) for rule in precedence) for order in orders)==len(eligible):
            continue
        yield limits,eligible,orders,canonical(eligible,orders)


def make():
    out=[]
    for family,(prefix,target) in families.items():
        seen=set()
        family_count=0
        slots=list(product(contexts,[1,2,3]))
        for index,(age,level) in enumerate(slots*8):
            if family_count==target:
                break
            # Early readers get at most four known actions. Harder cases for
            # older groups use one more action or an additional condition.
            n=4 if age in ('early','junior') or level==1 else 5
            collection=contexts[age] if family_count<18 else contexts[age]+extra_contexts[age]
            context,labels=collection[(level+index//len(slots)-1)%len(collection)]
            for limits,eligible,orders,key in shapes(n,level):
                if key in seen:
                    continue
                observed=previous=None
                if family=='supervision':
                    violations=lambda order:sum(not passes(order,rule) for rule in limits)
                    observed=next((order for order in orders if violations(order)==min(2,level)),None)
                    if observed is None:
                        continue
                if family=='CP':
                    previous=next((order for order in orders if not passes(order,limits[-1]) and
                                   all(passes(order,rule) for rule in limits[:-1])),None)
                    if previous is None:
                        continue
                seen.add(key)
                family_count+=1
                signature=';'.join(''.join(map(str,order)) for order in key)
                mechanic={'planning':'coordinate-order', 'supervision':'audit-proposed-order','CP':'revise-with-new-order-condition'}[family]
                grouping='-'.join(sorted(set(rule[0] for rule in limits)))
                lot='B1' if family_count<=18 else 'B4'
                entry=dict(id=f'{prefix}193-{lot}-{family_count:02}',family=family,ageBand=age,
                           level=level,context=context,steps=labels[:n],rules=limits,structure=signature,
                           mechanic=mechanic+':'+grouping)
                if observed is not None:
                    entry['observed']=observed
                if previous is not None:
                    entry['previous']=previous
                out.append(entry)
                break
    return out


def main():
    items=make()
    path=Path(__file__).resolve().parents[2]/'js/gliax-r193-editorial-plan-data.js'
    path.write_text(
        '(function(root){\n  "use strict";\n  const records = [\n' +
        ',\n'.join('    '+json.dumps(item, ensure_ascii=False,separators=(',',':')) for item in items) +
        '\n  ];\n  root.GliaxR193EditorialPlanData=records;\n  if(typeof module!=="undefined")module.exports=records;\n})(globalThis);\n',
        encoding='utf-8')
    counts={family:sum(item['family']==family for item in items) for family in families}
    print(counts)


if __name__=='__main__':
    main()

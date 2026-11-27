"""Select different rule systems, modulo item and rule renaming."""
from itertools import combinations, permutations
from pathlib import Path
import json

CONTEXTS = {
    'early': [
        ('Qué llevar al rincón de arte', ['Papel','Lápices','Ceras','Sellos']),
        ('Qué poner en la mesa de juego', ['Fichas','Cartas','Tablero','Reloj']),
        ('Qué llevar a la sala de lectura', ['Cuento','Revista','Marcapáginas','Caja']),
    ],
    'junior': [
        ('Material para hacer un mural', ['Cartulina','Cinta','Rotuladores','Plantilla']),
        ('Preparar una caja para el taller', ['Regla','Tijeras','Pegamento','Cuaderno']),
        ('Material para el patio', ['Conos','Pelotas','Cuerdas','Petos']),
    ],
    'primary': [
        ('Recursos para el puesto de ciencias', ['Lupa','Linterna','Cuaderno','Brújula']),
        ('Piezas disponibles para probar un puente', ['Pinzas','Cordel','Base','Contrapeso']),
        ('Equipo para una visita guiada', ['Plano','Guion','Prismáticos','Grabadora']),
    ],
    'middle': [
        ('Recursos para una emisión escolar', ['Micrófono','Mesa de mezclas','Grabadora','Ordenador']),
        ('Piezas de una demostración de robótica', ['Sensor','Motor','Controlador','Batería']),
        ('Material para el registro audiovisual', ['Trípode','Cámara','Micrófono','Panel LED']),
    ],
    'teen': [
        ('Recursos para una exposición itinerante', ['Atril','Proyector','Panel','Altavoz']),
        ('Material de un archivo temporal', ['Escáner','Ordenador','Lector óptico','Disco externo']),
        ('Equipos para un taller de fotografía', ['Cámara','Trípode','Reflector','Medidor de luz']),
    ],
}
TARGETS = {'EC': ('EC',44), 'constraints':('RT',38), 'goal-change':('CO',38)}
FIRST_LOT = {'EC':24, 'constraints':18, 'goal-change':18}
EXTENDED_CONTEXTS={
    'early': [
        ('Qué poner en la mesa de música',['Pandereta','Caja','Flauta','Maracas']),
        ('Material para una visita al patio',['Gorra','Botella','Bolsa','Mapa'])
    ],
    'junior': [
        ('Qué llevar a la zona de costura',['Tela','Hilo','Tijeras','Regla']),
        ('Elementos para mostrar títeres',['Telón','Muñeco','Caja','Linterna'])
    ],
    'primary': [
        ('Piezas para una mesa de astronomía',['Mapa lunar','Linterna','Prismáticos','Soporte']),
        ('Materiales disponibles para una maqueta',['Cartón','Madera','Cinta','Bridas'])
    ],
    'middle': [
        ('Recursos para analizar una grabación',['Monitor','Auriculares','Altavoz','Interfaz']),
        ('Instrumentos para un puesto de medición',['Termómetro','Balanza','Probeta','Cronómetro'])
    ],
    'teen': [
        ('Selección de equipo para una demostración de energía',['Batería','Convertidor','Panel solar','Medidor']),
        ('Preparar un puesto de catalogación',['Cámara','Balanza','Escáner','Portátil'])
    ],
}


def allows(rule, mask):
    kind,a,b=rule
    A=bool(mask & 1<<a)
    B=bool(mask & 1<<b)
    return {'if':not A or B, 'exclude':not(A and B),
            'either':A or B, 'exactly':A != B, 'link':A==B,
            'keep':A, 'drop':not A}[kind]


def signatures(rules,n):
    for labels in permutations(range(n)):
        moved=[(kind,labels[a],labels[b] if kind not in ('keep','drop') else 0) for kind,a,b in rules]
        yield tuple(sorted(sum(int(allows(rule,mask))<<mask for mask in range(1,1<<n)) for rule in moved))


def pool(n,level,family):
    binary=list(combinations(range(n),2))
    allowed=[(kind,a,b) for kind in ['exclude','either','exactly','link'] for a,b in binary]
    allowed.extend(('if',a,b) for a,b in permutations(range(n),2))
    allowed.extend((kind,a,0) for kind in ['keep','drop'] for a in range(n))
    count=level+1
    masks=list(range(1,1<<n))
    # Use more than one kind of decision and reject redundant rules.
    ordered=sorted(allowed)
    for rs in combinations(ordered,count):
        if family=='goal-change':
            last=next((r for r in rs if r[0] in ('keep','drop')),None)
            if last is None:
                continue
            rs=tuple(r for r in rs if r!=last)+(last,)
        if len({r[0] for r in rs})<2:
            continue
        actual_bits={v for kind,a,b in rs for v in ((a,) if kind in ('keep','drop') else (a,b))}
        if len(actual_bits)!=n:
            continue
        failures={m:[i for i,r in enumerate(rs) if not allows(r,m)] for m in masks}
        valid=[m for m in masks if not failures[m]]
        if not all([i] in failures.values() for i in range(count)):
            continue
        if family=='EC':
            if len(valid) > len(masks)//2:
                continue
            yield rs, None, None, bool(valid)
        elif valid:
            borderline=[m for m in masks if len(failures[m])==1]
            if len(borderline)<2:
                continue
            old=None
            if family=='goal-change':
                old=next((m for m in masks if failures[m]==[count-1]),None)
                if old is None:
                    continue
            options=[valid[0],*borderline[:2]]
            # Some resource problems have two legitimate solutions.
            if family=='constraints' and level>1 and len(valid)>1 and len(valid)%2==0:
                options=[valid[0],valid[1],borderline[0]]
            yield rs,options,old,True


def build():
    results=[]
    for family,(prefix,target) in TARGETS.items():
        used=set()
        count=0
        slots=[(age,level) for age in CONTEXTS for level in [1,2,3] if age!='early' or family!='constraints']
        for index,(age,level) in enumerate(slots*9):
            if count==target:
                break
            n=3 if age in ('early','junior') or level==1 else 4
            collection=CONTEXTS[age] if count<FIRST_LOT[family] else CONTEXTS[age]+EXTENDED_CONTEXTS[age]
            context,items=collection[(level-1+index//len(slots))%len(collection)]
            # Alternate satisfiable and contradictory cases where there is a
            # qualified choice; preserve the acceptance predicate either way.
            shape=None
            for polarity in ([index%2==0,index%2!=0] if family=='EC' else [True]):
                for rules,options,old,exists in pool(n,level,family):
                    if exists!=polarity:
                        continue
                    key=min(signatures(rules,n))
                    if (n,key) in used:
                        continue
                    used.add((n,key))
                    shape=(rules,options,old,exists,key)
                    break
                if shape:
                    break
            if not shape:
                continue
            rules,options,old,exists,key=shape
            count+=1
            lot='B2' if count<=FIRST_LOT[family] else 'B5'
            record=dict(id=f'{prefix}193-{lot}-{count:02}',family=family,ageBand=age,level=level,context=context,items=items[:n],
                        rules=rules,structure=':'.join(map(str,key)), options=options,previous=old)
            results.append(record)
    return results


def main():
    records=build()
    path=Path(__file__).resolve().parents[2]/'js/gliax-r193-editorial-logic-data.js'
    body=',\n'.join('    '+json.dumps(row,ensure_ascii=False,separators=(',',':')) for row in records)
    path.write_text('(function(root){\n  "use strict";\n  const records=[\n'+body+
                    '\n  ];\n  root.GliaxR193EditorialLogicData=records;\n  if(typeof module!=="undefined")module.exports=records;\n})(globalThis);\n',encoding='utf-8')
    print({family:sum(r['family']==family for r in records) for family in TARGETS})


if __name__ == '__main__':
    main()

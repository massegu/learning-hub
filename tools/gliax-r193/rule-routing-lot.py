"""Create lexically invariant rule-routing cases with independently inspectable rules."""
from itertools import product, permutations
from pathlib import Path
import json

AGES=('junior','primary','middle','teen')
AXES=range(3)
VALUES=range(8)


def resolve(expr,mask):
    while isinstance(expr,tuple):
        axis,when,otherwise=expr
        expr=when if mask&(1<<axis) else otherwise
    return expr


def leaves(expr):
    if isinstance(expr,tuple):
        return leaves(expr[1])|leaves(expr[2])
    return {expr}


def used(expr):
    if isinstance(expr,tuple):
        return {expr[0]}|used(expr[1])|used(expr[2])
    return set()


def table(expr):
    return tuple(resolve(expr,mask) for mask in VALUES)


def changed_axes(t):
    return {a for a in AXES if any(t[i]!=t[i^(1<<a)] for i in VALUES)}


simple=[]
for axis,a,b in product(AXES,'ABW','ABW'):
    if a!=b:
        simple.append((axis,a,b))
double=[]
for axis,one,leaf in product(AXES,simple,'ABW'):
    if axis not in used(one):
        double.extend(((axis,one,leaf),(axis,leaf,one)))
double=[x for x in double if len(changed_axes(table(x)))==2]

TRANSFORMS=[]
for axes,neg in product(permutations(AXES),range(8)):
    TRANSFORMS.append(tuple(sum(((((mask>>i)&1)^((neg>>i)&1))<<axis) for i,axis in enumerate(axes))
                            for mask in VALUES))
A_TO_B=str.maketrans('AB','BA')


def canonical(a,b):
    normalized=[]
    for remap in TRANSFORMS:
        pair=''.join(a[i] for i in remap)+''.join(b[i] for i in remap)
        normalized.extend((pair,pair.translate(A_TO_B)))
    return min(normalized)


def eligible(level):
    first=simple if level==1 else double
    for a,b in product(first,double):
        ax,by=table(a),table(b)
        combined=changed_axes(ax)|changed_axes(by)
        if level==1 and len(combined)!=2 or level==3 and len(combined)!=3:
            continue
        if not {'A','B'}.issubset(leaves(a)|leaves(b)):
            continue
        if sum(x!=y for x,y in zip(ax,by)) < 2:
            continue
        yield a,b,ax,by


def build():
    seen=set()
    results=[]
    by_level={level:list(eligible(level)) for level in [1,2,3]}
    for index,(age,level) in enumerate(product(AGES,[1,2,3])):
        need=3 if index==11 else 4
        options=by_level[level]
        offset=(index*113)%len(options)
        n=0
        for a,b,ax,by in options[offset:]+options[:offset]:
            # Score-bearing cases differ independently of signs and A/B labels.
            key=canonical(ax,by)
            if key in seen:
                continue
            if age=='junior' and level==1 and 'W' in ax+by and n==0:
                continue
            seen.add(key)
            results.append(dict(id=f'AR193-B8-{len(results)+1:02}',ageBand=age,level=level,
                                direct=a,revised=b,signature=key))
            n+=1
            if n==need:
                break
        if n!=need:
            raise RuntimeError(f'Only {n} eligible programs for {age} / {level}')
    return results


def main():
    records=build()
    path=Path(__file__).resolve().parents[2]/'js/gliax-r193-editorial-routing-data.js'
    body=',\n'.join('    '+json.dumps(row,ensure_ascii=False,separators=(',',':')) for row in records)
    path.write_text('(function(root){\n  "use strict";\n  const records=[\n'+body+
                    '\n  ];\n  root.GliaxR193EditorialRoutingData=records;\n  if(typeof module!=="undefined")module.exports=records;\n})(globalThis);\n',encoding='utf-8')
    print(len(records))


if __name__ == '__main__':
    main()

(function(root){
  'use strict';
  function apply(families,h){
    const {choice,order,text,list,table,objects,shapes,colors}=h;
    const dots=(count,label)=>({...list(Array(count).fill('●')),presentation:'count',...(label?{label}:{})});
    const cards=(items,label)=>({...list(items),presentation:'cards',...(label?{label}:{})});
    const model=value=>({...text(`Modelo: ${value}`),presentation:'model'});
    const compare=rows=>({...table(rows),presentation:'comparison'});
    const quantity=(op,blocks,extra={})=>({quantityEvidence:{op,blocks,...extra}});
    const family=(mechanic,context,build)=>[mechanic,context,build];
    const school=[objects[0],objects[2],objects[5]];
    const snacks=[objects[4],objects[9]];
    const arithmetic=[objects[2],objects[4],objects[9],objects[1]];
    const amount=(k,o)=>k===1?o.some:`${k} ${o.plural}`;

    families.division=[
      family('count','toys',(o,n,v,l)=>{const k=l+1+v%3;return choice('Cuenta los puntos. ¿Cuántos hay?',[dots(k)],k,l===3?[k-1,k+1]:[k+1,k+2],quantity('count',[0]));}),
      family('addition','school',(o,n,v,l)=>{
        o=arithmetic[v%4];const k=1+v%2,add=l===1?1:l===2?1+Math.floor(v/2)%2:2+Math.floor(v/2)%2;
        return choice(`¿${o.gender==='f'?'Cuántas':'Cuántos'} ${o.plural} hay ahora?`,[cards(Array(k).fill(o.name),'Ya hay'),cards(Array(add).fill(o.name),'Llegan')],k+add,[k,k+add+1],quantity('sum',[0,1]));
      }),
      family('subtraction','snacks',(o,n,v,l)=>{
        o=snacks[v%2];const k=[2,3,3][l-1]+v%2,remove=l===1?1:l===2?1+Math.floor(v/2)%2:2;
        return choice(`¿${o.gender==='f'?'Cuántas':'Cuántos'} ${o.plural} quedan?`,[cards(Array(k).fill(o.name),'Había'),cards(Array(remove).fill(o.name),'Se llevan')],k-remove,[k,k-remove+1],quantity('subtract',[0,1]));
      }),
      family('compare','school',(o,n,v,l)=>{
        const k=l===3?3+v%3:1+v%2,delta=l===1?2:1,first=v%2===0;
        const a=first?k+delta:k,b=first?k:k+delta;
        const values=l===3?[String(a),String(b)]:['● '.repeat(a).trim(),'● '.repeat(b).trim()];
        return choice(l===3?'¿Quién tiene menos puntos?':'¿Quién tiene más puntos?',[compare([[n,values[0]],['Sol',values[1]]])],l===3?(first?'Sol':n):(first?n:'Sol'),[l===3?(first?n:'Sol'):(first?'Sol':n),'Tienen los mismos'],{quantityEvidence:{op:'compare',block:0,ask:l===3?'less':'more'}});
      }),
      family('count','playground',(o,n,v,l)=>{
        const k=[2,3,4][l-1]+v%2,target=shapes[v%4],other=shapes[(v+1)%4];
        return choice(`Cuenta solo ${target}. ¿Cuántas hay?`,[cards([...Array(k).fill(target),other])],k,[k+1,k-1],quantity('count',[0],{target}));
      }),
      family('subtraction','birthday',(o,n,v,l)=>{
        const needed=[2,3,4][l-1],have=1+v%Math.min(needed-1,6-needed);
        return choice('Cada persona necesita una galleta. ¿Cuántas faltan?',[cards(['Ana','Leo','Mar','Sol'].slice(0,needed),'Personas'),cards(Array(have).fill('la galleta'),'Galletas que ya hay')],needed-have,[needed,needed-have+1],quantity('subtract',[0,1]));
      }),
      family('addition','snacks',(o,n,v,l)=>{
        const k=1+v%2,other=l===1?1:l===2?2:3;
        return choice('¿Cuántas cosas hay para merendar?',[cards(Array(k).fill('la manzana'),'Manzanas'),cards(Array(other).fill('la galleta'),'Galletas')],k+other,[k,k+other+1],quantity('sum',[0,1]));
      }),
      family('compare','toys',(o,n,v,l)=>{
        const k=l===1?1+v%2:l===2?2+v%2:3+v%3,same=v%2===0,other=same?k:l===2?k-1:k+1;
        return choice('¿Las dos cajas tienen la misma cantidad?',[compare([['Caja A',l===3?String(k):'● '.repeat(k).trim()],['Caja B',l===3?String(other):'● '.repeat(other).trim()]])],same?'Sí':'No',[same?'No':'Sí'],{quantityEvidence:{op:'equal',block:0}});
      }),
      family('count','toys',(o,n,v,l)=>{
        const k=l===1?1+v%2:l===2?2+v%2:4+v%3,other=l===2?k-1:k+1,first=Math.floor(v/2)%2===0;
        const values=l===3?[String(k),String(other)]:['● '.repeat(k).trim(),'● '.repeat(other).trim()];
        const rows=[['A',values[first?0:1]],['B',values[first?1:0]]];
        return choice(`¿Qué caja tiene ${k} puntos?`,[compare(rows)],first?'A':'B',[first?'B':'A'],{quantityEvidence:{op:'findCount',block:0,target:k}});
      }),
      family('count','school',(o,n,v,l)=>{
        const start=l===1?1+v%3:l===2?2+v%4:1+v%3,step=l===3?2:1;
        return choice(l===3?'Cuenta de dos en dos. ¿Qué número falta?':'Sigue los números. ¿Cuál falta?',[cards([String(start),'?',String(start+2*step)])],start+step,[start,start+2*step],{quantityEvidence:{op:'between',block:0,step}});
      }),
    ];

    families.attention[0]=family('matching','school',(o,n,v,l)=>{
      const row=Array.from({length:l},(_,i)=>shapes[(v+i)%4]).join(' · ');
      const wrong=Array.from({length:l},(_,i)=>shapes[(v+i+(i===l-1?1:0))%4]).join(' · ');
      return choice('Mira el modelo. ¿Cuál es igual?',[model(row)],row,[wrong,Array(l).fill(shapes[(v+2)%4]).join(' · ')].filter(x=>x!==row));
    });
    families.attention[1]=family('search','playground',(o,n,v,l)=>{
      const target=shapes[v%4],k=1+v%l,len=[3,5,6][l-1];
      const values=[...Array(k).fill(target),...Array.from({length:len-k},(_,i)=>shapes[(v+1+i%3)%4])];
      if(v%2)values.reverse();
      return choice(`Busca ${target}. ¿Cuántas hay?`,[cards(values)],k,[k+1,k+2],quantity('count',[0],{target}));
    });
    families.attention[2]=family('oddOne','toys',(o,n,v,l)=>{
      const common=shapes[v%4],odd=shapes[(v+1)%4],values=Array([3,4,6][l-1]).fill(common);values[v%values.length]=odd;
      return choice('Mira las figuras. ¿Cuál es diferente?',[cards(values)],odd,[common,shapes[(v+2)%4]],{matchEvidence:{op:'odd',block:0}});
    });
    families.attention[3]=family('matching','backpack',(o,n,v,l)=>{
      const row=Array.from({length:l+1},(_,i)=>shapes[(v+i)%4]);
      const reversed=[...row].reverse(),changed=[...row];changed[changed.length-1]=shapes[(v+l+2)%4];
      const labels=l===1?['A','B']:['A','B','C'],position=v%labels.length,wrong=[reversed.join(' · '),changed.join(' · ')];
      const rows=labels.map((label,i)=>[label,i===position?row.join(' · '):wrong.shift()]);
      return choice('Mira el modelo. ¿Qué fila es igual?',[model(row.join(' · ')),compare(rows)],rows[position][0],rows.filter((_,i)=>i!==position).map(r=>r[0]),{matchEvidence:{op:'modelRow',modelBlock:0,block:1}});
    });
    families.attention[4]=family('findPlace','school',(o,n,v,l)=>{
      const choices=objects.filter(x=>x!==o).slice(0,l),rows=[[o.name,o.place],...choices.map(x=>[x.name,x.place])];
      return choice(`Busca ${o.name}. ¿Dónde está?`,[compare(rows)],o.place,['el jardín','el baño'],{lookupEvidence:{block:0,row:0,subjectColumn:0,valueColumn:1}});
    });
    families.attention.push(
      family('matching','toys',(o,n,v,l)=>{
        const a=shapes[v%4],b=shapes[(v+1)%4];const target=l===1?`${a} · ${b}`:l===2?`${a} · ${b} · ${a}`:`${a} · ${b} · ${b} · ${a}`;
        const wrong=l===1?`${b} · ${a}`:l===2?`${a} · ${a} · ${b}`:`${a} · ${b} · ${a} · ${b}`;
        return choice('Compara las figuras en orden. ¿Cuál es igual?',[model(target)],target,[wrong,Array(l+1).fill(b).join(' · ')]);
      }),
      family('findPlace','playground',(o,n,v,l)=>{
        const paths=[['○','□','△'],['□','△','☆'],['△','☆','○'],['☆','○','□']],p=paths[v%4].slice(0,l===1?2:3);
        return choice(l===3?'Desde el final, vuelve una casilla. ¿Qué figura encuentras?':'Sigue la fila. ¿Qué figura está al final?',[{...list(p),presentation:'sequence'}],l===3?p[p.length-2]:p[p.length-1],p.filter((_,i)=>i!==(l===3?p.length-2:p.length-1)));
      }),
    );

    // Recall shows the exact same facts as the worksheet, with 2/3/4 loads.
    const oldMemory=families.memory[0][2];
    families.memory[0][2]=(o,n,v,l)=>{const it=oldMemory(o,n,v,l);it.stimulus[0].presentation='cards';it.revealMs=[7000,8500,10000][l-1];return it;};
    families.memory[1][2]=(o,n,v,l)=>{
      const entries=[o,...objects.filter(x=>x!==o)].slice(0,l);
      return choice(`Mira dónde está ${o.name}.`,[compare(entries.map(x=>[x.name,x.place]))],o.place,['el jardín','el baño'],{type:'memoryReveal',memoryQuestion:`¿Dónde estaba ${o.name}?`,memoryContent:entries.map(x=>({icon:x.icon,detail:`${x.name}: ${x.place}`})),answerEvidence:{type:'tableCell',block:0,row:0,column:1,subjectColumn:0},revealMs:[6500,8000,9500][l-1]});
    };
    families.memory[2][2]=(o,n,v,l)=>{
      const people=[n,...['Sol','Ana','Leo','Mar','Pau'].filter(x=>x!==n)].slice(0,l+1),rows=people.map((person,i)=>[person,colors[(v+i)%4]]);
      return choice('Mira los globos de cada persona.',[{...compare(rows),label:'Globos'}],rows[0][1],colors.filter(c=>c!==rows[0][1]),{type:'memoryReveal',memoryQuestion:`¿De qué color era el globo de ${n}?`,memoryContent:rows.map(r=>({person:r[0],detail:`Globo ${r[1]}`})),answerEvidence:{type:'tableCell',block:0,row:0,column:1,subjectColumn:0},revealMs:[7000,8500,10000][l-1]});
    };
    families.memory[3][2]=(o,n,v,l)=>{
      const items=Array.from({length:l+1},(_,i)=>objects[(v+i)%objects.length]),index=l===1?0:l===2?1:items.length-1;
      return choice('Mira estas cosas en orden.',[{...list(items.map(x=>x.name)),presentation:'sequence'}],items[index].name,items.filter((_,i)=>i!==index).map(x=>x.name),{type:'memoryReveal',memoryQuestion:l===1?'¿Qué cosa estaba primero?':l===2?'¿Qué cosa estaba en segundo lugar?':'¿Qué cosa estaba al final?',memoryContent:items.map((x,i)=>({icon:x.icon,detail:`${i+1}. ${x.name}`})),answerEvidence:{type:'listItem',block:0,index},revealMs:[7500,9000,10500][l-1]});
    };

    const basicRoutines=[
      ['Quieres guardar el dibujo en una carpeta.',['Coge el dibujo','Mete el dibujo en la carpeta']],
      ['La maceta ya tiene tierra. Quieres sembrar una semilla.',['Pon la semilla','Riega con agua']],
      ['La caja de plastilina está cerrada. Quieres sacarla.',['Abre la caja','Saca la plastilina']],
      ['Quieres beber. La botella está cerrada.',['Abre la botella','Bebe el agua']],
    ];
    const advancedRoutines=[
      ['La mesa está mojada. Quieres leer allí y guardar el libro.',['Seca la mesa','Lee el libro','Guarda el libro']],
      ['Quieres pintar. La mesa está llena de juguetes.',['Recoge los juguetes','Coloca el papel','Pinta con el pincel']],
      ['La caja está cerrada. Quieres guardar dentro el regalo.',['Abre la caja','Mete el regalo','Cierra la caja']],
      ['Las manos están sucias. Quieres comer la manzana.',['Lávate las manos','Lava la manzana','Come la manzana']],
    ];
    const oldRoutine=families.executive[2][2];
    families.executive[2][2]=(o,n,v,l)=>{
      if(l===2)return oldRoutine(o,n,v,l);
      const [s,steps]=(l===1?basicRoutines:advancedRoutines)[v%4];return order('Ordena los pasos.',steps,s);
    };
    const oldPlanning=families.executive[0][2];
    families.executive[0][2]=(o,n,v,l)=>{
      if(l===2)return oldPlanning(o,n,v,l);
      const easy=[['Quieres dibujar. Ya tienes el papel.','El lápiz',['La cuchara','La pelota']],['Quieres beber agua.','La botella',['El libro','La muñeca']],['Quieres jugar al fútbol.','La pelota',['La manzana','El cuaderno']],['Quieres escribir. Ya tienes el lápiz.','El cuaderno',['La gorra','La galleta']]];
      const hard=[['Vas de excursión. La botella está vacía. Debes llevar agua.','Llenar la botella antes de salir',['Salir con la botella vacía','Guardar la botella vacía']],['Quieres pintar. La mesa está llena de juguetes.','Recoger los juguetes primero',['Pintar sobre los juguetes','Guardar el pincel']],['Quieres salir al patio. Está lloviendo.','Coger el paraguas antes de salir',['Dejar el paraguas en casa','Salir sin el paraguas']],['Quieres merendar. Tus manos están sucias.','Lavarse las manos primero',['Comer antes de lavarse','Guardar el jabón']]];
      const [s,a,w]=(l===1?easy:hard)[v%4];return choice(l===1?'¿Qué necesitas?':'¿Qué debes hacer primero?',[text(s)],a,w);
    };
    families.executive[3][2]=(o,n,v,l)=>{
      const toys=[objects[1],objects[3],objects[7],objects[8]],items=[...toys,...school],item=items[v%items.length];
      const rules=l===1?'Los juguetes van en la caja.':l===2?'Los juguetes van en la caja. Las cosas del colegio, en el estante.':'Los juguetes van en la caja. Las cosas del colegio, en el estante.';
      const target=l===1?toys[v%toys.length]:item;
      return choice(`¿Dónde guardas ${target.name}?`,[text(rules),cards(l===3?[target.name,items[(v+1)%items.length].name]:[target.name])],l===1||toys.includes(target)?'En la caja':'En el estante',['En el suelo',l===1||toys.includes(target)?'En el estante':'En la caja']);
    };
    families.executive.push(
      family('planning','backpack',(o,n,v,l)=>{
        const needed=school.slice(0,l+1),missing=v%needed.length,packed=needed.filter((_,i)=>i!==missing);
        return choice('Mira lo que necesitas. ¿Qué falta en la mochila?',[cards(needed.map(x=>x.name),'Necesitas'),cards(packed.map(x=>x.name),'Ya está en la mochila')],needed[missing].name,[...packed.map(x=>x.name),'la pelota']);
      }),
      family('inhibition','school',(o,n,v,l)=>{
        const rule=l===1?'Si ves ○, toca la mesa.':l===2?'Si ves ○, toca la mesa. Si ves □, espera.':'Si ves △, levanta la mano. Si ves ○, toca la mesa.';
        const figure=l===1?'○':l===2?shapes[v%2]:v%2===0?'△':'○',target=l===1?'Tocar la mesa':l===2?(v%2===0?'Tocar la mesa':'Esperar'):(v%2===0?'Levantar la mano':'Tocar la mesa');
        return choice('Mira la regla y la figura. ¿Qué haces?',[text(rule),model(figure)],target,l===3?['Tocar la mesa','Levantar la mano','Esperar'].filter(x=>x!==target):[target==='Esperar'?'Tocar la mesa':'Esperar','Levantar la mano']);
      }),
      family('sequencing','school',(o,n,v,l)=>{
        const sets=[['Quieres dibujar y después guardar el papel.',['Coge el papel','Dibuja','Guarda el papel']],['Quieres leer y después guardar el libro.',['Coge el libro','Lee','Guarda el libro']],['Quieres jugar y después recoger la pelota.',['Coge la pelota','Juega','Guarda la pelota']]];
        const [s,steps]=sets[v%3];return order('Mira la tarea. Ordena los pasos.',l===1?steps.slice(1):steps,l===1?s.replace('Quieres','Ya tienes lo que necesitas. Quieres'):s);
      }),
    );

    const oldApplied=families.applied[0][2];
    families.applied[0][2]=(o,n,v,l)=>{
      if(l===1)return oldApplied(o,n,v,l);
      const states=l===2?['llena · cerrada','vacía · cerrada','llena · abierta']:['llena · abierta','llena · cerrada','vacía · cerrada'];
      const labels=['A','B','C'],rows=labels.map((label,i)=>[label,states[(i+v)%3]]),answer=rows.find(r=>r[1]==='llena · cerrada')[0];
      return choice('¿Qué botella está llena y cerrada?',[text('Para la excursión, lleva una botella llena y cerrada.'),{...compare(rows),label:'Botellas'}],answer,labels.filter(x=>x!==answer),{tableRule:{block:1,criteria:['llena','cerrada']}});
    };
    const oldProblem=families.applied[1][2];
    families.applied[1][2]=(o,n,v,l)=>{
      if(l<3)return oldProblem(o,n,v,l);
      const cases=[['Quieres dibujar. Tu lápiz no tiene punta. No tienes sacapuntas.','Pedir un sacapuntas',['Guardar el sacapuntas','Dibujar sin lápiz']],['Tu cuaderno no está en la mochila. Lo dejaste en la mesa.','Buscar el cuaderno en la mesa',['Buscar otra vez en la mochila','Tirar el lápiz']],['Quieres pegar un dibujo. Tu pegamento está vacío. Hay otro en la caja.','Coger el pegamento de la caja',['Usar el bote vacío','Romper el dibujo']]];
      const [s,a,w]=cases[v%3];return choice('¿Qué puedes hacer ahora?',[text(s)],a,w);
    };
    families.applied[2][2]=(o,n,v,l)=>{
      const color=colors[v%4];
      if(l===1)return choice('¿Qué pelota puedes usar?',[text(`En este juego usamos la pelota de color ${color}.`)],`La de color ${color}`,colors.filter(x=>x!==color).map(x=>`La de color ${x}`));
      const target=l===2?'grande':'pequeña',states=[`${color} · ${target}`,`${color} · ${l===2?'pequeña':'grande'}`,`${colors[(v+1)%4]} · ${target}`],labels=['A','B','C'];
      const rows=labels.map((label,i)=>[label,states[(i+v)%3]]);
      return choice(`¿Qué pelota es ${target} y de color ${color}?`,[text(`Usa una pelota ${target} y de color ${color}.`),compare(rows)],rows.find(r=>r[1]===states[0])[0],labels.filter(label=>label!==rows.find(r=>r[1]===states[0])[0]),{tableRule:{block:1,criteria:[color,target]}});
    };
    families.applied.push(
      family('followRule','school',(o,n,v,l)=>{
        const item=school[v%3],place=l===1?'la mesa':l===2?'la mochila':'el estante';
        const instruction=l===1?`Pon ${item.name} en ${place}.`:`Coge ${item.name} y ponlo en ${place}.`+(l===3?' Deja los juguetes en la caja.':'');
        return choice(`¿Dónde debes poner ${item.name}?`,[text(instruction),cards(l===3?[item.name,'la pelota','la gorra']:[item.name])],place,['el jardín','el baño']);
      }),
      family('chooseObject','snacks',(o,n,v,l)=>{
        const needs=[['Quieres comer una sopa.','La cuchara',['El lápiz','La pelota']],['Quieres llevar agua al patio.','La botella',['El libro','La muñeca']],['Quieres guardar los libros para ir al colegio.','La mochila',['La manzana','La gorra']]];
        const [s,a,w]=needs[v%3];return choice('¿Qué objeto te ayuda?',[text(s)],a,w);
      }),
      family('solveProblem','playground',(o,n,v,l)=>{
        const cases=[['La pelota ha caído debajo del banco. La ves desde aquí.','Agacharse y coger la pelota',['Buscar encima del banco','Irse sin mirar']],['Quieres beber. La botella está cerrada.','Abrir la botella',['Guardar la botella sin abrir','Buscar el libro']],['Quieres leer. El libro está dentro de la mochila cerrada.','Abrir la mochila',['Buscar debajo de la cama','Cerrar la mochila']]];
        const [s,a,w]=cases[v%3];return choice('¿Qué debes hacer primero?',[text(s)],a,w);
      }),
    );
    families.reading.push(
      family('literal','school',(o,n,v,l)=>{
        const stories=[
          ['Ana dibuja una casa. Leo dibuja un árbol.','¿Quién dibuja el árbol?','Leo',['Ana','Los dos']],
          ['Mar guarda el libro. Sol guarda el cuaderno.','¿Quién guarda el cuaderno?','Sol',['Mar','Los dos']],
          ['Nora juega con la pelota. Dani lee un cuento.','¿Quién lee un cuento?','Dani',['Nora','Los dos']],
          ['Pau riega la planta. Hugo limpia la mesa.','¿Quién riega la planta?','Pau',['Hugo','Los dos']],
          ['Lola lleva agua. Ana lleva una manzana.','¿Quién lleva agua?','Lola',['Ana','Las dos']],
          ['Leo construye una torre. Mar construye un puente.','¿Quién construye el puente?','Mar',['Leo','Los dos']],
        ];const [s,q,a,w]=stories[v%stories.length];return choice(q,[text(s)],a,w);
      }),
      family('inference','playground',(o,n,v,l)=>{
        const stories=[
          ['El viento se lleva la gorra de Ana. Ana corre detrás.','¿Qué quiere coger Ana?','La gorra',['La pelota','La muñeca']],
          ['Leo intenta beber. El vaso está vacío. Mira la botella de agua.','¿Qué puede hacer Leo?','Llenar el vaso',['Guardar el libro','Ponerse la gorra']],
          ['La torre de Mar se cae. Mar recoge las piezas y sonríe.','¿Qué puede hacer ahora?','Construir la torre otra vez',['Comer una manzana','Guardar el lápiz']],
          ['Pau quiere dibujar. La punta del lápiz se rompe. Busca el sacapuntas.','¿Para qué lo busca?','Para sacar punta al lápiz',['Para cortar el papel','Para borrar el dibujo']],
          ['Sol está en el patio. Empieza a llover. Sol abre el paraguas.','¿Por qué abre el paraguas?','Para no mojarse',['Para jugar a la pelota','Para guardar la mochila']],
          ['Hugo termina de leer. Cierra el libro y lo pone en el estante.','¿Qué ha terminado Hugo?','De leer',['De jugar al fútbol','De merendar']],
        ];const [s,q,a,w]=stories[v%stories.length];return choice(q,[text(s)],a,w);
      }),
    );
    families.language.push(family('vocabulary','family',(o,n,v,l)=>{
      const scenes=[['Ana abre la botella y bebe agua.','¿Qué hace Ana?','Bebe',['Dibuja','Duerme']],['Leo hace un dibujo con el lápiz.','¿Qué hace Leo?','Dibuja',['Bebe','Duerme']],['Mar mira las palabras del cuento.','¿Qué hace Mar?','Lee',['Salta','Bebe']],['Pau abre la caja y mete los juguetes.','¿Qué hace Pau con los juguetes?','Los guarda',['Los come','Los pinta']],['Nora pone agua en la tierra de la maceta.','¿Qué hace Nora?','Riega',['Corre','Lee']],['Dani se mete en la cama y cierra los ojos.','¿Qué puede hacer Dani ahora?','Dormir',['Jugar al fútbol','Pintar']]];
      const [s,q,a,w]=scenes[v%scenes.length];return choice(q,[text(s)],a,w);
    }));
    families.speedReasoning[6][2]=(o,n,v,l)=>{
      const a=shapes[v%4],b=shapes[(v+1)%4],c=shapes[(v+2)%4],values=l===1?[a,a,b]:l===2?[a,a,a,b]:[a,b,a,b,c,a];
      return choice('¿Qué figura aparece más veces?',[cards(values)],a,[b,c],{matchEvidence:{op:'mostFrequent',block:0}});
    };
    return families;
  }
  root.EarlyRefinements={apply};
  if(typeof module!=='undefined')module.exports={apply};
})(typeof window==='undefined'?globalThis:window);

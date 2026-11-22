(function(root){
  'use strict';
  const operators={add:'+',subtract:'−',multiply:'×',divide:'÷'};
  const names={add:'Sumar',subtract:'Restar',multiply:'Multiplicar',divide:'Dividir'};
  const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
  function ratio(n,d=1){
    if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||!d)throw Error('Cantidad fuera de rango.');
    const k=gcd(n,d)*Math.sign(d);
    return [n/k,d/k];
  }
  function parse(value){
    const raw=String(value).trim().replace('−','-').replace(',','.');
    const fraction=raw.match(/^(-?\d{1,7})\s*\/\s*(\d{1,6})$/);
    if(fraction&&Number(fraction[2]))return ratio(Number(fraction[1]),Number(fraction[2]));
    if(!/^-?\d{1,7}(\.\d{1,6})?$/.test(raw))return null;
    const decimals=raw.split('.')[1]?.length||0;
    return ratio(Number(raw.replace('.','')),10**decimals);
  }
  const eq=(a,b)=>Boolean(a&&b&&a[0]===b[0]&&a[1]===b[1]);
  function calculate(op,[a,b],[c,d]){
    switch(op){
      case 'add': return ratio(a*d+c*b,b*d);
      case 'subtract': return ratio(a*d-c*b,b*d);
      case 'multiply': return ratio(a*c,b*d);
      case 'divide': return ratio(a*d,b*c);
      default: throw Error('Operación desconocida.');
    }
  }
  const format=value=>{
    if(value[1]===1)return String(value[0]);
    const decimal=value[0]/value[1], short=decimal.toFixed(6).replace(/0+$/,'');
    return eq(value,parse(short))?short.replace('.',','):value.join('/');
  };
  const fact=(label,value,unit)=>({label,value:Array.isArray(value)?value:parse(value),unit});
  const step=(id,label,op,left,right,unit)=>({id,label,op,left,right,unit});
  const path=(id,...steps)=>({id,steps});
  const support=(type,...refs)=>({type,refs});
  function make(story,data,goal,paths,model,interpretation=null,optional=[]){
    return {story,data,goal,paths,model,interpretation,optional};
  }
  const templates={junior:{},primary:{},middle:{},teen:{}};
  const unit='€';
  const A=(id,label,a,b,u)=>step(id,label,'add',a,b,u);
  const S=(id,label,a,b,u)=>step(id,label,'subtract',a,b,u);
  const M=(id,label,a,b,u)=>step(id,label,'multiply',a,b,u);
  const D=(id,label,a,b,u)=>step(id,label,'divide',a,b,u);
  const F=fact, P=path, V=support;
  const single=(story,data,goal,model,...steps)=>make(story,data,goal,[P('directa',...steps)],model);

  templates.junior={
    'Parte y todo':(l,v)=>{
      const a=12+2*v,b=7+v,c=4+v;
      const story=`En la biblioteca, un grupo coloca ${a} libros y otro coloca ${b}. Se prestan ${c} de esos libros. ¿Cuántos quedan en la estantería?`;
      const data={a:F('Libros del primer grupo',a,'libros'),b:F('Libros del segundo grupo',b,'libros'),c:F('Libros prestados',c,'libros')};
      const sum=P('reunir_y_restar',A('total','Libros reunidos','a','b','libros'),S('goal','Libros que quedan','total','c','libros'));
      const rearrange=P('restar_y_reunir',S('remain','Libros del primer grupo que quedarían si se descuenta aquí el préstamo','a','c','libros'),A('goal','Libros que quedan','remain','b','libros'));
      return make(story,data,'goal',l===1?[sum]:[sum,rearrange],V('part','total','a','b'));
    },
    'Comparación aditiva':(l,v)=>single(
      `Para una excursión, Sol lleva ${10+v} tarjetas. Teo lleva ${3+l} más que Sol. ¿Cuántas tarjetas llevan en total?`,
      {sol:F('Tarjetas de Sol',10+v,'tarjetas'),gap:F('Tarjetas de más de Teo',3+l,'tarjetas')},'goal',V('difference','sol','gap','teo'),
      A('teo','Tarjetas de Teo','sol','gap','tarjetas'),A('goal','Tarjetas entre ambos','sol','teo','tarjetas')),
    'Cambios sucesivos':(l,v)=>{
      const start=18+v,loss=4+v,gain=2+l,fee=3;
      const story=`En un juego había ${start} fichas. El equipo pierde ${loss} y después gana ${gain}.`;
      const data={start:F('Fichas al principio',start,'fichas'),loss:F('Fichas perdidas',loss,'fichas'),gain:F('Fichas ganadas',gain,'fichas')};
      const after=S('after','Fichas tras perder','start','loss','fichas');
      if(l<3)return single(story+' ¿Cuántas tiene al final?',data,'goal',V('flow','start','after','goal'),
        after,A('goal','Fichas al final','after','gain','fichas'));
      data.fee=F('Fichas para la última ronda',fee,'fichas');
      return single(story+` Para entrar en la última ronda devuelve ${fee} fichas. ¿Cuántas le quedan?`,data,'goal',V('flow','start','after','beforeFee','goal'),
        after,A('beforeFee','Fichas antes de pagar la entrada','after','gain','fichas'),S('goal','Fichas al final','beforeFee','fee','fichas'));
    },
    'Grupos iguales con sobrante':(l,v)=>single(
      `En educación física hay ${4+v} bolsas con ${3+l} pelotas en cada una y ${2+v} pelotas sueltas. ¿Cuántas pelotas hay?`,
      {groups:F('Número de bolsas',4+v,'bolsas'),each:F('Pelotas por bolsa',3+l,'pelotas/bolsa'),loose:F('Pelotas sueltas',2+v,'pelotas')},'goal',V('groups','groups','each','packed'),
      M('packed','Pelotas en las bolsas','groups','each','pelotas'),A('goal','Pelotas en total','packed','loose','pelotas')),
    'Reparto tras una reserva':(l,v)=>{
      const teams=3+v,reserve=2+l,total=teams*(4+l)+reserve;
      return single(`De ${total} pegatinas se guardan ${reserve}. Se reparten por igual las demás entre ${teams} equipos. ¿Cuántas recibe cada equipo?`,
        {all:F('Pegatinas disponibles',total,'pegatinas'),reserve:F('Pegatinas guardadas',reserve,'pegatinas'),teams:F('Equipos',teams,'equipos')},'goal',V('share','available','teams','goal'),
        S('available','Pegatinas para repartir','all','reserve','pegatinas'),D('goal','Pegatinas por equipo','available','teams','pegatinas/equipo'));
    },
    'Cantidad inicial desconocida':(l,v)=>single(
      `Un juego termina con ${15+v} puntos. Antes de acabar se ganaron ${5+l}, y justo antes se habían perdido ${2+v}. ¿Con cuántos puntos empezó?`,
      {end:F('Puntos al terminar',15+v,'puntos'),gain:F('Última ganancia',5+l,'puntos'),loss:F('Pérdida anterior',2+v,'puntos')},'goal',V('flow','end','beforeGain','goal'),
      S('beforeGain','Puntos antes de ganar','end','gain','puntos'),A('goal','Puntos iniciales','beforeGain','loss','puntos')),
  };
  templates.primary={
    'Tarifa por unidad':(l,v)=>{
      const packs=3+v,total=packs*(5+l),count=6+v;
      return single(`${packs} kg de fruta cuestan ${total} €. El precio por kg se mantiene. ¿Cuánto cuestan ${count} kg?`,
        {old:F('Cantidad inicial',packs,'kg'),paid:F('Importe inicial',total,unit),wanted:F('Cantidad pedida',count,'kg')},
        'goal',V('rate','old','paid','wanted','goal'),D('rate','Precio por kg','paid','old','€/kg'),M('goal','Coste de la cantidad pedida','rate','wanted',unit));
    },
    'Reparto en razón':(l,v)=>{
      const a=2+l,b=1+v,total=(a+b)*(7+v);
      return single(`Dos grupos se reparten ${total} cuadernos según sus aportes. Al primero le corresponden ${a} partes iguales y al segundo ${b}. ¿Cuántos cuadernos recibe el primero?`,
        {all:F('Cuadernos para repartir',total,'cuadernos'),a:F('Partes del primer grupo',a,'partes'),b:F('Partes del segundo grupo',b,'partes')},
        'goal',V('share','all','parts','each'),A('parts','Partes en total','a','b','partes'),D('each','Cuadernos por parte','all','parts','cuadernos/parte'),M('goal','Cuadernos del primer grupo','each','a','cuadernos'));
    },
    'Reagrupar sin cambiar el total':(l,v)=>{
      const packages=4+v,each=6*l,size=3*l;
      const story=`Llegan ${packages} cajas con ${each} botellas cada una. Se ponen todas en bandejas de ${size} botellas. ¿Cuántas bandejas se llenan?`;
      const data={boxes:F('Cajas de origen',packages,'cajas'),each:F('Botellas por caja',each,'botellas/caja'),size:F('Botellas por bandeja',size,'botellas/bandeja')};
      const gather=P('reunir_y_reagrupar',M('total','Botellas recibidas','boxes','each','botellas'),D('goal','Bandejas llenas','total','size','bandejas'));
      const distribute=P('reagrupar_cada_caja',D('perBox','Bandejas completas que salen de cada caja','each','size','bandejas/caja'),
        M('goal','Bandejas llenas','perBox','boxes','bandejas'));
      return make(story,data,'goal',l===1?[gather]:[gather,distribute],V('groups','boxes','each','total'));
    },
    'Fracción de una cantidad':(l,v)=>{
      const denominator=3+l,total=denominator*(8+v),numerator=l;
      const story=`Hay ${total} litros en un depósito. Se usan ${numerator}/${denominator} del contenido inicial.`;
      const data={total:F('Contenido inicial',total,'L'),frac:F('Fracción que se usa',ratio(numerator,denominator),'del total')};
      const used=M('used','Litros usados','total','frac','L');
      if(l<3)return single(story+' ¿Cuántos litros quedan?',data,'goal',V('fraction','total','frac','used'),
        used,S('goal','Litros que quedan','total','used','L'));
      data.refill=F('Litros que se añaden',4+v,'L');
      return single(story+` Después se añaden ${4+v} litros. ¿Cuántos litros quedan en el depósito?`,
        data,'goal',V('fraction','total','frac','used'),used,S('balance','Litros antes de rellenar','total','used','L'),
        A('goal','Litros después de rellenar','balance','refill','L'));
    },
    'Comparación multiplicativa':(l,v)=>single(
      `En un intercambio, el grupo A entrega ${7+v} libros. B entrega ${2+l} veces esa cantidad y después retira ${3+v} de los que iba a entregar. ¿Cuántos libros entrega finalmente B?`,
      {a:F('Libros del grupo A',7+v,'libros'),factor:F('Factor de comparación',2+l,'veces'),return:F('Libros retirados por B',3+v,'libros')},
      'goal',V('flow','a','planned','goal'),M('planned','Libros previstos por B','a','factor','libros'),S('goal','Libros entregados por B','planned','return','libros')),
    'Dos subtotales independientes':(l,v)=>{
      const boxes=4+v,red=boxes*3,blue=7+v;
      const data={boxes:F('Cajas rojas',boxes,'cajas'),each:F('Lápices por caja roja',3,'lápices/caja'),blue:F('Lápices azules iniciales',blue,'lápices'),add:F('Lápices azules que llegan',l+2,'lápices')};
      return single(`Hay ${boxes} cajas con ${red/boxes} lápices rojos por caja y ${blue} lápices azules sueltos. Llegan otros ${l+2} azules. ¿Cuántos lápices hay de ambos colores?`,
        data,'goal',V('part','goal','red','newBlue'),M('red','Subtotal de lápices rojos','boxes','each','lápices'),A('newBlue','Subtotal de lápices azules','blue','add','lápices'),A('goal','Lápices de ambos colores','red','newBlue','lápices'));
    },
    'Coste y cambio con decimales':(l,v)=>{
      const bill=20+5*v,packs=2+l,price=l===1?'2,40':l===2?'2,65':'2,85';
      return single(`Se pagan con ${bill} € ${packs} cuadernos de ${price} € cada uno. ¿Cuánto cambio se recibe?`,
        {bill:F('Dinero entregado',bill,unit),packs:F('Cuadernos',packs,'cuadernos'),price:F('Precio por cuaderno',price,'€/cuaderno')},'goal',
        V('part','bill','spent','goal'),M('spent','Importe de los cuadernos','packs','price',unit),S('goal','Cambio','bill','spent',unit));
    },
    'Lectura de una tabla acumulada':(l,v)=>single(
      'La tabla muestra el total acumulado de préstamos al cierre de cada turno. ¿Cuántos préstamos hubo de media por turno entre el cierre del primer turno y el cierre del tercer turno?',
      {first:F('Acumulado tras el turno 1',10+v,'préstamos'),third:F('Acumulado tras el turno 3',24+v+2*l,'préstamos'),n:F('Turnos del 2 al 3, ambos incluidos',2,'turnos')},
      'goal',V('table','first','third'),S('period','Préstamos de los turnos 2 y 3','third','first','préstamos'),D('goal','Media por turno','period','n','préstamos/turno')),
  };
  templates.middle={
    'Descuento e impuesto sucesivos':(l,v)=>{
      const price=240+40*v,rates=[10,15,20],r=rates[l-1],tax=21;
      const story=`Una bicicleta cuesta ${price} €. Primero se aplica un descuento del ${r} % y luego, solo para este supuesto matemático, un impuesto del ${tax} % sobre el precio rebajado. ¿Cuál es el precio final?`;
      const data={price:F('Precio inicial',price,unit),r:F('Tasa de descuento',ratio(r,100),'del precio'),tax:F('Tasa de impuesto',ratio(tax,100),'del precio rebajado'),one:F('Precio completo',1,'del precio')};
      const amounts=P('importes_parciales',M('discount','Importe del descuento','price','r',unit),S('reduced','Precio rebajado','price','discount',unit),
        M('taxDue','Importe del impuesto','reduced','tax',unit),A('goal','Precio con descuento e impuesto','reduced','taxDue',unit));
      const factors=P('factores_equivalentes',S('pays','Fracción del precio que se paga','one','r','del precio'),A('taxed','Factor que incluye el impuesto','one','tax','del precio rebajado'),
        M('reduced','Precio rebajado','price','pays',unit),M('goal','Precio con descuento e impuesto','reduced','taxed',unit));
      return make(story,data,'goal',[amounts,factors],V('fraction','price','r','reduced'),null,['one']);
    },
    'Proporcionalidad inversa con pausa':(l,v)=>{
      const people=4+v,hours=6+l,newPeople=2*(4+v),pause=l===1?1:'1,5';
      return single(`${people} personas tardan ${hours} h en montar un escenario a ritmo constante. Esta vez trabajan ${newPeople} personas al mismo ritmo individual y después hacen una pausa de ${pause} h. ¿Cuánto dura el montaje con la pausa?`,
        {old:F('Equipo de referencia',people,'personas'),time:F('Duración de referencia',hours,'h'),now:F('Nuevo equipo',newPeople,'personas'),pause:F('Pausa',pause,'h')},'goal',
        V('rate','old','time','now','work'),M('effort','Trabajo total','old','time','persona·h'),D('work','Duración sin pausa','effort','now','h'),A('goal','Duración con pausa','work','pause','h'));
    },
    'Escala y conversión':(l,v)=>{
      const scale=25000*l,a='3,4',b=(18+v)/10;
      return single(`Un plano a escala 1:${scale} muestra dos tramos consecutivos de ${a} cm y ${String(b).replace('.',',')} cm. ¿Cuántos kilómetros suman en el terreno? Un kilómetro equivale a 100 000 cm.`,
        {a:F('Primer tramo del plano',a,'cm'),b:F('Segundo tramo del plano',b,'cm'),scale:F('Factor de escala',scale,'veces'),conv:F('Centímetros por kilómetro',100000,'cm/km')},'goal',
        V('rate','a','b','ground','goal'),A('map','Longitud total en el plano','a','b','cm'),M('ground','Longitud real en centímetros','map','scale','cm'),D('goal','Longitud real en kilómetros','ground','conv','km'));
    },
    'Distancia a dos ritmos':(l,v)=>{
      const speed=12+v,slower=6+l;
      return single(`En una salida en bicicleta se pedalea 1,5 h a ${speed} km/h y luego 0,5 h a ${slower} km/h. ¿Qué distancia se recorre?`,
        {v1:F('Velocidad en el tramo 1',speed,'km/h'),t1:F('Tiempo del tramo 1','1,5','h'),v2:F('Velocidad en el tramo 2',slower,'km/h'),t2:F('Tiempo del tramo 2','0,5','h')},'goal',
        V('table','v1','t1','v2','t2'),M('d1','Distancia del tramo 1','v1','t1','km'),M('d2','Distancia del tramo 2','v2','t2','km'),A('goal','Distancia recorrida','d1','d2','km'));
    },
    'Variación neta en una serie':(l,v)=>{
      const a=80+5*v,b=a+10*l,c=b-3*v-2;
      return single('La tabla registra asistentes a un ciclo de cine en tres semanas. Calcula por separado el cambio de la semana 1 a la 2 y de la 2 a la 3. ¿Cuál es el cambio neto entre el inicio y el final?',
        {a:F('Semana 1',a,'personas'),b:F('Semana 2',b,'personas'),c:F('Semana 3',c,'personas')},'goal',V('graph','a','b','c'),
        S('up','Cambio de la semana 1 a la 2','b','a','personas'),S('down','Cambio de la semana 2 a la 3','c','b','personas'),A('goal','Cambio neto de asistentes','up','down','personas'));
    },
    'Ecuación de una incógnita':(l,v)=>{
      const base=6+l,n=3+l,paid=base+n*(4+v);
      return single(`Una sala de ensayo cobra ${base} € de reserva y un mismo importe por hora. ${n} horas cuestan ${paid} € en total. ¿Cuál es el importe por hora?`,
        {base:F('Cuota de reserva',base,unit),n:F('Horas reservadas',n,'h'),paid:F('Importe total',paid,unit)},'goal',
        {...V('equation','paid','base','n'),relation:'Importe total = cuota de reserva + horas × importe por hora'},S('variable','Parte del importe correspondiente a las horas','paid','base',unit),D('goal','Importe por hora','variable','n','€/h'));
    },
    'Oferta fija frente a descuento':(l,v)=>{
      const p=50+10*v,rate=10*l,discount=7+2*l+v;
      return single(`Para el mismo abono de ${p} €, la oferta A descuenta un ${rate} % y la B descuenta ${discount} €. ¿Cuánto mayor o menor es el ahorro de A respecto de B? Escribe un valor negativo si A ahorra menos.`,
        {p:F('Precio del abono',p,unit),rate:F('Porcentaje de ahorro A',ratio(rate,100),'del precio'),b:F('Ahorro B',discount,unit)},'goal',
        V('table','p','rate','b'),M('a','Ahorro A','p','rate',unit),S('goal','Diferencia de ahorro A − B','a','b',unit));
    },
    'Presupuesto con partidas':(l,v)=>{
      const budget=250+20*v,n=4+v,fee=8+4*l;
      return single(`Tienes un presupuesto de ${budget} €. Compras ${n} entradas de 35 € y pagas ${fee} € de gestión por el pedido. ¿Cuánto dinero queda?`,
        {budget:F('Presupuesto',budget,unit),n:F('Entradas',n,'entradas'),price:F('Precio por entrada',35,'€/entrada'),fee:F('Gastos del pedido',fee,unit)},
        'goal',V('part','budget','cost','goal'),M('tickets','Coste de las entradas','n','price',unit),A('cost','Coste total del pedido','tickets','fee',unit),S('goal','Saldo tras el pedido','budget','cost',unit));
    },
    'Consumo por unidad y ahorro':(l,v)=>{
      const old=12+v,efficient=9+l;
      return single(`Dos equipos hacen 8 tareas. El primero consume ${old} Wh por tarea y el segundo ${efficient} Wh. ¿Cuánta energía se ahorra si se utiliza el segundo en vez del primero para las 8 tareas?`,
        {a:F('Consumo por tarea del primer equipo',old,'Wh/tarea'),b:F('Consumo por tarea del segundo equipo',efficient,'Wh/tarea'),n:F('Tareas',8,'tareas')},'goal',
        V('difference','b','saving','a'),S('saving','Ahorro por tarea','a','b','Wh/tarea'),M('goal','Ahorro total de energía','saving','n','Wh'));
    },
    'Capacidad con cupos reservados':(l,v)=>{
      const rows=8+v,seats=7+l,reserve=rows+2;
      return single(`En un evento hay ${rows} filas de ${seats} sillas. En cada fila se deja una silla libre para circulación y además se reservan ${reserve} lugares para el equipo. ¿Cuántos lugares quedan para público?`,
        {rows:F('Filas',rows,'filas'),seats:F('Sillas por fila',seats,'sillas/fila'),one:F('Silla libre por fila',1,'sillas/fila'),reserve:F('Sillas reservadas al equipo',reserve,'sillas')},'goal',
        V('groups','rows','usable','usableTotal'),S('usable','Sillas utilizables por fila','seats','one','sillas/fila'),M('usableTotal','Sillas utilizables','rows','usable','sillas'),S('goal','Sillas para público','usableTotal','reserve','sillas'));
    },
  };
  templates.teen={
    'Cruce de tarifas lineales':(l,v)=>{
      const fixedA=25+3*v,fixedB=10+v,rateA=8,rateB=11,h=7+v;
      const data={fa:F('Cuota fija A',fixedA,unit),fb:F('Cuota fija B',fixedB,unit),ra:F('Precio por hora A',rateA,'€/h'),rb:F('Precio por hora B',rateB,'€/h'),hours:F('Horas de alquiler',h,'h')};
      const story=`Alquilar un equipo cuesta ${fixedA} € fijos más ${rateA} €/h con A, y ${fixedB} € fijos más ${rateB} €/h con B. Para ${h} h, ¿cuánto ahorras con A? ¿A qué duración exacta cuestan lo mismo?`;
      const crossing=[S('fixedGap','Diferencia de cuotas fijas A − B','fa','fb',unit),S('rateGap','Diferencia horaria B − A','rb','ra','€/h'),D('cross','Duración con el mismo precio','fixedGap','rateGap','h')];
      const direct=P('costes_individuales',M('varA','Importe por horas en A','ra','hours',unit),M('varB','Importe por horas en B','rb','hours',unit),
        A('billA','Coste total de A','fa','varA',unit),A('billB','Coste total de B','fb','varB',unit),S('goal','Ahorro al elegir A','billB','billA',unit),...crossing);
      const difference=P('diferencias_lineales',...crossing,M('hourGap','Diferencia de importes por horas','rateGap','hours',unit),S('goal','Ahorro al elegir A','hourGap','fixedGap',unit));
      const intervals=P('interpolacion_de_dos_filas',...direct.steps.slice(0,6),
        A('change','Cambio total de la diferencia de precios entre las dos duraciones','fixedGap','goal',unit),
        D('slope','Cambio de la diferencia por cada hora (dos filas de la tabla)','change','hours','€/h'),
        D('cross','Duración con el mismo precio','fixedGap','slope','h'));
      return make(story,data,['goal','cross'],l===1?[difference,direct]:[difference,direct,intervals],{...V('equation','fa','ra','fb','rb','goal','cross'),relation:'Coste A = cuota A + precio A por hora × horas. Coste B = cuota B + precio B por hora × horas.'});
    },
    'Presupuesto con dos partidas variables':(l,v)=>{
      const p=420+20*v, n=5+l, m=3+v,c1=36,c2=18+l;
      return single(`Un grupo dispone de ${p} €. Compra ${n} entradas a ${c1} € y reserva ${m} equipos a ${c2} € cada uno. ¿Cuánto queda en el presupuesto?`,
        {p:F('Presupuesto',p,unit),n:F('Entradas',n,'entradas'),m:F('Equipos',m,'equipos'),c1:F('Precio por entrada',c1,'€/entrada'),c2:F('Precio por equipo',c2,'€/equipo')},'goal',
        V('part','p','cost','goal'),M('cA','Coste de entradas','n','c1',unit),M('cB','Coste de equipos','m','c2',unit),
        A('cost','Coste de ambas partidas','cA','cB',unit),S('goal','Saldo disponible','p','cost',unit));
    },
    'Sistema de entradas por eliminación':(l,v)=>{
      const n=20+2*v,cheap=6+l,dear=cheap+4+l,full=8+v,total=n*cheap+full*(dear-cheap);
      return single(`Se venden ${n} entradas a un concierto, algunas a ${cheap} € y el resto a ${dear} €. La recaudación es de ${total} €. ¿Cuántas entradas se vendieron al precio más alto?`,
        {n:F('Entradas vendidas',n,'entradas'),low:F('Precio reducido',cheap,'€/entrada'),high:F('Precio completo',dear,'€/entrada'),total:F('Recaudación',total,unit)},'goal',
        {...V('equation','n','low','high','total'),relation:'Entradas reducidas + entradas completas = entradas vendidas. La suma de ambos ingresos es la recaudación.'},M('baseline','Recaudación si todas fueran a precio reducido','n','low',unit),
        S('extra','Recaudación por encima de ese supuesto','total','baseline',unit),S('extraEach','Incremento por cada entrada de precio completo','high','low','€/entrada'),
        D('goal','Entradas vendidas al precio más alto','extra','extraEach','entradas'));
    },
    'Interés simple frente a comisión':(l,v)=>{
      const capital=500+100*v,rate=2+l,years=l+1,fee=4+v;
      return single(`Depositas ${capital} € durante ${years} años. El interés simple anual es del ${rate} % del importe inicial. Al final se cobra una única comisión de ${fee} €. ¿Cuál es la ganancia neta, sin contar el importe inicial?`,
        {money:F('Importe inicial',capital,unit),rate:F('Tasa aplicable cada año',ratio(rate,100),'fracción anual'),years:F('Duración',years,'años'),fee:F('Comisión final',fee,unit)},'goal',
        V('flow','money','annual','total','goal'),M('annual','Interés de un año','money','rate','€/año'),M('total','Interés total','annual','years',unit),
        S('goal','Ganancia neta','total','fee',unit));
    },
    'Optimización con unidades indivisibles':(l,v)=>{
      const max=310+30*v,fixed=18+3*l,n=34+3*l;
      return make(`Una feria tiene ${max} € para contratar puestos. Paga ${fixed} € por el permiso y cada puesto cuesta ${n} €. ¿Cuántos puestos completos puede contratar como máximo?`,
        {max:F('Presupuesto máximo',max,unit),fixed:F('Permiso',fixed,unit),n:F('Coste por puesto',n,'€/puesto')},'capacity',
        [P('limite_entero',S('balance','Importe disponible para puestos','max','fixed',unit),D('capacity','Cociente antes de elegir puestos completos','balance','n','puestos'))],
        V('share','balance','n','capacity'),{type:'floor',source:'capacity',label:'Número máximo de puestos completos',unit:'puestos',
          choices:['Tomar el entero inferior para respetar el presupuesto','Redondear al entero más próximo, aunque suba','Redondear siempre hacia arriba']});
    },
    'Tendencia relativa con base inicial':(l,v)=>{
      const a=40+10*v,b=a+2*l+3,c=a+5*l+5;
      const problem=single('La tabla muestra la asistencia de un taller a lo largo de tres meses. ¿En qué porcentaje cambió la asistencia del primer mes al tercero, respecto del primer mes?',
        {a:F('Mes 1',a,'personas'),b:F('Mes 2',b,'personas'),c:F('Mes 3',c,'personas'),scale:F('Unidades porcentuales de una unidad completa',100,'%')},'goal',V('graph','a','b','c'),
        S('change','Cambio en número de asistentes','c','a','personas'),D('rel','Cambio relativo a la asistencia inicial','change','a','del inicio'),
        M('goal','Cambio expresado en porcentaje','rel','scale','%'));
      problem.optional=['b'];
      return problem;
    },
    'Comparación normalizada de eficiencia':(l,v)=>{
      const a=140+20*v,b=120+20*l, outputA=10+v,outputB=15+l;
      return single(`Dos impresoras consumen ${a} Wh para ${outputA} páginas y ${b} Wh para ${outputB} páginas, respectivamente. ¿Cuántos Wh por página ahorra la segunda respecto de la primera? Da la diferencia exacta.`,
        {a:F('Energía de la primera',a,'Wh'),b:F('Energía de la segunda',b,'Wh'),oA:F('Páginas de la primera',outputA,'páginas'),oB:F('Páginas de la segunda',outputB,'páginas')},
        'goal',V('table','a','oA','b','oB'),D('rateA','Consumo por página de la primera','a','oA','Wh/página'),D('rateB','Consumo por página de la segunda','b','oB','Wh/página'),
        S('goal','Ahorro por página','rateA','rateB','Wh/página'));
    },
    'Viaje con reserva obligatoria':(l,v)=>{
      const budget=600+40*v,transport=95+5*l,food=100+10*l,night=65;
      const data={p:F('Presupuesto del viaje',budget,unit),t:F('Transporte total',transport,unit),r:F('Reserva para comida',food,unit),n:F('Precio por noche',night,'€/noche')};
      return make(`Para un viaje tienes ${budget} €. El transporte cuesta ${transport} € y debes reservar ${food} € para comida. El alojamiento cuesta ${night} € por noche. ¿Cuántas noches completas puedes pagar como máximo?`,
        data,'capacity',[P('primero_reservar',A('reserved','Importe destinado a transporte y comida','t','r',unit),S('balance','Presupuesto para alojamiento','p','reserved',unit),D('capacity','Noches antes de tomar la parte entera','balance','n','noches')),
          P('restas_sucesivas',S('afterTravel','Saldo tras pagar el transporte','p','t',unit),S('balance','Presupuesto para alojamiento','afterTravel','r',unit),D('capacity','Noches antes de tomar la parte entera','balance','n','noches'))],
        V('part','p','reserved','balance'),{type:'floor',source:'capacity',label:'Número máximo de noches completas',unit:'noches',
          choices:['Tomar el entero inferior y mantener la reserva de comida','Redondear al alza si sobran algunas décimas','Gastar la reserva de comida para sumar una noche']});
    },
    'Umbral para recuperar costes':(l,v)=>{
      const fee=100+20*v,cost=6+l,price=15+l;
      return make(`Lanzar una tirada de camisetas cuesta ${fee} € de diseño. Producir cada camiseta cuesta ${cost} € y se vende por ${price} €. Si solo produces lo que vendes, ¿cuántas debes vender como mínimo para cubrir todos los costes?`,
        {fee:F('Coste fijo de diseño',fee,unit),cost:F('Coste por camiseta',cost,'€/camiseta'),price:F('Precio de venta',price,'€/camiseta')},'threshold',
        [P('margen_unitario',S('margin','Margen por camiseta','price','cost','€/camiseta'),D('threshold','Umbral antes de redondear','fee','margin','camisetas'))],
        {...V('equation','fee','price','cost','margin'),relation:'Ingresos = precio × ventas. Costes = coste fijo + coste por camiseta × ventas.'},{type:'ceil',source:'threshold',label:'Ventas mínimas para cubrir los costes',unit:'camisetas',
          choices:['Tomar el entero superior para alcanzar el umbral','Tomar el entero inferior para vender menos','Tomar siempre el entero más próximo']});
    },
    'Decisión con dos restricciones simultáneas':(l,v)=>{
      const supplies=42+6*v,battery=65+6*l,per=6,minutes=10+v;
      return make(`Un equipo prepara demostraciones. Tiene ${supplies} muestras y ${battery} minutos de batería. Cada demostración consume ${per} muestras y ${minutes} minutos. ¿Cuántas demostraciones completas puede realizar respetando ambos límites?`,
        {s:F('Muestras disponibles',supplies,'muestras'),b:F('Batería disponible',battery,'min'),p:F('Muestras por demostración',per,'muestras/demostración'),t:F('Minutos por demostración',minutes,'min/demostración')},
        ['supplyLimit','timeLimit'],[P('dos_limites',D('supplyLimit','Límite según las muestras','s','p','demostraciones'),D('timeLimit','Límite según la batería','b','t','demostraciones'))],
        V('table','s','b','p','t','supplyLimit','timeLimit'),{type:'minimum',label:'Máximo de demostraciones completas',unit:'demostraciones',
          choices:['Tomar el entero inferior del menor de los dos límites','Usar el mayor de los dos límites','Sumar ambos límites porque los recursos son diferentes']});
    },
  };
  const domains={junior:'division',primary:'division',middle:'middleMath',teen:'teenMath'};
  const extra={
    junior:['El ejercicio ocurre un martes. En el aula hay 2 ventanas.','Ventanas del aula',2,'ventanas'],
    primary:['La actividad se organiza en la sala 4.','Número de sala',4,'sala'],
    middle:['El aviso se publicó a las 18:00.','Hora de publicación',18,'h'],
    teen:['El formulario de la actividad tiene 4 páginas.','Páginas del formulario',4,'páginas'],
  };
  function generate(age,level,family,variant){
    const families=templates[age], familyName=families&&Object.keys(families)[family];
    if(!familyName||![1,2,3].includes(level)||![0,1,2].includes(variant))return null;
    const p=families[familyName](level,variant);
    p.goals=Array.isArray(p.goal)?p.goal:[p.goal];
    delete p.goal;
    if(level===3){
      const [sentence,label,value,unit]=extra[age];
      p.story+=' '+sentence;
      p.data.distractor=F(label,value,unit);
    }
    p.family=familyName;
    p.complexity={dependency:'grafo',distractors:level===3?1:0,
      guidance:['visible','optional','autonomous'][level-1],justification:level===3||Boolean(p.interpretation)};
    const id=['math-problem-v2',age,level,family,variant].join(':');
    const euro=p.story.includes('€');
    const stimulus=[{type:'text',text:euro?'En este ejemplo, los importes se expresan en euros. '+p.story:p.story}];
    delete p.story;
    return {id,contentKey:id,domain:domains[age],level,type:'mathProblem',responseType:'staged',requiresStimulus:true,
      printable:'interactive-only',topic:'Resolución de problemas',q:'Resuelve el problema paso a paso.',stimulus,problem:p,ageRoute:age,
      primaryConstruct:'mathematicalProblemSolving',mechanic:'math_problem_steps',mathVersion:2,
      ...(euro?{currencyContext:'foreign'}:{}),
      qualityDescriptor:{semanticFamily:'math.problem_steps.'+family,scenarioFamily:'math.'+age+'.'+family},
      difficultyProfile:{level,operations:Math.min(...p.paths.map(route=>route.steps.length))}};
  }
  const cache=new Map();
  function pool(age,domain,level){
    if(domains[age]!==domain||!templates[age]||![1,2,3].includes(level))return [];
    const key=age+level;
    if(!cache.has(key)){
      const bank=Object.keys(templates[age]).flatMap((_,i)=>[0,1,2].map(v=>generate(age,level,i,v)));
      for(const item of bank)validateGraph(item.problem);
      cache.set(key,bank);
    }
    return structuredClone(cache.get(key));
  }
  const sameValue=(op,left,right,node)=>op===node.op&&
    (left===node.left&&right===node.right||['add','multiply'].includes(op)&&right===node.left&&left===node.right);
  function solution(p,known){
    if(!p.interpretation)return p.goals.map(id=>({id,...known[id]}));
    const rule=p.interpretation;
    const values=(rule.source?[rule.source]:p.goals).map(id=>known[id].value);
    const v=values.map(([n,d])=>n/d);
    const answer=rule.type==='ceil'?Math.ceil(v[0]):Math.floor(Math.min(...v));
    return [{id:'interpretation',label:rule.label,unit:rule.unit,value:ratio(answer)}];
  }
  const unitAliases={
    'bolsas':'bolsa',equipos:'equipo',cajas:'caja',bandejas:'bandeja',partes:'parte',turnos:'turno',
    entradas:'entrada',cuadernos:'cuaderno',filas:'fila',tareas:'tarea',personas:'persona',
    años:'año',puestos:'puesto',páginas:'página',noches:'noche',camisetas:'camiseta',demostraciones:'demostración'
  };
  function dimension(unit){
    if(unit.startsWith('del ')||unit==='veces'||unit==='%')return {};
    if(unit==='fracción anual')return {'año':-1};
    const [top,bottom]=unit.split('/'), result={};
    for(const [column,power] of [[top,1],[bottom,-1]])for(const part of (column||'').split('·').filter(Boolean)){
      const key=unitAliases[part]||part;
      result[key]=(result[key]||0)+power;
    }
    return result;
  }
  const sameDimensions=(a,b)=>[...new Set([...Object.keys(a),...Object.keys(b)])].every(key=>(a[key]||0)===(b[key]||0));
  function validUnits(op,a,b,output){
    const left=dimension(a),right=dimension(b),target=dimension(output);
    if(op==='add'||op==='subtract')return sameDimensions(left,right)&&sameDimensions(left,target);
    for(const key of Object.keys(right))left[key]=(left[key]||0)+(op==='multiply'?right[key]:-right[key]);
    return sameDimensions(left,target);
  }
  function validateDiagram(model,known){
    const values=model.refs.map(id=>known[id]?.value);
    if(model.type==='fraction'&&values[1]&&(values[1][0]<0||values[1][0]>values[1][1]))throw Error('Fracción visual fuera del total.');
    if(values.length!==3||!values.every(Boolean))return;
    const [a,b,c]=values;
    if(model.type==='part'&&!eq(a,calculate('add',b,c)))throw Error('El todo no coincide con sus partes.');
    if(model.type==='difference'&&!eq(c,calculate('add',a,b)))throw Error('Diferencia visual no válida.');
    if(model.type==='groups'&&!eq(c,calculate('multiply',a,b)))throw Error('Los grupos no representan el total.');
  }
  function validateGraph(p){
    const start=Object.keys(p.data);
    const validFact=f=>f?.label&&f.unit&&Array.isArray(f.value)&&eq(f.value,ratio(...f.value));
    if(!start.every(id=>validFact(p.data[id]))||!p.paths.length||!p.goals.length||new Set(p.paths.map(r=>r.id)).size!==p.paths.length)throw Error('Datos matemáticos incompletos.');
    const comparable=new Map();
    let previous=null;
    for(const route of p.paths){
      const known={...p.data}, from=new Map();
      for(const op of route.steps){
        const {id,left,right,label,unit}=op;
        if(!Object.hasOwn(operators,op.op)||known[id]||!known[left]||!known[right]||!label||!unit)throw Error('Dependencia no válida.');
        if(!validUnits(op.op,known[left].unit,known[right].unit,unit))throw Error('Unidades incompatibles: '+label);
        const value=calculate(op.op,known[left].value,known[right].value);
        known[id]={value,label,unit};
        from.set(id,op);
        const key=[id,op.op,...(['add','multiply'].includes(op.op)?[left,right].sort():[left,right])].join('|');
        if(comparable.has(key)&&!eq(comparable.get(key),value))throw Error('Un paso ambiguo tiene resultados distintos.');
        comparable.set(key,value);
      }
      const needed=new Set();
      const visit=id=>{
        if(needed.has(id))return;
        needed.add(id);
        const op=from.get(id);
        if(op){visit(op.left);visit(op.right);}
      };
      p.goals.forEach(visit);
      if(!p.goals.every(id=>from.has(id))||route.steps.some(op=>!needed.has(op.id)))throw Error('La estrategia contiene pasos irrelevantes.');
      if(start.some(id=>id!=='distractor'&&!p.optional.includes(id)&&!needed.has(id)))
        throw Error('Hay datos etiquetados como necesarios que no se usan.');
      validateDiagram(p.model,known);
      const rule=p.interpretation;
      if(rule&&(!['floor','ceil','minimum'].includes(rule.type)||rule.source&&!p.goals.includes(rule.source)||
        rule.choices.length!==3||p.goals.some(id=>known[id].unit!==rule.unit||known[id].value[0]<0)))
        throw Error('Interpretación fuera de las restricciones.');
      const actual=[...p.goals.map(id=>known[id].value),...solution(p,known).map(f=>f.value)];
      if(previous&&!previous.every((x,i)=>eq(x,actual[i])))throw Error('Las estrategias no convergen.');
      previous=actual;
    }
    if(!p.model.refs.every(id=>start.includes(id)||p.paths.some(route=>route.steps.some(op=>op.id===id))))
      throw Error('Un apoyo utiliza una cantidad sin definir.');
    return previous;
  }
  function validate(item,age){
    const [id,source,level,family,variant,extra]=String(item?.contentKey).split(':');
    const original=id==='math-problem-v2'&&source===age&&extra===undefined&&generate(age,Number(level),Number(family),Number(variant));
    if(!original)throw Error('Problema R19.1 no válido.');
    const locales=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
    const canonical=item.localization?locales.localizeItem(original,item.localization.locale,item.domain):original;
    for(const key of ['id','contentKey','domain','level','type','responseType','ageRoute','currencyContext','mathVersion','mechanic','primaryConstruct','q','stimulus','problem','qualityDescriptor','printable','requiresStimulus'])
      if(JSON.stringify(item[key])!==JSON.stringify(canonical[key]))throw Error('Contrato matemático alterado: '+key);
    if(item.difficultyProfile?.level!==canonical.difficultyProfile.level)throw Error('Nivel matemático alterado.');
    validateGraph(item.problem);
    return true;
  }
  function start(problem){
    const {distractor,...available}=problem.data;
    return {available,paths:problem.paths,used:[]};
  }
  function ready(state){
    const complete=new Set(state.used.map(node=>node.id));
    return state.paths.flatMap(route=>route.steps.filter(op=>!complete.has(op.id)&&
      Object.hasOwn(state.available,op.left)&&Object.hasOwn(state.available,op.right)));
  }
  function goals(state){
    return [...new Map(state.paths.flatMap(route=>route.steps).filter(op=>!state.used.some(n=>n.id===op.id)).map(op=>[op.id,op])).values()];
  }
  function check(state,goal,op,left,right){
    const nodes=ready(state);
    const node=nodes.find(n=>n.id===goal&&sameValue(op,left,right,n));
    if(node)return {kind:'valid',node,expected:calculate(op,state.available[left].value,state.available[right].value)};
    if(goals(state).some(n=>n.id===goal&&sameValue(op,left,right,n)))return {kind:'order'};
    const a=state.available[left],b=state.available[right];
    if(a&&b&&Object.hasOwn(operators,op)&&!(op==='divide'&&!b.value[0])){
      const value=calculate(op,a.value,b.value);
      const coincides=nodes.some(n=>n.id===goal&&validUnits(op,a.unit,b.unit,n.unit)&&
        eq(value,calculate(n.op,state.available[n.left].value,state.available[n.right].value)));
      if(coincides)return {kind:'unverifiable'};
    }
    return {kind:'operation'};
  }
  function checkExpression(state,goal,expression){
    const match=expression.match(/^\s*(-?\d+(?:[.,]\d+)?(?:\/\d+)?)\s*([+×*÷/−-])\s*(-?\d+(?:[.,]\d+)?(?:\/\d+)?)\s*$/);
    if(!match)return {kind:'unverifiable'};
    const op={'+':'add','−':'subtract','-':'subtract','×':'multiply','*':'multiply','÷':'divide','/':'divide'}[match[2]];
    const lhs=parse(match[1]),rhs=parse(match[3]);
    for(const [left,a] of Object.entries(state.available))if(eq(a.value,lhs))
      for(const [right,b] of Object.entries(state.available))if(eq(b.value,rhs)){
        const result=check(state,goal,op,left,right);
        if(result.kind==='valid')return result;
      }
    return {kind:'unverifiable'};
  }
  function advance(state,node,expected){
    state.paths=state.paths.filter(route=>route.steps.some(op=>op.id===node.id&&sameValue(node.op,node.left,node.right,op)));
    state.available[node.id]=F(node.label,expected,node.unit);
    state.used.push(node);
  }
  const api={pool,validate,validateGraph,generate,operators,names,ratio,parse,format,eq,calculate,start,ready,goals,check,checkExpression,advance,solution};
  root.MathSequencing=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

// Representative, source-neutral service fixtures, not the live Supabase bank.
(function(root){
  const tasks=[
    ['reading','La chaqueta está junto al ordenador.','¿Dónde está la chaqueta?','Junto al ordenador',['En la piscina','Junto al frigorífico']],
    ['attention','Modelo: el bolígrafo. Busca el objeto igual.','¿Qué objeto es igual al modelo?','El bolígrafo',['El lápiz','El cuaderno']],
    ['executive','Antes de salir de la piscina, recoge el bañador y las chanclas.','¿Qué debes recoger?','El bañador y las chanclas',['El ordenador','El frigorífico']],
    ['memory','Ana guarda el bolígrafo. Sol guarda la chaqueta.','¿Qué guarda Ana?','El bolígrafo',['La chaqueta','El bañador']],
    ['speedReasoning','En la cesta hay una patata y una manzana.','¿Qué puede ir con estos alimentos?','Una zanahoria',['Un ordenador','Un bolígrafo']],
    ['applied','El grifo ya está abierto y el vaso está lleno.','¿Qué puedes hacer ahora?','Cerrar el grifo',['Abrir el frigorífico','Buscar el ordenador']],
    ['language','Ana guarda el bolígrafo en el estuche.','¿Qué guarda Ana?','El bolígrafo',['La chaqueta','El bañador']],
    ['division','Hay dos bolígrafos en la mesa y uno en el estuche.','¿Cuántos bolígrafos hay en total?','3',['2','4']],
    ['reading','Ana guarda el ticket de compra junto al ordenador.','¿Qué guarda Ana?','El ticket de compra',['El bañador','La chaqueta']],
    ['applied','El equipo juega al baloncesto. Ana bebe un zumo después.','¿Qué bebe Ana?','Un zumo',['Un plato de patatas','Una manzana']],
  ];
  function fixtures(domains){
    return (domains||tasks.map(t=>t[0])).map((domain,i)=>{
      if(domain==='english')return {id:'locale-remote-'+i,domain,type:'standard',scenario:'The pencil is on the table.',q:'¿Dónde está el lápiz?',opts:['On the table','In the bag','On the chair'],a:'On the table',why:'La frase dice que el lápiz está en la mesa.'};
      const t=tasks.find((t,j)=>j===i&&t[0]===domain)||tasks.find(t=>t[0]===domain)||tasks[i%tasks.length];
      return {id:'locale-remote-'+i,domain,type:'standard',requiresStimulus:true,scenario:t[1],q:t[2],opts:[t[3],...t[4]],a:t[3],why:t[1],topic:'Una actividad cotidiana',contentKey:'source-'+i};
    });
  }
  root.localeFixtures=fixtures;
  if(typeof module!=='undefined')module.exports=fixtures;
})(typeof window==='undefined'?globalThis:window);

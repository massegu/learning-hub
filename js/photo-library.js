(function(root){
'use strict';
// AI-generated photographs, individually inspected against these factual keys.
// Alternative text is deliberately neutral during recall; facts are not shown.
const fact=(q,a,wrong,detail)=>({q,a,opts:[a,...wrong],detail});
const scenes={
 kitchen:{title:'Escena cotidiana en una cocina',width:1448,height:1086,path:'assets/photos/kitchen-a.png',
  facts:[
   fact('¿De qué color era la taza?','Roja',['Verde','Azul','Amarilla'],'La taza era roja.'),
   fact('¿De qué color era el cuaderno?','Azul',['Rojo','Verde','Naranja'],'El cuaderno era azul.'),
   fact('¿De qué color era la mochila?','Amarilla',['Morada','Roja','Azul'],'La mochila era amarilla.'),
   fact('¿Cuántas manzanas había en el plato?','Tres',['Dos','Cuatro','Una'],'Había tres manzanas en el plato.'),
   fact('¿De qué color eran las manzanas?','Verdes',['Rojas','Amarillas','Moradas'],'Las manzanas eran verdes.'),
   fact('¿Dónde estaba la mochila?','En el respaldo de la silla',['Debajo de la mesa','Sobre el plato','En la ventana'],'La mochila estaba en el respaldo de la silla.'),
   fact('¿Qué había delante de la taza?','Una cuchara',['Un tenedor','Una llave','Un lápiz'],'Había una cuchara delante de la taza.'),
   fact('¿Dónde estaba la planta?','En la ventana',['En el suelo','Sobre el cuaderno','Debajo de la silla'],'La planta estaba en la ventana.'),
   fact('¿Qué había en el centro de la mesa?','Un cuaderno',['Una mochila','Una planta','Un reloj'],'El cuaderno estaba en el centro de la mesa.'),
   fact('¿Qué había a la derecha del cuaderno?','Un plato con manzanas',['Una taza','Una lámpara','Una mochila'],'El plato con manzanas estaba a la derecha del cuaderno.'),
   fact('¿Estaba abierto o cerrado el cuaderno?','Cerrado',['Abierto por la mitad','Abierto por la primera página','No había cuaderno'],'El cuaderno estaba cerrado.'),
   fact('¿Qué objeto estaba a la izquierda del cuaderno?','La taza',['El plato','La planta','La mochila'],'La taza estaba a la izquierda del cuaderno.')
  ]},
 living:{title:'Escena cotidiana en un salón',width:1448,height:1086,path:'assets/photos/living-a.png',
  facts:[
   fact('¿Cuántos cojines había en el sofá?','Dos',['Tres','Uno','Cuatro'],'Había dos cojines en el sofá.'),
   fact('¿De qué color era el cojín de la izquierda?','Amarillo',['Morado','Rojo','Verde'],'El cojín de la izquierda era amarillo.'),
   fact('¿De qué color era el cojín de la derecha?','Rojo',['Azul','Amarillo','Morado'],'El cojín de la derecha era rojo.'),
   fact('¿De qué color era el sofá?','Azul',['Verde','Rojo','Gris'],'El sofá era azul.'),
   fact('¿De qué color era el libro?','Verde',['Rojo','Amarillo','Azul'],'El libro era verde.'),
   fact('¿Qué había a la derecha del libro?','Un vaso de agua',['Una taza','Un plato','Una mochila'],'Había un vaso de agua a la derecha del libro.'),
   fact('¿Dónde estaba la lámpara de pie?','A la izquierda del sofá',['Detrás del cuadro','Sobre la mesa','A la derecha del sofá'],'La lámpara de pie estaba a la izquierda del sofá.'),
   fact('¿Dónde estaba el balón?','En el suelo, a la derecha del sofá',['Sobre el sofá','Debajo del libro','En la mesa'],'El balón estaba en el suelo, a la derecha del sofá.'),
   fact('¿Qué paisaje mostraba el cuadro?','Montañas',['Una ciudad','Una playa','Un desierto'],'El cuadro mostraba montañas.'),
   fact('¿De qué color era el balón?','Naranja',['Azul','Verde','Morado'],'El balón era naranja, con partes oscuras.'),
   fact('¿Qué había sobre la mesa?','Un libro y un vaso',['Dos libros','Una taza y un plato','Un balón y un vaso'],'Sobre la mesa había un libro y un vaso.'),
   fact('¿Estaba abierto o cerrado el libro?','Cerrado',['Abierto por la mitad','Abierto por la primera página','No había libro'],'El libro estaba cerrado.')
  ]}
};
const pairs={
 kitchen:{sceneId:'kitchen',path:'assets/photos/kitchen-b.png',regions:{'La taza':[7,46,18,23],'El cuaderno':[31,54,28,20],'La mochila':[35,20,22,32],'Las manzanas':[66,53,28,25],'La cuchara':[9,69,23,15],'La planta':[70,5,17,24]},changes:[['La taza','De roja a verde'],['El cuaderno','De azul a naranja'],['La mochila','De amarilla a morada']],unchanged:['Las manzanas','La cuchara','La planta']},
 living:{sceneId:'living',path:'assets/photos/living-b.png',regions:{'El cojín de la izquierda':[20,35,19,21],'El libro':[27,65,18,12],'El balón':[90,61,10,16],'El cojín de la derecha':[62,35,21,21],'El vaso':[63,59,7,12],'La lámpara':[4,6,18,17]},changes:[['El cojín de la izquierda','De amarillo a morado'],['El libro','De verde a rojo'],['El balón','De naranja a azul']],unchanged:['El cojín de la derecha','El vaso','La lámpara']}
};
// Object counts and spatial relations checked against each complete source image.
Object.assign(scenes,{
 desk:{title:'Un escritorio de estudio',width:1448,height:1086,path:'assets/photos/desk-a.png',facts:[
  fact('¿De qué color era el cuaderno?','Verde',['Azul','Naranja','Rojo'],'El cuaderno era verde.'),
  fact('¿De qué color era el estuche?','Rojo',['Morado','Amarillo','Azul'],'El estuche era rojo.'),
  fact('¿Cuántos lápices había en el vaso?','Tres',['Dos','Cuatro','Cinco'],'Había tres lápices amarillos en el vaso blanco.'),
  fact('¿Dónde estaba el estuche respecto al cuaderno?','A su izquierda',['A su derecha','Encima','Debajo'],'El estuche estaba a la izquierda del cuaderno.'),
  fact('¿Qué había delante del cuaderno?','Un llavero con dos llaves',['Un teléfono','Unas gafas','Una regla'],'Delante del cuaderno había un llavero con dos llaves.'),
  fact('¿De qué color era la mochila de la silla?','Azul',['Roja','Amarilla','Verde'],'La mochila de la silla era azul.'),
  fact('¿Dónde estaba el vaso con lápices respecto al cuaderno?','A su derecha',['A su izquierda','Debajo','Encima'],'El vaso con lápices estaba a la derecha del cuaderno.'),
  fact('¿Cuántas llaves había en el llavero?','Dos',['Tres','Una','Cuatro'],'Había dos llaves metálicas en el llavero.')
 ]},
 picnic:{title:'Un pícnic junto al lago',width:1448,height:1086,path:'assets/photos/picnic-a.png',facts:[
  fact('¿De qué color era la botella?','Azul',['Verde','Roja','Amarilla'],'La botella era azul.'),
  fact('¿De qué color era la manta?','Roja',['Azul','Verde','Morada'],'La manta era roja.'),
  fact('¿Cuántas naranjas había en el plato?','Tres',['Dos','Cuatro','Cinco'],'Había tres naranjas en un plato blanco.'),
  fact('¿Dónde estaba el plato respecto a la cesta?','A su derecha',['A su izquierda','Dentro','Debajo'],'El plato estaba a la derecha de la cesta.'),
  fact('¿Qué había delante de la cesta?','Unas gafas negras',['Un llavero','Un cuaderno','Una gorra'],'Había unas gafas negras delante de la cesta.'),
  fact('¿De qué color era la fiambrera?','Amarilla',['Morada','Roja','Azul'],'La fiambrera era amarilla.'),
  fact('¿Dónde estaba la botella respecto a la cesta?','A su izquierda',['A su derecha','Dentro','Detrás'],'La botella estaba a la izquierda de la cesta.'),
  fact('¿De qué color era la tela de la cesta?','Blanca',['Azul','Roja','Verde'],'La tela que colgaba del borde de la cesta era blanca.')
 ]},
 market:{title:'Un puesto de mercado',width:1448,height:1086,path:'assets/photos/market-a.png',facts:[
  fact('¿De qué color era la bolsa?','Amarilla',['Morada','Azul','Verde'],'La bolsa del centro era amarilla.'),
  fact('¿Cuántos pimientos había?','Dos',['Tres','Cuatro','Uno'],'Había dos pimientos rojos en la cesta izquierda.'),
  fact('¿Cuántas manzanas había?','Tres',['Dos','Cuatro','Cinco'],'Había tres manzanas verdes en la cesta derecha.'),
  fact('¿De qué color era el monedero?','Azul',['Rojo','Verde','Amarillo'],'El monedero era azul.'),
  fact('¿Dónde estaba el monedero respecto a la bolsa?','Delante',['Detrás','Dentro','Encima'],'El monedero estaba delante de la bolsa.'),
  fact('¿De qué color eran los pimientos?','Rojos',['Amarillos','Verdes','Naranjas'],'Los dos pimientos eran rojos.'),
  fact('¿Dónde estaban las manzanas respecto a la bolsa?','A su derecha',['A su izquierda','Dentro','Delante'],'Las manzanas estaban a la derecha de la bolsa.'),
  fact('¿De qué colores eran las rayas del toldo?','Verde y blanco',['Rojo y blanco','Azul y amarillo','Verde y rojo'],'El toldo tenía rayas verdes y blancas.')
 ]},
 entry:{title:'La entrada de una casa',width:1448,height:1086,path:'assets/photos/entry-a.png',facts:[
  fact('¿De qué color era la mochila?','Azul',['Roja','Verde','Amarilla'],'La mochila era azul.'),
  fact('¿Cuántas zapatillas había en el suelo?','Dos',['Una','Tres','Cuatro'],'Había dos zapatillas rojas en el suelo.'),
  fact('¿De qué color era el paraguas?','Amarillo',['Morado','Verde','Azul'],'El paraguas era amarillo.'),
  fact('¿Dónde estaba la mochila?','Sobre el banco, a la izquierda',['Debajo del banco','Sobre el espejo','Junto al paraguas'],'La mochila estaba sobre la parte izquierda del banco.'),
  fact('¿Dónde estaban las llaves?','En un cuenco verde',['En la mochila','Sobre las zapatillas','En el paragüero'],'Las llaves estaban en un cuenco verde sobre la repisa.'),
  fact('¿Qué había encima del banco en la pared?','Un espejo rectangular',['Un cuadro redondo','Un reloj','Un mapa'],'Había un espejo rectangular encima del banco.'),
  fact('¿Dónde estaban las zapatillas respecto al banco?','En el suelo, a su derecha',['Encima, a su izquierda','Debajo del centro','En el suelo, a su izquierda'],'Las zapatillas estaban en el suelo, a la derecha del banco.'),
  fact('¿De qué color era el cuenco de las llaves?','Verde',['Naranja','Rojo','Azul'],'El cuenco de las llaves era verde.')
 ]}
});
// Additional sources were visually inspected after generation; questions refer
// only to objects and relations visible in the actual final photographs.
Object.assign(scenes,{
 street:{title:'Un paseo por una calle',width:1448,height:1086,path:'assets/photos/street-a.png',facts:[
  fact('¿De qué color era la chaqueta de la persona con mochila?','Roja',['Azul','Verde','Morada'],'La persona con mochila llevaba una chaqueta roja.'),
  fact('¿De qué color era la mochila?','Azul',['Roja','Amarilla','Verde'],'La mochila era azul.'),
  fact('¿De qué color era el abrigo de la otra persona?','Amarillo',['Verde','Rojo','Morado'],'La otra persona llevaba un abrigo amarillo.'),
  fact('¿De qué color era el coche aparcado?','Rojo',['Azul','Verde','Blanco'],'El coche aparcado era rojo.'),
  fact('¿Dónde estaba la bicicleta?','Junto a la tienda, a la derecha',['En el centro de la calle','Detrás de las dos personas','En la acera izquierda'],'La bicicleta estaba junto a la tienda, a la derecha.'),
  fact('¿Qué colores tenía el toldo?','Verde y blanco',['Rojo y blanco','Azul y amarillo','Verde y rojo'],'El toldo tenía rayas verdes y blancas.'),
  fact('¿Cuántas personas caminaban juntas en primer plano?','Dos',['Tres','Una','Cuatro'],'Dos personas caminaban juntas por la acera izquierda.'),
  fact('¿Qué había en el escaparate de la derecha?','Pan',['Libros','Zapatos','Herramientas'],'En el escaparate de la derecha había pan.')
 ]},
 park:{title:'Una tarde en el parque',width:1448,height:1086,path:'assets/photos/park-a.png',facts:[
  fact('¿De qué color era el jersey de la persona sentada?','Amarillo',['Rojo','Verde','Morado'],'La persona sentada llevaba un jersey amarillo.'),
  fact('¿De qué color era la bicicleta?','Roja',['Azul','Amarilla','Verde'],'La bicicleta era roja.'),
  fact('¿De qué color era la botella del primer plano?','Azul',['Roja','Verde','Morada'],'La botella del primer plano era azul.'),
  fact('¿Dónde estaba la mochila verde?','En el suelo junto al banco',['Sobre la bicicleta','En el camino del fondo','Sobre el árbol'],'La mochila verde estaba en el suelo junto al banco.'),
  fact('¿Cuántas personas paseaban juntas al fondo?','Dos',['Una','Tres','Cuatro'],'Dos personas paseaban juntas al fondo.'),
  fact('¿De qué color era la pelota?','Naranja',['Azul','Roja','Verde'],'La pelota del primer plano era naranja.'),
  fact('¿Dónde estaba la bicicleta respecto al banco?','A la derecha',['A la izquierda','Debajo','Encima'],'La bicicleta estaba a la derecha del banco.'),
  fact('¿Qué prendas llevaban las dos personas del fondo?','Una chaqueta roja y una azul',['Dos chaquetas rojas','Una chaqueta amarilla y una verde','Dos chaquetas azules'],'Las dos personas del fondo llevaban una chaqueta roja y otra azul.')
 ]},
 bus:{title:'El interior de un autobús',width:1448,height:1086,path:'assets/photos/bus-a.png',facts:[
  fact('¿De qué color era la mochila?','Roja',['Morada','Azul','Amarilla'],'La mochila era roja.'),
  fact('¿De qué color eran las barras para agarrarse?','Amarillas',['Rojas','Azules','Verdes'],'Las barras para agarrarse eran amarillas.'),
  fact('¿De qué color era el paraguas?','Verde',['Azul','Rojo','Amarillo'],'El paraguas era verde.'),
  fact('¿Dónde estaba la mochila?','En el asiento de la izquierda',['En el asiento de la derecha','En el pasillo','En el exterior'],'La mochila estaba en el asiento de la izquierda.'),
  fact('¿De qué color era la bufanda?','Amarilla',['Roja','Azul','Morada'],'La bufanda era amarilla.'),
  fact('¿Qué había junto a la bufanda?','Un paraguas',['Una mochila','Un balón','Una maleta'],'Había un paraguas junto a la bufanda.'),
  fact('¿De qué color era la tapicería de los asientos?','Azul',['Roja','Verde','Gris'],'La tapicería de los asientos era azul.'),
  fact('¿Qué se veía por las ventanas laterales?','Árboles',['Una playa','Un túnel','Montañas nevadas'],'Se veían árboles por las ventanas laterales.')
 ]},
 factory:{title:'Un taller de bicicletas',width:1448,height:1086,path:'assets/photos/factory-a.png',facts:[
  fact('¿De qué color era la caja de herramientas?','Roja',['Verde','Azul','Amarilla'],'La caja de herramientas era roja.'),
  fact('¿De qué color era el cuadro de la bicicleta?','Azul',['Rojo','Verde','Amarillo'],'El cuadro de la bicicleta era azul.'),
  fact('¿De qué color era el casco del trabajador?','Azul',['Naranja','Rojo','Verde'],'El casco del trabajador era azul.'),
  fact('¿Cuántas ruedas había colgadas en la pared?','Dos',['Una','Tres','Cuatro'],'Había dos ruedas colgadas en la pared.'),
  fact('¿De qué color era el chaleco del trabajador?','Amarillo',['Rojo','Azul','Morado'],'El chaleco del trabajador era amarillo.'),
  fact('¿Dónde estaban las cajas de cartón?','A la derecha del trabajador',['Sobre la bicicleta','Bajo las ruedas de la pared','Sobre la caja de herramientas'],'Las cajas de cartón estaban a la derecha del trabajador.'),
  fact('¿Qué sostenía el trabajador?','Una carpeta con pinza',['Una rueda','Un casco','Una caja roja'],'El trabajador sostenía una carpeta con pinza.'),
  fact('¿Dónde estaba la caja de herramientas?','Sobre la mesa de la izquierda',['En el suelo a la derecha','Sobre una silla','En la bicicleta'],'La caja de herramientas estaba sobre la mesa de la izquierda.')
 ]},
 nature:{title:'Un campamento en la montaña',width:1448,height:1086,path:'assets/photos/nature-a.png',facts:[
  fact('¿De qué color era la tienda de campaña?','Amarilla',['Azul','Roja','Verde'],'La tienda de campaña era amarilla.'),
  fact('¿De qué color era la mochila?','Roja',['Verde','Azul','Morada'],'La mochila era roja.'),
  fact('¿De qué color era la botella?','Azul',['Roja','Verde','Amarilla'],'La botella era azul.'),
  fact('¿Dónde estaba el puente respecto a la tienda?','A la derecha',['A la izquierda','Dentro','Encima'],'El puente estaba a la derecha de la tienda.'),
  fact('¿Qué pasaba por debajo del puente?','Un arroyo',['Una carretera','Una vía de tren','Un sendero seco'],'Un arroyo pasaba por debajo del puente.'),
  fact('¿Qué había detrás del bosque?','Montañas',['Edificios','Una playa','Un aeropuerto'],'Había montañas detrás del bosque.'),
  fact('¿Dónde estaba la mochila respecto a la tienda?','Delante',['Detrás','Dentro','Encima'],'La mochila estaba delante de la tienda.'),
  fact('¿De qué material era el puente?','Madera',['Metal','Piedra','Cuerda'],'El puente era de madera.')
 ]},
 city:{title:'Una plaza de la ciudad',width:1448,height:1086,path:'assets/photos/city-a.png',facts:[
  fact('¿De qué color era la sombrilla de la cafetería?','Roja',['Azul','Verde','Amarilla'],'La sombrilla de la cafetería era roja.'),
  fact('¿De qué color era la furgoneta?','Amarilla',['Roja','Azul','Verde'],'La furgoneta era amarilla.'),
  fact('¿De qué color era la bolsa del banco?','Azul',['Morada','Roja','Amarilla'],'La bolsa del banco era azul.'),
  fact('¿Dónde estaba la fuente?','En el centro de la plaza',['Dentro de la cafetería','Sobre el banco','En la furgoneta'],'La fuente estaba en el centro de la plaza.'),
  fact('¿Qué había en lo alto del edificio del fondo?','Un reloj redondo',['Una pantalla','Un cartel rojo','Una bandera azul'],'En lo alto del edificio del fondo había un reloj redondo.'),
  fact('¿Dónde estaba la furgoneta respecto a la fuente?','A la derecha',['A la izquierda','Dentro','Encima'],'La furgoneta estaba a la derecha de la fuente.'),
  fact('¿De qué color era el banco de la bolsa?','Verde',['Rojo','Azul','Amarillo'],'El banco de la bolsa era verde.'),
  fact('¿Dónde estaba la bolsa?','Sobre el banco de la izquierda',['Dentro de la fuente','Junto al reloj','En una mesa de la cafetería'],'La bolsa estaba sobre el banco de la izquierda.')
 ]}
});
const newPairs={
 desk:{regions:{'El estuche':[7,59,27,23],'El cuaderno':[37,65,27,17],'La mochila':[35,35,26,29],'Los lápices':[70,48,13,28],'Las llaves':[44,83,18,12],'El reloj':[51,1,18,21]},changes:[['El estuche','De rojo a morado'],['El cuaderno','De verde a naranja'],['La mochila','De azul a rojo']],unchanged:['Los lápices','Las llaves','El reloj']},
 picnic:{regions:{'La botella':[14,35,16,33],'La manta':[4,83,18,15],'La fiambrera':[69,34,20,20],'Las naranjas':[70,59,23,21],'La cesta':[34,30,32,42],'Las gafas':[39,75,23,13]},changes:[['La botella','De azul a verde'],['La manta','De roja a azul'],['La fiambrera','De amarilla a morada']],unchanged:['Las naranjas','La cesta','Las gafas']},
 market:{regions:{'La bolsa':[39,25,25,39],'El monedero':[40,66,20,12],'Los pimientos':[7,46,25,25],'Las manzanas':[71,46,25,25],'El toldo':[2,0,96,18]},changes:[['La bolsa','De amarilla a morada'],['El monedero','De azul a rojo'],['Los pimientos','De rojos a amarillos']],unchanged:['Las manzanas','El toldo']},
 entry:{regions:{'La mochila':[26,26,19,28],'El paraguas':[86,24,9,25],'El cuenco':[13,20,10,6],'Las zapatillas':[75,65,13,12],'El espejo':[32,0,37,21],'El banco':[24,53,49,9]},changes:[['La mochila','De azul a roja'],['El paraguas','De amarillo a morado'],['El cuenco','De verde a naranja']],unchanged:['Las zapatillas','El espejo','El banco']},
 street:{regions:{'La chaqueta de la persona con mochila':[6,45,10,19],'El abrigo de la otra persona':[14,48,9,19],'El coche':[49,50,24,20],'El árbol':[33,3,27,35],'El toldo':[64,18,35,24],'La bicicleta':[84,54,16,26]},changes:[['La chaqueta de la persona con mochila','De roja a morada'],['El abrigo de la otra persona','De amarillo a verde'],['El coche','De rojo a azul']],unchanged:['El árbol','El toldo','La bicicleta']},
 park:{regions:{'El jersey de la persona sentada':[0,24,25,14],'La bicicleta':[75,20,25,57],'La botella':[49,65,7,22],'La mochila':[19,47,16,22],'La pelota':[54,77,8,11],'Las chaquetas del fondo':[58,23,18,20]},changes:[['El jersey de la persona sentada','De amarillo a morado'],['La bicicleta','De roja a azul'],['La botella','De azul a roja']],unchanged:['La mochila','La pelota','Las chaquetas del fondo']},
 bus:{regions:{'La mochila':[0,40,27,34],'La bufanda':[79,62,21,30],'El paraguas':[69,31,12,66],'Los asientos':[2,76,26,17],'Las barras':[20,0,8,28],'Los árboles':[0,0,19,22]},changes:[['La mochila','De roja a morada'],['La bufanda','De amarilla a roja'],['El paraguas','De verde a azul']],unchanged:['Los asientos','Las barras','Los árboles']},
 factory:{regions:{'La caja de herramientas':[1,38,18,13],'El cuadro de la bicicleta':[32,30,31,22],'El casco':[76,7,11,12],'Las ruedas de la pared':[0,0,32,29],'El chaleco':[76,21,16,35],'Las cajas de cartón':[91,54,9,29]},changes:[['La caja de herramientas','De roja a verde'],['El cuadro de la bicicleta','De azul a rojo'],['El casco','De azul a naranja']],unchanged:['Las ruedas de la pared','El chaleco','Las cajas de cartón']},
 nature:{regions:{'La tienda de campaña':[0,40,45,37],'La mochila':[13,61,14,23],'La botella':[26,68,4,13],'El puente':[48,42,48,16],'Las montañas':[2,7,84,31],'El arroyo':[53,60,46,30]},changes:[['La tienda de campaña','De amarilla a azul'],['La mochila','De roja a verde'],['La botella','De azul a roja']],unchanged:['El puente','Las montañas','El arroyo']},
 city:{regions:{'La sombrilla':[2,12,34,17],'La furgoneta':[81,31,19,24],'La bolsa':[11,62,13,23],'El banco':[0,86,35,13],'La fuente':[37,24,45,42],'El reloj':[62,0,9,12]},changes:[['La sombrilla','De roja a azul'],['La furgoneta','De amarilla a roja'],['La bolsa','De azul a morada']],unchanged:['El banco','La fuente','El reloj']}
};
for(const [id,pair] of Object.entries(newPairs))pairs[id]={...pair,sceneId:id,path:`assets/photos/${id}-b.png`};
// Reviewed October 2026: quantity, presence, orientation, object identity and state.
Object.assign(scenes,{
 cafe:{title:'Una pausa en una cafetería',width:1448,height:1086,path:'assets/photos/cafe-a.png',facts:[
  fact('¿Cuántas galletas había en el plato?','Tres',['Dos','Cuatro','Una'],'Había tres galletas en el plato blanco.'),
  fact('¿Sobre qué objeto estaban las gafas?','Sobre el libro',['Sobre la taza','Sobre el plato','Sobre una silla'],'Las gafas estaban sobre el libro amarillo.'),
  fact('¿Hacia qué lado apuntaba el asa de la taza?','Hacia la derecha',['Hacia la izquierda','Hacia delante','Hacia atrás'],'El asa apuntaba hacia la derecha.'),
  fact('¿Qué había detrás de la taza?','Una planta',['Una mochila','Un balón','Un teléfono'],'Había una planta detrás de la taza.'),
  fact('¿Dónde estaba la cuchara?','Delante de la taza y a la derecha del plato',['Dentro de la taza','Sobre el libro','Detrás de la planta'],'La cuchara estaba sobre la mesa, delante de la taza y a la derecha del plato.'),
  fact('¿Estaba abierto o cerrado el libro?','Cerrado',['Abierto por la mitad','Abierto por la primera página','No había libro'],'El libro amarillo estaba cerrado.'),
  fact('¿Qué había dentro de la taza?','Una bebida oscura',['Lápices','Galletas','Nada'],'Se veía una bebida oscura dentro de la taza.'),
  fact('¿Cómo estaba colocada la cuchara?','En diagonal',['Vertical en la imagen','Dentro de la taza','Sobre las gafas'],'La cuchara estaba en diagonal sobre la mesa.'),
  fact('¿De qué color era el libro?','Amarillo',['Verde','Azul','Rojo'],'El libro era amarillo.'),
  fact('¿Qué había a la izquierda de la taza?','El plato de galletas',['El libro','Las gafas','Un balón'],'El plato de galletas estaba a la izquierda de la taza.'),
  fact('¿De qué material parecía ser la mesa?','Madera',['Cristal','Metal','Plástico'],'La mesa tenía una superficie de madera.'),
  fact('¿Había alguien sentado en las sillas del fondo?','No, estaban vacías',['Sí, una persona','Sí, dos personas','Sí, tres personas'],'Las sillas visibles del fondo estaban vacías.')
 ]},
 sports:{title:'Preparados para hacer deporte',width:1448,height:1086,path:'assets/photos/sports-a.png',facts:[
  fact('¿Qué tipo de balón había sobre el banco?','Un balón de fútbol',['Un balón de baloncesto','Una pelota de tenis','Un balón de rugby'],'Había un balón de fútbol sobre el banco.'),
  fact('¿Dónde estaba el silbato?','Sobre la toalla',['Dentro de una zapatilla','En el reloj','Sobre el balón'],'El silbato naranja estaba sobre la toalla azul.'),
  fact('¿Estaba abierta o cerrada la bolsa roja?','Cerrada',['Abierta','No había bolsa','Tapada con la toalla'],'La bolsa roja estaba cerrada.'),
  fact('¿Dónde estaban las zapatillas?','En el suelo, a la izquierda',['Sobre el banco','Dentro de la bolsa','Colgadas en la pared'],'Las zapatillas estaban en el suelo, a la izquierda.'),
  fact('¿Qué había entre la botella y la toalla?','El balón',['La bolsa','Un cuaderno','Las zapatillas'],'El balón estaba entre la botella y la toalla.'),
  fact('¿Qué objeto estaba en la parte alta de la pared?','Un reloj redondo',['Un espejo cuadrado','Una pantalla','Un cartel rojo'],'Había un reloj redondo en la parte alta de la pared.'),
  fact('¿De qué color era la botella del banco?','Verde',['Azul','Roja','Amarilla'],'La botella del banco era verde.'),
  fact('¿Qué había en el hueco de arriba a la derecha?','Una mochila negra',['Un balón rojo','Una planta','Una taza'],'Había una mochila negra en el hueco alto de la derecha.'),
  fact('¿Dónde estaba la bolsa respecto al balón?','Más abajo y a la derecha',['Encima del balón','A la izquierda y sobre el banco','Dentro del balón'],'La bolsa estaba más abajo y a la derecha que el balón.'),
  fact('¿Cuántas zapatillas había en el suelo?','Dos',['Una','Tres','Cuatro'],'Había dos zapatillas blancas en el suelo.'),
  fact('¿De qué color era la toalla del banco?','Azul',['Verde','Roja','Amarilla'],'La toalla del banco era azul.'),
  fact('¿Qué dos objetos estaban en el suelo?','Las zapatillas y la bolsa',['La botella y el balón','El silbato y la toalla','El reloj y la mochila'],'En el suelo estaban las zapatillas y la bolsa roja.')
 ]}
});
pairs.cafe={sceneId:'cafe',path:'assets/photos/cafe-b.png',varied:true,regions:{'Las galletas':[7,49,30,25],'Las gafas':[70,43,26,22],'La cuchara':[57,59,11,36],'La planta':[43,0,26,32],'La taza':[41,31,25,28]},changes:[['Las galletas','De tres galletas a dos galletas'],['Las gafas','De estar sobre el libro a no estar en la mesa'],['La cuchara','De una posición diagonal a una posición vertical']],unchanged:['La planta','La taza']};
pairs.sports={sceneId:'sports',path:'assets/photos/sports-b.png',varied:true,regions:{'El balón':[43,32,17,21],'El silbato':[77,43,9,7],'La bolsa':[58,62,40,32],'Las zapatillas':[10,74,25,20],'La botella del banco':[18,26,8,26],'El reloj':[76,0,12,15]},changes:[['El balón','De un balón de fútbol a un balón de baloncesto'],['El silbato','De estar sobre la toalla a no estar en el banco'],['La bolsa','De estar cerrada a estar abierta']],unchanged:['Las zapatillas','La botella del banco','El reloj']};

Object.assign(scenes,{
 library2026:{title:'Una biblioteca de barrio',width:1536,height:1024,path:'assets/scenes/everyday-es-2026/library-scene.png',facts:[
 fact('¿De qué color era la botella de la mesa?','Azul',['Verde','Roja','Amarilla'],'La botella de la mesa era azul.'),
 fact('¿Dónde estaba la mochila verde?','En una silla del primer plano',['En el suelo junto a la puerta','Sobre una estantería','Sobre la mesa'],'La mochila verde estaba en una silla del primer plano.'),
 fact('¿Cuántas personas conversaban a la derecha?','Dos',['Una','Tres','Cuatro'],'Dos personas conversaban junto a las estanterías de la derecha.'),
 fact('¿Qué había debajo del bolígrafo?','Un cuaderno abierto',['Una revista cerrada','Una caja','Una mochila'],'El bolígrafo estaba sobre un cuaderno abierto.')
 ]},
 autumnPark2026:{title:'Una tarde en el parque',width:1536,height:1024,path:'assets/scenes/everyday-es-2026/park-scene.png',facts:[
 fact('¿Qué hacía la persona sentada en el banco?','Leía',['Usaba un patinete','Bebía agua','Hablaba por teléfono'],'La persona del banco estaba leyendo.'),
 fact('¿De qué color era la chaqueta del ciclista?','Roja',['Azul','Amarilla','Verde'],'El ciclista llevaba una chaqueta roja.'),
 fact('¿Cuántos conos había junto al árbol joven?','Tres',['Dos','Cuatro','Uno'],'Había tres conos naranjas junto al árbol joven.'),
 fact('¿Qué había en la hierba del primer plano?','Una pelota amarilla',['Una mochila azul','Una cesta','Un libro'],'En la hierba había una pelota amarilla.')
 ]}
});
// Each harder question reconstructs two or three independent facts from the SAME image.
// Distractors differ in exactly one component; colour alone cannot solve the task.
const challenges={
 library2026:[[0,1,2],[1,2,3],[0,2,3],[0,1,3]],autumnPark2026:[[0,1,2],[1,2,3],[0,2,3],[0,1,3]],
 cafe:[[0,1,2],[3,4,5],[6,7,8],[9,10,11]],sports:[[0,1,2],[3,4,5],[6,7,8],[9,10,11]],
 kitchen:[[1,3,5],[11,9,10],[2,6,7],[4,8,5]],
 living:[[1,2,4],[0,7,8],[3,5,11],[6,9,10]],
 desk:[[0,2,4],[1,5,6],[3,7,5],[6,4,1]],
 picnic:[[0,2,3],[1,4,5],[6,7,2],[5,3,4]],
 market:[[0,1,2],[3,4,6],[5,2,7],[1,6,3]],
 entry:[[0,1,2],[3,4,5],[6,7,2],[1,5,3]],
 street:[[0,1,2],[3,4,5],[6,7,1],[2,5,4]],
 park:[[0,1,2],[3,4,5],[6,7,2],[1,5,3]],
 bus:[[0,1,2],[3,4,5],[6,7,2],[1,5,3]],
 factory:[[0,1,3],[2,4,5],[6,7,3],[1,5,4]],
 nature:[[0,1,2],[3,4,5],[6,7,2],[1,5,3]],
 city:[[0,1,2],[3,4,5],[6,7,2],[1,5,6]]
};
function questions(sceneId,level){
 const scene=scenes[sceneId];
 if(level===1)return scene.facts;
 return challenges[sceneId].map((indices,index)=>{
  const evidence=indices.slice(0,level===2?2:3),facts=evidence.map(i=>scene.facts[i]);
  const answer=facts.map(f=>f.a).join(' → ');
  const wrong=facts.map((_,i)=>facts.map((f,j)=>i===j?f.opts[1+(index%3)]:f.a).join(' → '));
  return {q:'Recuerda estos datos en el orden indicado: '+facts.map((f,i)=>`${i+1}) ${f.q}`).join(' '),a:answer,opts:[answer,...wrong],detail:facts.map(f=>f.detail).join(' '),evidence};
 });
}
const supports=(age,domain)=>['junior','primary','middle','teen'].includes(age)&&['memory','attention'].includes(domain);
const bankCache=new Map();
function templates(age,domain,level=1){
 const key=[age,domain,level].join(':');if(bankCache.has(key))return bankCache.get(key);
 if(!supports(age,domain))return [];
 const meta={domain,level,requiresStimulus:true,...(age==='teen'?{teenReview:{version:3}}:age==='junior'?{juniorProfile:{route:age,level}}:{schoolProfile:{route:age,level}})};
 const out=[];
 if(domain==='memory')for(const [sceneId,scene] of Object.entries(scenes))questions(sceneId,level).forEach((f,index)=>{
  const id=`photo-v1:${age}:${domain}:${level}:${sceneId}:${index}`;
  out.push({...meta,id,contentKey:id,mechanic:'memory_photo',memoryMaterialKey:'photo:'+sceneId,type:'memoryReveal',responseType:'choice',topic:'Memoria · escena cotidiana',q:'Observa la imagen. Después desaparecerá y responderás una pregunta.',memoryQuestion:f.q,stimulus:[{type:'photo',photoId:sceneId}],memoryContent:[{detail:scene.title}],a:f.a,opts:f.opts.slice(0,level===1?3:4),why:f.detail,revealMs:[10000,12000,9000][level-1],photoTask:{kind:'recall',sceneId,index,...(f.evidence?{evidence:f.evidence}:{})}});
 });
 else for(const [pairId,pair] of Object.entries(pairs)){
  for(const variant of level===1&&pair.varied?[0,1,2]:[0]){
  const id=`photo-v1:${age}:${domain}:${level}:${pairId}${variant?':'+variant:''}`,exact=level===3;
  const answers=level===1?[pair.changes[variant][0]]:pair.changes.map(([object,change])=>exact?object+': '+change:object);
  const opts=level===1?[answers[0],...pair.unchanged.slice(0,2)]:[...answers,...(exact?pair.changes.map(([object,change])=>object+': '+change.replace(/^De (.+) a (.+)$/, 'De $2 a $1')):pair.unchanged)];
  out.push({...meta,id,contentKey:id,mechanic:'attention_photo_differences',type:'photoDifference',responseType:'multiple',topic:'Atención · encuentra las diferencias',q:level===1?(pair.varied?`En la imagen B, marca este cambio: ${pair.changes[variant][1].toLowerCase()}.`:`Marca el objeto que cambia ${pair.changes[0][1].toLowerCase()}.`):pair.varied?(exact?'Compara A con B. Marca las descripciones que indican cómo era cada objeto antes y cómo es después. Fíjate en los objetos, su posición, su cantidad y su estado.':'Marca los elementos que han cambiado entre A y B. Puede haber cambios de cantidad, posición, presencia o tipo de objeto.'):exact?'Compara A con B. Marca solo las descripciones que indican correctamente el color inicial y el final. Las descripciones con el orden invertido no son válidas.':'Marca todos los objetos que cambian de color entre A y B.',stimulus:[{type:'photoPair',pairId}],answers,opts,why:pair.changes.map(([object,change])=>object+': '+change.toLowerCase()+'.').join(' '),photoTask:{kind:'differences',pairId,...(pair.varied?{variant}:{})}});
  }
 }
 bankCache.set(key,out);return out;
}
function pool(age,domain,level=1){return structuredClone(templates(age,domain,level));}
function validate(item){
 const task=item.photoTask,age=item.teenReview?'teen':item.juniorProfile?.route||item.schoolProfile?.route;
 if(!task||!supports(age,item.domain)||![1,2,3].includes(item.level))throw new Error('Escena o nivel no válido.');
 const expected=templates(age,item.domain,item.level).find(x=>task.kind==='recall'?x.photoTask.sceneId===task.sceneId&&x.photoTask.index===task.index:x.photoTask.pairId===task.pairId&&(x.photoTask.variant||0)===(task.variant||0));
 if(!expected)throw new Error('La pregunta no pertenece a la escena revisada.');
 const locale=root.LocaleContent||(typeof require==='function'&&require('./locale-content'));
 const adapted=locale.localizeItem(expected,item.localization?.locale||'es_intl',item.domain);
 for(const field of ['type','responseType','q','memoryQuestion','a','photoTask','stimulus','memoryContent','why'])if(JSON.stringify(item[field])!==JSON.stringify(adapted[field]))throw new Error('La actividad no coincide con la fotografía y la pregunta revisadas: '+field);
 for(const field of ['opts','answers'])if(JSON.stringify([...(item[field]||[])].sort())!==JSON.stringify([...(adapted[field]||[])].sort()))throw new Error('Las respuestas no corresponden a los datos visibles.');
 return true;
}
function generate(age,domain,level){const bank=templates(age,domain,level);return structuredClone(bank[Math.floor(Math.random()*bank.length)]||null);}
const api={scenes,pairs,supports,pool,validate,generate};root.PhotoLibrary=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

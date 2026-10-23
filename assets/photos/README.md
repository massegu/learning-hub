# Escenas cotidianas de aspecto fotográfico

Imágenes generadas con IA para estas actividades, sin fotografías de usuarios reales ni de sus casas o lugares de trabajo. Las personas de las nuevas escenas también son generadas. Las fuentes y sus ediciones se inspeccionaron visualmente antes de escribir las preguntas. `review.json` identifica los PNG revisados mediante SHA-256.

## Ampliación: paseos, ciudad, trabajo y naturaleza

Esta ampliación añadió seis escenas a las seis originales. Con la ampliación de cafetería y vestuario descrita al final, el banco completo tiene 14 escenas y 14 pares A/B (28 PNG).

- Calle A: dos personas con chaqueta roja/mochila azul y abrigo amarillo; coche rojo, bicicleta azul y toldo verde/blanco. B: chaqueta morada, abrigo verde y coche azul.
- Parque A: persona sentada con jersey amarillo, mochila verde junto al banco, bicicleta roja, botella azul y pelota naranja; dos personas pasean al fondo con chaquetas roja y azul. B: jersey morado, bicicleta azul y botella roja.
- Autobús A: mochila roja en el asiento izquierdo, barras amarillas, tapicería azul, paraguas verde y bufanda amarilla a la derecha. B: mochila morada, paraguas azul y bufanda roja.
- Taller A: caja de herramientas roja a la izquierda, bicicleta azul en soporte, dos ruedas en la pared, trabajador a la derecha con casco azul y chaleco amarillo. B: caja verde, cuadro de bicicleta rojo y casco naranja.
- Naturaleza A: tienda amarilla, mochila roja y botella azul delante, puente de madera a la derecha sobre un arroyo y montañas detrás del bosque. B: tienda azul, mochila verde y botella roja.
- Plaza A: sombrilla roja a la izquierda, bolsa azul sobre banco verde, fuente central, reloj en el edificio y furgoneta amarilla a la derecha. B: sombrilla azul, bolsa morada y furgoneta roja.

Las preguntas se basan en lo visible, no en el prompt de generación. No se pregunta por matrículas, hora del reloj ni marcas. Las diferencias se limitan expresamente a los tres cambios de color revisados en cada par. Se mantiene la progresión de una observación en nivel 1 y combinaciones de dos/tres en niveles 2/3.

- Cocina A: taza roja, cuaderno azul cerrado, mochila amarilla en la silla, tres manzanas verdes en un plato, cuchara y planta en la ventana.
- Cocina B: taza verde, cuaderno naranja y mochila morada; las preguntas de diferencias se limitan a esos cambios de color.
- Salón A: sofá azul, dos cojines (izquierdo amarillo y derecho rojo), libro verde cerrado y vaso sobre la mesa, lámpara a la izquierda, balón naranja a la derecha y cuadro de montañas.
- Salón B: cojín izquierdo morado, libro rojo y balón azul. Las preguntas de diferencias se limitan a esos cambios de color.

No se cuentan las variaciones incidentales de sombras, textura o iluminación que pueda introducir la generación. La escena A es la fuente de las preguntas de recuerdo. Los textos alternativos durante la exposición son neutrales y no contienen la solución. Las preguntas se definen y validan en `js/photo-library.js`, con copia idéntica en Supabase.

## Ampliación: cuatro entornos

- Estudio A: cuaderno verde, estuche rojo a su izquierda, vaso blanco con tres lápices amarillos a su derecha, dos llaves delante y mochila azul en la silla. B: estuche morado, cuaderno naranja, mochila roja.
- Pícnic A: manta roja, botella azul a la izquierda de la cesta, plato con tres naranjas a su derecha, gafas negras delante, tela blanca y fiambrera amarilla. B: botella verde, manta azul y fiambrera morada.
- Mercado A: bolsa amarilla en el centro, dos pimientos rojos a la izquierda, tres manzanas verdes a la derecha, monedero azul delante, toldo verde y blanco. B: bolsa morada, monedero rojo y dos pimientos amarillos.
- Entrada A: mochila azul en la parte izquierda del banco, dos zapatillas rojas en el suelo a la derecha, espejo rectangular, cuenco verde con llaves en la repisa y paraguas amarillo. B: mochila roja, paraguas morado y cuenco naranja.

Nivel 1: un dato; nivel 2: reconstrucción de dos datos independientes; nivel 3: tres datos independientes y alternativas que cambian un solo componente. En Atención nivel 3 se distingue también el sentido de cada cambio A → B; invertirlo no es válido. La misma fotografía A es la fuente de todas las respuestas de recuerdo.

## Cafetería y vestuario deportivo

Se añaden `cafe-a/b.png` y `sports-a/b.png` (1448 × 1086 cada una). Revisadas visualmente con sus preguntas y regiones. En la cafetería cambian tres a dos galletas, desaparecen las gafas y la cuchara pasa de diagonal a vertical. En el vestuario se sustituye fútbol por baloncesto, desaparece el silbato y se abre la bolsa. Las preguntas distinguen cantidad, presencia, orientación, identidad y estado; no valoran variaciones incidentales de textura o iluminación. El total es de 14 escenas y 28 fotografías originales generadas con IA.

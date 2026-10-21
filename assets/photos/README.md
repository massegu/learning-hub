# Escenas cotidianas de aspecto fotográfico

Imágenes generadas con IA para estas actividades, sin fotos de usuarios reales, personas, marcas o textos. Las fuentes y sus ediciones se inspeccionaron visualmente antes de escribir las preguntas. `review.json` identifica los PNG revisados mediante SHA-256.

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

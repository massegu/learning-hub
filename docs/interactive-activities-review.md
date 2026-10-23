# Interacción, español escolar y documentos existentes

## Cambios visibles

- Contacto publicado en acceso y barra lateral: `learninghub2026@proton.me`.
  Es un enlace al correo; no se han enviado mensajes ni cambiado datos de Stripe.
- Funciones ejecutivas → **Actúa con reglas** → **Tarjetas con reglas**:
  tres símbolos en nivel 1, cuatro en nivel 2 y cinco para 8–10 / seis para las
  demás edades en nivel 3. Cada tarjeta indica una respuesta por botón o teclado
  A–E. Una regla exige no pulsar durante la barra de espera. El nivel 3 cambia
  las reglas tras la primera mitad, avisa y espera confirmación de lectura.
  Se registra un resultado por actividad con número de tarjetas correctas y
  errores de espera, sin cobrar cada tarjeta como un ejercicio distinto.
- Funciones ejecutivas → **Actúa con reglas** → **Espera y actúa**:
  tarjetas de palabras con gestos, incluido PAUSA. Una cuenta de cinco segundos
  precede al gesto; la confirmación queda deshabilitada hasta terminar la espera.
  La persona o acompañante registra espera respetada, adelanto o tarjeta sin
  practicar. La app no observa el cuerpo ni verifica que se haya hecho el gesto.
- Atención → **Busca a tu alrededor**: ocho consignas distintas por nivel.
  Nivel 1 pide una característica; nivel 2 combina dos; nivel 3 añade condiciones
  y exclusiones. Se escribe una descripción o se indica que no hay un objeto
  adecuado. No se necesita cámara ni micrófono; no hay una respuesta automática.
- Movimiento y búsqueda se guardan en `learner_profiles.progress.interactiveObservations`,
  con un máximo de 100 registros y un resumen desplegable en Progreso. No suman
  aciertos, fallos, puntos ni alteran niveles. Se conservan los gráficos existentes.
- Al salir de una pestaña durante las tarjetas, se interrumpe la secuencia y se
  ofrece reiniciar. Salir del ejercicio o cambiar de perfil limpia temporizadores.
  La modalidad se solicita expresamente, sin mezclarla con los bancos anteriores.
- Atención nivel 1, selección con una sola solución: pulsar la opción o el objeto
  de la imagen comprueba una vez y muestra **Siguiente**. No exige pulsar Comprobar.
  Los niveles 2/3 conservan su selección múltiple y su botón de comprobación.

## Lenguaje y dificultad

Se corrigen los generadores, no solo las capturas concretas:

- Rasgos: «El investigador es curioso», «Los investigadores son curiosos»,
  «La artista es creativa», «El robot es nuevo». Estados: «está preparado»,
  «están cansados», etc., según el adjetivo correspondiente.
- Las instrucciones de concordancia y construcción de frases funcionan también
  con robots, equipos, grupos y animales; ya no los llaman «personas».
- Consignas de 8–12 años más breves: completar, ordenar, elegir y revisar una frase.
- Vocabulario de 8–12 con fuentes distintas en niveles 1/2/3. Los niveles iniciales
  parten de palabras más familiares. Se eliminan distractores como «Tiene el mismo
  significado» en preguntas que piden una palabra contraria.

La revisión se ha redactado de forma original. El 23/10/2026 se intentó consultar
Santillana, Anaya y el DPD de la RAE; el proxy del entorno rechazó las tres conexiones
con HTTP 403. No se atribuye a esas editoriales una revisión ni se afirma haber
contrastado libros que no se han podido abrir. El contraste con muestras concretas
de manuales queda pendiente de disponer de esos materiales.

## Documentos: se sustituye también la plantilla antigua

La iteración anterior añadió cinco diseños, pero la mayoría de fuentes seguían
usando el marco anterior. Esta entrega rediseña **16 documentos existentes**:
factura, catálogo, folleto, cartel, entrada de museo, menú, aviso, transporte,
infografía, publicación social, etiqueta, formulario, horario, anuncio, instrucciones
y boletín. Se mantienen el ticket estrecho y los cuatro diseños recientes,
además del mapa. Las 22 fuentes conservan sus IDs, datos, transcripciones y preguntas.

Los documentos tienen estructuras distintas: importes y totales de factura,
precios alineados en menú, entrada con talón, campos de formulario, horario con
escala temporal uniforme, instrucciones en una interfaz y fuentes periodísticas
en columnas. SVG/PNG se generan localmente y se comprueban límites del texto.
Las fuentes rediseñadas se muestran a una anchura legible y Word conserva
proporciones, imágenes exactas y transcripciones completas.

Generación: `python3 scripts/render-authored-documents.py` encadena los renderizadores
clásico, de cinco diseños específicos y de los dieciséis documentos revisados.
La verificación de Cloudflare comprueba ahora **todos** los PNG documentales.

## Validación y publicación

- Suite completa: 178 pruebas Node correctas; pruebas dirigidas adicionales tras
  los últimos ajustes. Matriz de vocabulario: 1.440 adaptaciones imprimibles.
- Nueve pruebas Python de paquete y verificación de publicación.
- Diez recorridos de navegador: los nueve del flujo de publicación, incluido el
  nuevo circuito interactivo, y el recorrido de las 22 fuentes documentales.
  Se comprueban teclado, cambios de reglas, espera real, error de inhibición,
  observaciones sin puntuación, persistencia, contacto, respuesta directa de
  Atención 1, reinicio tras interrupción, móvil y Word/ZIP.
- Se verifican también sesiones, acceso, facturación simulada, memoria, velocidad,
  progreso y mecánicas previas. No se han modificado las fotografías aprobadas,
  los iconos, las cuotas, Stripe, impuestos ni la base de datos.

Capturas: [tarjeta](review-assets/interactive-activities/symbol-card.png),
[espera](review-assets/interactive-activities/wait-before-action.png),
[reglas en móvil](review-assets/interactive-activities/rules-mobile.png),
[menú](review-assets/interactive-activities/menu-desktop.png),
[formulario en móvil](review-assets/interactive-activities/form-mobile.png).

Rama `feat/interactive-executive-attention`, destino `desarrollo`. La web solicita
revisión de cliente 4; versiones 1–3 conservan el contenido anterior y reciben una
petición de actualizar si intentan solicitar la modalidad nueva. El flujo publica
la función de contenido antes de promover y verificar la web de `pruebas`.
No hacen falta SQL ni secretos nuevos. Esperar a que termine el flujo y recargar
la URL estable de pruebas para revisar conjuntamente web, contenido y PNG.

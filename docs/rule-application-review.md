# México: aplicación de criterios y presentación — 16 de octubre de 2026

Seguimiento de `e967bf2`, en `fix/early-primary-stimulus-integrity`.
Sin merge, despliegue ni datos de producción.

## Seguimiento: lista de llaves y botella

La familia histórica `app_missing` podía pedir «botella, llaves y botella» y
ofrecer «Botella» y «botella» como opciones diferentes. Para 16–18 se sustituye
por `app_plan_review`: tres casos escritos, uno por nivel, con requisitos y un
estado o plan que el usuario debe supervisar. No se presentan las variaciones
de identificadores como textos nuevos.

- Nivel 1: detectar que la autorización fotografiada carece de firma, aunque
  el formato digital sea válido y el resto del material esté preparado.
- Nivel 2: comprobar contenido, tamaño y revisión del archivo final después
  de añadir gráficos; una revisión de una versión anterior no basta.
- Nivel 3: relacionar cita, antelación de registro, trayecto y disponibilidad
  de un comprobante para corregir la salida del plan.

Se conservan los requisitos y las filas de la tabla en la proyección imprimible,
con opciones distintas y explicación de la corrección. No hay cambios de moneda
ni dependencias regionales. La ruta histórica de otras edades mantiene una lista
con tres objetos distintos; sus bancos escolares propios siguen activos.
Esta intervención no completa la fusión de áreas ni la ampliación de los bancos
de lectura, memoria o velocidad propuestas en la conversación.

## Cambio de regla

La pregunta «Antes seleccionabas pares. Ahora seleccionas impares. ¿Qué debes seguir
ahora?» solo exigía repetir una consigna. Se retira de la ruta activa de 16–18.
También se retira de esa ruta la pregunta genérica sobre qué estrategia ayuda a
cambiar de tarea; ambas entradas apuntan a la misma familia revisada y no se cuentan
como dos actividades diferentes en la selección por firma semántica.

La tarea nueva pide elegir un archivo en cada uno de dos bloques:

- Nivel 1: primero un PDF revisado; después un TXT con permiso, aunque no esté
  revisado. Los datos están en dos tablas separadas.
- Nivel 2: se añaden límites de tamaño y archivos que cumplen los demás requisitos
  pero exceden el límite.
- Nivel 3: el segundo bloque exige prioridad urgente, permiso y límite de tamaño;
  formato y revisión dejan de ser requisitos. Hay que comprobar el cambio en los
  datos, no nombrar la nueva regla.

Hay una única pareja correcta. Entre los distractores aparecen conservar el criterio
anterior, aplicar el segundo antes de tiempo y omitir las condiciones. La respuesta
se deriva de las filas, no de la longitud o redacción de una opción.

Es una aplicación estática de dos criterios visibles, no una prueba cronometrada de
flexibilidad ni una secuencia donde el sistema oculte la regla anterior. Se mantiene
el contrato canónico de estímulos y respuesta que admite pantalla y DOCX. No se
introducen métricas clínicas ni se modifica la arquitectura de 6–7.

## Atención y móvil

El horario «RUTA | PARADA | HORA…» ahora declara una tabla real, con encabezados
«Línea», «Parada» y «Hora». La respuesta A/Parque/16:50 se conserva. Las tablas anchas
se desplazan dentro de su región, sin ensanchar la página, y muestran una indicación
en pantallas pequeñas. Los saltos de línea de las otras situaciones se respetan.
El selector de dificultad se sitúa debajo del título también para 16–18 en móvil.

## México y vocabulario

«Mochila» es una palabra habitual en México y se mantiene. Para el dispositivo
musical se prefiere «audífonos» frente a «auriculares» en México, Colombia, Chile,
Panamá y Costa Rica; España y Argentina conservan «auriculares».

La regla exige el sentido de dispositivo. Lo identifican una etiqueta de objeto,
su icono, una frase nominal explícita («los auriculares») o metadatos de sentido.
No se cambian frases anatómicas como «pabellones auriculares». Si la adaptación
alterase un ejercicio sobre letras o forma de palabras, sigue rechazándose para
requerir una versión editorial propia.

La misma adaptación afecta a la lista memorizada, las opciones, la respuesta y la
ficha, conservando la puntuación. Servidor y cliente mantienen módulos idénticos.
La puerta regional anterior continúa excluyendo monedas incompatibles.

## Validación

- `npm test`: 99 pruebas aprobadas, cero fallos y cero omitidas.
- Las reglas se verifican contra todas las filas para veinte variantes por cada
  nivel; también se comprueba la unicidad de la respuesta y el distractor que
  conserva el criterio anterior.
- `node tests/locale-production-audit.js`: los 11.586 candidatos por variante
  regional conservan pools compatibles en todas las áreas/edades/niveles. El
  recuento son instancias enumeradas, no lecciones pedagógicamente distintas.
- `python3 tests/browser-rule-review.py`: 41 respuestas a través del manejador real,
  con inicio en los tres niveles de Funciones ejecutivas y adaptación activa.
  Las tareas corregidas se muestran, puntúan y se revisan a 1280/390 px sin
  desbordamiento de página. El DOCX conserva las dos reglas y todos los datos
  antes de la pregunta. Sin errores de página ni peticiones externas.
- Diagnóstico Deno: tipos, carga de diez módulos y respuestas HTTP locales
  aprobados. Sigue pendiente la validación
  oficial de JSR y del despliegue, como en las revisiones anteriores.

La revisión completa de las otras familias históricas de 16–18 sigue pendiente;
esta corrección no declara calibrada toda Funciones ejecutivas o Memoria.

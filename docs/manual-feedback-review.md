# Revisión tras las capturas del 15 de octubre de 2026

Rama: `fix/early-primary-stimulus-integrity`. Sin merge ni despliegue.
Se conserva la arquitectura de edad/integridad de 6–7 y el exportador canónico.

## Diagnóstico del contenido observado

Las capturas combinan la interfaz local actualizada con contenido de los generadores
históricos de la función remota. Se identificaron en `index.ts` las familias
`rea_compare` y `rea_quantity` (comparaciones de una cifra), `matrixLiteracy`
(las dos rutas de Mara y distractores ajenos al texto), y los antiguos ejercicios
de Lenguaje compartidos por edades. En ese camino histórico Geometría podía
entrar en el generador de cálculo. Los bancos revisados 8–15 de esta rama ya
sustituyen esas rutas en el código del servidor; descargar la interfaz no publica
la función. Las pruebas de esta fase no consultan la función remota ni prueban
qué revisión está desplegada en Supabase.

## Cambios

- **8–10, Lectura:** seis historias ahora comienzan con una situación desarrollada,
  no solo una acción aislada. Nivel 1: 41–46 palabras; nivel 2: 59–64; nivel 3:
  76–86. Se muestran dos párrafos, manteniendo las pruebas necesarias para las
  preguntas originales. Los límites de carga se ajustan a 65/95/125 palabras;
  no cambian los umbrales de adaptación ni las salvaguardas de 6–7.
- **8–10, Memoria nivel 3:** cinco elementos y recuperación de dos objetos en
  posiciones o asociados a personas, conservando el orden pedido. Los distractores
  incluyen inversión y sustitución de una relación. No se dificulta solo añadiendo
  tiempo o texto. Los niveles 1–2 se conservan.
- **10–12:** un único acceso visible a Lectura y escritura. Se elimina la entrada
  independiente de Lectura de navegación, inicio, selección de sesiones y fichas.
  La misión de pistas usa `literacy` en esta edad. El banco `reading` y sus resultados
  históricos no se borran; siguen disponibles en el servidor para compatibilidad.
  Geometría y las tres habilidades de Lenguaje siguen usando el banco revisado
  `PrimaryContent`. Ortografía no se sustituye por comprensión lectora.
- **Presentación:** listas en tarjetas con separación estable; tablas con marco,
  espacio entre columnas y desplazamiento interno en pantallas pequeñas. Los
  encabezados se declaran explícitamente: una tabla de medidas base/altura no
  convierte por accidente su primera fila de datos en encabezados de columna.
  Se mantiene el mismo estímulo canónico y las mismas respuestas al exportar.
  El control de dificultad se coloca debajo del título en móvil para dejar espacio
  al texto. Las descripciones de Lenguaje/lectura evitan terminología innecesaria
  como «inferencias» sin explicación.
- **13–15:** tema `studio` en la aplicación, con navegación azul oscura, superficie
  gris azulada, acentos violeta y estímulos de fondo claro. Se conserva la interfaz
  adolescente sin las misiones infantiles de 8–12.
- **16–18, corrección acotada:** nuevo módulo `teen-review.js` para Lenguaje,
  Razonamiento y Lectura y escritura, compartido por ejercicios y fichas. Lenguaje
  ya envía y respeta `grammar`/`spelling`/`writing`; los valores desconocidos se
  rechazan antes de escribir uso o historial. Se retira de estas rutas la frase
  repetida del lápiz y las preguntas de comparar 3 y 7.

## Ejemplos para revisar

| Edad/área | Contenido en la rama |
| --- | --- |
| 8–10, Lectura | Preparación de un circuito, lluvia y alternativa de caminar en una sala pequeña y seca. La pregunta depende de esas condiciones. |
| 8–10, Memoria L3 | Recordar qué tenían dos personas o los objetos en los lugares 2 y 5, en ese orden. |
| 10–12, Geometría | Perímetro, área de rectángulo/triángulo, ángulos y recorrido espacial; ejemplo: base 9 cm, altura 6 cm → área 27 cm². |
| 10–12, Ortografía | Reconstrucción de palabras, separación silábica y conservación de tildes/signos; revisadas por el banco propio de esta edad. |
| 13–15, Atención | Archivos con fecha/estado/formato en tabla; búsqueda por varios criterios; secuencias distribuidas en tarjetas. |
| 16–18, Ortografía | `Tú/tu`, `Él/el`, `sé/se`, tildes contextuales y puntuación de citas/aclaraciones. Cada pregunta pide una decisión ortográfica explícita. |
| 16–18, Razonamiento | Porcentaje restante, conservación de una fracción de registros revisados, costes por unidad, condiciones necesarias/suficientes y series de incrementos. |
| 16–18, Lectura/escritura | Encuesta con participación desigual, rapidez frente a regularidad, iluminación/consumo, citas recortadas, reserva presupuestaria y acceso a talleres. Conclusiones limitadas por pruebas. |

El módulo de 16–18 tiene seis contextos y 102 entradas por nivel: 54 de Lenguaje,
24 de Razonamiento y 24 de Lectura/escritura. Son **17 familias de ejercicios**
(nueve de Lenguaje, cuatro de Razonamiento y cuatro de Lectura/escritura).
Estos recuentos no equivalen a 306 lecciones independientes: varias preguntas de
gramática/ortografía comparten estructuras y solo cambian el contexto del título.
No se presenta el tamaño del banco como prueba de diversidad pedagógica.

## Prueba local reproducible

Ver [instrucciones paso a paso](prueba-local.md). El lanzador
`tools/review-preview.py` sirve la aplicación y las bibliotecas DOCX/ZIP locales,
inyecta únicamente un SDK ficticio y envía las peticiones al manejador real de la
función mediante `tests/edge-worker.js` y `tests/edge-harness.js`.

Los cinco perfiles tienen procesos separados y base de datos ficticia en memoria.
El código real conserva selección por perfil guardado, nivel, habilidad, país,
normalización y selección con historial. El cliente conserva adaptación, puntuación,
localización e integridad de la ficha. Una CSP limita las conexiones a este servidor;
no se usan credenciales reales. La prueba del lanzador no intercepta peticiones para
reemplazar respuestas y verifica que no se solicita ningún recurso HTTPS externo.

## Validación

Resultados de esta fase, con las limitaciones de entorno descritas abajo:

- `npm test`: 92 pruebas aprobadas; cero fallos y cero omitidas.
- `python3 tests/browser-review-preview.py`: ejecución final completa, 140
  respuestas en 14 combinaciones edad/área, cinco DOCX de 20 actividades,
  capturas a 1280/390 px, sin errores de página ni peticiones externas. Incluye los estilos finales.
- `python3 tests/browser-junior.py junior`: 326 actividades, siete países y siete
  fichas DOCX completas, sin errores de página.
- `python3 tests/browser-junior.py primary`: 400 actividades de las diez áreas
  visibles, siete países y siete fichas DOCX completas, sin errores de página.
- `python3 tests/browser-stages.py`: 30 ejercicios de Lenguaje 6–7, iconos completos
  en opciones conocidas, ventanas adaptativas de 8/10/12 respuestas, restauración
  de progreso, misiones y ficha de Lenguaje.
- Comprobación diagnóstica nativa Deno: tipos y carga de los nueve módulos locales
  aprobados; OPTIONS 200, GET 405 y POST sin autenticación 401. Se conserva la
  limitación explícita de JSR descrita abajo.

## Pendientes y límites

La función revisada sigue sin publicarse: la prueba normal de Cloudflare o un
servidor estático continúa utilizando el backend publicado. El lanzador editorial
resuelve la revisión local, no la validación de integración con datos reales.

No se afirma una calibración clínica o curricular completa de 16–18. Sus áreas de
Matemáticas, Social, Inglés, Atención, Memoria, Funciones ejecutivas y Cognición
aplicada conservan generadores históricos y requieren otra revisión de contenido,
variedad y progresión. La corrección de tres áreas no convierte toda esa edad en
una etapa revisada. Las redacciones usan autoevaluación y pueden influir en el
progreso existente; no hay evaluación automática de calidad lingüística.

Los iconos de las áreas están presentes. Los estímulos textuales no prometen una
ilustración por cada palabra; se conserva el texto y no se añade un icono ambiguo o
solo a la opción correcta. Una revisión posterior puede ampliar las ilustraciones
con ejemplos concretos, sin convertirlas en pistas involuntarias.

No se ha probado esta herramienta en un ordenador Windows real, ni el formato
físico de página en Word, ni el uso con alumnado. La carga oficial de los tipos JSR
sigue bloqueada por el acceso a `jsr.io` del entorno. El diagnóstico Deno usa solo
la sustitución explícita de la declaración de tipos, sin alterar el SDK real ni los
módulos locales; no demuestra paridad completa con el despliegue de Supabase.

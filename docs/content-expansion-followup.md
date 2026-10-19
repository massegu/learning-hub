# Memoria, Lectura + Escritura y documentos: seguimiento

Rama: `fix/early-primary-stimulus-integrity`. Base: `f317734b6b0d3bae06665929c293c026145b9173`. Se mantiene la fusión anterior de áreas; Cognición aplicada sigue siendo un alias histórico de Funciones ejecutivas.

## Cambios de contenido y presentación

### Memoria

Había tres causas de inconsistencia: el renderizador de secuencias y asociaciones reservaba los pictogramas a 6–7; faltaban objetos funcionales en el repertorio; y el normalizador no quitaba artículos plurales como «las» en «las tijeras». Las casillas vacías de posición se representaban con un guion sin explicar su función.

Ahora secuencias, posiciones, reconocimiento y asociaciones usan el mismo adaptador visual en todas las edades. Se conservan nombres visibles y accesibles; los lugares sin objeto dicen «Vacío». Los objetos disponibles tienen SVG y PNG locales, incluyendo agenda, transporte, cargador, adaptador, recibo, calculadora, auriculares y otros. Agenda/cuaderno, cargador/adaptador y tarjeta de transporte/acceso tienen símbolos diferenciados. Una etiqueta desconocida conserva texto explícito; una referencia indefinida falla en lugar de producir una casilla vacía. Word mantiene las mismas etiquetas e incorpora los pictogramas de memoria también para mayores.

Además de orden, posición y asociación, se añade reconocimiento; desde 8–10, actualización de los últimos elementos de una secuencia. La carga aumenta con edad/nivel. No se presentan cambios de objeto como familias nuevas.

### Lenguaje y Lectura + Escritura

Lenguaje ofrece **Gramática, Ortografía y Vocabulario**. Se añaden dos operaciones léxicas redactadas por edad: interpretar significado en contexto y contrastar significados. Hay seis situaciones por edad para cada operación, sin contarlas como doce familias.

Lectura y Escritura comparten sección y tienen pestañas propias. En 6–7, la segunda se llama «Formar frases». Se conservan `reading`, `literacy` y los alias antiguos según ruta, sin volver a mostrar dos áreas de lectura en las franjas ya fusionadas. Se actualizan menú, paneles, misiones, fichas y adaptadores de nombres.

La composición anterior de 6–7, 8–10, 10–12 y 13–15 se sirve desde lectura; cuando es posible conserva `contentKey`/ID e incorpora `originalDomain`. Los generadores internos antiguos admiten consultas históricas explícitas, pero la ruta HTTP de Escritura bajo Lenguaje devuelve una indicación de la nueva ubicación sin escribir historial ni consumir cuota. Los totales e historiales antiguos no se reescriben ni se trasladan por conjetura entre áreas.

### Escritura de 16–18

El banco activo deja de usar el párrafo genérico repetido como única redacción. Se añaden catorce consignas basadas en fuentes concretas: invitación, consulta por correo, corrección de una afirmación, aviso público, mensaje práctico, pie de infografía, hecho/inferencia/opinión, instrucciones de uso, solicitud, indicaciones de recorrido, recomendación con horarios, anuncio sin exageraciones, guía de entrega y comparación de fuentes.

Cada una declara salida esperada y propósito, con destinatario cuando corresponde, documento fuente, respuesta modelo y criterios. Son catorce encargos/contextos; no catorce funciones cognitivas independientes. Comparten operaciones amplias como resumir, explicar, reformular y argumentar. En 8–10 se usan versiones breves de resumen; no se entregan sin adaptación las consignas adolescentes. La respuesta escrita sigue siendo autoevaluada: no se añade una corrección automática del contenido ni una medida clínica.

### Documentos visuales

De **4 a 18 documentos originales**: factura, recibo, catálogo y folleto existentes, más cartel, entrada, menú, aviso escolar, transporte, infografía, publicación social, etiqueta, formulario, plano, horario, anuncio, instrucciones y noticia/comparación de fuentes.

Cada documento tiene tres preguntas distintas, distribuidas por nivel: localizar, interpretar/relacionar o revisar propósito/alcance. Las nuevas fuentes alimentan Lectura + Escritura y Atención. Aviso, horario, instrucciones y formulario incluyen además decisiones ejecutivas redactadas específicamente para revisar planes; no se reutiliza una pregunta literal de lectura como si fuera supervisión.

Los catorce nuevos SVG y PNG se generan localmente con `scripts/render-authored-documents.py`. El ajuste de líneas usa la anchura real de la fuente; el generador rechaza texto fuera de los límites. Los datos de las imágenes proceden de la misma transcripción que la alternativa accesible. No se usan bancos remotos ni marcas reales. Se conservan los cuatro originales.

«**Ver versión en texto**» es un `<details>` cerrado inicialmente y operable por teclado. Ofrece el contenido del documento, sin explicación de la solución ni respuesta modelo. La imagen tiene nombre accesible y el país aparece en la leyenda y en la fuente. No es un segundo ejercicio ni un estímulo con datos diferentes. Los datos pueden permitir resolver preguntas, como corresponde a una alternativa accesible; no se marcan las respuestas.

En Español internacional, un documento colombiano conserva COP, lugar y datos colombianos. También hay fuentes de México, España, Argentina, Chile, Panamá y Costa Rica. El país se explicita; la interfaz permanece neutral. La transcripción y la imagen originales no se sustituyen por una moneda inventada para el país del usuario. Los mínimos de edad declarados por las nuevas fuentes se respetan.

### Ortografía

La validación compartida de opciones se aplica antes de mostrar, durante selección del servidor y antes de exportar. Detecta coincidencias exactas, espacios, mayúsculas y signos que no sean parte intencional de la tarea. Mantiene distinciones solicitadas explícitamente de mayúsculas, puntuación y separación silábica. Puede comprobar equivalencias semánticas declaradas y rechaza múltiples respuestas correctas en una tarea de respuesta única.

La auditoría encontró distractores de 13–15 equivalentes a la solución salvo por mayúsculas, en preguntas que solo pedían puntuación. Se sustituyen por errores de puntuación distintos. La validación no intenta resolver semántica arbitraria con un modelo de lenguaje: se combina el contrato estructural con revisión de los distractores redactados.

### Velocidad

Las comparaciones se muestran en dos superficies amplias, con caracteres de aproximadamente 34–40 px y pictogramas de aproximadamente 58–72 px según pantalla. Se amplía el vocabulario: geometría, objetos, flechas, orientación, pictogramas y, desde 8–10, caracteres y series mixtas. Se añade una tarea distinta de reconocimiento rápido de categoría. Se mantienen clave de códigos, coincidencia exacta, inicio explícito, práctica sin medir, exclusión al salir de la ventana y precisión separada del tiempo.

Las nuevas mediciones llevan `speedRevision: 3`. Resúmenes, progreso y CSV distinguen la versión anterior: aumentar estímulos cambia las condiciones de medida. Los tiempos anteriores se conservan y no se mezclan con los nuevos en una misma mediana.

## Auditoría de variedad

Se distinguen tres cosas:

1. **Variante renderizada:** cambio de nombre, objeto, orden de opciones o combinación visual. No se cuenta como familia cognitiva nueva.
2. **Contexto/variante semántica:** nueva fuente y nueva decisión o interpretación, por ejemplo un aviso de biblioteca frente a instrucciones para entregar audio.
3. **Familia amplia de tarea:** recordar orden, recordar posición, asociar, reconocer, actualizar; comparar, buscar una clave o clasificar; comprender o redactar para un propósito.

El selector conserva las fuentes sin repetir hasta agotar las disponibles antes de recurrir a la ventana de rotación; ampliar el banco no hace que se recicle al llegar a diez.

Memoria pasa de tres a cinco familias amplias para mayores; de tres a cuatro en 6–7. Velocidad pasa de tres operaciones a cuatro para mayores y de una a dos en 6–7; las diez etiquetas de mayores incluyen siete vocabularios de la misma operación de comparación, no diez operaciones independientes. Lenguaje pierde composición y gana vocabulario. Atención conserva sus constructos generales y amplía contextos documentales. Funciones ejecutivas conserva planificación, condiciones, razonamiento y supervisión, ampliando las fuentes donde se revisan decisiones. Cognición aplicada no se vuelve a separar.

Los archivos [antes](audits/content-variety-before.json) y [después](audits/content-variety-after.json) registran **600 candidatos por edad/área, nivel 2**, con el mismo generador pseudoaleatorio del manejador real. Son distribuciones de candidatos, **no telemetría de pacientes ni la proporción final entregada**: después intervienen historia, rechazo y antirrepetición. En 6–7 existe además la selección local equilibrada; el muestreo del manejador no representa por sí solo esa selección. Se reproducen los datos posteriores con `node scripts/content-variety-audit.js`.

| Ruta/área | Etiquetas de mecánica antes → después | Mayor cuota de una etiqueta antes → después |
|---|---:|---:|
| 6–7 Memoria | 3 → 4 | 33,8% → 26,7% |
| 6–7 Velocidad | 1 → 6 | 100% → 19,3% |
| 8–10 Lectura/Escritura | 2 → 19 | 53,0% → 10,7% |
| 8–10 Atención | 5 → 16 | 26,8% → 18,5% |
| 8–10 Funciones ejecutivas | 10 → 13 | 27,2% → 10,0% |
| 13–15 Memoria | 3 → 5 | 35,3% → 20,7% |
| 13–15 Velocidad | 3 → 10 | 34,0% → 12,5% |
| 16–18 Lectura/Escritura | 3 → 34 | 34,8% → 5,5% |
| 16–18 Atención | 22 → 36 | 7,0% → 4,8% |
| 16–18 Funciones ejecutivas | 13 → 17 | 12,3% → 10,3% |
| 16–18 Lenguaje | 9 → 8 | 12,8% → 15,2% |

La última fila es deliberada: se retiran tres etiquetas de escritura y se añaden dos de vocabulario. No se presenta una disminución de concentración en todas las áreas ni se confunden las 34 etiquetas de lectura con 34 constructos. Parte de esa cifra distingue tipos de documento y encargos dentro de operaciones comunes.

## Comprobación

- `npm test`: 126 pruebas aprobadas; incluyen referencias visuales completas en ocho variantes, traslado de escritura, peticiones retiradas sin gasto, opciones repetidas, documentos y exportación.
- `python3 tests/browser-content-expansion.py`: cuatro rutas representativas, memoria y vocabulario, escritura, velocidad medida, escritorio/móvil al 100%, siete países más Internacional, ocho ZIP con dos DOCX cada uno y un DOCX con las 18 fuentes. Comprueba imágenes reales en el paquete y ausencia de peticiones externas/errores de página.
- `python3 tests/browser-curriculum.py`: cinco franjas, 140 actividades y diez DOCX; persistencia, modos medido/práctica/tiempo inválido, lectura y memoria L1/L3.
- `python3 tests/browser-early-followup.py`: siete áreas y cuatro misiones, seis anchos, sustitución de candidatos inválidos en 13 DOCX y siete países.
- `python3 tests/browser-documents.py`: 38 respuestas documentales en cuatro franjas, rotación, asociaciones, escritorio/móvil y DOCX con los 18 PNG originales.
- Revisión visual de memoria espacial móvil, comparación de objetos, escritura documental, vocabulario y documentos SVG/PNG. El generador comprueba también los límites de todos los textos de las nuevas imágenes.

Las pruebas ejecutan la aplicación y el manejador reales con autenticación, base de datos y cuotas simuladas. No escriben datos de producción, no prueban cobros ni acreditan validez clínica. No se ha verificado paginación física en Microsoft Word ni una sesión con lector de pantalla real. La alternativa usa HTML nativo accesible; los documentos pueden ampliarse cuando su texto resulta pequeño en móvil.

## Publicación y revisión

Este cambio se entrega mediante commit y push de **esta rama**, sin merge a `main`, sin promover `desarrollo`/`pruebas` y sin publicar la función de Supabase ni modificar datos productivos.

El preview de Cloudflare puede actualizar el código web de esta rama. **Los nuevos bancos y modos también requieren la función de Supabase de esta misma revisión.** El flujo actual de publicación de Supabase se activa desde `desarrollo`; un push a esta rama no lo ejecuta. No debe confundirse un preview de frontend con un despliegue completo del backend. Se puede revisar el conjunto sin servicios reales mediante `python3 tools/review-preview.py` y Node 22.13 o posterior.

Capturas: [Memoria móvil](review-assets/content-expansion/memory-mobile.png), [Velocidad móvil](review-assets/content-expansion/speed-mobile.png), [Escritura documental](review-assets/content-expansion/writing-desktop.png), [Vocabulario móvil](review-assets/content-expansion/vocabulary-mobile.png).

# Ampliación editorial de R19.3

La muestra integrada contiene **12 casos en las ocho familias**, con feedback específico y solución comprobada por reglas. Se conservan los 58 identificadores históricos. Quedan 488 casos de la meta inicial. Los ocho casos de Correo, Archivos, Formularios y Reservas pertenecen al catálogo digital y se contabilizan por separado.

| ID | Edad | Nivel | Operación que distingue el caso |
| --- | --- | --- | --- |
| EC193-01 | 6–7 | 1 | Implicación en un sentido. Una regla cuando se cierra la puerta no restringe el caso abierto. |
| EC193-02 | 8–10 | 2 | Intersección de tres disponibilidades. Coincidir de dos en dos no satisface una reunión común. |
| EC193-03 | 11–12 | 2 | Compatibilidad de márgenes con un extremo incluido y compartido. |
| EC193-04 | 13–15 | 2 | Ciclo de precedencia entre tres instrucciones aunque cada instrucción aislada sea ejecutable. |
| EC193-05 | 16–18 | 3 | Paridad tras tres cambios. El número exacto inicial no es necesario. |

| CP193-01 | 8–10 | 2 | Sustituir una tarea sin alterar las asignaciones válidas. |
| IN193-01 | 11–12 | 2 | Pedir la única dimensión faltante, con interpretación conservadora de la respuesta abierta. |
| AR193-01 | 13–15 | 1 | Cambiar dos veces de criterio y recuperar la primera regla. Las señales quedan fuera del cómputo. |
| PL193-01 | 6–7 | 2 | Dos pasos intercambiables deben completarse antes de un tercer paso. Se aceptan ambos órdenes. |
| RT193-01 | 16–18 | 3 | Comprobar dos restricciones simultáneas con una parte fija y una pieza seleccionable. |
| CO193-01 | 8–10 | 2 | Sustituir el objetivo manteniendo la ventana de entrega. |
| SU193-01 | 11–12 | 3 | Detectar el error de precedencia sin rehacer componentes válidos. |

Las preguntas EC exigen evidencia de las fuentes en niveles 2 y 3. La opción correcta con evidencia incompleta queda como respuesta parcial. La corrección se comprueba con los cinco tipos de razonamiento, sin depender de la posición de una alternativa. Se verificaron las soluciones y distractores. También se probaron órdenes equivalentes, respuestas abiertas no interpretables y señales AR no puntuables. Estas pruebas acreditan verificación técnica y dejan pendiente la revisión humana de lectura y dificultad.

[Inventario por edad, nivel y familia](INVENTARIO-EDITORIAL.json). El campo `technicalApproval` corresponde a la proporción de casos nuevos incorporados con pruebas técnicas, expresada en porcentaje. Las celdas sin nuevos casos llevan valor vacío. Los mecanismos y estructuras cuentan por celda, sin sumar variantes de presentación como mecanismos nuevos.

`node tools/gliax-r193/editorial-inventory.cjs` reproduce la comparación, con 119 transiciones por cada una de las 12 celdas ampliadas. Sobre 1.428 transiciones, las repeticiones consecutivas de caso pasaron de 833 a 0, las de mecanismo de 1.190 a 0 y las de estructura de 952 a 0. Las celdas con un solo candidato pasaron de 51 a 44. Las celdas con un caso o dos tienen un aviso de cobertura. Los resultados corresponden a una semilla de estímulo fija y no acreditan percepción humana fuera de las celdas medidas.

Se conservaron las metas por familia. Cambio de plan 1/60, Encuentra la contradicción 5/80, ¿Qué necesitas saber? 1/60, Actúa con reglas 1/60, Planificación 1/60, Recursos y tiempo 1/60, Cambio de objetivo 1/60 y Supervisión 1/60.

## Correcciones asociadas

Se distinguieron las modalidades históricas de ordenar instrucciones y responder a símbolos de las modalidades R19.2. El flujo visual de comparación usa estímulos gráficos en A y B. El contrato de Edge para comparaciones en palabras sigue disponible para clientes anteriores. Los controles de Matemáticas por pasos conservan un área táctil de 44 px y se adaptan al contenido.

## Revisión de la muestra

| Criterio de la rúbrica | Evidencia de la muestra | Comprobación pendiente |
| --- | --- | --- |
| Validez cognitiva, 25 % | Regla o solver separado de las opciones, fuentes canónicas, registro de alternativas válidas y estados parciales. | Observación de estrategias espontáneas y comprensión del objetivo. |
| Gradación, 20 % | Dependencias de dos pasos en 6–7, intersección de tres fuentes en edades intermedias, doble restricción o paridad en 16–18. | Comparar recorridos de la misma edad en los tres niveles. |
| Adecuación por edad, 20 % | Los casos tempranos usan acciones concretas y frases cortas. IN admite respuestas parciales y no interpretables. | Revisar el vocabulario y formato oral con profesionales. |
| Ausencia de atajos, 15 % | Orden sembrado de opciones. No se usa la posición como corrección. EC necesita comparar las fuentes en niveles 2 y 3. | Revisar pistas semánticas de los distractores en pruebas con usuarios. |
| Distractores, 10 % | Los distractores representan omisión de un dato, restricción incumplida o una inferencia no sostenida. | Verificar si producen los errores previstos en cada franja. |
| Feedback, 10 % | Cada caso explica la condición decisiva. Las pruebas de navegador revisaron EC y los dos órdenes válidos de Planificación. | Observar si las explicaciones permiten enmendar una respuesta autónomamente. |

La muestra prioriza celdas pequeñas y mecanismos identificables. La revisión documental no asigna una puntuación pedagógica global ni valida clínicamente el banco. La ampliación restante conserva sus objetivos por familia y requiere lotes con soluciones, distractores y feedback revisados.

## Lote 1. Orden y revisión de condiciones

54 casos nuevos, 18 por familia en Cambio de plan, Planificación y Supervisión. Todas las edades y niveles están representados. El validador normaliza las soluciones bajo renombrado de pasos y excluye estructuras equivalentes. Cada condición aporta una restricción propia. Se descartan ejercicios cuyo espacio de soluciones puede explicarse solo con precedencias ordinarias.

En Planificación se aceptan todos los órdenes válidos. Cambio de plan parte de un orden que cumplía las condiciones anteriores e incumple exactamente la condición nueva. Supervisión exige marcar el conjunto exacto de incumplimientos. Hay requisitos de posición, consecutividad, separación y precedencia. Los contextos ilustran acciones paralelas realizables por separado. En 6–7 hay cuatro acciones y en edades posteriores puede haber cinco.

La prueba independiente enumeró todos los órdenes para cada caso. El navegador seleccionó un caso del lote desde el selector y lo corrigió mediante sus controles reales. La incorporación técnica no reemplaza una revisión con usuarios. Total acumulado tras este lote: 66 de 500.

## Lote 2. Compatibilidad de reglas y requisitos

60 casos nuevos. Encuentra la contradicción incorpora 24 casos que distinguen compatibilidad demostrable de un conjunto de reglas imposible. Recursos y tiempo incorpora 18 problemas de selección bajo condiciones conjuntas. Cambio de objetivo incorpora 18 problemas en los que una condición nueva invalida exactamente la selección anterior y otras condiciones se mantienen.

La comparación normaliza la tabla de verdad de cada sistema bajo renombrado de elementos y reordenación de reglas. Se excluyen equivalentes y restricciones redundantes. Los distractores de selección incumplen una sola condición. Cuando hay dos soluciones ofrecidas, ambas se aceptan. El feedback muestra una selección válida o una condición concreta que falla. Las pruebas enumeran las selecciones no vacías y comprueban casos imposibles, alternativas y evidencia. El navegador seleccionó un caso del lote y completó su corrección dentro de GLIAX. Total acumulado: 126 de 500.

## Lote 3. Información faltante y control de reglas

36 casos nuevos. Se incorporaron 24 respuestas abiertas de ¿Qué necesitas saber? para las cinco edades y los tres niveles. Los mecanismos cubren identificación, vigencia, comparación de unidades, datos conjuntos, redondeo y otras inferencias. Se aceptan conceptos equivalentes y conjuntos alternativos suficientes. Si la respuesta queda fuera del vocabulario revisado se marca como no interpretable. La práctica conserva únicamente el resultado categórico.

Actúa con reglas incorpora 12 mecanismos de actualización en las cuatro edades habilitadas. Las señales pueden establecer una excepción temporal, recuperar el criterio previo, intervenir solo en un criterio o aplicar una excepción superior. Se verificaron las trazas de respuesta de cada caso. Las señales están fuera del recuento y no se deducen indicadores de inhibición a partir de esta muestra.

El lote se mantuvo por debajo de 50 para conservar diferencias entre mecanismos y redactar cada necesidad de información. Pasaron las pruebas de corrección, alternativas, errores interpretables, señales y navegación. Total acumulado: 162 de 500.

## Lote 4. Espacios de solución más amplios

60 casos, 20 por familia de Planificación, Supervisión y Cambio de plan. Se conservaron íntegros los 54 casos del lote 1. Los nuevos casos se filtraron con la misma equivalencia bajo renombrado, con condiciones no redundantes y con más de un orden válido. Se añadieron contextos de preparación, recepción y préstamo. Los cambios de contexto no cuentan por separado. La verificación enumeró los órdenes, el fallo exacto del plan anterior y las infracciones identificables en Supervisión. Total acumulado: 222 de 500.

## Lote 5. Compatibilidad y revisión de requisitos

60 casos, 20 por familia de Encuentra la contradicción, Recursos y tiempo y Cambio de objetivo. El lote anterior se conserva íntegro. La tabla de verdad normalizada evita duplicaciones. La prueba verificó que cada condición aporta información y que cualquier distractor propuesto infringe solo una condición. Se añadieron contextos de materiales, clasificación y preparación de equipos. Total acumulado: 282 de 500.

## Lote 6. Cierre de las familias de orden

63 casos, 21 por familia de Cambio de plan, Planificación y Supervisión. Se conservaron los 114 casos ya publicados con las mismas definiciones e identificadores. El filtro normalizado y la enumeración de las soluciones siguen siendo obligatorios. Cada una de las tres familias alcanza 60 casos contando el piloto. Total acumulado: 345 de 500.

## Lote 7. Cierre de contradicción, restricciones y cambio de objetivo

73 casos. Se añadieron 31 de Encuentra la contradicción, 21 de Recursos y tiempo y 21 de Cambio de objetivo. Los 120 casos de los lotes 2 y 5 conservan todas sus definiciones. Las pruebas exhaustivas preservan las alternativas válidas, prueban el fallo del plan anterior y verifican la necesidad de todas las condiciones. Las tres familias alcanzan respectivamente 80, 60 y 60 casos contando el piloto. Total acumulado: 418 de 500.

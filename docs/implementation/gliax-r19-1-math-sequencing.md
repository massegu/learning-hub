# GLIAX R19.1 · Resolución de problemas

La rama local `feat/gliax-r19-1-math-sequencing` parte de `68dd8bbb6521646d6a66c6bbba8657812887f7d8`. R19.1 amplía únicamente «Resolución de problemas».

## Operaciones y validación

`js/math-sequencing.js` contiene el banco y el motor, con una copia idéntica en Edge. Cada caso define hechos iniciales con unidad, objetivos, operaciones elementales, interpretaciones y modelos visuales. Una operación indica su objetivo, operador, dos referencias a operandos y unidad de salida. El cálculo produce una fracción normalizada de enteros. Los decimales de entrada son exactos y pueden escribirse con coma o punto. En divisiones no terminantes se acepta la fracción.

Las estrategias previstas son grafos de dependencias. El estado conserva los hechos disponibles, las operaciones ya aplicadas y las rutas que siguen siendo posibles. Un paso puede ejecutarse cuando existen sus dos operandos y mantiene al menos una ruta a todos los resultados solicitados. Se aceptan distintos órdenes entre operaciones independientes y la conmutatividad de sumas y productos. Los operandos de igual valor conservan su identidad en el selector estructurado. El validador comprueba dimensiones, ausencia de ciclos por dependencia, necesidad de cada paso para alcanzar algún objetivo y convergencia de las estrategias. La correspondencia entre el enunciado y su banco canónico también se controla en el punto de entrega.

La propuesta libre compara operaciones elementales con los valores exactos disponibles y comprueba que encajan en un paso pertinente. Las expresiones fuera del modelo y las coincidencias numéricas sin evidencia semántica suficiente reciben un estado neutro. El ejercicio ofrece retomar el recorrido estructurado o revisar la estrategia con el profesional. No usa servicios externos ni conserva la expresión libre.

## Flujo y dificultad

1. Seleccionar los datos relevantes. El enunciado permanece visible, incluidas las tablas que forman parte de él.
2. Elegir el dato que se busca. Si faltan operandos, el feedback indica que ese objetivo aún no está disponible.
3. Seleccionar o construir una operación para ese objetivo. En nivel 3 se justifica la relación antes de calcular.
4. Calcular el resultado exacto usando unidades visibles. Al confirmar, el dato se incorpora a los disponibles y actualiza el modelo.
5. Continuar con el siguiente objetivo. La ronda puede incluir de 2 a 9 operaciones según el caso y la estrategia.
6. Interpretar las cantidades que responden a la pregunta original. Cuando se requiere un entero contextual, el razonamiento que determina cómo redondear es parte de la respuesta.

| Nivel | Exigencia |
| --- | --- |
| 1 | Elección entre expresiones con cantidades concretas, datos disponibles a la vista y representación con un control directo. Los apoyos son opcionales. Los contextos adolescentes siguen siendo propios de la edad. |
| 2 | Construcción de la expresión con operador y operandos, selección más autónoma de los datos y consulta voluntaria del esquema. Algunas familias admiten nuevas rutas desde este nivel. |
| 3 | Construcción, justificación de cada operación e interpretación, con un dato distractor adicional. Según la familia, también cambian las dependencias, restricciones o partes del enunciado. Se mantienen apoyos bajo demanda. |

Las ayudas ofrecen, por orden, una orientación conceptual, una relación entre cantidades, una representación y una explicación guiada. El primer error en selección, cálculo o interpretación permite volver a intentar. Una explicación guiada puede completar el paso y se distingue de una respuesta propia. La guía de selección no muestra el resultado del cálculo. La guía de cálculo sí puede mostrarlo cuando se pide explícitamente.

## Banco y ejemplos

El banco nuevo tiene 34 estructuras distribuidas entre las cuatro franjas y 306 instancias. Cada estructura tiene tres variantes numéricas en cada uno de los tres niveles. El recuento de estructuras usa operación, origen de operandos, unidad, dependencias y tipo de modelo, excluyendo nombres y magnitudes. Hay conceptos que se retoman en franjas distintas con otra exigencia. Se mantienen las 144 instancias de R19 en el contrato anterior, fuera de las 306 nuevas.

| Franja | Estructuras | Instancias | Familias |
| --- | ---: | ---: | --- |
| 8–10 | 6 | 54 | Parte y todo, comparación aditiva, cambios sucesivos, grupos iguales con sobrante, reparto tras una reserva y cantidad inicial desconocida. |
| 11–12, ruta existente primaria | 8 | 72 | Tarifa por unidad, reparto en razón, reagrupación, fracción de una cantidad, comparación multiplicativa, subtotales independientes, coste y cambio con decimales y lectura de tabla acumulada. |
| 13–15 | 10 | 90 | Descuento e impuesto, proporcionalidad inversa con pausa, escala y conversión, distancia a dos ritmos, variación neta de una serie, ecuación de una incógnita, comparación de ofertas, presupuesto con partidas, consumo por unidad y capacidad con cupos. |
| 16–18 | 10 | 90 | Cruce de tarifas, presupuesto con dos partidas, sistema de entradas, interés simple con comisión, optimización entera, tendencia relativa, eficiencia normalizada, viaje con reserva, umbral de costes y dos restricciones simultáneas. |

La etiqueta histórica de la ruta primaria sigue siendo «10–12» en el perfil. La elección de banco respeta la ruta guardada, incluido el solapamiento a los 10 años. La familia sigue disponible desde la ruta de 8–10 y no se añade a 6–7.

- **8–10.** Si se reúnen 12 y 7 libros y se prestan 4, quedan 15. En niveles 2 y 3 también se puede descontar primero del primer grupo y luego añadir el otro, con el descuento como reorganización hipotética.
- **11–12.** Con cuatro cajas de 12 botellas y bandejas de 6, se llenan ocho bandejas. Se puede obtener primero el total de botellas o calcular las bandejas que aporta cada caja y multiplicar.
- **13–15.** Un presupuesto de 250 € menos cuatro entradas a 35 € y 12 € de gestión deja 98 €. Se comprueban por separado el producto, la suma y la resta. La bicicleta de 240 € con descuento del 15 % e impuesto hipotético del 21 % cuesta 246,84 €. Se pueden calcular los importes parciales o aplicar los factores equivalentes.
- **16–18.** Con las tarifas de 25 € más 8 €/h y 10 € más 11 €/h, A ahorra 6 € a las siete horas y las tarifas coinciden a las cinco. Se aceptan costes individuales, diferencias lineales y, en niveles 2 y 3, interpolación de dos filas. En el viaje con reserva, se puede reunir primero transporte y comida o restarlos por separado. Se registra si se interpreta correctamente el máximo de noches completas.

Los modelos incluyen barras de parte y todo, comparación, grupos, fracciones, tablas de reparto y proporcionalidad, gráficos de datos, cantidades dependientes y expresiones algebraicas. Los valores desconocidos se indican como pendientes. Un diagrama sin cantidades suficientes para usar escala se identifica como esquema. Las tablas tienen encabezados y los gráficos tienen una representación textual. Los problemas con euros indican expresamente la moneda del ejemplo, incluso en las variantes donde el euro no es local.

## Contrato y compatibilidad

- La petición conserva `client_revision: 19` y añade `math_problem_version: 2` únicamente en esta familia. Las peticiones matemáticas R19 sin el campo reciben su banco y contrato anteriores. Las revisiones de R18 se prueban sin ese campo. Si se sirve un backend anterior a R19.1, la web muestra un aviso de actualización en esta familia.
- Los nuevos ítems usan `math-problem-v2:<franja>:<nivel>:<familia>:<variante>` y `mathVersion: 2`. Los IDs R19 `math-problem-v1` siguen siendo válidos. Se conserva el código de área del perfil.
- El registro usa `gliax.exercise-metrics.v1`, `modality: math_problem_steps` y `definition_version: 2`. Cada operación registra posición, objetivo, operador, estrategia, intentos, corrección al primer intento, justificación cuando corresponde, ayudas por fase y resolución guiada o autónoma. El resumen guarda nivel, complejidad, familia, estrategia, secuencia completada, interpretación y recuentos sin ayuda, con recuentos separados para el primer intento. Una ronda interrumpida no se guarda como completa.
- El registro usa el mecanismo de resultados existente. Las observaciones R19 de versión 1 siguen disponibles y las métricas guiadas quedan fuera de la precisión matemática convencional. Los informes leen las dos versiones. No hay migraciones, cambios de cuotas, permisos, RLS, JWT ni CSP. El flujo matemático es interactivo y la exportación de fichas sigue usando su catálogo anterior.

## Matriz de aceptación

| Criterio | Estado | Evidencia o límite |
| --- | --- | --- |
| 1. Tres niveles por franja | Implementado y probado | Banco y endpoint local en las 12 combinaciones. Chromium recorre los tres niveles con perfiles ficticios. |
| 2. Operaciones individuales | Implementado y probado | Rondas completas con expresión, cálculo y métricas por paso. Incluye el presupuesto de tres operaciones. |
| 3. Encadenar resultados | Implementado y probado | Se comprueba la disponibilidad de operandos, el bloqueo de un objetivo prematuro y el uso del resultado en pasos posteriores. |
| 4. Equivalencias previstas | Implementado y probado | Se ejecutan todas las rutas del banco, con verificación numérica independiente y pruebas de conmutatividad y dependencias independientes. Chromium recorre la estrategia alternativa del viaje. |
| 5. Estrategias no verificables | Implementado y probado | Fórmulas fuera del modelo y coincidencias numéricas sin evidencia reciben estado neutro. Chromium confirma que una fórmula libre no verificada no aumenta intentos. |
| 6. Contextos adecuados a adolescentes | Implementado, pendiente de validación | Se entregan los casos previstos en ambos tramos adolescentes y se comprueban sus respuestas. Queda pendiente el criterio curricular y editorial humano. |
| 7. Diversidad estructural | Implementado y probado | Se comprueban 34 estructuras distribuidas entre las cuatro franjas y 306 instancias. La equivalencia entre casos no se deduce de etiquetas ni números. |
| 8. Modelos visuales | Implementado, pendiente de validación | Se comprueban relaciones y unidades automáticamente y se inspeccionan capturas de Chromium. Queda pendiente la valoración didáctica y con lectores de pantalla. |
| 9. Feedback progresivo | Implementado y probado | Chromium cubre errores de orden, operación, justificación, cálculo e interpretación, reintento y explicación guiada con cuatro ayudas. |
| 10. Autonomía y ayudas | Implementado y probado | Se contrastan registros con y sin ayudas, cálculo correcto y resolución guiada. |
| 11. Compatibilidad histórica | Implementado y probado | Edge conserva las revisiones previas. Se comprueba lectura de versiones 1 y 2, persistencia, reentrada y separación de la precisión histórica. |
| 12. Pruebas relevantes | Implementado y probado en local | Banco, batería Node, Deno, Chromium de Matemáticas, regresiones R19 y A–C, sesiones mixtas y prueba del artefacto Pages con cabeceras CSP. |

## Pruebas ejecutadas

- `npm test` pasó 318 pruebas. Se ejecutaron también el banco focalizado y la prueba del handler con las 12 combinaciones de franja y nivel. Las ocho variantes regionales pasaron la validación automática de entrega.
- Deno 2.9.6 comprobó los tipos de `request-learning-content/index.ts`.
- Chromium probó el flujo nuevo y las regresiones de R19, A–C y sesiones mixtas. Se revisaron capturas de escritorio, tableta y móvil con el modelo de barras, la expresión activa, el error de cálculo, las ayudas y la interpretación final.
- Chromium abrió el artefacto Pages local construido con configuración de prueba. Las cabeceras CSP se sirvieron efectivamente. Se probó la carga de Matemáticas, Word, el solucionario en ZIP, CSV y XLSX sin solicitudes imprevistas.

## Incidencias de verificación

La primera batería detectó tres problemas de integración. La función Edge añade metadatos a la dificultad durante la normalización, el localizador exige contexto explícito para euros y la regresión de empaquetado enumera las importaciones en orden. Se corrigieron la comprobación del nivel, el contexto monetario y la lista esperada de importaciones. En Chromium se ajustaron el seguimiento de entregas al recargar y el selector de la captura de la actividad ficticia.

## Revisión pendiente y alcance

Las estrategias abiertas requieren revisión humana cuando quedan fuera del grafo. El analizador libre cubre operaciones elementales con operandos numéricos y resultados exactos, incluidas fracciones. La revisión humana también debe cubrir naturalidad, currículo por edad, calidad de distractores, selección de modelos y lectores de pantalla en dispositivos reales. Las pruebas usan Edge local con autenticación y persistencia ficticias. Los registros de banco, Deno, navegador y CSP y las capturas están en `/workspace/gliax-r19-1-evidencia`.

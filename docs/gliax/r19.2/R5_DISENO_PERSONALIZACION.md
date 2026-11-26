# GLIAX R19.2 · Diseño de personalización longitudinal

Propuesta para revisión posterior. R5 conserva el almacenamiento, la corrección y los tres niveles actuales.

## Datos disponibles

| Origen | Información utilizable | Límite al interpretarla |
| --- | --- | --- |
| Resultado confirmado de `exercise_results` | Perfil propietario, ID del intento, fecha, ID e inicio de sesión si existen, área, nivel, acierto booleano o ausencia de puntuación, puntos, ID de actividad y `detail`. | El ID de intento deduplica reintentos de red. El registro no representa necesariamente el primer intento pedagógico. Los puntos incluyen bonus y no miden dominio. Algunos registros históricos carecen de ID de intento o sesión. |
| `learner_profiles.progress` | Historial reciente de la app, niveles y sus puntos de control, configuración por franja. Algunas filas incluyen familia y revisión de velocidad, `responseMs`, `timingValid` y resumen de interacción. | La app recorta su historial a 5.000 filas. Al recuperar solo filas confirmadas, los campos que no se serializaron en `detail` pueden faltar. No usar cero como valor por defecto de un tiempo ausente. |
| `detail` con `gliax.exercise-metrics.v1` | Modalidad y versión cuando se capturaron, familia o variante en algunos recorridos, medidas específicas de la modalidad. | La familia y el mecanismo no son dimensiones uniformes del esquema. Un valor histórico o una etiqueta de área requieren una correspondencia revisada. |
| Progreso por sesión | Agrupa ejercicios puntuables por sesión, o por fecha si no hay ID de sesión. Cuenta registros, aciertos y precisión. Espera guiada, reglas y otras prácticas aparecen por separado. | Los agrupamientos por fecha son aproximados. El porcentaje por sesión mezcla tareas y no se debe usar directamente para recomendar un mecanismo. |
| Matemáticas R19.1 | Elección y cálculo por paso, número de intentos, primer intento, interpretación final, estrategia, ayudas y resultados sin apoyo bajo `math_problem_steps` v2. | Práctica con métricas específicas. Su resultado no equivale a acierto convencional ni se mezcla con la v1 o con otras modalidades. |
| Modalidades cronometradas y reglas históricas | Algunas tareas registran ensayos, aciertos, errores, omisiones y cambios de regla. Velocidad puede conservar un tiempo válido de pantalla, y la escritura de palabras separa tiempos por fase cuando está medida. | Espera guiada registra duración de la práctica, no inhibición. Tiempos de distintas presentaciones, dispositivos o con interrupciones necesitan reglas explícitas de comparabilidad. |
| CP, EC, IN y AR de R19.2 | El corrector local conoce estado, versión y, según la familia, dependencias, evidencia, etapa de ayuda o conteos de ensayos. R4 conoce exposición reciente. | La práctica se descarta al salir. Hoy carece de historia longitudinal y de registros confirmados por perfil. Las familias homónimas históricas tienen contratos distintos. |

El primer intento, la respuesta final, la autonomía y el tipo de error pueden distinguirse en algunos contratos versionados. La distinción está ausente en una respuesta convencional y no puede reconstruirse a partir de puntos o del número de veces que se reintentó el guardado. El tiempo de la ronda AR actual no se mide.

## Datos que faltarían

- En todas las familias, una ficha de ítem versionada con mecanismo, nivel, modo de respuesta, familia, estructura del problema y validez de la observación. Haría falta distinguir intento inicial y final, ayuda consultada antes de cada uno, abandono, omisión y respuesta pendiente de revisión, con una referencia idempotente de actividad.
- En CP, el tipo de condición vulnerada, el resultado del plan y la presencia de una justificación evaluable. En EC, separar clasificación y evidencia y distinguir incertidumbre, actualización y cumplimiento.
- En IN, clasificación espontánea y final, ayuda vista, tipo de ayuda usada y revisión humana cuando proceda. No se requiere persistir la frase original, su huella, audio ni transcripción.
- En AR, ensayos puntuables, señales por separado y categorías de comisión, omisión y elección de botón solo cuando la mecánica correspondiente las permite. Una medición de tiempo requeriría condiciones registradas y revisadas antes de hacer comparaciones.

## Arquitectura y reglas preliminares

1. Construir un adaptador puro que traduzca resultados confirmados a una vista versionada por perfil. La clave de comparación incluiría familia, mecanismo, nivel, versión de corrección, tipo de respuesta y comparabilidad de la presentación. Una fila cuya versión o mecanismo sea incierto se conserva en Progreso y se excluye de la recomendación. Conservar muestras espontáneas y asistidas separadas y deduplicar las filas antes de agregar.
2. Mantener intactos los filtros de R4 por edad, nivel y modalidad y su prevención de repeticiones inmediatas y ciclos. Aplicar un factor acotado al peso de las estructuras elegibles, después de agrupar variantes cosméticas. Por ejemplo, investigar un intervalo de 1 a 1,25 para refuerzo supervisado. El factor no puede dar peso cero al resto del banco ni anular la ventana de diversidad. Con evidencia escasa, usar el selector R4 tal como funciona hoy.
3. Conservar niveles 1, 2 y 3. Formular sugerencias separadas de mantener, reforzar un mecanismo o probar el nivel siguiente con acompañamiento. El profesional decide y puede descartar la sugerencia. Como hipótesis para simulación, exigir al menos ocho observaciones válidas en tres sesiones y tres estructuras comparables antes de sugerir progresión. Revisar el umbral con datos sintéticos y evaluación pedagógica. En nivel 3 se ofrecen refuerzo y variedad dentro del nivel. No hay ascensos ni descensos automáticos.
4. Explicar la sugerencia con código de razón, tamaño y periodo de la muestra, versión y presencia de ayuda. Distinguir progreso espontáneo, acierto tras ayuda y falta de evidencia. Un estado no interpretable o una ronda incompleta no reduce la estimación. La latencia quedaría fuera del primer piloto y solo se estudiaría después, en modalidades con tiempo válido y comparabilidad documentada.

## Privacidad y riesgos

El análisis opera solo con resultados confirmados del perfil seleccionado y con autorización comprobada en servidor. El cambio de perfil y el cierre deben invalidar cálculos en curso y cachés. Las sesiones independientes mantienen la separación ya existente. No se agregan resultados entre perfiles o cuentas para emitir recomendaciones individuales. Evitar nombres, datos de salud, texto libre, transcripciones, identificadores de paciente, telemetría de terceros y tiempos de dispositivo innecesarios. La referencia interna del perfil permanece en el límite de acceso y no pasa al selector ni a su explicación. Revisar retención, exportación, eliminación, minimización e información a responsables antes de habilitar cualquier dato adicional.

La familiaridad con un contexto, la lectura, el dispositivo y las ayudas pueden afectar al resultado. Separar esas demandas, controlar la diversidad y permitir abstención cuando el banco sea pequeño. Evitar inferencias sobre diagnóstico, capacidad general, deterioro o efecto clínico. Una recomendación se refiere a práctica supervisada dentro de una modalidad y una versión concretas.

## Plan posterior y pruebas

- Auditar qué proporción de filas sintéticas puede asignarse a contratos conocidos. Crear casos con versiones mezcladas, datos incompletos, reintentos de red, ayudas y observaciones no puntuables.
- Probar reconciliación e idempotencia, comparación dentro del mismo nivel, separación entre perfiles y sesiones, expiración, exportación y eliminación. Probar que una respuesta inválida, un tiempo interrumpido o un estado no interpretable no reduce una estimación.
- Simular historiales de inicio, estables, de refuerzo, con cambio de nivel y sin evidencia. Con la misma semilla, versión del algoritmo e historial canonizado, exigir la misma selección y explicación. Cambiar el orden de las filas y comprobar que no cambia la decisión. Probar umbrales, abstenciones, bancos de uno o dos casos y comportamiento sin apoyo histórico.
- Comparar diversidad de contextos, estructuras y mecanismos con R4 mediante simulaciones estratificadas. Comprobar que un beneficio predictivo en un grupo no reduce la variedad o la accesibilidad de otro. Someter el flujo y las explicaciones a revisión por profesionales y usuarios antes de cualquier persistencia comercial.

Referencias del repositorio: `js/api.js` (resultados confirmados), `js/app.js` (sesiones e historial), `js/progress-report.js` (proyecciones), `js/math-problem-renderer.js` (métricas v2), `js/gliax-r192-selector.js` (diversidad) y las notas R1–R4.

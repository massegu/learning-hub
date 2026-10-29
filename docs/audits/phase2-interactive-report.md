# Fase 2 — Primera entrega interactiva

Esta entrega inicia la fase 2 del roadmap. Añade una pestaña **Retos interactivos** a Atención, Memoria y Funciones ejecutivas en las cinco franjas. No sustituye los documentos, las fotografías ni los ejercicios anteriores. La fase 1 está fusionada en `d46fa3b` y su workflow de publicación terminó correctamente.

El banco contiene **270 actividades en total, distribuidas por edad, nivel y contexto**, correspondientes a **nueve familias**, cinco edades, tres niveles y dos situaciones: preparar materiales en casa o en un taller. No son 270 mecánicas distintas. La entrada específica evita depender de que una muestra aleatoria presente la novedad. La autenticación, cuota y selección del servidor se mantienen; los clientes anteriores a revisión 9 no reciben la modalidad nueva. No se han añadido tablas ni identificadores personales.

| Familia | Acción en pantalla | Constructo principal | Lectura | Visión | Manejo |
|---|---|---|---|---|---|
| Cancelación | Marcar objetivos entre distractores | Búsqueda visual | Mínima | Media | Selección |
| Comparación | Marcar en B las posiciones distintas de A | Comparación visual | Mínima | Media | Selección |
| Instrucciones visuales | Pulsar objetos siguiendo el modelo | Seguimiento de instrucciones | Baja | Media | Secuencia |
| Recuerdo serial | Reconstruir el orden después de ocultarlo | Memoria a corto plazo; trabajo al invertir | Mínima | Media | Secuencia |
| Recuerdo espacial | Marcar posiciones en una cuadrícula vacía | Memoria espacial a corto plazo | Mínima | Media | Selección |
| Actualización | Sustituir un objeto del recuerdo | Memoria de trabajo | Baja | Media | Secuencia |
| Cambio de regla | Responder A/B y ajustar la respuesta | Flexibilidad | Baja | Media | Selección |
| Respuesta/espera | Responder al libro e inhibir ante la pelota | Inhibición | Mínima | Media | Selección |
| Plan ejecutado | Pulsar acciones respetando dependencias | Planificación | Baja | Baja | Secuencia |

Cada actividad declara `primaryConstruct`, `secondaryLoads`, `readingDemand`, `visualDemand` y `motorDemand`. Las de memoria distinguen además `shortTermMemory` y `workingMemory` mediante `memorySystem`. Estos campos describen la tarea, no una capacidad o diagnóstico del usuario. Inventario reproducible: [matriz completa](phase2-executed-loads.json), regenerada con `node scripts/audit-executed-tasks.js`.

## Progresión

En 6–7, las cuadrículas pasan de cuatro a seis posiciones y las secuencias se limitan a dos o tres elementos. La comparación y el recuerdo espacial aumentan posiciones relevantes. En L3 la cancelación busca dos modelos y las secuencias pueden requerir inversión; actualización combina sustitución e inversión. Los bloques de reglas pasan de cuatro a ocho tarjetas. Las acciones del plan son breves y el nivel superior introduce una comprobación explícita. En mayores aumenta también la carga de cuadrícula y las secuencias llegan a cinco elementos. No se aumenta la dificultad solo mediante texto.

## Presentación y accesibilidad comprobada

- Una fila desplazable de botones mantiene todas las actividades a la misma altura, sin desbordar la página. La tecla Tab y el foco nativo permiten recorrerla.
- Los pictogramas existentes de búsqueda en velocidad miden 64 px en escritorio y 56 px en móvil. Se conservan las ilustraciones originales.
- Inicio explícito, botones nativos, etiquetas accesibles, estado de selección con marca además de color y foco visible. No se exige arrastrar ni usar atajos.
- Las imágenes de memoria desaparecen del DOM antes de responder. No se muestra la respuesta objetivo en etiquetas de las casillas vacías.
- Cambiar de pestaña o abandonar el ejercicio cancela los temporizadores. Los intentos interrumpidos o reiniciados no se registran. Solo se guarda el resultado del bloque terminado, no cada tarjeta.
- El feedback describe una estrategia aplicable al ejercicio, sin afirmar capacidades personales. Las tareas no generan métricas de velocidad nuevas.
- Las fichas conservan la fuente y las instrucciones. Son práctica en papel; no reproducen la ocultación ni la medición temporal de la pantalla.

[Comparación en móvil](../review-assets/phase2/compare-mobile.png) · [Botones alineados](../review-assets/phase2/toolbar-desktop.png) · [Pictogramas de velocidad](../review-assets/phase2/speed-mobile.png)

## Validación y límites

Las pruebas nuevas cubren el banco completo, sus variantes regionales, fuentes/contratos alterados, cálculo independiente de objetivos, coordenadas, cambios y reglas, límites por edad y bloqueo de modalidades incompatibles antes de escrituras. El recorrido de navegador completa las nueve mecánicas en las edades extremas, prueba teclado, memoria oculta, interrupción, 390 px, exportación Word, altura de botones y tamaño efectivo de pictogramas. Se ejecutan además las suites y recorridos anteriores.

Esta entrega **no cierra toda la fase 2**. Quedan la desaparición y movimiento en escenas como recuerdo interactivo, más asociaciones, microhistorias, instrucciones recordadas de varios pasos, clasificación/distribución de recursos y corrección directa de planes. No se han rediseñado ni ampliado las fotografías. La inhibición usa ventanas fijas (3 s en 6–7 y 2,5 s en mayores); se ofrece reinicio, pero aún no un ajuste de esa ventana por el profesional. No se ha realizado una auditoría WCAG completa ni una evaluación con usuarios o lectores de pantalla externos. Los resultados de estas mecánicas no deben compararse como si fueran equivalentes a los ejercicios anteriores.

No fusionar automáticamente. La publicación requiere el backend de esta rama antes que el frontend de revisión 9; el workflow conserva ese orden.

La comprobación remota opcional de compilación en Supabase no pudo ejecutarse: la API rechazó el token configurado en el entorno (HTTP 401). El paquete completo sí se ejecutó en el harness local; no se ha reemplazado la función publicada. La credencial de GitHub Actions es independiente y no se ha modificado.

Validación de esta entrega: 219 pruebas Node, nueve Python y 16 recorridos de navegador correctos. Las comprobaciones afectadas por los ajustes finales de progresión y presentación se repitieron, incluida la prueba de un solo registro por bloque.

# Reconstrucción A–C de GLIAX

Rama local `reconstruccion/gliax-a-g-h`. Base `50af0f066c8b4c120263b2c9a2914871a77de812`. Se contrastó la guía de diseño con el inventario de evidencias de `/workspace/gliax-respaldos`. La base ya ofrecía ayudas de lectura, tarjetas de contradicción con fuentes separadas, prácticas de espera con métricas propias y un banco de vocabulario por categoría. Esas funciones se reaprovecharon.

| Requisito | Cambio y alcance |
| --- | --- |
| A1–A4 | Las ayudas de lectura se montan en los ejercicios de lectura con material, incluida comprensión. Secciones de enunciado, situación, material y respuesta en el mismo orden. Fuentes con formas diferenciadas y una opción monoespaciada para estímulos de códigos. Altura reservada para estímulo y cambios de reglas. |
| A5–A7 | Ajuste de volumen y muestras de «Escucha y actúa» antes de empezar. Refuerzo de acierto suave, optativo y desactivado inicialmente. Se omite durante locución, en prácticas auditivas y en actividades de atención, memoria, velocidad o reglas. Verificación de escritorio y móvil en Chromium. |
| B1–B2 | «Actúa con reglas» admite espacio, toque en el estímulo y botón visible. Las teclas mantienen su comportamiento habitual dentro de controles. «Reglas y planificación» mantiene botones y admite atajos en ensayos de respuesta. Los ensayos de inhibición carecen de cuenta atrás visible. «Mira y actúa» muestra la barra en la práctica guiada con la señal explícita de espera. |
| B3–B5 | «Sesión aleatoria» usa una tanda de familias cognitivas diferentes, ajustada a los niveles seleccionados en cada área. «Descubre quién» avanza con los descartes acumulados que corresponden a las pistas visibles y conserva los descartes. La consigna de diferencias toma el total de las respuestas canónicas. En nivel 1 se pide una diferencia del detalle indicado. |
| B6–B8 | Progresión de asociaciones con menos pares al inicio y en el nivel 2 donde correspondía. El nivel 1 usa un distractor no presentado. En el nivel 2, todas las opciones se han visto y se da más exposición por par que en el nivel 3. «Cambio de plan» revela el plan completo después de comprobar. Los ejercicios de secuencias junior, incluida «La canción del grupo», dan restricciones y acciones desordenadas. |
| C1–C2 | «Palabras que caen» en Lenguaje, con velocidades, pausa, confirmación y modo quieto. Actividad original y solo de pantalla. La ronda incluye aciertos, errores y omisiones. |
| C3–C5 | «La palabra que encaja» admite escritura como modalidad principal y selección múltiple en 6–7 y 8–10 años, niveles 1–2. En Lenguaje ejercita búsqueda léxica. En Velocidad de procesamiento ofrece una práctica de selección por reglas sin cronómetro. El vocabulario revisado permite otras respuestas que cumplan la consigna. Una palabra fuera del vocabulario revisado no genera una calificación. |

## Contratos y resultados

- `guided_wait` conserva su definición y registra la finalización del intervalo con `correct: null`. Las observaciones de los gestos de «Mira y actúa» y «Escucha y actúa» siguen el registro de práctica observado.
- `rule_application` registra `definition_version: 2` en las modalidades que incorporan los nuevos controles. Los tiempos se toman únicamente al observar una respuesta. Las omisiones y la ausencia de respuesta que pide una regla se cuentan por separado. Los registros anteriores mantienen su significado.
- `memory_association`, `plan_update`, `planning_constraints` y `word_fit` registran su revisión en `detail`. La selección de palabras exige marcar todas las opciones válidas. Para la producción léxica se toleran mayúsculas y tildes cuando la ortografía no forma parte de la consigna. La ñ conserva su identidad.
- `falling_words` registra aciertos, errores y omisiones. Anota el intervalo desde aparición hasta la primera entrada y desde la primera entrada hasta confirmar si los eventos existen. Los intervalos excluyen la pausa y dependen de lectura, dispositivo y forma de entrada. Se conservan ritmo y presentación. El texto introducido se descarta. La transcripción distingue tildes y ñ. Su resultado se guarda como práctica con `correct: null` y queda fuera de precisión, rachas y avance automático de nivel.
- El protocolo conserva la revisión 13 en las solicitudes habituales. La revisión 14 habilita los selectores explícitos de transcripción y de vocabulario en Velocidad de procesamiento. La transcripción queda fuera del banco por defecto y de Word. Se mantiene el contrato canónico de las fotografías y se ajusta la consigna en la interfaz.

## Archivos y pruebas

- Aplicación web en `index.html`, `css/styles.css`, `js/app.js`, `js/modality-catalog.js`, `js/cognitive-renderer.js`, `js/executed-renderer.js` y `js/falling-words.js`.
- Banco compartido en `js/cognitive-families.js` y `js/curriculum.js`. La Edge Function requiere sus dos copias idénticas en `supabase/functions/request-learning-content/`, además de `index.ts` y `junior.js` del mismo directorio.
- Regresiones nuevas en `tests/reconstruction-ac.test.js` y `tests/browser-reconstruction-ac.py`. Pruebas existentes actualizadas en `tests/cognitive-families.test.js`, `tests/browser-cognitive-families.py` y `tests/browser-executed-tasks.py`.
- Batería de Node de currículo, familias, tareas ejecutadas, interacción, junior, fotos, código y paquete Edge. Chromium usa el servicio local y perfiles ficticios. Las capturas nuevas se escriben solo si se indica un directorio separado mediante `GLIAX_AC_CAPTURAS`.
- Pendiente de validación profesional el ajuste de carga de memoria y la adecuación de vocabulario por edad. El volumen en Chromium se comprueba con voz simulada. La percepción en equipos físicos y la experiencia con otros navegadores y lectores de pantalla requieren una revisión posterior.

El trabajo conserva la política actual de códigos personalizados y el historial de perfiles. Esta reconstrucción abarca la aplicación local y el contrato de la Edge Function para A–C.

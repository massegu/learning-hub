# GLIAX R19

Rama local `feat/gliax-r19-refinamiento-integral`, creada desde `f17c80bc835848f3a71141a544b458a52848b82e` de `chore/gliax-codex-skills-r19-20261122`. Las pruebas usan perfiles ficticios y el código de la Edge Function local.

| Requisito | Estado | Comportamiento y evidencia |
| --- | --- | --- |
| R19-01 · La palabra que encaja | Implementado | «Gorrión», «mirlo», «jilguero» y «paloma» se aceptan para la consigna de aves que vuelan y anidan en árboles. El sistema reconoce contraejemplos como «pingüino» y explica el rasgo incumplido. Las palabras sin evidencia suficiente reciben `unverifiable`. Chromium comprueba que continuar después de una respuesta no verificable no escribe un resultado ni suma un error. |
| R19-02 · Palabras en caída | Implementado | El texto explica el avance automático al completar la palabra. Sigue disponible la confirmación accesible. Al terminar se ocultan los ajustes y queda el botón para continuar. Verificado en Chromium con una ronda completa. |
| R19-03 · Matemáticas y Geometría | Implementado | El acceso a Matemáticas incluye formas, simetrías, perímetros y cuerpos geométricos. La orientación en mapas se encuentra en Funciones ejecutivas. Se conservan la referencia de origen y las rutas de compatibilidad de R18 y Word. Los tests de Edge comprueban las entregas y que las peticiones inválidas se rechazan antes de contabilizarse. |
| R19-04 · Lenguaje | Implementado | Los selectores, el banco y la entrega de revisión 19 excluyen las simulaciones digitales de Lenguaje. Se conservan Gramática, Ortografía, Vocabulario y «La palabra que encaja». Las simulaciones de lectura siguen disponibles en Lectura y escritura. |
| R19-05 · Simulaciones digitales | Implementado en local | Conversaciones, publicaciones, vídeos cortos, historias, búsquedas, privacidad y agenda tienen estructuras HTML propias. Se probaron siete formatos en Chromium a 390, 834 y 1440 px. El catálogo incluye selección, ordenación, contradicciones, completar y escritura supervisada. Queda pendiente la revisión editorial humana de las ocho variantes regionales. |
| R19-06 · Ayudas para leer | Implementado en local | Coloración silábica y guía manual independientes, desactivadas al abrir el texto. Conservan el texto, el orden y la semántica del documento. Chromium verifica ambos controles y que un cartel permanece intacto. La guía y el color requieren CSS Custom Highlight. Los términos ambiguos o desconocidos conservan su presentación normal. |
| R19-07 · Resolución de problemas | Implementado en local | 144 problemas deterministas desde los ocho años. Las fichas visuales y barras se retiran progresivamente. El flujo registra cinco pasos por separado. Node contrasta las operaciones y soluciones de todo el banco, y Chromium completa el recorrido de extremo a extremo contra Edge local. |
| R19-08 · Progreso | Implementado | «Actividad en el tiempo» y la tabla exacta de sesiones se conservan. El gráfico redundante desaparece. La comparación exige la misma familia, nivel, constructo, variante, versión, respuesta y criterio de puntuación, con un mínimo de tres observaciones en cada periodo. Chromium comprueba gráficos y tabla. |

## Archivos de aplicación

| Requisito | Archivos |
| --- | --- |
| R19-01 | `js/cognitive-families.js`, `js/cognitive-renderer.js`, `js/app.js`, y la copia Edge de `cognitive-families.js`. |
| R19-02 | `js/falling-words.js`, `css/styles.css`. |
| R19-03 | `js/app.js`, `js/functional-content.js`, Edge `index.ts` y la copia de `functional-content.js`. |
| R19-04 y R19-05 | `js/app.js`, `js/communication-content.js`, `js/activity-model.js`, `js/content-policy.js`, `css/styles.css`, Edge `index.ts` y las tres copias de los módulos de contenido. |
| R19-06 | `js/reader-assist.js`, `js/activity-model.js`, `js/app.js`, `css/styles.css` y la copia Edge de `activity-model.js`. |
| R19-07 | `index.html`, `js/app.js`, `js/curriculum.js`, `js/activity-model.js`, `js/math-problem-renderer.js`, `js/progress-report.js`, `css/styles.css`, Edge `index.ts` y las copias de `curriculum.js` y `activity-model.js`. |
| R19-08 | `js/progress-dashboard.js`. |

## Compatibilidad y límites de validación

- La selección nueva de ejercicios usa `client_revision: 19`. Se probó la entrega anterior solicitando explícitamente R18. No se reescriben historiales ni identificadores de favoritos. Los registros sin versión siguen visibles en los recuentos y en la tabla de sesiones.
- Los veredictos escritos R19 usan la definición 4 de `word_fit`. No se guardan las palabras enviadas para cotejo léxico. Una respuesta `unverifiable` puede revisarse con el profesional durante la actividad.
- Los resultados guiados de Matemáticas usan `math_problem_steps` versión 1 y quedan fuera de la precisión histórica. Las fichas Word mantienen el catálogo imprimible anterior. El nuevo flujo de problemas depende del feedback tras cada paso. Se conserva la asignación de edad ya existente en los perfiles, incluida la franja primaria de 10–12 en la aplicación.
- Las pruebas cubren las ocho variantes mediante localización y validación de entregas. La revisión humana de dialectos, progresión pedagógica y lectores de pantalla sigue pendiente. No existe una ruta propia de exportación PDF para estos cambios.
- Las pruebas locales cubren autenticación sintética, cuotas del handler y aislamiento de perfiles. Una instalación futura en Staging requiere comprobar la interacción real entre la web, Auth y la Edge Function coordinadas. R19 no cambia las cuotas, autenticación, permisos, CSP, facturación ni configuración remota.

## Pruebas

- `npm test` y comprobación de tipos de Edge con Deno 2.9.6. Los tests R19 específicos están en `tests/gliax-r19.test.js` y en el recorrido del handler de `tests/gliax-staging-review.test.js`.
- `tests/browser-gliax-r19.py` prueba los veredictos léxicos, simulaciones y controles de teclado, ayudas lectoras, ronda de mecanografía, recorrido matemático y Progreso. Los recorridos de regresión cubren sesiones mixtas, favoritos, privacidad, cálculo de métricas y familias existentes.
- Se construyó Pages a partir del código local con una clave publicable ficticia. Chromium recibió las cabeceras HTTP generadas y comprobó DOCX local, ZIP con ficha y solucionario, CSV y XLSX, sin infracciones CSP ni peticiones a nuevos orígenes.
- Evidencias de la ejecución en `/workspace/gliax-r19-evidencia`, con capturas de los siete formatos en escritorio, tableta y móvil, y muestras de Matemáticas y Progreso.

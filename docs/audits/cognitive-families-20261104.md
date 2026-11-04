# Familias cognitivas funcionales — revisión del 4 de noviembre de 2026

Base: `desarrollo`, commit `8fafe69` (PR #25 ya fusionada). Rama de entrega: `improve/functional-cognitive-families`. No se fusiona ni se publica automáticamente.

## Acceso y alcance

En las áreas compatibles aparece **Situaciones y decisiones**, con selector de familia o mezcla. Funciones ejecutivas reúne las seis; Lenguaje ofrece La palabra que encaja; Atención ofrece selección de información y contradicciones; Lectura + Escritura ofrece contraste de fuentes. Los modos anteriores siguen disponibles. Las nuevas familias se entregan después de autenticar, comprobar propiedad del perfil, suscripción y cuota; no se generan respuestas locales después de un rechazo del servicio.

| Familia | Operación principal y transferencia | L1 → L2 → L3 | Papel |
| --- | --- | --- | --- |
| Actúa con reglas 2.0 | Inhibir una respuesta; mantener y actualizar una instrucción cotidiana | Una regla sin cambios → una inversión → dos inversiones; aumenta el bloque de tarjetas | Solo pantalla; no se simula una prueba temporal en papel |
| La palabra que encaja | Acceso léxico y mantenimiento de restricciones para buscar palabras precisas | Categoría/condición simple en 6–7; dos condiciones desde 8–10 → prefijo o exclusión → mayor especificidad, longitud o terminación, según edad | Sí, con condiciones y opciones; producción desde 8 años |
| Descubre quién | Deducción, descarte y actualización de hipótesis antes de decidir | Pistas positivas → exclusiones → más alternativas y pistas condicionales en adolescentes | Sí: pistas y tabla de candidatos |
| Cambio de plan | Sustituir una acción imposible y reconstruir un plan conservando el objetivo | Plan breve → más pasos → plan ampliado; los mayores añaden horarios, requisitos o alternativas incompatibles | Sí, con plan inicial, imprevisto y alternativas |
| ¿Qué necesitas saber? | Seleccionar datos suficientes para una decisión concreta e inhibir otros relacionados | Dos/tres datos necesarios → más distractores → distractores próximos al mismo contexto | Sí: objetivo y datos seleccionables |
| Encuentra la contradicción | Contrastar dos fuentes antes de actuar, sin decidir arbitrariamente cuál es verdadera | Diferencia visible o dos fuentes breves → datos adicionales → más información de archivo/contexto que filtrar | Sí, incluidas imágenes en 6–7 |

La nueva inhibición está en el selector de familias. Las antiguas Tarjetas con reglas y Señales y acciones se conservan como modalidades anteriores; la cuenta atrás que delataba la espera de las tarjetas puntuadas deja de mostrarse. La cuenta grande de las prácticas corporales sí permanece: sirve para acompañar el gesto y esas observaciones no se califican como una prueba de inhibición.

## Edades

- **6–7:** reconocimiento léxico; cuatro candidatos y dos atributos; planes concretos cortos; contradicción entre nota e imagen; pictogramas grandes y ejemplos de pulsar/esperar antes de empezar. Los estímulos conservan el estilo de Calma.
- **8–10:** seis candidatos en la entrada, hasta diez al aumentar el nivel; dos condiciones léxicas iniciales; materiales, recetas, turnos y taller. Los pasos se pueden leer con acompañamiento.
- **10–12:** más candidatos, exclusiones y pasos; condiciones simultáneas y lectura breve de datos funcionales.
- **13–15 y 16–18:** horarios, solicitudes, proyectos, citas y fuentes de información; hasta doce candidatos, condiciones lógicas en L3, mayor especificidad léxica y diseño Impulso.

No se interpreta el resultado como una capacidad clínica. La tarea registra su desempeño, no un diagnóstico.

## Cantidades, escenarios y auditoría

**6 familias amplias, 6 familias semánticas, 40 identificadores de escenario y 360 variantes renderizadas** en el banco de Funciones ejecutivas: 6 × 4 fuentes × 5 edades × 3 niveles. Las proyecciones de otras áreas y las permutaciones de respuesta no se cuentan como actividades independientes.

Los 40 escenarios incluyen versiones de infancia/adolescencia y cuatro comparaciones visuales propias de 6–7. Ejemplos: patio mojado frente a sala cubierta; unión de piezas sin pegamento; transporte cancelado con límite horario; solicitud firmada sin impresora; datos para decidir si se llega a un ensayo; reserva frente a calendario; encargo frente a imagen entregada. No se cuenta sustituir un nombre como un escenario nuevo.

El [inventario reproducible](cognitive-families-20261104.json) incluye **90 ejemplos representativos** (cada familia, edad y nivel), preguntas, fuentes, soluciones, progresión y notas editoriales. Se regenera con `node scripts/audit-cognitive-families.js`. Las pruebas recorren las 360 variantes y todas las variantes regionales soportadas, comprueban una solución única en deducción/reconocimiento y derivan respuestas a partir de las condiciones, los hechos y las reglas.

La rotación reutiliza el historial existente de entregas. Penaliza familia semántica consecutiva, escenario reciente y patrón mecánico; evita repetir una fuente mientras quedan fuentes nuevas. Al seleccionar expresamente una familia, alterna sus escenarios. No se añaden tablas.

## Mejoras del contenido y presentación existentes

- **Iconos:** Calma mantiene ilustraciones reconocibles; Impulso combina Phosphor Duotone con tres equivalentes de las bibliotecas ya revisadas: llave inglesa de Lucide, flor de Iconoir y auriculares de Tabler. Mapeo estable por objeto; nunca se sortea el estilo durante una tarea de memoria. Se mantienen estados de objetos y significados concretos. SVG y PNG provienen de los mismos vectores locales, con sus licencias conservadas.
- **Lectura + Escritura:** revisión manual de pasajes que necesitaban relaciones causales/temporales más naturales; conectores como «por eso», «sin embargo» y «una vez». Se mantienen frases cortas en 6–7 y la evidencia literal de cada respuesta. Los modelos de escritura enlazan conclusión y cita textual.
- **Memoria:** la secuencia correcta aparece visualmente después de comprobar, también cuando la respuesta es errónea. En actualización, muestra el orden final con el cambio aplicado. La memoria espacial interactiva añade objetos distractores y posiciones únicas; en el currículo, desde 8–10 el L1 usa 3 × 3 y al menos tres objetos. Se conserva 2 × 2 en la entrada de 6–7.
- **Tarjetas sucesivas:** una separación visible de 650 ms distingue estímulos idénticos. El cambio de A/B tiene un aviso propio antes de mostrar la siguiente tarjeta.
- **Legibilidad:** textos de respuesta y estados más grandes, cuenta de espera corporal grande, controles de al menos 48–52 px y foco de teclado visible; se comprueba ancho de 390 px.
- **Social Lab L1, 8–10 y 13–15:** distractores revisados: confundir lo observado con una interpretación, el permiso para grabar con publicar, o el alcance de una petición. Se sustituyen opciones absurdas por errores de interpretación plausibles; las explicaciones citan la situación, sin atribuir intenciones no confirmadas.

## Archivos principales

- `js/cognitive-families.js` y copia desplegable: fuentes, contratos, metadatos, progresión, validación canónica y corrección.
- `js/cognitive-renderer.js`: interacción, teclado, fases, descarte, producción léxica y cierre único.
- `js/app.js`, `index.html`, `css/styles.css`: acceso, feedback de memoria, legibilidad y descarga.
- `js/activity-model.js`, `js/content-quality.js`, `js/curriculum.js`, `js/reading-library.js`, `js/executed-{tasks,renderer}.js`: integración y mejoras existentes.
- `js/complementary-art.js`, `scripts/build-complementary-art.py`: adaptación fiel de iconos licenciados.
- `supabase/functions/request-learning-content/index.ts`: filtros de modalidad, compatibilidad, historial y exportación autenticada.

Las descargas individuales pasan por la misma cuota de fichas; una fuente de otra edad, una clave desconocida o la inhibición temporal se rechazan. El cliente nuevo usa revisión **11**; los clientes antiguos reciben una petición de actualizar al solicitar el contrato interactivo actualizado. Los demás modos mantienen su compatibilidad.

## Evidencias visuales

[Reglas](../review-assets/cognitive-families-20261104/rules.png) · [Palabras](../review-assets/cognitive-families-20261104/words.png) · [Deducción](../review-assets/cognitive-families-20261104/deduction.png) · [Cambio de plan](../review-assets/cognitive-families-20261104/change.png) · [Información](../review-assets/cognitive-families-20261104/information.png) · [Contradicción](../review-assets/cognitive-families-20261104/contradiction.png) · [Secuencia correcta](../review-assets/cognitive-families-20261104/memory-correct-sequence.png).

Capturas de la aplicación real con perfiles ficticios, obtenidas contra el servicio local de pruebas.

## Verificación

- Suite Node completa: **229 pruebas correctas, 0 fallos**.
- 9 pruebas Python de empaquetado/despliegue offline: correctas; el paquete conserva `verify_jwt: true` e incluye el módulo nuevo.
- 17 recorridos de navegador del workflow: correctos tras actualizar las expectativas de revisión del cliente. Incluyen autenticación, facturación, privacidad, documentos, memoria, velocidad, señales, diseño por edad y banco anterior.
- Recorrido nuevo: **90 completados**, uno por familia/edad/nivel; teclado, móvil, cinco DOCX, un solo registro por intento, interrupción sin resultado y palabras no revisadas sin error automático.
- Prueba específica: cincuenta descargas individuales autorizadas; la 51.ª se rechaza por la cuota de fichas. Ese límite no consume la cuota de ejercicios.

No se utiliza Supabase de producción para estas pruebas ni se despliega la función durante la preparación de la rama.

## Límites editoriales

El vocabulario de producción es finito y revisado: una palabra desconocida permite reintentar sin ser marcada como incorrecta. No se afirma comprender cualquier palabra del español. Los escenarios son originales y acotados; las variantes de edad/nivel no sustituyen futuras revisiones con Elena ni una calibración con usuarios. En 6–7 puede ser útil leer la consigna con acompañamiento. Las respuestas de planificación conservan el orden del plan original salvo la acción sustituida: la instrucción explicita esa condición para evitar penalizar un orden alternativo razonable.

# GLIAX · Bloque H

Base de integración `9b74dbe22a1a3f44a011a2be7133131c688d306a`. Se conservaron los commits A–G. Todas las pruebas de perfiles y cuentas emplearon datos ficticios y servicios locales.

## Configuración y generación

- **Selección rápida por áreas** conserva nivel, número de versiones y solucionario. La revisión actual excluye la recuperación con material oculto, intervenciones auditivas, espera, temporización y movimientos en tiempo real. Memoria identifica esta limitación en el selector rápido.
- **Ficha a la carta** permite elegir las cinco franjas, los tres niveles y ocho variantes del español para el documento. La elección queda en la configuración de la ficha. No modifica la franja ni la variante habitual del perfil o de la cuenta. El perfil autenticado autoriza la solicitud y conserva el historial de rotación existente.
- Las actividades se clasifican por un identificador estable de área más tipología. Las cantidades son independientes y cero omite la tipología. Se pueden agrupar por área o cambiar el orden. El contador resume la ficha y la capacidad se comprueba para el paquete completo.
- La revisión 16 de `request-learning-content` valida la configuración, devuelve la disponibilidad y asigna fuentes distintas a cada plaza antes de crear documentos. La comparación ignora identificadores, nombres frecuentes, permutaciones de distractores y cambios numéricos aislados. Se prioriza material que no figure en el historial reciente. Si falta material, se devuelve la tipología y la cantidad disponible. La respuesta carece de versiones parciales y no consume cuota si la asignación es insuficiente. Una actualización concurrente de la cuota en este flujo se detecta y pide reintentar. Los clientes antiguos conservan su mecanismo previo de cuota.
- El cliente verifica de nuevo cantidad, orden, familia, nivel, variante, ausencia de duplicados y la proyección Word antes de descargar. El Word identifica cada tipología. La ficha y su solucionario usan el mismo orden y variante. Los materiales impresos conservan A4, GLIAX, las fuentes visibles y la administración indicada para adaptaciones estáticas.

## Imprimibilidad y clasificación

El [inventario pedagógico](../audits/gliax-worksheet-h-inventory.csv) registra área, tipología, operación, franjas y niveles, orientación principal y etiquetas secundarias, estado, capacidad y limitaciones. El inventario completo por variante se reproduce con `node scripts/audit-worksheet-catalog.js inventario-regional.json inventario-es-intl.csv`. Los recuentos describen el banco finito evaluado. Las actividades heredadas sin contrato de papel verificable quedan pendientes por área, con sus mecánicas anotadas; no se promueven automáticamente por aparecer en un generador interactivo.

| Estado | Interpretación |
|---|---|
| Directa | La consigna y la evidencia se conservan en papel. Los ejercicios cerrados tienen solución y los abiertos tienen modelo o criterios. |
| Adaptada | Se modifica la forma de responder. Una deducción se resuelve con todas las pistas impresas, y una comparación se responde marcando o anotando posiciones. No se interpretan los resultados como una medida equivalente a pantalla. |
| Solo interactiva | Incluye reglas dinámicas, espera, audio, palabras que caen, recuperación con estímulo retirado, retos cuya finalidad depende del tiempo y prácticas que requieren observación. Queda excluida del flujo profesional. No se creó un protocolo de memoria acompañado para H. |
| Pendiente | Revisión del propósito o del contrato de papel pendiente, o falta una proyección válida en la variante elegida. |

La orientación curricular agrupa lectura, escritura, gramática, vocabulario, matemáticas, geometría e inglés. El entrenamiento cognitivo conserva atención, planificación, razonamiento, memoria y velocidad. Ambos pueden compartir demandas secundarias. Comunicación funcional mantiene su propia área. La orientación se expone en las actividades de pantalla y sirve como filtro en Word sin modificar historiales ni puntuaciones.

## Dificultad y lengua

Las familias de palabras conservan las revisiones anteriores. El banco Word añade dos contextos por nivel para 10–12, 13–15 y 16–18 años con identificadores nuevos. El primero trabaja usos concretos y recorridos. El segundo justificación y contraste de fuentes. El tercero trata presupuesto, muestras, incertidumbre y límites de una conclusión. En todos los casos se ofrecen ejemplos admitidos y se conserva el significado evaluado. Comunicación, comprensión, planificación y deducción conservan sus criterios y disponibilidades por edad y nivel. Las tareas que siguen compartiendo una operación entre franjas o disponen de un solo contexto se señalan en el inventario para revisión editorial.

La auditoría automatizada recorre España, México, Colombia, Argentina, Chile, Panamá, Costa Rica y español internacional, cruzados con las 15 combinaciones de edad y nivel. Usa `LocaleContent`, los validadores de evidencia, la detección de distractores equivalentes y la proyección usada para Word. Las solicitudes explícitas con variante no registrada se rechazan. No se recupera una ficha en otra variante por defecto. Se distingue entre un enunciado adaptado y un documento gráfico con texto original. Los ejemplares con procedencia declarada llevan el país de la fuente y conservan moneda, cifras y enlaces a la evidencia. Los ejercicios sensibles a ortografía o forma verbal requieren mantener la respuesta válida según los controles existentes. Las variantes del español no equivalen a una revisión de naturalidad, señalética, registro, habla local o usos escolares. Esas comprobaciones requieren revisión humana.

## Contraste curricular

Se comprobó la presencia de las competencias de referencia. El resultado es un contraste de contenido, con revisión parcial por país. El nivel GLIAX no equivale a curso, fase, criterio oficial de evaluación ni título.

| Cobertura | Contenido observado | Estado |
|---|---|---|
| España, Educación Primaria | Las fichas de 6–12 contienen comprensión literal e inferencial, producción guiada, números, medida y resolución de problemas. Estos ejes aparecen en Lengua Castellana y Literatura y Matemáticas del anexo II. Falta trazar criterios por ciclo y comunidades autónomas. | Parcial. [Real Decreto 157/2022](https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296) |
| España, ESO | Comprender textos y contrastar fuentes en 13–15 se relaciona con actividades de lectura y comunicación en el anexo II. Falta contraste por materia, curso y criterios de evaluación. | Parcial. [Real Decreto 217/2022](https://www.boe.es/buscar/act.php?id=BOE-A-2022-4975) |
| España, Bachillerato | En 16–18 se practican precisión léxica, comprensión crítica y comunicación de resultados. La correspondencia es temática. La franja incluye transiciones entre etapas y varias modalidades de estudios. | Parcial. [Real Decreto 243/2022](https://www.boe.es/buscar/act.php?id=BOE-A-2022-5521) |
| México, educación básica | Se consultó la publicación oficial y su anexo de fases 2–6. La trazabilidad de cada ficha a procesos de desarrollo de aprendizaje y grados queda pendiente. La fuente no cubre por sí sola 16–18. | Referencia identificada. [Secretaría de Educación Pública](https://educacionbasica.sep.gob.mx/plan-y-programas-de-estudio-2/) |
| Colombia, Argentina, Chile, Panamá y Costa Rica | Disponibilidad y comprobación lingüística automatizada. | Contraste curricular oficial pendiente. |
| Español internacional | Variante de contenido para contextos compartidos. | Sin asignación a un sistema curricular nacional. |

## Favoritos y privacidad

`supabase/migrations/20261119163000_worksheet_favorites.sql` crea la tabla y políticas de lectura, alta, edición y borrado por cuenta profesional. La cuenta se obtiene del usuario autenticado. La configuración admite únicamente edad, nivel, variante, versiones, solucionario y pares ordenados de tipología y cantidad. No incluye perfil, contenido generado ni respuestas. El nombre es texto libre y la interfaz pide evitar datos de menores. Puede recuperarse, renombrarse, editarse, duplicarse o eliminarse con confirmación.

La migración solo se ejecutó en PGlite, en memoria, con dos cuentas sintéticas. Para usar favoritos en Staging se necesita revisar y autorizar esa migración. La prueba heredada del formato de códigos ahora comprueba tanto el código sugerido como los personalizados permitidos y su normalización. Producción conserva las mismas comprobaciones de autorización por cuenta y la política previa.

## Verificación e integración posterior

La matriz genera fichas y solucionarios reales para las 15 combinaciones. La prueba del documento comprueba número de actividades, etiquetas y orden exacto, soluciones independientes, metadatos y A4. `tests/worksheet-layout.py` abre los documentos en LibreOffice y revisa las páginas. La revisión con Microsoft Word queda pendiente. Chromium comprueba el flujo de composición, filtros, orden, limitaciones, favoritos y adaptación móvil. Las regresiones A–G comprueban que las rutas existentes siguen válidas.

La Edge Function incorpora seis módulos compartidos de catálogo y proyección. Los espejos de frontend y Edge se validan en pruebas. Los archivos principales de interfaz son `index.html`, `css/styles.css`, `js/worksheet-builder.js`, `js/worksheet-catalog.js`, `js/docx.js`, `js/app.js` y `js/api.js`. Las regresiones específicas están en `tests/reconstruction-h.test.js`, `tests/browser-reconstruction-h.py` y `tests/worksheet.test.js`.

Después de autorizar Staging, verificar con dos cuentas ficticias la migración, una revisión 16 con cantidades insuficientes y exactas, los favoritos entre perfiles propios y el rechazo de otras cuentas, el solucionario y las cuotas. La naturalidad lingüística, las equivalencias curriculares detalladas y la adecuación pedagógica quedan para revisión profesional.

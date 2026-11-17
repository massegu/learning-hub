# GLIAX: espera guiada, reglas y materiales cotidianos

## Alcance local

La entrega añade la modalidad **Espera guiada** al área de Funciones ejecutivas, conserva «Actúa con reglas» como modalidad independiente y amplía las presentaciones de una mecánica de velocidad existente. Los cambios están preparados para revisión en esta rama. No se han modificado servicios remotos ni se han ejecutado migraciones en Supabase.

## Seguridad y minimización

- Los códigos sugeridos usan `P-` más ocho caracteres hexadecimales en mayúsculas. La interfaz y `API.createProfile` validan el formato para altas y cambios; cliente y trigger de base de datos normalizan a mayúsculas antes de guardar.
- `20261117100000_unique_learner_profile_codes.sql` comprueba todos los valores existentes de `name`, incluidos alias históricos, mediante `account_id` y `upper(btrim(name))`; crea un índice único sin filtro para esa misma normalización. Así también quedan protegidas las inserciones simultáneas y cuentas distintas pueden reutilizar el mismo código. Si el preflight encuentra cualquier colisión, la transacción falla sin renombrar ni eliminar perfiles. La función de validación mantiene `P-` más ocho caracteres hexadecimales para nuevas altas o cambios; los valores históricos no se reescriben. Ninguna migración se ha aplicado en Supabase remoto.
- El cliente traduce el conflicto del índice al mensaje: «Este código ya está asignado a otro perfil. Genera uno nuevo para continuar». Se muestra tanto al crear un perfil como al cambiar su código.
- RLS, los permisos SQL y las comprobaciones de autenticación/propiedad de `manage_learner_privacy` ya existían y no se han cambiado en esta entrega. Las pruebas locales con dos cuentas ficticias comprueban el aislamiento de perfiles, resultados, contenido visto y las operaciones del RPC. No sustituyen una comprobación de la configuración remota.
- La minimización existente elimina campos libres conocidos (`description`, `notes`, `freeText`, `responseText`) de observaciones interactivas. No se afirma que todos los campos libres o todos los registros históricos hayan sido auditados. No se añaden campos identificativos ni clínicos.
- El formato del código no garantiza anonimato ni unicidad global. La identidad interna y el aislamiento dependen del ID del perfil y de las políticas por cuenta. Evitar datos identificativos en códigos y campos libres sigue siendo una medida operativa necesaria.

## Modalidad A: espera guiada

- La persona ve una barra de progreso y una instrucción breve; no necesita pulsar al terminar.
- Los intervalos dependen del nivel (4, 6 y 8 segundos para el perfil inicial; 5, 8 y 12 segundos para los demás perfiles).
- Se puede reiniciar; al pasar la página a segundo plano, se pausa y puede reanudarse. Solo se guarda cuando el intervalo llega a su final.
- El campo existente `exercise_results.detail` guarda JSON versionado (`gliax.exercise-metrics.v1`) con modalidad `guided_wait`, `interval_completed: true`, nivel, intervalo, duración activa, reinicios e interrupciones. El registro existente aporta perfil, sesión y fecha.
- `correct` se guarda como `null`: un intervalo finalizado no se representa como acierto ni como «espera conseguida».
- Progreso lo presenta como «intervalo finalizado» y declara que no indica si la persona esperó. Se excluye de precisión, volumen de respuestas, puntos, racha y ajuste automático del nivel. No representa una medida clínica.
- La exportación CSV detallada incluye el JSON de ambas modalidades en `metricas_modalidad`.

## Modalidad B: «Actúa con reglas»

Registra en `detail` la modalidad `rule_application`, nivel, número de ensayos, aciertos, errores, omisiones, cambios de regla y tiempos de respuesta observados. No muestra un temporizador que dé pistas sobre la respuesta.

No responder cuando la regla es esperar cuenta como aplicación correcta, no como omisión. No responder a un estímulo que requería pulsación se registra como omisión. `response_times_ms` contiene únicamente pulsaciones observadas; la latencia se mide desde la presentación del estímulo con `performance.now()`. La falta de respuesta no genera una latencia artificial. En Progreso, los resultados de reglas se muestran aparte de la espera guiada.

## Velocidad de procesamiento: naturaleza del cambio

El modelo existente de códigos, zonas y mesas admite ocho presentaciones: pantalla de móvil, panel urbano, catálogo, recibo, póster, pizarra, pantalla de tablet y pantalla de ordenador. Son variaciones de presentación de la mecánica existente y conservan su información y respuesta; no son familias cognitivas nuevas ni sustituyen estímulos actuales que ya funcionan.

## Compatibilidad

No se ha cambiado la estructura de los resultados históricos ni se han reescrito filas. Las métricas nuevas se guardan en `detail` y se separan por `schema` y `modality`. La espera guiada no incrementa precisión, puntos, racha ni progresión de nivel. «Actúa con reglas» conserva su propia lógica de resultados. La validación SQL propuesta afecta solo a nuevas altas o cambios de código después de que se apruebe y aplique la migración.

## Capturas

Las capturas de escritorio y móvil incluidas para revisión están en:

- `docs/review-assets/gliax-phase1/guided-wait-desktop.png`
- `docs/review-assets/gliax-phase1/guided-wait-mobile.png`
- `docs/review-assets/gliax-phase1/typography-compare-desktop.png`
- `docs/review-assets/gliax-phase1/typography-compare-mobile.png`

Las capturas tipográficas documentan una mecánica de comparación ya incluida en esta rama; las ocho presentaciones ecológicas descritas arriba son del cruce de códigos y tablas. Muestran la barra de tiempo y los controles de la modalidad A. La batería de navegador comprueba también que la modalidad B no muestre temporizador visual.

## Pruebas y límites

### Recuperación y consistencia de resultados

`exercise_results` es la fuente canónica de los intentos individuales confirmados. Al abrir un perfil seguido, la aplicación lee sus resultados por páginas y reconcilia las filas que falten en `progress.history`, usando `client_attempt_id` como clave estable. Para resultados históricos anteriores a ese identificador, se usa una huella de los campos guardados para evitar repetir la misma fila. El historial del perfil sigue siendo una copia de lectura rápida y permite trabajar con el progreso local ya guardado.

La reconciliación solo añade filas a `history`: no vuelve a ejecutar la lógica de respuesta ni recalcula puntos, rachas, totales o niveles. Los reintentos pendientes conservan su `client_attempt_id` y usan el upsert idempotente actual. Si falla la consulta de resultados, se muestra un aviso y volver a abrir Progreso vuelve a intentar la lectura. Las sesiones independientes no consultan ni persisten resultados individuales.

Progreso interpreta desde `detail` las métricas versionadas `gliax.exercise-metrics.v1` para `guided_wait` y `rule_application`. El CSV detallado incluye el ID de intento, la modalidad, la versión del esquema y el JSON de métricas; «intervalo finalizado» sigue separado de aciertos. No se combinan ambas modalidades ni se infieren datos clínicos.

Las pruebas cubren las variantes por edad/nivel, las ocho presentaciones, la separación de modalidades, la diferencia entre omisión y ausencia correcta de respuesta, tiempos solo para pulsaciones observadas, persistencia de métricas, aislamiento local con dos cuentas ficticias y unicidad de código en una cuenta. Incluyen colisión en alta y edición, código igual en cuentas distintas, dos inserciones simultáneas, preflight de duplicados históricos, colisiones históricas por mayúsculas/minúsculas y espacios, y conservación de alias. La prueba de reconciliación simula un resultado confirmado sin copia en el progreso y el caso inverso de copia confirmada con resultado pendiente; también comprueba aislamiento de perfiles, CSV, métricas de ambas modalidades, contadores sin cambios y sesiones independientes sin persistencia. La prueba local no certifica la configuración remota. Las migraciones locales `20261116170000_validate_new_profile_codes.sql`, `20261116171000_allow_unscored_exercise_results.sql` y `20261117100000_unique_learner_profile_codes.sql` están preparadas para revisión. La segunda permite `correct: null` sin reescribir filas históricas; ninguna se ha ejecutado remotamente. Capturas y resultados de esta fase no son evidencia de validación clínica.

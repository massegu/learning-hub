# GLIAX: espera guiada, reglas y materiales cotidianos

## Alcance local

La entrega añade la modalidad **Espera guiada** al área de Funciones ejecutivas, conserva «Actúa con reglas» como modalidad independiente y amplía las presentaciones de una mecánica de velocidad existente. Los cambios están preparados para revisión en esta rama. No se han modificado servicios remotos ni se han ejecutado migraciones en Supabase.

## Seguridad y minimización

- Los códigos sugeridos usan `P-` más ocho caracteres hexadecimales en mayúsculas. La interfaz y `API.createProfile` validan el formato para altas y cambios; la API normaliza a mayúsculas antes de guardar.
- La migración local `20261116170000_validate_new_profile_codes.sql` valida altas y cambios de código con el formato `P-` más ocho caracteres alfanuméricos. No reescribe los códigos existentes: un alias histórico se puede conservar sin cambios mientras se editan otros ajustes. La migración no se ha aplicado a Supabase remoto.
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

Las pruebas cubren las variantes por edad/nivel, las ocho presentaciones, la separación de modalidades, la diferencia entre omisión y ausencia correcta de respuesta, tiempos solo para pulsaciones observadas, persistencia de métricas y aislamiento local con dos cuentas ficticias. La prueba local no certifica la configuración remota. Las migraciones locales `20261116170000_validate_new_profile_codes.sql` y `20261116171000_allow_unscored_exercise_results.sql` están preparadas para revisión. La segunda permite `correct: null` sin reescribir filas históricas; ninguna se ha ejecutado remotamente. Capturas y resultados de esta fase no son evidencia de validación clínica.

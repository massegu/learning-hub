# GLIAX — verificación funcional de integración PR #50 + PR #51

Fecha: 17/11/2026
Rama: `integration/gliax-pr50-pr51-20261117`
Commit base verificado: `828edc5ff4cbc24d6eb3ebaf06efd36217237baf`
Alcance inicial (frontend): validación local con mocks y Chromium. La ampliación con servicios Supabase locales reales se documenta al final. Sin migraciones remotas, publicación ni fusión.

## Dependencias y pruebas automáticas

- `npm ci`: **superado**, instaló 21 paquetes desde el lockfile.
- `npm test` (ejecución final tras correcciones): **superado, 270/270 pruebas**, 0 fallos, 0 omitidas. Duración informada: 126,6 s.
- `git diff --check`: superado.
- Inventario estático de referencias: 41 rutas locales únicas de HTML y 2 URL locales de CSS; **ninguna ausente**.

## Pruebas funcionales de navegador

Todas se ejecutaron contra `tools/review-preview.py` y límites de Supabase simulados; no se usaron cuentas ni datos reales.

- `tests/browser-privacy.py`: **superada**. Perfiles seguidos e independientes, exportación JSON, edición y eliminación de perfil, unicidad de código, aislamiento de escrituras y diálogo móvil.
- `tests/browser-idempotent-results.py`: **superada**. Reintento después de perder la respuesta tras confirmar el registro conserva un solo intento.
- `tests/browser-result-reconciliation.py`: **superada**. Reconciliación al reabrir, recuperación de la bandeja antes de la lectura canónica, historial legacy y límite 5.000, métricas `guided_wait`/`rule_application` en Progreso y CSV, perfil aislado y sesión independiente sin consulta ni escritura.
- `tests/browser-cognitive-families.py`: **superada**. 105 tareas (7 familias × 5 edades × 3 niveles), modalidades A/B separadas, teclado, móvil de 390 px y persistencia.
- `tests/browser-processing-speed.py`: **superada**. Velocidad ambiental y tres presentaciones en pantalla, medición, respuestas y fichas en escritorio/móvil.
- `tests/browser-speed-mechanics.py`: **superada**. Edad exacta, umbral 6–8/9+, comparación tipográfica para adolescentes y exclusión de tareas no imprimibles de las fichas.
- `tests/browser-auth-account.py`: **superada** con Auth simulado. Registro, inicio/cierre de sesión, recuperación, cambio de contraseña, creación de perfil con código generado y landing responsive a 320, 390, 768, 1.024 y 1.440 px. No se envió ningún correo.
- `tests/browser-review-preview.py`: **superada** tras adecuar sus helpers al estado actual de la interfaz. Recorrió cinco franjas de edad, 140 respuestas, cinco fichas de 20 ejercicios y capturas responsivas a 1.280/390 px. No registró errores JavaScript ni solicitudes HTTP externas.

## Hallazgos y correcciones reproducibles

1. **Landing GLIAX en móvil:** reproducido a 390 px. La fila del bloque de presentación colapsaba a unos 68 px aunque su contenido ocupaba unos 493 px; `overflow:hidden` recortaba el título y la descripción. En el grid compacto se fija `grid-auto-rows:max-content`. Se usa alineación `safe center` para evitar que el contenido alto empiece fuera del viewport, y `showAuth()` restablece el desplazamiento al volver a la pantalla de acceso. La prueba ahora comprueba que el título queda dentro de su bloque, que no hay desbordamiento horizontal y que se puede llegar al formulario. Repetida y superada.
2. **Selector de la tabla de velocidad:** el test esperaba `.structured-stimulus-table`, pero el material ecológico se renderiza como `.everyday-material-table`. Se actualizó el selector y la comprobación móvil para validar el marcado que realmente se entrega. Los encabezados visibles son Código, Zona y Mesa; la prueba pasó sin cambios en el generador ni en su respuesta.
3. **Mock de inserciones:** el mock local interpretaba `.insert(...).select(...).single()` como una lectura y devolvía un perfil vacío. Ahora conserva la operación de inserción, como hace el cliente Supabase. Esto permitió validar el perfil creado sin cambiar el API de producción.
4. **Pruebas de automatización desfasadas:** se actualizaron para usar el código aleatorio que ahora propone el formulario, abrir el panel de dificultad antes de cambiar nivel y abrir el menú de trabajo antes de seleccionarlo. Eran supuestos obsoletos de los helpers; no se observaron fallos correspondientes en la interfaz.

Los navegadores no notificaron excepciones JavaScript en las pruebas pasadas. El launcher comprobado no hizo solicitudes HTTP externas. El inventario encontró todas las rutas locales referenciadas por HTML/CSS; los ejercicios de velocidad y cognición también validaron los estímulos que renderizan.

## Pendiente de Supabase real

- Validar inicio de sesión, confirmación del correo y redirecciones de recuperación con el proyecto **no productivo**.
- Validar RLS y aislamiento entre dos cuentas ficticias frente a Supabase real.
- Verificar que las migraciones necesarias estén aplicadas en el entorno de beta antes de probar `exercise_results`, `client_attempt_id`, códigos únicos y RPC. No se consultó ni modificó Supabase en esta fase.
- Confirmar exportación y borrado contra datos sintéticos de una base aislada.

Las pruebas de frontend no certifican la configuración remota de Auth/RLS ni el funcionamiento de producción. Esta fase no altera las PR originales #50/#51, `desarrollo` ni `main`; tampoco ejecuta migraciones, despliega en Cloudflare ni fusiona ramas.

## Supabase local aislado — ampliación del 17/11/2026

Base comprobada antes de modificar archivos: rama remota `integration/gliax-pr50-pr51-20261117`, HEAD `9ee39c4f3918fed6f58d07d8e2c9e69c3c3ba680`. Se trabaja directamente en esa rama de integración. No se ha conectado, consultado ni modificado el proyecto remoto `Learning_Hub`; tampoco se han modificado las PR originales, fusionado ramas o desplegado en Cloudflare.

### Entorno y aislamiento

- Debian 13.6, Linux x86_64; Docker cliente/daemon **28.4.0**, almacenamiento `vfs`.
- Supabase CLI **3.2.0**, instalada temporalmente fuera del repositorio. Se consultó `--help` general y de `init`, `start`, `status`, `stop`, `db query`, `db reset` y `db advisors` antes de usarlos. Se revisó el changelog sobre el cambio de valores predeterminados de CLI v3.
- PostgreSQL **17.12**, imagen `public.ecr.aws/supabase/postgres:17.12.0.000`; Auth/GoTrue **v2.198.0**; PostgREST **v16.5**; Kong **2.8.1**; Mailpit **v1.31.3** (sin SMTP externo).
- Cliente `@supabase/supabase-js` **2.119.0**, instalación temporal con versión y lockfile fijados fuera del repositorio. Chromium **151.0.7922.173**, Playwright **1.62.0**, Node **24.19.0**.
- Proyecto local separado: `gliax-local-20261117`, en `/workspace/work/gliax-local`, sin `link`, credenciales remotas, variables del proyecto real ni copia de sus datos. La configuración del repositorio no se modificó.
- Red Docker `gliax-local-20261117` con `Internal=true`: los contenedores no tienen salida externa. Docker 28 no publica puertos en esta red; `tests/local-supabase-loopback.py` retransmite TCP exclusivamente desde `127.0.0.1:55431` (API) y `127.0.0.1:55432` (PostgreSQL). No simula respuestas. El navegador bloquea destinos externos y recibe el SDK instalado y la configuración local mediante interceptación de esos dos archivos; Auth, PostgREST y PostgreSQL no están simulados.
- El proxy predeterminado de la configuración Docker del host interfería con el `wget` del chequeo de salud de Auth. Se utilizó un `DOCKER_CONFIG` temporal vacío, además de retirar variables proxy de la CLI. La ejecución válida arrancó con todos los servicios iniciados sanos, sin `--ignore-health-check`.
- Realtime, Storage, Edge Runtime, Studio, Analytics y pooler se excluyeron. Esta prueba no acredita esos servicios ni la función de generación de contenido.

### Migraciones y límite del esquema inicial

**La cadena del repositorio no inicializa una base vacía.** Se reprodujo con PostgreSQL real: la primera migración falla porque no existe `public.accounts` (`42P01`). No existe en el repositorio una migración base que cree `accounts`, `learner_profiles`, `exercise_results` y `content_seen`, sus tipos o el aprovisionamiento de cuentas profesionales.

Para poder comprobar las migraciones incrementales se añadió **solo como fixture de pruebas** `tests/fixtures/supabase-local-baseline.sql`, reconstruida a partir de los tests existentes, `js/api.js` y la revisión documentada del registro privado. No es una copia verificada del esquema remoto ni una migración nueva. Usa `auth.users`, `auth.uid()` y los roles reales que instala Supabase; no instala funciones Auth falsas ni falsifica JWT.

Desde un esquema `public` limpio, después de reproducir el fallo anterior y cargar esa fixture, se aplicaron sin cambios y en este orden:

1. `202610210001_billing_integrity.sql`
2. `202610230001_learner_privacy.sql`
3. `20261109212329_idempotent_exercise_results.sql`
4. `20261116170000_validate_new_profile_codes.sql`
5. `20261116171000_allow_unscored_exercise_results.sql`
6. `20261117100000_unique_learner_profile_codes.sql`

Se ejecutaron con `psql -X -v ON_ERROR_STOP=1` dentro del contenedor dedicado. No se usó el historial de migraciones de la CLI para representar la fixture como migración oficial. La migración de facturación se comprobó como DDL/prerrequisito; no se llamó a Stripe ni se probó su integración.

Los dos usuarios `gliax-local-a@example.invalid` y `gliax-local-b@example.invalid` se registraron en Auth local. Sus filas profesionales en `accounts` se insertaron explícitamente como preparación sintética: el alta automática de esa fila no puede certificarse sin su trigger/migración original. Un alias histórico ficticio se insertó antes de las migraciones para comprobar su conservación y la minimización del texto libre.

### Resultados obtenidos con PostgreSQL, Auth y PostgREST reales

Ejecución final de `tests/local-supabase-validation.py`: **51 comprobaciones superadas, 0 fallos inesperados**. Una de ellas reproduce deliberadamente el fallo de inicialización desde vacío; no debe interpretarse como que esa inicialización funciona. Las otras comprobaciones se ejecutan sobre el esquema representativo descrito arriba.

| Comprobación | Resultado y evidencia |
| --- | --- |
| Replay oficial desde base vacía | **Bloqueado/falla**: `42P01`, falta `public.accounts`. Falta la migración base. |
| Seis migraciones incrementales sobre fixture limpia | **Superadas**, SQL original sin modificaciones, en orden cronológico. |
| Índice único por cuenta | **Superado**: índice válido y único inspeccionado en `pg_index`; rechaza duplicados normalizados y colisiones al cambiar código por RPC. Dos conexiones HTTP concurrentes: una inserción y un `23505`. A y B pueden usar `P-ABCDEF01`. |
| Alias históricos | **Superado**: `  Alias ficticio antiguo  ` permanece idéntico tras migraciones y edición de idioma; el texto libre ficticio del progreso sí se minimiza. |
| Auth local | **Superado**: dos altas, inicio con contraseña, refresh de tokens, cierre de sesión del navegador y nuevo inicio con recuperación de resultados. |
| Perfiles y RLS | **Superado**: A crea, lee y modifica; B obtiene cero filas al leer, actualizar o borrar el perfil de A. A no puede transferirlo a B. |
| Resultados y RLS | **Superado**: B no puede leer, insertar, actualizar ni borrar resultados de A. Todas las solicitudes usan JWT reales emitidos por Auth local. |
| Anónimos | **Superado**: sin sesión se rechaza la lectura de perfiles, resultados, contenido visto y auditoría, además de exportación y borrado RPC. |
| `guided_wait` | **Superado**: `correct` admite `NULL` y el cliente guarda/recupera `correct:null`, sin convertirlo en `false`. |
| `rule_application` | **Superado**: ida/vuelta exacta de `gliax.exercise-metrics.v1`, ensayos, aciertos, errores, omisiones, cambios y tiempos; también se conservan las métricas de espera guiada. |
| `client_attempt_id` y reintentos | **Superado**: un POST se confirma en la base y se corta su respuesta HTTP; queda en outbox como incierto. Al recargar, el reintento mantiene una sola fila por intento y vacía el outbox. El fallo se inyecta solo en el transporte; el registro y el conflicto son reales. |
| `exercise_results` / `progress.history` | **Superado**: la recuperación automática de `js/app.js` reconstruye las dos entradas y coincide por UUID, detalle y valor de `correct` con las filas recuperadas mediante `js/api.js`. Persisten después de logout/login y recarga. |
| Progreso y CSV | **Superado**: Chromium presenta las dos modalidades desde las filas reales; el CSV descargado contiene los UUID y las métricas versionadas. Sin excepciones JavaScript. |
| Sesión independiente | **Superado en el alcance local**: al activar el modo desde la interfaz, `saveResult` y `saveProgress` no escriben y `listResults` no devuelve historial. La comparación SQL completa del perfil y resultados antes/después es idéntica. PostgreSQL rechaza además guardar `_sessionOnly`. No se ha probado aquí la función Edge de contenido. |
| Exportación JSON | **Superada**: RPC autorizado incluye perfil y sus dos entradas de historial, dos resultados, contenido visto y entrega privada sintéticos. No incluye el perfil de B. B y anónimos no pueden exportar A. |
| Ajustes y borrado | **Superados**: ajustes autorizados auditados; borrar A elimina perfil, resultados, contenido visto y registro privado. Se conserva el perfil de B y queda un evento de borrado. B y anónimos no pueden ejecutar el borrado de A. |
| Advisors locales | **Superado**: `db advisors --type security --level warn --fail-on none --output-format json` devuelve `results: []`, sin advertencias ni errores en ese análisis. No acredita el esquema remoto. |

Las ejecuciones preliminares detectaron dos errores del propio recorrido de prueba (panel de métricas y menú de cuenta cerrados); se corrigieron abriendo sus `<details>` antes de interactuar. También se resolvieron las limitaciones de proxy y red del arranque local descritas arriba. La ejecución final completa pasó; no se modificó código de aplicación, dependencias del proyecto ni SQL de migraciones. Se verificaron sintaxis Python y `git diff --check`. No se volvió a ejecutar la batería frontend de 270 pruebas: su resultado anterior se mantiene como evidencia de la fase previa, separado de estas pruebas reales.

Limpieza comprobada: `stop --project-id gliax-local-20261117 --no-backup` retiró los servicios y volúmenes de prueba; se detuvo la retransmisión y se eliminó la red dedicada. El inventario Docker quedó sin contenedores ni volúmenes y los puertos loopback `55431/55432` quedaron cerrados. Las cuentas y datos sintéticos no permanecen en una instancia activa.

### Reproducción

Los scripts son optativos y no forman parte de `npm test`. Requieren una instancia desechable vacía y fallan si no encuentran el endpoint, contenedor, etiquetas y red interna esperados. Las claves locales y contraseñas no se guardan en Git.

1. En un directorio temporal fuera del repositorio, instalar CLI `3.2.0` y SDK `2.119.0` con versiones exactas y caché npm en un directorio escribible. Definir `SUPABASE_HOME`, `DOCKER_CONFIG` vacío y `SUPABASE_TELEMETRY_DISABLED=true` para esa ejecución. Retirar variables Supabase remotas y proxy; no reutilizar archivos `.env` del proyecto. Ejecutar `supabase --help` y las ayudas correspondientes.
2. Ejecutar `supabase --workdir <temporal> init`. En su configuración generada, fijar `project_id="gliax-local-20261117"`, puertos API/DB/shadow `55431/55432/55430`, Studio/Mailpit `55433/55434`; desactivar Realtime, Studio, Storage, Edge Runtime y Analytics. Mantener la configuración Auth local generada, con confirmación de correo desactivada. No copiar migraciones al proyecto temporal: el runner las aplica desde el repositorio.
3. Crear `docker network create --internal gliax-local-20261117`. En otra terminal del mismo host ejecutar `python3 tests/local-supabase-loopback.py`.
4. Ejecutar `supabase --workdir <temporal> start --network-id gliax-local-20261117 --exclude realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor`. Esperar a que termine correctamente.
5. Guardar `supabase --workdir <temporal> status -o json` en un archivo temporal privado. Desde la raíz del repositorio: `python3 tests/local-supabase-validation.py --status-json <archivo-local> --sdk <sdk>/dist/umd/supabase.js`.
6. Ejecutar `supabase --workdir <temporal> db advisors --type security --level warn --fail-on none --output-format json`. Después, `supabase --workdir <temporal> stop --project-id gliax-local-20261117 --no-backup`, detener la retransmisión TCP y retirar la red dedicada. Para repetir, recrear la instancia limpia con la misma red interna; no ejecutar un reset con los valores de red predeterminados.

### Pendiente antes de plantear un despliegue

- Obtener por un procedimiento autorizado el esquema base y el aprovisionamiento de `accounts`, versionarlos y repetir la cadena completa desde cero. No se ha corregido esa ausencia inventando una migración de producción.
- En un futuro proyecto Supabase de **staging**, con autorización independiente y datos ficticios, comparar tipos, restricciones, grants, políticas, triggers, tablas hijas y columnas privadas con el esquema real. La fixture no certifica equivalencia con producción.
- Aunque signup, contraseña, refresh y cierre/reapertura se prueben localmente, quedan pendientes confirmación del correo, recuperación/cambio de contraseña por enlace, redirecciones, SMTP, expiración y revocación de sesiones con la configuración de staging. El entorno local utiliza confirmación de correo desactivada y no envía correos reales.
- Probar allí Edge Functions y generación de contenido, control de suscripción/uso, y el flujo completo de ejercicios independientes con las comprobaciones de ausencia de escrituras por perfil. Esta ejecución local comprueba los bloqueos del cliente y de PostgreSQL sobre resultados/progreso, sin ejecutar la función de contenido.
- Verificar configuración de los demás servicios, copias/restauración, retención y programación de la purga de auditoría. Ninguna de esas operaciones se ha ejecutado remotamente en este trabajo.

## Preparación de la reconstrucción desde cero — 17/11/2026

Continuación sobre `dcca944bf4007296bb753451e1567f774f48fa1f`, con rama y árbol Git comprobados al inicio. Se conservan sin cambios los tres archivos de pruebas/fixture y las seis migraciones. El [inventario de objetos y plan de bootstrap](gliax-database-bootstrap-inventory-20261117.md) separa las definiciones disponibles de las que requieren recuperación; incluye `content_usage`, campos de `content_seen`, permisos de idioma de cuenta y el aprovisionamiento Auth que la fixture no acredita.

Se ha preparado el [procedimiento exacto de exportación solo de esquema](gliax-schema-only-export-20261117.md), complementado por `supabase/diagnostics/schema-only-inventory.sql`. **No se ha ejecutado sobre el Supabase actual.** La consulta nueva inspecciona catálogos sin recuentos de registros; el procedimiento no usa el antiguo preflight de privacidad, datos de Auth ni historial de migraciones.

Validación de las herramientas: PostgreSQL 17.12 en un contenedor desechable con `--network none`, preparación sintética y marcador de fila ficticio. La consulta produce JSON válido con políticas, ACL, índices, secuencias y un trigger sintético anclado a `auth.users`. El dump limitado a `public/private` omite ese trigger, como se esperaba; el inventario lo conserva. TOC y SQL generado no contienen entradas de datos ni el marcador; la restauración en una segunda base local vacía conserva las definiciones sin filas ni materialización de datos. Esto verifica la captura, no añade otra certificación del esquema GLIAX ni repite las 51 comprobaciones anteriores.

No se incorpora una baseline inventada ni se cambia código de aplicación. El esquema inicial completo sigue pendiente de recuperar sus definiciones exactas por el procedimiento preparado, con autorización futura para conectarse. No se han consultado ni modificado servicios remotos, desplegado o fusionado ramas.

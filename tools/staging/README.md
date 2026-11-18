# Preparación local de GLIAX staging

Estas herramientas **no crean, conectan ni despliegan un proyecto remoto**. Se ejecutan desde la raíz del repositorio con Python 3.11 o posterior. No leen credenciales del entorno ni reutilizan configuraciones de despliegue de beta. El checklist de 68 comprobaciones permanece en [su documento original](../../docs/implementation/gliax-staging-checklist-20261117.md).

Hay tres componentes con distinto alcance:

1. `installer.py`: prepara y verifica un paquete de los tres SQL existentes. Solo puede ejecutarlo en un contenedor PostgreSQL local, etiquetado y sin red.
2. `runner.py` / `scenarios.py`: preparan el ciclo y los escenarios E2E. Los adaptadores remotos HTTP, correo, navegador y administración **todavía no están implementados**. La CLI registra diez escenarios reales como `NOT RUN`; no permite habilitar conexiones mediante una opción.
3. `frontend.py`: genera y examina una copia web independiente. No publica esa copia ni modifica la beta.

No debe presentarse esta entrega como un instalador remoto terminado ni como una validación de staging. Para habilitarlos hará falta otra implementación revisada y autorización independiente. Añadir datos al manifiesto no habilita operaciones remotas.

## Manifiesto privado obligatorio

El responsable y Codex prepararán este JSON fuera del repositorio, incluso fuera de sus directorios ignorados. Debe pertenecer al usuario ejecutor y tener permisos `0600`; no se admiten enlaces simbólicos. **No añadir valores ni el manifiesto a Git.** Tampoco incluir contraseñas, tokens, clave administrativa o configuración SMTP: se rechazan campos desconocidos.

Todos estos campos son obligatorios; no hay un destino por defecto:

| Campo | Contenido y validación |
| --- | --- |
| `schema_version` | Entero `1`. |
| `environment` | Literal `staging`. |
| `project_ref` | ID explícito de 20 letras minúsculas, distinto del operativo. |
| `api_url` | Exactamente `https://<project_ref>.supabase.co`. |
| `database` | Objeto con `host`, `port`, `name`, `user`, `sslmode`: respectivamente `db.<project_ref>.supabase.co`, `5432`, `postgres`, `postgres`, `verify-full`. Son identidades declaradas, no una conexión. |
| `web_origin` | Origen HTTPS canónico de staging, sin ruta, puerto, credenciales ni barra final. |
| `web_path` | Literal `/`. No se admite una subruta de preview. |
| `publishable_key` | Clave `sb_publishable_…` exclusiva de staging. Nunca una clave secreta o administrativa. |
| `billing_enabled` | Booleano `false`. |
| `qa_emails` | Dos buzones distintos de pruebas controlados por el responsable. En ensayos locales, direcciones sintéticas `.invalid`. |
| `production_web_origins` | Lista explícita y no vacía de los orígenes web operativos prohibidos. La proporciona el responsable; no se infiere su exhaustividad. |
| `source_commit` | SHA completo disponible localmente. Los SQL y la configuración operativa deben coincidir con ese commit; para construir la web, también los archivos web. |
| `sql_sha256` | Objeto con hashes SHA-256 de los tres archivos enumerados abajo, calculados de los archivos originales. |
| `sdk_sha256` | Hash SHA-256 del SDK UMD local que se vaya a incorporar. |

El ID, el host DB y la URL API deben coincidir antes de producir archivos o consultar Docker. Se rechazan destinos operativos extraídos de la configuración de beta, manifiestos incompletos y paquetes cambiados. El paquete también queda vinculado al código de estas herramientas mediante hash.

**Límite de la comprobación offline:** una clave publicable opaca no demuestra a qué proyecto pertenece. Su correspondencia requerirá confirmación del responsable y una comprobación autenticada futura contra el staging autorizado. Tampoco se comprueba DNS, certificado, existencia o propiedad del proyecto con este preparador. Los hosts de pooler y los dominios personalizados no están admitidos. No ampliar esas reglas mediante excepciones improvisadas.

## 1. Paquete de instalación

Orden fijo, sin modificar los originales:

1. `supabase/baselines/gliax-local-functional.sql`
2. `supabase/baselines/local-privileges.sql`
3. `supabase/baselines/local-content-compatibility.sql`

Solo se adapta la guarda de cada archivo para exigir `gliax.staging_baseline` y el ID declarado. Las definiciones SQL restantes permanecen idénticas. El segundo archivo contiene el estado seguro de permisos y el tercero la corrección SQL de compatibilidad ya validada. Las seis migraciones históricas **no se incluyen ni se reaplican**. Esta baseline exige un esquema de aplicación vacío; no actualiza una instalación existente.

Ejecutar desde la raíz, con variables de shell propias de la tarea previamente definidas explícitamente. `GLIAX_PRIVATE_MANIFEST` apunta al archivo privado y `GLIAX_WORK` a una carpeta nueva bajo `work/`, hermana del repositorio. No son variables de configuración leídas automáticamente por los programas:

```sh
python3 -m tools.staging.installer prepare --manifest "$GLIAX_PRIVATE_MANIFEST" --package "$GLIAX_WORK/package"
python3 -m tools.staging.installer validate --manifest "$GLIAX_PRIVATE_MANIFEST" --package "$GLIAX_WORK/package"
```

No hay comando de aplicación remota. `apply-local` exige `--container` con prefijo `gliax-staging-sandbox-`, contenedor arrancado, red `none`, sin redes adicionales ni puertos publicados, y estas etiquetas:

- `gliax.staging.scope=local-test`
- `gliax.staging.project_ref`: ID sintético del manifiesto.
- `gliax.staging.api_host`: host API del manifiesto, sin esquema.
- `gliax.staging.db_host`: host DB declarado.

Se rechazan `DOCKER_HOST` y `DOCKER_CONTEXT` heredados. Docker usa exclusivamente el socket Unix local, configuración temporal vacía y entorno mínimo. Se fija el ID inmutable del contenedor, se comprueba DB/usuario y conexión por socket antes de escribir, y se revalida el aislamiento antes de cada SQL. Las etiquetas prueban el destino del **ensayo local**, no la existencia ni identidad de ningún proyecto real.

Cada archivo conserva su transacción propia. Un fallo detiene la instalación sin reintento; no existe una transacción conjunta de los tres. En el ensayo se desecha la base completa ante un fallo. No usar este mecanismo como reversión ni como actualización remota.

Prueba autocontenida, solo con imagen ya disponible localmente, sin descargar imágenes:

```sh
python3 tests/local-staging-installer-smoke.py
```

Requiere Docker local y `postgres:17-alpine` en caché; crea y elimina únicamente su contenedor desechable sin red. Su pequeño esquema `auth` es un arnés SQL sintético, **no Supabase Auth**. Si falta la imagen, informa `NOT RUN`.

## 2. Ciclo E2E

```sh
python3 -m tools.staging.runner prepare --manifest "$GLIAX_PRIVATE_MANIFEST" --run-dir "$GLIAX_WORK/e2e"
python3 -m tools.staging.runner execute --manifest "$GLIAX_PRIVATE_MANIFEST" --run-dir "$GLIAX_WORK/e2e"
python3 -m tools.staging.runner validate --manifest "$GLIAX_PRIVATE_MANIFEST" --run-dir "$GLIAX_WORK/e2e"
python3 -m tools.staging.runner cleanup --manifest "$GLIAX_PRIVATE_MANIFEST" --run-dir "$GLIAX_WORK/e2e"
```

Cada fase valida el manifiesto y su vinculación con el plan; no sobrescribe una ejecución previa. `execute` produce diez `NOT RUN`. `validate` comprueba la integridad de ese registro y rechaza afirmaciones de éxito remoto. `cleanup` elimina solo su archivo transitorio local conocido y conserva informes; cualquier ID de recurso inesperado impide borrar. **La limpieza remota no está implementada y sigue `NOT RUN`.**

| Caso preparado | Evidencia futura necesaria |
| --- | --- |
| `auth_confirmation` | Dos altas A/B, confirmación por correo, inicio de sesión y aprovisionamiento único. |
| `password_recovery` | Enlace real, cambio de contraseña, expiración y redirección correcta. |
| `session_lifecycle` | Login, refresh, logout, cierre y reapertura en navegador. |
| `profiles_rls` | Mismo código entre cuentas, duplicado rechazado en una cuenta, lectura/edición propia y aislamiento A/B/anónimo. |
| `results_recovery` | `guided_wait` nulo, métricas versionadas, idempotencia, RLS, recuperación y coherencia con history mediante navegador. |
| `deno_content` | Endpoint Edge real en Deno, contenido y sesión independiente sin resultados persistentes. |
| `concurrent_quotas` | Cinco solicitudes simultáneas con dos unidades disponibles, por Edge y RPC privada; contador, efectos e independencia de B. |
| `sql_compatibility` | RPC original con corrección SQL, permisos y ausencia del error de ambigüedad. |
| `effective_permissions` | Permisos efectivos seguros, SECURITY DEFINER y secuencias. |
| `export_delete` | Exportación JSON/CSV autorizada, borrado en cascada y conservación de B. |

El núcleo limita la concurrencia a cinco y el presupuesto a 60 solicitudes por contexto. Los futuros adaptadores administrativos deberán respetar ese mismo presupuesto y restringirse al registro de recursos sintéticos del run. No permitir lecturas globales ni borrados sin ese registro. Para cuotas, preparar contadores y contenido sintético de manera independiente por ruta y comprobar que las solicitudes rechazadas no producen efectos.

Contrato pendiente de adaptadores: HTTP debe usar únicamente el origen validado, rechazar redirecciones, tener timeout y límite de respuesta, separar sesión A/B/anónimo y enviar `Prefer: return=representation,resolution=ignore-duplicates` cuando corresponda. Correo debe limitar destinatarios y enlaces al staging; navegador debe usar el artefacto y las rutas reales; administración debe verificar identidad remota antes de cada operación privilegiada y llevar inventario de recursos para limpieza incluso tras fallos. No implementar esos permisos dentro del manifiesto. El código actual conserva credenciales sintéticas en memoria y no serializa errores, cuerpos, tokens ni contraseñas en informes.

`PASSED` y `FAILED` se prueban en contratos locales explícitos; nunca certifican un servicio real. No cambiar la base de evidencia `LOCAL_CONTRACT` a `REAL_STAGING` para dar por probada una simulación. Los drivers remotos deben desarrollarse y revisarse antes de poder declarar este runner operativo en staging.

## 3. Artefacto web

`GLIAX_SDK` debe apuntar a un SDK UMD instalado localmente cuyo hash y licencia hayan sido revisados. No se descarga durante la construcción:

```sh
python3 -m tools.staging.frontend --manifest "$GLIAX_PRIVATE_MANIFEST" --sdk "$GLIAX_SDK" --output "$GLIAX_WORK/web"
```

Solo se copian `index.html`, `js/`, `css/` y `assets/`; se rechazan archivos web no versionados y enlaces simbólicos. Se mantiene la cadena de módulos JavaScript. El SDK se incorpora localmente con licencia y hash. La configuración de la copia usa solo staging; no cambia `js/config.js` de beta.

El artefacto elimina la implementación de checkout/portal y sustituye ambas operaciones por rechazos explícitos. También oculta/deshabilita los botones, bloquea invocaciones directas del endpoint de pagos, añade guardas de red y una CSP a todos los HTML, y muestra `GLIAX STAGING / TEST — Sin pagos`. La política permite API/Auth y el endpoint Edge de contenido del origen declarado; no habilita Realtime ni Storage. Las peticiones API desde otro origen web se rechazan. Se conserva la dependencia estática opcional de ExcelJS 4.4 en jsDelivr.

Se examinan todos los bytes generados contra ID, URL, clave y correo operativos extraídos offline de la fuente fijada. En archivos de texto se rechazan otros hosts Supabase, endpoints Stripe de pagos y patrones de claves secretas. El recibo contiene hashes de los archivos. **Esto no certifica una auditoría exhaustiva de secretos ni un sandbox frente a JavaScript malicioso.** Será necesario revisar CSP en cabeceras del futuro hosting, redirecciones y navegadores reales antes de publicar. No usar este artefacto para iniciar pruebas SMTP/Auth antes de autorizar y configurar el destino.

Todos los paquetes, artefactos y registros quedan fuera de Git, en directorios nuevos privados bajo la carpeta hermana `work/`; se rechaza sobrescribirlos. El artefacto incluye deliberadamente la clave publicable de staging. No añadirlo al repositorio, Actions ni Cloudflare. No hay workflow nuevo, entorno Actions, despliegue o comando de push.

## Validación local

```sh
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 tests/local-staging-installer-smoke.py
npm test
```

Los contratos de navegador requieren Chromium, Playwright y el SDK local indicado por el test. Si faltan, se marcan omitidos con motivo; nunca contarlos como superados. Las rutas del navegador se satisfacen o abortan localmente: no hay conexiones reales a los nombres sintéticos. El runner local histórico y sus protecciones no se modifican.

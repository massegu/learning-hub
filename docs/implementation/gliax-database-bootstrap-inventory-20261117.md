# GLIAX — inventario para reconstruir la base desde cero

Fecha: 17/11/2026. Rama: `integration/gliax-pr50-pr51-20261117`. Base auditada: `dcca944bf4007296bb753451e1567f774f48fa1f`, con Git limpio al inicio. Se conservan sin cambios las pruebas, la fixture y el informe de las **51 comprobaciones locales**. Esta auditoría usa exclusivamente archivos del repositorio; no consulta el Supabase actual.

**La reconstrucción completa sigue bloqueada por definiciones que faltan.** La fixture anterior permite probar parte del sistema, pero no es el esquema inicial recuperado. No se crea en esta entrega una migración de producción a partir de supuestos.

## Evidencia y cobertura de las seis migraciones

| Orden / archivo en `supabase/migrations/` | Objetos definidos o modificados | Prerrequisitos no creados por la cadena |
| --- | --- | --- |
| 1. `202610210001_billing_integrity.sql` | Tres tablas de facturación, índice `billing_checkout_owner`, PK/UNIQUE/FK, cinco RPC y permisos/RLS de facturación | `accounts`, clave candidata `accounts(user_id)`, tipo `public.subscription_status`, columnas de cuenta y funciones/roles Auth |
| 2. `202610230001_learner_privacy.sql` | `privacy_review_at`; tabla/índice/política de auditoría; FK de resultados y vistos si faltan; cuatro funciones de privacidad, dos triggers, políticas y grants de tres tablas; minimización de progreso | `learner_profiles`, `exercise_results`, `content_seen`, `accounts`; registro privado si existe; roles/Auth. No crea `content_usage` |
| 3. `20261109212329_idempotent_exercise_results.sql` | Columna UUID nullable `client_attempt_id`, UNIQUE `exercise_results_profile_client_attempt_key(profile_id,client_attempt_id)` | Tabla y campos originales de resultados |
| 4. `20261116170000_validate_new_profile_codes.sql` | Función `validate_new_learner_profile_code()`, trigger `learner_profile_code_format`, revocación EXECUTE | Tabla y campo `learner_profiles.name` |
| 5. `20261116171000_allow_unscored_exercise_results.sql` | Quita NOT NULL de `exercise_results.correct` | Columna y su tipo original |
| 6. `20261117100000_unique_learner_profile_codes.sql` | Sustituye cuerpo de validación; índice único `learner_profiles_account_code_normalized_key(account_id,upper(btrim(name)))`; preflight de duplicados | Tabla, cuenta, alias originales; no crea ni reescribe esos objetos |

La migración 2 reemplaza todas las políticas preexistentes de perfiles/resultados/vistos. Sus FK condicionales **no sustituyen** una FK anterior que ya exista: hay que recuperar también su acción ON DELETE exacta. Las migraciones 1, 2, 4 y 6 no son una colección de DDL universalmente idempotente; no se deben aplicar encima de un dump actual que ya contenga sus objetos.

Los prefijos históricos mezclan versiones de 12 y 14 dígitos. No se renombran ni se reescriben aquí: el orden lexicográfico anterior es el usado con `psql` en las pruebas reales. Antes de introducir una baseline en el flujo CLI hay que comprobar la aceptación y orden de esas versiones con la versión fijada de CLI.

## Tablas base ausentes y campos exigidos por los consumidores

La columna «contrato» identifica nombres y usos probados en el código; **no es un CREATE TABLE propuesto**. Para cada tabla faltan la definición autoritativa completa, columnas adicionales, tipos/domains/enums exactos, nulabilidad, defaults, checks, PK/UNIQUE, FK y acciones, secuencias/identity, índices, owner, ACL y políticas originales.

| Objeto | Contrato visible en el repositorio | Evidencia / qué recuperar |
| --- | --- | --- |
| `public.accounts` | `user_id`, `subscription_status`, `trial_started_at`, `trial_ends_at`, `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`, `created_at`, `updated_at`, `content_locale` | `js/api.js`, migración de facturación, `tests/billing-integrity.test.js`. `user_id` debe poder ser referenciado por FK. Recuperar relación exacta con `auth.users`, alta/baja automática, trial y actualización de fechas; no dar por oficiales los defaults de 7 días o las UNIQUE de Stripe de la fixture |
| `public.learner_profiles` | `id`, `account_id`, `name`, `age_band`, `locale`, `progress`, `created_at`; `privacy_review_at` sí se añade por migración | `js/api.js`, migración de privacidad. Recuperar tipos de edad/idioma, JSON/defaults, FK de cuenta y su borrado, generación de ID y restricciones originales |
| `public.exercise_results` | `id`, `profile_id`, `occurred_at`, `session_id`, `session_started_at`, `subject`, `level`, `correct`, `points`, `item_id`, `detail`; `client_attempt_id` sí se añade por migración | `js/api.js`, `js/v16.js`, `js/v16_3.js`. La fixture presupone UUID/text/boolean y otros tipos: verificar frente al DDL real, especialmente ID, sesiones, `detail`, índices temporales y FK |
| `public.content_seen` | `id`, `user_id`, `profile_id`, `domain`, `item_signature`, `mechanic_signature`, `created_at` | `request-learning-content/index.ts:2468–2598` y privacidad. **La fixture local no incluye `domain`, `mechanic_signature` ni `created_at`**; no acredita el flujo Edge de selección/historial. Recuperar tipos, defaults, índices por cuenta/perfil/dominio/fecha y posibles UNIQUE |
| `public.content_usage` | `user_id`, `usage_date`, `kind`, `used`, `updated_at`; upsert con `onConflict:'user_id,usage_date,kind'` | `request-learning-content/index.ts:2420,2605`. **Ausente también en la fixture**. Se necesita clave UNIQUE/PK compatible con esa terna, pero se desconocen nombre, tipos exactos, checks, FK, grants y políticas. No inventar atomicidad, trigger ni RPC de cuotas no presentes en el código |
| `private.content_delivery_log` y esquema `private` | Campos documentados: `id`, `user_id`, `profile_id`, `content_id`, `kind`, `delivered_at`; FK de perfil en cascada requerida si existe | `docs/privacy/schema-review-2026-10-23.md` y migración de privacidad. Antecedente documental de bigint/UUID/text/timestamptz no sustituye el DDL actual. Recuperar identity/secuencia, todas las FK (destino de `content_id` desconocido), índices, productor del log, triggers, funciones y permisos del esquema |

`progress.history`, `_delivery`, `ageRoute`, `ageYears` y las métricas `gliax.exercise-metrics.v1` son contratos JSON del cliente/Edge, no tablas o columnas SQL adicionales que debamos inventar. `detail` contiene métricas serializadas desde el cliente; su representación SQL autoritativa debe recuperarse.

Las nueve tablas públicas mencionadas en la auditoría histórica de `docs/roadmaps/gliax-beta-profesionales-20261116.md` son compatibles con cinco tablas base + tres de facturación + una de auditoría. Es una referencia documental, **no un inventario actual confirmado** ni una razón para excluir tablas nuevas.

## Tipos, esquemas y dependencias de plataforma

| Objeto | Evidencia disponible | Definición que falta |
| --- | --- | --- |
| `public.subscription_status` | La migración 1 hace un cast a ese tipo. Los tests lo modelan como enum `trial`, `active`, `past_due`, `cancelled`, `complimentary`; el cliente y Edge consumen esos estados | Tipo real, todas sus etiquetas y orden, owner y grants. La lista de tests no certifica la definición actual ni excluye valores adicionales |
| Tipos de `age_band`, locale, dominio, clase de contenido, ID y sesión | Solo contratos de strings/valores en cliente y fixtures parciales | Saber si son text, enums, domains, UUID u otros tipos, con sus checks/collation/defaults. No crear enums nuevos basándose en etiquetas de la interfaz |
| Esquemas `public`, `private` y otros propios | Referencias de aplicación y privacidad; dependencias Auth | Owners, ACL, USAGE/CREATE y privilegios por defecto; descubrir otros esquemas mediante catálogos |
| Extensiones y dependencias entre objetos | UUID y comprobación opcional de `pg_cron` en diagnósticos | Inventario exacto `pg_extension`, versiones/esquemas, tipos/rutinas externos referenciados. El bootstrap debe respetar las dependencias recuperadas y la plataforma destino |

## Relaciones, claves e índices

| Relación / índice | Conocido | Pendiente |
| --- | --- | --- |
| Cuenta profesional ↔ identidad Auth | Los tests modelan `accounts.user_id → auth.users.id` | FK real, nombre, deferrability, ON DELETE/UPDATE y ciclo de vida de la cuenta |
| Perfil → cuenta | Predicado RLS `account_id=auth.uid()` y columna en el cliente | FK/índice y borrado de cuenta reales; no asumir CASCADE |
| Resultados/vistos → perfil | Migración 2 añade CASCADE solo si no existe una FK compatible por columna | Recuperar cualquier FK original y checks; evitar duplicarlas o cambiar acciones al reconstruir |
| Uso agregado → cuenta | Código filtra por `user_id`; no hay `profile_id` en los upserts | FK, PK/UNIQUE de la terna, checks de `kind`/contador, índices y mantenimiento |
| Log privado → perfil | La migración verifica una FK CASCADE y el RPC controla propiedad | Resto de relaciones y productor exactos; no deducir una tabla de contenidos de `content_id` |
| Tres tablas `billing_*` → cuenta | FK CASCADE en migración 1; PK y UNIQUE de sesión de checkout; índice `(user_id,livemode,created_at desc)` | Comparar contra metadatos recuperados, sin considerar que el DDL remoto ya coincida |
| Auditoría → cuenta | FK CASCADE; PK bigint identity, `profile_id` UUID sin FK declarada, índice `(account_id,occurred_at)` | No añadir una FK al perfil: el evento debe sobrevivir a su borrado. Confirmar objetos adicionales del actual |
| Resultados por intento | UNIQUE `(profile_id,client_attempt_id)`; UUID nullable para historial | Definición versionada disponible; comparar índices/constraints originales, no duplicar |
| Código de perfil por cuenta | Índice único normalizado de migración 6 | Conservar alias históricos y diagnóstico de colisiones; no deducir nombres a partir de registros reales |
| Índices base/temporales/expresión, secuencias, particiones, vistas | No están inventariados exhaustivamente en Git | Recuperar `pg_get_indexdef`, constraints, parámetros de secuencia y ownership (sin `last_value`), vistas y claves/jerarquía de partición |

## Funciones y triggers

Estas **diez funciones** tienen una definición versionada; conservar firma, cuerpo, owner efectivo, ACL, `SECURITY DEFINER/INVOKER` y `search_path`, comparándolos después con la captura:

| Archivo | Firmas / triggers disponibles |
| --- | --- |
| Facturación | `billing_prepare_checkout(uuid,boolean,text) → jsonb`; `billing_bind_checkout(uuid,text,text) → void`; `billing_claim_event(text,uuid,boolean,uuid) → text`; `billing_finish_event(text,uuid,uuid,text,text,timestamptz) → void`; `billing_release_event(uuid,uuid) → void`. Todas SECURITY DEFINER, `search_path=public,pg_temp`, comprueban rol de servicio y restringen EXECUTE |
| Privacidad | `minimize_learner_progress(jsonb) → jsonb` (SQL immutable); `enforce_learner_privacy() → trigger`; `manage_learner_privacy(text,uuid,text,date) → jsonb` con defaults en los dos últimos parámetros; `purge_expired_privacy_audit() → void`. Las tres últimas SECURITY DEFINER, `search_path=public,pg_temp` |
| Códigos | `validate_new_learner_profile_code() → trigger`, cuerpo final en migración 6; no SECURITY DEFINER |
| Triggers declarados | `learner_privacy_write` BEFORE INSERT/UPDATE; `learner_privacy_delete` BEFORE DELETE; `learner_profile_code_format` BEFORE INSERT/UPDATE OF name; todos sobre `learner_profiles`, por fila |

**Sin definición recuperable:** función y trigger que aprovisionan `accounts` después del alta Auth (no asumir que se llaman `handle_new_user`), actualización automática de `updated_at` si existe, productor de `private.content_delivery_log`, otros triggers de tablas o eventos DDL, funciones de autorización/cuotas/administración ajenas a estas diez y posibles overloads. Inventariarlos por catálogos, incluidos los triggers de aplicación anclados a **`auth.users`**, que un dump limitado a `public/private` omitiría. No inventar ninguno.

`auth.uid()`, `auth.role()`, `auth.users` y los roles Supabase son dependencias de plataforma. Se necesitan en el destino, pero no se reconstruyen con los shims de PGlite ni con un dump indiscriminado del esquema gestionado de Auth. `gen_random_uuid()` debe estar disponible: en PostgreSQL moderno no demuestra por sí solo que haya que instalar `pgcrypto`. `pg_cron` es opcional; el repositorio no programa la purga.

## Permisos y políticas RLS

| Objeto | Contrato de seguridad en Git | Definición pendiente |
| --- | --- | --- |
| `accounts` | Cliente lee su cuenta y actualiza `content_locale`. Los tests de facturación exigen negar UPDATE de estado de suscripción y permitir UPDATE solo del idioma | RLS, SELECT/UPDATE propias y grants de columna **no creados por las seis migraciones**. La fixture de las 51 pruebas solo otorga SELECT a authenticated: no valida el cambio de idioma de cuenta. Recuperar políticas/ACL/owner originales |
| `learner_profiles` | RLS activa; `profiles_select_own`, `profiles_insert_own`, `profiles_update_own` (USING y WITH CHECK), `profiles_delete_own`; CRUD a authenticated; DML a service_role | Permisos de esquema, defaults de ACL, roles/ownership y políticas especiales originales eliminadas por migración 2: documentar diferencias, no reintroducirlas sin revisión |
| `exercise_results` | `results_select_own`, `results_insert_own` verifican dueño del perfil; SELECT/INSERT a authenticated; no UPDATE/DELETE directo; DML a service_role | ACL/base, secuencia real y dependencias de usuario/administración |
| `content_seen` | `seen_select_own` verifica cuenta y perfil; authenticated solo SELECT; service_role DML | Tipos/grants base, secuencias e índices de selección de contenido |
| `content_usage` | Edge usa service_role; la auditoría histórica menciona RLS sin política | Recuperar RLS/FORCE RLS, ACL de tabla/columnas/secuencia y rutas indirectas. «Sin política» no equivale a demostrar restricción de todas las rutas |
| `learner_privacy_audit` | `audit_own` SELECT por cuenta; authenticated SELECT; service_role SELECT/INSERT/DELETE; control de secuencia | Permisos de esquema y rol dueño efectivos |
| `billing_*` | RLS activa, sin políticas de cliente; revocación a PUBLIC/anon/authenticated y ALL a service_role | Roles y grants heredados/por defecto no están definidos globalmente por la migración |
| Log privado | Revoca tabla y grants de columna a PUBLIC/anon/authenticated; exportación por RPC con comprobación de cuenta/perfil | USAGE del esquema, owner, roles backend, RLS/políticas y posibles grants indirectos originales |
| RPC | Facturación y purga: service_role; gestión de privacidad: authenticated con comprobación explícita de propiedad; helpers/triggers sin EXECUTE público | Propiedad, membresías de rol y ACL por defecto; un ACL NULL representa defaults de PostgreSQL, no ausencia de acceso |

También faltan inventario de `ALTER DEFAULT PRIVILEGES`, grants de esquema/tipos/secuencias y columnas, membresías/herencia/BYPASSRLS, posibles vistas con `security_invoker`, publicaciones Realtime y extensiones. La seguridad no se reconstruye copiando solo `CREATE TABLE`.

## Qué recuperar y qué no exportar

Recuperar las definiciones exactas anteriores con el [procedimiento de esquema sin datos](gliax-schema-only-export-20261117.md) y `supabase/diagnostics/schema-only-inventory.sql`. La consulta nueva solo usa catálogos y no ejecuta las funciones inspeccionadas. No usar para esta tarea `privacy-preflight.sql`: aunque sea de solo lectura, consulta recuentos y relaciones entre registros reales.

Las configuraciones Auth/SMTP/redirects, claves, secretos Edge, filas `cron.job`, Vault, buckets/objetos de Storage y filas del historial `supabase_migrations` **no son DDL recuperable con este procedimiento**. No se leen ni exportan aquí. Identificar su necesidad como pendiente de un procedimiento/configuración autorizado aparte; no añadir valores inferidos. No extraer passwords de roles, datos de cuentas ni valores actuales de secuencias.

## Plan de migración inicial, pendiente de definiciones

1. Conservar las seis migraciones y los tres archivos de pruebas de `dcca944` sin cambios. Obtener en una fase futura autorizada el paquete de esquema; revisar/redactar posibles secretos literales antes de compartir o versionar. Mantener captura original privada y checksums.
2. Clasificar cada objeto recuperado como plataforma, base previa, delta ya descrito en las seis migraciones o diferencia nueva. Un snapshot del Supabase actual **no representa necesariamente** el estado previo a octubre ni confirma qué migraciones se aplicaron. Comparar DDL, sin consultar filas del historial remoto en esta fase.
3. Preparar **después de esa revisión** un bootstrap de aplicación versionado y separado, destinado solo a bases nuevas, anterior a las seis migraciones. El candidato `supabase/bootstrap/initial-schema.sql` se menciona como destino futuro: **no se crea ahora**. Debe contener la base previa y dependencias exactas recuperadas, no los objetos de los seis deltas que se crearán luego. Esto conserva sus archivos e historial y evita insertar una falsa migración «antigua» con timestamp inventado.
4. Orden: plataforma Supabase local compatible → roles/extensiones requeridos y aprobados → esquemas/tipos → cuentas y demás tablas base → constraints/índices/secuencias → funciones y triggers base (incluido alta de cuenta en Auth) → permisos/políticas base → seis migraciones en el orden auditado. Resolver dependencias cruzadas de funciones/FK por el grafo real, no solo por este orden orientativo.
5. Si no puede recuperarse de forma inequívoca el estado previo, bloquear ese bootstrap y proponer por separado una baseline consolidada para instalaciones nuevas. No mezclar baseline del estado actual + seis deltas, no editar migraciones históricas para ocultar conflictos y no hacer `migration repair` remoto. Una futura migración nueva se generará con CLI tras consultar su ayuda y fijar el flujo de versiones.
6. En un segundo entorno local limpio, probar bootstrap + seis deltas y comparar catálogos/DDL normalizados con el estado objetivo aprobado, incluidos ACL, owners mapeados, RLS, triggers en Auth y objetos privados. Las diferencias intencionadas se documentan explícitamente; no se aplican cambios al origen.
7. Mantener el recorrido de las 51 comprobaciones en modo fixture como regresión. Añadir posteriormente un modo de bootstrap real que sustituya **solo la preparación** por el esquema recuperado, registre usuarios mediante Auth y compruebe el aprovisionamiento automático de `accounts`. La prueba actual inserta esas filas manualmente y no puede certificar ese trigger.
8. Ampliar pruebas con datos ficticios: contenido Edge y `content_usage`, historial completo de `content_seen`, idioma de cuenta, aislamiento, concurrencia/reintentos, exportación/borrado y sesiones independientes. Ejecutar advisors locales y la batería frontend. Staging o despliegue requerirán una autorización posterior; no están autorizados por este plan.

## Verificación de esta entrega

Se comprueba la sintaxis y salida de la nueva consulta y el carácter schema-only del dump únicamente en PostgreSQL local desechable, con esquema de pruebas y un marcador ficticio. Esto valida las herramientas de captura, no completa el esquema GLIAX. Las 51 pruebas previas se conservan, no se presentan como repetidas en esta auditoría. No hay nuevas definiciones de aplicación, migraciones ejecutadas remotamente ni cambios en Auth remoto.

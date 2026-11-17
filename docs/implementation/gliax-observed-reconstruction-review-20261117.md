# GLIAX — revisión de reconstrucción con las definiciones observadas

Fecha: 17/11/2026. **Estado: BLOQUEADO antes de generar o ejecutar una baseline completa. No es una reconstrucción terminada.**

## Checkout y alcance

Se comprobó Git limpio en `7a76e5039623a29495083782bfb262b5758cbdbf`, rama `integration/gliax-pr50-pr51-20261117`. Se actualizó por **avance directo**, sin commit de merge, a `a3a75de412e29be39d91f0afd86c3592dcee233b`. Se conservan los commits `9ee39c4`, `dcca944` y `7a76e50`; las seis migraciones y todos los tests de `dcca944` permanecen sin cambios.

Fuentes revisadas, todas en Git:

- [Metadatos observados](gliax-observed-schema-metadata-20261117.md).
- [Funciones base observadas](gliax-observed-base-functions-20261117.md).
- [Permisos efectivos y extensiones observados](gliax-observed-permissions-20261117.md).
- [Inventario y plan anterior](gliax-database-bootstrap-inventory-20261117.md), seis migraciones y consumidores frontend/Edge.

No se conectó a Supabase remoto. No se leyeron usuarios, límites de planes, bancos de contenido ni otros registros del origen. Los datos de los documentos se tratan como evidencia aportada, no como una nueva comprobación del estado remoto actual.

## Resultado de la revisión

Las fuentes JSON son analizables y contienen **12 tablas, 86 columnas, 43 constraints, 28 índices, 6 triggers y 10 políticas**; un enum, tres cuerpos de funciones base y permisos de nueve funciones adicionales. El documento de permisos contiene 36 combinaciones tabla/rol, seis combinaciones esquema/rol, diez resultados de UPDATE de columnas y seis extensiones.

Esto recupera gran parte del contrato estructural y corrige las limitaciones conocidas de la fixture. **No constituye un dump completo de seguridad y metadatos.** El propio documento de permisos indica que faltan roles completos, membresías, ACL por defecto, opciones de secuencias y publicaciones. No puede demostrarse el estado previo a las primeras migraciones. La alternativa adecuada, cuando se completen los bloqueos, es una baseline consolidada para bases nuevas separada de las seis migraciones, sin timestamps históricos inventados.

La condición del encargo exige detenerse si no puede completarse una reconstrucción fiel. Se alcanza ese punto aquí: no se han rellenado los huecos con los defaults del Supabase local ni con la fixture antigua. No se crean archivos DDL incompletos que parezcan una baseline lista para ejecutar.

## Objetos cuya definición estructural ya está recuperada

| Grupo | Evidencia recuperada y aplicación futura |
| --- | --- |
| Tipos | `public.subscription_status`: etiquetas y orden observados (`trial`, `active`, `past_due`, `cancelled`, `complimentary`); columnas, tipos, nulabilidad, defaults y modalidad identity de las 12 tablas |
| Cuentas | `public.accounts`, FK a `auth.users(id)` ON DELETE CASCADE, claves Stripe, check de idioma, trial de siete días y campos temporales; políticas SELECT propia y UPDATE propia de idioma |
| Perfiles/resultados | `learner_profiles` incluye `updated_at`, check de nombre de 1–80 caracteres, checks de edad/idioma y FK de cuenta en cascada. `exercise_results.id` es bigint identity ALWAYS, `level` smallint, incluye `created_at`, y `correct` continúa NOT NULL en la observación |
| Historial/uso | `content_seen.id` bigint identity BY DEFAULT; `domain` e `item_signature` NOT NULL, firma mecánica opcional, fecha e índice de selección. `content_usage` tiene PK `(user_id,usage_date,kind)`, checks de clase y contador, FK Auth en cascada e índice por fecha |
| Banco privado | `private.content_items`: 12 columnas, checks de clase/edad/nivel, PK, índice de selección e índice único parcial `source_key IS NOT NULL`; trigger de actualización temporal. `private.plan_limits`: cuatro columnas, PK del plan y tres checks de valores positivos |
| Entregas privadas | `private.content_delivery_log`: identity ALWAYS, FK a Auth, perfil y **`private.content_items(id)`**, todas en cascada, más índices por contenido, perfil/contenido y usuario/fecha |
| Facturación/privacidad | Tablas `billing_account_locks`, `billing_checkout_attempts`, `billing_webhook_events`, `learner_privacy_audit`, constraints e índices observados; sus definiciones versionadas están en las migraciones 1 y 2 |
| Triggers | `on_auth_user_created`, `content_items_set_updated_at`, `accounts_set_updated_at`, `learner_profiles_set_updated_at`, `learner_privacy_write`, `learner_privacy_delete`; sentencia DDL observada para cada uno |
| RLS | Diez políticas observadas; RLS activa en las nueve tablas públicas y desactivada en las tres privadas, sin FORCE RLS según captura. No deducir de eso que las privadas sean públicas: USAGE y grants efectivos son negativos para los tres roles consultados |

No se vuelve a transcribir el DDL a mano: las listas de columnas, constraints, índices y triggers están en el JSON de la fuente, con sus nombres originales. Así se conserva la evidencia sin introducir variantes o índices duplicados.

### Funciones base verificadas

| Firma recuperada | Definición y privilegios observados | Dependencias |
| --- | --- | --- |
| `public.handle_new_user() → trigger` | Owner `postgres`, SECURITY DEFINER, `search_path=public`; inserta `accounts(user_id)` con ON CONFLICT DO NOTHING. EXECUTE efectivo negativo para anon/authenticated/service_role | `auth.users` y su trigger AFTER INSERT; `accounts` y PK. La creación manual de cuentas del test anterior debe desaparecer del modo reconstruido |
| `public.set_updated_at() → trigger` | Owner `postgres`, SECURITY INVOKER, `search_path=public`; asigna `new.updated_at=now()`. EXECUTE efectivo positivo para los tres roles | Columnas `updated_at` y los tres triggers temporales observados. Una restricción futura de EXECUTE es un cambio de seguridad separado, no una modificación silenciosa del cuerpo observado |
| `public.request_learning_content_internal(uuid,uuid,text,text,smallint,integer) → TABLE(content_id uuid,content jsonb)` | Owner `postgres`, SECURITY DEFINER, `search_path=public,private`; tres últimos argumentos con defaults NULL, 1 y 1; EXECUTE efectivo solo de service_role entre los roles consultados | `accounts`, `learner_profiles`, enum, `private.plan_limits`, `private.content_items`, `private.content_delivery_log`. Controla cuenta/perfil, trial, tamaño y cuota; selecciona contenido y registra entregas |

Los cuerpos exactos ya están recuperados en `gliax-observed-base-functions-20261117.md`; no se sustituyen por funciones inventadas. Se conservarán literalmente cuando se pueda ensamblar una baseline con su contexto de permisos. Las otras nueve funciones se tomarán de las migraciones, como instruye la fuente; sus cuerpos remotos no fueron capturados y, por tanto, no se afirma equivalencia de cuerpos con el origen. No se ejecutó ninguna de ellas en esta revisión.

## Clasificación frente a las seis migraciones

| Migración | Evidencia del snapshot | Tratamiento en la futura baseline consolidada |
| --- | --- | --- |
| `202610210001_billing_integrity.sql` | Tres tablas, PK/UNIQUE/FK, `billing_checkout_owner` y cinco funciones con privilegios observados; compatible con sus objetos | Incluirlos una vez; no ejecutar la migración 1 encima de una baseline que ya los cree |
| `202610230001_learner_privacy.sql` | Auditoría, `privacy_review_at`, políticas y dos triggers presentes; constraints base de perfil/resultados/vistos ya tienen nombres propios y CASCADE | Incluir estado final y nueve cuerpos versionados compartidos con facturación una vez; no duplicar auditoría, triggers, políticas ni añadir FK redundantes. No ejecutar el UPDATE de minimización sobre un origen remoto |
| `20261109212329_idempotent_exercise_results.sql` | `client_attempt_id` y `exercise_results_profile_client_attempt_key` ya presentes, incluido el índice soporte de UNIQUE | No añadir la columna/UNIQUE por segunda vez |
| `20261116170000_validate_new_profile_codes.sql` | Ni el trigger `learner_profile_code_format` ni su función aparecen en el conjunto aportado | Delta necesario para el objetivo de integración: incorporar una sola vez, usando el cuerpo final sustituido por la migración 6 |
| `20261116171000_allow_unscored_exercise_results.sql` | `correct` observado NOT NULL | Diferencia intencionada del objetivo local final: nullable; requiere validación real de `guided_wait` con NULL |
| `20261117100000_unique_learner_profile_codes.sql` | Índice único normalizado ausente de los 28 índices | Diferencia intencionada: cuerpo final de validación e índice normalizado. En base nueva no hay alias históricos; la preservación se ensaya exclusivamente con alias ficticios |

El título general de la captura no permite tratarla como un estado anterior a todas las migraciones de noviembre: **sí contiene el delta de idempotencia de noviembre**. La clasificación es por objetos presentes, no prueba de filas del historial de migraciones; no se consultó ese historial. Los índices de PK/UNIQUE de los 28 observados se materializan al crear sus constraints: no se emiten además sus CREATE INDEX equivalentes.

## Dependencias que impiden declarar fidelidad

| Falta concreta | Por qué no se puede suplir con una suposición | Recuperación necesaria, solo estructura |
| --- | --- | --- |
| Owners y ACL originales de tablas, esquemas, tipos y secuencias; ACL de funciones | Permisos efectivos de tres roles no revelan quién concede, grant option, PUBLIC u otros roles. La propiedad cambia acceso, RLS y DDL. No se presume `postgres` para todo porque sí conste como owner de funciones | `nspowner/nspacl`, `relowner/relacl`, `attacl`, `typowner/typacl`, `proowner/proacl` por firma; preservar NULL como default, no como ausencia de acceso |
| `ALTER DEFAULT PRIVILEGES` | El contexto local puede dar EXECUTE a service_role al crear funciones mientras el snapshot dice que no lo tiene en algunos helpers/RPC. Reproducir solo el cuerpo de la migración no demuestra la misma autorización | `pg_default_acl`: rol, esquema, tipo de objeto y ACL, además de grants explícitos. No inventar defaults revocando/concediendo indiscriminadamente |
| Roles, membresías/herencia y BYPASSRLS | No se conoce si los permisos excesivos de `accounts` proceden de grants directos, PUBLIC o roles heredados; tampoco acceso de roles no consultados | Catálogos de roles sin passwords y membresías, incluidas opciones INHERIT/SET aplicables a la versión. No exportar `pg_authid` ni credenciales |
| Secuencias identity | Se observan ALWAYS/BY DEFAULT, pero no nombres/owner/grants, START/INCREMENT/MIN/MAX/CACHE/CYCLE ni dependencia completa. Elegir los defaults del destino no demuestra igualdad | `pg_sequence` y `pg_depend` con ownership/ACL; **no** `last_value`, `is_called` ni SEQUENCE SET |
| Estado/atributos adicionales de constraints, índices y triggers | Las sentencias recuperadas no incluyen necesariamente `convalidated`, `indisvalid/indisready`, `tgenabled` o todas las opciones de relación/collation. No asumir que todo está habilitado/validado | Atributos de catálogo junto a sus definiciones; owners/reloptions cuando correspondan |
| Dependencias/configuración de plataforma | Faltan inventario exhaustivo fuera de las tablas listadas, publicaciones/membresías Realtime, versión PostgreSQL del origen, contexto de extensiones y ajustes relevantes como zona horaria o `plpgsql.variable_conflict` para la función privada | Catálogos y ajustes permitidos específicos, sin credenciales ni opciones de conexión. Las seis versiones de extensiones observadas no acreditan por sí solas equivalencia de toda la plataforma |

El [procedimiento preparado de exportación de esquema](gliax-schema-only-export-20261117.md) y `supabase/diagnostics/schema-only-inventory.sql` cubren gran parte de estos metadatos sin registros. Permanecen **sin ejecutar remotamente**. La consulta actual no captura todos los ajustes de base/rol ni el estado de todas las dependencias: cualquier ampliación debe revisarse para excluir secretos. No se convierte el acceso anterior de ChatGPT en permiso para que Codex se conecte ahora.

Las filas de `private.plan_limits` y `private.content_items` **no deben recuperarse para resolver este bloqueo**: son datos, no el esquema que falta. Las futuras pruebas usarán límites y contenido completamente ficticios y declarados como tales; sus valores no certificarán las cuotas o el banco reales.

## Por qué las 51 pruebas no se vuelven a ejecutar con la fixture antigua

| Preparación actual en `tests/local-supabase-validation.py` / fixture | Discrepancia observada | Cambio que requerirá el futuro modo de baseline |
| --- | --- | --- |
| Espera fallo de la primera migración sobre `public` vacío y carga la fixture antes de seis migraciones | Una baseline consolidada ya incluirá los deltas presentes; repetir 1/2 duplicaría objetos | Preparación explícita y única, fuera del historial incremental; mantener las 51 aserciones pertinentes y distinguir la comprobación histórica de limitación |
| Después de signup inserta manualmente `accounts` | `handle_new_user` observado ya aprovisiona la cuenta | Verificar fila creada por trigger y sus defaults; modificar su estado sintético por una acción administrativa local, sin segunda inserción |
| Modelo `exercise_results.id` UUID y sin `created_at` | Bigint identity ALWAYS, smallint de nivel y fecha adicional | Usar esquema observado; comprobar permisos de secuencia y defaults reales del nuevo entorno |
| Inserta `content_seen` sin `domain` | `domain` es NOT NULL; identidad y nulabilidad de firma difieren | Proporcionar un dominio y firma ficticios válidos, dejando que identity genere el ID |
| Inserta entrega privada con `content_id=gen_random_uuid()` | FK nueva conocida a `private.content_items(id)` | Crear primero un contenido ficticio válido y comprobar que exportación/borrado conserva o elimina cada objeto según sus FK; no quitar la FK para pasar la prueba |
| Fixture no contiene `content_usage`, `content_items` ni `plan_limits` completos, checks y triggers base | No ejercita rutas de cuotas ni el RPC interno original | Poblar solo datos sintéticos compatibles; probar tipos, constraints, rutina original y aislamiento explícitamente |
| La fixture concede permisos simplificados y solo SELECT de cuenta a authenticated | Captura contiene UPDATE de `content_locale`, políticas propias y permisos excesivos de TRUNCATE/TRIGGER | Comparación estructural/de permisos independiente y ensayo de propuesta de seguridad en una variante separada |

No se cambian ni suavizan aserciones para simular éxito. Una repetición sobre la fixture previa seguiría probando aquella fixture, no la reconstrucción requerida. Las **51 comprobaciones superadas pertenecen al commit `dcca944`**, no a esta revisión.

## Diferencias previstas y seguridad

No existe todavía una «versión local final» con la que afirmar equivalencia. Las diferencias intencionadas para esa versión serían las migraciones 4–6 (códigos y resultados no evaluativos); una reducción de permisos se ensayaría **por separado**, sin disfrazarla de estado observado. No se han alterado columnas, funciones, permisos ni datos locales/remotos para aparentar igualdad.

La [propuesta de seguridad separada](gliax-accounts-security-proposal-20261117.md) aborda TRUNCATE/TRIGGER de cuentas, defaults y funciones SECURITY DEFINER. No se reproducen aquí los grants peligrosos: no son imprescindibles para demostrar que la evidencia es insuficiente. El hallazgo se conserva como observación aportada, sin afirmar una reproducción nueva.

## Resultado exacto y condiciones para continuar/staging

- Revisión estática completada: tres fuentes JSON válidas, recuentos y clasificación por objetos contrastados con las seis migraciones; se conserva la ascendencia de los commits y los tests originales.
- **Reconstrucción completa: no ejecutada; bloqueada por los metadatos de seguridad/contexto enumerados. Baseline: no generada.**
- **51 comprobaciones PostgreSQL/Auth/PostgREST: no repetidas en este trabajo.** No se declara ningún resultado nuevo de esas pruebas. Tampoco se afirma haber comprobado dinámicamente aislamiento o permisos SECURITY DEFINER con las nuevas definiciones.
- `npm test`: no ejecutado; esta entrega modifica únicamente documentación, no código ni tests. `git diff --check` y la comparación Git de tests/migraciones se usan como verificaciones de la entrega documental.
- Antes de continuar: aportar el paquete de estructura/ACL faltante, revisado y sin datos, o autorizar explícitamente un objetivo local de equivalencia parcial con supuestos documentados. Esta entrega no asume esa flexibilización.
- Antes de crear staging: baseline completada y validada desde cero sin fixture simplificada; pruebas reales de Auth/trigger, tipos, claves, cuotas sintéticas, códigos, NULL, reintentos, recuperación, exportación/borrado, RLS y propuesta de permisos; evaluación de funciones privilegiadas; configuración Auth/SMTP/redirects/Edge/Realtime y versiones del destino definidas por separado; aprobación posterior para provisionar o desplegar. No copiar usuarios, contenido real ni secretos.

Se sube esta revisión a la rama temporal para que el bloqueo y las definiciones ya recuperadas sean revisables. No equivale a dar por terminado el objetivo de reconstrucción.

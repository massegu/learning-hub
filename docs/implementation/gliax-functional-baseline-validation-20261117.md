# GLIAX — baseline local de equivalencia funcional

Fecha: 17/11/2026. Rama `integration/gliax-pr50-pr51-20261117`, base remota comprobada `ef1408f9cef2e8a3f4efc7309fd73a639e6b2e86`, árbol limpio al empezar. Alcance autorizado: equivalencia funcional local con datos sintéticos, usando roles/plataforma oficiales locales y permisos de aplicación explícitos. No se realizó una nueva consulta del proyecto Supabase remoto.

## Entrega y estrategia

La baseline se encuentra en [supabase/baselines](../../supabase/baselines/README.md). El runner local instala, por orden:

1. `gliax-local-functional.sql`: estructura consolidada de aplicación con todos los deltas de integración incluidos una vez; acceso de API denegado antes de confirmar la creación.
2. `local-privileges.sql`: permisos explícitos de aplicación para los roles locales oficiales, con el estado seguro de cliente separado del DDL estructural. No copia ni presupone equivalencia de los privilegios globales/default del origen.
3. `local-content-compatibility.sql`: corrección local de compatibilidad SQL identificada y comprobada por separado; conserva la definición original recuperada como evidencia en el primer archivo y en el documento observado.

Los tres archivos están fuera de `supabase/migrations`. **Las seis migraciones históricas permanecen sin cambios.** Una instalación nueva local usa la baseline y no vuelve a ejecutar esas migraciones. Una instalación existente/beta conserva su historial; estos archivos no son una actualización ni se han aplicado sobre ella. Las guardas rechazan una base de aplicación no vacía, la segunda aplicación y una invocación sin la preparación del runner. El runner verifica endpoint loopback, contenedor, etiquetas y red interna antes de escribir; la guarda SQL por sí sola no certifica el destino.

## Definiciones recuperadas y contraste estructural

Se usan los tres documentos observados del repositorio y los cuerpos versionados de las migraciones. La comparación contra catálogos de PostgreSQL se realiza con esas fuentes como referencia independiente. Se ignora formato/visibilidad de esquema, conservando los literales entrecomillados al normalizar definiciones.

| Objeto | Observación aportada | Resultado local de integración |
| --- | --- | --- |
| Tablas y columnas | 12 tablas, 86 columnas | Mismos nombres, tipos, defaults, identity y nulabilidad; único cambio de columna previsto: `exercise_results.correct` permite NULL |
| Restricciones | 43 validadas | 43, definiciones coincidentes y validadas; incluye FK de entregas a `private.content_items` y cascadas Auth/cuenta/perfil |
| Índices | 28 válidos/preparados | Los 28 coinciden; se añade el índice único normalizado de códigos: **29**, todos válidos/preparados. No se duplican índices soporte de PK/UNIQUE |
| Triggers | 6 habilitados | Los 6 observados, incluido el de `auth.users`, más el de validación de código: **7**, habilitados |
| Políticas | 10; RLS/FORCE RLS observados | Las diez definiciones coinciden; RLS/FORCE RLS de las doce tablas coincide con la captura |
| Funciones | Tres cuerpos base y nueve funciones versionadas | Las tres definiciones recuperadas se contrastan antes del overlay; las nueve se incorporan desde Git y se añade validación de código: **13 rutinas**, sin overloads duplicados. El overlay reemplaza una de ellas, conservando firma y ACL |
| Secuencias | Cuatro identity bigint, inicio/incremento/cache 1, sin ciclo | Cuatro con esos parámetros; ALWAYS/BY DEFAULT según cada columna. Nombres/bounds no aportados usan las convenciones locales; permisos de uso de aplicación explícitos |
| Enum | `subscription_status`, cinco etiquetas ordenadas | Coincidente |
| Privilegios efectivos | Matrices de aplicación aportadas | **216 comprobaciones** tabla/rol/privilegio, seis USAGE de esquema y **36 EXECUTE** de funciones contrastados. Las diferencias de cliente intencionadas se aplican en el perfil seguro y se prueban también mediante denegaciones SQL reales |

Se reconstruyeron `accounts`, `learner_profiles`, `exercise_results`, `content_seen`, `content_usage`, las tres tablas de facturación, auditoría y las tres privadas: `content_items`, `plan_limits`, `content_delivery_log`. El contenido y los límites que se insertan durante las pruebas son completamente ficticios. No se recuperaron ni necesitaron filas reales del origen.

Las funciones `handle_new_user`, `set_updated_at` y `request_learning_content_internal` proceden del documento de definiciones. Signup de Auth crea la cuenta mediante el trigger recuperado; el modo baseline no inserta una cuenta sustitutiva manualmente. Tampoco carga `tests/fixtures/supabase-local-baseline.sql`, omite checks o elimina claves foráneas. Los resultados usan identity bigint; el contenido visto incluye su dominio obligatorio y las entregas tienen una fila padre de contenido sintético válida.

## Corrección local comprobada

Con PostgreSQL local estándar, la función interna recuperada produjo una referencia SQL ambigua entre una columna de `RETURNING` y un parámetro de salida. No se comprobó su ejecución o configuración en el origen ni se atribuye ese resultado al entorno remoto.

El archivo de compatibilidad introduce un alias del destino de inserción y cualifica esa referencia. No modifica firmas, selección, límites o controles de acceso; `CREATE OR REPLACE` conserva owner/ACL. Se comprueba el cuerpo original antes del overlay y el comportamiento corregido después: devolución/registro de contenido sintético y rechazo de cuota, trial expirado, tamaño inválido y relación cuenta/perfil incompatible. La corrección solo se aplica al entorno local nuevo; no se modifica ninguna migración histórica ni la función remota.

## Entorno y ejecución

- Debian 13.6; Docker cliente/daemon 28.4.0; Supabase CLI 3.2.0; PostgreSQL 17.12 (`supabase/postgres:17.12.0.000`); Auth v2.198.0, PostgREST v16.5, Kong 2.8.1.
- Cliente `@supabase/supabase-js` 2.119.0 fijado en instalación temporal, Node 24.19.0, Chromium 151.0.7922.173 y Playwright 1.62.0.
- Proyecto desechable `gliax-local-20261117`, configuración fuera del repositorio, sin enlace remoto, con red Docker interna. Relay TCP únicamente loopback `55431/55432`. Se consultaron las ayudas de la versión instalada antes de ejecutar comandos.
- Roles, membresías, extensiones y defaults de plataforma proceden de la instalación local oficial. Los objetos de aplicación se crean con el rol local `postgres`; no se importan roles gestionados, ACL globales, secretos ni dumps privados.
- Se conservaron los defaults locales fuera de la aplicación. Para sus objetos actuales se revocaron permisos heredados por creación y se establecieron permisos explícitos; cualquier objeto futuro requiere otra revisión de ACL.
- El navegador usa la aplicación real y recibe solo SDK/config locales; se bloquean destinos externos. Auth, PostgreSQL y PostgREST son reales. El handler TypeScript de contenido y sus módulos se ejecutan con un adaptador Node de la frontera `Deno.serve/env` y el SDK real contra la base local. **No se ha validado un despliegue Deno Edge Runtime.**

## Resultados exactos

| Ejecución | Resultado |
| --- | --- |
| Baseline funcional, sobre aplicación vacía | **88 comprobaciones superadas, 0 fallos**, cero migraciones históricas ejecutadas; fixture de esquema simplificada no utilizada |
| Regresión histórica en otra base recién reiniciada | **51 comprobaciones superadas, 0 fallos** con `--legacy-fixture`; sus seis migraciones se ejecutaron allí una vez. Ese resultado se mantiene separado de la equivalencia funcional |
| `npm test` | **270/270 superadas**, 0 fallos, canceladas u omitidas; duración informada 126.603,338 ms |
| Advisors de seguridad locales | `results: []` a nivel advertencia/error. No acredita configuración remota |
| Verificación de entrega | Sintaxis Python, `git diff --check`, enlaces y revisión de archivos publicados; comparación Git confirma que las seis migraciones y la fixture original no cambiaron |

Las 216/36 verificaciones de permisos son aserciones internas del recorrido de 88; no se presentan como suites adicionales ni se suman al total.

La suite funcional cubre dos cuentas profesionales ficticias, signup/contraseña/refresh/logout/login, aprovisionamiento automático, idioma de cuenta con permisos de columna y RLS, imposibilidad de mutar suscripción desde el cliente, perfiles propios/ajenos y anónimos, códigos únicos normalizados y concurrentes, identity/secuencias, checks y triggers. Comprueba contenido y uso agregado persistidos, cuotas sintéticas, aislamiento del handler y permisos del RPC privado. En sesión independiente aumenta solo el uso agregado; no se escribe el historial individual.

También verifica `guided_wait` con `correct:null`, métricas versionadas de `rule_application`, corte de respuesta después del commit, outbox/reintento sin duplicados, reconciliación automática `exercise_results`/`progress.history`, recarga y cierre/reapertura de sesión, presentación en Progreso y CSV, exportación JSON con todos los almacenes conocidos, ajustes auditados, borrado con sus cascadas y conservación del perfil de B. El navegador no registró excepciones JavaScript.

La regresión histórica conserva los casos de alias anteriores y la reproducción del fallo de la cadena original sin esquema inicial. Esa limitación histórica sigue siendo cierta para las seis migraciones por sí solas; la nueva baseline es la ruta explícita para bases nuevas.

## Diferencias declaradas y pendientes

| Área | Diferencia / límite |
| --- | --- |
| Deltas de integración | Nulabilidad de `correct`, función/trigger de código final e índice único normalizado añadidos respecto al snapshot aportado |
| Permisos de aplicación | Perfil local explícito con capacidades DDL innecesarias del cliente denegadas; no se reproduce el estado excesivo en la base funcional ni se afirma igualdad de ACL de procedencia |
| Plataforma | No se reproducen las entradas globales de privilegios por defecto remotas. Se usan owners/roles/bounds locales y no se certifica igualdad de metadatos internos gestionados |
| Extensiones | La instalación local ofrece Vault 0.3.2 frente a 0.3.1 observado; `pg_cron` no está instalado localmente. No se ensayó programación/retención. Las otras versiones de extensiones instaladas relevantes coinciden con las aportadas |
| Realtime | Existe la publicación local y tiene cero miembros de aplicación, coincidente con lo confirmado. El servicio de Realtime está excluido: no se prueba entrega de eventos |
| Función interna | Overlay local de compatibilidad SQL explícito; cuerpo observado preservado y sin cambios en el origen |
| Datos/configuración | Los límites y contenidos sintéticos no equivalen a cuotas o banco reales. Confirmación de email desactivada localmente; sin SMTP externo, configuración de Auth/Edge o datos personales importados |

**No falta una definición indispensable para los recorridos funcionales locales ejecutados.** El alcance nuevo autoriza diferencias de plataforma documentadas y permite resolver el bloqueo anterior de réplica estricta. No se afirma equivalencia byte a byte con todos los metadatos del Supabase gestionado.

Antes de crear staging quedan por definir y aprobar su configuración Auth/SMTP/redirects/Edge/Realtime, versiones, secretos mediante canales privados, contenidos/planes de prueba y estrategia de actualizaciones. Hay que ensayar allí el runtime Deno, entrega de correos/recuperación, expiración/revocación de sesiones, operación concurrente de cuotas, copias/restauración y mantenimiento/retención, además de repetir el recorrido funcional. No se ha provisionado staging ni se ha preparado un despliegue automático sobre la beta.

## Revisión para repositorio público

Se revisó el contenido nuevo antes de subirlo. Solo se publican DDL de aplicación derivado de las definiciones ya versionadas, permisos del perfil local, corrección local acotada, tests sintéticos y este informe. No se incorporan valores adicionales de ACL/roles remotos no aportados, secretos, credenciales, archivos de servicio/status, dumps, logs crudos de arranque ni datos personales. La información de ejecución sensible permanece fuera del repositorio y la instancia desechable se retira al terminar.

Limpieza verificada: sin contenedores ni volúmenes de prueba, relay detenido, red dedicada eliminada y puertos loopback `55431/55432` cerrados.

No hubo acceso al proyecto Supabase remoto, cambios en la beta, despliegue Cloudflare, cambios en `main`/`desarrollo` ni fusión de ramas o PR.

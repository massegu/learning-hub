# GLIAX — checklist para preparar un staging independiente

Fecha: 17/11/2026. Rama `integration/gliax-pr50-pr51-20261117`. Commit de referencia: `5a139c910d53ea672fff6026abd8bc52ba7886db`.

**Este documento es un plan. No autoriza ni ejecuta creación de proyectos, conexiones, instalación de SQL, publicación web/Edge o fusiones.** Todos los pasos remotos que aparecen más abajo quedan pendientes de una autorización posterior sobre un destino concreto. No se solicita ahora ninguna clave ni contraseña.

Staging será un proyecto Supabase nuevo, con datos ficticios, distinto de `Learning_Hub`. Necesitará además una dirección web de pruebas independiente. Los resultados locales conocidos son **88/88** de baseline, **51/51** de regresión histórica y **270/270** de `npm test`; no son resultados de staging ni se han repetido en este encargo documental.

## Cómo utilizar esta guía

- **Tú / responsable:** persona que decide presupuesto, administra la cuenta Supabase y controla el dominio/correo de pruebas. No necesita escribir SQL ni usar una terminal.
- **Codex:** puede preparar artefactos y pruebas locales; solo podrá conectar o ejecutar acciones en staging cuando una autorización posterior lo permita expresamente y el destino esté verificado.
- **Parar:** no continuar con el siguiente bloque si falta una comprobación. Un fallo no se resuelve apuntando a la beta, desactivando RLS, usando una clave privilegiada en el navegador o aumentando cuotas para ocultarlo.
- Los nombres entre corchetes o en mayúsculas son etiquetas del plan, no valores que haya que pegar literalmente en Supabase. Los campos del manifiesto futuro no son variables que la aplicación ya soporte.

## 1. Decisiones antes de crear nada

| Completado | Decisión que tomas tú | Qué prepara o comprueba Codex |
| --- | --- | --- |
| [ ] | Nombre inequívoco, por ejemplo `GLIAX_staging_qa`; organización, propietario y personas con acceso | Que el futuro identificador de proyecto, no solo su nombre visible, sea diferente del proyecto actual |
| [ ] | Región y ubicación de las pruebas, responsable de los datos sintéticos y fecha de retirada | Compatibilidad del destino con PostgreSQL 17 y las dependencias de la baseline; no copiar la configuración interna gestionada del origen |
| [ ] | Plan, capacidad de cómputo, presupuesto máximo autorizado y alertas de gasto | Lista de servicios necesarios y volumen acotado de pruebas; registrar límites visibles de la oferta elegida |
| [ ] | Un origen web HTTPS exclusivo de staging y quién lo alojará | Artefacto de preview separado y configuración exclusiva del nuevo proyecto; una ruta `/staging` bajo el mismo origen de la beta no separa el almacenamiento del navegador |
| [ ] | Dos buzones o alias de QA bajo control de la organización, sin identidad personal de profesionales reales | Plan de cuentas A/B con contraseñas sintéticas; las direcciones deben recibir correo para probar confirmación/recuperación. `example.invalid` sirve como ejemplo documental, no como buzón |
| [ ] | Servicio de envío de correo de pruebas, remitente y dominio verificado | Qué campos de SMTP configurar; no elegir/provisionar un proveedor ni solicitar sus secretos en este encargo |
| [ ] | Staging inicial sin pagos, recomendado para el recorrido principal; o una fase adicional de pagos de prueba | Separar ambas fases. La existencia de tablas de facturación en la baseline no obliga a activar pagos |
| [ ] | Política de acceso a la preview, duración de sesiones, pruebas de correo y conservación/limpieza | Criterios de aceptación y registro privado de evidencias |

### Costes: qué revisar, sin inventar importes

Antes de aprobar la creación, el responsable debe consultar la [tarifa oficial de Supabase](https://supabase.com/pricing) y el desglose de su organización en Dashboard. Guardar la fecha de consulta, el plan elegido y una aprobación de presupuesto en el registro privado del proyecto. No se presupone que un proyecto adicional sea gratuito ni que un límite de gasto cubra todos los conceptos.

| Servicio o decisión | Qué hay que confirmar en la oferta/contrato vigente |
| --- | --- |
| Supabase: proyecto y cómputo | Coste del proyecto adicional, tamaño, consumo mínimo, pausado/inactividad y efecto sobre la facturación de la organización |
| Auth | Usuarios de prueba, límites de solicitudes, protección de contraseñas y opciones de sesión disponibles en el plan |
| Edge Functions | Invocaciones, recursos/tiempo, límites y salida de datos; incluir las repeticiones de la prueba concurrente |
| Base, logs, red y copias | Almacenamiento/egress, retención de logs, copias y restauración disponibles; no activar PITR u otros extras sin decisión |
| SMTP y dominio | Remitente verificado, DNS, mensajes permitidos, límites, retención y cargos del proveedor de correo elegido |
| Web de staging y automatización | Hosting HTTPS, controles de acceso, caché, dominio y posibles consumos de CI; no se publica nada en Cloudflare por este plan |
| Servicios opcionales | Realtime, Storage, Cron y pagos permanecen fuera de la primera fase si no se necesitan. No habilitarlos por copiar el proyecto actual |
| Cierre | Qué cargos pueden continuar si se pausa; cuándo retirar proyecto, buzones, preview y recursos asociados |

No hay estimación de precios en este documento. El alcance del ensayo concurrente se limitará por número de solicitudes y repeticiones, sin pruebas de carga abiertas o permanentes.

## 2. Preparación que Codex debe terminar antes de cualquier conexión

Estos entregables todavía requieren implementación/prueba local en otro encargo. No son scripts remotos disponibles hoy.

- [ ] Preparar un directorio de ejecución y un perfil de credenciales exclusivos de staging, sin enlaces, `.env`, tokens ni estado de CLI heredados de beta/producción.
- [ ] Preparar un **manifiesto privado de destino**: nombre e ID de staging, API y host PostgreSQL autorizados, origen/ruta web, commit, huellas de los tres SQL y funciones, responsable y acciones permitidas. Incluir el identificador actual en una lista de destinos prohibidos obtenida del checkout, sin publicarlo aquí.
- [ ] Implementar y ensayar localmente guardas que fallen con destino vacío, producción, desacuerdo entre host/API/ref, cambio de manifiesto o redirección HTTP a otro destino. Ningún comando podrá elegir un proyecto por defecto o «el enlazado».
- [ ] Preparar un instalador **específico de staging** basado en los tres SQL de la baseline. Los archivos actuales tienen guardas y nombres de sesión locales; no basta con activar esa opción local en una conexión remota. La adaptación debe cambiar solo la guarda de destino/preparación necesaria, mantener las definiciones funcionales y registrar el diff para revisión.
- [ ] Preparar un runner de E2E de staging que use datos sintéticos y pueda probar confirmación de email y Deno real. El runner local actual exige loopback y una red Docker; no se deben eliminar sus protecciones ni tratar de pasarle una URL remota.
- [ ] Preparar el artefacto web exclusivo de staging, conservando la carga de módulos de `js/config.js`, pero sustituyendo su configuración por la del nuevo destino. Pin de SDK y versión de funciones registrado; nunca publicar la configuración original sin esta revisión.
- [ ] Para la fase sin pagos, preparar una preview que no ofrezca ni invoque checkout/portal y verificarlo en navegador. Actualmente no existe una bandera documentada `BILLING_DISABLED`: no inventarla como secreto de Supabase ni asumir que usar una cuenta complimentary oculta todos esos botones.
- [ ] Preparar un manifiesto de módulos Deno y fijar dependencias/lockfiles reproducibles antes de desplegar. Los imports actuales `npm:@supabase/supabase-js@2` y `jsr:@supabase/functions-js/edge-runtime.d.ts` no fijan todas las versiones transitivas.

### Archivos existentes que no son una vía segura de staging sin adaptación

| Archivo / herramienta revisado | Resultado y regla del plan |
| --- | --- |
| `js/config.js` | Conserva URL/clave pública del proyecto actual, modo de pagos y contacto. No se cambia en este encargo; debe transformarse solo en el artefacto separado de staging, con una comprobación final de destinos y contacto de QA |
| `scripts/deploy-supabase.py` | Comprueba el proyecto contra ese `js/config.js`; `--check` también llama a la API remota para compilar. No ejecutar ninguno de sus modos como prueba «offline» ni reutilizarlo para staging sin un diseño específico |
| `.github/workflows/comprobar-token.yml` | Usa el entorno `beta` y sus variables/secretos. No lanzar ni copiar sus credenciales. Un futuro job de staging necesitaría entorno protegido y credenciales separados |
| `.github/workflows/publicar-beta.yml` y hosting asociado | El workflow visible es de comprobación; sus comentarios mencionan previews de hosting por rama. Revisar las integraciones antes de hacer push si pudiera dispararse una publicación. No promover ramas o lanzar workflows como parte de esta guía |
| `scripts/verify-beta-web.py` | Requiere URL y compara contra el checkout, incluida su configuración. No usarlo contra la beta ni como verificador de una preview transformada sin un manifiesto de staging |
| `tools/review-preview.py`, pruebas `browser-*` y adaptador Node local | Usan fronteras simuladas o adaptadas para ciertos servicios. No constituyen validación de correo o del runtime Deno desplegado |
| `tests/local-supabase-validation.py` | Es deliberadamente local; conserva sus guardas. Se toma su contrato de pruebas para el nuevo runner, sin reutilizar la fixture histórica como baseline de staging |
| `supabase/migrations/` | Las seis migraciones son históricas y ya están consolidadas en la baseline. No copiar este directorio al espacio operativo nuevo ni usar `db push`, `db reset` o `migration repair` remotos |

**Conclusión de la revisión de aislamiento:** el repositorio sí conserva referencias operativas al proyecto actual. No se eliminan con una entrega solo documental. Por eso se bloquea el uso directo de esos archivos/scripts y se exige revisar los artefactos y guardas específicos antes de autorizar staging. Ningún paso de esta guía necesita consultar `Learning_Hub` para comparar datos o comprobar que sigue funcionando.

## 3. Creación futura del proyecto — solo con autorización posterior

**Tú, en Supabase Dashboard:**

- [ ] Seleccionar la organización aprobada y elegir **New project**, no una copia/restauración de producción ni una rama del proyecto actual.
- [ ] Introducir el nombre, región y capacidad aprobados. Crear una contraseña de base de datos exclusiva en el gestor de secretos; no pegarla en chat, GitHub, capturas o documentos públicos.
- [ ] Comprobar en la pantalla del proyecto nuevo su nombre e ID. Guardarlos en el manifiesto privado con las URLs de conexión del propio proyecto.
- [ ] Revisar accesos del equipo y presupuesto/alertas. No dar acceso a datos de producción para facilitar las pruebas.
- [ ] En **Project Settings → API / API Keys**, identificar la URL y clave publicable del proyecto nuevo para su futura configuración privada del artefacto. No entregar al frontend una clave secret/service-role ni compartir valores ahora en chat.
- [ ] En **API / Data API → Exposed schemas**, dejar la exposición de aplicación limitada a `public`; `private` no debe aparecer. No añadir esquemas gestionados o privados para resolver un error de permisos.
- [ ] En **Database → Extensions** y servicios del proyecto, registrar las versiones disponibles. No programar jobs Cron, crear buckets Storage, añadir tablas a Realtime o contratar extras sin un ensayo aprobado. Los servicios/esquemas gestionados pueden existir por defecto; no eliminarlos ni intentar forzar las versiones internas del proyecto actual.

**Codex, cuando esté autorizado a conectarse al nuevo proyecto:**

- [ ] Validar que ID/API/host coinciden con el manifiesto, difieren del destino prohibido y pertenecen al proyecto recién creado. Un nombre visible parecido no es suficiente.
- [ ] Hacer un preflight de catálogos limitado a staging: versión PostgreSQL, roles oficiales disponibles, schemas de aplicación vacíos, permisos del operador y extensiones necesarias. No leer registros de producción ni copiar roles/ACL globales del proyecto actual.
- [ ] Si la base no está vacía o el rol no puede crear los objetos/trigger de aplicación en Auth, detenerse. No conceder permisos generales como atajo ni usar una clave de navegador para administrar SQL.

## 4. Instalar la baseline en la base nueva

**Tú:** revisar el manifiesto y el paquete concreto antes de autorizar su instalación. No necesitas ejecutar SQL manualmente en el editor.

**Codex, con esa autorización y solo mediante el instalador de staging validado:**

1. [ ] Fijar el commit `5a139c9` o un sucesor expresamente revisado y comprobar las huellas/diff del paquete de staging respecto a la baseline local.
2. [ ] Aplicar el equivalente revisado de `supabase/baselines/gliax-local-functional.sql`: estructura consolidada para una base nueva, sin datos y con denegación inicial de acceso de API. Incluye los seis deltas una vez.
3. [ ] Aplicar el perfil explícito de `local-privileges.sql` adaptado al destino aprobado, conservando la separación de roles. No reproducir permisos de DDL excesivos del cliente ni asumir que los defaults del proyecto nuevo son equivalentes a los remotos observados.
4. [ ] Contrastar catálogos y cuerpos originales; aplicar la corrección de `local-content-compatibility.sql` una vez sobre la misma firma. El `CREATE OR REPLACE` no debe crear otra función ni alterar su ACL.
5. [ ] Verificar **12 tablas, 86 columnas, 43 restricciones, 29 índices, 7 triggers, 10 políticas y 13 rutinas**, junto a cuatro secuencias identity y sus permisos. Comparar definiciones y estados válidos/habilitados, no solo recuentos. Las extensiones/roles de plataforma se registran aparte.
6. [ ] Comprobar RLS, permisos efectivos de tabla/columna/secuencia/rutina y que `private` no es un esquema expuesto por la Data API. El navegador nunca debe recibir permisos de servicio.
7. [ ] Registrar commit, archivos/huellas, orden, resultados y estado del instalador. No inventar entradas que afirmen que se ejecutaron las seis migraciones históricas ni «reparar» su historial para ocultar duplicados.
8. [ ] Si falla un paso, mantener cerrada la preview y registrar cuál llegó a confirmar. Los tres archivos tienen límites de transacción propios; no prometer rollback atómico entre archivos. No repetir ciegamente el primero sobre una base parcialmente instalada.

Para instalaciones existentes se mantiene otra estrategia: historial actual y futuras migraciones incrementales revisadas. No se usa este instalador sobre la beta. Antes de automatizar futuras actualizaciones de staging habrá que diseñar su registro de versiones; `db push` del repositorio actual no es ese mecanismo.

## 5. Configurar Auth y el correo en Dashboard

Los nombres de los apartados pueden cambiar. Buscar las secciones de **Authentication** indicadas y comprobar que sigue seleccionado el proyecto de staging en cada pantalla.

| Completado | Pantalla / campo | Qué debes configurar tú | Qué comprobará Codex después |
| --- | --- | --- | --- |
| [ ] | Authentication → Sign In / Providers → Email | Habilitar Email/password y el registro durante el ensayo controlado. **Confirm email activado** | Sin confirmación no se permite entrar; el enlace confirma una única cuenta y el trigger aprovisiona una sola fila profesional |
| [ ] | Authentication → URL Configuration → Site URL | URL HTTPS canónica y exclusiva de la web de staging, con su ruta real | No contiene el dominio de beta/producción; el destino por defecto cae en staging |
| [ ] | Authentication → URL Configuration → Redirect URLs | Solo rutas de staging realmente usadas por la web; ejemplos explicados abajo. No comodines amplios ni URLs de producción | Alta y recuperación vuelven a las rutas correctas; un destino ajeno no se acepta |
| [ ] | Authentication → Email / SMTP Settings | Servidor, puerto/TLS, usuario y contraseña SMTP privados; nombre de remitente «GLIAX — pruebas» y dirección de un dominio verificado | Entrega a los dos buzones QA, sin envíos a contactos reales; credenciales permanecen en Auth, no en código Edge |
| [ ] | Authentication → Email Templates | Confirmación y recuperación identificadas como pruebas. Conservar enlaces compatibles con Supabase y el cliente actual | Enlace de confirmación/recuperación llega al proyecto y web de staging; no contiene referencias a producción |
| [ ] | Authentication → Rate Limits | Registrar límites que permitan el ensayo acotado sin habilitar envíos ilimitados. Mantener las protecciones del servicio | Diferenciar un límite de Auth/SMTP de un fallo de app; no hacer bucles masivos de correos |
| [ ] | Password security / Sessions / JWT | Política mínima compatible con la UI (al menos 8 caracteres), duración de tokens/sesiones y caducidad del enlace acordadas y registradas | Probar expiración, refresh, logout y enlace vencido. No dar por demostrada revocación inmediata de todos los JWT solo por borrar un usuario |
| [ ] | Otros proveedores, anonymous sign-ins, hooks | Mantener desactivados OAuth/telefonía/anon sign-in y hooks adicionales si no forman parte del alcance | No aparecen caminos de alta no probados; ningún hook apunta a producción |

El SMTP integrado de Supabase tiene restricciones de destinatarios y frecuencia; no debe suponerse que envía a dos alias arbitrarios. Para probar buzones de QA sin convertirlos en miembros administradores del proyecto, decidir un SMTP de pruebas adecuado. Verificar dominio/remitente y registros DNS que indique ese proveedor, sin modificar dominios de producción. Evitar seguimiento/re-escritura de enlaces que pueda consumir o romper enlaces de Auth; probar también aperturas automáticas del cliente de correo.

### Rutas concretas para este frontend

`js/api.js` calcula `emailRedirectTo` con el origen y **pathname actuales**. La recuperación añade `?recuperar=1`. Si se admiten tanto `/` como `/index.html`, autorizar las cuatro variantes de la URL real de staging:

- URL de staging con `/`.
- La misma con `/?recuperar=1`.
- URL de staging con `/index.html`.
- La misma con `/index.html?recuperar=1`.

Si se publica bajo otra ruta, sustituirlas por esa ruta real y su variante de recuperación; Codex registrará los valores exactos en el manifiesto privado antes de configurar. No inventar un endpoint `/auth/callback`: el frontend actual no implementa un servidor para él. La aplicación usa la gestión de sesión del SDK y escucha `PASSWORD_RECOVERY`; adoptar PKCE u otro flujo con intercambio manual requeriría una adaptación y pruebas previas.

No activar opciones de reautenticación/cambio de contraseña que exijan campos o nonce que la UI actual no envía sin preparar antes su soporte. Decidir y registrar esa política; el acceso a nuevas opciones puede depender del plan. Para la primera ejecución, las reglas deben ser compatibles y las diferencias frente a la política deseada quedar como requisito de aceptación, no silenciarse.

## 6. Funciones Edge y runtime Deno

| Función | Necesidad y dependencias | Configuración y comprobación futura |
| --- | --- | --- |
| `request-learning-content` | Obligatoria para ejercicios/fichas/juegos del frontend. `index.ts`, 20 imports locales directos y sus bancos `data/*.js`: **21 archivos JS/TS** en el paquete revisado. Depende de Auth, perfiles, cuentas, uso e historial | Runtime Supabase Edge basado en Deno; imports npm/JSR resueltos y fijados; JWT de usuario y verificación en handler. Mantener `verify_jwt=true` y probar usuario confirmado, sesión inválida y llamada con solo clave pública |
| `stripe-webhook` | Opcional, solo si se autoriza una fase separada de pagos de prueba. Un archivo TypeScript, SDK Supabase, API externa de pagos y RPC de facturación de la baseline | `verify_jwt=false` porque los eventos externos no llevan JWT de usuario; el handler verifica firma en eventos y autentica checkout/portal. No desplegarlo en la fase sin pagos ni configurar claves reales |

`handle_new_user`, `set_updated_at`, privacidad y `request_learning_content_internal` son funciones **PostgreSQL**, no funciones Edge adicionales. No se publican con el comando de despliegue Edge. El RPC interno y el handler Edge son rutas diferentes de contenido/cuotas; probar ambas sin confundir sus almacenes de consumo.

**Codex podrá hacer tras autorización:** compilar/comprobar en Deno real los módulos completos, resolver dependencias, revisar lockfile, empaquetar desde el commit fijado y desplegar **cada función por nombre** con destino explícito permitido. Consultar primero la ayuda instalada. En CLI 3.2.0, `functions deploy` es una operación remota que por defecto usa el proyecto enlazado y sin nombre despliega todas; ambas formas por defecto quedan prohibidas por el plan. Un despliegue futuro usará el destino explícito `--remote=<REF_STAGING_VERIFICADA>`, sin `--prune` y sin copiar ejemplos que publiquen todo o eludan una confirmación.

Después deberá probar el endpoint HTTPS real de staging desde navegador y peticiones HTTP, incluyendo preflight CORS y tokens emitidos por ese mismo Auth. Las claves publicables se envían como `apikey`; el JWT de sesión va en `Authorization`. No sustituir un JWT por la clave pública ni desactivar verificación de usuario para resolver un 401. No basta con el adaptador Node de los ensayos locales.

El handler de contenido actual permite CORS amplio y no lee una variable `ALLOWED_ORIGINS`. Si se decide exigir una lista de orígenes en código, preparar ese cambio y validarlo antes; no afirmar que una casilla de Auth o un secreto inventado lo implementan. El aislamiento de datos depende de autenticación, comprobación de propiedad y permisos, no solo de CORS.

### Variables y secretos: solo nombres y destino

| Nombre/campo | Dónde se necesita | Tratamiento |
| --- | --- | --- |
| `LH_CONFIG.supabaseUrl`, `LH_CONFIG.supabaseKey` | Artefacto de navegador de staging | URL y clave publicable **del proyecto nuevo**. Son configuración de cliente, nunca una clave de servicio. No copiar las del archivo operativo actual |
| `LH_CONFIG.supportEmail` | Artefacto de preview | Contacto QA aprobado o deshabilitado; no reutilizar el contacto operativo para las pruebas |
| `LH_CONFIG.stripeMode` | Preview, solo fase de pagos | `test` si se autoriza; no es una bandera para desactivar pagos |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Runtime Edge, según el código actual | Variables de plataforma del proyecto staging, solo backend; confirmar disponibilidad y pertenencia sin mostrar valores. No sobrescribirlas con valores copiados. Si la modalidad de claves del proyecto nuevo no satisface ese código, detener y preparar un cambio revisado |
| Contraseña de PostgreSQL / archivo de conexión | Instalador/operador autorizado | Exclusiva de staging, canal privado, TLS verificado; no en argumentos, chat o repositorio |
| Token de acceso de gestión Supabase | Operador de despliegue, si usa CLI/API | Alcance mínimo, perfil exclusivo y destino permitido. No reutilizar el secreto del environment `beta`; no es una clave de navegador o de la base |
| Host/puerto/usuario/contraseña SMTP, remitente | Configuración Auth en Dashboard | Gestor privado del responsable; no son secretos que el handler de contenido lea de su entorno |
| `STRIPE_MODE`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `BILLING_APP_URL`, `STRIPE_AUTOMATIC_TAX` | Solo `stripe-webhook`, en fase adicional | Sandbox/modo de prueba y recursos exclusivamente de pruebas. `BILLING_APP_URL` debe ser la URL HTTPS de staging; firma y credenciales no se reutilizan. Decidir esa fase y revisar su configuración existente antes de crear recursos de pagos |

El código de contenido revisado no necesita claves de modelos de IA, SMTP ni otros proveedores para sus generadores locales. No añadir secretos ajenos «por si acaso». URLs, IDs, contraseñas, tokens y valores reales de configuración se mantienen en el manifiesto/gestor privados; el repositorio público solo contiene nombres y procedimientos.

## 7. Preview y prueba end-to-end con dos profesionales ficticios

**Tú:** abrir la URL de staging aprobada en dos perfiles de navegador separados y disponer de los dos buzones de QA. Los nombres y datos de alumnos serán códigos sintéticos. No cargar archivos, historiales o usuarios reales.

**Codex:** preparar/ejecutar el nuevo runner autorizado, acotar peticiones y registrar resultado esperado/observado por caso. SQL de inspección administrativa solo sobre staging; las pruebas de aislamiento usan los JWT reales A/B y llamadas anónimas, no una clave de servicio para fingir el acceso de un profesional.

| Completado | Caso | Criterio de aceptación |
| --- | --- | --- |
| [ ] | Destinos antes del primer clic | Artefacto/config/módulos/correos solo refieren a staging; el navegador no emite solicitudes al proyecto o web actuales. Registrar origen/paths sin tokens |
| [ ] | Alta y confirmación A/B | Signup produce usuario no confirmado y una única cuenta profesional por trigger. Sin confirmar no entra; correo y enlace válidos activan la cuenta sin crear otra fila |
| [ ] | Enlaces y recuperación | Confirmación, enlace reutilizado/vencido y recuperación válida/expirada tienen comportamiento controlado. La nueva contraseña funciona; la anterior deja de servir para login. No se auto-confirma por SQL para hacer pasar el ensayo de email |
| [ ] | Sesiones | Login, refresh, cierre y reapertura conservan datos propios; caducidad y logout se observan explícitamente. No registrar cookies/JWT ni guardar URLs de recuperación con tokens |
| [ ] | Cuenta y perfil | A crea/edita/lee lo propio; B no accede por UUID a cuenta, perfiles, resultados o RPC de A. Anónimo no accede. Idioma de cuenta sí se puede editar; suscripción/propiedad no |
| [ ] | Códigos únicos | Mismo código permitido entre A/B; duplicado normalizado rechazado dentro de A, también con dos creaciones simultáneas. Resultado final: una fila, no dos |
| [ ] | Resultados | `guided_wait` conserva `correct:null`; `rule_application` conserva métricas versionadas y tiempos. Progreso/CSV mantienen su significado |
| [ ] | Recuperación/idempotencia | Cortar una respuesta tras el commit, recargar/reintentar con el mismo `client_attempt_id`: un resultado; `progress.history` se reconcilia sin duplicados y sobrevive al nuevo login |
| [ ] | Contenido en Deno real | Ejercicio, ficha y juego válidos devuelven contenido mediante el endpoint Edge desplegado; propiedades, idioma, errores y persistencia coinciden con el contrato |
| [ ] | Sesión independiente | Resolver y pedir contenido, terminar/recargar: sin resultados ni historial de perfil nuevos; solo el uso agregado que corresponda al contrato |
| [ ] | RPC SQL de compatibilidad | Datos privados totalmente sintéticos permiten seleccionar y registrar contenido sin error de referencia ambigua. Firma y ACL se conservan; llamadas de clientes no adquieren privilegios de servicio |
| [ ] | Seguridad de permisos | TRUNCATE/TRIGGER innecesarios negativos para anon/authenticated; comprobar tabla/columna/secuencia y todas las firmas SECURITY DEFINER. Repetir pruebas de denegación solo sobre staging sintético y dentro de transacciones reversibles |
| [ ] | Exportación y eliminación | JSON/CSV incluyen datos de A autorizados, sin B. B/anónimo no exportan ni borran A. Borrado de perfil limpia resultados/vistos/entregas y mantiene lo ajeno y auditoría prevista; comprobar rechazo de escrituras tardías |

### Prueba de cuotas concurrentes — obligatoria para aceptar staging

1. [ ] Codex prepara un estado sintético con **dos unidades restantes** y cinco solicitudes válidas simultáneas de coste uno desde al menos dos sesiones de A. Obtiene el límite del contrato/configuración de pruebas; no cambia límites de producción.
2. [ ] Para `request-learning-content`, inspecciona `content_usage` y las escrituras de perfil/historial por cada respuesta. El número de éxitos no supera dos; el resto se rechaza por cuota. El consumo final debe coincidir con el inicial más el coste aceptado, sin incrementos perdidos ni efectos de peticiones rechazadas.
3. [ ] Repite el ensayo, en un estado nuevo, con B en paralelo: su cuota y datos son independientes. Acota las repeticiones y evita el cambio de día UTC durante el caso o calcula el día usado por cada ruta explícitamente.
4. [ ] Para el RPC SQL interno, usa límites/contenidos privados sintéticos y su propio registro de entregas. Prueba el mismo criterio con llamadas de backend autorizadas y comprueba además relación cuenta/perfil, trial y tamaño.
5. [ ] No sumar ni intercambiar `content_usage` y `content_delivery_log` como si fueran un único contador: son rutas distintas en el código. Si el producto requiere un cupo compartido entre ambas, definir ese contrato y la implementación antes de aceptarlo.
6. [ ] Si se acepta más consumo del permitido, hay contadores inconsistentes o efectos parciales, **parar aceptación de staging**. Registrar evidencia privada mínima y preparar una corrección local independiente con sus pruebas; no desactivar el ensayo ni marcarlo como aprobado por haber pasado la prueba secuencial local.

No se incluyen scripts de carga, resultados supuestos o detalles operativos de seguridad adicionales en el repositorio público. Las evidencias técnicas detalladas se revisan antes de compartirlas.

## 8. Verificaciones posteriores y aprobación del ensayo

- [ ] **Codex:** repetir inventario/ACL y comparar con el manifiesto de instalación. Cualquier diferencia de versión/plataforma debe figurar como observada y aceptada o como bloqueo.
- [ ] **Codex:** ejecutar advisors de seguridad y revisar errores de Auth, base y funciones solo de staging; no copiar logs crudos, cuerpos de correo o payloads de eventos al informe público.
- [ ] **Codex:** revisar que no se expusieron esquemas privados ni se crearon buckets, miembros Realtime, jobs Cron o endpoints extra por herencia de una plantilla. La publicación Realtime puede existir sin miembros de aplicación; no usar esos servicios en las pruebas sin un objetivo adicional ni borrar sus esquemas gestionados.
- [ ] **Codex:** verificar que el frontend descargado contiene el commit/config correctos y no un archivo en caché de beta. Revisar posibles librerías externas/CDN y separar recursos estáticos públicos de conexiones a servicios de producción.
- [ ] **Tú:** confirmar que los correos y la interfaz se identifican como pruebas, que solo participan los buzones QA y que los enlaces nunca llevan a producción.
- [ ] **Tú:** revisar resultados exactos, consumos y pendientes. Un resultado local previo o un despliegue que terminó sin error no sustituye a las pruebas de esta lista.
- [ ] **Ambos:** firmar un resumen privado de aceptación con casos pasados/fallidos/no ejecutados y responsables. Staging validado no autoriza promoción de beta, despliegue de producción o fusión de PR.

## 9. Limpieza y reversión

**Si falla instalación o validación:** cerrar primero el acceso de QA a la preview y detener el runner/despliegues. Mantener el destino identificado; no redirigir la preview a producción como «vuelta atrás».

| Situación | Actuación futura autorizada |
| --- | --- |
| Instalación parcial en proyecto nuevo sin datos útiles | Mantener acceso cerrado. Inventariar lo que confirmó cada transacción. Proponer recrear únicamente el proyecto de staging o restablecer una base vacía por un procedimiento revisado; no borrar schemas/roles gestionados a mano ni repetir SQL sobre un estado desconocido |
| Fallo de una función o de la preview con versión previa buena en staging | Volver al artefacto previamente verificado del **mismo staging**, con hashes y compatibilidad de esquema comprobados. Nunca importar un bundle/backup del proyecto actual |
| Cambio de esquema sin reversión probada | Mantener cerrado; preferir recreación del entorno sintético con el paquete aprobado. Una reversión de código no deshace filas, correo enviado o cambios SQL |
| Fallo de seguridad | Suspender pruebas y, si la respuesta al incidente lo requiere, revocar solo credenciales de staging. Conservar evidencia mínima privada; no rotar claves de producción como parte de esta tarea |
| Fin del ensayo | Borrar perfiles/cuentas y sus datos sintéticos mediante procedimientos aprobados; revisar cascadas, contenido de pruebas, uso agregado, auditoría, descargas, buzones y retención. No confundir borrar perfiles con borrar también cuentas Auth o archivos exportados |
| Retirada completa | Responsable confirma ID de staging y autoriza su eliminación o pausado según la política/coste verificados. Retirar preview, secretos de CI, endpoints opcionales de prueba y recursos de correo asociados. Registrar qué retención de logs/copias persiste |

La eliminación de un proyecto requiere una decisión explícita del responsable sobre ese ID y los recursos asociados. No hay comandos destructivos remotos listos para copiar en este documento. Verificar aislamiento mediante manifiestos/destinos y resultados de staging, sin conectarse a producción para «comprobar que no cambió».

## 10. Resultado de esta entrega documental

- Rama y commit iniciales comprobados; código, baseline y seis migraciones no se modifican.
- Revisados Auth/URLs del frontend, fuentes y dependencias Edge, guardas de baseline, scripts/workflows existentes y documentación oficial de Supabase/ayuda CLI 3.2.0. Se identifican explícitamente los artefactos que deben adaptarse antes de staging.
- Solo se consultaron archivos locales y documentación pública; no se creó/enlazó/consultó proyecto Supabase remoto, no se ejecutó SQL remoto y no se desplegó nada.
- Las casillas remotas quedan **pendientes**. No se presentan nuevas pruebas de staging como realizadas ni se solicitan valores de secretos.
- Se guarda únicamente documentación pública sin IDs/URLs operativas, claves, credenciales, dumps ni registros personales. Antes de un push deben revisarse las integraciones de preview que puedan publicar automáticamente; una entrega documental local no autoriza activar esas integraciones.

## Referencias verificadas

- [Baseline e instrucciones locales](../../supabase/baselines/README.md) y [resultados locales](gliax-functional-baseline-validation-20261117.md).
- Código revisado: `js/config.js`, `js/api.js`, `js/auth-account.js`, ambas funciones Edge, `supabase/config.toml`, scripts y workflows mencionados. No se ejecutaron sus modos remotos.
- [Supabase: redirecciones de Auth](https://supabase.com/docs/guides/auth/redirect-urls), [contraseñas](https://supabase.com/docs/guides/auth/passwords), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
- [Supabase: cabeceras y JWT en Edge](https://supabase.com/docs/guides/functions/auth-headers), [dependencias Deno](https://supabase.com/docs/guides/functions/dependencies), [CLI v3](https://supabase.com/changelog/supabase-cli-v3) y [tarifas oficiales](https://supabase.com/pricing).

Fuentes consultadas el 17/11/2026. Las rutas de Dashboard, las capacidades y la ayuda de comandos se deben confirmar de nuevo antes de la futura ejecución; no copiar ejemplos genéricos que enlacen o publiquen sobre un proyecto implícito.

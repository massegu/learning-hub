# GLIAX — preparación técnica local de staging

Fecha: 18/11/2026. Rama: `integration/gliax-pr50-pr51-20261117`. Punto de partida conservado: `d8a29ef7940906226cefad101621aa4ac277675b`. Entrega exclusivamente local, sin push. El [checklist revisado](gliax-staging-checklist-20261117.md) conserva íntegramente sus 68 comprobaciones.

## Resultado y límite de la entrega

Se implementan un preparador/instalador restringido a PostgreSQL local aislado, el núcleo del runner con diez escenarios y sus cuatro fases, y un generador de artefacto web independiente sin pagos. Las guardas y el artefacto se han probado localmente.

**La ejecución remota del instalador y los adaptadores remotos del runner no están implementados.** Por tanto, esta entrega es parcial respecto a disponer de un runner listo para operar contra staging: permite preparar y verificar sus entradas, escenarios y registros, pero no ejecutar todavía Auth, correo, Edge Deno ni limpieza remotos. No se declara staging validado ni listo para desplegar. Habilitar esas capacidades requiere otra implementación revisada, configuración privada del destino y autorización posterior. No existe una opción que eluda esta limitación.

El procedimiento detallado y el contrato del manifiesto están en [tools/staging/README.md](../../tools/staging/README.md). No se piden secretos ni se incorporan valores operativos en esta documentación.

## Componentes

| Archivos nuevos | Comportamiento comprobado |
| --- | --- |
| `tools/staging/common.py`, `__init__.py` | Manifiesto privado obligatorio, permisos de archivo, validación ID/URL/host, exclusión operativa, hashes y directorios fuera de Git. |
| `tools/staging/installer.py` | Paquete ligado al manifiesto y al código; rechazo de alteraciones; ejecución exclusivamente por Docker local sin red, identidad inmutable y prueba de conexión antes del SQL. |
| `tools/staging/scenarios.py`, `runner.py` | Preparación, ejecución, validación y limpieza separadas; diez escenarios; presupuesto acotado; estados sin inventar evidencia; rechazo de informes que aleguen éxitos remotos. |
| `tools/staging/frontend.py`, `browser_guard.js` | Configuración transformada solo en copia, SDK local fijado, módulos conservados, bloqueo de pagos, CSP, señalización STAGING y examen de destinos operativos. |
| `tests/test_staging_tools.py` | Contratos negativos, cuotas acotadas, integridad, registros y navegador Chromium con solicitudes interceptadas. |
| `tests/local-staging-installer-smoke.py` | Instalación real en PostgreSQL desechable sin red; arnés SQL Auth explícitamente sintético. |

No se modifica código operativo de beta, los workflows, Cloudflare, las seis migraciones, los tres SQL originales, ni el runner histórico. El paquete contiene en orden la baseline funcional, los permisos seguros y la corrección SQL de compatibilidad. Se adapta únicamente una guarda de destino por SQL, sin duplicar migraciones. No se reproducen los permisos excesivos de clientes; se mantiene el estado seguro de la baseline.

## Entorno y pruebas ejecutadas

Entorno local: Python **3.12.14**, Node **24.19.0**, Docker **28.4.0**, PostgreSQL **17.12** de la imagen local `postgres:17-alpine`, Chromium **151.0.7922.173** y SDK UMD Supabase JS **2.119.0** ya instalado localmente. No se inicia una nueva instancia completa de Supabase ni se usa su CLI para conectar un proyecto. Docker usa red `none`, datos efímeros y ningún puerto publicado. No se descargan imágenes ni dependencias durante estas comprobaciones.

| Prueba | Resultado final | Alcance real |
| --- | --- | --- |
| `python3 -m unittest discover -s tests -p 'test_*.py' -v` | **32/32 PASSED**, 0 fallos, 0 omitidas | 23 nuevas y 9 existentes; incluye Chromium. |
| `python3 tests/local-staging-installer-smoke.py` | **12/12 PASSED** | Tres SQL aplicados en PostgreSQL real, sin migraciones históricas. |
| `npm test` con caché local explícita | **270/270 PASSED**, 0 fallos, 0 omitidas | Regresión existente; duración registrada 106161,006841 ms. |
| Construcción persistente del artefacto sintético | **PASSED**, 353 archivos examinados antes del recibo | SDK local, hashes y ausencia de marcadores operativos conocidos. |
| Fases E2E con manifiesto sintético | Preparación **PASSED**, registro validado **PASSED**, limpieza transitoria local **PASSED** | Casos reales: **0 PASSED / 0 FAILED / 10 NOT RUN**. |
| Baseline funcional 88 y regresión histórica 51 | **No repetidas en este encargo** | Se conservan los originales y la evidencia previa 88/88 y 51/51; no sumar el arnés SQL como una nueva ejecución de esas suites. |

Las 12 comprobaciones SQL comprenden: rechazo de cambio de manifiesto sin escribir, esquema vacío antes de instalar, ocho verificaciones de catálogo/permisos, aprovisionamiento sintético por trigger y rechazo de reaplicación. Las ocho verificaciones confirman **12 tablas, 29 índices, 43 restricciones, 13 funciones públicas, 10 políticas, 4 secuencias**, comprobación de permisos cliente y `exercise_results.correct` nullable. El catálogo concuerda con los recuentos funcionales ya documentados; no se ha realizado un nuevo contraste completo de las 86 columnas, las definiciones de todos los objetos ni metadatos gestionados.

Hubo un fallo intermedio al repetir el arnés: `pg_isready` aceptaba el servidor temporal de inicialización. Se corrigió esperando el listener loopback del servidor final dentro del contenedor, sin publicar puertos; la repetición final pasó. Esto es una corrección del arnés nuevo, no de las definiciones SQL. Las iteraciones iniciales de los contratos también detectaron HTML con `<head>` omitido y una expectativa demasiado restrictiva del navegador: el generador ahora cubre esos HTML y el test distingue explícitamente las respuestas API simuladas de cualquier evidencia remota.

Las pruebas negativas rechazan campos ausentes, ID operativo, ID/host/API discrepantes, permisos inseguros de archivo, enlaces, cambios de SQL o manifiesto, sobrescritura, contexto Docker heredado, red/puertos incorrectos, etiquetas falsas, reemplazo de contenedor y conexión a una DB distinta antes de escribir. El navegador carga los módulos reales del artefacto, verifica el aviso STAGING y comprueba rechazos de checkout, portal, invocación directa de pagos, fetch externo y beacon. Todas sus solicitudes se satisfacen o abortan mediante interceptación local; no verifica Auth ni RLS reales.

## Escenarios reales pendientes

Los diez escenarios son: confirmación de correo, recuperación, ciclo de sesión, perfiles/RLS, resultados/recuperación, contenido Edge Deno, cuotas concurrentes, compatibilidad SQL, permisos efectivos y exportación/borrado. Cada uno aparece como `NOT RUN` por capacidad remota no disponible. El código de cuotas prueba localmente la detección de exceso, incrementos perdidos y efectos de solicitudes rechazadas; **la carrera real contra PostgreSQL/Edge todavía no está probada por este runner**.

La preparación de datos prevé dos profesionales ficticios A/B, códigos compartidos entre cuentas y únicos dentro de cada una, métricas versionadas no evaluativas, intentos idempotentes y sesiones independientes. Los futuros drivers de navegador deben comprobar también outbox, recuperación, CSV y coherencia entre resultados y `progress.history`. Los administrativos deben controlar fixtures sintéticos, permisos SECURITY DEFINER, corrección SQL, cuotas y cascadas, limitándose a recursos del run. No existe todavía una implementación que satisfaga esas interfaces contra servicios reales.

## Artefactos privados y revisión pública

Se deja una salida de revisión local en la carpeta hermana `work/gliax-staging-prep-review-20261118/`: manifiesto **sintético** privado, `package/`, `web/` y `e2e/`. Los identificadores y buzones de ensayo no representan un proyecto existente. Esa carpeta no se añade a Git ni es un destino publicado. Los logs completos de validación también quedan fuera del repositorio. El recibo del artefacto permite revisar sus hashes; no contiene credenciales administrativas.

La revisión de publicación se limita a los archivos nuevos y a esta ampliación documental: no se copian dumps, registros reales, manifiestos privados, tokens, contraseñas, claves administrativas ni valores operativos. Las pruebas obtienen la lista prohibida directamente del checkout sin imprimirla. Los únicos valores de destino literales nuevos en los tests son sintéticos. Este informe no añade hallazgos de seguridad del servicio remoto: describe únicamente guardas y límites locales.

## Riesgos y decisiones pendientes

1. **Runner/instalador remoto incompletos:** antes de conectar habrá que implementar y revisar transportes con verificación remota de identidad, TLS, rechazo de redirecciones, timeouts, límite de respuestas, credenciales separadas, inventario de recursos y limpieza incluso tras fallos. Las etiquetas Docker no sustituyen esa verificación.
2. **Identidad opaca:** offline no se puede demostrar que la clave publicable pertenezca al ID declarado, ni que la lista de orígenes operativos sea completa. No hay consulta DNS o remota implícita.
3. **Web:** requiere origen HTTPS separado con raíz `/`; no se admiten pooler ni dominio API personalizado en este preparador. Será necesario probar cabeceras CSP reales, redirecciones y compatibilidad de navegador. ExcelJS conserva una dependencia estática opcional de jsDelivr. Las guardas no constituyen un sandbox contra código malicioso.
4. **Deno:** faltan el manifiesto/lock reproducible de dependencias y la validación del runtime real, aparte de los drivers del runner. No se despliegan Edge Functions ni se presenta el adaptador Node histórico como Deno.
5. **Correo y costes:** remitente/SMTP, destinatarios permitidos, redirecciones, recuperación y políticas de sesión requieren decisiones y configuración futura. No se han elegido proveedores ni estimado precios. Se mantiene la fase sin facturación.
6. **Publicación automática:** falta confirmar si Cloudflare genera previews por rama. Hasta aclararlo, esta entrega permanece local y no se hace push.

## Información futura del responsable

Sin enviar ahora valores secretos: organización/propietario, región, presupuesto y límites aprobados; nombre e identidad del nuevo proyecto cuando su creación se autorice; origen HTTPS exclusivo y hosting; lista completa de orígenes de producción prohibidos; dos buzones QA y método de acceso automatizado al correo; remitente/proveedor SMTP elegido; políticas de confirmación/recuperación/sesión, controles de acceso y fecha de retirada. También habrá que decidir cómo entregar credenciales exclusivas mediante un canal privado y confirmar el comportamiento de previews de Cloudflare.

Una autorización futura debe distinguir creación del proyecto, configuración de servicios, conexión e instalación, despliegue Edge/web y ejecución/limpieza E2E. Esta entrega no ejecuta ninguna de esas acciones. **No hubo conexión a Supabase remoto, lectura de datos reales, despliegue, push, fusión ni modificación de producción.**

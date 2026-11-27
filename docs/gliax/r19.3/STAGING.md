# Preparación de integración de GLIAX R19.3

## Destinos y esquema

La rama de partida se verificó en `e09c9e691374cb40dd8548b1d884c0f8eca7cef6`. Los destinos autorizados son Supabase `wejcfaralctolzxjbcil` y Pages `gliax-staging`, con origen `https://gliax-staging.pages.dev`. La lectura administrativa del 27/11/2026 confirmó Edge v6 activa con JWT obligatorio y Pages canónico `5992b25a-8fd2-44b5-9c26-8ea2920e2169`, rama canónica configurada `revision/gliax-refinamiento-qa`, publicaciones automáticas desactivadas y previews en `none`.

El preflight administrativo de solo lectura, confirmado por la propietaria antes de la publicación, verificó `exercise_results` con `detail TEXT` y `correct BOOLEAN` anulables, clave única `(profile_id, client_attempt_id)` y columnas de sesión. RLS está habilitado en resultados y perfiles. SELECT e INSERT de resultados exigen propiedad del perfil y `anon` carece de ambas concesiones. `manage_learner_privacy` está disponible para `authenticated` y vedada a `anon`. Se reutiliza el esquema actual sin migraciones. [Consulta de diagnóstico](../../../supabase/diagnostics/r193-longitudinal-preflight.sql)

## Interruptor y aceptación

El ZIP Pages se entrega con `/r193-longitudinal.json` en `{"enabled":false}`. El cliente alojado comprueba el estado con una petición al mismo origen sin caché antes de seleccionar y antes de enviar o reintentar una observación. Un error, un tiempo de espera o una respuesta inválida desactivan la operación siguiente. Las solicitudes ya enviadas pueden confirmarse y se conservan. El control profesional por perfil modifica la adaptación y conserva las observaciones confirmadas. La habilitación global debe hacerse en una segunda publicación aprobada, promoviendo un paquete que contenga el fichero activado. Para apagarla, volver a promover el paquete con el valor falso. El cambio entra en vigor para el cliente en la siguiente operación tras propagarse el despliegue canónico. El permiso de registro no depende del valor declarado por un cliente como control de seguridad. Auth y RLS conservan esa responsabilidad.

Con el interruptor apagado, comprobar el par publicado, rutas anteriores, 500 casos editoriales, ocho casos digitales, modo estático e interactivo y Matemáticas v2. Para la aceptación longitudinal, cotejar primero el catálogo, preparar dos cuentas autorizadas con perfiles exclusivamente ficticios y fijar la misma edad y nivel. Activar globalmente con aprobación posterior. Generar historiales contrastantes, cerrar sesión, recuperar cada perfil desde un segundo navegador y verificar el nivel fijado, la abstención, la diferencia de recomendaciones, la idempotencia, el aislamiento, la exportación y la supresión sobre perfiles desechables autorizados. Volver a apagar el interruptor al cierre del QA.

## Orden de publicación y retorno

1. Tras autorización posterior, revalidar los SHA-256, el origen, los permisos y los puntos de retorno. Mantener la adaptación global apagada.
2. Publicar solo `request-learning-content` en el proyecto de Supabase indicado, con el manifiesto del ZIP y `verify_jwt=true`. Registrar la versión asignada. Comprobar estado ACTIVE, JWT obligatorio y rechazo de JWT ausente o inválido antes de avanzar. Matemáticas v2 y los recorridos autenticados quedan para el QA manual posterior.
3. Publicar el directorio extraído del ZIP Pages por carga directa a `gliax-staging`, con la rama canónica configurada. Verificar despliegue, CSP, rutas, pagos apagados e interruptor apagado. Separar la autorización para cualquier activación longitudinal.
4. Ante una incidencia con el interruptor apagado, restaurar Pages al despliegue `5992b25a-8fd2-44b5-9c26-8ea2920e2169` si Pages cambió. Restaurar Edge mediante Management API con el ESZIP v6 verificado, `Content-Type: application/vnd.denoland.eszip` y JWT obligatorio. Confirmar que el dominio sirve R19.2 y que Edge recupera su huella y el contrato anterior. El contador de versión puede avanzar al restaurar.
5. Si ya se habilitó el piloto y existen observaciones R19.3 confirmadas, apagar primero el interruptor. R19.2 fusiona todas las filas en su historial histórico. Para conservar esas observaciones sin mezclarlas con el historial clásico, mantener el frontend R19.3 apagado o preparar un candidato R19.2 compatible con el filtro antes de activarlo como retorno. Restaurar Edge v6 solo junto a un frontend compatible. La reversión de la adaptación utiliza el interruptor y conserva las filas confirmadas.

## Reproducción de artefactos

Con Node y las dependencias bloqueadas del repositorio, utilizar `python tools/staging/package_r193.py <directorio-de-entrega>` desde el commit de código indicado en el manifiesto. Proporcionar `GLIAX_STAGING_REF`, `GLIAX_STAGING_ORIGIN` y la clave publicable de Staging `GLIAX_STAGING_PUBLISHABLE_KEY` por el entorno. El empaquetador vuelve a generar Pages, valida la configuración y emite ZIP, inventarios y SHA-256. El código editorial reside en Pages. Edge contiene el servidor de generación, los casos digitales y sus validadores.

## Evidencia del candidato

[Manifiesto de artefactos](STAGING-ARTEFACTOS.json) y [huellas por archivo](manifiestos-staging/). El SHA de código en el manifiesto fija la compilación. Pages incluye 389 archivos. Edge incluye 28 módulos y los metadatos de despliegue. Ambos pasaron la verificación después de empaquetar. El ESZIP de retorno v6 descargado por la API de gestión coincide byte por byte con la exportación efectuada al publicar R19.2.

La configuración publicable proviene del ZIP R19.2 verificado por SHA-256. La configuración servida por el dominio canónico de R19.3 coincide byte por byte con el ZIP aprobado. El flujo de Auth alojado queda para el QA manual.

Pasaron 41 pruebas focalizadas de Node y PostgreSQL. Chromium verificó persistencia con servicio simulado compartido por dos clientes, reconciliación de resultados, simulaciones digitales en escritorio y móvil y los archivos extraídos del ZIP Pages. El recorrido del ZIP sirvió sus cabeceras, cargó las bibliotecas reales, probó Matemáticas v2 con Edge local, mantuvo la adaptación apagada y comprobó las exportaciones DOCX, ZIP, CSV y XLSX. El recorrido alojado con Auth y RLS reales queda pendiente.

## Publicación autorizada del 27/11/2026

Se publicaron los ZIP aprobados sin migraciones ni cambios en datos. Edge `request-learning-content` v7 quedó ACTIVE con `verify_jwt=true`, huella `09d1af300448c0dbe32178d38b2d06321c2d6804bbea2aec409997bdb06ce2cf` y 28 módulos compilados. Las peticiones sin JWT y con JWT inválido devolvieron HTTP 401.

Pages canónico `8ceea421-e177-4a77-8b15-3df01e61dff0` sirve siete archivos de referencia con SHA-256 idéntico al ZIP. Se verificaron la CSP, el destino Supabase de Staging, pagos apagados y la adaptación global apagada mediante `/r193-longitudinal.json` con `Cache-Control: no-store`. Las publicaciones automáticas siguen desactivadas y las previews en `none`. Se conservaron los puntos de retorno de R19.2 descritos arriba. Quedan pendientes el QA funcional autenticado y la activación longitudinal.

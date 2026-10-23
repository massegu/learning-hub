# Privacidad: implementación y activación pendiente

23 de octubre de 2026. Esta entrega es una capa técnica y documentación para revisión; no certifica el cumplimiento del RGPD ni acredita validación clínica. No se ha aplicado SQL ni se han cambiado ajustes de Auth o servicios remotos.

## Inventario encontrado en el código

| Tratamiento | Datos y ubicación | Decisión técnica |
|---|---|---|
| Cuenta profesional | Correo y autenticación en Supabase Auth; suscripción, país lingüístico y referencias de Stripe en accounts | Separado de perfiles; no se modifica facturación ni su conservación legal |
| Seguimiento individual | UUID, account_id, código, tramo de ejercicios, idioma y progress en learner_profiles | Código sugerido aleatorio, aviso de no incluir nombres, nacimiento o diagnósticos; cada perfil conserva su historial |
| Rendimiento | Hasta 5000 entradas del historial de progress, sesiones recientes y filas de exercise_results | Exportación conjunta y borrado transaccional. El volumen limitado no sustituye a un plazo de conservación |
| Ejercicios entregados | content_seen vinculado al perfil | Incluido en exportación y borrado; sin escrituras por perfil en sesión independiente |
| Observaciones | Movimientos declarados y descripciones libres de objetos dentro de progress | Se conservan métricas/observaciones estructuradas; se dejan de guardar descripciones libres y la migración elimina las antiguas |
| Sesión independiente | Estado en memoria de la página y solicitudes de contenido autenticadas | Copia de configuración sin historial anterior, resultados no enviados a saveProgress ni saveResult; no se escriben content_seen ni progress en el servidor. Se mantiene content_usage agregado por cuenta y fecha |
| Navegador | Token de Auth administrado por SDK, último UUID de perfil y área en localStorage; estado temporal en memoria | El estado independiente no se guarda en localStorage; recargar/terminar lo descarta. El código no convierte una sesión autenticada en anónima |
| Auditoría nueva | Cuenta, UUID del perfil, acción y hora | Sin alias, textos de respuestas o notas. Registro de apertura, exportación, ajustes y borrado. Purga de auditoría a 30 días requiere programar la tarea |
| Descargas | CSV/Excel/Word actuales y nuevo JSON por perfil | Bajo control del profesional al descargarse; borrar en la plataforma no borra archivos externos |

Las direcciones IP, registros de infraestructura, copias y retención de proveedores deben comprobarse en sus paneles/contratos. No se ha inspeccionado ningún registro personal de producción. La consulta remota del esquema mediante Management API recibió HTTP 403; las pruebas SQL usan un esquema local representativo, no una copia verificada del remoto.

## Cambios revisables

- El frontend ofrece seguimiento individual o sesión independiente con aviso visible. El perfil real se conserva sin mezclar puntuaciones ni niveles. Las solicitudes independientes necesitan client_revision 6; la función sigue aceptando las revisiones anteriores para las modalidades existentes.
- Las descripciones de objetos se usan durante la actividad, pero se excluyen del historial persistido. El cliente minimiza observaciones al leer/escribir y la base aplica la misma restricción en un trigger, también para clientes antiguos.
- La base valida propiedad con auth.uid() y RLS. Los RPC de privacidad no aceptan un identificador de cuenta arbitrario. Un profesional no puede exportar, modificar o borrar perfiles ajenos.
- El borrado elimina exercise_results y content_seen antes de borrar el perfil. Las claves foráneas impiden escrituras tardías después del borrado. Otros hijos con FK restrictiva harán fallar toda la transacción hasta revisar el esquema; no se oculta ese error.
- La fecha de revisión es un recordatorio voluntario. NO es un plazo legal ni un borrado automático. No se ha elegido unilateralmente una duración para el seguimiento de menores.
- La auditoría de aperturas registra los accesos de esta aplicación de forma de mejor esfuerzo; no sustituye a logs de Auth, registros del proveedor ni registra todas las consultas SQL directas. La auditoría de operaciones RPC y del borrado es transaccional.

## Orden de activación

1. Revisar el inventario, la finalidad, la conservación y los documentos de esta carpeta con asesoramiento especializado. Completar identidad de la entidad y acuerdos con profesionales/proveedores. No habilitar nuevas recogidas de datos clínicos mediante texto libre.
2. En Supabase SQL Editor ejecutar `supabase/diagnostics/privacy-preflight.sql` (solo lectura). Confirmar tipos de identificadores, todas las relaciones hijas, RLS, permisos y campos frente al esquema. Revisar cualquier política administrativa especial antes de reemplazar las políticas de estas tres tablas.
3. Preparar una copia de seguridad y comprobar cómo se restaura y cuándo rota en el plan real. La exportación profesional es una copia adicional con su propia responsabilidad de custodia.
4. Revisar y ejecutar una única vez `supabase/migrations/202610230001_learner_privacy.sql`. Es una transacción. **Elimina descripciones libres antiguas de progress y sustituye políticas de las tablas de perfiles/resultados/contenido visto.** No aplicar a ciegas si el diagnóstico revela tablas adicionales o incompatibilidades. Las claves foráneas nuevas rechazan huérfanos existentes: deben resolverse antes, sin borrar datos no revisados.
5. En una cuenta de prueba, comprobar crear, abrir, exportar y borrar un perfil y que otra cuenta no pueda acceder por UUID. Comprobar que la exportación incluye ambos almacenes de resultados y que el borrado afecta también a content_seen.
6. Programar `select public.purge_expired_privacy_audit();` diariamente desde Supabase Cron o un proceso de mantenimiento autorizado; registrar quién mantiene la tarea. Esta función solo es accesible por service_role/administración. No introducir claves de servicio en el navegador. Sin esta tarea la auditoría no se purga automáticamente.
7. Fusionar/publicar la función de contenido y la web mediante el flujo beta habitual. Las funciones RPC deben existir antes de activar las nuevas herramientas de privacidad. Mantener Stripe en su modo actual.
8. Probar una sesión independiente: resolver, terminar y comprobar que el seguimiento anterior no cambia; revisar que solo aumenta el uso por cuenta. Probar también recarga, cambio de perfil y cierre de sesión. Los proveedores pueden conservar registros técnicos de las solicitudes según su configuración.
9. Completar la revisión jurídica y la información pública antes de una apertura comercial que dependa de estas garantías. No anunciar que los alias excluyen el RGPD ni que todos los resultados son anónimos.

## Decisiones pendientes de la entidad/profesionales

Finalidad educativa o asistencial; base de legitimación y, si procede, excepción para datos de salud; representación de menores según el caso; duración del seguimiento y borrado tras inactividad; acceso del equipo del centro; necesidad de EIPD; regiones y subencargados; transferencias; procedimiento de ejercicio de derechos, incidentes y baja de cuenta profesional. La fecha de revisión y los botones no sustituyen estas decisiones.

## Validación de esta entrega

- `npm test`: 188 pruebas aprobadas; incluye PostgreSQL local (PGlite) con dos cuentas, UUID ajeno, exportación, borrado atómico, rollback ante hijos desconocidos y rechazo de escrituras tardías.
- `python3 -m unittest discover -s tests -p 'test_*.py'`: 9 pruebas aprobadas.
- Los 11 recorridos de navegador del workflow han pasado; el nuevo `browser-privacy.py` comprueba resultados temporales, recarga, restauración del progreso, exportación JSON real, errores recuperables y borrado concurrente con cambio de perfil. Auth y almacenamiento están simulados en estas pruebas de interfaz.
- Compilación de la función de contenido comprobada sin publicar; la versión remota permanece en 61. El diagnóstico de esquema se validó localmente y devuelve un único JSON de metadatos y recuentos.
- Estas comprobaciones no sustituyen la validación de RLS con dos cuentas en el Supabase real después de revisar/aplicar la migración.

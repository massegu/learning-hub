# GLIAX · Revisión local de la cuota, el español y las pantallas ficticias

## 13 · Bloqueo diario

El contrato observado en el código de A–H usa `content_usage` con clave primaria `(user_id, usage_date, kind)`. El cálculo de fecha usa UTC. `user_id` identifica la cuenta autenticada y `kind` distingue `exercise`, `worksheet` y `game`. La función nunca suma por área, perfil, familia o idioma.

| Contador | Cuándo cambia | Qué se reutiliza |
| --- | --- | --- |
| Ejercicios | Al preparar y registrar un lote válido. En el flujo normal, cada nueva actividad solicita un elemento y añade una entrega. | Los bancos editoriales y el historial de firmas permiten seleccionar y rotar. Las actividades parametrizadas se componen en Edge. No hay en este recorrido un proveedor de IA ni un cobro externo por pregunta generada. |
| Fichas | La selección rápida y una exportación individual cuentan como una solicitud de ficha. Ficha a la carta cuenta una por versión entregada. | El inventario de papel se reutiliza en la instancia Edge según edad, nivel y variante. Catálogo y capacidad se consultan sin registrar entregas. |
| Juegos | Una entrega de ronda por solicitud válida. | El banco y las reglas de juego son locales al paquete. |
| Actividades realizadas | Al guardar un resultado según la mecánica. Las sesiones independientes no guardan el resultado en el perfil. | Es una métrica de progreso distinta de la entrega. |

En el código publicado, cuenta de prueba tiene 30 entregas de ejercicio, 2 fichas y 30 juegos al día. Los estados activo y de cortesía tienen 500, 50 y 500. Estados de suscripción distintos conservan sus límites; una prueba vencida sigue siendo un error de derechos, no de cuota. El SQL histórico contiene otro contrato, basado en `private.plan_limits` y `private.content_delivery_log`. Este endpoint no llama a ese RPC y el navegador no tiene un tercer contador de entregas. Una cuenta puede agotar su límite al probar áreas, perfiles o variantes distintos. Abrir modalidades y volver a pedir tras recargar puede consumir contenido sin llegar a completar la actividad, de modo que ocho resultados de Atención son compatibles con treinta entregas por cuenta. El número del banco expresa diversidad de contenido, no saldo.

La incidencia entre Atención y Comunicación se reprodujo con una cuenta sintética en 29/30. El estado de la cuenta de la usuaria y su fila concreta de Staging quedan sin comprobar. No se consultaron datos remotos.

La respuesta distingue cuota real, escritura concurrente, falta de contenido válido, fallo del contador, prueba vencida y cambio de variante. La interfaz muestra la categoría, el saldo y el reinicio local cuando están disponibles. La cuota real no ofrece un botón de reintento inmediato. El cliente reutiliza una solicitud idéntica aún en curso, sin guardar las actividades del perfil en una caché persistente. La validación precede a la contabilidad y la reserva se hace antes de registrar la entrega en el perfil. La actualización condicional y la clave primaria limitan carreras. Una respuesta registrada que se pierde en tránsito todavía puede contar como entrega; resolver la idempotencia entre recargas requeriría un identificador persistente y una política de retención revisada.

### Cuenta ficticia QA

La rama añade una opción desactivada por defecto. La ampliación requiere simultáneamente el host exacto de Supabase Staging y que el UUID de la cuenta autenticada esté en la variable privada de Edge `GLIAX_STAGING_QA_USER_IDS`. Solo admite cuentas activas, de cortesía o de prueba vigente. Los topes son 1.200 ejercicios, 180 fichas y 300 juegos por cuenta y día. Se mantienen los límites por solicitud, el aislamiento por perfil, el vencimiento y el límite de preguntas de una ficha de prueba. La variante no crea otro contador, evitando un multiplicador de uso.

Para una autorización futura, suministrar únicamente UUID de cuentas ficticias por el canal de secretos de Staging. Verificar el comportamiento de una cuenta autorizada y una estándar y retirar la lista cuando termine QA. No hace falta migración ni edición de planes. Desplegar Edge antes del frontend porque las solicitudes interactivas nuevas usan revisión 17. No habilitar la opción en un proyecto distinto.

## 15 · Variante regional

En prácticas, el frontend envía la preferencia efectiva y Edge utiliza como fuente autorizada la preferencia persistida en la cuenta, con el perfil como alternativa. La revisión 17 detecta una petición obsoleta antes de gastar una entrega. En Ficha a la carta la variante del documento se indica en el plan y puede diferir de la del perfil. El catálogo usa esa misma variante. La localización preserva opciones, solución, estímulo y etiquetas de Word. Los términos comunes pueden coincidir entre variantes.

La matriz `GLIAX_REVIEW_MATRIX=/ruta/matriz.csv node --test tests/gliax-staging-review.test.js` combina ocho variantes, cinco edades, tres niveles y siete familias visuales. Cada caso comprueba la validación del estímulo y la solución. La prueba de backend cambia la preferencia persistida a las ocho variantes en la misma cuenta QA con la cuota estándar agotada. La suite de Word genera ficha y solucionario de una situación comparable en las ocho variantes. Las suites existentes conservan el contraste de lectura, vocabulario, documentos y selector de fichas.

La matriz es comprobación automática. La naturalidad regional, las formas de tratamiento, el registro adolescente y los formatos propios de documentos requieren revisión humana. La rama no amplía el catálogo oficial de documentos de cada país.

## 14 · Simulaciones

El banco anterior contiene comunicación textual en todas las edades. Desde 8–10 añade tablas con un estilo visual común para mensajería, muro, vídeo, buscador, edición y juego. En 6–7 el material previo utiliza notas textuales. Se conservan esas familias y su acceso.

Comunicación funcional incorpora **Simulaciones digitales** con selector de siete tipos: conversaciones, publicaciones y comentarios, clips verticales, historias, búsquedas, notificaciones y privacidad, y agenda de equipo. El contenido necesario para la respuesta figura en los mensajes, fuentes, estados o permisos de cada pantalla. Los clips simulan fotogramas mediante subtítulos estáticos y una sección desplegable; las historias muestran el estado de vigencia sin temporizar al usuario. Las capturas se renderizan en HTML/CSS y no reproducen cuentas, marcas ni interfaces exactas. Las pantallas estáticas también pueden aparecer en las tipologías de Ficha a la carta correspondientes.

Hay 105 casos canónicos en las cinco franjas y tres niveles. Cada familia progresa de localizar o confirmar un dato a coordinar fuentes, actualizar una instrucción o aplicar restricciones. El contexto pasa de aula y materiales inmediatos a fotografía o voluntariado. La prueba Chromium recorre las siete pantallas a escritorio y móvil, y comprueba teclado, respuesta y mensajes de error sin servicios externos.

## Alcance

Se conserva la base A–H y se ejecutan sus regresiones locales. El texto disponible de este encargo enumera los puntos 13–15. La lista separada de diez correcciones mencionada no está incorporada a esta revisión y queda por conciliar con su especificación. No se ha publicado, aplicado una migración ni alterado servicios remotos.

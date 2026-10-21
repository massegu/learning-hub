# Revisión de la corrección de Stripe

Base: `desarrollo` (`00ce974`, PR #12 ya fusionada). Rama: `fix/stripe-payment-integrity`.

## Resultado preparado

- Webhook autónomo, acciones autenticadas Checkout/portal y migración SQL transaccional, basados en el código, esquema y permisos proporcionados por el propietario.
- Precio fijo y validado en servidor: 19,99 EUR/mes finales, impuestos incluidos (`tax_behavior=inclusive`), cantidad uno. Se rechazan precios con impuestos exclusivos/no definidos y totales distintos; se desactiva la conversión adaptativa de moneda. Cuenta y cliente fijados por identidad autenticada; el navegador no decide el destinatario del pago ni la URL de retorno.
- Lectura de referencias y periodos compatible con la API del destino (`2026-08-26.dahlia`) y formas anteriores. Solo el estado actual de Stripe, con factura pagada y periodo vigente, concede acceso completo.
- Intentos de checkout reutilizables, comprobación de suscripciones en Stripe antes de ofrecer otro cobro, bloqueo por cuenta con caducidad y recibos de notificación guardados de forma atómica con el estado de acceso.
- Errores de proveedor o persistencia no se confirman como éxito. Reenvíos, notificaciones atrasadas y recuperaciones no recrean estados antiguos. Los eventos de una suscripción anterior no sustituyen una nueva.
- Web con mensajes de error recuperables y comprobación del estado del servidor al volver de Checkout. La URL de retorno no acredita un pago.

## Evidencia local

Las 155 pruebas previas de contenido/exportación pasan en la batería general, junto con los casos de facturación incluidos en esa ejecución. Los 16 casos finales de facturación pasan también de forma dirigida contra la función real y PostgreSQL embebido (PGlite): permisos, Checkout, portal, firmas, entorno, factura moderna anterior a Checkout, identidad manipulada, factura no pagada, estados fuera de orden, periodos, precio, error SQL con rollback, duplicados, bloqueo/caducidad, fallo Stripe, referencias antiguas, cancelación y nueva suscripción, y prevención de doble cobro con base de datos atrasada.

Nueve pruebas Python y ocho recorridos Chromium pasan, incluidos facturación, cuenta, sesiones, supervisión, práctica/documentos/memoria, variedad, presentación y fotografías. En el recorrido de facturación solo se interceptan páginas Stripe simuladas; no se envía una tarjeta ni se contacta con Stripe real.

No se han modificado los generadores, categorías, imágenes ni las gráficas aprobadas. Se añaden mensajes de estado de facturación a la interfaz y se mantiene el modo test.

## Límites y siguiente paso

La preparación NO acredita un despliegue remoto, una compilación en el servicio Supabase, un webhook recibido realmente desde Stripe ni un cobro real. La estructura SQL facilitada por el propietario se reproduce en la prueba PostgreSQL; la instalación remota debe verificarse por su procedimiento.

La PR **no debe fusionarse antes de instalar y comprobar** la migración, secretos y función de pagos: la nueva web deja de usar los enlaces antiguos. El flujo habitual de GitHub continúa publicando exclusivamente la función de ejercicios y la web; las operaciones de facturación requieren los pasos explícitos de `stripe-test-installation.md`.

Primer paso guiado del propietario: ejecutar una vez el SQL completo y comunicar su resultado. Después, revisar el precio del sandbox y configurar los secretos en Supabase, sin enviarlos al chat. Tras instalar la función y la nueva web se podrá ejecutar el primer pago real de sandbox y continuar con el resto de casos de `stripe-live-readiness.md`.

Las propuestas de producto para después del cobro están separadas en `learning-hub-next-experiences.md`; no se han aplicado rediseños ni nuevas mecánicas en esta corrección.

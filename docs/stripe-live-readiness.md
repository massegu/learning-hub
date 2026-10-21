# Stripe: qué falta antes de cobrar dinero real

## Estado comprobado en el repositorio

La rama de corrección mantiene `stripeMode: "test"` en `js/config.js` y reemplaza los Payment Links públicos por acciones autenticadas de servidor. `supabase/functions/stripe-webhook/index.ts` contiene el webhook y las acciones Checkout/portal. La migración añade intentos de pago, recibos de eventos y bloqueos de procesamiento privados.

El propietario facilitó el código remoto anterior, la estructura de `accounts`, sus políticas y permisos efectivos: los usuarios solo pueden actualizar `content_locale`. El destino Stripe de sandbox escucha cinco eventos y usa API `2026-08-26.dahlia`. El código corregido se ha preparado a partir de esos datos; **no se ha desplegado ni probado todavía en el Stripe/Supabase remoto**.

Las pruebas locales ejecutan la función real con respuestas Stripe simuladas y sus transacciones SQL contra PostgreSQL embebido. No acreditan un cobro ni la configuración del proveedor. El flujo automatizado de GitHub publica únicamente `request-learning-content`; no aplica la migración, instala el webhook ni activa live. Seguir primero [la instalación guiada](stripe-test-installation.md), antes de fusionar la nueva web.

## Pruebas necesarias en modo de prueba

Registrar para cada caso el usuario, la sesión/factura/evento de Stripe, el estado final en Supabase y el acceso que muestra Learning Hub. No guardar claves ni números de tarjeta en el repositorio.

| Caso | Resultado que debe comprobarse |
| --- | --- |
| Alta con tarjeta aprobada | Una suscripción para la cuenta correcta, importe y periodicidad esperados, acceso concedido después de confirmación del servidor y recibo disponible. |
| Cancelar el checkout sin pagar | No se concede acceso ni se crea una suscripción activa por volver a la web. |
| Tarjeta rechazada | Se muestra un mensaje útil; no se concede acceso ni se deja una suscripción activa por error. |
| Autenticación 3D Secure | Completar y cancelar el desafío producen los estados de pago y acceso correspondientes. |
| Cerrar el navegador después del pago | El webhook actualiza Supabase aunque no se visite la página de retorno. Al volver a entrar aparece el acceso correcto. |
| Renovación correcta y renovación fallida | Las facturas y el acceso reflejan ambos casos, incluida la política elegida para el periodo de gracia y la recuperación tras actualizar la tarjeta. |
| Cancelación al final del periodo | El acceso dura hasta la fecha pagada y finaliza cuando corresponde. Cancelar la renovación no debe cortar anticipadamente un periodo aún vigente. |
| Portal de gestión | Cada cuenta ve exclusivamente su suscripción, puede gestionar su tarjeta y cancelar según la política definida. |
| Reenvío de webhook | Repetir el mismo evento no duplica suscripciones ni extiende acceso indebidamente. Eventos fuera de orden no restauran un estado anterior. |
| Webhook inválido o de otro modo/precio | Se verifica la firma; se rechazan avisos no válidos y no se mezcla test con live ni se concede acceso por un producto distinto. |
| Reembolso | Definir y comprobar el efecto sobre la suscripción y el acceso: reembolsar y cancelar son operaciones diferentes en Stripe. |
| Dos usuarios diferentes | Pagar con A no modifica el acceso de B. La vinculación debe basarse en una identidad autenticada y validada en el servidor. |

Para suscripciones, una sesión de checkout completada no equivale siempre a una factura pagada, especialmente con métodos de pago diferidos. El webhook debe reflejar los estados reales de la suscripción y las facturas según el circuito elegido.

La corrección crea Checkout Sessions desde una función autenticada, con precio y cuenta fijados en el servidor. El `client_reference_id` es ahora un intento de pago guardado en una tabla privada, no una identidad elegida por el navegador. Debe comprobarse la vinculación completa durante las pruebas remotas y verificar que los Payment Links antiguos no activan cuentas nuevas.

Tarjetas de prueba habituales (solo en el entorno de prueba):

- Aprobada: `4242 4242 4242 4242`.
- Fondos insuficientes: `4000 0000 0000 9995`.
- Autenticación requerida: `4000 0025 0000 3155`.

Usar los datos auxiliares indicados en la documentación de Stripe. Para renovar y simular el paso del tiempo, utilizar las herramientas de pruebas de suscripciones y Test Clocks donde proceda.

## Paso a modo real después de superar esas pruebas

1. Confirmar la activación de la cuenta de Stripe y los datos necesarios para recibir los cobros.
2. Crear el producto/precio y los enlaces de pago y portal en modo real. Verificar el importe mostrado, moneda, periodicidad e impuestos configurados.
3. Configurar el endpoint de webhook del entorno real con su secreto de firma y credenciales del modo correcto, guardados en el servidor. No poner claves secretas en `js/config.js` ni en GitHub público.
4. Probar y desplegar el webhook por su propio procedimiento; no asumir que el flujo de ejercicios lo hace.
5. Cambiar la configuración pública de la web a los enlaces reales y comprobar la publicación.
6. Con autorización del titular, hacer una compra real controlada y comprobar recibo, acceso, portal y cancelación. Las tarjetas de prueba no funcionan en live.
7. Conservar evidencia de la revisión y vigilar los eventos fallidos de webhook, los pagos y la correspondencia de acceso durante el lanzamiento.

Antes de esa activación deben estar identificados la web habitual, el proyecto Supabase habitual y qué cuentas/datos son de prueba, para que una publicación de la beta no cambie las suscripciones del servicio de pago.

## Referencias

- https://docs.stripe.com/testing
- https://docs.stripe.com/billing/testing
- https://docs.stripe.com/webhooks
- https://docs.stripe.com/payments/checkout/fulfill-orders
- https://docs.stripe.com/customer-management

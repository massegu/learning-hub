# Checkout rechazado por Managed Payments

La prueba del 22 de octubre de 2026 mostró `400 POST /v1/checkout/sessions`:
`Unsupported parameter: payment_method_types`. Stripe indica que Managed Payments
está activado por defecto en la cuenta y permite desactivarlo para esta petición
mediante `managed_payments[enabled]=false`.

La corrección conserva el flujo de suscripción directa, tarjeta, precio mensual
de 19,99 EUR con impuestos incluidos y verificación del pago mediante webhook.
No cambia la configuración general de la cuenta de Stripe. Versiona la clave de
idempotencia de creación de Checkout (`lh:checkout:v2:`) porque el registro de Stripe
muestra que el reintento anterior devolvía la respuesta fallida almacenada.
Conserva el intento de base de datos y reutiliza cualquier sesión ya vinculada;
la comprobación de suscripciones existentes sigue impidiendo otro cobro.

## Instalación y siguiente prueba

1. En GitHub, abrir `supabase/functions/stripe-webhook/index.ts` en la rama
   `fix/stripe-managed-payments`, pulsar **Raw** y copiar el archivo completo.
2. En Supabase → Edge Functions → `stripe-webhook` → Code, conservar una copia
   del código desplegado y sustituirlo por el archivo completo. Desplegar.
   Mantener Verify JWT desactivado únicamente en esta función: las acciones
   requieren una sesión validada y los avisos de Stripe una firma HMAC.
3. No cambiar secretos, precio, SQL, clientes ni configuración general de Stripe.
4. En la URL estable de pruebas, usar la misma cuenta y pulsar Probar pago.
   Comprobar que Checkout se abre en entorno de prueba y muestra un total de
   19,99 EUR al mes. Usar únicamente una tarjeta de prueba de Stripe.
5. Confirmar después factura pagada, suscripción activa, webhook entregado y
   activación de esa cuenta en Learning Hub. Si falla, revisar el nuevo registro
   de Stripe; no marcar manualmente la cuenta como activa.

Las pruebas locales simulan el rechazo por Managed Payments y la reutilización
de la respuesta fallida con la clave anterior. No sustituyen la prueba remota.

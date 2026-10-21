# Stripe: instalación de la corrección y pruebas guiadas

Estado: código preparado y probado localmente; **no instalado ni probado contra el Stripe/Supabase remoto**. No se han activado cobros reales. El destino revisado usa cinco eventos y API `2026-08-26.dahlia`.

## Orden de instalación (antes de fusionar la PR de la web)

1. Conservar una copia del código actual de `stripe-webhook` y de su configuración, sin guardarla en Git si contiene secretos. Guardar también una copia de seguridad de la base de datos conforme al procedimiento del proyecto. La base actual tiene una suscripción por cuenta, Stripe IDs únicos y permiso de usuario para actualizar únicamente `content_locale`.
2. En Supabase SQL Editor ejecutar **una vez** el archivo completo `supabase/migrations/202610210001_billing_integrity.sql`. Añade tres tablas privadas y cinco funciones exclusivamente de servidor; no reemplaza `accounts`, sus estados, políticas o permisos. Todo se aplica en una transacción. Si aparece un error, detenerse y conservar el mensaje: no ejecutar fragmentos sueltos.
3. En el Stripe sandbox de Learning Hub crear un **nuevo precio recurrente de 19,99 EUR al mes**, cantidad uno y **impuestos incluidos** (`tax_behavior=inclusive`). La decisión comercial final del propietario es que el cliente pague 19,99 EUR, sin impuestos añadidos encima. El ID anterior `price_1UMn5vPtYdHU5MK2GbeygOLo` corresponde a 25 EUR y ya no debe utilizarse en `STRIPE_PRICE_ID`. No cambiar ni cancelar la suscripción de prueba existente para alterar su importe. Guardar el ID nuevo. El neto no está fijado en 15/20 EUR: depende de impuestos aplicables y comisiones. Crear el precio inclusivo no configura por sí solo obligaciones, registros fiscales, tasas o Stripe Tax. Revisar si corresponde IVA u otro tratamiento para este servicio, configurar el cálculo/desglose y comprobar factura y total final antes de live; no asumir un 21 % sin esa revisión. No compartir claves secretas.
4. En Supabase → Edge Functions → Secrets configurar `STRIPE_MODE=test`, `STRIPE_PRICE_ID`, `STRIPE_SECRET_KEY` del mismo sandbox, el `STRIPE_WEBHOOK_SECRET` del destino y `BILLING_APP_URL=https://pruebas.learning-hub-5n9.pages.dev/`. Solo un origen de app por configuración. Las URLs de despliegues por hash no son el origen autorizado de facturación.
5. En `stripe-webhook` → Code pegar TODO el contenido de `supabase/functions/stripe-webhook/index.ts` y desplegar. La función es un archivo autónomo. Verificar que **Verify JWT de esta función esté desactivado** para permitir avisos de Stripe; el código exige firmas HMAC o una sesión autenticada para las acciones del usuario. No cambiar la verificación JWT de los ejercicios.
6. En Stripe editar la URL del destino para dejar únicamente `https://duvdwsbzrivtxgeqvsln.supabase.co/functions/v1/stripe-webhook`, eliminando el parámetro `?token=…`. Conservar los cinco eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`. Conservar la versión de API indicada. Editar la URL del mismo destino no requiere crear otro destino; si se crea otro, usar su propio secreto de firma.
7. Activar/configurar el portal de clientes en el mismo sandbox: gestión de tarjeta y cancelación al final del periodo, según la política comercial elegida. Comprobar que la URL de retorno está permitida si Stripe lo solicita.
8. Solo después, fusionar la PR a `desarrollo` y esperar al flujo completo de publicación de la web. La web usa ahora acciones autenticadas del servidor; no vuelve a los Payment Links antiguos.

La función anterior no es una recuperación segura para pagos reales. Si falla la instalación, mantener test y pausar las pruebas de cobro; las funciones de ejercicios siguen separadas. No borrar las nuevas tablas/recibos para forzar reintentos ni alternar modos sobre las mismas cuentas. Si el checkout falla antes de entregar una URL, corregir la causa y reintentar; se reutiliza el intento.

## Primera prueba guiada

Usar una cuenta nueva de Learning Hub en prueba, sin `complimentary` ni una suscripción ya activa. No cambiar manualmente estados para fingir el resultado.

1. Entrar en la URL estable de pruebas, recargar con Ctrl+F5 para obtener la web actualizada y pulsar Probar pago.
2. Confirmar que Checkout muestra el precio previsto, EUR y periodicidad mensual. Usar la tarjeta de sandbox `4242 4242 4242 4242`, una caducidad futura y CVC de prueba. No usar una tarjeta real en sandbox.
3. Completar. Learning Hub espera confirmación del servidor; no concede acceso por el parámetro de retorno. Comprobar «Suscripción activa» y contenido de la cuenta correcta.
4. En Stripe comprobar sesión completada, factura pagada, suscripción activa y avisos de webhook entregados. En Supabase comprobar el cliente/suscripción correctos y `current_period_end` futuro; no compartir datos personales ni secretos en capturas.
5. Abrir Gestionar suscripción y comprobar que se ve exclusivamente la suscripción de esta cuenta.

Guardar fecha, cuenta de prueba identificada con alias, IDs de evento/sesión/factura, resultado y eventual error. Una simulación local o un evento ficticio de Stripe no sustituye este recorrido real en sandbox.

## Después de la primera prueba

Seguir `stripe-live-readiness.md`: cancelar Checkout; tarjeta rechazada; completar/cancelar 3DS; cerrar navegador tras pagar; reenvío de evento; renovación correcta/fallida y recuperación; cancelación al final del periodo; dos cuentas; reembolso y política de acceso. Las renovaciones se simulan con herramientas de Stripe/Test Clocks cuando corresponda; no esperar un mes ni adelantar el reloj del navegador.

## Pasar a cobro real

Objetivo: semana del 26 de octubre de 2026, condicionado a pruebas correctas. Confirmar activación/KYC y datos bancarios de Stripe, oferta fiscal/recibos, condiciones de suscripción y soporte. Fijar la URL pública definitiva y el proyecto Supabase de pago antes de cambiar secretos.

Los clientes y suscripciones de sandbox **no existen en live**. Esta instalación configura un solo modo por función: no cambiar test/live sobre cuentas ya vinculadas a clientes del otro modo. Preparar el entorno/cuentas reales y revisar la separación antes de migrar. Conservar trazabilidad de las pruebas; no limpiar Stripe IDs de cuentas de usuarios para sortear incompatibilidades.

Crear precio y destino en live, usar sus claves y secreto, configurar portal live y cambiar `STRIPE_MODE`/`STRIPE_PRICE_ID`/`BILLING_APP_URL` del servidor y `stripeMode` de la web coordinadamente. El modo enviado por la web debe coincidir con el servidor; el navegador no puede activar live. Con autorización del titular, realizar un cobro real controlado y comprobar recibo, acceso, portal y cancelación. Solo entonces anunciar disponibilidad de pago.

No se han hecho cambios remotos desde este repositorio ni se han ejecutado cobros durante esta preparación.

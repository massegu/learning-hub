# Stripe: instalación de la corrección y pruebas guiadas

Estado: el código de esta rama valida el nuevo precio inclusivo de 30,00 EUR; la función `stripe-webhook` desplegada debe actualizarse por separado, pues todavía valida 19,99 EUR. **No se ha desplegado la función ni se han cambiado secretos desde esta preparación.** El precio de Stripe test es `price_1UYQXGPtYdHU5MK2o23mThdS`. Aún falta completar y comprobar un Checkout real del sandbox. No se han activado cobros reales. El destino revisado usa cinco eventos y API `2026-08-26.dahlia`.

## Orden de instalación (antes de fusionar la PR de la web)

1. Conservar una copia del código actual de `stripe-webhook` y de su configuración, sin guardarla en Git si contiene secretos. Guardar también una copia de seguridad de la base de datos conforme al procedimiento del proyecto. La base actual tiene una suscripción por cuenta, Stripe IDs únicos y permiso de usuario para actualizar únicamente `content_locale`.
2. Antes de cambiar la función, comprobar en el historial del proyecto si `202610210001_billing_integrity.sql` ya está aplicada y si existen sus tablas/RPC. Si ya está aplicada, no volver a ejecutar el SQL. Si falta, detener el despliegue y aplicar esa migración por el procedimiento aprobado antes de continuar; esta corrección de precio no requiere una migración adicional.
3. En el Stripe sandbox de Learning Hub, el precio objetivo es **30,00 EUR al mes**, cantidad uno y **impuestos incluidos** (`tax_behavior=inclusive`). Su ID es `price_1UYQXGPtYdHU5MK2o23mThdS`. No cambiar ni cancelar suscripciones de prueba anteriores para alterar su importe. El portal de Stripe seguirá mostrando el precio contratado para cada suscripción existente; eso es lo esperado. El neto depende del tratamiento fiscal y de las comisiones. Crear un precio inclusivo no configura por sí solo obligaciones, registros fiscales, tasas ni Stripe Tax. Revisar el tratamiento aplicable y comprobar factura y total final antes de live; no asumir un 21 % sin esa revisión. No compartir claves secretas.
4. Después de aprobar y fusionar la PR en `pruebas`, actualizar manualmente **solo** el secreto `STRIPE_PRICE_ID` de la función de pruebas en Supabase → Edge Functions → Secrets con el valor literal `price_1UYQXGPtYdHU5MK2o23mThdS`. Mantener `STRIPE_MODE=test` y las claves del mismo sandbox. No modificar las tres suscripciones existentes. No pegar ni compartir ningún valor `sk_…` o `whsec_…`.
5. Desplegar el código actualizado solo al proyecto de pruebas: `supabase functions deploy stripe-webhook --project-ref duvdwsbzrivtxgeqvsln --no-verify-jwt`. Comprobar que **Verify JWT de esta función está desactivado** para permitir avisos de Stripe; el código exige firmas HMAC o una sesión autenticada para las acciones del usuario. No cambiar la verificación JWT de los ejercicios. La PR por sí sola no modifica la función desplegada ni los secretos.
6. Comprobar de forma segura que el nombre del secreto existe con `supabase secrets list --project-ref duvdwsbzrivtxgeqvsln`; esta lista confirma nombres, no revela valores. La verificación del valor se hace en runtime: desde una cuenta de prueba sin suscripción activa, abrir un Checkout y confirmar en el panel Stripe de **test mode** que la sesión usa `price_1UYQXGPtYdHU5MK2o23mThdS`, EUR y total 30,00 €. No completar la prueba hasta validar precio y modo. Tras completarla con una tarjeta de sandbox, confirmar evento entregado y suscripción sincronizada. No probar desde una cuenta que corresponda a las tres suscripciones existentes.
7. En Stripe editar la URL del destino para dejar únicamente `https://duvdwsbzrivtxgeqvsln.supabase.co/functions/v1/stripe-webhook`, eliminando el parámetro `?token=…`. Conservar los cinco eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`. Conservar la versión de API indicada. Editar la URL del mismo destino no requiere crear otro destino; si se crea otro, usar su propio secreto de firma.
8. Activar/configurar el portal de clientes en el mismo sandbox: gestión de tarjeta y cancelación al final del periodo, según la política comercial elegida. Comprobar que la URL de retorno está permitida si Stripe lo solicita. Los precios antiguos de las suscripciones ya contratadas se seguirán viendo en el portal; la nueva tarifa aplica a Checkouts nuevos.
9. Publicar la web desde `pruebas` después de que el código y la función de pruebas estén actualizados. La web usa acciones autenticadas del servidor; no vuelve a los Payment Links antiguos.

La función anterior no es una recuperación segura para pagos reales. Si falla la instalación, mantener test y pausar las pruebas de cobro; las funciones de ejercicios siguen separadas. No borrar las nuevas tablas/recibos para forzar reintentos ni alternar modos sobre las mismas cuentas. Si el checkout falla antes de entregar una URL, corregir la causa y reintentar; se reutiliza el intento.

## Primera prueba guiada

Usar una cuenta nueva de Learning Hub en prueba, sin `complimentary` ni una suscripción ya activa. No cambiar manualmente estados para fingir el resultado.

1. Entrar en la URL estable de pruebas, recargar con Ctrl+F5 para obtener la web actualizada y pulsar Probar pago.
2. Confirmar que Checkout muestra **30,00 EUR**, EUR y periodicidad mensual. Usar la tarjeta de sandbox `4242 4242 4242 4242`, una caducidad futura y CVC de prueba. No usar una tarjeta real en sandbox.
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

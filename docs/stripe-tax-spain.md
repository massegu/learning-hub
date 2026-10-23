# Preparación fiscal de Learning Hub en España

La titular ha indicado que facturará desde España y aún no es autónoma. No hay
confirmación de asesoría sobre IVA, altas ni sobre venta a familias o centros.
La suscripción mostrada pertenece al sandbox y no calcula impuestos todavía.
La captura de la próxima factura no acredita que la primera esté pagada.

## Antes de aceptar dinero real

Confirmar con una asesoría el alta censal que corresponda en AEAT, las obligaciones
en Seguridad Social, la clasificación de la actividad, facturación e IVA. No dar
por exento el acceso a software porque contenga material educativo. Tampoco usar
un umbral de ingresos como autorización automática para operar sin altas.

Determinar si se venderá a particulares, empresas/centros o ambos, y en qué países.
El tratamiento puede variar, también entre territorios españoles y ventas a otros
países. En Stripe el producto figuraba como SaaS de uso comercial: revisar que el
código fiscal elegido describe realmente lo que se vende y a quién.

El correo de soporte puede ser una cuenta gratuita de Gmail de uso personal,
dedicada exclusivamente a Learning Hub y con verificación en dos pasos. No necesita
dominio. Elegir Gmail o Google Workspace no constituye un alta empresarial/fiscal.
El buzón de soporte tampoco sustituye al proveedor SMTP de los correos de Supabase.

## Configuración técnica preparada

La función `stripe-webhook` admite `STRIPE_AUTOMATIC_TAX=enabled`. Sin esa variable,
o con `disabled`, mantiene la prueba actual sin cálculo automático. Al activarla,
las nuevas sesiones envían:

- `automatic_tax[enabled]=true`.
- `billing_address_collection=required`.
- `customer_update[address]=auto` para conservar la ubicación fiscal del cliente.

Se conserva el precio inclusivo de 19,99 EUR y el rechazo de una sesión cuyo total
no sea exactamente 1999 céntimos. No se introduce un porcentaje fijo ni se activa
Managed Payments. La integración usa suscripciones directas: no asumir que Stripe
actúa como vendedor y se encarga de todas las obligaciones fiscales de la titular.

Activar Stripe Tax no configura por sí solo el alta en AEAT, los registros de IVA,
las declaraciones ni el ingreso de impuestos. Revisar también las tarifas de Tax.

## Recorrido de prueba tras confirmar el tratamiento fiscal

1. Conservar el entorno de prueba de Stripe. Abrir **Tax** (buscarlo en la barra
   superior si no aparece en el menú) y su configuración. Completar la ubicación
   de la actividad y revisar los registros fiscales de prueba conforme al caso
   confirmado con asesoría. Un registro dentro del sandbox no es un alta fiscal real.
2. En Catálogo → Learning Hub, revisar el código fiscal del producto. Conservar
   el precio mensual `price_1UMqnbPtYdHU5MK2t0pQ4Xjz`, 19,99 EUR, impuestos incluidos.
   No añadir una tasa manual a la vez que el cálculo automático.
3. Instalar el archivo completo `supabase/functions/stripe-webhook/index.ts` de
   esta rama en la función homónima. Mantener su Verify JWT desactivado: valida
   explícitamente la sesión o la firma de Stripe. No modificar otras funciones.
4. En Supabase → Edge Functions → Secrets guardar `STRIPE_AUTOMATIC_TAX=enabled`.
   Conservar `STRIPE_MODE=test` y las claves del mismo sandbox.
5. Usar otra cuenta de prueba sin suscripción para el nuevo recorrido. La cuenta
   ya activa debe seguir en su suscripción existente. No borrar sus IDs para
   permitir otro pago. Activar la variable no modifica sus facturas anteriores.
6. Si hay una sesión abierta anterior sin Tax, la función la rechaza en lugar de
   cobrar sin cálculo. Revisarla y caducarla en Stripe, esperar el vencimiento del
   intento y reintentar; no borrar tablas ni reutilizar un intento con datos alterados.
7. Comprobar la dirección de facturación, el desglose que corresponde al caso
   fiscal y **el total final de 19,99 EUR**. Pagar con tarjeta de prueba y comprobar
   factura pagada, datos de emisor y cliente, impuesto/base, próxima renovación,
   avisos de webhook y estado activo de la cuenta correcta.
8. Probar las demás ubicaciones y tipos de cliente que realmente se admitirán.
   Registrar el resultado y revisar casos sin impuesto o sin ubicación válida.
   No anunciar «impuestos configurados» por haber activado una variable.

En la suscripción actual aparece cancelación automática el 20/01/2027. Revisar
sus detalles (`cancel_at`, programación y condiciones del sandbox) antes de copiar
configuraciones a live; no asumir su causa ni eliminarla sin comprobarla.

Referencias para la configuración: [Stripe Tax en Checkout](https://docs.stripe.com/tax/checkout),
[precios con impuestos incluidos](https://docs.stripe.com/tax/products-prices-tax-codes-tax-behavior),
[AEAT](https://sede.agenciatributaria.gob.es/) y [Seguridad Social: Importass](https://portal.seg-social.gob.es/).
El procedimiento está preparado; no se ha configurado Tax en la cuenta remota.

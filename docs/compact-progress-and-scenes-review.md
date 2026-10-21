# Progreso compacto y escenas graduadas

Rama: `improve/compact-progress-and-advanced-scenes`, basada en `desarrollo` (`d300f97`).

## Cambios revisables

- Progreso: tarjetas compactas con una paleta por área; nueve áreas ocupan tres filas en escritorio en vez de cinco filas de tarjetas grandes. Los porcentajes, niveles, historial y exportaciones conservan sus cálculos.
- Tiempos: dos columnas en escritorio; seis retos recientes inicialmente visibles. El historial adicional se despliega y la tabla completa sigue disponible. Se mantienen las medianas de hasta 20 intentos válidos por reto, nivel y formato.
- Fotografías generadas: seis entornos A/B (cocina, salón, escritorio, pícnic, mercado y entrada), doce archivos. Las nuevas fuentes y variantes se inspeccionaron visualmente para comprobar cantidades, posiciones y los tres cambios de color. Las áreas clicables se ajustaron a los objetos de cada fotografía. `assets/photos/review.json` identifica las imágenes revisadas.
- Memoria: nivel 1 recuerda un dato; nivel 2 combina dos datos; nivel 3 combina tres datos de la misma imagen. Los distractores cambian un componente y las respuestas se derivan de los hechos revisados. Las imágenes siguen desapareciendo antes de preguntar.
- Atención: seis comparaciones, con marcado directo en niveles 1/2; el nivel 3 exige distinguir dirección y colores inicial/final, incluidas alternativas invertidas.
- Ocho medallones ilustrados originales en las cabeceras de ejercicios. No se alteran las quince categorías de memoria, sus iconos de respuesta ni el cálculo de velocidad.

## Verificación

155 pruebas Node y nueve Python. Siete recorridos Chromium: cuenta, sesiones, supervisión, práctica/documentos/memoria, variedad, presentación y fotografías. Incluyen escritorio/móvil, corrección, ocultación de la fotografía, nivel 3, marcadores, exportación ZIP/DOCX con imágenes y conservación de cálculos de Progreso.

El inventario actualizado cuenta actividades distintas por material, pregunta y respuesta; no multiplica por identificadores ni distractores. No representa un número de mecánicas distintas. La ampliación de esta entrega son cuatro entornos nuevos y preguntas graduadas, no una afirmación de cientos de mecánicas nuevas.

## Publicación

Crear PR a `desarrollo`. Tras fusionarla, esperar a que finalice el flujo completo: comprobaciones, despliegue de función, promoción de `pruebas` y verificación de los recursos de Cloudflare. Abrir la URL estable `https://pruebas.learning-hub-5n9.pages.dev/` cuando termine correctamente. La verificación incluye las ocho fotografías nuevas y la lámina de medallones.

## Siguiente trabajo: Stripe, paso a paso

Objetivo: aceptar pagos durante la semana del 26 de octubre de 2026, condicionado a superar las pruebas del circuito de cobro y acceso. Esta PR no activa pagos reales.

1. Identificar la web de pago definitiva, su proyecto Supabase y el webhook realmente desplegado. Revisar el código del webhook, que no consta en este repositorio. Comprobar el estado de activación de Stripe, precio, moneda, periodicidad y portal. No compartir claves secretas en el chat ni en Git.
2. Ejecutar los casos de sandbox de `stripe-live-readiness.md`, guardando eventos, facturas y estado de acceso por cuenta. Empezar por pago aprobado y acceso de la cuenta correcta; continuar con rechazo, 3DS, cancelación, renovación, recuperación y aislamiento entre dos usuarios.
3. Verificar firma e idempotencia del webhook, eventos fuera de orden y actualización del acceso aunque el comprador cierre el navegador. Resolver los fallos antes de cambiar la configuración pública.
4. Preparar y revisar la configuración real. Con autorización del titular, realizar un cobro real controlado, comprobar recibo, acceso, portal y cancelación. Publicar solo cuando el resultado sea correcto y supervisar eventos fallidos durante el lanzamiento.

La fecha objetivo no sustituye las comprobaciones. Los recorridos locales de esta PR usan suscripciones simuladas y no constituyen pruebas de Stripe.

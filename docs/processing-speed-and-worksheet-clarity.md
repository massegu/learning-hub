# Iteración del 24 de octubre: instrucciones y velocidad

Parte de `desarrollo` tras la PR #19. No cambia iconos, fotografías, documentos visuales existentes, cuotas de suscripción ni Stripe. No incorpora ni ejecuta la migración de privacidad.

## Banco y uso diario

El encabezado muestra por separado «Banco: más de 800 actividades por edad» y «Hoy: N ejercicios». Al desplegar el detalle de uso se explica la cuota diaria de la cuenta, incluidos los 500 del plan activo o el límite que devuelva el servidor para otros planes. No se ha reducido ni aumentado esa cuota. El inventario reproducible sigue en `scripts/photo-content-inventory.js`: verifica más de 800 actividades por edad y no equivale a un número de mecánicas distintas.

## Enunciado, plan y lista

Las actividades de revisar listas presentan el contexto, «Plan acordado» y «Lista que debes revisar» como bloques separados. Se sustituye «Tu grupo se prepara para preparar…» por «Tu grupo va a preparar…». El formato se conserva en la exportación. No se han alterado las fuentes documentales que ya funcionan.

## Papel coherente con lo que contiene

Las actividades de categorías exportadas como listas de palabras preguntan por los «elementos de la lista», no por imágenes ausentes. La formulación de papel es explícita (`paperQuestion`) y también pasa por la adaptación regional. Las instrucciones de secuencias hablan de elementos. No se añaden imágenes indiscriminadamente.

La prueba de integración abre el ZIP y cada DOCX: la primera ficha es de texto, sin archivos de imagen, y contiene la pregunta corregida; la otra conserva las dos claves completas y unas instrucciones de búsqueda en papel que no piden pulsar un botón inexistente. Las fotografías y demás recursos existentes conservan sus pruebas de inclusión.

## Nuevas mecánicas de velocidad: 8–18 años

- **Cruzar dos claves**: localizar un código, pasar a su zona y usar esa zona en una segunda tabla. La carga de búsqueda aumenta con el nivel.
- **Revisar una agenda**: localizar una única tarea que cumpla día y estado; en nivel 3 se añade prioridad. Los distractores incumplen alguna condición y se valida que haya exactamente una coincidencia.
- **Cambiar de criterio**: responder por la letra o por el número según la regla activa; en nivel 3 aparece además la indicación de invertir o mantener la respuesta.

Son tareas puntuadas de pantalla con tiempo y precisión; las respuestas se derivan de sus fuentes. Sus métricas se separan por familia, nivel y formato como las existentes. Los perfiles de 6–7 conservan su circuito actual.

## Mira a tu alrededor: 8–18 años

Es una modalidad explícita de Velocidad, separada de los retos de pantalla. La consigna se oculta hasta pulsar Empezar. El usuario busca desde su sitio, indica que ha localizado algo y confirma si cumplía las condiciones; también puede indicar que no encuentra nada o detener la búsqueda. No se utiliza cámara ni micrófono ni se recoge una descripción libre.

Se guarda una observación estructurada: momento, actividad, nivel, tiempo, validez de la medición y valoración declarada. El tiempo incluye lectura y pulsación: no es una medida pura de procesamiento ni una verificación automática del objeto. No suma puntos ni aciertos ni entra en las medianas de pantalla. Las observaciones recientes aparecen aparte en Progreso. Salir de la pestaña interrumpe la práctica; el desenfoque invalida el tiempo.

La API exige revisión 7 y valida la edad, el área y la modalidad; clientes anteriores reciben una petición de actualización si solicitan esa actividad. Los modos antiguos mantienen compatibilidad. El registro JSON de privacidad, cuando se active en su rama, incluye estas observaciones dentro de `progress`.

## Validación

- `npm test`: 189 pruebas aprobadas.
- Python: 9 pruebas aprobadas.
- Doce recorridos de navegador aprobados; el nuevo verifica entrega real de búsquedas, cronómetro, confirmación, ausencia de puntuación automática, interrupción, las tres familias nuevas, vista móvil sin columnas recortadas y dos archivos Word reales.
- Nuevos bancos y consignas pasan la validación de todas las variantes de español admitidas; respuestas y fuentes alteradas se rechazan.
- La compilación remota sin publicación no pudo completarse: Supabase rechazó la credencial del entorno (HTTP 401). No se ha publicado ni aplicado SQL; queda la comprobación remota y la validación de beta tras revisar/publicar la rama.

Capturas: [plan separado](review-assets/processing-speed/attention-plan.png), [dos claves en móvil](review-assets/processing-speed/two-keys-mobile.png), [búsqueda observada](review-assets/processing-speed/room-observation.png).

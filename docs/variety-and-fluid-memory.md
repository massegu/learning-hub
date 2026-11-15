# Variedad, memoria y avance automático

Esta rama parte de `desarrollo` (212b9c2) y se puede revisar sin incorporar la migración de privacidad. No cambia fotografías, iconos ni documentos visuales. No aumenta la cuota diaria ni activa pagos. No se han publicado servicios remotos.

## Cambios de comportamiento

- Las rondas de movimiento avanzan solas: cinco segundos de espera y cuatro para actuar; las señales de audio avanzan al terminar el audio y el intervalo para hacer el gesto. La valoración se pide al acabar la ronda. Se pueden marcar dificultades o detenerla. Las respuestas de tarjetas con símbolos pasan automáticamente a la siguiente tras un breve feedback. El aviso de cambio de reglas se mantiene.
- Una tarjeta presentada no cuenta como un gesto correcto. Se registra como `unverified` salvo una marca explícita de dificultad; la valoración final se distingue de una medición. Esta práctica no aumenta los aciertos de ejercicios puntuados. Cambiar de pestaña detiene la ronda y exige reiniciar.
- Las casillas de localización tienen borde contrastado, fondo diferenciado y una cuadrícula de hasta 360 px, conservando su geometría y las etiquetas de teclado.
- Las fotografías de memoria de nivel 1 se muestran diez segundos, contados desde que la imagen se ha decodificado; niveles 2 y 3 mantienen doce y nueve segundos. La pregunta sigue oculta durante la exposición.
- Para 6–7 años, las asociaciones y secuencias pasan a 2, 3 y 4 elementos según nivel; las cargas de las demás edades se conservan. Las escenas de iconos mantienen un mínimo de seis segundos compatible con la validación infantil.

## Repetición y carga de escenas

La selección anterior reconstruía y validaba bancos fotográficos en 900 sorteos por petición. Una medición local de selección de escenas pasó de unos 2.600 ms a unos 130 ms al recorrer una vez el banco finito y reutilizar plantillas internas. Es una medición local, no una garantía de latencia en producción. Los objetos públicos se clonan: una exportación o una respuesta no puede modificar las plantillas futuras.

El historial de `content_seen` se combina con el respaldo ya guardado en `progress._delivery`. Si la consulta falla, se registra el fallo sin datos de usuarios y se utiliza ese respaldo. La rotación no se borra al cambiar la fecha. Primero se agotan los materiales disponibles y después se reutiliza el menos reciente de la ventana conservada.

En fotografías se separan dos identidades: escena y pregunta. Las catorce escenas rotan antes de reutilizar una; al volver a una escena se priorizan sus preguntas aún no vistas en la ventana. Las diferencias también rotan por pareja de imágenes. Una nueva pregunta o un cambio de nivel no convierten la misma foto en una escena nueva. Esto no es una garantía de no repetir nunca: el banco y las ventanas son finitos y dos peticiones concurrentes aún pueden coincidir.

## Ampliación medible

Se añaden **368 actividades distintas** construidas sobre 40 situaciones escritas para las cinco franjas: organizar planes, retomar tareas, detectar omisiones/intrusos y recordar encargos. El recuento elimina IDs y nivel, y compara dominio, estímulo, pregunta y respuesta; no cuenta renombrar un título como una actividad nueva. Las situaciones incluyen creación de cómics, fútbol, Minecraft, anime, Pokémon, música, podcast y tareas cotidianas según la edad. No se incorporan cuentas ni servicios externos de esas marcas.

Inventario reproducible: `node scripts/photo-content-inventory.js`. Recorre los bancos enumerados y verifica su representación imprimible; no equivale a un número de mecánicas distintas.

| Edad | Actividades distintas verificadas |
|---|---:|
| 6–7 | 2.141 |
| 8–10 | 4.733 |
| 10–12 | 4.832 |
| 13–15 | 5.033 |
| 16–18 | 5.001 |

El detalle está en `docs/audits/photo-content-inventory.json`. Estos bancos ya superan 800 por edad; esta entrega actúa también sobre la selección para que la variedad llegue a las sesiones.

## Validación

`tests/variety-fluid-memory.test.js` cubre la carga infantil, diez segundos de exposición, plantillas aisladas, catorce escenas antes de reutilizar, reutilización por antigüedad, preguntas nuevas al volver a una escena y respaldo entre fechas con la consulta de historial fallando. Los nuevos contenidos pasan el modelo de entrega y exportación en español internacional y de España.

Los recorridos de navegador comprueban avance sin confirmaciones por tarjeta, audio hablado y tonos, interrupción, audio no disponible, valoración final sin puntuación automática, fotografías y Word. `browser-memory-layout.py` comprueba dos parejas infantiles y casillas compactas en escritorio/móvil. No se usan datos reales ni se envían correos/cobros.

La compilación remota se comprueba sin publicar; la validación del comportamiento tras despliegue beta sigue siendo necesaria. La revisión de permisos de Supabase está en `docs/privacy/schema-review-2026-10-23.md`; es independiente de estos cambios educativos.

Comprobaciones completadas: batería completa `npm test` (185 aprobadas), Python (9 aprobadas), once recorridos de navegador y compilación de quince archivos Edge sin publicar (versión remota 61). Tras conectar las nuevas tareas al adaptador infantil se repitieron las pruebas de selección/recorrido infantil y exportación afectadas.

Capturas de revisión: [localizaciones en escritorio](review-assets/variety-fluid-memory/locations-desktop.png), [en móvil](review-assets/variety-fluid-memory/locations-mobile.png), [dos parejas de memoria infantil](review-assets/variety-fluid-memory/youngest-pairs.png) y [ronda de movimiento automática](review-assets/variety-fluid-memory/automatic-movement.png).

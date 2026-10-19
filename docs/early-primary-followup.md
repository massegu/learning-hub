# Seguimiento de fichas y experiencia de 6–7 — 19 de octubre de 2026

Rama: `fix/early-primary-stimulus-integrity`. Este seguimiento conserva la fusión de áreas y la arquitectura ya validada. No se fusiona a `main`, no se promueven `desarrollo`/`pruebas` y no se modifican datos ni funciones publicadas de Supabase.

## Fichas: causa reproducida y alcance

El error «Actividad no imprimible: la pregunta no tiene el estímulo del que depende» es correcto cuando una pregunta requiere información y el candidato lleva `stimulus: []`. No se ha proporcionado el ID del ejercicio de la prueba manual, por lo que no se atribuye el fallo a un ítem remoto concreto ni a una versión publicada.

La rama ya tenía selección con descarte y reposición antes de exportar. El hueco que se reproduce en este seguimiento es el límite final de exportación: un candidato que llega inválido al generador provoca un fallo global, sin posibilidad de reemplazarlo. Selección e impresión utilizaban rutas de preparación separadas. La prueba introduce deliberadamente un estímulo vacío después de la selección y antes de crear DOCX; no inventa el texto a partir de la respuesta.

Ahora:

- `ActivityModel.preparePrintable` es el contrato compartido de selección y exportación: valida área, franja declarada, variante regional, estímulo, respuesta y proyección final. También comprueba la disponibilidad del PNG de los pictogramas que imprimirá para 6–7.
- `WorksheetSelection.collect` solo acepta el candidato después de esa preparación; mantiene la identidad semántica y el control de duplicados.
- El generador DOCX admite una fuente de reposición autorizada. Antes de construir ningún archivo vuelve a seleccionar cada versión; un candidato incompatible tardío se descarta y se solicita otro conservando el número de actividades pedido.
- La interfaz pasa sus mismas solicitudes autorizadas a ese límite final. Un perfil o país cambiado cancela el intento; una denegación de cuota, suscripción o acceso no se convierte en contenido local gratuito.
- El adaptador antiguo que conserva los nombres de los ZIP/DOCX transmite también las opciones de reposición.
- Un banco declarado agotado o tres lotes consecutivos sin candidatos nuevos producen el mensaje de disponibilidad insuficiente. No hay reintentos indefinidos. Ese límite evita agotar cuotas; no equivale a demostrar exhaustivamente el contenido de un banco remoto desconocido.
- No se produce un ZIP parcial. Si el solicitante directo del generador no proporciona reposición, la validación sigue rechazando el lote incorrecto en lugar de inventar contenido o reducir su tamaño.

La exclusión semántica dentro de cada ficha y el historial existente se mantienen; esto no promete versiones infinitas ni ausencia absoluta de repeticiones entre paquetes distintos.

## Experiencia de 6–7

Se evoluciona el panel existente; no se sustituye por un mapa obligatorio ni se reconstruye la navegación.

- Se mantienen acceso directo a las **siete áreas visibles** de la taxonomía actual y las cuatro misiones cortas existentes. No se vuelve a separar Cognición aplicada del área fusionada de Funciones ejecutivas.
- Nuevo camino de descubrimientos: tres pasos por área y tres hitos derivados del progreso real (primera actividad, un área explorada y una misión terminada). No añade monedas, recompensas aleatorias ni tablas de puntos nuevas.
- La recomendación avanza hacia áreas aún sin explorar, manteniendo la prioridad de una misión activa.
- Tarjetas con identidad visual, bordes suaves y colores por área, brújula vectorial original y estados de progreso legibles.
- Modelo y filas de comparación con más espacio; separación clara de respuestas. Se destaca el paso inicial y, tras responder una tarea de velocidad, se restaura la navegación que el modo de medición había ocultado. No cambia la medida de tiempo ya guardada.
- Las misiones siguen guardándose en `_earlyJourney` y pueden pausarse y reanudarse. Los hitos se calculan al renderizar: no requieren migraciones ni cambios de base de datos.
- La capa de descubrimientos está limitada al perfil early. Las edades mayores conservan su presentación madura.

## Atención e ilustraciones

El patrón completo `MODELO: … A: … B: … C: … D: …` se reconoce estrictamente para conservar modelo y cuatro filas. Se muestra como modelo enmarcado y tabla de opciones etiquetadas, con tipografía monoespaciada y separación entre caracteres. El contenido parcial o desconocido no se transforma ni se completa por conjetura. Su proyección en DOCX conserva las cinco referencias.

Para 6–7 se mantienen las familias nativas de percepción con formas y objetos: el patrón alfanumérico adulto continúa excluido por la política de edad.

Se conserva el sistema de SVG locales originales y PNG equivalentes para Word. Se añaden una brújula para el panel y pictogramas reutilizables de regla, pegamento y tijeras con sus PNG. Estos tres últimos amplían el repertorio disponible; no se afirma que cada ejercicio actual los muestre. No hay nuevas dependencias de imágenes remotas ni cambios del contenido curricular o de su dificultad.

## Validación

- `npm test`: **118 pruebas aprobadas**. Incluyen selección, agotamiento, error de servicio, edad, integridad, países y exportación real de DOCX/ZIP.
- Prueba nueva del exportador: candidatos tardíos inválidos en una y dos versiones, con sustitución, en las siete variantes por país; conteo y fuentes comprobados en XML del DOCX.
- `python3 tests/browser-early-followup.py`: aplicación y manejador reales con servicios simulados. Siete áreas, cuatro misiones, pausa/reanudación y finalización; panel a 1920, 1440, 1280, 1024, 768 y 390 px al 100%; ejercicio de cada área; comparación infantil y comparación de códigos en una edad mayor. **13 DOCX reales**, en una ficha y seis ZIP de dos versiones, con un candidato tardío inválido deliberado por versión. Siete países; sin peticiones externas ni errores de página.
- `python3 tests/browser-curriculum.py`: regresión de las cinco franjas, lectura, secuencias, posiciones, asociaciones, velocidad y funciones fusionadas; **138 actividades respondidas y 10 DOCX**, persistencia y comprobaciones de escritorio/móvil.
- Revisión visual de las capturas del panel, Matemáticas y comparación de Atención. Capturas representativas incluidas abajo.

Las pruebas de navegador simulan autenticación, base de datos y cuotas. No acreditan un despliegue remoto, un cobro real, validación clínica ni paginación física en Microsoft Word. Las bibliotecas DOCX/ZIP siguen siendo las existentes. No se han cambiado Stripe, las reglas de suscripción, los generadores de Supabase ni el esquema.

## Capturas de revisión

[Panel de escritorio](review-assets/early-followup/home-desktop.png) · [Panel móvil](review-assets/early-followup/home-mobile.png) · [Atención 6–7 móvil](review-assets/early-followup/attention-mobile.png) · [Comparación para mayores](review-assets/early-followup/comparison-older.png).

Para probar el código de esta rama sin datos reales: `python3 tools/review-preview.py` (Windows: `py tools/review-preview.py`). Para el preview de Cloudflare, seleccionar el despliegue de esta rama y el commit final del seguimiento; un enlace inmutable anterior o la rama `pruebas` no incorpora automáticamente este commit.

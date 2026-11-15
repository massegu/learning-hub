# Calma e Impulso y nuevos materiales cotidianos

Esta iteración incorpora los recursos aprobados de la entrega del 27 de octubre y aplica el diseño al perfil activo. No requiere cambios SQL, no cambia pagos, cuentas ni reglas de conservación.

## Comportamiento

- **Calma**: perfiles de 6–7, 8–10 y 10–12 años. Fondos cálidos, verde, tarjetas espaciadas y superficies de lectura diferenciadas.
- **Impulso**: perfiles de 13–15 y 16–18 años. Índigo, un acento cálido en la acción de inicio, el mismo orden de navegación y los mismos controles.
- El diseño se vuelve a calcular al cambiar de perfil y al entrar/salir de una sesión independiente; no es una preferencia persistida en la base de datos.
- Inicio indica de forma explícita si se guardarán los resultados. «Preparar sesión» abre el constructor existente.
- En móvil, «Áreas y perfil» permite desplegar y cerrar la navegación. Los botones tienen estados accesibles y el contenido conserva el ancho disponible.
- La tabla de evolución muestra fecha y hora usando las marcas ya guardadas; si faltan, indica que no hay fecha disponible. Las filas antiguas que solo tienen fecha no inventan una hora. Se usa la zona horaria del navegador.
- Se mantienen los iconos, imágenes y documentos anteriores, las áreas, el entrenamiento y la selección de dificultad. Las respuestas correctas/incorrectas y los objetivos de memoria espacial conservan bordes y colores diferenciados.

## Documentos

Se añaden 12 fuentes en `assets/documents/everyday-es-2026/`, cada una con su imagen original, HTML editable, transcripción y manifiesto de autoría. Las bibliotecas del navegador y de Supabase registran las mismas imágenes y dimensiones.

Panel de salidas del aeropuerto; anuncio de autobús; folleto de museo; catálogo; ticket; tarjeta de embarque con aviso posterior; captura de vídeo; cartel de cine; pantalla de turnos; aviso ferroviario; pantalla de recogida; programa deportivo.

Los documentos participan en Atención, comprensión de Lectura y planificación/revisión de Funciones ejecutivas. Las preguntas de comprensión son diferentes de las de localización de datos. Los planes se contrastan con datos de la transcripción, también en las variantes de español. Se mantiene el país y la moneda de cada documento original.

Se conserva el filtro de contexto de 8–10 años y la ruta simplificada de 6–7 años. Los documentos complejos de viaje comienzan en 10–12. No se fuerza a los más pequeños a interpretar documentos completos de adultos. Los materiales nuevos se alternan con los existentes; no sustituyen el catálogo anterior. DOCX incrusta el mismo PNG que se muestra en pantalla.

## Escenas

Biblioteca de barrio y parque de otoño, en `assets/scenes/everyday-es-2026/`. Escenas originales generadas con IA y revisadas antes de formular las preguntas. Se añaden a Memoria para 8–18 años: un dato en nivel 1, dos en nivel 2 y tres en nivel 3. El nivel 1 conserva los diez segundos de exposición. No se crean comparaciones de diferencias inexistentes; el banco anterior de parejas se mantiene intacto.

El catálogo pasa de 22 a 34 documentos y de 14 a 16 escenas de memoria. Estas cifras describen fuentes, no familias de ejercicios ni cuota diaria.

## Compatibilidad y publicación

El cliente envía revisión 8. El backend sigue aceptando revisiones 1–7, pero filtra los identificadores de documentos/fotos nuevos al responder a páginas antiguas, tanto en pantalla como en fichas. Esto evita referencias a imágenes que esas páginas no conocen.

La publicación habitual debe desplegar primero `request-learning-content` y después promover la web a `pruebas`. El verificador compara también el CSS nuevo y los PNG añadidos. Una vista previa de Cloudflare por sí sola puede usar todavía el backend anterior: no basta para validar las nuevas fuentes antes de desplegar la función compatible.

La carpeta `docs/review-assets/calma-impulso/` contiene capturas de la aplicación real ejecutada localmente con perfiles ficticios. La banda de «prueba local» pertenece al servidor de revisión y no se añade al producto.

## Comprobaciones

El recorrido `browser-age-designs.py` revisa los cinco rangos de edad, cambio de tema, ausencia de solapamiento de escritorio y desbordamiento a 390 px, menú plegable, lectura y evaluación del folleto nuevo, fechas del historial, fotografía nueva y exportación DOCX con el PNG original. La batería de contenido comprueba datos, localización y compatibilidad con clientes anteriores. Los recorridos de autenticación, privacidad y ejercicios conservan sus comprobaciones y abren el menú móvil como lo haría una persona.

No se añaden métricas ni datos personales nuevos.

Validación final local: **200 pruebas de Node, 9 pruebas de Python y 14 recorridos de navegador aprobados**. Se comprobó además que las catorce imágenes añadidas son idénticas a las aprobadas y que no hay cambios en los recursos gráficos anteriores. La rama no se ha publicado en Supabase ni en Cloudflare desde esta sesión.

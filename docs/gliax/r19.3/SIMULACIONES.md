# Simulaciones de R19.3

Frontend Design orienta el primer tramo del rediseño. La interfaz conserva la tipografía de GLIAX, con texto en `#213144`, cabecera en `#244e53`, acción en `#1a655c`, fondo en `#f3f8f6` y borde en `#cfddd9`. A la anchura del móvil, cada control ocupa una fila y el estímulo mantiene su orden de lectura.

- La navegación eligió automáticamente las siete pantallas del catálogo existente por edad, nivel y área. La rotación avanza al recibir el formato solicitado y reinicia al cambiar de perfil. El contrato `digital_family` de Edge se mantiene.
- El buscador permite filtrar los resultados del ejercicio, anuncia cuántos quedan y permite restaurarlos. Las entradas de agenda se abren y cierran con teclado y conservan la vista comparativa.
- Se observaron las siete presentaciones a 1.440, 834 y 390 px en Chromium. Dos recorridos de navegador usan Edge local y servicios de autenticación y persistencia simulados. Las pruebas cubren respuesta correcta, contraste de selección, navegación automática y controles de búsqueda, vídeo y agenda.
- Queda pendiente diseñar flujos propios de correo, gestor de archivos, formularios y reservas, y ampliar mensajería y calendario con contenidos revisados. Las pantallas existentes y los controles nuevos no constituyen evidencia de diversidad cognitiva adicional por sí solos.

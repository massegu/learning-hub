# Prototipos GLIAX R19.3

Frontend Design y GLIAX Development guiaron dos aplicaciones ficticias con controles que actúan sobre los datos entregados en el ejercicio. La interfaz conserva la tipografía de GLIAX. Paleta de las aplicaciones `#173a39`, `#435f5e`, `#c9ded8`, `#e8f3ee` y `#166458`.

- Agenda. Cabecera, intervalo y controles de semana, tira de días, cuadrícula horaria y detalle del evento. En móvil se mantiene la tira de días y se muestra la columna seleccionada.
- Lupa. Cabecera, consulta, filtros, lista ordenada de resultados y vista de la fuente. En escritorio la fuente se abre a la derecha. En móvil pasa debajo y recibe el foco.

| Criterio | Agenda | Lupa |
| --- | --- | --- |
| Fidelidad | Semana con siete días, franjas, bloques de eventos, navegación y regreso a la semana del ejercicio. | Consulta con envío explícito, fragmentos, filtros, contador, estado sin resultados y fuente consultable. |
| Distribución | La cuadrícula muestra la relación entre fechas y franjas. El detalle usa todo el ancho debajo de la semana. | Los resultados y el panel de lectura tienen jerarquías separadas. La vista móvil usa una columna. |
| Interacción | Se probaron la navegación entre semanas y la apertura con teclado. El evento revela su texto completo. | Se probaron consulta sin coincidencias, vaciado, filtro oficial y apertura de fuente con teclado. |
| Operación cognitiva | En una tarea de planificación se abrieron los eventos y se leyó el orden de recogida y entrega antes de resolver. | En una tarea de lectura se filtraron las fuentes y se abrió la agenda oficial antes de completar el lugar. |
| Accesibilidad | Controles con nombre, foco visible, estado del día y del evento y anuncio del detalle. | Búsqueda etiquetada, filtros con estado, resultados anunciados y foco en la fuente abierta. |
| Adaptación | Sin desbordamiento en ventanas de 1.440, 834 y 390 px en Chromium. | Sin desbordamiento en las mismas anchuras. |

Las fechas y franjas en Agenda son un encuadre ficticio común. Los enunciados y las soluciones conservan el contenido del ejercicio. Los filtros identifican las fuentes oficiales por el nombre presente en el estímulo. Las interacciones son locales en el navegador. La rotación automática sigue respetando edad, nivel y área, con el mismo contrato de Edge.

**Evaluación técnica:** ambos prototipos son aptos para revisión visual y funcional. Se usaron datos sintéticos en dos recorridos Chromium con Edge local y servicios de autenticación y persistencia simulados. Quedan pendientes revisión humana y lector de pantalla. La extensión a correo, mensajería, archivos, formularios y reservas queda para después de revisar estos prototipos.

| | Escritorio, ventana de 1.440 px | Móvil, ventana de 390 px |
| --- | --- | --- |
| Agenda | [Captura](capturas/agenda-escritorio.png) | [Captura](capturas/agenda-movil.png) |
| Lupa | [Captura](capturas/buscador-escritorio.png) | [Captura](capturas/buscador-movil.png) |

## Variantes estáticas e interactivas

La revisión posterior a los primeros prototipos añade una vista semanal de solo lectura para Agenda, resultados completos para Buscador y conversaciones con remitente y hora para Mensajería. Las versiones interactivas permiten explorar eventos, consultar fuentes y localizar mensajes. Correo incorpora bandeja y vista del adjunto, Archivos permite abrir y filtrar carpetas, Formularios valida un campo del ejercicio y Reservas filtra por estado y muestra las condiciones de cada opción. Las interfaces usan datos ficticios y respetan la identidad de GLIAX. Las vistas de correo y archivos se organizan en dos paneles en escritorio y en una columna en móvil.

Ocho casos digitales nuevos tienen operaciones distintas y se sirven mediante el contrato Edge 20 en los tramos y niveles para los que se redactaron. El catálogo 19 conserva sus casos. La selección evita repetir aplicación dentro de una celda cuando hay otra opción disponible. Ajusta la presentación según el caso y la exposición reciente por operación. Las tareas de recuerdo usan una vista estática y las acciones requeridas conservan presentación interactiva. El profesional mantiene el control del nivel. Quedan fuera de esta medición la diversidad de caso dentro de todas las aplicaciones, la adaptación longitudinal de simulaciones y la cobertura editorial de celdas sin casos nuevos. Estos ocho casos digitales cuentan por separado de la meta de las ocho familias cognitivas y ejecutivas.

El recorrido local autenticado por el simulador de Edge ejercitó la rotación hasta entregar Correo. Se probaron también los controles de las siete aplicaciones con el catálogo local y su presentación en ambas anchuras. Ninguna solicitud del navegador salió del entorno de prueba.

| Aplicación | Estática escritorio | Estática móvil | Interactiva escritorio | Interactiva móvil |
| --- | --- | --- | --- | --- |
| Agenda | [Ver](capturas-ampliacion/calendar-static-1440.png) | [Ver](capturas-ampliacion/calendar-static-390.png) | [Ver](capturas-ampliacion/calendar-interactive-1440.png) | [Ver](capturas-ampliacion/calendar-interactive-390.png) |
| Buscador | [Ver](capturas-ampliacion/search-static-1440.png) | [Ver](capturas-ampliacion/search-static-390.png) | [Ver](capturas-ampliacion/search-interactive-1440.png) | [Ver](capturas-ampliacion/search-interactive-390.png) |
| Mensajería | [Ver](capturas-ampliacion/chat-static-1440.png) | [Ver](capturas-ampliacion/chat-static-390.png) | [Ver](capturas-ampliacion/chat-interactive-1440.png) | [Ver](capturas-ampliacion/chat-interactive-390.png) |
| Correo | [Ver](capturas-ampliacion/mail-static-1440.png) | [Ver](capturas-ampliacion/mail-static-390.png) | [Ver](capturas-ampliacion/mail-interactive-1440.png) | [Ver](capturas-ampliacion/mail-interactive-390.png) |
| Archivos | [Ver](capturas-ampliacion/files-static-1440.png) | [Ver](capturas-ampliacion/files-static-390.png) | [Ver](capturas-ampliacion/files-interactive-1440.png) | [Ver](capturas-ampliacion/files-interactive-390.png) |
| Formularios | [Ver](capturas-ampliacion/form-static-1440.png) | [Ver](capturas-ampliacion/form-static-390.png) | [Ver](capturas-ampliacion/form-interactive-1440.png) | [Ver](capturas-ampliacion/form-interactive-390.png) |
| Reservas | [Ver](capturas-ampliacion/booking-static-1440.png) | [Ver](capturas-ampliacion/booking-static-390.png) | [Ver](capturas-ampliacion/booking-interactive-1440.png) | [Ver](capturas-ampliacion/booking-interactive-390.png) |

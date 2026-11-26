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

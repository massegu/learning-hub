# Especificación de mecánicas y progresión por edad

## Alcance y límites

La progresión de la pizarra cubre las rutas `early` (6–7), `junior` (8–10) y
`middle` (13–15), en coherencia con las decisiones revisadas. No define
equivalencias entre cursos ni una progresión común para Latinoamérica.
Los ejemplos son materiales ficticios y genéricos, no una alineación curricular
de ningún país. La adecuación debe contrastarse con profesionales y usuarios.
No cambian puntuaciones, criterios de evaluación ni fichas generadas.

## Extensión juvenil y decisión de disponibilidad

- La responsable ha decidido que la pizarra aparezca en toda la ruta `middle`
  (13–15). Su carga crece por nivel: 3, 4 y 5 tareas. La ruta también incluye
  edades 14 y 15; no se presenta como una mecánica exclusiva de 13 años.
- Para `middle` y `teen` (16–18) son apropiados como posibles contextos —a
  validar por actividad— las redes sociales, vídeos breves, creación digital,
  música urbana y otras referencias juveniles. No se presupone que todas las
  personas conozcan o usen una plataforma concreta; las consignas deben poder
  resolverse con la información proporcionada.
- El acento tipográfico hip-hop/graffiti se limita a etiquetas decorativas de
  área o familia en `middle` y `teen`. Las instrucciones, estímulos y respuestas
  mantienen una tipografía convencional de lectura clara. Se usan fuentes del
  sistema, sin cargar recursos externos ni aplicar texturas que reduzcan la
  legibilidad.

## Especificaciones

| Mecánica | 6–7 años (`early`) | 8–10 años (`junior`) | 13–15 años (`middle`) | Salvaguarda |
|---|---|---|---|---|
| Iconografía inspirada en BioArt | Ilustraciones locales originales y suaves para identificar áreas; el texto sigue nombrando cada área. | Mismo vocabulario visual, sin asumir intereses o conocimientos previos. | Se conserva como apoyo visual con rótulos textuales. | Inspiración formal, sin copiar recursos de BioArt. Iconos decorativos (`aria-hidden`); el rótulo textual es la etiqueta accesible. No se añaden recursos a DOCX. |
| Temas | Cuentos de animales, números, naturaleza, dibujo y música en tareas escolares cortas. | Cómic, relatos de animales, experimentos con semillas, problemas numéricos y proyectos de arte. | Referencias posibles a creación digital, vídeos breves, música urbana y temas juveniles, explicadas dentro de cada actividad. | Son ejemplos alternativos, no preferencias atribuidas a toda una edad. No dependen de marcas, país, currículo o experiencia con dispositivos. |
| Secuencia tipo carrusel | Una imagen visible cada vez, con indicador de posición. | El mismo formato visual para las secuencias ya existentes. | El formato se mantiene para las secuencias ya existentes; no cambia el ritmo de exposición. | Se conserva `sequenceStepMs`, duración de exposición, orden, tamaño y ubicación del estímulo. La nueva semántica solo ayuda a tecnologías de asistencia. |
| Pizarra de deberes, recuerdo | Nivel 1: 1 tarea; nivel 2: 2; nivel 3: 3. Pregunta literal por una tarea de un área nombrada. | Nivel 1: 2 tareas; nivel 2: 3; nivel 3: 4. Cada fila enlaza área y tarea; aparecen tema, ejercicios o página en textos breves. | Nivel 1: 3 tareas; nivel 2: 4; nivel 3: 5. Incluye Lengua, Matemáticas, Ciencias, Historia y Comunicación. | Memoria de la consigna, no resolución de ejercicios académicos. Respuesta copiada de la fila visible durante la exposición; opciones de longitud comparable. No se usa la nueva mecánica en exportaciones DOCX/ZIP. |

## Criterios de accesibilidad y revisión

- El icono nunca sustituye el nombre del área ni da pistas sobre la respuesta.
- La pizarra conserva una estructura tabular navegable, encabezados comprensibles
  y alternativas textuales. La secuencia anuncia número y descripción de cada
  diapositiva sin pausarla ni cambiar su tamaño.
- La redacción no presupone que una niña o niño conozca un libro, plataforma,
  deporte, artista o término curricular concreto.
- La graduación descrita es una especificación de carga de esta mecánica, no una
  afirmación de validez clínica ni de progresión uniforme dentro de cada grupo.
- Antes de incorporar vocabulario de asignaturas o temas locales, se necesita
  revisión por país y con profesionales; este cambio no localiza el contenido.

# GLIAX R19.2 - Auditoria cognitiva y especificacion de calidad

**Base auditada:** `massegu/learning-hub`, commit `be37c59b651526100958cf37ac984044cb00d4cb` (rama R19.1).  
**Estado:** documento de trabajo y auditoria estatica/ejecucion aislada. No supone implementacion ni validacion clinica/psicometrica.  
**Restriccion:** conservar R19.1, R18, staging, produccion, historiales y contratos anteriores.

## 1. Correccion de alcance expresamente acordada

- ELIMINAR la pestana/contenedor `Mira y actua` de la navegacion.
- ELIMINAR el ejercicio autonomo `Mira la barra y espera hasta que llegue al final` / `guidedWait` del banco de nuevas sesiones.
- CONSERVAR `Movimiento y pausa` como modalidad accesible directamente en Funciones ejecutivas.
- CONSERVAR `Actua con reglas`, accesible directamente, con ensayos de accion y no-accion. Ampliar su variedad de reglas y condiciones.
- CONSERVAR `Escucha y actua` como modalidad directa.
- CONSERVAR la lectura de historiales `guided_wait`, sin ofrecer nuevas actividades de ese tipo.
- NO retirar la temporizacion ni las pausas propias de `Movimiento y pausa`.

## 2. Inventario ejecutado sobre el codigo R19.1

Las cantidades siguientes se obtuvieron cargando los modulos JS leidos del commit en un interprete aislado y llamando a los generadores; no se modifico el repositorio.

| Fuente | Instancias recorridas | Verificaciones |
| --- | ---: | --- |
| `js/cognitive-families.js` | 450 | respuesta canonica aceptada por su corrector en familias puntuables, IDs y estructura de tareas |
| `js/curriculum.js` - Funciones ejecutivas, sin extension funcional | 3.414 | unicidad de IDs, opciones, permutaciones, `validatePlan`, `validateReview` |
| `js/functional-content.js` con `transfer-content.js` | 304 | `validate`, opciones y unicidad de contenido |
| `js/executed-tasks.js` - Funciones ejecutivas y Atencion | 180 | `validate` y `grade` con respuesta canonica |
| `js/curriculum.js` - Interactivas ejecutivas (tarjetas, movimientos, audio) | 288 | `validateInteraction`, correspondencia de respuestas simbolicas |
| `js/curriculum.js` - Busca objetos a tu alrededor (Atencion) | 96 | `validateInteraction` |
| **Total de instancias recorridas (fuentes separadas)** | **4.732** | Validacion de codigo y coherencia formal, no prueba neuropsicologica |

Nota: la produccion real combina fuentes, familias y filtros. Las cifras indican instancias recorridas por fuente, no necesariamente opciones simultaneamente visibles al usuario ni ejercicios semanticamente independientes.

### Incidencias estructurales confirmadas

| Defecto | Recuento |
| --- | ---: |
| `information`: datos relevantes situados primero | 120/120 |
| `contradiction`: valores discrepantes en la primera fila de ambas fuentes | 60/60 |
| `change`: alternativa correcta primera en el banco interno | 60/60 (la UI ordena alfabeticamente) |
| `change`: exactamente un paso sustituido | 60/60 |
| `guidedWait`: ejercicio autonomo que debe retirarse | 60 instancias |
| `executive_goal_change`: combinaciones visibles unicas entre instancias | 32/768 |
| `executive_planning`: combinaciones visibles unicas entre instancias | 53/180 |
| `executive_reasoning`: combinaciones visibles unicas entre instancias | 48/180 |
| `executive_complete_plan`: combinaciones visibles unicas entre instancias | 48/120 |

En `curriculum.js` se detectaron 1.275 repeticiones **exactas** de pregunta/estimulo/opciones/respuesta entre 3.414 instancias al ignorar IDs. Algunas son variantes entre franjas y niveles, pero no representan material diferente ante el alumno. En `cognitive-families.js`, 450 instancias tienen 270 contenidos distintos bajo el criterio de coincidencia exacta usado.

**Comprobaciones favorables:** 450 tareas cognitivas generadas sin rechazo de sus respuestas canonicas; 3.414 actividades de curriculum sin error en sus validaciones aplicables; 304 funcionales y 180 ejecutadas sin errores detectados con las pruebas descritas; 288 interactivas ejecutivas y 96 de entorno con contrato valido. El algoritmo de `Descubre quien` tambien se reconstruyo de forma independiente y en 60/60 casos termino con candidato unico.

**Limites:** `grade(item, item.answer)` prueba consistencia interna, no validez de la respuesta; los validadores comprueban invariantes de codigo, no ambiguidades semanticas; no se ha ejecutado Chromium, la entrega de Edge, localizacion, ni pruebas con alumnos en esta auditoria.

## 3. Catalogo tematico cerrado por edad

Cada familia usara al menos 12 escenarios contextuales propios por edad, repartidos entre los 3 niveles (no 12 reskins numericos).

### 6-7 anos (`early`)

- Mochila antes de salir al colegio.
- Preparar material para colorear.
- Encontrar la pieza que falta en un juego.
- Elegir una alternativa cuando una zona de juego no esta disponible.
- Repartir material entre companeros.
- Recordar dos o tres instrucciones consecutivas.
- Cambiar la rutina de una merienda por lluvia.
- Preparar ropa adecuada para una salida.
- Comparar un encargo ilustrado con el material preparado.
- Organizar la recogida de juguetes.
- Comprobar condiciones sencillas de un juego.
- Ayudar a cuidar una planta de clase.

### 8-10 anos (`junior`)

- Deberes y tiempo de juego.
- Preparacion de una excursion del colegio.
- Organizacion de un cumpleanos.
- Reglas de un juego de mesa.
- Quedar para una actividad extraescolar.
- Preparar una mochila de deporte.
- Gestionar material para una manualidad.
- Leer dos avisos del colegio.
- Organizar un pequeno proyecto de ciencias.
- Preparar un torneo de patio.
- Planificar un intercambio de libros.
- Buscar informacion necesaria para llegar a tiempo.

### 11-12 anos (`primary`)

- Compatibilizar deberes y extraescolares.
- Trabajo escolar en equipo.
- Cambio de horario de entrenamiento.
- Organizar un torneo de juegos de cartas o videojuegos.
- Comprar materiales con presupuesto limitado.
- Preparar una presentacion digital.
- Comparar versiones de instrucciones de clase.
- Organizar un proyecto de ciencias.
- Repartir tareas de un grupo.
- Resolver un imprevisto de transporte acompanado.
- Elegir una biblioteca o actividad con horario concreto.
- Verificar condiciones de una actividad online.

### 13-15 anos (`middle`)

- Planificar una salida con amistades.
- Elegir un transporte con hora limite.
- Coordinar un trabajo de grupo.
- Resolver un cambio de horario deportivo.
- Revisar normas de participacion en un concurso.
- Presupuesto para una actividad compartida.
- Organizar un podcast o video escolar.
- Evaluar informacion contradictoria en mensajes grupales.
- Preparar una ruta en bicicleta.
- Decidir prioridades ante varios compromisos.
- Revisar permisos antes de publicar imagenes.
- Comparar avisos con versiones y fechas.

### 16-18 anos (`teen`)

- Organizar una semana de examenes.
- Compatibilizar estudios y compromisos.
- Elegir itinerarios de transporte alternativos.
- Planificar una salida o viaje de grupo.
- Gestionar un presupuesto personal.
- Comparar requisitos de una actividad formativa.
- Revisar plazos de inscripcion.
- Organizar una entrega digital con dependencias.
- Coordinar una actividad deportiva o cultural.
- Valorar cambios de planes con varios recursos.
- Contrastar condiciones de una reserva.
- Gestionar un proyecto audiovisual, creativo o tecnologico.

No asumir acceso universal a tecnologia, transporte autonomo, presupuesto propio ni experiencias laborales; ofrecer alternativas y no usar esas circunstancias como marcador encubierto de habilidad cognitiva.

## 4. Arquitectura pedagogica de tres niveles

| Dimension | Nivel 1 | Nivel 2 | Nivel 3 |
| --- | --- | --- | --- |
| Reglas/condiciones | Una principal | Dos que interactuan | Multiples, con excepciones o cambios |
| Decisiones | Una directa | Dos encadenadas | Priorizar, comparar y justificar |
| Estrategias | Via simple | Alternativas previstas | Varias soluciones validas comprobables |
| Distractores | Claros | Plausibles | Cercanos a la solucion pero con restriccion violada |
| Ayudas | Explicitas | Opcionales | Opcionales, registradas |
| Registro | Resultado e intento | Plan y correcciones | Revision, justificacion y autonomia |

## 5. Plan de implementacion controlada

1. **QA de baseline:** integrar `auditar_banco_r192.cjs` como prueba reutilizable y generar informe completo por ID y mecanismo. Analizar alertas de patron, no silenciarlas.
2. **Retirada de espera guiada autonoma:** dejar de generar `guidedWait`, quitar `Mira y actua` como contenedor, preservar historiales; mantener `Movimiento y pausa`, `Actua con reglas`, `Escucha y actua` como botones directos.
3. **Diversificacion de reglas:** ampliar `symbols` con familias de reglas realmente distintas, conservando ensayos de accion/inhibicion y cambio de criterio. No contar variaciones de orden como nueva mecanica.
4. **Correcciones criticas:** `change`, `contradiction`, `information`, `executive_goal_change` y revision de planes. Mover pistas, aleatorizar posiciones de forma determinista, incluir alternativas plausibles y soluciones equivalentes cuando existan.
5. **Ampliacion por edad:** incorporar escenarios de catalogo con progresion cognitiva real; prueba automatica de cada instancia y revision humana de una muestra de cada familia/nivel/franja.
6. **Compatibilidad:** resultados historicos, perfiles, R18/R19/R19.1, autogeneracion, hojas imprimibles y accesibilidad. Validar tambien Edge donde reciba estos bancos.
7. **Revisión visual:** escritorio, tableta, movil y lector de pantalla; control de ejecucion en Staging solo con autorizacion separada.

**Criterio de salida:** cero errores formales o penalizaciones injustificadas confirmadas, sin atajos sistematicos por posicion, tres niveles con exigencias diferentes, catalogo por edad, y ejecucion automatizada integral verde. La meta 80/100 de rubrica es interna y no una validacion psicometrica.

## 6. Archivos funcionales que deben revisarse durante la correccion

- `index.html`: menu `Mira y actua` y controles directos.
- `js/app.js`: navegacion, `miraOpen`, familia `guidedWait`, renderizado de interacciones y resumenes.
- `js/modality-catalog.js`: modalidades ofertadas por edad y area.
- `js/cognitive-families.js`: retirada de `wait` y ampliacion/ajuste de familias cognitivas.
- `js/cognitive-renderer.js`: ruta de `guidedWait`, correccion y feedback.
- `js/curriculum.js`: interactivas `symbols`, `movement`, `auditory`; supervision, recursos, tiempo, prioridades y secuencias.
- `js/functional-content.js`, `js/transfer-content.js`, `js/executed-tasks.js`: contenido complementario.
- `js/progress-report.js`: historial de esperas y comparabilidad de metricas.
- Tests de banco, interfaz, Edge y empaquetado.

No ejecutar modificaciones sobre R19.1; realizar cambios unicamente en rama nueva y segura despues de verificar protecciones de preview.
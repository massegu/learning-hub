# GLIAX R19.2 — Calidad cognitiva
## Documento maestro de diseño pedagógico, generación, corrección y aceptación

**Versión:** 1.0 · 23 de noviembre de 2026  
**Estado:** especificación funcional para implementación controlada; no constituye validación psicométrica ni autorización de despliegue.  
**Referencia técnica de auditoría:** `massegu/learning-hub`, rama `feat/gliax-r19-1-math-sequencing`, SHA de referencia `be37c59b651526100958cf37ac984044cb00d4cb`.  
**Ámbito principal:** Cambio de plan (CP), Encuentra la contradicción (EC), ¿Qué necesitas saber? (IN) y Actúa con reglas (AR).  
**Entorno protegido:** Staging R18, producción, `main` y las ramas existentes. No modificar, fusionar, publicar ni ejecutar despliegues sin orden expresa.

## 0. Resumen ejecutivo y decisiones cerradas

R19.2 persigue **diversidad cognitiva auténtica**, progresión por mecanismos y edad, distractores plausibles, soluciones verificadas, flexibilidad de corrección y ampliación visual. No debe producir una ilusión de variedad cambiando nombres, números, fondos, iconos o posiciones sin modificar el problema cognitivo.

**Decisiones aceptadas en la conversación:**

- **CP-01 a CP-06:** sustituir por versiones breves y sencillas para 6–7 y 8–10 años; complejidad en el cambio de plan, no en la lectura.
- **CP-07 a CP-15:** conservar sus situaciones para 11–18 años; enriquecer distractores y criterios de corrección sin endurecer artificialmente la narración.
- **IN:** respuesta abierta primero, luego pista optativa y, si es necesario, alternativas. Separar espontaneidad, suficiencia, ayudas y respuesta no interpretable. Las 15 situaciones sirven de base; las fichas de este documento son propuestas editoriales revisables antes de su aprobación final.
- **EC:** mantener la diversidad de situaciones, pero distinguir contradicción real, compatibilidad, evidencia insuficiente e incumplimiento práctico para no mezclar constructos en las métricas.
- **AR:** seis mecánicas distintas: go/no-go, inversión, cambio de criterio, conjunción de dos condiciones, excepción y alternancia. Se conservan todas las respuestas de espera *integradas* en los ensayos go/no-go.
- **Interfaz:** eliminar el contenedor/etiqueta «Mira y actúa» y el ejercicio autónomo `guidedWait` («Mira la barra y espera...»); conservar **Movimiento y pausa**, **Actúa con reglas**, **Escucha y actúa**, sus controles relevantes, y los históricos `guided_wait`.
- **Visual:** reutilizar y ampliar la biblioteca local; sin tope artificial de iconos, sin duplicados ni costes recurrentes. Se aceptan nuevas licencias compatibles, documentadas.

**Fuera de alcance de esta entrega:** cambio de código, publicación, validación clínica/normativa, diagnóstico, decisiones automatizadas sobre pacientes, generación remota de arte no autorizada, y alteración de datos históricos.

## 1. Base observada y motivación

La auditoría ejecutó instancias reales de generadores del commit de referencia y encontró una diferencia importante entre el número total de actividades y su diversidad cognitiva real:

| Origen | Instancias inspeccionadas | Hallazgo ilustrativo |
|---|---:|---|
| `js/cognitive-families.js` | 450 | 60/60 tareas `change` modificaban solo un paso; 60 de `guidedWait` autónomas. |
| `js/curriculum.js`, banco ejecutivo aislado | 3.414 | `executive_goal_change`: 768 instancias, solo 32 contenidos visibles distintos en el inventario utilizado. |
| `js/functional-content.js` y transferencia | 304 | 158 contenidos visibles distintos en la comparación aplicada. |
| `js/executed-tasks.js` | 180 | 108 contenidos visibles distintos. |
| `js/curriculum.js`, modalidades interactivas ejecutivas | 288 | Repetición estructural en `symbols`; ocho variantes declaradas por edad y nivel. |
| `js/curriculum.js`, búsqueda interactiva de atención | 96 | Conservación y pruebas de regresión, sin rediseño en este alcance. |

**Límite de interpretación:** las huellas detectan repeticiones visibles o estructurales, pero no prueban equivalencia clínica ni validez de la respuesta. Los tests de contrato realizados no sustituyen una revisión de sentido. Los recuentos no equivalen al total de opciones simultáneas visibles al alumno.

## 2. Principios pedagógicos transversales

1. **Validez del proceso:** declarar para cada ítem el proceso principal y sus demandas secundarias; evitar que lectura, cálculo o familiaridad icónica dominen el desempeño salvo que sean constructos deliberados.
2. **Progresión real:** nivel 1 = una identificación/cambio; nivel 2 = relación/actualización; nivel 3 = condiciones, suficiencia, excepción o planificación genuina, con dificultad relativa a la edad.
3. **Edad:** 6–7: normalmente una o dos frases breves, 1–2 datos centrales, apoyo pictográfico y respuesta oral/selección. 8–10: dos o tres frases breves, hasta 2–3 datos relevantes y como máximo dos condiciones simultáneas de base. Son límites editoriales, no baremos clínicos ni restricciones absolutas.
4. **Distractores:** construir a partir de errores plausibles: mantener el plan inválido, resolver solo parte del objetivo, confundir requisito con preferencia, dato pertinente pero insuficiente o falta de actualización. Evitar respuestas ridículas o léxicamente desbalanceadas.
5. **Univocidad o apertura honesta:** jamás imponer una respuesta única donde varias satisfacen restricciones. Si no es posible automatizar corrección fiable, usar validación por componentes o estado pendiente.
6. **No filtración:** equilibrar posiciones y longitudes; no colocar siempre el dato relevante primero, ni ordenar fuentes para que la respuesta sea siempre la primera discrepancia.
7. **Metadatos explícitos:** `family`, `ageBand`, `level`, `mechanic`, `construct`, `constraints`, `requiredFacts`, `acceptedAnswers`, `errorTaxonomy`, `visualKeys`, `sourceVersion`, `gradingVersion`.
8. **Separar desempeño de apoyo:** distinguir acierto espontáneo, acierto con pista, reconocimiento entre alternativas y respuestas no interpretables. No derivar diagnósticos o gravedad de estas tareas.

## 3. Taxonomía de edad y complejidad

| Banda interna | Edad | Tratamiento editorial y visual |
|---|---|---|
| `early` | 6–7 | Tarjetas grandes, oralidad posible, una consigna por pantalla, pictogramas de objetos cotidianos. |
| `junior` | 8–10 | Dos o tres datos, situaciones escolares y de juego, tablas o tarjetas pequeñas. |
| `primary` | 11–12 | Colaboración, horarios, dependencias sencillas, elementos visuales funcionales. |
| `middle` | 13–15 | Autonomía creciente, movilidad, estudio, coordinación social y aplicaciones cotidianas. |
| `teen` | 16–18 | Reservas, solicitudes, costes, prioridades, incertidumbre, estética sobria. |

La interacción AR en la implementación R19.1 auditada se ofrece a `junior`, `primary`, `middle` y `teen`. **No se activa automáticamente en `early`.**

## 4. CAMBIO DE PLAN — especificación de la familia

**Constructo objetivo:** actualización de planes ante una condición nueva manteniendo el objetivo. Subtipos: sustitución de recurso, reordenación, dependencia, delegación, restricción temporal, inviabilidad y decisión bajo incertidumbre.

**Formas de respuesta:** selección única solo si existe una alternativa inequívoca; ordenamiento de acciones cuando las dependencias importan; validación de restricciones para varios planes; decisión justificada cuando hay incertidumbre. En las respuestas secuenciales, admitir **cualquier orden topológico válido**, no solo la secuencia redactada en la ficha.

### 4.1 Banco de referencia CP-01 a CP-15

| ID / edad / nivel | Situación y pregunta breve | Respuesta o condiciones de éxito | Error objetivo / nota |
|---|---|---|---|
| CP-01 · 6–7 · N1 | «Quieres pintar, pero no tienes pincel. Tienes una esponja. ¿Qué haces?» | Pintar con la esponja. | Sustituir un medio; distractor plausible: buscar otro instrumento que no consta disponible. |
| CP-02 · 6–7 · N2 | «La caja de los coches está llena. Hay otra caja vacía. ¿Cómo los guardas?» | Usar la caja vacía para los coches. | No persistir con un contenedor lleno ni abandonar la meta. |
| CP-03 · 6–7 · N3 | «Necesitas zapatillas y colores. La mochila está rota; una bolsa grande permite llevar ambos. ¿Qué haces?» | Guardar ambos en la bolsa grande. | Mantener dos requisitos; un objeto solo no basta. |
| CP-04 · 8–10 · N1 | Deberes previstos tras entrenamiento; hoy terminará tarde y existe tiempo antes de salir. | Hacer deberes antes de entrenar. | Reorganizar tiempo sin cancelar tareas. |
| CP-05 · 8–10 · N2 | Juego de jardín; llueve y hay que jugar dentro. | Elegir actividad realmente viable en interior. | Sustituir actividad manteniendo objetivo social; definir opciones concretas en render. |
| CP-06 · 8–10 · N3 | Cartel: colorear y escribir título; colores no disponibles hasta después; lápiz sí. | Escribir título primero y colorear después. | **Consigna debe permitir explícitamente cambiar el orden.** |
| CP-07 · 11–12 · N1 | Torneo con dos partidas; un jugador de la primera llega tarde; ambos de la segunda presentes. | Empezar por la partida con dos jugadores disponibles. | Intercambiar orden sin perder participantes. |
| CP-08 · 11–12 · N2 | Presentación grupal: responsable de imágenes ausente, entrega mañana. | Reasignar imágenes a alguien disponible; revisión tras finalizar elementos requeridos. | Confirmar que las imágenes son obligatorias y que hay capacidad para reasignarlas. |
| CP-09 · 11–12 · N3 | Actividad 17–18 no modificable; amigos 17:30–19 y pueden comenzar sin el alumno. | Ir a la actividad y luego al encuentro; participación de 18 a 19, salvo traslado explicitado. | No penalizar traslado no proporcionado. |
| CP-10 · 13–15 · N1 | Cine 18:15; persona llega 18:20; grupo puede entrar puntual. | Grupo entra; confirmar política de acceso tardío antes de asegurar incorporación. | Reconocer condición desconocida y no inventarla. |
| CP-11 · 13–15 · N2 | Temas, práctico dependiente del tema 2, dudas resolubles solo primera tarde. | Tema 2 antes del práctico; dudas primera tarde; resto flexible. | Valorar dependencias y ventana temporal, no orden único. |
| CP-12 · 13–15 · N3 | Llegar antes 18:00; bus con retraso llega 18:05; metro llega 17:45 pero cuesta 3 € y presupuesto 2,50 €; andando llega 18:05. | «Ninguna opción satisface simultáneamente hora y presupuesto». | No forzar opción inviable; conservar cifras y condición de llegada. |
| CP-13 · 16–18 · N1 | Solicitud antes 20:00; autorización falta; firmante se marcha 18:30. | Conseguir firma mientras está disponible, luego envío. | Ventana temporal y acción precondición. |
| CP-14 · 16–18 · N2 | Presentación jueves; ensayo con otra persona solo martes; diapositivas antes del ensayo; examen viernes. | Diapositivas antes de martes, ensayo martes, después estudio; otras distribuciones admisibles. | Planificación por dependencias. |
| CP-15 · 16–18 · N3 | Reserva conjunta: no reembolsable y alternativa cancelable 20 € más cara dentro del presupuesto; asistencia sin confirmar. | Comparar reservar flexible frente a esperar; **ambas pueden ser defendibles** con condiciones explícitas. | `reasoned_decision`; no imponer preferencia personal. |

### 4.2 Reglas de generación CP

- Definir primero `goal`, `initialPlan`, `disruption`, `availableResources`, `hardConstraints` y `candidatePlans`; generar el texto **después** de verificar resolubilidad.
- N1: modificar una acción/recurso; N2: relación entre dos acciones/restricciones; N3: conservar condiciones esenciales, identificar inviabilidad o dependencia (siempre adecuado a la edad).
- Nunca introducir un recurso salvador que no figure en el estímulo o en el repertorio gráfico. Las opciones inválidas deben violar **una condición identificable**.
- Calcular exhaustivamente `candidatePlans` cuando el espacio sea finito; etiquetar soluciones múltiples. Si no es viable, corregir mediante predicados de restricciones en lugar de comparar cadenas.
- Diseñar varios arquetipos semánticos, no solamente reemplazos de objetos: materiales, orden, disponibilidad, horario, coordinación, presupuesto, prioridades, cancelabilidad.
- Conservar los casos «ninguna opción cumple» y «varias opciones válidas» con proporciones controladas y documentadas, sin convertirlos en atajos.

### 4.3 Corrección y feedback CP

`single_choice` si se demuestra unicidad; `constraint_solver` para plan o secuencia; `reasoned_decision` para CP-15. Feedback centrado en la restricción incumplida («faltan las zapatillas», «el transporte llega después del plazo», «todavía no sabemos si hay plazas»). No calificar respuestas abiertas dudosas mediante similitud textual superficial.

## 5. ENCUENTRA LA CONTRADICCIÓN — especificación de la familia

**Constructo objetivo:** evaluar si dos representaciones de información son incompatibles, compatibles, inconcluyentes o si un plan viola un requisito. `constraint_mismatch` se reporta separadamente de la contradicción entre afirmaciones.

**Categorías internas:** `direct_conflict`, `inferred_conflict`, `compatible`, `insufficient_evidence`, `constraint_mismatch`. Diferenciar `update_over_time` como subtipo compatible con cambio temporal explícito.

### 5.1 Banco de referencia EC-01 a EC-15

| ID / edad / nivel | Evidencia y demanda | Clasificación y respuesta |
|---|---|---|
| EC-01 · 6–7 · N1 | Lista de tres lápices; caja contiene dos. «¿Está todo preparado?» | `constraint_mismatch`: falta uno; **no** contradicción lógica estricta. |
| EC-02 · 6–7 · N2 | Dos notas vigentes para el **mismo juego y día**: 11:00 frente a 12:00. | `direct_conflict`: horas incompatibles. |
| EC-03 · 6–7 · N3 | Botella azul llena; botella roja vacía. | `compatible`: sujetos distintos; ambas pueden ser verdad. |
| EC-04 · 8–10 · N1 | Dos avisos vigentes de **la misma salida**: 9:00 frente a 9:30. | `direct_conflict`: no coincide hora de salida. |
| EC-05 · 8–10 · N2 | Norma: máximo tres libros; préstamo de dos. | `constraint_mismatch` sin incumplimiento: cumple la norma. Analítica diferenciada. |
| EC-06 · 8–10 · N3 | 12 participantes, cuatro equipos de cuatro, nadie repetido. | `inferred_conflict`: hacen falta 16, faltan cuatro; facilitar apoyo visual para no medir solo multiplicación. |
| EC-07 · 11–12 · N1 | Entrega exigida en PDF; grupo planea enviar presentación sin convertir. | `constraint_mismatch`: plan incumple el formato. |
| EC-08 · 11–12 · N2 | Entrenamiento habitual miércoles; **esta semana** se traslada a jueves. | `compatible/update_over_time`: excepción explícita. |
| EC-09 · 11–12 · N3 | Informe A dice 100 ml; informe B 150 ml, sin constar si se trata de la misma prueba. | `insufficient_evidence`: falta identidad de la prueba. |
| EC-10 · 13–15 · N1 | Pedido: confirmación de envío gratis; cobro incluye 4 € de envío para **ese mismo pedido y condiciones**. | `direct_conflict` o incidencia de cumplimiento; se contradicen las condiciones declaradas y el cargo. |
| EC-11 · 13–15 · N2 | Mensaje lunes: sábado; actualización miércoles «finalmente domingo», mismo encuentro. | `compatible/update_over_time`: cambio posterior, no simultaneidad. |
| EC-12 · 13–15 · N3 | Aforo máximo 20 **incluyendo acompañantes**; 18 alumnos + 5 acompañantes confirmados; acceso simultáneo. | `inferred_conflict`: 23 > 20. |
| EC-13 · 16–18 · N1 | Dos comunicaciones declaradas vigentes para misma convocatoria: viernes 18:00 y 17:00. | `direct_conflict`: no se puede inferir cuál es el plazo correcto. |
| EC-14 · 16–18 · N2 | Tarifa A cancelación 48 h; tarifa B cancelación 24 h. | `compatible`: tarifas distintas. |
| EC-15 · 16–18 · N3 | Presupuesto máximo 350 €; 120+190+65 € obligatorios; afirmación de financiación total sin extra. | `inferred_conflict`: total 375 €, déficit 25 €. |

### 5.2 Reglas de generación EC

- Codificar explícitamente identidad del sujeto, fecha, ámbito, unidad, vigencia, fuente y relación temporal. Una diferencia solo implica contradicción si se refiere al **mismo hecho bajo condiciones equivalentes**.
- Incluir incompatibilidades directas, inferidas, compatibilidades por sujeto/tiempo/condiciones y evidencia insuficiente. Evitar que la mitad de las tarjetas señalen siempre el primer renglón.
- No hacer que «distinto» signifique siempre «incorrecto». Puede haber correcciones posteriores, normas generales con excepciones o afirmaciones sobre objetos diferentes.
- En 6–7 años sustituir etiquetas abstractas por preguntas concretas y pictogramas. En edades mayores pedir tipo de relación y evidencia o razón.
- Verificar los cálculos de conflictos inferidos y que todas las variables necesarias están explícitas; permitir apoyo gráfico cuando la aritmética contamine el objetivo.

### 5.3 Corrección y feedback EC

Dos componentes: (a) clasificación o resultado, (b) señalamiento del dato/condición que lo fundamenta. En N1 puede bastar el primero; en N2/N3 incorporar evidencia. Un error entre `compatible` y `insufficient_evidence` no se tratará igual que un fallo de detección directa. No mezclar automáticamente estos subtipos en una puntuación única de contradicción.

## 6. ¿QUÉ NECESITAS SABER? — especificación de la familia

**Constructo objetivo:** generar de forma autónoma las preguntas o datos necesarios para tomar una decisión y evaluar la suficiencia informativa. La elección múltiple es **ayuda**, no respuesta inicial.

### 6.1 Flujo de interacción obligatorio

1. **Presentar situación y pregunta abierta**, sin mostrar opciones ni pistas. Aceptar texto corto; oralidad cuando exista un mecanismo seguro y accesible; pictogramas/tarjetas para 6–7 años. Si no hay transcripción local fiable, la oralidad se registra mediante selección supervisada, sin fingir reconocimiento de voz.
2. **Capturar respuesta inicial íntegra**, aunque luego cambie. Ofrecer «Comprobar» y «Necesito una pista» sin forzar respuesta errónea para pedir ayuda.
3. **Pista gradual**, orientada al proceso sin dar la respuesta literal. Registrar la ayuda vista y cuándo se solicitó.
4. **Alternativas opcionales**, con información contextual pertinente, no absurdos. No alterar la pregunta o añadir hechos solo en las alternativas.
5. **Feedback específico** y, si procede, una transferencia breve; no castigar pedagógicamente pedir ayuda ni equiparar reconocimiento asistido y generación espontánea.

**Estados separados:** `sufficient`, `partial`, `insufficient`, `uninterpretable`; y `supportStage` = `none` / `hint` / `choices`. `uninterpretable` **no equivale a error**. Guardar `rawResponse`, versión de la rúbrica, clasificación, estado de revisión, ayudas y respuesta final según políticas de privacidad y minimización aplicables.

### 6.2 Fichas IN-01 a IN-15: preguntas, criterios, pistas y ayudas

**Nota editorial:** estas fichas concretan las situaciones conversadas. La equivalencia semántica y las opciones son hipótesis de diseño que deberán superar tests de negación, expresiones incompletas y revisión de profesionales.

| ID · edad · nivel | Pregunta abierta y criterio de suficiencia | Pista no resolutiva | Alternativas de apoyo: correcta / errores plausibles |
|---|---|---|---|
| IN-01 · 6–7 · N1 | Tres manzanas, una por niño. «¿Qué necesitas saber?» → cuántos niños recibirán manzana. | «Piensa en las personas que van a comer». | **Número de niños** / número de platos / si están lavadas. |
| IN-02 · 6–7 · N2 | Un pincel por niño. «¿Qué tienes que contar?» → niños **y** pinceles; uno solo = parcial. | «Compara dos grupos». | **Niños y pinceles** / niños y botes / pinceles y mesas. |
| IN-03 · 6–7 · N3 | Patio permitido solo abierto y sin lluvia; hoy no llueve. «¿Qué falta comprobar?» → si el patio está abierto ahora. | «Ya sabes una condición; queda otra». | **Si está abierto ahora** / si abrirá mañana / si hay otros niños. |
| IN-04 · 8–10 · N1 | Biblioteca cierra 18:00. «¿Qué falta saber para saber si llegas antes?» → hora de llegada. | «Sabes cuándo cierra». | **Hora de llegada** / hora de salida de casa / duración de la visita. |
| IN-05 · 8–10 · N2 | Cinco amigos, cuatro entradas. «¿Qué debes comprobar?» → que cada persona tenga entrada; reconocer que falta una. | «Piensa en lo que necesita cada persona». | **Una entrada por amigo** / cinco asientos libres / poder sentarse juntos. |
| IN-06 · 8–10 · N3 | Salida 16:30, entrenamiento 17:00. «¿Se sabe si llegas a tiempo? ¿Por qué?» → no, falta duración del trayecto. | «Entre salir y llegar pasa tiempo». | **No se sabe sin trayecto** / sí por salir media hora antes / sí si empieza puntual. |
| IN-07 · 11–12 · N1 | Clase termina 15:00, torneo 16:00. «¿Qué falta saber?» → tiempo para llegar desde clase. | «Considera el desplazamiento». | **Tiempo desde clase** / duración torneo / hora de salida desde casa sin conocer recorrido. |
| IN-08 · 11–12 · N2 | Trabajo grupal, dos apartados pendientes. «¿Qué necesitas para repartirlos?» → tareas pendientes y disponibilidad/capacidades de compañeros. | «Piensa en las tareas y en quién puede hacerlas» [revisar: demasiado reveladora; sustituir antes de producción por «¿Qué haría posible un reparto realista?»]. | **Qué falta y quién puede asumirlo** / quién trabajó antes / qué partes interesan más. |
| IN-09 · 11–12 · N3 | Actividad 8 €, dispones de 10 €, posible inscripción previa. «¿Puedes asegurar asistencia?» → no; confirmar requisito y posibilidad de inscripción. | «Poder pagar no garantiza participar». | **Comprobar inscripción** / sí por dinero suficiente / no por dinero insuficiente. |
| IN-10 · 13–15 · N1 | Sesión de cine con horario y precio conocidos. «¿Qué comprobar?» → disponibilidad de entradas en esa sesión. | «El precio no garantiza acceso». | **Plazas en esa sesión** / descuentos en otros cines / horarios alternativos. |
| IN-11 · 13–15 · N2 | Volver antes 21:00, presupuesto 3 €, bus o metro. «¿Qué datos necesitas?» → coste y llegada de ambos transportes. | «Hay dos límites que cumplir» [no nombrarlos explícitamente]. | **Precio y hora de llegada** / horario y recorrido sin coste / precio y preferencia del grupo. |
| IN-12 · 13–15 · N3 | Diapositivas listas; exigir fuentes y PDF. «¿Qué comprobar?» → fuentes **y** formato PDF; uno = parcial. | «Terminar no garantiza cumplir los requisitos». | **Fuentes y PDF** / fuentes y diseño uniforme / PDF e imágenes en todas las páginas. |
| IN-13 · 16–18 · N1 | Reserva dos noches, precio y fechas conocidos. «¿Qué falta?» → disponibilidad en ambas noches. | «El precio no garantiza la reserva». | **Disponibilidad las dos noches** / entrada temprana / tarifa alternativa. |
| IN-14 · 16–18 · N2 | Presupuesto limitado; espacio y materiales cuantificados, transporte desconocido. «¿Puedes asegurarlo?» → coste o cota máxima de transporte y comparación con margen disponible. | «Hay un componente que no has incorporado al total». | **Coste transporte y suma** / descuento materiales exclusivamente / reserva y disponibilidad. |
| IN-15 · 16–18 · N3 | Dos cursos mismo precio: uno materiales, otro más horas. «¿Qué saber para elegir?» → criterios pertinentes vinculados a objetivos, horarios, contenidos o modalidad; no hay preferencia universal. | «Piensa qué necesitas conseguir con el curso». | **Comparar contenidos, horarios y adecuación** / más horas siempre / materiales siempre. |

### 6.3 Equivalencias de respuesta y revisión

- **Suficiente:** todos los conceptos necesarios o, en decisiones abiertas, un criterio o conjunto de criterios pertinente y su vínculo explícito con la decisión, conforme a la ficha.
- **Parcial:** al menos un componente indispensable, pero no todos; por ejemplo IN-12 «revisar las fuentes» sin «PDF».
- **Insuficiente:** respuesta interpretable que no aporta el dato necesario; registrar tipo de error sin inferencias clínicas.
- **No interpretable:** ambigüedad, negación compleja, redacción fuera del vocabulario previsto o baja confianza del corrector; revisión humana/opción guiada, sin conversión automática a error.
- **Sin respuesta:** estado propio, no confundir con respuesta insuficiente. Se permite solicitar una pista sin escribir.
- Detectar negaciones y condicionales: «No hace falta saber la hora de llegada» **no** debe clasificarse como suficiente por contener las palabras «hora de llegada».
- Mantener un léxico de equivalencias por ítem, con ejemplos positivos, negativos y ambiguos; **no** usar coincidencia de palabras clave como único criterio de acierto.
- Evitar enviar respuestas de menores a servicios externos para su evaluación por defecto; revisar base legal, minimización, control de acceso y retención antes de almacenar texto libre u oralidad.

### 6.4 Progresión IN

N1 = identificar un dato; N2 = relacionar al menos dos datos o reconocer un conjunto suficiente; N3 = determinar suficiencia/insuficiencia, condiciones combinadas o criterios relevantes, con complejidad ajustada a edad. **Incluir también escenarios N3 donde ya están todos los datos**: no entrenar «siempre falta algo». Esta es una ampliación requerida para el banco generado, aunque no está representada todavía en las 15 fichas semilla.

## 7. ACTÚA CON REGLAS — seis mecánicas y doce configuraciones

**Constructos:** inhibición, mantenimiento, actualización, selección de criterio, excepción y alternancia. No equiparar automáticamente rendimiento a un índice clínico de «funciones ejecutivas».

### 7.1 Mecánicas

| ID | Mecánica | Estado interno y reglas |
|---|---|---|
| AR-01 | Responde o espera | Regla de go/no-go; estímulos go, no-go y clasificación por categoría. |
| AR-02 | Regla al revés | Señal de inversión; cambio persistente hasta la siguiente señal, cuando proceda. Señal ≠ ensayo. |
| AR-03 | Cambia de criterio | Señal activa color/forma u otro atributo; cambio explícito y ensayos incongruentes controlados. |
| AR-04 | Dos condiciones | Acción solo cuando se cumple una conjunción de atributos; respuestas alternativas según combinación. |
| AR-05 | La excepción | Regla por defecto y señal de veto con prioridad superior; ensayo con veto = no-go. |
| AR-06 | Alterna las reglas | Dos conjuntos completos y alternancia señalizada; distinguir errores posteriores al cambio. |

### 7.2 Configuraciones de referencia

| ID | Edad/nivel | Reglas y respuestas verificables |
|---|---|---|
| AR-07 | 8–10 / N1 | Animal = pulsar; objeto = esperar. Perro, lápiz, gato, libro, conejo → pulsar, esperar, pulsar, esperar, pulsar. |
| AR-08 | 8–10 / N2 | Círculo = pulsar; triángulo = esperar; señal ↔ invierte. Círculo, triángulo, ↔, círculo, triángulo → pulsar, esperar, **[sin respuesta a la señal]**, esperar, pulsar. |
| AR-09 | 8–10 / N3 | En modo color, rojo = pulsar; en modo forma, círculo = pulsar. Señales de modo independientes de ensayos; alternancia explícita. |
| AR-10 | 11–12 / N1 | Círculo = A; cuadrado = B; triángulo = esperar. ●, ■, ▲, ●, ■ → A, B, esperar, A, B. |
| AR-11 | 11–12 / N2 | Animal = A; animal con estrella = esperar; objeto = esperar. Gato, perro★, libro, conejo, gato★ → A, esperar, esperar, A, esperar. |
| AR-12 | 11–12 / N3 | Círculo rojo = A; cuadrado azul = B; otras combinaciones = esperar. CR, CA, QA, QR, CR → A, esperar, B, esperar, A. |
| AR-13 | 13–15 / N1 | Figura roja = A, azul = B; ignorar letra incongruente dentro. Rojo con «B» → A. |
| AR-14 | 13–15 / N2 | Modo color: rojo=A, azul=B; modo forma: círculo=A, cuadrado=B. Señal de modo antes de estímulo; no contar señal. |
| AR-15 | 13–15 / N3 | Rojo=A, azul=B; borde negro grueso = esperar, siempre. Rojo normal, azul con borde, azul normal, rojo con borde → A, esperar, B, esperar. |
| AR-16 | 16–18 / N1 | Dos criterios activos según modo; ignorar atributo irrelevante. Color/cuadrado rojo → A; forma/círculo azul → A. |
| AR-17 | 16–18 / N2 | Rojo=A, azul=B; ↔ invierte correspondencia persistentemente. Rojo, azul, ↔, rojo, azul, ↔, rojo → A, B, [sin ensayo], B, A, [sin ensayo], A. |
| AR-18 | 16–18 / N3 | Modo color/forma y veto por borde grueso. Color/círculo azul → B; forma/círculo rojo+borde → esperar; forma/cuadrado rojo → B; color/cuadrado rojo → A; color/círculo azul+borde → esperar. |

**Nota de corrección editorial:** no utilizar secuencias que mezclen una señal de cambio con un ensayo sin especificar que son eventos distintos. AR-08 y AR-17 muestran explícitamente la ausencia de respuesta ante el evento de cambio; algunas anotaciones tempranas de la conversación contaban solo respuestas, lo que podía inducir un desfase.

### 7.3 Edad, carga y validación de secuencias AR

- `junior` (8–10): instrucciones visuales breves, ejemplos de práctica, máximo dos criterios simples al alternar, sin forzar AR-06 compleja. AR-04 solo en N3 y con carga visual contenida.
- `primary` (11–12): dos asociaciones, excepciones, conjunción, alternancia simple N3.
- `middle` (13–15): distractores incongruentes, alternancia, excepción prioritaria.
- `teen` (16–18): conjuntos condicionales, inversión persistente, mezcla de cambio y veto.
- Desacoplar **velocidad** de complejidad de reglas; evitar que una reducción del tiempo sea la única variable de nivel.
- Cada ensayo contiene `stimulus`, `activeRule`, `expectedAction` derivada por evaluador determinista, `changeEvent`, `isNoGo`, `interferenceType` y `visualSet`.
- Prohibido crear secuencias triviales (go/no-go alternancia perfecta repetida, todos los cambios en misma posición, espera siempre al final). Controlar frecuencias y transiciones por configuración, sin exigir proporciones idénticas en todas las mecánicas.
- Métricas específicas: comisiones, omisiones, errores de regla, errores después de cambio, latencia descriptiva, uso de ayuda. No inferir directamente capacidad clínica ni comparar velocidades entre dispositivos sin normalización.

## 8. Biblioteca visual — inventario y ampliación

**Bibliotecas existentes comprobadas en el commit de referencia:** `js/stimulus-art.js` (114 claves, SVG y PNG local), `js/phosphor-art.js` (74 claves SVG/PNG), `js/complementary-art.js` (3 claves), `js/bioart-icons.js` (4 ilustraciones de área). **No sumar las cifras como conceptos únicos**: hay solapamientos. Las versiones PNG de la biblioteca principal se generan desde SVG mediante `scripts/render-stimulus-art.py` y se distribuyen en `js/stimulus-art-png.js`.

**Política:** ampliar sin techo numérico artificial. Propuesta inicial orientativa de 80–120 conceptos **solo si los necesitan los ejercicios**, no como cuota obligatoria. Deduplicar conceptos y conservar las licencias existentes, incluidos recursos externos empaquetados localmente.

**Ampliaciones prioritarias:** pincel, esponja, caja vacía/llena, bolsa de materiales, mochila dañada, cartel, colores, tarea pendiente/hecha, reserva confirmada/pendiente, aforo, entrada, disponibilidad, inscripción, reloj/cita, mensaje actualizado, cambio de norma, borde de veto, señal de inversión, iconos de información incompleta. Evaluar primero si ya hay claves equivalentes (`backpack`, `clock`, `ticket` en caso de existir en otro catálogo, etc.).

**Metadatos del catálogo:** `visualKey`, `concept`, `category`, `ageSuitability`, `renderers`, `license`, `sourceAttribution`, `semanticAliases`, `confusableWith`, `visualComplexity`, `printAvailable`, `colorIndependentCue`. Evitar que el mismo icono represente conceptos distintos entre actividades sin señalización.

**Reglas de uso:**

- Conservar consistencia visual **dentro de una partida**; variar tema o colección **entre partidas**. No cambiar arbitrariamente de pictograma a mitad de un ensayo de reglas.
- No basar información esencial únicamente en rojo/verde o en emojis dependientes del sistema; redundancia con forma/texto/borde y contraste suficiente.
- Igualar tamaño, fondo y detalle entre estímulos comparados; evitar que el único pictograma muy complejo sea siempre la respuesta correcta.
- Para `early`, ilustraciones grandes y objetos inequívocos; para `teen`, iconos funcionales sobrios, interfaces simuladas de calendario/mensajes/solicitudes.
- Asegurar representación local sin llamadas en tiempo real a proveedores de arte; disponer de alternativa textual accesible e impresión coherente.

## 9. Contratos de generador y criterios de diversidad

### 9.1 Generación determinista y trazable

Entrada recomendada: `seed`, `family`, `ageBand`, `level`, `mechanic`, `itemTemplateId`, `visualSet`. Salida: un ítem con el contrato actual compatible, `answerModel` independiente del orden de opciones y `explanationModel` vinculado a condiciones. Registrar `contentVersion` y `gradingVersion`.

**Regla central:** se rechaza cualquier ítem cuyo evaluador independiente identifique cero soluciones cuando se esperaba una, varias cuando se declaró única, o soluciones basadas en datos no declarados.

### 9.2 Diversidad semántica

Mantener dos huellas:

- `surfaceFingerprint`: texto, opciones, representación, estímulos y orden de presentación normalizados; detecta duplicación visible.
- `cognitiveFingerprint`: objetivos, regla o dependencia, número y tipo de restricciones, tipo de actualización, patrón de evidencia, estructura de respuesta y error objetivo; **ignora** cambios cosméticos como nombres e iconos.

**Criterio de aceptación por familia/edad/nivel:** no basta un elevado número de IDs. Debe existir cobertura de submecánicas, repartos por tipo de respuesta y suficiente diversidad cognitiva demostrable. Fijar umbrales numéricos una vez construido un inventario comparativo y revisado manualmente; no inventar un porcentaje de unicidad universal sin muestra representativa.

### 9.3 Distractores

Cada distractor declara `misconceptionCode` y `constraintViolated`. Debe ser razonable a primera vista y claramente incorrecto bajo la información dada. Ejecutar una segunda validación inversa: **¿podría ser correcto sin añadir datos?** Si sí, reformular o aceptar varias respuestas. Aleatorizar posiciones con semilla, evitando que longitud, presencia de cifras o expresión «todas las anteriores» filtren la correcta.

## 10. Sistema de corrección unificado y versionado

| Modo | Uso | Validación mínima |
|---|---|---|
| `single_choice` | Un resultado inequívoco | Igualdad con ID de respuesta correcta (no índice visual). |
| `multi_valid_choice` | Varias alternativas aceptables | Conjunto de respuestas válidas versionado. |
| `sequence_constraints` | Reordenación y dependencias | Verificar prerrequisitos y objetivo, admitir secuencias alternativas válidas. |
| `constraint_solver` | Planificación con costes/capacidades/horarios | Evaluar predicados y confirmar inviabilidad cuando corresponda. |
| `source_relation` | EC | Categoría y evidencia; distinguir incertidumbre y compatibilidad. |
| `open_concepts` | IN | Conceptos necesarios, relación correcta, negación, parcialidad e incertidumbre de clasificación. |
| `trial_state_machine` | AR | Estado de regla en cada ensayo, evento de cambio y acción esperada. |
| `reasoned_decision` | CP-15 e IN-15 | Componentes explícitos y criterios de revisión; no una respuesta arbitraria. |

**Invariante:** `gradedCorrect` no se asigna sobre una respuesta `uninterpretable`. Históricos y resultados previos conservan su significado original; guardar versiones para cualquier nueva métrica.

## 11. Pruebas de aceptación — puerta de calidad R19.2

### 11.1 Tests automáticos de contrato y contenido

| ID | Test | Esperado |
|---|---|---|
| T01 | Generar todos los ítems por edad, nivel, familia y semilla representativa. | Sin errores de contrato, IDs únicos en su ámbito, recursos presentes. |
| T02 | Recalcular respuesta mediante un evaluador independiente del constructor. | Coincidencia exacta en todos los ítems cerrados; si falla, bloquear. |
| T03 | Invertir aleatoriamente opciones y comparar resultado. | El ID correcto permanece estable y su posición cambia; no depende del primer elemento. |
| T04 | Análisis inverso de cada distractor bajo restricciones. | Ningún distractor accidentalmente válido, excepto modelos `multi_valid_choice`. |
| T05 | Auditar todas las secuencias CP con dependencias. | Aceptar cualquier orden viable; rechazar incumplimientos reales. |
| T06 | Casos CP-12 de inviabilidad. | Ninguna ruta forzada como correcta; reconocer «ninguna opción». |
| T07 | Casos EC mismo sujeto/tiempo vs sujetos/tiempos distintos. | Clasificación coherente con evidencia explícita. |
| T08 | Casos EC-09 incertidumbre. | No imponer contradicción sin identidad de prueba. |
| T09 | IN equivalencias de paráfrasis, respuestas parciales y negaciones. | Suficiente/parcial/no suficiente/no interpretable según componentes y significado. |
| T10 | IN sin respuesta → pista → alternativas. | Ayudas opcionales, estados y respuestas inicial/final separados. |
| T11 | IN nivel 3 con datos completos. | El sistema admite «no falta información» como solución cuando proceda. |
| T12 | AR inversión y señales. | Evento de cambio no contado; estado persistente y acción esperada exacta. |
| T13 | AR excepción/veto. | Excepción prevalece, incluso si regla ordinaria indica actuar. |
| T14 | AR no-go y omisión. | Diferenciar espera correcta, comisión, omisión y error de botón. |
| T15 | Equivalencia visual SVG/PNG y recursos. | Claves resueltas, impresión sin arte ausente, textos alternativos. |
| T16 | Huellas de diversidad visible y cognitiva. | Informe de duplicados y cobertura por edad/nivel; bloquear duplicados no autorizados. |
| T17 | Límites editoriales `early`/`junior`. | Excepciones justificadas y revisión de textos excesivos. |
| T18 | Aleatorización reproducible con semillas fijas. | Misma semilla = mismo ejercicio; semillas distintas no alteran respuestas válidas. |

### 11.2 Tests manuales de interfaz y regresión

| ID | Prueba | Esperado |
|---|---|---|
| U01 | Pantalla de funciones ejecutivas. | No existe contenedor «Mira y actúa»; botones directos para Movimiento y pausa, Actúa con reglas y Escucha y actúa. |
| U02 | Catálogo de ejercicios. | `guidedWait` autónomo no se genera, selecciona ni recomienda. |
| U03 | Movimiento y pausa. | Temporizadores/barras propios permanecen operativos; observaciones y métricas preservadas. |
| U04 | Actúa con reglas. | Ensayos de esperar/no responder siguen presentes y se miden correctamente. |
| U05 | Escucha y actúa. | Sigue accesible y funcional. |
| U06 | Historial previo `guided_wait`. | Registros y resúmenes anteriores se consultan sin pérdida ni reinterpretación. |
| U07 | IN antes de pedir ayuda. | No se ven alternativas; soporte opcional, no punitivo. |
| U08 | IN texto/oralidad/selección asistida. | Ninguna modalidad presupone transcripción automática inexistente; entrada accesible. |
| U09 | Edad 6–7/8–10 en escritorio y móvil. | Consignas legibles, pictogramas accesibles, baja carga verbal. |
| U10 | Edades 13–18. | Material sobrio, relevante y no infantilizante. |
| U11 | Render impresión/exportación cuando aplique. | Significado del ejercicio y pictogramas conservados. |
| U12 | Regresión R19.1 matemáticas/secuenciación. | Funciones existentes preservadas, sin cambios colaterales. |

### 11.3 QA pedagógico y aceptación

Revisar una muestra estratificada por familia × edad × nivel × mecánica, incluyendo casos extremos y ambiguos. Rúbrica editorial ponderada: validez de constructo 25 %, progresión 20 %, adecuación de edad 20 %, resistencia a atajos 15 %, distractores/ambigüedad 10 %, corrección/feedback 10 %. Escala 0–4 por criterio; objetivo operativo **≥80/100 sin fallos críticos**, *no* indicador psicométrico. Registrar discrepancias entre revisores y evidencias; no declarar un ejercicio validado solo porque pasa tests de software.

**Bloqueantes críticos:** respuesta errónea, otra solución correcta no aceptada, respuesta abierta no interpretable calificada como fallo, nivel/edad manifiestamente inadecuado, dato indispensable no mostrado, cambio AR mal contado, pérdida de historial, despliegue no autorizado.

## 12. Implementación por fases y archivos de referencia

**Fase 0 — inventario y aislamiento.** Verificar SHA y ramas; crear rama nueva solo con autorización; exportar inventario de generadores y tests base. No tocar Staging/producción. Revisar `js/cognitive-families.js`, `js/curriculum.js`, `js/functional-content.js`, `js/executed-tasks.js`, `js/transfer-content.js`, `js/activity-model.js`.

**Fase 1 — infraestructura.** Registro de plantillas y constructos, `gradingVersion`, evaluadores independientes, fingerprints y pruebas deterministas; sin ampliar aún números de tareas.

**Fase 2 — CP/EC.** Migrar fichas semilla, introducir corrección por restricciones, relaciones de fuentes y arquetipos. Mantener los contextos aceptados para CP-07 a CP-15.

**Fase 3 — IN abierta.** Interfaz de respuesta inicial, pista y alternativas; reconocimiento conservador por conceptos y revisión; validación especial de accesibilidad y privacidad.

**Fase 4 — AR.** Implementar seis mecánicas, pruebas de estado y métricas versionadas; conservar modalidades movement/auditory.

**Fase 5 — visual y navegación.** Reutilizar `js/stimulus-art.js`, `js/stimulus-art-png.js`, `js/phosphor-art.js`, `js/complementary-art.js`, `js/bioart-icons.js`. Revisar generación de PNG, licencias, `index.html`, `js/app.js`, `js/cognitive-renderer.js`, `js/modality-catalog.js`, `js/progress-report.js`.

**Fase 6 — QA y entrega.** Ejecutar pruebas, inventario, revisión visual, auditoría semántica y reporte de fallos. Proporcionar diff, archivos modificados, SHA local, tests y bloqueantes. **No push, PR, merge, GitHub Actions, previews ni despliegues sin autorización expresa.**

## 13. Contrato del encargo a Codex

> Implementar GLIAX R19.2 únicamente conforme a este documento maestro y al commit de referencia verificado. Preservar las mejoras matemáticas y de secuenciación R19.1. Separar mejoras pedagógicas de cambios de navegación. No deducir una respuesta única cuando la especificación admite varias. No usar servicios externos ni modelos de pago para corregir respuestas abiertas. Crear evaluadores independientes y tests T01–T18, U01–U12. Registrar resultados y excepciones. En caso de ambigüedad pedagógica, documentar el caso y dejarlo bloqueado para revisión; no improvisar criterios. No modificar ramas protegidas, ni publicar, ni desplegar. Entregar un informe con cobertura de mecanismos, duplicación cognitiva, test y estado de cada hito.

Este texto es un **contrato técnico preliminar**, no una autorización para ejecutar ni publicar cambios. Antes de lanzarlo conviene comprobar que la rama y SHA elegidos continúan siendo el punto de partida deseado.

## 14. Registro de decisiones abiertas

| Tema | Estado | Resolución requerida antes de producción |
|---|---|---|
| Respuestas orales 6–10 | Por definir técnicamente | Selección supervisada vs grabación/transcripción; privacidad y accesibilidad. |
| Corrector abierto IN | Diseño definido, validación pendiente | Conjunto de respuestas de prueba, negaciones, incertidumbre y revisión humana. |
| Fichas IN | 15 ejemplos concretados | Revisión editorial final de pistas demasiado reveladoras (especialmente IN-08, IN-11). |
| Subtipos EC | Diseño definido | Decidir presentación visible de `constraint_mismatch` y forma de informes. |
| CP-15/IN-15 | Evaluación por criterios | Formalizar rúbrica y cuándo solicitar revisión. |
| Biblioteca visual | Inventariada, ampliación propuesta | Deduplicación, licencia/atribución y selección efectiva de nuevos recursos. |
| Métricas AR | Definidas conceptualmente | Compatibilidad de esquema e informes históricos. |
| Umbrales de diversidad | No fijados numéricamente | Establecer tras medir inventario y revisar huellas cognitivas. |
| Validación con usuarios | No realizada | Estudio de usabilidad y adecuación a edad; no confundir con validación clínica. |

## 15. Criterio final para declarar R19.2 lista

Una versión solo puede pasar a revisión de lanzamiento si: (1) todos los tests críticos pasan; (2) las cuatro familias tienen mecanismos, corrección y contenido auditados; (3) los ejercicios de menor edad son accesibles; (4) la diversidad cognitiva está documentada; (5) la biblioteca visual no deja imágenes ausentes; (6) el historial y las tres modalidades preservadas funcionan; (7) los problemas no interpretables de texto libre se gestionan sin atribuir errores indebidos; y (8) la persona responsable autoriza expresamente cualquier push, integración o despliegue.

---

**Control documental:** documento consolidado a partir de las decisiones pedagógicas de R19.2 y de la auditoría previa del repositorio. Las fichas y criterios son especificaciones de diseño, no instrumentos normativos ni resultados validados. Se recomienda versionar este maestro junto a las futuras decisiones de aceptación.
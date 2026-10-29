# Fase 1: calidad del contenido

Base: `0bdda2e65c2aba752186fb0453dd011d3af0fe08`. Rama: `improve/content-quality-functional`.

Inventarios sintéticos reproducibles: [antes](content-quality-before.json), [después](content-quality-after.json). Los ejemplos completos por edad, dominio y familia están en el campo `examples` del inventario.

- Áreas/franjas auditadas: 44. Por debajo de ocho familias: 18 → 0.
- Repeticiones consecutivas de familia: 226 → 0, en 1.584 entregas por versión.
- Familias sin clasificación: 0 actividades.
- Combinaciones familia/franja con menos de dos contextos reconocidos: 216. Este requisito sigue pendiente de revisión editorial.

## Método y alcance

Cada ejecución parte de la misma semilla 73. El catálogo incluye bancos públicos y 80 muestras de la fábrica por nivel/foco. Se eliminan duplicados exactos de pregunta, fuente y respuesta; IDs y distractores no añaden variedad. `activities` cuenta entradas por nivel; `exactVisibleActivities` elimina además las repeticiones entre niveles y `unchangedAcrossLevels` identifica contenido que no progresa. El mínimo se aplica a operaciones, no a ese volumen. La exposición simula 12 entregas en cada nivel, conservando historial entre L1/L2/L3. 6–7 usa su selector local real; las demás franjas, el selector del backend sobre el catálogo obtenido. No es una estimación del tráfico de producción. Los focos exclusivos de fotografías, documentos y gestos pueden contener menos familias; no se fuerza a salir del foco elegido.

No se cuentan tickets, folletos y menús como operaciones distintas cuando solo se busca un dato. Las comparaciones de colores, figuras y objetos pertenecen a la misma familia. No se han eliminado los documentos o imágenes existentes.

## Selección antes/después

Antes se equilibraban identificadores de mecánica, que podían corresponder solo al formato. Ahora se añade el historial de familia, manteniendo las ventanas de fuentes recientes. En el backend una repetición consecutiva suma 60.000 puntos de penalización y cada aparición en las últimas 24 añade 5.000, con un tope de 30.000 para esa frecuencia. Una fuente reciente conserva una penalización de al menos 100.000; por ello todavía puede haber repeticiones de familia cuando evitar una fuente repetida tiene prioridad. Continúan las penalizaciones previas de mecánica reciente (10.000), mecánica usada en el lote (5.000), frecuencia (100) y formato de lectura (20.000). No son probabilidades normalizadas.

El selector de 6–7 evita las dos familias más recientes cuando hay opciones y equilibra la frecuencia de las últimas 12, manteniendo los pesos editoriales existentes. Los candidatos funcionales tienen peso 1. En el generador general se reserva una oportunidad del 30% para el nuevo banco cuando existe y el foco lo permite; el selector y la validación deciden la entrega final. En los bancos compartidos también se incluyen estos candidatos, así que el 30% no equivale a exposición final. Los JSON muestran peso en catálogo y exposición simulada por familia.

| Edad | Dominio | Familias antes → después | Repeticiones antes → después | Máxima cuota en una sesión después |
|---|---|---:|---:|---:|
| 6–7 | social | 8 → 10 | 10 → 0 | 33% |
| 6–7 | language | 7 → 8 | 0 → 0 | 33% |
| 6–7 | division | 5 → 8 | 0 → 0 | 25% |
| 6–7 | reading | 2 → 8 | 0 → 0 | 25% |
| 6–7 | attention | 5 → 8 | 1 → 0 | 25% |
| 6–7 | executive | 4 → 8 | 7 → 0 | 33% |
| 6–7 | memory | 6 → 8 | 1 → 0 | 33% |
| 6–7 | speedReasoning | 5 → 8 | 11 → 0 | 17% |
| 8–10 | social | 5 → 9 | 1 → 0 | 17% |
| 8–10 | language | 10 → 10 | 8 → 0 | 17% |
| 8–10 | division | 6 → 8 | 1 → 0 | 17% |
| 8–10 | reading | 9 → 13 | 3 → 0 | 42% |
| 8–10 | attention | 8 → 8 | 17 → 0 | 25% |
| 8–10 | executive | 8 → 8 | 4 → 0 | 25% |
| 8–10 | memory | 8 → 8 | 0 → 0 | 17% |
| 8–10 | speedReasoning | 11 → 11 | 7 → 0 | 17% |
| 10–12 | social | 5 → 10 | 9 → 0 | 25% |
| 10–12 | geometry | 4 → 8 | 2 → 0 | 17% |
| 10–12 | language | 10 → 10 | 7 → 0 | 17% |
| 10–12 | division | 6 → 8 | 1 → 0 | 17% |
| 10–12 | english | 4 → 9 | 2 → 0 | 17% |
| 10–12 | literacy | 16 → 16 | 4 → 0 | 42% |
| 10–12 | attention | 8 → 8 | 26 → 0 | 25% |
| 10–12 | executive | 8 → 8 | 5 → 0 | 25% |
| 10–12 | memory | 9 → 9 | 0 → 0 | 17% |
| 10–12 | speedReasoning | 11 → 11 | 6 → 0 | 17% |
| 13–15 | social | 4 → 9 | 11 → 0 | 25% |
| 13–15 | middleLanguage | 10 → 10 | 7 → 0 | 25% |
| 13–15 | middleMath | 6 → 8 | 0 → 0 | 17% |
| 13–15 | english | 4 → 9 | 2 → 0 | 17% |
| 13–15 | literacy | 18 → 18 | 2 → 0 | 42% |
| 13–15 | attention | 8 → 8 | 22 → 0 | 25% |
| 13–15 | executive | 8 → 8 | 2 → 0 | 25% |
| 13–15 | memory | 9 → 9 | 1 → 0 | 25% |
| 13–15 | speedReasoning | 11 → 11 | 7 → 0 | 17% |
| 16–18 | teenLanguage | 10 → 10 | 4 → 0 | 17% |
| 16–18 | teenMath | 6 → 8 | 2 → 0 | 17% |
| 16–18 | social | 10 → 10 | 4 → 0 | 17% |
| 16–18 | english | 0 → 9 | 0 → 0 | 11% |
| 16–18 | literacy | 16 → 16 | 6 → 0 | 50% |
| 16–18 | attention | 9 → 9 | 17 → 0 | 25% |
| 16–18 | executive | 8 → 8 | 1 → 0 | 25% |
| 16–18 | memory | 9 → 9 | 0 → 0 | 17% |
| 16–18 | speedReasoning | 11 → 11 | 5 → 0 | 17% |

## Familias incorporadas y reclasificadas

Operaciones nuevas en las franjas que las necesitaban: valor del dinero, lectura de medidas, orden numérico, simetría, perímetro, propiedades y caras de cuerpos, propósito de notas, comparación de fuentes, hechos/opiniones, instrucciones, cronología, decisiones con condiciones, recursos, cambio de plan, tiempo disponible, recuerdo reciente e inverso, claves y traducción de símbolos, secuencias de instrucciones en inglés y contextos sociales de convivencia.

No se retiran ejercicios por cambiar la taxonomía. Se retiran del recuento ficticio los subtipos de documentos y los cambios superficiales de formato. Se descartaron variantes nuevas con fuente idéntica aunque declarasen otro contexto.

## Matriz de dificultad

Esta matriz describe los ejes presentes; no implica que todas las familias aumenten en todos los niveles. El inventario enumera los niveles disponibles por familia y los ejemplos contienen la carga observada.

| Dominio | L1 | L2 | L3 |
|---|---|---|---|
| Lenguaje | Frases concretas, concordancia y forma básica | Orden y relaciones entre partes; referencias | Relaciones temporales, conectores y revisión contextual |
| Lectura/escritura | Dato y propósito explícitos | Relacionar condiciones y fuentes | Evidencia, inferencia y límites de una conclusión |
| Matemáticas | Cantidades pequeñas y operación directa | Unidades y lectura desde un origen distinto de cero | Relaciones y operaciones encadenadas según edad |
| Geometría | Identificar propiedades y contornos | Relacionar medidas y posiciones | Ángulos, área y relaciones espaciales según familia |
| Atención | Modelo/objetivo explícito | Mayor carga de distractores o dos condiciones | Cruce de datos y condiciones según el material |
| Memoria | Menor cantidad de elementos; exposición según la mecánica | Más elementos; selección de la parte reciente donde corresponde | Orden inverso y manipulación; carga reducida en las nuevas tareas de 6–7 |
| Funciones ejecutivas | Dependencia o condición concreta | Varias restricciones y comprobación | Actualización, recursos y supervisión según edad |
| Velocidad | Comparación o clave corta | Más consultas/distractores | Traducción ordenada, reglas y claves cruzadas donde corresponda |
| Social Lab | Pistas expresadas y situaciones concretas | Acuerdos, reparación y puntos de vista | Incertidumbre y permisos limitados en mayores; 6–7 conserva pistas concretas |
| English Lab | Vocabulario y mensajes directos | Contrastes, referencias y varios pasos | Condiciones, actualización de mensajes y evidencia |

Los nuevos ejemplos de medida cambian el origen, la traducción de claves pasa de uno a dos símbolos y el recuerdo inverso de 6–7 se limita a tres elementos en L3. No hay adaptación automática nueva ni inferencias sobre capacidades del usuario.

## Ejemplo por franja y dominio

| Edad | Dominio | Familia | Pregunta |
|---|---|---|---|
| 6–7 | social | social.boundary | ¿Qué respeta su petición? |
| 6–7 | language | language.context_meaning | ¿Qué significa «seco» en esta frase? |
| 6–7 | division | math.order | ¿Qué número queda en medio al ordenarlos? |
| 6–7 | reading | reading.literal | ¿Qué piezas pone abajo? |
| 6–7 | attention | attention.exact_match | Mira el modelo. ¿Cuál es igual? |
| 6–7 | executive | executive.resume | ¿Qué paso toca ahora? |
| 6–7 | memory | memory.spatial | Mira dónde está cada imagen. Después taparemos el cuadro. |
| 6–7 | speedReasoning | speed.translation | Cambia cada figura por su letra. Mantén el orden. |
| 8–10 | social | social.perspective | ¿Qué sabe Nora con seguridad? |
| 8–10 | language | language.connectors | Completa con el enlace que conserva la relación entre las ideas. |
| 8–10 | division | math.missing_value | ¿Qué número hace verdadera la igualdad? |
| 8–10 | reading | reading.inference | ¿Por qué usan hojas del mismo tamaño? |
| 8–10 | attention | attention.visual_changes | Marca el objeto que cambia de roja a verde. |
| 8–10 | executive | executive.resources | ¿Qué opción cumple todas las condiciones? |
| 8–10 | memory | memory.serial | Mira la secuencia. Después repetirás el orden. |
| 8–10 | speedReasoning | speed.translation | Traduce todos los códigos en el orden mostrado. |
| 10–12 | social | social.cooperation | ¿Qué acuerdo permite colaborar? |
| 10–12 | geometry | geometry.symmetry | Un punto está a 4 cuadros a la izquierda del espejo. ¿Dónde queda su reflejo? |
| 10–12 | language | language.agreement | Elige el verbo que completa la frase. Fíjate en cómo empieza. |
| 10–12 | division | math.data | ¿Cuál es la puntuación más alta? |
| 10–12 | english | english.location | Where are the scissors? |
| 10–12 | literacy | reading.document_purpose | ¿Para qué sirve esta tarjeta? |
| 10–12 | attention | attention.position | ¿Qué aparece justo después del segundo objeto? |
| 10–12 | executive | executive.conditions | El grupo eligió el paquete C. ¿Es correcta la decisión? |
| 10–12 | memory | memory.serial | Mira la secuencia. Después repetirás el orden. |
| 10–12 | speedReasoning | speed.pairs | ¿Cuántas parejas son exactamente iguales? |
| 13–15 | social | social.emotion | ¿Qué pista te dice cómo se siente? |
| 13–15 | middleLanguage | language.agreement | Completa con el verbo que concuerda con el sujeto. |
| 13–15 | middleMath | math.equations | ¿Qué valor de x hace verdadera la igualdad? |
| 13–15 | english | english.connector | Choose the connector for the stated relationship. |
| 13–15 | literacy | reading.document_purpose | ¿A quién se dirige este folleto? |
| 13–15 | attention | attention.visual_changes | Marca el objeto que cambia de roja a morada. |
| 13–15 | executive | executive.time | ¿Cabe el plan completo en el tiempo disponible? |
| 13–15 | memory | memory.scene | Observa la imagen. Después desaparecerá y responderás una pregunta. |
| 13–15 | speedReasoning | speed.search | ¿Cuántas veces aparece △? |
| 16–18 | teenLanguage | language.sentence_order | Ordena los fragmentos para formar una frase. Sigue el orden de las pistas. |
| 16–18 | teenMath | math.probability | ¿Qué fracción expresa la probabilidad de sacar una ficha roja? |
| 16–18 | social | social.context | ¿Qué dos hechos conviene distinguir? |
| 16–18 | english | english.time | How many minutes early are you? |
| 16–18 | literacy | reading.document_purpose | ¿Cuál es la novedad principal del correo? |
| 16–18 | attention | attention.document_lookup | ¿A qué temperatura hay que precalentar el horno? |
| 16–18 | executive | executive.conditions | ¿Qué paquete se puede enviar? |
| 16–18 | memory | memory.scene | Observa la imagen. Después desaparecerá y responderás una pregunta. |
| 16–18 | speedReasoning | speed.match | ¿Qué opción es idéntica al modelo? |

## Comprobaciones y revisión visual

La suite de Node, las nueve pruebas Python, los 14 recorridos de navegador existentes y el recorrido adicional de contenido se ejecutan antes de subir la rama. El recorrido nuevo comprueba selección local de 6–7, inglés de 16–18, corrección, ancho de 390 px y fuente coincidente en DOCX. Las capturas usan perfiles ficticios y el backend local de esta rama.

[Atención 6–7 en móvil](../review-assets/content-quality/early-attention-mobile.png) · [English Lab 16–18](../review-assets/content-quality/teen-english-desktop.png)

## Límites y revisión pendiente

- El mínimo de ocho familias se comprueba sobre los tres niveles y los focos del dominio, no en cada nivel ni en cada pestaña. El objetivo deseable de 12–15 no se alcanza en todas las áreas.
- Varias familias nuevas mantienen la misma fuente entre niveles: orden de frases, lectura concreta, tareas sociales de casa y planificación básica de 6–7. La selección no las presenta como una fuente nueva por cambiar el nivel. Falta graduarlas con más situaciones antes de afirmar una progresión completa.
- La cobertura de contextos usa reglas conservadoras sobre la fuente y etiquetas editoriales. Una etiqueta distinta no prueba transferencia; requiere revisión humana. Las familias abstractas no se cuentan como varios contextos.
- Los near-duplicates son grupos de revisión, no errores automáticos: dos preguntas distintas pueden compartir una fuente legítimamente.
- La evidencia canónica impide cambiar la fuente o la respuesta de las tareas nuevas y los validadores existentes continúan activos. Esto no demuestra por sí solo que todo distractor legacy sea plausible o que toda pregunta de inferencia admita una única interpretación.
- Los avisos de carga lectora del inventario deben revisarse editorialmente; no se han elevado los umbrales para esconderlos.
- Se mantienen Calma, Impulso, iconos, fotos y documentos. No se añade telemetría, nuevas tablas ni motor adaptativo.
- No publicar ni fusionar automáticamente. La revisión en Cloudflare requiere una vista previa de esta rama y backend compatible; las pruebas locales no acreditan un despliegue remoto.

## Reproducción

```sh
node scripts/audit-content-quality.js --ref 0bdda2e65c2aba752186fb0453dd011d3af0fe08 --output docs/audits/content-quality-before.json
node scripts/audit-content-quality.js --output docs/audits/content-quality-after.json
node scripts/report-content-quality.js
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
python tests/browser-content-quality.py
```

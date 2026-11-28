# GLIAX R19.4 — Contratos cognitivos y criterios de aceptación (preparación editorial)

Estado: especificación de trabajo; casos existentes **no aprobados automáticamente**. No autoriza despliegue ni cambios de datos.

## Principios aprobados
- Profesional controla el nivel; GLIAX solo recomienda, no lo cambia.
- Repetición accidental evitada por cobertura persistente del perfil; repetición deliberada permitida con motivo.
- En 6–7 años, consignas orales, soporte visual y lenguaje natural. No simplificar de manera artificial el razonamiento.
- Paleta infantil y adolescente: fucsia, amarillo, coral, azul y violeta; interfaces profesionales diferenciadas.
- Lectura autónoma en texto no simulado: lector opcional colorea **palabras completas**, no sílabas por ahora. Sin manipular capturas, periódicos o mensajes simulados.
- Conservar Memoria y Social Lab; no introducir regresiones.

## Contratos de las tres modalidades corregidas

### Adivina la regla — inferencia inductiva
Entrada: ejemplos positivos y negativos, inicialmente ambiguos entre varias hipótesis. No mostrar regla verdadera ni una explicación equivalente.
Interacción: seleccionar hipótesis, pedir nuevos ejemplos discriminativos, revisarla y clasificar un estímulo de transferencia inédito. La respuesta se explica únicamente al finalizar.
Nivel 1: un atributo. Nivel 2: conjunción de atributos. Nivel 3: disyunción (o extensión controlada a excepciones, tras revisión).
Criterios invalidantes: única hipótesis evidente al iniciar; muestra de transferencia repetida; hipótesis que explica igual de bien todos los estímulos; texto que revela la solución.
Registro: ejemplos presentados, hipótesis inicial/final, revisiones y transferencia; no equiparar ayuda con fallo.

### Mira y Actúa — aplicación e inhibición
Entrada: regla explícita. Ensayos de respuesta, espera real, alternancia/inversión y señales de cambio según nivel.
Interacción: pulsar A/B o Responder dentro de un intervalo fijo; **no pulsar** es la respuesta cuando procede esperar. No botón para 'Esperar' ni 'Siguiente estímulo' durante los ensayos. La señal de cambio puede permitir Continuar.
Tiempo: misma barra neutra para cualquier estímulo, sin pista sobre la respuesta. Interrupción cancela intento sin puntuar.
Registro: comisiones, omisiones, aciertos y errores tras cambio; interpretar únicamente como indicadores de esta tarea, no diagnósticos.
Nota de QA: comprobar accesibilidad de tiempos, teclado, pausas, colores, señales y dispositivos táctiles con pruebas reales.

### Ordenar instrucciones — secuenciar sin solución anticipada
Subtipo A: secuencia cotidiana; mostrar meta y tarjetas desordenadas, nunca lista de relaciones que reconstruya literalmente el orden.
Subtipo B: planificación con restricciones; mostrar únicamente aquellas condiciones imprescindibles para que el problema sea resoluble. Puede haber múltiples órdenes correctos.
La corrección debe comprobar dependencias, no igualdad con una única muestra de respuesta. No introducir una lista de requisitos que ya enumere toda la solución.
No mezclar con Supervisión: esta última exige detectar y explicar omisiones, inclusiones incorrectas o fallos de procedimiento.

## Taxonomía editorial transversal
Cada caso debe registrar caseId, familyId, subfamilyId, mechanismId, structureId, semanticClusterId, contextId, ageBands, levels, languageDemand, presentationType, responseType, answerModel, validationStatus y contentVersion.

Prioridades:
1. **Supervisión:** nivel 1 puede incluir pistas explícitas; nivel 2 exige comparar meta y ejecución sin decir cuál es la omisión; nivel 3 integra varios requisitos o comprobaciones, incluyendo casos correctos.
2. **Encuentra la contradicción:** EC-MAT (imposibilidad material), EC-NOR (norma explícita), EC-OBS (obstáculo), EC-TEM (tiempo), EC-INF (información incompatible), EC-REC (recursos insuficientes), EC-LOG (restricciones lógicas). En niveles superiores añadir propuestas de resolución justificadas. Una decisión poco recomendable no equivale por sí misma a una contradicción.
3. **¿Qué necesitas saber?:** respuestas equivalentes, abierta o selección según nivel, con estado 'no interpretable' diferente de 'incorrecta'.
4. **Busca el símbolo sin pareja:** debe haber parejas efectivas y un elemento sin pareja; no confundirlo con contar triángulos.
5. **Ordenar instrucciones:** eliminar pistas que entregan el orden y aceptar órdenes equivalentes.
6. **Lenguaje 6–7:** instrucción formulada sobre la acción: '¿Dónde se cuenta lo que dicen los dos?' para identificación de información; '¿Qué eliges para que se cumpla lo que dicen los dos?' para selección que satisfaga ambas indicaciones. No son frases intercambiables.

## Reglas de revisión editorial (bloqueos de publicación)
- Respuesta inequívoca o conjunto completo de alternativas válidas.
- Datos suficientes y ausencia de pistas involuntarias.
- Consigna natural apropiada para la edad y la modalidad.
- Distractores plausibles sin ser arbitrariamente absurdos.
- Independencia de información cultural no presentada.
- Contrato cognitivo coincidente con la tarea mostrada.
- Metadatos de grupo semántico revisados para evitar falsa diversidad.

## Planificador antirrepetición
Se implementa inicialmente como función pura `js/gliax-r194-scheduler.js`, **no conectada a usuarios todavía**.
- Filtra candidatos elegibles y validados en el adaptador llamador.
- Prioriza grupos semánticos no vistos, luego casos no vistos; ante agotamiento devuelve `coverage_exhausted`, nunca repite silenciosamente.
- Revisión planificada solo con `reinforcement`, `spaced_review` o `transfer` y caso previamente expuesto.
- Devuelve `unclassifiedClusters` para evidenciar casos que aún carecen de metadatos editoriales: sin ellos no se puede certificar diversidad semántica.
- Historial de exposiciones **persistente por perfil** es un requisito pendiente de diseño, seguridad, idempotencia, sincronización entre dispositivos y borrado. No guardar en Supabase ni en almacenamiento del navegador sin validar aislamiento y política de conservación.
- Registrar exposición cuando el estímulo sea realmente visible, aunque no se conteste; mantener desempeño por separado.

## Puertas de aceptación antes de Staging
1. Tests puros generador y planificador; pruebas existentes actualizadas; mirrors de cliente y Edge iguales.
2. Navegador: 6–7, 8–10, 11–12, 13–15, 16–18; teclado y táctil; móvil y escritorio.
3. Revisar individualmente las modalidades afectadas, no solo tests de humo.
4. Protección de Memoria, Social Lab y Lectura; comparación visual con R19.3.
5. Base de datos: nueva migración solo tras auditoría de esquema/RLS, plan de reversión y autorización explícita.
6. Sin cambios en main, desarrollo, proyectos Supabase alojados ni Cloudflare Pages hasta aprobación.

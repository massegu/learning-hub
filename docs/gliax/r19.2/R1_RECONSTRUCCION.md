# GLIAX R19.2 · Reconstrucción R1

La base de recuperación verificada es `a8bfad688afb50664b2ef77d97b259657f3d8582`. El SHA `3c841ef9` que figura como baseline en el protocolo corresponde al commit anterior que incorporó la especificación. R19.1 está en la ascendencia mediante `be37c59`.

## Arquitectura y compatibilidad

La auditoría de partida recorrió 4.892 instancias. Detectó sesgos de posición heredados en Cambio de plan (60), ¿Qué necesitas saber? (120) y Encuentra la contradicción (60). Los bancos anteriores, la espera guiada histórica y los contratos de entrega permanecen en sus rutas de R19.1 durante R1. La reconstrucción de los casos de referencia usa un módulo independiente para integrarlos posteriormente sin reinterpretar los históricos.

`js/gliax-r192.js` proporciona identidad canónica, semilla, orden de opciones reproducible, versiones de contenido y corrección, y huellas distintas para la presentación y la estructura pedagógica. Las huellas son identificadores para auditar diversidad, sin finalidad criptográfica. La corrección por opción usa identificadores estables. Un resultado parcial, no interpretable o pendiente de revisión no recibe una puntuación binaria. El evento construye una lista cerrada de campos y no incluye texto libre, semilla ni identificadores de cuenta o perfil. R1 no conecta estos eventos a almacenamiento.

## Cambio de plan

CP01–CP15 conservan las combinaciones de edad y nivel del documento maestro. CP08 ofrece dos reasignaciones viables con disponibilidad y revisión explícitas. CP11 y CP14 corrigen cualquier orden completo que cumpla sus dependencias y ventanas. CP12 compara hora y presupuesto en unidades enteras y permite declarar inviabilidad. CP15 admite ambos cursos de acción si se justifican mediante sus componentes. El texto sin interpretación fiable queda pendiente. Las etiquetas de los planes se separan del modelo de corrección y las opciones no tienen posición canónica visible.

## Encuentra la contradicción

EC01–EC15 distinguen incumplimiento, cumplimiento, afirmaciones incompatibles, compatibilidad, actualización temporal e información insuficiente. EC10 admite las dos lecturas previstas. En N2 y N3 se pide la evidencia además de la relación. Los totales y diferencias de los conflictos inferidos se calculan al corregir y quedan fuera de las opciones, con apoyo visual de cantidades para EC01 y EC06.

## ¿Qué necesitas saber?

IN01–IN15 incluyen pregunta abierta, pista opcional y alternativas. IN-06 complete-data conserva el contexto de IN06 y aporta un trayecto de 20 minutos para probar el caso de datos completos exigido por la especificación. Se aceptan expresiones completas revisadas y se distinguen respuestas suficientes, parciales, insuficientes, no interpretables y ausentes. La respuesta espontánea es de solo lectura tras el primer intento o la primera ayuda y vive en la sesión en memoria. El resumen y el evento excluyen el texto; la elección asistida queda diferenciada del intento espontáneo. El modo oral supervisado está indicado para edades tempranas, pendiente de implementación en interfaz.

## Actúa con reglas

AR07–AR18 separan señales y ensayos y evalúan seis mecánicas a partir de reglas, criterios activos, inversión y veto. Las señales no se puntúan, incluso si se les asigna una respuesta. Las métricas de espera y comisión solo aparecen si el caso realmente exige actuar y abstenerse. AR se reserva a partir de 8 años. Las secuencias de referencia permanecen fijas y se preservan como material de auditoría, incluida la alternancia corta prescrita en AR07. En las configuraciones con ejemplos incompletos se explicitaron secuencias mínimas que respetan las reglas y los estímulos documentados. La generación de secuencias nuevas con controles de patrón se deja para la fase posterior.

## Inventario y salida hacia R2

El registro `js/gliax-r192-bank.js` expone `getCaseIds()`, `getCase(id, seed)` y `gradeCase(item, response)` para CP (15), EC (15), IN (16) y AR (12). Las sesiones con ayudas usan `startInformation`. El registro funciona como módulo Node o como scripts clásicos precargados en orden de dependencia. El modelo de respuesta queda fuera de `presentation`. El registro no se conecta al selector, al historial, a la navegación ni a la función Edge durante R1.

Las pruebas verifican inventario, edades y niveles, soluciones y alternativas, orden de opciones/filas, cálculos ocultos, reproducibilidad, señales sin puntuación, compatibilidad R19.1 y minimización del evento en un entorno sin almacenamiento ni red. El detalle editorial de la antigua fase 2.1 no aparece como fuente separada en la rama recuperada. Se usaron las correcciones explícitas del maestro y su auditoría. La equivalencia con el código histórico perdido, la adecuación con usuarios y la revisión de estímulos en la interfaz quedan fuera de la evidencia de estas pruebas.

### Checkpoints comprobados en GitHub

| Bloque | SHA remoto verificado | Pruebas al publicar |
|---|---|---|
| Arquitectura | `05afa078d8384afddcce23d938b33ede976137c0` | 7, con regresión de matemáticas R19.1 |
| CP | `077ba9db39f0a7eab3a955667bfcbbba0c357a32` | 6, incluidos los planes alternativos y la inviabilidad |
| EC | `c733dbbcdbd17d6cc3badce64315cad7e131b8dd` | 5, incluidas las relaciones y la evidencia |
| IN | `6fb0b3bd90cb0e70c05b0c60a9e174bacc9458f7` | 6, incluido el flujo espontáneo y asistido |
| AR | `71075ece5ca11d4de5117fe9c7c5a2bb264854c3` | 11, incluida la regresión de las familias R19.1 |

El checkpoint del registro ejecuta 33 pruebas. Incluye los 58 casos, la regresión R19/R19.1, el paquete Edge existente y el flujo de texto libre en memoria. El SHA de este checkpoint figura en el registro de verificación del respaldo.

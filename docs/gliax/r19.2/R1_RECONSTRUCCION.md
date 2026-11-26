# GLIAX R19.2 · Reconstrucción R1

Base de recuperación verificada: `a8bfad688afb50664b2ef77d97b259657f3d8582`. El SHA `3c841ef9` que figura como baseline en el protocolo corresponde al commit anterior que incorporó la especificación. R19.1 está en la ascendencia mediante `be37c59`.

## Arquitectura y compatibilidad

La auditoría de partida recorrió 4.892 instancias. Detectó sesgos de posición heredados en Cambio de plan (60), ¿Qué necesitas saber? (120) y Encuentra la contradicción (60). Los bancos anteriores, la espera guiada histórica y los contratos de entrega permanecen en sus rutas de R19.1 durante R1. La reconstrucción de los casos de referencia usa un módulo independiente para integrarlos posteriormente sin reinterpretar los históricos.

`js/gliax-r192.js` proporciona identidad canónica, semilla, orden de opciones reproducible, versiones de contenido y corrección, y huellas distintas para la presentación y la estructura pedagógica. Las huellas son identificadores para auditar diversidad, sin finalidad criptográfica. La corrección por opción usa identificadores estables. Un resultado parcial, no interpretable o pendiente de revisión no recibe una puntuación binaria. El evento construye una lista cerrada de campos y no incluye texto libre, semilla ni identificadores de cuenta o perfil. R1 no conecta estos eventos a almacenamiento.

## Cambio de plan

CP01–CP15 conservan las combinaciones de edad y nivel del documento maestro. CP08 ofrece dos reasignaciones viables con disponibilidad y revisión explícitas. CP11 y CP14 corrigen cualquier orden completo que cumpla sus dependencias y ventanas. CP12 compara hora y presupuesto en unidades enteras y permite declarar inviabilidad. CP15 admite ambos cursos de acción si se justifican mediante sus componentes. El texto sin interpretación fiable queda pendiente. Las etiquetas de los planes se separan del modelo de corrección y las opciones no tienen posición canónica visible.

## Encuentra la contradicción

EC01–EC15 distinguen incumplimiento, cumplimiento, afirmaciones incompatibles, compatibilidad, actualización temporal e información insuficiente. EC10 admite las dos lecturas previstas. En N2 y N3 se pide la evidencia además de la relación. Los totales y diferencias de los conflictos inferidos se calculan al corregir y quedan fuera de las opciones, con apoyo visual de cantidades para EC01 y EC06.

## ¿Qué necesitas saber?

IN01–IN15 incluyen pregunta abierta, pista opcional y alternativas. IN-06 complete-data conserva el contexto de IN06 y aporta un trayecto de 20 minutos para probar el caso de datos completos exigido por la especificación. Se aceptan expresiones completas revisadas y se distinguen respuestas suficientes, parciales, insuficientes, no interpretables y ausentes. La respuesta espontánea es de solo lectura tras el primer intento o la primera ayuda y vive en la sesión en memoria. El resumen y el evento excluyen el texto; la elección asistida queda diferenciada del intento espontáneo. El modo oral supervisado está indicado para edades tempranas, pendiente de implementación en interfaz.

# GLIAX R19.2 · Reconstrucción R1

Base de recuperación verificada: `a8bfad688afb50664b2ef77d97b259657f3d8582`. El SHA `3c841ef9` que figura como baseline en el protocolo corresponde al commit anterior que incorporó la especificación. R19.1 está en la ascendencia mediante `be37c59`.

## Arquitectura y compatibilidad

La auditoría de partida recorrió 4.892 instancias. Detectó sesgos de posición heredados en Cambio de plan (60), ¿Qué necesitas saber? (120) y Encuentra la contradicción (60). Los bancos anteriores, la espera guiada histórica y los contratos de entrega permanecen en sus rutas de R19.1 durante R1. La reconstrucción de los casos de referencia usa un módulo independiente para integrarlos posteriormente sin reinterpretar los históricos.

`js/gliax-r192.js` proporciona identidad canónica, semilla, orden de opciones reproducible, versiones de contenido y corrección, y huellas distintas para la presentación y la estructura pedagógica. Las huellas son identificadores para auditar diversidad, sin finalidad criptográfica. La corrección por opción usa identificadores estables. Un resultado parcial, no interpretable o pendiente de revisión no recibe una puntuación binaria. El evento construye una lista cerrada de campos y no incluye texto libre, semilla ni identificadores de cuenta o perfil. R1 no conecta estos eventos a almacenamiento.

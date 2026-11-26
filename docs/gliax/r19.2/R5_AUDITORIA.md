# GLIAX R19.2 · Auditoría R5

Base R4 comprobada en GitHub `ad874bb3c0b209a723031640408f408125366f2c`. La práctica R19.2 es de QA y funciona en memoria. La evaluación de la interfaz se realiza localmente con datos sintéticos.

## Hallazgos corregidos

| Prioridad | Clase | Hallazgo y corrección |
| --- | --- | --- |
| P1 | Implementación y edición | CP14 y su uso en planificación R2 podían rechazar un orden compatible con lo mostrado. Se explicitan las dos dependencias ya documentadas. CP04 aclara que el tiempo posterior no basta. |
| P1 | Implementación | EC08 y EC11 se referían a posiciones que podían cambiar al barajar. Ahora identifican el mensaje por su fecha o alcance. En EC02, EC08 y EC11 el dato contextual pertinente puede acompañar las dos evidencias necesarias. |
| P2 | Implementación | Un envío vacío de IN podía ocupar el primer intento. Se captura el primer texto interpretable o no interpretable que se introduzca, y el uso previo de ayuda sigue siendo distinguible. |
| P2 | Edición | Se admiten fórmulas claras adicionales de IN01, IN03 e IN04. La negación o una formulación no revisada se mantiene sin calificación automática. |
| P2 | Edición | El generador de prioridades transcribía la respuesta en el contexto. El momento de la recogida permite inferir la prioridad sin indicar la opción. |
| P2 | Interfaz | Comprobar sin selección no indicaba qué faltaba. Se avisa en una región de estado y se mueve el foco al primer control aplicable sin calificar el intento. |
| P2 | Accesibilidad | La pista desactivaba el control enfocado y los cambios de ronda podían dejar el foco fuera de la tarjeta. Se devuelve el foco a la entrada con una descripción de la pista, se enfoca la consigna al abrir una ronda y se asocia el feedback con Siguiente. |
| P2 | Feedback | Una respuesta incorrecta recibe una instrucción breve específica de la familia después de responder. IN distingue una respuesta parcial de una que no puede interpretar. |

La revisión de criterios afecta solo a seis casos y se identifica como `r19.2-r1.2` en esos casos. Las modalidades históricas conservan sus contratos y métricas.

### Bloqueo de Staging identificado por lectura

La Edge v5 de Staging está `ACTIVE` con JWT obligatorio. El inventario de su exportación ESZIP 2.3 consultada mediante Management API carece de `math-sequencing.js`. El módulo compilado de entrada carece del parámetro `math_problem_version` y no implementa el contrato v2 de Resolución de problemas. El frontend exige ese contrato. El worker Edge de R19.1 del repositorio sí lo implementa. Una publicación del frontend por sí sola dejaría ese recorrido sin soporte. La comprobación no ejecutó la función alojada y no consumió cuota.

La primera ejecución de Python encontró una expectativa desactualizada de 21 archivos Edge frente a los 28 que ya contiene R19.1. También faltaban el directorio local de trabajo y el SDK archivado. Tras preparar esas dependencias, dos pruebas todavía usaban un SHA fijo ajeno a la revisión auditada. Las pruebas ahora fijan el HEAD real del checkout y siguen verificando que el frontend de origen coincida. Con el SDK 2.119.2 y su licencia local, pasaron las 32 pruebas. El código Edge y las herramientas operativas de publicación conservaron sus archivos.

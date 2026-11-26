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

La revisión de criterios afecta solo a seis casos y se identifica como `r19.2-r1.2` en esos casos. Las modalidades históricas conservan sus contratos y métricas.

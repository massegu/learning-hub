# Ampliación editorial de R19.3

Primera entrega integrada de **5 casos de Encuentra la contradicción**, con tres opciones, feedback propio y solución comprobada por reglas. Se conservan los 58 identificadores históricos. Quedan 495 casos de la meta inicial. Los ocho casos de Correo, Archivos, Formularios y Reservas pertenecen al catálogo digital y se contabilizan por separado.

| ID | Edad | Nivel | Operación que distingue el caso |
| --- | --- | --- | --- |
| EC193-01 | 6–7 | 1 | Implicación en un sentido. Una regla cuando se cierra la puerta no restringe el caso abierto. |
| EC193-02 | 8–10 | 2 | Intersección de tres disponibilidades. Coincidir de dos en dos no satisface una reunión común. |
| EC193-03 | 11–12 | 2 | Compatibilidad de márgenes con un extremo incluido y compartido. |
| EC193-04 | 13–15 | 2 | Ciclo de precedencia entre tres instrucciones aunque cada instrucción aislada sea ejecutable. |
| EC193-05 | 16–18 | 3 | Paridad tras tres cambios. El número exacto inicial no es necesario. |

Las preguntas exigen evidencia de las fuentes en niveles 2 y 3. La opción correcta con evidencia incompleta queda como respuesta parcial. La corrección se comprueba con los cinco tipos de razonamiento, sin depender de la posición de una alternativa. Se verificaron las soluciones, distractores, feedback y exposición de los casos. Estas pruebas acreditan verificación técnica y dejan pendiente la revisión humana de lectura y dificultad.

[Inventario por edad, nivel y familia](INVENTARIO-EDITORIAL.json). El campo `technicalApproval` corresponde a la proporción de casos nuevos incorporados con pruebas técnicas, expresada en porcentaje. Las celdas sin nuevos casos llevan valor vacío. Los mecanismos y estructuras cuentan por celda, sin sumar variantes de presentación como mecanismos nuevos.

`node tools/gliax-r193/editorial-inventory.cjs` reproduce la comparación. Con 119 transiciones en cada una de las cinco celdas, las repeticiones consecutivas de caso, mecanismo y estructura bajaron de 595 de 595 a 0 de 595. Las celdas con un solo candidato pasaron de 51 a 46. Cada celda ampliada tiene dos casos y conserva una secuencia limitada. La interfaz indica esa limitación.

## Correcciones asociadas

Se distinguieron las modalidades históricas de ordenar instrucciones y responder a símbolos de las modalidades R19.2. El flujo visual de comparación usa estímulos gráficos en A y B. El contrato de Edge para comparaciones en palabras sigue disponible para clientes anteriores. Los controles de Matemáticas por pasos conservan un área táctil de 44 px y se adaptan al contenido.

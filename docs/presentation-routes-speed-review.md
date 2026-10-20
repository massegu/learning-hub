# Presentación, rutas graduadas y tiempos de velocidad

## Resultado

- Los párrafos de los estímulos ocupan el ancho interior del cuadro, también en Lectura + Escritura. Se elimina la restricción de 72 caracteres que dejaba espacio vacío.
- Recibo, factura y catálogo conservan un título y sustituyen el subtítulo repetido por campos de referencia, fecha, hora, vigencia y moneda, según corresponda. Los datos se extraen de la transcripción canónica; no se eliminan cifras ni condiciones necesarias para responder.
- Las rutas tienen una carga independiente de las secuencias de iconos:

| Edad | Nivel 1 | Nivel 2 | Nivel 3 |
| --- | --- | --- | --- |
| 6–12 años | 3 visitas | 4 visitas | 5 visitas |
| 13–18 años | 3 visitas | 4 visitas | 6 visitas |

Se conserva la reconstrucción inversa que ya existía en el nivel 3 de los grupos mayores. La exposición dura al menos 8 segundos y 2,5 segundos por visita. Los lugares mantienen sus posiciones y los números indican el orden. Los nodos utilizan ilustraciones de su actividad en lugar de un tejado genérico.

- Se incorporan 41 ilustraciones SVG de [Microsoft Fluent Emoji Flat](https://github.com/microsoft/fluentui-emoji), licencia MIT incluida en [assets/icons](../assets/icons/README.md). Se distribuyen localmente y se generan PNG de los mismos vectores para Word. No hay dependencia de un CDN ni nuevas peticiones a servicios externos.
- Los tiempos de velocidad pasan de párrafos bajo el anillo a un panel de barras separado. Cada fila muestra mediana de aciertos en segundos, porcentaje de aciertos y cantidad de respuestas medidas. Las familias, niveles y formatos anteriores permanecen separados. Se consideran hasta 20 intentos recientes de cada grupo y se excluyen práctica sin medición, tiempos interrumpidos y valores no numéricos. Una fila sin aciertos medidos no dibuja una barra de cero segundos. Los datos completos se pueden desplegar debajo.

## Se conserva

Las 15 categorías y los nombres de los estímulos, las secuencias de 5 iconos en nivel 1, las mecánicas y medición de velocidad, la puntuación, los anillos de precisión y la evolución por sesiones. No se migran cuentas, contraseñas, suscripciones ni resultados. La selección de un perfil recordado inexistente continúa cubierta por la prueba de arranque y cambio de cuenta.

## Validación

- Suite existente: **147 pruebas Node correctas**.
- Nueva prueba `tests/presentation-refinement.test.js`: **3 correctas**, con cargas de rutas para todas las edades/niveles, integridad de documentos e ilustraciones SVG/PNG/licencia.
- **9 pruebas Python correctas**; se repitieron las 5 de verificación web después de ampliar la lista de imágenes comprobadas en Cloudflare.
- Navegador: `browser-auth-account.py`, `browser-session-layout.py`, `browser-supervision.py`, `browser-practice-documents-memory.py`, `browser-varied-mechanics.py` y `browser-presentation.py`, todos correctos.
- La prueba nueva comprueba ancho del texto en escritorio/móvil, recuerdo y corrección de ruta, medianas exactas, precisión y denominadores, separación de niveles/formatos, exclusión de tiempos inválidos, ventana de 20 intentos, estados sin datos y conservación de las gráficas anteriores.
- Los ZIP de las pruebas conservan documentos Word, fuentes y estímulos visuales. Las escenas/mapas se convierten a PNG dentro de Word y los nuevos iconos tienen sus PNG correspondientes. No se dispone de Microsoft Word instalado en este entorno para comprobar la paginación final de su aplicación.

## Muestras

Datos ficticios de las pruebas locales, sin información de usuarios reales:

- [Selección de iconos](review-assets/presentation/icons.png)
- [Ruta de nivel 1](review-assets/presentation/route-level-1.png)
- [Gráfica de tiempos](review-assets/presentation/speed-chart.png)
- [Gráfica en móvil](review-assets/presentation/speed-chart-mobile.png)
- [Texto a todo el ancho](review-assets/presentation/reading-width.png)
- [Recibo actualizado](../assets/documents/receipt-co-v1.png)

## Publicación

La rama se entrega para PR hacia `desarrollo`. Tras superar los controles y fusionar, el flujo publica la función de Supabase con las rutas graduadas, promueve la web a `pruebas` y comprueba también las tres imágenes comerciales nuevas. Esperar el resultado completo antes de probar https://pruebas.learning-hub-5n9.pages.dev/ .

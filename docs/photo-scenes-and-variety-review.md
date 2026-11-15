# Escenas cotidianas, diferencias y variedad real

## Qué significa 41/500

El contador es el uso diario de contenido por cuenta, no el tamaño del banco. Se cambia a «Límite diario: 41 de 500 ejercicios» para evitar esa confusión. No se eleva la cuota diaria: aumentar el límite no añade variedad de actividades.

## Cambios que se pueden probar

Para perfiles de 8–18 años:

- **Memoria → Escenas cotidianas**: dos escenas completas de aspecto fotográfico generadas con IA (cocina y salón), con 24 preguntas revisadas sobre colores, cantidades, posiciones y objetos. El alumno pulsa «Mostrar imagen», se espera a que termine de cargar y después empieza la exposición. La imagen se ajusta a la pantalla y se centra para que pueda verse completa. Se oculta antes de mostrar la pregunta y las respuestas. La exposición dura 16, 12 o 9 segundos según nivel.
- Las escenas de iconos sobre muebles dejan de generarse en estas edades; las demás categorías y mecánicas de memoria siguen disponibles. El formato anterior conserva soporte para exportar o presentar materiales existentes.
- **Atención → Encuentra las diferencias**: dos pares de escenas. Nivel 1 pide identificar un cambio específico; nivel 2 pide todos los objetos que cambian de color; nivel 3 exige distinguir las descripciones precisas de los cambios. En niveles 1 y 2 se pueden señalar los objetos directamente en la imagen B; los botones equivalentes permiten usar teclado y mantienen la selección sincronizada.
- Las diferencias preguntan expresamente por colores. No se evalúan pequeños cambios de textura o sombras que haya introducido la generación de imágenes.
- Los códigos del ejercicio antiguo de filtro (A7, B3, B8, C6) se presentan en tarjetas separadas y conservan exactamente sus valores.
- Las nuevas fotografías se incluyen también en las fichas Word: una imagen para recuerdo y las dos fuentes A/B para diferencias.

Los perfiles de 6–7 mantienen su circuito previamente validado; estas nuevas escenas no se les envían. No se cambian las ilustraciones de las demás familias, los resultados, los gráficos de progreso ni el funcionamiento de velocidad de procesamiento.

Imágenes revisadas y su procedencia: [assets/photos](../assets/photos/README.md). No son fotos de usuarios reales ni de sus casas.

## Banco: cantidad y mecánicas son medidas diferentes

El inventario es reproducible con `node scripts/photo-content-inventory.js`. Cuenta contenido, pregunta y respuesta correcta de bancos visibles; excluye IDs, temas, explicaciones y distractores. Una misma actividad repetida en varios niveles se cuenta una sola vez por franja. Se omiten generadores antiguos de Atención y otros bancos no enumerados, por lo que no es un recuento exhaustivo.

| Franja | Actividades distintas verificadas en los bancos enumerados |
| --- | ---: |
| 6–7 | 2.120 |
| 8–10 | 4.409 |
| 10–12 | 4.472 |
| 13–15 | 4.655 |
| 16–18 | 4.623 |

El detalle por dominio está en [el inventario](audits/photo-content-inventory.json). Estas cifras no significan miles de mecánicas ni miles de imágenes. Son tareas y variantes con material/pregunta/respuesta distintos. El banco ya supera el umbral de 800, pero el problema señalado por la usuaria es la similitud de la experiencia. Añadir variantes numéricas por sí solo no resuelve eso. En esta iteración hay dos escenas base nuevas, sus dos ediciones y dos familias de actividades con modos de acceso explícitos.

## Próximas mejoras propuestas

1. Ampliar las escenas con entornos diferentes (compra, parque, aula, preparación de una salida), con preguntas comprobadas frente a cada imagen.
2. Añadir recuerdo de cambios de posición y objetos ausentes, además de preguntas de detalle.
3. Ampliar la interacción: localizar en imágenes, reconstruir recorridos y completar planes/horarios con restricciones. Elegir el modo de respuesta por lo que se quiere entrenar.
4. Evaluar la variedad de una sesión por tipos de interacción y materiales, no solo por nombres de mecánica o número de ejercicios. Revisar sesiones completas para detectar familias prácticamente equivalentes.
5. Mantener las pruebas de fuente completa, nivel, respuesta derivable y exportación antes de ampliar masivamente el contenido.

## Validación

- 154 pruebas Node correctas en la suite completa; las nuevas comprobaciones de fotografías se han repetido tras ajustar el marcado y la validación.
- 9 pruebas Python, incluido paquete Edge con 15 archivos y comprobación de publicación.
- Navegador: recuperación/cambio de cuenta, sesiones y disposición, documentos/práctica de memoria, supervisión, mecánicas anteriores, gráficas/anchura y el circuito nuevo de fotos, en escritorio y móvil.
- La prueba nueva comprueba peticiones reales al handler local, inicio explícito, foto completa dentro de la ventana, desaparición de la imagen, ausencia simultánea de respuestas, selección correcta e incorrecta, marcado sobre la imagen, sincronización con teclado/botones y dos DOCX con las fotografías originales.
- Las imágenes tienen una clave de respuesta revisada y validada en cliente y servidor. Se rechazan preguntas, fuentes o respuestas alteradas y escenas sin evidencia.
- Clientes anteriores reciben interacciones compatibles o una petición de actualización. Se prueba que las peticiones rechazadas de un cliente antiguo no entregan tareas fotográficas nuevas.
- Los archivos de las fotos y la nueva biblioteca también se comparan al verificar la web de Cloudflare.

## Publicación y pagos

La rama se entrega para PR a `desarrollo`. Esperar los controles, fusionar y esperar a que termine la publicación de Supabase y la promoción de la web. La nueva web solicita revisión de cliente 3; una preview de esta rama frente a la función anterior no es una prueba válida de la integración completa. Tras publicar, recargar la URL estable de `pruebas`.

Stripe no se activa ni se modifican enlaces de pago en esta iteración. La revisión y los casos pendientes están en [Stripe: antes de cobrar dinero real](stripe-live-readiness.md). No hay evidencia de prueba del webhook desplegado en este repositorio.

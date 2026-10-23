# Lenguaje por edad, cuenta atrás y materiales cotidianos

## Cambios para revisar

- Gramática de 8–12 años: las instrucciones explican qué hay que hacer en lugar
  de exigir comprender «concordancia» o «género y número». Los mayores conservan
  las instrucciones específicas de su etapa.
- Paquetes A–D: las opciones se obtienen de las letras de la propia tabla. Las
  doce rotaciones de cada edad/nivel conservan las cuatro posibilidades y una
  sola respuesta válida; antes podía desaparecer A.
- Recursos: cada proyecto nombra objetos concretos. El texto explica que los
  puntos pertenecen a un programa de premios, cuánto cuesta cada paquete y qué
  cantidad incluye. Se conservan cantidades, restricciones y progresión.
- Memoria fotográfica: cuenta atrás real, desde que se decodifica y muestra la
  imagen hasta que se oculta. No hay pregunta ni respuestas durante la exposición.
  El temporizador se limpia al salir, cambiar de perfil, ejercicio o sesión.
- Seis entornos nuevos: calle con paseantes, parque con personas, autobús,
  taller de bicicletas, campamento de montaña y plaza. El banco pasa de seis
  a doce escenas y doce pares para diferencias (24 fotografías generadas).
  Cada fuente/edición fue inspeccionada; las preguntas se basan en lo visible.
  Niveles 2/3 conservan combinaciones de dos/tres observaciones independientes.
- Las seis parejas nuevas permiten señalar las diferencias sobre la imagen B,
  con botones equivalentes para teclado. Se revisaron solapamientos de las zonas.
- Pestañas de Atención: «Busca y compara», «Explora documentos» y «Encuentra las
  diferencias». Funciones ejecutivas: «Planifica y decide» y «Resuelve con
  documentos». Memoria: «Recuerda imágenes y secuencias» y «Escenas cotidianas».
- Cuatro documentos nuevos: tarjeta de embarque, correo abierto, panel de salas
  y panel de pedidos. El recibo anterior tiene ahora forma de ticket estrecho,
  tipografía monoespaciada, totales y borde de papel. Son cinco diseños distintos.
  El banco documental pasa de 18 a 22 fuentes; los nuevos paneles tienen preguntas
  de atención, comprensión y planificación/revisión de condiciones por nivel.
  El taller/pedidos empieza en 13–15; los otros nuevos documentos en 10–12.
- Las pantallas y la tarjeta se muestran más anchas en escritorio y se exportan
  a Word usando el ancho disponible. Se mantienen la ampliación, la transcripción
  accesible, las imágenes originales y los datos de origen en DOCX/ZIP.
- Contacto preparado en acceso y barra lateral: configurar `supportEmail` en
  `js/config.js` cuando la titular haya creado y verificado el buzón. Está vacío
  y los enlaces no aparecen aún: no se publica una dirección inventada.

Los iconos, categorías de memoria, gráficos de progreso y retos de velocidad
se conservan. Los bancos de cliente y Supabase siguen idénticos. Las fotografías
anteriores y el contenido existente continúan disponibles.

## Comprobaciones

- 175 pruebas Node correctas, incluidas las respuestas completas tras cambiar
  etiquetas, lenguaje por edad, planes documentales y 17 casos de facturación.
- 9 pruebas Python de paquete y verificación de la web.
- 9 recorridos de navegador: los ocho del flujo de publicación, más el recorrido
  documental con las 22 fuentes exactas embebidas en Word. Incluyen escritorio,
  móvil, cuenta atrás, desaparición, salida de sección, los seis pares nuevos,
  selección y puntuación, acceso/recuperación, progreso, velocidad y exportación.
- Las fuentes SVG nuevas se generan con comprobación automática de límites de
  texto; PNG y dimensiones declaradas coinciden. Los hashes revisados de las
  fotografías están en `assets/photos/review.json`.

Capturas: [correo](review-assets/realistic-materials/email-desktop.png),
[tarjeta en móvil](review-assets/realistic-materials/boarding-mobile.png),
[cuenta atrás](review-assets/realistic-materials/memory-countdown.png).

## Publicación y fiscalidad

Fusionar la rama `feat/clearer-activities-realistic-materials` a `desarrollo`,
esperar los controles/publicación de contenido y web, y recargar la URL estable
de pruebas. La lista de verificación de Cloudflare incluye todos los nuevos PNG.

La función de facturación se instala por separado: el flujo de contenido no
despliega `stripe-webhook`. Se mantiene la corrección de Managed Payments ya
fusionada en PR #14. La nueva opción `STRIPE_AUTOMATIC_TAX=enabled` solicita
dirección de facturación y cálculo automático; está **desactivada por defecto**.
No se han cambiado secretos remotos, cobrado dinero ni activado live.

El cálculo fiscal no está resuelto por crear esta opción. La titular factura
desde España, trabaja por cuenta ajena y aún no ha confirmado altas/tratamiento
con asesoría. La compatibilidad de empleo y actividad propia no implica una
exención automática por ingresos. Revisar la situación concreta antes de cobrar.
Seguir [el procedimiento fiscal de prueba](stripe-tax-spain.md) después de esa
confirmación; el total anunciado sigue siendo 19,99 EUR con impuestos incluidos.

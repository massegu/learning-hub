# Reconstrucción D–G de GLIAX

Rama local `reconstruccion/gliax-a-g-h`. El punto de partida verificado fue `2d223d28dc5cc1bd07420fe01418d293d9d9070b`. El bundle de A–C y las evidencias anteriores permanecen en `/workspace/gliax-respaldos`.

## D · Contenido

- La auditoría sintética revisa 49 combinaciones de franja y área, cada una en sus tres niveles. Agrupa por operación semántica y deduplica la misma fuente con distractores o identificadores distintos. Incluye las modalidades cognitivas, las ejecutadas y el vocabulario explícito. No utiliza el historial de usuarios.
- Comunicación funcional conserva las tres operaciones originales. En 6–7 añade cinco operaciones con notificaciones de aula, turnos, avisos y peticiones breves. Desde 8–10 añade nueve operaciones. Incluyen concordar un turno, contrastar fuentes, confirmar una recepción y elegir un aviso de incidencia basado en hechos. Las tareas progresan desde interpretar un mensaje hasta integrar avisos que se sustituyen o cumplir varias condiciones. Hay 8 familias en 6–7 y 12 por franja a partir de 8–10.
- Nube de aula, Muro Cercano, Taller en pantalla, Índice Abierto, Mesa de edición e Islas de Turno son diseños originales ficticios. Cada interfaz contiene información necesaria para responder. Los materiales se componen de texto y CSS propio. Las fichas conservan el contenido en tablas legibles.
- Funciones ejecutivas amplía los planes con dependencias de edición o publicación en dos contextos desde 10–12. Los tres niveles piden ordenar tres, cuatro o cinco acciones con restricciones crecientes.
- «La palabra que encaja» v2 conserva la respuesta escrita desde 10–12 y agrega cuatro contextos por nivel en cada franja a partir de esa edad. 10–12 infiere usos concretos. 13–15 distingue operaciones sobre fuentes, avisos y archivos. 16–18 usa el vocabulario de decisiones, trámites y verificación de evidencia en contextos de autonomía. Se aceptan ejemplos equivalentes revisados. 6–7 y 8–10 conservan sus modalidades de A–C.
- Se revisaron las cinco parejas fotográficas de diferencias en entrega. Los tres cambios previstos se distinguen en cada pareja a escala de comparación. Hay diferencias de píxel menores fuera de varias regiones, visibles al amplificar el residuo. Queda pendiente confirmar con revisión editorial a tamaño completo si alguna textura, borde o reflejo funciona como pista accidental. Las imágenes originales se mantienen.

## E · Progreso e informes

`js/progress-report.js` usa la misma instantánea del historial reconciliado para panel, CSV y Excel. Se muestran por separado ejercicios puntuables, aplicación de reglas, intervalos de espera y otras prácticas. Se conservan los resultados y las versiones en el almacenamiento existente. Los tiempos de reglas y transcripción se presentan como observaciones con unidades. Las exportaciones profesionales usan nombres comprensibles. Excel incluye Resumen, Sesiones, Detalle y Áreas. Los informes de privacidad conservan el detalle técnico íntegro y añaden la identificación GLIAX al nombre y al contenido.

La reconciliación sigue filtrando por el perfil y la cuenta activos. Los totales anteriores guardados con el perfil y la progresión mantienen sus reglas previas. El panel nuevo cuenta el historial disponible, con el límite de caché existente de 5.000 registros. Las cifras describen prácticas y no sirven para inferir diagnósticos o gravedad.

## F · Identidad

GLIAX aparece en portadas, títulos, encabezados, pies, propiedades y nombres de archivos generados. Los doce documentos visuales de `assets/documents/everyday-es-2026` se actualizaron en sus fuentes HTML y en las versiones PNG y PDF. Se conservaron la información, los identificadores y las rutas. Los originales de las propuestas rúnica y laberinto no aparecieron en las evidencias consultadas. La elección de logotipo queda pendiente.

## G · Fichas y solucionarios

El flujo general permite elegir áreas y nivel de práctica. Con el solucionario marcado se descarga un ZIP con dos documentos Word independientes por versión. Se mantienen los números de actividad y el orden exacto de las opciones. Las preguntas abiertas tienen ejemplos y criterios de revisión. La selección curricular existente y las modalidades de descarga individual siguen disponibles.

El papel incluye Comunicación funcional, vocabulario, deducción, actualización de planes, contradicción, selección de información y documentos funcionales. Las prácticas visuales estáticas carecen de cronómetro en papel. Las tareas de memoria admisibles incluyen indicaciones para una administración acompañada, con el estímulo cubierto al responder. La revisión profesional debe comprobar que cada proyección conserva el objetivo. Las tareas auditivas, la espera guiada, la transcripción en movimiento, los ensayos de inhibición y los cambios de regla temporizados quedan fuera de las fichas profesionales.

Se usa A4 con espacio graduado de respuesta y saltos al inicio de cada actividad. Si un documento vertical necesita reducción, se acompaña de datos impresos mediante su transcripción canónica. Las parejas fotográficas se mantienen juntas. La revisión de paginación cubre 15 fichas de 16 actividades y sus solucionarios en LibreOffice. La paginación puede variar al cambiar las fuentes o la configuración de Word.

Cuando el banco remoto histórico de 6–7 entrega una variante fuera del contrato de papel, el cliente conserva las actividades válidas y completa solo los huecos desde el banco revisado de la misma área y nivel. Solo ocurre tras una respuesta autorizada y dentro del número de plazas devuelto por el servidor.

## Contratos, archivos y prueba

- Generación y contratos compartidos en `js/cognitive-families.js`, `js/communication-content.js`, `js/functional-content.js` y sus copias de Edge. `supabase/functions/request-learning-content/index.ts` habilita la revisión 15 para fichas profesionales, nuevos contextos de vocabulario y Comunicación. Las revisiones anteriores conservan el contrato de entrega.
- Interfaz en `index.html`, `css/styles.css`, `js/app.js`, `js/activity-model.js` y `js/cognitive-renderer.js`. Informes, impresión y compatibilidad de exportación en `js/progress-report.js`, `js/docx.js`, `js/worksheet-selection.js`, `js/v16.js`, `js/v16_3.js` y `js/v16_4.js`.
- Inventario reproducible con `scripts/audit-content-quality.js`. Regresiones nuevas en `tests/reconstruction-dg.test.js`, `tests/browser-reconstruction-dg.py` y `tests/worksheet-layout.py`. Los tests existentes de comunicación, Word, informes y A–C se conservan y verifican los contratos de presentación actualizados.
- Generar las 15 muestras con `GLIAX_DG_EVIDENCE=/ruta/en/workspace node --test --test-name-pattern='professional packages' tests/worksheet.test.js`. Validar la maquetación con `python3 tests/worksheet-layout.py /ruta/en/workspace --pdf /ruta/en/workspace/pdf`. Para el navegador se usa la Edge Function local con perfiles ficticios.

Continúan pendientes la validación pedagógica profesional, la revisión fotográfica editorial y la comparación de logos originales. El trabajo no incluye el configurador o los favoritos de H ni cambios remotos.

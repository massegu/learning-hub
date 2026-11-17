# GLIAX — verificación funcional de integración PR #50 + PR #51

Fecha: 17/11/2026
Rama: `integration/gliax-pr50-pr51-20261117`
Commit base verificado: `828edc5ff4cbc24d6eb3ebaf06efd36217237baf`
Alcance: validación local con mocks y Chromium. Sin llamadas a Supabase real, sin migraciones remotas, sin publicación ni fusión.

## Dependencias y pruebas automáticas

- `npm ci`: **superado**, instaló 21 paquetes desde el lockfile.
- `npm test` (ejecución final tras correcciones): **superado, 270/270 pruebas**, 0 fallos, 0 omitidas. Duración informada: 126,6 s.
- `git diff --check`: superado.
- Inventario estático de referencias: 41 rutas locales únicas de HTML y 2 URL locales de CSS; **ninguna ausente**.

## Pruebas funcionales de navegador

Todas se ejecutaron contra `tools/review-preview.py` y límites de Supabase simulados; no se usaron cuentas ni datos reales.

- `tests/browser-privacy.py`: **superada**. Perfiles seguidos e independientes, exportación JSON, edición y eliminación de perfil, unicidad de código, aislamiento de escrituras y diálogo móvil.
- `tests/browser-idempotent-results.py`: **superada**. Reintento después de perder la respuesta tras confirmar el registro conserva un solo intento.
- `tests/browser-result-reconciliation.py`: **superada**. Reconciliación al reabrir, recuperación de la bandeja antes de la lectura canónica, historial legacy y límite 5.000, métricas `guided_wait`/`rule_application` en Progreso y CSV, perfil aislado y sesión independiente sin consulta ni escritura.
- `tests/browser-cognitive-families.py`: **superada**. 105 tareas (7 familias × 5 edades × 3 niveles), modalidades A/B separadas, teclado, móvil de 390 px y persistencia.
- `tests/browser-processing-speed.py`: **superada**. Velocidad ambiental y tres presentaciones en pantalla, medición, respuestas y fichas en escritorio/móvil.
- `tests/browser-speed-mechanics.py`: **superada**. Edad exacta, umbral 6–8/9+, comparación tipográfica para adolescentes y exclusión de tareas no imprimibles de las fichas.
- `tests/browser-auth-account.py`: **superada** con Auth simulado. Registro, inicio/cierre de sesión, recuperación, cambio de contraseña, creación de perfil con código generado y landing responsive a 320, 390, 768, 1.024 y 1.440 px. No se envió ningún correo.
- `tests/browser-review-preview.py`: **superada** tras adecuar sus helpers al estado actual de la interfaz. Recorrió cinco franjas de edad, 140 respuestas, cinco fichas de 20 ejercicios y capturas responsivas a 1.280/390 px. No registró errores JavaScript ni solicitudes HTTP externas.

## Hallazgos y correcciones reproducibles

1. **Landing GLIAX en móvil:** reproducido a 390 px. La fila del bloque de presentación colapsaba a unos 68 px aunque su contenido ocupaba unos 493 px; `overflow:hidden` recortaba el título y la descripción. En el grid compacto se fija `grid-auto-rows:max-content`. Se usa alineación `safe center` para evitar que el contenido alto empiece fuera del viewport, y `showAuth()` restablece el desplazamiento al volver a la pantalla de acceso. La prueba ahora comprueba que el título queda dentro de su bloque, que no hay desbordamiento horizontal y que se puede llegar al formulario. Repetida y superada.
2. **Selector de la tabla de velocidad:** el test esperaba `.structured-stimulus-table`, pero el material ecológico se renderiza como `.everyday-material-table`. Se actualizó el selector y la comprobación móvil para validar el marcado que realmente se entrega. Los encabezados visibles son Código, Zona y Mesa; la prueba pasó sin cambios en el generador ni en su respuesta.
3. **Mock de inserciones:** el mock local interpretaba `.insert(...).select(...).single()` como una lectura y devolvía un perfil vacío. Ahora conserva la operación de inserción, como hace el cliente Supabase. Esto permitió validar el perfil creado sin cambiar el API de producción.
4. **Pruebas de automatización desfasadas:** se actualizaron para usar el código aleatorio que ahora propone el formulario, abrir el panel de dificultad antes de cambiar nivel y abrir el menú de trabajo antes de seleccionarlo. Eran supuestos obsoletos de los helpers; no se observaron fallos correspondientes en la interfaz.

Los navegadores no notificaron excepciones JavaScript en las pruebas pasadas. El launcher comprobado no hizo solicitudes HTTP externas. El inventario encontró todas las rutas locales referenciadas por HTML/CSS; los ejercicios de velocidad y cognición también validaron los estímulos que renderizan.

## Pendiente de Supabase real

- Validar inicio de sesión, confirmación del correo y redirecciones de recuperación con el proyecto **no productivo**.
- Validar RLS y aislamiento entre dos cuentas ficticias frente a Supabase real.
- Verificar que las migraciones necesarias estén aplicadas en el entorno de beta antes de probar `exercise_results`, `client_attempt_id`, códigos únicos y RPC. No se consultó ni modificó Supabase en esta fase.
- Confirmar exportación y borrado contra datos sintéticos de una base aislada.

Las pruebas locales no certifican la configuración remota de Auth/RLS ni el funcionamiento de producción. Esta verificación no altera las PR originales #50/#51, `desarrollo` ni `main`; tampoco ejecuta migraciones, despliega en Cloudflare ni fusiona ramas.

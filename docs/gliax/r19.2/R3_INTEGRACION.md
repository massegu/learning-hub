# GLIAX R19.2 · Integración R3

La base de trabajo es el checkpoint R2 `70cecd58cebed2131ffac5ec4ba691ff56331681`.

## Práctica durante QA

Las modalidades R19.2 aparecen en el panel de modalidades de su área cuando la configuración existente indica Staging. Para una prueba local con servicios simulados se admite activar `r192Practice` en una configuración de loopback. La configuración comercial actual conserva las rutas de R19.1. En QA coexisten las modalidades de R19.2 en memoria y las anteriores, incluida la espera guiada autónoma por la condición de conservar las actividades anteriores. Los resultados históricos no se reinterpretan.

Cambio de plan usa el banco R1 para escoger planes, ordenar dependencias, declarar inviabilidad y justificar decisiones. Encuentra la contradicción está en Atención y pide evidencias en N2 y N3. La selección usa edad, nivel y una semilla local. Repetir conserva el caso y el orden. Siguiente prepara otra ronda dentro de la modalidad.

La práctica usa la tarjeta de ejercicio y su navegación habituales. Su corrección se ejecuta localmente sin petición Edge, estado de progreso, puntuación, favoritos ni guardado de resultados. El caso local queda fuera del objeto usado por los registros y las exportaciones existentes. La interfaz indica que esta práctica solo está disponible en pantalla. La persistencia longitudinal de las nuevas familias queda pendiente para producción comercial.

¿Qué necesitas saber? abre con una respuesta libre. Las pistas y opciones aparecen a petición y conservan el primer intento en una sesión en memoria. En 6–7 se ofrece respuesta oral acompañada mediante transcripción manual en el mismo campo. La ayuda utilizada se indica junto al resultado. N3 de 8–10 alterna entre IN06 y su variante con los datos completos.

Actúa con reglas aparece desde los 8 años. La señal se presenta por separado y solo permite continuar. Cada ensayo mantiene controles constantes y admite avanzar sin responder. El evaluador AR recibe únicamente ensayos puntuables y el feedback aparece al terminar. El texto identifica la forma, el color y el veto o la letra cuando proceden. El avance es manual y no se calcula latencia ni se atribuyen métricas clínicas.

## Generadores ejecutivos e informes

El mismo panel de Funciones ejecutivas ofrece Planificación, Recursos y tiempo, Cambio de objetivo y Supervisión. Los pasos se pueden reordenar por teclado, selección única y múltiple usan controles nativos y la decisión razonada presenta sus condiciones por separado. El caso de revisión sin fallos permite confirmar una selección vacía. Las tablas anchas se desplazan dentro de la tarjeta en pantallas pequeñas.

La proyección QA marca las ocho modalidades como solo pantalla. El catálogo y el exportador de fichas rechazan estos casos mediante sus guardas existentes. Word, solucionarios y ZIP conservan sus recorridos anteriores. CSV y XLSX contienen los resultados históricos del perfil. No se añaden puntuaciones ni eventos de R19.2 al historial o a Progreso.

El contrato Edge existente conserva `client_revision=19`. La entrega local de estas actividades está separada de esa ruta y las pruebas verifican que completarlas no llama a Edge ni guarda datos. La integración comercial de la entrega y el historial requerirá un contrato coordinado y pruebas con cuentas QA antes de habilitarla.

## Checkpoints

| Bloque | SHA remoto | Comprobación |
|---|---|---|
| Navegación QA, CP y EC | `4af7e7ac85c01ab6a11fab4d1bb388b3ef6eb515` | Navegación, teclado, alternativas, inviabilidad, evidencia y móvil |
| IN y ayudas | `735275e2878e8c337b69e54749df264f3bdc61e2` | Entrada abierta, pista, opciones, datos completos y no persistencia |
| AR | `4219b6e65e49360c648275a3981c5658f252fc1f` | Señales sin puntuación, inversión, espera, teclado y móvil |
| R2 y regresión | SHA en el registro remoto de la rama | Generadores, exportaciones, navegación y regresión de R19.1 |

Quedan pendientes la revisión pedagógica con usuarios y la evaluación manual de accesibilidad con tecnologías de asistencia. Los recorridos de navegador se ejecutaron con perfiles sintéticos y servicios en loopback.

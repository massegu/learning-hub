# GLIAX R19.2 · Acta del candidato R5

**Conclusión: NO APTO: DEFECTOS BLOQUEANTES.** La auditoría local y el respaldo de código están completos. La Edge v5 que sirve Staging carece del contrato matemático v2 que exige el frontend R19.1. El defecto P1 impediría la regresión de matemáticas en un QA alojado con el frontend R5 como único cambio. El SHA final figura en la referencia verificada de GitHub y en el manifiesto de entrega.

## Matriz de comprobación

| Área | Resultado | Entorno y evidencia |
| --- | --- | --- |
| Banco R1 | Superado localmente | 58 referencias, alternativas, inviabilidad, evidencia, respuestas parciales y no interpretables. |
| AR y generadores R2 | Superado localmente | 24 variantes AR y los cuatro generadores. Se probaron señales no puntuables, vetos, dependencias, alternativas de recursos, supervisión sin fallos y cambio de objetivo. |
| Diversidad y selección | Superado localmente | 120 celdas, 114 con oferta, 831 candidatos. En 9.216 selecciones se visitó todo el banco disponible en las seis celdas simuladas. Las excepciones de IN con dos casos y CP con banco unitario se conservaron. |
| Interfaz R19.2 | Superado en Chromium local | Escritorio 1440 px, móvil 390 px y comprobación adicional de tablas a 320 px. Teclado, etiquetas nativas, región de estado, foco visible, contraste de la opción enfocada, feedback, Repetir, Siguiente y Nueva ronda. |
| Privacidad R19.2 | Superado en entorno sintético | No aparecieron textos libres ni IDs personales en eventos nuevos. Los recorridos QA no invocaron Edge ni añadieron resultados al historial, Progreso o las exportaciones. El navegador local bloqueó conexiones no previstas y registró cero solicitudes de servicio fuera del perímetro de prueba. |
| R19/R19.1, sesiones y resultados | Superado localmente | Worker Edge del repositorio con Auth y PostgREST simulados. Lectura, lenguaje, atención, memoria, matemáticas v2, sesiones independientes, idempotencia y 105 actividades cognitivas anteriores, incluida espera guiada. |
| DOCX, ZIP, CSV y XLSX | Superado en navegador local | Librerías reales archivadas. Se verificaron DOCX rápido, fichas y solucionario separado, informes históricos y CSP. |
| Supabase y Cloudflare alojados | Solo lectura | Verificación de anclas. El frontend R5 y su autenticación, cuotas, RLS y recorridos con perfiles QA no se ejecutaron en Staging. |

La ejecución final de Node superó 354 pruebas, sin fallos ni omisiones. La batería Python superó 32 pruebas. Se corrigieron dos expectativas de las pruebas Python que apuntaban a un número de fuentes y a un SHA antiguos. El fallo de disponibilidad del directorio y SDK locales se resolvió en el entorno de pruebas. La regresión de matemáticas completó sus aserciones. El servidor local registró una interrupción de conexión al navegar fuera de una solicitud.

Las suites focalizadas de Chromium cubrieron R19.2, R19, matemáticas R19.1, documentos y memoria, privacidad, idempotencia, familias cognitivas y exportaciones desde Pages sintético. Quedaron fuera las pruebas de navegador ajenas a este alcance y los motores distintos de Chromium. Quedan pendientes la lectura con NVDA o VoiceOver, comprobaciones manuales con alto contraste y zoom, y observación de oralidad, ayudas y carga de lectura con usuarios. El contraste automatizado de los controles inspeccionados cumple el umbral de 4,5:1 para texto y 3:1 para el indicador de foco. La inspección no certifica accesibilidad integral.

## Incidencias pendientes

| Prioridad | Incidencia | Estado de aceptación |
| --- | --- | --- |
| P1 | La Edge v5 alojada no entrega `math_problem_version=2`. | Bloquea QA alojado del par. La exportación ESZIP 2.3 no contiene el módulo `math-sequencing.js` ni el contrato en el módulo de entrada. |
| P2 | Diversidad editorial bajo el objetivo de contextos en 19 combinaciones de familia y edad. | Deuda registrada en R4. |
| P2 | Distractores EC, equivalencias IN, gradación temprana y feedback específico. | Revisión editorial y observación con usuarios pendientes. EC, IN y AR quedaron por debajo de 80 en la revisión documental. |
| P2 | Compatibilidad con lectores de pantalla y oralidad acompañada. | Requiere validación manual. |

No se identificaron P0 durante la auditoría. Se corrigieron dos P1 locales de correspondencia entre consigna, evidencia y corrección, con regresiones. El P1 del entorno servido queda abierto.

## Manifiestos y dependencias

- `R5_FRONTEND_LOCAL.sha256` enumera los 376 archivos del Pages reconstruido para ensayo local. El ZIP sintético tiene SHA-256 `04060d914fb1caf87a895a11778552fee7f24a6c9f22dffd05acc570d2433684`. Dos compilaciones locales produjeron archivos idénticos. Se comprobó la integridad del ZIP y de cada entrada. La configuración ficticia se usa en loopback con transporte simulado.
- La relación de frontend para una autorización posterior parte de `index.html`, `js/`, `css/` y `assets/`. El constructor existente deriva `_headers`, `js/staging-guard.js`, la configuración exclusiva de Staging, pagos desactivados y el vendedor DOCX local. Sustituir el valor ficticio por configuración autorizada cambiaría las huellas y exigiría un manifiesto nuevo.
- `R5_EDGE_FUENTES.sha256` inventaría 28 fuentes de `request-learning-content`. Es una lista de huellas, sin bundle Edge. La rama hereda intacta la Edge R19.1. La petición de ejercicios conserva `client_revision=19`; la resolución matemática añade `math_problem=true` y `math_problem_version=2` y valida `type=mathProblem` y `mathVersion=2`. El SDK mantiene JWT y el flujo habitual de uso en las actividades antiguas. R19.2 QA se corrige en memoria y queda fuera de ese contrato.
- Dependencias de ejecución y prueba: Node compatible con `>=22.13.0`, Chromium y Playwright locales, PGlite 0.5.11 en pruebas SQL, DOCX 8.5.0 y JSZip 3.10.1. El Pages ensayado resuelve el SDK por el CDN permitido; el fixture archivado es Supabase JS 2.119.2. El XLSX usa JSZip. También se abrió con ExcelJS 4.4.0 en la prueba de compatibilidad.
- Las huellas de distribuciones archivadas del navegador fueron `8c186ccd56334231c9132b3f299aff6d4cead2165ab5c0cfe81a812cff7a4ef4` para Supabase JS, `acc7e41455a80765b5fd9c7ee1b8078a6d160bbbca455aeae854de65c947d59e` para JSZip y `7e49da68588e250dbb8bba190d2caa8ab3787cc0284bda1d8b2f805c4df742c9` para ExcelJS. Se sirvieron localmente en las pruebas, sin acceso al CDN desde el navegador.

## Reversión propuesta

1. En una operación autorizada, confirmar Pages R18 `11c0323f-5c3b-441e-a693-ac1e9ae26f2e`, commit `cb449c7cf463b5927acdba8f72ef24791a23ac1f`, y Edge v5 `ACTIVE`, `verify_jwt=true`, huella `1f9c899992a8f8a4a64d114f91d4f9d39b2d55e8558fb74929c718f70c9c01ea`. Constatar que las previews y los automáticos de Staging siguen desactivados.
2. Antes de cambiar el par, comprobar permisos efectivos, mecanismo de cierre QA, dos cuentas ficticias aisladas y disponibilidad de una copia restaurable de Edge v5. El ZIP original de 27 fuentes sigue pendiente de verificación. El diagnóstico leyó el ESZIP alojado y no ensayó su restauración. Mantener bloqueado el inicio hasta verificar ambos retornos.
3. Si una fase autorizada falla, cerrar QA y restaurar el par como una sola ventana coordinada. Seleccionar el despliegue R18 del proyecto Pages de Staging y restaurar la copia Edge verificada del mismo proyecto con JWT obligatorio. Si solo se modificó un componente, verificar el otro antes de tocarlo. Comprobar autenticación, R18 servido, espera guiada y exportación básica con datos ficticios. Mantener cerrado QA si el retorno no se confirma. R5 no ejecutó el procedimiento.

## Diferencias frente a los artefactos históricos

Los 376 archivos son los del constructor reconstruido con configuración sintética, frente a los 365 documentados para el Pages histórico perdido. El inventario incluye la reconstrucción en módulos R1–R4 y las correcciones R5. Las secuencias AR adicionales y el selector se reconstruyeron con reglas y pesos explícitos. Se preservó la espera guiada en los recorridos anteriores por compatibilidad. La equivalencia binaria y de inventario con los paquetes perdidos queda sin acreditar.

## Checkpoints

| Bloque | SHA remoto verificado |
| --- | --- |
| Corrección de casos y evaluación | `0ce54c4a82b1bf2e95808cea58dfd119a8736a4d` |
| Accesibilidad y feedback | `3eccfacd2a439cc1661db6d0c95bbfdc554fc80f` |
| Pruebas offline y contratos | `51f989bf704e8ad52a740564edfc12777c4a2c8b` |
| Revisión pedagógica y personalización | `32d79f473faa43f090dbf1fdbd5fde18e41f3aef` |
| Acta y manifiestos | Referencia final de GitHub y manifiesto de entrega |

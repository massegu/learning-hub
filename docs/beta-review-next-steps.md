# Preparación de la prueba con revisora — 17 de octubre de 2026

Estado: rama `fix/early-primary-stimulus-integrity`, sin merge ni despliegue.
La cuenta de prueba tiene acceso `complimentary`; se verificaron el inicio de sesión
con contraseña y la lectura de su cuenta mediante permisos normales de usuario.
No necesita contratar una suscripción ni activar Stripe para revisar la plataforma.
Las credenciales se entregan al propietario por separado y no forman parte del repositorio.

## Cambios incluidos

- Fusión y ampliación del currículo descritas en `curriculum-fusion-review.md`.
- Adaptación de coste/costos y de plazas/cupos en el contexto de talleres; conserva
  topónimos como «Centro Cultural La Plaza». La adaptación es léxica y contextual:
  no constituye una revisión editorial nativa de cada país.
- Lenguaje 16–18 elimina los títulos usados como único estímulo en gramática y
  ortografía. Escritura muestra los criterios una sola vez, fuera del texto fuente.
- Memoria: 72 variantes por familia y nivel; 12 objetos iniciales, 20 escolares y
  24 funcionales para mayores. La identidad del material conserva la exclusión de
  repeticiones aunque cambie la pregunta o el nivel. El banco es finito: no garantiza
  ausencia de repeticiones indefinida. Las familias son secuencias, posiciones y
  asociaciones; no son 216 mecánicas diferentes.
- Tabla de asociaciones con cabecera, iniciales y filas legibles. Secuencias con
  casillas compactas y sin la nota vertical «Toca para retirar».
- Cuatro documentos originales ficticios: factura, recibo, catálogo y folleto.
  Imágenes generadas para esta plataforma, incorporadas en `assets/documents`,
  con transcripción accesible y fuente idéntica en pantalla y DOCX. Aproximadamente
  6 MB en total: se sirven desde el alojamiento estático de la aplicación; no hace
  falta subirlas manualmente ni contratar otro servidor.
- Selector «Documentos visuales» en Atención y Funciones ejecutivas desde 8–10;
  en Lectura + Escritura desde 10–12. Para 8–10 se utiliza solo el catálogo.
  Atención localiza/cruza datos; Funciones ejecutivas aplica condiciones y revisa
  planes. El modo ordinario puede incluir documentos en Atención y FFEE; los diez
  textos de Lectura + Escritura conservan su rotación sin imágenes por defecto.
- Los cuatro documentos se sitúan expresamente en Colombia y conservan COP aun
  con otro país elegido. No se presentan como facturas locales de todos los países
  ni se cambian cantidades mediante una sustitución del símbolo monetario.

## Validación de esta revisión

- `npm test`: 112 pruebas aprobadas, sin fallos.
- `python3 tests/browser-curriculum.py`: 138 actividades respondidas en cinco edades,
  diez DOCX reales y CSV; comprobaciones de móvil/escritorio y persistencia.
- `python3 tests/browser-documents.py`: 38 actividades con documentos en cuatro
  edades, rotación, transcripciones, DOCX con los cuatro PNG originales, tabla de
  ocho asociaciones, ortografía sin título redundante y criterios de escritura únicos.
- Los navegadores usan la aplicación y el manejador Edge reales con una cuenta/DB
  simuladas. Estas pruebas no demuestran que la función publicada tenga esta versión.
- No se ejecutó la comprobación nativa Deno en esta instancia: el binario/cache
  diagnóstico anterior no está disponible. Sigue pendiente verificar el despliegue
  de Edge con sus dependencias oficiales. No se afirma validación clínica ni que la
  autoevaluación escrita equivalga a una corrección automática del texto.

## Orden de salida

1. Publicar una versión de prueba revisable del cliente y de la función Edge, con
   autorización del propietario. Un preview de Cloudflare por sí solo utiliza la
   función Supabase ya publicada y no incorpora los generadores de esta rama.
2. Comprobar con una sesión normal el acceso, creación de perfiles, cuotas, guardado,
   país, generación de contenido y fichas. Evitar datos reales de pacientes en la prueba.
3. Elena revisa contenido y facilidad de uso; se anotan edad, área, nivel, país,
   pregunta y captura. Prioridad: respuestas ambiguas/erróneas, dificultad, repetición
   y cualquier bloqueo del flujo.
4. Resolver bloqueos; después configurar Stripe en modo real y comprobar compra,
   webhook, acceso tras pago y portal de gestión antes de admitir pagos reales.
5. Lanzamiento público y mejoras semanales. El modo prueba de Stripe continúa
   mientras se revisa esta beta.

La clave de servidor permite administrar cuentas y datos, pero no sustituye el
acceso de despliegue de Supabase ni la configuración de Cloudflare. No se ha
publicado ni fusionado esta rama como parte de esta revisión.

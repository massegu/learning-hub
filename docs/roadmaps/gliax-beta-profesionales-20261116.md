# GLIAX — plan de trabajo para beta profesional
Fecha: 2026-11-16
Estado: PLAN Y AUDITORIA INICIAL. No desplegar ni fusionar automaticamente.
Destino actual: rama de desarrollo `feat/gliax-phase1-security-metrics-rules-20261116` (PR #51 contra `desarrollo`). La propuesta visual de la PR #50 permanece separada.
Produccion `main` y acceso actual deben permanecer intactos.

## Referencia permanente de diseño

Aplicar [GLIAX — Guía de diseño de ejercicios cognitivos y actividades de aprendizaje](../GLIAX_GUIA_DISENO_EJERCICIOS.md) como criterio para diseñar y revisar ejercicios en futuras fases. La guía orienta nuevas actividades; no implica adaptar automáticamente las actividades existentes.

## Decisiones de producto confirmadas
- GLIAX es una plataforma de **practica cognitiva y aprendizaje y seguimiento del desempeno**, utilizada por profesionales con menores. **No evalua, diagnostica ni infiere capacidades clinicas**. La evaluacion individual corresponde al profesional.
- Tres niveles predefinidos (L1, L2, L3). No atribuir eficacia clinica ni dificultad adaptativa que no existe.
- Principio ecologico: emplear estimulos funcionales (carteles, tickets, catalogos, calles, pizarras, pantallas digitales, horarios, planos, correos y documentos) en vez de formas abstractas como recurso por defecto.
- Evitar confundir tarea practicada con transferencia al mundo real.
- Recoger solo los datos necesarios para el seguimiento individual y, sujeto a base legal y protocolo futuro, investigacion. Datos seudonimizados NO equivalen a anonimato.

## Auditoria inicial realizada (solo lectura)
- Supabase proyecto Learning_Hub: esquema publico con nueve tablas, todas con RLS activado; NO equivale a auditoria de autorizacion superada.
- Politicas de `learner_profiles`, `exercise_results`, `content_seen` comprueban propiedad del profesional mediante `auth.uid()` y `account_id`/perfil.
- `manage_learner_privacy` es SECURITY DEFINER y ejecutable por authenticated; en el cuerpo examinado comprueba `auth.uid()` y que el perfil pertenezca a la cuenta. **Requiere prueba de aislamiento entre cuentas con identidades de test, no revocar a ciegas**.
- Advisor Supabase: leaked password protection disabled; cuatro tablas RLS sin politica (billing_account_locks, billing_checkout_attempts, billing_webhook_events, content_usage), que pueden estar intencionalmente reservadas al backend. Confirmar GRANTs y rutas indirectas.
- `exercise_results` contiene actualmente perfil, fecha, sesion, area, nivel, acierto, puntos, item y detalle, pero no columnas explicitas para latencia, omisiones, modalidad, ayudas, version del estimulo ni condiciones de administracion. Verificar si parte vive en `detail` o `progress` antes de definir cambios.
- `learner_profiles` contiene campo `name` de texto. Dejar de incentivar identificadores elegidos por usuarios que puedan contener iniciales/nombres; considerar codigo aleatorio generado, comprobado en servidor y validado en toda ruta.
- Documentacion previa `docs/privacy/implementation-and-activation.md` detalla preflight, exportacion y borrado; comprobar que componentes remotos esten desplegados y protecciones funcionen efectivamente.

## Fase P0 — estabilidad y circuito de cambios
1. No tocar `main`, ni la URL estable, ni credenciales/Stripe/Edge remoto sin autorizacion y pruebas especificas.
2. Verificar PR #50 y preview Cloudflare; validar marca en login, interior, movil y accesibilidad.
3. Definir matriz de despliegue: vista previa web NO garantiza la version de las Edge Functions. Verificar estado por separado.
4. Crear pruebas de regresion para login, perfiles, resultados, exportacion, borrado, sesion independiente y continuidad del usuario actual.
Criterio de salida: PR revisable, preview funcional, no despliegues remotos no autorizados.

## Fase P1 — seguridad de menores y privacidad por diseno
1. Inventariar flujos completos: Auth, cuentas, perfiles, progreso JSON, ejercicio, documento exportado, Edge, registros, retencion y terceros.
2. Verificar aislamiento multi-cuenta en SELECT/INSERT/UPDATE/DELETE/RPC y rutas de Edge (pruebas con cuentas ficticias); inspeccionar permisos EXECUTE/GRANT de funciones privilegiadas.
3. Revisar MFA para cuentas profesionales, politica de passwords, proteccion de password filtrada, duracion de sesion, recuperacion y tratamiento de dispositivos compartidos. No forzar cambios sin prueba de acceso/recuperacion.
4. Generar codigo aleatorio no identificativo por perfil y aviso claro: «No introduzcas nombres, iniciales, fechas de nacimiento ni datos clinicos». Evitar texto libre donde no sea imprescindible; no pedir fecha de nacimiento.
5. Definir roles y documentos con asesoria RGPD: responsable/encargado, finalidad, base legitimadora, datos de menores, contrato con profesionales, proveedores/subencargados, plazos de retencion, derechos, incidentes, EIPD si procede, politica y avisos. El uso profesional no exime RGPD.
6. Confirmar exportacion, borrado efectivo, logs y recuperacion en copia de seguridad sin usar datos reales. Validar programacion de purga `learner_privacy_audit`.
Criterio de salida: pruebas de aislamiento superadas, riesgos cerrados, politica de retencion documentada, revision legal pendiente explicita o completada.

## Fase P2 — metricas para seguimiento e investigacion futura
Principio: datos minimizados, medibles y reproducibles; NO interpretacion diagnostica.
- Definir evento de intento con: perfil seudonimo, session_id, fecha aproximada segun necesidad, dominio, familia, mechanic, version de estimulo/algoritmo, modalidad, nivel predefinido, dificultad estructural, condiciones de administracion, numero de oportunidades, aciertos, errores por tipo, omisiones, latencia fiable (si aplicable), pausas/interrupciones, ayudas y finalizacion.
- Distinguir: tiempo de presentacion vs tiempo real de respuesta vs espera guiada. El navegador no mide conducta no observable.
- Evitar almacenar respuestas libres o documentos con datos personales como metricas. Decidir si retener datos por ensayo o solo agregados justificados.
- Definir panel profesional con series por tarea comparable, numero de intentos, precision, omisiones, latencia y cambios de dificultad. Evitar rankings clinicos, percentiles, etiquetas de trastorno, «edad cognitiva» o promesas de eficacia.
- Documentar cambios de mecanica y version para evitar falsas comparaciones longitudinales.
- Para investigacion futura: consentimiento/base juridica y protocolo independiente, posibles exportaciones agregadas, control de practica y validacion externa; no asumir reutilizacion automatica de datos.

## Fase P3 — ejercicios ecologicos y Actua con reglas
### Velocidad / Atencion
Priorizar escenas controladas (catalogo, ticket, telefono, web, cartel, pizarra, calle, plano) con objetivos observables: encontrar icono, codigo, aviso, dato u objeto; aumentar complejidad y distractores sin sustituir velocidad por comprension lectora. Documentar demandas motoras y de lectura. Precision + tiempos solo cuando hay eventos medibles. Comparar formatos equivalentes.

### Actua con reglas
- Modalidad A «Espera guiada»: temporizador visible, instruccion concreta y sin pulsacion obligatoria en la primera implementacion. Registrar intervalo programado, finalizacion, reinicios e interrupciones observables; la finalizacion del temporizador no demuestra que se haya mantenido la espera. Una futura version por pulsacion podra registrar anticipaciones, omisiones y latencias observadas.
- Modalidad B «Reglas y cambio»: respuesta o inhibicion en funcion del estimulo, sin pista temporal que resuelva la regla; reglas e inversiones graduadas. Diferenciar errores de comision, omision, y cambio.
- No mezclar puntuaciones ni curvas de A y B. No atribuir medida clinica de inhibicion a partir de la modalidad A.
- Evaluar tactil/movil, accesibilidad, bloqueos involuntarios, lector de pantalla, brillo/contraste y ritmo.

### Auditoria de variedad
Contar familias semanticas y mecanicas reales por edad/dominio/nivel; evitar inflar el inventario por cambios superficiales o permutaciones. Registrar porcentaje de repeticion y contextos realmente distintos. Documentar pruebas antes/despues.

## Fase P4 — lanzamiento
1. Control editorial y accesibilidad por cinco franjas y tres niveles; comprobar fallos y abandonos.
2. Consentimientos/contratos/privacidad y roles de profesionales terminados.
3. Produccion, beta y funciones Edge versionadas e identificables; backup y plan de rollback probado.
4. Stripe: solo pasar a modo real tras pruebas de checkout, webhook, cancelaciones y vinculacion segura (ver `docs/stripe-live-readiness.md`).
5. Dominio gliax.es despues de confirmacion OVH; mantener URL anterior mientras se prueba.
6. Publicar como herramienta de practica/seguimiento, no evaluacion clinica, con limitaciones claras.

## Primer lote ejecutable recomendado
A. Pruebas de privacidad multi-cuenta y estado de Auth, sin modificar datos reales.
B. Definir esquema minimo de eventos de metricas y revisar `detail` y `progress` reales con datos ficticios.
C. Prototipo version A «Espera guiada» sin pulsacion obligatoria, con finalizacion del intervalo y metricas separadas de reglas.
D. Auditoria cuantitativa de familias y seleccion por edad; priorizar velocidad ecologica.
E. Terminar y verificar identidad GLIAX en PR #50.
Cada lote en PR revisable con tests, capturas movil/escritorio, notas de migracion y sin merge/despliegue automatico.


## Preparación conjunta PR #50 + PR #51 (17 de noviembre de 2026)
Rama temporal de revisión: `integration/gliax-pr50-pr51-20261117`.
La rama integra la landing y los estilos de marca de PR #50 con las mejoras de privacidad, métricas y ejercicios de PR #51. No se han aplicado las migraciones ni desplegado las funciones Edge o el frontend. Las PR originales y las ramas `main` y `desarrollo` permanecen intactas. Verificar pruebas conjuntas, interfaz responsive y contratos de Supabase antes de cualquier despliegue.

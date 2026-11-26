# GLIAX R19.3

Base R19.2 desplegada en Staging `52a08e76db7b6ab6440f5398fcf6539168a210ef`. El desarrollo y las pruebas se ejecutan en la rama de trabajo y en servicios locales con datos sintéticos.

## Hitos y condiciones de aceptación

| Hito | Estado de partida | Prueba de aceptación |
| --- | --- | --- |
| Selector y banco | La navegación real llama a `GliaxR192Practice.createSession`. La selección R19.2 pondera huellas, reinicia exposiciones al salir de Entrenamiento y admite repeticiones de estructura. | Comparar secuencias por celda, controlar repeticiones evitables, probar navegación real y separar variantes de casos revisados. |
| Persistencia y adaptación | `exercise_results` y el contrato RLS versionado guardan resultados clásicos. R19.2 termina en memoria. El catálogo de esquema de Staging devolvió HTTP 403. | Dos perfiles sintéticos, alto desempeño y dificultad, reapertura de sesión, aislamiento e intervención profesional. Verificación del esquema alojado y autorización separada antes de integrar persistencia. |
| Simulaciones y rediseño | `digitalFamilyControl` muestra el selector de pantalla y las actividades pasan por `CommunicationContent`. Frontend Design y GLIAX Development se verificaron en la rama base y en el catálogo del servidor local de Codex. Modern Web Guidance no se encontró en este entorno. | Observar calendario, correo, buscador, mensajería, archivos, formulario y reservas con interacción propia, escritorio y móvil. Aplicar Frontend Design y GLIAX Development durante el rediseño. |
| Regresión y QA | Se mantiene el contrato histórico y el despliegue vigente. | Ejecutar extremo a extremo y registrar las pruebas locales, alojadas y de revisión editorial por separado. |

## Inventario y ampliación

El inventario cubre 120 combinaciones de ocho familias, cinco edades y tres niveles. Hay 114 celdas con oferta y 51 con un único candidato. Actúa con reglas y Recursos y tiempo carecen de oferta para 6–7 en la fuente base. Esa cobertura exige definir y revisar una actividad apropiada antes de habilitarla. El inventario de estructuras es técnico y por celda. La suma de huellas no acredita por sí sola diferencias cognitivas revisadas.

| Familia | Candidatos disponibles | Estructuras por celda, sumadas | Celdas de un candidato | Meta de casos nuevos |
| --- | ---: | ---: | ---: | ---: |
| Cambio de plan | 15 | 15 | 15 | 60 |
| Encuentra la contradicción | 15 | 15 | 15 | 80 |
| ¿Qué necesitas saber? | 16 | 16 | 14 | 60 |
| Actúa con reglas | 36 | 34 | 0 | 60 |
| Planificación | 62 | 17 | 0 | 60 |
| Recursos y tiempo | 576 | 72 | 0 | 60 |
| Cambio de objetivo | 45 | 21 | 7 | 60 |
| Supervisión | 66 | 33 | 0 | 60 |

Las metas suman 500. La primera muestra debe cubrir las ocho familias y priorizar celdas unitarias y edades desatendidas. Cada ficha debe fijar un ID, edad, nivel, mecanismo, contexto, estructura, estímulo, solución y equivalencias, distractores, feedback, diferencia frente al caso más cercano y prueba de corrección. Se revisará con la rúbrica R19.2 y se registrará aceptación por celda. Los lotes siguientes se incorporarán tras esa revisión. El inventario actual registra cero casos nuevos aceptados.

## Medición de selección

`node tools/gliax-r193/audit-bank.cjs` reproduce el inventario y la simulación con una semilla fija de presentación para comparar las dos políticas sobre la misma oferta. Se midieron 7.560 transiciones en celdas con dos o más candidatos. Las repeticiones consecutivas evitables de mecanismo pasaron de 499 a 0, las de estructura de 706 a 0 y las de contexto de 727 a 0. Los ID y estímulos a semilla fija ya estaban en 0. Persisten repeticiones inevitables con la oferta actual. La navegación mantiene la exposición al salir a otra sección y la reinicia al cambiar de perfil o cerrar sesión. Cambiar edad o nivel conserva su filtro exacto. La percepción del alumno requiere observación posterior.

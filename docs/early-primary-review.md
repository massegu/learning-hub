# Adaptación 6–7 e integridad de fichas

Rama: `fix/early-primary-stimulus-integrity`, creada desde `origin/main`
`b2768be0264f2012e2718aa86e47bc3f3f0419a7`. No se fusiona ni despliega.

## Arquitectura y causas

- `js/app.js` define los grupos originales `primary`, `middle` y `teen`.
  `js/v16_7.js` añade `early` y `junior` a la interfaz, conserva
  `age_band: primary` para la base de datos y guarda la ruta en
  `progress.ageRoute`. El núcleo seguía consultando `AGE[age_band]`:
  cambiar el rótulo no cambiaba sus áreas ni imponía restricciones al contenido.
- Cada área y sesión guiada pide contenido mediante `requestOne` y
  `LearningAPI.requestContent`. Las fichas llaman a la misma función con
  `kind: worksheet`, `domains`, `questions` y `profile_id`. No existía un
  banco imprimible explícito para `early` en el cliente.
- El generador es la función Supabase `request-learning-content`. Su código
  **no está en este checkout**. El README describe la versión remota V32;
  no permite verificar qué restricciones aplica actualmente ese despliegue.
- El modelo anterior mezcla `q`, `a`, `opts`, `memoryQuestion`,
  `memoryContent`, `scenario`, `text`, `visual`, `rows`, `model`, etc.
  No declaraba de forma uniforme qué estímulo necesitaba cada pregunta.
- `js/docx.js`, V16.3 y V16.4 implementaban exportadores distintos.
  Los parches podían sustituir el exportador vigente varias veces al arrancar.
  V16.4 omitía material de memoria y lectura. V16.17 añadía la respuesta a
  una lista cuando faltaba: fabricaba información en vez de validar el estímulo.
- No había manifiesto de pruebas ni suites automatizadas en `main`.

## Perfil, selección y variedad

`js/content-policy.js` define `early` como un contrato versionado, basado en
los metadatos del perfil y nunca en el texto mostrado. Limita las ocho áreas,
contextos, mecánicas, tipos de respuesta, cantidad de lectura, longitud de frases,
opciones, elementos, columnas de tablas y carga de memoria. El control de palabras
abstractas y contextos adultos es una defensa adicional; no sirve para transformar
actividades adultas por sustitución de palabras.

`js/early-content.js` contiene familias redactadas específicamente para esta edad.
Los sustantivos llevan artículo, género, plural y frase de lugar; los generadores
conservan concordancia, cuantificadores y contracciones. Atención incluye figuras
simples y pequeñas secuencias; memoria usa objetos, lugares, orden y asociaciones
de personas con globos. Lectura usa textos breves, comprensión literal, inferencia
simple y orden de acontecimientos. Planificación, inhibición, organización,
analogías, patrones y problemas cotidianos conservan sus constructos.

Hay 455 actividades distintas por nivel: lenguaje 60, matemáticas 61, lectura 96,
atención 56, funciones ejecutivas 38, memoria 44, velocidad/razonamiento 48 y
cognición aplicada 52. Esto son **1.365 actividades validadas al recorrer los tres
niveles, no 1.365 estímulos completamente distintos**: muchos se conservan entre
niveles para no aumentar artificialmente la dificultad. Las identidades se basan
en el contenido visible; cambiar de nivel no hace que una misma actividad parezca
nueva. Se eliminan duplicados, se evitan mecánicas recientes y se guarda el historial
en `progress._earlyDelivery`. La memoria progresa entre dos, tres y cuatro elementos.

La selección compartida se aplica tanto a ejercicios como a fichas **después** de
una respuesta satisfactoria del servidor. Se conserva su contabilidad `usage` y
su identificador de origen. Nunca se sirven actividades tras un error de cuota,
autorización o suscripción; tampoco se generan más actividades de las que entregó
el servidor ni se hacen reintentos automáticos que consuman cuota.

No se han cambiado `js/api.js`, tablas, credenciales, pagos, autenticación ni
límites. El alias de base de datos de los perfiles 6–7 sigue siendo `primary`.
La persistencia conserva `ageRoute`, `_delivery` y demás metadatos del perfil.
La selección interactiva de las otras edades conserva la respuesta original.

## Estímulo → pregunta → respuesta

`js/activity-model.js` valida un modelo común:

- `stimulus`: bloques explícitos de texto, lista o tabla;
- `requiresStimulus`: dependencia declarada; las actividades heredadas se tratan
  como dependientes por defecto;
- pregunta, opciones y respuesta, o pasos disponibles y secuencia esperada.

El adaptador de actividades heredadas conserva **todos** sus campos de material,
no solo el primero encontrado. Las asociaciones de memoria incluyen persona y
detalle. Las filas se conservan como tablas. Las cuadrículas necesitan declarar
`gridColumns` para conservar su disposición; no se aplana una tarea espacial.
Una actividad independiente puede declarar explícitamente
`requiresStimulus: false`; los tipos dependientes no pueden usarlo para saltarse
la comprobación. También se aceptan operaciones numéricas de división autónomas.

`js/docx.js` valida todo el lote antes de crear o descargar archivos. Renderiza
los bloques antes de la pregunta, conserva opciones y pasos, aumenta el tamaño
de letra para 6–7 y mantiene los nombres de DOCX/ZIP. Si falta material, la
respuesta no está entre las opciones, una secuencia es irresoluble o el componente
no es imprimible, se rechaza la actividad y no se descarga ninguna versión.
La solicitud de fichas valida cada respuesta antes de pedir la siguiente versión.
No se hace una nueva petición para reemplazar contenido rechazado, pues podría
consumir otra cuota sin entregar una ficha válida.

V16.3 y V16.4 reconocen el exportador canónico y ya no lo sustituyen.
V16.17 deja de cargarse. Los parches de nombres y presentación se mantienen;
V16.8 ya no sobrescribe las descripciones infantiles del perfil explícito.

## Archivos y componentes

- Nuevos: `js/content-policy.js`, `js/early-content.js`, `js/activity-model.js`.
- Integración: `js/app.js`, `index.html`, `js/docx.js`.
- Compatibilidad de parches: `js/config.js`, `js/v16_3.js`, `js/v16_4.js`,
  `js/v16_8.js`.
- Presentación del estímulo: `css/styles.css`, solo tablas/listas dentro del
  componente existente; sin rediseño general.
- Validación: `package.json`, `package-lock.json`, `.gitignore`,
  `tests/content.test.js`, `tests/worksheet.test.js`, `tests/browser-smoke.py`.

## Pruebas reproducibles

Desde la raíz del repositorio, con Node ≥18:

```sh
npm ci
npm test
```

Las dependencias fijadas `docx@8.5.0` y `jszip@3.10.1` son solo de desarrollo;
la aplicación estática sigue sin requerir compilación. Las pruebas recorren los
tres niveles y todas las áreas, rechazan contextos/mecánicas/lenguaje incompatibles,
comprueban gramática estructurada, memoria, antirrepetición, límites del sobre
del servidor y conservación del estímulo. También generan DOCX y ZIP reales y
examinan `word/document.xml`, incluyendo estímulos antes de preguntas, tablas,
opciones, pasos y rechazo atómico de lotes inválidos.

Prueba adicional con Playwright para Python y Chromium en `/usr/bin/chromium`:

```sh
python3 tests/browser-smoke.py
```

Arranca su propio servidor efímero. Usa las librerías fijadas y simula únicamente
la frontera de Supabase: sesión, perfiles, persistencia, banco y errores de cuota.
Comprueba las ocho áreas, memoria con ocultación, respuestas, dos DOCX de veinte
actividades en un ZIP real, creación de perfil 6–7, preservación de metadatos,
errores de cuota sin contenido local y contenido interactivo de un grupo mayor.
No realiza escrituras en cuentas reales ni valida el despliegue de Supabase.

Resultado en este entorno: `npm ci` correcto; `npm test`, 18 pruebas pasadas,
ninguna fallida ni omitida; las seis comprobaciones del navegador pasadas;
comprobación de sintaxis JavaScript y `git diff --check` correctas.

## Revisión pendiente y límites

- El banco remoto de Supabase y sus familias de vuelos, horarios, códigos,
  descuentos y documentos adultos siguen necesitando revisión en el repositorio
  del backend. No se seleccionan para 6–7 en este cliente. Otros consumidores
  del backend no reciben esta protección del navegador.
- Las imágenes, SVG, componentes visuales desconocidos y mecánicas complejas
  sin representación imprimible se rechazan. Las fichas heredadas de cualquier
  edad que dependan de ellos necesitan un adaptador o un equivalente explícito;
  las preguntas autónomas heredadas sin contrato también requieren etiquetado.
- Solo se admite una conversión HTML de documentos textuales conocidos
  (`.lh-doc`). No se intenta convertir cualquier imagen en texto.
- Lectura/inferencias, analogías y relaciones espaciales, y planificación de
  rutinas merecen revisión editorial con especialistas para ajustar familiaridad
  cultural y autonomía lectora. Las pruebas estructurales no certifican calidad
  pedagógica ni sustituyen esa revisión. Las futuras familias deben redactarse
  para el perfil, declarar su mecánica/contexto y pasar estas pruebas.
- No se ha probado autenticación, facturación ni cuotas contra una cuenta real.
  Sus funciones de producción permanecen intactas; se comprueba la integración
  y el comportamiento ante rechazo mediante simulación.

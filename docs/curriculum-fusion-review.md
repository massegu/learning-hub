# Fusión de áreas y ampliación inicial — 16 de octubre de 2026

Rama `fix/early-primary-stimulus-integrity`. Código y prueba local; sin merge ni
publicación de la función en Supabase.

## Áreas y compatibilidad

La navegación, los paneles por edad, el constructor de sesiones y las fichas reúnen
Funciones ejecutivas, Cognición aplicada y Razonamiento bajo **Funciones ejecutivas**
(«Planifica, razona y revisa»). **Velocidad de procesamiento** conserva el identificador
interno `speedReasoning`, pero entrega comparaciones visuales, coincidencias exactas y
claves de códigos. Los ejercicios de razonamiento de los bancos escolares revisados
y `TeenReview` se integran en Funciones ejecutivas; no se recuperan las comparaciones
históricas de una cifra para adolescentes.

El catálogo público y las fichas por defecto omiten `applied`, `reading` en 10–12 y
`middleReading` en 13–15. Las llamadas explícitas con esos identificadores siguen
aceptándose para compatibilidad, sin volver a crear entradas duplicadas en el menú.
Las misiones conservan sus identificadores y posiciones; los pasos de `applied`
pasan a Funciones ejecutivas. En 6–7 la última actividad de «Una vuelta por el Lab»
pasa a Memoria para mantener cinco áreas diferentes.

La migración de progreso se ejecuta una sola vez (`_curriculumRevision: 2`):

- Conserva totales, sesiones y misiones. Archiva puntuaciones, niveles e histórico
  originales en `_curriculumLegacy`; las filas trasladadas conservan `originalSubject`.
- Reúne puntuaciones e histórico de las áreas fusionadas. La Lectura independiente
  de 10–12 y 13–15 se muestra bajo Lectura y escritura.
- Reinicia en nivel 1 las dos áreas que cambian de significado: Funciones ejecutivas
  y Velocidad de procesamiento. Los resultados anteriores no constituyen una línea
  de base de velocidad ni provocan una subida inmediata del nivel nuevo.
- Los tiempos nuevos se conservan en el JSON de progreso y en el CSV detallado;
  no se añaden columnas a la tabla `exercise_results` ni se reescribe su histórico.

## Lectura y escritura

`js/reading-library.js` contiene **50 fuentes escritas**, diez por franja. Los textos
no son cambios de nombre del mismo párrafo. Incluyen relatos, procedimientos,
mensajes, proyectos, avisos, reclamaciones y lectura crítica de datos.

| Edad | Textos | Palabras del texto fuente |
| --- | --- | --- |
| 6–7 | 10 | 22–26 |
| 8–10 | 10 | 51–57 |
| 10–12 | 10 | 67–79 |
| 13–15 | 10 | 80–90 |
| 16–18 | 10 | 90–101 |

La identidad `passageKey` permanece al cambiar la pregunta o el nivel. La selección
rota diez fuentes antes de reutilizar una; persiste en el historial del servidor y,
para 6–7, en la selección local posterior a una respuesta autorizada. Pantalla y
fichas mantienen sus historiales de entrega separados.

En 6–7 se conserva Lectura breve. En 8–10 hay preguntas literales y de explicación.
Desde 10–12, Lectura y escritura alterna comprensión literal, explicación y escritura
con justificación en una pista del texto. La escritura muestra una lista de revisión
y un modelo con una cita de la fuente; la valoración sigue siendo del usuario, no una
corrección automática del texto. La lista también se imprime.

Diez fuentes no son treinta lecturas independientes por tener tres preguntas. Una
ficha solo de Lectura con más de diez fuentes diferentes se detiene con el mensaje
habitual de falta de contenido: hay que elegir diez ejercicios o añadir otras áreas.

## Memoria

Se entregan tres familias en todas las edades:

- Secuencias presentadas **una a una** y reconstruidas después con fichas de respuesta.
  Desde 10–12, el nivel 3 exige reconstrucción inversa. El material desaparece antes
  de habilitar las respuestas y los cambios de actividad cancelan la presentación.
- Posiciones en una cuadrícula que mantiene filas y columnas. La respuesta aparece
  sobre una cuadrícula vacía; desde 10–12 el nivel 3 pide dos posiciones en orden.
- Asociaciones entre personas y objetos, conservando una vía de memoria verbal.

| Edad | Secuencia / asociaciones: niveles 1, 2, 3 | Memoria espacial |
| --- | --- | --- |
| 6–7 | 2, 3, 4 | 2×2; 2, 3, 4 objetos |
| 8–10 | 3, 4, 5 | 2×2; 2, 3, 4 objetos |
| 10–12 | 4, 5, 6 | 2×2 al inicio; 3×3 y doble posición en nivel 3 |
| 13–15 | 5, 6, 7 | 2×2 al inicio; 3×3 y doble posición en nivel 3 |
| 16–18 | 6, 7, 8 | 2×2 al inicio; 3×3 y doble posición en nivel 3 |

La dificultad depende de carga, orden, inversión y relaciones, además de la exposición.
La proyección DOCX mantiene las cuadrículas e indica tapar el material. Para una
secuencia impresa, otra persona debe presentar los elementos uno a uno. No se afirma
que el papel reproduzca automáticamente la presentación temporal de la pantalla.

## Funciones ejecutivas

Las situaciones desde 8–10 incluyen el objetivo, el estado del plan y condiciones
que hay que relacionar. Las de 6–7 siguen siendo cortas y concretas. Se combinan:

- Supervisión de un plan con un incumplimiento y elección de su corrección.
- Comprobación de decisiones tanto correctas como incorrectas sobre registros reales.
- Aplicación de condiciones: estado y permiso; después límite de capacidad; en nivel 3,
  también confirmación de destino. Los identificadores y la posición de la respuesta varían.
- Planificación con dependencias entre acciones, sin mostrar una lista numerada que
  baste con copiar, y razonamiento de los bancos escolares previamente revisados.

Es una primera ampliación de familias y situaciones. No todos los ítems están
estandarizados ni se presenta el número de variantes como número de lecciones propias.

## Velocidad

Cada ensayo tiene un inicio explícito. Las instrucciones se leen antes de mostrar el
estímulo; no se cronometra la descarga del ejercicio. Se usan `performance.now()` y
botones o teclas 1–4. No hay cuenta atrás, tiempo normativo, bonificación por responder
al azar ni cambio de nivel basado en supuestas normas clínicas. Existe práctica sin
medir. Perder el foco o esconder la pestaña invalida el tiempo, no el resultado de
precisión.

Durante el ensayo se usa una disposición compacta que mantiene el estímulo y las
respuestas juntos en móvil. Las casillas de respuesta espacial conservan el orden
de filas y columnas aunque las opciones del servidor lleguen barajadas.

Se guardan tiempo, validez y familia. El feedback y Progreso muestran precisión y
mediana de respuestas correctas de las últimas veinte respuestas de **la misma tarea
y nivel**; no se mezclan familias para comparar tiempos. El CSV conserva esos campos.
Una ficha de estas tareas se identifica expresamente como práctica visual en papel,
no como medición de tiempo de respuesta. Dispositivo, tamaño de pantalla y forma de
respuesta pueden influir en los tiempos: no se les atribuye valor diagnóstico.

## Fuentes y validación

`reading-library.js` y `curriculum.js` se mantienen iguales en `js/` y en el paquete
Edge; la comprobación automática verifica los bytes. El paquete completo tiene doce
importaciones locales. Los bancos académicos previos y la autorización, cuotas y
selección de país guardado se conservan.

Pruebas:

```sh
npm test
python3 tests/browser-curriculum.py
```

Resultado de esta revisión: **107 pruebas Node pasan, sin omisiones**; la prueba de
navegador completa **142 respuestas, diez DOCX y cinco CSV**. La comprobación específica
del contrato compartido también pasa después del ajuste final de disposición.

La prueba de navegador utiliza la aplicación y el handler reales, cuenta/DB ficticias,
México, los cinco perfiles, fuentes distintas, memoria de niveles 1 y 3, teclado,
respuestas correctas e incorrectas, tiempo invalidado, práctica sin medir, restauración,
CSV, pantallas 1280/390 y DOCX reales. Las pruebas Node cubren los ocho locales,
respuestas derivadas de los datos, corrupción de secuencias/posiciones, rotación tras
cambio de nivel y migración idempotente.

La comprobación nativa de Deno sigue siendo diagnóstica: utiliza el SDK real y las doce
importaciones locales, pero el proxy impide resolver la declaración ambiental JSR y
se usa la sustitución local documentada. No equivale a validar un despliegue oficial.

# Revisión editorial y regional — 16 de octubre de 2026

Rama `fix/early-primary-stimulus-integrity`, a partir de `3d25762`.
Sin merge, despliegue ni cambios en datos de producción.

## Correcciones de las capturas

El título del proyecto se repetía en la etiqueta superior y como una frase aislada
dentro del estímulo. El renderizador ahora omite esa segunda aparición cuando hay
otros bloques y el título ya está visible. La representación canónica conserva el
título para que la ficha independiente tenga su contexto una sola vez. Las preguntas,
listas, tablas y respuestas permanecen completas.

Las frases de conectores de 10–12 eran genéricas, aunque llevaban un título de
proyecto específico. Se escribieron tres situaciones por cada uno de los seis
proyectos. Ejemplos:

- Huerto: «Regamos las plantas del huerto ___ la tierra estaba seca» (`porque`).
- Huerto, consecuencia: «La tierra del huerto estaba seca; ___ regamos las plantas»
  (`por eso`).
- Historias: «Reescribimos el final del cuento ___ no explicaba cómo volvía el robot
  a casa» (`porque`).
- Radio: «Volvimos a grabar la entrevista ___ no se oía bien» (`porque`).

También se corrigieron las etiquetas estáticas antiguas 12–13/14–17 que aún podían
aparecer en el panel y las recomendaciones. Los valores de base de datos `middle`
y `teen` no cambian.

## Defecto regional confirmado

Existían dos sistemas: el lexicón controlado del navegador y unos reemplazos
recursivos más antiguos del servidor. Estos últimos podían producir artículos
incorrectos, convertir «autobús» en «camión» para todo México, alterar un espécimen
de English Lab o modificar campos internos. Además, la selección del servidor no
comprobaba la compatibilidad regional. Un ejercicio en euros podía consumir uso e
historial y ser rechazado después por el cliente. Ese es el aviso técnico de la
captura de Colombia.

El módulo del servidor `locale-content.js` es ahora una copia idéntica del módulo
canónico `js/locale-content.js`, necesaria porque el paquete desplegable de la
función contiene sus propios archivos. Una prueba exige igualdad byte por byte.
Se eliminaron los mapas antiguos y la localización recursiva de todos los campos.

## Flujo actual

1. El selector de país guarda `accounts.content_locale` mediante la API existente.
   La revisión local utiliza una cuenta ficticia.
2. La solicitud lleva perfil, área, habilidad, nivel y país. El servidor usa el país
   guardado en la cuenta; si falta, usa el del perfil. No confía en el país enviado
   para anular una preferencia guardada. Ambos lados normalizan valores desconocidos
   a `es_intl`.
3. Para 8–18, los candidatos generados se adaptan y comprueban con las reglas
   compartidas **antes de seleccionarlos y escribir uso/historial**. Se descartan
   candidatos incompatibles y la selección usa los restantes. Una caché acotada
   evita repetir el trabajo para el mismo contenido y país; no modifica IDs ni
   respuestas del objeto fuente.
4. Si no hay candidatos compatibles, el ejercicio devuelve 422 con un mensaje
   comprensible y sin escrituras. La ficha tampoco escribe un lote incompleto.
5. El cliente conserva su puerta independiente de localización y su revisión de
   integridad antes de mostrar o exportar. Se adaptan en conjunto estímulos,
   preguntas, opciones, respuestas, explicaciones y criterios de escritura.
6. En 6–7 se mantiene la selección local revisada después de la respuesta autorizada
   del servidor y se aplica el mismo lexicón del cliente. No se sustituye esa
   arquitectura ni se sirve contenido local después de un rechazo del servidor.
7. Las fichas comparten las mismas reglas. English Lab conserva el espécimen, las
   opciones y la clave en inglés; se adaptan las instrucciones españolas.

El rechazo de moneda sigue activo: no se convierten automáticamente euros a pesos
ni se conserva un importe cambiando solo el símbolo. Se elige otra actividad.
Una actividad extranjera solo es aceptable con contexto extranjero explícito,
como el ejemplo de prueba «En un viaje a España…», y mantiene la moneda original.

## Terminología y adaptación real

Se conserva el lexicón controlado anterior de escuela, ropa, alimentos, hogar,
tecnología, compras, deporte, recreo y expresiones. Se añade una regla explícita de
autobús: México mantiene «autobús»; no se equipara cualquier autobús con un camión.
«Bus de datos», «camión», «biblioteca móvil» y otras acepciones ambiguas no se
reinterpretan como vocabulario de transporte o telefonía.

En las frases redactadas que sí hablaban de un teléfono, se escribió «teléfono móvil»
para declarar el sentido y permitir la adaptación existente a «teléfono celular».
En los recuerdos que identificaban explícitamente un sándwich se usa «sándwich»,
neutral y natural, en lugar de cambiar indiscriminadamente cualquier «bocadillo».

Ejemplos de las reglas compartidas, comprobados automáticamente:

| País | Tecnología/escuela | Hogar | Transporte |
| --- | --- | --- | --- |
| España | el ordenador, el bolígrafo | el frigorífico | el autobús |
| México | la computadora, la pluma | el refrigerador | el autobús |
| Colombia | el computador, el esfero | la nevera | el bus |
| Argentina | la computadora, la lapicera | la heladera | el colectivo |
| Chile | el computador, el lápiz pasta | el refrigerador | el bus |
| Panamá | la computadora, el bolígrafo | el refrigerador | el bus |
| Costa Rica | la computadora, el lapicero | el refrigerador | el bus |

Una actividad con «semilla», «maceta», «lápiz», «mapa» o instrucciones neutrales puede
ser idéntica en varios países. Eso es correcto; el país no debe introducir cambios
artificiales en todas las frases. Los bancos actuales de 8–15 contienen mucho
vocabulario común. La tabla demuestra reglas disponibles, no que todas esas palabras
aparezcan en cada banco o en cada sesión.

## Verificación

- `npm test`: 96 pruebas aprobadas; cero fallos y cero omitidas.
- `node tests/locale-production-audit.js`: enumera los bancos actuales de 6–15,
  el módulo revisado de 16–18 y todos los índices acotados de las siete áreas
  históricas restantes de esa edad. Cada país más internacional tiene 11.586
  candidatos examinados, en todas las áreas y niveles. Son instancias de candidatos,
  **no 11.586 ejercicios pedagógicamente distintos**. Ninguna combinación de
  país/edad/área/nivel queda sin candidatos compatibles.
- En los seis países latinoamericanos se excluyen 420 instancias antiguas por
  moneda: Atención 60, Funciones ejecutivas 60, Memoria 240 y Cognición aplicada 60,
  todas de 16–18. España e internacional no tienen esos rechazos. La prueba conserva
  los bloqueos, sin presentar como localizada una actividad monetaria incompatible.
- `python3 tests/browser-locale-content.py`: 350 actividades respondidas (10 por
  combinación país/edad, cubriendo todas las áreas visibles) y 35 fichas DOCX de
  20 actividades. Se comprueba que cada pregunta tenga antes todos sus estímulos
  y que opciones/tokens estén presentes. Sin errores de página ni recursos HTTPS
  externos. Utiliza el lanzador editorial, los cinco perfiles ficticios y el
  manejador real; no reemplaza sus respuestas por cadenas de prueba.
- `python3 tests/browser-stages.py`: regresión de Lenguaje e iconos de 6–7,
  progresión/restauración de 8–15, misiones, temas y exportación DOCX aprobada.
- Diagnóstico Deno: tipos y carga de diez módulos locales aprobados; OPTIONS 200,
  GET 405, POST sin autenticación 401. Persiste la sustitución diagnóstica de la
  declaración de tipos JSR por el bloqueo de `jsr.io`; no es validación oficial del
  despliegue.

La prueba unitaria del manejador comprueba además que una petición con `locale`
distinto al país guardado no cambia la decisión del servidor. Un banco enteramente
incompatible se rechaza en ejercicios y fichas sin escribir uso ni historial.

## Límites pendientes

Esta fase no equivale a una revisión lingüística por hablantes de los siete países.
Se mantienen instrucciones neutrales de tuteo; no se fuerza voseo argentino ni se
imitan giros coloquiales regionales. Los términos con acepciones ambiguas necesitan
contexto o metadatos explícitos, no sustituciones generales.

La corrección acotada de 16–18 de la fase anterior sigue sin calibrar por completo
sus otras siete áreas. El filtrado regional reduce algunos de sus pools monetarios
en Latinoamérica; hará falta crear actividades de compra con importes y monedas
revisados por país si se desea recuperar esas familias allí.

No se ha desplegado esta función ni validado contra Supabase real. El modo local
sí utiliza el paquete actualizado; Cloudflare y un servidor estático siguen
dependiendo de la versión publicada de la función. Un servidor antiguo puede
seguir enviando actividades rechazadas por el cliente; ahora el cliente muestra
un mensaje comprensible en lugar de la explicación técnica interna.

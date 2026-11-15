# ROADMAP TÉCNICO LEARNING HUB

## PRINCIPIO DE PRODUCTO

Learning Hub es una plataforma para niños y adolescentes.

Su valor diferencial debe ser:

**entrenamiento cognitivo + utilidad funcional + transferencia ecológica + contenido educativo significativo.**

Las actividades no deben limitarse a medir o practicar habilidades aisladas. Siempre que sea posible, deben situar esas habilidades en contextos reconocibles y útiles:

- escuela;
- organización personal;
- convivencia;
- comunicación;
- interpretación de información;
- planificación;
- toma de decisiones;
- documentos de la vida cotidiana;
- situaciones propias de cada edad.

La plataforma no debe presentarse como diagnóstica ni clínica.

Los niveles representan **dificultad de la actividad**, no “nivel cognitivo” del usuario.

---

# FASE 1 — CALIDAD DEL CONTENIDO

## Objetivo

Reducir repetición superficial, aumentar variedad pedagógica real, mejorar la progresión de dificultad y garantizar que cada tarea tenga sentido funcional.

Esta fase debe actuar sobre:

- Lenguaje;
- Lectura + Escritura;
- Matemáticas;
- Atención;
- Memoria;
- Funciones ejecutivas;
- Velocidad de procesamiento;
- Social Lab;
- English Lab cuando corresponda.

## 1.1 Auditoría semántica real

Para cada franja de edad y dominio, distinguir explícitamente:

- `mechanic`
- `semanticFamily`
- `scenarioFamily`
- `stimulusType`
- `difficultyProfile`

No considerar como variedad sustancial:

- cambio de nombre;
- cambio de género del protagonista;
- sustitución de un objeto por otro;
- cambio de color;
- cambio de orden de respuestas;
- cambio de distractores sin cambiar la tarea.

Crear un inventario reproducible con:

- familias reales por dominio;
- peso de selección;
- porcentaje de exposición;
- familias dominantes;
- familias que aparecen demasiado en sesiones consecutivas.

## 1.2 Objetivo mínimo de variedad

Por cada dominio y franja:

- mínimo 8–10 familias pedagógicas distintas;
- objetivo deseable: 12–15;
- cada familia debe tener varios contextos realmente diferentes.

Priorizar las áreas que actualmente presentan más repetición.

## 1.3 Progresión L1 / L2 / L3

Crear una matriz explícita de dificultad por dominio.

La dificultad podrá variar mediante:

- número de elementos;
- número de pasos;
- semejanza entre distractores;
- cantidad de información;
- carga de memoria;
- necesidad de inferencia;
- número de reglas simultáneas;
- necesidad de actualización;
- manipulación de información;
- abstracción;
- velocidad cuando proceda.

No aumentar dificultad solo añadiendo texto.

## 1.4 Revisión editorial sistemática

Eliminar o reescribir:

- enunciados ambiguos;
- respuestas duplicadas;
- distractores absurdos;
- múltiples respuestas plausibles;
- situaciones adultas para edades infantiles;
- vocabulario excesivamente abstracto;
- contextos poco motivadores;
- tareas donde la respuesta se deduce por formato y no por contenido.

## 1.5 Estructura funcional/ecológica

Cada nueva familia debe declarar:

`functionalPurpose`

Ejemplos:

- localizar información importante;
- recordar instrucciones;
- organizar materiales;
- comparar alternativas;
- seguir un horario;
- interpretar una señal;
- corregir un plan;
- escribir un mensaje;
- identificar una contradicción;
- tomar una decisión con datos;
- detectar información irrelevante.

No crear una familia nueva si no puede explicarse para qué sirve.

## 1.6 Documentos y escenas como fuentes de variedad

Aumentar materiales funcionales:

- carteles;
- horarios;
- tickets;
- menús;
- mapas;
- formularios;
- mensajes;
- chats ficticios;
- instrucciones;
- etiquetas;
- infografías;
- calendarios;
- tablas;
- folletos;
- reservas;
- catálogos;
- avisos escolares;
- pequeñas publicaciones digitales.

El mismo documento puede generar preguntas diferentes sin contar cada pregunta como una familia nueva.

## 1.7 Validación

Crear pruebas que detecten:

- duplicados;
- near-duplicates;
- concentración excesiva de familias;
- nivel incorrecto;
- respuestas ambiguas;
- actividades sin propósito funcional;
- estímulos incoherentes;
- repetición semántica dentro de sesiones.

## Entregable Fase 1

Codex debe entregar:

- inventario before/after;
- familias añadidas/eliminadas;
- peso de selección antes/después;
- matriz de dificultad;
- ejemplos por edad y dominio;
- tests;
- limitaciones pendientes.

No fusionar automáticamente.

---

# FASE 2 — TAREAS COGNITIVAS MÁS “EJECUTADAS” Y MENOS VERBALIZADAS

## Objetivo

Que Atención, Memoria y Funciones Ejecutivas entrenen realmente la habilidad y no dependan demasiado de leer y contestar una pregunta verbal.

---

## 2.1 Memoria

Ampliar familias:

### Memoria serial
Recordar secuencia.

### Memoria espacial
Recordar posiciones.

### Asociaciones
Persona–objeto, lugar–objeto, símbolo–acción.

### Cambio en escena
¿Qué objeto desapareció?

### Movimiento
¿Qué objeto cambió de sitio?

### Instrucciones
Recordar 2–5 pasos.

### Microhistoria
Recordar datos relevantes de una escena o pequeña historia.

### Memoria de trabajo
Recordar y transformar:

- orden inverso;
- seleccionar solo algunos elementos;
- actualizar cuando aparece nueva información.

Separar internamente:

`shortTermMemory`
`workingMemory`

---

## 2.2 Atención

Incluir:

- búsqueda visual;
- comparación;
- diferencias;
- cancelación;
- información relevante;
- distractores;
- orientación;
- coincidencia;
- exploración de escenas;
- seguimiento de instrucciones visuales.

Reducir tareas que dependan principalmente de lectura.

---

## 2.3 Funciones ejecutivas

Aumentar tareas interactivas:

### Flexibilidad
Primero una regla, después otra.

### Inhibición
Responder solo bajo determinadas condiciones.

### Planificación
Ordenar acciones con dependencias.

### Supervisión
Detectar un error en un plan.

### Actualización
Cambiar la decisión cuando aparece un nuevo dato.

### Organización
Clasificar elementos o distribuir recursos.

### Resolución funcional
Elegir entre alternativas justificadas por condiciones.

Menos:

“¿Cuál es la mejor estrategia?”

Más:

“Hazlo / ordénalo / corrígelo / cambia la regla / selecciona”.

---

## 2.4 Reducir cargas secundarias

Cada familia cognitiva debe declarar:

- `primaryConstruct`
- `secondaryLoads`
- `readingDemand`
- `visualDemand`
- `motorDemand`

Ejemplo:

```text
primaryConstruct: spatialMemory
secondaryLoads: visualRecognition
readingDemand: minimal
```

La carga lingüística no debe dominar una tarea cuyo objetivo principal no sea lingüístico.

---

## 2.5 Feedback funcional

El feedback debe explicar qué ayudó.

Ejemplo:

“Has recordado correctamente las posiciones.”

No:

“Tu memoria es buena.”

---

## Entregable Fase 2

- nuevas familias cognitivas;
- reducción de tareas excesivamente verbalizadas;
- matriz de cargas secundarias;
- ejemplos interactivos;
- tests;
- auditoría de accesibilidad.

---

# FASE 3 — LECTURA + ESCRITURA COMO EJE FUNCIONAL

## Objetivo

Convertir Lectura + Escritura en uno de los elementos diferenciales de Learning Hub.

---

## 3.1 Documentos visuales como núcleo

Crear una biblioteca amplia de documentos ficticios realistas.

Categorías:

### Escuela
- circular;
- horario;
- instrucciones;
- email;
- cartel;
- calendario.

### Vida cotidiana
- ticket;
- menú;
- receta;
- mapa;
- anuncio;
- reserva;
- etiqueta.

### Adolescentes
- correo;
- mensaje;
- post;
- noticia breve;
- gráfico;
- oferta;
- formulario;
- reclamación;
- comparativa;
- presupuesto.

---

## 3.2 Preguntas derivadas

Cada documento debe permitir varios tipos:

- localizar;
- inferir;
- comparar;
- interpretar fechas;
- interpretar precios;
- identificar propósito;
- identificar destinatario;
- distinguir dato/opinión;
- detectar información irrelevante;
- resumir;
- redactar una respuesta.

---

## 3.3 Escritura funcional

Toda tarea escrita debe tener, cuando proceda:

- destinatario;
- propósito;
- fuente;
- extensión;
- criterios.

Ejemplos:

- escribir un mensaje;
- responder un email;
- resumir un aviso;
- corregir una afirmación;
- redactar una reclamación;
- explicar una decisión;
- comparar dos fuentes;
- escribir una conclusión;
- reescribir una instrucción ambigua.

---

## 3.4 Dificultad por edad

6–7:
- frases;
- órdenes simples;
- pequeñas escenas;
- información concreta.

8–10:
- mensajes;
- avisos;
- pequeños textos funcionales.

10–12:
- comparación de fuentes sencillas;
- explicación con evidencia.

13–15:
- síntesis;
- inferencia;
- opinión justificada.

16–18:
- argumentación;
- comparación de fuentes;
- registros;
- escritura funcional avanzada.

---

## 3.5 Accesibilidad documental

Mantener:

`Ver versión en texto`

Debe:

- estar plegado por defecto;
- transcribir correctamente;
- no revelar respuestas;
- funcionar con lector de pantalla.

---

## Entregable Fase 3

- biblioteca ampliada;
- taxonomy de documentos;
- número de familias;
- preguntas asociadas;
- tareas escritas;
- pruebas DOCX/pantalla;
- auditoría por edad.

---

# FASE 4 — ADAPTACIÓN INTELIGENTE DE DIFICULTAD

## Objetivo

Pasar de adaptación por precisión global a adaptación por mecánica y perfil de rendimiento.

---

## 4.1 Unidad adaptativa

No:

`domain -> level`

Sí:

`domain + mechanic + difficultyDimension`

---

## 4.2 Variables

Considerar:

- precisión;
- intentos;
- errores consecutivos;
- tiempo solo si es válido;
- ayudas;
- repetición de familia;
- carga;
- abandono;
- dificultad del ítem.

---

## 4.3 Evitar falsos ascensos

Un usuario no debe subir porque ha aprendido una plantilla repetida.

Considerar diversidad de familias antes de promover.

Ejemplo:

para subir:

- rendimiento suficiente;
- al menos X familias diferentes;
- número mínimo de actividades;
- ninguna familia representando >50% de la evidencia.

---

## 4.4 Explicabilidad

Al adulto responsable se puede mostrar:

> “Se propone aumentar dificultad porque ha resuelto correctamente actividades de tres tipos diferentes.”

No:

> “Su memoria ha mejorado.”

---

## 4.5 Recomendación de siguiente tarea

Construir un motor explicable:

- reforzar área débil;
- variar mecánica;
- evitar repetición;
- progresar dificultad cuando corresponda.

---

## Entregable Fase 4

- nuevo motor adaptativo;
- reglas;
- migración del progreso;
- tests;
- explicación de decisiones;
- comparación con sistema anterior.

---

# FASE 5 — CONSOLIDACIÓN TÉCNICA

## Objetivo

Reducir deuda técnica y preparar Learning Hub para crecer.

No iniciar esta fase hasta estabilizar producto y contenido.

---

## 5.1 Retirar arquitectura histórica

Consolidar gradualmente:

`v16.js`
`v16_3.js`
...
`v16_17.js`

Evitar parches acumulativos.

---

## 5.2 Arquitectura objetivo

```text
src/
  content/
  domains/
  policies/
  selection/
  assessment/
  renderers/
  components/
  services/
  accessibility/
```

---

## 5.3 Esquema formal Activity

Introducir esquema formal.

Ejemplo:

```text
Activity
 id
 domain
 mechanic
 semanticFamily
 scenarioFamily
 functionalPurpose
 ageRange
 level
 stimulus
 response
 answer
 primaryConstruct
 secondaryLoads
 accessibility
 localePolicy
 printable
```

Pipeline:

```text
AUTHOR
→ SCHEMA VALIDATION
→ AGE POLICY
→ LOCALE
→ SELECTION
→ RENDER
→ ASSESSMENT
```

---

## 5.4 Content QA automático

Crear dashboard interno con:

- familias;
- variantes;
- repetición;
- cobertura;
- dificultad;
- duplicados;
- ejercicios invalidados;
- documentos;
- assets ausentes;
- opciones repetidas;
- cargas por edad.

---

## 5.5 Telemetría de calidad

Registrar de manera respetuosa con privacidad:

- dominio;
- mecánica;
- familia;
- nivel;
- precisión;
- duración válida;
- abandono;
- ayudas;
- repetición reciente.

Nunca usarlo como diagnóstico.

---

## 5.6 Despliegue

Pipeline:

```text
branch
↓
tests
↓
preview frontend
+
compatible content backend
↓
manual review
↓
PR
↓
main
↓
deployment
```

Mostrar en modo dev:

```text
Web build: <sha>
Content API: <version>
```

para evitar versiones desincronizadas.

---

# PRINCIPIO TRANSVERSAL PARA TODAS LAS FASES

Antes de añadir una actividad nueva, Codex debe poder responder:

1. ¿Qué habilidad trabaja?
2. ¿Para qué sirve en la vida real?
3. ¿Qué carga secundaria introduce?
4. ¿Por qué corresponde a esta edad?
5. ¿Qué la diferencia realmente de otras familias?
6. ¿Cómo aumenta la dificultad?
7. ¿Puede imprimirse?
8. ¿Es accesible?
9. ¿Está localizada correctamente?
10. ¿Puede evaluarse sin ambigüedad?

Si no puede responderse con claridad, la actividad no debería incorporarse.

---

# ORDEN DE EJECUCIÓN

**FASE 1**
Calidad de contenido y variedad real.

**FASE 2**
Memoria, Atención y FFEE más activas y funcionales.

**FASE 3**
Lectura + Escritura y documentos ecológicos.

**FASE 4**
Adaptación inteligente.

**FASE 5**
Consolidación técnica.

---

# REGLA DE TRABAJO CON CODEX

Una tarea de Codex Cloud por fase.

Para cada fase:

1. partir de la rama estable más reciente;
2. crear rama específica;
3. no mezclar fases;
4. ejecutar tests;
5. generar informe before/after;
6. push a GitHub;
7. probar en Cloudflare;
8. revisión manual;
9. merge solo después de aprobar.

Nombres sugeridos:

```text
improve/content-quality-functional
improve/cognitive-active-mechanics
improve/reading-writing-functional
improve/adaptive-difficulty
refactor/platform-consolidation
```

No pedir a Codex que implemente las cinco fases juntas.
# Escucha, situaciones sociales y variedad visual

Iteración del 23 de octubre de 2026. Rama `feat/richer-rules-social-scenes`, sobre PR #16. Mantiene los 22 documentos aprobados, sus diseños, imágenes, transcripciones y ejercicios. No modifica Stripe, precios, impuestos, cuotas ni datos existentes.

## Resultado

- Doce iconos originales con volumen y una dirección artística común. Se usan en menú, tarjetas de áreas y cabeceras; no se cambian los pictogramas que sirven como respuestas o estímulos de memoria. La nueva lámina tiene doce celdas iguales, con margen para evitar fragmentos de iconos vecinos.
- Dos escenas cotidianas adicionales, con sus variantes revisadas: cafetería y vestuario deportivo. Total: 14 escenas, 28 fotografías. Las nuevas diferencias incluyen cantidad (3/2 galletas), presencia (gafas/silbato), orientación (cuchara), identidad (fútbol/baloncesto) y estado (bolsa cerrada/abierta). En nivel 1 se pregunta por cada diferencia por separado; en 2 y 3 se combinan. Se conservan las fotografías y claves anteriores.
- «Espera y actúa» rota ocho gestos posibles: palmada suave, tocarse el pelo/cabeza, levantar una mano, tocar un lápiz cercano, tocarse el hombro, tocar la mesa, levantar ambas manos desde el asiento y cruzar los brazos. Mantiene los cinco segundos y el registro acompañado.
- «Escucha y actúa»: palabras habladas o patrones de sonidos graves/agudos, con 3/4/5–6 reglas según edad y nivel, una señal para no actuar, y esperas variables antes de cada señal. Las reglas y sonidos se ensayan antes de empezar. El estímulo no aparece escrito en el turno antes de escucharlo. Se espera a que termine la señal; después se registra la observación. Omitir por falta de audio no se convierte en error. Cambiar de pestaña detiene y obliga a reiniciar. No se solicita micrófono ni se infiere que el equipo pueda detectar movimientos.
- Social Lab en las cinco franjas: 6–7, 8–10, 10–12, 13–15 y 16–18. 144 nuevas actividades: 24 situaciones por nivel en 6–7 y 6 por nivel en cada otra franja. En adolescentes se conserva además el banco anterior. Para pequeños: turnos, compartir, pedir permiso, gustos y necesidades. Para mayores: cooperación, interpretación, bromas, privacidad, patrocinio, evidencia y acuerdos. La progresión trabaja desde hechos y peticiones concretas hasta interpretaciones y decisiones con varias condiciones. Las fichas de 6–7 mantienen sus límites de lectura y ofrecen 24 situaciones distintas por nivel.
- Los proyectos de planificación ya no empiezan con un título aislado. El proyecto forma parte de la pregunta y el texto explica el plan con frases completas. El nivel 1 guía la secuencia; los niveles 2–3 mantienen dependencias en orden mezclado para exigir razonamiento.

## Intereses y búsqueda

Se intentaron consultas a Google, Ofcom, Pew Research y Common Sense Media. El proxy devolvió HTTP 403 al conectar; no se ha leído ni verificado un informe de tendencias de 2026. No se ofrecen porcentajes o clasificaciones inventados.

Puntos de consulta para una revisión externa pendiente:

- https://www.ofcom.org.uk/media-use-and-attitudes/media-habits-children/
- https://www.pewresearch.org/internet/2024/12/12/teens-social-media-and-technology-2024/
- https://www.commonsensemedia.org/research

Se usan como propuestas editoriales los intereses aportados por la usuaria: Pokémon, Minecraft, anime, Fortnite, K-pop, fútbol, YouTube, Twitch, TikTok y la referencia «67». No se presentan como una lista de tendencias comprobada. Las referencias se entienden con la información del propio ejercicio; no requieren conocer un juego, abrir una cuenta, pagar o visitar una plataforma. Las redes sociales se reservan para adolescentes; para pequeños hay cromos, construcción, juego y música. No se usan imágenes de personajes comerciales ni se atribuye ninguna colaboración a esas marcas.

## Contratos y compatibilidad

La aplicación envía `client_revision:5`. El servidor mantiene revisiones 1–4 y exige la 5 para el modo de audio nuevo. Las reglas se generan y validan en el mismo currículo del navegador y del servidor. Las actividades sociales validan edad, nivel, situación, pregunta y respuestas; quitar la evidencia también falla. Las respuestas físicas se guardan en `interactiveObservations`, sin aumentar aciertos ni resultados objetivos. Las actividades anteriores conservan su puntuación.

Las palabras usan la síntesis de voz del navegador en español. Los tonos usan Web Audio y no requieren descargar una grabación. Ambos se inician con un gesto explícito, a volumen moderado, y se cancelan al abandonar la actividad. Los errores de audio ofrecen reintento u omisión sin puntuar. Hay instrucciones, reglas y secuencia legibles en las fichas Word.

## Comprobación y revisión

181 pruebas Node y 9 pruebas Python superadas; 10 recorridos de navegador superados. Pruebas de contratos en todos los idiomas regionales; entrega real del endpoint por edades; pruebas del navegador con el límite del dispositivo de audio simulado para verificar tiempos, tonos, palabras, interrupciones, observaciones y ausencia de puntuación automática; regresiones de documentos, fotografías, selección única, Word y móvil.

La audibilidad real y la voz instalada deben comprobarse también en el ordenador o tableta que se utilizará: abrir «Funciones ejecutivas → Actúa con reglas → Escucha y actúa», escuchar cada señal a volumen cómodo, empezar y practicar una ronda de palabras y otra de sonidos. Un navegador sin voz española puede ofrecer otra voz o fallar; la actividad permite elegir otra modalidad. Las pruebas automáticas no certifican la claridad acústica de los altavoces de la usuaria.

## Nombre: propuesta, sin cambiar la marca

«Learning Hub» es genérico y convive ahora con el logotipo «Level Up Learning Lab». Recomiendo valorar primero unificar como **Level Up Lab**: es breve, expresa progreso y encaja de 6 a 18 años. Como alternativas exploratorias: **Nexo Lab** (conectar habilidades) e **Impulso Lab** (acción y progreso). No se ha comprobado disponibilidad de marcas o dominios. No se cambia ningún nombre público, enlace o producto de Stripe en esta iteración.

Capturas locales de revisión: [áreas e iconos](review-assets/richer-rules-social-scenes/area-icons.png), [escucha en escritorio](review-assets/richer-rules-social-scenes/listening-desktop.png) y [escucha en móvil](review-assets/richer-rules-social-scenes/listening-mobile.png). Las capturas de audio corresponden al nivel 3.

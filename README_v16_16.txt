LEARNING HUB V16.16

IMPORTANTE
- No modifica el sistema de nombres del ZIP ni de los DOCX.
- Conserva V16.15 para esa funcionalidad.

Frontend
- Corrige de forma estable la incoherencia entre el perfil 6-7 / 8-10 y el texto superior que seguía mostrando 10-12.
- Mantiene 13-15 y 16-18.
- No usa un observador global; solo vigila el texto de edad superior.
- Limpia el término incorrecto "autobúscar" si apareciera en una cabecera heredada.

Backend ya desplegado como request-learning-content V32
- Atención: 12 mecánicas x 20 variantes.
- Memoria: 12 mecánicas x 20 variantes.
- Funciones ejecutivas: 12 mecánicas x 20 variantes.
- Cognición aplicada: 12 mecánicas x 20 variantes.
- Lectura + Escritura: 12 mecánicas x 20 variantes, incluyendo comprensión lectora y respuestas escritas.
- Velocidad/Razonamiento: 12 mecánicas x 20 variantes.
- Historial antirrepetición ampliado a 240 contenidos visibles y 8 mecánicas recientes.
- Memoria recupera iconos en tareas de objetos/listas cuando corresponde.
- Atención presenta horarios y tablas con una disposición más legible.
- "Autobúscar" eliminado del backend.

SUBIR A GITHUB / supabase-integration
1. Reemplazar js/config.js
2. Añadir js/v16_16.js
3. NO tocar js/v16_15.js
4. NO tocar js/docx.js

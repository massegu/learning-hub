# Learning Hub — funcionamiento y mantenimiento

La guía para gestionar la plataforma, entender los servicios y actualizar desde VS Code está en **[Guía de funcionamiento y actualización](docs/guia-operacion.md)**.

- Cloudflare publica la web desde GitHub.
- Supabase gestiona acceso, datos y la función de ejercicios.
- Stripe continúa en modo prueba.
- El token de publicación no controla el acceso de Elena ni de los alumnos.

La automatización propuesta sigue `desarrollo → pruebas → Cloudflare`, publicando antes la función de Supabase. Hay que terminar la configuración de los secretos y variables de GitHub indicada en la guía; los secretos de Codex no se copian automáticamente a GitHub.

Para revisar los ejercicios con datos ficticios: `python3 tools/review-preview.py` (Node 24 y Python 3). En Windows puede usarse `py tools/review-preview.py`.

No publiques archivos `.env` ni claves administrativas. No edites la rama `pruebas` en el trabajo habitual. Consulta la guía antes de modificar el servidor o la base de datos.

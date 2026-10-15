# Probar el contenido revisado sin cambiar Supabase

Esta prueba abre la aplicación real y ejecuta el código de `request-learning-content`
de tu copia del repositorio. Sustituye la cuenta y la base de datos por datos ficticios.
No consulta Supabase ni modifica tus perfiles reales. No necesitas iniciar sesión.

## Primera vez en Windows

1. Instala **Node.js 24 LTS** desde <https://nodejs.org/> si todavía no lo tienes.
   Cierra y vuelve a abrir VS Code después de instalarlo.
2. En GitHub Desktop, selecciona `learning-hub` y la rama
   `fix/early-primary-stimulus-integrity`. Pulsa **Fetch origin** y después
   **Pull origin** si aparece.
3. Abre el proyecto en VS Code. En **Terminal → New Terminal**, ejecuta:

   ```powershell
   py tools/review-preview.py
   ```

El comando instala automáticamente las bibliotecas de las fichas con `npm ci`
si faltan. Para ello necesita Internet la primera vez. La prueba de la aplicación
usa después archivos y servicios locales.

Cuando la terminal diga **Prueba local lista**, escribe `http://localhost:8001`
en tu navegador. Debe aparecer una franja amarilla que diga **PRUEBA LOCAL**.
Mantén la terminal abierta. Para terminar, pulsa **Ctrl+C** en la terminal.

En macOS/Linux, utiliza `python3 tools/review-preview.py`.

## Qué revisar

Selecciona el perfil en el menú de la izquierda:

| Perfil ficticio | Edad | Comprobación sugerida |
| --- | --- | --- |
| Sol | 6–7 | Comprobar que se conserva la interfaz y las fichas. |
| Alex | 8–10 | Lectura con varios párrafos; Memoria nivel 3 con dos relaciones. |
| Luis | 10–12 | Geometría; Ortografía dentro de Lenguaje; un único acceso a Lectura y escritura. |
| Clara | 13–15 | Interfaz azul/violeta, distribución de listas y tablas. |
| Nora | 16–18 | Lenguaje → Ortografía, Razonamiento y Lectura y escritura revisados. |

El selector de dificultad permite probar los niveles 1, 2 y 3. La adaptación
automática sigue activa y puede cambiar el nivel después de varias respuestas.
En **Fichas**, elige las áreas y una versión para descargar directamente un DOCX.

Si encuentras un problema, anota perfil, área, nivel, país y la pregunta completa.
Una captura ayuda a identificar tanto la presentación como el contenido.

## Límites

- `py -m http.server 8000` abre la interfaz, pero continúa consultando la función
  publicada en Supabase. No sirve para evaluar estos generadores nuevos.
- El modo de prueba no verifica el acceso, los pagos, los datos reales ni el
  despliegue de Supabase. Es un entorno editorial con un servicio simulado.
- El progreso del navegador usa almacenamiento local y el historial del servidor
  de prueba se borra al cerrar el comando. No lo uses para seguir a un alumno real.
- En 16–18 solo Lenguaje, Razonamiento y Lectura y escritura reciben la corrección
  editorial de esta fase; las demás áreas siguen pendientes de revisión completa.
- No abras el puerto a Internet ni publiques este servidor. Está pensado para
  ejecutarse únicamente en tu ordenador y se enlaza a `127.0.0.1`.

# Learning Lab V6

Correcciones de estabilidad sobre V5:
- Reinicio real e independiente del progreso por perfil.
- La respuesta modelo se puede visualizar aunque el campo de respuesta esté vacío.
- El botón de respuesta modelo se restablece correctamente en cada ejercicio abierto.

# LEVEL UP · Learning Lab V5

Aplicación web estática para práctica educativa y seguimiento individual.

## Grupos de edad
- 10-12 años: Geometría, Lengua, Divisiones y Lectura.
- 12-13 años: Lengua, Matemáticas y Comprensión lectora con bancos propios.
- 14+ años: Lengua, Matemáticas y Social Lab (habilidades sociales y teoría de la mente).

## Seguimiento
Cada perfil conserva por separado puntuación, niveles, historial y ejercicios vistos en `localStorage` del navegador.
En Progreso hay dos exportaciones:
- CSV detallado: una fila por ejercicio.
- CSV de evolución: una fila por sesión con precisión global y por área.

Los CSV usan punto y coma como separador y UTF-8 con BOM para facilitar la apertura en Excel en configuración española.

Importante: localStorage pertenece al navegador y dispositivo usados. Para un histórico duradero, conviene descargar periódicamente el CSV. La app conserva hasta 5.000 registros de ejercicios por perfil.

## Estructura
- `index.html`
- `css/styles.css`
- `data/primary.js`
- `data/middle.js`
- `data/teen.js`
- `js/storage.js`
- `js/docx.js`
- `js/app.js`

## Publicación en GitHub Pages
Sube el contenido de esta carpeta a la raíz del repositorio y conserva la publicación desde `main` / `(root)`. GitHub Pages volverá a desplegar automáticamente.

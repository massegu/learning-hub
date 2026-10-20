# Recuperación de un perfil recordado que ya no está disponible

El navegador conserva el identificador del último perfil en `lh_current_profile`.
Si ese perfil se elimina o se inicia sesión con otra cuenta en la misma web,
el identificador puede no estar en la lista de perfiles devuelta para la cuenta actual.
Antes, `activateProfile` no seleccionaba ninguno. Tras cambiar de cuenta en la
misma pestaña, permanecía la navegación anterior y todas las áreas mostraban
`Cannot read properties of null (reading 'id')` al pedir contenido.

La reproducción local del cambio de cuenta confirmó ese mensaje exacto. No se
ha confirmado todavía que esta sea la causa en la sesión publicada del usuario;
el acceso HTTP a Cloudflare desde este entorno está bloqueado por el proxy.
Las ramas remotas `desarrollo` y `pruebas` apuntan ambas a `9ce4277` al revisar.

## Cambio

- Si la selección recordada está entre los perfiles de la cuenta, se conserva.
- En caso contrario, se activa el primer perfil de la lista autorizada y se
  actualiza la selección recordada.
- Una cuenta sin perfiles limpia la selección y la navegación anterior y abre
  la creación de perfil.
- Una petición sin perfil produce una indicación en español antes de llamar a
  Supabase.

No se modifican ejercicios, progreso, contraseñas, suscripciones ni los módulos
que generan el contenido. La corrección es de la web; no necesita cambios en
la base de datos ni en la función de Supabase.

## Verificación

`python3 tests/browser-auth-account.py` reproduce el cambio de cuenta y comprueba:
perfil recordado inexistente al arrancar; cambio de cuenta en la misma pestaña;
cuatro áreas con solicitudes dirigidas al nuevo perfil; cuenta sin perfiles y
creación de uno nuevo; cambio/recuperación de contraseña y pantalla móvil.
La prueba utiliza el código real de la web con Auth y base de datos simulados;
no envía correos ni modifica cuentas reales.

`python3 tests/browser-session-layout.py` verifica las áreas de sesión en cinco
edades, navegación, presentación y el comportamiento estable de velocidad.
También se ejecutaron `node --check js/app.js` y `git diff --check`.

La inspección adicional de carga con el servidor local y la función real,
con cuenta/base de datos simuladas, cargó las 40 combinaciones de edad y área
visibles sin errores, en la variante España.

## Publicación

Crear la PR hacia `desarrollo`, esperar los controles y fusionarla. Esperar a
que termine el flujo de publicación antes de comprobar la URL estable:
https://pruebas.learning-hub-5n9.pages.dev/

Como solución inmediata antes de publicar, si el selector muestra los perfiles
de la cuenta actual, seleccionar explícitamente uno vuelve a ejecutar su
activación. No es necesario borrar datos ni crear otra cuenta.

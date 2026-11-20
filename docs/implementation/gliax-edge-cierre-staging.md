# GLIAX · Cierre de Edge para Staging

## N-back

La versión original del generador, en `fa71e09c`, aplicaba una probabilidad fija de 0,35 para forzar una coincidencia después de los primeros `n` símbolos. El cambio `ae2f2e56` introdujo una condición por área en una función que solo recibe edad, nivel y exclusiones de juegos. El contrato `kind=game` se emplea sin un área obligatoria.

Se recupera el **0,35 fijo** de la implementación original. No se introduce un parámetro de área ni se cambia el criterio pedagógico. El valor es la probabilidad de copiar el símbolo anterior a distancia `n`; las coincidencias naturales del muestreo también cuentan y la proporción final de coincidencias puede variar. La dificultad conserva 1-back con 10 símbolos en nivel 1 y 2-back con 12 o 14 símbolos en niveles 2 y 3.

La regresión llama al handler autenticado de prueba y selecciona N-back con exclusiones válidas y un flujo determinista de valores aleatorios. Comprueba las tres secuencias exactas, las coincidencias forzadas por debajo de 0,35, el límite estricto y el cargo en la cuota de juegos. También ejercita los otros cuatro juegos y el rechazo de solicitudes sin sesión válida.

## Fichas a la carta

La entrada de familias y la salida del asignador se tipan a partir del contrato que valida el catálogo. Esto permite inferir el tipo de los elementos de escasez y del contenido de cada versión. Se conservan las cantidades por familia, los códigos de respuesta y la separación entre fichas y ejercicios. Los tests del selector verifican las cantidades, los faltantes, el orden y la exportación de fichas y solucionarios.

## Referencia de reversión verificada

| Dato | Valor |
| --- | --- |
| Proyecto Supabase Staging | `wejcfaralctolzxjbcil` |
| Función | `request-learning-content`, versión de referencia 2, estado ACTIVE comunicado |
| Código de restauración | `2073052e100df3fa8faa29cfaab1fdcb7868b090` |
| Procedencia | La responsable cotejó los 27 archivos de la versión activa mediante la conexión oficial de Supabase, normalizando los finales de línea. |
| Entrypoint | `supabase/functions/request-learning-content/index.ts` |
| Verificación del gateway | `verify_jwt=true` |
| Variables de ejecución | `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, administradas en Edge. Sus valores se mantienen en Supabase. |
| Referencia de Pages | Despliegue `b554501a-5a8b-4cb1-917f-34b56784747d` de `gliax-staging`. |

Si se autoriza una reversión, volver a servir primero la web anterior si ya cambió Pages y reponer después los 27 archivos de Edge con el JWT verificado. El servicio puede asignar un número nuevo al repuesto del código v2. Validar OPTIONS, rechazo sin JWT y una solicitud autorizada de una cuenta ficticia. Se conserva el esquema de la base.

## Validación de publicación

El paquete Edge debe pasar `deno check` con JSR oficial, el SDK real y la resolución registrada, además del arranque HTTP y la batería local. La ampliación QA continúa desactivada sin `GLIAX_STAGING_QA_USER_IDS`. Solo se autoriza mediante el UUID de Auth en el host exacto `wejcfaralctolzxjbcil.supabase.co`. Su configuración y prueba con cuentas ficticias pertenecen a una fase posterior. No se requieren migraciones ni cambios en frontend.

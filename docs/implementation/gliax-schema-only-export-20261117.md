# GLIAX — procedimiento preparado para recuperar solo el esquema

Fecha: 17/11/2026. **No ejecutado contra Supabase remoto.** Esta entrega autoriza preparar y probar el procedimiento en local, no conectar al proyecto `Learning_Hub`. Los pasos de conexión siguientes quedan para una fase posterior expresamente autorizada y para una persona con acceso de administración autorizado.

Entregables: [inventario y plan inicial](gliax-database-bootstrap-inventory-20261117.md), consulta `supabase/diagnostics/schema-only-inventory.sql`, archivo DDL `application-schema.dump` y metadatos `catalogs.json`. Los dos últimos solo existirán cuando se autorice y realice la captura. No se solicita una copia de cuentas, usuarios, perfiles, resultados ni contenido.

## Alcance de lectura

- `pg_dump --schema-only` de **`public` y `private`**: tablas, tipos, defaults, constraints, índices, secuencias sin su valor actual, funciones, triggers asociados a esas tablas, ACL/RLS y otros objetos de esos esquemas. Se conservan owners y grants para auditarlos; al restaurar localmente se mapearán a roles revisados. No usar `--no-acl`: perdería evidencia de autorización.
- Consulta nueva de catálogos: inventario de todos los esquemas no internos, incluidas relaciones, funciones no gestionadas por extensión, triggers y políticas de Auth/Storage si existen, constraints, índices, defaults, ACL de tabla/columna/tipo/rutina/esquema/secuencia, defaults de ACL, roles sin passwords, membresías, publicaciones, extensiones y parámetros de secuencias. No lee filas de esas tablas de aplicación/plataforma. Esto encuentra los triggers anclados a `auth.users` y dependencias fuera de `public/private` que el dump limitado omite.
- No se llaman funciones de aplicación ni se ejecutan las sentencias recuperadas. Los cuerpos de funciones pueden contener `INSERT`, `UPDATE` o `DELETE` como **definición**, sin que sean filas exportadas ni instrucciones que debamos ejecutar.
- No se exportan datos de tablas/materialized views/foreign tables, large objects, passwords de roles, valores actuales de secuencias, secretos Vault ni conexiones de suscripciones. La consulta de catálogos omite opciones de conexión FDW; si detecta foreign tables dentro del ámbito, se detiene el procedimiento estándar antes del dump para revisar ese caso aparte. No se consultan `cron.job`, tablas de historial de migraciones, `auth.users`, `storage.objects` ni recuentos de filas.
- Se omiten comentarios y security labels del dump para reducir literales incidentales. **Los defaults, vistas, funciones, políticas y argumentos de triggers también pueden contener secretos o identificadores literales.** Guardar la captura como confidencial; revisar antes de compartir. «Sin filas» no significa «apto para Git sin revisión».

## 1. Preparación sin conexión al proyecto

Usar herramientas oficiales `psql`, `pg_dump`, `pg_restore` con versión fijada. En esta entrega se consultó la ayuda de `pg_dump` y se verificó PostgreSQL **17.12** mediante una imagen local fijada; se consultó también `supabase db dump --help` de CLI **3.2.0**. El procedimiento usa libpq directamente para controlar las opciones sin enlazar un proyecto ni depender de los filtros de la CLI.

En la máquina que vaya a realizar la captura autorizada, desde la raíz del repositorio y en Bash:

```bash
set -euo pipefail
umask 077
audit_dir="$PWD/work/gliax-schema-capture-20261117"
# Detenerse si ya existe: no sobrescribir una captura anterior.
test ! -e "$audit_dir"
mkdir -p "$audit_dir"
chmod 700 "$audit_dir"
export PGSERVICEFILE="$audit_dir/pg_service.conf"
export PGPASSFILE="$audit_dir/pgpass"
export PGSERVICE=gliax_schema_review
unset PGHOST PGHOSTADDR PGPORT PGDATABASE PGUSER PGPASSWORD PGOPTIONS
pg_dump --version
psql --version
pg_restore --version
pg_dump --help > "$audit_dir/pg_dump-help.txt"
psql --help > "$audit_dir/psql-help.txt"
pg_restore --help > "$audit_dir/pg_restore-help.txt"
```

No ejecutar todavía los apartados de conexión. Al autorizarlos, completar **fuera del chat y de Git** el archivo privado `$PGSERVICEFILE` con datos del destino aprobados por el administrador:

```ini
[gliax_schema_review]
host=HOST_POSTGRES_VERIFICADO_POR_ADMINISTRACION
port=5432
dbname=postgres
user=ROL_EXISTENTE_AUTORIZADO_PARA_AUDITAR_ESQUEMA
sslmode=verify-full
sslrootcert=/RUTA/ABSOLUTA/CA_APROBADA.pem
connect_timeout=10
application_name=gliax_schema_only_review
options=-c default_transaction_read_only=on -c statement_timeout=60000 -c lock_timeout=5000
```

Usar el endpoint directo PostgreSQL o, si la conectividad lo exige y se aprueba, el pooler **de sesión**, con su puerto/usuario reales y TLS verificable. No usar el pooler de transacción para esta captura. No extraer ni pegar contraseñas en un URI, argumentos de proceso, shell history o este documento. El administrador escribe `$PGPASSFILE` con una sola entrada `host:puerto:base:usuario:contraseña`; escapar `:` y `\` según libpq. Ambos archivos deben tener modo `600`. El host/puerto/base/usuario deben coincidir exactamente con el servicio.

El rol debe existir ya y tener los permisos necesarios para catálogos y locks de lectura de `pg_dump`. Si faltan permisos, **detener la captura**. Este procedimiento no crea usuarios ni concede permisos remotos. Si se usa una cuenta administrativa ya aprobada, la sesión sigue en modo de solo lectura; los comandos aquí definidos no consultan sus datos de negocio.

No usar `supabase link`, `db pull`, `db push`, `migration repair`, `pg_dumpall`, `--data-only`, `--include-foreign-data`, dumps completos con datos, SQL Editor con consultas de negocio ni el antiguo `privacy-preflight.sql`. Tampoco usar `supabase status` contra un proyecto enlazado para obtener claves: no se necesitan claves API.

## 2. Captura futura autorizada: únicamente catálogos

Confirmar manualmente el destino y las versiones antes de continuar. Mantener una ventana sin cambios DDL del equipo: las dos conexiones de captura no comparten snapshot. Si hay cambios de esquema durante la ventana, descartar el paquete y repetir en una ventana acordada; no mezclar estados.

```bash
chmod 600 "$PGSERVICEFILE" "$PGPASSFILE"
psql -X -w -Atq -v ON_ERROR_STOP=1 \
  -f supabase/diagnostics/schema-only-inventory.sql \
  > "$audit_dir/catalogs.json"
python3 -m json.tool "$audit_dir/catalogs.json" > /dev/null
```

La consulta incluye `BEGIN READ ONLY`, `statement_timeout=60s`, `lock_timeout=5s` y `search_path=pg_catalog`. Devuelve un único JSON. Contiene la versión del servidor, nombres y definiciones de objetos, pero no filas de aplicación. `-X` evita ejecutar un `.psqlrc` ajeno al procedimiento; `-w` evita prompts de contraseña o captura accidental en terminal.

Revisar **en privado** `server.version`, esquemas, funciones/triggers/políticas, extensiones y dependencias externas. Si el servidor requiere una versión mayor que el cliente de dump, detenerse e instalar una versión compatible; usar preferentemente el mismo major. Si falta `private`, registrar esa ausencia y no añadirlo a los patrones del dump. No crear el esquema en el origen. Si aparecen objetos adicionales, registrar su clasificación y acordar explícitamente ampliar el ámbito; no dar por completo un dump de solo dos esquemas.

La consulta omite cuerpos gestionados por extensiones y opciones FDW que puedan contener secretos; captura sus nombres/versiones para reproducir las dependencias de plataforma. No lee valores de configuración de roles, solo indica si existen. `pg_class.reloptions` y configuraciones de funciones sí son definiciones: revisarlas por si contienen literales sensibles. La existencia de tablas/funciones fuera del alcance no autoriza leer sus registros.

Si `foreign_tables_without_options` identifica foreign tables dentro de los esquemas que se van a exportar, **no ejecutar el apartado 3**: sus OPTIONS de DDL también podrían incluir credenciales. Un administrador debe definir una captura/redacción específica de esos objetos antes de ampliar el procedimiento. No conectarse a sus servidores ni añadir `--include-foreign-data`.

## 3. Captura futura autorizada: archivo solo de DDL

Si el inventario confirma ambos esquemas `public` y `private`, ejecutar exactamente:

```bash
pg_dump -w \
  --format=custom \
  --schema-only \
  --schema=public --schema=private --strict-names \
  --no-large-objects --no-subscriptions \
  --no-comments --no-security-labels \
  --lock-wait-timeout=5s \
  --file="$audit_dir/application-schema.dump"
```

Si `private` no existe, usar el mismo comando retirando únicamente `--schema=private`, anotarlo en el manifiesto y mantener `--strict-names`. Si se autorizan otros esquemas de aplicación tras el inventario, añadir cada uno explícitamente como otro `--schema=NOMBRE_REVISADO`; no sustituirlo por un comodín. Las dependencias de otros esquemas no se incluyen automáticamente por seleccionar uno.

No añadir `--no-owner` ni `--no-privileges` a la **captura**: necesitamos auditar owners y ACL. El archivo no se restaura ni se interpreta contra el origen. Los grants/owners capturados son DDL del archivo, no cambios al Supabase actual. `pg_dump` toma locks ACCESS SHARE que pueden competir brevemente con DDL; el timeout obliga a fallar en vez de esperar indefinidamente. No modifica tablas ni dispara triggers de negocio.

## 4. Comprobación sin conexión y revisión privada

```bash
pg_restore --list "$audit_dir/application-schema.dump" > "$audit_dir/archive-list.txt"
python3 - "$audit_dir/archive-list.txt" <<'PY'
import pathlib, re, sys
toc = pathlib.Path(sys.argv[1]).read_text()
for line in toc.splitlines():
    if line.startswith(';'):
        continue
    if re.search(r'\b(TABLE DATA|SEQUENCE SET|MATERIALIZED VIEW DATA|BLOB|BLOBS|LARGE OBJECT)\b', line):
        raise SystemExit('RECHAZAR: entrada de datos en el archivo')
print('TOC sin entradas de datos')
PY
pg_restore --schema-only \
  --file="$audit_dir/application-schema.sql" \
  "$audit_dir/application-schema.dump"
sha256sum "$audit_dir/catalogs.json" "$audit_dir/application-schema.dump" \
  "$audit_dir/application-schema.sql" "$audit_dir/archive-list.txt" \
  > "$audit_dir/SHA256SUMS"
```

`pg_restore --file=...` sin `--dbname` solo genera un archivo; no conecta ni ejecuta DDL. No buscar globalmente la palabra `INSERT` como criterio de datos: puede aparecer legítimamente dentro de una función. La ausencia de entradas de datos en el TOC complementa el `--schema-only` explícito. No abrir un SQL recuperado en una herramienta que lo ejecute automáticamente.

Revisar funciones, defaults, vistas, políticas, argumentos de triggers, nombres, ACL y cualquier DDL FDW por posibles literales sensibles. Si los contiene, mantener el original privado, preparar una copia redactada para revisión y registrar qué se ha omitido; no sustituir silenciosamente una definición exacta por una inventada. No subir `pgpass`, archivo de servicio, certificados privados, dumps ni metadatos crudos a la rama. Un manifiesto compartible debe indicar fecha/UTC, major/versión de herramientas, esquemas incluidos/excluidos, checksums de los originales, resultados de validación y lagunas; omitir credenciales y host si es confidencial.

Comparar los triggers de `catalogs.json` asociados a `auth.users` con el dump: no aparecerán en él por estar anclados a `auth`, aunque su función viva en `public`. Para la futura baseline, recuperar de ese JSON su definición exacta, el cuerpo/ACL de su función y las dependencias. Hacer lo mismo con políticas de aplicación en `storage`, publicaciones y objetos adicionales. No restaurar todo el esquema gestionado `auth`/`storage`, ni recrear identidades de usuarios.

## 5. Validación posterior exclusivamente local

Solo después de revisar el paquete, seguir el plan del inventario: preparar la base previa a los seis deltas o una baseline nueva separada si esa separación no es demostrable. No aplicar snapshot actual + seis migraciones sobre los mismos objetos. Crear una instancia Supabase local vacía compatible; usar owners locales revisados y datos ficticios; comparar estructura y permisos contra el objetivo aprobado y ejecutar las pruebas. Las funciones/triggers recuperados se ejecutarán por primera vez en ese entorno aislado, tras revisar efectos externos.

Esta entrega verifica el mecanismo únicamente con un contenedor PostgreSQL local `--network none`, un esquema sintético y un marcador de fila ficticio. Ninguno de los comandos de conexión de los apartados 2 y 3 se ha ejecutado sobre `Learning_Hub`. La exportación remota, cuando se autorice, debe limitarse exactamente a la lectura de metadatos y DDL aquí descrita.

Referencias consultadas: [PostgreSQL 17: pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html), [pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html), [libpq service file](https://www.postgresql.org/docs/17/libpq-pgservice.html), [password file](https://www.postgresql.org/docs/17/libpq-pgpass.html) y [Supabase CLI v3](https://supabase.com/changelog/supabase-cli-v3).

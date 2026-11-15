# Revisión del diagnóstico aportado el 23/10/2026

El archivo aportado contiene metadatos y recuentos, sin fichas personales. No se ha aplicado ningún SQL remoto. La consulta posterior de metadatos de la tabla privada recibió HTTP 403.

- RLS está activo en perfiles, resultados y ejercicios vistos. Los tres recuentos de huérfanos/propietarios incompatibles son cero.
- Hay permisos `TRUNCATE` para `anon` y `authenticated` en perfiles y resultados. RLS no limita `TRUNCATE`: esos permisos deben revocarse. Conviene revisar también `TRIGGER` y `REFERENCES`. La migración de privacidad preparada en la rama `feat/privacy-controls-and-independent-sessions` revoca los permisos de tabla antes de conceder los necesarios; aún no se ha aplicado.
- En el inventario no figura `SELECT` de `service_role` sobre `content_seen`. La función de contenido utiliza ese rol para leer el historial. La nueva selección tolera el fallo utilizando el historial de entregas que ya existe en `progress._delivery`, pero los permisos reales deben corregirse con la migración revisada. El respaldo conserva una ventana limitada, no todo el historial de uso.
- Existe además `private.content_delivery_log`, con FK al perfil y `ON DELETE CASCADE`. El borrado del padre cubre esa relación, pero antes de cerrar la exportación y conservación de privacidad necesitamos conocer sus columnas, triggers, permisos y finalidad. El diagnóstico previo no inventariaba las columnas privadas; no se puede afirmar que la exportación preparada las incluya.

La iteración de variedad se basa directamente en `desarrollo` y no incorpora ni activa la migración ni los botones de privacidad. Puede revisarse separadamente. La aprobación de cambios educativos no sustituye la revisión de permisos y datos pendiente.

Consulta de solo lectura para completar el inventario privado:

```sql
select jsonb_build_object(
 'columns',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from (
  select column_name,data_type,is_nullable,column_default
  from information_schema.columns where table_schema='private' and table_name='content_delivery_log'
 ) c),
 'triggers',(select coalesce(jsonb_agg(to_jsonb(t)),'[]') from (
  select event_object_schema,event_object_table,trigger_name,action_timing,event_manipulation
  from information_schema.triggers where event_object_table in ('content_delivery_log','learner_profiles')
 ) t),
 'grants',(select coalesce(jsonb_agg(to_jsonb(g)),'[]') from (
  select grantee,privilege_type from information_schema.table_privileges
  where table_schema='private' and table_name='content_delivery_log'
 ) g)
) as private_delivery_metadata;
```

Esta consulta no selecciona filas de la tabla privada ni cambia los permisos.

## Actualización del 24/10

La usuaria aportó las seis columnas del registro privado: id bigint, user_id/profile_id/content_id uuid, kind text y delivered_at timestamptz, todas no nulas. La migración revisada exporta explícitamente esos campos con autorización por cuenta y perfil y verifica la FK en cascada; una fila con propietario incompatible hace fallar la exportación. Las pruebas locales cubren el registro privado. Se han retirado también los permisos explícitos de columna. Sigue pendiente la aplicación y validación en Supabase; la revisión técnica no sustituye el asesoramiento jurídico.

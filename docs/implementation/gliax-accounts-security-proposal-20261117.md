# GLIAX — propuesta separada de reducción de permisos

Fecha: 17/11/2026. **Propuesta no aplicada ni validada dinámicamente. No es una migración remota autorizada.** Basada en [permisos efectivos aportados](gliax-observed-permissions-20261117.md). La reconstrucción permanece [bloqueada](gliax-observed-reconstruction-review-20261117.md); no se han concedido permisos excesivos en una base nueva para reproducirlos innecesariamente.

**Actualización posterior, exclusivamente local:** el [perfil de permisos de la baseline funcional](../../supabase/baselines/local-privileges.sql) establece las capacidades de aplicación explícitamente y sus pruebas confirman las denegaciones de DDL de cliente. No se reprodujeron los grants excesivos ni se aplicó esta propuesta al origen. Ver [resultados y diferencias](gliax-functional-baseline-validation-20261117.md). El texto siguiente conserva la propuesta original para revisión separada de cualquier instalación existente.

## Hallazgo y alcance mínimo

`anon` y `authenticated` tienen TRUNCATE y TRIGGER efectivos sobre `public.accounts`. RLS no restringe TRUNCATE. TRIGGER es una capacidad DDL innecesaria para el frontend; su explotación concreta depende también de otros permisos y de las funciones disponibles. No se afirma haber intentado explotación remota ni local.

Cambiar estos permisos no requiere cambiar el contrato legítimo: authenticated puede seleccionar su cuenta y actualizar exclusivamente `content_locale` bajo las dos políticas observadas. No debe poder actualizar el estado de suscripción, fechas de trial o identificadores Stripe. No retirar ese grant de columna ni reemplazarlo por UPDATE de tabla.

## Candidato mínimo para ensayar solo en una copia local fiel

El siguiente SQL es un **candidato futuro**, no un archivo aplicado ni una reparación certificada. Solo se debe ensayar cuando se hayan recuperado ACL y roles. No reproducir los grants peligrosos salvo en una base desechable dedicada a comparar antes/después.

```sql
begin;
revoke truncate, trigger on table public.accounts from public, anon, authenticated;
do $$
begin
  if has_table_privilege('anon','public.accounts','TRUNCATE')
     or has_table_privilege('anon','public.accounts','TRIGGER')
     or has_table_privilege('authenticated','public.accounts','TRUNCATE')
     or has_table_privilege('authenticated','public.accounts','TRIGGER') then
    raise exception 'Excess privileges remain through ownership or inherited roles; review ACL and memberships';
  end if;
end;
$$;
commit;
```

Revocar de los roles consultados y de PUBLIC **no garantiza** eliminar permisos heredados de otros roles o derechos por propiedad. El postcheck debe fallar y revertir toda la transacción si los conserva; resolver después la fuente concreta recuperada, sin inventar o revocar membresías indiscriminadamente. Para probar el antes se usan roles y cuenta ficticia de una base local desechable; nunca se ejecuta un TRUNCATE en el origen.

Antes de convertir el candidato en migración hay que inspeccionar `pg_default_acl`: si reproduce los grants al crear otras tablas, preparar un ajuste independiente para el owner/esquema **realmente observado**, sin suponer `FOR ROLE postgres`. No alterar permisos de `service_role` u otros objetos en la misma corrección mínima sin una evaluación separada. Una migración futura debe generarse con la CLI tras consultar su ayuda; aquí no se inventa una versión histórica ni se modifica ninguna de las seis migraciones.

## Funciones privilegiadas y acceso privado

| Función/grupo | Comportamiento observado | Propuesta de comprobación/corrección separada |
| --- | --- | --- |
| `handle_new_user()` | SECURITY DEFINER, owner postgres; EXECUTE negativo para los tres roles | Conservar cuerpo; verificar alta Auth → una cuenta con defaults correctos y que ningún grant heredado amplíe EXECUTE. No conceder EXECUTE al cliente para arreglar un error de trigger |
| `request_learning_content_internal(uuid,uuid,text,text,smallint,integer)` | SECURITY DEFINER, acepta IDs de cuenta/perfil explícitos y comprueba la relación; EXECUTE solo service_role entre los roles consultados | Negar invocación a anon/authenticated y revisar PUBLIC/roles adicionales. Probar con datos ficticios perfil ajeno, trial, tamaño, límites, log y concurrencia. Una relación cuenta/perfil válida no sustituye la autorización del llamante: el confinamiento a service_role es esencial |
| Cinco RPC de facturación | SECURITY DEFINER; EXECUTE efectivo de servicio, no de clientes; cuerpos del repositorio comprueban `auth.role()` | Verificar todas las firmas/ACL y que clientes no llamen RPC ni escriban estado de suscripción. No reabrir EXECUTE por comodidad |
| `manage_learner_privacy(text,uuid,text,date)` | SECURITY DEFINER, EXECUTE de authenticated, no de anon; cuerpo del repositorio comprueba `auth.uid()` y propiedad | Mantener la autorización funcional; probar export/settings/delete con cuentas A/B y anónimo, incluida ausencia de efectos sobre B |
| Helpers de privacidad y purga | Permisos efectivos específicos en la captura; purga para servicio | Comparar grants reales, defaults y owners con la baseline y probar que helpers no sean API pública. La ausencia de EXECUTE de service_role en algunos helpers no se debe sustituir por el default del entorno local |
| `set_updated_at()` | SECURITY INVOKER, EXECUTE efectivo positivo para los tres roles | Evaluar revocar EXECUTE directo a roles cliente en una propuesta distinta. Probar que los tres triggers temporales siguen funcionando y confirmar PUBLIC/otros roles. No cambiar su cuerpo ni anunciar el cambio como ya ensayado |

`private` no tiene USAGE para anon/authenticated/service_role y las tres tablas privadas no tienen sus permisos DML efectivos. No conceder USAGE o DML general para que pasen los tests: la ruta observada es la función autorizada SECURITY DEFINER con owner aprobado. El contexto exacto de roles/ACL aún falta. Revisar también CREATE del esquema `public`, dependencias y `search_path` antes de proponer endurecimientos; no mover funciones o alterar búsqueda sin probar su compatibilidad.

El cuerpo de `request_learning_content_internal` depende de filas de límites y contenido. En local deben ser ficticias y explícitas. Debe ensayarse qué ocurre si falta un límite, parámetros son NULL, no hay contenido o hay peticiones simultáneas; este documento no certifica esos casos ni asigna cuotas nuevas. No leer los límites reales para completar la prueba.

## Criterios de aceptación, aún pendientes

1. Copia local estructuralmente fiel, con ACL/roles recuperados; variantes «observada» y «propuesta» separadas. No cambiar permisos a mitad de una prueba de equivalencia sin registrarlo.
2. Postchecks efectivos negativos de TRUNCATE/TRIGGER para anon/authenticated, también mediante roles heredados; ensayo destructivo solo sobre cuentas ficticias en una copia desechable.
3. Signup/trigger, inicio, lectura y edición autorizada de idioma; rechazo de transferencias de perfil, lectura/escritura ajenas, mutación de suscripción, invocación de RPC de servicio por clientes y acceso directo privado.
4. Repetir las comprobaciones de resultados NULL, códigos únicos, reintentos, recuperación, exportación y borrado; verificar secuencias identity con permisos reales y triggers temporales.
5. Ejecutar advisors locales y la batería de pruebas al implementar cambios; documentar firmas/grants efectivos antes/después. Staging y cualquier aplicación remota requieren una autorización posterior.

**Resultado actual:** propuesta documentada; cero cambios de permisos realizados, cero pruebas dinámicas nuevas de esta propuesta. No se presenta como una vulnerabilidad ya corregida.

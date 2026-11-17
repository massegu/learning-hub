# GLIAX — privilegios efectivos y extensiones (17/11/2026)

Lectura de catálogos mediante SQL SELECT. No incluye filas ni claves. **No reproducir permisos excesivos sin corrección revisada.** Estos resultados describen el estado efectivo remoto, no sustituyen un dump de ACL/owners/default privileges.

```json
{
  "extensions": [
    {
      "name": "pg_cron",
      "schema": "pg_catalog",
      "version": "1.6.4"
    },
    {
      "name": "pg_stat_statements",
      "schema": "extensions",
      "version": "1.11"
    },
    {
      "name": "pgcrypto",
      "schema": "extensions",
      "version": "1.3"
    },
    {
      "name": "plpgsql",
      "schema": "pg_catalog",
      "version": "1.0"
    },
    {
      "name": "supabase_vault",
      "schema": "vault",
      "version": "0.3.1"
    },
    {
      "name": "uuid-ossp",
      "schema": "extensions",
      "version": "1.1"
    }
  ],
  "table_privileges": [
    {
      "role": "anon",
      "table": "private.content_delivery_log",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "private.content_delivery_log",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "private.content_delivery_log",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "anon",
      "table": "private.content_items",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "private.content_items",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "private.content_items",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "anon",
      "table": "private.plan_limits",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "private.plan_limits",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "private.plan_limits",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "anon",
      "table": "public.accounts",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": true,
      "truncate": true
    },
    {
      "role": "authenticated",
      "table": "public.accounts",
      "delete": false,
      "insert": false,
      "select": true,
      "update": false,
      "trigger": true,
      "truncate": true
    },
    {
      "role": "service_role",
      "table": "public.accounts",
      "delete": false,
      "insert": false,
      "select": true,
      "update": true,
      "trigger": true,
      "truncate": true
    },
    {
      "role": "anon",
      "table": "public.billing_account_locks",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "public.billing_account_locks",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "public.billing_account_locks",
      "delete": true,
      "insert": true,
      "select": true,
      "update": true,
      "trigger": true,
      "truncate": true
    },
    {
      "role": "anon",
      "table": "public.billing_checkout_attempts",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "public.billing_checkout_attempts",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "public.billing_checkout_attempts",
      "delete": true,
      "insert": true,
      "select": true,
      "update": true,
      "trigger": true,
      "truncate": true
    },
    {
      "role": "anon",
      "table": "public.billing_webhook_events",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "public.billing_webhook_events",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "public.billing_webhook_events",
      "delete": true,
      "insert": true,
      "select": true,
      "update": true,
      "trigger": true,
      "truncate": true
    },
    {
      "role": "anon",
      "table": "public.content_seen",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "public.content_seen",
      "delete": false,
      "insert": false,
      "select": true,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "public.content_seen",
      "delete": true,
      "insert": true,
      "select": true,
      "update": true,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "anon",
      "table": "public.content_usage",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "public.content_usage",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "public.content_usage",
      "delete": false,
      "insert": true,
      "select": true,
      "update": true,
      "trigger": true,
      "truncate": true
    },
    {
      "role": "anon",
      "table": "public.exercise_results",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "public.exercise_results",
      "delete": false,
      "insert": true,
      "select": true,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "public.exercise_results",
      "delete": true,
      "insert": true,
      "select": true,
      "update": true,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "anon",
      "table": "public.learner_privacy_audit",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "public.learner_privacy_audit",
      "delete": false,
      "insert": false,
      "select": true,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "public.learner_privacy_audit",
      "delete": true,
      "insert": true,
      "select": true,
      "update": false,
      "trigger": true,
      "truncate": true
    },
    {
      "role": "anon",
      "table": "public.learner_profiles",
      "delete": false,
      "insert": false,
      "select": false,
      "update": false,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "authenticated",
      "table": "public.learner_profiles",
      "delete": true,
      "insert": true,
      "select": true,
      "update": true,
      "trigger": false,
      "truncate": false
    },
    {
      "role": "service_role",
      "table": "public.learner_profiles",
      "delete": true,
      "insert": true,
      "select": true,
      "update": true,
      "trigger": false,
      "truncate": false
    }
  ],
  "schema_privileges": [
    {
      "role": "anon",
      "usage": false,
      "schema": "private"
    },
    {
      "role": "authenticated",
      "usage": false,
      "schema": "private"
    },
    {
      "role": "service_role",
      "usage": false,
      "schema": "private"
    },
    {
      "role": "anon",
      "usage": true,
      "schema": "public"
    },
    {
      "role": "authenticated",
      "usage": true,
      "schema": "public"
    },
    {
      "role": "service_role",
      "usage": true,
      "schema": "public"
    }
  ],
  "column_update_grants": [
    {
      "table": "public.accounts",
      "column": "content_locale",
      "grantee": "authenticated"
    },
    {
      "table": "public.learner_profiles",
      "column": "account_id",
      "grantee": "authenticated"
    },
    {
      "table": "public.learner_profiles",
      "column": "age_band",
      "grantee": "authenticated"
    },
    {
      "table": "public.learner_profiles",
      "column": "created_at",
      "grantee": "authenticated"
    },
    {
      "table": "public.learner_profiles",
      "column": "id",
      "grantee": "authenticated"
    },
    {
      "table": "public.learner_profiles",
      "column": "locale",
      "grantee": "authenticated"
    },
    {
      "table": "public.learner_profiles",
      "column": "name",
      "grantee": "authenticated"
    },
    {
      "table": "public.learner_profiles",
      "column": "privacy_review_at",
      "grantee": "authenticated"
    },
    {
      "table": "public.learner_profiles",
      "column": "progress",
      "grantee": "authenticated"
    },
    {
      "table": "public.learner_profiles",
      "column": "updated_at",
      "grantee": "authenticated"
    }
  ]
}
```

## Hallazgos para pruebas locales

- `public.accounts`: `anon` y `authenticated` muestran permisos efectivos `TRUNCATE` y `TRIGGER`. Estudiar corrección en migración nueva independiente, después de reproducir el estado observado, y ensayar el impacto en staging. RLS no protege TRUNCATE.
- `public.accounts.content_locale`: existe permiso de UPDATE de columna para `authenticated`, aunque no de UPDATE de tabla; validar actualización de idioma con RLS.
- `private` carece de USAGE para `anon`, `authenticated` y `service_role`, por lo que las funciones con SECURITY DEFINER y propietario aprobado deben gestionar acceso indirecto. No conceder USAGE indiscriminado.
- `public.set_updated_at()` permite EXECUTE a roles clientes; revisar su necesidad y la viabilidad de restringirlo sin afectar los triggers.

## Alcance y cautelas

- La estructura capturada contiene 12 tablas, 86 columnas, 43 restricciones, 28 índices, 6 triggers y 10 políticas. En un documento separado constan las definiciones de tres funciones base; las otras nueve están versionadas por migraciones existentes.
- **La base remota tiene `client_attempt_id` pero NO tiene aplicada la nulabilidad de `correct` ni el índice único normalizado de códigos de perfil**, por lo que no refleja todos los deltas de PR #51.
- El DDL actual no permite demostrar cuál era el DDL exacto previo a las primeras migraciones: decidir bootstrap histórico frente a baseline consolidada sólo tras simulación de compatibilidad y verificación.
- No se capturan aquí roles completos, membresías, ACL por defecto, opciones de secuencias, publicaciones Realtime ni configuración Auth/SMTP/Edge. Una captura de esquema con pg_dump aprobada y revisada sería más completa, pero requiere conexión apropiada.

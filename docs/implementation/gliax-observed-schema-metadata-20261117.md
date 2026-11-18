# GLIAX — estructura observada en Supabase (metadatos, 17/11/2026)

Captura de consultas `SELECT` a catálogos. **No es un pg_dump ni contiene filas de usuarios.** No ejecutar directamente como migración. La estructura corresponde al estado remoto anterior a las migraciones nuevas de noviembre. Revisar y clasificar objetos antes de construir bootstrap.

```json
{
  "enums": [
    {
      "name": "public.subscription_status",
      "labels": [
        "trial",
        "active",
        "past_due",
        "cancelled",
        "complimentary"
      ]
    }
  ],
  "tables": [
    {
      "rls": false,
      "name": "content_delivery_log",
      "schema": "private",
      "force_rls": false
    },
    {
      "rls": false,
      "name": "content_items",
      "schema": "private",
      "force_rls": false
    },
    {
      "rls": false,
      "name": "plan_limits",
      "schema": "private",
      "force_rls": false
    },
    {
      "rls": true,
      "name": "accounts",
      "schema": "public",
      "force_rls": false
    },
    {
      "rls": true,
      "name": "billing_account_locks",
      "schema": "public",
      "force_rls": false
    },
    {
      "rls": true,
      "name": "billing_checkout_attempts",
      "schema": "public",
      "force_rls": false
    },
    {
      "rls": true,
      "name": "billing_webhook_events",
      "schema": "public",
      "force_rls": false
    },
    {
      "rls": true,
      "name": "content_seen",
      "schema": "public",
      "force_rls": false
    },
    {
      "rls": true,
      "name": "content_usage",
      "schema": "public",
      "force_rls": false
    },
    {
      "rls": true,
      "name": "exercise_results",
      "schema": "public",
      "force_rls": false
    },
    {
      "rls": true,
      "name": "learner_privacy_audit",
      "schema": "public",
      "force_rls": false
    },
    {
      "rls": true,
      "name": "learner_profiles",
      "schema": "public",
      "force_rls": false
    }
  ],
  "columns": [
    {
      "name": "id",
      "type": "int8",
      "table": "private.content_delivery_log",
      "default": null,
      "identity": "ALWAYS",
      "nullable": false
    },
    {
      "name": "user_id",
      "type": "uuid",
      "table": "private.content_delivery_log",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "profile_id",
      "type": "uuid",
      "table": "private.content_delivery_log",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "content_id",
      "type": "uuid",
      "table": "private.content_delivery_log",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "kind",
      "type": "text",
      "table": "private.content_delivery_log",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "delivered_at",
      "type": "timestamptz",
      "table": "private.content_delivery_log",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "id",
      "type": "uuid",
      "table": "private.content_items",
      "default": "gen_random_uuid()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "kind",
      "type": "text",
      "table": "private.content_items",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "age_band",
      "type": "text",
      "table": "private.content_items",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "domain",
      "type": "text",
      "table": "private.content_items",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "subdomain",
      "type": "text",
      "table": "private.content_items",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "level",
      "type": "int2",
      "table": "private.content_items",
      "default": "1",
      "identity": null,
      "nullable": false
    },
    {
      "name": "theme",
      "type": "text",
      "table": "private.content_items",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "payload",
      "type": "jsonb",
      "table": "private.content_items",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "is_active",
      "type": "bool",
      "table": "private.content_items",
      "default": "true",
      "identity": null,
      "nullable": false
    },
    {
      "name": "created_at",
      "type": "timestamptz",
      "table": "private.content_items",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "updated_at",
      "type": "timestamptz",
      "table": "private.content_items",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "source_key",
      "type": "text",
      "table": "private.content_items",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "plan",
      "type": "subscription_status",
      "table": "private.plan_limits",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "online_items_per_day",
      "type": "int4",
      "table": "private.plan_limits",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "printable_worksheets_per_day",
      "type": "int4",
      "table": "private.plan_limits",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "game_rounds_per_day",
      "type": "int4",
      "table": "private.plan_limits",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "user_id",
      "type": "uuid",
      "table": "public.accounts",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "subscription_status",
      "type": "subscription_status",
      "table": "public.accounts",
      "default": "'trial'::subscription_status",
      "identity": null,
      "nullable": false
    },
    {
      "name": "trial_started_at",
      "type": "timestamptz",
      "table": "public.accounts",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "trial_ends_at",
      "type": "timestamptz",
      "table": "public.accounts",
      "default": "(now() + '7 days'::interval)",
      "identity": null,
      "nullable": false
    },
    {
      "name": "stripe_customer_id",
      "type": "text",
      "table": "public.accounts",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "stripe_subscription_id",
      "type": "text",
      "table": "public.accounts",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "current_period_end",
      "type": "timestamptz",
      "table": "public.accounts",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "created_at",
      "type": "timestamptz",
      "table": "public.accounts",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "updated_at",
      "type": "timestamptz",
      "table": "public.accounts",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "content_locale",
      "type": "text",
      "table": "public.accounts",
      "default": "'es_intl'::text",
      "identity": null,
      "nullable": false
    },
    {
      "name": "user_id",
      "type": "uuid",
      "table": "public.billing_account_locks",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "owner",
      "type": "uuid",
      "table": "public.billing_account_locks",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "expires_at",
      "type": "timestamptz",
      "table": "public.billing_account_locks",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "id",
      "type": "uuid",
      "table": "public.billing_checkout_attempts",
      "default": "gen_random_uuid()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "user_id",
      "type": "uuid",
      "table": "public.billing_checkout_attempts",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "livemode",
      "type": "bool",
      "table": "public.billing_checkout_attempts",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "price_id",
      "type": "text",
      "table": "public.billing_checkout_attempts",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "customer_id",
      "type": "text",
      "table": "public.billing_checkout_attempts",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "checkout_session_id",
      "type": "text",
      "table": "public.billing_checkout_attempts",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "expires_at",
      "type": "timestamptz",
      "table": "public.billing_checkout_attempts",
      "default": "(now() + '01:00:00'::interval)",
      "identity": null,
      "nullable": false
    },
    {
      "name": "created_at",
      "type": "timestamptz",
      "table": "public.billing_checkout_attempts",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "event_id",
      "type": "text",
      "table": "public.billing_webhook_events",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "user_id",
      "type": "uuid",
      "table": "public.billing_webhook_events",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "livemode",
      "type": "bool",
      "table": "public.billing_webhook_events",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "processed_at",
      "type": "timestamptz",
      "table": "public.billing_webhook_events",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "id",
      "type": "int8",
      "table": "public.content_seen",
      "default": null,
      "identity": "BY DEFAULT",
      "nullable": false
    },
    {
      "name": "user_id",
      "type": "uuid",
      "table": "public.content_seen",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "profile_id",
      "type": "uuid",
      "table": "public.content_seen",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "domain",
      "type": "text",
      "table": "public.content_seen",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "item_signature",
      "type": "text",
      "table": "public.content_seen",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "mechanic_signature",
      "type": "text",
      "table": "public.content_seen",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "created_at",
      "type": "timestamptz",
      "table": "public.content_seen",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "user_id",
      "type": "uuid",
      "table": "public.content_usage",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "usage_date",
      "type": "date",
      "table": "public.content_usage",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "kind",
      "type": "text",
      "table": "public.content_usage",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "used",
      "type": "int4",
      "table": "public.content_usage",
      "default": "0",
      "identity": null,
      "nullable": false
    },
    {
      "name": "updated_at",
      "type": "timestamptz",
      "table": "public.content_usage",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "id",
      "type": "int8",
      "table": "public.exercise_results",
      "default": null,
      "identity": "ALWAYS",
      "nullable": false
    },
    {
      "name": "profile_id",
      "type": "uuid",
      "table": "public.exercise_results",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "occurred_at",
      "type": "timestamptz",
      "table": "public.exercise_results",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "session_id",
      "type": "text",
      "table": "public.exercise_results",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "session_started_at",
      "type": "timestamptz",
      "table": "public.exercise_results",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "subject",
      "type": "text",
      "table": "public.exercise_results",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "level",
      "type": "int2",
      "table": "public.exercise_results",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "correct",
      "type": "bool",
      "table": "public.exercise_results",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "points",
      "type": "int4",
      "table": "public.exercise_results",
      "default": "0",
      "identity": null,
      "nullable": false
    },
    {
      "name": "item_id",
      "type": "text",
      "table": "public.exercise_results",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "detail",
      "type": "text",
      "table": "public.exercise_results",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "created_at",
      "type": "timestamptz",
      "table": "public.exercise_results",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "client_attempt_id",
      "type": "uuid",
      "table": "public.exercise_results",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "id",
      "type": "int8",
      "table": "public.learner_privacy_audit",
      "default": null,
      "identity": "ALWAYS",
      "nullable": false
    },
    {
      "name": "account_id",
      "type": "uuid",
      "table": "public.learner_privacy_audit",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "profile_id",
      "type": "uuid",
      "table": "public.learner_privacy_audit",
      "default": null,
      "identity": null,
      "nullable": true
    },
    {
      "name": "action",
      "type": "text",
      "table": "public.learner_privacy_audit",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "occurred_at",
      "type": "timestamptz",
      "table": "public.learner_privacy_audit",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "id",
      "type": "uuid",
      "table": "public.learner_profiles",
      "default": "gen_random_uuid()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "account_id",
      "type": "uuid",
      "table": "public.learner_profiles",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "name",
      "type": "text",
      "table": "public.learner_profiles",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "age_band",
      "type": "text",
      "table": "public.learner_profiles",
      "default": null,
      "identity": null,
      "nullable": false
    },
    {
      "name": "progress",
      "type": "jsonb",
      "table": "public.learner_profiles",
      "default": "'{}'::jsonb",
      "identity": null,
      "nullable": false
    },
    {
      "name": "created_at",
      "type": "timestamptz",
      "table": "public.learner_profiles",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "updated_at",
      "type": "timestamptz",
      "table": "public.learner_profiles",
      "default": "now()",
      "identity": null,
      "nullable": false
    },
    {
      "name": "locale",
      "type": "text",
      "table": "public.learner_profiles",
      "default": "'es_intl'::text",
      "identity": null,
      "nullable": false
    },
    {
      "name": "privacy_review_at",
      "type": "date",
      "table": "public.learner_profiles",
      "default": null,
      "identity": null,
      "nullable": true
    }
  ],
  "indexes": [
    {
      "ddl": "CREATE UNIQUE INDEX content_delivery_log_pkey ON private.content_delivery_log USING btree (id)",
      "name": "content_delivery_log_pkey",
      "table": "private.content_delivery_log"
    },
    {
      "ddl": "CREATE INDEX delivery_content_id_idx ON private.content_delivery_log USING btree (content_id)",
      "name": "delivery_content_id_idx",
      "table": "private.content_delivery_log"
    },
    {
      "ddl": "CREATE INDEX delivery_profile_content_idx ON private.content_delivery_log USING btree (profile_id, content_id)",
      "name": "delivery_profile_content_idx",
      "table": "private.content_delivery_log"
    },
    {
      "ddl": "CREATE INDEX delivery_user_day_idx ON private.content_delivery_log USING btree (user_id, delivered_at DESC)",
      "name": "delivery_user_day_idx",
      "table": "private.content_delivery_log"
    },
    {
      "ddl": "CREATE INDEX content_items_pick_idx ON private.content_items USING btree (kind, age_band, domain, level, is_active)",
      "name": "content_items_pick_idx",
      "table": "private.content_items"
    },
    {
      "ddl": "CREATE UNIQUE INDEX content_items_pkey ON private.content_items USING btree (id)",
      "name": "content_items_pkey",
      "table": "private.content_items"
    },
    {
      "ddl": "CREATE UNIQUE INDEX content_items_source_key_uidx ON private.content_items USING btree (source_key) WHERE (source_key IS NOT NULL)",
      "name": "content_items_source_key_uidx",
      "table": "private.content_items"
    },
    {
      "ddl": "CREATE UNIQUE INDEX plan_limits_pkey ON private.plan_limits USING btree (plan)",
      "name": "plan_limits_pkey",
      "table": "private.plan_limits"
    },
    {
      "ddl": "CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (user_id)",
      "name": "accounts_pkey",
      "table": "public.accounts"
    },
    {
      "ddl": "CREATE UNIQUE INDEX accounts_stripe_customer_id_key ON public.accounts USING btree (stripe_customer_id)",
      "name": "accounts_stripe_customer_id_key",
      "table": "public.accounts"
    },
    {
      "ddl": "CREATE UNIQUE INDEX accounts_stripe_subscription_id_key ON public.accounts USING btree (stripe_subscription_id)",
      "name": "accounts_stripe_subscription_id_key",
      "table": "public.accounts"
    },
    {
      "ddl": "CREATE UNIQUE INDEX billing_account_locks_pkey ON public.billing_account_locks USING btree (user_id)",
      "name": "billing_account_locks_pkey",
      "table": "public.billing_account_locks"
    },
    {
      "ddl": "CREATE UNIQUE INDEX billing_checkout_attempts_checkout_session_id_key ON public.billing_checkout_attempts USING btree (checkout_session_id)",
      "name": "billing_checkout_attempts_checkout_session_id_key",
      "table": "public.billing_checkout_attempts"
    },
    {
      "ddl": "CREATE UNIQUE INDEX billing_checkout_attempts_pkey ON public.billing_checkout_attempts USING btree (id)",
      "name": "billing_checkout_attempts_pkey",
      "table": "public.billing_checkout_attempts"
    },
    {
      "ddl": "CREATE INDEX billing_checkout_owner ON public.billing_checkout_attempts USING btree (user_id, livemode, created_at DESC)",
      "name": "billing_checkout_owner",
      "table": "public.billing_checkout_attempts"
    },
    {
      "ddl": "CREATE UNIQUE INDEX billing_webhook_events_pkey ON public.billing_webhook_events USING btree (event_id)",
      "name": "billing_webhook_events_pkey",
      "table": "public.billing_webhook_events"
    },
    {
      "ddl": "CREATE UNIQUE INDEX content_seen_pkey ON public.content_seen USING btree (id)",
      "name": "content_seen_pkey",
      "table": "public.content_seen"
    },
    {
      "ddl": "CREATE INDEX content_seen_profile_domain_created_idx ON public.content_seen USING btree (profile_id, domain, created_at DESC)",
      "name": "content_seen_profile_domain_created_idx",
      "table": "public.content_seen"
    },
    {
      "ddl": "CREATE INDEX content_usage_date_idx ON public.content_usage USING btree (usage_date)",
      "name": "content_usage_date_idx",
      "table": "public.content_usage"
    },
    {
      "ddl": "CREATE UNIQUE INDEX content_usage_pkey ON public.content_usage USING btree (user_id, usage_date, kind)",
      "name": "content_usage_pkey",
      "table": "public.content_usage"
    },
    {
      "ddl": "CREATE UNIQUE INDEX exercise_results_pkey ON public.exercise_results USING btree (id)",
      "name": "exercise_results_pkey",
      "table": "public.exercise_results"
    },
    {
      "ddl": "CREATE UNIQUE INDEX exercise_results_profile_client_attempt_key ON public.exercise_results USING btree (profile_id, client_attempt_id)",
      "name": "exercise_results_profile_client_attempt_key",
      "table": "public.exercise_results"
    },
    {
      "ddl": "CREATE INDEX exercise_results_profile_subject_idx ON public.exercise_results USING btree (profile_id, subject)",
      "name": "exercise_results_profile_subject_idx",
      "table": "public.exercise_results"
    },
    {
      "ddl": "CREATE INDEX exercise_results_profile_time_idx ON public.exercise_results USING btree (profile_id, occurred_at DESC)",
      "name": "exercise_results_profile_time_idx",
      "table": "public.exercise_results"
    },
    {
      "ddl": "CREATE INDEX learner_privacy_audit_account_id_occurred_at_idx ON public.learner_privacy_audit USING btree (account_id, occurred_at)",
      "name": "learner_privacy_audit_account_id_occurred_at_idx",
      "table": "public.learner_privacy_audit"
    },
    {
      "ddl": "CREATE UNIQUE INDEX learner_privacy_audit_pkey ON public.learner_privacy_audit USING btree (id)",
      "name": "learner_privacy_audit_pkey",
      "table": "public.learner_privacy_audit"
    },
    {
      "ddl": "CREATE INDEX learner_profiles_account_id_idx ON public.learner_profiles USING btree (account_id)",
      "name": "learner_profiles_account_id_idx",
      "table": "public.learner_profiles"
    },
    {
      "ddl": "CREATE UNIQUE INDEX learner_profiles_pkey ON public.learner_profiles USING btree (id)",
      "name": "learner_profiles_pkey",
      "table": "public.learner_profiles"
    }
  ],
  "policies": [
    {
      "name": "accounts_select_own",
      "check": null,
      "roles": [
        "authenticated"
      ],
      "table": "public.accounts",
      "using": "(user_id = ( SELECT auth.uid() AS uid))",
      "operation": "SELECT"
    },
    {
      "name": "accounts_update_own_locale",
      "check": "(user_id = ( SELECT auth.uid() AS uid))",
      "roles": [
        "authenticated"
      ],
      "table": "public.accounts",
      "using": "(user_id = ( SELECT auth.uid() AS uid))",
      "operation": "UPDATE"
    },
    {
      "name": "seen_select_own",
      "check": null,
      "roles": [
        "authenticated"
      ],
      "table": "public.content_seen",
      "using": "((user_id = auth.uid()) AND (EXISTS ( SELECT 1\n   FROM learner_profiles p\n  WHERE ((p.id = content_seen.profile_id) AND (p.account_id = auth.uid())))))",
      "operation": "SELECT"
    },
    {
      "name": "results_insert_own",
      "check": "(EXISTS ( SELECT 1\n   FROM learner_profiles p\n  WHERE ((p.id = exercise_results.profile_id) AND (p.account_id = auth.uid()))))",
      "roles": [
        "authenticated"
      ],
      "table": "public.exercise_results",
      "using": null,
      "operation": "INSERT"
    },
    {
      "name": "results_select_own",
      "check": null,
      "roles": [
        "authenticated"
      ],
      "table": "public.exercise_results",
      "using": "(EXISTS ( SELECT 1\n   FROM learner_profiles p\n  WHERE ((p.id = exercise_results.profile_id) AND (p.account_id = auth.uid()))))",
      "operation": "SELECT"
    },
    {
      "name": "audit_own",
      "check": null,
      "roles": [
        "authenticated"
      ],
      "table": "public.learner_privacy_audit",
      "using": "(account_id = auth.uid())",
      "operation": "SELECT"
    },
    {
      "name": "profiles_delete_own",
      "check": null,
      "roles": [
        "authenticated"
      ],
      "table": "public.learner_profiles",
      "using": "(account_id = auth.uid())",
      "operation": "DELETE"
    },
    {
      "name": "profiles_insert_own",
      "check": "(account_id = auth.uid())",
      "roles": [
        "authenticated"
      ],
      "table": "public.learner_profiles",
      "using": null,
      "operation": "INSERT"
    },
    {
      "name": "profiles_select_own",
      "check": null,
      "roles": [
        "authenticated"
      ],
      "table": "public.learner_profiles",
      "using": "(account_id = auth.uid())",
      "operation": "SELECT"
    },
    {
      "name": "profiles_update_own",
      "check": "(account_id = auth.uid())",
      "roles": [
        "authenticated"
      ],
      "table": "public.learner_profiles",
      "using": "(account_id = auth.uid())",
      "operation": "UPDATE"
    }
  ],
  "triggers": [
    {
      "ddl": "CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user()",
      "table": "auth.users"
    },
    {
      "ddl": "CREATE TRIGGER content_items_set_updated_at BEFORE UPDATE ON private.content_items FOR EACH ROW EXECUTE FUNCTION set_updated_at()",
      "table": "private.content_items"
    },
    {
      "ddl": "CREATE TRIGGER accounts_set_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at()",
      "table": "public.accounts"
    },
    {
      "ddl": "CREATE TRIGGER learner_privacy_delete BEFORE DELETE ON learner_profiles FOR EACH ROW EXECUTE FUNCTION enforce_learner_privacy()",
      "table": "public.learner_profiles"
    },
    {
      "ddl": "CREATE TRIGGER learner_privacy_write BEFORE INSERT OR UPDATE ON learner_profiles FOR EACH ROW EXECUTE FUNCTION enforce_learner_privacy()",
      "table": "public.learner_profiles"
    },
    {
      "ddl": "CREATE TRIGGER learner_profiles_set_updated_at BEFORE UPDATE ON learner_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at()",
      "table": "public.learner_profiles"
    }
  ],
  "constraints": [
    {
      "ddl": "FOREIGN KEY (content_id) REFERENCES private.content_items(id) ON DELETE CASCADE",
      "name": "content_delivery_log_content_id_fkey",
      "type": "f",
      "table": "private.content_delivery_log"
    },
    {
      "ddl": "PRIMARY KEY (id)",
      "name": "content_delivery_log_pkey",
      "type": "p",
      "table": "private.content_delivery_log"
    },
    {
      "ddl": "FOREIGN KEY (profile_id) REFERENCES learner_profiles(id) ON DELETE CASCADE",
      "name": "content_delivery_log_profile_id_fkey",
      "type": "f",
      "table": "private.content_delivery_log"
    },
    {
      "ddl": "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
      "name": "content_delivery_log_user_id_fkey",
      "type": "f",
      "table": "private.content_delivery_log"
    },
    {
      "ddl": "CHECK (age_band = ANY (ARRAY['primary'::text, 'middle'::text, 'teen'::text]))",
      "name": "content_items_age_band_check",
      "type": "c",
      "table": "private.content_items"
    },
    {
      "ddl": "CHECK (kind = ANY (ARRAY['exercise'::text, 'worksheet'::text, 'game'::text]))",
      "name": "content_items_kind_check",
      "type": "c",
      "table": "private.content_items"
    },
    {
      "ddl": "CHECK (level >= 1 AND level <= 3)",
      "name": "content_items_level_check",
      "type": "c",
      "table": "private.content_items"
    },
    {
      "ddl": "PRIMARY KEY (id)",
      "name": "content_items_pkey",
      "type": "p",
      "table": "private.content_items"
    },
    {
      "ddl": "CHECK (game_rounds_per_day > 0)",
      "name": "plan_limits_game_rounds_per_day_check",
      "type": "c",
      "table": "private.plan_limits"
    },
    {
      "ddl": "CHECK (online_items_per_day > 0)",
      "name": "plan_limits_online_items_per_day_check",
      "type": "c",
      "table": "private.plan_limits"
    },
    {
      "ddl": "PRIMARY KEY (plan)",
      "name": "plan_limits_pkey",
      "type": "p",
      "table": "private.plan_limits"
    },
    {
      "ddl": "CHECK (printable_worksheets_per_day > 0)",
      "name": "plan_limits_printable_worksheets_per_day_check",
      "type": "c",
      "table": "private.plan_limits"
    },
    {
      "ddl": "CHECK (content_locale = ANY (ARRAY['es_intl'::text, 'es_es'::text, 'es_mx'::text, 'es_co'::text, 'es_ar'::text, 'es_cl'::text, 'es_pa'::text, 'es_cr'::text]))",
      "name": "accounts_content_locale_check",
      "type": "c",
      "table": "public.accounts"
    },
    {
      "ddl": "PRIMARY KEY (user_id)",
      "name": "accounts_pkey",
      "type": "p",
      "table": "public.accounts"
    },
    {
      "ddl": "UNIQUE (stripe_customer_id)",
      "name": "accounts_stripe_customer_id_key",
      "type": "u",
      "table": "public.accounts"
    },
    {
      "ddl": "UNIQUE (stripe_subscription_id)",
      "name": "accounts_stripe_subscription_id_key",
      "type": "u",
      "table": "public.accounts"
    },
    {
      "ddl": "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
      "name": "accounts_user_id_fkey",
      "type": "f",
      "table": "public.accounts"
    },
    {
      "ddl": "PRIMARY KEY (user_id)",
      "name": "billing_account_locks_pkey",
      "type": "p",
      "table": "public.billing_account_locks"
    },
    {
      "ddl": "FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE CASCADE",
      "name": "billing_account_locks_user_id_fkey",
      "type": "f",
      "table": "public.billing_account_locks"
    },
    {
      "ddl": "UNIQUE (checkout_session_id)",
      "name": "billing_checkout_attempts_checkout_session_id_key",
      "type": "u",
      "table": "public.billing_checkout_attempts"
    },
    {
      "ddl": "PRIMARY KEY (id)",
      "name": "billing_checkout_attempts_pkey",
      "type": "p",
      "table": "public.billing_checkout_attempts"
    },
    {
      "ddl": "FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE CASCADE",
      "name": "billing_checkout_attempts_user_id_fkey",
      "type": "f",
      "table": "public.billing_checkout_attempts"
    },
    {
      "ddl": "PRIMARY KEY (event_id)",
      "name": "billing_webhook_events_pkey",
      "type": "p",
      "table": "public.billing_webhook_events"
    },
    {
      "ddl": "FOREIGN KEY (user_id) REFERENCES accounts(user_id) ON DELETE CASCADE",
      "name": "billing_webhook_events_user_id_fkey",
      "type": "f",
      "table": "public.billing_webhook_events"
    },
    {
      "ddl": "PRIMARY KEY (id)",
      "name": "content_seen_pkey",
      "type": "p",
      "table": "public.content_seen"
    },
    {
      "ddl": "FOREIGN KEY (profile_id) REFERENCES learner_profiles(id) ON DELETE CASCADE",
      "name": "content_seen_profile_id_fkey",
      "type": "f",
      "table": "public.content_seen"
    },
    {
      "ddl": "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
      "name": "content_seen_user_id_fkey",
      "type": "f",
      "table": "public.content_seen"
    },
    {
      "ddl": "CHECK (kind = ANY (ARRAY['exercise'::text, 'worksheet'::text, 'game'::text]))",
      "name": "content_usage_kind_check",
      "type": "c",
      "table": "public.content_usage"
    },
    {
      "ddl": "PRIMARY KEY (user_id, usage_date, kind)",
      "name": "content_usage_pkey",
      "type": "p",
      "table": "public.content_usage"
    },
    {
      "ddl": "CHECK (used >= 0)",
      "name": "content_usage_used_check",
      "type": "c",
      "table": "public.content_usage"
    },
    {
      "ddl": "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
      "name": "content_usage_user_id_fkey",
      "type": "f",
      "table": "public.content_usage"
    },
    {
      "ddl": "CHECK (level >= 1 AND level <= 3)",
      "name": "exercise_results_level_check",
      "type": "c",
      "table": "public.exercise_results"
    },
    {
      "ddl": "PRIMARY KEY (id)",
      "name": "exercise_results_pkey",
      "type": "p",
      "table": "public.exercise_results"
    },
    {
      "ddl": "UNIQUE (profile_id, client_attempt_id)",
      "name": "exercise_results_profile_client_attempt_key",
      "type": "u",
      "table": "public.exercise_results"
    },
    {
      "ddl": "FOREIGN KEY (profile_id) REFERENCES learner_profiles(id) ON DELETE CASCADE",
      "name": "exercise_results_profile_id_fkey",
      "type": "f",
      "table": "public.exercise_results"
    },
    {
      "ddl": "FOREIGN KEY (account_id) REFERENCES accounts(user_id) ON DELETE CASCADE",
      "name": "learner_privacy_audit_account_id_fkey",
      "type": "f",
      "table": "public.learner_privacy_audit"
    },
    {
      "ddl": "CHECK (action = ANY (ARRAY['open'::text, 'export'::text, 'delete'::text, 'settings'::text]))",
      "name": "learner_privacy_audit_action_check",
      "type": "c",
      "table": "public.learner_privacy_audit"
    },
    {
      "ddl": "PRIMARY KEY (id)",
      "name": "learner_privacy_audit_pkey",
      "type": "p",
      "table": "public.learner_privacy_audit"
    },
    {
      "ddl": "FOREIGN KEY (account_id) REFERENCES accounts(user_id) ON DELETE CASCADE",
      "name": "learner_profiles_account_id_fkey",
      "type": "f",
      "table": "public.learner_profiles"
    },
    {
      "ddl": "CHECK (age_band = ANY (ARRAY['primary'::text, 'middle'::text, 'teen'::text]))",
      "name": "learner_profiles_age_band_check",
      "type": "c",
      "table": "public.learner_profiles"
    },
    {
      "ddl": "CHECK (locale = ANY (ARRAY['es_intl'::text, 'es_es'::text, 'es_mx'::text, 'es_co'::text, 'es_ar'::text, 'es_cl'::text, 'es_pa'::text, 'es_cr'::text]))",
      "name": "learner_profiles_locale_check",
      "type": "c",
      "table": "public.learner_profiles"
    },
    {
      "ddl": "CHECK (char_length(name) >= 1 AND char_length(name) <= 80)",
      "name": "learner_profiles_name_check",
      "type": "c",
      "table": "public.learner_profiles"
    },
    {
      "ddl": "PRIMARY KEY (id)",
      "name": "learner_profiles_pkey",
      "type": "p",
      "table": "public.learner_profiles"
    }
  ]
}
```

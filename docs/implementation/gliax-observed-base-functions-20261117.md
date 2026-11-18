# GLIAX — funciones originales faltantes (lectura catálogos, 17/11/2026)

**No es una migración ejecutable.** Las definiciones se han obtenido exclusivamente con `pg_get_functiondef` y consultas de privilegios, sin consultar registros. Las funciones de las seis migraciones existentes se deben extraer del repositorio; no duplicarlas en bootstrap.

```json
[
  {
    "ddl": "CREATE OR REPLACE FUNCTION public.handle_new_user()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\nbegin\n  insert into public.accounts (user_id)\n  values (new.id)\n  on conflict (user_id) do nothing;\n  return new;\nend;\n$function$\n",
    "owner": "postgres",
    "schema": "public",
    "function": "handle_new_user",
    "exec_anon": false,
    "exec_auth": false,
    "exec_service": false,
    "security_definer": true
  },
  {
    "ddl": "CREATE OR REPLACE FUNCTION public.request_learning_content_internal(p_user_id uuid, p_profile_id uuid, p_kind text, p_domain text DEFAULT NULL::text, p_level smallint DEFAULT 1, p_count integer DEFAULT 1)\n RETURNS TABLE(content_id uuid, content jsonb)\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public', 'private'\nAS $function$\ndeclare\n  v_status public.subscription_status;\n  v_trial_ends timestamptz;\n  v_age_band text;\n  v_limit integer;\n  v_used integer;\n  v_max_request integer;\nbegin\n  select a.subscription_status, a.trial_ends_at, p.age_band\n  into v_status, v_trial_ends, v_age_band\n  from public.accounts a\n  join public.learner_profiles p on p.account_id = a.user_id\n  where a.user_id = p_user_id\n    and p.id = p_profile_id;\n\n  if not found then\n    raise exception 'Profile not found';\n  end if;\n\n  if v_status = 'trial' and now() >= v_trial_ends then\n    raise exception 'Trial expired';\n  end if;\n\n  if p_kind not in ('exercise','worksheet','game') then\n    raise exception 'Invalid content kind';\n  end if;\n\n  v_max_request := case\n    when p_kind = 'exercise' then 10\n    else 1\n  end;\n\n  if p_count < 1 or p_count > v_max_request then\n    raise exception 'Invalid request size';\n  end if;\n\n  select case\n    when p_kind = 'worksheet' then printable_worksheets_per_day\n    when p_kind = 'game' then game_rounds_per_day\n    else online_items_per_day\n  end\n  into v_limit\n  from private.plan_limits\n  where plan = v_status;\n\n  select count(*)\n  into v_used\n  from private.content_delivery_log\n  where user_id = p_user_id\n    and kind = p_kind\n    and delivered_at >= date_trunc('day', now());\n\n  if v_used + p_count > v_limit then\n    raise exception 'Daily content limit reached';\n  end if;\n\n  return query\n  with chosen as (\n    select c.id, c.payload\n    from private.content_items c\n    where c.is_active\n      and c.kind = p_kind\n      and c.age_band = v_age_band\n      and c.level <= greatest(1, least(3, p_level))\n      and (p_domain is null or c.domain = p_domain)\n      and not exists (\n        select 1\n        from private.content_delivery_log d\n        where d.profile_id = p_profile_id\n          and d.content_id = c.id\n      )\n    order by random()\n    limit p_count\n  ),\n  logged as (\n    insert into private.content_delivery_log(user_id, profile_id, content_id, kind)\n    select p_user_id, p_profile_id, chosen.id, p_kind\n    from chosen\n    returning content_id\n  )\n  select chosen.id, chosen.payload\n  from chosen\n  join logged on logged.content_id = chosen.id;\nend;\n$function$\n",
    "owner": "postgres",
    "schema": "public",
    "function": "request_learning_content_internal",
    "exec_anon": false,
    "exec_auth": false,
    "exec_service": true,
    "security_definer": true
  },
  {
    "ddl": "CREATE OR REPLACE FUNCTION public.set_updated_at()\n RETURNS trigger\n LANGUAGE plpgsql\n SET search_path TO 'public'\nAS $function$\nbegin\n  new.updated_at = now();\n  return new;\nend;\n$function$\n",
    "owner": "postgres",
    "schema": "public",
    "function": "set_updated_at",
    "exec_anon": true,
    "exec_auth": true,
    "exec_service": true,
    "security_definer": false
  }
]
```

## Privilegios observados de las demás funciones (sin reproducir cuerpos)

```json
[
  {
    "owner": "postgres",
    "schema": "public",
    "function": "billing_bind_checkout",
    "exec_anon": false,
    "exec_auth": false,
    "exec_service": true,
    "security_definer": true
  },
  {
    "owner": "postgres",
    "schema": "public",
    "function": "billing_claim_event",
    "exec_anon": false,
    "exec_auth": false,
    "exec_service": true,
    "security_definer": true
  },
  {
    "owner": "postgres",
    "schema": "public",
    "function": "billing_finish_event",
    "exec_anon": false,
    "exec_auth": false,
    "exec_service": true,
    "security_definer": true
  },
  {
    "owner": "postgres",
    "schema": "public",
    "function": "billing_prepare_checkout",
    "exec_anon": false,
    "exec_auth": false,
    "exec_service": true,
    "security_definer": true
  },
  {
    "owner": "postgres",
    "schema": "public",
    "function": "billing_release_event",
    "exec_anon": false,
    "exec_auth": false,
    "exec_service": true,
    "security_definer": true
  },
  {
    "owner": "postgres",
    "schema": "public",
    "function": "enforce_learner_privacy",
    "exec_anon": false,
    "exec_auth": false,
    "exec_service": false,
    "security_definer": true
  },
  {
    "owner": "postgres",
    "schema": "public",
    "function": "manage_learner_privacy",
    "exec_anon": false,
    "exec_auth": true,
    "exec_service": false,
    "security_definer": true
  },
  {
    "owner": "postgres",
    "schema": "public",
    "function": "minimize_learner_progress",
    "exec_anon": false,
    "exec_auth": false,
    "exec_service": false,
    "security_definer": false
  },
  {
    "owner": "postgres",
    "schema": "public",
    "function": "purge_expired_privacy_audit",
    "exec_anon": false,
    "exec_auth": false,
    "exec_service": true,
    "security_definer": true
  }
]
```

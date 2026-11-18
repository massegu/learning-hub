-- LOCAL compatibility correction, not a remote migration.
-- The verified original remains in gliax-local-functional.sql and its source document.
-- Qualify RETURNING to avoid collision with the RETURNS TABLE output parameter.
-- CREATE OR REPLACE preserves the explicit owner/ACL established before this overlay.
begin;
do $$begin
 if current_setting('gliax.local_baseline',true) is distinct from 'on' then
  raise exception 'Use the dedicated local baseline runner';
 end if;
end$$;
CREATE OR REPLACE FUNCTION public.request_learning_content_internal(p_user_id uuid, p_profile_id uuid, p_kind text, p_domain text DEFAULT NULL::text, p_level smallint DEFAULT 1, p_count integer DEFAULT 1)
 RETURNS TABLE(content_id uuid, content jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
declare
  v_status public.subscription_status;
  v_trial_ends timestamptz;
  v_age_band text;
  v_limit integer;
  v_used integer;
  v_max_request integer;
begin
  select a.subscription_status, a.trial_ends_at, p.age_band
  into v_status, v_trial_ends, v_age_band
  from public.accounts a
  join public.learner_profiles p on p.account_id = a.user_id
  where a.user_id = p_user_id
    and p.id = p_profile_id;

  if not found then
    raise exception 'Profile not found';
  end if;

  if v_status = 'trial' and now() >= v_trial_ends then
    raise exception 'Trial expired';
  end if;

  if p_kind not in ('exercise','worksheet','game') then
    raise exception 'Invalid content kind';
  end if;

  v_max_request := case
    when p_kind = 'exercise' then 10
    else 1
  end;

  if p_count < 1 or p_count > v_max_request then
    raise exception 'Invalid request size';
  end if;

  select case
    when p_kind = 'worksheet' then printable_worksheets_per_day
    when p_kind = 'game' then game_rounds_per_day
    else online_items_per_day
  end
  into v_limit
  from private.plan_limits
  where plan = v_status;

  select count(*)
  into v_used
  from private.content_delivery_log
  where user_id = p_user_id
    and kind = p_kind
    and delivered_at >= date_trunc('day', now());

  if v_used + p_count > v_limit then
    raise exception 'Daily content limit reached';
  end if;

  return query
  with chosen as (
    select c.id, c.payload
    from private.content_items c
    where c.is_active
      and c.kind = p_kind
      and c.age_band = v_age_band
      and c.level <= greatest(1, least(3, p_level))
      and (p_domain is null or c.domain = p_domain)
      and not exists (
        select 1
        from private.content_delivery_log d
        where d.profile_id = p_profile_id
          and d.content_id = c.id
      )
    order by random()
    limit p_count
  ),
  logged as (
    insert into private.content_delivery_log as delivery(user_id, profile_id, content_id, kind)
    select p_user_id, p_profile_id, chosen.id, p_kind
    from chosen
    returning delivery.content_id
  )
  select chosen.id, chosen.payload
  from chosen
  join logged on logged.content_id = chosen.id;
end;
$function$;
commit;

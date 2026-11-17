-- Enforce account-scoped uniqueness for every profile code/name after trimming
-- surrounding whitespace and normalizing case. Historical values are preserved.
begin;

do $$
begin
  if exists (
    select 1
    from public.learner_profiles
    group by account_id, upper(btrim(name))
    having count(*) > 1
  ) then
    raise exception 'Duplicate normalized profile names or codes exist; review them manually before applying this migration';
  end if;
end;
$$;

create or replace function public.validate_new_learner_profile_code() returns trigger
language plpgsql set search_path=public,pg_temp as $$
begin
  if tg_op = 'INSERT' or new.name is distinct from old.name then
    new.name := upper(btrim(new.name));
    if new.name is null or new.name !~ '^P-[A-F0-9]{8}$' then
      raise exception 'Profile code must use P- plus eight uppercase hexadecimal characters';
    end if;
  end if;
  return new;
end
$$;

-- Cover historical aliases and generated codes alike. PostgreSQL enforces this
-- atomically, including when simultaneous inserts race. NULL account/name values
-- retain standard unique-index semantics; account_id is non-null in production.
create unique index learner_profiles_account_code_normalized_key
  on public.learner_profiles (account_id, upper(btrim(name)))
;

commit;

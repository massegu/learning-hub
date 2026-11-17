-- Enforce account-scoped uniqueness for generated profile codes.
-- Historical non-code aliases are not changed; collisions abort before index creation.
begin;

do $$
begin
  if exists (
    select 1
    from public.learner_profiles
    where btrim(name) ~* '^P-[0-9A-F]{8}$'
    group by account_id, upper(btrim(name))
    having count(*) > 1
  ) then
    raise exception 'Duplicate normalized profile codes exist; review them manually before applying this migration';
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

-- The index is account-scoped, case-normalized, and enforced atomically by PostgreSQL.
-- It also catches races between simultaneous profile creation requests.
create unique index learner_profiles_account_code_normalized_key
  on public.learner_profiles (account_id, upper(btrim(name)))
  where btrim(name) ~* '^P-[0-9A-F]{8}$';

commit;

-- Nullable for historical rows; new frontend attempts provide this UUID.
alter table public.exercise_results
  add column if not exists client_attempt_id uuid;

-- A profile can only store one result per client attempt. NULL remains valid
-- for existing and legacy writers, and existing rows are never rewritten.
do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.exercise_results'::regclass
       and conname = 'exercise_results_profile_client_attempt_key'
  ) then
    alter table public.exercise_results
      add constraint exercise_results_profile_client_attempt_key
      unique (profile_id, client_attempt_id);
  end if;
end
$$;

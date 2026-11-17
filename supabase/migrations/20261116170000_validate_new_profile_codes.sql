-- Require non-identifying generated-style codes for newly created/renamed profiles.
-- Existing aliases remain untouched and can remain unchanged during other profile edits.
begin;
create function public.validate_new_learner_profile_code() returns trigger
language plpgsql set search_path=public,pg_temp as $$
begin
 if (TG_OP='INSERT' or new.name is distinct from old.name)
    and new.name !~ '^P-[A-Z0-9]{8}$' then
  raise exception 'Profile code must use P- plus eight letters or numbers';
 end if;
 return new;
end$$;
revoke all on function public.validate_new_learner_profile_code() from public,anon,authenticated;
create trigger learner_profile_code_format
before insert or update of name on public.learner_profiles
for each row execute function public.validate_new_learner_profile_code();
commit;

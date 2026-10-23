-- Read-only schema/grant inventory and aggregate checks. No personal records.
-- One JSON result so the SQL Editor output can be reviewed without missing tabs.
select jsonb_build_object(
 'columns',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from (
  select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns
  where table_schema='public' and table_name in ('accounts','learner_profiles','exercise_results','content_seen','content_usage') order by table_name,ordinal_position
 ) c),
 'policies',(select coalesce(jsonb_agg(to_jsonb(p)),'[]') from (
  select tablename,policyname,roles,cmd,qual,with_check from pg_policies
  where schemaname='public' and tablename in ('learner_profiles','exercise_results','content_seen','content_usage')
 ) p),
 'foreign_keys',(select coalesce(jsonb_agg(to_jsonb(f)),'[]') from (
  select conrelid::regclass::text as child,confrelid::regclass::text as parent,pg_get_constraintdef(oid) as definition from pg_constraint
  where contype='f' and (conrelid in ('public.learner_profiles'::regclass,'public.exercise_results'::regclass,'public.content_seen'::regclass) or confrelid='public.learner_profiles'::regclass)
 ) f),
 'cron_installed',exists(select 1 from pg_extension where extname='pg_cron'),
 'rls',(select coalesce(jsonb_agg(to_jsonb(r)),'[]') from (
  select tablename,rowsecurity from pg_tables where schemaname='public' and tablename in ('learner_profiles','exercise_results','content_seen')
 ) r),
 'checks',jsonb_build_object(
  'results_without_profile',(select count(*) from public.exercise_results r left join public.learner_profiles p on p.id=r.profile_id where r.profile_id is not null and p.id is null),
  'seen_without_profile',(select count(*) from public.content_seen s left join public.learner_profiles p on p.id=s.profile_id where s.profile_id is not null and p.id is null),
  'seen_owner_mismatch',(select count(*) from public.content_seen s join public.learner_profiles p on p.id=s.profile_id where s.user_id is distinct from p.account_id)
 ),
 'table_grants',(select coalesce(jsonb_agg(to_jsonb(g)),'[]') from (
  select table_name,grantee,privilege_type from information_schema.table_privileges
  where table_schema='public' and table_name in ('learner_profiles','exercise_results','content_seen') and grantee in ('anon','authenticated','service_role') order by table_name,grantee,privilege_type
 ) g),
 'column_grants',(select coalesce(jsonb_agg(to_jsonb(g)),'[]') from (
  select table_name,column_name,grantee,privilege_type from information_schema.column_privileges
  where table_schema='public' and table_name in ('learner_profiles','exercise_results','content_seen') and grantee in ('anon','authenticated') order by table_name,column_name,grantee
 ) g)
) as privacy_preflight;

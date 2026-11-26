-- Read-only catalog check before authorizing hosted longitudinal results.
-- Execute against the authorized Staging project as an operator with catalog access.
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('exercise_results','learner_profiles')
  and column_name in ('account_id','id','profile_id','client_attempt_id','occurred_at',
    'session_id','session_started_at','subject','level','correct','points','item_id','detail','progress')
order by table_name, ordinal_position;

select conrelid::regclass as relation, conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in (to_regclass('public.exercise_results'),to_regclass('public.learner_profiles'))
order by relation, conname;

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('exercise_results','learner_profiles')
order by tablename, policyname;

select relname, relrowsecurity, relforcerowsecurity,
  has_table_privilege('authenticated', oid,'SELECT') as authenticated_select,
  has_table_privilege('authenticated', oid,'INSERT') as authenticated_insert,
  has_table_privilege('anon', oid,'SELECT') as anonymous_select,
  has_table_privilege('anon', oid,'INSERT') as anonymous_insert
from pg_class
where oid in (to_regclass('public.exercise_results'),to_regclass('public.learner_profiles'))
order by relname;

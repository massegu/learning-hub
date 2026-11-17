-- LOCAL SAFE PRIVILEGES, paired with gliax-local-functional.sql only.
-- Applies observed functional access explicitly, excluding excess client DDL rights.
begin;
do $$begin
 if current_setting('gliax.local_baseline',true) is distinct from 'on' then
  raise exception 'Use the dedicated local baseline runner';
 end if;
end$$;
revoke create on schema public from public,anon,authenticated,service_role;
grant usage on schema public to anon,authenticated,service_role;
revoke all on type public.subscription_status from public,anon,authenticated,service_role;
grant usage on type public.subscription_status to authenticated,service_role;

grant select on table "public"."accounts" to "authenticated";

grant select,update,truncate,trigger on table "public"."accounts" to "service_role";

grant select,insert,update,delete,truncate,trigger on table "public"."billing_account_locks" to "service_role";

grant select,insert,update,delete,truncate,trigger on table "public"."billing_checkout_attempts" to "service_role";

grant select,insert,update,delete,truncate,trigger on table "public"."billing_webhook_events" to "service_role";

grant select on table "public"."content_seen" to "authenticated";

grant select,insert,update,delete on table "public"."content_seen" to "service_role";

grant select,insert,update,truncate,trigger on table "public"."content_usage" to "service_role";

grant select,insert on table "public"."exercise_results" to "authenticated";

grant select,insert,update,delete on table "public"."exercise_results" to "service_role";

grant select on table "public"."learner_privacy_audit" to "authenticated";

grant select,insert,delete,truncate,trigger on table "public"."learner_privacy_audit" to "service_role";

grant select,insert,update,delete on table "public"."learner_profiles" to "authenticated";

grant select,insert,update,delete on table "public"."learner_profiles" to "service_role";

grant update(content_locale) on public.accounts to authenticated;

grant usage on sequence public.exercise_results_id_seq to authenticated,service_role;

grant usage on sequence public.content_seen_id_seq, public.learner_privacy_audit_id_seq to service_role;

grant execute on function public.request_learning_content_internal(uuid,uuid,text,text,smallint,integer) to service_role;

grant execute on function public.set_updated_at() to anon;

grant execute on function public.set_updated_at() to authenticated;

grant execute on function public.set_updated_at() to service_role;

grant execute on function public.billing_bind_checkout(uuid,text,text) to service_role;

grant execute on function public.billing_claim_event(text,uuid,boolean,uuid) to service_role;

grant execute on function public.billing_finish_event(text,uuid,uuid,text,text,timestamptz) to service_role;

grant execute on function public.billing_prepare_checkout(uuid,boolean,text) to service_role;

grant execute on function public.billing_release_event(uuid,uuid) to service_role;

grant execute on function public.manage_learner_privacy(text,uuid,text,date) to authenticated;

grant execute on function public.purge_expired_privacy_audit() to service_role;

-- Defense in depth against accidental replay of excess direct grants.
revoke truncate,trigger on public.accounts from public,anon,authenticated;
do $$begin
 if has_table_privilege('anon','public.accounts','TRUNCATE')
 or has_table_privilege('anon','public.accounts','TRIGGER')
 or has_table_privilege('authenticated','public.accounts','TRUNCATE')
 or has_table_privilege('authenticated','public.accounts','TRIGGER') then
  raise exception 'Unexpected inherited client privileges';
 end if;
end$$;
commit;

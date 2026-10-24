-- Apply only after reviewing the schema inventory and backup/retention plan.
-- This removes free-text room descriptions from existing progress JSON.
begin;
alter table public.learner_profiles add column if not exists privacy_review_at date;
create table public.learner_privacy_audit (
 id bigint generated always as identity primary key,
 account_id uuid not null references public.accounts(user_id) on delete cascade,
 profile_id uuid, action text not null check(action in ('open','export','delete','settings')),
 occurred_at timestamptz not null default now()
);
create index on public.learner_privacy_audit(account_id,occurred_at);
alter table public.learner_privacy_audit enable row level security;
create policy audit_own on public.learner_privacy_audit for select to authenticated using(account_id=auth.uid());
revoke all on public.learner_privacy_audit from public,anon,authenticated;
grant select on public.learner_privacy_audit to authenticated;
grant select,insert,delete on public.learner_privacy_audit to service_role;

-- Foreign keys also reject late writes after a concurrent profile deletion.
do $$declare t text;begin
 foreach t in array array['exercise_results','content_seen'] loop
  if not exists(select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.contype='f' and c.conrelid=format('public.%I',t)::regclass and c.confrelid='public.learner_profiles'::regclass and a.attname='profile_id') then
   execute format('alter table public.%I add constraint %I foreign key(profile_id) references public.learner_profiles(id) on delete cascade',t,'privacy_'||t||'_profile_fk');
  end if;
 end loop;
end$$;

-- The existing private log schema was reviewed from read-only metadata.
do $$begin
 if to_regclass('private.content_delivery_log') is not null and not exists(
  select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey)
  where c.contype='f' and c.conrelid=to_regclass('private.content_delivery_log') and c.confrelid='public.learner_profiles'::regclass and a.attname='profile_id' and c.confdeltype='c'
 ) then raise exception 'Private delivery log must cascade on profile deletion';end if;
end$$;

-- Replace the policies for these learner-owned tables with one ownership model.
do $$declare p record;begin
 for p in select tablename,policyname from pg_policies where schemaname='public' and tablename in ('learner_profiles','exercise_results','content_seen') loop
 execute format('drop policy %I on public.%I',p.policyname,p.tablename);end loop;
end$$;
alter table public.learner_profiles enable row level security;
alter table public.exercise_results enable row level security;
alter table public.content_seen enable row level security;
create policy profiles_select_own on public.learner_profiles for select to authenticated using(account_id=auth.uid());
create policy profiles_insert_own on public.learner_profiles for insert to authenticated with check(account_id=auth.uid());
create policy profiles_update_own on public.learner_profiles for update to authenticated using(account_id=auth.uid()) with check(account_id=auth.uid());
create policy profiles_delete_own on public.learner_profiles for delete to authenticated using(account_id=auth.uid());
create policy results_select_own on public.exercise_results for select to authenticated using(exists(select 1 from public.learner_profiles p where p.id=profile_id and p.account_id=auth.uid()));
create policy results_insert_own on public.exercise_results for insert to authenticated with check(exists(select 1 from public.learner_profiles p where p.id=profile_id and p.account_id=auth.uid()));
create policy seen_select_own on public.content_seen for select to authenticated using(user_id=auth.uid() and exists(select 1 from public.learner_profiles p where p.id=profile_id and p.account_id=auth.uid()));
revoke all on public.learner_profiles,public.exercise_results,public.content_seen from public,anon,authenticated;
grant select,insert,update,delete on public.learner_profiles to authenticated;
grant select,insert on public.exercise_results to authenticated;
grant select on public.content_seen to authenticated;
-- Clear explicit column grants too; table REVOKE alone does not remove them.
do $$declare t text;cols text;begin
 foreach t in array array['learner_profiles','exercise_results','content_seen'] loop
  select string_agg(quote_ident(attname),',') into cols from pg_attribute where attrelid=format('public.%I',t)::regclass and attnum>0 and not attisdropped;
  execute format('revoke all (%s) on public.%I from public,anon,authenticated,service_role',cols,t);
 end loop;
end$$;
revoke all on public.learner_profiles,public.exercise_results,public.content_seen from service_role;
grant select,insert,update,delete on public.learner_profiles,public.exercise_results,public.content_seen to service_role;
-- Identity/serial IDs may use separately protected sequences.
do $$declare t text;seq text;begin
 foreach t in array array['exercise_results','content_seen','learner_privacy_audit'] loop
  select pg_get_serial_sequence('public.'||t,'id') into seq;
  if seq is not null then
   execute format('revoke all on sequence %s from public,anon,authenticated',seq);
   execute format('grant usage on sequence %s to service_role',seq);
   if t='exercise_results' then execute format('grant usage on sequence %s to authenticated',seq);end if;
  end if;
 end loop;
end$$;

create function public.minimize_learner_progress(p jsonb) returns jsonb language sql immutable set search_path=public as $$
 select case when jsonb_typeof(p->'interactiveObservations')='array' then jsonb_set(p,'{interactiveObservations}',coalesce((select jsonb_agg(e-'description'-'notes'-'freeText'-'responseText') from jsonb_array_elements(p->'interactiveObservations') e),'[]'::jsonb)) else p end
$$;
revoke all on function public.minimize_learner_progress(jsonb) from public,anon,authenticated;
create function public.enforce_learner_privacy() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if TG_OP='DELETE' then
  delete from public.exercise_results where profile_id=old.id;
  delete from public.content_seen where profile_id=old.id;
  if exists(select 1 from public.accounts where user_id=old.account_id) then
   insert into public.learner_privacy_audit(account_id,profile_id,action) values(old.account_id,old.id,'delete');
  end if;
  return old;
 end if;
 new.progress=public.minimize_learner_progress(coalesce(new.progress,'{}'::jsonb));
 if new.progress ? '_sessionOnly' then raise exception 'Temporary session state cannot be stored';end if;
 return new;
end$$;
revoke all on function public.enforce_learner_privacy() from public,anon,authenticated;
create trigger learner_privacy_write before insert or update on public.learner_profiles for each row execute function public.enforce_learner_privacy();
create trigger learner_privacy_delete before delete on public.learner_profiles for each row execute function public.enforce_learner_privacy();
update public.learner_profiles set progress=public.minimize_learner_progress(progress) where jsonb_typeof(progress->'interactiveObservations')='array';

create function public.manage_learner_privacy(p_action text,p_profile uuid,p_alias text default null,p_review_at date default null) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare learner public.learner_profiles;result jsonb;delivery_log jsonb='[]'::jsonb;inconsistent boolean;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501';end if;
 select * into learner from public.learner_profiles where id=p_profile and account_id=auth.uid() for update;
 if not found then raise exception 'Profile not found' using errcode='42501';end if;
 if p_action='export' then
  if exists(select 1 from pg_constraint where contype='f' and confrelid='public.learner_profiles'::regclass and conrelid not in ('public.exercise_results'::regclass,'public.content_seen'::regclass) and conrelid is distinct from to_regclass('private.content_delivery_log')) then raise exception 'Unreviewed learner storage requires review';end if;
  if to_regclass('private.content_delivery_log') is not null then
   if exists(select 1 from pg_attribute where attrelid=to_regclass('private.content_delivery_log') and attnum>0 and not attisdropped and attname not in ('id','user_id','profile_id','content_id','kind','delivered_at')) then raise exception 'Unreviewed private delivery columns require review';end if;
   execute 'select exists(select 1 from private.content_delivery_log where profile_id=$1 and user_id is distinct from $2)' into inconsistent using learner.id,auth.uid();
   if inconsistent then raise exception 'Inconsistent delivery ownership requires review';end if;
   execute 'select coalesce(jsonb_agg(jsonb_build_object(''id'',id,''user_id'',user_id,''profile_id'',profile_id,''content_id'',content_id,''kind'',kind,''delivered_at'',delivered_at) order by delivered_at,id),''[]''::jsonb) from private.content_delivery_log where profile_id=$1 and user_id=$2'
   into delivery_log using learner.id,auth.uid();
  end if;
  result=jsonb_build_object('version',1,'exported_at',now(),'profile',to_jsonb(learner),
   'delivery_log',delivery_log,
   'results',coalesce((select jsonb_agg(to_jsonb(r)) from public.exercise_results r where r.profile_id=learner.id),'[]'::jsonb),
   'content_history',coalesce((select jsonb_agg(to_jsonb(s)) from public.content_seen s where s.profile_id=learner.id),'[]'::jsonb),
   'privacy_events',coalesce((select jsonb_agg(to_jsonb(a)) from public.learner_privacy_audit a where a.profile_id=learner.id and a.account_id=auth.uid()),'[]'::jsonb));
 elsif p_action='delete' then
  delete from public.learner_profiles where id=learner.id;return jsonb_build_object('deleted',true);
 elsif p_action='settings' then
  if p_alias is null or length(trim(p_alias)) not between 2 and 24 then raise exception 'Invalid profile code';end if;
  update public.learner_profiles set name=trim(p_alias),privacy_review_at=p_review_at where id=learner.id returning * into learner;
  result=to_jsonb(learner);
 elsif p_action='open' then result=jsonb_build_object('review_at',learner.privacy_review_at);
 else raise exception 'Unsupported privacy action';end if;
 insert into public.learner_privacy_audit(account_id,profile_id,action) values(auth.uid(),learner.id,p_action);
 return result;
end$$;
revoke all on function public.manage_learner_privacy(text,uuid,text,date) from public,anon;
grant execute on function public.manage_learner_privacy(text,uuid,text,date) to authenticated;
-- Maintenance is restricted to the service role. No automatic learner deletion.
create function public.purge_expired_privacy_audit() returns void language sql security definer set search_path=public,pg_temp as $$delete from public.learner_privacy_audit where occurred_at<now()-interval '30 days'$$;
revoke all on function public.purge_expired_privacy_audit() from public,anon,authenticated;
grant execute on function public.purge_expired_privacy_audit() to service_role;
-- Do not silently assume a scheduler exists; deployment runbook configures it.
commit;

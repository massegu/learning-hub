-- Apply in the SQL editor before installing the new billing function.
-- Existing accounts, RLS policies, grants, subscription states and results are preserved.
begin;
create table public.billing_checkout_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.accounts(user_id) on delete cascade,
  livemode boolean not null,
  price_id text not null,
  customer_id text,
  checkout_session_id text unique,
  expires_at timestamptz not null default now() + interval '60 minutes',
  created_at timestamptz not null default now()
);
create index billing_checkout_owner on public.billing_checkout_attempts(user_id, livemode, created_at desc);
create table public.billing_webhook_events (
  event_id text primary key,
  user_id uuid not null references public.accounts(user_id) on delete cascade,
  livemode boolean not null,
  processed_at timestamptz
);
create table public.billing_account_locks (
  user_id uuid primary key references public.accounts(user_id) on delete cascade,
  owner uuid not null,
  expires_at timestamptz not null
);
alter table public.billing_checkout_attempts enable row level security;
alter table public.billing_webhook_events enable row level security;
alter table public.billing_account_locks enable row level security;
revoke all on public.billing_checkout_attempts, public.billing_webhook_events, public.billing_account_locks from public, anon, authenticated;
grant all on public.billing_checkout_attempts, public.billing_webhook_events, public.billing_account_locks to service_role;

create function public.billing_prepare_checkout(p_user_id uuid, p_livemode boolean, p_price_id text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare a public.accounts; attempt public.billing_checkout_attempts;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server only' using errcode='42501'; end if;
  select * into strict a from public.accounts where user_id=p_user_id for update;
  if a.subscription_status::text in ('active','past_due') then raise exception 'Use billing portal for an existing subscription'; end if;
  select * into attempt from public.billing_checkout_attempts
    where user_id=p_user_id and livemode=p_livemode and price_id=p_price_id
      and expires_at > now()
      and (checkout_session_id is not null or expires_at > now()+interval '31 minutes')
    order by created_at desc limit 1;
  if attempt.id is null then
    insert into public.billing_checkout_attempts(user_id,livemode,price_id)
      values(p_user_id,p_livemode,p_price_id) returning * into attempt;
  end if;
  return to_jsonb(attempt)||jsonb_build_object('account_customer_id',a.stripe_customer_id);
end $$;

create function public.billing_bind_checkout(p_attempt_id uuid, p_customer_id text, p_session_id text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare attempt public.billing_checkout_attempts; a public.accounts;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server only' using errcode='42501'; end if;
  select * into strict attempt from public.billing_checkout_attempts where id=p_attempt_id;
  select * into strict a from public.accounts where user_id=attempt.user_id for update;
  if (a.stripe_customer_id is not null and a.stripe_customer_id<>p_customer_id)
    or (attempt.checkout_session_id is not null and attempt.checkout_session_id<>p_session_id)
    or (attempt.customer_id is not null and attempt.customer_id<>p_customer_id)
    then raise exception 'Billing binding mismatch'; end if;
  update public.accounts set stripe_customer_id=p_customer_id,updated_at=now() where user_id=a.user_id;
  update public.billing_checkout_attempts set customer_id=p_customer_id,checkout_session_id=p_session_id where id=attempt.id;
end $$;

create function public.billing_claim_event(p_event_id text,p_user_id uuid,p_livemode boolean,p_owner uuid)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare lease public.billing_account_locks; event_row public.billing_webhook_events;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server only' using errcode='42501'; end if;
  perform 1 from public.accounts where user_id=p_user_id for update;
  if not found then raise exception 'Account not found'; end if;
  select * into event_row from public.billing_webhook_events where event_id=p_event_id;
  if event_row.event_id is not null and (event_row.user_id<>p_user_id or event_row.livemode<>p_livemode) then raise exception 'Event binding mismatch'; end if;
  if event_row.processed_at is not null then return 'duplicate'; end if;
  select * into lease from public.billing_account_locks where user_id=p_user_id;
  if lease.user_id is not null and lease.expires_at>now() and lease.owner<>p_owner then return 'busy'; end if;
  insert into public.billing_webhook_events(event_id,user_id,livemode) values(p_event_id,p_user_id,p_livemode) on conflict(event_id) do nothing;
  insert into public.billing_account_locks(user_id,owner,expires_at) values(p_user_id,p_owner,now()+interval '120 seconds')
    on conflict(user_id) do update set owner=excluded.owner,expires_at=excluded.expires_at;
  return 'claimed';
end $$;

create function public.billing_finish_event(p_event_id text,p_user_id uuid,p_owner uuid,p_subscription_id text,p_status text,p_period_end timestamptz)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare lease public.billing_account_locks;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server only' using errcode='42501'; end if;
  perform 1 from public.accounts where user_id=p_user_id for update;
  select * into strict lease from public.billing_account_locks where user_id=p_user_id;
  if lease.owner<>p_owner or lease.expires_at<=now() then raise exception 'Billing lease expired'; end if;
  if p_status is not null then
    if p_status not in ('active','past_due','cancelled') or p_subscription_id is null then raise exception 'Invalid billing snapshot'; end if;
    update public.accounts set subscription_status=p_status::public.subscription_status,
      stripe_subscription_id=p_subscription_id,current_period_end=p_period_end,updated_at=now() where user_id=p_user_id;
  end if;
  update public.billing_webhook_events set processed_at=now() where event_id=p_event_id and user_id=p_user_id and processed_at is null;
  if not found then raise exception 'Unclaimed event'; end if;
  delete from public.billing_account_locks where user_id=p_user_id and owner=p_owner;
end $$;

create function public.billing_release_event(p_user_id uuid,p_owner uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server only' using errcode='42501'; end if;
  delete from public.billing_account_locks where user_id=p_user_id and owner=p_owner;
end $$;
revoke all on function public.billing_prepare_checkout(uuid,boolean,text),public.billing_bind_checkout(uuid,text,text),public.billing_claim_event(text,uuid,boolean,uuid),public.billing_finish_event(text,uuid,uuid,text,text,timestamptz),public.billing_release_event(uuid,uuid) from public,anon,authenticated;
grant execute on function public.billing_prepare_checkout(uuid,boolean,text),public.billing_bind_checkout(uuid,text,text),public.billing_claim_event(text,uuid,boolean,uuid),public.billing_finish_event(text,uuid,uuid,text,text,timestamptz),public.billing_release_event(uuid,uuid) to service_role;
commit;

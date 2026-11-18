-- TEST FIXTURE ONLY. Not a production baseline or a migration.
-- Reconstructed from tests/billing-integrity.test.js, privacy-database.test.js
-- and js/api.js. Uses the real local Supabase Auth schema/functions/roles.
-- Run only in the disposable gliax-local-20261117 stack, before migrations.
create type public.subscription_status as enum ('trial','active','past_due','cancelled','complimentary');
create table public.accounts (
 user_id uuid primary key references auth.users(id),
 subscription_status public.subscription_status not null default 'trial',
 trial_started_at timestamptz not null default now(),
 trial_ends_at timestamptz not null default now()+interval '7 days',
 stripe_customer_id text unique, stripe_subscription_id text unique,
 current_period_end timestamptz, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), content_locale text not null default 'es_intl'
);
alter table public.accounts enable row level security;
create policy accounts_select_own on public.accounts for select to authenticated using(user_id=auth.uid());
revoke all on public.accounts from anon, authenticated;
grant select on public.accounts to authenticated;
grant all on public.accounts to service_role;
create table public.learner_profiles (
 id uuid primary key default gen_random_uuid(),
 account_id uuid not null references public.accounts(user_id), name text not null,
 age_band text not null, locale text not null default 'es_intl',
 progress jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.exercise_results (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null references public.learner_profiles(id),
 occurred_at timestamptz not null, session_id text, session_started_at timestamptz,
 subject text not null, level integer not null, correct boolean not null,
 points integer not null default 0, item_id text, detail text
);
create table public.content_seen (
 id uuid primary key default gen_random_uuid(), profile_id uuid not null,
 user_id uuid not null references public.accounts(user_id), item_signature text
);
create schema private;
create table private.content_delivery_log (
 id bigint generated always as identity primary key,
 user_id uuid not null, profile_id uuid not null references public.learner_profiles(id) on delete cascade,
 content_id uuid not null, kind text not null, delivered_at timestamptz not null default now()
);

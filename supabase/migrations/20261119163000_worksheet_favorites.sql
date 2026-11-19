begin;

create function public.valid_worksheet_favorite(config jsonb) returns boolean
language plpgsql immutable strict set search_path = '' as $$
declare
  family jsonb;
  ids text[] := '{}';
  family_id text;
  quantity numeric;
  total integer := 0;
begin
  if jsonb_typeof(config) <> 'object' then return false; end if;
  if not (config ?& array['age','level','locale','versions','solutions','families'])
     or (config - array['age','level','locale','versions','solutions','families']) <> '{}'::jsonb
     or config->>'age' not in ('early','junior','primary','middle','teen')
     or config->'level' not in ('1'::jsonb,'2'::jsonb,'3'::jsonb)
     or config->>'locale' not in ('es_intl','es_es','es_mx','es_co','es_ar','es_cl','es_pa','es_cr')
     or config->'versions' not in ('1'::jsonb,'2'::jsonb,'3'::jsonb,'4'::jsonb,'5'::jsonb)
     or jsonb_typeof(config->'age') <> 'string'
     or jsonb_typeof(config->'locale') <> 'string'
     or jsonb_typeof(config->'solutions') <> 'boolean'
     or jsonb_typeof(config->'families') <> 'array'
  then return false; end if;
  if jsonb_array_length(config->'families') not between 1 and 20 then return false; end if;
  for family in select value from jsonb_array_elements(config->'families') loop
    if jsonb_typeof(family) <> 'object' then return false; end if;
    if not (family ?& array['id','count']) or (family - array['id','count']) <> '{}'::jsonb
       or jsonb_typeof(family->'id') <> 'string' or jsonb_typeof(family->'count') <> 'number'
    then return false; end if;
    family_id := family->>'id';
    quantity := (family->>'count')::numeric;
    if family_id !~ '^[A-Za-z]{1,32}:[A-Za-z]{1,32}$' or family_id = any(ids)
       or quantity not between 1 and 20 or quantity <> trunc(quantity)
    then return false; end if;
    ids := array_append(ids,family_id);
    total := total + quantity::integer;
  end loop;
  return total <= 20;
end;
$$;

create table public.worksheet_favorites (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 80 and name !~ '[[:cntrl:]]'),
  configuration jsonb not null check (public.valid_worksheet_favorite(configuration)),
  created_at timestamptz not null default now()
);

create index worksheet_favorites_account_created on public.worksheet_favorites(account_id, created_at desc);
alter table public.worksheet_favorites enable row level security;
revoke all on public.worksheet_favorites from public, anon, authenticated;
grant select, delete on public.worksheet_favorites to authenticated;
grant insert (name, configuration), update (name, configuration) on public.worksheet_favorites to authenticated;

revoke all on function public.valid_worksheet_favorite(jsonb) from public, anon;
grant execute on function public.valid_worksheet_favorite(jsonb) to authenticated;

create policy worksheet_favorites_read on public.worksheet_favorites for select to authenticated using ((select auth.uid()) = account_id);
create policy worksheet_favorites_create on public.worksheet_favorites for insert to authenticated with check ((select auth.uid()) = account_id);
create policy worksheet_favorites_edit on public.worksheet_favorites for update to authenticated using ((select auth.uid()) = account_id) with check ((select auth.uid()) = account_id);
create policy worksheet_favorites_remove on public.worksheet_favorites for delete to authenticated using ((select auth.uid()) = account_id);

commit;

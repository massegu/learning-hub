-- PREPARED, NOT RUN AGAINST REMOTE SUPABASE.
-- Catalog metadata only: no application/Auth/Storage/cron/Vault records,
-- row counts, sequence values, role passwords or connection options.
-- Definitions can themselves contain sensitive literals: keep output private.
-- Run with psql -X -Atq -v ON_ERROR_STOP=1, not the older privacy-preflight.sql.
begin read only;
set local statement_timeout = '60s';
set local lock_timeout = '5s';
set local search_path = pg_catalog;

with namespaces as (
 select oid,nspname,nspowner,nspacl from pg_namespace
 where nspname !~ '^pg_' and nspname <> 'information_schema'
), relations as (
 select c.*,n.nspname from pg_class c join namespaces n on n.oid=c.relnamespace
 where c.relkind in ('r','p','v','m','S','f')
), routines as (
 select p.*,n.nspname from pg_proc p join namespaces n on n.oid=p.pronamespace
 where p.prokind in ('f','p','w') and not exists (
  select 1 from pg_depend d where d.classid='pg_proc'::regclass
   and d.objid=p.oid and d.deptype='e'
 )
)
select jsonb_build_object(
 'server',jsonb_build_object('version',current_setting('server_version'),
  'version_num',current_setting('server_version_num'),'database',current_database()),
 'schemas',(select coalesce(jsonb_agg(jsonb_build_object('name',nspname,
  'owner',pg_get_userbyid(nspowner),'acl',nspacl) order by nspname),'[]') from namespaces),
 'extensions',(select coalesce(jsonb_agg(jsonb_build_object('name',e.extname,
  'version',e.extversion,'schema',n.nspname,'owner',pg_get_userbyid(e.extowner)) order by e.extname),'[]')
  from pg_extension e join pg_namespace n on n.oid=e.extnamespace),
 'relations',(select coalesce(jsonb_agg(jsonb_build_object('schema',nspname,
  'name',relname,'kind',relkind,'owner',pg_get_userbyid(relowner),'acl',relacl,
  'rls',relrowsecurity,'force_rls',relforcerowsecurity,'persistence',relpersistence,
  'options',reloptions,'replica_identity',relreplident,
  'partition_key',case when relkind='p' then pg_get_partkeydef(oid) end,
  'partition_bound',case when relispartition then pg_get_expr(relpartbound,oid) end,
  'view_definition',case when relkind in ('v','m') then pg_get_viewdef(oid,true) end
 ) order by nspname,relname),'[]') from relations),
 'columns',(select coalesce(jsonb_agg(jsonb_build_object('schema',r.nspname,
  'table',r.relname,'position',a.attnum,'name',a.attname,
  'type',format_type(a.atttypid,a.atttypmod),'not_null',a.attnotnull,
  'identity',a.attidentity,'generated',a.attgenerated,'acl',a.attacl,
  'collation',case when a.attcollation<>0 then a.attcollation::regcollation::text end,
  'default',pg_get_expr(d.adbin,d.adrelid)
 ) order by r.nspname,r.relname,a.attnum),'[]') from relations r
  join pg_attribute a on a.attrelid=r.oid and a.attnum>0 and not a.attisdropped
  left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum),
 'types',(select coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,
  'name',t.typname,'kind',t.typtype,'owner',pg_get_userbyid(t.typowner),'acl',t.typacl,
  'base_type',case when t.typtype='d' then format_type(t.typbasetype,t.typtypmod) end,
  'not_null',t.typnotnull,'default',t.typdefault,
  'enum_labels',(select jsonb_agg(e.enumlabel order by e.enumsortorder) from pg_enum e where e.enumtypid=t.oid)
 ) order by n.nspname,t.typname),'[]') from pg_type t join namespaces n on n.oid=t.typnamespace
  where t.typtype in ('e','d','c','r','m') and not exists (
   select 1 from pg_depend d where d.classid='pg_type'::regclass and d.objid=t.oid and d.deptype='e')),
 'constraints',(select coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,
  'name',c.conname,'relation',case when c.conrelid<>0 then c.conrelid::regclass::text end,
  'type',case when c.contypid<>0 then c.contypid::regtype::text end,
  'referenced_relation',case when c.confrelid<>0 then c.confrelid::regclass::text end,
  'definition',pg_get_constraintdef(c.oid,true),'validated',c.convalidated,
  'deferrable',c.condeferrable,'deferred',c.condeferred
 ) order by n.nspname,c.conname,c.oid),'[]') from pg_constraint c join namespaces n on n.oid=c.connamespace),
 'indexes',(select coalesce(jsonb_agg(jsonb_build_object('relation',r.oid::regclass::text,
  'name',i.indexrelid::regclass::text,'definition',pg_get_indexdef(i.indexrelid),
  'unique',i.indisunique,'primary',i.indisprimary,'valid',i.indisvalid,'ready',i.indisready
 ) order by r.nspname,r.relname,i.indexrelid),'[]') from pg_index i join relations r on r.oid=i.indrelid),
 'sequences',(select coalesce(jsonb_agg(jsonb_build_object('name',s.seqrelid::regclass::text,
  'type',format_type(s.seqtypid,null),'start',s.seqstart,'increment',s.seqincrement,
  'min',s.seqmin,'max',s.seqmax,'cache',s.seqcache,'cycle',s.seqcycle,
  'owned_by',(select jsonb_agg(jsonb_build_object('relation',d.refobjid::regclass::text,
   'column',a.attname,'dependency',d.deptype)) from pg_depend d left join pg_attribute a
    on a.attrelid=d.refobjid and a.attnum=d.refobjsubid
   where d.classid='pg_class'::regclass and d.objid=s.seqrelid
    and d.refclassid='pg_class'::regclass and d.deptype in ('a','i'))
 ) order by s.seqrelid),'[]') from pg_sequence s join relations r on r.oid=s.seqrelid),
 'routines',(select coalesce(jsonb_agg(jsonb_build_object('schema',nspname,'name',proname,
  'arguments',pg_get_function_identity_arguments(oid),'definition',pg_get_functiondef(oid),
  'owner',pg_get_userbyid(proowner),'acl',proacl,'security_definer',prosecdef,
  'settings',proconfig,'volatility',provolatile,'leakproof',proleakproof
 ) order by nspname,proname,oid),'[]') from routines),
 'triggers',(select coalesce(jsonb_agg(jsonb_build_object('relation',r.oid::regclass::text,
  'name',t.tgname,'definition',pg_get_triggerdef(t.oid,true),'enabled',t.tgenabled,
  'function',t.tgfoid::regprocedure::text
 ) order by r.nspname,r.relname,t.tgname),'[]') from pg_trigger t join relations r on r.oid=t.tgrelid where not t.tgisinternal),
 'event_triggers',(select coalesce(jsonb_agg(jsonb_build_object('name',evtname,'event',evtevent,
  'owner',pg_get_userbyid(evtowner),'function',evtfoid::regprocedure::text,
  'enabled',evtenabled,'tags',evttags) order by evtname),'[]') from pg_event_trigger),
 'policies',(select coalesce(jsonb_agg(jsonb_build_object('relation',r.oid::regclass::text,
  'name',p.polname,'command',p.polcmd,'permissive',p.polpermissive,
  'roles',(select jsonb_agg(case when x=0 then 'PUBLIC' else pg_get_userbyid(x) end order by x) from unnest(p.polroles) x),
  'using',pg_get_expr(p.polqual,p.polrelid),'with_check',pg_get_expr(p.polwithcheck,p.polrelid)
 ) order by r.nspname,r.relname,p.polname),'[]') from pg_policy p join relations r on r.oid=p.polrelid),
 'default_acl',(select coalesce(jsonb_agg(jsonb_build_object('owner',pg_get_userbyid(d.defaclrole),
  'schema',n.nspname,'object_type',d.defaclobjtype,'acl',d.defaclacl)
  order by d.defaclrole,d.defaclnamespace,d.defaclobjtype),'[]') from pg_default_acl d
  left join pg_namespace n on n.oid=d.defaclnamespace),
 'roles_without_passwords',(select coalesce(jsonb_agg(jsonb_build_object('name',rolname,
  'superuser',rolsuper,'inherit',rolinherit,'create_role',rolcreaterole,'create_db',rolcreatedb,
  'login',rolcanlogin,'replication',rolreplication,'bypass_rls',rolbypassrls,
  'connection_limit',rolconnlimit,'valid_until',rolvaliduntil,
  'has_settings',rolconfig is not null) order by rolname),'[]') from pg_roles),
 'role_memberships',(select coalesce(jsonb_agg(jsonb_build_object('role',pg_get_userbyid(roleid),
  'member',pg_get_userbyid(member),'grantor',pg_get_userbyid(grantor),'admin',admin_option,
  'inherit',to_jsonb(m)->'inherit_option','set',to_jsonb(m)->'set_option')
  order by roleid,member,grantor),'[]') from pg_auth_members m),
 'publications',(select coalesce(jsonb_agg(jsonb_build_object('name',pubname,
  'owner',pg_get_userbyid(pubowner),'all_tables',puballtables,'insert',pubinsert,
  'update',pubupdate,'delete',pubdelete,'truncate',pubtruncate,'via_root',pubviaroot)
  order by pubname),'[]') from pg_publication),
 'publication_tables',(select coalesce(jsonb_agg(to_jsonb(p) order by p.pubname,p.schemaname,p.tablename),'[]') from pg_publication_tables p),
 'foreign_tables_without_options',(select coalesce(jsonb_agg(jsonb_build_object(
  'relation',f.ftrelid::regclass::text,'server',s.srvname,'wrapper',w.fdwname)
  order by f.ftrelid),'[]') from pg_foreign_table f join pg_foreign_server s on s.oid=f.ftserver
  join pg_foreign_data_wrapper w on w.oid=s.srvfdw),
 'scope_notes',jsonb_build_array('ACL NULL means PostgreSQL default ACL, not no privileges.',
  'No cron jobs, migration history rows, Vault secrets, auth users or storage records are read.',
  'Extension-managed routine bodies and foreign connection options are intentionally omitted.',
  'Function/default/trigger/policy/view definitions may contain sensitive literals; review before sharing.')
) as schema_only_inventory;
commit;

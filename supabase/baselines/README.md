# GLIAX: local functional baseline for new databases

This is a **local functional reconstruction**, not an exact managed-Supabase
metadata replica and not an upgrade for an existing installation. It uses the
verified definitions already in the repository. It contains no accounts,
content rows, plan configuration, credentials or remote connection settings.

The isolated integration runner applies these files, in this order:

1. `gliax-local-functional.sql`: consolidated application structure, including
   all six historical integration deltas exactly once, with access denied to
   API roles before commit.
2. `local-privileges.sql`: explicit local permissions for the official Supabase
   roles. It preserves the observed functional access and removes unnecessary
   client DDL permissions. It does not copy remote default privileges.
3. `local-content-compatibility.sql`: a separately identified SQL compatibility
   correction verified against the synthetic content test. The original
   function definition remains in the structural baseline and source document.

The first file requires an empty application schema and refuses a second
application. All three require the session setting used by the local runner.
That setting prevents accidental invocation; it is **not** a security mechanism
that can prove a connection is local. The runner separately verifies loopback,
the dedicated container/project and its internal Docker network before writes.

## Installation strategies

| Target | Strategy |
| --- | --- |
| New isolated local database | Apply the three baseline files through `tests/local-supabase-validation.py`; do **not** run the six historical migrations afterwards |
| Existing installation or current beta | Do **not** apply this baseline. Keep its existing migration history; review any future incremental change separately |
| Historical fixture regression | `--legacy-fixture` preserves the previous 51-check preparation and applies the six original migrations to that representative fixture; it is not evidence of baseline equivalence |
| Future staging | Requires a separately approved configuration and rollout plan after reviewing the local verification report; no staging or remote change is performed here |

## Definition provenance

The three `docs/implementation/gliax-observed-*-20261117.md` documents supply
12 tables/86 columns, one enum, 43 constraints, 28 indexes, six triggers, ten
policies and the three base function bodies. The nine other existing function
bodies come from the billing/privacy migrations. The final code-validation
function and trigger come from the November code migrations. The nullable
`correct` and account-scoped code index are included directly in the final
structure. PK/UNIQUE constraints create their supporting indexes; the index
list is not replayed on top of those constraints.

Identity sequences explicitly start at 1, increment by 1, cache 1, and do not
cycle. Names and unprovided bounds use PostgreSQL's local identity conventions.
Objects are owned by the applying local `postgres` role; platform roles,
membership, extensions and default privileges remain those of the official
local installation. The explicit table, sequence, schema, type and function
grants establish the tested application boundary independently of defaults.
Future objects still require their own reviewed ACL.

The structural comparison reads the source documents independently and checks
the live catalogs before the content-compatibility overlay. It does not load
`tests/fixtures/supabase-local-baseline.sql` in functional mode. Auth signup
creates professional accounts via the recovered trigger; tests do not manually
insert a substitute account row. Synthetic plan/content rows are test inputs,
not recovered production configuration.

## Reproduce locally

Use Docker 28.4.0, Supabase CLI 3.2.0, PostgreSQL 17, Node 24, Python/Playwright
and Chromium. The verified client installation uses
`@supabase/supabase-js@2.119.0` with its temporary lockfile. Run CLI command help
before execution. Install/cache tools under a writable `work/` directory, not
the repository dependency manifest or a personal home directory.

Prepare a separate temporary Supabase directory with `supabase init`, project
ID `gliax-local-20261117`, API/DB/shadow ports `55431/55432/55430`, Mailpit port
`55434`, email confirmations disabled and the optional Realtime, Storage,
Studio, Analytics and Edge Runtime services disabled. Do not copy the
repository's config, `.env`, migrations or credentials into it and do not link
it to a remote project. Keep CLI state and Docker client configuration in
temporary directories (`SUPABASE_HOME`, `DOCKER_CONFIG`), disable telemetry,
and remove inherited Supabase credentials/proxy settings. Empty Docker client
configuration avoids injecting the host's proxy into container healthchecks.

```bash
docker network create --internal gliax-local-20261117
# In a separate terminal; Docker internal networks do not publish these ports:
python3 tests/local-supabase-loopback.py
```

In the main terminal, after the relay is running:

```bash
supabase --workdir "$local_stack" start \
  --network-id gliax-local-20261117 \
  --exclude realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
umask 077
supabase --workdir "$local_stack" status -o json > "$private_status"
python3 tests/local-supabase-validation.py \
  --status-json "$private_status" --sdk "$client_dist/umd/supabase.js"
npm test
```

`local_stack`, `private_status` and `client_dist` are absolute paths to the
temporary stack, private local status file and pinned SDK `dist` directory.
Never commit the status file or raw CLI startup logs; they contain local keys.

To repeat against a fresh database, first consult `supabase db reset --help`
and use `db reset --no-seed --network-id gliax-local-20261117` on that same
explicit temporary workdir. Do not omit the network flag. The temporary stack
has no copied migrations, so the runner remains the sole baseline installer.
Run the historical fixture regression separately after another reset, using
the same command with `--legacy-fixture`; do not combine the two preparations.

Finally stop only this project with `stop --project-id gliax-local-20261117
--no-backup`, stop the loopback relay and remove its dedicated network. Verify
that its containers/volumes are gone and its loopback ports are closed.

The content-handler integration adapter runs the actual TypeScript handler and
its local modules under Node, with real SDK/Auth/PostgREST/database access and
only the Deno `serve/env` boundary adapted. It does **not** certify a deployed
Deno Edge Runtime. Browser checks use the actual frontend with local SDK/config
delivery; all other external requests are blocked.

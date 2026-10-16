# Recovered Edge Function package

Latest: [area fusion and curriculum expansion](../../../docs/curriculum-fusion-review.md).
The complete package now has thirteen local imports, including shared
`document-library.js`, `reading-library.js` and `curriculum.js`. Maintain byte parity with `js/` when editing
these sources. Use `python3 tests/browser-curriculum.py` for the current public areas.
Earlier browser suites below document the previous taxonomy.

`index.ts` was supplied by the owner; commit `fa71e09` records that baseline.
All five original `data/{primary,middle,teen,english,literacy}.js` modules have now
been recovered from the owner's uploads in commit `3a8498e`, without editorial
changes (Git normalizes line endings). Junior/primary/middle authored banks, a focused teen module and integration
corrections follow on the review branch. **The owner authorized deployment on
October 17, 2026: function v38 is active from source commit `4f738ec`; the frontend
is still pending publication.** See the updated [beta record](../../../docs/beta-review-next-steps.md).

The original imports build 1,080 items. They load before requests, but active
supported domains still use the function's generators; junior, primary and middle use the
reviewed 8–10/10–12/13–15 banks. Imported legacy content is not automatically worksheet
compatible or newly calibrated. See [the recovery review](../../../docs/edge-import-recovery.md).

From the repository root, with Node >=22.13 (verified with Node 24):

```sh
npm test
python3 tests/browser-junior.py
python3 tests/browser-junior.py primary
python3 tests/browser-junior.py middle
EDGE_AUDIT_SAMPLES=/tmp/legacy-samples.json node tests/legacy-bank-audit.js > /tmp/legacy-audit.json
python3 tests/browser-edge-audit.py /tmp/legacy-samples.json
```

Browser checks use Python Playwright and `/usr/bin/chromium`. The Node harness
executes every real local module in declared order, while mocking the SDK/server/
environment/database. Browser tests use the real handler with a fake owned account
and persistent fake history/usage. External requests are blocked.

Standard native checking is:

```sh
deno check --node-modules-dir=none --no-lock supabase/functions/request-learning-content/index.ts
```

This environment blocks `jsr.io`, so that standard check remains **blocked**. For
explicitly limited diagnostics, `tests/deno-package-smoke.py` substitutes only the
ambient JSR declaration with an empty local declaration; it retains the real cached
SDK and all local modules, checks types and tests native local startup/CORS/auth
rejection. With Deno on PATH and SDK cached:

```sh
deno cache --node-modules-dir=none --no-lock npm:@supabase/supabase-js@2
python3 tests/deno-package-smoke.py
```

Do not describe this ambient substitution as official-JSR validation, a production
integration test or permission to deploy. No runtime credentials/outbound access
are granted. The [junior](../../../docs/junior-content-review.md) and
[primary](../../../docs/primary-content-review.md) reviews retain their editorial
limits; [the earlier source audit](../../../docs/edge-function-school-age-review.md)
records the original findings. The [middle review](../../../docs/middle-content-review.md) documents adolescent
progression and the explicit self-assessment limit for written production.
A Cloudflare branch preview does not deploy Supabase.

For the actual user-facing isolated review (Python 3 + Node >=22.13):

```sh
python3 tools/review-preview.py
```

See [Windows instructions](../../../docs/prueba-local.md) and
[the latest manual-feedback findings](../../../docs/manual-feedback-review.md).
The review server binds only to loopback, uses fake accounts/database with the real
Edge handler, and never connects to production. It is not a deployable auth bypass.
The focused teen module covers only Language, reasoning and reading/writing;
other teen domains retain historical generators.

Regional selection now uses a deployable mirror of the canonical browser rules:
`js/locale-content.js` → `supabase/functions/request-learning-content/locale-content.js`.
Edit the canonical file and copy it to the function package before testing.
A regression test requires byte-for-byte equality. This replaces the old recursive
string maps; incompatible currency/word-form candidates are excluded before
selection/history/usage. Early 6–7 selection remains client-owned and unchanged.

```sh
node tests/locale-production-audit.js
python3 tests/browser-locale-content.py
```

See [the October 16 country audit](../../../docs/locale-content-followup.md) for
results and editorial limits. This package now has ten local imports.

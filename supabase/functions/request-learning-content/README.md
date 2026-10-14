# Recovered Edge Function package

`index.ts` was supplied by the owner; commit `fa71e09` records that baseline.
All five original `data/{primary,middle,teen,english,literacy}.js` modules have now
been recovered from the owner's uploads in commit `3a8498e`, without editorial
changes (Git normalizes line endings). Junior/primary/middle authored banks and integration
corrections follow on the review branch. **Nothing here has been deployed.**

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

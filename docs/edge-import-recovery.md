# Supplied bank recovery and package integration — 2026-10-14

Branch: `fix/early-primary-stimulus-integrity`. All five requested source files have
now been supplied. Commit `3a8498e` captures their contents without editorial changes
(Git normalizes CRLF to LF). No production request, data mutation, merge or manual
deployment was performed.

## Identification and loaded inventory

The uploads all had the same filename. They were identified by their assignments
and builders, not by assuming upload order:

| Recovered file | Identifying content | Generated items |
| --- | --- | ---: |
| `data/primary.js` | `D.primary`, geometry, three Language skills, division, reading | 360 |
| `data/middle.js` | `D.middle`, middleLanguage/middleMath/middleReading | 180 |
| `data/teen.js` | `D.teen`, teenLanguage/teenMath/social | 180 |
| `data/english.js` | attaches English to each existing band | 180 |
| `data/literacy.js` | attaches literacy to each existing band | 180 |
| **Total** | **18 banks of 60** | **1,080** |

After supplements, primary contains 480 items and middle/teen 300 each. Every bank
has unique IDs and material at all three levels. Distribution is not necessarily
balanced: primary grammar has 50/6/4 and spelling 34/22/4; geometry has 32/7/21.
All 1,080 pass the existing server validator after normalization. Raw duplicate-choice
counts (14 geometry, one middleMath, six teenMath) are not falsely reported as
served invalid items; normalization removes literal duplicates. Validation alone
cannot prove pedagogical or semantic correctness.

The original labels are “10-12”, “12-13” and “14-17”. These labels do not override
the application's saved age metadata, where middle means 13–15 and teen 16–18.
No labels or supplied questions were silently rewritten.

## Real path and unchanged architecture

The complete import order is junior, authored primary, original primary, middle,
teen, English, literacy. `window` aliases `globalThis` before the original modules
execute. English/literacy attach only to existing bands, so preserving this order
matters. The test harness now evaluates **every actual local import**, including
all five original files, rather than removing them and using an empty legacy object.
SDK/auth/database/environment access remains mocked in Node/browser tests.

`DATA` is read by `academicPool`. The current supported exercise/worksheet domains
all dispatch to active generators before any legacy academic fallback:

- early retains its validated source-independent age/stimulus client gate;
- junior uses the reviewed `junior.js` bank;
- primary uses the reviewed `primary-content.js` bank;
- middle/teen retain the existing active variants, awaiting their separate review.

A regression test makes legacy band lookups throw and verifies every supported
active domain/level still generates an exercise and source-tagged worksheet item.
Restoring imports therefore completes initialization without replacing the accepted
8–10/10–12 content with these original banks. Direct legacy academic lookups are
also tested for correct level/Language skill and no source mutation.

## Legacy editorial/printable findings

Representative original material includes primary geometric/grammar vocabulary,
open-answer Minecraft-themed reading, middle reading about organizing an online
tournament, teen messages to a teacher/social interpretations, and evidence-based
literacy texts about shared clips and statistical claims. This is a source-format
and inventory audit, not a complete new 13–15 curriculum review.

All 1,080 legacy items were projected in Chromium through the real locale/print gates
for each of the seven countries. **186 project successfully per country**; 894 are
rejected. The first rejection counts are:

| Gate result | Spain | Each other supported country |
| --- | ---: | ---: |
| Accepted | 186 | 186 |
| Undeclared/missing printable stimulus contract | 758 | 726 |
| Numeric `q` cannot be used as a question | 60 | 60 |
| Unsupported compatible response contract | 60 | 60 |
| Unsupported visual projection | 16 | 16 |
| Unreviewed foreign currency | 0 | 32 |

These counts do **not** mean 758 questions lack all necessary facts: many are
standalone prompts that never declared that contract. Original division stores the
numeric quotient in `q`, plus dividend/divisor/remainder; it needs its specific
adapter. Original self-assessed reading/writing also needs an explicit response
contract. Existing gates stay strict. Restoring the bank is not authorization to
force all items into DOCX, fabricate stimuli, or convert euro prices.

Before these original families are reused, they need proper source/response
adaptation, regional currency alternatives, level balancing and editorial review.
Their 60 IDs/visible variants per bank are not 60 independent contexts/mechanics.
The authored active primary/junior worksheets continue to pass separately.

## Native Deno findings and limited corrections

Deno 2.9.6 / TypeScript 6.0.3 was installed in a temporary npm cache. The actual npm
SDK resolved to `@supabase/supabase-js` 2.117.3. No repository dependency/lockfile was
changed, and signature/TLS verification was not disabled.

A standard `deno check --node-modules-dir=none --no-lock index.ts` cannot complete
here: this environment returns **403 for `jsr.io`**, blocking the provided ambient
`jsr:@supabase/functions-js/edge-runtime.d.ts` import. Existing npm cache mode also
required the documented `node-modules-dir=none` runtime override, rather than
changing the app's dependencies or node_modules.

For explicitly limited diagnostics, that one ambient import is mapped to an empty
local declaration. The real SDK and every real local module remain in use. The
supplied function then exposed 120 strict type errors, predominantly generic
helpers receiving legacy `any` arrays and inferring `unknown`. Minimal corrections:

- default generic types for `pick`/`shuffle`, retaining inference for typed arrays;
- explicit return type for the recursive signature normalizer;
- remove five topic assignments already overwritten by a following spread, retaining
  the topic that actually reached the client before this change.

There is no `ts-nocheck`, relaxed compiler configuration, changed answer/age policy
or SDK substitution. An offline comparison against the pre-correction source checked
**1,410 generated payloads across all supported domains/ages/levels**, excluding
random delivery IDs: payloads are unchanged.

With the **declared diagnostic ambient substitution**, strict checking passes and
native Deno boots the real SDK plus all seven local modules and 1,080 legacy items.
A local-only native smoke verifies OPTIONS 200, GET 405, unauthenticated POST 401
and CORS. Runtime network permission is restricted to loopback; no environment or
credential access is granted. This does not verify official JSR declarations,
authenticated production database calls, Supabase hosting or deployed-source parity.

## Verification and reproduction

- `npm test`: **81 pass, zero failed/skipped**. Three added package tests verify
  import/augmentation order, legacy lookup, IDs/levels and active-route independence.
- `python3 tests/browser-junior.py`: **326 scored activities and seven 20-question
  DOCX files**, with all original imports now loaded.
- `python3 tests/browser-junior.py primary`: **437 scored activities and seven
  20-question DOCX files**; no page errors, missing stimuli or adjacent sampled repeats.
- `node tests/legacy-bank-audit.js`: generated inventory/levels/normalization audit.
- `tests/browser-edge-audit.py`: all 1,080 legacy projections per country; rejections
  are retained findings, not a passing legacy worksheet bank.
- `tests/deno-package-smoke.py`: native startup/HTTP and strict **diagnostic** checking
  pass with the explicitly local ambient substitution and cached real SDK.

Commands from the repository root:

```sh
npm test
python3 tests/browser-junior.py
python3 tests/browser-junior.py primary
EDGE_AUDIT_SAMPLES=/tmp/legacy-samples.json node tests/legacy-bank-audit.js > /tmp/legacy-audit.json
python3 tests/browser-edge-audit.py /tmp/legacy-samples.json
```

For native diagnostics, have Deno on PATH and cache the SDK first:

```sh
deno cache --node-modules-dir=none --no-lock npm:@supabase/supabase-js@2
python3 tests/deno-package-smoke.py
```

In this run, Deno was exposed through `npm exec --package deno@2.9.6`, with
`DENO_DIR=/tmp/learning-hub-deno-dir`. The Python smoke creates/removes its diagnostic
import map and starts/stops its own loopback server. It does not install/deploy
anything remotely. Standard official-JSR checking remains blocked, not passed.

The five-file input gap is now closed. Before a backend release, official JSR
resolution/checking and Supabase integration still require verification in an
appropriate environment; 13–15 calibration remains a separate content phase.
Cloudflare preview updates alone do not deploy this function.

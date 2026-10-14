# Supplied Edge Function snapshot

`index.ts` was supplied by the repository owner during the school-age review.
Commit `fa71e09` records that supplied baseline; subsequent corrections have **not
been deployed**. This is not an independently verified copy of the running service.

The five imported `data/{primary,middle,teen,english,literacy}.js` modules were not
included in the supplied file and are absent from this checkout. The current
self-contained exercise/worksheet variant factories can be audited offline. Legacy
academic paths still need the actual imported modules. Do not treat this directory
as a complete, deployable package or substitute historical banks without checking
that they match the deployed function.

From the repository root, with Node >=22.13 (verified with Node 24):

```sh
npm test
EDGE_AUDIT_SAMPLES=/tmp/edge-samples.json node tests/edge-audit.js > /tmp/edge-audit.json
python3 tests/browser-edge-audit.py /tmp/edge-samples.json
```

The last command uses Python Playwright and `/usr/bin/chromium`, as do the existing
browser tests. The harness removes the SDK/type imports and five data imports,
uses an empty legacy bank, captures `Deno.serve`, and forbids real environment
access. Handler tests supply a fake SDK and fake environment values. These checks
exercise real generator/handler code, but do not establish Deno bundling, live
credentials, database policies, remote deployment parity or full editorial quality.
Browser sample rejections are reported as findings, not as a passing curriculum.

See [the detailed review](../../../docs/edge-function-school-age-review.md).

The junior follow-up adds a self-contained `junior.js` bank for the saved 8–10
route. It is loaded by the real handler and offline harness. Its browser bridge
(`python3 tests/browser-junior.py`) runs only against a local fake account/database.
See [the junior content review](../../../docs/junior-content-review.md). The original
five legacy imports remain unresolved; the whole package is still not deployable
from this checkout alone.

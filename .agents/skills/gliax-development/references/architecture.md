# GLIAX architecture and compatibility notes

Read these notes as navigation hints, not a substitute for inspecting current code.

- Static browser UI: `index.html`, `css/styles.css`, `css/gliax-theme.css`, `js/app.js` and the relevant `js/*` feature modules.
- Content generation and authenticated delivery: `supabase/functions/request-learning-content/`. Files mirrored from browser modules must be kept in sync when behavior changes. Validate module-loading order and exact API contracts.
- Relevant modules: `js/communication-content.js` (digital contexts), `js/falling-words.js` (typing), `js/activity-model.js`, `js/content-policy.js`, `js/cognitive-families.js`, `js/worksheet-builder.js`, `js/worksheet-catalog.js`, `js/progress-dashboard.js`, `js/progress-report.js`, `js/docx.js`.
- Tests: `tests/*.test.js` via `npm test`; targeted browser tests `tests/browser-*.py`; scripts under `scripts/`. Confirm prerequisites before invoking Playwright.
- `client_revision` coordinates frontend and Edge. Never deploy incompatible revisions independently as if the overall system were verified.
- Existing history, favorites, modalities, progress and profiles may rely on technical IDs. Display names can change without changing the data contract.
- The repository contains multiple products. Never copy GLIAX instructions to other apps indiscriminately.

## Before touching persistent data

Check Auth, ownership, RLS, migration ordering, query access, billing and quotas. Use staging-only synthetic fixtures and review migration impact. Keep `verify_jwt=true` for the existing content Edge Function. Do not place service-role keys in the browser.

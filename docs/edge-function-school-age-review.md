# Supplied Edge Function: school-age integration review — 2026-10-14

**Import recovery update:** the owner has now supplied all five legacy modules.
See [the package integration review](edge-import-recovery.md). Statements about
missing imports below describe the earlier review; no deployment has occurred.

**Later junior follow-up:** [8–10 authored content review](junior-content-review.md)
replaces the junior dispatch described below. The [10–12 follow-up](primary-content-review.md) also replaces the primary dispatch.
Baseline counts/findings remain a record of the supplied source; 13–15 is still pending.

Branch: `fix/early-primary-stimulus-integrity`. The owner supplied the complete
single TypeScript file for `request-learning-content`; baseline commit `fa71e09`
records it. This review replaces the earlier assumption that the implementation
could not be inspected. It does not independently verify the deployed revision.
No production function invocation, Supabase record change, merge or manual
deployment was performed.

## Actual flow

The client sends the owned profile ID, domain/subdomain, level, account locale and
request kind. The handler authenticates, verifies ownership and subscription/trial,
reads quota, then resolves saved `progress.ageRoute` for early/junior; other routes
use `age_band`. **The backend already resolves junior correctly.** The earlier
client metadata correction remains useful but is not evidence of a backend alias bug.

Interactive school-age requests use `variantExercise → normalizeItem → validateItem`
through `generatedItems`, with recent content/mechanic history. Language goes through
`matrixLanguage18`; this active path does **not use the requested subdomain**.
Legacy academic banks contain subdomain handling but are not the active Language
factory. The early client subsequently chooses its reviewed local skill pool; older
clients continue to display remote content after controlled locale adaptation.

Worksheets randomize their domain order and label each item with **`sourceDomain`**.
The client previously read `domain`/localization metadata and otherwise guessed from
position. That guess was wrong for shuffled batches. It now recognizes `sourceDomain`
and rejects contradictory domain declarations, preserving English protection and
using the right locale/age context. Worksheet projection/export and the existing
replacement mechanism retain their integrity gates.

The handler's regional string replacements precede the client's controlled locale
adapter; the latter also checks remote content. Euro activities are not silently
converted into local prices. Non-Spain currency content without an explicit foreign
context is rejected. Locale safety is working, but this exposes a real shortage of
regional backend activities rather than solving it by relabeling money.

The source imports five missing `./data/*.js` modules. These were not supplied and
are absent from the checkout. The offline audit covers the self-contained active
factories and mocked handler; it cannot validate the omitted legacy banks or prove
this snapshot can be bundled/deployed as supplied.

## Exhaustive factory audit

The audit enumerated actual production seed ranges (300, 360 or 400, depending on
domain), all three levels, and junior/primary/middle (8–10/10–12/13–15): **30,420
activities per source revision**. Baseline and corrected revisions were compared.
Visible signatures omit IDs, content keys, level/topic labels and choice order;
include questions, passages, recall material, tables, canonical stimuli and answers.
Exposure time is not included, so this finding concerns visible task content.

**Every baseline seed produced the same visible task at L1, L2 and L3.** Progression
thresholds cannot compensate for this. Most factories still need a substantial
pedagogical rewrite; the patch does not claim full 8–15 calibration.

Baseline figures per level, `visible variants / declared mechanic IDs`:

| Domain | 8–10 | 10–12 | 13–15 |
| --- | ---: | ---: | ---: |
| Language | 26 / 18 | 26 / 18 | 18 / 18 |
| Reading | 10 / 6 | 10 / 6 | 10 / 6 |
| Maths | 40 / 6 | 40 / 6 | 71 / 6 |
| Geometry | unavailable | 40 / 6 | unavailable |
| Attention | 68 / 18 | 102 / 18 | 102 / 18 |
| Memory | 145 / 18 | 164 / 18 | 164 / 18 |
| Executive functions | 24 / 20 | 24 / 20 | 24 / 20 |
| Applied cognition | 36 / 20 | 36 / 20 | 36 / 20 |
| Speed/reasoning | 87 / 18 | 87 / 18 | 87 / 18 |
| Reading + writing | unavailable | 66 / 18 | 66 / 18 |
| English | unavailable | 6 / 6 | 6 / 6 |

These are upper bounds on visible variation, not independent contexts or validated
mechanics. Several names/numbers are simple substitutions; differences in labels
can inflate mechanic counts. Geometry formerly dispatched to the same Maths factory.
Random UUIDs/seed IDs cannot demonstrate meaningful variety. Existing recent-history
weighting can suppress repeats temporarily, but cannot create new material beyond
these finite pools. This review does not claim exhaustive consecutive-session
anti-repetition for the remote bank.

## Editorial examples and remaining families

| Area | Actual generated example / finding | Remaining editorial work |
| --- | --- | --- |
| Language | “Alex terminó su tarea y después preparó llaves.” Also causal connectors, source reliability and inference at every level. | Bind determiners to authored nouns; restore actual older grammar/spelling/phrase routing; stage inference and abstract vocabulary. |
| Reading | “Alex debe llevar auriculares a polideportivo antes de las 17:30.” The 45-minute timetable repeats across levels/older routes. | Fix noun/destination phrases; add different passage lengths, evidence loads and age-specific contexts instead of ten shared variants. |
| Maths | 8–10: “20 + 10”; repeated packet multiplication. Older levels do not change operands/operations. | Author operation and number-range progression, concrete models at entry levels and multi-step problems at later levels. |
| Geometry | Previously the same arithmetic factory as Maths. | The new small geometry pool is a focused repair, not complete curriculum coverage; add shapes, visual spatial tasks and broader contexts. |
| Attention | Exact-code matching, timetable lookup, two simultaneous rules. Some distractors matched the model and some answers chose the odd number. | Corrected objective errors; still stage visual load, distractor similarity and rule count. Regional ticket/offer contexts need alternatives. |
| Memory | Three-object list and numbered object positions; exposure time changes by age, not level. Charger is mapped to a keycard icon. | Review icon meaning, associations, recall load and exposure; regionalize advertisements; retain source evidence rather than fabricating it. |
| Executive | “Antes de enviar una tarea: revisar, adjuntar y enviar.” Same planning demands at all levels. | Introduce explicit child-relevant constraints and genuine progression in steps, inhibition and competing goals. |
| Applied | “Mañana necesitas cuaderno para biblioteca”; 35 minutes minus 20 and 10 at all levels. | Rewrite determiners; grade time/money reasoning; replace Spain-only pricing and adult recado contexts where unsuitable. |
| Reasoning | Junior “2 · 4 · 6 · 8 · __” returned 12; alternating shapes returned the repeated shape; equality was mishandled. | Objective answers corrected; stage analogies, numerical patterns and abstraction rather than reuse one pool. |
| Reading + writing | Compare route variability, identify supporting evidence, summarize delivery steps. | Scaffold abstract reasoning and include actual writing/revision skills; selected-answer questions alone do not establish writing ability. |
| English | Six families including backpack vocabulary, daily-routine grammar and umbrella inference. | Needs age/level-specific progression and meaningful expansion; Spanish localization must keep English content protected. |

Missing determiners in the table are **unresolved source cases**, not claimed fixes.
A global article insertion would corrupt plural/gender agreement and instructional
word-form questions. Older content is not currently protected by the specialized
6–7 editorial gate. The accepted early local bank, age/stimulus architecture,
illustrations, school hubs and worksheet export are preserved.

## Concrete corrections

- Corrected the junior arithmetic series and alternating-symbol answers, equality
  answers, ambiguous shape classification, double-rule even-number answer and
  exact-match distractors that could equal the model.
- Geometry now dispatches to genuine primary geometry: L1 rectangle perimeter, L2
  rectangle area, L3 triangle area with a stated perpendicular height. Base/height
  are canonical printable/renderable evidence. There are 216 distinct visible
  variants at each level in the production seed range, one mechanic per level;
  **zero seeds have identical visible tasks across all levels**. Broader coverage
  remains necessary.
- Pure Maths prompts explicitly declare when their authored question contains the
  complete problem; required canonical geometry evidence remains mandatory.
- Removed worksheet memory “repair” that inserted the declared answer into the
  stimulus. Empty memory is rejected. This narrow server check is not a complete
  semantic verifier for every nonempty older recall task.
- Added saved-age domain validation; added canonical stimuli to repetition signatures.
- Exhausted worksheet selection now returns 422 before usage/progress writes instead
  of repeating an already-selected candidate or using an unvalidated raw fallback.
- Fixed source-domain propagation in client mixed worksheets.

These backend changes are reviewable source patches only. **A Cloudflare branch
preview does not deploy this Supabase function.** Until a separate backend release,
interactive older exercises still use the existing deployed backend. No deployment
was requested or performed here.

## Verification and limits

`npm test`: **65 pass, zero failed/skipped**, including five tests that evaluate the
real provided handler/generator offline. They verify objective answers, 900 geometry
calculations and printable projections, no fabricated memory, ownership/quota/domain
rejection, legitimate usage and distinct-sheet exhaustion without writes. SDK/database
and environment access are replaced with explicit offline mocks.

`node tests/edge-audit.js`: all 30,420 corrected generated items pass the existing
server validator **after production normalization**. Raw duplicates can be removed
by normalization; raw invalid counts must not be misreported as delivered failures.
The server validator's pass does not establish answer semantics or editorial quality.

`python3 tests/browser-edge-audit.py /tmp/edge-corrected-samples.json`: 1,263 normalized
representatives (one per mechanic/domain/route/level) through real Chromium locale,
printable projection and stimulus-rendering modules for each supported country:

| Country | Printable | Rejected |
| --- | ---: | ---: |
| Spain | 1,071 | 192 missing declared/supportable stimulus dependencies |
| Mexico, Colombia, Argentina, Chile, Panama, Costa Rica (each) | 981 | 174 stimulus cases + 108 unreviewed foreign-currency cases |

Counts reflect the first gate failure, not disjoint underlying defects. These are
projection findings, not 1,263 full interactive sessions or DOCX downloads. The
rejections show why the safe worksheet recovery path remains necessary. Some
self-contained vocabulary questions need explicit reviewed dependency declarations;
no blanket bypass was added to force them through.

The existing full-app country browser regression passed separately: **357 interactive
activities and 35 complete 20-question DOCX files**, seven countries and five age
routes, plus reload/pending-response/failed-save cases. It uses reviewed fixtures
and blocked external requests. It establishes client/export
regression safety, **not that this real remote bank passes that matrix**. Full live
production parity, all imported banks, child usability and full older curricular
calibration remain unverified/pending.

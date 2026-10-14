# Early-primary final integration review

Follow-up on 2026-10-13: [Spanish locale integration review](spanish-locale-review.md)
documents country adaptation and its validation. The age/stimulus gates described
below remain intact; the former regional-vocabulary follow-up is now addressed
by controlled rules and explicit remaining editorial cases in that report.

Reviewed on 2026-10-09, on `fix/early-primary-stimulus-integrity`.
Base and current remote main: `b2768be0264f2012e2718aa86e47bc3f3f0419a7`,
confirmed by a read-only Git operation. No merge, deployment or production
Supabase data change was performed.

## Production content path

The production entry point checked into the repository is `index.html`.
It loads the Supabase SDK, configuration, API, exporter and app. This branch
additionally loads the content policy, early bank and activity model before the
app. Config loads the V16 presentation/profile compatibility patches. Backup
files and unloaded V16.9–V16.11/V16.17 files are not active content paths.

The SDK session comes from `LearningAPI.getSession()`. The app then reads the
account and learner profiles. The existing DB representation is preserved:
6–7 uses `age_band: primary` and `progress.ageRoute: early`. V16.7 creates and
preserves the route. Age is taken from profile data, not the DOM label.

Exercises, navigation and guided sessions follow:

```text
setupExercise / newExercise → requestOne → requestForProfile
  → LearningAPI.requestContent
  → client.functions.invoke('request-learning-content')
  → POST {LH_CONFIG.supabaseUrl}/functions/v1/request-learning-content
  → response or error
```

The Supabase SDK supplies the project key and available user-session authentication.
Exercise payloads contain profile ID, kind, domain/subdomain, level and count.
Worksheet payloads contain profile ID, kind, domains, level and question count.
They do not transmit the full early-policy contract or require a policy revision
in the returned envelope. The function may read the stored route itself, but its
implementation is not available here.

The current remote-main source directly renders remote exercises and passes remote
worksheet items to its exporter. It has the age-label patch, but not the new policy.
**This branch's gates are not proven to be deployed on the public site.**
No deployed-site commit was supplied or verified.

On this branch, the successful response follows:

```text
EarlyContent.adaptResponse
  early: replace every returned item with an early-bank selection
  other ages: retain remote response
ActivityModel.forDelivery(item, profile, requestedDomain)
  age/domain/mechanics + stimulus/response integrity
persist delivery history
renderExercise → repeat forDelivery before changing the view
```

Searches of all active JavaScript identified exactly one API request call site,
inside `requestForProfile`, and one SDK function invocation, in `js/api.js`.
No separate fetch/render path bypasses this flow. Supabase returns content
**before** the branch's early selection and validation.

Early worksheets use **local activity content with remote authorization**:
the function is still called for authentication/subscription/quota checks, but its
texts are replaced after success. Usage and source IDs are preserved. Other-age
worksheets retain remote content. The exporter also accepts explicitly supplied
compatible activities from other sources through the same contract.

Each worksheet response is validated before requesting another version. The
exporter validates the whole batch before any download. It does not fabricate
stimuli or retry a rejected activity with another quota-consuming request.

### What is unknown about the deployed Edge Function

No function source/deployment revision or authenticated production session is
available. The README's V32 assertion does not verify the live implementation.
No production content invocation was made: it can update usage and delivery
history, contrary to the requested read-only review.

Incompatible returns are **possible under the observed client/server contract**.
This is not a claim that the live function was observed producing them, nor that
it implements early safeguards. Tests deliberately return flight codes, schedules,
abstract questions, and adult topic/explanation fields at this service boundary.
They cannot reach the early screen/export on this branch. External consumers
and the unchanged main bundle do not acquire this client protection.

## Safety gaps closed

- Added source-independent `ActivityModel.forDelivery` at delivery and immediately
  before rendering. It applies the same age and structural contract used by printing.
  Requested domain and allowed domain mechanics must match; a server age label alone
  is insufficient.
- Age checks now include topics, themes, explanations, answer tokens and memory
  details. Parallel legacy presentation fields are rejected on canonical early items.
- Early memory displays the **same canonical stimulus** as printing instead of a
  second factual representation. Recall requires an `answerEvidence` pointer to
  the actual list entry/table cell, matching both the answer and the named subject.
- Duplicate expected order tokens and non-finite reveal timers are rejected.
  Memory load is measured from the displayed canonical rows/items, not just metadata;
  extra undeclared memory facts are rejected.
  Transport-success/application-error envelopes cannot trigger a local fallback.
- Loading clears old topics, explanations, feedback and written-answer panels.
  A denied early request cannot leave adult material from an older profile visible.
- V16.3/V16.4 still recognize the canonical exporter; V16.17's answer-insertion repair
  remains unloaded. Profile DB aliases and document names are preserved.
  Production authentication/billing APIs are unchanged.

These are explicit structural/linguistic checks, not a general Spanish grammar
checker or clinical proof that arbitrary future content is appropriate.

## Generated-content editorial audit

`node tests/editorial-audit.js` enumerates every generated item at all levels,
validates delivery/printing, and reports name-independent variants and examples
by family. The audit reviews generated stimuli, questions, distractors and
answers/sequences across all 39 scaffolds, rather than inspecting templates alone.

| Domain | Representative generated stimulus → question → response | Editorial finding |
| --- | --- | --- |
| Reading | “Lola guarda el libro en la mesa.” → “¿Dónde está el libro?” → “la mesa”; puddles and boots → why wear boots → avoid wet feet | Short literal and simple inference tasks are answerable. The two inference families each contain only one underlying scenario; name changes add no inference variety. |
| Attention | Model ○ with ○ / □ / △; ○, ○, □ → different figure; two-number model with three rows | Familiar glyphs and small sequences replace codes/timetables. Fixed-A row answers were corrected to rotate A/B/C with a unique exact match. |
| Memory | School bag: el libro, el lápiz; el libro / la mesa → where was the book; Mar / azul, Sol / verde → Mar's balloon colour | Generic unrelated backpack items were replaced by coherent school, excursion and toy-bag sets. Canonical reveal/print facts and explicit recall evidence prevent missing associations. |
| Executive functions | Swimming items → checking all three; already-open tap → wash, close tap, dry; toy box versus school-material shelf | Rewrote vague “other things” sorting, restricted its objects to the named categories, and corrected the running-tap sequence. Expanded planning, waiting and routine situations; distractors now belong to the situation. |
| Speed/reasoning | Bird flies, fish… → swims; red/blue alternation; 1,2,3 → 4; visible book above notebook | Removed unfamiliar madriguera/peonza examples and implausible object stacks. Spatial relationships use a visible arrangement. “Salta” was removed as an ambiguous fish distractor. Step-two counting is excluded at level 1 and bounded at levels 2–3. |
| Applied cognition | Excursion/thirst → water bottle; blunt pencil → sharpen; red-ball rule → red ball | Everyday child contexts are retained. Added missing-notebook and empty-glue problems; no discounts or administrative importance-ranking tasks are selected. Thirst and snack-hygiene remain single-scenario families. |

The corrected clay sequence explicitly asks to make **and** store a figure;
it no longer implies that a figure already exists before asking the child to make it.
Executive planning now has six concrete scenarios, inhibition three, sequencing
six, and sorting seven objects in two explicit categories.

Every generated family was checked against vocabulary, reading/element limits,
allowed contexts, grammar patterns, determiners and response integrity. No obvious
adult context, banned abstract instruction, missing reference or detected
determiner/contraction error remains in the generated pool.

### Families requiring further editorial/usability work

- **Reading inference:** puddle/boots and bedtime remain single scenarios with
  comparatively obvious distractors. Expand coherent stories and review distractors.
- **Memory:** the 6.5–7.5 second timers and up to four elements need child usability
  testing, especially for emerging readers. Printed recall adds “Mira bien. Tapa las
  cosas y responde.” Without covering the stimulus it assesses lookup, not recall.
- **Executive routines:** card/dice games may require adult demonstration. The sorting
  rule depends on recognizing toys versus school materials. Keep adult support rather
  than assuming every child already knows these routines/categories.
- **Speed/reasoning:** retain step-two continuation only at levels 2–3 pending review.
  The concrete analogies are teaching examples, not a standardized reasoning/speed test.
- **Applied cognition:** excursion/thirst and snack-hygiene need real scenario expansion,
  not additional names. School problems now have three scenarios.
- Review regional vocabulary such as coge, grifo, bañador and chanclas against the
  configured Spanish locale. Text-only stimuli still need stronger illustration/audio
  support for children who cannot read independently.

Unsuitable families were rewritten or excluded from the relevant level. These
remaining follow-ups concern breadth/accessibility and pedagogical evidence;
automated checks do not substitute for review with children/specialists.

## Variety sanity check

The previous **455** at `bae9207` is reproducible as exact rendered combinations.
Removing person-name changes yields **274**, not 455 independently different
problems. Those still include shape, colour, object and number permutations within
**39 authored task/stimulus scaffolds**. The 455 figure overstated pedagogical variety.

Current counts after corrections:

| Domain | Distinct mechanics | Broad stimulus/context families | Rendered L1 / L2 / L3 | Name-independent L1 / L2 / L3 |
| --- | ---: | ---: | --- | --- |
| Language | 3 | 4 | 60 / 60 / 60 | 29 / 29 / 29 |
| Mathematics (division) | 4 | 4 | 61 / 61 / 61 | 33 / 33 / 33 |
| Reading | 3 | 6 | 96 / 96 / 96 | 30 / 30 / 30 |
| Attention | 4 | 5 | 56 / 56 / 56 | 56 / 56 / 56 |
| Memory | 4 | 4 | 44 / 44 / 44 | 40 / 40 / 40 |
| Executive functions | 4 | 4 | 53 / 53 / 53 | 22 / 22 / 22 |
| Speed/reasoning | 4 | 7 | 37 / 40 / 40 | 37 / 40 / 40 |
| Applied cognition | 4 | 5 | 68 / 68 / 68 | 21 / 21 / 21 |
| **Total** | | **39** | **475 / 478 / 478** | **268 / 271 / 271** |

Family means a substantially different authored task/stimulus scaffold, not a context
metadata label, name or colour. Thus six planning scenarios belong to one broad
planning family. Name-independent counts remove names **only** and remain upper
bounds on meaningful variation. Many activities are intentionally shared across
levels; adding levels does not create more stories.

Selection now stores name-normalized semantic keys, recent families and mechanics
in `progress._earlyDelivery`, upgrades known older ID histories, and rotates
available families. A semantic item cannot repeat until that domain's pool is
exhausted; then a new finite cycle starts. No worksheet repeats a semantic item
within its own batch. Consecutive/restored sessions share history. Atomic
coordination across simultaneous devices has not been established.

## Realistic browser and automated validation

From the repository root:

```sh
npm ci
npm test
node tests/editorial-audit.js > /tmp/early-primary-generated-audit.json
python3 -u tests/browser-smoke.py
```

Node ≥18 is required; the browser test requires Playwright for Python and Chromium
at `/usr/bin/chromium`. DOCX/JSZip are pinned test dependencies. The static app
still requires no build. The generated audit checks **1,431 level-specific entries**,
including intentional cross-level repeats.

The browser loads the actual entry point, patches, API, app, selection, gates and
exporter, simulating only the Supabase SDK service boundary. The activities under
test are generated through ordinary app requests, not direct calls to
`EarlyContent.select`.

- **80 early activities:** ten consecutive activities per available domain (all eight),
  using next buttons, correct choices/order handling and actual memory hiding timers.
  Reload after activity five in each domain tests progress/history restoration.
  No semantic duplicate or consecutive same-family item appeared in any ten-item run.
- Displayed material/instructions are checked for adult/abstract terms, missing
  location determiners and uncontracted de el/a el. Memory stimuli disappear on
  the real timer. Static enumeration covers all families and levels even when a
  random ten-item browser sequence does not sample every family.
- **Three early worksheets:** two 20-activity DOCX files in a downloaded ZIP, plus
  a standalone 20-activity DOCX. Their Word XML is compared against captured
  activities: every stimulus precedes its question; every option/step survives;
  the adult remote material is absent. No orphaned question was found.
- Invalid alternate-source stimuli are rejected after selection. A test deliberately
  skips the first gate and confirms that the final renderer still rejects an invalid
  answer. The real patched browser exporter rejects invalid recall evidence.
- Quota failures and transport-success/business-error envelopes produce no local
  fallback. Switching older-to-early with a denied request leaves no stale adult topic,
  explanation, feedback or written-answer panel.
- **Other age bands:** representative remote Attention and a real ten-question DOCX
  for each of junior, primary, middle and teen retain remote source content. New
  early-profile creation preserves the existing DB alias and explicit age route.

`npm test`: **22 passed, zero failed/skipped**. Includes real DOCX/ZIP extraction,
source-independent gates, bound recall evidence, semantic/family history across
restored sessions, worksheet uniqueness across pool exhaustion, and all generated
domain/level contracts. Browser captures are
written to `/tmp/early-primary-browser-audit.json`. Browser and syntax/diff results
validate this branch, not a live Supabase deployment.

## Remaining integration limitations

- Actual Edge Function source/deployment still needs a read-only audit in its source
  repository. Live auth, billing, database constraints and quota/delivery persistence
  were not exercised against a real account.
- Gates protect the reviewed branch once deployed, not the unchanged main bundle
  or external consumers of the Edge Function.
- Local early selections replace server content after authorization. This does not
  correct the remote bank; the server still generates/charges content the browser
  replaces. Retained source IDs do not imply semantic equivalence to local activities.
- Unknown images/SVG/components, missing dependency declarations and unsupported
  mechanics remain rejected by printing for any age. Four representative other-age
  fixtures passed; compatibility of the entire remote bank remains unverified.
- Variety is bounded as reported. The editorial/accessibility follow-ups require
  genuine content/usability work rather than increasing variant IDs.

Changed components: `js/content-policy.js`, `js/activity-model.js`,
`js/early-content.js`, `js/app.js`, `js/docx.js`,
`tests/content.test.js`, `tests/browser-smoke.py`, new
`tests/editorial-audit.js`, and this report.

## Follow-up: layout, correctness, variety and level calibration (2026-10-13)

The subsequent refinement on the same branch is documented in
[early-primary-refinement.md](early-primary-refinement.md). It fixes compressed
sequence workspaces and point-list markers, binds quantity/comparison answers to
their stimuli, rejects case/article-only duplicate options, adds small local
illustrations with Word equivalents, and expands meaningful early task families.
The original age, stimulus, locale and worksheet architecture remains in place.

Current counts are **56 broad families**, with **436 / 455 / 465 rendered variants**
at levels 1/2/3, and **266 / 294 / 313 semantic variants** (still upper bounds on
pedagogical variety). Maths noun-only/distractor-only substitutions no longer count
as semantic novelty. The linked report supersedes the earlier counts and editorial
follow-ups where explicitly addressed, and retains unresolved cases.

Validation: **42 Node tests**, **648 browser layout cases** at normal zoom, ordinary
consecutive-session selection, real illustrated DOCX export, and the seven-country
browser regression matrix. Validation uses a simulated Supabase boundary, not the
production bank. Changes are committed locally; no merge or deployment.

## Follow-up: worksheet replacement and exploration hub (2026-10-14)

[early-primary-journey.md](early-primary-journey.md) records the next focused pass:
individual localized/printable candidate selection and replacement before worksheet
commitment, bounded authorized remote recovery, a dedicated eight-area early hub,
four short persisted missions, stronger stimulus/answer separation and 32 local
illustrations with Word equivalents. Existing age, locale, difficulty, semantic
history and final export safeguards remain in place.

Validation now includes **53 Node tests**, hub/mission/replacement browser checks,
**648 layout cases**, ordinary consecutive selection and seven-country interactive/
DOCX regression. The report documents remote-search bounds and remaining editorial
limitations. This follow-up is committed and pushed to the same preview branch,
without merge, manual deployment or production Supabase changes.

## Follow-up: Language skills, missing icons and older-age progression (2026-10-14)

[language-and-school-age-review.md](language-and-school-age-review.md) documents
the screenshot-driven pass. The accepted early hub, other seven areas and worksheet
generator are preserved. Early Language now exposes grammar, spelling and phrase
construction; missing noun illustrations are completed and choices use uniform
pictorial coverage. There are 41 local icons with printable equivalents.

Separate original school hubs are added for 8–10 and 10–12; 13–15 retains mature
presentation. Automatic progression now requires fresh 8/10/12-answer windows for
those older routes. Their remote bank remains authoritative; full editorial content
calibration requires the missing Edge Function source and is explicitly pending.
59 Node tests, dedicated mode/stage browser checks and existing layout/country/DOCX
regressions pass. The linked report separates tested client changes from unverified
production content and provides the next review criteria.

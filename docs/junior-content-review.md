# 8–10 content follow-up — 2026-10-14

**Import recovery update:** the owner has now supplied all five legacy modules.
See [the package integration review](edge-import-recovery.md). Statements about
missing imports below describe the earlier review; no deployment has occurred.

Branch: `fix/early-primary-stimulus-integrity`. This is the first authored 8–10
content pass, following the supplied-source audit. It does not complete 10–12 or
13–15 calibration, and it has **not been deployed to Supabase**. The subsequent
[10–12 review](primary-content-review.md) now supplies a separate primary bank;
the junior content and architecture documented here are preserved.

## Scope and actual integration

`request-learning-content/index.ts` imports `junior.js`. Only the saved **junior**
age route dispatches to this new bank. Primary/middle/teen and the reviewed early
bank keep their existing dispatch. No frontend/interface files are changed.

```
owned profile → saved progress.ageRoute === junior
→ requested domain + level + Language subdomain
→ JuniorContent.generate → normalizeItem → validateItem
→ existing history selection + server locale adapter
→ client LocaleContent + ActivityModel → interactive renderer / DOCX
```

Interactive Language requests now honor `grammar`, `spelling` and `writing` in the
actual junior server factory. Unsupported skill values return 400 before content
writes. Worksheets use the same bank, mixing the three Language skills, and retain
explicit `domain`/`sourceDomain`. Unique delivery IDs are separate from stable
content keys; they do not count as variety. Fractional levels are rejected rather
than entering an undefined junior pool.

A concrete worksheet defect surfaced with this finite pool: when all candidates
were in recent history, the retained fallback could be an item already used in the
same sheet, causing a false 422 despite available distinct activities. Fallbacks
now also exclude within-sheet duplicates. Exhausting recent history can permit a
reviewed repeat from a prior sheet; exhausting distinct material **within** a sheet
still returns 422. This preserves the existing integrity/recovery architecture.

## Progression and representative generated examples

These are editorial engineering targets, not standardized developmental norms.
Entry levels intentionally scaffold skills; not every 8-year-old should begin at L3.

| Domain | L1 | L2 | L3 |
| --- | --- | --- | --- |
| Language: grammar | “El libro está en la caja”: identify singular article/agreement; additive connector | Plural agreement; causal connector | Past tense, bound pronoun (“los libros; hoy los buscamos”), contrast connector |
| Language: spelling | Copy a missing initial letter; short syllable groups; initial capital/full stop | Interior letter; reviewed syllables; capitalization in a sentence | Final letter in longer familiar words, e.g. biblioteca/observación; question marks; reviewed syllable groups |
| Language: guided writing | Two-step plan, two phrase fragments, fitting title | Three-step plan, three fragments, summary | Four-step plan, four fragments and checking the order/detail that makes the plan clear |
| Reading | Two-sentence concrete scenes; literal details and simple topic | Added relevant evidence; factual detail/grounded interpretation | Additional competing conditions; distinguish two green shelf labels using the tower/footprint, or infer why to rehearse different song rhythms separately |
| Maths | Small addition/subtraction; equal groups and exact sharing | Larger operands and carrying/borrowing; larger exact groups | Two-operation quantity problems and additional groups; larger exact sharing |
| Attention | Short code, six-item scan, one table criterion, forward position | Longer code, nine-item scan, two criteria, relative position | Longer multi-part code, twelve-item scan, three criteria, two positions back from the end |
| Memory | Three meaningful units; 7.5-second exposure | Four units; 9-second exposure | Five units; 10.5-second exposure |
| Executive functions | Two-step plan; one prerequisite/current rule | Three steps; two prerequisites/conditions | Four steps; three prerequisites, changed rule and deadline preparation |
| Speed/reasoning | +2 patterns, simple relationships and direct location evidence | Larger additive steps, more relevant distractors and one exclusion | Doubling patterns, closer distractors, three-way classification and two exclusions |
| Applied cognition | Read duration, one game-point subtraction, one schedule field | Add preparation duration, larger subtraction, link destination to preparation | Sum activity/preparation/cleanup, two game-point deductions, update one schedule field and respect a multi-condition group agreement |

Actual library-context Maths outcomes are 16 + 5 = 21 at L1, 44 + 19 = 63 at L2,
and 120 + 33 − 12 = 141 at L3. Applied durations are 12, 22 + 7 = 29, and
27 + 7 + 5 = 39 minutes. The song story grows from naming the singer/drummer to
using the two tempos to choose a rehearsal plan. These are actual generated tasks,
not just design descriptions or level labels.

Every question retains its authored stimulus. Choice count is normally three at
L1/L2 and up to four at L3; some simple connector exercises have only two plausible
choices. Source articles, pronouns and destination contractions are authored from
explicit noun/context forms rather than global insertion. No euro-price conversion,
adult travel/billing context, game-brand assets or frontend art change is introduced.
Game points are explicitly fictional points, not local currency.

## Variety and limits

There are six authored contexts: garden, art mural, class library, playground
circuit, group song and nature observation. Reading has six different event/evidence
stories rather than a single story with changed names. Some other domains share
mechanics and vary context/materials/numbers; those are **bounded variations**, not
independent curricula or six fundamentally different problem-solving strategies.

| Domain | Mechanic families | Visible activities per level |
| --- | ---: | ---: |
| Language | 9: three per skill | 54 (18 per skill) |
| Reading | 4 | 24 |
| Maths | 4 | 24 |
| Attention | 4 | 24 |
| Memory | 4 | 24 |
| Executive functions | 4 | 24 |
| Speed/reasoning | 4 | 24 |
| Applied cognition | 4 | 24 |
| **Total** | **37** | **222** |

All three levels total 666 authored activities. Audit signatures ignore delivery
IDs, level labels and shuffled option order. All 666 are visibly distinct within
their domain/level; no corresponding item has identical visible material across
all three levels. Meaningful progression is additionally checked through operands,
operations, recall/step counts and evidence, not only string inequality.

Repeated reading questions in one context can reuse its passage. Several tasks are
explicit copying/order scaffolds, not independent free writing or unassisted
planning. The pool is intentionally small enough to review. Broader stories,
less obvious distractors, unscripted writing and additional problem-solving
strategies remain useful next editorial work. Focused Language has 18 items per
level; an indefinitely fresh session is impossible. Recent-history suppression
works within these finite limits and then allows revision; it cannot create content.
No therapeutic efficacy, mastery or child usability study is claimed.

## Verification

- `npm test`: **71 pass; zero failed/skipped**, including legacy early/country/DOCX
  checks and junior generator/handler tests.
- All 666 authored junior activities project through all eight configured Spanish
  choices (seven countries plus international), maintaining answers and stimuli.
  All also pass existing server normalization/validation and advisory age-load
  checks. Missing stimuli are rejected, never reconstructed from answers.
- Independent arithmetic formulas, copying reconstruction, syllable reconstruction,
  source-bound recall answers and exact order-token sets are checked.
- Real saved-route handler tests cover all three Language skills/levels, mixed
  20-item sheets at each level, unsupported skills/fractional levels, ownership,
  quotas, real within-sheet exhaustion and all-recent-but-still-distinct fallback.
- Actual production `generatedItems` selection delivers three consecutive
  seven-item sessions for every domain/level (21 distinct items, rotating mechanics).
  This is bounded history evidence, not a promise of unlimited novelty.
- `python3 tests/browser-junior.py`: **326 scored interactive activities and seven
  complete 20-question DOCX downloads**. Includes ten consecutive activities per
  domain starting at each level (240), ten per Language skill (30), and every
  domain in each country (56). Automatic level progression remains enabled; each
  returned level is checked against the actual request. Starting-level schedules
  therefore should not be described as ten fixed-level activities per cell.
- Browser bridge executes the real Edge handler with fake owned profile/account,
  persistent usage/history and fake SDK/database. No production invocation or
  credentials. Memory exposure is advanced with the browser clock; card counts,
  subsequent prompts and scoring still exercise the ordinary renderer.
- Actual DOCX XML checks verify all stimulus material precedes each question and
  options/tokens are present. No page errors or adjacent content-key repeat in
  consecutive samples. Desktop/mobile reading was visually inspected at 1280/390;
  captures are `/tmp/junior-reading-{1280,390}.png`.

The browser's local SDK boundary is a simulation; Deno bundling, database policies,
live deployment parity and physical Word pagination are not verified here. The
original five imported data modules are still missing from the checkout. The owner
confirmed they are visible in Supabase; their contents are still needed to recover
and validate the complete function package. This bank can be developed/tested
independently but is **not a substitute for those files**.

A GitHub/Cloudflare branch preview continues to call the deployed Supabase function.
It cannot display this backend content until a separately authorized backend release.
No merge or manual deployment was performed. 10–12/13–15 remain the next content
phases, not completed by this junior-only change.

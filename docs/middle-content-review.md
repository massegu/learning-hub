# 13–15 content review — 2026-10-14

Branch: `fix/early-primary-stimulus-integrity`, following `6788553`.
This is the first authored 13–15 pass. It preserves the mature interface, validated
6–12 banks and original imported files. No merge, production calls or manual
deployment occurred. It is an editorially reviewed finite pool, not a complete
curriculum or validated clinical/attainment instrument.

## Actual integration

The saved `middle` band dispatches to `MiddleContent` in `middle-content.js`, before
legacy variants. Both exercises and worksheets use this factory. Junior/primary
routing and early stimulus gates are preserved; teen/16–18 and cognitive games are
unchanged. The supplied `data/middle.js` remains a recovered original, not a silent
replacement for the authored bank. The complete package now imports eight local modules.

```
owned profile / saved age band → middle
→ requested domain + level + Language skill
→ reviewed middle generator → ordinary normalization/validation/history
→ server localization → source-independent client locale adapter
→ interactive renderer / printable projection and DOCX
```

Two client integration lines now expose the existing Grammar/Spelling/Writing
controls for `middleLanguage` and forward the selected `subdomain`. The handler
rejects unsupported skills before writes. Worksheets mix the same Language skills
and retain `domain`/`sourceDomain`. No new dashboard theme, gamified school hub or
replacement renderer is applied to adolescents.

## Progression and generated examples

Six adolescent projects provide contexts and distinct narratives: sourced podcast,
class survey, robotics prototype, class league, clipped interview and courtyard
proposal. References, claims and conclusions stay within the shown evidence.

| Area | L1 | L2 | L3 |
| --- | --- | --- | --- |
| Language: grammar | Past time/agreement, explicit reference, cause | Subjunctive request, bound pronoun, concession | Hypothetical conditional, explicit reference revision, conclusion connector |
| Language: spelling | Diacritic distinction in short clauses, model copying, vocative comma | Context-sensitive unaccented forms, longer copies, incidental clause commas | More complex clauses, longer word copying, introduced quotation and vocative |
| Language: writing | Four-step outline, evidence-preserving revision, two factual sentences | Five-step outline, limitation, three-sentence production | Six-step outline, evidence/limit/conclusion/next-check production |
| Maths | One-sided linear equation, percentage amount, mean, constant rate | Unknown on both sides, 25 %, median of four, larger rate total | Parentheses plus unknown on both sides, remaining 80 %, mean-minus-median, rate with a pause |
| Reading | Project facts and topic | Sample/condition limitations and factual cross-checks | Supported conclusions, competing restrictions and limits of inference |
| English | Past simple, updated location, sample fact, cause | Prior past action, more location updates, sample proportion, concession | Hypothetical conditional, relevant final location, limited generalization, consequence |
| Reading + writing | Source-preserving summary and four-part structure | Limitation/evidence and five-part structure | Evidence-linked conclusion, six-part structure and brief written review |
| Attention | Multi-part code, one criterion, 15-state scan, next position | Longer code, two criteria, 18-state scan, reverse position | Longer code, three criteria, 21-state scan, relative movement |
| Memory | Five units / 9-second exposure | Six units / 11 seconds | Seven units / 13 seconds |
| Executive | Four-step plan, prerequisite durations, current rule | Five steps, additional prerequisites/recording | Six steps, changed rule, inhibition of previous rule and delivery dependency |
| Speed/reasoning | Constant increments, concrete relation, one-third complement, one exclusion | Growing increments, relational analogy, three-quarter complement, two exclusions | Double-plus-one pattern, abstract relational mapping, five-sixths complement, three exclusions |
| Applied | Clock rollover, points used, two required materials, source checking | Added durations/reserve, three materials, sample limitation | Added verification/reserve, four materials, correcting an overgeneralized message |

Actual podcast-context algebra outcomes are x = 4 for **2x + 3 = 11**, then
**3x + 3 = x + 11**, then **4(x + 3) = x + 24**. Equal answers do not mean equal
operations; constraints/equations and solution steps differ. Percentage cases use
10 % of 200 = 20, 25 % of 200 = 50, and 200 minus 20 % = 160. Statistics progress
from mean of 4/6/8 = 6, median of 4/5/7/8 = 6, to the difference between mean 8
and median 7 for 4/5/7/8/16 = 1. Responses are independently checked from the
shown expressions/data, not only from generator formulas.

The podcast narrative grows from six interviews to recruitment bias and an explicit
limit on describing the whole class. Prototype tasks contrast two simultaneous
changes with a comparison that changes only the light. The clipped interview
separates what the recording supports from certainty about success or intent.
These add actual conditions and evidence, rather than just longer filler.

Visual inspection found a concrete ambiguity: a generic title about samples could
also describe the podcast text. Summary distractors now concern unsupported/contradicted
claims within the project, rather than generic overlapping titles from another
project. No answer should require guessing which of two defensible summaries the
author intended. Broader child/teacher editorial validation remains necessary.

## Written production and assessment limits

Language's third Writing family and the final literacy family produce real short
written responses, using the existing `self` UI. Each has source material, a bounded
model and visible review criteria. The criteria are canonical stimulus blocks, so
they appear on-screen **and before the worksheet question** in DOCX. They are not
hidden metadata or a claimed automatic scoring rubric.

The test writes the authored model and uses the existing self-assessment controls
to verify the flow. It does **not** prove independent prose correctness or mastery.
The existing app records a positive self-assessment as correct, so it can contribute
to progress/adaptation; a teacher/parent should review writing rather than interpret
that recorded result as independently verified skill. This pass does not change
shared scoring or the previously validated fresh-evidence thresholds.

Some spelling still practices copying with a model; further independent rule-based
spelling is useful. Some ordering reproduces a documented plan rather than deriving
one without support. Abstract vocabulary/analogies at L3 need individual scaffolding.
English is not a complete proficiency syllabus. Number of words/items alone cannot
establish difficulty; these are engineering/editorial targets.

## Variety and anti-repetition

| Domain | Authored mechanic families | Visible items per level |
| --- | ---: | ---: |
| Language | 9 (3 per skill) | 54 (18 per skill) |
| Each of the other nine domains | 4 | 24 |
| **Total** | **45** | **270** |

All three levels total **810** authored activities, including 36 written tasks
(12 per level). There are six source narratives/context families. Repeated numeric,
rule and planning scaffolds include bounded values or project labels; **810 is not
810 independent learning situations**. Some questions intentionally reuse a passage.
Family IDs count authored mechanics, not proven independent cognitive constructs.

Visible audit excludes random IDs, level labels and option order; every counted
item is visibly distinct within its domain/level, and no corresponding activity is
unchanged across all three levels. Actual load/operation/evidence checks accompany
that string comparison. Source levels increase recall from 5→6→7 and documented
steps from 4→5→6; several other mechanisms change the required conditions/calculation.

Production history selection yields three consecutive seven-item sessions per
area/level with 21 distinct items. This cannot promise unlimited novelty: each
focused Language skill has 18 items/level, while the other pools contain 24. Later
sessions revisit reviewed material after exhaustion. Additional source contexts,
closer distractors and richer planning/independent composition are future expansion.

## Validation

- `npm test`: **87 pass, zero failed/skipped**. Includes existing early/primary/junior,
  all imported-module, locale, source-evidence, quota/ownership and DOCX checks.
- All 810 authored activities project under seven countries plus international with
  complete stimuli and stable answers. Missing required stimuli are rejected; self
  responses retain a printable rubric and model. Existing advisory 13–15 word,
  recall, step and option thresholds pass; they are not clinical norms.
- Independent checks cover equations, percentages, mean/median difference, effective
  rate, clock rollover, scan counts, exact table targets, sequence patterns,
  source-bound recall/copying and order-token integrity.
- The real authenticated handler is tested for all three Language skills/levels,
  unsupported skill/domain rejection without writes, and 20-question worksheets
  covering all ten domains at each level. Account/DB calls are explicitly mocked.
- `node tests/edge-audit.js`: 54/24 visible items per domain/level, zero normalized
  server-invalid items, zero unchanged cross-level counterparts. Other reviewed bank
  counts are unchanged.
- `python3 tests/browser-junior.py middle`: **400 answered activities**, consisting of
  **386 automatically scored and 14 self-assessed responses**, plus seven actual
  20-question DOCX downloads. Includes ten consecutive tasks per domain starting
  at every level (300), ten per Language skill (30), and all domains per country
  (70). Automatic adaptation stays enabled; requested/returned levels agree.
- The browser bridge executes the real handler/all eight modules with an owned fake
  account and persistent fake quota/history. No quota bypass, credentials or live
  Supabase calls. Memory time advances with the browser clock; the ordinary
  reveal/hide/answer path remains active. No page errors or adjacent sampled
  content-key repeats. Every written task's criteria are verified visible.
- DOCX XML verifies every stimulus/rubric before the question and every option/token.
  The write/reading desktop/mobile layouts were inspected at 1280/390 without page
  overflow. Captures are `/tmp/middle-{reading,writing}-{1280,390}.png`.
- Primary full-app regression: **437 activities and seven complete DOCX files**.
  Existing stage regression: **30 early Language activities**, restored early icons,
  responsive school hubs, fresh 8/10/12-answer windows (60 older answered tasks),
  reload/mission restoration, mature middle route and actual early Language DOCX.
- Native Deno diagnostic type check/startup passes with the real SDK and all eight
  local modules, including all 1,080 original imported items. **Only the inaccessible
  JSR ambient declaration is substituted locally**; official JSR checking remains
  blocked by the environment, not passed. See the import-recovery review.

## Release boundary

The five original modules are now present and unchanged. This phase does not alter
16–18 content or deploy any backend. A Cloudflare branch preview can receive the
client selector change but still calls the old deployed Supabase content; the new
skill routing/calibration requires the matching backend release. This preview must
not be treated as validation of the new bank until then.

Before release, official-JSR/deployment integration and real student/teacher editorial
review remain necessary. The broader 6–15 first-pass banks are ready for review on
the branch; publication and merging have not been authorized/performed here.

# 10–12 content review — 2026-10-14

**2026-10-15:** [Revisión tras las capturas](manual-feedback-review.md) documenta
la lectura y Memoria de 8–10, integración de Lectura/escritura en 10–12, presentación
y tema de 13–15, corrección acotada de 16–18 y [prueba local aislada](prueba-local.md).
Los recuentos y observaciones anteriores se conservan como registro de cada fase.

**13–15 follow-up:** the [middle content review](middle-content-review.md) now
documents a separate adolescent bank and Language skill routing. Earlier references
to pending middle calibration describe the previous state; no deployment occurred.

**Import recovery update:** the owner has now supplied all five legacy modules.
See [the package integration review](edge-import-recovery.md). Statements about
missing imports below describe the earlier review; no deployment has occurred.

Branch: `fix/early-primary-stimulus-integrity`, following `8deab9d`.
This first authored 10–12 pass covers the eleven available exercise areas. It is
reviewable source, **not a deployed Supabase update or a complete curriculum**.

## Confirmed gaps and scope

The supplied active primary factories reused visible tasks across L1/L2/L3, ignored
Language subdomain selection, had only ten Reading/six English variants, and exposed
regional currency and unsupported worksheet dependencies. The earlier Geometry-only
repair had real levels but limited coverage. This pass replaces the **primary active
exercise/worksheet dispatch** with `primary-content.js`; it does not alter the early
or junior banks, 13–15/16–18 dispatch, cognitive games or frontend themes/renderers.

Original `data/{primary,middle,teen,english,literacy}.js` imports remain missing. The
new file has no dependency on those banks, so its generators can be developed and
audited now. The whole original Edge package still cannot be bundled/validated from
this checkout alone; this is not permission to substitute historical data modules.

## Data flow and source parity

```
owned learner profile → saved route resolution → age === primary
→ domain + requested level + Language subdomain
→ PrimaryContent.generate → normalization/validation + existing recent-history selection
→ server locale adaptation → client LocaleContent + ActivityModel
→ ordinary interactive renderer / worksheet selection → DOCX
```

Junior routing runs first, preserving its primary database alias. Interactive
Language now honors grammar/spelling/writing at 10–12 as well as 8–10. Unknown skills
return 400 before delivery writes. Worksheets mix these skills and retain explicit
`domain` and `sourceDomain`. Both paths use the same authored activities; stable
content keys are separate from unique delivery IDs. Existing authentication,
ownership, quota, history and worksheet integrity/recovery remain in use.

## Real progression and generated examples

These are editorial targets for review, not standardized clinical or attainment
norms. L1 is a supported entry stage, rather than a promise that every 10-year-old
starts with the same skills.

| Area | L1 | L2 | L3 |
| --- | --- | --- | --- |
| Language: grammar | Plural verb agreement, explicit object, cause | Past time, unambiguous bound pronoun, concession | Conditional future, clear reference editing, consequence |
| Language: spelling | Model-bound copying, reviewed syllables and accents | Longer words, interior/marked letters, stress/tilde matching | Longer word forms, punctuation/stress evidence and accents |
| Language: guided writing | Three-step plan/three fragments | Four steps/fragments and connectors | Five steps/fragments, condition/result and responsible-person revision |
| Reading | Concrete project events and factual checks | Additional evidence/comparison and limits | Competing constraints, supported interpretation and choosing a plan from the evidence |
| Maths | Addition; a third; simple decimals; groups | Additional multiplication step; two thirds; harder decimals; added groups | Two operations; five sixths; three decimal measures; reserve quantities |
| Geometry | Rectangle/square perimeter, right-angle complement, forward map movement | Area, straight-angle complement, forward/back movement | Triangle area, cube volume, missing triangle angle and combined movement |
| English | Routine present, object vocabulary, explicit location, cause | Past simple, changed location, contrast | Conditional future, relevant object among distractors, final location, result connector |
| Reading + writing | Summary, source detail, three-part schema, clear object reference | Retain a relevant fact, four-part schema, chronology | Evidence-linked conclusion, five-part schema, explanation/revision |
| Attention | Multi-part code, eight-item scan, one table criterion | Longer code, twelve-item scan, two criteria | Longer code, sixteen-item scan, three criteria and relative movement |
| Memory | Four related units, 8-second exposure | Five units, 10 seconds | Six units, 12 seconds |
| Executive | Three-step plan, two preparatory durations, current rule | Four steps, added prerequisite, changed rule | Five steps, extra conditions, inhibit prior rule and verify delivery |
| Speed/reasoning | Additive pattern, concrete relation, half-complement, one exclusion | Doubling, more complex relation, two-thirds complement, two exclusions | Increasing increments, relational analogy, five-sixths complement, three exclusions |
| Applied | Two durations, one point deduction, one required material | Add cleanup/reserve points, two materials | Additional cleanup/verification, reserved points, three materials and group agreement |

Representative generated radio-project results:

- Maths operations: 120 + 35 = **155**; (120 + 35) × 2 = **310**;
  (120 + 35) × 2 − 24 = **286**.
- Fractions of 36 pieces: one third = **12**, two thirds = **24**, five sixths = **30**.
- Geometry base 6 cm/height 3 cm: rectangle perimeter **18 cm**, rectangle area
  **18 cm²**, triangle area **9 cm²**. Equal numeric values in the first two cases
  have different questions, formulas and units; they are not interchangeable.
- Radio Reading: identify Ana's questions; compare clarity of recordings; decide to
  re-record one noisy but important answer within ten minutes, rather than both
  interviews requiring twenty minutes.
- Applied duration in the stories context crosses the hour correctly at L3:
  20 + 25 + 15 minutes from 16:00 = **17:00**, never “16:60”.
- English contrasts “She checks the plan”, “Yesterday she checked the plan” and
  “If she has time tomorrow, she will check the plan”.

Six separate project narratives cover radio, shadows experiment, garden, games
fair, route map and story club. Later paragraphs add relevant conditions. Questions
and summaries only rely on paragraphs actually shown. Review corrected summaries
that previously assumed later evidence, malformed hour arithmetic, and pronouns
with two same-gender antecedents. Pronoun examples now contrast authored gender or
number and use natural placement (“Después lo revisó”, not “revisó lo”).

Every task has printable source material. Spanish articles/destinations are authored,
not guessed globally; decimals use explicit comma notation and preserved units.
Game points are fictional, not substituted national currencies. English stimuli,
options and explanations remain English under the protected English domain; Spanish
project labels are intentional app context. The existing seven-country adapter is
still the source-independent delivery/export gate.

## Variety, anti-repetition and editorial limits

| Domain | Families | Visible activities per level |
| --- | ---: | ---: |
| Language | 9 (3 per skill) | 54 (18 per skill) |
| Each of the other ten domains | 4 | 24 |
| **Total** | **49** | **294** |

Three levels total **882 authored activities**. IDs/level labels/option order are
excluded from the visible audit. Every domain/level has the counted visible distinct
items, and zero corresponding items remain visibly identical across all levels.
Independent response checks additionally verify operations, units, recall/step load,
source-bound copying and rules, rather than treating string changes as calibration.

These are six contexts with repeated mechanics, **not 882 independent pedagogical
situations**. Some abstract-rule tasks differ mainly in project label; numeric
families share a scaffold. Reading can reuse a passage for different questions.
The counted families are authored mechanics, not validated independent constructs.
Current history selection produces 21 distinct activities through three consecutive
seven-item sessions per domain/level, then allows reviewed revision as pools exhaust.
Focused Language has only 18 activities per skill/level; unlimited novelty is impossible.

Remaining editorial work: broaden texts/contexts and realistic close distractors;
add independent spelling rules (this first pool still includes supported copying
and stress matching), richer planning, more free composition, wider geometry and
English coverage. Guided ordering/selected revision **does not establish free-writing
ability**; English is not a complete proficiency syllabus. Word count alone cannot
prove difficulty. Individual child usability and curricular/clinical validation are
not established by these engineering checks. 13–15 remains a separate next phase.

## Verification

- `npm test`: **78 pass, zero failed/skipped**, preserving existing early/junior,
  locale, stimulus, ownership/quota and DOCX regressions.
- All 882 primary activities run through all eight configured Spanish choices
  (seven countries plus international): complete printable projection, retained
  answers, unique choices and rejection of removed required stimuli. Existing
  advisory primary word/recall/step/option loads also pass.
- Independent checks cover operation/fraction/decimal/group calculations, angle/
  perimeter/area/volume/movement answers, real clock rollover, source-bound copying,
  syllable reconstruction, scan counts, unique table targets, numerical patterns,
  source-bound recall and unambiguous pronouns.
- Actual authenticated handler tests verify primary skill routing at all levels,
  unknown-skill rejection without writes, and 20-item worksheets covering all eleven
  domains at each level. Forced two-candidate exhaustion still returns 422; the
  earlier test no longer assumes the replaced Reading bank has only ten variants.
- `node tests/edge-audit.js`: new primary bank 54/24 items per domain/level; zero
  normalized server-invalid items; zero unchanged cross-level corresponding items.
  Junior counts remain unchanged. Legacy middle counts are still diagnostic only.
- `python3 tests/browser-junior.py primary`: **437 scored interactive activities
  and seven actual 20-question DOCX files**. Includes ten consecutive activities
  per domain starting at each level (330), ten per Language skill (30), and every
  domain in each country (77). Automatic progression stays enabled, so starting
  level cells are not falsely described as ten fixed-level tasks. Each item's level
  agrees with the real request; consecutive samples have no adjacent content-key repeat.
- The browser bridge evaluates the real Edge handler with an owned fake account,
  persistent fake usage/history and a fake SDK. Quota enforcement is not disabled;
  external service requests are blocked. Memory time advances with the browser
  clock while the ordinary reveal/hide/answer renderer remains in use.
- DOCX XML checks preserve all source material before its question and every option/
  token. No page errors. Primary Reading is inspected at desktop/mobile 1280/390;
  captures are `/tmp/primary-reading-{1280,390}.png`.
- The same shared browser bridge also reruns the junior regression separately:
  **326 scored activities and seven 20-question DOCX files**. The small browser-helper
  refactor allows selecting the route; it does not replace app code or weaken scoring.

These checks do not establish live Supabase source parity, Deno bundling of missing
imports, database policies or physical Word pagination. Nothing was merged or
manually deployed. A Cloudflare branch preview still uses the old deployed backend;
this content becomes visible there only after a separate backend release, following
recovery/validation of the five original data modules.

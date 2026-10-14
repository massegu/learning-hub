# Language and school-age follow-up — 2026-10-14

**Import recovery update:** the owner has now supplied all five legacy modules.
See [the package integration review](edge-import-recovery.md). Statements about
missing imports below describe the earlier review; no deployment has occurred.

Branch: `fix/early-primary-stimulus-integrity`, following `a922231`.

**Source follow-up:** the owner has now supplied the Edge Function. See the
[actual source audit](edge-function-school-age-review.md) for confirmed data flow,
30,420 generated activities, concrete corrections and remaining calibration gaps.
The source-unavailable statements below describe the earlier client-only review.
The subsequent [8–10 content pass](junior-content-review.md) now routes junior
exercises/worksheets through an authored backend bank. The
[10–12 follow-up](primary-content-review.md) now does the same for primary. Neither
has been deployed.

The reviewed early dashboard, seven other early areas, calibrated activity families
and worksheet replacement/export path are preserved. This pass addresses the
screenshots, restores Language skills and adds separate school-age presentation.

## Findings from the supplied screenshots

| Observation | Resolution |
| --- | --- |
| Cap option has an icon; flower and shoe do not | Add local flower/shoe drawings and require complete pictorial coverage before illustrating a choice set. |
| Animal options are text-only | Add cat, dog, rabbit, bird and fish, retaining every label. |
| Birthday distractor “un dibujo” is not illustrated | Add a drawing icon, distinct from blank paper. |
| People in the cookie shortfall are represented only by names | Add a neutral person pictogram only under the factual `Personas` caption; retain names and one unit per person. |
| Language looks like another Reading area and no spelling selector appears | The app explicitly hid Language modes for early profiles. Restore three real modes and their matching local content. |
| Maths L3 compares numeric quantities or completes a number series | Intentional level progression; these numerals are not missing pictures and are preserved. |
| Attention paths, object groups, arithmetic evidence and framed stimuli work | Preserve their mechanics, layout and difficulty. |

The fixed catalogue grows from 32 to **41** authored vectors. The local Word PNG
catalogue is about **189 KB uncompressed**. No remote assets, game artwork or image
services are introduced. Unknown future options render as a uniformly textual set,
rather than decorating only the recognized/correct option and providing an unintended
answer cue. Pictures do not replace words, counts or answer evidence.

## Language 6–7: actual skills and data flow

The three controls now expose:

- **Palabras y gramática:** existing vocabulary/phrase content plus articles and
  singular/plural adjective agreement.
- **Ortografía:** missing initial/interior/final letters, familiar letter groups
  (`qu`, `rr`, `ll`, `ch`) and syllable separation. Syllable load grows from two
  to three and three/four syllables. L1 choices remain two; later levels can use three.
- **Formar frases:** existing phrase ordering and new two-/three-constituent phrases.
  This label accurately describes a guided construction task, not free handwriting.

`payload.subdomain` already reaches the Edge Function. It now also reaches
`EarlyContent.adaptResponse → select → pool`, selecting the corresponding
`languageFocus` after an authorized response. Thus changing the visible tab really
changes the local early content. Spelling carries bound evidence: replacement letters
must reconstruct the reviewed word from the displayed pattern, or the displayed word
must match the authored syllable segments and answer. Corruption fails before display
or printing. Word-form stimuli use neutral, reviewed vocabulary across all seven
countries; they are not built by blindly localizing letters in regional nouns.

Worksheets retain their existing mixed Language selection and now include grammar,
spelling and phrase activities. No change to `WorksheetSelection` or DOCX/ZIP recovery
was required. Full localized/printable integrity and semantic history remain in use.
Six new Language scaffolds bring that domain to eleven broad families, **108 rendered /
77 semantic variants per level**, distributed as grammar 54/35, spelling 24/24 and
phrase construction 30/18. These are bounded variants, not independent curricula.
Totals across all eight early areas are 478/497/507 rendered and 308/336/355 semantic
variants at L1/L2/L3. Other domain counts and scaffolds remain unchanged.

## Original school-age themes and missions

- **8–10:** “Tu taller de expediciones”, a construction/exploration treatment with
  restrained grid backgrounds, squared cards and offset borders/shadows.
- **10–12:** “Tu base de retos”, a strategy/challenge treatment with a navy/purple
  hero, cool highlights and a more mature hierarchy.
- **13–15:** keep the established mature dashboard and presentation. No playful
  school hub is applied. 16–18 also retains its existing treatment.

These draw on the requested general principles rather than copying Minecraft,
Pokémon or Fortnite branding/assets. Learning Lab identity, direct area access and
existing functions remain. School hubs show actual activity counts, levels, completed
missions and a resume/suggested-area action. Four short domain missions reuse the
ordinary guided runner and authenticated exercise requests. `_schoolJourney` stores
reviewed mission IDs/indexes and a bounded completion list in existing profile progress.
Missions count participation, not mastery; no currency or additional reward system.

A concrete routing gap was also corrected: junior profiles use the primary database
alias, and the old `ageData()` consequently initially exposed all eleven primary
subjects before late DOM patches hid three. The client now uses explicit junior
metadata to expose the intended eight domains directly. The 10–12 hub exposes its
eleven domains. Theme and route selection do not depend on visible labels.

Responsive checks revealed that the restored long Language tab names needed wrapping
at mobile widths. They now wrap with readable touch targets. Visual review exposed
legacy global `!important` colours overriding the dark school hero; scoped overrides
restore measured label contrast without altering the accepted early palette.

## Difficulty audit: concrete client defect versus remote curriculum

The previous adaptive algorithm used the latest ten answers, began reviewing after
six, and could promote from L1 after answer six and from L2 after answer seven using
almost the same evidence. This did not establish performance at the new level.

For the requested older groups, reviewed client progression now requires fresh
per-subject evidence after each automatic/manual level change:

| Age route | Fresh answers required | Promotion | Reduction |
| --- | ---: | ---: | ---: |
| 8–10 | 8 | at least 7 correct | at most 3 correct |
| 10–12 | 10 | at least 9 correct | at most 4 correct |
| 13–15 | 12 | at least 10 correct | at most 5 correct |

`attemptNumber` in retained progress history and `_levelCheckpoints` preserve the
boundary across reloads. Old results without a sequence number do not suddenly
promote a newly upgraded profile. Manual changes reset the evidence window. Duplicate
submissions of one delivered task cannot supply extra evidence. The visible selector
now reflects the actual next requested level. The accepted early progression is not
changed; 16–18 retains its existing adaptive behaviour. These are explicit engineering
heuristics, not standardized clinical norms.

The **actual older content path remains remote**:

```
explicit learner metadata → selected domain/subdomain/level
→ API.requestContent({profile_id, locale, kind, domain(s), level, ...})
→ request-learning-content Edge Function → remote items
→ controlled locale adapter → ordinary interactive renderer / printable selector
```

Unlike early content, junior/primary/middle responses are not replaced by the authored
early bank. Junior and primary share a DB alias; the backend must resolve saved
`progress.ageRoute` as well as `age_band`. The client does not prove that the deployed
function does so. Its source is absent from this checkout; repository notes mention
a deployed backend version but do not supply its implementation. No production
content/records or deployment was read or changed during this review.

`AgeStages.audit` supplies an advisory diagnostic for actual rendered older items:
requested route/level, printable-or-canonical reading words, recall and step loads,
option loads, missing/mismatching declared content level and a narrow younger-context
review. Unsupported legacy projection is reported, not silently treated as measured.
`window.lastDifficultyAudit` exposes the latest diagnostic locally for review; it
contains counts/issues, not a copied question bank. It does not reject normal remote
content or claim that an undeclared response matches L1/L2/L3.

Initial editorial review targets per level are explicit in `AgeStages.definitions`:

| Route | Stimulus-word review ceiling L1/L2/L3 | Recall units | Steps | Options |
| --- | --- | --- | --- | --- |
| 8–10 | 35 / 65 / 90 | 3 / 4 / 5 | 2 / 3 / 4 | 3 / 3 / 4 |
| 10–12 | 65 / 100 / 140 | 4 / 5 / 6 | 3 / 4 / 5 | 3 / 4 / 4 |
| 13–15 | 100 / 180 / 260 | 5 / 6 / 7 | 4 / 5 / 6 | 4 / 4 / 4 |

These are review triggers, **not validated curriculum gates**. Per-domain assessment
must additionally check distractor similarity, inference grounded in supplied evidence,
number size/operations, explicit planning constraints, and age-appropriate contexts.
Reading length alone cannot establish task difficulty, particularly in bilingual,
visual or specialized activities. Real examples at every domain/level need the Edge
Function source and representative returned items. A source-location question was
sent to the user while independent client work continued. Full remote editorial
calibration remains pending that information.

## Validation

```sh
npm test
python3 tests/browser-stages.py
python3 tests/browser-journey.py
python3 tests/browser-refinements.py
python3 tests/browser-smoke.py
python3 tests/browser-locales.py
node tests/editorial-audit.js
```

- **59 Node tests pass, none fail/skip**, including all generated early/country
  projections, new spelling evidence corruption, skill routing, PNG parity, fresh
  adaptive thresholds, advisory load/missing-level detection and school mission state.
- New stage browser: **30 ordinary early Language tasks**, ten per mode, real
  subdomain propagation/scoring and no adjacent semantic duplicate in sampled runs.
  A real 20-task Language DOCX includes spelling material. Complete animal option
  pictures and all-text fallback for a partly unknown option set are checked.
- Both school hubs at 1920/1440/1280/1024/768/390, normal zoom: correct 8/11 areas,
  no page overflow, readable controls. Language tabs at desktop/tablet/mobile also
  pass. Dark hero label contrast is checked against its lightest background region.
- **60 older answered tasks:** exact fresh 8-/10-/12-answer boundaries for two
  promotions, no adjacent promotions, requested/visible level agreement, reload
  persistence and restored school missions. Simulated undeclared remote levels are
  explicitly diagnosed; they are not described as calibrated production content.
- Existing 648 layout cases, 80 consecutive early selections, real single/ZIP
  replacement, age/source rejection and quota checks pass. Existing country matrix
  passes 357 interactive tasks and 35 complete DOCX files across seven countries and
  five routes. The SDK boundary is simulated and external requests are blocked.
- Desktop/mobile school hubs, spelling and complete-option illustrations were
  visually inspected. Captures are under `/tmp/{workshop,base}-hub-*.png`,
  `/tmp/early-spelling.png` and `/tmp/early-complete-icons.png`.

The existing worksheet implementation and tests remain in place; intentional old
test assumptions about hidden early Language tabs/ordinary junior home were updated
to assert the newly requested presentation. Integrity/anti-repetition assertions
were not relaxed. Chromium and real DOCX XML/image checks do not validate live
Supabase/Cloudflare, child usability, all remote curriculum or physical Word pagination.

No merge to `main`, manual deployment or production Supabase changes. The reviewed
client changes are committed to the existing branch for preview iteration.

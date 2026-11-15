# Worksheet recovery and early-primary exploration — 2026-10-14

Follow-up to `9995333` on `fix/early-primary-stimulus-integrity`. Age gating,
canonical stimuli, controlled locale rules, difficulty logic, semantic history
and the final fail-closed DOCX exporter remain authoritative.

## Worksheet failure and replacement

The reported “Actividad no imprimible: la pregunta no tiene el estímulo del que
depende” comes from `ActivityModel.printable`: a dependent question has no canonical
or supported legacy stimulus. The validator was correct. The integration defect
was the caller accepting an entire response and then validating the whole sheet;
one incompatible candidate aborted its worksheet and ZIP. The same error is
reproduced with an empty-stimulus dependent remote question. No production response
was read, so the precise production item/domain that failed remains unidentified.

`WorksheetSelection` now checks candidates individually **before acceptance**:

1. Identify/check the selected domain.
2. Apply the selected country through the existing locale controller.
3. Apply the existing early age/domain gate where relevant.
4. Validate the printable projection and its localized projection.
5. Reject incompatibility or semantic duplication; only then add it to the sheet.

The early bank also filters localized/printable candidates inside `EarlyContent.select`,
before history commitment. If a selected domain has no remaining printable material,
another selected domain can supply it. A genuinely insufficient finite early pool
reports insufficient distinct printable activities without committing failed history.
Family/mechanic weighting, cycle reset and within-sheet semantic exclusion remain.

For remote candidates, the collector keeps valid activities and requests another
authorized batch as needed until the requested count is met. Local/cache-like and
remote candidates use the same checks. Remote changing IDs, distractor permutations
and known protagonist-name swaps cannot disguise the same problem.

Each replacement uses the existing Edge Function, authentication, subscription and
quota path, with the original supported worksheet configuration. Service errors
propagate immediately; a quota denial never triggers retries or free local content.
Replacement continues while new valid activities arrive. **Three consecutive
replacement batches with no progress** stop a cyclic/incompatible stream; an
explicit exhausted response stops sooner. The target count bounds successful
progress, and the no-progress limit prevents endless retries. The
Spanish exhaustion message suggests fewer exercises or another area. This bound
establishes exhaustion of the available candidate stream, not the entire unknown
remote database. Additional authorized batches can consume ordinary usage quota.

Single/mixed worksheets and ZIP versions share this selection. The button is disabled
while generating, and profile/locale changes invalidate the operation. Final export
still checks every complete version before any download; direct corrupted calls
fail closed and never fabricate missing material. Semantic uniqueness is guaranteed
within each sheet. Existing early history prefers unseen material across versions,
but finite pools can cycle. Global remote cross-version history is not introduced.

## Early-primary home, exercises and missions

The early hub shows eight directly accessible area cards, each with a local icon,
child theme, short description, actual activity count, current level and a three-task
first-exploration marker. Its summary measures participation, not mastery or selected
difficulty. Continue/suggested-area access complements ordinary sidebar navigation.
The Learning Lab identity is retained; all artwork is authored in-repository, with
no copied reference branding/artwork, map requirement or external image requests.

Exercises have a home action, the short “Mira · Responde · Sigue” guide and area
activity count. The existing counter/quota information remains. Stimuli have a
prominent framed panel, and generous answer buttons occupy a clearly separate area.
Attention retains its framed model and labelled, aligned comparison rows. Codes
such as `E14-O6` remain excluded; familiar shape comparisons remain the early version.

Styling is scoped to `.early-experience`/`.early-primary`. Older home/exercise routes
retain their established treatment. Existing responsive workspaces, count evidence,
canonical answer identity and printable integrity are preserved.

`EarlyJourney` adds reusable area/mission metadata, normalization and progression:

| Mission | Ordinary exercise plan |
| --- | --- |
| Explora las palabras | Three Lenguaje activities |
| Descubre dos historias | Two Lectura activities |
| Busca los detalles | Three Atención activities |
| Una vuelta por el Lab | Lenguaje, Matemáticas, Atención, Funciones ejecutivas, Cognición aplicada |

Missions reuse the existing guided-session runner and ordinary authorized exercise
requests. Adaptive levels and scoring remain in use. Answered tasks advance the
saved mission, including answers needing review: completion means participation.
Duplicate early result submission is guarded and controls disable after feedback.

`profile.progress._earlyJourney` stores a reviewed mission ID/index, answered IDs
and a bounded completion list. Plans come from definitions, not arbitrary persisted
domain arrays. Pause, direct-area navigation, reload and profile switch preserve
pending work. Starting while a mission is pending resumes it. Level/locale changes
pause the live runner; resetting progress clears missions. Existing `saveProgress`
persists this alongside other data, without migrations or production data edits.
No currency, random reward loop, new scoring system or billing flow is added.

## Illustration approach

The catalogue grows from 28 to **32 local vectors**, adding a tree, umbrella, plant
pot and glass. Exact recognized noun labels can display their own picture without
rewriting text or inventing a scene. Words remain visible and scoring uses canonical
answers. Ambiguous terms retain existing sense handling. Area art is navigation
framing, not additional unchecked exercise evidence.

Inline/local SVG has local PNG counterparts regenerated by
`scripts/render-stimulus-art.py` for Word. The catalogue is about **135 KB uncompressed**,
with no runtime image build. Unsupported visual assets remain rejected. Count glyphs
appear once per unit and printed facts/sequence positions remain complete.

## Validation

```sh
npm test
python3 tests/browser-journey.py
python3 tests/browser-refinements.py
python3 tests/browser-smoke.py
python3 tests/browser-locales.py
```

The existing Node/DOCX/JSZip and Python Playwright/Chromium setup is unchanged.
Browsers load the actual index, patches, app, selectors, locale gates and exporter;
only the SDK/service boundary is simulated. External requests are blocked.

- **53 Node tests pass, none fail/skip.** New tests cover replacement, continued
  replacement while new compatible material arrives, changed-ID
  duplicates, empty/cyclic/finite exhaustion, service-error propagation, filtering
  before early history commitment, mixed-domain fallback, locale/age rejection,
  mission resumption and participation counters. Real single DOCX/two-version ZIP
  replacement/integrity is checked for all seven countries. Direct corruption
  rejection is retained.
- **Journey browser:** eight-area/four-mission home at 1920, 1440, 1280, 1024, 768
  and 390 pixels, 100% zoom, with no page overflow, undistorted visible icons and
  controls at least 44 pixels high. Direct access in every domain, actual memory
  timers, pause/reload/resume, persisted completion and mixed-area advancement pass.
  It downloads mixed single/ZIP worksheets after defective remote candidates,
  replaces defective early material, stops a cyclic four-batch stream, preserves
  quota denial and verifies the older dashboard.
- **648 layout cases:** 36 affected families × three levels × six widths, including
  model/options, count SVGs, memory hiding/scoring, older routes and illustrated
  DOCX integrity. No escaped content or compressed workspaces.
- **Ordinary browser regression:** 80 consecutive early activities (ten per domain,
  reload after five), three 20-question early worksheets, four older interactive/
  export routes and denied/error/stale-content paths pass.
- **Country browser regression:** 357 interactive activities and 35 complete
  20-question DOCX files, seven countries × five age routes, plus locale persistence,
  stale-response and failed-save checks. Remote worksheet fixtures now use distinct
  displayed card numbers: earlier changed-ID copies correctly fail semantic novelty.
- Home at desktop/mobile, each major domain, Attention comparison and mission
  progress captures were visually inspected. A light-on-light new home button was
  found and its foreground/background corrected before completion.

Temporary captures: `/tmp/early-hub-*.png`, `/tmp/early-journey-*.png`,
`/tmp/early-refinement-*.png`; browser audit JSON remains under `/tmp`.

## Remaining limitations

- No live Supabase bank/authentication/billing, Edge Function implementation or
  Cloudflare deployment health is validated by these simulated suites. The specific
  production failing candidate remains unidentified without its actual response.
- Bounded remote replacement may reach ordinary quota and cannot prove whole-bank
  exhaustion. Remote uniqueness does not cover all previous sessions/ZIP versions.
- Missions group ordinary activities, rather than authored narrative sequences or
  measured interventions. Offline/cross-device conflicts and failed saves retain
  the existing persistence limitations.
- Area counts use retained history (maximum 5,000 results); older entries can age out.
  They do not claim lifetime mastery statistics.
- Previous editorial limits remain: some Applied L2/L3 requirements are shared,
  small Language families exhaust, and colour/greyscale accessibility needs review.
- Chromium and DOCX XML/image checks do not replace child testing, Safari/Firefox
  checks or actual Word pagination/physical print review.

The changes are committed and pushed to the same branch for its connected preview.
No merge to `main`, manual deployment or production Supabase changes.

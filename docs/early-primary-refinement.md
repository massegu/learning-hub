# Early-primary refinement — 2026-10-13

Scope: the existing `fix/early-primary-stimulus-integrity` branch, following
`bae9207`, `08b196d` and the controlled locale implementation in `fc95d04`.
This is a local implementation/review, with no merge, push, deployment or
production Supabase changes. Earlier review reports describe their own snapshots;
the figures below describe this refinement.

## Concrete defects and fixes

- The sequence workspace occupied one cell of the outer answer grid, then split
  that cell into two inner columns. It now occupies the full answer area. Sequence,
  multiselect and cognitive workspaces use the same full-width container; early
  sequence columns only split when their own card has sufficient space.
- Plain list markers could look like additional points in counting tasks. Count
  units now use marker-free cards, with exactly one pictorial point per factual
  `●`. Non-counting cards have no numbering either; ordered sequences explicitly
  retain positions. DOCX point counts have neither numbering nor list bullets.
- The early delivery/export gate rejects options that differ only by case,
  whitespace, leading article or terminal punctuation. At least two distinct
  choices are required. Older spelling tasks can still distinguish `Ana`/`ana`.
- Counts, sums, subtractions and comparisons now declare quantity evidence. Their
  answer is checked against canonical stimulus units, not the prompt's claimed
  answer. Missing proof, wrong totals, numbered count units and ambiguous groups
  fail before display/export. Additional evidence binds odd-one-out/frequency
  targets, matching rows, two-condition decisions and named lookup subjects.
- Memory references reject duplicated subjects. Search rows identify one subject;
  model comparisons have one matching row; two-condition tables have one answer.
- Illustrated option buttons retain the exact canonical answer in `data-answer`
  and their accessible name. Scoring never depends on concatenated SVG/text.

The original route, domain/mechanic allowlists, canonical text/list/table schema,
reading limits, six-element limit, three-step limit, age gates and mandatory locale
and export gates remain in place. New formatting hints and captions are validated
and captions pass through the locale controller. Unknown image content is still
rejected; the fixed illustration catalogue is a projection of validated facts.

## Visual support and Attention

`js/stimulus-art.js` contains 28 small authored SVGs: everyday objects, four shapes,
a point, three explicit bottle states and four balloon colours. Vocabulary aliases
come from the supported regional forms; ambiguous banana terms require an explicit
sense. A colour is drawn as a balloon only under the canonical `Globos` caption;
bottle states require `Botellas`. Unknown words retain their literal text.

Screen object cards keep their Spanish labels. Glyph strings are drawn once and
retain hidden accessible canonical text. Attention models have a separate framed
panel and comparison rows have clear labels and spacing. Codes such as `E14-O6`
were already excluded by the early policy; they remain excluded. Early matching
uses two to four familiar shapes instead of letter/number codes.

DOCX embeds local PNG counterparts of the same vectors for known objects/states,
plus each exact text label. Shape/point sequences print as literal glyphs, avoiding
duplicate countable illustrations. `js/stimulus-art-png.js` is approximately
118 KB uncompressed; there are no image service requests or runtime image builds.
`python3 scripts/render-stimulus-art.py` regenerates it locally using Chromium and
Playwright after a vector edit. All new families support the existing exporter.

## Difficulty calibration

Level 1 choice tasks use two choices. Levels 2/3 can use three; inherently binary
questions retain two. Difficulty changes are family-specific, not just more words.

| Domain/task | Level 1 | Level 2 | Level 3 |
| --- | --- | --- | --- |
| Maths: points | 2–4 visible points | 3–5 | 4–6 |
| Maths: addition | add one | add one or two | add two or three |
| Maths: comparison | visible groups, difference two, find more | visible groups, difference one | numerals, find less |
| Maths: number gap | consecutive small numbers | consecutive numbers with higher starts | count by twos |
| Attention: search | three figures | five | six, with up to three targets |
| Attention: row model | two shapes, two rows | three shapes, three rows | four shapes, three similar rows |
| Attention: path | last of two | last of three | move back from the end of three |
| Executive: sequencing | two steps | three familiar steps | three steps including a prerequisite/obstacle |
| Executive: planning | identify a missing everyday tool | existing multi-item preparation tasks | resolve a stated constraint before acting |
| Executive: organisation | one category/object | two storage rules | two rules plus an irrelevant object |
| Memory: objects/pairs/order | two items | three | four |
| Memory: object–place | one association | two | three |
| Applied: bottle/ball rules | one need/attribute | satisfy two conditions | two conditions with competing near-matches |
| Applied: instruction | one placement step | take and place | two steps plus an irrelevant rule/object |
| Applied: school problem | simple familiar problem | familiar problem, more choices | explicit constraint: no sharpener, known location, replacement glue |

Memory exposure increases with load: 6.5–7.5 seconds in L1, 8–9 in L2,
9.5–10.5 in L3, depending on the family. Reading still stays within the original
45-word/14-word-sentence limits. Many binary/everyday tasks are intentionally
shared across levels; the levels are scaffolding, not a clinically calibrated scale.

## Meaningful variety and generated editorial examples

Maths grows from four to ten broad families: point counting, visual addition,
visual subtraction, more/less, selective shape counting, one-cookie-per-person
shortfall, combining different snacks, equal quantities, requested-number lookup
and number gaps. Plush-toy/doll arithmetic is removed. Basic addition/subtraction
families receive reduced selection weight.

Attention adds ordered-pattern comparison and a short path task. Executive adds
backpack gap checking, cue-based inhibition and goal-linked sequencing. Applied
adds school placement instructions, useful-object decisions and retrieval/opening
problems. Reading adds six who-did-what stories and six concrete inference stories;
Language adds six everyday action scenes. Name/object-heavy Reading and Language
families also receive lower weights.

| Domain | Representative generated example | Editorial interpretation |
| --- | --- | --- |
| Reading | Wind takes Ana's cap; Ana follows it → what does she want to retrieve? | Concrete inference grounded in the story, rather than abstract motivation. |
| Attention | `○ · □ · △ · ☆` model; match, reversed row, final-shape substitution | Perceptual ordering/near-match, with separate model and labelled rows. |
| Memory | School bag: book, pencil, notebook, bottle → recall an actual shown item | Coherent child context, illustrated labels and the same facts in Word. |
| Executive | Wet table; read there and put the book away → dry, read, store | Three necessary steps with a clear prerequisite. |
| Speed and reasoning | `○, □, ○, □, △, ○` → most frequent figure | Six units, unique maximum; evidence rejects ties/wrong answers. |
| Applied | Excursion bottle: full/open, full/closed, empty/closed → full and closed | Two concrete requirements; pictures and words encode the same states. |
| Maths | Three people, two cookies → one missing cookie | One-to-one shortfall, distinct from repeated toy-addition templates. |
| Language | Nora puts water in the plant pot → `Riega` | Everyday action vocabulary instead of another noun/name substitution. |

Generated pool counts, exhaustively validated at each level:

| Domain | Mechanics | Broad families | Rendered variants L1/L2/L3 | Semantic variants L1/L2/L3 |
| --- | ---: | ---: | --- | --- |
| Language | 3 | 5 | 66 / 66 / 66 | 35 / 35 / 35 |
| Maths | 4 | 10 | 33 / 37 / 56 | 25 / 31 / 38 |
| Reading | 3 | 8 | 108 / 108 / 108 | 42 / 42 / 42 |
| Attention | 4 | 7 | 44 / 44 / 60 | 44 / 44 / 60 |
| Executive | 4 | 7 | 35 / 44 / 40 | 21 / 30 / 26 |
| Memory | 4 | 4 | 44 / 44 / 44 | 40 / 40 / 40 |
| Speed and reasoning | 4 | 7 | 29 / 32 / 32 | 29 / 32 / 32 |
| Applied | 4 | 8 | 77 / 80 / 59 | 30 / 40 / 40 |
| **Total** | — | **56** | **436 / 455 / 465** | **266 / 294 / 313** |

These are not hundreds of independent pedagogical scenarios. A family is a broad
authored task/stimulus scaffold. Semantic keys remove names; arithmetic additionally
removes noun-only and distractor-only variation. Other object/colour variations
still count, so semantic totals remain upper bounds on substantial variety.

Selection balances families using the last twelve deliveries, rotates mechanics
where possible and excludes the previous family when an alternative remains.
Arithmetic noun substitutions no longer reset semantic novelty. History persists
between sessions; migration recognises previously delivered IDs when still present.
Within a worksheet semantic duplicates are prohibited, including at cycle boundaries.

Comparison with the previous branch snapshot, 100 deterministic seeds × 20 L2
activities per domain:

| Previously repetitive subset | Previous share | Current share | Mean distinct families, previous → current |
| --- | ---: | ---: | --- |
| Maths basic addition/subtraction | 62.45% | 29.30% | 4 → 10 |
| Reading noun/name-heavy families 0/4 | 70.00% | 28.25% | 6 → 8 |
| Language noun/name-heavy families 1/3 | 75.00% | 66.30% | 4 → 5 |

Finite pools still exhaust: reduced weights cannot manufacture new semantics once
smaller families are depleted. Language's remaining repetition is explicit above.

## Validation and reproduction

```sh
npm ci
npm test
python3 tests/browser-refinements.py
python3 tests/browser-smoke.py
python3 tests/browser-locales.py
node tests/editorial-audit.js > /tmp/early-refinement-editorial.json
node tests/locale-audit.js > /tmp/early-refinement-locales.json
```

Node ≥18; Python Playwright and Chromium at `/usr/bin/chromium` for browser checks.
The browser loads the actual index, patches, app, locale gates and DOCX exporter;
only the Supabase SDK/service boundary is simulated. External requests are blocked.
No production account or content bank is exercised.

- **42 Node tests passed, none failed/skipped**, including corruption tests,
  source-independent delivery/export checks, full country/level enumeration and
  actual DOCX/ZIP extraction. The generated matrix covers 1,356 level-specific
  entries, or 10,848 entries across seven countries plus international.
- **648 layout cases:** all 36 affected Maths/Attention/Executive/Memory/Applied
  families × three levels × widths 1920, 1440, 1280, 1024, 768, 390 at 100% zoom.
  Deterministic family fixtures provide full layout coverage; the actual level
  selector and outgoing request level are checked. No horizontal overflow, escaped
  content, squeezed SVGs or undersized answer controls; sequence workspace spans
  its answer container. Captures were visually reviewed, including the framed
  Attention model, prerequisite sequence, bottle states and four-object recall.
- The layout test also waits for actual four-object memory hiding, scores a
  canonical numeric answer, checks four older routes at desktop/mobile widths and
  downloads a real illustrated 20-question DOCX with complete stimulus/choices.
- Ordinary app selection: **80 consecutive early activities**, ten per domain,
  with reload after five; no semantic duplicate. Three complete 20-question early
  worksheets, quota/error fail-closed paths and four older remote DOCX routes.
- Locale browser matrix: **357 interactive activities and 35 real 20-question
  DOCX files**, seven countries × five age routes, covering all available domains.
  Local early and simulated remote older material pass through the existing locale
  rules. New captions and illustrations preserve canonical stimulus/answer identity.
- Restored-session tests generate five consecutive eight-activity sessions per
  domain, with distinct first twenty items, family rotation and no adjacent family
  repetition in the sampled runs. Repetition after finite-cycle exhaustion remains
  possible and is not described as unlimited novelty.

Browser captures/reports are temporary artifacts under `/tmp/early-refinement-*`,
`/tmp/early-primary-browser-audit.json` and `/tmp/spanish-locale-browser-audit.json`.
They are evidence for this branch, not for the Cloudflare production/preview bundle.

## Remaining editorial/usability limitations

- Language's two noun-heavy families still dominate long runs after small families
  exhaust. Further improvement requires more authored action/meaning families,
  rather than additional names or answer-option permutations.
- Some existing Reading inference and Applied thirst/hygiene tasks remain single
  underlying situations. Added stories reduce their early-session share but do not
  turn those families into independent scenarios.
- Applied bottle/ball two-condition tasks are similar between L2 and L3; several
  inhibition, vocabulary and everyday-object tasks also remain shared. Child
  testing is needed before claiming uniform or measured level progression.
- Illustrations aid recognition but do not eliminate reading. Colour-recall tasks
  retain literal colour words; greyscale printing and colour-vision accessibility
  still need an editorial decision. No claim of measured accessibility benefit.
- Browser coverage is Chromium with simulated service responses; live Supabase
  authentication, quotas/billing, Edge Function deployment, the full remote bank,
  Safari/Firefox and actual Word pagination/physical printing were not validated.
- Existing age/stimulus/locale gates remain authoritative. No new arbitrary SVG,
  remote image or unsupported worksheet activity has been permitted.

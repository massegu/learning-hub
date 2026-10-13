# Spanish locale integration review

Reviewed 2026-10-13 on `fix/early-primary-stimulus-integrity`, following
`bae9207` and `08b196d`. No merge, deployment, production function invocation,
or production Supabase data change was performed.

## Storage and actual content flow

The visible V16 country selector stores `accounts.content_locale` in Supabase.
`learner_profiles.locale` also exists: profile creation currently writes
`es_intl`, and historical profiles can carry another locale. Neither is a
browser-local country preference. `lh_current_profile` stores only the active
profile ID. Delivery history remains in profile progress.

Before this follow-up, V16 read/saved the account setting independently and
changed the country label. The main app did not read it during workspace loading,
did not send an explicit locale in exercise/worksheet requests, and did not
localize returned content. The 6–7 bank was largely neutral Spanish with some
Spain-specific words and `estáis`. The exporter had no regional boundary.
The Edge Function could independently consult the account row, but its source
and deployed behavior remain unavailable; that is not evidence of localization.

`js/locale-content.js` now defines the supported locales, explicit terminology,
grammar rules, and the shared content adaptation. `index.html` loads it before
the API, app, V16 patches and exporter. The flow is:

```text
API.getAccount → accounts.content_locale → API.contentLocale
V16 selector → API.saveContentLocale → same existing account column/controller

effective locale:
  saved account preference (including explicit es_intl)
  otherwise legacy profile.locale
  otherwise es_intl

exercise / navigation / guided session / worksheet request
  → requestForProfile captures effective locale and locale revision
  → request-learning-content payload includes locale + existing profile/kind fields
  → server success/authentication/quota response
  → EarlyContent.adaptResponse
      6–7: select local activities; other ages: retain remote activities
  → LocaleContent.localizeItem, recording locale/requested domain
  → existing ActivityModel.forDelivery for 6–7
  → existing delivery-history persistence
  → renderExercise repeats localization and the existing delivery gate

worksheet export
  → capture account locale in worksheet profile.contentLocale
  → all versions use the same request/selection/localization path
  → exporter localizes supplied items, including direct caller/remote items
  → existing validateBatch / canonical printable model
  → localize printable projection (including legacy generated icon labels)
  → DOCX / ZIP
```

The API transport still returns the function envelope; it does not display it.
The app and exporter are the source-independent text boundaries. Searches of
active scripts found one shared app content-request call site and one SDK
function invocation. Legacy backup files and unloaded exporter repairs are not
active alternate generation paths. All loaded V16 exporters continue to defer
to `WorksheetGenerator.integrityVersion: 1`.

Locale keys remain `es_es`, `es_mx`, `es_co`, `es_ar`, `es_cl`, `es_pa`, `es_cr`,
plus `es_intl`. Case-normalized hyphen aliases such as `es-MX` are accepted.
Unknown keys deliberately resolve to international Spanish, never an arbitrary
country. A saved international preference overrides a historical country profile.
With a null account preference, the active legacy profile supplies the selector
and content locale consistently.

Country changes clear stale exercise content and invalidate in-flight responses
and worksheet batches. They do not automatically generate another paid activity.
A failed preference save retains the previous locale. A late account read cannot
undo a newer selection. Sign-out clears the controller's account/profile locale.
Worksheet generation keeps the original profile/history object and takes a
separate export snapshot; it does not lose anti-repetition updates through cloning.

## Gaps closed without replacing the age/stimulus architecture

- Unified the previously separate visible account preference and content pipeline.
- Added post-selection adaptation for local and remote content, and mandatory
  adaptation for direct worksheet exports. A missing locale module fails export.
- Localized canonical text/list/table stimuli, legacy passages/scenarios/models,
  questions, choices, correct answers, order tokens/sequences, memory details,
  topics, explanations and rule-switch prompts. Numbers/booleans remain unchanged.
- HTML adaptation visits text nodes and display/accessibility attributes. It does
  not rewrite CSS classes, source URLs, data attributes, identifiers or icon keys.
  Split HTML noun phrases that leave definite gender disagreement are rejected.
- Applied the same changes to scored answer strings and their displayed stimuli.
  A mapping that collapses distinct choices/tokens is rejected before use.
- Preserved an English lesson's specimens/options/scoring, while adapting its
  Spanish questions/instructions/explanations. Recorded domain context survives
  export and cannot silently switch during a second adaptation.
- Added a sense declaration to the early fruit-classification family. Its intended
  banana now receives the right regional word without assuming every `plátano`
  means banana. The existing banana icon also establishes this sense. Printable
  projection adaptation handles the legacy renderer's otherwise Spain-only label.
- Kept source IDs, content keys, semantic anti-repetition keys, canonical stimulus
  structure and memory-evidence pointers intact. Existing age checks run **after**
  localization; regional wording must still satisfy their reading/load limits.

`js/content-policy.js` and `js/activity-model.js` are unchanged from `08b196d`.
The only early-bank addition is the fruit sense metadata; its mechanics, source
texts, stimuli, answers and IDs are unchanged before adaptation. Authentication,
subscription/quota checks, no-local-fallback behavior and batch-before-download
validation remain in place.

## Controlled terminology

These are preferred teaching terms for explicit, unambiguous senses, not a claim
that every alternative is incorrect in a whole country. Widely natural words such
as mochila, colegio, lápiz, cuaderno, merienda, pelota, fútbol and autobús stay
neutral. The rules are centralized and testable, not DOM-wide substitutions.

| Concept | Spain | Mexico | Colombia | Argentina | Chile | Panama | Costa Rica |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Writing pen | bolígrafo | pluma | esfero | lapicera | lápiz pasta | bolígrafo | lapicero |
| Marker | rotulador | marcador | marcador | marcador | marcador | marcador | marcador |
| Jacket | chaqueta | chamarra | chaqueta | campera | chaqueta | chaqueta | chaqueta |
| Sweatshirt | sudadera | sudadera | buzo | buzo | polerón | sudadera | sudadera |
| Swimwear | bañador | traje de baño | traje de baño | traje de baño | traje de baño | traje de baño | traje de baño |
| Flip-flops | chanclas | chanclas | sandalias | ojotas | chalas | chancletas | chancletas |
| Toy car | coche de juguete | carro de juguete | carro de juguete | auto de juguete | auto de juguete | carro de juguete | carro de juguete |
| Automobile | coche | auto | carro | auto | auto | carro | carro |
| Potato | patata | papa | papa | papa | papa | papa | papa |
| Juice | zumo | jugo | jugo | jugo | jugo | jugo | jugo |
| Peach | melocotón | durazno | durazno | durazno | durazno | durazno | durazno |
| Banana, declared sense only | plátano | plátano | banano | banana | plátano | guineo | banano |
| Water tap | grifo | llave del agua | llave del agua | canilla | llave del agua | llave del agua | llave del agua |
| Refrigerator | frigorífico | refrigerador | nevera | heladera | refrigerador | refrigerador | refrigerador |
| Computer | ordenador | computadora | computador | computadora | computador | computadora | computadora |
| Mobile phone | teléfono móvil | teléfono celular | teléfono celular | teléfono celular | teléfono celular | teléfono celular | teléfono celular |
| Purchase receipt | recibo de compra | recibo de compra | recibo de compra | recibo de compra | recibo de compra | recibo de compra | recibo de compra |
| Basketball | baloncesto | básquetbol | baloncesto | básquet | básquetbol | baloncesto | baloncesto |
| Swimming pool | piscina | alberca | piscina | piscina | piscina | piscina | piscina |

International uses the rules' explicit common forms, including bolígrafo, chaqueta,
sudadera, traje de baño, sandalias, auto de juguete, automóvil, papa, jugo, durazno,
banana when its sense is declared, llave del agua, refrigerador, computadora,
teléfono celular, recibo de compra, baloncesto and piscina.

The automobile rule accepts the unambiguous source `automóvil`, not every `coche`
or `carro`. Only the complete toy-car phrase is adapted as that object. Similarly,
the pen rule can produce Mexican `pluma` but never assumes a bird's pluma is a pen.
`Buzo` is not blindly reversed into a sweatshirt: it can mean a diver.
Suéter is not substituted for sudadera, because the garments can differ.
An unmarked plátano is retained until banana versus plantain/tree is established.
Neutral sandalias is accepted as the wider footwear term; narrower local garment
preferences need editorial confirmation, rather than guessed global replacements.

Known replacement-source regionalisms are normalized consistently across an item,
including its answer/explanation. Spain-only plural forms such as `estáis` and
`vosotros` are converted to `están` and `ustedes` outside Spain. Unhandled plural/
reflexive forms are rejected. `Coge/coger/cogió` use neutral `toma/tomar/tomó`
outside Spain; this avoids unreliable cross-region phrasing without declaring
the verb unacceptable everywhere in Latin America.

## Grammar, meaning and cases requiring reviewed variants

The rules explicitly handle singular/plural forms, initial/uppercase casing,
articles/demonstratives/quantifiers, `al/del` contractions, and a bounded set of
adjacent/predicate adjectives. Examples verified include:

- `un bolígrafo nuevo` → Mexico `una pluma nueva`;
- `¿Cuántos bolígrafos hay?` → Mexico `¿Cuántas plumas hay?`;
- `El grifo ya está abierto.` → Argentina `La canilla ya está abierta.`;
- `de la computadora` → Spain `del ordenador`;
- `Estáis jugando a las cartas.` → Latin American/international `Están jugando…`.

This is a controlled lexicon/grammar layer, not a general Spanish parser.
It cannot safely rename a noun in a spelling/rhyme/conjugation exercise or repair
every later pronoun. A transformed word-form task is rejected for an authored
regional version. Gender-changing nouns combined with recognized later object
pronouns are likewise rejected, rather than producing `la computadora… usarlo`.
Duplicate localized choices fail instead of silently changing the scoring.

Money amounts and currencies are never renamed or converted. Named foreign
currencies in monetary scenarios require `currencyContext: foreign` or an authored
local-currency version. Supported domestic codes are Spain EUR; Mexico MXN;
Colombia COP; Argentina ARS; Chile CLP; Panama USD/PAB; Costa Rica CRC.
An explicitly foreign lesson keeps its amounts through both item and printable
projection gates. The selector is not an exchange-rate operation. Bare `$` or
`pesos` cannot establish a country, and international makes no currency assumption.
History questions about Cristóbal Colón are not treated as monetary scenarios.

## Representative generated examples by country

The swimwear column comes from the actual generated early planning activity.
The pen and computer examples exercise representative remote-service fixtures;
they are not claimed as observed production returns. The fruit column is the
actual early classification activity's correct option for manzana/pera.

| Country | Early swimming material | Pen answer | Computer reference | Fruit answer |
| --- | --- | --- | --- | --- |
| Spain | el bañador, la toalla y las chanclas | El bolígrafo | Junto al ordenador | plátano |
| Mexico | el traje de baño, la toalla y las chanclas | La pluma | Junto a la computadora | plátano |
| Colombia | el traje de baño, la toalla y las sandalias | El esfero | Junto al computador | banano |
| Argentina | el traje de baño, la toalla y las ojotas | La lapicera | Junto a la computadora | banana |
| Chile | el traje de baño, la toalla y las chalas | El lápiz pasta | Junto al computador | plátano |
| Panama | el traje de baño, la toalla y las chancletas | El bolígrafo | Junto a la computadora | guineo |
| Costa Rica | el traje de baño, la toalla y las chancletas | El lapicero | Junto a la computadora | banano |

The underlying planning question and answer remain matched. Likewise a localized
memory place/person question still points to the same canonical row/cell as its
localized answer. Region changes are not additional pedagogical activity families.

Most early material is already neutral; there is no reason to force every
activity to look different in every country. The original pool remains
475 / 478 / 478 entries across levels, totaling 1,431. Exhaustive reporting lists
changed items per country/domain/level and examples from every family. Spain
retains the authored wording; neutral numerals, shapes and everyday language stay
the same wherever appropriate.

Level-1 entries whose rendered content changes (one item counts once even when
its stimulus, question and answer all change):

| Domain | Spain | Mexico | Colombia | Argentina | Chile | Panama | Costa Rica |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Language | 0 | 4 | 4 | 4 | 4 | 4 | 4 |
| Mathematics | 0 | 4 | 4 | 4 | 4 | 4 | 4 |
| Reading | 0 | 12 | 12 | 12 | 12 | 12 | 12 |
| Attention | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
| Executive functions | 0 | 7 | 7 | 7 | 7 | 7 | 7 |
| Memory | 0 | 5 | 5 | 5 | 5 | 5 | 5 |
| Speed/reasoning | 0 | 3 | 4 | 4 | 3 | 4 | 4 |
| Applied cognition | 0 | 2 | 2 | 2 | 2 | 2 | 2 |
| **Total / 475** | **0** | **38** | **39** | **39** | **38** | **39** | **39** |

Level-2/3 changed totals are 40/41 for Mexico and Chile, 41/42 for Colombia,
Argentina, Panama and Costa Rica, and 0/0 for Spain. International changes
39/41/42 across the three levels. Thus about 8–9% of the current early pool needs
regional edits. This is real adaptation wherever needed, not a claim that the
whole pool becomes country-specific or that lexical variation creates new content.

## Validation and reproducibility

```sh
npm ci
npm test
node tests/locale-audit.js > /tmp/spanish-locale-generated-audit.json
python3 -u tests/browser-locales.py
python3 -u tests/browser-smoke.py
```

Node ≥18, the pinned DOCX/JSZip dependencies, Python Playwright and Chromium at
`/usr/bin/chromium` are required. The browser loads the real entry point, app,
API, all active patches and exporter. Only the Supabase service boundary is
simulated, using the shared `tests/browser_support.py`; no real account is used.

- **33 Node tests passed**, zero failed/skipped. They cover country selection,
  account/profile precedence, aliases/unknown settings, country-specific terms,
  agreement and contractions, idempotence, raw local/remote parity, all scored
  fields, English protection, semantic-sense handling and rejection cases.
- **11,448 local entry/locale combinations**: all 1,431 entries at all three levels
  and eight domains, for seven countries plus international. Every localized item
  passes the unchanged early delivery/print contract, including memory evidence.
- **357 browser activities and 35 actual DOCX worksheets**: all seven countries,
  each with early, junior, primary, middle and teen routes. Per country: 10 early
  activities/8 available domains, 10 junior/8, 11 primary/11, 10 middle/10 and
  10 teen/10. Each route downloads a 20-question worksheet, for 700 printed items.
  Requests carry the country; buttons score the adapted answers; explanations
  match; XML retains every stimulus before its matching question and all choices/
  order steps. Known unintended mixed-region vocabulary and contraction errors
  were absent in these samples.
- Browser checks also cover account persistence across reload, failed preference
  saves, stale exercise responses, canceled worksheet batches, HTML attributes/
  identifiers and split-phrase rejection, and intentional foreign-currency context.
- **Original integration regression passed**: 80 early activities, ten consecutive
  per domain with reloads and actual memory timers; three complete early worksheets;
  representative remote content/worksheets for all four older routes; quota/error
  handling; alternate-source rejection and new-profile creation.
- Direct exporter tests additionally download documents for every country with
  both raw local early and raw remote older items, despite a stale profile locale.
  Missing localization, wrong-country batches and invalid stimuli fail before any
  download. A real foreign-currency DOCX preserves the original amount/context.
- JavaScript/Python syntax and `git diff --check` pass.

Generated findings and browser captures are reproducible at
`/tmp/spanish-locale-generated-audit.json` and
`/tmp/spanish-locale-browser-audit.json`. They are diagnostic artifacts, not a
replacement for this report or production-bank access.

## Remaining editorial and integration limits

1. **Remote-bank verification:** the deployed Edge Function and its source bank
   remain unavailable. The country/age/domain matrix uses deliberate representative
   service fixtures for older ages. It proves the actual client path, not the
   quality or complete compatibility of every live remote exercise. The function
   may ignore the new locale hint; the client still applies the rules after success.
2. **Unmarked polysemy:** plátano, pluma, buzo, coche/carrito, shopping tickets and
   similar ambiguous terms need source sense/context. Untagged regional free text
   cannot be certified by a finite dictionary. Declare meaning or author a reviewed
   variant instead of adding broader replacements. Unknown syntax/long-distance
   agreement remains an editorial responsibility beyond the detected rejection cases.
3. **Register:** country terms use a consistent neutral educational register.
   Argentina/Costa Rica voseo and local usted/tú preferences are not automatically
   synthesized. Child-facing voseo needs complete authored grammar, not isolated
   imperative edits that could corrupt third-person story verbs.
4. **Country-specific contexts:** currency/shop scenarios requiring domestic facts,
   transport systems, regional food meanings and narrower garment distinctions need
   authored local content. Numeric, currency, timetable or price facts are not
   invented by the client. Some remote activities can therefore be rejected until
   reviewed variants/explicit foreign context exist.
5. **Opaque media:** text fields and supported HTML text are covered; words baked
   into image pixels or CSS-generated content cannot be adapted by this layer.
   Those assets need locale-specific source variants and review. Unknown visual
   printable components still fail the existing stimulus-integrity gate.
6. **Production and concurrency:** this branch is not deployed. Live DB/auth/billing
   behavior and cross-device simultaneous preference/history coordination were not
   exercised. A completed export uses its captured locale consistently; changing
   the selector during file packing does not relabel an already-started document.
7. **Pedagogy:** this does not expand the 39 activity families or resolve the earlier
   usability/editorial limitations. The exhaustive checks and browser samples are
   not a replacement for review by local educators and testing with children.

No new authorization, billing, database schema or deployment mechanism was added.

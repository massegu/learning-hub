---
name: gliax-development
description: Use for any GLIAX development, QA, educational activity design, cognitive exercise correction, frontend/backend coordination, Supabase Edge, Cloudflare staging, worksheets or professional progress dashboards in the learning-hub repository. Applies repository-specific safety, pedagogy, regression and economical Codex workflow.
---

# GLIAX Development

GLIAX is an educational and cognitive-practice product in a multi-application repository. Work only on the requested GLIAX scope. Read root `AGENTS.md` and the relevant references in this skill. Do not assume a clinical diagnosis from performance or describe a score as evidence of improvement without comparable measurements.

## Efficient task sequence

1. Confirm base commit, current branch, target environment and required output. Identify existing implementation and tests before proposing edits.
2. Turn the request into a short acceptance matrix: observed issue, intended behavior, code locations, test and backward-compatibility risk. Group dependent changes; avoid speculative rewrites.
3. If a feature crosses frontend and Edge, enumerate its request/response contract, `client_revision`, persisted fields, quotas and expected validation. Change the minimum set of files and maintain matching source where necessary.
4. Implement in small coherent stages. Run targeted Node tests first, browser tests for interactions/layout, and broader regressions only after targeted checks pass. Use synthetic accounts and content.
5. Summarize evidence per criterion: tested locally / tested hosted / pending manual review. Record unresolved uncertainty without repeated blind retries.
6. Never push, merge, deploy, run SQL migrations or modify payment/security settings unless explicitly in scope. See `references/deployment.md`.

## Domain rules

- Separate cognitive construct, presentation context, response modality, difficulty and scoring. A digital interface is a context, not by itself a cognitive construct.
- A valid open-ended answer must not be marked wrong merely because it is outside a narrow whitelist. Distinguish `correct`, `incorrect` and `unverifiable`; the last must not count as an error. Avoid LLM grading as an unreviewed authority.
- Avoid diagnostic inferences; compare performance only when family, level, measurement version and scoring criteria are compatible.
- Preserve historical IDs, saved favorites, completed activity records, exports and account ownership. Version changes to scoring/metrics.
- Prioritize clarity and age-appropriate cognitive load. Do not show internal labels like "simulación" to learners unless they serve a task. Maintain keyboard accessibility, screen-reader labels, touch targets and reduced motion.
- For an R19 implementation, consult `references/r19-acceptance.md` and `references/architecture.md`. For design work, load `../frontend-design/SKILL.md` while retaining GLIAX-specific accessibility and pedagogical rules.

## Reporting and cost control

Use one concise implementation plan and a single focused work cycle where practical. Avoid multiple parallel subagents, repetitive full-repository scans, unnecessary refactors and large logs. Report modified paths, tests run, limitations, branch and commit. Never equate fewer tokens with proven lower cost; measure observed usage when available.

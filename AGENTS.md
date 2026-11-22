# Repository instructions for Codex

This repository contains more than one application. Determine the requested product, branch, environment and affected paths before editing. Never assume every file belongs to GLIAX.

## Safety and scope
- Do not alter `main`, `desarrollo`, billing/Stripe, production Supabase, or production Cloudflare without explicit authorization. A task mentioning staging is not permission to deploy.
- Prefer a fresh topic branch based on the explicitly agreed commit; never merge, push, deploy or open a PR without checking the requested scope. Preserve unrelated work and historical identifiers.
- Never commit keys, credentials, user data or patient/child data. Use synthetic fixtures. Do not weaken authentication, RLS, CSP or authorization to make tests pass.
- Inspect existing instructions, architecture, migrations, tests and historical contracts before implementing. Prefer a minimal diff and focused validation over broad rewrites.
- If a proposed operation may trigger GitHub Actions or deployment, report that risk and use the least intrusive route.

## GLIAX tasks only
When the task concerns GLIAX (cognitive/educational exercises, professionals, profiles, worksheets, progress, `gliax-staging`, `request-learning-content`), use the repo skill at `.agents/skills/gliax-development/SKILL.md`. Its specific rules take precedence over generic design suggestions for GLIAX.
Use `.agents/skills/frontend-design/SKILL.md` only when visual design or interface implementation actually benefits; it never authorizes changing pedagogical correctness, permissions or data contracts.

## Completion
Report changed files, targeted test results, residual risks, commit and branch. Distinguish locally verified behavior from hosted staging and production. Never claim a deployment or remote verification that was not performed.

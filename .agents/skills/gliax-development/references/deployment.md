# Staging, deployment and rollback

Historical verified anchors as of November 2026 (recheck live state before action):
- GitHub GLIAX R18 commit `cb449c7cf463b5927acdba8f72ef24791a23ac1f`, branch `revision/gliax-refinamiento-qa`.
- Staging Supabase project `wejcfaralctolzxjbcil`, Edge Function `request-learning-content`, JWT enabled. R18 hosted Edge version 5 after coordinated deployment.
- Staging Cloudflare Pages project `gliax-staging`, canonical URL `https://gliax-staging.pages.dev`. It is NOT commercial production; the Pages UI labels its own main deployment "Production".
- Pages build command: `npm ci --ignore-scripts --include=dev && python3 tools/staging/build_cloudflare.py`. Output: `dist-gliax-staging`.
- Staging build vars: `GLIAX_STAGING_REF`, `GLIAX_STAGING_ORIGIN`, `GLIAX_STAGING_PUBLISHABLE_KEY`. Never echo actual keys.
- Automatic Pages deploys were disabled. Never enable them as a side effect.
- Prior frontend rollback anchor: `262f1b44cbda4dfb17e5093f8591e6b7842d38ed`. Recheck project deployments before reverting.

## Deployment gate

Do not deploy without specific authorization. Before any authorized staging update: check exact commit, build and test output, backend compatibility, safe rollback snapshot, environment ref, disabled billing, no production keys, JWT and CSP. After deployment verify actual hosted response, authentication, quotas, exercises, export paths and errors using synthetic data. If remote verification is unavailable, report it as unverified rather than claiming success.

Never touch `main`, production Supabase, Stripe, commercial production Cloudflare, or other product environments from a GLIAX staging task.

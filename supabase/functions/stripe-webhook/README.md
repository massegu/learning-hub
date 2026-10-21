# Stripe billing endpoint

Single-file function, ready for the Supabase Code editor: `index.ts`.

- Stripe sends its five signed events to `/functions/v1/stripe-webhook` without query parameters.
- The authenticated app invokes the SAME function with `{action:"checkout", mode:"test"}` or `{action:"portal", mode:"test"}`. The action cannot choose a customer, account, amount, price or return URL. A valid user JWT is checked with Supabase Auth for every action.
- Set this function's gateway **Verify JWT to OFF**. Stripe does not send a user JWT; the function verifies its HMAC signature. Keep JWT verification ON for `request-learning-content`.
- Apply `supabase/migrations/202610210001_billing_integrity.sql` first. Do not merge the new frontend before the database/function and secrets are installed and checked.

## Server secrets

| Name | Test setting |
| --- | --- |
| `STRIPE_MODE` | `test` |
| `STRIPE_SECRET_KEY` | Secret key of THIS Stripe sandbox, starting `sk_test_…`. Never put it in frontend/Git/chat. |
| `STRIPE_WEBHOOK_SECRET` | Existing destination's signing secret, starting `whsec_…`; a different secret is required for a different destination. |
| `STRIPE_PRICE_ID` | Approved recurring price ID `price_…` from THIS sandbox. |
| `BILLING_APP_URL` | Exact full HTTPS address of the app, e.g. `https://pruebas.learning-hub-5n9.pages.dev/`. It fixes return URLs and the allowed browser origin. |

Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Do not replace them. The plan is currently pinned to the price shown by the app: **19.99 EUR final monthly price, inclusive tax behaviour, quantity one**. Checkout verifies the Price object before creating a session, rejects exclusive/unspecified tax behaviour and unexpected totals, and disables adaptive currency pricing to keep the charge in EUR. This does not configure tax registrations/rates or enable Stripe Tax: the applicable treatment and receipt breakdown must still be configured and tested before live billing. A different amount/currency/interval requires a reviewed plan/UI change, not just a new environment variable.

API requests explicitly use `2026-08-26.dahlia`, matching the destination supplied by the owner. New invoice references use `parent.subscription_details.subscription`; subscription periods use the matched subscription item's `current_period_end`. Older shapes remain readable for existing data.

## Behaviour

Only a current, active subscription to the approved price with a paid latest invoice and a future period end grants `active`. A `checkout.session.completed` event or a browser return cannot grant access on its own. Stripe trials are not enabled: Learning Hub retains its existing app trial. Checkout currently accepts cards, including 3DS; asynchronous payment methods are not enabled.

Server-created checkout attempts bind a session to its authenticated owner and are reused on retry. New subscriptions need proof of that attempt. Existing subscriptions already linked in `accounts` can reconcile without a new attempt, but still require the correct Stripe customer, mode, price and current payment state. Old Payment Links cannot activate NEW accounts under the replacement webhook: use fresh server-created Checkout for tests.

Per-account expiring database leases serialize notification processing across Edge instances. Stripe is read AFTER acquiring the lease; delayed events reconcile the current state rather than replaying old transitions. An atomic SQL function updates the account and records the processed event together. Duplicates are acknowledged; concurrent work, failed Stripe reads or failed database writes return a non-2xx response for retry. An expired lease holder cannot commit.

A canceled or incomplete-expired subscription is terminal; its delayed events cannot replace a newer subscription. Changing to an unauthorized price removes full paid access. Canceling renewal preserves access while Stripe says active and the paid period remains valid. When Stripe says canceled or incomplete-expired, the app records `cancelled` and permits a fresh subscription.

Existing reduced quotas for `past_due` and `cancelled` remain unchanged (10/1/10 and 1/1/1 for exercise/worksheet/game). Full access is not the same as those reduced quotas. Refunds do not automatically cancel a Stripe subscription; if access must end, cancel the subscription too and verify the resulting event. This is the current policy to confirm during business acceptance tests.

## Install manually, then publish the frontend

See `docs/stripe-test-installation.md`. The normal GitHub content workflow does **not** apply this SQL, install this function, set secrets or activate live billing. No live deployment or real payment was performed while preparing these changes.

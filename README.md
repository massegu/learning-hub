# Learning Hub V14

V14 focuses on reliability, meaningful difficulty, reduced repetition and a simpler international-Spanish UX.

## Changes
- Pressing Enter in email/password signs in.
- Country selector removed from learner UX; content defaults to neutral international Spanish.
- Existing locale field remains in the database for future optional localization.
- Attention no longer uses the fragile icon-counting mechanic; it favors functional search, scenes, double criteria, rule changes and relevance filtering.
- Executive Functions now have intentionally distinct difficulty bands:
  - Level 1: sequencing.
  - Level 2: prioritization, distractors, monitoring and estimation.
  - Level 3: multiple constraints, dependencies, replanning, uncertainty and risk.
- Stronger anti-repetition across generated domains.
- Expanded Attention, Language and Executive-Function content.
- Supabase backend request-learning-content version 15.

## Payments
Stripe test-mode integration is the next integration step. Do not place Stripe secret keys in frontend files. Use a server-side Edge Function + Stripe Checkout/webhooks.


## Stripe test integration
V15 añade el flujo de suscripción de prueba de Learning Hub (25 EUR/mes) con Stripe Managed Payments. El checkout y el portal de cliente son alojados por Stripe. El webhook de Supabase sincroniza estados de suscripción. Antes de probar el webhook, configura en Supabase el secreto `STRIPE_WEBHOOK_SECRET` con el signing secret del endpoint de Stripe del entorno de prueba.

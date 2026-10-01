# Learning Hub V8 — Supabase integration

V8 moves Learning Hub from a browser-only prototype to the first cloud-backed product version.

## What changed

- Supabase email/password authentication.
- Learner profiles stored in Supabase.
- Progress and exercise results synchronized to Supabase.
- Seven-day trial/account status prepared for Stripe.
- Exercise banks are no longer shipped in the browser bundle.
- Content is delivered on demand through the authenticated `request-learning-content` Supabase Edge Function.
- Trial protection: 30 online exercises/day, 2 printable worksheets/day and 30 game rounds/day.
- Attention and Executive Functions are now first-class training areas.
- Printable worksheets can include attention and executive-function activities adapted to the age band.
- Game Lab now uses interactive cognitive mechanics: Go/No-Go, Stroop/interference, sequence memory, rule switching, visual search and planning.

## Deployment

This folder is ready to be uploaded to a new GitHub branch (recommended branch: `supabase-integration`). Do not replace `main` until V8 has been tested.

The frontend uses the Supabase publishable key in `js/config.js`. This key is intended for browser use. Never place a Supabase service-role key in frontend files.

## Supabase backend already configured

Project: `Learning_Hub`

Existing backend components include:
- `accounts`
- `learner_profiles`
- `exercise_results`
- RLS policies
- account creation trigger
- `request-learning-content` Edge Function

## Trial limits in this V8

- 30 online exercises/day
- 2 printable worksheets/day
- 30 cognitive game rounds/day

These are product defaults for testing and can be changed later.


## V8.1
- Nivel inicial seleccionable al crear cada perfil.
- Nivel ajustable manualmente por area.
- Atención muestra el enunciado antes de los estimulos.
- Game Lab evita repetir las dos mecanicas mas recientes.
- Se elimina el panel lateral de progresion en ejercicios.

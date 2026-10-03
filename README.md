# Learning Hub V13 — Quality leveling

V13 focuses on bringing all training areas closer to the level of challenge and variety already achieved in Memory, Reasoning, Social Lab and Writing.

## Main changes

- Stronger anti-repetition for generated cognitive content: recent items and recent mechanics are tracked separately.
- Attention expanded beyond counting icons: intruders, following instructions, spatial position, double criteria, table search, filtering, rule changes and exact comparison.
- Fixed the visual collision that could render target and distractor with the same icon in attention tasks.
- Language rebuilt around functional comprehension and reasoning: main idea, cohesion, inference, ambiguity, register, evidence, implicit meaning, source evaluation, argumentation and contradiction detection.
- Cognition Applied expanded with additional planning, reprioritisation, parallel-task, information-value and error-analysis scenarios.
- Social Lab expanded with context, clarification, partial-information and social-norm reasoning.
- Existing V12 validation remains active: unique options, valid correct answer, multi-select consistency and unique visual-pattern match.
- International Spanish profile/localisation support remains active.
- Game Lab remains removed.

## Backend

Supabase Edge Function `request-learning-content` is deployed separately from the frontend bundle. V13 requires the corresponding backend version.

## Deployment

Upload this bundle to the `supabase-integration` branch for testing. Do not merge to `main` until the content audit is complete.

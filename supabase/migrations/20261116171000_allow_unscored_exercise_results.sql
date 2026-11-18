-- Guided-wait intervals are observed completions, not correct/incorrect answers.
-- Keep historical values as-is and allow new unscored result rows to use NULL.
begin;
alter table public.exercise_results alter column correct drop not null;
commit;

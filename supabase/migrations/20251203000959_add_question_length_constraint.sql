-- migration: add_question_length_constraint
-- purpose: add check constraint for question length (1000-10000 characters)
-- affected tables: flashcards
-- notes: 
--   - question must be between 1000 and 10000 characters
--   - this ensures questions are substantial enough for meaningful learning

-- ============================================================================
-- add check constraint for question length
-- ============================================================================

-- add check constraint to validate question length
-- question must be between 1000 and 10000 characters
alter table public.flashcards
add constraint check_question_length check (
  length(question) >= 1000 and length(question) <= 10000
);


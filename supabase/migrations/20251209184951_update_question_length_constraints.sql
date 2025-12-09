-- migration: update_question_length_constraints
-- purpose: change question length constraints from 1000-10000 to 50-500 characters
-- affected tables: flashcards, flashcard_proposals
-- notes: 
--   - questions should be concise and focused (50-500 characters)
--   - this is more standard for flashcard applications
--   - existing data that violates new constraints will be removed/updated

-- ============================================================================
-- Step 1: Remove existing constraints (to allow data cleanup)
-- ============================================================================

-- drop existing constraint for flashcards table
ALTER TABLE public.flashcards
DROP CONSTRAINT IF EXISTS check_question_length;

-- drop existing constraint for flashcard_proposals table
ALTER TABLE public.flashcard_proposals
DROP CONSTRAINT IF EXISTS check_proposal_question_length;

-- ============================================================================
-- Step 2: Clean up existing data that violates new constraints
-- ============================================================================

-- Delete proposals with questions that don't meet new length requirements
-- (These are just proposals, not accepted flashcards, so safe to delete)
DELETE FROM public.flashcard_proposals
WHERE length(question) < 50 OR length(question) > 500;

-- For flashcards table: truncate questions that are too long (keep first 500 chars)
-- or delete if too short (less than 50 chars)
-- Note: This is more aggressive, but flashcards should already be validated
UPDATE public.flashcards
SET question = LEFT(question, 500)
WHERE length(question) > 500;

DELETE FROM public.flashcards
WHERE length(question) < 50;

-- ============================================================================
-- Step 3: Add new constraints with shorter length requirements
-- ============================================================================

-- add new constraint for flashcards table
ALTER TABLE public.flashcards
ADD CONSTRAINT check_question_length CHECK (
  length(question) >= 50 AND length(question) <= 500
);

-- add new constraint for flashcard_proposals table
ALTER TABLE public.flashcard_proposals
ADD CONSTRAINT check_proposal_question_length CHECK (
  length(question) >= 50 AND length(question) <= 500
);


-- migration: update_question_length_min_to_2
-- purpose: decrease minimum question length from 50 to 2 characters
-- affected tables: flashcards, flashcard_proposals
-- notes: 
--   - questions can now be between 2-10000 characters (allows single words in foreign languages)
--   - this enables creating flashcards with just one word (e.g., "cat" -> "kot" for language learning)

-- ============================================================================
-- Step 1: Remove existing constraints (to allow constraint update)
-- ============================================================================

-- drop existing constraint for flashcards table
ALTER TABLE public.flashcards
DROP CONSTRAINT IF EXISTS check_question_length;

-- drop existing constraint for flashcard_proposals table
ALTER TABLE public.flashcard_proposals
DROP CONSTRAINT IF EXISTS check_proposal_question_length;

-- ============================================================================
-- Step 2: Add new constraints with decreased minimum length (2 characters)
-- ============================================================================

-- add new constraint for flashcards table
ALTER TABLE public.flashcards
ADD CONSTRAINT check_question_length CHECK (
  length(question) >= 2 AND length(question) <= 10000
);

-- add new constraint for flashcard_proposals table
ALTER TABLE public.flashcard_proposals
ADD CONSTRAINT check_proposal_question_length CHECK (
  length(question) >= 2 AND length(question) <= 10000
);


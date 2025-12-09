-- migration: update_question_length_to_10000
-- purpose: increase maximum question length from 500 to 10000 characters
-- affected tables: flashcards, flashcard_proposals
-- notes: 
--   - questions can now be between 50-10000 characters (more flexible)
--   - allows for longer, more detailed questions when needed

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
-- Step 2: Add new constraints with increased maximum length (10000 characters)
-- ============================================================================

-- add new constraint for flashcards table
ALTER TABLE public.flashcards
ADD CONSTRAINT check_question_length CHECK (
  length(question) >= 50 AND length(question) <= 10000
);

-- add new constraint for flashcard_proposals table
ALTER TABLE public.flashcard_proposals
ADD CONSTRAINT check_proposal_question_length CHECK (
  length(question) >= 50 AND length(question) <= 10000
);


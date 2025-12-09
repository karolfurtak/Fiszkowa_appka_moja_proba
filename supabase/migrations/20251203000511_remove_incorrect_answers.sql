-- migration: remove_incorrect_answers
-- purpose: remove incorrect_answers column from flashcards table
-- affected tables: flashcards
-- notes: 
--   - flashcards will now only show the correct answer
--   - this simplifies the flashcard structure and removes multiple choice format

-- ============================================================================
-- remove incorrect_answers column
-- ============================================================================

-- drop the incorrect_answers column from flashcards table
-- this removes the multiple choice format, leaving only question and correct answer
alter table public.flashcards drop column if exists incorrect_answers;


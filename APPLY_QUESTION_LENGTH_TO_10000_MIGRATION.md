# Instrukcje: Aktualizacja maksymalnej długości pytań do 10000 znaków

## Problem
Zwiększenie maksymalnej długości pytań z 500 do 10000 znaków, aby umożliwić generowanie bardziej szczegółowych pytań dla złożonych tematów.

## Rozwiązanie: Zastosowanie migracji przez Supabase Dashboard

### Krok 1: Otwórz Supabase Dashboard
1. Przejdź do: https://supabase.com/dashboard/project/lfogeotxmdekvfstkais
2. Kliknij **SQL Editor** w lewym panelu

### Krok 2: Zastosuj migrację
Skopiuj i wklej poniższy SQL do SQL Editor, a następnie kliknij **RUN**:

```sql
-- migration: update_question_length_to_10000
-- purpose: increase maximum question length from 500 to 10000 characters
-- affected tables: flashcards, flashcard_proposals

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
```

### Krok 3: Weryfikacja
Uruchom to zapytanie, aby sprawdzić, czy constraint został zaktualizowany:

```sql
-- Sprawdź constraint dla flashcard_proposals
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.flashcard_proposals'::regclass
  AND conname = 'check_proposal_question_length';

-- Sprawdź constraint dla flashcards
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.flashcards'::regclass
  AND conname = 'check_question_length';
```

Oczekiwany wynik powinien pokazać:
- `length(question) >= 50 AND length(question) <= 10000`

### Krok 4: Wdróż zaktualizowaną Edge Function
Po zastosowaniu migracji, wdróż zaktualizowaną Edge Function:

```powershell
npx supabase functions deploy generate-flashcards --project-ref lfogeotxmdekvfstkais
```

### Krok 5: Przetestuj ponownie
Po zastosowaniu migracji i wdrożeniu Edge Function, uruchom ponownie zapytanie w Postman lub użyj skryptu:

```powershell
.\test-openrouter.ps1
```

## Uwagi

- **Migracja jest bezpieczna** - tylko zwiększa maksymalną długość, nie usuwa danych
- **Istniejące dane pozostają nienaruszone** - wszystkie pytania < 10000 znaków będą działać poprawnie
- **Edge Function została zaktualizowana** - teraz generuje pytania w zakresie 50-10000 znaków
- **Elastyczność** - AI może teraz generować zarówno krótkie pytania (50-500 znaków) dla prostych faktów, jak i długie, szczegółowe pytania (do 10000 znaków) dla złożonych scenariuszy


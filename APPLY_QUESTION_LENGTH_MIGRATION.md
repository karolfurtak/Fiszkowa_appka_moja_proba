# Instrukcje: Aktualizacja ograniczeń długości pytań

## Problem
Błąd: `violates check constraint "check_proposal_question_length"`

Baza danych nadal ma stare ograniczenie (1000-10000 znaków), a Edge Function generuje teraz krótsze pytania (50-500 znaków).

## Rozwiązanie: Zastosowanie migracji przez Supabase Dashboard

### Krok 1: Otwórz Supabase Dashboard
1. Przejdź do: https://supabase.com/dashboard/project/lfogeotxmdekvfstkais
2. Kliknij **SQL Editor** w lewym panelu

### Krok 2: Sprawdź istniejące dane (opcjonalnie)
Przed zastosowaniem migracji, możesz sprawdzić, jakie dane naruszają nowe ograniczenia:

```sql
-- Sprawdź propozycje z nieprawidłową długością pytań
SELECT 
    id,
    length(question) as question_length,
    LEFT(question, 100) as question_preview,
    status
FROM public.flashcard_proposals
WHERE length(question) < 50 OR length(question) > 500;

-- Sprawdź fiszki z nieprawidłową długością pytań
SELECT 
    id,
    length(question) as question_length,
    LEFT(question, 100) as question_preview,
    status
FROM public.flashcards
WHERE length(question) < 50 OR length(question) > 500;
```

### Krok 3: Zastosuj migrację
Skopiuj i wklej poniższy SQL do SQL Editor, a następnie kliknij **RUN**:

**UWAGA:** Ta migracja usunie wszystkie propozycje (`flashcard_proposals`), które nie spełniają nowych wymagań (50-500 znaków). Są to tylko propozycje, nie akceptowane fiszki, więc jest to bezpieczne.

```sql
-- migration: update_question_length_constraints
-- purpose: change question length constraints from 1000-10000 to 50-500 characters
-- affected tables: flashcards, flashcard_proposals

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
```

### Krok 4: Weryfikacja
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
- `length(question) >= 50 AND length(question) <= 500`

### Krok 5: Przetestuj ponownie
Po zastosowaniu migracji, uruchom ponownie zapytanie w Postman lub użyj skryptu:

```powershell
.\test-openrouter.ps1
```

## Alternatywa: Zastosowanie przez Supabase CLI

Jeśli masz skonfigurowany Supabase CLI lokalnie:

```powershell
npx supabase db push --project-ref lfogeotxmdekvfstkais
```

To zastosuje wszystkie oczekujące migracje, w tym `20251209184951_update_question_length_constraints.sql`.

## Uwagi

- **Migracja usuwa nieprawidłowe propozycje** - wszystkie rekordy w `flashcard_proposals` z pytaniami < 50 lub > 500 znaków zostaną usunięte (są to tylko propozycje, nie akceptowane fiszki)
- **Migracja aktualizuje fiszki** - fiszki z pytaniami > 500 znaków zostaną skrócone do 500 znaków, a te < 50 znaków zostaną usunięte
- **Migracja jest bezpieczna** - używa `DROP CONSTRAINT IF EXISTS`, więc nie spowoduje błędu, jeśli constraint nie istnieje
- **Po migracji** Edge Function będzie generować tylko pytania 50-500 znaków, więc problem nie powinien się powtórzyć


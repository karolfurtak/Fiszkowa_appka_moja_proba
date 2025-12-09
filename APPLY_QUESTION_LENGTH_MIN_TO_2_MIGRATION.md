# Zastosowanie migracji: Zmiana minimalnej długości pytania z 50 na 2 znaki

## Opis migracji

Ta migracja zmniejsza minimalną długość pytania (question) z 50 do 2 znaków w tabelach `flashcards` i `flashcard_proposals`. 
Pozwala to na tworzenie fiszek z pojedynczymi słowami w językach obcych (np. "cat" → "kot").

## Krok 1: Otwórz SQL Editor w Supabase Dashboard

1. Zaloguj się do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt
3. Przejdź do **SQL Editor** (w menu po lewej stronie)
4. Kliknij **New query**

## Krok 2: Skopiuj i wykonaj poniższy SQL

Skopiuj cały poniższy kod SQL i wklej go do SQL Editora, następnie kliknij **Run** (lub naciśnij Ctrl+Enter):

```sql
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
```

## Krok 3: Weryfikacja

Po wykonaniu migracji, możesz zweryfikować, że constrainty zostały zaktualizowane:

```sql
-- Sprawdź constraint dla tabeli flashcards
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.flashcards'::regclass
  AND conname = 'check_question_length';

-- Sprawdź constraint dla tabeli flashcard_proposals
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.flashcard_proposals'::regclass
  AND conname = 'check_proposal_question_length';
```

Oczekiwany wynik powinien pokazywać:
- `length(question) >= 2 AND length(question) <= 10000`

## Uwagi

- **Bezpieczeństwo**: Ta migracja nie usuwa żadnych danych - tylko zmienia constrainty
- **Istniejące dane**: Wszystkie istniejące fiszki z pytaniami >= 2 znaków będą nadal działać
- **Nowe fiszki**: Od teraz można tworzyć fiszki z pytaniami od 2 znaków (np. pojedyncze słowa)

## Testowanie

Po zastosowaniu migracji, możesz przetestować endpoint `/api/flashcards` z krótkim pytaniem:

```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "deck_id": 1,
    "flashcards": [
      {
        "front": "cat",
        "back": "kot",
        "source": "manual",
        "generation_id": null
      }
    ]
  }'
```

Powinno działać bez błędów walidacji.


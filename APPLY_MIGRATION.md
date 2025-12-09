# Instrukcje: Zastosowanie migracji flashcard_proposals

## Problem
Tabela `flashcard_proposals` nie istnieje w produkcyjnej bazie danych Supabase, co powoduje błąd 500 podczas zapisywania flashcards.

## Rozwiązanie: Zastosowanie migracji przez Supabase Dashboard

### Krok 1: Otwórz Supabase Dashboard
1. Przejdź do: https://supabase.com/dashboard/project/lfogeotxmdekvfstkais
2. Kliknij **SQL Editor** w lewym panelu

### Krok 2: Sprawdź zależności (opcjonalnie)
Uruchom to zapytanie, aby sprawdzić, czy wszystkie zależności istnieją:

```sql
-- Sprawdź, czy tabela profiles istnieje
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as profiles_exists;

-- Sprawdź, czy funkcja handle_updated_at istnieje
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'handle_updated_at'
) as function_exists;
```

### Krok 3: Zastosuj migrację
Skopiuj i wklej poniższy SQL do SQL Editor, a następnie kliknij **RUN**:

```sql
-- migration: create_flashcard_proposals
-- purpose: create flashcard_proposals table for temporary AI-generated proposals

-- ============================================================================
-- custom enum type for proposal status
-- ============================================================================

-- create enum type for proposal status (if not exists)
DO $$ BEGIN
  CREATE TYPE public.proposal_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- table: flashcard_proposals
-- ============================================================================

-- create flashcard_proposals table
CREATE TABLE IF NOT EXISTS public.flashcard_proposals (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question text NOT NULL,
  correct_answer text NOT NULL,
  image_url text,
  domain text,
  generation_session_id text,
  status public.proposal_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- check constraint to validate question length
  CONSTRAINT check_proposal_question_length CHECK (
    length(question) >= 50 AND length(question) <= 500
  ),
  -- check constraint to validate image_url format if provided
  CONSTRAINT check_proposal_image_url_format CHECK (
    image_url IS NULL OR 
    image_url ~* '^https?://[^\s/$.?#].[^\s]*$'
  )
);

-- enable row level security
ALTER TABLE public.flashcard_proposals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Drop existing policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "authenticated_users_can_view_own_proposals" ON public.flashcard_proposals;
DROP POLICY IF EXISTS "authenticated_users_can_create_own_proposals" ON public.flashcard_proposals;
DROP POLICY IF EXISTS "authenticated_users_can_update_own_proposals" ON public.flashcard_proposals;
DROP POLICY IF EXISTS "authenticated_users_can_delete_own_proposals" ON public.flashcard_proposals;
DROP POLICY IF EXISTS "anon_users_cannot_view_proposals" ON public.flashcard_proposals;
DROP POLICY IF EXISTS "anon_users_cannot_create_proposals" ON public.flashcard_proposals;
DROP POLICY IF EXISTS "anon_users_cannot_update_proposals" ON public.flashcard_proposals;
DROP POLICY IF EXISTS "anon_users_cannot_delete_proposals" ON public.flashcard_proposals;

-- authenticated users can view their own proposals
CREATE POLICY "authenticated_users_can_view_own_proposals"
ON public.flashcard_proposals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- authenticated users can create proposals for themselves
CREATE POLICY "authenticated_users_can_create_own_proposals"
ON public.flashcard_proposals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- authenticated users can update their own proposals
CREATE POLICY "authenticated_users_can_update_own_proposals"
ON public.flashcard_proposals
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- authenticated users can delete their own proposals
CREATE POLICY "authenticated_users_can_delete_own_proposals"
ON public.flashcard_proposals
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- anon users cannot view proposals
CREATE POLICY "anon_users_cannot_view_proposals"
ON public.flashcard_proposals
FOR SELECT
TO anon
USING (false);

-- anon users cannot create proposals
CREATE POLICY "anon_users_cannot_create_proposals"
ON public.flashcard_proposals
FOR INSERT
TO anon
WITH CHECK (false);

-- anon users cannot update proposals
CREATE POLICY "anon_users_cannot_update_proposals"
ON public.flashcard_proposals
FOR UPDATE
TO anon
USING (false);

-- anon users cannot delete proposals
CREATE POLICY "anon_users_cannot_delete_proposals"
ON public.flashcard_proposals
FOR DELETE
TO anon
USING (false);

-- ============================================================================
-- indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_flashcard_proposals_user_id 
ON public.flashcard_proposals(user_id);

CREATE INDEX IF NOT EXISTS idx_flashcard_proposals_session_id 
ON public.flashcard_proposals(generation_session_id);

CREATE INDEX IF NOT EXISTS idx_flashcard_proposals_status 
ON public.flashcard_proposals(status);

-- ============================================================================
-- triggers
-- ============================================================================

-- Drop trigger if exists (to allow re-running)
DROP TRIGGER IF EXISTS on_flashcard_proposals_update ON public.flashcard_proposals;

-- trigger to update updated_at on flashcard_proposals table
CREATE TRIGGER on_flashcard_proposals_update
BEFORE UPDATE ON public.flashcard_proposals
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

### Krok 4: Weryfikacja
Po zastosowaniu migracji, uruchom to zapytanie, aby sprawdzić, czy tabela została utworzona:

```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'flashcard_proposals'
ORDER BY ordinal_position;
```

### Krok 5: Test endpointu
Po zastosowaniu migracji, wyślij ponownie request z Postmana do:
- `POST http://localhost:3000/api/generations`

Powinno teraz działać! ✅

## Uwagi
- Ta migracja używa `CREATE TABLE IF NOT EXISTS` i `CREATE INDEX IF NOT EXISTS`, więc można ją uruchomić wielokrotnie bez błędów
- Jeśli pojawi się błąd o brakującej funkcji `handle_updated_at()`, najpierw zastosuj migrację `20241118000000_initial_schema.sql`


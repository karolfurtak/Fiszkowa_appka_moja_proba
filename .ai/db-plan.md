# Database Schema Plan for 10xCards

This document outlines the PostgreSQL database schema for the MVP of the 10xCards application, designed for use with Supabase.

## 1. Tables

_Note: The `users` table is handled internally by **Supabase Auth** (`auth.users`) and is not defined in this public schema. The `profiles` table is used to store public, non-sensitive user data._

### `public.profiles`
Stores public user data, linked to Supabase's authentication service.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Not Null, Foreign Key to `auth.users(id)` | Links to the user in the `auth` schema. |
| `username` | `text` | Unique | Public display name for the user. |
| `created_at` | `timestamptz` | Not Null, Default `now()` | Timestamp of when the profile was created. |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | Timestamp of the last profile update. |

---

### `public.decks`
Represents a collection (deck) of flashcards belonging to a user.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Generated Always as Identity | Unique identifier for the deck. |
| `user_id` | `uuid` | Not Null, Foreign Key to `public.profiles(id)` | The user who owns this deck. |
| `name` | `text` | Not Null | The name of the deck. |
| `created_at` | `timestamptz` | Not Null, Default `now()` | Timestamp of when the deck was created. |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | Timestamp of the last deck update. |

---

### `public.flashcards`
Represents an individual flashcard within a deck.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Generated Always as Identity | Unique identifier for the flashcard. |
| `deck_id` | `bigint` | Not Null, Foreign Key to `public.decks(id)` `ON DELETE CASCADE` | The deck this flashcard belongs to. |
| `question` | `text` | Not Null, CHECK (length >= 1000 AND length <= 10000) | The question text on the flashcard. Must be between 1000 and 10000 characters. |
| `correct_answer` | `text` | Not Null | The correct answer. |
| `image_url` | `text` | Nullable, CHECK (is valid URL) | Optional image URL for the flashcard. |
| `status` | `flashcard_status` | Not Null, Default `'learning'` | The learning status of the card (`learning` or `mastered`). |
| `due_date` | `timestamptz` | Not Null, Default `now()` | The next scheduled review date. |
| `interval` | `integer` | Not Null, Default `1` | The current interval (in days) for the next review. |
| `consecutive_correct_answers` | `integer`| Not Null, Default `0` | Counter for successive correct answers. |
| `created_at` | `timestamptz` | Not Null, Default `now()` | Timestamp of when the flashcard was created. |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | Timestamp of the last flashcard update. |

---

### `public.flashcard_proposals`
Represents AI-generated flashcard proposals awaiting user verification and acceptance.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Generated Always as Identity | Unique identifier for the proposal. |
| `user_id` | `uuid` | Not Null, Foreign Key to `public.profiles(id)` `ON DELETE CASCADE` | The user who owns this proposal. |
| `question` | `text` | Not Null, CHECK (length >= 1000 AND length <= 10000) | The question text. Must be between 1000 and 10000 characters. |
| `correct_answer` | `text` | Not Null | The correct answer. |
| `image_url` | `text` | Nullable, CHECK (is valid URL) | Optional image URL for the flashcard. |
| `domain` | `text` | Nullable | Detected or specified domain of knowledge. |
| `generation_session_id` | `text` | Nullable | Identifier to group proposals from the same generation session. |
| `status` | `proposal_status` | Not Null, Default `'pending'` | The status of the proposal (`pending`, `accepted`, `rejected`). |
| `created_at` | `timestamptz` | Not Null, Default `now()` | Timestamp of when the proposal was created. |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | Timestamp of the last proposal update. |

## 2. Relationships

-   **Users to Decks**: One-to-Many (`profiles` 1-to-many `decks`)
    -   A single user can own multiple decks.
    -   Each deck is owned by exactly one user.
-   **Decks to Flashcards**: One-to-Many (`decks` 1-to-many `flashcards`)
    -   A single deck can contain multiple flashcards.
    -   Each flashcard belongs to exactly one deck.
    -   Deleting a deck will automatically delete all flashcards within it (`ON DELETE CASCADE`).
-   **Users to Flashcard Proposals**: One-to-Many (`profiles` 1-to-many `flashcard_proposals`)
    -   A single user can have multiple flashcard proposals.
    -   Each proposal belongs to exactly one user.
    -   Deleting a user will automatically delete all their proposals (`ON DELETE CASCADE`).

## 3. Indexes

To optimize query performance, the following indexes should be created:

```sql
-- Index to quickly find all decks for a user
CREATE INDEX idx_decks_user_id ON public.decks(user_id);

-- Index to quickly find all flashcards in a deck
CREATE INDEX idx_flashcards_deck_id ON public.flashcards(deck_id);

-- Index to quickly find flashcards due for review
CREATE INDEX idx_flashcards_due_date ON public.flashcards(due_date);

-- Index to quickly find all proposals for a user
CREATE INDEX idx_flashcard_proposals_user_id ON public.flashcard_proposals(user_id);

-- Index to quickly find proposals by generation session
CREATE INDEX idx_flashcard_proposals_session_id ON public.flashcard_proposals(generation_session_id);

-- Index to quickly find pending proposals
CREATE INDEX idx_flashcard_proposals_status ON public.flashcard_proposals(status);
```

## 4. Row Level Security (RLS) Policies

RLS must be enabled on all tables to ensure users can only access their own data.

### Enable RLS
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_proposals ENABLE ROW LEVEL SECURITY;
```

### Policies for `profiles`
```sql
-- Users can see their own profile.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id);
```

### Policies for `decks`
```sql
-- Users can see their own decks.
CREATE POLICY "Users can view their own decks."
ON public.decks FOR SELECT
USING (auth.uid() = user_id);

-- Users can create decks for themselves.
CREATE POLICY "Users can create their own decks."
ON public.decks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own decks.
CREATE POLICY "Users can update their own decks."
ON public.decks FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own decks.
CREATE POLICY "Users can delete their own decks."
ON public.decks FOR DELETE
USING (auth.uid() = user_id);
```

### Policies for `flashcards`
```sql
-- Users can see flashcards in decks they own.
CREATE POLICY "Users can view flashcards in their own decks."
ON public.flashcards FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid()
  )
);

-- Users can create flashcards in decks they own.
CREATE POLICY "Users can create flashcards in their own decks."
ON public.flashcards FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid()
  )
);

-- Users can update flashcards in decks they own.
CREATE POLICY "Users can update flashcards in their own decks."
ON public.flashcards FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid()
  )
);

-- Users can delete flashcards in decks they own.
CREATE POLICY "Users can delete flashcards in their own decks."
ON public.flashcards FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid()
  )
);
```

### Policies for `flashcard_proposals`
```sql
-- Users can see their own proposals.
CREATE POLICY "Users can view their own proposals."
ON public.flashcard_proposals FOR SELECT
USING (auth.uid() = user_id);

-- Users can create proposals for themselves.
CREATE POLICY "Users can create their own proposals."
ON public.flashcard_proposals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own proposals.
CREATE POLICY "Users can update their own proposals."
ON public.flashcard_proposals FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own proposals.
CREATE POLICY "Users can delete their own proposals."
ON public.flashcard_proposals FOR DELETE
USING (auth.uid() = user_id);
```

## 5. Additional Notes & Definitions

### Custom `ENUM` Types
Custom types are required to manage the status of flashcards and proposals.

**Flashcard Status:**
```sql
CREATE TYPE public.flashcard_status AS ENUM ('learning', 'mastered');
```

**Proposal Status:**
```sql
CREATE TYPE public.proposal_status AS ENUM ('pending', 'accepted', 'rejected');
```

### `updated_at` Trigger
A trigger should be created to automatically update the `updated_at` timestamp on any row modification. This is a standard practice in Supabase projects.

**1. Create the function:**
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**2. Create triggers for each table:**
```sql
CREATE TRIGGER on_profiles_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_decks_update
BEFORE UPDATE ON public.decks
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_flashcards_update
BEFORE UPDATE ON public.flashcards
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_flashcard_proposals_update
BEFORE UPDATE ON public.flashcard_proposals
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

-- migration: initial_schema
-- purpose: create initial database schema for 10xcards mvp
-- affected tables: profiles, decks, flashcards
-- notes: 
--   - users table is handled by supabase auth (auth.users)
--   - all tables have rls enabled with granular policies for anon and authenticated roles
--   - includes enum type, indexes, triggers, and rls policies

-- ============================================================================
-- custom enum type
-- ============================================================================

-- create enum type for flashcard status
-- this enum tracks whether a flashcard is in learning mode or has been mastered
create type public.flashcard_status as enum ('learning', 'mastered');

-- ============================================================================
-- helper function for updated_at trigger
-- ============================================================================

-- function to automatically update the updated_at timestamp
-- this is a standard pattern in supabase projects to track row modifications
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- table: profiles
-- purpose: stores public user data linked to supabase auth
-- ============================================================================

-- create profiles table
-- note: the users table is handled internally by supabase auth (auth.users)
-- this table stores only public, non-sensitive user information
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable row level security on profiles table
-- rls ensures users can only access their own profile data
alter table public.profiles enable row level security;

-- rls policy: authenticated users can view their own profile
-- this policy allows authenticated users to read their own profile data
create policy "authenticated_users_can_view_own_profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- rls policy: authenticated users can update their own profile
-- this policy allows authenticated users to modify their own profile data
create policy "authenticated_users_can_update_own_profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id);

-- rls policy: anon users cannot view profiles
-- this policy explicitly denies anonymous users from accessing profile data
create policy "anon_users_cannot_view_profiles"
on public.profiles
for select
to anon
using (false);

-- rls policy: anon users cannot update profiles
-- this policy explicitly denies anonymous users from modifying profile data
create policy "anon_users_cannot_update_profiles"
on public.profiles
for update
to anon
using (false);

-- ============================================================================
-- table: decks
-- purpose: represents a collection of flashcards belonging to a user
-- ============================================================================

-- create decks table
-- each deck belongs to one user and can contain multiple flashcards
create table public.decks (
  id bigint primary key generated always as identity,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable row level security on decks table
-- rls ensures users can only access decks they own
alter table public.decks enable row level security;

-- rls policy: authenticated users can view their own decks
-- this policy allows authenticated users to read decks they own
create policy "authenticated_users_can_view_own_decks"
on public.decks
for select
to authenticated
using (auth.uid() = user_id);

-- rls policy: authenticated users can create decks for themselves
-- this policy ensures users can only create decks with their own user_id
create policy "authenticated_users_can_create_own_decks"
on public.decks
for insert
to authenticated
with check (auth.uid() = user_id);

-- rls policy: authenticated users can update their own decks
-- this policy allows authenticated users to modify decks they own
create policy "authenticated_users_can_update_own_decks"
on public.decks
for update
to authenticated
using (auth.uid() = user_id);

-- rls policy: authenticated users can delete their own decks
-- this policy allows authenticated users to remove decks they own
-- note: deleting a deck will cascade delete all flashcards (see foreign key constraint)
create policy "authenticated_users_can_delete_own_decks"
on public.decks
for delete
to authenticated
using (auth.uid() = user_id);

-- rls policy: anon users cannot view decks
-- this policy explicitly denies anonymous users from accessing deck data
create policy "anon_users_cannot_view_decks"
on public.decks
for select
to anon
using (false);

-- rls policy: anon users cannot create decks
-- this policy explicitly denies anonymous users from creating decks
create policy "anon_users_cannot_create_decks"
on public.decks
for insert
to anon
with check (false);

-- rls policy: anon users cannot update decks
-- this policy explicitly denies anonymous users from modifying decks
create policy "anon_users_cannot_update_decks"
on public.decks
for update
to anon
using (false);

-- rls policy: anon users cannot delete decks
-- this policy explicitly denies anonymous users from deleting decks
create policy "anon_users_cannot_delete_decks"
on public.decks
for delete
to anon
using (false);

-- ============================================================================
-- table: flashcards
-- purpose: represents an individual flashcard within a deck
-- ============================================================================

-- create flashcards table
-- each flashcard belongs to one deck and contains question, answers, and learning metadata
create table public.flashcards (
  id bigint primary key generated always as identity,
  deck_id bigint not null references public.decks(id) on delete cascade,
  question text not null,
  correct_answer text not null,
  incorrect_answers text[] not null,
  image_url text,
  status public.flashcard_status not null default 'learning',
  due_date timestamptz not null default now(),
  interval integer not null default 1,
  consecutive_correct_answers integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- check constraint to validate image_url format if provided
  constraint check_image_url_format check (
    image_url is null or 
    image_url ~* '^https?://[^\s/$.?#].[^\s]*$'
  )
);

-- enable row level security on flashcards table
-- rls ensures users can only access flashcards in decks they own
alter table public.flashcards enable row level security;

-- rls policy: authenticated users can view flashcards in their own decks
-- this policy allows authenticated users to read flashcards in decks they own
-- uses exists subquery to verify deck ownership
create policy "authenticated_users_can_view_flashcards_in_own_decks"
on public.flashcards
for select
to authenticated
using (
  exists (
    select 1 from public.decks
    where decks.id = flashcards.deck_id and decks.user_id = auth.uid()
  )
);

-- rls policy: authenticated users can create flashcards in their own decks
-- this policy ensures users can only create flashcards in decks they own
-- uses exists subquery to verify deck ownership
create policy "authenticated_users_can_create_flashcards_in_own_decks"
on public.flashcards
for insert
to authenticated
with check (
  exists (
    select 1 from public.decks
    where decks.id = flashcards.deck_id and decks.user_id = auth.uid()
  )
);

-- rls policy: authenticated users can update flashcards in their own decks
-- this policy allows authenticated users to modify flashcards in decks they own
-- uses exists subquery to verify deck ownership
create policy "authenticated_users_can_update_flashcards_in_own_decks"
on public.flashcards
for update
to authenticated
using (
  exists (
    select 1 from public.decks
    where decks.id = flashcards.deck_id and decks.user_id = auth.uid()
  )
);

-- rls policy: authenticated users can delete flashcards in their own decks
-- this policy allows authenticated users to remove flashcards from decks they own
-- uses exists subquery to verify deck ownership
create policy "authenticated_users_can_delete_flashcards_in_own_decks"
on public.flashcards
for delete
to authenticated
using (
  exists (
    select 1 from public.decks
    where decks.id = flashcards.deck_id and decks.user_id = auth.uid()
  )
);

-- rls policy: anon users cannot view flashcards
-- this policy explicitly denies anonymous users from accessing flashcard data
create policy "anon_users_cannot_view_flashcards"
on public.flashcards
for select
to anon
using (false);

-- rls policy: anon users cannot create flashcards
-- this policy explicitly denies anonymous users from creating flashcards
create policy "anon_users_cannot_create_flashcards"
on public.flashcards
for insert
to anon
with check (false);

-- rls policy: anon users cannot update flashcards
-- this policy explicitly denies anonymous users from modifying flashcards
create policy "anon_users_cannot_update_flashcards"
on public.flashcards
for update
to anon
using (false);

-- rls policy: anon users cannot delete flashcards
-- this policy explicitly denies anonymous users from deleting flashcards
create policy "anon_users_cannot_delete_flashcards"
on public.flashcards
for delete
to anon
using (false);

-- ============================================================================
-- indexes
-- purpose: optimize query performance for common access patterns
-- ============================================================================

-- index to quickly find all decks for a user
-- this index optimizes queries that filter decks by user_id
create index idx_decks_user_id on public.decks(user_id);

-- index to quickly find all flashcards in a deck
-- this index optimizes queries that filter flashcards by deck_id
create index idx_flashcards_deck_id on public.flashcards(deck_id);

-- index to quickly find flashcards due for review
-- this index optimizes queries that find flashcards with due_date <= now()
-- critical for the spaced repetition algorithm
create index idx_flashcards_due_date on public.flashcards(due_date);

-- ============================================================================
-- triggers
-- purpose: automatically update updated_at timestamp on row modifications
-- ============================================================================

-- trigger to update updated_at on profiles table
-- automatically sets updated_at to current timestamp before any update
create trigger on_profiles_update
before update on public.profiles
for each row execute procedure public.handle_updated_at();

-- trigger to update updated_at on decks table
-- automatically sets updated_at to current timestamp before any update
create trigger on_decks_update
before update on public.decks
for each row execute procedure public.handle_updated_at();

-- trigger to update updated_at on flashcards table
-- automatically sets updated_at to current timestamp before any update
create trigger on_flashcards_update
before update on public.flashcards
for each row execute procedure public.handle_updated_at();


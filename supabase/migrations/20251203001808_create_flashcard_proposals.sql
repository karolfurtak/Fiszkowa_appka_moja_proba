-- migration: create_flashcard_proposals
-- purpose: create flashcard_proposals table for temporary AI-generated proposals
-- affected tables: flashcard_proposals
-- notes: 
--   - this table stores temporary proposals before user acceptance
--   - proposals can be accepted (converted to flashcards) or rejected
--   - proposals are grouped by generation_session_id

-- ============================================================================
-- custom enum type for proposal status
-- ============================================================================

-- create enum type for proposal status
-- this enum tracks whether a proposal is pending, accepted, or rejected
create type public.proposal_status as enum ('pending', 'accepted', 'rejected');

-- ============================================================================
-- table: flashcard_proposals
-- purpose: stores temporary AI-generated flashcard proposals awaiting user verification
-- ============================================================================

-- create flashcard_proposals table
-- each proposal belongs to one user and can be accepted or rejected
create table public.flashcard_proposals (
  id bigint primary key generated always as identity,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text not null,
  correct_answer text not null,
  image_url text,
  domain text,
  generation_session_id text,
  status public.proposal_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- check constraint to validate question length
  constraint check_proposal_question_length check (
    length(question) >= 1000 and length(question) <= 10000
  ),
  -- check constraint to validate image_url format if provided
  constraint check_proposal_image_url_format check (
    image_url is null or 
    image_url ~* '^https?://[^\s/$.?#].[^\s]*$'
  )
);

-- enable row level security on flashcard_proposals table
-- rls ensures users can only access their own proposals
alter table public.flashcard_proposals enable row level security;

-- rls policy: authenticated users can view their own proposals
-- this policy allows authenticated users to read proposals they own
create policy "authenticated_users_can_view_own_proposals"
on public.flashcard_proposals
for select
to authenticated
using (auth.uid() = user_id);

-- rls policy: authenticated users can create proposals for themselves
-- this policy ensures users can only create proposals with their own user_id
create policy "authenticated_users_can_create_own_proposals"
on public.flashcard_proposals
for insert
to authenticated
with check (auth.uid() = user_id);

-- rls policy: authenticated users can update their own proposals
-- this policy allows authenticated users to modify proposals they own
create policy "authenticated_users_can_update_own_proposals"
on public.flashcard_proposals
for update
to authenticated
using (auth.uid() = user_id);

-- rls policy: authenticated users can delete their own proposals
-- this policy allows authenticated users to remove proposals they own
create policy "authenticated_users_can_delete_own_proposals"
on public.flashcard_proposals
for delete
to authenticated
using (auth.uid() = user_id);

-- rls policy: anon users cannot view proposals
-- this policy explicitly denies anonymous users from accessing proposal data
create policy "anon_users_cannot_view_proposals"
on public.flashcard_proposals
for select
to anon
using (false);

-- rls policy: anon users cannot create proposals
-- this policy explicitly denies anonymous users from creating proposals
create policy "anon_users_cannot_create_proposals"
on public.flashcard_proposals
for insert
to anon
with check (false);

-- rls policy: anon users cannot update proposals
-- this policy explicitly denies anonymous users from modifying proposals
create policy "anon_users_cannot_update_proposals"
on public.flashcard_proposals
for update
to anon
using (false);

-- rls policy: anon users cannot delete proposals
-- this policy explicitly denies anonymous users from deleting proposals
create policy "anon_users_cannot_delete_proposals"
on public.flashcard_proposals
for delete
to anon
using (false);

-- ============================================================================
-- indexes
-- purpose: optimize query performance for common access patterns
-- ============================================================================

-- index to quickly find all proposals for a user
-- this index optimizes queries that filter proposals by user_id
create index idx_flashcard_proposals_user_id on public.flashcard_proposals(user_id);

-- index to quickly find proposals by generation session
-- this index optimizes queries that group proposals by generation_session_id
create index idx_flashcard_proposals_session_id on public.flashcard_proposals(generation_session_id);

-- index to quickly find pending proposals
-- this index optimizes queries that filter proposals by status
create index idx_flashcard_proposals_status on public.flashcard_proposals(status);

-- ============================================================================
-- triggers
-- purpose: automatically update updated_at timestamp on row modifications
-- ============================================================================

-- trigger to update updated_at on flashcard_proposals table
-- automatically sets updated_at to current timestamp before any update
create trigger on_flashcard_proposals_update
before update on public.flashcard_proposals
for each row execute procedure public.handle_updated_at();


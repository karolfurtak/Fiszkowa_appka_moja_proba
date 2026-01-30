# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

10xCards is an AI-powered flashcard generation web application. Users paste text, and AI generates multiple-choice flashcards organized into decks for spaced repetition learning.

## Tech Stack

- **Frontend**: Astro 4 (hybrid mode) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **AI**: OpenRouter.ai API (model: amazon/nova-2-lite-v1:free)
- **Hosting**: DigitalOcean

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Supabase local development
npm run db:start          # Start local Supabase
npm run db:stop           # Stop local Supabase
npm run db:reset          # Reset database with migrations
npm run db:status         # Check Supabase status
npm run db:types          # Generate TypeScript types from schema

# Edge Functions
npm run functions:serve   # Serve generate-flashcards function locally
npm run functions:deploy  # Deploy function to production
```

## Architecture

### Data Flow for Flashcard Generation
```
Frontend → Astro API (/api/generations) → Supabase Edge Function → OpenRouter AI
                                               ↓
                                        PostgreSQL (flashcard_proposals)
```

### Key Directories

- `src/pages/` - Astro pages and API endpoints
- `src/components/` - React components organized by feature (dashboard, deck, study, training, verify, forms, ui)
- `src/lib/api/` - API client functions for Supabase operations
- `src/db/` - Supabase client configuration and database types
- `supabase/functions/` - Edge Functions (generate-flashcards, accept-proposals-by-session)
- `supabase/migrations/` - Database migration files

### Database Tables

- `profiles` - User profiles (linked to Supabase Auth)
- `decks` - Flashcard collections
- `flashcards` - Accepted flashcards with spaced repetition data
- `flashcard_proposals` - AI-generated proposals awaiting user verification

### API Endpoints

- `POST /api/generations` - Proxy to generate-flashcards Edge Function
- `POST /api/flashcards` - CRUD operations for flashcards

## Environment Variables

Required in `.env`:
```
PUBLIC_SUPABASE_URL=<supabase-project-url>
PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
OPENROUTER_API_KEY=<openrouter-api-key>
```

## Important Patterns

### Supabase Client
- Browser client: `src/db/supabase.client.ts`
- Server helpers: `src/lib/supabase.ts`
- Always use Row Level Security (RLS) - users can only access their own data

### Component Organization
- UI primitives in `src/components/ui/` (shadcn/ui based)
- Feature components in dedicated directories (dashboard, deck, study, etc.)
- Spectrum design system components in `src/components/spectrum/`

### Edge Functions
- Use Deno runtime
- Access secrets via `Deno.env.get()`
- 30-second timeout for OpenRouter API calls

## Constraints

- Question text: 2-10000 characters
- Domain field: max 100 characters
- Correct answer: max 500 characters
- Flashcard mastery: 30 consecutive correct answers

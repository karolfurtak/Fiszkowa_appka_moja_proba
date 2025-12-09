/**
 * DTO (Data Transfer Object) and Command Model types for 10xCards API
 * 
 * This file contains all TypeScript type definitions for API request/response structures,
 * derived from database models and API plan specifications.
 * 
 * Naming Convention:
 * - All fields with underscores use snake_case (e.g., proposal_id, deck_id, correct_answer)
 * - Simple single-word fields without underscores remain unchanged (e.g., text, domain, email)
 * - This convention ensures consistency with database schema and API responses
 */

import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './db/database.types';

// ============================================================================
// Type Aliases for Database Entities
// ============================================================================

/** Profile entity from database */
export type Profile = Tables<'profiles'>;

/** Deck entity from database */
export type Deck = Tables<'decks'>;

/** Flashcard entity from database */
export type Flashcard = Tables<'flashcards'>;

/** Flashcard proposal entity from database */
export type FlashcardProposal = Tables<'flashcard_proposals'>;

/** Flashcard status enum */
export type FlashcardStatus = Enums<'flashcard_status'>;

/** Proposal status enum */
export type ProposalStatus = Enums<'proposal_status'>;

// ============================================================================
// Authentication DTOs
// ============================================================================

/**
 * Request DTO for user registration
 * Maps to Supabase Auth signup endpoint
 */
export interface RegisterUserRequest {
  email: string;
  password: string;
  data?: {
    username: string;
  };
}

/**
 * Response DTO for user registration
 * Contains user info and session tokens
 */
export interface RegisterUserResponse {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

/**
 * Request DTO for user login
 * Maps to Supabase Auth token endpoint
 */
export interface LoginUserRequest {
  email: string;
  password: string;
}

/**
 * Response DTO for user login
 * Contains session tokens and user info
 */
export interface LoginUserResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
  };
}

/**
 * Request DTO for password update
 * Maps to Supabase Auth user update endpoint
 */
export interface UpdatePasswordRequest {
  password: string;
}

/**
 * Response DTO for password update
 */
export interface UpdatePasswordResponse {
  id: string;
  email: string;
  updated_at: string;
}

/**
 * Request DTO for account deletion
 * Maps to Supabase Auth admin endpoint
 */
export interface DeleteAccountRequest {
  user_id: string;
}

/**
 * Response DTO for account deletion
 */
export interface DeleteAccountResponse {
  message: string;
}

// ============================================================================
// Profile DTOs
// ============================================================================

/**
 * Response DTO for user profile
 * Derived from profiles table Row type
 */
export type ProfileResponse = Profile;

/**
 * Request DTO for profile update
 * Derived from profiles table Update type, but only username is updatable
 */
export interface UpdateProfileRequest {
  username: string;
}

// ============================================================================
// Deck DTOs
// ============================================================================

/**
 * Response DTO for deck
 * Derived from decks table Row type
 */
export type DeckResponse = Deck;

/**
 * Response DTO for deck with flashcard count
 * Extends DeckResponse with count information
 */
export interface DeckWithCountResponse extends DeckResponse {
  flashcards: Array<{
    count: number;
  }>;
}

/**
 * Request DTO for deck creation
 * Derived from decks table Insert type, excluding auto-generated fields
 */
export type CreateDeckRequest = Omit<TablesInsert<'decks'>, 'id' | 'created_at' | 'updated_at'>;

/**
 * Request DTO for deck update
 * Derived from decks table Update type, only name is updatable
 */
export interface UpdateDeckRequest {
  name: string;
}

// ============================================================================
// Flashcard DTOs
// ============================================================================

/**
 * Response DTO for flashcard
 * Derived from flashcards table Row type
 */
export type FlashcardResponse = Flashcard;

/**
 * Front side of a flashcard (question side)
 * Contains the question and optional image
 */
export type FlashcardFront = Pick<Flashcard, 'question' | 'image_url'>;

/**
 * Back side of a flashcard (answer side)
 * Contains the correct answer
 */
export type FlashcardBack = Pick<Flashcard, 'correct_answer'>;

/**
 * Request DTO for single flashcard creation
 * Derived from flashcards table Insert type, excluding auto-generated and default fields
 */
export type CreateFlashcardRequest = Omit<
  TablesInsert<'flashcards'>,
  'id' | 'status' | 'due_date' | 'interval' | 'consecutive_correct_answers' | 'created_at' | 'updated_at'
>;

/**
 * Request DTO for multiple flashcard creation (bulk insert)
 * Array of CreateFlashcardRequest
 */
export type CreateFlashcardsRequest = CreateFlashcardRequest[];

/**
 * Request DTO for flashcard update
 * Derived from flashcards table Update type, excluding auto-generated fields
 */
export type UpdateFlashcardRequest = Omit<
  TablesUpdate<'flashcards'>,
  'id' | 'created_at' | 'updated_at'
>;

// ============================================================================
// Flashcard Proposal DTOs
// ============================================================================

/**
 * Response DTO for flashcard proposal
 * Derived from flashcard_proposals table Row type
 */
export type FlashcardProposalResponse = FlashcardProposal;

/**
 * Request DTO for proposal update
 * Derived from flashcard_proposals table Update type, excluding auto-generated fields
 */
export type UpdateProposalRequest = Omit<
  TablesUpdate<'flashcard_proposals'>,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

// ============================================================================
// Command Models - AI Generation
// ============================================================================

/**
 * Command model for generating flashcards from text
 * Maps to Edge Function: /functions/v1/generate-flashcards
 * Supports both "text" and "source_text" for course compatibility
 */
export interface GenerateFlashcardsRequest {
  text?: string;
  source_text?: string; // Course requirement - alternative to "text"
  domain?: string;
}

/**
 * Response model for flashcard generation
 * Contains generation session ID and list of proposals
 */
export interface GenerateFlashcardsResponse {
  generation_session_id: string;
  proposals: Array<{
    id: number;
    question: string;
    correct_answer: string;
    domain: string | null;
    status: ProposalStatus;
  }>;
  detected_domain: string;
  total_generated: number;
}

// ============================================================================
// Command Models - Proposal Management
// ============================================================================

/**
 * Command model for accepting a single proposal
 * Maps to Edge Function: /functions/v1/accept-proposal
 */
export interface AcceptProposalRequest {
  proposal_id: number;
  deck_id: number;
}

/**
 * Response model for proposal acceptance
 */
export interface AcceptProposalResponse {
  proposal_id: number;
  flashcard_id: number;
  deck_id: number;
  status: ProposalStatus;
  message: string;
}

/**
 * Command model for rejecting a single proposal
 * Maps to Edge Function: /functions/v1/reject-proposal
 */
export interface RejectProposalRequest {
  proposal_id: number;
  delete?: boolean;
}

/**
 * Response model for proposal rejection
 */
export interface RejectProposalResponse {
  proposal_id: number;
  status: ProposalStatus;
  message: string;
}

/**
 * Command model for accepting multiple proposals
 * Maps to Edge Function: /functions/v1/accept-proposals
 */
export interface AcceptProposalsRequest {
  proposal_ids: number[];
  deck_id: number;
}

/**
 * Response model for bulk proposal acceptance
 */
export interface AcceptProposalsResponse {
  accepted_count: number;
  flashcard_ids: number[];
  deck_id: number;
  results: Array<{
    proposal_id: number;
    flashcard_id: number;
    status: ProposalStatus;
  }>;
  message: string;
}

/**
 * Command model for rejecting multiple proposals
 * Maps to Edge Function: /functions/v1/reject-proposals
 */
export interface RejectProposalsRequest {
  proposal_ids: number[];
  delete?: boolean;
}

/**
 * Response model for bulk proposal rejection
 */
export interface RejectProposalsResponse {
  rejected_count: number;
  deleted_count: number;
  results: Array<{
    proposal_id: number;
    status: ProposalStatus;
  }>;
  message: string;
}

/**
 * Command model for accepting all proposals from a generation session
 * Maps to Edge Function: /functions/v1/accept-proposals-by-session
 */
export interface AcceptProposalsBySessionRequest {
  generation_session_id: string;
  deck_id: number;
}

/**
 * Response model for session-based proposal acceptance
 */
export interface AcceptProposalsBySessionResponse {
  generation_session_id: string;
  accepted_count: number;
  flashcard_ids: number[];
  deck_id: number;
  message: string;
}

// ============================================================================
// Command Models - Spaced Repetition
// ============================================================================

/**
 * Command model for submitting a quiz answer
 * Maps to Edge Function: /functions/v1/submit-quiz-answer
 */
export interface SubmitQuizAnswerRequest {
  flashcard_id: number;
  is_correct: boolean;
}

/**
 * Response model for quiz answer submission
 */
export interface SubmitQuizAnswerResponse {
  flashcard_id: number;
  is_correct: boolean;
  updated_interval: number;
  consecutive_correct_answers: number;
  new_due_date: string;
  status: FlashcardStatus;
  message: string;
}

/**
 * Command model for processing a quiz session
 * Maps to Edge Function: /functions/v1/process-quiz-session
 */
export interface ProcessQuizSessionRequest {
  answers: Array<{
    flashcard_id: number;
    is_correct: boolean;
  }>;
}

/**
 * Response model for quiz session processing
 */
export interface ProcessQuizSessionResponse {
  total_answered: number;
  correct_count: number;
  incorrect_count: number;
  updated_flashcards: Array<{
    flashcard_id: number;
    new_status: FlashcardStatus;
    new_interval: number;
    consecutive_correct_answers: number;
  }>;
  mastered_count: number;
}

/**
 * Command model for restoring a mastered flashcard
 * Maps to Edge Function: /functions/v1/restore-flashcard
 */
export interface RestoreFlashcardRequest {
  flashcard_id: number;
}

/**
 * Response model for flashcard restoration
 */
export interface RestoreFlashcardResponse {
  flashcard_id: number;
  status: FlashcardStatus;
  interval: number;
  consecutive_correct_answers: number;
  due_date: string;
  message: string;
}

// ============================================================================
// Error Response DTOs
// ============================================================================

/**
 * Standard error response structure
 * Used across all API endpoints
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Common error codes used in API responses
 */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';


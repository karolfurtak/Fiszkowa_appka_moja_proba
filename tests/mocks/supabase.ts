import { http, HttpResponse } from "msw";

const SUPABASE_URL = "http://localhost:54321";

// Mock created flashcard response
export const mockCreatedFlashcard = {
  id: 1,
  deck_id: 1,
  question: "Test question",
  correct_answer: "Test answer",
  incorrect_answers: [],
  image_url: null,
  created_at: "2024-01-01T00:00:00.000Z",
};

// Mock created proposal response
export const mockCreatedProposal = {
  id: 1,
  user_id: "test-user-id",
  question: "Test question that is long enough to meet the minimum requirement",
  correct_answer: "Test answer",
  domain: "Testing",
  status: "pending",
  generation_session_id: "test-session-123",
  created_at: "2024-01-01T00:00:00.000Z",
};

// Handlers
export const supabaseHandlers = [
  // POST /rest/v1/flashcards - Create flashcards
  http.post(`${SUPABASE_URL}/rest/v1/flashcards`, async ({ request }) => {
    const body = (await request.json()) as Array<{
      deck_id: number;
      question: string;
      correct_answer: string;
      incorrect_answers?: string[];
      image_url?: string | null;
    }>;

    // Simulate successful creation
    const createdCards = body.map((card, index) => ({
      id: index + 1,
      ...card,
      created_at: new Date().toISOString(),
    }));

    return HttpResponse.json(createdCards, { status: 201 });
  }),

  // POST /rest/v1/flashcard_proposals - Create proposals
  http.post(`${SUPABASE_URL}/rest/v1/flashcard_proposals`, async ({ request }) => {
    const body = (await request.json()) as Array<{
      user_id: string;
      question: string;
      correct_answer: string;
      domain: string | null;
      status: string;
      generation_session_id: string;
    }>;

    // Simulate successful creation
    const createdProposals = body.map((proposal, index) => ({
      id: index + 1,
      ...proposal,
      created_at: new Date().toISOString(),
    }));

    return HttpResponse.json(createdProposals, { status: 201 });
  }),
];

// Handler factories for test customization
export const createSupabaseFlashcardsSuccessHandler = (response: unknown) =>
  http.post(`${SUPABASE_URL}/rest/v1/flashcards`, () => {
    return HttpResponse.json(response, { status: 201 });
  });

export const createSupabaseFlashcardsErrorHandler = (
  status: number,
  error: unknown
) =>
  http.post(`${SUPABASE_URL}/rest/v1/flashcards`, () => {
    return HttpResponse.json(error, { status });
  });

export const createSupabaseProposalsSuccessHandler = (response: unknown) =>
  http.post(`${SUPABASE_URL}/rest/v1/flashcard_proposals`, () => {
    return HttpResponse.json(response, { status: 201 });
  });

export const createSupabaseProposalsErrorHandler = (
  status: number,
  error: unknown
) =>
  http.post(`${SUPABASE_URL}/rest/v1/flashcard_proposals`, () => {
    return HttpResponse.json(error, { status });
  });

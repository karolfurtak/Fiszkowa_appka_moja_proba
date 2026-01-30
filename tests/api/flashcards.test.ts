import { describe, it, expect, beforeEach } from "vitest";
import { server } from "../mocks/server";
import {
  createSupabaseFlashcardsSuccessHandler,
  createSupabaseFlashcardsErrorHandler,
} from "../mocks/supabase";
import {
  createTestRequest,
  createTestToken,
  validFlashcardData,
} from "../utils/test-helpers";

// Import the endpoint handler
import { POST } from "../../src/pages/api/flashcards";

describe("POST /api/flashcards", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe("Authorization", () => {
    it("should return 401 when Authorization header is missing", async () => {
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: validFlashcardData,
        includeAuth: false,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 401 when Authorization header format is invalid", async () => {
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: validFlashcardData,
        headers: {
          Authorization: "InvalidFormat token",
        },
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("Request validation", () => {
    it("should return 400 when request body is empty", async () => {
      const request = new Request("http://localhost/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${createTestToken()}`,
        },
        body: "",
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("INVALID_REQUEST");
    });

    it("should return 400 when JSON is invalid", async () => {
      const request = new Request("http://localhost/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${createTestToken()}`,
        },
        body: "{ invalid json }",
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("INVALID_REQUEST");
    });

    it("should return 400 when flashcards array is missing", async () => {
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: { deck_id: 1 },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("flashcards");
    });

    it("should return 400 when flashcards array is empty", async () => {
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: { flashcards: [], deck_id: 1 },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("empty");
    });

    it("should return 400 when deck_id is missing", async () => {
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [{ front: "Question", back: "Answer" }],
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("deck_id");
    });

    it("should return 400 when deck_id is not a number", async () => {
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [{ front: "Question", back: "Answer" }],
          deck_id: "not-a-number",
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Flashcard validation", () => {
    it("should return 400 when front (question) is too short", async () => {
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [{ front: "Q", back: "Answer" }],
          deck_id: 1,
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details.errors[0].error).toContain("2");
    });

    it("should return 400 when front (question) exceeds 10000 characters", async () => {
      const longQuestion = "Q".repeat(10001);
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [{ front: longQuestion, back: "Answer" }],
          deck_id: 1,
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details.errors[0].error).toContain("10000");
    });

    it("should return 400 when back (answer) exceeds 500 characters", async () => {
      const longAnswer = "A".repeat(501);
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [{ front: "Valid question", back: longAnswer }],
          deck_id: 1,
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details.errors[0].error).toContain("500");
    });

    it("should return 400 when front is empty", async () => {
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [{ front: "", back: "Answer" }],
          deck_id: 1,
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when back is empty", async () => {
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [{ front: "Valid question", back: "" }],
          deck_id: 1,
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when source is invalid", async () => {
      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [
            { front: "Valid question", back: "Answer", source: "invalid" },
          ],
          deck_id: 1,
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Successful creation", () => {
    it("should create flashcards and return 201", async () => {
      server.use(
        createSupabaseFlashcardsSuccessHandler([
          {
            id: 1,
            deck_id: 1,
            question: "What is TypeScript?",
            correct_answer: "A typed superset of JavaScript",
            incorrect_answers: [],
            image_url: null,
            created_at: "2024-01-01T00:00:00.000Z",
          },
        ])
      );

      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: validFlashcardData,
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.flashcards).toHaveLength(1);
      expect(data.flashcards[0].front).toBe("What is TypeScript?");
      expect(data.flashcards[0].back).toBe("A typed superset of JavaScript");
      expect(data.total_created).toBe(1);
    });

    it("should accept source: ai", async () => {
      server.use(
        createSupabaseFlashcardsSuccessHandler([
          {
            id: 1,
            deck_id: 1,
            question: "AI generated question",
            correct_answer: "AI answer",
            incorrect_answers: [],
            image_url: null,
            created_at: "2024-01-01T00:00:00.000Z",
          },
        ])
      );

      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [
            {
              front: "AI generated question",
              back: "AI answer",
              source: "ai",
              generation_id: "gen-123",
            },
          ],
          deck_id: 1,
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(201);
    });

    it("should accept source: manual", async () => {
      server.use(
        createSupabaseFlashcardsSuccessHandler([
          {
            id: 1,
            deck_id: 1,
            question: "Manual question",
            correct_answer: "Manual answer",
            incorrect_answers: [],
            image_url: null,
            created_at: "2024-01-01T00:00:00.000Z",
          },
        ])
      );

      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [
            {
              front: "Manual question",
              back: "Manual answer",
              source: "manual",
            },
          ],
          deck_id: 1,
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(201);
    });

    it("should create multiple flashcards at once", async () => {
      server.use(
        createSupabaseFlashcardsSuccessHandler([
          {
            id: 1,
            deck_id: 1,
            question: "Question 1",
            correct_answer: "Answer 1",
            incorrect_answers: [],
            image_url: null,
            created_at: "2024-01-01T00:00:00.000Z",
          },
          {
            id: 2,
            deck_id: 1,
            question: "Question 2",
            correct_answer: "Answer 2",
            incorrect_answers: [],
            image_url: null,
            created_at: "2024-01-01T00:00:00.000Z",
          },
        ])
      );

      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: {
          flashcards: [
            { front: "Question 1", back: "Answer 1", source: "manual" },
            { front: "Question 2", back: "Answer 2", source: "manual" },
          ],
          deck_id: 1,
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.flashcards).toHaveLength(2);
      expect(data.total_created).toBe(2);
    });
  });

  describe("Supabase errors", () => {
    it("should return Supabase error status when insert fails", async () => {
      server.use(
        createSupabaseFlashcardsErrorHandler(403, {
          message: "Row level security violation",
          code: "PGRST301",
        })
      );

      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: validFlashcardData,
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
    });

    it("should handle 500 database error", async () => {
      server.use(
        createSupabaseFlashcardsErrorHandler(500, {
          message: "Internal server error",
          code: "INTERNAL",
        })
      );

      const request = createTestRequest("http://localhost/api/flashcards", {
        method: "POST",
        body: validFlashcardData,
        includeAuth: true,
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(500);
    });
  });
});

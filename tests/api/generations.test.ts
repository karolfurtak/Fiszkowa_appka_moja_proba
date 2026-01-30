import { describe, it, expect, beforeEach } from "vitest";
import { server } from "../mocks/server";
import {
  createSupabaseProposalsErrorHandler,
} from "../mocks/supabase";
import {
  createTestRequest,
  createTestToken,
  validGenerationData,
} from "../utils/test-helpers";

// Import the endpoint handler
import { POST } from "../../src/pages/api/generations";

describe("POST /api/generations", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe("Authorization", () => {
    it("should return 401 when Authorization header is missing", async () => {
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: validGenerationData,
        includeAuth: false,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 401 when Authorization header format is invalid", async () => {
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: validGenerationData,
        headers: {
          Authorization: "InvalidFormat token",
        },
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 401 when token format is invalid (not JWT)", async () => {
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: validGenerationData,
        headers: {
          Authorization: "Bearer invalid-token-format",
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
      const request = new Request("http://localhost/api/generations", {
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
      const request = new Request("http://localhost/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${createTestToken()}`,
        },
        body: "{ invalid }",
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("INVALID_REQUEST");
    });

    it("should return 400 when text is missing", async () => {
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: { domain: "Testing" },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("text");
    });

    it("should return 400 when text is empty string", async () => {
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: { text: "" },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when text is whitespace only", async () => {
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: { text: "   " },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when text is less than 100 characters", async () => {
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: { text: "Short text that is less than 100 characters" },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("100 characters");
    });

    it("should return 400 when domain exceeds 100 characters", async () => {
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: {
          text: validGenerationData.text,
          domain: "D".repeat(101),
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("domain");
    });

    it("should accept source_text as alternative to text", async () => {
      // This test verifies that source_text is mapped to text
      // We expect it to pass validation and proceed to AI service
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: {
          source_text: validGenerationData.text,
          domain: "Testing",
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      // Should not return validation error for missing text
      // It will fail later at AI service, but that's expected
      expect(data.error?.code).not.toBe("VALIDATION_ERROR");
    });

    it("should accept text exactly 100 characters", async () => {
      const exactText = "A".repeat(100);
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: { text: exactText },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      // Should not return validation error for text length
      expect(data.error?.message).not.toContain("100 characters");
    });

    it("should accept domain exactly 100 characters", async () => {
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: {
          text: validGenerationData.text,
          domain: "D".repeat(100),
        },
        includeAuth: true,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      // Should not return validation error for domain length
      expect(data.error?.code).not.toBe("VALIDATION_ERROR");
    });
  });

  describe("Token decoding", () => {
    it("should decode valid JWT token and extract user ID", async () => {
      // Create a valid token with known user ID
      const userId = "test-user-12345";
      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: validGenerationData,
        includeAuth: true,
        userId: userId,
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      // If we get past token decoding, we should not get UNAUTHORIZED
      expect(data.error?.code).not.toBe("UNAUTHORIZED");
    });

    it("should reject token without sub claim", async () => {
      // Create a token without sub/user_id
      const header = { alg: "HS256", typ: "JWT" };
      const payload = {
        aud: "authenticated",
        role: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const base64Header = btoa(JSON.stringify(header))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      const base64Payload = btoa(JSON.stringify(payload))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      const token = `${base64Header}.${base64Payload}.signature`;

      const request = createTestRequest("http://localhost/api/generations", {
        method: "POST",
        body: validGenerationData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { server } from "../mocks/server";
import {
  createOpenRouterSuccessHandler,
  createOpenRouterErrorHandler,
  createOpenRouterNetworkErrorHandler,
  mockOpenRouterHealthSuccess,
} from "../mocks/openrouter";

// Import the endpoint handler
import { GET } from "../../src/pages/api/health-openrouter";

describe("GET /api/health-openrouter", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe("when OpenRouter API is available", () => {
    it("should return ok: true with model info", async () => {
      server.use(createOpenRouterSuccessHandler(mockOpenRouterHealthSuccess));

      const response = await GET({
        request: new Request("http://localhost/api/health-openrouter"),
      } as any);

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.message).toContain("działa");
      expect(data.model).toBe("amazon/nova-2-lite-v1:free");
    });
  });

  describe("when OpenRouter API returns an error", () => {
    it("should return ok: false with error details for 401", async () => {
      server.use(
        createOpenRouterErrorHandler(401, {
          error: {
            message: "Invalid API key",
          },
        })
      );

      const response = await GET({
        request: new Request("http://localhost/api/health-openrouter"),
      } as any);

      const data = await response.json();

      expect(response.status).toBe(200); // Endpoint returns 200 even for API errors
      expect(data.ok).toBe(false);
      expect(data.error).toContain("Invalid API key");
    });

    it("should return ok: false for 500 server error", async () => {
      server.use(
        createOpenRouterErrorHandler(500, {
          error: {
            message: "Internal server error",
          },
        })
      );

      const response = await GET({
        request: new Request("http://localhost/api/health-openrouter"),
      } as any);

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(false);
    });

    it("should return ok: false for rate limit error", async () => {
      server.use(
        createOpenRouterErrorHandler(429, {
          error: {
            message: "Rate limit exceeded",
          },
        })
      );

      const response = await GET({
        request: new Request("http://localhost/api/health-openrouter"),
      } as any);

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(false);
      expect(data.error).toContain("Rate limit");
    });
  });

  describe("when network error occurs", () => {
    it("should return ok: false with error message", async () => {
      server.use(createOpenRouterNetworkErrorHandler());

      const response = await GET({
        request: new Request("http://localhost/api/health-openrouter"),
      } as any);

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(false);
      expect(data.error).toBeDefined();
    });
  });
});

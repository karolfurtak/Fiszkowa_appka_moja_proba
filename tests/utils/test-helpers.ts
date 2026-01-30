/**
 * Creates a valid JWT token for testing
 * This creates a minimal valid JWT structure without actual signing
 */
export function createTestToken(userId: string = "test-user-123"): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: userId,
    aud: "authenticated",
    role: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    iat: Math.floor(Date.now() / 1000),
  };

  const base64Header = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const base64Payload = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const signature = "test-signature";

  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * Creates a Request object for API testing
 */
export function createTestRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    includeAuth?: boolean;
    userId?: string;
  } = {}
): Request {
  const {
    method = "GET",
    body,
    headers = {},
    includeAuth = false,
    userId,
  } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (includeAuth) {
    requestHeaders["Authorization"] = `Bearer ${createTestToken(userId)}`;
  }

  return new Request(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Valid flashcard test data
 */
export const validFlashcardData = {
  flashcards: [
    {
      front: "What is TypeScript?",
      back: "A typed superset of JavaScript",
      source: "manual" as const,
    },
  ],
  deck_id: 1,
};

/**
 * Valid generation request data
 */
export const validGenerationData = {
  text: `This is a comprehensive test text about software testing.
Software testing is a critical part of the software development lifecycle.
It helps identify bugs, ensures quality, and validates that the software meets requirements.
There are various types of testing including unit testing, integration testing, and end-to-end testing.
Each type serves a specific purpose in ensuring software quality.`,
  domain: "Software Testing",
};

/**
 * Parses JSON response from API
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

import { http, HttpResponse } from "msw";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Default successful response for health check
export const mockOpenRouterHealthSuccess = {
  id: "gen-test-123",
  model: "amazon/nova-2-lite-v1:free",
  choices: [
    {
      message: {
        role: "assistant",
        content: "OK",
      },
      finish_reason: "stop",
    },
  ],
};

// Default successful response for flashcard generation
export const mockOpenRouterGenerationSuccess = {
  id: "gen-test-456",
  model: "amazon/nova-2-lite-v1:free",
  choices: [
    {
      message: {
        role: "assistant",
        content: JSON.stringify({
          flashcards: [
            {
              question:
                "This is a test question that is long enough to meet the 50 character minimum requirement for valid flashcard questions.",
              correct_answer: "Test answer",
              domain: "Testing",
            },
            {
              question:
                "Another test question that also meets the minimum character requirement of 50 characters for flashcard generation.",
              correct_answer: "Another answer",
              domain: "Testing",
            },
          ],
          detected_domain: "Testing",
        }),
      },
      finish_reason: "stop",
    },
  ],
};

// Error response
export const mockOpenRouterError = {
  error: {
    message: "API Error",
    type: "api_error",
    code: 500,
  },
};

// Handlers
export const openRouterHandlers = [
  // Default success handler
  http.post(OPENROUTER_API_URL, () => {
    return HttpResponse.json(mockOpenRouterHealthSuccess);
  }),
];

// Handler factories for test customization
export const createOpenRouterSuccessHandler = (response: unknown) =>
  http.post(OPENROUTER_API_URL, () => {
    return HttpResponse.json(response);
  });

export const createOpenRouterErrorHandler = (status: number, error: unknown) =>
  http.post(OPENROUTER_API_URL, () => {
    return HttpResponse.json(error, { status });
  });

export const createOpenRouterNetworkErrorHandler = () =>
  http.post(OPENROUTER_API_URL, () => {
    return HttpResponse.error();
  });

export const createOpenRouterTimeoutHandler = () =>
  http.post(OPENROUTER_API_URL, async () => {
    await new Promise((resolve) => setTimeout(resolve, 35000));
    return HttpResponse.json(mockOpenRouterHealthSuccess);
  });

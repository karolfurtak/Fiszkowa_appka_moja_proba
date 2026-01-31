import type { APIRoute } from 'astro';
import {
  OpenRouterService,
  ConfigurationError,
  ValidationError,
  APIError,
  TimeoutError,
  NetworkError,
  ParseError,
} from '@/lib/openrouter.service';
import type { GenerateFlashcardsRequest, GenerateFlashcardsResponse } from '@/types';

// Mark this endpoint as dynamic (not prerendered)
export const prerender = false;

/**
 * API endpoint for generating flashcards using OpenRouter Service
 * 
 * This endpoint uses OpenRouterService to generate flashcards from text
 * POST /api/generations
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Step 1: Get OpenRouter API key from environment
    const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'OPENROUTER_API_KEY not configured',
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 2: Get Supabase configuration
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseAnonKey) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'PUBLIC_SUPABASE_ANON_KEY not configured',
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 3: Get and validate authorization token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authorization token is required. Use: Authorization: Bearer {access_token}',
          },
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 4: Decode JWT token to extract user ID
    let userId: string;
    try {
      const token = authHeader.replace('Bearer ', '');
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error(`Invalid token format: expected 3 parts, got ${tokenParts.length}`);
      }
      
      // Decode payload (base64url)
      let base64Payload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64Payload.length % 4) {
        base64Payload += '=';
      }
      
      const payloadBytes = Uint8Array.from(atob(base64Payload), c => c.charCodeAt(0));
      const payloadText = new TextDecoder().decode(payloadBytes);
      const payload = JSON.parse(payloadText);
      
      // Extract user ID from payload (Supabase JWT uses 'sub' field)
      userId = payload.sub || payload.user_id || payload.id;
      
      if (!userId) {
        throw new Error('User ID not found in token payload');
      }
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError);
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired authorization token',
            details: decodeError instanceof Error ? decodeError.message : 'Unknown error',
          },
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 5: Parse and validate request body
    let requestBody: GenerateFlashcardsRequest;
    try {
      const bodyText = await request.text();
      
      if (!bodyText || bodyText.trim().length === 0) {
        return new Response(
          JSON.stringify({
            error: {
              code: 'INVALID_REQUEST',
              message: 'Request body is empty',
            },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      const parsed = JSON.parse(bodyText);
      
      // Map source_text to text for compatibility
      if (parsed.source_text && !parsed.text) {
        parsed.text = parsed.source_text;
        delete parsed.source_text;
      }
      
      requestBody = parsed;
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid JSON in request body',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 6: Validate request body
    const text = requestBody.text || requestBody.source_text;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'text or source_text is required and must be a non-empty string',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (text.trim().length < 100) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'text must be at least 100 characters long',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (requestBody.domain && typeof requestBody.domain === 'string' && requestBody.domain.length > 100) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'domain must not exceed 100 characters',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 7: Create OpenRouter Service instance
    let openRouterService: OpenRouterService;
    try {
      openRouterService = new OpenRouterService({
        apiKey: openRouterApiKey,
        httpReferer: supabaseUrl,
        httpTitle: '10xCards',
        defaultModel: 'arcee-ai/trinity-mini:free',
        defaultTimeout: 30000,
        maxRetries: 3,
        retryDelay: 1000,
        enableLogging: true,
      });
    } catch (error) {
      console.error('Error creating OpenRouterService:', error);
      return new Response(
        JSON.stringify({
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Failed to initialize OpenRouter Service',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 8: Generate generation session ID
    const generationSessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Step 9: Build prompt for LLM
    const domainInstruction = requestBody.domain
      ? `The domain of knowledge is: ${requestBody.domain}.`
      : 'Automatically detect the domain of knowledge from the text.';

    const prompt = `You are an expert educational content creator. Your task is to generate high-quality flashcards from the provided text.

${domainInstruction}

CRITICAL REQUIREMENTS:
1. LANGUAGE: Generate ALL flashcards (questions and answers) in the SAME LANGUAGE as the source text. If the source text is in Polish, generate flashcards in Polish. If the source text is in English, generate flashcards in English. Match the language exactly.
2. Questions MUST be between 50 and 10000 characters long. This is a strict requirement.
   - Questions can be concise (50-500 chars) for simple facts or detailed (up to 10000 chars) for complex scenarios
   - For complex topics, include context, background information, and specific details from the source text
   - Format as complete scenarios, case studies, or detailed problem statements when appropriate
   - Example (short): "What is the primary function of chlorophyll in photosynthesis?"
   - Example (long): "Given the following scenario about photosynthesis: [detailed scenario with context, background, specific conditions, and multiple aspects to consider]... What are the key processes involved and how do they interact?"
3. Answers should be concise and accurate, maximum 500 characters.
4. Each flashcard should test understanding of key concepts from the text.
5. If domain is not provided, detect and include the domain of knowledge for each flashcard.

Text to analyze:
${text}

Generate at least 3-5 flashcards. Each question MUST be 50-10000 characters. Return only valid JSON, no additional text.`;

    // Step 10: Define JSON schema for structured output
    const jsonSchema = {
      type: 'object',
      properties: {
        flashcards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: 'Question text (MUST be 50-10000 characters)',
              },
              correct_answer: {
                type: 'string',
                description: 'Concise answer (max 500 characters)',
              },
              domain: {
                type: 'string',
                description: 'Domain of knowledge',
              },
            },
            required: ['question', 'correct_answer', 'domain'],
          },
        },
        detected_domain: {
          type: 'string',
          description: 'Main domain detected from the text',
        },
      },
      required: ['flashcards', 'detected_domain'],
    };

    // Step 11: Call OpenRouter Service
    let aiResponse: {
      flashcards: Array<{
        question: string;
        correct_answer: string;
        domain?: string;
      }>;
      detected_domain?: string;
    };

    try {
      const chatResponse = await openRouterService.chatCompletion({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        responseFormat: {
          type: 'json_schema',
          jsonSchema: {
            name: 'flashcard_generation_response',
            strict: true,
            schema: jsonSchema,
          },
        },
        temperature: 0.7,
        maxTokens: 4000,
        timeout: 30000,
      });

      // Parse AI response content
      const aiContent = chatResponse.choices?.[0]?.message?.content;
      if (!aiContent) {
        throw new ParseError('No content in AI response');
      }

      // Handle potential markdown code blocks
      let parsedContent = aiContent.trim();
      if (parsedContent.startsWith('```json')) {
        parsedContent = parsedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (parsedContent.startsWith('```')) {
        parsedContent = parsedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      try {
        aiResponse = JSON.parse(parsedContent);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', {
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          contentPreview: parsedContent.substring(0, 500),
        });
        throw new ParseError('Failed to parse AI response as JSON', {
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          contentPreview: parsedContent.substring(0, 200),
        });
      }
    } catch (error) {
      console.error('Error calling OpenRouter Service:', error);

      let errorCode = 'AI_SERVICE_ERROR';
      let errorMessage = 'Failed to generate flashcards from AI service';

      if (error instanceof TimeoutError) {
        errorCode = 'AI_SERVICE_TIMEOUT';
        errorMessage = 'AI service request timed out. Please try again with a shorter text.';
      } else if (error instanceof NetworkError) {
        errorCode = 'NETWORK_ERROR';
        errorMessage = 'Network error while calling AI service';
      } else if (error instanceof APIError) {
        errorCode = 'AI_SERVICE_ERROR';
        errorMessage = `AI service error: ${error.message}`;
      } else if (error instanceof ParseError) {
        errorCode = 'PARSE_ERROR';
        errorMessage = error.message;
      }

      return new Response(
        JSON.stringify({
          error: {
            code: errorCode,
            message: errorMessage,
            details: error instanceof Error ? { message: error.message } : undefined,
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 12: Validate AI response
    if (!aiResponse.flashcards || !Array.isArray(aiResponse.flashcards)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'AI_SERVICE_ERROR',
            message: 'Invalid response format from AI service',
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const detectedDomain = aiResponse.detected_domain || requestBody.domain || 'Unknown';

    // Step 13: Validate and filter proposals
    const validProposals = aiResponse.flashcards
      .map((flashcard) => {
        const question = flashcard.question?.trim() || '';
        const correctAnswer = flashcard.correct_answer?.trim() || '';
        const domain = flashcard.domain || detectedDomain;

        // Validate question length (50-10000 characters)
        if (question.length < 50 || question.length > 10000) {
          console.warn('Invalid question length:', {
            length: question.length,
            questionPreview: question.substring(0, 100),
          });
          return null;
        }

        // Validate answer length (max 500 characters)
        if (correctAnswer.length === 0 || correctAnswer.length > 500) {
          console.warn('Invalid answer length:', {
            length: correctAnswer.length,
          });
          return null;
        }

        return {
          user_id: userId,
          question,
          correct_answer: correctAnswer,
          image_url: null,
          domain: domain || null,
          generation_session_id: generationSessionId,
          status: 'pending' as const,
        };
      })
      .filter((proposal): proposal is NonNullable<typeof proposal> => proposal !== null);

    if (validProposals.length === 0) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No valid flashcards could be generated from the provided text. Please ensure the text contains enough content for generating flashcards with questions between 50-10000 characters.',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 14: Save proposals to database
    const supabaseApiUrl = `${supabaseUrl}/rest/v1/flashcard_proposals`;
    
    const insertResponse = await fetch(supabaseApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': authHeader,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(validProposals),
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text().catch(() => 'Unknown error');
      console.error('Database insert error:', {
        status: insertResponse.status,
        error: errorText.substring(0, 500),
        generation_session_id: generationSessionId,
      });

      return new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to save proposals to database',
            details: {
              status: insertResponse.status,
              error: errorText.substring(0, 200),
            },
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const insertedProposals = await insertResponse.json();

    // Step 15: Return success response
    const response: GenerateFlashcardsResponse = {
      generation_session_id: generationSessionId,
      proposals: insertedProposals.map((proposal: {
        id: number;
        question: string;
        correct_answer: string;
        domain: string | null;
        status: string;
      }) => ({
        id: proposal.id,
        question: proposal.question,
        correct_answer: proposal.correct_answer,
        domain: proposal.domain,
        status: proposal.status as 'pending' | 'accepted' | 'rejected',
      })),
      detected_domain: detectedDomain,
      total_generated: insertedProposals.length,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Unexpected error in generations endpoint:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

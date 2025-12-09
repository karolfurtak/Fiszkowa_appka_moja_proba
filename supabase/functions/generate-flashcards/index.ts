import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Simple hash function using Web Crypto API (replaces MD5 dependency)
async function simpleHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

// Default user ID (matches src/db/supabase.client.ts)
// Auth will be implemented comprehensively later
// Read DEFAULT_USER_ID from environment variable (configured in .env and Supabase Secrets)
// Fallback to hardcoded UUID if not set (for backward compatibility)
const DEFAULT_USER_ID = Deno.env.get('DEFAULT_USER_ID') || 'e5127710-e55a-47ca-a221-6afcb24f44ed';

// Types
interface GenerateFlashcardsRequest {
  text?: string;
  source_text?: string; // Support course requirement (source_text)
  domain?: string;
}

interface AIFlashcard {
  question: string;
  correct_answer: string;
  domain?: string;
}

interface AIResponse {
  flashcards: AIFlashcard[];
  detected_domain?: string;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Step 1: Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Only POST method is allowed',
          },
        } as ErrorResponse),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 2: Initialize Supabase client
    // In Edge Functions, Supabase provides these environment variables automatically
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Missing Supabase configuration',
          },
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create client with service role key for database operations (bypasses RLS)
    // Using SupabaseClient type for type safety
    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Use default user ID (auth will be implemented comprehensively later)
    const userId = DEFAULT_USER_ID;

    // Step 3: Parse and validate request body
    let requestBody: GenerateFlashcardsRequest;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid JSON in request body',
          },
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 4: Validate input data
    // Support both "text" and "source_text" for course compatibility
    const sourceText = requestBody.text || requestBody.source_text;
    if (!sourceText || typeof sourceText !== 'string') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Field "text" or "source_text" is required and must be a string',
          },
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use sourceText (which is either text or source_text)
    const text = sourceText.trim();
    
    // Validate text length (min 100, max 10000 characters to prevent DoS and optimize AI costs)
    if (text.length < 100) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Text must be at least 100 characters long',
          },
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (text.length > 10000) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Text must not exceed 10000 characters',
          },
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (requestBody.domain && typeof requestBody.domain === 'string') {
      if (requestBody.domain.length > 100) {
        return new Response(
          JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Domain must not exceed 100 characters',
            },
          } as ErrorResponse),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Step 5: Generate session ID using hash
    // Create a unique string from timestamp, user ID, and text content
    const timestamp = Date.now();
    const hashInput = `${timestamp}-${userId}-${text.substring(0, 100)}-${Math.random()}`;
    const hash = await simpleHash(hashInput);
    const generationSessionId = `gen-${hash}`;

    // Step 6: Get OpenRouter API key from secrets
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'OpenRouter API key not configured',
          },
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 7: Construct AI prompt
    // 
    // Prompt Design:
    // - Instructs AI to generate flashcards with specific length requirements
    // - Questions must be 50-10000 characters (flexible - can be concise or detailed)
    // - Answers must be max 500 characters (concise and accurate)
    // - AI should detect domain if not provided
    // - Returns structured JSON response
    //
    // Expected AI Response Format:
    // {
    //   "flashcards": [
    //     {
    //       "question": "Question text (50-10000 characters - can be concise or detailed)...",
    //       "correct_answer": "Concise answer (max 500 characters)",
    //       "domain": "Domain name"
    //     }
    //   ],
    //   "detected_domain": "Main domain detected from the text"
    // }
    //
    const domainInstruction = requestBody.domain
      ? `The domain of knowledge is: ${requestBody.domain}.`
      : 'Automatically detect the domain of knowledge from the text.';

    const prompt = `You are an expert educational content creator. Your task is to generate high-quality flashcards from the provided text.

${domainInstruction}

CRITICAL REQUIREMENTS:
1. Questions MUST be between 50 and 10000 characters long. This is a strict requirement.
   - Questions can be concise (50-500 chars) for simple facts or detailed (up to 10000 chars) for complex scenarios
   - For complex topics, include context, background information, and specific details from the source text
   - Format as complete scenarios, case studies, or detailed problem statements when appropriate
   - Example (short): "What is the primary function of chlorophyll in photosynthesis?"
   - Example (long): "Given the following scenario about photosynthesis: [detailed scenario with context, background, specific conditions, and multiple aspects to consider]... What are the key processes involved and how do they interact?"
2. Answers should be concise and accurate, maximum 500 characters.
3. Each flashcard should test understanding of key concepts from the text.
4. If domain is not provided, detect and include the domain of knowledge for each flashcard.

Return the response as a JSON object with this exact structure:
{
  "flashcards": [
    {
      "question": "Question text (MUST be 50-10000 characters - can be concise or detailed depending on complexity)...",
      "correct_answer": "Concise answer (max 500 characters)",
      "domain": "Domain name"
    }
  ],
  "detected_domain": "Main domain detected from the text"
}

Text to analyze:
${text}

Generate at least 3-5 flashcards. Each question MUST be 50-10000 characters. Return only valid JSON, no additional text.`;

    // Step 8: Call OpenRouter.ai API
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Timeout configuration: 30 seconds for AI API call (as per plan section 8.3)
    const AI_API_TIMEOUT_MS = 30000;
    
    let aiResponse: AIResponse;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), AI_API_TIMEOUT_MS);
      
      const openRouterResponse = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': supabaseUrl,
          'X-Title': '10xCards',
        },
        body: JSON.stringify({
          model: 'amazon/nova-2-lite-v1:free',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });
      
      // Clear timeout on successful fetch
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        // Enhanced error logging with generation_session_id (as per plan section 7)
        console.error('OpenRouter API error:', {
          status: openRouterResponse.status,
          error: errorText.substring(0, 200), // Limit logged error text
          generation_session_id: generationSessionId,
          // Note: Not logging sensitive data like API keys
        });
        return new Response(
          JSON.stringify({
            error: {
              code: 'AI_SERVICE_ERROR',
              message: 'Failed to generate flashcards from AI service',
              details: {
                status: openRouterResponse.status,
              },
            },
          } as ErrorResponse),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const openRouterData = await openRouterResponse.json();
      const aiContent = openRouterData.choices?.[0]?.message?.content;

      // Log the raw response for debugging (first 500 chars)
      console.log('OpenRouter raw response:', {
        hasContent: !!aiContent,
        contentLength: aiContent?.length || 0,
        contentPreview: aiContent?.substring(0, 500) || 'No content',
        fullResponse: JSON.stringify(openRouterData).substring(0, 1000),
        generation_session_id: generationSessionId,
      });

      if (!aiContent) {
        console.error('OpenRouter response missing content:', {
          openRouterData: JSON.stringify(openRouterData).substring(0, 500),
          generation_session_id: generationSessionId,
        });
        return new Response(
          JSON.stringify({
            error: {
              code: 'AI_SERVICE_ERROR',
              message: 'Invalid response from AI service - no content in response',
              details: {
                response: openRouterData,
              },
            },
          } as ErrorResponse),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Parse AI response (handle potential markdown code blocks)
      let parsedContent = aiContent.trim();
      if (parsedContent.startsWith('```json')) {
        parsedContent = parsedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (parsedContent.startsWith('```')) {
        parsedContent = parsedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      try {
        aiResponse = JSON.parse(parsedContent) as AIResponse;
        console.log('Parsed AI response:', {
          flashcardsCount: aiResponse.flashcards?.length || 0,
          detectedDomain: aiResponse.detected_domain,
          questionLengths: aiResponse.flashcards?.map(f => f.question?.length || 0) || [],
          generation_session_id: generationSessionId,
        });
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', {
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          contentPreview: parsedContent.substring(0, 500),
          generation_session_id: generationSessionId,
        });
        return new Response(
          JSON.stringify({
            error: {
              code: 'AI_SERVICE_ERROR',
              message: 'Failed to parse AI response as JSON',
              details: {
                error: parseError instanceof Error ? parseError.message : 'Unknown error',
                contentPreview: parsedContent.substring(0, 200),
              },
            },
          } as ErrorResponse),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (error) {
      // Clear timeout in case of error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Enhanced error logging with generation_session_id for tracking (as per plan section 7)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      
      console.error('Error calling OpenRouter API:', {
        error: errorMessage,
        isTimeout,
        generation_session_id: generationSessionId,
        // Note: Not logging sensitive data like API keys or full text content
      });
      
      return new Response(
        JSON.stringify({
          error: {
            code: isTimeout ? 'AI_SERVICE_TIMEOUT' : 'AI_SERVICE_ERROR',
            message: isTimeout 
              ? 'AI service request timed out. Please try again with a shorter text.'
              : 'Error processing AI service response',
            details: {
              error: errorMessage,
            },
          },
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 9: Validate and process AI response
    if (!aiResponse.flashcards || !Array.isArray(aiResponse.flashcards)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'AI_SERVICE_ERROR',
            message: 'Invalid response format from AI service',
          },
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const detectedDomain = aiResponse.detected_domain || requestBody.domain || 'Unknown';

    // Validate and filter proposals
    const validProposals = aiResponse.flashcards
      .map((flashcard, index) => {
        const question = flashcard.question?.trim() || '';
        const correctAnswer = flashcard.correct_answer?.trim() || '';
        const domain = flashcard.domain || detectedDomain;

        // Log validation details for debugging
        const validationDetails = {
          index,
          questionLength: question.length,
          answerLength: correctAnswer.length,
          hasQuestion: !!question,
          hasAnswer: !!correctAnswer,
        };

        // Validate question length (50-10000 characters)
        if (question.length < 50 || question.length > 10000) {
          console.warn('Flashcard rejected - invalid question length:', {
            ...validationDetails,
            reason: question.length < 50 ? 'too_short' : 'too_long',
            generation_session_id: generationSessionId,
          });
          return null;
        }

        // Validate answer length (max 500 characters)
        if (correctAnswer.length === 0 || correctAnswer.length > 500) {
          console.warn('Flashcard rejected - invalid answer length:', {
            ...validationDetails,
            reason: correctAnswer.length === 0 ? 'empty' : 'too_long',
            generation_session_id: generationSessionId,
          });
          return null;
        }

        return {
          user_id: userId,
          question,
          correct_answer: correctAnswer,
          domain: domain.length > 100 ? domain.substring(0, 100) : domain,
          generation_session_id: generationSessionId,
          status: 'pending' as const,
        };
      })
      .filter((proposal) => proposal !== null);

    console.log('Validation results:', {
      totalFlashcards: aiResponse.flashcards.length,
      validProposals: validProposals.length,
      rejectedCount: aiResponse.flashcards.length - validProposals.length,
      generation_session_id: generationSessionId,
    });

    if (validProposals.length === 0) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No valid flashcards could be generated from the provided text. Please ensure the text contains enough content for generating flashcards with questions between 50-10000 characters.',
          },
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 10: Save proposals to database
    const { data: insertedProposals, error: insertError } = await supabase
      .from('flashcard_proposals')
      .insert(validProposals)
      .select();

    if (insertError) {
      // Enhanced error logging with generation_session_id (as per plan section 7)
      console.error('Database insert error:', {
        error: insertError.message,
        generation_session_id: generationSessionId,
        proposals_count: validProposals.length,
        // Note: Not logging sensitive data like user_id or proposal content
      });
      return new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to save proposals to database',
            details: {
              error: insertError.message,
            },
          },
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 11: Return success response
    const response = {
      generation_session_id: generationSessionId,
      proposals: insertedProposals.map((proposal: { id: number; question: string; correct_answer: string; domain: string | null; status: string }) => ({
        id: proposal.id,
        question: proposal.question,
        correct_answer: proposal.correct_answer,
        domain: proposal.domain,
        status: proposal.status,
      })),
      detected_domain: detectedDomain,
      total_generated: insertedProposals.length,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Enhanced error logging for unexpected errors (as per plan section 7)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined, // Limit stack trace
      // Note: Not logging sensitive data like request body or tokens
    });
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: {
            error: errorMessage,
          },
        },
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


import type { APIRoute } from 'astro';

// Mark this endpoint as dynamic (not prerendered)
export const prerender = false;

/**
 * API endpoint for creating flashcards (format compatible with course)
 * 
 * This endpoint accepts flashcards in course format (front/back/source/generation_id)
 * and maps them to Supabase format (question/correct_answer/deck_id)
 * 
 * POST /api/flashcards -> POST /rest/v1/flashcards (Supabase REST API)
 */

// Course format types
interface CourseFlashcard {
  front: string;           // Maps to question
  back: string;           // Maps to correct_answer
  source: 'manual' | 'ai'; // Source of flashcard
  generation_id?: string | null; // Optional generation session ID (for AI-generated cards)
}

interface CourseFlashcardsRequest {
  flashcards: CourseFlashcard[];
  deck_id: number;        // Required: deck ID where all flashcards will be created
}

// Supabase format types
interface SupabaseFlashcardInsert {
  deck_id: number;
  question: string;
  correct_answer: string;
  incorrect_answers?: string[]; // Required by current DB schema (can be empty array)
  image_url?: string | null;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get Supabase URL from environment
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

    // Get Authorization token from request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authorization header is required. Use: Authorization: Bearer {access_token}',
          },
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    let body: CourseFlashcardsRequest;
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
      
      body = JSON.parse(bodyText);
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

    // Validate request body structure
    if (!body.flashcards || !Array.isArray(body.flashcards)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request body must contain "flashcards" array',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (body.flashcards.length === 0) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Flashcards array cannot be empty',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!body.deck_id || typeof body.deck_id !== 'number') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'deck_id is required and must be a number',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate each flashcard and map to Supabase format
    const supabaseFlashcards: SupabaseFlashcardInsert[] = [];
    const validationErrors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < body.flashcards.length; i++) {
      const card = body.flashcards[i];
      
      // Validate required fields
      if (!card.front || typeof card.front !== 'string' || card.front.trim().length === 0) {
        validationErrors.push({
          index: i,
          error: 'front is required and must be a non-empty string',
        });
        continue;
      }

      if (!card.back || typeof card.back !== 'string' || card.back.trim().length === 0) {
        validationErrors.push({
          index: i,
          error: 'back is required and must be a non-empty string',
        });
        continue;
      }

      // Validate question length (2-10000 characters - allows single words in foreign languages)
      const question = card.front.trim();
      if (question.length < 2 || question.length > 10000) {
        validationErrors.push({
          index: i,
          error: `front (question) must be between 2 and 10000 characters (got ${question.length})`,
        });
        continue;
      }

      // Validate answer length (max 500 characters)
      const answer = card.back.trim();
      if (answer.length > 500) {
        validationErrors.push({
          index: i,
          error: `back (answer) must not exceed 500 characters (got ${answer.length})`,
        });
        continue;
      }

      // Validate source
      if (card.source && card.source !== 'manual' && card.source !== 'ai') {
        validationErrors.push({
          index: i,
          error: `source must be either "manual" or "ai" (got "${card.source}")`,
        });
        continue;
      }

      // Map to Supabase format
      supabaseFlashcards.push({
        deck_id: body.deck_id,
        question: question,
        correct_answer: answer,
        incorrect_answers: [], // Empty array for manual flashcards (no distractors)
        image_url: null, // Course format doesn't include image_url, set to null
      });
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Some flashcards failed validation',
            details: {
              total_flashcards: body.flashcards.length,
              failed_count: validationErrors.length,
              errors: validationErrors,
            },
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Forward request to Supabase REST API
    const supabaseApiUrl = `${supabaseUrl}/rest/v1/flashcards`;
    
    const response = await fetch(supabaseApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': authHeader, // Pass through the Authorization header
        'Prefer': 'return=representation', // Return created records
      },
      body: JSON.stringify(supabaseFlashcards), // Send as array for bulk insert
    });

    // Get response data
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing Supabase response:', jsonError);
        return new Response(
          JSON.stringify({
            error: {
              code: 'PARSE_ERROR',
              message: 'Failed to parse response from Supabase API',
              details: jsonError instanceof Error ? jsonError.message : 'Unknown error',
            },
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      // Non-JSON response (e.g., HTML error page)
      const text = await response.text();
      console.error('Supabase API returned non-JSON response:', text.substring(0, 500));
      
      return new Response(
        JSON.stringify({
          error: {
            code: 'SUPABASE_API_ERROR',
            message: 'Supabase API returned non-JSON response',
            details: {
              status: response.status,
              contentType,
              responsePreview: text.substring(0, 500),
            },
          },
        }),
        {
          status: response.status || 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle Supabase API errors
    if (!response.ok) {
      // Supabase returns error in data if it's JSON
      const errorMessage = data?.message || data?.error?.message || 'Unknown error from Supabase API';
      const errorCode = data?.code || data?.error?.code || 'SUPABASE_API_ERROR';
      
      return new Response(
        JSON.stringify({
          error: {
            code: errorCode,
            message: errorMessage,
            details: data,
          },
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Map response back to course format (optional, for consistency)
    // Supabase returns array of created flashcards
    const createdFlashcards = Array.isArray(data) ? data : [data];
    
    const courseFormatResponse = {
      flashcards: createdFlashcards.map((card: any) => ({
        id: card.id,
        front: card.question,
        back: card.correct_answer,
        source: body.flashcards[0]?.source || 'manual', // Use source from request
        generation_id: body.flashcards[0]?.generation_id || null,
        deck_id: card.deck_id,
        created_at: card.created_at,
      })),
      total_created: createdFlashcards.length,
    };

    // Return success response
    return new Response(JSON.stringify(courseFormatResponse), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing flashcards request:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process flashcards request',
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


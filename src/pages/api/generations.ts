import type { APIRoute } from 'astro';

// Mark this endpoint as dynamic (not prerendered)
export const prerender = false;

/**
 * API endpoint proxy for generating flashcards
 * 
 * This endpoint proxies requests to the Supabase Edge Function
 * POST /api/generations -> POST /functions/v1/generate-flashcards
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Get Supabase URL from environment
    // Default to local Supabase if not configured (for local development)
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    
    console.log('Proxying to Supabase Edge Function:', `${supabaseUrl}/functions/v1/generate-flashcards`);

    // Get request body
    let body;
    try {
      const bodyText = await request.text();
      console.log('Received request body:', bodyText.substring(0, 200));
      
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

    // Map source_text to text for compatibility with course requirements
    // Course uses source_text, but Edge Function expects text
    if (body.source_text && !body.text) {
      body.text = body.source_text;
      delete body.source_text;
    }

    // Forward request to Supabase Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-flashcards`;
    
    // Get anon key for authorization (required by Supabase Edge Functions)
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
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey, // Required by Supabase Edge Functions
        'Authorization': `Bearer ${supabaseAnonKey}`, // Also required by Supabase Edge Functions
      },
      body: JSON.stringify(body),
    });

    // Get response data - handle both JSON and non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, return error
        return new Response(
          JSON.stringify({
            error: {
              code: 'PARSE_ERROR',
              message: 'Failed to parse response from Supabase Edge Function',
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
      return new Response(
        JSON.stringify({
          error: {
            code: 'EDGE_FUNCTION_ERROR',
            message: 'Supabase Edge Function returned non-JSON response',
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

    // Return response with same status code
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error proxying request to Supabase Edge Function:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to proxy request to Supabase Edge Function',
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


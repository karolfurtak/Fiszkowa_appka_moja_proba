import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Types
interface AcceptProposalsBySessionRequest {
  generation_session_id: string;
  deck_id: number;
}

interface AcceptProposalsBySessionResponse {
  generation_session_id: string;
  accepted_count: number;
  flashcard_ids: number[];
  deck_id: number;
  message: string;
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

    // Step 3: Extract and validate user authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authorization token is required',
          },
        } as ErrorResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Get anon key for user token verification
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    if (!supabaseAnonKey) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Missing Supabase anon key configuration',
          },
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create client with anon key to verify user token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired authorization token',
          },
        } as ErrorResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create client with service role key for database operations (bypasses RLS)
    // We've already verified the user, so we can use service key for operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Step 4: Parse and validate request body
    let requestBody: AcceptProposalsBySessionRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid JSON in request body',
          },
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate required fields
    if (!requestBody.generation_session_id || typeof requestBody.generation_session_id !== 'string') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'generation_session_id is required and must be a string',
          },
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!requestBody.deck_id || typeof requestBody.deck_id !== 'number') {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'deck_id is required and must be a number',
          },
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 5: Verify deck ownership
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('id, user_id')
      .eq('id', requestBody.deck_id)
      .single();

    if (deckError || !deck) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'NOT_FOUND',
            message: 'Deck not found',
          },
        } as ErrorResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (deck.user_id !== user.id) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this deck',
          },
        } as ErrorResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 6: Fetch pending proposals for the session
    const { data: proposals, error: proposalsError } = await supabase
      .from('flashcard_proposals')
      .select('id, question, correct_answer, image_url, domain')
      .eq('generation_session_id', requestBody.generation_session_id)
      .eq('status', 'pending')
      .eq('user_id', user.id);

    if (proposalsError) {
      console.error('Error fetching proposals:', proposalsError);
      return new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch proposals',
          },
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!proposals || proposals.length === 0) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'NOT_FOUND',
            message: 'No pending proposals found for this generation session',
          },
        } as ErrorResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 7: Create flashcards from proposals
    console.log(`Creating ${proposals.length} flashcards for deck ${requestBody.deck_id}`);
    
    const flashcardInserts = proposals.map((proposal) => {
      const insert = {
        deck_id: requestBody.deck_id,
        question: proposal.question,
        correct_answer: proposal.correct_answer,
        incorrect_answers: [] as string[], // Required by current DB schema (empty array for no distractors)
        image_url: proposal.image_url || null,
        status: 'learning' as const,
        due_date: new Date().toISOString(),
        interval: 1,
        consecutive_correct_answers: 0,
      };
      console.log(`Flashcard insert: deck_id=${insert.deck_id}, question_length=${insert.question.length}, answer_length=${insert.correct_answer.length}`);
      return insert;
    });

    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .insert(flashcardInserts)
      .select('id');

    if (flashcardsError) {
      console.error('Error creating flashcards:', JSON.stringify(flashcardsError, null, 2));
      const errorMessage = flashcardsError.message || 'Failed to create flashcards';
      const errorDetails = flashcardsError.details || flashcardsError.hint || '';
      return new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: errorMessage,
            details: {
              error: errorMessage,
              details: errorDetails,
              code: flashcardsError.code,
            },
          },
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!flashcards || flashcards.length === 0) {
      console.error('No flashcards were created, but no error was returned');
      return new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create flashcards: no flashcards were created',
          },
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Successfully created ${flashcards.length} flashcards`);

    // Step 8: Update proposal statuses to 'accepted'
    const proposalIds = proposals.map((p) => p.id);
    const { error: updateError } = await supabase
      .from('flashcard_proposals')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .in('id', proposalIds);

    if (updateError) {
      console.error('Error updating proposal statuses:', updateError);
      // Note: Flashcards were created, but proposal status update failed
      // This is not critical, but should be logged
    }

    // Step 9: Return success response
    const response: AcceptProposalsBySessionResponse = {
      generation_session_id: requestBody.generation_session_id,
      accepted_count: flashcards.length,
      flashcard_ids: flashcards.map((f) => f.id),
      deck_id: requestBody.deck_id,
      message: `Successfully accepted ${flashcards.length} proposal(s) and created flashcard(s)`,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: {
            message: error instanceof Error ? error.message : String(error),
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


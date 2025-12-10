import { supabaseClient } from '../../db/supabase.client';
import type {
  FlashcardProposalResponse,
  DeckResponse,
  AcceptProposalsBySessionRequest,
  AcceptProposalsBySessionResponse,
  AcceptProposalsRequest,
  AcceptProposalsResponse,
  RejectProposalsRequest,
  RejectProposalsResponse,
  UpdateProposalRequest,
  CreateDeckRequest,
} from '../../types';

/**
 * Obsługa błędów sieciowych z timeout i offline detection
 */
function handleNetworkError(error: unknown): never {
  if (!navigator.onLine) {
    throw new Error('Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.');
  }
  if (error instanceof Error && (error.message.includes('timeout') || error.name === 'AbortError')) {
    throw new Error('Żądanie przekroczyło limit czasu. Spróbuj ponownie.');
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
}

/**
 * Pobiera propozycje fiszek dla danej sesji generowania
 */
export async function fetchProposalsBySession(
  sessionId: string
): Promise<FlashcardProposalResponse[]> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Timeout dla requestu (30 sekund)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/flashcard_proposals?generation_session_id=eq.${encodeURIComponent(sessionId)}&status=eq.pending&select=*&order=created_at.asc`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Nie znaleziono sesji generowania.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się pobrać propozycji');
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Pobiera listę talii użytkownika
 */
export async function fetchDecks(userId: string): Promise<DeckResponse[]> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/decks?user_id=eq.${encodeURIComponent(userId)}&select=*&order=name.asc`,
    {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Nie udało się pobrać talii');
  }

  return await response.json();
}

/**
 * Akceptuje wszystkie propozycje z sesji generowania
 */
export async function acceptProposalsBySession(
  request: AcceptProposalsBySessionRequest
): Promise<AcceptProposalsBySessionResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Timeout dla requestu (30 sekund)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/accept-proposals-by-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey, // Required by Supabase Edge Functions
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Nie znaleziono talii lub propozycji.');
      }
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (parseError) {
        throw new Error(`Błąd serwera: ${response.status} ${response.statusText}`);
      }
      // Extract detailed error message
      const errorMessage = errorData.error?.message || 'Nie udało się zaakceptować propozycji';
      const errorDetails = errorData.error?.details?.details || errorData.error?.details?.error || '';
      throw new Error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Akceptuje wybrane propozycje
 */
export async function acceptProposals(
  request: AcceptProposalsRequest
): Promise<AcceptProposalsResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Timeout dla requestu (30 sekund)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/accept-proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey, // Required by Supabase Edge Functions
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Nie znaleziono talii lub propozycji.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Nie udało się zaakceptować propozycji');
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Odrzuca propozycje
 * Używa REST API zamiast Edge Function (Edge Function nie istnieje)
 */
export async function rejectProposals(
  request: RejectProposalsRequest
): Promise<RejectProposalsResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Timeout dla requestu (30 sekund)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    if (request.delete) {
      // Jeśli delete=true, usuń propozycje
      // Supabase PostgREST obsługuje bulk delete przez filtrowanie po id
      const idsFilter = request.proposal_ids.map(id => `id.eq.${id}`).join(',');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/flashcard_proposals?${request.proposal_ids.map(id => `id=eq.${id}`).join('&')}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Nie udało się usunąć propozycji');
      }

      return {
        rejected_count: request.proposal_ids.length,
        message: `${request.proposal_ids.length} propozycji zostało usuniętych`,
      };
    } else {
      // Jeśli delete=false, zaktualizuj status na 'rejected'
      // Używamy PATCH z filtrem dla wielu ID
      const response = await fetch(
        `${supabaseUrl}/rest/v1/flashcard_proposals?${request.proposal_ids.map(id => `id=eq.${id}`).join('&')}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ status: 'rejected' }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Nie udało się odrzucić propozycji');
      }

      const updatedProposals = await response.json();
      return {
        rejected_count: updatedProposals.length,
        message: `${updatedProposals.length} propozycji zostało odrzuconych`,
      };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Aktualizuje propozycję
 */
export async function updateProposal(
  proposalId: number,
  updates: UpdateProposalRequest
): Promise<FlashcardProposalResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/flashcard_proposals?id=eq.${proposalId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Nie udało się zaktualizować propozycji');
  }

  const data = await response.json();
  return data[0];
}

/**
 * Tworzy nową talię
 */
export async function createDeck(request: CreateDeckRequest): Promise<DeckResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/rest/v1/decks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${session.access_token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      user_id: request.user_id,
      name: request.name.trim(),
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Nie udało się utworzyć talii');
  }

  const data = await response.json();
  return data[0];
}

/**
 * Aktualizuje domenę dla wszystkich propozycji z sesji
 */
export async function updateDomainForSession(
  sessionId: string,
  domain: string | null
): Promise<void> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/flashcard_proposals?generation_session_id=eq.${encodeURIComponent(sessionId)}&status=eq.pending`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ domain }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Nie udało się zaktualizować domeny');
  }
}


import { supabaseClient } from '../../db/supabase.client';
import type {
  DeckResponse,
  FlashcardResponse,
  FlashcardStatusFilter,
  UpdateFlashcardRequest,
  UpdateDeckRequest,
  CreateFlashcardRequest,
} from '../../types';

/**
 * Obsługa błędów sieciowych z timeout i offline detection
 */
function handleNetworkError(error: unknown): never {
  if (!navigator.onLine) {
    throw new Error('Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.');
  }
  if (error instanceof Error && error.name === 'AbortError') {
    throw new Error('Żądanie przekroczyło limit czasu. Spróbuj ponownie.');
  }
  throw new Error('Wystąpił nieoczekiwany błąd sieci. Spróbuj ponownie.');
}

/**
 * Pobiera talię po ID
 */
export async function fetchDeck(deckId: number): Promise<DeckResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/decks?id=eq.${deckId}&select=*`,
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
        throw new Error('Nie znaleziono talii.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się pobrać talii');
    }

    const data: DeckResponse[] = await response.json();
    if (!data || data.length === 0) {
      throw new Error('Nie znaleziono talii.');
    }

    return data[0];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    if (error instanceof Error && error.message === 'Nie znaleziono talii.') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Pobiera fiszki w talii z opcjonalnym filtrem statusu
 */
export async function fetchFlashcards(
  deckId: number,
  statusFilter?: FlashcardStatusFilter
): Promise<FlashcardResponse[]> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  let url = `${supabaseUrl}/rest/v1/flashcards?deck_id=eq.${deckId}&select=*&order=created_at.desc`;
  
  if (statusFilter === 'learning') {
    url += '&status=eq.learning';
  } else if (statusFilter === 'mastered') {
    url += '&status=eq.mastered';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się pobrać fiszek');
    }

    const data: FlashcardResponse[] = await response.json();
    return data || [];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Pobiera liczbę fiszek do powtórki w talii
 */
export async function getDueFlashcardsCount(deckId: number): Promise<number> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const now = new Date().toISOString();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/flashcards?deck_id=eq.${deckId}&status=eq.learning&due_date=lte.${now}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'count=exact',
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
      throw new Error(errorData.message || 'Nie udało się pobrać liczby fiszek do powtórki');
    }

    // Supabase zwraca count w nagłówku Content-Range
    const contentRange = response.headers.get('content-range');
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    // Fallback: zliczanie z odpowiedzi
    const data: Array<{ id: number }> = await response.json();
    return data.length;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Aktualizuje fiszkę
 */
export async function updateFlashcard(
  flashcardId: number,
  data: UpdateFlashcardRequest
): Promise<FlashcardResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/flashcards?id=eq.${flashcardId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Nie znaleziono fiszki.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się zaktualizować fiszki');
    }

    const updated: FlashcardResponse[] = await response.json();
    if (!updated || updated.length === 0) {
      throw new Error('Nie znaleziono fiszki.');
    }

    return updated[0];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    if (error instanceof Error && error.message === 'Nie znaleziono fiszki.') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Usuwa fiszkę
 */
export async function deleteFlashcard(flashcardId: number): Promise<void> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/flashcards?id=eq.${flashcardId}`,
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
      if (response.status === 404) {
        throw new Error('Nie znaleziono fiszki.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się usunąć fiszki');
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    if (error instanceof Error && error.message === 'Nie znaleziono fiszki.') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Aktualizuje talię
 */
export async function updateDeck(
  deckId: number,
  data: UpdateDeckRequest
): Promise<DeckResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/decks?id=eq.${deckId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Nie znaleziono talii.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się zaktualizować talii');
    }

    const updated: DeckResponse[] = await response.json();
    if (!updated || updated.length === 0) {
      throw new Error('Nie znaleziono talii.');
    }

    return updated[0];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    if (error instanceof Error && error.message === 'Nie znaleziono talii.') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Tworzy nową fiszkę
 */
export async function createFlashcard(
  data: CreateFlashcardRequest
): Promise<FlashcardResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/flashcards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Nie znaleziono talii.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się utworzyć fiszki');
    }

    const created: FlashcardResponse[] = await response.json();
    if (!created || created.length === 0) {
      throw new Error('Nie udało się utworzyć fiszki');
    }

    return created[0];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    if (error instanceof Error && error.message === 'Nie znaleziono talii.') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Usuwa talię
 */
export async function deleteDeck(deckId: number): Promise<void> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/decks?id=eq.${deckId}`,
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
      if (response.status === 404) {
        throw new Error('Nie znaleziono talii.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się usunąć talii');
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    if (error instanceof Error && error.message === 'Nie znaleziono talii.') {
      throw error;
    }
    handleNetworkError(error);
  }
}


import { supabaseClient } from '../../db/supabase.client';
import type {
  DeckResponse,
  DeckWithCountResponse,
  CreateDeckRequest,
  UpdateDeckRequest,
} from '../../types';

/**
 * Obsługa błędów sieciowych z timeout i offline detection
 */
function handleNetworkError(error: unknown): never {
  if (!navigator.onLine) {
    throw new Error('Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.');
  } else if (error instanceof Error && error.name === 'AbortError') {
    throw new Error('Żądanie przekroczyło limit czasu. Spróbuj ponownie.');
  } else {
    throw new Error('Wystąpił nieoczekiwany błąd sieci. Spróbuj ponownie.');
  }
}

/**
 * Pobiera listę talii użytkownika z liczbą fiszek
 */
export async function fetchDecksWithCounts(userId: string): Promise<DeckWithCountResponse[]> {
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
      `${supabaseUrl}/rest/v1/decks?user_id=eq.${encodeURIComponent(userId)}&select=*,flashcards(count)&order=created_at.desc`,
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się pobrać talii');
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
 * Pobiera liczbę fiszek do powtórki dla każdej talii
 */
export async function fetchDueFlashcardCounts(userId: string): Promise<Record<number, number>> {
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
    // Pobierz wszystkie talie użytkownika
    const decksResponse = await fetch(
      `${supabaseUrl}/rest/v1/decks?user_id=eq.${encodeURIComponent(userId)}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      }
    );

    if (!decksResponse.ok) {
      if (decksResponse.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Nie udało się pobrać talii');
    }

    const decks: Array<{ id: number }> = await decksResponse.json();
    const deckIds = decks.map(d => d.id);

    if (deckIds.length === 0) {
      return {};
    }

    // Pobierz liczbę fiszek do powtórki dla każdej talii
    const counts: Record<number, number> = {};

    // Supabase nie obsługuje łatwo zapytań z wieloma deck_id, więc wykonamy zapytania dla każdej talii
    // W przyszłości można to zoptymalizować używając Edge Function
    for (const deckId of deckIds) {
      try {
        const flashcardsResponse = await fetch(
          `${supabaseUrl}/rest/v1/flashcards?deck_id=eq.${deckId}&due_date=lte.${encodeURIComponent(now)}&status=eq.learning&select=id`,
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

        if (flashcardsResponse.ok) {
          const countHeader = flashcardsResponse.headers.get('content-range');
          if (countHeader) {
            const match = countHeader.match(/\/(\d+)/);
            counts[deckId] = match ? parseInt(match[1], 10) : 0;
          } else {
            const data = await flashcardsResponse.json();
            counts[deckId] = Array.isArray(data) ? data.length : 0;
          }
        } else {
          counts[deckId] = 0;
        }
      } catch {
        counts[deckId] = 0;
      }
    }

    clearTimeout(timeoutId);
    return counts;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/decks`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się utworzyć talii');
    }

    const data: DeckResponse[] = await response.json();
    return data[0];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Aktualizuje talię
 */
export async function updateDeck(deckId: number, request: UpdateDeckRequest): Promise<DeckResponse> {
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
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Nie znaleziono talii');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się zaktualizować talii');
    }

    const data: DeckResponse[] = await response.json();
    return data[0];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
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
        throw new Error('Nie znaleziono talii');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się usunąć talii');
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}


import { supabaseClient } from '../../db/supabase.client';
import type {
  FlashcardResponse,
  SubmitQuizAnswerRequest,
  SubmitQuizAnswerResponse,
  ProcessQuizSessionRequest,
  ProcessQuizSessionResponse,
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
 * Pobiera fiszki do powtórki dla danej talii
 * Tylko fiszki ze statusem 'learning' i due_date <= now()
 */
export async function fetchFlashcardsDueForReview(deckId: number): Promise<FlashcardResponse[]> {
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
      `${supabaseUrl}/rest/v1/flashcards?deck_id=eq.${deckId}&due_date=lte.${now}&status=eq.learning&select=*&order=due_date.asc`,
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
      throw new Error(errorData.message || 'Nie udało się pobrać fiszek do powtórki');
    }

    const flashcards: FlashcardResponse[] = await response.json();
    
    // Losowanie kolejności fiszek (opcjonalnie, zgodnie z planem)
    return flashcards.sort(() => Math.random() - 0.5);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Wysyła pojedynczą odpowiedź do API i aktualizuje postęp nauki
 */
export async function submitQuizAnswer(
  flashcardId: number,
  isCorrect: boolean
): Promise<SubmitQuizAnswerResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/submit-quiz-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        flashcard_id: flashcardId,
        is_correct: isCorrect,
      } as SubmitQuizAnswerRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Nie znaleziono fiszki.');
      }
      // Próba odczytania błędu z odpowiedzi
      try {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Nie udało się wysłać odpowiedzi');
      } catch (jsonError) {
        // Jeśli nie można sparsować JSON, użyj domyślnego komunikatu
        throw new Error(`Nie udało się wysłać odpowiedzi (status: ${response.status})`);
      }
    }

    // Próba parsowania odpowiedzi JSON
    try {
      const data = await response.json();
      return data as SubmitQuizAnswerResponse;
    } catch (jsonError) {
      // Błąd parsowania JSON - jeśli odpowiedź była OK, traktuj jako sukces (operacja się powiodła)
      if (response.ok) {
        // Zwróć minimalną odpowiedź z podstawowymi danymi
        return {
          flashcard_id: flashcardId,
          is_correct: isCorrect,
          updated_interval: 0,
          consecutive_correct_answers: 0,
          new_due_date: new Date().toISOString(),
          status: 'learning' as const,
          message: 'Odpowiedź została zapisana',
        } as SubmitQuizAnswerResponse;
      }
      // Jeśli odpowiedź nie była OK, rzuć błąd
      throw new Error('Nie udało się przetworzyć odpowiedzi serwera. Spróbuj ponownie.');
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    if (error instanceof Error && error.message === 'Nie znaleziono fiszki.') {
      throw error;
    }
    // Sprawdź czy błąd jest rzeczywiście błędem sieci
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      handleNetworkError(error);
    } else if (error instanceof Error && error.name === 'AbortError') {
      handleNetworkError(error);
    } else if (error instanceof Error) {
      // Przekaż oryginalny komunikat błędu
      throw error;
    } else {
      handleNetworkError(error);
    }
  }
}

/**
 * Przetwarza całą sesję treningową (opcjonalnie, jako backup)
 */
export async function processQuizSession(
  answers: ProcessQuizSessionRequest['answers']
): Promise<ProcessQuizSessionResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/process-quiz-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        answers,
      } as ProcessQuizSessionRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || errorData.message || 'Nie udało się przetworzyć sesji');
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


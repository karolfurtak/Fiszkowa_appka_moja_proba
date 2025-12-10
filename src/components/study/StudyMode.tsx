import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { fetchDeck, fetchFlashcards } from '../../lib/api/deck';
import type {
  DeckResponse,
  FlashcardResponse,
  FlashcardStatusFilter,
} from '../../types';
import { StudyBreadcrumb } from './StudyBreadcrumb';
import { StudyHeader } from './StudyHeader';
import { FlashcardFlip } from './FlashcardFlip';
import { NavigationControls } from './NavigationControls';
import { StudySidebar } from './StudySidebar';

/**
 * Propsy komponentu StudyMode
 */
interface StudyModeProps {
  /**
   * Identyfikator talii z parametru URL
   */
  deckId: number;
}

/**
 * Stan komponentu StudyMode
 */
interface StudyModeState {
  /**
   * Dane talii
   */
  deck: DeckResponse | null;
  /**
   * Lista wszystkich fiszek
   */
  flashcards: FlashcardResponse[];
  /**
   * Lista fiszek przefiltrowana według statusu
   */
  filteredFlashcards: FlashcardResponse[];
  /**
   * Aktualny indeks wyświetlanej fiszki (0-based)
   */
  currentIndex: number;
  /**
   * Aktualnie wybrany filtr statusu
   */
  statusFilter: FlashcardStatusFilter;
  /**
   * Czy karta jest odwrócona (pokazuje odpowiedź)
   */
  isFlipped: boolean;
  /**
   * Czy sidebar z listą fiszek jest otwarty
   */
  isSidebarOpen: boolean;
  /**
   * Czy dane są ładowane
   */
  isLoading: boolean;
  /**
   * Czy dane talii są ładowane
   */
  isDeckLoading: boolean;
  /**
   * Komunikat błędu (jeśli wystąpił)
   */
  error: string | null;
}

/**
 * Główny komponent widoku trybu nauki
 *
 * Wyświetla fiszki w formie odwracalnych kart z animacją flip,
 * umożliwia nawigację między fiszkami, filtrowanie po statusie
 * oraz przeglądanie listy fiszek w sidebarze.
 */
export default function StudyMode({ deckId }: StudyModeProps) {
  const [state, setState] = React.useState<StudyModeState>({
    deck: null,
    flashcards: [],
    filteredFlashcards: [],
    currentIndex: 0,
    statusFilter: 'all',
    isFlipped: false,
    isSidebarOpen: false,
    isLoading: true,
    isDeckLoading: true,
    error: null,
  });

  /**
   * Mapowanie błędów API na komunikaty w języku polskim
   */
  const mapApiError = React.useCallback((errorMessage: string): string => {
    if (errorMessage === 'Unauthorized' || errorMessage.includes('Sesja wygasła')) {
      return 'Sesja wygasła. Zaloguj się ponownie.';
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('limit czasu')) {
      return 'Żądanie przekroczyło limit czasu. Spróbuj ponownie.';
    }
    if (errorMessage.includes('Brak połączenia') || errorMessage.includes('offline')) {
      return 'Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.';
    }
    if (errorMessage.includes('Nie znaleziono talii')) {
      return 'Nie znaleziono talii.';
    }
    if (errorMessage.includes('Brak dostępu do tej talii')) {
      return 'Brak dostępu do tej talii.';
    }
    return errorMessage || 'Wystąpił błąd. Spróbuj ponownie.';
  }, []);

  /**
   * Pobieranie danych talii i fiszek
   */
  const loadData = React.useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, isDeckLoading: true, error: null }));

      const [deck, flashcards] = await Promise.all([
        fetchDeck(deckId),
        fetchFlashcards(deckId),
      ]);

      // Sprawdzenie czy talia ma fiszki
      if (flashcards.length === 0) {
        toast.info('Ta talia jest pusta. Dodaj fiszki lub wygeneruj je z tekstu.');
        setTimeout(() => {
          window.location.href = `/deck/${deckId}`;
        }, 2000);
        return;
      }

      setState((prev) => ({
        ...prev,
        deck,
        flashcards,
        filteredFlashcards: flashcards,
        isLoading: false,
        isDeckLoading: false,
        currentIndex: 0,
        isFlipped: false,
      }));
    } catch (error) {
      console.error('Error loading study mode data:', error);
      const errorMessage = mapApiError(
        error instanceof Error ? error.message : 'Nie udało się załadować danych'
      );
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        isDeckLoading: false,
      }));

      if (errorMessage === 'Sesja wygasła. Zaloguj się ponownie.') {
        toast.error(errorMessage);
        setTimeout(() => {
          window.location.href = `/login?redirect=/deck/${deckId}/study`;
        }, 2000);
      } else if (errorMessage === 'Nie znaleziono talii.' || errorMessage === 'Brak dostępu do tej talii') {
        toast.error(errorMessage);
        setTimeout(() => {
          window.location.href = `/deck/${deckId}`;
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
    }
  }, [deckId, mapApiError]);

  /**
   * Pobieranie danych po zamontowaniu komponentu
   */
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Filtrowanie fiszek na podstawie statusu
   */
  React.useEffect(() => {
    if (state.statusFilter === 'all') {
      setState((prev) => ({
        ...prev,
        filteredFlashcards: prev.flashcards,
        currentIndex: 0,
        isFlipped: false,
      }));
    } else {
      const filtered = state.flashcards.filter(
        (f) => f.status === state.statusFilter
      );
      setState((prev) => ({
        ...prev,
        filteredFlashcards: filtered,
        currentIndex: 0,
        isFlipped: false,
      }));
    }
  }, [state.statusFilter, state.flashcards]);

  /**
   * Obsługa przejścia do poprzedniej fiszki
   */
  const handlePrevious = React.useCallback(() => {
    if (state.currentIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
        isFlipped: false, // Reset flip przy zmianie fiszki
      }));
    }
  }, [state.currentIndex]);

  /**
   * Obsługa przejścia do następnej fiszki
   */
  const handleNext = React.useCallback(() => {
    if (state.currentIndex < state.filteredFlashcards.length - 1) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        isFlipped: false, // Reset flip przy zmianie fiszki
      }));
    }
  }, [state.currentIndex, state.filteredFlashcards.length]);

  /**
   * Obsługa odwrócenia karty
   */
  const handleFlip = React.useCallback(() => {
    setState((prev) => ({ ...prev, isFlipped: !prev.isFlipped }));
  }, []);

  /**
   * Obsługa zmiany filtra
   */
  const handleFilterChange = React.useCallback((filter: FlashcardStatusFilter) => {
    setState((prev) => ({ ...prev, statusFilter: filter }));
  }, []);

  /**
   * Obsługa przełączenia sidebara
   */
  const handleSidebarToggle = React.useCallback(() => {
    setState((prev) => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
  }, []);

  /**
   * Obsługa wyboru fiszki z sidebara
   */
  const handleFlashcardSelect = React.useCallback((index: number) => {
    if (index >= 0 && index < state.filteredFlashcards.length) {
      setState((prev) => ({
        ...prev,
        currentIndex: index,
        isFlipped: false,
      }));
    }
  }, [state.filteredFlashcards.length]);

  /**
   * Obsługa nawigacji klawiaturą
   */
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'Escape') {
        setState((prev) => ({ ...prev, isSidebarOpen: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, handleFlip]);

  if (state.isLoading || state.isDeckLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Ładowanie trybu nauki" />
      </div>
    );
  }

  if (state.error) {
    return (
      <Alert variant="destructive" className="w-full max-w-md mx-auto" role="alert">
        <AlertDescription>{state.error}</AlertDescription>
        <div className="mt-4">
          <Button onClick={loadData} variant="outline" size="sm">
            Spróbuj ponownie
          </Button>
        </div>
      </Alert>
    );
  }

  if (!state.deck) {
    return null;
  }

  // Empty state gdy brak fiszek
  if (state.filteredFlashcards.length === 0) {
    return (
      <main className="space-y-8" role="main">
        <StudyBreadcrumb deckName={state.deck.name} deckId={deckId} />
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4" role="status">
            {state.flashcards.length > 0
              ? 'Brak fiszek z wybranym statusem.'
              : 'Ta talia jest pusta. Dodaj fiszki lub wygeneruj je z tekstu.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {state.flashcards.length > 0 && (
              <Button
                onClick={() =>
                  setState((prev) => ({ ...prev, statusFilter: 'all' }))
                }
                variant="outline"
              >
                Pokaż wszystkie fiszki
              </Button>
            )}
            <Button
              onClick={() => (window.location.href = `/deck/${deckId}`)}
              variant="outline"
            >
              Wróć do listy fiszek
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const currentFlashcard = state.filteredFlashcards[state.currentIndex];

  return (
    <main className="space-y-8" role="main">
      {/* Breadcrumbs */}
      <StudyBreadcrumb deckName={state.deck.name} deckId={deckId} />

      {/* Nagłówek */}
      <section aria-label="Nagłówek trybu nauki">
        <StudyHeader
          deckName={state.deck.name}
          currentPosition={state.currentIndex + 1}
          totalCount={state.filteredFlashcards.length}
          statusFilter={state.statusFilter}
          isSidebarOpen={state.isSidebarOpen}
          onFilterChange={handleFilterChange}
          onSidebarToggle={handleSidebarToggle}
        />
      </section>

      {/* Główna karta */}
      <section aria-label="Karta fiszki" className="flex flex-col items-center gap-6">
        {currentFlashcard && (
          <>
            <FlashcardFlip
              flashcard={currentFlashcard}
              isFlipped={state.isFlipped}
              onFlip={handleFlip}
              onSwipeLeft={handleNext}
              onSwipeRight={handlePrevious}
            />

            {/* Przycisk "Pokaż odpowiedź" */}
            {!state.isFlipped && (
              <Button
                onClick={handleFlip}
                variant="outline"
                size="lg"
                aria-label="Pokaż odpowiedź"
              >
                Pokaż odpowiedź
              </Button>
            )}

            {/* Kontrolki nawigacji */}
            <NavigationControls
              currentIndex={state.currentIndex}
              totalCount={state.filteredFlashcards.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          </>
        )}
      </section>

      {/* Sidebar z listą fiszek */}
      <StudySidebar
        flashcards={state.filteredFlashcards}
        currentIndex={state.currentIndex}
        isOpen={state.isSidebarOpen}
        onFlashcardSelect={handleFlashcardSelect}
        onClose={() => setState((prev) => ({ ...prev, isSidebarOpen: false }))}
      />
    </main>
  );
}


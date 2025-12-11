import * as React from 'react';
import { supabaseClient } from '../../db/supabase.client';
import {
  fetchDecksWithCounts,
  fetchDueFlashcardCounts,
  createDeck,
  updateDeck,
  deleteDeck,
} from '../../lib/api/decks';
import type { DeckViewModel } from '../../types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { DeckCard } from './DeckCard';
import { CreateDeckDialog } from './CreateDeckDialog';
import { EditDeckDialog } from './EditDeckDialog';
import { DeleteDeckDialog } from './DeleteDeckDialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Stan komponentu DashboardView
 */
interface DashboardState {
  /**
   * Lista wszystkich talii użytkownika
   */
  decks: DeckViewModel[];
  /**
   * Lista talii przefiltrowana według zapytania wyszukiwania
   */
  filteredDecks: DeckViewModel[];
  /**
   * Aktualne zapytanie wyszukiwania
   */
  searchQuery: string;
  /**
   * Flaga stanu ładowania danych
   */
  isLoading: boolean;
  /**
   * Komunikat błędu (jeśli wystąpił)
   */
  error: string | null;
  /**
   * Czy dialog tworzenia talii jest otwarty
   */
  createDeckDialogOpen: boolean;
  /**
   * Czy dialog edycji talii jest otwarty
   */
  editDeckDialogOpen: boolean;
  /**
   * Czy dialog usuwania talii jest otwarty
   */
  deleteDeckDialogOpen: boolean;
  /**
   * Wybrana talia do edycji/usunięcia
   */
  selectedDeck: DeckViewModel | null;
}

/**
 * Główny komponent widoku Dashboard
 *
 * Wyświetla listę wszystkich talii użytkownika, umożliwia wyszukiwanie,
 * tworzenie nowych talii oraz nawigację do różnych funkcji aplikacji.
 */
export default function DashboardView() {
  const [state, setState] = React.useState<DashboardState>({
    decks: [],
    filteredDecks: [],
    searchQuery: '',
    isLoading: true,
    error: null,
    createDeckDialogOpen: false,
    editDeckDialogOpen: false,
    deleteDeckDialogOpen: false,
    selectedDeck: null,
  });

  /**
   * Pobieranie talii z liczbą fiszek
   */
  const loadDecks = React.useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        throw new Error('Unauthorized');
      }

      // Pobierz talie z liczbą fiszek
      const decksWithCounts = await fetchDecksWithCounts(session.user.id);

      // Pobierz liczbę fiszek do powtórki dla każdej talii
      const dueCounts = await fetchDueFlashcardCounts(session.user.id);

      // Przekształć na DeckViewModel
      const decks: DeckViewModel[] = decksWithCounts.map((deck) => {
        const totalFlashcards = deck.flashcards?.[0]?.count || 0;
        const dueFlashcards = dueCounts[deck.id] || 0;

        return {
          ...deck,
          totalFlashcards,
          dueFlashcards,
          hasDueFlashcards: dueFlashcards > 0,
        };
      });

      setState((prev) => ({
        ...prev,
        decks,
        filteredDecks: decks,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading decks:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się pobrać talii';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));

      if (errorMessage === 'Unauthorized') {
        toast.error('Sesja wygasła. Zaloguj się ponownie.');
        setTimeout(() => {
          window.location.href = '/login?redirect=/';
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
    }
  }, []);

  /**
   * Filtrowanie talii na podstawie zapytania wyszukiwania
   */
  React.useEffect(() => {
    if (!state.searchQuery.trim()) {
      setState((prev) => ({ ...prev, filteredDecks: prev.decks }));
      return;
    }

    const query = state.searchQuery.toLowerCase().trim();
    const filtered = state.decks.filter((deck) =>
      deck.name.toLowerCase().includes(query)
    );

    setState((prev) => ({ ...prev, filteredDecks: filtered }));
  }, [state.searchQuery, state.decks]);

  /**
   * Pobieranie talii po zamontowaniu komponentu
   */
  React.useEffect(() => {
    loadDecks();
  }, [loadDecks]);

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
    if (errorMessage.includes('duplicate key value violates unique constraint "decks_name_user_id_key"')) {
      return 'Talia o tej nazwie już istnieje.';
    }
    return errorMessage || 'Wystąpił błąd. Spróbuj ponownie.';
  }, []);

  /**
   * Obsługa zmiany zapytania wyszukiwania
   */
  const handleSearchChange = React.useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  /**
   * Obsługa wyczyszczenia wyszukiwania
   */
  const handleClearSearch = React.useCallback(() => {
    setState((prev) => ({ ...prev, searchQuery: '' }));
  }, []);

  /**
   * Obsługa otwarcia dialogu tworzenia talii
   */
  const handleCreateDeckClick = React.useCallback(() => {
    setState((prev) => ({ ...prev, createDeckDialogOpen: true }));
  }, []);

  /**
   * Obsługa utworzenia talii
   */
  const handleCreateDeck = React.useCallback(
    async (name: string) => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        throw new Error('Unauthorized');
      }

      await createDeck({
        name,
        user_id: session.user.id,
      });

      toast.success('Talia została utworzona');
      await loadDecks();
    },
    [loadDecks]
  );

  /**
   * Obsługa przejścia do generatora fiszek
   */
  const handleGenerateFlashcards = React.useCallback(() => {
    window.location.href = '/generate';
  }, []);

  /**
   * Obsługa kliknięcia na talię (nawigacja do szczegółów)
   */
  const handleDeckClick = React.useCallback((deckId: number) => {
    window.location.href = `/deck/${deckId}`;
  }, []);

  /**
   * Obsługa rozpoczęcia powtórki
   */
  const handleStartReview = React.useCallback((deckId: number) => {
    window.location.href = `/deck/${deckId}/review`;
  }, []);

  /**
   * Obsługa rozpoczęcia trybu nauki
   */
  const handleStartStudy = React.useCallback((deckId: number) => {
    window.location.href = `/deck/${deckId}/study`;
  }, []);

  /**
   * Obsługa otwarcia dialogu edycji talii
   */
  const handleEditClick = React.useCallback((deck: DeckViewModel) => {
    setState((prev) => ({
      ...prev,
      selectedDeck: deck,
      editDeckDialogOpen: true,
    }));
  }, []);

  /**
   * Obsługa aktualizacji talii
   */
  const handleUpdateDeck = React.useCallback(
    async (deckId: number, name: string) => {
      await updateDeck(deckId, { name });
      toast.success('Talia została zaktualizowana');
      await loadDecks();
    },
    [loadDecks]
  );

  /**
   * Obsługa otwarcia dialogu usuwania talii
   */
  const handleDeleteClick = React.useCallback((deck: DeckViewModel) => {
    setState((prev) => ({
      ...prev,
      selectedDeck: deck,
      deleteDeckDialogOpen: true,
    }));
  }, []);

  /**
   * Obsługa usunięcia talii
   */
  const handleDeleteDeck = React.useCallback(
    async (deckId: number) => {
      await deleteDeck(deckId);
      toast.success('Talia została usunięta');
      await loadDecks();
    },
    [loadDecks]
  );

  return (
    <main className="space-y-8">
      {/* Nagłówek */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">Moje talie</h1>
        
        {/* Wyszukiwarka i przyciski akcji */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <SearchBar
              searchQuery={state.searchQuery}
              onSearchChange={handleSearchChange}
            />
          </div>

          {/* Przyciski akcji */}
          <div className="flex gap-2">
            <Button onClick={handleCreateDeckClick} aria-label="Utwórz nową talię">
              Nowa talia
            </Button>
            <Button variant="outline" onClick={handleGenerateFlashcards} aria-label="Generuj fiszki">
              Generuj fiszki
            </Button>
          </div>
        </div>
      </header>

      {/* Sekcja z taliami */}
      <section aria-label="Lista talii">
        {state.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Ładowanie talii" />
          </div>
        ) : state.error ? (
          <Alert variant="destructive" className="w-full max-w-md mx-auto" role="alert">
            <AlertDescription>{state.error}</AlertDescription>
            <div className="mt-4">
              <Button onClick={loadDecks} variant="outline" size="sm">
                Spróbuj ponownie
              </Button>
            </div>
          </Alert>
        ) : state.filteredDecks.length === 0 ? (
          <EmptyState
            isSearchResult={state.searchQuery.length > 0}
            searchQuery={state.searchQuery}
            onCreateDeck={handleCreateDeckClick}
            onGenerateFlashcards={handleGenerateFlashcards}
            onClearSearch={handleClearSearch}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.filteredDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onDeckClick={handleDeckClick}
                onStartReview={handleStartReview}
                onStartStudy={handleStartStudy}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* Dialogi */}
      <CreateDeckDialog
        isOpen={state.createDeckDialogOpen}
        onClose={() => setState((prev) => ({ ...prev, createDeckDialogOpen: false }))}
        onCreateDeck={handleCreateDeck}
      />
      <EditDeckDialog
        isOpen={state.editDeckDialogOpen}
        onClose={() => setState((prev) => ({ ...prev, editDeckDialogOpen: false, selectedDeck: null }))}
        selectedDeck={state.selectedDeck}
        onUpdateDeck={handleUpdateDeck}
      />
      <DeleteDeckDialog
        isOpen={state.deleteDeckDialogOpen}
        onClose={() => setState((prev) => ({ ...prev, deleteDeckDialogOpen: false, selectedDeck: null }))}
        selectedDeck={state.selectedDeck}
        onDeleteDeck={handleDeleteDeck}
      />
    </main>
  );
}


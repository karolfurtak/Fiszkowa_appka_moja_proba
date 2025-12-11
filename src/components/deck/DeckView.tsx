import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  fetchDeck,
  fetchFlashcards,
  getDueFlashcardsCount,
  updateFlashcard,
  deleteFlashcard,
  createFlashcard,
  updateDeck,
  deleteDeck,
} from '../../lib/api/deck';
import type {
  DeckResponse,
  FlashcardResponse,
  FlashcardStatusFilter,
  DeckStats,
  UpdateFlashcardRequest,
  CreateFlashcardRequest,
} from '../../types';
import { DeckHeader } from './DeckHeader';
import { FlashcardList } from './FlashcardList';
import { FlashcardFilters } from './FlashcardFilters';
import { DeckBreadcrumb } from './DeckBreadcrumb';
import { FlashcardEmptyState } from './FlashcardEmptyState';
import { FlashcardModal } from './FlashcardModal';
import { AddFlashcardModal } from './AddFlashcardModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { EditDeckDialog } from '../dashboard/EditDeckDialog';
import { DeleteDeckDialog } from '../dashboard/DeleteDeckDialog';

/**
 * Propsy komponentu DeckView
 */
interface DeckViewProps {
  /**
   * Identyfikator talii z parametru URL
   */
  deckId: number;
}

/**
 * Stan komponentu DeckView
 */
interface DeckViewState {
  /**
   * Dane talii
   */
  deck: DeckResponse | null;
  /**
   * Lista fiszek
   */
  flashcards: FlashcardResponse[];
  /**
   * Lista fiszek przefiltrowana według statusu
   */
  filteredFlashcards: FlashcardResponse[];
  /**
   * Statystyki talii
   */
  stats: DeckStats;
  /**
   * Aktualnie wybrany filtr statusu
   */
  statusFilter: FlashcardStatusFilter;
  /**
   * Czy dane są ładowane
   */
  isLoading: boolean;
  /**
   * Komunikat błędu (jeśli wystąpił)
   */
  error: string | null;
  /**
   * Mapa rozwiniętych fiszek (id -> true)
   */
  expandedFlashcards: Set<number>;
  /**
   * Czy modal edycji fiszki jest otwarty
   */
  isEditModalOpen: boolean;
  /**
   * Czy dialog usunięcia jest otwarty
   */
  isDeleteDialogOpen: boolean;
  /**
   * Czy dialog edycji talii jest otwarty
   */
  isEditDeckDialogOpen: boolean;
  /**
   * Czy dialog usunięcia talii jest otwarty
   */
  isDeleteDeckDialogOpen: boolean;
  /**
   * Czy modal dodawania fiszki jest otwarty
   */
  isAddModalOpen: boolean;
  /**
   * Wybrana fiszka do edycji/usunięcia
   */
  selectedFlashcard: FlashcardResponse | null;
  /**
   * Typ celu usunięcia ('flashcard' | 'deck')
   */
  deleteTarget: 'flashcard' | 'deck' | null;
}

/**
 * Główny komponent widoku talii
 *
 * Wyświetla listę wszystkich fiszek w wybranej talii, umożliwia filtrowanie,
 * edycję i usuwanie fiszek oraz zarządzanie talią.
 */
export default function DeckView({ deckId }: DeckViewProps) {
  const [state, setState] = React.useState<DeckViewState>({
    deck: null,
    flashcards: [],
    filteredFlashcards: [],
    stats: {
      totalCount: 0,
      learningCount: 0,
      masteredCount: 0,
      dueCount: 0,
    },
    statusFilter: 'all',
    isLoading: true,
    error: null,
    expandedFlashcards: new Set(),
    isEditModalOpen: false,
    isDeleteDialogOpen: false,
    isEditDeckDialogOpen: false,
    isDeleteDeckDialogOpen: false,
    isAddModalOpen: false,
    selectedFlashcard: null,
    deleteTarget: null,
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
    return errorMessage || 'Wystąpił błąd. Spróbuj ponownie.';
  }, []);

  /**
   * Obliczanie statystyk talii
   */
  const calculateStats = React.useCallback(
    (flashcards: FlashcardResponse[], dueCount: number): DeckStats => {
      const learningCount = flashcards.filter((f) => f.status === 'learning').length;
      const masteredCount = flashcards.filter((f) => f.status === 'mastered').length;

      return {
        totalCount: flashcards.length,
        learningCount,
        masteredCount,
        dueCount,
      };
    },
    []
  );

  /**
   * Pobieranie danych talii i fiszek
   */
  const loadData = React.useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const [deck, flashcards, dueCount] = await Promise.all([
        fetchDeck(deckId),
        fetchFlashcards(deckId),
        getDueFlashcardsCount(deckId),
      ]);

      const stats = calculateStats(flashcards, dueCount);

      setState((prev) => ({
        ...prev,
        deck,
        flashcards,
        filteredFlashcards: flashcards,
        stats,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading deck data:', error);
      const errorMessage = mapApiError(
        error instanceof Error ? error.message : 'Nie udało się załadować danych talii'
      );
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));

      if (errorMessage === 'Sesja wygasła. Zaloguj się ponownie.') {
        toast.error(errorMessage);
        setTimeout(() => {
          window.location.href = `/login?redirect=/deck/${deckId}`;
        }, 2000);
      } else if (errorMessage === 'Nie znaleziono talii.') {
        toast.error(errorMessage);
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
    }
  }, [deckId, mapApiError, calculateStats]);

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
      setState((prev) => ({ ...prev, filteredFlashcards: prev.flashcards }));
    } else {
      const filtered = state.flashcards.filter(
        (f) => f.status === state.statusFilter
      );
      setState((prev) => ({ ...prev, filteredFlashcards: filtered }));
    }
  }, [state.statusFilter, state.flashcards]);

  /**
   * Obsługa zmiany filtra
   */
  const handleFilterChange = React.useCallback((filter: FlashcardStatusFilter) => {
    setState((prev) => ({ ...prev, statusFilter: filter }));
  }, []);

  /**
   * Obsługa rozwinięcia/zwinięcia fiszki
   */
  const handleToggleExpand = React.useCallback((flashcardId: number) => {
    setState((prev) => {
      const newExpanded = new Set(prev.expandedFlashcards);
      if (newExpanded.has(flashcardId)) {
        newExpanded.delete(flashcardId);
      } else {
        newExpanded.add(flashcardId);
      }
      return { ...prev, expandedFlashcards: newExpanded };
    });
  }, []);

  /**
   * Obsługa rozpoczęcia powtórki
   */
  const handleStartReview = React.useCallback(() => {
    if (state.stats.dueCount === 0) {
      toast.info('Brak fiszek do powtórki');
      return;
    }
    window.location.href = `/deck/${deckId}/review`;
  }, [state.stats.dueCount, deckId]);

  /**
   * Obsługa rozpoczęcia trybu nauki
   */
  const handleStartStudy = React.useCallback(() => {
    if (state.stats.totalCount === 0) {
      toast.info('Talia jest pusta');
      return;
    }
    window.location.href = `/deck/${deckId}/study`;
  }, [state.stats.totalCount, deckId]);

  /**
   * Obsługa dodania fiszki
   */
  const handleAddFlashcard = React.useCallback(() => {
    setState((prev) => ({ ...prev, isAddModalOpen: true }));
  }, []);

  /**
   * Obsługa zapisu nowej fiszki
   */
  const handleSaveNewFlashcard = React.useCallback(
    async (data: CreateFlashcardRequest) => {
      try {
        await createFlashcard(data);
        toast.success('Fiszka została dodana');
        await loadData(); // Odświeżenie danych
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Nie udało się dodać fiszki';
        toast.error(errorMessage);
        throw error;
      }
    },
    [loadData]
  );

  /**
   * Obsługa edycji talii
   */
  const handleDeckEdit = React.useCallback(() => {
    setState((prev) => ({ ...prev, isEditDeckDialogOpen: true }));
  }, []);

  /**
   * Obsługa aktualizacji talii
   */
  const handleUpdateDeck = React.useCallback(
    async (deckId: number, name: string) => {
      try {
        await updateDeck(deckId, { name });
        toast.success('Nazwa talii została zaktualizowana');
        await loadData(); // Odświeżenie danych
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Nie udało się zaktualizować talii';
        toast.error(errorMessage);
        throw error;
      }
    },
    [loadData]
  );

  /**
   * Obsługa usunięcia talii
   */
  const handleDeckDelete = React.useCallback(() => {
    setState((prev) => ({ ...prev, isDeleteDeckDialogOpen: true }));
  }, []);

  /**
   * Obsługa potwierdzenia usunięcia talii
   */
  const handleConfirmDeleteDeck = React.useCallback(async () => {
    if (!state.deck) {
      return;
    }

    try {
      await deleteDeck(state.deck.id);
      toast.success('Talia została usunięta');
      window.location.href = '/';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się usunąć talii';
      toast.error(errorMessage);
      throw error;
    }
  }, [state.deck]);

  /**
   * Obsługa edycji fiszki
   */
  const handleFlashcardEdit = React.useCallback((flashcard: FlashcardResponse) => {
    setState((prev) => ({
      ...prev,
      selectedFlashcard: flashcard,
      isEditModalOpen: true,
    }));
  }, []);

  /**
   * Obsługa zapisu zmian w fiszce
   */
  const handleSaveFlashcard = React.useCallback(
    async (data: UpdateFlashcardRequest) => {
      if (!state.selectedFlashcard) {
        return;
      }

      try {
        await updateFlashcard(state.selectedFlashcard.id, data);
        toast.success('Fiszka została zaktualizowana');
        await loadData(); // Odświeżenie danych
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Nie udało się zaktualizować fiszki';
        toast.error(errorMessage);
        throw error;
      }
    },
    [state.selectedFlashcard, loadData]
  );

  /**
   * Obsługa usunięcia fiszki
   */
  const handleFlashcardDelete = React.useCallback((flashcardId: number) => {
    const flashcard = state.flashcards.find((f) => f.id === flashcardId);
    if (!flashcard) {
      return;
    }

    setState((prev) => ({
      ...prev,
      selectedFlashcard: flashcard,
      deleteTarget: 'flashcard',
      isDeleteDialogOpen: true,
    }));
  }, [state.flashcards]);

  /**
   * Obsługa potwierdzenia usunięcia fiszki
   */
  const handleConfirmDeleteFlashcard = React.useCallback(async () => {
    if (!state.selectedFlashcard || state.deleteTarget !== 'flashcard') {
      return;
    }

    try {
      await deleteFlashcard(state.selectedFlashcard.id);
      toast.success('Fiszka została usunięta');
      await loadData(); // Odświeżenie danych
      setState((prev) => ({
        ...prev,
        isDeleteDialogOpen: false,
        selectedFlashcard: null,
        deleteTarget: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się usunąć fiszki';
      toast.error(errorMessage);
      throw error;
    }
  }, [state.selectedFlashcard, state.deleteTarget, loadData]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Ładowanie talii" />
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

  return (
    <main className="space-y-8">
      {/* Breadcrumbs */}
      <DeckBreadcrumb deckName={state.deck.name} />

      {/* Nagłówek talii */}
      <DeckHeader
        deck={state.deck}
        stats={state.stats}
        onStartReview={handleStartReview}
        onStartStudy={handleStartStudy}
        onAddFlashcard={handleAddFlashcard}
        onDeckEdit={handleDeckEdit}
        onDeckDelete={handleDeckDelete}
      />

      {/* Filtry */}
      <section aria-label="Filtry fiszek">
        <FlashcardFilters
          currentFilter={state.statusFilter}
          onFilterChange={handleFilterChange}
        />
      </section>

      {/* Lista fiszek */}
      <section aria-label="Lista fiszek">
        {state.filteredFlashcards.length === 0 ? (
          <FlashcardEmptyState onAddFlashcard={handleAddFlashcard} />
        ) : (
          <FlashcardList
            flashcards={state.filteredFlashcards}
            isLoading={false}
            expandedFlashcards={state.expandedFlashcards}
            onToggleExpand={handleToggleExpand}
            onFlashcardEdit={handleFlashcardEdit}
            onFlashcardDelete={handleFlashcardDelete}
          />
        )}
      </section>

      {/* Modal dodawania fiszki */}
      <AddFlashcardModal
        deckId={deckId}
        isOpen={state.isAddModalOpen}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            isAddModalOpen: false,
          }))
        }
        onSave={handleSaveNewFlashcard}
      />

      {/* Modal edycji fiszki */}
      <FlashcardModal
        flashcard={state.selectedFlashcard}
        isOpen={state.isEditModalOpen}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            isEditModalOpen: false,
            selectedFlashcard: null,
          }))
        }
        onSave={handleSaveFlashcard}
      />

      {/* Dialog potwierdzenia usunięcia fiszki */}
      <DeleteConfirmDialog
        isOpen={state.isDeleteDialogOpen && state.deleteTarget === 'flashcard'}
        title="Usuń fiszkę"
        description={
          state.selectedFlashcard
            ? `Czy na pewno chcesz usunąć tę fiszkę? Ta operacja jest nieodwracalna.`
            : ''
        }
        onConfirm={handleConfirmDeleteFlashcard}
        onCancel={() =>
          setState((prev) => ({
            ...prev,
            isDeleteDialogOpen: false,
            selectedFlashcard: null,
            deleteTarget: null,
          }))
        }
      />

      {/* Dialog edycji talii */}
      {state.deck && (
        <EditDeckDialog
          isOpen={state.isEditDeckDialogOpen}
          onClose={() =>
            setState((prev) => ({ ...prev, isEditDeckDialogOpen: false }))
          }
          selectedDeck={{
            ...state.deck,
            flashcards: [{ count: state.stats.totalCount }],
            totalFlashcards: state.stats.totalCount,
            dueFlashcards: state.stats.dueCount,
            hasDueFlashcards: state.stats.dueCount > 0,
          }}
          onUpdateDeck={handleUpdateDeck}
        />
      )}

      {/* Dialog usunięcia talii */}
      {state.deck && (
        <DeleteDeckDialog
          isOpen={state.isDeleteDeckDialogOpen}
          onClose={() =>
            setState((prev) => ({ ...prev, isDeleteDeckDialogOpen: false }))
          }
          selectedDeck={{
            ...state.deck,
            flashcards: [{ count: state.stats.totalCount }],
            totalFlashcards: state.stats.totalCount,
            dueFlashcards: state.stats.dueCount,
            hasDueFlashcards: state.stats.dueCount > 0,
          }}
          onDeleteDeck={handleConfirmDeleteDeck}
        />
      )}
    </main>
  );
}


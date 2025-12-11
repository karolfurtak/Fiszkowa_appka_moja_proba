import * as React from 'react';
import { supabaseClient } from '../../db/supabase.client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FlashcardProposalResponse, DeckResponse, UpdateProposalRequest } from '../../types';
import { FlashcardProposalCard } from './FlashcardProposalCard';
import { EditProposalModal } from './EditProposalModal';
import DeckSelector from './DeckSelector';
import {
  fetchProposalsBySession,
  fetchDecks,
  acceptProposalsBySession,
  acceptProposals,
  rejectProposals,
  updateProposal,
  createDeck,
  updateDomainForSession,
} from '../../lib/api/proposals';

/**
 * Propsy komponentu VerificationView
 */
interface VerificationViewProps {
  /**
   * Identyfikator sesji generowania (generation_session_id)
   */
  sessionId: string;
}

/**
 * Stan wewnętrzny komponentu VerificationView
 */
interface VerificationViewState {
  proposals: FlashcardProposalResponse[];
  decks: DeckResponse[];
  selectedProposalIds: Set<number>;
  detectedDomain: string | null;
  editedDomain: string | null;
  isDomainEditing: boolean;
  selectedDeckId: number | null;
  newDeckName: string;
  isCreatingNewDeck: boolean;
  editingProposal: FlashcardProposalResponse | null;
  isEditModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Komponent widoku weryfikacji propozycji fiszek
 * 
 * Obsługuje:
 * - Wyświetlanie listy propozycji z sesji generowania
 * - Akceptację/odrzucenie propozycji
 * - Edycję propozycji
 * - Zapisywanie propozycji do talii
 */
export default function VerificationView({ sessionId }: VerificationViewProps) {
  const [state, setState] = React.useState<VerificationViewState>({
    proposals: [],
    decks: [],
    selectedProposalIds: new Set(),
    detectedDomain: null,
    editedDomain: null,
    isDomainEditing: false,
    selectedDeckId: null,
    newDeckName: '',
    isCreatingNewDeck: false,
    editingProposal: null,
    isEditModalOpen: false,
    isLoading: true,
    error: null,
  });

  /**
   * Pobieranie propozycji z sesji generowania
   */
  const loadProposals = React.useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const proposals = await fetchProposalsBySession(sessionId);

      // Ustawienie wykrytej domeny z pierwszej propozycji
      const detectedDomain = proposals.length > 0 ? proposals[0].domain : null;

      // Domyślnie zaznacz wszystkie propozycje
      const selectedProposalIds = new Set(proposals.map(p => p.id));

      setState((prev) => ({
        ...prev,
        proposals,
        detectedDomain,
        editedDomain: detectedDomain,
        selectedProposalIds,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching proposals:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się pobrać propozycji';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      
      if (errorMessage === 'Unauthorized') {
        toast.error('Sesja wygasła. Zaloguj się ponownie.');
        setTimeout(() => {
          window.location.href = `/login?redirect=/verify/${sessionId}`;
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
    }
  }, [sessionId]);

  /**
   * Pobieranie listy talii użytkownika
   */
  const loadDecks = React.useCallback(async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        return;
      }

      const decks = await fetchDecks(session.user.id);
      setState((prev) => ({ ...prev, decks }));
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('Nie udało się pobrać listy talii');
    }
  }, []);

  // Obliczone wartości (useMemo)
  const stats = React.useMemo(() => {
    const pendingProposals = state.proposals.filter(p => p.status === 'pending');
    return {
      total: state.proposals.length,
      selected: state.selectedProposalIds.size,
      pending: pendingProposals.length,
    };
  }, [state.proposals, state.selectedProposalIds]);

  // Sprawdzenie czy wszystkie propozycje są zaznaczone
  const isAllSelected = React.useMemo(() => {
    const pendingProposals = state.proposals.filter(p => p.status === 'pending');
    return pendingProposals.length > 0 && 
           pendingProposals.every(p => state.selectedProposalIds.has(p.id));
  }, [state.proposals, state.selectedProposalIds]);

  const canSave = React.useMemo(() => {
    return (state.selectedDeckId !== null || state.isCreatingNewDeck) && 
           state.selectedProposalIds.size > 0;
  }, [state.selectedDeckId, state.isCreatingNewDeck, state.selectedProposalIds.size]);

  // Pobranie propozycji i talii po zamontowaniu komponentu
  React.useEffect(() => {
    loadProposals();
    loadDecks();
  }, [loadProposals, loadDecks]);

  /**
   * Obsługa zmiany zaznaczenia propozycji
   */
  const handleSelectChange = React.useCallback((proposalId: number, isSelected: boolean) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedProposalIds);
      if (isSelected) {
        newSelected.add(proposalId);
      } else {
        newSelected.delete(proposalId);
      }
      return { ...prev, selectedProposalIds: newSelected };
    });
  }, []);

  /**
   * Obsługa zaznaczenia/odznaczenia wszystkich propozycji
   */
  const handleToggleSelectAll = React.useCallback(() => {
    setState((prev) => {
      const pendingProposals = prev.proposals.filter(p => p.status === 'pending');
      const allSelected = pendingProposals.every(p => prev.selectedProposalIds.has(p.id));
      
      if (allSelected) {
        // Odznacz wszystkie
        return { ...prev, selectedProposalIds: new Set() };
      } else {
        // Zaznacz wszystkie propozycje ze statusem 'pending'
        return { 
          ...prev, 
          selectedProposalIds: new Set(pendingProposals.map(p => p.id)) 
        };
      }
    });
  }, []);

  /**
   * Obsługa edycji propozycji
   */
  const handleEdit = React.useCallback((proposal: FlashcardProposalResponse) => {
    setState((prev) => ({
      ...prev,
      editingProposal: proposal,
      isEditModalOpen: true,
    }));
  }, []);

  /**
   * Obsługa zapisu zmian w propozycji
   */
  const handleSaveProposal = React.useCallback(async (
    proposalId: number,
    updates: UpdateProposalRequest
  ) => {
    try {
      await updateProposal(proposalId, updates);
      toast.success('Propozycja została zaktualizowana');
      await loadProposals(); // Odświeżenie listy
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się zaktualizować propozycji';
      toast.error(errorMessage);
      throw error;
    }
  }, [loadProposals]);

  /**
   * Walidacja nazwy nowej talii
   */
  const validateNewDeckName = React.useCallback((name: string): string | null => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return 'Nazwa talii jest wymagana';
    }
    if (trimmed.length > 200) {
      return 'Nazwa talii nie może przekraczać 200 znaków';
    }
    return null;
  }, []);

  /**
   * Obsługa regeneracji dystraktorów
   */
  const handleRegenerate = React.useCallback(async (proposalId: number) => {
    toast.info('Funkcja regeneracji dystraktorów jest w trakcie implementacji');
  }, []);

  /**
   * Obsługa odrzucenia propozycji
   */
  const handleReject = React.useCallback(async (proposalId: number) => {
    try {
      await rejectProposals({ proposal_ids: [proposalId], delete: false });
      toast.success('Propozycja została odrzucona');
      await loadProposals(); // Odświeżenie listy
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się odrzucić propozycji';
      toast.error(errorMessage);
    }
  }, [loadProposals]);

  /**
   * Obsługa akceptacji wszystkich propozycji
   */
  const handleAcceptAll = React.useCallback(async () => {
    if (!state.selectedDeckId && !state.isCreatingNewDeck) {
      toast.error('Wybierz talię przed zapisaniem');
      return;
    }

    try {
      let deckId = state.selectedDeckId;

      // Jeśli tworzenie nowej talii, najpierw utwórz talię
      if (state.isCreatingNewDeck) {
        // Walidacja nazwy talii
        const nameError = validateNewDeckName(state.newDeckName);
        if (nameError) {
          toast.error(nameError);
          return;
        }

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
          throw new Error('Unauthorized');
        }

        const newDeck = await createDeck({
          user_id: session.user.id,
          name: state.newDeckName.trim(),
        });
        deckId = newDeck.id;
        setState((prev) => ({
          ...prev,
          decks: [...prev.decks, newDeck],
          selectedDeckId: newDeck.id,
          isCreatingNewDeck: false,
          newDeckName: '',
        }));
        toast.success('Talia została utworzona');
      }

      if (!deckId) {
        toast.error('Wybierz talię przed zapisaniem');
        return;
      }

      await acceptProposalsBySession({
        generation_session_id: sessionId,
        deck_id: deckId,
      });

      toast.success('Wszystkie propozycje zostały zaakceptowane');
      window.location.href = `/deck/${deckId}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się zaakceptować propozycji';
      toast.error(errorMessage);
    }
  }, [sessionId, state.selectedDeckId, state.isCreatingNewDeck, state.newDeckName, validateNewDeckName]);

  /**
   * Obsługa odrzucenia wszystkich propozycji
   */
  const handleRejectAll = React.useCallback(async () => {
    const proposalIds = Array.from(state.selectedProposalIds);
    if (proposalIds.length === 0) {
      toast.error('Nie zaznaczono żadnych propozycji');
      return;
    }

    try {
      await rejectProposals({ proposal_ids: proposalIds, delete: false });
      toast.success('Wszystkie zaznaczone propozycje zostały odrzucone');
      await loadProposals(); // Odświeżenie listy
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się odrzucić propozycji';
      toast.error(errorMessage);
    }
  }, [state.selectedProposalIds, loadProposals]);

  /**
   * Obsługa zapisu zaznaczonych propozycji
   */
  const handleSaveSelected = React.useCallback(async () => {
    if (state.selectedProposalIds.size === 0) {
      toast.error('Zaznacz przynajmniej jedną propozycję');
      return;
    }

    if (!state.selectedDeckId && !state.isCreatingNewDeck) {
      toast.error('Wybierz talię przed zapisaniem');
      return;
    }

    try {
      let deckId = state.selectedDeckId;

      // Jeśli tworzenie nowej talii, najpierw utwórz talię
      if (state.isCreatingNewDeck) {
        // Walidacja nazwy talii
        const nameError = validateNewDeckName(state.newDeckName);
        if (nameError) {
          toast.error(nameError);
          return;
        }

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
          throw new Error('Unauthorized');
        }

        const newDeck = await createDeck({
          user_id: session.user.id,
          name: state.newDeckName.trim(),
        });
        deckId = newDeck.id;
        setState((prev) => ({
          ...prev,
          decks: [...prev.decks, newDeck],
          selectedDeckId: newDeck.id,
          isCreatingNewDeck: false,
          newDeckName: '',
        }));
        toast.success('Talia została utworzona');
      }

      if (!deckId) {
        toast.error('Wybierz talię przed zapisaniem');
        return;
      }

      await acceptProposals({
        proposal_ids: Array.from(state.selectedProposalIds),
        deck_id: deckId,
      });

      toast.success('Propozycje zostały zapisane do talii');
      window.location.href = `/deck/${deckId}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się zapisać propozycji';
      toast.error(errorMessage);
    }
  }, [state.selectedProposalIds, state.selectedDeckId, state.isCreatingNewDeck, state.newDeckName, validateNewDeckName]);

  /**
   * Walidacja domeny wiedzy
   */
  const validateDomain = React.useCallback((domain: string | null): string | null => {
    if (domain === null || domain.trim().length === 0) {
      return null; // Domena jest opcjonalna
    }
    if (domain.trim().length > 100) {
      return 'Domena nie może przekraczać 100 znaków';
    }
    return null;
  }, []);

  /**
   * Obsługa zapisu domeny dla wszystkich propozycji
   */
  const handleDomainSave = React.useCallback(async () => {
    // Walidacja domeny przed zapisaniem
    const domainError = validateDomain(state.editedDomain);
    if (domainError) {
      toast.error(domainError);
      return;
    }

    try {
      await updateDomainForSession(sessionId, state.editedDomain);
      setState((prev) => ({
        ...prev,
        detectedDomain: prev.editedDomain,
        isDomainEditing: false,
      }));
      toast.success('Domena została zaktualizowana');
      await loadProposals(); // Odświeżenie listy
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się zaktualizować domeny';
      toast.error(errorMessage);
    }
  }, [sessionId, state.editedDomain, loadProposals, validateDomain]);

  // Pokazanie loading state podczas pobierania danych
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Ładowanie propozycji...</p>
        </div>
      </div>
    );
  }

  // Pokazanie komunikatu błędu
  if (state.error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
        <div className="flex gap-4">
        <Button onClick={() => loadProposals()} variant="outline">
          Spróbuj ponownie
        </Button>
          <Button onClick={() => (window.location.href = '/generate')} variant="outline">
            Wróć do generatora
          </Button>
        </div>
      </div>
    );
  }

  // Pokazanie empty state jeśli brak propozycji
  if (state.proposals.length === 0) {
    return (
      <div className="space-y-4 text-center py-16">
        <h1 className="text-3xl font-bold">Weryfikacja propozycji fiszek</h1>
        <p className="text-muted-foreground">
          Nie znaleziono propozycji dla tej sesji generowania.
        </p>
        <Button onClick={() => (window.location.href = '/generate')} variant="outline">
          Wróć do generatora
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold" id="verification-title">Weryfikacja propozycji fiszek</h1>
        
        {/* Sekcja domeny wiedzy */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Wykryta dziedzina: <span className="font-medium text-foreground">{state.detectedDomain || 'Brak'}</span>
          </div>
          {!state.isDomainEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState((prev) => ({ ...prev, isDomainEditing: true }))}
            >
              Zmień
            </Button>
          )}
        </div>

        {/* Edytor domeny */}
        {state.isDomainEditing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 max-w-md">
                <Input
                  type="text"
                  value={state.editedDomain || ''}
                  onChange={(e) => setState((prev) => ({ ...prev, editedDomain: e.target.value }))}
                  placeholder="Wprowadź domenę wiedzy"
                  maxLength={100}
                  aria-label="Domena wiedzy"
                  aria-describedby="domain-editor-description domain-editor-counter"
                />
                <div 
                  id="domain-editor-counter"
                  className="text-xs text-muted-foreground text-right mt-1"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {(state.editedDomain || '').length} / 100 znaków
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleDomainSave}
                aria-label="Zapisz zmianę domeny"
              >
                Zapisz
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState((prev) => ({ 
                  ...prev, 
                  isDomainEditing: false, 
                  editedDomain: prev.detectedDomain 
                }))}
                aria-label="Anuluj zmianę domeny"
              >
                Anuluj
              </Button>
            </div>
            <p id="domain-editor-description" className="text-xs text-muted-foreground">
              Domena wiedzy będzie zastosowana do wszystkich propozycji z tej sesji generowania.
            </p>
          </div>
        )}

        {/* Statystyki */}
        <div 
          className="text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {state.selectedProposalIds.size} zaznaczonych / {state.proposals.length} łącznie
        </div>
      </header>

      {/* Pasek akcji */}
      <div className="flex items-center gap-4 border-b pb-4" role="toolbar" aria-label="Akcje na propozycjach">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={isAllSelected}
            onCheckedChange={handleToggleSelectAll}
            aria-label="Zaznacz wszystkie propozycje"
          />
          <Label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
            onClick={handleToggleSelectAll}
          >
            Zaznacz wszystkie
          </Label>
        </div>
        <Button
          variant="outline"
          onClick={handleAcceptAll}
          disabled={state.proposals.length === 0}
          aria-label="Akceptuj wszystkie propozycje"
        >
          Akceptuj wszystkie
        </Button>
        <Button
          variant="outline"
          onClick={handleRejectAll}
          disabled={state.selectedProposalIds.size === 0}
          aria-label="Odrzuć wszystkie zaznaczone propozycje"
        >
          Odrzuć wszystkie
        </Button>
      </div>

      {/* Lista propozycji */}
      <section aria-labelledby="verification-title" aria-label="Lista propozycji fiszek">
        <div className="space-y-4" role="list">
          {state.proposals.map((proposal) => (
            <div key={proposal.id} role="listitem">
              <FlashcardProposalCard
                proposal={proposal}
                isSelected={state.selectedProposalIds.has(proposal.id)}
                onSelectChange={handleSelectChange}
                onEdit={handleEdit}
                onRegenerate={handleRegenerate}
                onReject={handleReject}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stopka z selektorem talii i przyciskami zapisu */}
      <footer className="border-t pt-6 space-y-4" role="contentinfo">
        <DeckSelector
          decks={state.decks}
          selectedDeckId={state.selectedDeckId}
          isCreatingNewDeck={state.isCreatingNewDeck}
          newDeckName={state.newDeckName}
          onDeckChange={(deckId) => setState((prev) => ({ ...prev, selectedDeckId: deckId }))}
          onNewDeckToggle={(isCreating) => setState((prev) => ({ 
            ...prev, 
            isCreatingNewDeck: isCreating,
            selectedDeckId: isCreating ? null : prev.selectedDeckId,
          }))}
          onNewDeckNameChange={(name) => setState((prev) => ({ ...prev, newDeckName: name }))}
          error={
            canSave === false && (state.selectedDeckId === null && !state.isCreatingNewDeck)
              ? 'Musisz wybrać talię przed zapisaniem'
              : state.isCreatingNewDeck && state.newDeckName.trim().length === 0
              ? 'Nazwa talii jest wymagana'
              : state.isCreatingNewDeck && state.newDeckName.trim().length > 200
              ? 'Nazwa talii nie może przekraczać 200 znaków'
              : undefined
          }
        />

        <div className="flex gap-4" role="group" aria-label="Akcje zapisu">
          <Button
            onClick={handleAcceptAll}
            disabled={(!state.selectedDeckId && !state.isCreatingNewDeck) || state.proposals.length === 0}
            aria-label="Zapisz wszystkie propozycje do wybranej talii"
          >
            Zapisz wszystkie
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveSelected}
            disabled={state.selectedProposalIds.size === 0 || (!state.selectedDeckId && !state.isCreatingNewDeck)}
            aria-label={`Zapisz ${state.selectedProposalIds.size} zaznaczonych propozycji do wybranej talii`}
          >
            Zapisz zatwierdzone ({state.selectedProposalIds.size})
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/generate')}
            aria-label="Anuluj i wróć do generatora"
          >
            Anuluj
          </Button>
        </div>
      </footer>

      {/* Modal edycji propozycji */}
      <EditProposalModal
        proposal={state.editingProposal}
        isOpen={state.isEditModalOpen}
        onClose={() => setState((prev) => ({ ...prev, isEditModalOpen: false, editingProposal: null }))}
        onSave={handleSaveProposal}
      />
    </div>
  );
}


import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { DeckResponse } from '../../types';

/**
 * Propsy komponentu DeckSelector
 */
interface DeckSelectorProps {
  /**
   * Lista dostępnych talii
   */
  decks: DeckResponse[];
  /**
   * Wybrana talia (ID lub null)
   */
  selectedDeckId: number | null;
  /**
   * Czy tworzenie nowej talii
   */
  isCreatingNewDeck: boolean;
  /**
   * Nazwa nowej talii
   */
  newDeckName: string;
  /**
   * Callback zmiany talii
   */
  onDeckChange: (deckId: number | null) => void;
  /**
   * Callback przełączenia trybu tworzenia
   */
  onNewDeckToggle: (isCreating: boolean) => void;
  /**
   * Callback zmiany nazwy nowej talii
   */
  onNewDeckNameChange: (name: string) => void;
  /**
   * Komunikat błędu walidacji
   */
  error?: string | null;
}

/**
 * Stan komponentu DeckSelector
 */
interface DeckSelectorState {
  /**
   * Błąd walidacji nazwy nowej talii
   */
  nameError: string | null;
  /**
   * Czy pole nazwy było dotknięte
   */
  nameTouched: boolean;
}

/**
 * Komponent selektora talii
 * 
 * Umożliwia wybór istniejącej talii lub utworzenie nowej.
 * Wyświetla dropdown z listą talii oraz pole tekstowe dla nazwy nowej talii (jeśli wybrano opcję tworzenia).
 */
const DeckSelector = React.memo(function DeckSelector({
  decks,
  selectedDeckId,
  isCreatingNewDeck,
  newDeckName,
  onDeckChange,
  onNewDeckToggle,
  onNewDeckNameChange,
  error,
}: DeckSelectorProps) {
  const [state, setState] = React.useState<DeckSelectorState>({
    nameError: null,
    nameTouched: false,
  });

  /**
   * Walidacja nazwy nowej talii
   */
  const validateDeckName = React.useCallback((name: string): string | null => {
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
   * Obsługa zmiany wartości w dropdown
   */
  const handleSelectChange = React.useCallback((value: string) => {
    if (value === 'new') {
      // Przełączenie na tryb tworzenia nowej talii
      onNewDeckToggle(true);
      onDeckChange(null);
    } else {
      // Wybór istniejącej talii
      const deckId = parseInt(value, 10);
      if (!isNaN(deckId)) {
        onDeckChange(deckId);
        onNewDeckToggle(false);
        // Reset błędu nazwy
        setState((prev) => ({ ...prev, nameError: null, nameTouched: false }));
      }
    }
  }, [onDeckChange, onNewDeckToggle]);

  /**
   * Obsługa zmiany nazwy nowej talii
   */
  const handleNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onNewDeckNameChange(value);
    
    // Walidacja jeśli pole było dotknięte
    if (state.nameTouched) {
      const error = validateDeckName(value);
      setState((prev) => ({ ...prev, nameError: error }));
    }
  }, [onNewDeckNameChange, state.nameTouched, validateDeckName]);

  /**
   * Obsługa opuszczenia pola nazwy
   */
  const handleNameBlur = React.useCallback(() => {
    setState((prev) => {
      const error = validateDeckName(newDeckName);
      return {
        ...prev,
        nameTouched: true,
        nameError: error,
      };
    });
  }, [newDeckName, validateDeckName]);

  // Obliczona wartość dla Select (string reprezentacja ID lub 'new')
  const selectValue = React.useMemo(() => {
    if (isCreatingNewDeck) {
      return 'new';
    }
    if (selectedDeckId !== null) {
      return selectedDeckId.toString();
    }
    return undefined;
  }, [isCreatingNewDeck, selectedDeckId]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deck-select" id="deck-select-label">
          Wybierz talię
        </Label>
        <Select
          value={selectValue}
          onValueChange={handleSelectChange}
          aria-labelledby="deck-select-label"
          aria-describedby={error ? 'deck-select-error' : undefined}
        >
          <SelectTrigger id="deck-select" className="w-full">
            <SelectValue placeholder="Wybierz talię lub utwórz nową" />
          </SelectTrigger>
          <SelectContent>
            {decks.map((deck) => (
              <SelectItem key={deck.id} value={deck.id.toString()}>
                {deck.name}
              </SelectItem>
            ))}
            <SelectItem value="new">Utwórz nową talię</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Komunikat błędu ogólnego */}
        {error && (
          <Alert variant="destructive" id="deck-select-error" role="alert" aria-live="polite">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Pole nazwy nowej talii (warunkowo renderowane) */}
      {isCreatingNewDeck && (
        <div className="space-y-2">
          <Label htmlFor="new-deck-name" id="new-deck-name-label">
            Nazwa nowej talii
          </Label>
          <Input
            id="new-deck-name"
            type="text"
            value={newDeckName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            placeholder="Wprowadź nazwę talii"
            maxLength={200}
            aria-labelledby="new-deck-name-label"
            aria-describedby={state.nameError ? 'new-deck-name-error' : undefined}
            aria-invalid={!!state.nameError}
            aria-required="true"
            className={state.nameError ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          
          {/* Komunikat błędu walidacji nazwy */}
          {state.nameTouched && state.nameError && (
            <Alert variant="destructive" id="new-deck-name-error" role="alert" aria-live="polite">
              <AlertDescription>{state.nameError}</AlertDescription>
            </Alert>
          )}
          
          {/* Licznik znaków */}
          <div className="text-sm text-muted-foreground text-right" aria-live="polite" aria-atomic="true">
            {newDeckName.length} / 200 znaków
          </div>
        </div>
      )}
    </div>
  );
});

export default DeckSelector;


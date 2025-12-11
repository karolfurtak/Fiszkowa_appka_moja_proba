import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { DeckViewModel } from '../../types';

/**
 * Propsy komponentu EditDeckDialog
 */
interface EditDeckDialogProps {
  /**
   * Czy dialog jest otwarty
   */
  isOpen: boolean;
  /**
   * Callback zamknięcia dialogu
   */
  onClose: () => void;
  /**
   * Wybrana talia do edycji
   */
  selectedDeck: DeckViewModel | null;
  /**
   * Callback aktualizacji talii
   */
  onUpdateDeck: (deckId: number, name: string) => Promise<void>;
}

/**
 * Komponent dialogu edycji talii
 *
 * Wyświetla formularz z polem nazwy talii (wstępnie wypełnionym) i przyciskami akcji.
 */
export const EditDeckDialog = React.memo(function EditDeckDialog({
  isOpen,
  onClose,
  selectedDeck,
  onUpdateDeck,
}: EditDeckDialogProps) {
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Aktualizacja nazwy przy zmianie selectedDeck lub otwarciu dialogu
   */
  React.useEffect(() => {
    if (isOpen && selectedDeck) {
      setName(selectedDeck.name);
      setError(null);
      setIsSubmitting(false);
      // Fokus na pole input przy otwarciu
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    } else if (!isOpen) {
      setName('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, selectedDeck]);

  /**
   * Walidacja nazwy talii
   */
  const validateName = React.useCallback((value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Nazwa talii jest wymagana';
    }
    if (trimmed.length < 2) {
      return 'Nazwa talii musi mieć co najmniej 2 znaki';
    }
    if (trimmed.length > 200) {
      return 'Nazwa talii nie może przekraczać 200 znaków';
    }
    return null;
  }, []);

  /**
   * Obsługa zmiany nazwy
   */
  const handleNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (error) {
      setError(validateName(value));
    }
  }, [error, validateName]);

  /**
   * Obsługa submit formularza
   */
  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!selectedDeck) {
        return;
      }

      const validationError = validateName(name);
      if (validationError) {
        setError(validationError);
        inputRef.current?.focus();
        return;
      }

      // Sprawdź czy nazwa się zmieniła
      if (name.trim() === selectedDeck.name) {
        onClose();
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await onUpdateDeck(selectedDeck.id, name.trim());
        onClose();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Nie udało się zaktualizować talii';
        setError(errorMessage);
        inputRef.current?.focus();
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, selectedDeck, validateName, onUpdateDeck, onClose]
  );

  /**
   * Obsługa zamknięcia dialogu
   */
  const handleClose = React.useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  /**
   * Obsługa klawisza Escape
   */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    },
    [isSubmitting, handleClose]
  );

  if (!selectedDeck) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent onKeyDown={handleKeyDown} aria-describedby="edit-deck-description">
        <DialogHeader>
          <DialogTitle>Edytuj talię</DialogTitle>
          <DialogDescription id="edit-deck-description">
            Zmień nazwę talii &quot;{selectedDeck.name}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-deck-name">Nazwa talii</Label>
              <Input
                id="edit-deck-name"
                ref={inputRef}
                type="text"
                placeholder="np. Historia Polski"
                value={name}
                onChange={handleNameChange}
                disabled={isSubmitting}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'edit-deck-name-error' : undefined}
                maxLength={200}
                autoComplete="off"
              />
              {error && (
                <p id="edit-deck-name-error" className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Propsy komponentu CreateDeckDialog
 */
interface CreateDeckDialogProps {
  /**
   * Czy dialog jest otwarty
   */
  isOpen: boolean;
  /**
   * Callback zamknięcia dialogu
   */
  onClose: () => void;
  /**
   * Callback utworzenia talii
   */
  onCreateDeck: (name: string) => Promise<void>;
}

/**
 * Komponent dialogu tworzenia nowej talii
 *
 * Wyświetla formularz z polem nazwy talii i przyciskami akcji.
 */
export const CreateDeckDialog = React.memo(function CreateDeckDialog({
  isOpen,
  onClose,
  onCreateDeck,
}: CreateDeckDialogProps) {
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Resetowanie formularza przy zamknięciu dialogu
   */
  React.useEffect(() => {
    if (!isOpen) {
      setName('');
      setError(null);
      setIsSubmitting(false);
    } else {
      // Fokus na pole input przy otwarciu
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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
      
      const validationError = validateName(name);
      if (validationError) {
        setError(validationError);
        inputRef.current?.focus();
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await onCreateDeck(name.trim());
        onClose();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Nie udało się utworzyć talii';
        setError(errorMessage);
        inputRef.current?.focus();
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, validateName, onCreateDeck, onClose]
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        onKeyDown={handleKeyDown} 
        aria-describedby="create-deck-description"
      >
        <DialogHeader>
          <DialogTitle>Utwórz nową talię</DialogTitle>
          <DialogDescription id="create-deck-description">
            Wprowadź nazwę dla nowej talii fiszek.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deck-name">Nazwa talii</Label>
              <Input
                id="deck-name"
                ref={inputRef}
                type="text"
                placeholder="np. Historia Polski"
                value={name}
                onChange={handleNameChange}
                disabled={isSubmitting}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'deck-name-error' : undefined}
                maxLength={200}
                autoComplete="off"
              />
              {error && (
                <p id="deck-name-error" className="text-sm text-destructive" role="alert">
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
              Utwórz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

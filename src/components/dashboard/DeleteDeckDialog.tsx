import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { DeckViewModel } from '../../types';

/**
 * Propsy komponentu DeleteDeckDialog
 */
interface DeleteDeckDialogProps {
  /**
   * Czy dialog jest otwarty
   */
  isOpen: boolean;
  /**
   * Callback zamknięcia dialogu
   */
  onClose: () => void;
  /**
   * Wybrana talia do usunięcia
   */
  selectedDeck: DeckViewModel | null;
  /**
   * Callback usunięcia talii
   */
  onDeleteDeck: (deckId: number) => Promise<void>;
}

/**
 * Komponent dialogu potwierdzenia usunięcia talii
 *
 * Wyświetla ostrzeżenie i przyciski potwierdzenia/usunięcia.
 */
export const DeleteDeckDialog = React.memo(function DeleteDeckDialog({
  isOpen,
  onClose,
  selectedDeck,
  onDeleteDeck,
}: DeleteDeckDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Resetowanie stanu przy zamknięciu dialogu
   */
  React.useEffect(() => {
    if (!isOpen) {
      setIsDeleting(false);
      setError(null);
    }
  }, [isOpen]);

  /**
   * Obsługa usunięcia talii
   */
  const handleDelete = React.useCallback(
    async () => {
      if (!selectedDeck) {
        return;
      }

      setIsDeleting(true);
      setError(null);

      try {
        await onDeleteDeck(selectedDeck.id);
        onClose();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Nie udało się usunąć talii';
        setError(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    },
    [selectedDeck, onDeleteDeck, onClose]
  );

  /**
   * Obsługa zamknięcia dialogu
   */
  const handleClose = React.useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  /**
   * Obsługa klawisza Escape
   */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        handleClose();
      }
    },
    [isDeleting, handleClose]
  );

  if (!selectedDeck) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent onKeyDown={handleKeyDown} aria-describedby="delete-deck-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
            Usuń talię
          </DialogTitle>
          <DialogDescription id="delete-deck-description">
            Czy na pewno chcesz usunąć talię &quot;{selectedDeck.name}&quot;?
            <br />
            Ta operacja jest nieodwracalna. Wszystkie fiszki w tej talii zostaną również usunięte.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3" role="alert">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Usuń
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

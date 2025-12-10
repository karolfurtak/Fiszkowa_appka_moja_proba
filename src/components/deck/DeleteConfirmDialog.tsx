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

/**
 * Propsy komponentu DeleteConfirmDialog
 */
interface DeleteConfirmDialogProps {
  /**
   * Czy dialog jest otwarty
   */
  isOpen: boolean;
  /**
   * Tytuł dialogu
   */
  title: string;
  /**
   * Opis akcji do wykonania
   */
  description: string;
  /**
   * Callback potwierdzenia usunięcia
   */
  onConfirm: () => Promise<void>;
  /**
   * Callback anulowania
   */
  onCancel: () => void;
}

/**
 * Komponent dialogu potwierdzenia usunięcia
 *
 * Uniwersalny dialog do potwierdzania usunięcia fiszek lub talii.
 * Wyświetla ostrzeżenie i przyciski potwierdzenia/anulowania.
 */
export const DeleteConfirmDialog = React.memo(function DeleteConfirmDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
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
   * Obsługa potwierdzenia usunięcia
   */
  const handleConfirm = React.useCallback(async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
      // Dialog zostanie zamknięty przez komponent nadrzędny po sukcesie
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się usunąć';
      setError(errorMessage);
      setIsDeleting(false);
    }
  }, [onConfirm]);

  /**
   * Obsługa zamknięcia dialogu
   */
  const handleClose = React.useCallback(() => {
    if (!isDeleting) {
      onCancel();
    }
  }, [isDeleting, onCancel]);

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent onKeyDown={handleKeyDown} aria-describedby="delete-dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
            {title}
          </DialogTitle>
          <DialogDescription id="delete-dialog-description">
            {description}
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
            onClick={handleConfirm}
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


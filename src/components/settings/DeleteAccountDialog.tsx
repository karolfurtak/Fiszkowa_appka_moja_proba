import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

/**
 * Propsy komponentu DeleteAccountDialog
 */
interface DeleteAccountDialogProps {
  /**
   * Czy modal jest otwarty
   */
  isOpen: boolean;
  /**
   * Wartość pola potwierdzenia
   */
  confirmation: string;
  /**
   * Czy konto jest usuwane (loading)
   */
  isDeleting: boolean;
  /**
   * Callback zamknięcia modala
   */
  onClose: () => void;
  /**
   * Callback zmiany wartości potwierdzenia
   */
  onConfirmationChange: (value: string) => void;
  /**
   * Callback potwierdzenia usunięcia konta
   */
  onConfirm: () => void;
}

/**
 * Wymagane potwierdzenie do usunięcia konta
 */
const REQUIRED_CONFIRMATION = 'USUŃ';

/**
 * Komponent modala potwierdzenia usunięcia konta
 *
 * Zawiera ostrzeżenie o trwałym usunięciu danych oraz pole potwierdzenia
 * wymagające wpisania "USUŃ". Przycisk usunięcia jest nieaktywny dopóki
 * użytkownik nie wpisze poprawnego potwierdzenia.
 */
export const DeleteAccountDialog = React.memo(function DeleteAccountDialog({
  isOpen,
  confirmation,
  isDeleting,
  onClose,
  onConfirmationChange,
  onConfirm,
}: DeleteAccountDialogProps) {
  const dialogId = React.useId();
  const confirmationId = `${dialogId}-confirmation`;

  /**
   * Czy potwierdzenie jest poprawne
   */
  const isConfirmationValid = React.useMemo(() => {
    return confirmation === REQUIRED_CONFIRMATION;
  }, [confirmation]);

  /**
   * Obsługa zmiany wartości pola potwierdzenia
   */
  const handleConfirmationChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConfirmationChange(e.target.value);
    },
    [onConfirmationChange]
  );

  /**
   * Obsługa potwierdzenia usunięcia konta
   */
  const handleConfirm = React.useCallback(() => {
    if (isConfirmationValid && !isDeleting) {
      onConfirm();
    }
  }, [isConfirmationValid, isDeleting, onConfirm]);

  /**
   * Obsługa zamknięcia modala
   */
  const handleClose = React.useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  /**
   * Reset pola potwierdzenia przy zamknięciu modala
   */
  React.useEffect(() => {
    if (!isOpen) {
      onConfirmationChange('');
    }
  }, [isOpen, onConfirmationChange]);

  /**
   * Obsługa klawisza Enter w polu potwierdzenia
   */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && isConfirmationValid && !isDeleting) {
        e.preventDefault();
        handleConfirm();
      }
    },
    [isConfirmationValid, isDeleting, handleConfirm]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Usunięcie konta</DialogTitle>
          <DialogDescription>
            Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte.
          </DialogDescription>
        </DialogHeader>

        {/* Ostrzeżenie */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Uwaga:</strong> Usunięcie konta spowoduje trwałe usunięcie wszystkich Twoich
            danych, w tym:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Wszystkich talii i fiszek</li>
              <li>Historii nauki i postępów</li>
              <li>Preferencji użytkownika</li>
            </ul>
            Tej operacji nie można cofnąć.
          </AlertDescription>
        </Alert>

        {/* Pole potwierdzenia */}
        <div className="space-y-2">
          <Label htmlFor={confirmationId}>
            Aby potwierdzić, wpisz <strong>{REQUIRED_CONFIRMATION}</strong> w polu poniżej:
          </Label>
          <Input
            id={confirmationId}
            type="text"
            value={confirmation}
            onChange={handleConfirmationChange}
            onKeyDown={handleKeyDown}
            disabled={isDeleting}
            placeholder={REQUIRED_CONFIRMATION}
            aria-invalid={!isConfirmationValid && confirmation.length > 0}
            aria-describedby={
              !isConfirmationValid && confirmation.length > 0
                ? `${confirmationId}-error`
                : undefined
            }
            className={
              !isConfirmationValid && confirmation.length > 0 ? 'border-destructive' : ''
            }
          />
          {!isConfirmationValid && confirmation.length > 0 && (
            <p id={`${confirmationId}-error`} className="text-sm text-destructive" role="alert">
              Wpisz '{REQUIRED_CONFIRMATION}' aby potwierdzić usunięcie konta
            </p>
          )}
        </div>

        {/* Stopka z przyciskami */}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isDeleting}
          >
            {isDeleting ? 'Usuwanie konta...' : 'Usuń konto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});


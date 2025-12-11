import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Propsy komponentu PasswordChangeForm
 */
interface PasswordChangeFormProps {
  /**
   * Wartość starego hasła
   */
  oldPassword: string;
  /**
   * Wartość nowego hasła
   */
  newPassword: string;
  /**
   * Wartość potwierdzenia hasła
   */
  confirmPassword: string;
  /**
   * Błędy walidacji dla każdego pola
   */
  errors: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  /**
   * Czy hasło jest zmieniane (loading)
   */
  isChanging: boolean;
  /**
   * Czy zmiana hasła zakończyła się sukcesem
   */
  success: boolean;
  /**
   * Callback zmiany starego hasła
   */
  onOldPasswordChange: (value: string) => void;
  /**
   * Callback zmiany nowego hasła
   */
  onNewPasswordChange: (value: string) => void;
  /**
   * Callback zmiany potwierdzenia hasła
   */
  onConfirmPasswordChange: (value: string) => void;
  /**
   * Callback wysłania formularza
   */
  onSubmit: () => void;
  /**
   * Callback resetu komunikatu sukcesu
   */
  onSuccessReset: () => void;
}

/**
 * Komponent formularza zmiany hasła
 *
 * Zawiera pola starego hasła, nowego hasła i potwierdzenia hasła.
 * Obsługuje walidację inline oraz wyświetlanie komunikatów błędów i sukcesu.
 */
export const PasswordChangeForm = React.memo(function PasswordChangeForm({
  oldPassword,
  newPassword,
  confirmPassword,
  errors,
  isChanging,
  success,
  onOldPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onSuccessReset,
}: PasswordChangeFormProps) {
  const formId = React.useId();
  const oldPasswordId = `${formId}-old-password`;
  const newPasswordId = `${formId}-new-password`;
  const confirmPasswordId = `${formId}-confirm-password`;

  /**
   * Walidacja formularza
   */
  const isFormValid = React.useMemo(() => {
    return (
      oldPassword.length > 0 &&
      newPassword.length >= 8 &&
      /[a-zA-Z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      newPassword === confirmPassword &&
      Object.keys(errors).length === 0
    );
  }, [oldPassword, newPassword, confirmPassword, errors]);

  /**
   * Obsługa submit formularza
   */
  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isFormValid && !isChanging) {
        onSubmit();
      }
    },
    [isFormValid, isChanging, onSubmit]
  );

  /**
   * Auto-ukrywanie komunikatu sukcesu po 3 sekundach
   */
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onSuccessReset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, onSuccessReset]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Pole starego hasła */}
      <div className="space-y-2">
        <Label htmlFor={oldPasswordId}>Stare hasło</Label>
        <Input
          id={oldPasswordId}
          type="password"
          value={oldPassword}
          onChange={(e) => onOldPasswordChange(e.target.value)}
          disabled={isChanging}
          aria-invalid={!!errors.oldPassword}
          aria-describedby={errors.oldPassword ? `${oldPasswordId}-error` : undefined}
          className={errors.oldPassword ? 'border-destructive' : ''}
        />
        {errors.oldPassword && (
          <p id={`${oldPasswordId}-error`} className="text-sm text-destructive" role="alert">
            {errors.oldPassword}
          </p>
        )}
      </div>

      {/* Pole nowego hasła */}
      <div className="space-y-2">
        <Label htmlFor={newPasswordId}>Nowe hasło</Label>
        <Input
          id={newPasswordId}
          type="password"
          value={newPassword}
          onChange={(e) => onNewPasswordChange(e.target.value)}
          disabled={isChanging}
          aria-invalid={!!errors.newPassword}
          aria-describedby={errors.newPassword ? `${newPasswordId}-error` : undefined}
          className={errors.newPassword ? 'border-destructive' : ''}
        />
        {errors.newPassword && (
          <p id={`${newPasswordId}-error`} className="text-sm text-destructive" role="alert">
            {errors.newPassword}
          </p>
        )}
        {!errors.newPassword && newPassword.length > 0 && newPassword.length < 8 && (
          <p className="text-sm text-muted-foreground">
            Hasło musi zawierać co najmniej 8 znaków
          </p>
        )}
        {!errors.newPassword &&
          newPassword.length >= 8 &&
          (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) && (
            <p className="text-sm text-muted-foreground">
              Hasło musi zawierać litery i cyfry
            </p>
          )}
      </div>

      {/* Pole potwierdzenia hasła */}
      <div className="space-y-2">
        <Label htmlFor={confirmPasswordId}>Potwierdzenie hasła</Label>
        <Input
          id={confirmPasswordId}
          type="password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          disabled={isChanging}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? `${confirmPasswordId}-error` : undefined}
          className={errors.confirmPassword ? 'border-destructive' : ''}
        />
        {errors.confirmPassword && (
          <p id={`${confirmPasswordId}-error`} className="text-sm text-destructive" role="alert">
            {errors.confirmPassword}
          </p>
        )}
        {!errors.confirmPassword &&
          confirmPassword.length > 0 &&
          newPassword !== confirmPassword && (
            <p className="text-sm text-muted-foreground">Hasła nie są identyczne</p>
          )}
      </div>

      {/* Komunikat sukcesu */}
      {success && (
        <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Hasło zostało zmienione pomyślnie
          </AlertDescription>
        </Alert>
      )}

      {/* Przycisk submit */}
      <Button type="submit" disabled={!isFormValid || isChanging} className="w-full">
        {isChanging ? 'Zmienianie hasła...' : 'Zmień hasło'}
      </Button>
    </form>
  );
});


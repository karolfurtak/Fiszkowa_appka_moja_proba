import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Propsy komponentu UserPreferencesForm
 */
interface UserPreferencesFormProps {
  /**
   * Wartość preferencji użytkownika
   */
  preferences: string;
  /**
   * Błąd walidacji (opcjonalny)
   */
  error?: string | null;
  /**
   * Czy preferencje są zapisywane (loading)
   */
  isSaving: boolean;
  /**
   * Czy zapis preferencji zakończył się sukcesem
   */
  success: boolean;
  /**
   * Callback zmiany preferencji
   */
  onPreferencesChange: (value: string) => void;
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
 * Maksymalna długość preferencji użytkownika
 */
const MAX_LENGTH = 1500;

/**
 * Komponent formularza preferencji użytkownika
 *
 * Zawiera pole tekstowe do wpisania wymagań w języku naturalnym (max 1500 znaków).
 * Preferencje są przekazywane do AI podczas generowania fiszek jako dodatkowy kontekst.
 */
export const UserPreferencesForm = React.memo(function UserPreferencesForm({
  preferences,
  error,
  isSaving,
  success,
  onPreferencesChange,
  onSubmit,
  onSuccessReset,
}: UserPreferencesFormProps) {
  const formId = React.useId();
  const preferencesId = `${formId}-preferences`;
  const characterCountId = `${formId}-character-count`;

  /**
   * Liczba znaków w preferencjach
   */
  const characterCount = React.useMemo(() => {
    return preferences.length;
  }, [preferences]);

  /**
   * Czy preferencje są za długie
   */
  const isTooLong = React.useMemo(() => {
    return characterCount > MAX_LENGTH;
  }, [characterCount]);

  /**
   * Czy formularz jest prawidłowy
   */
  const isFormValid = React.useMemo(() => {
    return !isTooLong && !error;
  }, [isTooLong, error]);

  /**
   * Obsługa zmiany wartości pola tekstowego
   */
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      // Ograniczenie do MAX_LENGTH znaków
      if (value.length <= MAX_LENGTH) {
        onPreferencesChange(value);
      }
    },
    [onPreferencesChange]
  );

  /**
   * Obsługa submit formularza
   */
  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isFormValid && !isSaving) {
        onSubmit();
      }
    },
    [isFormValid, isSaving, onSubmit]
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
      {/* Pole preferencji */}
      <div className="space-y-2">
        <Label htmlFor={preferencesId}>
          Preferencje użytkownika
          <span className="text-muted-foreground ml-2 text-xs">
            (opcjonalne, max {MAX_LENGTH} znaków)
          </span>
        </Label>
        <Textarea
          id={preferencesId}
          value={preferences}
          onChange={handleChange}
          disabled={isSaving}
          rows={6}
          placeholder="Wpisz swoje preferencje dotyczące generowania fiszek (np. poziom trudności, styl, tematyka)..."
          aria-invalid={!!error || isTooLong}
          aria-describedby={
            error || isTooLong
              ? `${preferencesId}-error`
              : characterCount > 0
                ? characterCountId
                : undefined
          }
          className={error || isTooLong ? 'border-destructive' : ''}
        />
        {/* Licznik znaków */}
        <div className="flex items-center justify-between">
          <p
            id={characterCountId}
            className={`text-sm ${isTooLong ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {characterCount} / {MAX_LENGTH} znaków
          </p>
        </div>
        {/* Komunikaty błędów */}
        {error && (
          <p id={`${preferencesId}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {isTooLong && !error && (
          <p id={`${preferencesId}-error`} className="text-sm text-destructive" role="alert">
            Preferencje nie mogą przekraczać {MAX_LENGTH} znaków (obecnie: {characterCount} znaków)
          </p>
        )}
      </div>

      {/* Komunikat sukcesu */}
      {success && (
        <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Preferencje zostały zapisane
          </AlertDescription>
        </Alert>
      )}

      {/* Przycisk submit */}
      <Button type="submit" disabled={!isFormValid || isSaving} className="w-full">
        {isSaving ? 'Zapisywanie...' : 'Zapisz preferencje'}
      </Button>
    </form>
  );
});


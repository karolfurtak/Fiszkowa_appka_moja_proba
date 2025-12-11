import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

/**
 * Propsy komponentu AppSettingsForm
 */
interface AppSettingsFormProps {
  /**
   * Czy tryb ciemny jest włączony
   */
  darkMode: boolean;
  /**
   * Tryb wyświetlania weryfikacji
   */
  verificationViewMode: 'pagination' | 'infinite-scroll';
  /**
   * Czy ustawienia są zapisywane (loading)
   */
  isSaving: boolean;
  /**
   * Callback zmiany trybu ciemnego
   */
  onDarkModeChange: (enabled: boolean) => void;
  /**
   * Callback zmiany trybu wyświetlania weryfikacji
   */
  onVerificationViewModeChange: (mode: 'pagination' | 'infinite-scroll') => void;
}

/**
 * Komponent formularza ustawień aplikacji
 *
 * Zawiera przełączniki dla dark mode i trybu wyświetlania weryfikacji.
 * Ustawienia są zapisywane automatycznie przy zmianie (auto-save z debouncing).
 */
export const AppSettingsForm = React.memo(function AppSettingsForm({
  darkMode,
  verificationViewMode,
  isSaving,
  onDarkModeChange,
  onVerificationViewModeChange,
}: AppSettingsFormProps) {
  const formId = React.useId();
  const [showSuccess, setShowSuccess] = React.useState(false);

  /**
   * Obsługa zmiany trybu ciemnego
   */
  const handleDarkModeChange = React.useCallback(
    (checked: boolean) => {
      onDarkModeChange(checked);
      setShowSuccess(true);
    },
    [onDarkModeChange]
  );

  /**
   * Obsługa zmiany trybu wyświetlania weryfikacji
   */
  const handleVerificationViewModeChange = React.useCallback(
    (value: 'pagination' | 'infinite-scroll') => {
      onVerificationViewModeChange(value);
      setShowSuccess(true);
    },
    [onVerificationViewModeChange]
  );

  /**
   * Auto-ukrywanie komunikatu sukcesu po 2 sekundach
   */
  React.useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="space-y-6">
      {/* Ustawienie: Tryb ciemny */}
      <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
        <div className="space-y-0.5 flex-1">
          <Label htmlFor={`${formId}-dark-mode`} className="text-base font-medium">
            Tryb ciemny
          </Label>
          <p className="text-sm text-muted-foreground">
            Przełącz między jasnym a ciemnym motywem interfejsu
          </p>
        </div>
        <Switch
          id={`${formId}-dark-mode`}
          checked={darkMode}
          onCheckedChange={handleDarkModeChange}
          disabled={isSaving}
          aria-label="Przełącz tryb ciemny"
        />
      </div>

      {/* Ustawienie: Tryb wyświetlania weryfikacji */}
      <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
        <div className="space-y-0.5 flex-1">
          <Label htmlFor={`${formId}-verification-view-mode`} className="text-base font-medium">
            Tryb wyświetlania weryfikacji
          </Label>
          <p className="text-sm text-muted-foreground">
            Wybierz sposób wyświetlania propozycji fiszek w widoku weryfikacji
          </p>
        </div>
        <Select
          value={verificationViewMode}
          onValueChange={handleVerificationViewModeChange}
          disabled={isSaving}
        >
          <SelectTrigger id={`${formId}-verification-view-mode`} className="w-[200px]">
            <SelectValue placeholder="Wybierz tryb" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pagination">Paginacja</SelectItem>
            <SelectItem value="infinite-scroll">Infinite Scroll</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Komunikat sukcesu auto-save */}
      {showSuccess && (
        <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Ustawienia zostały zapisane
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});


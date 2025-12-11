import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGenerationPolling } from '@/hooks/useGenerationPolling';

/**
 * Propsy komponentu LoadingScreen
 */
interface LoadingScreenProps {
  /**
   * Identyfikator sesji generowania
   */
  sessionId: string;
}

/**
 * Stan komponentu LoadingScreen
 */
interface LoadingScreenState {
  /**
   * Postęp generowania (0-100%)
   */
  progress: number;
  /**
   * Aktualny komunikat statusu
   */
  statusMessage: string;
  /**
   * Szacowany czas zakończenia w sekundach (null jeśli nie można oszacować)
   */
  estimatedTimeRemaining: number | null;
  /**
   * Flaga czy generowanie jest w toku
   */
  isGenerating: boolean;
  /**
   * Komunikat błędu (null jeśli brak błędu)
   */
  error: string | null;
  /**
   * Czy błąd to timeout (do różnicowania stylu)
   */
  isTimeout: boolean;
  /**
   * Timestamp rozpoczęcia generowania
   */
  startTime: number;
}

/**
 * Szacowany czas trwania generowania (w sekundach)
 */
const ESTIMATED_DURATION = 20;

/**
 * Komponent ekranu ładowania podczas generowania fiszek
 *
 * Wyświetla wizualny wskaźnik postępu, komunikat statusu oraz umożliwia anulowanie operacji.
 * Automatycznie przekierowuje na widok weryfikacji po zakończeniu generowania.
 */
export default function LoadingScreen({ sessionId }: LoadingScreenProps) {
  const [state, setState] = React.useState<LoadingScreenState>({
    progress: 0,
    statusMessage: 'Inicjowanie generowania...',
    estimatedTimeRemaining: null,
    isGenerating: true,
    error: null,
    isTimeout: false,
    startTime: Date.now(),
  });

  /**
   * Callback wywoływany po zakończeniu generowania
   */
  const handleComplete = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      progress: 100,
      statusMessage: 'Generowanie zakończone!',
      isGenerating: false,
    }));

    // Przekierowanie na widok weryfikacji po krótkim opóźnieniu (dla lepszego UX)
    setTimeout(() => {
      window.location.href = `/verify/${sessionId}`;
    }, 1000);
  }, [sessionId]);

  /**
   * Mapowanie błędów API na komunikaty w języku polskim
   */
  const mapApiError = React.useCallback((errorMessage: string): string => {
    if (errorMessage === 'Unauthorized' || errorMessage.includes('Sesja wygasła')) {
      return 'Sesja wygasła. Zaloguj się ponownie.';
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('limit czasu')) {
      return 'Żądanie przekroczyło limit czasu. Spróbuj ponownie.';
    }
    if (errorMessage.includes('Brak połączenia') || errorMessage.includes('offline')) {
      return 'Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.';
    }
    if (errorMessage.includes('Nie znaleziono') || errorMessage.includes('Not Found')) {
      return 'Nie znaleziono sesji generowania.';
    }
    if (errorMessage.includes('Wystąpił błąd serwera') || errorMessage.includes('Internal Server Error')) {
      return 'Wystąpił błąd serwera podczas generowania. Spróbuj ponownie.';
    }
    return errorMessage || 'Wystąpił błąd podczas generowania. Spróbuj ponownie.';
  }, []);

  /**
   * Callback wywoływany w przypadku błędu
   */
  const handleError = React.useCallback((errorMessage: string) => {
    const mappedError = mapApiError(errorMessage);
    const isTimeout = errorMessage.includes('dłużej niż zwykle') || errorMessage.includes('timeout');
    
    setState((prev) => ({
      ...prev,
      error: mappedError,
      isGenerating: false,
      isTimeout,
    }));

    // Jeśli błąd autoryzacji, przekieruj na login
    if (errorMessage === 'Unauthorized' || errorMessage.includes('Sesja wygasła')) {
      setTimeout(() => {
        window.location.href = `/login?redirect=/loading/${sessionId}`;
      }, 2000);
    }
  }, [sessionId, mapApiError]);

  /**
   * Custom hook do polling statusu generowania
   */
  const { progress, statusMessage, error: pollingError } = useGenerationPolling(
    sessionId,
    handleComplete,
    handleError
  );

  // Aktualizacja stanu na podstawie wyników polling
  React.useEffect(() => {
    setState((prev) => ({
      ...prev,
      progress,
      statusMessage,
      error: pollingError || prev.error,
      isTimeout: pollingError?.includes('dłużej niż zwykle') || pollingError?.includes('timeout') || prev.isTimeout,
    }));
  }, [progress, statusMessage, pollingError]);

  /**
   * Obsługa kliknięcia przycisku "Anuluj"
   */
  const handleCancel = React.useCallback(() => {
    // Toast notification o anulowaniu
    toast.info('Generowanie zostało anulowane');
    // Przekierowanie z powrotem do generatora
    window.location.href = '/generate';
  }, []);

  /**
   * Obsługa kliknięcia przycisku "Spróbuj ponownie"
   */
  const handleRetry = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      isTimeout: false,
      isGenerating: true,
      startTime: Date.now(),
      progress: 0,
      statusMessage: 'Inicjowanie generowania...',
    }));

    // Restart polling - odświeżenie strony spowoduje restart hooka
    window.location.reload();
  }, []);

  // Obsługa odświeżenia strony - sprawdzenie czy propozycje już istnieją
  React.useEffect(() => {
    // Jeśli użytkownik odświeżył stronę, hook automatycznie sprawdzi status
    // i jeśli propozycje już istnieją, przekieruje na weryfikację
  }, []);

  // Obliczanie szacowanego czasu pozostałego
  const estimatedTimeRemaining = React.useMemo(() => {
    if (state.progress >= 100 || !state.isGenerating) {
      return null;
    }
    const elapsedTime = (Date.now() - state.startTime) / 1000; // w sekundach
    if (elapsedTime < 1 || state.progress === 0) {
      return ESTIMATED_DURATION;
    }
    const remainingPercent = 100 - state.progress;
    const estimatedTotal = (elapsedTime / state.progress) * 100;
    const remaining = Math.max(0, estimatedTotal - elapsedTime);
    return Math.ceil(remaining);
  }, [state.progress, state.isGenerating, state.startTime]);

  // Aktualizacja estimatedTimeRemaining w stanie
  React.useEffect(() => {
    if (estimatedTimeRemaining !== null) {
      setState((prev) => ({
        ...prev,
        estimatedTimeRemaining,
      }));
    }
  }, [estimatedTimeRemaining]);

  // Focus management - ustawienie focus na przycisku "Anuluj" po załadowaniu
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Sekcja postępu */}
        <section aria-labelledby="progress-heading" className="space-y-4">
          <h2 id="progress-heading" className="sr-only">
            Postęp generowania fiszek
          </h2>
          <Progress
            value={state.progress}
            className="w-full h-3 transition-all duration-300 ease-out"
            aria-valuenow={state.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Postęp generowania: ${state.progress}%`}
          />
          <div
            className="text-center text-lg font-semibold text-foreground"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            id="status-message"
          >
            {state.statusMessage}
          </div>
          {state.estimatedTimeRemaining !== null && state.estimatedTimeRemaining > 0 && state.isGenerating && (
            <div
              className="text-center text-sm text-muted-foreground"
              aria-label={`Szacowany czas zakończenia generowania: około ${state.estimatedTimeRemaining} sekund`}
            >
              Szacowany czas: ~{state.estimatedTimeRemaining} sekund
            </div>
          )}
        </section>

        {/* Sekcja spinnera */}
        <section aria-label="Animacja ładowania" className="flex items-center justify-center py-4">
          <Loader2
            className="h-16 w-16 animate-spin text-primary"
            aria-label="Ładowanie"
            role="status"
          />
        </section>

        {/* Sekcja akcji */}
        <section aria-label="Akcje" className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={handleCancel}
            disabled={!state.isGenerating && state.error === null}
            aria-label="Anuluj generowanie i wróć do generatora"
            className="min-w-[140px]"
          >
            Anuluj
          </Button>
          {state.error && (
            <Button
              variant="default"
              onClick={handleRetry}
              aria-label="Spróbuj ponownie sprawdzić status generowania"
              className="min-w-[140px]"
            >
              Spróbuj ponownie
            </Button>
          )}
        </section>

        {/* Sekcja błędu */}
        {state.error && (
          <Alert
            variant={state.isTimeout ? "default" : "destructive"}
            className={`w-full ${state.isTimeout ? 'border-yellow-500/50 text-yellow-600 dark:border-yellow-500 dark:text-yellow-400' : ''}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <AlertCircle className={`h-4 w-4 ${state.isTimeout ? 'text-yellow-600 dark:text-yellow-400' : ''}`} aria-hidden="true" />
            <AlertDescription id="error-message">{state.error}</AlertDescription>
            <div className="mt-4 flex gap-2">
              {!state.isTimeout && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = '/generate')}
                  aria-label="Wróć do generatora"
                >
                  Wróć do generatora
                </Button>
              )}
            </div>
          </Alert>
        )}
      </div>
    </main>
  );
}


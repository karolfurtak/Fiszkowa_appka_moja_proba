import * as React from 'react';
import { Loader2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { fetchFlashcardsDueForReview, submitQuizAnswer } from '../../lib/api/training';
import { generateDistractors, createAnswerOptions, type AnswerOption } from '../../lib/utils/training';
import type { FlashcardResponse } from '../../types';
import { AnswerButton } from './AnswerButton';
import { SummaryScreen } from './SummaryScreen';
import type { SessionAnswer } from './IncorrectAnswerItem';
import { StreakTracker } from '../gamification/StreakTracker';
import { ProgressMilestones } from '../gamification/ProgressMilestones';

/**
 * Propsy komponentu TrainingSession
 */
interface TrainingSessionProps {
  /**
   * Identyfikator talii z parametru URL
   */
  deckId: number;
}

/**
 * Stan komponentu TrainingSession
 */
interface TrainingSessionState {
  /**
   * Lista fiszek do powtórki
   */
  flashcards: FlashcardResponse[];
  /**
   * Indeks aktualnej fiszki (0-based)
   */
  currentFlashcardIndex: number;
  /**
   * Losowo ułożone odpowiedzi dla aktualnej fiszki
   */
  shuffledAnswers: AnswerOption[];
  /**
   * Wybrana odpowiedź użytkownika (tekst odpowiedzi)
   */
  selectedAnswer: string | null;
  /**
   * Czy odpowiedź została wysłana
   */
  isAnswerSubmitted: boolean;
  /**
   * Czy odpowiedź jest poprawna (null = jeszcze nie wybrano)
   */
  isCorrect: boolean | null;
  /**
   * Lista wszystkich odpowiedzi w sesji
   */
  sessionAnswers: SessionAnswer[];
  /**
   * Czy dane są ładowane
   */
  isLoading: boolean;
  /**
   * Czy odpowiedź jest wysyłana do API
   */
  isSubmitting: boolean;
  /**
   * Komunikat błędu (jeśli wystąpił)
   */
  error: string | null;
  /**
   * Czy wyświetlić ekran podsumowania
   */
  showSummary: boolean;
}

/**
 * Główny komponent sesji treningowej
 *
 * Wyświetla fiszki w formacie testu wielokrotnego wyboru,
 * obsługuje odpowiedzi użytkownika i aktualizuje postęp nauki.
 */
export default function TrainingSession({ deckId }: TrainingSessionProps) {
  const [state, setState] = React.useState<TrainingSessionState>({
    flashcards: [],
    currentFlashcardIndex: 0,
    shuffledAnswers: [],
    selectedAnswer: null,
    isAnswerSubmitted: false,
    isSubmitting: false,
    isCorrect: null,
    sessionAnswers: [],
    isLoading: true,
    error: null,
    showSummary: false,
  });

  const autoAdvanceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
    if (errorMessage.includes('Nie znaleziono fiszki')) {
      return 'Nie znaleziono fiszki.';
    }
    return errorMessage || 'Wystąpił błąd. Spróbuj ponownie.';
  }, []);

  /**
   * Pobieranie fiszek do powtórki
   */
  const loadFlashcards = React.useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const flashcards = await fetchFlashcardsDueForReview(deckId);

      if (flashcards.length === 0) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Brak fiszek do powtórki w tej talii.',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        flashcards,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading flashcards:', error);
      const errorMessage = mapApiError(
        error instanceof Error ? error.message : 'Nie udało się załadować fiszek'
      );
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));

      if (errorMessage === 'Sesja wygasła. Zaloguj się ponownie.') {
        toast.error(errorMessage);
        setTimeout(() => {
          window.location.href = `/login?redirect=/deck/${deckId}/review`;
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
    }
  }, [deckId, mapApiError]);

  /**
   * Pobieranie fiszek po zamontowaniu komponentu
   */
  React.useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  /**
   * Aktualna fiszka
   */
  const currentFlashcard = React.useMemo(() => {
    return state.flashcards[state.currentFlashcardIndex] || null;
  }, [state.flashcards, state.currentFlashcardIndex]);

  /**
   * Generowanie losowych odpowiedzi dla aktualnej fiszki
   */
  React.useEffect(() => {
    if (!currentFlashcard) {
      setState((prev) => ({ ...prev, shuffledAnswers: [] }));
      return;
    }

    const distractors = generateDistractors(
      currentFlashcard.correct_answer,
      state.flashcards,
      3
    );
    const answerOptions = createAnswerOptions(currentFlashcard.correct_answer, distractors);

    setState((prev) => ({
      ...prev,
      shuffledAnswers: answerOptions,
      selectedAnswer: null,
      isAnswerSubmitted: false,
      isCorrect: null,
    }));
  }, [currentFlashcard, state.flashcards]);

  /**
   * Statystyki sesji
   */
  const stats = React.useMemo(() => {
    const correctCount = state.sessionAnswers.filter((a) => a.is_correct).length;
    return {
      totalFlashcards: state.flashcards.length,
      currentIndex: state.currentFlashcardIndex,
      progress:
        state.flashcards.length > 0
          ? ((state.currentFlashcardIndex + 1) / state.flashcards.length) * 100
          : 0,
      answeredCount: state.sessionAnswers.length,
      correctCount,
      incorrectCount: state.sessionAnswers.length - correctCount,
    };
  }, [state.flashcards.length, state.currentFlashcardIndex, state.sessionAnswers]);

  /**
   * Obsługa wyboru odpowiedzi
   */
  const handleAnswerSelect = React.useCallback(
    async (answerText: string) => {
      if (state.isAnswerSubmitted || !currentFlashcard) {
        return;
      }

      const isCorrect = answerText === currentFlashcard.correct_answer;

      setState((prev) => ({
        ...prev,
        selectedAnswer: answerText,
        isAnswerSubmitted: true,
        isCorrect,
        isSubmitting: true,
      }));

      // Zapisanie odpowiedzi w sesji
      const sessionAnswer: SessionAnswer = {
        flashcard_id: currentFlashcard.id,
        selected_answer: answerText,
        is_correct: isCorrect,
        correct_answer: currentFlashcard.correct_answer,
        question: currentFlashcard.question,
      };

      setState((prev) => ({
        ...prev,
        sessionAnswers: [...prev.sessionAnswers, sessionAnswer],
      }));

      // Wysłanie odpowiedzi do API
      try {
        await submitQuizAnswer(currentFlashcard.id, isCorrect);
        setState((prev) => ({ ...prev, isSubmitting: false }));
      } catch (error) {
        console.error('Error submitting answer:', error);
        const errorMessage = mapApiError(
          error instanceof Error ? error.message : 'Nie udało się wysłać odpowiedzi'
        );
        toast.error(errorMessage);
        setState((prev) => ({ ...prev, isSubmitting: false }));
        // Kontynuujemy sesję mimo błędu
      }

      // Automatyczne przejście do następnej fiszki po 1.5 sekundy
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        moveToNextFlashcard();
      }, 1500);
    },
    [state.isAnswerSubmitted, currentFlashcard, mapApiError]
  );

  /**
   * Przejście do następnej fiszki
   */
  const moveToNextFlashcard = React.useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    if (state.currentFlashcardIndex < state.flashcards.length - 1) {
      setState((prev) => ({
        ...prev,
        currentFlashcardIndex: prev.currentFlashcardIndex + 1,
        selectedAnswer: null,
        isAnswerSubmitted: false,
        isCorrect: null,
      }));
    } else {
      // Zakończenie sesji - wyświetlenie podsumowania
      setState((prev) => ({ ...prev, showSummary: true }));
    }
  }, [state.currentFlashcardIndex, state.flashcards.length]);

  /**
   * Obsługa przerwania sesji
   */
  const handlePause = React.useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    // Przekierowanie do listy fiszek
    window.location.href = `/deck/${deckId}`;
  }, [deckId]);

  /**
   * Obsługa zakończenia sesji
   */
  const handleFinish = React.useCallback(() => {
    window.location.href = `/deck/${deckId}`;
  }, [deckId]);

  /**
   * Obsługa powrotu do dashboardu
   */
  const handleBackToDashboard = React.useCallback(() => {
    window.location.href = '/';
  }, []);

  /**
   * Obsługa klawiatury
   */
  React.useEffect(() => {
    if (state.showSummary || state.isLoading) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isAnswerSubmitted) {
        return; // Nie obsługuj klawiatury po wyborze odpowiedzi
      }

      // Klawisze 1-4 dla odpowiedzi
      const keyNumber = parseInt(e.key);
      if (keyNumber >= 1 && keyNumber <= 4 && state.shuffledAnswers.length >= keyNumber) {
        e.preventDefault();
        handleAnswerSelect(state.shuffledAnswers[keyNumber - 1].text);
      }

      // Escape do przerwania sesji
      if (e.key === 'Escape') {
        e.preventDefault();
        handlePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.showSummary,
    state.isLoading,
    state.isAnswerSubmitted,
    state.shuffledAnswers,
    handleAnswerSelect,
    handlePause,
  ]);

  /**
   * Cleanup timeout przy odmontowaniu
   */
  React.useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Ładowanie sesji treningowej" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
          <div className="mt-4 flex gap-2">
            <Button onClick={loadFlashcards} variant="outline" size="sm">
              Spróbuj ponownie
            </Button>
            <Button
              onClick={() => (window.location.href = `/deck/${deckId}`)}
              variant="outline"
              size="sm"
            >
              Wróć do listy fiszek
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (state.showSummary) {
    const correctCount = state.sessionAnswers.filter((a) => a.is_correct).length;
    const incorrectAnswers = state.sessionAnswers.filter((a) => !a.is_correct);

    return (
      <SummaryScreen
        totalAnswered={state.sessionAnswers.length}
        correctCount={correctCount}
        incorrectCount={incorrectAnswers.length}
        incorrectAnswers={incorrectAnswers}
        onFinish={handleFinish}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  if (!currentFlashcard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header z paskiem postępu i przyciskiem przerwania */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {state.currentFlashcardIndex + 1} / {state.flashcards.length}
                </span>
                <div className="flex items-center gap-4">
                  <StreakTracker />
                  <span className="text-sm text-muted-foreground">
                    {Math.round(stats.progress)}%
                  </span>
                </div>
              </div>
              <div className="relative">
                <Progress value={stats.progress} className="h-2" aria-label="Postęp sesji" />
                <ProgressMilestones
                  current={state.currentFlashcardIndex + 1}
                  total={state.flashcards.length}
                  className="absolute inset-0"
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePause}
              aria-label="Przerwij sesję"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Główna sekcja z pytaniem i odpowiedziami */}
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-8">
          {/* Karta z pytaniem */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {currentFlashcard.image_url && (
                  <div className="w-full">
                    <img
                      src={currentFlashcard.image_url}
                      alt="Ilustracja do pytania"
                      className="w-full h-auto rounded-lg object-contain max-h-[300px] mx-auto"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h2 className="text-2xl md:text-3xl font-semibold text-center break-words">
                  {currentFlashcard.question}
                </h2>
              </div>
            </CardContent>
          </Card>

          {/* Przyciski odpowiedzi */}
          <div className="space-y-3" role="group" aria-label="Odpowiedzi">
            {state.shuffledAnswers.map((answer, index) => (
              <AnswerButton
                key={answer.id}
                answer={answer}
                isSelected={state.selectedAnswer === answer.text}
                isCorrect={state.isCorrect}
                isAnswerSubmitted={state.isAnswerSubmitted}
                onClick={() => handleAnswerSelect(answer.text)}
                index={index}
              />
            ))}
          </div>

          {/* Sekcja informacji zwrotnej */}
          {state.isAnswerSubmitted && (
            <div
              className={`rounded-lg p-4 ${
                state.isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                {state.isCorrect ? (
                  <>
                    <div className="text-green-600 dark:text-green-400 text-xl font-bold">✓</div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        Poprawna odpowiedź!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-red-600 dark:text-red-400 text-xl font-bold">✗</div>
                    <div className="flex-1">
                      <p className="font-semibold text-red-800 dark:text-red-200">
                        Błędna odpowiedź
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Poprawna odpowiedź: <span className="font-medium">{currentFlashcard.correct_answer}</span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

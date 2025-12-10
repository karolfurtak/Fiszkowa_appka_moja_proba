import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Trophy, AlertCircle } from 'lucide-react';
import { IncorrectAnswerItem, type SessionAnswer } from './IncorrectAnswerItem';

/**
 * Propsy komponentu SummaryScreen
 */
interface SummaryScreenProps {
  /**
   * Całkowita liczba odpowiedzi
   */
  totalAnswered: number;
  /**
   * Liczba poprawnych odpowiedzi
   */
  correctCount: number;
  /**
   * Liczba błędnych odpowiedzi
   */
  incorrectCount: number;
  /**
   * Lista błędnych odpowiedzi
   */
  incorrectAnswers: SessionAnswer[];
  /**
   * Callback zakończenia (powrót do listy fiszek)
   */
  onFinish: () => void;
  /**
   * Callback powrotu do dashboardu
   */
  onBackToDashboard: () => void;
}

/**
 * Komponent ekranu podsumowania
 *
 * Wyświetlany po zakończeniu sesji treningowej. Pokazuje wynik sesji,
 * procent poprawnych odpowiedzi oraz listę błędnych odpowiedzi.
 */
export const SummaryScreen = React.memo(function SummaryScreen({
  totalAnswered,
  correctCount,
  incorrectCount,
  incorrectAnswers,
  onFinish,
  onBackToDashboard,
}: SummaryScreenProps) {
  /**
   * Obliczenie procentu poprawnych odpowiedzi
   */
  const percentage = React.useMemo(() => {
    if (totalAnswered === 0) return 0;
    return Math.round((correctCount / totalAnswered) * 100);
  }, [totalAnswered, correctCount]);

  /**
   * Czy wszystkie odpowiedzi były poprawne
   */
  const allCorrect = React.useMemo(() => {
    return incorrectCount === 0 && totalAnswered > 0;
  }, [incorrectCount, totalAnswered]);

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            {allCorrect ? (
              <>
                <Trophy className="h-8 w-8 text-yellow-500" aria-hidden="true" />
                Podsumowanie sesji
              </>
            ) : (
              <>
                <AlertCircle className="h-8 w-8 text-primary" aria-hidden="true" />
                Podsumowanie sesji
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Wynik */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">
              {correctCount} / {totalAnswered}
            </div>
            <p className="text-lg text-muted-foreground">poprawnych odpowiedzi</p>
            <div className="text-2xl font-semibold text-primary">{percentage}%</div>
          </div>

          {/* Komunikat gratulacyjny */}
          {allCorrect && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
              <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                Gratulacje! Wszystkie odpowiedzi były poprawne! 🎉
              </p>
            </div>
          )}

          {/* Lista błędnych odpowiedzi */}
          {incorrectAnswers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Błędne odpowiedzi ({incorrectAnswers.length})
              </h3>
              <div className="space-y-3" role="list" aria-label="Lista błędnych odpowiedzi">
                {incorrectAnswers.map((answer) => (
                  <IncorrectAnswerItem key={answer.flashcard_id} answer={answer} />
                ))}
              </div>
            </div>
          )}

          {/* Przyciski akcji */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={onFinish} size="lg" className="w-full sm:w-auto">
              Zakończ
            </Button>
            <Button onClick={onBackToDashboard} variant="outline" size="lg" className="w-full sm:w-auto">
              Wróć do dashboardu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});


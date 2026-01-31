import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, AlertCircle, Star, Award, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IncorrectAnswerItem, type SessionAnswer } from './IncorrectAnswerItem';
import { ConfettiEffect } from '../gamification/ConfettiEffect';

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
 * Hook for animated score count-up
 */
function useAnimatedScore(target: number, duration: number = 1500) {
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setScore(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, 300);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [target, duration]);

  return score;
}

/**
 * Get performance tier based on percentage
 */
function getPerformanceTier(percentage: number): {
  icon: React.ReactNode;
  label: string;
  color: string;
  message: string;
} {
  if (percentage === 100) {
    return {
      icon: <Trophy className="h-16 w-16" />,
      label: 'Perfekcyjnie!',
      color: 'text-yellow-500',
      message: 'Niesamowity wynik! Wszystkie odpowiedzi poprawne!',
    };
  }
  if (percentage >= 90) {
    return {
      icon: <Award className="h-16 w-16" />,
      label: 'Znakomicie!',
      color: 'text-emerald-500',
      message: 'Prawie perfekcyjnie! Świetna robota!',
    };
  }
  if (percentage >= 70) {
    return {
      icon: <Medal className="h-16 w-16" />,
      label: 'Dobrze!',
      color: 'text-blue-500',
      message: 'Dobry wynik! Kontynuuj naukę!',
    };
  }
  if (percentage >= 50) {
    return {
      icon: <Star className="h-16 w-16" />,
      label: 'W porządku',
      color: 'text-orange-500',
      message: 'Możesz lepiej! Powtórz materiał.',
    };
  }
  return {
    icon: <AlertCircle className="h-16 w-16" />,
    label: 'Do poprawy',
    color: 'text-red-500',
    message: 'Warto powtórzyć ten materiał.',
  };
}

/**
 * Circular progress indicator
 */
function CircularProgress({ percentage }: { percentage: number }) {
  const animatedPercentage = useAnimatedScore(percentage, 1500);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          className="text-muted/30"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="64"
          cy="64"
        />
        <circle
          className={cn(
            "transition-all duration-1000 ease-out",
            percentage === 100 ? "text-yellow-500" :
            percentage >= 70 ? "text-emerald-500" :
            percentage >= 50 ? "text-orange-500" : "text-red-500"
          )}
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="64"
          cy="64"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </svg>
      <span className="absolute text-3xl font-bold">{animatedPercentage}%</span>
    </div>
  );
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

  const animatedCorrect = useAnimatedScore(correctCount, 1200);

  /**
   * Czy wszystkie odpowiedzi były poprawne
   */
  const allCorrect = React.useMemo(() => {
    return incorrectCount === 0 && totalAnswered > 0;
  }, [incorrectCount, totalAnswered]);

  /**
   * Czy wyświetlić confetti (>= 90% poprawnych odpowiedzi)
   */
  const showConfetti = percentage >= 90 && totalAnswered > 0;

  const performanceTier = getPerformanceTier(percentage);

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 animate-slide-up-fade">
      <ConfettiEffect isActive={showConfetti} duration={showConfetti && percentage === 100 ? 5000 : 3000} />
      <Card className="overflow-hidden">
        <CardHeader className="text-center pb-2 relative">
          {/* Background decoration */}
          <div className={cn(
            "absolute inset-0 opacity-5",
            percentage >= 70 ? "bg-gradient-to-br from-emerald-500 to-transparent" :
            percentage >= 50 ? "bg-gradient-to-br from-orange-500 to-transparent" :
            "bg-gradient-to-br from-red-500 to-transparent"
          )} />

          <div className="relative z-10">
            {/* Performance icon */}
            <div className={cn(
              "mx-auto mb-4",
              performanceTier.color,
              allCorrect && "animate-trophy-bounce"
            )}>
              {performanceTier.icon}
            </div>

            <CardTitle className={cn(
              "text-3xl font-bold animate-slide-up-fade",
              performanceTier.color
            )} style={{ animationDelay: '0.2s' }}>
              {performanceTier.label}
            </CardTitle>
            <p className="text-muted-foreground mt-2 animate-slide-up-fade" style={{ animationDelay: '0.3s' }}>
              {performanceTier.message}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Circular progress and stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4">
            <CircularProgress percentage={percentage} />

            <div className="text-center sm:text-left space-y-2">
              <div className="text-5xl font-bold animate-count-up">
                {animatedCorrect} <span className="text-2xl text-muted-foreground font-normal">/ {totalAnswered}</span>
              </div>
              <p className="text-lg text-muted-foreground">poprawnych odpowiedzi</p>
            </div>
          </div>

          {/* Komunikat gratulacyjny */}
          {allCorrect && (
            <div className={cn(
              "rounded-xl p-6 text-center",
              "bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50",
              "dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20",
              "border border-yellow-200 dark:border-yellow-800",
              "animate-success-pop"
            )}>
              <p className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">
                Gratulacje! Bezbłędna sesja!
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Twoja wiedza jest na najwyższym poziomie!
              </p>
            </div>
          )}

          {/* Lista błędnych odpowiedzi */}
          {incorrectAnswers.length > 0 && (
            <div className="space-y-4 animate-slide-up-fade" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Do powtórki ({incorrectAnswers.length})
              </h3>
              <div className="space-y-3" role="list" aria-label="Lista błędnych odpowiedzi">
                {incorrectAnswers.map((answer, index) => (
                  <div
                    key={answer.flashcard_id}
                    className="animate-slide-up-fade"
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <IncorrectAnswerItem answer={answer} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Przyciski akcji */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={onFinish}
              size="lg"
              className="w-full sm:w-auto transition-all hover:scale-105 active:scale-95"
            >
              Zakończ
            </Button>
            <Button
              onClick={onBackToDashboard}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto transition-all hover:scale-105 active:scale-95"
            >
              Wróć do dashboardu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});


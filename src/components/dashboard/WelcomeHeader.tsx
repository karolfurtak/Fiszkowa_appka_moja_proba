import * as React from 'react';
import { cn } from '@/lib/utils';
import { StreakBadge } from '../gamification/StreakBadge';

interface WelcomeHeaderProps {
  userName?: string;
  streak: number;
  totalDue: number;
  isLoading?: boolean;
}

/**
 * Get appropriate greeting based on time of day
 */
function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Dzień dobry';
  } else if (hour >= 12 && hour < 18) {
    return 'Cześć';
  } else if (hour >= 18 && hour < 22) {
    return 'Dobry wieczór';
  } else {
    return 'Nocne powtórki';
  }
}

/**
 * Get motivational message based on streak
 */
function getMotivationalMessage(streak: number, totalDue: number): string {
  if (streak === 0 && totalDue > 0) {
    return 'Czas rozpocząć naukę!';
  }
  if (streak === 0) {
    return 'Gotowy na nowy początek?';
  }
  if (streak >= 30) {
    return 'Niesamowity wynik! Jesteś mistrzem!';
  }
  if (streak >= 14) {
    return 'Imponujące! Tak trzymaj!';
  }
  if (streak >= 7) {
    return 'Tydzień z rzędu! Świetna passa!';
  }
  if (streak >= 3) {
    return 'Budujesz nawyk! Nie przerywaj!';
  }
  return 'Każdy dzień się liczy!';
}

export function WelcomeHeader({ userName, streak, totalDue, isLoading }: WelcomeHeaderProps) {
  const [animatedStreak, setAnimatedStreak] = React.useState(0);
  const greeting = React.useMemo(() => getGreeting(), []);
  const motivationalMessage = React.useMemo(
    () => getMotivationalMessage(streak, totalDue),
    [streak, totalDue]
  );

  // Animate streak count up
  React.useEffect(() => {
    if (streak === 0) {
      setAnimatedStreak(0);
      return;
    }

    let current = 0;
    const step = Math.max(1, Math.floor(streak / 20));
    const interval = setInterval(() => {
      current += step;
      if (current >= streak) {
        setAnimatedStreak(streak);
        clearInterval(interval);
      } else {
        setAnimatedStreak(current);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [streak]);

  if (isLoading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded mb-2" />
        <div className="h-5 w-48 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="mb-8 animate-slide-up-fade">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            <span className="inline-block animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
              {greeting}
            </span>
            {userName && (
              <span
                className="inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ml-2 animate-slide-up-fade"
                style={{ animationDelay: '0.2s' }}
              >
                {userName}!
              </span>
            )}
            {!userName && <span className="animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>!</span>}
          </h1>
          <p
            className="mt-2 text-muted-foreground animate-slide-up-fade"
            style={{ animationDelay: '0.3s' }}
          >
            {motivationalMessage}
          </p>
        </div>

        {/* Quick stats */}
        <div
          className={cn(
            "flex items-center gap-6 p-4 rounded-xl",
            "bg-gradient-to-br from-primary/5 via-transparent to-accent/5",
            "border border-primary/10",
            "animate-slide-up-fade"
          )}
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-center gap-2">
            <StreakBadge streak={animatedStreak} size="lg" showLabel={false} />
            <div className="text-sm">
              <span className="font-semibold text-foreground">{animatedStreak}</span>
              <span className="text-muted-foreground ml-1">
                {animatedStreak === 1 ? 'dzień' : 'dni'}
              </span>
            </div>
          </div>

          {totalDue > 0 && (
            <>
              <div className="h-8 w-px bg-border" />
              <div className="text-sm">
                <span className="font-semibold text-orange-500">{totalDue}</span>
                <span className="text-muted-foreground ml-1">do powtórki</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

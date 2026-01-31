import * as React from 'react';
import { StreakBadge } from './StreakBadge';
import { useStreak } from '../../hooks/useStreak';

interface StreakTrackerProps {
  className?: string;
}

export function StreakTracker({ className }: StreakTrackerProps) {
  const { currentStreak, todayStudied, isLoading } = useStreak();

  if (isLoading) {
    return (
      <div className="h-6 w-20 bg-muted animate-pulse rounded" />
    );
  }

  return (
    <div className={className}>
      <StreakBadge
        streak={currentStreak}
        size="sm"
        showLabel={true}
      />
      {!todayStudied && currentStreak > 0 && (
        <p className="text-xs text-orange-500 mt-1">
          Odpowiedz, by utrzymac streak!
        </p>
      )}
    </div>
  );
}

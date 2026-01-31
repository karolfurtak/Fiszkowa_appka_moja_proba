import * as React from 'react';
import { BookOpen, Flame, Target, CheckCircle2 } from 'lucide-react';
import { StatCard } from './StatCard';
import { StreakBadge } from '../gamification/StreakBadge';
import { useStreak } from '../../hooks/useStreak';
import type { DeckViewModel } from '../../types';

interface StatsOverviewProps {
  decks: DeckViewModel[];
}

export function StatsOverview({ decks }: StatsOverviewProps) {
  const { currentStreak, totalStudiedToday, todayStudied, isLoading } = useStreak();

  // Calculate total stats from decks
  const stats = React.useMemo(() => {
    const totalFlashcards = decks.reduce((sum, deck) => sum + deck.totalFlashcards, 0);
    const totalDue = decks.reduce((sum, deck) => sum + deck.dueFlashcards, 0);
    const totalDecks = decks.length;

    return {
      totalFlashcards,
      totalDue,
      totalDecks,
    };
  }, [decks]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl p-4 bg-card border animate-pulse"
          >
            <div className="h-4 w-20 bg-muted rounded mb-2" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Do powtórki"
        value={stats.totalDue}
        icon={<Target className="h-5 w-5" />}
        description={stats.totalDue > 0 ? 'Fiszki czekają!' : 'Wszystko powtórzone'}
        variant={stats.totalDue > 0 ? 'gradient' : 'default'}
      />

      <div className="rounded-xl p-4 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-red-500/10 border border-orange-500/20 transition-all duration-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Streak</p>
            <StreakBadge streak={currentStreak} size="lg" showLabel={false} />
            <p className="text-xs text-muted-foreground">
              {currentStreak === 0
                ? 'Zacznij naukę!'
                : currentStreak === 1
                ? 'dzień z rzędu'
                : `dni z rzędu`}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
            <Flame className="h-5 w-5" />
          </div>
        </div>
      </div>

      <StatCard
        title="Dzisiaj"
        value={totalStudiedToday}
        icon={<CheckCircle2 className="h-5 w-5" />}
        description={todayStudied ? 'Fiszek powtórzonych' : 'Jeszcze nic'}
      />

      <StatCard
        title="Łącznie fiszek"
        value={stats.totalFlashcards}
        icon={<BookOpen className="h-5 w-5" />}
        description={`w ${stats.totalDecks} ${stats.totalDecks === 1 ? 'talii' : 'taliach'}`}
      />
    </div>
  );
}

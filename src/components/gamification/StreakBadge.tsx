import * as React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakBadgeProps {
  streak: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StreakBadge({
  streak,
  className,
  size = 'md',
  showLabel = true,
}: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-lg gap-2',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const isActive = streak > 0;
  const isHighStreak = streak >= 7;
  const isVeryHighStreak = streak >= 14;

  return (
    <div
      className={cn(
        'inline-flex items-center font-semibold transition-all duration-300',
        sizeClasses[size],
        isActive ? 'text-orange-500' : 'text-muted-foreground',
        className
      )}
      role="status"
      aria-label={`Streak: ${streak} ${streak === 1 ? 'dzień' : 'dni'}`}
    >
      <Flame
        className={cn(
          iconSizes[size],
          'transition-all duration-300',
          isActive && 'drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]',
          isHighStreak && 'drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]',
          isVeryHighStreak && 'text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.6)]'
        )}
        aria-hidden="true"
      />
      <span className={cn(
        'transition-all duration-300',
        isHighStreak && 'font-bold'
      )}>
        {streak}
      </span>
      {showLabel && (
        <span className="text-muted-foreground font-normal">
          {streak === 1 ? 'dzień' : 'dni'}
        </span>
      )}
    </div>
  );
}

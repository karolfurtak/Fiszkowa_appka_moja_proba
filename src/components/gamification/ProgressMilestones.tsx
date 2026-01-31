import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressMilestonesProps {
  current: number;
  total: number;
  className?: string;
}

const MILESTONES = [5, 10, 15, 20, 25];

export function ProgressMilestones({
  current,
  total,
  className,
}: ProgressMilestonesProps) {
  // Don't show milestones if total is too small
  if (total < 5) return null;

  // Filter milestones to only show those <= total
  const visibleMilestones = MILESTONES.filter((m) => m <= total);

  if (visibleMilestones.length === 0) return null;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Milestone markers */}
      <div className="absolute inset-0 flex justify-between items-center px-1 pointer-events-none">
        {visibleMilestones.map((milestone) => {
          const position = (milestone / total) * 100;
          const isReached = current >= milestone;

          return (
            <div
              key={milestone}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2"
              style={{ left: `${position}%` }}
            >
              <div
                className={cn(
                  'flex items-center justify-center transition-all duration-300',
                  isReached
                    ? 'text-yellow-500 scale-110'
                    : 'text-muted-foreground/40'
                )}
              >
                <Star
                  className={cn(
                    'h-4 w-4 transition-all duration-300',
                    isReached && 'fill-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]'
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  variant?: 'default' | 'gradient';
  animate?: boolean;
}

/**
 * Hook for count-up animation
 */
function useCountUp(target: number, duration: number = 1000, enabled: boolean = true) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!enabled || target === 0) {
      setCount(target);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, enabled]);

  return count;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  className,
  variant = 'default',
  animate = true,
}: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString(), 10);
  const isNumeric = !isNaN(numericValue);
  const animatedValue = useCountUp(isNumeric ? numericValue : 0, 800, animate && isNumeric);
  const displayValue = animate && isNumeric ? animatedValue : value;

  return (
    <div
      className={cn(
        'rounded-xl p-4 transition-all duration-300 group',
        'hover:-translate-y-1 hover:shadow-lg',
        variant === 'default' &&
          'bg-card border shadow-sm',
        variant === 'gradient' &&
          'bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn(
            "text-2xl font-bold transition-all duration-300",
            animate && "animate-count-up"
          )}>
            {displayValue}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "p-2 rounded-lg bg-primary/10 text-primary shrink-0",
            "transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

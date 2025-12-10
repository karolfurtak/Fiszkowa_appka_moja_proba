import * as React from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Propsy komponentu NavigationControls
 */
interface NavigationControlsProps {
  /**
   * Aktualny indeks (0-based)
   */
  currentIndex: number;
  /**
   * Całkowita liczba fiszek
   */
  totalCount: number;
  /**
   * Callback przejścia do poprzedniej fiszki
   */
  onPrevious: () => void;
  /**
   * Callback przejścia do następnej fiszki
   */
  onNext: () => void;
}

/**
 * Komponent kontrolek nawigacji między fiszkami
 *
 * Zawiera przyciski "Poprzednia" i "Następna" z automatycznym
 * wyłączaniem na pierwszej/ostatniej fiszce.
 */
export const NavigationControls = React.memo(function NavigationControls({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
}: NavigationControlsProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalCount - 1;

  return (
    <nav className="flex items-center justify-center gap-4" aria-label="Nawigacja między fiszkami">
      <Button
        variant="outline"
        size="lg"
        onClick={onPrevious}
        disabled={isFirst}
        aria-label="Poprzednia fiszka"
        aria-disabled={isFirst}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Poprzednia
      </Button>

      <Button
        variant="outline"
        size="lg"
        onClick={onNext}
        disabled={isLast}
        aria-label="Następna fiszka"
        aria-disabled={isLast}
      >
        Następna
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </nav>
  );
});


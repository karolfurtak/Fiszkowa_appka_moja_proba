import * as React from 'react';
import { FlashcardFront } from './FlashcardFront';
import { FlashcardBack } from './FlashcardBack';
import { cn } from '@/lib/utils';
import type { FlashcardResponse } from '../../types';

/**
 * Propsy komponentu FlashcardFlip
 */
interface FlashcardFlipProps {
  /**
   * Dane fiszki
   */
  flashcard: FlashcardResponse;
  /**
   * Czy karta jest odwrócona (pokazuje odpowiedź)
   */
  isFlipped: boolean;
  /**
   * Callback odwrócenia karty
   */
  onFlip: () => void;
  /**
   * Opcjonalny callback gestu swipe w lewo (następna fiszka)
   */
  onSwipeLeft?: () => void;
  /**
   * Opcjonalny callback gestu swipe w prawo (poprzednia fiszka)
   */
  onSwipeRight?: () => void;
}

/**
 * Komponent karty fiszki z animacją flip
 *
 * Wyświetla stronę przednią (pytanie) i tylną (odpowiedź) z płynną
 * animacją CSS transform przy odwróceniu. Obsługuje kliknięcie
 * na kartę oraz gesty swipe.
 */
export const FlashcardFlip = React.memo(function FlashcardFlip({
  flashcard,
  isFlipped,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
}: FlashcardFlipProps) {
  const [swipeStartX, setSwipeStartX] = React.useState<number | null>(null);
  const [swipeStartY, setSwipeStartY] = React.useState<number | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const cardRef = React.useRef<HTMLDivElement>(null);

  /**
   * Obsługa rozpoczęcia gestu swipe (touch lub mouse)
   */
  const handleSwipeStart = React.useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setSwipeStartX(clientX);
      setSwipeStartY(clientY);
    },
    []
  );

  /**
   * Obsługa ruchu gestu swipe
   */
  const handleSwipeMove = React.useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (swipeStartX === null) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - swipeStartX;

      // Limit swipe offset for visual feedback
      setSwipeOffset(Math.max(-50, Math.min(50, deltaX * 0.3)));
    },
    [swipeStartX]
  );

  /**
   * Obsługa zakończenia gestu swipe
   */
  const handleSwipeEnd = React.useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (swipeStartX === null || swipeStartY === null) {
        return;
      }

      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

      const deltaX = clientX - swipeStartX;
      const deltaY = clientY - swipeStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Reset swipe offset
      setSwipeOffset(0);

      // Uznaj gest tylko jeśli ruch poziomy jest większy niż pionowy
      if (absDeltaX > absDeltaY && absDeltaX > 50) {
        if (deltaX > 0 && onSwipeRight) {
          // Swipe w prawo = poprzednia fiszka
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          // Swipe w lewo = następna fiszka
          onSwipeLeft();
        }
      }

      setSwipeStartX(null);
      setSwipeStartY(null);
    },
    [swipeStartX, swipeStartY, onSwipeLeft, onSwipeRight]
  );

  /**
   * Obsługa kliknięcia na kartę (odwrócenie)
   */
  const handleClick = React.useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      onFlip();
      // Reset animation state after transition
      setTimeout(() => setIsAnimating(false), 600);
    }
  }, [onFlip, isAnimating]);

  // Calculate dynamic shadow based on flip state
  const shadowIntensity = isFlipped ? 0.15 : 0.1;

  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto">
      <div
        ref={cardRef}
        className={cn(
          "relative w-full h-[400px] cursor-pointer",
          "transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)]"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${isFlipped ? 180 : 0}deg) translateX(${swipeOffset}px)`,
          boxShadow: `0 ${isFlipped ? 20 : 10}px ${isFlipped ? 40 : 25}px -5px rgba(0,0,0,${shadowIntensity})`,
        }}
        onClick={handleClick}
        onTouchStart={handleSwipeStart}
        onTouchMove={handleSwipeMove}
        onTouchEnd={handleSwipeEnd}
        onMouseDown={handleSwipeStart}
        onMouseMove={swipeStartX !== null ? handleSwipeMove : undefined}
        onMouseUp={handleSwipeEnd}
        onMouseLeave={() => {
          setSwipeStartX(null);
          setSwipeStartY(null);
          setSwipeOffset(0);
        }}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Kliknij aby zobaczyć pytanie' : 'Kliknij aby zobaczyć odpowiedź'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Strona przednia */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden rounded-xl border bg-card",
            "transition-shadow duration-300",
            !isFlipped && "shadow-xl hover:shadow-2xl"
          )}
        >
          <FlashcardFront
            question={flashcard.question}
            imageUrl={flashcard.image_url}
            onFlip={onFlip}
          />
          {/* Click hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50 flex items-center gap-1">
            <span>Kliknij aby odwrócić</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>

        {/* Strona tylna */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden rounded-xl border bg-card",
            "transition-shadow duration-300",
            isFlipped && "shadow-xl"
          )}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <FlashcardBack answer={flashcard.correct_answer} onFlip={onFlip} />
        </div>
      </div>

      {/* Swipe indicators */}
      <div className="flex justify-center mt-4 gap-8 text-xs text-muted-foreground/50">
        <span className={cn("transition-opacity", swipeOffset < -10 ? "opacity-100" : "opacity-30")}>
          ← Swipe: następna
        </span>
        <span className={cn("transition-opacity", swipeOffset > 10 ? "opacity-100" : "opacity-30")}>
          Swipe: poprzednia →
        </span>
      </div>
    </div>
  );
});


import * as React from 'react';
import { FlashcardFront } from './FlashcardFront';
import { FlashcardBack } from './FlashcardBack';
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
    onFlip();
  }, [onFlip]);

  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto">
      <div
        ref={cardRef}
        className="relative w-full h-[400px] cursor-pointer transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={handleClick}
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
        onMouseDown={handleSwipeStart}
        onMouseUp={handleSwipeEnd}
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
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-lg border bg-card">
          <FlashcardFront
            question={flashcard.question}
            imageUrl={flashcard.image_url}
            onFlip={onFlip}
          />
        </div>

        {/* Strona tylna */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-lg border bg-card"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <FlashcardBack answer={flashcard.correct_answer} onFlip={onFlip} />
        </div>
      </div>
    </div>
  );
});


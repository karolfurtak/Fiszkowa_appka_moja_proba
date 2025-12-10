import * as React from 'react';

/**
 * Propsy komponentu FlashcardBack
 */
interface FlashcardBackProps {
  /**
   * Tekst odpowiedzi
   */
  answer: string;
  /**
   * Callback odwrócenia karty
   */
  onFlip: () => void;
}

/**
 * Komponent strony tylnej karty fiszki
 *
 * Wyświetla poprawną odpowiedź.
 */
export const FlashcardBack = React.memo(function FlashcardBack({
  answer,
  onFlip,
}: FlashcardBackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <p className="text-2xl md:text-3xl font-semibold text-center break-words">
        {answer}
      </p>
      <p className="mt-4 text-sm text-muted-foreground text-center">
        Kliknij kartę lub naciśnij Enter/Space aby zobaczyć pytanie
      </p>
    </div>
  );
});


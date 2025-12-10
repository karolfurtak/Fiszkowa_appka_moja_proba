import * as React from 'react';

/**
 * Propsy komponentu FlashcardFront
 */
interface FlashcardFrontProps {
  /**
   * Tekst pytania
   */
  question: string;
  /**
   * URL obrazka (opcjonalne)
   */
  imageUrl: string | null;
  /**
   * Callback odwrócenia karty
   */
  onFlip: () => void;
}

/**
 * Komponent strony przedniej karty fiszki
 *
 * Wyświetla pytanie i opcjonalny obrazek.
 */
export const FlashcardFront = React.memo(function FlashcardFront({
  question,
  imageUrl,
  onFlip,
}: FlashcardFrontProps) {
  const [imageError, setImageError] = React.useState(false);

  /**
   * Obsługa błędu ładowania obrazka
   */
  const handleImageError = React.useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      {imageUrl && !imageError && (
        <div className="mb-6 w-full max-w-md">
          <img
            src={imageUrl}
            alt="Ilustracja do pytania"
            className="w-full h-auto rounded-lg object-contain max-h-[200px]"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-semibold text-center break-words">
        {question}
      </h2>
      <p className="mt-4 text-sm text-muted-foreground text-center">
        Kliknij kartę lub naciśnij Enter/Space aby zobaczyć odpowiedź
      </p>
    </div>
  );
});


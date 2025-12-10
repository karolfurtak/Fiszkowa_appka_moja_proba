import * as React from 'react';
import { Button } from '../ui/button';
import { FileQuestion, Plus } from 'lucide-react';

/**
 * Propsy komponentu FlashcardEmptyState
 */
interface FlashcardEmptyStateProps {
  /**
   * Callback dodania fiszki
   */
  onAddFlashcard: () => void;
}

/**
 * Komponent pustego stanu dla listy fiszek
 *
 * Wyświetla komunikat gdy talia nie zawiera fiszek.
 */
export const FlashcardEmptyState = React.memo(function FlashcardEmptyState({
  onAddFlashcard,
}: FlashcardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="status">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />
      <h2 className="text-xl font-semibold mb-2">Ta talia jest pusta</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Dodaj fiszki ręcznie lub wygeneruj je z tekstu, aby rozpocząć naukę.
      </p>
      <Button onClick={onAddFlashcard}>
        <Plus className="mr-2 h-4 w-4" />
        Dodaj pierwszą fiszkę
      </Button>
    </div>
  );
});


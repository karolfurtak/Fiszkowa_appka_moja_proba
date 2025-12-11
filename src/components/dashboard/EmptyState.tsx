import * as React from 'react';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

/**
 * Propsy komponentu EmptyState
 */
interface EmptyStateProps {
  /**
   * Czy wyświetlać stan pusty dla wyszukiwania (true) czy dla braku talii (false)
   */
  isSearchResult?: boolean;
  /**
   * Zapytanie wyszukiwania (tylko dla isSearchResult=true)
   */
  searchQuery?: string;
  /**
   * Callback tworzenia nowej talii
   */
  onCreateDeck: () => void;
  /**
   * Callback generowania fiszek
   */
  onGenerateFlashcards: () => void;
  /**
   * Callback wyczyszczenia wyszukiwania (tylko dla isSearchResult=true)
   */
  onClearSearch?: () => void;
}

/**
 * Komponent pustego stanu
 *
 * Wyświetla komunikat i przyciski CTA gdy nie ma talii lub nie znaleziono wyników wyszukiwania.
 */
export const EmptyState = React.memo(function EmptyState({
  isSearchResult = false,
  searchQuery = '',
  onCreateDeck,
  onGenerateFlashcards,
  onClearSearch,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="status">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />
      
      {isSearchResult ? (
        <>
          <h2 className="text-xl font-semibold mb-2">Nie znaleziono talii</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Nie znaleziono talii pasujących do &quot;{searchQuery}&quot;. Spróbuj zmienić zapytanie wyszukiwania.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {onClearSearch && (
              <Button variant="outline" onClick={onClearSearch}>
                Wyczyść wyszukiwanie
              </Button>
            )}
            <Button onClick={onCreateDeck}>Utwórz nową talię</Button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2">Nie masz jeszcze żadnych talii</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Zacznij od utworzenia pierwszej talii lub wygeneruj fiszki z tekstu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onCreateDeck}>Utwórz pierwszą talię</Button>
            <Button variant="outline" onClick={onGenerateFlashcards}>
              Generuj fiszki
            </Button>
          </div>
        </>
      )}
    </div>
  );
});

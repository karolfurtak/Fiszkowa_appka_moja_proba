import * as React from 'react';
import { Button } from '@/components/ui/button';

/**
 * Ilustracja SVG dla empty state - osoba z kartami
 */
function EmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Cards stack */}
      <rect
        x="50"
        y="40"
        width="60"
        height="80"
        rx="6"
        className="fill-muted stroke-border"
        strokeWidth="2"
      />
      <rect
        x="58"
        y="32"
        width="60"
        height="80"
        rx="6"
        className="fill-muted stroke-border"
        strokeWidth="2"
      />
      <rect
        x="66"
        y="24"
        width="60"
        height="80"
        rx="6"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      {/* Lines on card */}
      <rect x="76" y="40" width="40" height="4" rx="2" className="fill-muted" />
      <rect x="76" y="52" width="30" height="4" rx="2" className="fill-muted" />
      <rect x="76" y="64" width="35" height="4" rx="2" className="fill-muted" />

      {/* Person silhouette */}
      <circle cx="150" cy="50" r="20" className="fill-primary/20" />
      <ellipse cx="150" cy="110" rx="25" ry="35" className="fill-primary/20" />

      {/* Sparkles */}
      <circle cx="30" cy="60" r="3" className="fill-primary animate-pulse" />
      <circle cx="180" cy="30" r="2" className="fill-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
      <circle cx="170" cy="140" r="2.5" className="fill-primary animate-pulse" style={{ animationDelay: '1s' }} />
      <circle cx="40" cy="130" r="2" className="fill-accent animate-pulse" style={{ animationDelay: '1.5s' }} />
    </svg>
  );
}

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
      <EmptyIllustration className="w-48 h-40 mb-6" />
      
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
            Zacznij od utworzenia pierwszej talii lub wygeneruj fiszki z tekstu za pomocą AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onCreateDeck}
              className="animate-pulse-slow hover:animate-none"
            >
              Utwórz pierwszą talię
            </Button>
            <Button variant="outline" onClick={onGenerateFlashcards}>
              Generuj fiszki z AI
            </Button>
          </div>
        </>
      )}
    </div>
  );
});

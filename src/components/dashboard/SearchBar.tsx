import * as React from 'react';
import { Input } from '../ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * Propsy komponentu SearchBar
 */
interface SearchBarProps {
  /**
   * Aktualne zapytanie wyszukiwania
   */
  searchQuery: string;
  /**
   * Callback zmiany zapytania wyszukiwania
   */
  onSearchChange: (query: string) => void;
  /**
   * Opcjonalne klasy CSS
   */
  className?: string;
}

/**
 * Komponent wyszukiwarki talii
 *
 * Wyświetla pole wyszukiwania z ikoną i przyciskiem wyczyszczenia.
 */
export const SearchBar = React.memo(function SearchBar({
  searchQuery,
  onSearchChange,
  className,
}: SearchBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Obsługa zmiany wartości wyszukiwania
   */
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  /**
   * Obsługa wyczyszczenia wyszukiwania
   */
  const handleClear = React.useCallback(() => {
    onSearchChange('');
    inputRef.current?.focus();
  }, [onSearchChange]);

  return (
    <div className={`relative flex items-center ${className || ''}`}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Szukaj talii..."
        value={searchQuery}
        onChange={handleChange}
        className="pl-9 pr-9"
        aria-label="Szukaj talii"
        aria-describedby="search-description"
      />
      {searchQuery && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 h-7 w-7"
          aria-label="Wyczyść wyszukiwanie"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <span id="search-description" className="sr-only">
        Wpisz nazwę talii, aby przefiltrować listę
      </span>
    </div>
  );
});


import * as React from 'react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { SidebarOpen, SidebarClose } from 'lucide-react';
import type { FlashcardStatusFilter } from '../../types';

/**
 * Propsy komponentu StudyHeader
 */
interface StudyHeaderProps {
  /**
   * Nazwa talii
   */
  deckName: string;
  /**
   * Aktualna pozycja (1-based dla użytkownika)
   */
  currentPosition: number;
  /**
   * Całkowita liczba fiszek
   */
  totalCount: number;
  /**
   * Aktualnie wybrany filtr statusu
   */
  statusFilter: FlashcardStatusFilter;
  /**
   * Czy sidebar jest otwarty
   */
  isSidebarOpen: boolean;
  /**
   * Callback zmiany filtra
   */
  onFilterChange: (filter: FlashcardStatusFilter) => void;
  /**
   * Callback przełączenia sidebara
   */
  onSidebarToggle: () => void;
}

/**
 * Komponent nagłówka widoku trybu nauki
 *
 * Wyświetla nazwę talii, wskaźnik pozycji (X / Y) oraz kontrolki
 * (filtr statusu, przełącznik sidebara).
 */
export const StudyHeader = React.memo(function StudyHeader({
  deckName,
  currentPosition,
  totalCount,
  statusFilter,
  isSidebarOpen,
  onFilterChange,
  onSidebarToggle,
}: StudyHeaderProps) {
  /**
   * Obsługa zmiany filtra
   */
  const handleFilterChange = React.useCallback(
    (value: string) => {
      onFilterChange(value as FlashcardStatusFilter);
    },
    [onFilterChange]
  );

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{deckName}</h1>
        <div className="text-sm text-muted-foreground" aria-live="polite">
          <span aria-label={`Pozycja ${currentPosition} z ${totalCount}`}>
            {currentPosition} / {totalCount}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px]" aria-label="Filtr statusu fiszek">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="learning">W trakcie nauki</SelectItem>
            <SelectItem value="mastered">Opanowane</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={onSidebarToggle}
          aria-label={isSidebarOpen ? 'Ukryj sidebar' : 'Pokaż sidebar'}
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? (
            <SidebarClose className="h-4 w-4" />
          ) : (
            <SidebarOpen className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
});


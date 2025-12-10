import * as React from 'react';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { FlashcardStatusFilter } from '../../types';

/**
 * Propsy komponentu FlashcardFilters
 */
interface FlashcardFiltersProps {
  /**
   * Aktualnie wybrany filtr
   */
  currentFilter: FlashcardStatusFilter;
  /**
   * Callback zmiany filtra
   */
  onFilterChange: (filter: FlashcardStatusFilter) => void;
}

/**
 * Komponent filtrowania fiszek po statusie
 *
 * Umożliwia wybór między "Wszystkie", "W trakcie nauki" (learning) i "Opanowane" (mastered).
 */
export const FlashcardFilters = React.memo(function FlashcardFilters({
  currentFilter,
  onFilterChange,
}: FlashcardFiltersProps) {
  const handleFilterChange = React.useCallback(
    (value: string) => {
      onFilterChange(value as FlashcardStatusFilter);
    },
    [onFilterChange]
  );

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="status-filter">Filtruj po statusie:</Label>
      <Select value={currentFilter} onValueChange={handleFilterChange}>
        <SelectTrigger id="status-filter" className="w-[180px]" aria-label="Filtr statusu fiszek">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie</SelectItem>
          <SelectItem value="learning">W trakcie nauki</SelectItem>
          <SelectItem value="mastered">Opanowane</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});


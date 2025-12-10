import * as React from 'react';
import { Badge } from '../ui/badge';
import type { FlashcardResponse } from '../../types';

/**
 * Propsy komponentu FlashcardListItem
 */
interface FlashcardListItemProps {
  /**
   * Dane fiszki
   */
  flashcard: FlashcardResponse;
  /**
   * Indeks fiszki w liście (0-based)
   */
  index: number;
  /**
   * Czy ta fiszka jest aktualnie wyświetlana
   */
  isActive: boolean;
  /**
   * Callback kliknięcia na element
   */
  onClick: (index: number) => void;
}

/**
 * Komponent pojedynczego elementu listy w sidebarze
 *
 * Wyświetla skrócone pytanie, status i wyróżnia aktualnie
 * wyświetlaną fiszkę.
 */
export const FlashcardListItem = React.memo(function FlashcardListItem({
  flashcard,
  index,
  isActive,
  onClick,
}: FlashcardListItemProps) {
  /**
   * Skrócenie pytania do maksymalnie 50 znaków
   */
  const questionPreview = React.useMemo(() => {
    const maxLength = 50;
    if (flashcard.question.length <= maxLength) {
      return flashcard.question;
    }
    return flashcard.question.substring(0, maxLength) + '...';
  }, [flashcard.question]);

  /**
   * Obsługa kliknięcia
   */
  const handleClick = React.useCallback(() => {
    onClick(index);
  }, [index, onClick]);

  /**
   * Etykieta statusu
   */
  const statusLabel = React.useMemo(() => {
    return flashcard.status === 'learning' ? 'W trakcie nauki' : 'Opanowane';
  }, [flashcard.status]);

  /**
   * Wariant badge dla statusu
   */
  const statusVariant = React.useMemo(() => {
    return flashcard.status === 'learning' ? 'default' : 'secondary';
  }, [flashcard.status]);

  return (
    <li>
      <button
        onClick={handleClick}
        className={`w-full text-left p-3 rounded-md transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-muted'
        }`}
        aria-label={`Przejdź do fiszki ${index + 1}: ${questionPreview}`}
        aria-current={isActive ? 'true' : 'false'}
      >
        <div className="flex items-start justify-between gap-2">
          <span className={`text-sm flex-1 ${isActive ? 'text-primary-foreground' : ''}`}>
            {questionPreview}
          </span>
          <Badge variant={statusVariant} className="shrink-0">
            {statusLabel}
          </Badge>
        </div>
      </button>
    </li>
  );
});


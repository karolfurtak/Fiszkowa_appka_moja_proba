import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FlashcardCard } from './FlashcardCard';
import type { FlashcardResponse } from '../../types';

/**
 * Propsy komponentu FlashcardList
 */
interface FlashcardListProps {
  /**
   * Lista fiszek do wyświetlenia
   */
  flashcards: FlashcardResponse[];
  /**
   * Czy dane są ładowane
   */
  isLoading: boolean;
  /**
   * Mapa rozwiniętych fiszek (id -> true/false)
   */
  expandedFlashcards: Set<number>;
  /**
   * Callback zmiany stanu rozwinięcia
   */
  onToggleExpand: (flashcardId: number) => void;
  /**
   * Callback edycji fiszki
   */
  onFlashcardEdit: (flashcard: FlashcardResponse) => void;
  /**
   * Callback usunięcia fiszki
   */
  onFlashcardDelete: (flashcardId: number) => void;
}

/**
 * Komponent listy fiszek
 *
 * Wyświetla fiszki w formie kart z możliwością scrollowania.
 * Obsługuje stany ładowania i pusty stan.
 */
export const FlashcardList = React.memo(function FlashcardList({
  flashcards,
  isLoading,
  expandedFlashcards,
  onToggleExpand,
  onFlashcardEdit,
  onFlashcardDelete,
}: FlashcardListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return null; // Empty state będzie renderowany przez komponent nadrzędny
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
      {flashcards.map((flashcard) => (
        <li key={flashcard.id}>
          <FlashcardCard
            flashcard={flashcard}
            isExpanded={expandedFlashcards.has(flashcard.id)}
            onToggleExpand={() => onToggleExpand(flashcard.id)}
            onEdit={onFlashcardEdit}
            onDelete={onFlashcardDelete}
          />
        </li>
      ))}
    </ul>
  );
});

// Placeholder Card component dla skeleton loader
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`border rounded-lg ${className || ''}`}>{children}</div>;
}


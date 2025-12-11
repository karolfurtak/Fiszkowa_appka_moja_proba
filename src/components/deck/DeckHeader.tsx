import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import type { DeckResponse, DeckStats } from '../../types';

/**
 * Propsy komponentu DeckHeader
 */
interface DeckHeaderProps {
  /**
   * Dane talii
   */
  deck: DeckResponse;
  /**
   * Statystyki talii
   */
  stats: DeckStats;
  /**
   * Callback rozpoczęcia powtórki
   */
  onStartReview: () => void;
  /**
   * Callback rozpoczęcia trybu nauki
   */
  onStartStudy: () => void;
  /**
   * Callback dodania fiszki
   */
  onAddFlashcard: () => void;
  /**
   * Callback edycji talii
   */
  onDeckEdit: () => void;
  /**
   * Callback usunięcia talii
   */
  onDeckDelete: () => void;
}

/**
 * Komponent nagłówka widoku talii
 *
 * Wyświetla informacje o talii (nazwa, statystyki) oraz przyciski akcji głównych.
 */
export const DeckHeader = React.memo(function DeckHeader({
  deck,
  stats,
  onStartReview,
  onStartStudy,
  onAddFlashcard,
  onDeckEdit,
  onDeckDelete,
}: DeckHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{stats.totalCount} fiszek</span>
            <span>{stats.learningCount} w trakcie nauki</span>
            <span>{stats.masteredCount} opanowanych</span>
            {stats.dueCount > 0 && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium dark:bg-orange-900 dark:text-orange-200">
                {stats.dueCount} do powtórki
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onStartReview}
            disabled={stats.dueCount === 0}
            aria-label="Rozpocznij powtórkę"
          >
            <Play className="mr-2 h-4 w-4" />
            Rozpocznij powtórkę
          </Button>
          <Button
            variant="outline"
            onClick={onStartStudy}
            disabled={stats.totalCount === 0}
            aria-label="Tryb nauki"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Tryb nauki
          </Button>
          <Button
            variant="outline"
            onClick={onAddFlashcard}
            aria-label="Dodaj fiszkę"
          >
            <Plus className="mr-2 h-4 w-4" />
            Dodaj fiszkę
          </Button>
          <Button
            variant="outline"
            onClick={onDeckEdit}
            aria-label="Edytuj talię"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edytuj
          </Button>
          <Button
            variant="outline"
            onClick={onDeckDelete}
            aria-label="Usuń talię"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Usuń
          </Button>
        </div>
      </div>
    </header>
  );
});


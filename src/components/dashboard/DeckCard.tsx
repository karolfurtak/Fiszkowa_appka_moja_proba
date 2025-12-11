import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MoreVertical, Play, BookOpen, Edit, Trash2 } from 'lucide-react';
import type { DeckViewModel } from '../../types';

/**
 * Propsy komponentu DeckCard
 */
interface DeckCardProps {
  /**
   * Dane talii do wyświetlenia
   */
  deck: DeckViewModel;
  /**
   * Callback kliknięcia na kartę (nawigacja do szczegółów talii)
   */
  onDeckClick: (deckId: number) => void;
  /**
   * Callback rozpoczęcia powtórki
   */
  onStartReview: (deckId: number) => void;
  /**
   * Callback rozpoczęcia trybu nauki
   */
  onStartStudy: (deckId: number) => void;
  /**
   * Callback edycji talii
   */
  onEdit: (deck: DeckViewModel) => void;
  /**
   * Callback usunięcia talii
   */
  onDelete: (deck: DeckViewModel) => void;
}

/**
 * Komponent karty talii
 *
 * Wyświetla informacje o talii, statystyki i przyciski akcji.
 */
export const DeckCard = React.memo(function DeckCard({
  deck,
  onDeckClick,
  onStartReview,
  onStartStudy,
  onEdit,
  onDelete,
}: DeckCardProps) {
  /**
   * Obsługa kliknięcia na kartę
   */
  const handleCardClick = React.useCallback(
    (e: React.MouseEvent) => {
      // Ignoruj kliknięcia na przyciski i dropdown
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[data-radix-popper-content-wrapper]')
      ) {
        return;
      }
      onDeckClick(deck.id);
    },
    [deck.id, onDeckClick]
  );

  /**
   * Obsługa rozpoczęcia powtórki
   */
  const handleStartReview = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStartReview(deck.id);
    },
    [deck.id, onStartReview]
  );

  /**
   * Obsługa rozpoczęcia trybu nauki
   */
  const handleStartStudy = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStartStudy(deck.id);
    },
    [deck.id, onStartStudy]
  );

  /**
   * Obsługa edycji talii
   */
  const handleEdit = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(deck);
    },
    [deck, onEdit]
  );

  /**
   * Obsługa usunięcia talii
   */
  const handleDelete = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(deck);
    },
    [deck, onDelete]
  );

  /**
   * Obsługa klawiatury na karcie
   */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onDeckClick(deck.id);
      }
    },
    [deck.id, onDeckClick]
  );

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Talia: ${deck.name}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">
            {deck.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Opcje dla talii ${deck.name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edytuj
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Usuń
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{deck.totalFlashcards} fiszek</span>
            {deck.hasDueFlashcards && (
              <span
                className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium dark:bg-orange-900 dark:text-orange-200"
                aria-label={`${deck.dueFlashcards} fiszek do powtórki`}
              >
                {deck.dueFlashcards} do powtórki
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0">
        <div className="flex gap-2 w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex-1">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!deck.hasDueFlashcards}
                    onClick={handleStartReview}
                    aria-label={`Rozpocznij powtórkę talii ${deck.name}`}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Powtórka
                  </Button>
                </span>
              </TooltipTrigger>
              {!deck.hasDueFlashcards && (
                <TooltipContent>
                  <p>Brak fiszek do powtórki</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={deck.totalFlashcards === 0}
            onClick={handleStartStudy}
            aria-label={`Rozpocznij tryb nauki talii ${deck.name}`}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Nauka
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});


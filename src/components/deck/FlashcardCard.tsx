import * as React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { FlashcardResponse } from '../../types';

/**
 * Propsy komponentu FlashcardCard
 */
interface FlashcardCardProps {
  /**
   * Dane fiszki
   */
  flashcard: FlashcardResponse;
  /**
   * Czy pytanie jest rozwinięte
   */
  isExpanded: boolean;
  /**
   * Callback zmiany stanu rozwinięcia
   */
  onToggleExpand: () => void;
  /**
   * Callback edycji fiszki
   */
  onEdit: (flashcard: FlashcardResponse) => void;
  /**
   * Callback usunięcia fiszki
   */
  onDelete: (flashcardId: number) => void;
}

/**
 * Komponent karty pojedynczej fiszki
 *
 * Wyświetla pytanie (skrócone z możliwością rozwinięcia), status i przyciski akcji.
 */
export const FlashcardCard = React.memo(function FlashcardCard({
  flashcard,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}: FlashcardCardProps) {
  const questionPreview = React.useMemo(() => {
    if (flashcard.question.length <= 100) {
      return flashcard.question;
    }
    return flashcard.question.substring(0, 100) + '...';
  }, [flashcard.question]);

  const handleEdit = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(flashcard);
    },
    [flashcard, onEdit]
  );

  const handleDelete = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(flashcard.id);
    },
    [flashcard.id, onDelete]
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div
              className="flex items-start gap-2 cursor-pointer"
              onClick={onToggleExpand}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleExpand();
                }
              }}
              aria-expanded={isExpanded}
            >
              <h3 className="text-lg font-semibold flex-1">
                {isExpanded ? flashcard.question : questionPreview}
              </h3>
              {flashcard.question.length > 100 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand();
                  }}
                  aria-label={isExpanded ? 'Zwiń pytanie' : 'Rozwiń pytanie'}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={flashcard.status === 'learning' ? 'default' : 'secondary'}>
                {flashcard.status === 'learning' ? 'W trakcie nauki' : 'Opanowana'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isExpanded && (
          <div className="space-y-3">
            {flashcard.image_url && (
              <div className="rounded-md overflow-hidden">
                <img
                  src={flashcard.image_url}
                  alt="Ilustracja do pytania"
                  className="w-full h-auto max-h-64 object-contain"
                  loading="lazy"
                />
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Odpowiedź:</p>
              <p>{flashcard.correct_answer}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            aria-label={`Edytuj fiszkę: ${questionPreview}`}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edytuj
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            aria-label={`Usuń fiszkę: ${questionPreview}`}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Usuń
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});


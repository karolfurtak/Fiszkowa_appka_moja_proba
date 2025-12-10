import * as React from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Edit2, RotateCcw, X } from 'lucide-react';
import type { FlashcardProposalResponse } from '../../types';

/**
 * Propsy komponentu FlashcardProposalCard
 */
interface FlashcardProposalCardProps {
  /**
   * Propozycja do wyświetlenia
   */
  proposal: FlashcardProposalResponse;
  /**
   * Czy propozycja jest zaznaczona
   */
  isSelected: boolean;
  /**
   * Callback zmiany zaznaczenia
   */
  onSelectChange: (proposalId: number, isSelected: boolean) => void;
  /**
   * Callback edycji propozycji
   */
  onEdit: (proposal: FlashcardProposalResponse) => void;
  /**
   * Callback regeneracji dystraktorów
   */
  onRegenerate: (proposalId: number) => void;
  /**
   * Callback odrzucenia propozycji
   */
  onReject: (proposalId: number) => void;
}

/**
 * Komponent karty propozycji fiszki
 * 
 * Wyświetla pytanie, odpowiedź, domenę oraz przyciski akcji.
 * Obsługuje zaznaczanie, edycję, regenerację i odrzucenie propozycji.
 */
export const FlashcardProposalCard = React.memo(function FlashcardProposalCard({
  proposal,
  isSelected,
  onSelectChange,
  onEdit,
  onRegenerate,
  onReject,
}: FlashcardProposalCardProps) {
  const [isQuestionExpanded, setIsQuestionExpanded] = React.useState(false);
  const [isAnswerExpanded, setIsAnswerExpanded] = React.useState(false);

  const shouldTruncateQuestion = proposal.question.length > 500;
  const shouldTruncateAnswer = proposal.correct_answer.length > 300;

  const displayQuestion = isQuestionExpanded || !shouldTruncateQuestion
    ? proposal.question
    : `${proposal.question.substring(0, 500)}...`;

  const displayAnswer = isAnswerExpanded || !shouldTruncateAnswer
    ? proposal.correct_answer
    : `${proposal.correct_answer.substring(0, 300)}...`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked: boolean) => {
                onSelectChange(proposal.id, checked === true);
              }}
              aria-label={`Zaznacz propozycję ${proposal.id}`}
            />
            {proposal.domain && (
              <span className="text-xs px-2 py-1 bg-muted rounded font-medium">
                {proposal.domain}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sekcja pytania */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Pytanie:</p>
          <div className="space-y-1">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {displayQuestion}
            </p>
            {shouldTruncateQuestion && (
              <button
                type="button"
                onClick={() => setIsQuestionExpanded(!isQuestionExpanded)}
                className="text-xs text-primary hover:underline"
              >
                {isQuestionExpanded ? 'Zwiń' : 'Rozwiń'}
              </button>
            )}
          </div>
        </div>

        {/* Sekcja odpowiedzi */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Odpowiedź:</p>
          <div className="space-y-1">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {displayAnswer}
            </p>
            {shouldTruncateAnswer && (
              <button
                type="button"
                onClick={() => setIsAnswerExpanded(!isAnswerExpanded)}
                className="text-xs text-primary hover:underline"
              >
                {isAnswerExpanded ? 'Zwiń' : 'Rozwiń'}
              </button>
            )}
          </div>
        </div>

        {/* Obrazek (jeśli dostępny) */}
        {proposal.image_url && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Obrazek:</p>
            <img
              src={proposal.image_url}
              alt="Ilustracja do pytania"
              className="max-w-full h-auto rounded-md border"
              loading="lazy"
            />
          </div>
        )}

        {/* Przyciski akcji */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(proposal)}
            aria-label={`Edytuj propozycję ${proposal.id}`}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edytuj
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRegenerate(proposal.id)}
            aria-label={`Regeneruj dystraktory dla propozycji ${proposal.id}`}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Regeneruj
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(proposal.id)}
            aria-label={`Odrzuć propozycję ${proposal.id}`}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Odrzuć
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});


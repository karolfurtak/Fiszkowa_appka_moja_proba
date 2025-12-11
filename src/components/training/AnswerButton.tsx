import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import type { AnswerOption } from '../../lib/utils/training';

/**
 * Propsy komponentu AnswerButton
 */
interface AnswerButtonProps {
  /**
   * Opcja odpowiedzi
   */
  answer: AnswerOption;
  /**
   * Czy ta odpowiedź została wybrana
   */
  isSelected: boolean;
  /**
   * Czy odpowiedź jest poprawna (null = jeszcze nie wybrano)
   */
  isCorrect: boolean | null;
  /**
   * Czy odpowiedź została wysłana
   */
  isAnswerSubmitted: boolean;
  /**
   * Callback kliknięcia
   */
  onClick: () => void;
  /**
   * Indeks odpowiedzi (0-3, dla klawiatury 1-4)
   */
  index: number;
}

/**
 * Komponent przycisku odpowiedzi
 *
 * Wyświetla jedną z opcji odpowiedzi. Po wyborze odpowiedzi
 * przycisk zmienia styl wizualny (zielony dla poprawnej,
 * czerwony dla błędnej) oraz może być nieaktywny po wyborze.
 */
export const AnswerButton = React.memo(function AnswerButton({
  answer,
  isSelected,
  isCorrect,
  isAnswerSubmitted,
  onClick,
  index,
}: AnswerButtonProps) {
  /**
   * Określenie wariantu przycisku na podstawie stanu
   */
  const buttonVariant = React.useMemo(() => {
    if (!isAnswerSubmitted) {
      return 'outline';
    }
    if (answer.isCorrect) {
      return 'default'; // Zielony dla poprawnej
    }
    if (isSelected && !answer.isCorrect) {
      return 'destructive'; // Czerwony dla błędnej wybranej
    }
    return 'outline';
  }, [isAnswerSubmitted, answer.isCorrect, isSelected]);

  /**
   * Określenie klasy CSS dla koloru tła
   */
  const buttonClassName = React.useMemo(() => {
    if (!isAnswerSubmitted) {
      return '';
    }
    if (answer.isCorrect) {
      return 'bg-green-500 hover:bg-green-600 text-white border-green-600';
    }
    if (isSelected && !answer.isCorrect) {
      return 'bg-red-500 hover:bg-red-600 text-white border-red-600';
    }
    return '';
  }, [isAnswerSubmitted, answer.isCorrect, isSelected]);

  /**
   * Obsługa klawiatury
   */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isAnswerSubmitted) {
          onClick();
        }
      }
    },
    [isAnswerSubmitted, onClick]
  );

  return (
    <Button
      variant={buttonVariant}
      size="lg"
      className={`w-full justify-start text-left h-auto py-4 px-6 ${buttonClassName}`}
      onClick={onClick}
      disabled={isAnswerSubmitted}
      onKeyDown={handleKeyDown}
      aria-label={`Odpowiedź ${index + 1}: ${answer.text}${answer.isCorrect ? ' (poprawna)' : ''}`}
      aria-pressed={isSelected}
      aria-disabled={isAnswerSubmitted}
    >
      <div className="flex items-center gap-3 w-full">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
          {index + 1}
        </span>
        <span className="flex-1 text-base">{answer.text}</span>
        {isAnswerSubmitted && answer.isCorrect && (
          <Check className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        )}
        {isAnswerSubmitted && isSelected && !answer.isCorrect && (
          <X className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        )}
      </div>
    </Button>
  );
});


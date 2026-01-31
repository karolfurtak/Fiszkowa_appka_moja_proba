import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [ripple, setRipple] = React.useState<{ x: number; y: number } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

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
      return 'bg-green-500 hover:bg-green-600 text-white border-green-600 animate-success-pop';
    }
    if (isSelected && !answer.isCorrect) {
      return 'bg-red-500 hover:bg-red-600 text-white border-red-600 animate-shake';
    }
    return 'opacity-50';
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

  /**
   * Obsługa kliknięcia z efektem ripple
   */
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isAnswerSubmitted) return;

      // Create ripple effect
      const button = buttonRef.current;
      if (button) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setRipple({ x, y });
        setTimeout(() => setRipple(null), 600);
      }

      onClick();
    },
    [onClick, isAnswerSubmitted]
  );

  return (
    <Button
      ref={buttonRef}
      variant={buttonVariant}
      size="lg"
      className={cn(
        "w-full justify-start text-left h-auto py-4 px-6 relative overflow-hidden",
        "transition-all duration-300 ease-out",
        !isAnswerSubmitted && "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
        !isAnswerSubmitted && "hover:border-primary hover:bg-primary/5",
        buttonClassName
      )}
      onClick={handleClick}
      disabled={isAnswerSubmitted}
      onKeyDown={handleKeyDown}
      aria-label={`Odpowiedź ${index + 1}: ${answer.text}${answer.isCorrect ? ' (poprawna)' : ''}`}
      aria-pressed={isSelected}
      aria-disabled={isAnswerSubmitted}
    >
      {/* Ripple effect */}
      {ripple && (
        <span
          className="absolute rounded-full bg-primary/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      <div className="flex items-center gap-3 w-full relative z-10">
        <span className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
          "transition-all duration-300",
          !isAnswerSubmitted && "bg-muted",
          isAnswerSubmitted && answer.isCorrect && "bg-green-600 text-white",
          isAnswerSubmitted && isSelected && !answer.isCorrect && "bg-red-600 text-white"
        )}>
          {isAnswerSubmitted && answer.isCorrect ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : isAnswerSubmitted && isSelected && !answer.isCorrect ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            index + 1
          )}
        </span>
        <span className="flex-1 text-base">{answer.text}</span>
        {isAnswerSubmitted && answer.isCorrect && (
          <Check className="h-5 w-5 flex-shrink-0 animate-success-pop" aria-hidden="true" />
        )}
        {isAnswerSubmitted && isSelected && !answer.isCorrect && (
          <X className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        )}
      </div>
    </Button>
  );
});


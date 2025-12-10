import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import type { FlashcardResponse, UpdateFlashcardRequest } from '../../types';

/**
 * Propsy komponentu FlashcardModal
 */
interface FlashcardModalProps {
  /**
   * Fiszka do edycji (null dla nowej fiszki)
   */
  flashcard: FlashcardResponse | null;
  /**
   * Czy modal jest otwarty
   */
  isOpen: boolean;
  /**
   * Callback zamknięcia modala
   */
  onClose: () => void;
  /**
   * Callback zapisu zmian
   */
  onSave: (data: UpdateFlashcardRequest) => Promise<void>;
}

/**
 * Komponent modala edycji fiszki
 *
 * Zawiera formularz z polami: pytanie, poprawna odpowiedź, URL obrazka.
 * Obsługuje walidację i zapis zmian.
 */
export const FlashcardModal = React.memo(function FlashcardModal({
  flashcard,
  isOpen,
  onClose,
  onSave,
}: FlashcardModalProps) {
  const [question, setQuestion] = React.useState('');
  const [correctAnswer, setCorrectAnswer] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [errors, setErrors] = React.useState<{
    question?: string;
    correctAnswer?: string;
    imageUrl?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const questionInputRef = React.useRef<HTMLTextAreaElement>(null);

  /**
   * Resetowanie formularza przy zamknięciu modala lub zmianie fiszki
   */
  React.useEffect(() => {
    if (isOpen && flashcard) {
      setQuestion(flashcard.question);
      setCorrectAnswer(flashcard.correct_answer);
      setImageUrl(flashcard.image_url || '');
      setErrors({});
      setIsSubmitting(false);
      // Fokus na pole pytania przy otwarciu
      setTimeout(() => {
        questionInputRef.current?.focus();
      }, 100);
    } else if (!isOpen) {
      setQuestion('');
      setCorrectAnswer('');
      setImageUrl('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, flashcard]);

  /**
   * Walidacja pytania
   */
  const validateQuestion = React.useCallback((value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Pytanie jest wymagane';
    }
    if (trimmed.length < 2) {
      return 'Pytanie musi zawierać co najmniej 2 znaki';
    }
    if (trimmed.length > 10000) {
      return 'Pytanie nie może przekraczać 10000 znaków';
    }
    return undefined;
  }, []);

  /**
   * Walidacja odpowiedzi
   */
  const validateAnswer = React.useCallback((value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Odpowiedź jest wymagana';
    }
    if (trimmed.length > 500) {
      return 'Odpowiedź nie może przekraczać 500 znaków';
    }
    return undefined;
  }, []);

  /**
   * Walidacja URL obrazka
   */
  const validateImageUrl = React.useCallback((value: string): string | undefined => {
    if (!value.trim()) {
      return undefined; // URL obrazka jest opcjonalne
    }
    try {
      new URL(value.trim());
      return undefined;
    } catch {
      return 'Nieprawidłowy format URL';
    }
  }, []);

  /**
   * Obsługa zmiany pytania
   */
  const handleQuestionChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setQuestion(value);
      if (errors.question) {
        setErrors((prev) => ({
          ...prev,
          question: validateQuestion(value),
        }));
      }
    },
    [errors.question, validateQuestion]
  );

  /**
   * Obsługa zmiany odpowiedzi
   */
  const handleAnswerChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setCorrectAnswer(value);
      if (errors.correctAnswer) {
        setErrors((prev) => ({
          ...prev,
          correctAnswer: validateAnswer(value),
        }));
      }
    },
    [errors.correctAnswer, validateAnswer]
  );

  /**
   * Obsługa zmiany URL obrazka
   */
  const handleImageUrlChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setImageUrl(value);
      if (errors.imageUrl) {
        setErrors((prev) => ({
          ...prev,
          imageUrl: validateImageUrl(value),
        }));
      }
    },
    [errors.imageUrl, validateImageUrl]
  );

  /**
   * Obsługa submit formularza
   */
  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const questionError = validateQuestion(question);
      const answerError = validateAnswer(correctAnswer);
      const imageUrlError = validateImageUrl(imageUrl);

      if (questionError || answerError || imageUrlError) {
        setErrors({
          question: questionError || undefined,
          correctAnswer: answerError || undefined,
          imageUrl: imageUrlError || undefined,
        });
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        const updateData: UpdateFlashcardRequest = {
          question: question.trim(),
          correct_answer: correctAnswer.trim(),
          image_url: imageUrl.trim() || null,
        };

        await onSave(updateData);
        onClose();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Nie udało się zapisać zmian';
        // Możemy wyświetlić ogólny błąd lub dodać do errors
        setErrors({
          question: errorMessage.includes('question') ? errorMessage : undefined,
          correctAnswer: errorMessage.includes('answer') ? errorMessage : undefined,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [question, correctAnswer, imageUrl, validateQuestion, validateAnswer, validateImageUrl, onSave, onClose]
  );

  /**
   * Obsługa zamknięcia modala
   */
  const handleClose = React.useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  /**
   * Obsługa klawisza Escape
   */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    },
    [isSubmitting, handleClose]
  );

  if (!flashcard) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent onKeyDown={handleKeyDown} aria-describedby="flashcard-modal-description">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
          <DialogDescription id="flashcard-modal-description">
            Zmień pytanie, odpowiedź lub obrazek dla tej fiszki.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flashcard-question">Pytanie</Label>
              <Textarea
                id="flashcard-question"
                ref={questionInputRef}
                placeholder="Wprowadź pytanie..."
                value={question}
                onChange={handleQuestionChange}
                disabled={isSubmitting}
                aria-invalid={errors.question ? 'true' : 'false'}
                aria-describedby={errors.question ? 'flashcard-question-error' : undefined}
                maxLength={10000}
                rows={4}
                className="resize-none"
              />
              {errors.question && (
                <p id="flashcard-question-error" className="text-sm text-destructive" role="alert">
                  {errors.question}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {question.length}/10000 znaków
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flashcard-answer">Poprawna odpowiedź</Label>
              <Textarea
                id="flashcard-answer"
                placeholder="Wprowadź poprawną odpowiedź..."
                value={correctAnswer}
                onChange={handleAnswerChange}
                disabled={isSubmitting}
                aria-invalid={errors.correctAnswer ? 'true' : 'false'}
                aria-describedby={errors.correctAnswer ? 'flashcard-answer-error' : undefined}
                maxLength={500}
                rows={3}
                className="resize-none"
              />
              {errors.correctAnswer && (
                <p id="flashcard-answer-error" className="text-sm text-destructive" role="alert">
                  {errors.correctAnswer}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {correctAnswer.length}/500 znaków
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flashcard-image-url">URL obrazka (opcjonalne)</Label>
              <Input
                id="flashcard-image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={handleImageUrlChange}
                disabled={isSubmitting}
                aria-invalid={errors.imageUrl ? 'true' : 'false'}
                aria-describedby={errors.imageUrl ? 'flashcard-image-url-error' : undefined}
              />
              {errors.imageUrl && (
                <p id="flashcard-image-url-error" className="text-sm text-destructive" role="alert">
                  {errors.imageUrl}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});


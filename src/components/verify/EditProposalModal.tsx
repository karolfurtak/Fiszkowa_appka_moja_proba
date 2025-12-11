import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import type { FlashcardProposalResponse, UpdateProposalRequest } from '../../types';

/**
 * Propsy komponentu EditProposalModal
 */
interface EditProposalModalProps {
  /**
   * Propozycja do edycji (null = zamknięty)
   */
  proposal: FlashcardProposalResponse | null;
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
  onSave: (proposalId: number, updates: UpdateProposalRequest) => Promise<void>;
}

/**
 * Stan komponentu EditProposalModal
 */
interface EditProposalModalState {
  question: string;
  correctAnswer: string;
  imageUrl: string;
  domain: string;
  errors: {
    question?: string;
    correctAnswer?: string;
    imageUrl?: string;
    domain?: string;
  };
  isSaving: boolean;
}

/**
 * Komponent modala edycji propozycji
 * 
 * Umożliwia zmianę pytania, odpowiedzi, URL obrazka i domeny wiedzy.
 * Zawiera walidację pól przed zapisaniem zmian.
 */
export function EditProposalModal({
  proposal,
  isOpen,
  onClose,
  onSave,
}: EditProposalModalProps) {
  const [state, setState] = React.useState<EditProposalModalState>({
    question: '',
    correctAnswer: '',
    imageUrl: '',
    domain: '',
    errors: {},
    isSaving: false,
  });

  // Inicjalizacja wartości pól gdy propozycja się zmienia
  React.useEffect(() => {
    if (proposal) {
      setState({
        question: proposal.question,
        correctAnswer: proposal.correct_answer,
        imageUrl: proposal.image_url || '',
        domain: proposal.domain || '',
        errors: {},
        isSaving: false,
      });
    }
  }, [proposal]);

  /**
   * Walidacja pytania
   * Zgodnie z ograniczeniami bazy danych: 2-10000 znaków
   */
  const validateQuestion = (question: string): string | undefined => {
    if (!question.trim()) {
      return 'Pytanie jest wymagane';
    }
    if (question.length < 2) {
      return `Pytanie musi zawierać co najmniej 2 znaki (obecnie: ${question.length} znaków)`;
    }
    if (question.length > 10000) {
      return `Pytanie nie może przekraczać 10000 znaków (obecnie: ${question.length} znaków)`;
    }
    return undefined;
  };

  /**
   * Walidacja odpowiedzi
   */
  const validateAnswer = (answer: string): string | undefined => {
    if (!answer.trim()) {
      return 'Odpowiedź jest wymagana';
    }
    if (answer.length > 500) {
      return `Odpowiedź nie może przekraczać 500 znaków (obecnie: ${answer.length} znaków)`;
    }
    return undefined;
  };

  /**
   * Walidacja URL obrazka
   */
  const validateImageUrl = (url: string): string | undefined => {
    if (!url.trim()) {
      return undefined; // URL jest opcjonalny
    }
    const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
    if (!urlRegex.test(url)) {
      return 'URL obrazka musi być prawidłowym adresem HTTP/HTTPS';
    }
    return undefined;
  };

  /**
   * Walidacja domeny
   */
  const validateDomain = (domain: string): string | undefined => {
    if (!domain.trim()) {
      return undefined; // Domena jest opcjonalna
    }
    if (domain.length > 100) {
      return `Domena nie może przekraczać 100 znaków (obecnie: ${domain.length} znaków)`;
    }
    return undefined;
  };

  /**
   * Walidacja wszystkich pól
   */
  const validateForm = (): boolean => {
    const errors: EditProposalModalState['errors'] = {};
    
    const questionError = validateQuestion(state.question);
    if (questionError) errors.question = questionError;

    const answerError = validateAnswer(state.correctAnswer);
    if (answerError) errors.correctAnswer = answerError;

    const imageUrlError = validateImageUrl(state.imageUrl);
    if (imageUrlError) errors.imageUrl = imageUrlError;

    const domainError = validateDomain(state.domain);
    if (domainError) errors.domain = domainError;

    setState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  /**
   * Obsługa zapisu zmian
   */
  const handleSave = React.useCallback(async () => {
    if (!proposal || !validateForm()) {
      return;
    }

    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      const updates: UpdateProposalRequest = {
        question: state.question.trim(),
        correct_answer: state.correctAnswer.trim(),
        image_url: state.imageUrl.trim() || null,
        domain: state.domain.trim() || null,
      };

      await onSave(proposal.id, updates);
      onClose();
    } catch (error) {
      console.error('Error saving proposal:', error);
      // Błąd jest obsłużony przez komponent nadrzędny (toast notification)
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  }, [proposal, state.question, state.correctAnswer, state.imageUrl, state.domain, onSave, onClose]);

  /**
   * Obsługa zamknięcia modala
   */
  const handleClose = React.useCallback(() => {
    if (!state.isSaving) {
      onClose();
    }
  }, [state.isSaving, onClose]);

  if (!proposal) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] !flex !flex-col !gap-0 p-0 overflow-hidden !top-[5vh] !-translate-y-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle>Edytuj propozycję</DialogTitle>
          <DialogDescription>
            Wprowadź zmiany w propozycji fiszki. Wszystkie pola są walidowane przed zapisaniem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {/* Pole pytania */}
          <div className="space-y-2">
            <Label htmlFor="edit-question">
              Pytanie <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="edit-question"
              value={state.question}
              onChange={(e) => {
                const value = e.target.value;
                setState((prev) => ({
                  ...prev,
                  question: value,
                  errors: { ...prev.errors, question: undefined },
                }));
              }}
              onBlur={() => {
                const error = validateQuestion(state.question);
                setState((prev) => ({
                  ...prev,
                  errors: { ...prev.errors, question: error },
                }));
              }}
              rows={8}
              className={state.errors.question ? 'border-destructive' : ''}
              aria-describedby={state.errors.question ? 'question-error' : undefined}
              aria-invalid={!!state.errors.question}
              disabled={state.isSaving}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {state.question.length} / 2-10000 znaków
              </p>
              {state.errors.question && (
                <p
                  id="question-error"
                  className="text-xs text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {state.errors.question}
                </p>
              )}
            </div>
          </div>

          {/* Pole odpowiedzi */}
          <div className="space-y-2">
            <Label htmlFor="edit-answer">
              Odpowiedź <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-answer"
              type="text"
              value={state.correctAnswer}
              onChange={(e) => {
                const value = e.target.value;
                setState((prev) => ({
                  ...prev,
                  correctAnswer: value,
                  errors: { ...prev.errors, correctAnswer: undefined },
                }));
              }}
              onBlur={() => {
                const error = validateAnswer(state.correctAnswer);
                setState((prev) => ({
                  ...prev,
                  errors: { ...prev.errors, correctAnswer: error },
                }));
              }}
              className={state.errors.correctAnswer ? 'border-destructive' : ''}
              aria-describedby={state.errors.correctAnswer ? 'answer-error' : undefined}
              aria-invalid={!!state.errors.correctAnswer}
              disabled={state.isSaving}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {state.correctAnswer.length} / 500 znaków
              </p>
              {state.errors.correctAnswer && (
                <p
                  id="answer-error"
                  className="text-xs text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {state.errors.correctAnswer}
                </p>
              )}
            </div>
          </div>

          {/* Pole URL obrazka */}
          <div className="space-y-2">
            <Label htmlFor="edit-image-url">URL obrazka</Label>
            <Input
              id="edit-image-url"
              type="url"
              value={state.imageUrl}
              onChange={(e) => {
                const value = e.target.value;
                setState((prev) => ({
                  ...prev,
                  imageUrl: value,
                  errors: { ...prev.errors, imageUrl: undefined },
                }));
              }}
              onBlur={() => {
                const error = validateImageUrl(state.imageUrl);
                setState((prev) => ({
                  ...prev,
                  errors: { ...prev.errors, imageUrl: error },
                }));
              }}
              placeholder="https://example.com/image.jpg"
              className={state.errors.imageUrl ? 'border-destructive' : ''}
              aria-describedby={state.errors.imageUrl ? 'image-url-error' : undefined}
              aria-invalid={!!state.errors.imageUrl}
              disabled={state.isSaving}
            />
            {state.errors.imageUrl && (
              <p
                id="image-url-error"
                className="text-xs text-destructive"
                role="alert"
                aria-live="polite"
              >
                {state.errors.imageUrl}
              </p>
            )}
          </div>

          {/* Pole domeny */}
          <div className="space-y-2">
            <Label htmlFor="edit-domain">Domena wiedzy</Label>
            <Input
              id="edit-domain"
              type="text"
              value={state.domain}
              onChange={(e) => {
                const value = e.target.value;
                setState((prev) => ({
                  ...prev,
                  domain: value,
                  errors: { ...prev.errors, domain: undefined },
                }));
              }}
              onBlur={() => {
                const error = validateDomain(state.domain);
                setState((prev) => ({
                  ...prev,
                  errors: { ...prev.errors, domain: error },
                }));
              }}
              placeholder="np. Biologia, Matematyka"
              maxLength={100}
              className={state.errors.domain ? 'border-destructive' : ''}
              aria-describedby={state.errors.domain ? 'domain-error' : undefined}
              aria-invalid={!!state.domain}
              disabled={state.isSaving}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {state.domain.length} / 100 znaków
              </p>
              {state.errors.domain && (
                <p
                  id="domain-error"
                  className="text-xs text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {state.errors.domain}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t px-6 py-4 bg-background">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={state.isSaving}
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSave}
            disabled={state.isSaving || Object.keys(state.errors).length > 0}
          >
            {state.isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Zapisywanie...
              </>
            ) : (
              'Zapisz zmiany'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


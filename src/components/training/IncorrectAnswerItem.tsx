import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Check } from 'lucide-react';

/**
 * Odpowiedź z sesji treningowej
 */
export interface SessionAnswer {
  /**
   * ID fiszki
   */
  flashcard_id: number;
  /**
   * Tekst wybranej odpowiedzi użytkownika
   */
  selected_answer: string;
  /**
   * Czy odpowiedź była poprawna
   */
  is_correct: boolean;
  /**
   * Tekst poprawnej odpowiedzi
   */
  correct_answer: string;
  /**
   * Tekst pytania (dla podsumowania)
   */
  question: string;
}

/**
 * Propsy komponentu IncorrectAnswerItem
 */
interface IncorrectAnswerItemProps {
  /**
   * Błędna odpowiedź do wyświetlenia
   */
  answer: SessionAnswer;
}

/**
 * Komponent karty błędnej odpowiedzi w ekranie podsumowania
 *
 * Wyświetla pytanie, odpowiedź użytkownika (czerwony kolor)
 * oraz poprawną odpowiedź (zielony kolor).
 */
export const IncorrectAnswerItem = React.memo(function IncorrectAnswerItem({
  answer,
}: IncorrectAnswerItemProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{answer.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">Twoja odpowiedź:</p>
            <p className="text-base text-destructive font-medium">{answer.selected_answer}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">Poprawna odpowiedź:</p>
            <p className="text-base text-green-600 font-medium">{answer.correct_answer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});


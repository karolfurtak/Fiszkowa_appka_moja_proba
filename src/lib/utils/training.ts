import type { FlashcardResponse } from '../../types';

/**
 * Opcja odpowiedzi w teście wielokrotnego wyboru
 */
export interface AnswerOption {
  /**
   * Tekst odpowiedzi
   */
  text: string;
  /**
   * Czy to poprawna odpowiedź
   */
  isCorrect: boolean;
  /**
   * Unikalny identyfikator odpowiedzi (dla React key)
   */
  id: string;
}

/**
 * Generuje dystraktory (błędne odpowiedzi) z innych fiszek z talii
 *
 * @param correctAnswer - Poprawna odpowiedź (która nie powinna być w dystraktorach)
 * @param allFlashcards - Wszystkie fiszki z talii
 * @param count - Liczba dystraktorów do wygenerowania (domyślnie 3)
 * @returns Tablica tekstów dystraktorów
 */
export function generateDistractors(
  correctAnswer: string,
  allFlashcards: FlashcardResponse[],
  count: number = 3
): string[] {
  // Filtrowanie fiszek z różnymi odpowiedziami niż poprawna
  const otherAnswers = allFlashcards
    .map((f) => f.correct_answer)
    .filter((answer) => answer !== correctAnswer && answer.trim().length > 0);

  // Losowanie unikalnych odpowiedzi
  const shuffled = [...otherAnswers].sort(() => Math.random() - 0.5);
  const selected: string[] = [];

  // Wybieranie unikalnych odpowiedzi
  for (const answer of shuffled) {
    if (!selected.includes(answer) && selected.length < count) {
      selected.push(answer);
    }
  }

  // Jeśli nie ma wystarczająco dużo różnych odpowiedzi, powtórz niektóre
  while (selected.length < count && otherAnswers.length > 0) {
    const randomAnswer = otherAnswers[Math.floor(Math.random() * otherAnswers.length)];
    if (!selected.includes(randomAnswer)) {
      selected.push(randomAnswer);
    } else if (selected.length < count) {
      // Jeśli wszystkie dostępne odpowiedzi są już użyte, użyj losowej ponownie
      selected.push(randomAnswer);
    }
  }

  return selected.slice(0, count);
}

/**
 * Losuje kolejność odpowiedzi (Fisher-Yates shuffle)
 *
 * @param answers - Tablica opcji odpowiedzi
 * @returns Przetasowana tablica odpowiedzi
 */
export function shuffleAnswers(answers: AnswerOption[]): AnswerOption[] {
  const shuffled = [...answers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Tworzy opcje odpowiedzi (1 poprawna + dystraktory) i losuje ich kolejność
 *
 * @param correctAnswer - Poprawna odpowiedź
 * @param distractors - Tablica dystraktorów (błędnych odpowiedzi)
 * @returns Tablica opcji odpowiedzi z losową kolejnością
 */
export function createAnswerOptions(
  correctAnswer: string,
  distractors: string[]
): AnswerOption[] {
  // Tworzenie opcji odpowiedzi
  const options: AnswerOption[] = [
    {
      text: correctAnswer,
      isCorrect: true,
      id: `correct-${Date.now()}`,
    },
    ...distractors.map((distractor, index) => ({
      text: distractor,
      isCorrect: false,
      id: `distractor-${index}-${Date.now()}`,
    })),
  ];

  // Losowanie kolejności
  return shuffleAnswers(options);
}


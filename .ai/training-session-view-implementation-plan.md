# Plan implementacji widoku Tryb treningu (/deck/[id]/review)

## 1. Przegląd

Widok trybu treningu (`/deck/[id]/review`) umożliwia użytkownikowi przeprowadzenie sesji powtórkowej z wykorzystaniem algorytmu spaced repetition. Widok prezentuje fiszki w formacie testu wielokrotnego wyboru (1 poprawna odpowiedź, 3 błędne odpowiedzi - dystraktory) z natychmiastową informacją zwrotną po wyborze odpowiedzi. Po zakończeniu sesji wyświetlane jest podsumowanie wyników z listą błędnych odpowiedzi.

Widok implementuje wymagania z PRD (F-009 - dwa tryby nauki, F-010 - algorytm powtórek, F-011 - automatyczne archiwizowanie) oraz user stories US-014 (rozpoczęcie sesji treningowej), US-015 (odpowiadanie na pytanie w teście) i US-016 (zakończenie i podsumowanie sesji treningowej). Zapewnia pełnoekranowy interfejs skupiający uwagę użytkownika na fiszce oraz automatyczne przejścia między fiszkami po udzieleniu odpowiedzi.

## 2. Routing widoku

**Ścieżka**: `/deck/[id]/review`

**Plik**: `src/pages/deck/[id]/review.astro`

**Parametry routingu**:
- `id` (number) - identyfikator talii (`deck_id`) z której mają być wyświetlone fiszki do powtórki

**Middleware**: Widok wymaga autoryzacji (użytkownik musi być zalogowany). Jeśli użytkownik nie jest zalogowany, powinien być przekierowany na `/login?redirect=/deck/[id]/review`. Dodatkowo, talia musi należeć do zalogowanego użytkownika (RLS).

**Query Parameters**: Brak (wszystkie potrzebne dane są w `id`)

**Przykład URL**: `/deck/1/review`

**Nawigacja**:
- **Wejście**: Kliknięcie przycisku "Rozpocznij powtórkę" w widoku Lista fiszek (`/deck/[id]`)
- **Wyjście**: Przekierowanie na Lista fiszek (`/deck/[id]`) po zakończeniu sesji lub przerwaniu, lub na Dashboard (`/`) po kliknięciu "Wróć do dashboardu"

## 3. Struktura komponentów

```
deck/[id]/review.astro (Astro Page)
└── TrainingSession (React Component)
    ├── Container (div wrapper)
    │   ├── HeaderSection
    │   │   ├── ProgressBar (Shadcn/ui Progress) - pasek postępu "X / Y fiszek"
    │   │   └── Button (Shadcn/ui) - "Przerwij" (w rogu)
    │   ├── QuestionSection
    │   │   ├── Card (Shadcn/ui) - karta z pytaniem
    │   │   │   ├── QuestionText (h2) - tekst pytania (duży, czytelny)
    │   │   │   └── Image (img) - obrazek (conditional, jeśli image_url)
    │   │   └── AnswerButtonsSection
    │   │       ├── AnswerButton[] (Shadcn/ui Button) - 4 przyciski odpowiedzi (losowo ułożone)
    │   │       │   ├── AnswerButton (correct) - przycisk poprawnej odpowiedzi
    │   │       │   └── AnswerButton[] (incorrect) - 3 przyciski błędnych odpowiedzi (dystraktory)
    │   │       └── FeedbackSection (conditional, po wyborze odpowiedzi)
    │   │           ├── FeedbackMessage (div) - komunikat informacji zwrotnej
    │   │           │   ├── Icon (lucide-react) - ✓ (zielony) lub ✗ (czerwony)
    │   │           │   └── Text (span) - "Poprawna odpowiedź!" lub "Błędna odpowiedź"
    │   │           └── CorrectAnswerDisplay (div) - wyświetlenie poprawnej odpowiedzi (jeśli błędna)
    │   ├── SummaryScreen (conditional, na końcu sesji)
    │   │   ├── SummaryCard (Shadcn/ui Card)
    │   │   │   ├── SummaryHeader (h2) - "Podsumowanie sesji"
    │   │   │   ├── ScoreDisplay (div) - wynik "X / Y poprawnych"
    │   │   │   ├── PercentageDisplay (div) - procent poprawnych odpowiedzi
    │   │   │   ├── IncorrectAnswersList (div) - lista błędnych odpowiedzi
    │   │   │   │   └── IncorrectAnswerItem[] - karty błędnych odpowiedzi
    │   │   │   │       ├── QuestionText (p) - pytanie
    │   │   │   │       ├── UserAnswer (p) - odpowiedź użytkownika (czerwony)
    │   │   │   │       └── CorrectAnswer (p) - poprawna odpowiedź (zielony)
    │   │   │   └── ActionButtons (div)
    │   │   │       ├── Button (Shadcn/ui) - "Zakończ" (powrót do listy fiszek)
    │   │   │       └── Button (Shadcn/ui) - "Wróć do dashboardu"
    │   └── LoadingState (conditional)
    │       └── Skeleton (Shadcn/ui) - skeleton loader podczas ładowania fiszek
    └── Toast (Shadcn/ui) - toast notifications (błędy sieci, sukces)
```

## 4. Szczegóły komponentów

### TrainingSession (React Component)

**Lokalizacja**: `src/components/training/TrainingSession.tsx`

**Opis komponentu**: Główny komponent sesji treningowej odpowiedzialny za zarządzanie stanem sesji, wyświetlanie fiszek do powtórki, obsługę odpowiedzi użytkownika oraz aktualizację postępu nauki przez API. Komponent generuje dystraktory (błędne odpowiedzi) dynamicznie z innych fiszek z talii, losuje kolejność odpowiedzi oraz zarządza przejściami między fiszkami.

**Główne elementy HTML i komponenty dzieci**:
- `<div className="training-session-container">` - główny kontener pełnoekranowy
- `<header className="session-header">` - sekcja nagłówkowa z paskiem postępu i przyciskiem przerwania
- `Progress` (Shadcn/ui) - pasek postępu pokazujący "X / Y fiszek"
- `Button` (Shadcn/ui) - przycisk "Przerwij" w rogu
- `<main className="question-section">` - sekcja główna z pytaniem i odpowiedziami
- `Card` (Shadcn/ui) - karta z pytaniem
- `<h2 className="question-text">` - tekst pytania (duży, czytelny, wyśrodkowany)
- `<img>` (conditional) - obrazek (jeśli `image_url` jest ustawiony)
- `<div className="answer-buttons">` - kontener przycisków odpowiedzi
- `Button[]` (Shadcn/ui) - 4 przyciski odpowiedzi (losowo ułożone)
- `<div className="feedback-section">` (conditional) - sekcja informacji zwrotnej po wyborze odpowiedzi
- `SummaryScreen` - ekran podsumowania (warunkowo renderowany na końcu sesji)
- `Toast` (Shadcn/ui) - toast notifications

**Obsługiwane zdarzenia**:
- `onMount` (useEffect) - pobranie fiszek do powtórki po zamontowaniu komponentu
- `onClick` - kliknięcie przycisku odpowiedzi (obsługa wyboru odpowiedzi)
- `onKeyDown` - obsługa klawiatury (1-4 dla odpowiedzi, Escape do przerwania)
- `onClick` - kliknięcie przycisku "Przerwij" (otwarcie modala potwierdzenia)
- `onClick` - kliknięcie przycisku "Zakończ" w podsumowaniu (powrót do listy fiszek)
- `onClick` - kliknięcie przycisku "Wróć do dashboardu" w podsumowaniu (przekierowanie na dashboard)
- Automatyczne przejście do następnej fiszki po 1-2 sekundach od wyboru odpowiedzi (setTimeout)
- Automatyczne wyświetlenie ekranu podsumowania po przejściu przez wszystkie fiszki

**Warunki walidacji** (szczegółowe, zgodnie z API):

**Deck ID:**
- Wymagane (nie może być puste)
- Format: number (identyfikator talii)
- Walidacja: sprawdzanie czy `id` jest prawidłową liczbą przed pobraniem fiszek
- Komunikaty błędów:
  - Brak deck_id: przekierowanie na dashboard z komunikatem błędu
  - Nieprawidłowy format: przekierowanie na dashboard z komunikatem błędu

**Fiszki do powtórki:**
- Tylko fiszki ze statusem `'learning'` są wyświetlane
- Tylko fiszki z `due_date <= now()` są wyświetlane
- Fiszki muszą należeć do talii należącej do zalogowanego użytkownika (RLS)
- Jeśli brak fiszek do powtórki: wyświetlenie empty state z komunikatem

**Odpowiedź użytkownika:**
- Musi być wybrana jedna z 4 odpowiedzi
- Walidacja po stronie serwera: sprawdzanie czy `flashcard_id` istnieje i należy do użytkownika
- Walidacja po stronie serwera: sprawdzanie czy `is_correct` jest zgodne z rzeczywistością

**Typy (DTO i ViewModel)**:

**Props komponentu**:
```typescript
interface TrainingSessionProps {
  deckId: number; // ID talii z URL
}
```

**Stan komponentu (ViewModel)**:
```typescript
interface TrainingSessionState {
  flashcards: FlashcardResponse[]; // Lista fiszek do powtórki
  currentFlashcardIndex: number; // Indeks aktualnej fiszki (0-based)
  currentFlashcard: FlashcardResponse | null; // Aktualna fiszka
  shuffledAnswers: AnswerOption[]; // Losowo ułożone odpowiedzi (1 poprawna + 3 dystraktory)
  selectedAnswer: string | null; // Wybrana odpowiedź użytkownika
  isAnswerSubmitted: boolean; // Czy odpowiedź została wysłana
  isCorrect: boolean | null; // Czy odpowiedź jest poprawna (null = jeszcze nie wybrano)
  sessionAnswers: SessionAnswer[]; // Lista wszystkich odpowiedzi w sesji
  isLoading: boolean; // Stan ładowania fiszek
  isSubmitting: boolean; // Stan wysyłania odpowiedzi do API
  error: string | null; // Komunikat błędu
  showSummary: boolean; // Czy wyświetlić ekran podsumowania
  isPaused: boolean; // Czy sesja jest wstrzymana (przed przerwaniem)
}
```

**Typy DTO używane przez komponent**:
- `FlashcardResponse` - typ fiszki z API
- `SubmitQuizAnswerRequest` - żądanie wysłania odpowiedzi
- `SubmitQuizAnswerResponse` - odpowiedź z API po wysłaniu odpowiedzi
- `ProcessQuizSessionRequest` - żądanie przetworzenia całej sesji (opcjonalnie, na końcu)
- `ProcessQuizSessionResponse` - odpowiedź z API po przetworzeniu sesji

**ViewModel dla odpowiedzi**:
```typescript
interface AnswerOption {
  text: string; // Tekst odpowiedzi
  isCorrect: boolean; // Czy to poprawna odpowiedź
  id: string; // Unikalny identyfikator odpowiedzi (dla key w React)
}

interface SessionAnswer {
  flashcard_id: number;
  selected_answer: string; // Tekst wybranej odpowiedzi
  is_correct: boolean;
  correct_answer: string; // Tekst poprawnej odpowiedzi
  question: string; // Tekst pytania (dla podsumowania)
}
```

### AnswerButton (React Component)

**Lokalizacja**: `src/components/training/AnswerButton.tsx`

**Opis komponentu**: Komponent przycisku odpowiedzi wyświetlający jedną z opcji odpowiedzi. Po wyborze odpowiedzi przycisk zmienia styl wizualny (zielony dla poprawnej, czerwony dla błędnej) oraz może być nieaktywny (disabled) po wyborze odpowiedzi.

**Główne elementy HTML i komponenty dzieci**:
- `Button` (Shadcn/ui) - przycisk odpowiedzi
- `<span className="answer-text">` - tekst odpowiedzi
- Conditional styling - zmiana koloru i stylu po wyborze odpowiedzi

**Obsługiwane zdarzenia**:
- `onClick` - kliknięcie przycisku (wybór odpowiedzi)
- `onKeyDown` - obsługa klawiatury (Enter/Space do aktywacji)

**Warunki walidacji**:
- Przycisk jest nieaktywny (disabled) po wyborze odpowiedzi (`isAnswerSubmitted === true`)
- Przycisk jest nieaktywny podczas wysyłania odpowiedzi do API (`isSubmitting === true`)

**Typy**:

**Props komponentu**:
```typescript
interface AnswerButtonProps {
  answer: AnswerOption; // Opcja odpowiedzi
  isSelected: boolean; // Czy ta odpowiedź została wybrana
  isCorrect: boolean | null; // Czy odpowiedź jest poprawna (null = jeszcze nie wybrano)
  isAnswerSubmitted: boolean; // Czy odpowiedź została wysłana
  onClick: () => void; // Callback kliknięcia
  index: number; // Indeks odpowiedzi (0-3, dla klawiatury 1-4)
}
```

### SummaryScreen (React Component)

**Lokalizacja**: `src/components/training/SummaryScreen.tsx`

**Opis komponentu**: Komponent ekranu podsumowania wyświetlany po zakończeniu sesji treningowej. Pokazuje wynik sesji (liczba poprawnych/niepoprawnych odpowiedzi), procent poprawnych odpowiedzi oraz listę błędnych odpowiedzi z możliwością przejrzenia pytań i poprawnych odpowiedzi.

**Główne elementy HTML i komponenty dzieci**:
- `Card` (Shadcn/ui) - karta podsumowania
- `<h2 className="summary-title">` - tytuł "Podsumowanie sesji"
- `<div className="score-display">` - wyświetlenie wyniku "X / Y poprawnych"
- `<div className="percentage-display">` - wyświetlenie procentu poprawnych odpowiedzi
- `<div className="incorrect-answers-list">` - lista błędnych odpowiedzi
- `IncorrectAnswerItem[]` - karty błędnych odpowiedzi (renderowane w pętli)
- `<div className="action-buttons">` - sekcja przycisków akcji
- `Button` (Shadcn/ui) - "Zakończ" (powrót do listy fiszek)
- `Button` (Shadcn/ui) - "Wróć do dashboardu"

**Obsługiwane zdarzenia**:
- `onClick` - kliknięcie przycisku "Zakończ" (nawigacja do `/deck/[id]`)
- `onClick` - kliknięcie przycisku "Wróć do dashboardu" (nawigacja do `/`)

**Warunki walidacji**:
- Brak błędnych odpowiedzi: lista błędnych odpowiedzi nie jest wyświetlana, wyświetlany jest komunikat gratulacyjny
- Wszystkie odpowiedzi poprawne: specjalny komunikat gratulacyjny

**Typy**:

**Props komponentu**:
```typescript
interface SummaryScreenProps {
  totalAnswered: number; // Całkowita liczba odpowiedzi
  correctCount: number; // Liczba poprawnych odpowiedzi
  incorrectCount: number; // Liczba błędnych odpowiedzi
  incorrectAnswers: SessionAnswer[]; // Lista błędnych odpowiedzi
  onFinish: () => void; // Callback zakończenia (powrót do listy fiszek)
  onBackToDashboard: () => void; // Callback powrotu do dashboardu
}
```

### IncorrectAnswerItem (React Component)

**Lokalizacja**: `src/components/training/IncorrectAnswerItem.tsx`

**Opis komponentu**: Komponent karty błędnej odpowiedzi w ekranie podsumowania. Wyświetla pytanie, odpowiedź użytkownika (czerwony kolor) oraz poprawną odpowiedź (zielony kolor).

**Główne elementy HTML i komponenty dzieci**:
- `Card` (Shadcn/ui) - karta błędnej odpowiedzi
- `<p className="question-text">` - tekst pytania
- `<div className="answer-comparison">` - sekcja porównania odpowiedzi
- `<p className="user-answer incorrect">` - odpowiedź użytkownika (czerwony kolor)
- `<p className="correct-answer">` - poprawna odpowiedź (zielony kolor)

**Obsługiwane zdarzenia**: Brak (komponent tylko do wyświetlania)

**Warunki walidacji**: Brak

**Typy**:

**Props komponentu**:
```typescript
interface IncorrectAnswerItemProps {
  answer: SessionAnswer; // Błędna odpowiedź do wyświetlenia
}
```

## 5. Typy

### Typy DTO z API

**FlashcardResponse** (z `src/types.ts`):
```typescript
export type FlashcardResponse = Flashcard;

// Flashcard pochodzi z database.types.ts:
interface Flashcard {
  id: number;
  deck_id: number;
  question: string; // 1000-10000 znaków
  correct_answer: string; // max 500 znaków
  image_url: string | null; // Opcjonalny URL obrazka
  status: FlashcardStatus; // 'learning' | 'mastered'
  due_date: string; // ISO timestamp
  interval: number; // Interwał w dniach
  consecutive_correct_answers: number; // Liczba kolejnych poprawnych odpowiedzi
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

**SubmitQuizAnswerRequest** (z `src/types.ts`):
```typescript
export interface SubmitQuizAnswerRequest {
  flashcard_id: number;
  is_correct: boolean;
}
```

**SubmitQuizAnswerResponse** (z `src/types.ts`):
```typescript
export interface SubmitQuizAnswerResponse {
  flashcard_id: number;
  is_correct: boolean;
  updated_interval: number;
  consecutive_correct_answers: number;
  new_due_date: string; // ISO timestamp
  status: FlashcardStatus; // 'learning' | 'mastered'
  message: string;
}
```

**ProcessQuizSessionRequest** (z `src/types.ts`):
```typescript
export interface ProcessQuizSessionRequest {
  answers: Array<{
    flashcard_id: number;
    is_correct: boolean;
  }>;
}
```

**ProcessQuizSessionResponse** (z `src/types.ts`):
```typescript
export interface ProcessQuizSessionResponse {
  total_answered: number;
  correct_count: number;
  incorrect_count: number;
  updated_flashcards: Array<{
    flashcard_id: number;
    new_status: FlashcardStatus;
    new_interval: number;
    consecutive_correct_answers: number;
  }>;
  mastered_count: number;
}
```

### Typy ViewModel dla komponentów

**AnswerOptionViewModel**:
```typescript
interface AnswerOption {
  text: string; // Tekst odpowiedzi
  isCorrect: boolean; // Czy to poprawna odpowiedź
  id: string; // Unikalny identyfikator (dla React key)
}
```

**SessionAnswerViewModel**:
```typescript
interface SessionAnswer {
  flashcard_id: number;
  selected_answer: string; // Tekst wybranej odpowiedzi
  is_correct: boolean;
  correct_answer: string; // Tekst poprawnej odpowiedzi
  question: string; // Tekst pytania (dla podsumowania)
}
```

**TrainingSessionStatsViewModel**:
```typescript
interface TrainingSessionStats {
  totalFlashcards: number; // Całkowita liczba fiszek w sesji
  currentIndex: number; // Aktualny indeks (0-based)
  progress: number; // Postęp w procentach (0-100)
  answeredCount: number; // Liczba udzielonych odpowiedzi
  correctCount: number; // Liczba poprawnych odpowiedzi
  incorrectCount: number; // Liczba błędnych odpowiedzi
}
```

## 6. Zarządzanie stanem

Widok trybu treningu używa kombinacji React hooks oraz React Query (TanStack Query) do zarządzania stanem i komunikacji z API.

### React Hooks

**useState:**
- `flashcards` - FlashcardResponse[] - lista fiszek do powtórki
- `currentFlashcardIndex` - number - indeks aktualnej fiszki (0-based, domyślnie 0)
- `currentFlashcard` - FlashcardResponse | null - aktualna fiszka (obliczana z `flashcards[currentFlashcardIndex]`)
- `shuffledAnswers` - AnswerOption[] - losowo ułożone odpowiedzi dla aktualnej fiszki
- `selectedAnswer` - string | null - wybrana odpowiedź użytkownika (tekst odpowiedzi)
- `isAnswerSubmitted` - boolean - czy odpowiedź została wysłana do API
- `isCorrect` - boolean | null - czy odpowiedź jest poprawna (null = jeszcze nie wybrano)
- `sessionAnswers` - SessionAnswer[] - lista wszystkich odpowiedzi w sesji (dla podsumowania)
- `isLoading` - boolean - stan ładowania fiszek
- `isSubmitting` - boolean - stan wysyłania odpowiedzi do API
- `error` - string | null - komunikat błędu
- `showSummary` - boolean - czy wyświetlić ekran podsumowania (domyślnie false)
- `isPaused` - boolean - czy sesja jest wstrzymana (przed przerwaniem, domyślnie false)

**useMemo:**
- `currentFlashcard` - obliczana z `flashcards[currentFlashcardIndex]`
- `shuffledAnswers` - losowo ułożone odpowiedzi dla aktualnej fiszki (regenerowane przy zmianie fiszki)
- `stats` - TrainingSessionStatsViewModel - obliczone statystyki sesji
- `progress` - number - postęp w procentach (0-100)

**useEffect:**
- Pobranie fiszek do powtórki po zamontowaniu komponentu
- Generowanie losowych odpowiedzi przy zmianie aktualnej fiszki
- Automatyczne przejście do następnej fiszki po 1-2 sekundach od wyboru odpowiedzi
- Automatyczne wyświetlenie ekranu podsumowania po przejściu przez wszystkie fiszki
- Obsługa klawiatury (1-4 dla odpowiedzi, Escape do przerwania)

### React Query (TanStack Query)

**useQuery - pobieranie fiszek do powtórki:**
```typescript
const { data: flashcards, isLoading, error, refetch } = useQuery({
  queryKey: ['flashcards-due', deckId],
  queryFn: () => fetchFlashcardsDueForReview(deckId),
  enabled: !!deckId,
  staleTime: 0, // Zawsze pobieraj świeże dane (due_date może się zmienić)
});
```

**useMutation - wysłanie pojedynczej odpowiedzi:**
```typescript
const submitAnswerMutation = useMutation({
  mutationFn: ({ flashcardId, isCorrect }: { flashcardId: number, isCorrect: boolean }) =>
    submitQuizAnswer(flashcardId, isCorrect),
  onSuccess: (data) => {
    // Aktualizacja lokalnego stanu z odpowiedzią z API
    // Przejście do następnej fiszki po 1-2 sekundach
  },
  onError: (error) => {
    // Obsługa błędu (toast notification, możliwość retry)
  },
});
```

**useMutation - przetworzenie całej sesji (opcjonalnie, na końcu):**
```typescript
const processSessionMutation = useMutation({
  mutationFn: (answers: ProcessQuizSessionRequest['answers']) =>
    processQuizSession(answers),
  onSuccess: (data) => {
    // Wyświetlenie ekranu podsumowania z danymi z API
  },
  onError: (error) => {
    // Obsługa błędu (toast notification)
  },
});
```

### Custom Hook: useTrainingSession

Dla lepszej organizacji kodu można stworzyć custom hook `useTrainingSession`:

```typescript
export function useTrainingSession(deckId: number) {
  // Query - pobieranie fiszek
  const flashcardsQuery = useQuery({ ... });
  
  // Mutations
  const submitAnswerMutation = useMutation({ ... });
  const processSessionMutation = useMutation({ ... });
  
  // Local state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  // ... pozostałe stany
  
  // Computed values
  const currentFlashcard = useMemo(() => {
    const flashcards = flashcardsQuery.data || [];
    return flashcards[currentFlashcardIndex] || null;
  }, [flashcardsQuery.data, currentFlashcardIndex]);
  
  const shuffledAnswers = useMemo(() => {
    if (!currentFlashcard) return [];
    // Generowanie dystraktorów z innych fiszek z talii
    // Losowanie kolejności odpowiedzi
  }, [currentFlashcard, flashcardsQuery.data]);
  
  const stats = useMemo(() => {
    const flashcards = flashcardsQuery.data || [];
    const correctCount = sessionAnswers.filter(a => a.is_correct).length;
    return {
      totalFlashcards: flashcards.length,
      currentIndex: currentFlashcardIndex,
      progress: flashcards.length > 0 ? ((currentFlashcardIndex + 1) / flashcards.length) * 100 : 0,
      answeredCount: sessionAnswers.length,
      correctCount,
      incorrectCount: sessionAnswers.length - correctCount,
    };
  }, [flashcardsQuery.data, currentFlashcardIndex, sessionAnswers]);
  
  // Helper functions
  const handleAnswerSelect = (answerText: string) => {
    if (isAnswerSubmitted || !currentFlashcard) return;
    
    const isCorrect = answerText === currentFlashcard.correct_answer;
    setSelectedAnswer(answerText);
    setIsAnswerSubmitted(true);
    
    // Wysłanie odpowiedzi do API
    submitAnswerMutation.mutate({
      flashcardId: currentFlashcard.id,
      isCorrect,
    });
    
    // Zapisanie odpowiedzi w sesji
    setSessionAnswers(prev => [...prev, {
      flashcard_id: currentFlashcard.id,
      selected_answer: answerText,
      is_correct: isCorrect,
      correct_answer: currentFlashcard.correct_answer,
      question: currentFlashcard.question,
    }]);
  };
  
  const moveToNextFlashcard = () => {
    const flashcards = flashcardsQuery.data || [];
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Zakończenie sesji - wyświetlenie podsumowania
      setShowSummary(true);
    }
  };
  
  return {
    flashcards: flashcardsQuery.data || [],
    currentFlashcard,
    shuffledAnswers,
    selectedAnswer,
    isAnswerSubmitted,
    sessionAnswers,
    isLoading: flashcardsQuery.isLoading,
    isSubmitting: submitAnswerMutation.isPending,
    error: flashcardsQuery.error || submitAnswerMutation.error,
    showSummary,
    stats,
    handleAnswerSelect,
    moveToNextFlashcard,
    // ... pozostałe wartości i funkcje
  };
}
```

### Generowanie dystraktorów

Dystraktory (błędne odpowiedzi) są generowane dynamicznie z innych fiszek z talii:

```typescript
function generateDistractors(
  correctAnswer: string,
  allFlashcards: FlashcardResponse[],
  count: number = 3
): string[] {
  // Filtrowanie fiszek z różnymi odpowiedziami niż poprawna
  const otherAnswers = allFlashcards
    .map(f => f.correct_answer)
    .filter(answer => answer !== correctAnswer && answer.trim().length > 0);
  
  // Losowanie unikalnych odpowiedzi
  const shuffled = [...otherAnswers].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  
  // Jeśli nie ma wystarczająco dużo różnych odpowiedzi, powtórz niektóre
  while (selected.length < count) {
    const randomAnswer = otherAnswers[Math.floor(Math.random() * otherAnswers.length)];
    if (!selected.includes(randomAnswer)) {
      selected.push(randomAnswer);
    }
  }
  
  return selected.slice(0, count);
}
```

### Losowanie kolejności odpowiedzi

Odpowiedzi są losowo układane przy każdej fiszce:

```typescript
function shuffleAnswers(answers: AnswerOption[]): AnswerOption[] {
  const shuffled = [...answers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

## 7. Integracja API

### Pobieranie fiszek do powtórki

**Endpoint:** `GET /rest/v1/flashcards?deck_id=eq.{deck_id}&due_date=lte.{current_timestamp}&status=eq.learning&select=*&order=due_date.asc`

**Typ żądania:** Brak (GET request)

**Typ odpowiedzi:** `FlashcardResponse[]`

**Implementacja:**
```typescript
async function fetchFlashcardsDueForReview(deckId: number): Promise<FlashcardResponse[]> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Pobranie aktualnego timestamp
  const now = new Date().toISOString();
  
  const response = await fetch(
    `${supabaseUrl}/rest/v1/flashcards?deck_id=eq.${deckId}&due_date=lte.${now}&status=eq.learning&select=*&order=due_date.asc`,
    {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch flashcards');
  }
  
  const flashcards = await response.json();
  
  // Losowanie kolejności fiszek (opcjonalnie, zgodnie z US-015)
  return flashcards.sort(() => Math.random() - 0.5);
}
```

### Wysłanie pojedynczej odpowiedzi

**Endpoint:** `POST /functions/v1/submit-quiz-answer`

**Typ żądania:** `SubmitQuizAnswerRequest`

**Typ odpowiedzi:** `SubmitQuizAnswerResponse`

**Implementacja:**
```typescript
async function submitQuizAnswer(
  flashcardId: number,
  isCorrect: boolean
): Promise<SubmitQuizAnswerResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(`${supabaseUrl}/functions/v1/submit-quiz-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      flashcard_id: flashcardId,
      is_correct: isCorrect,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to submit answer');
  }
  
  return await response.json();
}
```

### Przetworzenie całej sesji (opcjonalnie)

**Endpoint:** `POST /functions/v1/process-quiz-session`

**Typ żądania:** `ProcessQuizSessionRequest`

**Typ odpowiedzi:** `ProcessQuizSessionResponse`

**Implementacja:**
```typescript
async function processQuizSession(
  answers: Array<{ flashcard_id: number; is_correct: boolean }>
): Promise<ProcessQuizSessionResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(`${supabaseUrl}/functions/v1/process-quiz-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      answers,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to process session');
  }
  
  return await response.json();
}
```

**Uwaga:** Przetworzenie całej sesji na końcu jest opcjonalne, ponieważ każda odpowiedź jest już przetwarzana indywidualnie przez `submit-quiz-answer`. Można użyć `process-quiz-session` jako backup lub do synchronizacji, jeśli niektóre odpowiedzi nie zostały zapisane.

## 8. Interakcje użytkownika

### Rozpoczęcie sesji treningowej

1. Użytkownik klika przycisk "Rozpocznij powtórkę" w widoku Lista fiszek (`/deck/[id]`)
2. Przekierowanie na `/deck/[id]/review`
3. Pobranie fiszek do powtórki przez API (tylko fiszki ze statusem `'learning'` i `due_date <= now()`)
4. Jeśli brak fiszek do powtórki: wyświetlenie empty state z komunikatem
5. Jeśli są fiszki: losowanie kolejności fiszek i wyświetlenie pierwszej fiszki

### Odpowiadanie na pytanie

1. Użytkownik widzi pytanie i 4 losowo ułożone odpowiedzi (1 poprawna + 3 dystraktory)
2. Użytkownik klika przycisk odpowiedzi (lub naciska klawisz 1-4)
3. Natychmiastowa informacja zwrotna:
   - Jeśli poprawna: przycisk zmienia kolor na zielony, wyświetla się ikona ✓ i komunikat "Poprawna odpowiedź!"
   - Jeśli błędna: przycisk zmienia kolor na czerwony, wyświetla się ikona ✗ i komunikat "Błędna odpowiedź", dodatkowo wyświetlana jest poprawna odpowiedź
4. Wysłanie odpowiedzi do API (`submit-quiz-answer`)
5. Zapisanie odpowiedzi w lokalnym stanie sesji (`sessionAnswers`)
6. Opóźnienie 1-2 sekundy
7. Automatyczne przejście do następnej fiszki (lub wyświetlenie podsumowania, jeśli to ostatnia fiszka)

### Przerwanie sesji

1. Użytkownik klika przycisk "Przerwij" w rogu ekranu (lub naciska Escape)
2. Wyświetlenie modala potwierdzenia: "Czy na pewno chcesz przerwać sesję? Postęp nie zostanie zapisany."
3. Jeśli użytkownik potwierdza:
   - Zapisanie odpowiedzi, które zostały już wysłane do API (jeśli są)
   - Przekierowanie na Lista fiszek (`/deck/[id]`)
4. Jeśli użytkownik anuluje: zamknięcie modala, kontynuacja sesji

### Zakończenie sesji

1. Po przejściu przez wszystkie fiszki automatyczne wyświetlenie ekranu podsumowania
2. Wyświetlenie wyniku: "X / Y poprawnych" oraz procentu poprawnych odpowiedzi
3. Wyświetlenie listy błędnych odpowiedzi (jeśli są):
   - Dla każdej błędnej odpowiedzi: pytanie, odpowiedź użytkownika (czerwony), poprawna odpowiedź (zielony)
4. Opcjonalnie: przetworzenie całej sesji przez API (`process-quiz-session`) jako backup
5. Użytkownik klika przycisk "Zakończ":
   - Przekierowanie na Lista fiszek (`/deck/[id]`)
6. Użytkownik klika przycisk "Wróć do dashboardu":
   - Przekierowanie na Dashboard (`/`)

### Nawigacja klawiaturą

1. Klawisze 1-4: wybór odpowiedzi (odpowiednio pierwsza, druga, trzecia, czwarta odpowiedź)
2. Escape: przerwanie sesji (otwarcie modala potwierdzenia)
3. Enter/Space: aktywacja przycisku odpowiedzi (jeśli focus jest na przycisku)
4. Tab: nawigacja między przyciskami odpowiedzi i przyciskiem "Przerwij"

## 9. Warunki i walidacja

### Walidacja po stronie klienta

**Deck ID:**
- Wymagane, nie może być puste
- Format: number (identyfikator talii)
- Walidacja przy ładowaniu widoku: jeśli brak lub nieprawidłowy format → przekierowanie na dashboard

**Fiszki do powtórki:**
- Tylko fiszki ze statusem `'learning'` są wyświetlane
- Tylko fiszki z `due_date <= now()` są wyświetlane
- Fiszki muszą należeć do talii należącej do zalogowanego użytkownika (RLS w Supabase)
- Jeśli brak fiszek do powtórki: wyświetlenie empty state z komunikatem

**Odpowiedź użytkownika:**
- Musi być wybrana jedna z 4 odpowiedzi
- Nie można wybrać odpowiedzi po jej wysłaniu (`isAnswerSubmitted === true`)
- Nie można wybrać odpowiedzi podczas wysyłania do API (`isSubmitting === true`)

**Dystraktory:**
- Muszą być wygenerowane przed wyświetleniem fiszki
- Muszą być różne od poprawnej odpowiedzi
- Jeśli brak wystarczającej liczby różnych odpowiedzi w talii, można powtórzyć niektóre dystraktory

### Walidacja po stronie serwera

Wszystkie warunki walidacji po stronie klienta są również weryfikowane po stronie serwera przez API Supabase:

- **Fiszki:** RLS policy zapewnia, że użytkownik może tylko odczytywać fiszki z talii, które posiada
- **Flashcard ID:** Sprawdzanie czy `flashcard_id` istnieje i należy do użytkownika
- **Odpowiedź:** Walidacja czy `is_correct` jest boolean
- **Status fiszki:** Sprawdzanie czy fiszka ma status `'learning'` (tylko takie mogą być w sesji treningowej)

### Wpływ walidacji na stan interfejsu

**Brak fiszek do powtórki:**
- Wyświetlenie empty state: "Brak fiszek do powtórki w tej talii. Wszystkie fiszki są już opanowane lub nie nadszedł jeszcze czas na powtórkę."
- Przycisk "Wróć do listy fiszek" umożliwiający powrót

**Błąd podczas pobierania fiszek:**
- Toast notification z komunikatem błędu
- Przycisk "Spróbuj ponownie" umożliwiający ponowne pobranie

**Błąd podczas wysyłania odpowiedzi:**
- Toast notification z komunikatem błędu
- Możliwość kontynuacji sesji (odpowiedź zapisana lokalnie, retry przy następnej odpowiedzi lub na końcu sesji)
- Opcjonalnie: zapisanie odpowiedzi w localStorage jako backup

**Nieprawidłowy deck ID:**
- Przekierowanie na dashboard z komunikatem błędu
- Toast notification: "Nie znaleziono talii"

## 10. Obsługa błędów

### Błędy sieciowe

**Brak połączenia z internetem:**
- Toast notification: "Brak połączenia z internetem. Sprawdź swoje połączenie."
- Możliwość kontynuacji sesji (odpowiedzi zapisane lokalnie)
- Automatyczna synchronizacja po przywróceniu połączenia (retry failed requests)

**Timeout żądania:**
- Toast notification: "Żądanie trwa zbyt długo. Spróbuj ponownie."
- Możliwość retry dla pojedynczej odpowiedzi lub całej sesji

### Błędy autoryzacji (401)

**Sesja wygasła:**
- Toast notification: "Sesja wygasła. Zaloguj się ponownie."
- Przekierowanie na `/login?redirect=/deck/[id]/review`
- Zachowanie stanu sesji w localStorage dla powrotu po zalogowaniu

**Brak autoryzacji:**
- Przekierowanie na `/login?redirect=/deck/[id]/review`
- Toast notification: "Musisz być zalogowany, aby rozpocząć sesję treningową."

### Błędy walidacji (400)

**Nieprawidłowe dane w żądaniu:**
- Toast notification z komunikatem błędu z API
- Możliwość kontynuacji sesji (pominięcie błędnej odpowiedzi)

**Fiszka już nie istnieje:**
- Toast notification: "Ta fiszka została usunięta."
- Automatyczne przejście do następnej fiszki

### Błędy nie znaleziono (404)

**Talia nie istnieje:**
- Toast notification: "Nie znaleziono talii."
- Przekierowanie na Dashboard (`/`)

**Fiszka nie istnieje:**
- Toast notification: "Fiszka nie istnieje."
- Automatyczne przejście do następnej fiszki

### Błędy serwera (500)

**Błąd serwera podczas pobierania fiszek:**
- Toast notification: "Wystąpił błąd serwera podczas pobierania fiszek. Spróbuj ponownie."
- Przycisk "Spróbuj ponownie" umożliwiający ponowne pobranie

**Błąd serwera podczas wysyłania odpowiedzi:**
- Toast notification: "Wystąpił błąd serwera podczas zapisywania odpowiedzi. Spróbuj ponownie."
- Możliwość kontynuacji sesji (odpowiedź zapisana lokalnie)
- Automatyczny retry przy następnej odpowiedzi lub na końcu sesji (batch retry)

### Przypadki brzegowe

**Brak fiszek do powtórki:**
- Empty state: "Brak fiszek do powtórki w tej talii. Wszystkie fiszki są już opanowane lub nie nadszedł jeszcze czas na powtórkę."
- Przycisk "Wróć do listy fiszek"
- Opcjonalnie: link do Dashboard

**Wszystkie odpowiedzi poprawne:**
- Ekran podsumowania z gratulacjami: "Gratulacje! Wszystkie odpowiedzi były poprawne!"
- Specjalny komunikat zamiast listy błędnych odpowiedzi

**Brak dystraktorów (za mało fiszek w talii):**
- Generowanie dystraktorów z dostępnych odpowiedzi (możliwe powtórzenia)
- Jeśli mniej niż 4 odpowiedzi w talii: wyświetlenie tylko dostępnych odpowiedzi (minimum 2: 1 poprawna + 1 dystraktor)

**Przerwanie sesji w trakcie:**
- Modal potwierdzenia: "Czy na pewno chcesz przerwać sesję? Postęp nie zostanie zapisany."
- Opcje: "Tak, przerwij" i "Anuluj"
- Jeśli potwierdzone: zapisanie odpowiedzi już wysłanych do API, przekierowanie na listę fiszek

**Błąd podczas aktualizacji postępu:**
- Toast notification z komunikatem błędu
- Możliwość kontynuacji sesji (postęp zapisany lokalnie)
- Retry przy następnej odpowiedzi lub na końcu sesji (batch retry wszystkich nieudanych odpowiedzi)

**Sesja przerwana przez zamknięcie przeglądarki:**
- Opcjonalnie: zapisanie stanu sesji w localStorage
- Przy ponownym otwarciu: możliwość kontynuacji sesji (jeśli sesja nie została zakończona)

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików

1. Utworzenie pliku strony Astro: `src/pages/deck/[id]/review.astro`
2. Utworzenie katalogu komponentów: `src/components/training/`
3. Utworzenie plików komponentów:
   - `src/components/training/TrainingSession.tsx`
   - `src/components/training/AnswerButton.tsx`
   - `src/components/training/SummaryScreen.tsx`
   - `src/components/training/IncorrectAnswerItem.tsx`
4. Utworzenie pliku funkcji API: `src/lib/api/training.ts`
5. Utworzenie custom hook: `src/hooks/useTrainingSession.ts` (opcjonalnie)
6. Utworzenie pliku utility functions: `src/lib/utils/training.ts` (generowanie dystraktorów, losowanie)

### Krok 2: Implementacja funkcji API

1. Utworzenie funkcji `fetchFlashcardsDueForReview(deckId: number): Promise<FlashcardResponse[]>`
2. Utworzenie funkcji `submitQuizAnswer(flashcardId: number, isCorrect: boolean): Promise<SubmitQuizAnswerResponse>`
3. Utworzenie funkcji `processQuizSession(answers: ProcessQuizSessionRequest['answers']): Promise<ProcessQuizSessionResponse>`
4. Integracja z Supabase client (`src/lib/supabase.ts`) dla pobrania sesji użytkownika

### Krok 3: Implementacja funkcji pomocniczych

1. Utworzenie funkcji `generateDistractors(correctAnswer: string, allFlashcards: FlashcardResponse[], count: number): string[]`
2. Utworzenie funkcji `shuffleAnswers(answers: AnswerOption[]): AnswerOption[]`
3. Utworzenie funkcji `createAnswerOptions(correctAnswer: string, distractors: string[]): AnswerOption[]`

### Krok 4: Implementacja komponentu AnswerButton

1. Użycie `Button` z Shadcn/ui jako kontener
2. Wyświetlanie tekstu odpowiedzi
3. Obsługa kliknięcia (callback od rodzica)
4. Conditional styling (zielony dla poprawnej, czerwony dla błędnej)
5. Stan disabled po wyborze odpowiedzi
6. Obsługa klawiatury (Enter/Space do aktywacji)
7. ARIA labels dla dostępności

### Krok 5: Implementacja komponentu IncorrectAnswerItem

1. Użycie `Card` z Shadcn/ui jako kontener
2. Wyświetlanie pytania
3. Wyświetlanie odpowiedzi użytkownika (czerwony kolor)
4. Wyświetlanie poprawnej odpowiedzi (zielony kolor)
5. Styling zgodny z design system

### Krok 6: Implementacja komponentu SummaryScreen

1. Użycie `Card` z Shadcn/ui jako kontener
2. Wyświetlanie wyniku (X / Y poprawnych)
3. Wyświetlanie procentu poprawnych odpowiedzi
4. Renderowanie listy błędnych odpowiedzi (IncorrectAnswerItem[])
5. Komunikat gratulacyjny dla wszystkich poprawnych odpowiedzi
6. Przyciski akcji: "Zakończ" i "Wróć do dashboardu"
7. Obsługa nawigacji (callback od rodzica)

### Krok 7: Implementacja komponentu TrainingSession

1. Integracja z React Query:
   - `useQuery` dla pobrania fiszek (`queryKey: ['flashcards-due', deckId]`)
   - `useMutation` dla wysłania pojedynczej odpowiedzi
   - `useMutation` dla przetworzenia całej sesji (opcjonalnie)
2. Stan lokalny:
   - `currentFlashcardIndex` - indeks aktualnej fiszki
   - `selectedAnswer` - wybrana odpowiedź
   - `isAnswerSubmitted` - czy odpowiedź została wysłana
   - `sessionAnswers` - lista wszystkich odpowiedzi
   - `showSummary` - czy wyświetlić podsumowanie
3. Obliczone wartości (useMemo):
   - `currentFlashcard` - aktualna fiszka
   - `shuffledAnswers` - losowo ułożone odpowiedzi
   - `stats` - statystyki sesji
4. Funkcje pomocnicze:
   - `handleAnswerSelect()` - obsługa wyboru odpowiedzi
   - `moveToNextFlashcard()` - przejście do następnej fiszki
   - `handlePause()` - przerwanie sesji
5. Renderowanie:
   - Pasek postępu (Progress)
   - Przycisk "Przerwij"
   - Karta z pytaniem i obrazkiem
   - Przyciski odpowiedzi (AnswerButton[])
   - Sekcja informacji zwrotnej (conditional)
   - SummaryScreen (conditional)
   - Toast notifications

### Krok 8: Implementacja automatycznych przejść

1. useEffect dla automatycznego przejścia do następnej fiszki po 1-2 sekundach od wyboru odpowiedzi
2. useEffect dla automatycznego wyświetlenia podsumowania po przejściu przez wszystkie fiszki
3. Cleanup funkcji setTimeout przy odmontowaniu komponentu

### Krok 9: Implementacja obsługi klawiatury

1. useEffect dla nasłuchiwania zdarzeń klawiatury
2. Obsługa klawiszy 1-4 (wybór odpowiedzi)
3. Obsługa Escape (przerwanie sesji)
4. Obsługa Enter/Space (aktywacja przycisku z focus)
5. Cleanup event listener przy odmontowaniu komponentu

### Krok 10: Implementacja strony Astro

1. Pobranie `id` z parametrów routingu (`Astro.params.id`)
2. Sprawdzenie autoryzacji (middleware lub w komponencie)
3. Przekazanie `deckId` do komponentu `TrainingSession`
4. Dodanie meta tagów dla SEO
5. Importowanie komponentu `TrainingSession` jako React component (client-side)

### Krok 11: Implementacja obsługi błędów

1. Obsługa błędów sieciowych (toast notifications)
2. Obsługa błędów autoryzacji (przekierowanie na login)
3. Obsługa błędów walidacji (toast notifications)
4. Obsługa błędów serwera (toast notifications z możliwością retry)
5. Obsługa przypadków brzegowych (empty state, wszystkie odpowiedzi poprawne)

### Krok 12: Implementacja dostępności (WCAG AA)

1. Semantyczny HTML (`<main>`, `<header>`, `<article>`)
2. ARIA labels dla przycisków odpowiedzi
3. ARIA live regions dla dynamicznych aktualizacji (postęp, informacja zwrotna)
4. Keyboard navigation (1-4, Escape, Tab, Enter, Space)
5. Focus management - automatyczne ustawienie focus na następnej fiszce
6. Widoczne focus states (outline)
7. Kontrast kolorów zgodny z WCAG AA (4.5:1 dla tekstu)

### Krok 13: Implementacja optymalizacji

1. React.memo dla AnswerButton (opcjonalnie)
2. useMemo dla obliczonych wartości (shuffledAnswers, stats)
3. Debouncing dla retry requests (opcjonalnie)
4. Lazy loading dla obrazków (jeśli image_url)
5. Optymalizacja renderowania (unikanie niepotrzebnych re-renderów)

### Krok 14: Testowanie

1. Testowanie pobierania fiszek (różne scenariusze: brak fiszek, wiele fiszek, błąd API)
2. Testowanie wyboru odpowiedzi (poprawna, błędna, klawiatura)
3. Testowanie automatycznych przejść (przejście do następnej fiszki, wyświetlenie podsumowania)
4. Testowanie przerwania sesji (modal potwierdzenia, nawigacja)
5. Testowanie ekranu podsumowania (różne scenariusze: wszystkie poprawne, wszystkie błędne, mieszane)
6. Testowanie obsługi błędów (sieć, autoryzacja, walidacja, serwer)
7. Testowanie dostępności (keyboard navigation, screen reader, kontrast)
8. Testowanie generowania dystraktorów (różne scenariusze: mało fiszek, dużo fiszek)
9. Testowanie responsive design (desktop-first, adaptacja mobile)

### Krok 15: Optymalizacja i poprawki

1. Optymalizacja renderowania (React.memo, useMemo)
2. Optymalizacja obrazków (lazy loading, placeholder)
3. Poprawki zgodnie z feedbackiem z testów
4. Optymalizacja wydajności (unikanie niepotrzebnych re-renderów, debouncing)


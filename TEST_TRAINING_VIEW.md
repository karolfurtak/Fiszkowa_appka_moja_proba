# Plan testów widoku Tryb treningu (`/deck/[id]/review`)

## 1. Testy strukturalne

### 1.1. Struktura plików

- [ ] **Plik strony Astro istnieje:**
  - `src/pages/deck/[id]/review.astro` - strona z dynamicznym routingiem

- [ ] **Komponenty React istnieją:**
  - `src/components/training/TrainingSession.tsx` - główny komponent
  - `src/components/training/AnswerButton.tsx` - przycisk odpowiedzi
  - `src/components/training/SummaryScreen.tsx` - ekran podsumowania
  - `src/components/training/IncorrectAnswerItem.tsx` - element błędnej odpowiedzi

- [ ] **Pliki API i utils istnieją:**
  - `src/lib/api/training.ts` - funkcje API
  - `src/lib/utils/training.ts` - funkcje pomocnicze

### 1.2. Struktura komponentów

#### TrainingSession.tsx
- [ ] Komponent eksportuje domyślnie funkcję `TrainingSession`
- [ ] Komponent przyjmuje props: `{ deckId: number }`
- [ ] Komponent używa `useState` do zarządzania stanem
- [ ] Komponent używa `useCallback` dla handlerów
- [ ] Komponent używa `useMemo` dla obliczonych wartości
- [ ] Komponent używa `useEffect` do pobierania danych
- [ ] Komponent używa `useEffect` do generowania odpowiedzi
- [ ] Komponent używa `useEffect` do obsługi klawiatury
- [ ] Komponent renderuje `Progress` (pasek postępu)
- [ ] Komponent renderuje `Card` z pytaniem
- [ ] Komponent renderuje `AnswerButton[]` (4 przyciski)
- [ ] Komponent renderuje sekcję informacji zwrotnej (conditional)
- [ ] Komponent renderuje `SummaryScreen` (conditional)
- [ ] Komponent obsługuje stany ładowania (Loader2)
- [ ] Komponent obsługuje stany błędów (Alert)
- [ ] Komponent obsługuje empty state

#### AnswerButton.tsx
- [ ] Komponent eksportuje `AnswerButton` jako `React.memo`
- [ ] Komponent przyjmuje wszystkie wymagane props
- [ ] Komponent renderuje numer odpowiedzi (1-4)
- [ ] Komponent renderuje tekst odpowiedzi
- [ ] Komponent zmienia kolor na zielony dla poprawnej odpowiedzi
- [ ] Komponent zmienia kolor na czerwony dla błędnej wybranej odpowiedzi
- [ ] Komponent wyłącza się po wyborze odpowiedzi (`disabled={isAnswerSubmitted}`)
- [ ] Komponent wyświetla ikonę Check dla poprawnej odpowiedzi
- [ ] Komponent wyświetla ikonę X dla błędnej wybranej odpowiedzi
- [ ] Komponent obsługuje klawiaturę (Enter/Space)
- [ ] Komponent używa ARIA labels

#### SummaryScreen.tsx
- [ ] Komponent eksportuje `SummaryScreen` jako `React.memo`
- [ ] Komponent przyjmuje wszystkie wymagane props
- [ ] Komponent renderuje wynik (X / Y poprawnych)
- [ ] Komponent renderuje procent poprawnych odpowiedzi
- [ ] Komponent renderuje listę błędnych odpowiedzi (`IncorrectAnswerItem[]`)
- [ ] Komponent renderuje komunikat gratulacyjny dla wszystkich poprawnych odpowiedzi
- [ ] Komponent renderuje przyciski "Zakończ" i "Wróć do dashboardu"
- [ ] Komponent używa ikony Trophy dla wszystkich poprawnych odpowiedzi

#### IncorrectAnswerItem.tsx
- [ ] Komponent eksportuje `IncorrectAnswerItem` jako `React.memo`
- [ ] Komponent eksportuje typ `SessionAnswer`
- [ ] Komponent przyjmuje props: `{ answer: SessionAnswer }`
- [ ] Komponent renderuje pytanie
- [ ] Komponent renderuje odpowiedź użytkownika (czerwony kolor)
- [ ] Komponent renderuje poprawną odpowiedź (zielony kolor)
- [ ] Komponent używa ikon X i Check

### 1.3. Integracja API

- [ ] `TrainingSession` używa `fetchFlashcardsDueForReview(deckId)` z `src/lib/api/training.ts`
- [ ] `TrainingSession` używa `submitQuizAnswer(flashcardId, isCorrect)` z `src/lib/api/training.ts`
- [ ] Obsługa błędów API (401, 404, timeout, offline)
- [ ] Przekierowania przy błędach autoryzacji
- [ ] Toast notifications dla błędów

### 1.4. Funkcje pomocnicze

- [ ] `generateDistractors()` - generuje dystraktory z innych fiszek
- [ ] `shuffleAnswers()` - losuje kolejność odpowiedzi (Fisher-Yates)
- [ ] `createAnswerOptions()` - tworzy opcje odpowiedzi i losuje kolejność

### 1.5. Stylowanie

- [ ] Responsywność (mobile, tablet, desktop)
- [ ] Dark mode support
- [ ] Pełnoekranowy layout
- [ ] Sticky header z paskiem postępu

### 1.6. Dostępność (WCAG AA)

- [ ] Semantyczny HTML (`<main>`, `<header>`, `<article>`)
- [ ] ARIA labels dla wszystkich interaktywnych elementów
- [ ] `aria-live="polite"` dla dynamicznych aktualizacji (informacja zwrotna)
- [ ] Keyboard navigation (1-4, Escape, Tab, Enter, Space)
- [ ] Focus management
- [ ] Kontrast kolorów (sprawdzenie wizualne)

## 2. Testy funkcjonalne (manualne)

### 2.1. Nawigacja do widoku

- [ ] Przejście z listy fiszek (`/deck/[id]`) przez kliknięcie "Rozpocznij powtórkę"
- [ ] Bezpośrednie wejście na `/deck/[id]/review` (zalogowany użytkownik)
- [ ] Przekierowanie na `/login` gdy użytkownik nie jest zalogowany
- [ ] Przekierowanie na `/deck/[id]` gdy talia nie istnieje

### 2.2. Wyświetlanie danych

- [ ] Wyświetlenie paska postępu (X / Y fiszek, procent)
- [ ] Wyświetlenie przycisku "Przerwij" w headerze
- [ ] Wyświetlenie pierwszej fiszki z pytaniem
- [ ] Wyświetlenie 4 losowo ułożonych odpowiedzi
- [ ] Wyświetlenie obrazka jeśli `image_url` jest dostępne
- [ ] Skeleton loader podczas ładowania danych

### 2.3. Wybór odpowiedzi

- [ ] Kliknięcie na przycisk odpowiedzi wybiera odpowiedź
- [ ] Natychmiastowa informacja zwrotna (zielony/czerwony)
- [ ] Wyświetlenie ikony Check dla poprawnej odpowiedzi
- [ ] Wyświetlenie ikony X dla błędnej odpowiedzi
- [ ] Wyświetlenie poprawnej odpowiedzi gdy odpowiedź była błędna
- [ ] Przyciski są wyłączone po wyborze odpowiedzi
- [ ] Automatyczne przejście do następnej fiszki po 1.5 sekundy

### 2.4. Nawigacja klawiaturą

- [ ] Klawisz 1 wybiera pierwszą odpowiedź
- [ ] Klawisz 2 wybiera drugą odpowiedź
- [ ] Klawisz 3 wybiera trzecią odpowiedź
- [ ] Klawisz 4 wybiera czwartą odpowiedź
- [ ] Escape przerywa sesję
- [ ] Klawiatura nie działa po wyborze odpowiedzi (do przejścia)

### 2.5. Przerwanie sesji

- [ ] Kliknięcie przycisku "Przerwij" przerywa sesję
- [ ] Naciśnięcie Escape przerywa sesję
- [ ] Przekierowanie do `/deck/[id]` po przerwaniu

### 2.6. Zakończenie sesji

- [ ] Automatyczne wyświetlenie podsumowania po ostatniej fiszce
- [ ] Wyświetlenie wyniku (X / Y poprawnych)
- [ ] Wyświetlenie procentu poprawnych odpowiedzi
- [ ] Wyświetlenie listy błędnych odpowiedzi (jeśli są)
- [ ] Komunikat gratulacyjny dla wszystkich poprawnych odpowiedzi
- [ ] Przycisk "Zakończ" przekierowuje do `/deck/[id]`
- [ ] Przycisk "Wróć do dashboardu" przekierowuje do `/`

### 2.7. Generowanie dystraktorów

- [ ] Dystraktory są różne od poprawnej odpowiedzi
- [ ] Dystraktory pochodzą z innych fiszek z talii
- [ ] Jeśli jest za mało różnych odpowiedzi, niektóre są powtarzane
- [ ] Kolejność odpowiedzi jest losowa przy każdej fiszce

### 2.8. Obsługa błędów

- [ ] Wyświetlenie błędu gdy brak fiszek do powtórki
- [ ] Wyświetlenie błędu gdy talia nie istnieje (404)
- [ ] Przekierowanie na login gdy sesja wygasła (401)
- [ ] Toast notification dla błędów sieciowych
- [ ] Kontynuacja sesji mimo błędów API (odpowiedzi zapisane lokalnie)
- [ ] Przycisk "Spróbuj ponownie" w stanie błędu

### 2.9. Empty state

- [ ] Wyświetlenie komunikatu gdy brak fiszek do powtórki
- [ ] Przycisk "Wróć do listy fiszek" przekierowuje do `/deck/[id]`
- [ ] Przycisk "Spróbuj ponownie" odświeża dane

### 2.10. Responsywność

- [ ] Widok działa poprawnie na mobile (< 640px)
- [ ] Widok działa poprawnie na tablet (640px - 1024px)
- [ ] Widok działa poprawnie na desktop (> 1024px)
- [ ] Pasek postępu jest responsywny
- [ ] Przyciski odpowiedzi są responsywne

### 2.11. Wydajność

- [ ] Brak błędów w konsoli przeglądarki
- [ ] Płynne przejścia między fiszkami
- [ ] Brak niepotrzebnych re-renderów (sprawdzenie React DevTools)

## 3. Testy dostępności (manualne)

- [ ] Nawigacja klawiaturą działa poprawnie
- [ ] Screen reader odczytuje wszystkie elementy poprawnie
- [ ] Focus jest widoczny na wszystkich interaktywnych elementach
- [ ] Kontrast kolorów jest wystarczający (WCAG AA)
- [ ] ARIA live regions działają poprawnie (informacja zwrotna)

## 4. Testy integracyjne

- [ ] Integracja z widokiem listy fiszek (`/deck/[id]`)
- [ ] Integracja z Dashboard (`/`)
- [ ] Przekierowania działają poprawnie
- [ ] Toast notifications działają poprawnie

## 5. Checklist przed wdrożeniem

- [ ] Wszystkie testy strukturalne przeszły
- [ ] Wszystkie testy funkcjonalne przeszły
- [ ] Brak błędów w konsoli
- [ ] Brak błędów TypeScript
- [ ] Brak błędów ESLint
- [ ] Kod jest zoptymalizowany (React.memo, useCallback, useMemo)
- [ ] Dostępność jest na poziomie WCAG AA
- [ ] Responsywność działa na wszystkich urządzeniach


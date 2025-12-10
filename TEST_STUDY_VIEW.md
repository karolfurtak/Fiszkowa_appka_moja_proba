# Plan testów widoku Tryb nauki (`/deck/[id]/study`)

## 1. Testy strukturalne

### 1.1. Struktura plików

- [ ] **Plik strony Astro istnieje:**
  - `src/pages/deck/[id]/study.astro` - strona z dynamicznym routingiem

- [ ] **Komponenty React istnieją:**
  - `src/components/study/StudyMode.tsx` - główny komponent
  - `src/components/study/StudyBreadcrumb.tsx` - breadcrumbs
  - `src/components/study/StudyHeader.tsx` - nagłówek z kontrolkami
  - `src/components/study/FlashcardFlip.tsx` - karta z animacją flip
  - `src/components/study/FlashcardFront.tsx` - strona przednia karty
  - `src/components/study/FlashcardBack.tsx` - strona tylna karty
  - `src/components/study/NavigationControls.tsx` - kontrolki nawigacji
  - `src/components/study/StudySidebar.tsx` - sidebar z listą fiszek
  - `src/components/study/FlashcardListItem.tsx` - element listy w sidebarze

### 1.2. Struktura komponentów

#### StudyMode.tsx
- [ ] Komponent eksportuje domyślnie funkcję `StudyMode`
- [ ] Komponent przyjmuje props: `{ deckId: number }`
- [ ] Komponent używa `useState` do zarządzania stanem
- [ ] Komponent używa `useCallback` dla handlerów
- [ ] Komponent używa `useEffect` do pobierania danych
- [ ] Komponent używa `useEffect` do obsługi klawiatury
- [ ] Komponent renderuje `StudyBreadcrumb`
- [ ] Komponent renderuje `StudyHeader`
- [ ] Komponent renderuje `FlashcardFlip`
- [ ] Komponent renderuje `NavigationControls`
- [ ] Komponent renderuje `StudySidebar`
- [ ] Komponent obsługuje stany ładowania (skeleton loader)
- [ ] Komponent obsługuje stany błędów (Alert)
- [ ] Komponent obsługuje empty state

#### StudyBreadcrumb.tsx
- [ ] Komponent eksportuje `StudyBreadcrumb` jako `React.memo`
- [ ] Komponent przyjmuje props: `{ deckName: string, deckId: number }`
- [ ] Komponent renderuje Breadcrumb z Shadcn/ui
- [ ] Komponent zawiera linki: Dashboard > [Nazwa talii] > Tryb nauki

#### StudyHeader.tsx
- [ ] Komponent eksportuje `StudyHeader` jako `React.memo`
- [ ] Komponent przyjmuje wszystkie wymagane props
- [ ] Komponent renderuje nazwę talii
- [ ] Komponent renderuje wskaźnik pozycji (X / Y)
- [ ] Komponent renderuje Select z filtrem statusu
- [ ] Komponent renderuje przycisk przełączający sidebar
- [ ] Komponent używa `aria-live="polite"` dla wskaźnika pozycji

#### FlashcardFlip.tsx
- [ ] Komponent eksportuje `FlashcardFlip` jako `React.memo`
- [ ] Komponent przyjmuje props: `{ flashcard, isFlipped, onFlip, onSwipeLeft?, onSwipeRight? }`
- [ ] Komponent renderuje kontener z `perspective-1000`
- [ ] Komponent renderuje wewnętrzny kontener z `transform-style: preserve-3d`
- [ ] Komponent renderuje `FlashcardFront`
- [ ] Komponent renderuje `FlashcardBack`
- [ ] Komponent używa klasy `backface-hidden` dla stron karty
- [ ] Komponent obsługuje kliknięcie na kartę
- [ ] Komponent obsługuje gesty swipe (touch i mouse)
- [ ] Komponent obsługuje klawiaturę (Enter/Space)
- [ ] Komponent ma `role="button"` i `aria-label`

#### FlashcardFront.tsx
- [ ] Komponent eksportuje `FlashcardFront` jako `React.memo`
- [ ] Komponent przyjmuje props: `{ question, imageUrl, onFlip }`
- [ ] Komponent renderuje pytanie (duży tekst)
- [ ] Komponent renderuje obrazek jeśli `imageUrl` jest dostępne
- [ ] Komponent obsługuje błędy ładowania obrazka

#### FlashcardBack.tsx
- [ ] Komponent eksportuje `FlashcardBack` jako `React.memo`
- [ ] Komponent przyjmuje props: `{ answer, onFlip }`
- [ ] Komponent renderuje odpowiedź (duży tekst)

#### NavigationControls.tsx
- [ ] Komponent eksportuje `NavigationControls` jako `React.memo`
- [ ] Komponent przyjmuje props: `{ currentIndex, totalCount, onPrevious, onNext }`
- [ ] Komponent renderuje przycisk "Poprzednia" z ikoną ChevronLeft
- [ ] Komponent renderuje przycisk "Następna" z ikoną ChevronRight
- [ ] Komponent wyłącza przycisk "Poprzednia" gdy `currentIndex === 0`
- [ ] Komponent wyłącza przycisk "Następna" gdy `currentIndex === totalCount - 1`
- [ ] Komponent używa semantycznego `<nav>` z `aria-label`

#### StudySidebar.tsx
- [ ] Komponent eksportuje `StudySidebar` jako `React.memo`
- [ ] Komponent przyjmuje props: `{ flashcards, currentIndex, isOpen, onFlashcardSelect, onClose }`
- [ ] Komponent renderuje overlay gdy `isOpen === true`
- [ ] Komponent renderuje sidebar z fixed positioning
- [ ] Komponent renderuje header z przyciskiem zamknięcia
- [ ] Komponent renderuje listę `FlashcardListItem`
- [ ] Komponent obsługuje klawisz Escape do zamknięcia
- [ ] Komponent używa semantycznego `<aside>` z `role="complementary"`

#### FlashcardListItem.tsx
- [ ] Komponent eksportuje `FlashcardListItem` jako `React.memo`
- [ ] Komponent przyjmuje props: `{ flashcard, index, isActive, onClick }`
- [ ] Komponent renderuje skrócone pytanie (max 50 znaków)
- [ ] Komponent renderuje Badge z statusem
- [ ] Komponent wyróżnia aktywną fiszkę (zmiana stylu)
- [ ] Komponent używa `aria-current` dla aktywnej fiszki

### 1.3. Integracja API

- [ ] `StudyMode` używa `fetchDeck(deckId)` z `src/lib/api/deck.ts`
- [ ] `StudyMode` używa `fetchFlashcards(deckId)` z `src/lib/api/deck.ts`
- [ ] Obsługa błędów API (401, 404, timeout, offline)
- [ ] Przekierowania przy błędach autoryzacji
- [ ] Toast notifications dla błędów

### 1.4. Stylowanie

- [ ] Klasy CSS w `src/styles/global.css`:
  - `.backface-hidden` - dla animacji flip
  - `.perspective-1000` - dla perspektywy 3D
- [ ] Responsywność (mobile, tablet, desktop)
- [ ] Dark mode support (jeśli dostępny)

### 1.5. Dostępność (WCAG AA)

- [ ] Semantyczny HTML (`<main>`, `<section>`, `<nav>`, `<aside>`)
- [ ] ARIA labels dla wszystkich interaktywnych elementów
- [ ] `aria-live="polite"` dla dynamicznych aktualizacji
- [ ] `aria-current` dla aktywnej fiszki
- [ ] Keyboard navigation (strzałki, Enter, Space, Escape)
- [ ] Focus management
- [ ] Kontrast kolorów (sprawdzenie wizualne)

## 2. Testy funkcjonalne (manualne)

### 2.1. Nawigacja do widoku

- [ ] Przejście z Dashboard przez kliknięcie "Tryb nauki" na karcie talii
- [ ] Przejście z listy fiszek (`/deck/[id]`) przez kliknięcie "Tryb nauki"
- [ ] Bezpośrednie wejście na `/deck/[id]/study` (zalogowany użytkownik)
- [ ] Przekierowanie na `/login` gdy użytkownik nie jest zalogowany
- [ ] Przekierowanie na `/deck/[id]` gdy talia nie istnieje

### 2.2. Wyświetlanie danych

- [ ] Wyświetlenie breadcrumbs: Dashboard > [Nazwa talii] > Tryb nauki
- [ ] Wyświetlenie nazwy talii w nagłówku
- [ ] Wyświetlenie wskaźnika pozycji (1 / X)
- [ ] Wyświetlenie pierwszej fiszki ze stroną przednią (pytanie)
- [ ] Wyświetlenie obrazka jeśli `image_url` jest dostępne
- [ ] Skeleton loader podczas ładowania danych

### 2.3. Animacja flip karty

- [ ] Kliknięcie na kartę odwraca ją (pytanie → odpowiedź)
- [ ] Kliknięcie na kartę ponownie odwraca ją z powrotem (odpowiedź → pytanie)
- [ ] Przycisk "Pokaż odpowiedź" odwraca kartę
- [ ] Animacja jest płynna (CSS transition)
- [ ] Karta resetuje się do strony przedniej przy zmianie fiszki

### 2.4. Nawigacja między fiszkami

#### Przyciski
- [ ] Przycisk "Następna" przechodzi do następnej fiszki
- [ ] Przycisk "Poprzednia" przechodzi do poprzedniej fiszki
- [ ] Przycisk "Poprzednia" jest wyłączony na pierwszej fiszce
- [ ] Przycisk "Następna" jest wyłączony na ostatniej fiszce
- [ ] Wskaźnik pozycji aktualizuje się przy nawigacji

#### Klawiatura
- [ ] Strzałka w prawo → następna fiszka
- [ ] Strzałka w lewo → poprzednia fiszka
- [ ] Enter → odwrócenie karty
- [ ] Spacja → odwrócenie karty
- [ ] Escape → zamknięcie sidebara (jeśli otwarty)

#### Gesty swipe (mobile/touch)
- [ ] Swipe w lewo → następna fiszka
- [ ] Swipe w prawo → poprzednia fiszka
- [ ] Minimalna odległość 50px dla uznania gestu
- [ ] Gesty działają tylko na głównej karcie (nie w sidebarze)

### 2.5. Filtrowanie po statusie

- [ ] Wybór "Wszystkie" pokazuje wszystkie fiszki
- [ ] Wybór "W trakcie nauki" pokazuje tylko fiszki ze statusem `learning`
- [ ] Wybór "Opanowane" pokazuje tylko fiszki ze statusem `mastered`
- [ ] Po zmianie filtra pozycja resetuje się do pierwszej fiszki
- [ ] Po zmianie filtra karta resetuje się do strony przedniej
- [ ] Wskaźnik pozycji aktualizuje się po zmianie filtra

### 2.6. Sidebar z listą fiszek

- [ ] Przycisk w nagłówku otwiera/zamyka sidebar
- [ ] Sidebar wysuwa się z prawej strony z animacją
- [ ] Overlay pojawia się przy otwarciu sidebara
- [ ] Kliknięcie na overlay zamyka sidebar
- [ ] Przycisk "Zamknij" w sidebarze zamyka sidebar
- [ ] Klawisz Escape zamyka sidebar
- [ ] Lista pokazuje wszystkie fiszki z przefiltrowanej listy
- [ ] Każdy element listy pokazuje skrócone pytanie i status
- [ ] Aktualnie wyświetlana fiszka jest wyróżniona
- [ ] Kliknięcie na element listy przechodzi do wybranej fiszki
- [ ] Po wyborze fiszki karta resetuje się do strony przedniej

### 2.7. Empty state

- [ ] Wyświetlenie komunikatu gdy talia jest pusta
- [ ] Wyświetlenie komunikatu gdy filtr nie zwraca wyników
- [ ] Przycisk "Pokaż wszystkie fiszki" gdy filtr nie zwraca wyników
- [ ] Przycisk "Wróć do listy fiszek" przekierowuje do `/deck/[id]`
- [ ] Breadcrumbs są widoczne w empty state

### 2.8. Obsługa błędów

- [ ] Wyświetlenie błędu gdy talia nie istnieje (404)
- [ ] Wyświetlenie błędu gdy brak dostępu do talii (403)
- [ ] Przekierowanie na login gdy sesja wygasła (401)
- [ ] Toast notification dla błędów sieciowych
- [ ] Przycisk "Spróbuj ponownie" w stanie błędu
- [ ] Obsługa błędów ładowania obrazków (fallback)

### 2.9. Responsywność

- [ ] Widok działa poprawnie na mobile (< 640px)
- [ ] Widok działa poprawnie na tablet (640px - 1024px)
- [ ] Widok działa poprawnie na desktop (> 1024px)
- [ ] Sidebar jest responsywny (pełna szerokość na mobile)
- [ ] Karta fiszki jest responsywna
- [ ] Nagłówek jest responsywny (flex-col na mobile)

### 2.10. Wydajność

- [ ] Brak błędów w konsoli przeglądarki
- [ ] Płynna animacja flip (60 FPS)
- [ ] Szybkie przełączanie między fiszkami
- [ ] Brak niepotrzebnych re-renderów (sprawdzenie React DevTools)

## 3. Testy dostępności (manualne)

- [ ] Nawigacja klawiaturą działa poprawnie
- [ ] Screen reader odczytuje wszystkie elementy poprawnie
- [ ] Focus jest widoczny na wszystkich interaktywnych elementach
- [ ] Kontrast kolorów jest wystarczający (WCAG AA)
- [ ] Wszystkie obrazy mają alt text (jeśli wymagane)

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
- [ ] Kod jest zoptymalizowany (React.memo, useCallback)
- [ ] Dostępność jest na poziomie WCAG AA
- [ ] Responsywność działa na wszystkich urządzeniach


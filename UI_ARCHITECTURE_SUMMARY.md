<conversation_summary>

<decisions>

1. Zaakceptowano hybrydowe podejście architektoniczne: główne widoki jako strony Astro (MPA) dla SEO i wydajności, interaktywne komponenty jako React SPA wewnątrz stron.

2. Zatwierdzono strukturę tras: `/` (dashboard), `/generate` (generator), `/deck/[id]` (widok talii), `/deck/[id]/review` (tryb treningu), `/deck/[id]/study` (tryb nauki), `/verify/[session_id]` (weryfikacja propozycji), `/settings` (ustawienia).

3. Zatwierdzono liniowy przepływ użytkownika: Dashboard → Generator → Ekran ładowania → Weryfikacja → Wybór talii → Dashboard.

4. Zatwierdzono wymagania dotyczące konfiguracji długości pytań (50-10000 znaków) i odpowiedzi (max 500 znaków) w formularzu generowania.

5. Zatwierdzono wymagania dotyczące wyboru języka generowania fiszek z dropdown menu (domyślnie "auto" dla automatycznego wykrywania).

6. Zatwierdzono użycie React Query (TanStack Query) do zarządzania stanem i cache'owania danych z API.

7. Zatwierdzono implementację optymistic updates dla operacji accept/reject propozycji.

8. Zatwierdzono strukturę nawigacji: Navigation Menu od Shadcn/ui w formie topbara (zamiast sidebar).

9. Zatwierdzono plan implementacji wszystkich 8 brakujących endpointów zgodnie z priorytetem gwiazdek (⭐⭐⭐ → ⭐⭐ → ⭐).

10. Zatwierdzono użycie middleware autoryzacji w Astro z przekierowaniem na `/login` dla nieautoryzowanych użytkowników.

</decisions>

<matched_recommendations>

1. **Struktura aplikacji (Rekomendacja #1)**: Hybrydowe podejście MPA + React SPA zostało zaakceptowane jako optymalne rozwiązanie dla Astro, zapewniające zarówno SEO jak i interaktywność.

2. **Przepływ użytkownika (Rekomendacja #2)**: Liniowy przepływ z wyraźnymi wskaźnikami postępu został zatwierdzony jako kluczowy dla UX podczas generowania i weryfikacji fiszek.

3. **Widok weryfikacji (Rekomendacja #3)**: Układ kart z możliwością akceptacji/odrzucenia pojedynczych i zbiorczych propozycji został zatwierdzony jako efektywny sposób przeglądania wielu propozycji.

4. **Tryb treningu (Rekomendacja #4)**: Pełnoekranowy widok z natychmiastową informacją zwrotną i automatycznym przejściem został zatwierdzony jako optymalny dla spaced repetition.

5. **Dashboard (Rekomendacja #5)**: Układ siatki kart talii z wyróżnioną liczbą fiszek do powtórki został zatwierdzony jako główny punkt wejścia użytkownika.

6. **Autoryzacja (Rekomendacja #6)**: Middleware w Astro z Supabase Auth helpers został zatwierdzony jako standardowy mechanizm ochrony tras.

7. **Formularz generowania (Rekomendacja #7)**: Accordion z sekcjami podstawowymi/zaawansowanymi został zatwierdzony jako sposób prezentacji konfiguracji (długość pytań, język, domena).

8. **Tryb nauki (Rekomendacja #8)**: Odwracalne karty z animacją flip i nawigacją sidebar zostały zatwierdzone jako interfejs dla swobodnego przeglądania.

9. **Zarządzanie stanem (Rekomendacja #9)**: React Query z optymistic updates i polling dla długotrwałych operacji zostały zatwierdzone jako strategia zarządzania stanem.

10. **Nawigacja (Rekomendacja #10)**: Navigation Menu od Shadcn/ui w formie topbara zostało zatwierdzone jako główny system nawigacji (zamiast sidebar).

</matched_recommendations>

<ui_architecture_planning_summary>

## Główne wymagania dotyczące architektury UI

### Stack technologiczny
- **Frontend Framework**: Astro z integracją React dla interaktywnych komponentów
- **Styling**: Tailwind CSS + Shadcn/ui dla spójnego design systemu
  - Użycie wariantów utility Tailwind CSS (`sm:`, `md:`, `lg:`, etc.) dla responsywności
- **State Management**: 
  - **Początkowo**: React hooks i React Context
  - **Później (jeśli potrzeba)**: Zustand dla bardziej zaawansowanego zarządzania stanem
  - React Query (TanStack Query) dla zarządzania stanem i cache'owania danych z API
- **Backend Integration**: Supabase client dla komunikacji z API i autoryzacji
- **Routing**: Astro file-based routing z dynamic routes dla talii (`/deck/[id]`)
- **Autoryzacja**: JWT (JSON Web Tokens) - implementacja w późniejszym etapie rozwoju
- **Dostępność**: Wymogi dostępności na poziomie WCAG AA

## Status implementacji widoków

### ✅ Zaimplementowane widoki (10/10) - **WSZYSTKIE WIDOKI GOTOWE**

1. **Generator fiszek** (`/generate`) - ✅ Gotowy
   - Formularz generowania z walidacją
   - Integracja z API Edge Function
   - Obsługa błędów i loading states
   - Komponenty: `GeneratorForm.tsx`, `CharacterCounter.tsx`

2. **Logowanie** (`/login`) - ✅ Gotowy
   - Formularz logowania z walidacją
   - Integracja z Supabase Auth
   - Obsługa błędów i przekierowań
   - Komponenty: `LoginForm.tsx`

3. **Rejestracja** (`/register`) - ✅ Gotowy
   - Formularz rejestracji z walidacją
   - Wskaźnik siły hasła
   - Integracja z Supabase Auth
   - Komponenty: `RegisterForm.tsx`, `PasswordStrengthIndicator.tsx`

4. **Weryfikacja propozycji** (`/verify/[session_id]`) - ✅ Gotowy
   - Lista propozycji z sesji generowania
   - Edycja, akceptacja, odrzucenie propozycji
   - Selektor talii i zapisywanie do talii
   - Modal edycji z pełną walidacją
   - Komponenty: `VerificationView.tsx`, `FlashcardProposalCard.tsx`, `EditProposalModal.tsx`, `DeckSelector.tsx`

5. **Ekran ładowania** (`/loading/[session_id]`) - ✅ Gotowy
   - Progress bar z animacją
   - Polling statusu generowania
   - Obsługa błędów i timeoutów
   - Komponenty: `LoadingScreen.tsx`
   - Hook: `useGenerationPolling.ts`

6. **Dashboard** (`/`) - ✅ Gotowy
   - Lista talii z wyszukiwarką
   - Tworzenie, edycja, usuwanie talii
   - Statystyki fiszek (total, due)
   - Nawigacja do trybów nauki
   - Komponenty: `DashboardView.tsx`, `DeckCard.tsx`, `SearchBar.tsx`, `EmptyState.tsx`, `CreateDeckDialog.tsx`, `EditDeckDialog.tsx`, `DeleteDeckDialog.tsx`

7. **Lista fiszek** (`/deck/[id]`) - ✅ Gotowy
   - Wyświetlanie wszystkich fiszek w talii
   - Filtrowanie po statusie (all/learning/mastered)
   - Edycja i usuwanie fiszek
   - Dodawanie nowych fiszek
   - Zarządzanie talią (edycja nazwy, usuwanie)
   - Komponenty: `DeckView.tsx`, `DeckHeader.tsx`, `FlashcardList.tsx`, `FlashcardCard.tsx`, `FlashcardFilters.tsx`, `FlashcardModal.tsx`, `AddFlashcardModal.tsx`, `FlashcardEmptyState.tsx`, `DeckBreadcrumb.tsx`

8. **Tryb nauki** (`/deck/[id]/study`) - ✅ Gotowy
   - Przeglądanie fiszek w formie odwracalnych kart
   - Animacja flip karty
   - Nawigacja między fiszkami (przyciski, klawiatura, gesty swipe)
   - Filtrowanie po statusie
   - Sidebar z listą fiszek
   - Komponenty: `StudyMode.tsx`, `StudyHeader.tsx`, `FlashcardFlip.tsx`, `FlashcardFront.tsx`, `FlashcardBack.tsx`, `NavigationControls.tsx`, `StudySidebar.tsx`, `FlashcardListItem.tsx`, `StudyBreadcrumb.tsx`

9. **Tryb treningu** (`/deck/[id]/review`) - ✅ Gotowy
   - Test wielokrotnego wyboru dla fiszek do powtórki
   - Generowanie dystraktorów
   - Aktualizacja postępu nauki (spaced repetition)
   - Ekran podsumowania sesji
   - Komponenty: `TrainingSession.tsx`, `AnswerButton.tsx`, `SummaryScreen.tsx`, `IncorrectAnswerItem.tsx`

10. **Ustawienia** (`/settings`) - ✅ Gotowy
    - Zmiana hasła z walidacją
    - Preferencje użytkownika
    - Ustawienia aplikacji (dark mode, tryb weryfikacji)
    - Usuwanie konta z potwierdzeniem
    - Komponenty: `SettingsView.tsx`, `PasswordChangeForm.tsx`, `UserPreferencesForm.tsx`, `AppSettingsForm.tsx`, `DeleteAccountDialog.tsx`

---

## Zależności między widokami

```
Generator fiszek (/generate)
    ↓
Ekran ładowania (/loading/[session_id])
    ↓
Weryfikacja propozycji (/verify/[session_id])
    ↓
Dashboard (/) ← Lista fiszek (/deck/[id])
    ↓                    ↓
    └─────────┬─────────┘
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
Tryb nauki         Tryb treningu
(/deck/[id]/study)  (/deck/[id]/review)
```

---

## Harmonogram implementacji

### Tydzień 1-2: Faza 1 - Podstawowe widoki
1. ✅ Generator fiszek - **GOTOWY**
2. ✅ Logowanie - **GOTOWY**
3. ✅ Rejestracja - **GOTOWY**
4. ✅ Weryfikacja propozycji - **GOTOWY**
5. ⏳ **Ekran ładowania** - **NASTĘPNY** (2-3 kroki)
6. ⏳ **Dashboard** - **WYSOKI PRIORYTET** (4-5 kroków)

### Tydzień 3-4: Faza 2 - Widoki zarządzania
7. ⏳ **Lista fiszek** - **ŚREDNI PRIORYTET** (5-6 kroków)

### Tydzień 5-6: Faza 3 - Widoki nauki
8. ⏳ **Tryb nauki** - **ŚREDNI PRIORYTET** (4-5 kroków)
9. ⏳ **Tryb treningu** - **ŚREDNI PRIORYTET** (5-6 kroków)

### Tydzień 7: Faza 4 - Widoki pomocnicze
10. ⏳ **Ustawienia** - **NISKI PRIORYTET** (3-4 kroki)

---

## Szacowany czas implementacji

- **Ekran ładowania:** 2-3 kroki (6-9 kroków łącznie)
- **Dashboard:** 4-5 kroków (12-15 kroków łącznie)
- **Lista fiszek:** 5-6 kroków (15-18 kroków łącznie)
- **Tryb nauki:** 4-5 kroków (12-15 kroków łącznie)
- **Tryb treningu:** 5-6 kroków (15-18 kroków łącznie)
- **Ustawienia:** 3-4 kroki (9-12 kroków łącznie)

**Łącznie:** ~23-27 kroków (69-81 kroków łącznie)

Przy tempie 3 kroki na sesję: **~8-9 sesji implementacji**

---

## Funkcje API do zaimplementowania

### Dla Dashboard
- `fetchDecks()` - ✅ już zaimplementowana w `proposals.ts`
- `deleteDeck(deckId)` - do utworzenia
- `updateDeck(deckId, updates)` - do utworzenia

### Dla Lista fiszek
- `fetchFlashcards(deckId, filters)` - do utworzenia
- `createFlashcard(deckId, flashcard)` - do utworzenia
- `updateFlashcard(flashcardId, updates)` - do utworzenia
- `deleteFlashcard(flashcardId)` - do utworzenia

### Dla Tryb treningu
- `fetchFlashcardsForReview(deckId)` - do utworzenia
- `submitQuizAnswer(flashcardId, isCorrect)` - do utworzenia
- `processQuizSession(answers)` - do utworzenia

### Dla Ustawienia
- `updatePassword(oldPassword, newPassword)` - do utworzenia
- `updateUserPreferences(preferences)` - do utworzenia
- `deleteAccount()` - do utworzenia

---

## Współdzielone komponenty do utworzenia

### Komponenty nawigacji
- `Topbar.tsx` - nawigacja górna (używana w Dashboard i innych widokach)
- `Breadcrumb.tsx` - breadcrumb nawigacja (używana w widokach talii)

### Komponenty UI
- `Progress.tsx` - pasek postępu (Shadcn/ui) - może być już dostępny
- `Skeleton.tsx` - skeleton loader (Shadcn/ui) - może być już dostępny
- `DropdownMenu.tsx` - menu dropdown (Shadcn/ui) - może być już dostępny

### Komponenty pomocnicze
- `EmptyState.tsx` - pusty stan (używany w wielu widokach)
- `ErrorBoundary.tsx` - obsługa błędów React (opcjonalnie)

---

### Kluczowe widoki i ekrany

**Uwaga**: Na początku skupiamy się na core'owych ekranach wymienionych poniżej. Funkcjonalności dodatkowe (np. panel administracyjny z logami generacji i błędów) będą dodane na późniejszym etapie.

**Priorytety i zależności:**

#### 1. Ekran autoryzacji (`/login`, `/register`) - ✅ Gotowy

#### 1. Ekran autoryzacji (`/login`, `/register`)
- **Layout**: Formularze logowania i rejestracji
- **Elementy**: Pola email, hasło, potwierdzenie hasła (rejestracja)
- **Integracja**: Supabase Auth API
- **Przekierowania**: Po zalogowaniu → dashboard, po rejestracji → onboarding → dashboard

#### 2. Dashboard (`/`) - 🔴 Wysoki priorytet
- **Priorytet:** Wysoki - główny punkt wejścia użytkownika
- **Zależności:** ✅ Logowanie (już zaimplementowane), ⏳ Lista fiszek (wymagana dla nawigacji)
- **Szacowany czas:** 4-5 kroków (12-15 kroków łącznie)
- **Komponenty do utworzenia:**
  - `DashboardView.tsx` - główny komponent
  - `DeckCard.tsx` - karta talii
  - `Topbar.tsx` - nawigacja górna (może być współdzielony)
  - `SearchBar.tsx` - wyszukiwarka talii
- **Layout**: Siatka kart talii (grid layout)
- **Elementy**: Nazwa talii, liczba fiszek do powtórki (wyróżniona), całkowita liczba fiszek, przyciski akcji
- **Akcje**: "Rozpocznij powtórkę", "Tryb nauki", menu kontekstowe (edytuj, usuń)
- **Empty State**: Ekran powitalny z CTA do utworzenia pierwszej talii lub wygenerowania fiszek
- **Górny pasek**: Przyciski "Nowa talia", "Generuj fiszki", wyszukiwarka talii

#### 3. Generator fiszek (`/generate`) - ✅ Gotowy
- **Layout**: Formularz z sekcjami accordion
- **Sekcja podstawowa**: Duże textarea dla tekstu źródłowego (min 100 znaków)
- **Sekcja zaawansowana** (collapsible, domyślnie zwinięta):
  - Dropdown wyboru języka (domyślnie "auto") - format: "Nazwa języka (kod ISO)" np. "Polski (pl)", "English (en)"
  - Pole domeny wiedzy (opcjonalne, max 100 znaków)
  - Pola numeryczne: min/max długość pytań (50-10000), max długość odpowiedzi (500)
  - Pole preferencji użytkownika (opcjonalne, max 1500 znaków) - język naturalny dla dodatkowego kontekstu AI
- **Walidacja**: Po stronie klienta przed wysłaniem, błędy inline
  - Długość tekstu źródłowego: min 100 znaków
  - Zakresy długości pytań: 50-10000 znaków
  - Maksymalna długość odpowiedzi: max 500 znaków
  - Język: z listy dozwolonych kodów ISO 639-1
- **Akcja**: Przycisk "Generuj" na dole formularza
- **Request Body**:
  ```typescript
  {
    source_text: string;              // wymagane, min 100 znaków
    domain?: string;                  // opcjonalne, max 100 znaków
    language?: string;                // "auto" | "pl" | "en" | "de" | "fr" | "es" | "it" | "ru" | "zh" | "ja" | "pt" | ...
    question_min_length?: number;     // domyślnie 50
    question_max_length?: number;     // domyślnie 10000
    answer_max_length?: number;       // domyślnie 500
    user_preferences?: string;        // opcjonalne, max 1500 znaków, język naturalny
  }
  ```

#### 4. Ekran ładowania (`/loading/[session_id]`) - 🔴 Wysoki priorytet - **NASTĘPNY**
- **Priorytet:** Wysoki - wymagany do kompletnego przepływu generowania
- **Zależności:** ✅ Generator fiszek (już zaimplementowany), ✅ Weryfikacja propozycji (już zaimplementowana)
- **Szacowany czas:** 2-3 kroki (6-9 kroków łącznie)
- **Funkcjonalności:**
  - Wyświetlanie postępu generowania
  - Polling statusu generowania z API
  - Animacja ładowania
  - Przycisk anulowania
  - Automatyczne przekierowanie na `/verify/[session_id]` po zakończeniu
- **Elementy**: Progress bar z szacowanym czasem, spinner, komunikat o statusie
- **Mechanizm**: Polling co 2-3 sekundy do sprawdzania statusu generowania
- **Nawigacja**: Możliwość anulowania i powrotu do generatora

#### 5. Weryfikacja propozycji (`/verify/[session_id]`) - ✅ Gotowy
- **Layout**: Lista propozycji fiszek (z możliwością wyboru paginacji lub infinite scroll przez użytkownika)
- **Elementy karty**: Pytanie, odpowiedź, domena, checkbox "Akceptuj" (domyślnie zaznaczony), przyciski "Odrzuć", "Regeneruj dystraktory", "Edytuj"
- **Górny pasek**: Przyciski "Akceptuj wszystkie", "Odrzuć wszystkie", licznik zaakceptowanych/odrzuconych
- **Dolny pasek**: Dropdown wyboru talii (istniejące + opcja utworzenia nowej), przyciski "Zapisz wszystkie" lub "Zapisz zatwierdzone"
- **Przepływ**: Użytkownik przegląda propozycje, może akceptować/edytować/odrzucać pojedynczo, następnie zapisuje wybrane opcjami bulk
- **Integracja API**: Endpointy `accept-proposal`, `accept-proposals`, `accept-proposals-by-session`, `reject-proposal`

#### 6. Lista fiszek (`/deck/[id]`) - 🟡 Średni priorytet
- **Priorytet:** Średni - kluczowy widok zarządzania fiszkami
- **Zależności:** ✅ Dashboard (wymagany dla nawigacji), ⏳ Tryb nauki (opcjonalnie, dla przycisku "Tryb nauki"), ⏳ Tryb treningu (opcjonalnie, dla przycisku "Rozpocznij powtórkę")
- **Szacowany czas:** 5-6 kroków (15-18 kroków łącznie)
- **Komponenty do utworzenia:**
  - `DeckView.tsx` - główny komponent
  - `FlashcardCard.tsx` - karta fiszki
  - `FlashcardModal.tsx` - modal edycji/dodawania fiszki
  - `DeckHeader.tsx` - nagłówek z akcjami
  - `FlashcardFilters.tsx` - filtry statusu
- **Layout**: Lista fiszek w talii z możliwością filtrowania
- **Elementy**: Informacje o talii, lista fiszek, przyciski akcji
- **Akcje**: "Rozpocznij powtórkę", "Tryb nauki", edycja/usuwanie talii
- **Funkcjonalności:**
  - Lista wszystkich fiszek w talii
  - Filtrowanie po statusie (wszystkie/learning/mastered)
  - Karty fiszek z pytaniem, odpowiedzią, statusem
  - Edycja i usuwanie fiszek
  - Edycja nazwy talii
  - Usuwanie talii
  - Breadcrumb nawigacja
  - Paginacja lub infinite scroll
- **Edycja**: Modal edycji fiszki (pytanie, odpowiedź, obrazek)
  - **Walidacja**: Walidacja zawartości fiszki na poziomie frontendu
  - **Zapis**: Zapis po potwierdzeniu zmian przyciskiem - **bez zapisu "real time"** (bez automatycznego zapisywania podczas edycji)
- **Usuwanie**: Przycisk usuwania przy każdej fiszce z potwierdzeniem

#### 7. Tryb treningu / Sesja powtórkowa (`/deck/[id]/review`) - 🟡 Średni priorytet
- **Priorytet:** Średni - sesja powtórkowa z testem
- **Zależności:** ✅ Lista fiszek (wymagana dla nawigacji), ⏳ API dla spaced repetition (wymagane)
- **Szacowany czas:** 5-6 kroków (15-18 kroków łącznie)
- **Komponenty do utworzenia:**
  - `TrainingSession.tsx` - główny komponent
  - `QuestionCard.tsx` - karta z pytaniem
  - `AnswerButtons.tsx` - przyciski odpowiedzi
  - `FeedbackSection.tsx` - sekcja informacji zwrotnej
  - `SummaryScreen.tsx` - ekran podsumowania
- **Layout**: Pełnoekranowy widok z jedną fiszką na raz
- **Elementy góra**: Pasek postępu (X/Y fiszek)
- **Elementy środek**: Pytanie (duży, czytelny tekst)
- **Elementy dół**: 4 przyciski odpowiedzi (losowo ułożone, równy rozmiar)
- **Funkcjonalności:**
  - Wyświetlanie fiszek w formacie testu wielokrotnego wyboru
  - 4 opcje odpowiedzi (1 poprawna + 3 dystraktory)
  - Losowe ułożenie odpowiedzi
  - Natychmiastowa informacja zwrotna po wyborze
  - Automatyczne przejście do następnej fiszki
  - Integracja z algorytmem spaced repetition
  - Aktualizacja statusu fiszek (learning/mastered)
- **Interakcja**: Natychmiastowa informacja zwrotna (zielony/czerwony, ikona ✓/✗), opóźnienie 1-2s, automatyczne przejście
- **Zakończenie**: Ekran podsumowania z wynikiem, lista błędnych odpowiedzi, przycisk "Zakończ"
- **Integracja API**: Endpoint `update-flashcard-progress` lub `process-quiz-session`

#### 8. Tryb nauki (`/deck/[id]/study`) - 🟡 Średni priorytet
- **Priorytet:** Średni - swobodne przeglądanie fiszek
- **Zależności:** ✅ Lista fiszek (wymagana dla nawigacji)
- **Szacowany czas:** 4-5 kroków (12-15 kroków łącznie)
- **Komponenty do utworzenia:**
  - `StudyMode.tsx` - główny komponent
  - `FlashcardFlip.tsx` - karta z animacją flip
  - `StudySidebar.tsx` - sidebar z listą fiszek
  - `StudyControls.tsx` - kontrolki nawigacji
- **Layout**: Karta fiszki z możliwością odwrócenia
- **Interakcja**: Kliknięcie lub przycisk "Pokaż odpowiedź" odsłania odpowiedź (animacja flip)
- **Nawigacja**: Przyciski "Poprzednia"/"Następna", gesty swipe (mobile), sidebar z listą wszystkich fiszek
- **Funkcjonalności:**
  - Wyświetlanie fiszek w formie odwracalnych kart
  - Animacja flip karty (CSS 3D transform)
  - Nawigacja między fiszkami (przyciski, klawiatura, gesty swipe)
  - Sidebar z listą wszystkich fiszek (opcjonalnie ukrywalny)
  - Filtrowanie po statusie
  - Pełnoekranowy tryb (opcjonalnie)
- **Elementy**: Wskaźnik pozycji (np. "5/20"), filtrowanie po statusie (wszystkie/learning/mastered)

#### 9. Panel użytkownika / Ustawienia (`/settings`) - 🟢 Niski priorytet
- **Priorytet:** Niski - można zaimplementować na końcu
- **Zależności:** ✅ Logowanie (wymagane dla autoryzacji)
- **Szacowany czas:** 3-4 kroki (9-12 kroków łącznie)
- **Komponenty do utworzenia:**
  - `SettingsView.tsx` - główny komponent
  - `PasswordChangeForm.tsx` - formularz zmiany hasła
  - `UserPreferencesForm.tsx` - formularz preferencji
  - `AppSettingsForm.tsx` - formularz ustawień aplikacji
  - `AccountManagement.tsx` - sekcja zarządzania kontem
- **Layout**: Formularz ustawień konta
- **Elementy**: 
  - Zmiana hasła (wymaga starego hasła, nowego hasła i potwierdzenia)
  - Usunięcie konta (wymaga potwierdzenia w dialogu)
  - Preferencje użytkownika: pole tekstowe (max 1500 znaków) do wpisania wymagań w języku naturalnym
  - Przełącznik dark mode (jeśli dostępny w topbarze, tutaj jako backup)
  - Przełącznik paginacja/infinite scroll dla widoku weryfikacji
- **Funkcjonalności:**
  - Zmiana hasła (stare hasło, nowe hasło, potwierdzenie)
  - Preferencje użytkownika (textarea dla AI)
  - Ustawienia aplikacji (dark mode toggle, paginacja/infinite scroll)
  - Zarządzanie kontem (usunięcie konta z potwierdzeniem)
  - Sekcje tematyczne z Accordion
- **Przechowywanie preferencji**: W tabeli `profiles` lub osobnej tabeli `user_preferences` w bazie danych
- **Użycie preferencji**: Przekazywane do AI podczas generowania fiszek jako dodatkowy kontekst w prompcie


### Przepływy użytkownika

#### Przepływ generowania fiszek
1. Dashboard → Kliknięcie "Generuj fiszki"
2. Generator (widok AI) → Wklejenie tekstu + konfiguracja (opcjonalnie) → Kliknięcie "Generuj"
3. Ekran ładowania → Progress indicator podczas generowania (10-30 sekundy, polling co 2-3 sekundy)
4. Weryfikacja → Przeglądanie propozycji z listy, akceptacja/edycja/odrzucenie pojedynczo
5. Wybór talii → Dropdown z istniejącymi + opcja utworzenia nowej
6. Zapisywanie → Opcje "Zapisz wszystkie" lub "Zapisz zatwierdzone"
7. Dashboard → Komunikat sukcesu, przekierowanie do talii

#### Przepływ nauki (tryb treningu)
1. Dashboard → Wybór talii → Kliknięcie "Rozpocznij powtórkę"
2. Tryb treningu → Wyświetlanie fiszek do powtórki (losowo)
3. Odpowiedź → Natychmiastowa informacja zwrotna → Automatyczne przejście
4. Podsumowanie → Wynik, lista błędnych odpowiedzi → Powrót do talii

#### Przepływ nauki (tryb swobodny)
1. Dashboard → Wybór talii → Kliknięcie "Tryb nauki"
2. Tryb nauki → Przeglądanie wszystkich fiszek, odwracanie kart
3. Nawigacja → Przechodzenie między fiszkami (przyciski, gesty, sidebar)

### Strategia integracji z API i zarządzania stanem

#### Zarządzanie stanem
- **Początkowo**: React hooks (useState, useEffect) i React Context dla lokalnego stanu komponentów
- **Później (jeśli potrzeba)**: Zustand dla bardziej zaawansowanego zarządzania stanem globalnym
- **API State**: React Query (TanStack Query) dla cache'owania i synchronizacji z API
- **Struktura**: 
  - Queries dla danych (talie, fiszki, propozycje)
  - Mutations dla operacji (akceptacja, odrzucenie, aktualizacja postępu)
  - Optimistic updates dla natychmiastowej odpowiedzi UI

#### Komunikacja z API
- **REST API**: Supabase REST endpoints dla CRUD operacji (`/rest/v1/decks`, `/rest/v1/flashcards`, `/rest/v1/flashcard_proposals`)
- **Edge Functions**: Custom endpoints dla logiki biznesowej (`/functions/v1/generate-flashcards`, `/functions/v1/accept-proposal`, `/functions/v1/update-flashcard-progress`)
- **Astro Proxy**: `/api/generations` jako proxy do Edge Function `generate-flashcards`

#### Obsługa długotrwałych operacji
- **Generowanie fiszek**: Polling co 2-3 sekundy do sprawdzania statusu, progress bar z szacowanym czasem
- **Alternatywa**: WebSocket dla real-time updates (opcjonalnie)

#### Obsługa błędów
- **Error Boundaries**: React Error Boundaries dla obsługi błędów na poziomie komponentów
- **Loading States**: Skeleton loaders dla list, spinners dla przycisków
- **Error Messages**: 
  - **Krytyczne błędy**: Wyświetlanie **inline** (bezpośrednio pod odpowiednimi polami formularzy) - błędy walidacji, błędy wymagające natychmiastowej uwagi
  - **Mniej istotne błędy i komunikaty sukcesu**: Wyświetlanie w formie **toastów** (toast notifications) - mniej krytyczne błędy API, komunikaty sukcesu operacji

### Responsywność i dostępność

#### Responsywność
- **Desktop-first**: Aplikacja zaprojektowana z myślą o desktop (zgodnie z PRD)
- **Mobile**: Adaptacja layoutu - sidebar → bottom navigation, grid → lista
- **Breakpoints**: Tailwind CSS responsive variants (sm, md, lg, xl)

#### Dostępność
- **Standard**: **Wymogi dostępności na poziomie WCAG AA** - wszystkie komponenty i funkcjonalności muszą spełniać standard WCAG 2.1 Level AA
- **ARIA**: Właściwe użycie ARIA landmarks, roles, labels (zgodnie z rules/frontend.mdc)
- **Keyboard Navigation**: Pełna obsługa nawigacji klawiaturą
- **Screen Readers**: Semantyczny HTML, aria-labels dla interaktywnych elementów
- **Focus Management**: Widoczne focus states, logical tab order
- **Kontrast**: Właściwe kontrasty kolorów zgodne z WCAG AA (min. 4.5:1 dla tekstu)

### Bezpieczeństwo

#### Autoryzacja na poziomie UI
- **Middleware**: Astro middleware sprawdzający sesję przed renderowaniem chronionych stron
- **Przekierowania**: Nieautoryzowani użytkownicy → `/login?redirect=/target-path`
- **Client-side**: Supabase client sprawdzający stan autoryzacji w komponentach React
- **Chronione trasy**: `/`, `/generate`, `/deck/*`, `/settings`
- **Publiczne trasy**: `/login`, `/register`

#### Integracja z API
- **Tokeny**: JWT tokens z Supabase Auth w nagłówku `Authorization: Bearer {token}`
- **RLS**: Row Level Security w Supabase zapewnia izolację danych na poziomie bazy
- **Walidacja**: Walidacja po stronie klienta i serwera

### Komponenty UI i wzorce

#### Biblioteka komponentów
- **Shadcn/ui**: **Głównie gotowe komponenty z Shadcn/ui** - wykorzystanie gotowych, modyfikowalnych komponentów (Button, Card, Input, Select, Dialog, Sidebar, NavigationMenu, Breadcrumb)
- **Navigation Menu**: **Navigation Menu od Shadcn/ui w formie topbara** - główna nawigacja aplikacji jako topbar z użyciem komponentu NavigationMenu
- **Tailwind CSS**: Utility-first styling dla customizacji, użycie wariantów utility (`sm:`, `md:`, `lg:`, etc.) dla responsywności

#### Wzorce interakcji
- **Optimistic Updates**: Natychmiastowa aktualizacja UI z rollback w przypadku błędu
- **Skeleton Loading**: Placeholder podczas ładowania danych
- **Toast Notifications**: Komunikaty sukcesu/błędu (mniej istotne błędy i komunikaty sukcesu)
- **Modal Dialogs**: Potwierdzenia dla destrukcyjnych akcji (usuwanie talii, fiszek)
- **Podejście**: Na razie trzymamy się **prostej implementacji** - unikanie nadmiernej złożoności, skupienie na core'owych funkcjonalnościach

#### Funkcjonalności na późniejszy etap
- **Panel administracyjny**: Logi generacji i błędów będą dodane do panelu administracyjnego na późniejszym etapie rozwoju. Na początku skupiamy się na core'owych ekranach wymienionych powyżej.

### Struktura komponentów i organizacja kodu

#### Organizacja folderów
```
src/
├── components/          # Komponenty React (interaktywne)
│   ├── ui/             # Komponenty Shadcn/ui (Button, Card, Input, etc.)
│   ├── forms/          # Komponenty formularzy (GeneratorForm, LoginForm, etc.)
│   ├── flashcard/      # Komponenty fiszek (FlashcardCard, FlashcardModal, etc.)
│   └── layout/         # Komponenty layoutu (Topbar, NavigationMenu, etc.)
├── pages/              # Strony Astro
│   ├── api/            # Astro API endpoints (proxy do Supabase)
│   ├── index.astro      # Dashboard
│   ├── generate.astro  # Generator fiszek
│   ├── deck/
│   │   └── [id]/
│   │       ├── index.astro      # Lista fiszek
│   │       ├── review.astro     # Tryb treningu
│   │       └── study.astro      # Tryb nauki
│   ├── verify/
│   │   └── [session_id].astro   # Weryfikacja propozycji
│   ├── login.astro     # Logowanie
│   ├── register.astro  # Rejestracja
│   └── settings.astro  # Ustawienia
├── lib/                # Helpery i utilities
│   ├── supabase.ts     # Supabase client helpers
│   ├── api.ts          # API client helpers
│   └── validation.ts   # Funkcje walidacji
├── hooks/              # React hooks (jeśli potrzeba)
├── types/              # TypeScript types
│   └── database.types.ts
└── styles/             # Globalne style
    └── global.css
```

#### Komponenty React - kluczowe komponenty
- **GeneratorForm**: Formularz generowania fiszek z sekcjami accordion
- **FlashcardProposalCard**: Karta propozycji fiszki w widoku weryfikacji
- **FlashcardList**: Lista fiszek w talii
- **FlashcardModal**: Modal edycji fiszki
- **TrainingSession**: Komponent trybu treningu (spaced repetition)
- **StudyMode**: Komponent trybu nauki (odwracalne karty)
- **DeckCard**: Karta talii na dashboardzie
- **Topbar**: Navigation Menu w formie topbara
- **OnboardingTooltip**: Tooltip dla onboardingu

### Integracja z API - szczegóły techniczne

#### Struktura requestów do Edge Functions
- **Endpoint**: `/api/generations` (Astro proxy) → `/functions/v1/generate-flashcards` (Supabase Edge Function)
- **Headers**: 
  ```typescript
  {
    "Authorization": "Bearer {access_token}",
    "Content-Type": "application/json"
  }
  ```
- **Response**: 
  ```typescript
  {
    generation_session_id: string;
    proposals: Array<{
      id: number;
      question: string;
      correct_answer: string;
      domain: string | null;
      status: "pending";
    }>;
    detected_domain: string;
    total_generated: number;
  }
  ```

#### Struktura requestów do REST API
- **Base URL**: `{SUPABASE_URL}/rest/v1`
- **Headers**:
  ```typescript
  {
    "Authorization": "Bearer {access_token}",
    "apikey": "{anon_key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"  // dla operacji create/update
  }
  ```
- **Query Parameters**: Supabase PostgREST syntax (`eq.`, `gte.`, `lte.`, `select`, `order`, `limit`, `offset`)

#### Obsługa błędów API
- **400 Bad Request**: Błędy walidacji - wyświetlanie inline pod odpowiednimi polami
- **401 Unauthorized**: Przekierowanie na `/login` z parametrem `redirect`
- **404 Not Found**: Toast notification z komunikatem błędu
- **500 Internal Server Error**: Toast notification z komunikatem błędu, logowanie do konsoli (dev mode)

### Walidacja formularzy

#### Generator fiszek
- **source_text**: 
  - Wymagane
  - Min długość: 100 znaków
  - Błąd inline: "Tekst musi zawierać co najmniej 100 znaków"
- **question_min_length**: 
  - Opcjonalne, domyślnie 50
  - Zakres: 50-10000
  - Błąd inline: "Minimalna długość pytań musi być między 50 a 10000 znaków"
- **question_max_length**: 
  - Opcjonalne, domyślnie 10000
  - Zakres: 50-10000, musi być >= question_min_length
  - Błąd inline: "Maksymalna długość pytań musi być między 50 a 10000 znaków i większa lub równa minimalnej długości"
- **answer_max_length**: 
  - Opcjonalne, domyślnie 500
  - Zakres: 1-500
  - Błąd inline: "Maksymalna długość odpowiedzi musi być między 1 a 500 znaków"
- **language**: 
  - Opcjonalne, domyślnie "auto"
  - Dozwolone wartości: "auto" | kod ISO 639-1
  - Błąd inline: "Nieprawidłowy kod języka"
- **domain**: 
  - Opcjonalne
  - Max długość: 100 znaków
  - Błąd inline: "Domena wiedzy nie może przekraczać 100 znaków"
- **user_preferences**: 
  - Opcjonalne
  - Max długość: 1500 znaków
  - Błąd inline: "Preferencje nie mogą przekraczać 1500 znaków"

#### Modal edycji fiszki
- **question**: 
  - Wymagane
  - Zakres: 50-10000 znaków
  - Błąd inline: "Pytanie musi zawierać między 50 a 10000 znaków"
- **correct_answer**: 
  - Wymagane
  - Max długość: 500 znaków
  - Błąd inline: "Odpowiedź nie może przekraczać 500 znaków"
- **image_url**: 
  - Opcjonalne
  - Format: Valid URL
  - Błąd inline: "Nieprawidłowy format URL"

### Manualne tworzenie fiszek

#### Lokalizacja
- **Dostęp**: Z dashboardu (przycisk "Nowa fiszka") lub z widoku talii (przycisk "Dodaj fiszkę")
- **Komponent**: `ManualFlashcardForm`

#### Formularz
- **Pola**:
  - Pytanie (wymagane, 50-10000 znaków)
  - Poprawna odpowiedź (wymagane, max 500 znaków)
  - URL obrazka (opcjonalne, valid URL)
  - Checkbox: "Wygeneruj odpowiedź przez AI" (opcjonalne)
- **Zachowanie**:
  - Jeśli checkbox "Wygeneruj odpowiedź przez AI" jest zaznaczony:
    - Po wprowadzeniu pytania/słowa i kliknięciu "Generuj odpowiedź", AI generuje odpowiedź
    - Wygenerowana odpowiedź jest wstawiana do pola "Poprawna odpowiedź"
    - Użytkownik może edytować wygenerowaną odpowiedź
  - Jeśli checkbox nie jest zaznaczony:
    - Użytkownik ręcznie wprowadza odpowiedź
- **Zapis**: 
  - Wybór talii (dropdown z istniejącymi + opcja utworzenia nowej)
  - Przycisk "Zapisz" - zapisuje fiszkę do wybranej talii
  - Po zapisaniu: przekierowanie do widoku talii z komunikatem sukcesu (toast)

### Roadmapa implementacji UI

#### Faza 1: Podstawowa infrastruktura - ✅ Zakończona
1. ✅ Konfiguracja Astro + React + Tailwind + Shadcn/ui
2. ✅ Struktura folderów i podstawowe komponenty layoutu
3. ✅ Topbar z Navigation Menu (Shadcn/ui)
4. ✅ Middleware autoryzacji w Astro
5. ✅ Podstawowe strony: `/login`, `/register`, `/` (dashboard placeholder)

#### Faza 2: Autoryzacja i generator - ✅ Zakończona
1. ✅ Ekrany logowania i rejestracji
2. ✅ Integracja z Supabase Auth
3. ✅ Generator fiszek (`/generate`) z formularzem accordion
4. ✅ Integracja z `/api/generations` (polling dla statusu)
5. ✅ Widok weryfikacji (`/verify/[session_id]`) z listą propozycji
6. ✅ Funkcjonalności akceptacji/odrzucenia (pojedynczo i bulk)
7. ✅ Wybór talii i zapisywanie

#### Faza 3: Ekran ładowania i dashboard - ✅ Zakończona
1. ✅ Ekran ładowania z progress bar
2. ✅ Dashboard z listą talii (grid layout)
3. ✅ Empty state dla dashboardu
4. ✅ Wyszukiwarka talii

#### Faza 4: Zarządzanie fiszkami - ✅ Zakończona
1. ✅ Lista fiszek w talii (`/deck/[id]`)
2. ✅ Modal edycji fiszki z walidacją
3. ✅ Usuwanie fiszek z potwierdzeniem
4. ✅ Manualne tworzenie fiszek

#### Faza 5: Tryby nauki - ✅ Zakończona
1. ✅ Tryb treningu (`/deck/[id]/review`) - spaced repetition
2. ✅ Integracja z endpointem `update-flashcard-progress`
3. ✅ Ekran podsumowania sesji
4. ✅ Tryb nauki (`/deck/[id]/study`) - odwracalne karty
5. ✅ Nawigacja między fiszkami (klawiatura, gesty swipe)
6. ✅ Animacja flip karty

#### Faza 6: Ustawienia i preferencje - ✅ Zakończona
1. ✅ Panel użytkownika (`/settings`)
2. ✅ Zmiana hasła
3. ✅ Preferencje użytkownika (pole tekstowe, max 1500 znaków)
4. ✅ Przełącznik dark mode
5. ✅ Przełącznik paginacja/infinite scroll
6. ✅ Usuwanie konta z potwierdzeniem

#### Faza 7: Onboarding i finalizacja - ⏳ Do zrobienia
1. ⏳ System onboardingu z tooltips
2. ⏳ Dialog wyboru "Nie pokazuj więcej"
3. ⏳ Testy dostępności (WCAG AA)
4. ⏳ Optymalizacja wydajności
5. ⏳ Finalne testy end-to-end

### Rozwiązane kwestie i doprecyzowania

1. **Onboarding**: 
   - **Definicja**: Onboarding to proces wprowadzenia nowego użytkownika do aplikacji - krótki przewodnik pokazujący główne funkcje i jak z nich korzystać.
   - **Implementacja**: Tooltips w postaci chmurek przy przyciskach, które pojawiają się przy pierwszym uruchomieniu aplikacji.
   - **Kontrola użytkownika**: **Przed** wyświetleniem chmurek użytkownik widzi okienko wyboru z opcją "Nie pokazuj więcej" - może zdecydować, czy chce zobaczyć przewodnik, czy pominąć go i zaznaczyć, żeby nie pokazywać go ponownie.
   - **Mechanizm**: Jeśli użytkownik nie zaznaczy "Nie pokazuj więcej", tooltips pojawiają się sekwencyjnie przy kluczowych elementach interfejsu (przyciski, menu, formularze).

2. **Regeneracja dystraktorów**: 
   - **Zakres**: Dotyczy **tylko propozycji fiszek** czekających na akceptację (nie zaakceptowanych fiszek).
   - **Funkcjonalność**: Jeśli użytkownikowi nie podoba się treść propozycji, może wygenerować nową wersję od zera.
   - **Implementacja**: Przycisk "Regeneruj" na karcie propozycji w widoku weryfikacji.

3. **Manualne tworzenie fiszek**: 
   - **Funkcjonalność**: Użytkownik może ręcznie wprowadzić pytanie (lub np. jedno słowo w języku obcym, gdzie odpowiedź to tłumaczenie).
   - **Opcja AI**: Zaznaczalna opcja "Wygeneruj odpowiedź przez AI" - jeśli zaznaczona, AI wygeneruje odpowiedź na podstawie wprowadzonego pytania/słowa.
   - **Dostępność**: Funkcjonalność dostępna podczas manualnego tworzenia fiszki, nie w widoku weryfikacji.

4. **Widok "Opanowane"**: 
   - **Implementacja**: Fiszki opanowane są widoczne jako **osobna talia fiszek** (nie osobna trasa).
   - **Layout**: Takie same jak zwykła talia, ale z filtrem `status='mastered'`.
   - **Lokalizacja**: Można wyświetlić w dashboardzie jako specjalna talia lub w widoku talii jako zakładka/filtr.

5. **Preferencje użytkownika**: 
   - **Implementacja w MVP**: Tak, będzie dostępne.
   - **Format**: Opcje w języku naturalnym - użytkownik może wpisać swoje wymagania (max 1500 znaków).
   - **Przechowywanie**: W profilu użytkownika lub osobnej tabeli preferencji.
   - **Użycie**: Preferencje są przekazywane do AI podczas generowania fiszek jako dodatkowy kontekst w prompcie.

6. **WebSocket vs Polling**: 
   - **Wyjaśnienie**: 
     - **Polling**: Aplikacja regularnie (co 2-3 sekundy) sprawdza status generowania przez wysłanie zapytania HTTP do serwera ("Czy gotowe?").
     - **WebSocket**: Dwukierunkowe połączenie na żywo między klientem a serwerem - serwer automatycznie wysyła aktualizacje statusu bez potrzeby ciągłego sprawdzania.
   - **Decyzja**: Dla MVP użyć prostszego **polling** (co 2-3 sekundy), WebSocket można dodać w późniejszej fazie dla lepszej wydajności.

7. **Paginacja vs Infinite Scroll**: 
   - **Wyjaśnienie**:
     - **Paginacja**: Lista podzielona na strony z przyciskami "Następna"/"Poprzednia" i numerami stron (np. Strona 1, 2, 3...).
     - **Infinite Scroll**: Lista ładuje się automatycznie podczas przewijania w dół - nowe elementy pojawiają się bez klikania przycisków.
   - **Decyzja**: **Do wyboru przez użytkownika** - przełącznik w ustawieniach lub w widoku weryfikacji pozwalający wybrać preferowany sposób wyświetlania listy (paginacja lub infinite scroll).
   - **Domyślnie**: Paginacja (łatwiejsza nawigacja, mniejsze obciążenie przeglądarki).

8. **Dark Mode**: 
   - **Implementacja w MVP**: **Tak**, dark mode będzie dostępny w MVP.
   - **Mechanizm**: Użycie Tailwind CSS `dark:` variant dla stylów w trybie ciemnym.
   - **Przełącznik**: Przycisk/przełącznik w ustawieniach lub w nawigacji (topbar) do zmiany trybu jasny/ciemny.

---

## Uwagi do implementacji

### Wspólne wzorce
1. **Autoryzacja:** Wszystkie widoki wymagają sprawdzenia sesji przed renderowaniem
2. **Loading states:** Wszystkie widoki powinny mieć loading states podczas pobierania danych
3. **Error handling:** Wszystkie widoki powinny obsługiwać błędy sieci, timeout, offline
4. **Dostępność:** Wszystkie widoki powinny być zgodne z WCAG AA
5. **Responsywność:** Wszystkie widoki powinny być responsywne (mobile-first)

### Optymalizacje
1. **React.memo:** Używać dla komponentów list (karty talii, karty fiszek)
2. **useMemo/useCallback:** Memoizować obliczone wartości i handlery
3. **Lazy loading:** Obrazki powinny mieć `loading="lazy"`
4. **Code splitting:** Rozważyć lazy loading dla dużych komponentów

### Testowanie
1. Każdy widok powinien mieć plan testów (TEST_[VIEW_NAME].md)
2. Testy strukturalne (code review)
3. Testy funkcjonalne (manualne)
4. Testy dostępności (screen reader, keyboard navigation)

---

## Status implementacji - **WSZYSTKIE WIDOKI ZAIMPLEMENTOWANE** ✅

Wszystkie 10 głównych widoków aplikacji zostały zaimplementowane i są gotowe do użycia.

### Następne kroki (opcjonalne ulepszenia)

1. ⏳ Testy jednostkowe i integracyjne dla komponentów
2. ⏳ Optymalizacja wydajności (lazy loading, code splitting)
3. ⏳ Dodatkowe funkcjonalności (eksport/import talii, statystyki szczegółowe)
4. ⏳ Ulepszenia UX na podstawie feedbacku użytkowników
5. ⏳ Dokumentacja API i komponentów
6. ⏳ Testy E2E (end-to-end)

</unresolved_issues>

</conversation_summary>


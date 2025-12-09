# Architektura UI dla 10xCards

## 1. Przegląd struktury UI

10xCards to aplikacja internetowa zaprojektowana z myślą o desktop (desktop-first), która umożliwia użytkownikom generowanie fiszek edukacyjnych przy użyciu AI oraz naukę z wykorzystaniem metody spaced repetition. Architektura UI opiera się na hybrydowym podejściu: główne widoki jako strony Astro (MPA) dla SEO i wydajności, a interaktywne komponenty jako React SPA wewnątrz stron.

Aplikacja składa się z 9 głównych widoków, które obsługują pełny cykl życia użytkownika: od rejestracji, przez generowanie i weryfikację fiszek, aż po naukę w dwóch trybach (trening i swobodne przeglądanie). Nawigacja oparta jest na topbarze z użyciem Navigation Menu od Shadcn/ui, zapewniając spójne i dostępne doświadczenie użytkownika zgodne ze standardem WCAG AA.

Struktura aplikacji jest zorganizowana wokół trzech głównych przepływów użytkownika:
1. **Przepływ generowania**: Dashboard → Generator → Weryfikacja → Zapis do talii
2. **Przepływ nauki (trening)**: Dashboard → Wybór talii → Tryb treningu → Podsumowanie
3. **Przepływ nauki (swobodny)**: Dashboard → Wybór talii → Tryb nauki → Przeglądanie

## 2. Lista widoków

### Widok 1: Ekran autoryzacji - Logowanie (`/login`)

**Główny cel**: Umożliwienie zalogowanym użytkownikom dostępu do aplikacji.

**Kluczowe informacje do wyświetlenia**:
- Formularz logowania z polami: email, hasło
- Link do strony rejestracji ("Nie masz konta? Zarejestruj się")
- Komunikaty błędów autoryzacji (jeśli wystąpią)

**Kluczowe komponenty widoku**:
- `LoginForm` - formularz logowania (React)
- `Input` (Shadcn/ui) - pola email i hasło
- `Button` (Shadcn/ui) - przycisk "Zaloguj się"
- `Alert` (Shadcn/ui) - wyświetlanie błędów autoryzacji

**UX, dostępność i bezpieczeństwo**:
- **UX**: Prosty, przejrzysty formularz z wyraźnym CTA. Komunikaty błędów wyświetlane inline pod odpowiednimi polami.
- **Dostępność**: Właściwe etykiety formularzy (`<label>`), aria-labels dla pól, obsługa nawigacji klawiaturą (Tab, Enter). Komunikaty błędów powiązane z polami przez `aria-describedby`.
- **Bezpieczeństwo**: Walidacja po stronie klienta (format email, minimalna długość hasła). Integracja z Supabase Auth API. Przekierowanie nieautoryzowanych użytkowników z chronionych tras na `/login?redirect=/target-path`.

**Przypadki brzegowe**:
- Nieprawidłowe dane logowania → komunikat błędu inline: "Nieprawidłowy email lub hasło"
- Brak połączenia z internetem → toast notification: "Brak połączenia z internetem"
- Wygaśnięcie sesji podczas logowania → przekierowanie na `/login` z komunikatem

---

### Widok 2: Ekran autoryzacji - Rejestracja (`/register`)

**Główny cel**: Rejestracja nowych użytkowników w systemie.

**Kluczowe informacje do wyświetlenia**:
- Formularz rejestracji z polami: email, hasło, potwierdzenie hasła
- Link do strony logowania ("Masz już konto? Zaloguj się")
- Komunikaty walidacji (format email, siła hasła, zgodność haseł)

**Kluczowe komponenty widoku**:
- `RegisterForm` - formularz rejestracji (React)
- `Input` (Shadcn/ui) - pola email, hasło, potwierdzenie hasła
- `Button` (Shadcn/ui) - przycisk "Zarejestruj się"
- `Alert` (Shadcn/ui) - komunikaty błędów walidacji

**UX, dostępność i bezpieczeństwo**:
- **UX**: Formularz z wyraźnymi wskaźnikami siły hasła. Walidacja w czasie rzeczywistym (bez blokowania użytkownika). Komunikaty błędów inline pod każdym polem.
- **Dostępność**: Wszystkie pola z etykietami, aria-describedby dla komunikatów błędów, logical tab order. Wskaźnik siły hasła dostępny dla screen readerów.
- **Bezpieczeństwo**: Walidacja formatu email, wymagania dotyczące siły hasła (min. 8 znaków, kombinacja liter, cyfr). Sprawdzenie unikalności email w bazie danych. Integracja z Supabase Auth API.

**Przypadki brzegowe**:
- Email już istnieje → komunikat błędu inline: "Ten email jest już zarejestrowany"
- Hasła nie są zgodne → komunikat błędu inline pod polem potwierdzenia: "Hasła nie są identyczne"
- Słabe hasło → komunikat błędu inline: "Hasło musi zawierać co najmniej 8 znaków, w tym litery i cyfry"

---

### Widok 3: Dashboard (`/`)

**Główny cel**: Główny punkt wejścia użytkownika - przegląd wszystkich talii i szybki dostęp do nauki.

**Kluczowe informacje do wyświetlenia**:
- Lista wszystkich talii użytkownika w formie siatki kart
- Dla każdej talii: nazwa, liczba fiszek do powtórki (wyróżniona), całkowita liczba fiszek
- Przyciski akcji: "Rozpocznij powtórkę", "Tryb nauki", menu kontekstowe (edytuj, usuń)
- Wyszukiwarka talii
- Przyciski główne: "Nowa talia", "Generuj fiszki"
- Empty state (jeśli brak talii): ekran powitalny z CTA

**Kluczowe komponenty widoku**:
- `Topbar` - nawigacja główna (Navigation Menu od Shadcn/ui)
- `DeckCard` - karta talii z informacjami i akcjami
- `SearchBar` - wyszukiwarka talii
- `EmptyState` - ekran powitalny dla nowych użytkowników
- `Skeleton` (Shadcn/ui) - skeleton loaders podczas ładowania talii
- `Button` (Shadcn/ui) - przyciski akcji
- `DropdownMenu` (Shadcn/ui) - menu kontekstowe dla talii

**UX, dostępność i bezpieczeństwo**:
- **UX**: Siatka kart talii (grid layout) z wyraźnym wyróżnieniem liczby fiszek do powtórki (np. badge z liczbą, kolor akcentujący). Przyciski akcji widoczne na hover/focus. Empty state z zachętą do działania. Wyszukiwarka z filtrowaniem w czasie rzeczywistym.
- **Dostępność**: Semantyczny HTML (`<main>`, `<section>`), aria-labels dla przycisków akcji, keyboard navigation dla kart talii (Enter/Space do aktywacji). Wyszukiwarka z aria-label: "Wyszukaj talie". Empty state z nagłówkiem `<h2>`.
- **Bezpieczeństwo**: Wyświetlanie tylko talii należących do zalogowanego użytkownika (RLS w Supabase). Potwierdzenie przed usunięciem talii (modal dialog). Middleware autoryzacji chroni trasę.

**Przypadki brzegowe**:
- Brak talii → empty state z przyciskami "Utwórz pierwszą talię" i "Wygeneruj fiszki"
- Brak fiszek do powtórki w talii → przycisk "Rozpocznij powtórkę" nieaktywny (disabled) z tooltipem: "Brak fiszek do powtórki"
- Puste wyniki wyszukiwania → komunikat: "Nie znaleziono talii pasujących do wyszukiwania"
- Błąd ładowania talii → toast notification z komunikatem błędu i przyciskiem "Spróbuj ponownie"

---

### Widok 4: Generator fiszek (`/generate`)

**Główny cel**: Wprowadzenie tekstu źródłowego i konfiguracja parametrów generowania fiszek przez AI.

**Kluczowe informacje do wyświetlenia**:
- Sekcja podstawowa: duże pole tekstowe (textarea) dla tekstu źródłowego
- Sekcja zaawansowana (collapsible, domyślnie zwinięta):
  - Dropdown wyboru języka (domyślnie "auto")
  - Pole domeny wiedzy (opcjonalne)
  - Pola numeryczne: min/max długość pytań (50-10000), max długość odpowiedzi (500)
  - Pole preferencji użytkownika (opcjonalne, max 1500 znaków) - język naturalny
- Licznik znaków dla tekstu źródłowego
- Przycisk "Generuj" na dole formularza
- Komunikaty walidacji inline pod odpowiednimi polami

**Kluczowe komponenty widoku**:
- `GeneratorForm` - główny formularz generowania (React)
- `Textarea` (Shadcn/ui) - pole tekstu źródłowego
- `Select` (Shadcn/ui) - dropdown wyboru języka
- `Input` (Shadcn/ui) - pola domeny, długości pytań/odpowiedzi, preferencji
- `Accordion` (Shadcn/ui) - sekcja zaawansowana
- `Button` (Shadcn/ui) - przycisk "Generuj"
- `Alert` (Shadcn/ui) - komunikaty błędów walidacji

**UX, dostępność i bezpieczeństwo**:
- **UX**: Duże, wygodne pole tekstowe z licznikiem znaków. Sekcja zaawansowana zwinięta domyślnie, aby nie przytłaczać użytkownika. Tooltips wyjaśniające parametry. Progress indicator podczas generowania. Możliwość anulowania generowania.
- **Dostępność**: Wszystkie pola z etykietami, aria-describedby dla komunikatów błędów i tooltipów. Accordion z właściwymi aria-expanded. Keyboard navigation dla wszystkich elementów formularza. Focus management podczas walidacji.
- **Bezpieczeństwo**: Walidacja po stronie klienta przed wysłaniem (min 100 znaków tekstu, zakresy długości). Walidacja po stronie serwera w Edge Function. Rate limiting dla endpointu generowania (zapobieganie nadużyciom).

**Przypadki brzegowe**:
- Tekst za krótki (< 100 znaków) → komunikat błędu inline: "Tekst musi zawierać co najmniej 100 znaków"
- Nieprawidłowe zakresy długości pytań → komunikat błędu inline: "Maksymalna długość musi być większa lub równa minimalnej"
- Błąd generowania → toast notification z komunikatem błędu i możliwością ponowienia
- Timeout generowania → komunikat: "Generowanie trwa dłużej niż zwykle. Spróbuj ponownie lub skontaktuj się z supportem"

---

### Widok 5: Ekran ładowania (podczas generowania)

**Główny cel**: Informowanie użytkownika o postępie generowania fiszek i umożliwienie anulowania operacji.

**Kluczowe informacje do wyświetlenia**:
- Progress bar z szacowanym czasem (np. "Generowanie... 45%")
- Spinner/loader animacja
- Komunikat o statusie (np. "Analizowanie tekstu...", "Generowanie fiszek...")
- Przycisk "Anuluj" (opcjonalnie)

**Kluczowe komponenty widoku**:
- `LoadingScreen` - ekran ładowania (React)
- `Progress` (Shadcn/ui) - pasek postępu
- `Spinner` (Shadcn/ui) - animacja ładowania
- `Button` (Shadcn/ui) - przycisk "Anuluj"

**UX, dostępność i bezpieczeństwo**:
- **UX**: Wyraźny wskaźnik postępu z szacowanym czasem. Możliwość anulowania długotrwałej operacji. Płynna animacja nie rozpraszająca uwagi.
- **Dostępność**: aria-live region z komunikatem statusu dla screen readerów. Progress bar z aria-valuenow, aria-valuemin, aria-valuemax.
- **Bezpieczeństwo**: Polling co 2-3 sekundy do sprawdzania statusu (nie obciąża serwera). Timeout po określonym czasie (np. 60 sekund) z komunikatem błędu.

**Przypadki brzegowe**:
- Generowanie trwa dłużej niż 30 sekund → komunikat: "Generowanie trwa dłużej niż zwykle. Proszę czekać..."
- Błąd podczas generowania → przekierowanie z powrotem do generatora z komunikatem błędu
- Anulowanie generowania → powrót do generatora z zachowaniem wprowadzonego tekstu (opcjonalnie)

---

### Widok 6: Weryfikacja propozycji (`/verify/[session_id]`)

**Główny cel**: Przeglądanie, akceptowanie, odrzucanie i edytowanie propozycji fiszek wygenerowanych przez AI przed zapisaniem do talii.

**Kluczowe informacje do wyświetlenia**:
- Lista propozycji fiszek (paginacja lub infinite scroll - wybór użytkownika)
- Dla każdej propozycji (karta):
  - Pytanie (pełny tekst)
  - Poprawna odpowiedź
  - Wykryta domena wiedzy (z możliwością zmiany)
  - Checkbox "Akceptuj" (domyślnie zaznaczony)
  - Przyciski: "Odrzuć", "Regeneruj", "Edytuj"
- Górny pasek akcji:
  - Przyciski: "Akceptuj wszystkie", "Odrzuć wszystkie"
  - Licznik: "X zaakceptowanych / Y odrzuconych / Z łącznie"
  - Informacja o wykrytej domenie z przyciskiem "Zmień"
- Dolny pasek:
  - Dropdown wyboru talii (istniejące + opcja "Utwórz nową talię")
  - Pole tekstowe dla nazwy nowej talii (jeśli wybrano "Utwórz nową")
  - Przyciski: "Zapisz wszystkie", "Zapisz zatwierdzone"
- Przełącznik paginacja/infinite scroll (w ustawieniach lub na stronie)

**Kluczowe komponenty widoku**:
- `VerificationView` - główny widok weryfikacji (React)
- `FlashcardProposalCard` - karta propozycji fiszki
- `Checkbox` (Shadcn/ui) - checkbox akceptacji
- `Button` (Shadcn/ui) - przyciski akcji
- `Select` (Shadcn/ui) - dropdown wyboru talii
- `Input` (Shadcn/ui) - pole nazwy nowej talii
- `Pagination` lub `InfiniteScroll` - w zależności od wyboru użytkownika
- `Modal` (Shadcn/ui) - modal edycji propozycji

**UX, dostępność i bezpieczeństwo**:
- **UX**: Układ kart z wyraźnym podziałem wizualnym. Domyślnie wszystkie propozycje zaznaczone jako zaakceptowane (szybka akceptacja całej generacji). Możliwość szybkiej akceptacji wszystkich lub odrzucenia wszystkich. Licznik pokazujący postęp weryfikacji. Optymistic updates - natychmiastowa aktualizacja UI po akceptacji/odrzuceniu.
- **Dostępność**: Każda karta z semantycznym HTML (`<article>`), aria-labels dla przycisków akcji. Checkboxy z właściwymi etykietami. Keyboard navigation między kartami (Tab, Enter/Space). Licznik dostępny dla screen readerów (aria-live region).
- **Bezpieczeństwo**: Wyświetlanie tylko propozycji należących do zalogowanego użytkownika (RLS). Walidacja przed zapisaniem (sprawdzenie, czy talia należy do użytkownika). Potwierdzenie przed odrzuceniem wszystkich propozycji (opcjonalnie).

**Przypadki brzegowe**:
- Brak propozycji do wyświetlenia → komunikat: "Nie znaleziono propozycji dla tej sesji"
- Błąd akceptacji pojedynczej propozycji → rollback optymistic update, toast z komunikatem błędu
- Błąd akceptacji wszystkich → toast z komunikatem błędu, lista propozycji, które nie zostały zaakceptowane
- Edycja propozycji → modal z formularzem edycji, walidacja przed zapisaniem zmian

---

### Widok 7: Lista fiszek w talii (`/deck/[id]`)

**Główny cel**: Przeglądanie wszystkich fiszek w wybranej talii, zarządzanie fiszkami (edycja, usuwanie) oraz dostęp do trybów nauki.

**Kluczowe informacje do wyświetlenia**:
- Informacje o talii: nazwa talii, całkowita liczba fiszek, liczba fiszek do powtórki
- Lista fiszek w talii z możliwością filtrowania (wszystkie/learning/mastered)
- Dla każdej fiszki:
  - Pytanie (skrócony tekst z możliwością rozwinięcia)
  - Status (learning/mastered) - badge
  - Przyciski akcji: "Edytuj", "Usuń"
- Przyciski główne: "Rozpocznij powtórkę", "Tryb nauki", "Dodaj fiszkę", "Edytuj talię", "Usuń talię"
- Filtr statusu: "Wszystkie" / "W trakcie nauki" / "Opanowane"
- Breadcrumbs: Dashboard > [Nazwa talii]

**Kluczowe komponenty widoku**:
- `DeckView` - główny widok talii (React)
- `FlashcardList` - lista fiszek
- `FlashcardCard` - karta fiszki w liście
- `FlashcardModal` - modal edycji fiszki
- `Skeleton` (Shadcn/ui) - skeleton loaders podczas ładowania listy fiszek
- `Button` (Shadcn/ui) - przyciski akcji
- `Select` (Shadcn/ui) - filtr statusu
- `Breadcrumb` (Shadcn/ui) - breadcrumbs nawigacji
- `Dialog` (Shadcn/ui) - potwierdzenie usunięcia

**UX, dostępność i bezpieczeństwo**:
- **UX**: Lista fiszek z wyraźnym podziałem wizualnym. Filtrowanie po statusie dla łatwego przeglądania. Modal edycji z walidacją przed zapisaniem. Potwierdzenie przed usunięciem fiszki/talii. Skeleton loaders podczas ładowania listy.
- **Dostępność**: Semantyczny HTML (`<main>`, `<section>`, `<article>`). Lista fiszek jako `<ul>` z `<li>`. Modal z właściwym focus trap i aria-modal. Breadcrumbs z właściwą strukturą nawigacji. Filtry z aria-labels.
- **Bezpieczeństwo**: Wyświetlanie tylko fiszek z talii należącej do zalogowanego użytkownika (RLS). Walidacja edycji po stronie klienta i serwera. Potwierdzenie przed usunięciem (destrukcyjna akcja).

**Przypadki brzegowe**:
- Brak fiszek w talii → empty state: "Ta talia jest pusta. Dodaj fiszki lub wygeneruj je z tekstu."
- Błąd ładowania fiszek → toast notification z komunikatem błędu i przyciskiem "Spróbuj ponownie"
- Błąd edycji fiszki → rollback zmian w modalu, komunikat błędu inline
- Błąd usunięcia → toast z komunikatem błędu, fiszka pozostaje na liście

---

### Widok 8: Tryb treningu / Sesja powtórkowa (`/deck/[id]/review`)

**Główny cel**: Powtórka fiszek z wykorzystaniem algorytmu spaced repetition - test wielokrotnego wyboru z natychmiastową informacją zwrotną.

**Kluczowe informacje do wyświetlenia**:
- Pasek postępu na górze: "X / Y fiszek" (np. "3 / 10")
- Główne pytanie (duży, czytelny tekst, wyśrodkowany)
- 4 przyciski odpowiedzi (losowo ułożone, równy rozmiar):
  - 1 poprawna odpowiedź
  - 3 błędne odpowiedzi (dystraktory)
- Po wyborze odpowiedzi:
  - Natychmiastowa informacja zwrotna (zielony kolor + ikona ✓ dla poprawnej, czerwony + ✗ dla błędnej)
  - Wyświetlenie poprawnej odpowiedzi (jeśli użytkownik odpowiedział błędnie)
  - Opóźnienie 1-2 sekundy
  - Automatyczne przejście do następnej fiszki
- Na końcu sesji: ekran podsumowania z wynikiem (np. "8/10 poprawnych"), listą błędnych odpowiedzi, przyciskiem "Zakończ"

**Kluczowe komponenty widoku**:
- `TrainingSession` - główny komponent sesji treningowej (React)
- `Progress` (Shadcn/ui) - pasek postępu
- `Button` (Shadcn/ui) - przyciski odpowiedzi
- `SummaryScreen` - ekran podsumowania sesji
- `Card` (Shadcn/ui) - karta z pytaniem

**UX, dostępność i bezpieczeństwo**:
- **UX**: Pełnoekranowy widok skupiający uwagę na fiszce. Duży, czytelny tekst pytania. Przyciski odpowiedzi z wyraźnymi stylami hover/focus. Natychmiastowa, wyraźna informacja zwrotna. Płynne przejścia między fiszkami. Możliwość przerwania sesji (przycisk "Przerwij" w rogu).
- **Dostępność**: Pełna obsługa nawigacji klawiaturą (1-4 dla odpowiedzi, Escape do przerwania). aria-live region dla informacji zwrotnej. Progress bar z aria-valuenow. Przyciski odpowiedzi z aria-labels opisującymi odpowiedź. Focus management - automatyczne ustawienie focus na następnej fiszce.
- **Bezpieczeństwo**: Wyświetlanie tylko fiszek należących do zalogowanego użytkownika. Aktualizacja postępu nauki przez endpoint `update-flashcard-progress` lub `process-quiz-session`. Walidacja odpowiedzi po stronie serwera.

**Przypadki brzegowe**:
- Brak fiszek do powtórki → komunikat: "Brak fiszek do powtórki w tej talii. Wszystkie fiszki są już opanowane lub nie nadszedł jeszcze czas na powtórkę."
- Przerwanie sesji → modal potwierdzenia: "Czy na pewno chcesz przerwać sesję? Postęp nie zostanie zapisany."
- Błąd podczas aktualizacji postępu → toast z komunikatem błędu, możliwość kontynuacji sesji (postęp zapisany lokalnie, retry przy następnej odpowiedzi)
- Wszystkie odpowiedzi poprawne → ekran podsumowania z gratulacjami

---

### Widok 9: Tryb nauki (`/deck/[id]/study`)

**Główny cel**: Swobodne przeglądanie wszystkich fiszek w talii w formie odwracalnych kart - bez testu, tylko przeglądanie materiału.

**Kluczowe informacje do wyświetlenia**:
- Główna karta fiszki:
  - Strona przednia: pytanie (duży tekst)
  - Strona tylna: odpowiedź (duży tekst)
  - Animacja flip przy odwróceniu
- Nawigacja:
  - Przyciski: "Poprzednia", "Następna"
  - Gesty swipe (na urządzeniach dotykowych)
  - Sidebar z listą wszystkich fiszek w talii (opcjonalnie, można ukryć)
- Wskaźnik pozycji: "X / Y" (np. "5 / 20")
- Filtr statusu: "Wszystkie" / "W trakcie nauki" / "Opanowane"
- Przycisk "Pokaż odpowiedź" (alternatywa dla kliknięcia na kartę)

**Kluczowe komponenty widoku**:
- `StudyMode` - główny komponent trybu nauki (React)
- `FlashcardFlip` - karta z animacją flip
- `Button` (Shadcn/ui) - przyciski nawigacji
- `Sidebar` (Shadcn/ui) - lista wszystkich fiszek (opcjonalnie)
- `Select` (Shadcn/ui) - filtr statusu

**UX, dostępność i bezpieczeństwo**:
- **UX**: Płynna animacja flip przy odwróceniu karty. Intuicyjne gesty swipe na mobile. Sidebar z możliwością szybkiego przejścia do konkretnej fiszki. Wskaźnik pozycji pokazujący postęp. Możliwość ukrycia/pokazania sidebara.
- **Dostępność**: Pełna obsługa klawiaturą (strzałki lewo/prawo dla nawigacji, Enter/Space dla odwrócenia karty). aria-labels dla przycisków nawigacji. Karta z właściwymi rolami ARIA. Sidebar z właściwą strukturą nawigacji.
- **Bezpieczeństwo**: Wyświetlanie tylko fiszek z talii należącej do zalogowanego użytkownika. Filtrowanie po statusie po stronie klienta (opcjonalnie można dodać filtrowanie po stronie serwera).

**Przypadki brzegowe**:
- Brak fiszek w talii → komunikat: "Ta talia jest pusta. Dodaj fiszki lub wygeneruj je z tekstu."
- Ostatnia/pierwsza fiszka → przyciski "Poprzednia"/"Następna" nieaktywne (disabled)
- Błąd ładowania fiszek → toast z komunikatem błędu i przyciskiem "Spróbuj ponownie"

---

### Widok 10: Panel użytkownika / Ustawienia (`/settings`)

**Główny cel**: Zarządzanie kontem użytkownika, preferencjami i ustawieniami aplikacji.

**Kluczowe informacje do wyświetlenia**:
- Sekcja "Zmiana hasła":
  - Pole: stare hasło
  - Pole: nowe hasło
  - Pole: potwierdzenie nowego hasła
  - Przycisk "Zmień hasło"
- Sekcja "Preferencje użytkownika":
  - Pole tekstowe (max 1500 znaków) - język naturalny dla wymagań AI
  - Przycisk "Zapisz preferencje"
- Sekcja "Ustawienia aplikacji":
  - Przełącznik dark mode (jeśli dostępny w topbarze, tutaj jako backup)
  - Przełącznik paginacja/infinite scroll dla widoku weryfikacji
- Sekcja "Konto":
  - Przycisk "Usuń konto" (destrukcyjna akcja)
  - Modal potwierdzenia przed usunięciem

**Kluczowe komponenty widoku**:
- `SettingsView` - główny widok ustawień (React)
- `Input` (Shadcn/ui) - pola formularzy
- `Textarea` (Shadcn/ui) - pole preferencji użytkownika
- `Button` (Shadcn/ui) - przyciski akcji
- `Switch` (Shadcn/ui) - przełączniki
- `Dialog` (Shadcn/ui) - modal potwierdzenia usunięcia konta

**UX, dostępność i bezpieczeństwo**:
- **UX**: Podział na sekcje z wyraźnymi nagłówkami. Komunikaty sukcesu po zapisaniu zmian (toast). Potwierdzenie przed usunięciem konta (modal z wyraźnym ostrzeżeniem). Walidacja formularzy inline.
- **Dostępność**: Wszystkie sekcje z właściwymi nagłówkami (`<h2>`). Formularze z właściwymi etykietami i aria-describedby. Przełączniki z właściwymi aria-labels. Modal z focus trap.
- **Bezpieczeństwo**: Wymaganie starego hasła przy zmianie hasła. Walidacja siły nowego hasła. Potwierdzenie przed usunięciem konta (destrukcyjna akcja). Integracja z Supabase Auth API dla zmiany hasła i usunięcia konta.

**Przypadki brzegowe**:
- Nieprawidłowe stare hasło → komunikat błędu inline: "Nieprawidłowe stare hasło"
- Nowe hasło za słabe → komunikat błędu inline: "Hasło musi zawierać co najmniej 8 znaków, w tym litery i cyfry"
- Błąd zapisu preferencji → toast z komunikatem błędu i możliwością ponowienia
- Anulowanie usunięcia konta → zamknięcie modala, brak zmian

---

### Widok 11: Manualne tworzenie fiszki (Modal/Dialog)

**Główny cel**: Ręczne dodanie pojedynczej fiszki z możliwością generowania odpowiedzi przez AI.

**Kluczowe informacje do wyświetlenia**:
- Formularz z polami:
  - Pytanie (wymagane, 50-10000 znaków)
  - Poprawna odpowiedź (wymagane, max 500 znaków)
  - URL obrazka (opcjonalne, valid URL)
  - Checkbox: "Wygeneruj odpowiedź przez AI" (opcjonalne)
- Jeśli checkbox zaznaczony:
  - Przycisk "Generuj odpowiedź" (aktywny po wprowadzeniu pytania)
  - Skeleton (Shadcn/ui) podczas generowania odpowiedzi
  - Wygenerowana odpowiedź wstawiana do pola "Poprawna odpowiedź"
- Dropdown wyboru talii (istniejące + opcja "Utwórz nową talię")
- Pole nazwy nowej talii (jeśli wybrano "Utwórz nową")
- Przycisk "Zapisz"

**Kluczowe komponenty widoku**:
- `ManualFlashcardForm` - formularz manualnego tworzenia (React)
- `Dialog` (Shadcn/ui) - modal z formularzem
- `Input` (Shadcn/ui) - pola formularza
- `Checkbox` (Shadcn/ui) - checkbox generowania przez AI
- `Select` (Shadcn/ui) - dropdown wyboru talii
- `Skeleton` (Shadcn/ui) - wskaźnik ładowania podczas generowania odpowiedzi
- `Button` (Shadcn/ui) - przyciski akcji

**UX, dostępność i bezpieczeństwo**:
- **UX**: Modal z wyraźnym tytułem i zamknięciem. Walidacja w czasie rzeczywistym. Komunikaty błędów inline. Możliwość anulowania (przycisk "Anuluj" lub kliknięcie poza modalem).
- **Dostępność**: Modal z właściwym focus trap, aria-modal, aria-labelledby. Wszystkie pola z etykietami. Keyboard navigation (Tab, Escape do zamknięcia).
- **Bezpieczeństwo**: Walidacja po stronie klienta i serwera. Sprawdzenie, czy talia należy do użytkownika przed zapisaniem.

**Przypadki brzegowe**:
- Błąd generowania odpowiedzi przez AI → toast z komunikatem błędu, użytkownik może ręcznie wprowadzić odpowiedź
- Błąd zapisu fiszki → rollback, komunikat błędu inline
- Anulowanie → zamknięcie modala bez zapisywania zmian

---

### Widok 12: Widok "Opanowane" (filtr w talii)

**Główny cel**: Przeglądanie fiszek, które zostały opanowane (30 kolejnych poprawnych odpowiedzi).

**Kluczowe informacje do wyświetlenia**:
- Fiszki opanowane wyświetlane jako osobna talia (filtr `status='mastered'`)
- Layout taki sam jak zwykła talia, ale z wyróżnieniem statusu "Opanowane"
- Dla każdej fiszki opcjonalna akcja: "Przywróć do nauki" (resetuje postęp)

**Kluczowe komponenty widoku**:
- `MasteredFlashcardsView` - widok opanowanych fiszek (React)
- `FlashcardList` - lista fiszek (użycie tego samego komponentu co w widoku talii)
- `Button` (Shadcn/ui) - przycisk "Przywróć do nauki"

**UX, dostępność i bezpieczeństwo**:
- **UX**: Możliwość wyświetlenia jako osobna talia w dashboardzie lub jako filtr w widoku talii. Wyróżnienie wizualne statusu "Opanowane" (np. badge, inny kolor). Potwierdzenie przed przywróceniem do nauki (opcjonalnie).
- **Dostępność**: Właściwe etykiety dla statusu "Opanowane". Przycisk "Przywróć do nauki" z aria-label.
- **Bezpieczeństwo**: Wyświetlanie tylko opanowanych fiszek należących do zalogowanego użytkownika. Endpoint `restore-flashcard` do przywrócenia do nauki.

**Przypadki brzegowe**:
- Brak opanowanych fiszek → komunikat: "Nie masz jeszcze opanowanych fiszek"
- Błąd przywrócenia do nauki → toast z komunikatem błędu

## 3. Mapa podróży użytkownika

### Podróż 1: Nowy użytkownik - pierwsza rejestracja i generowanie fiszek

**Krok 1**: Użytkownik wchodzi na stronę główną → przekierowanie na `/login` (jeśli nie zalogowany)

**Krok 2**: Użytkownik klika "Zarejestruj się" → przejście na `/register`

**Krok 3**: Użytkownik wypełnia formularz rejestracji (email, hasło, potwierdzenie hasła) → walidacja → kliknięcie "Zarejestruj się"

**Krok 4**: Po pomyślnej rejestracji → automatyczne logowanie → **onboarding** (okienko wyboru "Czy chcesz zobaczyć przewodnik?")

**Krok 5**: Jeśli użytkownik wybierze onboarding → tooltips pojawiają się sekwencyjnie przy kluczowych elementach (przyciski, menu, formularze)

**Krok 6**: Po zakończeniu onboardingu → przekierowanie na **Dashboard** (`/`)

**Krok 7**: Dashboard wyświetla empty state → użytkownik klika "Generuj fiszki" → przejście na **Generator** (`/generate`)

**Krok 8**: Użytkownik wkleja tekst źródłowy → opcjonalnie rozszerza sekcję zaawansowaną i konfiguruje parametry → kliknięcie "Generuj"

**Krok 9**: Przejście na **Ekran ładowania** → progress bar, polling co 2-3 sekundy → po zakończeniu generowania automatyczne przejście na **Weryfikację** (`/verify/[session_id]`)

**Krok 10**: Użytkownik przegląda propozycje fiszek → może akceptować/edytować/odrzucać pojedynczo → wybiera talię z dropdown (lub tworzy nową) → kliknięcie "Zapisz zatwierdzone"

**Krok 11**: Po zapisaniu → toast z komunikatem sukcesu → przekierowanie na **Dashboard** → użytkownik widzi nową talię z liczbą fiszek

---

### Podróż 2: Powrót użytkownika - nauka z fiszek

**Krok 1**: Użytkownik loguje się na `/login` → po zalogowaniu przekierowanie na **Dashboard** (`/`)

**Krok 2**: Dashboard wyświetla listę talii z liczbą fiszek do powtórki → użytkownik wybiera talię z fiszkami do powtórki

**Krok 3**: Kliknięcie na kartę talii → przejście na **Lista fiszek** (`/deck/[id]`)

**Krok 4**: Użytkownik klika "Rozpocznij powtórkę" → przejście na **Tryb treningu** (`/deck/[id]/review`)

**Krok 5**: Sesja treningowa:
  - Wyświetlenie pierwszej fiszki do powtórki
  - Użytkownik czyta pytanie
  - Użytkownik wybiera jedną z 4 odpowiedzi (kliknięcie lub klawisz 1-4)
  - Natychmiastowa informacja zwrotna (zielony/czerwony)
  - Automatyczne przejście do następnej fiszki po 1-2 sekundach
  - Powtórzenie dla wszystkich fiszek do powtórki

**Krok 6**: Po zakończeniu sesji → **Ekran podsumowania** z wynikiem (np. "8/10 poprawnych") i listą błędnych odpowiedzi

**Krok 7**: Kliknięcie "Zakończ" → powrót na **Lista fiszek** (`/deck/[id]`)

**Krok 8**: Użytkownik może kontynuować naukę w **Trybie nauki** (`/deck/[id]/study`) → kliknięcie "Tryb nauki"

**Krok 9**: Swobodne przeglądanie fiszek → kliknięcie na kartę lub przycisk "Pokaż odpowiedź" → animacja flip → nawigacja między fiszkami (przyciski, gesty swipe)

**Krok 10**: Powrót na Dashboard (kliknięcie logo w topbarze lub "Moje talie")

---

### Podróż 3: Zarządzanie fiszkami - edycja i manualne tworzenie

**Krok 1**: Użytkownik na **Dashboard** → wybiera talię → przejście na **Lista fiszek** (`/deck/[id]`)

**Krok 2**: Użytkownik klika "Edytuj" przy fiszce → otwiera się **Modal edycji fiszki**

**Krok 3**: Użytkownik edytuje pytanie/odpowiedź/URL obrazka → walidacja inline → kliknięcie "Zapisz zmiany"

**Krok 4**: Po zapisaniu → modal zamyka się → toast z komunikatem sukcesu → lista fiszek odświeża się

**Krok 5**: Użytkownik klika "Dodaj fiszkę" → otwiera się **Modal manualnego tworzenia fiszki**

**Krok 6**: Użytkownik wprowadza pytanie → zaznacza checkbox "Wygeneruj odpowiedź przez AI" → kliknięcie "Generuj odpowiedź"

**Krok 7**: Po wygenerowaniu odpowiedzi przez AI → odpowiedź wstawiona do pola → użytkownik może edytować → wybiera talię → kliknięcie "Zapisz"

**Krok 8**: Po zapisaniu → modal zamyka się → toast z komunikatem sukcesu → lista fiszek odświeża się z nową fiszką

---

### Podróż 4: Zarządzanie kontem - zmiana ustawień

**Krok 1**: Użytkownik na **Dashboard** → kliknięcie "Ustawienia" w topbarze → przejście na **Ustawienia** (`/settings`)

**Krok 2**: Użytkownik wypełnia sekcję "Zmiana hasła" (stare hasło, nowe hasło, potwierdzenie) → walidacja inline → kliknięcie "Zmień hasło"

**Krok 3**: Po pomyślnej zmianie → toast z komunikatem sukcesu

**Krok 4**: Użytkownik wypełnia sekcję "Preferencje użytkownika" (max 1500 znaków, język naturalny) → kliknięcie "Zapisz preferencje"

**Krok 5**: Po zapisaniu → toast z komunikatem sukcesu

**Krok 6**: Użytkownik zmienia przełączniki w sekcji "Ustawienia aplikacji" (dark mode, paginacja/infinite scroll) → zmiany zapisują się automatycznie (lub po kliknięciu "Zapisz")

**Krok 7**: Powrót na Dashboard (kliknięcie logo w topbarze)

---

## 4. Układ i struktura nawigacji

### Główna nawigacja - Topbar

**Komponent**: Navigation Menu od Shadcn/ui w formie topbara (poziomy pasek na górze strony)

**Elementy nawigacji**:
1. **Logo/Home** - link do Dashboard (`/`) - zawsze widoczny po lewej stronie
2. **Moje talie** - link do Dashboard (`/`) - alternatywny sposób dostępu
3. **Generuj fiszki** - link do Generatora (`/generate`) - główna funkcjonalność aplikacji
4. **Opanowane** - link do widoku opanowanych fiszek (filtr w dashboardzie lub osobna sekcja)
5. **Ustawienia** - link do Panelu użytkownika (`/settings`)
6. **Wyloguj** - przycisk wylogowania (po prawej stronie, obok avataru użytkownika jeśli dostępny)

**Zachowanie**:
- Topbar zawsze widoczny na górze strony (sticky)
- Aktywna trasa wyróżniona wizualnie (np. podkreślenie, inny kolor)
- Na mobile: hamburger menu z drawer (opcjonalnie, jeśli topbar nie mieści się)
- Przełącznik dark mode w topbarze (opcjonalnie, lub tylko w ustawieniach)

### Breadcrumbs

**Komponent**: Breadcrumb od Shadcn/ui

**Użycie**: Dla głębszych poziomów nawigacji (poza dashboardem)

**Przykłady**:
- Dashboard > Talia "Biologia" > Tryb treningu
- Dashboard > Talia "Biologia" > Tryb nauki
- Dashboard > Generator > Weryfikacja

**Zachowanie**:
- Każdy element breadcrumb jest klikalny (link do odpowiedniego widoku)
- Ostatni element (bieżący widok) nie jest klikalny i wyróżniony wizualnie
- Breadcrumbs widoczne pod topbarem

### Nawigacja kontekstowa

**W widoku talii** (`/deck/[id]`):
- Przyciski akcji: "Rozpocznij powtórkę", "Tryb nauki", "Dodaj fiszkę", "Edytuj talię", "Usuń talię"
- Breadcrumbs: Dashboard > [Nazwa talii]

**W trybie treningu** (`/deck/[id]/review`):
- Przycisk "Przerwij" w rogu (opcjonalnie)
- Breadcrumbs: Dashboard > Talia "[Nazwa]" > Tryb treningu

**W trybie nauki** (`/deck/[id]/study`):
- Przyciski nawigacji: "Poprzednia", "Następna"
- Sidebar z listą wszystkich fiszek (opcjonalnie, można ukryć)
- Breadcrumbs: Dashboard > Talia "[Nazwa]" > Tryb nauki

### Nawigacja między widokami - przepływy

**Przepływ generowania**:
Dashboard → Generator → (Ekran ładowania) → Weryfikacja → Dashboard

**Przepływ nauki (trening)**:
Dashboard → Lista fiszek → Tryb treningu → Podsumowanie → Lista fiszek → Dashboard

**Przepływ nauki (swobodny)**:
Dashboard → Lista fiszek → Tryb nauki → Lista fiszek → Dashboard

**Nawigacja bezpośrednia**:
- Z każdego widoku można wrócić na Dashboard (logo w topbarze)
- Z trybu treningu/nauki można wrócić do listy fiszek (breadcrumbs lub przycisk "Wróć")
- Z weryfikacji można wrócić do generatora (przycisk "Wróć do generatora")

## 5. Kluczowe komponenty

### Komponenty layoutu

**Topbar** (`Topbar`)
- Navigation Menu od Shadcn/ui w formie poziomego paska
- Zawiera: Logo, linki nawigacyjne, przełącznik dark mode (opcjonalnie), przycisk wylogowania
- Sticky na górze strony
- Responsywny: na mobile może przekształcić się w hamburger menu

**Breadcrumb** (`Breadcrumb`)
- Breadcrumb od Shadcn/ui
- Używany dla głębszych poziomów nawigacji
- Każdy element klikalny (oprócz ostatniego)

### Komponenty formularzy

**GeneratorForm** (`GeneratorForm`)
- Główny formularz generowania fiszek
- Zawiera: textarea dla tekstu źródłowego, accordion z sekcją zaawansowaną
- Walidacja inline przed wysłaniem
- Integracja z `/api/generations` (polling dla statusu)

**LoginForm** (`LoginForm`)
- Formularz logowania
- Pola: email, hasło
- Integracja z Supabase Auth API
- Przekierowanie po zalogowaniu

**RegisterForm** (`RegisterForm`)
- Formularz rejestracji
- Pola: email, hasło, potwierdzenie hasła
- Walidacja siły hasła i zgodności haseł
- Integracja z Supabase Auth API
- Przekierowanie po rejestracji na onboarding → dashboard

**ManualFlashcardForm** (`ManualFlashcardForm`)
- Formularz manualnego tworzenia fiszki
- Pola: pytanie, odpowiedź, URL obrazka
- Checkbox "Wygeneruj odpowiedź przez AI"
- Integracja z AI dla generowania odpowiedzi (opcjonalnie)

### Komponenty fiszek

**FlashcardCard** (`FlashcardCard`)
- Karta fiszki w liście
- Wyświetla: pytanie (skrócony tekst), status (badge), przyciski akcji
- Używana w: Lista fiszek, Dashboard (dla opanowanych)

**FlashcardProposalCard** (`FlashcardProposalCard`)
- Karta propozycji fiszki w widoku weryfikacji
- Wyświetla: pytanie, odpowiedź, domena, checkbox akceptacji, przyciski akcji
- Używana w: Weryfikacja propozycji

**FlashcardModal** (`FlashcardModal`)
- Modal edycji fiszki
- Formularz z polami: pytanie, odpowiedź, URL obrazka
- Walidacja przed zapisaniem
- Zapis po potwierdzeniu (bez real-time)

**FlashcardFlip** (`FlashcardFlip`)
- Karta z animacją flip dla trybu nauki
- Strona przednia: pytanie
- Strona tylna: odpowiedź
- Animacja CSS flip przy kliknięciu

### Komponenty sesji nauki

**TrainingSession** (`TrainingSession`)
- Główny komponent trybu treningu (spaced repetition)
- Wyświetla: pasek postępu, pytanie, 4 przyciski odpowiedzi
- Obsługuje: natychmiastową informację zwrotną, automatyczne przejście
- Integracja z `update-flashcard-progress`

**StudyMode** (`StudyMode`)
- Główny komponent trybu nauki (swobodne przeglądanie)
- Wyświetla: kartę z animacją flip, nawigację, sidebar z listą fiszek
- Obsługuje: gesty swipe, nawigację klawiaturą

**SummaryScreen** (`SummaryScreen`)
- Ekran podsumowania sesji treningowej
- Wyświetla: wynik (X/Y poprawnych), listę błędnych odpowiedzi
- Przycisk "Zakończ" powracający do listy fiszek

### Komponenty talii

**DeckCard** (`DeckCard`)
- Karta talii na dashboardzie
- Wyświetla: nazwa talii, liczba fiszek do powtórki (wyróżniona), całkowita liczba fiszek
- Przyciski akcji: "Rozpocznij powtórkę", "Tryb nauki", menu kontekstowe

**DeckView** (`DeckView`)
- Główny widok talii (lista fiszek)
- Wyświetla: informacje o talii, lista fiszek, filtry, przyciski akcji
- Integracja z REST API dla CRUD operacji

### Komponenty pomocnicze

**EmptyState** (`EmptyState`)
- Ekran powitalny dla pustych stanów
- Używany w: Dashboard (brak talii), Lista fiszek (pusta talia)
- Zawiera: komunikat, CTA (przyciski akcji)

**OnboardingTooltip** (`OnboardingTooltip`)
- Tooltip dla onboardingu
- Pojawia się sekwencyjnie przy kluczowych elementach
- Zawiera: komunikat, przycisk "Dalej", opcja "Pomiń"

**SearchBar** (`SearchBar`)
- Wyszukiwarka talii na dashboardzie
- Filtrowanie w czasie rzeczywistym
- Wyświetla wyniki wyszukiwania

### Komponenty Shadcn/ui (używane w wielu widokach)

- **Button** - przyciski akcji
- **Card** - karty (talie, fiszki)
- **Input** - pola tekstowe
- **Textarea** - duże pola tekstowe
- **Select** - dropdown menu
- **Checkbox** - checkboxy
- **Dialog** - modale i dialogi
- **Alert** - komunikaty błędów
- **Toast** - toast notifications
- **Progress** - pasek postępu
- **Skeleton** - skeleton loaders (placeholdery podczas ładowania danych)
- **Accordion** - sekcje zwijane
- **Breadcrumb** - breadcrumbs nawigacji
- **NavigationMenu** - główna nawigacja (topbar)
- **Sidebar** - sidebar z listą (opcjonalnie)

---

## 6. Mapowanie historyjek użytkownika do widoków

### Uwierzytelnianie i Zarządzanie Kontem

**US-001: Rejestracja nowego użytkownika** → Widok 2: Ekran autoryzacji - Rejestracja (`/register`)
- Formularz z polami email, hasło, potwierdzenie hasła
- Walidacja formatu email i zgodności haseł
- Po rejestracji → onboarding → dashboard

**US-002: Logowanie do aplikacji** → Widok 1: Ekran autoryzacji - Logowanie (`/login`)
- Formularz z polami email i hasło
- Przekierowanie na dashboard po zalogowaniu
- Komunikaty błędów dla nieprawidłowych danych

**US-003: Wylogowanie z aplikacji** → Topbar (przycisk "Wyloguj")
- Przycisk wylogowania w topbarze
- Po wylogowaniu → przekierowanie na stronę główną

**US-004: Zmiana hasła** → Widok 10: Panel użytkownika / Ustawienia (`/settings`)
- Sekcja "Zmiana hasła" z polami: stare hasło, nowe hasło, potwierdzenie
- Komunikat sukcesu po zmianie

**US-005: Usunięcie konta** → Widok 10: Panel użytkownika / Ustawienia (`/settings`)
- Sekcja "Konto" z przyciskiem "Usuń konto"
- Modal potwierdzenia przed usunięciem

### Zarządzanie Taliami i Fiszkami

**US-006: Widok pulpitu z taliami** → Widok 3: Dashboard (`/`)
- Siatka kart talii
- Każda karta pokazuje nazwę i liczbę fiszek do powtórki
- Empty state dla braku talii

**US-007: Usuwanie talii lub wybranych fiszek** → Widok 7: Lista fiszek w talii (`/deck/[id]`)
- Opcja usunięcia przy każdej talii (menu kontekstowe)
- Opcja usunięcia przy każdej fiszce
- Modal potwierdzenia przed usunięciem

**US-008: Inicjowanie generowania fiszek** → Widok 4: Generator fiszek (`/generate`)
- Przycisk "Generuj fiszki" na dashboardzie
- Duże pole tekstowe na wklejenie materiału
- Przycisk "Generuj" rozpoczynający proces

**US-009: Proces weryfikacji fiszek** → Widok 6: Weryfikacja propozycji (`/verify/[session_id]`)
- Lista wygenerowanych fiszek (pytanie i odpowiedź)
- Przyciski "Akceptuj" i "Odrzuć" przy każdej fiszce
- Domyślnie wszystkie zaznaczone jako zaakceptowane
- Możliwość zapisania tylko zaakceptowanych

**US-010: Korekta dziedziny wiedzy** → Widok 6: Weryfikacja propozycji (`/verify/[session_id]`)
- Informacja "Wykryta dziedzina: [nazwa]" na górze widoku
- Przycisk "Zmień" otwierający dropdown/pole do edycji

**US-011: Regeneracja błędnych odpowiedzi** → Widok 6: Weryfikacja propozycji (`/verify/[session_id]`)
- Przycisk "Regeneruj" na karcie propozycji
- Generowanie nowej wersji propozycji przez AI

**US-012: Zapisywanie fiszek do talii** → Widok 6: Weryfikacja propozycji (`/verify/[session_id]`)
- Dropdown wyboru talii (istniejące + opcja utworzenia nowej)
- Pole nazwy nowej talii (jeśli wybrano "Utwórz nową")
- Przyciski "Zapisz wszystkie" lub "Zapisz zatwierdzone"
- Przekierowanie do widoku talii po zapisaniu

**US-013: Manualne tworzenie fiszki** → Widok 11: Manualne tworzenie fiszki (Modal)
- Formularz z polami: pytanie, poprawna odpowiedź, URL obrazka
- Checkbox "Wygeneruj odpowiedź przez AI"
- Przycisk generowania 3 błędnych odpowiedzi (jeśli checkbox zaznaczony)
- Zapis do wybranej talii

### Proces Nauki

**US-014: Rozpoczęcie sesji treningowej** → Widok 8: Tryb treningu (`/deck/[id]/review`)
- Przycisk "Rozpocznij powtórkę" w widoku talii
- Sesja prezentująca tylko fiszki do powtórki (due_date <= now())
- Komunikat jeśli brak fiszek do powtórki

**US-015: Odpowiadanie na pytanie w teście** → Widok 8: Tryb treningu (`/deck/[id]/review`)
- Interfejs z pytaniem i 4 odpowiedziami
- Losowa kolejność odpowiedzi
- Natychmiastowa informacja zwrotna po wyborze

**US-016: Zakończenie i podsumowanie sesji treningowej** → Widok 8: Tryb treningu (`/deck/[id]/review`) - SummaryScreen
- Ekran podsumowania po zakończeniu sesji
- Wynik (X/Y poprawnych)
- Lista pytań z błędnymi odpowiedziami

**US-017: Korzystanie z trybu nauki** → Widok 9: Tryb nauki (`/deck/[id]/study`)
- Przycisk "Tryb nauki" w widoku talii
- Fiszka z widocznym pytaniem
- Kliknięcie odsłania odpowiedź (animacja flip)
- Przyciski/gesty do nawigacji

**US-018: Zarządzanie "Opanowanymi" fiszkami** → Widok 12: Widok "Opanowane" (filtr)
- Dedykowany widok/filtr dla opanowanych fiszek
- Fiszki pogrupowane według talii
- Opcja "Przywróć do nauki" przy każdej fiszce

---

## 7. Rozwiązanie punktów bólu użytkownika

### Problem 1: Czasochłonne tworzenie fiszek
**Rozwiązanie w UI**:
- Generator z dużym polem tekstowym umożliwiającym szybkie wklejenie materiału
- Sekcja zaawansowana zwinięta domyślnie (nie przytłacza użytkownika)
- Możliwość szybkiej akceptacji wszystkich propozycji ("Zapisz wszystkie")
- Bulk operations (akceptacja/odrzucenie wielu propozycji jednocześnie)

### Problem 2: Trudność w weryfikacji wielu propozycji
**Rozwiązanie w UI**:
- Układ kart z wyraźnym podziałem wizualnym
- Domyślnie wszystkie propozycje zaznaczone jako zaakceptowane
- Licznik pokazujący postęp weryfikacji
- Możliwość wyboru paginacji lub infinite scroll (preferencje użytkownika)
- Przyciski "Akceptuj wszystkie" / "Odrzuć wszystkie" dla szybkiej akcji

### Problem 3: Brak motywacji do regularnej nauki
**Rozwiązanie w UI**:
- Dashboard z wyróżnioną liczbą fiszek do powtórki (wizualny wskaźnik postępu)
- Pasek postępu w trybie treningu pokazujący postęp sesji
- Ekran podsumowania z wynikiem i listą błędnych odpowiedzi (feedback)
- Wskaźnik pozycji w trybie nauki (np. "5/20")

### Problem 4: Trudność w zarządzaniu dużą liczbą fiszek
**Rozwiązanie w UI**:
- Organizacja w talie (logiczne grupowanie)
- Wyszukiwarka talii na dashboardzie
- Filtrowanie fiszek po statusie (wszystkie/learning/mastered)
- Sidebar z listą wszystkich fiszek w trybie nauki (szybka nawigacja)

### Problem 5: Brak kontroli nad generowanymi fiszkami
**Rozwiązanie w UI**:
- Widok weryfikacji przed zapisaniem (użytkownik widzi wszystkie propozycje)
- Możliwość edycji każdej propozycji przed zapisaniem
- Możliwość regeneracji propozycji, które nie podobają się użytkownikowi
- Możliwość korekty wykrytej domeny wiedzy

---

## 8. Zgodność z planem API

### Mapowanie endpointów do widoków

**Generowanie fiszek**:
- Widok 4 (Generator) → `POST /api/generations` → `POST /functions/v1/generate-flashcards`
- Widok 5 (Ekran ładowania) → Polling statusu generowania
- Widok 6 (Weryfikacja) → `GET /rest/v1/flashcard_proposals?generation_session_id=eq.{session_id}`

**Zarządzanie propozycjami**:
- Widok 6 (Weryfikacja) → `POST /functions/v1/accept-proposal` (pojedyncza)
- Widok 6 (Weryfikacja) → `POST /functions/v1/accept-proposals` (bulk)
- Widok 6 (Weryfikacja) → `POST /functions/v1/accept-proposals-by-session` (cała sesja)
- Widok 6 (Weryfikacja) → `POST /functions/v1/reject-proposal` (pojedyncza)

**Zarządzanie taliami**:
- Widok 3 (Dashboard) → `GET /rest/v1/decks?user_id=eq.{user_id}`
- Widok 3 (Dashboard) → `POST /rest/v1/decks` (tworzenie nowej talii)
- Widok 7 (Lista fiszek) → `GET /rest/v1/flashcards?deck_id=eq.{deck_id}`
- Widok 7 (Lista fiszek) → `DELETE /rest/v1/decks?id=eq.{deck_id}` (usunięcie talii)

**Zarządzanie fiszkami**:
- Widok 7 (Lista fiszek) → `PATCH /rest/v1/flashcards?id=eq.{flashcard_id}` (edycja)
- Widok 7 (Lista fiszek) → `DELETE /rest/v1/flashcards?id=eq.{flashcard_id}` (usunięcie)
- Widok 11 (Manualne tworzenie) → `POST /rest/v1/flashcards` (tworzenie)

**Spaced Repetition**:
- Widok 8 (Tryb treningu) → `GET /rest/v1/flashcards?deck_id=eq.{deck_id}&due_date=lte.{now()}&status=eq.learning`
- Widok 8 (Tryb treningu) → `POST /functions/v1/update-flashcard-progress` (po każdej odpowiedzi)
- Widok 8 (Tryb treningu) → `POST /functions/v1/process-quiz-session` (bulk po sesji)

**Zarządzanie kontem**:
- Widok 10 (Ustawienia) → `PUT /auth/v1/user` (zmiana hasła)
- Widok 10 (Ustawienia) → `PATCH /rest/v1/profiles?id=eq.{user_id}` (preferencje użytkownika)

**Opanowane fiszki**:
- Widok 12 (Opanowane) → `GET /rest/v1/flashcards?status=eq.mastered&deck_id=eq.{deck_id}`
- Widok 12 (Opanowane) → `POST /functions/v1/restore-flashcard` (przywrócenie do nauki)

---

## 9. Przypadki brzegowe i stany błędów

### Stany ładowania
- **Skeleton (Shadcn/ui)**: Dla list talii, list fiszek podczas ładowania danych - placeholder pokazujący strukturę zawartości
- **Spinner (Shadcn/ui)**: Dla przycisków podczas wykonywania akcji (zapis, generowanie)
- **Progress (Shadcn/ui)**: Dla długotrwałych operacji (generowanie fiszek) - pasek postępu z procentami

### Stany błędów
- **Błędy walidacji**: Wyświetlanie inline pod odpowiednimi polami formularzy
- **Błędy API (400, 404)**: Toast notifications z komunikatem błędu
- **Błędy autoryzacji (401)**: Przekierowanie na `/login?redirect=/target-path`
- **Błędy serwera (500)**: Toast notification z komunikatem błędu i możliwością ponowienia
- **Brak połączenia**: Toast notification z komunikatem i możliwością ponowienia

### Puste stany
- **Brak talii**: Empty state na dashboardzie z CTA
- **Pusta talia**: Empty state w widoku talii z CTA
- **Brak propozycji**: Komunikat w widoku weryfikacji
- **Brak fiszek do powtórki**: Komunikat w trybie treningu

### Stany sukcesu
- **Toast notifications**: Dla operacji zapisu, akceptacji, odrzucenia
- **Komunikaty sukcesu**: Po zapisaniu fiszek, zmianie hasła, zapisaniu preferencji

---

## 10. Dostępność i bezpieczeństwo - szczegóły implementacyjne

### Dostępność (WCAG AA)

**Semantyczny HTML**:
- Użycie właściwych elementów HTML5 (`<main>`, `<section>`, `<article>`, `<nav>`, `<header>`)
- Właściwe nagłówki hierarchiczne (`<h1>`, `<h2>`, etc.)
- Listy jako `<ul>` / `<ol>` z `<li>`

**ARIA**:
- `aria-labels` dla przycisków bez widocznego tekstu
- `aria-describedby` dla komunikatów błędów i tooltipów
- `aria-live` regions dla dynamicznych aktualizacji (postęp, komunikaty)
- `aria-expanded` dla accordionów i rozwijanych menu
- `aria-modal` dla modali
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` dla progress bars

**Keyboard Navigation**:
- Pełna obsługa nawigacji klawiaturą (Tab, Shift+Tab, Enter, Space, Escape, strzałki)
- Logical tab order
- Focus trap w modalach
- Widoczne focus states (outline)

**Screen Readers**:
- Właściwe etykiety dla wszystkich interaktywnych elementów
- Opisy dla złożonych komponentów
- Komunikaty statusu dostępne dla screen readerów

**Kontrast**:
- Minimalny kontrast 4.5:1 dla tekstu (WCAG AA)
- Minimalny kontrast 3:1 dla dużego tekstu (18pt+)
- Właściwe kontrasty dla przycisków i linków

### Bezpieczeństwo

**Autoryzacja**:
- Middleware w Astro sprawdzający sesję przed renderowaniem chronionych stron
- Supabase client sprawdzający stan autoryzacji w komponentach React
- Przekierowanie nieautoryzowanych użytkowników na `/login?redirect=/target-path`

**Walidacja**:
- Walidacja po stronie klienta (szybka odpowiedź dla użytkownika)
- Walidacja po stronie serwera (zabezpieczenie przed manipulacją)
- Sanityzacja danych przed wysłaniem do API

**Ochrona danych**:
- Row Level Security (RLS) w Supabase zapewnia izolację danych
- Wyświetlanie tylko danych należących do zalogowanego użytkownika
- Tokeny JWT w nagłówku `Authorization: Bearer {token}`

**Destrukcyjne akcje**:
- Potwierdzenie przed usunięciem talii/fiszki/konta (modal dialog)
- Możliwość anulowania długotrwałych operacji (generowanie fiszek)

---

## 11. Responsywność

### Desktop-first (zgodnie z PRD)
- Aplikacja zaprojektowana z myślą o desktop
- Optymalne doświadczenie na ekranach 1024px+

### Adaptacja mobile
- **Topbar**: Hamburger menu z drawer (jeśli topbar nie mieści się)
- **Grid layout**: Przekształcenie w listę na mniejszych ekranach
- **Sidebar**: Ukryty domyślnie, dostępny przez przycisk toggle
- **Gesty**: Swipe w trybie nauki na urządzeniach dotykowych

### Breakpoints Tailwind CSS
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+

---

## 12. Integracja z API - szczegóły

### Request/Response Patterns

**Generowanie fiszek**:
```
POST /api/generations
Request: { source_text, domain?, language?, question_min_length?, question_max_length?, answer_max_length?, user_preferences? }
Response: { generation_session_id, proposals[], detected_domain, total_generated }
```

**Akceptacja propozycji**:
```
POST /functions/v1/accept-proposals-by-session
Request: { generation_session_id, deck_id }
Response: { generation_session_id, accepted_count, flashcard_ids[], deck_id, message }
```

**Aktualizacja postępu nauki**:
```
POST /functions/v1/update-flashcard-progress
Request: { flashcard_id, is_correct }
Response: { flashcard_id, is_correct, updated_interval, consecutive_correct_answers, new_due_date, status, message }
```

### Error Handling Patterns

**400 Bad Request** (błędy walidacji):
- Wyświetlanie inline pod odpowiednimi polami formularzy
- Komunikaty błędów w języku użytkownika

**401 Unauthorized**:
- Przekierowanie na `/login?redirect=/target-path`
- Toast notification: "Sesja wygasła. Zaloguj się ponownie."

**404 Not Found**:
- Toast notification: "Nie znaleziono zasobu."
- Przekierowanie na dashboard (jeśli dotyczy)

**500 Internal Server Error**:
- Toast notification: "Wystąpił błąd serwera. Spróbuj ponownie."
- Przycisk "Spróbuj ponownie" (jeśli dotyczy)

---

## 13. Zarządzanie stanem - szczegóły

### React Hooks i Context (początkowo)
- `useState` dla lokalnego stanu komponentów
- `useEffect` dla side effects (pobieranie danych, subskrypcje)
- `React Context` dla stanu globalnego (np. preferencje użytkownika, dark mode)

### React Query (TanStack Query)
- **Queries** dla danych:
  - `useQuery` dla talii, fiszek, propozycji
  - Cache'owanie danych
  - Automatyczne odświeżanie
- **Mutations** dla operacji:
  - `useMutation` dla akceptacji, odrzucenia, edycji, usuwania
  - Optimistic updates dla natychmiastowej odpowiedzi UI
  - Rollback w przypadku błędu

### Zustand (później, jeśli potrzeba)
- Dla bardziej złożonego stanu globalnego
- Stan preferencji użytkownika, ustawień aplikacji
- Stan onboardingu (czy użytkownik widział onboarding)

---

## 14. Onboarding - szczegóły implementacyjne

### Mechanizm
1. **Dialog wyboru**: Przed wyświetleniem tooltipów użytkownik widzi okienko z pytaniem "Czy chcesz zobaczyć przewodnik?" i opcją "Nie pokazuj więcej"
2. **Sekwencyjne tooltips**: Jeśli użytkownik nie zaznaczy "Nie pokazuj więcej", tooltips pojawiają się sekwencyjnie przy kluczowych elementach:
   - Tooltip 1: Przycisk "Generuj fiszki" na dashboardzie
   - Tooltip 2: Generator - pole tekstowe
   - Tooltip 3: Weryfikacja - checkbox akceptacji
   - Tooltip 4: Tryb treningu - przyciski odpowiedzi
   - Tooltip 5: Ustawienia - preferencje użytkownika
3. **Kontrola użytkownika**: Przy każdym tooltipie przycisk "Dalej" i "Pomiń" (pomija pozostałe tooltipsy)

### Przechowywanie stanu
- Flaga w localStorage lub bazie danych: `onboarding_completed: boolean`
- Jeśli `true` → nie pokazywać onboardingu ponownie

---

## 15. Dark Mode - szczegóły implementacyjne

### Mechanizm
- Użycie Tailwind CSS `dark:` variant dla stylów w trybie ciemnym
- Przełącznik w topbarze (lub w ustawieniach)
- Przechowywanie preferencji w localStorage lub bazie danych
- Automatyczne wykrywanie preferencji systemowych (opcjonalnie)

### Implementacja
- Klasa `dark` na elemencie `<html>` lub wrapperze
- Wszystkie komponenty Shadcn/ui wspierają dark mode out-of-the-box
- Własne komponenty z użyciem `dark:` variant w Tailwind

---

## 16. Podsumowanie architektury

Architektura UI dla 10xCards została zaprojektowana wokół trzech głównych przepływów użytkownika: generowania fiszek, nauki w trybie treningu i nauki w trybie swobodnym. Aplikacja składa się z 12 widoków (w tym modali), które obsługują pełny cykl życia użytkownika od rejestracji po naukę.

Kluczowe decyzje architektoniczne:
- **Hybrydowe podejście**: Astro MPA + React SPA dla optymalnej wydajności i interaktywności
- **Topbar nawigacja**: Navigation Menu od Shadcn/ui zamiast sidebar dla lepszego wykorzystania przestrzeni
- **Optimistic updates**: Natychmiastowa odpowiedź UI z rollback w przypadku błędu
- **Inline walidacja**: Błędy wyświetlane bezpośrednio pod polami formularzy
- **Toast notifications**: Dla mniej krytycznych błędów i komunikatów sukcesu
- **WCAG AA**: Wszystkie komponenty i funkcjonalności spełniają standard dostępności

Architektura jest w pełni zgodna z planem API, mapuje wszystkie historyjki użytkownika z PRD i rozwiązuje kluczowe punkty bólu użytkownika związane z czasochłonnym tworzeniem fiszek i brakiem motywacji do regularnej nauki.

